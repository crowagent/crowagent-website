/**
 * check-render.js — the alignment rule, measured on the rendered page.
 *
 * WHY THIS EXISTS, AND IT IS WORTH READING BEFORE CHANGING ANYTHING HERE.
 *
 * The owner reported the same defect three times: content inside cards sitting
 * left instead of centred. Each time it was fixed and each time it came back
 * somewhere else, and `check-design-system.js` rule 1 passed throughout.
 *
 * Rule 1 fires on `text-align: left` or `start` being DECLARED. The
 * "Plugged in, read only" chips never declared it. They were a two-column grid
 * — an 18px logo column, then the name and scope in column two — and they
 * inherited `start` from the document like everything else. There was nothing
 * to grep for. The rule was not weak; it was looking at the wrong artefact.
 *
 * A declaration is what an author typed. Alignment is where the box ended up.
 * Those are different questions, and only the second one is what the owner sees.
 * So this gate renders the built site and measures.
 *
 * IT IS THE MOST EXPENSIVE GATE WE HAVE — a browser, one page load per route.
 * That is the price of asking the real question, and it is the reason it is a
 * separate script rather than more rules bolted onto the static gate: the static
 * gate must stay fast enough to run constantly.
 *
 * WIRED INTO `pnpm build` ON 2026-08-03, AS THE LAST STEP AFTER check-csp.js.
 * It was written on 2026-08-03 and deliberately left OUT of the build that day,
 * because it was reporting 18 blocks across 42 route instances and a gate that
 * fails on arrival blocks every build until somebody has time for it. All 18
 * are now fixed — not waived: eleven were drawn artefacts and are now <figure>,
 * four were the /compare cards and are now on the shared recipe via a rehype
 * step in astro.config.mjs, and three were row-cards and now carry
 * `surface--row`. The ALLOW list below is still empty, which is the state to
 * keep it in. Last, because it needs the finished dist and because a gate that
 * launches a browser should not stand between a developer and the cheap gates
 * that would have caught the same commit in a second.
 *
 * SAME CONTRACT AS EVERY OTHER GATE. Named exceptions, each with a written
 * reason. All of them printed on every run. Exceptions matching nothing are
 * reported as stale. Anything not listed fails the build.
 *
 * PROVED IN BOTH DIRECTIONS, 2026-08-03, and both directions matter.
 *
 * FAILS: a synthetic page reproducing the chip's exact shape — a card with
 * `grid-template-columns: 18px 1fr` and NOT ONE alignment property declared
 * anywhere — is caught, reporting `computed text-align is start`, the logo 141px
 * off centre and the name 14px off centre. That is the defect that survived
 * three rounds of fixes, reproduced in nine lines and now impossible to ship.
 *
 * PASSES: the same card as a single centred column exits 0 with "every card
 * centres its content". Proving the pass path is not ceremony. Hours earlier
 * check-facts.js printed "every rule clean" while crashing on its reporting
 * path, so the clean result had never once executed the code that reports a
 * violation. A gate proved only to fail can still be lying when it passes.
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
 * `{ route, selector, reason }`. `selector` is the block's class signature as
 * this gate prints it. A reason that only says "intentional" is not a reason.
 */
const ALLOW = [];

/* Rows allowed to hold buttons of different widths, by class signature. Applies
 * to the width-parity rule below and nothing else.
 *
 * A reason that only says "intentional" is not a reason here either. */
const ALLOW_UNEQUAL = [
  {
    selector: '.ca-nav-actions',
    reason:
      'The nav pairs a quiet "Sign in" link with a solid "Request access" CTA. ' +
      'Stretching the link to match the CTA presents two equal choices where the ' +
      'page deliberately offers one, and this row is nav chrome rather than a CTA ' +
      'row: it also holds the search trigger and is hidden below 900px. The ' +
      'pre-31-July build had the same pair at 68px against 144px, so unequal is ' +
      'the long-standing intent rather than a defect that survived.',
  },
  {
    selector: '.gx-filters',
    reason:
      'The glossary filter chips are labels, not calls to action, and their widths ' +
      'are their content: All, Legislation, Procurement, Bidding process. Padding ' +
      '"All" out to 163px to match the longest category makes a tag look like a ' +
      'button and buries the fact that it is the default. Equal width is right for ' +
      'a row that offers a choice between comparable actions, which this is not.',
  },
];

