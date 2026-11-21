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

/* ── holidays / business-days ── */
(function () {
  const H = require(path.join(ROOT, "data", "holidays.js"));
  const B = require(path.join(ROOT, "tools-src", "business-days.client.js"));
  console.log("business-days");
  const O = { isHoliday: H.isHoliday, saturdayWork: false, customOff: {} };
  test("공휴일 조회: 2026 노동절·제헌절 true, 평일 false", () => { assert.ok(H.isHoliday("2026-05-01")); assert.ok(H.isHoliday("2026-07-17")); assert.ok(!H.isHoliday("2026-06-15")); });
  test("어린이날(2026-05-05)은 영업일 아님", () => assert.strictEqual(B.isBusinessDay(new Date(2026, 4, 5), O), false));
  test("5/4~5/8 영업일 4일(어린이날 제외, 시작포함)", () => assert.strictEqual(B.countBusinessDays(new Date(2026, 4, 4), new Date(2026, 4, 8), O, true), 4));
  test("5/4 +1영업일 → 5/6(어린이날 건너뜀)", () => assert.strictEqual(B.fmtD(B.addBusinessDays(new Date(2026, 4, 4), 1, O)), "2026-05-06"));
  test("노동절(5/1 금) +1영업일 → 5/4(월)", () => assert.strictEqual(B.fmtD(B.addBusinessDays(new Date(2026, 4, 1), 1, O)), "2026-05-04"));
  test("토요일 근무 옵션: 토요일이 영업일", () => assert.strictEqual(B.isBusinessDay(new Date(2026, 4, 2), { isHoliday: H.isHoliday, saturdayWork: true, customOff: {} }), true));
})();

