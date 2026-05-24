import { chromium } from 'playwright';
const browser = await chromium.launch();
for (const url of ['http://localhost:8092/tools/csrd-applicability-checker/']) {
  for (const vp of [{w:1440,h:900,n:'desktop'},{w:390,h:844,n:'mobile'}]) {
    const ctx = await browser.newContext({ viewport: {width:vp.w,height:vp.h}, isMobile: vp.n==='mobile' });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const data = await page.evaluate(() => {
      const elems = [];
      // collect everything in the top-left 400x150 region
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let n;
      while ((n = tw.nextNode())) {
        const r = n.getBoundingClientRect();
        const t = (n.textContent || '').trim().slice(0,80);
        if (r.top >= 0 && r.top < 100 && r.left >= 0 && r.left < 400 && r.width > 5 && r.height > 5 && t.length > 0 && n.children.length < 4) {
          elems.push({ tag: n.tagName, cls: (n.className?.baseVal || n.className || '').toString().slice(0,80), text: t, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) });
        }
      }
      return elems.slice(0, 12);
    });
    console.log(`\n=== ${vp.n} ===`);
    for (const e of data) console.log(JSON.stringify(e));
    await ctx.close();
  }
}
await browser.close();
