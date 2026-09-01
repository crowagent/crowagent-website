/**
 * check-heading-ink.js — a page heading must be drawn, all of it, at full ink.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * Owner, twice, on 2026-08-03 and again on 2026-08-04:
 *
 *   "lot of headline text are showing as cut in bottom"
 *
 * A forensic audit answered it by testing seven ways text can be clipped —
 * `overflow: hidden` ancestors against real font metrics, `-webkit-line-clamp`,
 * fixed heights, band edges, occlusion, horizontal overflow, and a pixel diff of
 * the gradient box against the ink — across 43 routes at three viewports. All
 * clean. The conclusion drawn was that nothing was wrong.
 *
 * Two things were wrong, and neither is on that list.
 *
 *   1. THE RAMP. --grad-heading is tiled to ONE LINE-HEIGHT, so every glyph
 *      traverses the WHOLE gradient rather than a slice of it. Measured on the
 *      built site, luminance fell 255 -> 190 between the top of a letter and the
 *      bottom of its descender. The letters were not cut. They were dimmed until
 *      they read as cut, which is the same bug report and a different mechanism.
 *
 *   2. THE PAINT AREA. `background-clip: text` clips the background TO the
 *      glyphs, but the background is only PAINTED inside the element's box, and
 *      clipped text has no fallback colour — so ink below the box is drawn with
 *      nothing at all. Measured: 3.52px missing on /privacy at 1440, 4.50px on
 *      /about. That one is a literal cut, and no overflow property is involved,
 *      which is exactly why a survey of clipping mechanisms could not see it.
 *
 * Both were shipped, twice, by a change that was certified from computed styles
 * without anybody looking at a rendered heading. So this gate does not read
 * declarations. It photographs the heading.
 *
 * ── WHAT IT ASSERTS, AND WHY THERE IS NO ABSOLUTE THRESHOLD IN IT ───────────
 *
 * Both rules compare the heading against THE SAME HEADING WITH THE TREATMENT
 * SWITCHED OFF — flat --c-text, same glyphs, same box, same scanlines. That
 * control is what makes the rule survive a font change, a size change, a
 * viewport change and a rewording, none of which a fixed luminance floor would.
 *
 *   RULE 1  INK. On every scanline that contains at least one fully covered
 *           pixel, the treated heading must be at least 90% as bright as the
 *           flat one. A hairline descender tail is dim because it is THIN, and
 *           that is true of flat white text too, so the control divides it out
 *           and what is left is the ramp's own contribution.
 *
 *   RULE 2  EXTENT. The lowest scanline carrying ink must be the same with the
 *           treatment on as with it off, to within one device pixel. Any glyph
 *           the treatment fails to paint shows up here and nowhere else.
 *
 * ── IT PROVES ITSELF ON EVERY RUN, BEFORE IT TRUSTS A PASS ──────────────────
 *
 * This repository's most expensive lesson of the last two days is gates that
 * could not fail. So the first thing this script does is REINSTATE BOTH
 * HISTORICAL FAULTS on one route and require that each rule fires. If an
 * injected fault comes back clean the gate fails as a broken instrument, not as
 * a clean site — a passing measurement from an instrument that cannot register a
 * fault is worth nothing, and reporting one as green is how this defect shipped.
 *
 * The injected ramp is built from the page's OWN tokens, so the self-test needs
 * no literal colour and stays honest if the palette moves again.
 */


import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist, routesOf } from './lib/dist-server.js';

const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');

/* Desktop and the narrowest phone this site is designed for, because a heading
   whose gradient is legible at 1440 can lose its far stop when the clamp drops
   it to the mobile size.

   THIS SAID "the two viewports every other rendered gate on this site measures
   at", and no such convention exists. Corrected 2026-08-04. Of the eight
   browser gates, only check-timeline.js uses [1440, 390]; check-render.js
   measures 1440 and then again at 390; check-breadcrumbs.js uses [1440, 834];
   check-shared-blocks.js [1440, 834, 390]; and check-treatments.js,
   check-sheen.js and check-status-pulse.mjs measure at 1440 alone. Each picks
   the widths its own question needs, which is right — what was wrong was
   claiming a shared standard, because that is the kind of sentence somebody
   copies into the next gate instead of deciding. */
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

