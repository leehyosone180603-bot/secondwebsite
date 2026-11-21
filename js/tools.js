/* ============================================================
   도구 레지스트리 (단일 설정 파일)
   ------------------------------------------------------------
   사이트의 모든 생활 계산기·도구·게임·테스트·정보 페이지를
   여기 한 곳에 등록한다. 메뉴, 사이트맵, 관련 도구 추천, 검색,
   허브 페이지는 모두 이 파일에서 자동 생성된다.

   - 브라우저: window.TOOLS / window.TOOL_CATEGORIES
   - Node(빌드 스크립트): require("../js/tools.js") → {TOOLS, TOOL_CATEGORIES}

   URL 규칙(※ 기존 사이트 관례에 맞춤):
     모든 도구는 /{slug}/ 평면 디렉터리(index.html)로 발행한다.
     (제안된 /calculator/·/tool/·/play/ 접두어 대신 /{slug}/ 로 통일.
      유형 구분은 URL이 아니라 아래 category 로 한다.)

   항목 필드:
     id        고유 식별자(= slug 와 동일하게 유지 권장)
     slug      URL 경로( /{slug}/ )
     name      표시 이름
     category  TOOL_CATEGORIES 의 id
     kind      "calculator" | "tool" | "play" | "info"  (분류/스키마용)
     emoji     아이콘
     desc      한 줄 설명
     related   관련 도구 id 목록
     public    공개 여부(false 면 메뉴·사이트맵에서 제외)
     isNew     신규 출시 뱃지(선택)
   ============================================================ */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") { window.TOOLS = api.TOOLS; window.TOOL_CATEGORIES = api.TOOL_CATEGORIES; }
})(this, function () {
  "use strict";

  /* 카테고리 (순서 = 메뉴/허브 노출 순서) */
  var TOOL_CATEGORIES = [
    { id: "tax",        name: "세금·급여",  emoji: "💰" },
    { id: "date",       name: "날짜·기간",  emoji: "📅" },
    { id: "finance",    name: "금융·저축",  emoji: "🏦" },
    { id: "realestate", name: "부동산",     emoji: "🏠" },
    { id: "car",        name: "자동차",     emoji: "🚗" },
    { id: "health",     name: "건강·일상",  emoji: "🩺" },
    { id: "convert",    name: "생성·변환",  emoji: "🔄" },
    { id: "toolbox",    name: "도구 모음",  emoji: "🧰" },
    { id: "game",       name: "스낵 게임",  emoji: "🎮" },
    { id: "test",       name: "스낵 테스트", emoji: "🧩" },
    { id: "policy",     name: "정부 정책",  emoji: "📋" },
    { id: "info",       name: "정보 모음",  emoji: "📚" },
    { id: "event",      name: "이벤트",     emoji: "🎉" }
  ];

  /* 도구 목록 */
  var TOOLS = [
    /* ── 세금·급여 ── */
    { id: "salary", slug: "salary", name: "연봉 실수령액 계산기", category: "tax", kind: "calculator", emoji: "💵",
      desc: "연봉에서 4대보험·소득세를 뺀 월 실수령액을 계산합니다.", related: ["4insure", "severance", "parttime", "freelancer"], public: true },
    { id: "severance", slug: "severance", name: "퇴직금 계산기", category: "tax", kind: "calculator", emoji: "🧾",
      desc: "평균임금과 재직일수로 예상 퇴직금을 계산합니다.", related: ["salary", "freelancer"], public: true },
    { id: "vat", slug: "vat", name: "부가세 계산기", category: "tax", kind: "calculator", emoji: "🧮",
      desc: "공급가액·합계금액에서 부가가치세(10%)를 계산합니다.", related: ["freelancer", "salary"], public: true },
    { id: "freelancer", slug: "freelancer", name: "프리랜서 세금(3.3%) 계산기", category: "tax", kind: "calculator", emoji: "💼",
      desc: "프리랜서 지급액의 원천징수 3.3%와 실수령액을 계산합니다.", related: ["salary", "vat", "4insure"], public: true },
    { id: "parttime", slug: "parttime", name: "알바 급여 계산기", category: "tax", kind: "calculator", emoji: "🧑‍🍳",
      desc: "시급·근무시간으로 주휴수당 포함 주급·월급·실수령액을 계산합니다.", related: ["salary", "4insure", "freelancer"], public: true, isNew: true },
    { id: "4insure", slug: "4insure", name: "4대보험 계산기", category: "tax", kind: "calculator", emoji: "🛡️",
      desc: "월 보수로 국민연금·건강·장기요양·고용·산재 보험료를 계산합니다.", related: ["salary", "parttime", "freelancer"], public: true, isNew: true },

    /* ── 날짜·기간 ── */
    { id: "age", slug: "age", name: "만 나이 계산기", category: "date", kind: "calculator", emoji: "🎂",
      desc: "생년월일로 만 나이·세는 나이·띠·다음 생일을 계산합니다.", related: ["dday", "birth-year", "business-days"], public: true },
    { id: "dday", slug: "dday", name: "날짜 계산기 (D-Day)", category: "date", kind: "calculator", emoji: "📆",
      desc: "D-Day, 두 날짜 사이 기간, 날짜 더하기·빼기, 기념일을 계산합니다.", related: ["age", "business-days"], public: true, isNew: true },
    { id: "birth-year", slug: "birth-year", name: "몇년생·나이 계산기", category: "date", kind: "calculator", emoji: "🔎",
      desc: "나이로 출생연도·띠를 찾고, 띠로 나이를 역산합니다.", related: ["age", "military"], public: true },
    { id: "business-days", slug: "business-days", name: "영업일 계산기", category: "date", kind: "calculator", emoji: "📆",
      desc: "주말·공휴일을 제외한 영업일수와 기준일을 계산합니다.", related: ["age", "military"], public: true },
    { id: "military", slug: "military", name: "전역일 계산기", category: "date", kind: "calculator", emoji: "🎖️",
      desc: "입대일로 전역일과 복무 진행률(D-day)을 계산합니다.", related: ["business-days", "age"], public: true },

    /* ── 금융·저축 ── */
    { id: "lotto-prize", slug: "lotto-prize", name: "로또 당첨금 실수령액", category: "finance", kind: "calculator", emoji: "💰",
      desc: "당첨금에서 제세금을 뺀 실수령액을 계산합니다.", related: ["salary"], public: true },

    /* ── 부동산 ── */
    { id: "dsr", slug: "dsr", name: "DSR 계산기", category: "realestate", kind: "calculator", emoji: "🏦",
      desc: "연소득과 대출로 총부채원리금상환비율(DSR)을 계산합니다.", related: ["jeonse-loan", "salary"], public: true },
    { id: "jeonse-loan", slug: "jeonse-loan", name: "전세자금대출 이자 계산기", category: "realestate", kind: "calculator", emoji: "🏠",
      desc: "전세보증금·금리로 월 이자와 총이자를 계산합니다.", related: ["dsr", "lotto-prize"], public: true },

    /* ── 도구 모음 ── */
    { id: "scientific", slug: "scientific", name: "공학용 계산기", category: "toolbox", kind: "tool", emoji: "🧮",
      desc: "삼각함수·로그·거듭제곱을 지원하는 공학용 계산기.", related: ["vat"], public: true },
    /* 로또 번호 추출기: 스낵 게임류 제외 요청 → 메뉴·관련도구에서 숨김(기존 페이지는 유지) */
    { id: "lotto", slug: "lotto", name: "로또 번호 추출기", category: "toolbox", kind: "tool", emoji: "🎱",
      desc: "1~45 중 중복 없이 번호를 무작위로 추첨합니다.", related: [], public: false },

    /* ── 생성·변환 ── */
    { id: "percent", slug: "percent", name: "퍼센트 계산기", category: "convert", kind: "calculator", emoji: "➗",
      desc: "X의 Y%, 전체 중 비율, 증감률을 바로 계산합니다.", related: ["vat", "salary"], public: true, isNew: true },

    /* ── 정부 정책 ── */
    { id: "support-check", slug: "support-check", name: "민생지원금 대상 조회", category: "policy", kind: "tool", emoji: "📋",
      desc: "조건을 입력해 지원금 대상 여부와 안내를 확인합니다.", related: ["salary"], public: true }
  ];

  /* ── 헬퍼 (브라우저/노드 공용) ── */
  function publicTools() { return TOOLS.filter(function (t) { return t.public !== false; }); }
  function byCategory(catId) { return publicTools().filter(function (t) { return t.category === catId; }); }
  function byId(id) { for (var i = 0; i < TOOLS.length; i++) if (TOOLS[i].id === id) return TOOLS[i]; return null; }
  function categoryName(catId) { for (var i = 0; i < TOOL_CATEGORIES.length; i++) if (TOOL_CATEGORIES[i].id === catId) return TOOL_CATEGORIES[i].name; return catId; }
  function related(tool, max) {
    var out = [];
    (tool.related || []).forEach(function (rid) { var r = byId(rid); if (r && r.public !== false) out.push(r); });
    // 부족하면 같은 카테고리에서 보충
    if (out.length < (max || 6)) {
      byCategory(tool.category).forEach(function (r) {
        if (r.id !== tool.id && out.indexOf(r) < 0 && out.length < (max || 6)) out.push(r);
      });
    }
    return out.slice(0, max || 6);
  }

  return {
    TOOLS: TOOLS,
    TOOL_CATEGORIES: TOOL_CATEGORIES,
    publicTools: publicTools,
    byCategory: byCategory,
    byId: byId,
    categoryName: categoryName,
    related: related
  };
});
