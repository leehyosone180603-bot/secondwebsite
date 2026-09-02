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
    # 스토어 첫 화면에서 클릭해 들어갈 메뉴 이름 (예: "국내도서").
    # 카테고리 딥링크는 로그인 세션이 없으면 열리지 않으므로 이 방식을 쓴다.
    category_name: str = ""
    # 19 표시(성인 상품)가 붙은 상품만 모은다.
    adult_only: bool = False
    # 첫 쪽 상품 카드의 HTML 을 저장할 파일. 화면 구조를 확인할 때 쓴다.
    debug_dump: str = ""


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


# 상품 카드 하나하나에서 판단에 필요한 것만 뽑아 온다.
# 카드 전체 HTML 을 다 가져오면 너무 무거워서, 이미지 정보와 잎노드 텍스트만 본다.
_CARD_SCRIPT = """
() => {
  const out = [];
  const done = new Set();
  for (const a of document.querySelectorAll('a[href*="/products/"]')) {
    const m = (a.getAttribute('href') || '').match(/\\/products\\/(\\d+)/);
    if (!m) continue;
    const id = m[1];
    let entry = out.find(o => o.id === id);
    if (!entry) { entry = {id: id, titles: [], marks: [], imgs: []}; out.push(entry); }

    // 상품명 후보: 링크 자체의 글자와 title 속성만 본다.
    const t = (a.innerText || '').trim();
    if (t) entry.titles.push(t);
    const attr = a.getAttribute('title');
    if (attr) entry.titles.push(attr.trim());

    // 배지 판단용: 카드 안의 짧은 글자와 이미지 설명. 상품명 후보와 절대 섞지 않는다.
    if (done.has(id)) continue;
    done.add(id);
    const card = a.closest('li') || a.closest('[class*=item]') || a.parentElement || a;
    for (const img of card.querySelectorAll('img')) {
      entry.imgs.push(((img.getAttribute('src') || '') + ' | ' +
                       (img.getAttribute('alt') || '')).slice(0, 300));
    }
    for (const el of card.querySelectorAll('*')) {
      if (el.children.length === 0) {
        const s = (el.textContent || '').trim();
        if (s && s.length <= 20) entry.marks.push(s);
      }
      const label = el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('alt'));
      if (label) entry.marks.push(String(label).slice(0, 60));
    }
  }
  return out;
}
"""

# 19 표시(성인 상품)를 알아보는 단서들. 네이버가 이걸 이미지로 그릴 수도,
# 글자로 넣을 수도 있어 여러 갈래를 함께 본다.
_ADULT_TEXT = re.compile(r"^(19|19\s*세|19금|성인)$")
_ADULT_PHRASE = re.compile(r"(19세\s*이상|성인\s*인증|청소년\s*유해|adult)", re.IGNORECASE)
_ADULT_IMAGE = re.compile(r"(adult|19_?over|age_?19|19age)", re.IGNORECASE)


def looks_adult(card: dict) -> bool:
    """카드의 배지·이미지에 19 표시로 볼 만한 단서가 있는지.

    상품명(titles)은 보지 않는다. 제목에 '19'가 들어간 책까지 딸려오면 안 된다.
    """
    for raw in card.get("marks", []):
        text = " ".join(str(raw).split())
        if _ADULT_TEXT.match(text) or _ADULT_PHRASE.search(text):
            return True
    for raw in card.get("imgs", []):
        if _ADULT_IMAGE.search(str(raw)):
            return True
    return False


def card_name(card: dict) -> str:
    """카드에서 상품명을 고른다. 배지 텍스트는 후보에 들어 있지 않다."""
    for raw in card.get("titles", []):
        name = pick_name(str(raw))
        if name and len(name) >= 2:
            return name
    return ""


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


def _collect_page(page, adult_only: bool) -> "tuple[dict[str, str], list[str]]":
    """현재 화면에서 (모은 {상품ID: 상품명}, 화면에 있던 전체 상품ID) 를 돌려준다.

    끝 페이지 판정은 '모은 것'이 아니라 '화면에 있던 전체'로 해야 한다.
    19 표시만 모으는 경우, 해당 상품이 없는 쪽이 이어져도 목록은 계속되기 때문.
    """
    cards = page.evaluate(_CARD_SCRIPT) or []
    found: dict[str, str] = {}
    for card in cards:
        if adult_only and not looks_adult(card):
            continue
        name = card_name(card)
        if name:
            found[card["id"]] = name
    return found, [card["id"] for card in cards]


