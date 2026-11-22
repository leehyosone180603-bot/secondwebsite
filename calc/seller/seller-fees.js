/* 셀러 계산기 수수료 기본값 (한 곳에 모음).
 * 2026-11-22 각 마켓 공식 페이지에서 확인한 값만 사용. 미확인은 0 + direct:true(직접입력).
 * [VAT] 계산기 입력은 'VAT 포함' 기준. 공식값은 대부분 VAT 별도/표기없음이라,
 *   아래 fee/cat/shipRate/금액은 공식 raw값에 ×1.1 한 'VAT 포함' 기본값이다(raw에 원값 보존).
 *   (예: 쿠팡 도서 10.8% → 11.88% / 로켓그로스 극소형 입출고600+배송1125=1725 → 1898원)
 *   사용자가 화면에서 수정 가능.
 * window.SellerFees 로 노출. */
(function (root) {
  "use strict";
  var CHK = "2026-11-22";

  // 쿠팡 마켓플레이스 대분류 (출처 Fee-Table, 페이지기준 2019-11-25, VAT 표기없음 → ×1.1)
  var coupangCats = [
    { name: "가전디지털", raw: 7.8, fee: 8.58 }, { name: "가구/홈인테리어", raw: 10.8, fee: 11.88 },
    { name: "도서", raw: 10.8, fee: 11.88 }, { name: "음반", raw: 10.8, fee: 11.88 },
    { name: "문구/사무용품", raw: 10.8, fee: 11.88 }, { name: "출산/유아", raw: 10, fee: 11 },
    { name: "스포츠/레저용품", raw: 10.8, fee: 11.88 }, { name: "뷰티", raw: 9.6, fee: 10.56 },
    { name: "생활용품", raw: 7.8, fee: 8.58 }, { name: "식품", raw: 10.6, fee: 11.66 },
    { name: "완구/취미", raw: 10.8, fee: 11.88 }, { name: "자동차용품", raw: 10, fee: 11 },
    { name: "주방용품", raw: 10.8, fee: 11.88 }, { name: "패션(의류·잡화)", raw: 10.5, fee: 11.55 },
    { name: "반려/애완용품", raw: 10.8, fee: 11.88 }
  ];
  // 11번가 (페이지기준 2025-04, VAT 표기없음 → ×1.1)
  var st11Cats = [
    { name: "패션(브랜드·트렌드)", raw: 13, fee: 14.3 }, { name: "뷰티", raw: 13, fee: 14.3 },
    { name: "뷰티-헤어·바디", raw: 11, fee: 12.1 }, { name: "가공·건강식품", raw: 13, fee: 14.3 },
    { name: "신선(채소·축산·수산)", raw: 12, fee: 13.2 }, { name: "곡물", raw: 7, fee: 7.7 },
    { name: "출산/육아", raw: 13, fee: 14.3 }, { name: "출산-기저귀·분유", raw: 7, fee: 7.7 },
    { name: "생활/건강", raw: 13, fee: 14.3 }, { name: "주방용품", raw: 13, fee: 14.3 },
    { name: "가구/인테리어", raw: 13, fee: 14.3 }, { name: "스포츠/레저", raw: 13, fee: 14.3 },
    { name: "자동차용품", raw: 13, fee: 14.3 }, { name: "가전/디지털", raw: 9, fee: 9.9 },
    { name: "가전-노트북·TV·냉장고 등", raw: 7, fee: 7.7 }, { name: "도서/음반", raw: 15, fee: 16.5 },
    { name: "반려·문구·취미", raw: 13, fee: 14.3 }
  ];
  // G마켓/옥션(ESM) (페이지 기준일 없음, VAT 표기없음 → ×1.1)
  var esmCats = [
    { name: "가공식품", raw: 13, fee: 14.3 }, { name: "신선식품", raw: 12, fee: 13.2 },
    { name: "신선-쌀·잡곡", raw: 7, fee: 7.7 }, { name: "건강식품", raw: 13, fee: 14.3 },
    { name: "건강/의료용품", raw: 9, fee: 9.9 }, { name: "화장품/향수", raw: 13, fee: 14.3 },
    { name: "바디/헤어", raw: 11, fee: 12.1 }, { name: "생필품", raw: 11, fee: 12.1 },
    { name: "생활용품", raw: 13, fee: 14.3 }, { name: "주방용품", raw: 13, fee: 14.3 },
    { name: "가구/DIY", raw: 13, fee: 14.3 }, { name: "출산/육아", raw: 13, fee: 14.3 },
    { name: "출산-기저귀·분유", raw: 7, fee: 7.7 }, { name: "반려동물용품", raw: 13, fee: 14.3 },
    { name: "문구/사무용품", raw: 13, fee: 14.3 }, { name: "도서음반/e교육", raw: 15, fee: 16.5 },
    { name: "자동차용품", raw: 9, fee: 9.9 }, { name: "노트북/데스크탑", raw: 7, fee: 7.7 },
    { name: "주방가전", raw: 9, fee: 9.9 }, { name: "의류·신발·잡화", raw: 13, fee: 14.3 }
  ];
  var ST11_URL = "https://soffice.11st.co.kr/product/NoticeServcefeePop.tmall?method=getNoticeServcefeePop&lgok=Y&pr1=F&pr2=135010&pr3=3&pr4=yiWj9gpkBW%20DoZCkbVKlHQ";
  var ESM_URL = "https://www.esmplus.com/commonpopup/gmarketusecost";

  var fees = {
    updatedAt: CHK,
    note: "수수료는 마켓 정책에 따라 바뀝니다. 실제 수수료는 각 판매자센터에서 확인하세요.",

    // 오픈마켓 (마진율·구매대행 계산기)
    openMarket: {
      // 스마트스토어: 등급(매출규모)별 수수료. 등급값을 카테고리·배송비 수수료에 함께 적용.
      // [민간 정리] esoop, 페이지기준 2026-10, VAT 포함(×1.1 미적용).
      smartstore: { name: "스마트스토어", gradeMode: true, shipEqualsCat: true,
        link: 3, linkMarketing: 1,
        categories: [
          { name: "영세", fee: 1.947 }, { name: "중소1", fee: 2.563 }, { name: "중소2", fee: 2.728 },
          { name: "중소3", fee: 3.003 }, { name: "일반", fee: 3.630 }
        ],
        sourceUrl: "https://esoop.co.kr/faq/smartstore-fees",
        checkedAt: CHK, pageBaseDate: "2026-10", vat: "포함", unofficial: true,
        subNote: "네이버 공식표가 아닌 정리 자료 기준이며, 정확한 값은 스마트스토어센터에서 확인" },
      coupang: { name: "쿠팡", link: 0, linkNote: "연동 비용 없음(공식)", shipRate: 3.3, shipRaw: 3,
        categories: coupangCats, sourceUrl: "https://cloud.mkt.coupang.com/Fee-Table",
        checkedAt: CHK, pageBaseDate: "2019-11-25", vat: "표기없음",
        subNote: "소분류 예외 많음(예: 공구·수납·청소 10.8%, 쌀 5.8%, 면/라면 10.9%, 모니터 4.5%)" },
      st11: { name: "11번가", link: 0, shipRate: 0, shipDirect: true,
        categories: st11Cats, sourceUrl: ST11_URL,
        checkedAt: CHK, pageBaseDate: "2025-04", vat: "표기없음",
        subNote: "결제·연동/배송비 수수료는 페이지 별도 표기 없음 → 직접 입력" },
      gmarket: { name: "G마켓", link: 0, shipRate: 3.3, shipNote: "선결제 배송비×3.3%(무료·착불 제외)",
        categories: esmCats, sourceUrl: ESM_URL,
        checkedAt: CHK, pageBaseDate: "", vat: "표기없음",
        subNote: "전월 판매대금 500만원↑ 시 서버이용료 월 55,000원(판매자 ID 기준)" },
      auction: { name: "옥션", link: 0, shipRate: 3.3, shipNote: "선결제 배송비×3.3%(무료·착불 제외)",
        categories: esmCats, sourceUrl: ESM_URL,
        checkedAt: CHK, pageBaseDate: "", vat: "표기없음",
        subNote: "옥션은 G마켓과 동일 요율(ESM). 서버이용료 조건 동일" },
      custom: { name: "기타 마켓(직접 입력)", direct: true, link: 0, shipRate: 0, shipDirect: true,
        categories: [], sourceUrl: "", vat: "" }
    },

    // 로켓그로스 카테고리별 판매수수료 (= 마켓플레이스 동일, VAT 별도 → ×1.1)
    rocketCategory: {
      fashion:   { name: "패션의류잡화", raw: 10.5, fee: 11.55 },
      beauty:    { name: "뷰티",        raw: 9.6,  fee: 10.56 },
      baby:      { name: "출산·유아동",  raw: 10,   fee: 11 },
      food:      { name: "식품",        raw: 10.6, fee: 11.66 },
      kitchen:   { name: "주방용품",     raw: 10.8, fee: 11.88 },
      living:    { name: "생활용품",     raw: 7.8,  fee: 8.58 },
      furniture: { name: "가구·홈데코",  raw: 10.8, fee: 11.88 },
      digital:   { name: "가전·디지털",  raw: 7.8,  fee: 8.58 },
      sports:    { name: "스포츠·레저",  raw: 10.8, fee: 11.88 },
      car:       { name: "자동차용품",   raw: 10,   fee: 11 },
      book:      { name: "도서",        raw: 10.8, fee: 11.88 },
      office:    { name: "문구·오피스",  raw: 10.8, fee: 11.88 },
      media:     { name: "음반·DVD",    raw: 10.8, fee: 11.88 },
      toy:       { name: "완구·취미",    raw: 10.8, fee: 11.88 },
      pet:       { name: "반려동물용품", raw: 10.8, fee: 11.88 }
    },
    // 로켓그로스 입출고비+배송비 '시작금액'(VAT 별도 → ×1.1, 2025.1.6~, 프로모션 2027.01.31까지)
    // fee = (입출고비+배송비)×1.1, 반올림. inout/ship은 raw(별도).
    rocketSize: {
      xs:   { name: "극소형(세변합 ~80cm·~2kg)",  inout: 600,  ship: 1125, fee: 1898 },
      s:    { name: "소형(~100cm·~5kg)",          inout: 650,  ship: 1250, fee: 2090 },
      m:    { name: "중형(~120cm·~10kg)",         inout: 1240, ship: 1500, fee: 3014 },
      l1:   { name: "대형1(~140cm·~15kg)",        inout: 1375, ship: 1700, fee: 3383 },
      l2:   { name: "대형2(~160cm·~20kg)",        inout: 1375, ship: 2900, fee: 4703 },
      xl:   { name: "특대형(~250cm·~30kg)",       inout: 1375, ship: 3500, fee: 5363 }
    },
    rocketSource: { url: "https://wing.coupang.com/tenants/rfm/settlements/fee-information",
      detailUrl: "https://wing.coupang.com/tenants/rfm/settlements/fee-details#warehousing-and-fulfillment-fee",
      checkedAt: CHK, vat: "별도",
      note: "로켓그로스 비용은 모두 VAT 별도. 입출고·배송비는 '~부터' 시작금액이며 최종액은 카테고리·사이즈·판매가에 따라 다름 → Wing에서 확인" },

    // 하단 '수수료 출처' 목록
    sources: [
      { name: "쿠팡 마켓플레이스", url: "https://cloud.mkt.coupang.com/Fee-Table", checkedAt: CHK },
      { name: "11번가", url: ST11_URL, checkedAt: CHK },
      { name: "G마켓/옥션(ESM)", url: ESM_URL, checkedAt: CHK },
      { name: "쿠팡 로켓그로스(Wing)", url: "https://wing.coupang.com/tenants/rfm/settlements/fee-information", checkedAt: CHK },
      { name: "스마트스토어([민간] esoop)", url: "https://esoop.co.kr/faq/smartstore-fees", checkedAt: CHK, note: "비공식 정리 — 스마트스토어센터에서 확인" }
    ]
  };
  if (typeof module !== "undefined" && module.exports) module.exports = fees;
  else root.SellerFees = fees;
})(typeof window !== "undefined" ? window : this);
