/* 예적금 이자 계산기 — 페이지 스펙 */
module.exports = {
  id: "savings",
  title: "예적금 이자 계산기 - 예금·적금 단리·복리 세후 수령액 | 건강흐름",
  description: "예금·적금의 단리·월복리 이자와 이자과세(15.4%)를 반영한 세후 수령액을 계산합니다. 월별 누적 원리금 표 제공, 비과세·세금우대 선택.",
  keywords: "예금 이자 계산기, 적금 계산기, 단리 복리, 세후 수령액, 이자소득세, 적금 이자",
  subtitle: "예금·적금의 단리·복리 이자와 세후 수령액",
  extraScripts: ["/js/lib/interest.js"],
  inputsHtml:
    '<div class="field"><label>상품</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-kind="deposit" aria-pressed="true">예금(목돈)</button>' +
    '<button type="button" class="btn-sm" data-kind="recurring">적금(월납입)</button></div></div>' +
    '<div class="field"><label for="amount"><span id="amountLabel">예치금액</span></label>' +
    '<div class="input-unit"><input type="text" id="amount" data-num data-share inputmode="numeric" placeholder="예: 10,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="months">기간 <span class="hint">(개월, 예: 6·12·24·36)</span></label>' +
    '<div class="input-unit"><input type="text" id="months" data-share inputmode="numeric" placeholder="예: 12"><span class="unit">개월</span></div></div>' +
    '<div class="field"><label for="rate">연 이자율</label>' +
    '<div class="input-unit"><input type="text" id="rate" data-share inputmode="decimal" placeholder="예: 3.5"><span class="unit">%</span></div></div>' +
    '<div class="field"><label for="method">이자 방식</label>' +
    '<select id="method" data-share><option value="simple">단리</option><option value="compound">월복리</option></select></div>' +
    '<div class="field"><label for="taxMode">과세 방식</label>' +
    '<select id="taxMode" data-share><option value="general">일반과세 (15.4%)</option><option value="none">비과세 (0%)</option><option value="preferential">세금우대 (9.5%)</option></select></div>',
  resultHtml: '<div id="svResult"></div>',
  method:
    '<p>예금과 적금은 이자가 붙는 방식이 다릅니다.</p>' +
    '<ul><li><strong>예금 단리</strong>: 이자 = 원금 × 연이율 × 기간/12</li>' +
    '<li><strong>예금 월복리</strong>: 원리금 = 원금 × (1 + 연이율/12)^개월</li>' +
    '<li><strong>적금 단리</strong>: 매월 납입액이 남은 개월만큼만 이자가 붙어, 이자 = 월납 × (연이율/12) × n(n+1)/2</li></ul>' +
    '<p>이자에는 <strong>이자소득세 15.4%</strong>(소득세 14% + 지방 1.4%)가 붙습니다. 비과세·세금우대를 고르면 세율이 달라집니다.</p>' +
    '<table class="calc-table"><thead><tr><th>과세</th><th>세율</th></tr></thead><tbody>' +
    '<tr><td>일반과세</td><td>15.4%</td></tr><tr><td>세금우대</td><td>9.5%</td></tr><tr><td>비과세</td><td>0%</td></tr></tbody></table>',
  learnMore: [
    { h: "적금 이자가 생각보다 적은 이유", p: "적금은 첫 달 낸 돈만 전체 기간 이자가 붙고, 마지막 달 낸 돈은 한 달치 이자만 붙습니다. 그래서 ‘연 3% 적금’의 실제 수익률은 예금의 절반 정도로 느껴집니다." },
    { h: "단리와 복리", p: "단리는 원금에만 이자가 붙고, 복리는 이자에 다시 이자가 붙습니다. 기간이 길수록 복리 효과가 커집니다. 대부분의 은행 적금은 단리입니다." },
    { h: "예금자보호 한도", p: "예금·적금은 1인당 금융회사별 원금과 이자를 합해 5천만원까지 예금자보호를 받습니다(예금보험공사). 한도를 넘는 금액은 여러 금융회사로 나누는 것이 안전합니다." }
  ],
  faqs: [
    { q: "세후 수령액은 어떻게 계산되나요?", a: "세전 이자에서 이자소득세(일반 15.4%)를 뺀 뒤 원금에 더한 금액입니다. 비과세·세금우대를 고르면 세금이 줄어듭니다." },
    { q: "적금인데 왜 이자가 예금보다 적나요?", a: "적금은 매월 조금씩 넣으므로 전체 돈이 은행에 머무는 기간이 예금보다 짧습니다. 그래서 같은 금리라도 이자가 절반 정도로 적습니다." },
    { q: "단리와 복리 중 뭐가 유리한가요?", a: "기간이 길수록 복리가 유리합니다. 다만 대부분의 적금은 단리이며, 복리 상품은 조건을 확인하세요." },
    { q: "세금우대·비과세는 아무나 되나요?", a: "비과세종합저축 등은 65세 이상·장애인 등 가입 요건이 있습니다. 세금우대종합저축은 과거 가입분만 해당하므로, 신규 가입 시 상품 조건을 확인하세요." },
    { q: "중도해지하면 어떻게 되나요?", a: "약정 금리 대신 낮은 중도해지 금리가 적용돼 이자가 크게 줄어듭니다. 만기를 채우는 것이 유리합니다." }
  ],
  sources: [
    { name: "은행연합회 소비자포털 — 예·적금 금리비교", url: "https://portal.kfb.or.kr" },
    { name: "국세청 — 이자소득세", url: "https://www.nts.go.kr" },
    { name: "예금보험공사 — 예금자보호", url: "https://www.kdic.or.kr" }
  ],
  appCategory: "FinanceApplication"
};
