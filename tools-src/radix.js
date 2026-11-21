/* 진법 변환기 — 페이지 스펙 */
module.exports = {
  id: "radix",
  title: "진법 변환기 - 2·8·10·16진수 상호 변환 | 건강흐름",
  description: "2진수·8진수·10진수·16진수를 서로 변환합니다. 입력 진법을 고르고 값을 넣으면 네 가지 진법과 비트 수를 한 번에 보여줍니다.",
  keywords: "진법 변환기, 2진수 변환, 16진수 변환, 10진수 2진수, binary hex 변환, 진수 계산기",
  subtitle: "2·8·10·16진수를 한 번에 변환",
  intro: '<p>입력 진법을 고르고 값을 넣으면 <strong>2·8·10·16진수</strong>와 비트 수를 한 번에 변환해 보여줍니다.</p>',
  inputsHtml:
    '<div class="field"><label for="fromBase">입력 진법</label>' +
    '<select id="fromBase" data-share><option value="dec">10진수 (decimal)</option><option value="bin">2진수 (binary)</option><option value="oct">8진수 (octal)</option><option value="hex">16진수 (hex)</option></select></div>' +
    '<div class="field"><label for="value">값</label><input type="text" id="value" data-share inputmode="text" placeholder="예: 255" autocapitalize="characters"></div>',
  resultHtml: '<div id="rxResult"></div>',
  method:
    '<p>진법은 수를 나타내는 기준입니다.</p>' +
    '<ul><li><strong>2진수</strong>: 0·1만 사용(컴퓨터 내부)</li>' +
    '<li><strong>8진수</strong>: 0~7 사용</li>' +
    '<li><strong>10진수</strong>: 0~9 사용(일상)</li>' +
    '<li><strong>16진수</strong>: 0~9, A~F 사용(색상·메모리 주소)</li></ul>' +
    '<p>예: 10진수 255 = 2진수 11111111 = 8진수 377 = 16진수 FF입니다. 비트 수는 2진수 자릿수로, 255는 8비트입니다.</p>',
  learnMore: [
    { h: "16진수는 어디에 쓰나요", p: "색상 코드(#FF0000=빨강), 메모리 주소, 유니코드 등에 씁니다. 2진수를 4자리씩 묶으면 16진수 한 자리가 되어 표기가 간결합니다." },
    { h: "비트와 바이트", p: "2진수 한 자리가 1비트, 8비트가 1바이트입니다. 255는 8비트(1바이트)로 표현할 수 있는 가장 큰 수입니다." },
    { h: "진법 변환 원리", p: "10진수로 바꾼 뒤 목표 진법으로 나눠가며 나머지를 모으면 됩니다. 이 변환기는 그 과정을 자동으로 처리합니다." }
  ],
  faqs: [
    { q: "10진수 255는 16진수로 무엇인가요?", a: "FF입니다. 255 = 15×16 + 15이고, 15는 16진수로 F이므로 FF가 됩니다." },
    { q: "2진수 1010은 10진수로 얼마인가요?", a: "10입니다. 1010 = 8 + 0 + 2 + 0 = 10입니다." },
    { q: "입력에 잘못된 문자가 있으면요?", a: "선택한 진법에 맞지 않는 문자(예: 2진수에 2~9, 16진수에 G~Z)가 있으면 오류를 표시합니다. 유효한 숫자·문자만 입력하세요." },
    { q: "비트 수는 무엇인가요?", a: "2진수로 나타낼 때의 자릿수입니다. 예로 255는 11111111로 8자리이므로 8비트입니다." }
  ],
  sources: [],
  appCategory: "DeveloperApplication"
};
