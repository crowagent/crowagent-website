import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1240, height: 1754 } });
const page = await ctx.newPage();
await page.goto('http://localhost:8092/', { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.waitForTimeout(400);

const info = await page.evaluate(() => {
  const out = { htmlClient: document.documentElement.clientWidth, docScroll: document.documentElement.scrollWidth, chain: [] };
  let el = document.querySelector('.hero img, .hero picture img');
  while (el && el !== document.documentElement) {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out.chain.push({
      tag: el.tagName, cls: el.className && el.className.toString().slice(0,80),
      x: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width),
      mw: cs.maxWidth, ml: cs.marginLeft, mr: cs.marginRight,
      pl: cs.paddingLeft, pr: cs.paddingRight,
      ovx: cs.overflowX, pos: cs.position, transform: cs.transform.slice(0,40), bs: cs.boxSizing,
      w_style: el.style.width || '', mw_style: el.style.maxWidth || '',
    });
    el = el.parentElement;
  }
  return out;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
