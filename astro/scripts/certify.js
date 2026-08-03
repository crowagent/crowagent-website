/**
 * certify.js — the measured answer to "is it ready".
 *
 * WHY THIS EXISTS. The owner's bar for shipping is explicit: *"nothing must be
 * deployed into production until we reach top 1% ultra premium and must
 * certified."* Eight gates already fail a build on their own rules, but a gate
 * answers "did anything break", and certification answers a different question:
 * **where is the site against the bar, in numbers, right now.**
 *
 * IT IS NOT A GATE AND MUST NOT BECOME ONE. Nothing here fails the build. It
 * measures and prints, so the numbers can move in either direction between runs
 * and be seen doing it. A gate that also scores tempts whoever runs it to tune
 * the score rather than the site.
 *
 * IT NEVER SELF-CERTIFIES EITHER. It prints measurements; the owner signs off
 * from renders. `PLATFORM-CHARTER.md` says certification means every gate green,
 * stated numbers, and the owner's sign-off, in that order, and the third is not
 * something a script can supply.
 *
 * Run: node scripts/certify.js
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');

/* The routes sampled for the browser measurements. Not all 43: a full pass is
   minutes, and these eight cover every layout the site has — homepage, pricing
   table, long prose, a form, a light reading pane, an index, a product page and
   a legal page. Stated so nobody reads "8 routes" as "all of them". */
const SAMPLE = ['/', '/pricing/', '/about/', '/contact/', '/blog/ppn-002-social-value-guide/',
  '/blog/', '/crowmark/', '/privacy/'];

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };

const server = http.createServer((req, res) => {
  let file = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;

/* ── Static facts, straight off disk ─────────────────────────────────────── */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f, out); else out.push(f);
  }
  return out;
}
const files = walk(DIST);
const routes = files.filter((f) => path.basename(f) === 'index.html').length;
const jsFiles = files.filter((f) => f.endsWith('.js')).length;
const fonts = files.filter((f) => f.endsWith('.woff2')).length;
const bytes = (pred) => files.filter(pred).reduce((n, f) => n + fs.statSync(f).size, 0);
const kb = (n) => (n / 1024).toFixed(0) + ' KB';

console.log('CERTIFICATION MEASUREMENT');
console.log('='.repeat(60));
console.log(`  routes built            ${routes}`);
console.log(`  JavaScript files        ${jsFiles}   (budget 0)`);
console.log(`  self-hosted fonts       ${fonts}`);
console.log(`  HTML total              ${kb(bytes((f) => f.endsWith('.html')))}`);
console.log(`  CSS total               ${kb(bytes((f) => f.endsWith('.css')))}`);
console.log(`  images total            ${kb(bytes((f) => /\.(png|jpe?g|webp|avif|svg)$/.test(f)))}`);

/* ── Rendered measurements ───────────────────────────────────────────────── */
const axeSource = fs.readFileSync(
  path.join(__dirname, '..', '..', 'node_modules', 'axe-core', 'axe.min.js'), 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

let httpErrors = 0, consoleErrors = 0;
page.on('response', (r) => { if (r.status() >= 400) httpErrors++; });
page.on('console', (m) => { if (m.type() === 'error') consoleErrors++; });

const axeTotals = { violations: 0, serious: 0, critical: 0 };
let overflow = 0, reducedMotionRunning = 0;

for (const route of SAMPLE) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  await page.addScriptTag({ content: axeSource });
  const r = await page.evaluate(async () => {
    const res = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] });
    return {
      v: res.violations.length,
      serious: res.violations.filter((x) => x.impact === 'serious').length,
      critical: res.violations.filter((x) => x.impact === 'critical').length,
      ids: res.violations.map((x) => `${x.id}(${x.impact})`),
      of: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  axeTotals.violations += r.v;
  axeTotals.serious += r.serious;
  axeTotals.critical += r.critical;
  overflow += Math.max(0, r.of);
  if (r.v) console.log(`  axe on ${route}: ${r.ids.join(', ')}`);
}

