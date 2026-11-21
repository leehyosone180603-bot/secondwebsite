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

console.log("\n결과: " + pass + " 통과, " + fail + " 실패");
process.exit(fail ? 1 : 0);
