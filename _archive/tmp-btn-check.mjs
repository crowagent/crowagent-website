import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/', { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const btn = document.querySelector('.hero-btns .seg-text:not([hidden]) .btn-primary-v2');
    if (!btn) return { err: 'btn not found' };
    const cs = getComputedStyle(btn);
    return {
      background: cs.background,
      backgroundColor: cs.backgroundColor,
      backgroundImage: cs.backgroundImage,
      color: cs.color,
      borderColor: cs.borderColor,
      boxShadow: cs.boxShadow,
    };
  });
  console.log('PRIMARY BTN:', JSON.stringify(info, null, 2));

  // Also check the announce-bar text contrast
  const ab = await page.evaluate(() => {
    const t = document.querySelector('.announce-bar .ab-text');
    const cta = document.querySelector('.announce-bar .ab-cta');
    function bg(el) {
      let n = el;
      while (n) {
        const cs = getComputedStyle(n);
        const b = cs.backgroundColor;
        const m = b && b.match(/rgba?\(([^)]+)\)/);
        if (m) {
          const parts = m[1].split(',').map(s=>parseFloat(s.trim()));
          if (parts.length === 3 || parts[3] >= 0.5) return b;
        }
        n = n.parentElement;
      }
      return null;
    }
    return {
      ab_text: t ? { color: getComputedStyle(t).color, fontSize: getComputedStyle(t).fontSize, bg: bg(t) } : null,
      ab_cta: cta ? { color: getComputedStyle(cta).color, fontSize: getComputedStyle(cta).fontSize, bg: bg(cta) } : null,
    };
  });
  console.log('ANNOUNCE BAR:', JSON.stringify(ab, null, 2));

  await browser.close();
})();
