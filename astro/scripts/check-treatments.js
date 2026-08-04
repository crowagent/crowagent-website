/**
 * check-treatments.js — one treatment per job, measured on the rendered page.
 *
 * WHY THIS EXISTS, AND IT IS THE SAME STORY EVERY TIME.
 *
 * This site has one recurring architectural defect, and the owner named it on
 * 2026-08-03 after being handed the fourth separate report of it:
 *
 *   "why cant we are not managing this centrally enforced by rule? ... if we
 *    are not managing centrally then we are in issue"
 *   "you must fix all such issues now"
 *
 * The shape is always identical. A treatment gets defined inside ONE component's
 * scoped <style>, so every other place that needs the same treatment cannot
 * reach it and hand-rolls its own. Nothing is obviously wrong in any single
 * file; the defect only exists across files, as drift. It looks centralised —
 * there is a component, there are tokens — but nothing makes using them the only
 * option, so the count of implementations goes up by one every time somebody
 * adds a page.
 *
 * Measured on 2026-08-03, on the built site, before this gate existed:
 *
 *   page headings        5 implementations, 26 of 43 routes rendering flat
 *   .section__title      ONE class, THREE computed recipes
 *   eyebrows             32 distinct treatments, 4 tracking values, 2 typefaces
 *   chips and badges     11 distinct pill geometries
 *   mono micro-labels    6 tracking values (0.08 / 0.10 / 0.12 / 0.14 / 0.16 / 0.20em)
 *   blockquotes          4 recipes, two of them on ONE page
 *   table cells          4 padding schemes
 *   text-link underline  3 recipes (offset 2px / 0.2em, thickness 1px / auto)
 *   focus ring           present inside <main>, ABSENT in the footer
 *
 * Every one of those was found by measuring the rendered page. Not one of them
 * was visible to a gate that reads source text, and that is the single most
 * important fact about this file.
 *
 * IT IS NOT THE ONLY ONE, AND RULES 8, 9 AND 10 BELOW ARE THE OTHER HALF. The
 * converse case — a copy that is byte-identical and therefore renders
 * identically — is invisible to a gate that measures the page, for the same
 * reason and just as absolutely. Eighteen of those were found in the source on
 * 2026-08-04 with every rendered rule here green, and A-61 found three more the
 * same night in the one label object the source rules did not yet cover. The
 * argument is written out above ALLOW_LABEL_SOURCE.
 *
 * ── WHY IT MEASURES RECIPES RATHER THAN NAMES ───────────────────────────────
 *
 * The obvious gate is "no page may declare font-family: var(--font-mono)". It
 * would be useless. Half of these forks were hand-copies that declared exactly
 * the right values, so a declaration check passes them; and the ones that had
 * drifted had drifted by 0.02em, which no reviewer catches by reading.
 *
 * So this asks the only question that matters to a reader: HOW MANY DIFFERENT
 * WAYS does this site draw the same kind of thing. It fingerprints the computed
 * style of every element playing a given role, and fails if there is more than
 * one fingerprint. That is a rule a hand-copy cannot satisfy by being careful —
 * it can only be satisfied by there being one definition.
 *
 * COLOUR IS DELIBERATELY NOT IN ANY FINGERPRINT. Two reasons, and the second is
 * the important one. First, colour on this site carries meaning — teal is
 * verified, orchid is refused, cyan is interactive — so a status chip and a
 * category chip are supposed to differ in hue while being the same object, and a
 * rule that flattened that would be wrong. Second, the palette is owned
 * elsewhere: role tokens are assigned in styles/tokens.css and this gate must
 * not compete with that file for authority. What this file owns is STRUCTURE —
 * which selector holds a treatment, and whether there is one of it.
 *
 * ── THE CONTRACT, WHICH IS THE SAME AS EVERY OTHER GATE HERE ────────────────
 *
 * Named exceptions, each carrying a written reason. All of them printed on every
 * run. Exceptions matching nothing are reported as stale. Anything not listed
 * fails the build.
 *
 * ── PROVED IN BOTH DIRECTIONS ON 2026-08-04, AND BOTH HALVES MATTER ─────────
 *
 * FAILS: run against the build as it stood that morning it reported all eight
 * forks listed above, exit 1 — 3 title recipes, 24 unlisted label recipes, 4
 * blockquotes, 4 cell paddings, 3 underlines and 43 routes of footer links with
 * no focus ring.
 *
 * PASSES: run against the build after the consolidation, exit 0.
 *
 * ── RULES 8, 9 AND 10 (THE SOURCE HALF), PROVED THE SAME WAY, 2026-08-04 ────
 *
 * FAILS: a probe file carrying one block with `font-family: var(--font-mono)`
 * and `text-transform: uppercase`, one referencing --grad-spectrum and one with
 * the capsule's 0.5rem 0.85rem inside a pill radius — exit 1, all three named by
 * file and line. Two control blocks in the same file did NOT fire: mono without
 * uppercase, and a pill with a rule and different padding. A comment quoting
 * both signatures in prose did not fire either, because comments are blanked
 * before the scan. Repeated with the probe inside an .astro `<style>`, including
 * frontmatter holding the signature inside a JS string: the style block was
 * reported at its true line and the frontmatter was not.
 *
 * PASSES: with the eighteen real declarations converted, exit 0.
 *
 * RULE 10, ADDED WITH A-61 AND PROVED THE SAME WAY, 2026-08-04.
 *
 * FAILS: a probe stylesheet holding the three pre-consolidation declarations
 * VERBATIM — NavDropdown.astro's `.ca-mega-label`, Footer.astro's
 * `.ca-footer-col-title` and Compare.astro's `.cmp-body .cmp-table thead th`,
 * copied property for property — reported "3 file(s) restating the display-face
 * group label", each at its own line, and exit 1. Two control blocks in the same
 * probe did NOT fire: the display face at weight 800 without uppercase, and
 * uppercase at 0.08em without the display face. So the rule is about the pair
 * and not about a typeface or a casing, which is the failure mode that would
 * have made it an allow-list generator on its first run.
 *
 * PASSES: with the probe deleted and the three folded into `.grouplabel`,
 * exit 0, and the run prints "the group label in 1 file(s)".
 *
 * AND THE RENDERED SIDE OF A-61 WAS PROVED TOO, because raising a limit is the
 * one edit that can silently switch a rule off. With the limit temporarily set
 * back to 3 the rule failed and printed all FOUR recipes, `.grouplabel` among
 * them at "Plus Jakarta Sans 13.00px track1.04 w800 uppercase no box" on 43
 * routes — so the fourth fingerprint is really being counted, and a fifth would
 * be reported the same way. At 4 it exits 0.
 *
 * RULE 2's FINGERPRINT GAINED LINE-HEIGHT WITH A-01 AND A-09, 2026-08-04, AND
 * THAT WIDENING WAS PROVED THE SAME WAY, BOTH EXIT CODES RECORDED.
 *
 * FAILS: with line-height added and the four causes still in the tree, this rule
 * reported EIGHT label recipes against a limit of four and exited 1, naming all
 * eight — `.eyebrow.lc__core-label` alone at lh19.50 on "/", `.meta.plan__who`
 * at lh19.50 on 1 route, `.meta.hero__gate` at lh20.80 on 1 route, and the
 * breadcrumb's own <a> and <span> at lh20.15 on 13 routes. That is the direction
 * that matters most for a widening: a property added to a fingerprint that
 * happens to be uniform already would exit 0 on day one and could not be
 * distinguished from a property the code never reads.
 *
 * PASSES: with the three component leadings deleted and the descendant rule
 * added to styles/labels.css, four recipes and exit 0.
 *
 * AND THE OLD FINGERPRINT IS RECORDED AS HAVING PASSED THROUGHOUT. Every one of
 * those eight was live on the built site while this file printed "micro-labels:
 * 4 recipes" and exited 0, which is the same shape as the false claim of
 * protection recorded above — a gate measuring five of the six properties that
 * make up a treatment reports on five of them and reads as though it reported on
 * six.
 *
 * AND THE SELF-CHECK FAILS: with styles/labels.css moved aside, exit 1 with "the
 * source reader found nothing in styles/labels.css" rather than a stack trace.
 * The first version of it DID throw a stack trace, which is the check-facts.js
 * defect cited above reappearing inside the rule written to cite it, so it is
 * recorded here rather than quietly repaired.
 *
 * Proving the pass path is not ceremony on this codebase. check-facts.js once
 * printed "every rule clean" while crashing on its reporting path, so the clean
 * result had never executed the code that reports a violation; and
 * verify-restorations.mjs asserted the mega-menu was frosted, from computed
 * style, while the menu was drawing nothing. A gate proved only to fail can
 * still be lying when it passes.
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
 * Keyed by RULE and then by the signature this gate prints, so an entry can
 * only excuse the thing it names. A reason that only says "intentional" is not
 * a reason.
 */

