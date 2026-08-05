/**
 * measure-fidelity.mjs — the homepage against concepts/homepage-v2.html.
 *
 * WHY THIS EXISTS AS A SCRIPT RATHER THAN AN AGENT PASS. The owner has demanded
 * exact fidelity to the concept three times, and the 2026-08-05 independent
 * audit that found "not one of about 55 elements matches on both width and
 * height" was done by hand. A hand audit cannot be re-run after each fix, so
 * the only way to know whether a change closed a delta or moved it somewhere
 * else is to measure the same elements the same way every time. That is this
 * file. It is a MEASUREMENT, not a gate: it prints deltas and exits 0 unless
 * something is genuinely broken (a page that will not load, a selector that
 * matches nothing on the concept side), because a fidelity number that fails
 * the build would stop every unrelated commit until the whole redesign lands.
 *
 * THREE TRAPS IT IS BUILT AROUND, all recorded and all previously drawn blood:
 *
 *  1. THE ARRIVAL ANIMATION. Sections below the fold are mid-transform while a
 *     scroll timeline runs, so getBoundingClientRect reads the animation and
 *     not the layout. A previous pass faked five failures this way, including a
 *     30.8px offset identical to a defect that had already been reported. This
 *     runs under reducedMotion:'reduce' AND waits for element.getAnimations()
 *     to drain before reading anything.
 *
 *  2. THE HIDDEN MCP TAB. A background tab reports visibilityState 'hidden',
 *     which freezes transitions and produces false blank-section readings.
 *     Playwright's own page is always foreground, which is most of why the
 *     measurement lives here and not in the browser MCP.
 *
 *  3. DIST CHURN. dist is rewritten roughly every three minutes while an agent
 *     builds, so a reading taken across a rebuild mixes two builds. Every run
 *     fences itself: it records dist's md5 before the first navigation and
 *     again after the last, and DISCARDS the whole run if they differ.
 *
 * USAGE
 *   node scripts/measure-fidelity.mjs                     # all viewports
 *   node scripts/measure-fidelity.mjs --viewport 1440     # one
 *   node scripts/measure-fidelity.mjs --json out.json     # machine-readable
 *   node scripts/measure-fidelity.mjs --only S2           # one section
 *
 * It starts its own servers on ports of its own and shuts them down, so it does
 * not depend on whichever of the thirteen forked static servers is alive today
 * (A-99) and cannot be poisoned by one serving a stale root.
 */

import { createServer } from 'node:http';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = dirname(fileURLToPath(import.meta.url));
const ASTRO = resolve(HERE, '..');
const REPO = resolve(ASTRO, '..');
const DIST = join(ASTRO, 'dist');

/* ── The element map ──────────────────────────────────────────────────────
 *
 * Each entry pairs one element on the concept with the element on the built
 * page that is supposed to BE it. The pairing is the whole difficulty of this
 * measurement and it is stated here, explicitly, rather than inferred, because
 * an inferred pairing silently compares the wrong two boxes and then reports a
 * delta nobody can act on.
 *
 * `props` narrows what is compared. Everything gets the box; a card also gets
 * its padding, radius and background, because those are the four the audit
 * found collapsed. Text gets size and line-height.
 */
const BOX = ['w', 'h'];
const CARD = [...BOX, 'padTop', 'padLeft', 'radius', 'bg', 'shadow'];
const TEXT = [...BOX, 'fontSize', 'lineHeight', 'weight'];

