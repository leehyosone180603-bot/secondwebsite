/* 셀러 계산기 순수 로직 단위테스트 — 명세 '7. 검증 예시' 기준.
 * 실행: node calc/seller/seller-calc.test.js  (의존성 없음) */
"use strict";
var C = require("./seller-calc.js");

var fails = 0, passes = 0;
function approx(a, b, tol) { return Math.abs(a - b) <= (tol == null ? 0.5 : tol); }
function check(name, got, want, tol) {
  var ok = approx(got, want, tol);
  if (ok) { passes++; console.log("  ✓ " + name + " = " + got); }
  else { fails++; console.log("  ✗ " + name + " = " + got + " (기대 " + want + ")"); }
}
function round(n) { return Math.round(n); }
function pct2(n) { return Math.round(n * 100) / 100; }

console.log("[마진율 계산기]");
var m = C.margin({ price: 30000, shipFee: 0, buy: 15000, buyShip: 0, etc: 0,
  freight: 3000, ad: 0, catFee: 3.63, linkFee: 3, shipFeeRate: 0, taxType: "normal" });
check("수수료합계", round(m.feeTotal), 1989);
check("정산금액", round(m.settle), 28011);
check("부가세", round(m.vat), 1364);
check("순이익", round(m.profit), 8647);
check("마진율", pct2(m.marginPct), 28.82, 0.01);

console.log("[마진율 역산] 목표 28.82% → 판매가 ~30000");
var rev = C.marginReversePrice({ shipFee: 0, buy: 15000, buyShip: 0, etc: 0,
  freight: 3000, ad: 0, catFee: 3.63, linkFee: 3, shipFeeRate: 0, taxType: "normal" }, 28.82);
check("역산 판매가", round(rev.price), 30000, 60);

console.log("[현금 흐름 계산기]");
var cf = C.cashflow({ startAmount: 5000000, targetEnd: 6000000, incomeSettle: 8000000,
  incomeEtc: 0, fixed: { a: 2000000 }, variable: { b: 5500000 } });
check("예상잔액", cf.expectedBalance, 5500000);
check("차액", cf.diff, -500000);

console.log("[로켓그로스 계산기]");
var rg = C.rocketGrowth({ price: 20000, bizFx: 1, buyPrice: 8000, cardRate: 0,
  logistics: 0, customs: 0, etc: 0, catFee: 10, inoutFee: 3000, taxType: "normal" });
check("쇼핑몰비용", round(rg.mallCost), 5000);
check("정산금", round(rg.settle), 15000);
check("부가세", round(rg.vat), 1091);
check("순이익", round(rg.profit), 5909);
check("마진율", pct2(rg.marginPct), 29.55, 0.01);
check("최소ROAS", pct2(rg.minRoas), 338.46, 0.05);

console.log("[중국 사입 계산기]");
var ch = C.china({ unitPrice: 10, qty: 100, innerFreight: 50, agentRate: 8,
  bizFx: 200, customsFx: 197, freight: 100000, dutyRate: 8, vatRate: 10, customsCost: 30000 });
check("제품구매비용(¥)", ch.productCostYuan, 1050);
check("구매대행총비용(¥)", ch.agentTotalYuan, 1134);
check("구매대행총비용(원)", round(ch.agentTotalWon), 226800);
check("과세대상금액", round(ch.taxableWon), 306850);
check("관세", round(ch.duty), 24548);
check("부가세", round(ch.vat), 33140);
check("총매입예상비용", round(ch.totalBuyWon), 414488);
check("개당 매입단가", round(ch.perUnit), 4145);

console.log("[0 나눗셈 처리]");
var z = C.margin({ price: 0, shipFee: 0, taxType: "normal" });
check("매출0 → 마진율 null", z.marginPct === null ? 1 : 0, 1);
var zc = C.china({ unitPrice: 10, qty: 0, bizFx: 200, customsFx: 197 });
check("수량0 → 개당 null", zc.perUnit === null ? 1 : 0, 1);

console.log("\n결과: " + passes + " 통과 / " + fails + " 실패");
process.exit(fails ? 1 : 0);
