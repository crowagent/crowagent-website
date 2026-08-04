/**
 * check-palette-roles.js — a component names a ROLE. Only tokens.css names a
 * COLOUR.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * Owner, 2026-08-04, on being told that applying the chosen palette variant
 * meant editing 202 references across 47 files:
 *
 *   "why cant we are not managing this centrally enforced by rule? it must be
 *    very quick, i think if we are not managing centrally then we are in issue"
 *
 * The cost proved the diagnosis. Applying V6 — four token values — should have
 * been a four-line edit and was a 363-reference sweep, because `--c-teal` is
 * named after a COLOUR and not after a JOB. A component writing `var(--c-teal)`
 * has hardcoded a hue; it merely did so through a variable, which LOOKS central
 * without being central. Nothing in the build could tell the difference, so
 * every palette decision the site has ever taken paid the same toll and the next
 * one would have paid it again.
 *
 * check-design-system.js rule 4 already forbids a hardcoded hex in a component.
 * THIS IS THE SAME MISTAKE AT ONE REMOVE: `#2DD4BF` and `var(--c-teal)` are both
 * "this element is teal", written at different distances from the palette. Rule
 * 4 catches the first. This catches the second, and between them a component can
 * only ever say what an element MEANS.
 *
 * ── THE RULE ────────────────────────────────────────────────────────────────
 *
 * A component or page stylesheet may not reference a HUE-NAMED colour token. It
 * references a ROLE token. Hue-named tokens may only be referenced inside
 * styles/tokens.css, which is where roles are bound to colours.
 *
 * "Hue-named" is derived from tokens.css rather than hardcoded here, so the list
 * cannot fall out of step with the file it describes: any `--c-*` token whose
 * name after the prefix is a colour word — teal, cyan, violet, orchid, pink,
 * amber, white — plus any suffixed variant of one (`--c-teal-dark`,
 * `--c-teal-glow`, `--c-violet-deep`). Everything else is a role or a surface
 * and is allowed everywhere: --c-bg, --c-floor, --c-raised, --c-lit, --c-panel,
 * --c-card, --c-border, --c-border-glow, --c-text*, --c-interactive*,
 * --c-verified*, --c-refused, --c-at-risk, --c-ambient-*, --c-numeral-far.
 *
 * IF A ROLE DOES NOT EXIST FOR A LEGITIMATE USE, CREATE ONE. Name it for what it
 * MEANS. That is the whole mechanism: an unnamed role gets filled by whatever is
 * nearest, and on this site the nearest thing was teal, 202 times.
 *
 * ── AND THE HALF THAT ACTUALLY PROTECTS THE PRODUCT ─────────────────────────
 *
 * The role layer alone would let a component write `var(--c-verified)` on a
 * hover and drift straight back to where it started, one component at a time,
 * which is exactly how this site accumulated its defects. So there is a second
 * rule, and it is the one the owner's V6 decision turns on:
 *
 *   A MARK MAY NOT APPEAR IN AN INTERACTIVE CONTEXT. --c-verified, --c-refused
 *   and --c-at-risk carry meaning; a hover, a focus ring, a link, an active or
 *   selected state and a control's fill or edge carry none. Teal on a focus ring
 *   does not mean the ring was verified, and once it can appear there, teal
 *   stops being evidence anywhere.
 *
 * An "interactive context" is read from the SELECTOR, which is the only place
 * the intent is written down: :hover, :focus, :focus-visible, :focus-within,
 * :active, :checked, :target, [aria-selected='true'], [aria-pressed='true'],
 * [aria-current], [aria-expanded='true'], [data-active='true'], and a selector
 * whose subject is an <a> or <button>.
 *
 * ── INTRODUCED, NOT MERELY RESTATED. THE PRECISION THAT AVOIDS AN ALLOW-LIST ─
 *
 * The first run of rule 2 raised three findings and all three were wrong, in
 * the same way: `.bs__station:hover .bs__cap`, `.rt__step:hover .rt__dot` and
 * `.rt__tally-row--refused:hover` each BRIGHTEN a mark the element already
 * carries at rest. Hovering a refused row does not make it refused; it was
 * refused before the pointer arrived, and the hover is turning up a light on a
 * fact that is already there.
 *
 * Three allow-list entries would have hidden that, and they would have been the
 * wrong shape of fix: the rule was imprecise, not over-strict, and an exception
 * is a place a gate has agreed not to look. So the rule is stated exactly:
 *
 *   AN INTERACTIVE STATE MAY NOT INTRODUCE A MARK. It may restate one the
 *   element's own resting rule already carries.
 *
 * Computed rather than judged: the subject of the interactive selector — its
 * last compound, with pseudo-classes and attribute tests stripped — is looked up
 * against every NON-interactive rule in the same file that names the SAME token.
 * If the mark is there at rest, the interactive rule is restating it. If it is
 * not, the state is painting meaning onto an interaction, which is the drift.
 *
 * The three findings above all resolve; the allow-list is empty, which is the
 * target state for any gate and is stated here so that a future entry has to
 * argue against a clean baseline rather than join a crowd.
 *
 * ── AND RULE 3, WHICH IS THE HOLE THE FIRST TWO LEFT ────────────────────────
 *
 * Everything above reads TOKEN REFERENCES. `var(--c-teal)` is caught; the hue
 * shelf is derived from tokens.css so it cannot fall behind; and rule 2 stops a
 * mark leaking onto a control. All of it is about the NAME of a colour.
 *
 * A colour written as a NUMBER has no name, so none of it applied.
 *
 * `layouts/Glossary.astro` shipped `background: rgba(45, 212, 191, 0.08)` and
 * `border: 1px solid rgba(45, 212, 191, 0.2)` on the glossary TL;DR box. That is
 * `--c-teal` — the exact value, on the exact shelf this file forbids by name —
 * written twice, in a layout, on three routes, and this gate printed PASS.
 * check-design-system.js rule 4 did not catch it either: rule 4 matches
 * `#[0-9a-f]{3,8}` and this was an rgb(). Two gates about colour, and between
 * them a blind spot exactly the shape of the thing they exist to prevent.
 *
 * So: A CHROMATIC COLOUR LITERAL MAY NOT APPEAR OUTSIDE tokens.css.
 *
 * CHROMATIC, AND THAT WORD IS THE WHOLE PRECISION OF THE RULE. `rgba(0, 0, 0,
 * 0.9)` under a drop-shadow, `rgba(255, 255, 255, 0.14)` on an inset hairline
 * and `rgb(0 0 0)` inside a mask are not palette decisions: they are ink and
 * light, they mean the same thing under every palette this site could ever
 * adopt, and a palette change does not need to reach them. There are 24 of them
 * in this tree and every one is correct as written. A literal with a HUE is the
 * opposite: it is a decision about what colour this site is, taken somewhere
 * the next palette change cannot see.
 *
 * That line is COMPUTED, not listed — the literal is parsed and the rule asks
 * whether its red, green and blue channels are equal. An achromatic value is
 * exempt because of what it IS, which is the same move every structural
 * exclusion in check-render.js makes, and it means there is no list of
 * "shadow-ish properties" to keep one entry short of the next component.
 *
 * IT DOES NOT CARVE OUT MASKS, and that is deliberate rather than an oversight.
 * check-design-system.js rules 4 and 7 both do, on the correct argument that
 * only a mask's alpha channel is ever read. Every mask in this tree is `#000` or
 * `rgb(0 0 0)`, so the achromatic test already excuses all 24 on their own
 * merits; adding the carve-out would buy nothing and would create a property
 * name a hue could hide behind. A mask written in a chromatic colour would fail
 * here, and it should: it would be a value pretending to mean something.
 *
 * THREE SHAPES OF FINDING, because three different things are being done:
 *   painted     an ordinary declaration. Reported per distinct literal, so the
 *               finding names the colour somebody has to decide about.
 *   bound       a `--x: <literal>` declaration. That is a token being DEFINED,
 *               and a file that defines tokens is a second palette home. Grouped
 *               per file, because thirty bindings in a theme block are one
 *               decision and thirty allow-list entries would be unreadable.
 *   in markup   `fill=`, `stroke=` and `stop-color=` on an SVG. Also grouped per
 *               file, and included at all because rule 1 already proved the
 *               value of scanning markup: it caught `stroke="var(--c-teal)"` in
 *               Footer.astro on its first run.
 *
 * ── WHAT THIS CANNOT SEE, STATED RATHER THAN IMPLIED ────────────────────────
 *
 * It reads the SOURCE, not the pixel. A role token bound to the wrong colour in
 * tokens.css is invisible here and always will be — that is a decision, and a
 * decision is reviewed by a person, not by a regex. What the gate DOES assert is
 * the property that makes the review possible: if every colour outside
 * tokens.css is a role, then the set of colours the site can paint is bounded by
 * that one file, and the review is one file long.
 *
 * RULE 3 IS WHAT MAKES THAT SENTENCE TRUE RATHER THAN NEARLY TRUE, and the
 * allow-list below is where it is admitted to be nearly true in two places.
 *
 * A NAMED CSS COLOUR — `tomato`, `rebeccapurple` — is not read. Nothing in this
 * tree uses one, and the honest reason it is not covered is that recognising
 * them means shipping the 148-name table, which would go stale against the
 * spec. `white`, `black` and `transparent` would be excused anyway. This is a
 * limit rather than a decision, and it is written down so it is not mistaken
 * for coverage.
 *
 * It also cannot see a colour written into an inline `style=` attribute, a
 * `<svg fill=>` or a TypeScript string, EXCEPT that all three are scanned as
 * text like everything else in a .astro file — so `stroke="var(--c-teal)"` in
 * Footer.astro and `accent: 'var(--c-teal)'` in MarketShape.astro were both
 * caught by this check on its first run, which is why the text scan is
 * deliberately not narrowed to CSS declaration syntax.
 *
 * COMMENTS ARE STRIPPED BEFORE MATCHING. Four comment blocks on this site quote
 * `var(--c-teal)` while explaining a defect that has since been fixed, and a
 * gate that forced those sentences to be rewritten would be destroying the
 * record it depends on.
 *
 * ── THE CONTRACT ────────────────────────────────────────────────────────────
 *
 * The same one check-links.js, check-content-parity.js and
 * check-design-system.js already use, copied deliberately rather than
 * reinvented:
 *
 *   - an allow-list of named exceptions, each carrying the reason it is one
 *   - the allow-list is PRINTED on every run, so a deliberate exception that
 *     nobody re-reads cannot quietly become an accidental one
 *   - entries that no longer match anything are reported as stale, so the list
 *     can only shrink
 *   - anything NOT on the list FAILS the build
 *
 * The list is not a snooze button. Seeding it to get a green build would make
 * the gate worthless, which is precisely the failure mode it exists to prevent.
 *
 * PR_SRC overrides the directory read, so the gate can be proved to FAIL against
 * a scratch copy without disturbing the tree another agent is using. A gate only
 * ever proved to fail can still lie when it passes, and one only ever proved to
 * pass has never been shown to do anything at all; both directions are run and
 * both exit codes are recorded in the session notes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = process.env.PR_SRC || path.join(ROOT, 'src');
const TOKENS = 'styles/tokens.css';

/* ══════════════════════════════════════════════════════════════════════════
 * THE ALLOW-LIST — every entry is a decision somebody has to defend.
 *
 * Keys are `<rule>  <file>  <what>`, matched case-insensitively and
 * deliberately WITHOUT line numbers: a line number drifts every time somebody
 * edits the file above it, and an exemption that silently stops matching is how
 * the next real violation gets waved through.
 *
 * DELETE AN ENTRY THE MOMENT IT STOPS BEING TRUE. The check reports its own
 * stale entries on every run for exactly that reason.
 * ══════════════════════════════════════════════════════════════════════════ */
