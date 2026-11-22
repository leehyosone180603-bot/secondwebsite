(function () {
  "use strict";
  var U = window.SellerUI, C = window.SellerCalc, F = window.SellerFees;
  var KEY = "seller_rocket_v1";
  U.renderTabs("sellerTabs", "/tools/rocket-growth/");
  U.year();

  var moneyIds = ["price", "logistics", "customs", "etc", "inoutFee"];
  var decIds = ["bizFx", "buyPrice", "cardRate", "catFee", "simpleRate"];
  var el = {};
  moneyIds.concat(decIds).forEach(function (id) { el[id] = document.getElementById(id); });
  var currency = document.getElementById("currency"), curUnit = document.getElementById("curUnit");
  var category = document.getElementById("category"), size = document.getElementById("size");
  var feeAsof = document.getElementById("feeAsof"), simpleWrap = document.getElementById("simpleWrap");
  var curSymbols = { krw: "₩", cny: "¥", usd: "$", jpy: "¥(100)" };

  // 카테고리/사이즈 셀렉트 채우기
  var cats = F.rocketCategory, sizes = F.rocketSize;
  var optCustom = function (label) { var o = document.createElement("option"); o.value = "__custom"; o.textContent = label; return o; };
  Object.keys(cats).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = cats[k].name; category.appendChild(o); });
  category.appendChild(optCustom("직접 입력"));
  Object.keys(sizes).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = sizes[k].name; size.appendChild(o); });
  size.appendChild(optCustom("직접 입력"));

  function taxType() { return (document.querySelector('input[name="tax"]:checked') || {}).value || "normal"; }
  function readInputs() {
    return {
      price: U.parseInt0(el.price.value), bizFx: U.parseDec(el.bizFx.value) || 1,
      buyPrice: U.parseDec(el.buyPrice.value), cardRate: U.parseDec(el.cardRate.value),
      logistics: U.parseInt0(el.logistics.value), customs: U.parseInt0(el.customs.value),
      etc: U.parseInt0(el.etc.value), catFee: U.parseDec(el.catFee.value),
      inoutFee: U.parseInt0(el.inoutFee.value), taxType: taxType(), simpleRate: U.parseDec(el.simpleRate.value)
    };
  }

  var lossTag = ' <span class="loss-tag">적자</span>';
  function recalc() {
    var i = readInputs(), r = C.rocketGrowth(i);
    var loss = r.profit < 0;
    var p = document.getElementById("rProfit");
    p.innerHTML = U.won(r.profit) + (loss ? lossTag : ""); p.classList.toggle("is-loss", loss);
    document.getElementById("rMargin").textContent = U.pct(r.marginPct);
    var roas = document.getElementById("rRoas");
    if (r.minRoas === null) { roas.textContent = "광고 시 적자"; roas.classList.add("is-loss"); }
    else { roas.textContent = U.pct(r.minRoas); roas.classList.remove("is-loss"); }
    document.getElementById("rSettle").textContent = U.won(r.settle);
    document.getElementById("rMall").textContent = U.won(r.mallCost);
    U.store(KEY, { i: i, currency: currency.value, category: category.value, size: size.value, tax: taxType() });
  }

  function applyCategory() {
    var k = category.value;
    if (k !== "__custom" && cats[k] && !cats[k].direct) el.catFee.value = cats[k].fee || "";
    updateFeeNote();
    recalc();
  }
  function applySize() {
    var k = size.value;
    if (k !== "__custom" && sizes[k] && !sizes[k].direct) el.inoutFee.value = sizes[k].fee ? Number(sizes[k].fee).toLocaleString("ko-KR") : "";
    updateFeeNote();
    recalc();
  }
  function updateFeeNote() {
    var note = (F.reference && F.reference.rocketNote) ? "참고(비공식): " + F.reference.rocketNote + " · " : "";
    feeAsof.textContent = note + "기준일 " + F.updatedAt + ", 수수료·물류요금은 쿠팡 Wing에서 확인 후 직접 입력";
  }

  function restore() {
    var s = U.load(KEY); if (!s) return;
    if (s.currency) currency.value = s.currency;
    if (s.category) category.value = s.category;
    if (s.size) size.value = s.size;
    var i = s.i || {};
    moneyIds.forEach(function (id) { if (i[id]) el[id].value = Number(i[id]).toLocaleString("ko-KR"); });
    decIds.forEach(function (id) { if (i[id] !== undefined && i[id] !== 0 && !(id === "bizFx" && i[id] === 1)) el[id].value = i[id]; });
    if (s.tax) { var r = document.querySelector('input[name="tax"][value="' + s.tax + '"]'); if (r) r.checked = true; }
  }

  moneyIds.forEach(function (id) { U.bindMoney(el[id], recalc); });
  decIds.forEach(function (id) { U.bindDecimal(el[id], recalc); });
  currency.addEventListener("change", function () {
    curUnit.textContent = curSymbols[currency.value] || "₩";
    if (currency.value === "krw") el.bizFx.value = "1";
    recalc();
  });
  category.addEventListener("change", applyCategory);
  size.addEventListener("change", applySize);
  Array.prototype.forEach.call(document.querySelectorAll('input[name="tax"]'), function (r) {
    r.addEventListener("change", function () { simpleWrap.hidden = taxType() !== "simple"; recalc(); });
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    moneyIds.forEach(function (id) { el[id].value = ""; });
    decIds.forEach(function (id) { el[id].value = id === "bizFx" ? "1" : (id === "simpleRate" ? "1.5" : ""); });
    currency.selectedIndex = 0; curUnit.textContent = "₩"; category.selectedIndex = 0; size.selectedIndex = 0;
    var n = document.querySelector('input[name="tax"][value="normal"]'); if (n) n.checked = true;
    simpleWrap.hidden = true; try { localStorage.removeItem(KEY); } catch (e) {}
    updateFeeNote(); recalc();
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var i = readInputs(), r = C.rocketGrowth(i);
    var txt = ["[로켓그로스 마진 계산 결과 · 건강흐름]",
      "판매가 " + U.won(i.price),
      "정산금 " + U.won(r.settle) + " / 쇼핑몰비용 " + U.won(r.mallCost) + " / 부가세 " + U.won(r.vat),
      "순이익 " + U.won(r.profit) + (r.profit < 0 ? " (적자)" : "") + " / 마진율 " + U.pct(r.marginPct),
      "최소 ROAS " + (r.minRoas === null ? "광고 시 적자" : U.pct(r.minRoas)),
      "https://healthfortune.co.kr/tools/rocket-growth/"].join("\n");
    U.copyText(txt, this);
  });

  restore();
  curUnit.textContent = curSymbols[currency.value] || "₩";
  simpleWrap.hidden = taxType() !== "simple";
  updateFeeNote();
  recalc();
  U.pushAd();
})();
