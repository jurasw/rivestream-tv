#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
if [[ ! -x "${JAVA_HOME:-}/bin/javac" || ! -d "$ANDROID_HOME/platforms/android-35" ]]; then
    echo "Brak JDK / Android SDK 35. Uruchom ./scripts/setup.sh lub ustaw JAVA_HOME i ANDROID_HOME." >&2; exit 1
fi
export RIVE_KEYSTORE="${RIVE_KEYSTORE:-$HOME/.android/rivestream-tv.keystore}"
if [[ ! -f "$RIVE_KEYSTORE" ]]; then
    mkdir -p "$(dirname "$RIVE_KEYSTORE")"
    keytool -genkeypair -keystore "$RIVE_KEYSTORE" -alias rivestream -keyalg RSA -keysize 2048 -validity 10000 \
        -storepass android -keypass android -dname "CN=Rivestream TV Local, O=Local Development, C=PL"
fi
RIVE_VARIANT="${1:-release}"
case "$RIVE_VARIANT" in
    debug) ./gradlew --no-daemon --console=plain :app:assembleDebug; cp app/build/outputs/apk/debug/app-debug.apk .artifacts/rivestream-tv-debug.apk ;;
    release) ./gradlew --no-daemon --console=plain :app:assembleRelease; cp app/build/outputs/apk/release/app-release.apk .artifacts/rivestream-tv.apk; cp .artifacts/rivestream-tv.apk Rivestream-TV.apk ;;
    *) echo "Użycie: $0 [release|debug]" >&2; exit 2 ;;
esac
echo "APK gotowy: $RIVE_ROOT/.artifacts/"
