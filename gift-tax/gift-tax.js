/* 증여세 계산기 — 순수 함수.
   과세표준 = 증여재산 − 증여재산공제(관계별) − 혼인·출산공제.
   산출세액 = 과세표준 × 세율 − 누진공제(상증세법 §26). 납부 = 산출 − 신고세액공제(3%). */
(function () {
  "use strict";
  function progressiveTax(base, R) {
    if (base <= 0) return 0;
    var br = R.inheritGiftTax.brackets;
    for (var i = 0; i < br.length; i++) { var b = br[i]; if (b.upTo === null || base <= b.upTo) return Math.max(0, Math.round(base * b.rate / 100 - b.deduction)); }
    return 0;
  }
  function relationDeduction(relation, R) {
    var g = R.giftDeduction;
    return { spouse: g.spouse, adult: g.linealDescendantAdult, minor: g.linealDescendantMinor, ascendant: g.linealAscendant, other: g.otherRelative }[relation] || 0;
  }
  // gift: 증여재산, relation, marriageBirth: 혼인출산공제 적용액(0~1억)
  function giftTax(gift, relation, marriageBirthAmt, R) {
    var ded = relationDeduction(relation, R);
    var mb = Math.min(Math.max(marriageBirthAmt || 0, 0), R.giftDeduction.marriageBirth);
    var base = Math.max(0, gift - ded - mb);
    var calc = progressiveTax(base, R);
    var credit = Math.round(calc * R.inheritGiftTax.filingCredit / 100);
    return { deduction: ded, marriageBirth: mb, base: base, calcTax: calc, filingCredit: credit, payable: calc - credit };
  }

  var LOGIC = { progressiveTax: progressiveTax, relationDeduction: relationDeduction, giftTax: giftTax };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }
  function syncMB() {
    var rel = document.getElementById("relation").value;
    var row = document.getElementById("mbRow");
    if (row) row.style.display = (rel === "adult" || rel === "minor") ? "" : "none";
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var R = window.RATES; if (!R || !R.giftDeduction) { err.textContent = "요율 데이터를 불러오지 못했습니다."; return; }
    var gift = TK.num("gift");
    if (isNaN(gift) || gift < 0) { err.textContent = "증여재산 가액을 입력하세요."; return; }
    var relation = document.getElementById("relation").value;
    var mb = 0;
    if ((relation === "adult" || relation === "minor") && document.getElementById("useMB").checked) mb = TK.num("mbAmt") || R.giftDeduction.marriageBirth;
    var r = LOGIC.giftTax(gift, relation, mb, R);
    var relName = { spouse: "배우자", adult: "성년 자녀(직계비속)", minor: "미성년 자녀", ascendant: "부모(직계존속)", other: "기타 친족" }[relation];

    document.getElementById("gtResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(r.payable) + '</span><small>원</small></div><p class="result-sub">납부할 증여세 (신고세액공제 3% 반영)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>증여재산 가액</th><td>' + f(Math.round(gift)) + ' 원</td></tr>' +
      '<tr><th>증여재산공제 (' + relName + ')</th><td>-' + f(r.deduction) + ' 원</td></tr>' +
      (r.marriageBirth ? '<tr><th>혼인·출산 공제</th><td>-' + f(r.marriageBirth) + ' 원</td></tr>' : '') +
      '<tr><th>과세표준</th><td>' + f(r.base) + ' 원</td></tr>' +
      '<tr><th>산출세액</th><td>' + f(r.calcTax) + ' 원</td></tr>' +
      '<tr><th>신고세액공제(3%)</th><td>-' + f(r.filingCredit) + ' 원</td></tr>' +
      '<tr><th>납부세액</th><td><strong>' + f(r.payable) + ' 원</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 10년 내 동일인 증여 합산, 세대생략·미성년 할증, 가산세 등은 반영하지 않은 추정치입니다. 정확한 금액은 세무 전문가·홈택스로 확인하세요.</p>';
    TK.showResult();
  }

  document.getElementById("relation").addEventListener("change", syncMB);
  var um = document.getElementById("useMB"); if (um) um.addEventListener("change", function () { var a = document.getElementById("mbAmtWrap"); if (a) a.style.display = um.checked ? "" : "none"; });
  document.getElementById("calcBtn").addEventListener("click", calc);
  syncMB();
  if (location.search) window.ToolKit.ready(calc);
})();
