/* 음주 알코올 분해시간 계산기 — 위드마크(Widmark) 공식 추정.
   섭취알코올 A(g) = 음주량(mL) × 도수(%)/100 × 0.7894(비중).
   BAC(%) = A / (체중kg × r) / 10,  r = 남 0.68 / 여 0.55.
   분해속도 약 0.015%/시간. 면허정지 0.03% / 취소 0.08%(도로교통법). */
(function () {
  "use strict";
  var DENSITY = 0.7894, RATE = 0.015, LIMIT_SUSPEND = 0.03, LIMIT_REVOKE = 0.08;
  function alcoholGrams(ml, abv) { return ml * (abv / 100) * DENSITY; }
  function bac(ml, abv, weightKg, sex) {
    var r = sex === "female" ? 0.55 : 0.68;
    return alcoholGrams(ml, abv) / (weightKg * r) / 10;
  }
  function hoursToTarget(bacPct, target) { return Math.max(0, (bacPct - target) / RATE); }

  var LOGIC = { alcoholGrams: alcoholGrams, bac: bac, hoursToTarget: hoursToTarget, RATE: RATE, LIMIT_SUSPEND: LIMIT_SUSPEND, LIMIT_REVOKE: LIMIT_REVOKE };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  var ABV = { soju: 17, beer: 4.5, makgeolli: 6, wine: 12, whisky: 40 };
  function d2(n) { return Number(n).toLocaleString("ko-KR", { maximumFractionDigits: 3 }); }
  function hm(h) { var t = Math.round(h * 60); return Math.floor(t / 60) + "시간 " + (t % 60) + "분"; }

  function syncAbv() {
    var sel = document.getElementById("drink").value;
    var row = document.getElementById("abvRow");
    if (row) row.style.display = sel === "custom" ? "" : "none";
  }
  function getAbv() {
    var sel = document.getElementById("drink").value;
    if (sel === "custom") return TK.num("abv");
    return ABV[sel];
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var ml = TK.num("amount"), w = TK.num("weight"), abv = getAbv();
    var sex = document.querySelector("[data-sex][aria-pressed=true]").getAttribute("data-sex");
    if (isNaN(ml) || ml <= 0) { err.textContent = "음주량(mL)을 입력하세요."; return; }
    if (isNaN(w) || w <= 0) { err.textContent = "체중을 입력하세요."; return; }
    if (isNaN(abv) || abv <= 0) { err.textContent = "술의 도수를 입력하세요."; return; }
    var A = alcoholGrams(ml, abv), c = bac(ml, abv, w, sex);
    var toDrive = hoursToTarget(c, LIMIT_SUSPEND), toZero = hoursToTarget(c, 0);
    var status = c >= LIMIT_REVOKE ? "면허 취소 수준 (0.08%↑)" : c >= LIMIT_SUSPEND ? "면허 정지 수준 (0.03%↑)" : c > 0 ? "면허 기준 미만(0.03% 미만) — 그래도 운전 금지" : "-";
    var color = c >= LIMIT_REVOKE ? "#b91c1c" : c >= LIMIT_SUSPEND ? "#ef4444" : "#eab308";

    document.getElementById("asResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + d2(c) + '</span><small>% 혈중알코올농도(추정)</small></div>' +
      '<p class="result-sub"><span style="display:inline-block;padding:2px 12px;border-radius:999px;color:#fff;background:' + color + '">' + status + '</span></p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>섭취 알코올량</th><td>' + d2(A) + ' g</td></tr>' +
      '<tr><th>예상 혈중알코올농도</th><td>' + d2(c) + ' %</td></tr>' +
      '<tr><th>운전 가능까지 (0.03% 미만)</th><td><strong>' + hm(toDrive) + '</strong></td></tr>' +
      '<tr><th>완전 분해까지 (0.00%)</th><td>' + hm(toZero) + '</td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0;color:var(--error)">⚠️ 개인차(체질·공복·건강)가 매우 커 실제와 다를 수 있는 <strong>참고용 추정</strong>입니다. 수치와 무관하게 음주 후에는 절대 운전하지 마세요. 분해속도는 평균 0.015%/시간으로 계산했습니다.</p>';
    TK.showResult();
  }

  document.querySelectorAll("[data-sex]").forEach(function (b) { b.addEventListener("click", function () { document.querySelectorAll("[data-sex]").forEach(function (x) { x.setAttribute("aria-pressed", x === b); }); }); });
  document.getElementById("drink").addEventListener("change", syncAbv);
  document.getElementById("calcBtn").addEventListener("click", calc);
  syncAbv();
  if (location.search) window.ToolKit.ready(calc);
})();
