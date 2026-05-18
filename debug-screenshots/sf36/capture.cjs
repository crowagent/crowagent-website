// SF36 banner screenshots — uniform-ised SVG audit
const { chromium } = require('playwright');

const pages = [
  ['about',     '/about.html'],
  ['security',  '/security.html'],
  ['partners',  '/partners.html'],
  ['pricing',   '/pricing.html'],
  ['faq',       '/faq.html'],
  ['resources', '/resources.html'],
  ['404',       '/404.html'],
  ['demo',      '/demo.html'],
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  for (const [name, path] of pages) {
    const url = 'http://localhost:8092' + path;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      // give styles a moment
      await page.waitForTimeout(800);
      // focus on the banner area at the top
      await page.screenshot({
        path: `debug-screenshots/sf36/${name}-banner.png`,
        clip: { x: 0, y: 0, width: 1440, height: 700 },
      });
      console.log('OK', name);
    } catch (e) {
      console.log('FAIL', name, e.message);
    }
  }
  await browser.close();
})();
