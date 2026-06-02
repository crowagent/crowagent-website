// SF46 Phase 1 Step 1.5 — verify that retired !important rescues still resolve correctly
const { test, expect } = require('@playwright/test');
const BASE = process.env.BASE_URL || 'http://localhost:8092';

test('security.html — .sec-uptime-cta has obsidian text on teal bg, no !important', async ({ page }) => {
  await page.goto(`${BASE}/security.html`);
  const cta = await page.$('a.sec-uptime-cta');
  expect(cta).not.toBeNull();
  const styles = await cta.evaluate(el => {
    const c = getComputedStyle(el);
    return { color: c.color, bg: c.backgroundColor, textDecorationLine: c.textDecorationLine };
  });
  // --bg = #040E1A = rgb(4, 14, 26)
  expect(styles.color).toBe('rgb(4, 14, 26)');
  // teal = #0CC9A8 = rgb(12, 201, 168)
  expect(styles.bg).toBe('rgb(12, 201, 168)');
  expect(styles.textDecorationLine).not.toContain('underline');
});

test('terms.html — .terms-cta--primary has obsidian text on teal bg', async ({ page }) => {
  await page.goto(`${BASE}/terms.html`);
  const cta = await page.$('a.terms-cta--primary');
  if (!cta) test.skip(true, 'no terms-cta--primary on page');
  const styles = await cta.evaluate(el => {
    const c = getComputedStyle(el);
    return { color: c.color, bg: c.backgroundColor, textDecorationLine: c.textDecorationLine };
  });
  expect(styles.color).toBe('rgb(4, 14, 26)');
  expect(styles.bg).toBe('rgb(12, 201, 168)');
  expect(styles.textDecorationLine).not.toContain('underline');
});

test('terms.html — .uptime-cta has obsidian text on teal bg', async ({ page }) => {
  await page.goto(`${BASE}/terms.html`);
  const cta = await page.$('a.uptime-cta');
  if (!cta) test.skip(true, 'no uptime-cta on page');
  const styles = await cta.evaluate(el => {
    const c = getComputedStyle(el);
    return { color: c.color, bg: c.backgroundColor };
  });
  expect(styles.color).toBe('rgb(4, 14, 26)');
  expect(styles.bg).toBe('rgb(12, 201, 168)');
});

test('privacy.html — .priv-cta-primary has obsidian text on teal bg', async ({ page }) => {
  await page.goto(`${BASE}/privacy.html`);
  const cta = await page.$('a.priv-cta-primary');
  if (!cta) test.skip(true, 'no priv-cta-primary on page');
  const styles = await cta.evaluate(el => {
    const c = getComputedStyle(el);
    return { color: c.color, bg: c.backgroundColor };
  });
  expect(styles.color).toBe('rgb(4, 14, 26)');
  expect(styles.bg).toBe('rgb(12, 201, 168)');
});

test('terms.html — .u-link-teal still resolves to teal underline', async ({ page }) => {
  await page.goto(`${BASE}/terms.html`);
  const link = await page.$('a.u-link-teal');
  if (!link) test.skip(true, 'no u-link-teal on page');
  const styles = await link.evaluate(el => {
    const c = getComputedStyle(el);
    return { color: c.color, textDecorationLine: c.textDecorationLine };
  });
  expect(styles.color).toBe('rgb(12, 201, 168)');
  expect(styles.textDecorationLine).toContain('underline');
});
