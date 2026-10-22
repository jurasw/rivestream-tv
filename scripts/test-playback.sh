#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/env.sh"
cd "$RIVE_ROOT"
RIVE_CHROME="${RIVE_CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
RIVE_BROWSER_STATUS=0
RIVE_PORT_FILE=$(mktemp "$RIVE_ROOT/.tools/playback-port.XXXXXX")
python3 scripts/navigation-server.py "$RIVE_PORT_FILE" >.artifacts/playback-server.log 2>&1 &
RIVE_TEST_SERVER_PID=$!
trap 'kill "$RIVE_TEST_SERVER_PID" 2>/dev/null || true; wait "$RIVE_TEST_SERVER_PID" 2>/dev/null || true; rm -f "$RIVE_PORT_FILE"' EXIT
for RIVE_ATTEMPT in {1..50}; do [[ -s "$RIVE_PORT_FILE" ]] && break; sleep .1; done
RIVE_TEST_PORT=$(cat "$RIVE_PORT_FILE")
[[ -n "$RIVE_TEST_PORT" ]] || { echo "Test server did not start" >&2; exit 1; }
for RIVE_SUITE in playback ads; do
RIVE_BROWSER_STATUS=0
"$RIVE_CHROME" --headless --disable-gpu --no-first-run --no-default-browser-check \
    --user-data-dir="$RIVE_ROOT/.tools/test-playback-chrome" --allow-file-access-from-files \
    --virtual-time-budget=30000 --dump-dom "http://127.0.0.1:$RIVE_TEST_PORT/tests/$RIVE_SUITE.html" \
    >".artifacts/$RIVE_SUITE-test.html" 2>".artifacts/$RIVE_SUITE-test-browser.log" || RIVE_BROWSER_STATUS=$?
if (( RIVE_BROWSER_STATUS != 0 )); then
    echo "Chrome zakończył proces kodem $RIVE_BROWSER_STATUS; sprawdzam komplet wyników testu w zapisanym DOM (log: .artifacts/$RIVE_SUITE-test-browser.log)." >&2
fi
python3 - ".artifacts/$RIVE_SUITE-test.html" "$([[ $RIVE_SUITE == ads ]] && echo 23 || echo 33)" <<'PY'
from html.parser import HTMLParser
import sys
class Result(HTMLParser):
 def __init__(self): super().__init__();self.active=False;self.result=''
 def handle_starttag(self,t,a):
  if dict(a).get('id')=='result':self.active=True
 def handle_endtag(self,t):
  if t=='pre':self.active=False
 def handle_data(self,d):
  if self.active:self.result+=d
p=Result();p.feed(open(sys.argv[1]).read());print(p.result)
if 'FAIL' in p.result or p.result.count('PASS')!=int(sys.argv[2]):sys.exit(1)
PY
done
