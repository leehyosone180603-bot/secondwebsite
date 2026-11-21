/* BMI 계산기 — 순수 함수 + 대한비만학회(아시아-태평양) 기준 분류.
   BMI = 몸무게(kg) / 키(m)². 분류: 저체중<18.5 / 정상18.5~22.9 / 비만전단계23~24.9 /
   1단계25~29.9 / 2단계30~34.9 / 3단계(고도)≥35. */
(function () {
  "use strict";
  var BANDS = [
    { max: 18.5, label: "저체중", color: "#3b82f6" },
    { max: 23, label: "정상", color: "#1f9d57" },
    { max: 25, label: "비만 전단계", color: "#eab308" },
    { max: 30, label: "1단계 비만", color: "#f97316" },
    { max: 35, label: "2단계 비만", color: "#ef4444" },
    { max: Infinity, label: "3단계 비만 (고도비만)", color: "#b91c1c" }
  ];
  function bmi(kg, cm) { var m = cm / 100; return kg / (m * m); }
  function bmiCategory(b) { for (var i = 0; i < BANDS.length; i++) if (b < BANDS[i].max) return BANDS[i]; return BANDS[BANDS.length - 1]; }
  function healthyRange(cm) { var m = cm / 100; return { min: 18.5 * m * m, max: 22.9 * m * m }; }

  var LOGIC = { bmi: bmi, bmiCategory: bmiCategory, healthyRange: healthyRange, BANDS: BANDS };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function d1(n) { return Number(n).toLocaleString("ko-KR", { maximumFractionDigits: 1 }); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var h = TK.num("height"), w = TK.num("weight");
    if (isNaN(h) || isNaN(w) || h <= 0 || w <= 0) { err.textContent = "키와 몸무게를 입력하세요."; return; }
    if (h < 80 || h > 250) { err.textContent = "키는 cm 단위로 입력하세요. (예: 170)"; return; }
    var b = bmi(w, h), cat = bmiCategory(b), hr = healthyRange(h);

    var tableRows = BANDS.map(function (band, i) {
      var lo = i === 0 ? 0 : BANDS[i - 1].max;
      var range = band.max === Infinity ? (lo + " 이상") : (lo + " ~ " + (band.max - 0.1).toFixed(1));
      var on = band.label === cat.label;
      return '<tr' + (on ? ' style="font-weight:700;background:rgba(59,91,219,.08)"' : '') + '><td>' + (on ? '▶ ' : '') + band.label + '</td><td>' + range + '</td></tr>';
    }).join("");

    document.getElementById("bmiResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + d1(b) + '</span><small>BMI</small></div>' +
      '<p class="result-sub"><span style="display:inline-block;padding:2px 12px;border-radius:999px;color:#fff;background:' + cat.color + '">' + cat.label + '</span></p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>내 BMI</th><td>' + d1(b) + '</td></tr>' +
      '<tr><th>판정</th><td>' + cat.label + '</td></tr>' +
      '<tr><th>정상 체중 범위</th><td>' + d1(hr.min) + ' ~ ' + d1(hr.max) + ' kg</td></tr>' +
      '</tbody></table>' +
      '<h3 style="margin:16px 0 6px;font-size:.95rem">대한비만학회 BMI 분류(아시아-태평양)</h3>' +
      '<table class="calc-table"><thead><tr><th>단계</th><th>BMI(kg/㎡)</th></tr></thead><tbody>' + tableRows + '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ BMI는 근육량·체지방을 구분하지 못합니다. 운동선수 등은 실제와 다를 수 있으니 참고용으로 사용하고, 건강 상담은 의료진과 하세요.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