def _dump_cards(page, path: str, say) -> None:
    """상품 카드 몇 개의 HTML 을 파일로 남긴다 (화면 구조 확인용)."""
    try:
        html = page.evaluate("""
        () => {
          const seen = new Set(); const parts = [];
          for (const a of document.querySelectorAll('a[href*="/products/"]')) {
            const m = (a.getAttribute('href')||'').match(/\\/products\\/(\\d+)/);
            if (!m || seen.has(m[1])) continue;
            seen.add(m[1]);
            const card = a.closest('li') || a.parentElement || a;
            parts.push(card.outerHTML);
            if (parts.length >= 5) break;
          }
          return parts.join('\\n\\n<!-- ================ -->\\n\\n');
        }
        """)
        Path(path).write_text(html or "(상품 카드를 찾지 못함)", encoding="utf-8")
        say(f"진단용 HTML을 저장했습니다: {path}")
    except Exception as exc:
        say(f"진단용 HTML 저장 실패: {exc}")


def _enter_category(page, options: CrawlOptions, say, stop) -> str:
    """스토어 첫 화면에서 메뉴를 눌러 카테고리로 들어가고, 그 주소를 돌려준다."""
    name = options.category_name.strip()
    say(f"'{name}' 메뉴를 찾는 중…")
    try:
        page.get_by_role("link", name=name, exact=True).first.click(timeout=15_000)
    except Exception:
        try:
            page.click(f'a:has-text("{name}")', timeout=15_000)
        except Exception as exc:
            raise CrawlError(
                f"스토어 첫 화면에서 '{name}' 메뉴를 찾지 못했습니다.\n\n"
                "메뉴 이름을 화면에 보이는 그대로 적어 주세요.\n"
                f"원본 오류: {exc}"
            ) from exc

    page.wait_for_load_state("domcontentloaded", timeout=60_000)
    time.sleep(2)
    if is_login_page(page.url):
        _handle_login_wall(page, page.url, options, say, stop)
    say(f"카테고리로 들어왔습니다: {page.url}")
    return page.url


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
    seen_ids: set[str] = set()     # 이미 담은 상품
    seen_cards: set[str] = set()   # 화면에서 본 모든 상품 (끝 판정용)

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

        base_url = options.url

        try:
            if options.warm_up or options.category_name:
                root = store_root_url(options.url)
                say(f"스토어 첫 화면을 먼저 엽니다: {root}")
                page.goto(root, wait_until="domcontentloaded", timeout=60_000)
                if is_login_page(page.url):
                    _handle_login_wall(page, root, options, say, stop)
                time.sleep(2)

            if options.category_name:
                # 카테고리 딥링크는 로그인 세션이 없으면 열리지 않는다.
                # 첫 화면에서 메뉴를 눌러 들어가면 세션이 갖춰진 채로 이동한다.
                base_url = _enter_category(page, options, say, stop)

            for page_no in range(1, options.max_pages + 1):
                if stop():
                    raise CrawlCancelled(names)
                url = build_page_url(base_url, page_no)
                # 카테고리를 눌러 들어온 직후라면 이미 1쪽이 떠 있다.
                if not (page_no == 1 and options.category_name):
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

                if page_no == 1 and options.debug_dump:
                    _dump_cards(page, options.debug_dump, say)

                page_items, card_ids = _collect_page(page, options.adult_only)

                # 끝 판정: 이 쪽에 처음 보는 상품이 하나도 없으면 목록이 끝난 것.
                fresh_cards = [cid for cid in card_ids if cid not in seen_cards]
                if not fresh_cards:
                    say(f"[{page_no}쪽] 새로운 상품이 없습니다. 수집을 끝냅니다.")
                    break
                seen_cards.update(card_ids)

                new_items = {pid: name for pid, name in page_items.items() if pid not in seen_ids}
                if new_items:
                    seen_ids.update(new_items)
                    names.extend(new_items.values())
                    say(f"[{page_no}쪽] 상품 {len(card_ids)}개 중 {len(new_items)}개 수집 "
                        f"(누적 {len(names)}개)")
                elif options.adult_only:
                    say(f"[{page_no}쪽] 상품 {len(card_ids)}개, 19 표시 없음")
                else:
                    say(f"[{page_no}쪽] 상품 {len(card_ids)}개, 새로 담을 것 없음")
                tick(page_no, len(names))

                if options.wait > 0:
                    time.sleep(options.wait)
        finally:
            context.close()
            if browser is not None:
                browser.close()

    return names