/* Controls that look like a button and are allowed not to be one.
 *
 * Each is a LABEL or a piece of chrome rather than a call to action. That
 * distinction is intent, and no measurement can make it, which is why this is a
 * named list carrying arguments rather than a cleverer test. Same reasoning as
 * ADR 0005, which leaves "is this element a marker" to review instead of
 * building a gate that guesses. */
const ALLOW_BESPOKE = [
  {
    selector: '.ca-search-trigger',
    reason:
      'The nav search affordance. It opens a palette rather than offering an action ' +
      'the page has, and it sits beside the sign-in and the CTA precisely so it reads ' +
      'as a different kind of thing.',
  },
  {
    selector: '.art__pill',
    reason:
      'Article tags. A pill states what a post is about and happens to be clickable. ' +
      'Styling it as a button would put eight equal calls to action above a headline.',
  },
  {
    selector: '.gx-chip',
    reason:
      'Glossary filter chips, exempted from the width rule above for the same reason: ' +
      'they are labels whose width is their content, and a filter is a state you are in ' +
      'rather than an action you take.',
  },
];

/* How far a child's centre may sit from its block's centre before it counts as
 * left-aligned. Sub-pixel layout and border rounding produce ~1px routinely;
 * a genuine left-alignment in a 342px chip was 145px out. */
const TOLERANCE_PX = 4;

