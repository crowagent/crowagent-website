// Full keyboard flow: Tab to trigger, Enter to open, arrow keys to navigate, Enter to select
import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Focus the trigger
await page.locator('.nav-dropdown-trigger').first().focus();

// Enter to open
await page.keyboard.press('Enter');
await page.waitForTimeout(400);

// ArrowDown to focus first menuitem (after the visibility transition completes)
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);

const after = await page.evaluate(() => ({
  active: document.activeElement.tagName.toLowerCase() + '/' + (document.activeElement.getAttribute('href') || '?'),
  open: document.querySelector('.nav-dropdown[data-open="true"]') !== null,
}));
console.log('After Tab>Enter>ArrowDown:', after);

// Press Enter to navigate
const nav = page.waitForNavigation({ timeout: 5000 }).catch(e => ({ error: e.message }));
await page.keyboard.press('Enter');
await nav;
console.log('Navigated to:', page.url().replace(BASE, ''));

// Test Escape
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.locator('.nav-dropdown-trigger').first().focus();
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.keyboard.press('Escape');
await page.waitForTimeout(100);
const esc = await page.evaluate(() => ({
  open: document.querySelector('.nav-dropdown')?.getAttribute('data-open'),
  active: document.activeElement.tagName.toLowerCase(),
}));
console.log('After Escape:', esc);

await browser.close();
