const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  for (const w of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://localhost:8092/about.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    // hero
    await page.screenshot({ path: `__v_${w}_hero.png` });
    // scroll to trigger reveals
    const max = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < max; y += 700) { await page.evaluate(_y => window.scrollTo(0,_y), y); await page.waitForTimeout(150); }
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `__v_${w}_full.png`, fullPage: true });
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    console.log(`w=${w} scrollWidth=${sw} clientWidth=${cw} overflow=${sw>cw}`);
    await page.close();
  }
  await browser.close();
})();
