/* 대출 이자 계산기 — 페이지 스펙 */
module.exports = {
  id: "loan",
  title: "대출 이자 계산기 - 원리금균등·원금균등·만기일시 월 상환액 | 건강흐름",
  description: "대출금액·금리·기간으로 월 상환액과 총 이자를 계산합니다. 원리금균등·원금균등·만기일시 상환 비교, 거치기간 반영, 월별 상환 스케줄 CSV 저장.",
  keywords: "대출 이자 계산기, 원리금균등, 원금균등, 만기일시, 대출 계산기, 상환 스케줄",
  subtitle: "상환방식별 월 납입액·총 이자와 스케줄",
  extraScripts: ["/js/lib/loan.js"],
  inputsHtml:
    '<div class="field"><label for="amount">대출금액</label>' +
    '<div class="input-unit"><input type="text" id="amount" data-num data-share inputmode="numeric" placeholder="예: 100,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="rate">연 이자율</label>' +
    '<div class="input-unit"><input type="text" id="rate" data-share inputmode="decimal" placeholder="예: 4.5"><span class="unit">%</span></div></div>' +
    '<div class="field"><label for="months">기간 <span class="hint">(개월, 예: 120·360)</span></label>' +
    '<div class="input-unit"><input type="text" id="months" data-share inputmode="numeric" placeholder="예: 360"><span class="unit">개월</span></div></div>' +
    '<div class="field"><label for="grace">거치기간 <span class="hint">(이자만 내는 기간, 없으면 0)</span></label>' +
    '<div class="input-unit"><input type="text" id="grace" data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">개월</span></div></div>' +
    '<div class="field"><label for="type">상환 방식</label>' +
    '<select id="type" data-share><option value="equalPayment">원리금균등</option><option value="equalPrincipal">원금균등</option><option value="bullet">만기일시</option></select></div>',
  resultHtml: '<div id="loanResult"></div>',
  method:
    '<p>상환 방식에 따라 월 납입액과 총 이자가 달라집니다.</p>' +
    '<table class="calc-table"><thead><tr><th>방식</th><th>월 납입</th><th>총 이자</th></tr></thead><tbody>' +
    '<tr><td>원리금균등</td><td>매월 같음</td><td>중간</td></tr>' +
    '<tr><td>원금균등</td><td>처음 많고 점점 감소</td><td>가장 적음</td></tr>' +
    '<tr><td>만기일시</td><td>매월 이자만, 만기에 원금</td><td>가장 많음</td></tr></tbody></table>' +
    '<ul><li><strong>원리금균등</strong>: 매월 원금+이자 합이 일정. 월 납입 = 대출금 × 월이율 × (1+월이율)^n ÷ ((1+월이율)^n − 1)</li>' +
    '<li><strong>원금균등</strong>: 매월 원금은 같고 이자는 잔액에 따라 줄어듭니다.</li>' +
    '<li><strong>만기일시</strong>: 매월 이자만 내고 원금은 만기에 한 번에 상환합니다.</li></ul>' +
    '<p>거치기간을 넣으면 그 기간 동안 이자만 내고, 이후 남은 기간에 원금을 상환합니다.</p>',
  learnMore: [
    { h: "상환 방식 고르기", p: "총 이자는 원금균등 < 원리금균등 < 만기일시 순으로 적습니다. 다만 원금균등은 초기 부담이 크고, 원리금균등은 매월 같은 금액이라 계획이 쉽습니다." },
    { h: "거치기간의 함정", p: "거치기간엔 원금이 줄지 않아 이자를 더 많이 냅니다. 당장 부담은 줄지만 총 이자는 늘어난다는 점을 고려하세요." },
    { h: "중도상환수수료", p: "약정 기간 전에 갚으면 중도상환수수료가 붙을 수 있습니다. 보통 3년이 지나면 면제되며, 여유 자금으로 원금을 미리 갚으면 총 이자를 줄일 수 있습니다." }
  ],
  faqs: [
    { q: "어떤 상환 방식이 유리한가요?", a: "총 이자만 보면 원금균등이 가장 적습니다. 다만 초기 상환액이 크므로, 매월 일정한 금액이 편하면 원리금균등을 택합니다." },
    { q: "거치기간을 두면 이자가 늘어나나요?", a: "네. 거치기간엔 원금이 줄지 않아 같은 이자를 계속 냅니다. 총 이자가 늘어나므로 꼭 필요할 때만 설정하세요." },
    { q: "만기일시 상환은 언제 쓰나요?", a: "전세자금대출처럼 만기에 보증금으로 한 번에 갚는 경우에 씁니다. 매월 이자만 내므로 월 부담은 가장 작지만 총 이자는 가장 큽니다." },
    { q: "중도상환수수료는 얼마인가요?", a: "대출 종류·경과기간에 따라 다르며 보통 잔액의 1% 안팎에서 시작해 시간이 지나면 줄어듭니다. 3년이 지나면 대부분 면제됩니다." },
    { q: "DSR이 무엇인가요?", a: "연소득 대비 모든 대출의 연간 원리금 상환액 비율입니다. DSR 계산기로 한도를 함께 확인하세요." },
    { q: "총 이자를 줄이려면?", a: "기간을 줄이거나 원금균등을 택하고, 여유가 생기면 중도상환으로 원금을 미리 갚는 것이 효과적입니다." }
  ],
  sources: [
    { name: "금융감독원 — 금융상품통합비교공시 '파인'", url: "https://fine.fss.or.kr" },
    { name: "은행연합회 소비자포털 — 대출금리", url: "https://portal.kfb.or.kr" },
    { name: "주택도시기금", url: "https://nhuf.molit.go.kr" }
  ],
  appCategory: "FinanceApplication"
};
