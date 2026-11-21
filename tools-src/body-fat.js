/* 체지방률·표준체중 계산기 — 페이지 스펙 */
module.exports = {
  id: "body-fat",
  title: "체지방률 계산기 - 체지방률 추정·표준체중·적정체중 | 건강흐름",
  description: "키·몸무게·나이·성별로 체지방률(Deurenberg 공식 추정)과 표준체중(BMI 22), 적정체중 범위, 체지방량·제지방량을 계산합니다. 남 25%·여 30% 비만 기준.",
  keywords: "체지방률 계산기, 표준체중 계산, 적정체중, 체지방량, 제지방량, 비만도 계산",
  subtitle: "체지방률 추정과 표준·적정체중 한 번에",
  intro: '<p>키·몸무게·나이·성별로 <strong>체지방률(추정)</strong>과 <strong>표준체중</strong>을 계산합니다. 체지방률은 Deurenberg 공식으로 BMI·나이·성별을 반영해 추정합니다.</p>',
  inputsHtml:
    '<div class="field"><label>성별</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-sex="male" aria-pressed="true">남성</button>' +
    '<button type="button" class="btn-sm" data-sex="female">여성</button></div></div>' +
    '<div class="field"><label for="height">키</label>' +
    '<div class="input-unit"><input type="text" id="height" data-share inputmode="decimal" placeholder="예: 170"><span class="unit">cm</span></div></div>' +
    '<div class="field"><label for="weight">몸무게</label>' +
    '<div class="input-unit"><input type="text" id="weight" data-share inputmode="decimal" placeholder="예: 65"><span class="unit">kg</span></div></div>' +
    '<div class="field"><label for="age">나이</label>' +
    '<div class="input-unit"><input type="text" id="age" data-share inputmode="numeric" placeholder="예: 30"><span class="unit">세</span></div></div>',
  resultHtml: '<div id="bfResult"></div>',
  method:
    '<p>체지방률은 Deurenberg(1991) 공식으로 추정합니다.</p>' +
    '<ul><li>체지방률(%) = 1.2×BMI + 0.23×나이 − 10.8×성별(남1, 여0) − 5.4</li>' +
    '<li>표준체중 = 키(m)² × 22 (BMI 22 기준)</li>' +
    '<li>적정체중 범위 = 키(m)² × 18.5 ~ 22.9</li>' +
    '<li>체지방량 = 몸무게 × 체지방률, 제지방량 = 몸무게 − 체지방량</li></ul>' +
    '<p>비만 기준 체지방률은 남성 25% 이상, 여성 30% 이상입니다. BMI만으로는 근육·지방을 구분할 수 없어, 체지방률을 함께 보면 체형을 더 잘 이해할 수 있습니다.</p>',
  learnMore: [
    { h: "표준체중 vs 적정체중", p: "표준체중은 BMI 22에 해당하는 한 점이고, 적정체중은 BMI 18.5~22.9 범위입니다. 이 범위 안이면 건강 체중으로 봅니다." },
    { h: "체지방률 추정의 한계", p: "Deurenberg 공식은 BMI 기반이라 근육량을 반영하지 못합니다. 근육이 많은 사람은 실제보다 높게, 마른 비만은 낮게 나올 수 있어 참고용입니다." },
    { h: "정확한 측정 방법", p: "체성분분석(인바디 등 생체전기저항), 캘리퍼(피부두겹법), DEXA 등이 더 정확합니다. 추세를 볼 때는 같은 방법·같은 조건으로 재는 것이 중요합니다." }
  ],
  faqs: [
    { q: "체지방률은 어떻게 계산하나요?", a: "이 계산기는 Deurenberg 공식으로 BMI·나이·성별을 넣어 추정합니다. 정확한 값은 인바디 같은 체성분 측정이 필요합니다." },
    { q: "표준체중은 어떻게 구하나요?", a: "키(m)의 제곱에 22를 곱합니다. 키 170cm면 1.7×1.7×22≈63.6kg입니다. BMI 22가 가장 건강한 체중으로 알려져 있습니다." },
    { q: "체지방률 몇부터 비만인가요?", a: "일반적으로 남성 25% 이상, 여성 30% 이상을 비만으로 봅니다. 남성 정상은 약 10~20%, 여성은 18~28% 범위입니다." },
    { q: "BMI는 정상인데 체지방률이 높아요", a: "‘마른 비만’일 수 있습니다. 체중은 정상이어도 근육이 적고 지방이 많은 경우로, 근력운동으로 제지방량을 늘리는 것이 좋습니다." },
    { q: "제지방량이 무엇인가요?", a: "몸무게에서 지방을 뺀 무게로, 근육·뼈·수분 등을 포함합니다. 다이어트 시 제지방량(특히 근육)을 지키며 체지방을 줄이는 것이 건강합니다." }
  ],
  sources: [
    { name: "질병관리청 국가건강정보포털 — 비만·체성분", url: "https://health.kdca.go.kr" },
    { name: "Deurenberg P et al. (1991), Br J Nutr — 체지방률 추정식", url: "https://pubmed.ncbi.nlm.nih.gov/2043597/" }
  ],
  appCategory: "HealthApplication"
};
