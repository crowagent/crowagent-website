/**
 * check-disclosure.js — every <summary> on the site draws something.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * A-65. Six disclosures on /privacy, /terms and /security hid their contents
 * behind a control with no affordance of any kind. Not a faint one, not a small
 * one: nothing. Measured as the visible text inside each <details>, summary and
 * markup excluded — "AI Disclaimer, model behaviour, accuracy, professional
 * review" 791 characters, "Liability, full clause text" 620, "Acceptable Use,
 * full enforcement detail" 597, and 746 more across the two on /security, 2,754
 * in all. Every one was a click away and there was no mark on the page to say
 * so. On a phone there is not even a pointer cursor to hint at it.
 *
 * THE MECHANISM, BECAUSE IT IS WHAT MAKES THIS UNCATCHABLE FROM SOURCE. A
 * <summary> is `display: list-item` with `list-style-type: disclosure-closed` in
 * every user agent, and that is where its triangle comes from. Setting
 * `display: flex` on it — which every disclosure treatment on this site does,
 * correctly, because a label on one side and a mark on the other is a flex row —
 * deletes the marker box. The `list-style-type` survives in the computed style
 * with nothing left to draw into.
 *
 * So on all six of those controls `list-style-type: disclosure-closed` COMPUTED,
 * and nothing was painted. A gate that reads declarations sees a summary that
 * states a marker type, a pointer cursor, a 44px target and a focus ring, and
 * passes it. The only question that separates the six from the other 75 is
 * whether anything is PAINTED, and only the rendered page can answer it.
 *
 * That is the same class of defect as the four this project already has gates
 * for — check-render.js, check-sheen.js, check-treatments.js and
 * check-controls.js were each written after a declaration was found to be
 * present and the pixel absent — and it is the first one where the declaration
 * was made by the USER AGENT rather than by this codebase, which is why none of
 * the four covered it.
 *
 * ── THE FIVE RULES ──────────────────────────────────────────────────────────
 *
 *   1 AFFORDANCE  Every <summary> draws a visible mark: a native ::marker, a
 *                 ::before/::after carrying content, or a child icon element.
 *                 Measured, not inferred — the pseudo-element's used box must be
 *                 at least MIN_MARK px in both dimensions, its opacity above
 *                 zero, its visibility `visible`, its ink not transparent, and
 *                 its ink at least 3:1 against the first painted background
 *                 behind it (WCAG 2.2 SC 1.4.11, the floor for a non-text
 *                 indicator). "There is an outline" was not the question
 *                 check-treatments.js's focus rule turned out to be asking
 *                 either; "there is a ::after" is not this one.
 *
 *   2 TARGET      Every <summary> clears 24px in both dimensions, at 1440 and at
 *                 390. WCAG 2.2 SC 2.5.8. A disclosure is the one control on
 *                 this site whose target is set by a page rather than by a
 *                 shared class, so styles/blocks.css states a 44px floor and
 *                 this measures whether a page took it away.
 *
 *   3 RECIPE      One mark, one recipe, per viewport. Four were measured on the
 *                 build of 2026-08-04: '+' rotating to a cross on 47 controls, a
 *                 20px SVG chevron on 28, a rotating down-arrow on 1, and
 *                 nothing at all on 6. The fingerprint is the kind of mark, its
 *                 glyph, face, size, weight and height.
 *
 *                 COLOUR IS DELIBERATELY OUTSIDE IT, and the reason is
 *                 check-treatments.js's rather than a new one: hue carries
 *                 meaning on this site and the palette is owned by
 *                 styles/tokens.css, so a gate that fingerprinted colour would
 *                 be competing with that file for authority. Rule 1 already
 *                 asserts the only thing about the colour that is not
 *                 negotiable, which is that a reader can see it.
 *
 *                 WIDTH IS OUTSIDE IT TOO, and that one was measured before it
 *                 was excluded: the /pricing mark is 16.23px wide against
 *                 14.94px everywhere else, because that summary carries `.meta`
 *                 and the glyph inherits its 0.1em tracking. One declaration,
 *                 two advance widths. Fingerprinting it would report a fork that
 *                 nobody wrote.
 *
 *   4 SOURCE      Only styles/blocks.css may declare the mark. Rule 3 cannot see
 *                 a copy that is currently accurate — an identical declaration
 *                 has an identical fingerprint, so a site with three definitions
 *                 of one mark measures as having one mark — and that blind spot
 *                 is not theoretical here: after the A-65 consolidation the
 *                 rendered rules below pass while two layouts still restate the
 *                 whole recipe. check-treatments.js records the same argument at
 *                 length for its rules 8, 9 and 10.
 *
 *   5 FLOOR       Every rule above is satisfied trivially if <summary> stops
 *                 existing. So the gate states how many disclosures on how many
 *                 routes it expects, and that styles/blocks.css still declares
 *                 the mark, and fails below any of the three. On this codebase a
 *                 gate that cannot fail is the normal failure rather than the
 *                 unusual one: check-facts.js once printed "every rule clean"
 *                 while crashing on its own reporting path.
 *
 * ── WHAT RULE 1 DOES NOT MEASURE, STATED RATHER THAN LEFT TO BE FOUND ───────
 *
 * The NATIVE marker path is accepted without a size, because a ::marker box is
 * not exposed to the CSSOM — `getComputedStyle(el, '::marker').width` is not the
 * used value the way it is for ::before and ::after. Nothing on this site takes
 * that path today (all 81 disclosures draw a pseudo-element), so the branch has
 * never been exercised against a real page and is written on the specification
 * rather than on a measurement. If a page ever ships a bare `display: list-item`
 * summary, this rule will confirm the user agent was asked to draw a triangle
 * and will not confirm that it did.
 *
 * ── THE CONTRACT, WHICH IS THE ONE EVERY GATE HERE USES ─────────────────────
 *
 * Named exceptions, each carrying a written reason. All of them printed on every
 * run, whether they matched or not. An exception matching nothing is reported as
 * stale — the content came back, delete the line. Anything not listed fails.
 *
 * A reason beginning DEBT: is counted and printed separately, because "this is
 * wrong and is not being fixed today" is a different statement from "this is
 * right, and here is the argument". Same convention as check-controls.js.
 *
 * ── PROVED IN BOTH DIRECTIONS, 2026-08-04, EVERY RULE SEPARATELY ────────────
 *
 * Each fixture is a scratch copy of the build with ONE declaration changed, run
 * through DS_DIST, so a rule that fired was fired by the thing it names rather
 * than by a broken fixture.
 *
 *   RULE 1  the shared `content: '+'` deleted from the bundle, which is exactly
 *           the state the six legal disclosures were in — the flex layout, and
 *           nothing to draw. Reported 68 unmarked controls (34 x 2 viewports)
 *           by route and by their own summary text. Exit 1.
 *   RULE 2  the shared 44px floor replaced by a 16px box. Reported 12 targets
 *           under 24px, at both viewports, and did NOT report /faq, /crowmark or
 *           the comparison and sector rows, which set their own greater heights
 *           — so the rule measures the control rather than the stylesheet.
 *           Exit 1.
 *   RULE 3  the shared `font-size: var(--t-h4)` deleted, so each mark inherited
 *           its row's size instead. Reported FOUR recipes at 1440 (20.88, 20.80,
 *           16.00 and 13.00px) and THREE at 390, which is also the proof that
 *           the per-viewport split is real rather than decorative. Exit 1.
 *   RULE 4  a probe stylesheet under src/styles carrying `.probe summary::after
 *           { content: '>' }` and `.probe-two summary { list-style: none }`.
 *           Both reported at their own line. Two control blocks in the same
 *           probe did NOT fire — a summary declaring `display: flex` and a
 *           colour, and a summary `:focus-visible` ring — so the signature is
 *           about the MARK and not about any rule that mentions a summary.
 *           Exit 1.
 *   RULE 5  styles/blocks.css moved aside and a two-route build passed in.
 *           Reported the self-check failure by name rather than throwing a stack
 *           trace, and the floor breach under it. Exit 1.
 *
 * PASSES, exit 0: the real build — 81 disclosures on 14 routes, one recipe per
 * viewport, every mark measured, the 8 recorded source copies printed.
 *
 * Proving the pass path is not ceremony here. verify-restorations.mjs asserted
 * the mega-menu was frosted, from computed style, while the menu was drawing
 * nothing. A gate proved only to fail can still be lying when it passes.
 *
 * DS_DIST points the gate at another build so a failure can be exercised without
 * disturbing the tree, the same escape check-controls.js, check-design-system.js
 * and check-sheen.js take.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist, routesOf } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = process.env.DS_DIST || path.join(ROOT, 'dist');

/** The one file allowed to declare the mark. Not an exception: the owner. */
const OWNER = 'src/styles/blocks.css';

