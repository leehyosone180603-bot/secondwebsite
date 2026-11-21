/* 기초대사량·칼로리 계산기 — 페이지 스펙 */
module.exports = {
  id: "bmr",
  title: "기초대사량 계산기 - BMR·하루 권장 칼로리(TDEE) | 건강흐름",
  description: "키·몸무게·나이·성별로 기초대사량(BMR)과 활동량별 하루 권장 칼로리(TDEE)를 Mifflin-St Jeor 공식으로 계산합니다. 다이어트·증량 목표 칼로리도 함께 제공.",
  keywords: "기초대사량 계산기, BMR 계산, 하루 권장 칼로리, TDEE 계산기, 다이어트 칼로리, 유지 칼로리",
  subtitle: "기초대사량과 활동별 하루 권장 칼로리",
  intro: '<p>성별·키·몸무게·나이로 <strong>기초대사량(BMR)</strong>을 구하고, 활동량을 곱해 <strong>하루 권장 칼로리(TDEE)</strong>를 계산합니다. (Mifflin-St Jeor 공식)</p>',
  inputsHtml:
    '<div class="field"><label>성별</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-sex="male" aria-pressed="true">남성</button>' +
    '<button type="button" class="btn-sm" data-sex="female">여성</button></div></div>' +
    '<div class="field"><label for="height">키</label>' +
    '<div class="input-unit"><input type="text" id="height" data-share inputmode="decimal" placeholder="예: 170"><span class="unit">cm</span></div></div>' +
    '<div class="field"><label for="weight">몸무게</label>' +
    '<div class="input-unit"><input type="text" id="weight" data-share inputmode="decimal" placeholder="예: 65"><span class="unit">kg</span></div></div>' +
    '<div class="field"><label for="age">나이</label>' +
    '<div class="input-unit"><input type="text" id="age" data-share inputmode="numeric" placeholder="예: 30"><span class="unit">세</span></div></div>' +
    '<div class="field"><label for="activity">활동 수준</label>' +
    '<select id="activity" data-share>' +
    '<option value="1.2">거의 안 함 (좌식 생활)</option>' +
    '<option value="1.375">가벼운 운동 (주 1~3회)</option>' +
    '<option value="1.55" selected>보통 운동 (주 3~5회)</option>' +
    '<option value="1.725">활발한 운동 (주 6~7회)</option>' +
    '<option value="1.9">매우 활발 (육체노동·선수)</option>' +
    '</select></div>',
  resultHtml: '<div id="bmrResult"></div>',
  method:
    '<p>기초대사량(BMR)은 숨쉬기·체온 유지처럼 가만히 있어도 쓰는 최소 열량입니다. Mifflin-St Jeor 공식을 사용합니다.</p>' +
    '<ul><li>남성: BMR = 10×몸무게(kg) + 6.25×키(cm) − 5×나이 + 5</li>' +
    '<li>여성: BMR = 10×몸무게(kg) + 6.25×키(cm) − 5×나이 − 161</li>' +
    '<li>하루 권장 칼로리(TDEE) = BMR × 활동계수(1.2~1.9)</li></ul>' +
    '<p>체중을 줄이려면 TDEE보다 적게(보통 −500kcal), 늘리려면 더 많이(+500kcal) 먹는 것이 기준입니다. 1kg 감량에 약 7,700kcal가 필요해, 하루 −500kcal면 일주일에 약 0.45kg 줄어듭니다.</p>',
  learnMore: [
    { h: "BMR과 TDEE 차이", p: "BMR은 아무 활동도 안 할 때의 최소 열량, TDEE는 일상 활동·운동까지 포함한 하루 총 소비 열량입니다. 다이어트 기준은 TDEE입니다." },
    { h: "활동계수 고르는 법", p: "하루 대부분 앉아 있으면 1.2, 가벼운 운동은 1.375, 주 3~5회 운동은 1.55입니다. 과대평가하면 살이 안 빠질 수 있어 보수적으로 고르는 게 좋습니다." },
    { h: "왜 Mifflin-St Jeor인가", p: "1990년 제안된 공식으로, 과거 해리스-베네딕트식보다 현대인 체형에서 더 정확하다고 평가받아 임상·영양 현장에서 널리 쓰입니다." }
  ],
  faqs: [
    { q: "기초대사량은 어떻게 계산하나요?", a: "Mifflin-St Jeor 공식으로 몸무게·키·나이·성별을 넣어 구합니다. 남성은 +5, 여성은 −161을 적용하는 점만 다릅니다." },
    { q: "하루에 몇 칼로리 먹어야 하나요?", a: "유지 기준은 TDEE(기초대사량×활동계수)입니다. 감량은 거기서 약 500kcal를 빼고, 증량은 약 500kcal를 더하는 것이 일반적입니다." },
    { q: "BMR보다 적게 먹어도 되나요?", a: "기초대사량보다 지나치게 적게 먹으면 근손실·대사 저하가 올 수 있어 권장하지 않습니다. 보통 TDEE에서 10~20% 줄이는 선이 안전합니다." },
    { q: "나이가 들면 왜 살이 찌나요?", a: "나이가 늘수록 BMR이 줄어 같은 식사량이라도 열량이 남습니다. 공식에서도 나이에 −5를 곱해 매년 기초대사량이 감소합니다." },
    { q: "근육이 많으면 달라지나요?", a: "이 공식은 체중 기준이라 근육·체지방을 구분하지 못합니다. 근육이 많으면 실제 BMR이 더 높을 수 있어 참고용으로 보세요." }
  ],
  sources: [
    { name: "질병관리청 국가건강정보포털 — 에너지 필요량", url: "https://health.kdca.go.kr" },
    { name: "Mifflin MD, St Jeor ST (1990), Am J Clin Nutr — BMR 공식", url: "https://pubmed.ncbi.nlm.nih.gov/2305711/" }
  ],
  appCategory: "HealthApplication"
};
