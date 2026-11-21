/* 부가세 계산기 — 브라우저 로직 + 순수 함수(테스트용 export).
   모드: 1) 공급가→합계  2) 합계(부가세포함)→공급가·부가세 분리  3) 부가세만→역산
   요율은 window.RATES.vatRate(기본 10%) 사용. 원 단위 반올림/절사 선택. */
(function () {
  "use strict";

  function roundWon(n, mode) { return mode === "floor" ? Math.floor(n) : (mode === "ceil" ? Math.ceil(n) : Math.round(n)); }
  // 공급가 → 부가세·합계
  function supplyToTotal(supply, rate, mode) { var s = Math.round(supply), vat = roundWon(supply * rate / 100, mode); return { supply: s, vat: vat, total: s + vat }; }
  // 합계(부가세 포함) → 공급가·부가세
  function totalToSupply(total, rate, mode) { var t = Math.round(total), supply = roundWon(t / (1 + rate / 100), mode); return { supply: supply, vat: t - supply, total: t }; }
  // 부가세액 → 공급가·합계
  function supplyFromVat(vat, rate) { var vv = Math.round(vat), supply = Math.round(vv / (rate / 100)); return { supply: supply, vat: vv, total: supply + vv }; }

  var LOGIC = { roundWon: roundWon, supplyToTotal: supplyToTotal, totalToSupply: totalToSupply, supplyFromVat: supplyFromVat };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return; // Node면 종료

  var TK = window.ToolKit;
  function rate() { try { return (window.RATES && window.RATES.vatRate && window.RATES.vatRate.value) || 10; } catch (e) { return 10; } }
  function roundMode() { var el = document.getElementById("roundMode"); return el ? el.value : "round"; }

  var mode = "s2t"; // s2t | t2s | vat
  function setMode(m) {
    mode = m;
    document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m); });
    document.querySelectorAll(".vat-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; });
    var card = document.getElementById("tk-result-card"); if (card) card.hidden = true;
  }

  function addItemRow(val) {
    var wrap = document.getElementById("itemRows");
    var row = document.createElement("div");
    row.className = "input-unit"; row.style.margin = "0 0 8px";
    row.innerHTML = '<input type="text" data-num class="item-supply" inputmode="numeric" placeholder="품목 공급가" value="' + (val || "") + '"><span class="unit">원</span> <button type="button" class="btn-sm item-del" title="삭제">✕</button>';
    wrap.appendChild(row);
    TK && TK.fmt; // 숫자 포맷은 tool-kit가 data-num에 위임하지만 동적 추가분은 수동 바인딩
    var inp = row.querySelector("input");
    inp.setAttribute("inputmode", "numeric");
    inp.addEventListener("input", function () { var raw = inp.value.replace(/[^0-9]/g, ""); inp.value = raw ? Number(raw).toLocaleString("en-US") : ""; });
    row.querySelector(".item-del").addEventListener("click", function () { row.remove(); });
  }
  function sumItems() {
    var t = 0; document.querySelectorAll(".item-supply").forEach(function (i) { var n = parseFloat((i.value || "").replace(/[^0-9.]/g, "")); if (!isNaN(n)) t += n; }); return t;
  }

  function show(r) {
    var f = TK.fmt;
    document.getElementById("rSupply").textContent = f(r.supply);
    document.getElementById("rVat").textContent = f(r.vat);
    document.getElementById("rTotal").textContent = f(r.total);
    document.getElementById("rRate").textContent = rate();
    TK.showResult();
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var rt = rate(), rm = roundMode();
    if (mode === "s2t") {
      var single = TK.num("supplyInput");
      var base = sumItems() || (isNaN(single) ? NaN : single);
      if (isNaN(base)) { err.textContent = "공급가액을 입력하세요."; return; }
      show(supplyToTotal(base, rt, rm));
    } else if (mode === "t2s") {
      var total = TK.num("totalInput");
      if (isNaN(total)) { err.textContent = "합계금액(부가세 포함)을 입력하세요."; return; }
      show(totalToSupply(total, rt, rm));
    } else {
      var vat = TK.num("vatInput");
      if (isNaN(vat)) { err.textContent = "부가세액을 입력하세요."; return; }
      show(supplyFromVat(vat, rt));
    }
  }

  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  document.getElementById("addItem").addEventListener("click", function () { addItemRow(); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setMode("s2t");
  if (location.search) setTimeout(calc, 0);
})();
