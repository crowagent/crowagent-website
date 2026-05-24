/**
 * SF46 P3-G — Cross-browser smoke probe.
 *
 * Minimal pass-the-eye smoke check that the marketing site renders + the
 * critical user paths work on Chromium + Firefox + WebKit engines.
 * Browsers must be installed first:
 *   npx playwright install chromium firefox webkit
 * If a browser isn't installed, the project is skipped (no failure).
 */
const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('P3-G — cross-browser smoke', () => {
  test('Home page loads + has h1', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const h1 = await page.locator('h1').first();
    await expect(h1).toBeVisible();
  });

  test('Navigation links resolve (Pricing + About)', async ({ page }) => {
    await page.goto(BASE + '/pricing.html');
    await expect(page.locator('h1').first()).toBeVisible();
    await page.goto(BASE + '/about.html');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Cookie banner renders', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    // Cookie banner is injected via JS — WebKit warmup is slower; allow more time.
    const banner = page.locator('.cookie-banner, #ca-cookie');
    await expect(banner).toBeAttached({ timeout: 8000 });
  });

  test('Contact form is interactable', async ({ page }) => {
    await page.goto(BASE + '/contact.html');
    const name = page.locator('input[name="name"]').first();
    await name.fill('Smoke test');
    await expect(name).toHaveValue('Smoke test');
  });

  test('Skip link is focusable + becomes visible', async ({ page }) => {
    await page.goto(BASE + '/index.html');
    const result = await page.evaluate(() => {
      const a = document.querySelector('a.skip-link');
      if (!a) return null;
      a.focus();
      const r = a.getBoundingClientRect();
      return { focused: document.activeElement === a, w: r.width, h: r.height };
    });
    expect(result).not.toBeNull();
    expect(result.focused).toBe(true);
    expect(result.w).toBeGreaterThan(0);
    expect(result.h).toBeGreaterThan(0);
  });
});
