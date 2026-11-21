/* ============================================================
   요율·기준값 설정 (2026년 적용분)
   ------------------------------------------------------------
   세율·보험료율·최저임금·공제 한도 등 '숫자 기준값'은 코드에
   직접 쓰지 말고 전부 여기 모은다. 각 값은 다음을 함께 저장:
     value       값
     unit        단위(%, 원, 원/시간 등)
     year        적용 연도
     source      공식 출처 URL(국세청/고용노동부/보건복지부/국민연금공단/
                 국민건강보험공단/근로복지공단/행정안전부/국토교통부/법제처 등)
     lastChecked 마지막 확인일(YYYY-MM-DD)
     todo        true = 공식 출처로 아직 미확인(반드시 확인 후 todo 제거)
     note        비고

   ⚠️ todo:true 인 값은 화면/계산에 쓰기 전에 공식 출처에서 확인해야 한다.
      (빌드 시 scripts/rates-todo.js 로 미확인 목록을 뽑을 수 있음)

   - 브라우저: window.RATES_2026
   - Node: require("../data/rates.2026.js")
   ============================================================ */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.RATES_2026 = api;
})(function () {
  "use strict";

  var YEAR = 2026;
  var R = {
    year: YEAR,

    /* ── 부가가치세 (법제처 부가가치세법) ── 안정적 법정 세율 ── */
    vatRate: { value: 10, unit: "%", year: YEAR, source: "https://www.law.go.kr/법령/부가가치세법", lastChecked: "2026-11-21", todo: false, note: "일반과세 부가가치세율 10% (장기 고정)" },

    /* ── 프리랜서 사업소득 원천징수 (국세청 소득세법) ── */
    freelancerWithholding: { value: 3.3, unit: "%", year: YEAR, source: "https://www.nts.go.kr", lastChecked: "2026-11-21", todo: false, note: "소득세 3% + 지방소득세 0.3% = 3.3%" },

    /* ── 최저임금 (고용노동부 최저임금위원회) ── 반드시 확인 ── */
    minimumWageHourly: { value: null, unit: "원/시간", year: YEAR, source: "https://www.minimumwage.go.kr", lastChecked: null, todo: true, note: "2026년 시간급 최저임금 — 공식 고시 확인 필요" },
    minimumWageMonthly: { value: null, unit: "원/월", year: YEAR, source: "https://www.minimumwage.go.kr", lastChecked: null, todo: true, note: "월 환산액(209시간 기준) — 확인 필요" },

    /* ── 4대 보험료율 (근로자 부담분) ── 반드시 확인 ── */
    insurance: {
      nationalPension:     { value: null, unit: "%", year: YEAR, source: "https://www.nps.or.kr", lastChecked: null, todo: true, note: "국민연금 근로자 부담률(통상 4.5%) — 확인 필요" },
      healthInsurance:     { value: null, unit: "%", year: YEAR, source: "https://www.nhis.or.kr", lastChecked: null, todo: true, note: "건강보험 근로자 부담률 — 확인 필요" },
      longTermCareRate:    { value: null, unit: "%", year: YEAR, source: "https://www.nhis.or.kr", lastChecked: null, todo: true, note: "장기요양보험료율(건강보험료 대비) — 확인 필요" },
      employmentInsurance: { value: null, unit: "%", year: YEAR, source: "https://www.comwel.or.kr", lastChecked: null, todo: true, note: "고용보험 근로자 부담률(실업급여분) — 확인 필요" }
    },

    /* ── 국민연금 기준소득월액 상·하한 ── 반드시 확인 ── */
    pensionBase: {
      min: { value: null, unit: "원/월", year: YEAR, source: "https://www.nps.or.kr", lastChecked: null, todo: true, note: "기준소득월액 하한 — 확인 필요" },
      max: { value: null, unit: "원/월", year: YEAR, source: "https://www.nps.or.kr", lastChecked: null, todo: true, note: "기준소득월액 상한 — 확인 필요" }
    },

    /* ── 근로소득 간이세액(소득세) 과세표준 구간 ── 반드시 확인 ── */
    incomeTaxBrackets: { value: null, unit: "구간표", year: YEAR, source: "https://www.nts.go.kr", lastChecked: null, todo: true, note: "종합소득세 과세표준 구간·세율·누진공제 — 확인 필요" },

    /* ── 퇴직소득/기타 ── 필요 시 확장 ── */
    retirement: {
      averageWageDays: { value: 30, unit: "일", year: YEAR, source: "https://www.law.go.kr/법령/근로자퇴직급여보장법", lastChecked: "2026-11-21", todo: false, note: "퇴직금 = 1일 평균임금 × 30 × (재직일수/365) (산식 고정)" }
    }
  };

  /* 미확인(todo) 값 목록을 평탄화해 반환 — 빌드/보고용 */
  R.listTodos = function () {
    var out = [];
    (function walk(obj, path) {
      if (obj && typeof obj === "object") {
        if (Object.prototype.hasOwnProperty.call(obj, "todo")) {
          if (obj.todo) out.push({ key: path, note: obj.note || "", source: obj.source || "" });
          return;
        }
        for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && typeof obj[k] === "object") walk(obj[k], path ? path + "." + k : k);
      }
    })(R, "");
    return out;
  };

  return R;
});
