/* 나이·출생연도 클러스터: 허브 페이지 생성 + 각 글에 정적 교차링크 블록 주입(내부링크 강화). 멱등. */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");

const CLUSTER = [
  { slug: "age-table-2026",        label: "2026 나이표 — 출생연도별 만 나이·띠",        desc: "출생연도만 알면 올해 만 나이와 띠가 바로 나오는 조견표." },
  { slug: "birth-year-guide",      label: "몇년생 계산기 — 나이로 출생연도·띠 찾기",      desc: "만 나이·세는 나이로 태어난 해와 띠를 역산." },
  { slug: "milestone-ages",        label: "환갑·진갑·칠순·팔순·구순은 몇 살?",            desc: "나이별 기념 명칭과 해당 나이를 한눈에." },
  { slug: "birthyear-to-hakbeon",  label: "몇년생 몇 학번? 출생연도–학번 환산표",         desc: "재수·빠른년생까지 포함한 학번 환산." },
  { slug: "zodiac-year-age",       label: "십이지 띠로 나이·몇년생 찾기",                 desc: "내 띠가 올해 몇 살인지, N띠는 몇년생인지." },
  { slug: "senior-benefits-age",   label: "지하철 무임·경로우대 나이 (만 65세)",          desc: "경로우대·지하철 무임승차 등 만 65세 혜택 기준." },
  { slug: "pension-start-age",     label: "국민연금 수급 개시 나이",                     desc: "출생연도별 노령연금을 받기 시작하는 나이." },
  { slug: "rrn-age-decode",        label: "주민등록번호로 나이·성별 알아내기",            desc: "뒷자리 첫 숫자로 출생연도·성별 해석." },
  { slug: "elementary-school-age", label: "초등학교 입학 나이 — 몇년생이 몇 년에?",        desc: "취학 연도와 빠른년생 기준 정리." },
  { slug: "fast-year-birth",       label: "빠른 년생 학년·나이 완전정리",                 desc: "빠른 05·06년생의 학년·나이 계산." },
];
const CALCS = [
  { u: "/age/", t: "만 나이 계산기" },
  { u: "/birth-year/", t: "몇년생·띠 계산기" },
  { u: "/calculators.html", t: "계산기 모음" },
];
const HUB_URL = "/age-guide.html";
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- 1) 각 글 하단 정적 교차링크 블록 ---------- */
function clusterBlock(currentSlug) {
  const items = CLUSTER.filter(c => c.slug !== currentSlug);
  const lis = items.map(c => `<li><a href="/posts/${c.slug}.html">${esc(c.label)}</a></li>`).join("");
  const calcs = CALCS.map(c => `<a class="acl-calc" href="${c.u}">🧮 ${esc(c.t)}</a>`).join("");
  return `
      <section class="age-cluster-links" aria-label="나이·출생연도 관련 글">
        <h2>🎂 나이·출생연도 글 전체 보기</h2>
        <p class="acl-sub">헷갈리는 나이·학번·띠·혜택 기준을 주제별로 모았습니다. 위 계산기로 내 생년월일을 넣어보고, 더 궁금한 주제를 눌러보세요.</p>
        <ul class="acl-list">${lis}</ul>
        <div class="acl-calcs">${calcs}</div>
        <p class="acl-hub"><a href="${HUB_URL}"><b>📚 나이·출생연도 완전정리 허브 바로가기 ›</b></a></p>
        <p class="acl-fresh">기준일 <span class="js-today">오늘</span> · <span class="js-year">올해</span>년 나이는 위 계산기로 항상 최신으로 확인하세요.</p>
      </section>`;
}
const BLOCK_CSS = `
  <style>
    .age-cluster-links{margin:34px 0 10px;padding:18px 18px 16px;border:1px solid var(--line,#e2e6ee);border-radius:14px;background:var(--panel,#f8fafc)}
    .age-cluster-links h2{font-size:1.1rem;margin:0 0 6px}
    .age-cluster-links .acl-sub{color:#667085;font-size:.9rem;margin:0 0 12px}
    .age-cluster-links .acl-list{list-style:none;padding:0;margin:0 0 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:6px 16px}
    .age-cluster-links .acl-list li{position:relative;padding-left:14px;line-height:1.7}
    .age-cluster-links .acl-list li::before{content:"›";position:absolute;left:0;color:#1e73be;font-weight:800}
    .age-cluster-links .acl-list a{color:#1f2430;text-decoration:none;font-size:.94rem;font-weight:600}
    .age-cluster-links .acl-list a:hover{color:#1e73be;text-decoration:underline}
    .age-cluster-links .acl-calcs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px}
    .age-cluster-links .acl-calc{display:inline-block;background:#e9f2fd;color:#1a4fd0;font-weight:700;font-size:.86rem;padding:7px 13px;border-radius:999px;text-decoration:none}
    .age-cluster-links .acl-hub{margin:4px 0 0}
    .age-cluster-links .acl-hub a{color:#1a4fd0;text-decoration:none;font-size:.95rem}
    .age-cluster-links .acl-fresh{color:#8a93a3;font-size:.78rem;margin:8px 0 0}
    @media (prefers-color-scheme:dark){.age-cluster-links{background:#161b26;border-color:#263040}.age-cluster-links .acl-list a{color:#e7ebf3}.age-cluster-links .acl-calc{background:#1a2746;color:#a9c4ff}}
  </style>`;

