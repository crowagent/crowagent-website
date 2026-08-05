/**
 * check-shared-blocks.js — a block that appears on more than one route has
 * exactly ONE definition, and the drawing it produces is measured.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 * A-45. The hero proof card, `.duty`, was written out in full in TWO page files:
 * src/pages/crowmark.astro and src/pages/crowmark-buyers.astro. About 190 lines
 * of CSS each and forty of markup, hand-copied down to the rotate(5deg), the
 * -13% and -7% ghost offsets and the 6% / -4% bleed, plus three citation strings
 * that were identical character for character.
 *
 * THE PART THAT MATTERS IS HOW IT SURVIVED AN AUDIT THAT MEASURES THE RENDERED
 * PAGE. It survived because a careful hand-copy renders identically. Measured on
 * 2026-08-04 before the consolidation, at 1440 / 834 / 390, across 43 computed
 * properties on 17 elements, the two cards agreed on every structural property
 * at every width — the same 35 / 30 / 14 px of ghost bleed, the same tilt, the
 * same type metrics. check-treatments.js counts how many ways a job is drawn and
 * the answer here was honestly ONE. The defect was never in the pixels. It was
 * that the one drawing had two definitions, so the next edit to either was a
 * coin toss, and on 2026-08-04 the CM-01 fixes had to be applied to both by hand
 * precisely because fixing one would have shipped two cards that disagreed.
 *
 * So this gate asks the question check-treatments.js cannot: not "how many
 * recipes render" but "how many places is the recipe WRITTEN".
 *
 * ── THE THREE RULES, AND NONE OF THEM IS SUFFICIENT ALONE ───────────────────
 *
 *   1. ONE DEFINITION (source). No file other than the owning stylesheet may
 *      declare a rule for the block. This is the only rule a hand-copy cannot
 *      satisfy by being careful.
 *
 *      It reads SOURCE and not the bundles, for the reason check-design-system.js
 *      states: Astro bundles many components into one hashed sheet, so a bundle
 *      can say a duplicate exists and cannot say who wrote it.
 *
 *   2. ONE RECIPE (rendered). Every element playing a role in the block is
 *      fingerprinted from its COMPUTED style on every route the block appears
 *      on, and a second fingerprint for one role fails. Rule 1 stops a copy
 *      being written; this stops the block being overridden into a second
 *      appearance from somewhere rule 1 does not look — a scoped page rule using
 *      a different selector, a utility class, an inline style.
 *
 *   3. THE ARITHMETIC (rendered). The drawing makes claims that are ratios:
 *      the PPN 002 segment is 10% of its track, the decorative planes bleed
 *      exactly 4% past the wrapper, and the tilt is present above 1100px and
 *      absent below it. Those are the statements the artefact exists to make,
 *      and they are checked as ratios rather than pixels so the check survives
 *      the two cards holding different words.
 *
 *      RULE 3 IS THE ONE THAT PROTECTS A FACT RATHER THAN A LOOK. A bar drawn at
 *      15% of its track under a caption reading "10% minimum" would pass rules 1
 *      and 2 without complaint — one definition, one recipe, and a picture that
 *      contradicts the instrument it cites.
 *
 * ── THE CONTRACT, WHICH IS THE ONE EVERY GATE HERE USES ─────────────────────
 *
 * Named exceptions, each carrying a written reason. All of them printed on every
 * run. Exceptions matching nothing are reported as stale. Anything not listed
 * fails the build.
 *
 * ── AND THE HALF THAT STOPS THE GATE PASSING BY FINDING NOTHING ─────────────
 *
 * Every rule above is satisfied trivially if the block stops existing. So the
 * registry states how many rules the owning stylesheet must declare and how many
 * routes must render the block, and a count below either FAILS. check-facts.js
 * once printed "every rule clean" while crashing on its reporting path, and
 * verify-restorations.mjs asserted a frosted mega-menu that was drawing nothing:
 * on this codebase a gate that cannot fail is the normal failure, not the
 * unusual one.
 *
 * ── PROVED IN BOTH DIRECTIONS ON 2026-08-04 ─────────────────────────────────
 *
 * FAILS (exit 1), each rule proved on its own:
 *
 *   rule 1  one `.duty__fig` declaration added back to crowmark.astro's scoped
 *           <style>. Reported as "src/pages/crowmark.astro:1077 .duty__fig",
 *           with the file and line a person opens.
 *   rule 2  a `.duty__fig` override injected into the built HTML of ONE route.
 *           Reported at all three widths, naming only the two properties that
 *           differ — fontWeight 400 against 800, letterSpacing normal against
 *           -1.728px — rather than two 46-property fingerprints to diff by eye.
 *   rule 3  the bar segment widened from 10% to 15% in the built bundle, with
 *           the caption left reading "10% minimum". Reported on both routes at
 *           all three widths as "the PPN 002 segment is 15.04% of its track,
 *           not 10%". Rules 1 and 2 both passed on that build, which is the
 *           point of rule 3 existing.
 *
 * PASSES (exit 0): against the consolidated build.
 *
 * Both halves are run, because a gate proved only to fail can still be lying
 * when it passes.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serveDist, routesOf } from './lib/dist-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = process.env.SB_DIST || path.join(ROOT, 'dist');

/* ── THE REGISTRY ───────────────────────────────────────────────────────────
 *
 * ONE ENTRY TODAY, AND THAT IS THE RIGHT TIME TO BUILD THE REGISTRY RATHER THAN
 * A ONE-OFF CHECK. card-row.css makes the argument in its own header: one
 * instance is exactly when to centralise, because the second instance is how
 * `.btn-row` came to replace fourteen containers and the fourteenth is where it
 * stops being cheap. Adding the next shared block is one object here.
 */
