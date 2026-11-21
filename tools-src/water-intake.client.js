/* 하루 물 섭취량 계산기 — 순수 함수.
   권장량 = 체중(kg) × 33mL (범위 30~35mL), 운동 30분당 약 350mL 추가. 1잔 = 200mL. */
(function () {
  "use strict";
  var PER_KG = 33, MIN_KG = 30, MAX_KG = 35, EX_PER_30MIN = 350, CUP = 200;
  function waterIntake(weightKg, exerciseMin) {
    var base = Math.round(weightKg * PER_KG);
    var exercise = Math.round((Math.max(0, exerciseMin || 0) / 30) * EX_PER_30MIN);
    return { base: base, min: Math.round(weightKg * MIN_KG), max: Math.round(weightKg * MAX_KG), exercise: exercise, total: base + exercise };
  }

  var LOGIC = { waterIntake: waterIntake, CUP: CUP };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(n); }
  function liter(ml) { return (ml / 1000).toLocaleString("ko-KR", { maximumFractionDigits: 2 }); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var w = TK.num("weight");
    if (isNaN(w) || w <= 0) { err.textContent = "체중을 입력하세요."; return; }
    if (w > 300) { err.textContent = "체중을 kg 단위로 입력하세요."; return; }
    var ex = TK.num("exercise"); if (isNaN(ex)) ex = 0;
    var r = waterIntake(w, ex);
    var cups = Math.round(r.total / CUP);

    document.getElementById("wiResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + liter(r.total) + '</span><small>L / 하루</small></div><p class="result-sub">약 ' + f(r.total) + 'mL · 200mL 컵 ' + cups + '잔</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>기본 권장량</th><td>' + f(r.base) + ' mL (' + liter(r.base) + ' L)</td></tr>' +
      '<tr><th>권장 범위</th><td>' + f(r.min) + ' ~ ' + f(r.max) + ' mL</td></tr>' +
      (r.exercise ? '<tr><th>운동 보정(+)</th><td>+' + f(r.exercise) + ' mL</td></tr>' : '') +
      '<tr><th>하루 목표</th><td><strong>' + f(r.total) + ' mL (' + cups + '잔)</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ 음식·국·음료에 든 수분도 포함된 전체 수분의 일부입니다. 신장질환·심부전 등이 있으면 의료진 지침을 따르세요. 체중×30~35mL 기준 추정치입니다.</p>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  if (location.search) window.ToolKit.ready(calc);
})();
