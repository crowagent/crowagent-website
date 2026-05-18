import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  for (const u of ['http://localhost:8092/crowcyber', 'http://localhost:8092/crowcash']) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      window.__entries = [];
      try {
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) {
            window.__entries.push({
              t: e.startTime,
              tag: e.element ? e.element.tagName : '?',
              id: e.element ? e.element.id : '',
              cls: e.element && typeof e.element.className === 'string' ? e.element.className.slice(0,80) : '',
              text: e.element ? (e.element.textContent || '').trim().slice(0,80) : '',
              url: e.url || null,
              size: e.size,
            });
          }
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (e) {}
    });
    await page.goto(u, { waitUntil: 'load' });
    await page.waitForTimeout(3500);
    const entries = await page.evaluate(() => window.__entries);
    console.log(`\n=== ${u} ===`);
    for (const e of entries) {
      console.log(`  ${Math.round(e.t)}ms  <${e.tag}${e.id?' id="'+e.id+'"':''}${e.cls?' class="'+e.cls+'"':''}>  size=${e.size}  url=${(e.url||'-').slice(-50)}  text="${e.text}"`);
    }
    await ctx.close();
  }
  await browser.close();
})();
