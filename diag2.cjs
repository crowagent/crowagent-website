const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport:{ width:1440, height:900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/pricing.html?v=' + Date.now(), { waitUntil:'domcontentloaded' });
  await page.waitForTimeout(500);
  const info = await page.evaluate(() => {
    const h1 = document.querySelector('main h1, .page-title');
    const cs = getComputedStyle(h1);
    const root = document.documentElement;
    const rs = getComputedStyle(root);
    return {
      fs:cs.fontSize, ls:cs.letterSpacing, fw:cs.fontWeight,
      h1Display: rs.getPropertyValue('--h1-display'),
      f8h1: rs.getPropertyValue('--f8-h1'),
      bodyClass: document.body.className,
      computedFsAttr: h1.style.fontSize || 'no inline'
    };
  });
  console.log(JSON.stringify(info, null, 2));
  await browser.close();
})();
