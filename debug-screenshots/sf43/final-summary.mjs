// SF43 NU1 + AR2 final summary
import { chromium } from 'playwright';
const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf43';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Click Products dropdown trigger
await page.evaluate(() => {
  const t = Array.from(document.querySelectorAll('.nav-dropdown-trigger')).find(el => el.textContent.trim().startsWith('Products'));
  if (t) t.click();
});
await page.waitForTimeout(500);

// Capture state
const summary = await page.evaluate(() => {
  const probe = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return getComputedStyle(el).zIndex;
  };
  return {
    nav: probe('nav'),
    announceBar: probe('.announce-bar'),
    navMega: probe('.nav-mega'),
    navDropdown: probe('.nav-dropdown'),
    productsDropOpen: document.querySelector('.nav-dropdown[data-open="true"]') !== null,
  };
});
console.log('Final state summary:');
console.log('  nav z-index:', summary.nav, '(--z-nav = 200)');
console.log('  announce-bar z-index:', summary.announceBar);
console.log('  nav-mega z-index:', summary.navMega, '(--z-mega = 300, was 1010)');
console.log('  nav-dropdown z-index:', summary.navDropdown, '(--z-nav = 200, was 1000)');
console.log('  Products dropdown open:', summary.productsDropOpen);

// Screenshot of Products open
await page.screenshot({ path: OUT + '/dropdown-fix.png', clip: { x: 0, y: 0, width: 1440, height: 500 } });
console.log('\nScreenshot saved:', OUT + '/dropdown-fix.png');

await browser.close();
