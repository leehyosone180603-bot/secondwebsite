/*
 * 건강흐름 - 공통 스크립트
 * 헤더 / 푸터 / 광고 / 공통 유틸을 담당합니다.
 * 각 페이지는 이 파일을 먼저 불러온 뒤 페이지별 스크립트를 실행합니다.
 */

/* ────────────────────────────────────────────────────────────
 *  사이트 기본 정보  (푸터/메타에 사용)
 * ──────────────────────────────────────────────────────────── */
const SITE = {
  name: "건강흐름",
  company: "굿윌스토어",
  address: "부산 사하구 오작로 34, 202호",
  tel: "010-2934-1351",
  youthManager: "이효선",
  regDate: "2026-08-13",
  publisher: "이효선",
  email: "leelin12@naver.com",
  adminUrl: "https://www.healthflow.co.kr/admin/adminLoginForm.html",
};

/* ────────────────────────────────────────────────────────────
 *  ★ 애드센스 설정 ★
 *  구글 애드센스 승인 후 발급받은 값으로 아래 두 값을 바꿔주세요.
 *   - ADSENSE.client : "ca-pub-000..." (게시자 ID)
 *   - 각 광고 자리의 slot 번호도 실제 값으로 교체
 *  값이 기본(placeholder) 상태이면 회색 "광고 영역" 박스가 표시됩니다.
 * ──────────────────────────────────────────────────────────── */
// ★ 광고 노출 스위치 ★ (true = 광고 노출)
const ADS_SHOW = true;

/* 애드센스 광고 구성
 *  - 좌우 레일 배너 / 하단 앵커 / 전면(비네트) 광고는 '자동광고(Auto ads)'가 담당합니다.
 *    → 애드센스 대시보드 > 광고 > 사이트 에서 '자동 광고'를 켜면 슬롯 ID 없이 자동 노출됩니다.
 *  - 아래 slots 는 '정확한 위치 고정' 수동 유닛용입니다. 애드센스에서 광고 유닛을 만들어
 *    발급된 슬롯 번호(숫자 10자리)로 교체하면 해당 자리에 광고가 켜집니다.
 *    placeholder(0000000000) 상태면 그 자리는 깨진 빈칸 없이 그냥 생략됩니다.
 */
const ADSENSE = {
  client: "ca-pub-7143828779500885", // 게시자 ID
  slots: {
    header: "0000000000",         // 상단 배너
    inList: "0000000000",         // 기사 목록 상단
    sidebar: "3265568294",        // ★ 우측 사이드바 (정사각형 유닛 재사용 — 전용 슬롯 생기면 교체)
    inArticle: "0000000000",      // 글 본문 중간
    articleBottom: "3265568294",  // ★ 글 하단 정사각형 1
    articleBottom2: "3265568294", // ★ 글 하단 정사각형 2 (동일 유닛 재사용 — 전용 슬롯 생기면 교체)
    bottomBanner: "1082258087",   // ★ 콘텐츠 맨 아래 가로 배너
  },
};

/* 애드센스 client 값이 실제로 설정되었는지 */
function adsenseEnabled() {
  return ADSENSE.client && !/^ca-pub-0+$/.test(ADSENSE.client);
}

/* ────────────────────────────────────────────────────────────
 *  유틸
 * ──────────────────────────────────────────────────────────── */
