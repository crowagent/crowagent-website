/**
 * dist-server.js — the static server the browser gates all need, in one place.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 *
 * THIRTEEN scripts under `scripts/` carried their own `http.createServer` over
 * `dist`. That is the fork pattern this repository has spent a week undoing
 * everywhere else — fourteen card recipes, eighteen button recipes —
 * reproduced in the build tooling where nobody was looking.
 *
 * A fourteenth copy was the alternative, and it was rejected. This is the seam,
 * and all thirteen have now adopted it (A-99, 2026-08-05): certify,
 * check-breadcrumbs, check-controls, check-disclosure, check-glossary-filter,
 * check-heading-ink, check-render, check-shared-blocks, check-sheen,
 * check-timeline, check-transitions, check-treatments and check-status-pulse,
 * plus check-cwv which was written against it. They are NAMED rather than
 * counted because a name survives somebody adding a gate and a number does not.
 *
 * ── WHAT THE MIGRATION FOUND, WHICH IS NOT WHAT THIS HEADER USED TO CLAIM ───
 *
 * It said the thirteen "were byte-identical apart from a stray `let` and one
 * existence check". Measured, that understated it. Four distinct handler
 * bodies. TWO DIFFERENT MIME TABLES — twelve of them carried eleven types and
 * check-breadcrumbs alone carried a twelfth, `.xml`, so two copies would have
 * served the same bytes under different Content-Type headers. And ONE GATE WITH
 * NO NO-BUILD GUARD: certify.js, which reached walk(DIST) and threw ENOENT
 * instead of saying what was wrong. It now prints a message and exits 1;
 * verified against a DS_DIST pointed at a directory that does not exist.
 *
 * ONE CLAIM THAT DID NOT SURVIVE BEING CHECKED, recorded because the correction
 * is the useful part. The A-99 analysis said check-status-pulse.mjs was the
 * higher risk of two guardless gates: in the chain, and liable to serve 404s and
 * pass on an empty dist. It is not. Its line 178 already reads `if
 * (!pages.length)` over the HTML it swept out of DIST, and htmlFiles() returns
 * an empty array for a missing directory as readily as for an empty one, so it
 * exited 1 with "no built HTML under ..." in both cases and always has. It
 * gains serveDist's guard as well now, which is belt and braces rather than the
 * fix it was described as. Reading a guard is not the same as running it.
 *
 * EIGHT ROUTE WALKERS, NOT TWO. The board named check-render.js and
 * check-treatments.js as carrying their own `routes()` next to the server;
 * check-breadcrumbs, check-disclosure, check-heading-ink, check-shared-blocks,
 * check-timeline and check-transitions carried the same function too, under two
 * spellings of the Windows separator fix. All eight now call routesOf(). Its
 * one behavioural difference is that it SORTS, where six of the eight call
 * sites took readdir order; all eight gates were run afterwards and report the
 * same results, and a stable order makes two runs diffable.
 *
 * Adopting this file resolves the rest. The table below is a strict superset
 * of both tables that existed, so no gate lost a content type. NOT changed: no charset is set
 * on text/html or text/css, because none of the thirteen set one and adding it
 * during an extraction would be a second change hiding inside the first.
 * measure-fidelity.mjs does set one, and is deliberately NOT folded in here:
 * it is a factory serving two roots at once for concept-versus-build
 * comparison, with an extensionless-index fallback none of the thirteen have.
 *
 * A FIFTEENTH SERVER APPEARED WHILE THE MIGRATION WAS RUNNING, which is the
 * whole argument for this file in one sentence. scripts/shoot-section.mjs was
 * written the same night, with its own createServer copied from the fidelity
 * harness rather than from here. It is a manual diagnostic and not a gate, so it
 * is left alone for now, but if it grows a second reader it should adopt this
 * seam before it becomes the start of the next thirteen.
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
 * @param {string} [why]  why THIS gate needs a build. Optional, and it exists
 *                        for one real case: check-controls.js said "Rules 2 to
 *                        4 measure the rendered page, so they need one", which
 *                        is more useful than the generic sentence because that
 *                        gate's rule 1 is static and would still have run.
 *                        Flattening it to the default during the A-99
 *                        extraction would have been a silent loss, so the
 *                        parameter carries it instead.
 * @returns {Promise<{ url(route: string): string, close(): void }>}
 */
export async function serveDist(dist, gate, why = 'This gate measures the rendered page, so it needs one.') {
  if (!fs.existsSync(dist)) {
    console.error(`${gate}: no build at ${dist}. ${why}`);
    process.exit(1);
  }

  const root = path.resolve(dist);

  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(dist, rel);

    /* CONTAINMENT. `path.join` normalises `..`, so `GET /../../secret` resolves
       to a real file OUTSIDE the build and every one of the thirteen copies
       would have streamed it. None of them had this check and nor did this file.
       scripts/measure-fidelity.mjs DID, at its line 185, which is the part worth
       recording: somebody knew to write it and it never propagated, because
       there was nowhere to write it once.
       The `+ path.sep` matters: a bare startsWith would also accept a sibling
       directory called `dist-something`. */
    const full = path.resolve(file);
    if (full !== root && !full.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }

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
