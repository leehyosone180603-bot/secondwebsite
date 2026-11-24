/* X(트위터) 게시물 자동 생성기 (PART B — 2026-11 개편)
 *   node scripts/x-post-gen.js <slug> [--no-x]
 * 일본어 글 1편(/ja/posts/<slug>.html) → 체크리스트 이미지 + A/B 게시문 + 큐/오늘 목록.
 * 본문에 없는 정보를 지어내지 않는다(추출·요약만).
 *
 * ★ 개편(B-1): 게시 본문(body)에 외부 링크를 넣지 않는다. 링크는 firstReply(初回リプ)에만.
 *   구조 = ①첫 줄 훅 / ②✅체크 3~4 / ③한 줄 마무리 + ④질문 / ⑤해시태그(최대2).
 *   훅 3유형(myth·number·empathy)을 A/B에 서로 다르게 배정.
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

// 본문에 링크/도메인이 들어갔는지 검증 (B-1 규칙: body 에 URL 금지)
function hasUrl(s) { return /https?:\/\/|www\.|\b[\w-]+\.(com|jp|kr|co\.kr|net|org)\b/i.test(String(s || "")); }

function stripTags(s) { return String(s || "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim(); }
function clip(s, n) {
  const a = Array.from(String(s || ""));
  if (a.length <= n) return s;
  const head = a.slice(0, n).join("");
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
  let keyword = "";
  const mk = h.match(/<meta name="keywords" content="([^"]*)"/);
  if (mk) keyword = (mk[1].split(",")[0] || "").trim().split(/\s+/)[0];
  let points = [];
  const pm = h.match(/pt-list"[^>]*>([\s\S]*?)<\/ul>/);
  if (pm) points = (pm[1].match(/<li[^>]*>([\s\S]*?)<\/li>/g) || []).map(li => stripTags(li));
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

/* 훅 후보(3유형: myth 통념뒤집기 · number 숫자/즉시성 · empathy 상황공감) */
function hookCandidates(meta, ex, n, kind) {
  const kw = ex.keyword || "";
  const unit = kind === "check" ? "つのチェック" : "つのポイント";
  const titleHead = (meta.title || "").split("｜")[0].trim();
  const firstClause = (meta.title || "").split(/[？?、｜]/)[0].trim();
  const c = [];
  // myth (통념 뒤집기) — 제목이 이미 의문형이면 그대로 활용
  if (/[？?]/.test(meta.title || "")) c.push({ t: titleHead.replace(/[。]$/, ""), type: "myth" });
  c.push({ t: firstClause + "？", type: "myth" });
  if (kw) c.push({ t: "実は逆効果かも？" + kw, type: "myth" });
  // number / 즉시성
  if (kw) c.push({ t: kw + "、知っておきたい" + n + unit, type: "number" });
  if (kw) c.push({ t: kw + "、" + n + unit, type: "number" });
  c.push({ t: "今すぐできる" + (kw || "対策") + n + unit, type: "number" });
  // empathy (상황공감 — 1인칭 체험 지어내기 금지, 독자 호명)
  if (kw) c.push({ t: kw + "でお悩みの方へ", type: "empathy" });
  c.push({ t: (kw || "この悩み") + "が気になる人は", type: "empathy" });
  return c;
}
/* 점수 상위에서 서로 다른 유형 2개 선택 → [{t,type}, {t,type}] */
function pickTypedHooks(meta, ex, n, kind) {
  const kw = ex.keyword || "";
  const scored = hookCandidates(meta, ex, n, kind).map(c => {
    const v = H.validateXHook(c.t);
    const s = H.scoreTitle(c.t, { keyword: kw, bodyFulfills: true });
    return { t: c.t, type: c.type, len: v.charLen, forbidden: v.forbidden, total: s.total };
  }).filter(x => x.forbidden.length === 0 && x.len <= 25);
  scored.sort((a, b) => b.total - a.total);
  const picked = [];
  for (const c of scored) {
    if (!picked.length) { picked.push(c); continue; }
    if (c.type !== picked[0].type && !picked.find(p => p.t === c.t)) { picked.push(c); break; }
  }
  if (picked.length < 2) for (const c of scored) { if (!picked.find(p => p.t === c.t)) { picked.push(c); if (picked.length >= 2) break; } }
  while (picked.length < 2) picked.push({ t: clip((meta.title || "").split(/[？?、｜]/)[0], 25), type: "myth", total: 0 });
  return picked.slice(0, 2);
}

