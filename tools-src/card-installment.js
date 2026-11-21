/* 카드 할부 수수료 계산기 — 페이지 스펙 */
module.exports = {
  id: "card-installment",
  title: "카드 할부 수수료 계산기 - 매달 결제액·총수수료(체감식) | 건강흐름",
  description: "할부원금·할부개월·수수료율(연%)로 매달 결제액과 총 할부수수료를 계산합니다. 무이자 할부 지원, 체감식(잔액 기준) 회차별 내역과 CSV 저장.",
  keywords: "카드 할부 수수료 계산기, 할부 이자, 무이자 할부, 할부 수수료율, 카드 할부 계산, 체감식 할부",
  subtitle: "할부원금·개월·수수료율로 매달 낼 돈과 총수수료",
  extraScripts: ["/js/lib/loan.js"],
  intro: '<p>카드 할부는 매달 <strong>남은 할부잔액</strong>에 수수료율(연%)을 매기는 체감식입니다. 할부원금은 개월 수로 균등 분할되고, 수수료는 초반이 크고 점점 줄어듭니다.</p>',
  inputsHtml:
    '<div class="field"><label for="amount">할부원금 <span class="hint">(결제 금액)</span></label>' +
    '<div class="input-unit"><input type="text" id="amount" data-num data-share inputmode="numeric" placeholder="예: 1,200,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="months">할부개월</label>' +
    '<div class="input-unit"><input type="text" id="months" data-share inputmode="numeric" placeholder="예: 12"><span class="unit">개월</span></div></div>' +
    '<div class="field"><label><input type="checkbox" id="freeInterest" data-share> 무이자 할부</label></div>' +
    '<div class="field" id="rateRow"><label for="rate">할부 수수료율 <span class="hint">(연 %, 카드 명세서·약관 참고)</span></label>' +
    '<div class="input-unit"><input type="text" id="rate" data-share inputmode="decimal" placeholder="예: 15.9"><span class="unit">%</span></div></div>',
  resultHtml: '<div id="ciResult"></div>',
  method:
    '<p>국내 카드사의 할부수수료는 대부분 <strong>체감식(잔액 슬라이딩)</strong>으로 계산합니다.</p>' +
    '<ul><li><strong>월 할부원금</strong> = 할부원금 ÷ 할부개월 (균등 분할)</li>' +
    '<li><strong>회차별 수수료</strong> = 남은 할부잔액 × (연 수수료율 ÷ 12)</li>' +
    '<li><strong>회차별 결제액</strong> = 월 할부원금 + 그 달 수수료</li></ul>' +
    '<p>첫 회차는 잔액이 가장 많아 수수료가 가장 크고, 매달 원금이 빠지면서 수수료도 줄어듭니다. 무이자 할부는 수수료율 0%와 같아 결제액이 할부원금과 동일합니다.</p>' +
    '<p>실제 수수료율은 카드사·회원등급·할부개월에 따라 보통 연 7~19.9% 범위에서 다릅니다. 정확한 값은 본인 카드의 명세서나 약관에서 확인하세요.</p>',
  learnMore: [
    { h: "무이자 할부 vs 수수료 할부", p: "무이자 할부는 가맹점이 수수료를 부담해 회원은 할부원금만 냅니다. 수수료 할부는 회원이 잔액에 대한 수수료를 추가로 부담합니다. 큰 금액일수록 차이가 큽니다." },
    { h: "부분 무이자 할부", p: "‘2·3회차 무이자’처럼 일부 회차만 무이자인 상품도 있습니다. 이 계산기는 전체 무이자/유이자 기준이므로, 부분 무이자는 명세서로 확인하세요." },
    { h: "할부와 리볼빙은 다릅니다", p: "할부는 정해진 개월로 원금을 나눠 갚지만, 리볼빙(일부결제금액이월약정)은 매달 일정 비율만 갚고 나머지를 이월해 수수료가 훨씬 커질 수 있습니다." }
  ],
  faqs: [
    { q: "카드 할부 수수료는 어떻게 계산하나요?", a: "매달 남은 할부잔액에 ‘연 수수료율 ÷ 12’를 곱한 금액이 그 달 수수료입니다. 할부원금은 개월 수로 균등 분할되고, 수수료는 초반이 크고 점점 줄어듭니다." },
    { q: "수수료율은 어디서 확인하나요?", a: "카드사 앱·홈페이지의 수수료 안내, 카드 이용약관, 또는 결제 명세서에서 확인할 수 있습니다. 보통 연 7~19.9% 범위이며 카드·등급·개월에 따라 다릅니다." },
    { q: "무이자 할부는 수수료가 정말 0인가요?", a: "네. 무이자 할부는 회원이 수수료를 부담하지 않아 할부원금만 나눠서 냅니다. 이 계산기에서 ‘무이자 할부’를 체크하면 수수료 0으로 계산합니다." },
    { q: "할부를 중간에 갚으면 수수료가 줄어드나요?", a: "선결제(중도상환)하면 남은 잔액이 줄어 이후 수수료가 감소합니다. 체감식이라 남은 기간의 잔액 기준 수수료만큼 아낄 수 있습니다." },
    { q: "첫 달이 가장 많이 나오는 이유는?", a: "체감식은 잔액이 가장 큰 첫 달에 수수료가 가장 많습니다. 원금이 빠질수록 잔액이 줄어 수수료도 매달 조금씩 줄어듭니다." },
    { q: "할부개월이 길수록 손해인가요?", a: "개월이 길면 잔액이 오래 남아 총수수료가 커집니다. 다만 월 결제 부담은 줄어듭니다. 총수수료와 월 부담을 함께 보고 선택하세요." }
  ],
  sources: [
    { name: "여신금융협회 — 카드 수수료·약관 안내", url: "https://www.crefia.or.kr" },
    { name: "금융감독원 — 신용카드 할부·리볼빙 소비자 안내", url: "https://www.fss.or.kr" }
  ],
  appCategory: "FinanceApplication"
};
