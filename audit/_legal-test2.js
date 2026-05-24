const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const slugs = ['about', 'contact', 'partners', 'privacy', 'terms', 'security', 'cookies', 'cookie-preferences'];
  for (const slug of slugs) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    await ctx.addInitScript(() => {
      const s = document.createElement('style');
      s.textContent = '*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;animation-iteration-count:1!important}canvas[data-hero-mesh]{display:none!important}.reveal,.reveal.visible,.ms-reveal,.ms-reveal.ms-in,.fade-in{opacity:1!important;transform:none!important}';
      (document.head || document.documentElement).appendChild(s);
    });
    const page = await ctx.newPage();
    const t0 = Date.now();
    try {
      console.log(`${slug}: goto`);
      await page.goto(`http://localhost:8092/${slug}.html`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      console.log(`${slug}: dom ${Date.now()-t0}ms`);
      await page.waitForTimeout(1000);
      console.log(`${slug}: fold...`);
      await page.screenshot({ path: `C:/tmp/cluster-B-legal/${slug}-desktop-fold.png`, clip: { x:0, y:0, width:1440, height:900 }, timeout: 15000 });
      console.log(`${slug}: fold done ${Date.now()-t0}ms`);
      await page.screenshot({ path: `C:/tmp/cluster-B-legal/${slug}-desktop-full.png`, fullPage: true, timeout: 60000 });
      console.log(`${slug}: full done ${Date.now()-t0}ms`);
    } catch (e) {
      console.error(`${slug}: ERR ${e.message.slice(0,200)}`);
    }
    await page.close().catch(()=>{});
    await ctx.close().catch(()=>{});
  }
  await browser.close();
  console.log('all done');
})().catch(e => { console.error('FATAL', e); process.exit(1); });
