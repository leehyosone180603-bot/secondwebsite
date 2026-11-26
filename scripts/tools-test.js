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

/* ── unemployment (실업급여, 고용보험법 별표1) ── */
(function () {
  const U = require(path.join(ROOT, "tools-src", "unemployment.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("unemployment");
  test("하한액(8시간) = 66,048원", () => assert.strictEqual(U.minDaily(R, 8), 66048));
  test("하한액(4시간) = 33,024원", () => assert.strictEqual(U.minDaily(R, 4), 33024));
  test("저임금 10만×60%=6만 → 하한 66,048 적용", () => { const d = U.dailyBenefit(100000, 8, R); assert.strictEqual(d.daily, 66048); assert.strictEqual(d.applied, "floor"); });
  test("고임금 20만×60%=12만 → 상한 68,100 적용", () => { const d = U.dailyBenefit(200000, 8, R); assert.strictEqual(d.daily, 68100); assert.strictEqual(d.applied, "cap"); });
  test("중간 11.2만×60%=67,200 → 그대로", () => { const d = U.dailyBenefit(112000, 8, R); assert.strictEqual(d.daily, 67200); assert.strictEqual(d.applied, "rate"); });
  test("소정급여일수: 35세·2년 = 150일", () => assert.strictEqual(U.benefitDays(35, 2, false, R), 150));
  test("소정급여일수: 55세·12년 = 270일", () => assert.strictEqual(U.benefitDays(55, 12, false, R), 270));
  test("소정급여일수: 장애인 40세·0.5년 = 120일(50세↑ 적용)", () => assert.strictEqual(U.benefitDays(40, 0.5, true, R), 120));
  test("소정급여일수: 49세·7년 = 210일", () => assert.strictEqual(U.benefitDays(49, 7, false, R), 210));
  test("총 예상: 67,200×150 = 10,080,000", () => { const e = U.estimate(112000, 8, 35, 2, false, R); assert.strictEqual(e.total, 10080000); assert.strictEqual(e.monthly, 2016000); });
})();

/* ── discount (할인가) ── */
(function () {
  const D = require(path.join(ROOT, "tools-src", "discount.client.js"));
  console.log("discount");
  test("5만원 30% 할인 → 35,000", () => assert.strictEqual(D.salePrice(50000, 30), 35000));
  test("5만원 30% 할인액 → 15,000", () => assert.strictEqual(D.discountAmount(50000, 30), 15000));
  test("중복 30%+10% → 31,500(37% 실질)", () => { assert.strictEqual(D.chained(50000, 30, 10), 31500); assert.strictEqual(D.rateFromPrices(50000, 31500), 37); });
  test("5만→3.5만 역산 = 30%", () => assert.strictEqual(D.rateFromPrices(50000, 35000), 30));
})();

/* ── won-korean (금액 한글) ── */
(function () {
  const W = require(path.join(ROOT, "tools-src", "won-korean.client.js"));
  console.log("won-korean");
  test("35,000,000 → 삼천오백만", () => assert.strictEqual(W.numToKorean(35000000), "삼천오백만"));
  test("1,234 → 일천이백삼십사", () => assert.strictEqual(W.numToKorean(1234), "일천이백삼십사"));
  test("100,000,000 → 일억", () => assert.strictEqual(W.numToKorean(100000000), "일억"));
  test("123,456,789 → 일억이천삼백사십오만육천칠백팔십구", () => assert.strictEqual(W.numToKorean(123456789), "일억이천삼백사십오만육천칠백팔십구"));
  test("10,500 → 일만오백", () => assert.strictEqual(W.numToKorean(10500), "일만오백"));
  test("0 → 영", () => assert.strictEqual(W.numToKorean(0), "영"));
})();

/* ── body-fat (체지방률·표준체중) ── */
(function () {
  const F = require(path.join(ROOT, "tools-src", "body-fat.client.js"));
  console.log("body-fat");
  const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, a + " ≉ " + b);
  test("표준체중(175cm, BMI22) = 67.375kg", () => near(F.standardWeight(175), 67.375));
  test("체지방 남 BMI25·30세 = 20.7%", () => near(F.bodyFat(25, 30, "male"), 20.7));
  test("체지방 여 BMI25·30세 = 31.5%", () => near(F.bodyFat(25, 30, "female"), 31.5));
  test("남녀 차이 = 10.8(성별항)", () => near(F.bodyFat(25, 30, "male") - F.bodyFat(25, 30, "female"), -10.8));
  test("남 20.7% → 주의(경계)", () => assert.strictEqual(F.bfCategory(20.7, "male").label, "주의(경계)"));
  test("남 15% → 정상", () => assert.strictEqual(F.bfCategory(15, "male").label, "정상"));
  test("여 31.5% → 비만", () => assert.strictEqual(F.bfCategory(31.5, "female").label, "비만"));
})();

/* ── gift-tax (증여세) ── */
(function () {
  const G = require(path.join(ROOT, "tools-src", "gift-tax.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("gift-tax");
  test("과세표준 4.5억 → 산출 8,000만", () => assert.strictEqual(G.progressiveTax(450000000, R), 80000000));
  test("성년자녀 5억 증여 → 과표4.5억·납부7,760만", () => { const r = G.giftTax(500000000, "adult", 0, R); assert.strictEqual(r.base, 450000000); assert.strictEqual(r.calcTax, 80000000); assert.strictEqual(r.payable, 77600000); });
  test("성년자녀 1억 증여 → 납부 485만", () => { const r = G.giftTax(100000000, "adult", 0, R); assert.strictEqual(r.payable, 4850000); });
  test("배우자 6억 증여 → 세금 0", () => assert.strictEqual(G.giftTax(600000000, "spouse", 0, R).payable, 0));
  test("혼인·출산 1억 공제 → 2억 증여 과표 5천만", () => { const r = G.giftTax(200000000, "adult", 100000000, R); assert.strictEqual(r.base, 50000000); assert.strictEqual(r.calcTax, 5000000); });
})();

/* ── inheritance-tax (상속세) ── */
(function () {
  const I = require(path.join(ROOT, "tools-src", "inheritance-tax.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("inheritance-tax");
  test("10억·배우자+자녀2 → 세금 0(공제 10억)", () => assert.strictEqual(I.inheritanceTax(1000000000, true, 2, 0, R).payable, 0));
  test("15억·배우자+자녀2 → 과표5억·납부8,730만", () => { const r = I.inheritanceTax(1500000000, true, 2, 0, R); assert.strictEqual(r.base, 500000000); assert.strictEqual(r.payable, 87300000); });
  test("10억·배우자無·자녀2 → 과표5억·납부8,730만", () => { const r = I.inheritanceTax(1000000000, false, 2, 0, R); assert.strictEqual(r.base, 500000000); assert.strictEqual(r.payable, 87300000); });
  test("금융재산공제: 3억 → 6,000만", () => assert.strictEqual(I.financialDeduction(300000000, R), 60000000));
  test("금융재산공제: 1천만(2천만이하) → 전액", () => assert.strictEqual(I.financialDeduction(10000000, R), 10000000));
  test("20억·배우자 단독상속 → 일괄공제 불가(기초2억)·과표13억", () => { const r = I.inheritanceTax(2000000000, true, 0, 0, R); assert.strictEqual(r.general, 200000000); assert.strictEqual(r.base, 1300000000); assert.strictEqual(r.payable, 349200000); });
})();

/* ── alcohol-sober (위드마크) ── */
(function () {
  const A = require(path.join(ROOT, "tools-src", "alcohol-sober.client.js"));
  console.log("alcohol-sober");
  const near = (a, b, t) => assert.ok(Math.abs(a - b) < (t || 1e-6), a + " ≉ " + b);
  test("소주 360mL·17% 알코올 ≈ 48.31g", () => near(A.alcoholGrams(360, 17), 48.311, 0.01));
  test("70kg 남 소주1병 → BAC ≈ 0.1015%", () => near(A.bac(360, 17, 70, "male"), 0.10149, 0.0005));
  test("여성 계수(0.55)가 더 높게", () => assert.ok(A.bac(360, 17, 70, "female") > A.bac(360, 17, 70, "male")));
  test("운전가능(0.03%)까지 시간 = (BAC−0.03)/0.015", () => { const c = A.bac(360, 17, 70, "male"); near(A.hoursToTarget(c, 0.03), (c - 0.03) / 0.015, 1e-9); });
  test("BAC 0.03 미만이면 운전가능 시간 0", () => assert.strictEqual(A.hoursToTarget(0.02, 0.03), 0));
})();

/* ── water-intake (하루 물 섭취량) ── */
(function () {
  const W = require(path.join(ROOT, "tools-src", "water-intake.client.js"));
  console.log("water-intake");
  test("70kg·운동0 → 2,310mL", () => { const r = W.waterIntake(70, 0); assert.strictEqual(r.base, 2310); assert.strictEqual(r.total, 2310); });
  test("70kg 범위 2,100~2,450", () => { const r = W.waterIntake(70, 0); assert.strictEqual(r.min, 2100); assert.strictEqual(r.max, 2450); });
  test("60kg·운동60분 → 1,980+700=2,680", () => { const r = W.waterIntake(60, 60); assert.strictEqual(r.base, 1980); assert.strictEqual(r.exercise, 700); assert.strictEqual(r.total, 2680); });
  test("운동 30분 → +350mL", () => assert.strictEqual(W.waterIntake(60, 30).exercise, 350));
})();

/* ── world-time (세계 시차, Intl tz) ── */
(function () {
  const T = require(path.join(ROOT, "tools-src", "world-time.client.js"));
  console.log("world-time");
  test("서울 = UTC+9 (540분)", () => assert.strictEqual(T.tzOffsetMinutes(new Date("2026-06-15T00:00:00Z"), "Asia/Seoul"), 540));
  test("뉴욕 겨울 = EST(-300분)", () => assert.strictEqual(T.tzOffsetMinutes(new Date("2026-01-15T00:00:00Z"), "America/New_York"), -300));
  test("뉴욕 여름 = EDT(-240분, 서머타임)", () => assert.strictEqual(T.tzOffsetMinutes(new Date("2026-06-15T00:00:00Z"), "America/New_York"), -240));
  test("서울→뉴욕 겨울 시차 −14시간", () => assert.strictEqual(T.diffHours("Asia/Seoul", "America/New_York", new Date("2026-01-15T00:00:00Z")), -14));
  test("서울→뉴욕 여름 시차 −13시간(DST)", () => assert.strictEqual(T.diffHours("Asia/Seoul", "America/New_York", new Date("2026-06-15T00:00:00Z")), -13));
  test("서울→도쿄 시차 0", () => assert.strictEqual(T.diffHours("Asia/Seoul", "Asia/Tokyo", new Date("2026-06-15T00:00:00Z")), 0));
})();

/* ── year-end-tax (연말정산) ── */
(function () {
  const Y = require(path.join(ROOT, "tools-src", "year-end-tax.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("year-end-tax");
  test("근로소득공제(5천만) = 1,225만", () => assert.strictEqual(Y.bracketDeduct(50000000, R.earnedIncomeDeduction.brackets), 12250000));
  test("산출세액(과표 31,391,250) = 3,448,688", () => assert.strictEqual(Y.progressiveTax(31391250, R.incomeTax.brackets), 3448688));
  test("근로소득세액공제 한도(5천만) = 66만", () => assert.strictEqual(Y.earnedCredit(3448688, 50000000, R), 660000));
  test("자녀세액공제 2명 55만·3명 95만", () => { assert.strictEqual(Y.childCredit(2, R), 550000); assert.strictEqual(Y.childCredit(3, R), 950000); });
  test("신용카드공제(5천만·신용2천만) = 112.5만", () => assert.strictEqual(Y.cardDeduction(50000000, 20000000, 0, 0, R), 1125000));
  test("최저사용(총급여25%) 미만이면 카드공제 0", () => assert.strictEqual(Y.cardDeduction(50000000, 10000000, 0, 0, R), 0));
  test("총급여 5천만 단독 → 결정세액 2,658,695", () => assert.strictEqual(Y.yearEndTax({ salary: 50000000 }, R).decided, 2658695));
  test("연금900만+체크2천만+기납부300만 → 환급 2,028,805", () => { const r = Y.yearEndTax({ salary: 50000000, pension: 9000000, cardCheck: 20000000, prepaid: 3000000 }, R); assert.strictEqual(r.decided, 971195); assert.strictEqual(r.refund, 2028805); });
  test("연금계좌 15%(5500만 이하): 900만 → 135만 공제", () => { const r = Y.yearEndTax({ salary: 50000000, pension: 9000000 }, R); assert.strictEqual(r.pensionAcct, 1350000); });
})();

/* ── split-bill (N빵) ── */
(function () {
  const S = require(path.join(ROOT, "tools-src", "split-bill.client.js"));
  console.log("split-bill");
  test("10만/4명 균등 = 25,000", () => assert.strictEqual(S.splitEven(100000, 4), 25000));
  test("10만/3명 1000원 올림 → 34,000·차액 2,000", () => { const r = S.splitRounded(100000, 3, 1000); assert.strictEqual(r.per, 34000); assert.strictEqual(r.collected, 102000); assert.strictEqual(r.surplus, 2000); });
  test("차등: 10만/4명, 1명 +2만 → 일반2만·추가4만", () => { const w = S.splitWeighted(100000, 4, 1, 20000); assert.strictEqual(w.base, 20000); assert.strictEqual(w.heavy, 40000); });
})();

/* ── tip (팁) ── */
(function () {
  const T = require(path.join(ROOT, "tools-src", "tip.client.js"));
  console.log("tip");
  test("5만·15% → 팁 7,500·총 57,500", () => { const r = T.tipCalc(50000, 15, 1); assert.strictEqual(r.tip, 7500); assert.strictEqual(r.total, 57500); });
  test("5만·10%·2명 → 1인당 27,500·1인팁 2,500", () => { const r = T.tipCalc(50000, 10, 2); assert.strictEqual(r.perPerson, 27500); assert.strictEqual(r.tipPerPerson, 2500); });
})();

/* ── aspect-ratio (화면 비율) ── */
(function () {
  const A = require(path.join(ROOT, "tools-src", "aspect-ratio.client.js"));
  console.log("aspect-ratio");
  test("16:9 가로1920 → 세로1080", () => assert.strictEqual(A.heightFor(16, 9, 1920), 1080));
  test("16:9 세로1080 → 가로1920", () => assert.strictEqual(A.widthFor(16, 9, 1080), 1920));
  test("1920×1080 약분 → 16:9", () => assert.deepStrictEqual(A.simplify(1920, 1080), [16, 9]));
  test("gcd(1920,1080)=120", () => assert.strictEqual(A.gcd(1920, 1080), 120));
})();

/* ── radix (진법) ── */
(function () {
  const X = require(path.join(ROOT, "tools-src", "radix.client.js"));
  console.log("radix");
  test("10진수 255 → 2진1111_1111·8진377·16진FF·8비트", () => { const r = X.convertAll("255", 10); assert.strictEqual(r.bin, "11111111"); assert.strictEqual(r.oct, "377"); assert.strictEqual(r.hex, "FF"); assert.strictEqual(r.bits, 8); });
  test("16진 FF → 10진 255", () => assert.strictEqual(X.convertAll("FF", 16).dec, 255));
  test("2진 1010 → 10진 10", () => assert.strictEqual(X.convertAll("1010", 2).dec, 10));
  test("유효성: 2진수에 2는 무효, GG(16진) 무효", () => { assert.strictEqual(X.isValid("12", 2), false); assert.strictEqual(X.convertAll("GG", 16), null); });
})();

/* ── property-tax (재산세) ── */
(function () {
  const PT = require(path.join(ROOT, "tools-src", "property-tax.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("property-tax");
  test("공정가액비율: 일반 60", () => assert.strictEqual(PT.fairRatio(550000000, false, R), 60));
  test("공정가액비율: 1주택 3억↓ 43", () => assert.strictEqual(PT.fairRatio(300000000, true, R), 43));
  test("공정가액비율: 1주택 3~6억 44", () => assert.strictEqual(PT.fairRatio(550000000, true, R), 44));
  test("공정가액비율: 1주택 6억↑ 45", () => assert.strictEqual(PT.fairRatio(600000001, true, R), 45));
  test("공시 5.5억 일반 → 과표 3.3억·본세 690,000·교육세 138,000·합계 828,000", () => {
    const r = PT.propertyTax(550000000, false, false, R);
    assert.strictEqual(r.base, 330000000); assert.strictEqual(r.main, 690000);
    assert.strictEqual(r.edu, 138000); assert.strictEqual(r.total, 828000);
  });
  test("공시 5.5억 1주택 → 과표 2.42억·본세 304,000·합계 364,800", () => {
    const r = PT.propertyTax(550000000, true, false, R);
    assert.strictEqual(r.ratio, 44); assert.strictEqual(r.base, 242000000);
    assert.strictEqual(r.main, 304000); assert.strictEqual(r.total, 364800);
  });
})();

/* ── jongbuse (종합부동산세) ── */
(function () {
  const JB = require(path.join(ROOT, "tools-src", "jongbuse.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("jongbuse");
  test("공시 15억 1주택 → 과표 1.8억·산출 900,000·농특세 180,000·합계 1,080,000", () => {
    const r = JB.jongbuse(1500000000, true, 0, 0, R);
    assert.strictEqual(r.base, 180000000); assert.strictEqual(r.calcTax, 900000);
    assert.strictEqual(r.afterCredit, 900000); assert.strictEqual(r.rural, 180000); assert.strictEqual(r.total, 1080000);
  });
  test("공시 20억 1주택 65세·10년보유 → 산출 2,760,000·공제 70%·종부세 828,000·합계 993,600", () => {
    const r = JB.jongbuse(2000000000, true, 65, 10, R);
    assert.strictEqual(r.calcTax, 2760000); assert.strictEqual(r.credit, 70);
    assert.strictEqual(r.afterCredit, 828000); assert.strictEqual(r.total, 993600);
  });
  test("세액공제 합산 80% 상한(70세40+15년50=90→80)", () => {
    const r = JB.jongbuse(2000000000, true, 75, 20, R); assert.strictEqual(r.credit, 80);
  });
  test("공시 10억 일반 → 과표 6천만·산출 300,000·합계 360,000", () => {
    const r = JB.jongbuse(1000000000, false, 0, 0, R);
    assert.strictEqual(r.base, 60000000); assert.strictEqual(r.calcTax, 300000); assert.strictEqual(r.total, 360000);
  });
  test("공시 11억 1주택 → 공제 12억 이하라 과표 0·종부세 0", () => {
    const r = JB.jongbuse(1100000000, true, 0, 0, R);
    assert.strictEqual(r.base, 0); assert.strictEqual(r.total, 0);
  });
})();

/* ── health-insurance (건강보험료) ── */
(function () {
  const HI = require(path.join(ROOT, "tools-src", "health-insurance.client.js"));
  const R = require(path.join(ROOT, "data", "rates.2026.js"));
  console.log("health-insurance");
  test("보수월액 300만 → 건강 근로자 107,850·장기 14,170·근로자합 122,020·합계 244,040", () => {
    const r = HI.healthInsurance(3000000, R);
    assert.strictEqual(r.health.worker, 107850);
    assert.strictEqual(r.ltc.worker, 14170);
    assert.strictEqual(r.worker, 122020);
    assert.strictEqual(r.total, 244040);
  });
  test("근로자=사업주 부담(건강·장기 각 절반)", () => {
    const r = HI.healthInsurance(3000000, R);
    assert.strictEqual(r.health.worker, r.health.employer);
    assert.strictEqual(r.worker, r.employer);
  });
  test("연간 근로자 부담 = 월 × 12", () => {
    const r = HI.healthInsurance(3000000, R); assert.strictEqual(r.yearWorker, r.worker * 12);
  });
  test("보수월액 하한 적용(10만 입력 → hBase=하한값)", () => {
    const r = HI.healthInsurance(100000, R); assert.strictEqual(r.hBase, R.insurance.health.base.min.value);
  });
  /* 지역가입자 */
  test("지역: 소득월액 200만·재산점수 300 → 소득 143,800·재산 63,450·건강 207,250·장기 27,230·합 234,480", () => {
    const r = HI.regionalHealth(2000000, 300, R);
    assert.strictEqual(r.incomePremium, 143800);
    assert.strictEqual(r.propertyPremium, 63450);
    assert.strictEqual(r.health, 207250);
    assert.strictEqual(r.ltc, 27230);
    assert.strictEqual(r.total, 234480);
  });
  test("지역: 연간 합계 = 월 × 12", () => {
    const r = HI.regionalHealth(2000000, 300, R); assert.strictEqual(r.yearTotal, r.total * 12);
  });
  test("지역: 최저보험료 적용(소득월액 10만·재산 0 → 건강 20,160·appliedMin)", () => {
    const r = HI.regionalHealth(100000, 0, R);
    assert.strictEqual(r.health, R.insurance.health.regional.minPremium.value);
    assert.strictEqual(r.health, 20160);
    assert.strictEqual(r.appliedMin, true);
    assert.strictEqual(r.total, 20160 + 2640);
  });
  test("지역: 재산점수만 입력(소득 0·점수 100 → 재산 21,150·최저 미적용)", () => {
    const r = HI.regionalHealth(0, 100, R);
    assert.strictEqual(r.propertyPremium, 21150);
    assert.strictEqual(r.health, 21150);
    assert.strictEqual(r.appliedMin, false);
  });
})();

console.log("\n결과: " + pass + " 통과, " + fail + " 실패");
process.exit(fail ? 1 : 0);
