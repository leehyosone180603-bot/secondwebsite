/* ============================================================
   holidays.js — 공휴일 통합 조회 (2025~2027)
   - 브라우저: holidays.2025/2026/2027.js 를 먼저 로드 → window.Holidays
   - Node: require("./holidays.js")
   제공: list(year), isHoliday("YYYY-MM-DD"), name(dateStr), years
   ============================================================ */
(function () {
  "use strict";
  var byYear = {};
  if (typeof require !== "undefined") {
    try { byYear[2025] = require("./holidays.2025.js"); } catch (e) {}
    try { byYear[2026] = require("./holidays.2026.js"); } catch (e) {}
    try { byYear[2027] = require("./holidays.2027.js"); } catch (e) {}
  } else if (typeof window !== "undefined") {
    if (window.HOLIDAYS_2025) byYear[2025] = window.HOLIDAYS_2025;
    if (window.HOLIDAYS_2026) byYear[2026] = window.HOLIDAYS_2026;
    if (window.HOLIDAYS_2027) byYear[2027] = window.HOLIDAYS_2027;
  }
  var map = {};
  Object.keys(byYear).forEach(function (y) { (byYear[y] || []).forEach(function (h) { map[h.date] = h; }); });

  var api = {
    years: Object.keys(byYear).map(Number),
    list: function (year) { return byYear[year] || []; },
    isHoliday: function (dateStr) { return !!map[dateStr]; },
    name: function (dateStr) { return map[dateStr] ? map[dateStr].name : null; },
    map: map
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.Holidays = api;
})();
