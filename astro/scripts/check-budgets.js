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
     inlining, not to raise the limit". 43 of 44 routes meet it with room. */
  htmlPerRoute: 100 * KB,

  /* Unchanged. It was met on 2026-08-03 at 162 KB with 38 KB of headroom, and
     was broken the next day by a day of design-system work adding seven new
     stylesheets. That is a budget doing its job late, not a wrong budget. */
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
 * THE EXCEPTIONS. Four, each a recorded breach with a ceiling of its own.
 * Keys are `<budget>:<subject>`.
 * ══════════════════════════════════════════════════════════════════════════ */
const EXCEPTIONS = new Map([
  [
    'htmlPerRoute:crowmark/index.html',
    {
      ceiling: 116 * KB,
      why:
        'Measured 112.3 KB on 2026-08-04, against a 100 KB budget. It was 95.7 KB when OWNER-FEEDBACK-LOG.md recorded it, 99 KB before this week and 108 KB earlier the same night, so it is growing rather than sitting still. The cause is the one the budget note predicts: Astro inlines small component styles, and /crowmark carries more distinct sections than any other route. The route must come back under 100 KB and the fix is to stop inlining, not to raise this. The 4 KB between the measurement and the ceiling is there so an ordinary copy edit does not fail somebody else\'s build; it is not an allowance.',
    },
  ],
  [
    'cssTotal:all',
    {
      ceiling: 232 * KB,
      why:
        '216.4 KB across 17 files on 2026-08-04, against 200 KB. It measured 229.4 KB across 18 a few hours earlier in the same session, and 162 KB the day before. The excess arrived with seven new stylesheets — labels, blocks, timeline, duty-card, alignment, links and headings — every one of them a CENTRALISING sheet that exists to delete per-page copies, and the 13 KB it has already given back is those deletions starting to land. It is expected to keep falling, so re-measure before treating this as a new normal.',
    },
  ],
  [
    'jsTotal:all',
    {
      ceiling: 5 * KB,
      why:
        '4,283 B in one file, against a budget of zero. It is Astro\'s bundle of a single <script> in src/pages/index.astro; the filename carries a content hash and changes whenever that script does, so this entry is keyed on the total rather than on a path. Zero was a ratchet meant to be released by an ADR, and no ADR was written — so the number stands and this records what crossed it. The likely fix is `is:inline`, which moves the bytes into index.html (90.7 KB, so there is room) and returns the file count to zero, but it puts an inline script in front of check-csp.js and that is a change to make deliberately rather than to slip in beside a budget gate.',
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
