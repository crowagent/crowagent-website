// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8092';
const OUT_DIR = path.resolve(__dirname, '..', 'audit', 'widgets-2026-05-22');

const widgets = [
  { page: 'crowmark.html',       mockup: 'bid-score',   name: 'crowmark-bid-score' },
  { page: 'crowcash.html',       mockup: 'cash',        name: 'crowcash-recovered' },
  { page: 'crowcyber.html',      mockup: 'cyber',       name: 'crowcyber-readiness' },
  { page: 'crowagent-core.html', mockup: 'mees',        name: 'crowagent-core-mees' },
  { page: 'crowesg.html',        mockup: 'materiality', name: 'crowesg-materiality' },
  { page: 'csrd.html',           mockup: 'csrd',        name: 'csrd-applicability' },
];

const viewports = [
  { label: '1440', width: 1440, height: 900 },
  { label: '390',  width: 390,  height: 844 },
];

for (const w of widgets) {
  for (const v of viewports) {
    test(`widget ${w.name} @ ${v.label}`, async ({ page }) => {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto(`${BASE_URL}/${w.page}`, { waitUntil: 'networkidle' });
      const widget = page.locator(`[data-mockup="${w.mockup}"]`);
      await expect(widget).toBeVisible();
      await widget.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      const out = path.join(OUT_DIR, `${w.name}-${v.label}.png`);
      await widget.screenshot({ path: out });
      // Also full hero page for context
      const heroOut = path.join(OUT_DIR, `${w.name}-${v.label}-hero.png`);
      await page.screenshot({ path: heroOut, fullPage: false });
    });
  }
}
