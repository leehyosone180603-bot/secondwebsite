/*
 * 건강흐름 - 카테고리 페이지 렌더링
 * /category.html?cat=food  또는  ?cat=info
 */
(function () {
  function render() {
    const cat = getParam("cat") || "food";
    const meta = (window.CATEGORIES || {})[cat];
    document.body.setAttribute("data-cat", cat);

    const titleEl = document.getElementById("cat-title");
    const listEl = document.getElementById("cat-list");
    if (titleEl) {
      titleEl.textContent = (meta ? meta.name : "카테고리");
      document.title = `${meta ? meta.name : "카테고리"} · ${SITE.name}`;
    }

    // 준비중 카테고리 처리
    if (!meta || !meta.ready) {
      if (listEl) {
        listEl.innerHTML = `
          <div class="empty">
            <p>🚧 <strong>${meta ? meta.name : ""}</strong> 카테고리는 준비중입니다.</p>
            <p>곧 알찬 콘텐츠로 찾아뵙겠습니다.</p>
            <a class="btn" href="/">홈으로</a>
          </div>`;
      }
      activateAds();
      return;
    }

    const posts = (window.POSTS || [])
      .filter(function (p) { return p.category === cat; })
      .sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });

    if (listEl) {
      if (!posts.length) {
        listEl.innerHTML = `<div class="empty"><p>아직 등록된 글이 없습니다.</p></div>`;
      } else {
        const items = posts
          .map(function (p) {
            return `
              <a class="listitem" href="${p.url}">
                ${thumbHtml(p, "thumb--list")}
                <div class="listitem__body">
                  <span class="listitem__cat" style="--c:${catColor(p.category)}">${catName(p.category)}</span>
                  <h3 class="listitem__title">${p.title}</h3>
                  <p class="listitem__summary">${p.summary}</p>
                  <span class="listitem__date">${p.date}</span>
                </div>
              </a>`;
          })
          .join("");
        listEl.innerHTML = adUnit("inList", "목록") + items;
      }
    }
    activateAds();
  }

  document.addEventListener("DOMContentLoaded", render);
})();
