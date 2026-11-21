/* 평 ↔ 제곱미터 변환기 — 페이지 스펙 */
module.exports = {
  id: "pyeong",
  title: "평 제곱미터 변환기 - 평↔㎡ 계산(평수별 ㎡ 표) | 건강흐름",
  description: "평과 제곱미터(㎡)를 양방향으로 즉시 변환합니다. 1평=약 3.3058㎡. 아파트 분양에서 자주 쓰는 평수별 ㎡를 표로 제공, 전용·공급 면적 이해에 도움.",
  keywords: "평 제곱미터 변환, 평수 계산기, 평 ㎡ 변환, 제곱미터 평 계산, 24평 몇 제곱미터, 전용면적 평수",
  subtitle: "평과 제곱미터를 즉시 양방향 변환",
  intro: '<p>한쪽에 숫자를 입력하면 다른 쪽이 바로 바뀝니다. <strong>1평 = 약 3.3058㎡</strong>(정확히는 400/121㎡)로 계산합니다.</p>',
  inputsHtml:
    '<div class="field"><label for="pyeong">평</label>' +
    '<div class="input-unit"><input type="text" id="pyeong" data-share inputmode="decimal" placeholder="예: 24"><span class="unit">평</span></div></div>' +
    '<div class="field" style="text-align:center;color:var(--muted);font-size:1.3rem;margin:-4px 0">⇅</div>' +
    '<div class="field"><label for="m2">제곱미터</label>' +
    '<div class="input-unit"><input type="text" id="m2" inputmode="decimal" placeholder="예: 79.34"><span class="unit">㎡</span></div></div>' +
    '<p id="pyNote" class="hint" style="margin:6px 2px 0;min-height:1.2em"></p>',
  resultHtml: '<h3 style="margin:4px 0 6px;font-size:.95rem">평수별 제곱미터</h3><div id="pyRef"></div>',
  method:
    '<p>평은 한국에서 넓이를 재던 전통 단위입니다.</p>' +
    '<ul><li>1평 = 6자 × 6자, 1자 = 10/33m 이므로 <strong>1평 = 400/121 ≈ 3.3058㎡</strong></li>' +
    '<li>반대로 <strong>1㎡ = 121/400 ≈ 0.3025평</strong></li></ul>' +
    '<p>부동산 표기는 법적으로 ㎡를 쓰지만, 일상에서는 평을 많이 씁니다. ‘전용면적’은 실제 사용하는 집 안 면적, ‘공급(분양)면적’은 전용면적에 계단·복도 등 주거공용면적을 더한 값입니다. 흔히 말하는 ‘24평·34평’은 공급면적 기준인 경우가 많습니다.</p>',
  learnMore: [
    { h: "전용면적 vs 공급면적", p: "전용면적은 현관 안쪽 우리 집만의 면적이고, 공급면적은 전용면적에 복도·계단 같은 주거공용면적을 더한 것입니다. ‘국민주택 85㎡’는 전용면적 기준입니다." },
    { h: "왜 59㎡·84㎡가 많을까", p: "전용 59㎡는 옛 25평형, 84㎡는 옛 34평형에 해당해 수요가 많습니다. 전용 85㎡ 이하는 국민주택 규모로 세제·청약에서 기준이 됩니다." },
    { h: "분양평수와 실제 평수", p: "분양 평수(공급면적)는 전용면적보다 큽니다. 전용률(전용/공급)이 높을수록 같은 평수라도 실제 쓰는 공간이 넓습니다. 보통 아파트 전용률은 70~80%대입니다." }
  ],
  faqs: [
    { q: "1평은 몇 제곱미터인가요?", a: "1평은 약 3.3058㎡입니다. 정확히는 400/121㎡이며, 반대로 1㎡는 약 0.3025평입니다." },
    { q: "24평은 몇 ㎡인가요?", a: "24평은 약 79.34㎡입니다. 다만 분양 24평형은 공급면적 기준이라 전용면적은 59㎡ 안팎인 경우가 많습니다." },
    { q: "전용 84㎡는 몇 평인가요?", a: "전용 84㎡는 약 25.4평입니다. 보통 ‘34평형’으로 분양되며, 이는 공용면적을 더한 공급면적 기준 평수입니다." },
    { q: "부동산은 왜 ㎡로 표기하나요?", a: "2007년부터 법정 계량단위로 ㎡ 사용이 의무화되어 계약서·등기부에는 ㎡로 적습니다. 평은 참고용으로 함께 표기하는 경우가 많습니다." },
    { q: "평수로 집 크기를 가늠하려면?", a: "공급면적 기준 평수는 복도·계단이 포함돼 체감보다 큽니다. 실제 생활 공간은 전용면적(㎡)을 평으로 바꿔 보는 것이 정확합니다." }
  ],
  sources: [
    { name: "국가법령정보센터 — 계량에 관한 법률(법정단위 ㎡)", url: "https://www.law.go.kr/법령/계량에관한법률" },
    { name: "국토교통부 — 주택 면적 용어 안내", url: "https://www.molit.go.kr" }
  ],
  appCategory: "UtilitiesApplication"
};
