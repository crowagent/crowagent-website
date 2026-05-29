const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const tag = process.argv[2] || 'before';
  for (const w of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });
    await page.goto('http://localhost:8092/security.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `__sec_${tag}_${w}.png`, fullPage: false });
    // also capture hero+top body region full
    await page.screenshot({ path: `__sec_${tag}_${w}_top.png`, clip: { x:0, y:0, width: w, height: 1500 } });
    await page.close();
  }
  await browser.close();
  console.log('done');
})();
