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

// 2026-08-01: this list was six-eighths dead. /products/, /crowcyber.html,
// /crowcash.html, /crowesg.html and /csrd.html were removed from the site when
// the portfolio narrowed to CrowMark, and every one of them returned 404. A 404
// page has no horizontal overflow, a <title> and no nav — so `expect nav to
// exist` was the only assertion that could have caught it, and the spec skips
// that assertion when the page 404s. The suite reported 64 green while actually
// exercising two pages.
//
// Extensionless routes are used deliberately: they are what production serves
// and what the nav links to. If a route here starts 404ing, that is now a real
// failure rather than a silent pass.
const PAGES = [
  '/',
  '/pricing',
  '/crowmark',
  '/crowmark-buyers',
  '/about',
  '/contact',
  '/blog/',
  '/compare/',
  '/sectors/',
  '/glossary/',
  '/tools/',
  '/integrations',
];

test.describe('Responsive viewport matrix', () => {
  for (const vp of VIEWPORTS) {
    for (const pagePath of PAGES) {
      test(`${vp.width}×${vp.height} (${vp.label}) — ${pagePath}`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        const response = await page.goto(`${BASE_URL}${pagePath}`, {
          waitUntil: 'domcontentloaded',
        });

        // The route must actually EXIST. Without this the suite is blind: the
        // server answers a missing page with the site's own 404.html, which has
        // an injected nav, a real <title> and no horizontal overflow, so every
        // other assertion below passes on a page that is not there. Five dead
        // routes sat in this list reporting green for weeks because of it.
        expect(
          response?.status(),
          `${pagePath} did not return 200 (got ${response?.status()}). ` +
            `Either the route was removed and this list is stale, or the page is broken.`
        ).toBe(200);

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
