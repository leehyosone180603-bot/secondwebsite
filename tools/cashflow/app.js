(function () {
  "use strict";
  var U = window.SellerUI, C = window.SellerCalc;
  var KEY = "seller_cashflow_v1";
  U.renderTabs("sellerTabs", "/tools/cashflow/");
  U.year();

  var fixedIds = ["f_labor", "f_rent", "f_insur", "f_util", "f_tel", "f_sol", "f_etc"];
  var varIds = ["v_buy", "v_mat", "v_ship", "v_ad", "v_log", "v_etc"];
  var baseIds = ["startAmount", "targetEnd", "incomeSettle", "incomeEtc"];
  var allIds = baseIds.concat(fixedIds, varIds);
  var el = {};
  allIds.forEach(function (id) { el[id] = document.getElementById(id); });

  function readInputs() {
    var fixed = {}, variable = {};
    fixedIds.forEach(function (id) { fixed[id] = U.parseInt0(el[id].value); });
    varIds.forEach(function (id) { variable[id] = U.parseInt0(el[id].value); });
    return {
      startAmount: U.parseInt0(el.startAmount.value), targetEnd: U.parseInt0(el.targetEnd.value),
      incomeSettle: U.parseInt0(el.incomeSettle.value), incomeEtc: U.parseInt0(el.incomeEtc.value),
      fixed: fixed, variable: variable
    };
  }

  var lossTag = ' <span class="loss-tag">부족</span>';
  function recalc() {
    var i = readInputs(), r = C.cashflow(i);
    document.getElementById("rBalance").textContent = U.won(r.expectedBalance);
    var short = r.diff < 0;
    var d = document.getElementById("rDiff");
    d.innerHTML = (r.diff < 0 ? U.won(r.diff) : "+" + U.won(r.diff)) + (short ? lossTag : "");
    d.classList.toggle("is-loss", short);
    document.getElementById("rIncome").textContent = U.won(r.incomeTotal);
    document.getElementById("rFixed").textContent = U.won(r.fixedTotal);
    document.getElementById("rVar").textContent = U.won(r.variableTotal);

    // 수입 대비 지출 비율 막대
    var income = r.incomeTotal + i.startAmount;
    var spend = r.fixedTotal + r.variableTotal;
    var ratio = income > 0 ? spend / income * 100 : (spend > 0 ? 100 : 0);
    var fill = document.getElementById("flowFill");
    fill.style.width = Math.min(100, ratio) + "%";
    fill.classList.toggle("over", ratio > 100);
    document.getElementById("flowLegend").textContent =
      income > 0 ? "가용자금(월초+수입) 대비 지출 " + (Math.round(ratio * 10) / 10) + "%" : "";
    U.store(KEY, { i: { base: pickBase(i), fixed: i.fixed, variable: i.variable } });
  }
  function pickBase(i) { return { startAmount: i.startAmount, targetEnd: i.targetEnd, incomeSettle: i.incomeSettle, incomeEtc: i.incomeEtc }; }

  function restore() {
    var s = U.load(KEY); if (!s || !s.i) return;
    var b = s.i.base || {}, f = s.i.fixed || {}, v = s.i.variable || {};
    baseIds.forEach(function (id) { if (b[id]) el[id].value = Number(b[id]).toLocaleString("ko-KR"); });
    fixedIds.forEach(function (id) { if (f[id]) el[id].value = Number(f[id]).toLocaleString("ko-KR"); });
    varIds.forEach(function (id) { if (v[id]) el[id].value = Number(v[id]).toLocaleString("ko-KR"); });
  }

  allIds.forEach(function (id) { U.bindMoney(el[id], recalc); });

  document.getElementById("resetBtn").addEventListener("click", function () {
    allIds.forEach(function (id) { el[id].value = ""; });
    try { localStorage.removeItem(KEY); } catch (e) {}
    recalc();
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var i = readInputs(), r = C.cashflow(i);
    var txt = ["[현금 흐름 계산 결과 · 건강흐름]",
      "월초 " + U.won(i.startAmount) + " / 수입 " + U.won(r.incomeTotal),
      "고정비 " + U.won(r.fixedTotal) + " / 변동비 " + U.won(r.variableTotal),
      "예상 잔액 " + U.won(r.expectedBalance),
      "목표 대비 차액 " + (r.diff < 0 ? U.won(r.diff) + " (부족)" : "+" + U.won(r.diff)),
      "https://healthfortune.co.kr/tools/cashflow/"].join("\n");
    U.copyText(txt, this);
  });

  restore();
  recalc();
})();
