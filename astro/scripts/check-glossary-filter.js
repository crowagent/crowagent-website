/**
 * check-glossary-filter.js — the filter has to actually filter.
 *
 * ── WHY THIS EXISTS, AND IT IS THE WHOLE POINT OF THE FILE ──────────────────
 *
 * O-19. The owner reported the glossary filter broken THREE TIMES and was told
 * twice that it worked. It did not. Clicking "Legislation" moved the counter
 * from "24 terms" to "6 terms" and left all 24 cards on the page; typing
 * "framework" said "3 terms" over the same 24 cards. The page was asserting a
 * number that the list beneath it contradicted, which is worse than having no
 * filter at all, because a filter that does nothing is at least not lying.
 *
 * THE TWO AUDITS THAT CLEARED IT WERE NOT CARELESS. They asked whether the
 * CONTROL RESPONDED — the chip took its pressed state, the counter changed —
 * and both of those were true. What neither asked was whether the LIST changed.
 * That distinction is the entire subject of this gate, and it is not a new
 * lesson here: check-render.js exists because a declaration is what an author
 * typed and alignment is where the box ended up, and check-sheen.js exists
 * because a keyframe being defined is not a pixel moving. This is the same
 * lesson one layer further out. A control's state is not its effect.
 *
 * SO THE ASSERTION IS DELIBERATELY MADE ON THE THING THAT WAS NEVER MEASURED:
 * after every interaction, the gate counts the cards that are ACTUALLY ON THE
 * PAGE and names them, and requires that set to equal the set the filter claims
 * and the number the counter states. Not "the counter changed". Not "the chip
 * is pressed". The set.
 *
 * ── WHY IT MEASURES VISIBILITY DIFFERENTLY FROM THE PAGE ────────────────────
 *
 * src/pages/glossary/index.astro now derives its count by reading `offsetParent`
 * back off the rendered page, so that the count and the visible set are one
 * measurement rather than two that have to be kept in step. A gate that used
 * the same property would be re-running the page's own arithmetic and agreeing
 * with it, which is exactly the mistake that let this ship. This file therefore
 * measures visibility from the LAYOUT — a non-zero border box, plus a
 * `visibility` and an `opacity` that let it paint — which is an independent
 * answer to the same question, and is what caught the defect on 2026-08-04.
 *
 * ── AND THE EXPECTED SET COMES FROM THE MARKUP, NOT FROM THE SCRIPT ─────────
 *
 * Each card carries `data-cat`, written by Astro from the same array that
 * builds the grid, and each card's text is in the document. Both are static
 * facts about the page that exist before any of its JavaScript runs, so the
 * expected result of "click Legislation" is derived from them rather than from
 * the filter's own idea of what it did. If the two ever disagree, the gate
 * reports the difference by NAME — which terms were expected, which appeared —
 * because "6 expected, 24 shown" is a number and "TUPE is on screen under
 * Legislation" is a defect somebody can act on.
 *
 * ── WHAT IT ALSO CHECKS, AND WHY EACH IS PART OF "CORRECT" ──────────────────
 *
 * A filter that hides cards from the eye and leaves them in the accessibility
 * tree is not fixed, it is fixed for some readers. A count that changes without
 * being announced is a change that only sighted users receive. A search that
 * matches nothing and says nothing leaves the reader looking at an empty band
 * wondering whether the page broke. And two clear buttons a few pixels apart
 * (O-53) is the page disagreeing with itself about its own controls. All four
 * are rules below, on both viewports, because a filter is a whole interaction
 * rather than a display property.
 *
 * ── THE CONTRACT, WHICH IS EVERY OTHER GATE'S ──────────────────────────────
 *
 * Named exceptions, each carrying a written reason. All of them printed on
 * every run, pass or fail. An exception matching nothing is reported as stale.
 * Anything not listed fails the build.
 *
 * ── PROVED IN BOTH DIRECTIONS, 2026-08-04 ──────────────────────────────────
 *
 * FAILS: against a copy of dist/ with the two fixes DELETED out of the compiled
 * stylesheet — `.gx-term.astro-f4zqnnit[hidden]{display:none}` and the
 * `::-webkit-search-cancel-button` suppression — which is byte-for-byte the
 * build the owner reported. It exits 1 with 16 of 28 assertions failed, and
 * reports per viewport the six terms expected under Legislation against the
 * twenty-four rendered, NAMING the eighteen that should not be there.
 *
 * THE FIRST ATTEMPT AT THAT PROOF PASSED, and it is recorded because it is the
 * same mistake as the audits. The fixture INJECTED an override,
 * `.gx-term[hidden] { display: flex }`, at (0,2,0); Astro compiles the page's
 * own rule to `.gx-term.astro-f4zqnnit[hidden]` at (0,3,0), so the injection
 * lost and the gate correctly reported a page that was never broken. Deleting
 * the real rule is the only fixture that reproduces the real defect.
 *
 * PASSES: against the real build it exits 0 on 28 assertions.
 *
 * Proving the pass path is not ceremony. check-facts.js once printed "every
 * rule clean" while crashing on its reporting path, so its clean result had
 * never executed the code that reports a violation. A gate proved only to fail
 * can still be lying when it passes.
 *
 * ── ONE BUILD AT A TIME ────────────────────────────────────────────────────
 *
 * `astro build` empties dist/ before it writes, and this gate reads dist/. A
 * second build in the same tree will empty it underneath this one, and the
 * report will be "no built glossary page" — which is a true statement about an
 * empty directory and nothing at all about the site. Same note as the one at
 * the head of check-render.js, and the same instruction: if a late gate reports
 * zero of something, look for a neighbouring build before believing it.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');

/* ── THE SURFACES UNDER TEST ────────────────────────────────────────────────
 *
 * ONE ENTRY, and the count is stated here rather than in the header so that it
 * cannot drift away from the array it describes — check-render.js records a day
 * spent believing a header that said its allow-list was empty when it was not.
 *
 * IT IS A LIST RATHER THAN A HARDCODED ROUTE because /glossary is not the only
 * place this shape can appear: any page that offers a set of controls over a
 * list and states a result count has the same failure available to it. Adding
 * the next one is a single object, and everything below is written against the
 * selectors in it rather than against the glossary's class names.
 *
 * THE GATE REFUSES TO RUN ON A SURFACE THAT CANNOT DISCRIMINATE. `query` must
 * match some but not all of the cards, and every category must hold at least
 * one and fewer than all. If either stops being true — a term is renamed, a
 * category empties — the assertion would pass while proving nothing, so the
 * gate fails instead and says which condition went. */
