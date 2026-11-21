/* 기초대사량(BMR)·칼로리(TDEE) 계산기 — 순수 함수.
   BMR: Mifflin-St Jeor(1990). 남 =10W+6.25H−5A+5, 여 =10W+6.25H−5A−161.
   TDEE = BMR × 활동계수(좌식1.2 ~ 매우활발1.9). */
(function () {
  "use strict";
  var ACTIVITY = [
    { key: "sedentary", mult: 1.2, label: "거의 안 함 (좌식 생활)" },
    { key: "light", mult: 1.375, label: "가벼운 운동 (주 1~3회)" },
    { key: "moderate", mult: 1.55, label: "보통 운동 (주 3~5회)" },
    { key: "active", mult: 1.725, label: "활발한 운동 (주 6~7회)" },
    { key: "veryActive", mult: 1.9, label: "매우 활발 (육체노동·선수)" }
  ];
  function bmr(sex, kg, cm, age) {
    var base = 10 * kg + 6.25 * cm - 5 * age;
    return sex === "female" ? base - 161 : base + 5;
  }
  function tdee(bmrVal, mult) { return bmrVal * mult; }

  var LOGIC = { bmr: bmr, tdee: tdee, ACTIVITY: ACTIVITY };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function kc(n) { return Math.round(n).toLocaleString("ko-KR"); }
  var sex = "male";
  function setSex(s) { sex = s; document.querySelectorAll("[data-sex]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-sex") === s); }); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var h = TK.num("height"), w = TK.num("weight"), age = TK.num("age");
    if (isNaN(h) || isNaN(w) || isNaN(age) || h <= 0 || w <= 0 || age <= 0) { err.textContent = "키·몸무게·나이를 입력하세요."; return; }
    if (h < 80 || h > 250) { err.textContent = "키는 cm 단위로 입력하세요. (예: 170)"; return; }
    var b = bmr(sex, w, h, age);
    var selMult = parseFloat(document.getElementById("activity").value);

    var rows = ACTIVITY.map(function (a) {
      var on = Math.abs(a.mult - selMult) < 1e-9;
      return '<tr' + (on ? ' style="font-weight:700;background:rgba(59,91,219,.08)"' : '') + '><td>' + (on ? '▶ ' : '') + a.label + '</td><td>' + kc(tdee(b, a.mult)) + ' kcal</td></tr>';
    }).join("");

    var sel = tdee(b, selMult);
    document.getElementById("bmrResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + kc(b) + '</span><small>kcal</small></div><p class="result-sub">기초대사량(BMR) — 가만히 있어도 쓰는 하루 열량</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>기초대사량(BMR)</th><td>' + kc(b) + ' kcal</td></tr>' +
      '<tr><th>하루 권장 칼로리(TDEE)</th><td><strong>' + kc(sel) + ' kcal</strong></td></tr>' +
      '<tr><th>체중 감량 목표(−500)</th><td>' + kc(sel - 500) + ' kcal</td></tr>' +
      '<tr><th>체중 증량 목표(+500)</th><td>' + kc(sel + 500) + ' kcal</td></tr>' +
      '</tbody></table>' +
      '<h3 style="margin:16px 0 6px;font-size:.95rem">활동량별 하루 권장 칼로리</h3>' +
      '<table class="calc-table"><thead><tr><th>활동 수준</th><th>권장 칼로리</th></tr></thead><tbody>' + rows + '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">※ Mifflin-St Jeor 공식 추정치입니다. 근육량·체성분에 따라 실제와 차이가 날 수 있어 참고용으로 사용하세요.</p>';
    TK.showResult();
  }

  document.querySelectorAll("[data-sex]").forEach(function (b) { b.addEventListener("click", function () { setSex(b.getAttribute("data-sex")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setSex("male");
  if (location.search) window.ToolKit.ready(calc);
})();
