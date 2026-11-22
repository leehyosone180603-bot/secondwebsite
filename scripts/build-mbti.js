/* MBTI 유형 글 16개 + 허브 글 생성기.
 * 궁합 수치·네글자·별명·그룹은 mbti-data.js에서 가져와 '단일 출처'를 보장한다.
 * 본문(고유 산문)은 mbti/articles/<code>.js 에서 읽는다.
 * 실행: node scripts/build-mbti.js   → posts/mbti-*.html 생성 + POSTS 스니펫 출력 */
"use strict";
const fs = require("fs");
const path = require("path");
const M = require(path.join(__dirname, "..", "mbti", "mbti-data.js"));

const SITE = "https://healthfortune.co.kr";
const AD_TOP = "3265568294", AD_MID = "1082258087";
const FN_NAME = {
  Ni: "내향 직관(Ni)", Ne: "외향 직관(Ne)", Si: "내향 감각(Si)", Se: "외향 감각(Se)",
  Ti: "내향 사고(Ti)", Te: "외향 사고(Te)", Fi: "내향 감정(Fi)", Fe: "외향 감정(Fe)"
};
const FN_ROLE = ["주기능", "부기능", "3차 기능", "열등기능"];
const AXIS_ROW = [
  ["EI", "E / I", "외향 · 내향"], ["SN", "S / N", "감각 · 직관"],
  ["TF", "T / F", "사고 · 감정"], ["JP", "J / P", "판단 · 인식"]
];
const gradeClass = { best: "gr-best", good: "gr-good", soso: "gr-soso", learn: "gr-learn" };

function ad(slot) {
  return '<div class="ad-container" aria-label="광고"><ins class="adsbygoogle" style="display:block" ' +
    'data-ad-client="ca-pub-7143828779500885" data-ad-slot="' + slot +
    '" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
}
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

function compatBlock(code, C) {
  const best = M.bestMatches(code, 3), hard = M.hardMatches(code, 3);
  function row(x) {
    const g = M.grade(x.score);
    const reason = (C.compatReason && C.compatReason[x.code]) || "";
    return '<div class="ci"><a href="/mbti-match/?a=' + code.toLowerCase() + '&b=' + x.code.toLowerCase() + '">' +
      '<b>' + x.code + '</b> ' + x.nick + '</a>' +
      '<span class="ci-s"><span class="badge ' + gradeClass[g.key] + '">' + g.emoji + ' ' + x.score + '</span></span>' +
      '</div>' + (reason ? '<p class="ci-why">' + reason + '</p>' : "");
  }
  return '<div class="compat-grid">' +
    '<div><h4>💚 잘 맞는 유형 TOP 3</h4>' + best.map(row).join("") + '</div>' +
    '<div><h4>🧡 노력이 필요한 유형 3</h4>' + hard.map(row).join("") + '</div></div>' +
    '<p class="muted" style="margin-top:10px;font-size:.88rem">궁합은 재미로 보는 참고 지표예요. 점수가 낮아도 서로 배우며 맞춰 가면 되고, 결국 관계는 두 사람의 노력에 달려 있습니다. ' +
    '<a href="/mbti-match/?a=' + code.toLowerCase() + '">나와 다른 유형과의 궁합도 계산기에서 확인 →</a></p>';
}

