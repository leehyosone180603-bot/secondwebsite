/* 프리랜서(사업소득) 세금 계산기 — 로직 + 순수 함수.
   모드1: 원천징수(사업소득 3.3% / 기타소득 8.8%), 지급액↔세전 양방향
   모드2: 5월 종합소득세 추정(수입−경비−인적공제 → 누진세율 → 기납부 3% 정산) */
(function () {
  "use strict";

  // 원천징수: 세전 지급액 → 세액·실수령 (소득세:지방 = 10:1 구조, total/1.1 = 소득세율)
  function withhold(gross, totalRate) {
    var g = Math.round(gross);
    var tax = Math.round(g * totalRate / 100);
    var incomeTax = Math.round(g * (totalRate / 1.1) / 100);
    return { gross: g, tax: tax, incomeTax: incomeTax, localTax: tax - incomeTax, net: g - tax };
  }
  // 실수령 → 세전 역산
  function grossFromNet(net, totalRate) { return Math.round(net / (1 - totalRate / 100)); }

  // 누진세율 적용(과세표준 → 산출세액)
  function applyBracket(base, brackets) {
    if (base <= 0) return 0;
    for (var i = 0; i < brackets.length; i++) {
      var b = brackets[i];
      if (b.upTo === null || base <= b.upTo) return Math.max(0, Math.round(base * b.rate / 100 - b.deduction));
    }
    return 0;
  }
  // 종합소득세 추정: 수입, 경비(금액), 인적공제, 기납부율(사업 3%)
  function comprehensive(income, expense, personalDeduction, brackets, prepaidRate) {
    var base = Math.max(0, Math.round(income - expense - personalDeduction));
    var computed = applyBracket(base, brackets);
    var local = Math.round(computed * 0.1);
    var prepaid = Math.round(income * (prepaidRate || 3) / 100);
    return { taxBase: base, computedTax: computed, localTax: local, prepaid: prepaid, settle: prepaid - computed };
  }

  var LOGIC = { withhold: withhold, grossFromNet: grossFromNet, applyBracket: applyBracket, comprehensive: comprehensive };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function rates() { return (window.RATES || {}); }
  function totalRate() {
    var kind = document.getElementById("incomeKind").value;
    var R = rates();
    if (kind === "other") return (R.withholding && R.withholding.otherIncome && R.withholding.otherIncome.value) || 8.8;
    return (R.withholding && R.withholding.businessIncome && R.withholding.businessIncome.value) || 3.3;
  }
  var mode = "wh";
  function setMode(m) {
    mode = m;
    document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m); });
    document.querySelectorAll(".fl-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; });
    var c = document.getElementById("tk-result-card"); if (c) c.hidden = true;
  }
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var body = document.getElementById("flResult");
    if (mode === "wh") {
      var rt = totalRate();
      var dir = document.getElementById("whDir").value;
      var r;
      if (dir === "g2n") { var g = TK.num("whGross"); if (isNaN(g)) { err.textContent = "세전 지급액을 입력하세요."; return; } r = withhold(g, rt); }
      else { var n = TK.num("whNet"); if (isNaN(n)) { err.textContent = "실수령액을 입력하세요."; return; } r = withhold(grossFromNet(n, rt), rt); }
      body.innerHTML =
        '<div class="result-hero"><div class="big"><span>' + f(r.net) + '</span><small>원</small></div><p class="result-sub">실수령액 (세전 ' + f(r.gross) + '원, 원천징수 ' + rt + '%)</p></div>' +
        '<table class="calc-table"><tbody>' +
        '<tr><th>세전 지급액</th><td>' + f(r.gross) + ' 원</td></tr>' +
        '<tr><th>소득세</th><td>' + f(r.incomeTax) + ' 원</td></tr>' +
        '<tr><th>지방소득세</th><td>' + f(r.localTax) + ' 원</td></tr>' +
        '<tr><th>세금 합계</th><td>' + f(r.tax) + ' 원</td></tr>' +
        '<tr><th>실수령액</th><td><strong>' + f(r.net) + ' 원</strong></td></tr>' +
        '</tbody></table>';
    } else {
      var R = rates();
      var brackets = (R.incomeTax && R.incomeTax.brackets) || [];
      var income = TK.num("ciIncome");
      if (isNaN(income)) { err.textContent = "연 수입금액을 입력하세요."; return; }
      var expMode = document.getElementById("ciExpMode").value;
      var expense = expMode === "amount" ? (TK.num("ciExpAmt") || 0) : Math.round(income * (TK.num("ciExpRate") || 0) / 100);
      var persons = TK.num("ciFamily"); if (isNaN(persons) || persons < 1) persons = 1;
      var personalDeduction = persons * 1500000;
      var r2 = comprehensive(income, expense, personalDeduction, brackets, 3);
      var sign = r2.settle >= 0 ? "환급 예상" : "추가납부 예상";
      body.innerHTML =
        '<div class="result-hero"><div class="big"><span>' + f(Math.abs(r2.settle)) + '</span><small>원</small></div><p class="result-sub">' + sign + ' (기납부 3% − 산출세액, 추정)</p></div>' +
        '<table class="calc-table"><tbody>' +
        '<tr><th>소득금액 (수입−경비)</th><td>' + f(Math.round(income - expense)) + ' 원</td></tr>' +
        '<tr><th>과세표준 (−인적공제 ' + f(personalDeduction) + ')</th><td>' + f(r2.taxBase) + ' 원</td></tr>' +
        '<tr><th>산출세액(소득세)</th><td>' + f(r2.computedTax) + ' 원</td></tr>' +
        '<tr><th>지방소득세(10%)</th><td>' + f(r2.localTax) + ' 원</td></tr>' +
        '<tr><th>기납부세액(원천징수 3%)</th><td>' + f(r2.prepaid) + ' 원</td></tr>' +
        '<tr><th>' + sign + '</th><td><strong>' + f(Math.abs(r2.settle)) + ' 원</strong></td></tr>' +
        '</tbody></table>' +
        '<p class="footer-notice" style="margin:8px 0 0">※ 세액공제·가산세 등을 제외한 단순 추정입니다. 실제 신고는 홈택스·세무사 확인을 권합니다.</p>';
    }
    TK.showResult();
  }

  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  var whDir = document.getElementById("whDir");
  if (whDir) whDir.addEventListener("change", function () {
    document.getElementById("whGrossWrap").hidden = whDir.value !== "g2n";
    document.getElementById("whNetWrap").hidden = whDir.value !== "n2g";
  });
  var expMode = document.getElementById("ciExpMode");
  if (expMode) expMode.addEventListener("change", function () {
    document.getElementById("ciExpRateWrap").hidden = expMode.value !== "rate";
    document.getElementById("ciExpAmtWrap").hidden = expMode.value !== "amount";
  });
  setMode("wh");
  if (location.search) setTimeout(calc, 0);
})();
