/**
 * check-status-pulse.mjs — the live marks are genuinely MOVING, not merely styled.
 *
 * WHY THIS EXISTS, AND IT IS A SPECIFIC FAILURE RATHER THAN A GENERAL WORRY.
 *
 * The owner reported the /about history section twice: *"scroll
 * automation/animation in history and company section is not yet fixed why?
 * must be same as live version"*. It had been diagnosed once and written down
 * once and never fixed, and what was actually missing was one thing — the
 * production site pulses the CURRENT milestone's dot and the rebuild's dot
 * returned an empty `getAnimations()`.
 *
 * A gate could have caught that and none did, so the interesting question is
 * what shape of gate would have. Not a source scan: `animation: fx-status-pulse
 * ...` can be written in a stylesheet that is never imported, on a class that no
 * element wears, inside a `@media` block that never matches, or on an element
 * another rule has already given a different `animation-name`. Every one of
 * those greps clean. Two gates on this site have already passed while the thing
 * they claimed to check was visibly broken — verify-restorations.mjs asserted
 * the mega-menu was frosted while it drew nothing, and an "animated" wash was
 * moving 2/255 of a channel, which is real in the compositor and invisible to a
 * person. Both asked whether a RULE MATCHED. This asks whether a reader would
 * see the mark move, and it asks a browser.
 *
 * ── WHAT IT ASSERTS, AND ALL THREE ARE RUNTIME FACTS ────────────────────────
 *
 *   RUNNING   `el.getAnimations()` contains `fx-status-pulse` with
 *             `playState: 'running'` and infinite iterations. A paused, dropped,
 *             finished or overridden animation fails here, and so does an
 *             element that no longer exists.
 *   PAINTS    The same animation, seeked to its peak and to its trough and
 *             photographed at both, moves enough pixels by a large enough
 *             margin to be seen. Seek rather than wait: photographing a loop at
 *             two wall-clock moments is a race, and a race that usually passes.
 *             The margin is asserted as well as the count, which is the lesson
 *             from the 2/255 wash.
 *   STILL     In a `reducedMotion: 'reduce'` context the same element has ZERO
 *             fx-status-pulse animations AND computes to opacity 1. A looping
 *             mark is exactly what that setting exists for, and "the animation
 *             is gone" is only half of it: the state it conveys has to survive.
 *
 * ── AND THE RECIPE MAY NOT SPREAD ───────────────────────────────────────────
 *
 * styles/effects.css states the rule the whole file is built on: *"A recipe that
 * spreads is a recipe that has stopped meaning anything: if every surface
 * shimmers, shimmer is the background."* That is a claim about the site, so it
 * is checked against the site. Every element in dist/ wearing the class is
 * matched against the register below, and one that is not registered FAILS —
 * so a third carrier cannot be added without somebody writing down why it is
 * one, which is what stopped the legacy tree at three separate status pulses on
 * two curves at three durations.
 *
 * ── THE CONTRACT IS THE ONE EVERY OTHER GATE USES ───────────────────────────
 *
 * Copied from check-render.js, check-palette-roles.js and check-treatments.js
 * rather than reinvented:
 *
 *   - a list of named entries, each carrying the reason it is on the list
 *   - the list is PRINTED on every run, so an entry nobody re-reads cannot
 *     quietly become an accidental one
 *   - an entry matching nothing is reported as STALE and fails, so the register
 *     can only ever describe elements that exist
 *   - anything NOT on the list fails
 *
 * ATTRIBUTION CORRECTED 2026-08-04, A-57. This named check-motion.js and
 * check-design-system.js for the stale clause. Both PRINT a stale entry and
 * neither fails on one — check-design-system.js says so in as many words,
 * "Reported, never fatal". check-palette-roles.js is the gate that actually
 * exits on a stale entry, so it is the one cited. Getting a citation wrong is
 * how a reader concludes a rule is enforced somewhere it is not.
 *
 * PROVED IN BOTH DIRECTIONS, 2026-08-04, and both directions matter — hours of
 * this project have gone into gates that had never once executed their own
 * failure path. Exit codes and the exact provocations are recorded in the
 * session report.
 *
 * PULSE_DIST overrides the directory served, so the gate can be proved to fail
 * against a scratch copy without disturbing the dist/ another agent is using.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.PULSE_DIST || path.join(__dirname, '..', 'dist');

/** The recipe under test. One name, defined once, in styles/effects.css. */
const ANIM = 'fx-status-pulse';

