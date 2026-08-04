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
 * WIRED INTO `npm run build` ON 2026-08-03, IMMEDIATELY AFTER check-csp.js.
 * It was written on 2026-08-03 and deliberately left OUT of the build that day,
 * because it was reporting 18 blocks across 42 route instances and a gate that
 * fails on arrival blocks every build until somebody has time for it. All 18
 * are now fixed — not waived: eleven were drawn artefacts and are now <figure>,
 * four were the /compare cards and are now on the shared recipe via a rehype
 * step in astro.config.mjs, and three were row-cards and now carry
 * `surface--row`. Placed after the cheap gates because it needs the finished
 * dist and because a gate that launches a browser should not stand between a
 * developer and the checks that would have caught the same commit in a second.
 *
 * TWO CORRECTIONS TO THIS PARAGRAPH, 2026-08-04, and they are recorded rather
 * than overwritten because a header that describes protection which is not
 * there is read instead of the code:
 *
 *   it said `pnpm build`     The chain is `npm run build`; there is no pnpm
 *                            script in astro/package.json. A reader who tried
 *                            the stated command would not run this gate at all.
 *   it said "THE LAST STEP"  It is step 16 of the 28 in the chain on
 *                            2026-08-04. ELEVEN GATES RUN AFTER IT, and they are
 *                            named rather than counted because a name survives
 *                            somebody adding a step and a number does not:
 *                            glossary-filter, timeline, heading-ink, treatments,
 *                            controls, disclosure, shared-blocks, breadcrumbs,
 *                            sheen, status-pulse and budgets. TEN of those eleven
 *                            also launch a browser — every one but budgets — so
 *                            "the expensive one goes last" was not the
 *                            arrangement it claimed to describe. The first draft
 *                            of this correction said three, which is the same
 *                            defect one layer in: a number written from an
 *                            impression of the chain rather than from it — and
 *                            the second draft said eight, having named the list
 *                            from the same impression rather than from
 *                            package.json: controls and disclosure were already
 *                            running here and already missing from it.
 *
 * AND A THIRD, WHICH IS THE ONE THAT MATTERED. It said "The ALLOW list below is
 * still empty, which is the state to keep it in". ALLOW has held one entry — the
 * /blog featured card, waived for child-offset only — since the same day. The
 * list that is empty is ALLOW_LEFT, twenty lines further down, and the sentence
 * had been reworded from it without the name being changed. A claim of an empty
 * allow-list is the single strongest thing a gate header can say about itself,
 * so saying it about the wrong list is the cheapest possible way to be believed
 * for nothing. Each list now states its own count where it is defined.
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
 *
 * ── TWO WAYS TO GET A FALSE READING OUT OF THIS BUILD, 2026-08-04 ───────────
 *
 * Both cost real time on this pass and neither is a defect in any gate, so they
 * are recorded here rather than worked around silently.
 *
 * ONE BUILD AT A TIME, PER WORKING TREE. `astro build` empties dist/ before it
 * writes, and every gate from step 9 onwards reads dist/. So a second
 * `npm run build` started in the same tree will empty dist/ underneath the first
 * one, and whichever gate is running at that instant reports ZERO ROUTES — a
 * clean-looking number that means nothing was measured. It happened three times
 * in a row here: check-treatments printed "0 route(s) measured at 1440" and
 * check-controls printed "no built route renders a .control at all", while both
 * passed on 43 routes the moment they were re-run against the same dist. The
 * gates were right to fail — an unmeasured route is not a clean route — but the
 * cause was a neighbouring process, not the site. If a late gate reports zero of
 * something, check for a second build before believing it.
 *
 * DO NOT BULK-MEASURE THROUGH THE PREVIEW SERVER ON :8095. It drops contiguous
 * blocks of requests under load: a sweep took 404s on nine consecutive routes
 * that curl served a moment later, and another reported "no h1" on eleven
 * consecutive routes that had one. Every gate in this chain therefore serves
 * dist/ on its own ephemeral port — the tiny http.createServer below, `listen(0)`
 * — and anything measuring the built site by hand should do the same. Nine
 * consecutive failures in route order is the signature of the server, not of the
 * site.
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
 *
 * ONE ENTRY, and the count is stated here rather than in the header because
 * that is the only place it cannot drift away from the array it describes. It
 * did: the header claimed this list was empty for a day while the entry below
 * sat in it. Every entry is printed on every run, so the number is also
 * checkable against the output rather than only against this line.
 */
const ALLOW = [
  {
    route: '/blog/',
    selector: '.feat.surface.surface--pad',
    reason:
      'The featured post card is TWO COLUMNS — a text column and a 512px picture ' +
      'column — so its two children sit 256px either side of the card centre by ' +
      'construction, which is what a column is. Its TEXT is centred and is still ' +
      'measured: only the child-offset half of the rule is waived. The rule cannot ' +
      'tell this apart from the defect it was written for (a chip whose 18px logo ' +
      'column pushed its label off the axis) because both are multi-column grids, ' +
      'and the difference is whether the columns are the composition or an accident ' +
      'of it. That is intent, so it is named here rather than guessed at. It carried ' +
      'surface--read until 2026-08-03 and was skipped wholesale; this is the same ' +
      'block, now measured for everything except the thing it is allowed to do.',
    /* 'children' waives ONLY the child-offset half of the rule. Without this the
       entry would silently stop measuring the card's text alignment too, which
       is how an exception quietly becomes a hole. */
    waive: 'children',
  },
];

/* ── SITEWIDE ALIGNMENT: WHAT IS ALLOWED TO SIT LEFT ────────────────────────
 *
 * `{ selector, reason }`, matched against the ALIGNMENT AUTHORITY — the highest
 * element in a run of left-computing elements, which is the element that
 * actually declares the alignment and therefore the only place a fix belongs.
 *
 * THIS LIST IS EMPTY AND SHOULD STAY EMPTY. Everything legitimately left on
 * this site is left because of WHAT IT IS — a table, a form, a definition list,
 * code, a drawing, a list item, a long-form body — and every one of those is
 * excluded structurally in the measurement below, mirroring styles/alignment.css
 * rule for rule. An entry here means something is left for a reason its own
 * markup cannot express, which is nearly always a sign the markup is wrong
 * rather than that the rule is.
 *
 * IT IS NOT WHERE CHROME GOES EITHER, and that is the point of the 2026-08-04
 * re-scope. The site header, the mega-menu, the footer and the command palette
 * are left-aligned and correct, and NONE of them belongs here, because they are
 * outside the content landmark the rule is stated on. Putting a header selector
 * in this list would be the same mistake in a different file: an allow-list that
 * is always one component short.
 *
 * A reason that only says "intentional" is not a reason. */
