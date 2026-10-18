#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
if [[ ! -x "${JAVA_HOME:-}/bin/javac" ]]; then
    echo "Zainstaluj Android Studio albo JDK 17+ i ustaw JAVA_HOME, a następnie uruchom ten skrypt ponownie." >&2; exit 1
fi
if [[ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]]; then
    mkdir -p "$ANDROID_HOME/cmdline-tools" "$RIVE_ROOT/.tools"
    curl -fL --retry 3 https://dl.google.com/android/repository/repository2-3.xml -o .tools/sdk-repository.xml
    RIVE_CLI_URL="$(python3 - .tools/sdk-repository.xml <<'PY'
import sys,xml.etree.ElementTree as E
r=E.parse(sys.argv[1]).getroot()
for p in r:
 if p.tag.split('}')[-1]=='remotePackage' and p.get('path')=='cmdline-tools;latest':
  for a in p.iter('archive'):
   if a.findtext('host-os')=='macosx': print('https://dl.google.com/android/repository/'+a.findtext('complete/url'))
PY
)"
    [[ "$RIVE_CLI_URL" == https://dl.google.com/* ]] || { echo "Nie znaleziono narzędzi dla macOS." >&2; exit 1; }
    curl -fL --retry 3 "$RIVE_CLI_URL" -o .tools/cmdline-tools.zip
    unzip -q .tools/cmdline-tools.zip -d .tools/cli-unpack
    mv .tools/cli-unpack/cmdline-tools "$ANDROID_HOME/cmdline-tools/latest"
    rmdir .tools/cli-unpack
fi
sdkmanager --sdk_root="$ANDROID_HOME" --licenses
RIVE_ABI=arm64-v8a
[[ "$(uname -m)" == x86_64 ]] && RIVE_ABI=x86
sdkmanager --sdk_root="$ANDROID_HOME" 'platform-tools' 'platforms;android-35' 'build-tools;35.0.0' 'emulator' "system-images;android-33;android-tv;$RIVE_ABI"
printf 'sdk.dir=%s\n' "$ANDROID_HOME" >local.properties
./scripts/create-avd.sh
./scripts/build.sh release
echo 'Gotowe. Uruchom phrocs lub Uruchom-TV.command.'
