/**
 * verify-effects-paint.mjs — do the restored effects actually PAINT?
 *
 * WHY THIS EXISTS AND WHY IT IS SEPARATE FROM verify-restorations.mjs.
 *
 * That file proves the STYLE ENGINE agrees: the rules match, the animations are
 * named, the transitions run. It cannot prove a reader sees anything. Several of
 * these effects paint at negative z-index, behind a mask, or under a label, and
 * every one of those is a way for a correct rule to produce no visible pixels:
 *
 *   - the button sweep sits at z-index -1 inside an isolated stacking context,
 *     so getting the layer wrong hides it under the button's own fill
 *   - the animated border is a conic gradient that is entirely masked away
 *     except for a 1px ring, so a wrong mask shows nothing or shows everything
 *   - the CTA pulse is a box-shadow on a pseudo-element with no background,
 *     which paints only outside its own box
 *
 * A gate that asserts a rule matched, on a defect class that is about whether
 * the rule produces light, is the exact shape of blind spot this build keeps
 * finding: the rule is right and the question it asks is wrong.
 *
 * ── HOW IT MEASURES ─────────────────────────────────────────────────────────
 *
 * SEEK, DO NOT WAIT. Every effect here is a loop or a travel, so "screenshot it
 * and see" is a race. `element.getAnimations({ subtree: true })` returns the
 * live Animation objects, INCLUDING ones on pseudo-elements, so each is paused
 * and moved to a chosen currentTime. Two frames of the same element at two
 * points in the same animation, differing in pixels, is proof that the effect
 * paints and is not a still image.
 *
 * `animations: 'allow'` on the screenshot is required. Playwright's default
 * waits for an element to stop moving before capturing, which is why an earlier
 * attempt at this compared a mid-sweep frame against an after frame and got
 * byte-identical output.
 *
 * PNG bytes are not compared. Two PNGs can differ in length for reasons that
 * have nothing to do with colour, and can compress identically while differing.
 * Both frames are decoded to raw RGBA in the page via a canvas, and the count of
 * pixels differing by more than a small threshold is the measurement.
 *
 * ── A MANUAL VERIFICATION RUN. IT IS NOT IN `npm run build` ─────────────────
 *
 * Recorded on 2026-08-04 because it exits non-zero on a failed assertion, which
 * reads as a build gate, and because styles/../layouts/Base.astro said in so
 * many words that this file "measures the delta on every run and fails if it
 * drops back below visibility" — of an effect it names. It does measure exactly
 * that, and it does not do it on every run, because it is not wired into
 * anything. That sentence has been corrected where it was written.
 *
 * WHY IT IS NOT A GATE. It drives BASE, which defaults to the preview server on
 * :8095 — a server it does not start and the chain does not either — and it
 * asserts a specific list of restored effects on specific routes rather than a
 * property of the site. Both are the marks of a verification somebody runs at a
 * moment, and neither survives being made a condition of every build: the first
 * fails on a machine with no server up, and the second turns a list of seven
 * decisions into something nobody can change without editing a gate.
 *
 * THE PROPERTIES WORTH ENFORCING WERE MOVED RATHER THAN LEFT HERE, which is why
 * this can stay manual honestly. check-sheen.js holds the travelling band on
 * every card and button, check-status-pulse.mjs holds the live mark, and both
 * ARE in the chain and both use this file's seek-and-diff technique, which they
 * cite. What is left here is the one-off pass over the seven restorations.
 *
 * Run: `node scripts/verify-effects-paint.mjs`, with a preview server on :8095
 * or VERIFY_BASE pointed elsewhere.
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_BASE || 'http://localhost:8095';
/** A pixel counts as changed only well above encoder noise. */
const CHANNEL_TOLERANCE = 6;
/** Below this many changed pixels an effect is not doing visible work. */
const MIN_PIXELS = 40;

const results = [];
const rec = (item, name, pass, detail) => results.push({ item, name, pass, detail });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

