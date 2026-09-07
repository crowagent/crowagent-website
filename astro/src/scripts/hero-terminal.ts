/* ============================================================================
   HERO TERMINAL: the real engine, in the reader's browser, on the reader's text.
   ============================================================================

   Owner instruction, 2026-09-01, A-197 item six: build the hero micro terminal,
   and build it REAL rather than canned.

   ── THE DESIGN PROBLEM, AND THE LINE THIS FILE MAY NOT CROSS ───────────────

   This site's central claim is that the engine refuses to invent, and the note
   at the foot of the hero reads "The engine cannot clear its own gate". A demo
   that appeared to analyse whatever a visitor pasted and then printed a
   confident verdict it had never computed would be the product inventing, on
   its own front page, exactly what it says it never invents. The owner put the
   same finding in one sentence: it is not the feature that contradicts the
   product, it is the FAKE version of it.

   SO NOTHING HERE IS SCRIPTED. There is no timer pretending to think, no
   progress line, no predetermined result and no sample text substituted for
   what the reader typed. Every number printed below is returned by `analyse()`
   in the reader's own browser, on the exact characters in the box, with no
   network call and no model anywhere in the path.

   ── WHAT IT IS WIRED TO ────────────────────────────────────────────────────

   src/lib/tender-matrix.ts, the same 1,473 line rule engine that powers
   /tools/tender-compliance-matrix. Not a cut down copy of it and not a second
   implementation of its rules: the module itself, imported. A second copy of a
   rule set is how two copies come to disagree, and this file would be the one
   that disagreed quietly, in a hero, where nobody is testing.

   ── HOW IT COSTS THE HOMEPAGE NOTHING TO LOAD ──────────────────────────────

   The engine is behind a DYNAMIC import fired on the first FOCUS of the box.
   A reader who scrolls past the hero, and every synthetic audit that has never
   focused a textarea in its life, downloads and parses zero bytes of it. The
   fetch starts the moment somebody commits to using the thing, which is one
   whole interaction before the first keystroke can matter.

   IT IS ALSO NOT A SECOND COPY IN THE BUILD. The tool route already imports the
   same module, so the bundler hoists it into one chunk that both routes name.
   The measured effect on the build is reported in the task notes.

   ── THE FORMATTERS ARE SHARED WITH BUILD TIME, WHICH IS THE POINT ──────────

   `readLine` and `matchLine` are used by HeroStack.astro's frontmatter to print
   the three prepared examples at build time, and by this file to print the live
   result. One formatter, two callers, so the prepared examples and the reader's
   own result can never drift into two different vocabularies. That also fixed a
   real defect in passing: the build time Match line said "1 closing date" and
   would have said "2 closing date", because it never pluralised.

   ── THE NO SCRIPT PATH IS UNCHANGED AND THERE IS NO DEAD INPUT ─────────────

   Everything this file adds is CREATED by this file. With scripting off there
   is no fourth tab, no box and no promise of interactivity, and the three
   prepared examples are on screen exactly as they were, computed at build time.
   That is the same contract the rest of this site's script holds: rest state is
   final state.
   ========================================================================= */

import type { TenderMatrix } from '../lib/tender-matrix';

/** `1 requirement`, `2 requirements`. The build time line did not do this. */
function plural(n: number, word: string): string {
  return n + ' ' + word + (n === 1 ? '' : 's');
}

/**
 * Stage one. Non empty lines the engine actually segmented, which is not the
 * same as the number of newlines in the box and is why it is reported.
 */
export function readLine(m: TenderMatrix): string {
  return plural(m.lines, 'line');
}

/**
 * Stage two. Only the counts that are non zero are named, so the line reports
 * what was found rather than listing four zeroes at a reader.
 */
