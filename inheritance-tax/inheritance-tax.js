/* 상속세 계산기(추정) — 순수 함수.
   과세표준 = 상속재산 − (일괄공제 or 기초+인적) − 배우자공제 − 금융재산공제.
   산출세액 = 과세표준 × 세율 − 누진공제(§26). 납부 = 산출 − 신고세액공제(3%). */
(function () {
  "use strict";
  function progressiveTax(base, R) {
    if (base <= 0) return 0;
    var br = R.inheritGiftTax.brackets;
    for (var i = 0; i < br.length; i++) { var b = br[i]; if (b.upTo === null || base <= b.upTo) return Math.max(0, Math.round(base * b.rate / 100 - b.deduction)); }
    return 0;
  }
  function generalDeduction(childCount, spouseAlone, R) {
    var d = R.inheritDeduction;
    var basicPlus = d.basic + (childCount || 0) * d.child; // 기초 + 자녀공제(간이)
    return spouseAlone ? basicPlus : Math.max(d.lumpSum, basicPlus);
  }
  function financialDeduction(netFinancial, R) {
    var d = R.inheritDeduction;
    if (!netFinancial || netFinancial <= 0) return 0;
    if (netFinancial <= d.financialFullUnder) return Math.round(netFinancial);
    return Math.min(Math.max(Math.round(netFinancial * d.financialRate / 100), d.financialFloor), d.financialMax);
  }
  function inheritanceTax(estate, spouseAlive, childCount, netFinancial, R) {
    var spouseAlone = spouseAlive && (childCount || 0) === 0;
    var gen = generalDeduction(childCount, spouseAlone, R);
    var spouseDed = spouseAlive ? R.inheritDeduction.spouseMin : 0;
    var finDed = financialDeduction(netFinancial, R);
    var base = Math.max(0, estate - gen - spouseDed - finDed);
    var calc = progressiveTax(base, R);
    var credit = Math.round(calc * R.inheritGiftTax.filingCredit / 100);
    return { general: gen, spouse: spouseDed, financial: finDed, base: base, calcTax: calc, filingCredit: credit, payable: calc - credit };
  }

  var LOGIC = { progressiveTax: progressiveTax, generalDeduction: generalDeduction, financialDeduction: financialDeduction, inheritanceTax: inheritanceTax };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.inheritDeduction) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var estate = TK.num("estate");
    if (isNaN(estate) || estate < 0) { err.textContent = "상속재산 가액을 입력하세요."; return; }
    var spouse = document.getElementById("spouseAlive").checked;
    var children = TK.num("children"); if (isNaN(children) || children < 0) children = 0;
    var fin = TK.num("financial"); if (isNaN(fin)) fin = 0;
    var r = LOGIC.inheritanceTax(estate, spouse, children, fin, R);

    document.getElementById("itResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.payable) + '</span><small>원</small></div><p class="result-sub">납부할 상속세 (신고세액공제 3% 반영)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>상속재산 가액</th><td>' + f(Math.round(estate)) + ' 원</td></tr>' +
      '<tr><th>일괄/기초+인적 공제</th><td>-' + f(r.general) + ' 원</td></tr>' +
      (r.spouse ? '<tr><th>배우자 상속공제(최소)</th><td>-' + f(r.spouse) + ' 원</td></tr>' : '') +
      (r.financial ? '<tr><th>금융재산 상속공제</th><td>-' + f(r.financial) + ' 원</td></tr>' : '') +
      '<tr><th>과세표준</th><td>' + f(r.base) + ' 원</td></tr>' +
      '<tr><th>산출세액</th><td>' + f(r.calcTax) + ' 원</td></tr>' +
      '<tr><th>신고세액공제(3%)</th><td>-' + f(r.filingCredit) + ' 원</td></tr>' +
      '<tr><th>납부세액</th><td><strong>' + f(r.payable) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      (r.payable === 0 ? '<p class="footer-notice" style="margin:8px 0 0">공제가 상속재산보다 커서 납부할 상속세가 없습니다.</p>' : '') +
      '<p class="footer-notice" style="margin:8px 0 0">※ 간이 추정입니다. 배우자공제는 최소 5억만 반영(실제 최대 30억), 동거주택·연로자·장애인공제, 사전증여 합산, 가업상속 등은 미반영. 정확한 금액은 세무 전문가·홈택스로 확인하세요.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