const SURFACES = [
  {
    route: '/glossary/',
    grid: '#ggrid',
    card: '.gx-term',
    /** Written on each card by the page's own data, so it is the filter's contract. */
    catAttr: 'data-cat',
    chip: '.gx-chip',
    chipAttr: 'data-cat',
    /** The chip that means "no category filter". */
    allValue: 'all',
    input: '#gq',
    clear: '#gclear',
    count: '#gcount',
    empty: '#gempty',
    /** Must match SOME but not ALL terms. The owner used this exact word in the report. */
    query: 'framework',
    /** Must match nothing. */
    missQuery: 'zzzznomatch',
  },
];

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * `{ route, rule, reason }`, where `rule` is one of the RULES named below.
 *
 * THE LIST IS EMPTY AND THE ARGUMENT FOR KEEPING IT EMPTY IS SHORT: every rule
 * here is a statement about whether the page tells the truth about itself. A
 * card that is counted and not shown, a count that is not announced, a search
 * that matches nothing and says nothing — none of those has a legitimate
 * version. That is not true of every gate on this site (an alignment rule
 * genuinely does meet blocks that are allowed to sit left), which is why the
 * mechanism is here at all rather than being left out: the day a second surface
 * is added, it may well have one honest divergence, and it should be argued in
 * writing here rather than by loosening a rule for everyone.
 *
 * A reason that only says "intentional" is not a reason. */
