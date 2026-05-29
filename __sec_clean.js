const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const tag = process.argv[2] || 'after';
  for (const w of [1280, 390]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 1000 } });
    // pre-set cookie consent to hide banner
    await ctx.addInitScript(() => {
      try { localStorage.setItem('ca-cookie-consent', JSON.stringify({analytics:true,marketing:true,ts:Date.now()})); localStorage.setItem('cookieConsent','accepted'); } catch(e){}
    });
    const page = await ctx.newPage();
    await page.goto('http://localhost:8092/security.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => {
      const desc = document.querySelector('.ca-hero-desc');
      const callout = document.querySelector('.sf19-status-callout-wrap');
      const ext = document.querySelector('.sf19-status-ext');
      const r = ext ? ext.getBoundingClientRect() : null;
      return {
        descTop: desc ? Math.round(desc.getBoundingClientRect().top + window.scrollY) : null,
        descText: desc ? desc.textContent.trim().slice(0,50) : null,
        calloutBottom: callout ? Math.round(callout.getBoundingClientRect().bottom + window.scrollY) : null,
        extSvg: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null
      };
    });
    console.log(`w=${w}`, JSON.stringify(m));
    await page.screenshot({ path: `__sec_clean_${tag}_${w}.png`, clip: { x:0, y:0, width: w, height: Math.min((m.descTop||1000)+200, 1600) } });
    await ctx.close();
  }
  await browser.close();
  console.log('done');
})();
