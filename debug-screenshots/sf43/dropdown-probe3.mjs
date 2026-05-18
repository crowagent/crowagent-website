// SF43 NU1 — Dropdown handler attachment investigation
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleMsgs = [];
page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => consoleMsgs.push(`[pageerror] ${e.message}`));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Patch the trigger to log when click handlers fire
const handlerDiag = await page.evaluate(() => {
  const t = document.querySelector('.nav-dropdown-trigger');
  if (!t) return { ok: false };

  // Add our own listener to confirm the event bubbles
  let captured = false;
  let bubbled = false;
  t.addEventListener('click', () => { captured = true; }, true);
  t.addEventListener('click', () => { bubbled = true; }, false);

  // Get DOM structure around the trigger
  const dropdown = t.closest('.nav-dropdown');
  const mega = dropdown ? dropdown.querySelector('.nav-mega') : null;

  // Now simulate a click event
  t.click();

  return {
    ok: true,
    captured,
    bubbled,
    dataOpenAfter: dropdown ? dropdown.getAttribute('data-open') : null,
    ariaExpandedAfter: t.getAttribute('aria-expanded'),
    hasParentNav: !!t.closest('nav'),
    hasParentHeader: !!t.closest('header'),
    dropdownChildren: dropdown ? Array.from(dropdown.children).map(c => c.tagName.toLowerCase() + '.' + (typeof c.className === 'string' ? c.className : '')) : [],
  };
});
console.log('handlerDiag:', JSON.stringify(handlerDiag, null, 2));

// Now manually re-wire the dropdown and try again
const rewireResult = await page.evaluate(() => {
  // Simulate what scripts.js should be doing
  var dropdowns = document.querySelectorAll('.nav-dropdown');
  let wireCount = 0;
  dropdowns.forEach(function(dropdown) {
    var trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      var open = dropdown.getAttribute('data-open') === 'true';
      dropdown.setAttribute('data-open', open ? 'false' : 'true');
      trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
    wireCount++;
  });

  // Now click
  const t = document.querySelector('.nav-dropdown-trigger');
  t.click();
  return {
    wireCount,
    dataOpenAfter: t.closest('.nav-dropdown').getAttribute('data-open'),
  };
});
console.log('After manual rewire + click:', rewireResult);

console.log('Console messages:', consoleMsgs);
await browser.close();
