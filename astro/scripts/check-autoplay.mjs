#!/usr/bin/env node
/**
 * check-autoplay.mjs — the two autoplaying components, verified by BEHAVIOUR.
 *
 * ── WHY THIS GATE EXISTS ────────────────────────────────────────────────────
 *
 * Because a comment on one of these two components claimed a working pause
 * while the component did not have one. Measured on 2026-08-05, hovering the
 * carousel for 11 seconds advanced it from slide 4 to slide 6: a WCAG 2.2.2
 * Level A failure that every reader of the source was told was already handled.
 * That is the exact failure mode this repo keeps hitting — a record of a thing
 * standing in for the thing — and the only defence is a check that drives the
 * component and watches what it does.
 *
 * So nothing here reads the source. Every assertion below starts the real page,
 * waits real time, and reads the resulting state.
 *
 * ── THE THREE CONSTRAINTS, AND WHOSE THEY ARE ───────────────────────────────
 *
 * Two are WCAG and one is the owner's, and all three are NON-OPTIONAL (A-104):
 *
 *   1. It must not autoplay at all under prefers-reduced-motion. Not "slower",
 *      not "fewer" — not at all.
 *   2. WCAG 2.2.2: anything moving for more than five seconds needs a pause
 *      control, and that control has to be real. It is checked here by pressing
 *      it and confirming the thing stops, not by finding it in the DOM.
 *   3. Autoplay stops PERMANENTLY the moment a reader picks a tab, because
 *      continuing to move after an explicit choice is hostile. Hover, focus and
 *      a hidden tab merely suspend, because none of those is a choice.
 *
 * A FOURTH, IMPLIED, AND IT IS THE ONE MOST EASILY GOT WRONG: a pause control
 * must not be revealed when no timer is running. A control that cannot do
 * anything is worse than no control, because it advertises a capability the
 * reader then finds does nothing. Under reduced motion the button must be
 * absent or hidden.
 *
 * ── WHY IT DRIVES BOTH COMPONENTS ───────────────────────────────────────────
 *
 * The product tab switcher and the trust band are separate implementations of
 * the same idea, added within hours of each other, and the band's rules are
 * deliberately NOT identical to the switcher's — a band has no "choice" to
 * make, so rule 3 does not apply to it. Checking one and assuming the other is
 * how the second one drifts.
 *
 * Timings are generous on purpose: the switcher's interval is six seconds and
 * the band's is its own, so a 14s observation window catches a single advance
 * with room to spare, and a 16s window after an interaction is more than two
 * intervals. Slow, and that is the right trade for a gate that has to be
 * believed.
 *
 * Exit 0 clean, 1 on any failure. Reads dist/, so build first.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.woff2': 'font/woff2', '.webp': 'image/webp', '.avif': 'image/avif',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

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
/* Port 0, so this can never collide with a preview server the owner is reading
   or with a sibling gate. Several of this repo's false readings came from a
   script assuming a port was free. */
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const failures = [];
let checks = 0;
const check = (name, ok, detail) => {
  checks += 1;
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
  console.log(`    ${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `   ${detail}` : ''}`);
};

const browser = await chromium.launch();

/* The selected index of a tablist, which is the state autoplay changes. Read
   from aria-selected rather than from a class, because aria-selected is what a
   screen reader is told and a class is only what the paint uses. */
const selectedIndex = (page, scope) =>
  page.evaluate((s) => {
    const list = document.querySelector(`${s} [role="tablist"]`);
    if (!list) return null;
    return [...list.querySelectorAll('[role="tab"]')].findIndex(
      (t) => t.getAttribute('aria-selected') === 'true',
    );
  }, scope);

const pauseControl = (page, sels) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      w: Math.round(r.width),
      h: Math.round(r.height),
      hidden: el.hasAttribute('hidden') || cs.display === 'none' || cs.visibility === 'hidden',
      name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40),
      pressed: el.getAttribute('aria-pressed'),
    };
  }, sels);

