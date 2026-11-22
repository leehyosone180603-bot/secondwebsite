(function () {
  "use strict";
  var U = window.SellerUI, C = window.SellerCalc, F = window.SellerFees;
  var KEY = "seller_margin_v1";
  U.renderTabs("sellerTabs", "/tools/margin/");
  U.year();

  var moneyIds = ["price", "shipFee", "buy", "buyShip", "etc", "freight", "ad"];
  var pctIds = ["catFee", "linkFee", "shipFeeRate", "simpleRate"];
  var el = {};
  moneyIds.concat(pctIds).forEach(function (id) { el[id] = document.getElementById(id); });
  var market = document.getElementById("market"), feeAsof = document.getElementById("feeAsof");
  var category = document.getElementById("category"), feeSource = document.getElementById("feeSource");
  var simpleWrap = document.getElementById("simpleWrap");

  // 마켓 셀렉트 채우기
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

  function taxType() { return (document.querySelector('input[name="tax"]:checked') || {}).value || "normal"; }

  function readInputs() {
    return {
      price: U.parseInt0(el.price.value), shipFee: U.parseInt0(el.shipFee.value),
      buy: U.parseInt0(el.buy.value), buyShip: U.parseInt0(el.buyShip.value),
      etc: U.parseInt0(el.etc.value), freight: U.parseInt0(el.freight.value), ad: U.parseInt0(el.ad.value),
      catFee: U.parseDec(el.catFee.value), linkFee: U.parseDec(el.linkFee.value),
      shipFeeRate: U.parseDec(el.shipFeeRate.value), taxType: taxType(),
      simpleRate: U.parseDec(el.simpleRate.value)
    };
  }

  var lossTag = ' <span class="loss-tag">적자</span>';
  function setMain(id, value, isLoss) {
    var node = document.getElementById(id);
    node.innerHTML = value + (isLoss ? lossTag : "");
    node.classList.toggle("is-loss", !!isLoss);
  }

  function recalc() {
    var i = readInputs();
    var r = C.margin(i);
    var loss = r.profit < 0;
    setMain("rProfit", U.won(r.profit), loss);
    document.getElementById("rMargin").textContent = U.pct(r.marginPct);
    document.getElementById("rSettle").textContent = U.won(r.settle);
    document.getElementById("rFee").textContent = U.won(r.feeTotal);
    document.getElementById("rVat").textContent = U.won(r.vat);
    // 역산
    var tpRaw = document.getElementById("targetPct").value;
    var tp = U.parseDec(tpRaw);
    var out = document.getElementById("targetPrice");
    if (tpRaw !== "" && isFinite(tp)) {
      var rev = C.marginReversePrice(i, tp);
      out.value = rev.price > 0 && isFinite(rev.price) ? Math.round(rev.price).toLocaleString("ko-KR") : "—";
    } else { out.value = ""; }
    save(i);
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
  function applyCategory() {
    var k = market.value, m = om[k] || {}, idx = category.value;
    if (idx !== "" && m.categories && m.categories[idx]) el.catFee.value = m.categories[idx].fee;
    recalc();
  }

  var savedCat = "";
  function save(i) { U.store(KEY, { i: i, market: market.value, category: category.value, tax: taxType(), targetPct: document.getElementById("targetPct").value }); }
  function restore() {
    var s = U.load(KEY); if (!s) return;
    if (s.market) market.value = s.market;
    savedCat = s.category || "";
    var i = s.i || {};
    moneyIds.forEach(function (id) { if (i[id]) el[id].value = Number(i[id]).toLocaleString("ko-KR"); });
    pctIds.forEach(function (id) { if (i[id] !== undefined && i[id] !== 0) el[id].value = i[id]; });
    if (s.tax) { var r = document.querySelector('input[name="tax"][value="' + s.tax + '"]'); if (r) r.checked = true; }
    if (s.targetPct) document.getElementById("targetPct").value = s.targetPct;
  }

  // 바인딩
  moneyIds.forEach(function (id) { U.bindMoney(el[id], recalc); });
  pctIds.forEach(function (id) { U.bindDecimal(el[id], recalc); });
  U.bindDecimal(document.getElementById("targetPct"), recalc);
  market.addEventListener("change", applyMarket);
  category.addEventListener("change", applyCategory);
  Array.prototype.forEach.call(document.querySelectorAll('input[name="tax"]'), function (r) {
    r.addEventListener("change", function () { simpleWrap.hidden = taxType() !== "simple"; recalc(); });
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    moneyIds.concat(pctIds).forEach(function (id) { el[id].value = id === "simpleRate" ? "1.5" : ""; });
    document.getElementById("targetPct").value = ""; document.getElementById("targetPrice").value = "";
    market.selectedIndex = 0;
    var n = document.querySelector('input[name="tax"][value="normal"]'); if (n) n.checked = true;
    simpleWrap.hidden = true; try { localStorage.removeItem(KEY); } catch (e) {}
    applyMarket();
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var i = readInputs(), r = C.margin(i);
    var txt = ["[마진율 계산 결과 · 건강흐름]",
      "판매가 " + U.won(i.price) + " / 매입 " + U.won(i.buy),
      "정산금액 " + U.won(r.settle), "수수료합계 " + U.won(r.feeTotal), "부가세 " + U.won(r.vat),
      "순이익 " + U.won(r.profit) + (r.profit < 0 ? " (적자)" : ""), "마진율 " + U.pct(r.marginPct),
      "https://healthfortune.co.kr/tools/margin/"].join("\n");
    U.copyText(txt, this);
  });

  restore();
  // 중국 사입 계산기에서 넘어온 개당 매입단가 반영
  try {
    var qp = new URLSearchParams(location.search).get("buy");
    var handoff = qp || localStorage.getItem("seller_handoff_buy");
    if (handoff && /^[0-9]+$/.test(handoff) && parseInt(handoff, 10) > 0) {
      el.buy.value = parseInt(handoff, 10).toLocaleString("ko-KR");
      localStorage.removeItem("seller_handoff_buy");
    }
  } catch (e) {}
  simpleWrap.hidden = taxType() !== "simple";
  applyMarket();
  if (savedCat) { category.value = savedCat; applyCategory(); }
  U.pushAd();
})();