/* RULE 1's floor. Measured across 43 routes: the shipped ramp gives 0.944 at
   its worst and the ramp this gate was written for gave 0.741, so 0.90 sits
   clear of both with room for a re-tune that is still a sheen. */
const MIN_INK_RATIO = 0.9;

/* RULE 2's tolerance, in device pixels. One, not zero: clipped text and flat
   text are composited through different paths in Chromium and the very last
   antialiased scanline of a tail can land either side of the ink threshold. A
   missing tail is 7-9 device pixels, so one pixel of slack costs no sensitivity
   FOR A WHOLE TAIL.

   ── A-217: THIS NUMBER WAS TRIED AT ZERO AND ZERO IS WRONG ─────────────────

   A-217 is right that a one device pixel tolerance is a one device pixel blind
   spot, and at deviceScaleFactor 2 that is half a CSS pixel of clipped glyph
   this rule could never see. So it was set to 0 and the site was measured.

   IT FALSE-FAILS, AND THE PROOF IS AT THE OTHER END OF THE EXPERIMENT.
   /glossary/ at 390 reports cut = 1 on the SHIPPED build. Removing the
   heading's descender allowance ENTIRELY leaves it at cut = 1, unchanged: a
   paint-box clip grows when the paint box shrinks, and this does not, so it is
   not a clip. The row in question carries 3 inked pixels flat and 2 lit, which
   is the `ink >= 3` threshold being crossed by one pixel of antialiasing and
   nothing else. Exactly the composite-path difference the paragraph above
   describes.

   SO THE ANSWER IS NOT A SMALLER TOLERANCE, IT IS A SHARPER QUESTION, and it
   is RULE 2B below. Loosening or tightening a threshold that a real clip and an
   artefact both sit on cannot separate them; asking a different question can.
   This number stays at 1, and it is no longer the only thing standing between
   the site and a half-pixel cut. */
const EXTENT_SLACK = 1;

/* RULE 2B's two constants. INK_ROW is what counts as a row of glyph in the
 * control, the same `ink >= 3` the extent rule uses so the two rules agree
 * about what a row is. OVER_BG is how far above the page's own background a
 * row has to be lifted before the treatment counts as having painted it.
 *
 * ── THE QUESTION THAT SEPARATES A CLIP FROM AN ARTEFACT, A-217 ─────────────
 *
 * `background-clip: text` outside the paint box does not DIM a row, it draws it
 * with NOTHING. So a clipped scanline is not "a bit less ink than the control",
 * it is THE PAGE BACKGROUND where the control has a glyph. An antialiased row
 * is 2 inked pixels against 3. The two are indistinguishable if you ask how far
 * down the ink reaches, and trivially distinguishable if you ask whether the
 * treatment put any light on the row at all.
 *
 * ── AND "ANY LIGHT" HAS TO BE MEASURED AGAINST THE BACKGROUND, NOT AGAINST ──
 * ── A FIXED THRESHOLD. THIS RULE WAS BUILT THE WRONG WAY FIRST. ────────────
 *
 * The first version asked whether the lit row had zero pixels over luminance
 * 120, the same threshold the ink count uses. It reported /faq/ and one blog
 * post at 390 as clipped. They are not. Measured on those rows: the flat
 * control peaks at 165, the treated heading peaks at 86, and the page
 * background peaks at 12. The row IS painted, at 86 against a ground of 12, and
 * it simply lands under a threshold chosen for counting glyph pixels. Raising
 * the descender allowance to 0.24em does not change it by one pixel, which is
 * the proof it was never a paint-box clip: a clip grows when the box shrinks
 * and this does not move at all.
 *
 * So the test is `lit peak <= background peak + OVER_BG`. A clipped row sits ON
 * the background. A dim tail sits 74 above it. Nothing between them is close.
 *
 * (A tail at 86 against a control at 165 is dimness, and dimness is rule 1's
 * subject. Rule 1 deliberately ignores rows the control does not fully cover,
 * because a hairline tail is dim in flat white too and dividing that out is the
 * whole point of having a control. That decision is not reopened here.)
 *
 * RULE 2B THEREFORE FAILS ON ONE UNDRAWN ROW, WITH NO SLACK, and it is more
 * sensitive than rule 2 at any tolerance: half a CSS pixel of clip is one
 * device row of background where a glyph should be, and it fires. Red-proven on
 * every run by FAULT 2C. */
