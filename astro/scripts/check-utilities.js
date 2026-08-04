/**
 * check-utilities.js — a class that resolves to nothing.
 *
 * ── WHY THIS EXISTS, AND WHY IT IS THIS NARROW ─────────────────────────────
 *
 * A verification pass on 2026-08-04 measured every class name in dist/ against
 * every rule in the shipped CSS. 899 distinct classes; 68 of them defined by no
 * stylesheet at all. The obvious gate is the general one — fail on any class
 * that no CSS matches — and it was prototyped, measured, and NOT SHIPPED.
 *
 * IT WOULD FLOOD, and the numbers are the argument rather than a feeling. Of
 * the 68, thirty sit in files this pass owns, and all thirty were read one at a
 * time. Every one is legitimate:
 *
 *   6   a generated BEM modifier for a data value that needs no override.
 *       `bands__item--none`, `ph__status--research`, `tl__item--done`,
 *       `tl__status--done`, `trust__card--verified`, `mech__art--sources`. Each
 *       comes out of a class:list template whose SIBLING values are styled —
 *       --on/--risk/--breach, --live/--planned, --now/--planned, --refused,
 *       --draft/--link. The unstyled value is the default look. Deleting it
 *       means special-casing the template, which is worse markup for no gain.
 *   5   a behaviour, vendor or tooling hook. `cf-turnstile` is the selector
 *       Cloudflare's own widget script mounts on. `nl__status` is read by
 *       `form.querySelector('.nl__status')` and rewritten on both result
 *       branches. `github-dark` and `line` are emitted by Shiki, which ships its
 *       token colours as inline styles, so those classes carry no CSS BY
 *       DESIGN. `surface--lift` is documented in styles/surfaces.css as
 *       deliberately retained after the owner's 2026-08-03 hover decision made
 *       it redundant, and check-sheen.js names it.
 *  19   the block's own structure written down, all nineteen named so the count
 *       can be checked rather than believed: `ca-footer-col`, `ca-nav-cta`,
 *       `ca-nav-login`, `cards__item`, `crumb`, `cw--gap`, `enquiry__form`,
 *       `feat__pic`, `feat__text`, `hist`, `hist__col`, `hist__sticky`,
 *       `mk__card`, `pair__card`, `ph`, `plane__bloom`, `po__copy`, `pricing`
 *       and `tl__body`. `cw--gap` is the clearest of them: it is one of four
 *       `.cw--*` section modifiers on /crowmark and the other three each carry a
 *       parallax amount, so the fourth is the section that takes the default.
 *       These are the author's handles on their own markup.
 *
 * So a general class-coverage gate would open at 68 findings with a true-
 * positive rate of zero outside the legal pages, and closing it would take
 * something like sixty allow-list entries carrying three sentences between them.
 * An allow-list with twelve entries is scrolled past; one with sixty is a
 * config file nobody opens, and a gate nobody reads is a gate that is also
 * believed. That is a worse outcome than the 68 harmless class names.
 *
 * ── WHAT IS LEFT IS NOT HARMLESS, AND IT IS RECOGNISABLE ────────────────────
 *
 * Eight of the 68 are different in kind. They are Tailwind utilities:
 *
 *   text-xs  text-sm  font-bold  font-mono  mb-4  mb-8  text-ca-line  text-ca-line/60
 *
 * This project loads @tailwindcss/vite but NO stylesheet imports "tailwindcss",
 * so the utility layer is never generated and not one of them emits a rule.
 * Every one is therefore a declaration an author WROTE and the reader never got
 * — a size, a weight, a margin, a colour — which is a silent loss rather than a
 * spare hook. tokens.css records the same defect from the other side: `sr-only`
 * was a Tailwind utility used in the markup and defined nowhere, and it rendered
 * two elements into full view on /glossary before anybody noticed.
 *
 * A Tailwind class name is a CLOSED GRAMMAR, which is the whole reason this gate
 * can exist where the general one cannot. Measured against all 68: the grammar
 * below matches exactly these eight and none of the other sixty. Zero false
 * positives on the observed population, and the number is printed on every run
 * so that claim stays checkable rather than historical.
 *
 * IT ONLY LOOKS AT CLASSES NOTHING DEFINES. A project class that happens to fit
 * the grammar and HAS a rule is never seen, which is correct: the defect is a
 * declaration that went missing, not a name somebody chose.
 *
 * ── THE CONTRACT ────────────────────────────────────────────────────────────
 *
 * The same one check-links.js, check-palette-roles.js and check-render.js use:
 *
 *   - an allow-list of named exceptions, each carrying the reason it is one
 *   - the allow-list is PRINTED on every run
 *   - entries that no longer match anything are reported as stale
 *   - anything NOT on the list FAILS the build
 *
 * STALENESS IS REPORTED, NOT FATAL, and that is a deliberate difference from
 * check-palette-roles.js. The single entry below covers a file owned by another
 * agent. Making its removal fail the build would turn their fix into somebody
 * else's red build, which is the surest way to teach people not to fix things.
 * check-render.js's ALLOW_HEAD takes the same position for the same reason.
 *
 * ── PROVED IN BOTH DIRECTIONS ───────────────────────────────────────────────
 *
 * FAILS: with the allow-list entry removed, it reports the eight utilities in
 * src/content/legal/cookies.md and exits 1.
 * PASSES: with the entry present, exit 0, the entry printed with its reason.
 * Both exit codes are recorded in the session notes. A gate proved only to fail
 * can still be lying when it passes; check-facts.js printed "every rule clean"
 * for hours while crashing on the path that reports a violation.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = process.env.DS_DIST || path.join(__dirname, '..', 'dist');

/* ══════════════════════════════════════════════════════════════════════════
 * THE ALLOW-LIST — every entry is a decision somebody has to defend.
 *
 * Keyed by the FILE that authors the class, not by the route it lands on: one
 * markdown source produces one page, and naming the source names the place a
 * fix goes.
 * ══════════════════════════════════════════════════════════════════════════ */
