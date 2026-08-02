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
 * it, but a browser launch plus 41 routes is tens of seconds on every build, and
 * a gate that is slow is a gate somebody eventually takes out of `npm run
 * build`. Everything below is derived from text and runs in well under a second.
 * What that costs is recorded honestly at the bottom of this comment.
 *
 * ── THE FIVE RULES ──────────────────────────────────────────────────────────
 *
 * They come from specs/DESIGN-DECISIONS.md and specs/OWNER-FEEDBACK-LOG.md.
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
   * `surface--read` is the manual escape hatch documented in surfaces.css: a
   * card whose single paragraph runs three or four lines, where centring costs
   * real readability. Carrying the class silences the CSS. It deliberately does
   * NOT silence this gate, because a marker in a class list is not a reason.
   * Adding `surface--read` to a card means also writing down why here, which is
   * the whole difference between a design system and a habit. */
  ['align  /glossary/  gx-term.surface.surface--read',
   '24 definition cards. Each holds a four to six line definition and nothing else, so it is prose in a card rather than a card of prose. Centring gives every line a different left edge in a body of text somebody reads top to bottom'],
  ['align  /pricing/  card.surface.surface--read',
   '10 cards carrying a paragraph of running explanation under the plan tables. Same case as the glossary: one block of continuous text, read rather than scanned'],
  ['align  /pricing/  card.surface.plan.surface--read',
   'the wide plan card. Its body is a full sentence per feature, not the kicker-heading-line vocabulary the centring rule was written for'],
  ['align  /about/  pair__card.surface.surface--pad.surface--read',
   '4 cards in the "what we do / what we do not" pairing, each a five to seven line paragraph. These are the exact case decision 9 in OWNER-FEEDBACK-LOG.md kept left: long body copy'],

  ['align  src/pages/pricing.astro  .kicker--tight',
   'the mono kicker above a plan feature list. It labels the list beneath it, and a list is read down its left edge, so a centred label sits over a left-aligned column and reads as a mistake. The base .kicker is centred; only the in-card variant is not'],

  /* ── 2 TYPE SCALE ────────────────────────────────────────────────────────*/
  ['type  src/components/footer/Footer.astro  .ca-footer-col-title',
   'the footer column titles are <h2> for document structure and read as labels, which is what the footer needs them to be. --t-micro is a token on the scale; it is simply not one of the four heading tiers. An <h2> here at --t-h2 would make the footer the loudest type on every page'],

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
  ['card  src/layouts/Article.astro  .article-body :global(blockquote)',
   'a pull quote inside a blog post body, authored in markdown and unreachable from a class. NOTE: its padding is a raw 1.25rem 1.5rem rather than --blk-pad, which is real drift and should move to the token. Recorded here rather than fixed because src/layouts/Article.astro is being edited by another agent'],
  ['card  src/layouts/Article.astro  .article-body :global(pre)',
   'a code block inside a blog post body. Same authoring constraint and the same raw padding as the blockquote above, and it should move to --blk-pad with it'],
  ['card  src/pages/glossary/index.astro  .gx-search input',
   'the glossary search field, not a content block. surfaces.css names this exact element when it explains what --radius-panel is still for: "chrome that is not a content block at all: the glossary search field, the skip link"'],
  ['card  src/components/nav/Nav.astro  .ca-mega',
   'the mega-menu dropdown. Navigation chrome that floats above the page rather than a block of content sitting in it, so --radius-panel is right and --blk-pad, which is section-interior padding, is not'],

  ['card  src/pages/crowmark-buyers.astro  .quote',
   'a pull quote with the radius squared off down its left edge, where a coloured rule runs. It is deliberately not a card: the shape is the citation mark. Radius and padding are both tokens'],
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

  /* ══════════════════════════════════════════════════════════════════════════
   * KNOWN DEBT — everything below is a REAL VIOLATION that is not fixed here.
   *
   * Every reason starts with DEBT:, which is what makes the check print it in
   * its own block under its own count, rather than beside the decisions above
   * as though somebody had argued for it. Same shape as `/integrations OA-10`
   * in check-links.js: a defect blocked on something, tracked in the open.
   *
   * WHY THEY ARE HERE RATHER THAN FIXED. Three other agents are editing
   * src/components/sections/**, src/styles/**, src/pages/blog/** and
   * src/layouts/Article.astro right now, and this gate's scope is the gate.
   * Fixing them here would collide. Every one is a single-line change and the
   * list should be empty within a pass or two.
   *
   * THE TWO WORST OFFENDERS ARE Nav.astro AND Footer.astro, with nine of the
   * fourteen entries between them. That is not a coincidence: both were ported
   * from the legacy tree as page chrome, and neither was in scope for any of the
   * sweeps, which were measured across page CONTENT. The chrome on every page of
   * the site is the part of it furthest from the design system.
   * ══════════════════════════════════════════════════════════════════════════ */

  ['token  src/components/nav/Nav.astro  font-size: 1.05rem',
   'DEBT: the wordmark, at 16.8px, a size in no scale. Nav.astro predates the type tokens and was never swept'],
  ['token  src/components/nav/Nav.astro  font-size: 0.8125rem',
   'DEBT: the mega-menu item description, at 13px. That is exactly the top of --t-micro and should say so'],
  ['token  src/components/nav/Nav.astro  font-size: 11px',
   'DEBT: the Cmd-K key cap. Below every tier; needs a control token or --t-micro'],
  ['token  src/components/nav/Nav.astro  font-size: 1.15rem',
   'DEBT: the mobile menu top-level link and accordion trigger, at 18.4px, between --t-body and --t-lede and on neither'],
  ['token  src/components/footer/Footer.astro  font-size: 1.05rem',
   'DEBT: the footer wordmark. The same off-scale value as the nav wordmark, which is what a shared token would have prevented'],
  ['token  src/components/footer/Footer.astro  font-size: 0.8125rem',
   'DEBT: the status label and the bottom bar, both 13px. Same as the nav: this is --t-micro written as a number'],
  ['token  src/components/footer/Footer.astro  font-size: 10px',
   'DEBT: the "free" chip. The smallest type on the site and the only 10px on it'],
  ['token  src/components/sections/MarketShape.astro  font-size: clamp(3.5rem, 11vw, 7.5rem)',
   'DEBT: the market figure resized for the two-column breakpoint. The base rule correctly uses --t-numeral; only this responsive override restates a clamp, which is how a scale grows a second opinion about itself. MarketShape.astro is being edited by another agent'],

  ['token  src/components/forms/NewsletterForm.astro  max-width: 520px',
   'DEBT: a container width off the --measure scale. tokens.css records 720, 760, 820, 860, 880, 900 and 960px found hardcoded across the reviewable routes as the defect --measure-mid, --measure-band and --measure-prose were added to end. This is that defect, one page at a time'],
  ['token  src/pages/about.astro  max-width: 720px',
   'DEBT: the company details block, 5px away from --measure-prose (725px). Nobody will ever see the 5px; what they will see is the next value that lands 40px away instead'],
  ['token  src/pages/faq.astro  max-width: 460px',
   'DEBT: the FAQ search field. Off the --measure scale'],
  ['token  src/pages/tools/ppn-002-calculator/index.astro  max-width: 560px',
   'DEBT: the calculator input column. Off the --measure scale'],

  ['token  src/pages/crowmark-buyers.astro  hardcoded colour #E8B84B',
   'DEBT: an amber "at risk" band mark. The palette rule in DESIGN-DECISIONS.md assigns teal to verified, violet and orchid to refused or flagged, and cyan to interactive, and has no fourth mark. This band needs one and there is no token, so a hex was written instead. Needs an owner decision on whether at-risk is a fourth semantic colour or a shade of flagged, not a token invented by an agent'],
  ['token  src/pages/tools/ppn-002-calculator/index.astro  hardcoded colour #E8B84B',
   'DEBT: the same amber, written a second time in a second file, which is the whole argument for tokenising it. Blocked on the same owner decision'],
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
const counts = { align: 0, type: 0, card: 0, token: 0, heading: 0 };

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
const surfaceGroups = new Map(); // route + signature -> count, for surface--read
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
   * A `.surface` centres its content unless it carries `surface--read` or holds
   * something structural. Both escapes are legitimate and both are recorded:
   * the structural one is automatic and documented in surfaces.css so it is
   * counted and printed, and `surface--read` is a human decision so it needs a
   * human reason on the allow-list. */
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

    if (n.cls.includes('surface--read')) {
      const key = `${route}  ${signature}`;
      surfaceGroups.set(key, (surfaceGroups.get(key) || 0) + 1);
      return;
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

/* One report per (route, class signature) rather than one per card: 24 glossary
   definition cards are one decision, and 24 identical lines would be 24 chances
   to stop reading the output. */
for (const [key, n] of surfaceGroups) {
  const [route, signature] = key.split('  ');
  report('align', route, signature, `${n} card(s) opted out of centring with surface--read`);
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
   * mixes them teaches the reader that everything on it is fine. check-links.js
   * already carries both without naming the distinction: `/cookie-preferences`
   * is a decision and `/integrations OA-10` is a defect waiting on the owner.
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
  const order = ['align', 'type', 'card', 'token', 'heading'];
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
  const label = {
    align: 'ALIGNMENT   a card is scanned, so its content centres; prose is read, so it stays left',
    type: 'TYPE SCALE  four heading sizes, one weight per tier, all from tokens.css',
    card: 'CARD RECIPE one card sitewide: --radius-card and --blk-pad, via .surface',
    token: 'TOKENS      no hardcoded colour, type size or container width outside the token block',
    heading: 'HEADINGS    one <h1> per route, no skipped levels',
  };
  console.error(`\ndesign-system: ${violations.length} DESIGN SYSTEM VIOLATION(S), NOT RECORDED\n`);
  for (const rule of ['align', 'type', 'card', 'token', 'heading']) {
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
  `\n  clean: every card, heading, colour and width on ${routeList.length} routes comes from the`
);
console.log('  token scale, or is named above with the reason it does not. Nothing is unaccounted for.');
process.exit(0);
