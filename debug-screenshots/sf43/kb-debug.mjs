import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// Inspect items collection at the time scripts.js wires it
const items = await page.evaluate(() => {
  const dropdown = document.querySelector('.nav-dropdown');
  const mega = dropdown.querySelector('.nav-mega');
  const items = mega.querySelectorAll('[role="menuitem"]');
  return {
    megaPresent: !!mega,
    itemCount: items.length,
    firstHref: items[0]?.getAttribute('href'),
    firstFocusable: items[0]?.tabIndex,
  };
});
console.log('Items at runtime:', items);

// Now keyboard test
await page.evaluate(() => document.querySelector('.nav-dropdown-trigger').focus());
await page.keyboard.press('Enter');
await page.waitForTimeout(250);

const after = await page.evaluate(() => {
  const d = document.querySelector('.nav-dropdown');
  return {
    dataOpen: d.getAttribute('data-open'),
    activeTag: document.activeElement.tagName.toLowerCase(),
    activeHref: document.activeElement.getAttribute('href'),
    activeRole: document.activeElement.getAttribute('role'),
  };
});
console.log('After Enter:', after);

// Try ArrowDown after Enter
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(100);
const arrowState = await page.evaluate(() => ({
  activeTag: document.activeElement.tagName.toLowerCase(),
  activeHref: document.activeElement.getAttribute('href'),
}));
console.log('After ArrowDown:', arrowState);

await browser.close();
