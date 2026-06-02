// SF46 batch #6 — TOTAL typography purge. Founder mandate: every
// `font-size: Npx` (any N) must become a `var(--font-size-*)` token
// reference. Aggressive bucket mapping — a slight pixel drift is
// preferable to "Hybrid Anarchy."
//
// Mapping (ranges):
//   9 ≤ N < 12  → --font-size-xs
//  12 ≤ N < 14  → --font-size-sm
//  14 ≤ N < 17  → --font-size-base
//  17 ≤ N < 20  → --font-size-md
//  20 ≤ N < 24  → --font-size-lg
//  24 ≤ N < 30  → --font-size-xl
//  30 ≤ N < 36  → --font-size-2xl
//  36 ≤ N < 48  → --font-size-3xl
//  48 ≤ N < 64  → --font-size-4xl
//  N ≥ 64       → --font-size-5xl (fluid clamp)
//
// Half-pixel values (12.5, 13.5, etc.) bucket by their integer floor.

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'styles.css');
let src = fs.readFileSync(file, 'utf8');

function tokenFor(n) {
  if (n < 12) return '--font-size-xs';
  if (n < 14) return '--font-size-sm';
  if (n < 17) return '--font-size-base';
  if (n < 20) return '--font-size-md';
  if (n < 24) return '--font-size-lg';
  if (n < 30) return '--font-size-xl';
  if (n < 36) return '--font-size-2xl';
  if (n < 48) return '--font-size-3xl';
  if (n < 64) return '--font-size-4xl';
  return '--font-size-5xl';
}

const before = (src.match(/font-size:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;

let replaced = 0;
src = src.replace(/font-size:\s*([0-9]+(?:\.[0-9]+)?)px(?=[^a-zA-Z0-9_-]|$)/g, (m, px) => {
  const n = parseFloat(px);
  if (isNaN(n)) return m;
  replaced++;
  return `font-size:var(${tokenFor(n)})`;
});

fs.writeFileSync(file, src);
const after = (src.match(/font-size:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;
console.log(JSON.stringify({ file: 'styles.css', before, after, replaced, target: '<5' }, null, 2));
