/* 4대보험 계산기 — 로직 + 순수 함수.
   월 보수(비과세 제외)로 국민연금·건강·장기요양·고용·산재 보험료를
   근로자/사업주/합계로 계산. 요율·상하한은 window.RATES(연도 자동) 사용. */
(function () {
  "use strict";

  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function won10(n) { return Math.floor(n / 10) * 10; } // 10원 미만 절사(통상)

  // pay: 과세 보수월액, R: rates, esRate: 고용안정 사업주요율(%), injuryRate: 산재요율(%)
  function calc4(pay, R, esRate, injuryRate) {
    var ins = R.insurance;
    var np = ins.nationalPension, h = ins.health, ltc = ins.longTermCare, emp = ins.employment;
    var npBase = clamp(pay, np.base.min.value, np.base.max.value);
    var np_w = won10(npBase * np.worker.value / 100), np_e = won10(npBase * np.employer.value / 100);
    var hBase = clamp(pay, h.base.min.value, h.base.max.value);
    var h_w = won10(hBase * h.worker.value / 100), h_e = won10(hBase * h.employer.value / 100);
    var ltcTotal = hBase * ltc.ofSalary.value / 100;           // 보수월액 대비
    var ltc_w = won10(ltcTotal * 0.5), ltc_e = won10(ltcTotal * 0.5);
    var emp_w = won10(pay * emp.unemployment.worker.value / 100);
    var emp_e = won10(pay * emp.unemployment.employer.value / 100 + pay * (esRate || 0) / 100);
    var wc_e = won10(pay * (injuryRate || 0) / 100);
    var items = [
      { name: "국민연금", worker: np_w, employer: np_e },
      { name: "건강보험", worker: h_w, employer: h_e },
      { name: "장기요양", worker: ltc_w, employer: ltc_e },
      { name: "고용보험", worker: emp_w, employer: emp_e },
      { name: "산재보험", worker: 0, employer: wc_e }
    ];
    var worker = np_w + h_w + ltc_w + emp_w;
    var employer = np_e + h_e + ltc_e + emp_e + wc_e;
    return { items: items, worker: worker, employer: employer, total: worker + employer, npBase: npBase, hBase: hBase };
  }

  var LOGIC = { clamp: clamp, won10: won10, calc4: calc4 };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.insurance) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var pay = TK.num("pay");
    if (isNaN(pay)) { err.textContent = "월 보수액을 입력하세요."; return; }
    var nontax = TK.num("nontax"); if (isNaN(nontax)) nontax = 0;
    var taxable = Math.max(0, pay - nontax);
    var esRate = parseFloat(document.getElementById("size").value) || 0;
    var injury = TK.num("injury"); if (isNaN(injury)) injury = (R.insurance.workersComp && R.insurance.workersComp.value) || 1.47;
    var r = calc4(taxable, R, esRate, injury);

    var rows = r.items.map(function (it) {
      return '<tr><th>' + it.name + '</th><td>' + f(it.worker) + '</td><td>' + f(it.employer) + '</td><td>' + f(it.worker + it.employer) + '</td></tr>';
    }).join("");
    document.getElementById("insResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.worker) + '</span><small>원</small></div><p class="result-sub">근로자 월 부담 합계 (과세보수 ' + f(taxable) + '원 기준, ' + R.year + '년)</p></div>' +
      '<table class="calc-table"><thead><tr><th>항목</th><th>근로자</th><th>사업주</th><th>합계</th></tr></thead><tbody>' + rows +
      '<tr><th>합계</th><td><strong>' + f(r.worker) + '</strong></td><td><strong>' + f(r.employer) + '</strong></td><td><strong>' + f(r.total) + '</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 10원 미만 절사 기준 추정치. 국민연금은 기준소득월액(' + f(r.npBase) + '), 건강보험은 보수월액(' + f(r.hBase) + ') 상·하한이 적용됩니다.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
