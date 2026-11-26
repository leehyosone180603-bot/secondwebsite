/* 주택 재산세 계산기 — 순수 함수.
   과세표준 = 공시가격 × 공정시장가액비율(일반 60% / 1세대1주택 43~45%).
   재산세 본세 = 과표 × 세율 − 누진공제(일반 §111 / 1주택 특례 §111의2).
   + 지방교육세(본세 20%) + (선택) 도시지역분(과표 0.14%). */
(function () {
  "use strict";
  function fairRatio(price, oneHouse, R) {
    var f = R.propertyTaxHousing.fairMarketRatio;
    if (!oneHouse) return f.general;
    if (price <= 300000000) return f.oneHouseUpTo3;
    if (price <= 600000000) return f.oneHouseUpTo6;
    return f.oneHouseOver6;
  }
  function progressive(base, brackets) {
    if (base <= 0) return 0;
    for (var i = 0; i < brackets.length; i++) {
      var b = brackets[i];
      if (b.upTo === null || base <= b.upTo) return Math.max(0, Math.round(base * b.rate / 100 - b.deduction));
    }
    return 0;
  }
  // price: 공시가격, oneHouse: 1세대1주택, includeCity: 도시지역분 포함
  function propertyTax(price, oneHouse, includeCity, R) {
    var P = R.propertyTaxHousing;
    var ratio = fairRatio(price, oneHouse, R);
    var base = Math.round(price * ratio / 100);
    var useSpecial = !!oneHouse && price <= P.specialPriceCeiling;
    var rates = useSpecial ? P.specialRates : P.standardRates;
    var main = progressive(base, rates);
    var edu = Math.round(main * P.localEduTaxRate / 100);
    var city = includeCity ? Math.round(base * P.cityAreaRate / 100) : 0;
    return { ratio: ratio, base: base, useSpecial: useSpecial, main: main, edu: edu, city: city, total: main + edu + city };
  }

  var LOGIC = { fairRatio: fairRatio, progressive: progressive, propertyTax: propertyTax };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.propertyTaxHousing) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var price = TK.num("price");
    if (isNaN(price) || price <= 0) { err.textContent = "공시가격을 입력하세요."; return; }
    var oneHouse = document.getElementById("oneHouse").checked;
    var includeCity = document.getElementById("city").checked;
    var r = LOGIC.propertyTax(price, oneHouse, includeCity, R);
    var rateLabel = (oneHouse ? "1세대 1주택" : "일반") + " · 공정시장가액비율 " + r.ratio + "%" + (r.useSpecial ? " · 특례세율" : "");

    document.getElementById("ptResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.total) + '</span><small>원</small></div><p class="result-sub">예상 재산세 합계 (본세 + 지방교육세' + (includeCity ? ' + 도시지역분' : '') + ')</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>공시가격</th><td>' + f(Math.round(price)) + ' 원</td></tr>' +
      '<tr><th>적용 기준</th><td>' + rateLabel + '</td></tr>' +
      '<tr><th>과세표준</th><td>' + f(r.base) + ' 원</td></tr>' +
      '<tr><th>재산세 본세</th><td>' + f(r.main) + ' 원</td></tr>' +
      '<tr><th>지방교육세 (본세 20%)</th><td>' + f(r.edu) + ' 원</td></tr>' +
      (includeCity ? '<tr><th>도시지역분 (과표 0.14%)</th><td>' + f(r.city) + ' 원</td></tr>' : '') +
      '<tr><th>합계</th><td><strong>' + f(r.total) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 과세표준상한제·세부담상한, 지역자원시설세, 종합부동산세는 반영하지 않은 추정치입니다. 정확한 금액은 위택스·관할 지자체 고지서로 확인하세요.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
