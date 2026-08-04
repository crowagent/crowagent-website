/**
 * check-design-system.js — the design system is enforced by the build, not by
 * whoever last ran a sweep.
 *
 * WHY THIS EXISTS. Owner, 2026-08-02, on the rebuilt site:
 *
 *   "So much content and text still showing left aligned. I think there is a
 *    serious issue if we cannot control all such things centrally despite moving
 *    into new architecture, and I can see the same pain points. I am not sure if
 *    you are doing things manually crafted, or following and enforcing centrally
 *    a design system and best practices."
 *
 * That is the correct diagnosis. Every parity fix to date has been a manual
 * sweep: measure at 1440 across 24 routes, fix, drift, measure again. Card
 * recipes went 21 -> 3 -> 1 and heading recipes 15 -> 9 -> 6 that way, and
 * nothing in the build holds either number. So a violation and a deliberate
 * exception look identical in the source, and the next person cannot tell them
 * apart without re-running the audit.
 *
 * THE CONTRACT IS THE ONE check-links.js, check-seo-parity.js AND
 * check-content-parity.js ALREADY USE, and it is copied deliberately rather than
 * reinvented. Each of those was written after a defect shipped because a gate
 * asserted something ADJACENT to what mattered. All three settled on the same
 * shape, so this one does too:
 *
 *   - an allow-list of named exceptions, each carrying the reason it is one
 *   - the allow-list is PRINTED on every build, so a deliberate exception that
 *     nobody re-reads cannot quietly become an accidental one
 *   - entries that no longer match anything are reported as stale, so the list
 *     can only shrink
 *   - anything NOT on the list FAILS the build
 *
 * The list is not a snooze button. Seeding it with everything to get a green
 * build would make the gate worthless, which is precisely the failure mode it
 * exists to prevent.
 *
 * ── WHERE THE EVIDENCE COMES FROM, AND WHY IT IS SPLIT ──────────────────────
 *
 * MARKUP RULES READ THE BUILT HTML IN dist/, for the reason written at the top
 * of check-content-parity.js: rendered `innerText` omits content inside
 * collapsed <details> and lies about accordions, and it is exactly that content
 * which goes wrong unnoticed. Shipped HTML counts everything.
 *
 * CSS RULES READ THE SOURCE STYLESHEETS IN src/, NOT the bundles in
 * dist/_assets/. Two reasons, both load-bearing:
 *
 *   1. A violation has to name a file somebody can open. Astro bundles many
 *      components into one hashed .css per route, so a bundle can say a
 *      hardcoded hex exists and cannot say where it was written.
 *   2. copy-assets.js copies the LEGACY stylesheets into dist/. Those carry
 *      2,279 !important declarations and hardcoded hex throughout. They are not
 *      part of this design system and are not being fixed; scanning the bundles
 *      would bury every real finding under them.
 *
 * NO BROWSER. Playwright is available at the repo root and tests/*.spec.js use
 * it, but a browser launch plus 43 routes is tens of seconds on every build, and
 * a gate that is slow is a gate somebody eventually takes out of `npm run
 * build`. Everything below is derived from text and runs in well under a second.
 * What that costs is recorded honestly at the bottom of this comment.
 *
 * IT SAID 41 UNTIL 2026-08-04, when the build had 43. Two routes shipped after
 * the line was written and nobody re-read it. The count is printed on the first
 * line of every run — "design-system: 43 route(s)" — so this is one of the few
 * numbers in the file that can be checked in a second, which is exactly why it
 * should not have been left to go stale. That the argument does not turn on the
 * number is not a defence: a reader who catches one stale figure stops trusting
 * the ones that do turn on it.
 *
 * ── THE EIGHT RULES ─────────────────────────────────────────────────────────
 *
 * They come from specs/DESIGN-DECISIONS.md and specs/OWNER-FEEDBACK-LOG.md.
 *
 * THIS HEADING SAID "THE SEVEN RULES" UNTIL 2026-08-04 and listed seven, while
 * rule 8 sat implemented 570 lines below and one of the allow-list reasons
 * already referred to it by number. A count in a header is the one thing a
 * reader takes on trust rather than verifying, so it is the one place a stale
 * number does the most damage: the rule most likely to be edited carelessly is
 * the rule the file's own contents page does not mention.
 *
 *   1 ALIGNMENT    A card is scanned, so its content centres. Prose is read, so
 *                  it stays left. (OWNER-FEEDBACK-LOG decision 9, and the
 *                  comment block on `.surface` in styles/surfaces.css.)
 *   2 TYPE SCALE   Four heading sizes, one weight per tier, all from tokens.css.
 *                  The last audit got this to 6 recipes across 24 routes (A5).
 *   3 CARD RECIPE  One card sitewide: --radius-card and --blk-pad, via
 *                  `.surface`. The audit took this 21 -> 3 -> 1 (A3).
 *   4 TOKENS       No hardcoded hex, font-size or max-width in a component or
 *                  page stylesheet. Token definitions are exempt.
 *   5 HEADINGS     One <h1> per route, no skipped levels. tests/
 *                  heading-structure.spec.js already asserts this in Playwright;
 *                  it is asserted here too so it fails in the build rather than
 *                  only in a suite nobody runs.
 *   6 ICON SLOT    A modifier on an icon class paints inside the slot; it does
 *                  not resize the box. Written after a defect shipped.
 *   7 GRADIENTS    Every colour inside a gradient in a component or page
 *                  stylesheet resolves from a var(); a literal hex, rgb() or
 *                  hsl() fails. Masks are exempt because a mask is not a
 *                  colour. Added 2026-08-03 after the owner reported a gradient
 *                  as "bad design" that "must be managed centrally" and the
 *                  count came back 104 gradients against 5 tokens.
 *                  STATED HERE AS "comes from a --grad-* or --orb-* token"
 *                  UNTIL 2026-08-04, which is what the rule asked for on the
 *                  day it was written and not what it has asked for since it
 *                  was amended the same day. The amendment is argued in full at
 *                  the rule itself: a knob token bakes in its fallbacks at the
 *                  point it is DECLARED, so requiring the token name demanded a
 *                  construction that silently painted the wrong pixels. Two
 *                  more copies of the superseded wording lived in tokens.css
 *                  and one in this file's own failure message, so a gate whose
 *                  rule had changed was still explaining the old rule to
 *                  whoever it failed.
 *   8 LIGHT SCOPE  Every --c-* token used as a `color:` value anywhere in src
 *                  is rebound inside `.art__pane`, the light reading scope.
 *                  Added 2026-08-03 after --c-interactive resolved to cyan at
 *                  1.67:1 on the light pane the day it was created, with four
 *                  more between 1.96:1 and 2.52:1 behind it. Reported under the
 *                  `token` label, which is why it has no counter of its own.
 *
 * ── WHAT THIS CANNOT SEE, STATED RATHER THAN IMPLIED ────────────────────────
 *
 * This checks the SOURCE of a value, not the pixel it renders to. It cannot
 * catch a heading pushed off the scale by an inherited `em`, by a specificity
 * fight, or by a token whose own definition changed. The defence against that is
 * the property it DOES assert: if every heading's font-size is a `--t-*` token,
 * the set of rendered heading sizes is bounded by the token set and cannot drift
 * one component at a time, which is how it got to 15 recipes before. Rendered-px
 * verification stays with the Playwright suite, where a browser is already paid
 * for.
 *
 * DS_DIST overrides the directory read for markup, so the gate can be proved to
 * fail against a scratch build without disturbing the dist/ another agent is
 * using. It defaults to astro/dist, which is what the build step passes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = process.env.DS_DIST || path.join(ROOT, 'dist');

/* ══════════════════════════════════════════════════════════════════════════
 * THE ALLOW-LIST — every entry is a decision somebody has to defend.
 *
 * Same contract as KNOWN_UNPORTED in check-links.js and ALLOWED_LOSSES in
 * check-content-parity.js. Keys are `<rule>  <where>  <what>`, matched
 * case-insensitively. Deliberately keyed WITHOUT line numbers: a line number
 * drifts every time somebody edits the file above it, and an exemption that
 * silently stops matching is how the next real violation gets waved through.
 *
 * DELETE AN ENTRY THE MOMENT IT STOPS BEING TRUE. The check reports its own
 * stale entries on every run for exactly that reason.
 * ══════════════════════════════════════════════════════════════════════════ */
