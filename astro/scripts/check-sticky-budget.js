#!/usr/bin/env node
/**
 * check-sticky-budget.js — how much of the window is permanently held by
 * docked sticky furniture, measured on the rendered page.
 *
 * ── THE REPORT THIS EXISTS FOR (A-259) ──────────────────────────────────────
 *
 * An external audit noted that /pricing carries two stacked sticky elements.
 * Its own figure, "over 20 percent on a 900px laptop", did not reproduce: the
 * desktop stack is 133px, which is 14.8 percent. Measuring it properly found
 * the real defect one class of device over. On a 390x844 phone the bar wraps
 * to two rows and the stack is 189px, 22.4 percent of the window, and on a
 * 360x800 android it is 23.6 percent. A fifth of the screen was permanently
 * held on the one page a reader is comparing cards on.
 *
 * ── WHAT IS MEASURED, AND HOW EACH INSTRUMENT CAN FAIL ──────────────────────
 *
 * DOCKED, NOT DECLARED. A rule saying `position: sticky` proves nothing about
 * what a reader loses: the element may be short, may not have reached its
 * dock, or may be `display: none` at that width. So the page is SCROLLED first
 * and the measurement is taken from `getBoundingClientRect()` on what is
 * actually parked against the top of the window. A guard that grepped the
 * stylesheet for `position: sticky` would have passed the defect unchanged,
 * because the defect was never in whether the rule existed. It was in how tall
 * the thing became at 390px.
 *
 * THE BAND IS CONTIGUOUS FROM THE TOP, so a sticky element parked lower down,
 * or one that scrolls with the page, is not counted as furniture the reader
 * cannot get rid of. Summing every sticky element on the page instead would
 * charge the page for things it does not hold.
 *
 * TWO ASSERTIONS, BECAUSE EITHER ALONE PASSES A REAL DEFECT:
 *
 *   1. A SHARE BUDGET at every viewport. This is the reader's actual
 *      complaint, stated as the number they would feel.
 *   2. AT MOST ONE BAR MAY DOCK ON A NARROW VIEWPORT. The share budget alone
 *      is satisfied by a second bar that happens to be short, which would
 *      reintroduce the stacking this was raised about and pass. The count is
 *      the decision, the share is the consequence.
 *
 * A FLOOR, BECAUSE EVERY RULE ABOVE PASSES TRIVIALLY ON AN EMPTY PAGE. If the
 * nav stops being found, or the route stops rendering, nothing docks and a
 * clean run is reported over a page that was never measured. The nav is
 * required to be present and docked at every viewport, and the elements the
 * page is known to carry are required to exist in the DOM, so a rename fails
 * here rather than going quiet.
 *
 * ── SCOPE ───────────────────────────────────────────────────────────────────
 *
 * The routes below and nothing else. crowmark.astro's `.subnav` carries the
 * same `top: 0` defect pricing.astro's comment already records, and it is NOT
 * added here, because widening this to every route would redden whatever it
 * finds and that is a decision to take deliberately rather than as a side
 * effect of closing one row.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/* The budget, as a share of the window height. 18 percent sits above what a
   single 73px nav costs on every device below (8.6 percent on the shortest)
   and above the 133px desktop stack at 14.8 percent, and below every figure
   the defect produced, the smallest of which was 20.3 percent. It is a
   ceiling on furniture, not a target. */
const BUDGET_PCT = 18;

/* Below this width a reader gets ONE docked bar. 767 is pricing.astro's own
   narrow breakpoint and the width its media query uses. */
const NARROW_MAX = 767;
const MAX_DOCKED_NARROW = 1;

const VIEWPORTS = [
  { w: 360, h: 800, name: 'small android' },
  { w: 390, h: 844, name: 'iPhone 13' },
  { w: 430, h: 932, name: 'iPhone Pro Max' },
  { w: 768, h: 1024, name: 'iPad portrait' },
  { w: 1440, h: 900, name: 'laptop' },
];

/* Routes, with the furniture each is known to carry. The selectors are a
   FLOOR: if one stops matching, this gate has gone blind and says so. */
const ROUTES = [
  { route: '/pricing/', carries: ['#ca-nav', '.bar'] },
];

const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.json': 'application/json',
};