const ALLOWED = new Map([
  /* ── RULES 1 AND 2 HOLD NOTHING, AND THAT IS STILL THE POINT ─────────────
   *
   * The V6 role pass of 2026-08-04 left nothing here. Rule 1 needs no exception
   * because tokens.css can hold any role a component turns out to need, and
   * rule 2's three first-run findings were a rule that was imprecise rather than
   * a design that was wrong — see "INTRODUCED, NOT MERELY RESTATED" above.
   *
   * RULE 3 ADDED THREE, AND THE HEADER'S CLAIM IS AMENDED RATHER THAN DEFENDED.
   * "The set of colours the site can paint is bounded by one file" was written
   * before anything read literals. Read them, and it is bounded by THREE files:
   * tokens.css, the light theme in layouts/Article.astro, and the brand mark.
   * The two below are named so that the sentence is true with a footnote instead
   * of false without one. Both are printed on every run; a key that stops
   * matching fails the build. */

  /* ── THE LIGHT THEME ─────────────────────────────────────────────────────
   *
   * A GROUPED KEY, WITH THE COST OF GROUPING STATED. This covers the file, not a
   * value, so a NEW colour decision added to that block would be invisible to
   * rule 3. That is a real hole and it is accepted for one reason: the
   * alternative is ~30 keys, and an allow-list nobody finishes reading is a
   * worse hole in the same place. The mitigation is that the block is a theme
   * and nothing else, so a colour appearing there that is not a light-mode
   * counterpart of a dark-mode role is already wrong on review. */
  [
    'literal-bound  src/layouts/Article.astro  binds chromatic colour literals to custom properties',
    'THE LIGHT THEME FOR BLOG ARTICLES, and it is a genuine second binding site rather ' +
      'than a component reaching for a hue. Every declaration in it REBINDS a role tokens.css ' +
      'already defines — --c-bg, --c-text, --c-verified, --c-refused, the ambient ramp, the ' +
      'interactive fill — to its light-mode counterpart, which is exactly what a theme is and ' +
      'is the reason the article body picks the whole system up without knowing anything about ' +
      'it. Moving the values into tokens.css is the right end state and is a separate change: ' +
      'it means a media/attribute-scoped second block in the palette file, and doing it as a ' +
      'side effect of adding this rule would put a theme switch into a commit about a gate. ' +
      'What the rule DOES establish today is that this is the only such file, because any ' +
      'other one fails.',
  ],

  /* ── THE BRAND MARK ──────────────────────────────────────────────────────
   *
   * Two files, one artwork, and it is duplicated in the source rather than
   * shared — which is its own defect and not this gate's to fix. Both entries
   * carry the same reason because it is the same reason. */
  [
    'literal-markup  src/components/nav/Nav.astro  paints chromatic colour literals in SVG presentation attributes',
    'THE CROWAGENT MARK. A logo is fixed artwork, not a themed surface: its blue-to-green ' +
      'bars, its near-white plate and its hairline are the brand pack, and they are the same ' +
      'colours on a dark page, on a light one and on somebody else\'s letterhead. A mark that ' +
      're-tinted with the palette would stop being the mark. Tokenising it would also be ' +
      'actively wrong here, because the shelf it would have to reference is the site palette, ' +
      'which is precisely the thing a logo must not follow.',
  ],
  [
    'literal-markup  src/components/footer/Footer.astro  paints chromatic colour literals in SVG presentation attributes',
    'THE CROWAGENT MARK, again — the same SVG as Nav.astro, copied rather than shared. Same ' +
      'argument: a logo is fixed artwork and does not follow the palette. The duplication is a ' +
      'real finding in its own right and belongs to whoever consolidates the mark into one ' +
      'component; it is recorded here rather than fixed here so that this entry can be deleted ' +
      'in one move when it is.',
  ],
]);