const ALLOW = [];

/* Both are exercised for every rule. 390 is not a formality here: the toolbar
   stacks, the chips wrap to two rows and the clear button sits within a thumb's
   reach of the edge of the field, and a filter that works at 1440 and not on a
   phone is a filter that does not work. */
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 1200 },
  { name: '390', width: 390, height: 844 },
];

/* ── The shared static server ──────────────────────────────────────────────
 *
 * On its own ephemeral port, like every other gate in this chain. Do NOT point
 * this at the preview server on :8095: it drops contiguous blocks of requests
 * under load, and a run of failures in route order is the signature of that
 * rather than of the site. */
const server = await serveDist(DIST, 'glossary-filter');

/* ── THE RULES ──────────────────────────────────────────────────────────────
 *
 * Named, because an exception has to be able to point at one, and because a
 * failure report that says which rule broke is the difference between a fix and
 * an investigation. */
const RULES = {
  REST: 'at rest, every term is on the page and the counter says so',
  CATEGORY: 'a category chip shows exactly the terms in that category',
  SEARCH: 'a query shows exactly the terms that contain it',
  EMPTY: 'a query that matches nothing shows nothing, and says so',
  RESTORE: 'All puts every term back',
  ATREE: 'a filtered-out term is gone from the accessibility tree, not just from view',
  LIVE: 'the result count is announced',
  PRESSED: 'exactly one chip is pressed, and it is the one that was operated',
  KEYBOARD: 'a chip filters from the keyboard exactly as it does from a pointer',
  ONECLEAR: 'the search field offers ONE clear control',
};

const results = [];
const usedAllow = new Set();

/** Record an assertion. `detail` is printed whether it passed or failed. */
function assert(surface, viewport, rule, ok, detail) {
  const waiver = ALLOW.find((a) => a.route === surface.route && a.rule === rule);
  if (waiver) usedAllow.add(`${waiver.route}|${waiver.rule}`);
  results.push({ route: surface.route, viewport, rule, ok: ok || Boolean(waiver), waived: Boolean(waiver) && !ok, detail });
}

/* ── WHAT "ON THE PAGE" MEANS HERE ──────────────────────────────────────────
 *
 * Deliberately NOT `offsetParent`, which is what the page itself uses. A border
 * box with area, a `visibility` that is not hidden and an `opacity` that is not
 * zero is an independent answer to the same question, and independence is the
 * only reason this gate is worth running. If it ever starts agreeing with the
 * page by construction, it has stopped being evidence. */
const READ = (sel) => {
  const cards = [...document.querySelectorAll(sel.grid + ' ' + sel.card)];
  const visible = cards.filter((c) => {
    const r = c.getBoundingClientRect();
    const cs = getComputedStyle(c);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0';
  });
  const name = (c) => (c.querySelector('h3') ? c.querySelector('h3').textContent.trim() : '(unnamed)');
  const counter = document.querySelector(sel.count);
  const emptyEl = document.querySelector(sel.empty);
  const emptyRect = emptyEl ? emptyEl.getBoundingClientRect() : null;
  const digits = counter ? (counter.textContent || '').match(/\d+/) : null;
  return {
    total: cards.length,
    visible: visible.map(name),
    /* Every card the reader cannot see, with HOW it is gone — the accessibility
       rule below needs the mechanism, not just the absence. */
    goneBy: cards
      .filter((c) => !visible.includes(c))
      .map((c) => ({
        name: name(c),
        display: getComputedStyle(c).display,
        visibility: getComputedStyle(c).visibility,
        ariaHidden: c.getAttribute('aria-hidden'),
      })),
    counterText: counter ? counter.textContent.trim() : null,
    counterNumber: digits ? parseInt(digits[0], 10) : null,
    emptyShown: Boolean(emptyRect && emptyRect.width > 0 && emptyRect.height > 0),
    pressed: [...document.querySelectorAll(sel.chip)]
      .filter((c) => c.getAttribute('aria-pressed') === 'true')
      .map((c) => c.getAttribute(sel.chipAttr)),
  };
};

