// SF46 Phase 2 P2-F probe — verify self-hosted-fonts adoption + display:swap.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

const PAGES = ['/', '/about.html', '/contact.html', '/security.html', '/pricing.html', '/faq.html'];

test.describe('SF46 P2-F — font loading strategy', () => {
  for (const url of PAGES) {
    test(`${url} links fonts-selfhosted.css`, async ({ page }) => {
      await page.goto(`${BASE}${url}`);
      const linksHTML = await page.evaluate(() =>
        Array.from(document.querySelectorAll('link')).map(l => l.outerHTML).join('\n')
      );
      expect(linksHTML).toMatch(/fonts-selfhosted\.css/i);
    });

    test(`${url} preloads at least one WOFF2 font`, async ({ page }) => {
      await page.goto(`${BASE}${url}`);
      const count = await page.evaluate(() =>
        Array.from(document.querySelectorAll('link[rel="preload"][as="font"]')).length
      );
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test(`${url} does NOT link Google Fonts directly`, async ({ page }) => {
      await page.goto(`${BASE}${url}`);
      const linksHTML = await page.evaluate(() =>
        Array.from(document.querySelectorAll('link')).map(l => l.outerHTML).join('\n')
      );
      expect(linksHTML).not.toMatch(/fonts\.googleapis\.com/i);
    });
  }

  test('every @font-face in fonts-selfhosted.css has font-display: swap', async ({ page }) => {
    await page.goto(`${BASE}/`);
    const cssText = await page.evaluate(async () => {
      const res = await fetch('/Assets/css/fonts-selfhosted.css');
      return await res.text();
    });
    const fontFaces = cssText.match(/@font-face\s*\{[^}]+\}/g) || [];
    expect(fontFaces.length).toBeGreaterThan(0);
    for (const f of fontFaces) {
      expect(f).toMatch(/font-display:\s*swap/i);
    }
  });
});