/* ══════════════════════════════════════════════════════════════════════════
 * WHAT COUNTS AS A HUE NAME, DERIVED FROM tokens.css
 * ══════════════════════════════════════════════════════════════════════════ */

/* The colour WORDS. Anything defined in tokens.css as `--c-<word>` or
   `--c-<word>-<suffix>` is a pigment, not a role. Kept as words rather than as
   a list of token names so that adding `--c-teal-bright` to the shelf tomorrow
   is caught without anybody remembering to edit this file. */
const HUE_WORDS = new Set([
  'teal', 'cyan', 'violet', 'orchid', 'pink', 'amber', 'white',
  'green', 'blue', 'red', 'yellow', 'purple', 'magenta', 'indigo', 'lime',
]);

const tokensFile = path.join(SRC, TOKENS);
if (!fs.existsSync(tokensFile)) {
  console.error(`palette-roles: no ${TOKENS} to derive the hue shelf from.`);
  process.exit(1);
}
const tokenSrc = fs.readFileSync(tokensFile, 'utf8');
const definedTokens = (tokenSrc.match(/^\s*(--[\w-]+)\s*:/gm) || []).map((s) =>
  s.trim().replace(/\s*:$/, '')
);
const hueTokens = new Set(
  definedTokens.filter((t) => {
    const m = /^--c-([a-z]+)(?:-[a-z-]+)?$/.exec(t);
    return m !== null && HUE_WORDS.has(m[1]);
  })
);
if (hueTokens.size === 0) {
  console.error('palette-roles: derived an EMPTY hue shelf from tokens.css. ' +
    'That would make this check pass unconditionally, so it fails instead.');
  process.exit(1);
}

