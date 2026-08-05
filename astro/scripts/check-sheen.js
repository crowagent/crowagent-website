/**
 * check-sheen.js — the hover light, asserted as TRAVEL rather than as a rule.
 *
 * ── WHY THIS EXISTS, AND IT IS A STORY ABOUT GATES RATHER THAN ABOUT CSS ────
 *
 * The owner reported the card hover as wrong on 2026-08-02, on 2026-08-03 and
 * again on 2026-08-04: *"card hoover animation effect i can still see in live
 * version, we have missed something"*. Three separate passes fixed a hover and
 * declared it matched. Every one of them checked the same way — read the
 * stylesheet, confirm the declarations are present, confirm the tokens resolve.
 * The declarations WERE present each time. What was missing was a fourth
 * ingredient nobody had a rule for, so nothing anybody could read said it was
 * absent, and the gates went green on a defect the owner could see.
 *
 * A DECLARATION IS WHAT AN AUTHOR TYPED. TRAVEL IS WHAT A READER SEES. This is
 * the same distinction check-render.js records for alignment and it has now cost
 * this site twice, so the shape of the answer is the same: render it, hover it,
 * and measure the light moving.
 *
 * ── WHAT IT ASSERTS, AND WHY EACH ASSERTION CANNOT BE FAKED ─────────────────
 *
 *   1  PREFLIGHT. A hover probe in a hidden tab measures nothing: transitions do
 *      not run, so a broken effect and a working one both report "no change".
 *      This repo has already been misled by exactly that. So the gate asserts
 *      `document.visibilityState === 'visible'` AND that a real CSSTransition is
 *      in `playState: 'running'` on the pseudo-element mid-hover, BEFORE it
 *      measures anything. If either is false the GATE fails, not the assertion:
 *      the result is meaningless rather than bad, and reporting it as a clean
 *      pass is how the last three rounds went green.
 *
 *   2  THREE FRAMES, AND THE SHAPE BETWEEN THEM. A band that crosses a card and
 *      leaves it produces a specific signature: rest and settled are nearly
 *      identical, and the frame between them is different from both. A static
 *      gradient that never moves produces three identical frames. A permanently
 *      lit overlay produces three identical frames that are all different from
 *      the unhovered card. Only a real crossing produces this shape, so a
 *      declaration cannot satisfy it by existing.
 *
 *   3  A NUMERIC CROSS-CHECK. `getComputedStyle(el, '::after').transform` is
 *      sampled at two points and the x-translation must differ by more than half
 *      the card's width. Pixels tell you something changed; this tells you the
 *      thing that changed was the band's POSITION, and by how far.
 *
 *   4  THE NEGATIVE. Under `prefers-reduced-motion: reduce` the same probe must
 *      show NO travel and NO lift. That catches two opposite defects with one
 *      measurement: an effect that is missing, and an effect that ignores the
 *      preference. The lift half is A-43, found while building this — the
 *      reduced-motion override in styles/surfaces.css had been outgrown by the
 *      rule it guarded and the card was still lifting 2px under `reduce`.
 *
 * ── THE THREE FRAMES ARE TAKEN ON A HOVERED CARD, AND THAT IS DELIBERATE ────
 *
 * The obvious reading of "rest, mid, settled" is unhovered / mid-sweep / after.
 * It does not work, and the reason is worth recording because it looks like a
 * shortcut and is the opposite of one. A hovered card ALSO lifts 2px, brightens
 * its border to white and opens a 50px cast glow. Measured, that whole-card
 * change is 7.82 mean channel units against the band's 3.97 — so an unhovered
 * baseline would let the assertion pass on the LIFT alone, with the sheen
 * deleted, and the settled frame could never be "close to rest" because the card
 * is still lit when it arrives.
 *
 * So the card is hovered once and every one of its own transitions is seeked to
 * its END STATE and held there, for all three frames. The lift, the border and
 * the glow are then identical in every frame and the ONLY thing that differs is
 * where the band is. That is a stricter measurement than the naive one, not a
 * looser one: it removes the three ingredients that were already working and
 * asks solely about the fourth, which is the one that was missing.
 *
 * ── SEEK, DO NOT SLEEP ──────────────────────────────────────────────────────
 *
 * `element.getAnimations({ subtree: true })` returns the live Animation objects
 * including ones on pseudo-elements, so each frame is taken at an exact time
 * rather than at whatever time a `waitForTimeout` and a screenshot happened to
 * land on. Two constraints came out of building it and both are load-bearing:
 *
 *   FRAMES MUST BE TAKEN IN INCREASING TIME ORDER. A transition seeked past its
 *   own duration FINISHES and is removed from getAnimations, after which nothing
 *   can rewind it and every later frame is silently the end state. The first
 *   working draft of this file walked t = 0, 20, 40 ... 620 to survey the travel
 *   and then captured its frames, and reported a mean delta of 0.0015 on an
 *   effect that measures 20.4 — a clean, confident, completely wrong "this does
 *   not paint". Survey and capture are the same operation now, and it only ever
 *   goes forwards.
 *
 *   A SCROLL-DRIVEN ANIMATION REJECTS A TIME. styles/motion.css owns one, and
 *   `a.currentTime = n` on it throws. Those are identified by their timeline
 *   rather than by catching the error, counted, and reported — an empty catch
 *   here would hide a genuine seek failure on the animation under test.
 *
 * `animations: 'allow'` on every screenshot: Playwright's default waits for an
 * element to stop moving before capturing, which on a paused mid-travel frame
 * means capturing something else.
 *
 * ── THE CONTRACT, WHICH IS THE SAME AS EVERY OTHER GATE HERE ────────────────
 *
 * Named exceptions, each carrying a written reason. All of them printed on every
 * run. Exceptions matching nothing are reported as stale and fail the build.
 * Anything not listed fails.
 *
 * ── PROVED IN BOTH DIRECTIONS, 2026-08-04, AGAINST TWO PATCHED BUILDS ───────
 *
 * `DS_DIST` points the gate at a scratch copy of `dist`, so both failures were
 * exercised without disturbing the tree another agent is working in.
 *
 * FAILS, the effect missing. `.surface::after` patched to `content: none`:
 * exit 1, three FAILs, `.surface has no ::after layer to travel on` on all three
 * routes. It is reported as a FINDING and not as a preflight failure, which is
 * the whole reason the content check runs before the running-transition check.
 *
 * FAILS, the effect present and not working. The travel patched from +/-100% to
 * +/-2%, so the rule is there, the layer is generated, the gradient is correct,
 * a real CSSTransition runs and the band is lit — everything a stylesheet can be
 * read for is intact. Exit 1, nine FAILs: 0.69 mean channel against a threshold
 * of 1.0, a settled frame no closer to rest than the mid frame, and 46px of
 * travel across a 1,160px card. THIS IS THE CASE THAT MATTERS. It is exactly
 * what a declaration-reading gate passes, and it is the shape of every one of
 * the three rounds that went green on a hover the owner could see was wrong.
 *
 * The reduced-motion negative was also seen to fail for real rather than by
 * patching: on its first run against the shipped build it reported
 * `A-43: no lift under reduced motion — transform is matrix(1, 0, 0, 1, 0, -2)`
 * on the card and `matrix(1.05, 0, 0, 1.05, 0, -1.5)` on the button. Both were
 * live accessibility defects and both are fixed.
 *
 * PASSES: against the shipped build it exits 0 on 27 assertions.
 *
 * Proving the pass path is not ceremony on this codebase. check-facts.js once
 * printed "every rule clean" while crashing on its reporting path, so the clean
 * result had never executed the code that reports a violation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * `{ probe, reason }`, where `probe` is the label this gate prints. A card that
 * legitimately carries no sheen would go here — the known way for that to happen
 * is a component claiming `::after` for itself, since Astro's scoped styles are
 * unlayered and win. A reason that only says "intentional" is not a reason.
 *
 * EMPTY, AND THAT IS THE STATE TO KEEP IT IN. A future entry has to argue
 * against a clean baseline rather than join a crowd. */
