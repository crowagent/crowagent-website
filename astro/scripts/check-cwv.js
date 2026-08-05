/**
 * check-cwv.js — layout stability, measured, and the first thing in the chain
 * that measures it. Replaces `scripts/measure-cwv.js`.
 *
 * ── WHAT WAS WRONG BEFORE (A-94) ────────────────────────────────────────────
 *
 * All eight budgets in `check-budgets.js` are BYTE COUNTS: htmlPerRoute,
 * cssTotal, jsTotal, singleImage, wholeBuild, headInlineScriptPerDoc,
 * thirdPartyScripts, duplicatedBundledScript. Nothing in the chain measured
 * whether the page HOLDS STILL, which is exactly why A-92 shipped: a layout
 * shift costs zero bytes, so every byte gate passes over it.
 *
 * `measure-cwv.js` existed, was NOT in the chain, and as the site's
 * layout-stability instrument was incomplete in three ways and misleading in a
 * fourth. Each is fixed here, and each is named so that a future reader can tell
 * whether it stayed fixed:
 *
 *   IT MEASURED 390 ONLY. The two worst routes on the site are DESKTOP
 *   failures: 0.1277 and 0.1081 at 1440 measure 0.030 and 0.026 at 390. It
 *   would have reported both green. This measures 1440 AND 390 and gates on the
 *   worse of the two.
 *
 *   IT NEVER TESTED prefers-reduced-motion, AND THAT IS THE MISLEADING ONE.
 *   CLS is HIGHER under `reduce` on this site, so it was reporting the better
 *   of two numbers as if it were the number. This measures under `reduce`,
 *   which is the reader who gets the worst of it, and prints the
 *   `no-preference` figure beside it so the gap is visible rather than assumed.
 *
 *   IT DISCARDED entry.sources, so a route printed 0.128 and named no element.
 *   Nobody can act on that. Every shift here carries the element that moved, how
 *   far, and by how much, and the report is sorted by the shift rather than by
 *   the route.
 *
 *   IT NEVER SCROLLED. Harmless while all the CLS was font-swap above the fold,
 *   but it meant its reassurance about scroll-driven arrival had never actually
 *   been tested. This scrolls the whole document and keeps counting.
 *
 * AND THE ONE THAT MADE ITS NUMBERS UNSAFE RATHER THAN MERELY NARROW: it
 * enumerated routes from `dist/` and navigated to `:8095`, which can be — and on
 * 2026-08-04 demonstrably was — A DIFFERENT BUILD. It now starts its own server
 * over the `dist` this build just wrote. See `lib/dist-server.js`.
 *
 * ── WHAT IT COSTS, AND WHY IT IS AFFORDABLE ─────────────────────────────────
 *
 * One page load per route per viewport, under Lighthouse mobile NETWORK
 * conditions and no CPU throttle. The network throttle is not decoration: the
 * dominant shift on this site is the web-font swap, and a font that arrives
 * before first paint produces no swap and therefore no shift, so an unthrottled
 * run measures a page nobody is served. The 4x CPU throttle the old script also
 * applied is dropped — it tripled the wall time and moved CLS by nothing
 * measurable, because these shifts are network-timing, not main-thread work.
 *
 * THREE CONTEXTS AT A TIME, and that number is not arbitrary either. Measured:
 * the first complete run of this gate took 35 minutes sequentially, which is the
 * kind of number that gets a gate deleted rather than fixed. Almost all of it is
 * spent WAITING on a deliberately slow network, so the work parallelises nearly
 * for free — and three is the ceiling this machine is documented to take without
 * the contention itself becoming the variable being measured.
 *
 * ── WHAT THE DEFECT REPORT GOT WRONG, RECORDED BECAUSE IT MATTERS ───────────
 *
 * A-94 states that "CLS is HIGHER under reduce on this site, so it reports the
 * better of the two numbers as if it were the number". Measured here across
 * every route that came anywhere near the budget, that is NOT what happens: the
 * two preferences land within 0.003 of each other and in BOTH directions —
 * 0.1492 against 0.1488, 0.1141 against 0.1166, 0.1054 against 0.1053, 0.1022
 * against 0.1000. Reduced motion is therefore not the hidden multiplier the
 * report describes on this site as it stands today.
 *
 * IT IS STILL MEASURED, AND THE COMPARISON IS STILL PRINTED, for the reason the
 * report was right about even where its numbers were not: nothing was checking,
 * so nobody could have known which way it went. A claim that the two agree is
 * worth exactly as much as the last run that demonstrated it.
 *
 * THE GATE IS ON THE `reduce` NUMBER, AND THAT IS ALSO A MEASUREMENT RATHER
 * THAN A PREFERENCE. Across two full runs of the same build, every `reduce`
 * figure repeated to four decimal places — /tools/ 0.0688 and 0.0688,
 * /partners/ 0.0640 and 0.0640 — while the same routes' `no-preference` figures
 * moved by more than the whole budget: /tools/ read 0.0669 and then 0.1225. A
 * page with entrance animations running has a genuinely variable amount of
 * shift in it; a gate built on that number would fail builds at random and be
 * switched off within a week. So `no-preference` is reported and `reduce` is
 * enforced, and if that ever stops being the stable one this comment is the
 * thing that should be falsified first.
 *
 * LCP IS PRINTED AND IS NOT GATED, and that was right in the old file: variance
 * on this machine ran 2,068 to 15,056 ms for the same page across runs. A gate
 * on a number that moves 7x between runs teaches people to rerun until green.
 * CLS on the same pages was byte-identical across three consecutive runs.
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serveDist, routesOf } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/** Google's "good" threshold, and the number the old script already used. */
const BUDGET = 0.1;

