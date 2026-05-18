import { chromium } from 'playwright';

async function probe(url, viewport) {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__lcp = null; window.__fcp = null; window.__cls = 0;
    try {
      new PerformanceObserver(list => {
        const e = list.getEntries().pop();
        window.__lcp = { startTime: e.startTime, url: e.url || null };
      }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) if (e.name === 'first-contentful-paint') window.__fcp = e.startTime;
      }).observe({ type: 'paint', buffered: true });
      new PerformanceObserver(list => {
        for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (e) {}
  });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(3500);
  const m = await page.evaluate(() => ({ lcp: window.__lcp, fcp: window.__fcp, cls: window.__cls }));
  await browser.close();
  return m;
}

function median(a) { const s = [...a].sort((x,y)=>x-y); return s[Math.floor(s.length/2)]; }

(async () => {
  const cases = [
    { url: 'http://localhost:8092/', vp: { width: 1440, height: 900 }, name: 'home-desktop' },
    { url: 'http://localhost:8092/', vp: { width: 375, height: 800 }, name: 'home-mobile' },
    { url: 'http://localhost:8092/pricing', vp: { width: 1440, height: 900 }, name: 'pricing-desktop' },
    { url: 'http://localhost:8092/pricing', vp: { width: 375, height: 800 }, name: 'pricing-mobile' },
  ];
  for (const c of cases) {
    const lcps = [], fcps = [], clss = [];
    for (let i=0; i<3; i++) {
      const m = await probe(c.url, c.vp);
      lcps.push(m.lcp ? m.lcp.startTime : null);
      fcps.push(m.fcp);
      clss.push(m.cls);
    }
    console.log(`${c.name.padEnd(20)} LCP[${lcps.map(x=>x?Math.round(x):'-').join(',')}] med=${Math.round(median(lcps.filter(Boolean)))}ms  FCP med=${Math.round(median(fcps.filter(Boolean)))}ms  CLS med=${median(clss).toFixed(3)}`);
  }
})();
