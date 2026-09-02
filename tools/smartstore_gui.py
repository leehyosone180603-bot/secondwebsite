#!/usr/bin/env python3
"""스마트스토어 상품명 수집기 (GUI).

카테고리 주소를 넣고 [수집 시작]을 누르면 모든 페이지를 훑어 상품명을
텍스트 파일로 저장한다. 저장한 파일은 메모장에서 바로 열 수 있다.

실행:  python smartstore_gui.py
"""

from __future__ import annotations

import os
import queue
import subprocess
import sys
import threading
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import tkinter as tk
from tkinter import filedialog, messagebox, ttk

import smartstore_core as core

PAD = 8


def open_in_file_manager(path: Path) -> None:
    """저장한 파일을 각 운영체제의 기본 프로그램(메모장 등)으로 연다."""
    if sys.platform.startswith("win"):
        os.startfile(path)  # type: ignore[attr-defined]
    elif sys.platform == "darwin":
        subprocess.Popen(["open", str(path)])
    else:
        subprocess.Popen(["xdg-open", str(path)])


class App(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("스마트스토어 상품명 수집기")
        self.geometry("760x560")
        self.minsize(640, 480)

        self.messages: "queue.Queue[tuple]" = queue.Queue()
        self.stop_flag = threading.Event()
        self.worker: threading.Thread | None = None
        self.saved_path: Path | None = None

        self._build_widgets()
        self.after(100, self._drain_messages)
        self.protocol("WM_DELETE_WINDOW", self._on_close)

    # ------------------------------------------------------------- 화면 구성

    def _build_widgets(self) -> None:
        root = ttk.Frame(self, padding=PAD)
        root.pack(fill="both", expand=True)
        root.columnconfigure(1, weight=1)

        ttk.Label(root, text="카테고리 주소").grid(row=0, column=0, sticky="w", pady=(0, 4))
        self.url_var = tk.StringVar(value=core.DEFAULT_URL)
        ttk.Entry(root, textvariable=self.url_var).grid(
            row=0, column=1, columnspan=2, sticky="ew", padx=(PAD, 0), pady=(0, 4)
        )

        ttk.Label(root, text="저장할 파일").grid(row=1, column=0, sticky="w", pady=4)
        self.out_var = tk.StringVar(value=str(Path.cwd() / core.DEFAULT_OUTPUT))
        ttk.Entry(root, textvariable=self.out_var).grid(row=1, column=1, sticky="ew", padx=(PAD, 0), pady=4)
        ttk.Button(root, text="찾아보기…", command=self._choose_output).grid(
            row=1, column=2, sticky="ew", padx=(4, 0), pady=4
        )

        options = ttk.LabelFrame(root, text="옵션", padding=PAD)
        options.grid(row=2, column=0, columnspan=3, sticky="ew", pady=(PAD, 0))

        ttk.Label(options, text="최대 페이지").grid(row=0, column=0, sticky="w")
        self.max_pages_var = tk.IntVar(value=100)
        ttk.Spinbox(options, from_=1, to=999, width=6, textvariable=self.max_pages_var).grid(
            row=0, column=1, sticky="w", padx=(4, PAD * 2)
        )

        ttk.Label(options, text="페이지 간 대기(초)").grid(row=0, column=2, sticky="w")
        self.wait_var = tk.DoubleVar(value=1.0)
        ttk.Spinbox(
            options, from_=0.0, to=10.0, increment=0.5, width=6, textvariable=self.wait_var
        ).grid(row=0, column=3, sticky="w", padx=(4, PAD * 2))

        self.show_browser_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(options, text="브라우저 창 보기", variable=self.show_browser_var).grid(
            row=0, column=4, sticky="w"
        )

        # 네이버가 자동화 브라우저를 걸러내므로 기본값을 "일반 브라우저에
        # 가깝게" 쪽으로 둔다.
        self.keep_profile_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(
            options, text="방문 기록 유지", variable=self.keep_profile_var
        ).grid(row=1, column=0, columnspan=2, sticky="w", pady=(6, 0))

        self.system_chrome_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(
            options, text="설치된 크롬 사용", variable=self.system_chrome_var
        ).grid(row=1, column=2, columnspan=3, sticky="w", pady=(6, 0))

        buttons = ttk.Frame(root)
        buttons.grid(row=3, column=0, columnspan=3, sticky="ew", pady=(PAD, 0))
        self.start_button = ttk.Button(buttons, text="수집 시작", command=self._start)
        self.start_button.pack(side="left")
        self.stop_button = ttk.Button(buttons, text="중지", command=self._stop, state="disabled")
        self.stop_button.pack(side="left", padx=(4, 0))
        self.open_button = ttk.Button(
            buttons, text="저장한 파일 열기", command=self._open_saved, state="disabled"
        )
        self.open_button.pack(side="left", padx=(4, 0))

        self.progress = ttk.Progressbar(root, mode="indeterminate")
        self.progress.grid(row=4, column=0, columnspan=3, sticky="ew", pady=(PAD, 0))

        log_frame = ttk.LabelFrame(root, text="진행 상황", padding=4)
        log_frame.grid(row=5, column=0, columnspan=3, sticky="nsew", pady=(PAD, 0))
        log_frame.rowconfigure(0, weight=1)
        log_frame.columnconfigure(0, weight=1)
        root.rowconfigure(5, weight=1)

        self.log_text = tk.Text(log_frame, wrap="word", height=12, state="disabled")
        self.log_text.grid(row=0, column=0, sticky="nsew")
        scrollbar = ttk.Scrollbar(log_frame, orient="vertical", command=self.log_text.yview)
        scrollbar.grid(row=0, column=1, sticky="ns")
        self.log_text.configure(yscrollcommand=scrollbar.set)

        self.status_var = tk.StringVar(value="대기 중")
        ttk.Label(root, textvariable=self.status_var, anchor="w").grid(
            row=6, column=0, columnspan=3, sticky="ew", pady=(4, 0)
        )

    # --------------------------------------------------------------- 이벤트

    def _choose_output(self) -> None:
        current = Path(self.out_var.get() or core.DEFAULT_OUTPUT)
        chosen = filedialog.asksaveasfilename(
            title="상품명을 저장할 파일",
            initialdir=str(current.parent),
            initialfile=current.name,
            defaultextension=".txt",
            filetypes=[("텍스트 파일", "*.txt"), ("모든 파일", "*.*")],
        )
        if chosen:
            self.out_var.set(chosen)

    def _start(self) -> None:
        url = self.url_var.get().strip()
        if not url.startswith("http"):
            messagebox.showwarning("주소 확인", "카테고리 주소를 http(s):// 로 시작하게 입력해 주세요.")
            return
        out_path = self.out_var.get().strip()
        if not out_path:
            messagebox.showwarning("저장 위치 확인", "저장할 파일 경로를 정해 주세요.")
            return

        options = core.CrawlOptions(
            url=url,
            max_pages=max(1, int(self.max_pages_var.get())),
            wait=max(0.0, float(self.wait_var.get())),
            headless=not self.show_browser_var.get(),
            profile_dir=str(core.default_profile_dir()) if self.keep_profile_var.get() else "",
            use_system_chrome=self.system_chrome_var.get(),
        )

        self._clear_log()
        self._log(f"수집을 시작합니다: {url}")
        self.saved_path = None
        self.stop_flag.clear()
        self.start_button.configure(state="disabled")
        self.stop_button.configure(state="normal")
        self.open_button.configure(state="disabled")
        self.progress.start(12)
        self.status_var.set("수집 중…")

        self.worker = threading.Thread(target=self._work, args=(options, out_path), daemon=True)
        self.worker.start()

    def _stop(self) -> None:
        self.stop_flag.set()
        self.stop_button.configure(state="disabled")
        self.status_var.set("중지하는 중… (현재 페이지를 마치면 멈춥니다)")

    def _open_saved(self) -> None:
        if not self.saved_path:
            return
        try:
            open_in_file_manager(self.saved_path)
        except Exception as exc:
            messagebox.showerror("열기 실패", f"파일을 열지 못했습니다.\n{exc}")

    def _on_close(self) -> None:
        self.stop_flag.set()
        self.destroy()

    # ------------------------------------------------------- 백그라운드 작업

    def _work(self, options: core.CrawlOptions, out_path: str) -> None:
        """작업 스레드. 위젯을 직접 건드리지 않고 큐로만 알린다."""
        try:
            names = core.crawl(
                options,
                log=lambda message: self.messages.put(("log", message)),
                progress=lambda page_no, total: self.messages.put(("progress", page_no, total)),
                should_stop=self.stop_flag.is_set,
            )
        except core.CrawlCancelled as cancelled:
            self._finish(cancelled.names, out_path, cancelled=True)
            return
        except core.CrawlError as error:
            self.messages.put(("error", str(error)))
            return
        except Exception as error:  # 예기치 못한 오류도 창에 보여준다
            self.messages.put(("error", f"예상치 못한 오류가 났습니다.\n\n{error}"))
            return

        self._finish(names, out_path, cancelled=False)

    def _finish(self, names: "list[str]", out_path: str, cancelled: bool) -> None:
        if not names:
            if cancelled:
                self.messages.put(("cancelled", 0, None))
            else:
                self.messages.put((
                    "error",
                    "상품명을 하나도 수집하지 못했습니다.\n\n"
                    "[브라우저 창 보기]를 켜고 다시 실행해 화면을 확인해 보세요.",
                ))
            return
        try:
            saved = core.save_names(names, out_path)
        except OSError as error:
            self.messages.put(("error", f"파일을 저장하지 못했습니다.\n\n{error}"))
            return
        kind = "cancelled" if cancelled else "done"
        self.messages.put((kind, len(names), str(saved)))

    # --------------------------------------------------------- 큐 → 화면 갱신

    def _drain_messages(self) -> None:
        try:
            while True:
                message = self.messages.get_nowait()
                kind = message[0]
                if kind == "log":
                    self._log(message[1])
                elif kind == "progress":
                    page_no, total = message[1], message[2]
                    self.status_var.set(f"{page_no}쪽까지 완료 · 누적 {total}개")
                elif kind == "done":
                    self._on_finished(message[1], message[2], cancelled=False)
                elif kind == "cancelled":
                    self._on_finished(message[1], message[2], cancelled=True)
                elif kind == "error":
                    self._reset_controls()
                    self.status_var.set("실패")
                    self._log(f"오류: {message[1]}")
                    messagebox.showerror("수집 실패", message[1])
        except queue.Empty:
            pass
        self.after(100, self._drain_messages)

    def _on_finished(self, count: int, path: str | None, cancelled: bool) -> None:
        self._reset_controls()
        if path is None:
            self.status_var.set("중지했습니다 (저장할 상품명 없음)")
            self._log("중지했습니다. 수집된 상품이 없어 파일을 만들지 않았습니다.")
            return

        self.saved_path = Path(path)
        self.open_button.configure(state="normal")
        head = "중지 전까지" if cancelled else "총"
        self.status_var.set(f"{head} {count}개 저장 완료 · {path}")
        self._log(f"{head} {count}개 상품명을 저장했습니다.\n{path}")
        messagebox.showinfo("수집 완료", f"{head} {count}개 상품명을 저장했습니다.\n\n{path}")

    def _reset_controls(self) -> None:
        self.progress.stop()
        self.start_button.configure(state="normal")
        self.stop_button.configure(state="disabled")

    def _log(self, message: str) -> None:
        self.log_text.configure(state="normal")
        self.log_text.insert("end", message + "\n")
        self.log_text.see("end")
        self.log_text.configure(state="disabled")

    def _clear_log(self) -> None:
        self.log_text.configure(state="normal")
        self.log_text.delete("1.0", "end")
        self.log_text.configure(state="disabled")


def main() -> None:
    App().mainloop()


if __name__ == "__main__":
    main()
