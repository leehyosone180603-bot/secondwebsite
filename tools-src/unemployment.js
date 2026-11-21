/* 실업급여(구직급여) 계산기 — 페이지 스펙 */
module.exports = {
  id: "unemployment",
  title: "실업급여 계산기 - 구직급여 일액·소정급여일수·총액 | 건강흐름",
  description: "평균임금·나이·고용보험 가입기간으로 2026년 실업급여(구직급여) 1일 지급액, 소정급여일수, 총 예상 수령액을 계산합니다. 상한 68,100원·하한 66,048원 자동 반영.",
  keywords: "실업급여 계산기, 구직급여 계산, 실업급여 상한액, 소정급여일수, 실업급여 일액, 실업급여 얼마",
  subtitle: "구직급여 일액·일수·총 예상 수령액",
  intro: '<p>구직급여일액 = <strong>이직 전 평균임금의 60%</strong>(2026년 하루 하한 66,048원 ~ 상한 68,100원)이며, 나이와 고용보험 가입기간에 따라 받는 일수(소정급여일수)가 정해집니다.</p>',
  inputsHtml:
    '<div class="field"><label>평균임금 입력 방식</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-mode="monthly" aria-pressed="true">월 평균임금</button>' +
    '<button type="button" class="btn-sm" data-mode="daily">1일 평균임금 직접</button></div></div>' +

    '<div class="ue-panel" data-panel="monthly">' +
    '<div class="field"><label for="monthlyPay">월 평균임금 <span class="hint">(이직 전 3개월 평균, 세전)</span></label>' +
    '<div class="input-unit"><input type="text" id="monthlyPay" data-num data-share inputmode="numeric" placeholder="예: 3,000,000"><span class="unit">원</span></div></div></div>' +

    '<div class="ue-panel" data-panel="daily" hidden>' +
    '<div class="field"><label for="dailyWage">1일 평균임금(기초일액)</label>' +
    '<div class="input-unit"><input type="text" id="dailyWage" data-num data-share inputmode="numeric" placeholder="예: 100,000"><span class="unit">원</span></div></div></div>' +

    '<div class="field"><label for="workHours">1일 소정근로시간 <span class="hint">(하한액 계산용, 보통 8)</span></label>' +
    '<div class="input-unit"><input type="text" id="workHours" data-share inputmode="numeric" value="8" placeholder="8"><span class="unit">시간</span></div></div>' +
    '<div class="field"><label for="age">이직일 현재 나이</label>' +
    '<div class="input-unit"><input type="text" id="age" data-share inputmode="numeric" placeholder="예: 35"><span class="unit">세</span></div></div>' +
    '<div class="field"><label for="insured">고용보험 가입기간(피보험기간)</label>' +
    '<select id="insured" data-share>' +
    '<option value="0.5">1년 미만</option>' +
    '<option value="2" selected>1년 이상 ~ 3년 미만</option>' +
    '<option value="4">3년 이상 ~ 5년 미만</option>' +
    '<option value="7">5년 이상 ~ 10년 미만</option>' +
    '<option value="10">10년 이상</option>' +
    '</select></div>' +
    '<div class="field"><label><input type="checkbox" id="disabled" data-share> 장애인 (50세 이상과 동일 적용)</label></div>',
  resultHtml: '<div id="ueResult"></div>',
  method:
    '<p>실업급여(구직급여)는 다음 순서로 계산합니다.</p>' +
    '<ul><li><strong>구직급여일액</strong> = 이직 전 1일 평균임금(기초일액) × 60%</li>' +
    '<li>이 값이 <strong>하한액</strong>(최저임금 80% × 1일 소정근로시간, 8시간이면 66,048원)보다 낮으면 하한액을 지급합니다.</li>' +
    '<li><strong>상한액</strong>은 하루 68,100원으로, 넘으면 상한액까지만 지급합니다.</li>' +
    '<li><strong>총 예상 수령액</strong> = 구직급여일액 × 소정급여일수</li></ul>' +
    '<p>소정급여일수는 이직일 현재 나이(50세 기준)와 고용보험 가입기간에 따라 120~270일입니다.</p>' +
    '<table class="calc-table"><thead><tr><th>가입기간</th><th>50세 미만</th><th>50세↑·장애인</th></tr></thead><tbody>' +
    '<tr><td>1년 미만</td><td>120일</td><td>120일</td></tr>' +
    '<tr><td>1~3년</td><td>150일</td><td>180일</td></tr>' +
    '<tr><td>3~5년</td><td>180일</td><td>210일</td></tr>' +
    '<tr><td>5~10년</td><td>210일</td><td>240일</td></tr>' +
    '<tr><td>10년 이상</td><td>240일</td><td>270일</td></tr></tbody></table>',
  learnMore: [
    { h: "누가 받을 수 있나요", p: "이직 전 18개월(기준기간) 중 고용보험 가입(피보험 단위기간)이 180일 이상이고, 자발적 사직이 아닌 비자발적 이직이어야 합니다. 근로 의사와 재취업 노력도 요건입니다." },
    { h: "상한·하한이 거의 붙어 있어요", p: "2026년 상한 68,100원과 8시간 하한 66,048원의 차이는 2,052원뿐입니다. 그래서 8시간 근무자는 평균임금과 무관하게 대부분 이 좁은 범위에서 일액이 정해집니다." },
    { h: "언제까지 받나요", p: "수급기간은 이직일 다음 날부터 12개월 안에서 소정급여일수만큼입니다. 기간이 지나면 남은 일수가 있어도 받지 못하니 퇴사 후 바로 신청하는 것이 좋습니다." }
  ],
  faqs: [
    { q: "실업급여는 얼마나 받나요?", a: "이직 전 평균임금의 60%를 하루 단위로 받습니다. 2026년 기준 하루 하한 66,048원(8시간)~상한 68,100원이며, 소정급여일수(120~270일)를 곱한 금액이 총 수령액입니다." },
    { q: "실업급여 상한액은 얼마인가요?", a: "2026년 1월 1일 이후 이직자는 하루 68,100원이 상한입니다. 2025년 이전 이직자는 66,000원이 적용됩니다." },
    { q: "실업급여 하한액은 얼마인가요?", a: "2026년 최저임금(시급 10,320원) 기준 1일 소정근로 8시간이면 66,048원입니다. 근로시간이 8시간보다 짧으면 비례해 줄어듭니다." },
    { q: "며칠 동안 받을 수 있나요?", a: "나이(이직일 기준 50세)와 고용보험 가입기간에 따라 120~270일입니다. 가입기간이 길고 50세 이상·장애인이면 더 오래 받습니다." },
    { q: "자발적 퇴사도 받나요?", a: "원칙적으로 받지 못합니다. 다만 임금체불, 질병, 통근 곤란, 괴롭힘 등 정당한 사유가 인정되면 예외적으로 수급할 수 있습니다. 고용센터 상담이 필요합니다." },
    { q: "이 계산기 금액이 정확한가요?", a: "평균임금·나이·가입기간에 따른 추정치입니다. 실제 지급액과 수급자격은 고용센터 판정에 따르며, 반복 수급 감액 등 개별 사정이 반영될 수 있습니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 고용보험법 제46조·제50조, 별표1", url: "https://www.law.go.kr/법령/고용보험법/제46조" },
    { name: "고용노동부 — 실업급여 안내", url: "https://www.moel.go.kr" },
    { name: "고용보험 — 실업급여 모의계산", url: "https://www.ei.go.kr" }
  ],
  appCategory: "FinanceApplication"
};
