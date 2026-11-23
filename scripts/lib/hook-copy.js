/* 후킹 제목·카피라이팅 엔진 (PART A)
 * - 훅 패턴 10종, 채점표(A-4), 길이 규칙(A-5), 금지 표현(A-6), X 가중 글자수(B-3)
 * - 라이브러리로 사용: require("./lib/hook-copy")
 * 본문에 없는 정보를 지어내지 않는다. 점수·검증·슬롯 조립만 담당한다.
 */
"use strict";

/* A-3. 훅 패턴 10종 */
const PATTERNS = [
  { n: 1, key: "number",     name: "숫자",        hint: "〇つ/〇選/〇割" },
  { n: 2, key: "target",     name: "대상 지정",   hint: "40代から/60代以上は/〇〇な人は" },
  { n: 3, key: "question",   name: "질문형",      hint: "〜は本当？/〜は何個まで？" },
  { n: 4, key: "surprise",   name: "의외성",      hint: "実は〜/意外と知らない" },
  { n: 5, key: "loss",       name: "손실 회피",   hint: "〜してない？/〜は逆効果" },
  { n: 6, key: "selfcheck",  name: "셀프체크",    hint: "当てはまったら要注意/チェック" },
  { n: 7, key: "compare",    name: "비교",        hint: "AとBの違い" },
  { n: 8, key: "season",     name: "계절·시점",   hint: "今の時期/冬こそ/年末までに" },
  { n: 9, key: "korea",      name: "한국 현지",   hint: "韓国在住の編集部が/韓国では当たり前の" },
  { n: 10, key: "result",    name: "구체적 결과", hint: "〜するだけ/〇分で" },
];

/* A-6. 금지 표현 (약기법·과장·낚시) */
const FORBIDDEN = [
  "治る", "治す", "予防できる", "効く", "消える", "劇的",
  "医者が隠す", "知らないと死ぬ", "絶対にやってはいけない",
  "必見", "衝撃", "ヤバい", "美白",
];
const FORBIDDEN_RE_DAYSLIM = /\d+\s*日で痩せ/; // 「〇日で痩せる」

function checkForbidden(text) {
  const t = String(text || "");
  const hits = FORBIDDEN.filter(w => t.indexOf(w) !== -1);
  if (FORBIDDEN_RE_DAYSLIM.test(t)) hits.push("〇日で痩せる");
  return hits;
}

/* 이모지 개수(대략) */
function emojiCount(text) {
  const m = String(text || "").match(/[←-⇿⌀-➿⬀-⯿ἀ0-ᾯF️❤]/gu);
  return m ? m.length : 0;
}

/* ── X 가중 글자수 (B-3): CJK=2, 영숫자/기타=1, URL=23 ── */
function isWide(cp) {
  return (
    (cp >= 0x1100 && cp <= 0x115F) ||   // Hangul Jamo
    (cp >= 0x2E80 && cp <= 0x303E) ||   // CJK Radicals·Kangxi·punct
    (cp >= 0x3041 && cp <= 0x33FF) ||   // Hiragana·Katakana·CJK symbols
    (cp >= 0x3400 && cp <= 0x4DBF) ||   // CJK Ext A
    (cp >= 0x4E00 && cp <= 0x9FFF) ||   // CJK Unified
    (cp >= 0xA000 && cp <= 0xA4CF) ||
    (cp >= 0xAC00 && cp <= 0xD7A3) ||   // Hangul Syllables
    (cp >= 0xF900 && cp <= 0xFAFF) ||
    (cp >= 0xFF00 && cp <= 0xFF60) ||   // Fullwidth forms
    (cp >= 0xFFE0 && cp <= 0xFFE6) ||
    (cp >= 0x20000 && cp <= 0x3FFFD)
  );
}
const URL_RE = /https?:\/\/[^\s]+/g;
function weightedLength(text) {
  let s = String(text || "");
  let urlN = 0;
  s = s.replace(URL_RE, () => { urlN++; return ""; });
  let w = 0;
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp === 0x0a || cp === 0x0d) { w += 1; continue; }
    w += isWide(cp) ? 2 : 1;
  }
  return w + urlN * 23;
}
function parseTweet(text) {
  const wl = weightedLength(text);
  return { weightedLength: wl, valid: wl <= 280 };
}

/* 표시 글자수(전각/반각 구분 없이 코드포인트 수) */
function charLen(text) { return Array.from(String(text || "")).length; }

/* ── 검출 헬퍼 ── */
const NUM_RE = /(\d+|[一二三四五六七八九十])\s*(つ|選|割|個|分|日|歳|位|点|秒|の方法|のこと|のサイン|のポイント|のルール|の習慣)/;
const TARGET_RE = /(\d+代|[一二三四五六七八九十]+代|高齢|シニア|\d+歳以上|以上は|な人|あなた|ママ|主婦|働く|デスクワーク)/;
const TIME_RE = /(今|今の時期|冬|夏|春|秋|朝|夜|寝る前|年末|年始|\d+分|\d+日|毎日|季節)/;
const CURIOSITY_RE = /(？|\?|実は|意外|知らない|本当|なぜ|理由|違い)/;
const CHECK_RE = /(チェック|当てはま|かも|サイン|隠れ)/;

