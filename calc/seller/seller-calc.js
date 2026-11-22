/*
 * 셀러 계산기 공용 순수 계산 로직 (UI와 분리)
 * 브라우저: window.SellerCalc / Node: module.exports
 * 내부 계산은 반올림하지 않고, 표시 단계(UI)에서만 Math.round 한다.
 */
(function (root) {
  "use strict";

  function num(x) {
    var v = typeof x === "number" ? x : parseFloat(x);
    return isFinite(v) ? v : 0;
  }

  // 부가세 공통 계산
  // taxType: "normal"(일반 10%) | "simple"(간이) | "free"(면세)
  // base: 일반과세 시 (매출합계 - 매입성 공급가액) 의 양수값
  function vatOf(taxType, base, salesTotal, simpleRate) {
    if (taxType === "simple") return num(salesTotal) * num(simpleRate) / 100;
    if (taxType === "free") return 0;
    return Math.max(0, num(base)) / 1.1 * 0.1; // 일반과세자
  }

  // 4-1 마진율 계산기
  function margin(i) {
    var price = num(i.price), shipFee = num(i.shipFee);
    var buy = num(i.buy), buyShip = num(i.buyShip), etc = num(i.etc),
        freight = num(i.freight), ad = num(i.ad);
    var cat = num(i.catFee), link = num(i.linkFee), shipRate = num(i.shipFeeRate);

    var salesTotal = price + shipFee;
    var feeTotal = price * (cat + link) / 100 + shipFee * shipRate / 100;
    var settle = salesTotal - feeTotal;
    var buyTotal = buy + buyShip + etc + freight + ad;
    var vat = vatOf(i.taxType, salesTotal - buy - buyShip, salesTotal, i.simpleRate);
    var profit = settle - buyTotal - vat;
    var marginPct = salesTotal > 0 ? profit / salesTotal * 100 : null;
    return { salesTotal: salesTotal, feeTotal: feeTotal, settle: settle,
             buyTotal: buyTotal, vat: vat, profit: profit, marginPct: marginPct };
  }

  // 마진율 역산: 목표 마진율(%)이 나오는 판매가격을 이분탐색으로 구한다.
  // (수수료·부가세가 판매가에 연동되어 비선형이므로 이분탐색 사용)
  function marginReversePrice(i, targetPct) {
    targetPct = num(targetPct);
    var lo = 0, hi = 1e9, base = {};
    for (var k in i) base[k] = i[k];
    function pctAt(p) { base.price = p; var r = margin(base); return r.marginPct; }
    // 단조 증가 가정하에 100회 이분탐색
    for (var n = 0; n < 100; n++) {
      var mid = (lo + hi) / 2;
      var pct = pctAt(mid);
      if (pct === null || pct < targetPct) lo = mid; else hi = mid;
    }
    var price = (lo + hi) / 2;
    return { price: price, result: (function () { base.price = price; return margin(base); })() };
  }

  // 4-2 중국 사입 계산기
  function china(i) {
    var unit = num(i.unitPrice), qty = num(i.qty), inner = num(i.innerFreight);
    var agentRate = num(i.agentRate), freight = num(i.freight),
        customsCost = num(i.customsCost), dutyRate = num(i.dutyRate), vatRate = num(i.vatRate);
    var bizFx = num(i.bizFx), customsFx = num(i.customsFx);

    var productCostYuan = unit * qty + inner;
    var agentFeeYuan = productCostYuan * agentRate / 100;
    var agentTotalYuan = productCostYuan + agentFeeYuan;
    var agentTotalWon = agentTotalYuan * bizFx;
    var taxableWon = productCostYuan * customsFx + freight;
    var duty = taxableWon * dutyRate / 100;
    var vat = (taxableWon + duty) * vatRate / 100;
    var feesTaxTotal = duty + vat + customsCost;
    var totalBuyWon = agentTotalWon + duty + vat + customsCost + freight;
    var perUnit = qty > 0 ? totalBuyWon / qty : null;
    return { productCostYuan: productCostYuan, agentFeeYuan: agentFeeYuan,
             agentTotalYuan: agentTotalYuan, agentTotalWon: agentTotalWon,
             taxableWon: taxableWon, duty: duty, vat: vat, feesTaxTotal: feesTaxTotal,
             totalBuyWon: totalBuyWon, perUnit: perUnit };
  }

  // 4-3 구매대행 마진율 계산기
  // per100: 엔화처럼 100단위 환율이면 true
  function globalMargin(i) {
    var price = num(i.price), shipFee = num(i.shipFee);
    var buyForeign = num(i.buyForeign), fx = num(i.bizFx);
    var per100 = i.per100 ? 100 : 1;
    var cardRate = num(i.cardRate), bungaeji = num(i.bungaeji),
        customs = num(i.customs), etc = num(i.etc);
    var cat = num(i.catFee), link = num(i.linkFee), shipRate = num(i.shipFeeRate);

    var salesTotal = price + shipFee;
    var costWon = buyForeign * fx / per100;
    var cardFee = costWon * cardRate / 100;
    var buyTotal = costWon + cardFee + bungaeji + customs + etc;
    var feeTotal = price * (cat + link) / 100 + shipFee * shipRate / 100;
    var settle = salesTotal - feeTotal;
    var vat = vatOf(i.taxType, salesTotal - costWon, salesTotal, i.simpleRate);
    var profit = settle - buyTotal - vat;
    var marginPct = salesTotal > 0 ? profit / salesTotal * 100 : null;
    return { salesTotal: salesTotal, costWon: costWon, cardFee: cardFee,
             buyTotal: buyTotal, feeTotal: feeTotal, settle: settle, vat: vat,
             profit: profit, marginPct: marginPct };
  }

  // 4-4 현금 흐름 계산기
  function cashflow(i) {
    var start = num(i.startAmount), target = num(i.targetEnd);
    var incomeTotal = num(i.incomeSettle) + num(i.incomeEtc);
    var fixedTotal = 0, variableTotal = 0, k;
    var fixed = i.fixed || {}, variable = i.variable || {};
    for (k in fixed) fixedTotal += num(fixed[k]);
    for (k in variable) variableTotal += num(variable[k]);
    var expectedBalance = start + incomeTotal - (fixedTotal + variableTotal);
    var diff = expectedBalance - target;
    return { incomeTotal: incomeTotal, fixedTotal: fixedTotal, variableTotal: variableTotal,
             expectedBalance: expectedBalance, diff: diff };
  }

  // 4-5 로켓그로스 마진 계산기
  function rocketGrowth(i) {
    var price = num(i.price);
    var buyPrice = num(i.buyPrice), fx = num(i.bizFx) || 1;
    var cardRate = num(i.cardRate), logistics = num(i.logistics),
        customs = num(i.customs), etc = num(i.etc);
    var catFee = num(i.catFee), inoutFee = num(i.inoutFee);

    var costWon = buyPrice * fx;
    var buyTotal = costWon + costWon * cardRate / 100 + logistics + customs + etc;
    var mallCost = price * catFee / 100 + inoutFee;
    var settle = price - mallCost;
    var vat = vatOf(i.taxType, price - costWon, price, i.simpleRate);
    var profit = settle - buyTotal - vat;
    var marginPct = price > 0 ? profit / price * 100 : null;
    var minRoas = profit > 0 ? price / profit * 100 : null; // 순이익<=0 이면 광고 집행 시 적자
    return { costWon: costWon, buyTotal: buyTotal, mallCost: mallCost, settle: settle,
             vat: vat, profit: profit, marginPct: marginPct, minRoas: minRoas };
  }

  var api = {
    num: num, vatOf: vatOf,
    margin: margin, marginReversePrice: marginReversePrice,
    china: china, globalMargin: globalMargin,
    cashflow: cashflow, rocketGrowth: rocketGrowth
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.SellerCalc = api;
})(typeof window !== "undefined" ? window : this);
