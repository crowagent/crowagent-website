/* Quick Chromium comparison capture for product pages to determine if this is WebKit-specific */
const { chromium } = require('playwright');
const fs = require('fs');

const PAGES = ['index.html', 'crowmark.html', 'crowcyber.html', 'about.html', 'pricing.html'];
const OUT = 'C:/tmp/webkit-parity/_chromium';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();

  for (const p of PAGES) {
    await page.goto('http://localhost:8092/' + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const file = OUT + '/' + p.replace(/\.html$/, '') + '-chromium.png';
    await page.screenshot({ path: file });

    const info = await page.evaluate(() => {
      const el = document.querySelector('.btn.btn-primary-v2.nav-cta');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        cls: el.className,
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage.substring(0, 80),
        color: cs.color,
        text: (el.textContent || '').trim(),
      };
    });
    console.log(p, JSON.stringify(info));
  }

  await browser.close();
})();
