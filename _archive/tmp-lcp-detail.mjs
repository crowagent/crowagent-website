import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  for (let i = 0; i < 3; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      window.__entries = [];
      try {
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) {
            window.__entries.push({
              t: e.startTime,
              el: e.element ? (e.element.tagName + (e.element.id?'#'+e.element.id:'') + (e.element.className && typeof e.element.className==='string'?'.'+e.element.className.split(/\s+/).slice(0,2).join('.'):'')) : '?',
              url: e.url || null,
              size: e.size,
            });
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
    });
    await page.goto('http://localhost:8092/', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const entries = await page.evaluate(() => window.__entries);
    console.log(`Run ${i+1}:`);
    for (const e of entries) {
      console.log(`  ${Math.round(e.t)}ms  size=${e.size}  el=${e.el}  url=${(e.url||'-').slice(-60)}`);
    }
    await ctx.close();
  }
  await browser.close();
})();
