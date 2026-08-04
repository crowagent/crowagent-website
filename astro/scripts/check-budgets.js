/**
 * check-budgets.js — the payload budgets in specs/architecture/PERFORMANCE-BUDGETS.md
 * are numbers this build has to meet, not numbers a document says it meets.
 *
 * ── WHY ─────────────────────────────────────────────────────────────────────
 *
 * PERFORMANCE-BUDGETS.md opened its budget table with the sentence "Enforced per
 * route on the built output, so a regression fails the build rather than being
 * noticed later." Nothing enforced any of it. Measured on 2026-08-04, one day
 * after the document was written, five of its six budgets were already breached:
 *
 *     HTML per route   100 KB   /crowmark was 112.3 KB
 *     CSS total        200 KB   216.4 KB across 17 files
 *     JS total           0 KB   4.18 KB in 1 file
 *     Single image     250 KB   293.9 KB (uk-parliament-westminster.jpg)
 *     Whole build        8 MB   13.05 MB
 *
 * Payload was the measured defect on the legacy site. A budget that only exists
 * in prose did not stop any of that, and the claim that it was enforced is the
 * more expensive half: it stops anyone looking.
 *
 * ── TWO OF THOSE FIVE ARE CLOSED, LATER THE SAME DAY ────────────────────────
 *
 * R-02. Both were closed by the same two CENTRAL changes, which is the only kind
 * that could close them — every route carries the same chrome, so a per-page edit
 * was never going to reach a number that 44 documents pay:
 *
 *   1. astro.config.mjs `scopedStyleStrategy: 'class'`. Astro's default stamps
 *      ` data-astro-cid-ivyj52o5` — 24 bytes — on every element of every
 *      component carrying a <style>. On /crowmark that was 813 elements and
 *      19.2 KB, 17% of the document. The class form is the same mechanism at the
 *      same specificity and costs 15 bytes on an element that already has a
 *      class. It also took the CSS total from 213.6 KB to 193.7 KB, because the
 *      compiled selectors shrank with it, which is what closed the second
 *      breach.  /crowmark 113,285 B -> 108,023 B.
 *
 *   2. The command palette's index moved out of the markup and into
 *      src/pages/search-index.json.ts. It was a <script type="application/json">
 *      in a component rendered by the nav, so a BYTE-FOR-BYTE IDENTICAL 7.1 KB
 *      shipped in all 44 documents — 313 KB of build — in critical HTML, before
 *      the reader pressed anything, for a panel bound to ⌘K.  108,023 B ->
 *      101,253 B, and every other route fell by the same 6.8 KB.
 *
 * Neither deleted a word of content, which was the condition: the budget note
 * below says the answer to a route over the limit is to stop inlining rather
 * than to raise the limit, and both of these are that.
 *
 * WHAT IS LEFT ON /crowmark, measured, for whoever it binds next. Roughly 10 KB
 * of identical shared script is still INLINED into all 44 documents — the nav
 * dropdown, the focus trap, the palette behaviour, the ⌘K badge — because the
 * `jsTotal` ratchet below is zero and externalising it would breach that budget
 * instead of this one. The two budgets are in tension and only an ADR can settle
 * it. After that, ~5.3 KB of scope classes belonging to src/pages/crowmark.astro's
 * own 22 KB <style>, which would go to nothing if that sheet moved to
 * src/styles/ the way seven others already have.
 *
 * ── THE CONTRACT, WHICH IS THE SAME AS EVERY OTHER GATE HERE ────────────────
 *
 *   · Every exception is NAMED, carries a WRITTEN REASON and its own CEILING.
 *   · Every exception is PRINTED on every run, whether or not it is near its
 *     ceiling. An exception nobody sees stops being an exception.
 *   · A STALE exception — one whose subject is now inside the budget, or has
 *     gone — is reported so it can be deleted.
 *   · Anything NOT listed FAILS.
 *
 * An exception is a record of a breach. It is not permission to spend the gap
 * between the measurement and the ceiling.
 *
 * ── WHAT IT DELIBERATELY DOES NOT MEASURE ───────────────────────────────────
 *
 * IMAGES PER ROUTE, which PERFORMANCE-BUDGETS.md lists at 1,200 KB and marks
 * "not yet measured per route". It stays unmeasured here. Every image on this
 * site is served through a <picture> with AVIF, WebP and PNG alternates, or a
 * srcset ladder at 400/600/800/1200w, and a browser downloads exactly ONE
 * candidate from each. Summing the files a route references counts three to
 * four times what any reader actually pays; picking a candidate means guessing
 * which one. Either way the number would be wrong in a direction nobody could
 * predict, and the document's own rule applies — a number without a source is
 * not a number.
 *
 * ── SCOPE ───────────────────────────────────────────────────────────────────
 *
 * Reads `dist`, and only `dist`. Every other consideration on this site is a
 * source question; payload is the one thing where the built artefact is the
 * only honest subject. It runs last in the chain for the same reason.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

const KB = 1024;
const MB = 1024 * 1024;

/* ══════════════════════════════════════════════════════════════════════════
 * THE BUDGETS. Five of the six in PERFORMANCE-BUDGETS.md, unchanged, except
 * the whole-build figure — see its note.
 * ══════════════════════════════════════════════════════════════════════════ */
