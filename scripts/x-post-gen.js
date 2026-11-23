/* X(트위터) 게시물 자동 생성기 (PART B)
 *   node scripts/x-post-gen.js <slug> [--no-x]
 * 일본어 글 1편(/ja/posts/<slug>.html) → 체크리스트 이미지 + A/B 게시문 + 큐/오늘 목록.
 * 본문에 없는 정보를 지어내지 않는다(추출·요약만).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./lib/hook-copy");
const { renderCards } = require("./x-card-render");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://healthfortune.co.kr";
const SOCIAL = path.join(ROOT, "social", "x");

const HASHTAGS = {
  season: ["#健康", "#冬の健康"], kbeauty: ["#韓国コスメ", "#インナーケア"],
  travel: ["#韓国旅行", "#健康"], korea: ["#韓国", "#健康習慣"],
  check: ["#セルフチェック", "#健康"], food: ["#健康", "#食事"],
  info: ["#健康", "#健康情報"], disease: ["#健康", "#体調管理"],
  diet: ["#ダイエット", "#健康"], exercise: ["#運動", "#健康"], default: ["#健康"],
};

function stripTags(s) { return String(s || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim(); }
function clip(s, n) {
  const a = Array.from(String(s || ""));
  if (a.length <= n) return s;
  const head = a.slice(0, n).join("");
  // 자연스러운 경계(괄호·구두점)에서 자르면 … 없이 깔끔하게
  const bnd = Math.max(head.lastIndexOf("（"), head.lastIndexOf("、"), head.lastIndexOf("・"), head.lastIndexOf("("));
  if (bnd >= Math.floor(n * 0.5)) return head.slice(0, bnd);
  return a.slice(0, n - 1).join("") + "…";
}

/* ja-posts.js 에서 slug 메타 추출 */
function jaMeta(slug) {
  const txt = fs.readFileSync(path.join(ROOT, "js", "ja-posts.js"), "utf8");
  const re = new RegExp('\\{[^{}]*id:\\s*"' + slug.replace(/[-]/g, "\\$&") + '"[^{}]*\\}');
  const m = txt.match(re);
  if (!m) return null;
  const pick = (k) => { const mm = m[0].match(new RegExp(k + ':\\s*"((?:[^"\\\\]|\\\\.)*)"')); return mm ? mm[1] : ""; };
  return { id: slug, title: pick("title"), category: pick("category") || "info", url: pick("url"), summary: pick("summary") };
}

function extract(slug) {
  const f = path.join(ROOT, "ja", "posts", slug + ".html");
  const h = fs.readFileSync(f, "utf8");
  // 키워드(메타 첫 항목)
  let keyword = "";
  const mk = h.match(/<meta name="keywords" content="([^"]*)"/);
  if (mk) keyword = (mk[1].split(",")[0] || "").trim().split(/\s+/)[0];
  // この記事のポイント 3줄
  let points = [];
  const pm = h.match(/pt-list"[^>]*>([\s\S]*?)<\/ul>/);
  if (pm) points = (pm[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g) || []).map(li => stripTags(li));
  // セルフチェック H2 다음 ul
  let checks = [];
  const h2re = /<h2[^>]*>([\s\S]*?)<\/h2>/g; let m2; const headings = [];
  while ((m2 = h2re.exec(h))) {
    const htext = stripTags(m2[1]).replace(/^\d+[.．]\s*/, "");
    if (/セルフチェック|チェック/.test(htext) && !checks.length) {
      const seg = h.slice(m2.index + m2[0].length, m2.index + m2[0].length + 1600);
      const ul = seg.match(/<ul>([\s\S]*?)<\/ul>/);
      if (ul) checks = (ul[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g) || []).map(li => stripTags(li));
    }
    if (!/目次|よくある質問|まとめ|関連記事|参考文献|FAQ|はじめに|おわりに|まずは|最後に|結論|要点だけ|この記事/.test(htext)) {
      const ht = htext.split(/[｜|]/)[0].trim();
      if (ht.length >= 5) headings.push(ht);
    }
  }
  // 본문 첫 콘텐츠 <ul> (TOC/ポイント 제외)
  let bullets = [];
  const uls = h.match(/<ul>[\s\S]*?<\/ul>/g) || [];
  for (const ul of uls) {
    if (/pt-list/.test(ul)) continue;
    const lis = (ul.match(/<li[^>]*>([\s\S]*?)<\/li>/g) || []).map(li => stripTags(li)).filter(x => x && x.length <= 40);
    if (lis.length >= 3) { bullets = lis; break; }
  }
  return { keyword, points, checks, bullets, headings };
}

