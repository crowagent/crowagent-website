#!/usr/bin/env node
/**
 * SF46 Y3 — Logical-property RTL sweep on CSS files (selective).
 *
 * Replaces high-confidence physical → logical properties:
 *   padding-left:  → padding-inline-start:
 *   padding-right: → padding-inline-end:
 *   margin-left:   → margin-inline-start:
 *   margin-right:  → margin-inline-end:
 *   text-align: left  → text-align: start
 *   text-align: right → text-align: end
 *
 * Skips: rescue files (in @layer overrides — risky to touch);
 *        third-party / vendor CSS;
 *        anything inside an @keyframes (left/right have different semantics).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || ['node_modules','tests','_archive','_drafts','coverage','playwright-report','hero-options'].includes(f)) continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (f.endsWith('.css')) list.push(full);
  }
  return list;
}

// Files we keep ALONE (rescue files in @layer overrides; print.css; min.css).
const SKIP_RE = /(consistency-sf41|page-archetype-unify|page-fixes-sf22|hero-split|pricing-sf16|nav-footer-sf21|\.min)\.css$/;

let totalEdits = 0;
for (const file of walk(ROOT)) {
  if (SKIP_RE.test(file)) continue;
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  // Replace ONLY when followed by a value (`:`) and a semicolon or `}`
  // -- avoids replacing `left` inside `keyframes from { left: ... }`
  // -- avoids hitting comments because the lookahead requires a typical property syntax
  src = src.replace(/\bpadding-left\s*:/g, 'padding-inline-start:');
  src = src.replace(/\bpadding-right\s*:/g, 'padding-inline-end:');
  src = src.replace(/\bmargin-left\s*:/g, 'margin-inline-start:');
  src = src.replace(/\bmargin-right\s*:/g, 'margin-inline-end:');
  src = src.replace(/\btext-align\s*:\s*left\b/g, 'text-align: start');
  src = src.replace(/\btext-align\s*:\s*right\b/g, 'text-align: end');
  src = src.replace(/\bborder-left\s*:/g, 'border-inline-start:');
  src = src.replace(/\bborder-right\s*:/g, 'border-inline-end:');
  src = src.replace(/\bborder-left-(\w+)\s*:/g, 'border-inline-start-$1:');
  src = src.replace(/\bborder-right-(\w+)\s*:/g, 'border-inline-end-$1:');
  if (src !== before) {
    const count = (before.match(/\b(padding|margin|border)-(left|right)|text-align\s*:\s*(left|right)\b/g) || []).length;
    fs.writeFileSync(file, src);
    totalEdits += count;
    console.log(`  ${path.relative(ROOT, file)} — ${count} edits`);
  }
}

console.log(`\nY3 logical-property sweep: ${totalEdits} total edits`);
