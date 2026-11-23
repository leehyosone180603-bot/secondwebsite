/* 통합 나이 계산기 위젯 — 포스트 상단 임베드용(자급자족, 외부 의존 없음).
   생년월일 하나로 만나이·연나이·띠·다음 생일 + 이정표(환갑·칠순·경로우대·국민연금·추정 학번)까지.
   사용법:  <div class="age-widget"></div> + <script defer src="/js/age-widget.js"></script>
   - data-related 속성으로 하단 관련링크를 바꿀 수 있음(기본: 나이 클러스터). */
(function () {
  "use strict";
  if (typeof document === "undefined") return;

  var ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"];
  var GAN = ["경", "신", "임", "계", "갑", "을", "병", "정", "무", "기"];
  var JI  = ["신", "유", "술", "해", "자", "축", "인", "묘", "진", "사", "오", "미"];
  var WD  = ["일", "월", "화", "수", "목", "금", "토"];

  function ymd(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function days(a, b) { return Math.round((ymd(b) - ymd(a)) / 86400000); }
  function birthdayPassed(birth, base) {
    if (base.getMonth() > birth.getMonth()) return true;
    if (base.getMonth() < birth.getMonth()) return false;
    return base.getDate() >= birth.getDate();
  }
  function manAge(birth, base) { var a = base.getFullYear() - birth.getFullYear(); return birthdayPassed(birth, base) ? a : a - 1; }
  function yearAge(birth, base) { return base.getFullYear() - birth.getFullYear(); }
  function zodiac(y) { return ANIMALS[((y - 4) % 12 + 12) % 12] + "띠"; }
  function ganji(y) { return GAN[((y) % 10 + 10) % 10] + JI[((y) % 12 + 12) % 12] + "년"; }
  function nextBirthday(birth, base) {
    var nb = new Date(base.getFullYear(), birth.getMonth(), birth.getDate());
    if (days(base, nb) < 0) nb.setFullYear(nb.getFullYear() + 1);
    return nb;
  }
  // 국민연금 노령연금 개시연령(출생연도 기준)
  function pensionStartAge(y) {
    if (y <= 1952) return 60;
    if (y <= 1956) return 61;
    if (y <= 1960) return 62;
    if (y <= 1964) return 63;
    if (y <= 1968) return 64;
    return 65;
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function fmtDate(d) { return d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일(" + WD[d.getDay()] + ")"; }

  var STYLE = [
    ".age-widget{--aw:#1e73be;border:1px solid #dfe6ef;border-radius:16px;background:#fff;",
    "box-shadow:0 2px 14px rgba(30,45,80,.06);padding:18px 18px 16px;margin:18px 0 26px;font-size:15px;line-height:1.6}",
    ".age-widget *{box-sizing:border-box}",
    ".aw-h{display:flex;align-items:center;gap:8px;font-weight:800;color:#1f2430;font-size:1.05rem;margin:0 0 4px}",
    ".aw-h .aw-badge{background:var(--aw);color:#fff;border-radius:999px;font-size:.72rem;font-weight:700;padding:2px 9px}",
    ".aw-sub{color:#667085;font-size:.86rem;margin:0 0 12px}",
    ".aw-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}",
    ".age-widget input[type=date]{flex:1 1 180px;min-width:150px;padding:11px 12px;border:1px solid #cdd6e2;border-radius:10px;font-size:16px;color:#1f2430;background:#fff}",
    ".age-widget .aw-btn{flex:0 0 auto;padding:11px 20px;border:0;border-radius:10px;background:var(--aw);color:#fff;font-size:15px;font-weight:700;cursor:pointer}",
    ".age-widget .aw-btn:hover{background:#155a97}",
    ".aw-err{color:#d33;font-size:.85rem;margin:8px 0 0;min-height:0}",
    ".aw-out{margin-top:14px}",
    ".aw-hero{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;background:#f3f8fe;border:1px solid #e2eefb;border-radius:12px;padding:12px 16px}",
    ".aw-hero .aw-big{font-size:2.1rem;font-weight:800;color:var(--aw);line-height:1}",
    ".aw-hero .aw-big small{font-size:1rem;font-weight:700;margin-left:2px}",
    ".aw-hero .aw-meta{color:#445;font-size:.92rem}",
    ".aw-hero .aw-meta b{color:#1f2430}",
    ".aw-tbl{width:100%;border-collapse:collapse;margin-top:12px;font-size:.93rem}",
    ".aw-tbl th,.aw-tbl td{padding:9px 10px;border-bottom:1px solid #eef1f5;text-align:left;vertical-align:top}",
    ".aw-tbl th{color:#55607a;font-weight:600;width:44%;white-space:nowrap}",
    ".aw-tbl td{color:#1f2430;font-weight:600}",
    ".aw-note{color:#8a93a3;font-size:.78rem;margin-top:8px;line-height:1.5}",
    ".aw-rel{margin-top:14px;border-top:1px dashed #e2e7ee;padding-top:12px}",
    ".aw-rel b{display:block;color:#1f2430;font-size:.9rem;margin-bottom:6px}",
    ".aw-rel a{display:inline-block;margin:3px 8px 3px 0;color:var(--aw);text-decoration:none;font-size:.9rem;font-weight:600;border-bottom:1px solid transparent}",
    ".aw-rel a:hover{border-bottom-color:var(--aw)}",
    "@media (prefers-color-scheme:dark){.age-widget{background:#1a1f28;border-color:#2c3542}.aw-h,.aw-tbl td,.aw-hero .aw-meta b{color:#e8edf4}",
    ".aw-sub,.aw-tbl th,.aw-hero .aw-meta{color:#9aa6b6}.age-widget input[type=date]{background:#131821;border-color:#39424f;color:#e8edf4}",
    ".aw-hero{background:#15202e;border-color:#243243}.aw-tbl th,.aw-tbl td{border-color:#262f3b}}"
  ].join("");

  var DEFAULT_REL = [
    { href: "/posts/age-table-2026.html", t: "2026 출생연도별 나이표" },
    { href: "/posts/milestone-ages.html", t: "환갑·진갑·칠순·팔순 나이" },
    { href: "/posts/birthyear-to-hakbeon.html", t: "출생연도↔학번 환산" },
    { href: "/posts/zodiac-year-age.html", t: "띠로 나이·몇년생 찾기" },
    { href: "/posts/senior-benefits-age.html", t: "경로우대·지하철 무임 나이" },
    { href: "/posts/pension-start-age.html", t: "국민연금 수급 개시 나이" }
  ];

  function injectStyleOnce() {
    if (document.getElementById("aw-style")) return;
    var s = document.createElement("style"); s.id = "aw-style"; s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function build(el) {
    var rel = DEFAULT_REL;
    var dr = el.getAttribute("data-related");
    if (dr) { try { var p = JSON.parse(dr); if (Array.isArray(p) && p.length) rel = p; } catch (e) {} }
    // 현재 글은 관련링크에서 제외
    var here = location.pathname.replace(/\/index\.html$/, "/");
    rel = rel.filter(function (r) { return r.href !== here && r.href !== location.pathname; });

    el.innerHTML =
      '<div class="aw-h"><span class="aw-badge">계산기</span>통합 나이 계산기</div>' +
      '<p class="aw-sub">생년월일만 넣으면 만 나이·띠·다음 생일부터 환갑·경로우대·국민연금 나이까지 한 번에.</p>' +
      '<div class="aw-row"><input type="date" class="aw-date" aria-label="생년월일" max="' + new Date().toISOString().slice(0, 10) + '">' +
      '<button type="button" class="aw-btn">계산하기</button></div>' +
      '<p class="aw-err" role="alert"></p><div class="aw-out" hidden></div>';

    var input = el.querySelector(".aw-date");
    var btn = el.querySelector(".aw-btn");
    var err = el.querySelector(".aw-err");
    var out = el.querySelector(".aw-out");

    function relHtml() {
      if (!rel.length) return "";
      return '<div class="aw-rel"><b>이 생년월일로 더 보기</b>' +
        rel.slice(0, 6).map(function (r) { return '<a href="' + r.href + '">' + r.t + ' ›</a>'; }).join("") + '</div>';
    }

    function run() {
      err.textContent = "";
      var v = input.value;
      if (!v) { err.textContent = "생년월일을 선택하세요."; out.hidden = true; return; }
      var p = v.split("-"), birth = new Date(+p[0], +p[1] - 1, +p[2]);
      if (isNaN(birth)) { err.textContent = "올바른 날짜를 입력하세요."; out.hidden = true; return; }
      var base = new Date();
      if (days(birth, base) < 0) { err.textContent = "생년월일이 오늘보다 미래입니다."; out.hidden = true; return; }
      var by = birth.getFullYear();
      var ma = manAge(birth, base);
      var nb = nextBirthday(birth, base), dLeft = days(base, nb);
      var psAge = pensionStartAge(by), psYear = by + psAge;
      var thisYear = base.getFullYear();
      function milestone(age) {
        var yr = by + age;
        return yr <= thisYear ? (ma >= age ? "지남(" + yr + "년)" : yr + "년") : yr + "년";
      }
      var hakbeon = by + 19;   // 대학 입학연도(추정)
      var elem = by + 7;       // 초등 입학연도(추정)

      out.innerHTML =
        '<div class="aw-hero"><div class="aw-big">' + fmt(ma) + '<small>세</small></div>' +
        '<div class="aw-meta"><b>만 나이</b> · ' + zodiac(by) + '(' + ganji(by) + ') · 연 나이 ' + fmt(yearAge(birth, base)) + '세</div></div>' +
        '<table class="aw-tbl"><tbody>' +
        '<tr><th>다음 생일</th><td>' + fmtDate(nb) + ' · ' + (dLeft === 0 ? "오늘! 🎉" : "D-" + fmt(dLeft)) + '</td></tr>' +
        '<tr><th>환갑(만 60)</th><td>' + milestone(60) + '</td></tr>' +
        '<tr><th>칠순(만 70)</th><td>' + milestone(70) + '</td></tr>' +
        '<tr><th>경로우대·지하철 무임(만 65)</th><td>' + milestone(65) + '</td></tr>' +
        '<tr><th>국민연금 수급 개시</th><td>만 ' + psAge + '세 · ' + psYear + '년부터</td></tr>' +
        '<tr><th>추정 학번(대학 입학)</th><td>' + hakbeon + '학번</td></tr>' +
        '<tr><th>추정 초등 입학</th><td>' + elem + '년 3월</td></tr>' +
        '</tbody></table>' +
        '<p class="aw-note">※ 만 나이·연금 개시는 정확 기준입니다. 띠는 양력 1월 1일 기준 근사이며, 설 이전 출생은 전년도 띠일 수 있습니다. 학번·초등 입학은 정상 진급 가정의 추정값으로 빠른년생·재수 등은 다를 수 있습니다.</p>' +
        relHtml();
      out.hidden = false;
    }

    btn.addEventListener("click", run);
    input.addEventListener("change", function () { if (input.value) run(); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") run(); });
  }

  // 연도 자동 최신화: .js-year(올해)·.js-today(오늘 날짜)를 현재 기준으로 채움 — 매년/매일 자동 갱신
  function fillDates() {
    var now = new Date(), y = now.getFullYear();
    var ys = document.querySelectorAll(".js-year");
    for (var i = 0; i < ys.length; i++) ys[i].textContent = y;
    var td = now.getFullYear() + "년 " + (now.getMonth() + 1) + "월 " + now.getDate() + "일";
    var ts = document.querySelectorAll(".js-today");
    for (var j = 0; j < ts.length; j++) ts[j].textContent = td;
  }

  function init() {
    fillDates();
    var nodes = document.querySelectorAll(".age-widget");
    if (!nodes.length) return;
    injectStyleOnce();
    for (var i = 0; i < nodes.length; i++) if (!nodes[i].getAttribute("data-aw-ready")) { nodes[i].setAttribute("data-aw-ready", "1"); build(nodes[i]); }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