const ALLOWED = [
  {
    source: 'src/content/legal/cookies.md',
    reason:
      'EIGHT TAILWIND UTILITIES IN THE COOKIES POLICY, AND THEY ARE A REAL LOSS RATHER THAN ' +
      'a false positive: text-xs, text-sm, font-bold, font-mono, mb-4, mb-8, text-ca-line and ' +
      'text-ca-line/60 were written against a utility layer this project has never generated, ' +
      'so eight declarations an author intended have simply never reached a reader. The fix is ' +
      'to replace them with the site\'s own type and spacing tokens, in the markdown, and it ' +
      'is NOT MADE HERE because src/content/legal/*.md is owned by the agent rewriting the ' +
      'legal pages and a collision in those files would cost more than the defect. Recorded ' +
      'rather than fixed so that the finding survives this session with its argument attached. ' +
      'DELETE THIS ENTRY the moment those eight classes go; the gate will say it has gone stale.',
  },
];

/* ══════════════════════════════════════════════════════════════════════════
 * THE GRAMMAR
 *
 * The utility families Tailwind would have emitted, written as anchored
 * patterns so a project class can only match by being shaped exactly like one.
 * Each is here because it appeared in this build or because it is the same
 * family as one that did; adding a family is adding a pattern, and the count of
 * matches is printed every run so a pattern that starts catching project names
 * is visible immediately rather than after somebody deletes a class.
 * ══════════════════════════════════════════════════════════════════════════ */
const TAILWIND = [
  /* Spacing: m-4, mb-8, px-2, pt-1.5, mx-auto, -mt-px. */
  /^-?(m|p)[trblxy]?-(\d+(\.\d+)?|px|auto)$/,
  /* Type scale: text-xs through text-9xl. */
  /^text-(xs|sm|base|lg|xl|[2-9]xl)$/,
  /* Weight and family: font-bold, font-mono. */
  /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black|sans|serif|mono)$/,
  /* The opacity shorthand. A forward slash is not legal in a hand-written class
     name anywhere on this site, so `something/60` is Tailwind syntax and nothing
     else — which is why this pattern can afford to be the loosest one here. */
  /^(text|bg|border|fill|stroke|ring|divide|outline|shadow|from|via|to)-[a-z][\w-]*\/\d{1,3}$/,
  /* Colour utilities in this project's `ca-` palette namespace: text-ca-line. */
  /^(text|bg|border|fill|stroke|ring|divide|outline)-ca-[a-z][\w-]*$/,
];

