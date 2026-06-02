/**
 * Expanded VRT — 10 routes × 2 viewports × 2 cookie-banner states = 40 PNGs.
 *
 * Authored: 2026-05-22
 * Project:  visual-regression (Chromium only, per playwright.config.js)
 * Snapshot path template: tests/visual-regression/snapshots/{arg}{ext}
 *
 * Matrix:
 *   - 10 archetype routes (homepage, pricing, 2 product pages, info, form,
 *     long-form, blog index, blog post, tools index)
 *   - 2 viewports: d1440 (1440x900) desktop reference, m390 (390x844) modern iPhone
 *   - 2 states: with-banner (first visit, banner visible), without-banner
 *     (returning visitor — localStorage consent set via addInitScript so it
 *     applies before any page script runs)
 *
 * Stability protocol (Apple/Stripe/Google-grade):
 *   1. networkidle wait
 *   2. document.fonts.ready (self-hosted Inter / Pirelli Hand variable)
 *   3. 800ms motion settle
 *   4. Freeze countdown widget to deterministic value (matches legacy baseline)
 *   5. Mask volatile widgets (countdown HUD, marquee track, chatbot bubble,
 *      any [data-vrt-volatile] opt-in element)
 *   6. animations: 'disabled', caret: 'hide' (inherited from config + repeated
 *      here for explicitness so a CI fail report is self-documenting)
 *
 * Naming: <route>--<viewport>--<state>.png   (double-dash separators so a
 * future CLI grep can split unambiguously even if a route token ever contains
 * a single hyphen).
 */

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

// Long product pages with auto-rotating carousels need extra time for the
// screenshot stability loop (two consecutive identical captures). Without
// reduced-motion emulation the carousel autoplay drives a perpetual diff;
// with emulation 90s is comfortable. We still bump per-test timeout to 120s
// for headroom on the longest pages (homepage, blog-post, crowmark, crowagent-core).
test.setTimeout(120000);

/** 10 archetype-balanced routes — all verified 200 OK on localhost:8092. */
const ROUTES = [
  ['index',          '/index.html'],            // Homepage — hero HUD + carousel + persona switcher
  ['pricing',        '/pricing.html'],          // Pricing tiers + comparison table
  ['crowagent-core', '/crowagent-core.html'],   // Product page (Phase 1, LIVE)
  ['crowmark',       '/crowmark.html'],         // Product page (Phase 1, LIVE) — carousel-heavy
  ['about',          '/about.html'],            // Long-form info page
  ['contact',        '/contact.html'],          // Form archetype
  ['faq',            '/faq.html'],              // Long-form Q&A
  ['blog-index',     '/blog/index.html'],       // Blog index / article grid
  ['blog-post',      '/blog/mees-band-c-2028.html'], // Blog post — long article
  ['tools-index',    '/tools/index.html'],      // Tools landing — tool-card grid
];

/** 2 viewports — desktop reference + modern mobile. */
const VIEWPORTS = [
  { token: 'd1440', width: 1440, height: 900 }, // Desktop reference
  { token: 'm390',  width: 390,  height: 844 }, // Modern iPhone
];

/** 2 cookie-banner states — represent first-visit + returning-visitor. */
const STATES = ['with-banner', 'without-banner'];

test.describe('Expanded VRT — 10 routes x 2 viewports x 2 states (40 snapshots)', () => {
  for (const [name, route] of ROUTES) {
    for (const vp of VIEWPORTS) {
      for (const state of STATES) {
        const snapshotName = `${name}--${vp.token}--${state}.png`;
        test(`${name} @ ${vp.token} (${state})`, async ({ page, context }) => {
          // 1. Lock viewport BEFORE navigation so the layout pipeline picks
          //    up the correct media-query branch on first paint.
          await page.setViewportSize({ width: vp.width, height: vp.height });

          // 1b. Emulate prefers-reduced-motion: reduce. The site's carousel
          //     (js/modules/carousel.js:49) explicitly disables autoplay
          //     + hides the progress bar when this is set. Without it,
          //     the auto-rotating carousel drives a perpetual screenshot
          //     diff and the stability loop times out on long product
          //     pages (caused 3/40 timeouts in the first generation pass:
          //     crowmark x2, crowagent-core x1). With it, all 40 pass.
          await page.emulateMedia({ reducedMotion: 'reduce' });

          // 2. For the without-banner state, seed localStorage BEFORE any
          //    page script runs. addInitScript fires on every navigation in
          //    this context, so a subsequent reload (if any) still reads
          //    the consent. Key shape matches /js/cookie-banner.js (canonical
          //    `ca_cookie_consent_v2` + legacy mirror `ca_cookie_consent`).
          if (state === 'without-banner') {
            await context.addInitScript(() => {
              try {
                const consent = JSON.stringify({
                  necessary: true,
                  analytics: false,
                  marketing: false,
                  ts: 1700000000000, // Deterministic timestamp (no Date.now flakiness)
                });
                localStorage.setItem('ca_cookie_consent_v2', consent);
                localStorage.setItem('ca_cookie_consent', consent);
                localStorage.setItem('ca-cookie-ok', '1'); // Legacy reader
              } catch (_) { /* localStorage unavailable — silent no-op */ }
            });
          }

          // 3. Navigate + wait for the network to quiesce.
          await page.goto(BASE + route, { waitUntil: 'networkidle' });

          // 4. Wait for self-hosted fonts to finish loading. Wrapped in
          //    Promise.resolve so undefined fonts API on older Chromium
          //    does not throw.
          await page.evaluate(() => Promise.resolve(document.fonts && document.fonts.ready));

          // 5. Settle motion + persona switcher tick + carousel auto-advance.
          await page.waitForTimeout(800);

          // 6. Freeze the live countdown HUD to a deterministic value. The
          //    widget updates every second so without freezing it the
          //    diff is non-deterministic by design. 681 matches the legacy
          //    baseline value (sf13-count-number is the active hero HUD;
          //    countdown-days is the legacy hidden anchor).
          await page.evaluate(() => {
            const targets = [
              document.querySelector('#sf13-count-number'),
              document.querySelector('#countdown-days'),
              document.querySelector('[data-band-c-countdown]'),
              document.querySelector('[data-countdown]'),
            ];
            targets.forEach((el) => { if (el) el.textContent = '681'; });
          });

          // 7. Capture the full-page screenshot with masks for known
          //    volatile widgets. We mask rather than freeze for elements
          //    whose visual state we cannot deterministically set:
          //      - .marquee-track / .ticker (continuous scroll animation)
          //      - #chatbot-bubble (third-party iframe-ish surface)
          //      - [data-vrt-volatile] (opt-in escape hatch for future
          //        widgets without a code change here)
          await expect(page).toHaveScreenshot(snapshotName, {
            fullPage: true,
            maxDiffPixelRatio: 0.02,
            animations: 'disabled',
            caret: 'hide',
            mask: [
              page.locator('.marquee-track'),
              page.locator('.ticker'),
              page.locator('#chatbot-bubble'),
              page.locator('[data-vrt-volatile]'),
              // Carousel progress bar — even with reduced-motion the timer
              // element is sometimes present (CSS-only fallback paths).
              page.locator('.crow-carousel-progress'),
              page.locator('.crow-carousel-progress-fill'),
              page.locator('[role="progressbar"][aria-label*="Slide" i]'),
            ],
          });
        });
      }
    }
  }
});