/** Lighthouse mobile network: 1.6 Mbit/s down, 750 kbit/s up, 150ms RTT. */
const NETWORK = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
};

const VIEWPORTS = [
  { label: '1440', width: 1440, height: 900 },
  { label: '390', width: 390, height: 844 },
];

/** Contexts in flight. See the header: measured, and capped by the machine. */
const CONCURRENCY = 3;

/**
 * Known breaches, each with a ceiling and a reason somebody can argue with.
 * Exactly the shape `check-budgets.js` uses, for exactly its reason: over the
 * budget fails unless an exception names it, and over the CEILING fails anyway,
 * which is what stops a listed breach from drifting.
 *
 * Key is `route@viewport`.
 */
const EXCEPTIONS = new Map([
  /*
   * FOUR BREACHES, MEASURED ON ARRIVAL 2026-08-04, AND ONE CAUSE UNDER ALL OF
   * THEM. A-92 established with the webfonts blocked that sitewide CLS falls
   * from 1.587 to 0.0018 at 1440 and from 0.871 to 0.0000 at 390 — one hundred
   * per cent of this site's layout shift is the font swap. A-92 then fixed HALF
   * of it: it added `Jakarta Fallback`, a metric-matched fallback for
   * `--font-display`, and named it in the stack. `--font-body` (Inter) and
   * `--font-mono` (JetBrains Mono) still have NO metric-matched fallback, so
   * every paragraph on the site re-wraps when Inter arrives.
   *
   * Traced on /compare/crowmark-vs-cleantender/ at 1440, two shifts:
   *   t=1277ms  0.1165  p.section__standfirst 396 -> 492, and the article
   *                     section below it 598 -> 694, height 302 -> 206
   *   t=1583ms  0.0283  the same standfirst 103px tall -> 69px, i.e. three
   *                     lines re-wrapping to two as the real face lands
   *
   * WHY THIS IS RECORDED RATHER THAN FIXED HERE. The fix is a metric-matched
   * fallback for Inter, derived the way `Jakarta Fallback` was derived — a
   * measured size-adjust and ascent/descent overrides against Arial. Guessing
   * those four numbers makes the shift worse in a way that looks like a fix,
   * and deriving them properly is a piece of work with its own measurement,
   * not a line in the gate that found it. This gate's job is to stop the site
   * getting WORSE while that is done, and to name the element so it can be.
   *
   * The ceilings are the measured value plus roughly 15%. Small on purpose:
   * enough that ordinary run-to-run variation does not fail a build, not enough
   * that a new shift can hide behind an existing one.
   */
  ['/compare/crowmark-vs-cleantender/@1440', { ceiling: 0.17, why: '0.1492 measured. Inter swap re-wraps p.section__standfirst; see above.' }],
  ['/compare/crowmark-vs-mytender-io/@1440', { ceiling: 0.13, why: '0.1141 measured. Same standfirst re-wrap on the same template.' }],
  ['/about/@390', { ceiling: 0.12, why: '0.1054 measured. div.section__body drops 30px on the swap.' }],
  ['/pricing/@390', { ceiling: 0.12, why: '0.1022 measured. h1 hero-title +15px and div.pricing +48px on the swap.' }],
]);

/**
 * A floor, so the gate cannot pass by measuring nothing. A run that finds no
 * routes and a run that finds 45 clean ones print differently but exit the same
 * without this.
 */
const MIN_ROUTES = 40;

