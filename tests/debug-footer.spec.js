const { test } = require('@playwright/test');
test('footer fullpage', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8092/?_=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });
  // Use bounding-rect screenshot to grab the footer element directly
  await page.locator('#ca-footer').screenshot({ path: 'tests/v2-footer-element.png' });
});