const ALLOW = [];

/* ── THRESHOLDS, EVERY ONE OF THEM MEASURED BEFORE IT WAS CHOSEN ────────────
 *
 * MEAN_DELTA is the mean absolute per-channel difference between two frames, on
 * the 0-255 scale, over every pixel of the element. It is a MEAN rather than a
 * count of changed pixels because the band covers a diagonal slice of a card and
 * a count would be dominated by the card's size rather than by the band's
 * strength.
 *
 * Measured on the shipped build, on a 456x188 card on /about:
 *
 *     band arrives (rest -> mid)   3.97   max channel 24
 *     band leaves  (rest -> settled) 0.0008  max channel 1
 *
 * 1.0 sits four times below the real reading and more than a thousand times
 * above the absent one, so it cannot be met by encoder noise and cannot be
 * missed by a working effect. The button sweep measures 20.4 against the same
 * threshold, which is why one number serves both.
 *
 * SETTLED_RATIO is the second half of the same assertion and it is what makes
 * the shape unfakeable: the settled frame must be at least four times closer to
 * rest than the mid frame is. A permanently lit overlay fails it outright. */
const MEAN_DELTA = 1.0;
const SETTLED_RATIO = 4;

/* A card small enough to be a chip is not what this measures, and a card that is
   partly off screen cannot be screenshotted whole. */
const MIN_CARD = { w: 240, h: 120 };

const server = await serveDist(DIST, 'sheen');
const url = (route) => server.url(route);

const browser = await chromium.launch();

/* Findings, preflight failures and passes are three different things and are
   kept apart all the way to the exit code. A preflight failure means the
   measurement did not happen; reporting it beside a violation would let "we
   could not look" read as "we looked and it was fine". */
const results = [];
const preflight = [];
const usedAllow = new Set();
const rec = (probe, name, pass, detail) => {
  if (!pass) {
    const ex = ALLOW.find((a) => a.probe === probe);
    if (ex) {
      usedAllow.add(ex.probe);
      results.push({ probe, name, pass: true, detail: `${detail}   [allowed: ${ex.reason}]` });
      return;
    }
  }
  results.push({ probe, name, pass, detail });
};

