"""Dev server that mirrors Cloudflare Pages clean-URL handling.

When `/pricing` is requested but only `/pricing.html` exists, serve the
.html file. Also honors the `/_redirects` file (subset of CF semantics:
literal path matching with status code).

Run from the repo root:
    python scripts/dev-server.py 8081
"""
import http.server
import os
import socketserver
import sys
from pathlib import Path
from urllib.parse import urlparse


REPO_ROOT = Path(__file__).resolve().parent.parent

# Parse _redirects once at startup
REDIRECTS = []
red_file = REPO_ROOT / '_redirects'
if red_file.exists():
    for line in red_file.read_text(encoding='utf-8').splitlines():
        s = line.strip()
        if not s or s.startswith('#'):
            continue
        parts = s.split()
        if len(parts) >= 2:
            src = parts[0]
            dst = parts[1]
            code = int(parts[2]) if len(parts) >= 3 and parts[2].isdigit() else 301
            REDIRECTS.append((src, dst, code))


def cache_control_for(path: str) -> str:
    """LH-PERF 2026-05-12: mirror the Cloudflare Pages prod cache policy
    so Lighthouse cache-insight doesn't penalise dev parity. Production
    `_headers` returns 1y for fingerprinted assets and 1h for the rest;
    the dev server now does the same so local LH scores aren't depressed
    ~10-15 points by a dev-only header gap.
    """
    p = path.lower()
    if p.endswith('.html'):
        return 'no-store, must-revalidate'
    if p.endswith('.woff2') or p.endswith('.woff'):
        return 'public, max-age=31536000, immutable'
    if p.endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.ico')):
        return 'public, max-age=31536000, immutable'
    if p.endswith('.css') or p.endswith('.js'):
        return 'public, max-age=31536000, immutable'
    return 'public, max-age=3600'


class CleanUrlHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO_ROOT), **kwargs)

    def end_headers(self):
        # Add cache control before the blank-line terminator.
        try:
            self.send_header('Cache-Control', cache_control_for(self.path))
        except Exception:
            pass
        super().end_headers()

    def translate_path(self, path):
        # Normalise into a filesystem path; if the literal path doesn't
        # exist but `<path>.html` does, serve that. Same for index.html.
        parsed = urlparse(path)
        rel = parsed.path.lstrip('/')
        full = REPO_ROOT / rel if rel else REPO_ROOT / 'index.html'
        if full.is_file():
            return str(full)
        # Try with .html suffix
        if not rel.endswith('/') and not rel.endswith('.html'):
            cand = REPO_ROOT / (rel + '.html')
            if cand.is_file():
                return str(cand)
        # Try as directory index
        idx = REPO_ROOT / rel / 'index.html'
        if idx.is_file():
            return str(idx)
        return super().translate_path(path)

    def do_GET(self):
        # Honour _redirects (literal match only — wildcards left to CF)
        # 2026-05-09 fix: distinguish "rewrite" (200/2xx — serve destination
        # body but keep URL the same) from "redirect" (3xx — send Location).
        # Prior version sent 200 + Location + empty body which browsers
        # treat as a blank page (the Location header is ignored on 200).
        path = urlparse(self.path).path
        for src, dst, code in REDIRECTS:
            if src == path or src == path.rstrip('/'):
                if 200 <= code < 300:
                    # REWRITE semantic — serve dst's content with the
                    # original URL. Resolve dst as a local file.
                    rel = dst.lstrip('/')
                    full = REPO_ROOT / rel
                    if full.is_file():
                        try:
                            data = full.read_bytes()
                            ext = full.suffix.lower()
                            ctype = {
                                '.html': 'text/html; charset=utf-8',
                                '.css': 'text/css; charset=utf-8',
                                '.js': 'text/javascript; charset=utf-8',
                                '.json': 'application/json; charset=utf-8',
                                '.xml': 'application/xml; charset=utf-8',
                                '.png': 'image/png',
                                '.jpg': 'image/jpeg',
                                '.jpeg': 'image/jpeg',
                                '.webp': 'image/webp',
                                '.svg': 'image/svg+xml',
                            }.get(ext, 'application/octet-stream')
                            self.send_response(code)
                            self.send_header('Content-Type', ctype)
                            self.send_header('Content-Length', str(len(data)))
                            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
                            self.end_headers()
                            self.wfile.write(data)
                            return
                        except OSError:
                            pass
                    # Destination is external (https://...) or missing —
                    # fall through to default handling below.
                    if dst.startswith(('http://', 'https://')):
                        self.send_response(302)
                        self.send_header('Location', dst)
                        self.end_headers()
                        return
                    # break out and let translate_path handle it
                    break
                # 3xx — true redirect
                self.send_response(code)
                self.send_header('Location', dst)
                self.end_headers()
                return
        # If path resolves to a directory without trailing slash and no
        # `<path>.html` exists, redirect to add the slash (CF Pages does
        # this implicitly).
        rel = path.lstrip('/')
        if rel and not rel.endswith('/') and not rel.endswith('.html'):
            full = REPO_ROOT / rel
            html_cand = REPO_ROOT / (rel + '.html')
            if full.is_dir() and not html_cand.is_file():
                self.send_response(301)
                self.send_header('Location', path + '/')
                self.end_headers()
                return
        super().do_GET()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8081
    os.chdir(REPO_ROOT)
    # ThreadingHTTPServer so concurrent requests (e.g. Playwright loading
    # 30+ subresources in parallel) don't serialise behind one another.
    with http.server.ThreadingHTTPServer(('127.0.0.1', port), CleanUrlHandler) as httpd:
        print(f"Serving {REPO_ROOT} at http://127.0.0.1:{port}")
        httpd.serve_forever()


if __name__ == '__main__':
    main()