/* 체크리스트 5~6개 (셀프체크→포인트→본문목록→제목(H2) 순 폴백) */
function checklistItems(ex) {
  let src = [], kind = "point";
  if (ex.checks.length >= 3) { src = ex.checks; kind = "check"; }
  else if (ex.points.length >= 3) { src = ex.points; kind = "point"; }
  else if (ex.bullets.length >= 3) { src = ex.bullets; kind = "point"; }
  else { src = ex.headings; kind = "point"; }
  const items = src.slice(0, 6).map(s => clip(s, 20)).filter(Boolean);
  checklistItems._kind = kind;
  return items;
}

/* X 훅 A/B: 후보 생성→채점→상위 2 (n = 카드에 실제로 보이는 체크 항목 수) */
function pickHooks(meta, ex, n, kind) {
  const kw = ex.keyword || "";
  n = n || ex.checks.length || ex.points.length || 3;
  const unit = kind === "check" ? "つのチェック" : "つのポイント";
  const firstClause = (meta.title || "").split(/[？?、｜]/)[0];
  const raw = [
    (meta.title || "").split("｜")[0],
    firstClause + "？",
    kw ? (kw + "、知っておきたい" + n + unit) : "",
    kw ? (kw + "、" + n + unit) : "",
    "実は知らない" + (kw || "この") + "のコツ",
  ].filter(Boolean);
  const scored = raw.map(t => {
    const v = H.validateXHook(t);
    const s = H.scoreTitle(t, { keyword: kw, bodyFulfills: true });
    return { t, len: v.charLen, lenOk: v.lenOk, forbidden: v.forbidden, total: s.total };
  }).filter(x => x.forbidden.length === 0 && x.len <= 25);
  scored.sort((a, b) => b.total - a.total);
  const uniq = [];
  for (const s of scored) if (!uniq.find(u => u.t === s.t)) uniq.push(s);
  while (uniq.length < 2) uniq.push({ t: clip(firstClause, 25), total: 0 });
  return [uniq[0].t, uniq[1].t];
}

function buildPost(hook, points3, slug, variant, tags) {
  const link = SITE + "/ja/posts/" + slug + ".html?utm_source=x&utm_medium=social&utm_campaign=" + slug + "&utm_content=" + variant;
  let pts = points3.map(p => clip(p, 30));
  function assemble(ptsArr) {
    return hook + "\n\n" + ptsArr.map(p => "✅ " + p).join("\n") + "\n\n▼詳しくはこちら\n" + link + "\n\n" + tags.join(" ");
  }
  let text = assemble(pts);
  // 280 가중 초과 시 핵심 줄 길이를 줄임
  let guard = 0;
  while (H.weightedLength(text) > 280 && guard < 12) {
    pts = pts.map(p => clip(p, Math.max(14, Array.from(p).length - 3)));
    text = assemble(pts); guard++;
    if (pts.every(p => Array.from(p).length <= 14)) break;
  }
  return { text, link, weighted: H.weightedLength(text), ok: H.weightedLength(text) <= 280 };
}

