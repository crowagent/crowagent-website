const { test } = require('@playwright/test');
test('nav top zoom', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8092/?_=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });
  await page.screenshot({ path: 'tests/v3-nav-zoom.png', clip: { x: 0, y: 0, width: 1440, height: 140 } });
});
