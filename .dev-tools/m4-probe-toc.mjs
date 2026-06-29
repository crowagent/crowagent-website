import { chromium } from 'playwright';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: {width:390,height:844}, isMobile: true, deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/tools-csrd-checker-methodology.html', { waitUntil: 'networkidle' });
const data = await page.evaluate(() => {
  const toc = document.querySelector('.tool-methodology-toc');
  const h1 = document.querySelector('h1');
  if (!toc) return { error: 'no toc' };
  const cs = getComputedStyle(toc);
  const r = toc.getBoundingClientRect();
  const h1r = h1.getBoundingClientRect();
  return {
    toc: { pos: cs.position, top: cs.top, zIndex: cs.zIndex, rect: { x:r.x, y:r.y, w:r.width, h:r.height } },
    h1: { rect: { x:h1r.x, y:h1r.y, w:h1r.width, h:h1r.height } },
    overlap: h1r.bottom > r.top && r.bottom > h1r.top,
  };
});
console.log(JSON.stringify(data, null, 2));
await ctx.close();
await browser.close();
