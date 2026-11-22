"use strict";
/* extract-post.js — 기존 /posts/<slug>.html 에서 번역용 원문(마크다운)+메타를 추출.
   사용: node scripts/extract-post.js <slug>  →  JSON stdout
   일본어 미러 발행을 위해 제목·설명·키워드·카테고리·날짜·사진·본문(md)을 뽑아낸다. */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");

function decode(s) {
  return String(s == null ? "" : s)
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}
function stripTags(s) { return decode(String(s).replace(/<[^>]+>/g, "")); }
// 인라인: <strong> → **, <a href> → [text](href)
function inline(s) {
  s = String(s)
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g, "[$2]($1)");
  return decode(s.replace(/<[^>]+>/g, "")).trim();
}
function attr(html, re) { const m = html.match(re); return m ? decode(m[1]) : ""; }

const slug = process.argv[2];
if (!slug) { console.error("사용: node scripts/extract-post.js <slug>"); process.exit(1); }
const html = fs.readFileSync(path.join(ROOT, "posts", slug + ".html"), "utf8");

const title = stripTags(attr(html, /<h1 class="article__title">([\s\S]*?)<\/h1>/));
let seoTitle = attr(html, /<title>([\s\S]*?)<\/title>/).replace(/\s*·\s*건강흐름\s*$/, "").trim();
const description = attr(html, /<meta name="description" content="([^"]*)"/);
const keywords = attr(html, /<meta name="keywords" content="([^"]*)"/).split(",").map(s => s.trim()).filter(Boolean);
const category = attr(html, /<body data-cat="([^"]*)"/) || "info";
const date = (attr(html, /<div class="article__meta">([\s\S]*?)<\/div>/).match(/(\d{4}-\d{2}-\d{2})/) || [,""])[1];

// 사진
const photos = [];
const figRe = /<img src="([^"]+)" alt="([^"]*)"/g; let fm;
while ((fm = figRe.exec(html))) photos.push({ file: decode(fm[1]), alt: decode(fm[2]) });

// 본문 → 마크다운
const bodyHtml = (html.match(/<div class="article__body">([\s\S]*?)<\/div>\s*<div class="article__nav">/) || [,""])[1];
const lines = [];
// 블록 단위 토큰화
const blockRe = /<figure[\s\S]*?<\/figure>|<h2>([\s\S]*?)<\/h2>|<h3>([\s\S]*?)<\/h3>|<ul>([\s\S]*?)<\/ul>|<ol>([\s\S]*?)<\/ol>|<p[^>]*>([\s\S]*?)<\/p>/g;
let bm;
while ((bm = blockRe.exec(bodyHtml))) {
  if (bm[0].startsWith("<figure")) continue; // 사진은 별도 처리
  if (bm[1] != null) lines.push("## " + inline(bm[1]));
  else if (bm[2] != null) lines.push("### " + inline(bm[2]));
  else if (bm[3] != null) {
    const items = [...bm[3].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x => "- " + inline(x[1]));
    lines.push(items.join("\n"));
  } else if (bm[4] != null) {
    const items = [...bm[4].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x, i) => (i + 1) + ". " + inline(x[1]));
    lines.push(items.join("\n"));
  } else if (bm[5] != null) lines.push(inline(bm[5]));
}
const bodyMd = lines.join("\n\n");

process.stdout.write(JSON.stringify({ slug, title, seoTitle, description, keywords, category, date, photos, bodyMd }, null, 2));