export function matchLine(m: TenderMatrix): string {
  return [
    plural(m.rows.length, 'requirement') + ' stated',
    m.deadlineCount > 0 && plural(m.deadlineCount, 'closing date'),
    m.limitCount > 0 && plural(m.limitCount, 'response limit'),
    m.weightingCount > 0 &&
      plural(m.weightingCount, 'weighting') + ' totalling ' + m.weightingTotal + '%',
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * Stage three, and the one this whole block exists for: what the engine
 * DECLINED to say. Every branch is a statement about the object returned, so
 * there is no branch here that can be true of a result the engine did not
 * produce.
 *
 * `no_context_found` is the interesting one. It means percentages are present
 * and none of them sits within reach of evaluation wording, so the engine saw
 * the figure and refused to report it as an award weighting. That is this
 * product's argument, performed on the reader's own text.
 */
export function holdLine(m: TenderMatrix): string {
  if (m.weightingConfidence === 'no_context_found') {
    return 'It found percentages and refused them. A figure outside evaluation context is not a weighting.';
  }
  if (m.weightingConfidence === 'sub_criteria') {
    return (
      'Weightings total ' +
      m.weightingTotal +
      '%. Outside 95 to 105, so these read as sub criteria. No total is asserted.'
    );
  }
  if (m.weightingConfidence === 'complete') {
    return (
      'Weightings total ' +
      m.weightingTotal +
      '%. Stated as context, never as a probability of award.'
    );
  }
  return 'No percentages found. Whether you can meet these is not its call.';
}

/** `<li><b>Read</b> 3 lines</li>`, built as nodes rather than as markup. */
function print(list: HTMLElement, rows: [string, string][]): void {
  list.textContent = '';
  for (const [stage, body] of rows) {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = stage;
    li.append(b, ' ' + body);
    list.append(li);
  }
}

/**
 * `hold` lets a caller supply the sentence for the Hold row. The live hero
 * passes nothing and keeps holdLine(); the Home 2.0 preview supplies a fuller
 * sentence for the two cases where holdLine reads as an error to a reader who
 * pasted an SLA or a social value target (2026-09-06). Same engine, same
 * verdict, a better sentence about it.
 */
export function initHeroTerminal(options?: { hold?: (m: TenderMatrix) => string }): void {
  const hold = options?.hold ?? holdLine;
  const hmt = document.querySelector<HTMLElement>('.hmt');
  const tabs = hmt && hmt.querySelector('.hmt__tabs');
  const panes = hmt && hmt.querySelector('.hmt__panes');
  const lead = hmt && hmt.querySelector('.hmt__lead');
  if (!hmt || !tabs || !panes || !lead) return;

  /*
   * The radio is a SIBLING of the tab row and the pane row, because the
   * stylesheet switches panes with `:checked ~` and a general sibling
   * combinator cannot climb. It is inserted before the lead, which is where the
   * three built in radios already sit.
   *
   * IT DELIBERATELY DOES NOT CARRY `.hmt__radio`. The autoplay advancer in
   * HeroStack.astro collects that class and rotates through it; a fourth member
   * would rotate an unattended reader into an empty box and then stop, because
   * this tab runs no dwell animation and would fire no `animationend` to
   * advance from. Excluding it by class rather than by index means the two
   * behaviours cannot be coupled by accident later.
   */
  /*
   * THE SCAFFOLD IS AUTHORED MARKUP AND IS WRITTEN AS MARKUP. Three constant
   * strings, and the only value interpolated into any of them is this
   * component's own scope class read back off its own DOM, so there is nothing
   * here for a value to be smuggled through. It is built bytes cheaper than the same
   * tree built with createElement, which on a page already over its HTML budget
   * is worth the one rule this file then has to hold: the scaffold is markup,
   * the BODY that changes is nodes and textContent, always. `print` below is
   * the other half of that rule.
   *
   * `aria-live` on the output because the answer changes under a reader whose
   * focus is in a different element and who would otherwise never be told.
   *
   * THE BOX TAKES THE SITE'S ONE TEXTAREA, `.field__input.field__input--area`
   * from styles/forms.css, AND THAT IS NOT A DETAIL. It was written with its own
   * border, radius, fill and padding first, and scripts/check-treatments.js
   * caught it in one run: "textarea, 2 recipes", the site's on three routes and
   * this one on the homepage. Its height, corner, fill, border, transition and
   * focus ring are now the same object every other field on this site is, and
   * only the FACE is overridden in the component, for the reason written beside
   * that rule.
   */
  /*
   * ── THE SCOPE STAMP, AND IT IS NOT OPTIONAL ────────────────────────────────
   *
   * Astro scopes a component's <style> by stamping a generated class on every
   * element the COMPILER sees and writing that same class into every selector
   * in the block. Nothing created at runtime is in the compiler's tree, so an
   * element built here carries no stamp and NOT ONE RULE written beside the
   * markup reaches it.
   *
   * THAT WAS MEASURED, NOT REASONED ABOUT. The first build of this file created
   * everything bare, and on the rendered page the fourth tab had no chip, the
   * box was in the body face rather than mono, the off-screen rule missed the
   * radio so a live radio button sat in the middle of the hero, and, worst,
   * `.hmt__pane { display: none }` missed the pane too, so the reader's box
   * stayed on screen underneath whichever prepared example was selected.
   *
   * The stamp is READ off an element the compiler did stamp rather than written
   * down here, because it is a content hash that changes every time the
   * component is edited. It is applied to every element below without exception,
   * and the Playwright run asserts the resulting computed styles rather than
   * trusting this comment.
   */
  const scope = panes.className
    .split(' ')
    .filter((c) => c.startsWith('astro-'))
    .join(' ');

  lead.insertAdjacentHTML(
    'beforebegin',
    '<input type="radio" name="hmt" id="hmt-own" class="hmt__own ' + scope + '">',
  );
  tabs.insertAdjacentHTML(
    'beforeend',
    '<label class="hmt__tab ' + scope + '" for="hmt-own">Your own text</label>',
  );
  panes.insertAdjacentHTML(
    'beforeend',
    '<div class="hmt__pane ' + scope + '" id="hmt-p-own">' +
      '<label class="meta hmt__cap ' + scope + '" for="hmt-in">Paste a clause. It is read in this tab and sent nowhere.</label>' +
      '<textarea id="hmt-in" class="field__input field__input--area hmt__in ' + scope + '" spellcheck="false"></textarea>' +
      '<ol class="hmt__steps ' + scope + '" aria-live="polite"></ol>' +
      '</div>',
  );

  const box = document.getElementById('hmt-in') as HTMLTextAreaElement;
  const out = panes.querySelector<HTMLElement>('#hmt-p-own .hmt__steps');
  if (!box || !out) return;

  /*
   * ONE PROMISE, RESOLVED ONCE. Started on focus, awaited by every input. A
   * second focus does not start a second fetch, and a keystroke that lands
   * before the module arrives is not dropped: it waits on the same promise and
   * then renders the CURRENT contents of the box, not the stale ones.
   */
  let engine: Promise<typeof import('../lib/tender-matrix')> | null = null;
  const load = (): Promise<typeof import('../lib/tender-matrix')> => {
    if (!engine) engine = import('../lib/tender-matrix');
    return engine;
  };

  let queued = false;

  const render = async (): Promise<void> => {
    queued = false;
    const lib = await load();
    /* The cap belongs to the engine, so the control takes it from the engine
       rather than restating a number that could drift from it. */
    box.maxLength = lib.MAX_CHARS;

    const text = box.value;
    const m = lib.analyse(text);

    if (!m) {
      print(out, [
        [
          'Read',
          text.trim().length === 0
            ? 'nothing yet.'
            : text.length +
              ' characters. The engine reads nothing under ' +
              lib.MIN_CHARS +
              ', so it says so rather than guessing.',
        ],
      ]);
      return;
    }

    print(out, [
      ['Read', readLine(m)],
      ['Match', matchLine(m)],
      ['Hold', hold(m)],
    ]);
  };

  /*
   * Coalesced to one run per painted frame. This is a throttle and not a
   * delay: there is no timer here, nothing waits, and nothing is shown that
   * has not been computed. A held key repeating faster than the compositor
   * draws costs one analysis per frame instead of one per keystroke.
   */
  const schedule = (): void => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      void render();
    });
  };

  box.addEventListener('focus', () => void load(), { once: true, passive: true });
  box.addEventListener('input', schedule, { passive: true });
}