const INK_ROW = 3;
const OVER_BG = 24;

/* The route the self-test runs on. It has to be one whose LAST line ends in a
   descender, because only the last line can overflow the paint box — an inner
   line's tail hangs into the next line box, which is still inside the element.
   If this route's heading is ever reworded to end without one, the self-test
   fails loudly and says so rather than quietly proving nothing. */
const SELF_TEST = { route: '/privacy/', viewport: VIEWPORTS[0] };

const server = await serveDist(DIST, 'heading-ink');
const url = (route) => server.url(route);

/**
 * Find the page heading and mark it, WITHOUT naming a class.
 *
 * A name list would have to be kept in step with every layout, and the whole
 * point of this gate is to catch the case where a heading is not what the
 * stylesheet thinks it is. So the target is chosen by what it IS on the rendered
 * page: the first h1 whose text is painted through a clipped background rather
 * than with a colour. That is precisely the population at risk — an h1 painted
 * with a plain colour cannot suffer either fault.
 */
const FIND = `(() => {
  for (const el of document.querySelectorAll('h1')) {
    const cs = getComputedStyle(el);
    const clipped = /text/.test(cs.webkitBackgroundClip || '') || /text/.test(cs.backgroundClip || '');
    const painted = cs.backgroundImage && cs.backgroundImage !== 'none';
    if (!clipped || !painted) continue;
    el.setAttribute('data-ink-probe', '');
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    /* A SEGMENT THAT PAINTS ITSELF IS A SECOND TREATMENT AND IS NOT MEASURED
       HERE. The homepage hero sets "Get paid." in the teal-to-violet spectrum,
       which is a decision the palette gates own; against a flat white control it
       reads as a 79% loss of ink and would fail this rule on every run. A rule
       that fires on the one heading it was never about is a rule somebody
       deletes, so the columns such a segment occupies are excluded — and only
       those columns, so the white half of the same heading is still measured. */
    const skip = [];
    for (const kid of el.querySelectorAll('*')) {
      const k = getComputedStyle(kid);
      if (!k.backgroundImage || k.backgroundImage === 'none') continue;
      const kr = kid.getBoundingClientRect();
      skip.push({ left: kr.left, right: kr.right });
    }
    return {
      sig: el.tagName.toLowerCase() + '.' + [...el.classList].filter((c) => !/^astro-/.test(c)).join('.'),
      text: (el.textContent || '').trim().slice(0, 44),
      top: r.top, left: r.left, width: r.width, height: r.height,
      skip,
    };
  }
  return null;
})()`;

/**
 * Per-scanline peak luminance and ink count, decoded through a canvas in the
 * page — the same technique check-sheen.js and verify-effects-paint.mjs use, and
 * for the same reason: PNG bytes say nothing about colour.
 *
 * The summary of a row is its BRIGHTEST pixel. Antialiased edges are darker than
 * the stroke they belong to, so a mean would report the outline rather than the
 * colour the ramp painted, and every heading would look dim.
 */
function scanlines(page, png, mask) {
  return page.evaluate(async ([data, bands]) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = () => rej(new Error('frame did not decode'));
      img.src = data;
    });
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const px = ctx.getImageData(0, 0, c.width, c.height).data;
    const masked = (x) => bands.some((b) => x >= b.from && x <= b.to);
    const rows = [];
    for (let y = 0; y < c.height; y++) {
      let peak = 0;
      let ink = 0;
      for (let x = 0; x < c.width; x++) {
        if (masked(x)) continue;
        const i = (y * c.width + x) * 4;
        const L = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
        if (L > peak) peak = L;
        if (L > 120) ink++;
      }
      rows.push({ peak, ink });
    }
    return rows;
  }, [`data:image/png;base64,${png.toString('base64')}`, mask]);
}