if (!fs.existsSync(DIST)) {
  console.error(`render: no build at ${DIST}`);
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
  let rel = decodeURIComponent(req.url.split('?')[0]);
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
 * A card is a block that LOOKS like a card to a reader: it has a background or
 * a border, a card-scale radius, and padding. That is deliberately a visual
 * test rather than a class-name test, because the defect this gate exists to
 * catch was a block that never used the card class.
 */
const MEASURE = `(() => {
  const TOL = ${TOLERANCE_PX};
  const out = [];

  const sig = (el) => {
    const cls = [...el.classList].filter((c) => !/^astro-/.test(c));
    return cls.length ? '.' + cls.join('.') : el.tagName.toLowerCase();
  };

  const isCard = (el, cs) => {
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const pad = parseFloat(cs.paddingTop) || 0;
    const painted =
      (cs.backgroundImage && cs.backgroundImage !== 'none') ||
      (cs.backgroundColor && !/rgba?\\(0, 0, 0, 0\\)|transparent/.test(cs.backgroundColor)) ||
      (parseFloat(cs.borderTopWidth) > 0 && !/rgba?\\(0, 0, 0, 0\\)/.test(cs.borderTopColor));
    return radius >= 8 && pad >= 10 && painted;
  };

  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (!isCard(el, cs)) continue;

    /* Opted out on purpose, with a reason recorded in the design system.
     *
     *   surface--read   a card whose single paragraph runs three or four lines,
     *                   where centring costs real readability.
     *   surface--row    a card that IS a row: its content is columns that line
     *                   up with the columns of the cards above and below it.
     *
     * Both are defined in styles/surfaces.css with the argument written out, and
     * both are opt-outs rather than defaults: reaching for one is a decision
     * somebody can read and disagree with, which is the whole difference between
     * an exception and a text-align declaration nobody can account for.
     *
     * NO BACKTICKS ANYWHERE IN THIS BLOCK. Everything from MEASURE down to the
     * closing brace is a template literal evaluated in the page, so a backtick in
     * a comment ends the string and the file stops parsing. */
    if (el.classList.contains('surface--read')) continue;
    if (el.classList.contains('surface--row')) continue;

    /* ── WHAT IS READ RATHER THAN SCANNED ────────────────────────────────
     *
     * The first run reported 37 blocks, and the top two were a blockquote in
     * eight blog posts and a Shiki code block. Both are CORRECT left-aligned:
     * the design rule centres what is scanned and leaves what is read, and
     * centred code is unreadable regardless of the rule.
     *
     * Excluded STRUCTURALLY rather than by allow-list, because an allow-list
     * entry per blog post would grow with the content and would be a place the
     * gate had agreed not to look. This mirrors the STRUCTURAL_TAGS list
     * check-design-system.js rule 1 already uses, so the two gates answer the
     * same question the same way. */
    if (/^(BLOCKQUOTE|PRE|CODE|TABLE|THEAD|TBODY|TR|TH|TD|FIGURE|FIGCAPTION|DL|DT|DD|FORM|FIELDSET|LABEL|LEGEND|DETAILS|SUMMARY)$/.test(el.tagName)) continue;
    if (el.closest('pre, code, blockquote, table, .prose, .legal__body, .article-body, .gl-article')) continue;

    const r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 24) continue;

    const centre = r.left + r.width / 2;
    const reasons = [];

    /* THE COMPUTED value, not the authored one. This is the whole point: a
       block that inherits 'start' reports 'start' here and reports nothing at
       all to a grep. */
    const hasText = [...el.querySelectorAll('*')].some(
      (n) => n.childNodes.length && [...n.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())
    ) || [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());

    if (hasText && (cs.textAlign === 'start' || cs.textAlign === 'left')) {
      reasons.push('computed text-align is ' + cs.textAlign);
    }

    /* Children narrower than the block, sitting off its centre line. Catches
       the case where text-align is fine but a grid or flex track puts the box
       somewhere else. */
    for (const kid of el.children) {
      const ks = getComputedStyle(kid);
      if (ks.display === 'none' || ks.position === 'absolute' || ks.position === 'fixed') continue;
      const kr = kid.getBoundingClientRect();
      if (kr.width === 0 || kr.height === 0) continue;
      if (kr.width > r.width - 4) continue; // full-bleed, nothing to centre
      const off = kr.left + kr.width / 2 - centre;
      if (Math.abs(off) > TOL) {
        reasons.push(sig(kid) + ' sits ' + off.toFixed(0) + 'px off centre');
      }
    }

    if (reasons.length) out.push({ selector: sig(el), reasons: [...new Set(reasons)].slice(0, 4) });
  }

  /* ── TARGET SIZE, WCAG 2.2 SC 2.5.8 ────────────────────────────────────
   *
   * Added after the footer shipped 25 links per route under the 24px minimum,
   * the same 25 on all 43 routes because they were one component. Nothing could
   * see it: the static gate reads declarations and a target size is a rendered
   * box, and the axe run in the test suite does not assert 2.5.8.
   *
   * THE INLINE EXEMPTION IS IMPLEMENTED, NOT IGNORED. 2.5.8 excuses a target
   * whose size is constrained by the line-height of the text around it, because
   * enlarging an inline link breaks the line it sits in. A link inside a
   * paragraph, list item, table cell, definition or caption is that case. A link
   * standing alone in a column or a nav row is not, and those are what failed.
   *
   * Grouped by signature rather than listed, because one component repeated
   * across 43 routes is one defect. */
  const tiny = [];
  for (const el of document.querySelectorAll('a, button, summary, [role="button"]')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.width >= 24 && r.height >= 24) continue;
    /* THE EXEMPTION IS A SEMANTIC TEST, NOT A TAG LIST. A first pass listed the
     * tags that usually hold flowing text and missed two real cases: a link
     * inside a <span> mid-sentence on /contact, and nine inside a <div> on
     * /sectors. What 2.5.8 actually excuses is a target sitting IN text, so the
     * test is whether the link's own parent also holds a text node worth
     * reading. That reaches any wrapper, including ones nobody has written yet. */
    const par = el.parentElement;
    const inFlowingText =
      el.closest('p, li, dd, dt, td, th, figcaption, blockquote, .prose, .article-body') ||
      (par && [...par.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3));
    if (inFlowingText) continue;
    tiny.push({ selector: sig(el), size: r.width.toFixed(0) + 'x' + r.height.toFixed(0) });
  }

  /* ── BUTTON WIDTH PARITY ───────────────────────────────────────────────
   *
   * The owner raised this twice and it was answered wrongly twice. First by
   * measuring HEIGHT, which matched, and the conclusion recorded was optical
   * irradiation. Then by a width FLOOR on the component, which only equalises
   * buttons that fall BELOW it. The hero pair measured 152 and 152 the day the
   * floor went in and 165 and 152 once the component was matched to the
   * deployed site, because the primary crossed back over the floor. Nothing
   * noticed for a week.
   *
   * Both answers were about a BUTTON. The defect is a property of the ROW, so
   * this measures the row.
   *
   * STRUCTURAL, NOT BY CLASS, for the same reason the card test above is: the
   * fourteen containers that had this defect were fourteen different class
   * names, and a rule that looked for .btn-row would have found none of them.
   * A button here is a link or button that is padded and rounded, which is what
   * one looks like to a reader.
   *
   * SAME BAND ONLY. Controls stacked one above another are not this defect, and
   * on a phone the row deliberately stacks. Comparing those would fail every
   * route at 390 for doing exactly what it should. */
  const rows = [];
  for (const el of document.querySelectorAll('body *')) {
    /* A PARAGRAPH IS NOT A BUTTON ROW. The first run flagged .fc__free on three
     * routes: the free-to-use links under the final CTA, which are padded and
     * rounded enough to look like controls to the test above but are a line of
     * text links. Equalising those would pad "See pricing" out to the width of
     * "How the score is calculated" in the middle of a sentence.
     *
     * Excluded structurally rather than by name, and by the SAME test the
     * target-size rule already uses for the SC 2.5.8 inline exemption: a
     * container is flowing text if it is a paragraph or holds a text node worth
     * reading. Two rules, one definition of "in text". */
    if (el.tagName === 'P') continue;
    if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3)) continue;

    const kids = [...el.children].filter((k) => {
      if (!/^(A|BUTTON)$/.test(k.tagName)) return false;
      const ks = getComputedStyle(k);
      if (ks.display === 'none' || ks.visibility === 'hidden') return false;
      const kr = k.getBoundingClientRect();
      if (kr.width === 0 || kr.height === 0) return false;
      return (parseFloat(ks.paddingLeft) || 0) >= 8 && (parseFloat(ks.borderTopLeftRadius) || 0) >= 4;
    });
    if (kids.length < 2) continue;

    const boxes = kids.map((k) => k.getBoundingClientRect());
    const top = boxes[0].top;
    if (!boxes.every((b) => Math.abs(b.top - top) <= 2)) continue;

    const widths = boxes.map((b) => b.width);
    const spread = Math.max(...widths) - Math.min(...widths);
    if (spread <= TOL) continue;

    rows.push({
      selector: sig(el),
      spread: spread.toFixed(0),
      items: kids.map((k, i) => widths[i].toFixed(0) + 'px ' + k.textContent.trim().slice(0, 24)),
    });
  }
  /* ── ONE BUTTON RECIPE ─────────────────────────────────────────────────
   *
   * Button.astro calls itself "the only button" and was not. THREE separate
   * systems were found and retired in one day: the glossary's .gl-btn, which
   * used the display font and faded on hover where every other button lifts and
   * glows; the nav's .ca-btn, whose markup had been converted a week earlier
   * while 25 lines of CSS went on shipping; and .form__submit, a flat teal with
   * no gradient and no shadow behind every form on the site.
   *
   * None was noticed by review. Each was found by measuring the rendered page,
   * and the third was kept alive purely because Button had no :disabled state
   * and .form__submit did. This rule exists so the FOURTH does not need finding.
   *
   * WHAT COUNTS AS A BUTTON, and why each exclusion is here rather than in a
   * name list:
   *   - a card         big, padded, radius 8+, 80px or taller. Half this site's
   *                    cards are links; they navigate, they are not controls.
   *   - a card, again  anything wrapping a heading or paragraph. A control with
   *                    an h3 inside it is a card that happens to be clickable.
   *   - in text        a padded link mid-sentence. Same test the target-size and
   *                    width rules use, so all three share one definition.
   *
   * What is left is a padded, rounded, painted control at least 36px tall that
   * is not a .btn, which is a hand-rolled button or a label. Labels are named
   * in ALLOW_BESPOKE with the argument for each. */
  const bespoke = [];
  for (const el of document.querySelectorAll('a, button, [role="button"]')) {
    if (el.classList.contains('btn')) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    const padX = parseFloat(cs.paddingLeft) || 0;
    const padY = parseFloat(cs.paddingTop) || 0;
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const painted =
      (cs.backgroundColor && !/rgba?\\(0, 0, 0, 0\\)/.test(cs.backgroundColor)) ||
      (parseFloat(cs.borderTopWidth) > 0 && !/rgba?\\(0, 0, 0, 0\\)/.test(cs.borderTopColor));
    if (!(padX >= 10 && radius >= 4 && r.height >= 36 && painted)) continue;

    if (radius >= 8 && padY >= 10 && r.height >= 80) continue;
    if (el.querySelector('h1, h2, h3, h4, p')) continue;
    if (el.closest('p, li, dd, dt, td, th, figcaption, blockquote, .prose, .article-body')) continue;
    const par = el.parentElement;
    if (par && [...par.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 3)) continue;

    bespoke.push({ selector: sig(el), text: el.textContent.trim().slice(0, 28) });
  }

  return { blocks: out, tiny, rows, bespoke };
})()`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const all = routes();
const violations = [];
const tinyTargets = new Map();
const unequalRows = new Map();
const bespokeButtons = new Map();
const used = new Set();
const usedUnequal = new Set();
const usedBespoke = new Set();

for (const route of all) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  const measured = await page.evaluate(MEASURE);
  const found = measured.blocks;
  for (const t of measured.tiny) {
    const key = `${t.selector} ${t.size}`;
    if (!tinyTargets.has(key)) tinyTargets.set(key, new Set());
    tinyTargets.get(key).add(route);
  }
  /* Grouped by signature, like the target-size rule: one row component repeated
     across 43 routes is one defect rather than 43. */
  for (const r of measured.rows) {
    const ex = ALLOW_UNEQUAL.find((a) => a.selector === r.selector);
    if (ex) {
      usedUnequal.add(ex.selector);
      continue;
    }
    const key = `${r.selector}  spread ${r.spread}px  [${r.items.join(', ')}]`;
    if (!unequalRows.has(key)) unequalRows.set(key, new Set());
    unequalRows.get(key).add(route);
  }
  for (const bq of measured.bespoke) {
    const ex = ALLOW_BESPOKE.find((a) => a.selector === '.' + bq.selector.replace(/^\./, ''));
    if (ex) {
      usedBespoke.add(ex.selector);
      continue;
    }
    const key = `${bq.selector}  "${bq.text}"`;
    if (!bespokeButtons.has(key)) bespokeButtons.set(key, new Set());
    bespokeButtons.get(key).add(route);
  }
  for (const f of found) {
    const ex = ALLOW.find((a) => a.route === route && a.selector === f.selector);
    if (ex) {
      used.add(`${ex.route}::${ex.selector}`);
      continue;
    }
    violations.push({ route, ...f });
  }
}

