#!/usr/bin/env node
/**
 * SF46 P2-Q — .ca-eyebrow rollout.
 *
 * Adds `ca-eyebrow` to the class list of every element that already
 * uses one of the legacy eyebrow/kicker/overline/section-eyebrow
 * classes. Old classes are PRESERVED — additive rollout — so per-page
 * styling still works AND the canonical .ca-eyebrow rules (uppercase,
 * letter-spacing, color: var(--mist), font-size: var(--text-meta))
 * add on top via later cascade order.
 *
 * Per-page legacy CSS rules can be retired in P3-E (rescue-file
 * retirement) once visual parity is confirmed.
 *
 * Usage:  node tools/sf46-eyebrow-rollout.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

/**
 * Match a class token if it ends with one of these legacy names OR is
 * one of these names exactly. Captures `hero-eyebrow`, `sf18-trust-eyebrow`,
 * `hero-demo-eyebrow`, etc. — every bespoke eyebrow-like construct.
 * Excludes -text/-label/-icon sub-elements (those are children of the
 * eyebrow, not the eyebrow itself).
 */
function isLegacyEyebrow(cls) {
  if (cls === 'eyebrow' || cls === 'kicker' || cls === 'overline') return true;
  if (cls.endsWith('-text') || cls.endsWith('-label') || cls.endsWith('-icon')
      || cls.endsWith('-dot') || cls.endsWith('-time')) return false;
  return /(^|-)(eyebrow|kicker|overline|section-eyebrow|section-kicker)$/.test(cls);
}

function findHtml(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || f === 'node_modules' || f === 'tests'
        || f === '_archive' || f === '_drafts' || f === 'coverage'
        || f === 'playwright-report' || f === 'hero-options') continue;
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) findHtml(full, list);
    else if (f.endsWith('.html')) list.push(full);
  }
  return list;
}

const re = /class\s*=\s*(["'])([^"']*?)\1/g;
let totalEdits = 0;
let filesEdited = 0;

for (const file of findHtml(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  let edits = 0;
  const out = src.replace(re, (m, q, classList) => {
    const classes = classList.split(/\s+/).filter(Boolean);
    const hit = classes.some(isLegacyEyebrow);
    if (!hit) return m;
    if (classes.includes('ca-eyebrow')) return m;
    classes.push('ca-eyebrow');
    edits++;
    return `class=${q}${classes.join(' ')}${q}`;
  });
  if (edits) {
    filesEdited++;
    totalEdits += edits;
    if (!DRY) fs.writeFileSync(file, out);
    console.log(`[${DRY ? 'DRY' : 'EDIT'}] ${path.relative(ROOT, file)} — ${edits} eyebrow(s)`);
  }
}

console.log(`\nP2-Q rollout: ${totalEdits} eyebrow tags across ${filesEdited} files`);
console.log(DRY ? '(dry-run — no files changed)' : 'done.');
