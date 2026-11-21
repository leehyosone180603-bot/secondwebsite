/* 할인가 계산기 — 순수 함수 + 2모드.
   byRate: 정가·할인율 → 할인가·할인액(+2차 할인 선택). byPrice: 정가·판매가 → 할인율. */
(function () {
  "use strict";
  function salePrice(list, ratePct) { return Math.round(list * (1 - ratePct / 100)); }
  function discountAmount(list, ratePct) { return Math.round(list * ratePct / 100); }
  function chained(list, r1, r2) { return Math.round(list * (1 - r1 / 100) * (1 - r2 / 100)); }
  function rateFromPrices(list, sale) { return list === 0 ? 0 : (list - sale) / list * 100; }

  var LOGIC = { salePrice: salePrice, discountAmount: discountAmount, chained: chained, rateFromPrices: rateFromPrices };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }
  function d1(n) { return Number(n).toLocaleString("ko-KR", { maximumFractionDigits: 1 }); }
  var mode = "byRate";
  function setMode(m) { mode = m; document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m); }); document.querySelectorAll(".dc-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; }); var c = document.getElementById("tk-result-card"); if (c) c.hidden = true; }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var list = TK.num("list");
    if (isNaN(list) || list < 0) { err.textContent = "정가를 입력하세요."; return; }
    var html;
    if (mode === "byRate") {
      var r1 = TK.num("rate1"); if (isNaN(r1)) { err.textContent = "할인율을 입력하세요."; return; }
      var r2 = TK.num("rate2"); var has2 = !isNaN(r2) && r2 > 0;
      var final = has2 ? chained(list, r1, r2) : salePrice(list, r1);
      var saved = list - final;
      var effRate = rateFromPrices(list, final);
      html = '<div class="result-hero"><div class="big"><span>' + f(final) + '</span><small>원</small></div><p class="result-sub">할인가 (' + f(saved) + '원 할인)</p></div>' +
        '<table class="calc-table"><tbody>' +
        '<tr><th>정가</th><td>' + f(list) + ' 원</td></tr>' +
        '<tr><th>할인율</th><td>' + d1(r1) + ' %' + (has2 ? ' + ' + d1(r2) + ' % (중복)' : '') + '</td></tr>' +
        (has2 ? '<tr><th>실질 할인율</th><td>' + d1(effRate) + ' %</td></tr>' : '') +
        '<tr><th>할인액</th><td>-' + f(saved) + ' 원</td></tr>' +
        '<tr><th>할인가</th><td><strong>' + f(final) + ' 원</strong></td></tr>' +
        '</tbody></table>' +
        (has2 ? '<p class="footer-notice" style="margin:8px 0 0">중복(연속) 할인은 더한 값이 아니라 차례로 적용합니다. ' + d1(r1) + '%+' + d1(r2) + '%가 아닌 실질 ' + d1(effRate) + '%입니다.</p>' : '');
    } else {
      var sale = TK.num("sale"); if (isNaN(sale)) { err.textContent = "판매가(할인된 가격)를 입력하세요."; return; }
      if (sale > list) { err.textContent = "판매가가 정가보다 큽니다."; return; }
      var rate = rateFromPrices(list, sale), saved2 = list - sale;
      html = '<div class="result-hero"><div class="big"><span>' + d1(rate) + '</span><small>% 할인</small></div><p class="result-sub">' + f(saved2) + '원 할인</p></div>' +
        '<table class="calc-table"><tbody>' +
        '<tr><th>정가</th><td>' + f(list) + ' 원</td></tr>' +
        '<tr><th>판매가</th><td>' + f(sale) + ' 원</td></tr>' +
        '<tr><th>할인액</th><td>-' + f(saved2) + ' 원</td></tr>' +
        '<tr><th>할인율</th><td><strong>' + d1(rate) + ' %</strong></td></tr>' +
        '</tbody></table>';
    }
    document.getElementById("dcResult").innerHTML = html;
    TK.showResult();
  }

  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setMode("byRate");
  if (location.search) window.ToolKit.ready(calc);
})();