/* Elements allowed to be a micro-label without taking one of the four shared
 * recipes. It said "three" until A-61 added `.grouplabel` on 2026-08-04, at
 * which point the limit below said four and this line still said three. */
const ALLOW_LABEL = [
  /* THE HOMEPAGE HERO EYEBROW WAS NAMED HERE and the entry was deleted on
     2026-08-04, within hours of being written, because it turned out not to be
     needed. It was added on the assumption that fx-shimmer would push the hero
     capsule to a fingerprint of its own; measured, it does not — the shimmer
     animates background-position, which is not in the fingerprint, and the hero
     now carries plain `.eyebrow` like the other 42 routes.

     Recorded rather than quietly removed, because an exception written from an
     assumption and never tested is how an allow-list starts covering things that
     were never broken. check-render.js still names `/` for the page HEADING, and
     that one is real: the hero h1 genuinely is a composition rather than a page
     title. The eyebrow above it never was. */
  /* THE `span.ca-mega-label` ENTRY IS DELETED, A-61, 2026-08-04, AND ITS REASON
     WAS FALSE ON THE DAY IT WAS WRITTEN. It argued that the display-face group
     header was fine to exempt because "there is exactly ONE implementation of
     it, in NavDropdown.astro, and one implementation is not a fork". There were
     three, byte-identical: NavDropdown.astro, Footer.astro and Compare.astro.
     Two of them were invisible to this rendered rule for reasons it states and
     means — a heading is governed by rule 1, a table cell by rule 4 — so the
     entry was excusing the only copy the rule could see while asserting the
     other two did not exist.

     That is the most expensive shape an allow-list entry can take. It was
     printed on every run, it read as though somebody had checked, and it named
     the exact fact that would have made it wrong. The recipe now has one
     definition, `.grouplabel` in styles/labels.css, the limit below is four
     rather than three, and rule 10 fails the build on a fourth copy in source.
     A limit excuses nothing by name; a selector key excuses whatever that
     selector happens to say next. */
  {
    selector: 'span.visually-hidden',
    reason:
      'Text that is deliberately not rendered. It inherits whatever label recipe is ' +
      'on the element it explains, so its fingerprint tracks that element rather ' +
      'than being a treatment anybody chose, and nobody can see it either way.',
  },
];

/* Blocks allowed their own blockquote treatment. */
const ALLOW_QUOTE = [];

/* Tables allowed their own cell padding. */
const ALLOW_CELL = [];

/* Focusable elements allowed to ship without a visible focus indicator.
 *
 * THIS LIST IS EMPTY AND MUST STAY EMPTY. WCAG 2.4.7 has no exceptions worth
 * writing down: a keyboard user who cannot see where they are is lost, and that
 * is as true in the footer as in the article. */
const ALLOW_FOCUS = [];

/* ── RULES 8, 9 AND 10: THE SOURCE HALF ─────────────────────────────────────
 *
 * WHY THERE IS A SOURCE HALF AT ALL, IN THE FILE WHOSE HEADER ARGUES THAT
 * SOURCE RULES ARE USELESS. That header is right about the case it describes
 * and wrong as a general claim, and the difference is worth stating precisely
 * because getting it wrong in either direction costs a release.
 *
 * A rendered rule asks: how many different ways does this site DRAW one thing.
 * That is the only question that matters to a reader, and it is unanswerable
 * from source — half the forks measured on 2026-08-03 declared exactly the
 * right values and a declaration check passes them.
 *
 * But it has a blind spot with a hard edge, and the blind spot is the SECOND
 * HALF of the same sentence. A copy that is currently accurate is invisible to
 * a rendered rule BY CONSTRUCTION: an identical copy has an identical
 * fingerprint, so a site with six declarations of the eyebrow measures as
 * having one eyebrow treatment. The rule cannot see it until somebody edits one
 * of the six, at which point it reports the drift — correctly, and one release
 * too late. labels.css was written because five eyebrow clones were
 * byte-identical to the canonical on the day they were written and had drifted
 * by the day they were measured.
 *
 * So the two halves are not redundant and neither is sufficient:
 *   RENDERED  catches a fork that LOOKS different. Cannot see an accurate copy.
 *   SOURCE    catches a fork that IS a copy. Cannot see two files that produce
 *             one recipe by different means.
 *
 * MEASURED ON 2026-08-04, WHICH IS WHY THIS EXISTS RATHER THAN BEING A THEORY.
 * With every rendered rule in this file green, the source held EIGHTEEN
 * declarations of a recipe labels.css owns:
 *
 *   13 restatements of the mono micro-label — .facts dt twice, .meth-eq dt,
 *      .cmdk__s, three .result__* rules, .cmp thead th, .cmp__more > summary,
 *      .map thead th, .prose th, .prose caption, and the article review-date
 *      line — carrying FOUR tracking values, 0.08 / 0.1 / 0.12 / 0.14em
 *    5 byte-identical copies of the eyebrow capsule, in HeroStack.astro,
 *      Sector.astro, sectors/index.astro, glossary/index.astro and
 *      RelatedPosts.astro, every one of them on an element ALREADY CARRYING
 *      `class="eyebrow"`
 *
 * Not one of the eighteen was reachable by the rendered rules, and each was
 * unreachable for a reason worth naming rather than for bad luck:
 *   - the five capsules were exact copies, so they had the canonical
 *     fingerprint;
 *   - .prose th, .prose caption, .cmp thead th and .map thead th are TH and
 *     CAPTION, which rule 2 skips on purpose as table structure;
 *   - .cmdk__s and the three .result__* rules sit inside panels that are
 *     display:none until a keypress or a calculation, and rule 2 skips what is
 *     not displayed, rightly, because it measures what a reader sees.
 * The cheapest places on this site to fork a label were precisely the places
 * the rendered rule had good reasons not to look.
 *
 * ALL EIGHTEEN WERE CONVERTED THE SAME DAY, and the paragraph above is the
 * measurement that justified writing rules 8 and 9 rather than a description of
 * the tree as it stands. The live count is the one this gate prints on every
 * run: one declaration of each signature, in styles/labels.css. Said explicitly
 * because a headline number sitting in a header with no tense on it is exactly
 * how a file comes to describe a state it fixed.
 *
 * ── WHAT COUNTS AS DECLARING THE RECIPE ─────────────────────────────────────
 *
 * Two signatures, chosen so that each is the recipe and nothing else is:
 *
 * RULE 8, the mono micro-label: one rule block declaring BOTH
 * `font-family: var(--font-mono)` AND `text-transform: uppercase`. Neither
 * alone is a label — a code block is mono and is not uppercase, a display-face
 * section title is uppercase and is not mono — and the pair is the first two
 * lines of the shared floor in labels.css. It is deliberately not "any of the
 * six floor properties", which would fire on a page setting a mono face on a
 * formula and would be an allow-list generator rather than a rule.
 *
 * RULE 9, the eyebrow capsule: either a reference to `var(--grad-spectrum)`, or
 * `border-radius: var(--radius-pill)` together with the capsule's own
 * `padding: 0.5rem 0.85rem`. The gradient is not decoration on the eyebrow, it
 * IS the eyebrow treatment (labels.css says so at length), and it appears
 * nowhere else on the site; the geometry pair is what a copy written without
 * the gradient would still have to say. A pill radius ALONE is not in the
 * signature and must not be, because a button, a search trigger, a carousel
 * arrow and a tab are all pills with a rule and padding — that test would need
 * eight exceptions on day one, which is an allow-list wearing a rule's name.
 *
 * RULE 10, the display-face group label: one rule block declaring BOTH
 * `font-family: var(--font-display)` AND `text-transform: uppercase`. Exactly
 * the shape of rule 8 with the other face, and for the same reason — neither
 * half alone is a label. The display face is the site's body and heading face
 * and is set in dozens of blocks; uppercase alone is a nav item, a button, a
 * legal heading. The PAIR, at label size, is the group header and nothing else,
 * and it was measured before the rule was written: three blocks in the whole
 * tree matched it, all three carrying the identical five properties.
 *
 * ADDED BY A-61, 2026-08-04, AND IT CLOSES THE LAST INSTANCE OF THE DEFECT CLASS
 * THIS FILE EXISTS FOR. Rules 8 and 9 covered the mono label and the capsule;
 * the fourth object had no source rule at all, and its rendered exposure was one
 * of three call sites — the other two being a heading and a table cell, both
 * excluded from rule 2 on purpose. So a copy could be added to either of those
 * two places and no rule in this file would have moved.
 *
 * WHAT IT DOES NOT TEST, STATED RATHER THAN IMPLIED. Weight and tracking are not
 * in the signature. A block that set the display face and uppercase at weight
 * 400 would fire this rule and would not be a copy of the group label. That is
 * the deliberate direction to be wrong in: the rule points at a file and a line
 * and a person reads it, whereas a signature narrowed to five exact properties
 * is a signature a drifted copy walks straight past — which is the argument the
 * whole rendered half of this file is built on, applied to its own source rules.
 *
 * ── THE ALLOW-LISTS ARE EMPTY AND THE REASON IS ARCHITECTURAL ───────────────
 *
 * Four elements on this site are mono micro-labels that cannot be given a
 * class: `.prose caption`, `.prose th` and the italic review-date paragraph that
 * opens five blog posts, all three because markdown emits them bare — and bare
 * `thead th`, which this site writes by hand on /pricing, /sources and the
 * comparison layout, and which cannot take one without repeating it per cell.
 * This paragraph said "three" and named three of the four; labels.css states all
 * four and had the same count wrong in the other direction, which is how a
 * cross-reference between two files can be checked and still be wrong in both.
 * The obvious move was to name styles/prose.css, layouts/Compare.astro and
 * layouts/Article.astro here as exceptions. That would have been the wrong
 * instrument and it is worth saying why, because it is the same mistake one
 * level up: an exception permitting a second file to restate the recipe leaves
 * the recipe written twice and licences the copy to drift, which is the defect
 * with a signature on it. Those four SELECTORS are named in styles/labels.css
 * instead, beside the classes, so there is still exactly one declaration of the
 * tracking, the face and the size — and these lists stay empty, which is the
 * only state in which they say anything.
 *
 * ALLOW_GROUP_SOURCE IS EMPTY FOR A DIFFERENT REASON AND IT IS A SIMPLER ONE.
 * Both call sites of the group label — a mega-menu column header and a footer
 * column header — are elements written by hand in a component, so both can take
 * the class. Nothing about it is reached through markdown, so there is no case
 * to make and no selector to name in labels.css.
 */
