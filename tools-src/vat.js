/* 부가세 계산기 — 페이지 스펙 */
module.exports = {
  id: "vat",
  title: "부가세 계산기 - 공급가·부가세·합계 분리, 10% 자동 계산 | 건강흐름",
  description: "공급가액에서 부가세·합계를, 합계금액에서 공급가·부가세를 바로 분리합니다. 부가세만 역산, 여러 품목 합계, 원 단위 반올림/절사까지. 세율 10% 자동 적용.",
  keywords: "부가세 계산기, 부가가치세, 공급가액, 합계 분리, 부가세 역산, 세금계산서",
  subtitle: "공급가↔합계↔부가세, 어느 쪽이든 10% 자동 분리",
  intro: '<p>세율은 <strong>부가가치세법상 10%</strong>가 자동 적용됩니다(간이과세·면세는 아래 FAQ 참고).</p>',
  inputsHtml:
    '<div class="field"><label>계산 모드</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-mode="s2t" aria-pressed="true">공급가 → 합계</button>' +
    '<button type="button" class="btn-sm" data-mode="t2s">합계 → 분리</button>' +
    '<button type="button" class="btn-sm" data-mode="vat">부가세 → 역산</button></div></div>' +

    '<div class="vat-panel" data-panel="s2t">' +
    '<div class="field"><label for="supplyInput">공급가액 <span class="hint">(부가세 전)</span></label>' +
    '<div class="input-unit"><input type="text" id="supplyInput" data-num data-share inputmode="numeric" placeholder="예: 100,000"><span class="unit">원</span></div></div>' +
    '<div id="itemRows"></div>' +
    '<button type="button" class="btn-sm" id="addItem">➕ 품목 추가(여러 건 합산)</button></div>' +

    '<div class="vat-panel" data-panel="t2s" hidden>' +
    '<div class="field"><label for="totalInput">합계금액 <span class="hint">(부가세 포함)</span></label>' +
    '<div class="input-unit"><input type="text" id="totalInput" data-num data-share inputmode="numeric" placeholder="예: 110,000"><span class="unit">원</span></div></div></div>' +

    '<div class="vat-panel" data-panel="vat" hidden>' +
    '<div class="field"><label for="vatInput">부가세액</label>' +
    '<div class="input-unit"><input type="text" id="vatInput" data-num data-share inputmode="numeric" placeholder="예: 10,000"><span class="unit">원</span></div></div></div>' +

    '<div class="field"><label for="roundMode">원 단위 처리</label>' +
    '<select id="roundMode" data-share><option value="round">반올림</option><option value="floor">절사(버림)</option><option value="ceil">올림</option></select></div>',
  resultHtml:
    '<div class="result-hero"><div class="big"><span id="rTotal">0</span><small>원</small></div><p class="result-sub">합계금액 (공급가 + 부가세)</p></div>' +
    '<table class="calc-table"><tbody>' +
    '<tr><th>공급가액</th><td><span id="rSupply"></span> 원</td></tr>' +
    '<tr><th>부가세 (<span id="rRate">10</span>%)</th><td><span id="rVat"></span> 원</td></tr>' +
    '</tbody></table>',
  method:
    '<p>부가가치세는 공급가액의 10%입니다. 모드별 계산식은 다음과 같습니다.</p>' +
    '<ul><li><strong>공급가 → 합계</strong>: 부가세 = 공급가 × 10%, 합계 = 공급가 + 부가세</li>' +
    '<li><strong>합계 → 분리</strong>: 공급가 = 합계 ÷ 1.1, 부가세 = 합계 − 공급가</li>' +
    '<li><strong>부가세 → 역산</strong>: 공급가 = 부가세 ÷ 0.1, 합계 = 공급가 + 부가세</li></ul>' +
    '<p>예) 공급가 100,000원 → 부가세 10,000원, 합계 <strong>110,000원</strong>. 반대로 합계 110,000원 → 공급가 100,000원 + 부가세 10,000원.</p>',
  learnMore: [
    { h: "부가가치세란?", p: "상품·서비스가 거래될 때 더해지는 간접세입니다. 사업자가 받은 부가세(매출세액)에서 낸 부가세(매입세액)를 빼서 신고·납부합니다." },
    { h: "공급가액 vs 공급대가", p: "공급가액은 부가세를 뺀 ‘순수 물건값’, 공급대가는 부가세까지 포함한 ‘총 받는 돈’(합계)입니다. 간이과세자는 공급대가 기준을 씁니다." },
    { h: "부가세는 누가 부담하나", p: "실제 부담자는 최종 소비자입니다. 사업자는 소비자에게 받은 부가세를 보관했다가 국가에 대신 납부하는 역할을 합니다." }
  ],
  faqs: [
    { q: "부가세율은 몇 %인가요?", a: "일반과세 기준 10%입니다. 수출 등 영세율은 0%, 면세 품목은 부가세가 붙지 않습니다." },
    { q: "간이과세자와 일반과세자는 뭐가 다른가요?", a: "일반과세자는 세율 10%에 매입세액을 전액 공제받습니다. 간이과세자는 업종별 낮은 부가가치율을 적용해 세 부담이 작은 대신 매입세액 공제가 제한되고, 일정 매출 미만에서는 납부의무가 면제될 수 있습니다." },
    { q: "면세 품목에는 어떤 것이 있나요?", a: "기초 생활필수품과 국민후생 관련 재화·용역이 면세입니다. 미가공 식료품, 수돗물, 연탄, 도서·신문, 의료·교육용역, 금융·보험용역 등이 해당합니다." },
    { q: "부가세 신고·납부는 언제 하나요?", a: "법인은 1년에 4번(분기), 개인 일반과세자는 2번(1월·7월) 확정신고합니다. 개인은 4월·10월에 예정고지로 미리 낼 수 있고, 간이과세자는 다음 해 1월에 1번 신고합니다." },
    { q: "매입세액 공제가 무엇인가요?", a: "사업을 위해 물건·서비스를 사며 낸 부가세(매입세액)를 매출세액에서 빼 주는 것입니다. 세금계산서·현금영수증·사업용 카드 등 적격증빙이 있어야 공제됩니다." },
    { q: "합계금액만 아는데 공급가와 부가세를 나눌 수 있나요?", a: "네. ‘합계 → 분리’ 모드에 합계를 넣으면 공급가(합계 ÷ 1.1)와 부가세를 자동으로 나눠 줍니다." },
    { q: "세금계산서에는 어떤 금액을 적나요?", a: "공급가액과 세액(부가세)을 각각 구분해 적고, 합계가 공급대가가 됩니다. 이 계산기의 분리 결과를 그대로 활용할 수 있습니다." },
    { q: "원 단위에서 반올림과 절사 중 무엇이 맞나요?", a: "법에 단일 규정은 없고 거래 관행·전산에 따라 다릅니다. 보통 원 단위 절사 또는 반올림을 쓰며, 세금계산서는 거래처와 맞추는 것이 좋습니다. 이 계산기는 세 방식을 모두 제공합니다." }
  ],
  sources: [
    { name: "국세청 — 부가가치세 안내", url: "https://www.nts.go.kr" },
    { name: "국가법령정보센터 — 부가가치세법", url: "https://www.law.go.kr/법령/부가가치세법" }
  ],
  appCategory: "FinanceApplication"
};
