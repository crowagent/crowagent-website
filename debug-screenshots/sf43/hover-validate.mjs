import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Hover on first dropdown trigger
await page.locator('.nav-dropdown-trigger').first().hover();
await page.waitForTimeout(400);

const hoverState = await page.evaluate(() => {
  const d = document.querySelector('.nav-dropdown');
  return {
    dataOpen: d.getAttribute('data-open'),
    megaVis: getComputedStyle(d.querySelector('.nav-mega')).visibility,
  };
});
console.log('After hover:', hoverState);

// Hover off
await page.mouse.move(0, 500);
await page.waitForTimeout(500);
const offState = await page.evaluate(() => {
  const d = document.querySelector('.nav-dropdown');
  return {
    dataOpen: d.getAttribute('data-open'),
  };
});
console.log('After hover off:', offState);

await browser.close();