/* The smallest box that counts as a mark. A 20px glyph measures ~15 x 21; the
   floor is set well under that so a smaller mark is allowed and an empty
   ::after — content: '' with no box, which renders as absolutely nothing and is
   the easiest way to satisfy a naive "does it have a ::after" test — is not. */
const MIN_MARK = 4;

/* WCAG 2.2 SC 2.5.8, the pointer-target minimum. styles/blocks.css states 44px;
   this is the level below which the build stops. */
const MIN_TARGET = 24;

/* Two viewports, because a control shrinks on the small one and a mark that
   fits at 1440 can be clipped at 390. Same pair check-controls.js measures its
   target rule at. */
const VIEWPORTS = [
  { w: 1440, h: 1200 },
  { w: 390, h: 844 },
];

/* ══════════════════════════════════════════════════════════════════════════
 * THE ALLOW-LISTS
 * ════════════════════════════════════════════════════════════════════════ */

/* Disclosures allowed to draw no mark, or to draw one nobody can see — both
 * halves of rule 1, because "there is a ::after and it is 0.2:1 against the card
 * behind it" is the same outcome for the reader as no ::after at all.
 *
 * Entries are `{ selector, reason }` where the selector is `<route>  <element
 * signature>`, e.g. `/terms/  summary.lc-details`. Route and not viewport: a
 * mark that is invisible at 390 and fine at 1440 is a defect, not an exception.
 *
 * THIS LIST IS EMPTY AND MUST STAY EMPTY. There is no reader for whom an
 * unmarked disclosure works: a pointer user gets a cursor change, a touch user
 * gets nothing at all, and the content behind it is invisible to both. It is the
 * same argument check-treatments.js makes for ALLOW_FOCUS, and it has the same
 * answer. */