const ALLOW_LABEL_SOURCE = [];
const ALLOW_CAPSULE_SOURCE = [];
const ALLOW_GROUP_SOURCE = [];

/* The one file allowed to declare any of the three. It is not an exception: it
 * is the owner, and naming it here rather than in a list is the difference
 * between "this is where the recipe lives" and "this file has permission to
 * fork". */
const LABEL_OWNER = 'src/styles/labels.css';

const SRC = path.join(__dirname, '..', 'src');

/** Every .astro and .css file under src/, as a repo-relative POSIX path. */
function sourceFiles(dir = SRC, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) sourceFiles(f, out);
    else if (/\.(astro|css)$/.test(e.name)) out.push(f);
  }
  return out;
}

/* ── A CSS RULE-BLOCK READER ────────────────────────────────────────────────
 *
 * Not a parser and it does not need to be. What it has to do is answer one
 * question — which declarations sit inside the SAME rule block — because both
 * signatures above are about two properties CO-OCCURRING. A file-wide regex
 * cannot answer that: `font-family: var(--font-mono)` on a code block and
 * `text-transform: uppercase` on a heading forty lines apart are not a label,
 * and a rule that called them one would be reported as a false positive on its
 * first run and then loosened until it said nothing.
 *
 * COMMENTS ARE BLANKED FIRST, newline for newline so the reported line numbers
 * stay true. Without that, this very file's header — which quotes both halves
 * of both signatures in prose — would be a violation of the rule it defines.
 * check-facts.js learned the same lesson and blanks comments for the same
 * reason.
 *
 * IN AN .astro FILE ONLY `<style>` CONTENT IS READ. The frontmatter and the
 * template are JavaScript and markup, both full of braces, and feeding them to
 * a brace counter produces confident nonsense. */
function cssBlocks(file) {
  let text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.astro')) {
    let styles = '';
    const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
    let m;
    while ((m = re.exec(text))) {
      /* Padded with the newlines that precede it, so a line number reported
         from the concatenation is the line number in the file. */
      const before = text.slice(0, m.index + m[0].indexOf(m[1]));
      const line = before.split('\n').length;
      styles += '\n'.repeat(Math.max(0, line - styles.split('\n').length)) + m[1];
    }
    text = styles;
  }
  const src = text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const out = [];
  const stack = [];
  let prelude = '';
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') {
      stack.push({ prelude: prelude.trim(), start: i + 1 });
      prelude = '';
    } else if (ch === '}') {
      const b = stack.pop();
      if (b) {
        /* Declarations belonging to THIS block: strip nested blocks out,
           innermost first, so an @media or @supports wrapper reports its own
           children rather than swallowing them. */
        let body = src.slice(b.start, i);
        while (/\{[^{}]*\}/.test(body)) body = body.replace(/\{[^{}]*\}/g, '');
        body = body.replace(/[^;{}]*\{/g, '');
        out.push({
          selector: (b.prelude.split(/[;}]/).pop() || '').trim().replace(/\s+/g, ' '),
          body,
          line: src.slice(0, b.start).split('\n').length,
        });
      }
      prelude = '';
    } else if (ch === ';' && !stack.length) prelude = '';
    else prelude += ch;
  }
  return out;
}

const labelSource = [];
const capsuleSource = [];
const groupSource = [];
const usedLabelSource = new Set();
const usedCapsuleSource = new Set();
const usedGroupSource = new Set();

for (const file of sourceFiles()) {
  const rel = path.relative(path.join(__dirname, '..'), file).split(path.sep).join('/');
  if (rel === LABEL_OWNER) continue;
  for (const b of cssBlocks(file)) {
    if (/^@/.test(b.selector)) continue;
    const at = `${rel}:${b.line}`;
    const shown = b.selector.slice(0, 80) || '(no selector)';

    if (
      /font-family:\s*var\(\s*--font-mono\s*\)/.test(b.body) &&
      /text-transform:\s*uppercase/.test(b.body)
    ) {
      const ex = ALLOW_LABEL_SOURCE.find((a) => a.at === at);
      if (ex) usedLabelSource.add(ex.at);
      else labelSource.push({ at, selector: shown });
    }

    /* RULE 10. Same shape as rule 8 above, on the other face. See the signature
       note above ALLOW_LABEL_SOURCE for why the pair and not either half. */
    if (
      /font-family:\s*var\(\s*--font-display\s*\)/.test(b.body) &&
      /text-transform:\s*uppercase/.test(b.body)
    ) {
      const ex = ALLOW_GROUP_SOURCE.find((a) => a.at === at);
      if (ex) usedGroupSource.add(ex.at);
      else groupSource.push({ at, selector: shown });
    }

    const spectrum = /var\(\s*--grad-spectrum\s*\)/.test(b.body);
    const capsuleGeometry =
      /border-radius:\s*var\(\s*--radius-pill\s*\)/.test(b.body) &&
      /padding:\s*0\.5rem\s+0\.85rem/.test(b.body);
    if (spectrum || capsuleGeometry) {
      const ex = ALLOW_CAPSULE_SOURCE.find((a) => a.at === at);
      if (ex) usedCapsuleSource.add(ex.at);
      else {
        capsuleSource.push({
          at,
          selector: shown,
          why: spectrum ? 'the clipped spectrum gradient' : "the capsule's own 0.5rem 0.85rem inside a pill radius",
        });
      }
    }
  }
}

