const { chromium } = require('playwright');
const path = require('path');
const OUT = __dirname;

// page -> viewport list to section-capture
const jobs = process.argv.slice(2); // e.g. "pricing:mobile" "security:tablet"

const vpDefs = {
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  tablet: { width: 768, height: 1024, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
};

(async () => {
  const browser = await chromium.launch();
  for (const job of jobs) {
    const [p, vpName] = job.split(':');
    const vp = vpDefs[vpName];
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: vp.deviceScaleFactor,
      isMobile: vp.isMobile, hasTouch: vp.hasTouch,
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:8092/${p}.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    try { const b = await page.$('button:has-text("Accept"), #cookie-accept'); if (b) { await b.click(); await page.waitForTimeout(300);} } catch(e){}
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = vp.height;
    let i = 0;
    for (let y = 0; y < total; y += step) {
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await page.waitForTimeout(350);
      const file = path.join(OUT, `sec_${p}_${vpName}_${String(i).padStart(2,'0')}.png`);
      await page.screenshot({ path: file });
      i++;
    }
    console.log(`${job}: ${i} sections, total=${total}`);
    await context.close();
  }
  await browser.close();
  console.log('DONE');
})();
