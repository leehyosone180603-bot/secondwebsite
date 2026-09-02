@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 스마트스토어 상품명 수집기

rem ---- 파이썬 찾기 ----
set PY=
where python >nul 2>&1 && set PY=python
if "%PY%"=="" (where py >nul 2>&1 && set PY=py)
if "%PY%"=="" (
    echo.
    echo  파이썬이 설치되어 있지 않습니다.
    echo.
    echo  https://www.python.org/downloads/ 에서 내려받아 설치해 주세요.
    echo  설치 화면 맨 아래 "Add Python to PATH" 를 꼭 체크하셔야 합니다.
    echo.
    pause & exit /b 1
)

rem ---- 첫 실행이면 준비물 설치 ----
if not exist ".setup_done" (
    echo.
    echo  처음 실행이라 준비물을 설치합니다. 몇 분 걸립니다...
    echo.
    echo  [1/2] 파이썬 패키지 설치
    %PY% -m pip install -r requirements.txt
    if errorlevel 1 (echo 패키지 설치에 실패했습니다. & pause & exit /b 1)

    echo  [2/2] 크롬(Chromium) 내려받기
    %PY% -m playwright install chromium
    if errorlevel 1 (echo 크롬 내려받기에 실패했습니다. & pause & exit /b 1)

    echo 준비 완료 > .setup_done
    echo.
    echo  준비가 끝났습니다. 다음부터는 바로 실행됩니다.
    echo.
)

%PY% smartstore_gui.py
if errorlevel 1 (
    echo.
    echo  실행에 실패했습니다. .setup_done 파일을 지우고 다시 실행하면
    echo  준비물을 처음부터 다시 설치합니다.
    pause
)
