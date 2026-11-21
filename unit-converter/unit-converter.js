/* 단위 변환기 — 순수 함수(계수 기반) + 온도 특수식.
   길이·무게·넓이·부피·속도는 기준단위 계수로 변환, 온도(℃·℉·K)는 별도 공식. */
(function () {
  "use strict";
  var CATS = {
    length: { name: "길이", units: { "mm": 0.001, "cm": 0.01, "m": 1, "km": 1000, "inch(인치)": 0.0254, "ft(피트)": 0.3048, "yd(야드)": 0.9144, "mile(마일)": 1609.344 } },
    weight: { name: "무게", units: { "mg": 1e-6, "g": 0.001, "kg": 1, "t(톤)": 1000, "oz(온스)": 0.028349523125, "lb(파운드)": 0.45359237, "근(600g)": 0.6, "돈(3.75g)": 0.00375 } },
    area: { name: "넓이", units: { "㎠": 0.0001, "㎡": 1, "㎢": 1e6, "평": 400 / 121, "에이커": 4046.8564224, "헥타르(ha)": 10000 } },
    volume: { name: "부피", units: { "mL": 0.001, "L": 1, "㎥": 1000, "컵(200mL)": 0.2, "갤런(US)": 3.785411784, "되(1.8L)": 1.8, "말(18L)": 18 } },
    speed: { name: "속도", units: { "m/s": 1, "km/h": 1 / 3.6, "mph": 0.44704, "knot(노트)": 0.514444444 } }
  };
  // 온도
  function toC(u, v) { return u === "℃" ? v : u === "℉" ? (v - 32) * 5 / 9 : v - 273.15; }
  function fromC(u, c) { return u === "℃" ? c : u === "℉" ? c * 9 / 5 + 32 : c + 273.15; }
  var TEMP_UNITS = ["℃", "℉", "K"];

  // 계수 기반 변환
  function convert(cat, from, to, value) {
    var u = CATS[cat].units; return value * u[from] / u[to];
  }
  function convertTemp(from, to, value) { return fromC(to, toC(from, value)); }

  var LOGIC = { CATS: CATS, convert: convert, convertTemp: convertTemp, TEMP_UNITS: TEMP_UNITS };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function sig(n) { // 유효숫자 보기 좋게
    if (!isFinite(n)) return "0";
    if (n === 0) return "0";
    var a = Math.abs(n);
    var d = a >= 1000 ? 2 : a >= 1 ? 4 : 6;
    return Number(n).toLocaleString("ko-KR", { maximumFractionDigits: d });
  }
  function parseNum(v) { var n = parseFloat(String(v).replace(/,/g, "")); return isNaN(n) ? NaN : n; }

  var cat = "length";
  function unitList(c) { return c === "temp" ? TEMP_UNITS : Object.keys(CATS[c].units); }

  function fillUnits() {
    var list = unitList(cat);
    ["fromUnit", "toUnit"].forEach(function (id, idx) {
      var sel = document.getElementById(id);
      sel.innerHTML = list.map(function (u) { return '<option value="' + u + '">' + u + '</option>'; }).join("");
      sel.selectedIndex = idx === 1 && list.length > 1 ? 1 : 0; // to는 두번째 단위 기본
    });
  }
  function setCat(c) {
    cat = c;
    document.querySelectorAll("[data-cat]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-cat") === c); });
    fillUnits(); compute();
  }
  function compute() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var v = parseNum(TK.val("fromValue"));
    var from = document.getElementById("fromUnit").value, to = document.getElementById("toUnit").value;
    if (isNaN(v)) { document.getElementById("toValue").value = ""; return; }
    var out = cat === "temp" ? convertTemp(from, to, v) : convert(cat, from, to, v);
    document.getElementById("toValue").value = sig(out);
    var note = document.getElementById("ucNote");
    if (note) note.innerHTML = "<strong>" + sig(v) + " " + from + "</strong> = <strong>" + sig(out) + " " + to + "</strong>";
  }
  function swap() {
    var fu = document.getElementById("fromUnit"), tu = document.getElementById("toUnit");
    var t = fu.value; fu.value = tu.value; tu.value = t; compute();
  }

  document.querySelectorAll("[data-cat]").forEach(function (b) { b.addEventListener("click", function () { setCat(b.getAttribute("data-cat")); }); });
  document.getElementById("fromValue").addEventListener("input", compute);
  document.getElementById("fromUnit").addEventListener("change", compute);
  document.getElementById("toUnit").addEventListener("change", compute);
  var sw = document.getElementById("swapBtn"); if (sw) sw.addEventListener("click", swap);
  var cb = document.getElementById("calcBtn"); if (cb) cb.addEventListener("click", function () { compute(); TK.showResult(); });
  setCat("length");
  if (location.search) window.ToolKit.ready(compute);
})();