/* 게시 본문: ①훅 / ②✅체크 3~4 / ③마무리 + ④질문 / ⑤해시태그. 본문에 링크 없음. */
function buildPost(hook, checks, slug, variant, tags, closing, question, saveLine) {
  const link = SITE + "/ja/posts/" + slug + ".html?utm_source=x&utm_medium=social&utm_campaign=" + slug + "&utm_content=reply_" + variant;
  let items = checks.map(p => clip(p, 25)).filter(Boolean).slice(0, 4);
  function assemble(arr) {
    const tail = (saveLine ? saveLine + "\n" : "") + closing + "\n" + question;
    return hook + "\n\n" + arr.map(p => "✅ " + p).join("\n") + "\n\n" + tail + "\n\n" + tags.join(" ");
  }
  let body = assemble(items), guard = 0;
  while (H.weightedLength(body) > 280 && guard < 24) {
    if (items.length > 3) items = items.slice(0, items.length - 1);
    else items = items.map(p => clip(p, Math.max(12, Array.from(p).length - 2)));
    body = assemble(items); guard++;
    if (items.length <= 3 && items.every(p => Array.from(p).length <= 12)) break;
  }
  const firstReply = "詳しい原因と対処法はこちら👇\n" + link;
  return {
    body, firstReply, link,
    weighted: H.weightedLength(body), charCount: Array.from(body).length,
    ok: H.weightedLength(body) <= 280, urlInBody: hasUrl(body),
  };
}

async function gen(slug, opts) {
  opts = opts || {};
  const meta = jaMeta(slug);
  if (!meta) throw new Error("ja-posts.js 에 slug 없음: " + slug);
  const ex = extract(slug);
  const series = meta.category;
  const tags = (HASHTAGS[series] || HASHTAGS.default).slice(0, 2);
  const outDir = path.join(SOCIAL, slug);
  let ov = {};
  try { const f = path.join(outDir, "override.json"); if (fs.existsSync(f)) ov = JSON.parse(fs.readFileSync(f, "utf8")); } catch (e) {}

  const autoItems = checklistItems(ex);
  const kind = ov.kind || checklistItems._kind || "point";
  const items = (ov.checklist && ov.checklist.length) ? ov.checklist.slice(0, 6) : autoItems;
  const typed = (ov.hooks && ov.hooks.length >= 2)
    ? ov.hooks.slice(0, 2).map(t => ({ t, type: "custom" }))
    : pickTypedHooks(meta, ex, items.length, kind);
  const tagsFinal = (ov.hashtags && ov.hashtags.length) ? ov.hashtags.slice(0, 2) : tags;
  let p3src = ov.points && ov.points.length ? ov.points : (ex.points.length >= 3 ? ex.points : (ex.checks.length >= 3 ? ex.checks : items));
  const points3 = p3src.slice(0, 3).map(s => clip(s, 25));
  const kicker = ov.kicker || (kind === "check" ? "セルフチェック" : "この記事のポイント");
  const cardHook = ov.cardHook || clip(typed[0].t, 16);
  const subhook = ov.subhook || (kind === "check" ? "あなたはいくつ当てはまる？" : "おさえたい要点はこちら");
  // ③ 마무리 한 줄 · ④ 질문 한 줄 (지어내는 사실 없음 — 안전한 정형구)
  const closing = ov.closing || (kind === "check" ? "気になるサインが続くときは、無理せず医師にご相談ください。" : "今日からできるものを一つ選んでみてください。");
  const question = ov.question || (kind === "check" ? "あなたはいくつ当てはまりましたか？" : "あなたはどれから試しますか？");

  const postA = buildPost(typed[0].t, points3, slug, "a", tagsFinal, closing, question, null);
  // B안은 선택적으로 '저장 추천' 한 줄(B-1 규칙7)
  const postB = buildPost(typed[1].t, points3, slug, "b", tagsFinal, closing, (ov.questionB || question), "あとで見返せるように保存推奨📌");

  // B-1 규칙1: body 에 URL 이 있으면 생성 실패 처리
  const urlFails = [];
  if (postA.urlInBody) urlFails.push(slug + "/a");
  if (postB.urlInBody) urlFails.push(slug + "/b");
  if (urlFails.length) throw new Error("본문에 URL 포함(링크는 firstReply 전용): " + urlFails.join(", "));

  let cards = [];
  if (!opts.noX) {
    cards = await renderCards({ slug, series, hook: cardHook, subhook, kicker, items, outDir });
  }
  const altText = kicker + "：" + items.join("、") + "。" + (kind === "check" ? "当てはまる数を確認。" : "") + "健康フロー。";
  const image = "social/x/" + slug + "/card.png";
  function V(p, hookObj) {
    return { body: p.body, text: p.body, firstReply: p.firstReply, hookType: hookObj.type, link: p.link, weighted: p.weighted, charCount: p.charCount, ok: p.ok };
  }
  const post = {
    slug, series, title: meta.title, url: meta.url,
    keyword: ex.keyword,
    hooks: [typed[0].t, typed[1].t], hookTypes: [typed[0].type, typed[1].type], hashtags: tagsFinal,
    image,
    posts: { a: V(postA, typed[0]), b: V(postB, typed[1]) },
    variants: [
      { variant: "a", hookType: typed[0].type, body: postA.body, firstReply: postA.firstReply, charCount: postA.charCount, image },
      { variant: "b", hookType: typed[1].type, body: postB.body, firstReply: postB.firstReply, charCount: postB.charCount, image },
    ],
    checklist: items, points: points3,
    card: { vertical: "card.png", og: "card_og.png", alt: altText },
    cardResults: cards,
    forbidden: {
      a: H.checkForbidden(postA.body), b: H.checkForbidden(postB.body),
      hooks: [typed[0].t, typed[1].t].map(h => H.checkForbidden(h)).flat(),
    },
    generatedAt: new Date().toISOString(),
  };
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "post.json"), JSON.stringify(post, null, 2));
  appendQueue(post);
  writeToday();
  return post;
}

