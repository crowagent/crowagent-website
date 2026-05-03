// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Playwright Responsive Viewport Matrix — CrowAgent Marketing Site
 * Added 2026-05-03 (P1+P2 fix bundle).
 *
 * Tests the 9 main marketing pages at 8 viewport widths to catch:
 *   • horizontal overflow (scrollWidth > viewport+1px)
 *   • missing top nav
 *   • missing or stub <title>
 *
 * The site is a static Cloudflare Pages app served locally on port 8080
 * (matches the convention used by tests/smoke.spec.js).
 *
 * Run: npm run test:responsive
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';

// Eight viewport widths × representative heights covering common device tiers.
// Heights are intentionally varied (800-1440) to catch height-dependent overflow.
const VIEWPORTS = [
  { width: 320,  height: 800,  label: 'mobile-xs (iPhone SE portrait)' },
  { width: 390,  height: 844,  label: 'mobile-md (iPhone 14)' },
  { width: 430,  height: 932,  label: 'mobile-lg (iPhone 16 Pro Max)' },
  { width: 768,  height: 1024, label: 'tablet-portrait (iPad)' },
  { width: 1024, height: 1366, label: 'tablet-landscape / small laptop' },
  { width: 1366, height: 900,  label: 'laptop-md (HD)' },
  { width: 1920, height: 1080, label: 'desktop-fullhd' },
  { width: 2560, height: 1440, label: 'desktop-2k' },
];

const PAGES = [
  '/',
  '/products/',
  '/pricing.html',
  '/crowagent-core.html',
  '/crowmark.html',
  '/crowcyber.html',
  '/crowcash.html',
  '/crowesg.html',
  '/csrd.html',
];

test.describe('Responsive viewport matrix', () => {
  for (const vp of VIEWPORTS) {
    for (const pagePath of PAGES) {
      test(`${vp.width}×${vp.height} (${vp.label}) — ${pagePath}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'domcontentloaded' });

        // Title must be present and meaningful.
        const title = await page.title();
        expect(
          title.length,
          `Title is too short on ${pagePath} (got "${title}")`
        ).toBeGreaterThan(10);

        // Top <nav> is injected by /js/nav-inject.js (defer); wait for it.
        const nav = page.locator('nav').first();
        await expect(
          nav,
          `Top <nav> not visible on ${pagePath} at ${vp.label}`
        ).toBeVisible({ timeout: 10000 });

        // No horizontal overflow. Allow +1px slack for sub-pixel rounding.
        const scrollWidth = await page.evaluate(
          () => document.documentElement.scrollWidth
        );
        expect(
          scrollWidth,
          `Horizontal overflow on ${pagePath} at ${vp.label}: scrollWidth ${scrollWidth} > viewport ${vp.width}+1`
        ).toBeLessThanOrEqual(vp.width + 1);
      });
    }
  }
});
