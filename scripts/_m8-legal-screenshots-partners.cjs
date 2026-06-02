/* eslint-disable */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT_DIR = process.env.M8_OUT || 'C:/tmp/m8-legal';
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900, mobile: false },
  { name: 'mobile',  width: 390,  height: 844, mobile: true  },
];
(async () => {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });
    const page = await ctx.newPage();
    try {
      await page.goto('http://localhost:8092/partners.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2500);
      await page.evaluate(() => {
        try { localStorage.setItem('crowagent-cookie-pref', 'accepted'); } catch (e) {}
        const b = document.querySelector('.cookie-banner, #cookie-banner, [data-cookie-banner]');
        if (b) b.style.display = 'none';
      });
      await page.screenshot({ path: path.join(OUT_DIR, `partners-${vp.name}-fold.png`), fullPage: false });
      await page.screenshot({ path: path.join(OUT_DIR, `partners-${vp.name}-full.png`), fullPage: true });
      await page.evaluate(() => {
        const f = document.querySelector('footer, .site-footer, #footer, .ca-footer');
        if (f) f.scrollIntoView({ behavior: 'instant', block: 'end' });
        else window.scrollTo(0, document.documentElement.scrollHeight);
      });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(OUT_DIR, `partners-${vp.name}-footer.png`), fullPage: false });
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      console.log(`partners ${vp.name} OK docHeight=${h}`);
    } catch (err) {
      console.error(`FAIL partners ${vp.name}: ${err.message}`);
    } finally {
      await page.close();
      await ctx.close();
    }
  }
  await browser.close();
})();