const ALLOW_LEFT = [];

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
  {
    selector: '.tabsw',
    reason:
      'The /pricing product switcher, restored 2026-08-03 after the owner asked why a ' +
      'switcher existed when both panels were always visible. These are TABS in a ' +
      'tablist, not a row of calls to action: they select which panel is shown rather ' +
      'than offering two things to do, and a tab labelled "For buyers" padded out to ' +
      'match "For suppliers" reads as a button pair and hides which one is currently ' +
      'selected. Same argument as .gx-filters above, and the reference build at :8092 ' +
      'sizes its tabs to their labels for the same reason. The SELECTED state, not the ' +
      'width, is what distinguishes them, and that is carried by aria-selected.',
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
      'Styling it as a button would put eight equal calls to action above a headline. ' +
      'The entry was briefly deleted on 2026-08-04, when the shared .chip recipe made ' +
      'these 27.8px tall and this rule stopped seeing them as button-shaped at all. ' +
      'That was the wrong fix in both directions: an exception should not disappear ' +
      'because a control got smaller, and the control should not have got smaller. ' +
      'labels.css now holds any chip that is a link or a button to a 36px target, so ' +
      'they are the size they were and this entry says what it always said.',
  },
  {
    selector: '.gx-chip',
    reason:
      'Glossary filter chips, exempted from the width rule above for the same reason: ' +
      'they are labels whose width is their content, and a filter is a state you are in ' +
      'rather than an action you take.',
  },
  {
    selector: '.tabsw__tab',
    reason:
      'The /pricing product switcher tabs. Same distinction as .gx-chip directly above ' +
      'and it is the one this list exists to make: a tab SELECTS which panel you are ' +
      'looking at, it does not perform an action the page offers. Rendering it with ' +
      'Button.astro would put two solid calls to action above the prices and compete ' +
      'with the actual CTA in every plan card. Its selected state is carried by ' +
      'aria-selected, which is announced, rather than by looking like a pressed button.',
  },
];

/* ── ROUTES ALLOWED THEIR OWN PAGE HEADING ──────────────────────────────────
 *
 * Keyed by ROUTE, not by selector, and that is deliberate: every other
 * allow-list here names a component that is allowed to behave differently
 * wherever it appears, whereas this one names the single PAGE that is allowed
 * not to use the shared heading. A selector key would let any page opt out by
 * adopting the class, which is the hole the rule exists to close.
 *
 * The owner drew this boundary themselves — "all my pages except from home page
 * hero" — so the exception is theirs, not a concession I made to avoid work. */
const ALLOW_HEAD = [
  {
    route: '/',
    reason:
      'The homepage hero. It is the one heading on the site that is a composition ' +
      'rather than a page title: it carries the positioning line at display size, is ' +
      'sized against the viewport rather than a measure, and sits inside the hero ' +
      'stack with the ambient wash and the reasoning trace built around it. Giving it ' +
      'the shared page-title treatment would flatten the one screen that is allowed ' +
      'to be a statement. Named here so that it is the only one.',
  },
];

/* How far a child's centre may sit from its block's centre before it counts as
 * left-aligned. Sub-pixel layout and border rounding produce ~1px routinely;
 * a genuine left-alignment in a 342px chip was 145px out. */
const TOLERANCE_PX = 4;

/* ── AN EXCEPTION NAMES A COMPONENT, NOT A CLASS LIST ───────────────────────
 *
 * The entries below used to be compared against the printed signature with `===`,
 * which meant an exception stopped matching the moment the element gained ANY
 * other class. That happened on 2026-08-04: the glossary filter chips were moved
 * on to the shared `.chip` recipe, their signature became `.chip.gx-chip`, and
 * four allowances that were still entirely correct went stale and failed the
 * build — for a change that was the fix, not a regression.
 *
 * An allow-list that punishes consolidation is an allow-list that argues for
 * forks. So the test is whether the element CARRIES the named class. */
const carries = (signature, allowed) => {
  const have = signature.split('.').filter(Boolean);
  return allowed
    .split('.')
    .filter(Boolean)
    .every((c) => have.includes(c));
};


/* The citation map, read from the page that owns it.
 *
 * Parsed out of source rather than imported, because `sources.astro` is a
 * component and this is a plain script. That is a real coupling to the file's
 * formatting and it is the reason the rule reports the map it found: if this
 * ever reads zero rows the failure is loud rather than a silent pass. */
const SOURCES_PAGE = path.join(__dirname, '..', 'src', 'pages', 'sources.astro');
const MAPPED_FIGURES = (() => {
  if (!fs.existsSync(SOURCES_PAGE)) return null;
  const src = fs.readFileSync(SOURCES_PAGE, 'utf8');
  const block = src.slice(src.indexOf('const HOMEPAGE_MAP'), src.indexOf('const MARKETS'));
  return new Set([...block.matchAll(/figure:\s*'([^']+)'/g)].map((m) => m[1]));
})();

/* ── ONE SCREEN-READER-ONLY RECIPE, READ FROM THE SOURCE ────────────────────
 *
 * THE DEFECT THIS ANSWERS, AND WHY NO EXISTING GATE COULD HAVE. Two classes did
 * one job: `.visually-hidden` on 44 routes, declared THIRTEEN times in thirteen
 * separate scoped <style> blocks, and `.sr-only` on 7, declared once in
 * tokens.css. All fourteen declarations were byte-identical — the same nine
 * properties in the same order.
 *
 * That is the exact forking the label, treatment and design-system gates exist
 * to prevent, and it sat in the one place none of them looks: every one of them
 * polices what a page PRESENTS — its type, its surfaces, its controls — and this
 * is the class whose entire purpose is not to be presented. A rule about the
 * rendered box cannot see an element that has no box.
 *
 * SO THE RULE IS READ FROM THE SOURCE, and it is deliberately arithmetic rather
 * than clever: how many places define the recipe, and does the retired name
 * appear anywhere. One definition, one name. A fifteenth copy fails the build on
 * the commit that writes it, which is the only moment anybody would recognise it
 * for what it is.
 *
 * IT IS PAIRED WITH A MEASUREMENT, and neither half is sufficient. This half
 * cannot tell whether the one definition actually WINS — styles/labels.css
 * records a day when an unlayered `margin: 0` beat the recipe's `margin: -1px`
 * and un-clipped four captions into full view, with the definition still sitting
 * exactly where it does now. The rendered half below asks that question. */
const SRC_DIR = path.join(__dirname, '..', 'src');
const CLIP_RECIPE = /\.(visually-hidden|sr-only)\s*\{[^}]*clip-path:\s*inset\(50%\)/g;
const RETIRED_NAME = /\bclass(?:Name)?\s*=\s*["'][^"']*\bsr-only\b/g;

function srcFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) srcFiles(p, out);
    else if (/\.(astro|css|md)$/.test(e.name)) out.push(p);
  }
  return out;
}

