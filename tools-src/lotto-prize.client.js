/* 복권 당첨금 세금·실수령액 계산기 — 로직 + 순수 함수.
   건별 200만원 이하 비과세. 3억 이하분 22%(소득세20+지방2), 3억 초과분 33%(30+3).
   분리과세로 종결. 구입금액은 소득세법상 필요경비 차감 대상 아님(차감 안 함). rates 사용. */
(function () {
  "use strict";
  function lottoTax(winning, R) {
    var W = Math.round(winning);
    var L = R.lottoTax;
    if (W <= L.nonTaxableThreshold) return { taxable: false, under: 0, over: 0, incomeTax: 0, localTax: 0, totalTax: 0, net: W };
    var cut = L.brackets[0].upTo;
    var under = Math.min(W, cut), over = Math.max(0, W - cut);
    var incomeTax = Math.round(under * L.brackets[0].incomeRate / 100 + over * L.brackets[1].incomeRate / 100);
    var localTax = Math.round(incomeTax * 0.1);
    var totalTax = incomeTax + localTax;
    return { taxable: true, under: under, over: over, incomeTax: incomeTax, localTax: localTax, totalTax: totalTax, net: W - totalTax };
  }

  var LOGIC = { lottoTax: lottoTax };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.lottoTax) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var w = TK.num("winning");
    if (isNaN(w)) { err.textContent = "당첨금을 입력하세요."; return; }
    var r = lottoTax(w, R);
    var detail = r.taxable
      ? '<tr><th>3억 이하분 (22%)</th><td>-' + f(Math.round(r.under * 0.22)) + ' 원</td></tr>' + (r.over ? '<tr><th>3억 초과분 (33%)</th><td>-' + f(Math.round(r.over * 0.33)) + ' 원</td></tr>' : '')
      : '<tr><td colspan="2" style="text-align:center;color:var(--ok,#1f9d57)">건별 200만원 이하라 비과세입니다 🎉</td></tr>';
    document.getElementById("ltResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.net) + '</span><small>원</small></div><p class="result-sub">실수령액 (세금 ' + f(r.totalTax) + '원 공제)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>당첨금</th><td>' + f(Math.round(w)) + ' 원</td></tr>' +
      detail +
      '<tr><th>소득세</th><td>-' + f(r.incomeTax) + ' 원</td></tr>' +
      '<tr><th>지방소득세</th><td>-' + f(r.localTax) + ' 원</td></tr>' +
      '<tr><th>세금 합계</th><td>-' + f(r.totalTax) + ' 원</td></tr>' +
      '<tr><th>실수령액</th><td><strong>' + f(r.net) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 복권 당첨금은 분리과세로 원천징수 후 종결됩니다. 복권 구입금액은 소득세법상 필요경비로 차감되지 않습니다.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
