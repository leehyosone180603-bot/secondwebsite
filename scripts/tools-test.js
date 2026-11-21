"use strict";
/* 도구 순수 함수 단위 테스트 (프레임워크 없이 Node assert).
   사용: node scripts/tools-test.js
   각 도구의 tools-src/{slug}.client.js 가 export 하는 순수 함수를 검증. */
const assert = require("assert");
const path = require("path");
const ROOT = path.join(__dirname, "..");

let pass = 0, fail = 0;
function test(name, fn) { try { fn(); pass++; console.log("  ✓ " + name); } catch (e) { fail++; console.log("  ✗ " + name + " → " + e.message); } }
function approx(a, b, eps) { assert.ok(Math.abs(a - b) <= (eps || 1e-9), a + " ≈ " + b); }

/* ── percent ── */
(function () {
  const P = require(path.join(ROOT, "tools-src", "percent.client.js"));
  console.log("percent");
  test("50000의 10% = 5000", () => assert.strictEqual(P.percentOf(50000, 10), 5000));
  test("30000의 15% = 4500", () => assert.strictEqual(P.percentOf(30000, 15), 4500));
  test("part/whole: 20은 80의 25%", () => assert.strictEqual(P.whatPercent(20, 80), 25));
  test("whatPercent(_,0) = NaN", () => assert.ok(isNaN(P.whatPercent(5, 0))));
  test("증감률 100→120 = +20%", () => assert.strictEqual(P.changePct(100, 120), 20));
  test("증감률 120→100 ≈ -16.67%", () => approx(P.changePct(120, 100), -16.6666667, 1e-5));
  test("round2: 소수 둘째자리", () => assert.strictEqual(P.round2(5000.126), 5000.13));
})();

/* ── vat ── */
(function () {
  const V = require(path.join(ROOT, "tools-src", "vat.client.js"));
  console.log("vat");
  test("공급가 100,000 → 부가세 10,000 / 합계 110,000", () => { const r = V.supplyToTotal(100000, 10, "round"); assert.strictEqual(r.vat, 10000); assert.strictEqual(r.total, 110000); });
  test("합계 110,000 → 공급가 100,000 / 부가세 10,000", () => { const r = V.totalToSupply(110000, 10, "round"); assert.strictEqual(r.supply, 100000); assert.strictEqual(r.vat, 10000); });
  test("부가세 10,000 → 공급가 100,000 / 합계 110,000", () => { const r = V.supplyFromVat(10000, 10); assert.strictEqual(r.supply, 100000); assert.strictEqual(r.total, 110000); });
  test("절사: 공급가 12,345 → 부가세 floor(1234.5)=1234", () => { const r = V.supplyToTotal(12345, 10, "floor"); assert.strictEqual(r.vat, 1234); });
  test("반올림: 공급가 12,345 → 부가세 round(1234.5)=1235", () => { const r = V.supplyToTotal(12345, 10, "round"); assert.strictEqual(r.vat, 1235); });
  test("분리 합계=공급가+부가세 항등", () => { const r = V.totalToSupply(55000, 10, "round"); assert.strictEqual(r.supply + r.vat, 55000); });
})();

