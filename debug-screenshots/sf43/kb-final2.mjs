import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

await page.locator('.nav-dropdown-trigger').first().focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(1000);  // longer wait for visibility transition (250ms) + paint

// Check visibility state
const visState = await page.evaluate(() => {
  const item = document.querySelector('.nav-mega-item');
  return {
    vis: getComputedStyle(item).visibility,
    parentVis: getComputedStyle(item.parentElement).visibility,
    megaVis: getComputedStyle(item.closest('.nav-mega')).visibility,
  };
});
console.log('Visibility state 1s after Enter:', visState);

await page.keyboard.press('ArrowDown');
await page.waitForTimeout(300);
const a1 = await page.evaluate(() => ({
  active: document.activeElement.tagName.toLowerCase() + '/' + (document.activeElement.getAttribute('href') || '?'),
}));
console.log('After ArrowDown 1:', a1);

await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);
const a2 = await page.evaluate(() => ({
  active: document.activeElement.tagName.toLowerCase() + '/' + (document.activeElement.getAttribute('href') || '?'),
}));
console.log('After ArrowDown 2:', a2);

const nav = page.waitForNavigation({ timeout: 5000 }).catch(e => ({ error: e.message }));
await page.keyboard.press('Enter');
const navResult = await nav;
console.log('Navigated to:', page.url().replace(BASE, ''));

await browser.close();
