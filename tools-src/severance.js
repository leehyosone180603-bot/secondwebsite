/* 퇴직금 계산기 — 페이지 스펙 */
module.exports = {
  id: "severance",
  title: "퇴직금 계산기 - 평균임금·퇴직소득세 반영 세후 실수령 | 건강흐름",
  description: "입사일·퇴사일과 퇴직 전 3개월 급여로 퇴직금을 계산하고, 퇴직소득세·지방소득세를 뺀 세후 실수령액을 보여줍니다. 1일 평균임금 직접 입력도 지원.",
  keywords: "퇴직금 계산기, 평균임금, 퇴직소득세, 퇴직금 세금, 세후 실수령, 근속연수공제",
  subtitle: "평균임금으로 퇴직금과 퇴직소득세까지",
  intro: '<p>퇴직금 = <strong>1일 평균임금 × 30 × (재직일수 ÷ 365)</strong>. 여기서 퇴직소득세·지방소득세를 빼 세후 실수령액을 계산합니다.</p>',
  inputsHtml:
    '<div class="field"><label>계산 방식</label><div class="result-actions" style="margin-top:0">' +
    '<button type="button" class="btn-sm" data-mode="wage" aria-pressed="true">임금 총액으로</button>' +
    '<button type="button" class="btn-sm" data-mode="direct">1일 평균임금 직접</button></div></div>' +
    '<div class="field"><label for="joinDate">입사일</label><input type="date" id="joinDate" data-share></div>' +
    '<div class="field"><label for="leaveDate">퇴사일 <span class="hint">(마지막 근무일)</span></label><input type="date" id="leaveDate" data-share></div>' +

    '<div class="sv-panel" data-panel="wage">' +
    '<div class="field"><label for="pay3">퇴직 전 3개월 급여 합계 <span class="hint">(세전)</span></label>' +
    '<div class="input-unit"><input type="text" id="pay3" data-num data-share inputmode="numeric" placeholder="예: 9,000,000"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="bonus">연간 상여금 <span class="hint">(없으면 0)</span></label>' +
    '<div class="input-unit"><input type="text" id="bonus" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div>' +
    '<div class="field"><label for="leavePay">연차수당 <span class="hint">(연간, 없으면 0)</span></label>' +
    '<div class="input-unit"><input type="text" id="leavePay" data-num data-share inputmode="numeric" value="0" placeholder="0"><span class="unit">원</span></div></div></div>' +

    '<div class="sv-panel" data-panel="direct" hidden>' +
    '<div class="field"><label for="dailyWage">1일 평균임금</label>' +
    '<div class="input-unit"><input type="text" id="dailyWage" data-num data-share inputmode="numeric" placeholder="예: 100,000"><span class="unit">원</span></div></div></div>',
  resultHtml: '<div id="svResult"></div>',
  method:
    '<p>퇴직금과 세금은 3단계로 계산합니다.</p>' +
    '<ul><li><strong>1일 평균임금</strong> = (퇴직 전 3개월 임금 + 상여×3/12 + 연차수당×3/12) ÷ 3개월 총일수</li>' +
    '<li><strong>퇴직금</strong> = 1일 평균임금 × 30 × (재직일수 ÷ 365)</li>' +
    '<li><strong>퇴직소득세</strong> = {(환산급여 − 환산급여공제) × 기본세율} ÷ 12 × 근속연수 (연분연승법)</li></ul>' +
    '<p>환산급여 = (퇴직소득 − 근속연수공제) ÷ 근속연수 × 12. 근속연수공제와 환산급여공제는 소득세법 §48을 적용합니다.</p>' +
    '<table class="calc-table"><thead><tr><th>근속연수</th><th>근속연수공제</th></tr></thead><tbody>' +
    '<tr><td>5년 이하</td><td>100만 × 연수</td></tr><tr><td>5~10년</td><td>500만 + 200만×(연수−5)</td></tr>' +
    '<tr><td>10~20년</td><td>1,500만 + 250만×(연수−10)</td></tr><tr><td>20년 초과</td><td>4,000만 + 300만×(연수−20)</td></tr></tbody></table>',
  learnMore: [
    { h: "평균임금이란?", p: "퇴직 전 3개월 동안 받은 임금 총액을 그 기간의 총일수로 나눈 하루치 임금입니다. 상여금·연차수당은 연간분을 3개월치로 환산해 더합니다." },
    { h: "퇴직소득세가 적은 이유", p: "오래 일할수록 근속연수공제와 환산급여공제가 커지고, 연분연승법으로 세율 부담을 낮춰 줍니다. 그래서 같은 금액이라도 일반 소득세보다 세금이 적습니다." },
    { h: "연금계좌로 받으면", p: "퇴직금을 IRP 등 연금계좌로 받으면 퇴직소득세가 바로 부과되지 않고 이연됩니다. 나중에 연금으로 받을 때 세금이 30~40% 감면됩니다." }
  ],
  faqs: [
    { q: "퇴직금은 어떻게 계산하나요?", a: "1일 평균임금 × 30일 × (재직일수 ÷ 365)입니다. 1일 평균임금은 퇴직 전 3개월 임금을 그 기간 일수로 나눈 값입니다." },
    { q: "1년 미만 근무도 퇴직금을 받나요?", a: "법정 퇴직금은 계속근로 1년 이상일 때 발생합니다. 1년 미만이면 지급 대상이 아닙니다." },
    { q: "퇴직소득세는 꼭 떼나요?", a: "네. 퇴직금에도 퇴직소득세와 지방소득세가 부과됩니다. 다만 근속연수가 길수록 공제가 커져 세 부담이 작습니다." },
    { q: "상여금·연차수당도 포함되나요?", a: "평균임금 계산 시 연간 상여금과 연차수당의 3개월분(×3/12)을 더합니다. 이 계산기에서 입력할 수 있습니다." },
    { q: "퇴직연금(DC·DB)은 다른가요?", a: "DB형은 이 방식과 비슷하고, DC형은 회사가 매년 적립한 금액과 운용수익으로 결정됩니다. 정확한 금액은 가입 유형에 따라 다릅니다." },
    { q: "연금계좌로 받으면 세금이 줄어드나요?", a: "IRP 등 연금계좌로 이체하면 퇴직소득세가 이연되고, 연금 수령 시 30~40% 감면됩니다. 목돈이 급하지 않다면 유리할 수 있습니다." },
    { q: "정확한 금액은 어디서 확인하나요?", a: "이 계산기는 비과세·세액공제를 뺀 추정치입니다. 정확한 금액은 회사 담당 부서나 국세청 홈택스 ‘퇴직소득 세액계산’에서 확인하세요." }
  ],
  sources: [
    { name: "고용노동부 — 퇴직급여 안내", url: "https://www.moel.go.kr" },
    { name: "국가법령정보센터 — 근로자퇴직급여 보장법", url: "https://www.law.go.kr/법령/근로자퇴직급여보장법" },
    { name: "국가법령정보센터 — 소득세법 제48조(퇴직소득공제)", url: "https://www.law.go.kr/법령/소득세법/제48조" }
  ],
  appCategory: "FinanceApplication"
};