/* THE SELF-CHECK. A source rule that matched nothing anywhere would report
 * clean whatever the tree looked like, and this file's own header names that as
 * the one failure mode a gate must never have. styles/labels.css declares all
 * three signatures, by definition — it is the file they are defined in — so
 * finding them there proves the reader reached the CSS, understood the block
 * structure and matched what it is looking for. If this ever fails, the RESULT
 * above is meaningless rather than good.
 *
 * RULE 10 IS IN THE SELF-CHECK FOR A REASON WORTH THE LINE. It was added last,
 * to a file where the other two were already proved, and a rule added to a
 * working scan is exactly the one nobody re-proves — it inherits the confidence
 * of the code around it. Its signature is checked against the owner file like
 * the others, so "no group label declared anywhere" can only ever mean the tree
 * is clean and never that the test stopped matching. */
const ownerPath = path.join(__dirname, '..', LABEL_OWNER);
/* fs.existsSync FIRST, and not a try/catch around the read. If the owner file
 * has moved, this rule has to SAY SO — an exception escaping from a gate exits
 * non-zero with a stack trace, which reads to whoever is looking as a broken
 * script rather than as a finding, and the temptation is then to wrap it and
 * carry on. Proved on 2026-08-04 by moving the file: the first version of this
 * self-check crashed here rather than reporting, which is the check-facts.js
 * defect this file's own header cites, arriving in the code written to prevent
 * it. */
const ownerBlocks = fs.existsSync(ownerPath) ? cssBlocks(ownerPath) : [];
const ownerDeclaresLabel = ownerBlocks.some(
  (b) =>
    /font-family:\s*var\(\s*--font-mono\s*\)/.test(b.body) &&
    /text-transform:\s*uppercase/.test(b.body),
);
const ownerDeclaresCapsule = ownerBlocks.some(
  (b) =>
    /var\(\s*--grad-spectrum\s*\)/.test(b.body) ||
    (/border-radius:\s*var\(\s*--radius-pill\s*\)/.test(b.body) &&
      /padding:\s*0\.5rem\s+0\.85rem/.test(b.body)),
);
const ownerDeclaresGroup = ownerBlocks.some(
  (b) =>
    /font-family:\s*var\(\s*--font-display\s*\)/.test(b.body) &&
    /text-transform:\s*uppercase/.test(b.body),
);

