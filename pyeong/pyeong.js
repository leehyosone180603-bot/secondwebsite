/* 평 ↔ 제곱미터(㎡) 변환기 — 순수 함수 + 양방향 실시간 변환.
   1평 = 6자×6자, 1자 = 10/33 m → 1평 = (60/33)² = 400/121 ㎡ ≈ 3.3058㎡. */
(function () {
  "use strict";
  var PY = 400 / 121; // 1평의 ㎡ (정확값)
  function pyeongToM2(p) { return p * PY; }
  function m2ToPyeong(m) { return m / PY; }

  var LOGIC = { pyeongToM2: pyeongToM2, m2ToPyeong: m2ToPyeong, PY_M2: PY };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function dec(n, d) { // 소수 d자리 + 천단위 콤마
    if (!isFinite(n)) return "0";
    return Number(n).toLocaleString("ko-KR", { maximumFractionDigits: d == null ? 2 : d });
  }
  function parseNum(v) { var n = parseFloat(String(v).replace(/,/g, "")); return isNaN(n) ? NaN : n; }

  var pyEl, m2El, lock = false;
  function fromPy() {
    if (lock) return; lock = true;
    var p = parseNum(pyEl.value);
    m2El.value = isNaN(p) ? "" : dec(pyeongToM2(p), 2);
    lock = false; renderNote();
  }
  function fromM2() {
    if (lock) return; lock = true;
    var m = parseNum(m2El.value);
    pyEl.value = isNaN(m) ? "" : dec(m2ToPyeong(m), 2);
    lock = false; renderNote();
  }
  function renderNote() {
    var p = parseNum(pyEl.value), note = document.getElementById("pyNote");
    if (!note) return;
    if (isNaN(p)) { note.textContent = ""; return; }
    note.innerHTML = "<strong>" + dec(p, 1) + "평</strong> = <strong>" + dec(pyeongToM2(p), 2) + "㎡</strong> (1평 = 약 3.3058㎡)";
  }

  // 평수별 ㎡ 참고표(분양에서 자주 쓰는 평수)
  function refTable() {
    var common = [10, 15, 20, 24, 25, 32, 34, 40, 45, 50];
    var rows = common.map(function (p) {
      return "<tr><td>" + p + "평</td><td>" + dec(pyeongToM2(p), 2) + " ㎡</td></tr>";
    }).join("");
    document.getElementById("pyRef").innerHTML =
      '<table class="calc-table"><thead><tr><th>평</th><th>제곱미터(㎡)</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  pyEl = document.getElementById("pyeong");
  m2El = document.getElementById("m2");
  pyEl.addEventListener("input", fromPy);
  m2El.addEventListener("input", fromM2);
  var cb = document.getElementById("calcBtn"); if (cb) cb.addEventListener("click", function () { fromPy(); TK.showResult(); });
  refTable();
  if (location.search) window.ToolKit.ready(function () { fromPy(); });
})();
