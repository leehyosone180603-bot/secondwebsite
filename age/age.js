/* 만 나이 계산기 — 로직 + 순수 함수.
   만 나이·연 나이·세는 나이·띠(간지)·별자리·살아온 일수·다음 생일 D-Day. */
(function () {
  "use strict";
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  var ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
  var GAN = ["경", "신", "임", "계", "갑", "을", "병", "정", "무", "기"];
  var JI = ["신", "유", "술", "해", "자", "축", "인", "묘", "진", "사", "오", "미"];

  function ymd(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function days(a, b) { return Math.round((ymd(b) - ymd(a)) / 86400000); }
  function birthdayPassed(birth, base) {
    if (base.getMonth() > birth.getMonth()) return true;
    if (base.getMonth() < birth.getMonth()) return false;
    return base.getDate() >= birth.getDate();
  }
  function manAge(birth, base) { var a = base.getFullYear() - birth.getFullYear(); return birthdayPassed(birth, base) ? a : a - 1; }
  function koreanAge(birth, base) { return base.getFullYear() - birth.getFullYear() + 1; }
  function yearAge(birth, base) { return base.getFullYear() - birth.getFullYear(); }
  function zodiac(year) { return ANIMALS[((year - 4) % 12 + 12) % 12] + "띠"; }
  function ganji(year) { return GAN[((year) % 10 + 10) % 10] + JI[((year) % 12 + 12) % 12] + "년"; }
  function starSign(m, d) { // m:1-12
    var b = [20, 19, 21, 20, 21, 22, 23, 23, 23, 23, 23, 22];
    var names = ["물병자리", "물고기자리", "양자리", "황소자리", "쌍둥이자리", "게자리", "사자자리", "처녀자리", "천칭자리", "전갈자리", "사수자리", "염소자리"];
    var idx = d >= b[m - 1] ? m - 1 : (m - 2 + 12) % 12;
    return names[idx];
  }
  function daysLived(birth, base) { return days(birth, base); }
  function nextBirthday(birth, base) {
    var nb = new Date(base.getFullYear(), birth.getMonth(), birth.getDate());
    if (days(base, nb) < 0) nb.setFullYear(nb.getFullYear() + 1);
    return nb;
  }

  var LOGIC = { manAge: manAge, koreanAge: koreanAge, yearAge: yearAge, zodiac: zodiac, ganji: ganji, starSign: starSign, daysLived: daysLived, nextBirthday: nextBirthday, days: days };
  if (typeof module !== "undefined" && module.exports) module.exports = LOGIC;
  if (typeof document === "undefined") return;

  var TK = window.ToolKit;
  function parse(v) { if (!v) return null; var p = String(v).split("-"); if (p.length !== 3) return null; var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? null : d; }
  function fmtDate(d) { return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + WD[d.getDay()] + ")"; }
  function f(n) { return TK.fmt(n); }

  function calc() {
    var err = document.getElementById("errorMsg"); err.textContent = "";
    var birth = parse(TK.val("birth")); if (!birth) { err.textContent = "생년월일을 선택하세요."; return; }
    var base = parse(TK.val("baseDate")) || new Date();
    if (days(birth, base) < 0) { err.textContent = "기준일이 생년월일보다 빠릅니다."; return; }
    var nb = nextBirthday(birth, base), dLeft = days(base, nb);
    document.getElementById("ageResult").innerHTML =
      '<div class="result-hero"><div class="big"><span>' + f(manAge(birth, base)) + '</span><small>세</small></div><p class="result-sub">만 나이 (' + fmtDate(base) + ' 기준)</p></div>' +
      '<table class="calc-table"><tbody>' +
      '<tr><th>만 나이</th><td>' + f(manAge(birth, base)) + '세</td></tr>' +
      '<tr><th>연 나이 (연도−출생연도)</th><td>' + f(yearAge(birth, base)) + '세</td></tr>' +
      '<tr><th>세는 나이 (한국식)</th><td>' + f(koreanAge(birth, base)) + '세</td></tr>' +
      '<tr><th>띠 (간지)</th><td>' + zodiac(birth.getFullYear()) + ' · ' + ganji(birth.getFullYear()) + '</td></tr>' +
      '<tr><th>별자리</th><td>' + starSign(birth.getMonth() + 1, birth.getDate()) + '</td></tr>' +
      '<tr><th>살아온 일수</th><td>' + f(daysLived(birth, base)) + '일</td></tr>' +
      '<tr><th>다음 생일</th><td>' + fmtDate(nb) + ' · ' + (dLeft === 0 ? "오늘! 🎉" : "D-" + f(dLeft)) + '</td></tr>' +
      '</tbody></table>';
    TK.showResult();
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  var bd = document.getElementById("baseDate"); if (bd && !bd.value) bd.value = new Date().toISOString().slice(0, 10);
  if (location.search) setTimeout(calc, 0);
})();