await browser.close();
server.close();

console.log(`render: ${all.length} route(s) measured at 1440`);
console.log(`  ${ALLOW.length} named exception(s):`);
for (const a of ALLOW) {
  const stale = used.has(`${a.route}::${a.selector}`) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.route}  ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}
if (!ALLOW.length) console.log('    none');

console.log(`  ${ALLOW_UNEQUAL.length} row(s) allowed to hold unequal buttons:`);
for (const a of ALLOW_UNEQUAL) {
  const stale = usedUnequal.has(a.selector) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}

console.log(`  ${ALLOW_BESPOKE.length} control(s) allowed to look like a button without being one:`);
for (const a of ALLOW_BESPOKE) {
  const stale = usedBespoke.has(a.selector) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}

/* ── BUTTON WIDTH PARITY REPORT ─────────────────────────────────────────────
 *
 * Fails the build. Two buttons side by side at different widths is the defect
 * the owner reported twice and was told twice was fixed. */
if (unequalRows.size) {
  console.error(`
render: ${unequalRows.size} row(s) with buttons of unequal width
`);
  for (const [key, rts] of [...unequalRows].sort((a, b) => b[1].size - a[1].size)) {
    console.error(`  ${key}`);
    console.error(`      ${rts.size} route(s), e.g. ${[...rts].slice(0, 3).join(' ')}`);
  }
  console.error('\n  Buttons laid out side by side should be one width. Use .btn-row, which');
  console.error('  sizes every button in the row to the widest label. A width floor on the');
  console.error('  button itself does NOT fix this: it only equalises buttons below the floor,');
  console.error('  and two that both clear it drift apart again. See styles/button-row.css.\n');
}

