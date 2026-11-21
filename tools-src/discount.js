/* 할인가 계산기 — 페이지 스펙 */
module.exports = {
  id: "discount",
  title: "할인가 계산기 - 정가·할인율로 할인가/할인율 역산 | 건강흐름",
  description: "정가와 할인율로 할인가와 할인액을 계산하거나, 정가와 판매가로 할인율을 역산합니다. 중복(연속) 할인의 실질 할인율도 계산.",
  keywords: "할인가 계산기, 할인율 계산, 세일 가격 계산, 중복 할인, 정가 할인 계산, 몇 퍼센트 할인",
  subtitle: "할인가 구하기와 할인율 역산, 중복 할인까지",
  intro: '<p>정가와 할인율로 <strong>할인가</strong>를 구하거나, 정가와 판매가로 <strong>할인율</strong>을 거꾸로 계산합니다. 쿠폰 중복 할인도 지원합니다.</p>',
  inputsHtml:
    '<div class="field"><label>계산 방식</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-mode="byRate" aria-pressed="true">할인율 → 할인가</button>' +
    '<button type="button" class="btn-sm" data-mode="byPrice">판매가 → 할인율</button></div></div>' +
    '<div class="field"><label for="list">정가</label>' +
    '<div class="input-unit"><input type="text" id="list" data-num data-share inputmode="numeric" placeholder="예: 50,000"><span class="unit">원</span></div></div>' +

    '<div class="dc-panel" data-panel="byRate">' +
    '<div class="field"><label for="rate1">할인율</label>' +
    '<div class="input-unit"><input type="text" id="rate1" data-share inputmode="decimal" placeholder="예: 30"><span class="unit">%</span></div></div>' +
    '<div class="field"><label for="rate2">추가 할인율 <span class="hint">(중복 쿠폰, 없으면 비움)</span></label>' +
    '<div class="input-unit"><input type="text" id="rate2" data-share inputmode="decimal" placeholder="예: 10"><span class="unit">%</span></div></div></div>' +

    '<div class="dc-panel" data-panel="byPrice" hidden>' +
    '<div class="field"><label for="sale">판매가 <span class="hint">(할인된 가격)</span></label>' +
    '<div class="input-unit"><input type="text" id="sale" data-num data-share inputmode="numeric" placeholder="예: 35,000"><span class="unit">원</span></div></div></div>',
  resultHtml: '<div id="dcResult"></div>',
  method:
    '<p>할인 계산은 간단한 비율 계산입니다.</p>' +
    '<ul><li><strong>할인가</strong> = 정가 × (1 − 할인율÷100)</li>' +
    '<li><strong>할인액</strong> = 정가 − 할인가</li>' +
    '<li><strong>할인율</strong> = (정가 − 판매가) ÷ 정가 × 100</li>' +
    '<li><strong>중복 할인</strong> = 정가 × (1 − 1차÷100) × (1 − 2차÷100) — 더하는 게 아니라 차례로 적용</li></ul>' +
    '<p>예로 30% 할인 후 추가 10% 할인은 40% 할인이 아니라, 실질 37% 할인입니다(0.7×0.9=0.63).</p>',
  learnMore: [
    { h: "중복 할인은 왜 40%가 아닌가요", p: "첫 할인으로 줄어든 금액에 두 번째 할인을 적용하기 때문입니다. 30%+10%는 0.7×0.9=0.63, 즉 37% 할인이 됩니다. 할인율은 단순히 더해지지 않습니다." },
    { h: "할인율 역산 활용", p: "정가 5만 원짜리를 3만 5천 원에 판다면 할인율은 (50000−35000)/50000=30%입니다. 세일 폭을 비교할 때 유용합니다." },
    { h: "부가세와 할인", p: "표시가격이 부가세 포함이면 할인 후 금액도 부가세가 포함된 값입니다. 공급가액 기준이 필요하면 부가세 계산기와 함께 사용하세요." }
  ],
  faqs: [
    { q: "할인가는 어떻게 계산하나요?", a: "정가 × (1 − 할인율/100)입니다. 5만 원의 30% 할인은 50000×0.7=35,000원입니다." },
    { q: "할인율은 어떻게 구하나요?", a: "(정가 − 판매가) ÷ 정가 × 100입니다. 5만 원을 3만 5천 원에 사면 (50000−35000)/50000=30% 할인입니다." },
    { q: "30% 할인에 10% 쿠폰을 더 쓰면 40% 할인인가요?", a: "아닙니다. 차례로 적용되어 0.7×0.9=0.63, 즉 37% 할인입니다. ‘추가 할인율’에 10을 넣으면 실질 할인율을 보여줍니다." },
    { q: "할인액만 빠르게 보려면?", a: "‘할인율 → 할인가’ 모드에서 정가와 할인율을 넣으면 할인가와 함께 할인액(정가−할인가)이 표로 표시됩니다." }
  ],
  sources: [],
  appCategory: "BusinessApplication"
};
