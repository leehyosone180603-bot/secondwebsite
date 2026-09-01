"""네이버 스마트스토어 카테고리에서 상품명을 수집하는 핵심 로직.

GUI(smartstore_gui.py)와 CLI(smartstore_cli.py)가 공통으로 사용한다.
카테고리 페이지는 자바스크립트로 그려지기 때문에 Playwright(Chromium)로
실제 브라우저를 띄워 렌더링이 끝난 화면에서 상품명을 읽는다.
"""

from __future__ import annotations

import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

DEFAULT_URL = "https://smartstore.naver.com/yes24book/category/da522381ebe945058b0a46c11bd8e5cc"
DEFAULT_OUTPUT = "상품명.txt"

PRODUCT_HREF = re.compile(r"/products/(\d+)")

# 상품 카드 안에는 상품명 말고도 가격·할인율·배지 텍스트가 섞여 있어 걸러낸다.
JUNK_LINE = re.compile(
    r"""^(
        [\d,]+\s*원              # 12,340원
        | \d+(\.\d+)?\s*%        # 10%
        | \d{1,3}                 # 연령 배지(15, 19) 같은 짧은 숫자
        | \d+\.\d+               # 평점 4.9
        | 무료배송 | 오늘출발 | 내일도착 | 정기구독 | 톡톡
        | 리뷰\s*[\d,]+ | 찜\s*[\d,]+ | 구매건수\s*[\d,]+
        | 적립.* | 쿠폰.* | 광고 | AD | BEST | NEW | HOT | 품절 | 일시품절
    )$""",
    re.VERBOSE,
)


class CrawlCancelled(Exception):
    """사용자가 중지를 누른 경우. 그때까지 모은 상품명을 names 로 함께 전달한다."""

    def __init__(self, names: "Iterable[str] | None" = None):
        super().__init__("사용자가 수집을 중지했습니다.")
        self.names: list[str] = list(names or [])


class CrawlError(Exception):
    """사용자에게 그대로 보여줄 수 있는 실패 사유."""


@dataclass
class CrawlOptions:
    url: str = DEFAULT_URL
    max_pages: int = 100
    wait: float = 1.0
    headless: bool = True
    # 크롬 실행 파일을 직접 지정하고 싶을 때(사내망 등으로 playwright install 이
    # 막힌 환경). 비워 두면 Playwright가 설치한 Chromium을 쓴다.
    executable_path: str = ""


def _launch_kwargs(options: CrawlOptions) -> dict:
    """chromium.launch 에 넘길 인자를 만든다."""
    kwargs: dict = {"headless": options.headless}
    executable = options.executable_path or os.environ.get("SMARTSTORE_CHROME", "")
    if executable:
        kwargs["executable_path"] = executable
    if hasattr(os, "geteuid") and os.geteuid() == 0:
        # 루트로 도는 컨테이너에서는 크롬 샌드박스를 쓸 수 없다.
        kwargs["args"] = ["--no-sandbox"]
    return kwargs


# ---------------------------------------------------------------- 순수 함수


def build_page_url(base_url: str, page: int) -> str:
    """base_url 의 cp(페이지 번호) 파라미터만 page 로 바꾼 URL을 만든다."""
    parts = urlsplit(base_url.strip())
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != "cp"]
    query.append(("cp", str(page)))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), ""))


def pick_name(raw_text: str) -> str:
    """상품 카드 텍스트에서 상품명으로 보이는 첫 줄을 고른다."""
    for line in (raw_text or "").splitlines():
        line = " ".join(line.split())
        if not line or JUNK_LINE.match(line):
            continue
        return line
    return ""


def save_names(names: Iterable[str], path: str | Path) -> Path:
    """상품명을 한 줄에 하나씩 저장한다.

    윈도우 메모장에서 한글이 깨지지 않도록 BOM 포함 UTF-8로 쓴다.
    """
    out_path = Path(path)
    if out_path.parent != Path(""):
        out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(names) + "\n", encoding="utf-8-sig")
    return out_path


# ------------------------------------------------------------ 브라우저 조작


