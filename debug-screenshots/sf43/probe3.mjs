// SF43 probe 3 — V2 fullPage + a tight check
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf43';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const nodes = Array.from(document.querySelectorAll('.sc-num'));
  return nodes.map(n => {
    const r = n.getBoundingClientRect();
    return {
      text: n.textContent.trim().slice(0, 40),
      top: r.top + window.scrollY,
      visible: r.width > 0 && r.height > 0,
    };
  });
});
console.log('sc-num positions:', JSON.stringify(info, null, 2));

if (info.length > 0) {
  const y = info[0].top;
  await page.evaluate(yy => window.scrollTo(0, yy - 200), y);
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + '/v2-stats-actual.png', clip: { x: 0, y: 0, width: 1440, height: 900 } });
}

await browser.close();