const ALLOW_NO_MARK = [];

/* Disclosures allowed under the 24px target floor, keyed the same way. Empty for
 * the same reason: SC 2.5.8 has no exception this site needs. */
const ALLOW_SMALL_TARGET = [];

/* Marks allowed a recipe of their own, keyed by the fingerprint this gate
 * prints. Empty: there is one disclosure on this site and it is one object. */
const ALLOW_RECIPE = [];

/* Files allowed to restate the mark, keyed `<file>  <selector>` without a line
 * number — a line drifts every time somebody edits above it, and an exemption
 * that silently stops matching is how the next real violation gets waved
 * through. Same keying as check-controls.js. */
const ALLOWED_SOURCE = new Map([
  /* ── THE TWO UNCONSOLIDATED COPIES ───────────────────────────────────────
   *
   * Both layouts declare, property for property, what styles/blocks.css now
   * declares for the whole site: `list-style: none`, the Safari marker rule, a
   * '+' at weight 800 in --c-interactive with a --dur transition, a 45-degree
   * rotation on open, and `transition: none` under reduced motion. They are
   * byte-identical to each other and, since A-65, to the shared definition — so
   * rule 3 measures ONE recipe and cannot see them. That is precisely the blind
   * spot rule 4 exists for, and it is worth having these two sitting in the
   * output as the standing proof that the blind spot is real.
   *
   * Deleting all ten declarations changes no pixel: the shared rule already
   * produces the same mark, which is how the /faq, /crowmark, /crowmark-buyers
   * and /pricing copies were removed in the same pass.
   *
   * A KEY IS A SELECTOR, NOT A LINE, so both files' `summary::after` rules — the
   * mark and the reduced-motion carve-out on the same selector — are covered by
   * one entry each. That is the keying check-controls.js argues for and it is
   * the right trade here too, but it means an entry can excuse MORE than the
   * reader assumes: anything either file ever says about that selector. Named
   * rather than left to be discovered. */
  ['src/layouts/Compare.astro  .cmp-body .cfaq summary',
   'DEBT: `list-style: none` restated. Deleting it changes no pixel — styles/blocks.css states it on every summary. NOT FIXED IN THIS PASS because Compare.astro was owned by a concurrent agent on 2026-08-04 and a collision in a layout has already emptied dist/ once tonight (see check-controls.js on Nav.astro)'],
  ['src/layouts/Compare.astro  .cmp-body .cfaq summary::-webkit-details-marker',
   'DEBT: the Safari marker rule, restated. Same file, same reason as the entry above'],
  ['src/layouts/Compare.astro  .cmp-body .cfaq summary::after',
   'DEBT: the mark itself — a \'+\' at weight 800 in --c-interactive with a --dur transition — and, on the same selector inside a @media block, the reduced-motion carve-out. Two rules, one key. Same file, same reason'],
  ['src/layouts/Compare.astro  .cmp-body .cfaq details[open] summary::after',
   'DEBT: the open state, restated. Same file, same reason'],
  ['src/layouts/Sector.astro  .sec-faq summary',
   'DEBT: `list-style: none` restated. Byte-identical to the Compare.astro copy above and to the shared definition. NOT FIXED IN THIS PASS because Sector.astro was owned by a concurrent agent on 2026-08-04'],
  ['src/layouts/Sector.astro  .sec-faq summary::-webkit-details-marker',
   'DEBT: the Safari marker rule, restated. Same file, same reason as the entry above'],
  ['src/layouts/Sector.astro  .sec-faq summary::after',
   'DEBT: the mark itself, and the reduced-motion carve-out on the same selector. Same file, same reason'],
  ['src/layouts/Sector.astro  .sec-faq details[open] summary::after',
   'DEBT: the open state, restated. Same file, same reason'],
]);

