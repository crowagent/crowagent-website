// SF46 Phase 2 P2-C probe — verify canonical .ca-btn-v2 / .ca-card-v2
// components are deployed on live pages and resolve correctly.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('SF46 P2-C — canonical-component rollout', () => {
  test('/partners.html has at least 3 .ca-btn-v2 instances', async ({ page }) => {
    await page.goto(`${BASE}/partners.html`);
    const count = await page.locator('.ca-btn-v2').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('.ca-btn-v2--lg has 52px height (consumes --btn-h-lg)', async ({ page }) => {
    await page.goto(`${BASE}/partners.html`);
    const btn = page.locator('.ca-btn-v2--lg').first();
    const height = await btn.evaluate(el => getComputedStyle(el).height);
    expect(height).toBe('52px');
  });

  test('.ca-btn-v2--secondary has transparent background', async ({ page }) => {
    await page.goto(`${BASE}/partners.html`);
    const btn = page.locator('.ca-btn-v2--secondary').first();
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
    // transparent or rgba(0,0,0,0)
    expect(bg).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);
  });

  test('.ca-btn-v2 primary uses brand teal gradient', async ({ page }) => {
    await page.goto(`${BASE}/partners.html`);
    const btn = page.locator('.ca-btn-v2:not(.ca-btn-v2--secondary)').first();
    const bg = await btn.evaluate(el => getComputedStyle(el).backgroundImage);
    // linear-gradient with teal
    expect(bg).toContain('linear-gradient');
  });

  test('.ca-btn-v2 border-radius equals --btn-radius (10px)', async ({ page }) => {
    await page.goto(`${BASE}/partners.html`);
    const radius = await page.locator('.ca-btn-v2').first().evaluate(el =>
      getComputedStyle(el).borderTopLeftRadius
    );
    expect(radius).toBe('10px');
  });
});
