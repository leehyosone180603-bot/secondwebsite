"use strict";
/* =============================================================
   factory-publish.js — 블로그 글 공장 발행기
   -------------------------------------------------------------
   공장이 만든 글(마크다운) + 첨부 사진을 받아, 건강흐름 사이트와
   동일한 형식(.article)의 /posts/<slug>.html 로 생성하고
   js/posts.js · sitemap.xml · rss.xml 을 갱신한다.

   사용: node scripts/factory-publish.js <article.json>

   article.json 형식:
   {
     "slug": "flu-vs-cold-symptoms",
     "title": "독감 감기 차이 증상 구별법, 병원은 48시간 안에",
     "seoTitle": "독감 감기 차이 증상 구별법과 병원 갈 타이밍",   // <title>용(없으면 title)
     "description": "…",                                        // meta description
     "keywords": ["독감","독감 감기 차이", …],                   // tags
     "category": "info",                                        // info|food
     "date": "2026-11-20",
     "bodyMd": "## …\n본문 마크다운",
     "photos": [ {"file":"/img/flu-vs-cold-symptoms-1.jpg","alt":"…","caption":"…"} , … ]
     // photos[0] = 대표(히어로). file 은 이미 img/ 에 복사돼 있어야 함(여기선 경로만 기록).
   }
   ============================================================= */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const BASE = "https://healthfortune.co.kr";

const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inlineMd = t => esc(t).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

