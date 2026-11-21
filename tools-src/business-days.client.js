/* 영업일 계산기 — 로직 + 순수 함수.
   주말(일, 토는 옵션)·공휴일·사용자 휴무일 제외.
   모드: 기간 영업일 수 / 기준일 ± N영업일. 공휴일 데이터: window.Holidays. */
(function () {
  "use strict";
  function ymd(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function fmtD(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function isBusinessDay(d, opts) {
    opts = opts || {};
    var day = d.getDay();
    if (day === 0) return false;                       // 일요일
    if (day === 6 && !opts.saturdayWork) return false; // 토요일(옵션)
    var s = fmtD(d);
    if (opts.isHoliday && opts.isHoliday(s)) return false;
    if (opts.customOff && opts.customOff[s]) return false;
    return true;
  }
  function countBusinessDays(start, end, opts, includeStart) {
    var a = ymd(start), b = ymd(end); if (a > b) { var t = a; a = b; b = t; }
    var cnt = 0, cur = new Date(a);
    if (!includeStart) cur.setDate(cur.getDate() + 1);
    while (cur <= b) { if (isBusinessDay(cur, opts)) cnt++; cur.setDate(cur.getDate() + 1); }
    return cnt;
  }
  function addBusinessDays(base, n, opts) {
    var cur = ymd(base), step = n >= 0 ? 1 : -1, remain = Math.abs(n);
    while (remain > 0) { cur.setDate(cur.getDate() + step); if (isBusinessDay(cur, opts)) remain--; }
    return cur;
  }

  var LOGIC = { isBusinessDay: isBusinessDay, countBusinessDays: countBusinessDays, addBusinessDays: addBusinessDays, fmtD: fmtD };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  function parse(v) { if (!v) return null; var p = String(v).split("-"); if (p.length !== 3) return null; var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? null : d; }
  function fmtDate(d) { return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + WD[d.getDay()] + ")"; }
  function f(n) { return TK.fmt(n); }

  function opts() {
    var custom = {};
    (TK.val("customOff") || "").split(/[,\s]+/).forEach(function (s) { s = s.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) custom[s] = 1; });
    return { isHoliday: (window.Holidays ? window.Holidays.isHoliday : function () { return false; }), saturdayWork: document.getElementById("satWork").checked, customOff: custom };
  }
  function excludedHolidays(a, b) {
    var out = [], H = window.Holidays; if (!H) return out;
    var s = a <= b ? a : b, e = a <= b ? b : a;
    var cur = ymd(s);
    while (cur <= e) { var ds = fmtD(cur); var day = cur.getDay(); if (day !== 0 && !(day === 6) && H.isHoliday(ds)) out.push(ds + " " + H.name(ds)); cur.setDate(cur.getDate() + 1); }
    return out;
  }

  var tab = "count";
  function setTab(t) { tab = t; document.querySelectorAll("[data-tab]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tab") === t); }); document.querySelectorAll(".bz-panel").forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== t; }); var c = document.getElementById("tk-result-card"); if (c) c.hidden = true; }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var o = opts(), body = document.getElementById("bzResult");
    if (tab === "count") {
      var a = parse(TK.val("bStart")), b = parse(TK.val("bEnd"));
      if (!a || !b) { err.textContent = "시작일과 종료일을 선택하세요."; return; }
      var incl = document.getElementById("bIncl").checked;
      var n = countBusinessDays(a, b, o, incl);
      var exc = excludedHolidays(a, b);
      body.innerHTML = '<div class="result-hero"><div class="big"><span>' + f(n) + '</span><small>영업일</small></div><p class="result-sub">' + fmtDate(a < b ? a : b) + ' ~ ' + fmtDate(a < b ? b : a) + (incl ? ' (시작일 포함)' : ' (시작일 제외)') + '</p></div>' +
        '<table class="calc-table"><tbody><tr><th>영업일 수</th><td>' + f(n) + '일</td></tr><tr><th>제외 공휴일</th><td>' + (exc.length ? exc.join("<br>") : "없음") + '</td></tr></tbody></table>' +
        '<p class="footer-notice" style="margin:8px 0 0">※ 주말(일요일' + (o.saturdayWork ? '' : '·토요일') + ')과 법정·대체·임시공휴일, 지정한 휴무일을 제외했습니다.</p>';
    } else {
      var base = parse(TK.val("aBase")); if (!base) { err.textContent = "기준일을 선택하세요."; return; }
      var num = TK.num("aN"); if (isNaN(num)) { err.textContent = "영업일 수를 입력하세요."; return; }
      var dir = document.getElementById("aDir").value === "before" ? -1 : 1;
      var res = addBusinessDays(base, dir * num, o);
      body.innerHTML = '<div class="result-hero"><div class="big" style="font-size:1.5rem"><span>' + fmtDate(res) + '</span></div><p class="result-sub">' + fmtDate(base) + ' 기준 ' + f(num) + '영업일 ' + (dir > 0 ? "후" : "전") + '</p></div>';
    }
    TK.showResult();
  }

  document.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { setTab(b.getAttribute("data-tab")); }); });
  document.getElementById("calcBtn").addEventListener("click", calc);
  var today = new Date().toISOString().slice(0, 10);
  ["bStart", "aBase"].forEach(function (id) { var e = document.getElementById(id); if (e && !e.value) e.value = today; });
  setTab("count");
  if (location.search) setTimeout(calc, 0);
})();
