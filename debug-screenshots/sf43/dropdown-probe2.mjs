// SF43 NU1 — Dropdown click investigation v2
import { chromium } from 'playwright';

const BASE = 'http://localhost:8092';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleMsgs = [];
page.on('console', m => consoleMsgs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', e => consoleMsgs.push(`[pageerror] ${e.message}`));

await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// inspect placement of nav + announce-bar + dropdown trigger
const layout = await page.evaluate(() => {
  function box(sel) {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 60),
      rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      position: s.position,
      zIndex: s.zIndex,
      pointerEvents: s.pointerEvents,
      display: s.display,
    };
  }
  return {
    announce: box('.announce-bar'),
    nav: box('nav'),
    header: box('header'),
    firstDropdown: box('.nav-dropdown'),
    trigger: box('.nav-dropdown-trigger'),
    triggers: Array.from(document.querySelectorAll('.nav-dropdown-trigger')).map(t => ({
      text: t.textContent.trim().slice(0, 20),
      rect: t.getBoundingClientRect(),
    })),
    elAtTriggerCenter: (() => {
      const t = document.querySelector('.nav-dropdown-trigger');
      if (!t) return null;
      const r = t.getBoundingClientRect();
      const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      if (!e) return null;
      const chain = [];
      let cur = e;
      while (cur && chain.length < 5) {
        chain.push({
          tag: cur.tagName.toLowerCase(),
          id: cur.id,
          cls: (typeof cur.className === 'string' ? cur.className : '').slice(0, 80),
          zIndex: getComputedStyle(cur).zIndex,
        });
        cur = cur.parentElement;
      }
      return chain;
    })(),
  };
});
console.log('Layout:', JSON.stringify(layout, null, 2));

// Send a real click event with proper bubbling
const result = await page.evaluate(() => {
  const t = document.querySelector('.nav-dropdown-trigger');
  if (!t) return { ok: false, reason: 'no trigger' };
  t.click();
  return {
    ok: true,
    dropdownState: t.closest('.nav-dropdown').getAttribute('data-open'),
    ariaExpanded: t.getAttribute('aria-expanded'),
  };
});
console.log('After JS .click():', result);

await page.waitForTimeout(400);

// Re-check after wait
const after = await page.evaluate(() => {
  const d = document.querySelector('.nav-dropdown');
  const t = d ? d.querySelector('.nav-dropdown-trigger') : null;
  return {
    dataOpen: d ? d.getAttribute('data-open') : null,
    ariaExpanded: t ? t.getAttribute('aria-expanded') : null,
  };
});
console.log('State 400ms later:', after);

// Look at how many dropdowns + handlers are wired
const handlers = await page.evaluate(() => {
  return {
    dropdownCount: document.querySelectorAll('.nav-dropdown').length,
    triggerCount: document.querySelectorAll('.nav-dropdown-trigger').length,
    megaCount: document.querySelectorAll('.nav-mega').length,
    navReady: window.__caNavReady || 'unknown',
  };
});
console.log('Handlers:', handlers);

console.log('Console messages:', consoleMsgs);
await browser.close();
