/* 건강보험료 계산기 — 순수 함수.
   직장가입자: 보수월액(과세) 기준 건강보험료 + 장기요양보험료(근로자/사업주).
   지역가입자: 소득월액 정률(7.19%) + 재산 부과점수×점수당금액 + 장기요양, 최저보험료 하한.
   요율·상하한은 window.RATES(연도 자동). */
(function () {
  "use strict";
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function won10(n) { return Math.floor(n / 10) * 10; } // 10원 미만 절사(통상)

  // pay: 보수월액(과세), R: rates  — 직장가입자
  function healthInsurance(pay, R) {
    var h = R.insurance.health, ltc = R.insurance.longTermCare;
    var hBase = clamp(pay, h.base.min.value, h.base.max.value);
    var h_w = won10(hBase * h.worker.value / 100), h_e = won10(hBase * h.employer.value / 100);
    var ltcRaw = hBase * ltc.ofSalary.value / 100;
    var ltc_w = won10(ltcRaw * 0.5), ltc_e = won10(ltcRaw * 0.5);
    var worker = h_w + ltc_w, employer = h_e + ltc_e;
    return {
      hBase: hBase,
      health: { worker: h_w, employer: h_e, total: h_w + h_e },
      ltc: { worker: ltc_w, employer: ltc_e, total: ltc_w + ltc_e },
      worker: worker, employer: employer, total: worker + employer, yearWorker: worker * 12
    };
  }

  // incomeMonthly: 소득월액(연소득÷12), propertyPoints: 재산 부과점수, R: rates — 지역가입자
  function regionalHealth(incomeMonthly, propertyPoints, R) {
    var reg = R.insurance.health.regional, ltc = R.insurance.longTermCare;
    var income = Math.max(0, incomeMonthly || 0), pts = Math.max(0, propertyPoints || 0);
    var incomePremium = won10(income * reg.incomeRate.value / 100);
    var propertyPremium = won10(pts * reg.propertyPointValue.value);
    var healthRaw = incomePremium + propertyPremium;
    var health = Math.max(healthRaw, reg.minPremium.value); // 월 최저보험료 하한
    var appliedMin = health !== healthRaw;
    var ltcPremium = won10(health * ltc.ofHealthPremium.value / 100); // 건보료 대비 환산
    return {
      incomePremium: incomePremium, propertyPremium: propertyPremium,
      health: health, appliedMin: appliedMin, ltc: ltcPremium,
      total: health + ltcPremium, yearTotal: (health + ltcPremium) * 12
    };
  }

  var LOGIC = { clamp: clamp, won10: won10, healthInsurance: healthInsurance, regionalHealth: regionalHealth };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function setMode(mode) {
    var isReg = mode === "regional";
    document.getElementById("empFields").style.display = isReg ? "none" : "";
    document.getElementById("regFields").style.display = isReg ? "" : "none";
    document.querySelectorAll(".mode-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-mode") === mode);
    });
    document.getElementById("hiResult").innerHTML = "";
    TK.hideResult && TK.hideResult();
  }

  function calcEmp(R) {
    var err = document.getElementById("errorMsg");
    var pay = TK.num("pay");
    if (isNaN(pay) || pay <= 0) { err.textContent = "월 보수월액을 입력하세요."; return; }
    var r = LOGIC.healthInsurance(pay, R);
    var clamped = r.hBase !== Math.round(pay);
    document.getElementById("hiResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.worker) + '</span><small>원</small></div><p class="result-sub">근로자 월 부담 (건강 + 장기요양, ' + R.year + '년 기준)</p></div>' +
      '<table class="calc-table"><thead><tr><th>항목</th><th>근로자</th><th>사업주</th><th>합계</th></tr></thead><tbody>' +
      '<tr><th>건강보험료</th><td>' + f(r.health.worker) + '</td><td>' + f(r.health.employer) + '</td><td>' + f(r.health.total) + '</td></tr>' +
      '<tr><th>장기요양보험료</th><td>' + f(r.ltc.worker) + '</td><td>' + f(r.ltc.employer) + '</td><td>' + f(r.ltc.total) + '</td></tr>' +
      '<tr><th>합계</th><td><strong>' + f(r.worker) + '</strong></td><td><strong>' + f(r.employer) + '</strong></td><td><strong>' + f(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<p style="margin:8px 0 0">연간 근로자 부담 약 <strong>' + f(r.yearWorker) + '</strong> 원' + (clamped ? ' · 보수월액 상·하한(' + f(r.hBase) + '원)을 적용했습니다.' : '') + '</p>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 직장가입자 기준(건강보험료율 ' + R.insurance.health.total.value + '%, 근로자 절반). 정확한 금액은 국민건강보험공단으로 확인하세요.</p>';
    TK.showResult();
  }

  function calcReg(R) {
    var err = document.getElementById("errorMsg");
    var reg = R.insurance.health.regional;
    var annual = TK.num("annualIncome");
    var pts = TK.num("propPoints");
    if ((isNaN(annual) || annual <= 0) && (isNaN(pts) || pts <= 0)) {
      err.textContent = "연 소득 또는 재산 부과점수를 입력하세요."; return;
    }
    var incomeMonthly = (isNaN(annual) ? 0 : annual) / 12;
    var r = LOGIC.regionalHealth(incomeMonthly, isNaN(pts) ? 0 : pts, R);
    document.getElementById("hiResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.total) + '</span><small>원</small></div><p class="result-sub">지역가입자 월 보험료 (건강 + 장기요양, ' + R.year + '년 기준)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>소득보험료 <span class="hint">(소득월액 ' + f(Math.round(incomeMonthly)) + '원 × ' + reg.incomeRate.value + '%)</span></th><td>' + f(r.incomePremium) + ' 원</td></tr>' +
      '<tr><th>재산보험료 <span class="hint">(재산점수 × ' + reg.propertyPointValue.value + '원)</span></th><td>' + f(r.propertyPremium) + ' 원</td></tr>' +
      '<tr><th>건강보험료' + (r.appliedMin ? ' <span class="hint">(최저보험료 적용)</span>' : '') + '</th><td>' + f(r.health) + ' 원</td></tr>' +
      '<tr><th>장기요양보험료 <span class="hint">(건보료 × ' + R.insurance.longTermCare.ofHealthPremium.value + '%)</span></th><td>' + f(r.ltc) + ' 원</td></tr>' +
      '<tr><th>월 합계</th><td><strong>' + f(r.total) + ' 원</strong></td></tr>' +
      '<tr><th>연간 합계</th><td>' + f(r.yearTotal) + ' 원</td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">⚠️ 지역가입자 추정치입니다. <strong>자동차 부과는 폐지(2024.2월분~)</strong>되었고, 재산 과세표준→부과점수 환산은 공단 재산등급표가 필요해 <strong>재산 부과점수를 직접 입력</strong>받습니다(공단 고지서·홈페이지 「보험료 모의계산」에서 확인). 점수당 금액·최저보험료는 공단 공식 기준으로 달라질 수 있어 정확한 금액은 국민건강보험공단으로 확인하세요.</p>';
    TK.showResult();
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES;
    if (!R || !R.insurance || !R.insurance.health || !R.insurance.health.regional) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var mode = document.querySelector(".mode-btn.active");
    mode = mode ? mode.getAttribute("data-mode") : "employee";
    if (mode === "regional") calcReg(R); else calcEmp(R);
  }

  document.querySelectorAll(".mode-btn").forEach(function (b) {
    b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); });
  });
  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