function renderArticle(code, C) {
  const t = M.BY_CODE[code], group = M.GROUPS[t.group], nick = t.nick;
  const L = M.letters(code);
  // 한눈에 보기
  const best2 = M.bestMatches(code, 2).map(x => x.code + " " + x.nick).join(", ");
  const glance =
    '<div class="glance-box"><h2 class="gb-h">한눈에 보기</h2><dl class="gb-grid">' +
    '<div><dt>별명</dt><dd>' + nick + '</dd></div>' +
    '<div><dt>코드 · 그룹</dt><dd>' + code + ' · ' + group + '</dd></div>' +
    '<div><dt>핵심 키워드</dt><dd>' + t.key.join(" · ") + '</dd></div>' +
    '<div><dt>흔한 정도</dt><dd>' + t.rarity + '</dd></div>' +
    '<div><dt>인지기능</dt><dd>' + t.fn.join(" → ") + '</dd></div>' +
    '<div><dt>잘 맞는 유형</dt><dd>' + best2 + '</dd></div>' +
    '</dl></div>';
  // 목차
  const TOC = [
    "어떤 사람일까요", "5가지 핵심 성향", "머릿속 — 인지기능", "스트레스와 회복",
    "일할 때", "연애·친구·가족", "궁합", "성장하는 법", "좋아하는 취미", "A와 T의 차이", "자주 묻는 질문"
  ];
  const toc = '<nav class="toc-box"><b>목차</b><ol>' +
    TOC.map((x, i) => '<li><a href="#s' + (i + 1) + '">' + x + '</a></li>').join("") + '</ol></nav>';
  // 네 글자 풀이
  const letterTbl = '<table class="mini-tbl"><thead><tr><th>글자</th><th>뜻</th><th>' + code + '에서 드러나는 모습</th></tr></thead><tbody>' +
    AXIS_ROW.map(r => {
      const ax = r[0], ch = L[ax], a = M.AXES[ax];
      const meaning = ch === a.front ? a.frontName : a.backName;
      return '<tr><td><b>' + ch + '</b></td><td>' + meaning + '</td><td>' + C.letterMeaning[ax] + '</td></tr>';
    }).join("") + '</tbody></table>';
  // 핵심 성향
  const traits = C.traits.map((tr, i) => {
    const mark = tr.shadow ? ' <span class="shadow-tag">그림자 성향</span>' : "";
    return '<h3>' + "①②③④⑤"[i] + " " + tr.name + mark + '</h3><p>' + tr.p1 + '</p><p>' + tr.p2 + '</p>';
  }).join("");
  const swTbl = '<table class="sw-tbl"><thead><tr><th>💪 강점</th><th>🌱 약점과 보완 팁</th></tr></thead><tbody>' +
    [0, 1, 2, 3, 4].map(i =>
      '<tr><td>' + (C.strengths[i] || "") + '</td><td>' + (C.weaknesses[i] ? C.weaknesses[i].w + ' <span class="tip">→ ' + C.weaknesses[i].tip + '</span>' : "") + '</td></tr>'
    ).join("") + '</tbody></table>';
  // 인지기능
  const cogIntro = C.cogIntro ||
    "인지기능은 ‘머릿속이 정보를 받아들이고 결정을 내리는 순서’예요. 사람마다 자주 쓰는 기능의 순서가 다른데, 아래 네 가지를 자주 쓰는 순서대로 보면 이 유형이 왜 그렇게 행동하는지 이해가 쉬워집니다.";
  const cogKeys = ["dom", "aux", "ter", "inf"];
  const cog = '<p>' + cogIntro + '</p>' + cogKeys.map((k, i) =>
    '<h3>' + FN_ROLE[i] + " · " + FN_NAME[t.fn[i]] + '</h3><p>' + C.cog[k] + '</p>'
  ).join("");
  // 스트레스
  const stress =
    '<h3>이럴 때 지쳐요</h3><ul>' + C.stress.tired.map(x => '<li>' + x + '</li>').join("") + '</ul>' +
    '<h3>지쳤다는 신호</h3><ul>' + C.stress.signals.map(x => '<li>' + x + '</li>').join("") + '</ul>' +
    '<h3>' + code + '에게 맞는 회복법</h3><ul class="recover">' +
    ['sleep', 'exercise', 'food', 'mind'].map(k => '<li>' + C.stress.recover[k] + '</li>').join("") + '</ul>';
  // 일할 때
  const jobTbl = '<table class="mini-tbl job-tbl"><thead><tr><th>추천 직업</th><th>왜 잘 맞나</th></tr></thead><tbody>' +
    C.work.jobs.map(j => '<tr><td>' + j.job + '</td><td>' + j.why + '</td></tr>').join("") + '</tbody></table>';
  const work =
    '<h3>잘 맞는 / 버거운 업무 환경</h3>' +
    '<div class="two-col"><div class="tc up"><b>잘 맞는 환경</b><ul>' + C.work.good.map(x => '<li>' + x + '</li>').join("") + '</ul></div>' +
    '<div class="tc care"><b>버거운 환경</b><ul>' + C.work.hard.map(x => '<li>' + x + '</li>').join("") + '</ul></div></div>' +
    '<h3>추천 직업 10선</h3>' + jobTbl +
    '<h3>리더일 때 · 팀원일 때</h3><p><b>리더일 때 —</b> ' + C.work.leader + '</p><p><b>팀원일 때 —</b> ' + C.work.member + '</p>';
  // 관계
  const rel =
    '<h3>연애할 때</h3><p>' + C.rel.love + '</p>' +
    '<h3>친구로서</h3><p>' + C.rel.friend + '</p>' +
    '<h3>부모로서</h3><p>' + C.rel.parent + '</p>' +
    '<h3>' + code + '와(과) 잘 지내는 법</h3><ul>' + C.rel.getalong.map(x => '<li>' + x + '</li>').join("") + '</ul>';
  // 성장
  const grow = '<ol class="grow">' + C.grow.map(x => '<li>' + x + '</li>').join("") + '</ol>';
  // 취미
  const hobby = C.hobby.groups.map(g =>
    '<h3>' + g.name + '</h3><p>' + g.items.join(" · ") + '</p><p class="muted">' + g.why + '</p>'
  ).join("");
  // A/T
  const at = '<p class="muted" style="font-size:.9rem">A/T는 원래 MBTI 네 글자 체계에는 없는 확장 개념으로, 자신감과 스트레스 반응의 결을 덧붙여 보는 지표예요.</p>' +
    '<table class="mini-tbl"><thead><tr><th></th><th>' + code + '-A (자기주장형)</th><th>' + code + '-T (신중형)</th></tr></thead><tbody>' +
    '<tr><td><b>스트레스 반응</b></td><td>' + C.at.stress[0] + '</td><td>' + C.at.stress[1] + '</td></tr>' +
    '<tr><td><b>자신감</b></td><td>' + C.at.confidence[0] + '</td><td>' + C.at.confidence[1] + '</td></tr>' +
    '<tr><td><b>대인관계</b></td><td>' + C.at.relation[0] + '</td><td>' + C.at.relation[1] + '</td></tr>' +
    '</tbody></table>';
  // FAQ
  const faq = '<div class="faq-section">' + C.faq.map(f =>
    '<h3>' + f.q + '</h3><p>' + f.a + '</p>').join("") + '</div>';
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": C.faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]+>/g, "") } }))
  };
  // 같은 그룹 카드
  const siblings = M.TYPES.filter(x => x.group === t.group && x.code !== code);
  const sibCards = siblings.map(s =>
    '<a class="sib-card" href="/posts/mbti-' + s.code.toLowerCase() + '.html"><b>' + s.code + '</b><span>' + s.nick + '</span></a>'
  ).join("") +
    '<a class="sib-card hub" href="/posts/mbti-16-types.html"><b>📚</b><span>16유형 총정리</span></a>';

  const title = code + ' 성격 특징 완전정리 — ' + nick + '의 성향·연애·직업·궁합';
  const desc = code + '(' + nick + ') 완전정리. 5가지 핵심 성향, 인지기능, 스트레스 회복법, 추천 직업 10선, 연애·친구·가족 관계, 궁합 TOP3와 성장법·취미·FAQ까지 한 번에.';
  const url = SITE + '/posts/mbti-' + code.toLowerCase() + '.html';
  const articleLd = {
    "@context": "https://schema.org", "@type": "Article",
    "headline": title, "description": desc,
    "author": { "@type": "Organization", "name": "건강흐름" },
    "publisher": { "@type": "Organization", "name": "건강흐름" },
    "mainEntityOfPage": url, "inLanguage": "ko"
  };

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | 건강흐름</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="keywords" content="${code}, ${code} 특징, ${code} ${nick}, ${code} 연애, ${code} 직업, ${code} 궁합, MBTI ${code}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="건강흐름">
  <script type="application/ld+json">${JSON.stringify(articleLd)}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/mbti/mbti.css?v=2">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7143828779500885" crossorigin="anonymous"></script>
