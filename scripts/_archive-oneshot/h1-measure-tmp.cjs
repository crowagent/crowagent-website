const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const pages = [
    'http://localhost:8092/',
    'http://localhost:8092/pricing.html',
    'http://localhost:8092/about.html',
    'http://localhost:8092/contact.html',
    'http://localhost:8092/faq.html',
    'http://localhost:8092/crowmark.html',
    'http://localhost:8092/blog.html',
  ];
  for (const url of pages) {
    for (const vp of [{w:1440,h:900,label:'1440'},{w:390,h:844,label:'390'}]) {
      const ctx = await browser.newContext({ viewport:{ width:vp.w, height:vp.h } });
      const page = await ctx.newPage();
      try {
        await page.goto(url, { waitUntil:'domcontentloaded', timeout:8000 });
        await page.waitForTimeout(400);
        const m = await page.evaluate(() => {
          const h1 = document.querySelector('main h1, .hero h1, .hero-product h1, .hero-headline, h1.page-title, .page-title, .article-title');
          if (!h1) return null;
          const cs = getComputedStyle(h1);
          return { tag:h1.tagName, class:h1.className||'', fs:cs.fontSize, ls:cs.letterSpacing, lh:cs.lineHeight, fw:cs.fontWeight };
        });
        console.log(`${url} @ ${vp.label}: ${m? JSON.stringify(m) : 'NO H1'}`);
      } catch(e) { console.log(`${url} @ ${vp.label}: ERROR ${e.message.split('\n')[0]}`); }
      await ctx.close();
    }
  }
  await browser.close();
})();