if (!fs.existsSync(DIST)) {
  console.error('sticky-budget: no dist/. Build first.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let f = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) {
    res.writeHead(404);
    return res.end();
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  return fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

/* Runs in the page, AFTER a scroll, so everything that docks has docked. */
const MEASURE = (carries) => {
  const vh = window.innerHeight;
  const stuck = [];
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.position !== 'sticky' && cs.position !== 'fixed') continue;
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    /* TEXTURE IS NOT FURNITURE, AND THE FIRST VERSION OF THIS GATE GOT IT
       WRONG. Base.astro fixes two full-window decorative layers behind every
       route, `.sv-page-grain` and `.sv-progress`. Both are `position: fixed`
       and the grain is the full height of the window, so a naive sweep of
       fixed elements reported the docked stack as 100 percent of the window
       on all five viewports and would have failed a page with no defect at
       all. Neither costs the reader anything: they are `aria-hidden` and
       `pointer-events: none`, which is Base.astro's own stated contract for
       them, "It is texture." Those two properties are the test rather than a
       list of class names, so a third decorative layer is handled without
       this gate needing to know it was added. */
    if (el.getAttribute('aria-hidden') === 'true') continue;
    if (cs.pointerEvents === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.height < 8 || r.width < 40) continue;
    /* Only what is parked against the top of the window. A sticky element
       further down the page is not furniture the reader is carrying. */
    if (r.top > vh * 0.35) continue;
    stuck.push({
      sig: `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}.${[...el.classList].filter((c) => !/^astro-/.test(c)).join('.')}`.replace(/\.$/, ''),
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      height: Math.round(r.height),
      position: cs.position,
    });
  }
  stuck.sort((a, b) => a.top - b.top);

  /* Walk the contiguous band down from y=0. A gap means the next element is
     not part of the furniture the reader cannot scroll away. */
  const band = [];
  let edge = 0;
  for (const s of stuck) {
    if (s.top <= edge + 2) {
      band.push(s);
      edge = Math.max(edge, s.bottom);
    }
  }
  return {
    band,
    stackPx: Math.round(edge),
    vh,
    pct: +((edge / vh) * 100).toFixed(1),
    present: carries.map((sel) => ({ sel, found: Boolean(document.querySelector(sel)) })),
  };
};

const violations = [];
let measured = 0;

const browser = await chromium.launch();

console.log('\n' + '='.repeat(100));
console.log(`STICKY BUDGET — docked furniture must stay under ${BUDGET_PCT}% of the window,`);
console.log(`                and at most ${MAX_DOCKED_NARROW} bar may dock at or below ${NARROW_MAX}px`);
console.log('='.repeat(100) + '\n');

for (const r of ROUTES) {
  for (const v of VIEWPORTS) {
    const page = await browser.newPage({
      viewport: { width: v.w, height: v.h },
      reducedMotion: 'reduce',
    });
    const resp = await page.goto(base + r.route, { waitUntil: 'load' });
    /* A 404 page has furniture too, and would yield plausible numbers that mean
       nothing. Assert the status before measuring anything. */
    if (!resp || resp.status() !== 200) {
      violations.push(`${r.route} returned ${resp ? resp.status() : 'no response'} at ${v.w}x${v.h}, so nothing below was measured`);
      await page.close();
      continue;
    }
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(250);
    const out = await page.evaluate(MEASURE, r.carries);
    await page.close();

    const missing = out.present.filter((p) => !p.found);
    if (missing.length) {
      violations.push(
        `${r.route} at ${v.w}x${v.h}: ${missing.map((m) => m.sel).join(', ')} matched nothing. This gate names ` +
        `that element as furniture it is measuring, so either it is gone, in which case drop it from the route ` +
        `entry, or it was renamed, in which case this gate has been blind since the rename`,
      );
      continue;
    }

    measured += 1;
    const narrow = v.w <= NARROW_MAX;
    const overBudget = out.pct > BUDGET_PCT;
    const overCount = narrow && out.band.length > MAX_DOCKED_NARROW;
    const ok = !overBudget && !overCount;

    console.log(
      `  ${ok ? 'PASS' : 'FAIL'}  ${r.route}  ${String(v.w).padStart(4)}x${String(v.h).padEnd(4)}  ` +
      `${out.band.length} docked, ${String(out.stackPx).padStart(3)}px of ${out.vh} = ${String(out.pct).padStart(5)}%  ` +
      `[${out.band.map((b) => `${b.sig} ${b.height}px`).join(' + ') || 'nothing'}]  ${v.name}`,
    );

    if (overBudget) {
      violations.push(
        `${r.route} at ${v.w}x${v.h} (${v.name}): docked furniture is ${out.stackPx}px of a ${out.vh}px window, ` +
        `${out.pct}% against a ${BUDGET_PCT}% budget. Stack: ${out.band.map((b) => `${b.sig} ${b.height}px`).join(' + ')}`,
      );
    }
    if (overCount) {
      violations.push(
        `${r.route} at ${v.w}x${v.h} (${v.name}): ${out.band.length} bars dock at or below ${NARROW_MAX}px and only ` +
        `${MAX_DOCKED_NARROW} may. Stacking a second bar over the nav on a phone is the defect A-259 was raised for, ` +
        `and a short second bar passes the share budget while reintroducing it. Stack: ` +
        `${out.band.map((b) => `${b.sig} ${b.height}px`).join(' + ')}`,
      );
    }
  }
}

await browser.close();
server.close();

/* THE FLOOR. Every rule above is satisfied by there being nothing to measure. */
const expected = ROUTES.length * VIEWPORTS.length;
if (measured < expected) {
  violations.push(
    `floor — ${measured} of ${expected} route/viewport pair(s) were measured. The rest reported nothing, and ` +
    `every assertion above passes trivially on a page that did not render`,
  );
}

console.log(`\n  ${measured} of ${expected} route/viewport pair(s) measured`);

if (violations.length) {
  console.error(`\nsticky-budget: ${violations.length} violation(s)\n`);
  for (const v of violations) console.error(`  - ${v}`);
  console.error('');
  process.exit(1);
}

console.log('\nsticky-budget: clean\n');
