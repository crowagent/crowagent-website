const { test } = require('@playwright/test');
test('full v2', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:8092/?_=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const b = document.querySelector('#ca-cookie, .cookie-banner'); if (b) b.style.display = 'none'; });
  await page.screenshot({ path: 'tests/v2-FULL.png', fullPage: true });

  // capture key region screenshots by scrollTo + viewport screenshot
  const points = [
    { name: 'v2-A-hero', y: 0 },
    { name: 'v2-B-audience', y: 1400 },
    { name: 'v2-C-walkthrough-region', y: 2400 },
    { name: 'v2-D-frameworks', y: 5500 },
    { name: 'v2-E-products', y: 8500 },
    { name: 'v2-F-bottom', y: 14000 },
  ];
  for (const p of points) {
    await page.evaluate((y) => window.scrollTo(0, y), p.y);
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'tests/' + p.name + '.png', clip: { x:0, y:0, width:1440, height:900 } });
  }
});
