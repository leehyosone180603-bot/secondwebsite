"use strict";
/* =============================================================
   factory-publish-ja.js — 건강 글 일본어 미러 발행기
   -------------------------------------------------------------
   한국어 건강 글의 일본어 번역본을 /ja/posts/<slug>.html 로 생성하고
   js/ja-posts.js 를 갱신한 뒤 sitemap/rss 를 재생성한다.
   사진은 한국어 글과 동일한 /img/<slug>-N.jpg 를 그대로 재사용한다.

   사용: node scripts/factory-publish-ja.js <ja-article.json>

   ja-article.json 형식:
   {
     "slug": "tangerine-daily-intake",          // 한국어 글과 동일 slug
     "titleJa": "みかんの1日の適量は何個？…",
     "seoTitleJa": "…",                          // <title>용(없으면 titleJa)
     "descriptionJa": "…",                       // meta description(일본어)
     "keywordsJa": ["みかん 適量", …],
     "category": "food",                         // 한국어 글 카테고리
     "date": "2026-11-21",                       // 한국어 글 날짜
     "bodyJaMd": "## …\n日本語本文(マークダウン)",
     "photos": [ {"file":"/img/tangerine-daily-intake-1.jpg","alt":"…(일본어 alt)"} , … ]
   }
   ============================================================= */
const fs = require("fs");
const path = require("path");
const F = require("./factory-publish.js"); // parseBlocks·buildBody·esc·BASE·ROOT 재사용
const { parseBlocks, buildBody, esc, BASE, ROOT } = F;

const CATNAMES_JA = { food: "健康食", info: "健康情報", disease: "病気", diet: "ダイエット", exercise: "運動" };

function pageHtml(a, photos) {
  const catName = CATNAMES_JA[a.category] || "健康情報";
  const seoTitle = a.seoTitleJa || a.titleJa;
  const hero = photos[0];
  const ogImage = hero ? BASE + hero.file : "";
  const kw = (a.keywordsJa || []).join(", ");
  const jaUrl = `${BASE}/ja/posts/${a.slug}.html`;
  const koUrl = `${BASE}/posts/${a.slug}.html`;
  const ld = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.titleJa, description: a.descriptionJa,
    ...(ogImage ? { image: ogImage } : {}),
    datePublished: a.date, dateModified: a.date, inLanguage: "ja",
    author: { "@type": "Organization", name: "健康フロー" },
    publisher: { "@type": "Organization", name: "健康フロー", url: BASE + "/" },
    mainEntityOfPage: jaUrl
  };
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(seoTitle)} · 健康フロー</title>
  <meta name="description" content="${esc(a.descriptionJa)}">
  <meta name="keywords" content="${esc(kw)}">
  <link rel="canonical" href="${jaUrl}">
  <link rel="alternate" hreflang="ja" href="${jaUrl}">
  <link rel="alternate" hreflang="ko" href="${koUrl}">
  <link rel="alternate" hreflang="x-default" href="${koUrl}">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(a.titleJa)}">
  <meta property="og:description" content="${esc(a.descriptionJa)}">
  <meta property="og:url" content="${jaUrl}">
  <meta property="og:locale" content="ja_JP">