/**
 * RULE 3's probe. A-209 and A-217, added 2026-09-01.
 *
 * ── THE HALF OF THE FIX NOTHING WAS WATCHING ──────────────────────────────
 *
 * The descender allowance is a PAIR: a `padding-block-end` that grows the paint
 * box so the tail has a background to be clipped out of, and an equal negative
 * `margin-block-end` that takes the same distance back out of layout so no box
 * moves. Rules 1 and 2 photograph ink, so they see the PADDING half the moment
 * it goes and say nothing at all about the MARGIN half.
 *
 * DELETING THE MARGIN ALONE THEREFORE PASSED EVERY GATE ON THIS SITE. Nothing
 * is clipped, no ink is missing, both existing rules stay green, and a 0.16em
 * gap opens under the heading that nobody can attribute to anything. The
 * component's own comment recorded that hole and no instrument closed it.
 *
 * SO THIS ASSERTS THE RELATIONSHIP RATHER THAN EITHER VALUE. Any element in the
 * measured heading that pads its block end must cancel that pad with its own
 * negative bottom margin, to within half a CSS pixel. It names no constant, so
 * 0.12em in styles/headings.css and 0.16em in HeroStack.astro both satisfy it
 * and a future re-measurement of either needs no edit here. What it forbids is
 * exactly one thing: an allowance that costs layout.
 *
 * IT IS SCOPED TO THE CLIPPED HEADING AND ITS DESCENDANTS, which is the only
 * population where a bottom pad can mean anything but space. A heading that
 * wants space below it has a margin for that, and rule 3 does not reach a
 * single element outside the one heading this gate is already measuring.
 */
const PAIR = `(() => {
  const el = document.querySelector('[data-ink-probe]');
  if (!el) return [];
  const out = [];
  const look = (n) => {
    const cs = getComputedStyle(n);
    const pad = parseFloat(cs.paddingBlockEnd) || 0;
    /* Under half a pixel is not an allowance, it is a rounding artefact. */
    if (pad < 0.5) return;
    const margin = parseFloat(cs.marginBlockEnd) || 0;
    out.push({
      sig: n.tagName.toLowerCase() + '.' +
        [...n.classList].filter((c) => !/^astro-/.test(c)).join('.'),
      pad: Math.round(pad * 100) / 100,
      margin: Math.round(margin * 100) / 100,
      net: Math.round((pad + margin) * 100) / 100,
    });
  };
  look(el);
  for (const kid of el.querySelectorAll('*')) look(kid);
  return out;
})()`;

/** Switch the treatment off in place, leaving the glyphs and the box alone. */
const FLAT_ON = `(() => {
  const el = document.querySelector('[data-ink-probe]');
  el.style.backgroundImage = 'none';
  el.style.color = 'var(--c-text)';
  el.style.webkitTextFillColor = 'var(--c-text)';
})()`;
const FLAT_OFF = `(() => {
  const el = document.querySelector('[data-ink-probe]');
  el.style.backgroundImage = '';
  el.style.color = '';
  el.style.webkitTextFillColor = '';
})()`;

/**
 * Measure one heading: both rules, against the flat control, over identical
 * scanlines. Returns null when the route has no clipped h1 to measure.
 */
