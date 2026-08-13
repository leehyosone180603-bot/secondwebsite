/*
 * 건강흐름 - 블로그 글 목록 데이터
 * ==================================================================
 * ▷ 새 글을 추가하는 방법
 *   1) /posts/ 폴더에 새 글 HTML 파일을 만듭니다.
 *      (가장 쉬운 방법: posts/_template.html 을 복사해서 내용만 수정)
 *   2) 아래 POSTS 배열의 "맨 위"에 아래 형식으로 한 줄(객체)을 추가합니다.
 *      → 배열 앞쪽에 넣을수록 최신글로 취급되어 상단에 노출됩니다.
 *
 *   {
 *     id: "unique-slug",              // 영문/숫자 고유값 (파일명과 동일 권장)
 *     title: "글 제목",
 *     summary: "홈/목록에 노출될 1~2줄 요약",
 *     category: "food",               // "food"(건강음식) 또는 "info"(건강정보)
 *     date: "2026-08-13",             // 작성일 (YYYY-MM-DD)
 *     url: "/posts/unique-slug.html", // 실제 글 페이지 경로
 *     image: "/img/unique-slug.jpg",  // 대표 이미지 (없으면 "" 로 두면 됩니다)
 *   }
 *
 *   * 이미지가 없으면 image 를 "" 로 두세요. 색상 썸네일이 자동 생성됩니다.
 * ==================================================================
 */

/* 카테고리 정의 (ready:false = 준비중, 클릭 시 준비중 안내) */
const CATEGORIES = {
  food:     { slug: "food",     name: "건강음식", ready: true  },
  info:     { slug: "info",     name: "건강정보", ready: true  },
  exercise: { slug: "exercise", name: "건강운동", ready: false },
  diet:     { slug: "diet",     name: "다이어트", ready: false },
  disease:  { slug: "disease",  name: "질환·병",  ready: false },
  life:     { slug: "life",     name: "생활정보", ready: false },
};

/* 상단 네비게이션에 노출할 순서 */
const NAV_ORDER = ["food", "info", "exercise", "diet", "disease", "life"];

/*
 * 아래는 레이아웃 확인용 예시 글입니다.
 * 다음 단계에서 실제 글을 작성하면서 하나씩 교체/삭제하시면 됩니다.
 */
const POSTS = [
  {
    id: "sample-food-1",
    title: "예시 · 혈관 건강을 지키는 아침 식사 습관",
    summary:
      "매일 무심코 먹던 음식이 혈관을 막을 수도 있습니다. 아침 식사에서 바꿔야 할 습관을 정리했습니다. (예시 글)",
    category: "food",
    date: "2026-08-13",
    url: "/posts/sample-food-1.html",
    image: "",
  },
  {
    id: "sample-info-1",
    title: "예시 · 40대 이후 꼭 알아야 할 건강 상식",
    summary:
      "나이가 들수록 관리가 필요한 건강 지표들이 있습니다. 놓치기 쉬운 핵심 정보를 모았습니다. (예시 글)",
    category: "info",
    date: "2026-08-13",
    url: "/posts/sample-info-1.html",
    image: "",
  },
  {
    id: "sample-food-2",
    title: "예시 · 근육을 되찾아주는 단백질 식단",
    summary:
      "나이가 들며 줄어드는 근육, 식단으로 되돌릴 수 있습니다. 추천 식재료를 소개합니다. (예시 글)",
    category: "food",
    date: "2026-08-12",
    url: "/posts/sample-food-1.html",
    image: "",
  },
  {
    id: "sample-info-2",
    title: "예시 · 당뇨 환자가 끊고 나서 알게 된 음식",
    summary:
      "건강식인 줄 알았지만 혈당을 올리는 의외의 음식이 있습니다. 실제 사례로 정리했습니다. (예시 글)",
    category: "info",
    date: "2026-08-12",
    url: "/posts/sample-info-1.html",
    image: "",
  },
  {
    id: "sample-food-3",
    title: "예시 · 눈 건강을 지키는 하루 한 끼 음식",
    summary:
      "약해진 눈 혈관을 보호하고 시력을 지키는 데 도움을 주는 음식들을 모았습니다. (예시 글)",
    category: "food",
    date: "2026-08-11",
    url: "/posts/sample-food-1.html",
    image: "",
  },
  {
    id: "sample-info-3",
    title: "예시 · 근감소증을 막기 위해 매일 챙길 것",
    summary:
      "지금 챙기지 않으면 늦습니다. 40대 이후 매일 실천해야 할 건강 습관을 정리했습니다. (예시 글)",
    category: "info",
    date: "2026-08-11",
    url: "/posts/sample-info-1.html",
    image: "",
  },
];

/* 전역 노출 */
window.CATEGORIES = CATEGORIES;
window.NAV_ORDER = NAV_ORDER;
window.POSTS = POSTS;
