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
    // set cookie-consent in localStorage before load
    await context.addInitScript(() => {
      try {
        localStorage.setItem('cookie-consent','accepted');
        localStorage.setItem('cookieConsent','accepted');
        localStorage.setItem('crowagent-cookie-consent','accepted');
        localStorage.setItem('cookie_consent','all');
      } catch(e){}
    });
    const page = await context.newPage();
    await page.goto(`http://localhost:8092/${p}.html`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1200);
    // brute-force remove any cookie banner element
    await page.evaluate(() => {
      const sels = ['#cookie-banner','.cookie-banner','[class*="cookie"]','[id*="cookie"]'];
      for (const s of sels) document.querySelectorAll(s).forEach(el => {
        const txt = (el.innerText||'').toLowerCase();
        if (txt.includes('cookie') && (txt.includes('accept')||txt.includes('manage'))) el.style.display='none';
      });
    });
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForTimeout(300);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const step = vp.height;
    let i = 0;
    for (let y = 0; y < total; y += step) {
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await page.waitForTimeout(350);
      await page.screenshot({ path: path.join(OUT, `c_${p}_${vpName}_${String(i).padStart(2,'0')}.png`) });
      i++;
    }
    console.log(`${job}: ${i} sections, total=${total}`);
    await context.close();
  }
  await browser.close();
  console.log('DONE');
})();