function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function catName(slug) {
  return (window.CATEGORIES && CATEGORIES[slug] && CATEGORIES[slug].name) || slug;
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

/* 카테고리별 대표 색 (빈 썸네일/태그에 사용) */
const CAT_COLORS = {
  food: "#2f9e6f",
  info: "#2b6cb0",
  exercise: "#dd6b20",
  diet: "#d53f8c",
  disease: "#805ad5",
  life: "#3182ce",
};
function catColor(slug) {
  return CAT_COLORS[slug] || "#4a5568";
}

/* 이미지가 없을 때 카테고리 색상 썸네일 HTML */
function thumbHtml(post, extraClass) {
  const cls = "thumb " + (extraClass || "");
  if (post.image) {
    return `<div class="${cls}"><img src="${post.image}" alt="${post.title}" loading="lazy"></div>`;
  }
  const c = catColor(post.category);
  return `<div class="${cls} thumb--empty" style="--c:${c}"><span>${catName(post.category)}</span></div>`;
}

/* ────────────────────────────────────────────────────────────
 *  광고 유닛 렌더링
 * ──────────────────────────────────────────────────────────── */
function adUnit(slotKey, label, opts) {
  if (!ADS_SHOW) return "";
  opts = opts || {};
  if (!adsenseEnabled()) {
    return `<div class="ad ad--placeholder"><span>광고 영역${label ? " · " + label : ""}</span></div>`;
  }
  const slot = (ADSENSE.slots && ADSENSE.slots[slotKey]) || "";
  // 실제 슬롯 ID가 없으면(placeholder) 깨진 빈 광고 대신 생략
  if (!slot || /^0+$/.test(slot)) return "";
  const fmt = opts.format || "auto";
  const style = opts.maxWidth
    ? `display:block;margin:0 auto;max-width:${opts.maxWidth}px`
    : "display:block";
  return `
    <div class="ad${opts.cls ? " " + opts.cls : ""}">
      <div class="ad__label">광고</div>
      <ins class="adsbygoogle"
           style="${style}"
           data-ad-client="${ADSENSE.client}"
           data-ad-slot="${slot}"
           data-ad-format="${fmt}"
           data-full-width-responsive="true"></ins>
    </div>`;
}

/* 글(article) 페이지에 수동 광고 자리 삽입: 글 하단 정사각형 + 콘텐츠 맨 아래 배너.
   정적 HTML 글에도 적용되도록 JS 로 삽입한다. */
function injectArticleAds() {
  const article = document.querySelector(".article");
  if (!article) return;
  // 글 안에 광고를 직접 배치한 페이지(MBTI 등)는 자동 삽입을 건너뛴다.
  if (article.getAttribute("data-ads") === "manual") return;
  const body = article.querySelector(".article__body");
  if (body) {
    // 글 하단 정사각형 광고 2개 (데스크톱은 나란히, 모바일은 세로)
    const sq1 = adUnit("articleBottom", "글 하단1", { format: "rectangle", maxWidth: 336, cls: "ad--sq" });
    const sq2 = adUnit("articleBottom2", "글 하단2", { format: "rectangle", maxWidth: 336, cls: "ad--sq" });
    if (sq1 || sq2) {
      const wrap = `<div class="ad-squares" style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-start;margin:24px 0">${sq1}${sq2}</div>`;
      body.insertAdjacentHTML("afterend", wrap);
    }
  }
  const main = document.querySelector("main.wrap") || article.parentElement;
  if (main) {
    const html = adUnit("bottomBanner", "하단", { format: "horizontal", cls: "ad--bottom" });
    if (html) main.insertAdjacentHTML("beforeend", html);
  }
}

/* 페이지에 삽입된 애드센스 유닛을 활성화 */
function activateAds() {
  if (!adsenseEnabled()) return;
  document.querySelectorAll("ins.adsbygoogle").forEach(function () {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {}
  });
}

/* ────────────────────────────────────────────────────────────
 *  헤더 (상단 로고/검색 + 카테고리 네비)
 * ──────────────────────────────────────────────────────────── */
function renderHeader() {
  const host = document.getElementById("site-header");
  if (!host) return;

  const active = document.body.getAttribute("data-cat") || "";

  const navLinks = (window.NAV_ORDER || Object.keys(CATEGORIES))
    .map(function (slug) {
      const c = CATEGORIES[slug];
      const isActive = slug === active ? " is-active" : "";
      if (c.ready) {
        return `<a class="nav__link${isActive}" href="/category.html?cat=${slug}">${c.name}</a>`;
      }
      return `<a class="nav__link nav__link--soon${isActive}" href="#" data-soon="1">${c.name}<em>준비중</em></a>`;
    })
    .join("");

  const now = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dateStr =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-` +
    `${String(now.getDate()).padStart(2, "0")} ` +
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} ` +
    `(${days[now.getDay()]})`;

  host.innerHTML = `
    <div class="topbar">
      <div class="wrap topbar__inner">
        <div class="topbar__ad">${adUnit("header", "상단")}</div>
        <h1 class="brand"><a href="/">${SITE.name}</a></h1>
        <form class="search" role="search" onsubmit="return siteSearch(event)">
          <input type="text" id="searchInput" placeholder="검색어를 입력해주세요" aria-label="검색">
          <button type="submit" aria-label="검색">🔍</button>
        </form>
      </div>
    </div>
    <nav class="nav">
      <div class="wrap nav__inner">
        <button class="nav__menu" aria-label="메뉴">☰</button>
        <div class="nav__links">${navLinks}<a class="nav__link nav__link--calc" href="/calculators.html">🧮 계산기</a></div>
        <div class="nav__meta">
          <span class="nav__date">발행일: ${dateStr}</span>
          <span class="nav__auth"><a href="${SITE.adminUrl}">로그인</a> | <a href="${SITE.adminUrl}">회원가입</a></span>
        </div>
      </div>
    </nav>
    <div class="edge" aria-hidden="true"></div>
  `;

  // 준비중 카테고리 안내
  host.querySelectorAll('[data-soon]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      alert("준비중인 카테고리입니다. 곧 찾아뵙겠습니다!");
    });
  });

  // 모바일 메뉴 토글
  const menuBtn = host.querySelector(".nav__menu");
  const links = host.querySelector(".nav__links");
  if (menuBtn && links) {
    menuBtn.addEventListener("click", function () {
      links.classList.toggle("is-open");
    });
  }
}

