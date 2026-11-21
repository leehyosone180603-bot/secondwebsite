/* 퍼센트 계산기 — 브라우저 로직.
   순수 계산 함수는 Node(테스트)에서도 쓸 수 있게 분리 export 한다.
   DOM 조작은 브라우저에서만 실행(ToolKit 공통 런타임 사용). */
(function () {
  "use strict";

  /* ── 순수 함수(테스트 대상) ── */
  function percentOf(base, pct) { return base * pct / 100; }               // X의 Y%
  function whatPercent(part, whole) { return whole === 0 ? NaN : part / whole * 100; } // part는 whole의 몇 %
  function changePct(from, to) { return from === 0 ? NaN : (to - from) / from * 100; } // 증감률(%)
  function round2(n) { return Math.round(n * 100) / 100; }

  var LOGIC = { percentOf: percentOf, whatPercent: whatPercent, changePct: changePct, round2: round2 };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return; // Node 환경이면 여기서 끝

  /* ── 브라우저 DOM 로직 ── */
  function render() {
    var base = window.ToolKit.num("base");
    var pct = window.ToolKit.num("pct");
    var err = document.getElementById("errorMsg");
    if (isNaN(base) || isNaN(pct)) { err.textContent = "기준값 X와 비율 Y(%)를 모두 입력하세요."; return; }
    err.textContent = "";
    var fmt = window.ToolKit.fmt;
    var v = percentOf(base, pct);
    document.getElementById("rMain").textContent = fmt(round2(v));
    document.getElementById("rExpr").textContent = fmt(base) + " 의 " + fmt(pct) + "% 는";
    document.getElementById("rInc").textContent = fmt(round2(base + v));
    document.getElementById("rDec").textContent = fmt(round2(base - v));
    window.ToolKit.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", render);
  ["base", "pct"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("keydown", function (e) { if (e.key === "Enter") render(); });
  });
  if (location.search) window.ToolKit.ready(render);
})();
