/* 셀러 계산기 수수료 기본값 (한 곳에 모음).
 * 원칙: 공식 확인된 값만 채우고, 미확인은 0 + direct:true(직접입력 안내).
 * 각 값에 기준일(updatedAt)과 출처(source)를 둔다. 수수료는 자주 바뀌므로 화면에 기준일 표기.
 * window.SellerFees 로 노출 (fetch/CORS 회피 위해 .js 모듈). */
(function (root) {
  "use strict";
  var fees = {
    updatedAt: "2026-11-22",
    note: "수수료는 마켓 정책에 따라 바뀝니다. 실제 수수료는 각 판매자센터에서 확인하세요.",

    // 오픈마켓 (마진율·구매대행 계산기) — {cat:카테고리수수료%, link:연동수수료%, shipRate:배송비수수료%}
    openMarket: {
      smartstore: { name: "스마트스토어", cat: 0, link: 0, shipRate: 0, direct: true, source: "" },
      coupang:    { name: "쿠팡",       cat: 0, link: 0, shipRate: 0, direct: true, source: "" },
      st11:       { name: "11번가",     cat: 0, link: 0, shipRate: 0, direct: true, source: "" },
      gmarket:    { name: "G마켓",      cat: 0, link: 0, shipRate: 0, direct: true, source: "" },
      auction:    { name: "옥션",       cat: 0, link: 0, shipRate: 0, direct: true, source: "" },
      custom:     { name: "기타 마켓(직접 입력)", cat: 0, link: 0, shipRate: 0, direct: true, source: "" }
    },

    // 로켓그로스 카테고리별 판매수수료% (VAT 포함) — 미확인은 0/direct
    rocketCategory: {
      fashion:   { name: "패션의류잡화", fee: 0, direct: true },
      beauty:    { name: "뷰티",        fee: 0, direct: true },
      baby:      { name: "출산·유아동",  fee: 0, direct: true },
      food:      { name: "식품",        fee: 0, direct: true },
      kitchen:   { name: "주방용품",     fee: 0, direct: true },
      living:    { name: "생활용품",     fee: 0, direct: true },
      furniture: { name: "가구·홈데코",  fee: 0, direct: true },
      digital:   { name: "가전·디지털",  fee: 0, direct: true },
      sports:    { name: "스포츠·레저",  fee: 0, direct: true },
      car:       { name: "자동차용품",   fee: 0, direct: true },
      book:      { name: "도서",        fee: 0, direct: true },
      office:    { name: "문구·오피스",  fee: 0, direct: true },
      media:     { name: "음반·DVD",    fee: 0, direct: true },
      toy:       { name: "완구·취미",    fee: 0, direct: true },
      pet:       { name: "반려동물용품", fee: 0, direct: true }
    },

    // 로켓그로스 입출고·배송비 사이즈별(원, VAT 포함) — 미확인은 0/direct
    rocketSize: {
      xs:  { name: "극소", fee: 0, direct: true },
      s:   { name: "소",   fee: 0, direct: true },
      m:   { name: "중",   fee: 0, direct: true },
      l:   { name: "대",   fee: 0, direct: true },
      xl:  { name: "특대", fee: 0, direct: true }
    },
    // 참고용(비공식) — 마켓 공식 수수료표는 로그인이 필요해 자동 반영하지 못함.
    // 아래는 2차 자료 기준 '범위'이며, 반드시 판매자센터에서 확인 후 직접 입력할 것.
    reference: {
      asof: "2026-11",
      openMarket: {
        smartstore: "네이버페이 주문관리수수료 매출구간별 약 1.98%(영세)~3.63%(일반, VAT포함) + 네이버쇼핑 유입 시 매출연동 2%. (근거: 네이버 2021 보도자료 영세 2.0%/일반 3.3% VAT별도 ×1.1)",
        coupang: "카테고리별 약 4%~10.8% + 배송비 3.3%(VAT포함)",
        st11: "카테고리별 약 7%~20% + 결제 3.3%(VAT포함), 서버이용료 월 77,000원 조건부",
        gmarket: "카테고리별 약 4%~15% + 배송 3.3%(VAT포함), 서버이용료 월 55,000원 조건부",
        auction: "G마켓과 동일 계열(ESM) 요율 범위"
      },
      rocketNote: "로켓그로스 판매수수료는 마켓플레이스와 동일 카테고리 요율(예: 도서 10.8%≈VAT포함 11.88%, 패션 10.5%, 뷰티 9.6%, 식품 10.6%). 사이즈별 입출고·배송비는 2025.1 6단계 개편으로 공식표 확인 필요(극소 600원대~ 등 자료 상충).",
      sources: [
        "네이버 2021 보도자료(공식): https://navercorp.com/media/pressReleasesDetail?seq=30483",
        "쿠팡/11번가/G마켓 요율(비공식 2차): windly.cc, eopla.net, oursupporter.com"
      ]
    },
    sourceNote: "공식 수수료표 미도달(세션 네트워크 차단). 기본값은 0(직접입력), 참고범위는 reference 참조."
  };
  if (typeof module !== "undefined" && module.exports) module.exports = fees;
  else root.SellerFees = fees;
})(typeof window !== "undefined" ? window : this);
