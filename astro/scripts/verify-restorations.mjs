/**
 * Verify the seven restorations in a real browser, on the built site at :8095.
 * Measures rendered/computed state, never source text.
 *
 * ── A MANUAL VERIFICATION RUN. IT IS NOT IN `npm run build` ─────────────────
 *
 * Stated on 2026-08-04, because it exits non-zero on a failed assertion and
 * three gates in the chain cite it by name, so it reads as one of them. It is
 * not: nothing invokes it, and it drives BASE — the preview server on :8095 —
 * which neither this file nor the build starts.
 *
 * IT SHOULD NOT BE WIRED IN, AND THE REASON IS THE ONE EVERY GATE THAT CITES IT
 * ALREADY GIVES. check-treatments.js, check-status-pulse.mjs and
 * check-shared-blocks.js all quote this file as the cautionary example: it
 * asserted the mega-menu was frosted, from computed style, while the menu was
 * drawing nothing. A rule that reads the style engine cannot tell whether a
 * reader sees anything, and most of what is asserted below is that kind of
 * rule. verify-effects-paint.mjs was written as the pixel-measuring answer to
 * it, and the properties worth holding on every build were rewritten as
 * rendered rules inside gates that ARE in the chain.
 *
 * So what remains here is a record of one night's work, useful to re-run when
 * one of the seven is touched and not otherwise. Promoting it would put a check
 * with a known blind spot in front of every build, and its own failure is the
 * argument against doing that.
 *
 * Run: `node scripts/verify-restorations.mjs`, with a preview server on :8095
 * or VERIFY_BASE pointed elsewhere.
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_BASE || 'http://localhost:8095';
const out = [];
const rec = (item, name, pass, detail) => out.push({ item, name, pass, detail });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/* ── 1. MAGNETIC ───────────────────────────────────────────────────────── */
await page.goto(`${BASE}/`, { waitUntil: 'load' });

const mag = await page.evaluate(async () => {
  const btn = document.querySelector('.btn--primary[data-magnetic]');
  if (!btn) return { err: 'no [data-magnetic] primary button found' };
  const cs = getComputedStyle(btn);
  const r = btn.getBoundingClientRect();
  btn.scrollIntoView({ block: 'center' });
  const r2 = btn.getBoundingClientRect();
  const cx = r2.left + r2.width / 2;
  const cy = r2.top + r2.height / 2;

  const send = (type, x, y) =>
    btn.dispatchEvent(new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1 }));

  // pointer 15px right of centre -> should lean right
  send('pointermove', cx + 15, cy);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const leaned = btn.style.getPropertyValue('--mag-x');

  // press -> must snap to zero and stay there (the OA-07 fix)
  send('pointerdown', cx + 15, cy);
  send('pointermove', cx + 20, cy);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const pressed = btn.style.getPropertyValue('--mag-x');

  send('pointerup', cx + 15, cy);
  return {
    count: document.querySelectorAll('[data-magnetic]').length,
    transition: cs.transitionProperty,
    translateDeclared: cs.translate,
    leaned,
    pressed,
  };
});
rec(1, 'magnetic: leans towards the pointer', !mag.err && parseFloat(mag.leaned) > 0, `--mag-x=${mag.leaned} (${mag.count} magnetic controls)`);
rec(1, 'magnetic: OA-07 press freeze', mag.pressed === '0px', `--mag-x during press = ${mag.pressed} (must be 0px)`);
rec(1, 'magnetic: composes via translate', /translate/.test(mag.transition || ''), `transition-property includes translate`);

/* ── 2. CAROUSEL ───────────────────────────────────────────────────────── */
await page.goto(`${BASE}/crowmark/`, { waitUntil: 'load' });
await page.locator('#showcase').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);

