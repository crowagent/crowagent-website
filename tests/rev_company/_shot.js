const { chromium } = require('playwright');

const pages = [
  { name: 'roadmap', url: 'http://localhost:8092/roadmap.html' },
  { name: 'changelog', url: 'http://localhost:8092/changelog.html' },
  { name: 'resources', url: 'http://localhost:8092/resources.html' },
  { name: 'glossary', url: 'http://localhost:8092/glossary/index.html' },
  { name: '404', url: 'http://localhost:8092/404.html' },
  { name: 'cookieprefs', url: 'http://localhost:8092/cookie-preferences.html' },
];

const viewports = [
  { vp: 'mobile', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { vp: 'tablet', width: 768, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const p of pages) {
    for (const v of viewports) {
      const context = await browser.newContext({
        viewport: { width: v.width, height: v.height },
        deviceScaleFactor: v.deviceScaleFactor,
        isMobile: v.isMobile,
        hasTouch: v.hasTouch,
      });
      const page = await context.newPage();
      try {
        await page.goto(p.url, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (e) {
        await page.goto(p.url, { waitUntil: 'load', timeout: 30000 });
      }
      await page.waitForTimeout(1500);
      const out = `tests/rev_company/${p.name}_${v.vp}.png`;
      await page.screenshot({ path: out, fullPage: true });
      console.log('wrote', out);
      await context.close();
    }
  }
  await browser.close();
})();