</head>
<body data-cat="life">
  <header id="site-header"></header>
  <main class="wrap">
    <article class="article mbti-article" data-ads="manual">
      <span class="article__cat">MBTI · 성격</span>
      <h1 class="article__title">${esc(code + ' 성격 특징 완전정리 — ' + nick)}</h1>
      <div class="article__meta">건강흐름 · 성격유형 가이드</div>

      <nav class="mbti-tabs">
        <a class="mbti-tab" href="/mbti-test/">🧭 MBTI 테스트</a>
        <a class="mbti-tab" href="/mbti-match/">💞 궁합 계산기</a>
        <a class="mbti-tab" href="/posts/mbti-16-types.html">📚 16유형 총정리</a>
      </nav>

      ${glance}
      ${toc}
      ${ad(AD_TOP)}

      <div class="article__body">
        <h2 id="s1">1. ${code}는 어떤 사람일까요?</h2>
        <h3>이런 장면, 익숙하지 않나요?</h3>
        ${C.scenes.map(s => '<p>' + s + '</p>').join("\n        ")}
        <h3>${code} 네 글자 풀이</h3>
        ${letterTbl}
        <h3>얼마나 흔한 유형일까요?</h3>
        <p>${C.common}</p>

        <h2 id="s2">2. ${code}를 만드는 5가지 핵심 성향</h2>
        <p>${C.traitsIntro}</p>
        ${traits}
        <h3>강점과 약점 한눈에</h3>
        ${swTbl}

        <h2 id="s3">3. 머릿속은 이렇게 돌아가요 — 인지기능 4단계</h2>
        ${cog}

        <h2 id="s4">4. 스트레스 신호와 회복 루틴</h2>
        ${stress}

        ${ad(AD_MID)}

        <h2 id="s5">5. 일할 때의 ${code}</h2>
        ${work}

        <h2 id="s6">6. 연애·친구·가족 관계</h2>
        ${rel}

        <h2 id="s7">7. ${code} 궁합</h2>
        ${compatBlock(code, C)}

        <h2 id="s8">8. ${code}가 더 성장하는 5가지 방법</h2>
        ${grow}

        <h2 id="s9">9. ${code}가 좋아하는 취미</h2>
        ${hobby}

        <h2 id="s10">10. ${code}-A와 ${code}-T는 어떻게 다를까요?</h2>
        ${at}

        <h2 id="s11">11. 자주 묻는 질문</h2>
        ${faq}
      </div>

      <div class="cta-box">
        <p><b>내 유형이 궁금하다면?</b></p>
        <div class="cta-btns"><a class="btn-primary" href="/mbti-test/">🧭 MBTI 테스트 하기</a>
        <a class="btn-ghost" href="/mbti-match/?a=${code.toLowerCase()}">💞 ${code} 궁합 보기</a></div>
      </div>

      <h3 class="sib-h">같은 ${group} 유형 더 보기</h3>
      <div class="sib-grid">${sibCards}</div>

      <p class="disclaimer-box">이 콘텐츠는 성격유형 이론을 바탕으로 한 참고·재미용 정보이며, 공식 MBTI® 검사나 전문 심리진단을 대신하지 않습니다. MBTI는 The Myers-Briggs Company의 등록상표입니다.</p>

      <div class="article__nav"><a class="btn" href="/">‹ 홈으로</a> <a class="btn" href="/posts/mbti-16-types.html">16유형 총정리 ›</a></div>
    </article>
  </main>
  <footer id="site-footer"></footer>
  <script src="/js/posts.js"></script>
  <script src="/js/site.js"></script>
  <script defer src="/js/analytics.js"></script>