const car = await page.evaluate(() => {
  const root = document.querySelector('.pcar');
  if (!root) return { err: 'no carousel' };
  const slides = [...root.querySelectorAll('.pcar__slide')];
  const tabs = [...root.querySelectorAll('.pcar__tab')];
  const arrow = root.querySelector('.pcar__arrow');
  const ring = root.querySelector('.pcar__tab[aria-selected="true"] .pcar__ring-progress');
  const img = slides[0].querySelector('img');
  return {
    enhanced: root.getAttribute('data-pcar'),
    lit: root.getAttribute('data-lit'),
    slides: slides.length,
    active: slides.filter((s) => s.classList.contains('is-active')).length,
    activeOpacity: getComputedStyle(slides[0]).opacity,
    hiddenOpacity: getComputedStyle(slides[1]).opacity,
    tabs: tabs.length,
    arrowVisible: arrow ? getComputedStyle(arrow).display !== 'none' : false,
    ringAnim: ring ? getComputedStyle(ring).animationName : 'none',
    ringDur: ring ? getComputedStyle(ring).animationDuration : '',
    imgLoaded: img.complete && img.naturalWidth > 0,
    imgSrc: (img.currentSrc || '').split('/').pop(),
    role: root.getAttribute('role'),
    objectFit: getComputedStyle(img).objectFit,
  };
});
rec(2, 'carousel: one active, rail agrees, rest hidden', car.slides >= 2 && car.slides === car.tabs && car.active === 1 && car.hiddenOpacity === '0', `${car.slides} slides, ${car.tabs} tabs, ${car.active} active, hidden opacity ${car.hiddenOpacity}`);
rec(2, 'carousel: controls revealed by JS', car.enhanced === 'on' && car.arrowVisible, `data-pcar=${car.enhanced}, arrows visible=${car.arrowVisible}`);
rec(2, 'carousel: ring is the clock', car.ringAnim !== 'none' && car.ringDur === '5.2s', `animation=${car.ringAnim} duration=${car.ringDur}`);
rec(2, 'carousel: image actually loads', car.imgLoaded, `currentSrc=${car.imgSrc} (AVIF expected)`);
rec(2, 'carousel: nothing cropped', car.objectFit === 'contain', `object-fit=${car.objectFit}`);

// advance by clicking next
const before = await page.evaluate(() => document.querySelector('.pcar__tab[aria-selected="true"]')?.getAttribute('aria-label'));
await page.click('[data-pcar-next]');
await page.waitForTimeout(200);
const after = await page.evaluate(() => ({
  label: document.querySelector('.pcar__tab[aria-selected="true"]')?.getAttribute('aria-label'),
  caption: document.querySelector('[data-pcar-caption]')?.textContent?.trim(),
  live: document.querySelector('[data-pcar-live]')?.textContent?.trim(),
}));
rec(2, 'carousel: next advances + announces', before !== after.label && !!after.caption && !!after.live, `now "${after.caption?.slice(0, 44)}…"`);

/* ── 6. AMBIENT + 7. SCROLL PROGRESS (measured on the same page) ────────── */
const amb = await page.evaluate(() => {
  const wash = getComputedStyle(document.body, '::after');
  const bar = document.querySelector('.sv-progress');
  const bcs = bar ? getComputedStyle(bar) : null;
  return {
    washAnim: wash.animationName,
    washDur: wash.animationDuration,
    barExists: !!bar,
    barTimeline: bcs ? (bcs.animationTimeline || bcs.getPropertyValue('animation-timeline')) : '',
    barAnim: bcs ? bcs.animationName : '',
    barZ: bcs ? bcs.zIndex : '',
    barH: bcs ? bcs.height : '',
  };
});
rec(6, 'ambient: page wash stays REMOVED (owner, 2026-08-04)', amb.washAnim === 'none', `body::after animation=${amb.washAnim} (must be none, see the removal note in layouts/Base.astro)`);
rec(7, 'scroll bar: exists and is scroll-driven', amb.barExists && amb.barAnim === 'sv-progress', `anim=${amb.barAnim} timeline=${amb.barTimeline} z=${amb.barZ} h=${amb.barH}`);

// does it actually grow on scroll?
const grow = await page.evaluate(async () => {
  const bar = document.querySelector('.sv-progress');
  const at = () => new DOMMatrixReadOnly(getComputedStyle(bar).transform).a;
  const top = at();
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise((r) => setTimeout(r, 300));
  const bottom = at();
  window.scrollTo(0, 0);
  return { top, bottom };
});
rec(7, 'scroll bar: tracks scroll position', grow.bottom > grow.top + 0.5, `scaleX ${grow.top.toFixed(3)} at top -> ${grow.bottom.toFixed(3)} at bottom`);

/* ── 3. MICRO-ANIMATIONS + 4. SHINE (homepage) ─────────────────────────── */
await page.goto(`${BASE}/`, { waitUntil: 'load' });
const fx = await page.evaluate(() => {
  const eyebrow = document.querySelector('.fx-shimmer');
  const fc = document.querySelector('.fc');
  const fcBtn = fc?.querySelector('.btn--primary');
  return {
    shimmerCount: document.querySelectorAll('.fx-shimmer').length,
    shimmer: eyebrow ? getComputedStyle(eyebrow, '::after').animationName : 'none',
    shimmerDur: eyebrow ? getComputedStyle(eyebrow, '::after').animationDuration : '',
    pulse: fcBtn ? getComputedStyle(fcBtn, '::before').animationName : 'none',
    edge: fc ? getComputedStyle(fc, '::before').animationName : 'none',
    edgeMask: fc ? getComputedStyle(fc, '::before').maskComposite || '' : '',
  };
});
rec(3, 'shimmer: one instance, animating', fx.shimmer === 'fx-shimmer' && fx.shimmerCount === 1, `${fx.shimmerCount} carrier, animation=${fx.shimmer} ${fx.shimmerDur}`);
rec(3, 'CTA pulse: on the final CTA button', fx.pulse === 'fx-pulse', `animation=${fx.pulse}`);
rec(3, 'animated border: on the final CTA block', fx.edge === 'fx-edge', `animation=${fx.edge} mask-composite=${fx.edgeMask}`);

