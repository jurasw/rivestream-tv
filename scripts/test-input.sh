#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
adb -s "$RIVE_SERIAL" get-state >/dev/null
./gradlew --no-daemon :app:assembleDebug :app:assembleDebugAndroidTest >.artifacts/input-instrumentation-build.log 2>&1
python3 scripts/with-timeout.py 90 adb -s "$RIVE_SERIAL" install --no-streaming -r app/build/outputs/apk/debug/app-debug.apk
python3 scripts/with-timeout.py 90 adb -s "$RIVE_SERIAL" install --no-streaming -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
python3 scripts/with-timeout.py 180 adb -s "$RIVE_SERIAL" shell am instrument -w app.rivestream.tv.test/app.rivestream.tv.InputRegressionTest >.artifacts/input-device-test.log 2>&1
cat .artifacts/input-device-test.log
python3 scripts/with-timeout.py 30 adb -s "$RIVE_SERIAL" shell am start -n app.rivestream.tv/.MainActivity >/dev/null
python3 - <<'PY'
from pathlib import Path
s=Path('.artifacts/input-device-test.log').read_text()
if 'FAIL' in s or s.count('PASS ') != 28:
    raise SystemExit(1)
PY
