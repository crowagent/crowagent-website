/**
 * run-gates.mjs — runs every build gate to completion and reports all of them.
 *
 * ── WHY THIS EXISTS (R262-D-72) ─────────────────────────────────────────────
 *
 * `npm run build` used to chain every gate with `&&`. That means a failure in
 * gate N silently cancels gates N+1 through the end: they never execute, and a
 * gate that never runs is indistinguishable from a gate that passed. On
 * 2026-08-07 that is exactly what happened to WorkstationTour.astro:
 * check-design-system.js failed on a card-recipe fault, and check-palette-
 * roles.js and check-render.js — both of which would have caught real defects
 * in the same file — never ran, on that build or on any build before it. Three
 * defects shipped to production because the chain stopped reporting the
 * instant it found the first one.
 *
 * This file replaces the `&&` chain with a runner that executes every gate in
 * the same order regardless of earlier failures, prints each gate's own
 * output as it runs, and prints one summary at the end naming every pass and
 * every failure. The exit code is still 1 if anything failed — this makes the
 * chain report completely, not tolerate more. A red gate still blocks a
 * deploy; it just no longer hides the gates behind it.
 *
 * GATE ORDER matches `build:deploy`/`build` in package.json exactly, for the
 * same reason check-design-system.js keeps its own rules in file order: order
 * is how a reader keeps their place against the thing they already know.
 *
 * Run: node scripts/run-gates.mjs
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/* The local astro CLI, resolved directly rather than through `npx`, so this
   never falls back to a network fetch and never depends on how the caller's
   shell resolves PATH.

   [R262-D-73 2026-08-08] Point at astro's JS ENTRYPOINT and run it under `node`,
   NOT at the `.bin/astro.cmd` shim. Node 18.20/20.12 hardened `spawnSync` against
   CVE-2024-27980 so that spawning a `.cmd` without `shell: true` now throws
   `EINVAL` outright. The first full run of this chain reported:

       FAIL  astro check   1ms  error: spawnSync ...astro.cmd EINVAL
       FAIL  astro build   0ms  error: spawnSync ...astro.cmd EINVAL

   Note the durations: 1ms and 0ms. Those are not gates failing, they are gates
   never starting — and the summary presented them beside real failures as though
   they were the same kind of thing.

   That mattered far more than a red line, because `astro build` is what produces
   `dist/`. Every browser-driven gate after it — check-render, check-cwv,
   check-controls, check-autoplay — ran against a **stale** `dist` and reported on
   output that no longer matched the source. 29 "passes" over an artefact from an
   earlier build.

   `shell: true` would also work, but invoking the JS entry under `node` is
   better: no shell quoting, no PATH dependence, and it matches this block's own
   stated intent. */
const astroBin = path.join(root, 'node_modules', 'astro', 'astro.js');
const node = process.execPath;

