/* 상속세 계산기 — 페이지 스펙 */
module.exports = {
  id: "inheritance-tax",
  title: "상속세 계산기 - 일괄공제·배우자공제 반영 납부세액 추정 | 건강흐름",
  description: "상속재산과 배우자·자녀·금융재산 공제로 상속세 과세표준과 납부세액을 추정합니다. 일괄공제 5억, 배우자공제 최소 5억, 10~50% 누진세율, 신고세액공제 3% 반영.",
  keywords: "상속세 계산기, 일괄공제, 배우자 상속공제, 상속세율, 금융재산 상속공제, 상속세 면제 한도",
  subtitle: "공제 반영 상속세 납부액 간이 추정",
  intro: '<p>상속재산에서 <strong>일괄공제(5억)</strong>·배우자공제·금융재산공제를 빼 과세표준을 구하고, 10~50% 누진세율과 신고세액공제(3%)로 납부세액을 추정합니다.</p>',
  inputsHtml:
    '<div class="field"><label for="estate">상속재산 가액 <span class="hint">(부동산·예금 등 합계 평가액)</span></label>' +
    '<div class="input-unit"><input type="text" id="estate" data-num data-share inputmode="numeric" placeholder="예: 1,500,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label><input type="checkbox" id="spouseAlive" data-share checked> 배우자 생존 (배우자 상속공제 적용)</label></div>' +
    '<div class="field"><label for="children">자녀 수</label>' +
    '<div class="input-unit"><input type="text" id="children" data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">명</span></div></div>' +
    '<div class="field"><label for="financial">순금융재산 <span class="hint">(예금·주식 등 − 금융채무, 없으면 0)</span></label>' +
    '<div class="input-unit"><input type="text" id="financial" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>',
  resultHtml: '<div id="itResult"></div>',
  method:
    '<p>상속세는 다음 순서로 계산합니다.</p>' +
    '<ul><li><strong>공제</strong> = 일괄공제 5억(또는 기초 2억 + 자녀공제 등 중 큰 값) + 배우자공제 + 금융재산공제</li>' +
    '<li><strong>과세표준</strong> = 상속재산 − 공제 합계</li>' +
    '<li><strong>산출세액</strong> = 과세표준 × 세율 − 누진공제, <strong>납부세액</strong> = 산출세액 × (1 − 3%)</li></ul>' +
    '<p>배우자가 있고 자녀가 있으면 일괄공제 5억 + 배우자공제 최소 5억 = 최소 10억이 공제됩니다. 그래서 상속재산이 10억 이하이면 상속세가 없는 경우가 많습니다. 세율은 증여세와 동일한 10~50% 누진구조입니다.</p>' +
    '<table class="calc-table"><thead><tr><th>과세표준</th><th>세율</th><th>누진공제</th></tr></thead><tbody>' +
    '<tr><td>1억 이하</td><td>10%</td><td>-</td></tr>' +
    '<tr><td>5억 이하</td><td>20%</td><td>1,000만</td></tr>' +
    '<tr><td>10억 이하</td><td>30%</td><td>6,000만</td></tr>' +
    '<tr><td>30억 이하</td><td>40%</td><td>1억 6,000만</td></tr>' +
    '<tr><td>30억 초과</td><td>50%</td><td>4억 6,000만</td></tr></tbody></table>',
  learnMore: [
    { h: "왜 10억까지 세금이 없을까", p: "배우자와 자녀가 모두 있으면 일괄공제 5억과 배우자공제 최소 5억을 합쳐 최소 10억이 공제됩니다. 그래서 상속재산 10억 이하는 상속세가 없는 경우가 많습니다." },
    { h: "배우자공제는 더 받을 수 있어요", p: "배우자가 실제로 상속받으면 법정상속분 한도로 최대 30억까지 공제됩니다. 이 계산기는 안전하게 최소 5억만 반영하므로, 실제 세액은 더 낮을 수 있습니다." },
    { h: "금융재산 상속공제", p: "순금융재산(예금·주식 − 금융채무)의 20%를 최대 2억까지 공제합니다(2천만 원 이하는 전액). 부동산보다 금융재산 비중이 크면 유리합니다." }
  ],
  faqs: [
    { q: "상속세는 얼마까지 공제되나요?", a: "일괄공제 5억이 기본이고, 배우자가 있으면 최소 5억이 더해져 최소 10억이 공제됩니다. 금융재산·동거주택 공제까지 더하면 공제액은 더 커집니다." },
    { q: "상속재산 10억이면 세금이 없나요?", a: "배우자와 자녀가 있으면 공제가 최소 10억이라 세금이 없는 경우가 많습니다. 다만 배우자가 없으면 일괄공제 5억만 적용돼 세금이 생길 수 있습니다." },
    { q: "상속세율은 얼마인가요?", a: "과세표준 1억 이하 10%부터 30억 초과 50%까지 5단계 누진세율입니다. 증여세와 세율이 같습니다." },
    { q: "언제까지 신고하나요?", a: "상속개시일(사망일)이 속한 달의 말일부터 6개월 안에 신고·납부하면 산출세액의 3%를 신고세액공제로 받습니다." },
    { q: "이 계산기 결과가 정확한가요?", a: "주요 공제만 반영한 간이 추정입니다. 배우자공제 최대 30억, 동거주택·인적공제, 사전증여 합산, 가업상속공제 등은 빠져 있어 실제와 차이가 날 수 있습니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 상속세 및 증여세법 제18조~제26조", url: "https://www.law.go.kr/법령/상속세및증여세법" },
    { name: "국세청 — 상속세 안내", url: "https://www.nts.go.kr" }
  ],
  appCategory: "FinanceApplication"
};
