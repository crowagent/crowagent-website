/**
 * check-timeline.js — a rail is one line, and a row of cards shares a floor.
 *
 * WHY THIS EXISTS, AND WHY IT IS A BROWSER RATHER THAN A GREP.
 *
 * Two defects, reported by the owner on 2026-08-04 and measured before anything
 * was changed:
 *
 *   A-13a  /roadmap drew its timeline rail as `border-left` on each phase, inside
 *          a grid with `gap: var(--sec-gap)`. Rendered at 1440 that is four rails
 *          of 522, 394, 423 and 365px with 60px of nothing between them, and no
 *          markers on any of them. The owner called it "four disconnected
 *          segments", which is precisely what it was.
 *   A-13b  the two Phase 1 cards were exactly the same height — 365.3px each, the
 *          grid saw to that — and their two "View product" links sat 28.9px apart.
 *
 * NEITHER IS VISIBLE TO A DECLARATION-READING GATE, and that is the whole reason
 * this file launches a browser. `border-left: 2px solid var(--c-border)` is
 * correct CSS. `gap: var(--sec-gap)` is correct CSS. The defect is what happens
 * when they meet, and it exists only as geometry. The same is true of the second:
 * `align-items: stretch` was working, the boxes matched, and the misalignment was
 * in where the copy inside them happened to stop.
 *
 * check-render.js already makes this argument at length and is the model for this
 * file. The reason this is a second script rather than more rules bolted onto that
 * one is only cost: check-render loads all 43 routes and re-measures each at a
 * second viewport by resizing, and these two rules need to look at 2 routes'
 * worth of components. A gate nobody wants to wait for gets moved to the end of
 * the list and then out of it.
 * (Corrected 2026-08-04, A-57: this said "loads all 44 routes twice". It is 43
 * routes and one load each. A wrong number in a cost argument is how the
 * argument gets re-litigated by somebody who checks.)
 *
 * ── WHAT IT ASSERTS ─────────────────────────────────────────────────────────
 *
 * 1. THE RAIL IS CONTINUOUS. Every vertical hairline drawn inside a `.tl` is
 *    collected — as a box, as a pseudo-element, or as a border on any descendant
 *    — the ones sharing an x position are treated as one rail, and their union
 *    must have no gap in it. Collected by GEOMETRY rather than by selector,
 *    because the defect was a rail nobody had written as a rail: it was four
 *    borders that happened to line up.
 * 2. EVERY STOP HAS A MARKER, AND IT SITS ON THE RAIL. One `.tl__dot` per
 *    `.tl__item`, its centre within 2px of the rail's centre, and inside the
 *    rail's vertical span. A dot beside the line is the defect the /about
 *    timeline was praised for not having.
 * 3. A ROW OF CARDS SHARES A FLOOR. Cards on one band of a `.card-row` have to
 *    be the same height. card-row.css claimed check-render.js held this and it
 *    never did; the claim is now true, in this file.
 * 4. AND THEIR CALLS TO ACTION SHARE A LINE. Where two or more cards on a band
 *    end in a link or a button, those have to sit on one baseline. This is the
 *    half a shared floor does NOT give you, and it is exactly A-13b: identical
 *    boxes, 28.9px apart inside. `card-grow` is the fix and this is what asks
 *    for it.
 *
 * ── SAME CONTRACT AS EVERY OTHER GATE ───────────────────────────────────────
 *
 * Named exceptions, each carrying a written reason. All of them printed on every
 * run. An exception matching nothing is reported as stale. Anything not listed
 * fails the build.
 *
 * ── PROVED IN BOTH DIRECTIONS, 2026-08-04 ───────────────────────────────────
 *
 * Both directions, because a gate proved only to fail can still be lying when it
 * passes — check-facts.js printed "every rule clean" for hours while crashing on
 * its own reporting path, so the clean result had never executed the code that
 * reports a violation.
 *
 * FAILS: run against a dist built from the commit before the fix (the rail as
 * four borders, no dots, the two CTAs 28.9px apart) it exits 1 and prints the
 * three gaps by height, the four stops with no marker, and the 28.9px CTA spread.
 * The exact output is in the task report.
 *
 * PASSES: against the fixed build it exits 0, having measured 2 timelines and 4
 * card-row bands across 43 routes at two viewports. (Corrected 2026-08-04: this
 * said "8 card rows across 44 routes". The gate PRINTS both counts on every run
 * and they were 4 and 43, so the header disagreed with the output above it.)
 *
 * ── AND A SELF-CHECK PER RULE, ADDED 2026-08-04 ─────────────────────────────
 *
 * Both `timelinesSeen` and `rowsSeen` must be non-zero or the build fails. The
 * timeline half was here from the start; the card-row half was not, and its
 * absence is the same defect as a false gate claim wearing different clothes.
 * `.card-row` is carried on two routes. Rename it, or refactor those rows into a
 * component with a different class, and rules 3 and 4 would have measured
 * nothing, reported nothing, and passed — leaving styles/card-row.css with a
 * comment naming a gate that had stopped looking. Proved by renaming the class
 * in a built dist: exit 1 with "no .card-row band found on any route"; restored,
 * exit 0.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * `{ route, selector, reason }`. BOTH LISTS ARE EMPTY AND SHOULD STAY EMPTY.
 *
 * There is no honest reason for a timeline rail to have a hole in it or for a
 * stop to have no marker: those are not styles somebody chose, they are what a
 * border on a gapped grid item looks like. An entry here would be a claim that
 * a broken spine is a design, and it would need to say so in a sentence.
 *
 * A reason that only says "intentional" is not a reason. */
