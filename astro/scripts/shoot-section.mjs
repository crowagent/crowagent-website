/**
 * shoot-section.mjs — render one section of a built page and save a PNG.
 *
 * WHY THIS EXISTS. Some defects are not numbers. The owner's report on the
 * homepage's second section was that the UK public procurement card "looks
 * empty", and no width, padding or radius measurement says whether a card looks
 * empty: that is a judgement about how much of a box its content occupies and
 * how the eye lands on it. measure-fidelity.mjs answers "is this the right
 * size"; this answers "what does it actually look like", which is the question
 * an owner asks and the one an agent working only from numbers cannot check.
 *
 * It carries the SAME three traps as the fidelity harness, because they are
 * properties of this page rather than of that script:
 *   - reducedMotion:'reduce' and a getAnimations() drain, so nothing is caught
 *     mid arrival-animation;
 *   - Playwright rather than a browser MCP, because a hidden tab freezes
 *     transitions and paints falsely;
 *   - its own server on an ephemeral port, so it cannot read whichever stale
 *     root one of the long-lived servers happens to be pointed at. That is not
 *     hypothetical: :8095 spent a day serving a 22-hour-old copy of the site.
 *
 * USAGE
 *   node scripts/shoot-section.mjs --sel "#proof" --out shot.png
 *   node scripts/shoot-section.mjs --sel "#proof" --vp 1440 --out a.png
 *   node scripts/shoot-section.mjs --full --out page.png
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(HERE, '..', 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

function serve(root) {
  return new Promise((ok) => {
    const srv = createServer(async (req, res) => {
      try {
        const url = decodeURIComponent(req.url.split('?')[0]);
        let p = join(root, url);
        try { if ((await stat(p)).isDirectory()) p = join(p, 'index.html'); }
        catch { if (!extname(p)) p = join(root, url, 'index.html'); }
        if (!resolve(p).startsWith(resolve(root))) { res.writeHead(403).end(); return; }
        const buf = await readFile(p);
        res.writeHead(200, { 'content-type': MIME[extname(p).toLowerCase()] ?? 'application/octet-stream' });
        res.end(buf);
      } catch { res.writeHead(404).end('not found'); }
    });
    srv.listen(0, '127.0.0.1', () => ok({ srv, port: srv.address().port }));
  });
}

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i === -1 ? d : argv[i + 1]; };
const sel = arg('--sel', null);
const out = arg('--out', 'shot.png');
const vw = Number(arg('--vp', 1440));
const route = arg('--route', '/');
const full = argv.includes('--full');

const { srv, port } = await serve(DIST);
const browser = await chromium.launch();
const ctx = await browser.newContext({
  reducedMotion: 'reduce',
  deviceScaleFactor: 1,
  viewport: { width: vw, height: 900 },
});
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${port}${route}`, { waitUntil: 'load' });

/* Scroll the whole page so every lazy image and scroll-triggered section has
   been through its trigger, then settle. A section shot before its trigger is a
   shot of its start state, which is the arrival-animation trap. */
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 40));
  }
  window.scrollTo(0, 0);
});
await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
await page.evaluate(async () => {
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (let i = 0; i < 40 && document.getAnimations().some((a) => a.playState === 'running'); i++) {
    await new Promise((r) => setTimeout(r, 50));
  }
  for (const a of document.getAnimations()) { try { a.finish(); } catch { /* infinite loops cannot finish and do not affect layout */ } }
});

if (full || !sel) {
  await page.screenshot({ path: out, fullPage: true });
  console.log(`full page @${vw} -> ${out}`);
} else {
  const el = page.locator(sel).first();
  if (!(await el.count())) { console.error(`no element matches ${sel}`); process.exit(2); }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  const box = await el.boundingBox();
  await el.screenshot({ path: out });
  console.log(`${sel} @${vw} -> ${out}  (${box ? Math.round(box.width) + 'x' + Math.round(box.height) : 'no box'})`);
}

await browser.close();
srv.close();