const BUDGETS = {
  /* Unchanged, and it is a considered number rather than a headroom figure:
     the document argues that if a route crosses it "the answer is to stop
     inlining, not to raise the limit". All 44 routes meet it, and it is not
     carrying an exception any more — see the note at the head of this file for
     what closed the one it had.

     THE MARGIN ON /crowmark IS 1.1 KB and that is worth knowing before you edit
     it: 101,253 B against 102,400. It is the largest document on the site by
     9.5 KB and the only one anywhere near this line, so a section added to that
     page will fail this gate, and correctly — the two remaining levers are named
     at the head of this file and both are central. Raising the number instead is
     the move the budget exists to prevent. */
  htmlPerRoute: 100 * KB,

  /* Unchanged. It was met on 2026-08-03 at 162 KB with 38 KB of headroom, broken
     the next day by a day of design-system work adding seven new stylesheets,
     and met again the same day at 193.7 KB across 16 — not by deleting a
     stylesheet but because `scopedStyleStrategy: 'class'` shortened every
     compiled scoped selector on the site. That is a budget doing its job late,
     not a wrong budget. */
  cssTotal: 200 * KB,

  /* Zero, and not a typo — the document calls it a ratchet, changed "by an
     explicit decision recorded as an ADR, rather than by a dependency arriving
     unnoticed". One arrived unnoticed. It is listed below rather than absorbed. */
  jsTotal: 0,

  /* Unchanged. */
  singleImage: 250 * KB,

  /* RAISED from 8 MB to 14 MB, and this is the one number here that is not the
     document's.
     *
     * The 8 MB was written on 2026-08-03 as "6.0 MB measured, 2 MB headroom" —
     * a headroom figure, not a reasoned limit, and the only budget in the table
     * with no argument under it. On the SAME DAY the owner approved sixteen
     * drawn product screens, which ship as PNG/WebP/AVIF triples and weigh
     * 4.2 MB. The budget was therefore stale within hours of being written, by
     * a decision taken after it and above it.
     *
     * It is also the least meaningful of the six: no reader downloads the whole
     * build. It is a repo-hygiene ratchet, which is worth having and is worth
     * being honest about.
     *
     * 14 MB against 13.05 MB measured. The headroom is small on purpose, and
     * there is a known 1.94 MB sitting inside it: the WebP tier of those
     * sixteen screens is LARGER than the PNG tier on all 16 of 16 files
     * (1.94 MB against 1.13 MB), because they are flat-colour interface
     * drawings, which PNG encodes better than a lossy codec. Any browser that
     * takes the WebP source is downloading more than the PNG fallback it was
     * put there to improve on. Retiring that tier removes 1.94 MB and makes
     * every non-AVIF browser faster; it needs an owner decision because it
     * deletes published assets, and it is the first place to look when this
     * budget next binds. */
  wholeBuild: 14 * MB,
};