def _scroll_to_bottom(page, pause: float = 0.4, rounds: int = 15) -> None:
    """지연 로딩된 상품 카드까지 모두 그려지도록 끝까지 스크롤한다."""
    last_height = -1
    for _ in range(rounds):
        height = page.evaluate("document.body.scrollHeight")
        if height == last_height:
            break
        last_height = height
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(pause)
    page.evaluate("window.scrollTo(0, 0)")


def _collect_page(page) -> "dict[str, str]":
    """현재 화면에서 {상품ID: 상품명} 을 뽑는다.

    상품 하나에 이미지 링크와 제목 링크가 따로 걸려 있는 경우가 있어
    상품 ID로 묶고, 이름이 먼저 확인된 앵커의 값을 채택한다.
    """
    found: dict[str, str] = {}
    for anchor in page.query_selector_all('a[href*="/products/"]'):
        href = anchor.get_attribute("href") or ""
        match = PRODUCT_HREF.search(href)
        if not match:
            continue
        product_id = match.group(1)
        if found.get(product_id):
            continue
        name = pick_name(anchor.inner_text())
        if not name:
            name = (anchor.get_attribute("title") or "").strip()
        if name:
            found[product_id] = name
    return found


def crawl(
    options: CrawlOptions,
    log: Callable[[str], None] | None = None,
    progress: Callable[[int, int], None] | None = None,
    should_stop: Callable[[], bool] | None = None,
) -> "list[str]":
    """카테고리 첫 쪽부터 새 상품이 없을 때까지 훑어 상품명 목록을 돌려준다.

    log:         진행 메시지 콜백
    progress:    (지금까지 훑은 페이지 수, 누적 상품 수) 콜백
    should_stop: True를 돌려주면 즉시 중단하고 CrawlCancelled 를 던진다
    """
    say = log or (lambda _message: None)
    tick = progress or (lambda _page, _total: None)
    stop = should_stop or (lambda: False)

    try:
        from playwright.sync_api import sync_playwright
    except ImportError as exc:  # pragma: no cover - 설치 안내용
        raise CrawlError(
            "Playwright가 설치되어 있지 않습니다.\n\n"
            "명령 프롬프트에서 아래 두 줄을 실행해 주세요.\n"
            "    pip install playwright\n"
            "    playwright install chromium"
        ) from exc

    names: list[str] = []
    seen_ids: set[str] = set()

    with sync_playwright() as driver:
        try:
            browser = driver.chromium.launch(**_launch_kwargs(options))
        except Exception as exc:  # pragma: no cover - 설치 안내용
            raise CrawlError(
                "Chromium 브라우저를 실행하지 못했습니다.\n\n"
                "명령 프롬프트에서 아래 한 줄을 실행해 주세요.\n"
                "    playwright install chromium\n\n"
                f"원본 오류: {exc}"
            ) from exc

        context = browser.new_context(
            locale="ko-KR",
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()

        try:
            for page_no in range(1, options.max_pages + 1):
                if stop():
                    raise CrawlCancelled(names)
                url = build_page_url(options.url, page_no)
                say(f"[{page_no}쪽] 여는 중…")
                page.goto(url, wait_until="domcontentloaded", timeout=60_000)
                try:
                    page.wait_for_selector('a[href*="/products/"]', timeout=15_000)
                except Exception:
                    say(f"[{page_no}쪽] 상품이 없습니다. 수집을 끝냅니다.")
                    break

                _scroll_to_bottom(page)
                if stop():
                    raise CrawlCancelled(names)

                page_items = _collect_page(page)
                new_items = {pid: name for pid, name in page_items.items() if pid not in seen_ids}
                if not new_items:
                    say(f"[{page_no}쪽] 새로운 상품이 없습니다. 수집을 끝냅니다.")
                    break

                seen_ids.update(new_items)
                names.extend(new_items.values())
                say(f"[{page_no}쪽] {len(new_items)}개 수집 (누적 {len(names)}개)")
                tick(page_no, len(names))

                if options.wait > 0:
                    time.sleep(options.wait)
        finally:
            context.close()
            browser.close()

    return names
