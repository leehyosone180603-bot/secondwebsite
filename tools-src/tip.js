/* 팁 계산기 — 페이지 스펙 */
module.exports = {
  id: "tip",
  title: "팁 계산기 - 팁 금액·총액·1인당 부담 계산 | 건강흐름",
  description: "음식값과 팁 비율, 인원을 넣으면 팁 금액과 총액, 1인당 부담액을 계산합니다. 해외여행·레스토랑 팁 계산에 편리합니다.",
  keywords: "팁 계산기, 팁 계산, 15% 팁, 해외 팁, 레스토랑 팁, 팁 1인당",
  subtitle: "팁 금액·총액·1인당 부담 계산",
  intro: '<p>금액과 팁 비율을 넣으면 <strong>팁 금액</strong>과 <strong>총액</strong>을 계산합니다. 인원을 넣으면 1인당 부담까지 나눠 줍니다.</p>',
  inputsHtml:
    '<div class="field"><label for="amount">금액 <span class="hint">(음식값·서비스 금액)</span></label>' +
    '<div class="input-unit"><input type="text" id="amount" data-num data-share inputmode="numeric" placeholder="예: 50,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="pct">팁 비율</label>' +
    '<div class="input-unit"><input type="text" id="pct" data-share inputmode="decimal" value="15" placeholder="예: 15"><span class="unit">%</span></div></div>' +
    '<div class="field"><label for="people">인원 <span class="hint">(나눠 낼 때)</span></label>' +
    '<div class="input-unit"><input type="text" id="people" data-share inputmode="numeric" value="1" placeholder="1"><span class="unit">명</span></div></div>',
  resultHtml: '<div id="tipResult"></div>',
  method:
    '<p>팁 계산은 간단합니다.</p>' +
    '<ul><li><strong>팁</strong> = 금액 × 팁 비율 ÷ 100</li>' +
    '<li><strong>총액</strong> = 금액 + 팁</li>' +
    '<li><strong>1인당</strong> = 총액 ÷ 인원</li></ul>' +
    '<p>미국 등에서는 보통 15~20%의 팁을 냅니다. 점심은 10~15%, 저녁·고급 레스토랑은 18~20%가 일반적입니다.</p>',
  learnMore: [
    { h: "나라별 팁 문화", p: "미국·캐나다는 15~20% 팁이 관례입니다. 유럽은 5~10% 또는 반올림, 일본·한국은 대개 팁이 없습니다. 여행 전 현지 관습을 확인하세요." },
    { h: "세전 vs 세후", p: "팁은 보통 세전 금액 기준으로 계산하지만, 편의상 세후(최종 결제액) 기준으로 내기도 합니다. 이 계산기는 입력한 금액 기준으로 계산합니다." },
    { h: "단체 자동 팁", p: "미국 레스토랑은 6인 이상 단체에 18% 안팎의 팁(gratuity)을 자동 부과하기도 합니다. 영수증에 이미 포함됐는지 확인하세요." }
  ],
  faqs: [
    { q: "팁은 보통 몇 % 내나요?", a: "미국 기준 점심 10~15%, 저녁 15~20%가 일반적입니다. 서비스가 특히 좋으면 20% 이상 내기도 합니다." },
    { q: "팁을 여러 명이 나눠 내려면?", a: "인원을 입력하면 총액(음식값+팁)을 인원수로 나눠 1인당 부담액을 보여줍니다. 1인당 팁도 따로 표시됩니다." },
    { q: "한국에서도 팁을 내나요?", a: "일반적으로 내지 않습니다. 대부분 봉사료가 가격에 포함돼 있습니다. 해외여행이나 외국계 고급 레스토랑에서 주로 필요합니다." }
  ],
  sources: [],
  appCategory: "UtilitiesApplication"
};
