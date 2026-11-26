/* 주택 재산세 계산기 — 페이지 스펙 */
module.exports = {
  id: "property-tax",
  title: "재산세 계산기 - 공시가격·공정시장가액비율·세율 | 건강흐름",
  description: "주택 공시가격과 1세대 1주택 여부로 재산세 과세표준(공정시장가액비율 60%·1주택 43~45%)과 본세, 지방교육세까지 2026년 기준으로 계산합니다.",
  keywords: "재산세 계산기, 재산세 과세표준, 공정시장가액비율, 1세대 1주택 특례세율, 주택 재산세, 재산세율",
  subtitle: "공시가격으로 주택 재산세 바로 계산",
  intro: '<p>주택 <strong>공시가격</strong>에 공정시장가액비율을 곱해 과세표준을 구하고, 재산세 세율(1세대 1주택은 특례세율)을 적용해 본세와 지방교육세를 계산합니다. 재산세가 어떻게 정해지는지는 <a href="/posts/property-tax-increase-reasons-2026.html">재산세가 오르는 이유</a>에서, 종부세와의 차이는 <a href="/posts/property-tax-vs-comprehensive-real-estate-tax-2026.html">보유세 비교 글</a>에서 확인하세요.</p>',
  inputsHtml:
    '<div class="field"><label for="price">주택 공시가격 <span class="hint">(부동산 공시가격 알리미 기준)</span></label>' +
    '<div class="input-unit"><input type="text" id="price" data-num data-share inputmode="numeric" placeholder="예: 550,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label><input type="checkbox" id="oneHouse" data-share> 1세대 1주택자입니다 <span class="hint">(공정시장가액비율 43~45% + 9억 이하 특례세율)</span></label></div>' +
    '<div class="field"><label><input type="checkbox" id="city" data-share> 도시지역분 포함 <span class="hint">(과세표준 × 0.14%, 대부분의 도시 지역)</span></label></div>',
  resultHtml: '<div id="ptResult"></div>',
  method:
    '<p>주택 재산세는 다음 순서로 계산합니다.</p>' +
    '<ul><li><strong>과세표준</strong> = 공시가격 × 공정시장가액비율</li>' +
    '<li><strong>재산세 본세</strong> = 과세표준 × 세율 − 누진공제</li>' +
    '<li><strong>지방교육세</strong> = 재산세 본세 × 20%</li></ul>' +
    '<p>공정시장가액비율(2026년 주택분)은 일반 60%, 1세대 1주택은 공시가격 3억 이하 43%·3~6억 44%·6억 초과 45%입니다.</p>' +
    '<table class="calc-table"><thead><tr><th>과세표준</th><th>일반세율</th><th>1주택 특례세율(공시 9억↓)</th></tr></thead><tbody>' +
    '<tr><td>6천만 이하</td><td>0.1%</td><td>0.05%</td></tr>' +
    '<tr><td>1.5억 이하</td><td>0.15%</td><td>0.1%</td></tr>' +
    '<tr><td>3억 이하</td><td>0.25%</td><td>0.2%</td></tr>' +
    '<tr><td>3억 초과</td><td>0.4%</td><td>0.35%</td></tr></tbody></table>',
  learnMore: [
    { h: "함께 보면 좋은 글", p: '<a href="/posts/property-tax-increase-reasons-2026.html">2026년 재산세 왜 올랐나 — 과세표준상한제·공정시장가액비율</a> · <a href="/posts/property-tax-vs-comprehensive-real-estate-tax-2026.html">재산세·종합부동산세·보유세 차이 완전정리</a>' },
    { h: "과세표준상한제는 별도", p: "공시가격이 급등해도 주택 과세표준이 한 해에 크게 뛰지 않도록 상한율 5%의 과세표준상한제가 적용됩니다. 이 계산기는 올해 공시가격 기준 기본 계산이라, 상한제가 적용되면 실제 세액이 더 낮을 수 있습니다." },
    { h: "종부세는 따로 확인", p: '공시가격이 커 종부세 대상이라면 <a href="/jongbuse/">종합부동산세 계산기</a>로 함께 확인하세요. 재산세와 종부세는 별개로 과세됩니다.' }
  ],
  faqs: [
    { q: "재산세는 언제 내나요?", a: "주택 재산세는 7월과 9월에 절반씩 나눠 냅니다. 과세 기준일은 매년 6월 1일 현재 소유자입니다." },
    { q: "1세대 1주택 특례는 어떻게 적용되나요?", a: "공시가격 9억 원 이하 1세대 1주택은 구간별로 0.05%포인트 낮은 특례세율이, 공정시장가액비율도 43~45%로 더 낮게 적용됩니다. 보통 요건을 갖추면 자동 적용됩니다." },
    { q: "계산 결과가 고지서와 다른 이유는?", a: "과세표준상한제, 세부담상한, 도시지역분·지역자원시설세 반영 여부, 공시가격 차이 등으로 달라질 수 있습니다. 정확한 금액은 위택스와 관할 지자체 고지서로 확인하세요." },
    { q: "재산세와 종합부동산세는 같이 내나요?", a: "재산세는 모든 주택 보유자가 7·9월에, 종부세는 공시가격이 기준을 넘는 일부가 12월에 추가로 냅니다. 둘을 묶어 보유세라고 합니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 지방세법 제110조·제111조·제111조의2", url: "https://www.law.go.kr/법령/지방세법" },
    { name: "위택스(Wetax) — 지방세 안내", url: "https://www.wetax.go.kr" },
    { name: "부동산 공시가격 알리미", url: "https://www.realtyprice.kr" }
  ],
  appCategory: "FinanceApplication"
};
