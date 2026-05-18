import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

await page.locator('.nav-dropdown-trigger').first().click();
await page.waitForTimeout(800);

const state = await page.evaluate(() => {
  const drops = document.querySelectorAll('.nav-dropdown');
  return Array.from(drops).map((d, i) => {
    const mega = d.querySelector('.nav-mega');
    const item = d.querySelector('.nav-mega-item');
    return {
      idx: i,
      dataOpen: d.getAttribute('data-open'),
      megaVis: getComputedStyle(mega).visibility,
      megaOpacity: getComputedStyle(mega).opacity,
      itemVis: getComputedStyle(item).visibility,
      itemDisplay: getComputedStyle(item).display,
    };
  });
});
console.log('All dropdowns state after click:', JSON.stringify(state, null, 2));

await browser.close();
