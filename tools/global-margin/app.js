(function () {
  "use strict";
  var U = window.SellerUI, C = window.SellerCalc, F = window.SellerFees;
  var KEY = "seller_global_v1";
  U.renderTabs("sellerTabs", "/tools/global-margin/");
  U.year();

  var moneyIds = ["price", "shipFee", "bungaeji", "customs", "etc"];
  var decIds = ["bizFx", "buyForeign", "cardRate", "catFee", "linkFee", "shipFeeRate", "simpleRate"];
  var el = {};
  moneyIds.concat(decIds).forEach(function (id) { el[id] = document.getElementById(id); });
  var market = document.getElementById("market"), feeAsof = document.getElementById("feeAsof");
  var category = document.getElementById("category"), feeSource = document.getElementById("feeSource");
  var currency = document.getElementById("currency"), curUnit = document.getElementById("curUnit");
  var simpleWrap = document.getElementById("simpleWrap");
  var curSymbols = { cny: "¥", usd: "$", jpy: "¥(100)", eur: "€", gbp: "£", aud: "A$" };

  var om = F.openMarket;
  Object.keys(om).forEach(function (k) {
    var o = document.createElement("option"); o.value = k; o.textContent = om[k].name; market.appendChild(o);
  });
  U.renderSources("feeSources", F.sources);

  function fillCategories(k) {
    var m = om[k] || {}, cats = m.categories || [];
    category.innerHTML = "";
    var first = document.createElement("option"); first.value = "";
    first.textContent = cats.length ? "카테고리 선택(직접 입력 가능)" : "직접 입력"; category.appendChild(first);
    cats.forEach(function (c, idx) { var o = document.createElement("option"); o.value = String(idx); o.textContent = c.name + " (" + c.fee + "%)"; category.appendChild(o); });
  }
  function applyCategory() {
    var k = market.value, m = om[k] || {}, idx = category.value;
    if (idx !== "" && m.categories && m.categories[idx]) el.catFee.value = m.categories[idx].fee;
    recalc();
  }

  function taxType() { return (document.querySelector('input[name="tax"]:checked') || {}).value || "normal"; }
  function readInputs() {
    return {
      price: U.parseInt0(el.price.value), shipFee: U.parseInt0(el.shipFee.value),
      buyForeign: U.parseDec(el.buyForeign.value), bizFx: U.parseDec(el.bizFx.value),
      per100: currency.value === "jpy", cardRate: U.parseDec(el.cardRate.value),
      bungaeji: U.parseInt0(el.bungaeji.value), customs: U.parseInt0(el.customs.value),
      etc: U.parseInt0(el.etc.value), catFee: U.parseDec(el.catFee.value),
      linkFee: U.parseDec(el.linkFee.value), shipFeeRate: U.parseDec(el.shipFeeRate.value),
      taxType: taxType(), simpleRate: U.parseDec(el.simpleRate.value)
    };
  }

  var lossTag = ' <span class="loss-tag">적자</span>';
  function recalc() {
    var i = readInputs(), r = C.globalMargin(i);
    var loss = r.profit < 0;
    var p = document.getElementById("rProfit");
    p.innerHTML = U.won(r.profit) + (loss ? lossTag : ""); p.classList.toggle("is-loss", loss);
    document.getElementById("rMargin").textContent = U.pct(r.marginPct);
    document.getElementById("rSettle").textContent = U.won(r.settle);
    document.getElementById("rCost").textContent = U.won(r.costWon);
    document.getElementById("rVat").textContent = U.won(r.vat);
    U.store(KEY, { i: i, market: market.value, category: category.value, currency: currency.value, tax: taxType() });
  }

  function applyMarket() {
    var k = market.value, m = om[k] || {};
    fillCategories(k);
    el.linkFee.value = m.link ? m.link : "";
    el.shipFeeRate.value = m.shipRate ? m.shipRate : "";
    if (feeSource) {
      if (m.sourceUrl) { feeSource.href = m.sourceUrl; feeSource.hidden = false; }
      else { feeSource.hidden = true; }
    }
    var parts = [];
    if (m.pageBaseDate) parts.push("페이지기준 " + m.pageBaseDate);
    if (m.vat) parts.push("VAT " + m.vat + "→×1.1 반영");
    if (m.subNote) parts.push(m.subNote);
    feeAsof.textContent = (parts.length ? parts.join(" · ") + " · " : "") +
      "확인일 " + F.updatedAt + ", 판매자센터에서 확인(수정 가능)";
    recalc();
  }

  var savedCat = "";
  function restore() {
    var s = U.load(KEY); if (!s) return;
    if (s.market) market.value = s.market;
    if (s.currency) currency.value = s.currency;
    savedCat = s.category || "";
    var i = s.i || {};
    moneyIds.forEach(function (id) { if (i[id]) el[id].value = Number(i[id]).toLocaleString("ko-KR"); });
    decIds.forEach(function (id) { if (i[id] !== undefined && i[id] !== 0) el[id].value = i[id]; });
    if (s.tax) { var r = document.querySelector('input[name="tax"][value="' + s.tax + '"]'); if (r) r.checked = true; }
  }

  moneyIds.forEach(function (id) { U.bindMoney(el[id], recalc); });
  decIds.forEach(function (id) { U.bindDecimal(el[id], recalc); });
  currency.addEventListener("change", function () { curUnit.textContent = curSymbols[currency.value] || ""; recalc(); });
  market.addEventListener("change", applyMarket);
  category.addEventListener("change", applyCategory);
  Array.prototype.forEach.call(document.querySelectorAll('input[name="tax"]'), function (r) {
    r.addEventListener("change", function () { simpleWrap.hidden = taxType() !== "simple"; recalc(); });
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    moneyIds.concat(decIds).forEach(function (id) { el[id].value = id === "simpleRate" ? "1.5" : ""; });
    market.selectedIndex = 0; currency.selectedIndex = 0; curUnit.textContent = "¥";
    var n = document.querySelector('input[name="tax"][value="normal"]'); if (n) n.checked = true;
    simpleWrap.hidden = true; try { localStorage.removeItem(KEY); } catch (e) {}
    applyMarket();
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var i = readInputs(), r = C.globalMargin(i);
    var txt = ["[구매대행 마진 계산 결과 · 건강흐름]",
      "판매가 " + U.won(i.price) + " / 원가 " + U.won(r.costWon),
      "정산금 " + U.won(r.settle) + " / 부가세 " + U.won(r.vat),
      "순이익 " + U.won(r.profit) + (r.profit < 0 ? " (적자)" : ""), "마진율 " + U.pct(r.marginPct),
      "https://healthfortune.co.kr/tools/global-margin/"].join("\n");
    U.copyText(txt, this);
  });

  restore();
  curUnit.textContent = curSymbols[currency.value] || "¥";
  simpleWrap.hidden = taxType() !== "simple";
  applyMarket();
  if (savedCat) { category.value = savedCat; applyCategory(); }
})();