if (!fs.existsSync(DIST)) {
  console.error(`treatments: no build at ${DIST}`);
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
 * NO BACKTICKS ANYWHERE BELOW. Everything from here to the closing brace is a
 * template literal evaluated in the page, so a backtick in a comment ends the
 * string and the file stops parsing. Same constraint check-render.js documents.
 */
const MEASURE = `(() => {
  const sig = (el) => {
    const c = [...el.classList].filter((x) => !/^astro-/.test(x));
    return el.tagName.toLowerCase() + (c.length ? '.' + c.join('.') : '');
  };
  const px = (v) => (parseFloat(v) || 0).toFixed(2);
  const out = { titles: [], labels: [], quotes: [], cells: [], links: [], fields: [] };

  /* ── RULE 1: THE HEADING LEVELS ─────────────────────────────────────────
   *
   * .section__title rendered THREE ways from one class: an h1 at 83.2px on 26
   * routes, an h1 at 46.4px on 16, and an h2 at 46.4px with no gradient at all
   * on those same 16. The cause was that Section.astro sized the class in its
   * own scoped styles, and Astro scopes with an attribute selector, so the
   * component rule outranked the shared one on exactly the routes that used the
   * component. The page title was therefore 79% larger on some routes than
   * others, from the same class name.
   *
   * Fingerprinted per TAG, because h1 and h2 are two different jobs — the page
   * title and a section heading — and each is entitled to exactly one treatment.
   * What is not allowed is one tag having two. */
  for (const el of document.querySelectorAll('.section__title')) {
    const cs = getComputedStyle(el);
    out.titles.push({
      tag: el.tagName,
      recipe: [
        px(cs.fontSize) + 'px',
        'lh' + px(cs.lineHeight),
        'w' + cs.fontWeight,
        cs.backgroundImage === 'none' ? 'flat' : 'shine',
        'track' + px(cs.letterSpacing),
        cs.fontFamily.split(',')[0].replace(/"/g, ''),
      ].join(' '),
      text: (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 40),
    });
  }

  /* ── RULE 2: MONO MICRO-LABELS ──────────────────────────────────────────
   *
   * The eyebrow, the chip and the metadata line. 32 eyebrow treatments, 11 pill
   * geometries and 6 tracking values were measured across the site, all of them
   * drawing one of three things.
   *
   * WHAT COUNTS AS ONE, and every exclusion here is structural rather than a
   * name, because a name list is always one entry short of the next component:
   *   - a heading is a heading. h1-h6 are governed by rule 1 and by the type
   *     scale, and an uppercase h3 in the footer is not a label.
   *   - a table cell is table structure. th is a column header; it is governed
   *     by rule 4 with the rest of the table.
   *   - a form control renders its own text and is governed by rule 6.
   *   - it has to render WORDS OF ITS OWN. A wrapper that inherits the recipe is
   *     not a second implementation of it. */
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (/^(H1|H2|H3|H4|H5|H6|TH|TD|CAPTION|INPUT|SELECT|TEXTAREA|OPTION|SCRIPT|STYLE)$/.test(el.tagName)) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;

    const size = parseFloat(cs.fontSize) || 0;
    const track = parseFloat(cs.letterSpacing) || 0;
    const mono = /mono/i.test(cs.fontFamily);
    const shouty = cs.textTransform === 'uppercase';
    /* A micro-label is small, tracked out, and either monospaced or uppercase.
       Body copy is none of those: it is 17px, tracking 0 or negative, and
       sentence case. The three conditions together are what a label IS. */
    if (size > 17.5 || track < 0.8) continue;
    if (!mono && !shouty) continue;
    const txt = (el.textContent || '').trim().replace(/\\s+/g, ' ');
    if (txt.length > 72) continue;

    /* ── THE BOX IS ONLY IN THE FINGERPRINT WHEN THERE IS A BOX ──────────
     *
     * A pill is a treatment: its radius, its rule and the padding inside it are
     * what make it read as an object, and eleven geometries for one object is
     * exactly the defect this rule exists for.
     *
     * Padding on a label with NO box is not a treatment, it is where the label
     * sits. The homepage disclosure line carries the page gutter because it
     * shares a rule with the hero column; a date in a card grid carries whatever
     * its track gives it. Fingerprinting those would report a fresh recipe every
     * time somebody moved a label, which would make the rule expensive and
     * wrong at the same time — and the fix a developer would reach for is a
     * private class, which is the fork.
     *
     * So: a bare label is fingerprinted on its TYPE alone.
     *
     * ── LINE-HEIGHT IS IN THE TYPE, AND IT WAS NOT UNTIL 2026-08-04 ─────
     *
     * NO BACKTICKS IN THIS BLOCK. It is inside the page-evaluated template
     * literal this file's header warns about twice, and this comment had four
     * of them on its first run and stopped the file parsing. Left as the third
     * recorded instance of the same mistake rather than quietly repaired.
     *
     * A-01 and A-09. Every other property of a label was measured here and
     * leading was not, so the gate reported FOUR recipes on a site drawing
     * EIGHT, and it reported them on the homepage: .eyebrow.lc__core-label
     * rendered "One record" at 19.5px against 16.25px on the other 223
     * eyebrows, and .meta rendered three leadings over 180 instances. Nothing
     * else differed by so much as a hundredth of an em, which is exactly why a
     * fingerprint with a hole in it is worse than no fingerprint: it was
     * printing "micro-labels: 4 recipes" every run while the fork sat on the
     * most-visited route on the site.
     *
     * LEADING IS TYPE, NOT PLACEMENT, and that is the line the box argument
     * above already draws. Where a label sits is the page's business; what it
     * looks like as set text — face, size, weight, tracking, casing, leading —
     * is the recipe. Missing it out was an omission rather than a decision;
     * there was no note here arguing for it.
     *
     * MEASURED BEFORE WIDENING, so this could not become an allow-list
     * generator. Adding it took the count 4 -> 8. FOUR of the eight were real
     * and all four are now closed: three components each choosing their own
     * leading for a label that wraps (.lc__core-label 1.5, .plan__who 1.5,
     * .hero__gate 1.6), and the breadcrumb's own li children taking the
     * tokens.css leading floor from inside a label declared tight. Zero of the
     * eight were legitimate distinctions needing an exception, which is the
     * result that made the widening safe to ship. See styles/labels.css. */
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    const boxed = (parseFloat(cs.borderTopWidth) || 0) > 0 || radius >= 8;
    out.labels.push({
      s: sig(el),
      recipe: [
        cs.fontFamily.split(',')[0].replace(/"/g, ''),
        px(cs.fontSize) + 'px',
        'lh' + px(cs.lineHeight),
        'track' + px(cs.letterSpacing),
        'w' + cs.fontWeight,
        cs.textTransform,
        boxed
          ? 'box radius' + px(cs.borderTopLeftRadius) +
            ' border' + px(cs.borderTopWidth) + '/' + px(cs.borderLeftWidth) +
            ' pad' + px(cs.paddingTop) + ' ' + px(cs.paddingRight) + ' ' +
            px(cs.paddingBottom) + ' ' + px(cs.paddingLeft)
          : 'no box',
      ].join(' '),
      text: txt.slice(0, 30),
    });
  }

  /* ── RULE 3: BLOCKQUOTES ────────────────────────────────────────────────
   *
   * Four recipes, two of them on ONE page — /crowmark-buyers renders a quote
   * with a 2px rule and 38px of indent directly above a quote with no rule and
   * no indent at all. A pulled quote is one object. */
  for (const el of document.querySelectorAll('blockquote')) {
    const cs = getComputedStyle(el);
    out.quotes.push({
      s: sig(el),
      recipe: [
        'rule' + px(cs.borderLeftWidth),
        'pad' + px(cs.paddingTop) + '/' + px(cs.paddingLeft),
        'radius' + px(cs.borderTopLeftRadius),
        'size' + px(cs.fontSize),
        cs.fontStyle,
      ].join(' '),
    });
  }

  /* ── RULE 4: TABLE CELLS ────────────────────────────────────────────────
   *
   * Four padding schemes for tables doing the same job: comparison, legal,
   * pricing and citations. PADDING AND RULE ONLY. A th is allowed to be bolder
   * and smaller than a td — that is what a column header is — but the grid the
   * eye tracks across is the padding, and there is no argument for four of it. */
  for (const el of document.querySelectorAll('td, th')) {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    /* PADDING ONLY. The bottom rule is NOT in the fingerprint, because it is
       legitimately absent on the last row of every table — measuring it would
       report two recipes for every table on the site and the rule would have to
       be relaxed until it said nothing. */
    out.cells.push({
      s: el.tagName.toLowerCase(),
      recipe:
        'pad' + px(cs.paddingTop) + ' ' + px(cs.paddingRight) + ' ' +
        px(cs.paddingBottom) + ' ' + px(cs.paddingLeft),
    });
  }

  /* ── RULE 5: THE TEXT-LINK UNDERLINE ────────────────────────────────────
   *
   * A link inside flowing text, which is the highest-volume interactive element
   * on the site. Three recipes were measured: styles/prose.css set 0.2em and
   * 1px, four layouts set 2px and left the thickness to the user agent, and
   * twenty-odd page and component stylesheets each set 0.2em again by hand.
   *
   * FLOWING TEXT ONLY, and it is the same definition check-render.js uses for
   * the WCAG 2.5.8 inline exemption and for its button-row rule. A padded,
   * rounded control is a button and owns its own resting state; underlining it
   * would be wrong. Three rules, one idea of what "in text" means.
   *
   * ── DESCENDANTS, NOT DIRECT CHILDREN, AND THAT IS THE 2026-08-04 WIDENING ──
   *
   * NO BACKTICKS IN THIS BLOCK. It is inside the page-evaluated template literal
   * this file's header warns about, and one backtick here ends the string and
   * stops the file parsing. It did, on the first run of this widening.
   *
   * This asked for a CHILD combinator and missed a link inside the emphasis its
   * own sentence gives it. /glossary/toms-framework renders "…set by
   * <strong><a>PPN 002</a></strong>." and drew the user agent's underline —
   * thickness auto against the site's 1px, offset auto against 0.2em — for as
   * long as this rule and styles/links.css were both written with that
   * combinator. The gate that
   * exists to find a second recipe could not see the second recipe, because it
   * had inherited the same blind spot as the stylesheet it enforces.
   *
   * That is the failure mode worth naming: a gate written from the same mental
   * model as the code cannot catch what the model leaves out. So the SELECTOR is
   * now as wide as the idea — any link with flowing text around it — and every
   * narrowing below is a separate, argued test rather than a combinator nobody
   * would think to question. */
  for (const a of document.querySelectorAll('p a, li a, dd a, dt a, td a, th a, figcaption a, blockquote a')) {
    const cs = getComputedStyle(a);
    const pad = parseFloat(cs.paddingLeft) || 0;
    const radius = parseFloat(cs.borderTopLeftRadius) || 0;
    if (pad >= 8 && radius >= 4) continue;
    if (a.classList.contains('btn') || a.querySelector('img, svg')) continue;
    /* A HEADING LINK IS A HEADING. /tools renders a card whose h3 IS the
       title of a card, which happens to be the link that opens it. It is governed
       by rule 1 and by the type scale, it is not a word in a sentence, and
       underlining it would be a different mistake from the one this rule exists
       to stop. Reached only because the selector above is now a descendant one,
       so the exclusion arrives with the widening. */
    if (a.closest('h1, h2, h3, h4, h5, h6')) continue;
    /* Inside <nav> is an INDEX of links — a breadcrumb, a contents rail, an
       on-this-page bar — and underlining every entry in an index turns it into a
       wall of rules. Excluded structurally, mirroring styles/links.css exactly,
       and mirroring the same carve-out check-render.js makes for a column of
       navigation links. Two files, one rule. */
    if (a.closest('nav')) continue;
    /* A link that IS the whole paragraph is a standalone call to action, not a
       link in a sentence. Mirrors styles/links.css exactly — two files, one
       rule — and mirrors check-render.js's definition of "in text".
       closest('p') rather than parentElement, because with the descendant
       selector above the link's parent may be the <strong> around it and the
       question is about the PARAGRAPH either way. */
    const para = a.closest('p');
    if (para && !(para.textContent || '').replace(a.textContent || '', '').trim()) continue;
    /* THE OFFSET IS NORMALISED TO em, NOT READ IN PIXELS. One declaration of
       0.2em is ONE recipe, and it computes to 2.6px at 13px, 3.4px at 17px and 4.16px at 20.8px, so a
       pixel fingerprint reports three answers where the author gave one — and
       the "fix" it would push somebody towards is hard-coding pixels, which is
       the fork. What this rule is for is an author having said something
       different, not the same declaration meeting a different type size. */
    const size = parseFloat(cs.fontSize) || 16;
    const off = cs.textUnderlineOffset;
    const offEm = /px$/.test(off) ? (parseFloat(off) / size).toFixed(2) + 'em' : off;
    out.links.push({
      s: sig(a.parentElement) + ' > a',
      recipe: [cs.textDecorationLine, 'thick:' + cs.textDecorationThickness, 'offset:' + offEm].join(' '),
      text: (a.textContent || '').trim().slice(0, 26),
    });
  }

  /* ── RULE 6: THE FORM CONTROL ───────────────────────────────────────────
   *
   * Three heights and two corner radii for the same visual control, including
   * two different heights on elements sharing the .field__input class. */
  for (const el of document.querySelectorAll('input, select, textarea')) {
    const cs = getComputedStyle(el);
    /* TEXT CONTROLS ONLY, named rather than excluded by negation. A checkbox and
       a radio are a different control with a different anatomy — a 21px box with
       no padding is not a short text field — and a submit button is Button.astro,
       which check-render.js already holds to being the only button. */
    if (el.tagName === 'INPUT' && !/^(text|email|search|tel|url|number|password|)$/.test(el.type || ''))
      continue;
    /* THE HONEYPOT IS NOT A CONTROL A READER SEES. styles/forms.css puts it at
       left: -9999px rather than display: none, deliberately, so a bot reading the
       DOM still finds it — which means it has a box and reaches this rule. It is
       unstyled by design: styling it would tell the bot what it is. */
    if (el.closest('[aria-hidden="true"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.left < -1000 || r.top < -1000) continue;
    /* HEIGHT, RADIUS AND RULE. Not the inline padding: a field that holds an
       icon needs room for it — the glossary search has a magnifier and a clear
       button — and that is the control doing its job rather than a second
       opinion about what a control looks like. What WAS forked, and is measured,
       is 52 against 54 against 56 and radius 8 against radius 10. */
    const area = el.tagName === 'TEXTAREA';
    out.fields.push({
      s: sig(el) + (el.type ? '[' + el.type + ']' : ''),
      /* GROUPED BY KIND. A textarea is a taller box on purpose — its height is
         the number of rows it offers, which is content — so it is a second
         CONTROL rather than a second opinion about one control, and it is
         entitled to exactly one recipe of its own. */
      kind: area ? 'textarea' : 'single-line field',
      recipe: [
        area ? 'auto height' : 'h' + r.height.toFixed(0),
        'radius' + px(cs.borderTopLeftRadius),
        'border' + px(cs.borderTopWidth),
      ].join(' '),
    });
  }

  return out;
})()`;

/* ── RULE 7: THE FOCUS RING, ON EVERY FOCUSABLE ELEMENT IN THE DOCUMENT ─────
 *
 * styles/motion.css stated the ring on `main :where(...)`, so it stopped at the
 * content landmark. The nav defines its own and was fine; the FOOTER did not,
 * and every one of its links on all 43 routes fell back to the user agent's
 * `outline: auto 1px rgb(16,16,16)` — a near-black hairline on a near-black
 * footer. Measured that way, not inferred.
 *
 * HOW IT IS MEASURED, because this is the one rule where the technique needs
 * explaining. `:focus-visible` is not a state script can set: Chromium grants it
 * on keyboard focus and withholds it on a scripted `.focus()`. But the modality
 * is a property of the PAGE, not of the call, so ONE real Tab keypress from
 * Playwright puts the page in keyboard modality and every subsequent scripted
 * focus then matches `:focus-visible`. That is verified inside the walk itself:
 * the first element is asserted to match, and the run fails loudly if it does
 * not, because a walk in the wrong modality would find no rings anywhere and
 * report the entire site as broken, or — after somebody "fixed" that by
 * loosening it — as clean.
 *
 * Costs one page-load per route and one keypress, rather than tabbing every
 * stop, which on a 250-link route would be 250 round trips. */
const MEASURE_FOCUS = `(() => {
  const sig = (el) => {
    const c = [...el.classList].filter((x) => !/^astro-/.test(x));
    return el.tagName.toLowerCase() + (c.length ? '.' + c.join('.') : '');
  };
  /* Relative luminance and contrast, WCAG 2.x. Needed because "is there an
     outline" is not the question — the FOOTER had an outline. It had the user
     agent's, auto 1px rgb(16, 16, 16), drawn on a near-black footer, which is
     an indicator only in the sense that it exists.

     NO BACKTICKS IN THIS BLOCK — same constraint the header of this file states
     and check-render.js states. This comment had two and the file stopped
     parsing, which is worth leaving as the reminder. */
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
  /* The first painted background up the tree. An outline is drawn just outside
     the element, so what it has to be seen against is whatever its ancestors
     paint, not the element's own fill. */
  const behind = (el) => {
    let n = el.parentElement;
    while (n) {
      const c = rgb(getComputedStyle(n).backgroundColor);
      if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c;
      n = n.parentElement;
    }
    return [0, 0, 0];
  };

  const bad = [];
  let modality = null;
  const els = [...document.querySelectorAll('a[href], button, summary, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]')];
  for (const el of els) {
    const cs0 = getComputedStyle(el);
    if (cs0.display === 'none' || cs0.visibility === 'hidden') continue;
    const restShadow = cs0.boxShadow;
    el.focus({ preventScroll: true });
    if (document.activeElement !== el) continue;
    if (modality === null) modality = el.matches(':focus-visible');
    const cs = getComputedStyle(el);
    const w = parseFloat(cs.outlineWidth) || 0;

    /* A box-shadow that CHANGES on focus is an indicator in its own right and
       several components use one. Accepted without measuring its contrast,
       and that limit is stated rather than hidden: a shadow is drawn with
       blur and alpha, so a single computed value is not a colour anybody can
       compare. It is a deliberate hole in this rule and it is small — five
       components — where the outline path covers every element on the site. */
    if (cs.boxShadow !== restShadow && cs.boxShadow !== 'none') continue;

    if (cs.outlineStyle === 'none' || w < 1) {
      bad.push({ s: sig(el), why: 'no outline (' + cs.outlineStyle + ' ' + cs.outlineWidth + ')' });
      continue;
    }
    /* An outline-style of auto is the USER AGENT's ring, which means the site has
       stated nothing. Reported as what it is rather than as a contrast failure,
       because the fix is different: the site has to draw its own. */
    if (cs.outlineStyle === 'auto') {
      bad.push({ s: sig(el), why: 'user-agent default ring, the site states none' });
      continue;
    }
    const c = ratio(rgb(cs.outlineColor), behind(el));
    /* 3:1, WCAG 2.2 SC 1.4.11 — the contrast a non-text indicator has to reach
       against what is adjacent to it. */
    if (c < 3) {
      bad.push({ s: sig(el), why: 'ring contrast ' + c.toFixed(2) + ':1, below the 3:1 minimum' });
    }
  }
  document.activeElement && document.activeElement.blur();
  return { bad, modality };
})()`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

const all = routes();

/* recipe -> { routes:Set, tag, text } */
const titles = new Map();
const labels = new Map();
const quotes = new Map();
const cells = new Map();
const links = new Map();
const fields = new Map();
const noRing = new Map();
const usedLabel = new Set();
const usedQuote = new Set();
const usedCell = new Set();
const usedFocus = new Set();
/* Routes where the keyboard-modality assertion failed. A focus walk in the
   wrong modality measures nothing, and an unmeasured route reports clean. */
const badModality = [];

const bucket = (map, key, route, extra = {}) => {
  if (!map.has(key)) map.set(key, { routes: new Set(), ...extra });
  map.get(key).routes.add(route);
};

for (const route of all) {
  await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'load' });
  const m = await page.evaluate(MEASURE);

  for (const t of m.titles) bucket(titles, `${t.tag}  ${t.recipe}`, route, { tag: t.tag, text: t.text });

  for (const l of m.labels) {
    const ex = ALLOW_LABEL.find((a) => a.selector === l.s);
    if (ex) {
      usedLabel.add(ex.selector);
      continue;
    }
    bucket(labels, l.recipe, route, { examples: new Set() });
    labels.get(l.recipe).examples.add(`${l.s} "${l.text}"`);
  }

  for (const q of m.quotes) {
    const ex = ALLOW_QUOTE.find((a) => a.selector === q.s);
    if (ex) {
      usedQuote.add(ex.selector);
      continue;
    }
    bucket(quotes, q.recipe, route, { examples: new Set() });
    quotes.get(q.recipe).examples.add(q.s);
  }

  for (const c of m.cells) {
    const ex = ALLOW_CELL.find((a) => a.selector === c.s);
    if (ex) {
      usedCell.add(ex.selector);
      continue;
    }
    bucket(cells, c.recipe, route);
  }

  for (const l of m.links) {
    bucket(links, l.recipe, route, { examples: new Set() });
    links.get(l.recipe).examples.add(`${l.s} "${l.text}"`);
  }

  for (const f of m.fields) {
    bucket(fields, `${f.kind}  ${f.recipe}`, route, { kind: f.kind, examples: new Set() });
    fields.get(`${f.kind}  ${f.recipe}`).examples.add(f.s);
  }

  /* One real keypress puts the page in keyboard modality; see the note above. */
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(MEASURE_FOCUS);
  if (focus.modality === false) badModality.push(route);
  for (const b of focus.bad) {
    const ex = ALLOW_FOCUS.find((a) => a.selector === b.s);
    if (ex) {
      usedFocus.add(ex.selector);
      continue;
    }
    bucket(noRing, `${b.s}   outline ${b.why}`, route);
  }
}

