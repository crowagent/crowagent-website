/**
 * measure-cwv.js — Core Web Vitals for every route in the Astro build.
 *
 * WHY THIS EXISTS. "The Astro replacement measures CLS 0 on every route" is
 * written into OWNER-ACTIONS.md and into a commit message, and it was never
 * true as stated — it was measured on four routes and generalised. This
 * measures all of them, under the same Lighthouse mobile conditions used for
 * every other performance figure in this repo, so the claim is either
 * demonstrated or corrected.
 *
 * CLS only. LCP is measured and printed, but it is NOT a pass criterion here:
 * variance on this machine ran 2068-15056ms for the same page across runs,
 * which makes it useless as a gate. CLS on the same pages was byte-identical
 * across three consecutive runs, so it is deterministic enough to act on.
 *
 * A fresh browser context per route, because sharing one page caches the
 * shared CSS, JS and fonts after the first route and produced a measurement
 * 27 points better than reality the first time this was attempted.
 *
 * ── A MANUAL TOOL. IT IS NOT IN `npm run build` AND SHOULD NOT BE ───────────
 *
 * Stated because it exits non-zero when CLS drifts outside 0.1, which makes it
 * LOOK like a build gate, and nothing in this header said otherwise until
 * 2026-08-04. It is not one, for two reasons that are both about it being
 * measurement rather than enforcement:
 *
 *   IT NEEDS A SERVER IT DOES NOT START. Routes are enumerated from dist/ but
 *   navigation goes to ASTRO_ORIGIN, which defaults to the preview server on
 *   :8095. Wired into the chain it would fail on any machine where that server
 *   was not already running, which is a gate failing for a reason that has
 *   nothing to do with the commit — the fastest way to get a gate deleted.
 *
 *   IT IS SLOW AND IT IS THROTTLED ON PURPOSE. Every route gets its own browser
 *   context, Lighthouse mobile network conditions and 4x CPU throttling, plus a
 *   four-second settle. Across 43 routes that is minutes, all of it spent
 *   deliberately making the machine slower.
 *
 * Run it when a layout changes: `node scripts/measure-cwv.js`, with a preview
 * server on :8095 or ASTRO_ORIGIN pointed somewhere else. The exit code is for
 * whoever ran it, not for a chain.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const ORIGIN = process.env.ASTRO_ORIGIN || 'http://localhost:8095';

/** Lighthouse mobile: 1.6 Mbit/s down, 750 kbit/s up, 150ms RTT, 4x CPU. */
const NETWORK = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
};

const GOOD_CLS = 0.1;

function routes(dir, base = '', out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) routes(path.join(dir, entry.name), `${base}/${entry.name}`, out);
    else if (entry.name === 'index.html') out.push(base === '' ? '/' : `${base}/`);
  }
  return out;
}

const list = routes(DIST).sort();
const browser = await chromium.launch();
const results = [];

for (const route of list) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NETWORK);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.addInitScript(() => {
    window.__cls = 0;
    window.__lcp = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  try {
    await page.goto(ORIGIN + route, { waitUntil: 'load', timeout: 120000 });
    await page.waitForTimeout(4000);
    const v = await page.evaluate(() => ({
      cls: Number((window.__cls || 0).toFixed(4)),
      lcp: Math.round(window.__lcp || 0),
    }));
    results.push({ route, ...v });
  } catch (err) {
    results.push({ route, cls: null, lcp: null, error: String(err).slice(0, 80) });
  }
  await context.close();
}

await browser.close();

const failed = results.filter((r) => r.cls === null);
const outside = results.filter((r) => r.cls !== null && r.cls > GOOD_CLS);
const zero = results.filter((r) => r.cls === 0);

console.log(`\nCLS, Lighthouse mobile throttling, ${results.length} routes\n`);
for (const r of results.sort((a, b) => (b.cls ?? -1) - (a.cls ?? -1))) {
  if (r.cls === null) {
    console.log(`  ${r.route.padEnd(44)}  ERROR  ${r.error}`);
    continue;
  }
  const flag = r.cls > GOOD_CLS ? '  <-- OUTSIDE 0.1' : '';
  console.log(
    `  ${r.route.padEnd(44)}  CLS ${String(r.cls).padEnd(7)} LCP ${String(r.lcp).padStart(5)}ms${flag}`
  );
}

console.log(
  `\n  ${zero.length}/${results.length} routes at exactly 0 · ` +
    `${results.length - outside.length - failed.length}/${results.length} within 0.1 · ` +
    `${outside.length} outside · ${failed.length} errored`
);

process.exit(outside.length || failed.length ? 1 : 0);