/* ══════════════════════════════════════════════════════════════════════════
 * THE REGISTER — every element on this site that pulses, and why it does.
 *
 * `signature` is the element's class list with Astro's scoping attribute and
 * the recipe class itself removed, sorted, so it survives a component being
 * re-scoped and does not depend on the order somebody typed the classes in.
 * `route` is where the runtime assertions are made; a mark that appears on
 * every route is measured on one of them, named here, rather than 43 times.
 *
 * A reason that only says "it is a status dot" is not a reason. Say what state
 * it reports and why that state is one a reader needs to see as CURRENT.
 * ══════════════════════════════════════════════════════════════════════════ */
const CARRIERS = [
  {
    signature: 'tl__dot',
    selector: '.tl__item--now .tl__dot',
    route: '/about/',
    why:
      'The current milestone on the /about history rail. The rail runs from 2021 ' +
      'to a planned Q4 2026 and every entry on it is a completed fact except one, ' +
      'so the single question a reader has is which row is NOW — and the answer ' +
      'was carried only by a hue, which is the thing this site refuses to let ' +
      'colour do alone. Production put animate-pulse on exactly this dot and on ' +
      'nothing else in the section; its absence is the owner report of 2026-08-04.',
  },
  {
    signature: 'ca-footer-status-dot',
    selector: '.ca-footer-status-dot',
    route: '/about/',
    why:
      'The footer live mark, beside the words "All systems operational". That is ' +
      'a claim about this moment rather than about the site, and a still dot ' +
      'states it in the past tense — it reads as a printed badge rather than as ' +
      'something being observed. Measured on /about/ because the footer is ' +
      'identical on all 43 routes and one page load proves the component.',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
 * THE STATIC SWEEP — who wears the class, across the whole built site
 * ══════════════════════════════════════════════════════════════════════════ */

function htmlFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) htmlFiles(f, out);
    else if (e.name.endsWith('.html')) out.push(f);
  }
  return out;
}

const routeOf = (f) => {
  const rel = path.relative(DIST, path.dirname(f)).replace(/\\/g, '/');
  return '/' + (rel ? rel + '/' : '');
};

/**
 * Class list minus Astro's scope hash and the recipe itself, sorted.
 *
 * `astro-` RATHER THAN `astro-cid-`, FROM 2026-08-04, AND IT IS A FIX RATHER
 * THAN A WIDENING. Astro's scope marker was `data-astro-cid-<hash>` — an
 * ATTRIBUTE, never a class — so `astro-cid-` was a filter for something that
 * could not appear in a class attribute, and this signature was correct only
 * because there was nothing to strip. The build now sets
 * `scopedStyleStrategy: 'class'` (astro.config.mjs, for the per-route HTML
 * budget), which puts `astro-dwl4onjj` in the class list, and every registered
 * carrier here turned STALE at once while the same elements were reported as
 * unregistered under a hash-prefixed name.
 *
 * `/^astro-/` is what the other ten gates that build a class signature already
 * use — check-render.js, check-treatments.js, check-sheen.js,
 * check-design-system.js, check-controls.js, check-disclosure.js,
 * check-heading-ink.js, check-timeline.js and check-utilities.js among them —
 * so this joins them rather than inventing an eleventh answer. No author class
 * on this site begins `astro-`; the site's own prefixes are `ca-`, `tl__`,
 * `fx-` and the block names.
 */
const signatureOf = (classAttr) =>
  classAttr
    .split(/\s+/)
    .filter((c) => c && c !== ANIM && !/^astro-/.test(c))
    .sort()
    .join('.');

const pages = htmlFiles(DIST);
if (!pages.length) {
  console.error(`status-pulse: no built HTML under ${DIST}. Run the build first.`);
  process.exit(1);
}

/** signature -> Set(routes) for every element in dist/ wearing the recipe. */
const found = new Map();
for (const f of pages) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/class="([^"]*\bfx-status-pulse\b[^"]*)"/g)) {
    const sig = signatureOf(m[1]);
    if (!found.has(sig)) found.set(sig, new Set());
    found.get(sig).add(routeOf(f));
  }
}

const registered = new Set(CARRIERS.map((c) => c.signature));
const unregistered = [...found.keys()].filter((s) => !registered.has(s));
const stale = CARRIERS.filter((c) => !found.has(c.signature));

/* ══════════════════════════════════════════════════════════════════════════
 * THE RUNTIME ASSERTIONS — a browser, the built site, each animation seeked
 * ══════════════════════════════════════════════════════════════════════════ */

