const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/*', route => route.continue({ headers: { ...route.request().headers(), 'cache-control': 'no-cache' }}));
  const page = await ctx.newPage();
  await page.goto('http://localhost:8092/?ts=' + Date.now(), { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const ol = document.querySelector('.home-demo-cycle__dots');
    if (ol) ol.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(800);
  const info = await page.evaluate(() => {
    const ol = document.querySelector('.home-demo-cycle__dots');
    if (!ol) return { error: 'no dots' };
    const r = ol.getBoundingClientRect();
    const dots = Array.from(ol.querySelectorAll('.home-demo-cycle__dot'));
    const cs = getComputedStyle(ol);
    return {
      paddingInlineStart: cs.paddingInlineStart, paddingLeft: cs.paddingLeft,
      flexDirection: cs.flexDirection, display: cs.display,
      width: Math.round(r.width), height: Math.round(r.height),
      dotPositions: dots.map(d => {
        const rr = d.getBoundingClientRect();
        return { x: Math.round(rr.x), y: Math.round(rr.y) };
      }),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  const ol = await page.locator('.home-demo-cycle__dots').first();
  if (await ol.count()) {
    await ol.screenshot({ path: 'audit/qa40-cluster-1-after/home-dots-final.png' });
  }
  // Also overall section
  const section = await page.locator('.home-demo-cycle').first();
  if (await section.count()) {
    await section.screenshot({ path: 'audit/qa40-cluster-1-after/home-demo-section.png' });
  }
  await browser.close();
})();