async function measure(page, route, vp, inject) {
  await page.goto(url(route), { waitUntil: 'load' });
  /* AFTER the navigation, never before: a style tag added to the previous
     document is thrown away with it, and a self-test whose fault never reached
     the page reports a clean heading and proves nothing. That is precisely the
     failure this gate exists to stop, so it is worth a line of comment. */
  if (inject) await page.addStyleTag({ content: inject });
  await page.evaluate(() => document.fonts.ready);
  /* Finish what can be finished. An infinite animation — the starfield, the
     shimmer — has no end time and throws if asked for one, and none of them
     paint a heading. */
  await page.evaluate(() => {
    for (const a of document.getAnimations()) {
      if (Number.isFinite(a.effect?.getComputedTiming().endTime)) a.finish();
    }
  });
  const found = await page.evaluate(FIND);
  if (!found) return null;
  /* RULE 3, read from the same document the two rendered rules photograph, so
     it cannot disagree with them about which heading is being measured. */
  const pairs = await page.evaluate(PAIR);
  await page.waitForTimeout(120);

  /* The clip runs BELOW the box on purpose: rule 2 exists to find ink that falls
     outside it, and a clip that stopped at the box would crop the evidence. */
  const geo = await page.evaluate(`(() => {
    const r = document.querySelector('[data-ink-probe]').getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  })()`);
  const x = Math.max(0, Math.floor(geo.left) - 4);
  const y = Math.max(0, Math.floor(geo.top) - 4);
  const clip = {
    x,
    y,
    width: Math.min(Math.ceil(geo.width) + 8, vp.width - x),
    height: Math.min(Math.ceil(geo.height) + 12, vp.height - y),
  };
  if (clip.width <= 0 || clip.height <= 0) return null;

  /* Self-painting segments, converted from CSS pixels on the page into device
     pixel columns inside the clip, with a 2px bleed so an antialiased edge of
     the excluded segment does not land in the measurement. */
  const dpr = await page.evaluate(() => window.devicePixelRatio);
  const mask = (found.skip || []).map((s) => ({
    from: Math.floor((s.left - clip.x) * dpr) - 2,
    to: Math.ceil((s.right - clip.x) * dpr) + 2,
  }));

  const lit = await page.screenshot({ animations: 'allow', clip });
  await page.evaluate(FLAT_ON);
  const flat = await page.screenshot({ animations: 'allow', clip });
  await page.evaluate(FLAT_OFF);

  const A = await scanlines(page, lit, mask);
  const B = await scanlines(page, flat, mask);
  if (A.length !== B.length) return { found, broken: 'the heading resized between frames' };

  /* RULE 1, over rows the control says are fully covered. */
  let worst = { ratio: 1, row: -1 };
  let covered = 0;
  for (let i = 0; i < A.length; i++) {
    if (B[i].peak < 250) continue;
    covered++;
    const ratio = A[i].peak / B[i].peak;
    if (ratio < worst.ratio) worst = { ratio, row: i, lit: A[i].peak, flat: B[i].peak };
  }

  /* RULE 2. */
  const lowest = (rows) => {
    let last = -1;
    for (let i = 0; i < rows.length; i++) if (rows[i].ink >= INK_ROW) last = i;
    return last;
  };
  const litBottom = lowest(A);
  const flatBottom = lowest(B);

  /* RULE 2B. A row the control inked and the treatment left sitting on the page
     background. See the note on INK_ROW and OVER_BG: this is the question that
     tells a clip from an antialiasing artefact and from a dim tail, and it needs
     no tolerance because a clipped row is not dim, it is absent.

     THE GROUND IS READ FROM THIS CLIP RATHER THAN FROM A TOKEN. The darkest row
     the CONTROL leaves completely empty is, by construction, page background
     inside this exact screenshot, so it survives a palette change, a section
     wash and a viewport without naming a colour. */
  let bg = 255;
  for (let i = 0; i < B.length; i++) {
    if (B[i].ink === 0 && B[i].peak < bg) bg = B[i].peak;
  }
  const undrawn = [];
  for (let i = 0; i < A.length; i++) {
    if (B[i].ink >= INK_ROW && A[i].peak <= bg + OVER_BG) {
      undrawn.push({ row: i, flat: B[i].ink, lit: Math.round(A[i].peak), bg: Math.round(bg) });
    }
  }

  return {
    found,
    covered,
    ratio: worst.ratio,
    ratioRow: worst.row,
    ratioLit: worst.lit,
    ratioFlat: worst.flat,
    cut: flatBottom - litBottom,
    undrawn,
    /* RULE 3: every pad in the heading that layout has to pay for. Empty is
       the passing state, and it is a LIST rather than a boolean so a failure
       names the element, the pad and the margin that should have cancelled
       it. */
    uncancelled: pairs.filter((p) => Math.abs(p.net) > 0.5),
    pairs,
  };
}

const browser = await chromium.launch();
const failures = [];
const unmeasured = [];
const preflight = [];

/* ══════════════════════════════════════════════════════════════════════════
 * THE SELF-TEST. Both historical faults, reinstated, and both rules required
 * to fire. Runs FIRST: a pass from an instrument that has not been shown to
 * register a fault is not evidence of anything.
 * ══════════════════════════════════════════════════════════════════════════ */

