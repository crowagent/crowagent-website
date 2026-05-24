const { test } = require('@playwright/test');
test('final', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8092/?_=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });
  await page.screenshot({ path: 'tests/v4-hero.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.evaluate(() => window.scrollTo(0, 3200));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/v4-products.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
});
