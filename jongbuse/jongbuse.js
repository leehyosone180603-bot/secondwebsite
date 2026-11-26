/* 종합부동산세(주택) 계산기 — 순수 함수.
   과세표준 = (공시가격 합계 − 공제액) × 공정시장가액비율(60%).
   산출세액 = 과표 × 세율 − 누진공제(2주택 이하, 종부세법 §9).
   1세대1주택은 고령자+장기보유 세액공제(합산 최대 80%). + 농어촌특별세 20%.
   ※ 재산세 중복분 공제는 미반영(추정치). */
(function () {
  "use strict";
  function progressive(base, brackets) {
    if (base <= 0) return 0;
    for (var i = 0; i < brackets.length; i++) {
      var b = brackets[i];
      if (b.upTo === null || base <= b.upTo) return Math.max(0, Math.round(base * b.rate / 100 - b.deduction));
    }
    return 0;
  }
  function tierRate(list, keyName, val) {
    // list: 내림차순 임계값 배열, keyName: "age" | "years"
    for (var i = 0; i < list.length; i++) { if (val >= list[i][keyName]) return list[i].rate; }
    return 0;
  }
  // priceSum: 공시가격 합계, oneHouse, age, holdYears
  function jongbuse(priceSum, oneHouse, age, holdYears, R) {
    var C = R.comprehensiveTax;
    var ded = oneHouse ? C.deductionOneHouse : C.deductionGeneral;
    var base = Math.max(0, Math.round((priceSum - ded) * C.fairMarketRatio / 100));
    var calcTax = progressive(base, C.rates2OrLess);
    var elderly = 0, longHold = 0, credit = 0;
    if (oneHouse) {
      elderly = tierRate(C.elderlyCredit, "age", age || 0);
      longHold = tierRate(C.longHoldCredit, "years", holdYears || 0);
      credit = Math.min(elderly + longHold, C.creditCap);
    }
    var afterCredit = Math.round(calcTax * (100 - credit) / 100);
    var rural = Math.round(afterCredit * C.ruralTaxRate / 100);
    return { deduction: ded, base: base, calcTax: calcTax, elderly: elderly, longHold: longHold, credit: credit, afterCredit: afterCredit, rural: rural, total: afterCredit + rural };
  }

  var LOGIC = { progressive: progressive, tierRate: tierRate, jongbuse: jongbuse };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }
  function syncOne() {
    var on = document.getElementById("oneHouse").checked;
    var row = document.getElementById("creditRow");
    if (row) row.style.display = on ? "" : "none";
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.comprehensiveTax) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var price = TK.num("price");
    if (isNaN(price) || price <= 0) { err.textContent = "공시가격 합계를 입력하세요."; return; }
    var oneHouse = document.getElementById("oneHouse").checked;
    var age = oneHouse ? (TK.num("age") || 0) : 0;
    var years = oneHouse ? (TK.num("years") || 0) : 0;
    var r = LOGIC.jongbuse(price, oneHouse, age, years, R);

    if (r.base <= 0) {
      document.getElementById("jbResult").innerHTML =
        '<div class="result-hero"><div class="big"><span>0</span><small>원</small></div><p class="result-sub">공제액(' + f(r.deduction) + '원) 이하라 종합부동산세 대상이 아닙니다</p></div>' +
        '<p class="footer-notice" style="margin:8px 0 0">※ 공시가격 합계가 ' + (oneHouse ? '1세대 1주택 공제 12억' : '공제 9억') + ' 원을 넘지 않으면 종부세가 없습니다. 재산세는 별도로 부과됩니다.</p>';
      TK.showResult(); return;
    }
    var rows =
      '<tr><th>공시가격 합계</th><td>' + f(Math.round(price)) + ' 원</td></tr>' +
      '<tr><th>공제액</th><td>-' + f(r.deduction) + ' 원 (' + (oneHouse ? '1세대 1주택 12억' : '9억') + ')</td></tr>' +
      '<tr><th>과세표준 (× 60%)</th><td>' + f(r.base) + ' 원</td></tr>' +
      '<tr><th>산출세액</th><td>' + f(r.calcTax) + ' 원</td></tr>';
    if (oneHouse && r.credit > 0) rows += '<tr><th>세액공제 (고령 ' + r.elderly + '% + 장기 ' + r.longHold + '% = ' + r.credit + '%)</th><td>-' + f(r.calcTax - r.afterCredit) + ' 원</td></tr>';
    rows +=
      '<tr><th>종합부동산세</th><td>' + f(r.afterCredit) + ' 원</td></tr>' +
      '<tr><th>농어촌특별세 (20%)</th><td>' + f(r.rural) + ' 원</td></tr>' +
      '<tr><th>합계</th><td><strong>' + f(r.total) + ' 원</strong></td></tr>';

    document.getElementById("jbResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.total) + '</span><small>원</small></div><p class="result-sub">예상 종합부동산세 + 농어촌특별세</p></div>' +
      '<table class="calc-table"><tbody>' + rows + '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 재산세 중복분 공제, 3주택 이상 중과, 세부담상한, 합산배제 등은 반영하지 않은 추정치입니다. 정확한 금액은 국세청 홈택스 고지서로 확인하세요.</p>';
    TK.showResult();
  }

  document.getElementById("oneHouse").addEventListener("change", syncOne);
  document.getElementById("calcBtn").addEventListener("click", calc);
  syncOne();
  if (location.search) window.ToolKit.ready(calc);
})();
