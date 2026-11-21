/* 대한민국 공휴일 2025 — 한국천문연구원 달력자료 + 인사혁신처/정책브리핑(임시공휴일).
   확인일 2026-11-22. type: 법정공휴일 / 대체공휴일 / 임시공휴일.
   (일요일은 영업일 계산에서 별도 처리) */
(function (factory) {
  var a = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = a;
  if (typeof window !== "undefined") window.HOLIDAYS_2025 = a;
})(function () {
  return [
    { date: "2025-01-01", name: "신정", type: "법정공휴일" },
    { date: "2025-01-27", name: "임시공휴일(설 연휴 전날)", type: "임시공휴일" },
    { date: "2025-01-28", name: "설날 연휴", type: "법정공휴일" },
    { date: "2025-01-29", name: "설날", type: "법정공휴일" },
    { date: "2025-01-30", name: "설날 연휴", type: "법정공휴일" },
    { date: "2025-03-01", name: "삼일절", type: "법정공휴일" },
    { date: "2025-03-03", name: "삼일절 대체공휴일", type: "대체공휴일" },
    { date: "2025-05-05", name: "어린이날·부처님오신날", type: "법정공휴일" },
    { date: "2025-05-06", name: "부처님오신날 대체공휴일", type: "대체공휴일" },
    { date: "2025-06-03", name: "제21대 대통령선거일", type: "임시공휴일" },
    { date: "2025-06-06", name: "현충일", type: "법정공휴일" },
    { date: "2025-08-15", name: "광복절", type: "법정공휴일" },
    { date: "2025-10-03", name: "개천절", type: "법정공휴일" },
    { date: "2025-10-05", name: "추석 연휴", type: "법정공휴일" },
    { date: "2025-10-06", name: "추석", type: "법정공휴일" },
    { date: "2025-10-07", name: "추석 연휴", type: "법정공휴일" },
    { date: "2025-10-08", name: "추석 대체공휴일", type: "대체공휴일" },
    { date: "2025-10-09", name: "한글날", type: "법정공휴일" },
    { date: "2025-12-25", name: "성탄절", type: "법정공휴일" }
  ];
});
