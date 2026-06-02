const { test } = require('@playwright/test');

test('deep debug what is rendering', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto((process.env.BASE_URL || 'http://localhost:8092') + '/pricing.html', { waitUntil: 'networkidle' });
  await page.waitForSelector('.logo-img-wrap', { timeout: 10000 });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const wrap = document.querySelector('.logo-img-wrap');
    if (!wrap) return { error: 'no wrap' };
    const all = wrap.querySelectorAll('*');
    const visible = [];
    all.forEach(el => {
      const r = el.getBoundingClientRect();
      const s = window.getComputedStyle(el);
      if (r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none' && parseFloat(s.opacity) > 0) {
        visible.push({
          tag: el.tagName.toLowerCase(),
          cls: el.className && el.className.toString(),
          w: Math.round(r.width),
          h: Math.round(r.height),
          x: Math.round(r.x),
          y: Math.round(r.y),
          text: (el.innerText || '').substring(0, 30),
          bg: s.backgroundImage && s.backgroundImage.substring(0, 80),
          src: el.tagName === 'IMG' ? el.src : (el.tagName === 'SOURCE' ? el.srcset : null),
        });
      }
    });
    // Also the wrap itself
    const wrapRect = wrap.getBoundingClientRect();
    return {
      wrap_rect: { w: Math.round(wrapRect.width), h: Math.round(wrapRect.height) },
      wrap_innerHTML: wrap.innerHTML.substring(0, 800),
      visible_children: visible,
    };
  });
  console.log(JSON.stringify(info, null, 2));
});
