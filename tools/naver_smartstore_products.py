#!/usr/bin/env python3
"""네이버 스마트스토어 카테고리의 모든 상품명을 수집해 텍스트 파일로 저장한다.

사용 예:
    python tools/naver_smartstore_products.py \
        "https://smartstore.naver.com/yes24book/category/da522381ebe945058b0a46c11bd8e5cc" \
        -o 상품명.txt

카테고리 페이지는 자바스크립트로 그려지기 때문에 Playwright(Chromium)로 실제
브라우저를 띄워 렌더링된 화면에서 상품명을 읽어온다. `cp` 파라미터를 1부터
올려가며 더 이상 새 상품이 나오지 않을 때까지 반복한다.

사전 준비:
    pip install playwright
    playwright install chromium
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

PRODUCT_HREF = re.compile(r"/products/(\d+)")

# 상품 카드 안에는 상품명 말고도 가격·할인율·배지 텍스트가 섞여 있어 걸러낸다.
JUNK_LINE = re.compile(
    r"""^(
        [\d,]+\s*원            # 12,340원
        | \d+%                  # 10%
        | \d+(\.\d+)?           # 순수 숫자(리뷰 수 등)
        | 무료배송 | 오늘출발 | 내일도착 | 정기구독
        | 리뷰\s*[\d,]+ | 찜\s*[\d,]+ | 구매\s*[\d,]+
        | 적립.* | 쿠폰.* | 광고 | BEST | NEW | HOT | 품절 | 일시품절
    )$""",
    re.VERBOSE,
)


def build_page_url(base_url: str, page: int) -> str:
    """base_url 의 cp 파라미터만 page 로 바꾼 URL을 만든다."""
    parts = urlsplit(base_url)
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != "cp"]
    query.append(("cp", str(page)))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), ""))


def pick_name(raw_text: str) -> str:
    """앵커 텍스트에서 상품명으로 보이는 첫 줄을 고른다."""
    for line in (raw_text or "").splitlines():
        line = " ".join(line.split())
        if not line or JUNK_LINE.match(line):
            continue
        return line
    return ""


def scroll_to_bottom(page, pause: float = 0.4, rounds: int = 12) -> None:
    """지연 로딩된 상품 카드까지 모두 그려지도록 끝까지 스크롤한다."""
    last_height = 0
    for _ in range(rounds):
        height = page.evaluate("document.body.scrollHeight")
        if height == last_height:
            break
        last_height = height
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(pause)
    page.evaluate("window.scrollTo(0, 0)")


def collect_page(page) -> "dict[str, str]":
    """현재 화면에서 {상품ID: 상품명} 을 뽑는다."""
    found: dict[str, str] = {}
    for anchor in page.query_selector_all('a[href*="/products/"]'):
        href = anchor.get_attribute("href") or ""
        match = PRODUCT_HREF.search(href)
        if not match:
            continue
        product_id = match.group(1)
        if found.get(product_id):
            continue  # 이미 이름을 찾은 상품(이미지 링크 등 중복 앵커)
        name = pick_name(anchor.inner_text()) or (anchor.get_attribute("title") or "").strip()
        if name:
            found[product_id] = name
    return found


def crawl(base_url: str, max_pages: int, headless: bool, wait: float) -> "list[str]":
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Playwright가 필요합니다.  pip install playwright && playwright install chromium")

    names: list[str] = []
    seen_ids: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            locale="ko-KR",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()

        for page_no in range(1, max_pages + 1):
            url = build_page_url(base_url, page_no)
            print(f"[{page_no}쪽] {url}", file=sys.stderr)
            page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            try:
                page.wait_for_selector('a[href*="/products/"]', timeout=15_000)
            except Exception:
                print("  상품이 없어 종료합니다.", file=sys.stderr)
                break
            scroll_to_bottom(page)

            page_items = collect_page(page)
            new_items = {pid: name for pid, name in page_items.items() if pid not in seen_ids}
            if not new_items:
                print("  새로운 상품이 없어 종료합니다.", file=sys.stderr)
                break

            seen_ids.update(new_items)
            names.extend(new_items.values())
            print(f"  {len(new_items)}개 수집 (누적 {len(names)}개)", file=sys.stderr)
            time.sleep(wait)

        browser.close()

    return names


def main() -> None:
    parser = argparse.ArgumentParser(description="스마트스토어 카테고리 상품명 수집기")
    parser.add_argument("url", help="카테고리 URL (cp 파라미터는 자동으로 붙는다)")
    parser.add_argument("-o", "--out", default="상품명.txt", help="저장할 텍스트 파일 (기본: 상품명.txt)")
    parser.add_argument("--max-pages", type=int, default=100, help="최대 페이지 수 (기본: 100)")
    parser.add_argument("--wait", type=float, default=1.0, help="페이지 사이 대기 초 (기본: 1.0)")
    parser.add_argument("--show", action="store_true", help="브라우저 창을 띄워서 진행 상황을 본다")
    args = parser.parse_args()

    names = crawl(args.url, args.max_pages, headless=not args.show, wait=args.wait)
    if not names:
        sys.exit("상품명을 하나도 수집하지 못했습니다. --show 로 화면을 확인해 보세요.")

    out_path = Path(args.out)
    # 윈도우 메모장에서 한글이 깨지지 않도록 BOM 포함 UTF-8로 저장한다.
    out_path.write_text("\n".join(names) + "\n", encoding="utf-8-sig")
    print(f"\n총 {len(names)}개 상품명을 {out_path} 에 저장했습니다.", file=sys.stderr)


if __name__ == "__main__":
    main()
