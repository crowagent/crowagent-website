// SF43 NU1 + AR2 — Full validation
import { chromium } from 'playwright';
import fs from 'fs';

const BASE = 'http://localhost:8092';
const OUT = 'debug-screenshots/sf43';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// AR2 — z-index validation
const zValidation = await page.evaluate(() => {
  function probe(sel) {
    const el = document.querySelector(sel);
    if (!el) return null;
    return getComputedStyle(el).zIndex;
  }
  // Open the products dropdown so .nav-mega is rendered
  const trigger = document.querySelector('.nav-dropdown-trigger');
  if (trigger) trigger.click();
  return {
    nav: probe('nav'),
    announceBar: probe('.announce-bar'),
    navMega: probe('.nav-mega'),
    navDropdown: probe('.nav-dropdown'),
    // After open, the open-state selector winds. Re-fetch the .nav-mega inside open dropdown
    navMegaOpen: probe('.nav-dropdown[data-open="true"] .nav-mega'),
  };
});
console.log('Z-index after fix:', JSON.stringify(zValidation, null, 2));

// NU1 — Click each item across both dropdowns and verify navigation
const dropdowns = ['Products', 'Free Tools'];
const results = [];

for (const triggerLabel of dropdowns) {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  // Open the right dropdown
  const opened = await page.evaluate((label) => {
    const triggers = Array.from(document.querySelectorAll('.nav-dropdown-trigger'));
    const t = triggers.find(el => el.textContent.trim().startsWith(label));
    if (!t) return { ok: false, reason: 'trigger not found' };
    t.click();
    return {
      ok: true,
      dataOpen: t.closest('.nav-dropdown').getAttribute('data-open'),
      itemCount: t.closest('.nav-dropdown').querySelectorAll('.nav-mega-item').length,
      itemHrefs: Array.from(t.closest('.nav-dropdown').querySelectorAll('.nav-mega-item')).map(a => a.getAttribute('href')),
    };
  }, triggerLabel);

  console.log(`\n=== ${triggerLabel} dropdown ===`);
  console.log('Opened:', opened);

  for (let i = 0; i < opened.itemHrefs.length; i++) {
    const href = opened.itemHrefs[i];
    // Re-open the dropdown each iteration (since navigation closes it)
    if (i > 0) {
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(400);
      await page.evaluate((label) => {
        const triggers = Array.from(document.querySelectorAll('.nav-dropdown-trigger'));
        const t = triggers.find(el => el.textContent.trim().startsWith(label));
        if (t) t.click();
      }, triggerLabel);
      await page.waitForTimeout(200);
    }

    // Click the nth item via DOM and wait for navigation
    const navPromise = page.waitForNavigation({ timeout: 5000 }).catch(e => ({ error: e.message }));
    await page.evaluate(({ idx, label }) => {
      const triggers = Array.from(document.querySelectorAll('.nav-dropdown-trigger'));
      const t = triggers.find(el => el.textContent.trim().startsWith(label));
      if (!t) return;
      const items = t.closest('.nav-dropdown').querySelectorAll('.nav-mega-item');
      items[idx].click();
    }, { idx: i, label: triggerLabel });
    const navResult = await navPromise;
    const navigatedTo = page.url();
    const success = navigatedTo.includes(href);
    results.push({ dropdown: triggerLabel, idx: i, href, navigatedTo: navigatedTo.replace(BASE, ''), success });
    console.log(`  [${i}] ${href} -> ${navigatedTo.replace(BASE, '')} ${success ? 'OK' : 'FAIL'}`);
  }
}

console.log('\n=== Final results ===');
const allOk = results.every(r => r.success);
console.log(`Total items: ${results.length}, all OK: ${allOk}`);
console.log('Console errors:', consoleErrors);

// Screenshot of dropdown open
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.evaluate(() => {
  const t = document.querySelector('.nav-dropdown-trigger');
  if (t) t.click();
});
await page.waitForTimeout(400);
await page.screenshot({ path: OUT + '/dropdown-fix.png', fullPage: false });
console.log('Screenshot saved:', OUT + '/dropdown-fix.png');

await browser.close();
process.exit(allOk && consoleErrors.length === 0 ? 0 : 1);
