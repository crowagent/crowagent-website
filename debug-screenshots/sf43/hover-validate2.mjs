import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Try with mouse-style hover (touch detection might bypass mouseenter)
const isTouchDetected = await page.evaluate(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0);
console.log('Touch detected:', isTouchDetected);

// Dispatch mouseenter directly
const result = await page.evaluate(() => {
  const dropdown = document.querySelector('.nav-dropdown');
  const evt = new MouseEvent('mouseenter', { bubbles: false });
  dropdown.dispatchEvent(evt);
  return {
    dataOpen: dropdown.getAttribute('data-open'),
  };
});
console.log('After mouseenter dispatch:', result);

await page.waitForTimeout(200);
const after = await page.evaluate(() => ({
  dataOpen: document.querySelector('.nav-dropdown').getAttribute('data-open'),
}));
console.log('After 200ms:', after);

await browser.close();
