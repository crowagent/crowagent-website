const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const pages = ['pricing', 'faq', 'about', 'contact', 'partners', 'security'];
const viewports = [
  { name: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'tablet', width: 768, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
];

(async () => {
  const browser = await chromium.launch();
  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });
    const page = await context.newPage();
    for (const p of pages) {
      const url = `http://localhost:8092/${p}.html`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      } catch (e) {
        console.log(`WARN goto ${url}: ${e.message}`);
      }
      await page.waitForTimeout(1500);
      // dismiss cookie banner if present
      try {
        const btn = await page.$('button:has-text("Accept"), button:has-text("Accept all"), #cookie-accept, .cookie-accept');
        if (btn) { await btn.click(); await page.waitForTimeout(400); }
      } catch (e) {}
      const file = path.join(OUT, `${p}_${vp.name}.png`);
      try {
        await page.screenshot({ path: file, fullPage: true });
        const dims = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, cw: window.innerWidth }));
        // detect horizontal overflow
        console.log(`${p} ${vp.name}: scrollW=${dims.w} innerW=${dims.cw} ${dims.w > dims.cw ? 'HORIZONTAL-OVERFLOW' : 'ok'} fullH=${dims.h}`);
      } catch (e) {
        console.log(`ERR screenshot ${file}: ${e.message}`);
      }
    }
    await context.close();
  }
  await browser.close();
  console.log('DONE');
})();