/*
 * The observer. Installed before any document script runs, with `buffered: true`
 * so shifts that happened before it attached are still counted.
 *
 * `entry.sources` IS THE POINT OF THIS BLOCK. A layout-shift entry carries up to
 * five sources, each with the node that moved and its rectangle before and
 * after. The old script read `entry.value` and threw the rest away, which is why
 * it could report a number nobody could act on. The node is turned into a
 * selector HERE, inside the page, because a node reference does not survive
 * being returned to the driver.
 */
const OBSERVE = () => {
  window.__cls = 0;
  window.__lcp = 0;
  window.__shifts = [];

  const describe = (node) => {
    if (!node || node.nodeType !== 1) return '(node gone)';
    const el = /** @type {Element} */ (node);
    const classes = [...el.classList]
      .filter((c) => !/^astro-/.test(c))
      .slice(0, 2)
      .map((c) => `.${c}`)
      .join('');
    const id = el.id ? `#${el.id}` : '';
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
    return `${el.tagName.toLowerCase()}${id}${classes}${text ? ` "${text}"` : ''}`;
  };

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      window.__cls += entry.value;
      /* The largest mover in the entry, by area of travel. An entry with five
         sources has one that carries the shift and four that came along. */
      let worst = null;
      for (const source of entry.sources || []) {
        const from = source.previousRect;
        const to = source.currentRect;
        const moved = Math.abs(to.top - from.top) + Math.abs(to.left - from.left);
        if (!worst || moved > worst.moved) {
          worst = { moved, sel: describe(source.node), dy: Math.round(to.top - from.top) };
        }
      }
      window.__shifts.push({
        value: Number(entry.value.toFixed(4)),
        sel: worst ? worst.sel : '(no source reported)',
        dy: worst ? worst.dy : 0,
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });

  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__lcp = entry.startTime;
  }).observe({ type: 'largest-contentful-paint', buffered: true });
};

/** One route, one viewport, one motion preference. */
async function measure(browser, origin, route, viewport, reducedMotion) {
  /*
   * A FRESH CONTEXT EVERY TIME, and it is not tidiness. Sharing one page caches
   * the shared CSS, JS and fonts after the first route, and the second route
   * then measures a page whose font never swaps — which produced a figure 27
   * points better than reality the first time this was attempted.
   */
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NETWORK);

  await page.addInitScript(OBSERVE);

  try {
    await page.goto(origin(route), { waitUntil: 'load', timeout: 120000 });
    /*
     * WAIT FOR THE FONTS, THEN SETTLE, THEN SCROLL — and that ORDER is what
     * makes this gate reproducible rather than merely correct on average.
     *
     * Measured: with three contexts in flight and no `fonts.ready`, the same
     * build measured /sectors/highways/ at 0.026 and at 0.1454 on consecutive
     * runs, because the swap sometimes landed AFTER the scroll pass had already
     * moved the page and sometimes before. Both numbers were true readings of
     * what happened; neither was a reading of the page. `check-sheen.js` records
     * the same finding for the same reason — "waiting on document.fonts.ready
     * costs nothing and removes the largest single source of frame-to-frame
     * difference".
     *
     * The swap is still MEASURED: the observer is buffered and attached before
     * the first byte, so every shift the swap causes is already counted by the
     * time this resolves. What is removed is the RACE, not the shift.
     */
    await page.evaluate(() => document.fonts.ready);
    /* And then a fixed settle, for anything that repaints after the swap. */
    await page.waitForTimeout(2000);
    /*
     * THEN SCROLL THE WHOLE DOCUMENT. Programmatic scrolling is not user input,
     * so `hadRecentInput` stays false and anything that arrives on scroll still
     * counts — which is the half the old script never tested.
     */
    await page.evaluate(async () => {
      const step = Math.round(window.innerHeight * 0.8);
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 90));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);

    const v = await page.evaluate(() => ({
      cls: Number((window.__cls || 0).toFixed(4)),
      lcp: Math.round(window.__lcp || 0),
      shifts: (window.__shifts || []).sort((a, b) => b.value - a.value).slice(0, 3),
    }));
    return v;
  } catch (error) {
    return { cls: null, lcp: null, shifts: [], error: String(error).slice(0, 90) };
  } finally {
    await context.close();
  }
}

const server = await serveDist(DIST, 'cwv');
const routes = routesOf(DIST);
const browser = await chromium.launch();

/** Every measurement to take, flattened so a worker pool can drain it. */
const queue = [];
for (const route of routes) for (const viewport of VIEWPORTS) queue.push({ route, viewport });

