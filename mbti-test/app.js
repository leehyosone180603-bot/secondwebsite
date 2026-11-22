(function () {
  "use strict";
  var M = window.MBTI, Q = window.MBTI_QUESTIONS;
  var PER = 6, PAGES = Math.ceil(Q.length / PER); // 48/6 = 8
  var SKEY = "hf_mbti_answers_v1";
  var answers = {}, page = 0;

  var $ = function (id) { return document.getElementById(id); };
  $("year").textContent = new Date().getFullYear();
  var introV = $("introView"), quizV = $("quizView"), resultV = $("resultView");

  // 5단계: 값, 라벨, 크기 클래스(큰-중-작-중-큰), 방향(d=disagree/a=agree/n)
  var SCALE = [
    { v: -2, size: "s2", side: "d", label: "전혀 아니다" },
    { v: -1, size: "s1", side: "d", label: "별로 아니다" },
    { v: 0, size: "s0", side: "n", label: "보통" },
    { v: 1, size: "s1", side: "a", label: "조금 그렇다" },
    { v: 2, size: "s2", side: "a", label: "매우 그렇다" }
  ];

  // ── 저장/복원 ──
  function save() { try { sessionStorage.setItem(SKEY, JSON.stringify(answers)); } catch (e) {} }
  function load() { try { var r = sessionStorage.getItem(SKEY); if (r) answers = JSON.parse(r) || {}; } catch (e) { answers = {}; } }
  function clearSave() { try { sessionStorage.removeItem(SKEY); } catch (e) {} }

  function answeredCount() { var n = 0; Q.forEach(function (q) { if (answers[q.id] !== undefined) n++; }); return n; }

  // ── 문항 렌더 ──
  function pageQuestions(p) { return Q.slice(p * PER, p * PER + PER); }
  function renderPage() {
    var form = $("quizForm"); form.innerHTML = "";
    pageQuestions(page).forEach(function (q, i) {
      var num = page * PER + i + 1;
      var row = document.createElement("div"); row.className = "q-item";
      var opts = SCALE.map(function (s) {
        var checked = answers[q.id] === s.v ? " is-on" : "";
        return '<button type="button" class="opt opt-' + s.size + ' side-' + s.side + checked +
          '" data-qid="' + q.id + '" data-v="' + s.v + '" aria-label="' + s.label + '"><span></span></button>';
      }).join("");
      row.innerHTML = '<p class="q-text"><b>' + num + '.</b> ' + q.text + '</p>' +
        '<div class="opt-row"><span class="end d">전혀<br>아니다</span>' + opts + '<span class="end a">매우<br>그렇다</span></div>';
      form.appendChild(row);
    });
    // 진행바
    var done = answeredCount();
    $("pDone").textContent = done;
    $("pbarFill").style.width = Math.round(done / Q.length * 100) + "%";
    // 네비 상태
    $("prevBtn").disabled = page === 0;
    $("nextBtn").disabled = !pageComplete();
    $("nextBtn").textContent = page === PAGES - 1 ? "결과 보기 →" : "다음 →";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function pageComplete() { return pageQuestions(page).every(function (q) { return answers[q.id] !== undefined; }); }

  // 선택 클릭(위임)
  $("quizForm").addEventListener("click", function (e) {
    var btn = e.target.closest(".opt"); if (!btn) return;
    var qid = Number(btn.getAttribute("data-qid")), v = Number(btn.getAttribute("data-v"));
    answers[qid] = v; save();
    // 같은 문항 버튼 토글
    Array.prototype.forEach.call(btn.parentNode.querySelectorAll(".opt"), function (o) { o.classList.remove("is-on"); });
    btn.classList.add("is-on");
    $("pDone").textContent = answeredCount();
    $("pbarFill").style.width = Math.round(answeredCount() / Q.length * 100) + "%";
    $("nextBtn").disabled = !pageComplete();
  });

  $("nextBtn").addEventListener("click", function () {
    if (!pageComplete()) return;
    if (page < PAGES - 1) { page++; renderPage(); }
    else finish();
  });
  $("prevBtn").addEventListener("click", function () { if (page > 0) { page--; renderPage(); } });

  function showView(v) {
    introV.hidden = v !== "intro"; quizV.hidden = v !== "quiz"; resultV.hidden = v !== "result";
  }

  // ── 결과 ──
  function renderResult(code, axesPct) {
    var t = M.BY_CODE[code], b = M.BRIEF[code];
    $("rtCode").textContent = code;
    $("rtNick").textContent = (t ? t.nick : "");
    $("rtSum").textContent = b ? b.sum : "";
    // 축 막대
    var names = { EI: ["외향 E", "내향 I"], SN: ["감각 S", "직관 N"], TF: ["사고 T", "감정 F"], JP: ["판단 J", "인식 P"] };
    $("rtAxes").innerHTML = M.AXIS_ORDER.map(function (ax) {
      var fp = axesPct[ax];                 // 앞글자 %
      var frontWins = fp >= 50 && !(fp === 50); // 50은 뒷글자
      var leftPct = fp, rightPct = 100 - fp;
      var lw = frontWins, rw = !frontWins;
      return '<li><div class="ab-row">' +
        '<span class="ab-l' + (lw ? " win" : "") + '">' + names[ax][0] + ' ' + leftPct + '%</span>' +
        '<span class="ab-r' + (rw ? " win" : "") + '">' + rightPct + '% ' + names[ax][1] + '</span></div>' +
        '<div class="ab-bar"><div class="ab-fill" style="width:' + leftPct + '%"></div></div></li>';
    }).join("");
    // 강점 / 주의
    $("rtUp").innerHTML = (b ? b.up : []).map(function (s) { return "<li>" + s + "</li>"; }).join("");
    $("rtCare").innerHTML = (b ? b.care : []).map(function (s) { return "<li>" + s + "</li>"; }).join("");
    // 링크
    $("rtLinks").innerHTML =
      '<a href="/posts/mbti-' + code.toLowerCase() + '.html">📖 ' + code + ' 유형 자세히 →</a>' +
      '<a href="/mbti-match/?a=' + code.toLowerCase() + '">💞 궁합 보기 →</a>';
    showView("result");
    // 결과 전용 공유 링크
    var pctStr = M.AXIS_ORDER.map(function (ax) { return axesPct[ax]; }).join("-");
    resultV.setAttribute("data-share", location.origin + location.pathname + "?r=" + code.toLowerCase() + "&p=" + pctStr);
    try { (window.hfTrack || function () {})("ev", "/mbti-test/#done-" + code.toLowerCase()); } catch (e) {}
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function finish() {
    var res = M.scoreTest(answers, Q);
    var pct = {}; M.AXIS_ORDER.forEach(function (ax) { pct[ax] = res.axes[ax].frontPct; });
    clearSave(); // 결과 나오면 임시 저장 비움
    renderResult(res.code, pct);
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
  }

  // ── 버튼 ──
  $("startBtn").addEventListener("click", function () {
    // 이어보기: 이미 일부 응답이 있으면 해당 페이지로
    var done = answeredCount();
    page = done > 0 ? Math.min(Math.floor(done / PER), PAGES - 1) : 0;
    showView("quiz"); renderPage();
  });
  $("retryBtn").addEventListener("click", function () {
    answers = {}; page = 0; clearSave();
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
    showView("intro"); $("resumeHint").hidden = true;
  });
  $("copyBtn").addEventListener("click", function () {
    var url = resultV.getAttribute("data-share") || location.href, btn = this;
    function done() { btn.textContent = "복사됨 ✓"; setTimeout(function () { btn.textContent = "🔗 결과 링크 복사"; }, 1500); }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  });

  // ── 초기화 ──
  load();
  // 공유된 결과(?r=code&p=..) → 결과만 표시
  var shared = false;
  try {
    var qp = new URLSearchParams(location.search);
    var rc = (qp.get("r") || "").toUpperCase();
    if (M.BY_CODE[rc]) {
      var parts = (qp.get("p") || "").split("-").map(Number);
      var pct = {}; M.AXIS_ORDER.forEach(function (ax, i) {
        var v = parts[i]; pct[ax] = (isFinite(v) && v >= 0 && v <= 100) ? v : 50;
      });
      renderResult(rc, pct); shared = true;
    }
  } catch (e) {}
  if (!shared) {
    showView("intro");
    if (answeredCount() > 0) {
      $("resumeHint").hidden = false;
      $("resumeHint").textContent = "이어보기: 지난 응답 " + answeredCount() + "개가 남아 있어요. ‘시작하기’를 누르면 이어서 진행합니다.";
      $("startBtn").textContent = "이어서 하기";
    }
  }
  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
})();
