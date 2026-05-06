# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: responsive.spec.js >> Responsive viewport matrix >> 320×800 (mobile-xs (iPhone SE portrait)) — /
- Location: tests\responsive.spec.js:49:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8081/
Call log:
  - navigating to "http://localhost:8081/", waiting until "domcontentloaded"

```

# Test source

```ts
  1  | // @ts-check
  2  | const { test, expect } = require('@playwright/test');
  3  | 
  4  | /**
  5  |  * Playwright Responsive Viewport Matrix — CrowAgent Marketing Site
  6  |  * Added 2026-05-03 (P1+P2 fix bundle).
  7  |  *
  8  |  * Tests the 9 main marketing pages at 8 viewport widths to catch:
  9  |  *   • horizontal overflow (scrollWidth > viewport+1px)
  10 |  *   • missing top nav
  11 |  *   • missing or stub <title>
  12 |  *
  13 |  * The site is a static Cloudflare Pages app served locally on port 8080
  14 |  * (matches the convention used by tests/smoke.spec.js).
  15 |  *
  16 |  * Run: npm run test:responsive
  17 |  */
  18 | 
  19 | const BASE_URL = process.env.BASE_URL || 'http://localhost:8080';
  20 | 
  21 | // Eight viewport widths × representative heights covering common device tiers.
  22 | // Heights are intentionally varied (800-1440) to catch height-dependent overflow.
  23 | const VIEWPORTS = [
  24 |   { width: 320,  height: 800,  label: 'mobile-xs (iPhone SE portrait)' },
  25 |   { width: 390,  height: 844,  label: 'mobile-md (iPhone 14)' },
  26 |   { width: 430,  height: 932,  label: 'mobile-lg (iPhone 16 Pro Max)' },
  27 |   { width: 768,  height: 1024, label: 'tablet-portrait (iPad)' },
  28 |   { width: 1024, height: 1366, label: 'tablet-landscape / small laptop' },
  29 |   { width: 1366, height: 900,  label: 'laptop-md (HD)' },
  30 |   { width: 1920, height: 1080, label: 'desktop-fullhd' },
  31 |   { width: 2560, height: 1440, label: 'desktop-2k' },
  32 | ];
  33 | 
  34 | const PAGES = [
  35 |   '/',
  36 |   '/products/',
  37 |   '/pricing.html',
  38 |   '/crowagent-core.html',
  39 |   '/crowmark.html',
  40 |   '/crowcyber.html',
  41 |   '/crowcash.html',
  42 |   '/crowesg.html',
  43 |   '/csrd.html',
  44 | ];
  45 | 
  46 | test.describe('Responsive viewport matrix', () => {
  47 |   for (const vp of VIEWPORTS) {
  48 |     for (const pagePath of PAGES) {
  49 |       test(`${vp.width}×${vp.height} (${vp.label}) — ${pagePath}`, async ({ page }) => {
  50 |         await page.setViewportSize({ width: vp.width, height: vp.height });
> 51 |         await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'domcontentloaded' });
     |                    ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8081/
  52 | 
  53 |         // Title must be present and meaningful.
  54 |         const title = await page.title();
  55 |         expect(
  56 |           title.length,
  57 |           `Title is too short on ${pagePath} (got "${title}")`
  58 |         ).toBeGreaterThan(10);
  59 | 
  60 |         // Top <nav> is injected by /js/nav-inject.js (defer); wait for it.
  61 |         const nav = page.locator('nav').first();
  62 |         await expect(
  63 |           nav,
  64 |           `Top <nav> not visible on ${pagePath} at ${vp.label}`
  65 |         ).toBeVisible({ timeout: 10000 });
  66 | 
  67 |         // No horizontal overflow. Allow +1px slack for sub-pixel rounding.
  68 |         const scrollWidth = await page.evaluate(
  69 |           () => document.documentElement.scrollWidth
  70 |         );
  71 |         expect(
  72 |           scrollWidth,
  73 |           `Horizontal overflow on ${pagePath} at ${vp.label}: scrollWidth ${scrollWidth} > viewport ${vp.width}+1`
  74 |         ).toBeLessThanOrEqual(vp.width + 1);
  75 |       });
  76 |     }
  77 |   }
  78 | });
  79 | 
```