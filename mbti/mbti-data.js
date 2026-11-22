/* 건강흐름 MBTI 공통 데이터·공식 (글·테스트·궁합 공유, 숫자 단일 출처)
 * 브라우저: window.MBTI / Node: module.exports
 * ※ 별명·그룹명·공식 값은 건강흐름 자체 정의. 참고 사이트 값 미사용. */
(function (root) {
  "use strict";

  var GROUPS = { NT: "생각설계형", NF: "마음공감형", SJ: "안정지킴형", SP: "현장행동형" };

  // code, group, nickname, keywords(4), functions(융 서열 4), rarity(범위 표현)
  var TYPES = [
    { code: "INTJ", group: "NT", nick: "큰 그림 설계자", key: ["전략", "독립", "장기계획", "효율"], fn: ["Ni", "Te", "Fi", "Se"], rarity: "드문 편(약 2% 안팎으로 알려짐)" },
    { code: "INTP", group: "NT", nick: "호기심 연구자", key: ["분석", "호기심", "논리", "아이디어"], fn: ["Ti", "Ne", "Si", "Fe"], rarity: "드문 편(약 3%대로 알려짐)" },
    { code: "ENTJ", group: "NT", nick: "목표 지휘관", key: ["추진력", "리더십", "목표", "결단"], fn: ["Te", "Ni", "Se", "Fi"], rarity: "드문 편(약 2%대로 알려짐)" },
    { code: "ENTP", group: "NT", nick: "아이디어 토론가", key: ["토론", "발상", "도전", "재치"], fn: ["Ne", "Ti", "Fe", "Si"], rarity: "보통(약 3%대로 알려짐)" },
    { code: "INFJ", group: "NF", nick: "조용한 길잡이", key: ["통찰", "신념", "공감", "이상"], fn: ["Ni", "Fe", "Ti", "Se"], rarity: "가장 드문 편(약 1~2%로 알려짐)" },
    { code: "INFP", group: "NF", nick: "따뜻한 몽상가", key: ["가치", "상상", "진정성", "공감"], fn: ["Fi", "Ne", "Si", "Te"], rarity: "보통(약 4%대로 알려짐)" },
    { code: "ENFJ", group: "NF", nick: "사람 키우는 리더", key: ["격려", "조율", "성장", "온기"], fn: ["Fe", "Ni", "Se", "Ti"], rarity: "드문 편(약 2~3%로 알려짐)" },
    { code: "ENFP", group: "NF", nick: "에너지 발전소", key: ["열정", "호기심", "연결", "자유"], fn: ["Ne", "Fi", "Te", "Si"], rarity: "흔한 편(약 7~8%로 알려짐)" },
    { code: "ISTJ", group: "SJ", nick: "원칙 지킴이", key: ["책임", "성실", "질서", "신뢰"], fn: ["Si", "Te", "Fi", "Ne"], rarity: "흔한 편(약 10% 안팎으로 알려짐)" },
    { code: "ISFJ", group: "SJ", nick: "다정한 버팀목", key: ["헌신", "배려", "꼼꼼", "안정"], fn: ["Si", "Fe", "Ti", "Ne"], rarity: "가장 흔한 편(약 12% 안팎으로 알려짐)" },
    { code: "ESTJ", group: "SJ", nick: "실행 관리자", key: ["조직", "실행", "기준", "책임"], fn: ["Te", "Si", "Ne", "Fi"], rarity: "흔한 편(약 8~9%로 알려짐)" },
    { code: "ESFJ", group: "SJ", nick: "분위기 살림꾼", key: ["친화", "배려", "협력", "책임"], fn: ["Fe", "Si", "Ne", "Ti"], rarity: "흔한 편(약 12% 안팎으로 알려짐)" },
    { code: "ISTP", group: "SP", nick: "손재주 해결사", key: ["실용", "분석", "침착", "손재주"], fn: ["Ti", "Se", "Ni", "Fe"], rarity: "보통(약 5%대로 알려짐)" },
    { code: "ISFP", group: "SP", nick: "감성 예술가", key: ["감성", "온화", "자유", "미감"], fn: ["Fi", "Se", "Ni", "Te"], rarity: "흔한 편(약 8~9%로 알려짐)" },
    { code: "ESTP", group: "SP", nick: "즉흥 승부사", key: ["순발력", "모험", "현실감", "사교"], fn: ["Se", "Ti", "Fe", "Ni"], rarity: "보통(약 4%대로 알려짐)" },
    { code: "ESFP", group: "SP", nick: "무대 위 주인공", key: ["활력", "사교", "낙천", "즐거움"], fn: ["Se", "Fi", "Te", "Ni"], rarity: "흔한 편(약 8%대로 알려짐)" }
  ];
  var BY_CODE = {}; TYPES.forEach(function (t) { BY_CODE[t.code] = t; });

  // 네 글자 의미 (E/I, S/N, T/F, J/P)
  var AXES = {
    EI: { front: "E", back: "I", frontName: "외향", backName: "내향", desc: "에너지를 어디서 충전하나 — 밖(사람·활동)에서면 E, 안(혼자·생각)에서면 I." },
    SN: { front: "S", back: "N", frontName: "감각", backName: "직관", desc: "정보를 어떻게 받아들이나 — 구체적 사실 중심이면 S, 의미·가능성 중심이면 N." },
    TF: { front: "T", back: "F", frontName: "사고", backName: "감정", desc: "무엇으로 결정하나 — 논리·기준이면 T, 사람·가치면 F." },
    JP: { front: "J", back: "P", frontName: "판단", backName: "인식", desc: "생활 방식 — 계획·정리를 선호하면 J, 유연·즉흥을 선호하면 P." }
  };
  var AXIS_ORDER = ["EI", "SN", "TF", "JP"];
  function letters(code) { return { EI: code[0], SN: code[1], TF: code[2], JP: code[3] }; }

  // ── 궁합 공식 (4-2) : 모든 숫자는 여기서만 ──
  function same(a, b, idx) { return a[idx] === b[idx]; }
  function romance(a, b) {
    return 35 + (same(a, b, 1) ? 25 : 0) + (same(a, b, 0) ? 8 : 15) + (same(a, b, 2) ? 8 : 12) + (same(a, b, 3) ? 12 : 6);
  }
  function friend(a, b) {
    return 40 + (same(a, b, 1) ? 25 : 5) + (same(a, b, 0) ? 12 : 8) + (same(a, b, 2) ? 12 : 6) + (same(a, b, 3) ? 8 : 6);
  }
  function work(a, b) {
    return 40 + (same(a, b, 1) ? 15 : 8) + (same(a, b, 0) ? 8 : 10) + (same(a, b, 2) ? 8 : 14) + (same(a, b, 3) ? 15 : 5);
  }
  function grade(score) {
    if (score >= 85) return { emoji: "💚", label: "찰떡궁합", key: "best" };
    if (score >= 75) return { emoji: "💙", label: "잘 맞아요", key: "good" };
    if (score >= 65) return { emoji: "💛", label: "노력하면 좋아요", key: "soso" };
    return { emoji: "🧡", label: "다름을 배우는 사이", key: "learn" };
  }
  function compat(a, b) {
    var r = romance(a, b);
    return { romance: r, friend: friend(a, b), work: work(a, b), grade: grade(r) };
  }

  // ── 축별 해설 문장 (4-3) ──
  var AXIS_SENT = {
    EI: { same: "둘 다 에너지를 채우는 방식이 비슷해, 함께 있는 시간과 혼자 쉬는 시간의 리듬이 잘 맞아요.",
          diff: "한 사람은 밖에서, 다른 사람은 안에서 충전해요. 약속 뒤 각자 쉬는 시간을 존중하면 오히려 서로를 채워 줘요." },
    SN: { same: "정보를 받아들이는 결이 비슷해서 대화가 겉돌지 않아요.",
          diff: "한 사람은 구체적인 사실부터, 다른 사람은 가능성부터 말해요. ‘지금 현실 얘기야, 아이디어 얘기야?’를 먼저 맞추면 오해가 줄어요." },
    TF: { same: "결정의 기준이 비슷해서 서로의 선택을 이해하기 쉬워요.",
          diff: "한 사람은 논리로, 다른 사람은 마음으로 판단해요. 결론만큼 ‘왜 그렇게 느꼈는지’도 들어 주면 균형이 맞아요." },
    JP: { same: "생활 리듬(계획형·즉흥형)이 비슷해 일정 다툼이 적어요.",
          diff: "한 사람은 계획을, 다른 사람은 여유를 좋아해요. 큰 틀만 정하고 세부는 유연하게 두면 둘 다 편해요." }
  };
  function axisLines(a, b) {
    return AXIS_ORDER.map(function (ax) {
      var idx = { EI: 0, SN: 1, TF: 2, JP: 3 }[ax];
      var eq = same(a, b, idx);
      return { axis: ax, same: eq, text: eq ? AXIS_SENT[ax].same : AXIS_SENT[ax].diff };
    });
  }
  // "서로에게 이렇게 해 주세요" 팁 2개 (차이 축 우선: SN>TF>EI>JP)
  var TIP = {
    EI: { diff: "약속이 끝나면 각자 충전 시간을 먼저 챙겨 주세요.", same: "둘 다 비슷한 에너지라, 가끔은 평소와 다른 방식도 시도해 보세요." },
    SN: { diff: "이야기 시작 전에 ‘사실 얘기인지 아이디어 얘기인지’를 한마디로 맞춰 주세요.", same: "결이 비슷한 만큼, 서로 놓친 관점은 없는지 한 번씩 점검해 주세요." },
    TF: { diff: "지적보다 ‘네 마음은 어때?’를 먼저, 그다음 해결책을 말해 주세요.", same: "판단 기준이 같을수록, 제3의 시선을 일부러 넣어 주면 좋아요." },
    JP: { diff: "약속은 큰 틀만 정하고 세부는 서로에게 맡겨 주세요.", same: "리듬이 같은 만큼, 미루지 않게 서로 가볍게 리마인드해 주세요." }
  };
  function tips(a, b) {
    var order = ["SN", "TF", "EI", "JP"], idxOf = { EI: 0, SN: 1, TF: 2, JP: 3 };
    var diffs = order.filter(function (ax) { return !same(a, b, idxOf[ax]); });
    var pick = diffs.slice(0, 2);
    while (pick.length < 2) { // 차이가 적으면 같은 축 팁으로 채움
      for (var i = 0; i < order.length; i++) { if (pick.indexOf(order[i]) < 0) { pick.push(order[i]); break; } }
    }
    return pick.map(function (ax) { return same(a, b, idxOf[ax]) ? TIP[ax].same : TIP[ax].diff; });
  }

  // 유형별 상위/하위 궁합 (연애 점수 기준, 자기 자신 제외)
  function ranked(code) {
    var arr = TYPES.filter(function (t) { return t.code !== code; })
      .map(function (t) { return { code: t.code, nick: t.nick, score: romance(code, t.code) }; })
      .sort(function (x, y) { return y.score - x.score || x.code.localeCompare(y.code); });
    return arr;
  }
  function bestMatches(code, n) { return ranked(code).slice(0, n || 3); }
  function hardMatches(code, n) { var a = ranked(code); return a.slice(a.length - (n || 3)).reverse(); }

  // ── 테스트 채점 (3) ──
  // answers: {qid: -2..+2}, questions: [{id, axis, pole, text}]
  function scoreTest(answers, questions) {
    var sum = { EI: 0, SN: 0, TF: 0, JP: 0 };
    questions.forEach(function (q) {
      var r = Number(answers[q.id]); if (!isFinite(r)) r = 0;
      var front = AXES[q.axis].front;              // 앞 글자 방향(+)
      var contrib = (q.pole === front) ? r : -r;   // pole이 뒷글자면 부호 뒤집어 앞글자 기준으로
      sum[q.axis] += contrib;
    });
    var code = "", axes = {};
    AXIS_ORDER.forEach(function (ax) {
      var s = sum[ax];                              // -24..+24
      var frontPct = Math.round((s + 24) / 48 * 100);
      var isFront = frontPct >= 50;                 // 정확히 50%는 뒷글자(아래에서 처리)
      if (frontPct === 50) isFront = false;         // 동점 → 뒷 글자(I/N/F/P)
      var letter = isFront ? AXES[ax].front : AXES[ax].back;
      code += letter;
      axes[ax] = { frontPct: frontPct, backPct: 100 - frontPct, letter: letter, front: AXES[ax].front, back: AXES[ax].back };
    });
    return { code: code, axes: axes, type: BY_CODE[code] || null };
  }

  var api = {
    GROUPS: GROUPS, TYPES: TYPES, BY_CODE: BY_CODE, AXES: AXES, AXIS_ORDER: AXIS_ORDER,
    letters: letters, romance: romance, friend: friend, work: work, grade: grade, compat: compat,
    axisLines: axisLines, tips: tips, ranked: ranked, bestMatches: bestMatches, hardMatches: hardMatches,
    scoreTest: scoreTest
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MBTI = api;
})(typeof window !== "undefined" ? window : this);
