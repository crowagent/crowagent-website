const { test } = require('@playwright/test');
const BASE = 'http://localhost:8092';
test('full-page snapshot', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/?_=` + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  // Dismiss cookie banner so it doesn't cover the footer
  await page.evaluate(() => {
    const banner = document.querySelector('#ca-cookie, .cookie-banner');
    if (banner) banner.style.display = 'none';
  });
  await page.screenshot({ path: '/tmp/hp-screens/desktop-1440-FULLPAGE.png', fullPage: true });
});
