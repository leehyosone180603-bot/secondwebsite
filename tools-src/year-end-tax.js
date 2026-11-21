/* 연말정산 환급 계산기 — 페이지 스펙 */
module.exports = {
  id: "year-end-tax",
  title: "연말정산 환급 계산기 - 결정세액·예상 환급액 추정 | 건강흐름",
  description: "총급여·부양가족·신용카드·연금저축·보험·의료비·교육비·기부금·월세 공제로 연말정산 결정세액과 예상 환급액을 추정합니다. 2026 귀속 세액·소득공제 반영.",
  keywords: "연말정산 계산기, 연말정산 환급금 계산, 결정세액, 소득공제, 세액공제, 13월의 월급",
  subtitle: "총급여·공제로 결정세액과 환급액 추정",
  intro: '<p>총급여와 주요 공제 항목을 넣으면 <strong>결정세액</strong>과 <strong>예상 환급액</strong>을 추정합니다. 원천징수된 기납부세액을 넣으면 환급/추가납부를 계산합니다. (2026 귀속 기준)</p>',
  inputsHtml:
    '<div class="field"><label for="salary">총급여 <span class="hint">(연봉 − 비과세, 세전)</span></label>' +
    '<div class="input-unit"><input type="text" id="salary" data-num data-share inputmode="numeric" placeholder="예: 50,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="dependents">부양가족 수 <span class="hint">(본인 제외, 기본공제 대상)</span></label>' +
    '<div class="input-unit"><input type="text" id="dependents" data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">명</span></div></div>' +
    '<div class="field"><label for="children">자녀세액공제 대상 <span class="hint">(8세 이상 자녀 수)</span></label>' +
    '<div class="input-unit"><input type="text" id="children" data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">명</span></div></div>' +

    '<h3 style="margin:14px 0 4px;font-size:.95rem">신용카드 등 사용액 (연간)</h3>' +
    '<div class="field"><label for="cardCredit">신용카드</label><div class="input-unit"><input type="text" id="cardCredit" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="cardCheck">체크카드·현금영수증</label><div class="input-unit"><input type="text" id="cardCheck" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="cardMarket">전통시장·대중교통</label><div class="input-unit"><input type="text" id="cardMarket" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +

    '<h3 style="margin:14px 0 4px;font-size:.95rem">세액공제 항목 (연간 납입·지출액)</h3>' +
    '<div class="field"><label for="pension">연금저축+IRP 납입액 <span class="hint">(한도 900만)</span></label><div class="input-unit"><input type="text" id="pension" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="insurance">보장성보험료 <span class="hint">(한도 100만)</span></label><div class="input-unit"><input type="text" id="insurance" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="medical">의료비</label><div class="input-unit"><input type="text" id="medical" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="education">교육비</label><div class="input-unit"><input type="text" id="education" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="donation">기부금</label><div class="input-unit"><input type="text" id="donation" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="rent">월세액 <span class="hint">(연간, 무주택·총급여 8천만 이하)</span></label><div class="input-unit"><input type="text" id="rent" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +

    '<div class="field"><label for="prepaid">기납부세액 <span class="hint">(원천징수 소득세, 환급 계산용·선택)</span></label><div class="input-unit"><input type="text" id="prepaid" data-num data-share inputmode="numeric" placeholder="예: 2,000,000"><span class="unit">원</span></div></div>',
  resultHtml: '<div id="yeResult"></div>',
  method:
    '<p>연말정산은 다음 순서로 계산합니다.</p>' +
    '<ul><li><strong>근로소득금액</strong> = 총급여 − 근로소득공제</li>' +
    '<li><strong>과세표준</strong> = 근로소득금액 − 소득공제(인적·연금보험료·4대보험·신용카드 등)</li>' +
    '<li><strong>산출세액</strong> = 과세표준 × 세율 − 누진공제</li>' +
    '<li><strong>결정세액</strong> = 산출세액 − 세액공제(근로·자녀·연금계좌·보험·의료·교육·기부·월세)</li>' +
    '<li><strong>환급액</strong> = 기납부세액(원천징수) − 결정세액</li></ul>' +
    '<p>세액공제율: 연금계좌 12~15%, 보험료 12%, 의료비(총급여 3% 초과분) 15%, 교육비 15%, 기부금 15~30%, 월세 15~17%. 신용카드는 총급여 25% 초과 사용분을 신용 15%·체크/현금 30%·전통시장/대중교통 40%로 소득공제합니다.</p>',
  learnMore: [
    { h: "결정세액과 환급액", p: "결정세액은 1년간 실제로 내야 할 세금입니다. 매달 원천징수로 미리 낸 기납부세액이 결정세액보다 많으면 환급, 적으면 추가 납부합니다. ‘13월의 월급’은 환급을 뜻합니다." },
    { h: "신용카드 vs 체크카드", p: "체크카드·현금영수증(30%)이 신용카드(15%)보다 공제율이 높습니다. 총급여의 25%까지는 공제가 안 되므로, 그 전까지는 혜택 좋은 신용카드, 넘은 뒤에는 체크·현금이 유리합니다." },
    { h: "연금저축·IRP 절세", p: "연금저축(600만)+IRP 합쳐 연 900만까지 납입하면 12~15%를 세액공제받습니다. 총급여 5,500만 이하는 15%라 900만 납입 시 최대 135만 원을 돌려받습니다." }
  ],
  faqs: [
    { q: "연말정산 환급금은 어떻게 정해지나요?", a: "1년간 낼 세금(결정세액)보다 매달 미리 낸 세금(기납부세액)이 많으면 그 차액을 환급받습니다. 공제가 많을수록 결정세액이 줄어 환급이 커집니다." },
    { q: "이 계산기 결과가 정확한가요?", a: "주요 항목을 반영한 추정치입니다. 4대보험·신용카드 소득공제는 간이 계산하고 경로·장애인 추가공제 등은 단순화했습니다. 정확한 금액은 홈택스 ‘연말정산 미리보기’로 확인하세요." },
    { q: "연금저축은 얼마까지 공제되나요?", a: "연금저축 600만, IRP 포함 합산 900만 원까지 납입액의 12~15%를 세액공제받습니다. 총급여 5,500만 원 이하는 15%가 적용됩니다." },
    { q: "의료비는 다 공제되나요?", a: "총급여의 3%를 넘는 금액부터 15% 세액공제됩니다. 예로 총급여 5천만 원이면 150만 원을 넘는 의료비부터 공제 대상입니다." },
    { q: "월세도 돌려받나요?", a: "무주택 세대주이고 총급여 8천만 원 이하이면 월세의 15%(총급여 5,500만 이하 17%)를 연 1,000만 원 한도로 세액공제받습니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 소득세법 제59조의3·제59조의4", url: "https://www.law.go.kr/법령/소득세법/제59조의4" },
    { name: "국세청 홈택스 — 연말정산 종합안내", url: "https://www.hometax.go.kr" }
  ],
  appCategory: "FinanceApplication"
};
