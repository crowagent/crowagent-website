const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const w of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 1000 } });
    await page.goto('http://localhost:8092/about.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    // full page
    await page.screenshot({ path: `__about_${w}_full.png`, fullPage: true });
    // hero only
    await page.screenshot({ path: `__about_${w}_hero.png` });
    // overflow check
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`w=${w} scrollWidth=${sw} clientWidth=${cw} overflow=${sw>cw}`);
    await page.close();
  }
  await browser.close();
})();
