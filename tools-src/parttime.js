/* 알바 급여 계산기 — 페이지 스펙 (단계형 마법사) */
module.exports = {
  id: "parttime",
  title: "알바 급여 계산기 - 주휴수당 포함 시급·주급·월급 실수령 | 건강흐름",
  description: "시급과 근무시간을 단계별로 넣으면 주휴수당 포함 주급·월급과 세금 공제 후 실수령액을 계산합니다. 올해 최저시급 자동 표시, 미달 경고.",
  keywords: "알바 급여 계산기, 주휴수당 계산, 시급 계산기, 최저시급, 아르바이트 월급, 주급",
  subtitle: "주휴수당·가산수당·세금까지 단계별로 계산",
  intro: '<p>아래 질문에 차례로 답하면 <strong>주휴수당 포함 실수령액</strong>을 계산합니다. (최저시급 미달 시 경고가 표시됩니다)</p>',
  inputsHtml:
    '<div class="wizard-steps" id="wizDots"></div>' +

    '<div class="wiz-step" data-step="1">' +
    '<div class="field"><label for="wage">시급</label>' +
    '<div class="input-unit"><input type="text" id="wage" data-num data-share inputmode="numeric" placeholder="예: 10,320"><span class="unit">원</span></div>' +
    '<small class="hint" id="minWageNote"></small><p class="error" id="wageWarn" role="alert"></p></div></div>' +

    '<div class="wiz-step" data-step="2" hidden>' +
    '<div class="field"><label for="daily">하루 근무시간</label>' +
    '<div class="input-unit"><input type="text" id="daily" data-share inputmode="decimal" placeholder="예: 8"><span class="unit">시간</span></div></div>' +
    '<div class="field"><label for="rest">하루 휴게시간 <span class="hint">(무급, 보통 점심)</span></label>' +
    '<div class="input-unit"><input type="text" id="rest" data-share inputmode="decimal" placeholder="예: 1"><span class="unit">시간</span></div></div></div>' +

    '<div class="wiz-step" data-step="3" hidden>' +
    '<div class="field"><label for="days">주 근무일수</label>' +
    '<div class="input-unit"><input type="text" id="days" data-share inputmode="numeric" placeholder="예: 5"><span class="unit">일</span></div></div></div>' +

    '<div class="wiz-step" data-step="4" hidden>' +
    '<p class="hint" style="margin:0 0 10px">주당 추가 근무가 있으면 입력하세요(없으면 비워두기).</p>' +
    '<div class="field"><label for="overH">주 연장근로</label><div class="input-unit"><input type="text" id="overH" data-share inputmode="decimal" placeholder="0"><span class="unit">시간</span></div></div>' +
    '<div class="field"><label for="nightH">주 야간근로 <span class="hint">(22시~06시)</span></label><div class="input-unit"><input type="text" id="nightH" data-share inputmode="decimal" placeholder="0"><span class="unit">시간</span></div></div>' +
    '<div class="field"><label for="holidayH">주 휴일근로</label><div class="input-unit"><input type="text" id="holidayH" data-share inputmode="decimal" placeholder="0"><span class="unit">시간</span></div></div></div>' +

    '<div class="wiz-step" data-step="5" hidden>' +
    '<div class="field"><label for="over5">5인 이상 사업장인가요? <span class="hint">(가산수당 1.5배 적용 여부)</span></label>' +
    '<select id="over5" data-share><option value="yes">예 (5인 이상)</option><option value="no">아니오 (5인 미만)</option></select></div></div>' +

    '<div class="wiz-step" data-step="6" hidden>' +
    '<div class="field"><label for="taxMode">세금 공제</label>' +
    '<select id="taxMode" data-share><option value="none">공제 없음</option><option value="33">3.3% 원천징수</option><option value="4insure">4대보험</option></select></div></div>' +

    '<div class="wizard-nav"><button type="button" class="btn-sm" id="wizPrev" hidden>이전</button>' +
    '<button type="button" class="btn-primary" id="wizNext" style="flex:1">다음</button></div>',
  resultHtml: '<div id="ptResult"></div>',
  method:
    '<p><strong>기본급</strong> = 주 소정근로시간 × 시급. 주 소정근로시간 = (하루 근무 − 휴게) × 근무일수.</p>' +
    '<p><strong>주휴수당</strong>(주 15시간 이상): (주 소정근로시간 ÷ 40) × 8 × 시급, 최대 8시간분.</p>' +
    '<p><strong>가산수당</strong>(5인 이상): 연장·야간·휴일 근로는 1.5배(통상임금의 50% 가산). 5인 미만은 가산 없이 1배.</p>' +
    '<table class="calc-table"><thead><tr><th>구분</th><th>가산율</th></tr></thead><tbody>' +
    '<tr><td>연장근로</td><td>50% 가산(5인 이상)</td></tr><tr><td>야간근로(22~06시)</td><td>50% 가산(5인 이상)</td></tr><tr><td>휴일근로</td><td>50% 가산(5인 이상)</td></tr></tbody></table>' +
    '<p>월 환산은 주급 × 평균 주수(약 4.345주)로 추정합니다.</p>',
  learnMore: [
    { h: "근로계약서 작성", p: "근무를 시작하면 시급·근로시간·주휴·수당을 적은 근로계약서를 서면으로 받는 것이 원칙입니다. 교부하지 않으면 사업주에게 과태료가 부과될 수 있습니다." },
    { h: "세금 환급 받는 법", p: "3.3%를 뗀 경우 다음 해 5월 종합소득세 신고로 대부분 환급됩니다. 소득이 적은 학생·알바는 환급 가능성이 높습니다." },
    { h: "임금체불 신고", p: "급여를 못 받았다면 고용노동부 ‘임금체불 진정’으로 신고할 수 있습니다. 근로계약서·출근기록·급여내역을 모아 두세요." }
  ],
  faqs: [
    { q: "주휴수당은 언제 받나요?", a: "1주 소정근로시간이 15시간 이상이고 그 주에 정해진 근무일을 모두 개근하면 하루치 임금을 주휴수당으로 추가로 받습니다." },
    { q: "주휴수당 계산식은?", a: "(1주 소정근로시간 ÷ 40) × 8 × 시급이며, 최대 8시간분입니다. 예를 들어 주 20시간이면 20÷40×8=4시간분이 주휴수당입니다." },
    { q: "세금은 꼭 떼나요?", a: "사업장 형태에 따라 3.3% 원천징수 또는 4대보험이 공제됩니다. 단기·소액이면 공제가 없을 수도 있습니다. 세 가지 경우를 모두 계산해 볼 수 있습니다." },
    { q: "가산수당은 누구나 받나요?", a: "연장·야간·휴일근로 1.5배 가산은 상시근로자 5인 이상 사업장에만 적용됩니다. 5인 미만은 가산 없이 실제 근로시간만큼 지급합니다." },
    { q: "수습기간에는 최저임금보다 적게 받나요?", a: "1년 이상 근로계약을 맺고 수습 3개월 이내인 경우 최저임금의 90%까지 감액이 가능합니다. 단순노무직은 수습 감액이 적용되지 않습니다." },
    { q: "4대보험은 알바도 가입하나요?", a: "월 60시간(주 15시간) 이상 등 요건을 충족하면 가입 대상입니다. 요건 미만이면 산재만 적용되는 경우가 많습니다." },
    { q: "5인 미만 사업장은 뭐가 다른가요?", a: "연장·야간·휴일 가산수당, 연차휴가 등 일부 규정이 적용되지 않습니다. 다만 주휴수당과 최저임금은 5인 미만에도 적용됩니다." },
    { q: "월급은 왜 주급 × 4.345인가요?", a: "1년 52주를 12개월로 나누면 월평균 약 4.345주가 됩니다. 매월 근무일수가 달라 평균값으로 환산한 추정치입니다." }
  ],
  sources: [
    { name: "최저임금위원회", url: "https://www.minimumwage.go.kr" },
    { name: "고용노동부 — 근로기준·주휴수당", url: "https://www.moel.go.kr" },
    { name: "국가법령정보센터 — 근로기준법", url: "https://www.law.go.kr/법령/근로기준법" }
  ],
  appCategory: "FinanceApplication"
};