const ALLOWED = new Map([
  /* ── 1 ALIGNMENT ─────────────────────────────────────────────────────────
   *
   * SIXTEEN ENTRIES USED TO SIT HERE AND THEY ARE ALL GONE. Each argued for one
   * card keeping its left edge via `surface--read` — the 24 glossary definition
   * cards, 10 pricing notes, /about's pairs, principles, timeline and company
   * card, /contact's form and directory, /blog's featured entry, /roadmap's
   * items and notes. Every one of them carried a real argument, and the
   * argument was always the same: at four or five ragged lines a paragraph is
   * READ rather than scanned, so centring gives every line a different start.
   *
   * THE OWNER REVERSED THE DECISION ON 2026-08-03, reviewing :8095:
   *
   *   "lot of text are left aligned in /glossary/, you must fix this site wide
   *    issue ... identify and fix in each and every pages, all the text in
   *    cards or non cards must be in central, i am not sure why cant we handle
   *    this using central enforcer and automated way"
   *
   * So the class is retired, the twenty call sites no longer carry it, and the
   * entries are DELETED rather than reworded: a stale exemption that still
   * matches nothing is how the next real violation gets waved through, and this
   * gate reports its own stale keys for exactly that reason.
   *
   * WHAT REPLACES THEM IS ONE RULE, NOT SIXTEEN EXEMPTIONS. styles/
   * alignment.css centres the document on <body> and names the structures that
   * keep a left edge — a table, a form, a definition list, code, a figure, the
   * five markdown-authored body containers, a navigation list, a list item.
   * Four of the sixteen cards above are STILL left-aligned as a result, and
   * none of them needed naming: /contact's enquiry card holds a <form>, and
   * /contact's directory and /about's company card hold <dl>s.
   *
   * THE ONE ENTRY BELOW SURVIVES because it is about a DECLARATION rather than
   * about the class: it writes `text-align: left` in a stylesheet, which is what
   * this rule reads.
   *
   * It said "THE TWO ENTRIES BELOW" until 2026-08-04. There was one. The second
   * was `.kicker--tight`, deleted in the same pass that wrote this paragraph and
   * recorded four lines below it, so the file both announced two entries and
   * explained why there was one. Corrected rather than left, because a count is
   * the fastest thing a reader checks a list against and the fastest way to
   * teach them not to bother.
   */
  ['align  src/components/forms/NewsletterForm.astro  .nl__err',
   'the inline validation message. It became reachable by this rule on 2026-08-03, when the owner asked for the monthly digest to sit in a card and the form moved inside a centred `.surface`. An error belongs on the same left edge as the field it is about — a centred error floats away from the input that caused it, and a reader scanning back up from the message has nothing to line it up with. This is the SC 3.3.1 relationship, not a styling preference'],
  /* The `.kicker--tight` entry that sat here is DELETED, not reworded. It argued
     that a label above a feature list should share the list's left edge; the
     owner overruled that on 2026-08-03 and the declaration went with it, so the
     exemption matches nothing. A stale entry that matches nothing is how the
     next real violation gets waved through. */

  /* ── 2 TYPE SCALE ────────────────────────────────────────────────────────*/
  /* ── RULE 2b, the four headings two tiers below their level ──────────────
   *
   * All four render an h2 at 21.6px on routes that ALSO render a Section h2 at
   * 46.4px: the same element, the same page, two sizes. That is the 63-heading
   * defect prose.css closed on 2026-08-02, alive in four more files.
   *
   * DEBT rather than fixed, and the reason is that both fixes are decisions.
   * Resizing to --t-h3 makes an h2 render at the same size as an h3 elsewhere.
   * Re-tagging to h3 changes the document outline and has to clear rule 5's
   * no-skipped-levels check. Neither is a change to make unattended on four
   * published routes, so they are printed on every build until someone picks. */
  ['type  src/layouts/Compare.astro  .cmp-body .cmp-sources h2',
   'DEBT: the sources heading on 5 comparison routes, --t-h4 on an h2. Needs the owner call above'],
  ['type  src/layouts/Glossary.astro  .gl-article :global(.gl-tldr h2)',
   'DEBT: the TL;DR heading on 24 glossary entries, --t-h4 on an h2. Same call'],
  ['type  src/pages/compare/index.astro  .cmp-hub-card h2',
   'DEBT: the hub card heading, --t-h4 on an h2, on a page whose Section h2 is 46.4px. Same call'],
  ['type  src/pages/contact.astro  .reach__h',
   'DEBT: the "how to reach us" headings, --t-h4 on an h2. Same call'],
  /* The `.ca-footer-col-title` entry that sat here is MOVED, not deleted, and it
     is now keyed on styles/labels.css below under rule 2. Footer.astro no longer
     sizes the title: A-61 folded the display-face group label into labels.css,
     so the font-size this rule reads is declared there. The entry also said the
     titles are `<h2>`; they are `<h3>`, and have been for as long as the entry
     existed. Nothing turned on the level — the argument is about a heading being
     sized off the heading tiers — but a reason that misstates the markup it is
     excusing is a reason nobody can check, which is the whole point of writing
     one. */
  ['type  src/styles/labels.css  .grouplabel',
   'the display-face group label, A-61. It is the ONE shared definition of the header that names a group of links — the footer columns and the mega-menu columns — and the footer writes it on an <h3> for document structure, which is what puts it in front of this rule at all. --t-micro is a token on the scale; it is simply not one of the four heading tiers, and it should not be: a footer column header set at --t-h4 would be the loudest type below the fold on all 43 routes. This entry replaces the Footer.astro one it was moved from, so the exception is still exactly one — what changed is that the declaration it excuses is now in one file instead of three'],

  /* ── 3 CARD RECIPE ───────────────────────────────────────────────────────
   *
   * The first four are markdown-authored blocks. The content collections under
   * src/content/** cannot be given a class from a stylesheet, which is the same
   * constraint surfaces.css already records for its SLOTTED CARDS block. They
   * are card-shaped because the design system says a bordered content block is
   * a card; they cannot say so in their class list. */
  ['card  src/styles/prose.css  .prose details',
   'a disclosure in markdown-authored prose. Same case as `.cfaq details`, which surfaces.css already routes through the slotted-card list; this one is reached by a different layout. Uses --radius-card and --blk-pad exactly, so it is the one recipe, not a second one'],
  ['card  src/styles/prose.css  .prose pre',
   'a code block in markdown-authored prose. Uses --radius-card and --blk-pad exactly'],
  ['card  src/styles/blocks.css  blockquote',
   'the ONE pulled quote, and it cannot be reached through .surface for the same reason .prose details and .prose pre above cannot: the highest-volume blockquotes on the site are authored in markdown, which carries no class. Four quote treatments shipped BECAUSE the recipe was only reachable by a class — three pages wrote their own and one of them ended up with no left rule at all — so requiring a class here would recreate the exact defect this rule is meant to prevent. It uses --radius-card and --blk-pad exactly, so it is the one card recipe and not a second one; what it adds is the 3px spine on the inline start edge, which is what makes it a quotation rather than a card'],
  /* The three entries that used to sit here — Article.astro's blockquote,
     glossary/index.astro's search field and crowmark-buyers.astro's .quote —
     were DELETED on 2026-08-04, not waived. Each named a hand-rolled copy of a
     shared treatment, and all three copies are gone: the quote is `blockquote`
     in styles/blocks.css, the search field is `.field__input` in
     styles/forms.css. The blockquote entry even recorded its own drift ("its
     padding is a raw 1.25rem 1.5rem rather than --blk-pad, which is real drift")
     and carried it for a week, which is what an allow-list does to a defect
     nobody has time for. */
  ['card  src/layouts/Article.astro  .article-body :global(pre)',
   'a code block inside a blog post body. Same authoring constraint and the same raw padding as the blockquote above, and it should move to --blk-pad with it'],
  ['card  src/components/nav/NavDropdown.astro  .ca-mega',
   'the mega-menu dropdown. Navigation chrome that floats above the page rather than a block of content sitting in it, so --radius-panel is right and --blk-pad, which is section-interior padding, is not. Moved out of Nav.astro on 2026-08-04 when the dropdown was extracted into a component so that Products and Resources could be two instances of one menu rather than two copies of one'],

  ['card  src/pages/tools/ppn-002-calculator/methodology.astro  .meth-eq > div',
   'the worked-equation block, same left-rule treatment and same reason as the pull quote above. Radius and padding are both tokens'],

  /* ── 4 TOKENS ────────────────────────────────────────────────────────────*/
  ['token  src/components/nav/Nav.astro  max-width: 1440px',
   'the outer nav rail, deliberately wider than --measure. The nav spans the viewport while the page content sits on the 1160px measure, so it is not on that scale at all'],
  ['token  src/components/footer/Footer.astro  max-width: 1440px',
   'the outer footer rail. Same as the nav: page chrome spanning the viewport, not content on --measure'],
  ['token  src/styles/prose.css  font-size: 0.9em',
   'inline <code> inside markdown-authored prose. `em` is the point: code has to sit at 0.9 of WHATEVER it is inside, and a token is an absolute value, so tokenising this would render code inside an h2 at the same size as code inside a paragraph. The one case where a relative unit is more correct than a token'],
  ['token  src/layouts/Article.astro  font-size: 0.92em',
   'inline <code> inside a blog post body, and the same argument as prose.css above: a ratio, not a size. Worth noting that the two disagree, 0.9 against 0.92, which nobody will ever see and which is exactly how a scale acquires a second opinion. One of them should move'],

  /* ── 7 GRADIENTS: NO ENTRIES, AND THAT IS THE WHOLE SECTION ──────────────
   *
   * THERE IS NOTHING HERE. Not one gradient on this site is exempted by name.
   *
   * THIS BLOCK CLAIMED "nine one-offs with an argument and seventeen entries of
   * named debt in three files this pass was not allowed to touch", and a second
   * block below it repeated the seventeen and named the three files. Both were
   * written on 2026-08-03 describing entries that were never added — the rule
   * was amended the same day to test for a literal colour rather than for a
   * token NAME, and under the amended rule every one of the twenty-six passed
   * on its own merits and needed no exemption. Nobody deleted the prose that had
   * been written for the version of the rule that would have needed it.
   *
   * IT IS WORSE THAN A WRONG NUMBER, and that is why this is spelled out rather
   * than quietly cut. The block was arguing that the rule works BECAUSE the
   * allow-list is short — "if this list had 98 entries the rule would be a
   * snooze button" — from a list length that did not exist. A reader auditing
   * this file would have taken twenty-six accounted-for exceptions on trust and
   * moved on, when the true state was better than the claim and unverified.
   * check-treatments.js already cites this file's phantom gradient allow-list as
   * one of three instances of the same defect found in one night.
   *
   * THE THRESHOLD IT USED TO STATE STILL HOLDS AND BELONGS TO tokens.css, not
   * here: a shape used three or more times is a token, a shape used once stays
   * where it is and gets written down. Hoisting a single-use gradient would make
   * the token block a description of one element, which is how a scale starts
   * collecting values nobody else can spend. */

  /* ══════════════════════════════════════════════════════════════════════════
   * KNOWN DEBT — everything below is a REAL VIOLATION that is not fixed here.
   *
   * Every reason starts with DEBT:, which is what makes the check print it in
   * its own block under its own count, rather than beside the decisions above
   * as though somebody had argued for it. The shape is the one check-links.js
   * uses for a route that has not shipped: a defect blocked on something,
   * tracked in the open, deleted rather than reworded the moment it is paid.
   *
   * THIS SENTENCE CITED `/integrations OA-10` IN check-links.js AS THE EXAMPLE,
   * and that entry is gone — KNOWN_UNPORTED has been an empty Map since A-57 on
   * 2026-08-04, when the last four unported routes shipped. The mechanism is
   * still there and still the right analogy; the instance is not, and a cross
   * reference to something a reader can no longer open is how a convention stops
   * being checkable. A second copy of the same dead citation sat in the output
   * block at the bottom of this file and is corrected there too.
   *
   * WHY THEY ARE HERE RATHER THAN FIXED. Other agents are editing
   * src/components/sections/**, src/styles/** and src/layouts/Article.astro,
   * and this gate's scope is the gate. Fixing them here would collide. Every one
   * is a single-line change and the list should be empty within a pass or two.
   *
   * NAV AND FOOTER CARRY FOUR OF THE TWENTY-TWO ENTRIES BETWEEN THEM — two of
   * the ten debts, both a type size below every tier, and two of the twelve
   * design decisions, both the 1440px chrome rail. That is not a coincidence:
   * both were ported from the legacy tree as page chrome, and neither was in
   * scope for any of the sweeps, which were measured across page CONTENT. The
   * chrome on every page of the site is the part of it furthest from the design
   * system.
   *
   * THIS PARAGRAPH SAID "nine of the fourteen entries" UNTIL 2026-08-04. Both
   * numbers were wrong in the same direction — the map holds 22 keys, not 14,
   * and Nav and Footer hold 4 of them, not 9 — which made the two files look
   * like two thirds of the problem when they are under a fifth of it. Counted
   * from the array rather than from memory, and both totals are printed on every
   * run as "N recorded exception(s)" and "N KNOWN DEBT", so this line can be
   * checked against the output rather than taken on trust.
   * ══════════════════════════════════════════════════════════════════════════ */
  ['token  src/components/nav/Nav.astro  font-size: 11px',
   'DEBT: the Cmd-K key cap. Below every tier; needs a control token or --t-micro'],
  ['token  src/components/footer/Footer.astro  font-size: 10px',
   'DEBT: the "free" chip. The smallest type on the site and the only 10px on it'],
  ['token  src/components/sections/MarketShape.astro  font-size: clamp(3.5rem, 11vw, 7.5rem)',
   'DEBT: the market figure resized for the two-column breakpoint. The base rule correctly uses --t-numeral; only this responsive override restates a clamp, which is how a scale grows a second opinion about itself. MarketShape.astro is being edited by another agent'],

  ['token  src/components/forms/NewsletterForm.astro  max-width: 520px',
   'DEBT: a container width off the --measure scale. tokens.css records 720, 760, 820, 860, 880, 900 and 960px found hardcoded across the reviewable routes as the defect --measure-mid, --measure-band and --measure-prose were added to end. This is that defect, one page at a time'],
  ['token  src/pages/faq.astro  max-width: 460px',
   'DEBT: the FAQ search field. Off the --measure scale'],
  ['token  src/pages/tools/ppn-002-calculator/index.astro  max-width: 560px',
   'DEBT: the calculator input column. Off the --measure scale'],

  /* The /crowmark-buyers entry that used to sit here is DELETED, not reworded.
     The owner decided on 2026-08-03 that AT RISK is a fourth mark, --c-amber
     landed in styles/tokens.css with its contrast measured against all four
     surface steps, and the band now takes the token.

     The /tools entry that was the other half of that debt is now DELETED too
     (2026-08-04). The calculator's "below the floor" tag takes var(--c-amber),
     the file is no longer outside anybody's scope, and the deletion had a
     consequence worth recording: making --c-amber a token that carries text
     tripped rule 8, because it was missing from the light scope in
     Article.astro and resolved there at 1.71:1. Paying a debt is what found the
     trap underneath it. */

  /* ── GRADIENT DEBT: NONE ─────────────────────────────────────────────────
   *
   * NO GRADIENT IS RECORDED AS DEBT, because none is outstanding. This block
   * described "seventeen entries, sixteen of them in three files another agent
   * is editing right now", named the three files, and called crowmark.astro
   * "the worst file on the site for this, with 14 gradients". No such entries
   * were ever added — see the note in the rule 7 section above for how the
   * amended rule made them unnecessary — so the three files were carrying a
   * public accusation this file could not substantiate, and the "list can only
   * shrink" discipline was being claimed for a list with nothing in it.
   *
   * WHAT SURVIVES IS THE DIAGNOSIS, WHICH WAS ALWAYS THE USEFUL PART.
   * crowmark.astro is the newest large page, it was written while the token
   * block held five gradients, and it needed nine. There was nothing to reach
   * for, so it wrote its own — which is not carelessness, it is the predictable
   * output of a system with a gap in it. tokens.css closed the gap by taking the
   * count to nine plus the orbs, and rule 7 is what stops a tenth being invented
   * one component at a time. */
]);

