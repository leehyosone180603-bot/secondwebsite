"use strict";
/* 픽사베이에서 가로형(landscape) 사진을 내려받는다.
   사용: PIXABAY_API_KEY=... node scripts/pixabay-fetch.js "<검색어>" <개수> <출력디렉터리>
   출력: 내려받은 파일 경로를 한 줄에 하나씩 stdout 으로. (가독성 위해 가로>세로 사진만, ratio 큰 순) */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const query = process.argv[2];
const count = parseInt(process.argv[3] || "3", 10);
const outDir = process.argv[4] || "/tmp/pixabay";
const KEY = process.env.PIXABAY_API_KEY;
if (!query) { console.error("검색어 필요"); process.exit(1); }
if (!KEY) { console.error("PIXABAY_API_KEY 환경변수 필요"); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

// curl 사용(에이전트 프록시 경유). node https 는 프록시를 안 타므로 금지.
const curl = (url, outFile) => {
  const args = ["-sS", "--max-time", "40", url];
  if (outFile) args.push("-o", outFile);
  return execFileSync("curl", args, outFile ? {} : { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
};

try {
  const api = `https://pixabay.com/api/?key=${KEY}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=30&safesearch=true`;
  const data = JSON.parse(curl(api));
  // 확실히 가로로 긴 사진만(가독성): 가로/세로 비율 1.3 이상. 없으면 1.15 이상으로 완화.
  let hits = (data.hits || []).filter(h => h.imageWidth / h.imageHeight >= 1.3);
  if (hits.length < count) hits = (data.hits || []).filter(h => h.imageWidth / h.imageHeight >= 1.15);
  hits.sort((a, b) => {
    const ra = a.imageWidth / a.imageHeight, rb = b.imageWidth / b.imageHeight;
    const score = r => (r >= 1.4 && r <= 2.2) ? 0 : Math.min(Math.abs(r - 1.4), Math.abs(r - 2.2));
    return score(ra) - score(rb);
  });
  const picked = hits.slice(0, count);
  const paths = [];
  picked.forEach((h, i) => {
    const url = h.largeImageURL || h.webformatURL;
    const p = path.join(outDir, `pixabay-${i + 1}.jpg`);
    curl(url, p);
    if (fs.existsSync(p) && fs.statSync(p).size > 2000) paths.push(p);
  });
  if (!paths.length) { console.error("검색 결과 없음: " + query); process.exit(2); }
  console.log(paths.join("\n"));
} catch (e) { console.error("실패: " + (e && e.message || e)); process.exit(3); }
