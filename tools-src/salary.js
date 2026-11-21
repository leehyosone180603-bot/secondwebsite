/* 연봉 실수령액 계산기 — 페이지 스펙 */
module.exports = {
  id: "salary",
  title: "연봉 실수령액 계산기 - 4대보험·소득세 공제 후 월 실수령 | 건강흐름",
  description: "연봉(또는 월급)에서 국민연금·건강·장기요양·고용보험과 소득세·지방소득세를 뺀 월 실수령액을 계산합니다. 2026년 요율 자동 적용, 부양가족·자녀 반영.",
  keywords: "연봉 실수령액, 월급 실수령액 계산기, 연봉계산기, 4대보험, 소득세, 실수령",
  subtitle: "4대보험·소득세 공제 후 월 실수령액",
  intro: '<p>연봉 또는 월급을 넣으면 4대보험과 소득세를 뺀 <strong>월 실수령액</strong>을 계산합니다. 요율은 적용 연도 기준 자동 반영됩니다.</p>',
  inputsHtml:
    '<div class="field"><label for="payType">급여 종류</label>' +
    '<select id="payType" data-share><option value="year">연봉</option><option value="month">월급</option></select></div>' +
    '<div class="field"><label for="payAmount"><span id="payLabel">연봉(세전)</span></label>' +
    '<div class="input-unit"><input type="text" id="payAmount" data-num data-share inputmode="numeric" placeholder="예: 40,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="nonTax">월 비과세 <span class="hint">(식대 등, 기본 20만원)</span></label>' +
    '<div class="input-unit"><input type="text" id="nonTax" data-num data-share inputmode="numeric" value="200,000" placeholder="200,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="family">부양가족 수 <span class="hint">(본인 포함)</span></label>' +
    '<div class="input-unit"><input type="text" id="family" data-share inputmode="numeric" value="1" placeholder="1"><span class="unit">명</span></div></div>' +
    '<div class="field"><label for="children">자녀 세액공제 대상 <span class="hint">(연말정산 기준 연령)</span></label>' +
    '<div class="input-unit"><input type="text" id="children" data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">명</span></div></div>',
  resultHtml: '<div id="salResult"></div>',
  method:
    '<p>월 실수령액 = 월 세전급여 − 4대보험(근로자) − 소득세 − 지방소득세.</p>' +
    '<table class="calc-table"><thead><tr><th>공제</th><th>기준</th></tr></thead><tbody>' +
    '<tr><td>국민연금</td><td>기준소득월액 × 4.75%(상·하한 적용)</td></tr>' +
    '<tr><td>건강보험</td><td>보수월액 × 3.595%</td></tr>' +
    '<tr><td>장기요양</td><td>보수월액 × 0.9448% ÷ 2</td></tr>' +
    '<tr><td>고용보험</td><td>보수월액 × 0.9%</td></tr>' +
    '<tr><td>소득세</td><td>근로소득공제·인적공제·보험료공제 후 과세표준 × 기본세율 − 근로소득세액공제 − 자녀세액공제</td></tr>' +
    '<tr><td>지방소득세</td><td>소득세 × 10%</td></tr></tbody></table>' +
    '<p>소득세는 <strong>연말정산 기준(1년 실제 세금)</strong>으로 계산합니다. 매월 급여에서 떼는 원천징수(간이세액표)는 이보다 많거나 적을 수 있고, 다음 해 2월 연말정산에서 정산됩니다.</p>',
  learnMore: [
    { h: "실수령액이 왜 연봉보다 훨씬 적나요?", p: "4대보험(근로자 부담 약 9.4%)과 소득세·지방소득세가 빠지기 때문입니다. 연봉이 높을수록 소득세율(누진)이 올라가 공제 비율도 커집니다." },
    { h: "비과세 급여의 효과", p: "식대(월 20만원 한도) 등 비과세는 4대보험·소득세 부과 기준에서 빠져 실수령액을 늘립니다. 같은 연봉이라도 비과세가 크면 세 부담이 줄어듭니다." },
    { h: "원천징수와 연말정산의 차이", p: "매달 떼는 세금은 간이세액표(원천징수)로 대략 떼고, 다음 해 2월 연말정산에서 실제 세금과 비교해 더 내거나 돌려받습니다. 이 계산기는 ‘실제 세금(연말정산 기준)’으로 보여 줍니다." }
  ],
  faqs: [
    { q: "실수령액은 어떻게 계산하나요?", a: "세전 급여에서 국민연금·건강·장기요양·고용보험(근로자분)과 소득세·지방소득세를 뺀 금액입니다. 산재보험은 사업주만 부담하므로 공제되지 않습니다." },
    { q: "소득세가 매달 명세서와 다른데요?", a: "급여명세서의 소득세는 간이세액표(원천징수)로 미리 떼는 금액이고, 이 계산기는 연말정산 기준 실제 세금을 12로 나눈 추정치입니다. 둘은 연말정산에서 정산됩니다." },
    { q: "비과세는 얼마까지 넣나요?", a: "식대는 월 20만원까지 비과세입니다. 자가운전보조금(월 20만원), 출산·보육수당 등도 요건을 충족하면 비과세이며, 회사 급여 규정에 따릅니다." },
    { q: "부양가족 수는 어떻게 세나요?", a: "본인을 포함해 소득요건을 충족하는 배우자·부모·자녀 등 기본공제 대상자 수입니다. 1명당 연 150만원이 소득공제됩니다." },
    { q: "자녀 세액공제는 몇 세부터인가요?", a: "연말정산 기준은 2026년 귀속분부터 9세 이상이며 매년 한 살씩 올라 2030년부터 13세 이상입니다. 1명 25만원, 2명 55만원, 3명 이상은 추가 1명당 40만원입니다." },
    { q: "상여금이 있으면 어떻게 되나요?", a: "연간 상여를 포함한 총급여로 연봉에 넣으면 연 기준 실수령을 볼 수 있습니다. 상여가 지급되는 달은 그 달 원천징수가 더 많이 떼일 수 있습니다." },
    { q: "퇴직금은 실수령에 포함되나요?", a: "퇴직금은 급여와 별도이며 퇴직 시 지급됩니다. ‘연봉에 퇴직금 포함’ 조건이면 실제 월급은 연봉÷13 등으로 줄어들 수 있으니 계약을 확인하세요." },
    { q: "맞벌이·추가 공제가 있으면요?", a: "이 계산기는 부양가족·자녀 외의 공제(의료비·교육비·연금저축·월세 등)는 반영하지 않습니다. 실제 세금은 연말정산에서 더 줄어들 수 있습니다." }
  ],
  sources: [
    { name: "국세청 — 근로소득·연말정산", url: "https://www.nts.go.kr" },
    { name: "국가법령정보센터 — 소득세법 제47·50·55·59조", url: "https://www.law.go.kr/법령/소득세법/제47조" },
    { name: "4대사회보험 정보연계센터", url: "https://www.4insure.or.kr" }
  ],
  appCategory: "FinanceApplication"
};
