/* 팁 계산기 — 순수 함수. 팁 = 금액×팁%, 총액 = 금액+팁, 1인당 = 총액/인원. */
(function () {
  "use strict";
  function tipCalc(amount, pct, people) {
    var tip = amount * pct / 100, total = amount + tip, n = people > 0 ? people : 1;
    return { tip: tip, total: total, perPerson: total / n, tipPerPerson: tip / n };
  }
  var LOGIC = { tipCalc: tipCalc };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(Math.round(n)); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var amount = TK.num("amount"), pct = TK.num("pct"), people = TK.num("people");
    if (isNaN(amount) || amount < 0) { err.textContent = "금액을 입력하세요."; return; }
    if (isNaN(pct) || pct < 0) { err.textContent = "팁 비율을 입력하세요."; return; }
    if (isNaN(people) || people < 1) people = 1;
    var r = tipCalc(amount, pct, people);
    document.getElementById("tipResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.total) + '</span><small>원</small></div><p class="result-sub">총액 (팁 ' + f(r.tip) + '원 포함)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>금액</th><td>' + f(amount) + ' 원</td></tr>' +
      '<tr><th>팁 (' + pct + '%)</th><td>' + f(r.tip) + ' 원</td></tr>' +
      '<tr><th>총액</th><td><strong>' + f(r.total) + ' 원</strong></td></tr>' +
      (people > 1 ? '<tr><th>1인당 (' + people + '명)</th><td><strong>' + f(r.perPerson) + ' 원</strong></td></tr><tr><th>1인당 팁</th><td>' + f(r.tipPerPerson) + ' 원</td></tr>' : '') +
      '</tbody></table>';
    TK.showResult();
  }
  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
