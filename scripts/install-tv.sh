#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
if [[ $# != 1 || ! "$1" =~ ^[a-zA-Z0-9.:-]+$ ]]; then echo "Użycie: $0 ADRES_IP_TV[:5555]" >&2; exit 2; fi
RIVE_TV="$1"; [[ "$RIVE_TV" == *:* ]] || RIVE_TV="$RIVE_TV:5555"
[[ -f .artifacts/rivestream-tv.apk ]] || ./scripts/build.sh release
adb connect "$RIVE_TV"
adb -s "$RIVE_TV" install -r .artifacts/rivestream-tv.apk
adb -s "$RIVE_TV" shell am start -n app.rivestream.tv/.MainActivity