function firstNumber(text) {
  const m = String(text || "").match(/(\d+)|([一二三四五六七八九十]+)/);
  if (!m) return null;
  if (m[1]) return parseInt(m[1], 10);
  const map = { 一:1, 二:2, 三:3, 四:4, 五:5, 六:6, 七:7, 八:8, 九:9, 十:10 };
  const s = m[2]; if (s === "十") return 10;
  if (s.length === 1) return map[s] || null;
  // 十N / N十
  if (s[0] === "十") return 10 + (map[s[1]] || 0);
  if (s[1] === "十") return (map[s[0]] || 0) * 10 + (map[s[2]] || 0);
  return map[s[0]] || null;
}

/* ── A-4. 채점 (10점) ──
 * opts: { keyword, bodyItemCount, bodyFulfills=true }
 * 반환: { total, breakdown, ok, reasons[] }
 */
function scoreTitle(title, opts) {
  opts = opts || {};
  const t = String(title || "");
  const kw = opts.keyword || "";
  const reasons = [];

  // 구체성: 숫자·대상·기간 중 1=1, 2+=2
  let specCnt = 0;
  if (NUM_RE.test(t) || /\d/.test(t)) specCnt++;
  if (TARGET_RE.test(t)) specCnt++;
  if (TIME_RE.test(t)) specCnt++;
  const spec = specCnt >= 2 ? 2 : (specCnt === 1 ? 1 : 0);

  // 호기심 간극: 질문형/의외성/체크형
  let cur = 0;
  if (CURIOSITY_RE.test(t)) cur++;
  if (CHECK_RE.test(t)) cur++;
  cur = Math.min(2, cur);

  // 자기관련성: 대상 명시 2, 상황 1, 없음 0
  let rel = 0;
  if (TARGET_RE.test(t)) rel = 2;
  else if (TIME_RE.test(t)) rel = 1;

  // 키워드 포함: 앞 15자 안 2, 뒤쪽 1, 없음 0
  let kwScore = 0;
  if (kw) {
    const idx = t.indexOf(kw);
    if (idx >= 0 && idx < 15) kwScore = 2;
    else if (idx >= 0) kwScore = 1;
    else {
      // 부분 일치(키워드 핵심어)
      const head = kw.replace(/\s.*$/, "");
      const i2 = head ? t.indexOf(head) : -1;
      if (i2 >= 0 && i2 < 15) kwScore = 2; else if (i2 >= 0) kwScore = 1;
    }
  }

  // 약속 이행: bodyFulfills=false → 0(채택불가), 제목 숫자≠본문 항목수 → 0(채택불가)
  let promise = 2;
  const tn = firstNumber(t);
  if (opts.bodyFulfills === false) { promise = 0; reasons.push("본문이 약속 미충족"); }
  else if (tn != null && opts.bodyItemCount != null && tn !== opts.bodyItemCount) {
    promise = 0; reasons.push("제목 숫자(" + tn + ")≠본문 항목수(" + opts.bodyItemCount + ")");
  }

  const breakdown = { 구체성: spec, 호기심: cur, 자기관련성: rel, 키워드: kwScore, 약속이행: promise };
  const total = spec + cur + rel + kwScore + promise;
  const forbidden = checkForbidden(t);
  const ok = total >= 7 && promise > 0 && forbidden.length === 0;
  if (forbidden.length) reasons.push("금지표현: " + forbidden.join(","));
  return { total, breakdown, ok, reasons, forbidden, titleNumber: tn };
}

/* ── A-5. 길이 검증 ── */
function validateBlogTitle(title, opts) {
  opts = opts || {};
  const len = charLen(title);
  const kw = opts.keyword || "";
  const idx = kw ? Array.from(String(title)).join("").indexOf(kw) : -1;
  return {
    charLen: len,
    lenOk: len >= 28 && len <= 35,
    keywordFront: kw ? (idx >= 0 && idx < 15) : null,
    forbidden: checkForbidden(title),
  };
}
function validateXHook(text) {
  const len = charLen(text);
  return { charLen: len, lenOk: len <= 25, forbidden: checkForbidden(text) };
}

/* ── 후보 조립 (슬롯 기반 기본 템플릿) ──
 * inputs: { keyword, series, number, target, timeframe, benefit }
 * 반환 [{n, pattern, title}] 10개. 품질 높은 글은 호출측이 직접 후보를 넣어 scoreTitle 로 평가해도 된다.
 */
function buildCandidates(inp) {
  inp = inp || {};
  const kw = inp.keyword || "";
  const num = inp.number || "";
  const tgt = inp.target || "";
  const tf = inp.timeframe || "";
  const ben = inp.benefit || "";
  const C = [];
  const push = (n, title) => C.push({ n, pattern: (PATTERNS.find(p => p.n === n) || {}).name || "", title });
  push(1, `${kw}、${num || "3"}つのポイント`);
  push(2, `${tgt || "40代"}からの${kw}の考え方`);
  push(3, `${kw}は${ben || "どこまで"}？最新の目安`);
  push(4, `実は知らない${kw}の${ben || "本当"}`);
  push(5, `その${kw}、${ben || "逆効果"}になってない？`);
  push(6, `当てはまる数でわかる${kw}チェック`);
  push(7, `${kw}、${ben || "AとB"}の違いと見分け方`);
  push(8, `${tf || "冬"}こそ見直す${kw}の基本`);
  push(9, `韓国では当たり前の${kw}習慣`);
  push(10, `${tf || "今日"}からできる${kw}の工夫`);
  return C;
}

module.exports = {
  PATTERNS, FORBIDDEN,
  checkForbidden, emojiCount,
  weightedLength, parseTweet, charLen,
  scoreTitle, validateBlogTitle, validateXHook,
  buildCandidates, firstNumber,
};
