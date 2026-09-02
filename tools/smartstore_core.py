"""네이버 스마트스토어 카테고리에서 상품명을 수집하는 핵심 로직.

GUI(smartstore_gui.py)와 CLI(smartstore_cli.py)가 공통으로 사용한다.
카테고리 페이지는 자바스크립트로 그려지기 때문에 Playwright(Chromium)로
실제 브라우저를 띄워 렌더링이 끝난 화면에서 상품명을 읽는다.
"""

from __future__ import annotations

import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

DEFAULT_URL = "https://smartstore.naver.com/yes24book/category/da522381ebe945058b0a46c11bd8e5cc"
DEFAULT_OUTPUT = "상품명.txt"

PRODUCT_HREF = re.compile(r"/products/(\d+)")

# 네이버가 자동화 브라우저를 골라내면 이 로그인 주소로 돌려보낸다.
LOGIN_HOST = "nid.naver.com"

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
    # 방문 기록(쿠키)을 남겨둘 폴더. 비우면 매번 완전히 새 브라우저로 시작해
    # "처음 온 방문자"로 보이며, 네이버가 자동화로 의심할 확률이 올라간다.
    profile_dir: str = ""
    # PC에 설치된 진짜 크롬을 쓴다. Playwright 전용 Chromium 보다 일반 사용자와
    # 구별되는 지점이 적다.
    use_system_chrome: bool = False
    # 카테고리 주소로 곧장 뛰어들지 않고 스토어 첫 화면을 먼저 들른다.
    # 사람이 실제로 들어가는 순서라 쿠키와 referer 가 갖춰진다.
    warm_up: bool = True


def _default_browser_cache() -> "Path | None":
    """Playwright 가 크롬을 기본으로 받아두는 사용자 폴더."""
    if sys.platform.startswith("win"):
        base = os.environ.get("LOCALAPPDATA")
        return Path(base) / "ms-playwright" if base else None
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Caches" / "ms-playwright"
    return Path.home() / ".cache" / "ms-playwright"


def _prepare_browser_path() -> None:
    """실행 파일(exe)로 묶여 돌 때 크롬을 어디서 찾을지 정리한다.

    Playwright 는 frozen 실행 파일에서 PLAYWRIGHT_BROWSERS_PATH 를 "0" 으로 잡아
    번들 안(.local-browsers)만 뒤진다. 빌드할 때 크롬을 번들에 넣지 않았다면
    거기엔 아무것도 없으므로, 사용자 폴더에 이미 받아둔 크롬으로 되돌려 준다.
    """
    if not getattr(sys, "frozen", False):
        return
    if os.environ.get("PLAYWRIGHT_BROWSERS_PATH"):
        return  # 사용자가 직접 지정했으면 존중한다

    bundled = Path(getattr(sys, "_MEIPASS", "")) / "playwright" / "driver" / "package" / ".local-browsers"
    if bundled.is_dir() and any(bundled.iterdir()):
        return  # 번들 안에 크롬이 들어 있다

    fallback = _default_browser_cache()
    if fallback and fallback.is_dir():
        os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(fallback)


def _launch_kwargs(options: CrawlOptions) -> dict:
    """chromium.launch 에 넘길 인자를 만든다."""
    kwargs: dict = {"headless": options.headless}
    executable = options.executable_path or os.environ.get("SMARTSTORE_CHROME", "")
    if executable:
        kwargs["executable_path"] = executable
    args = [
        # 이게 없으면 navigator.webdriver 가 true 로 남아 일반 브라우저와
        # 다르게 보이고, 네이버가 로그인 화면으로 돌려보낸다.
        "--disable-blink-features=AutomationControlled",
    ]

    # Playwright 는 기본으로 크롬 샌드박스를 꺼서 --no-sandbox 를 넘긴다.
    # 그러면 크롬 상단에 "지원되지 않는 명령줄 플래그" 경고 띠가 뜨고,
    # 보안도 낮아지며, 일반 브라우저와 구별되는 표시가 하나 더 생긴다.
    if hasattr(os, "geteuid") and os.geteuid() == 0:
        # 루트로 도는 컨테이너에서는 샌드박스를 쓸 수 없어 어쩔 수 없다.
        args.append("--no-sandbox")
    else:
        kwargs["chromium_sandbox"] = True

    kwargs["args"] = args
    return kwargs


def default_profile_dir() -> Path:
    """로그인 상태를 남겨둘 기본 폴더."""
    return Path.home() / ".smartstore-collector" / "profile"


def is_login_page(url: str) -> bool:
    """네이버 로그인 화면으로 튕겼는지."""
    return LOGIN_HOST in (url or "")


# ---------------------------------------------------------------- 순수 함수


def build_page_url(base_url: str, page: int) -> str:
    """base_url 의 cp(페이지 번호) 파라미터만 page 로 바꾼 URL을 만든다."""
    parts = urlsplit(base_url.strip())
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != "cp"]
    query.append(("cp", str(page)))
    return urlunsplit((parts.scheme, parts.netloc, parts.path, urlencode(query), ""))


def store_root_url(category_url: str) -> str:
    """카테고리 주소에서 스토어 첫 화면 주소를 뽑는다.

    https://smartstore.naver.com/yes24book/category/abc?cp=1
        -> https://smartstore.naver.com/yes24book
    """
    parts = urlsplit(category_url.strip())
    segments = [seg for seg in parts.path.split("/") if seg]
    if not segments:
        return urlunsplit((parts.scheme, parts.netloc, "/", "", ""))
    return urlunsplit((parts.scheme, parts.netloc, "/" + segments[0], "", ""))


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