const ALLOW_RAIL = [];

/* Rows allowed to break the floor or the CTA baseline, by class signature.
 *
 * Also empty. `.card-row` is an opt-in: a container only carries it because
 * somebody decided these cards are alternatives to each other, and alternatives
 * that do not line up are the defect the class exists to prevent. If a row
 * genuinely should not share a floor, the fix is to stop calling it a card row,
 * not to name it here. */
const ALLOW_ROW = [];

/* How far a dot's centre may sit from the rail's centre. The dot is 11px wide
 * against a 1px rail, so anything up to 5px still covers the line; 2px is
 * tight enough to catch a dot that was positioned against the wrong edge.
 *
 * It is not 0, and the reason is measured: on /about the stops are `.surface`
 * cards, and an absolutely positioned child is offset from its parent's PADDING
 * box, so the card's own 1px border pushes every dot 1px right. That is a fact
 * about the box model rather than a mistake in the recipe, it predates this
 * gate, and it is invisible. */
const DOT_TOL_PX = 2;
/* A rail may be assembled from more than one painted box — a border here, a
 * pseudo-element there — and boxes that abut are still one line. 2px absorbs
 * sub-pixel layout; the defect measured 60px. */
const RAIL_GAP_TOL_PX = 2;
/* Cards on one band, and their calls to action. Sub-pixel rounding moves a box
 * by under a pixel; the defects were 28.9px and 619px. */
const FLOOR_TOL_PX = 2;
const CTA_TOL_PX = 4;