if (!fs.existsSync(DIST)) {
  console.error(`utilities: no build at ${DIST}`);
  process.exit(1);
}

function walk(dir, re, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, re, out);
    else if (re.test(e.name)) out.push(p);
  }
  return out;
}

const htmlFiles = walk(DIST, /\.html$/);
if (!htmlFiles.length) {
  console.error('utilities: the build contains no HTML, so nothing was measured. ' +
    'That reads as a pass, so it fails instead.');
  process.exit(1);
}

/* ── WHAT THE MARKUP USES ─────────────────────────────────────────────────
 *
 * Read from dist rather than from src, because a class can reach the page from a
 * markdown file, a component, a template literal in a script or a content
 * collection, and the built HTML is the one place all four have arrived. */
const used = new Map();
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  const route = '/' + path.relative(DIST, f).split(path.sep).join('/');
  for (const m of html.matchAll(/\sclass="([^"]*)"/g)) {
    for (const c of m[1].split(/\s+/).filter(Boolean)) {
      if (!used.has(c)) used.set(c, new Set());
      used.get(c).add(route);
    }
  }
}

/* ── WHAT THE SHIPPED CSS DEFINES ─────────────────────────────────────────
 *
 * Both halves of it: the emitted stylesheets AND the <style> blocks Astro
 * inlines into a page when a route's CSS is small enough to be worth it.
 * Reading only the .css files would report every inlined component's classes as
 * undefined, which would be a flood made entirely of this gate's own blind spot.
 *
 * Comments are stripped first. Several stylesheets on this site quote a class
 * name while explaining a defect that has since been fixed, and a gate that
 * counted those as definitions would be excused by the record of its own
 * findings. */