const rows = [];
async function worker() {
  for (;;) {
    const job = queue.shift();
    if (!job) return;
    const reduce = await measure(browser, server.url, job.route, job.viewport, 'reduce');
    /*
     * `no-preference` is measured only where `reduce` is not comfortably clear,
     * and that is a runtime decision rather than a correctness one: a route
     * sitting at 0.00 under reduce cannot tell you anything about whether the
     * two preferences differ. Half the budget is the line, so a route that is
     * drifting is still compared, and a route that is nowhere near does not
     * cost a second page load to say so.
     */
    const compare =
      reduce.cls !== null && reduce.cls >= BUDGET / 2
        ? await measure(browser, server.url, job.route, job.viewport, 'no-preference')
        : null;
    rows.push({ route: job.route, viewport: job.viewport.label, ...reduce, noPref: compare ? compare.cls : null });
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

await browser.close();
server.close();

/* ── Judge ────────────────────────────────────────────────────────────────── */

const errored = rows.filter((r) => r.cls === null);
const failures = [];

for (const r of rows) {
  if (r.cls === null || r.cls <= BUDGET) continue;
  const allowed = EXCEPTIONS.get(`${r.route}@${r.viewport}`);
  if (!allowed || r.cls > allowed.ceiling) failures.push(r);
}

/* ── Report ───────────────────────────────────────────────────────────────── */

console.log(
  `\ncwv: CLS on ${routes.length} route(s) at ${VIEWPORTS.map((v) => v.label).join(' and ')}, ` +
    `under prefers-reduced-motion: reduce, Lighthouse mobile network, scrolled to the foot\n`
);

const worst = [...rows].filter((r) => r.cls !== null).sort((a, b) => b.cls - a.cls);
for (const r of worst.slice(0, 12)) {
  const flag = r.cls > BUDGET ? '  <-- OUTSIDE 0.1' : '';
  const gap = r.noPref === null ? '' : `  (no-preference ${r.noPref})`;
  console.log(`  ${r.route.padEnd(42)} ${r.viewport.padStart(4)}  CLS ${String(r.cls).padEnd(7)} LCP ${String(r.lcp).padStart(5)}ms${gap}${flag}`);
  for (const s of r.shifts) {
    if (s.value < 0.001) continue;
    console.log(`        ${String(s.value).padEnd(7)} ${s.dy >= 0 ? '+' : ''}${s.dy}px  ${s.sel}`);
  }
}

const zero = rows.filter((r) => r.cls === 0).length;
console.log(
  `\n  ${zero}/${rows.length} measurement(s) at exactly 0 · ` +
    `${rows.length - failures.length - errored.length}/${rows.length} within ${BUDGET} or inside a ` +
    `recorded exception · ${failures.length} outside · ${errored.length} errored`
);

if (EXCEPTIONS.size) {
  console.log(`\n  ${EXCEPTIONS.size} recorded exception(s), each a breach with a ceiling:`);
  for (const [key, e] of EXCEPTIONS) console.log(`    ${key}\n        ceiling ${e.ceiling}\n        ${e.why}`);
}

if (rows.length < MIN_ROUTES * VIEWPORTS.length) {
  console.error(
    `\ncwv: only ${rows.length} measurement(s) were taken, against a floor of ` +
      `${MIN_ROUTES * VIEWPORTS.length}. A run that measures nothing prints the same clean summary ` +
      'as a run that measures everything, which is why this line exists.'
  );
  process.exit(1);
}

if (errored.length) {
  console.error(`\ncwv: ${errored.length} route(s) could not be measured:`);
  errored.forEach((r) => console.error(`  ${r.route} @${r.viewport}  ${r.error}`));
  console.error('  A route that did not load is not a route that held still.');
  process.exit(1);
}

if (failures.length) {
  console.error(`\ncwv: ${failures.length} measurement(s) OUTSIDE ${BUDGET}\n`);
  for (const r of failures) {
    console.error(`  ${r.route} @${r.viewport}  CLS ${r.cls}`);
    for (const s of r.shifts) console.error(`      ${s.value}  ${s.dy >= 0 ? '+' : ''}${s.dy}px  ${s.sel}`);
  }
  console.error(
    '\n  Layout stability costs no bytes, which is why no byte budget catches it. Fix the shift,\n' +
      '  or add an entry to EXCEPTIONS above with a ceiling and a reason somebody can argue with.'
  );
  process.exit(1);
}

console.log(
  '\n  every route holds still within 0.1 at both viewports, for a reader who asked for no\n' +
    '  motion as well as one who did not, with the whole document scrolled'
);