const probe = await browser.newPage({
  viewport: { width: SELF_TEST.viewport.width, height: SELF_TEST.viewport.height },
  deviceScaleFactor: 2,
});

/* FAULT 1: the ramp as it was — white held to 42%, far stop at 128%, ending on
   the numeral colour. Written from the page's own custom properties so this
   file states no colour of its own. */
const faultRamp = await measure(
  probe, SELF_TEST.route, SELF_TEST.viewport,
  'h1 { background-image: linear-gradient(' +
  'var(--c-text) 0%, var(--c-text) 42%, var(--c-numeral-far) 128%) !important; }',
);

/* FAULT 2: the paint box as it was, with the descender allowance removed. */
const faultBox = await measure(
  probe, SELF_TEST.route, SELF_TEST.viewport,
  'h1 { padding-block-end: 0 !important; margin-block-end: 0 !important; }',
);

/* FAULT 2C: A SMALL CLIP. A-217's own case, and the entire reason rule 2B
   exists. The allowance is cut to a sliver rather than removed, so exactly ONE
   device scanline of the descender goes undrawn.
 *
 * 1.25px IS MEASURED, NOT PICKED. Swept on the built page at 1440: this
 * heading's descender overflows its content box by about 2 CSS pixels, and pads
 * of 1.75px and above clip nothing, 1.0 to 1.5px clip exactly one device row,
 * and 0.5px clips three. 1.25px sits in the middle of the one-row plateau so a
 * small metric change does not walk the self-test off it in either direction.
 *
 * THE RESULT IS THE BLIND SPOT ITSELF: `cut` comes back as 1, which is INSIDE
 * rule 2's tolerance, so rule 2 stays silent while a row carrying 28 inked
 * pixels in the flat control is drawn with none at all. If rule 2B ever stops
 * firing here, the gate is back to the sensitivity that let A-217 happen and
 * every clean run below is a run from an instrument that cannot see a small
 * cut. */
const faultThin = await measure(
  probe, SELF_TEST.route, SELF_TEST.viewport,
  'h1 { padding-block-end: 1.25px !important; margin-block-end: -1.25px !important; }',
);

/* FAULT 3: HALF the descender pair, which is the A-209 hole. The padding stays
   and the negative margin that cancels it is removed, so nothing is clipped,
   rules 1 and 2 both stay green, and the allowance is silently paid for in
   LAYOUT as a gap under the heading. This is the fault that had no instrument
   at all until 2026-09-01, and it is injected on every run for the same reason
   the other two are: a rule nobody has watched fail is not a rule. */
const faultPair = await measure(
  probe, SELF_TEST.route, SELF_TEST.viewport,
  'h1 { margin-block-end: 0 !important; }',
);

if (!faultRamp || !faultBox || !faultPair || !faultThin) {
  preflight.push(
    `the self-test route ${SELF_TEST.route} has no clipped h1 to inject a fault into, ` +
    'so no rule was shown to work and every result below is unverified.',
  );
} else {
  if (!(faultThin.undrawn.length > 0)) {
    preflight.push(
      `RULE 2B DID NOT FIRE on a small clip. ${SELF_TEST.route} was served with the ` +
      "heading's descender allowance cut to a 1.25px sliver, which leaves one device " +
      'scanline of glyph drawn with nothing, and the rule reported no undrawn row. ' +
      'That is the exact cut rule 2 cannot see, so a clean run below would say nothing ' +
      'about small clips at all. Either the injection no longer reaches the heading, ' +
      'or that heading no longer ends its last line in a descender, or the sliver has ' +
      'walked off the one-row plateau the note beside it records.',
    );
  }
  if (!(faultPair.uncancelled.length > 0)) {
    preflight.push(
      `RULE 3 DID NOT FIRE with half the descender pair removed. ${SELF_TEST.route} ` +
      "was served with the heading's negative bottom margin forced to 0 while its " +
      'padding stayed, which is exactly the state that opens a gap under a heading ' +
      'with no ink missing at all, and the rule reported nothing. Either that h1 no ' +
      'longer carries a block-end pad, in which case point SELF_TEST at one that ' +
      'does, or the rule has stopped reading the pair.',
    );
  }
  if (!(faultRamp.ratio < MIN_INK_RATIO)) {
    preflight.push(
      `RULE 1 DID NOT FIRE on the ramp this gate was written for. The old recipe was ` +
      `re-applied to ${SELF_TEST.route} and the worst scanline still measured ` +
      `${faultRamp.ratio.toFixed(3)} of flat white, against a floor of ${MIN_INK_RATIO}. ` +
      'Either the injection no longer reaches the heading or the rule has stopped ' +
      'measuring; either way a clean run below would mean nothing.',
    );
  }
  if (!(faultBox.cut > EXTENT_SLACK)) {
    preflight.push(
      `RULE 2 DID NOT FIRE with the descender allowance removed. ${SELF_TEST.route} ` +
      `reported ${faultBox.cut} device pixel(s) of missing ink, which is inside the ` +
      `${EXTENT_SLACK}px tolerance. The likeliest cause is that this heading no longer ` +
      'ends its LAST line in a descender — only the last line can overflow the paint ' +
      'box — so point SELF_TEST at a route whose heading does.',
    );
  }
}
await probe.close();