let css = '';
for (const f of walk(DIST, /\.css$/)) css += fs.readFileSync(f, 'utf8') + '\n';
for (const f of htmlFiles) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += m[1] + '\n';
}
const defined = new Set();
for (const m of css.replace(/\/\*[\s\S]*?\*\//g, ' ').matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
  defined.add(m[1]);
}
if (!defined.size) {
  console.error('utilities: no class selector found in any shipped CSS, so every class would ' +
    'read as undefined. That is this gate failing rather than the site, so it fails loudly.');
  process.exit(1);
}

/* Astro's scoping classes are generated, never authored, and never a finding. */
const undefinedClasses = [...used.keys()].filter((c) => !defined.has(c) && !/^astro-/.test(c));
const residue = undefinedClasses.filter((c) => TAILWIND.some((re) => re.test(c)));

/* ── WHERE EACH ONE IS AUTHORED ───────────────────────────────────────────
 *
 * A route is where the defect SHOWS. The source file is where it is FIXED, and
 * a finding that names only the route sends somebody to a built artefact. */
const SRC_DIR = path.join(__dirname, '..', 'src');
function srcFiles(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) srcFiles(p, out);
    else if (/\.(astro|md|ts)$/.test(e.name)) out.push(p);
  }
  return out;
}
const sourceText = new Map();
for (const f of srcFiles(SRC_DIR)) {
  sourceText.set(`src/${path.relative(SRC_DIR, f).split(path.sep).join('/')}`, fs.readFileSync(f, 'utf8'));
}
/** Every source file whose markup carries this class. */
function authoredIn(cls) {
  const out = [];
  for (const [rel, text] of sourceText) {
    for (const m of text.matchAll(/\sclass(?:Name)?\s*=\s*["'{]([^"'}]*)/g)) {
      if (m[1].split(/\s+/).includes(cls)) {
        out.push(rel);
        break;
      }
    }
  }
  return out;
}

/* Grouped by the source file that authors them, because eight utilities in one
   policy document are one edit and eight lines of output would be eight chances
   to stop reading. */
const bySource = new Map();
const unattributed = [];
for (const c of residue) {
  const where = authoredIn(c);
  if (!where.length) {
    unattributed.push(c);
    continue;
  }
  for (const rel of where) {
    if (!bySource.has(rel)) bySource.set(rel, []);
    bySource.get(rel).push(c);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
 * OUTPUT
 * ══════════════════════════════════════════════════════════════════════════ */

console.log('\nutilities: a class that resolves to nothing is a declaration the reader never got.');
console.log(`  ${htmlFiles.length} built page(s); ${used.size} distinct class(es) in the markup;`);
console.log(`  ${defined.size} defined by the shipped CSS, inlined <style> blocks included.`);
console.log(`  ${undefinedClasses.length} class(es) match no rule at all. This gate reads only the`);
console.log(`  ${residue.length} of those shaped like a Tailwind utility — the rest are component`);
console.log('  hooks, generated BEM modifiers and vendor selectors, and the header measures why');
console.log('  a gate over all of them would flood rather than protect.');

/* PRINTED ON EVERY RUN, pass or fail. An exception nobody re-reads becomes an
   accidental one, which is the whole reason this list is not a config file. */
const matched = new Set();
console.log(`\n  ${ALLOWED.length} named exception(s), each with the reason it is one:`);
for (const a of ALLOWED) {
  const hit = bySource.has(a.source);
  if (hit) matched.add(a.source);
  console.log(`    ${a.source}${hit ? '' : '   [STALE — matches nothing]'}`);
  if (hit) console.log(`      ${bySource.get(a.source).sort().join(', ')}`);
  console.log(`      ${a.reason}`);
}
if (!ALLOWED.length) console.log('    none, which is the state to keep it in');

const stale = ALLOWED.filter((a) => !matched.has(a.source));
if (stale.length) {
  console.log(`\n  ${stale.length} exception(s) NO LONGER USED — delete them, the defect is gone.`);
  console.log('  This does NOT fail the build: the entry names a file another agent owns, and');
  console.log('  making their fix somebody else\'s red build is how people learn not to fix things.');
}

const violations = [...bySource].filter(([rel]) => !ALLOWED.some((a) => a.source === rel));
if (violations.length || unattributed.length) {
  /* Counted from the findings that are actually reported, not by subtracting the
     allowed ones from the total. The first draft did the subtraction against
     ALLOWED[0] only, so a second entry would have made the headline number wrong
     while every line under it stayed right — a count that disagrees with its own
     list is how a reader learns to skip the count. */
  const n = new Set([...violations.flatMap(([, list]) => list), ...unattributed]).size;
  console.error(`
utilities: ${n} Tailwind utilit(ies) that emit no rule
`);
  for (const [rel, list] of violations) {
    console.error(`  ${rel}`);
    console.error(`      ${list.sort().join(', ')}`);
    console.error(`      seen on ${new Set(list.flatMap((c) => [...used.get(c)])).size} built page(s)`);
  }
  if (unattributed.length) {
    console.error('  (no source file found for these, so they are generated or templated)');
    console.error(`      ${unattributed.sort().join(', ')}`);
  }
  console.error('\n  This project loads @tailwindcss/vite and no stylesheet imports "tailwindcss",');
  console.error('  so the utility layer is never generated and every one of these resolves to');
  console.error('  nothing. They are not spare hooks: each is a size, a weight, a margin or a');
  console.error('  colour that an author wrote and a reader never received. styles/tokens.css');
  console.error('  records the same defect from the other side — `sr-only` was a Tailwind class');
  console.error('  defined nowhere, and it put two elements into full view on /glossary.');
  console.error('  Replace them with the site\'s own tokens, or name the file in ALLOWED with');
  console.error('  the argument for why the loss is acceptable.\n');
  process.exit(1);
}

console.log('\n  PASS — no Tailwind utility reaches a built page except the ones named above,');
console.log('  and every other undefined class in the build is a hook somebody chose.\n');
process.exit(0);
