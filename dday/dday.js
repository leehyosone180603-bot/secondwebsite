/* 날짜 계산기 (D-Day) — 로직 + 순수 함수.
   탭: D-Day / 두 날짜 사이 기간 / 날짜 더하기·빼기 / 기념일. */
(function () {
  "use strict";
  var WD = ["일", "월", "화", "수", "목", "금", "토"];

  function ymd(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function days(a, b) { return Math.round((ymd(b) - ymd(a)) / 86400000); }
  function addPeriod(base, n, unit) {
    var d = ymd(base);
    if (unit === "day") d.setDate(d.getDate() + n);
    else if (unit === "week") d.setDate(d.getDate() + n * 7);
    else { var day = d.getDate(); if (unit === "month") d.setMonth(d.getMonth() + n); else d.setFullYear(d.getFullYear() + n); if (d.getDate() < day) d.setDate(0); }
    return d;
  }
  function diffYMD(a, b) { // a<=b
    if (a > b) { var t = a; a = b; b = t; }
    var y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
    if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: y, m: m, d: d };
  }
  function anniversaries(start) {
    var list = [];
    [100, 200, 300, 500, 1000, 2000].forEach(function (n) { list.push({ label: n + "일", date: addPeriod(start, n - 1, "day") }); });
    [1, 2, 3, 5, 10].forEach(function (y) { list.push({ label: y + "주년", date: addPeriod(start, y, "year") }); });
    list.sort(function (a, b) { return a.date - b.date; });
    return list;
  }

  var LOGIC = { days: days, addPeriod: addPeriod, diffYMD: diffYMD, anniversaries: anniversaries };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function parse(v) { if (!v) return null; var p = String(v).split("-"); if (p.length !== 3) return null; var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? null : d; }
  function fmtDate(d) { return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + WD[d.getDay()] + ")"; }
  function f(n) { return TK.fmt(n); }

  var tab = "dday";
  function setTab(t) {
    tab = t;
    document.querySelectorAll("[data-tab]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tab") === t); });
    document.querySelectorAll(".dd-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== t; });
    var c = document.getElementById("tk-result-card"); if (c) c.hidden = true;
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var body = document.getElementById("ddResult");
    var today = new Date();
    var incl = function (id) { var e = document.getElementById(id); return e && e.checked; };

    if (tab === "dday") {
      var target = parse(TK.val("ddayTarget")); if (!target) { err.textContent = "목표일을 선택하세요."; return; }
      var diff = days(today, target);
      var label, sub;
      if (diff > 0) { label = "D-" + f(diff); sub = fmtDate(target) + "까지 " + f(diff) + "일 남음"; }
      else if (diff < 0) { label = "D+" + f(-diff); sub = fmtDate(target) + "에서 " + f(-diff) + "일 지남"; }
      else { label = "D-DAY"; sub = "오늘입니다!"; }
      var included = incl("ddayIncl") ? "<tr><th>당일 포함(며칠째)</th><td>" + f(Math.abs(diff) + 1) + "일째</td></tr>" : "";
      body.innerHTML = '<div class="result-hero"><div class="big"><span>' + label + '</span></div><p class="result-sub">' + sub + '</p></div>' +
        '<table class="calc-table"><tbody>' + included + '</tbody></table>';
    } else if (tab === "between") {
      var a = parse(TK.val("btStart")), b = parse(TK.val("btEnd"));
      if (!a || !b) { err.textContent = "두 날짜를 모두 선택하세요."; return; }
      var nd = Math.abs(days(a, b)); if (incl("btIncl")) nd += 1;
      var ymdv = diffYMD(a, b);
      body.innerHTML = '<div class="result-hero"><div class="big"><span>' + f(nd) + '</span><small>일</small></div><p class="result-sub">' + (incl("btIncl") ? "당일 포함" : "당일 제외") + '</p></div>' +
        '<table class="calc-table"><tbody>' +
        '<tr><th>일수</th><td>' + f(nd) + '일</td></tr>' +
        '<tr><th>주 + 일</th><td>' + f(Math.floor(Math.abs(days(a, b)) / 7)) + '주 ' + (Math.abs(days(a, b)) % 7) + '일</td></tr>' +
        '<tr><th>년 + 개월 + 일</th><td>' + ymdv.y + '년 ' + ymdv.m + '개월 ' + ymdv.d + '일</td></tr>' +
        '</tbody></table>';
    } else if (tab === "addsub") {
      var base = parse(TK.val("asBase")); if (!base) { err.textContent = "기준일을 선택하세요."; return; }
      var n = TK.num("asN"); if (isNaN(n)) { err.textContent = "더하거나 뺄 수를 입력하세요."; return; }
      var dir = document.getElementById("asDir").value === "minus" ? -1 : 1;
      var unit = document.getElementById("asUnit").value;
      var res = addPeriod(base, dir * n, unit);
      var clampNote = (unit === "month" || unit === "year") && res.getDate() !== base.getDate() ? '<p class="footer-notice" style="margin:8px 0 0">※ 해당 월에 같은 날짜가 없어 그 달 말일로 보정했습니다.</p>' : "";
      body.innerHTML = '<div class="result-hero"><div class="big" style="font-size:1.6rem"><span>' + fmtDate(res) + '</span></div><p class="result-sub">' + fmtDate(base) + ' 기준 ' + (dir > 0 ? "+" : "−") + f(Math.abs(n)) + { day: "일", week: "주", month: "개월", year: "년" }[unit] + '</p></div>' + clampNote;
    } else {
      var start = parse(TK.val("avStart")); if (!start) { err.textContent = "시작일을 선택하세요."; return; }
      var rows = anniversaries(start).map(function (x) {
        var left = days(new Date(), x.date);
        var dd = left > 0 ? "D-" + f(left) : (left < 0 ? "D+" + f(-left) : "D-DAY");
        return '<tr><th>' + x.label + '</th><td>' + fmtDate(x.date) + ' <span class="muted">(' + dd + ')</span></td></tr>';
      }).join("");
      body.innerHTML = '<div class="result-hero"><div class="big" style="font-size:1.3rem"><span>' + fmtDate(start) + ' 시작</span></div><p class="result-sub">기념일 (당일을 1일째로 계산)</p></div>' +
        '<table class="calc-table"><tbody>' + rows + '</tbody></table>';
    }
    TK.showResult();
  }

  document.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  // 기본값: 오늘
  var todayStr = new Date().toISOString().slice(0, 10);
  ["btStart", "asBase", "avStart"].forEach(function (id) { var e = document.getElementById(id); if (e && !e.value) e.value = todayStr; });
  setTab("dday");
  if (location.search) window.ToolKit.ready(calc);
})();
