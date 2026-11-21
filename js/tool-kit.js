/* ============================================================
   tool-kit.js — 생활 도구 공통 런타임
   의존: js/tools.js (window.TOOLS), js/i18n.js (window.I18N)
   역할: 숫자 입력 콤마/키패드, 결과 복사·초기화·공유URL, 공유바,
         평가(좋아요/아쉬워요), 최근 본 페이지, 관련 도구, 사이드
         위젯, 브레드크럼(+JSON-LD), 언어 선택.
   페이지는 <body data-tool="{slug}"> 로 자신을 알리고,
   DOMContentLoaded 시 ToolKit.init() 가 공통 UI를 채운다.
   계산 로직은 각 도구의 {slug}.js(순수 함수)가 담당한다.
   ============================================================ */
(function () {
  "use strict";
  var ORIGIN = "https://healthfortune.co.kr";
  var TOOLS = (typeof window !== "undefined" && window.TOOLS) || [];
  var I18N = (typeof window !== "undefined" && window.I18N) || { t: function (k) { return k; }, lang: "ko", apply: function () {}, setLang: function () {}, supported: ["ko"] };

  /* ── 레지스트리 헬퍼 ── */
  function pub() { return TOOLS.filter(function (t) { return t.public !== false; }); }
  function byId(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].id === id) return TOOLS[i]; return null; }
  function byCat(c) { return pub().filter(function (t) { return t.category === c; }); }
  function relatedOf(t, max) {
    max = max || 6; var out = [];
    (t.related || []).forEach(function (id) { var r = byId(id); if (r && r.public !== false && out.indexOf(r) < 0) out.push(r); });
    byCat(t.category).forEach(function (r) { if (r.id !== t.id && out.indexOf(r) < 0 && out.length < max) out.push(r); });
    return out.slice(0, max);
  }

  /* ── 숫자 포맷 ── */
  function fmt(n) { if (n === "" || n === null || n === undefined || isNaN(n)) return ""; var s = String(n).split("."); s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return s.join("."); }
  function parse(str) { if (typeof str === "number") return str; var v = String(str == null ? "" : str).replace(/[^0-9.\-]/g, ""); return v === "" || v === "-" ? NaN : parseFloat(v); }

  function wireNumberInputs(root) {
    (root || document).querySelectorAll("input[data-num]").forEach(function (inp) {
      inp.setAttribute("inputmode", "numeric");
      inp.setAttribute("autocomplete", "off");
      inp.addEventListener("input", function () {
        var caretFromEnd = inp.value.length - inp.selectionStart;
        var raw = inp.value.replace(/[^0-9.]/g, "");
        if (raw === "") { inp.value = ""; return; }
        inp.value = fmt(raw);
        try { var pos = inp.value.length - caretFromEnd; inp.setSelectionRange(pos, pos); } catch (e) {}
      });
    });
  }

  /* ── 공유 URL(입력값을 쿼리에 담아 같은 결과 재현) ── */
  function sharedFields(root) { return Array.prototype.slice.call((root || document).querySelectorAll("[data-share]")); }
  function buildShareUrl() {
    var q = [];
    sharedFields().forEach(function (el) {
      var k = el.getAttribute("data-share") || el.id; if (!k) return;
      var v = (el.type === "checkbox") ? (el.checked ? "1" : "") : el.value;
      if (v !== "" && v != null) q.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v).replace(/,/g, "")));
    });
    return ORIGIN + location.pathname + (q.length ? "?" + q.join("&") : "");
  }
  function applyShareParams() {
    var p = new URLSearchParams(location.search); if (![].concat.apply([], [p.keys()]).length && !location.search) return;
    var any = false;
    sharedFields().forEach(function (el) {
      var k = el.getAttribute("data-share") || el.id; if (!k || !p.has(k)) return;
      var v = p.get(k);
      if (el.type === "checkbox") el.checked = (v === "1" || v === "true");
      else { el.value = el.hasAttribute("data-num") ? fmt(v.replace(/[^0-9.]/g, "")) : v; }
      any = true;
    });
    return any;
  }

  /* ── 토스트 ── */
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 1600);
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) { try { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); res(); } catch (e) { rej(e); } });
  }

  /* ── 결과 액션(복사·초기화·공유링크) ── */
  function wireResultActions() {
    document.querySelectorAll('[data-tk="copy"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var sel = btn.getAttribute("data-copy-target") || "#tk-result";
        var el = document.querySelector(sel); if (!el) return;
        copyText((el.innerText || el.textContent || "").trim()).then(function () { toast(I18N.t("copied")); });
      });
    });
    document.querySelectorAll('[data-tk="reset"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll("input[data-share],select[data-share]").forEach(function (el) {
          if (el.type === "checkbox") el.checked = false; else el.value = "";
        });
        var r = document.getElementById("tk-result-card"); if (r) r.hidden = true;
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
      });
    });
    document.querySelectorAll('[data-tk="share"]').forEach(function (btn) {
      btn.addEventListener("click", function () { var u = buildShareUrl(); try { history.replaceState(null, "", u.replace(ORIGIN, "")); } catch (e) {} copyText(u).then(function () { toast(I18N.t("copied")); }); });
    });
  }

  /* ── 공유 바(카카오·X·텔레그램·링크) ── */
  var KAKAO_JS_KEY = ""; // TODO: 카카오 공유 SDK용 JavaScript 키(발급 후 입력). 비어 있으면 링크 복사로 대체.
  function renderShareBar(host, tool) {
    if (!host) return;
    var title = encodeURIComponent((tool ? tool.name : document.title) + " | 건강흐름");
    var getUrl = function () { return encodeURIComponent(buildShareUrl()); };
    host.innerHTML =
      '<span class="share-label">' + I18N.t("shareLabel") + '</span>' +
      '<button class="share-btn kakao" data-s="kakao" title="카카오톡">💬</button>' +
      '<button class="share-btn x" data-s="x" title="X">𝕏</button>' +
      '<button class="share-btn tg" data-s="tg" title="텔레그램">✈️</button>' +
      '<button class="share-btn" data-s="link" title="' + I18N.t("shareLink") + '">🔗</button>';
    host.querySelector('[data-s="x"]').addEventListener("click", function () { window.open("https://twitter.com/intent/tweet?text=" + title + "&url=" + getUrl(), "_blank", "noopener"); });
    host.querySelector('[data-s="tg"]').addEventListener("click", function () { window.open("https://t.me/share/url?url=" + getUrl() + "&text=" + title, "_blank", "noopener"); });
    host.querySelector('[data-s="link"]').addEventListener("click", function () { copyText(buildShareUrl()).then(function () { toast(I18N.t("copied")); }); });
    host.querySelector('[data-s="kakao"]').addEventListener("click", function () {
      if (KAKAO_JS_KEY && window.Kakao) {
        try { if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY); window.Kakao.Share.sendDefault({ objectType: "feed", content: { title: decodeURIComponent(title), description: tool ? tool.desc : "", imageUrl: ORIGIN + "/img/og-default.png", link: { mobileWebUrl: buildShareUrl(), webUrl: buildShareUrl() } } }); return; } catch (e) {}
      }
      copyText(buildShareUrl()).then(function () { toast("카카오 공유키 미설정 — 링크를 복사했어요"); });
    });
  }

  /* ── 평가하기 ── */
  function renderRating(host, tool) {
    if (!host) return;
    var key = "tk_rated_" + (tool ? tool.id : location.pathname);
    var done = null; try { done = localStorage.getItem(key); } catch (e) {}
    function paint() {
      if (done) { host.innerHTML = '<span class="thanks">' + I18N.t("rateThanks") + '</span>'; return; }
      host.innerHTML = '<span class="q">' + I18N.t("rateQ") + '</span><span class="btns">' +
        '<button data-v="up">' + I18N.t("like") + '</button><button data-v="down">' + I18N.t("dislike") + '</button></span>';
      host.querySelectorAll("button").forEach(function (b) {
        b.addEventListener("click", function () {
          done = b.getAttribute("data-v");
          try { localStorage.setItem(key, done); } catch (e) {}
          try { if (window.gtag) window.gtag("event", "tool_rating", { tool_id: tool ? tool.id : "", value: done }); } catch (e) {}
          try { (window.dataLayer = window.dataLayer || []).push({ event: "tool_rating", tool_id: tool ? tool.id : "", value: done }); } catch (e) {}
          paint();
        });
      });
    }
    paint();
    window.addEventListener("tk:langchange", paint);
  }

  /* ── 최근 본 페이지 ── */
  function recordRecent(tool) {
    if (!tool) return;
    try {
      var arr = JSON.parse(localStorage.getItem("tk_recent") || "[]");
      arr = arr.filter(function (id) { return id !== tool.id; });
      arr.unshift(tool.id); arr = arr.slice(0, 5);
      localStorage.setItem("tk_recent", JSON.stringify(arr));
    } catch (e) {}
  }
  function getRecent(excludeId) {
    try { return JSON.parse(localStorage.getItem("tk_recent") || "[]").filter(function (id) { return id !== excludeId; }).map(byId).filter(Boolean); } catch (e) { return []; }
  }

  /* ── 아이템/리스트 렌더 ── */
  function toolLink(t) { return "/" + t.slug + "/"; }
  function relatedItemHtml(t) {
    return '<a class="related-item" href="' + toolLink(t) + '"><span class="ico">' + (t.emoji || "🔧") + '</span>' +
      '<span><span class="t">' + esc(t.name) + '</span><span class="d">' + esc(t.desc || "") + '</span></span></a>';
  }
  function widgetListHtml(list) {
    if (!list.length) return '<li class="empty" data-i18n="none">' + I18N.t("none") + '</li>';
    return list.map(function (t) { return '<li><a href="' + toolLink(t) + '">' + (t.emoji || "🔧") + " " + esc(t.name) + (t.isNew ? ' <span class="badge" data-i18n="newTools">' + I18N.t("newTools") + "</span>" : "") + "</a></li>"; }).join("");
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  /* ── 브레드크럼(+JSON-LD) ── */
  function renderBreadcrumb(host, tool) {
    if (!host || !tool) return;
    var cat = (window.TOOL_CATEGORIES || []).filter(function (c) { return c.id === tool.category; })[0];
    host.innerHTML = '<a href="/">' + I18N.t("home") + '</a><span class="sep">›</span>' +
      '<a href="/tools.html">' + I18N.t("tools") + '</a><span class="sep">›</span>' +
      '<a href="/tools.html#' + tool.category + '">' + (cat ? cat.name : tool.category) + '</a><span class="sep">›</span>' +
      '<span>' + esc(tool.name) + "</span>";
    var ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: I18N.t("home"), item: ORIGIN + "/" },
      { "@type": "ListItem", position: 2, name: I18N.t("tools"), item: ORIGIN + "/tools.html" },
      { "@type": "ListItem", position: 3, name: tool.name, item: ORIGIN + toolLink(tool) }
    ] };
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
  }

  /* ── 언어 선택 ── */
  function renderLangSwitch(host) {
    if (!host) return;
    host.innerHTML = I18N.supported.map(function (l) {
      var nm = { ko: "한국어", en: "EN", ja: "日本語" }[l] || l;
      return '<button data-l="' + l + '" aria-pressed="' + (I18N.lang === l) + '">' + nm + "</button>";
    }).join("");
    host.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        I18N.setLang(b.getAttribute("data-l"));
        host.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-l") === I18N.lang); });
      });
    });
  }

  /* ── 사이드 위젯 ── */
  function fillSide(tool) {
    var pop = document.getElementById("tk-popular");
    if (pop) pop.innerHTML = widgetListHtml(pub().slice(0, 6)); // TODO: 분석 데이터 연동 시 실제 인기순으로
    var nw = document.getElementById("tk-new");
    if (nw) { var news = pub().filter(function (t) { return t.isNew; }); nw.innerHTML = widgetListHtml(news.slice(0, 6)); }
    var rc = document.getElementById("tk-recent");
    if (rc) rc.innerHTML = widgetListHtml(getRecent(tool ? tool.id : null).slice(0, 5));
  }

  /* ── 초기화 ── */
  function init() {
    try { document.documentElement.setAttribute("lang", I18N.lang); } catch (e) {}
    var slug = document.body.getAttribute("data-tool");
    var tool = slug ? (byId(slug) || pub().filter(function (t) { return t.slug === slug; })[0]) : null;

    I18N.apply(document);
    renderLangSwitch(document.getElementById("tk-langswitch"));
    renderBreadcrumb(document.getElementById("tk-breadcrumb"), tool);

    wireNumberInputs(document);
    applyShareParams();
    wireResultActions();
    renderShareBar(document.getElementById("tk-sharebar"), tool);
    renderRating(document.getElementById("tk-rating"), tool);

    if (tool) {
      recordRecent(tool);
      var rel = document.getElementById("tk-related");
      if (rel) rel.innerHTML = '<div class="related-grid">' + relatedOf(tool, 8).map(relatedItemHtml).join("") + "</div>";
    }
    fillSide(tool);
    window.addEventListener("tk:langchange", function () { I18N.apply(document); fillSide(tool); if (tool) { var rel = document.getElementById("tk-related"); if (rel) rel.innerHTML = '<div class="related-grid">' + relatedOf(tool, 8).map(relatedItemHtml).join("") + "</div>"; } });
  }

  /* 공개 API */
  window.ToolKit = {
    init: init,
    fmt: fmt, parse: parse,
    num: function (id) { var el = document.getElementById(id); return el ? parse(el.value) : NaN; },
    val: function (id) { var el = document.getElementById(id); return el ? el.value : ""; },
    toast: toast, copyText: copyText,
    shareUrl: buildShareUrl,
    showResult: function () { var r = document.getElementById("tk-result-card"); if (r) r.hidden = false; },
    byId: byId, related: relatedOf, tools: function () { return pub(); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
