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
// ★ 광고 노출 스위치 ★ (지금은 광고 미노출. 나중에 반영할 때 true 로 바꾸세요)
const ADS_SHOW = false;

const ADSENSE = {
  client: "ca-pub-7143828779500885", // ← 발급받은 게시자 ID
  slots: {
    header: "0000000000",   // 상단 배너
    inList: "0000000000",   // 기사 목록 상단
    sidebar: "0000000000",  // 우측 사이드바
    inArticle: "0000000000",// 글 본문 중간
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
function adUnit(slotKey, label) {
  // ★ 광고 임시 비활성화 ★
  // 나중에 애드센스를 반영할 때 아래 한 줄(return "";)을 지우면 광고가 다시 나옵니다.
  if (!ADS_SHOW) return "";

  if (!adsenseEnabled()) {
    return `<div class="ad ad--placeholder"><span>광고 영역${label ? " · " + label : ""}</span></div>`;
  }
  const slot = (ADSENSE.slots && ADSENSE.slots[slotKey]) || "";
  return `
    <div class="ad">
      <ins class="adsbygoogle"
           style="display:block"
           data-ad-client="${ADSENSE.client}"
           data-ad-slot="${slot}"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>`;
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
        <div class="nav__links">${navLinks}</div>
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
  activateAds();
}
document.addEventListener("DOMContentLoaded", initSite);

window.SITE = SITE;
window.adUnit = adUnit;
window.thumbHtml = thumbHtml;
window.catName = catName;
window.catColor = catColor;
window.activateAds = activateAds;
