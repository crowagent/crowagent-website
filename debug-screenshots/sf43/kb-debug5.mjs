import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Inject our own diagnostic into the trigger's keydown handler
const result = await page.evaluate(() => {
  const trigger = document.querySelector('.nav-dropdown-trigger');
  const dropdown = trigger.closest('.nav-dropdown');
  const mega = dropdown.querySelector('.nav-mega');
  const items = mega ? Array.prototype.slice.call(mega.querySelectorAll('[role="menuitem"]')) : [];

  // Try focus directly on items[0]
  const before = document.activeElement.tagName.toLowerCase();
  items[0].focus();
  const after = document.activeElement.tagName.toLowerCase();
  const afterHref = document.activeElement.getAttribute('href');

  return {
    itemCount: items.length,
    firstHref: items[0]?.getAttribute('href'),
    firstTagName: items[0]?.tagName.toLowerCase(),
    firstTabIndex: items[0]?.tabIndex,
    firstHidden: items[0]?.hasAttribute('hidden'),
    firstAriaHidden: items[0]?.getAttribute('aria-hidden'),
    firstDisplay: getComputedStyle(items[0]).display,
    firstVisibility: getComputedStyle(items[0]).visibility,
    parentDisplay: getComputedStyle(items[0].parentElement).display,
    parentVisibility: getComputedStyle(items[0].parentElement).visibility,
    megaDisplay: getComputedStyle(mega).display,
    megaVisibility: getComputedStyle(mega).visibility,
    megaOpacity: getComputedStyle(mega).opacity,
    activeBeforeFocus: before,
    activeAfterFocus: after,
    activeAfterHref: afterHref,
  };
});
console.log('Result:', JSON.stringify(result, null, 2));

await browser.close();
