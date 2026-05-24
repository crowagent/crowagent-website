// SF46 batch #12 — Sovereign Rebirth truth-check gate.
// Founder mandate 2026-05-20: verify architectural-debt repayment.
//
// Gate A: @layer declaration present at top of styles.css.
// Gate B: !important count dropped ≥500 from the 1,164 baseline.
// Gate C: .ca-grid is used in at least 5 HTML files.

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const BASELINE_IMPORTANT = 1164;
const TARGET_IMPORTANT_DROP = 500;

function fail(msg) { console.log('FAIL —', msg); process.exitCode = 1; }
function pass(msg) { console.log('PASS —', msg); }

// ─── Gate A ───────────────────────────────────────────────────────────────
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const first50 = css.split('\n').slice(0, 50).join('\n');
const layerDeclMatch = first50.match(/@layer\s+([a-zA-Z, ]+);/);
if (layerDeclMatch) {
  const layers = layerDeclMatch[1].split(',').map(s => s.trim());
  pass(`Gate A — @layer declaration present in first 50 lines (${layers.length} layers: ${layers.join(', ')}).`);
} else {
  fail('Gate A — @layer declaration NOT found in first 50 lines of styles.css.');
}

// ─── Gate B ───────────────────────────────────────────────────────────────
const importantCount = (css.match(/!important/g) || []).length;
const drop = BASELINE_IMPORTANT - importantCount;
if (drop >= TARGET_IMPORTANT_DROP) {
  pass(`Gate B — !important count: ${importantCount} (was ${BASELINE_IMPORTANT}, dropped ${drop}, target ≥${TARGET_IMPORTANT_DROP}).`);
} else {
  fail(`Gate B — !important count: ${importantCount} (was ${BASELINE_IMPORTANT}, dropped ${drop}, target ≥${TARGET_IMPORTANT_DROP}). Need to remove ${TARGET_IMPORTANT_DROP - drop} more.`);
}

// ─── Gate C ───────────────────────────────────────────────────────────────
function walk(dir, files = []) {
  const SKIP = new Set(['node_modules', '_archive', 'test-results', 'debug-screenshots', '.git', 'tests']);
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    if (SKIP.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (e.isFile() && e.name.endsWith('.html')) files.push(full);
  }
  return files;
}
const htmlFiles = walk(root);
const grid = htmlFiles.filter(f => /\bca-grid\b/.test(fs.readFileSync(f, 'utf8')));
if (grid.length >= 5) {
  pass(`Gate C — .ca-grid used in ${grid.length} HTML files (target ≥5): ${grid.slice(0, 5).map(f => path.relative(root, f)).join(', ')}${grid.length > 5 ? ', …' : ''}.`);
} else {
  fail(`Gate C — .ca-grid used in only ${grid.length} HTML files (target ≥5). Found in: ${grid.map(f => path.relative(root, f)).join(', ') || '(none)'}.`);
}

// ─── Summary ──────────────────────────────────────────────────────────────
console.log('');
console.log('BASELINE: !important = 1164 (pre-B12).');
console.log(`CURRENT:  !important = ${importantCount}.`);
console.log(`DROP:     ${drop} (target ≥${TARGET_IMPORTANT_DROP}).`);
if (process.exitCode) {
  console.log('\n=== GATE FAILED ===');
} else {
  console.log('\n=== ALL GATES GREEN ===');
}