/* ── THE FLOOR (rule 5) ─────────────────────────────────────────────────────
 *
 * Measured on the build this gate was written against — 81 disclosures on 14
 * routes — then set BELOW the measurement rather than at it, so adding a
 * disclosure never fails the build and deleting the treatment always does. */
const FLOOR = { disclosures: 60, routes: 10 };

/* ══════════════════════════════════════════════════════════════════════════
 * RULE 4: SOURCE
 * ════════════════════════════════════════════════════════════════════════ */

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

/**
 * Every CSS rule in the project's own stylesheets, as {file, line, selector,
 * decls}. Lifted from check-controls.js deliberately rather than reinvented: the
 * innermost-block regex is what makes it correct inside @media without needing
 * to understand @media, comments are BLANKED rather than removed so every index
 * still maps to a real line, and only <style> content is read out of an .astro
 * file because frontmatter is JavaScript full of braces.
 */
function cssRules() {
  const out = [];
  for (const file of walk(SRC).filter((f) => /\.(css|astro)$/.test(f)).sort()) {
    const raw = fs.readFileSync(file, 'utf8');
    const blocks = [];
    if (file.endsWith('.css')) {
      blocks.push({ text: raw, offset: 0 });
    } else {
      const fm = raw.startsWith('---') ? raw.indexOf('\n---', 3) : -1;
      const body = fm > 0 ? raw.slice(fm) : raw;
      const base = fm > 0 ? fm : 0;
      for (const m of body.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        blocks.push({ text: m[1], offset: base + m.index + m[0].indexOf(m[1]) });
      }
    }
    for (const b of blocks) {
      const text = b.text.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
      const re = /([^{}@]+)\{([^{}]*)\}/g;
      let m;
      while ((m = re.exec(text))) {
        const selector = m[1].trim().replace(/\s+/g, ' ');
        if (!selector || selector.startsWith('@')) continue;
        out.push({
          file: rel(file),
          line: raw.slice(0, b.offset + m.index + (m[1].length - m[1].trimStart().length)).split('\n').length,
          selector,
          decls: m[2],
        });
      }
    }
  }
  return out;
}

