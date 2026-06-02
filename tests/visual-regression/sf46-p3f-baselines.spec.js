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

const BASE = process.env.BASE_URL || 'http://localhost:8092';

// 12 representative routes — one per archetype.
const ARCHETYPES = [
  ['index', '/index.html'],
  ['pricing', '/pricing.html'],
  ['crowagent-core', '/crowagent-core.html'],
  ['crowcyber', '/crowcyber.html'],
  ['crowmark', '/crowmark.html'],
  ['about', '/about.html'],
  ['contact', '/contact.html'],
  ['security', '/security.html'],
  ['blog-index', '/blog/index.html'],
  ['blog-post', '/blog/mees-band-c-2028.html'],
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