const MAP = [
  // ── S1/S2: the concept's hero cards, which became the built ProofGate ────
  /* The container pair is .shell against .section__body. Both are the element
   * that CARRIES the measure and the gutter, so both box widths include the
   * padding and padLeft compares the gutter directly. Comparing .shell against
   * the <section> instead would compare a 1280 box to a full-bleed one. */
  { sec: 'S2', name: 'content container', concept: '#screens .shell', built: '#proof .section__body', props: [...BOX, 'padLeft'] },
  { sec: 'S2', name: 'main card', concept: '.hero-main', built: '.pg__card:not(.pg__card--gate)', props: CARD },
  { sec: 'S2', name: 'gate card', concept: '.hero-side', built: '.pg__card--gate', props: CARD },
  { sec: 'S2', name: 'card eyebrow', concept: '.hero-main .eyebrow', built: '.pg__card:not(.pg__card--gate) .eyebrow', props: TEXT },
  { sec: 'S2', name: 'gate heading', concept: '.hero-side .t-card', built: '.pg__card--gate .pg__h', props: TEXT },
  { sec: 'S2', name: 'gate body', concept: '.hero-side .body', built: '.pg__card--gate .pg__p', props: TEXT },
  { sec: 'S2', name: 'refusal slab', concept: '.refusal-slab', built: '.pg__slab', props: CARD },
  { sec: 'S2', name: 'refusal chip', concept: '.refusal-chip', built: '.pg__gate', props: [...BOX, 'fontSize', 'weight', 'colour'] },

  // ── S3: the product screens ──────────────────────────────────────────────
  /* The built section is #product, not #screens: the concept's id was not
   * carried over. The inspector column is .ps__note and the screen frame is
   * .pcar__frame, inside .ps__frame — the built page renders a real carousel
   * where the concept renders a static frame, which is the substance of the
   * A-105 decision and the reason these two pairs are the ones to watch. */
  { sec: 'S3', name: 'content container', concept: '#screens .shell', built: '#product .section__body', props: [...BOX, 'padLeft'] },
  { sec: 'S3', name: 'section head', concept: '#screens .sec-head', built: '#product .section__head', props: BOX },
  { sec: 'S3', name: 'section h2', concept: '#screens .t-sec', built: '#product .section__title', props: TEXT },
  { sec: 'S3', name: 'standfirst', concept: '#screens .sec-head .body', built: '#product .section__standfirst', props: TEXT },
  { sec: 'S3', name: 'showcase panel', concept: '.showcase', built: '.ps__showcase', props: CARD },
  /* THE TABS ARE TabSwitcher, NOT THE CAROUSEL'S OWN RING ROW, and mapping them
   * to .pcar__tab was a real defect in this file that produced three viewports
   * of phantom deltas. Each product panel holds a SINGLE-slide Carousel, so
   * .pcar__tabs never renders: it measured 0x0 with radius 0 and a transparent
   * fill, which the comparison dutifully reported as "radius 10 vs 0" and
   * "white vs transparent" as though the design were wrong. It was the map that
   * was wrong. ProductScreens.astro says so in its own header: "THE TABS ARE
   * TabSwitcher.astro, NOT A SECOND TABLIST". */
  { sec: 'S3', name: 'tab strip', concept: '.tabstrip', built: '.tabsw', props: BOX },
  { sec: 'S3', name: 'first tab', concept: '.tabstrip .tab', built: '.tabsw__tab', props: [...BOX, 'radius', 'fontSize', 'bg'] },
  { sec: 'S3', name: 'screen frame', concept: '.tabpanel:not([hidden]) .frame', built: '.ps__panel:not([hidden]) .pcar__frame', props: CARD },
  { sec: 'S3', name: 'inspector', concept: '.tabpanel:not([hidden]) .inspector', built: '.ps__panel:not([hidden]) .ps__note', props: CARD },
  { sec: 'S3', name: 'inspector h3', concept: '.tabpanel:not([hidden]) .inspector .t-card', built: '.ps__panel:not([hidden]) .ps__h', props: TEXT },
  { sec: 'S3', name: 'inspector body', concept: '.tabpanel:not([hidden]) .inspector .body', built: '.ps__panel:not([hidden]) .ps__p', props: TEXT },

  // ── S4: how it runs ──────────────────────────────────────────────────────
  { sec: 'S4', name: 'pipeline', concept: '.pipeline', built: '.hir', props: CARD },
  { sec: 'S4', name: 'steps list', concept: '.pipeline .steps', built: '.hir__steps', props: BOX },
  { sec: 'S4', name: 'stage card 1', concept: '.pipeline .step:nth-child(1)', built: '.hir__steps > li:nth-child(1)', props: CARD },
  { sec: 'S4', name: 'stage card 4 (refused)', concept: '.pipeline .step:nth-child(4)', built: '.hir__steps > li:nth-child(4)', props: CARD },
  { sec: 'S4', name: 'stage 1 dot', concept: '.pipeline .step:nth-child(1) .dot', built: '.hir__steps > li:nth-child(1) .hir__dot', props: [...BOX, 'bg', 'colour', 'radius'] },
  { sec: 'S4', name: 'stage 4 dot', concept: '.pipeline .step:nth-child(4) .dot', built: '.hir__steps > li:nth-child(4) .hir__dot', props: [...BOX, 'bg', 'colour', 'radius'] },
  { sec: 'S4', name: 'stage 1 label', concept: '.pipeline .step:nth-child(1) .step-num', built: '.hir__steps > li:nth-child(1) .hir__n', props: TEXT },
  { sec: 'S4', name: 'stage 1 title', concept: '.pipeline .step:nth-child(1) .step-title', built: '.hir__steps > li:nth-child(1) .hir__h', props: TEXT },
  { sec: 'S4', name: 'stage 1 body', concept: '.pipeline .step:nth-child(1) .step-desc', built: '.hir__steps > li:nth-child(1) .hir__p', props: TEXT },

  // ── The ground, which A-103 says is still not flat ───────────────────────
  { sec: 'GROUND', name: 'html', concept: 'html', built: 'html', props: ['bg'] },
  { sec: 'GROUND', name: 'body', concept: 'body', built: 'body', props: ['bg'] },
];