/* queue.csv: 하루 최대 3편·슬롯 분산(평일 07:30/12:15/21:00, 주말 09:00/21:00)·A/B 3일 간격. */
function ymd(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
function slotsOf(dateStr) { const wd = new Date(dateStr + "T00:00:00").getDay(); return (wd === 0 || wd === 6) ? ["09:00", "21:00"] : ["07:30", "12:15", "21:00"]; }
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
  if (rows.find(r => r.slug === post.slug && r.variant === "a")) return;
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

/* today.md: 오늘 날짜 큐를 복사·붙여넣기용으로 출력 (본문 + 初回リプ + 직접게시 안내) */
function writeToday() {
  const qf = path.join(SOCIAL, "queue.csv");
  if (!fs.existsSync(qf)) return;
  const lines = fs.readFileSync(qf, "utf8").trim().split("\n").slice(1);
  const today = new Date(); const ts = ymd(today);
  const pend = lines.map(l => l.split(",")).filter(a => a[5] === "pending");
  const todayRows = pend.filter(a => a[0] === ts);
  let target = ts, rowsForDay = todayRows, note = "";
  if (!todayRows.length) {
    const future = pend.filter(a => a[0] >= ts).sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
    if (future.length) { target = future[0][0]; rowsForDay = future.filter(a => a[0] === target); note = "오늘(" + ts + ") 예정 없음 → 다음 예정일"; }
  }
  let md = "# X 게시 예정 — " + target + (note ? "  (" + note + ")" : "") + "\n\n";
  md += "_대기 " + pend.length + "건 · 본문엔 링크가 없습니다. 게시 후 **첫 답글(初回リプ)** 을 직접 달아 링크를 넣으세요._\n\n";
  if (!rowsForDay.length) { md += "_예정된 게시가 없습니다._\n"; fs.writeFileSync(path.join(SOCIAL, "today.md"), md); return; }
  rowsForDay.sort((a, b) => a[1].localeCompare(b[1]));
  for (const [date, time, slug, variant, image] of rowsForDay) {
    const pj = path.join(SOCIAL, slug, "post.json");
    if (!fs.existsSync(pj)) continue;
    const p = JSON.parse(fs.readFileSync(pj, "utf8"));
    const v = (p.posts && p.posts[variant]) || {};
    md += "## " + time + " JST · " + slug + " (" + variant.toUpperCase() + ")\n\n";
    md += "**본문:**\n\n```\n" + (v.body || v.text || "") + "\n```\n\n";
    md += "⏰ **게시 3분 후 아래를 첫 답글(初回リプ)로 직접 게시:**\n\n```\n" + (v.firstReply || "") + "\n```\n\n";
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
    console.log("  훅 A(" + p.hookTypes[0] + "):", p.hooks[0], "| B(" + p.hookTypes[1] + "):", p.hooks[1]);
    console.log("  A안 가중:", p.posts.a.weighted, p.posts.a.ok ? "OK" : "초과", "(" + p.posts.a.charCount + "자) | B안 가중:", p.posts.b.weighted, p.posts.b.ok ? "OK" : "초과", "(" + p.posts.b.charCount + "자)");
    console.log("  본문 URL:", (p.posts.a.body + p.posts.b.body).match(/https?:\/\//) ? "⚠️포함" : "없음(정상)");
    console.log("  금지표현:", (p.forbidden.a.length + p.forbidden.b.length + p.forbidden.hooks.length) === 0 ? "0" : JSON.stringify(p.forbidden));
    if (p.cardResults.length) p.cardResults.forEach(c => console.log("  이미지:", c.file, c.w + "x" + c.h, (c.bytes / 1024 | 0) + "KB", c.overflow ? "⚠️오버플로우" : "✓", c.over1mb ? "⚠️1MB초과" : ""));
  }).catch(e => { console.error("ERR", e.message); process.exit(1); });
}

module.exports = { gen, extract, jaMeta, writeToday, hasUrl };
