/* ============================================================
   lib/interest.js — 이자 계산 공용 모듈 (순수 함수)
   예적금·대출·정부정책 계산기에서 재사용한다.
   - 브라우저: window.Interest
   - Node: require("../js/lib/interest.js")
   금리 단위는 연이율(%). 기간은 개월. 금액은 원.
   ============================================================ */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.Interest = api;
})(function () {
  "use strict";

  function r2(n) { return Math.round(n); }

  // 예금 단리: 이자 = 원금 × 연이율 × 기간/12
  function simple(principal, annualRatePct, months) {
    var interest = principal * (annualRatePct / 100) * (months / 12);
    return { principal: r2(principal), interest: r2(interest), total: r2(principal + interest) };
  }
  // 예금 월복리: 원리금 = 원금 × (1 + r/12)^months
  function monthlyCompound(principal, annualRatePct, months) {
    var i = annualRatePct / 1200;
    var fv = principal * Math.pow(1 + i, months);
    return { principal: r2(principal), interest: r2(fv - principal), total: r2(fv) };
  }
  // 적금 단리(매월 초 납입): 이자 = 월납 × (r/12/100) × n(n+1)/2
  function recurringSimple(monthly, annualRatePct, months) {
    var principal = monthly * months;
    var interest = monthly * (annualRatePct / 1200) * months * (months + 1) / 2;
    return { principal: r2(principal), interest: r2(interest), total: r2(principal + interest) };
  }
  // 적금 월복리(매월 초 납입): FV = 월납 × (1+i) × ((1+i)^n − 1)/i
  function recurringCompound(monthly, annualRatePct, months) {
    var i = annualRatePct / 1200;
    var principal = monthly * months;
    var fv = i === 0 ? principal : monthly * (1 + i) * (Math.pow(1 + i, months) - 1) / i;
    return { principal: r2(principal), interest: r2(fv - principal), total: r2(fv) };
  }
  // 이자과세: mode general(15.4%) / preferential(9.5%) / none(0%)
  function applyTax(interest, mode) {
    var rate = mode === "none" ? 0 : (mode === "preferential" ? 9.5 : 15.4);
    var tax = r2(interest * rate / 100);
    return { rate: rate, tax: tax, net: r2(interest - tax) };
  }
  // 종합: 예금/적금 × 단리/복리 + 세금 → 세후 수령액
  function deposit(kind, mode2, amount, annualRatePct, months, taxMode) {
    var base;
    if (kind === "recurring") base = (mode2 === "compound") ? recurringCompound(amount, annualRatePct, months) : recurringSimple(amount, annualRatePct, months);
    else base = (mode2 === "compound") ? monthlyCompound(amount, annualRatePct, months) : simple(amount, annualRatePct, months);
    var t = applyTax(base.interest, taxMode);
    return { principal: base.principal, interest: base.interest, tax: t.tax, taxRate: t.rate, afterTaxInterest: t.net, total: base.principal + t.net };
  }

  return { simple: simple, monthlyCompound: monthlyCompound, recurringSimple: recurringSimple, recurringCompound: recurringCompound, applyTax: applyTax, deposit: deposit };
});
