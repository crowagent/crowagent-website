const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:8092/crowcash.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  const icon = await page.locator('.sv-card.hw').first();
  await icon.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await icon.screenshot({ path: 'audit/qa40-cluster-1-after/crowcash-hw-icon-2.png' });

  // dots zoom
  await page.goto('http://localhost:8092/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const dots = await page.locator('.home-demo-cycle__dots');
  if (await dots.count()) {
    await dots.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await dots.screenshot({ path: 'audit/qa40-cluster-1-after/home-dots-zoom.png' });
    const computed = await dots.evaluate(el => {
      const style = window.getComputedStyle(el);
      const firstDot = el.querySelector('.home-demo-cycle__dot');
      const dotStyle = firstDot ? window.getComputedStyle(firstDot) : null;
      const li = el.querySelector('li');
      const liStyle = li ? window.getComputedStyle(li) : null;
      return {
        olDisplay: style.display, olListStyle: style.listStyleType, olPaddingLeft: style.paddingLeft,
        liListStyle: liStyle ? liStyle.listStyleType : null,
        dotW: firstDot ? firstDot.offsetWidth : 0, dotH: firstDot ? firstDot.offsetHeight : 0,
        dotBg: dotStyle ? dotStyle.backgroundColor : null,
      };
    });
    console.log('dots:', JSON.stringify(computed));
  }
  await browser.close();
})();