/* ── TRAVEL, MEASURED, NOT AN ATTRIBUTE ────────────────────────────────────
 * WRITTEN AFTER THIS GATE MADE THE EXACT MISTAKE IT EXISTS TO CATCH. The band
 * checks first asserted `data-band === 'off'` after pressing pause, and failed.
 * The defect was in the assertion: `data-band` records whether the band is
 * ALLOWED to move at all, which is the reduced-motion gate, and it stays 'on'
 * when a reader pauses. Measured instead, the track holds the same position
 * across 600ms and 2.6s while the button flips to "Resume scrolling" - so the
 * pause works and the gate was reading a record of the thing rather than the
 * thing.
 *
 * The threshold is not a guess. Sampled every 500ms with motion allowed and no
 * interaction, the track travels -18.95 -> -137.83, about 119px in three
 * seconds, so roughly 40px/s. Over the 1200ms window below that is ~48px when
 * it is moving against 0 when it is not, which is a signal no rounding can
 * blur.
 *
 * AND IT READS A RECT RATHER THAN A TRANSFORM ON PURPOSE, because the element
 * that moves is NOT the one measured. The `in-band` keyframe runs on
 * `.in__rail`, the PARENT of two `.in__track` elements - the marquee duplicates
 * the row so it can loop seamlessly - so `.in__track` has no animation of its
 * own and `getComputedStyle(track).animationName` reads 'none' while the thing
 * is plainly moving. getBoundingClientRect() composes ancestor transforms, so
 * it reports the movement wherever in the subtree it is produced.
 *
 * This was established by falsification, not by reading the stylesheet:
 * injecting `transform: none` onto `.in__track` in dist/ did NOT stop the band,
 * which is only explicable if something above it carries the transform. A check
 * written against the animated element by name would have to be rewritten every
 * time the marquee is restructured; one written against the rect does not. */
const travel = async (page, sel, ms = 1200, settleMs = 0) => {
  const at = () =>
    page.evaluate(
      (s) => Math.round((document.querySelector(s)?.getBoundingClientRect().left || 0) * 100) / 100,
      sel,
    );
  /* SETTLE FIRST WHEN ASKED, AND THE REASON IS A FAILURE THIS GATE PRODUCED
     AGAINST A SITE THAT WAS BEHAVING CORRECTLY. Build 20 failed on "pressing
     pause actually stops it - moved 4.5px in 1200ms". The band was not still
     running: sampled every 100ms across the click, the profile is -1.28, 0, 0,
     0, 0, 0, 0, 0, 0, 0, 0 - it stops inside a single 100ms sample and then
     holds position for the remaining 1.1 seconds, across three trials.
     The 4.5px was the STOPPING FRAME, and it was 4.5px rather than 1.3px
     because that run happened inside a full build, where the scheduler is
     contended and the gap between the click and the first read stretches.
     Measuring from the instant of the click therefore samples the transition
     and calls it motion.
     The question this check asks is "is it stopped", not "did it stop within
     one frame", so it now waits for the transition to finish and measures the
     STEADY state. This does not weaken it: a band that genuinely ignored the
     pause would still travel ~47px in the window, against a threshold of 1. */
  if (settleMs) await page.waitForTimeout(settleMs);
  const a = await at();
  await page.waitForTimeout(ms);
  return Math.abs((await at()) - a);
};

const open = async (reducedMotion) => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion });
  await page.goto(`${base}/`, { waitUntil: 'load' });
  return page;
};

const PAUSE_SEL = '#product .tabsw__pause, #product [data-pause], #product button[aria-pressed]';
const BAND_PAUSE_SEL = '#integrations [data-band-pause], #integrations .in__pause';

console.log('autoplay: driving the two autoplaying components on / and reading what they do');