/* ══════════════════════════════════════════════════════════════════════════
 * THE SITE
 * ══════════════════════════════════════════════════════════════════════════ */

const all = routesOf(DIST);
let measured = 0;
let skipped = 0;
let worstRatio = { ratio: 1 };
let worstCut = { cut: 0 };
let pairsSeen = 0;
let uncancelled = 0;
let undrawnRows = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
  });
  for (const route of all) {
    const r = await measure(page, route, vp);
    if (!r) {
      skipped++;
      continue;
    }
    if (r.broken) {
      failures.push(`${route} @${vp.name}: ${r.broken}`);
      continue;
    }
    /* NOT MEASURABLE IS NOT THE SAME AS CLEAN, and it is printed by name rather
       than counted, so a heading that stops being measurable cannot become
       invisible. It happens when every scanline is masked out — a heading set
       entirely in a self-painting segment — and the list is empty today. */
    if (r.covered < 4) {
      unmeasured.push(
        `${route} @${vp.name} ${r.found.sig} "${r.found.text}": only ${r.covered} scanline(s) ` +
        'carry a fully covered pixel once self-painting segments are excluded.',
      );
      continue;
    }
    measured++;
    pairsSeen += r.pairs.length;
    if (r.ratio < worstRatio.ratio) worstRatio = { ...r, route, vp: vp.name };
    if (r.cut > worstCut.cut) worstCut = { ...r, route, vp: vp.name };
    if (r.ratio < MIN_INK_RATIO) {
      failures.push(
        `${route} @${vp.name} ${r.found.sig} "${r.found.text}": scanline ${r.ratioRow} of the ` +
        `heading renders at ${r.ratioLit.toFixed(1)} against ${r.ratioFlat.toFixed(1)} for the ` +
        `same glyphs in flat ink — ${(r.ratio * 100).toFixed(1)}% of full, floor ` +
        `${(MIN_INK_RATIO * 100).toFixed(0)}%. The heading treatment is dimming the letters.`,
      );
    }
    if (r.cut > EXTENT_SLACK) {
      failures.push(
        `${route} @${vp.name} ${r.found.sig} "${r.found.text}": the heading's ink stops ` +
        `${r.cut} device pixel(s) higher than the same glyphs in flat ink. That much glyph ` +
        'exists and is not being drawn — the background is painted only inside the ' +
        "element's box, and clipped text has no fallback colour outside it.",
      );
    }
    /* RULE 2B. One undrawn row is a failure, whatever the extent rule says. */
    if (r.undrawn.length) {
      undrawnRows += r.undrawn.length;
      const worst = r.undrawn[r.undrawn.length - 1];
      failures.push(
        `${route} @${vp.name} ${r.found.sig} "${r.found.text}": ${r.undrawn.length} device ` +
        `scanline(s) of this heading are drawn with NOTHING. The flat control inks row ` +
        `${worst.row} with ${worst.flat} pixel(s); the treated heading peaks at ` +
        `${worst.lit} there against a page background of ${worst.bg}, so the treatment ` +
        'put no light on that row at all. ' +
        'That is a clipped glyph rather than a dim one: the background is painted only ' +
        "inside the element's box and clipped text has no fallback colour outside it, so " +
        'the descender allowance is short. Raise it and re-measure per face.',
      );
    }
    /* RULE 3. The allowance must cost layout nothing. */
    for (const u of r.uncancelled) {
      uncancelled++;
      failures.push(
        `${route} @${vp.name} ${u.sig}: pads its block end by ${u.pad}px and gives back ` +
        `${u.margin}px, so ${u.net}px of descender allowance is being paid for in LAYOUT. ` +
        'The pad exists to grow the PAINT box for a clipped descender and must be ' +
        'cancelled by an equal negative bottom margin, or it opens a gap under the ' +
        'heading that no rendered ink rule can see. Delete neither half of the pair.',
      );
    }
  }
  await page.close();
}

