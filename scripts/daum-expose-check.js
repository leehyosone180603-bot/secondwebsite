"use strict";
/* 다음(Daum) 검색 노출 점검 — 광고(파워링크) 제외, 실제 결과만 인정.
   블로그 주소를 다음 통합검색에 검색해, 첫 화면에 그 블로그의
   '오가닉(실제) 블로그·사이트·웹문서 결과 카드'가 보이는지 판별한다.
   - 다음 결과 displayInfo.SER 컬렉션 코드로 광고/오가닉을 구분:
       "0NL" = 파워링크/제휴 광고(노출로 치지 않음)
       그 외 코드(TWA/IVR/IIM 등) + doc_count>0 = 오가닉 결과(= 노출)
   - 보조로 '블로그 검색 더보기' 섹션 존재도 오가닉 신호로 인정.
   사용: node scripts/daum-expose-check.js <도메인1> <도메인2> ...  (없으면 기본 5개)
   출력: JSON 배열 [{domain, exposed, organicCodes, adCount, noResult, checkedAt}]
   네트워크: curl 사용(프록시 경유). node https 는 프록시 미경유라 금지. */
const { execFileSync } = require("child_process");

const DEFAULTS = [
  "view03192.tistory.com",
  "bodysentence.tistory.com",
  "humanatlas.tistory.com",
  "bodydictionary.tistory.com",
  "medicalpage.tistory.com",
];
const domains = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULTS;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const AD_CODES = new Set(["0NL"]); // 파워링크/제휴 광고 컬렉션

function fetchSearch(q) {
  const url = "https://search.daum.net/search?q=" + encodeURIComponent(q);
  return execFileSync("curl", ["-sSL", "-A", UA, "--max-time", "35", url], {
    encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
  });
}

function judge(domain) {
  let html;
  try { html = fetchSearch(domain); }
  catch (e) { return { domain, exposed: null, organicCodes: [], adCount: 0, noResult: false, error: String(e && e.message || e), checkedAt: Date.now() }; }
  const noResult = /에 대한 검색결과가 없|와 일치하는 검색 결과가 없/.test(html);
  let ser = [];
  const m = html.match(/var displayInfo = (\{[\s\S]*?\});/);
  if (m) { try { const di = JSON.parse(m[1]); if (Array.isArray(di.SER)) ser = di.SER; } catch (e) {} }
  const organic = ser.filter(x => (x.doc_count || 0) > 0 && !AD_CODES.has(x.code));
  const adCount = ser.filter(x => AD_CODES.has(x.code)).reduce((s, x) => s + (x.doc_count || 0), 0);
  // 보조 신호: 오가닉 블로그 결과 섹션
  const txt = html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " ");
  const blogMore = /블로그 검색 더보기/.test(txt);
  const exposed = organic.length > 0 || blogMore;
  return {
    domain, exposed,
    organicCodes: organic.map(x => x.code + ":" + x.doc_count),
    adCount, noResult, checkedAt: Date.now(),
  };
}

const out = domains.map(judge);
console.log(JSON.stringify(out));
