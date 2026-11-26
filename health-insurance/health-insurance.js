/* 건강보험료 계산기(직장가입자) — 순수 함수.
   보수월액(과세) 기준으로 건강보험료 + 장기요양보험료를 근로자/사업주로 계산.
   요율·상하한은 window.RATES(연도 자동). ※ 지역가입자(소득·재산 부과점수)는 별도. */
(function () {
  "use strict";
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function won10(n) { return Math.floor(n / 10) * 10; } // 10원 미만 절사(통상)

  // pay: 보수월액(과세), R: rates
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

  var LOGIC = { clamp: clamp, won10: won10, healthInsurance: healthInsurance };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.insurance || !R.insurance.health) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
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
      '<p class="footer-notice" style="margin:8px 0 0">※ 직장가입자 기준(건강보험료율 ' + R.insurance.health.total.value + '%, 근로자 절반). 지역가입자(소득·재산 부과점수)는 반영하지 않습니다. 정확한 금액은 국민건강보험공단으로 확인하세요.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
