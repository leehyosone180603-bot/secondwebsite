/* 약기법(薬機法) 본문 일괄 감사 — /ja/posts 전체
 *   node scripts/yakkihou-audit.js
 * 본문 표시텍스트에서 금지/주의 표현을 문맥과 함께 보고 → social/x/yakkihou-audit.md
 * 반영(수정)은 하지 않는다. 보고만 한다.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "ja", "posts");

// 금지(명백)·주의(문맥 확인) 구분
const BAN = ["治る", "治す", "予防できる", "効く", "改善", "美白", "シミが消える", "シワが消える", "劇的"];
const WARN = ["消える", "効果絶大", "必ず", "完全に防ぐ", "確実に", "病気が治", "最強", "奇跡"];

function visibleText(h) {
  return h.replace(/<script[\s\S]*?<\/script>/g, " ")
          .replace(/<style[\s\S]*?<\/style>/g, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&[a-z]+;/g, " ")
          .replace(/\s+/g, " ");
}
function contexts(text, term) {
  const out = []; let i = 0;
  while ((i = text.indexOf(term, i)) !== -1) {
    const s = Math.max(0, i - 24), e = Math.min(text.length, i + term.length + 24);
    out.push("…" + text.slice(s, e).trim() + "…");
    i += term.length;
    if (out.length >= 5) break;
  }
  return out;
}

const files = fs.readdirSync(DIR).filter(f => f.endsWith(".html"));
let md = "# 약기법(薬機法) 본문 감사 리포트\n\n- 대상: /ja/posts " + files.length + "편 (표시 텍스트 기준)\n";
md += "- **금지(수정 권장)**: " + BAN.join("·") + "\n- 주의(문맥 확인): " + WARN.join("·") + "\n- 반영 없음(보고용). 승인 후 수정.\n\n";
let banTotal = 0, warnTotal = 0;
const banFiles = [], warnOnly = [];
const detail = [];
for (const f of files) {
  const slug = f.replace(/\.html$/, "");
  const t = visibleText(fs.readFileSync(path.join(DIR, f), "utf8"));
  const banHits = {}, warnHits = {};
  for (const w of BAN) { const c = contexts(t, w); if (c.length) { banHits[w] = c; banTotal += c.length; } }
  for (const w of WARN) { if (BAN.indexOf(w) !== -1) continue; const c = contexts(t, w); if (c.length) { warnHits[w] = c; warnTotal += c.length; } }
  const hasBan = Object.keys(banHits).length, hasWarn = Object.keys(warnHits).length;
  if (hasBan) banFiles.push(slug);
  else if (hasWarn) warnOnly.push(slug);
  if (hasBan || hasWarn) detail.push({ slug, banHits, warnHits });
}
md += "## 요약\n- 금지표현 발견 글: **" + banFiles.length + "편** (총 " + banTotal + "건)\n- 주의표현만 있는 글: " + warnOnly.length + "편 (총 " + warnTotal + "건)\n- 깨끗한 글: " + (files.length - detail.length) + "편\n\n";
if (banFiles.length) md += "**금지표현 글**: " + banFiles.join(", ") + "\n\n";
md += "## 상세\n\n";
for (const d of detail) {
  md += "### " + d.slug + "\n";
  for (const w of Object.keys(d.banHits)) { md += "- ❌ **" + w + "** (" + d.banHits[w].length + "): "; md += d.banHits[w].map(c => "`" + c + "`").join(" / ") + "\n"; }
  for (const w of Object.keys(d.warnHits)) { md += "- ⚠️ " + w + " (" + d.warnHits[w].length + "): " + d.warnHits[w].map(c => "`" + c + "`").join(" / ") + "\n"; }
  md += "\n";
}
const out = path.join(ROOT, "social", "x", "yakkihou-audit.md");
fs.writeFileSync(out, md);
console.log("감사 리포트: " + out);
console.log("금지표현 글 " + banFiles.length + "편(" + banTotal + "건) / 주의만 " + warnOnly.length + "편 / 깨끗 " + (files.length - detail.length) + "편");
if (banFiles.length) console.log("금지 글: " + banFiles.join(", "));
