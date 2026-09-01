@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 스마트스토어 상품명 수집기

rem 파이썬 실행 파일 찾기 (python 또는 py 런처)
set PY=
where python >nul 2>&1 && set PY=python
if "%PY%"=="" (where py >nul 2>&1 && set PY=py)
if "%PY%"=="" (
    echo 파이썬을 찾지 못했습니다.
    echo https://www.python.org/downloads/ 에서 설치한 뒤 다시 실행해 주세요.
    echo 설치할 때 "Add Python to PATH" 를 꼭 체크하세요.
    pause
    exit /b 1
)

echo 스마트스토어 상품명 수집기를 시작합니다...
%PY% smartstore_gui.py
if errorlevel 1 (
    echo.
    echo 실행에 실패했습니다. 아래 명령으로 준비물을 설치한 뒤 다시 시도해 주세요.
    echo     %PY% -m pip install -r requirements.txt
    echo     %PY% -m playwright install chromium
    pause
)