if (!fs.existsSync(DIST)) {
  console.error(`timeline: no build at ${DIST}`);
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
  let file = path.join(DIST, decodeURIComponent(req.url.split('?')[0]));
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

/* ── THE MEASUREMENT, run inside the page ───────────────────────────────────
 *
 * NO BACKTICKS ANYWHERE BELOW. This whole constant is a template literal
 * evaluated in the page, so a backtick in a comment ends the string and the file
 * stops parsing. check-render.js carries the same warning for the same reason. */
const MEASURE = `(() => {
  const DOT_TOL = ${DOT_TOL_PX};
  const GAP_TOL = ${RAIL_GAP_TOL_PX};

  const sig = (el) => {
    const cls = [...el.classList].filter((c) => !/^astro-/.test(c));
    return el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '');
  };
  const opaque = (c) => !!c && !/rgba?\\([^)]*,\\s*0\\s*\\)|transparent/.test(c);

  /* ── EVERY VERTICAL HAIRLINE INSIDE A TIMELINE ─────────────────────────
   *
   * Collected by SHAPE, not by class name, and that is the point: the rail this
   * gate was written for was never written as a rail. It was four left borders
   * on four list items that happened to share an x, and a rule looking for
   * .tl::before would have reported "no rail at all" rather than "a rail with
   * three holes in it" — a true statement that describes the wrong defect.
   *
   * Three sources, because a hairline can be drawn three ways:
   *   a left border on any descendant, including the list itself;
   *   a pseudo-element narrow enough to be a line;
   *   a real element narrow enough to be a line. */
  const hairlines = (root) => {
    const segs = [];
    const push = (x, top, bottom, w, how, el) => {
      if (bottom - top < 24) return;
      segs.push({ x: +x.toFixed(2), top: +top.toFixed(2), bottom: +bottom.toFixed(2), w: +w.toFixed(2), how, from: sig(el) });
    };
    const scan = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();

      const bw = parseFloat(cs.borderLeftWidth) || 0;
      if (bw > 0 && bw <= 4 && opaque(cs.borderLeftColor)) push(r.left + bw / 2, r.top, r.bottom, bw, 'border-left', el);

      for (const which of ['::before', '::after']) {
        const ps = getComputedStyle(el, which);
        if (ps.content === 'none' || ps.display === 'none') continue;
        const pw = parseFloat(ps.width) || 0;
        const ph = parseFloat(ps.height) || 0;
        if (!(pw > 0 && pw <= 4 && ph >= 24)) continue;
        const painted = opaque(ps.backgroundColor) || (ps.backgroundImage && ps.backgroundImage !== 'none');
        if (!painted) continue;
        /* An absolutely positioned pseudo-element is offset from its host's
           padding box, which is where a rail is put. Anything else is laid out
           in flow and is not a rail we can locate without painting it. */
        if (ps.position !== 'absolute') continue;
        const x = r.left + (parseFloat(cs.borderLeftWidth) || 0) + (parseFloat(ps.left) || 0);
        const y = r.top + (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(ps.top) || 0);
        push(x + pw / 2, y, y + ph, pw, which, el);
      }

      if (r.width > 0 && r.width <= 4 && r.height >= 24 && opaque(cs.backgroundColor)) {
        push(r.left + r.width / 2, r.top, r.bottom, r.width, 'element', el);
      }
      for (const kid of el.children) scan(kid);
    };
    scan(root);
    return segs;
  };

  const out = { timelines: [], rows: [] };

  for (const tl of document.querySelectorAll('.tl')) {
    const tcs = getComputedStyle(tl);
    if (tcs.display === 'none') continue;
    const items = [...tl.children].filter((li) => getComputedStyle(li).display !== 'none');
    const dots = items.map((li) => {
      const found = [...li.children].filter((k) => k.classList.contains('tl__dot'));
      if (!found.length) return null;
      const r = found[0].getBoundingClientRect();
      return { n: found.length, cx: +(r.left + r.width / 2).toFixed(2), top: +r.top.toFixed(2), bottom: +r.bottom.toFixed(2) };
    });

    /* Hairlines sharing an x within 3px are one rail. THE LEFTMOST GROUP IS THE
       RAIL, and picking it that way rather than by length is a correction made
       while writing this file.
     *
     * The first attempt took the LONGEST group, and on /about it chose the
     * wrong line by 0.02px: every stop there is a .surface card, each card has a
     * 1px border on all four sides, and five card borders stacked down the
     * column span almost exactly what the rail spans. The gate then reported the
     * gaps BETWEEN THE CARDS as holes in the rail and every dot as 31px off it —
     * a confident, precise, entirely wrong answer about a page that was correct.
     *
     * Leftmost is not a tie-break, it is the definition. A rail is the line the
     * content is indented away from, so it is always left of the content and
     * therefore left of anything the content draws. It also still indicts the
     * defect this gate was written for: with the rail drawn per item there is no
     * line further left, so the four segments ARE the leftmost group and are
     * measured as the broken rail they were. */
    const segs = hairlines(tl);
    const groups = new Map();
    for (const s of segs) {
      let key = null;
      for (const k of groups.keys()) if (Math.abs(k - s.x) <= 3) { key = k; break; }
      if (key === null) { key = s.x; groups.set(key, []); }
      groups.get(key).push(s);
    }
    let rail = null;
    for (const [x, list] of groups) {
      if (!rail || x < rail.x) rail = { x, list };
    }

    let gaps = [];
    let cover = null;
    if (rail) {
      const sorted = [...rail.list].sort((a, b) => a.top - b.top);
      let end = sorted[0].bottom;
      let start = sorted[0].top;
      for (const s of sorted.slice(1)) {
        if (s.top - end > GAP_TOL) gaps.push({ from: +end.toFixed(1), to: +s.top.toFixed(1), size: +(s.top - end).toFixed(1) });
        end = Math.max(end, s.bottom);
      }
      cover = { top: +start.toFixed(1), bottom: +end.toFixed(1), x: +rail.x.toFixed(2), pieces: rail.list.length, how: [...new Set(rail.list.map((s) => s.how))].join(' + ') };
    }

    out.timelines.push({
      selector: sig(tl),
      stops: items.length,
      rail: cover,
      gaps,
      missing: dots.map((d, i) => (d ? null : i + 1)).filter((v) => v !== null),
      extra: dots.map((d, i) => (d && d.n > 1 ? { stop: i + 1, n: d.n } : null)).filter(Boolean),
      offRail: cover
        ? dots.map((d, i) => (d && Math.abs(d.cx - cover.x) > DOT_TOL ? { stop: i + 1, off: +(d.cx - cover.x).toFixed(1) } : null)).filter(Boolean)
        : [],
      outside: cover
        ? dots.map((d, i) => (d && (d.top < cover.top - GAP_TOL || d.bottom > cover.bottom + GAP_TOL) ? { stop: i + 1 } : null)).filter(Boolean)
        : [],
    });
  }

  /* ── A ROW OF CARDS, BAND BY BAND ──────────────────────────────────────
   *
   * BY BAND, not by row, and it is the same correction check-render.js makes
   * about button widths: below the breakpoint a card row deliberately stacks,
   * and comparing a stacked card against the one above it would fail every
   * route at 390 for doing exactly what it should. Cards whose tops agree are
   * side by side; everything else is a different band. */
  for (const row of document.querySelectorAll('.card-row')) {
    if (getComputedStyle(row).display === 'none') continue;
    const cards = [...row.children].filter((k) => {
      const cs = getComputedStyle(k);
      if (cs.display === 'none' || cs.visibility === 'hidden') return false;
      const r = k.getBoundingClientRect();
      return r.width > 60 && r.height > 24;
    });
    const bands = [];
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      let band = bands.find((b) => Math.abs(b.top - r.top) <= 2);
      if (!band) { band = { top: r.top, cards: [] }; bands.push(band); }
      band.cards.push(c);
    }
    for (const band of bands) {
      if (band.cards.length < 2) continue;
      const heights = band.cards.map((c) => +c.getBoundingClientRect().height.toFixed(1));
      /* THE LAST THING IN THE CARD, and only if it IS a call to action. A card
         ending in a paragraph has nothing to line up, and requiring one would
         be a rule about content rather than about layout.
       *
       * A LINK INSIDE A SENTENCE IS NOT A CALL TO ACTION, and that exclusion is
       * here because the first run found one: /partners closes its form with
       * "...you agree to our Privacy Policy", and the gate lined that link up
       * against the "Book a 30-minute call" button in the card beside it and
       * demanded they meet, 75.7px apart. Moving fine print to match a button
       * would have been a real regression shipped to satisfy a rule.
       *
       * The test is the same IDEA check-render.js uses for the WCAG 2.5.8 inline
       * exemption and for its button-row rule — a control is in flowing text if
       * there is a sentence around it — but it is not the same code, and saying
       * so was wrong. Corrected 2026-08-04, A-57: check-render tests the DIRECT
       * PARENT for a text node; this walks every ancestor up to the card, because
       * a CTA here can be two wrappers deep. Three files, one idea, three
       * implementations of it — which is worth flagging as the next candidate for
       * exactly the consolidation this pass has been doing to CSS.
       * The .item__more wrapper on /roadmap is a <p> holding nothing but its
       * link, so it passes; the consent line on /partners holds a sentence, so it
       * does not. */
      const inFlowingText = (el, stop) => {
        for (let n = el.parentElement; n && n !== stop; n = n.parentElement) {
          if ([...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim().length > 3)) return true;
        }
        return false;
      };
      const ctas = band.cards
        .map((c) => {
          const last = [...c.children].filter((k) => getComputedStyle(k).display !== 'none').pop();
          if (!last) return null;
          const a = last.matches('a, button') ? last : last.querySelector('a, button');
          if (!a) return null;
          const r = a.getBoundingClientRect();
          if (r.height === 0) return null;
          if (inFlowingText(a, c)) return null;
          return { top: +r.top.toFixed(1), text: (a.textContent || '').trim().slice(0, 24) };
        })
        .filter(Boolean);
      out.rows.push({
        selector: sig(row),
        heights,
        floorSpread: +(Math.max(...heights) - Math.min(...heights)).toFixed(1),
        ctas,
        ctaSpread: ctas.length > 1 ? +(Math.max(...ctas.map((c) => c.top)) - Math.min(...ctas.map((c) => c.top))).toFixed(1) : null,
      });
    }
  }

  return out;
})()`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const all = routes();
/* key -> { routes:Set, viewports:Set, detail }. Grouped by the component's class
   signature, because one timeline rendered on two routes is one defect. */
const railFaults = new Map();
const rowFaults = new Map();
const usedRail = new Set();
const usedRow = new Set();
let timelinesSeen = 0;
let rowsSeen = 0;
const VIEWPORTS = [1440, 390];

const note = (map, key, route, vp, detail) => {
  if (!map.has(key)) map.set(key, { routes: new Set(), viewports: new Set(), detail });
  map.get(key).routes.add(route);
  map.get(key).viewports.add(vp);
};

for (const route of all) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp, height: vp === 1440 ? 1200 : 844 });
    const m = await page.evaluate(MEASURE);

    for (const t of m.timelines) {
      if (vp === VIEWPORTS[0]) timelinesSeen += 1;
      const ex = ALLOW_RAIL.find((a) => a.route === route && a.selector === t.selector);
      if (ex) { usedRail.add(`${ex.route}::${ex.selector}`); continue; }

      if (!t.rail) {
        note(railFaults, `${t.selector}   no rail drawn at all`, route, vp,
          `${t.stops} stop(s) and not one vertical line inside the list`);
      } else if (t.gaps.length) {
        note(railFaults, `${t.selector}   ${t.gaps.length} gap(s) in the rail`, route, vp,
          `${t.rail.pieces} piece(s) drawn as ${t.rail.how}; gaps of ${t.gaps.map((g) => `${g.size}px`).join(', ')}`);
      }
      if (t.missing.length) {
        note(railFaults, `${t.selector}   ${t.missing.length} stop(s) with no marker`, route, vp,
          `stop(s) ${t.missing.join(', ')} of ${t.stops} carry no .tl__dot`);
      }
      if (t.extra.length) {
        note(railFaults, `${t.selector}   ${t.extra.length} stop(s) with more than one marker`, route, vp,
          t.extra.map((e) => `stop ${e.stop} has ${e.n}`).join(', '));
      }
      if (t.offRail.length) {
        note(railFaults, `${t.selector}   ${t.offRail.length} marker(s) off the rail`, route, vp,
          t.offRail.map((o) => `stop ${o.stop} is ${o.off}px off centre`).join(', '));
      }
      if (t.outside.length) {
        note(railFaults, `${t.selector}   ${t.outside.length} marker(s) outside the rail's span`, route, vp,
          `the rail runs ${t.rail.top} to ${t.rail.bottom} and does not reach them`);
      }
    }

    for (const r of m.rows) {
      if (vp === VIEWPORTS[0]) rowsSeen += 1;
      const ex = ALLOW_ROW.find((a) => a.selector === r.selector);
      if (ex) { usedRow.add(ex.selector); continue; }
      if (r.floorSpread > FLOOR_TOL_PX) {
        note(rowFaults, `${r.selector}   floor spread ${r.floorSpread}px`, route, vp,
          `card heights ${r.heights.join('px, ')}px`);
      }
      if (r.ctaSpread !== null && r.ctaSpread > CTA_TOL_PX) {
        note(rowFaults, `${r.selector}   call(s) to action ${r.ctaSpread}px out of line`, route, vp,
          r.ctas.map((c) => `"${c.text}" at ${c.top}`).join(', '));
      }
    }
  }
  await page.setViewportSize({ width: 1440, height: 1200 });
}