const server = await serveDist(DIST, 'status-pulse');

/**
 * A pixel counts as changed only well above encoder noise, and the MARGIN is
 * asserted separately from the count. A wash on this site once "animated" with
 * a maximum channel delta of 2/255 across 135,000 pixels: a count alone would
 * have called that a pass while nobody could see a thing.
 */
const CHANNEL_TOLERANCE = 6;
/** A mark is 8-11px across, so its whole face is ~50-100 pixels. */
const MIN_PIXELS = 12;
/** Half the alpha of a lit mark against a dark page is worth far more than this. */
const MIN_DELTA = 20;

const browser = await chromium.launch();
const results = [];
const rec = (name, pass, detail) => results.push({ name, pass, detail });

/** Decode two PNGs to RGBA in the page and compare. Count AND largest margin. */
async function compare(page, a, b) {
  return page.evaluate(
    async ([da, db, tol]) => {
      const load = (d) =>
        new Promise((res) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            const x = c.getContext('2d');
            x.drawImage(img, 0, 0);
            res(x.getImageData(0, 0, c.width, c.height).data);
          };
          img.src = d;
        });
      const [pa, pb] = await Promise.all([load(da), load(db)]);
      if (pa.length !== pb.length) return { changed: -1, total: 0, delta: 0 };
      let changed = 0;
      let delta = 0;
      for (let i = 0; i < pa.length; i += 4) {
        const d = Math.max(
          Math.abs(pa[i] - pb[i]),
          Math.abs(pa[i + 1] - pb[i + 1]),
          Math.abs(pa[i + 2] - pb[i + 2]),
        );
        if (d > delta) delta = d;
        if (d > tol) changed++;
      }
      return { changed, total: pa.length / 4, delta };
    },
    [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`, CHANNEL_TOLERANCE],
  );
}

/** Freeze every animation on `selector` and park the recipe at `t` ms. */
const seek = (page, selector, t) =>
  page.evaluate(
    ([sel, time, anim]) => {
      const el = document.querySelector(sel);
      let moved = 0;
      for (const a of el.getAnimations({ subtree: true })) {
        a.pause();
        try {
          a.currentTime = a.animationName === anim ? time : 0;
          if (a.animationName === anim) moved++;
        } catch {
          /* a scroll-driven animation rejects a time; it is not on a clock */
        }
      }
      return moved;
    },
    [selector, t, ANIM],
  );

const motion = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await motion.newPage();

for (const c of CARRIERS) {
  await page.goto(server.url(c.route), { waitUntil: 'load' });
  const el = page.locator(c.selector).first();

  /* ── RUNNING ─────────────────────────────────────────────────────────── */
  const state = await page.evaluate(
    ([sel, anim]) => {
      const node = document.querySelector(sel);
      if (!node) return { found: false };
      const list = node.getAnimations().map((a) => ({
        name: a.animationName,
        state: a.playState,
        /* Infinity does not survive JSON, so it is resolved to a word here. */
        iter: a.effect.getTiming().iterations === Infinity ? 'infinite' : String(a.effect.getTiming().iterations),
        dur: a.effect.getTiming().duration,
      }));
      return { found: true, list };
    },
    [c.selector, ANIM],
  );
  const live = state.found && state.list.find((a) => a.name === ANIM);
  rec(
    `${c.route} ${c.selector} RUNS`,
    Boolean(live) && live.state === 'running' && live.iter === 'infinite',
    state.found
      ? `getAnimations() -> [${state.list.map((a) => `${a.name}:${a.state}:${a.dur}ms:${a.iter}`).join(', ') || 'EMPTY'}]`
      : 'the element does not exist on this route',
  );

  /* ── PAINTS ──────────────────────────────────────────────────────────── */
  if (live) {
    await el.scrollIntoViewIfNeeded();
    const half = Math.round(live.dur / 2);
    const moved = await seek(page, c.selector, 0);
    const peak = await el.screenshot({ animations: 'allow' });
    await seek(page, c.selector, half);
    const trough = await el.screenshot({ animations: 'allow' });
    const d = await compare(page, peak, trough);
    rec(
      `${c.route} ${c.selector} PAINTS`,
      moved > 0 && d.changed >= MIN_PIXELS && d.delta >= MIN_DELTA,
      `${d.changed} px of ${d.total} changed between t=0 and t=${half}ms, largest channel delta ${d.delta}/255 (needs >=${MIN_PIXELS} px and >=${MIN_DELTA}/255)`,
    );
  } else {
    rec(`${c.route} ${c.selector} PAINTS`, false, 'not measured: nothing is running to seek');
  }
}
await motion.close();

/* ── STILL — the same marks under a reader who asked for no motion ──────── */
const quiet = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const quietPage = await quiet.newPage();
for (const c of CARRIERS) {
  await quietPage.goto(server.url(c.route), { waitUntil: 'load' });
  const r = await quietPage.evaluate(
    ([sel, anim]) => {
      const node = document.querySelector(sel);
      if (!node) return { found: false };
      return {
        found: true,
        pulsing: node.getAnimations().filter((a) => a.animationName === anim).length,
        names: node.getAnimations().map((a) => a.animationName).join(', ') || 'none',
        opacity: getComputedStyle(node).opacity,
      };
    },
    [c.selector, ANIM],
  );
  rec(
    `${c.route} ${c.selector} STILL under reduced motion`,
    r.found && r.pulsing === 0 && r.opacity === '1',
    r.found
      ? `${r.pulsing} ${ANIM} animation(s) [${r.names}], computed opacity ${r.opacity} — the mark has to stay lit, not merely stop`
      : 'the element does not exist on this route',
  );
}
await quiet.close();
await browser.close();
server.close();

/* ══════════════════════════════════════════════════════════════════════════
 * OUTPUT — the register printed in full, every run
 * ══════════════════════════════════════════════════════════════════════════ */

console.log(
  `status-pulse: ${pages.length} built page(s) scanned, ${found.size} distinct carrier(s) of .${ANIM}`,
);
console.log(`\n  ${CARRIERS.length} registered carrier(s), each with the argument for it:\n`);
for (const c of CARRIERS) {
  const routes = found.get(c.signature);
  const where = routes ? (routes.size > 3 ? `${routes.size} routes` : [...routes].join(', ')) : 'NOWHERE';
  console.log(`    ${c.selector}${found.has(c.signature) ? '' : '   [STALE — matches nothing]'}`);
  console.log(`            .${c.signature}  on ${where}; measured at ${c.route}`);
  console.log(`            ${c.why}`);
}

const pad = (s, n) => String(s).padEnd(n);
console.log('\n' + '='.repeat(104));
console.log(`IS THE STATUS PULSE ACTUALLY MOVING? — a browser, the built site, each animation seeked`);
console.log('='.repeat(104));
let fail = 0;
for (const r of results) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? ' PASS' : ' FAIL'}  ${pad(r.name, 52)} ${r.detail}`);
}
console.log('='.repeat(104));
console.log(`${results.length - fail}/${results.length} passed`);

