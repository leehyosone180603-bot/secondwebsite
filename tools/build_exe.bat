@echo off
chcp 65001 > nul
cd /d "%~dp0"
title 스마트스토어 수집기 - 실행 파일 만들기

rem 파이썬 찾기
set PY=
where python >nul 2>&1 && set PY=python
if "%PY%"=="" (where py >nul 2>&1 && set PY=py)
if "%PY%"=="" (
    echo 파이썬을 찾지 못했습니다. https://www.python.org/downloads/ 에서 설치해 주세요.
    echo 설치할 때 "Add Python to PATH" 를 꼭 체크하세요.
    pause & exit /b 1
)

echo [1/3] 필요한 패키지를 설치합니다...
%PY% -m pip install --upgrade pip
%PY% -m pip install -r requirements.txt pyinstaller
if errorlevel 1 (echo 패키지 설치 실패 & pause & exit /b 1)

echo.
echo [2/3] 크롬(Chromium)을 내려받습니다...
%PY% -m playwright install chromium
if errorlevel 1 (echo 크롬 내려받기 실패 & pause & exit /b 1)

echo.
echo [3/3] 실행 파일을 만듭니다. 몇 분 걸립니다...
%PY% -m PyInstaller --noconfirm --clean --windowed ^
    --name "SmartstoreCollector" ^
    --collect-all playwright ^
    --hidden-import smartstore_core ^
    --paths . ^
    smartstore_gui.py
if errorlevel 1 (echo 빌드 실패 & pause & exit /b 1)

echo.
echo ============================================================
echo  완성!  dist\SmartstoreCollector\SmartstoreCollector.exe
echo.
echo  dist\SmartstoreCollector 폴더를 통째로 옮겨서 쓰시면 됩니다.
echo  (폴더 안의 파일들이 함께 있어야 실행됩니다)
echo ============================================================
pause
