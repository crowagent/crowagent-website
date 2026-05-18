import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', e => console.log('pageerror:', e.message));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Use Playwright .focus() + .press() through locator
await page.locator('.nav-dropdown-trigger').first().focus();
await page.waitForTimeout(100);

// Confirm focus
const f1 = await page.evaluate(() => document.activeElement.tagName.toLowerCase() + ':' + (document.activeElement.textContent || '').trim().slice(0, 20));
console.log('Focus before Enter:', f1);

await page.keyboard.press('Enter');
await page.waitForTimeout(300);

const f2 = await page.evaluate(() => {
  const a = document.activeElement;
  return {
    tag: a.tagName.toLowerCase(),
    href: a.getAttribute('href'),
    role: a.getAttribute('role'),
    inDropdown: !!a.closest('.nav-dropdown'),
    inMega: !!a.closest('.nav-mega'),
    dropOpen: document.querySelector('.nav-dropdown')?.getAttribute('data-open'),
  };
});
console.log('Focus after Enter:', f2);

await browser.close();