await browser.close();
server.close();

console.log(`treatments: ${all.length} route(s) measured at 1440`);
console.log('  colour is deliberately outside every fingerprint below: hue carries meaning');
console.log('  on this site and the palette is owned by styles/tokens.css. What is measured');
console.log('  here is STRUCTURE — how many different ways one job is drawn.');

const printAllow = (title, list, used) => {
  console.log(`  ${list.length} ${title}:`);
  for (const a of list) {
    const stale = used.has(a.selector) ? '' : '   [STALE — matches nothing]';
    console.log(`    ${a.selector}${stale}`);
    console.log(`        ${a.reason}`);
  }
  if (!list.length) console.log('    none, which is the state to keep it in');
};
printAllow('label(s) allowed their own recipe', ALLOW_LABEL, usedLabel);
printAllow('blockquote(s) allowed their own recipe', ALLOW_QUOTE, usedQuote);
printAllow('table(s) allowed their own cell padding', ALLOW_CELL, usedCell);
printAllow('control(s) allowed no focus indicator', ALLOW_FOCUS, usedFocus);

const printSourceAllow = (title, list, used) => {
  console.log(`  ${list.length} ${title}:`);
  for (const a of list) {
    const stale = used.has(a.at) ? '' : '   [STALE — matches nothing]';
    console.log(`    ${a.at}${stale}`);
    console.log(`        ${a.reason}`);
  }
  if (!list.length) console.log('    none, which is the state to keep it in');
};
printSourceAllow('file(s) allowed to restate the mono label recipe', ALLOW_LABEL_SOURCE, usedLabelSource);
printSourceAllow('file(s) allowed to restate the eyebrow capsule', ALLOW_CAPSULE_SOURCE, usedCapsuleSource);
printSourceAllow('file(s) allowed to restate the group label', ALLOW_GROUP_SOURCE, usedGroupSource);

