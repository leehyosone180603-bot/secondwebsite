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
 * 실제 발행 글 목록 (최신 글이 위로).
 * 새 글을 추가할 때 이 배열 맨 위에 객체를 추가하세요.
 */
const POSTS = [
  {
    id: "bujong-good-5foods",
    title: "부종에 좋은 음식 5가지",
    summary:
      "몸속 나트륨과 수분을 배출해 부기를 빼주는 부종에 좋은 음식 5가지(바나나·팥·오이·아보카도·늙은 호박)를 정리했습니다.",
    category: "food",
    date: "2026-08-13",
    url: "/posts/bujong-good-5foods.html",
    image: "/img/bujong-hero.jpg",
  },
  {
    id: "jeonripseon-good-5foods",
    title: "전립선 건강에 좋은 음식 5가지",
    summary:
      "전립선 비대증·배뇨 불편감 예방에 도움을 주는 음식 5가지(토마토·호박씨·브로콜리·쏘팔메토·연어)를 정리했습니다.",
    category: "info",
    date: "2026-08-13",
    url: "/posts/jeonripseon-good-5foods.html",
    image: "/img/jeonripseon-hero.svg",
  },
  {
    id: "jangyeom-good-5foods",
    title: "장염에 좋은 음식 5가지",
    summary:
      "장 점막을 달래고 회복을 돕는 장염에 좋은 음식 5가지(흰죽·바나나·매실차·감자·보리차)와 섭취법을 정리했습니다.",
    category: "info",
    date: "2026-08-13",
    url: "/posts/jangyeom-good-5foods.html",
    image: "/img/jangyeom-hero.jpg",
  },
  {
    id: "gyeran-good-pairings-3foods",
    title: "계란과 같이 먹으면 몸에 ‘약’ 되는 음식 3가지",
    summary:
      "계란의 약점을 보완하고 영양 흡수를 높이는 환상의 짝꿍 음식 3가지(토마토·치즈·부추)와 조리법을 정리했습니다.",
    category: "food",
    date: "2026-08-13",
    url: "/posts/gyeran-good-pairings-3foods.html",
    image: "/img/gyeran-hero.jpg",
  },
  {
    id: "tongpung-avoid-5foods",
    title: "통풍에 안 좋은 음식 5가지",
    summary:
      "요산 수치를 올리는 통풍에 안 좋은 음식 5가지(술·등푸른생선·내장·액상과당·붉은 고기)와 대체 식단을 정리했습니다.",
    category: "info",
    date: "2026-08-13",
    url: "/posts/tongpung-avoid-5foods.html",
    image: "/img/tongpung-hero.jpg",
  },
  {
    id: "hyeolgwan-cleansing-3foods",
    title: "혈관 기름때 싹 비워내는 기적의 음식 3가지",
    summary:
      "혈관 속 콜레스테롤을 씻어내는 천연 음식 3가지(차전자피·홍국쌀·양파)와 200% 활용법, 생활 수칙까지 정리했습니다.",
    category: "food",
    date: "2026-08-13",
    url: "/posts/hyeolgwan-cleansing-3foods.html",
    image: "/img/hyeolgwan-hero.jpg",
  },
];

/* 전역 노출 */
window.CATEGORIES = CATEGORIES;
window.NAV_ORDER = NAV_ORDER;
window.POSTS = POSTS;
