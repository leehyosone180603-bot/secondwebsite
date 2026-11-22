/* MBTI 공식·채점 단위테스트 — 명세 3-2 / 4-4. 실행: node mbti/mbti-data.test.js */
"use strict";
var M = require("./mbti-data.js");
var Q = require("../mbti-test/questions.js");
var fails = 0, passes = 0;
function ck(name, got, want) {
  var ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) { passes++; console.log("  ✓ " + name + " = " + JSON.stringify(got)); }
  else { fails++; console.log("  ✗ " + name + " = " + JSON.stringify(got) + " (기대 " + JSON.stringify(want) + ")"); }
}

console.log("[궁합 공식 4-4]");
[["INFJ", "ENFP", 89, 91, 78], ["ISTJ", "ESTJ", 95, 93, 88], ["INTJ", "ESFP", 68, 65, 77],
 ["INTJ", "INTJ", 88, 97, 86], ["ENFP", "ISTJ", 68, 65, 77]].forEach(function (c) {
  var a = c[0], b = c[1];
  ck(a + "+" + b + " 연애", M.romance(a, b), c[2]);
  ck(a + "+" + b + " 친구", M.friend(a, b), c[3]);
  ck(a + "+" + b + " 직장", M.work(a, b), c[4]);
});
console.log("[대칭성 f(a,b)=f(b,a)]");
ck("romance 대칭", M.romance("INFJ", "ENFP") === M.romance("ENFP", "INFJ"), true);
console.log("[등급 경계]");
ck("85→찰떡", M.grade(85).label, "찰떡궁합");
ck("84→잘맞음", M.grade(84).label, "잘 맞아요");
ck("65→노력", M.grade(65).label, "노력하면 좋아요");
ck("64→다름배움", M.grade(64).label, "다름을 배우는 사이");

console.log("[테스트 채점 3-2]");
function build(fn) { var a = {}; Q.forEach(function (q) { a[q.id] = fn(q); }); return a; }
var front = { EI: "E", SN: "S", TF: "T", JP: "J" };
// 모든 0 → INFP
ck("모두 0 → INFP", M.scoreTest(build(function () { return 0; }), Q).code, "INFP");
// 앞글자(E/S/T/J) 방향 +2, 뒷글자 -2 → ESTJ 100%
ck("앞방향 극단 → ESTJ", M.scoreTest(build(function (q) { return q.pole === front[q.axis] ? 2 : -2; }), Q).code, "ESTJ");
// 정반대 → INFP 100%
ck("뒷방향 극단 → INFP", M.scoreTest(build(function (q) { return q.pole === front[q.axis] ? -2 : 2; }), Q).code, "INFP");
// EI축만 E방향 +2/I방향 -2, 나머지 0 → ENFP
ck("EI만 극단 → ENFP", M.scoreTest(build(function (q) {
  if (q.axis === "EI") return q.pole === "E" ? 2 : -2; return 0;
}), Q).code, "ENFP");
var r = M.scoreTest(build(function (q) { return q.pole === front[q.axis] ? 2 : -2; }), Q);
ck("ESTJ E 비율 100%", r.axes.EI.frontPct, 100);

console.log("[문항 구성]");
ck("문항 48개", Q.length, 48);
["EI", "SN", "TF", "JP"].forEach(function (ax) {
  ck(ax + " 12문항", Q.filter(function (q) { return q.axis === ax; }).length, 12);
  var f = Q.filter(function (q) { return q.axis === ax && q.pole === front[ax]; }).length;
  ck(ax + " 앞글자 6", f, 6);
});

console.log("\n결과: " + passes + " 통과 / " + fails + " 실패");
process.exit(fails ? 1 : 0);
