/* 화면 비율 계산기 — 페이지 스펙 */
module.exports = {
  id: "aspect-ratio",
  title: "화면 비율 계산기 - 16:9 가로세로 해상도 계산 | 건강흐름",
  description: "가로세로 비율(16:9, 4:3 등)과 한 변의 길이로 나머지 변을 계산합니다. 해상도 프리셋 제공, 영상·이미지·모니터 크기 계산에 유용합니다.",
  keywords: "화면 비율 계산기, 가로세로 비율, 16:9 해상도, 종횡비 계산, 이미지 비율, aspect ratio",
  subtitle: "비율과 한 변으로 나머지 변 계산",
  intro: '<p>비율을 고르고 가로 또는 세로 한 쪽을 입력하면 나머지 변이 자동으로 계산됩니다. 16:9 같은 표준 비율이나 직접 입력을 지원합니다.</p>',
  inputsHtml:
    '<div class="field"><label for="preset">비율</label>' +
    '<select id="preset" data-share>' +
    '<option value="16:9">16:9 (와이드·영상)</option>' +
    '<option value="4:3">4:3 (구형·문서)</option>' +
    '<option value="21:9">21:9 (울트라와이드)</option>' +
    '<option value="3:2">3:2 (DSLR 사진)</option>' +
    '<option value="1:1">1:1 (정사각)</option>' +
    '<option value="9:16">9:16 (세로·쇼츠)</option>' +
    '<option value="custom">직접 입력</option>' +
    '</select></div>' +
    '<div class="field" id="customRow" style="display:none"><label>가로 : 세로 비</label>' +
    '<div style="display:flex;gap:8px;align-items:center"><input type="text" id="rw" data-share inputmode="numeric" placeholder="16" style="flex:1"><span>:</span><input type="text" id="rh" data-share inputmode="numeric" placeholder="9" style="flex:1"></div></div>' +
    '<div class="field"><label for="width">가로(폭)</label><div class="input-unit"><input type="text" id="width" data-share inputmode="decimal" placeholder="예: 1920"><span class="unit">px</span></div></div>' +
    '<div class="field" style="text-align:center;color:var(--muted)">⇅</div>' +
    '<div class="field"><label for="height">세로(높이)</label><div class="input-unit"><input type="text" id="height" data-share inputmode="decimal" placeholder="예: 1080"><span class="unit">px</span></div></div>' +
    '<p id="arNote" class="hint" style="margin:6px 2px 0;min-height:1.2em"></p>',
  resultHtml: '',
  method:
    '<p>화면 비율은 가로와 세로의 비입니다.</p>' +
    '<ul><li><strong>세로</strong> = 가로 × (세로비 ÷ 가로비)</li>' +
    '<li><strong>가로</strong> = 세로 × (가로비 ÷ 세로비)</li>' +
    '<li>예: 16:9에서 가로 1920 → 세로 = 1920 × 9/16 = 1080</li></ul>' +
    '<p>두 변을 모두 알면 최대공약수로 약분해 실제 비율(예: 1920×1080 → 16:9)을 보여줍니다.</p>',
  learnMore: [
    { h: "자주 쓰는 비율", p: "16:9는 유튜브·TV·모니터 표준, 4:3은 옛 모니터·문서, 21:9는 울트라와이드 모니터, 9:16은 쇼츠·릴스 세로 영상입니다." },
    { h: "해상도와 비율", p: "1920×1080, 2560×1440, 3840×2160(4K)은 모두 16:9입니다. 비율이 같으면 확대·축소해도 화면이 꽉 찹니다." },
    { h: "이미지 리사이즈", p: "비율을 유지하며 크기를 바꿀 때 이 계산기로 한 변만 정하면 나머지 변을 구할 수 있어 왜곡 없이 조정할 수 있습니다." }
  ],
  faqs: [
    { q: "16:9에서 가로가 1920이면 세로는?", a: "1080입니다. 세로 = 가로 × 9 ÷ 16 = 1920 × 0.5625 = 1080입니다." },
    { q: "해상도로 비율을 알 수 있나요?", a: "네. 가로·세로를 모두 입력하면 최대공약수로 약분해 비율을 보여줍니다. 1920×1080은 16:9입니다." },
    { q: "세로 영상 비율은 무엇인가요?", a: "쇼츠·릴스·틱톡은 보통 9:16(1080×1920)입니다. ‘9:16’ 프리셋을 선택하면 됩니다." }
  ],
  sources: [],
  appCategory: "UtilitiesApplication"
};
