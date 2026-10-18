#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
RIVE_APK_VARIANT="${RIVE_APK_VARIANT:-debug}"
case "$RIVE_APK_VARIANT" in
    debug) RIVE_APK_PATH=.artifacts/rivestream-tv-debug.apk ;;
    release) RIVE_APK_PATH=.artifacts/rivestream-tv.apk ;;
    *) echo "RIVE_APK_VARIANT musi być debug lub release" >&2; exit 1 ;;
esac
./scripts/create-avd.sh
RIVE_EMULATOR_PID=""
cleanup() {
    if [[ -n "$RIVE_EMULATOR_PID" ]]; then
        python3 scripts/with-timeout.py 5 adb -s "$RIVE_SERIAL" emu kill >/dev/null 2>&1 || true
        kill "$RIVE_EMULATOR_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT
trap 'exit 130' INT TERM
if adb -s "$RIVE_SERIAL" get-state >/dev/null 2>&1; then
    RIVE_RUNNING_AVD="$(adb -s "$RIVE_SERIAL" emu avd name | head -1 | tr -d '\r')"
    if [[ "$RIVE_RUNNING_AVD" != "$RIVE_AVD" ]]; then echo "Port $RIVE_PORT jest zajęty przez $RIVE_RUNNING_AVD. Ustaw RIVE_PORT na inny parzysty port." >&2; exit 1; fi
else
    RIVE_EMULATOR_ARGS=(-avd "$RIVE_AVD" -port "$RIVE_PORT" -no-snapshot -no-boot-anim -gpu "${RIVE_GPU:-swiftshader}" -feature -Vulkan)
    if [[ "${RIVE_HEADLESS:-0}" == 1 ]]; then RIVE_EMULATOR_ARGS+=(-no-window -no-audio); fi
    emulator "${RIVE_EMULATOR_ARGS[@]}" >.artifacts/emulator.log 2>&1 &
    RIVE_EMULATOR_PID=$!
fi
./scripts/build.sh "$RIVE_APK_VARIANT"
echo "Czekam na uruchomienie Android TV…"
RIVE_STARTED=$SECONDS
until [[ "$(adb -s "$RIVE_SERIAL" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" == 1 ]]; do
    if (( SECONDS - RIVE_STARTED > 240 )); then echo "Emulator nie uruchomił się. Zobacz .artifacts/emulator.log" >&2; exit 1; fi
    if [[ -n "$RIVE_EMULATOR_PID" ]] && ! kill -0 "$RIVE_EMULATOR_PID" 2>/dev/null; then tail -40 .artifacts/emulator.log; exit 1; fi
    sleep 2
done
python3 scripts/with-timeout.py 90 adb -s "$RIVE_SERIAL" install --no-streaming -r "$RIVE_APK_PATH"
python3 scripts/with-timeout.py 45 adb -s "$RIVE_SERIAL" shell am start -W -n app.rivestream.tv/.MainActivity
echo "RIVESTREAM TV READY — strzałki / Enter / Esc, F1 otwiera menu."
if [[ -n "$RIVE_EMULATOR_PID" ]]; then wait "$RIVE_EMULATOR_PID"; else adb -s "$RIVE_SERIAL" logcat -v brief 'chromium:E' 'AndroidRuntime:E' '*:S'; fi
