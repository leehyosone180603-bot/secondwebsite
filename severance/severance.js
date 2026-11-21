/* 퇴직금 계산기 — 로직 + 순수 함수.
   퇴직금(1일 평균임금×30×재직일수/365) + 퇴직소득세(근속연수공제·환산급여공제·연분연승).
   퇴직소득세 산식은 홈택스 모의계산 샘플로 검증. rates(window.RATES) 사용. */
(function () {
  "use strict";
  function ymd(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function days(a, b) { return Math.round((ymd(b) - ymd(a)) / 86400000); }

  // 근속월수(1개월 미만 올림) / 근속연수(1년 미만 올림)
  function serviceMonths(start, end) {
    var m = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() >= start.getDate()) m += 1;
    return Math.max(1, m);
  }
  function serviceYears(start, end) { return Math.ceil(serviceMonths(start, end) / 12); }

  function serviceYearDeduction(years, R) {
    var B = R.retirement.serviceYearDeduction.brackets;
    for (var i = 0; i < B.length; i++) { var b = B[i]; if (b.upToYears === null || years <= b.upToYears) return b.base + b.perYear * (years - b.over); }
    return 0;
  }
  function convertedDeduction(ce, R) {
    var B = R.retirement.convertedIncomeDeduction.brackets;
    for (var i = 0; i < B.length; i++) { var b = B[i]; if (b.upTo === null || ce <= b.upTo) return b.base + (ce - b.over) * b.rate / 100; }
    return 0;
  }
  function outputTax(base, R) {
    if (base <= 0) return 0;
    var br = R.incomeTax.brackets;
    for (var i = 0; i < br.length; i++) { var b = br[i]; if (b.upTo === null || base <= b.upTo) return Math.max(0, base * b.rate / 100 - b.deduction); }
    return 0;
  }
  // 퇴직소득세 (연분연승)
  function retirementTax(severance, years, R) {
    var syd = serviceYearDeduction(years, R);
    var converted = (severance - syd) / years * 12;
    var cdd = convertedDeduction(converted, R);
    var taxBase = Math.max(0, converted - cdd);
    var convTax = outputTax(taxBase, R);
    var incomeTax = Math.round(convTax * years / 12);
    return { serviceDeduction: Math.round(syd), converted: Math.round(converted), convertedDeduction: Math.round(cdd), taxBase: Math.round(taxBase), convertedTax: Math.round(convTax), incomeTax: incomeTax, localTax: Math.round(incomeTax * 0.1) };
  }
  // 퇴직금 = 1일 평균임금 × 30 × 재직일수/365
  function severancePay(dailyWage, serviceDays) { return Math.round(dailyWage * 30 * serviceDays / 365); }

  var LOGIC = { serviceMonths: serviceMonths, serviceYears: serviceYears, serviceYearDeduction: serviceYearDeduction, convertedDeduction: convertedDeduction, retirementTax: retirementTax, severancePay: severancePay, days: days };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function parse(v) { if (!v) return null; var p = String(v).split("-"); if (p.length !== 3) return null; var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? null : d; }
  function f(n) { return TK.fmt(n); }
  var mode = "wage";
  function setMode(m) { mode = m; document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m); }); document.querySelectorAll(".sv-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; }); var c = document.getElementById("tk-result-card"); if (c) c.hidden = true; }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var start = parse(TK.val("joinDate")), end = parse(TK.val("leaveDate"));
    if (!start || !end) { err.textContent = "입사일과 퇴사일을 선택하세요."; return; }
    if (days(start, end) < 0) { err.textContent = "퇴사일이 입사일보다 빠릅니다."; return; }
    var serviceDays = days(start, end);
    if (serviceDays < 365) { document.getElementById("svResult").innerHTML = '<div class="banner warn" style="padding:14px;border-radius:12px;background:var(--warn-soft,#fdf0db)">재직기간이 1년 미만이라 법정 퇴직금 지급 대상이 아닙니다. (재직 ' + f(serviceDays) + '일)</div>'; TK.showResult(); return; }
    var years = serviceYears(start, end);

    var dailyWage;
    if (mode === "wage") {
      var pay3 = TK.num("pay3"); if (isNaN(pay3)) { err.textContent = "퇴직 전 3개월 급여 합계를 입력하세요."; return; }
      var bonus = TK.num("bonus") || 0, leave = TK.num("leavePay") || 0;
      var p3 = new Date(end.getFullYear(), end.getMonth() - 3, end.getDate());
      var periodDays = days(p3, end);
      dailyWage = (pay3 + bonus * 3 / 12 + leave * 3 / 12) / periodDays;
    } else {
      dailyWage = TK.num("dailyWage"); if (isNaN(dailyWage)) { err.textContent = "1일 평균임금을 입력하세요."; return; }
    }
    var pay = severancePay(dailyWage, serviceDays);
    var t = retirementTax(pay, years, R);
    var net = pay - t.incomeTax - t.localTax;

    document.getElementById("svResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(net) + '</span><small>원</small></div><p class="result-sub">세후 실수령 (근속 ' + years + '년, 재직 ' + f(serviceDays) + '일)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>1일 평균임금</th><td>' + f(Math.round(dailyWage)) + ' 원</td></tr>' +
      '<tr><th>세전 퇴직금</th><td>' + f(pay) + ' 원</td></tr>' +
      '<tr><th>퇴직소득세</th><td>-' + f(t.incomeTax) + ' 원</td></tr>' +
      '<tr><th>지방소득세</th><td>-' + f(t.localTax) + ' 원</td></tr>' +
      '<tr><th>세후 실수령</th><td><strong>' + f(net) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      '<h3 style="margin:16px 0 6px;font-size:.95rem">퇴직소득세 계산 내역</h3>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>근속연수공제</th><td>' + f(t.serviceDeduction) + ' 원</td></tr>' +
      '<tr><th>환산급여</th><td>' + f(t.converted) + ' 원</td></tr>' +
      '<tr><th>환산급여공제</th><td>' + f(t.convertedDeduction) + ' 원</td></tr>' +
      '<tr><th>과세표준</th><td>' + f(t.taxBase) + ' 원</td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 추정치입니다. 비과세 퇴직급여·세액공제·연금계좌 이체는 반영하지 않았습니다. 정확한 금액은 회사·국세청으로 확인하세요.</p>';
    TK.showResult();
  }

  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setMode("wage");
  if (location.search) window.ToolKit.ready(calc);
})();
