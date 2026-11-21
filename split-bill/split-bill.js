/* N빵(더치페이) 계산기 — 순수 함수.
   균등: 1인당 = 총액/인원. 올림: 1인당을 단위로 올림 → 걷는 총액·남는 차액.
   차등: 더 내는 x명이 각자 (기본+추가a), 나머지는 기본. 기본 = (총액 − x·a)/인원. */
(function () {
  "use strict";
  function splitEven(total, people) { return people > 0 ? total / people : 0; }
  function splitRounded(total, people, unit) {
    if (people <= 0 || unit <= 0) return { per: 0, collected: 0, surplus: 0 };
    var per = Math.ceil((total / people) / unit) * unit;
    var collected = per * people;
    return { per: per, collected: collected, surplus: collected - total };
  }
  function splitWeighted(total, people, extraCount, extraEach) {
    var base = (total - extraCount * extraEach) / people;
    return { base: base, heavy: base + extraEach, baseCount: people - extraCount, heavyCount: extraCount };
  }

  var LOGIC = { splitEven: splitEven, splitRounded: splitRounded, splitWeighted: splitWeighted };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function f(n) { return TK.fmt(Math.round(n)); }
  var mode = "even";
  function setMode(m) { mode = m; document.querySelectorAll("[data-mode]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-mode") === m); }); document.querySelectorAll(".sb-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== m; }); var c = document.getElementById("tk-result-card"); if (c) c.hidden = true; }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var total = TK.num("total"), people = TK.num("people");
    if (isNaN(total) || total <= 0) { err.textContent = "총액을 입력하세요."; return; }
    if (isNaN(people) || people < 1) { err.textContent = "인원을 입력하세요."; return; }
    var html;
    if (mode === "even") {
      var unit = parseInt(document.getElementById("unit").value, 10) || 0;
      var per = splitEven(total, people);
      if (unit > 0) {
        var r = splitRounded(total, people, unit);
        html = '<div class="result-hero"><div class="big"><span>' + f(r.per) + '</span><small>원 / 1인</small></div><p class="result-sub">' + people + '명 · ' + unit.toLocaleString() + '원 단위 올림</p></div>' +
          '<table class="calc-table"><tbody>' +
          '<tr><th>총액</th><td>' + f(total) + ' 원</td></tr>' +
          '<tr><th>정확한 1인당</th><td>' + f(per) + ' 원</td></tr>' +
          '<tr><th>올림 1인당</th><td><strong>' + f(r.per) + ' 원</strong></td></tr>' +
          '<tr><th>걷는 총액</th><td>' + f(r.collected) + ' 원</td></tr>' +
          '<tr><th>남는 차액</th><td>' + f(r.surplus) + ' 원</td></tr>' +
          '</tbody></table>' +
          (r.surplus > 0 ? '<p class="footer-notice" style="margin:8px 0 0">올림으로 ' + f(r.surplus) + '원이 남습니다. 팁·봉사료로 쓰거나 한 명이 덜 내도 됩니다.</p>' : '');
      } else {
        html = '<div class="result-hero"><div class="big"><span>' + f(per) + '</span><small>원 / 1인</small></div><p class="result-sub">' + people + '명 균등 분할</p></div>' +
          '<table class="calc-table"><tbody>' +
          '<tr><th>총액</th><td>' + f(total) + ' 원</td></tr>' +
          '<tr><th>1인당</th><td><strong>' + f(per) + ' 원</strong></td></tr>' +
          '</tbody></table>';
      }
    } else {
      var ec = TK.num("extraCount"), ea = TK.num("extraEach");
      if (isNaN(ec) || ec < 0 || ec >= people) { err.textContent = "더 내는 인원은 0 이상, 전체 인원보다 적어야 합니다."; return; }
      if (isNaN(ea) || ea < 0) { err.textContent = "1인 추가액을 입력하세요."; return; }
      var w = splitWeighted(total, people, ec, ea);
      if (w.base < 0) { err.textContent = "추가부담 합이 총액보다 큽니다."; return; }
      html = '<div class="result-hero"><div class="big"><span>' + f(w.base) + '</span><small>원 / 일반 1인</small></div><p class="result-sub">일반 ' + w.baseCount + '명 · 더 내는 ' + w.heavyCount + '명</p></div>' +
        '<table class="calc-table"><tbody>' +
        '<tr><th>총액</th><td>' + f(total) + ' 원</td></tr>' +
        '<tr><th>일반 1인당 (' + w.baseCount + '명)</th><td><strong>' + f(w.base) + ' 원</strong></td></tr>' +
        '<tr><th>더 내는 1인당 (' + w.heavyCount + '명)</th><td><strong>' + f(w.heavy) + ' 원</strong></td></tr>' +
        '<tr><th>합계 확인</th><td>' + f(w.base * w.baseCount + w.heavy * w.heavyCount) + ' 원</td></tr>' +
        '</tbody></table>';
    }
    document.getElementById("sbResult").innerHTML = html;
    TK.showResult();
  }

  document.querySelectorAll("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { setMode(b.getAttribute("data-mode")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  setMode("even");
  if (location.search) window.ToolKit.ready(calc);
})();