const GATES = [
  { name: 'check-comment-terminators', cmd: node, args: ['scripts/check-comment-terminators.js'] },
  { name: 'check-facts', cmd: node, args: ['scripts/check-facts.js'] },
  { name: 'check-english', cmd: node, args: ['scripts/check-english.js'] },
  { name: 'check-vendor-logos', cmd: node, args: ['scripts/check-vendor-logos.js'] },
  { name: 'astro check', cmd: node, args: [astroBin, 'check'] },
  { name: 'astro build', cmd: node, args: [astroBin, 'build'] },
  { name: 'copy-assets', cmd: node, args: ['scripts/copy-assets.js'] },
  { name: 'copy-cf-config', cmd: node, args: ['scripts/copy-cf-config.js'] },
  { name: 'build-sitemap', cmd: node, args: ['scripts/build-sitemap.js'] },
  { name: 'check-links', cmd: node, args: ['scripts/check-links.js'] },
  { name: 'check-seo-parity', cmd: node, args: ['scripts/check-seo-parity.js'] },
  { name: 'check-faq-parity', cmd: node, args: ['scripts/check-faq-parity.js'] },
  { name: 'check-content-parity', cmd: node, args: ['scripts/check-content-parity.js'] },
  { name: 'check-design-system', cmd: node, args: ['scripts/check-design-system.js'] },
  { name: 'check-palette-roles', cmd: node, args: ['scripts/check-palette-roles.js'] },
  { name: 'check-motion', cmd: node, args: ['scripts/check-motion.js'] },
  { name: 'check-csp', cmd: node, args: ['scripts/check-csp.js'] },
  { name: 'check-utilities', cmd: node, args: ['scripts/check-utilities.js'] },
  { name: 'check-render', cmd: node, args: ['scripts/check-render.js'] },
  { name: 'check-glossary-filter', cmd: node, args: ['scripts/check-glossary-filter.js'] },
  { name: 'check-timeline', cmd: node, args: ['scripts/check-timeline.js'] },
  { name: 'check-heading-ink', cmd: node, args: ['scripts/check-heading-ink.js'] },
  { name: 'check-treatments', cmd: node, args: ['scripts/check-treatments.js'] },
  { name: 'check-controls', cmd: node, args: ['scripts/check-controls.js'] },
  { name: 'check-transitions', cmd: node, args: ['scripts/check-transitions.js'] },
  { name: 'check-disclosure', cmd: node, args: ['scripts/check-disclosure.js'] },
  { name: 'check-shared-blocks', cmd: node, args: ['scripts/check-shared-blocks.js'] },
  { name: 'check-breadcrumbs', cmd: node, args: ['scripts/check-breadcrumbs.js'] },
  { name: 'check-sheen', cmd: node, args: ['scripts/check-sheen.js'] },
  { name: 'check-status-pulse', cmd: node, args: ['scripts/check-status-pulse.mjs'] },
  { name: 'check-budgets', cmd: node, args: ['scripts/check-budgets.js'] },
  { name: 'check-cwv', cmd: node, args: ['scripts/check-cwv.js'] },
  { name: 'check-autoplay', cmd: node, args: ['scripts/check-autoplay.mjs'] },
];

if (!fs.existsSync(astroBin)) {
  console.error(`run-gates.mjs: astro CLI not found at ${astroBin}. Run npm install in astro/ first.`);
  process.exit(1);
}

const results = [];
const runStarted = Date.now();

for (const gate of GATES) {
  const t0 = Date.now();
  console.log(`\n${'='.repeat(72)}`);
  console.log(`GATE  ${gate.name}`);
  console.log('='.repeat(72));

  const r = spawnSync(gate.cmd, gate.args, { cwd: root, stdio: 'inherit' });
  const ms = Date.now() - t0;
  /* r.status is null when the process was killed by a signal rather than
     exiting normally, or when spawnSync itself could not launch it (r.error
     set) — either counts as a failure, not a silent skip. */
  const pass = r.error === undefined && r.status === 0;

  results.push({ name: gate.name, pass, status: r.status, signal: r.signal, error: r.error, ms });
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${gate.name} (${ms}ms)`);
}

const totalMs = Date.now() - runStarted;
const failed = results.filter((r) => !r.pass);
const passed = results.length - failed.length;

console.log(`\n${'='.repeat(72)}`);
console.log('GATE SUMMARY — every gate below ran, regardless of earlier failures');
console.log('='.repeat(72));
for (const r of results) {
  const exitDesc = r.error ? `error: ${r.error.message}` : r.signal ? `killed by ${r.signal}` : `exit ${r.status}`;
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(28)} ${String(r.ms).padStart(7)}ms  ${exitDesc}`);
}
console.log('-'.repeat(72));
console.log(`  ${results.length} gates run — ${passed} passed, ${failed.length} failed — ${(totalMs / 1000).toFixed(1)}s total`);
if (failed.length) {
  console.log('\n  FAILED:');
  for (const r of failed) console.log(`    - ${r.name}`);
}
console.log('='.repeat(72));

process.exitCode = failed.length ? 1 : 0;