async function gen(slug, opts) {
  opts = opts || {};
  const meta = jaMeta(slug);
  if (!meta) throw new Error("ja-posts.js 에 slug 없음: " + slug);
  const ex = extract(slug);
  const series = meta.category;
  const tags = (HASHTAGS[series] || HASHTAGS.default).slice(0, 2);
  const outDir = path.join(SOCIAL, slug);
  // 사람이 다듬은 override.json (hook·subhook·checklist·hooks·hashtags) 가 있으면 우선 적용
  let ov = {};
  try { const f = path.join(outDir, "override.json"); if (fs.existsSync(f)) ov = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) {}

  const autoItems = checklistItems(ex);
  const kind = ov.kind || checklistItems._kind || "point";
  const items = (ov.checklist && ov.checklist.length) ? ov.checklist.slice(0, 6) : autoItems;
  const hooks = (ov.hooks && ov.hooks.length >= 2) ? ov.hooks.slice(0, 2) : pickHooks(meta, ex, items.length, kind);
  const tagsFinal = (ov.hashtags && ov.hashtags.length) ? ov.hashtags.slice(0, 2) : tags;
  // 포스트 ✅ 3줄: 포인트 → 체크 → 항목(폴백)
  let p3src = ov.points && ov.points.length ? ov.points : (ex.points.length >= 3 ? ex.points : (ex.checks.length >= 3 ? ex.checks : items));
  const points3 = p3src.slice(0, 3).map(s => clip(s, 30));
  const kicker = ov.kicker || (kind === "check" ? "セルフチェック" : "この記事のポイント");
  const cardHook = ov.cardHook || clip(hooks[0], 16);
  const subhook = ov.subhook || (kind === "check" ? "あなたはいくつ当てはまる？" : "おさえたい要点はこちら");

  const postA = buildPost(hooks[0], points3, slug, "a", tagsFinal);
  const postB = buildPost(hooks[1], points3, slug, "b", tagsFinal);

  let cards = [];
  if (!opts.noX) {
    cards = await renderCards({ slug, series, hook: cardHook, subhook, kicker, items, outDir });
  }
  const altText = kicker + "：" + items.join("、") + "。" + (kind === "check" ? "当てはまる数を確認。" : "") + "健康フロー。";
  const post = {
    slug, series, title: meta.title, url: meta.url,
    keyword: ex.keyword,
    hooks, hashtags: tagsFinal,
    posts: {
      a: { text: postA.text, link: postA.link, weighted: postA.weighted, ok: postA.ok },
      b: { text: postB.text, link: postB.link, weighted: postB.weighted, ok: postB.ok },
    },
    checklist: items, points: points3,
    card: { vertical: "card.png", og: "card_og.png", alt: altText },
    cardResults: cards,
    forbidden: {
      a: H.checkForbidden(postA.text), b: H.checkForbidden(postB.text),
      hooks: hooks.map(h => H.checkForbidden(h)).flat(),
    },
    generatedAt: new Date().toISOString(),
  };
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "post.json"), JSON.stringify(post, null, 2));
  appendQueue(post);
  writeToday();
  return post;
}

/* queue.csv: 하루 최대 3편·슬롯 분산(평일 07:30/12:10/21:00, 주말 09:00/21:00)·A/B 3일 간격.
   신규 1편 추가 시 기존 큐의 빈 슬롯을 찾아 충돌 없이 배치. */
function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function slotsOf(dateStr) { const wd = new Date(dateStr + "T00:00:00").getDay(); return (wd === 0 || wd === 6) ? ["09:00", "21:00"] : ["07:30", "12:10", "21:00"]; }
function nextFreeSlot(rows, minDateStr) {
  const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1);
  if (minDateStr) { const m = new Date(minDateStr + "T00:00:00"); if (m > d) d.setTime(m.getTime()); }
  for (let i = 0; i < 400; i++) {
    const ds = ymd(d);
    for (const t of slotsOf(ds)) {
      if (!rows.find(r => r.date === ds && r.time === t)) return { date: ds, time: t };
    }
    d.setDate(d.getDate() + 1);
  }
  return { date: ymd(d), time: "12:00" };
}
function appendQueue(post) {
  const qf = path.join(SOCIAL, "queue.csv");
  const header = "date,time_jst,slug,variant,image,status\n";
  if (!fs.existsSync(qf)) fs.writeFileSync(qf, header);
  const lines = fs.readFileSync(qf, "utf8").trim().split("\n").slice(1).filter(Boolean);
  const rows = lines.map(l => { const [date, time, slug, variant] = l.split(","); return { date, time, slug, variant }; });
  if (rows.find(r => r.slug === post.slug && r.variant === "a")) return; // 중복 방지
  const img = "social/x/" + post.slug + "/card.png";
  const a = nextFreeSlot(rows, null);
  rows.push({ date: a.date, time: a.time, slug: post.slug, variant: "a" });
  const bMin = new Date(a.date + "T00:00:00"); bMin.setDate(bMin.getDate() + 3);
  const b = nextFreeSlot(rows, ymd(bMin));
  const add =
    [a.date, a.time, post.slug, "a", img, "pending"].join(",") + "\n" +
    [b.date, b.time, post.slug, "b", img, "pending"].join(",") + "\n";
  fs.appendFileSync(qf, add);
}

