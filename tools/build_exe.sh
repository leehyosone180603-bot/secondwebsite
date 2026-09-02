#!/bin/sh
# 리눅스·맥에서 실행 파일 만들기 (윈도우는 build_exe.bat 사용)
#
# 최근 리눅스 배포판은 시스템 파이썬에 pip 설치를 막아두므로(PEP 668)
# 빌드 전용 가상환경(.buildenv)을 만들어 그 안에서 작업한다.
set -e
cd "$(dirname "$0")"

PY="${PYTHON:-python3}"
VENV=.buildenv

echo "[1/4] 빌드용 가상환경을 준비합니다..."
[ -d "$VENV" ] || "$PY" -m venv "$VENV"
VPY="$VENV/bin/python"

echo "[2/4] 필요한 패키지를 설치합니다..."
"$VPY" -m pip install --quiet --upgrade pip
"$VPY" -m pip install --quiet -r requirements.txt pyinstaller

echo "[3/4] 크롬(Chromium)을 내려받습니다..."
"$VPY" -m playwright install chromium

echo "[4/4] 실행 파일을 만듭니다. 몇 분 걸립니다..."
"$VPY" -m PyInstaller --noconfirm --clean --windowed \
    --name "SmartstoreCollector" \
    --collect-all playwright \
    --hidden-import smartstore_core \
    --paths . \
    smartstore_gui.py

echo
echo "완성: dist/SmartstoreCollector/SmartstoreCollector"
echo "dist/SmartstoreCollector 폴더를 통째로 옮겨서 쓰세요."
