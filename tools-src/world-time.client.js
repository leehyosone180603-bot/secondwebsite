/* 세계 시차 계산기 — Intl 타임존 기반(브라우저 tz 데이터, DST 자동 반영).
   tzOffsetMinutes: 특정 시점 tz의 UTC 오프셋(분). diffHours: 두 tz 시차(시간). */
(function () {
  "use strict";
  function tzOffsetMinutes(date, tz) {
    var dtf = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
    var p = {}; dtf.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    var h = p.hour === "24" ? 0 : +p.hour;
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, h, +p.minute, +p.second);
    return Math.round((asUTC - date.getTime()) / 60000);
  }
  function diffHours(tzFrom, tzTo, date) { return (tzOffsetMinutes(date, tzTo) - tzOffsetMinutes(date, tzFrom)) / 60; }
  // 특정 tz의 벽시계 시각(y,mo,d,h,mi) → 실제 UTC 인스턴트
  function wallToInstant(y, mo, d, h, mi, tz) {
    var guess = Date.UTC(y, mo - 1, d, h, mi);
    var off = tzOffsetMinutes(new Date(guess), tz);
    return new Date(guess - off * 60000);
  }

  var LOGIC = { tzOffsetMinutes: tzOffsetMinutes, diffHours: diffHours, wallToInstant: wallToInstant };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  var CITIES = [
    { id: "seoul", label: "서울", tz: "Asia/Seoul" }, { id: "tokyo", label: "도쿄", tz: "Asia/Tokyo" },
    { id: "beijing", label: "베이징", tz: "Asia/Shanghai" }, { id: "bangkok", label: "방콕", tz: "Asia/Bangkok" },
    { id: "delhi", label: "뉴델리", tz: "Asia/Kolkata" }, { id: "dubai", label: "두바이", tz: "Asia/Dubai" },
    { id: "moscow", label: "모스크바", tz: "Europe/Moscow" }, { id: "london", label: "런던", tz: "Europe/London" },
    { id: "paris", label: "파리·베를린", tz: "Europe/Paris" }, { id: "newyork", label: "뉴욕", tz: "America/New_York" },
    { id: "chicago", label: "시카고", tz: "America/Chicago" }, { id: "la", label: "로스앤젤레스", tz: "America/Los_Angeles" },
    { id: "honolulu", label: "호놀룰루", tz: "Pacific/Honolulu" }, { id: "sydney", label: "시드니", tz: "Australia/Sydney" },
    { id: "saopaulo", label: "상파울루", tz: "America/Sao_Paulo" }
  ];
  function tzOf(id) { for (var i = 0; i < CITIES.length; i++) if (CITIES[i].id === id) return CITIES[i].tz; return "UTC"; }
  function labelOf(id) { for (var i = 0; i < CITIES.length; i++) if (CITIES[i].id === id) return CITIES[i].label; return id; }
  function fmt(instant, tz) {
    return new Intl.DateTimeFormat("ko-KR", { timeZone: tz, year: "numeric", month: "short", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).format(instant);
  }
  function fillCities() {
    var opt = CITIES.map(function (c) { return '<option value="' + c.id + '">' + c.label + '</option>'; }).join("");
    document.getElementById("fromCity").innerHTML = opt;
    document.getElementById("toCity").innerHTML = opt;
    document.getElementById("fromCity").value = "seoul";
    document.getElementById("toCity").value = "newyork";
  }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var fromTz = tzOf(document.getElementById("fromCity").value), toTz = tzOf(document.getElementById("toCity").value);
    var fromLabel = labelOf(document.getElementById("fromCity").value), toLabel = labelOf(document.getElementById("toCity").value);
    var raw = document.getElementById("baseTime").value;
    var instant, note;
    if (raw) {
      var m = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (!m) { err.textContent = "기준 시각 형식이 올바르지 않습니다."; return; }
      instant = wallToInstant(+m[1], +m[2], +m[3], +m[4], +m[5], fromTz);
      note = fromLabel + " 기준 시각을 변환했습니다.";
    } else {
      instant = new Date(); note = "현재 시각 기준입니다.";
    }
    var dh = LOGIC.diffHours(fromTz, toTz, instant);
    var sign = dh > 0 ? "+" : "";
    var diffTxt = dh === 0 ? "시차 없음" : fromLabel + "보다 " + (dh > 0 ? sign + dh : dh) + "시간 " + (dh > 0 ? "빠름" : "느림");

    document.getElementById("wtResult").innerHTML =
      '<div class="result-hero"><div class="big" style="font-size:1.3rem;line-height:1.4"><span>' + fmt(instant, toTz) + '</span></div><p class="result-sub">' + toLabel + '의 시각</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>' + fromLabel + '</th><td>' + fmt(instant, fromTz) + '</td></tr>' +
      '<tr><th>' + toLabel + '</th><td>' + fmt(instant, toTz) + '</td></tr>' +
      '<tr><th>시차</th><td><strong>' + diffTxt + '</strong></td></tr>' +
      '</tbody></table>' +
      '<p class="footer-notice" style="margin:8px 0 0">' + note + ' 서머타임(DST)은 브라우저 표준시 데이터로 자동 반영됩니다.</p>';
    TK.showResult();
  }

  fillCities();
  document.getElementById("fromCity").addEventListener("change", calc);
  document.getElementById("toCity").addEventListener("change", calc);
  document.getElementById("baseTime").addEventListener("change", calc);
  document.getElementById("calcBtn").addEventListener("click", calc);
  var sw = document.getElementById("swapBtn"); if (sw) sw.addEventListener("click", function () { var a = document.getElementById("fromCity"), b = document.getElementById("toCity"); var t = a.value; a.value = b.value; b.value = t; calc(); });
  calc();
})();
