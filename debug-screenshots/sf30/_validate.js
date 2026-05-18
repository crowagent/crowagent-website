// SF30 motion-bg validator: 5 sample pages.
const { chromium } = require('playwright');

const SAMPLES = [
  { name: 'about',     url: 'http://localhost:8092/about.html' },
  { name: 'pricing',   url: 'http://localhost:8092/pricing.html' },
  { name: 'security',  url: 'http://localhost:8092/security.html' },
  { name: 'crowcyber', url: 'http://localhost:8092/crowcyber.html' },
  { name: 'tools',     url: 'http://localhost:8092/tools/index.html' },
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const summary = [];
  for (const s of SAMPLES) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', msg => { if (msg.type() === 'error') errs.push(msg.text()); });
    page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    try {
      await page.goto(s.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(800);
      const cls = await page.evaluate(() => {
        const m = document.getElementById('main-content');
        return m ? m.className : null;
      });
      const hasPmbHost = cls && cls.includes('pmb-host');
      await page.evaluate(() => window.scrollTo(0, 800));
      await page.waitForTimeout(400);
      const outPath = `debug-screenshots/sf30/motion-${s.name}.png`;
      await page.screenshot({ path: outPath, fullPage: false });
      summary.push({ name: s.name, mainClass: cls, hasPmbHost, errors: errs, screenshot: outPath });
    } catch (e) {
      summary.push({ name: s.name, error: e.message, errors: errs });
    }
    await page.close();
  }
  await browser.close();
  console.log(JSON.stringify(summary, null, 2));
})();
