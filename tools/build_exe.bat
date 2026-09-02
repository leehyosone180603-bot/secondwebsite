@echo off
setlocal
cd /d "%~dp0"

rem  ASCII-only on purpose: see the note at the top of RUN.bat.

rem  "0" makes "playwright install" put Chromium inside the playwright
rem  package (.local-browsers) instead of the user profile, so PyInstaller
rem  bundles it. A frozen app looks there and nowhere else, and this also
rem  makes the finished folder runnable on a PC that has no Python.
set "PLAYWRIGHT_BROWSERS_PATH=0"

set "PY="
where py >nul 2>&1 && set "PY=py"
if not defined PY where python >nul 2>&1 && set "PY=python"

if not defined PY (
    echo.
    echo   Python was not found. Install it from
    echo   https://www.python.org/downloads/ and tick "Add Python to PATH".
    echo.
    pause
    exit /b 1
)

echo [1/3] Installing packages ...
"%PY%" -m pip install -r requirements.txt pyinstaller
if errorlevel 1 goto FAILED

echo.
echo [2/3] Downloading Chromium into the package ...
"%PY%" -m playwright install chromium
if errorlevel 1 goto FAILED

echo.
echo [3/3] Building the executable ^(this takes a few minutes^) ...
"%PY%" -m PyInstaller --noconfirm --clean --windowed ^
    --name "SmartstoreCollector" ^
    --collect-all playwright ^
    --hidden-import smartstore_core ^
    --paths . ^
    smartstore_gui.py
if errorlevel 1 goto FAILED

echo.
echo ============================================================
echo   Done:  dist\SmartstoreCollector\SmartstoreCollector.exe
echo.
echo   Copy the whole dist\SmartstoreCollector folder to move it.
echo   All files in that folder are needed to run.
echo   Chromium is bundled inside, so it also runs on a PC without Python.
echo ============================================================
pause
exit /b 0

:FAILED
echo.
echo   Build failed. See the messages above.
echo.
pause
exit /b 1
