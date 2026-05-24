// SF46 batch #4 — Zero-compromise global alignment probe.
// Founder directive 2026-05-20: every wrapper class on every page must
// resolve to EXACTLY the same horizontal padding. This probe visits
// index.html, about.html, privacy.html at 1440px and asserts:
//   1. .wrap padding-left === padding-right (symmetric within page)
//   2. .wrap padding-left value is IDENTICAL across all three pages
//   3. The padding value matches the canonical --ca-gutter clamp result
//      (at 1440: 5vw = 72px → clamp(20, 72, 64) = 64px)
//   4. Max-width is uniform at var(--ca-max-width) = 1400px
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

const PAGES = [
  { slug: '/',            label: 'index' },
  { slug: '/about.html',  label: 'about' },
  { slug: '/privacy.html', label: 'privacy' },
];

test.describe('SF46 B4 — Global alignment zero-drift', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // Per-page symmetry: padding-left === padding-right on the main wrapper.
  for (const p of PAGES) {
    test(`${p.label} — .wrap / .container padding-left === padding-right`, async ({ page }) => {
      await page.goto(`${BASE}${p.slug}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      // Locate the first wrapper that the canonical rule targets.
      const sel = '.wrap, .container, .container-wide, .ca-container, .priv-wrap';
      const el = page.locator(sel).first();
      const count = await el.count();
      expect(count, `${p.label} must have at least one canonical wrapper`).toBeGreaterThanOrEqual(1);
      const dims = await el.evaluate(node => {
        const cs = getComputedStyle(node);
        return {
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          maxWidth: cs.maxWidth,
        };
      });
      expect(dims.paddingLeft, `${p.label} paddingLeft`).toBe(dims.paddingRight);
    });
  }

  // Cross-page parity: padding-left identical across all three pages.
  test('cross-page — .wrap paddingLeft + maxWidth identical across index / about / privacy @1440', async ({ page }) => {
    const readings = [];
    for (const p of PAGES) {
      await page.goto(`${BASE}${p.slug}?_=` + Date.now());
      await page.waitForLoadState('domcontentloaded');
      const sel = '.wrap, .container, .container-wide, .ca-container, .priv-wrap';
      const dims = await page.locator(sel).first().evaluate(node => {
        const cs = getComputedStyle(node);
        return {
          paddingLeft: cs.paddingLeft,
          paddingRight: cs.paddingRight,
          maxWidth: cs.maxWidth,
        };
      });
      readings.push({ label: p.label, ...dims });
    }
    const [a, b, c] = readings;
    // padding-left identical across pages
    expect(a.paddingLeft, `padding-left drift (${JSON.stringify(readings)})`).toBe(b.paddingLeft);
    expect(b.paddingLeft, `padding-left drift (${JSON.stringify(readings)})`).toBe(c.paddingLeft);
    // padding-right also identical
    expect(a.paddingRight).toBe(b.paddingRight);
    expect(b.paddingRight).toBe(c.paddingRight);
    // max-width also identical (and matches --ca-max-width = 1400px)
    expect(a.maxWidth, `max-width drift (${JSON.stringify(readings)})`).toBe(b.maxWidth);
    expect(b.maxWidth, `max-width drift`).toBe(c.maxWidth);
    expect(a.maxWidth, `max-width must be 1400px from --ca-max-width`).toBe('1400px');
  });

  // Token resolution: at 1440px viewport, clamp(20, 5vw, 64px) = clamp(20, 72, 64) = 64px.
  test('canonical --ca-gutter resolves to 64px @ 1440px viewport', async ({ page }) => {
    await page.goto(`${BASE}/?_=` + Date.now());
    await page.waitForLoadState('domcontentloaded');
    const dims = await page.locator('.wrap, .container, .container-wide').first().evaluate(node => {
      const cs = getComputedStyle(node);
      const root = getComputedStyle(document.documentElement);
      return {
        paddingLeft: cs.paddingLeft,
        token: root.getPropertyValue('--ca-gutter').trim(),
        maxWidthToken: root.getPropertyValue('--ca-max-width').trim(),
      };
    });
    expect(dims.token, '--ca-gutter token defined on :root').toBe('clamp(20px, 5vw, 64px)');
    expect(dims.maxWidthToken, '--ca-max-width token defined on :root').toBe('1400px');
    expect(dims.paddingLeft, 'padding-left @1440 should be 64px (5vw clamped to 64)').toBe('64px');
  });
});