/* 마크다운(제한 문법) → 블록 배열 */
function parseBlocks(md) {
  const lines = String(md || "").split(/\r?\n/);
  const blocks = []; let ul = null, ol = null;
  const flush = () => { if (ul) { blocks.push({ t: "ul", items: ul }); ul = null; } if (ol) { blocks.push({ t: "ol", items: ol }); ol = null; } };
  for (const ln of lines) {
    const s = ln.trim();
    if (!s) { flush(); continue; }
    let m;
    if ((m = s.match(/^##\s+(.*)/))) { flush(); blocks.push({ t: "h2", text: m[1] }); }
    else if ((m = s.match(/^###\s+(.*)/))) { flush(); blocks.push({ t: "h3", text: m[1] }); }
    else if ((m = s.match(/^[-*]\s+(.*)/))) { if (ol) flush(); if (!ul) ul = []; ul.push(m[1]); }
    else if ((m = s.match(/^\d+[.)]\s+(.*)/))) { if (ul) flush(); if (!ol) ol = []; ol.push(m[1]); }
    else if (/^>\s?/.test(s)) { flush(); blocks.push({ t: "p", text: s.replace(/^>\s?/, "") }); }
    else { flush(); blocks.push({ t: "p", text: s }); }
  }
  flush();
  return blocks;
}

function figureHtml(ph, idx) {
  const alt = esc(ph.alt || "");
  const cap = ph.caption ? `\n          <figcaption>${esc(ph.caption)}</figcaption>` : "";
  return `        <figure class="article__figure">\n          <img src="${esc(ph.file)}" alt="${alt}" loading="${idx === 0 ? "eager" : "lazy"}">${cap}\n        </figure>`;
}

function buildBody(blocks, photos) {
  const out = [];
  const hero = photos[0];
  const extra = photos.slice(1);
  // 히어로: 본문 맨 앞
  if (hero) out.push(figureHtml(hero, 0));
  // 첫 문단 = lead
  let leadDone = false;
  // 추가 사진을 H2 뒤에 분산
  const h2Positions = blocks.map((b, i) => b.t === "h2" ? i : -1).filter(i => i >= 0);
  const place = {}; // blockIndex -> photo
  if (extra.length && h2Positions.length) {
    const step = Math.max(1, Math.floor(h2Positions.length / (extra.length + 1)));
    let pi = 0;
    for (let k = 1; k <= h2Positions.length && pi < extra.length; k += step) {
      place[h2Positions[k - 1]] = extra[pi++];
    }
    // 남은 사진은 마지막 H2들에
    let hp = h2Positions.length - 1;
    while (pi < extra.length && hp >= 0) { if (!place[h2Positions[hp]]) place[h2Positions[hp]] = extra[pi++]; hp--; }
  }
  blocks.forEach((b, i) => {
    if (b.t === "h2") {
      out.push(`        <h2>${inlineMd(b.text)}</h2>`);
      if (place[i]) out.push(figureHtml(place[i], 1));
    } else if (b.t === "h3") {
      out.push(`        <h3>${inlineMd(b.text)}</h3>`);
    } else if (b.t === "ul") {
      out.push("        <ul>" + b.items.map(x => `<li>${inlineMd(x)}</li>`).join("") + "</ul>");
    } else if (b.t === "ol") {
      out.push("        <ol>" + b.items.map(x => `<li>${inlineMd(x)}</li>`).join("") + "</ol>");
    } else { // p
      const hasDisc = /정보\s*제공\s*목적|전문의|의사의 진단|진단이나 처방/.test(b.text);
      const discIdx = b.text.search(/※|이 글은|본 글은|이 정보는/);
      if (hasDisc && discIdx > 0) {
        const pre = b.text.slice(0, discIdx).trim();
        const disc = b.text.slice(discIdx).replace(/^※\s*/, "").trim();
        if (pre) out.push(`        <p>${inlineMd(pre)}</p>`);
        out.push(`        <p class="disclaimer">※ ${inlineMd(disc)}</p>`);
      } else if (hasDisc) {
        out.push(`        <p class="disclaimer">※ ${inlineMd(b.text.replace(/^※\s*/, ""))}</p>`);
      } else if (!leadDone) { out.push(`        <p class="article__lead">${inlineMd(b.text)}</p>`); leadDone = true; }
      else out.push(`        <p>${inlineMd(b.text)}</p>`);
    }
  });
  return out.join("\n");
}

function pageHtml(a, photos) {
  const catName = a.category === "food" ? "건강음식" : "건강정보";
  const seoTitle = a.seoTitle || a.title;
  const hero = photos[0];
  const ogImage = hero ? BASE + hero.file : "";
  const kw = (a.keywords || []).join(", ");
  const ld = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.title, description: a.description,
    ...(ogImage ? { image: ogImage } : {}),
    datePublished: a.date, dateModified: a.date,
    author: { "@type": "Organization", name: "건강흐름" },
    publisher: { "@type": "Organization", name: "건강흐름", url: BASE + "/" },
    mainEntityOfPage: `${BASE}/posts/${a.slug}.html`
  };
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(seoTitle)} · 건강흐름</title>
  <meta name="description" content="${esc(a.description)}">
  <meta name="keywords" content="${esc(kw)}">
  <link rel="canonical" href="${BASE}/posts/${a.slug}.html">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(a.title)}">
  <meta property="og:description" content="${esc(a.description)}">
  <meta property="og:url" content="${BASE}/posts/${a.slug}.html">
${ogImage ? `  <meta property="og:image" content="${ogImage}">\n` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">

  <script type="application/ld+json">
  ${JSON.stringify(ld, null, 2).split("\n").join("\n  ")}
  </script>
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7143828779500885"
          crossorigin="anonymous"></script>
</head>
<body data-cat="${esc(a.category || "info")}">
  <header id="site-header"></header>

  <main class="wrap">
    <article class="article">
      <span class="article__cat">${catName}</span>
      <h1 class="article__title">${esc(a.title)}</h1>
      <div class="article__meta">건강흐름 · ${esc(a.date)}</div>

      <div class="article__body">
${buildBody(parseBlocks(a.bodyMd), photos)}
      </div>

      <div class="article__nav"><a class="btn" href="/category.html?cat=${esc(a.category || "info")}">‹ ${catName} 더 보기</a></div>
    </article>
  </main>

  <footer id="site-footer"></footer>

  <script src="/js/posts.js"></script>
  <script src="/js/site.js"></script>
</body>
</html>
`;
}

/* posts.js 에 엔트리 prepend (중복 slug면 교체) */
function updatePostsJs(a, heroFile) {
  const pf = path.join(ROOT, "js", "posts.js");
  let s = fs.readFileSync(pf, "utf8");
  // 기존 동일 id 엔트리 제거
  const reOld = new RegExp("\\n  \\{\\s*\\n(?:[^{}]*\\n)*?    id: \"" + a.slug.replace(/[-]/g, "\\$&") + "\",[\\s\\S]*?\\n  \\},", "m");
  s = s.replace(reOld, "");
  const entry = `  {
    id: "${a.slug}",
    title: ${JSON.stringify(a.title)},
    summary: ${JSON.stringify(a.description)},
    category: ${JSON.stringify(a.category || "info")},
    date: ${JSON.stringify(a.date)},
    url: "/posts/${a.slug}.html",
    image: ${JSON.stringify(heroFile || "")},
  },`;
  s = s.replace(/const POSTS = \[\n/, "const POSTS = [\n" + entry + "\n");
  fs.writeFileSync(pf, s);
}

/* posts.js 를 읽어 sitemap.xml + rss.xml 재생성 */
function regenFeeds() {
  let code = fs.readFileSync(path.join(ROOT, "js/posts.js"), "utf8");
  const window = {}; eval(code);
  const POSTS = window.POSTS, CATEGORIES = window.CATEGORIES, NAV = window.NAV_ORDER || Object.keys(CATEGORIES);
  const sorted = [...POSTS].sort((x, y) => String(y.date).localeCompare(String(x.date)));
  const now = new Date();
  const rfc822 = d => new Date(d + "T09:00:00+09:00").toUTCString().replace("GMT", "+0000");
  // RSS
  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n  <title>건강흐름</title>\n  <link>${BASE}/</link>\n  <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml"/>\n  <description>건강음식·건강정보와 나이·날짜 계산기 — 건강흐름</description>\n  <language>ko</language>\n  <lastBuildDate>${now.toUTCString().replace("GMT", "+0000")}</lastBuildDate>\n`;
  for (const p of sorted) rss += `  <item>\n    <title>${esc(p.title)}</title>\n    <link>${BASE}${p.url}</link>\n    <guid isPermaLink="true">${BASE}${p.url}</guid>\n    <description>${esc(p.summary)}</description>\n    <pubDate>${rfc822(p.date)}</pubDate>\n    <category>${esc((CATEGORIES[p.category] || {}).name || p.category)}</category>\n  </item>\n`;
  rss += `</channel>\n</rss>\n`;
  fs.writeFileSync(path.join(ROOT, "rss.xml"), rss);
  // SITEMAP
  const CALCS = ["age", "birth-year", "business-days", "military", "scientific", "salary", "severance", "vat", "freelancer", "lotto", "lotto-prize"];
  let urls = [{ loc: `${BASE}/`, changefreq: "daily", priority: "1.0" }, { loc: `${BASE}/calculators.html`, changefreq: "weekly", priority: "0.9" }];
  for (const slug of NAV) if ((CATEGORIES[slug] || {}).ready) urls.push({ loc: `${BASE}/category.html?cat=${slug}`, changefreq: "daily", priority: "0.8" });
  for (const c of CALCS) urls.push({ loc: `${BASE}/${c}/`, changefreq: "monthly", priority: "0.8" });
  for (const p of sorted) urls.push({ loc: `${BASE}${p.url}`, lastmod: p.date, changefreq: "monthly", priority: "0.7" });
  for (const st of [["about.html", "0.4"], ["contact.html", "0.4"], ["terms.html", "0.3"], ["privacy.html", "0.3"]]) urls.push({ loc: `${BASE}/${st[0]}`, priority: st[1] });
  let sm = `<?xml version="1.0" encoding="UTF-8"?>\n<!-- 자동 생성: js/posts.js 기준 -->\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of urls) { sm += `  <url>\n    <loc>${esc(u.loc)}</loc>\n`; if (u.lastmod) sm += `    <lastmod>${u.lastmod}</lastmod>\n`; if (u.changefreq) sm += `    <changefreq>${u.changefreq}</changefreq>\n`; if (u.priority) sm += `    <priority>${u.priority}</priority>\n`; sm += `  </url>\n`; }
  sm += `</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sm);
}

/* 티스토리 붙여넣기용 요약 HTML (목차 + 원본 요약 + 원문 링크).
   duplicate-content 방지를 위해 본문이 아니라 a.tistorySummary(원본 요약)를 쓴다. */
function buildTistoryHtml(a, url) {
  const h2s = parseBlocks(a.bodyMd).filter(b => b.t === "h2").map(b => b.text);
  const toc = h2s.map(h => `  <li>${inlineMd(h)}</li>`).join("\n");
  const summary = String(a.tistorySummary || a.description || "")
    .split(/\n{2,}|\n/).filter(s => s.trim())
    .map(p => `<p>${inlineMd(p.trim())}</p>`).join("\n");
  return `<!-- 건강흐름 요약 · 티스토리 붙여넣기용 (HTML 모드로 붙여넣기) -->
${summary}

<h2>이 글에서 다루는 내용</h2>
<ul>
${toc}
</ul>

<p>증상·대처법·안전 기준 등 <strong>자세한 내용 전체</strong>는 아래 원문에서 확인하세요 👇</p>
<p><a href="${url}" target="_blank" rel="noopener"><strong>▶ ${inlineMd(a.title)} — 건강흐름 바로가기</strong></a></p>
`;
}

function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) { console.error("사용: node scripts/factory-publish.js <article.json>"); process.exit(1); }
  const a = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (!a.slug || !a.title || !a.bodyMd) { console.error("slug/title/bodyMd 필수"); process.exit(1); }
  a.date = a.date || new Date().toISOString().slice(0, 10);
  a.category = a.category || "info";
  const photos = (a.photos || []).filter(p => p && p.file);
  const url = BASE + "/posts/" + a.slug + ".html";
  // 글 HTML
  fs.writeFileSync(path.join(ROOT, "posts", a.slug + ".html"), pageHtml(a, photos));
  // posts.js + feeds
  updatePostsJs(a, photos[0] ? photos[0].file : "");
  regenFeeds();
  // 티스토리 요약 HTML 사이드카 파일 (저장소에는 커밋하지 않음)
  const tHtml = buildTistoryHtml(a, url);
  fs.writeFileSync(jsonPath + ".tistory.html", tHtml);
  console.log("발행 생성: posts/" + a.slug + ".html  (" + a.category + ", 사진 " + photos.length + "장)");
  console.log("URL: " + url);
  console.log("티스토리 요약: " + jsonPath + ".tistory.html");
}
main();