const clipDefs = [];
const retiredUses = [];
for (const f of srcFiles(SRC_DIR)) {
  const rel = path.relative(SRC_DIR, f).split(path.sep).join('/');
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(CLIP_RECIPE)) {
    clipDefs.push(`src/${rel}  .${m[1]}  line ${text.slice(0, m.index).split('\n').length}`);
  }
  for (const m of text.matchAll(RETIRED_NAME)) {
    retiredUses.push(`src/${rel}  line ${text.slice(0, m.index).split('\n').length}`);
  }
}

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

  /* ── INSIDE THE CONTENT REGION, AND THAT IS THE SCOPE OF EVERY ALIGNMENT
   *    RULE IN THIS FILE ───────────────────────────────────────────────────
   *
   * 'main *', not 'body *'. Centring is a rule about what a page PRESENTS, so
   * it is measured where a page presents things. The site header, the Products
   * mega-menu, the mobile menu, the footer, the command palette and the skip
   * link are furniture a reader navigates; they are not centred and they are not
   * exempted from being centred — they are outside the rule, exactly as
   * styles/alignment.css now scopes it.
   *
   * STRUCTURAL, LIKE EVERY OTHER EXCLUSION HERE. Chrome is not an allow-list of
   * selectors that would need an entry for the next component somebody writes;
   * it is everything outside the <main> landmark, which is a fact about the
   * document rather than a list to maintain. The landmark is verified below: a
   * route not carrying EXACTLY ONE <main> fails the build: a missing landmark
   * would mean the whole page went unmeasured and the gate would report a silent
   * pass, and a second one would mean "inside <main>" named two regions. */
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (!isCard(el, cs)) continue;

    /* Opted out on purpose, with a reason recorded in the design system.
     *
     *   surface--row    a card that IS a row: its content is columns that line
     *                   up with the columns of the cards above and below it.
     *
     * It is defined in styles/surfaces.css with the argument written out, and it
     * is an opt-out rather than a default: reaching for it is a decision
     * somebody can read and disagree with, which is the whole difference between
     * an exception and a text-align declaration nobody can account for.
     *
     * THE surface--read BRANCH THAT SAT HERE IS DELETED, 2026-08-04. It read
     * "if (el.classList.contains('surface--read')) continue;" and this comment
     * described the class as one of two live opt-outs — "a card whose single
     * paragraph runs three or four lines, where centring costs real
     * readability". The owner reversed the decision behind that class on
     * 2026-08-03; surfaces.css records the reversal at length, no rule defines
     * it any more, and no element in dist/ carries it. So the branch could not
     * fire and the comment was describing an escape hatch that no longer
     * existed. Deleted rather than left with a note beside it, because dead code
     * in a gate reads as a live hole to anyone deciding whether the gate can be
     * trusted, and the argument for the class is already written down once, in
     * the stylesheet that used to define it.
     *
     * NO BACKTICKS ANYWHERE IN THIS BLOCK. Everything from MEASURE down to the
     * closing brace is a template literal evaluated in the page, so a backtick in
     * a comment ends the string and the file stops parsing. */
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

  /* ── A CAPPED COLUMN IS CENTRED ────────────────────────────────────────
   *
   * Added 2026-08-03 after the owner reported "a lot of pages still have left
   * aligned content" and had to find them by hand.
   *
   * THE MEASUREMENT IS WHY THIS RULE EXISTS AT ALL. 39 of 43 h1 elements were
   * dead centre; the heading was never the problem. What made a page LOOK
   * left-aligned was a body column carrying a 'max-width' with no
   * 'margin-inline: auto', so a 686px article sat in a 1160px container pinned
   * to the left gutter with 426px of dead space on the right. Nineteen routes
   * had it. The worst were the four legal pages, where '.legal__title' was a
   * hand-copy of 'h1.section__title' that took the 16ch cap and dropped the
   * auto margin — title 61px left, body 156px right, 217px apart on one screen.
   *
   * NO DECLARATION CAN SEE THIS, which is why it is here and not in
   * check-design-system.js. 'max-width: 68ch' is correct CSS and
   * 'margin-inline: auto' is simply absent; there is nothing to grep for. The
   * defect exists only as geometry, and only a browser has geometry. Same shape
   * as the chip-alignment defect this file was written for.
   *
   * IT MEASURES THE BLOCK, NOT THE TEXT. The 2026-08-02 decision is "centred
   * head blocks, never the slotted body", and that is about TEXT alignment — a
   * paragraph of prose keeps a straight left edge. Capping a measure and
   * positioning a block are different jobs. This asserts the second and says
   * nothing about the first.
   *
   * 20px OF TOLERANCE, because a grid column, a scrollbar and sub-pixel
   * rounding all move a centre by a few pixels and none of them is this defect.
   * The real ones measured 60 to 194px. */
  const offCentre = [];
  for (const el of document.querySelectorAll(
    '.section__body > *, .section > div, main > section > div',
  )) {
    const cs = getComputedStyle(el);
    if (cs.maxWidth === 'none') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 40) continue;
    /* A child of a multi-column grid is SUPPOSED to sit off the parent's axis —
       that is what a column is. Only a block that is the sole thing in its
       track can be judged against the container's centre. */
    const par = el.parentElement;
    const pcs = getComputedStyle(par);
    if (pcs.display === 'grid' && !/^(none|1fr|minmax\(0px, 1fr\))$/.test(pcs.gridTemplateColumns)) continue;
    if (pcs.display === 'flex' && pcs.flexDirection.startsWith('row')) continue;
    const pr = par.getBoundingClientRect();
    const off = r.left + r.width / 2 - (pr.left + pr.width / 2);
    if (Math.abs(off) > 20) {
      offCentre.push({ selector: sig(el), off: off.toFixed(0) + 'px', width: r.width.toFixed(0) });
    }
  }

  /* ── HOMEPAGE FIGURES, FOR THE CITATION MAP ────────────────────────────
   *
   * ADR 0009 makes /sources the single citation home and requires every
   * homepage figure to appear in HOMEPAGE_MAP, with an anchor or marked
   * illustrative. Nothing enforced it, so a new figure could ship uncited and
   * every gate would pass — on a site whose whole position is refusing to state
   * a figure it cannot ground.
   *
   * TWO SELECTORS, NOT A REGEX OVER PROSE. A first pass matched currency and
   * percentages in section textContent and produced "00210%", having glued the
   * 002 of "PPN 002" to the 10% beside it. Figures that are PRESENTED as figures
   * have their own elements: MarketShape renders each in .spine__value, and
   * ReasoningTrace puts its total in [data-rt-sum]. Reading those asks "what
   * does this page present as a figure" instead of "what looks like a number",
   * which is the distinction every other rule in this file turns on.
   *
   * The limit is stated rather than hidden: a figure written inline in a
   * sentence is not covered. ReasoningTrace's 27,000 is one, and it is mapped.
   * What IS covered is the place new homepage figures are actually added. */
  const figures = [...document.querySelectorAll('.spine__value, [data-rt-sum]')]
    .map((el) => el.textContent.trim())
    .filter(Boolean);

  /* ── ONE PAGE-HEADING TREATMENT, AND ONLY ONE ───────────────────────────
   *
   * Owner, 2026-08-03: "i want all my pages except from home page hero must
   * have similar white shiny style page heading ... why so many different
   * style? my advice is to keep same all the pages except from home page hero".
   *
   * Measured that day, before the fix: FIVE implementations across 43 routes,
   * and 26 routes rendered a flat white h1 with no gradient at all —
   * .section__title (16, correct), an unclassed h1 (15), .cmp-h1 (5),
   * .legal__title (4), .gl-h1 (2), .hero__title (1, the real exception). The
   * cause was that the treatment lived in Section.astro's SCOPED styles, so the
   * routes not built from Section could not reach it and had each grown their
   * own header instead.
   *
   * THE RULE IS STRUCTURAL, NOT VISUAL, AND THAT IS THE POINT. Asserting "the
   * h1 has a gradient" would pass a page that reimplemented the gradient by
   * hand, which is the defect, not the fix. Asserting the h1 IS
   * h1.section__title INSIDE .section__head — markup only Section.astro and
   * PageHeader.astro emit — means the only way to satisfy it is to use the
   * shared component, so the treatment cannot be forked in the first place.
   *
   * It fails today in both directions without a fixture, which is the standard
   * every gate here is held to: it passed on the 16 Section routes and failed
   * on the other 27 at the moment it was written.
   *
   * A page with no h1, or with more than one, is its own defect and is reported
   * through this rule rather than silently passing it — hence count beside
   * the list, as an OBJECT: extra properties hung on an array do not survive
   * page.evaluate's serialisation, so an array with a .count would arrive with
   * the count missing and the check would quietly stop testing for it. */
  const h1s = [...document.querySelectorAll('h1')];
  const head = {
    count: h1s.length,
    items: h1s.map((h) => ({
      sig: sig(h),
      titled: h.classList.contains('section__title'),
      inHead: !!h.closest('.section__head'),
      text: (h.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 48),
    })),
  };

  /* THE LANDMARK ITSELF, COUNTED AND REPORTED. Every alignment rule in this
     file measures inside <main>, so a route without one is not a clean route,
     it is an unmeasured one. Returning the count means the difference is
     visible in the run rather than inferred from an empty result — and it is
     the count, not a boolean, precisely so the rule below can ask for ONE. */
  const mains = document.querySelectorAll('main').length;

  /* ── THE CLIP ACTUALLY HOLDS ───────────────────────────────────────────
   *
   * The source half of this rule, at the top of the file, asserts that ONE
   * place defines the screen-reader-only recipe. It cannot assert that the
   * definition WINS, and winning is the whole of what the class does.
   *
   * styles/labels.css records the failure: an unlayered 'margin: 0' in that
   * file beat the recipe's 'margin: -1px' on four visually-hidden captions and
   * un-clipped them into full view, while the definition sat exactly where it
   * sits now. The recipe is in the utilities layer, which outranks every
   * layered rule on the site and is beaten by any unlayered one, and the site
   * has unlayered rules on purpose. Specificity here is not something to reason
   * about in a comment; it is something to measure on the page.
   *
   * BOTH DIRECTIONS OF FAILING, because the class has two ways to be wrong and
   * only one of them is visible:
   *   too big     the clip lost. A caption, a heading or a label nobody wrote
   *               is now on the page, which is what the owner would see.
   *   too gone    somebody 'fixed' it with display: none or visibility: hidden,
   *               which removes it from the accessibility tree as well as the
   *               page and silently deletes the only reason it exists. That one
   *               is invisible in a screenshot and it is the worse of the two.
   *
   * 2px OF TOLERANCE on a 1px box, for sub-pixel rounding. The un-clipped
   * captions measured in the hundreds. */
  const unclipped = [];
  const clipped = document.querySelectorAll('.visually-hidden');
  for (const el of clipped) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const why = [];
    if (r.width > 2 || r.height > 2) {
      why.push('renders ' + r.width.toFixed(0) + 'x' + r.height.toFixed(0) + 'px, so it is on the page');
    }
    if (cs.display === 'none') why.push('display: none, so it is out of the accessibility tree too');
    if (cs.visibility === 'hidden') why.push('visibility: hidden, so it is out of the accessibility tree too');
    if (why.length) unclipped.push({ selector: sig(el), why, text: (el.textContent || '').trim().slice(0, 40) });
  }

  return { blocks: out, tiny, rows, bespoke, figures, offCentre, head, mains,
    unclipped, clippedCount: clipped.length, left: window.__measureLeft() };
})()`;

/* ── EVERY WORD ON THE PAGE, NOT ONLY THE ONES IN A CARD ────────────────────
 *
 * WHY A SECOND ALIGNMENT RULE, WHEN THE FIRST ONE IS AT THE TOP OF THIS FILE.
 *
 * The rule above asks "does this CARD centre its content". That was the right
 * question three times and it was never the whole question, and on 2026-08-03
 * the owner said so:
 *
 *   "lot of text are left aligned in /glossary/, you must fix this site wide
 *    issue ... identify and fix in each and every pages, all the text in cards
 *    or non cards must be in central, i am not sure why cant we handle this
 *    using central enforcer and automated way"
 *
 * "in cards OR NON CARDS" is the correction. A page paragraph, a note under a
 * section, a disclosure answer, a footer column, a chip row — none of those is
 * a card, so the rule above could pass on a page that was visibly wrong, and
 * did, on every one of the routes the owner kept finding.
 *
 * MEASURED BEFORE THE RULE EXISTED, over all 43 routes:
 *   1440   453 distinct element recipes rendering left, 4,804 instances
 *    390   461 distinct element recipes rendering left, 4,565 instances
 *
 * IT REPORTS THE AUTHORITY, NOT THE LEAF. `text-align` is inherited, so 946
 * left-aligned footer links are not 946 defects: they are ONE declaration, seen
 * 946 times. This walks up from each left-computing element until it finds the
 * highest ancestor still computing left — the element that actually declares
 * it — and reports that. The number a developer then has to fix is the number
 * of real causes, and the selector printed is the place the fix goes.
 *
 * THE EXCLUSIONS MIRROR styles/alignment.css EXACTLY, and they are applied to
 * the AUTHORITY rather than to the leaf, which is what makes them safe. If a
 * `.surface` sat between a list and a heading, the heading would compute
 * `center` and never reach this test at all; so an element that computes left
 * inside a <li> genuinely got it from that <li>. There is no way for a card
 * nested in an excluded structure to hide behind the exclusion.
 *
 * SO DOES THE SCOPE, AND THAT IS THE 2026-08-04 CORRECTION. This walked
 * `body *` for one day, so it measured the header, the mega-menu, the footer's
 * four link columns, the command palette and the skip link — chrome a reader
 * navigates rather than reads — and required all of it to centre. The owner
 * reported the result. alignment.css now states the rule on <main>, and this
 * walks <main>, so the two still ask one question.
 *
 * CHROME IS EXCLUDED BY WHAT IT IS, NOT BY BEING LISTED. There is no
 * `header, footer, .cmdk` anywhere in this file, and there must not be: a list
 * like that is one entry short of the next component somebody writes, which is
 * the failure mode this whole file exists to answer. What excludes chrome is
 * that it sits outside the content landmark, the same way what excludes a table
 * is that it is a table. And it is not silently skipped: the scope is printed on
 * every run and a route not carrying exactly one <main> fails the build.
 *
 * If you add an exception to alignment.css, add it here with the same argument.
 * Two files, one rule; the gate is worth nothing if it is asking a slightly
 * different question from the stylesheet.
 *
 * NO BACKTICKS IN THIS BLOCK — same constraint as MEASURE above. */
const MEASURE_LEFT = `window.__measureLeft = () => {
  const out = [];
  const sig = (el) => {
    const cls = [...el.classList].filter((c) => !/^astro-/.test(c));
    return el.tagName.toLowerCase() + (cls.length ? '.' + cls.join('.') : '');
  };
  const isLeft = (v) => v === 'left' || v === 'start';

  /* Mirrors alignment.css group 1 (meaning is the left edge) and group 2 (read
     rather than scanned), plus surfaces.css's own surface--row opt-out. */
  const STRUCTURE = 'table, form, fieldset, dl, pre, code, samp, kbd, figure';
  const BODIES = '.prose, .legal__body, .article-body, .gl-article, .cmp-body';

  const excused = (el) => {
    if (el.matches(STRUCTURE)) return 'structure';
    if (el.matches(BODIES)) return 'long-form body';
    if (el.matches('.surface--row')) return 'surface--row';
    /* alignment.css rule 3: a list item keeps the edge its marker hangs on.
     *
     * There used to be a branch above this one for a navigation list, mirroring
     * an alignment.css rule of the same name. Both are gone: the breadcrumb and
     * the contents rail are made of <li>, so this branch already excused them,
     * and the measurement behind the deletion is written out beside rule 3 in
     * styles/alignment.css. */
    if (el.tagName === 'LI' && el.parentElement && /^(UL|OL)$/.test(el.parentElement.tagName))
      return 'list item';
    return null;
  };

  const seen = new Set();

  /* 'main *' — see the scope note above the constant. Chrome is outside the
     rule rather than exempted from it, which is why no selector for it appears
     anywhere in this file. */
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (!isLeft(cs.textAlign)) continue;
    /* Only elements that RENDER WORDS. A wrapper inheriting left but holding no
       text of its own is not something anybody can see. */
    if (![...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim())) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;

    /* THE AUTHORITY: climb while the parent is also left. */
    let auth = el;
    while (
      auth.parentElement &&
      auth.parentElement.tagName !== 'BODY' &&
      isLeft(getComputedStyle(auth.parentElement).textAlign)
    ) auth = auth.parentElement;

    if (excused(auth)) continue;
    /* An excused structure NESTED inside another one — a <li> inside a <table>
       cell, say — resolves to the outer element, which is already covered. This
       walk catches the reverse: an authority that is itself inside an excused
       structure through a chain this loop did not climb. */
    if (auth.closest(STRUCTURE) || auth.closest(BODIES) || auth.closest('.surface--row')) continue;

    const key = sig(auth);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      selector: key,
      align: getComputedStyle(auth).textAlign,
      text: (auth.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 52),
    });
  }

  /* ── AND THE HALF THAT text-align CANNOT SEE ────────────────────────────
   *
   * A block can compute 'center' and still put every word on its left edge, if
   * its children are boxes narrower than it. text-align positions inline
   * content INSIDE a box; where the box itself sits is a flex or grid question.
   * The footer link columns were exactly this: four flex columns of
   * width: fit-content anchors, centring their text inside boxes that were all
   * pinned left, under a heading the sitewide rule had just centred.
   *
   * THAT EXAMPLE IS NOW HISTORY RATHER THAN A CASE THIS RULE COVERS, and it is
   * worth saying why the rule stays. The footer is chrome, so on 2026-08-04 it
   * left the scope of the alignment rules entirely and its four columns are
   * neither centred nor measured here. What the geometry blind spot was — a
   * block that claims to centre and does not — is unchanged inside the content
   * region, and that is where this now looks.
   *
   * THIS IS THE SAME BLIND SPOT THAT MADE THE FIRST THREE FIXES INCOMPLETE, one
   * level up. The card rule at the top of this file learned it for cards after
   * the "Plugged in, read only" chips; this is the sitewide version.
   *
   * THREE CONDITIONS, ALL OF THEM NECESSARY, so a normal layout cannot trip it:
   *   - the block claims to centre, so this is a contradiction rather than a
   *     preference. A block that is honestly left-aligned is the other rule.
   *   - EVERY text-bearing child sits left of the centre line. One child left
   *     and one right is a two-column composition, which is not this.
   *   - they share one left edge to within 2px. Ragged left edges are a stack
   *     of differently-indented things, not a column pinned to a gutter.
   * Measured over all 43 routes when the rule was written: four blocks matched,
   * and all four were one component.
   *
   * The same structural exclusions as above, for the same reasons. */
  /* Those exclusions, plus <nav>. That one is this rule's own
     rather than a mirror of a stylesheet exception: a navigation index inside
     the content — the blog breadcrumb, the legal contents rail, the /crowmark
     on-this-page bar — IS a column of links sharing one left edge by design, so
     the shape this rule looks for is that component working correctly. */
  const STRUCT_ALL = STRUCTURE + ', nav, ' + BODIES;
  for (const el of document.querySelectorAll('main *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (cs.textAlign !== 'center') continue;
    if (el.closest(STRUCT_ALL) || el.closest('.surface--row')) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 24) continue;

    const kids = [...el.children].filter((k) => {
      const ks = getComputedStyle(k);
      if (ks.display === 'none' || ks.position === 'absolute' || ks.position === 'fixed') return false;
      const kr = k.getBoundingClientRect();
      return kr.width > 4 && kr.height > 4 && kr.width < r.width - 8 && (k.textContent || '').trim();
    });
    if (kids.length < 2) continue;

    const centre = r.left + r.width / 2;
    const boxes = kids.map((k) => k.getBoundingClientRect());
    if (!boxes.every((b) => b.left + b.width / 2 - centre < -8)) continue;
    const lefts = boxes.map((b) => b.left);
    if (Math.max(...lefts) - Math.min(...lefts) > 2) continue;

    const key = sig(el);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      selector: key,
      align: 'center, but ' + kids.length + ' children pinned to one left edge, worst ' +
        Math.min(...boxes.map((b) => b.left + b.width / 2 - centre)).toFixed(0) + 'px off',
      text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 52),
    });
  }
  return out;
};`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
/* Installed once, re-run on every navigation, so the alignment walk is available
   both to MEASURE at 1440 and to the phone pass below. */
await page.addInitScript(MEASURE_LEFT);

const all = routes();
const violations = [];
const tinyTargets = new Map();
const unequalRows = new Map();
const bespokeButtons = new Map();
const unmappedFigures = new Set();
const offCentreCols = new Map();
/* signature -> { routes:Set, text, why }. Grouped by the h1's class signature so
   that one layout serving nine blog posts reports as one header to fix, not
   nine — the same grouping every other rule in this file uses. */
const badHeads = new Map();
const usedHead = new Set();
/* key -> { reason, viewports:Set, routes:Set }. Grouped by the authority's class
   signature, because one component repeated across 43 routes is one defect. */
const leftBlocks = new Map();
const used = new Set();
const usedLeft = new Set();
const usedUnequal = new Set();
const usedBespoke = new Set();
/* Routes whose <main> count is not exactly one, as `{ route, count }`.
 *
 * IT COUNTED PRESENCE FOR A DAY, AND THAT IS THE LESSON THIS ENTRY EXISTS TO
 * RECORD. The rule was written so that a MISSING landmark could not go
 * unmeasured — every alignment rule here is scoped to <main>, and an unmeasured
 * route reports clean, which is the one failure mode a gate must never have. It
 * asked `if (!measured.mains)`, which is true of zero and false of two.
 *
 * So thirteen routes shipped a SECOND <main> nested inside the one Base.astro
 * owns — the compare, glossary and sector layouts and their three index pages —
 * and sailed through the gate written about <main>. axe reported all three of
 * landmark-no-duplicate-main, landmark-main-is-top-level and landmark-unique, at
 * both viewports, on 30% of the site, while this file printed a clean run.
 *
 * A gate that asks "is there one" and means "is there at least one" is a gate
 * with a hole exactly the size of the thing it was written to protect. Both ends
 * are now asserted, because "the content landmark" is a definite article: two
 * mains do not make the page twice as measured, they make "the" main undefined,
 * and every rule in this file that says "inside <main>" stops having one answer.
 *
 * A-66, fixed 2026-08-04. The six templates now wrap in a <div>; see the note at
 * each of them for why the element stays rather than being deleted outright. */
const badLandmark = [];
/* key -> Set(routes). Elements carrying .visually-hidden that are not in fact
   hidden the way the class promises. Grouped by signature like every other rule
   here: one component repeated across 43 routes is one defect. */
const unclippedLabels = new Map();
/* How many elements the clip rule actually LOOKED at, summed over every route.
   A querySelectorAll that matches nothing produces an empty violation list,
   which is indistinguishable from a clean run — the same silent pass the
   landmark rule is scoped against, one rule along. Zero fails the build. */
let clippedSeen = 0;

for (const route of all) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  const measured = await page.evaluate(MEASURE);
  const found = measured.blocks;
  if (measured.mains !== 1) badLandmark.push({ route, count: measured.mains });

  clippedSeen += measured.clippedCount;
  for (const u of measured.unclipped) {
    const key = `${u.selector}  ${u.why.join('; ')}${u.text ? `  "${u.text}"` : ''}`;
    if (!unclippedLabels.has(key)) unclippedLabels.set(key, new Set());
    unclippedLabels.get(key).add(route);
  }

  /* ── THE PAGE HEADING ───────────────────────────────────────────────────
   *
   * Checked before anything else about the route, because it is the one rule
   * whose failure is invisible in a screenshot: a flat white h1 looks like a
   * heading, it just is not THE heading, and that is exactly how 26 routes
   * drifted without anyone noticing. */
  const headAllow = ALLOW_HEAD.find((a) => a.route === route);
  if (headAllow) {
    usedHead.add(route);
  } else {
    const note = (sig, why, text) => {
      if (!badHeads.has(sig)) badHeads.set(sig, { routes: new Set(), why, text });
      badHeads.get(sig).routes.add(route);
    };
    if (measured.head.count !== 1) {
      /* Zero or many. Both break the shared treatment and both are document
         -outline defects in their own right, so they are named as what they
         are rather than folded into "wrong class". */
      note(
        `${measured.head.count} <h1> on the page`,
        measured.head.count === 0
          ? 'A route with no h1 has no page title for the treatment to apply to.'
          : 'More than one h1 means more than one page title, so "the" heading is undefined.',
        measured.head.items.map((h) => h.text).join(' | ').slice(0, 60),
      );
    } else {
      const h = measured.head.items[0];
      if (!h.titled || !h.inHead) {
        note(
          h.sig,
          !h.titled && !h.inHead
            ? 'Not h1.section__title and not inside .section__head — a hand-rolled header.'
            : !h.titled
              ? 'Inside .section__head but not h1.section__title, so it misses the treatment.'
              : 'Is h1.section__title but sits outside .section__head, so the head block does not apply.',
          h.text,
        );
      }
    }
  }
  for (const t of measured.tiny) {
    const key = `${t.selector} ${t.size}`;
    if (!tinyTargets.has(key)) tinyTargets.set(key, new Set());
    tinyTargets.get(key).add(route);
  }
  /* Grouped by signature, like the target-size rule: one row component repeated
     across 43 routes is one defect rather than 43. */
  for (const r of measured.rows) {
    const ex = ALLOW_UNEQUAL.find((a) => carries(r.selector, a.selector));
    if (ex) {
      usedUnequal.add(ex.selector);
      continue;
    }
    const key = `${r.selector}  spread ${r.spread}px  [${r.items.join(', ')}]`;
    if (!unequalRows.has(key)) unequalRows.set(key, new Set());
    unequalRows.get(key).add(route);
  }
  /* Grouped by signature like the rules above: one component repeated across
     four legal routes is one defect, not four. */
  for (const c of measured.offCentre) {
    const key = `${c.selector}  ${c.off} off centre  (${c.width}px wide)`;
    if (!offCentreCols.has(key)) offCentreCols.set(key, new Set());
    offCentreCols.get(key).add(route);
  }
  if (route === '/' && MAPPED_FIGURES) {
    for (const f of measured.figures) {
      if (!MAPPED_FIGURES.has(f)) unmappedFigures.add(f);
    }
  }
  for (const bq of measured.bespoke) {
    const ex = ALLOW_BESPOKE.find((a) => carries(bq.selector, a.selector));
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
      /* A whole-block waiver drops the finding. A `waive: 'children'` entry drops
         only the child-offset reasons and puts the block back in front of the
         rule for everything else — see the note on the entry itself. */
      if (ex.waive !== 'children') continue;
      const kept = f.reasons.filter((r) => !/ sits -?\d+px off centre$/.test(r));
      if (!kept.length) continue;
      violations.push({ route, ...f, reasons: kept });
      continue;
    }
    violations.push({ route, ...f });
  }

  /* ── THE SITEWIDE ALIGNMENT PASS, AT BOTH VIEWPORTS ──────────────────────
   *
   * 390 is measured by RESIZING rather than by a second navigation, so a second
   * viewport costs a relayout instead of 43 more page loads on the most
   * expensive gate we have. It matters: 461 recipes rendered left at 390 against
   * 453 at 1440 before this rule existed, and the eight that differ are all
   * things that only stack on a phone. Measuring one width would have missed
   * them. */
  const collectLeft = (rows, vp) => {
    for (const b of rows) {
      const ex = ALLOW_LEFT.find((a) => a.selector === b.selector);
      if (ex) {
        usedLeft.add(ex.selector);
        continue;
      }
      const key = `${b.selector}   computed ${b.align}`;
      if (!leftBlocks.has(key))
        leftBlocks.set(key, { routes: new Set(), viewports: new Set(), text: b.text });
      leftBlocks.get(key).routes.add(route);
      leftBlocks.get(key).viewports.add(vp);
    }
  };
  collectLeft(measured.left, 1440);
  await page.setViewportSize({ width: 390, height: 844 });
  collectLeft(await page.evaluate('window.__measureLeft()'), 390);
  await page.setViewportSize({ width: 1440, height: 1200 });
}

await browser.close();
server.close();

console.log(`render: ${all.length} route(s) measured at 1440, and again at 390 for alignment`);
/* THE SCOPE, PRINTED EVERY RUN. Chrome is not measured, and a reader of this
   output is entitled to know that without reading the source — an exclusion
   nobody can see is indistinguishable from a rule nobody wrote.
   The count is of routes carrying EXACTLY ONE landmark, which is the number of
   routes on which "inside <main>" names a single region. */
console.log(
  `  alignment measured inside <main> on ${all.length - badLandmark.length}/${all.length} route(s);` +
    ' the header, nav, mega-menu, footer, command palette and skip link sit outside',
);
console.log('  the content landmark, so they keep the document default and are not exempted');
console.log(`  ${ALLOW.length} named exception(s):`);
for (const a of ALLOW) {
  const stale = used.has(`${a.route}::${a.selector}`) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.route}  ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}
if (!ALLOW.length) console.log('    none');

console.log(`  ${ALLOW_LEFT.length} block(s) allowed to sit left sitewide:`);
for (const a of ALLOW_LEFT) {
  const stale = usedLeft.has(a.selector) ? '' : '   [STALE — matches nothing]';
  console.log(`    ${a.selector}${stale}`);
  console.log(`        ${a.reason}`);
}
if (!ALLOW_LEFT.length) console.log('    none, which is the state to keep it in');

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

/* ── CAPPED COLUMN CENTRING REPORT ──────────────────────────────────────────
 *
 * The defect the owner had to find by hand: a `max-width` with no
 * `margin-inline: auto`, pinning a body column to the left gutter under a head
 * block that is perfectly centred. Nineteen routes had it. No declaration can
 * see it — the CSS is valid and the fix is simply absent — so it lives here,
 * where there is geometry to measure. */
if (offCentreCols.size) {
  console.error(`