/* ── severance (퇴직소득세, 공식 샘플 검증) ── */
(function () {
  const S = require(path.join(ROOT, "tools-src", "severance.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("severance");
  test("공식샘플①: 퇴직 3천만·5년 → 퇴직소득세 775,000/지방 77,500", () => { const t = S.retirementTax(30000000, 5, R); assert.strictEqual(t.incomeTax, 775000); assert.strictEqual(t.localTax, 77500); });
  test("공식샘플①: 환산급여 6천만·공제 3,920만·과표 2,080만", () => { const t = S.retirementTax(30000000, 5, R); assert.strictEqual(t.converted, 60000000); assert.strictEqual(t.convertedDeduction, 39200000); assert.strictEqual(t.taxBase, 20800000); });
  test("공식샘플②: 퇴직 1억·10년 → 퇴직소득세 3,875,000/지방 387,500", () => { const t = S.retirementTax(100000000, 10, R); assert.strictEqual(t.incomeTax, 3875000); assert.strictEqual(t.localTax, 387500); });
  test("근속연수: 2020-12-01~2025-11-30 = 5년", () => assert.strictEqual(S.serviceYears(new Date(2020, 11, 1), new Date(2025, 10, 30)), 5));
  test("근속월수 올림: 1994-04-15~1998-04-15 = 49개월(5년)", () => { assert.strictEqual(S.serviceMonths(new Date(1994, 3, 15), new Date(1998, 3, 15)), 49); assert.strictEqual(S.serviceYears(new Date(1994, 3, 15), new Date(1998, 3, 15)), 5); });
  test("퇴직금: 1일10만·365일 = 300만", () => assert.strictEqual(S.severancePay(100000, 365), 3000000));
})();

/* ── lotto-prize (복권 당첨금 세금) ── */
(function () {
  const L = require(path.join(ROOT, "tools-src", "lotto-prize.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("lotto-prize");
  test("200만원 이하 비과세: 세금 0, 전액 수령", () => { const r = L.lottoTax(2000000, R); assert.strictEqual(r.taxable, false); assert.strictEqual(r.totalTax, 0); assert.strictEqual(r.net, 2000000); });
  test("1억 당첨 → 소득세 2,000만·지방 200만·실수령 7,800만", () => { const r = L.lottoTax(100000000, R); assert.strictEqual(r.incomeTax, 20000000); assert.strictEqual(r.localTax, 2000000); assert.strictEqual(r.net, 78000000); });
  test("3억 당첨 → 22%, 실수령 2.34억", () => { const r = L.lottoTax(300000000, R); assert.strictEqual(r.incomeTax, 60000000); assert.strictEqual(r.localTax, 6000000); assert.strictEqual(r.net, 234000000); });
  test("10억 당첨 → 세금 2.97억, 실수령 7.03억", () => { const r = L.lottoTax(1000000000, R); assert.strictEqual(r.incomeTax, 270000000); assert.strictEqual(r.localTax, 27000000); assert.strictEqual(r.net, 703000000); });
  test("20억 당첨 → 3억초과분 33% 적용, 실수령 13.73억", () => { const r = L.lottoTax(2000000000, R); assert.strictEqual(r.incomeTax, 570000000); assert.strictEqual(r.net, 1373000000); });
  test("200만원 초과 2,000,001 → 과세 전환", () => { const r = L.lottoTax(2000001, R); assert.strictEqual(r.taxable, true); });
})();

/* ── card-installment (카드 할부, 체감식=원금균등) ── */
(function () {
  const L = require(path.join(ROOT, "js", "lib", "loan.js"));
  console.log("card-installment");
  const s = L.schedule(1200000, 15, 12, "equalPrincipal", 0);
  test("120만·12개월·연15% → 총수수료 97,500", () => assert.strictEqual(s.totalInterest, 97500));
  test("120만·12개월·연15% → 총결제 1,297,500", () => assert.strictEqual(s.totalPayment, 1297500));
  test("첫 달 결제액 115,000(원금10만+수수료1.5만)", () => assert.strictEqual(s.rows[0].payment, 115000));
  test("마지막 달 결제액 101,250", () => assert.strictEqual(s.rows[s.rows.length - 1].payment, 101250));
  test("무이자(0%) → 수수료 0·결제 원금과 동일", () => { const z = L.schedule(1200000, 0, 12, "equalPrincipal", 0); assert.strictEqual(z.totalInterest, 0); assert.strictEqual(z.totalPayment, 1200000); });
})();

/* ── pyeong (평↔㎡) ── */
(function () {
  const P = require(path.join(ROOT, "tools-src", "pyeong.client.js"));
  console.log("pyeong");
  test("24평 → 79.34㎡", () => assert.strictEqual(Math.round(P.pyeongToM2(24) * 100) / 100, 79.34));
  test("1평 = 400/121㎡(≈3.3058)", () => assert.ok(Math.abs(P.pyeongToM2(1) - 3.30578512) < 1e-6));
  test("100㎡ → 30.25평", () => assert.strictEqual(Math.round(P.m2ToPyeong(100) * 100) / 100, 30.25));
  test("왕복 변환 일치(33평)", () => assert.ok(Math.abs(P.m2ToPyeong(P.pyeongToM2(33)) - 33) < 1e-9));
})();

/* ── bmi (대한비만학회 분류) ── */
(function () {
  const M = require(path.join(ROOT, "tools-src", "bmi.client.js"));
  console.log("bmi");
  test("170cm·65kg → BMI 22.5·정상", () => { const b = M.bmi(65, 170); assert.strictEqual(Math.round(b * 10) / 10, 22.5); assert.strictEqual(M.bmiCategory(b).label, "정상"); });
  test("170cm·50kg → 저체중", () => assert.strictEqual(M.bmiCategory(M.bmi(50, 170)).label, "저체중"));
  test("170cm·75kg → 1단계 비만", () => assert.strictEqual(M.bmiCategory(M.bmi(75, 170)).label, "1단계 비만"));
  test("170cm·90kg → 2단계 비만", () => assert.strictEqual(M.bmiCategory(M.bmi(90, 170)).label, "2단계 비만"));
  test("경계: BMI 23 → 비만 전단계", () => assert.strictEqual(M.bmiCategory(23).label, "비만 전단계"));
  test("경계: BMI 25 → 1단계 비만", () => assert.strictEqual(M.bmiCategory(25).label, "1단계 비만"));
  test("170cm 정상체중 범위 ≈ 53.5~66.2kg", () => { const r = M.healthyRange(170); assert.strictEqual(Math.round(r.min * 10) / 10, 53.5); assert.strictEqual(Math.round(r.max * 10) / 10, 66.2); });
})();

/* ── unit-converter (단위 변환) ── */
(function () {
  const U = require(path.join(ROOT, "tools-src", "unit-converter.client.js"));
  console.log("unit-converter");
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, a + " ≉ " + b);
  test("길이: 10inch = 25.4cm", () => near(U.convert("length", "inch(인치)", "cm", 10), 25.4));
  test("무게: 10lb = 4.5359237kg", () => near(U.convert("weight", "lb(파운드)", "kg", 10), 4.5359237));
  test("무게: 1.2kg = 2근(600g)", () => near(U.convert("weight", "kg", "근(600g)", 1.2), 2));
  test("넓이: 24평 = 79.3388㎡", () => near(U.convert("area", "평", "㎡", 24), 24 * 400 / 121));
  test("속도: 36km/h = 10m/s", () => near(U.convert("speed", "km/h", "m/s", 36), 10));
  test("온도: 100℃ = 212℉", () => near(U.convertTemp("℃", "℉", 100), 212));
  test("온도: 0℃ = 273.15K", () => near(U.convertTemp("℃", "K", 0), 273.15));
  test("온도: 32℉ = 0℃", () => near(U.convertTemp("℉", "℃", 32), 0));
})();

/* ── bmr (기초대사량 Mifflin-St Jeor) ── */
(function () {
  const B = require(path.join(ROOT, "tools-src", "bmr.client.js"));
  console.log("bmr");
  test("남 170/65/30 → BMR 1567.5", () => assert.strictEqual(B.bmr("male", 65, 170, 30), 1567.5));
  test("여 160/55/30 → BMR 1239", () => assert.strictEqual(B.bmr("female", 55, 160, 30), 1239));
  test("TDEE(보통 1.55) = BMR×1.55", () => assert.strictEqual(Math.round(B.tdee(1567.5, 1.55)), 2430));
  test("성별 차이 = 166(= +5 vs −161)", () => assert.strictEqual(B.bmr("male", 65, 170, 30) - B.bmr("female", 65, 170, 30), 166));
})();

console.log("\n결과: " + pass + " 통과, " + fail + " 실패");
process.exit(fail ? 1 : 0);
