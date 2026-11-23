/* 전체 JA 글에 대해 X 세트 일괄 생성
 *   node scripts/x-gen-all.js [--no-x]
 * ja-posts.js 의 모든 slug 에 대해 x-post-gen.gen() 실행.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { gen } = require("./x-post-gen");
const ROOT = path.resolve(__dirname, "..");

function slugs() {
  const txt = fs.readFileSync(path.join(ROOT, "js", "ja-posts.js"), "utf8");
  return (txt.match(/id:\s*"([^"]+)"/g) || []).map(s => s.match(/"([^"]+)"/)[1]);
}

(async () => {
  const noX = process.argv.includes("--no-x");
  const list = slugs();
  let ok = 0, fail = 0, warn = [];
  for (const slug of list) {
    try {
      const p = await gen(slug, { noX });
      const fb = (p.forbidden.a.length + p.forbidden.b.length + p.forbidden.hooks.length);
      const over = (p.cardResults || []).some(c => c.overflow || c.over1mb);
      const tw = !(p.posts.a.ok && p.posts.b.ok);
      if (fb || over || tw) warn.push(slug + (fb ? " 금지" : "") + (over ? " 카드⚠" : "") + (tw ? " 280초과" : ""));
      ok++;
    } catch (e) { fail++; warn.push(slug + " 실패:" + e.message); }
  }
  console.log("X 세트 생성 완료: 성공 " + ok + " / 실패 " + fail + " / 전체 " + list.length);
  if (warn.length) console.log("주의:\n  " + warn.join("\n  "));
  else console.log("경고 0 (전체 통과)");
})().catch(e => { console.error(e); process.exit(1); });