/* ── COMPARING TWO RENDERS — A-121 ──────────────────────────────────────────
 *
 * THE ONECLEAR RULE USED TO BYTE-COMPARE TWO PNGs, AND THAT MADE IT FLAKY. It
 * failed four consecutive in-build runs and then passed four standalone runs
 * against the SAME dist, which is the signature of a gate measuring the
 * environment rather than the page. A flaky gate is worse than no gate: it
 * teaches everyone that a red build means "run it again".
 *
 * MEASURED 2026-08-05, decoding both screenshots and diffing them channel by
 * channel over the 956x50 clip, 47,800 pixels:
 *
 *   NO DEFECT, eight consecutive pairs   0 pixels differ.
 *   NO DEFECT, one earlier pair          21 pixels differ, every one of them by
 *                                        EXACTLY 1 of 255, scattered across the
 *                                        whole clip with no cluster.
 *   DEFECT INJECTED (the native cancel   109 pixels differ by more than 8, 92 of
 *   button forced back on)               them by more than 24, peak 231, and the
 *                                        histogram was identical on both runs.
 *
 * So the noise floor is one channel level on a handful of pixels, and a real
 * second clear control is a hundred pixels two hundred levels dark. Those are
 * not close, and the byte comparison could not tell them apart only because it
 * asked "are these files identical" rather than "did anything paint".
 *
 * THE FIX IS A THRESHOLD ON BOTH AXES, NOT A RETRY AND NOT A SLEEP. A retry
 * would hide the noise without explaining it, and a sleep would be a guess
 * about a cause that is not timing: antialiasing and compositing need not be
 * bit-identical between two rasterisations of the same page. Eight levels is
 * eight times the measured noise and one twenty-eighth of the measured glyph;
 * twelve pixels is nine times below the measured glyph's footprint and below
 * even the sparse 21-pixel noise case once the level threshold has removed it.
 *
 * The decode happens in a scratch page rather than in Node because Chromium
 * already knows how to read its own PNGs, and a hand-rolled decoder is a second
 * thing that can be wrong.
 */
const NOISE_CHANNEL = 8;
const MIN_GLYPH_PX = 12;

/** Pixels differing by more than `floor` on any channel, and the worst delta. */
async function pixelsChanged(browser, a, b, floor) {
  const scratch = await browser.newPage();
  try {
    return await scratch.evaluate(async ([da, db, lim]) => {
      const load = (src) => new Promise((ok, no) => {
        const img = new Image();
        img.onload = () => ok(img);
        img.onerror = () => no(new Error('screenshot did not decode'));
        img.src = src;
      });
      const [ia, ib] = await Promise.all([load(da), load(db)]);
      const data = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const x = c.getContext('2d');
        x.drawImage(img, 0, 0);
        return x.getImageData(0, 0, c.width, c.height).data;
      };
      const A = data(ia), B = data(ib);
      let changed = 0, peak = 0;
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
        if (d > peak) peak = d;
        if (d > lim) changed += 1;
      }
      return { changed, peak, total: A.length / 4 };
    }, [`data:image/png;base64,${a.toString('base64')}`, `data:image/png;base64,${b.toString('base64')}`, floor]);
  } finally {
    await scratch.close();
  }
}

const browser = await chromium.launch();

