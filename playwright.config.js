// @ts-check
const { defineConfig } = require('@playwright/test');

/**
 * Playwright configuration — CrowAgent marketing site.
 *
 * Projects:
 *   chromium                 — default smoke / responsive runs
 *   firefox                  — default smoke / responsive runs (requires
 *                              `npx playwright install firefox`)
 *   visual-regression        — full-page snapshot baselines for the 12
 *                              representative routes (Chromium only — masks
 *                              cope with cross-platform font drift)
 *   cross-browser-chromium   — smoke matrix per engine (U-10 layer 6)
 *   cross-browser-firefox    — same, Gecko engine
 *   cross-browser-webkit     — same, WebKit engine
 *
 * Browsers that are not yet installed will be skipped at project bootstrap
 * with a clear stderr line; chromium is the minimum guaranteed.
 */
/*
 * ── WHICH SITE IS UNDER TEST (O-16, 2026-08-05) ────────────────────────────
 *
 * This repository contains TWO sites, and until this pass the suite quietly
 * spread itself across THREE different default targets, none of which it
 * started:
 *
 *   - `use.baseURL` and BASE_URL defaulted to https://crowagent.ai — live
 *     PRODUCTION. The site is under a deploy freeze, so production is a build
 *     nobody is changing. A suite pointed there reports green on a snapshot of
 *     the past while every defect of the evening sits untested in the working
 *     tree. That is the "test that cannot fail" hazard wearing a green tick.
 *   - responsive.spec.js defaulted to localhost:8080, where nothing has ever
 *     listened. All 96 of its tests died on ERR_CONNECTION_REFUSED.
 *   - parity.spec.js defaulted its Astro side to localhost:8093, also empty.
 *     All 22 of its tests failed as "route missing on ASTRO".
 *
 * The two trees, and the ONE port each now has:
 *
 *   LEGACY  http://127.0.0.1:8092  — the repo root. Extension-ful routes
 *           (/contact.html), nav + footer + cookie banner injected by JS.
 *           This is what production deploys today.
 *   ASTRO   http://127.0.0.1:8095  — astro/dist. Directory routes (/contact/),
 *           server-rendered nav and footer, no cookie banner because it loads
 *           no third-party script and sets no cookie. This is the rebuild, and
 *           it is where the work is.
 *
 * Every spec now declares which tree it targets, in a comment, at the top.
 * Nothing defaults to production any more; pass BASE_URL to opt into it for
 * monitoring.
 *
 * The `webServer` block below removes "no server" as a failure class for good.
 * `reuseExistingServer` is true so a preview server a human is already using —
 * the site CLAUDE.md forbids killing the 8092 one — is left strictly alone.
 */
const LEGACY_URL = process.env.LEGACY_URL || 'http://127.0.0.1:8092';
const ASTRO_URL = process.env.ASTRO_URL || 'http://127.0.0.1:8095';

module.exports = defineConfig({
  testDir: './tests',
  // Default per-test timeout. Visual-regression tests bump this internally.
  timeout: 30000,
  retries: 1,
  use: {
    // Only visual-audit.spec.js relies on the shared baseURL (it navigates
    // with relative paths); it targets the legacy tree. Everything else names
    // its own base explicitly, which is why the default is no longer a remote
    // host that no local change can ever affect.
    baseURL: process.env.BASE_URL || LEGACY_URL,
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  webServer: [
    {
      // LEGACY tree — repo root.
      command: 'npx serve . -l 8092',
      url: 'http://127.0.0.1:8092/index.html',
      reuseExistingServer: true,
      timeout: 60000,
    },
    {
      // ASTRO tree — the built rebuild. Deliberately serves astro/dist and
      // does NOT build it: a build here would race the agents working in
      // astro/src, and a half-written dist produces failures that look like
      // content defects. If dist is older than astro/src, that is a stale
      // artefact and the run should say so rather than silently rebuild.
      command: 'npx serve astro/dist -l 8095',
      url: 'http://127.0.0.1:8095/',
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
  // Visual-regression snapshots live next to their spec, in /snapshots.
  // Without this, Playwright emits to <spec>.spec.js-snapshots/ which
  // splits state across two folders.
  snapshotPathTemplate: '{testDir}/visual-regression/snapshots/{arg}{ext}',
  expect: {
    // 2026-08-05 (O-16). This was 30000 — IDENTICAL to the per-test timeout
    // above, which meant no web-first assertion could ever report its own
    // failure: the expect poll and the test deadline expired at the same
    // instant, so Playwright killed the test first and every content failure
    // surfaced as a bare "Test timeout of 30000ms exceeded" with no expected/
    // received pair and no snippet. Three real failures in this suite were
    // undiagnosable for exactly that reason (a changed <title>, an unenforced
    // consent gate, a slow 3G nav). The expect budget must sit comfortably
    // BELOW the test budget so the assertion loses the race and prints why.
    timeout: 10000,
    toHaveScreenshot: {
      // Tolerate sub-pixel anti-aliasing drift (Chromium font hinting).
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
      caret: 'hide',
      // The default 5s stability poll is too short for the homepage;
      // 25s leaves headroom on slow CI hosts.
      timeout: 25000,
    },
  },
  projects: [
    // Existing default smoke + responsive runs.
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
      testIgnore: ['**/visual-regression/**', '**/cross-browser/**'],
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
      testIgnore: ['**/visual-regression/**', '**/cross-browser/**'],
    },

    // WebKit was previously reachable only through the cross-browser project,
    // whose testMatch is scoped to the cross-browser directory — so the sitewide
    // sweep, the a11y run and every behavioural gate had never executed on it.
    // That is the engine behind Safari on macOS and every browser on iOS, and
    // the one most likely to differ on what this rebuild leans on:
    // :focus-visible, details/summary, CSS cascade layers, aria-activedescendant.
    //
    // Same testIgnore as the other two, so it runs the same suites rather than a
    // reduced subset. (Line comments, not a block comment: the glob patterns
    // below contain */ and would close one early — which is exactly what
    // happened on the first attempt.)
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
      testIgnore: ['**/visual-regression/**', '**/cross-browser/**'],
    },

    // U-10 Layer 3 — visual regression (Chromium only).
    {
      name: 'visual-regression',
      testMatch: '**/visual-regression/**/*.js',
      use: { browserName: 'chromium' },
      // Long marketing pages with 3 viewports each → 90s headroom.
      timeout: 90000,
      retries: 0,
    },

    // U-10 Layer 6 — cross-browser smoke (one project per engine).
    {
      name: 'cross-browser-chromium',
      testMatch: '**/cross-browser/**/*.js',
      use: { browserName: 'chromium' },
      timeout: 60000,
    },
    {
      name: 'cross-browser-firefox',
      testMatch: '**/cross-browser/**/*.js',
      use: { browserName: 'firefox' },
      timeout: 60000,
    },
    {
      name: 'cross-browser-webkit',
      testMatch: '**/cross-browser/**/*.js',
      use: { browserName: 'webkit' },
      timeout: 60000,
    },
  ],
  reporter: [['html', { open: 'never' }], ['list']],
});
