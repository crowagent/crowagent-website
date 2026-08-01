#!/usr/bin/env node
/**
 * check-sovereign-core-reproducibility.js
 *
 * WHY THIS EXISTS
 * ---------------
 * `Assets/css/sovereign-core-v2.compiled.css` is loaded by the marketing pages.
 * It is NOT reproducible from `Assets/css/sovereign-core-v2.css`: running
 * `npx @tailwindcss/cli -i <source> -o <artifact>` produces a materially
 * different file. Before 2026-07-30 the `build:css` npm script pointed tailwind's
 * `-o` straight at the shipped artifact, so a single `npm run build:css` (or
 * `npm run build:full`, which chains it) would have silently overwritten it.
 * That script is now routed through this check instead.
 *
 * This tool NEVER writes the artifact. It reports, in three buckets, exactly how
 * a fresh build differs, so the delta is measurable rather than guessed at.
 *
 * IT WAS NEVER REPRODUCIBLE — PROVEN, NOT INFERRED.
 * The artifact has not changed since `6ded3808` ("ship the Nebula rebuild",
 * 2026-07-20). A worktree was checked out at exactly that commit, so the source
 * CSS *and* every scanned .html matched the artifact's own commit, and tailwind
 * v4.3.0 was run against it. Result: 113,405 B rebuilt vs 160,659 B committed —
 * 414 rule keys only in the artifact, 36 only in the rebuild, 113 rules with
 * differing declarations. So this is not source drift since July and not a
 * tailwind version mismatch (v4.3.0 on both sides, per the artifact's own
 * leading `tailwindcss v4.3.0` banner comment). The committed file has always
 * carried post-compile edits that no build step in this repo performs.
 * Checked and ruled out: `.dev-tools/token-migrate.js` is not that step — it
 * explicitly EXCLUDES `*.compiled.css`, and its 5-entry map does not contain any
 * of the substitutions found here.
 *
 * THE THREE REASONS A REBUILD DIVERGES (all measured 2026-07-30, tailwind v4.3.0
 * on both sides — it is NOT a version mismatch):
 *
 * 1. LOST srgb FALLBACKS — the serious one.
 *    The `@theme` block in the source maps `--color-ca-*` onto OTHER css
 *    variables (`--color-ca-teal: var(--accent)` and so on). Tailwind can only
 *    emit an `in srgb` `color-mix()` fallback when it can resolve a colour to a
 *    literal. Given a `var()` indirection it gives up and emits the flat colour.
 *    So `.border-ca-teal\/20` is
 *        committed : color-mix(in srgb, var(--accent) 20%, transparent)
 *        rebuilt   : var(--color-ca-teal)              <-- 100% opacity
 *    followed in both cases by the `in oklab` declaration. Any engine without
 *    `color-mix(in oklab, ...)` therefore renders these at FULL opacity after a
 *    rebuild. 10 (property, value) pairs are affected, covering every ca-* colour
 *    utility that carries an opacity modifier. The percentage is recoverable only
 *    from the class name, not from the declaration, so this cannot be repaired by
 *    a find-and-replace pass.
 *
 * 2. A POST-COMPILE TOKEN PASS that no build step performs.
 *    40 deterministic literal -> token rewrites were applied to the committed
 *    artifact after tailwind ran: `#fff` -> `var(--white)`, `#000` -> `var(--bg)`,
 *    `z-index:10|20|30` -> `var(--z-content)`, `50` -> `var(--z-banner)`,
 *    `2000` -> `var(--z-toast)`, `20px` -> `var(--space-5)`, `4px` ->
 *    `var(--space-1)`, `11px|12px` -> `var(--text-xs)`, and the two
 *    `cubic-bezier()` easings -> `var(--ease-canonical)` / `var(--ease-standard)`.
 *    A plain rebuild reintroduces exactly the hardcoded hex and magic numbers
 *    that CLAUDE.md CSS rule 1 forbids. This pass IS mechanical and is applied
 *    below, which is why it is reported separately from bucket 1.
 *
 * 3. THE ARTIFACT IS STALE, IN BOTH DIRECTIONS.
 *    Committed artifact built 2026-07-19; the source was last edited 2026-07-30.
 *      - 473 rule keys exist only in the artifact. Measured: 0 of them are used
 *        by any shipping .html/.js — they are utilities for class names the
 *        markup has since dropped. Losing them costs nothing today, but it does
 *        remove the ability to just add the class name back later.
 *      - 36 rule keys exist only in a fresh build, and 25 of those ARE used by
 *        current markup. Three are provably unstyled in a real browser right now:
 *          /404.html            .lg:grid-cols-5   0 matching rules, renders 3 cols
 *          /compare/*.html      .pt-24            0 matching rules
 *          /crowmark.html       .object-left-top  0 matching rules
 *        (control: .w-full on the same page DOES resolve to 1 rule, so the
 *        detector is not simply failing to find rules.)
 *
 * WHAT A FIX WOULD TAKE — the manual steps, in order:
 *   a. Decide bucket 1. Either revert the `@theme` block to literal colours so
 *      tailwind can compute srgb fallbacks again, or accept oklab-only fallbacks
 *      and drop the srgb line. This is a design/browser-support call, not a
 *      mechanical one, and it is the reason this script does not offer a --write.
 *   b. Fold bucket 2 into the build (the map below is already machine-applied
 *      here, so it only needs promoting into the writing path).
 *   c. Safelist whichever of the 473 orphaned utilities are worth keeping, via
 *      `@source inline(...)` in the source CSS, so a rebuild stops dropping them.
 *   d. Only then rebuild, and bump the `?v=` cache-buster on every page that
 *      loads the sheet, or the change does not ship.
 *
 * USAGE
 *   node scripts/check-sovereign-core-reproducibility.js          # report
 *   node scripts/check-sovereign-core-reproducibility.js --strict # exit 1 if a
 *                                                                 # USED rule is
 *                                                                 # missing
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const postcss = require('postcss');

const ROOT = path.resolve(__dirname, '..');
const SOURCE = path.join(ROOT, 'Assets/css/sovereign-core-v2.css');
const ARTIFACT = path.join(ROOT, 'Assets/css/sovereign-core-v2.compiled.css');

/* Bucket 2: the deterministic post-compile token pass, derived by pairing every
   declaration of every rule that exists in both files (1361 paired declarations,
   50 differing (prop,value) pairs, 40 of them one-to-one). Keyed by the value a
   fresh tailwind build emits. */