/*
 * MEASURED WITH TRANSITION EVENTS, NOT WITH getComputedStyle.
 *
 * The obvious test — hover the button and read
 * `getComputedStyle(btn, '::after').opacity` — reports 0 on a button that is
 * demonstrably hovered, on a rule that demonstrably matches. Chromium does not
 * recompute a pseudo-element's style for `:hover` when it is queried this way,
 * and the first version of this file recorded that as a FAILING effect for
 * exactly that reason.
 *
 * `transitionrun` and `transitionend` carry a `pseudoElement` field and fire
 * from the real style engine, so they answer the question actually being asked:
 * did the sweep run. Screenshots do not settle it either, because Playwright
 * waits for an element to stop moving before it captures, so both frames land
 * after the sweep has finished and compare equal.
 */
const shineRest = await page.evaluate(() => {
  const btn = document.querySelector('.fc .btn--primary') || document.querySelector('.btn--primary');
  const cs = getComputedStyle(btn, '::after');
  return { hasImage: cs.backgroundImage !== 'none', opacity: cs.opacity, z: cs.zIndex, pos: cs.backgroundPosition };
});
const shineBtn = page.locator('.fc .btn--primary').first();
await shineBtn.scrollIntoViewIfNeeded();
await page.evaluate(() => {
  window.__fx = [];
  const btn = document.querySelector('.fc .btn--primary');
  for (const t of ['transitionrun', 'transitionend'])
    btn.addEventListener(t, (e) => window.__fx.push(`${t}:${e.propertyName}${e.pseudoElement || ''}`));
});
await shineBtn.hover();
await page.waitForTimeout(1600);
const fxEvents = await page.evaluate(() => window.__fx);
/* transitionrun is the assertion: it fires when the rule has matched and the
   sweep has STARTED, which is the fact under test. transitionend is reported
   but not asserted — waiting on the end of a 0.62s travel makes the check a
   race against the machine rather than a check of the effect. */
const started = (re) => fxEvents.some((e) => e.startsWith('transitionrun') && re.test(e));
const swept = started(/opacity::after$/) && started(/background-position(-[xy])?::after$/);

rec(4, 'shine: sweep painted under the label', shineRest.hasImage && shineRest.z === '-1' && shineRest.opacity === '0',
  `rest opacity=${shineRest.opacity}, z=${shineRest.z} (under the label), pos=${shineRest.pos}`);
rec(4, 'shine: sweeps on hover', swept,
  `started: ${fxEvents.filter((e) => e.startsWith('transitionrun') && e.includes('::after')).map((e) => e.split(':')[1]).join(' + ') || 'nothing'}`);