/* ══════════════════════════════════════════════════════════════════════════
 * READING THE SOURCE
 * ══════════════════════════════════════════════════════════════════════════ */

const VOID_TAGS = new Set(
  'area base br col embed hr img input link meta param source track wbr'.split(' ')
);

/** Elements whose own alignment is their meaning. See surfaces.css. */
const STRUCTURAL_TAGS = new Set([
  'ul', 'ol', 'dl', 'table', 'form', 'fieldset', 'pre', 'details',
  // reached only via the text-align scan below, where a selector can name a
  // cell or a caption directly rather than the container that holds it
  'li', 'dt', 'dd', 'th', 'td', 'tr', 'caption', 'figcaption', 'code', 'label',
  'input', 'select', 'textarea', 'summary', 'legend',
]);

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
 * A forgiving tag scanner over shipped HTML.
 *
 * Not a parser. It needs three things and no more: what tag an element is, what
 * classes it carries, and which elements are inside which. A stack over the tag
 * stream gives all three, and an unbalanced tag degrades to a wider range rather
 * than to a crash — which is the right failure direction for a build gate.
 *
 * <script> is blanked first for the same reason check-content-parity.js blanks
 * it: markup built inside a template string is not markup on the page, and
 * counting it would make this demand things that never rendered.
 */
