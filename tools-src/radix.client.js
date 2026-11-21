/* 진법 변환기 — 순수 함수. 2·8·10·16진수 상호 변환. */
(function () {
  "use strict";
  function isValid(str, base) {
    str = String(str).trim().toUpperCase();
    if (!str) return false;
    var re;
    if (base <= 10) re = new RegExp("^[0-" + (base - 1) + "]+$");
    else re = new RegExp("^[0-9A-" + String.fromCharCode(64 + base - 10) + "]+$");
    return re.test(str);
  }
  function convertAll(str, base) {
    if (!isValid(str, base)) return null;
    var n = parseInt(String(str).trim(), base);
    if (isNaN(n)) return null;
    return { dec: n, bin: n.toString(2), oct: n.toString(8), hex: n.toString(16).toUpperCase(), bits: n.toString(2).length };
  }

  var LOGIC = { isValid: isValid, convertAll: convertAll };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  var BASES = { bin: 2, oct: 8, dec: 10, hex: 16 }, NAME = { bin: "2진수", oct: "8진수", dec: "10진수", hex: "16진수" };

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var base = BASES[document.getElementById("fromBase").value];
    var val = TK.val("value");
    if (!val) { err.textContent = "값을 입력하세요."; return; }
    var r = convertAll(val, base);
    if (!r) { err.textContent = NAME[document.getElementById("fromBase").value] + "에 맞지 않는 문자가 있습니다."; return; }
    document.getElementById("rxResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + r.dec.toLocaleString("ko-KR") + '</span><small>10진수</small></div><p class="result-sub">' + r.bits + '비트</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>2진수 (binary)</th><td style="word-break:break-all">' + r.bin + '</td></tr>' +
      '<tr><th>8진수 (octal)</th><td>' + r.oct + '</td></tr>' +
      '<tr><th>10진수 (decimal)</th><td>' + r.dec.toLocaleString("ko-KR") + '</td></tr>' +
      '<tr><th>16진수 (hex)</th><td>' + r.hex + '</td></tr>' +
      '<tr><th>비트 수</th><td>' + r.bits + ' bit</td></tr>' +
      '</tbody></table>';
    TK.showResult();
  }
  document.getElementById("fromBase").addEventListener("change", calc);
  document.getElementById("value").addEventListener("input", calc);
  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
