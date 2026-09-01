#!/usr/bin/env python3
"""스마트스토어 상품명 수집기 (명령줄).

GUI 없이 쓰고 싶거나 자동화에 끼워 넣을 때 사용한다.

    python smartstore_cli.py "<카테고리 주소>" -o 상품명.txt
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import smartstore_core as core


def main() -> int:
    parser = argparse.ArgumentParser(description="스마트스토어 카테고리 상품명 수집기")
    parser.add_argument("url", nargs="?", default=core.DEFAULT_URL,
                        help="카테고리 주소 (cp 페이지 번호는 자동으로 붙는다)")
    parser.add_argument("-o", "--out", default=core.DEFAULT_OUTPUT,
                        help=f"저장할 텍스트 파일 (기본: {core.DEFAULT_OUTPUT})")
    parser.add_argument("--max-pages", type=int, default=100, help="최대 페이지 수 (기본: 100)")
    parser.add_argument("--wait", type=float, default=1.0, help="페이지 간 대기 초 (기본: 1.0)")
    parser.add_argument("--show", action="store_true", help="브라우저 창을 띄워 진행 상황을 본다")
    args = parser.parse_args()

    options = core.CrawlOptions(
        url=args.url,
        max_pages=args.max_pages,
        wait=args.wait,
        headless=not args.show,
    )

    def say(message: str) -> None:
        print(message, file=sys.stderr, flush=True)

    try:
        names = core.crawl(options, log=say)
    except core.CrawlCancelled as cancelled:
        names = cancelled.names
    except core.CrawlError as error:
        print(error, file=sys.stderr)
        return 2

    if not names:
        print("상품명을 하나도 수집하지 못했습니다. --show 로 화면을 확인해 보세요.", file=sys.stderr)
        return 1

    saved = core.save_names(names, args.out)
    say(f"\n총 {len(names)}개 상품명을 {saved} 에 저장했습니다.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