function parseHtml(html) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, (m) => ' '.repeat(m.length))
    .replace(/<!--[\s\S]*?-->/g, (m) => ' '.repeat(m.length));
  const nodes = [];
  const stack = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(clean))) {
    const tag = m[2].toLowerCase();
    if (m[1] === '/') {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (nodes[stack[i]].tag === tag) {
          nodes[stack[i]].end = m.index;
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const attrs = m[3] || '';
    nodes.push({
      tag,
      cls: ((attrs.match(/\bclass="([^"]*)"/) || attrs.match(/\bclass='([^']*)'/) || [])[1] || '')
        .split(/\s+/)
        .filter(Boolean),
      style: (attrs.match(/\bstyle="([^"]*)"/) || [])[1] || '',
      start: m.index,
      end: m.index + m[0].length,
    });
    if (!VOID_TAGS.has(tag) && m[4] !== '/') stack.push(nodes.length - 1);
  }
  for (const i of stack) nodes[i].end = clean.length;
  return nodes;
}

function routes(dir, base = '', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) routes(path.join(dir, e.name), `${base}/${e.name}`, out);
    else if (e.name === 'index.html') out.push(base === '' ? '/' : `${base}/`);
  }
  return out;
}

/**
 * Every CSS rule in the project's own stylesheets, as {file, line, selector,
 * declarations}.
 *
 * The regex matches INNERMOST blocks only, because the declaration body cannot
 * contain a brace. That is what makes it correct inside @media and @supports
 * without needing to understand either: the wrapper is skipped and the rule it
 * wraps is matched on its own. It also means a media-query CONDITION never
 * reaches the declaration scan, which matters for the max-width rule below —
 * `@media (max-width: 900px)` is a breakpoint, not a container width, and an
 * earlier version of this file reported 38 of them as violations.
 */
function cssRules() {
  const out = [];
  const files = walk(SRC).filter((f) => /\.(css|astro)$/.test(f)).sort();

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const blocks = [];

    if (file.endsWith('.css')) {
      blocks.push({ text: raw, offset: 0 });
    } else {
      /* Astro frontmatter is JavaScript and can hold anything, including the
         string "<style>". Cut it before looking for style blocks. */
      const fm = raw.startsWith('---') ? raw.indexOf('\n---', 3) : -1;
      const body = fm > 0 ? raw.slice(fm) : raw;
      const base = fm > 0 ? fm : 0;
      for (const m of body.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
        blocks.push({ text: m[1], offset: base + m.index + m[0].indexOf(m[1]) });
      }
    }

    for (const b of blocks) {
      /* Comments are blanked, not removed, so every index still maps back to a
         real line number in the file a person has to open. */
      const text = b.text.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
      const re = /([^{}@]+)\{([^{}]*)\}/g;
      let m;
      while ((m = re.exec(text))) {
        const selector = m[1].trim().replace(/\s+/g, ' ');
        if (!selector || selector.startsWith('@')) continue;
        out.push({
          file: rel(file),
          line: raw.slice(0, b.offset + m.index).split('\n').length,
          selector,
          decls: m[2],
          classes: [...selector.matchAll(/\.([a-zA-Z_][\w-]*)/g)].map((x) => x[1]),
        });
      }
    }
  }
  return out;
}