for (const surface of SURFACES) {
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(server.url(surface.route), { waitUntil: 'networkidle' });

    const read = () => page.evaluate(READ, surface);

    /* GROUND TRUTH, read once from the unfiltered document. Every expectation
       below is derived from this, so the gate never asks the filter what the
       filter should have done. */
    const truth = await page.evaluate((sel) => {
      const cards = [...document.querySelectorAll(sel.grid + ' ' + sel.card)];
      return cards.map((c) => ({
        name: c.querySelector('h3') ? c.querySelector('h3').textContent.trim() : '(unnamed)',
        cat: c.getAttribute(sel.catAttr),
        text: (c.textContent || '').toLowerCase(),
      }));
    }, surface);

    const cats = [...new Set(truth.map((t) => t.cat))].filter(Boolean).sort();
    const expectFor = (cat) => truth.filter((t) => cat === surface.allValue || t.cat === cat).map((t) => t.name);
    const expectQuery = (q) => truth.filter((t) => t.text.includes(q.toLowerCase())).map((t) => t.name);

    /* A SURFACE THAT CANNOT DISCRIMINATE IS A GATE THAT PROVES NOTHING, so this
       is checked rather than assumed. */
    const qExpect = expectQuery(surface.query);
    if (!truth.length || !cats.length || !qExpect.length || qExpect.length === truth.length) {
      console.error(`\nglossary-filter: ${surface.route} cannot be tested meaningfully at ${vp.name}\n`);
      console.error(`  ${truth.length} card(s), ${cats.length} categor(y/ies), and the query "${surface.query}"`);
      console.error(`  matches ${qExpect.length} of them. A query that matches all of the terms or none`);
      console.error('  of them makes every assertion below true without measuring anything. Pick a');
      console.error('  query in SURFACES that still splits the set, or say why the set changed.\n');
      await browser.close();
      server.close();
      process.exit(1);
    }

    const same = (a, b) => a.length === b.length && [...a].sort().join('|') === [...b].sort().join('|');
    const missing = (exp, got) => exp.filter((n) => !got.includes(n));
    const extra = (exp, got) => got.filter((n) => !exp.includes(n));

    /* RULE: REST ─────────────────────────────────────────────────────────── */
    {
      const s = await read();
      const ok = s.visible.length === s.total && s.counterNumber === s.total;
      assert(surface, vp.name, RULES.REST, ok,
        `${s.total} in the DOM, ${s.visible.length} on the page, counter "${s.counterText}"`);
    }

    /* RULE: LIVE ─────────────────────────────────────────────────────────── */
    {
      const live = await page.evaluate((sel) => {
        const el = document.querySelector(sel.count);
        if (!el) return null;
        return { role: el.getAttribute('role'), live: el.getAttribute('aria-live'), atomic: el.getAttribute('aria-atomic') };
      }, surface);
      /* `role="status"` alone is enough — it implies a polite atomic live region
         — so the test is that ONE of the two routes to it is taken, not that
         both attributes are present. Asserting the belt as well as the braces
         would fail a page that is correct. */
      const ok = Boolean(live && (live.role === 'status' || live.live === 'polite' || live.live === 'assertive'));
      assert(surface, vp.name, RULES.LIVE, ok,
        live ? `role="${live.role}" aria-live="${live.live}" aria-atomic="${live.atomic}"` : 'no count element');
    }

    /* RULE: CATEGORY, once per chip that is not "All" ────────────────────── */
    let lastCat = null;
    for (const cat of cats) {
      lastCat = cat;
      await page.fill(surface.input, '');
      await page.click(`${surface.chip}[${surface.chipAttr}="${cat}"]`);
      const s = await read();
      const exp = expectFor(cat);
      const setOk = same(exp, s.visible);
      const countOk = s.counterNumber === s.visible.length;
      /* THE FILTER MUST HAVE NARROWED. Without this, a filter that hides
         nothing passes every category whose expected set happens to be
         everything — and "expected set is everything" is the state the broken
         page was permanently in. */
      const narrowed = exp.length < truth.length;
      const pressedOk = s.pressed.length === 1 && s.pressed[0] === cat;
      assert(surface, vp.name, RULES.CATEGORY, setOk && countOk && narrowed,
        `${cat}: ${exp.length} expected, ${s.visible.length} on the page, counter "${s.counterText}"` +
        (setOk ? '' : ` — missing [${missing(exp, s.visible).join(', ')}] extra [${extra(exp, s.visible).join(', ')}]`));
      assert(surface, vp.name, RULES.PRESSED, pressedOk,
        `${cat}: pressed = [${s.pressed.join(', ')}]`);
    }

    /* RULE: ATREE, measured on the state the last category left behind ──────
     *
     * `display: none` and `visibility: hidden` both remove a subtree from the
     * accessibility tree; `aria-hidden="true"` removes it from the tree only.
     * Any of the three is a pass. What fails is a card that is off the page by
     * some purely visual means — clipped, zero-opacity, moved off-screen —
     * because a screen reader would still read twenty-four terms over a page
     * showing six, which is the same lie in a different medium.
     *
     * IT ALSO ASSERTS THAT THERE WAS SOMETHING TO MEASURE, and that clause was
     * added after this rule PASSED a fixture with the defect put back: nothing
     * was filtered out, so nothing was in the wrong state, so the rule reported
     * clean about a page where the filter did not work at all. A rule that
     * cannot fail is worse than no rule, because it is also believed. */
    {
      const s = await read();
      const shouldBeGone = truth.length - expectFor(lastCat).length;
      const bad = s.goneBy.filter((g) => g.display !== 'none' && g.visibility !== 'hidden' && g.ariaHidden !== 'true');
      /* The focus probe: a hidden card that can still take focus is still
         reachable by keyboard, whatever the tree says. */
      const focusable = await page.evaluate((sel) => {
        const cards = [...document.querySelectorAll(sel.grid + ' ' + sel.card)];
        const hidden = cards.filter((c) => c.getBoundingClientRect().height === 0);
        const names = [];
        for (const c of hidden) {
          const target = c.matches('a, button') ? c : c.querySelector('a, button');
          if (!target) continue;
          target.focus();
          if (document.activeElement === target) {
            names.push(c.querySelector('h3') ? c.querySelector('h3').textContent.trim() : '(unnamed)');
          }
        }
        return names;
      }, surface);
      assert(surface, vp.name, RULES.ATREE,
        bad.length === 0 && focusable.length === 0 && s.goneBy.length === shouldBeGone,
        `${lastCat}: ${shouldBeGone} should be gone, ${s.goneBy.length} are, ` +
        `${bad.length} still in the tree, ${focusable.length} still focusable` +
        (bad.length ? ` — e.g. ${bad[0].name} display:${bad[0].display}` : '') +
        (focusable.length ? ` — e.g. ${focusable[0]}` : ''));
    }

    /* RULE: SEARCH ───────────────────────────────────────────────────────── */
    {
      await page.click(`${surface.chip}[${surface.chipAttr}="${surface.allValue}"]`);
      await page.fill(surface.input, surface.query);
      const s = await read();
      const exp = qExpect;
      const setOk = same(exp, s.visible);
      const countOk = s.counterNumber === s.visible.length;
      assert(surface, vp.name, RULES.SEARCH, setOk && countOk,
        `"${surface.query}": ${exp.length} expected, ${s.visible.length} on the page, counter "${s.counterText}"` +
        (setOk ? '' : ` — missing [${missing(exp, s.visible).join(', ')}] extra [${extra(exp, s.visible).join(', ')}]`));
    }

    /* RULE: EMPTY ────────────────────────────────────────────────────────── */
    {
      await page.fill(surface.input, surface.missQuery);
      const s = await read();
      const ok = s.visible.length === 0 && s.counterNumber === 0 && s.emptyShown;
      assert(surface, vp.name, RULES.EMPTY, ok,
        `"${surface.missQuery}": ${s.visible.length} on the page, counter "${s.counterText}", empty state ${s.emptyShown ? 'shown' : 'NOT shown'}`);
    }

    /* RULE: ONECLEAR — O-53 ───────────────────────────────────────────────
     *
     * `input[type=search]` gets Chromium's own clear glyph, and this field also
     * draws its own button, so the owner saw a filled × beside a thin one.
     *
     * IT CANNOT BE READ OUT OF getComputedStyle. Chromium reports
     * `appearance: auto` for `::-webkit-search-cancel-button` whether or not an
     * author rule has withdrawn it — measured 2026-08-04, both before and after
     * the fix — so the only honest way to ask is to look at the pixels.
     *
     * AND THE GLYPH ONLY PAINTS WHEN THE FIELD IS FOCUSED WITH A TYPED VALUE.
     * `page.fill()` sets the value without ever painting it; a screenshot after
     * fill() is a photograph of a field that has no cancel button in any build,
     * which would have made this rule pass on a broken page. It is typed key by
     * key, with `pressSequentially`, for that reason.
     *
     * THE COMPARISON IS THE SAME FIELD, IN THE SAME STATE, WITH AND WITHOUT THE
     * NATIVE PSEUDO-ELEMENT WITHDRAWN BY THIS GATE. Two photographs of one
     * focused field holding one query, differing only in a stylesheet this file
     * injects, so the text, the caret, the focus ring and the geometry are
     * identical by construction and the only thing that can move a pixel is the
     * control the browser was drawing.
     *
     * THE FIRST DRAFT COMPARED AN EMPTY FIELD WITH A TYPED ONE and clipped the
     * last 50px of the field, and it PASSED A FIXTURE THAT HAD THE DEFECT PUT
     * BACK. The native glyph sits at the end of the CONTENT box, not of the
     * border box, and this field reserves 56px of end padding for its own clear
     * button — so the glyph paints about 69px in from the edge, outside the
     * window the gate was photographing. A probe aimed slightly wrong is a probe
     * that always says what you hoped, which is the same failure as the two
     * audits that closed O-19. */
    {
      await page.fill(surface.input, '');
      await page.click(surface.input);
      await page.locator(surface.input).pressSequentially(surface.query, { delay: 5 });
      const custom = await page.evaluate((sel) => {
        const el = document.querySelector(sel.clear);
        const r = el.getBoundingClientRect();
        el.style.display = 'none';
        return { width: Math.round(r.width), height: Math.round(r.height) };
      }, surface);
      const box = await page.evaluate((sel) => {
        const r = document.querySelector(sel.input).getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      }, surface);
      const clip = {
        x: Math.round(box.x + 2),
        y: Math.round(box.y + 2),
        width: Math.round(box.w - 4),
        height: Math.round(box.h - 4),
      };
      const asBuilt = await page.screenshot({ clip });
      const probe = await page.addStyleTag({
        content: `${surface.input}::-webkit-search-cancel-button{-webkit-appearance:none !important;appearance:none !important}`,
      });
      const withoutNative = await page.screenshot({ clip });
      await probe.evaluate((el) => el.remove());
      await page.evaluate((sel) => {
        document.querySelector(sel.clear).style.removeProperty('display');
      }, surface);
      /* Not Buffer.compare. See the A-121 note above pixelsChanged(): two
         rasterisations of an unchanged field differ by up to one channel level
         on a few pixels, and a byte comparison called that a second glyph. */
      const moved = await pixelsChanged(browser, asBuilt, withoutNative, NOISE_CHANNEL);
      const secondGlyph = moved.changed >= MIN_GLYPH_PX;
      const ownTarget = custom.width >= 24 && custom.height >= 24;
      assert(surface, vp.name, RULES.ONECLEAR, !secondGlyph && ownTarget,
        `own clear button ${custom.width}x${custom.height}, and withdrawing ` +
        `::-webkit-search-cancel-button moves ${moved.changed} of ${moved.total} pixel(s) ` +
        `past ${NOISE_CHANNEL}/255 (peak ${moved.peak}, fails at ${MIN_GLYPH_PX}), so ` +
        (secondGlyph
          ? 'the browser is drawing a SECOND clear control'
          : 'it is the only one'));
    }

    /* RULE: KEYBOARD, and RULE: RESTORE ──────────────────────────────────── */
    {
      await page.fill(surface.input, '');
      const cat = cats.find((c) => c !== surface.allValue) || cats[0];
      await page.focus(`${surface.chip}[${surface.chipAttr}="${cat}"]`);
      await page.keyboard.press('Enter');
      const s = await read();
      const exp = expectFor(cat);
      assert(surface, vp.name, RULES.KEYBOARD, same(exp, s.visible) && s.counterNumber === s.visible.length,
        `Enter on ${cat}: ${exp.length} expected, ${s.visible.length} on the page, counter "${s.counterText}"`);

      await page.click(`${surface.chip}[${surface.chipAttr}="${surface.allValue}"]`);
      const r = await read();
      assert(surface, vp.name, RULES.RESTORE, r.visible.length === r.total && r.counterNumber === r.total && !r.emptyShown,
        `${r.visible.length} of ${r.total} back on the page, counter "${r.counterText}"`);
    }

    await page.close();
  }
}

