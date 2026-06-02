const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const pages = [
    'http://localhost:8092/',
    'http://localhost:8092/crowagent-core.html',
    'http://localhost:8092/crowmark.html',
  ];
  for (const url of pages) {
    const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil:'domcontentloaded', timeout:8000 });
      await page.waitForTimeout(600);
      const dots = await page.evaluate(() => {
        const sels = ['.crow-carousel-dots [role="tab"]','.carousel-dot','.slide-dot','.tab-dot','.crow-carousel .dot','.slider-pip','.pagination-dot'];
        for (const s of sels) {
          const el = document.querySelector(s);
          if (el) { const r = el.getBoundingClientRect(); return { sel:s, w:r.width, h:r.height, cls:el.className }; }
        }
        return null;
      });
      console.log(`${url}: ${dots? JSON.stringify(dots) : 'NO CAROUSEL DOTS'}`);
    } catch(e) { console.log(`${url}: ERROR ${e.message.split('\n')[0]}`); }
    await ctx.close();
  }
  await browser.close();
})();
