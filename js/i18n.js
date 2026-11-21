/* ============================================================
   i18n.js — 다국어 문구 (한국어 기본, 영어·일본어 추가 가능)
   공통 UI 문구만 키로 분리. 도구별 본문은 각 페이지가 담당.
   - 언어 선택은 localStorage("tk_lang")에 저장, 기본 "ko".
   - 사용: I18N.t("copy"), I18N.lang, I18N.setLang("en"), I18N.apply(root)
     HTML: <span data-i18n="copy"></span> 에 자동 주입.
   ============================================================ */
(function (factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.I18N = api;
})(function () {
  "use strict";

  var STRINGS = {
    ko: {
      home: "홈", tools: "생활 도구",
      copy: "결과 복사", copied: "복사했습니다", reset: "초기화", shareLink: "공유 링크",
      shareLabel: "공유", calc: "계산하기",
      rateQ: "도움이 됐나요?", like: "👍 도움돼요", dislike: "🙁 아쉬워요", rateThanks: "평가 감사합니다!",
      method: "계산 방법", learnMore: "더 알아보기", faq: "자주 묻는 질문", sources: "자료 출처", related: "관련 도구",
      recent: "최근 본 페이지", popular: "인기 페이지", newTools: "신규 출시", deal: "할인 정보", dealNote: "※ 일부 링크는 제휴(광고) 링크일 수 있습니다.",
      prev: "이전", next: "다음", step: "단계",
      disclaimer: "참고용 추정치이며 실제 금액과 다를 수 있습니다.",
      noResult: "값을 입력하면 결과가 표시됩니다.", none: "아직 없습니다."
    },
    en: {
      home: "Home", tools: "Tools",
      copy: "Copy result", copied: "Copied", reset: "Reset", shareLink: "Share link",
      shareLabel: "Share", calc: "Calculate",
      rateQ: "Was this helpful?", like: "👍 Helpful", dislike: "🙁 Not quite", rateThanks: "Thanks for the feedback!",
      method: "How it works", learnMore: "Learn more", faq: "FAQ", sources: "Sources", related: "Related tools",
      recent: "Recently viewed", popular: "Popular", newTools: "New", deal: "Deals", dealNote: "Some links may be affiliate (ad) links.",
      prev: "Back", next: "Next", step: "Step",
      disclaimer: "An estimate for reference only; actual amounts may differ.",
      noResult: "Enter values to see the result.", none: "Nothing yet."
    },
    ja: {
      home: "ホーム", tools: "ツール",
      copy: "結果をコピー", copied: "コピーしました", reset: "リセット", shareLink: "共有リンク",
      shareLabel: "共有", calc: "計算する",
      rateQ: "役に立ちましたか？", like: "👍 役立った", dislike: "🙁 いまひとつ", rateThanks: "ご評価ありがとうございます！",
      method: "計算方法", learnMore: "もっと見る", faq: "よくある質問", sources: "出典", related: "関連ツール",
      recent: "最近見たページ", popular: "人気", newTools: "新着", deal: "お得情報", dealNote: "一部のリンクはアフィリエイト（広告）です。",
      prev: "戻る", next: "次へ", step: "ステップ",
      disclaimer: "参考値であり、実際の金額とは異なる場合があります。",
      noResult: "値を入力すると結果が表示されます。", none: "まだありません。"
    }
  };

  var SUPPORTED = ["ko", "en", "ja"];
  function readLang() {
    try { var s = localStorage.getItem("tk_lang"); if (s && SUPPORTED.indexOf(s) >= 0) return s; } catch (e) {}
    return "ko";
  }

  var api = {
    lang: (typeof window !== "undefined") ? readLang() : "ko",
    supported: SUPPORTED,
    t: function (key) {
      var L = STRINGS[this.lang] || STRINGS.ko;
      return (key in L) ? L[key] : (STRINGS.ko[key] || key);
    },
    setLang: function (lang) {
      if (SUPPORTED.indexOf(lang) < 0) return;
      this.lang = lang;
      try { localStorage.setItem("tk_lang", lang); } catch (e) {}
      try { document.documentElement.setAttribute("lang", lang); } catch (e) {}
      this.apply(document);
      try { window.dispatchEvent(new CustomEvent("tk:langchange", { detail: { lang: lang } })); } catch (e) {}
    },
    apply: function (root) {
      root = root || document;
      var self = this;
      root.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = self.t(el.getAttribute("data-i18n")); });
      root.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", self.t(el.getAttribute("data-i18n-ph"))); });
    }
  };
  return api;
});
