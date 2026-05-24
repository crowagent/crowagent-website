/* Cross-check blog/index nav-cta in Chromium */
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/blog/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/tmp/webkit-parity/_chromium/blog-index-chromium.png' });
  const info = await page.evaluate(() => {
    const el = document.querySelector('.btn.btn-primary-v2.nav-cta');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { bg: cs.backgroundColor, color: cs.color, text: (el.textContent || '').trim() };
  });
  console.log('blog/index chromium:', JSON.stringify(info));
  await browser.close();
})();
