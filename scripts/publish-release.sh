#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
RIVE_RELEASE_NOTES="${1:?Podaj plik z opisem wydania.}"
RIVE_RELEASE_TARGET="${2:-main}"
[[ -f "$RIVE_RELEASE_NOTES" ]] || { echo "Brak pliku opisu wydania." >&2; exit 1; }
./scripts/build.sh release
read -r RIVE_RELEASE_TAG RIVE_RELEASE_SHA < <(python3 scripts/prepare-release.py Rivestream-TV.apk "$RIVE_RELEASE_NOTES")
if gh release view "$RIVE_RELEASE_TAG" --repo jurasw/rivestream-tv >/dev/null 2>&1; then
    echo "Wydanie $RIVE_RELEASE_TAG już istnieje. Zwiększ versionCode i versionName." >&2; exit 1
fi
RIVE_PREVIOUS_TAG=$(gh release view --repo jurasw/rivestream-tv --json tagName --jq .tagName 2>/dev/null || true)
python3 - "$RIVE_PREVIOUS_TAG" "$RIVE_RELEASE_TAG" <<'PY'
import sys
code=lambda tag:(lambda a,b,c:a*10000+b*100+c)(*map(int,tag.lstrip('v').split('.')))
if sys.argv[1] and code(sys.argv[2])<=code(sys.argv[1]):raise SystemExit('Version must increase')
PY
gh release create "$RIVE_RELEASE_TAG" --repo jurasw/rivestream-tv --target "$RIVE_RELEASE_TARGET" --draft --title "Rivestream TV ${RIVE_RELEASE_TAG#v}" --notes-file "$RIVE_RELEASE_NOTES" .artifacts/github-release/Rivestream-TV.apk
RIVE_VERIFY_DIR=$(mktemp -d "$RIVE_ROOT/.artifacts/release-verify.XXXXXX")
trap 'rm -rf "$RIVE_VERIFY_DIR"' EXIT
gh release download "$RIVE_RELEASE_TAG" --repo jurasw/rivestream-tv --pattern Rivestream-TV.apk --dir "$RIVE_VERIFY_DIR"
[[ "$(shasum -a 256 "$RIVE_VERIFY_DIR/Rivestream-TV.apk" | cut -d' ' -f1)" == "$RIVE_RELEASE_SHA" ]] || { echo "Uploaded APK differs from the verified build" >&2; exit 1; }
gh release edit "$RIVE_RELEASE_TAG" --repo jurasw/rivestream-tv --draft=false --latest
[[ "$(gh api "repos/jurasw/rivestream-tv/releases/latest" --jq '.assets[] | select(.name=="Rivestream-TV.apk") | .digest')" == "sha256:$RIVE_RELEASE_SHA" ]] || { echo "GitHub digest differs from the verified build" >&2; exit 1; }
gh release view "$RIVE_RELEASE_TAG" --repo jurasw/rivestream-tv --json url --jq .url
