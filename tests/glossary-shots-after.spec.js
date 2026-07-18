// Playwright screenshot suite for glossary pages — 2026-05-22.
// Captures fold (1440x900 viewport above fold), full page, and footer crop
// at desktop (1440x900) and mobile (390x844). Outputs to audit/glossary-shots-2026-05-22/.
const { test, expect } = require('@playwright/test');
const path = require('path');

const PAGES = [
  { slug: 'index', url: '/glossary/' },
  { slug: 'csrd', url: '/glossary/csrd.html' },
  { slug: 'ppn-002', url: '/glossary/ppn-002.html' },
  { slug: 'toms-framework', url: '/glossary/toms-framework.html' },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const OUT = path.resolve(__dirname, '..', 'audit', 'glossary-shots-2026-05-22', 'after');

for (const v of VIEWPORTS) {
  for (const p of PAGES) {
    test(`${v.name} ${p.slug}`, async ({ page }) => {
      await page.setViewportSize({ width: v.width, height: v.height });
      const url = `http://localhost:8092${p.url}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Allow nav/footer injection + motion init
      await page.waitForTimeout(1200);

      // Fold (viewport-clipped)
      await page.screenshot({
        path: path.join(OUT, `${v.name}-${p.slug}-fold.png`),
        fullPage: false,
      });

      // Full page
      await page.screenshot({
        path: path.join(OUT, `${v.name}-${p.slug}-full.png`),
        fullPage: true,
      });

      // Footer crop — scroll to bottom, then capture viewport
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(500);
      await page.screenshot({
        path: path.join(OUT, `${v.name}-${p.slug}-footer.png`),
        fullPage: false,
      });
    });
  }
}