/* ── PIXELS ─────────────────────────────────────────────────────────────────
 *
 * PNG bytes are never compared. Two PNGs can differ in length for reasons that
 * have nothing to do with colour and can compress identically while differing.
 * Both frames are decoded to raw RGBA through a canvas in the page — the same
 * technique scripts/verify-effects-paint.mjs uses — and the mean absolute
 * per-channel difference is the measurement.
 */
function meanDelta(page, a, b) {
  return page.evaluate(
    async ([da, db]) => {
      const load = (d) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            const x = c.getContext('2d');
            x.drawImage(img, 0, 0);
            res(x.getImageData(0, 0, c.width, c.height).data);
          };
          img.onerror = () => rej(new Error('frame did not decode'));
          img.src = d;
        });
      const [pa, pb] = await Promise.all([load(da), load(db)]);
      /* Different dimensions mean the element resized between frames, which is
         a real finding rather than a comparison to fudge. */
      if (pa.length !== pb.length) return { mean: -1, max: -1 };
      let sum = 0;
      let n = 0;
      let max = 0;
      for (let i = 0; i < pa.length; i += 4) {
        for (let k = 0; k < 3; k++) {
          const d = Math.abs(pa[i + k] - pb[i + k]);
          sum += d;
          if (d > max) max = d;
        }
        n += 3;
      }
      return { mean: sum / n, max };
    },
    [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`],
  );
}

/** The x-translation out of a computed `matrix(a, b, c, d, tx, ty)`. */
function translateX(transform) {
  const m = /matrix\(([^)]+)\)/.exec(transform || '');
  if (!m) return null;
  const parts = m[1].split(',').map((s) => parseFloat(s));
  return parts.length >= 6 ? parts[4] : null;
}

/**
 * Park the animation under test at `t` and hold the entire rest of the DOCUMENT
 * still, then read back what the pseudo-element is doing.
 *
 * ── WHY IT FREEZES THE WHOLE DOCUMENT AND NOT JUST THE ELEMENT ──────────────
 *
 * The first version froze only `element.getAnimations({ subtree: true })`, and
 * it was measurably not enough. Two screenshots of the SAME frozen button, taken
 * 300ms apart with nothing about it changed, differed by a mean of 4.1 channel
 * units — because the page around and behind it was still animating: the hero's
 * ambient fields, the page wash, the starfield. The band itself contributes
 * about 2 units of mean on a 152px control, so the noise was TWICE the signal
 * and the settled frame came out further from rest than the mid frame did.
 *
 * scripts/verify-effects-paint.mjs records the identical lesson from the other
 * direction: it once attributed 135,302 changed pixels to a background wash that
 * had never been seeked, because the starfield was still running.
 *
 * So everything on a document timeline is paused. What is NOT done is seeking
 * those others anywhere: an infinite loop has no end state to move to, and
 * jumping one to an arbitrary time would introduce exactly the difference this
 * is removing. They are held wherever they are, which makes them identical in
 * every frame — which is all that is required.
 *
 * ONLY EVER CALLED WITH AN INCREASING `t` for a given hover; see the header.
 */
function freeze(page, selector, pseudo, propRe, t) {
  return page.evaluate(
    ([sel, ps, re, time]) => {
      const el = document.querySelector(sel);
      if (!el) return { error: 'element vanished' };
      const mine = new Set(el.getAnimations({ subtree: true }));
      let under = 0;
      let scrollDriven = 0;
      let held = 0;
      for (const a of document.getAnimations()) {
        /* A scroll-driven animation is on a progress timeline and rejects an
           absolute time. Identified rather than caught, so a genuine seek
           failure on the animation under test still throws and is reported. */
        if (a.timeline !== document.timeline) {
          scrollDriven++;
          continue;
        }
        a.pause();
        if (!mine.has(a)) {
          held++;
          continue;
        }
        const p = (a.effect && a.effect.pseudoElement) || '';
        const isUnderTest = p === ps && new RegExp(re).test(a.transitionProperty || '');
        /* The element's OTHER transitions are the hover state arriving — the
           lift, the border, the glow. Held at their END so they are identical in
           every frame and only the band can contribute to the delta. */
        a.currentTime = isUnderTest ? time : 60000;
        if (isUnderTest) under++;
      }
      const cs = getComputedStyle(el, ps);
      return {
        under,
        scrollDriven,
        held,
        hovered: el.matches(':hover'),
        content: cs.content,
        transform: cs.transform,
        backgroundPositionX: cs.backgroundPositionX,
        opacity: cs.opacity,
        elementTransform: getComputedStyle(el).transform,
      };
    },
    [selector, pseudo, propRe.source, t],
  );
}

/**
 * PREFLIGHT. Read BEFORE anything is paused: a paused animation is not a running
 * one, so this can only be asked once and it has to be asked first.
 */
function probeLive(page, selector, pseudo) {
  return page.evaluate(
    ([sel, ps]) => {
      const el = document.querySelector(sel);
      if (!el) return { visibility: document.visibilityState, running: [], all: [] };
      const anims = el.getAnimations({ subtree: true });
      const shape = (a) => ({
        ctor: a.constructor.name,
        prop: a.transitionProperty || a.animationName || '',
        pseudo: (a.effect && a.effect.pseudoElement) || '',
        state: a.playState,
      });
      return {
        visibility: document.visibilityState,
        hovered: el.matches(':hover'),
        all: anims.map(shape),
        running: anims
          .filter((a) => a.constructor.name === 'CSSTransition' && a.playState === 'running')
          .filter((a) => ((a.effect && a.effect.pseudoElement) || '') === ps)
          .map(shape),
      };
    },
    [selector, pseudo],
  );
}

/**
 * Put the pointer in the middle of the element and let the transition start.
 *
 * IT VERIFIES THAT THE HOVER LANDED, AND IT HAS TO. A bounding box is read at
 * one instant and the pointer is moved at the next; anything that reflows in
 * between — a font swapping in, an image resolving its intrinsic size, a section
 * arriving — moves the target out from under a pointer that is now sitting on
 * empty page. The result is not an error, it is a probe that measures a control
 * nobody is touching and reports it as unchanged, which is the same false clean
 * a hidden tab produces. Measured on the homepage hero: the first attempt missed
 * every time and reported `getAnimations()` completely empty.
 *
 * So the box is re-read and the move repeated until `:hover` actually matches.
 * Twice is enough for a reflow; a control that cannot be hovered in two attempts
 * is covered by something, which is a finding rather than a retry.
 */
async function hover(page, selector) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const box = await page.locator(selector).boundingBox();
    if (!box) return null;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    /* Long enough for the browser to process the input and start the
       transition, short enough that a 900ms travel is nowhere near over. */
    await page.waitForTimeout(60);
    const on = await page.evaluate((s) => {
      const el = document.querySelector(s);
      return Boolean(el && el.matches(':hover'));
    }, selector);
    if (on) return box;
    /* Move away first, so the next attempt is a genuine enter rather than a
       move within an element that is already hovered. */
    await page.mouse.move(0, 0);
    await page.waitForTimeout(80);
  }
  return null;
}

/**
 * THE FRAMES ARE CLIPPED PAGE SHOTS, NOT ELEMENT SHOTS, AND THAT IS A BUG FIX.
 *
 * `locator.screenshot()` scrolls its target into view before capturing. The
 * pointer's coordinates are viewport-fixed, so any scroll slides the element out
 * from under it and the hover ends — silently, between one frame and the next.
 * Measured on the homepage buttons: frame one was taken on a hovered control and
 * frames two and three on a control the pointer had left, so the sweep appeared
 * never to move and the gate reported a working effect as dead.
 *
 * A clipped page screenshot does not scroll and runs no actionability checks, so
 * the pointer stays exactly where it was put. The clip is read once, after the
 * hover is established — a button is 5% larger under a pointer, so a rectangle
 * read before the hover would crop it.
 */
async function clipOf(page, selector) {
  const box = await page.locator(selector).boundingBox();
  if (!box) return null;
  const vp = page.viewportSize();
  const x = Math.max(0, Math.floor(box.x));
  const y = Math.max(0, Math.floor(box.y));
  const width = Math.min(Math.ceil(box.width), vp.width - x);
  const height = Math.min(Math.ceil(box.height), vp.height - y);
  return width > 0 && height > 0 ? { x, y, width, height } : null;
}

const shot = (page, clip) => page.screenshot({ animations: 'allow', clip });

/**
 * `load` is not enough. A web font can still be resolving when it fires, and a
 * label that reflows between the first frame and the third puts the whole
 * difference between two typefaces into a measurement that is supposed to be
 * about a band of light. Waiting on `document.fonts.ready` costs nothing and
 * removes the largest single source of frame-to-frame difference on a control.
 */
async function open(page, route) {
  await page.goto(url(route), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
}

/* ══════════════════════════════════════════════════════════════════════════
 * THE CARD SHEEN
 * ══════════════════════════════════════════════════════════════════════════ */

const CARD_ROUTES = ['/', '/about/', '/pricing/'];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const route of CARD_ROUTES) {
  const probe = `card ${route}`;
  await open(page, route);

  /* The first card big enough to hold a band, chosen on the rendered page rather
     than named here, so this keeps measuring the right thing as pages change.
     Its class signature is printed, so a run always says what it looked at. */
  const target = await page.evaluate(
    ([minW, minH]) => {
      const el = [...document.querySelectorAll('.surface')].find((e) => {
        const r = e.getBoundingClientRect();
        return r.width >= minW && r.height >= minH;
      });
      if (!el) return null;
      el.setAttribute('data-sheen-probe', '');
      el.scrollIntoView({ block: 'center' });
      const r = el.getBoundingClientRect();
      return {
        sig: `${el.tagName.toLowerCase()}.${[...el.classList].filter((c) => !/^astro-/.test(c)).join('.')}`,
        w: r.width,
        h: r.height,
      };
    },
    [MIN_CARD.w, MIN_CARD.h],
  );

  if (!target) {
    preflight.push(`${probe}: no .surface at least ${MIN_CARD.w}x${MIN_CARD.h} on this route`);
    continue;
  }
  await page.waitForTimeout(250);

  const SEL = '[data-sheen-probe]';
  const restClip = await clipOf(page, SEL);
  if (!restClip) {
    preflight.push(`${probe} (${target.sig}): the card has no visible box inside the viewport to clip a frame from.`);
    continue;
  }
  const unhovered = await shot(page, restClip);
  if (!(await hover(page, SEL))) {
    preflight.push(`${probe} (${target.sig}): the pointer could not be brought onto the card in three attempts, so nothing was hovered and nothing could be measured.`);
    continue;
  }

  /* A MISSING LAYER IS A FINDING, NOT A PREFLIGHT FAILURE, and the order of
     these two checks is what decides which it gets reported as. Asked the other
     way round, a `.surface` with no `::after` has no transition to be running
     either, so it comes out as "the probe could not measure" — which is the
     softer of the two sentences and the wrong one. There is nothing wrong with
     the probe; the effect is absent. */
  const rest = await page.evaluate((s) => getComputedStyle(document.querySelector(s), '::after').content, SEL);
  if (rest === 'none') {
    rec(probe, 'the card has a sheen layer', false,
      `${target.sig}: .surface has no ::after layer to travel on (content: none)`);
    await page.mouse.move(0, 0);
    continue;
  }

  const live = await probeLive(page, SEL, '::after');
  if (live.visibility !== 'visible' || !live.hovered) {
    preflight.push(`${probe}: document.visibilityState is "${live.visibility}" and :hover is ${live.hovered}. Transitions do not run in a hidden tab and nothing transitions on a control nobody is touching, so every reading below would be a false clean.`);
    continue;
  }
  const running = live.running.filter((a) => a.prop === 'transform');
  if (!running.length) {
    preflight.push(
      `${probe} (${target.sig}): no CSSTransition running on ::after transform mid-hover. ` +
      `Found instead: ${live.all.map((a) => `${a.ctor} ${a.prop}${a.pseudo}=${a.state}`).join(', ') || 'nothing'}`,
    );
    continue;
  }

  /* Increasing order, and the reason is in the header: a transition seeked past
     its duration is removed and cannot be rewound.
       0     the band is one full card width off the left edge
       450   half of 900ms on a LINEAR travel, so the band is dead centre
       1300  past the end: the band is a full card width off the right edge */
  const at0 = await freeze(page, SEL, '::after', /^transform$/, 0);
  const litClip = await clipOf(page, SEL);
  const frameRest = await shot(page, litClip);
  const at450 = await freeze(page, SEL, '::after', /^transform$/, 450);
  const frameMid = await shot(page, litClip);
  /* THE NOISE FLOOR, MEASURED RATHER THAN ASSUMED. Two frames of the identical
     frozen state, back to back. Anything above zero here is the page still
     moving behind the element, and it is subtracted from nothing — it is a
     PREFLIGHT, because a signal that is not clear of its own noise is not a
     measurement. Before the whole document was frozen this read 4.1 on a
     152px button against a 2-unit signal. */
  const frameMidAgain = await shot(page, litClip);
  const at1300 = await freeze(page, SEL, '::after', /^transform$/, 1300);
  const frameSettled = await shot(page, litClip);
  await page.mouse.move(0, 0);

  rec(probe, 'the card has a sheen layer', at0.content !== 'none',
    `${target.sig}: ::after content is ${at0.content}`);

  /* THE SEEK ITSELF IS CHECKED. A frame taken while the animation under test was
     not found, or after the pointer slipped off, is a picture of the rest state
     dressed up as a measurement — and three of those in a row look exactly like
     a working effect that happens to be invisible. */
  const seeks = [at0, at450, at1300];
  if (seeks.some((s) => s.under !== 1) || seeks.some((s) => !s.hovered)) {
    preflight.push(
      `${probe} (${target.sig}): the three frames were not all taken on a hovered card with the ` +
      `::after transform transition in hand — under=[${seeks.map((s) => s.under).join(',')}], ` +
      `hovered=[${seeks.map((s) => s.hovered).join(',')}]`,
    );
    continue;
  }

  const noise = await meanDelta(page, frameMid, frameMidAgain);
  if (noise.mean > MEAN_DELTA / 4) {
    preflight.push(
      `${probe} (${target.sig}): two frames of the SAME frozen state differ by ${noise.mean.toFixed(3)} ` +
      `mean channel units. Something on the page is still moving, so nothing below separates the band ` +
      `from the noise. ${at450.held} other animation(s) were held.`,
    );
    continue;
  }

  const dMid = await meanDelta(page, frameRest, frameMid);
  const dSettled = await meanDelta(page, frameRest, frameSettled);
  const dFull = await meanDelta(page, unhovered, frameMid);

  rec(probe, 'the band CROSSES the card', dMid.mean >= MEAN_DELTA,
    `${target.sig} ${Math.round(target.w)}x${Math.round(target.h)}: mean channel delta ${dMid.mean.toFixed(3)} at mid-travel ` +
    `(threshold ${MEAN_DELTA}, max channel ${dMid.max}); the whole hover moves ${dFull.mean.toFixed(2)}`);

  rec(probe, 'the band LEAVES again', dSettled.mean * SETTLED_RATIO < dMid.mean,
    `settled is ${dSettled.mean.toFixed(4)} from rest against ${dMid.mean.toFixed(3)} at mid — ` +
    `${(dMid.mean / Math.max(dSettled.mean, 1e-6)).toFixed(0)}x closer, needs ${SETTLED_RATIO}x. ` +
    'A permanently lit overlay fails this and a static gradient fails both');

  const x0 = translateX(at0.transform);
  const x450 = translateX(at450.transform);
  const x1300 = translateX(at1300.transform);
  const travelled = x0 === null || x1300 === null ? 0 : Math.abs(x1300 - x0);
  rec(probe, 'and the TRANSFORM says how far', travelled > target.w / 2,
    `::after translateX ${x0 === null ? '?' : x0.toFixed(0)} -> ${x450 === null ? '?' : x450.toFixed(0)} -> ` +
    `${x1300 === null ? '?' : x1300.toFixed(0)}px, i.e. ${travelled.toFixed(0)}px across a ${Math.round(target.w)}px card ` +
    `(needs more than half, ${Math.round(target.w / 2)}px)`);

  if (at0.scrollDriven) {
    console.log(`  note: ${probe} carried ${at0.scrollDriven} scroll-driven animation(s), held at their own progress rather than seeked`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * THE BUTTON SWEEP — on every button, not only the primary
 * ══════════════════════════════════════════════════════════════════════════ */

const BUTTONS = [
  { route: '/', sel: 'main .btn--primary', label: 'button primary' },
  { route: '/', sel: 'main .btn--secondary', label: 'button secondary' },
];

for (const b of BUTTONS) {
  const probe = b.label;
  await open(page, b.route);
  const found = await page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    el.setAttribute('data-sheen-probe', '');
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    return { sig: `${el.tagName.toLowerCase()}.${[...el.classList].filter((c) => !/^astro-/.test(c)).join('.')}`, w: r.width };
  }, b.sel);

  if (!found) {
    preflight.push(`${probe}: no element matching ${b.sel} on ${b.route}`);
    continue;
  }
  await page.waitForTimeout(250);

  const SEL = '[data-sheen-probe]';
  if (!(await hover(page, SEL))) {
    preflight.push(`${probe} (${found.sig}): the pointer could not be brought onto the control in three attempts.`);
    continue;
  }
  /* Same ordering argument as the card: a missing layer is a finding. */
  const rest = await page.evaluate((s) => getComputedStyle(document.querySelector(s), '::after').content, SEL);
  if (rest === 'none') {
    rec(probe, 'the button has a sweep layer', false,
      `${found.sig}: .btn has no ::after layer to sweep on (content: none)`);
    await page.mouse.move(0, 0);
    continue;
  }
  const live = await probeLive(page, SEL, '::after');
  if (live.visibility !== 'visible' || !live.hovered) {
    preflight.push(`${probe}: document.visibilityState is "${live.visibility}" and :hover is ${live.hovered}.`);
    continue;
  }
  const running = live.running.filter((a) => /^background-position/.test(a.prop));
  if (!running.length) {
    preflight.push(
      `${probe} (${found.sig}): no CSSTransition running on ::after background-position mid-hover. ` +
      `Found instead: ${live.all.map((a) => `${a.ctor} ${a.prop}${a.pseudo}=${a.state}`).join(', ') || 'nothing'}`,
    );
    continue;
  }

  /* 0 / 60 / 1000ms. The sweep is 0.62s on --ease, an expo-out, so the band is
     mid-face at about 60ms and then crawls to the far edge — which is why the
     mid frame is not at half the duration the way the card's is. The times are
     derived from the easing rather than hunted for: at t=60 the computed
     background-position-x is 53.8%, and 250% background-size puts the band's
     centre at 0.44 of the control's width there. */
  const at0 = await freeze(page, SEL, '::after', /^background-position/, 0);
  const litClip = await clipOf(page, SEL);
  if (!litClip) {
    preflight.push(`${probe} (${found.sig}): the control has no visible box inside the viewport to clip a frame from.`);
    continue;
  }
  const frameRest = await shot(page, litClip);
  const at60 = await freeze(page, SEL, '::after', /^background-position/, 60);
  const frameMid = await shot(page, litClip);
  const frameMidAgain = await shot(page, litClip);
  const at1000 = await freeze(page, SEL, '::after', /^background-position/, 1000);
  const frameSettled = await shot(page, litClip);
  await page.mouse.move(0, 0);

  rec(probe, 'the button has a sweep layer', at0.content !== 'none',
    `${found.sig}: ::after content is ${at0.content}`);

  const bSeeks = [at0, at60, at1000];
  if (bSeeks.some((s) => s.under !== 1) || bSeeks.some((s) => !s.hovered)) {
    preflight.push(
      `${probe} (${found.sig}): the three frames were not all taken on a hovered control with the ` +
      `::after background-position transition in hand — under=[${bSeeks.map((s) => s.under).join(',')}], ` +
      `hovered=[${bSeeks.map((s) => s.hovered).join(',')}]`,
    );
    continue;
  }

  const noise = await meanDelta(page, frameMid, frameMidAgain);
  if (noise.mean > MEAN_DELTA / 4) {
    preflight.push(
      `${probe} (${found.sig}): two frames of the SAME frozen state differ by ${noise.mean.toFixed(3)} ` +
      `mean channel units. ${at60.held} other animation(s) were held.`,
    );
    continue;
  }

  const dMid = await meanDelta(page, frameRest, frameMid);
  const dSettled = await meanDelta(page, frameRest, frameSettled);

  rec(probe, 'the band CROSSES the control', dMid.mean >= MEAN_DELTA,
    `${found.sig} ${Math.round(found.w)}px wide: mean channel delta ${dMid.mean.toFixed(3)} at mid-sweep ` +
    `(threshold ${MEAN_DELTA}, max channel ${dMid.max})`);

  rec(probe, 'the band LEAVES again', dSettled.mean * SETTLED_RATIO < dMid.mean,
    `settled ${dSettled.mean.toFixed(4)} against mid ${dMid.mean.toFixed(3)}`);

  /* The numeric cross-check, in pixels rather than in percent. The layer is
     250% of the control wide, so a background-position of P% offsets the image
     by P/100 x (W - 2.5W) = -1.5 x W x P/100 pixels. */
  const pct = (v) => parseFloat(String(v));
  const px = (p) => (-1.5 * found.w * pct(p)) / 100;
  const moved = Math.abs(px(at1000.backgroundPositionX) - px(at0.backgroundPositionX));
  rec(probe, 'and the POSITION says how far', moved > found.w / 2,
    `background-position-x ${at0.backgroundPositionX} -> ${at60.backgroundPositionX} -> ${at1000.backgroundPositionX}, ` +
    `i.e. ${moved.toFixed(0)}px across a ${Math.round(found.w)}px control (needs more than half, ${Math.round(found.w / 2)}px)`);
}

/* ── THE TWO LAYERS ON ONE CONTROL ──────────────────────────────────────────
 *
 * styles/effects.css draws the CTA pulse on `.fc .btn--primary::before` and
 * Button.astro draws the sweep on `.btn::after`. They are two layers on one
 * element, and the whole risk in moving the sweep off `.btn--primary` was that
 * the two would end up fighting over one pseudo-element. Asserted rather than
 * argued: both must exist, on the same button, at the same time. */
{
  await open(page, '/');
  const both = await page.evaluate(() => {
    const el = document.querySelector('.fc .btn--primary');
    if (!el) return null;
    return {
      before: getComputedStyle(el, '::before').content,
      after: getComputedStyle(el, '::after').content,
      isolation: getComputedStyle(el).isolation,
      position: getComputedStyle(el).position,
    };
  });
  if (!both) {
    preflight.push('two layers: no .fc .btn--primary on / to check the pulse and the sweep against each other');
  } else {
    rec('two layers', 'pulse and sweep coexist on one control',
      both.before !== 'none' && both.after !== 'none',
      `.fc .btn--primary ::before=${both.before} (the pulse) and ::after=${both.after} (the sweep)`);
    rec('two layers', 'and the layer they resolve against is explicit',
      both.isolation === 'isolate' && both.position === 'relative',
      `isolation: ${both.isolation}, position: ${both.position} — both sit at z-index -1 and need a stacking context and a containing block that are declared rather than inherited by accident`);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * THE NEGATIVE — prefers-reduced-motion: reduce
 * ══════════════════════════════════════════════════════════════════════════ */

const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
const rpage = await reduced.newPage();

for (const route of CARD_ROUTES) {
  const probe = `reduce ${route}`;
  await open(rpage, route);
  const target = await rpage.evaluate(
    ([minW, minH]) => {
      const el = [...document.querySelectorAll('.surface')].find((e) => {
        const r = e.getBoundingClientRect();
        return r.width >= minW && r.height >= minH;
      });
      if (!el) return null;
      el.setAttribute('data-sheen-probe', '');
      el.scrollIntoView({ block: 'center' });
      return { sig: `${el.tagName.toLowerCase()}.${[...el.classList].filter((c) => !/^astro-/.test(c)).join('.')}` };
    },
    [MIN_CARD.w, MIN_CARD.h],
  );
  if (!target) {
    preflight.push(`${probe}: no .surface at least ${MIN_CARD.w}x${MIN_CARD.h} on this route`);
    continue;
  }
  await rpage.waitForTimeout(200);

  const SEL = '[data-sheen-probe]';
  const vis = await rpage.evaluate(() => document.visibilityState);
  if (vis !== 'visible') {
    preflight.push(`${probe}: document.visibilityState is "${vis}".`);
    continue;
  }
  await hover(rpage, SEL);
  /* Longer than any transition on the card, so anything that was going to move
     has finished moving. */
  await rpage.waitForTimeout(1200);

  const state = await rpage.evaluate((s) => {
    const el = document.querySelector(s);
    return {
      after: getComputedStyle(el, '::after').content,
      elementTransform: getComputedStyle(el).transform,
      pseudoAnims: el.getAnimations({ subtree: true })
        .filter((a) => ((a.effect && a.effect.pseudoElement) || '') === '::after').length,
    };
  }, SEL);
  await rpage.mouse.move(0, 0);

  rec(probe, 'no sheen under reduced motion', state.after === 'none' && state.pseudoAnims === 0,
    `${target.sig}: ::after content is ${state.after} with ${state.pseudoAnims} animation(s) on it. ` +
    'The rule is generated inside prefers-reduced-motion: no-preference, so under reduce there is no layer at all');

  /* A-43. The reduced-motion override had been outgrown by the lift rule it
     guarded: the selector list named a, button, label and .surface--lift while
     the lift had been widened to every .surface. Measured, a bare card still
     went none -> translateY(-2px) under the pointer with reduce set. */
  const flat = state.elementTransform === 'none' || state.elementTransform === 'matrix(1, 0, 0, 1, 0, 0)';
  rec(probe, 'A-43: no lift under reduced motion', flat,
    `${target.sig}: the hovered card's own transform is ${state.elementTransform}`);
}

