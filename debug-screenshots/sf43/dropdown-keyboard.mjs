// SF43 NU1 — Keyboard accessibility validation
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// Focus the first dropdown trigger via Tab
await page.evaluate(() => {
  const t = document.querySelector('.nav-dropdown-trigger');
  if (t) t.focus();
});

const focus1 = await page.evaluate(() => {
  return {
    activeTag: document.activeElement.tagName.toLowerCase(),
    text: document.activeElement.textContent?.trim().slice(0, 20),
  };
});
console.log('Focus on trigger:', focus1);

// Press Enter to open
await page.keyboard.press('Enter');
await page.waitForTimeout(200);

const afterEnter = await page.evaluate(() => {
  const d = document.querySelector('.nav-dropdown');
  return {
    dataOpen: d?.getAttribute('data-open'),
    ariaExpanded: d?.querySelector('.nav-dropdown-trigger')?.getAttribute('aria-expanded'),
    focusTag: document.activeElement?.tagName.toLowerCase(),
    focusHref: document.activeElement?.getAttribute('href'),
  };
});
console.log('After Enter:', afterEnter);

// Arrow down to navigate
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(100);
const afterDown = await page.evaluate(() => ({
  focusHref: document.activeElement?.getAttribute('href'),
}));
console.log('After ArrowDown:', afterDown);

// Press Enter on the focused item to navigate
const navPromise = page.waitForNavigation({ timeout: 5000 }).catch(e => ({ error: e.message }));
await page.keyboard.press('Enter');
const result = await navPromise;
console.log('Navigated to:', page.url().replace(BASE, ''));

// Test Escape
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.evaluate(() => document.querySelector('.nav-dropdown-trigger').focus());
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
await page.keyboard.press('Escape');
const escState = await page.evaluate(() => document.querySelector('.nav-dropdown')?.getAttribute('data-open'));
console.log('After Escape, dataOpen:', escState);

await browser.close();
