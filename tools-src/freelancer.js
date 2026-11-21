/* 프리랜서 세금 계산기 — 페이지 스펙 */
module.exports = {
  id: "freelancer",
  title: "프리랜서 세금 계산기 - 3.3% 원천징수·종합소득세 추정 | 건강흐름",
  description: "프리랜서 지급액의 3.3%(기타소득 8.8%) 원천징수와 실수령액을 양방향으로 계산하고, 5월 종합소득세 환급/추가납부를 추정합니다.",
  keywords: "프리랜서 세금, 3.3% 계산기, 원천징수, 사업소득, 기타소득 8.8%, 종합소득세",
  subtitle: "3.3% 원천징수 실수령액과 5월 종합소득세 추정",
  inputsHtml:
    '<div class="field"><label>계산 모드</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-mode="wh" aria-pressed="true">원천징수(3.3%)</button>' +
    '<button type="button" class="btn-sm" data-mode="ci">종합소득세 추정</button></div></div>' +

    '<div class="fl-panel" data-panel="wh">' +
    '<div class="field"><label for="incomeKind">소득 종류</label>' +
    '<select id="incomeKind" data-share><option value="business">사업소득 (3.3%)</option><option value="other">기타소득 (8.8%)</option></select></div>' +
    '<div class="field"><label for="whDir">계산 방향</label>' +
    '<select id="whDir" data-share><option value="g2n">세전 지급액 → 실수령</option><option value="n2g">실수령 → 세전 지급액</option></select></div>' +
    '<div class="field" id="whGrossWrap"><label for="whGross">세전 지급액</label>' +
    '<div class="input-unit"><input type="text" id="whGross" data-num data-share inputmode="numeric" placeholder="예: 1,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field" id="whNetWrap" hidden><label for="whNet">실수령액</label>' +
    '<div class="input-unit"><input type="text" id="whNet" data-num data-share inputmode="numeric" placeholder="예: 967,000"><span class="unit">원</span></div></div></div>' +

    '<div class="fl-panel" data-panel="ci" hidden>' +
    '<div class="field"><label for="ciIncome">연 수입금액 <span class="hint">(1년 총 지급액)</span></label>' +
    '<div class="input-unit"><input type="text" id="ciIncome" data-num data-share inputmode="numeric" placeholder="예: 40,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="ciExpMode">필요경비</label>' +
    '<select id="ciExpMode" data-share><option value="rate">경비율(%)로 입력</option><option value="amount">경비 금액으로 입력</option></select></div>' +
    '<div class="field" id="ciExpRateWrap"><label for="ciExpRate">경비율 <span class="hint">(업종별 단순/기준경비율)</span></label>' +
    '<div class="input-unit"><input type="text" id="ciExpRate" data-share inputmode="decimal" placeholder="예: 64.1"><span class="unit">%</span></div></div>' +
    '<div class="field" id="ciExpAmtWrap" hidden><label for="ciExpAmt">경비 금액</label>' +
    '<div class="input-unit"><input type="text" id="ciExpAmt" data-num data-share inputmode="numeric" placeholder="예: 10,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="ciFamily">인적공제 대상 <span class="hint">(본인 포함 가족 수)</span></label>' +
    '<div class="input-unit"><input type="text" id="ciFamily" data-share inputmode="numeric" value="1" placeholder="1"><span class="unit">명</span></div></div></div>',
  resultHtml: '<div id="flResult"></div>',
  method:
    '<p><strong>원천징수</strong>: 프리랜서(사업소득)는 지급액의 3.3%(소득세 3% + 지방소득세 0.3%)를 떼고 지급합니다. 기타소득(강연료·원고료 등)은 필요경비 60% 의제 후 실효 8.8%입니다.</p>' +
    '<ul><li>세금 = 지급액 × 3.3%, 실수령 = 지급액 × 96.7%</li><li>세전 역산 = 실수령 ÷ 0.967</li></ul>' +
    '<p><strong>종합소득세(5월)</strong> = (수입 − 필요경비 − 인적공제)에 누진세율을 적용한 산출세액에서, 이미 뗀 3%(기납부세액)를 빼서 환급·추가납부를 정합니다.</p>' +
    '<p>종합소득세 과세표준 구간: 1,400만 이하 6% / ~5,000만 15% / ~8,800만 24% / ~1.5억 35% / … (누진공제 적용)</p>',
  learnMore: [
    { h: "3.3%는 ‘세금 확정’이 아니다", p: "원천징수 3.3%는 미리 떼는 선납일 뿐입니다. 5월 종합소득세 신고로 실제 세금을 정산해 더 내거나 돌려받습니다. 소득이 적으면 대부분 환급됩니다." },
    { h: "단순경비율 vs 기준경비율", p: "수입이 일정 기준 미만이면 업종별 ‘단순경비율’로 경비를 인정받아 신고가 간단합니다. 기준을 넘으면 ‘기준경비율’ 또는 장부(실제 경비)로 신고합니다. 경비율은 업종코드별로 다릅니다." },
    { h: "사업소득과 기타소득", p: "계속·반복적인 용역은 사업소득(3.3%), 일시적인 강연·원고 등은 기타소득(8.8%)입니다. 기타소득은 연 300만원(기타소득금액) 이하면 분리과세를 선택할 수 있습니다." }
  ],
  faqs: [
    { q: "3.3%는 무슨 세금인가요?", a: "사업소득 원천징수로, 소득세 3%와 지방소득세 0.3%를 합한 값입니다. 지급자가 미리 떼어 국가에 냅니다." },
    { q: "5월에 환급받을 수 있나요?", a: "소득이 적고 기납부한 3%가 실제 세금보다 많으면 환급됩니다. 반대로 소득이 크면 추가 납부가 생길 수 있습니다." },
    { q: "기타소득 8.8%는 언제 적용되나요?", a: "강연료·원고료·자문료처럼 일시적인 인적용역 기타소득에 적용됩니다. 필요경비 60%를 인정한 뒤 20%(지방 포함 22%)를 적용해 실효 8.8%가 됩니다." },
    { q: "세금계산서를 발행해야 하나요?", a: "프리랜서(면세사업자인 인적용역)는 보통 세금계산서 대신 원천징수영수증으로 처리됩니다. 부가세 과세사업자라면 별도입니다." },
    { q: "종합소득세는 꼭 신고해야 하나요?", a: "네. 3.3%를 뗐더라도 5월에 종합소득세를 신고해야 정산됩니다. 미신고 시 가산세와 환급 누락이 생길 수 있습니다." },
    { q: "프리랜서도 4대보험에 가입하나요?", a: "지역가입자로 국민연금·건강보험을 냅니다. 고용·산재는 2021년 이후 일부 직종에 적용이 확대되었습니다. 자세한 건 4대보험 계산기와 공단 안내를 참고하세요." },
    { q: "필요경비는 어떻게 넣나요?", a: "장부가 있으면 실제 경비 금액을, 없으면 업종별 경비율(%)을 입력하세요. 경비율은 국세청 ‘업종별 단순·기준경비율’에서 확인합니다." }
  ],
  sources: [
    { name: "국세청 — 원천징수·종합소득세 안내", url: "https://www.nts.go.kr" },
    { name: "국가법령정보센터 — 소득세법 제129조(원천징수세율)", url: "https://www.law.go.kr/법령/소득세법/제129조" }
  ],
  appCategory: "FinanceApplication"
};
