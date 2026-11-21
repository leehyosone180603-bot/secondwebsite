/* 날짜 계산기 (D-Day) — 페이지 스펙 */
module.exports = {
  id: "dday",
  title: "날짜 계산기 - D-Day·두 날짜 사이 기간·날짜 더하기·기념일 | 건강흐름",
  description: "오늘부터 목표일까지 D-Day, 두 날짜 사이 일수·개월, 기준일에 N일·개월·년 더하기, 사귄 날 기준 100일·1주년 기념일을 계산합니다.",
  keywords: "날짜 계산기, D-Day 계산기, 디데이, 날짜 더하기, 두 날짜 사이, 100일 계산, 기념일",
  subtitle: "D-Day · 기간 · 날짜 더하기 · 기념일을 한 번에",
  inputsHtml:
    '<div class="field"><label>무엇을 계산할까요?</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-tab="dday" aria-pressed="true">D-Day</button>' +
    '<button type="button" class="btn-sm" data-tab="between">기간</button>' +
    '<button type="button" class="btn-sm" data-tab="addsub">날짜 ±</button>' +
    '<button type="button" class="btn-sm" data-tab="anniv">기념일</button></div></div>' +

    '<div class="dd-panel" data-panel="dday">' +
    '<div class="field"><label for="ddayTarget">목표일</label><input type="date" id="ddayTarget" data-share></div>' +
    '<div class="field"><label><input type="checkbox" id="ddayIncl" data-share> 당일을 1일째로 세기</label></div></div>' +

    '<div class="dd-panel" data-panel="between" hidden>' +
    '<div class="field"><label for="btStart">시작일</label><input type="date" id="btStart" data-share></div>' +
    '<div class="field"><label for="btEnd">종료일</label><input type="date" id="btEnd" data-share></div>' +
    '<div class="field"><label><input type="checkbox" id="btIncl" data-share> 시작일 포함(당일 1일)</label></div></div>' +

    '<div class="dd-panel" data-panel="addsub" hidden>' +
    '<div class="field"><label for="asBase">기준일</label><input type="date" id="asBase" data-share></div>' +
    '<div class="field"><label for="asN">더하거나 뺄 수</label><div class="input-unit"><input type="text" id="asN" data-share inputmode="numeric" placeholder="예: 100"></div></div>' +
    '<div class="field"><label for="asUnit">단위 / 방향</label><div class="result-actions" style="margin-top:0">' +
    '<select id="asUnit" data-share><option value="day">일</option><option value="week">주</option><option value="month">개월</option><option value="year">년</option></select>' +
    '<select id="asDir" data-share><option value="plus">후(+)</option><option value="minus">전(−)</option></select></div></div></div>' +

    '<div class="dd-panel" data-panel="anniv" hidden>' +
    '<div class="field"><label for="avStart">시작일 <span class="hint">(사귄 날·출생일 등)</span></label><input type="date" id="avStart" data-share></div></div>',
  resultHtml: '<div id="ddResult"></div>',
  method:
    '<p>날짜 계산은 ‘당일을 세는지’에 따라 하루 차이가 납니다.</p>' +
    '<ul><li><strong>당일 제외</strong>: 종료일 − 시작일 (두 날짜의 차이). 일반적인 D-Day·기간 계산.</li>' +
    '<li><strong>당일 포함</strong>: 차이 + 1. ‘사귄 지 100일’처럼 시작일을 1일째로 셀 때.</li></ul>' +
    '<p>개월·년을 더할 때 그 달에 같은 날짜가 없으면(예: 1월 31일 + 1개월) 그 달 <strong>말일로 보정</strong>합니다. 민법상 기간 계산도 이 방식을 따릅니다(민법 제155~161조).</p>',
  learnMore: [
    { h: "D-Day의 뜻", p: "D-Day는 기준이 되는 ‘그 날’이고, D-3은 3일 전, D+3은 3일 후입니다. 군사 용어에서 유래했으며 시험·기념일 카운트다운에 널리 쓰입니다." },
    { h: "100일은 어떻게 세나요", p: "보통 사귄 첫날을 1일째로 봅니다. 따라서 100일은 시작일 + 99일입니다. 이 계산기의 ‘기념일’ 탭이 이 방식으로 100·200·1000일과 주년을 계산합니다." },
    { h: "초일 산입", p: "법에서는 기간의 첫날을 넣지 않는 것(초일 불산입)이 원칙이지만, 나이·기념일 등은 첫날을 넣어 셉니다. 계약·소멸시효 등은 민법 규정을 따릅니다." }
  ],
  faqs: [
    { q: "당일을 포함하나요, 제외하나요?", a: "기본은 두 날짜의 차이(당일 제외)입니다. ‘당일 포함’을 체크하면 시작일을 1일째로 세어 하루를 더합니다. 100일 계산은 당일 포함 방식입니다." },
    { q: "100일은 어떻게 계산되나요?", a: "시작일을 1일째로 보아 시작일 + 99일이 100일입니다. ‘기념일’ 탭에서 자동으로 계산됩니다." },
    { q: "D-0과 D+1은 무슨 뜻인가요?", a: "D-0(D-DAY)은 바로 그 날, D+1은 그 날의 하루 뒤입니다. D-1은 하루 전입니다." },
    { q: "1월 31일에 1개월을 더하면요?", a: "2월에는 31일이 없으므로 그 달 말일(28일 또는 29일)로 보정합니다. 결과 아래에 보정되었다는 안내가 표시됩니다." },
    { q: "계약 기간의 첫날도 포함하나요?", a: "민법상 기간은 초일을 넣지 않는 것이 원칙(초일 불산입)이나, 오전 0시부터 시작하거나 나이 계산 등 예외가 있습니다. 중요한 계약은 조문을 확인하세요." }
  ],
  sources: [
    { name: "국가법령정보센터 — 민법 제155~161조(기간)", url: "https://www.law.go.kr/법령/민법/제155조" }
  ],
  appCategory: "UtilitiesApplication"
};