/* Reduced motion: the charter requires the final state with nothing running. */
const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 1000 } });
const rmPage = await rm.newPage();
for (const route of SAMPLE) {
  await rmPage.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  reducedMotionRunning += await rmPage.evaluate(() => document.getAnimations().length);
}

/* Narrow viewport: overflow and target size are where "responsive" actually fails. */
const small = await browser.newContext({ viewport: { width: 390, height: 844 } });
const smallPage = await small.newPage();
let smallOverflow = 0, tinyTargets = 0;
for (const route of SAMPLE) {
  await smallPage.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  const r = await smallPage.evaluate(() => {
    let tiny = 0;
    for (const el of document.querySelectorAll('a, button, summary, [role="button"]')) {
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0 || (b.width >= 24 && b.height >= 24)) continue;
      const par = el.parentElement;
      const inText = el.closest('p, li, dd, dt, td, th, figcaption, blockquote, .prose, .article-body') ||
        (par && [...par.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3));
      if (!inText) tiny++;
    }
    return { of: document.documentElement.scrollWidth - document.documentElement.clientWidth, tiny };
  });
  smallOverflow += Math.max(0, r.of);
  tinyTargets += r.tiny;
}

/* ── CROSS-BROWSER ────────────────────────────────────────────────────────
 *
 * PLATFORM-CHARTER.md lists cross-browser behaviour as a quality gate and
 * nothing was checking it. It is not paranoia: a 648px formula overflowed a
 * 390px viewport in WebKit while Chromium's font metrics happened to contain
 * it, which is the whole reason `overflow-wrap: anywhere` is on `.prose a`.
 * One engine is not a test.
 *
 * Firefox matters for a second reason: it does not support
 * `animation-timeline: view()`, so it is the only engine that exercises the
 * arrival's fallback path rather than the arrival.
 *
 * It triples the runtime, which is why certification is a command somebody runs
 * rather than part of every build.
 *
 * HOW TO READ failedRequests. A single failure in one engine is usually a
 * request cancelled by the next navigation, not a broken asset. Observed once in
 * Firefox at 1440 and not reproduced in three further runs. Treat a count of 1
 * that does not repeat as noise; treat any count that repeats, or appears in
 * more than one engine, as real and find the URL. */
const crossBrowser = [];
for (const [name, engine] of [['chromium', chromium], ['firefox', firefox], ['webkit', webkit]]) {
  let br;
  try { br = await engine.launch(); } catch { crossBrowser.push(`${name}: not installed`); continue; }
  for (const w of [390, 1440]) {
    const cp = await br.newPage({ viewport: { width: w, height: 900 } });
    let of = 0, failed = 0, faces = 0;
    cp.on('requestfailed', () => failed++);
    for (const route of SAMPLE.slice(0, 5)) {
      await cp.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
      const o = await cp.evaluate(() => ({
        of: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        f: document.fonts ? document.fonts.size : -1,
      }));
      of += Math.max(0, o.of);
      faces = o.f;
    }
    await cp.close();
    crossBrowser.push(`${name.padEnd(9)} ${String(w).padStart(4)}px  overflow ${of}px  fontFaces ${faces}  failedRequests ${failed}`);
  }
  await br.close();
}

console.log('-'.repeat(60));
console.log('  cross-browser, 5 routes each:');
for (const line of crossBrowser) console.log(`    ${line}`);
await browser.close();
server.close();

console.log('-'.repeat(60));
console.log(`  axe violations          ${axeTotals.violations}   (serious ${axeTotals.serious}, critical ${axeTotals.critical})`);
console.log(`  horizontal overflow     ${overflow}px at 1440, ${smallOverflow}px at 390`);
console.log(`  targets under 24px      ${tinyTargets}   (non-exempt, at 390)`);
console.log(`  animations under        ${reducedMotionRunning}   (prefers-reduced-motion: reduce)`);
console.log(`  HTTP errors             ${httpErrors}`);
console.log(`  console errors          ${consoleErrors}`);
console.log('='.repeat(60));
console.log(`  measured on ${SAMPLE.length} of ${routes} routes, covering every layout the site has.`);
console.log('  This is a measurement, not a verdict. Certification also requires all');
console.log('  eight gates green and the owner signing off from renders.');
