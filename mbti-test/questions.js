/* 건강흐름 MBTI 48문항 (축당 12: 앞글자 6 + 뒷글자 6, 역문항 혼합). 직접 작성. */
(function (root) {
  "use strict";
  var Q = [
    // EI
    { id: 1, axis: "EI", pole: "E", text: "처음 보는 사람들과도 금방 대화를 트는 편이에요." },
    { id: 2, axis: "EI", pole: "E", text: "주말에 약속이 많으면 오히려 기운이 나요." },
    { id: 3, axis: "EI", pole: "E", text: "생각은 말로 꺼내면서 정리되는 편이에요." },
    { id: 4, axis: "EI", pole: "E", text: "조용한 곳보다 북적이는 곳에서 더 신이 나요." },
    { id: 5, axis: "EI", pole: "E", text: "새로운 모임에 가는 게 설레요." },
    { id: 6, axis: "EI", pole: "E", text: "혼자 있는 시간이 길어지면 좀이 쑤셔요." },
    { id: 7, axis: "EI", pole: "I", text: "주말 약속이 취소되면 은근히 반가워요." },
    { id: 8, axis: "EI", pole: "I", text: "사람을 많이 만난 날은 집에서 혼자 충전해야 해요." },
    { id: 9, axis: "EI", pole: "I", text: "말하기 전에 머릿속으로 충분히 정리하는 편이에요." },
    { id: 10, axis: "EI", pole: "I", text: "가벼운 수다 여럿보다 깊은 대화 한 명이 좋아요." },
    { id: 11, axis: "EI", pole: "I", text: "낯선 모임에 가면 에너지가 빨리 닳아요." },
    { id: 12, axis: "EI", pole: "I", text: "조용히 혼자 보내는 저녁이 가장 편해요." },
    // SN
    { id: 13, axis: "SN", pole: "S", text: "설명은 구체적인 예시가 있어야 와닿아요." },
    { id: 14, axis: "SN", pole: "S", text: "뜬구름 잡는 이야기보다 당장 쓸 수 있는 정보가 좋아요." },
    { id: 15, axis: "SN", pole: "S", text: "직접 경험해 본 방법을 더 믿는 편이에요." },
    { id: 16, axis: "SN", pole: "S", text: "디테일과 숫자를 꼼꼼히 챙기는 편이에요." },
    { id: 17, axis: "SN", pole: "S", text: "먼 미래보다 ‘지금 여기’에 집중하는 게 편해요." },
    { id: 18, axis: "SN", pole: "S", text: "순서가 정해진 대로 따라가는 게 마음이 놓여요." },
    { id: 19, axis: "SN", pole: "N", text: "눈앞의 사실보다 그 뒤에 담긴 의미가 더 궁금해요." },
    { id: 20, axis: "SN", pole: "N", text: "새로운 아이디어가 떠오르면 머릿속이 바빠져요." },
    { id: 21, axis: "SN", pole: "N", text: "‘만약에~’로 시작하는 상상을 자주 해요." },
    { id: 22, axis: "SN", pole: "N", text: "반복되는 일보다 새로운 시도가 재밌어요." },
    { id: 23, axis: "SN", pole: "N", text: "큰 그림을 먼저 그리고 세부는 나중에 보는 편이에요." },
    { id: 24, axis: "SN", pole: "N", text: "가능성과 미래 이야기를 할 때 눈이 반짝여요." },
    // TF
    { id: 25, axis: "TF", pole: "T", text: "결정할 때 감정보다 사실과 근거를 먼저 봐요." },
    { id: 26, axis: "TF", pole: "T", text: "문제가 생기면 원인부터 차근차근 따져 봐요." },
    { id: 27, axis: "TF", pole: "T", text: "틀린 건 틀렸다고 분명히 말하는 편이에요." },
    { id: 28, axis: "TF", pole: "T", text: "두루뭉술한 칭찬보다 정확한 피드백이 더 도움돼요." },
    { id: 29, axis: "TF", pole: "T", text: "분위기보다 공정한 기준이 더 중요해요." },
    { id: 30, axis: "TF", pole: "T", text: "토론에서 반대 의견을 꺼내는 게 어렵지 않아요." },
    { id: 31, axis: "TF", pole: "F", text: "결정할 때 상대가 어떻게 느낄지를 먼저 떠올려요." },
    { id: 32, axis: "TF", pole: "F", text: "누가 속상해하면 내 마음도 같이 가라앉아요." },
    { id: 33, axis: "TF", pole: "F", text: "맞는 말이어도 상처 주는 방식은 피하고 싶어요." },
    { id: 34, axis: "TF", pole: "F", text: "분위기가 어색해지면 내가 먼저 풀고 싶어요." },
    { id: 35, axis: "TF", pole: "F", text: "사람들의 감정 변화를 잘 알아차리는 편이에요." },
    { id: 36, axis: "TF", pole: "F", text: "누군가에게 도움이 될 때 보람을 크게 느껴요." },
    // JP
    { id: 37, axis: "JP", pole: "J", text: "할 일을 미리 계획해 두어야 마음이 편해요." },
    { id: 38, axis: "JP", pole: "J", text: "마감은 여유 있게 미리 끝내 두는 편이에요." },
    { id: 39, axis: "JP", pole: "J", text: "정리된 책상과 일정이 집중에 도움돼요." },
    { id: 40, axis: "JP", pole: "J", text: "결정을 내려 두면 마음이 개운해요." },
    { id: 41, axis: "JP", pole: "J", text: "여행도 일정표가 있어야 안심돼요." },
    { id: 42, axis: "JP", pole: "J", text: "약속 시간은 딱 맞춰 지키려고 해요." },
    { id: 43, axis: "JP", pole: "P", text: "계획보다 그때그때 상황에 맞추는 게 편해요." },
    { id: 44, axis: "JP", pole: "P", text: "마감이 닥쳐야 집중이 잘 되는 편이에요." },
    { id: 45, axis: "JP", pole: "P", text: "선택지를 끝까지 열어 두는 게 좋아요." },
    { id: 46, axis: "JP", pole: "P", text: "즉흥적으로 생긴 일정이 더 즐거워요." },
    { id: 47, axis: "JP", pole: "P", text: "정해진 틀보다 자유로운 흐름이 좋아요." },
    { id: 48, axis: "JP", pole: "P", text: "계획이 바뀌어도 크게 스트레스받지 않아요." }
  ];
  if (typeof module !== "undefined" && module.exports) module.exports = Q;
  else root.MBTI_QUESTIONS = Q;
})(typeof window !== "undefined" ? window : this);