/* ── THE TYPEFACE CONTROL, AND WHY THE RAW AUDIT NUMBERS OVERSTATE THE DEFECT ─
 *
 * concepts/homepage-v2.html sets ONE family for the whole page:
 *     font-family: system-ui, -apple-system, "Segoe UI", sans-serif
 * so on this machine the concept renders entirely in Segoe UI. The built page
 * renders headings in Plus Jakarta Sans and body text in Inter, both
 * self-hosted. THE TWO PAGES ARE THEREFORE SET IN DIFFERENT TYPEFACES.
 *
 * Width, padding, radius, colour and shadow are unaffected by that and compare
 * directly. HEIGHT OF ANY TEXT-BEARING BOX DOES NOT. A box whose height comes
 * from how its text wraps is measuring the typeface as much as the design, so
 * "make this card 235.06px tall" is partly an instruction to reproduce a Segoe
 * UI line break inside a page set in Inter — which cannot be done without
 * distorting the type, and would be the wrong thing to do if it could.
 *
 * So the concept is measured TWICE: as authored, and again with each element
 * forced into the family its paired built element actually resolves to. The
 * second reading is the CONTROL, and the delta against the control is the
 * number worth acting on. Where the two concept readings disagree, that gap is
 * typeface and is reported as such rather than being charged to the design.
 *
 * This is the same discipline A-100 was caught by: a control re-derivation is
 * what exposed the xAvgCharWidth error, and without one this script would have
 * confidently reported dozens of height defects that no amount of CSS could
 * close. */
const FONT_FACES = `
@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:block;src:url('/Assets/fonts/Inter-var.woff2') format('woff2')}
@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:600;font-display:block;src:url('/Assets/fonts/PlusJakartaSans-600.woff2') format('woff2');unicode-range:U+0000-00FF}
@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:700;font-display:block;src:url('/Assets/fonts/PlusJakartaSans-700.woff2') format('woff2');unicode-range:U+0000-00FF}
@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:800;font-display:block;src:url('/Assets/fonts/PlusJakartaSans-800.woff2') format('woff2');unicode-range:U+0000-00FF}
@font-face{font-family:'Jakarta Fallback';src:local('Arial'),local('Helvetica Neue'),local('sans-serif');size-adjust:99.12%;ascent-override:97.25%;descent-override:26.84%;line-gap-override:0%}
@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:400;font-display:block;src:url('/Assets/fonts/JetBrainsMono-var.woff2') format('woff2')}
`;

/* Tolerances. A sub-pixel difference is a rounding artefact of two different
 * layout roots, not a fidelity defect; anything at or above one CSS pixel is
 * something a reader could in principle see. Colours and shadows are exact:
 * "nearly the same grey" is the failure mode this whole exercise exists to
 * stop. */
const TOL_PX = 1.0;

const NUMERIC = new Set(['w', 'h', 'padTop', 'padLeft', 'radius', 'fontSize', 'lineHeight', 'weight']);

/* ── A static server with no dependencies and no opinions ────────────────── */
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