render: ${offCentreCols.size} capped column(s) sitting off the centre line
`);
  for (const [key, rts] of [...offCentreCols].sort((a, b) => b[1].size - a[1].size)) {
    console.error(`  ${key}   (${rts.size} route(s), e.g. ${[...rts].slice(0, 3).join(' ')})`);
  }
  console.error('\n  A max-width without margin-inline: auto is not a measure, it is a left');
  console.error('  alignment. Capping the line length and positioning the block are two');
  console.error('  different jobs; add the auto margin and the text keeps its left edge.');
  console.error('  If the block is genuinely meant to sit left — an answer under its own');
  console.error('  question, a column in a grid — say so in a comment at the rule.\n');
}

/* ── SITEWIDE ALIGNMENT REPORT ──────────────────────────────────────────────
 *
 * The owner's fourth report of this defect, and the first one a build can see.
 * Each line is one DECLARATION, not one element: the selector printed is the
 * alignment authority, so it is where the fix goes. */
if (leftBlocks.size) {
  console.error(`
render: ${leftBlocks.size} block(s) putting text on the left edge sitewide
`);
  for (const [key, info] of [...leftBlocks].sort((a, b) => b[1].routes.size - a[1].routes.size)) {
    console.error(`  ${key}`);
    console.error(
      `      ${info.routes.size} route(s) at ${[...info.viewports].sort((a, b) => a - b).join(' and ')}, e.g. ${[...info.routes].slice(0, 3).join(' ')}`,
    );
    if (info.text) console.error(`      "${info.text}"`);
  }
  console.error('\n  Owner, 2026-08-03: "all the text in cards or non cards must be in central".');
  console.error('  Content centres by default from styles/alignment.css, which states the rule on');
  console.error('  <main>. What is allowed to sit left is decided by WHAT AN ELEMENT IS — a');
  console.error('  table, a form, a definition list, code, a figure, a list item, a long-form');
  console.error('  body — never by which page it is on. If one of these is genuinely one of those');
  console.error('  things, mark it up as one and it is excused automatically. If it is not,');
  console.error('  delete the text-align that put it there. Chrome is not on this list and never');
  console.error('  reaches it: the header and the footer are outside the landmark the rule is');
  console.error('  scoped to, so they are not centred and not measured.\n');
}

/* ── THE CONTENT LANDMARK: EXACTLY ONE ──────────────────────────────────────
 *
 * Fails the build, and it is the rule that keeps the re-scope honest. Every
 * alignment rule above measures inside <main>; a route that does not have one
 * would sail through all of them having been looked at nowhere. That is worse
 * than a violation, because it reads as a pass.
 *
 * It is also an accessibility defect in its own right — Base.astro's own note
 * records that eight ported blog posts once shipped with a skip link pointing at
 * a landmark that did not exist — so there is no version of this that is only a
 * measurement problem.
 *
 * AND THE OTHER END, ADDED 2026-08-04. See the note on badLandmark above: this
 * asserted presence for a day and thirteen routes shipped two. */
if (badLandmark.length) {
  const none = badLandmark.filter((b) => b.count === 0);
  const many = badLandmark.filter((b) => b.count > 1);
  console.error(`
