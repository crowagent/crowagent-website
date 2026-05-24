/* Probe the top-right "Start free trial" button in WebKit on product pages vs index */
const { webkit } = require('playwright');

const PAGES = [
  'index.html',
  'crowmark.html',
  'crowcyber.html',
  'crowcash.html',
  'crowagent-core.html',
  'crowesg.html',
  'csrd.html',
  'about.html',
  'pricing.html',
];

(async () => {
  const browser = await webkit.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  for (const p of PAGES) {
    await page.goto('http://localhost:8092/' + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const info = await page.evaluate(() => {
      // Find all "Start free trial" elements
      const els = Array.from(document.querySelectorAll('a, button')).filter(
        (el) => /start free trial/i.test(el.textContent || '')
      );
      return els.map((el) => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        const inHeader = !!el.closest('header, .nav-row, .top-bar, #navbar, [role="banner"]');
        return {
          tag: el.tagName,
          cls: el.className.substring(0, 100),
          parentCls: (el.parentElement?.className || '').substring(0, 100),
          headerCtx: (el.closest('header')?.className || el.closest('.nav-row')?.className || el.closest('[role="banner"]')?.className || '').substring(0, 80),
          rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
          color: cs.color,
          background: cs.backgroundColor,
          bgImage: cs.backgroundImage.substring(0, 80),
          visibility: cs.visibility,
          display: cs.display,
          opacity: cs.opacity,
          textVisible: !!(el.textContent || '').trim(),
          inHeader,
        };
      });
    });
    console.log('\n==', p, '==');
    info.forEach((x, i) => console.log('  ['+i+']', JSON.stringify(x)));
  }

  await browser.close();
})();