/* The three marks. Named here because their MEANING is what rule 2 protects,
   and asserted against tokens.css so a rename cannot silently empty the rule. */
const MARKS = ['--c-verified', '--c-verified-glow', '--c-refused', '--c-at-risk'];
const missingMarks = MARKS.filter((m) => !definedTokens.includes(m));
if (missingMarks.length) {
  console.error(`palette-roles: ${TOKENS} no longer defines ${missingMarks.join(', ')}. ` +
    'Rule 2 would assert nothing, so this fails rather than passing.');
  process.exit(1);
}

/* ══════════════════════════════════════════════════════════════════════════
 * READING THE SOURCE
 * ══════════════════════════════════════════════════════════════════════════ */

/** Every .astro and .css under src/, except the token definitions themselves. */
function sourceFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) sourceFiles(p, out);
    else if (/\.(astro|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

/**
 * Blank out comments while PRESERVING newlines and length, so a line number
 * reported against the stripped text is the line number in the file.
 * Handles CSS/JS block comments and `//` line comments; HTML comments do not
 * appear in the parts of a .astro file that carry colour.
 */
function stripComments(text) {
  let out = text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  out = out.replace(/(^|[^:])\/\/[^\n]*/g, (m, lead) => lead + ' '.repeat(m.length - lead.length));
  return out;
}

/**
 * Every `{ … }` block in a file, with the selector that opened it and the
 * character range it covers, innermost last.
 *
 * WHY A SCANNER AND NOT A BACKWARD WALK. The first version of this check walked
 * backwards from a match counting braces, which is what check-design-system.js
 * does, and it had a hole big enough to make rule 2 decorative: a rule written
 * ON ONE LINE — `.faq__q:hover { color: var(--c-verified); }` — opens and closes
 * its brace on the same line, so the walk nets to zero and reports NO enclosing
 * selector. This tree has dozens of those and several of them are exactly the
 * hovers rule 2 exists to police. The hole was found by proving the gate could
 * fail: rule 1 fired on the injected violation and rule 2 did not.
 *
 * A gate that cannot fail is worse than no gate, because it is also believed.
 * So the block structure is scanned once, forward, and a match is resolved
 * against it by character offset.
 */
function blocks(text) {
  const out = [];
  const stack = [];
  let buf = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      stack.push({ selector: buf.trim().replace(/\s+/g, ' '), start: i, end: text.length });
      buf = '';
    } else if (ch === '}') {
      const b = stack.pop();
      if (b) { b.end = i; out.push(b); }
      buf = '';
    } else if (ch === ';') {
      buf = '';
    } else {
      buf += ch;
    }
  }
  /* Unclosed blocks still count: a truncated file must not silently disable the
     rule that reads it. */
  for (const b of stack) out.push(b);
  return out;
}

