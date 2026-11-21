/* 하루 물 섭취량 계산기 — 페이지 스펙 */
module.exports = {
  id: "water-intake",
  title: "하루 물 섭취량 계산기 - 체중별 권장 수분량·물 몇 잔 | 건강흐름",
  description: "체중과 운동량으로 하루 권장 물 섭취량을 계산합니다. 체중 1kg당 약 30~35mL 기준, 200mL 컵으로 몇 잔인지, 운동 시 추가량까지 알려줍니다.",
  keywords: "물 섭취량 계산기, 하루 물 권장량, 수분 섭취량, 물 몇 잔, 체중별 물, 하루 물 2리터",
  subtitle: "체중·운동량으로 하루 권장 수분량",
  intro: '<p>체중 1kg당 약 <strong>30~35mL</strong>를 기준으로 하루 권장 물 섭취량을 계산합니다. 운동을 하면 땀으로 빠진 만큼 더 마셔야 합니다.</p>',
  inputsHtml:
    '<div class="field"><label for="weight">체중</label>' +
    '<div class="input-unit"><input type="text" id="weight" data-share inputmode="decimal" placeholder="예: 65"><span class="unit">kg</span></div></div>' +
    '<div class="field"><label for="exercise">하루 운동 시간 <span class="hint">(없으면 0)</span></label>' +
    '<div class="input-unit"><input type="text" id="exercise" data-share inputmode="numeric" value="0" placeholder="예: 30"><span class="unit">분</span></div></div>',
  resultHtml: '<div id="wiResult"></div>',
  method:
    '<p>하루 물 섭취량은 체중에 비례해 계산합니다.</p>' +
    '<ul><li><strong>기본 권장량</strong> = 체중(kg) × 33mL (범위 30~35mL)</li>' +
    '<li><strong>운동 보정</strong> = 운동 30분당 약 350mL 추가</li>' +
    '<li>1잔 = 200mL 기준으로 몇 잔인지 환산</li></ul>' +
    '<p>예로 체중 65kg이면 하루 약 2,145mL(약 11잔)가 기본 권장량입니다. 음식이나 국·음료에도 수분이 있으므로, 순수하게 마시는 물은 이보다 조금 적어도 됩니다.</p>',
  learnMore: [
    { h: "‘하루 2리터’는 누구에게나 맞나요", p: "체중·활동량·기후에 따라 다릅니다. 체중이 가벼우면 2리터가 많을 수 있고, 운동을 많이 하거나 더운 곳에 있으면 더 필요합니다. 체중 기준으로 계산하는 편이 정확합니다." },
    { h: "음식 속 수분도 포함", p: "하루 수분의 20~30%는 음식(국·과일·채소 등)에서 옵니다. 그래서 계산된 양을 전부 ‘물’로만 마실 필요는 없고, 음료·식사를 합쳐 채우면 됩니다." },
    { h: "물 너무 많이 마셔도 문제", p: "짧은 시간에 지나치게 많은 물을 마시면 저나트륨혈증(물 중독) 위험이 있습니다. 한 번에 몰아 마시지 말고 하루에 나눠 조금씩 마시는 것이 좋습니다." }
  ],
  faqs: [
    { q: "하루에 물 얼마나 마셔야 하나요?", a: "보통 체중 1kg당 30~35mL입니다. 60kg이면 약 1,800~2,100mL입니다. 운동량이 많으면 더 마셔야 합니다." },
    { q: "물 2리터는 몇 잔인가요?", a: "200mL 컵 기준 10잔입니다. 종이컵(약 180mL)으로는 약 11잔입니다." },
    { q: "커피·차도 수분으로 치나요?", a: "대부분 수분으로 포함됩니다. 다만 카페인은 이뇨 작용이 있어, 물을 일부 대체하되 전부 대신하지는 않는 것이 좋습니다." },
    { q: "운동하면 얼마나 더 마시나요?", a: "땀 배출량에 따라 다르지만 보통 운동 30분당 약 350mL를 추가로 봅니다. 격한 운동이나 더운 날엔 더 필요합니다." },
    { q: "신장질환이 있어도 같은가요?", a: "아닙니다. 신장질환·심부전 등이 있으면 수분 제한이 필요할 수 있습니다. 반드시 담당 의료진의 지침을 따르세요." }
  ],
  sources: [
    { name: "질병관리청 국가건강정보포털 — 수분 섭취", url: "https://health.kdca.go.kr" },
    { name: "보건복지부·한국영양학회 — 한국인 영양소 섭취기준(수분)", url: "https://www.mohw.go.kr" }
  ],
  appCategory: "HealthApplication"
};
