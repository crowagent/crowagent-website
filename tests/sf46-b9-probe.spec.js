// SF46 B9 probe — verify .ca-card-v2 + .ca-btn-v2 consume Phase 1 tokens.
// Runs against /tests/fixtures/sf46-b9.html on the local server.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('SF46 B9 — canonical component token consumption', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/tests/fixtures/sf46-b9.html`);
  });

  test('1. .ca-card-v2 has shadow-card-rest applied (multi-layer)', async ({ page }) => {
    const shadow = await page.locator('[data-test="canonical-card"]').evaluate(el =>
      getComputedStyle(el).boxShadow
    );
    // shadow-card-rest is 3 layers (inset white + dark drop + soft outer)
    const layerCount = shadow.split(/,\s*(?=[\-\d])/).length;
    expect(layerCount).toBeGreaterThanOrEqual(3);
  });

  test('2. .ca-card-v2 padding equals --space-6 (24px)', async ({ page }) => {
    const padding = await page.locator('[data-test="canonical-card"]').evaluate(el =>
      getComputedStyle(el).paddingTop
    );
    expect(padding).toBe('24px');
  });

  test('3. .ca-card-v2 border-radius is 16px', async ({ page }) => {
    const radius = await page.locator('[data-test="canonical-card"]').evaluate(el =>
      getComputedStyle(el).borderTopLeftRadius
    );
    expect(radius).toBe('16px');
  });

  test('4. .ca-card-v2__title font-size resolves --text-h3 (24-30px fluid)', async ({ page }) => {
    const size = await page.locator('.ca-card-v2__title').evaluate(el => {
      const cs = getComputedStyle(el);
      return parseFloat(cs.fontSize);
    });
    expect(size).toBeGreaterThanOrEqual(24);
    expect(size).toBeLessThanOrEqual(30);
  });

  test('5. .ca-btn-v2 height equals --btn-h-md (44px)', async ({ page }) => {
    const height = await page.locator('[data-test="canonical-button"]').evaluate(el =>
      getComputedStyle(el).height
    );
    expect(height).toBe('44px');
  });

  test('6. .ca-btn-v2 border-radius equals --btn-radius (10px)', async ({ page }) => {
    const radius = await page.locator('[data-test="canonical-button"]').evaluate(el =>
      getComputedStyle(el).borderTopLeftRadius
    );
    expect(radius).toBe('10px');
  });
});
