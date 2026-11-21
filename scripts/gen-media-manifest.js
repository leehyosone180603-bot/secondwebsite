"use strict";
/* 홈페이지 발행 글들의 사진 목록(매니페스트) 생성 → 대시보드 '홈페이지 사진함'용.
   사용: node scripts/gen-media-manifest.js [출력경로]  (기본: /tmp/media-home.json) */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const ORIGIN = "https://healthfortune.co.kr";
const out = process.argv[2] || "/tmp/media-home.json";

global.window = {};
(0, eval)(fs.readFileSync(path.join(ROOT, "js/posts.js"), "utf8"));
const POSTS = global.window.POSTS || [];
const titleByUrl = {}, dateByUrl = {};
POSTS.forEach(p => { if (p.url) { titleByUrl[p.url] = p.title; dateByUrl[p.url] = p.date || ""; } });

const files = fs.readdirSync(path.join(ROOT, "posts")).filter(f => f.endsWith(".html") && f !== "_template.html");
const arts = [];
for (const f of files) {
  const html = fs.readFileSync(path.join(ROOT, "posts", f), "utf8");
  const srcs = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m => m[1])
    .filter(s => /\.(jpe?g|png)$/i.test(s) && !/logo|icon|favicon/i.test(s));
  const seen = new Set(), imgs = [];
  for (const s of srcs) {
    const base = s.replace(/\.(jpe?g|png)$/i, "");
    if (seen.has(base)) continue;
    const jpg = srcs.find(x => x.replace(/\.(jpe?g|png)$/i, "") === base && /\.jpe?g$/i.test(x));
    const pick = jpg || s;
    if (!imgs.includes(pick)) { imgs.push(pick); seen.add(base); }
  }
  if (!imgs.length) continue;
  const url = "/posts/" + f;
  arts.push({ slug: f.replace(".html", ""), title: titleByUrl[url] || f.replace(".html", ""), url: ORIGIN + url, date: dateByUrl[url] || "", images: imgs.map(s => ORIGIN + s) });
}
arts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
const totImg = arts.reduce((n, a) => n + a.images.length, 0);
fs.writeFileSync(out, JSON.stringify({ updatedAt: Date.now(), count: arts.length, images: totImg, articles: arts }));
console.log("매니페스트 생성: 글 " + arts.length + "편, 이미지 " + totImg + "장 → " + out);
