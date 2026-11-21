/* ============================================================
   요율·기준값 설정 — 2026년 적용분 (공식 출처 확인 완료)
   확인일 2026-11-22 · 크롬으로 공식 사이트 직접 열람해 확정.
   값마다 적용 연도·출처 URL·확인일·(필요시)근거를 함께 보관.
   todo:true = 아직 공식 미확인(없음).  listTodos()로 추출.
   ※ 2027년 변경분은 data/rates.2027.js, 선택은 data/rates.js 로더.
   - 브라우저: window.RATES_2026   - Node: require("./rates.2026.js")
   ============================================================ */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.RATES_2026 = api;
})(function () {
  "use strict";
  var YEAR = 2026, LC = "2026-11-22";
  function v(value, unit, source, extra) { return Object.assign({ value: value, unit: unit, year: YEAR, source: source, lastChecked: LC, todo: false }, extra || {}); }

  var MW = "https://www.minimumwage.go.kr/minWage/policy/decisionMain.do";
  var INS = "https://www.4insure.or.kr/pbiz/ntcn/inscSmlCalcView.do";
  var NTS55 = "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7675";
  var LAW = function (p) { return "https://www.law.go.kr/법령/" + p; };

  var R = {
    year: YEAR,

    /* ── 최저임금 (최저임금위원회) ── */
    minimumWage: {
      hourly: v(10320, "원/시간", MW, { 근거: "2025.08.05 결정고시(인상률 2.9%)", period: "2026-01-01~2026-12-31" }),
      monthly: v(2156880, "원/월", MW, { note: "고시 월환산액(주40시간, 월 209시간 기준)" }),
      daily8h: v(82560, "원/일", MW, { note: "1일 8시간" })
    },

    /* ── 부가가치세 (법제처 부가가치세법) ── */
    vatRate: v(10, "%", LAW("부가가치세법"), { note: "일반과세 세율(장기 고정)" }),

    /* ── 원천징수 (국세청 소득세법 제129조 / 지방세법) ── */
    withholding: {
      businessIncome: v(3.3, "%", LAW("소득세법/제129조"), { 근거: "소득세법 §129①3(3%) + 지방소득세 0.3%", note: "프리랜서 사업소득" }),
      otherIncome: v(8.8, "%", LAW("소득세법시행령/제87조"), { 근거: "기타소득 20% × (1−필요경비 60%의제) = 실효 8% + 지방 0.8%", note: "강연료·원고료 등. 공익상금 80%·서화골동품 90%는 별도" })
    },

    /* ── 4대 보험 (4대사회보험정보연계센터) ── */
    insurance: {
      nationalPension: {
        total: v(9.5, "%", INS, { 근거: "국민연금법 §88(2026부터 매년 0.5%p↑, 최종 13%)", note: "★2025년까지 9%였음(연금개혁 반영)" }),
        worker: v(4.75, "%", INS), employer: v(4.75, "%", INS),
        base: { min: v(410000, "원/월", INS, { period: "2026.7~2027.6", note: "천원미만 절사" }), max: v(6590000, "원/월", INS, { period: "2026.7~2027.6" }) }
      },
      health: {
        total: v(7.19, "%", INS, { note: "원 단위 절사, 근로자·사업주 각 50%" }),
        worker: v(3.595, "%", INS), employer: v(3.595, "%", INS),
        base: { min: v(280528, "원/월", INS, { note: "보수월액 하한" }), max: v(127725730, "원/월", INS, { note: "보수월액 상한" }) }
      },
      longTermCare: {
        ofSalary: v(0.9448, "%", INS, { note: "★공식: 보수월액 대비 0.9448% (근로자·사업주 각 50%)" }),
        ofHealthPremium: v(13.14, "%", INS, { note: "건강보험료 대비 환산값 = 0.9448 ÷ 7.19 (계산식: 건보료 × 0.9448/7.19)" })
      },
      employment: {
        unemployment: { worker: v(0.9, "%", INS, { note: "2022.7.1~" }), employer: v(0.9, "%", INS) },
        /* 고용안정·직업능력개발(사업주만) — 규모별 */
        employmentStability: {
          source: INS, year: YEAR, lastChecked: LC, todo: false,
          brackets: [
            { label: "150인 미만 기업", rate: 0.25 },
            { label: "150인 이상(우선지원대상기업)", rate: 0.45 },
            { label: "150인 이상 1,000인 미만 기업", rate: 0.65 },
            { label: "1,000인 이상 기업·국가·지자체", rate: 0.85 }
          ],
          note: "우선지원대상: 제조 500·건설/운수 300·도소매/숙박음식 200·그밖 100명 이하"
        }
      },
      workersComp: v(1.47, "%", "https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18810", { 근거: "고용노동부고시 제2025-91호(2025.12.31)", note: "전 업종 평균(참고). 전액 사업주, 실제는 28개 업종별 상이" })
    },

    /* ── 종합소득세 과세표준 구간·세율 (국세청/소득세법 §55) ── */
    incomeTax: {
      source: NTS55, lawSource: LAW("소득세법/제55조"), year: YEAR, lastChecked: LC, todo: false,
      note: "소득세법 §55①(현행). 누진공제 방식. 지방소득세는 별도 10%.",
      brackets: [
        { over: 0,          upTo: 14000000,  rate: 6,  deduction: 0 },
        { over: 14000000,   upTo: 50000000,  rate: 15, deduction: 1260000 },
        { over: 50000000,   upTo: 88000000,  rate: 24, deduction: 5760000 },
        { over: 88000000,   upTo: 150000000, rate: 35, deduction: 15440000 },
        { over: 150000000,  upTo: 300000000, rate: 38, deduction: 19940000 },
        { over: 300000000,  upTo: 500000000, rate: 40, deduction: 25940000 },
        { over: 500000000,  upTo: 1000000000, rate: 42, deduction: 35940000 },
        { over: 1000000000, upTo: null,      rate: 45, deduction: 65940000 }
      ]
    },

    /* ── 지방소득세 ── */
    localIncomeTaxRate: v(10, "%", LAW("지방세법/제103조의13"), { note: "원천징수 소득세의 10% 특별징수" }),

    /* ── 비과세 식대 ── */
    mealAllowanceNonTaxable: v(200000, "원/월", LAW("소득세법/제12조"), { 근거: "소득세법 §12 3호 러목", note: "식사 현물 미제공자에 한함" }),

    /* ── 이자소득세 ── */
    interestTax: {
      general: v(15.4, "%", LAW("소득세법/제129조"), { note: "소득세 14% + 지방 1.4%" }),
      note: "세금우대종합저축(9.5%)은 2014.12.31까지 가입분만 해당 → 신규 계산기에는 '일반 15.4% / 비과세 0%' 옵션 권장"
    },

    /* ── 근로소득 간이세액표 (국세청 홈택스) ── */
    simplifiedTaxTable: {
      year: YEAR, lastChecked: LC, todo: false,
      effectiveFrom: "2026-03-01",
      download: "홈택스 > 세금신고 > 원천세 신고 > 근로소득 간이세액표 (한글/엑셀/PDF)",
      source: "https://hometax.go.kr",
      근거: "소득세법 §134, 시행령 §194 별표2",
      /* 8~20세 자녀 세액공제(2026.3.1 개정, 월 기준) */
      childDeduction: { one: 20830, two: 45830, overTwoPerChild: 33330, note: "1명 20,830 / 2명 45,830 / 3명↑ 45,830+초과1명당 33,330, 음수는 0" },
      /* 검증 샘플(월급여 300만, 자녀 0) — '공제대상 가족 수'는 본인 포함 */
      sample: [
        { monthlyPay: 3000000, family: 1, child: 0, incomeTax: 59480, localTax: 5940 },
        { monthlyPay: 3000000, family: 2, child: 0, incomeTax: 45480, localTax: 4540 }
      ],
      note: "전체 표는 방대하여 엑셀 파일 필요. 급여계산기 정확도용으로 별도 변환 예정."
    },

    /* ── 퇴직금·퇴직소득세 ── */
    retirement: {
      averageWageDays: v(30, "일", LAW("근로자퇴직급여보장법"), { note: "퇴직금 = 1일 평균임금 × 30 × (재직일수/365)" }),
      // 근속연수공제 (§48①1): 공제 = base + perYear × (근속연수 − over)
      serviceYearDeduction: {
        source: LAW("소득세법/제48조"), year: YEAR, lastChecked: LC, todo: false,
        note: "근속연수 1년 미만은 1년으로. 1개월 미만도 1개월로 셈",
        brackets: [
          { upToYears: 5,    base: 0,         perYear: 1000000, over: 0 },
          { upToYears: 10,   base: 5000000,   perYear: 2000000, over: 5 },
          { upToYears: 20,   base: 15000000,  perYear: 2500000, over: 10 },
          { upToYears: null, base: 40000000,  perYear: 3000000, over: 20 }
        ]
      },
      // 환산급여별공제 (§48①2): 공제 = base + (환산급여 − over) × rate/100
      convertedIncomeDeduction: {
        source: LAW("소득세법/제48조"), year: YEAR, lastChecked: LC, todo: false,
        brackets: [
          { upTo: 8000000,   base: 0,         rate: 100, over: 0 },
          { upTo: 70000000,  base: 8000000,   rate: 60,  over: 8000000 },
          { upTo: 100000000, base: 45200000,  rate: 55,  over: 70000000 },
          { upTo: 300000000, base: 61700000,  rate: 45,  over: 100000000 },
          { upTo: null,      base: 151700000, rate: 35,  over: 300000000 }
        ]
      },
      taxMethod: "환산급여=(퇴직소득−근속연수공제)÷근속연수×12 → 과세표준=환산급여−환산급여공제 → 환산산출세액=과세표준×기본세율 → 퇴직소득세=환산산출세액×근속연수÷12 (§55②)",
      samples: [
        { severance: 30000000, years: 5, incomeTax: 775000, localTax: 77500 },
        { severance: 100000000, years: 10, incomeTax: 3875000, localTax: 387500 }
      ]
    },

    /* ── 복권 당첨금 세금 (소득세법 §84·§129) ── */
    lottoTax: {
      source: LAW("소득세법/제129조"), year: YEAR, lastChecked: LC, todo: false,
      nonTaxableThreshold: 2000000, // 건별 200만원 이하 비과세(§84 2호)
      brackets: [ // 소득금액 구간 (지방소득세 = 소득세의 10%)
        { upTo: 300000000, incomeRate: 20, localRate: 2 },
        { upTo: null,      incomeRate: 30, localRate: 3 }
      ],
      deductPurchase: false,
      note: "200만원 초과 시 당첨금 전체 과세. 3억 초과분만 30%. 분리과세 종결. 구입금액 경비차감은 소득세법 미명시 → 차감 안 함(보수적)"
    }
  };

  /* ── 근로소득공제 (소득세법 §47) ── */
  R.earnedIncomeDeduction = {
    source: LAW("소득세법/제47조"), year: YEAR, lastChecked: LC, todo: false, limit: 20000000,
    brackets: [
      { upTo: 5000000,   base: 0,         rate: 70, over: 0 },
      { upTo: 15000000,  base: 3500000,   rate: 40, over: 5000000 },
      { upTo: 45000000,  base: 7500000,   rate: 15, over: 15000000 },
      { upTo: 100000000, base: 12000000,  rate: 5,  over: 45000000 },
      { upTo: null,      base: 14750000,  rate: 2,  over: 100000000 }
    ]
  };

  /* ── 근로소득세액공제 (소득세법 §59) ── */
  R.earnedIncomeTaxCredit = {
    source: LAW("소득세법/제59조"), year: YEAR, lastChecked: LC, todo: false,
    threshold: 1300000, lowRate: 55, lowCredit: 715000, highRate: 30,
    limits: [ // 총급여(tg)별 한도: flat 또는 (base − (tg−from)×slope, 최소 min)
      { upTo: 33000000,  flat: 740000 },
      { upTo: 70000000,  from: 33000000, base: 740000, slope: 0.008, min: 660000 },
      { upTo: 120000000, from: 70000000, base: 660000, slope: 0.5,   min: 500000 },
      { upTo: null,      from: 120000000, base: 500000, slope: 0.5,   min: 200000 }
    ]
  };

  /* ── 인적공제 (소득세법 §50~§51) ── */
  R.personalDeduction = {
    source: LAW("소득세법/제50조"), year: YEAR, lastChecked: LC, todo: false,
    basic: 1500000, elderly70: 1000000, disabled: 2000000, woman: 500000, singleParent: 1000000
  };

  /* ── 자녀세액공제(연말정산, 소득세법 §59의2) ── */
  R.childTaxCredit = {
    source: LAW("소득세법/제59조의2"), year: YEAR, lastChecked: LC, todo: false,
    one: 250000, two: 550000, overTwoPerChild: 400000,
    ageBaseByYear: { 2026: 9, 2027: 10, 2028: 11, 2029: 12, 2030: 13 },
    birth: { first: 300000, second: 500000, thirdPlus: 700000 },
    note: "★연말정산용. 귀속연도별 연령 기준 상이(2026 귀속 9세↑). 월 간이세액표(8세↑)와 다름"
  };

  /* 간이세액표: 월 자녀공제·검증샘플 보강(전체 표는 홈택스 엑셀 필요) */
  R.simplifiedTaxTable.childMonthly = { one: 20830, two: 45830, overTwoPerChild: 33330 };
  R.simplifiedTaxTable.needsExcel = true;
  R.simplifiedTaxTable.samples = [
    { monthlyPay: 2500000, family: 1, child: 0, incomeTax: 28480, localTax: 2840 },
    { monthlyPay: 3000000, family: 1, child: 0, incomeTax: 59480, localTax: 5940 },
    { monthlyPay: 3000000, family: 2, child: 0, incomeTax: 45480, localTax: 4540 },
    { monthlyPay: 4000000, family: 3, child: 1, incomeTax: 71000, localTax: 7100 },
    { monthlyPay: 5000000, family: 4, child: 2, incomeTax: 138610, localTax: 13860 },
    { monthlyPay: 7000000, family: 1, child: 0, incomeTax: 586160, localTax: 58610 }
  ];

  /* 미확인(todo) 값 추출 — 빌드/보고용 */
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
