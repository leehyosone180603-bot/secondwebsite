/* 퍼센트 계산기 — 페이지 스펙 (생성기 입력)
   공통 기반(레지스트리·요율·tool-kit) 검증용 예시 도구. */
module.exports = {
  id: "percent",
  title: "퍼센트 계산기 - X의 Y%, 비율·증감률 바로 계산 | 건강흐름",
  description: "기준값의 몇 %, 전체 중 비율, 증감률을 바로 계산합니다. 입력값을 공유 링크로 저장해 같은 결과를 다시 열 수 있습니다.",
  keywords: "퍼센트 계산기, 비율 계산, 할인율, 증감률, 몇 퍼센트, 백분율",
  subtitle: "X의 Y%, 전체 중 비율, 증감률을 한 번에",
  intro: '<p>기준값 <strong>X</strong>와 비율 <strong>Y(%)</strong>를 넣으면 <b>X의 Y%</b>와 <b>Y% 증가·감소한 값</b>을 바로 계산합니다.</p>',
  inputsHtml:
    '<div class="field"><label for="base">기준값 X</label>' +
    '<div class="input-unit"><input type="text" id="base" data-num data-share inputmode="numeric" placeholder="예: 50,000"></div></div>' +
    '<div class="field"><label for="pct">비율 Y <span class="hint">(%)</span></label>' +
    '<div class="input-unit"><input type="text" id="pct" data-share inputmode="decimal" placeholder="예: 10"><span class="unit">%</span></div></div>',
  resultHtml:
    '<div class="result-hero"><div class="big"><span id="rMain">0</span></div><p class="result-sub" id="rExpr"></p></div>' +
    '<table class="calc-table"><tbody>' +
    '<tr><th>Y% 증가 후 (X + X·Y%)</th><td><span id="rInc"></span></td></tr>' +
    '<tr><th>Y% 감소 후 (X − X·Y%)</th><td><span id="rDec"></span></td></tr>' +
    '</tbody></table>',
  method:
    '<p>백분율은 전체를 100으로 봤을 때의 비율입니다. 기본 공식은 다음과 같습니다.</p>' +
    '<ul><li><strong>X의 Y%</strong> = X × Y ÷ 100</li>' +
    '<li><strong>Y% 증가</strong> = X + (X × Y ÷ 100)</li>' +
    '<li><strong>Y% 감소</strong> = X − (X × Y ÷ 100)</li></ul>' +
    '<p>예) 50,000원의 10% = 50,000 × 10 ÷ 100 = <strong>5,000원</strong>. 10% 할인가는 45,000원입니다.</p>',
  learnMore: [
    { h: "퍼센트(%)란?", p: "백분율은 전체를 100으로 놓았을 때 차지하는 비율입니다. 10%는 100분의 10, 즉 0.1을 뜻합니다." },
    { h: "증감률 읽는 법", p: "값이 100에서 120으로 늘면 증감률은 +20%, 120에서 100으로 줄면 약 −16.7%입니다. 기준값이 분모라는 점이 핵심입니다." },
    { h: "할인율과 할인가", p: "정가 × (1 − 할인율)이 할인가입니다. 20% 할인이면 정가의 80%를 냅니다." }
  ],
  faqs: [
    { q: "‘X의 Y%’는 어떻게 계산하나요?", a: "X × Y ÷ 100 입니다. 예를 들어 30,000의 15%는 30,000 × 15 ÷ 100 = 4,500입니다." },
    { q: "10% 할인가는 어떻게 구하나요?", a: "정가에서 ‘Y% 감소 후’ 값을 보면 됩니다. 정가 × (1 − 0.1) = 정가의 90%입니다." },
    { q: "입력한 값을 저장할 수 있나요?", a: "‘공유 링크’ 버튼을 누르면 입력값이 주소(URL)에 담깁니다. 그 링크를 열면 같은 결과가 다시 계산됩니다. 서버에 저장되지는 않습니다." }
  ],
  appCategory: "UtilitiesApplication"
};