let failed = false;

/* ── RULES 8, 9 AND 10, REPORTED ────────────────────────────────────────────
 *
 * Printed before the rendered rules because they are the cheap half: they read
 * text, they name a file and a line, and the fix is to delete a block rather
 * than to work out which of six stylesheets won. */
console.log(
  `  source: the mono label recipe is declared in ${labelSource.length + 1} file(s), ` +
    `the eyebrow capsule in ${capsuleSource.length + 1}, the group label in ${groupSource.length + 1}`,
);

if (!ownerDeclaresLabel || !ownerDeclaresCapsule || !ownerDeclaresGroup) {
  failed = true;
  console.error('\ntreatments: the source reader found nothing in styles/labels.css\n');
  console.error(
    `  ${LABEL_OWNER} present: ${fs.existsSync(ownerPath)}\n` +
      `  mono micro-label signature found: ${ownerDeclaresLabel}\n` +
      `  eyebrow capsule signature found: ${ownerDeclaresCapsule}\n` +
      `  group label signature found: ${ownerDeclaresGroup}\n\n` +
      '  That file DEFINES all three signatures, so all three must match inside it.\n' +
      '  A miss means the reader did not reach the CSS — a moved file, a changed\n' +
      '  extension, a <style> tag it could not see — and every other source result\n' +
      '  above is therefore meaningless rather than clean. This is the self-check;\n' +
      '  it failing says nothing about the tree and everything about the rule.\n',
  );
}

if (labelSource.length) {
  failed = true;
  console.error(`\ntreatments: ${labelSource.length} file(s) restating the mono micro-label recipe\n`);
  for (const v of labelSource) console.error(`  ${v.at}\n      ${v.selector}`);
  console.error(
    '\n  `font-family: var(--font-mono)` and `text-transform: uppercase` in one rule\n' +
      '  block IS the shared floor of styles/labels.css. Add `eyebrow`, `chip` or\n' +
      '  `meta` to the element instead; keep only what is NOT the recipe — where the\n' +
      '  label sits, and what colour it takes, which labels.css deliberately states\n' +
      '  for nobody.\n' +
      '  IF THE ELEMENT CANNOT TAKE A CLASS because markdown emits it bare, the\n' +
      '  answer is still not a second declaration. Name the selector in labels.css\n' +
      '  beside `caption`, `thead th` and the article review-date line, so the values\n' +
      '  stay in one place. The argument for that is written above the shared floor\n' +
      '  in that file.\n' +
      '  RULE 2 ABOVE CANNOT REPLACE THIS ONE. A copy that is accurate today has the\n' +
      '  canonical fingerprint, so it renders clean until the day somebody edits one\n' +
      '  of the two — which is the release after the one that should have caught it.\n',
  );
}

if (capsuleSource.length) {
  failed = true;
  console.error(`\ntreatments: ${capsuleSource.length} file(s) restating the eyebrow capsule\n`);
  for (const v of capsuleSource) console.error(`  ${v.at}\n      ${v.selector}   — ${v.why}`);
  console.error(
    '\n  The capsule is `.eyebrow` in styles/labels.css: inline-block, 0.5rem 0.85rem,\n' +
      '  a 1px --c-border rule, --radius-pill, and --grad-spectrum clipped to the text\n' +
      '  behind an @supports gate. The gradient is not decoration ON the eyebrow, it IS\n' +
      '  the eyebrow treatment, and it is declared in exactly one place.\n' +
      '  Five copies of this block shipped — HeroStack, Sector, /sectors, /glossary and\n' +
      '  RelatedPosts — every one of them on an element that ALREADY carried\n' +
      '  `class="eyebrow"`, so every one rendered correctly and none was findable by\n' +
      '  measuring the page. Each carried a comment promising to keep it in step with\n' +
      '  the others by hand. That promise is what this rule replaces.\n' +
      '  A composition that cannot use Section.astro does not need to: the capsule is a\n' +
      '  CLASS, with no ancestor in its selector, and anything can carry it.\n',
  );
}

if (groupSource.length) {
  failed = true;
  console.error(`\ntreatments: ${groupSource.length} file(s) restating the display-face group label\n`);
  for (const v of groupSource) console.error(`  ${v.at}\n      ${v.selector}`);
  console.error(
    '\n  `font-family: var(--font-display)` and `text-transform: uppercase` in one rule\n' +
      '  block IS `.grouplabel` in styles/labels.css: the header that names a group of\n' +
      '  links. Add the class to the element and keep only what is NOT the recipe —\n' +
      '  where it sits and what colour it takes, which labels.css states for nobody.\n' +
      '  THREE COPIES OF IT SHIPPED, byte-identical, in NavDropdown.astro,\n' +
      '  Footer.astro and Compare.astro, and this rule is what A-61 added because\n' +
      '  nothing could see them: two were on a heading and a table cell, which rule 2\n' +
      '  skips on purpose, and the third was named on an allow-list whose reason said\n' +
      '  there was only one of it.\n' +
      '  IF THE ELEMENT IS A TABLE COLUMN HEADER, this is the wrong recipe. A `thead\n' +
      '  th` is a meta line and labels.css already reaches it by name; that was the\n' +
      '  fourth copy of the column-header treatment, not a fourth group label.\n',
  );
}

