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
  calc:     { slug: "calc",     name: "나이·날짜 계산기", ready: true  },
  exercise: { slug: "exercise", name: "건강운동", ready: false },
  diet:     { slug: "diet",     name: "다이어트", ready: false },
  disease:  { slug: "disease",  name: "질환·병",  ready: false },
  life:     { slug: "life",     name: "생활·정책", ready: true  },
};

/* 상단 네비게이션에 노출할 순서 */
const NAV_ORDER = ["food", "info", "calc", "exercise", "diet", "disease", "life"];

/*
 * 실제 발행 글 목록 (최신 글이 위로).
 * 새 글을 추가할 때 이 배열 맨 위에 객체를 추가하세요.
 */
const POSTS = [
  {
    id: "jeonse-loan-guide",
    title: "전세자금대출 조건·한도·금리 총정리 — 얼마까지 받을까",
    summary: "전세자금대출은 얼마까지, 어떤 조건으로 받을 수 있을까요? 한도·금리·정책상품(버팀목)과 신청 흐름을 정리하고, 내 한도는 계산기로 모의계산합니다.",
    category: "life",
    date: "2026-11-21",
    url: "/posts/jeonse-loan-guide.html",
    image: "/img/jeonse-loan-guide-1.jpg",
  },
  {
    id: "stress-dsr-guide",
    title: "스트레스 DSR 3단계 완전정리 — 내 대출한도 얼마나 줄었나",
    summary: "스트레스 DSR이 뭔지, 가산금리로 대출한도가 얼마나 줄어드는지 쉽게 정리했습니다. 내 한도는 DSR 계산기로 바로 모의계산해 보세요.",
    category: "life",
    date: "2026-11-21",
    url: "/posts/stress-dsr-guide.html",
    image: "/img/stress-dsr-guide-1.jpg",
  },
  {
    id: "youth-rent-support",
    title: "청년월세 특별지원 조건·신청방법 — 무주택 청년 월세 지원",
    summary: "무주택 청년이라면 월세 일부를 지원받을 수 있습니다. 청년월세 지원의 나이·소득·주거 조건과 신청 방법, 확인 사이트를 정리했습니다.",
    category: "life",
    date: "2026-11-21",
    url: "/posts/youth-rent-support.html",
    image: "/img/youth-rent-support-1.jpg",
  },
  {
    id: "energy-voucher-heating",
    title: "에너지바우처 신청 대상·방법 — 겨울 난방비 지원 총정리",
    summary: "겨울 난방비가 부담된다면 에너지바우처를 확인하세요. 지원 대상, 신청 방법, 사용처와 함께 난방비 지원을 받는 법을 정리했습니다.",
    category: "life",
    date: "2026-11-21",
    url: "/posts/energy-voucher-heating.html",
    image: "/img/energy-voucher-heating-1.jpg",
  },
  {
    id: "hidden-gov-subsidy",
    title: "숨은 정부지원금 찾는 법 — 보조금24·복지로 100% 활용",
    summary: "받을 수 있는데 몰라서 못 받는 정부지원금, 보조금24와 복지로로 한 번에 찾는 법을 단계별로 정리했습니다. 숨은 환급금 확인 팁까지.",
    category: "life",
    date: "2026-11-21",
    url: "/posts/hidden-gov-subsidy.html",
    image: "/img/hidden-gov-subsidy-1.jpg",
  },
  {
    id: "minsaeng-support",
    title: "민생지원금 신청방법·대상 — 정부24로 내가 받는지 확인하는 법",
    summary: "민생지원금은 누가, 얼마나 받을까요? 지급 구조와 신청 방법, 그리고 내가 대상인지 정부24·보조금24에서 바로 확인하는 법을 정리했습니다.",
    category: "life",
    date: "2026-11-21",
    url: "/posts/minsaeng-support.html",
    image: "/img/minsaeng-support-1.jpg",
  },
  {
    id: "raw-oyster-norovirus-symptoms",
    title: "생굴 노로바이러스 증상과 잠복기, 안전하게 먹는 법",
    summary: "생굴 먹고 12~48시간 뒤 구토·설사가 나면 노로바이러스일 수 있어요. 증상, 대처법, 85℃ 1분 가열 기준을 정리했습니다.",
    category: "info",
    date: "2026-11-20",
    url: "/posts/raw-oyster-norovirus-symptoms.html",
    image: "/img/raw-oyster-norovirus-symptoms-1.jpg",
  },
  // ── 나이·날짜 계산기 관련 글 (calcbox.kr 이전분) ──
  {
    id: "zodiac-year-age",
    title: "십이지 띠로 나이·출생연도 찾기 — 내 띠, N띠는 몇년생·몇 살?",
    summary: "내 띠는 몇년생일까요? 십이지 열두 띠로 나이와 출생연도를 빠르게 찾는 법과 띠별 조견표를 정리했습니다.",
    category: "calc",
    date: "2026-08-13",
    url: "/posts/zodiac-year-age.html",
    image: "/img/zodiac-year-age.jpg",
  },
  {
    id: "elementary-school-age",
    title: "초등학교 입학 나이 — 몇년생이 몇 년에 입학? (2026년 기준 표)",
    summary: "몇년생이 몇 년에 초등학교에 입학할까요? 2026년 기준 출생연도별 입학 연도표를 정리했습니다.",
    category: "calc",
    date: "2026-08-13",
    url: "/posts/elementary-school-age.html",
    image: "/img/elementary-school-age.jpg",
  },
  {
    id: "age-table-2026",
    title: "2026년 나이표 총정리 — 출생연도별 올해 만 나이·띠 한눈에",
    summary: "출생연도만 알면 끝. 2026년 기준 출생연도별 만 나이와 띠를 한눈에 볼 수 있는 나이표입니다.",
    category: "calc",
    date: "2026-07-27",
    url: "/posts/age-table-2026.html",
    image: "/img/age-table-2026.jpg",
  },
  {
    id: "rrn-age-decode",
    title: "주민등록번호로 나이·출생연도·성별 알아내는 법",
    summary: "주민등록번호 앞·뒷자리로 나이, 출생연도, 성별을 읽어내는 방법을 알기 쉽게 정리했습니다.",
    category: "calc",
    date: "2026-07-26",
    url: "/posts/rrn-age-decode.html",
    image: "/img/rrn-age-decode.jpg",
  },
  {
    id: "milestone-ages",
    title: "환갑·진갑·칠순·팔순·구순은 몇 살? 나이별 기념 명칭 총정리",
    summary: "환갑·진갑·칠순·팔순·구순은 각각 몇 살일까요? 나이별 기념 명칭과 유래를 한 번에 정리했습니다.",
    category: "calc",
    date: "2026-07-25",
    url: "/posts/milestone-ages.html",
    image: "/img/milestone-ages.jpg",
  },
  {
    id: "senior-benefits-age",
    title: "지하철 무임승차·경로우대 나이 총정리 (만 65세 혜택)",
    summary: "지하철 무임승차·경로우대는 몇 살부터일까요? 만 65세 어르신 혜택과 신청 방법을 정리했습니다.",
    category: "calc",
    date: "2026-07-24",
    url: "/posts/senior-benefits-age.html",
    image: "/img/senior-benefits-age.jpg",
  },
  {
    id: "pension-start-age",
    title: "국민연금 수급 개시 나이 — 출생연도별 노령연금 받는 나이 (2026)",
    summary: "국민연금은 몇 살부터 받을까요? 출생연도별 노령연금 수급 개시 나이를 2026년 기준으로 정리했습니다.",
    category: "calc",
    date: "2026-07-23",
    url: "/posts/pension-start-age.html",
    image: "/img/pension-start-age.jpg",
  },
  {
    id: "birthyear-to-hakbeon",
    title: "몇년생 몇 학번? 출생연도–학번 환산표 (재수·빠른년생 포함)",
    summary: "몇년생이 몇 학번일까요? 재수·빠른년생까지 반영한 출생연도–학번 환산표를 정리했습니다.",
    category: "calc",
    date: "2026-07-22",
    url: "/posts/birthyear-to-hakbeon.html",
    image: "/img/birthyear-to-hakbeon.jpg",
  },
  {
    id: "fast-year-birth",
    title: "빠른 년생이란? 빠른 05·06년생 학년·나이 완전정리",
    summary: "빠른 년생이 정확히 무엇일까요? 빠른 05·06년생의 학년·나이 기준을 헷갈리지 않게 정리했습니다.",
    category: "calc",
    date: "2026-07-21",
    url: "/posts/fast-year-birth.html",
    image: "/img/fast-year-birth.jpg",
  },
  {
    id: "age-types-korean",
    title: "만 나이 vs 세는 나이 vs 연 나이 차이 (2023 개정 후 완전정리)",
    summary: "만 나이·세는 나이·연 나이는 어떻게 다를까요? 2023년 개정 이후 기준을 완전 정리했습니다.",
    category: "calc",
    date: "2026-07-20",
    url: "/posts/age-types-korean.html",
    image: "/img/age-types-korean.jpg",
  },
  {
    id: "birth-year-guide",
    title: "몇년생 계산기 — 나이로 출생연도·띠 찾기 (나이 조견표)",
    summary: "55세는 몇년생일까요? 나이로 출생연도·띠를 찾는 법과 나이 조견표를 정리했습니다.",
    category: "calc",
    date: "2026-07-06",
    url: "/posts/birth-year-guide.html",
    image: "/img/birth-year-guide.jpg",
  },
  {
    id: "business-days-guide",
    title: "영업일 계산기 사용법 — 주말·공휴일 제외 영업일 수 구하는 법",
    summary: "주말·공휴일을 뺀 영업일 수는 어떻게 셀까요? 영업일 계산기 사용법과 실제 예시를 정리했습니다.",
    category: "calc",
    date: "2026-07-04",
    url: "/posts/business-days-guide.html",
    image: "/img/business-days-guide.jpg",
  },
  {
    id: "military-discharge",
    title: "전역일 계산기 사용법 — 입대일로 전역일·전역 D-day 구하는 법",
    summary: "입대일만 알면 전역일과 전역 D-day가 나옵니다. 전역일 계산기 사용법을 정리했습니다.",
    category: "calc",
    date: "2026-07-03",
    url: "/posts/military-discharge.html",
    image: "/img/military-discharge.jpg",
  },
  {
    id: "age-calculator",
    title: "만 나이 계산기 사용법 — 만 나이·세는 나이 차이 한눈에",
    summary: "만 나이 계산기 사용법과 만 나이·세는 나이의 차이를 한눈에 정리했습니다.",
    category: "calc",
    date: "2026-06-29",
    url: "/posts/age-calculator.html",
    image: "/img/age-calculator.jpg",
  },
  // ── 건강 콘텐츠 ──
  {
    id: "geonmangjeung-chimae-difference",
    title: "건망증과 치매 증상 차이점, 건망증 치료와 치매 예방법",
    summary:
      "건망증과 치매 증상의 차이점, 집에서 해보는 치매 자가진단, 원인별 건망증 치료와 생활습관으로 실천하는 치매 예방법을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/geonmangjeung-chimae-difference.html",
    image: "/img/geonmang-hero.jpg",
  },
  {
    id: "meong-bruise-causes-remedy",
    title: "멍드는 이유와 피멍 빨리 빼는법 (멍연고)",
    summary:
      "멍드는 이유와 처음 48시간이 중요한 피멍 빼는법(냉·온찜질), 멍연고 사용법과 멍 빨리 빼는 생활습관, 병원 방문이 필요한 경우를 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/meong-bruise-causes-remedy.html",
    image: "/img/meong-hero.jpg",
  },
  {
    id: "abocado-ripening-benefits",
    title: "아보카도 후숙 방법과 효능·칼로리·먹는법",
    summary:
      "실패하지 않는 아보카도 후숙 방법과 효능·칼로리, 잘 익은/덜 익은 아보카도 구별, 샌드위치·샐러드 등 먹는법을 정리했습니다.",
    category: "food",
    date: "2026-08-14",
    url: "/posts/abocado-ripening-benefits.html",
    image: "/img/abo-hero.jpg",
  },
  {
    id: "gohyeolap-causes-symptoms-lowering",
    title: "고혈압 원인과 증상, 낮추는 방법",
    summary:
      "침묵의 살인자 고혈압의 원인(나트륨·운동부족·스트레스·가족력 등)과 증상, 혈압을 낮추는 생활습관을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/gohyeolap-causes-symptoms-lowering.html",
    image: "/img/gohyeol-hero.jpg",
  },
  {
    id: "gangbakjeung-symptoms-treatment",
    title: "강박증과 강박사고 차이, 증상과 치료·약 (확인·저장강박증)",
    summary:
      "강박증과 강박사고의 차이, 확인강박증·저장강박증 같은 대표 증상과 인지행동치료·약물치료 등 강박증 치료 방법을 정리했습니다.",
    category: "info",
    date: "2026-08-14",
    url: "/posts/gangbakjeung-symptoms-treatment.html",
    image: "/img/gangbak-hero.jpg",
  },
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
