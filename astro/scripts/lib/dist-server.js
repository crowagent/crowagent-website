/**
 * dist-server.js — the static server the browser gates all need, in one place.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 *
 * THIRTEEN scripts under `scripts/` carry their own `http.createServer` over
 * `dist`, and on 2026-08-04 they were byte-identical apart from a stray `let`
 * and one existence check. That is the fork pattern this repository has spent a
 * week undoing everywhere else — fourteen card recipes, eighteen button
 * recipes — reproduced in the build tooling where nobody was looking.
 *
 * A fourteenth copy was the alternative, and it was rejected. This is the seam,
 * and the thirteen should adopt it: certify, check-breadcrumbs, check-controls,
 * check-disclosure, check-glossary-filter, check-heading-ink, check-render,
 * check-shared-blocks, check-sheen, check-timeline, check-transitions,
 * check-treatments and check-status-pulse. They are NAMED rather than counted
 * because a name survives somebody adding a gate and a number does not. That
 * migration is deliberately not done in the same pass as the gate that prompted
 * it: thirteen gates rewritten alongside a new one is a change nobody can
 * bisect.
 *
 * ── WHY A SERVER AT ALL, AND WHY NOT ONE THAT IS ALREADY RUNNING ────────────
 *
 * `file://` breaks every absolute asset path on the site, so a browser gate
 * needs an origin. It must be one this process STARTS, over the `dist` this
 * build just wrote — never a preview server on a fixed port. `scripts/
 * measure-cwv.js` enumerated its routes from `dist/` and navigated to :8095,
 * and those were demonstrated live on 2026-08-04 to be DIFFERENT BUILDS. A gate
 * that measures a build nobody committed is worse than no gate, because its
 * green is believed.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.json': 'application/json', '.ico': 'image/x-icon', '.xml': 'application/xml',
  '.txt': 'text/plain', '.webmanifest': 'application/manifest+json',
};

/**
 * Starts a server over `dist` on an ephemeral port.
 *
 * @param {string} dist   absolute path to the build
 * @param {string} gate   the gate's name, used only in the no-build message
 * @returns {Promise<{ url(route: string): string, close(): void }>}
 */
export async function serveDist(dist, gate) {
  if (!fs.existsSync(dist)) {
    console.error(`${gate}: no build at ${dist}. This gate measures the rendered page, so it needs one.`);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(dist, rel);
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  return {
    url: (route) => `http://localhost:${port}${route}`,
    close: () => server.close(),
  };
}

/** Every route in a build, as the URL path that serves it. */
export function routesOf(dist) {
  const out = [];
  (function walk(dir, base) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(path.join(dir, entry.name), `${base}/${entry.name}`);
      else if (entry.name === 'index.html') out.push(base === '' ? '/' : `${base}/`);
    }
  })(dist, '');
  return out.sort();
}
