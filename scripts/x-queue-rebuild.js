/* X 게시 큐 재배치 (B-5)
 *   node scripts/x-queue-rebuild.js
 * social/x/<slug>/post.json 전체를 모아 내일부터 하루 최대 5편·슬롯 분산·A/B 3일 간격·같은 시리즈 연속 회피로 queue.csv 재작성.
 * 평일 07:30/12:10/15:30/18:30/21:00, 주말 09:00/12:10/15:30/18:30/21:00 (하루 5편).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SOCIAL = path.join(ROOT, "social", "x");

const SLOTS_WD = ["07:30", "12:10", "15:30", "18:30", "21:00"]; // 평일 5편/일
const SLOTS_WE = ["09:00", "12:10", "15:30", "18:30", "21:00"]; // 주말 5편/일
function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function slotsFor(d) { const wd = d.getDay(); return (wd === 0 || wd === 6) ? SLOTS_WE : SLOTS_WD; }

/* 내일부터 슬롯 타임라인 생성 */
function timeline(n) {
  const out = []; const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0, 0, 0, 0);
  let guard = 0;
  while (out.length < n && guard < 400) {
    for (const t of slotsFor(d)) out.push({ date: ymd(d), time: t, dow: d.getDay() });
    d.setDate(d.getDate() + 1); guard++;
  }
  return out;
}

function loadPosts() {
  if (!fs.existsSync(SOCIAL)) return [];
  return fs.readdirSync(SOCIAL).filter(s => {
    try { return fs.statSync(path.join(SOCIAL, s)).isDirectory() && fs.existsSync(path.join(SOCIAL, s, "post.json")); }
    catch (e) { return false; }
  }).map(slug => {
    const p = JSON.parse(fs.readFileSync(path.join(SOCIAL, slug, "post.json"), "utf8"));
    return { slug, series: p.series || "info" };
  });
}

/* 같은 시리즈가 연속되지 않도록 라운드로빈 정렬 */
function interleave(items) {
  const bySeries = {};
  items.forEach(it => { (bySeries[it.series] = bySeries[it.series] || []).push(it); });
  const keys = Object.keys(bySeries);
  const out = []; let moved = true;
  while (moved) {
    moved = false;
    for (const k of keys) { if (bySeries[k].length) { out.push(bySeries[k].shift()); moved = true; } }
  }
  return out;
}

/* 기존 queue.csv 의 status=sent 행은 보존(재배치 금지) */
function loadSent() {
  const qf = path.join(SOCIAL, "queue.csv");
  if (!fs.existsSync(qf)) return [];
  return fs.readFileSync(qf, "utf8").trim().split("\n").slice(1).filter(Boolean).map(l => {
    const [date, time, slug, variant, image, status] = l.split(",");
    return { date, time, slug, variant, image, status };
  }).filter(r => r.status === "sent");
}

function rebuild() {
  const posts = interleave(loadPosts());
  if (!posts.length) { console.log("post.json 없음"); return; }
  const sent = loadSent();
  const sentKey = new Set(sent.map(r => r.slug + "/" + r.variant));
  // 각 글 A/B 2개 → 총 포스트 수
  const tl = timeline(posts.length * 2 + 10);
  const rows = []; // {date,time,slug,variant,status?}
  const perDay = {}; const cap = d => (slotsFor(new Date(d + "T00:00:00")).length);
  // sent 행을 먼저 고정 배치(슬롯 점유)
  sent.forEach(r => { rows.push({ date: r.date, time: r.time, slug: r.slug, variant: r.variant, status: "sent" }); perDay[r.date] = (perDay[r.date] || 0) + 1; });
  let ti = 0;
  function place(slug, variant, minDate) {
    for (let i = ti; i < tl.length; i++) {
      const s = tl[i];
      if (minDate && s.date < minDate) continue;
      const used = perDay[s.date] || 0;
      // 이미 그 슬롯이 찼는지
      if (rows.find(r => r.date === s.date && r.time === s.time)) continue;
      if (used >= cap(s.date)) continue;
      // 같은 날 같은 시리즈 연속 회피(간단히: 같은 날 같은 slug 금지)
      if (rows.find(r => r.date === s.date && r.slug === slug)) continue;
      perDay[s.date] = used + 1;
      rows.push({ date: s.date, time: s.time, slug, variant });
      return s.date;
    }
    return null;
  }
  // A 패스 (sent 는 건너뛰되 날짜는 기준으로 사용)
  const adate = {};
  posts.forEach(p => {
    if (sentKey.has(p.slug + "/a")) { const s = sent.find(r => r.slug === p.slug && r.variant === "a"); adate[p.slug] = s ? s.date : null; return; }
    adate[p.slug] = place(p.slug, "a", null);
  });
  // B 패스: A+3일 이후 (sent 는 건너뜀)
  posts.forEach(p => {
    if (sentKey.has(p.slug + "/b")) return;
    const base = adate[p.slug];
    let min = null;
    if (base) { const d = new Date(base + "T00:00:00"); d.setDate(d.getDate() + 3); min = ymd(d); }
    place(p.slug, "b", min);
  });
  rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  let csv = "date,time_jst,slug,variant,image,status\n";
  for (const r of rows) csv += [r.date, r.time, r.slug, r.variant, "social/x/" + r.slug + "/card.png", r.status || "pending"].join(",") + "\n";
  fs.writeFileSync(path.join(SOCIAL, "queue.csv"), csv);
  const days = [...new Set(rows.map(r => r.date))];
  console.log("큐 재작성: " + rows.length + "건 · " + days.length + "일 (" + days[0] + " ~ " + days[days.length - 1] + ")");
}
rebuild();
