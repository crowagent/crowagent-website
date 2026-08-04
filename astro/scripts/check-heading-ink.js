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

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

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
   missing tail is 7-9 device pixels, so one pixel of slack costs no sensitivity.
   Measured on the fixed build: every route reports exactly 0. */
const EXTENT_SLACK = 1;

/* The route the self-test runs on. It has to be one whose LAST line ends in a
   descender, because only the last line can overflow the paint box — an inner
   line's tail hangs into the next line box, which is still inside the element.
   If this route's heading is ever reworded to end without one, the self-test
   fails loudly and says so rather than quietly proving nothing. */
const SELF_TEST = { route: '/privacy/', viewport: VIEWPORTS[0] };

if (!fs.existsSync(DIST)) {
  console.error(`heading-ink: no build at ${DIST}`);
  process.exit(1);
}

/* ── A static server, because file:// breaks absolute asset paths ────────── */
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.json': 'application/json', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(DIST, rel);
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;
const url = (route) => `http://127.0.0.1:${PORT}${route}`;

/** Every built route, as a URL path. */
function routes(dir = DIST, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) routes(f, out);
    else if (e.name === 'index.html') {
      const rel = path.relative(DIST, path.dirname(f)).replace(/\\/g, '/');
      out.push('/' + (rel ? rel + '/' : ''));
    }
  }
  return out;
}

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
    for (let i = 0; i < rows.length; i++) if (rows[i].ink >= 3) last = i;
    return last;
  };
  const litBottom = lowest(A);
  const flatBottom = lowest(B);

  return {
    found,
    covered,
    ratio: worst.ratio,
    ratioRow: worst.row,
    ratioLit: worst.lit,
    ratioFlat: worst.flat,
    cut: flatBottom - litBottom,
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

if (!faultRamp || !faultBox) {
  preflight.push(
    `the self-test route ${SELF_TEST.route} has no clipped h1 to inject a fault into, ` +
    'so neither rule was shown to work and every result below is unverified.',
  );
} else {
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

const all = routes().sort();
let measured = 0;
let skipped = 0;
let worstRatio = { ratio: 1 };
let worstCut = { cut: 0 };

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
console.log(`  measured ${measured} heading(s) across ${all.length} route(s) at ` +
  `${VIEWPORTS.map((v) => v.name).join(' and ')}; ${skipped} route/viewport pair(s) have no ` +
  'clipped h1 to measure');

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
    '      paint and not for space.\n',
  );
  process.exit(1);
}

console.log('\n  every page heading is drawn to its last descender, at full ink\n');
