"use strict";
/* =============================================================
   factory-publish-ja.js — 건강 글 일본어(현지화) 발행기
   -------------------------------------------------------------
   한국어 건강 글의 일본어판(현지화) 또는 일본어 전용 글을
   /ja/posts/<slug>.html 로 생성하고 js/ja-posts.js·sitemap·rss 를 갱신한다.
   한국어 원문이 있는 글은 사진(/img/<slug>-N.jpg)을 재사용하고 hreflang(ja⇄ko)을 건다.
   jaOnly 글은 photos 를 직접 지정하고 hreflang 은 ja + x-default(ja)만 둔다.

   사용: node scripts/factory-publish-ja.js <ja-article.json>

   ja-article.json:
   {
     "slug": "roasted-sweet-potato-blood-sugar",
     "titleJa": "...", "seoTitleJa": "...", "descriptionJa": "...(120자 이내)",
     "keywordsJa": ["..."], "category": "season|food|check|korea|info|disease|diet|exercise",
     "date": "2026-11-23",
     "jaOnly": false,                     // true면 한국어 원문 없음(P3 등)
     "points": ["결론1","결론2","결론3"],  // この記事のポイント (선택)
     "bodyJaMd": "## 1. ...\n본문(목차·관련글·면책 제외, FAQ·まとめ 포함)",
     "faq": [{"q":"...","a":"..."}],       // FAQPage JSON-LD (선택)
     "references": [{"label":"厚生労働省 ...","url":"https://..."}],  // 参考文献 (선택)
     "photos": [ {"file":"/img/<slug>-N.jpg","alt":"..."} ]
   }
   ============================================================= */
const fs = require("fs");
const path = require("path");
const F = require("./factory-publish.js"); // parseBlocks·buildBody·esc·BASE·ROOT 재사용
const { parseBlocks, buildBody, esc, BASE, ROOT } = F;

const CATNAMES_JA = {
  food: "健康食", info: "健康情報", disease: "病気", diet: "ダイエット", exercise: "運動",
  season: "季節の健康", check: "セルフチェック", korea: "韓国の健康習慣",
  kbeauty: "Kビューティー・インナーケア", travel: "韓国旅行と健康"
};
const AD_TOP = "3265568294", AD_MID = "1082258087";

function ad(slot) {
  return '<div class="ad-container" aria-label="広告" style="text-align:center;margin:20px 0"><ins class="adsbygoogle" style="display:block" ' +
    'data-ad-client="ca-pub-7143828779500885" data-ad-slot="' + slot +
    '" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
}

/* buildBody 결과 HTML 의 <h2> 에 id 부여 + 목차 항목 수집 */
function addH2Ids(bodyHtml) {
  const toc = [];
  let i = 0;
  const html = bodyHtml.replace(/<h2>([\s\S]*?)<\/h2>/g, function (_, t) {
    i++; const id = "s" + i;
    toc.push({ id: id, text: t.replace(/<[^>]+>/g, "") });
    return '<h2 id="' + id + '">' + t + "</h2>";
  });
  return { html: html, toc: toc };
}
/* 본문 중간(5번째 H2 앞, 없으면 마지막 H2 앞)에 광고 삽입 */
function insertMidAd(bodyHtml) {
  const idxs = []; let m; const re = /<h2\b/g;
  while ((m = re.exec(bodyHtml))) idxs.push(m.index);
  if (idxs.length < 2) return bodyHtml;
  const at = idxs[Math.min(4, idxs.length - 1)];
  return bodyHtml.slice(0, at) + ad(AD_MID) + "\n        " + bodyHtml.slice(at);
}

