/* 체지방률·표준체중 계산기 — 순수 함수.
   체지방률(추정): Deurenberg(1991) BF% = 1.2×BMI + 0.23×나이 − 10.8×성별(남1,여0) − 5.4.
   표준체중: BMI 22 기준 = 키(m)²×22. 적정범위: BMI 18.5~22.9. */
(function () {
  "use strict";
  var BANDS = {
    male: [{ max: 10, label: "낮음", color: "#3b82f6" }, { max: 20, label: "정상", color: "#1f9d57" }, { max: 25, label: "주의(경계)", color: "#eab308" }, { max: Infinity, label: "비만", color: "#ef4444" }],
    female: [{ max: 18, label: "낮음", color: "#3b82f6" }, { max: 28, label: "정상", color: "#1f9d57" }, { max: 30, label: "주의(경계)", color: "#eab308" }, { max: Infinity, label: "비만", color: "#ef4444" }]
  };
  function bmiOf(kg, cm) { var m = cm / 100; return kg / (m * m); }
  function standardWeight(cm) { var m = cm / 100; return m * m * 22; }
  function healthyRange(cm) { var m = cm / 100; return { min: 18.5 * m * m, max: 22.9 * m * m }; }
  function bodyFat(bmi, age, sex) { return 1.2 * bmi + 0.23 * age - 10.8 * (sex === "male" ? 1 : 0) - 5.4; }
  function bfCategory(bf, sex) { var B = BANDS[sex] || BANDS.male; for (var i = 0; i < B.length; i++) if (bf < B[i].max) return B[i]; return B[B.length - 1]; }

  var LOGIC = { bmiOf: bmiOf, standardWeight: standardWeight, healthyRange: healthyRange, bodyFat: bodyFat, bfCategory: bfCategory, BANDS: BANDS };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function d1(n) { return Number(n).toLocaleString("ko-KR", { maximumFractionDigits: 1 }); }
  var sex = "male";
  function setSex(s) { sex = s; document.querySelectorAll("[data-sex]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-sex") === s); }); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var h = TK.num("height"), w = TK.num("weight"), age = TK.num("age");
    if (isNaN(h) || isNaN(w) || isNaN(age) || h <= 0 || w <= 0 || age <= 0) { err.textContent = "키·몸무게·나이를 입력하세요."; return; }
    if (h < 80 || h > 250) { err.textContent = "키는 cm 단위로 입력하세요. (예: 170)"; return; }
    var bmi = bmiOf(w, h), bf = bodyFat(bmi, age, sex), cat = bfCategory(bf, sex);
    var std = standardWeight(h), hr = healthyRange(h);
    var fatMass = w * bf / 100, leanMass = w - fatMass;
    var diff = w - std;

    document.getElementById("bfResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + d1(Math.max(0, bf)) + '</span><small>% 체지방률</small></div>' +
      '<p class="result-sub"><span style="display:inline-block;padding:2px 12px;border-radius:999px;color:#fff;background:' + cat.color + '">' + cat.label + '</span></p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>체지방률(추정)</th><td>' + d1(Math.max(0, bf)) + ' %</td></tr>' +
      '<tr><th>체지방량 / 제지방량</th><td>' + d1(Math.max(0, fatMass)) + ' kg / ' + d1(leanMass) + ' kg</td></tr>' +
      '<tr><th>표준체중(BMI 22)</th><td>' + d1(std) + ' kg</td></tr>' +
      '<tr><th>적정체중 범위</th><td>' + d1(hr.min) + ' ~ ' + d1(hr.max) + ' kg</td></tr>' +
      '<tr><th>표준체중 대비</th><td>' + (diff >= 0 ? '+' : '') + d1(diff) + ' kg</td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 체지방률은 Deurenberg 공식(BMI·나이·성별 기반) 추정치입니다. 근육량이 많으면 실제보다 높게 나올 수 있어, 정확한 값은 체성분 측정(인바디 등)으로 확인하세요. 비만 기준: 남 25%↑·여 30%↑.</p>';
    TK.showResult();
  }

  document.querySelectorAll("[data-sex]").forEach(function (b) { b.addEventListener("click", function () { setSex(b.getAttribute("data-sex")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setSex("male");
  if (location.search) window.ToolKit.ready(calc);
})();
