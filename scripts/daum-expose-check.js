"use strict";
/* 다음(Daum) 검색 노출 점검.
   블로그 주소를 다음 통합검색(w=tot)에 검색해, 첫 화면에 그 블로그의
   통합웹/사이트 결과 카드가 보이는지(= 노출됨)를 판별한다.
   사용: node scripts/daum-expose-check.js <도메인1> <도메인2> ...
        (인자 없으면 기본 5개)
   출력: JSON 배열 [{domain, exposed, serCount, noResult, checkedAt}]
   판별: exposed = (검색결과 없음 아님) AND (SER 통합웹 결과 doc_count 합 > 0)
   네트워크: curl 사용(에이전트 프록시 경유). node https 는 프록시를 안 타므로 금지. */
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

function fetchSearch(q) {
  const url = "https://search.daum.net/search?q=" + encodeURIComponent(q);
  return execFileSync("curl", ["-sSL", "-A", UA, "--max-time", "35", url], {
    encoding: "utf8", maxBuffer: 32 * 1024 * 1024,
  });
}

function judge(domain) {
  let html;
  try { html = fetchSearch(domain); }
  catch (e) { return { domain, exposed: null, serCount: 0, noResult: false, error: String(e && e.message || e), checkedAt: Date.now() }; }
  const noResult = /에 대한 검색결과가 없|와 일치하는 검색 결과가 없/.test(html);
  let serCount = 0;
  const m = html.match(/var displayInfo = (\{[\s\S]*?\});/);
  if (m) { try { const di = JSON.parse(m[1]); if (di && Array.isArray(di.SER)) serCount = di.SER.reduce((s, x) => s + (x.doc_count || 0), 0); } catch (e) {} }
  const exposed = !noResult && serCount > 0;
  return { domain, exposed, serCount, noResult, checkedAt: Date.now() };
}

const out = domains.map(judge);
console.log(JSON.stringify(out));
