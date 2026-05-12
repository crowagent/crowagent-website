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
module.exports = defineConfig({
  testDir: './tests',
  // Default per-test timeout. Visual-regression tests bump this internally.
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'https://crowagent.ai',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  // Visual-regression snapshots live next to their spec, in /snapshots.
  // Without this, Playwright emits to <spec>.spec.js-snapshots/ which
  // splits state across two folders.
  snapshotPathTemplate: '{testDir}/visual-regression/snapshots/{arg}{ext}',
  expect: {
    // Bump expect's overall timeout so the screenshot stability loop has
    // room to settle on long marketing pages (multiple carousels, persona
    // switcher, countdown widget).
    timeout: 30000,
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
