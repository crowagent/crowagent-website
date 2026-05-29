const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const [name, url] of [['products','http://localhost:8092/products/index.html'],['cyber','http://localhost:8092/crowcyber.html']]) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(url + '?n=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2200);
    const info = await page.evaluate(() => {
      const h1 = document.querySelector('h1.ca-hero-title');
      const spans = [...h1.querySelectorAll(':scope > span')];
      return {
        h1FontSize: getComputedStyle(h1).fontSize,
        h1inlineStyle: h1.getAttribute('style'),
        spans: spans.map(s => ({ t: s.textContent.trim(), fs: getComputedStyle(s).fontSize, inline: s.getAttribute('style'), rectW: Math.round(s.getBoundingClientRect().width), rectH: Math.round(s.getBoundingClientRect().height) })),
      };
    });
    console.log(name, JSON.stringify(info, null, 1));
    await page.close();
  }
  await browser.close();
})();
