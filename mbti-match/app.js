(function () {
  "use strict";
  var M = window.MBTI;
  var selA = document.getElementById("selA"), selB = document.getElementById("selB");
  var card = document.getElementById("resultCard");
  document.getElementById("year").textContent = new Date().getFullYear();

  // 드롭다운 채우기 (코드 · 별명)
  M.TYPES.forEach(function (t) {
    [selA, selB].forEach(function (sel) {
      var o = document.createElement("option"); o.value = t.code; o.textContent = t.code + " · " + t.nick; sel.appendChild(o);
    });
  });
  selA.value = "ENFP"; selB.value = "ISTJ";

  function nickOf(c) { return (M.BY_CODE[c] || {}).nick || ""; }
  var gradeClass = { best: "gr-best", good: "gr-good", soso: "gr-soso", learn: "gr-learn" };

  function render(a, b) {
    var c = M.compat(a, b);
    document.getElementById("rScore").textContent = c.romance;
    var badge = document.getElementById("rBadge");
    badge.textContent = c.grade.emoji + " " + c.grade.label;
    badge.className = "badge " + gradeClass[c.grade.key];
    document.getElementById("rPair").textContent = a + " " + nickOf(a) + "  ×  " + b + " " + nickOf(b);
    function setScore(id, val) { document.getElementById(id).textContent = val; document.getElementById(id + "Bar").style.width = Math.min(100, val) + "%"; }
    setScore("rLove", c.romance); setScore("rFriend", c.friend); setScore("rWork", c.work);
    // 축 해설
    var names = { EI: "E/I", SN: "S/N", TF: "T/F", JP: "J/P" };
    document.getElementById("rAxis").innerHTML = M.axisLines(a, b).map(function (l) {
      return '<li><span class="ax">' + names[l.axis] + '</span><span class="eq ' + (l.same ? "same" : "diff") + '">' +
        (l.same ? "비슷" : "다름") + '</span><span>' + l.text + '</span></li>';
    }).join("");
    // 팁
    document.getElementById("rTips").innerHTML = M.tips(a, b).map(function (t) { return "<p>· " + t + "</p>"; }).join("");
    // 유형 글 링크
    document.getElementById("rLinks").innerHTML =
      '<a href="/posts/mbti-' + a.toLowerCase() + '.html">' + a + " " + nickOf(a) + ' 자세히 →</a>' +
      '<a href="/posts/mbti-' + b.toLowerCase() + '.html">' + b + " " + nickOf(b) + ' 자세히 →</a>';
    card.hidden = false;
    // URL 반영
    try { history.replaceState(null, "", "?a=" + a.toLowerCase() + "&b=" + b.toLowerCase()); } catch (e) {}
    markMatrix(a, b);
  }

  function calc() { render(selA.value, selB.value); }

  // 16x16 매트릭스
  function buildMatrix() {
    var codes = M.TYPES.map(function (t) { return t.code; });
    var html = "<thead><tr><th></th>" + codes.map(function (c) { return "<th>" + c + "</th>"; }).join("") + "</tr></thead><tbody>";
    codes.forEach(function (ra) {
      html += "<tr><th>" + ra + "</th>";
      codes.forEach(function (cb) {
        var g = M.grade(M.romance(ra, cb));
        html += '<td class="' + gradeClass[g.key] + '" data-a="' + ra + '" data-b="' + cb + '" title="' + ra + "×" + cb + " 연애 " + M.romance(ra, cb) + '">' + M.romance(ra, cb) + "</td>";
      });
      html += "</tr>";
    });
    html += "</tbody>";
    var tbl = document.getElementById("matrix");
    tbl.innerHTML = html;
    tbl.addEventListener("click", function (e) {
      var td = e.target.closest("td[data-a]"); if (!td) return;
      selA.value = td.getAttribute("data-a"); selB.value = td.getAttribute("data-b"); calc();
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  function markMatrix(a, b) {
    Array.prototype.forEach.call(document.querySelectorAll("#matrix td.me"), function (td) { td.classList.remove("me"); });
    var cell = document.querySelector('#matrix td[data-a="' + a + '"][data-b="' + b + '"]'); if (cell) cell.classList.add("me");
  }

  document.getElementById("calcBtn").addEventListener("click", calc);
  selA.addEventListener("change", calc); selB.addEventListener("change", calc);
  document.getElementById("swapBtn").addEventListener("click", function () {
    var a = selA.value; selA.value = selB.value; selB.value = a; calc();
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var url = location.origin + location.pathname + "?a=" + selA.value.toLowerCase() + "&b=" + selB.value.toLowerCase();
    var btn = this;
    function done() { btn.textContent = "복사됨 ✓"; setTimeout(function () { btn.textContent = "🔗 결과 링크 복사"; }, 1500); }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
  });

  buildMatrix();
  // 쿼리 자동계산
  try {
    var q = new URLSearchParams(location.search);
    var a = (q.get("a") || "").toUpperCase(), b = (q.get("b") || "").toUpperCase();
    if (M.BY_CODE[a] && M.BY_CODE[b]) { selA.value = a; selB.value = b; calc(); }
  } catch (e) {}

  try { (window.adsbygoogle = window.adsbygoogle || []).push({}); (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
})();
