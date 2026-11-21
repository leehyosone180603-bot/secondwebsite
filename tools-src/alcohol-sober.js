/* 음주 알코올 분해시간 계산기 — 페이지 스펙 */
module.exports = {
  id: "alcohol-sober",
  title: "음주 알코올 분해시간 계산기 - 혈중알코올농도·운전가능 시간 | 건강흐름",
  description: "음주량·체중·성별로 예상 혈중알코올농도(BAC)와 술이 깨어 운전 가능해지는 시간을 위드마크 공식으로 추정합니다. 면허정지 0.03%·취소 0.08% 기준 안내.",
  keywords: "알코올 분해시간, 혈중알코올농도 계산, 위드마크 공식, 술 깨는 시간, 음주운전 기준, 숙취 운전",
  subtitle: "혈중알코올농도와 술 깨는 시간 추정",
  intro: '<p>음주량·체중·성별로 <strong>예상 혈중알코올농도</strong>와 <strong>운전 가능해지는 시간</strong>을 위드마크 공식으로 추정합니다. 면허정지 기준은 0.03%, 취소는 0.08%입니다.</p>',
  inputsHtml:
    '<div class="field"><label>성별</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-sex="male" aria-pressed="true">남성</button>' +
    '<button type="button" class="btn-sm" data-sex="female">여성</button></div></div>' +
    '<div class="field"><label for="weight">체중</label>' +
    '<div class="input-unit"><input type="text" id="weight" data-share inputmode="decimal" placeholder="예: 70"><span class="unit">kg</span></div></div>' +
    '<div class="field"><label for="drink">주종</label>' +
    '<select id="drink" data-share>' +
    '<option value="soju">소주 (17%)</option>' +
    '<option value="beer">맥주 (4.5%)</option>' +
    '<option value="makgeolli">막걸리 (6%)</option>' +
    '<option value="wine">와인 (12%)</option>' +
    '<option value="whisky">위스키 (40%)</option>' +
    '<option value="custom">직접 입력</option>' +
    '</select></div>' +
    '<div class="field" id="abvRow" style="display:none"><label for="abv">도수</label>' +
    '<div class="input-unit"><input type="text" id="abv" data-share inputmode="decimal" placeholder="예: 17"><span class="unit">%</span></div></div>' +
    '<div class="field"><label for="amount">마신 양 <span class="hint">(소주 1병 360mL · 맥주 500mL · 소주 1잔 50mL)</span></label>' +
    '<div class="input-unit"><input type="text" id="amount" data-num data-share inputmode="numeric" placeholder="예: 360"><span class="unit">mL</span></div></div>',
  resultHtml: '<div id="asResult"></div>',
  method:
    '<p>위드마크(Widmark) 공식으로 혈중알코올농도를 추정합니다.</p>' +
    '<ul><li><strong>섭취 알코올량(g)</strong> = 마신 양(mL) × 도수(%)÷100 × 0.7894(알코올 비중)</li>' +
    '<li><strong>혈중알코올농도(%)</strong> = 알코올량 ÷ (체중kg × 성별계수) ÷ 10 (남 0.68, 여 0.55)</li>' +
    '<li><strong>분해 시간</strong> = 혈중알코올농도 ÷ 0.015(시간당 분해량)</li></ul>' +
    '<p>예로 70kg 남성이 소주 1병(360mL)을 마시면 약 0.1%로 추정되며, 완전히 분해되는 데 약 6~7시간이 걸립니다. 실제로는 체질·공복·수면·건강 상태에 따라 크게 달라집니다.</p>',
  learnMore: [
    { h: "면허 정지·취소 기준", p: "2019년 ‘제2윤창호법’ 이후 혈중알코올농도 0.03% 이상이면 면허 정지, 0.08% 이상이면 면허 취소입니다. 0.03%는 소주 한두 잔 수준이라 한 잔도 위험합니다." },
    { h: "‘술 깼다’는 느낌은 믿지 마세요", p: "잠을 자도 알코올은 시간당 약 0.015%씩만 분해됩니다. 다음 날 아침에도 농도가 남아 있는 ‘숙취 음주운전’이 많아, 전날 많이 마셨다면 아침 운전도 피해야 합니다." },
    { h: "개인차가 큽니다", p: "같은 양을 마셔도 체중·성별·체질·공복 여부·간 기능에 따라 농도와 분해 속도가 다릅니다. 이 계산기는 평균값 기반 추정일 뿐 실제 측정값이 아닙니다." }
  ],
  faqs: [
    { q: "술은 몇 시간이면 깨나요?", a: "알코올은 시간당 약 0.015%씩 분해됩니다. 혈중알코올농도가 0.1%라면 완전히 깨는 데 약 6~7시간이 걸립니다. 개인차가 크니 넉넉히 잡아야 합니다." },
    { q: "소주 1병이면 혈중알코올농도가 얼마인가요?", a: "70kg 남성 기준 약 0.1% 안팎으로 추정됩니다. 이는 면허 취소(0.08%)를 넘는 수준입니다. 체중이 가볍거나 여성이면 더 높게 나옵니다." },
    { q: "자고 일어나면 운전해도 되나요?", a: "아닙니다. 수면 중에도 분해 속도는 같아, 전날 많이 마셨다면 아침에도 농도가 남습니다. 이른바 ‘숙취 음주운전’으로 단속되는 경우가 많습니다." },
    { q: "음주운전 단속 기준은요?", a: "혈중알코올농도 0.03% 이상이면 면허 정지, 0.08% 이상이면 면허 취소입니다. 0.03%는 소주 1~2잔 정도로 매우 낮은 수준입니다." },
    { q: "이 계산기 수치를 믿고 운전해도 되나요?", a: "절대 안 됩니다. 추정값일 뿐 실제 농도와 다를 수 있습니다. 조금이라도 마셨다면 수치와 상관없이 운전하지 마세요." }
  ],
  sources: [
    { name: "도로교통공단 — 음주운전 처벌 기준", url: "https://www.koroad.or.kr" },
    { name: "경찰청 — 음주운전 단속 기준(도로교통법 제44조)", url: "https://www.police.go.kr" }
  ],
  appCategory: "HealthApplication"
};
