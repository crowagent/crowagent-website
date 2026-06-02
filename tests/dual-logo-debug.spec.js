const { test } = require('@playwright/test');

test('debug dom hierarchy', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto((process.env.BASE_URL || 'http://localhost:8092') + '/pricing.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('.logo-img-wrap', { timeout: 10000 });
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const wrap = document.querySelector('.logo-img-wrap');
    const box = document.querySelector('.logo-box');
    if (!box) return { error: 'no .logo-box' };
    // Get ancestor chain
    const chain = [];
    let el = box;
    while (el && el !== document.documentElement) {
      chain.push(`${el.tagName.toLowerCase()}.${(el.className||'').toString().split(/\s+/).filter(Boolean).join('.')}`);
      el = el.parentElement;
    }
    const s = window.getComputedStyle(box);
    const r = box.getBoundingClientRect();
    return {
      chain,
      box_outerHTML: box.outerHTML.substring(0, 300),
      box_parent: box.parentElement ? box.parentElement.outerHTML.substring(0, 200) : 'none',
      box_styles: {
        width: s.width,
        height: s.height,
        position: s.position,
        background: s.background.substring(0, 100),
        display: s.display,
        clip: s.clip,
      },
      box_rect: { w: r.width, h: r.height, x: r.x, y: r.y },
      wrap_html: wrap ? wrap.outerHTML.substring(0, 500) : 'NO WRAP'
    };
  });
  console.log(JSON.stringify(info, null, 2));
});
