#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
RIVE_IMAGE="${RIVE_IMAGE:-system-images;android-33;android-tv;arm64-v8a}"
if [[ "$(uname -m)" == x86_64 ]]; then RIVE_IMAGE="${RIVE_IMAGE/arm64-v8a/x86}"; fi
if ! emulator -list-avds | tr -d '\r' | grep -Fxq "$RIVE_AVD"; then
    if [[ ! -d "$ANDROID_HOME/${RIVE_IMAGE//;/\/}" ]]; then
        echo "Instalowanie obrazu Android TV…"
        sdkmanager --sdk_root="$ANDROID_HOME" "$RIVE_IMAGE"
    fi
    echo no | avdmanager create avd --name "$RIVE_AVD" --package "$RIVE_IMAGE" --device tv_1080p
    RIVE_AVD_DIR="${ANDROID_AVD_HOME:-$HOME/.android/avd}/$RIVE_AVD.avd"
    python3 - "$RIVE_AVD_DIR/config.ini" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]); lines=p.read_text().splitlines()
values={'hw.ramSize':'2048','hw.keyboard':'yes','hw.dPad':'yes','hw.gpu.enabled':'yes','hw.gpu.mode':'auto','showDeviceFrame':'no','disk.dataPartition.size':'3G'}
lines=[line for line in lines if line.partition('=')[0].strip() not in values]
p.write_text('\n'.join(lines+[k+'='+v for k,v in values.items()])+'\n')
PY
fi