function serve(root) {
  return new Promise((ok) => {
    const srv = createServer(async (req, res) => {
      try {
        const url = decodeURIComponent(req.url.split('?')[0]);
        let p = join(root, url);
        try {
          if ((await stat(p)).isDirectory()) p = join(p, 'index.html');
        } catch {
          if (!extname(p)) p = join(root, url, 'index.html');
        }
        if (!resolve(p).startsWith(resolve(root))) { res.writeHead(403).end(); return; }
        const buf = await readFile(p);
        res.writeHead(200, { 'content-type': MIME[extname(p).toLowerCase()] ?? 'application/octet-stream' });
        res.end(buf);
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
      }
    });
    srv.listen(0, '127.0.0.1', () => ok({ srv, port: srv.address().port }));
  });
}

/** md5 over every file in dist, path and bytes, so the fence catches a rebuild
 *  that happens to preserve total size. */
async function fingerprint(dir) {
  const h = createHash('md5');
  const walk = async (d) => {
    let entries;
    try { entries = await readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const p = join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else { h.update(relative(dir, p)); h.update(await readFile(p)); }
    }
  };
  await walk(dir);
  return h.digest('hex');
}

/* ── Reading one page ─────────────────────────────────────────────────────
 *
 * Runs inside the page. Returns null for a selector that matches nothing,
 * which the caller reports rather than silently treating as zero — a missing
 * element measured as 0x0 would show up as a spectacular delta and send the
 * next person after the wrong thing entirely. */
const PROBE = (entries) => {
  const px = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : v;
  };
  const out = {};
  for (const { key, sel } of entries) {
    let el = null;
    for (const one of sel.split(',').map((s) => s.trim())) {
      el = document.querySelector(one);
      if (el) break;
    }
    if (!el) { out[key] = null; continue; }
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out[key] = {
      w: Math.round(r.width * 100) / 100,
      h: Math.round(r.height * 100) / 100,
      padTop: px(cs.paddingTop),
      padLeft: px(cs.paddingLeft),
      radius: px(cs.borderTopLeftRadius),
      bg: cs.backgroundColor,
      colour: cs.color,
      shadow: cs.boxShadow === 'none' ? 'none' : 'present',
      fontSize: px(cs.fontSize),
      lineHeight: cs.lineHeight === 'normal' ? 'normal' : px(cs.lineHeight),
      weight: px(cs.fontWeight),
      fontFamily: cs.fontFamily,
      /* offsetTop is the cross-check against a transformed rect: it is layout
       * position and an animation cannot move it. If these two disagree the
       * page is still animating and the reading is worthless. */
      offsetTop: el.offsetTop,
      offsetWidth: el.offsetWidth,
    };
  }
  return out;
};

/** Wait until nothing on the page is animating. Under reduced motion this is
 *  usually already true, but the scroll-driven arrival is a timeline rather
 *  than a transition and has survived a reduced-motion query before. */
async function settle(page) {
  await page.evaluate(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const running = () => document.getAnimations().filter((a) => a.playState === 'running');
    for (let i = 0; i < 40 && running().length; i++) {
      await new Promise((r) => setTimeout(r, 50));
    }
    /* Anything still running after two seconds is an infinite decorative loop
     * (a pulse, a shimmer). Finish it so it holds still for the reading rather
     * than waiting on something that will never end. */
    for (const a of document.getAnimations()) { try { a.finish(); } catch { /* an infinite animation cannot finish; it is already excluded from layout */ } }
    await new Promise((r) => requestAnimationFrame(r));
  });
}

/**
 * @param forceFonts  null, or a { key -> font-family } map. When present the
 *   concept's @font-face rules are installed and each mapped element is forced
 *   into the family its built counterpart resolves to. This is the control
 *   pass; see the FONT_FACES note above for why it exists.
 */
async function readPage(ctx, url, entries, vw, vh, forceFonts = null) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: vw, height: vh });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const resp = await page.goto(url, { waitUntil: 'load', timeout: 45000 });
  if (!resp || !resp.ok()) throw new Error(`${url} returned ${resp ? resp.status() : 'no response'}`);

  if (forceFonts) {
    await page.addStyleTag({ content: FONT_FACES });
    /* font-display:block above, then wait on document.fonts, so no reading is
     * ever taken during a swap. A measurement mid-swap is the CLS defect A-92
     * describes, observed instead of prevented. */
    await page.evaluate(async ({ faces, entries: es }) => {
      for (const { key, sel } of es) {
        const fam = faces[key];
        if (!fam) continue;
        for (const one of sel.split(',').map((s) => s.trim())) {
          const el = document.querySelector(one);
          if (el) { el.style.fontFamily = fam; break; }
        }
      }
      await document.fonts.ready;
    }, { faces: forceFonts, entries });
  }
  /* Scroll the whole page once so every lazy image and every scroll-triggered
   * section has been through its trigger, then come back and let it settle.
   * Measuring a section that has never been scrolled into view measures its
   * start state. */
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 30));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await settle(page);
  const data = await page.evaluate(PROBE, entries);
  await page.close();
  return { data, errors };
}

