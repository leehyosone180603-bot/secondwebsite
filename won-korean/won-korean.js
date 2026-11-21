/* 금액 한글 변환기 — 숫자 → 한글 금액 표기(계약서·영수증용).
   예) 35000000 → "삼천오백만" / "일금 삼천오백만원정". 조 단위까지 지원. */
(function () {
  "use strict";
  var D = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  var U = ["", "십", "백", "천"];
  var B = ["", "만", "억", "조", "경"];
  function fourDigit(n) {
    var s = "";
    for (var i = 0; i < 4; i++) { var d = Math.floor(n / Math.pow(10, i)) % 10; if (d) s = D[d] + U[i] + s; }
    return s;
  }
  function numToKorean(num) {
    num = Math.floor(Math.abs(Number(num)));
    if (!isFinite(num) || num === 0) return "영";
    var parts = [], bi = 0;
    while (num > 0 && bi < B.length) {
      var g = num % 10000;
      if (g > 0) parts.unshift(fourDigit(g) + B[bi]);
      num = Math.floor(num / 10000); bi++;
    }
    return parts.join("");
  }

  var LOGIC = { numToKorean: numToKorean, fourDigit: fourDigit };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function parseNum(v) { var n = parseFloat(String(v).replace(/[,\s]/g, "")); return isNaN(n) ? NaN : n; }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var raw = TK.val("amount");
    var n = parseNum(raw);
    if (isNaN(n) || n < 0) { err.textContent = "금액(숫자)을 입력하세요."; return; }
    var intN = Math.floor(n);
    var ko = numToKorean(intN);
    var comma = intN.toLocaleString("ko-KR");
    var formal = "일금 " + ko + "원정";
    document.getElementById("wkResult").innerHTML =
      '<div class="result-hero"><div class="big" style="font-size:1.5rem;line-height:1.4"><span>' + ko + '원</span></div><p class="result-sub">' + comma + ' 원</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>한글 금액</th><td>' + ko + ' 원</td></tr>' +
      '<tr><th>계약서 표기</th><td>' + formal + '</td></tr>' +
      '<tr><th>숫자</th><td>' + comma + ' 원</td></tr>' +
      '</tbody></table>' +
      '<div class="result-actions">' +
      '<button class="btn-sm" id="copyKo">📋 한글 금액 복사</button>' +
      '<button class="btn-sm" id="copyFormal">📋 계약서 표기 복사</button></div>';
    var ck = document.getElementById("copyKo"); if (ck) ck.addEventListener("click", function () { TK.copyText(ko + "원").then(function () { TK.toast("복사했습니다"); }); });
    var cf = document.getElementById("copyFormal"); if (cf) cf.addEventListener("click", function () { TK.copyText(formal).then(function () { TK.toast("복사했습니다"); }); });
    TK.showResult();
  }

  var inp = document.getElementById("amount");
  if (inp) inp.addEventListener("input", calc);
  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