const TOKEN_PASS = [
  [/\bcolor-mix\(in srgb, #fff /g, 'color-mix(in srgb, var(--white) '],
  [/\bcolor-mix\(in srgb, #000 /g, 'color-mix(in srgb, var(--bg) '],
  [/(--color-black:\s*)#000\b/g, '$1var(--bg)'],
  [/(--color-white:\s*)#fff\b/g, '$1var(--white)'],
  [/(z-index:\s*)(?:10|20|30)\b/g, '$1var(--z-content)'],
  [/(z-index:\s*)50\b/g, '$1var(--z-banner)'],
  [/(z-index:\s*)2000\b/g, '$1var(--z-toast)'],
  [/(padding-inline-start:\s*)20px\b/g, '$1var(--space-5)'],
  [/(margin-inline-end:\s*)4px\b/g, '$1var(--space-1)'],
  [/(font-size:\s*)1[12]px\b/g, '$1var(--text-xs)'],
  [/cubic-bezier\(0,\s*0,\s*0\.2,\s*1\)/g, 'var(--ease-canonical)'],
  [/cubic-bezier\(0\.4,\s*0,\s*0\.2,\s*1\)/g, 'var(--ease-standard)'],
  // `mask-image: radial-gradient(... ,#000 70%, transparent 100%)` — the same
  // #000 -> --bg rewrite, but inside a gradient stop rather than a color-mix().
  [/,#000 (\d+%)/g, ',var(--bg) $1'],
];

/* After the pass above, 13 (property, value) pairs still differ, and every one
   is accounted for rather than hand-waved:
     11  the lost srgb color-mix fallbacks (bucket 1 — see the header). This is
         the only group with a behavioural consequence.
      1  `--ca-cyber`: artifact `#F2F7FF`, rebuild `var(--ca-c-f2f7ff)`. Checked:
         `--ca-c-f2f7ff: #f2f7ff` IS defined, in crowagent-brand-tokens.css,
         which all 43 pages load. Same colour either way — benign, and the
         rebuilt form is the one that honours the token rule.
      1  `min-width`: `calc(var(--spacing) * 0)` vs `0` — constant folding.
         Behaviourally identical. */

const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', '.dev-tools',
  'tests', 'specs', 'Doc', 'docs', 'stripe-sample', 'cloudflare-workers']);

function walk(dir, exts, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, exts, acc);
    else if (exts.some((x) => entry.name.endsWith(x))) acc.push(p);
  }
  return acc;
}

/** Parse with postcss (a real parser — never regex-strip comments out of CSS;
 *  doing that has eaten live code in this repo before) and key every rule by its
 *  at-rule context plus selector so @media/@layer scoping is part of identity. */
function collectRules(file) {
  const root = postcss.parse(fs.readFileSync(file, 'utf8'), { from: file });
  const map = new Map();
  root.walkRules((rule) => {
    const ctx = [];
    let parent = rule.parent;
    while (parent && parent.type !== 'root') {
      if (parent.type === 'atrule') ctx.unshift('@' + parent.name + ' ' + (parent.params || ''));
      parent = parent.parent;
    }
    const key = ctx.join(' >> ') + ' >> ' + rule.selector.replace(/\s+/g, ' ').trim();
    const decls = [];
    rule.walkDecls((d) => decls.push(d.prop + ':' + d.value.replace(/\s+/g, ' ').trim() + (d.important ? '!important' : '')));
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(decls.join(';'));
  });
  return map;
}

function classNameOf(ruleKey) {
  const m = ruleKey.match(/>>\s*\.(.+)$/);
  if (!m) return null;
  let cls = m[1];
  if (/[ >:,~+]/.test(cls.replace(/\\./g, ''))) cls = cls.split(/(?<!\\)[ >:,~+]/)[0];
  return cls.replace(/\\(.)/g, '$1');
}

function main() {
  const strict = process.argv.includes('--strict');

  for (const f of [SOURCE, ARTIFACT]) {
    if (!fs.existsSync(f)) {
      console.error(`MISSING: ${path.relative(ROOT, f)}`);
      process.exit(1);
    }
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sovcore-'));
  const tmpOut = path.join(tmpDir, 'fresh.css');
  const cli = path.join(ROOT, 'node_modules/@tailwindcss/cli/dist/index.mjs');
  if (!fs.existsSync(cli)) {
    console.error('MISSING: node_modules/@tailwindcss/cli — run npm install first.');
    process.exit(1);
  }
  execFileSync(process.execPath, [cli, '-i', SOURCE, '-o', tmpOut], { cwd: ROOT, stdio: 'pipe' });

  // Apply the deterministic token pass so bucket 2 is not double-counted as a
  // difference. Count matches BEFORE substituting so the tally is honest.
  let fresh = fs.readFileSync(tmpOut, 'utf8');
  let tokenRewrites = 0;
  for (const [re, to] of TOKEN_PASS) {
    tokenRewrites += (fresh.match(re) || []).length;
    fresh = fresh.replace(re, to);
  }
  fs.writeFileSync(tmpOut, fresh);

  const committed = collectRules(ARTIFACT);
  const rebuilt = collectRules(tmpOut);

  const onlyCommitted = [], onlyRebuilt = [], declDiff = [];
  for (const [k, v] of committed) {
    if (!rebuilt.has(k)) onlyCommitted.push(k);
    else if (JSON.stringify(v) !== JSON.stringify(rebuilt.get(k))) declDiff.push(k);
  }
  for (const k of rebuilt.keys()) if (!committed.has(k)) onlyRebuilt.push(k);

  // Which of these class names does shipping markup/JS actually use?
  const files = walk(ROOT, ['.html', '.js', '.xsl', '.xml'], []);
  let blob = '';
  for (const f of files) { try { blob += '\n' + fs.readFileSync(f, 'utf8'); } catch (_) { /* unreadable file: skip, it cannot reference a class */ } }
  const isUsed = (key) => {
    const cls = classNameOf(key);
    if (!cls) return null; // non-class rule: needs a human
    const re = new RegExp('(^|["\'\\s.])' + cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(["\'\\s]|$)');
    return re.test(blob);
  };
  const usedOnlyCommitted = onlyCommitted.filter((k) => isUsed(k) === true);
  const usedOnlyRebuilt = onlyRebuilt.filter((k) => isUsed(k) === true);
  const nonClassOnlyRebuilt = onlyRebuilt.filter((k) => isUsed(k) === null);

  const relArtifact = path.relative(ROOT, ARTIFACT).replace(/\\/g, '/');
  console.log(`sovereign-core-v2 reproducibility check`);
  console.log(`  artifact : ${relArtifact} (${fs.statSync(ARTIFACT).size} B, ${committed.size} rule keys)`);
  console.log(`  rebuild  : tailwind + token pass    (${fs.statSync(tmpOut).size} B, ${rebuilt.size} rule keys)`);
  console.log(`  token pass applied ${tokenRewrites} literal -> token rewrite(s)\n`);
  console.log(`  BUCKET 1  declaration differences on shared rules : ${declDiff.length}`);
  console.log(`            (the lost srgb color-mix fallbacks — see the header)`);
  console.log(`  BUCKET 3a rules only in the artifact              : ${onlyCommitted.length}  (${usedOnlyCommitted.length} used by shipping markup)`);
  console.log(`  BUCKET 3b rules only in a rebuild                 : ${onlyRebuilt.length}  (${usedOnlyRebuilt.length} used by shipping markup, ${nonClassOnlyRebuilt.length} non-class)`);

  if (usedOnlyRebuilt.length) {
    console.log(`\n  MISSING FROM THE SHIPPED SHEET but present in the source and used by markup:`);
    for (const k of usedOnlyRebuilt) console.log(`    .${classNameOf(k)}`);
  }
  if (nonClassOnlyRebuilt.length) {
    console.log(`\n  Non-class rules missing from the shipped sheet (review by hand):`);
    for (const k of nonClassOnlyRebuilt) console.log(`    ${k.replace(/^\s*>>\s*/, '')}`);
  }
  if (usedOnlyCommitted.length) {
    console.log(`\n  WOULD BE LOST BY A REBUILD and still used by markup — do NOT rebuild:`);
    for (const k of usedOnlyCommitted) console.log(`    .${classNameOf(k)}`);
  }

  console.log(`\n  This tool never writes ${relArtifact}. See the header for the fix order.`);

  fs.rmSync(tmpDir, { recursive: true, force: true });

  if (strict && (usedOnlyRebuilt.length || usedOnlyCommitted.length)) process.exit(1);
}

main();
