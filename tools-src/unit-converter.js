/* 단위 변환기 — 페이지 스펙 */
module.exports = {
  id: "unit-converter",
  title: "단위 변환기 - 길이·무게·넓이·부피·온도·속도 변환 | 건강흐름",
  description: "길이(cm·m·인치·피트), 무게(kg·g·파운드·근·돈), 넓이(㎡·평·헥타르), 부피(L·갤런·되·말), 온도(℃·℉·K), 속도(km/h·mph·노트)를 서로 바로 변환합니다.",
  keywords: "단위 변환기, 길이 변환, 무게 변환, 인치 cm 변환, 파운드 kg, 섭씨 화씨 변환, 마일 km",
  subtitle: "길이·무게·넓이·부피·온도·속도를 한 번에",
  intro: '<p>변환할 종류를 고르고 값을 입력하면 즉시 바뀝니다. 국제단위(SI) 기준 정확한 계수로 계산합니다.</p>',
  inputsHtml:
    '<div class="field"><label>변환 종류</label><div class="result-actions" style="margin-top:0;flex-wrap:wrap">' +
    '<button type="button" class="btn-sm" data-cat="length" aria-pressed="true">길이</button>' +
    '<button type="button" class="btn-sm" data-cat="weight">무게</button>' +
    '<button type="button" class="btn-sm" data-cat="area">넓이</button>' +
    '<button type="button" class="btn-sm" data-cat="volume">부피</button>' +
    '<button type="button" class="btn-sm" data-cat="temp">온도</button>' +
    '<button type="button" class="btn-sm" data-cat="speed">속도</button></div></div>' +
    '<div class="field"><label for="fromValue">변환할 값</label>' +
    '<div style="display:flex;gap:8px"><input type="text" id="fromValue" data-share inputmode="decimal" placeholder="예: 10" style="flex:1">' +
    '<select id="fromUnit" style="flex:1"></select></div></div>' +
    '<div class="field" style="text-align:center;margin:-2px 0"><button type="button" class="btn-sm" id="swapBtn">⇅ 단위 교환</button></div>' +
    '<div class="field"><label for="toValue">변환 결과</label>' +
    '<div style="display:flex;gap:8px"><input type="text" id="toValue" readonly style="flex:1;background:var(--bg)">' +
    '<select id="toUnit" style="flex:1"></select></div></div>' +
    '<p id="ucNote" class="hint" style="margin:6px 2px 0;min-height:1.2em"></p>',
  resultHtml: '',
  method:
    '<p>모든 변환은 종류별 기준단위로 바꾼 뒤 목표 단위로 환산합니다.</p>' +
    '<ul><li>길이: 1inch=2.54cm, 1ft=30.48cm, 1mile=1.609344km</li>' +
    '<li>무게: 1lb=453.59237g, 1oz≈28.35g, 1근=600g, 1돈=3.75g</li>' +
    '<li>넓이: 1평=400/121㎡≈3.3058㎡, 1헥타르=10,000㎡</li>' +
    '<li>부피: 1갤런(US)=3.785L, 1되=1.8L, 1말=18L</li>' +
    '<li>온도: ℉ = ℃×9/5+32, K = ℃+273.15</li>' +
    '<li>속도: 1km/h=1/3.6 m/s, 1mph=0.44704 m/s, 1노트=0.5144 m/s</li></ul>',
  learnMore: [
    { h: "근·돈·되·말은 뭔가요", p: "한국 전통 단위입니다. 고기 1근은 보통 600g, 금 1돈은 3.75g입니다. 되(1.8L)·말(18L)은 곡식·액체 부피에 쓰입니다." },
    { h: "미국 단위가 헷갈릴 때", p: "인치·피트·마일(길이), 온스·파운드(무게), 갤런(부피), 화씨(온도)는 미국에서 주로 씁니다. 해외 직구·여행 때 이 변환기로 바꿔 보세요." },
    { h: "넓이 단위 평과 ㎡", p: "부동산은 ㎡가 법정 단위지만 평을 함께 씁니다. 평 전용 변환은 ‘평↔제곱미터 변환기’에서 평수별 표까지 볼 수 있습니다." }
  ],
  faqs: [
    { q: "1인치는 몇 cm인가요?", a: "1인치는 정확히 2.54cm입니다. 반대로 1cm는 약 0.3937인치입니다." },
    { q: "1파운드는 몇 kg인가요?", a: "1파운드(lb)는 약 0.4536kg(453.6g)입니다. 1kg은 약 2.205파운드입니다." },
    { q: "섭씨를 화씨로 바꾸려면?", a: "화씨 = 섭씨 × 9/5 + 32입니다. 예로 36.5℃는 97.7℉입니다. ‘온도’를 선택해 바로 변환할 수 있습니다." },
    { q: "고기 1근은 몇 그램인가요?", a: "식육(고기)의 1근은 보통 600g입니다. 다만 채소·곡물은 375g을 1근으로 보기도 해 품목에 따라 다를 수 있습니다." },
    { q: "1마일은 몇 km인가요?", a: "1마일은 약 1.609km입니다. 10마일은 약 16.09km, 반대로 1km는 약 0.621마일입니다." }
  ],
  sources: [
    { name: "국가기술표준원 — 법정계량단위(국제단위계 SI)", url: "https://www.kats.go.kr" },
    { name: "한국표준과학연구원(KRISS) — 단위 환산", url: "https://www.kriss.re.kr" }
  ],
  appCategory: "UtilitiesApplication"
};
