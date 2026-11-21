/* 연봉 실수령액 계산기 — 로직 + 순수 함수.
   4대보험(정확) + 소득세(연말정산 기준: §47 근로소득공제·인적공제·보험료공제
   ·§55 세율·§59 근로소득세액공제·§59의2 자녀세액공제)로 계산.
   ※ 매월 원천징수(간이세액표)와는 다소 차이가 있으며 연말정산에서 정산됨. */
(function () {
  "use strict";

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

  // 근로소득공제 (연 총급여 tg)
  function earnedDeduction(tg, R) {
    var E = R.earnedIncomeDeduction, d = 0;
    for (var i = 0; i < E.brackets.length; i++) {
      var b = E.brackets[i];
      if (b.upTo === null || tg <= b.upTo) { d = b.base + (tg - b.over) * b.rate / 100; break; }
    }
    return Math.min(Math.min(d, E.limit), tg);
  }
  // 산출세액 (과세표준)
  function outputTax(base, R) {
    if (base <= 0) return 0;
    var br = R.incomeTax.brackets;
    for (var i = 0; i < br.length; i++) { var b = br[i]; if (b.upTo === null || base <= b.upTo) return Math.max(0, base * b.rate / 100 - b.deduction); }
    return 0;
  }
  // 근로소득세액공제
  function earnedTaxCredit(computed, tg, R) {
    var C = R.earnedIncomeTaxCredit;
    var credit = computed <= C.threshold ? computed * C.lowRate / 100 : C.lowCredit + (computed - C.threshold) * C.highRate / 100;
    var limit = 0;
    for (var i = 0; i < C.limits.length; i++) {
      var L = C.limits[i];
      if (L.upTo === null || tg <= L.upTo) { limit = (L.flat != null) ? L.flat : Math.max(L.min, L.base - (tg - L.from) * L.slope); break; }
    }
    return Math.min(credit, limit);
  }
  // 자녀세액공제(연말정산)
  function childTaxCredit(n, R) {
    if (n <= 0) return 0;
    var K = R.childTaxCredit;
    return n === 1 ? K.one : (n === 2 ? K.two : K.two + (n - 2) * K.overTwoPerChild);
  }
  // 4대보험 근로자 월 부담
  function insuranceWorker(monthly, R) {
    var i = R.insurance;
    var np = Math.floor(clamp(monthly, i.nationalPension.base.min.value, i.nationalPension.base.max.value) * i.nationalPension.worker.value / 100 / 10) * 10;
    var hBase = clamp(monthly, i.health.base.min.value, i.health.base.max.value);
    var health = Math.floor(hBase * i.health.worker.value / 100 / 10) * 10;
    var ltc = Math.floor(hBase * i.longTermCare.ofSalary.value / 100 * 0.5 / 10) * 10;
    var emp = Math.floor(monthly * i.employment.unemployment.worker.value / 100 / 10) * 10;
    return { np: np, health: health, ltc: ltc, emp: emp, total: np + health + ltc + emp };
  }
  // 연말정산 기준 연간 소득세·지방소득세
  function annualIncomeTax(annualTaxableGross, family, children, R) {
    var tg = annualTaxableGross;
    var earnedInc = tg - earnedDeduction(tg, R);
    var monthly = tg / 12;
    var ins = insuranceWorker(monthly, R);
    var pensionY = ins.np * 12;                    // 연금보험료공제
    var insY = (ins.health + ins.ltc + ins.emp) * 12; // 보험료 특별소득공제
    var personal = R.personalDeduction.basic * family;
    var base = Math.max(0, earnedInc - personal - pensionY - insY);
    var computed = outputTax(base, R);
    var decided = Math.max(0, computed - earnedTaxCredit(computed, tg, R) - childTaxCredit(children, R));
    return { taxBase: Math.round(base), computed: Math.round(computed), incomeTax: Math.round(decided), localTax: Math.round(decided * 0.1) };
  }

  var LOGIC = { earnedDeduction: earnedDeduction, outputTax: outputTax, earnedTaxCredit: earnedTaxCredit, childTaxCredit: childTaxCredit, insuranceWorker: insuranceWorker, annualIncomeTax: annualIncomeTax };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var isMonthly = document.getElementById("payType").value === "month";
    var input = TK.num("payAmount");
    if (isNaN(input)) { err.textContent = (isMonthly ? "월급을" : "연봉을") + " 입력하세요."; return; }
    var annualGross = isMonthly ? input * 12 : input;
    var nonTaxMonthly = TK.num("nonTax"); if (isNaN(nonTaxMonthly)) nonTaxMonthly = 0;
    var family = TK.num("family"); if (isNaN(family) || family < 1) family = 1;
    var children = TK.num("children"); if (isNaN(children)) children = 0;

    var taxableAnnual = Math.max(0, annualGross - nonTaxMonthly * 12);
    var taxableMonthly = taxableAnnual / 12;
    var ins = insuranceWorker(taxableMonthly, R);
    var tax = annualIncomeTax(taxableAnnual, family, children, R);
    var monthlyGross = Math.round(annualGross / 12);
    var incomeTaxM = Math.round(tax.incomeTax / 12), localTaxM = Math.round(tax.localTax / 12);
    var deductM = ins.total + incomeTaxM + localTaxM;
    var netM = monthlyGross - deductM;

    document.getElementById("salResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(netM) + '</span><small>원</small></div><p class="result-sub">월 실수령액 (연 ' + f(netM * 12) + '원, ' + R.year + '년 기준)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>월 세전 급여</th><td>' + f(monthlyGross) + ' 원</td></tr>' +
      '<tr><th>국민연금</th><td>-' + f(ins.np) + ' 원</td></tr>' +
      '<tr><th>건강보험</th><td>-' + f(ins.health) + ' 원</td></tr>' +
      '<tr><th>장기요양</th><td>-' + f(ins.ltc) + ' 원</td></tr>' +
      '<tr><th>고용보험</th><td>-' + f(ins.emp) + ' 원</td></tr>' +
      '<tr><th>소득세</th><td>-' + f(incomeTaxM) + ' 원</td></tr>' +
      '<tr><th>지방소득세</th><td>-' + f(localTaxM) + ' 원</td></tr>' +
      '<tr><th>공제 합계</th><td>-' + f(deductM) + ' 원</td></tr>' +
      '<tr><th>월 실수령액</th><td><strong>' + f(netM) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 소득세는 <strong>연말정산 기준(1년 실제 세금)</strong> 추정입니다. 매월 급여명세서의 원천징수(간이세액표)와는 차이가 있으며 연말정산에서 정산됩니다. 부양가족·자녀 외 다른 공제는 반영하지 않았습니다.</p>';
    TK.showResult();
  }

  var payType = document.getElementById("payType");
  if (payType) payType.addEventListener("change", function () {
    document.getElementById("payLabel").textContent = payType.value === "month" ? "월급(세전)" : "연봉(세전)";
  });
  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) setTimeout(calc, 0);
})();
