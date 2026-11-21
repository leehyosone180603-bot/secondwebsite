/* 대출 이자 계산기 — 공용 모듈 lib/loan 사용.
   원리금균등/원금균등/만기일시 + 거치기간. 스케줄표 + 3방식 비교 + CSV. */
(function () {
  "use strict";
  if (typeof document === "undefined") return;
  var TK = window.ToolKit, L = window.Loan;
  var TYPE_NAME = { equalPayment: "원리금균등", equalPrincipal: "원금균등", bullet: "만기일시" };
  var lastRows = null, lastType = "equalPayment";

  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    if (!L) { err.textContent = "대출 모듈을 불러오지 못했습니다."; return; }
    var amount = TK.num("amount"), rate = TK.num("rate"), months = TK.num("months");
    var grace = TK.num("grace"); if (isNaN(grace)) grace = 0;
    if (isNaN(amount) || isNaN(rate) || isNaN(months)) { err.textContent = "대출금액·금리·기간을 입력하세요."; return; }
    if (months < 1) { err.textContent = "기간은 1개월 이상이어야 합니다."; return; }
    var type = document.getElementById("type").value;
    var s = L.schedule(amount, rate, months, type, grace);
    var cmp = L.compare(amount, rate, months, grace);
    lastRows = s.rows; lastType = type;

    // 스케줄 표(앞 13개 + 마지막, 초과 시 생략)
    var rowsHtml = "", r = s.rows, show = r.length <= 14 ? r : r.slice(0, 13).concat([null], [r[r.length - 1]]);
    show.forEach(function (x) {
      if (!x) { rowsHtml += '<tr><td colspan="4" style="text-align:center;color:var(--muted)">⋯ (전체는 CSV)</td></tr>'; return; }
      rowsHtml += "<tr><td>" + x.month + "</td><td>" + f(x.payment) + "</td><td>" + f(x.principal) + " / " + f(x.interest) + "</td><td>" + f(x.balance) + "</td></tr>";
    });

    document.getElementById("loanResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(s.firstPayment) + '</span><small>원</small></div><p class="result-sub">' + (grace ? "거치 중 월 이자" : "첫 달 납입액") + ' (' + TYPE_NAME[type] + ')</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>총 이자</th><td>' + f(s.totalInterest) + ' 원</td></tr>' +
      '<tr><th>총 상환액</th><td>' + f(s.totalPayment) + ' 원</td></tr>' +
      (grace ? "" : '<tr><th>월 최대 납입</th><td>' + f(s.maxPayment) + ' 원</td></tr>') +
      '</tbody></table>' +
      '<h3 style="margin:16px 0 6px;font-size:.95rem">상환방식별 총 이자 비교</h3>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>원리금균등</th><td>' + f(cmp.equalPayment) + ' 원</td></tr>' +
      '<tr><th>원금균등</th><td>' + f(cmp.equalPrincipal) + ' 원</td></tr>' +
      '<tr><th>만기일시</th><td>' + f(cmp.bullet) + ' 원</td></tr>' +
      '</tbody></table>' +
      '<div class="result-actions"><button class="btn-sm" id="csvBtn">📄 상환 스케줄 CSV 저장</button></div>' +
      '<h3 style="margin:14px 0 6px;font-size:.95rem">월별 상환 스케줄</h3>' +
      '<table class="calc-table"><thead><tr><th>회차</th><th>납입액</th><th>원금/이자</th><th>잔액</th></tr></thead><tbody>' + rowsHtml + '</tbody></table>';
    var cb = document.getElementById("csvBtn"); if (cb) cb.addEventListener("click", downloadCsv);
    TK.showResult();
  }

  function downloadCsv() {
    if (!lastRows) return;
    var lines = ["회차,납입액,원금,이자,잔액"];
    lastRows.forEach(function (x) { lines.push([x.month, x.payment, x.principal, x.interest, x.balance].join(",")); });
    var blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = "loan-schedule-" + lastType + ".csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    TK.toast("CSV를 저장했습니다");
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
