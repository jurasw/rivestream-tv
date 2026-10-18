# Rivestream TV

- Source code lives in the public GitHub repository `jurasw/rivestream-tv`. Never commit `.artifacts`, `.tools`, built APKs, `local.properties`, credentials, or signing keys.
- Keep the existing signing key at `~/.android/rivestream-tv.keystore` (or `RIVE_KEYSTORE`). Android updates must keep the application ID and signing certificate.
- Stable versions use semantic `versionName` X.Y.Z and `versionCode` = X*10000 + Y*100 + Z in `app/build.gradle`. Gradle properties `riveVersionCode` and `riveVersionName` are only for isolated test builds.
- GitHub releases contain only `Rivestream-TV.apk`. For authorized app releases, run relevant checks, then `scripts/publish-release.sh <release-notes-file> [target-branch]`. It builds the release, verifies signing continuity, uploads a draft with the APK, downloads it for verification, publishes it as Latest, and checks the GitHub asset digest. Never publish fixture APKs or overwrite an existing release tag.
- Updater endpoint: `https://api.github.com/repos/jurasw/rivestream-tv/releases/latest` (tag version and APK asset `digest`). APKs are installed only after checking hash, package ID, version, and the installed app's signing certificate. Automatic installation must not interrupt `/watch`.
- Useful checks: `scripts/test-navigation.sh`, `scripts/test-input.sh`, `scripts/test-updates.sh`, and Android Lint. Android tests use the dedicated project emulator, not the user's physical TV.