function injectIntoPosts() {
  const out = [];
  for (const c of CLUSTER) {
    const f = path.join(ROOT, "posts", c.slug + ".html");
    let h = fs.readFileSync(f, "utf8");
    // 재주입을 위해 기존 블록 제거
    h = h.replace(/\n?\s*<style>\s*\n\s*\.age-cluster-links[\s\S]*?<\/style>/, "");
    h = h.replace(/\n?\s*<section class="age-cluster-links"[\s\S]*?<\/section>/, "");
    // </article> 바로 앞에 블록 삽입
    const marker = "    </article>";
    const idx = h.lastIndexOf(marker);
    if (idx < 0) { out.push(c.slug + ":NO-ARTICLE-END"); continue; }
    h = h.slice(0, idx) + clusterBlock(c.slug) + "\n" + h.slice(idx);
    // CSS를 </head> 앞에 1회
    if (!/\.age-cluster-links\{/.test(h)) h = h.replace("</head>", BLOCK_CSS + "\n</head>");
    fs.writeFileSync(f, h);
    out.push(c.slug + ":OK");
  }
  return out;
}

/* ---------- 2) 허브 페이지 ---------- */
function buildHub() {
  const cards = CLUSTER.map(c =>
    `      <a class="ag-card" href="/posts/${c.slug}.html"><span class="ag-t">${esc(c.label)}</span><span class="ag-d">${esc(c.desc)}</span></a>`
  ).join("\n");
  const calcChips = CALCS.map(c => `<a class="ag-calc" href="${c.u}">🧮 ${esc(c.t)}</a>`).join("");
  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>나이·출생연도·학번 완전정리 — 만 나이·띠·환갑·경로우대 한눈에 | 건강흐름</title>
  <meta name="description" content="만 나이·연 나이·띠·학번·환갑·칠순·경로우대(만 65)·국민연금 개시 나이까지, 헷갈리는 나이와 출생연도 기준을 주제별로 모은 허브입니다. 생년월일 계산기도 함께.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://healthfortune.co.kr${HUB_URL}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="나이·출생연도·학번 완전정리 | 건강흐름">
  <meta property="og:description" content="만 나이·띠·학번·환갑·경로우대·국민연금 나이를 한곳에. 생년월일 통합 계산기 포함.">
  <meta property="og:url" content="https://healthfortune.co.kr${HUB_URL}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7143828779500885" crossorigin="anonymous"></script>
  <style>
    .ag-wrap{max-width:960px;margin:0 auto;padding:22px 16px 56px}
    .ag-hero h1{font-size:1.6rem;margin:0 0 8px;line-height:1.3}
    .ag-hero p{color:#5a6372;line-height:1.75;margin:0 0 4px}
    .ag-sec-h{font-size:1.15rem;margin:26px 0 12px;padding-left:10px;border-left:4px solid #1e73be}
    .ag-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .ag-card{display:flex;flex-direction:column;gap:5px;padding:15px 16px;border:1px solid #e2e6ee;border-radius:13px;background:#fff;text-decoration:none;color:inherit;box-shadow:0 2px 10px rgba(30,45,80,.05);transition:transform .12s,box-shadow .12s}
    .ag-card:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(30,45,80,.12)}
    .ag-card .ag-t{font-weight:700;font-size:1rem;color:#1f2430;line-height:1.4}
    .ag-card .ag-d{font-size:.86rem;color:#667085;line-height:1.55}
    .ag-calcs{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
    .ag-calc{display:inline-block;background:#e9f2fd;color:#1a4fd0;font-weight:700;font-size:.9rem;padding:8px 15px;border-radius:999px;text-decoration:none}
    @media (prefers-color-scheme:dark){
      .ag-card{background:#161b26;border-color:#263040}.ag-card .ag-t{color:#e7ebf3}
      .ag-calc{background:#1a2746;color:#a9c4ff}.ag-hero p{color:#9aa6b6}
    }
  </style>
</head>
<body>
  <header id="site-header"></header>
  <main class="ag-wrap">
    <nav class="crumbs" style="font-size:.85rem;color:#8a93a3;margin-bottom:10px"><a href="/">홈</a> · 나이·출생연도 완전정리</nav>
    <div class="ag-hero">
      <h1>🎂 나이·출생연도·학번 완전정리</h1>
      <p>만 나이·연 나이·띠부터 학번, 환갑·칠순, 경로우대(만 65), 국민연금 개시 나이까지 — 헷갈리는 나이와 출생연도 기준을 한곳에 모았습니다.</p>
      <p>아래 계산기에 <b>생년월일</b>을 넣으면 내 나이·띠·이정표가 한 번에 나옵니다.</p>
      <p style="font-size:.82rem;color:#8a93a3;margin-top:6px">기준일 <span class="js-today">오늘</span> · <span class="js-year">올해</span>년 기준 자동 최신</p>
    </div>

    <div class="age-widget" data-related='[{"href":"/posts/age-table-2026.html","t":"2026 나이표"},{"href":"/posts/milestone-ages.html","t":"환갑·칠순 나이"},{"href":"/posts/birthyear-to-hakbeon.html","t":"출생연도↔학번"},{"href":"/posts/senior-benefits-age.html","t":"경로우대 나이"},{"href":"/posts/pension-start-age.html","t":"국민연금 나이"},{"href":"/posts/zodiac-year-age.html","t":"띠로 나이 찾기"}]'></div>

    <h2 class="ag-sec-h">주제별 글</h2>
    <div class="ag-grid">
${cards}
    </div>

    <h2 class="ag-sec-h">바로 쓰는 계산기</h2>
    <div class="ag-calcs">${calcChips}</div>
  </main>
  <footer id="site-footer"></footer>
  <script src="/js/posts.js"></script>
  <script src="/js/site.js"></script>
  <script defer src="/js/age-widget.js"></script>
  <script defer src="/js/analytics.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, "age-guide.html"), html);
  return "age-guide.html:OK";
}

console.log(injectIntoPosts().join("\n"));
console.log(buildHub());