await browser.close();
server.close();

/* ── THE REPORT ─────────────────────────────────────────────────────────────
 *
 * Every assertion is printed, passing or failing. A gate whose clean run says
 * only "ok" gives a reader no way to tell a page that passed from a page that
 * was never looked at, and this chain has already shipped one gate that printed
 * a clean line while measuring zero routes. */
const line = '='.repeat(104);
console.log(`glossary-filter: ${SURFACES.length} filter surface(s), ${VIEWPORTS.length} viewport(s), ${results.length} assertion(s)\n`);

console.log(`  ${ALLOW.length} recorded exception(s):`);
if (!ALLOW.length) {
  console.log('    none — every rule here is a statement about whether the page tells the truth');
  console.log('    about itself, and there is no honest version of a term that is counted and');
  console.log('    not shown. An entry would need the argument written out.');
}
for (const a of ALLOW) {
  console.log(`    ${a.route}  ${a.rule}`);
  console.log(`        ${a.reason}`);
}

/* A named exception for something that no longer needs one is a stale claim
   about the site, so it is reported rather than left to rot. It does not fail
   the build on its own: deleting the entry is the fix, and failing here would
   make the fix look like a regression. */
const stale = ALLOW.filter((a) => !usedAllow.has(`${a.route}|${a.rule}`));
if (stale.length) {
  console.log(`  ${stale.length} exception(s) NO LONGER USED — delete them:`);
  for (const a of stale) console.log(`    ${a.route}  ${a.rule}`);
}