/* 검색 (간단: 제목/요약에서 일치하는 글로 이동, 없으면 안내) */
function siteSearch(e) {
  e.preventDefault();
  const q = (document.getElementById("searchInput").value || "").trim();
  if (!q) return false;
  const hit = (window.POSTS || []).find(function (p) {
    return (p.title + " " + p.summary).toLowerCase().includes(q.toLowerCase());
  });
  if (hit) {
    location.href = hit.url;
  } else {
    alert(`'${q}' 검색 결과가 없습니다. (글이 추가되면 검색됩니다)`);
  }
  return false;
}

/* ────────────────────────────────────────────────────────────
 *  푸터 (이미지3 구성 + 굿윌스토어 정보)
 * ──────────────────────────────────────────────────────────── */
function renderFooter() {
  const host = document.getElementById("site-footer");
  if (!host) return;

  const links = [
    { t: "사이트 소개", href: "/about.html" },
    { t: "문의하기", href: "/contact.html" },
    { t: "이용약관", href: "/terms.html" },
    { t: "개인정보처리방침", href: "/privacy.html", strong: true },
  ]
    .map(function (l) {
      const strong = l.strong ? " footer__link--strong" : "";
      return `<a class="footer__link${strong}" href="${l.href}">${l.t}</a>`;
    })
    .join("");

  // Copyright 의 'o' 를 관리자 로그인 링크로 (원본 구성 반영)
  const copy = `C<a href="${SITE.adminUrl}" class="footer__adminlink">o</a>pyright by ${SITE.name} All rights reserved.`;

  host.innerHTML = `
    <div class="footer__links"><div class="wrap">${links}</div></div>
    <div class="footer__body">
      <div class="wrap footer__grid">
        <div class="footer__brand">${SITE.name}</div>
        <div class="footer__info">
          <p>
            회사명: ${SITE.company}
            <span class="sep">|</span> 주소: ${SITE.address}
            <span class="sep">|</span> 대표전화: ${SITE.tel}
            <span class="sep">|</span> 청소년보호책임자: ${SITE.youthManager}
          </p>
          <p>
            등록일: ${SITE.regDate}
            <span class="sep">|</span> 발행·편집인: ${SITE.publisher}
            <span class="sep">|</span> E-mail: ${SITE.email}
          </p>
          <p class="footer__copy">${copy}</p>
        </div>
      </div>
    </div>
  `;
}

/* ────────────────────────────────────────────────────────────
 *  초기화
 * ──────────────────────────────────────────────────────────── */
function initSite() {
  renderHeader();
  renderFooter();
  injectArticleAds();
  activateAds();
}
document.addEventListener("DOMContentLoaded", initSite);

window.SITE = SITE;
window.adUnit = adUnit;
window.thumbHtml = thumbHtml;
window.catName = catName;
window.catColor = catColor;
window.activateAds = activateAds;
