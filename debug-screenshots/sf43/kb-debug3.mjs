import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Open the dropdown via click first
await page.locator('.nav-dropdown-trigger').first().click();
await page.waitForTimeout(300);

// Now try to focus the first menuitem via JS
const focusResult = await page.evaluate(() => {
  const item = document.querySelector('.nav-dropdown[data-open="true"] [role="menuitem"]');
  if (!item) return { ok: false, reason: 'no item' };
  const r = item.getBoundingClientRect();
  item.focus();
  return {
    ok: true,
    visible: r.width > 0 && r.height > 0,
    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
    activeTagAfter: document.activeElement.tagName.toLowerCase(),
    activeHrefAfter: document.activeElement.getAttribute('href'),
    tabIndex: item.tabIndex,
  };
});
console.log('Focus item via JS:', focusResult);

// Now try ArrowDown — this should work even on the trigger
await page.locator('.nav-dropdown-trigger').first().focus();
await page.waitForTimeout(100);
await page.keyboard.press('ArrowDown');
await page.waitForTimeout(200);

const downState = await page.evaluate(() => ({
  activeTag: document.activeElement.tagName.toLowerCase(),
  activeHref: document.activeElement.getAttribute('href'),
  dropOpen: document.querySelector('.nav-dropdown')?.getAttribute('data-open'),
}));
console.log('After ArrowDown on closed trigger:', downState);

await browser.close();