{
  const probe = 'reduce button';
  await open(rpage, '/');
  const found = await rpage.evaluate(() => {
    const el = document.querySelector('main .btn--primary');
    if (!el) return null;
    el.setAttribute('data-sheen-probe', '');
    el.scrollIntoView({ block: 'center' });
    return { sig: [...el.classList].filter((c) => !/^astro-/.test(c)).join('.') };
  });
  if (!found) {
    preflight.push(`${probe}: no main .btn--primary on /`);
  } else {
    await rpage.waitForTimeout(200);
    const SEL = '[data-sheen-probe]';
    const before = await rpage.evaluate((s) => getComputedStyle(document.querySelector(s), '::after').backgroundPositionX, SEL);
    await hover(rpage, SEL);
    await rpage.waitForTimeout(900);
    const after = await rpage.evaluate((s) => ({
      bpx: getComputedStyle(document.querySelector(s), '::after').backgroundPositionX,
      transform: getComputedStyle(document.querySelector(s)).transform,
    }), SEL);
    await rpage.mouse.move(0, 0);

    /* The layer itself is declared unconditionally — it is the TRAVEL that is
       gated — so the assertion is that it does not move rather than that it does
       not exist. Different construction from the card, same guarantee. */
    rec(probe, 'no sweep under reduced motion', before === after.bpx,
      `.${found.sig}: ::after background-position-x stayed at ${after.bpx} through a hover (was ${before})`);
    const flat = after.transform === 'none' || after.transform === 'matrix(1, 0, 0, 1, 0, 0)';
    rec(probe, 'no lift or scale under reduced motion', flat,
      `.${found.sig}: the hovered control's transform is ${after.transform}`);
  }
}

