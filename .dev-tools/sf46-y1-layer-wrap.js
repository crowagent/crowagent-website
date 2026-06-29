#!/usr/bin/env node
/**
 * SF46 Y1a-f — Wrap each rescue CSS file in `@layer overrides { … }`.
 *
 * Wrapping is non-invasive: file still loads, !important still wins.
 * The layer label is the foundation for the incremental drop-!important
 * work that will follow. Idempotent.
 */
const fs = require('fs');
const path = require('path');

const RESCUE_FILES = [
  'Assets/css/page-archetype-unify.css',
  'Assets/css/page-fixes-sf22.css',
  'Assets/css/hero-split.css',
  'Assets/css/pricing-sf16.css',
  'Assets/css/nav-footer-sf21.css',
];

const ROOT = path.join(__dirname, '..');
let wrapped = 0;
for (const rel of RESCUE_FILES) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { console.log('MISS', rel); continue; }
  let src = fs.readFileSync(file, 'utf8');
  if (/@layer\s+overrides\s*\{/.test(src)) { console.log('SKIP', rel, '(already layered)'); continue; }
  // Insert layer wrapper. Find the first non-comment line.
  // Simplest: prepend `@layer overrides {\n` and append `}\n`.
  const header = `/* SF46 Y1 (2026-05-19) — Wrapped in @layer overrides.\n   !important preserved (later layer beats earlier for important rules).\n   Incremental drop-!important work will follow with visual-regression. */\n@layer overrides {\n\n`;
  const footer = `\n} /* end @layer overrides */\n`;
  fs.writeFileSync(file, header + src + footer);
  wrapped++;
  console.log('WRAP', rel);
}
console.log(`\nY1 wrapper: ${wrapped} rescue file(s) wrapped`);