await browser.close();
server.close();

if (preflight.length) {
  console.error('\nheading-ink: THE GATE COULD NOT BE SHOWN TO FAIL\n');
  for (const p of preflight) console.error(`  ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`  self-test: the old ramp measures ${faultRamp.ratio.toFixed(3)} of flat ink ` +
  `(floor ${MIN_INK_RATIO}) and removing the descender allowance loses ${faultBox.cut} ` +
  'device pixels of glyph — both rules fire on the faults they were written for');
if (unmeasured.length) {
  console.log('  not measurable, and named so it cannot hide:');
  for (const u of unmeasured) console.log('    ' + u);
}
console.log(`  self-test: an allowance ONE CSS PIXEL short leaves ` +
  `${faultThin.undrawn.length} scanline(s) drawn with nothing, at cut=${faultThin.cut} ` +
  `which is inside rule 2's tolerance of ${EXTENT_SLACK} — rule 2B sees the cut rule 2 ` +
  'cannot, which is A-217 in one line');
console.log(`  self-test: removing HALF the pair leaves ` +
  `${faultPair.uncancelled.map((u) => u.net + 'px').join(', ')} of allowance in layout, ` +
  'with rules 1 and 2 both still clean, which is the state rule 3 exists for');
console.log(`  measured ${measured} heading(s) across ${all.length} route(s) at ` +
  `${VIEWPORTS.map((v) => v.name).join(' and ')}; ${skipped} route/viewport pair(s) have no ` +
  'clipped h1 to measure');
console.log(`  descender pairs: ${pairsSeen} block-end pad(s) measured in those headings, ` +
  `${uncancelled} of them paid for in layout; ${undrawnRows} undrawn scanline(s); worst ` +
  `extent gap ${worstCut.cut} device pixel(s) against a tolerance of ${EXTENT_SLACK}`);

if (failures.length) {
  console.error(`\nheading-ink: ${failures.length} HEADING(S) ARE NOT FULLY DRAWN\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error(
    '\n  A page heading is painted by clipping --grad-heading to the text. Two things\n' +
    '  go wrong with that and both look identical to a reader — the letters read as\n' +
    '  cut off at the bottom:\n' +
    '    · the ramp resolves inside ONE line box, so a glyph traverses the whole\n' +
    '      gradient and its descender lands on the dim end. Move the far stop further\n' +
    '      past 100%, or end it on a lighter role token. Never on a hue.\n' +
    '    · the background is painted only inside the element box, so ink below it is\n' +
    '      drawn with nothing. styles/headings.css carries a padding-block-end for\n' +
    '      exactly this, cancelled by an equal negative margin so the box grows for\n' +
    '      paint and not for space.\n' +
    '  And one goes wrong as SPACE rather than as ink, which is why rule 3 exists:\n' +
    '    · half the pair deleted. The pad stays, nothing is clipped, both rules above\n' +
    '      stay green, and the allowance is paid for in LAYOUT as a gap under the\n' +
    '      heading. Restore the negative margin. Never delete one half of a pair.\n',
  );
  process.exit(1);
}

console.log('\n  every allowance is cancelled out of layout by its own negative margin,\n' +
  '  and every page heading is drawn to its last descender, at full ink\n');
