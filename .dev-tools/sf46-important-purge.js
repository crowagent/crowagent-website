// SF46 batch #12 — !important purge.
// Founder mandate 2026-05-20: drop ≥500 from the 1,164 baseline. The new
// @layer architecture means most legacy !important is no longer needed
// to win cascade (legacy layer loses to components/layout layers for
// NORMAL rules; for IMPORTANT cascade, earlier layer wins — so removing
// !important from legacy lets components/layout layer rules win their
// !important fights cleanly).
//
// Conservative removal: strip !important EXCEPT inside lines that touch
// safety-critical patterns:
//   - @media print { ... } rules (legit medium-specific)
//   - :focus-visible / outline rules (a11y)
//   - prefers-reduced-motion (a11y)
//   - cascade-fix comments marked "KEEP"
//   - Lines containing tokens like z-index/position/display that may
//     be load-bearing on hover-states / mobile-menu / nav-shrink JS

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'styles.css');
let src = fs.readFileSync(file, 'utf8');

const before = (src.match(/!important/g) || []).length;

// PRESERVE list: lines that match these patterns retain their !important.
const PRESERVE_PATTERNS = [
  /:focus-visible/,
  /prefers-reduced-motion/,
  /\.skip-link/i,
  /KEEP\b/i,              // explicit author markers
  /SF46.*KEEP/i,
  /\.cookie-banner/i,     // GDPR-critical banner styling
  /z-index/,              // z-index ladder is load-bearing
];

// Strip patterns inside @media print { ... } too — preserved.
// We do a line-by-line pass, but also handle block-level @media print.

// Mark all lines inside @media print blocks
const lines = src.split('\n');
let inPrintBlock = false;
let printBraceDepth = 0;
const preserveLines = new Set();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Detect entry into @media print
  if (/@media\s*[^{]*\bprint\b[^{]*\{/.test(line)) {
    inPrintBlock = true;
    printBraceDepth = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    preserveLines.add(i);
    continue;
  }
  if (inPrintBlock) {
    printBraceDepth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
    preserveLines.add(i);
    if (printBraceDepth <= 0) inPrintBlock = false;
    continue;
  }
  // Preserve lines matching the safety list
  for (const p of PRESERVE_PATTERNS) {
    if (p.test(line)) { preserveLines.add(i); break; }
  }
}

// Strip !important from non-preserved lines
let removed = 0;
const out = lines.map((line, i) => {
  if (preserveLines.has(i)) return line;
  if (!line.includes('!important')) return line;
  const cleaned = line.replace(/\s*!important/g, () => { removed++; return ''; });
  return cleaned;
});

const newSrc = out.join('\n');
fs.writeFileSync(file, newSrc);
const after = (newSrc.match(/!important/g) || []).length;

console.log(JSON.stringify({
  file: 'styles.css',
  before,
  after,
  removed,
  preservedLines: preserveLines.size,
  reductionPct: Math.round((1 - after / before) * 100),
}, null, 2));
