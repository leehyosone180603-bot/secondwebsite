"use strict";
/* ============================================================
   build-tool.js — 도구 페이지 생성기
   레지스트리(js/tools.js) + 스펙(tools-src/{slug}.js) 를 받아
   표준 템플릿으로 /{slug}/index.html 과 /{slug}/{slug}.js 를 만든다.

   사용:
     node scripts/build-tool.js <slug>      한 개 생성
     node scripts/build-tool.js --all       tools-src 의 모든 스펙 생성

   스펙 모듈(tools-src/{slug}.js) 형식:
     module.exports = {
       id,                      // 레지스트리 id 와 동일
       title?, description?, keywords?,   // SEO(없으면 레지스트리/기본값)
       intro?,                  // 상단 안내 문단(HTML)
       inputsHtml,              // 입력 영역(HTML; data-share/data-num 사용)
       resultHtml,              // 결과 스켈레톤(#tk-result 내부 HTML)
       method?,                 // 계산 방법(HTML: 공식 + 요율·구간 표)
       learnMore?: [{h,p}],     // 더 알아보기 카드
       faqs?: [{q,a}],          // 자주 묻는 질문(+ FAQPage JSON-LD)
       sources?: [{name,url}],  // 자료 출처(공식 기관·법령)
       client,                  // 브라우저 로직 파일명(tools-src/내), 기본 "{slug}.client.js"
       appCategory?             // schema applicationCategory
     }
   ============================================================ */