</body>
</html>
`;
}

function renderHub() {
  const url = SITE + "/posts/mbti-16-types.html";
  const groupCards = Object.keys(M.GROUPS).map(gk => {
    const members = M.TYPES.filter(t => t.group === gk);
    return '<section class="hub-group"><h3>' + gk + ' · ' + M.GROUPS[gk] + '</h3><div class="hub-types">' +
      members.map(t => '<a href="/posts/mbti-' + t.code.toLowerCase() + '.html"><b>' + t.code + '</b><span>' + t.nick + '</span></a>').join("") +
      '</div></section>';
  }).join("");
  const letterTbl = '<table class="mini-tbl"><thead><tr><th>글자</th><th>뜻</th><th>설명</th></tr></thead><tbody>' +
    M.AXIS_ORDER.map(ax => {
      const a = M.AXES[ax];
      return '<tr><td><b>' + a.front + ' / ' + a.back + '</b></td><td>' + a.frontName + ' · ' + a.backName + '</td><td>' + a.desc + '</td></tr>';
    }).join("") + '</tbody></table>';
  const faqs = [
    { q: "MBTI는 어떻게 정해지나요?", a: "네 가지 축(E/I, S/N, T/F, J/P)에서 각각 더 익숙한 쪽을 고르면 네 글자 조합이 나와요. 건강흐름 <a href=\"/mbti-test/\">48문항 테스트</a>로 약 6~8분이면 확인할 수 있습니다." },
    { q: "검사할 때마다 유형이 바뀌어요.", a: "경계에 가까운 성향은 그날의 상황·기분에 따라 바뀔 수 있어요. 각 축의 비율이 50%에 가까울수록 두 성향을 함께 가졌다고 보면 됩니다." },
    { q: "궁합이 안 좋으면 안 맞는 사이인가요?", a: "아니에요. 궁합 점수는 ‘무엇을 맞춰 가면 좋은지’의 힌트일 뿐이고, 다른 점이 많을수록 서로 배울 여지도 큽니다. <a href=\"/mbti-match/\">궁합 계산기</a>에서 관계 팁까지 확인해 보세요." },
    { q: "A와 T는 무슨 차이인가요?", a: "자기주장형(A)과 신중형(T)은 원래 네 글자 체계에는 없는 확장 개념으로, 자신감과 스트레스 반응의 결을 덧붙여 봅니다. 각 유형 글의 10번 항목에서 비교해 두었어요." },
    { q: "이 글들은 공식 MBTI 설명인가요?", a: "성격유형 이론을 참고해 건강흐름이 자체 정리한 참고·재미용 콘텐츠입니다. 공식 검사나 전문 진단을 대신하지 않습니다." }
  ];
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a.replace(/<[^>]+>/g, "") } })) };
  const title = "MBTI 16가지 유형 총정리 — 성향·궁합·직업 한눈에";
  const desc = "MBTI 16유형을 생각설계(NT)·마음공감(NF)·안정지킴(SJ)·현장행동(SP) 네 그룹으로 정리했어요. 유형별 성향·연애·직업·궁합과 무료 테스트·궁합 계산기까지 한 곳에.";
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} | 건강흐름</title>
  <meta name="description" content="${esc(desc)}">
  <meta name="keywords" content="MBTI, MBTI 16유형, MBTI 유형, 성격유형, MBTI 궁합, MBTI 테스트">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="건강흐름">
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/mbti/mbti.css?v=2">
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7143828779500885" crossorigin="anonymous"></script>
</head>
<body data-cat="life">
  <header id="site-header"></header>
  <main class="wrap">
    <article class="article mbti-article" data-ads="manual">
      <span class="article__cat">MBTI · 성격</span>
      <h1 class="article__title">MBTI 16가지 유형 총정리</h1>
      <div class="article__meta">건강흐름 · 성격유형 가이드</div>

      <nav class="mbti-tabs">
        <a class="mbti-tab" href="/mbti-test/">🧭 MBTI 테스트</a>
        <a class="mbti-tab" href="/mbti-match/">💞 궁합 계산기</a>
        <a class="mbti-tab is-active" href="/posts/mbti-16-types.html">📚 16유형 총정리</a>
      </nav>

      ${ad(AD_TOP)}

      <div class="article__body">
        <p>MBTI는 사람의 성향을 네 가지 축으로 나눠 16가지 유형으로 설명하는 성격유형 모델이에요. 아래에서 네 글자의 의미를 먼저 보고, 관심 가는 유형 카드를 눌러 자세한 설명으로 이동해 보세요. 내 유형을 모른다면 <a href="/mbti-test/">48문항 무료 테스트</a>부터 시작하면 됩니다.</p>

        <h2>네 글자의 의미</h2>
        ${letterTbl}

        <h2>16유형 — 네 그룹으로 보기</h2>
        ${groupCards}

        <div class="cta-box">
          <p><b>내 유형이 궁금하다면?</b></p>
          <div class="cta-btns"><a class="btn-primary" href="/mbti-test/">🧭 MBTI 테스트 하기</a>
          <a class="btn-ghost" href="/mbti-match/">💞 궁합 계산기</a></div>
        </div>

        <h2>자주 묻는 질문</h2>
        <div class="faq-section">${faqs.map(f => '<h3>' + f.q + '</h3><p>' + f.a + '</p>').join("")}</div>
      </div>

      <p class="disclaimer-box">이 콘텐츠는 성격유형 이론을 바탕으로 한 참고·재미용 정보이며, 공식 MBTI® 검사나 전문 심리진단을 대신하지 않습니다. MBTI는 The Myers-Briggs Company의 등록상표입니다.</p>
      <div class="article__nav"><a class="btn" href="/">‹ 홈으로</a></div>
    </article>
  </main>
  <footer id="site-footer"></footer>
  <script src="/js/posts.js"></script>
  <script src="/js/site.js"></script>
  <script defer src="/js/analytics.js"></script>
</body>
</html>
`;
}

