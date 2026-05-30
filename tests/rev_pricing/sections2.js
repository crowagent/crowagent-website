const { chromium } = require('playwright');
const path = require('path');
const OUT = __dirname;
const jobs = process.argv.slice(2);
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
      deviceScaleFactor: vp.deviceScaleFactor, isMobile: vp.isMobile, hasTouch: vp.hasTouch,
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:8092/${p}.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    // dismiss cookie banner: click Accept all
    try {
      const btns = await page.$$('button');
      for (const b of btns) {
        const t = (await b.innerText()).trim().toLowerCase();
        if (t === 'accept all' || t === 'accept') { await b.click(); break; }
      }
      await page.waitForTimeout(500);
    } catch(e){}
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForTimeout(300);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = vp.height;
    let i = 0;
    for (let y = 0; y < total; y += step) {
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(OUT, `s_${p}_${vpName}_${String(i).padStart(2,'0')}.png`) });
      i++;
    }
    console.log(`${job}: ${i} sections, total=${total}`);
    await context.close();
  }
  await browser.close();
  console.log('DONE');
})();