const decl = (decls, prop) =>
  ((decls.match(new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;}]+)`)) || [])[1] || '').trim();

/* ══════════════════════════════════════════════════════════════════════════
 * FACTS FROM THE SHIPPED HTML
 * ══════════════════════════════════════════════════════════════════════════ */

if (!fs.existsSync(DIST)) {
  console.error('design-system: no dist/ to check. Run the build first.');
  process.exit(1);
}

const routeList = routes(DIST).sort();
const violations = [];   // not recorded -> failure
const recorded = [];     // on the list -> printed, never fatal
const seenKeys = new Set();
const counts = { align: 0, type: 0, card: 0, token: 0, heading: 0, icon: 0, gradient: 0 };

function report(rule, where, what, detail) {
  counts[rule]++;
  const key = `${rule}  ${where}  ${what}`;
  const why = ALLOWED.get(key.toLowerCase()) ?? ALLOWED.get(key);
  if (why !== undefined) {
    seenKeys.add(key.toLowerCase());
    recorded.push({ rule, where, what, why });
    return;
  }
  violations.push({ rule, where, what, detail, key });
}

/*
 * Two indexes built in one pass over the shipped HTML, because every markup
 * rule below needs one or the other and the pages are only worth reading once.
 *
 *   insideSurface   class -> the routes where it sits on, or inside, a `.surface`
 *   tagsForClass    class -> every tag it is ever written on
 *
 * The second is what keeps the alignment rule honest. surfaces.css excludes
 * lists, tables, forms, code and disclosures from centring STRUCTURALLY, so a
 * `text-align: left` on a table cell inside a card is the system working, not a
 * violation of it. Knowing what tag a class lands on is the cheapest way to tell
 * that apart from a card whose prose has been pushed left by hand.
 */
const insideSurface = new Map();
const tagsForClass = new Map();
let surfacesTotal = 0;
let surfacesCentred = 0;
const structuralSurfaces = new Map(); // route -> count

for (const route of routeList) {
  const file = path.join(DIST, route === '/' ? 'index.html' : route.slice(1) + 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const nodes = parseHtml(html);

  for (const n of nodes) {
    for (const c of n.cls) {
      if (!tagsForClass.has(c)) tagsForClass.set(c, new Set());
      tagsForClass.get(c).add(n.tag);
    }
  }

  /* ── RULE 5: one <h1>, no skipped levels ───────────────────────────────
   *
   * Asserted here as well as in tests/heading-structure.spec.js. A heading
   * outline is how a screen-reader user navigates a page they cannot scan, and
   * a skipped level tells them a section is missing. It costs nothing to check
   * in the build, and a check that only runs when somebody remembers to run the
   * suite is a check that reports a defect after it shipped. */
  const levels = nodes.filter((n) => /^h[1-6]$/.test(n.tag)).map((n) => +n.tag[1]);
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s !== 1) {
    report('heading', route, `${h1s} <h1> elements`,
      h1s === 0 ? 'a page with no h1 has no title in the outline' : 'two h1s make two documents');
  }
  let prev = 0;
  for (const l of levels) {
    if (prev && l > prev + 1) {
      report('heading', route, `h${prev} jumps to h${l}`, 'a skipped level reads as a missing section');
    }
    prev = l;
  }

  /* ── RULE 1: alignment, from the markup ────────────────────────────────
   *
   * A `.surface` centres its content unless it holds something structural. That
   * escape is legitimate, automatic, documented in surfaces.css, and counted and
   * printed below — it is the widest door in this rule, so the number moving is
   * the only warning anybody gets.
   *
   * THE SECOND ESCAPE THIS COMMENT DESCRIBED IS GONE, AND SO IS ITS CODE. It
   * read "unless it carries `surface--read` or holds something structural", and
   * a branch below collected every card carrying that class into `surfaceGroups`
   * so each group could be reported against a human reason on the allow-list.
   * The owner retired the class on 2026-08-03 — surfaces.css records the
   * reversal, the sixteen allow-list entries that served it were deleted at the
   * top of this file, and no element in dist/ carries it. The branch had been
   * unreachable since, and the comment was still offering it as one of two ways
   * a card may keep its left edge. Deleted rather than annotated: dead code in a
   * gate reads as a live hole to whoever is deciding whether to trust it. */
  nodes.forEach((n, i) => {
    if (!n.cls.includes('surface')) return;
    surfacesTotal++;

    const signature = n.cls.filter((c) => !c.startsWith('astro-')).join('.');

    for (let j = i; j < nodes.length && nodes[j].start < n.end; j++) {
      for (const c of nodes[j].cls) {
        if (!insideSurface.has(c)) insideSurface.set(c, new Set());
        insideSurface.get(c).add(route);
      }
      /* An inline text-align beats every stylesheet and every layer, so it is
         the one way to left-align a card that no CSS scan can see. */
      if (/text-align\s*:\s*(left|start)/i.test(nodes[j].style)) {
        report('align', route, `inline style on .${signature}`,
          'an inline text-align outranks the cascade entirely');
      }
    }

    for (let j = i + 1; j < nodes.length && nodes[j].start < n.end; j++) {
      if (STRUCTURAL_TAGS.has(nodes[j].tag)) {
        structuralSurfaces.set(route, (structuralSurfaces.get(route) || 0) + 1);
        return;
      }
    }
    surfacesCentred++;
  });
}

/* ══════════════════════════════════════════════════════════════════════════
 * FACTS FROM THE STYLESHEETS
 * ══════════════════════════════════════════════════════════════════════════ */

const rules = cssRules();

/* Every class named in surfaces.css is part of the one card system by
   definition: that file IS the card system, including the SLOTTED CARDS block
   for markup authored in markdown that cannot be given a class from here.
   Derived rather than hardcoded so the list cannot fall out of step with the
   stylesheet it describes. */
const cardSystemClasses = new Set(
  rules.filter((r) => r.file.endsWith('styles/surfaces.css')).flatMap((r) => r.classes)
);

/*
 * Every custom property tokens.css defines. Used by the colour rule below to
 * tell a REBINDING of a system token from a colour somebody invented.
 *
 * WHY THAT DISTINCTION EXISTS, and it was found by this check catching real
 * work in flight rather than by reasoning about it. Article.astro's light
 * reading pane sets `--c-bg: #f5f6fa`, `--c-text: #0b0e19` and four more on one
 * element, with contrast measured against each. That is not six hardcoded
 * colours, it is the palette re-scoped: brand --c-teal measures 1.6:1 on a light
 * pane and is unreadable, so the pane rebinds the same NAMES to light values and
 * every component inside it inherits them without being edited. Rejecting that
 * would push the light theme into a second set of rules, which is the thing the
 * token system exists to prevent.
 *
 * What is still rejected is a NEW custom property holding a literal colour,
 * because that is a colour outside the system wearing a name. You may re-scope
 * the palette; you may not invent a member of it.
 */
const tokenNames = new Set(
  (fs.existsSync(path.join(SRC, 'styles/tokens.css'))
    ? fs.readFileSync(path.join(SRC, 'styles/tokens.css'), 'utf8')
    : ''
  )
    .match(/^\s*(--[\w-]+)\s*:/gm)
    ?.map((s) => s.trim().replace(/\s*:$/, '')) || []
);

/** Classes ever written on a heading element in the shipped HTML. */
const headingClasses = new Set();
for (const [cls, tags] of tagsForClass) {
  for (const t of tags) if (/^h[1-6]$/.test(t)) headingClasses.add(cls);
}

/** Does a value contain a length of 12px or more? The card-versus-chip line. */
function hasCardScaleLength(value) {
  for (const m of value.matchAll(/(\d+(?:\.\d+)?)(px|rem|em)/g)) {
    if (+m[1] * (m[2] === 'px' ? 1 : 16) >= 12) return true;
  }
  return false;
}

/* ── RULE 8: A LIGHT SCOPE IS A LIST, AND LISTS FALL BEHIND ─────────────────
 *
 * `.art__pane` on blog articles rebinds the palette so dark-surface values
 * cannot leak onto a light one. It is a LIST, so any token added to :root after
 * it was written is missing from it by default — silently, and only visible to
 * whoever next writes `color: var(--the-new-one)` inside the pane.
 *
 * That is not hypothetical. `--c-interactive` was created on 2026-08-03 and was
 * absent here the same day; unbound it resolved to cyan at 1.67:1 on #F5F6FA.
 * Checking the whole set then found FOUR MORE — orchid, violet, pink and
 * teal-dark, all between 1.96:1 and 2.52:1.
 *
 * The rule: every `--c-*` token used as a `color:` value ANYWHERE in src must be
 * rebound inside the light scope. It deliberately does not check the rebound
 * VALUE, because contrast against a scoped background is a rendered question and
 * check-render.js owns those. This asserts only that the list is complete.
 */
function lightScopeTokens(rules) {
  /* `decls` is a raw declaration STRING, not an array. Reading it as objects
     returned an empty set silently and rule 8 then flagged every token, which
     is the loudest possible way for a helper to be wrong and still the kind
     that only shows up when you look at the output. */
  const out = new Set();
  for (const r of rules) {
    if (!/\.art__pane/.test(r.selector)) continue;
    for (const m of String(r.decls).matchAll(/(--c-[a-z0-9-]+)\s*:/gi)) out.add(m[1]);
  }
  return out;
}

/* Every `hN.class { font-size: var(--t-hN) }` in the tree: a level-correct,
 * tag-qualified override of a class rule elsewhere in the same file. Collected
 * before the main pass because rule 2b needs to know about a rule that may
 * appear AFTER the one it is judging. */
