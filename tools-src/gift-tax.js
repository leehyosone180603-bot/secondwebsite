/* 증여세 계산기 — 페이지 스펙 */
module.exports = {
  id: "gift-tax",
  title: "증여세 계산기 - 증여재산공제·세율·신고세액공제 | 건강흐름",
  description: "증여재산과 관계별 공제(배우자 6억·성년자녀 5천만 등)로 증여세 과세표준, 산출세액, 신고세액공제(3%) 후 납부세액을 계산합니다. 혼인·출산 공제 반영.",
  keywords: "증여세 계산기, 증여재산공제, 증여세율, 자녀 증여, 부부 증여, 혼인 증여공제",
  subtitle: "관계별 공제와 누진세율로 증여세 계산",
  intro: '<p>증여재산에서 <strong>관계별 공제</strong>(10년 합산)를 빼 과세표준을 구하고, 10~50% 누진세율과 신고세액공제(3%)를 적용해 납부세액을 계산합니다.</p>',
  inputsHtml:
    '<div class="field"><label for="gift">증여재산 가액 <span class="hint">(증여받는 재산의 평가액)</span></label>' +
    '<div class="input-unit"><input type="text" id="gift" data-num data-share inputmode="numeric" placeholder="예: 500,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="relation">증여자와의 관계 <span class="hint">(수증자 기준)</span></label>' +
    '<select id="relation" data-share>' +
    '<option value="adult">성년 자녀가 부모에게서 (5천만)</option>' +
    '<option value="minor">미성년 자녀가 부모에게서 (2천만)</option>' +
    '<option value="spouse">배우자에게서 (6억)</option>' +
    '<option value="ascendant">부모가 자녀에게서 (5천만)</option>' +
    '<option value="other">기타 친족에게서 (1천만)</option>' +
    '</select></div>' +
    '<div class="field" id="mbRow"><label><input type="checkbox" id="useMB" data-share> 혼인·출산 증여공제 적용 (최대 1억 추가)</label>' +
    '<div id="mbAmtWrap" style="display:none;margin-top:6px"><div class="input-unit"><input type="text" id="mbAmt" data-num data-share inputmode="numeric" placeholder="예: 100,000,000"><span class="unit">원</span></div></div></div>',
  resultHtml: '<div id="gtResult"></div>',
  method:
    '<p>증여세는 다음 순서로 계산합니다.</p>' +
    '<ul><li><strong>과세표준</strong> = 증여재산 − 증여재산공제 − 혼인·출산공제</li>' +
    '<li><strong>산출세액</strong> = 과세표준 × 세율 − 누진공제</li>' +
    '<li><strong>납부세액</strong> = 산출세액 − 신고세액공제(산출세액 × 3%)</li></ul>' +
    '<p>증여재산공제(10년 합산): 배우자 6억, 성년 자녀 5천만, 미성년 자녀 2천만, 자녀→부모 5천만, 기타 친족 1천만 원입니다. 혼인·출산 공제는 직계존속 증여 시 평생 1억 한도로 별도 적용됩니다.</p>' +
    '<table class="calc-table"><thead><tr><th>과세표준</th><th>세율</th><th>누진공제</th></tr></thead><tbody>' +
    '<tr><td>1억 이하</td><td>10%</td><td>-</td></tr>' +
    '<tr><td>5억 이하</td><td>20%</td><td>1,000만</td></tr>' +
    '<tr><td>10억 이하</td><td>30%</td><td>6,000만</td></tr>' +
    '<tr><td>30억 이하</td><td>40%</td><td>1억 6,000만</td></tr>' +
    '<tr><td>30억 초과</td><td>50%</td><td>4억 6,000만</td></tr></tbody></table>',
  learnMore: [
    { h: "10년 합산에 주의", p: "같은 사람에게서 10년 이내에 받은 증여는 합산해 과세합니다. 이 계산기는 이번 1건만 계산하므로, 과거 증여가 있으면 합산해서 다시 계산해야 합니다." },
    { h: "혼인·출산 증여공제", p: "2024년부터 직계존속(부모 등)에게서 혼인신고 전후 2년, 또는 출생·입양일부터 2년 이내 증여받으면 평생 1억 원까지 추가 공제됩니다. 기본 공제 5천만 원과 별개입니다." },
    { h: "미성년자 할증", p: "직계비속에게 증여하면서 자녀가 아닌 손자녀 등에게 세대를 건너뛰어 증여하면 30%(미성년이면서 20억 초과 시 40%) 할증됩니다. 이 계산기는 할증을 반영하지 않습니다." }
  ],
  faqs: [
    { q: "증여세는 누가 내나요?", a: "재산을 받은 사람(수증자)이 냅니다. 증여일이 속한 달의 말일부터 3개월 안에 신고·납부하면 신고세액공제 3%를 받습니다." },
    { q: "부모가 자녀에게 얼마까지 세금 없이 주나요?", a: "성년 자녀는 10년간 5천만 원, 미성년 자녀는 2천만 원까지 공제됩니다. 혼인·출산 공제를 더하면 성년 자녀는 최대 1억 5천만 원까지 비과세가 가능합니다." },
    { q: "부부끼리 증여는 세금이 없나요?", a: "배우자 공제가 10년간 6억 원이라, 6억 원까지는 증여세가 없습니다. 초과분에만 세율이 적용됩니다." },
    { q: "증여세율은 얼마인가요?", a: "과세표준 1억 이하 10%부터 30억 초과 50%까지 5단계 누진세율입니다. 상속세와 세율이 같습니다." },
    { q: "10년 안에 또 증여받으면요?", a: "같은 증여자에게서 10년 내 받은 증여는 합산해 누진세율을 적용합니다. 나눠 주더라도 10년 합산되므로 절세 효과가 제한적입니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 상속세 및 증여세법 제26조·제53조·제69조", url: "https://www.law.go.kr/법령/상속세및증여세법" },
    { name: "국세청 — 증여세 안내", url: "https://www.nts.go.kr" }
  ],
  appCategory: "FinanceApplication"
};