await browser.close();
server.close();

console.log(
  `timeline: ${all.length} route(s) measured at ${VIEWPORTS.join(' and ')}; ` +
    `${timelinesSeen} timeline(s) and ${rowsSeen} card-row band(s) found at ${VIEWPORTS[0]}`,
);

console.log(`  ${ALLOW_RAIL.length} timeline(s) allowed a broken rail:`);
for (const a of ALLOW_RAIL) {
  const stale = usedRail.has(`${a.route}::${a.selector}`) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.route}  ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}
if (!ALLOW_RAIL.length) console.log('    none, which is the state to keep it in');

console.log(`  ${ALLOW_ROW.length} row(s) allowed not to share a floor:`);
for (const a of ALLOW_ROW) {
  const stale = usedRow.has(a.selector) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}
if (!ALLOW_ROW.length) console.log('    none, which is the state to keep it in');

/* A timeline that renders nowhere means the measurement found nothing and
   reported clean, which is the one failure mode a gate must never have. Two
   routes draw one; if that ever reaches zero the rule has stopped looking. */
if (!timelinesSeen) {
  console.error('\ntimeline: no .tl found on any route\n');
  console.error('  /about and /roadmap both render one. Finding none means this gate measured');
  console.error('  nothing and would have passed whatever the pages looked like.\n');
}

