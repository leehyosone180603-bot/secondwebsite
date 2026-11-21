/* ============================================================
   lib/loan.js — 대출 상환 계산 공용 모듈 (순수 함수)
   주택담보·전세자금·자동차 할부·카드 할부에서 재사용.
   상환방식: equalPayment(원리금균등) / equalPrincipal(원금균등) / bullet(만기일시)
   거치기간(graceMonths): 그 기간엔 이자만 납부(원금 유지).
   - 브라우저: window.Loan   - Node: require("../js/lib/loan.js")
   ============================================================ */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.Loan = api;
})(function () {
  "use strict";
  function r2(n) { return Math.round(n); }

  // principal 원, annualRatePct 연이율%, months 총개월, type, graceMonths 거치개월
  function schedule(principal, annualRatePct, months, type, graceMonths) {
    var i = annualRatePct / 1200;
    graceMonths = graceMonths || 0;
    if (graceMonths >= months) graceMonths = months - 1;
    var rows = [], bal = principal, totalInterest = 0;
    // 거치: 이자만
    for (var g = 1; g <= graceMonths; g++) {
      var ig = r2(bal * i);
      rows.push({ month: g, payment: ig, principal: 0, interest: ig, balance: r2(bal) });
      totalInterest += ig;
    }
    var pay = months - graceMonths, m, it, pr, amt;
    if (type === "equalPayment") {
      var base = i === 0 ? principal / pay : principal * i * Math.pow(1 + i, pay) / (Math.pow(1 + i, pay) - 1);
      base = r2(base);
      for (m = 1; m <= pay; m++) {
        it = r2(bal * i);
        pr = (m === pay) ? bal : base - it;
        amt = it + pr; bal -= pr;
        rows.push({ month: graceMonths + m, payment: r2(amt), principal: r2(pr), interest: it, balance: Math.max(0, r2(bal)) });
        totalInterest += it;
      }
    } else if (type === "equalPrincipal") {
      var pr0 = principal / pay;
      for (m = 1; m <= pay; m++) {
        it = r2(bal * i);
        pr = (m === pay) ? bal : pr0; bal -= pr;
        rows.push({ month: graceMonths + m, payment: r2(pr + it), principal: r2(pr), interest: it, balance: Math.max(0, r2(bal)) });
        totalInterest += it;
      }
    } else { // bullet 만기일시
      for (m = 1; m <= pay; m++) {
        it = r2(bal * i);
        pr = (m === pay) ? bal : 0; bal -= pr;
        rows.push({ month: graceMonths + m, payment: r2(it + pr), principal: r2(pr), interest: it, balance: Math.max(0, r2(bal)) });
        totalInterest += it;
      }
    }
    return {
      rows: rows,
      totalInterest: r2(totalInterest),
      totalPayment: r2(principal + totalInterest),
      firstPayment: rows.length ? rows[0].payment : 0,
      maxPayment: rows.reduce(function (a, b) { return Math.max(a, b.payment); }, 0)
    };
  }

  // 세 방식 총이자 비교
  function compare(principal, annualRatePct, months, graceMonths) {
    return {
      equalPayment: schedule(principal, annualRatePct, months, "equalPayment", graceMonths).totalInterest,
      equalPrincipal: schedule(principal, annualRatePct, months, "equalPrincipal", graceMonths).totalInterest,
      bullet: schedule(principal, annualRatePct, months, "bullet", graceMonths).totalInterest
    };
  }

  return { schedule: schedule, compare: compare };
});
