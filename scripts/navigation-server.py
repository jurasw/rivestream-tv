"""Serve only the navigation fixture and its assets on a free loopback port."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys

root = Path(__file__).resolve().parent.parent
allowed = {
    "/tests/playback-frame.html": ("tests/playback-frame.html", "text/html"),
    "/app/src/main/assets/tv-compat.js": ("app/src/main/assets/tv-compat.js", "text/javascript"),
    "/app/src/main/assets/tv-bootstrap.js": ("app/src/main/assets/tv-bootstrap.js", "text/javascript"),
    "/app/src/main/assets/tv-playback.js": ("app/src/main/assets/tv-playback.js", "text/javascript"),
    "/tests/playback.html": ("tests/playback.html", "text/html"),
    "/tests/navigation.html": ("tests/navigation.html", "text/html"),
    "/app/src/main/assets/tv-navigation.js": ("app/src/main/assets/tv-navigation.js", "text/javascript"),
    "/app/src/main/assets/tv-theme.css": ("app/src/main/assets/tv-theme.css", "text/css"),
}

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        asset = allowed.get(self.path)
        if not asset:
            self.send_error(404)
            return
        data = (root / asset[0]).read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", asset[1] + "; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
Path(sys.argv[1]).write_text(str(server.server_port))
server.serve_forever()