/* ── 1. THE PRODUCT TAB SWITCHER ─────────────────────────────────────────── */
console.log('\n  the product tab switcher (#product)');
{
  const page = await open('reduce');
  await page.evaluate(() => document.querySelector('#product')?.scrollIntoView());
  const before = await selectedIndex(page, '#product');
  check('a tablist is present to measure', before !== null && before >= 0, `selected=${before}`);
  await page.waitForTimeout(14000);
  const after = await selectedIndex(page, '#product');
  check('does not advance under prefers-reduced-motion', before === after, `${before} -> ${after}`);
  const btn = await pauseControl(page, PAUSE_SEL);
  check(
    'reveals no pause control when no timer runs',
    !btn || btn.hidden,
    btn ? `present, hidden=${btn.hidden}` : 'absent',
  );
  await page.close();
}
{
  const page = await open('no-preference');
  await page.evaluate(() => document.querySelector('#product')?.scrollIntoView());
  const before = await selectedIndex(page, '#product');
  await page.waitForTimeout(14000);
  const after = await selectedIndex(page, '#product');
  check('advances when motion is allowed', before !== after, `${before} -> ${after}`);
  const btn = await pauseControl(page, PAUSE_SEL);
  check('has a visible pause control (WCAG 2.2.2)', !!btn && !btn.hidden, JSON.stringify(btn));
  check(
    'the pause control meets the 24x24 target floor',
    !!btn && btn.w >= 24 && btn.h >= 24,
    btn ? `${btn.w}x${btn.h}` : 'n/a',
  );
  await page.close();
}
{
  /* PRESS IT. The whole reason this file exists is that finding the control in
     the DOM proved nothing the last time somebody checked. */
  const page = await open('no-preference');
  await page.evaluate(() => document.querySelector('#product')?.scrollIntoView());
  await page.waitForTimeout(1500);
  const pressed = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    el.click();
    return el.getAttribute('aria-pressed');
  }, PAUSE_SEL);
  const before = await selectedIndex(page, '#product');
  await page.waitForTimeout(16000);
  const after = await selectedIndex(page, '#product');
  check('pressing pause actually stops it', pressed !== null && before === after, `aria-pressed=${pressed}, ${before} -> ${after}`);
  await page.close();
}
{
  const page = await open('no-preference');
  await page.evaluate(() => document.querySelector('#product')?.scrollIntoView());
  await page.evaluate(() => {
    [...document.querySelectorAll('#product [role="tab"]')][1]?.click();
  });
  const picked = await selectedIndex(page, '#product');
  await page.waitForTimeout(16000);
  const after = await selectedIndex(page, '#product');
  check('stops permanently once a reader picks a tab', picked === after, `${picked} -> ${after}`);
  await page.close();
}

/* ── 2. THE TRUST BAND ───────────────────────────────────────────────────────
 * Rule 3 does NOT apply here and that is deliberate rather than an omission: a
 * band presents no choice, so there is no explicit choice for it to respect.
 * Rules 1, 2 and the implied fourth all do. */
console.log('\n  the trust band (#integrations)');
{
  const page = await open('reduce');
  await page.evaluate(() => document.querySelector('#integrations')?.scrollIntoView());
  await page.waitForTimeout(2000);
  const moved = await travel(page, '#integrations .in__track');
  check('does not travel under prefers-reduced-motion', moved < 1, `moved ${moved}px in 1200ms`);
  const btn = await pauseControl(page, BAND_PAUSE_SEL);
  check(
    'reveals no pause control when it is not moving',
    !btn || btn.hidden,
    btn ? `present, hidden=${btn.hidden}` : 'absent',
  );
  await page.close();
}
{
  const page = await open('no-preference');
  await page.evaluate(() => document.querySelector('#integrations')?.scrollIntoView());
  await page.waitForTimeout(2500);
  const moved = await travel(page, '#integrations .in__track');
  check('travels when motion is allowed', moved > 10, `moved ${moved}px in 1200ms`);
  const btn = await pauseControl(page, BAND_PAUSE_SEL);
  check('has a visible pause control (WCAG 2.2.2)', !!btn && !btn.hidden, JSON.stringify(btn));
  check(
    'the pause control meets the 24x24 target floor',
    !!btn && btn.w >= 24 && btn.h >= 24,
    btn ? `${btn.w}x${btn.h}` : 'n/a',
  );
  const pressed = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    el.click();
    return el.getAttribute('aria-pressed');
  }, BAND_PAUSE_SEL);
  /* 400ms of settle against a measured 100ms stop: four times the observed
     worst case, because this runs inside a full build where everything is
     slower, and a gate that flakes under load is a gate people learn to
     re-run rather than believe. */
  const after = await travel(page, '#integrations .in__track', 1200, 400);
  check(
    'pressing pause actually stops it',
    pressed !== null && after < 1,
    `aria-pressed=${pressed}, moved ${after}px in 1200ms`,
  );
  await page.close();
}

await browser.close();
server.close();

console.log(`\n  ${checks} behavioural check(s) over 2 autoplaying component(s) on /`);
if (failures.length) {
  console.error(`\nautoplay: ${failures.length} failure(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    '\n  These are WCAG 2.2.2 and owner constraints, not preferences. An autoplay\n' +
      '  without a working pause is a Level A failure, and a pause control that is\n' +
      '  present but does nothing is worse than none at all.',
  );
  process.exit(1);
}
console.log(
  '\n  both autoplaying components stay still for a reader who asked for no motion,\n' +
    '  offer a pause that genuinely pauses, and the tab switcher stops for good the\n' +
    '  moment a reader chooses for themselves',
);
