/* ============================================================
   rates.js — 적용 연도 자동 선택 로더
   오늘 날짜(또는 지정 연도)에 맞는 요율표를 돌려준다.
   계산기는 이 파일만 쓰면 되고, 해가 바뀌어도 코드 수정 불필요.
   - 브라우저: rates.2026.js, rates.2027.js 를 먼저 로드하면 window.RATES = 올해 적용표.
               특정 연도: window.getRates(2027)
   - Node: var rates = require("./rates.js")();  // 올해
           var r2027 = require("./rates.js")(2027);
   ============================================================ */
(function () {
  "use strict";
  var LATEST = 2027; // 가장 최근 보유 연도(새 연도 파일 추가 시 갱신)

  function pick(year) {
    year = year || new Date().getFullYear();
    if (typeof require !== "undefined") {
      if (year >= 2027) return require("./rates.2027.js");
      return require("./rates.2026.js");
    }
    // 브라우저: 전역에서 선택
    if (typeof window !== "undefined") {
      if (year >= 2027 && window.RATES_2027) return window.RATES_2027;
      return window.RATES_2026 || null;
    }
    return null;
  }

  if (typeof module !== "undefined" && module.exports) { module.exports = pick; module.exports.LATEST = LATEST; }
  if (typeof window !== "undefined") {
    window.getRates = pick;
    window.RATES = pick(); // 올해 적용표
  }
})();