/** One report shape for every "more than one recipe" rule. */
function report(map, opts) {
  const { limit, heading, advice, groupBy } = opts;
  if (groupBy) {
    /* Grouped rules — titles — are per-group: h1 may have one recipe and h2 may
       have one recipe, and neither is allowed two. */
    const groups = new Map();
    for (const [key, info] of map) {
      const g = info[groupBy];
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push([key, info]);
    }
    const over = [...groups].filter(([, rows]) => rows.length > limit);
    console.log(`  ${heading.label}: ${[...groups].map(([g, r]) => `${g} ${r.length}`).join(', ')}`);
    if (!over.length) return;
    failed = true;
    console.error(`\ntreatments: ${heading.fail}\n`);
    for (const [g, rows] of over) {
      console.error(`  ${g} — ${rows.length} recipes:`);
      for (const [key, info] of rows.sort((a, b) => b[1].routes.size - a[1].routes.size)) {
        console.error(`      ${key}`);
        console.error(`          ${info.routes.size} route(s), e.g. ${[...info.routes].slice(0, 3).join(' ')}   "${info.text || ''}"`);
        if (info.examples) {
          for (const e of [...info.examples].slice(0, 4)) console.error(`          · ${e}`);
        }
      }
    }
    console.error(advice);
    return;
  }

  console.log(`  ${heading.label}: ${map.size} recipe(s)`);
  if (map.size <= limit) return;
  failed = true;
  console.error(`\ntreatments: ${heading.fail}\n`);
  for (const [key, info] of [...map].sort((a, b) => b[1].routes.size - a[1].routes.size)) {
    console.error(`  ${key}`);
    console.error(`      ${info.routes.size} route(s), e.g. ${[...info.routes].slice(0, 3).join(' ')}`);
    if (info.examples) {
      for (const e of [...info.examples].slice(0, 4)) console.error(`      · ${e}`);
    }
  }
  console.error(advice);
}

report(titles, {
  limit: 1,
  groupBy: 'tag',
  heading: { label: 'page and section headings', fail: 'a heading level with more than one treatment' },
  advice:
    '\n  H1 is the page title and H2 is a section heading. Those are two jobs and each\n' +
    '  gets exactly one treatment, both defined in styles/headings.css. A component\n' +
    '  that sizes .section__title in its own scoped <style> wins over the shared file,\n' +
    '  because Astro scopes with an attribute selector and that outranks a tag — which\n' +
    '  is exactly how the page title came to be 79% larger on 26 routes than on 16.\n' +
    '  Delete the component rule; do not raise the specificity of the shared one.\n',
});

/* ── THE LIMIT WENT 3 -> 4 WITH A-61, AND IT IS NOT A LOOSENING ─────────────
 *
 * Four recipes were permitted before and four are permitted now. What changed is
 * how: the fourth used to be a named exception keyed on `span.ca-mega-label`,
 * and a selector key excuses ANY fingerprint that element ever grows, including
 * one that drifts. A limit excuses none by name — the fourth recipe now has to
 * be the one styles/labels.css declares, because there is nowhere else for it to
 * come from with rule 10 above holding the source. */
report(labels, {
  limit: 4,
  heading: { label: 'micro-labels', fail: 'more than the four shared label recipes' },
  advice:
    '\n  There are four, they are defined once in styles/labels.css, and they are:\n' +
    '    .eyebrow     the bordered capsule that introduces a heading\n' +
    '    .chip        a small pill stating a state or a category on an item\n' +
    '    .meta        a bare line of provenance — a date, a reading time, a reference\n' +
    '    .grouplabel  the display-face header that names a group of links\n' +
    '  LEADING IS IN THE FINGERPRINT FROM 2026-08-04, so a component that states\n' +
    '  its own line-height on a label is now a fifth recipe and this is where it\n' +
    '  is reported. Three did — 1.5, 1.5 and 1.6 — all three answering "what\n' +
    '  leading does a label that WRAPS take". labels.css answers it once, and the\n' +
    '  answer is that it does not need a second one: every recipe here is\n' +
    '  uppercase, and all-caps has no descenders.\n' +
    '  Add the class; do not restate the recipe. Every one of the 32 eyebrow\n' +
    '  treatments measured on 2026-08-03 was somebody restating the recipe, and five\n' +
    '  of them were exact hand-copies that had already drifted by a hundredth of an em.\n' +
    '  Colour is NOT part of any of the four: set it at the call site, where a teal\n' +
    '  verified chip and an orchid refused chip are the same object in two states.\n',
});

report(quotes, {
  limit: 1,
  heading: { label: 'blockquotes', fail: 'more than one blockquote treatment' },
  advice:
    '\n  A pulled quote is one object. styles/prose.css owns it. Two of the four\n' +
    '  recipes this rule was written for sat on the same page, one directly above the\n' +
    '  other, and one of those had no left rule at all — so the reader had no way to\n' +
    '  tell it was a quote.\n',
});

report(cells, {
  limit: 1,
  heading: { label: 'table cells', fail: 'more than one table-cell padding' },
  advice:
    '\n  Padding is the grid the eye tracks across a table, and comparison, legal,\n' +
    '  pricing and citation tables are all doing the same job. One recipe, in\n' +
    '  styles/prose.css. A th may still be bolder or smaller than a td — that is what\n' +
    '  a column header is, and this rule does not measure it.\n',
});

report(links, {
  limit: 1,
  heading: { label: 'text-link underlines', fail: 'more than one text-link underline' },
  advice:
    '\n  One rule, in styles/links.css, for every link inside flowing text. Twenty-odd\n' +
    '  files each set text-underline-offset by hand and three different answers\n' +
    '  shipped. Delete the local declaration rather than matching it: a value copied\n' +
    '  correctly today is a value that drifts the next time one of them is edited.\n' +
    '  Colour is not measured here and is not this rule to decide.\n',
});

report(fields, {
  limit: 1,
  groupBy: 'kind',
  heading: { label: 'form controls', fail: 'a form control with more than one recipe' },
  advice:
    '\n  One control, in styles/forms.css. A textarea is reported by name rather than\n' +
    '  by height, because its height is the number of rows it offers and that is\n' +
    '  content, not a treatment.\n',
});

/* ── THE FOCUS RING ─────────────────────────────────────────────────────────
 *
 * Reported separately because it is not a "how many recipes" rule: one missing
 * ring is a WCAG 2.4.7 failure on its own, not a drift. */
if (badModality.length) {
  failed = true;
  console.error(`\ntreatments: keyboard modality not established on ${badModality.length} route(s)\n`);
  for (const r of badModality) console.error(`  ${r}`);
  console.error(
    '\n  The focus walk depends on the page being in keyboard modality, or nothing\n' +
      '  matches :focus-visible and the walk finds no rings anywhere. This is the\n' +
      '  self-check, and it failing means the RESULT is meaningless rather than bad.\n',
  );
}

if (noRing.size) {
  failed = true;
  console.error(`\ntreatments: ${noRing.size} focusable element(s) with no visible focus indicator\n`);
  for (const [key, info] of [...noRing].sort((a, b) => b[1].routes.size - a[1].routes.size)) {
    console.error(`  ${key}`);
    console.error(`      ${info.routes.size} route(s), e.g. ${[...info.routes].slice(0, 3).join(' ')}`);
  }
  console.error(
    '\n  WCAG 2.4.7. The ring is stated once, on the DOCUMENT, in styles/motion.css.\n' +
      '  It used to be stated on <main>, which is why the footer shipped 25 links per\n' +
      '  route falling back to the user agent hairline — near-black, on a near-black\n' +
      '  footer. Scoping an accessibility floor to the content region is the same\n' +
      '  mistake as scoping a treatment to one component: the next piece of chrome\n' +
      '  anybody adds has the hole again. Do not fix this per component.\n',
  );
}

if (failed) process.exit(1);

console.log('\n  one DECLARATION each of the mono label recipe, the eyebrow capsule and the');
console.log('  display-face group label, all three in styles/labels.css and nowhere else');
console.log('  in src/ — which is the half no amount of measuring the rendered page can');
console.log('  establish, because an accurate copy renders identically to the thing it');
console.log('  copies. And, measured: one page-title treatment and one section-heading');
console.log('  treatment, four label recipes and no fifth, one blockquote, one table');
console.log('  cell, one text-link underline, one form control, and a visible focus ring');
console.log('  on every focusable element on every route — inside the content region and');
console.log('  outside it alike');