const levelOverride = new Set();
for (const r of rules) {
  const m = r.selector.trim().toLowerCase().match(/^h([1-6])\.([\w-]+)$/);
  if (!m) continue;
  const sz = decl(r.decls, 'font-size') || '';
  const t = (sz.match(/var\(\s*--t-(h[1-4])\s*\)/) || [])[1];
  const lv = 'h' + Math.min(4, +m[1]);
  if (t !== lv) continue;
  /* ── WHERE THE OVERRIDE LIVES DECIDES HOW FAR IT REACHES ──────────────────
   *
   * Corrected 2026-08-03. The key was ALWAYS `${r.file}|…`, which silently
   * assumed every override sits in the same file as the class rule it
   * corrects. That held only while all of this was component-scoped, and it
   * broke the moment a treatment was hoisted into a shared stylesheet: the
   * page-heading rules moved from Section.astro's scoped block into
   * styles/headings.css, and this gate then reported Section.astro's
   * `.section__title { --t-h2 }` as an h1 sized a tier low — while the h1 rule
   * that fixes it sat in headings.css being ignored.
   *
   * The distinction the rule actually needs is not "same file", it is SCOPE:
   *
   *   a .css file  — imported globally in Base.astro, applies to every
   *                  component, so its override reaches everywhere.
   *   an .astro file — Astro rewrites the selector with a per-component hash,
   *                  so its override CANNOT reach another component and must
   *                  stay keyed to its own file.
   *
   * Widening this to a plain global set would have been the easy fix and it
   * would have put a hole in the rule: a tag-qualified override written inside
   * one component would start excusing an identically-named class in every
   * other component, which is exactly the cross-file leak the gate exists to
   * catch. */
  const global = /\.css$/i.test(r.file);
  levelOverride.add(`${global ? '*' : r.file}|${lv}|${m[2]}`);
}

