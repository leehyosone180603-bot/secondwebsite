/* 세계 시차 계산기 — 페이지 스펙 */
module.exports = {
  id: "world-time",
  title: "세계 시차 계산기 - 도시별 현재 시각·시차 변환 | 건강흐름",
  description: "서울·뉴욕·런던·도쿄 등 주요 도시의 현재 시각과 시차를 확인하고, 특정 시각을 다른 도시 시각으로 변환합니다. 서머타임(DST) 자동 반영.",
  keywords: "세계 시차 계산기, 뉴욕 시간, 런던 시차, 시차 변환, 해외 시간, 서머타임 시간",
  subtitle: "도시별 현재 시각과 시차, 시각 변환",
  intro: '<p>두 도시를 고르면 <strong>현재 시각과 시차</strong>를 바로 보여줍니다. 기준 시각을 입력하면 상대 도시의 시각으로 변환합니다. 서머타임은 자동 반영됩니다.</p>',
  inputsHtml:
    '<div class="field"><label for="fromCity">기준 도시</label><select id="fromCity" data-share></select></div>' +
    '<div class="field" style="text-align:center;margin:-2px 0"><button type="button" class="btn-sm" id="swapBtn">⇅ 도시 교환</button></div>' +
    '<div class="field"><label for="toCity">비교 도시</label><select id="toCity" data-share></select></div>' +
    '<div class="field"><label for="baseTime">기준 시각 <span class="hint">(비우면 현재 시각, 기준 도시 기준)</span></label>' +
    '<input type="datetime-local" id="baseTime" data-share></div>',
  resultHtml: '<div id="wtResult"></div>',
  method:
    '<p>각 도시의 표준시(UTC 오프셋)를 비교해 시각과 시차를 계산합니다.</p>' +
    '<ul><li><strong>현재 시각 모드</strong>: 기준 시각을 비우면 두 도시의 지금 시각과 시차를 보여줍니다.</li>' +
    '<li><strong>변환 모드</strong>: 기준 시각을 입력하면 그 시각(기준 도시 기준)을 비교 도시 시각으로 바꿉니다.</li>' +
    '<li>서머타임(DST)을 쓰는 도시는 날짜에 따라 시차가 1시간 달라지며, 브라우저 표준시 데이터로 자동 반영됩니다.</li></ul>' +
    '<p>예로 한국은 서머타임이 없지만 미국·유럽은 봄~가을에 1시간 앞당겨, 같은 두 도시라도 계절에 따라 시차가 바뀝니다.</p>',
  learnMore: [
    { h: "서머타임(일광절약시간)", p: "미국·유럽·호주 등은 여름철에 시계를 1시간 앞당깁니다. 그래서 한국과의 시차가 겨울과 여름에 1시간 달라집니다. 이 계산기는 입력한 날짜의 서머타임을 반영합니다." },
    { h: "한국은 UTC+9", p: "한국 표준시는 UTC보다 9시간 빠르고 서머타임이 없습니다. 일본과는 시차가 없고, 중국과는 1시간 차이가 납니다." },
    { h: "회의·통화 시간 잡기", p: "해외와 약속을 잡을 때 ‘기준 시각’에 한국 시간을 넣으면 상대 도시의 시각을 바로 확인할 수 있어 편리합니다." }
  ],
  faqs: [
    { q: "한국과 뉴욕의 시차는 몇 시간인가요?", a: "보통 14시간(겨울)이며, 미국 서머타임 기간(봄~가을)에는 13시간입니다. 날짜를 넣으면 그 시점의 정확한 시차를 보여줍니다." },
    { q: "서머타임도 반영되나요?", a: "네. 브라우저의 표준시 데이터를 사용해 입력한 날짜의 서머타임을 자동 반영합니다. 계절에 따라 달라지는 시차도 정확히 계산됩니다." },
    { q: "특정 시각을 변환하려면?", a: "‘기준 시각’에 날짜·시간을 입력하면 그 시각(기준 도시 기준)을 비교 도시의 시각으로 변환합니다. 비우면 현재 시각으로 계산합니다." },
    { q: "한국과 일본은 시차가 있나요?", a: "없습니다. 둘 다 UTC+9로 시각이 같습니다. 일본은 서머타임을 쓰지 않습니다." }
  ],
  sources: [],
  appCategory: "UtilitiesApplication"
};