${ogImage ? `  <meta property="og:image" content="${ogImage}">\n` : ""}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    body { font-family: "Noto Sans JP", system-ui, sans-serif; }
    .ja-header { background:#fff; border-bottom:1px solid #e6e8eb; }
    .ja-header .in { max-width:900px; margin:0 auto; padding:12px 16px; display:flex; align-items:center; justify-content:space-between; gap:12px; }
    .ja-header a.brand { font-weight:800; color:#1e73be; text-decoration:none; font-size:1.05rem; }
    .ja-header nav a { color:#444; text-decoration:none; font-size:.9rem; margin-left:14px; }
    .ja-header nav a:hover { color:#1e73be; }
    .ja-switch { display:inline-block; margin:0 0 14px; font-size:.86rem; background:#f1f6fb; border:1px solid #d7e6f3; color:#1e73be; border-radius:8px; padding:7px 12px; text-decoration:none; }
    .ja-footer { border-top:1px solid #e6e8eb; margin-top:40px; padding:24px 16px; text-align:center; color:#888; font-size:.85rem; }
    .ja-footer a { color:#888; }
  </style>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7143828779500885" crossorigin="anonymous"></script>
</head>
<body data-cat="${esc(a.category || "info")}">
  <header class="ja-header">
    <div class="in">
      <a class="brand" href="/ja/">健康フロー｜日本語</a>
      <nav><a href="/ja/">記事一覧</a><a href="${koUrl}">한국어</a></nav>
    </div>
  </header>

  <main class="wrap">
    <article class="article">
      <span class="article__cat">${catName}</span>
      <h1 class="article__title">${esc(a.titleJa)}</h1>
      <div class="article__meta">健康フロー · ${esc(a.date)}</div>
      <a class="ja-switch" href="${koUrl}">🇰🇷 この記事の韓国語版を見る</a>

      <div class="article__body">
${buildBody(parseBlocks(a.bodyJaMd), photos)}
      </div>

      <div class="article__nav"><a class="btn" href="/ja/">‹ 記事一覧へ</a></div>
    </article>
  </main>

  <footer class="ja-footer">
    <p>健康フロー（けんこうフロー） · 健康・暮らしの情報</p>
    <p>本記事は情報提供を目的とした参考情報であり、専門的な診断・治療に代わるものではありません。</p>
  </footer>

  <script type="application/ld+json">
  ${JSON.stringify(ld, null, 2).split("\n").join("\n  ")}
  </script>
  <script defer src="/js/analytics.js"></script>
  <script>try{(adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}</script>
</body>
</html>
`;
}

/* js/ja-posts.js 에 엔트리 prepend (중복 slug면 교체) */
function updateJaPostsJs(a, heroFile) {
  const pf = path.join(ROOT, "js", "ja-posts.js");
  let s;
  try { s = fs.readFileSync(pf, "utf8"); }
  catch (e) {
    s = "/* 일본어 건강 미러 글 레지스트리 (factory-publish-ja.js 가 자동 갱신) */\n" +
      "(function (root) {\n  var JA_POSTS = [\n  ];\n" +
      "  if (typeof module !== \"undefined\" && module.exports) module.exports = { JA_POSTS: JA_POSTS };\n" +
      "  else root.JA_POSTS = JA_POSTS;\n})(typeof window !== \"undefined\" ? window : this);\n";
  }
  // 기존 동일 slug 단일 라인 엔트리 제거(멱등)
  const reOld = new RegExp("\\n    \\{ id: \"" + a.slug.replace(/[-]/g, "\\$&") + "\",[^\\n]*\\},", "g");
  s = s.replace(reOld, "");
  const entry = `    { id: ${JSON.stringify(a.slug)}, title: ${JSON.stringify(a.titleJa)}, summary: ${JSON.stringify(a.descriptionJa)}, category: ${JSON.stringify(a.category || "info")}, date: ${JSON.stringify(a.date)}, url: ${JSON.stringify("/ja/posts/" + a.slug + ".html")}, image: ${JSON.stringify(heroFile || "")} },`;
  s = s.replace(/var JA_POSTS = \[\n/, "var JA_POSTS = [\n" + entry + "\n");
  fs.writeFileSync(pf, s);
}

/* 한국어 원문 페이지에 hreflang(양방향) 주입 — 멱등 */
function injectKoHreflang(slug) {
  const kp = path.join(ROOT, "posts", slug + ".html");
  if (!fs.existsSync(kp)) return false;
  let s = fs.readFileSync(kp, "utf8");
  s = s.replace(/\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, ""); // 기존 제거
  const koUrl = `${BASE}/posts/${slug}.html`, jaUrl = `${BASE}/ja/posts/${slug}.html`;
  const block = `\n  <link rel="alternate" hreflang="ko" href="${koUrl}">` +
    `\n  <link rel="alternate" hreflang="ja" href="${jaUrl}">` +
    `\n  <link rel="alternate" hreflang="x-default" href="${koUrl}">`;
  const m = s.match(/(<link rel="canonical"[^>]*>)/);
  if (!m) return false;
  s = s.replace(m[1], m[1] + block);
  fs.writeFileSync(kp, s);
  return true;
}

function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) { console.error("사용: node scripts/factory-publish-ja.js <ja-article.json>"); process.exit(1); }
  const a = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  if (!a.slug || !a.titleJa || !a.bodyJaMd) { console.error("slug/titleJa/bodyJaMd 필수"); process.exit(1); }
  const photos = (a.photos || []).filter(p => p && p.file);
  const outDir = path.join(ROOT, "ja", "posts");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, a.slug + ".html"), pageHtml(a, photos));
  updateJaPostsJs(a, photos[0] ? photos[0].file : "");
  const koOk = injectKoHreflang(a.slug);
  F.regenFeeds(); // 사이트맵에 JA URL 반영
  console.log("일본어 발행: ja/posts/" + a.slug + ".html  (" + a.category + ", 사진 " + photos.length + "장" + (koOk ? ", 한국어 hreflang 주입" : "") + ")");
  console.log("URL: " + BASE + "/ja/posts/" + a.slug + ".html");
}
if (require.main === module) main();
module.exports = { pageHtml: pageHtml, updateJaPostsJs: updateJaPostsJs };