/* today.md: 오늘 날짜 큐를 복사·붙여넣기용으로 출력 */
function writeToday() {
  const qf = path.join(SOCIAL, "queue.csv");
  if (!fs.existsSync(qf)) return;
  const lines = fs.readFileSync(qf, "utf8").trim().split("\n").slice(1);
  const today = new Date(); const ts = ymd(today);
  const pend = lines.map(l => l.split(",")).filter(a => a[5] === "pending");
  // 오늘 분이 없으면 가장 가까운 예정일을 보여준다
  const todayRows = pend.filter(a => a[0] === ts);
  let target = ts, rowsForDay = todayRows, note = "";
  if (!todayRows.length) {
    const future = pend.filter(a => a[0] >= ts).sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
    if (future.length) { target = future[0][0]; rowsForDay = future.filter(a => a[0] === target); note = "오늘(" + ts + ") 예정 없음 → 다음 예정일"; }
  }
  let md = "# X 게시 예정 — " + target + (note ? "  (" + note + ")" : "") + "\n\n";
  const remain = pend.length;
  md += "_대기 " + remain + "건 · 이 파일은 `node scripts/x-post-gen.js <slug>` 또는 발행 시 자동 갱신됩니다._\n\n";
  if (!rowsForDay.length) { md += "_예정된 게시가 없습니다._\n"; fs.writeFileSync(path.join(SOCIAL, "today.md"), md); return; }
  rowsForDay.sort((a, b) => a[1].localeCompare(b[1]));
  for (const [date, time, slug, variant, image] of rowsForDay) {
    const pj = path.join(SOCIAL, slug, "post.json");
    if (!fs.existsSync(pj)) continue;
    const p = JSON.parse(fs.readFileSync(pj, "utf8"));
    md += "## " + time + " JST · " + slug + " (" + variant.toUpperCase() + ")\n\n";
    md += "```\n" + p.posts[variant].text + "\n```\n\n";
    md += "이미지: `" + image + "` · 대체텍스트: " + p.card.alt + "\n\n---\n\n";
  }
  fs.writeFileSync(path.join(SOCIAL, "today.md"), md);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const slug = args.find(a => !a.startsWith("--"));
  const noX = args.includes("--no-x");
  if (!slug) { console.error("사용: node scripts/x-post-gen.js <slug> [--no-x]"); process.exit(1); }
  gen(slug, { noX }).then(p => {
    console.log("X 세트 생성:", slug);
    console.log("  훅 A:", p.hooks[0], "| B:", p.hooks[1]);
    console.log("  A안 가중:", p.posts.a.weighted, p.posts.a.ok ? "OK" : "초과", "| B안 가중:", p.posts.b.weighted, p.posts.b.ok ? "OK" : "초과");
    console.log("  금지표현:", (p.forbidden.a.length + p.forbidden.b.length + p.forbidden.hooks.length) === 0 ? "0" : JSON.stringify(p.forbidden));
    if (p.cardResults.length) p.cardResults.forEach(c => console.log("  이미지:", c.file, c.w + "x" + c.h, (c.bytes / 1024 | 0) + "KB", c.overflow ? "⚠️오버플로우" : "✓", c.over1mb ? "⚠️1MB초과" : ""));
  }).catch(e => { console.error("ERR", e.message); process.exit(1); });
}

module.exports = { gen, extract, jaMeta, writeToday };
