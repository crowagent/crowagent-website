const { test } = require('@playwright/test');

test('check overflow on .logo-box', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto((process.env.BASE_URL || 'http://localhost:8092') + '/pricing.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('.logo-img-wrap', { timeout: 10000 });
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const box = document.querySelector('.logo-box');
    const b1 = document.querySelector('.logo-box .b1');
    const sBox = window.getComputedStyle(box);
    const sB1 = window.getComputedStyle(b1);
    const rBox = box.getBoundingClientRect();
    const rB1 = b1.getBoundingClientRect();
    return {
      box: {
        rect: { w: rBox.width, h: rBox.height, x: rBox.x, y: rBox.y },
        overflow: sBox.overflow,
        overflowX: sBox.overflowX,
        overflowY: sBox.overflowY,
        position: sBox.position,
        width: sBox.width,
        height: sBox.height,
        display: sBox.display,
        contain: sBox.contain,
        zIndex: sBox.zIndex,
      },
      b1: {
        rect: { w: rB1.width, h: rB1.height, x: rB1.x, y: rB1.y },
        position: sB1.position,
        transform: sB1.transform,
        width: sB1.width,
        height: sB1.height,
      },
      // Check parent of b1
      b1_parent_is_box: b1.parentElement === box,
    };
  });
  console.log(JSON.stringify(info, null, 2));
});