const BLOCKS = [
  {
    name: 'duty',
    /* The BEM block. Every selector containing this token is the block's. */
    prefix: 'duty',
    /* The one file allowed to declare it, relative to astro/. */
    owner: 'src/styles/duty-card.css',
    /* The one file allowed to draw it. Reported, not enforced by rule 1 — a
       component holds markup, not CSS rules, so rule 1 never sees it. */
    component: 'src/components/sections/DutyCard.astro',
    /* Below this many declared rules in the owner, the recipe has been gutted
       and every rule below would pass on an empty page. The owner declares 24
       as measured on 2026-08-04; the floor sits under that so that ordinary
       editing does not trip it and a deletion does. */
    minRules: 18,
    /* The block must actually render somewhere. Two routes today. */
    minRoutes: 2,
    /* Each role is one element of the drawing, and each is entitled to exactly
       one computed recipe across every route. */
    roles: [
      '.duty',
      '.duty__ghost--far',
      '.duty__ghost--mid',
      '.duty__face',
      '.duty__kicker',
      '.duty__rows',
      '.duty__row',
      '.duty__fig',
      '.duty__lbl',
      '.duty__lbl span',
      '.duty__pip',
      '.duty__barlbl',
      '.duty__bar',
      '.duty__fill',
      '.duty__legend',
      '.duty__legend b',
      '.duty__legend span',
    ],
    why:
      'The hero proof card on /crowmark and /crowmark-buyers. It states three ' +
      'statutory figures against the instruments that set them, so it is the one ' +
      'artefact on either page whose correctness can be checked against a ' +
      'published document — which is exactly why it must not exist twice.',
  },
];

/* ── EXCEPTIONS ─────────────────────────────────────────────────────────────
 *
 * Keyed by block and by the thing being excused, so an entry can only excuse
 * what it names. A reason that only says "intentional" is not a reason.
 */

/* Files other than the owner allowed to declare a block's rules.
 *
 * THIS LIST IS EMPTY AND SHOULD STAY EMPTY. It is the whole rule. An entry here
 * is a second definition, which is the defect, written down and waved through. */
const ALLOW_DECLARER = [];

/* Roles allowed a second computed recipe. Also empty: two appearances of one
   drawing is the thing being prevented, not a case to be argued. */
const ALLOW_RECIPE = [];

/* ── RULE 1: ONE DEFINITION ─────────────────────────────────────────────────
 *
 * Reads every stylesheet and every .astro <style> block under src/, strips
 * comments, and collects the PRELUDE of each rule — the selector list before the
 * opening brace. A prelude naming the block outside the owner is a second
 * definition.
 *
 * Comments are stripped first and that is load-bearing: this codebase documents
 * at length, both pages now carry a note explaining where the recipe went, and
 * every one of those notes mentions the selector by name. A gate that read them
 * as declarations would fail on its own paper trail.
 */
