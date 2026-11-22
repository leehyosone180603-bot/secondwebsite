/* 셀러 계산기 공용 UI 헬퍼 (5종 공통): 콤마 입력·값 저장·복사·탭·즉시계산 */
(function (root) {
  "use strict";
  var TABS = [
    { href: "/tools/margin/", label: "마진율" },
    { href: "/tools/china-sourcing/", label: "중국 사입" },
    { href: "/tools/global-margin/", label: "구매대행 마진율" },
    { href: "/tools/cashflow/", label: "현금 흐름" },
    { href: "/tools/rocket-growth/", label: "로켓그로스 마진" }
  ];

  function won(n) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    return Math.round(n).toLocaleString("ko-KR") + "원";
  }
  function wonSigned(n) {
    if (n === null || !isFinite(n)) return "—";
    var s = Math.round(n).toLocaleString("ko-KR") + "원";
    return n < 0 ? s : s;
  }
  function pct(n) {
    if (n === null || n === undefined || !isFinite(n)) return "—";
    return (Math.round(n * 100) / 100).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";
  }
  function yuan(n) {
    if (n === null || !isFinite(n)) return "—";
    return "¥" + (Math.round(n * 100) / 100).toLocaleString("ko-KR");
  }
  function digits(raw) { return (raw || "").toString().replace(/[^0-9]/g, ""); }
  function parseInt0(raw) { var d = digits(raw); return d ? parseInt(d, 10) : 0; }
  function parseDec(raw) {
    var s = (raw || "").toString().replace(/[^0-9.]/g, "");
    var parts = s.split(".");
    if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
    var v = parseFloat(s);
    return isFinite(v) ? v : 0;
  }

  // 금액 입력: 숫자만, 천 단위 콤마 자동
  function bindMoney(el, onChange) {
    if (!el) return;
    el.setAttribute("inputmode", "numeric");
    el.addEventListener("input", function () {
      var v = parseInt0(el.value);
      el.value = v ? v.toLocaleString("ko-KR") : "";
      if (onChange) onChange();
    });
  }
  // 소수 입력(% · 환율): 숫자·소수점 허용
  function bindDecimal(el, onChange) {
    if (!el) return;
    el.setAttribute("inputmode", "decimal");
    el.addEventListener("input", function () {
      var s = el.value.replace(/[^0-9.]/g, "");
      var parts = s.split(".");
      if (parts.length > 2) s = parts[0] + "." + parts.slice(1).join("");
      el.value = s;
      if (onChange) onChange();
    });
  }

  function store(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {}
  }
  function load(key) {
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; }
  }

  function copyText(text, btn) {
    function done() {
      if (!btn) return;
      var old = btn.textContent; btn.textContent = "복사됨 ✓";
      setTimeout(function () { btn.textContent = old; }, 1400);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (e) {}
  }

  // 상단 탭 메뉴 렌더
  function renderTabs(containerId, activeHref) {
    var el = document.getElementById(containerId);
    if (!el) return;
    var html = TABS.map(function (t) {
      var on = t.href === activeHref ? " is-active" : "";
      return '<a class="seller-tab' + on + '" href="' + t.href + '">' + t.label + "</a>";
    }).join("");
    el.innerHTML = html;
  }

  // 하단 '수수료 출처' 목록 렌더
  function renderSources(containerId, sources) {
    var el = document.getElementById(containerId);
    if (!el || !sources) return;
    var items = sources.map(function (s) {
      var link = s.url ? '<a href="' + s.url + '" target="_blank" rel="noopener">공식표 ↗</a>'
                       : (s.note || "판매자센터에서 확인");
      return "<b>" + s.name + "</b> — " + link + " <span>(확인일 " + (s.checkedAt || "") + ")</span>";
    });
    el.innerHTML = "<b>수수료 출처</b><br>" + items.join("<br>");
  }

  function year(id) { var e = document.getElementById(id || "year"); if (e) e.textContent = new Date().getFullYear(); }
  function pushAd() { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {} }

  var api = {
    TABS: TABS, won: won, wonSigned: wonSigned, pct: pct, yuan: yuan,
    parseInt0: parseInt0, parseDec: parseDec, bindMoney: bindMoney, bindDecimal: bindDecimal,
    store: store, load: load, copyText: copyText, renderTabs: renderTabs,
    renderSources: renderSources, year: year, pushAd: pushAd
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SellerUI = api;
})(typeof window !== "undefined" ? window : this);
