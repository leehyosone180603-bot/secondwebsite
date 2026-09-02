@echo off
setlocal
cd /d "%~dp0"

rem ---------------------------------------------------------------
rem  This file is intentionally ASCII-only and does NOT call chcp.
rem  cmd.exe can abort a batch file without any message when the
rem  code page changes while the file still holds non-ASCII text,
rem  so all Korean messages live in launcher.py instead.
rem ---------------------------------------------------------------

set "PY="
rem  Prefer the "py" launcher: plain "python" may hit the Microsoft
rem  Store stub, which just opens the Store and does nothing.
where py >nul 2>&1 && set "PY=py"
if not defined PY where python >nul 2>&1 && set "PY=python"

if not defined PY (
    echo.
    echo   Python was not found on this PC.
    echo.
    echo   1^) Download Python: https://www.python.org/downloads/
    echo   2^) During setup, tick "Add Python to PATH" at the bottom.
    echo   3^) Run this file again.
    echo.
    pause
    exit /b 1
)

"%PY%" launcher.py
set "RC=%ERRORLEVEL%"

if not "%RC%"=="0" (
    echo.
    echo   Stopped with error code %RC%.
    echo   Delete the file .setup_done and try again to reinstall.
    echo.
    pause
)
exit /b %RC%