/**
 * The innermost block selector covering a character offset, skipping at-rules
 * (`@media`, `@layer`, `@supports`, `@keyframes`) — those wrap a selector, they
 * are not one, and the intent this check reads is written in the selector.
 * A style-less construct such as a JS object literal yields '' and is reported
 * as top level, which is correct: `accent: 'var(--c-teal)'` in a .astro frontmatter
 * is a colour decision with no selector at all, and rule 1 still catches it.
 */
function enclosingAt(blockList, offset) {
  let best = null;
  for (const b of blockList) {
    if (offset <= b.start || offset >= b.end) continue;
    if (b.selector.startsWith('@')) continue;
    if (!best || b.start > best.start) best = b;
  }
  return best ? best.selector : '';
}

/**
 * Does this selector describe something a pointer or a keyboard acts on?
 *
 * Read from the selector because that is the only place the intent is written.
 * The `<a>`/`<button>` clause is what catches `.rt__cta a { color: ... }`, which
 * carries no pseudo-class at all and is nonetheless the resting state of a link.
 */
const INTERACTIVE_SELECTOR =
  /(:hover|:focus|:focus-visible|:focus-within|:active|:checked|:target|:visited|:link|\[aria-selected=['"]?true|\[aria-pressed=['"]?true|\[aria-current|\[aria-expanded=['"]?true|\[data-active=['"]?true|(^|[\s>+~,])(a|button)(\b|[.:[]))/;

/**
 * The SUBJECT of a selector: its last compound, with pseudo-classes, pseudo-
 * elements and attribute tests stripped. `.bs__station:hover .bs__cap` ->
 * `.bs__cap`; `.rt__tally-row--refused:hover` -> `.rt__tally-row--refused`.
 *
 * One per comma-separated part, because `.note a, .card__cta a` is two rules
 * sharing a declaration block and each has its own subject.
 */
function subjects(selector) {
  return selector
    .split(',')
    .map((part) => {
      const last = part.trim().split(/[\s>+~]+/).filter(Boolean).pop() || '';
      return last.replace(/\[[^\]]*\]/g, '').replace(/::?[\w-]+(\([^)]*\))?/g, '').trim();
    })
    .filter(Boolean);
}

/* ══════════════════════════════════════════════════════════════════════════
 * RULE 3'S ARITHMETIC: IS THIS LITERAL A HUE?
 *
 * The whole rule turns on this function, so it is a parse rather than a regex
 * over the text. `#000`, `#0009`, `#000000`, `rgb(0 0 0)`, `rgba(0,0,0,.9)` and
 * `rgb(0% 0% 0% / 90%)` are all the same achromatic value written six ways, and
 * a rule that recognised five of them would be a rule with a syntax-shaped hole.
 *
 * Returns null when the value cannot be read. NULL COUNTS AS CHROMATIC at the
 * call site, which is the safe direction: an unparsed colour is reported and a
 * person looks at it, rather than being waved through by the parser's ignorance.
 * ══════════════════════════════════════════════════════════════════════════ */
function channels(literal) {
  const hex = /^#([0-9a-fA-F]{3,8})$/.exec(literal);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      return [0, 1, 2].map((i) => parseInt(h[i] + h[i], 16));
    }
    if (h.length === 6 || h.length === 8) {
      return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    }
    return null;
  }
  const fn = /^(rgba?)\(([^)]*)\)$/i.exec(literal);
  if (!fn) return null;
  /* Both syntaxes at once: `rgb(1, 2, 3)` and `rgb(1 2 3 / 40%)`. The alpha is
     dropped on purpose — an achromatic grey is achromatic at every opacity, and
     opacity is never a palette decision. */
  const parts = fn[2]
    .split('/')[0]
    .split(/[\s,]+/)
    .filter(Boolean);
  if (parts.length < 3) return null;
  const nums = parts.slice(0, 3).map((p) => {
    const pc = p.endsWith('%');
    const n = parseFloat(p);
    if (!Number.isFinite(n)) return NaN;
    return pc ? (n * 255) / 100 : n;
  });
  return nums.some((n) => Number.isNaN(n)) ? null : nums;
}

