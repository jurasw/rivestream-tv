#!/usr/bin/env bash
# Source this file; keep tool discovery local to the project.
RIVE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -z "${JAVA_HOME:-}" || ! -x "$JAVA_HOME/bin/javac" ]]; then
    for RIVE_JDK in "$RIVE_ROOT/.tools/jdk" "/Applications/Android Studio.app/Contents/jbr/Contents/Home"; do
        if [[ -x "$RIVE_JDK/bin/javac" ]]; then export JAVA_HOME="$RIVE_JDK"; break; fi
    done
fi
export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$RIVE_ROOT/.tools/android-sdk}}"
if [[ ! -d "$ANDROID_HOME/platforms" && -d "$HOME/Library/Android/sdk/platforms" ]]; then
    export ANDROID_HOME="$HOME/Library/Android/sdk"
fi
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="${JAVA_HOME:+$JAVA_HOME/bin:}$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
export RIVE_AVD="${RIVE_AVD:-Rivestream_TV_API33}"
export RIVE_PORT="${RIVE_PORT:-5580}"
export RIVE_SERIAL="emulator-$RIVE_PORT"
mkdir -p "$RIVE_ROOT/.artifacts"
