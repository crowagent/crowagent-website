#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/restore-css-links.js
   REC.1b (2026-05-20) — emergency restore: re-inject the canonical CSS
   stylesheet chain into HTML files that lost their <link> tags because
   the reconciliation-sweep regex incorrectly consumed across an HTML
   comment that mentioned the word `<style>`. Idempotent.

   Canonical chain (in this order — keeps the cascade deterministic):
     1. fonts-selfhosted.css        — already present, used as anchor
     2. crowagent-brand-tokens.css  — token source of truth (unlayered)
     3. styles.min.css              — legacy + sovereign blocks
     4. sovereign-primitives.css    — 12 primitive families
     5. sovereign-cmdk.css          — Cmd+K palette
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const SKIP_DIRS = new Set([
  'node_modules', 'test-results', 'playwright-report', 'audit-results',
  'tests', '.git', 'snapshots', '.kiro', 'coverage', 'lcov-report', 'hero-options',
]);

const CANONICAL_LINKS = [
  '<link rel="stylesheet" href="/crowagent-brand-tokens.css?v=99">',
  '<link rel="stylesheet" href="/styles.min.css?v=97">',
  '<link rel="stylesheet" href="/Assets/css/sovereign-primitives.css?v=1">',
  '<link rel="stylesheet" href="/Assets/css/sovereign-cmdk.css?v=1">',
];

function walk(dir, list = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return list; }
  for (const f of entries) {
    if (SKIP_DIRS.has(f) || f.startsWith('.')) continue;
    const p = path.join(dir, f);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, list);
    else if (/\.html$/i.test(f)) list.push(p);
  }
  return list;
}
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

const files = walk(ROOT);
let touched = 0, links = 0;
const samples = [];

for (const file of files) {
  let html; try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
  let before = html;
  const missing = CANONICAL_LINKS.filter(l => {
    const href = (l.match(/href="([^"]+)"/) || [])[1];
    return href && !html.includes(href);
  });
  if (!missing.length) continue;

  // Anchor: insert immediately AFTER the fonts-selfhosted link or after
  // <link rel="icon"> chain. Both are guaranteed early-head tags.
  const anchorRe = /<link[^>]+href="\/Assets\/css\/fonts-selfhosted\.css[^"]*"[^>]*>/i;
  const m = html.match(anchorRe);
  let insertAt;
  let insertion;
  if (m) {
    insertAt = html.indexOf(m[0]) + m[0].length;
    insertion = '\n' + missing.join('\n');
  } else {
    // Fall back to head close
    const head = html.indexOf('</head>');
    if (head === -1) continue;
    insertAt = head;
    insertion = missing.join('\n') + '\n';
  }
  html = html.slice(0, insertAt) + insertion + html.slice(insertAt);
  if (html !== before) {
    touched++; links += missing.length;
    if (samples.length < 8) samples.push({ file: rel(file), missing: missing.length });
    if (APPLY) fs.writeFileSync(file, html);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  RESTORE CSS LINKS — ' + (APPLY ? 'APPLY' : 'DRY RUN'));
console.log('═══════════════════════════════════════════════════════════════');
console.log('Files scanned: ' + files.length);
console.log('Files touched: ' + touched);
console.log('Links restored: ' + links);
if (samples.length) {
  console.log('Sample restores:');
  for (const s of samples) console.log('  ' + s.file + '  +' + s.missing + ' links');
}
if (!APPLY) console.log('\nDRY RUN — re-run with --apply to write changes.');