// ── 실행 ──
const outDir = path.join(__dirname, "..", "posts");
const artDir = path.join(__dirname, "..", "mbti", "articles");
const only = process.argv.slice(2); // 코드 지정 시 그것만
let built = [];
M.TYPES.forEach(t => {
  if (only.length && only.indexOf(t.code) < 0) return;
  const f = path.join(artDir, t.code.toLowerCase() + ".js");
  if (!fs.existsSync(f)) { console.log("· skip " + t.code + " (content 없음)"); return; }
  delete require.cache[require.resolve(f)];
  const C = require(f);
  const html = renderArticle(t.code, C);
  fs.writeFileSync(path.join(outDir, "mbti-" + t.code.toLowerCase() + ".html"), html);
  // 본문 글자수(태그 제거, 공백 포함)
  const bodyText = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "");
  const chars = bodyText.replace(/\s+/g, " ").length;
  built.push({ code: t.code, chars });
  console.log("✓ mbti-" + t.code.toLowerCase() + ".html  (" + chars + "자)");
});
if (!only.length || only.indexOf("HUB") >= 0) {
  fs.writeFileSync(path.join(outDir, "mbti-16-types.html"), renderHub());
  console.log("✓ mbti-16-types.html (허브)");
}
// 글자수 경고
built.forEach(b => { if (b.chars < 6000 || b.chars > 8000) console.log("  ⚠ " + b.code + " 분량 " + b.chars + "자 (목표 6000~8000)"); });
console.log("\n완료: " + built.length + "개 유형 글" + ((!only.length || only.indexOf("HUB") >= 0) ? " + 허브" : ""));