/* ── 5. GLASS ──────────────────────────────────────────────────────────── */
const glass = await page.evaluate(() => {
  const read = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return { missing: true, sel };
    const cs = getComputedStyle(el);
    return { sel, cls: el.className, bf: cs.backdropFilter || cs.webkitBackdropFilter, bg: cs.backgroundColor };
  };
  const bf = (el) => { const c = getComputedStyle(el); return c.backdropFilter || c.webkitBackdropFilter; };
  const all = [...document.querySelectorAll('.surface')];
  return {
    mega: read('.ca-mega'),
    cmdk: read('.cmdk__panel'),
    nav: read('.ca-nav'),
    /* ── ITEM 5 WAS MEASURING A PANEL AND REPORTING IT AS GLASS ─────────────
     *
     * This read `.surface` bare. MEASURED on / at 1440, 2026-09-01: there are 23
     * elements carrying `.surface` and exactly ONE of them is glass. The other
     * 22 wear a modifier that cancels the filter ON PURPOSE. The FIRST in
     * document order is `.surface--panel.surface--pad.pg__card`, and
     * styles/surfaces.css says of that modifier, in as many words, "an opaque
     * panel rather than glass", then sets `backdrop-filter: none` on it. So
     * `document.querySelector('.surface')` returned the one element on the page
     * guaranteed to answer `none`, and the assertion read `none !== 'none'`,
     * which is false.
     *
     * IT HAS NEVER PASSED, AND IT WAS NOT THE BLUR WORK THAT BROKE IT. The
     * cancel on `.surface--panel` predates tonight, so this line was red before
     * it and red after it, and its subject line, "existing surfaces untouched",
     * was reporting on an element that is deliberately not a surface with glass.
     * That is this file's own cautionary lesson, the one every gate that cites it
     * quotes: a rule that reads the style engine can be pointed at the wrong
     * element and still sound authoritative.
     *
     * THE SELECTOR IS STRUCTURAL AND NOT A CLASS NAME. `.surface` with no
     * `surface--` modifier IS the base recipe, which is the thing the assertion
     * is about. Naming `.fc` (the one element that matches today) would tie a
     * general claim to one component and go stale the moment the homepage
     * changes. Today it resolves to `.fc.surface` at blur(16px) saturate(1.6),
     * the same value the mega menu and the palette carry.
     *
     * ABSENCE IS NOW A FAILURE. `read()` returns `{missing:true}` when nothing
     * matches, so `glass.surface.bf` was `undefined` and `undefined !== 'none'`
     * is TRUE. Had every surface on / taken a modifier, this line would have
     * flipped from permanently red to VACUOUSLY GREEN without anyone touching
     * it, which is the worse of the two failures. The census below is printed
     * with the result so the denominator is visible rather than inferred. */
    surface: read('.surface:not([class*="surface--"])'),
    surfaceCensus: { total: all.length, glass: all.filter((el) => bf(el) !== 'none').length },
  };
});
/*
 * `color-mix(in srgb, var(--c-panel) 82%, transparent)` computes to
 * `color(srgb 0.047 0.063 0.125 / 0.82)`, NOT to `rgba(...)`. The first version
 * of this file tested for `rgba(` and reported two correctly frosted panels as
 * failures. Accept any notation that carries an alpha below 1.
 */
const translucent = (bg) => {
  const m = /\/\s*(0?\.\d+)\s*\)/.exec(bg || '') || /,\s*(0?\.\d+)\s*\)$/.exec(bg || '');
  return !!m && parseFloat(m[1]) < 1;
};
rec(5, 'glass: mega menu frosted AND translucent', glass.mega.bf !== 'none' && translucent(glass.mega.bg), `filter=${glass.mega.bf} bg=${glass.mega.bg}`);
rec(5, 'glass: command palette frosted AND translucent', glass.cmdk.bf !== 'none' && translucent(glass.cmdk.bg), `filter=${glass.cmdk.bf} bg=${glass.cmdk.bg}`);
rec(
  5,
  'glass: a base surface still frosts',
  !glass.surface.missing && glass.surface.bf !== 'none',
  glass.surface.missing
    ? `NOTHING MATCHED ${glass.surface.sel} on /, so there was no base surface to measure`
    : `${glass.surface.sel} -> .${String(glass.surface.cls).trim().split(/\s+/).join('.')} filter=${glass.surface.bf}` +
      `  (${glass.surfaceCensus.glass} of ${glass.surfaceCensus.total} .surface elements on / carry glass;` +
      ` the rest wear a modifier that cancels it by design)`,
);

/* ── REDUCED MOTION: everything must go still ──────────────────────────── */
const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
const rmPage = await rm.newPage();
await rmPage.goto(`${BASE}/`, { waitUntil: 'load' });
const still = await rmPage.evaluate(() => {
  const running = [...document.querySelectorAll('*')]
    .flatMap((el) => [el.getAnimations(), el.getAnimations({ subtree: false })].flat())
    .filter((a) => a.playState === 'running');
  const eyebrow = document.querySelector('.fx-shimmer');
  const fc = document.querySelector('.fc');
  return {
    running: running.length,
    shimmer: eyebrow ? getComputedStyle(eyebrow, '::after').animationName : 'n/a',
    wash: getComputedStyle(document.body, '::after').animationName,
    edge: fc ? getComputedStyle(fc, '::after').animationName : 'n/a',
    bar: getComputedStyle(document.querySelector('.sv-progress')).animationName,
  };
});
rec(0, 'reduced motion: every new effect is still', ['shimmer', 'wash', 'edge', 'bar'].every((k) => still[k] === 'none'), `shimmer=${still.shimmer} wash=${still.wash} edge=${still.edge} bar=${still.bar}`);

await browser.close();

const pad = (s, n) => String(s).padEnd(n);
let fail = 0;
console.log('\n' + '='.repeat(96));
console.log('VERIFICATION — the seven restorations, measured in a browser at 1440');
console.log('='.repeat(96));
for (const r of out) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? ' PASS' : ' FAIL'}  [${r.item || 'RM'}] ${pad(r.name, 46)} ${r.detail}`);
}
console.log('='.repeat(96));
console.log(`${out.length - fail}/${out.length} passed`);
process.exit(fail ? 1 : 0);
