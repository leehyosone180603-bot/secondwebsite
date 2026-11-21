/* N빵(더치페이) 계산기 — 페이지 스펙 */
module.exports = {
  id: "split-bill",
  title: "N빵 계산기 - 더치페이 1인당 금액·1000원 올림 정산 | 건강흐름",
  description: "총액과 인원으로 더치페이 1인당 금액을 계산합니다. 1000원 단위 올림 정산으로 남는 차액까지, 일부 인원이 더 내는 차등 분담도 지원합니다.",
  keywords: "N빵 계산기, 더치페이 계산기, 1인당 금액, 회식비 분배, 더치페이 정산, 금액 나누기",
  subtitle: "총액·인원으로 1인당 더치페이 금액",
  intro: '<p>총액과 인원을 넣으면 <strong>1인당 금액</strong>을 바로 계산합니다. 1000원 단위로 올려 깔끔하게 걷거나, 일부가 더 내는 차등 분담도 가능합니다.</p>',
  inputsHtml:
    '<div class="field"><label>분배 방식</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-mode="even" aria-pressed="true">균등 N빵</button>' +
    '<button type="button" class="btn-sm" data-mode="weighted">차등 분담</button></div></div>' +
    '<div class="field"><label for="total">총액</label>' +
    '<div class="input-unit"><input type="text" id="total" data-num data-share inputmode="numeric" placeholder="예: 100,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="people">인원</label>' +
    '<div class="input-unit"><input type="text" id="people" data-share inputmode="numeric" placeholder="예: 4"><span class="unit">명</span></div></div>' +

    '<div class="sb-panel" data-panel="even">' +
    '<div class="field"><label for="unit">걷는 단위 <span class="hint">(올림 정산)</span></label>' +
    '<select id="unit" data-share><option value="0">올림 없음(정확히)</option><option value="100">100원</option><option value="1000" selected>1,000원</option><option value="10000">10,000원</option></select></div></div>' +

    '<div class="sb-panel" data-panel="weighted" hidden>' +
    '<div class="field"><label for="extraCount">더 내는 인원</label>' +
    '<div class="input-unit"><input type="text" id="extraCount" data-share inputmode="numeric" placeholder="예: 1"><span class="unit">명</span></div></div>' +
    '<div class="field"><label for="extraEach">1인당 추가 부담액</label>' +
    '<div class="input-unit"><input type="text" id="extraEach" data-num data-share inputmode="numeric" placeholder="예: 20,000"><span class="unit">원</span></div></div></div>',
  resultHtml: '<div id="sbResult"></div>',
  method:
    '<p>더치페이 계산은 간단합니다.</p>' +
    '<ul><li><strong>균등 N빵</strong>: 1인당 = 총액 ÷ 인원</li>' +
    '<li><strong>올림 정산</strong>: 1인당을 1,000원 등으로 올려 걷으면 계산이 편합니다. 올림으로 남는 차액은 팁·봉사료로 쓰거나 한 명이 덜 냅니다.</li>' +
    '<li><strong>차등 분담</strong>: 더 내는 사람 x명이 각자 추가액 a를 더 내면, 일반 1인당 = (총액 − x×a) ÷ 인원, 더 내는 사람은 거기에 a를 더합니다.</li></ul>',
  learnMore: [
    { h: "올림 정산이 편한 이유", p: "1인당 33,333원처럼 딱 떨어지지 않으면 걷기 번거롭습니다. 34,000원으로 올려 걷으면 계산이 쉽고, 남는 돈은 팁이나 다음 모임 회비로 쓸 수 있습니다." },
    { h: "차등 분담 활용", p: "상사나 선배가 더 내는 자리, 술을 안 마신 사람이 덜 내는 경우 등에 씁니다. 더 내는 인원과 추가액만 넣으면 일반/추가 금액을 나눠 보여줍니다." },
    { h: "현장에서 바로 공유", p: "계산 결과 페이지 주소를 공유하면 일행이 각자 금액을 확인할 수 있습니다. 입력값이 주소에 담겨 그대로 열립니다." }
  ],
  faqs: [
    { q: "더치페이 1인당 얼마인지 어떻게 계산하나요?", a: "총액을 인원으로 나눕니다. 10만 원을 4명이 나누면 1인당 25,000원입니다. 딱 떨어지지 않으면 1,000원 단위로 올려 걷으면 편합니다." },
    { q: "올림하면 남는 돈은 어떻게 하나요?", a: "올림으로 걷은 총액이 실제 총액보다 많으면 차액이 남습니다. 팁·봉사료로 쓰거나 한 명이 그만큼 덜 내면 됩니다. 계산기가 남는 차액을 알려줍니다." },
    { q: "술 안 마신 사람은 덜 내게 할 수 있나요?", a: "‘차등 분담’을 쓰면 됩니다. 더 내는 사람 수와 추가액을 넣으면 일반/추가 부담 금액을 나눠 계산합니다. 반대로 적게 내는 사람 기준으로 조정할 수도 있습니다." },
    { q: "인원이 많아도 되나요?", a: "네. 인원 수에 제한 없이 1인당 금액을 계산합니다. 회식·동호회·여행 경비 정산에 활용하세요." }
  ],
  sources: [],
  appCategory: "UtilitiesApplication"
};