/* Rule 8's two sets, both collected before the main pass. */
const lightScope = lightScopeTokens(rules);
const textCapable = new Set();
for (const r of rules) {
  for (const m of String(r.decls).matchAll(/(?:^|[;{\s])color\s*:\s*var\((--c-[a-z0-9-]+)\)/gi)) {
    textCapable.add(m[1]);
  }
}
for (const t of textCapable) {
  if (!lightScope.has(t)) {
    report('token', 'src/layouts/Article.astro', '.art__pane',
      `${t} carries text somewhere in src but is not rebound in the light scope`);
  }
}

for (const r of rules) {
  const selLower = r.selector.toLowerCase();
  const isTokenBlock = /(^|[\s,])(:root|html)\b/.test(selLower);

  /* ── RULE 1: alignment, from the stylesheets ───────────────────────────
   *
   * A rule that pushes card content back to the left. Skipped when the class
   * lands on a structural element anywhere in the build, because surfaces.css
   * already excludes those from centring on purpose and re-reporting them here
   * would be this gate arguing with the design system it enforces. */
  const align = decl(r.decls, 'text-align');
  if (/^(left|start)$/.test(align)) {
    const inCard = r.classes.filter((c) => insideSurface.has(c));
    const structural =
      /(^|[\s,>+~])(ul|ol|dl|li|dt|dd|table|thead|tbody|tr|th|td|caption|form|fieldset|legend|label|input|select|textarea|pre|code|details|summary|figcaption)\b/.test(
        selLower
      ) || r.classes.some((c) => [...(tagsForClass.get(c) || [])].some((t) => STRUCTURAL_TAGS.has(t)));

    if (inCard.length && !structural) {
      report('align', r.file, r.selector,
        `text-align: ${align} on content inside a .surface (${[...insideSurface.get(inCard[0])].join(', ')}), line ${r.line}`);
    }
  }

  /* ── RULE 2: the type scale ────────────────────────────────────────────
   *
   * Four sizes, one weight per tier, all from tokens.css. The audit that got
   * heading recipes from 15 to 6 found the cause was never a rogue page: prose
   * ran one tier below its tag in five separate files, so two different h2
   * sizes could sit on one page with every file looking reasonable on its own.
   * The only property that stops that returning is that a heading's size is
   * never a number written next to the heading. */
  const size = decl(r.decls, 'font-size');
  if (size) {
    const targetsHeading =
      /(^|[\s,>+~(])h[1-6]\b/.test(selLower) || r.classes.some((c) => headingClasses.has(c));
    if (targetsHeading && !/var\(\s*--t-(h1|h2|h3|h4|stat)\s*\)/.test(size)) {
      report('type', r.file, r.selector, `heading sized ${size}, which is not one of the four tiers (line ${r.line})`);
    }

    /* ── RULE 2b: the tier has to belong to the level ──────────────────────
     *
     * Rule 2 above checks that a heading's size comes FROM a token. It never
     * checked that the token matches the heading's LEVEL, so `h2 { font-size:
     * var(--t-h4) }` passed cleanly. The owner found this the way they find
     * everything: /pricing rendered an h3 at 20.9px while / and the blog
     * rendered one at 32.8px, and the gate reported both as correct.
     *
     * This is the same shape as the two other blind spots found this week. The
     * alignment rule read declarations when the defect was geometry. The button
     * investigation measured height when the difference was width. Here the
     * rule asked "is it a token" when the question was "is it the RIGHT token".
     * The rule was never weak; it was answering a neighbouring question.
     *
     * ONE TIER DOWN IS ALLOWED, AND THAT IS NOT A LOOPHOLE. tokens.css
     * documents --t-h3 as "a heading inside a section" and --t-h4 as "a heading
     * inside a card": the tokens are NAMED by level and DEFINED by context, so
     * an h3 sized --t-h4 inside a card is the documented convention and there
     * are 26 of them. Failing those would be the gate arguing with the design
     * system it enforces.
     *
     * TWO TIERS DOWN IS NEVER DEFENSIBLE. An h2 at --t-h4 renders at 21.6px on
     * routes that also render a Section h2 at 46.4px — the same element, the
     * same page, two sizes. That is exactly the 63-heading defect prose.css
     * fixed on 2026-08-02, still alive in four other files.
     *
     * AND AN h1 IS ALWAYS --t-h1. It is the page's one title; there is no
     * context in which it is something else. */
    const TIER = { h1: 1, h2: 2, h3: 3, h4: 4 };
    const tier = (size.match(/var\(\s*--t-(h[1-4])\s*\)/) || [])[1];
    if (tier) {
      const levels = new Set();
      const direct = selLower.match(/(^|[\s,>+~(])h([1-6])\b/);
      if (direct) levels.add('h' + Math.min(4, +direct[2]));
      for (const c of r.classes) {
        for (const t of tagsForClass.get(c) || []) {
          if (/^h[1-6]$/.test(t)) levels.add('h' + Math.min(4, +t[1]));
        }
      }
      for (const lv of levels) {
        /* A TAG-QUALIFIED OVERRIDE IN THE SAME FILE IS THE FIX, NOT A
         * VIOLATION. Section.astro sizes `.section__title` at --t-h2 for the
         * common case and then `h1.section__title` at --t-h1 for the page
         * title, which is correct and is how the "hero headings were two
         * different sizes" defect was closed on 2026-08-02. Reporting it would
         * have the gate arguing with its own fix, and an allow-list entry would
         * record a non-defect as debt forever. */
        /* Its own file first, then the global stylesheets. See the collector
           above for why those are two different reaches rather than one set. */
        if (
          r.classes.some(
            (c) => levelOverride.has(`${r.file}|${lv}|${c}`) || levelOverride.has(`*|${lv}|${c}`),
          )
        )
          continue;
        const gap = TIER[tier] - TIER[lv];
        if (gap >= 2 || (lv === 'h1' && tier !== 'h1')) {
          report('type', r.file, r.selector,
            `<${lv}> sized --t-${tier}, ${gap} tier(s) below its level (line ${r.line})`);
        }
      }
    }
  }

  /* ── RULE 3: one card recipe ───────────────────────────────────────────
   *
   * A card is a bordered, padded block at card scale. The scale is what
   * separates it from a chip: --radius-chip is 10px and --radius-pill is 100px,
   * so `.rt__drop-box` and `.in__chip` — the two known legitimate chips — are
   * outside this test by construction rather than by exemption. Anything at
   * card scale must be reached through `.surface`, and must use --radius-card
   * and --blk-pad, because 21 recipes is what happens when each card states its
   * own numbers. */
  const radius = decl(r.decls, 'border-radius');
  const padding = decl(r.decls, 'padding');
  const paints = /(?:^|[;{\s])(border|background|box-shadow)\s*:/.test(r.decls);
  if (radius && padding && paints) {
    const cardRadius = /--radius-(card|panel)/.test(radius) || (!radius.includes('var(') && hasCardScaleLength(radius));
    const cardPadding = /--blk-pad/.test(padding) || (!padding.includes('var(') && hasCardScaleLength(padding));

    if (cardRadius && cardPadding) {
      const faults = [];
      if (!r.classes.some((c) => cardSystemClasses.has(c) || insideSurface.has(c))) {
        faults.push('not reached through .surface');
      }
      if (!/--radius-(card|panel)/.test(radius)) faults.push(`radius ${radius} is not --radius-card`);
      if (!/--blk-pad/.test(padding)) faults.push(`padding ${padding} is not --blk-pad`);
      if (faults.length) report('card', r.file, r.selector, `${faults.join('; ')} (line ${r.line})`);
    }
  }

  /* ── RULE 4: tokens ────────────────────────────────────────────────────
   *
   * A hex outside the token block is a colour that is not in the system. A
   * font-size in px is a fifth type size. A max-width in px is the defect
   * tokens.css was written to end, reintroduced one page at a time: the audit
   * found 720, 760, 820, 860, 880, 900 and 960px hardcoded as container widths
   * across the reviewable routes, which is why --measure has fractional steps.
   *
   * :root and html are exempt because that is where tokens are DEFINED. Nothing
   * else is. */
  if (!isTokenBlock) {
    /*
     * A COLOUR INSIDE A MASK IS NOT A COLOUR, and the first run of this check
     * got that wrong on two files. `mask: linear-gradient(#000 0 0)` is the
     * standard mask-composite idiom: only the ALPHA channel of a mask is read,
     * so the #000 is the number 1 written in the only syntax the property
     * accepts. It is never painted, it cannot be tokenised, and reporting it
     * would push somebody to replace it with a brand colour that behaves
     * identically and reads as though it meant something.
     *
     * Deduplicated per rule, because one masked edge writes the same #000 four
     * times across two vendor-prefixed declarations and four identical lines of
     * output is four chances to stop reading them.
     */
    const seenHex = new Set();
    for (const d of r.decls.matchAll(/([-\w]+)\s*:\s*([^;}]+)/g)) {
      if (/mask/i.test(d[1])) continue;
      if (d[1].startsWith('--') && tokenNames.has(d[1])) continue; // a rebinding, see tokenNames
      for (const m of d[2].matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        if (seenHex.has(m[0])) continue;
        seenHex.add(m[0]);
        report('token', r.file, `hardcoded colour ${m[0]}`, `${r.selector}, line ${r.line}`);
      }
    }
    if (size && !size.includes('var(') && /\d\s*(px|rem|em|pt)/.test(size)) {
      report('token', r.file, `font-size: ${size}`, `${r.selector}, line ${r.line}`);
    }
    const maxw = decl(r.decls, 'max-width');
    if (maxw && !maxw.includes('var(') && /\d+(\.\d+)?px/.test(maxw)) {
      report('token', r.file, `max-width: ${maxw}`, `${r.selector}, line ${r.line}`);
    }
  }

  /* ── RULE 6: an icon slot is one size ──────────────────────────────────
   *
   * WRITTEN BECAUSE A DEFECT SHIPPED THROUGH THE GAP THIS RULE CLOSES.
   *
   * The integrations chips each carry a logo in an 18px slot. One source has no
   * logo file, so a placeholder dot was drawn instead, and the placeholder
   * OVERRODE the slot to 8px and re-centred itself with a 5px inline margin.
   * Measured, it was centred: the dot sat on exactly the same axis as every
   * logo, top gap equal to bottom gap. The owner still reported it as
   * misaligned, and they were right. A row of six icons is judged on optical
   * mass, not on box centres, and one icon carrying less than a fifth of the
   * area of its neighbours breaks the row however well it is positioned.
   *
   * Nothing caught it. Rule 3 exempts chips by construction, because their
   * radius is below the card threshold, and that exemption is exactly where the
   * defect lived. An exception in a gate is not a neutral act: it is a place
   * the gate has agreed not to look.
   *
   * So: a modifier that narrows an icon class must not change its box. Change
   * what is painted inside the slot instead. This is a source-level check like
   * the rest of the CSS pass, so it catches the pattern rather than the pixel,
   * which is what stops it recurring in a component nobody has written yet. */
  /* ── RULE 7: a gradient comes from a token ─────────────────────────────
   *
   * WHY IT EXISTS. Owner, 2026-08-03: "this gradient is another example of bad
   * design, you must fix this and must be managed centrally." Counted rather
   * than argued about: 104 gradient functions in src/**, six of them in
   * tokens.css and 98 written inline. Five tokens against 98 local opinions is
   * not a system with exceptions, it is 98 systems, which is precisely why
   * fixing one gradient never fixed the next one.
   *
   * The 98 were read and grouped by what they DO, and they turned out to be
   * nine recipes plus masks. tokens.css now carries the nine. This rule is what
   * stops a tenth being invented one component at a time, which is the same
   * mechanism that took heading recipes to 15 and card recipes to 21.
   *
   * A MASK IS NOT A COLOUR, and this is the same carve-out rule 4 already
   * makes for `mask: linear-gradient(#000 0 0)`. Only the ALPHA channel of a
   * mask is read, so the colour in one is the number 1 written in the only
   * syntax the property accepts. It is never painted, it cannot be tokenised,
   * and demanding a token here would push somebody to write a brand colour that
   * behaves identically and reads as though it meant something. 24 of the 104
   * are masks and every one of them is correct as written.
   *
   * IT IS A TEXT TEST, LIKE THE REST OF THIS PASS. `var(--grad-ramp)` contains
   * no `gradient(`, so the rule is simply: a literal gradient function in a
   * non-mask declaration outside the token block. That means it cannot tell a
   * good local gradient from a bad one — which is the point. The allow-list is
   * where that argument gets made, in a sentence, by a person. */
  if (!isTokenBlock) {
    const seenGrad = new Set();
    for (const d of r.decls.matchAll(/([-\w]+)\s*:\s*([^;}]+)/g)) {
      if (/mask/i.test(d[1])) continue;
      for (const m of d[2].matchAll(/(repeating-)?(linear|radial|conic)-gradient\(/g)) {
        const kind = `${m[1] || ''}${m[2]}-gradient`;
        if (seenGrad.has(kind)) continue;
        seenGrad.add(kind);
        /* ── AMENDED 2026-08-03: THE RULE ASKS FOR THE WRONG THING ──────────
         *
         * It required a gradient to come from a --grad-* token. That mechanism
         * cannot work for any gradient that needs per-element values. A custom
         * property's var()s are substituted where the property is DECLARED, so
         * a knob token on :root bakes in its fallbacks and inherits finished:
         * --grad-ramp computes to `linear-gradient(180deg, #161B2F, #0E1220
         * 100%)` on every element regardless of the knobs it sets. That hid
         * every blog hero photograph behind an opaque rectangle, and six more
         * elements were painting surface grey instead of their intended tints.
         *
         * The rule's PURPOSE was never the token — it was: no hardcoded colour,
         * one place to change the palette. So that is what it asserts now. A
         * gradient written at the point of use passes if every colour in it
         * resolves from a var(), and fails the moment a literal hex or rgb()
         * appears. That is checkable, it is what actually matters, and unlike
         * the old rule it does not demand a construction that silently produces
         * the wrong pixels. */
        const literalColour = /#[0-9a-f]{3,8}|rgba?\(|hsla?\(/i;
        const gradientBody = d[2].slice(m.index);
        if (!literalColour.test(gradientBody)) continue;
        report('gradient', r.file, r.selector,
          `${kind}() contains a literal colour rather than a token (${d[1]}, line ${r.line})`);
      }
    }
  }

  const ICON = /(logo|icon|mark|glyph|avatar)\b/i;
  if (ICON.test(r.selector) && /--|\.\w+\.\w+/.test(r.selector)) {
    const w = decl(r.decls, 'width');
    const h = decl(r.decls, 'height');
    for (const [prop, val] of [['width', w], ['height', h]]) {
      if (val && /^\d+(\.\d+)?(px|rem)$/.test(val.trim())) {
        report(
          'icon',
          r.file,
          `${r.selector} resizes its slot (${prop}: ${val.trim()})`,
          `a modifier on an icon class must paint inside the slot, not shrink it, or the row reads uneven even when every box is centred. Line ${r.line}`
        );
      }
    }
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * OUTPUT
 * ══════════════════════════════════════════════════════════════════════════ */

const structuralTotal = [...structuralSurfaces.values()].reduce((a, b) => a + b, 0);

console.log(
  `design-system: ${routeList.length} route(s), ${rules.length} rule(s) in ${
    new Set(rules.map((r) => r.file)).size
  } stylesheet(s)`
);
console.log(
  `  cards: ${surfacesTotal} .surface, ${surfacesCentred} centred, ${structuralTotal} holding a list, table, form, code or disclosure`
);
/* Printed rather than counted silently. The structural exclusion is automatic
   and correct, and it is also the widest door in the alignment rule: a card
   that gains a <ul> stops centring without anybody deciding that it should. The
   number moving is the only warning of that anyone will get. */
if (structuralTotal) {
  const worst = [...structuralSurfaces].sort((a, b) => b[1] - a[1]).slice(0, 5);
  console.log(
    `         structural exclusions are automatic (surfaces.css): ${worst
      .map(([r, n]) => `${r} ${n}`)
      .join(', ')}${structuralSurfaces.size > 5 ? ', ...' : ''}`
  );
}

if (recorded.length) {
  /* Never silent, for the same reason check-links.js prints its tracked set and
     check-content-parity.js prints its allowed losses: an exception nobody
     re-reads is indistinguishable from a defect nobody noticed.
   *
   * SPLIT INTO TWO KINDS, because they are two different things and a list that
   * mixes them teaches the reader that everything on it is fine.
   *
   * THIS CITED check-links.js AS CARRYING BOTH KINDS WITHOUT NAMING THE
   * DISTINCTION — "`/cookie-preferences` is a decision and `/integrations OA-10`
   * is a defect waiting on the owner". Its KNOWN_UNPORTED map has been empty
   * since A-57 on 2026-08-04; both routes shipped and both entries were deleted,
   * which is the contract that list is under. The observation was true when it
   * was written and is now a pointer at two things a reader cannot open, so the
   * split below is argued on its own terms instead. Recorded rather than cut,
   * because it is the second dead citation of the same map in this file and the
   * pattern is the point: a cross-reference to another gate's allow-list ages
   * out the moment that gate does its job.
   *
   *   DESIGN   this is right, and here is the argument
   *   DEBT     this is wrong, it is named, and it is not being fixed today
   *
   * The debt count is printed on its own line so it is the number somebody
   * watches. Debt that is never counted is debt that is never paid. */
  const isDebt = (x) => /^debt:/i.test(x.why.trim());
  /* Collapsed by key. One entry can be matched by several rules — the footer
     writes 0.8125rem twice, at two selectors — and printing the same reason
     twice trains the reader to skim, which is the one thing this block cannot
     afford. The occurrence count is kept because 1 and 7 are different sizes of
     the same problem. */
  const byKey = new Map();
  for (const x of recorded) {
    const k = `${x.rule}  ${x.where}  ${x.what}`;
    if (!byKey.has(k)) byKey.set(k, { ...x, n: 0 });
    byKey.get(k).n++;
  }
  const unique = [...byKey.values()];
  const design = unique.filter((x) => !isDebt(x));
  const debt = unique.filter(isDebt);
  const order = ['align', 'type', 'card', 'token', 'heading', 'icon', 'gradient'];
  const print = (list) => {
    for (const rule of order) {
      for (const x of list.filter((y) => y.rule === rule)) {
        console.log(`    [${x.rule}] ${x.where}${x.n > 1 ? `  (x${x.n})` : ''}`);
        console.log(`            ${x.what}`);
        console.log(`            ${x.why}`);
      }
    }
  };
  if (design.length) {
    console.log(`\n  ${design.length} recorded exception(s), each with the argument for it:\n`);
    print(design);
  }
  if (debt.length) {
    console.log(`\n  ${debt.length} KNOWN DEBT — recorded, named, and still wrong:\n`);
    print(debt);
  }
}

/* An entry that matched nothing is a line that is no longer true, and a stale
   exemption is how the next real violation gets waved through. Reported, never
   fatal: failing a build because a defect was FIXED would be perverse. */
const stale = [...ALLOWED.keys()].filter((k) => !seenKeys.has(k.toLowerCase()));
if (stale.length) {
  console.log(`\n  ${stale.length} allow-list entr(ies) matched nothing — delete them, the exception is gone:`);
  for (const k of stale) console.log(`    ${k}`);
}

if (violations.length) {
  /* THE GRADIENT LINE STATED THE PRE-AMENDMENT RULE UNTIL 2026-08-04. It read
     "every gradient comes from a --grad-* or --orb-* token; a mask is exempt",
     which the rule stopped asking for hours after it was written and which the
     scan below has never tested — it tests for a literal colour. This is the
     text a developer sees at the moment their build fails, so it is the one
     place a superseded rule does the most harm: it sends them to hoist a
     one-off gradient into the token block, which the token block's own
     three-uses threshold says not to do, and which cannot work for a gradient
     that needs per-element values. */
  const label = {
    align: 'ALIGNMENT   a card is scanned, so its content centres; prose is read, so it stays left',
    type: 'TYPE SCALE  four heading sizes, one weight per tier, all from tokens.css',
    card: 'CARD RECIPE one card sitewide: --radius-card and --blk-pad, via .surface',
    token: 'TOKENS      no hardcoded colour, type size or container width outside the token block',
    heading: 'HEADINGS    one <h1> per route, no skipped levels',
    icon: 'ICON SLOT   a modifier paints inside the slot, it does not resize the box',
    gradient: 'GRADIENTS   every colour in a gradient resolves from a var(); a mask is exempt',
  };
  console.error(`\ndesign-system: ${violations.length} DESIGN SYSTEM VIOLATION(S), NOT RECORDED\n`);
  for (const rule of ['align', 'type', 'card', 'token', 'heading', 'icon', 'gradient']) {
    const group = violations.filter((v) => v.rule === rule);
    if (!group.length) continue;
    console.error(`  ${label[rule]}`);
    for (const v of group) {
      console.error(`    ${v.where}`);
      console.error(`        ${v.what}`);
      if (v.detail) console.error(`        ${v.detail}`);
    }
    console.error('');
  }
  console.error('  Fix it, or add the key below to ALLOWED in this file WITH THE REASON it is an');
  console.error('  exception. A reason is a sentence somebody can disagree with, not a restatement,');
  console.error('  and if the honest reason is "this is wrong and is not being fixed today", say');
  console.error('  that and start it with DEBT: so it is counted as debt rather than as design.');
  console.error('');
  for (const key of new Set(violations.map((v) => v.key))) console.error(`    ['${key}', '...'],`);
  console.error('');
  process.exit(1);
}

console.log(
  `\n  clean: every card, heading, colour, width and gradient on ${routeList.length} routes comes`
);
console.log('  from the token scale, or is named above with the reason it does not. Nothing is');
console.log('  unaccounted for.');
process.exit(0);