function tocBox(toc) {
  if (!toc.length) return "";
  return '<nav class="toc-box"><b>目次</b><ol>' +
    toc.map(function (x) { return '<li><a href="#' + x.id + '">' + esc(x.text) + "</a></li>"; }).join("") +
    "</ol></nav>";
}
function pointsBox(points) {
  if (!points || !points.length) return "";
  return '<div class="glance-box"><h2 class="gb-h">この記事のポイント</h2><ul class="pt-list">' +
    points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul></div>";
}
function refBox(refs) {
  if (!refs || !refs.length) return "";
  return '<section class="ref-box"><h2>参考文献</h2><ul>' +
    refs.map(function (r) { return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener nofollow">' + esc(r.label) + "</a></li>"; }).join("") +
    "</ul></section>";
}
/* 같은 카테고리 관련글 3편(부족하면 최신 다른 글로 채움) — 현재 글 제외 */
function relatedBox(slug, category) {
  let JAP = [];
  try { delete require.cache[require.resolve(path.join(ROOT, "js", "ja-posts.js"))]; JAP = require(path.join(ROOT, "js", "ja-posts.js")).JA_POSTS || []; } catch (e) {}
  const others = JAP.filter(function (p) { return p.id !== slug; })
    .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  const same = others.filter(function (p) { return p.category === category; });
  const pick = same.concat(others.filter(function (p) { return p.category !== category; })).slice(0, 3);
  const kSeries = ["korea", "kbeauty", "travel"].indexOf(category) >= 0;
  let cards = "";
  if (kSeries) cards += '<a href="/ja/posts/korea-health-guide.html"><b>韓国の健康・美容・旅行ガイド</b><span>まとめ</span></a>';
  cards += pick.map(function (p) {
    return '<a href="' + esc(p.url) + '"><b>' + esc(p.title) + "</b><span>" + (CATNAMES_JA[p.category] || "健康情報") + "</span></a>";
  }).join("");
  if (!cards) return "";
  return '<section class="related-box"><h2>関連記事</h2><div class="rel-grid">' + cards + "</div></section>";
}
function faqLd(faq) {
  if (!faq || !faq.length) return "";
  const ld = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map(function (f) {
      return { "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: String(f.a).replace(/<[^>]+>/g, "") } };
    })
  };
  return '\n  <script type="application/ld+json">' + JSON.stringify(ld) + "</script>";
}

function pageHtml(a, photos) {
  const catName = CATNAMES_JA[a.category] || "健康情報";
  const seoTitle = a.seoTitleJa || a.titleJa;
  const hero = photos[0];
  const ogImage = hero ? BASE + hero.file : "";
  const kw = (a.keywordsJa || []).join(", ");
  const jaUrl = BASE + "/ja/posts/" + a.slug + ".html";
  const koUrl = BASE + "/posts/" + a.slug + ".html";
  const jaOnly = !!a.jaOnly;

  const hreflang = jaOnly
    ? `  <link rel="alternate" hreflang="ja" href="${jaUrl}">\n  <link rel="alternate" hreflang="x-default" href="${jaUrl}">`
    : `  <link rel="alternate" hreflang="ja" href="${jaUrl}">\n  <link rel="alternate" hreflang="ko" href="${koUrl}">\n  <link rel="alternate" hreflang="x-default" href="${koUrl}">`;

  const articleLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.titleJa, description: a.descriptionJa,
    ...(ogImage ? { image: ogImage } : {}),
    datePublished: a.date, dateModified: a.date, inLanguage: "ja",
    author: { "@type": "Organization", name: "健康フロー編集部" },
    publisher: { "@type": "Organization", name: "健康フロー", url: BASE + "/" },
    mainEntityOfPage: jaUrl
  };

  const built = addH2Ids(buildBody(parseBlocks(a.bodyJaMd), photos));
  const bodyWithAd = insertMidAd(built.html);
  const navRight = jaOnly ? '<a href="/ja/">記事一覧</a>' : `<a href="/ja/">記事一覧</a><a href="${koUrl}">한국어</a>`;
  const koSwitch = jaOnly ? "" : `\n      <a class="ja-switch" href="${koUrl}">🇰🇷 この記事の韓国語版を見る</a>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(seoTitle)} · 健康フロー</title>
  <meta name="description" content="${esc(a.descriptionJa)}">
  <meta name="keywords" content="${esc(kw)}">
  <link rel="canonical" href="${jaUrl}">
${hreflang}

  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(a.titleJa)}">
  <meta property="og:description" content="${esc(a.descriptionJa)}">
  <meta property="og:url" content="${jaUrl}">
  <meta property="og:locale" content="ja_JP">
${ogImage ? `  <meta property="og:image" content="${ogImage}">\n` : ""}  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(a.titleJa)}">
  <meta name="twitter:description" content="${esc(a.descriptionJa)}">
  <meta name="twitter:image" content="${BASE}/social/x/${a.slug}/card_og.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/ja/ja.css?v=1">
  <script type="application/ld+json">
  ${JSON.stringify(articleLd, null, 2).split("\n").join("\n  ")}
  </script>${faqLd(a.faq)}
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7143828779500885" crossorigin="anonymous"></script>
</head>
<body data-cat="${esc(a.category || "info")}">
  <header class="ja-header">
    <div class="in">
      <a class="brand" href="/ja/">健康フロー｜日本語</a>
      <nav>${navRight}</nav>
    </div>
  </header>

  <main class="wrap">
    <article class="article mbti-article">
      <span class="article__cat">${catName}</span>
      <h1 class="article__title">${esc(a.titleJa)}</h1>
      <div class="article__meta">健康フロー編集部 · ${esc(a.date)}</div>${koSwitch}

      ${pointsBox(a.points)}
      ${tocBox(built.toc)}
      ${ad(AD_TOP)}

      <div class="article__body">
${bodyWithAd}
      </div>

      ${refBox(a.references)}
      ${relatedBox(a.slug, a.category)}

      <p class="disclaimer-box">本記事は一般的な健康情報であり、診断・治療の代わりにはなりません。症状が続く場合は医療機関にご相談ください。</p>
      <div class="article__nav"><a class="btn" href="/ja/">‹ 記事一覧へ</a></div>
    </article>
  </main>

  <footer class="ja-footer">
    <p>健康フロー（けんこうフロー）編集部 · 健康・暮らしの情報${jaOnly ? "" : ' · <a href="' + koUrl + '">韓国語版</a>'}</p>
  </footer>

  <script defer src="/js/analytics.js"></script>
  <script>try{(adsbygoogle=window.adsbygoogle||[]).push({});(adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}</script>
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
  const reOld = new RegExp("\\n    \\{ id: \"" + a.slug.replace(/[-]/g, "\\$&") + "\",[^\\n]*\\},", "g");
  s = s.replace(reOld, "");
  const entry = `    { id: ${JSON.stringify(a.slug)}, title: ${JSON.stringify(a.titleJa)}, summary: ${JSON.stringify(a.descriptionJa)}, category: ${JSON.stringify(a.category || "info")}, date: ${JSON.stringify(a.date)}, url: ${JSON.stringify("/ja/posts/" + a.slug + ".html")}, image: ${JSON.stringify(heroFile || "")} },`;
  s = s.replace(/var JA_POSTS = \[\n/, "var JA_POSTS = [\n" + entry + "\n");
  fs.writeFileSync(pf, s);
}

/* 한국어 원문 페이지에 hreflang(양방향) 주입 — 멱등. jaOnly면 건너뜀 */
function injectKoHreflang(slug) {
  const kp = path.join(ROOT, "posts", slug + ".html");
  if (!fs.existsSync(kp)) return false;
  let s = fs.readFileSync(kp, "utf8");
  s = s.replace(/\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, "");
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
  let koMsg = a.jaOnly ? "일본어 전용" : (injectKoHreflang(a.slug) ? "한국어 hreflang 주입" : "한국어 원문 없음");
  F.regenFeeds();
  console.log("일본어 발행: ja/posts/" + a.slug + ".html  (" + a.category + ", 사진 " + photos.length + "장, " + koMsg + ")");
  console.log("URL: " + BASE + "/ja/posts/" + a.slug + ".html");
  // C-4: 발행 직후 X 게시물 세트 자동 생성 (--no-x 로 끔)
  if (!process.argv.includes("--no-x")) {
    try {
      require("child_process").execFileSync(process.execPath,
        [path.join(__dirname, "x-post-gen.js"), a.slug],
        { stdio: "inherit", cwd: ROOT });
    } catch (e) { console.log("[x-post-gen 건너뜀] " + (e && e.message ? e.message : e)); }
  }
}
if (require.main === module) main();
module.exports = { pageHtml: pageHtml, updateJaPostsJs: updateJaPostsJs };