render: ${badLandmark.length} route(s) not carrying exactly one <main> landmark
`);
  for (const b of badLandmark) console.error(`  ${b.route}   ${b.count} <main>`);
  if (none.length) {
    console.error('\n  Every alignment rule in this gate is scoped to the content region, so a route');
    console.error('  without one is unmeasured rather than clean. Base.astro owns');
    console.error('  <main id="main-content"> and every route renders through it; a route that has');
    console.error('  lost it has either bypassed the layout or moved content outside the landmark.');
    console.error('  Put the content back inside <main> — do NOT widen the rule to reach it.');
  }
  if (many.length) {
    console.error('\n  More than one <main> is the same defect from the other side: "the" content');
    console.error('  landmark stops being definite, so every rule here that says "inside <main>"');
    console.error('  stops having one answer, and axe fires landmark-no-duplicate-main,');
    console.error('  landmark-main-is-top-level and landmark-unique together. Base.astro already');
    console.error('  emits the landmark for every route; a layout or page that adds its own is');
    console.error('  wrapping, not landmarking. Make the wrapper a <div> — keep the element, so');
    console.error('  the `main > *:only-child > *` arrival stagger in styles/motion.css still');
    console.error('  unwraps it, and drop the role.');
  }
  console.error('');
}

/* ── ONE SCREEN-READER-ONLY RECIPE ──────────────────────────────────────────
 *
 * Printed on every run, pass or fail, because the number IS the rule: a reader
 * of a clean run should be able to see "1 definition" without opening anything.
 * A count that has to be inferred from silence is the same failure the landmark
 * rule above had for a day. */
console.log(`  visually-hidden: ${clipDefs.length} definition(s) of the clip recipe in src/:`);
for (const d of clipDefs) console.log(`    ${d}`);
console.log(`    ${clippedSeen} element instance(s) carrying it were measured across the build`);

if (!clippedSeen) {
  console.error(`
