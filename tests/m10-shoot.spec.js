// @ts-check
// Bulk capture for Agent M10 — 10 marketing pages × 2 viewports × 3 positions
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const OUT = process.env.M10_OUT || '/tmp/m10-marketing';
fs.mkdirSync(OUT, { recursive: true });

const PAGES = [
  ['pricing', '/pricing.html'],
  ['roadmap', '/roadmap.html'],
  ['faq', '/faq.html'],
  ['changelog', '/changelog.html'],
  ['resources', '/resources.html'],
  ['products-index', '/products/'],
  ['tools-index', '/tools/'],
  ['glossary-index', '/glossary/'],
  ['blog-index', '/blog/'],
  ['404', '/404.html'],
];

const VIEWS = [
  ['desktop', 1440, 900],
  ['mobile', 390, 844],
];

test.describe.configure({ mode: 'parallel' });

for (const [key, url] of PAGES) {
  for (const [vKey, w, h] of VIEWS) {
    test(`shoot ${key} ${vKey}`, async ({ page }, testInfo) => {
      test.setTimeout(60000);
      await page.setViewportSize({ width: w, height: h });
      const base = process.env.BASE_URL || 'http://localhost:8092';
      let response;
      try {
        response = await page.goto(base + url, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (e) {
        response = await page.goto(base + url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      }
      // Try to dismiss cookie banner if present (for clean shots) — but only by hiding visually
      await page.evaluate(() => {
        const cb = document.querySelector('[id*=cookie]');
        if (cb && cb instanceof HTMLElement) cb.style.display = 'none';
      });
      await page.waitForTimeout(400);
      const fold = path.join(OUT, `${key}-${vKey}-fold.png`);
      await page.screenshot({ path: fold, fullPage: false });
      const full = path.join(OUT, `${key}-${vKey}-full.png`);
      await page.screenshot({ path: full, fullPage: true });
      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      const footer = path.join(OUT, `${key}-${vKey}-footer.png`);
      await page.screenshot({ path: footer, fullPage: false });
      // Status
      const dh = await page.evaluate(() => document.documentElement.scrollHeight);
      const status = response ? response.status() : 'no-resp';
      testInfo.annotations.push({ type: 'status', description: `${key}|${vKey}|${status}|docH=${dh}` });
    });
  }
}
