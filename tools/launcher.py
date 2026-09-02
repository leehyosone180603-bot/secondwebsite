#!/usr/bin/env python3
"""RUN.bat 이 호출하는 준비·실행 스크립트.

배치 파일(.bat)은 한글을 넣으면 cmd.exe 가 조용히 죽는 문제가 있어
ASCII 로만 두었고, 안내 메시지와 준비물 설치는 전부 여기서 처리한다.

  1) playwright 패키지가 없으면 설치
  2) 크롬(Chromium) 이 없으면 내려받기
  3) GUI 실행
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MARKER = HERE / ".setup_done"
LINE = "=" * 56


def has_playwright() -> bool:
    try:
        import playwright  # noqa: F401
    except ImportError:
        return False
    return True


def run_step(args: "list[str]", label: str) -> None:
    print(f"  - {label} ...", flush=True)
    result = subprocess.run(args)
    if result.returncode != 0:
        raise RuntimeError(f"{label}에 실패했습니다. (오류 코드 {result.returncode})")


def ensure_ready() -> None:
    """처음 실행이거나 준비물이 빠졌으면 설치한다."""
    if MARKER.exists() and has_playwright():
        return

    print(LINE)
    print(" 처음 실행이라 준비물을 설치합니다.")
    print(" 인터넷 연결이 필요하고 몇 분 걸립니다.")
    print(LINE)

    run_step(
        [sys.executable, "-m", "pip", "install", "-r", str(HERE / "requirements.txt")],
        "파이썬 패키지 설치",
    )
    run_step(
        [sys.executable, "-m", "playwright", "install", "chromium"],
        "크롬(Chromium) 내려받기",
    )

    MARKER.write_text("ok\n", encoding="utf-8")
    print("\n 준비가 끝났습니다. 다음부터는 바로 실행됩니다.\n")


def main() -> int:
    try:
        ensure_ready()
    except RuntimeError as error:
        # 창을 붙잡아 두는 일은 RUN.bat 의 pause 가 맡는다.
        # 여기서 input() 을 쓰면 stdin 이 없을 때 EOFError 로 죽는다.
        print(f"\n{error}")
        print("인터넷 연결을 확인하고 다시 실행해 주세요.")
        return 1

    sys.path.insert(0, str(HERE))
    try:
        import smartstore_gui
    except ImportError as error:
        print(f"\n프로그램 파일을 찾지 못했습니다: {error}")
        print("압축을 푼 폴더 안의 파일이 모두 있는지 확인해 주세요.")
        return 1

    print("창을 띄웁니다. 이 검은 창은 닫지 마세요.\n")
    smartstore_gui.main()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