render: the .visually-hidden clip rule measured NOTHING
`);
  console.error('  Not one element on any route carries the class, so the rule reported clean');
  console.error('  without having looked at anything. 44 routes carried it on 2026-08-04, so');
  console.error('  either the class has been renamed again — which is the fork this rule exists');
  console.error('  to catch — or the selector here no longer matches what the markup emits.');
  console.error('  A rule that cannot fail is worse than no rule, because it is also believed.\n');
}

if (clipDefs.length !== 1 || retiredUses.length) {
  console.error(`
render: the screen-reader-only recipe is not one definition under one name
`);
  if (clipDefs.length !== 1) {
    console.error(`  ${clipDefs.length} definition(s) of the clip recipe:`);
    for (const d of clipDefs) console.error(`    ${d}`);
  }
  if (retiredUses.length) {
    console.error(`  ${retiredUses.length} use(s) of the retired name \`sr-only\`:`);
    for (const u of retiredUses) console.error(`    ${u}`);
  }
  console.error('\n  There were FOURTEEN copies of these nine declarations on 2026-08-04, under two');
  console.error('  names — thirteen scoped `.visually-hidden` blocks and one `.sr-only` in');
  console.error('  tokens.css — all byte-identical. Every gate on this site polices what a page');
  console.error('  PRESENTS, so the one class whose purpose is not to be presented forked in');
  console.error('  plain sight. It is defined once now, in styles/tokens.css @layer utilities.');
  console.error('  Use `visually-hidden`: it names what the class DOES rather than the assistive');
  console.error('  technology that benefits, and a clipped caption is also read by voice control');
  console.error('  and by a braille display. Do not re-declare it in a component.\n');
}

