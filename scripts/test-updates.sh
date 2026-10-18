#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
[[ "$(adb -s "$RIVE_SERIAL" emu avd name | head -1 | tr -d '\r')" == "$RIVE_AVD" ]] || { echo "Test wymaga emulatora projektu." >&2; exit 1; }
./scripts/build.sh debug > .artifacts/update-fixture-build.log 2>&1
read -r RIVE_FUTURE_CODE RIVE_FUTURE_NAME < <(python3 - <<'PY'
import subprocess,re,os
s=subprocess.check_output([os.environ['ANDROID_HOME']+'/build-tools/35.0.0/aapt','dump','badging','.artifacts/rivestream-tv-debug.apk'],text=True).splitlines()[0]
v=re.search("versionName='([^']+)'",s)[1];a,b,p=map(int,v.split('.')[:3]);print(a*10000+b*100+p+1,f'{a}.{b}.{p+1}')
PY
)
./gradlew --no-daemon :app:assembleRelease -PriveVersionCode="$RIVE_FUTURE_CODE" -PriveVersionName="$RIVE_FUTURE_NAME" >>.artifacts/update-fixture-build.log 2>&1
cp app/build/outputs/apk/release/app-release.apk .artifacts/update-valid-future.apk
if [[ ! -f .artifacts/update-test.keystore ]]; then
    keytool -genkeypair -keystore .artifacts/update-test.keystore -alias test -keyalg RSA -keysize 2048 -validity 30 -storepass android -keypass android -dname 'CN=Updater negative test' >.artifacts/update-test-key.log 2>&1
fi
"$ANDROID_HOME/build-tools/35.0.0/apksigner" sign --ks .artifacts/update-test.keystore --ks-pass pass:android --key-pass pass:android --out .artifacts/update-wrong-signer.apk .artifacts/update-valid-future.apk
./gradlew --no-daemon :app:assembleDebug :app:assembleDebugAndroidTest >>.artifacts/update-fixture-build.log 2>&1
python3 scripts/with-timeout.py 90 adb -s "$RIVE_SERIAL" install --no-streaming -r app/build/outputs/apk/debug/app-debug.apk
python3 scripts/with-timeout.py 90 adb -s "$RIVE_SERIAL" install --no-streaming -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb -s "$RIVE_SERIAL" shell appops set app.rivestream.tv REQUEST_INSTALL_PACKAGES allow
adb -s "$RIVE_SERIAL" shell mkdir -p /sdcard/Android/data/app.rivestream.tv/files
adb -s "$RIVE_SERIAL" push .artifacts/update-valid-future.apk .artifacts/update-wrong-signer.apk /sdcard/Android/data/app.rivestream.tv/files/ >/dev/null
python3 scripts/with-timeout.py 180 adb -s "$RIVE_SERIAL" shell am instrument -w -e updaterTests true app.rivestream.tv.test/app.rivestream.tv.InputRegressionTest > .artifacts/update-device-test.log 2>&1
cat .artifacts/update-device-test.log
python3 - <<'PY'
from pathlib import Path
s=Path('.artifacts/update-device-test.log').read_text()
if 'FAIL' in s or s.count('PASS ')!=23:raise SystemExit(1)
PY