def _user_agent(version: str) -> str:
    """헤드리스 표시가 없는, 현재 OS에 맞는 User-Agent 문자열."""
    major = (version or "").split(".")[0] or "122"
    if sys.platform.startswith("win"):
        platform = "Windows NT 10.0; Win64; x64"
    elif sys.platform == "darwin":
        platform = "Macintosh; Intel Mac OS X 10_15_7"
    else:
        platform = "X11; Linux x86_64"
    return (
        f"Mozilla/5.0 ({platform}) AppleWebKit/537.36 (KHTML, like Gecko) "
        f"Chrome/{major}.0.0.0 Safari/537.36"
    )


_CONTEXT_ARGS = {
    "locale": "ko-KR",
    "timezone_id": "Asia/Seoul",
    "viewport": {"width": 1440, "height": 900},
    "extra_http_headers": {"Accept-Language": "ko-KR,ko;q=0.9"},
}


def _open_browser(driver, options: CrawlOptions):
    """(browser, context) 를 연다.

    profile_dir 이 있으면 쿠키가 남는 프로필로 열어 "다시 찾아온 방문자"처럼
    보이게 한다. 이때는 browser 가 없으므로 None 을 돌려준다.
    """
    kwargs = _launch_kwargs(options)
    want_chrome = options.use_system_chrome and not kwargs.get("executable_path")
    if want_chrome:
        kwargs["channel"] = "chrome"

    def _launch(launch_kwargs: dict):
        """크롬이 안 깔려 있으면 번들 Chromium 으로 물러선다."""
        try:
            if options.profile_dir:
                Path(options.profile_dir).mkdir(parents=True, exist_ok=True)
                return driver.chromium.launch_persistent_context(
                    options.profile_dir, **launch_kwargs, **_CONTEXT_ARGS
                )
            return driver.chromium.launch(**launch_kwargs)
        except Exception:
            if "channel" not in launch_kwargs:
                raise
            fallback = {k: v for k, v in launch_kwargs.items() if k != "channel"}
            return _launch(fallback)

    if options.profile_dir:
        return None, _launch(kwargs)

    browser = _launch(kwargs)
    context_args = dict(_CONTEXT_ARGS)
    if options.headless:
        # 헤드리스 크롬은 User-Agent 에 "HeadlessChrome" 이 박혀 바로 들킨다.
        context_args["user_agent"] = _user_agent(browser.version)
    return browser, browser.new_context(**context_args)


def _handle_login_wall(page, target_url: str, options: CrawlOptions, say, stop) -> None:
    """네이버가 로그인 화면으로 돌려보냈을 때.

    로그인하면 19세 상품의 표시가 달라지므로 로그인을 강요하지 않는다.
    창이 떠 있으면 사용자가 직접 처리할 시간을 주고, 원래 주소로 돌아온 뒤
    수집을 이어간다.
    """
    if options.headless:
        raise CrawlError(
            "네이버가 자동화 브라우저로 판단해 로그인 화면으로 돌려보냈습니다.\n\n"
            "아래를 켜고 다시 실행해 보세요.\n"
            "  · [브라우저 창 보기]\n"
            "  · [방문 기록 유지]\n"
            "  · [설치된 크롬 사용]\n\n"
            "그래도 막히면 페이지를 직접 열어 확인해 주세요."
        )

    say("네이버가 로그인 화면으로 돌려보냈습니다.")
    say("열린 창에서 원래 페이지로 돌아가 주세요. 최대 5분 기다립니다.")
    deadline = time.time() + 300
    while time.time() < deadline:
        if stop():
            raise CrawlCancelled([])
        time.sleep(2)
        if not is_login_page(page.url):
            say("화면이 넘어갔습니다. 수집을 이어갑니다.")
            page.goto(target_url, wait_until="domcontentloaded", timeout=60_000)
            if is_login_page(page.url):
                continue
            return
    raise CrawlError("5분 동안 로그인 화면에서 넘어가지 못해 수집을 멈췄습니다.")


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

    _prepare_browser_path()

    with sync_playwright() as driver:
        try:
            browser, context = _open_browser(driver, options)
        except CrawlError:
            raise
        except Exception as exc:  # pragma: no cover - 설치 안내용
            raise CrawlError(
                "Chromium 브라우저를 실행하지 못했습니다.\n\n"
                "명령 프롬프트에서 아래 한 줄을 실행해 주세요.\n"
                "    playwright install chromium\n\n"
                f"원본 오류: {exc}"
            ) from exc

        page = context.pages[0] if context.pages else context.new_page()

        try:
            if options.warm_up:
                root = store_root_url(options.url)
                say(f"스토어 첫 화면을 먼저 엽니다: {root}")
                try:
                    page.goto(root, wait_until="domcontentloaded", timeout=60_000)
                    if is_login_page(page.url):
                        _handle_login_wall(page, root, options, say, stop)
                    time.sleep(2)
                except CrawlError:
                    raise
                except Exception as exc:
                    say(f"첫 화면을 열지 못했습니다({exc}). 그대로 진행합니다.")

            for page_no in range(1, options.max_pages + 1):
                if stop():
                    raise CrawlCancelled(names)
                url = build_page_url(options.url, page_no)
                say(f"[{page_no}쪽] 여는 중…")
                page.goto(url, wait_until="domcontentloaded", timeout=60_000)

                if is_login_page(page.url):
                    _handle_login_wall(page, url, options, say, stop)

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
            if browser is not None:
                browser.close()

    return names