console.log(`\n${line}`);
console.log('DOES THE FILTER ACTUALLY FILTER? — a browser, the built site, the visible set counted');
console.log(line);
for (const r of results) {
  const tag = r.ok ? (r.waived ? 'WAIVE' : 'PASS ') : 'FAIL ';
  console.log(` ${tag} ${(r.route + ' @' + r.viewport).padEnd(22)} ${r.rule.padEnd(62)} ${r.detail}`);
}
console.log(line);

const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} assertion(s) passed`);

if (failed.length) {
  console.error(`\nglossary-filter: ${failed.length} assertion(s) failed\n`);
  for (const r of failed) console.error(`  ${r.route} @${r.viewport}  ${r.rule}\n      ${r.detail}`);
  console.error('\n  O-19: the counter and the card list are supposed to be ONE measurement. If the');
  console.error('  counter is right and the set is wrong, something is overriding the `hidden`');
  console.error('  attribute — an author `display` declaration beats the user-agent rule at any');
  console.error('  specificity, which is the whole of the original defect. Look for a `display`');
  console.error('  on the card without a matching `[hidden] { display: none }` beside it.');
  console.error('  Fix the page. Do not add an exception to make the number agree.\n');
  process.exit(1);
}

console.log('\n  clean: on every surface and both viewports, each category chip and each query puts');
console.log('  exactly the expected terms on the page, the counter states the number that is');
console.log('  actually there, a filtered-out term is gone from the accessibility tree as well as');
console.log('  from view, a query matching nothing says so, All puts everything back, the chips');
console.log('  work from the keyboard, and the search field offers one clear control.');
