#!/usr/bin/env python3
"""Bound external Android CLI calls that can hang on a stalled emulator."""
import subprocess
import sys

try:
    result = subprocess.run(sys.argv[2:], timeout=int(sys.argv[1]))
    sys.exit(result.returncode)
except subprocess.TimeoutExpired:
    print("Przekroczono czas operacji. Zatrzymaj i uruchom emulator ponownie w phrocs.", file=sys.stderr)
    sys.exit(124)
