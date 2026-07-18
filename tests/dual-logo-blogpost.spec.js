const { test, expect } = require('@playwright/test');

test('dual-logo fix blog-post', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto((process.env.BASE_URL || 'http://localhost:8092') + '/blog/ppn-002-social-value-guide.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('.logo-img-wrap', { timeout: 10000 });
  await page.waitForTimeout(500);
  const measurements = await page.evaluate(() => {
    const wrap = document.querySelector('.logo-img-wrap');
    const box = wrap.querySelector('.logo-box');
    const pic = wrap.querySelector('.logo-img-pic');
    const text = wrap.querySelector('.logo-text');
    const get = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    };
    return { box: get(box), text: get(text), pic: get(pic) };
  });
  console.log('[blog-post]', JSON.stringify(measurements));
  await page.screenshot({
    path: 'C:/tmp/resp-audit/dual-logo-fix/blog-post-after-1440.png',
    clip: { x: 0, y: 0, width: 1440, height: 120 },
  });
  expect(measurements.box.w).toBeLessThanOrEqual(1);
  expect(measurements.pic.w).toBeGreaterThan(20);
});