/* ── main ─────────────────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i === -1 ? d : argv[i + 1]; };
const only = arg('--only', null);
const jsonOut = arg('--json', null);
const vpArg = arg('--viewport', null);

const VIEWPORTS = (vpArg ? [Number(vpArg)] : [1440, 834, 390]).map((w) => ({
  w,
  /* Height is PINNED to 900 at every width. The homepage uses 9.5vh spacing in
   * places, so a viewport height that varies with the window makes two runs
   * incomparable for a reason that has nothing to do with the design. */
  h: 900,
}));

const rows = MAP.filter((m) => !only || m.sec === only);
if (!rows.length) { console.error(`no rows match --only ${only}`); process.exit(2); }

const before = await fingerprint(DIST);

const conceptSrv = await serve(REPO);
const builtSrv = await serve(DIST);
const conceptUrl = `http://127.0.0.1:${conceptSrv.port}/concepts/homepage-v2.html`;
const builtUrl = `http://127.0.0.1:${builtSrv.port}/`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ reducedMotion: 'reduce', deviceScaleFactor: 1 });

const results = [];
let missing = 0;
let deltas = 0;

let typeface = 0;

for (const vp of VIEWPORTS) {
  const cEntries = rows.map((m, i) => ({ key: String(i), sel: m.concept }));
  const bEntries = rows.map((m, i) => ({ key: String(i), sel: m.built }));

  /* Built first, because its resolved families are the input to the control. */
  const b = await readPage(ctx, builtUrl, bEntries, vp.w, vp.h);
  const faces = {};
  for (const [i] of rows.entries()) {
    const v = b.data[String(i)];
    if (v && v.fontFamily) faces[String(i)] = v.fontFamily;
  }
  const cRaw = await readPage(ctx, conceptUrl, cEntries, vp.w, vp.h);
  const cCtl = await readPage(ctx, conceptUrl, cEntries, vp.w, vp.h, faces);

  /* The control is what the built page is scored against. */
  const c = cCtl;

  for (const [i, m] of rows.entries()) {
    const cv = c.data[String(i)];
    const bv = b.data[String(i)];
    const raw = cRaw.data[String(i)];

    /* Report the typeface's own contribution before scoring anything, so a
     * height that moved only because Segoe UI wraps differently from Inter is
     * never charged to the design. */
    if (cv && raw) {
      for (const p of m.props) {
        if (p !== 'h' && p !== 'w') continue;
        if (Math.abs(raw[p] - cv[p]) >= TOL_PX) {
          typeface++;
          results.push({
            vp: vp.w, sec: m.sec, name: m.name, prop: p, status: 'TYPEFACE',
            concept: raw[p], built: cv[p],
            detail: `concept as authored ${raw[p]} vs same concept in the built face ${cv[p]}; the difference is the typeface, not the design`,
          });
        }
      }
    }
    if (!cv) {
      results.push({ vp: vp.w, sec: m.sec, name: m.name, status: 'CONCEPT-MISSING', concept: m.concept });
      missing++;
      continue;
    }
    if (!bv) {
      results.push({ vp: vp.w, sec: m.sec, name: m.name, status: 'BUILT-MISSING', built: m.built });
      missing++;
      continue;
    }
    /* ── THE ZERO-SIZE GUARD, AND IT IS A MAPPING CHECK, NOT A RESULT ────────
     *
     * A built element that measures 0x0 while its concept counterpart has real
     * size is almost never a design defect: it is a selector that matched
     * something the page never renders. This exact case shipped once in this
     * file — .pcar__tab matched a control that only exists on a multi-slide
     * carousel, measured 0x0, and produced three viewports of confident
     * nonsense about radius and background before anyone noticed the box had no
     * size at all. An unmatched selector is already reported as a mapping
     * defect; a selector that matches an unrendered element must be too, or it
     * is worse than an unmatched one, because it looks like data. */
    if (cv && bv && (cv.w > 0 || cv.h > 0) && bv.w === 0 && bv.h === 0) {
      results.push({
        vp: vp.w, sec: m.sec, name: m.name, status: 'BUILT-ZERO-SIZE',
        built: m.built,
        detail: 'matched an element that renders at 0x0; treat as a MAP defect and fix the selector, not the design',
      });
      missing++;
      continue;
    }

    /* The animation cross-check, per trap 1. If the painted rect and the layout
     * box disagree by more than a pixel the element is mid-transform and its
     * numbers are the animation's, not the design's. */
    for (const [side, v] of [['concept', cv], ['built', bv]]) {
      if (Math.abs(v.w - v.offsetWidth) > 1.5 && v.offsetWidth > 0) {
        results.push({
          vp: vp.w, sec: m.sec, name: m.name, status: 'UNSTABLE',
          detail: `${side} rect width ${v.w} vs offsetWidth ${v.offsetWidth}; still animating, reading discarded`,
        });
      }
    }
    for (const p of m.props) {
      const a = cv[p];
      const z = bv[p];
      let off;
      if (NUMERIC.has(p) && typeof a === 'number' && typeof z === 'number') off = Math.abs(a - z) >= TOL_PX;
      else off = String(a) !== String(z);
      if (off) {
        deltas++;
        results.push({ vp: vp.w, sec: m.sec, name: m.name, prop: p, concept: a, built: z, status: 'DELTA' });
      }
    }
  }
  if (c.errors.length) console.error(`  concept page errors @${vp.w}:`, c.errors.slice(0, 3));
  if (b.errors.length) console.error(`  built page errors @${vp.w}:`, b.errors.slice(0, 3));
  console.error(`  measured @${vp.w}`);
}

