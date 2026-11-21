/* BMI 계산기 — 페이지 스펙 */
module.exports = {
  id: "bmi",
  title: "BMI 계산기 - 체질량지수·비만도·정상체중(대한비만학회) | 건강흐름",
  description: "키와 몸무게로 체질량지수(BMI)를 계산하고 대한비만학회 아시아-태평양 기준으로 저체중·정상·비만 단계를 판정합니다. 내 정상 체중 범위도 함께 제공.",
  keywords: "BMI 계산기, 체질량지수, 비만도 계산, 정상 체중, 비만 단계, 대한비만학회 기준",
  subtitle: "키·몸무게로 체질량지수와 비만 단계 확인",
  intro: '<p>BMI(체질량지수) = <strong>몸무게(kg) ÷ 키(m)²</strong>. 한국은 대한비만학회 기준(아시아-태평양)으로 BMI 25 이상을 비만으로 봅니다.</p>',
  inputsHtml:
    '<div class="field"><label for="height">키</label>' +
    '<div class="input-unit"><input type="text" id="height" data-share inputmode="decimal" placeholder="예: 170"><span class="unit">cm</span></div></div>' +
    '<div class="field"><label for="weight">몸무게</label>' +
    '<div class="input-unit"><input type="text" id="weight" data-share inputmode="decimal" placeholder="예: 65"><span class="unit">kg</span></div></div>',
  resultHtml: '<div id="bmiResult"></div>',
  method:
    '<p>BMI는 키 대비 몸무게로 비만 정도를 가늠하는 지표입니다.</p>' +
    '<ul><li><strong>BMI = 몸무게(kg) ÷ (키(m) × 키(m))</strong></li>' +
    '<li>예: 키 170cm·65kg → 65 ÷ (1.7×1.7) = 22.5 (정상)</li></ul>' +
    '<p>세계보건기구(WHO) 국제 기준은 비만을 BMI 30 이상으로 보지만, 아시아인은 더 낮은 BMI에서도 대사질환 위험이 커져 대한비만학회는 <strong>25 이상을 비만</strong>으로 봅니다. 이 계산기는 대한비만학회 기준을 따릅니다.</p>',
  learnMore: [
    { h: "정상 체중 범위란", p: "BMI 18.5~22.9에 해당하는 몸무게 구간입니다. 키에 이 BMI 범위를 적용해 ‘정상 체중 범위(kg)’를 계산해 보여줍니다." },
    { h: "BMI의 한계", p: "BMI는 체지방과 근육을 구분하지 못합니다. 근육이 많은 사람은 BMI가 높게 나올 수 있고, 반대로 마른 비만은 정상으로 보일 수 있습니다. 허리둘레도 함께 보는 것이 좋습니다." },
    { h: "허리둘레 기준", p: "복부비만은 남성 허리둘레 90cm 이상, 여성 85cm 이상일 때로 봅니다(대한비만학회). BMI가 정상이어도 복부비만이면 주의가 필요합니다." }
  ],
  faqs: [
    { q: "BMI는 어떻게 계산하나요?", a: "몸무게(kg)를 키(m)의 제곱으로 나눕니다. 키가 170cm면 1.7×1.7=2.89로 나눕니다. 예: 65kg ÷ 2.89 = BMI 22.5입니다." },
    { q: "BMI 몇부터 비만인가요?", a: "대한비만학회 기준으로 25 이상이 비만입니다. 23~24.9는 비만 전단계(과체중), 18.5~22.9가 정상, 18.5 미만은 저체중입니다." },
    { q: "WHO 기준과 왜 다른가요?", a: "WHO 국제 기준은 비만을 30 이상으로 봅니다. 하지만 아시아인은 더 낮은 BMI에서도 당뇨·고혈압 위험이 높아, 한국은 25 이상을 비만으로 적용합니다." },
    { q: "BMI가 정상이면 건강한가요?", a: "참고 지표일 뿐입니다. 근육·체지방·허리둘레·혈압·혈당 등을 함께 봐야 합니다. 정상 BMI여도 복부비만이나 대사이상이 있을 수 있습니다." },
    { q: "어린이·노인도 같은 기준인가요?", a: "아닙니다. 소아·청소년은 성장 상태를 반영한 성장도표 백분위수를 사용하고, 고령자는 다소 높은 BMI가 보호적일 수 있어 기준이 다릅니다. 이 계산기는 성인 기준입니다." }
  ],
  sources: [
    { name: "대한비만학회 — 비만 진료지침(BMI 분류)", url: "https://www.kosso.or.kr" },
    { name: "질병관리청 국가건강정보포털 — 비만", url: "https://health.kdca.go.kr" }
  ],
  appCategory: "HealthApplication"
};