/*
 * WHAT COUNTS AS DECLARING THE MARK, and each half is narrow on purpose.
 *
 * A rule targeting a summary's ::before, ::after or ::-webkit-details-marker is
 * a mark declaration whatever it says: those three pseudo-elements exist on a
 * summary for exactly one reason.
 *
 * A rule targeting the summary itself counts only when it declares
 * `list-style`, which is pure suppression and has no other purpose there.
 * `display` is deliberately NOT in the signature even though it is what actually
 * removes the marker box: /pricing legitimately sets `inline-flex` because that
 * control is a phrase in a row rather than a full-width header, and a signature
 * that fired on it would need an exception on day one — an allow-list wearing a
 * rule's name. Rule 1 covers that case from the other side by measuring whether
 * the mark still draws.
 */
const TARGETS_SUMMARY = /(^|[\s>+~(])summary\b/;
const MARK_PSEUDO = /summary(::?(before|after)\b|::-webkit-details-marker\b)/;
const SUPPRESSES = /(^|[;{\s])list-style\s*:/;

const sourceHits = [];
const usedSource = new Set();
let ownerDeclaresMark = false;

for (const r of cssRules()) {
  if (!TARGETS_SUMMARY.test(r.selector)) continue;
  const isMark = MARK_PSEUDO.test(r.selector) || SUPPRESSES.test(r.decls);
  if (!isMark) continue;
  if (r.file === OWNER) {
    /* THE SELF-CHECK (rule 5). A source rule that matched nothing anywhere would
       report clean whatever the tree looked like. blocks.css declares the mark
       by definition — it is the file the mark is defined in — so finding it
       there proves the reader reached the CSS, understood the block structure
       and matched what it is looking for. */
    if (MARK_PSEUDO.test(r.selector) && /content\s*:/.test(r.decls)) ownerDeclaresMark = true;
    continue;
  }
  const key = `${r.file}  ${r.selector}`;
  if (ALLOWED_SOURCE.has(key)) {
    usedSource.add(key);
    continue;
  }
  sourceHits.push({ at: `${r.file}:${r.line}`, selector: r.selector });
}

/* ══════════════════════════════════════════════════════════════════════════
 * The shared static server, because file:// breaks absolute asset paths
 * ════════════════════════════════════════════════════════════════════════ */

const server = await serveDist(DIST, 'disclosure');

/* ══════════════════════════════════════════════════════════════════════════
 * THE MEASUREMENT, run inside the page
 *
 * NO BACKTICKS ANYWHERE BELOW. Everything to the closing brace is a template
 * literal evaluated in the page, so a backtick in a comment ends the string and
 * the file stops parsing. Same constraint check-render.js and
 * check-treatments.js both document, and both record having hit.
 * ════════════════════════════════════════════════════════════════════════ */
const MEASURE = `(() => {
  const sig = (el) => {
    const c = [...el.classList].filter((x) => !/^astro-/.test(x));
    return el.tagName.toLowerCase() + (c.length ? '.' + c.join('.') : '');
  };
  const px = (v) => (parseFloat(v) || 0).toFixed(2);

  /* Relative luminance and contrast, WCAG 2.x. Needed because "is there a
     ::after" is not the question: a mark drawn in the card colour it sits on is
     a mark nobody can see, and it satisfies every other test in this rule. */
  const rgb = (v) => (v.match(/[\\d.]+/g) || []).map(Number);
  const lum = (c) => {
    const [r, g, b] = c.slice(0, 3).map((n) => {
      const s = n / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
    return (x + 0.05) / (y + 0.05);
  };
  /* The first painted background up the tree, starting at the summary itself:
     the mark is drawn inside its own control, so what it has to be seen against
     is whatever that control or its ancestors paint. */
  const behind = (el) => {
    let n = el;
    while (n) {
      const c = rgb(getComputedStyle(n).backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c;
      n = n.parentElement;
    }
    return [0, 0, 0];
  };

  const out = [];
  for (const s of document.querySelectorAll('summary')) {
    const cs = getComputedStyle(s);
    const box = s.getBoundingClientRect();
    const row = {
      s: sig(s),
      text: (s.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 44),
      w: box.width,
      h: box.height,
      rendered: cs.display !== 'none' && cs.visibility !== 'hidden' && box.width > 0 && box.height > 0,
      mark: null,
      why: null,
    };

    if (!row.rendered) {
      row.why = 'the summary itself renders no box (display ' + cs.display + ', visibility ' + cs.visibility + ')';
      out.push(row);
      continue;
    }

    /* ── THE NATIVE MARKER ────────────────────────────────────────────────
     * Accepted without a size; see the note in the header of this file about
     * what that branch does not measure. */
    if (/list-item/.test(cs.display) && cs.listStyleType !== 'none') {
      row.mark = { kind: 'native ::marker', recipe: 'marker ' + cs.listStyleType };
      out.push(row);
      continue;
    }

    /* ── A PSEUDO-ELEMENT ─────────────────────────────────────────────────
     * getComputedStyle on ::before / ::after returns the USED width and height
     * for a pseudo-element that generates a box, which is what makes rule 1
     * measurable at all. Verified on this build: the shared mark measures
     * 14.94 x 20.88 at 1440, and 18.41 tall at 390 where --t-h4 clamps down. */
    let found = null;
    for (const which of ['::before', '::after']) {
      const p = getComputedStyle(s, which);
      const content = p.content;
      if (!content || content === 'none' || content === 'normal') continue;
      const w = parseFloat(p.width) || 0;
      const h = parseFloat(p.height) || 0;
      const ink = rgb(p.color);
      const alpha = ink.length > 3 ? ink[3] : 1;
      found = {
        kind: 'pseudo ' + which,
        w, h,
        opacity: parseFloat(p.opacity),
        visibility: p.visibility,
        alpha,
        contrast: ratio(ink, behind(s)),
        recipe: [
          which,
          content,
          p.fontFamily.split(',')[0].replace(/"/g, ''),
          px(p.fontSize) + 'px',
          'w' + p.fontWeight,
          'h' + px(p.height),
        ].join(' '),
      };
      break;
    }

    /* ── A CHILD ICON ─────────────────────────────────────────────────────
     * Named shapes only. A <span> holding a word is a label, not a mark, and
     * counting one would pass every disclosure that has any content at all. */
    if (!found) {
      const icon = s.querySelector('svg, img, picture, [data-icon]');
      if (icon) {
        const ics = getComputedStyle(icon);
        const ir = icon.getBoundingClientRect();
        found = {
          kind: 'child ' + icon.tagName.toLowerCase(),
          w: ir.width,
          h: ir.height,
          opacity: parseFloat(ics.opacity),
          visibility: ics.visibility,
          alpha: 1,
          /* An icon draws with stroke or fill rather than with color, and both
             may be currentColor. Contrast is measured on the resolved ink the
             same way, taking whichever of the two is actually painted. */
          contrast: ratio(rgb(ics.stroke !== 'none' ? ics.stroke : ics.fill || ics.color), behind(s)),
          recipe: [
            'icon ' + icon.tagName.toLowerCase(),
            px(ir.width) + 'x' + px(ir.height),
            ics.strokeWidth || '0',
          ].join(' '),
        };
      }
    }

    if (!found) {
      row.why =
        'no marker, no ::before or ::after content, and no child icon' +
        ' (display ' + cs.display + ', list-style-type ' + cs.listStyleType + ')';
      out.push(row);
      continue;
    }

    row.mark = found;
    out.push(row);
  }
  return out;
})()`;

/* ══════════════════════════════════════════════════════════════════════════
 * THE RUN
 * ════════════════════════════════════════════════════════════════════════ */

const browser = await chromium.launch();

const all = routesOf(DIST);
const unmarked = [];   // rule 1
const invisible = [];  // rule 1, drawn but not seeable
const small = [];      // rule 2
const recipes = new Map(); // rule 3, keyed `<viewport>  <recipe>`
const usedNoMark = new Set();
const usedSmall = new Set();
const usedRecipe = new Set();
let disclosures = 0;
const routesWithAny = new Set();

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
  for (const route of all) {
    await page.goto(server.url(route), { waitUntil: 'load' });
    const found = await page.evaluate(MEASURE);
    if (!found.length) continue;
    routesWithAny.add(route);
    /* Counted on the first viewport only: the same control measured twice is
       one disclosure, and a floor that counted both would be half what it
       claims. */
    if (vp.w === VIEWPORTS[0].w) disclosures += found.length;

    for (const d of found) {
      const key = `${route}  ${d.s}`;

      if (!d.mark) {
        const ex = ALLOW_NO_MARK.find((a) => a.selector === key);
        if (ex) usedNoMark.add(ex.selector);
        else unmarked.push({ route, vp: vp.w, s: d.s, text: d.text, why: d.why });
        continue;
      }

      const m = d.mark;
      if (m.kind !== 'native ::marker') {
        const faults = [];
        if (m.w < MIN_MARK || m.h < MIN_MARK) {
          faults.push(`box ${m.w.toFixed(2)}x${m.h.toFixed(2)}, under the ${MIN_MARK}px floor`);
        }
        if (!(m.opacity > 0)) faults.push(`opacity ${m.opacity}`);
        if (m.visibility !== 'visible') faults.push(`visibility ${m.visibility}`);
        if (!(m.alpha > 0)) faults.push(`ink alpha ${m.alpha}`);
        if (m.contrast < 3) faults.push(`ink contrast ${m.contrast.toFixed(2)}:1, below the 3:1 minimum`);
        if (faults.length) {
          const ex = ALLOW_NO_MARK.find((a) => a.selector === key);
          if (ex) usedNoMark.add(ex.selector);
          else invisible.push({ route, vp: vp.w, s: d.s, text: d.text, why: faults.join('; ') });
        }
      }

      if (d.w < MIN_TARGET || d.h < MIN_TARGET) {
        const ex = ALLOW_SMALL_TARGET.find((a) => a.selector === key);
        if (ex) usedSmall.add(ex.selector);
        else small.push({ route, vp: vp.w, s: d.s, text: d.text, w: d.w, h: d.h });
      }

      const rk = `${vp.w}  ${m.recipe}`;
      const ex = ALLOW_RECIPE.find((a) => a.selector === m.recipe);
      if (ex) {
        usedRecipe.add(ex.selector);
        continue;
      }
      if (!recipes.has(rk)) recipes.set(rk, { vp: vp.w, recipe: m.recipe, routes: new Set(), examples: new Set() });
      recipes.get(rk).routes.add(route);
      recipes.get(rk).examples.add(`${d.s} "${d.text}"`);
    }
  }
  await page.close();
}

await browser.close();
server.close();

/* ══════════════════════════════════════════════════════════════════════════
 * THE REPORT
 * ════════════════════════════════════════════════════════════════════════ */

console.log(
  `disclosure: ${disclosures} <summary> element(s) on ${routesWithAny.size} route(s), measured at ` +
  VIEWPORTS.map((v) => v.w).join(' and ')
);
console.log('  colour is outside the recipe fingerprint on purpose: hue carries meaning on this');
console.log('  site and styles/tokens.css owns the palette. Rule 1 asserts the only thing about');
console.log('  the ink that is not negotiable, which is that a reader can see it.');

const printAllow = (title, list, used) => {
  console.log(`  ${list.length} ${title}:`);
  for (const a of list) {
    const stale = used.has(a.selector) ? '' : '   [STALE — matches nothing]';
    console.log(`    ${a.selector}${stale}`);
    console.log(`        ${a.reason}`);
  }
  if (!list.length) console.log('    none, which is the state to keep it in');
};
printAllow('disclosure(s) allowed to draw no mark', ALLOW_NO_MARK, usedNoMark);
printAllow('disclosure(s) allowed under the 24px target floor', ALLOW_SMALL_TARGET, usedSmall);
printAllow('mark(s) allowed a recipe of their own', ALLOW_RECIPE, usedRecipe);

console.log(`  ${ALLOWED_SOURCE.size} file(s)/selector(s) allowed to restate the mark:`);
let debt = 0;
for (const [key, why] of ALLOWED_SOURCE) {
  const stale = usedSource.has(key) ? '' : '   [STALE — matches nothing, delete it]';
  if (why.startsWith('DEBT:')) debt += 1;
  console.log(`    ${key}${stale}`);
  console.log(`        ${why}`);
}
if (!ALLOWED_SOURCE.size) console.log('    none, which is the state to keep it in');
if (debt) {
  console.log(`  ${debt} of those are DEBT — a real restatement of the shared mark, not an argued exception.`);
}

/* An exception that no longer matches is a line that is now a lie, and a stale
   exemption is how the next real defect gets waved through. Reported, not fatal:
   failing the build because a fork was FIXED would be perverse, and it is the
   contract check-treatments.js and check-content-parity.js both use. */
const staleSource = [...ALLOWED_SOURCE.keys()].filter((k) => !usedSource.has(k));
if (staleSource.length) {
  console.log(`  ${staleSource.length} source exception(s) matched nothing — delete them, the copy is gone.`);
}

let failed = false;

if (unmarked.length) {
  console.error(`\n  ${unmarked.length} DISCLOSURE(S) DRAW NO AFFORDANCE AT ALL:`);
  for (const u of unmarked) {
    console.error(`    ${u.route} @${u.vp}  ${u.s} "${u.text}"`);
    console.error(`        ${u.why}`);
  }
  console.error('    A reader has no way to know this content can be opened.');
  failed = true;
}

if (invisible.length) {
  console.error(`\n  ${invisible.length} DISCLOSURE MARK(S) DRAW SOMETHING NOBODY CAN SEE:`);
  for (const i of invisible) {
    console.error(`    ${i.route} @${i.vp}  ${i.s} "${i.text}"`);
    console.error(`        ${i.why}`);
  }
  failed = true;
}

if (small.length) {
  console.error(`\n  ${small.length} DISCLOSURE TARGET(S) UNDER ${MIN_TARGET}px (WCAG 2.2 SC 2.5.8):`);
  for (const s of small) {
    console.error(`    ${s.route} @${s.vp}  ${s.s} "${s.text}"  ${s.w.toFixed(0)}x${s.h.toFixed(0)}`);
  }
  failed = true;
}

/* Rule 3 is per viewport: --t-h4 is a clamp, so one declaration legitimately
   computes to 20.88px at 1440 and 18.40px at 390. Comparing across the two
   would report a fork the author never wrote. */
for (const vp of VIEWPORTS) {
  const here = [...recipes.values()].filter((r) => r.vp === vp.w);
  if (here.length <= 1) continue;
  console.error(`\n  ${here.length} DISCLOSURE MARK RECIPES AT ${vp.w}, AND THERE IS ONE DISCLOSURE:`);
  for (const r of here.sort((a, b) => b.routes.size - a.routes.size)) {
    console.error(`    ${r.recipe}`);
    console.error(`        ${r.routes.size} route(s), e.g. ${[...r.examples].slice(0, 2).join(' / ')}`);
  }
  failed = true;
}

if (sourceHits.length) {
  console.error(`\n  ${sourceHits.length} FILE(S) DECLARING THE DISCLOSURE MARK OUTSIDE ${OWNER}:`);
  for (const h of sourceHits) console.error(`    ${h.at}  ${h.selector}`);
  console.error(`    Fold it into ${OWNER}, or record it above with the reason it cannot be.`);
  failed = true;
}

/* Rule 5. Deliberately last: a floor breach means every result above it is
   meaningless rather than good. */
if (!ownerDeclaresMark) {
  console.error(`\n  SELF-CHECK FAILED: ${OWNER} declares no mark on a summary pseudo-element.`);
  console.error('    The source reader found nothing in the file the mark is defined in, so');
  console.error('    rule 4 above proves nothing about the rest of the tree.');
  failed = true;
}
if (disclosures < FLOOR.disclosures || routesWithAny.size < FLOOR.routes) {
  console.error(
    `\n  FLOOR BREACHED: ${disclosures} disclosure(s) on ${routesWithAny.size} route(s), ` +
    `below the expected ${FLOOR.disclosures} on ${FLOOR.routes}.`
  );
  console.error('    Every rule above passes trivially when there is nothing to measure.');
  failed = true;
}

if (failed) {
  console.error('');
  process.exit(1);
}

console.log('  every disclosure on the site draws a measured, visible mark, one recipe per');
console.log(`  viewport, declared in ${OWNER} and nowhere else but the recorded copies.`);