/** Decode two PNG buffers and count pixels that differ. Runs in the page. */
async function diffPixels(a, b) {
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
      if (pa.length !== pb.length) return { changed: -1, total: 0 };
      let changed = 0;
      for (let i = 0; i < pa.length; i += 4) {
        if (
          Math.abs(pa[i] - pb[i]) > tol ||
          Math.abs(pa[i + 1] - pb[i + 1]) > tol ||
          Math.abs(pa[i + 2] - pb[i + 2]) > tol
        )
          changed++;
      }
      return { changed, total: pa.length / 4 };
    },
    [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`, CHANNEL_TOLERANCE],
  );
}


/**
 * Freeze every animation under `selector` and park it at `t` ms.
 * Returns how many animations were found, so "nothing to seek" cannot be
 * mistaken for "seeking produced no change".
 */
const seek = (selector, t) =>
  page.evaluate(
    ([sel, time]) => {
      const el = document.querySelector(sel);
      const anims = el.getAnimations({ subtree: true });
      for (const a of anims) {
        a.pause();
        try {
          a.currentTime = time;
        } catch {
          /* a scroll-timeline animation rejects a time; it is driven elsewhere */
        }
      }
      return anims.length;
    },
    [selector, t],
  );

const shot = (locator) => locator.screenshot({ animations: 'allow' });

/* ── SHIMMER — the homepage hero eyebrow ─────────────────────────────────── */
await page.goto(`${BASE}/`, { waitUntil: 'load' });
const eyebrow = page.locator('.fx-shimmer').first();
await eyebrow.scrollIntoViewIfNeeded();

const shimmerCount = await seek('.fx-shimmer', 0);
/* 9s cycle: the band is off the left edge at 0 and crossing the middle at 4.5s. */
const shimA = await shot(eyebrow);
await seek('.fx-shimmer', 4500);
const shimB = await shot(eyebrow);
const shimD = await diffPixels(shimA, shimB);
rec(3, 'shimmer PAINTS a moving band', shimmerCount > 0 && shimD.changed >= MIN_PIXELS,
  `${shimD.changed} px changed of ${shimD.total} between t=0 and t=4.5s (${shimmerCount} animation(s))`);

/* ── ANIMATED BORDER — the final CTA block ───────────────────────────────── */
const fc = page.locator('.fc').first();
await fc.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);

const edgeCount = await seek('.fc', 0);
const edgeA = await shot(fc);
/* 18s rotation: a quarter turn puts the bright arc on a different edge. */
await seek('.fc', 4500);
const edgeB = await shot(fc);
const edgeD = await diffPixels(edgeA, edgeB);
rec(3, 'animated border PAINTS through its mask', edgeD.changed >= MIN_PIXELS,
  `${edgeD.changed} px changed of ${edgeD.total} across a quarter turn (${edgeCount} animation(s) on .fc)`);

/* The mask must leave the FILL alone. If mask-composite failed, the conic
   gradient would paint across the whole card rather than a 1px ring — which
   would put a rotating rainbow behind the page's two primary buttons. A ring
   on a ~1100x300 block is a low single-digit percentage of its area. */
const edgeShare = edgeD.total ? (edgeD.changed / edgeD.total) * 100 : 100;
rec(3, 'animated border is a RING, not a wash', edgeShare < 12,
  `${edgeShare.toFixed(1)}% of the block changed (a full-face gradient would be far higher)`);

/* ── CTA PULSE — the primary button inside the final CTA ─────────────────── */
/* Captured on the SECTION, not the button: the pulse is a box-shadow on a
   pseudo-element inset -2px, so every pixel it paints is OUTSIDE the button and
   a button-sized clip would crop away the entire effect. */
const pulseCount = await seek('.fc .btn--primary', 0);
const pulseA = await shot(fc);
/* --m-cycle is 12s and fx-pulse peaks at 50%: 0.15 opacity -> 0.7. */
await seek('.fc .btn--primary', 6000);
const pulseB = await shot(fc);
const pulseD = await diffPixels(pulseA, pulseB);
rec(3, 'CTA pulse PAINTS a breathing glow', pulseCount > 0 && pulseD.changed >= MIN_PIXELS,
  `${pulseD.changed} px changed between trough and peak (${pulseCount} animation(s) on the button)`);

/* ── SHINE — the primary button sweep, and whether it is under the label ─── */
await page.goto(`${BASE}/`, { waitUntil: 'load' });
const btn = page.locator('.fc .btn--primary').first();
await btn.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
const shineRest = await shot(btn);

await btn.hover();
/* Freeze the running transition mid-travel. The sweep is 0.62s, so 300ms puts
   the band across the face of the control. */
const shineAnims = await page.evaluate(() => {
  const b = document.querySelector('.fc .btn--primary');
  const list = b.getAnimations({ subtree: true });
  for (const a of list) {
    a.pause();
    a.currentTime = 300;
  }
  return list.map((a) => a.transitionProperty || a.animationName || 'anim').join(', ');
});
const shineMid = await shot(btn);
const shineD = await diffPixels(shineRest, shineMid);
rec(4, 'shine PAINTS across the button face', shineD.changed >= MIN_PIXELS,
  `${shineD.changed} px changed of ${shineD.total} mid-sweep [${shineAnims}]`);

/* ── AMBIENT WASH — REMOVED FROM THE SITE, SO THE CHECK IS INVERTED ─────── */
/*
 * Owner instruction, 2026-08-04: "Can you remove home page backgound gradient
 * and keep background color exactly same as
 * http://127.0.0.1:8712/concepts/homepage-v2.html". `--grad-page-wash`, the
 * `body::after` layer that painted it and the 70s `sv-wash-drift` animation are
 * all deleted from layouts/Base.astro and styles/tokens.css.
 *
 * TWO CHECKS STOOD HERE and both asserted the wash was present and moving: a
 * maximum channel delta of at least 4/255 so a reader could see it, and at most
 * 14/255 so it stayed atmosphere. Neither can pass now, and both would have
 * failed as "the effect is not painting" — reporting a deliberate removal as a
 * broken effect, which is worse than not checking at all.
 *
 * SO IT ASSERTS THE ABSENCE INSTEAD, which is a real check rather than a
 * deletion: if anybody reintroduces a page-level wash animation, this fails and
 * names it. The measurement that used to live here is preserved in Base.astro's
 * note for whoever brings one back.
 *
 * A `maxDelta(a, b)` helper went with it, and what it did is worth writing down
 * because the next barely-there effect will need it rewritten. It returned the
 * largest single-CHANNEL difference between two frames, 0-255, which is a
 * different question from `diffPixels` below it: that one counts how many pixels
 * moved, and the wash could move 135,302 of them by 2/255 and be invisible to a
 * person. An effect nobody can perceive is not subtle, it is a layer animated
 * for nothing. Anything painted at under ~0.1 alpha has to be asserted on delta,
 * not on count. The helper is deleted rather than left uncalled, because an
 * unreferenced function in a verification script is read as coverage.
 */
await page.goto(`${BASE}/pricing/`, { waitUntil: 'load' });
const washCount = await page.evaluate(
  () => document.getAnimations().filter((a) => a.animationName === 'sv-wash-drift').length
);
rec(6, 'no page wash animation survives its removal', washCount === 0,
  `${washCount} sv-wash-drift animations on /pricing. The layer, its keyframes and --grad-page-wash were all removed on 2026-08-04 by owner instruction; anything above zero means one has been reintroduced`);

/* ── SCROLL PROGRESS ─────────────────────────────────────────────────────── */
await page.goto(`${BASE}/pricing/`, { waitUntil: 'load' });
const barTop = await page.screenshot({ animations: 'allow', clip: { x: 0, y: 0, width: 1440, height: 4 } });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(400);
const barBottom = await page.screenshot({ animations: 'allow', clip: { x: 0, y: 0, width: 1440, height: 4 } });
const barD = await diffPixels(barTop, barBottom);
rec(7, 'scroll bar PAINTS and grows', barD.changed >= MIN_PIXELS,
  `${barD.changed} px changed of ${barD.total} in the top 4px between top and bottom of page`);

/* ── CAROUSEL — does a slide change actually change the picture? ─────────── */
await page.goto(`${BASE}/crowmark/`, { waitUntil: 'load' });
const view = page.locator('.pcar__viewport').first();
await view.scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const slide1 = await shot(view);
await page.click('[data-pcar-next]');
await page.waitForTimeout(1200);
const slide2 = await shot(view);
const slideD = await diffPixels(slide1, slide2);
rec(2, 'carousel PAINTS a different screen', slideD.changed >= MIN_PIXELS,
  `${slideD.changed} px changed of ${slideD.total} after pressing next`);

/* ── GLASS — does the palette actually refract the page behind it? ───────── */
await page.goto(`${BASE}/pricing/`, { waitUntil: 'load' });
const glassD = await page.evaluate(async () => {
  const panel = document.querySelector('.cmdk__panel');
  const cs = getComputedStyle(panel);
  const alpha = /\/\s*(0?\.\d+)\s*\)/.exec(cs.backgroundColor);
  return {
    filter: cs.backdropFilter || cs.webkitBackdropFilter,
    alpha: alpha ? parseFloat(alpha[1]) : 1,
  };
});
rec(5, 'glass can refract: filter AND alpha below 1', glassD.filter !== 'none' && glassD.alpha < 1,
  `backdrop-filter=${glassD.filter}, background alpha=${glassD.alpha} (a filter over an opaque fill paints nothing)`);

await browser.close();

const pad = (s, n) => String(s).padEnd(n);
let fail = 0;
console.log('\n' + '='.repeat(100));
console.log('DO THE RESTORED EFFECTS ACTUALLY PAINT? — pixels, at 1440, with each animation seeked');
console.log('='.repeat(100));
for (const r of results) {
  if (!r.pass) fail++;
  console.log(`${r.pass ? ' PASS' : ' FAIL'}  [${r.item}] ${pad(r.name, 42)} ${r.detail}`);
}
console.log('='.repeat(100));
console.log(`${results.length - fail}/${results.length} passed`);
process.exit(fail ? 1 : 0);