/* ── AND THE CLIP MEASURED, NOT ASSUMED ─────────────────────────────────────
 *
 * The source rule above counts definitions. This one asks whether the surviving
 * definition still wins on the page, which is a different question and the one
 * that has actually gone wrong here before. See the note in MEASURE. */
if (unclippedLabels.size) {
  console.error(`
render: ${unclippedLabels.size} element(s) carrying .visually-hidden that are not hidden that way
`);
  for (const [key, rts] of [...unclippedLabels].sort((a, b) => b[1].size - a[1].size)) {
    console.error(`  ${key}`);
    console.error(`      ${rts.size} route(s), e.g. ${[...rts].slice(0, 3).join(' ')}`);
  }
  console.error('\n  The recipe lives in @layer utilities, which outranks every layered rule and is');
  console.error('  beaten by any UNLAYERED one. That is not hypothetical: styles/labels.css');
  console.error('  records `margin: 0` in an unlayered block beating `margin: -1px` and putting');
  console.error('  four captions back on the page. If an element is too BIG, something unlayered');
  console.error('  is overriding the clip and the fix is at that rule, not here. If it is');
  console.error('  display: none or visibility: hidden, it has been removed from the');
  console.error('  accessibility tree as well as the page, which deletes the only reason the');
  console.error('  element exists — the clip-path recipe is what keeps it announced.\n');
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
  /* This advice named `surface--read` until 2026-08-04, as the route a long
     paragraph took to keep its left edge. That class was retired on 2026-08-03
     and nothing defines it, so the gate was telling whoever it had just failed
     to reach for something that does not exist — which sends them to write a
     local text-align instead, i.e. straight into the defect. */
  console.error('\n  DESIGN-DECISIONS.md: card content centres, because it is scanned rather than');
  console.error('  read. Long-form prose stays left because of WHAT IT IS — styles/alignment.css');
  console.error('  names the markdown-authored body containers, and a card that IS a row carries');
  console.error('  surface--row. Fix the block, or add a named exception that gives a reason.\n');
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

if (MAPPED_FIGURES) {
  console.log(`  citation map: ${MAPPED_FIGURES.size} homepage figure(s) in sources.astro`);
}

if (unmappedFigures.size) {
  console.error(`
render: ${unmappedFigures.size} homepage figure(s) not in the citation map
`);
  for (const f of unmappedFigures) console.error(`  ${f}`);
  console.error('\n  ADR 0009: /sources is the single citation home, and every homepage figure');
  console.error('  belongs in HOMEPAGE_MAP with what it RESTS ON. A figure with no source is');
  console.error('  marked illustrative in the same table, with href: null, rather than left out.');
  console.error('  This site refuses to state a figure it cannot ground; that is the mechanism.\n');
}

/* ── ONE PAGE-HEADING TREATMENT ─────────────────────────────────────────────
 *
 * Printed every run, pass or fail, because an allow-list nobody sees is an
 * allow-list nobody maintains — the same contract every other exception in this
 * file is held to. */
console.log(`  heading: ${ALLOW_HEAD.length} route(s) allowed their own page heading:`);
for (const a of ALLOW_HEAD) {
  console.log(`    ${a.route}`);
  console.log(`        ${a.reason}`);
}

/* A named exception for a route that no longer needs one is a stale claim about
   the site, so it is reported rather than left to rot. It does not fail the
   build on its own: deleting the entry is the fix, and failing here would make
   the fix look like a regression. */
const staleHead = ALLOW_HEAD.filter((a) => !usedHead.has(a.route));
if (staleHead.length) {
  console.log(`  heading: ${staleHead.length} allowance(s) NO LONGER USED — delete them:`);
  for (const a of staleHead) console.log(`    ${a.route}`);
}

if (badHeads.size) {
  console.error(`
render: ${badHeads.size} page heading(s) not using the shared treatment
`);
  for (const [key, info] of [...badHeads].sort((a, b) => b[1].routes.size - a[1].routes.size)) {
    console.error(`  ${key}`);
    console.error(
      `      ${info.routes.size} route(s), e.g. ${[...info.routes].slice(0, 3).join(' ')}`,
    );
    console.error(`      ${info.why}`);
    if (info.text) console.error(`      "${info.text}"`);
  }
  console.error('\n  Owner, 2026-08-03: "why so many different style? my advice is to keep same');
  console.error('  all the pages except from home page hero". There were five implementations');
  console.error('  and 26 of 43 routes rendered a flat h1, because the treatment lived in one');
  console.error('  component\'s scoped styles and the other layouts could not reach it.');
  console.error('  It now lives in styles/headings.css. Emit the heading with PageHeader.astro,');
  console.error('  or with Section.astro if the page is built from sections — those are the two');
  console.error('  components that produce .section__head > h1.section__title, and using either');
  console.error('  is the whole fix. Do NOT reimplement the gradient: this rule checks the');
  console.error('  MARKUP precisely so that a hand-rolled copy of the treatment still fails.\n');
}

if (
  violations.length ||
  badHeads.size ||
  badLandmark.length ||
  leftBlocks.size ||
  tinyTargets.size ||
  unequalRows.size ||
  bespokeButtons.size ||
  unmappedFigures.size ||
  offCentreCols.size ||
  clipDefs.length !== 1 ||
  retiredUses.length ||
  unclippedLabels.size ||
  !clippedSeen
)
  process.exit(1);

console.log('\n  every card centres its content, every target clears 24px, and every row of');
console.log('  buttons is one width, and every button is the component');
console.log('  and every word of CONTENT on every route centres at 1440 and at 390, except');
console.log('  inside a table, a form, a definition list, code, a figure, a list item or a');
console.log('  long-form body — none of which any page had to ask for — while the header,');
console.log('  the footer and the rest of the chrome keep the alignment they navigate at');
console.log('  and every route takes its page heading from the one shared treatment,');
console.log('  except the homepage hero, which is named above with its reason,');
console.log('  and the screen-reader-only recipe is ONE definition under ONE name, still');
console.log('  clipping every element that carries it on every route');