if (stale.length) {
  console.error(`\nstatus-pulse: ${stale.length} REGISTERED CARRIER(S) MATCH NOTHING IN dist/\n`);
  for (const c of stale) console.error(`    ${c.selector}   (.${c.signature})`);
  console.error('');
  console.error('  The register describes elements that no longer exist, so it has stopped being a');
  console.error('  description of the site. Either the element lost the class — which is the defect');
  console.error('  the owner reported on 2026-08-04 arriving again — or it is genuinely gone and the');
  console.error('  entry should be deleted along with its reason.');
}

if (unregistered.length) {
  console.error(`\nstatus-pulse: ${unregistered.length} UNREGISTERED CARRIER(S) OF .${ANIM}\n`);
  for (const s of unregistered) {
    const routes = found.get(s);
    console.error(`    .${s}   on ${routes.size > 3 ? `${routes.size} routes` : [...routes].join(', ')}`);
  }
  console.error('');
  console.error('  styles/effects.css: "A recipe that spreads is a recipe that has stopped meaning');
  console.error('  anything." A third thing that pulses is a third thing competing to be the one');
  console.error('  live mark on the page. If it genuinely reports a state a reader needs to see as');
  console.error('  CURRENT, add it to CARRIERS in this file WITH THE REASON — a sentence somebody');
  console.error('  can disagree with, naming the state, not a restatement of the class name.');
}

if (fail || stale.length || unregistered.length) {
  process.exit(1);
}

console.log(
  `\n  clean: every registered live mark is running ${ANIM}, paints a difference a reader can see,`,
);
console.log('  and stops dead — still lit — for a reader who asked for no motion. Nothing else on');
console.log('  the site wears the recipe.');
process.exit(0);
