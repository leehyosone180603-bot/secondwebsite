/* 알바 급여 계산기 — 로직 + 순수 함수 + 단계형 마법사.
   주휴수당(주15h↑), 가산수당(5인↑ 1.5배), 세금옵션(없음/3.3%/4대보험). */
(function () {
  "use strict";

  // 주급 계산
  function weeklyPay(wage, weeklyHours, overH, nightH, holidayH, over5) {
    var premium = over5 ? 0.5 : 0;
    var basic = Math.round(weeklyHours * wage);
    var holidayHours = weeklyHours >= 15 ? Math.min(weeklyHours / 40 * 8, 8) : 0;
    var holidayPay = Math.round(holidayHours * wage);
    var extraHours = (overH || 0) + (nightH || 0) + (holidayH || 0);
    var extraPay = Math.round(extraHours * wage * (1 + premium));
    return { basic: basic, holidayHours: holidayHours, holidayPay: holidayPay, extraPay: extraPay, gross: basic + holidayPay + extraPay };
  }
  function monthlyFromWeekly(weeklyGross) { return Math.round(weeklyGross * 4.345); }
  function applyTaxRate(gross, ratePct) { var tax = Math.round(gross * ratePct / 100); return { tax: tax, net: gross - tax }; }

  var LOGIC = { weeklyPay: weeklyPay, monthlyFromWeekly: monthlyFromWeekly, applyTaxRate: applyTaxRate };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }
  function minWage() { try { return (window.RATES.minimumWage.hourly.value) || 10320; } catch (e) { return 10320; } }
  function workerInsuranceRate() {
    try { var i = window.RATES.insurance; return i.nationalPension.worker.value + i.health.worker.value + i.longTermCare.ofSalary.value * 0.5 + i.employment.unemployment.worker.value; }
    catch (e) { return 9.7; }
  }

  /* ── 마법사 ── */
  var steps = [], idx = 0;
  function dots() {
    var d = document.getElementById("wizDots"); if (!d) return;
    d.innerHTML = steps.map(function (_, i) { return '<span class="dot' + (i <= idx ? " done" : "") + '"></span>'; }).join("");
  }
  function show(i) {
    idx = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach(function (s, n) { s.hidden = n !== idx; });
    dots();
    document.getElementById("wizPrev").hidden = idx === 0;
    document.getElementById("wizNext").textContent = idx === steps.length - 1 ? "결과 보기" : "다음";
    if (idx === 0) { // 시급 단계: 최저시급 안내
      var mw = document.getElementById("minWageNote");
      if (mw) mw.textContent = "올해 최저시급: " + f(minWage()) + "원";
    }
    checkWageWarn();
  }
  function checkWageWarn() {
    var warn = document.getElementById("wageWarn"); if (!warn) return;
    var w = TK.num("wage");
    warn.textContent = (!isNaN(w) && w > 0 && w < minWage()) ? "⚠️ 입력한 시급이 최저시급(" + f(minWage()) + "원)보다 낮습니다." : "";
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var wage = TK.num("wage");
    var daily = TK.num("daily"), rest = TK.num("rest") || 0, days = TK.num("days");
    var over = TK.num("overH") || 0, night = TK.num("nightH") || 0, holi = TK.num("holidayH") || 0;
    if (isNaN(wage) || isNaN(daily) || isNaN(days)) { err.textContent = "시급·근무시간·근무일수를 입력하세요."; show(0); return; }
    var paidDaily = Math.max(0, daily - rest);
    var weeklyHours = paidDaily * days;
    var over5 = document.getElementById("over5").value === "yes";
    var w = weeklyPay(wage, weeklyHours, over, night, holi, over5);
    var monthlyGross = monthlyFromWeekly(w.gross);
    var taxMode = document.getElementById("taxMode").value;
    var rate = taxMode === "33" ? 3.3 : (taxMode === "4insure" ? workerInsuranceRate() : 0);
    var t = applyTaxRate(monthlyGross, rate);

    document.getElementById("ptResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(t.net) + '</span><small>원</small></div><p class="result-sub">월 실수령액 (주 ' + (Math.round(weeklyHours * 10) / 10) + '시간 근무 기준)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>주 기본급</th><td>' + f(w.basic) + ' 원</td></tr>' +
      '<tr><th>주휴수당' + (w.holidayHours ? ' (' + (Math.round(w.holidayHours * 10) / 10) + '시간)' : ' (해당 없음)') + '</th><td>' + f(w.holidayPay) + ' 원</td></tr>' +
      (w.extraPay ? '<tr><th>야간·연장·휴일 가산' + (over5 ? ' (1.5배)' : '') + '</th><td>' + f(w.extraPay) + ' 원</td></tr>' : '') +
      '<tr><th>주급 합계</th><td>' + f(w.gross) + ' 원</td></tr>' +
      '<tr><th>월 환산(주급×4.345)</th><td>' + f(monthlyGross) + ' 원</td></tr>' +
      '<tr><th>공제' + (rate ? ' (' + (Math.round(rate * 100) / 100) + '%)' : ' (없음)') + '</th><td>-' + f(t.tax) + ' 원</td></tr>' +
      '<tr><th>월 실수령액</th><td><strong>' + f(t.net) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 월 환산은 평균 주수(4.345주) 기준 추정입니다. 실제 급여는 근무일·사업장 규정에 따라 다를 수 있습니다.</p>';
    TK.showResult();
  }

  // 초기화
  steps = Array.prototype.slice.call(document.querySelectorAll(".wiz-step"));
  var cb = document.getElementById("calcBtn"); if (cb) cb.style.display = "none"; // 마법사가 대신
  document.getElementById("wizPrev").addEventListener("click", function () { show(idx - 1); });
  document.getElementById("wizNext").addEventListener("click", function () { if (idx === steps.length - 1) calc(); else show(idx + 1); });
  var wageInput = document.getElementById("wage"); if (wageInput) wageInput.addEventListener("input", checkWageWarn);
  show(0);
})();
