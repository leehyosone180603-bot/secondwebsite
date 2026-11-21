/* ============================================================
   요율·기준값 설정 — 2027년 적용분
   2026년 값을 기반으로, 2027-01-01부터 바뀌는 값만 교체한 자립형 객체.
   확인일 2026-11-22 (2027 확정분은 공식 고시/의결 반영).
   변경: 최저임금 / 국민연금 10% / 장기요양 0.9994%  (건강보험 7.19% 동결)
   미정: 국민연금 기준소득월액(2027.7~), 산재보험료율(12월 말 고시) → todo
   - 브라우저: window.RATES_2027 (rates.2026.js 를 먼저 로드)
   - Node: require("./rates.2027.js")
   ============================================================ */
(function (factory) {
  var base = (typeof require !== "undefined") ? require("./rates.2026.js") : (typeof window !== "undefined" ? window.RATES_2026 : null);
  var api = factory(base);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.RATES_2027 = api;
})(function (base) {
  "use strict";
  if (!base) return { year: 2027, error: "rates.2026 base not loaded" };
  var R = JSON.parse(JSON.stringify(base)); // 깊은 복제(함수 제외)
  var Y = 2027;
  R.year = Y;

  function setY(o) { if (o && typeof o === "object" && "year" in o) o.year = Y; }

  /* 최저임금 */
  R.minimumWage.hourly.value = 10700; R.minimumWage.hourly.period = "2027-01-01~2027-12-31"; R.minimumWage.hourly.근거 = "2026.08.05 고시(인상률 3.7%)";
  R.minimumWage.monthly.value = 2236300;
  R.minimumWage.daily8h.value = 85600;
  setY(R.minimumWage.hourly); setY(R.minimumWage.monthly); setY(R.minimumWage.daily8h);

  /* 국민연금 10% (근로자·사업주 각 5%) */
  R.insurance.nationalPension.total.value = 10; R.insurance.nationalPension.total.note = "국민연금법 §88(매년 0.5%p↑, 최종 13%)";
  R.insurance.nationalPension.worker.value = 5; R.insurance.nationalPension.employer.value = 5;
  setY(R.insurance.nationalPension.total); setY(R.insurance.nationalPension.worker); setY(R.insurance.nationalPension.employer);
  /* 기준소득월액: 2027.1~6은 2026.7고시값 유지, 2027.7~ 신규값 미정 */
  R.insurance.nationalPension.base.min.note = "2027.1~6 적용(2027.7~ 신규값은 2027.3 고시)";
  R.insurance.nationalPension.base.max.note = "2027.1~6 적용(2027.7~ 신규값은 2027.3 고시)";

  /* 장기요양 0.9994% (건강보험료 대비 13.90%) — 건강보험 7.19% 동결 */
  R.insurance.longTermCare.ofSalary.value = 0.9994; R.insurance.longTermCare.ofSalary.note = "★공식: 보수월액 대비 0.9994%(2026.10.30 장기요양위 의결)";
  R.insurance.longTermCare.ofHealthPremium.value = 13.90;
  setY(R.insurance.longTermCare.ofSalary); setY(R.insurance.longTermCare.ofHealthPremium);

  /* 산재보험료율 2027: 미고시 */
  R.insurance.workersComp.todo = true; R.insurance.workersComp.note = "2027년 사업종류별 산재보험료율 고시 대기(보통 12월 말). 확정 전 2026년 값 참고.";

  /* 실업급여 2027: 최저시급 10,700원 반영 → 하한 68,480원. 2027 상한액 개정 미확인(todo) */
  R.unemployment.minHourly = 10700;
  R.unemployment.dailyMin = Math.round(10700 * 0.8 * 8); // 68,480
  R.unemployment.todo = true;
  R.unemployment.note = "2027 하한액 68,480원(최저시급 10,700×80%×8). 2027 상한액 개정 미확인 → 상한은 2026년 68,100원으로 임시 표기(확인 필요). 하한>상한 역전 상태라 공식 고시 확인 전 참고용.";

  /* listTodos 재부착(복제로 사라짐) */
  R.listTodos = function () {
    var out = [];
    (function walk(obj, p) {
      if (obj && typeof obj === "object") {
        if ("todo" in obj && !("length" in obj)) { if (obj.todo) out.push({ key: p, note: obj.note || "" }); return; }
        for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k] && typeof obj[k] === "object") walk(obj[k], p ? p + "." + k : k);
      }
    })(R, "");
    return out;
  };
  return R;
});