/* ══════════════════════════════════════════════════════════════════════════
 * THE EXCEPTIONS. Two, each a recorded breach with a ceiling of its own.
 * Keys are `<budget>:<subject>`.
 *
 * IT WAS FOUR ON 2026-08-04. `htmlPerRoute:crowmark/index.html` (112.3 KB, with
 * a 116 KB ceiling) and `cssTotal:all` (216.4 KB, 232 KB) are DELETED because
 * their subjects came back inside the budget — 98.9 KB and 193.7 KB — not
 * because the numbers moved. The head of this file records what closed them.
 * The crowmark entry ended its own reason with "the fix is to stop inlining,
 * not to raise this", and it is deleted rather than re-ceilinged because that
 * is what was done.
 * ══════════════════════════════════════════════════════════════════════════ */
const EXCEPTIONS = new Map([
  [
    'jsTotal:all',
    {
      ceiling: 5 * KB,
      why:
        '4,283 B in one file, against a budget of zero. It is Astro\'s bundle of a single <script> in src/pages/index.astro; the filename carries a content hash and changes whenever that script does, so this entry is keyed on the total rather than on a path. Zero was a ratchet meant to be released by an ADR, and no ADR was written — so the number stands and this records what crossed it. The likely fix is `is:inline`, which moves the bytes into index.html (79.1 KB, so there is room) and returns the file count to zero, but it puts an inline script in front of check-csp.js and that is a change to make deliberately rather than to slip in beside a budget gate.',
    },
  ],
  [
    'singleImage:Assets/blog-photos/uk-parliament-westminster.jpg',
    {
      ceiling: 296 * KB,
      why:
        '300,939 B against 250 KB. It is the JPEG FALLBACK of a four-width AVIF/WebP ladder, so it is served only to a browser that can take neither modern format — which on this site is a browser that cannot render the CSS either. Nobody is measurably paying for it, and re-encoding it is a one-line job for whoever next runs scripts/build-blog-photos.mjs. Listed rather than fixed here because the blog photo set is under active work and re-encoding somebody else\'s asset mid-pass is how two people produce three versions of one file.',
    },
  ],
]);

/* ── Measure ──────────────────────────────────────────────────────────────── */

if (!fs.existsSync(DIST)) {
  console.error('budgets: no dist/ to measure. This gate runs after the build, not instead of it.');
  process.exit(1);
}

const routes = [];
const images = [];
let cssTotal = 0;
let cssFiles = 0;
let jsTotal = 0;
let jsFiles = 0;
let buildTotal = 0;

const IMAGE_EXT = new Set(['.png', '.webp', '.avif', '.jpg', '.jpeg', '.gif', '.svg']);

(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
      continue;
    }
    const size = fs.statSync(full).size;
    const rel = path.relative(DIST, full).split(path.sep).join('/');
    const ext = path.extname(entry.name).toLowerCase();
    buildTotal += size;
    if (ext === '.html') routes.push({ rel, size });
    else if (ext === '.css') { cssTotal += size; cssFiles += 1; }
    else if (ext === '.js') { jsTotal += size; jsFiles += 1; }
    else if (IMAGE_EXT.has(ext)) images.push({ rel, size });
  }
})(DIST);

if (routes.length === 0) {
  console.error('budgets: dist/ holds no HTML at all. Refusing to pass by finding nothing to check.');
  process.exit(1);
}

routes.sort((a, b) => b.size - a.size);
images.sort((a, b) => b.size - a.size);

/* ── Judge ────────────────────────────────────────────────────────────────── */

const failures = [];
/** Exception keys that actually matched something over budget this run. */
const used = new Set();

