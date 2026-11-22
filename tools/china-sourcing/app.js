(function () {
  "use strict";
  var U = window.SellerUI, C = window.SellerCalc;
  var KEY = "seller_china_v1";
  U.renderTabs("sellerTabs", "/tools/china-sourcing/");
  U.year();

  var moneyIds = ["freight", "customsCost"];
  var decIds = ["customsFx", "bizFx", "unitPrice", "qty", "weight", "innerFreight", "agentRate", "dutyRate", "vatRate"];
  var el = {};
  moneyIds.concat(decIds).forEach(function (id) { el[id] = document.getElementById(id); });

  function readInputs() {
    return {
      customsFx: U.parseDec(el.customsFx.value), bizFx: U.parseDec(el.bizFx.value),
      unitPrice: U.parseDec(el.unitPrice.value), qty: U.parseDec(el.qty.value),
      weight: U.parseDec(el.weight.value), innerFreight: U.parseDec(el.innerFreight.value),
      agentRate: U.parseDec(el.agentRate.value), freight: U.parseInt0(el.freight.value),
      customsCost: U.parseInt0(el.customsCost.value), dutyRate: U.parseDec(el.dutyRate.value),
      vatRate: U.parseDec(el.vatRate.value)
    };
  }

  function recalc() {
    var i = readInputs(), r = C.china(i);
    document.getElementById("rPerUnit").textContent = U.won(r.perUnit);
    document.getElementById("rTotal").textContent = U.won(r.totalBuyWon);
    document.getElementById("rDuty").textContent = U.won(r.duty);
    document.getElementById("rVat").textContent = U.won(r.vat);
    document.getElementById("rAgentY").textContent = U.yuan(r.agentTotalYuan);
    U.store(KEY, { i: i });
  }

  function restore() {
    var s = U.load(KEY); if (!s || !s.i) return;
    var i = s.i;
    moneyIds.forEach(function (id) { if (i[id]) el[id].value = Number(i[id]).toLocaleString("ko-KR"); });
    decIds.forEach(function (id) { if (i[id] !== undefined && i[id] !== 0) el[id].value = i[id]; });
  }

  moneyIds.forEach(function (id) { U.bindMoney(el[id], recalc); });
  decIds.forEach(function (id) { U.bindDecimal(el[id], recalc); });

  document.getElementById("resetBtn").addEventListener("click", function () {
    var defaults = { agentRate: "8", dutyRate: "8", vatRate: "10" };
    moneyIds.concat(decIds).forEach(function (id) { el[id].value = defaults[id] || ""; });
    try { localStorage.removeItem(KEY); } catch (e) {}
    recalc();
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var i = readInputs(), r = C.china(i);
    var txt = ["[중국 사입 계산 결과 · 건강흐름]",
      "제품단가 ¥" + i.unitPrice + " × " + i.qty + "개",
      "대행 총비용 " + U.yuan(r.agentTotalYuan) + " / " + U.won(r.agentTotalWon),
      "관세 " + U.won(r.duty) + " / 부가세 " + U.won(r.vat),
      "총 매입예상비용 " + U.won(r.totalBuyWon), "개당 매입단가 " + U.won(r.perUnit),
      "https://healthfortune.co.kr/tools/china-sourcing/"].join("\n");
    U.copyText(txt, this);
  });
  document.getElementById("toMarginBtn").addEventListener("click", function () {
    var r = C.china(readInputs());
    var perUnit = r.perUnit && isFinite(r.perUnit) ? Math.round(r.perUnit) : 0;
    try { localStorage.setItem("seller_handoff_buy", String(perUnit)); } catch (e) {}
    location.href = "/tools/margin/?buy=" + perUnit;
  });

  restore();
  recalc();
})();
