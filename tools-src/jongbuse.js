/* 종합부동산세 계산기 — 페이지 스펙 */
module.exports = {
  id: "jongbuse",
  title: "종합부동산세 계산기 - 공제·세율·세액공제 | 건강흐름",
  description: "주택 공시가격 합계와 1세대 1주택 여부, 나이·보유기간으로 종합부동산세 과세표준(공제 9억·1주택 12억)과 세율, 고령·장기보유 세액공제, 농어촌특별세까지 2026년 기준으로 계산합니다.",
  keywords: "종합부동산세 계산기, 종부세 계산, 종부세 공제, 종부세 세율, 고령자 세액공제, 장기보유 세액공제, 2026 종부세",
  subtitle: "공시가격 합계로 종부세 바로 계산",
  intro: '<p>주택 <strong>공시가격 합계</strong>에서 공제액(9억, 1세대 1주택 12억)을 빼고 공정시장가액비율 60%를 곱해 과세표준을 구한 뒤, 세율과 세액공제를 적용해 종부세를 계산합니다. 고지서를 받았다면 <a href="/posts/comprehensive-real-estate-tax-notice-payment-2026.html">종부세 고지서 체크 가이드</a>를, 재산세와의 차이는 <a href="/posts/property-tax-vs-comprehensive-real-estate-tax-2026.html">보유세 비교 글</a>을 함께 보세요.</p>',
  inputsHtml:
    '<div class="field"><label for="price">주택 공시가격 합계 <span class="hint">(인별 보유 주택 공시가격의 합)</span></label>' +
    '<div class="input-unit"><input type="text" id="price" data-num data-share inputmode="numeric" placeholder="예: 1,500,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label><input type="checkbox" id="oneHouse" data-share> 1세대 1주택자입니다 <span class="hint">(공제 12억 + 고령·장기보유 세액공제)</span></label></div>' +
    '<div id="creditRow" style="display:none">' +
    '<div class="field"><label for="age">만 나이 <span class="hint">(고령자 세액공제: 60·65·70세↑ 20·30·40%)</span></label>' +
    '<div class="input-unit"><input type="text" id="age" data-num data-share inputmode="numeric" placeholder="예: 65"><span class="unit">세</span></div></div>' +
    '<div class="field"><label for="years">보유기간 <span class="hint">(장기보유 세액공제: 5·10·15년↑ 20·40·50%)</span></label>' +
    '<div class="input-unit"><input type="text" id="years" data-num data-share inputmode="numeric" placeholder="예: 10"><span class="unit">년</span></div></div>' +
    '</div>',
  resultHtml: '<div id="jbResult"></div>',
  method:
    '<p>종합부동산세는 다음 순서로 계산합니다(2주택 이하 기준).</p>' +
    '<ul><li><strong>과세표준</strong> = (공시가격 합계 − 공제액) × 공정시장가액비율(60%)</li>' +
    '<li><strong>산출세액</strong> = 과세표준 × 세율 − 누진공제</li>' +
    '<li><strong>종부세</strong> = 산출세액 × (1 − 세액공제율) · 1세대 1주택 고령·장기보유 합산 최대 80%</li>' +
    '<li><strong>농어촌특별세</strong> = 종부세 × 20%</li></ul>' +
    '<p>공제액은 1세대 1주택자 12억 원, 그 외 9억 원입니다.</p>' +
    '<table class="calc-table"><thead><tr><th>과세표준</th><th>세율(2주택 이하)</th><th>누진공제</th></tr></thead><tbody>' +
    '<tr><td>3억 이하</td><td>0.5%</td><td>-</td></tr>' +
    '<tr><td>6억 이하</td><td>0.7%</td><td>60만</td></tr>' +
    '<tr><td>12억 이하</td><td>1.0%</td><td>240만</td></tr>' +
    '<tr><td>25억 이하</td><td>1.3%</td><td>600만</td></tr>' +
    '<tr><td>50억 이하</td><td>1.5%</td><td>1,100만</td></tr>' +
    '<tr><td>94억 이하</td><td>2.0%</td><td>3,600만</td></tr>' +
    '<tr><td>94억 초과</td><td>2.7%</td><td>1억 180만</td></tr></tbody></table>',
  learnMore: [
    { h: "함께 보면 좋은 글", p: '<a href="/posts/comprehensive-real-estate-tax-notice-payment-2026.html">2026 종합부동산세 고지서, 납부 전 체크 6가지와 분납·납부유예</a> · <a href="/posts/property-tax-vs-comprehensive-real-estate-tax-2026.html">재산세·종합부동산세·보유세 차이 완전정리</a>' },
    { h: "분납과 납부유예", p: "본세가 250만 원을 넘으면 일부를 다음 해 6월 15일까지 나눠 내는 분납을, 60세 이상·5년 이상 보유 1주택자 등은 양도·상속 때까지 미루는 납부유예를 신청할 수 있습니다." },
    { h: "재산세도 함께", p: '종부세는 재산세에 더해 내는 세금입니다. 재산세 본세는 <a href="/property-tax/">재산세 계산기</a>로 확인하세요.' }
  ],
  faqs: [
    { q: "종합부동산세는 누가 내나요?", a: "6월 1일 기준으로 인별 보유 주택 공시가격 합계가 9억 원(1세대 1주택자 12억 원)을 넘는 사람이 냅니다. 대부분의 1주택자는 대상이 아닙니다." },
    { q: "세액공제는 어떻게 받나요?", a: "1세대 1주택자는 고령자 공제(60·65·70세 이상 20·30·40%)와 장기보유 공제(5·10·15년 이상 20·40·50%)를 받을 수 있고, 두 공제를 합쳐 최대 80%까지 적용됩니다." },
    { q: "계산 결과가 고지서와 다른 이유는?", a: "이 계산기는 재산세 중복분 공제, 3주택 이상 중과, 세부담상한, 합산배제 등을 반영하지 않은 추정치입니다. 정확한 금액은 국세청 홈택스 고지서로 확인하세요." },
    { q: "종부세는 언제 내나요?", a: "매년 12월 1일부터 15일까지 한 번에 냅니다. 본세가 250만 원을 넘으면 분납을 신청할 수 있습니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 종합부동산세법 제8조·제9조", url: "https://www.law.go.kr/법령/종합부동산세법" },
    { name: "국세청 홈택스", url: "https://www.hometax.go.kr" },
    { name: "부동산 공시가격 알리미", url: "https://www.realtyprice.kr" }
  ],
  appCategory: "FinanceApplication"
};
