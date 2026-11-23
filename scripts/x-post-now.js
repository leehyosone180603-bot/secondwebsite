/* X 게시 프롬프트 생성기 — 확장프로그램(Claude in Chrome)용
 *   node scripts/x-post-now.js [--due|--today|--all] [--mark]
 *   --due   (기본) 지금(JST) 기준 마감 지난 pending 항목
 *   --today 오늘(JST) 예정 pending 전부
 *   --all   남은 pending 전부
 *   --mark  해당 항목을 queue.csv 에서 status=sent 로 표시(기본 미표시)
 * 출력: 붙여넣기용 완성 프롬프트(stdout) + social/x/post-now.md
 * 카드는 글의 twitter:image 로 자동 펼쳐지므로 본문(텍스트)만 게시하면 된다.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SOCIAL = path.join(ROOT, "social", "x");
const QF = path.join(SOCIAL, "queue.csv");

function nowJST() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  const date = d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2);
  const time = ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2);
  return { date, time, dt: date + " " + time };
}

const MASTER =
`당신은 제 X(트위터·x.com) 계정으로 아래 게시물들을 올리는 일을 합니다. 저는 이미 x.com에 로그인되어 있습니다.
각 [항목]에 대해 순서대로:
1) x.com 에서 새 게시물 작성 화면을 엽니다(홈의 "게시하기" 또는 왼쪽 ✏️, 또는 https://x.com/compose/post ).
2) 본문 입력란에 그 항목의 "본문"을 **그대로** 붙여넣습니다(줄바꿈·✅·링크·해시태그 포함, 한 글자도 바꾸지 마세요).
3) 붙여넣은 링크가 몇 초 뒤 **카드 미리보기(이미지)** 로 펼쳐집니다. 펼쳐질 때까지 기다린 뒤 그대로 둡니다(이미지를 따로 올릴 필요 없음).
4) "게시하기(Post)" 버튼을 눌러 게시합니다.
5) 게시 성공을 확인하면 다음 항목으로 넘어갑니다. **항목 사이에 60~90초 간격**을 둡니다(스팸 방지).
규칙: 본문을 수정·요약하지 말 것. 하루에 이 목록만 게시. 로그인이 안 돼 있거나, 게시 버튼이 비활성·오류·캡차가 뜨면 **멈추고** 어느 항목에서 막혔는지 알려주세요. 자동 팔로우·멘션·DM은 하지 마세요.`;

function parseArgs() {
  const a = process.argv.slice(2);
  return { mode: a.includes("--today") ? "today" : a.includes("--all") ? "all" : "due", mark: a.includes("--mark") };
}

function rows() {
  if (!fs.existsSync(QF)) return [];
  return fs.readFileSync(QF, "utf8").trim().split("\n").slice(1).filter(Boolean).map(l => {
    const [date, time, slug, variant, image, status] = l.split(",");
    return { date, time, slug, variant, image, status };
  });
}

function main() {
  const { mode, mark } = parseArgs();
  const n = nowJST();
  const all = rows();
  let due = all.filter(r => r.status === "pending");
  if (mode === "due") due = due.filter(r => (r.date + " " + r.time) <= n.dt);
  else if (mode === "today") due = due.filter(r => r.date === n.date);
  due.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  let body = MASTER + "\n\n";
  if (!due.length) { body += "[항목 없음] 지금 게시할 예정이 없습니다."; }
  due.forEach((r, i) => {
    const pj = path.join(SOCIAL, r.slug, "post.json");
    if (!fs.existsSync(pj)) return;
    const p = JSON.parse(fs.readFileSync(pj, "utf8"));
    const txt = (p.posts[r.variant] || {}).text || "";
    body += "─── [항목 " + (i + 1) + "] " + r.slug + " (" + r.variant.toUpperCase() + ") · 예정 " + r.date + " " + r.time + " JST ───\n본문:\n" + txt + "\n\n";
  });

  fs.writeFileSync(path.join(SOCIAL, "post-now.md"), body);

  if (mark && due.length) {
    const set = new Set(due.map(r => r.date + r.time + r.slug + r.variant));
    const header = "date,time_jst,slug,variant,image,status\n";
    const out = header + all.map(r => {
      const st = set.has(r.date + r.time + r.slug + r.variant) ? "sent" : r.status;
      return [r.date, r.time, r.slug, r.variant, r.image, st].join(",");
    }).join("\n") + "\n";
    fs.writeFileSync(QF, out);
  }
  console.log("대상 " + due.length + "건 (" + mode + ", 기준 " + n.dt + " JST)" + (mark ? " · queue에 sent 표시함" : ""));
  console.log("프롬프트 파일: social/x/post-now.md");
  if (due.length) console.log("항목: " + due.map(r => r.slug + "/" + r.variant).join(", "));
}
main();
