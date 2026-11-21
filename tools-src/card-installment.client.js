/* 카드 할부 수수료 계산기 — 공용 모듈 lib/loan(원금균등=체감식) 재사용.
   체감식: 매 회차 남은 할부잔액에 월수수료율(연율/12)을 부과, 할부원금은 균등 분할.
   무이자 체크 시 수수료율 0. 화면 제어만(순수 로직은 window.Loan). */
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var TK = window.ToolKit, L = window.Loan;
  var lastRows = null;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    if (!L) { err.textContent = "할부 계산 모듈을 불러오지 못했습니다."; return; }
    var amount = TK.num("amount"), months = TK.num("months");
    var free = document.getElementById("freeInterest").checked;
    var rate = free ? 0 : TK.num("rate");
    if (isNaN(amount) || isNaN(months)) { err.textContent = "할부원금과 할부개월을 입력하세요."; return; }
    if (months < 2) { err.textContent = "할부는 2개월 이상이어야 합니다. (1개월은 일시불)"; return; }
    if (!free && isNaN(rate)) { err.textContent = "할부 수수료율(연%)을 입력하거나 무이자를 선택하세요."; return; }

    var s = L.schedule(amount, rate, months, "equalPrincipal", 0);
    lastRows = s.rows;
    var monthlyPrincipal = Math.round(amount / months);

    // 스케줄 표(앞 13 + 마지막)
    var r = s.rows, show = r.length <= 14 ? r : r.slice(0, 13).concat([null], [r[r.length - 1]]), rowsHtml = "";
    show.forEach(function (x) {
      if (!x) { rowsHtml += '<tr><td colspan="4" style="text-align:center;color:var(--muted)">⋯ (전체는 CSV)</td></tr>'; return; }
      rowsHtml += "<tr><td>" + x.month + "</td><td>" + f(x.payment) + "</td><td>" + f(x.principal) + " / " + f(x.interest) + "</td><td>" + f(x.balance) + "</td></tr>";
    });

    document.getElementById("ciResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(s.totalInterest) + '</span><small>원</small></div><p class="result-sub">' + (free ? "무이자 할부 — 수수료 0원 🎉" : "총 할부수수료 (" + months + "개월)") + '</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>할부원금</th><td>' + f(Math.round(amount)) + ' 원</td></tr>' +
      '<tr><th>월 할부원금</th><td>' + f(monthlyPrincipal) + ' 원</td></tr>' +
      '<tr><th>총 할부수수료</th><td>' + (free ? '0 원' : '+' + f(s.totalInterest) + ' 원') + '</td></tr>' +
      '<tr><th>총 결제금액</th><td><strong>' + f(s.totalPayment) + ' 원</strong></td></tr>' +
      '<tr><th>첫 달 결제액</th><td>' + f(s.firstPayment) + ' 원</td></tr>' +
      '<tr><th>마지막 달 결제액</th><td>' + f(s.rows[s.rows.length - 1].payment) + ' 원</td></tr>' +
      '</tbody></table>' +
      (free ? '' : '<p class="footer-notice" style="margin:8px 0 0">일시불 대비 <strong>' + f(s.totalInterest) + '원</strong> 더 냅니다. 체감식이라 초반 회차 수수료가 가장 크고 점점 줄어듭니다.</p>') +
      '<div class="result-actions"><button class="btn-sm" id="csvBtn">📄 회차별 내역 CSV 저장</button></div>' +
      '<h3 style="margin:14px 0 6px;font-size:.95rem">회차별 결제 내역</h3>' +
      '<table class="calc-table"><thead><tr><th>회차</th><th>결제액</th><th>원금/수수료</th><th>잔액</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>';
    var cb = document.getElementById("csvBtn"); if (cb) cb.addEventListener("click", downloadCsv);
    TK.showResult();
  }

  function downloadCsv() {
    if (!lastRows) return;
    var lines = ["회차,결제액,할부원금,수수료,잔액"];
    lastRows.forEach(function (x) { lines.push([x.month, x.payment, x.principal, x.interest, x.balance].join(",")); });
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = "card-installment.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    TK.toast("CSV를 저장했습니다");
  }

  function syncFree() {
    var free = document.getElementById("freeInterest").checked;
    var rr = document.getElementById("rateRow"); if (rr) rr.style.display = free ? "none" : "";
  }
  document.getElementById("freeInterest").addEventListener("change", syncFree);
  document.getElementById("calcBtn").addEventListener("click", calc);
  syncFree();
  if (location.search) window.ToolKit.ready(calc);
})();
