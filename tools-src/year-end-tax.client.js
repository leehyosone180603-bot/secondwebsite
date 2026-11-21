/* 연말정산 환급 계산기(추정) — 순수 함수.
   총급여 → 근로소득공제 → 근로소득금액 → (인적·연금보험료·4대보험·신용카드 소득공제)
   → 과세표준 → 산출세액 → (근로·자녀·연금계좌·보험·의료·교육·기부·월세 세액공제) → 결정세액 → 환급.
   rates(window.RATES) 사용. 2026 귀속 기준. */
(function () {
  "use strict";
  function bracketDeduct(amount, brackets) { // 근로소득공제: base + (amount−over)×rate%
    for (var i = 0; i < brackets.length; i++) { var b = brackets[i]; if (b.upTo === null || amount <= b.upTo) return Math.round(b.base + (amount - b.over) * b.rate / 100); }
    return 0;
  }
  function progressiveTax(base, brackets) { // 산출세액 §55
    if (base <= 0) return 0;
    for (var i = 0; i < brackets.length; i++) { var b = brackets[i]; if (b.upTo === null || base <= b.upTo) return Math.max(0, Math.round(base * b.rate / 100 - b.deduction)); }
    return 0;
  }
  function earnedCredit(calcTax, salary, R) { // 근로소득세액공제 §59
    var c = R.earnedIncomeTaxCredit;
    var raw = calcTax <= c.threshold ? calcTax * c.lowRate / 100 : c.lowCredit + (calcTax - c.threshold) * c.highRate / 100;
    var limit = 0;
    for (var i = 0; i < c.limits.length; i++) { var L = c.limits[i]; if (L.upTo === null || salary <= L.upTo) { limit = L.flat != null ? L.flat : Math.max(L.min, L.base - (salary - L.from) * L.slope); break; } }
    return Math.round(Math.min(raw, limit));
  }
  function childCredit(childCount, R) { var c = R.childTaxCredit; if (childCount <= 0) return 0; if (childCount === 1) return c.one; if (childCount === 2) return c.two; return c.two + (childCount - 2) * c.overTwoPerChild; }
  function cardDeduction(salary, credit, check, market, R) {
    var c = R.yearEnd.card, min = salary * c.minRate / 100, total = credit + check + market;
    if (total <= min) return 0;
    var remain = min;
    var cu = Math.min(credit, remain); remain -= cu;
    var ku = Math.min(check, remain); remain -= ku;
    var mu = Math.min(market, remain); remain -= mu;
    var creditDed = (credit - cu) * c.creditRate / 100;
    var checkDed = (check - ku) * c.checkRate / 100;
    var marketDed = (market - mu) * c.marketTransitRate / 100;
    var raw = creditDed + checkDed + marketDed;
    var baseLimit = salary <= c.salaryThreshold ? c.baseLimitLow : c.baseLimitHigh;
    var extraLimit = salary <= c.salaryThreshold ? c.extraLimitLow : c.extraLimitHigh;
    var basic = Math.min(raw, baseLimit);
    var extra = Math.min(Math.max(0, raw - baseLimit), marketDed, extraLimit);
    return Math.round(basic + extra);
  }
  // 입력 객체 → 전체 계산
  function yearEndTax(inp, R) {
    var salary = inp.salary || 0;
    var y = R.yearEnd;
    // 소득공제
    var earnedDed = bracketDeduct(salary, R.earnedIncomeDeduction.brackets);
    var earnedIncome = salary - earnedDed; // 근로소득금액
    var personal = R.personalDeduction.basic * (1 + (inp.dependents || 0)); // 기본공제(본인+부양)
    var npPremium = Math.round(Math.min(salary, 6590000 * 12) * R.insurance.nationalPension.worker.value / 100); // 국민연금(연금보험료공제)
    var healthPremium = Math.round(salary * (R.insurance.health.worker.value + R.insurance.health.worker.value * R.insurance.longTermCare.ofSalary.value / R.insurance.health.total.value + R.insurance.employment.unemployment.worker.value) / 100); // 건강+장기요양+고용(특별소득공제)
    var card = cardDeduction(salary, inp.cardCredit || 0, inp.cardCheck || 0, inp.cardMarket || 0, R);
    var taxBase = Math.max(0, earnedIncome - personal - npPremium - healthPremium - card);
    // 산출세액
    var calcTax = progressiveTax(taxBase, R.incomeTax.brackets);
    // 세액공제
    var ec = earnedCredit(calcTax, salary, R);
    var cc = childCredit(inp.children || 0, R);
    var pensionAcct = Math.round(Math.min(inp.pension || 0, y.pensionAccount.limitTotal) * (salary <= y.pensionAccount.threshold ? y.pensionAccount.rateLow : y.pensionAccount.rateHigh) / 100);
    var insC = Math.round(Math.min(inp.insurance || 0, y.insuranceCredit.limit) * y.insuranceCredit.rate / 100);
    var medBase = Math.max(0, (inp.medical || 0) - salary * y.medical.thresholdRate / 100);
    var medC = Math.round(Math.min(medBase, y.medical.generalLimit) * y.medical.rate / 100);
    var eduC = Math.round((inp.education || 0) * y.education.rate / 100);
    var don = inp.donation || 0;
    var donC = Math.round((don <= y.donation.highThreshold ? don * y.donation.rateLow / 100 : y.donation.highThreshold * y.donation.rateLow / 100 + (don - y.donation.highThreshold) * y.donation.rateHigh / 100));
    var rentC = 0;
    if ((inp.rent || 0) > 0 && salary <= y.rent.salaryCap) rentC = Math.round(Math.min(inp.rent, y.rent.limit) * (salary <= y.rent.threshold ? y.rent.rateLow : y.rent.rate) / 100);
    var specialCredits = insC + medC + eduC + donC + rentC;
    var standard = specialCredits === 0 ? y.standardCredit : 0; // 표준세액공제 택1
    var totalCredit = ec + cc + pensionAcct + specialCredits + standard;
    var decided = Math.max(0, calcTax - totalCredit); // 결정세액
    var localTax = Math.round(decided * 0.1);
    var prepaid = inp.prepaid; // 기납부(원천징수)
    var refund = (prepaid != null && !isNaN(prepaid)) ? (prepaid - decided) : null;
    return {
      earnedDed: earnedDed, earnedIncome: earnedIncome, personal: personal, npPremium: npPremium, healthPremium: healthPremium, card: card,
      taxBase: taxBase, calcTax: calcTax,
      earnedCredit: ec, childCredit: cc, pensionAcct: pensionAcct, insuranceCredit: insC, medicalCredit: medC, educationCredit: eduC, donationCredit: donC, rentCredit: rentC, standardCredit: standard,
      totalCredit: totalCredit, decided: decided, localTax: localTax, refund: refund
    };
  }

  var LOGIC = { bracketDeduct: bracketDeduct, progressiveTax: progressiveTax, earnedCredit: earnedCredit, childCredit: childCredit, cardDeduction: cardDeduction, yearEndTax: yearEndTax };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.yearEnd) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var salary = TK.num("salary");
    if (isNaN(salary) || salary <= 0) { err.textContent = "총급여(연봉)를 입력하세요."; return; }
    var inp = {
      salary: salary, dependents: TK.num("dependents") || 0, children: TK.num("children") || 0,
      cardCredit: TK.num("cardCredit") || 0, cardCheck: TK.num("cardCheck") || 0, cardMarket: TK.num("cardMarket") || 0,
      pension: TK.num("pension") || 0, insurance: TK.num("insurance") || 0, medical: TK.num("medical") || 0,
      education: TK.num("education") || 0, donation: TK.num("donation") || 0, rent: TK.num("rent") || 0,
      prepaid: isNaN(TK.num("prepaid")) ? null : TK.num("prepaid")
    };
    var r = LOGIC.yearEndTax(inp, R);
    var refundHtml = "";
    if (r.refund != null) {
      var isRefund = r.refund >= 0;
      refundHtml = '<div class="result-hero"><div class="big" style="color:' + (isRefund ? '#1f9d57' : '#e03131') + '"><span>' + (isRefund ? '+' : '') + f(r.refund) + '</span><small>원</small></div><p class="result-sub">' + (isRefund ? '예상 환급액 🎉' : '추가 납부 예상') + '</p></div>';
    } else {
      refundHtml = '<div class="result-hero"><div class="big"><span>' + f(r.decided) + '</span><small>원</small></div><p class="result-sub">결정세액 (기납부액 입력 시 환급액 계산)</p></div>';
    }

    document.getElementById("yeResult").innerHTML = refundHtml +
      '<table class="calc-table"><tbody>' +
      '<tr><th>근로소득금액</th><td>' + f(r.earnedIncome) + ' 원</td></tr>' +
      '<tr><th>소득공제 합계</th><td>-' + f(r.personal + r.npPremium + r.healthPremium + r.card) + ' 원</td></tr>' +
      '<tr style="color:var(--muted)"><td colspan="2" style="padding-left:16px;font-size:.88rem">· 인적 ' + f(r.personal) + ' / 국민연금 ' + f(r.npPremium) + ' / 건강·고용 ' + f(r.healthPremium) + ' / 신용카드 ' + f(r.card) + '</td></tr>' +
      '<tr><th>과세표준</th><td>' + f(r.taxBase) + ' 원</td></tr>' +
      '<tr><th>산출세액</th><td>' + f(r.calcTax) + ' 원</td></tr>' +
      '<tr><th>세액공제 합계</th><td>-' + f(r.totalCredit) + ' 원</td></tr>' +
      '<tr style="color:var(--muted)"><td colspan="2" style="padding-left:16px;font-size:.88rem">· 근로 ' + f(r.earnedCredit) + ' / 자녀 ' + f(r.childCredit) + ' / 연금계좌 ' + f(r.pensionAcct) + ' / 보험 ' + f(r.insuranceCredit) + ' / 의료 ' + f(r.medicalCredit) + ' / 교육 ' + f(r.educationCredit) + ' / 기부 ' + f(r.donationCredit) + ' / 월세 ' + f(r.rentCredit) + (r.standardCredit ? ' / 표준 ' + f(r.standardCredit) : '') + '</td></tr>' +
      '<tr><th>결정세액(소득세)</th><td><strong>' + f(r.decided) + ' 원</strong></td></tr>' +
      '<tr><th>지방소득세(10%)</th><td>' + f(r.localTax) + ' 원</td></tr>' +
      (r.refund != null ? '<tr><th>기납부세액</th><td>' + f(inp.prepaid) + ' 원</td></tr><tr><th>' + (r.refund >= 0 ? '환급액' : '추가납부') + '</th><td><strong>' + f(Math.abs(r.refund)) + ' 원</strong></td></tr>' : '') +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 2026 귀속 기준 추정입니다. 4대보험·신용카드 소득공제는 간이 추정하며, 경로·장애인 추가공제, 의료비 세부구분, 신용카드 자녀 추가한도·문화체육 등은 단순화했습니다. 정확한 금액은 홈택스 연말정산 미리보기로 확인하세요.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