/* ── TARGET SIZE REPORT ─────────────────────────────────────────────────────
 *
 * Reported separately from alignment because it is a separate rule with a
 * separate standard behind it, and because one component repeated across 43
 * routes is one defect rather than 43. */
if (tinyTargets.size) {
  console.error(`
render: ${tinyTargets.size} target(s) below the 24px WCAG 2.5.8 minimum
`);
  for (const [key, rts] of [...tinyTargets].sort((a, b) => b[1].size - a[1].size)) {
    console.error(`  ${key}   (${rts.size} route(s), e.g. ${[...rts].slice(0, 3).join(' ')})`);
  }
  console.error('\n  SC 2.5.8 exempts a target constrained by the line-height of the text around');
  console.error('  it, and this check already skips anything inside a paragraph, list item,');
  console.error('  cell, definition or caption. What is left is standalone and has to be 24px.\n');
}

if (violations.length) {
  /* One selector repeated across 40 routes is one defect, not forty. */
  const bySelector = new Map();
  for (const v of violations) {
    if (!bySelector.has(v.selector)) bySelector.set(v.selector, { routes: [], reasons: v.reasons });
    bySelector.get(v.selector).routes.push(v.route);
  }

  console.error(`\nrender: ${bySelector.size} block(s) with content off the centre line, on ${violations.length} route instance(s)\n`);
  for (const [selector, info] of [...bySelector].sort((a, b) => b[1].routes.length - a[1].routes.length)) {
    console.error(`  ${selector}   (${info.routes.length} route(s), e.g. ${info.routes.slice(0, 3).join(' ')})`);
    for (const r of info.reasons) console.error(`      ${r}`);
  }
  console.error('\n  DESIGN-DECISIONS.md: card content centres, because it is scanned rather than');
  console.error('  read. Long-form prose stays left via surface--read, which requires a written');
  console.error('  reason. Fix the block, or add a named exception that gives one.\n');
}


if (bespokeButtons.size) {
  console.error(`
render: ${bespokeButtons.size} control(s) styled as a button without being one
`);
  for (const [key, rts] of [...bespokeButtons].sort((a, b) => b[1].size - a[1].size)) {
    console.error(`  ${key}`);
    console.error(`      ${rts.size} route(s), e.g. ${[...rts].slice(0, 3).join(" ")}`);
  }
  console.error('\n  Button.astro is the only button. Three separate systems were found and');
  console.error('  retired on 2026-08-03, the glossary\'s, the nav\'s and the forms\', and none');
  console.error('  was caught by review. Use the component, or name the control in');
  console.error('  ALLOW_BESPOKE with the argument for why it is a label rather than an action.\n');
}

if (violations.length || tinyTargets.size || unequalRows.size || bespokeButtons.size) process.exit(1);

console.log('\n  every card centres its content, every target clears 24px, and every row of');
console.log('  buttons is one width, and every button is the component');
