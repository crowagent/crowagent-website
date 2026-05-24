const { test } = require('@playwright/test');
test('mobile + tablet hero', async ({ page }) => {
  for (const v of [{ name: 'mobile-390', w: 390, h: 844 }, { name: 'tablet-768', w: 768, h: 1024 }]) {
    await page.setViewportSize({ width: v.w, height: v.h });
    await page.goto('http://localhost:8092/?_=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });
    await page.screenshot({ path: `tests/v2-${v.name}-hero.png`, clip: { x: 0, y: 0, width: v.w, height: Math.min(v.h, 900) } });
  }
});
