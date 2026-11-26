/* 건강보험료 계산기(직장가입자) — 페이지 스펙 */
module.exports = {
  id: "health-insurance",
  title: "건강보험료 계산기 - 직장·지역가입자 건강·장기요양 보험료 | 건강흐름",
  description: "직장가입자는 보수월액으로, 지역가입자는 소득·재산 부과점수로 건강보험료와 장기요양보험료를 2026년 요율 기준 계산합니다.",
  keywords: "건강보험료 계산기, 직장가입자 건강보험료, 지역가입자 건강보험료, 장기요양보험료 계산, 건강보험료율 2026, 지역가입자 재산 보험료",
  subtitle: "직장·지역가입자 건강·장기요양 보험료 계산",
  intro: '<p>직장가입자는 <strong>보수월액</strong>으로, 지역가입자는 <strong>소득·재산 부과점수</strong>로 건강보험료와 장기요양보험료를 계산합니다(2026년 요율). 국민연금·고용·산재까지 함께 보려면 <a href="/4insure/">4대보험 계산기</a>, 실수령액은 <a href="/salary/">연봉 실수령액 계산기</a>를 이용하세요. 지역가입자 재산보험료는 재산세 과세표준과 관련되어, <a href="/property-tax/">재산세 계산기</a>로 과표를 먼저 확인하면 좋습니다.</p>',
  inputsHtml:
    '<div class="mode-tabs" style="display:flex;gap:8px;margin-bottom:12px">' +
    '<button type="button" class="mode-btn active" data-mode="employee">직장가입자</button>' +
    '<button type="button" class="mode-btn" data-mode="regional">지역가입자</button></div>' +
    '<div id="empFields">' +
    '<div class="field"><label for="pay">월 보수월액 <span class="hint">(비과세 제외한 과세 보수)</span></label>' +
    '<div class="input-unit"><input type="text" id="pay" data-num data-share inputmode="numeric" placeholder="예: 3,000,000"><span class="unit">원</span></div></div></div>' +
    '<div id="regFields" style="display:none">' +
    '<div class="field"><label for="annualIncome">연 소득 <span class="hint">(사업·근로·연금·금융·기타 연간 합계)</span></label>' +
    '<div class="input-unit"><input type="text" id="annualIncome" data-num data-share inputmode="numeric" placeholder="예: 24,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="propPoints">재산 부과점수 <span class="hint">(공단 고지서·「보험료 모의계산」에서 확인, 선택)</span></label>' +
    '<div class="input-unit"><input type="text" id="propPoints" data-num data-share inputmode="numeric" placeholder="예: 300"><span class="unit">점</span></div></div>' +
    '<p class="hint" style="margin:-4px 0 0">⚠️ 재산 과세표준→부과점수 환산표(공단 60등급)는 미반영이라 재산점수를 직접 입력받습니다. 자동차 부과는 2024.2월분부터 폐지되었습니다.</p></div>',
  resultHtml: '<div id="hiResult"></div>',
  method:
    '<p><strong>직장가입자</strong> 건강보험료는 다음과 같이 계산합니다.</p>' +
    '<ul><li><strong>건강보험료(총)</strong> = 보수월액 × 건강보험료율</li>' +
    '<li><strong>근로자·사업주</strong> 각각 50%씩 부담</li>' +
    '<li><strong>장기요양보험료(총)</strong> = 건강보험료(또는 보수월액 기준 요율) × 장기요양 요율, 역시 절반씩 부담</li></ul>' +
    '<table class="calc-table"><thead><tr><th>항목</th><th>2026년 요율</th><th>근로자</th></tr></thead><tbody>' +
    '<tr><td>건강보험료</td><td>7.19% (보수월액)</td><td>3.595%</td></tr>' +
    '<tr><td>장기요양보험료</td><td>0.9448% (보수월액)</td><td>0.4724%</td></tr></tbody></table>' +
    '<p>보수월액에는 상한과 하한이 있어, 매우 높거나 낮은 보수는 상·하한액으로 계산됩니다.</p>' +
    '<p><strong>지역가입자</strong>는 사업주 부담이 없어 본인이 전액 부담하며, 소득과 재산으로 매깁니다.</p>' +
    '<ul><li><strong>소득보험료</strong> = 소득월액(연소득÷12) × 7.19% (2024년부터 직장과 같은 정률)</li>' +
    '<li><strong>재산보험료</strong> = 재산 부과점수 × 점수당 금액(약 211.5원). 재산 과세표준 합계에서 1억원을 공제한 뒤 공단 재산등급표로 점수를 매깁니다. <strong>자동차 부과는 2024.2월분부터 폐지</strong>되었습니다.</li>' +
    '<li><strong>장기요양보험료</strong> = (소득+재산) 건강보험료 × 장기요양 요율</li>' +
    '<li>소득·재산이 아주 적어도 <strong>월 최저보험료(2026년 20,160원)</strong>는 부과됩니다.</li></ul>' +
    '<p class="footer-notice">⚠️ 재산 과세표준→부과점수 환산표(공단 60등급)는 복잡해 본 계산기는 재산 부과점수를 직접 입력받습니다. 점수당 금액·최저보험료는 공단 공식 기준으로 확인하세요.</p>',
  learnMore: [
    { h: "함께 쓰면 좋은 계산기", p: '<a href="/4insure/">4대보험 계산기</a>(국민연금·건강·장기요양·고용·산재) · <a href="/salary/">연봉 실수령액 계산기</a> · <a href="/freelancer/">프리랜서 3.3% 계산기</a>' },
    { h: "지역가입자 재산보험료와 재산세", p: '지역가입자 재산보험료는 재산세 과세표준을 기준으로 매겨, 공시가격이 오르면 보험료도 오를 수 있습니다. 내 재산세 과표가 궁금하면 <a href="/property-tax/">재산세 계산기</a>로 먼저 확인해 보세요. 자동차 부과는 2024.2월분부터 폐지됐습니다.' },
    { h: "건강보험료가 갑자기 올랐다면", p: '직장가입자는 전년 보수총액 정산으로 4월경 추가납부가 생기거나, 피부양자에서 지역가입자로 바뀌면 부담이 커질 수 있습니다. 자세한 원인은 <a href="/posts/health-insurance-sudden-increase-reasons.html">건강보험료가 갑자기 늘어난 이유 5가지</a>를, 올해 바뀐 요율·상한은 <a href="/posts/health-insurance-premium-increase-2026.html">2026 건강보험료 총정리</a>를 보세요.' },
    { h: "은퇴·피부양자라면 꼭 확인", p: '피부양자 탈락이 걱정된다면 <a href="/posts/dependent-disqualification-local-subscriber.html">피부양자 탈락 기준 2026</a>, 은퇴 후 보험료를 줄이려면 <a href="/posts/retirement-health-insurance-voluntary-continuation.html">임의계속 vs 지역가입자</a>를 참고하세요.' }
  ],
  faqs: [
    { q: "건강보험료는 누가 얼마나 내나요?", a: "직장가입자는 보수월액의 건강보험료율(2026년 7.19%)을 근로자와 사업주가 절반씩 부담합니다. 장기요양보험료도 같은 방식으로 나눠 냅니다." },
    { q: "장기요양보험료는 어떻게 계산되나요?", a: "건강보험료에 장기요양 요율을 적용해 산정하며, 근로자와 사업주가 각각 절반씩 부담합니다. 이 계산기는 보수월액 기준으로 함께 계산합니다." },
    { q: "지역가입자 건강보험료는 어떻게 계산되나요?", a: "지역가입자 탭에서 연 소득(소득월액=연소득÷12 × 7.19%)과 재산 부과점수(×약 211.5원)로 계산합니다. 자동차 부과는 2024.2월분부터 폐지됐습니다. 재산 과세표준→부과점수 환산표는 공단 고지서나 홈페이지 「보험료 모의계산」에서 확인해 점수를 입력하세요." },
    { q: "계산 결과가 실제 고지와 다른 이유는?", a: "비과세 항목, 보수월액 상·하한, 정산분, 원 단위 절사 방식 차이 등으로 달라질 수 있습니다. 정확한 금액은 국민건강보험공단으로 확인하세요." }
  ],
  sources: [
    { name: "국민건강보험공단 — 보험료 계산", url: "https://www.nhis.or.kr" },
    { name: "4대사회보험 정보연계센터", url: "https://www.4insure.or.kr" },
    { name: "국가법령정보센터 — 국민건강보험법", url: "https://www.law.go.kr/법령/국민건강보험법" }
  ],
  appCategory: "FinanceApplication"
};
