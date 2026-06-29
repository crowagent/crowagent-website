// SF46 batch #7 — typography purge across Assets/css/*.css.
// Same aggressive bucket mapping as B6 (styles.css). Founder mandate:
// every font-size:Npx → var(--font-size-*). No hardcoded pixels allowed.

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const cssDir = path.join(root, 'Assets', 'css');

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

const totals = { scanned: 0, before: 0, after: 0, replaced: 0 };
const fileResults = [];

const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css')).map(f => path.join(cssDir, f));
for (const file of files) {
  totals.scanned++;
  let src = fs.readFileSync(file, 'utf8');
  const before = (src.match(/font-size:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;
  totals.before += before;
  let replaced = 0;
  src = src.replace(/font-size:\s*([0-9]+(?:\.[0-9]+)?)px(?=[^a-zA-Z0-9_-]|$)/g, (m, px) => {
    const n = parseFloat(px);
    if (isNaN(n)) return m;
    replaced++;
    return `font-size:var(${tokenFor(n)})`;
  });
  if (replaced > 0) fs.writeFileSync(file, src);
  const after = (src.match(/font-size:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;
  totals.after += after;
  totals.replaced += replaced;
  if (replaced > 0) fileResults.push({ file: path.basename(file), before, after, replaced });
}

console.log(JSON.stringify({
  scope: 'Assets/css/*.css',
  filesScanned: totals.scanned,
  totalBefore: totals.before,
  totalAfter: totals.after,
  totalReplaced: totals.replaced,
  reductionPct: Math.round((1 - totals.after / totals.before) * 100),
  byFile: fileResults.slice(0, 20),
}, null, 2));