/* ── THE SAME SELF-CHECK FOR THE CARD ROWS, ADDED 2026-08-04 ────────────────
 *
 * It was missing, and its absence is the defect this file's timeline self-check
 * three lines above exists to prevent — written for one of the two rules and
 * not the other. `.card-row` is carried on exactly two routes, /partners and
 * /roadmap, and a rename, a refactor into a component with a different class,
 * or a page dropping the class would take `rowsSeen` to zero. Rules 3 and 4
 * would then measure nothing, report nothing, and PASS — and styles/card-row.css
 * would once again be a recipe with a comment claiming a gate holds it.
 *
 * That is exactly the A-55 shape: card-row.css spent a day naming a rule in
 * check-render.js that had never existed. A gate that has stopped looking is
 * indistinguishable from a gate that looked and found nothing, unless it says
 * how much it looked at. */
if (!rowsSeen) {
  console.error('\ntimeline: no .card-row band found on any route\n');
  console.error('  /partners and /roadmap both render one, four bands between them with two');
  console.error('  or more cards each. Finding none means rules 3 and 4 measured nothing and');
  console.error('  would have passed whatever those pages looked like. Check the class has');
  console.error('  not been renamed before assuming the pages changed.\n');
}

if (railFaults.size) {
  console.error(`\ntimeline: ${railFaults.size} fault(s) in a timeline rail\n`);
  for (const [key, info] of [...railFaults].sort((a, b) => b[1].routes.size - a[1].routes.size)) {
    console.error(`  ${key}`);
    console.error(
      `      ${info.routes.size} route(s) at ${[...info.viewports].sort((a, b) => a - b).join(' and ')}, e.g. ${[...info.routes].slice(0, 3).join(' ')}`,
    );
    console.error(`      ${info.detail}`);
  }
  console.error('\n  A rail belongs to the LIST, not to the items. A border on a gapped grid item');
  console.error('  can only draw the item, so it renders as one bracket per stop with the grid');
  console.error('  gap showing through between them — which is what /roadmap shipped, four');
  console.error('  segments with 60px holes. styles/timeline.css draws one rail on .tl and');
  console.error('  places .tl__dot on it by arithmetic; carry .tl__item and .tl__dot and the');
  console.error('  whole thing is done. Do NOT redraw the rail locally.\n');
}

