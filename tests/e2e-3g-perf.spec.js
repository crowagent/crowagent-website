// @ts-check
// T1 2026-05-18 — 3G-throttled smoke for nav/footer paint budgets.
//
// Goal: prove that under simulated slow-3G conditions (400 kbps,
// 400ms latency, per Chrome devtools defaults) the nav and footer
// land within softened thresholds.
//
// ── REPAIRED 2026-08-05 (O-16). THREE THINGS WERE WRONG. ────────────────────
//
// 1. IT MEASURED THE WRONG EVENT. The clock started before `page.goto()`, and
//    goto defaults to waitUntil:'load' — so it did not time the nav arriving,
//    it timed the ENTIRE page finishing, images and all, and then read the nav
//    off an already-complete document. Measured on the legacy tree: goto
//    returned at 40,491 ms and the "nav ready" reading came 41 ms later. The
//    number the test printed was page weight wearing a nav-readiness label.
//
// 2. IT COULD NEVER PASS, AND NEVER HAD. The per-test budget is 30 s and the
//    thing it awaited took 40 s, so this test has been timing out since the
//    day it was written — for the whole of its life it reported a failure
//    whose message ("Test timeout of 30000ms exceeded") said nothing about
//    performance at all. It was never a passing gate that regressed.
//
// 3. IT POINTED AT THE FROZEN TREE. Default was localhost:8092, the legacy
//    root. That tree is what production serves today and it is under a deploy
//    freeze, so a red result there is not actionable by anyone.
//
// WHAT THE REPAIR MEASURES NOW: navigation commit to the nav being attached to
// the document, which is what "nav ready" was always supposed to mean, using
// an in-page poll rather than an evaluate() that cannot run until the parser
// lets go.
//
// MEASURED, both trees, same throttle, 2026-08-05:
//
//   ASTRO  (astro/dist)  nav 1,012 ms   footer 6,177 ms   load 26.0 s   428 KB
//   LEGACY (repo root)   nav 28,488 ms  footer 28,533 ms  load 40.4 s  1,933 KB
//
// The legacy figure is a real defect and is recorded here so the number is not
// lost: its nav is injected by a deferred js/nav-inject.js, so it cannot appear
// until the whole render-blocking chain and 1.9 MB have been fetched — 4.7x
// over the 6 s budget. It is not gated here because the tree is frozen and
// being replaced by the one that clears the budget with room to spare.
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || process.env.ASTRO_URL || 'http://127.0.0.1:8095';

/*
 * CHROMIUM ONLY, and it must say so rather than fail on the other two.
 * Network throttling here goes through Network.emulateNetworkConditions, a CDP
 * command; `context.newCDPSession()` throws "CDP session is only available in
 * Chromium" on Firefox and WebKit. The three engine projects in
 * playwright.config.js all run every spec in tests/, so before this guard the
 * file contributed one hard failure per non-Chromium engine, with a message
 * about CDP and nothing about performance. A skip with a stated reason is
 * honest; a red tick for an unavailable capability is noise, and noise is what
 * teaches people to ignore a suite.
 */
test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'network throttling needs CDP, which only Chromium exposes',
);

// The page under test is deliberately fetched over a 400 kbps link. The
// default 30 s budget is not enough headroom to reach the assertions, and a
// timeout would once again hide the measurement behind a timeout message.
test.setTimeout(180000);

test('3G-throttled: nav attaches under 6s, footer under 10s', async ({ page, context }) => {
  const client = await context.newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
    latency: 400,
  });

  const t0 = Date.now();
  // 'commit' — the clock must start when the navigation is committed, not when
  // the last image has arrived. This is the whole of fix (1) above.
  await page.goto(`${BASE}/`, { waitUntil: 'commit', timeout: 120000 });

  await page.waitForSelector('nav', { state: 'attached', timeout: 60000 });
  const navMs = Date.now() - t0;
  console.log('nav attached @ 3G:', navMs, 'ms');

  await page.waitForSelector('footer, .ca-footer', { state: 'attached', timeout: 60000 });
  const footerMs = Date.now() - t0;
  console.log('footer attached @ 3G:', footerMs, 'ms');

  expect(navMs, `nav took ${navMs}ms at 400kbps/400ms`).toBeLessThan(6000);
  expect(footerMs, `footer took ${footerMs}ms at 400kbps/400ms`).toBeLessThan(10000);
});
