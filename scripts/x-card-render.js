/* 체크리스트 이미지 렌더링 (PART B / B-4)
 * HTML 템플릿(social/x/templates/card.html) → PNG (Playwright headless)
 * 세로 1080×1350 + 가로 1200×675, PNG ≤1MB, 글자 잘림(오버플로우) 자동 검사.
 * 사용(라이브러리): const { renderCards } = require("./x-card-render");
 *   await renderCards({ hook, items, series, outDir, slug })
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const TPL = path.join(ROOT, "social", "x", "templates", "card.html");

/* B-4 시리즈별 포인트색 */
const SERIES_COLOR = {
  season:  { accent: "#1e73be", tint: "#e7f1fb", tint2: "#f2f8fe" }, // 하늘색
  kbeauty: { accent: "#e8657f", tint: "#fdeaf0", tint2: "#fef4f7" }, // 코랄
  travel:  { accent: "#16a98a", tint: "#e3f7f1", tint2: "#f1fbf8" }, // 민트
  korea:   { accent: "#e8882e", tint: "#fdefdd", tint2: "#fef7ee" }, // 주황
  check:   { accent: "#e0a400", tint: "#fbf3d6", tint2: "#fdf9ea" }, // 노랑
  food:    { accent: "#2f9e6f", tint: "#e4f5ec", tint2: "#f2faf6" },
  info:    { accent: "#2b6cb0", tint: "#e8f0fa", tint2: "#f4f8fd" },
  default: { accent: "#1e73be", tint: "#e7f1fb", tint2: "#f2f8fe" },
};
function colorFor(series) { return SERIES_COLOR[series] || SERIES_COLOR.default; }

const SIZES = [
  { name: "card.png",    w: 1080, h: 1350, vertical: true },
  { name: "card_og.png", w: 1200, h: 675,  vertical: false },
];

async function renderOne(browser, tplHtml, data, outPath) {
  const page = await browser.newPage({ viewport: { width: data.w, height: data.h }, deviceScaleFactor: 1 });
  const inject = "<script>window.__CARD_DATA__=" + JSON.stringify(data) + ";</scr" + "ipt>";
  const html = tplHtml.replace("</head>", inject + "\n</head>");
  await page.setContent(html, { waitUntil: "load" });
  await page.waitForFunction("window.__RENDERED__===true", { timeout: 8000 });
  const overflow = await page.evaluate("window.__OVERFLOW__===true");
  const el = await page.$("#card");
  await el.screenshot({ path: outPath });
  await page.close();
  const bytes = fs.statSync(outPath).size;
  return { overflow, bytes };
}

async function renderCards(opts) {
  const { hook, items, series, outDir, slug } = opts;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const tplHtml = fs.readFileSync(TPL, "utf8");
  const col = colorFor(series);
  const base = {
    hook: hook || "",
    items: (items || []).slice(0, 6),
    cta: opts.cta || "当てはまる数をチェック",
    brand: "健康フロー",
    url: "healthfortune.co.kr/ja",
    accent: col.accent, tint: col.tint, tint2: col.tint2,
  };
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const results = [];
  try {
    for (const s of SIZES) {
      const out = path.join(outDir, s.name);
      const data = Object.assign({}, base, { w: s.w, h: s.h, vertical: s.vertical });
      const r = await renderOne(browser, tplHtml, data, out);
      results.push({ file: s.name, path: out, w: s.w, h: s.h, overflow: r.overflow, bytes: r.bytes, over1mb: r.bytes > 1024 * 1024 });
    }
  } finally { await browser.close(); }
  return results;
}

module.exports = { renderCards, colorFor, SERIES_COLOR };

/* CLI 단독 테스트: node scripts/x-card-render.js */
if (require.main === module) {
  renderCards({
    slug: "demo", series: "season",
    hook: "焼き芋は血糖値を\n上げにくく食べられる？",
    items: ["冷ますとGIが下がりやすい", "主食の置き換えで食べる", "量は握りこぶし1つが目安", "よく噛んでゆっくり食べる", "食物繊維の多い食事と一緒に"],
    outDir: path.join(ROOT, "social", "x", "_demo"),
  }).then(r => { console.log(JSON.stringify(r, null, 2)); }).catch(e => { console.error(e); process.exit(1); });
}