/** A colour with a hue: its channels are not all equal, or it cannot be read. */
function isChromatic(literal) {
  const c = channels(literal);
  if (c === null) return true;
  return !(c[0] === c[1] && c[1] === c[2]);
}

/* Every colour literal in a string. Hex first, then the numeric functions.
   `color-mix(`, `var(`, `transparent` and `currentColor` are not literals and do
   not match, which is the point: those are the shapes a correct value takes. */
const LITERAL_RE = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\([^)]*\)/g;

/* An SVG presentation attribute that paints. `color` is included because it
   sets the value `currentColor` resolves to further down the tree. */
const SVG_PAINT_RE = /\b(fill|stroke|stop-color|flood-color|lighting-color|color)\s*=\s*"([^"]*)"/g;

/* A CSS declaration. The value stops at a double quote as well as at `;` and a
   brace, so a run of markup attributes cannot be swallowed into one enormous
   "value" — an early draft read `http://www.w3.org/2000/svg" ... fill="#FCFDFF"`
   as a declaration of the property `http` and reported the logo against it. */
const DECL_RE = /([-\w]+)\s*:\s*([^;{}"]+)/g;

const violations = [];
const recorded = [];
const seenKeys = new Set();
const counts = {
  'hue-in-component': 0,
  'mark-on-control': 0,
  'literal-painted': 0,
  'literal-bound': 0,
  'literal-markup': 0,
};

function report(rule, file, what, detail) {
  counts[rule]++;
  const key = `${rule}  ${file}  ${what}`;
  const why = ALLOWED.get(key.toLowerCase()) ?? ALLOWED.get(key);
  if (why !== undefined) {
    seenKeys.add(key.toLowerCase());
    recorded.push({ rule, file, what, why });
    return;
  }
  violations.push({ rule, file, what, detail, key });
}

const files = sourceFiles(SRC).filter((f) => !f.endsWith(path.normalize(TOKENS)));
const HUE_RE = /var\(\s*(--c-[\w-]+)/g;
const MARK_RE = /var\(\s*(--c-(?:verified(?:-glow)?|refused|at-risk))\s*\)/g;

for (const file of files) {
  /* Keyed relative to SRC and re-prefixed, so an allow-list key written against
     the real tree still matches when the gate is proved against a scratch copy
     under PR_SRC. A key that changed with the directory would make the pass
     direction untestable. */
  const rel = `src/${path.relative(SRC, file).split(path.sep).join('/')}`;
  const text = stripComments(fs.readFileSync(file, 'utf8'));
  const blockList = blocks(text);
  /* Offset -> 1-based line, so a finding names somewhere to open. */
  const lineAt = (offset) => text.slice(0, offset).split('\n').length;

  /* One report per (file, token) rather than one per reference: 28 teal
     references in one page are one decision, and 28 identical lines would be 28
     chances to stop reading the output. The first line number is carried as
     detail so the finding still names somewhere to open. */
  const firstHue = new Map();
  const firstMark = new Map();

  /* PASS ONE — every `<subject>|<mark>` this file paints at REST. Rule 2 needs
     it to tell a state that INTRODUCES a mark from one that restates a mark the
     element already carries; see the header. */
  const atRest = new Set();
  for (const m of text.matchAll(MARK_RE)) {
    const sel = enclosingAt(blockList, m.index);
    if (!sel || INTERACTIVE_SELECTOR.test(sel)) continue;
    for (const s of subjects(sel)) atRest.add(`${s}|${m[1]}`);
  }

  /* ── RULE 1: no hue-named token outside tokens.css ───────────────────── */
  for (const m of text.matchAll(HUE_RE)) {
    if (!hueTokens.has(m[1]) || firstHue.has(m[1])) continue;
    const sel = enclosingAt(blockList, m.index) || '(top level)';
    firstHue.set(m[1], `${sel}, line ${lineAt(m.index)}`);
  }

  /* ── RULE 2: an interactive state may not INTRODUCE a mark ───────────── */
  for (const m of text.matchAll(MARK_RE)) {
    const sel = enclosingAt(blockList, m.index);
    if (!sel || !INTERACTIVE_SELECTOR.test(sel)) continue;
    /* Restating a mark the subject already carries at rest is a light being
       turned up on an existing fact, not a meaning being painted onto an
       interaction. Only an introduction is a finding. */
    if (subjects(sel).some((s) => atRest.has(`${s}|${m[1]}`))) continue;
    const k = `${m[1]} in ${sel}`;
    if (!firstMark.has(k)) firstMark.set(k, `line ${lineAt(m.index)}`);
  }

  /* ── RULE 3: no CHROMATIC colour literal outside tokens.css ──────────────
   *
   * See the header for why the line is drawn at hue rather than at a list of
   * properties. Three collections, because the three shapes are three different
   * acts and grouping them together would either flood the output or hide a
   * paint inside a theme block. */
  const painted = new Map();
  const bound = new Map();
  const markup = new Map();

  for (const d of text.matchAll(DECL_RE)) {
    const prop = d[1];
    const value = d[2];
    for (const lit of value.match(LITERAL_RE) || []) {
      if (!isChromatic(lit)) continue;
      /* A `--x: <colour>` declaration DEFINES a token. That is a palette
         decision too, but it is one taken in the one place a palette decision
         belongs, so it is reported as a second binding site rather than as a
         component painting a hue. */
      const into = prop.startsWith('--') ? bound : painted;
      const key = prop.startsWith('--') ? lit : `${lit} in ${enclosingAt(blockList, d.index) || '(top level)'}`;
      if (into.has(key)) continue;
      into.set(key, `${prop}, line ${lineAt(d.index)}`);
    }
  }

  for (const a of text.matchAll(SVG_PAINT_RE)) {
    for (const lit of (a[2].match(LITERAL_RE) || [])) {
      if (!isChromatic(lit)) continue;
      if (markup.has(lit)) continue;
      markup.set(lit, `${a[1]}=, line ${lineAt(a.index)}`);
    }
  }

  for (const [tok, where] of firstHue) {
    report('hue-in-component', rel, `${tok} referenced outside ${TOKENS}`, where);
  }
  for (const [what, where] of firstMark) {
    report('mark-on-control', rel, what, where);
  }
  /* Per literal, because each one is a colour somebody has to decide about. */
  for (const [what, where] of painted) {
    report('literal-painted', rel, `${what} written outside ${TOKENS}`, where);
  }
  /* Per FILE for the other two. Thirty bindings in a theme block are one
     decision, and a seven-colour logo is one artwork; keying either per literal
     would put 37 entries in an allow-list nobody would finish reading, which is
     the failure mode this file's contract exists to avoid. The values are
     carried as detail so the finding still names what it found. */
  if (bound.size) {
    report(
      'literal-bound',
      rel,
      'binds chromatic colour literals to custom properties',
      `${bound.size} value(s): ${[...bound.keys()].slice(0, 4).join(', ')}${bound.size > 4 ? ', …' : ''} (first at ${[...bound.values()][0]})`,
    );
  }
  if (markup.size) {
    report(
      'literal-markup',
      rel,
      'paints chromatic colour literals in SVG presentation attributes',
      `${markup.size} value(s): ${[...markup.keys()].slice(0, 4).join(', ')}${markup.size > 4 ? ', …' : ''} (first at ${[...markup.values()][0]})`,
    );
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * OUTPUT
 * ══════════════════════════════════════════════════════════════════════════ */

console.log('\npalette-roles: a component names a ROLE; only tokens.css names a COLOUR.');
console.log(`  hue shelf derived from ${TOKENS}: ${[...hueTokens].sort().join(', ')}`);
console.log(`  ${files.length} source file(s) scanned, comments stripped.`);
console.log(`  findings — hue-in-component ${counts['hue-in-component']}, ` +
  `mark-on-control ${counts['mark-on-control']}, ` +
  `literal-painted ${counts['literal-painted']}, ` +
  `literal-bound ${counts['literal-bound']}, ` +
  `literal-markup ${counts['literal-markup']}`);
/* Rule 3's own exclusion, printed rather than left in the source. An achromatic
   literal is exempt because black, white and grey survive every palette this
   site could adopt; a reader of a clean run is entitled to know the rule looked
   at them and let them through, rather than inferring it from silence. */
console.log('  rule 3 reads CHROMATIC literals only: black, white and grey are ink, not palette,');
console.log('  and are excused by arithmetic on their channels rather than by a list of properties');

/* PRINTED ON EVERY RUN. An exception nobody re-reads becomes an accidental one,
   which is the whole reason this list is not a config file nobody opens. */
if (recorded.length) {
  console.log(`\n  ${recorded.length} recorded exception(s), each with the reason it is one:`);
  for (const r of recorded) {
    console.log(`    [${r.rule}] ${r.file}`);
    console.log(`      ${r.what}`);
    console.log(`      why: ${r.why}`);
  }
} else {
  console.log('\n  0 recorded exceptions. The allow-list is empty, which is the target state.');
}
/* An allow-list is only readable if its shape is stated. Rules 1 and 2 hold
   nothing; every entry printed above belongs to rule 3 and to the two files the
   header names. Printed so that a fourth entry appearing here is conspicuous. */
console.log(
  `  of which rules 1 and 2 account for ` +
    `${recorded.filter((r) => r.rule === 'hue-in-component' || r.rule === 'mark-on-control').length}`,
);

/* An entry that matched nothing is a line that is no longer true, and a stale
   exemption is how the next real violation gets waved through. */
const stale = [...ALLOWED.keys()].filter((k) => !seenKeys.has(k.toLowerCase()));
if (stale.length) {
  console.log(`\n  ${stale.length} allow-list entr(ies) matched nothing — delete them, the exception is gone:`);
  for (const k of stale) console.log(`    ${k}`);
}

if (violations.length) {
  console.error(`\n  ${violations.length} violation(s). Each is a colour decision taken outside ${TOKENS}:\n`);
  for (const v of violations) {
    console.error(`    [${v.rule}] ${v.file}`);
    console.error(`      ${v.what}`);
    console.error(`      at ${v.detail}`);
    console.error(`      allow-list key: ${v.key}`);
  }
  console.error(
    '\n  Fix by naming the ROLE, not the colour. If no role fits, add one to ' +
    `${TOKENS} named for what it MEANS — a hue name in a component is a palette ` +
    'decision the next palette change cannot reach.\n'
  );
  if (counts['literal-painted'] || counts['literal-bound'] || counts['literal-markup']) {
    console.error('  A literal is the same decision one step closer to the pixel, and rule 3 is');
    console.error('  the reason it is now visible: layouts/Glossary.astro carried the exact value');
    console.error('  of --c-teal as an rgba() for the life of this build and both colour gates');
    console.error('  printed PASS. Only CHROMATIC literals are reported — if a black, a white or a');
    console.error('  grey has been flagged, the parser could not read the value, and that is a');
    console.error('  defect in this gate rather than in the file.\n');
  }
  process.exit(1);
}

if (stale.length) {
  console.error('\n  Stale allow-list entries above. The list may only shrink.\n');
  process.exit(1);
}

console.log(
  '\n  PASS — every colour outside tokens.css is a role, no mark sits on a control, and no\n' +
    '  chromatic literal is written anywhere but the two files named above.\n',
);
process.exit(0);
