/*
 * 건강흐름 - 홈(메인) 렌더링
 * 이미지1(히어로) + 이미지2(본문 2단) 구성을 POSTS 데이터로 렌더링합니다.
 */
(function () {
  function byDateDesc(a, b) {
    return (b.date || "").localeCompare(a.date || "");
  }
  function postsAll() {
    return (window.POSTS || []).slice().sort(byDateDesc);
  }
  function postsBy(cat) {
    return postsAll().filter(function (p) {
      return p.category === cat;
    });
  }

  /* 카드: 큰 대표기사 */
  function featuredCard(p) {
    if (!p) return "";
    return `
      <a class="feat" href="${p.url}">
        ${thumbHtml(p, "thumb--feat")}
        <h2 class="feat__title">${p.title}</h2>
        <p class="feat__summary">${p.summary}</p>
      </a>`;
  }

  /* 카드: 히어로 우측 상단 (이미지 + 제목) */
  function heroSmall(p) {
    return `
      <a class="hsmall" href="${p.url}">
        ${thumbHtml(p, "thumb--hsmall")}
        <h3 class="hsmall__title">${p.title}</h3>
      </a>`;
  }

  /* 카드: 헤드라인 텍스트 리스트 */
  function headlineItem(p) {
    return `<a class="headline" href="${p.url}">${p.title}</a>`;
  }

  /* 카드: 좌측 기사목록 (썸네일+제목+요약) */
  function listItem(p) {
    return `
      <a class="listitem" href="${p.url}">
        ${thumbHtml(p, "thumb--list")}
        <div class="listitem__body">
          <h3 class="listitem__title">${p.title}</h3>
          <p class="listitem__summary">${p.summary}</p>
        </div>
      </a>`;
  }

  /* 사이드바: 타임라인 */
  function timelineItem(p) {
    const time = (p.date || "").slice(5).replace("-", ".");
    return `
      <a class="tl__item" href="${p.url}">
        <span class="tl__time">${time}</span>
        <span class="tl__dot"></span>
        <span class="tl__title">${p.title}</span>
      </a>`;
  }

  /* 사이드바: 카테고리 그리드 카드 */
  function gridCard(p) {
    return `
      <a class="gcard" href="${p.url}">
        ${thumbHtml(p, "thumb--grid")}
        <span class="gcard__title">${p.title}</span>
      </a>`;
  }

  /* 사이드바: 태그형 리스트 */
  function tagItem(p) {
    return `
      <a class="tagitem" href="${p.url}">
        <span class="tag" style="--c:${catColor(p.category)}">${catName(p.category)}</span>
        <span class="tagitem__title">${p.title}</span>
      </a>`;
  }

  function render() {
    const all = postsAll();
    const foods = postsBy("food");
    const infos = postsBy("info");

    /* ── 히어로 ── */
    const featured = all[0];
    const heroRight = all.slice(1, 3);
    const heroHeadlines = all.slice(3, 8);

    const heroEl = document.getElementById("hero");
    if (heroEl) {
      heroEl.innerHTML = `
        <div class="hero__main">${featuredCard(featured)}</div>
        <div class="hero__side">
          <div class="hero__smalls">${heroRight.map(heroSmall).join("")}</div>
          <div class="hero__headlines">${heroHeadlines.map(headlineItem).join("")}</div>
        </div>`;
    }

    /* ── 본문 좌측: 광고 + 기사목록 ── */
    const listEl = document.getElementById("main-list");
    if (listEl) {
      listEl.innerHTML =
        adUnit("inList", "목록") + all.map(listItem).join("");
    }

    /* ── 사이드바: 타임라인 + 광고 + 카테고리 그리드 + 태그리스트 ── */
    const sideEl = document.getElementById("sidebar");
    if (sideEl) {
      const tl = all.slice(0, 5).map(timelineItem).join("");
      const grid = foods.slice(0, 4).map(gridCard).join("");
      const tags = infos.slice(0, 4).map(tagItem).join("");
      sideEl.innerHTML = `
        <div class="panel">
          <div class="panel__head">📋 건강 타임라인 <span class="badge">건강</span></div>
          <div class="timeline">${tl}</div>
          <a class="panel__more" href="/category.html?cat=info">전체기사 보기 ›</a>
        </div>
        ${adUnit("sidebar", "사이드")}
        <div class="panel">
          <div class="panel__head">건강음식</div>
          <div class="gridcards">${grid}</div>
        </div>
        <div class="panel">
          <div class="panel__head">건강정보</div>
          <div class="taglist">${tags}</div>
        </div>`;
    }

    activateAds();
  }

  document.addEventListener("DOMContentLoaded", render);
})();
