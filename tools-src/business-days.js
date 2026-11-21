/* 영업일 계산기 — 페이지 스펙 */
module.exports = {
  id: "business-days",
  title: "영업일 계산기 - 주말·공휴일 제외 영업일 수·배송예정일 | 건강흐름",
  description: "두 날짜 사이 영업일 수(주말·법정/대체/임시공휴일 제외)와 기준일로부터 N영업일 후 날짜를 계산합니다. 토요일 근무·회사 휴무일 추가, 제외 공휴일 목록 표시.",
  keywords: "영업일 계산기, 영업일 수, 배송 예정일, 공휴일 제외, 근무일 계산, D-day 영업일",
  subtitle: "주말·공휴일 뺀 영업일 수와 N영업일 후 날짜",
  extraScripts: ["/data/holidays.2025.js", "/data/holidays.2026.js", "/data/holidays.2027.js", "/data/holidays.js"],
  intro: '<p>주말과 법정·대체·임시공휴일을 뺀 <strong>영업일</strong>을 계산합니다. (2025~2027년 공휴일 반영)</p>',
  inputsHtml:
    '<div class="field"><label>계산 모드</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-tab="count" aria-pressed="true">기간 영업일 수</button>' +
    '<button type="button" class="btn-sm" data-tab="add">N영업일 후/전</button></div></div>' +

    '<div class="field"><label><input type="checkbox" id="satWork" data-share> 토요일도 근무(영업일로 계산)</label></div>' +
    '<div class="field"><label for="customOff">추가 휴무일 <span class="hint">(회사 휴무 등, 쉼표로 여러 개: 2026-06-15, 2026-08-14)</span></label>' +
    '<input type="text" id="customOff" data-share placeholder="2026-06-15, 2026-08-14"></div>' +

    '<div class="bz-panel" data-panel="count">' +
    '<div class="field"><label for="bStart">시작일</label><input type="date" id="bStart" data-share></div>' +
    '<div class="field"><label for="bEnd">종료일</label><input type="date" id="bEnd" data-share></div>' +
    '<div class="field"><label><input type="checkbox" id="bIncl" data-share> 시작일 포함</label></div></div>' +

    '<div class="bz-panel" data-panel="add" hidden>' +
    '<div class="field"><label for="aBase">기준일</label><input type="date" id="aBase" data-share></div>' +
    '<div class="field"><label for="aN">영업일 수</label><div class="input-unit"><input type="text" id="aN" data-share inputmode="numeric" placeholder="예: 5"><span class="unit">영업일</span></div></div>' +
    '<div class="field"><label for="aDir">방향</label><select id="aDir" data-share><option value="after">후(+)</option><option value="before">전(−)</option></select></div></div>',
  resultHtml: '<div id="bzResult"></div>',
  method:
    '<p>영업일은 주말(일요일, 선택 시 토요일)과 공휴일을 뺀 날입니다.</p>' +
    '<ul><li><strong>기간 영업일 수</strong>: 시작일~종료일 중 영업일만 셉니다. 시작일 포함 여부를 고를 수 있습니다.</li>' +
    '<li><strong>N영업일 후/전</strong>: 기준일에서 영업일만 세어 N번째 날을 찾습니다. 주말·공휴일은 건너뜁니다.</li></ul>' +
    '<p>법정공휴일·대체공휴일·임시공휴일을 모두 제외하며, 회사 휴무일은 직접 추가할 수 있습니다. 공휴일 데이터는 행정안전부·한국천문연구원 기준입니다.</p>',
  learnMore: [
    { h: "영업일 vs 평일", p: "평일은 월~금이지만, 영업일은 평일 중에서도 공휴일을 뺀 날입니다. 은행·관공서·택배의 처리 기준이 보통 영업일입니다." },
    { h: "배송·출고일 계산", p: "‘주문 후 2영업일 내 출고’ 같은 안내는 주말·공휴일을 빼고 셉니다. ‘N영업일 후’ 모드로 예상 출고·도착일을 확인할 수 있습니다." },
    { h: "대체공휴일", p: "공휴일이 주말이나 다른 공휴일과 겹치면 다음 평일을 대체공휴일로 지정합니다. 이 계산기는 대체공휴일도 제외합니다." }
  ],
  faqs: [
    { q: "영업일과 평일은 어떻게 다른가요?", a: "평일은 월~금이고, 영업일은 평일에서 공휴일을 뺀 날입니다. 공휴일이 평일에 있으면 평일 수보다 영업일이 적어집니다." },
    { q: "어떤 공휴일을 제외하나요?", a: "법정공휴일·대체공휴일·임시공휴일을 모두 제외합니다. 토요일은 기본 제외이며, ‘토요일 근무’를 체크하면 영업일로 셉니다." },
    { q: "시작일을 포함하나요?", a: "기본은 제외입니다. ‘시작일 포함’을 체크하면 시작일이 영업일일 때 1일로 셉니다. 계약·배송 기준에 맞춰 선택하세요." },
    { q: "은행·관공서·택배 기준인가요?", a: "네. 대부분의 처리 기한이 영업일 기준입니다. 다만 기관마다 토요일 운영이 다르니 ‘토요일 근무’ 옵션으로 맞추세요." },
    { q: "회사 휴무일을 넣을 수 있나요?", a: "네. ‘추가 휴무일’에 날짜를 쉼표로 넣으면 창립기념일·하계휴가 등 회사 휴무를 제외해 계산합니다." },
    { q: "근무일과 영업일은 같은가요?", a: "대체로 같지만, 회사가 주 6일 근무면 토요일도 근무일입니다. 이 경우 ‘토요일 근무’를 체크하세요." },
    { q: "몇 년도까지 계산되나요?", a: "현재 2025~2027년 공휴일이 반영되어 있습니다. 이후 연도는 공휴일 데이터가 추가되는 대로 지원됩니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 관공서의 공휴일에 관한 규정", url: "https://www.law.go.kr/법령/관공서의공휴일에관한규정" },
    { name: "한국천문연구원 — 달력자료(월력요항)", url: "https://astro.kasi.re.kr" }
  ],
  appCategory: "UtilitiesApplication"
};