await browser.close();
conceptSrv.srv.close();
builtSrv.srv.close();

const after = await fingerprint(DIST);
if (before !== after) {
  console.error('');
  console.error('DISCARDED: dist changed under the run (a build landed mid-measurement).');
  console.error(`  before ${before}`);
  console.error(`  after  ${after}`);
  console.error('  Re-run when no build is in flight. Trap A-77.');
  process.exit(3);
}

/* ── report ───────────────────────────────────────────────────────────────── */
const W = [6, 8, 24, 12, 22, 22];
const line = (a) => a.map((v, i) => String(v).slice(0, W[i]).padEnd(W[i])).join(' ');
console.log('');
console.log(`homepage fidelity against concepts/homepage-v2.html   dist ${before.slice(0, 12)}`);
console.log('='.repeat(W.reduce((s, n) => s + n + 1, 0)));
console.log(line(['vp', 'section', 'element', 'property', 'concept', 'built']));
console.log('-'.repeat(W.reduce((s, n) => s + n + 1, 0)));

let lastVp = null;
for (const r of results) {
  if (r.vp !== lastVp) { if (lastVp !== null) console.log(''); lastVp = r.vp; }
  if (r.status === 'DELTA') console.log(line([r.vp, r.sec, r.name, r.prop, r.concept, r.built]));
  else console.log(line([r.vp, r.sec, r.name, r.status, r.concept ?? r.built ?? '', r.detail ?? '']));
}

const cells = VIEWPORTS.length * rows.reduce((s, m) => s + m.props.length, 0);
console.log('');
console.log(`${deltas} delta(s) and ${missing} unmatched selector(s) over ${cells} compared value(s), at ${VIEWPORTS.map((v) => v.w).join(' / ')}.`);
console.log(`Scored against the concept RENDERED IN THE BUILT TYPEFACE. ${typeface} box dimension(s)`);
console.log('moved between the concept as authored and that control: those are Segoe UI against');
console.log('Inter and Plus Jakarta Sans, and no CSS change can close them.');
if (missing) console.log('An unmatched selector is a MAPPING defect in this script, not a fidelity result. Fix the map.');

if (jsonOut) {
  const { writeFile } = await import('node:fs/promises');
  await writeFile(jsonOut, JSON.stringify({ dist: before, viewports: VIEWPORTS.map((v) => v.w), results }, null, 2));
  console.log(`json -> ${jsonOut}`);
}

/* Exit 0 on deltas: this reports, it does not gate. See the header. */
process.exit(missing && !deltas ? 2 : 0);