/* ── freelancer ── */
(function () {
  const F = require(path.join(ROOT, "tools-src", "freelancer.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("freelancer");
  test("3.3% 100만 → 세금 33,000 / 실수령 967,000", () => { const r = F.withhold(1000000, 3.3); assert.strictEqual(r.tax, 33000); assert.strictEqual(r.net, 967000); });
  test("실수령 967,000 → 세전 1,000,000", () => assert.strictEqual(F.grossFromNet(967000, 3.3), 1000000));
  test("8.8% 100만 → 세금 88,000", () => assert.strictEqual(F.withhold(1000000, 8.8).tax, 88000));
  test("누진세율: 과표 3,000만 → 324만", () => assert.strictEqual(F.applyBracket(30000000, R.incomeTax.brackets), 3240000));
  test("종합소득세 추정 환급 부호", () => { const r = F.comprehensive(40000000, 25640000, 1500000, R.incomeTax.brackets, 3); assert.ok(r.settle > 0); });
})();

/* ── 4insure ── */
(function () {
  const I = require(path.join(ROOT, "tools-src", "4insure.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("4insure");
  const r = I.calc4(3000000, R, 0.25, 1.47);
  test("국민연금 근로자 142,500", () => assert.strictEqual(r.items[0].worker, 142500));
  test("건강보험 근로자 107,850", () => assert.strictEqual(r.items[1].worker, 107850));
  test("산재는 근로자 0", () => assert.strictEqual(r.items[4].worker, 0));
  test("합계 = 근로자 + 사업주", () => assert.strictEqual(r.total, r.worker + r.employer));
  test("상한 적용: 1억 보수도 연금은 상한 기준", () => { const r2 = I.calc4(100000000, R, 0.25, 1.47); assert.ok(r2.npBase <= R.insurance.nationalPension.base.max.value); });
})();

/* ── parttime ── */
(function () {
  const P = require(path.join(ROOT, "tools-src", "parttime.client.js"));
  console.log("parttime");
  test("주40h → 기본 412,800 / 주휴 82,560(8h) / 주급 495,360", () => { const w = P.weeklyPay(10320, 40, 0, 0, 0, true); assert.strictEqual(w.basic, 412800); assert.strictEqual(w.holidayPay, 82560); assert.strictEqual(w.gross, 495360); });
  test("주 14h → 주휴 없음", () => { const w = P.weeklyPay(10000, 14, 0, 0, 0, true); assert.strictEqual(w.holidayPay, 0); });
  test("연장 5h + 5인이상 → 1.5배", () => { const w = P.weeklyPay(10000, 20, 5, 0, 0, true); assert.strictEqual(w.extraPay, Math.round(5 * 10000 * 1.5)); });
  test("5인 미만 → 가산 없음(1배)", () => { const w = P.weeklyPay(10000, 20, 5, 0, 0, false); assert.strictEqual(w.extraPay, 50000); });
  test("월환산 = 주급×4.345", () => assert.strictEqual(P.monthlyFromWeekly(495360), Math.round(495360 * 4.345)));
})();

/* ── salary ── */
(function () {
  const S = require(path.join(ROOT, "tools-src", "salary.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("salary");
  test("근로소득공제 3,000만 → 975만", () => assert.strictEqual(S.earnedDeduction(30000000, R), 9750000));
  test("근로소득공제 한도 2,000만", () => assert.ok(S.earnedDeduction(500000000, R) === 20000000));
  test("산출세액 과표 1,445만 → 907,500", () => assert.strictEqual(S.outputTax(14450000, R), 907500));
  test("근로세액공제 907,500/총급여3천만 → 499,125", () => assert.strictEqual(S.earnedTaxCredit(907500, 30000000, R), 499125));
  test("자녀세액공제 3명 → 95만", () => assert.strictEqual(S.childTaxCredit(3, R), 950000));
  test("4대보험 근로자(250만) 국민연금 118,750", () => assert.strictEqual(S.insuranceWorker(2500000, R).np, 118750));
  test("연 소득세 양수·합리적(과세4천만 1인)", () => { const t = S.annualIncomeTax(40000000, 1, 0, R); assert.ok(t.incomeTax > 300000 && t.incomeTax < 3000000); });
})();

/* ── dday ── */
(function () {
  const D = require(path.join(ROOT, "tools-src", "dday.client.js"));
  console.log("dday");
  test("1/1~1/11 = 10일", () => assert.strictEqual(D.days(new Date(2026, 0, 1), new Date(2026, 0, 11)), 10));
  test("1/31 +1개월 → 2/28(말일보정)", () => { const r = D.addPeriod(new Date(2026, 0, 31), 1, "month"); assert.strictEqual(r.getMonth(), 1); assert.strictEqual(r.getDate(), 28); });
  test("윤년 2/29 +1년 → 2/28", () => { const r = D.addPeriod(new Date(2024, 1, 29), 1, "year"); assert.strictEqual(r.getMonth(), 1); assert.strictEqual(r.getDate(), 28); });
  test("diffYMD 2020/1/15→2026/3/20 = 6년2개월5일", () => { const r = D.diffYMD(new Date(2020, 0, 15), new Date(2026, 2, 20)); assert.deepStrictEqual(r, { y: 6, m: 2, d: 5 }); });
  test("기념일 100일 = 시작+99일", () => { const s = new Date(2026, 0, 1); const a = D.anniversaries(s).find(x => x.label === "100일"); assert.strictEqual(D.days(s, a.date), 99); });
})();

/* ── age ── */
(function () {
  const A = require(path.join(ROOT, "tools-src", "age.client.js"));
  console.log("age");
  test("1990-05-15, 2026-06-01 → 만 36", () => assert.strictEqual(A.manAge(new Date(1990, 4, 15), new Date(2026, 5, 1)), 36));
  test("1990-05-15, 2026-05-01(생일전) → 만 35", () => assert.strictEqual(A.manAge(new Date(1990, 4, 15), new Date(2026, 4, 1)), 35));
  test("세는나이 1990→2026 = 37", () => assert.strictEqual(A.koreanAge(new Date(1990, 4, 15), new Date(2026, 5, 1)), 37));
  test("띠 1990 = 말띠 / 간지 = 경오년", () => { assert.strictEqual(A.zodiac(1990), "말띠"); assert.strictEqual(A.ganji(1990), "경오년"); });
  test("간지 2026 = 병오년", () => assert.strictEqual(A.ganji(2026), "병오년"));
  test("별자리 5/15 = 황소자리, 1/1 = 염소자리", () => { assert.strictEqual(A.starSign(5, 15), "황소자리"); assert.strictEqual(A.starSign(1, 1), "염소자리"); });
  test("다음 생일 2027-05-15", () => { const nb = A.nextBirthday(new Date(1990, 4, 15), new Date(2026, 5, 1)); assert.strictEqual(nb.getFullYear(), 2027); assert.strictEqual(nb.getMonth(), 4); assert.strictEqual(nb.getDate(), 15); });
})();

/* ── lib/interest (savings) ── */
(function () {
  const I = require(path.join(ROOT, "js", "lib", "interest.js"));
  console.log("interest/savings");
  test("예금단리 1천만·3%·12개월 → 이자 30만", () => { const r = I.simple(10000000, 3, 12); assert.strictEqual(r.interest, 300000); assert.strictEqual(r.total, 10300000); });
  test("예금월복리 1천만·3%·12개월 ≈ 이자 304,160", () => approx(I.monthlyCompound(10000000, 3, 12).interest, 304160, 50));
  test("적금단리 월100만·3%·12개월 → 이자 195,000", () => { const r = I.recurringSimple(1000000, 3, 12); assert.strictEqual(r.principal, 12000000); assert.strictEqual(r.interest, 195000); });
  test("이자과세 30만×15.4% = 46,200", () => { const t = I.applyTax(300000, "general"); assert.strictEqual(t.tax, 46200); assert.strictEqual(t.net, 253800); });
  test("비과세 → 세금 0", () => assert.strictEqual(I.applyTax(300000, "none").tax, 0));
  test("deposit 종합: 세후수령 10,253,800", () => { const r = I.deposit("deposit", "simple", 10000000, 3, 12, "general"); assert.strictEqual(r.total, 10253800); });
})();

/* ── lib/loan ── */
(function () {
  const L = require(path.join(ROOT, "js", "lib", "loan.js"));
  console.log("loan");
  test("원금균등 1,200만·연12%·12개월 → 총이자 780,000", () => { const s = L.schedule(12000000, 12, 12, "equalPrincipal", 0); assert.strictEqual(s.totalInterest, 780000); });
  test("만기일시 1,000만·연6%·12개월 → 총이자 600,000", () => { const s = L.schedule(10000000, 6, 12, "bullet", 0); assert.strictEqual(s.totalInterest, 600000); assert.strictEqual(s.totalPayment, 10600000); });
  test("원리금균등: 마지막 잔액 0, 12회차", () => { const s = L.schedule(10000000, 6, 12, "equalPayment", 0); assert.strictEqual(s.rows.length, 12); assert.strictEqual(s.rows[11].balance, 0); });
  test("원금 합계 = 대출금", () => { const s = L.schedule(10000000, 6, 12, "equalPayment", 0); const sum = s.rows.reduce((a, b) => a + b.principal, 0); assert.ok(Math.abs(sum - 10000000) <= 2); });
  test("총이자: 원금균등 ≤ 원리금균등 ≤ 만기일시", () => { const c = L.compare(100000000, 4.5, 120, 0); assert.ok(c.equalPrincipal <= c.equalPayment && c.equalPayment <= c.bullet); });
  test("거치 3개월: 처음 3회 이자만", () => { const s = L.schedule(10000000, 6, 12, "equalPayment", 3); assert.strictEqual(s.rows[0].principal, 0); assert.strictEqual(s.rows[2].principal, 0); assert.strictEqual(s.rows[0].interest, 50000); });
})();

console.log("\n결과: " + pass + " 통과, " + fail + " 실패");
process.exit(fail ? 1 : 0);
