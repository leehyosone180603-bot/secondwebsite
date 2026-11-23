/* A-7: 기존 /ja/ 글 제목 재채점 리포트 (반영 X, 보고용)
 *   node scripts/x-retitle-report.js
 * → social/x/retitle-report.md 생성. 6점 이하만 개선안 후보 표시.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./lib/hook-copy");
const ROOT = path.resolve(__dirname, "..");

function jaList() {
  const txt = fs.readFileSync(path.join(ROOT, "js", "ja-posts.js"), "utf8");
  const entries = txt.match(/\{\s*id:[\s\S]*?\}/g) || [];
  return entries.map(e => {
    const pick = k => { const m = e.match(new RegExp(k + ':\\s*"((?:[^"\\\\]|\\\\.)*)"')); return m ? m[1] : ""; };
    return { id: pick("id"), title: pick("title"), category: pick("category") || "info" };
  }).filter(x => x.id);
}
function keywordOf(slug) {
  try {
    const h = fs.readFileSync(path.join(ROOT, "ja", "posts", slug + ".html"), "utf8");
    const m = h.match(/<meta name="keywords" content="([^"]*)"/);
    return m ? (m[1].split(",")[0] || "").trim().split(/\s+/)[0] : "";
  } catch (e) { return ""; }
}

const list = jaList();
let rows = list.map(p => {
  const kw = keywordOf(p.id);
  const s = H.scoreTitle(p.title, { keyword: kw, bodyFulfills: true });
  const v = H.validateBlogTitle(p.title, { keyword: kw });
  return { id: p.id, title: p.title, kw, total: s.total, len: v.charLen, lenOk: v.lenOk, kwFront: v.keywordFront, forbidden: v.forbidden, bd: s.breakdown };
});
rows.sort((a, b) => a.total - b.total);

const low = rows.filter(r => r.total <= 6);
let md = "# 일본어 글 제목 재채점 리포트 (A-7)\n\n";
md += "- 대상: /ja/posts 등록글 " + rows.length + "편\n";
md += "- 채점표: 구체성·호기심·자기관련성·키워드·약속이행 (각 0~2, 10점)\n";
md += "- 길이 규칙: 28~35자, 키워드 앞 15자 이내\n";
md += "- **개선 후보(6점 이하): " + low.length + "편** — 반영은 사용자 승인 후\n\n";
md += "| 점수 | 길이 | kw앞 | 금지 | slug | 제목 |\n|---|---|---|---|---|---|\n";
for (const r of rows) {
  md += "| " + r.total + " | " + r.len + (r.lenOk ? "" : "⚠") + " | " + (r.kwFront === null ? "-" : (r.kwFront ? "O" : "X")) + " | " +
    (r.forbidden.length ? r.forbidden.join(",") : "-") + " | " + r.id + " | " + r.title + " |\n";
}
md += "\n## 개선 후보 상세 (6점 이하)\n\n";
if (!low.length) md += "_없음_\n";
for (const r of low) {
  md += "### " + r.id + " (" + r.total + "점)\n";
  md += "- 현재: " + r.title + "\n";
  md += "- 세부: " + JSON.stringify(r.bd) + (r.lenOk ? "" : " · 길이 " + r.len + "자(28~35 권장)") + (r.kwFront === false ? " · 키워드가 앞 15자 밖" : "") + "\n";
  md += "- 메인 키워드(추정): " + (r.kw || "(미검출)") + "\n\n";
}
const out = path.join(ROOT, "social", "x", "retitle-report.md");
if (!fs.existsSync(path.dirname(out))) fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, md);
console.log("리포트: " + out);
console.log("총 " + rows.length + "편 · 6점 이하 " + low.length + "편 · 평균 " + (rows.reduce((a, b) => a + b.total, 0) / rows.length).toFixed(1) + "점");
console.log("점수분포: " + [0,1,2,3,4,5,6,7,8,9,10].map(n => n + "점:" + rows.filter(r => r.total === n).length).filter(s => !/:0$/.test(s)).join(" "));
