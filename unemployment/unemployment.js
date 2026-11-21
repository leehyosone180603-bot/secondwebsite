/* 실업급여(구직급여) 계산기 — 순수 함수 + DOM.
   구직급여일액 = clamp(기초일액×60%, 하한[최저시급×80%×소정시간], 상한 68,100).
   총 예상 = 일액 × 소정급여일수(나이·가입기간, 별표1). rates(window.RATES) 사용. */
(function () {
  "use strict";
  function minDaily(R, workHours) { return Math.round(R.unemployment.minHourly * (R.unemployment.minRate / 100) * workHours); }
  function dailyBenefit(dailyBase, workHours, R) {
    var u = R.unemployment;
    var raw = Math.round(dailyBase * u.rate / 100);
    var mn = minDaily(R, workHours), mx = u.dailyMax;
    var v = Math.min(Math.max(raw, mn), mx);
    return { daily: v, raw: raw, floor: mn, cap: mx, applied: v === mn && raw < mn ? "floor" : (v === mx && raw > mx ? "cap" : "rate") };
  }
  function tierKey(years) { return years < 1 ? "lt1" : years < 3 ? "y1to3" : years < 5 ? "y3to5" : years < 10 ? "y5to10" : "y10plus"; }
  function benefitDays(age, years, disabled, R) {
    var t = (age >= 50 || disabled) ? "over50" : "under50";
    return R.unemployment.benefitDays[t][tierKey(years)];
  }
  function estimate(dailyBase, workHours, age, years, disabled, R) {
    var d = dailyBenefit(dailyBase, workHours, R);
    var days = benefitDays(age, years, disabled, R);
    return { daily: d.daily, applied: d.applied, floor: d.floor, cap: d.cap, raw: d.raw, days: days, total: d.daily * days, monthly: d.daily * 30 };
  }

  var LOGIC = { minDaily: minDaily, dailyBenefit: dailyBenefit, benefitDays: benefitDays, tierKey: tierKey, estimate: estimate };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }
  var mode = "monthly";
  function setMode(m) { mode = m; document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m); }); document.querySelectorAll(".ue-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; }); var c = document.getElementById("tk-result-card"); if (c) c.hidden = true; }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.unemployment) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var workHours = TK.num("workHours"); if (isNaN(workHours) || workHours <= 0) workHours = 8; if (workHours > 8) workHours = 8;
    var age = TK.num("age"); if (isNaN(age) || age <= 0) { err.textContent = "이직일 현재 나이를 입력하세요."; return; }
    var years = parseFloat(document.getElementById("insured").value);
    var disabled = document.getElementById("disabled").checked;

    var dailyBase;
    if (mode === "monthly") {
      var mon = TK.num("monthlyPay"); if (isNaN(mon)) { err.textContent = "월 평균임금을 입력하세요."; return; }
      dailyBase = Math.round(mon * 12 / 365); // 월평균 → 1일 평균임금(기초일액) 환산
    } else {
      dailyBase = TK.num("dailyWage"); if (isNaN(dailyBase)) { err.textContent = "1일 평균임금을 입력하세요."; return; }
    }

    var e = estimate(dailyBase, workHours, age, years, disabled, R);
    var tierName = { lt1: "1년 미만", y1to3: "1~3년", y3to5: "3~5년", y5to10: "5~10년", y10plus: "10년 이상" };
    var appliedMsg = e.applied === "floor"
      ? '하한액 적용 (' + f(e.floor) + '원). 평균임금의 60%(' + f(e.raw) + '원)가 하한보다 낮습니다.'
      : e.applied === "cap"
        ? '상한액 적용 (' + f(e.cap) + '원). 평균임금의 60%(' + f(e.raw) + '원)가 상한을 넘습니다.'
        : '평균임금의 60% 적용.';

    document.getElementById("ueResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(e.total) + '</span><small>원</small></div><p class="result-sub">총 예상 수령액 (1일 ' + f(e.daily) + '원 × ' + e.days + '일)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>1일 기초일액</th><td>' + f(dailyBase) + ' 원</td></tr>' +
      '<tr><th>1일 구직급여</th><td><strong>' + f(e.daily) + ' 원</strong></td></tr>' +
      '<tr><th>소정급여일수</th><td>' + e.days + '일 (' + (age >= 50 || disabled ? '50세↑·장애인' : '50세 미만') + ' · ' + tierName[LOGIC.tierKey(years)] + ')</td></tr>' +
      '<tr><th>총 예상 수령액</th><td><strong>' + f(e.total) + ' 원</strong></td></tr>' +
      '<tr><th>월 환산(30일)</th><td>' + f(e.monthly) + ' 원</td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">' + appliedMsg + ' 2026년 상한 68,100원 / 하한(8시간) 66,048원.</p>' +
      '<p class="footer-notice" style="margin:4px 0 0">※ 수급자격(비자발적 이직·피보험 단위기간 180일 이상 등)을 충족해야 하며, 실제 금액은 고용센터 판정에 따릅니다.</p>';
    TK.showResult();
  }

  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setMode("monthly");
  if (location.search) window.ToolKit.ready(calc);
})();
