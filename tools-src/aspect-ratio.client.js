/* 화면 비율 계산기 — 순수 함수. 비율(rw:rh)과 한 변으로 나머지 변 계산. */
(function () {
  "use strict";
  function gcd(a, b) { a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b)); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
  function heightFor(rw, rh, width) { return width * rh / rw; }
  function widthFor(rw, rh, height) { return height * rw / rh; }
  function simplify(w, h) { var g = gcd(w, h); return [Math.round(w) / g, Math.round(h) / g]; }

  var LOGIC = { gcd: gcd, heightFor: heightFor, widthFor: widthFor, simplify: simplify };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function round(n) { return Math.round(n * 100) / 100; }
  function fmtNum(n) { return Number(round(n)).toLocaleString("ko-KR", { maximumFractionDigits: 2 }); }
  function parseN(v) { var n = parseFloat(String(v).replace(/,/g, "")); return isNaN(n) ? NaN : n; }

  function ratio() {
    var sel = document.getElementById("preset").value;
    if (sel !== "custom") { var p = sel.split(":"); return [+p[0], +p[1]]; }
    return [parseN(TK.val("rw")), parseN(TK.val("rh"))];
  }
  function syncCustom() { document.getElementById("customRow").style.display = document.getElementById("preset").value === "custom" ? "" : "none"; }

  var lock = false;
  function fromW() {
    if (lock) return; lock = true;
    var r = ratio(), w = parseN(TK.val("width"));
    if (r[0] > 0 && r[1] > 0 && !isNaN(w)) document.getElementById("height").value = fmtNum(heightFor(r[0], r[1], w));
    lock = false; note();
  }
  function fromH() {
    if (lock) return; lock = true;
    var r = ratio(), h = parseN(TK.val("height"));
    if (r[0] > 0 && r[1] > 0 && !isNaN(h)) document.getElementById("width").value = fmtNum(widthFor(r[0], r[1], h));
    lock = false; note();
  }
  function note() {
    var w = parseN(TK.val("width")), h = parseN(TK.val("height")), el = document.getElementById("arNote");
    if (!el) return;
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) { el.textContent = ""; return; }
    var s = simplify(w, h);
    el.innerHTML = "해상도 <strong>" + fmtNum(w) + " × " + fmtNum(h) + "</strong> · 비율 <strong>" + s[0] + ":" + s[1] + "</strong>";
  }

  document.getElementById("preset").addEventListener("change", function () { syncCustom(); fromW(); });
  document.getElementById("rw").addEventListener("input", fromW);
  document.getElementById("rh").addEventListener("input", fromW);
  document.getElementById("width").addEventListener("input", fromW);
  document.getElementById("height").addEventListener("input", fromH);
  document.getElementById("calcBtn").addEventListener("click", function () { fromW(); TK.showResult(); });
  syncCustom();
  if (location.search) window.ToolKit.ready(fromW);
})();
