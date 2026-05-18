import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Focus trigger
await page.locator('.nav-dropdown-trigger').first().focus();
await page.waitForTimeout(100);

// Enter to open
await page.keyboard.press('Enter');
await page.waitForTimeout(500);  // wait longer for visibility transition

const state1 = await page.evaluate(() => ({
  dropOpen: document.querySelector('.nav-dropdown')?.getAttribute('data-open'),
  active: document.activeElement.tagName.toLowerCase() + (document.activeElement.getAttribute('href') || ''),
  firstItemVis: getComputedStyle(document.querySelector('.nav-mega-item')).visibility,
}));
console.log('State after Enter (500ms wait):', state1);

// Now ArrowDown
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);
const state2 = await page.evaluate(() => ({
  active: document.activeElement.tagName.toLowerCase() + (document.activeElement.getAttribute('href') || ''),
}));
console.log('After ArrowDown:', state2);

// Try ArrowDown again
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);
const state3 = await page.evaluate(() => ({
  active: document.activeElement.tagName.toLowerCase() + (document.activeElement.getAttribute('href') || ''),
}));
console.log('After ArrowDown 2:', state3);

// Try pressing Enter on the focused item
if (state2.active.startsWith('a')) {
  const navResult = page.waitForNavigation({ timeout: 3000 }).catch(e => e.message);
  await page.keyboard.press('Enter');
  await navResult;
  console.log('Navigated to:', page.url().replace(BASE, ''));
}

await browser.close();