function cssTextOf(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.css')) return [{ css: text, offset: 0 }];
  /* .astro — every <style> block, with the offset of each so a violation can
     name a line number in the file a person opens rather than in a fragment. */
  const out = [];
  const re = /<style[^>]*>([\s\S]*?)<\/style>/g;
  for (const m of text.matchAll(re)) out.push({ css: m[1], offset: m.index + m[0].indexOf(m[1]) });
  return out;
}

/** Line number of a character offset, 1-indexed. */
const lineAt = (text, index) => text.slice(0, index).split('\n').length;

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (/\.(astro|css)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const declarers = new Map(); // block name -> Map(relFile -> [{ selector, line }])
for (const b of BLOCKS) declarers.set(b.name, new Map());

for (const file of sourceFiles(SRC)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const whole = fs.readFileSync(file, 'utf8');
  for (const chunk of cssTextOf(file)) {
    /* Comments out first. Both /* *​/ and, inside .astro, the {/* *​/} JSX form,
       which the outer pattern already covers. */
    const stripped = chunk.css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    /* Every rule prelude: the run of characters before an opening brace that
       contains no brace of its own. At-rules are included deliberately — a
       @media block's own prelude never names a class, and the rules inside it
       are matched on their own. */
    for (const m of stripped.matchAll(/([^{}]+)\{/g)) {
      const prelude = m[1];
      for (const b of BLOCKS) {
        const re = new RegExp(`\\.${b.prefix}(?![\\w-])|\\.${b.prefix}__[\\w-]+`);
        if (!re.test(prelude)) continue;
        const map = declarers.get(b.name);
        if (!map.has(rel)) map.set(rel, []);
        map.get(rel).push({
          selector: prelude.trim().replace(/\s+/g, ' ').slice(0, 90),
          line: lineAt(whole, chunk.offset + m.index),
        });
      }
    }
  }
}

const server = await serveDist(DIST, 'shared-blocks');

/* ── RULES 2 AND 3, measured in the page ────────────────────────────────────
 *
 * NO BACKTICKS ANYWHERE BELOW. Everything to the closing brace is a template
 * literal evaluated in the page, and one backtick in a comment ends the string
 * and stops this file parsing. The same constraint check-render.js and
 * check-treatments.js both document, and both record having tripped over.
 *
 * ── WHY THE FINGERPRINT EXCLUDES EVERY INTRINSIC SIZE ───────────────────────
 *
 * The two cards carry different WORDS, so they are different heights and their
 * labels are different widths. A fingerprint containing width, height, or any
 * percentage that resolves against them would report two recipes for one
 * definition, and the fix somebody would reach for is hard-coding a pixel size,
 * which is a worse defect than the one being reported. So rule 2 measures only
 * what an author chose, and the percentages an author chose are checked as
 * RATIOS by rule 3.
 *
 * ── AND WHY EVERY FINITE ANIMATION IS FINISHED FIRST ────────────────────────
 *
 * The site plays a one-beat arrival on load. Sampled mid-flight it puts a
 * sub-pixel translate on whatever it is moving, so two routes read at slightly
 * different moments disagree by 0.004px and the gate reports a fork that does
 * not exist. Seeking every finite animation to its end makes the reading
 * deterministic; infinite ones are left alone because finish() throws on them
 * and because a permanent loop has no end state to seek to.
 */
const MEASURE = `((roles) => {
  for (const a of document.getAnimations()) {
    const timing = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
    if (!timing) continue;
    if (timing.iterations === Infinity) continue;
    if (a.playState === 'finished' || a.playState === 'idle') continue;
    a.finish();
  }

  /* An author's choices only. No width, height, inset or transform-origin: all
     four resolve against content, which legitimately differs between routes. */
  const PROPS = [
    'display', 'position', 'boxSizing', 'transform',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopLeftRadius', 'borderTopWidth', 'borderTopStyle', 'borderTopColor',
    'backgroundColor', 'backgroundImage', 'boxShadow', 'opacity',
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
    'color', 'webkitTextFillColor', 'textTransform', 'textWrap',
    'fontVariantNumeric', 'gridTemplateColumns', 'gridColumnStart', 'gridColumnEnd',
    'rowGap', 'columnGap', 'alignItems', 'justifyContent', 'flexWrap',
    'listStyleType', 'overflowX', 'transformOrigin',
    'animationName', 'animationDuration', 'animationTimingFunction', 'animationIterationCount',
  ];

  const out = { present: false, recipes: {}, geometry: null, problems: [] };
  const root = document.querySelector(roles[0]);
  if (!root) return out;
  out.present = true;

  for (const role of roles) {
    const el = document.querySelector(role);
    if (!el) {
      out.problems.push(role + ' — the block is on this route but this role is not drawn');
      continue;
    }
    const cs = getComputedStyle(el);
    const rec = [];
    for (const p of PROPS) {
      /* transform-origin is half the element's own box, so it is excluded for
         the same reason width is. It is listed above only so that the omission
         is visible here rather than absent from both places. */
      if (p === 'transformOrigin') continue;
      rec.push(p + ':' + cs[p]);
    }
    out.recipes[role] = rec.join(' | ');
  }

  /* ── RULE 3: THE ARITHMETIC THE DRAWING ASSERTS ──────────────────────────
   *
   * Ratios, so they hold whatever the words are. Each one is a claim the card
   * makes out loud.
   *
   * READ FROM THE LAYOUT BOX, NOT FROM getBoundingClientRect, AND THE FIRST
   * VERSION OF THIS GATE GOT IT WRONG. Above 1100px the wrapper is rotated
   * 5deg, and a client rect is the AXIS-ALIGNED box around a rotated element:
   * its width is w.cos + h.sin, so a plane that is genuinely inset 6% measured
   * 9.34%, and the two planes — 46% and 52% tall — produced different rect
   * widths from identical horizontal geometry. The gate reported a fork in
   * correct CSS. offsetLeft and offsetWidth are pre-transform layout values and
   * are what these percentages actually resolve against; the tilt is checked
   * separately, from the computed transform, which is where it lives. */
  const box = (s) => {
    const el = document.querySelector(s);
    return el ? { left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight } : null;
  };
  const wrap = box('.duty');
  const bar = box('.duty__bar');
  const fill = box('.duty__fill');
  const far = box('.duty__ghost--far');
  const mid = box('.duty__ghost--mid');
  out.geometry = {
    /* THE PPN 002 FLOOR, DRAWN TO SCALE. The segment is 10% of the track
       because the weighting floor is 10 per cent. If these two ever disagree
       the picture is contradicting the instrument the caption cites. */
    fillRatio: bar && fill ? fill.width / bar.width : null,
    /* THE DECORATIVE BLEED. inset-inline: 6% -4% — the planes start 6% in and
       finish 4% out, which is the whole of the 35 / 30 / 14 px that CM-01 read
       as content spilling. Checked so that the number stays explainable.
       offsetLeft is measured from the offset parent, which is .duty itself
       because the wrapper is position: relative and the planes are absolute. */
    ghostLeft: wrap && far ? far.left / wrap.width : null,
    ghostRight: wrap && far ? (far.left + far.width - wrap.width) / wrap.width : null,
    ghostsAgree: far && mid ? Math.abs(far.width - mid.width) < 0.5 : null,
    /* THE TILT, present or absent, read from the matrix rather than from the
       stylesheet. Above 1100px the wrapper is rotated 5deg; below it the
       rotation goes to zero so the page cannot acquire horizontal overflow. */
    rotated: wrap ? getComputedStyle(document.querySelector('.duty')).transform !== 'none' : null,
    /* The page must not gain a horizontal scrollbar at any width. */
    docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    /* The box that holds the WORDS must not overflow, whatever the planes do. */
    faceOverflow: (() => {
      const f = document.querySelector('.duty__face');
      return f ? f.scrollWidth - f.clientWidth : null;
    })(),
  };
  return out;
})`;

const WIDTHS = [1440, 834, 390];
const browser = await chromium.launch();
const all = routesOf(DIST);

let failed = false;
const usedDeclarer = new Set();
const usedRecipe = new Set();

console.log(`shared-blocks: ${BLOCKS.length} registered block(s), ${all.length} built route(s)`);

for (const b of BLOCKS) {
  console.log(`\n  BLOCK .${b.prefix}  —  owned by ${b.owner}`);
  console.log(`    drawn by ${b.component}`);
  console.log(`    ${b.why}`);

  /* ── RULE 1 ────────────────────────────────────────────────────────────── */
  const map = declarers.get(b.name);
  const ownerRules = map.get(b.owner) || [];
  const others = [...map].filter(([file]) => file !== b.owner);

  console.log(`\n    rule 1 — one definition: ${ownerRules.length} rule(s) in the owner, ${others.length} other file(s) declaring it`);

  if (ownerRules.length < b.minRules) {
    failed = true;
    console.error(`\nshared-blocks: ${b.owner} declares ${ownerRules.length} rule(s) for .${b.prefix}, below the registered floor of ${b.minRules}\n`);
    console.error('  Every other rule in this gate passes trivially once the recipe is gone, so');
    console.error('  a gutted stylesheet has to fail here or the gate reports a clean site with');
    console.error('  nothing drawn on it. If the block was retired on purpose, remove its entry');
    console.error('  from the registry rather than lowering the floor.\n');
  }

  for (const [file, rules] of others) {
    const ex = ALLOW_DECLARER.find((a) => a.block === b.name && a.file === file);
    if (ex) {
      usedDeclarer.add(`${a_key(ex)}`);
      continue;
    }
    failed = true;
    console.error(`\nshared-blocks: ${file} declares ${rules.length} rule(s) for .${b.prefix}, which ${b.owner} owns\n`);
    for (const r of rules.slice(0, 12)) console.error(`  ${file}:${r.line}   ${r.selector}`);
    console.error('');
    console.error('  A second definition does not fail loudly — it renders identically until the');
    console.error('  day somebody edits one of the two, and then the site has two versions of one');
    console.error('  drawing and no way to tell which is current. That is what happened here:');
    console.error(`  .${b.prefix} was written out in full in two page files and the correction that`);
    console.error('  found it had to be applied by hand to both.');
    console.error(`  Delete the local rule. If the shared one is wrong, change ${b.owner}.\n`);
  }

  /* ── RULES 2 AND 3 ─────────────────────────────────────────────────────── */
  /* ── ONE RECIPE PER ROLE PER WIDTH, AND THE "PER WIDTH" IS NOT A WEAKENING ──
   *
   * The first version of this gate bucketed every width together and reported
   * five forks in correct CSS. A media query IS a second recipe, deliberately:
   * this card carries two of them — the tilt above 1100px and the citation type
   * tier that pays for it — and a rule that forbade that would forbid responsive
   * design and would be argued down to nothing within a week.
   *
   * The question worth asking is the one a reader can act on: at one width, does
   * every route draw this the same way. That is exactly the defect A-45 named,
   * and it is the one a hand-copy eventually fails. */
  const recipes = new Map(); // "role @width" -> Map(fingerprint -> Set(route))
  const routesWith = new Set();
  const geometryProblems = [];
  const roleProblems = new Set();

  for (const width of WIDTHS) {
    const page = await browser.newPage({ viewport: { width, height: 1200 } });
    for (const route of all) {
      await page.goto(server.url(route), { waitUntil: 'load' });
      const m = await page.evaluate(`(${MEASURE})(${JSON.stringify(b.roles)})`);
      if (!m.present) continue;
      routesWith.add(route);
      for (const p of m.problems) roleProblems.add(`${route} @${width}  ${p}`);

      for (const [role, fp] of Object.entries(m.recipes)) {
        const key = `${role} @${width}`;
        if (!recipes.has(key)) recipes.set(key, new Map());
        const bucket = recipes.get(key);
        if (!bucket.has(fp)) bucket.set(fp, new Set());
        bucket.get(fp).add(route);
      }

      const g = m.geometry;
      const where = `${route} @${width}`;
      /* 10% of the track, to within half a pixel of rounding on a ~800px bar. */
      if (g.fillRatio === null || Math.abs(g.fillRatio - 0.1) > 0.005) {
        geometryProblems.push(`${where}  the PPN 002 segment is ${(g.fillRatio * 100).toFixed(2)}% of its track, not 10%`);
      }
      if (g.ghostLeft === null || Math.abs(g.ghostLeft - 0.06) > 0.005) {
        geometryProblems.push(`${where}  the decorative plane starts at ${(g.ghostLeft * 100).toFixed(2)}% of the wrapper, not 6%`);
      }
      if (g.ghostRight === null || Math.abs(g.ghostRight - 0.04) > 0.005) {
        geometryProblems.push(`${where}  the decorative plane bleeds ${(g.ghostRight * 100).toFixed(2)}% past the wrapper, not 4%`);
      }
      if (g.ghostsAgree !== true) {
        geometryProblems.push(`${where}  the two decorative planes are not the same silhouette`);
      }
      if (g.rotated !== (width >= 1100)) {
        geometryProblems.push(
          `${where}  the card is ${g.rotated ? 'tilted' : 'flat'}, and at this width it must be ${width >= 1100 ? 'tilted' : 'flat'} — below 1100px the rotation goes to zero so the page cannot acquire horizontal overflow`
        );
      }
      if (g.docOverflow > 0) {
        geometryProblems.push(`${where}  the page scrolls ${g.docOverflow}px horizontally`);
      }
      if (g.faceOverflow > 0) {
        geometryProblems.push(`${where}  ${g.faceOverflow}px of WORDS overflow the front plane`);
      }
    }
    await page.close();
  }

  console.log(`    rule 2 — one recipe:   measured on ${routesWith.size} route(s) at ${WIDTHS.join(' / ')}`);
  if (routesWith.size) console.log(`                           ${[...routesWith].join(' ')}`);

  if (routesWith.size < b.minRoutes) {
    failed = true;
    console.error(`\nshared-blocks: .${b.prefix} renders on ${routesWith.size} route(s), below the registered floor of ${b.minRoutes}\n`);
    console.error('  A shared block that renders nowhere makes every rule above pass by finding');
    console.error('  nothing to check. Either the block stopped being drawn or a route stopped');
    console.error('  building; both need a person.\n');
  }

  for (const p of roleProblems) {
    failed = true;
    console.error(`shared-blocks: ${p}`);
  }

  let forks = 0;
  for (const [key, bucket] of recipes) {
    if (bucket.size <= 1) continue;
    const role = key.split(' @')[0];
    const ex = ALLOW_RECIPE.find((a) => a.block === b.name && a.role === role);
    if (ex) {
      usedRecipe.add(`${b.name}::${role}`);
      continue;
    }
    forks += 1;
    failed = true;
    console.error(`\nshared-blocks: ${key} renders ${bucket.size} different recipes\n`);
    /* ONLY THE PROPERTIES THAT DIFFER. A whole fingerprint is 46 declarations
       and a reader printed two of them side by side has to diff them by eye,
       which is how a gate stops being read. */
    const parsed = [...bucket].map(([fp, where]) => ({
      where: [...where],
      props: Object.fromEntries(fp.split(' | ').map((s) => [s.slice(0, s.indexOf(':')), s.slice(s.indexOf(':') + 1)])),
    }));
    const names = Object.keys(parsed[0].props).filter((p) =>
      parsed.some((v) => v.props[p] !== parsed[0].props[p])
    );
    for (const v of parsed) {
      console.error(`  ${v.where.join(', ')}`);
      for (const p of names) console.error(`      ${p}: ${v.props[p]}`);
    }
  }
  if (!forks) console.log('                           one recipe per role at each width, no fork');

  console.log(`    rule 3 — the arithmetic: ${geometryProblems.length ? geometryProblems.length + ' problem(s)' : 'the 10% segment, the 6%/-4% bleed and the 1100px tilt all hold'}`);
  for (const p of geometryProblems) {
    failed = true;
    console.error(`shared-blocks: ${p}`);
  }
}

await browser.close();
server.close();

/** A stable key for a declarer exception, so "used" can be reported. */
function a_key(ex) {
  return `${ex.block}::${ex.file}`;
}

const printAllow = (title, list, used, key) => {
  console.log(`\n  ${list.length} ${title}:`);
  for (const a of list) {
    const stale = used.has(key(a)) ? '' : '   [STALE — matches nothing]';
    console.log(`    ${key(a)}${stale}`);
    console.log(`        ${a.reason}`);
  }
  if (!list.length) console.log('    none, which is the state to keep it in');
};
printAllow('file(s) allowed to declare a block they do not own', ALLOW_DECLARER, usedDeclarer, a_key);
printAllow('role(s) allowed a second recipe', ALLOW_RECIPE, usedRecipe, (a) => `${a.block}::${a.role}`);

if (failed) process.exit(1);

console.log('\n  every registered block has one definition in one file, renders one recipe per');
console.log('  role on every route at 1440 / 834 / 390, and draws the ratios it claims');
