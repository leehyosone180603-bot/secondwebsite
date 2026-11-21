/* 대한민국 공휴일 2026 — 한국천문연구원 달력자료 + 관공서 공휴일 규정(2026.4.30 개정: 노동절·제헌절 신규).
   확인일 2026-11-22. 일요일 공휴일(삼일절·부처님오신날)도 정보용으로 포함. */
(function (factory) {
  var a = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = a;
  if (typeof window !== "undefined") window.HOLIDAYS_2026 = a;
})(function () {
  return [
    { date: "2026-01-01", name: "신정", type: "법정공휴일" },
    { date: "2026-02-16", name: "설날 연휴", type: "법정공휴일" },
    { date: "2026-02-17", name: "설날", type: "법정공휴일" },
    { date: "2026-02-18", name: "설날 연휴", type: "법정공휴일" },
    { date: "2026-03-01", name: "삼일절", type: "법정공휴일" },
    { date: "2026-03-02", name: "삼일절 대체공휴일", type: "대체공휴일" },
    { date: "2026-05-01", name: "노동절", type: "법정공휴일" },
    { date: "2026-05-05", name: "어린이날", type: "법정공휴일" },
    { date: "2026-05-24", name: "부처님오신날", type: "법정공휴일" },
    { date: "2026-05-25", name: "부처님오신날 대체공휴일", type: "대체공휴일" },
    { date: "2026-06-03", name: "제9회 전국동시지방선거", type: "법정공휴일" },
    { date: "2026-06-06", name: "현충일", type: "법정공휴일" },
    { date: "2026-07-17", name: "제헌절", type: "법정공휴일" },
    { date: "2026-08-15", name: "광복절", type: "법정공휴일" },
    { date: "2026-08-17", name: "광복절 대체공휴일", type: "대체공휴일" },
    { date: "2026-09-24", name: "추석 연휴", type: "법정공휴일" },
    { date: "2026-09-25", name: "추석", type: "법정공휴일" },
    { date: "2026-09-26", name: "추석 연휴", type: "법정공휴일" },
    { date: "2026-10-03", name: "개천절", type: "법정공휴일" },
    { date: "2026-10-05", name: "개천절 대체공휴일", type: "대체공휴일" },
    { date: "2026-10-09", name: "한글날", type: "법정공휴일" },
    { date: "2026-12-25", name: "성탄절", type: "법정공휴일" }
  ];
});
