/* 예적금 이자 계산기 — 공용 모듈 lib/interest 사용.
   예금(목돈)/적금(월납입) × 단리/월복리 × 과세(일반15.4%/비과세/세금우대9.5%). */
(function () {
  "use strict";
  // (순수 로직은 window.Interest 에 있음) 이 파일은 화면 제어만.
  if (typeof document === "undefined") return;
  var TK = window.ToolKit, I = window.Interest;

  var kind = "deposit"; // deposit(예금) | recurring(적금)
  function setKind(k) {
    kind = k;
    document.querySelectorAll("[data-kind]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-kind") === k); });
    document.getElementById("amountLabel").textContent = k === "recurring" ? "월 납입액" : "예치금액";
    var c = document.getElementById("tk-result-card"); if (c) c.hidden = true;
  }
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    if (!I) { err.textContent = "이자 모듈을 불러오지 못했습니다."; return; }
    var amount = TK.num("amount"), months = TK.num("months"), rate = TK.num("rate");
    if (isNaN(amount) || isNaN(months) || isNaN(rate)) { err.textContent = "금액·기간·금리를 모두 입력하세요."; return; }
    if (months < 1) { err.textContent = "기간은 1개월 이상이어야 합니다."; return; }
    var method = document.getElementById("method").value;     // simple | compound
    var taxMode = document.getElementById("taxMode").value;    // general | none | preferential
    var r = I.deposit(kind, method, amount, rate, months, taxMode);

    // 월별 누적 표(최대 36행, 초과 시 12개월 단위)
    var step = months <= 36 ? 1 : 12;
    var rows = "";
    for (var m = step; m <= months; m += step) {
      var cum = I.deposit(kind, method, amount, rate, m, taxMode);
      rows += "<tr><td>" + m + "개월</td><td>" + f(cum.principal) + "</td><td>" + f(cum.total) + "</td></tr>";
    }
    if ((months - 0) % step !== 0) { var last = I.deposit(kind, method, amount, rate, months, taxMode); rows += "<tr><td>" + months + "개월</td><td>" + f(last.principal) + "</td><td>" + f(last.total) + "</td></tr>"; }

    var taxLabel = r.taxRate === 0 ? "비과세" : r.taxRate + "%";
    document.getElementById("svResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.total) + '</span><small>원</small></div><p class="result-sub">세후 수령액 (' + (kind === "recurring" ? "적금" : "예금") + ' · ' + (method === "compound" ? "월복리" : "단리") + ')</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>' + (kind === "recurring" ? "납입 원금 합계" : "예치 원금") + '</th><td>' + f(r.principal) + ' 원</td></tr>' +
      '<tr><th>세전 이자</th><td>' + f(r.interest) + ' 원</td></tr>' +
      '<tr><th>이자과세 (' + taxLabel + ')</th><td>-' + f(r.tax) + ' 원</td></tr>' +
      '<tr><th>세후 이자</th><td>' + f(r.afterTaxInterest) + ' 원</td></tr>' +
      '<tr><th>세후 수령액</th><td><strong>' + f(r.total) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      '<h3 style="margin:16px 0 6px;font-size:.95rem">월별 누적</h3>' +
      '<table class="calc-table"><thead><tr><th>경과</th><th>누적 원금</th><th>세후 원리금</th></tr></thead><tbody>' + rows + '</tbody></table>';
    TK.showResult();
  }

  document.querySelectorAll("[data-kind]").forEach(function (b) { b.addEventListener("click", function () { setKind(b.getAttribute("data-kind")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setKind("deposit");
  if (location.search) setTimeout(calc, 0);
})();
