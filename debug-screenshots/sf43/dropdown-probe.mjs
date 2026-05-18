// SF43 NU1 — Dropdown click investigation
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf43';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleMsgs = [];
page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => consoleMsgs.push(`[pageerror] ${e.message}`));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// 1. Click the Products trigger
const triggerBox = await page.$eval('.nav-dropdown-trigger', el => {
  const r = el.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2, text: el.textContent.trim().slice(0, 40) };
});
console.log('Products trigger:', triggerBox);

await page.click('.nav-dropdown-trigger', { force: false });
await page.waitForTimeout(300);

const dropdownState = await page.$eval('.nav-dropdown', el => ({
  dataOpen: el.getAttribute('data-open'),
  ariaExpanded: el.querySelector('.nav-dropdown-trigger')?.getAttribute('aria-expanded'),
}));
console.log('Dropdown state after click:', dropdownState);

// Take screenshot of dropdown open
await page.screenshot({ path: OUT + '/dropdown-open.png', fullPage: false });

// 2. Probe the visible mega-menu
const megaInfo = await page.$eval('.nav-dropdown[data-open="true"] .nav-mega', el => {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    display: s.display,
    visibility: s.visibility,
    opacity: s.opacity,
    pointerEvents: s.pointerEvents,
    zIndex: s.zIndex,
    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
  };
});
console.log('Mega panel state:', megaInfo);

// 3. Find the first mega-item link
const itemInfo = await page.$eval('.nav-dropdown[data-open="true"] .nav-mega-item', el => {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    href: el.getAttribute('href'),
    display: s.display,
    pointerEvents: s.pointerEvents,
    zIndex: s.zIndex,
    rect: { x: r.x, y: r.y, w: r.width, h: r.height },
  };
});
console.log('First mega-item:', itemInfo);

// 4. document.elementFromPoint at centre of first mega-item
const elFromPt = await page.evaluate((pt) => {
  const e = document.elementFromPoint(pt.x, pt.y);
  if (!e) return null;
  let chain = [];
  let cur = e;
  while (cur && chain.length < 6) {
    chain.push({
      tag: cur.tagName.toLowerCase(),
      id: cur.id || null,
      cls: (typeof cur.className === 'string' ? cur.className : '').slice(0, 80),
      zIndex: getComputedStyle(cur).zIndex,
      pointerEvents: getComputedStyle(cur).pointerEvents,
    });
    cur = cur.parentElement;
  }
  return chain;
}, { x: itemInfo.rect.x + itemInfo.rect.w / 2, y: itemInfo.rect.y + itemInfo.rect.h / 2 });
console.log('elementFromPoint chain at item centre:');
console.log(JSON.stringify(elFromPt, null, 2));

// 5. Try clicking via Playwright `click` — capture whether it navigates
const navigationPromise = page.waitForNavigation({ timeout: 3000 }).catch(e => ({ error: e.message }));
await page.click('.nav-dropdown[data-open="true"] .nav-mega-item', { force: false });
const navResult = await navigationPromise;
console.log('Navigation after click:', navResult === undefined || navResult.error ? `failed: ${navResult?.error}` : `success: ${page.url()}`);

// 6. Try elementFromPoint after clicking — what was on top
console.log('Final URL:', page.url());
console.log('Console messages during interaction:', consoleMsgs);

await page.screenshot({ path: OUT + '/after-click.png', fullPage: false });

await browser.close();
console.log('Done.');
