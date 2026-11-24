/* X 게시 도우미 (PART B 개편 — 본문 링크 없음 / 初回リプ 분리 / 수동 예약 시트)
 *   node scripts/x-post-now.js [--due|--today|--all] [--mark]
 *     --due   (기본) 지금(JST) 기준 마감 지난 pending → 확장프로그램용 프롬프트(post-now.md)
 *     --today 오늘(JST) 예정 pending 전부
 *     --all   남은 pending 전부
 *     --mark  해당 항목을 queue.csv 에서 status=sent 로 표시
 *   node scripts/x-post-now.js --sheet [--days N]
 *     수동 예약(予約投稿)용 시트 생성: social/x/schedule-sheet.md + .csv + reply-reminders.ics
 *     기본 범위: 내일부터 7일.
 *
 * ★ 본문(body)에는 링크가 없다. 링크는 각 게시물 직후 '첫 답글(初回リプ)'로 사용자가 직접 단다.
 *   카드 이미지는 게시물에 직접 첨부(링크 카드 의존 X).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://healthfortune.co.kr";
const SOCIAL = path.join(ROOT, "social", "x");
const QF = path.join(SOCIAL, "queue.csv");

function nowJST() {
  const d = new Date(Date.now() + 9 * 3600 * 1000);
  const date = d.getUTCFullYear() + "-" + ("0" + (d.getUTCMonth() + 1)).slice(-2) + "-" + ("0" + d.getUTCDate()).slice(-2);
  const time = ("0" + d.getUTCHours()).slice(-2) + ":" + ("0" + d.getUTCMinutes()).slice(-2);
  return { date, time, dt: date + " " + time };
}

const MASTER =
`당신은 제 X(트위터·x.com) 계정으로 아래 게시물들을 올립니다. 저는 이미 x.com에 로그인되어 있습니다.
각 [항목]에 대해 순서대로:
1) 새 게시물 작성 화면을 엽니다(https://x.com/compose/post ).
2) "본문"을 **그대로** 붙여넣습니다(줄바꿈·✅·해시태그 포함, 한 글자도 바꾸지 마세요). ※본문에는 링크가 없습니다.
3) "이미지"에 적힌 그림(카드)을 1장 첨부합니다. (이미지 URL을 열어 저장한 뒤 첨부하거나, 파일을 첨부)
4) "게시하기(Post)" 버튼을 눌러 게시합니다.
5) **게시 직후, 그 게시물에 "첫 답글(初回リプ)"로 '첫 답글' 칸의 내용을 그대로 답니다**(여기에만 링크가 들어갑니다).
6) 다음 항목으로 넘어갑니다. 항목 사이 60~90초 간격.
규칙: 본문·첫 답글을 수정·요약하지 말 것. 로그인이 안 돼 있거나 게시 버튼이 비활성·오류·캡차면 **멈추고** 어디서 막혔는지 알려주세요. 자동 팔로우·멘션·DM 금지.`;

function parseArgs() {
  const a = process.argv.slice(2);
  const di = a.indexOf("--days");
  return {
    sheet: a.includes("--sheet"),
    days: di >= 0 ? Math.max(1, parseInt(a[di + 1], 10) || 7) : 7,
    mode: a.includes("--today") ? "today" : a.includes("--all") ? "all" : "due",
    mark: a.includes("--mark"),
  };
}

function rows() {
  if (!fs.existsSync(QF)) return [];
  return fs.readFileSync(QF, "utf8").trim().split("\n").slice(1).filter(Boolean).map(l => {
    const [date, time, slug, variant, image, status] = l.split(",");
    return { date, time, slug, variant, image, status };
  });
}
function postOf(slug) {
  const pj = path.join(SOCIAL, slug, "post.json");
  if (!fs.existsSync(pj)) return null;
  return JSON.parse(fs.readFileSync(pj, "utf8"));
}
function variantData(p, variant) {
  const v = (p.posts && p.posts[variant]) || {};
  return { body: v.body || v.text || "", firstReply: v.firstReply || "", charCount: v.charCount || Array.from(v.body || v.text || "").length };
}

/* ---------- 기본: 확장프로그램 프롬프트 ---------- */
function runPrompt(mode, mark) {
  const n = nowJST();
  const all = rows();
  let due = all.filter(r => r.status === "pending");
  if (mode === "due") due = due.filter(r => (r.date + " " + r.time) <= n.dt);
  else if (mode === "today") due = due.filter(r => r.date === n.date);
  due.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  let body = MASTER + "\n\n";
  if (!due.length) body += "[항목 없음] 지금 게시할 예정이 없습니다.";
  due.forEach((r, i) => {
    const p = postOf(r.slug); if (!p) return;
    const v = variantData(p, r.variant);
    body += "─── [항목 " + (i + 1) + "] " + r.slug + " (" + r.variant.toUpperCase() + ") · 예정 " + r.date + " " + r.time + " JST ───\n";
    body += "본문:\n" + v.body + "\n\n";
    body += "이미지: " + SITE + "/" + (r.image || ("social/x/" + r.slug + "/card.png")) + "\n\n";
    body += "첫 답글(게시 직후 직접):\n" + v.firstReply + "\n\n";
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

/* ---------- --sheet: 수동 예약 시트 + 첫 답글 리마인더(ics) ---------- */
function addMinutes(dateStr, timeStr, mins) {
  const [h, mi] = timeStr.split(":").map(Number);
  const base = new Date(Date.UTC(+dateStr.slice(0, 4), +dateStr.slice(5, 7) - 1, +dateStr.slice(8, 10), h, mi + mins, 0));
  const p = (x) => ("0" + x).slice(-2);
  return {
    date: base.getUTCFullYear() + "-" + p(base.getUTCMonth() + 1) + "-" + p(base.getUTCDate()),
    time: p(base.getUTCHours()) + ":" + p(base.getUTCMinutes()),
    stamp: "" + base.getUTCFullYear() + p(base.getUTCMonth() + 1) + p(base.getUTCDate()) + "T" + p(base.getUTCHours()) + p(base.getUTCMinutes()) + "00",
  };
}
function icsEsc(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n"); }
function csvCell(s) { return '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"'; }

const VTIMEZONE =
  "BEGIN:VTIMEZONE\r\nTZID:Asia/Tokyo\r\nBEGIN:STANDARD\r\nDTSTART:19700101T000000\r\nTZOFFSETFROM:+0900\r\nTZOFFSETTO:+0900\r\nTZNAME:JST\r\nEND:STANDARD\r\nEND:VTIMEZONE";

function runSheet(days) {
  const n = nowJST();
  // 내일 00:00 JST ~ +days일
  const start = new Date(n.date + "T00:00:00Z"); start.setUTCDate(start.getUTCDate() + 1);
  const endD = new Date(start); endD.setUTCDate(endD.getUTCDate() + days);
  const ymd = (d) => d.toISOString().slice(0, 10);
  const lo = ymd(start), hi = ymd(endD);

  const list = rows().filter(r => r.status === "pending" && r.date >= lo && r.date < hi)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // schedule-sheet.md
  let md = "# X 수동 예약 시트 — " + lo + " ~ " + hi + " (" + list.length + "건)\n\n";
  md += "> X 기본 **予約投稿(예약 게시)** 기능으로 직접 예약하세요. 본문엔 링크가 없고, **게시 3분 뒤 첫 답글(初回リプ)** 로 링크를 답니다.\n";
  md += "> `reply-reminders.ics` 를 휴대폰/구글 캘린더에 가져오면 첫 답글 시각에 알림이 뜹니다.\n\n";

  // 날짜별 '첫 답글 체크리스트'
  md += "## ✅ 첫 답글 체크리스트 (날짜별)\n\n";
  const byDate = {};
  list.forEach(r => { (byDate[r.date] = byDate[r.date] || []).push(r); });
  Object.keys(byDate).sort().forEach(d => {
    md += "### " + d + "\n\n";
    byDate[d].forEach(r => {
      const rep = addMinutes(r.date, r.time, 3);
      md += "- [ ] " + rep.time + " JST · " + r.slug + " (" + r.variant.toUpperCase() + ") 初回リプ\n";
    });
    md += "\n";
  });

  // 상세 (본문·이미지·첫 답글)
  md += "## 📋 게시 상세\n\n";
  const csv = [["予定日時(JST)", "slug", "variant", "本文", "画像", "初回リプ", "글자수"].map(csvCell).join(",")];
  let icsEvents = [];
  list.forEach(r => {
    const p = postOf(r.slug); if (!p) return;
    const v = variantData(p, r.variant);
    const imgUrl = SITE + "/" + (r.image || ("social/x/" + r.slug + "/card.png"));
    const firstLine = (v.body.split("\n")[0] || "").trim();
    md += "### " + r.date + " " + r.time + " JST · " + r.slug + " (" + r.variant.toUpperCase() + ")  ⏰ 게시 3분 후 初回リプ 직접 게시\n\n";
    md += "**본문:**\n\n```\n" + v.body + "\n```\n\n";
    md += "**이미지(첨부):** " + imgUrl + "\n\n";
    md += "**첫 답글(初回リプ):**\n\n```\n" + v.firstReply + "\n```\n\n---\n\n";
    csv.push([r.date + " " + r.time, r.slug, r.variant.toUpperCase(), v.body, imgUrl, v.firstReply, v.charCount].map(csvCell).join(","));

    // ics 이벤트: 게시 +3분, 길이 10분, 0분 전 알림
    const s = addMinutes(r.date, r.time, 3);
    const e = addMinutes(r.date, r.time, 13);
    const desc = "先ほど予約投稿された投稿に、下記を『最初の返信(初回リプ)』として貼り付けてください。\\n\\n" +
      "【初回リプ】\\n" + icsEsc(v.firstReply) + "\\n\\n【どの投稿か】" + icsEsc(firstLine) +
      "\\n\\n☑ 返信後、その返信に付くコメントにも1時間以内に返信する";
    icsEvents.push(
      "BEGIN:VEVENT\r\n" +
      "UID:" + r.slug + "-" + r.variant + "-" + r.date + "@healthfortune.co.kr\r\n" +
      "DTSTAMP:" + addMinutes(n.date, "00:00", 0).stamp + "Z\r\n" +
      "DTSTART;TZID=Asia/Tokyo:" + s.stamp + "\r\n" +
      "DTEND;TZID=Asia/Tokyo:" + e.stamp + "\r\n" +
      "SUMMARY:" + icsEsc("【X 첫 답글】" + r.slug + " " + r.variant.toUpperCase() + " — 링크 답글 달기") + "\r\n" +
      "DESCRIPTION:" + desc + "\r\n" +
      "BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:" + icsEsc("X 첫 답글(初回リプ)を貼る時間です") + "\r\nTRIGGER:-PT0M\r\nEND:VALARM\r\n" +
      "END:VEVENT"
    );
  });

  const ics = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//healthfortune//x-reply-reminders//JP\r\nCALSCALE:GREGORIAN\r\nMETHOD:PUBLISH\r\n" +
    VTIMEZONE + "\r\n" + icsEvents.join("\r\n") + "\r\nEND:VCALENDAR\r\n";

  fs.writeFileSync(path.join(SOCIAL, "schedule-sheet.md"), md);
  fs.writeFileSync(path.join(SOCIAL, "schedule-sheet.csv"), csv.join("\n") + "\n");
  fs.writeFileSync(path.join(SOCIAL, "reply-reminders.ics"), ics);
  console.log("수동 예약 시트 생성: " + list.length + "건 (" + lo + " ~ " + hi + ")");
  console.log("  social/x/schedule-sheet.md / .csv");
  console.log("  social/x/reply-reminders.ics (이벤트 " + icsEvents.length + "개)");
}

function main() {
  const a = parseArgs();
  if (a.sheet) runSheet(a.days);
  else runPrompt(a.mode, a.mark);
}
main();
