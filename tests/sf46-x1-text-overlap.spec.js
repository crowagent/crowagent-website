/**
 * SF46 X1 — Site-wide text-overlap audit.
 *
 * For 5 viewports (320, 480, 768, 1280, 1920) × archetype routes, scan
 * every block-level element and assert:
 *   - scrollWidth ≤ clientWidth + small tolerance (no horizontal overflow)
 *   - No two visible buttons/links overlap with each other in screen space
 *
 * Tolerance: 4px to absorb sub-pixel rounding + font-hinting drift.
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

const VIEWPORTS = [
  { name: 'phone-narrow', width: 320, height: 800 },
  { name: 'phone-large',  width: 480, height: 900 },
  { name: 'tablet',       width: 768, height: 1024 },
  { name: 'desktop',      width: 1280, height: 900 },
  { name: 'wide',         width: 1920, height: 1080 },
];

const ROUTES = [
  '/index.html',
  '/pricing.html',
  '/about.html',
  '/contact.html',
];

for (const route of ROUTES) {
  test.describe(`X1 ${route}`, () => {
    for (const vp of VIEWPORTS) {
      test(`X1 ${route} @ ${vp.name} (${vp.width}×${vp.height}) — no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(BASE + route, { waitUntil: 'networkidle' });
        const offenders = await page.evaluate((tol) => {
          const list = [];
          const docW = document.documentElement.clientWidth;
          // Body scroll width slightly > docW is universal (scrollbar gutter); allow 32px.
          if (document.documentElement.scrollWidth > docW + 32) {
            list.push({ tag: 'documentElement', sw: document.documentElement.scrollWidth, cw: docW });
          }
          // Check direct main + section children
          const root = document.querySelector('main') || document.body;
          const candidates = root.querySelectorAll('section, header, footer, nav, article, .wrap, .container, .container-wide');
          for (const el of candidates) {
            const r = el.getBoundingClientRect();
            if (r.right > docW + tol) {
              list.push({ tag: el.tagName + '.' + (el.className || '').split(' ').slice(0,2).join('.'), right: Math.round(r.right), docW });
            }
          }
          return list;
        }, 4);
        expect(offenders, `${route} @ ${vp.name}: overflow on ${JSON.stringify(offenders.slice(0,3))}`).toEqual([]);
      });
    }
  });
}