const fs = require("fs");
const path = require("path");
const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://healthfortune.co.kr";
const reg = require(path.join(ROOT, "js", "tools.js"));

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function faqLd(faqs) {
  if (!faqs || !faqs.length) return "";
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return '\n  <script type="application/ld+json">' + JSON.stringify(ld) + "</script>";
}
function appLd(tool, desc, appCat) {
  const ld = { "@context": "https://schema.org", "@type": "WebApplication", name: tool.name, url: ORIGIN + "/" + tool.slug + "/", description: desc, applicationCategory: appCat || "UtilitiesApplication", operatingSystem: "Any", inLanguage: "ko", offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" } };
  return '\n  <script type="application/ld+json">' + JSON.stringify(ld, null, 2).split("\n").join("\n  ") + "</script>";
}

function section(title, i18nKey, inner) {
  return '\n    <section class="card info">\n      <h2 data-i18n="' + i18nKey + '">' + esc(title) + "</h2>\n" + inner + "\n    </section>";
}

function render(tool, spec) {
  const slug = tool.slug;
  const desc = spec.description || tool.desc;
  const title = spec.title || (tool.name + " - " + tool.desc + " | 건강흐름");
  const kw = spec.keywords || (tool.name + ", " + tool.desc);
  const url = ORIGIN + "/" + slug + "/";

  const learn = (spec.learnMore && spec.learnMore.length)
    ? section("더 알아보기", "learnMore", '      <div class="learn-cards">' + spec.learnMore.map(c => '<div class="learn-card"><h4>' + esc(c.h) + "</h4><p>" + c.p + "</p></div>").join("") + "</div>") : "";
  const faq = (spec.faqs && spec.faqs.length)
    ? section("자주 묻는 질문", "faq", spec.faqs.map(f => "      <h3>Q. " + esc(f.q) + "</h3>\n      <p>" + f.a + "</p>").join("\n")) : "";
  const method = spec.method ? section("계산 방법", "method", "      " + spec.method) : "";
  const sources = (spec.sources && spec.sources.length)
    ? section("자료 출처", "sources", '      <ul class="sources-list">' + spec.sources.map(s => '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + " ↗</a></li>").join("") + "</ul>") : "";

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="keywords" content="${esc(kw)}">
  <meta name="robots" content="index, follow">
  <meta property="og:title" content="${esc(tool.name)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="건강흐름">
  <link rel="canonical" href="${url}">${appLd(tool, desc, spec.appCategory)}${faqLd(spec.faqs)}

  <!-- Google AdSense 게시자 ID: ca-pub-7143828779500885 -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7143828779500885"
     crossorigin="anonymous"></script>

  <link rel="stylesheet" href="/style.css?v=14">
  <link rel="stylesheet" href="/tool-kit.css?v=1">
</head>
<body data-tool="${slug}">
  <nav class="back-nav"><a href="/tools.html">← <span data-i18n="tools">생활 도구</span></a></nav>

  <header class="site-header">
    <h1>${tool.emoji || "🔧"} ${esc(tool.name)}</h1>
    <p class="subtitle">${esc(spec.subtitle || tool.desc)}</p>
    <div class="lang-switch" id="tk-langswitch" aria-label="언어 선택"></div>
  </header>

  <div class="container">
    <nav class="breadcrumb" id="tk-breadcrumb" aria-label="위치"></nav>
  </div>

  <div class="ad-container" aria-label="광고">
    <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-7143828779500885" data-ad-slot="0000000000" data-ad-format="auto" data-full-width-responsive="true"></ins>
  </div>

  <main class="container">
    <div class="tool-layout">
      <div class="tool-main">
        <section class="card controls">
          ${spec.intro ? '<div class="intro">' + spec.intro + "</div>\n          " : ""}${spec.inputsHtml || ""}
          <p class="error" id="errorMsg" role="alert"></p>
          <button id="calcBtn" class="btn-primary" type="button" data-i18n="calc">계산하기</button>
        </section>

        <section class="card results" id="tk-result-card" hidden>
          <div id="tk-result">${spec.resultHtml || ""}</div>
          <div class="result-actions">
            <button class="btn-sm" data-tk="copy" data-copy-target="#tk-result"><span data-i18n="copy">결과 복사</span></button>
            <button class="btn-sm" data-tk="share"><span data-i18n="shareLink">공유 링크</span></button>
            <button class="btn-sm" data-tk="reset"><span data-i18n="reset">초기화</span></button>
          </div>
          <p class="footer-notice" style="margin:10px 0 0" data-i18n="disclaimer">참고용 추정치이며 실제 금액과 다를 수 있습니다.</p>
        </section>

        <div class="share-bar" id="tk-sharebar"></div>
        <div class="rating" id="tk-rating"></div>
${method}${learn}${faq}${sources}
        <section class="card info">
          <h2 data-i18n="related">관련 도구</h2>
          <div id="tk-related"></div>
        </section>
      </div>

      <aside class="tool-side">
        <div class="widget"><h3>🔥 <span data-i18n="popular">인기 페이지</span></h3><ul id="tk-popular"></ul></div>
        <div class="widget"><h3>🆕 <span data-i18n="newTools">신규 출시</span></h3><ul id="tk-new"></ul></div>
        <div class="widget"><h3>🕘 <span data-i18n="recent">최근 본 페이지</span></h3><ul id="tk-recent"></ul></div>
        <div class="widget deal"><h3>🏷️ <span data-i18n="deal">할인 정보</span></h3><ul id="tk-deal"><li class="empty" data-i18n="none">아직 없습니다.</li></ul><p class="aff-note" data-i18n="dealNote">※ 일부 링크는 제휴(광고) 링크일 수 있습니다.</p></div>
      </aside>
    </div>
  </main>

  <footer class="site-footer">
    <div class="footer-brand"><span class="footer-logo">${tool.emoji || "🔧"}</span><span class="footer-brandname">건강흐름</span></div>
    <nav class="footer-links"><a href="/">홈</a> · <a href="/tools.html">생활 도구</a> · <a href="/about.html">운영자 소개</a> · <a href="/contact.html">문의하기</a> · <a href="/privacy.html">개인정보처리방침</a> · <a href="/terms.html">이용약관</a> · <a href="mailto:leelin12@naver.com">이메일</a></nav>
    <div class="footer-biz">상호명 굿윌스토어 · 사업자등록번호 631-03-03874 · 대표 이효선 · 주소 부산 사하구 오작로 34<br>연락처 010-2934-1351 · 제휴문의 <a href="mailto:leelin12@naver.com">leelin12@naver.com</a></div>
    <p class="footer-notice">건강흐름의 모든 콘텐츠는 저작권법의 보호를 받으며, 무단 전재·복사·배포를 금합니다.</p>
    <p class="footer-copy">© <span id="year"></span> 건강흐름 (healthfortune.co.kr)</p>
  </footer>

  <script>document.getElementById("year").textContent=new Date().getFullYear();</script>
  <script src="/js/i18n.js"></script>
  <script src="/js/tools.js"></script>
  <script src="/data/rates.2026.js"></script>
  <script src="/data/rates.2027.js"></script>
  <script src="/data/rates.js"></script>
  <script src="/js/tool-kit.js"></script>
${(spec.extraScripts || []).map(function (s) { return '  <script src="' + s + '"></script>'; }).join("\n")}${(spec.extraScripts || []).length ? "\n" : ""}  <script src="/${slug}/${slug}.js?v=1"></script>
</body>
</html>
`;
}

function build(slug) {
  const tool = reg.byId(slug) || reg.TOOLS.filter(t => t.slug === slug)[0];
  if (!tool) throw new Error("레지스트리에 없는 도구: " + slug + " (js/tools.js 에 먼저 등록)");
  const specPath = path.join(ROOT, "tools-src", slug + ".js");
  if (!fs.existsSync(specPath)) throw new Error("스펙 파일 없음: tools-src/" + slug + ".js");
  const spec = require(specPath);
  const clientFile = spec.client || (slug + ".client.js");
  const clientPath = path.join(ROOT, "tools-src", clientFile);
  if (!fs.existsSync(clientPath)) throw new Error("클라이언트 로직 파일 없음: tools-src/" + clientFile);

  const outDir = path.join(ROOT, slug);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), render(tool, spec));
  fs.copyFileSync(clientPath, path.join(outDir, slug + ".js"));
  return "/" + slug + "/";
}

function main() {
  const arg = process.argv[2];
  if (!arg) { console.error("사용: node scripts/build-tool.js <slug> | --all"); process.exit(1); }
  let slugs;
  if (arg === "--all") {
    slugs = fs.readdirSync(path.join(ROOT, "tools-src")).filter(f => /\.js$/.test(f) && !/\.client\.js$/.test(f)).map(f => f.replace(/\.js$/, ""));
  } else slugs = [arg];
  slugs.forEach(s => { try { const u = build(s); console.log("생성: " + u); } catch (e) { console.error("실패(" + s + "): " + e.message); process.exitCode = 1; } });
}
main();