if (rowFaults.size) {
  console.error(`\ntimeline: ${rowFaults.size} card row(s) not lining up\n`);
  for (const [key, info] of [...rowFaults].sort((a, b) => b[1].routes.size - a[1].routes.size)) {
    console.error(`  ${key}`);
    console.error(
      `      ${info.routes.size} route(s) at ${[...info.viewports].sort((a, b) => a - b).join(' and ')}, e.g. ${[...info.routes].slice(0, 3).join(' ')}`,
    );
    console.error(`      ${info.detail}`);
  }
  console.error('\n  styles/card-row.css: cards standing side by side are ONE OBJECT presented as');
  console.error('  alternatives, and a comparison needs a shared baseline. `align-items: stretch`');
  console.error('  gives the boxes one floor; it does NOT move the content inside them, so two');
  console.error('  cards of identical height can still finish 28.9px apart. Put `card-grow` on');
  console.error('  the child that should absorb the slack — the body, a list, a media block,');
  console.error('  never a heading — and the call to action drops to the floor.\n');
}

if (railFaults.size || rowFaults.size || !timelinesSeen || !rowsSeen) process.exit(1);

console.log('\n  every timeline rail is one unbroken line, every stop on it carries a marker');
console.log('  and every marker sits on the line rather than beside it, and every row of');
console.log('  cards shares a floor with its calls to action on one baseline, at 1440 and 390');
