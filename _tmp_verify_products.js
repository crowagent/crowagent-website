const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const w of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    await page.goto('http://localhost:8092/products/index.html?nocache=' + Date.now(), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const info = await page.evaluate(() => {
      const h1 = document.querySelector('h1.ca-hero-title');
      const cs = getComputedStyle(h1);
      const spans = [...h1.querySelectorAll(':scope > span')];
      return {
        fontSize: cs.fontSize,
        h1display: cs.display,
        text: h1.innerText,
        spanCount: spans.length,
        spanInfo: spans.map(s => ({ t: s.textContent.trim().slice(0,12), disp: getComputedStyle(s).display, ws: getComputedStyle(s).whiteSpace, w: Math.round(s.getBoundingClientRect().width) })),
        h1width: Math.round(h1.getBoundingClientRect().width),
      };
    });
    console.log(`[${w}]`, JSON.stringify(info, null, 1));
    await page.screenshot({ path: `_tmp_products_${w}.png`, clip: { x: 0, y: 0, width: w, height: 750 } });
    await page.close();
  }
  await browser.close();
})();