/**
 * One rule: over the budget is a failure unless an exception names it, and an
 * exception only holds up to its own ceiling. Over the ceiling is a failure the
 * exception cannot absorb, which is what stops a listed breach from drifting.
 */
function judge(key, subject, actual, budget) {
  if (actual <= budget) return;
  const allowed = EXCEPTIONS.get(key);
  if (!allowed) {
    failures.push({ subject, actual, budget, ceiling: null });
    return;
  }
  used.add(key);
  if (actual > allowed.ceiling) {
    failures.push({ subject, actual, budget, ceiling: allowed.ceiling });
  }
}

for (const r of routes) judge(`htmlPerRoute:${r.rel}`, `/${r.rel}`, r.size, BUDGETS.htmlPerRoute);
for (const i of images) judge(`singleImage:${i.rel}`, i.rel, i.size, BUDGETS.singleImage);
judge('cssTotal:all', `CSS total (${cssFiles} files)`, cssTotal, BUDGETS.cssTotal);
judge('jsTotal:all', `JS total (${jsFiles} file${jsFiles === 1 ? '' : 's'})`, jsTotal, BUDGETS.jsTotal);
judge('wholeBuild:all', 'whole build', buildTotal, BUDGETS.wholeBuild);

/* ── Report, every run, whether or not anything failed ────────────────────── */

const kb = (n) => `${(n / KB).toFixed(1)} KB`;
const mb = (n) => `${(n / MB).toFixed(2)} MB`;

const worst = routes[0];
const median = routes[Math.floor(routes.length / 2)].size;

console.log(`budgets: ${routes.length} route(s) measured in dist/`);
console.log(`  HTML per route   ${kb(BUDGETS.htmlPerRoute).padStart(9)}   worst ${kb(worst.size)} (/${worst.rel}), median ${kb(median)}`);
console.log(`  CSS total        ${kb(BUDGETS.cssTotal).padStart(9)}   ${kb(cssTotal)} across ${cssFiles} file(s)`);
console.log(`  JS total         ${kb(BUDGETS.jsTotal).padStart(9)}   ${kb(jsTotal)} across ${jsFiles} file(s)`);
console.log(`  Any single image ${kb(BUDGETS.singleImage).padStart(9)}   largest ${kb(images[0].size)} (${images[0].rel})`);
console.log(`  Whole build      ${mb(BUDGETS.wholeBuild).padStart(9)}   ${mb(buildTotal)}`);

console.log(`\n  ${EXCEPTIONS.size} recorded exception(s), each a breach with a ceiling:`);
for (const [key, { ceiling, why }] of EXCEPTIONS) {
  console.log(`    ${key}`);
  console.log(`        ceiling ${kb(ceiling)}`);
  console.log(`        ${why}`);
  if (!used.has(key)) {
    console.log('        ⚠ STALE — nothing exceeded its budget under this key on this run.');
    console.log('          Either it came back inside the budget, or the subject is gone. Delete the entry.');
  }
}

if (failures.length) {
  console.error(`\nbudgets: ${failures.length} over budget\n`);
  for (const f of failures) {
    console.error(`  ${f.subject}`);
    console.error(`      ${kb(f.actual)} against a budget of ${kb(f.budget)}`);
    if (f.ceiling !== null) {
      console.error(`      and past the ${kb(f.ceiling)} ceiling its recorded exception allows`);
      console.error('      An exception is a record of a breach, not room to grow into.');
    } else {
      console.error('      Not listed. Bring it under the budget, or add an entry to EXCEPTIONS in');
      console.error('      check-budgets.js with a ceiling and a written reason somebody can argue with.');
    }
  }
  console.error('\n  Payload was the measured defect on the legacy site. These numbers are the');
  console.error('  guard, and specs/architecture/PERFORMANCE-BUDGETS.md is where they are argued.\n');
  process.exit(1);
}

console.log('\n  every route, sheet, script and image is inside its budget or inside a');
console.log('  recorded exception, and the whole build is inside 14 MB');