await browser.close();
server.close();

/* ══════════════════════════════════════════════════════════════════════════
 * OUTPUT
 * ══════════════════════════════════════════════════════════════════════════ */

const pad = (s, n) => String(s).padEnd(n);
console.log('\n' + '='.repeat(104));
console.log('SHEEN — the hover light measured as TRAVEL, at 1440, with every frame seeked to an exact time');
console.log('='.repeat(104));

/* PRINTED ON EVERY RUN. An exception nobody re-reads becomes an accidental one. */
console.log(`\n  ${ALLOW.length} recorded exception(s):`);
if (!ALLOW.length) {
  console.log('    none, which is the state to keep it in');
} else {
  for (const a of ALLOW) {
    console.log(`    ${a.probe}${usedAllow.has(a.probe) ? '' : '   [STALE — matched nothing]'}`);
    console.log(`        ${a.reason}`);
  }
}
const stale = ALLOW.filter((a) => !usedAllow.has(a.probe));

console.log('');
let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? ' PASS' : ' FAIL'}  ${pad(r.probe, 20)} ${pad(r.name, 42)} ${r.detail}`);
}
console.log('='.repeat(104));
console.log(`${results.length - failed}/${results.length} assertion(s) passed`);

/* A preflight failure is not a violation. It means the measurement never
   happened, and printing it beside a clean run is how "we could not look"
   becomes "we looked and it was fine" — which is how this defect survived three
   rounds of fixes. It fails the build on its own. */
if (preflight.length) {
  console.error(`\nsheen: ${preflight.length} preflight failure(s). NOTHING BELOW WAS MEASURED:\n`);
  for (const p of preflight) console.error(`  ${p}`);
  console.error(
    '\n  A hover probe needs a visible page and a running transition. Without both, an\n' +
    '  effect that is missing and an effect that is working both report no change, so\n' +
    '  the RESULT is meaningless rather than bad. Fix the probe, then read the run.\n',
  );
}

if (stale.length) {
  console.error(`\nsheen: ${stale.length} allow-list entr(ies) matched nothing. The list may only shrink.\n`);
}

if (failed || preflight.length || stale.length) process.exit(1);

console.log('\n  Every card carries a band that crosses it and leaves, every button carries a sweep,');
console.log('  the pulse and the sweep share one control without fighting over a layer, and under');
console.log('  prefers-reduced-motion: reduce nothing travels and nothing lifts.\n');
