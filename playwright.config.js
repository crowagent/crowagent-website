// @ts-check
const { defineConfig, devices } = require('@playwright/test');

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
 *           THIS IS NOT WHAT PRODUCTION DEPLOYS. That line said it was, and it
 *           stopped being true on 2026-08-05, when the Cloudflare Pages deploy
 *           source moved to astro/dist. Corrected 2026-09-01. Its server is now
 *           OFF by default, see the webServer block below.
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
  /*
   * ── 2026-08-05 (O-16): THE WHOLE SUITE COULD NOT BE RUN AT ALL ────────────
   *
   * `npx playwright test`, with no arguments, collected ZERO tests and exited
   * 1 before starting a browser:
   *     ReferenceError: window is not defined   at unit/cookie-banner.test.js
   *     ReferenceError: describe is not defined at unit/service-worker.test.js
   * Playwright's default testMatch is `**\/*.@(spec|test).?(c|m)[jt]s?(x)`, and
   * tests/unit/ holds two JEST files ending .test.js. jest.config.js knows to
   * skip Playwright's specs via `/tests/(?!unit/)`; the reverse rule was never
   * written, so the two runners each grabbed the other's files and only jest
   * was configured to let go.
   *
   * The consequence is worth being blunt about: for as long as that held, the
   * only way to run anything here was to name spec files by hand. Nobody could
   * have run this suite whole and seen it pass, which is a large part of how it
   * came to hold 96 tests pointed at an empty port, 22 at another empty port,
   * and nine that asserted nothing.
   *
   * Fixed with a global testMatch rather than a testIgnore, deliberately: each
   * project below already declares its own testIgnore, and a per-project
   * testIgnore REPLACES the global one instead of adding to it, so the global
   * exclusion silently did nothing on the three engine projects. A global
   * testMatch is inherited by every project that does not set its own, and the
   * two that do (visual-regression, cross-browser) scope themselves to
   * directories holding only .spec.js files. Naming the extension is also the
   * honest statement of the split: .spec.js is Playwright's, .test.js is jest's.
   */
  testMatch: '**/*.spec.js',
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
    // LEGACY tree, the repo root. OFF BY DEFAULT SINCE 2026-09-01.
    //
    // This entry used to start unconditionally, so every Playwright invocation
    // in this repository booted a static server over the WHOLE repository root
    // (node_modules, .git, specs, status boards and all) to serve a tree that
    // has not been deployed since 2026-08-05. Five specs still target it and
    // they are untouched:
    //   tests/contact-consent.spec.js
    //   tests/parity.spec.js                       (the legacy half of the diff)
    //   tests/cross-browser/sf46-p3g-smoke.spec.js
    //   tests/visual-regression/expanded-vrt-2026-05-22.spec.js
    //   tests/visual-regression/sf46-p3f-baselines.spec.js
    // Run any of them with CA_LEGACY_SERVER=1 and this server starts as before.
    //
    // Gated rather than deleted, deliberately. Whether the legacy tree stays is
    // an owner decision, and deleting the only way to serve it would take that
    // decision by making the five specs unrunnable.
    ...(process.env.CA_LEGACY_SERVER === '1'
      ? [
          {
            command: 'npx serve . -l 8092',
            url: 'http://127.0.0.1:8092/index.html',
            reuseExistingServer: true,
            timeout: 60000,
          },
        ]
      : []),
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

    /* ── DEVICE EMULATION, WHICH THIS FILE HAD NONE OF ────────────────────────
     *
     * Until 2026-09-01 the only viewport statement in this file was the bare
     * `1280x720` in `use` above, and not one project named a `devices[...]`
     * descriptor. So every mobile assertion in this suite was A RESIZED DESKTOP
     * WINDOW. `hasTouch`, `isMobile`, the device pixel ratio and the user agent
     * all stayed at their desktop values whatever width a test asked for, which
     * means `(pointer: coarse)`, `(any-pointer: coarse)` and `(hover: none)`
     * NEVER MATCHED. There are 30 such rules in 14 files under astro/src.
     *
     * That is flaw 1 of the audit method corrected in tests/ui-audit/harness.js
     * on 2026-08-31, living on inside the tracked suite. It cuts both ways: a
     * correct mobile rule reads as broken, and a real touch defect hides.
     *
     * WHAT IT COST, MEASURED. `.wt__dot` in WorkstationTour.astro is 44x44 under
     * `@media (pointer: coarse)` and 36x24 on a tablet without it. Its own
     * comment says so and says it was measured "with hasTouch and isMobile set,
     * which is the only way to make (pointer: coarse) match". Nothing in this
     * file could reproduce that state, so the tablet case it describes has never
     * been under test here.
     *
     * THE DESCRIPTORS ARE THE SAME ONES tests/ui-audit/harness.js USES, on
     * purpose, so there is one convention for what "mobile" and "tablet" mean on
     * this repository rather than two. iPhone 13 for mobile, iPad (gen 7) for
     * tablet. If those ever need to change, they change in both places or the
     * harness and the suite start describing different devices by the same word.
     *
     * `browserName` IS SET EXPLICITLY AND IS NOT REDUNDANT. Both descriptors
     * carry `defaultBrowserType: 'webkit'`, so spreading one without a
     * browserName silently runs the project on WebKit. Chromium is named where
     * chromium is meant, which is also what the harness does: it launches
     * chromium and hands the iPhone descriptor to newContext.
     *
     * NO MOBILE FIREFOX PROJECT, and the reason is a hard limitation rather than
     * a preference: Playwright does not support `isMobile` on Firefox, so a
     * mobile-firefox project errors at context creation rather than emulating.
     *
     * SCOPED TO accessibility.spec.js, AND THE SCOPE IS THE COST CONTROL. These
     * projects run on the ONE spec that never resizes itself, so its result at a
     * device is unambiguous. It is 13 route tests, so the three projects below
     * add 39 test runs to a bare `npx playwright test`, not a copy of the whole
     * suite.
     *
     * PROVED GREEN BEFORE WIRING, on 2026-09-01, both engines, against the built
     * tree: all 13 routes emulate correctly (vw=390, coarse=true, hover=false on
     * chromium AND on webkit) and 12 of 13 report zero serious or critical axe
     * violations under the same tag set the spec asks for. The thirteenth,
     * /glossary/ppn-002/, returns 404 and fails the spec's own status assertion.
     * That is a STALE CORPUS ENTRY and it fails identically on the three desktop
     * projects that already exist: the page was deleted and retargeted to
     * /glossary/ppn-026 on 2026-08-30, which _redirects records, and this spec's
     * PAGES list was never updated. It is not caused by these projects and it is
     * not fixed by them.
     *
     * WHAT A PROJECT CANNOT FIX, STATED SO NOBODY TRIES. responsive.spec.js,
     * sweep-6x6.spec.js, sitewide.spec.js, keyboard-and-reflow.spec.js,
     * astro-contact.spec.js and the visual-regression sweep all step a SINGLE
     * context through mobile AND desktop widths with page.setViewportSize().
     * `hasTouch` and `isMobile` are CONTEXT properties and setViewportSize does
     * not touch them, so putting one of those specs in a mobile project would
     * make its 1440 and 1920 rows report `pointer: coarse` as well, which is
     * wrong in the other direction and worse than the defect. Those specs need a
     * context per device, the way harness.js builds one, and that is a change to
     * the spec bodies rather than to this file.
     *
     * WHAT IT UNBLOCKS. nav-dropdown.spec.js reaches a coarse pointer through
     * CDP Emulation.setEmulatedMedia and therefore skips on Firefox and WebKit,
     * and its own comment names the gap and the remedy: "the defect being
     * guarded against, a menu no touch user can open, is most likely to bite on
     * iOS, which is WebKit ... Closing it properly needs Playwright to grow hover
     * emulation, or a device-descriptor-based mobile project." mobile-webkit is
     * that project. A descriptor reports hover:none and pointer:coarse on WebKit
     * with no CDP session at all, verified above. Moving that describe block on
     * to it is a spec change, so it is not made here. */
    /* A-245, 2026-09-01. nav-dropdown.spec.js joins these two. The note above
       said moving that describe block here was a spec change and so was not made
       at the time. The spec change is now made, so the projects follow it. The
       WebKit row is the one that matters: it is the engine the touch defect is
       most likely to bite on and the engine the test never ran on. */
    {
      name: 'mobile-chromium',
      testMatch: ['**/accessibility.spec.js', '**/nav-dropdown.spec.js'],
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
    },
    {
      name: 'mobile-webkit',
      testMatch: ['**/accessibility.spec.js', '**/nav-dropdown.spec.js'],
      use: { ...devices['iPhone 13'], browserName: 'webkit' },
    },
    {
      name: 'tablet-chromium',
      testMatch: '**/accessibility.spec.js',
      use: { ...devices['iPad (gen 7)'], browserName: 'chromium' },
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
