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
    id: "pasangpung-symptoms-vaccine",
    title: "파상풍 증상과 초기증상, 예방접종·주사",
    summary:
      "파상풍의 원인과 대표 증상·초기증상, 파상풍 주사(예방접종)가 필요한 경우와 상처가 생겼을 때 대처법을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/pasangpung-symptoms-vaccine.html",
    image: "/img/pasang-hero.jpg",
  },
  {
    id: "sonjeorim-numbness-causes",
    title: "손저림·손발저림 원인과 관리 (팔·손가락·손바닥 저림)",
    summary:
      "손저림과 함께 팔·손가락·손바닥·손발 저림이 나타나는 원인과 완화 생활습관, 병원 방문이 필요한 경우를 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/sonjeorim-numbness-causes.html",
    image: "/img/sonjeorim-hero.jpg",
  },
  {
    id: "mechurial-benefits-intake",
    title: "메추리알 효능과 하루 권장 섭취량",
    summary:
      "작은 알 속 메추리알 효능 5가지(단백질·비타민/미네랄·성장기 영양·면역·눈 건강)와 하루 권장 섭취량, 콜레스테롤 주의점을 정리했습니다.",
    category: "food",
    date: "2026-08-14",
    url: "/posts/mechurial-benefits-intake.html",
    image: "/img/mechuri-hero.jpg",
  },
  {
    id: "sontop-hangnail-care",
    title: "손톱 거스러미(가시래기) 생기는 원인과 예방·관리 방법",
    summary:
      "손톱 가시래기·거스러미가 생기는 이유(피부 건조·물·물어뜯기 등)와 올바른 관리법, 병원에 가야 하는 경우, 예방 생활습관을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/sontop-hangnail-care.html",
    image: "/img/sontop-hero.jpg",
  },
  {
    id: "jwijeot-causes-removal",
    title: "쥐젖 생기는 이유·원인과 목·사타구니 쥐젖 제거·예방 관리",
    summary:
      "쥐젖(연성섬유종)이 생기는 원인과 목·사타구니 쥐젖 제거 방법, 제거 후 관리와 예방을 위한 생활습관을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/jwijeot-causes-removal.html",
    image: "/img/jwijeot-hero.jpg",
  },
  {
    id: "biripjong-eye-causes-removal",
    title: "눈 비립종 원인과 제거·예방 생활습관 (눈꺼풀·눈밑 비립종)",
    summary:
      "눈가에 생기는 하얀 좁쌀, 비립종의 원인과 눈꺼풀·눈밑 비립종 관리법, 피부과 제거 경험과 예방 생활습관을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/biripjong-eye-causes-removal.html",
    image: "/img/birip-hero.jpg",
  },
  {
    id: "ipdeot-timing-symptoms",
    title: "입덧 시작 시기와 끝나는 시기 (임신 초기 입덧 증상)",
    summary:
      "임신 초기 입덧 시작 시기와 끝나는 시기, 대표적인 입덧 증상과 견디는 데 도움이 되는 팁을 경험담과 함께 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/ipdeot-timing-symptoms.html",
    image: "/img/ipdeot-hero.jpg",
  },
  {
    id: "choeak-breakfast-4foods",
    title: "최악의 아침 식사 4가지",
    summary:
      "뇌 건강을 해치는 최악의 아침 식사 4가지(설탕 시리얼·가공육 빵·시판 과일주스·식빵과 잼)와 뇌를 깨우는 대체 식단을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/choeak-breakfast-4foods.html",
    image: "/img/choeak-hero.jpg",
  },
  {
    id: "naengbangbyeong-early-4symptoms",
    title: "냉방병 초기증상 4가지",
    summary:
      "콧물·기침보다 먼저 오는 냉방병 초기증상 4가지(오한·근육통, 두통, 위장장애, 건조 증상)와 여름철 예방법을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/naengbangbyeong-early-4symptoms.html",
    image: "/img/naengbang-hero.jpg",
  },
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
    image: "/img/jeonripseon-hero.jpg",
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
