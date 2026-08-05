/**
 * SF46 P3-F — Visual-regression baseline snapshots.
 *
 * Runs only in `visual-regression` Playwright project. Captures full-page
 * screenshots of every archetype route as the locked baseline. Future
 * diffs against these baselines flag any layout regression.
 *
 * Snapshots live at tests/visual-regression/snapshots/ per playwright.config.
 */
const { test, expect } = require('@playwright/test');

// TARGET: THE LEGACY TREE (repo root on :8092) — every route below is
// extension-ful. 2026-08-05 (O-16): moved off BASE_URL, which smoke.spec.js
// and accessibility.spec.js now use for the Astro build, so one exported
// variable can no longer send this project at a tree whose URLs do not exist.
//
// NOTE, same date: tests/visual-regression/snapshots/ is EMPTY. This project
// has no baselines at all, so a run writes them rather than compares. They
// were deliberately not generated during the O-16 pass: A-104 is still moving
// the homepage sections, and a baseline captured mid-redesign locks in a
// layout nobody has approved. Generate at design freeze with
// `npm run test:visual:update`, and only then.
const BASE = process.env.LEGACY_URL || 'http://127.0.0.1:8092';

// 11 representative routes — one per archetype.
const ARCHETYPES = [
  ['index', '/index.html'],
  ['pricing', '/pricing.html'],
  // 2026-08-01: crowcyber was removed with the retired portfolio and 404'd, so
  // its baseline was a snapshot of the 404 page. Swapped for the buyer-facing
  // CrowMark page, which is a real archetype and was not covered.
  ['crowmark-buyers', '/crowmark-buyers.html'],
  ['crowmark', '/crowmark.html'],
  ['about', '/about.html'],
  ['contact', '/contact.html'],
  ['security', '/security.html'],
  ['blog-index', '/blog/index.html'],
  ['tools-index', '/tools/index.html'],
  ['faq', '/faq.html'],
];

test.describe('P3-F — Visual regression baselines', () => {
  for (const [name, route] of ARCHETYPES) {
    test(`P3-F ${name} matches baseline`, async ({ page }) => {
      await page.goto(BASE + route, { waitUntil: 'networkidle' });
      // Settle motion + countdown widgets
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.03, // generous for font hinting / countdown
        animations: 'disabled',
        caret: 'hide',
      });
    });
  }
});
