const { test } = require('@playwright/test');
const BASE = 'http://localhost:8092';
test('earth render check', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/?_=` + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });
  await page.screenshot({ path: 'tests/v2-01-hero-earth-fix.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
});
