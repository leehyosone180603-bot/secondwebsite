/* 4대보험 계산기 — 페이지 스펙 */
module.exports = {
  id: "4insure",
  title: "4대보험 계산기 - 국민연금·건강·장기요양·고용·산재 월 보험료 | 건강흐름",
  description: "월 보수액을 넣으면 국민연금·건강보험·장기요양·고용보험·산재보험을 근로자/사업주/합계로 계산합니다. 2026년 요율·기준소득월액 상하한 자동 적용.",
  keywords: "4대보험 계산기, 국민연금, 건강보험, 장기요양, 고용보험, 산재보험, 보험료율",
  subtitle: "월 보수로 보험료를 근로자·사업주로 나눠 계산",
  intro: '<p>요율과 국민연금 기준소득월액 상·하한은 <strong>적용 연도 기준으로 자동</strong> 반영됩니다(아래 계산 방법 표 참고).</p>',
  inputsHtml:
    '<div class="field"><label for="pay">월 보수액 <span class="hint">(세전, 과세 기준)</span></label>' +
    '<div class="input-unit"><input type="text" id="pay" data-num data-share inputmode="numeric" placeholder="예: 3,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="nontax">비과세 급여 <span class="hint">(식대·자가운전보조금 등, 보험료 부과 제외)</span></label>' +
    '<div class="input-unit"><input type="text" id="nontax" data-num data-share inputmode="numeric" placeholder="예: 200,000 (식대)"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="size">기업 규모 <span class="hint">(고용안정·직업능력개발 사업주 요율)</span></label>' +
    '<select id="size" data-share>' +
    '<option value="0.25">150인 미만 기업</option>' +
    '<option value="0.45">150인 이상(우선지원대상기업)</option>' +
    '<option value="0.65">150인 이상 1,000인 미만</option>' +
    '<option value="0.85">1,000인 이상·국가·지자체</option></select></div>' +
    '<div class="field"><label for="injury">산재보험료율 <span class="hint">(업종별, 기본=전업종 평균)</span></label>' +
    '<div class="input-unit"><input type="text" id="injury" data-share inputmode="decimal" placeholder="예: 1.47"><span class="unit">%</span></div></div>',
  resultHtml: '<div id="insResult"></div>',
  method:
    '<p>각 보험료 = 기준 보수 × 요율이며, 근로자와 사업주가 나눠 부담합니다(산재는 전액 사업주).</p>' +
    '<table class="calc-table"><thead><tr><th>항목</th><th>근로자</th><th>사업주</th><th>비고</th></tr></thead><tbody>' +
    '<tr><td>국민연금</td><td>4.75%</td><td>4.75%</td><td>기준소득월액 상·하한 적용</td></tr>' +
    '<tr><td>건강보험</td><td>3.595%</td><td>3.595%</td><td>보수월액 기준</td></tr>' +
    '<tr><td>장기요양</td><td colspan="2">보수월액 × 0.9448% (근로자·사업주 각 50%)</td><td>건강보험료 대비 약 13.14%</td></tr>' +
    '<tr><td>고용보험(실업급여)</td><td>0.9%</td><td>0.9%</td><td>+ 사업주 고용안정분(규모별 0.25~0.85%)</td></tr>' +
    '<tr><td>산재보험</td><td>0%</td><td>업종별</td><td>전액 사업주, 전업종 평균 약 1.47%</td></tr>' +
    '</tbody></table>' +
    '<p>※ 2026년 기준. 국민연금은 연금개혁으로 9.5%(각 4.75%)로 올랐고, 장기요양 요율은 ‘보수월액 대비’ 표기입니다.</p>',
  learnMore: [
    { h: "장기요양보험료 계산 방식", p: "공식 요율은 보수월액의 0.9448%입니다. 건강보험료를 기준으로 보면 ‘건강보험료 × (0.9448 ÷ 7.19) ≈ 13.14%’로도 계산됩니다. 근로자와 사업주가 절반씩 냅니다." },
    { h: "비과세 급여는 왜 빼나요?", p: "식대(월 20만원 한도)·자가운전보조금 등 비과세 항목은 보험료 부과 기준(보수)에서 제외됩니다. 그래서 같은 연봉이라도 비과세가 크면 보험료가 줄어듭니다." },
    { h: "기준소득월액 상·하한", p: "국민연금은 소득이 아무리 높거나 낮아도 상한·하한 안에서만 보험료를 매깁니다. 상·하한은 매년 7월에 바뀝니다." }
  ],
  faqs: [
    { q: "아르바이트도 4대보험에 가입하나요?", a: "월 60시간(주 15시간) 이상 근무 등 요건을 충족하면 가입 대상입니다. 초단시간 근로는 산재만 적용되는 경우가 많습니다." },
    { q: "프리랜서(3.3%)와 어떻게 다른가요?", a: "근로자는 4대보험을 회사와 나눠 내고, 프리랜서는 사업소득 3.3% 원천징수 후 지역가입자로 국민연금·건강보험을 냅니다. 부담 구조가 다릅니다." },
    { q: "보험료 부과 기준액은 무엇인가요?", a: "국민연금은 기준소득월액, 건강·고용·산재는 보수월액(과세 급여)입니다. 비과세를 뺀 금액을 기준으로 합니다." },
    { q: "회사 부담분은 얼마인가요?", a: "국민연금·건강·장기요양·고용(실업급여)은 근로자와 거의 같은 비율을 사업주도 부담하고, 고용안정분과 산재는 사업주만 부담합니다. 결과표의 ‘사업주’ 열을 보세요." },
    { q: "두루누리 지원은 무엇인가요?", a: "소규모 사업장의 저임금 근로자에게 국민연금·고용보험료 일부를 국가가 지원하는 제도입니다. 요건에 맞으면 실제 부담이 줄어듭니다." },
    { q: "업종별 산재 요율은 어디서 확인하나요?", a: "근로복지공단에서 매년 고시하는 ‘사업종류별 산재보험료율’에서 확인합니다. 이 계산기는 기본값으로 전업종 평균을 사용하며 직접 입력할 수 있습니다." }
  ],
  sources: [
    { name: "4대사회보험 정보연계센터", url: "https://www.4insure.or.kr" },
    { name: "국민연금공단", url: "https://www.nps.or.kr" },
    { name: "근로복지공단 — 산재보험료율", url: "https://www.comwel.or.kr" }
  ],
  appCategory: "FinanceApplication"
};
