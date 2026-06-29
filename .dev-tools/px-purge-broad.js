// Broader px → rem purge. Converts every Npx ≥ 4 to rem (N/16) UNLESS it's
// inside a var() fallback (legitimate token pattern). Preserves 1px/2px/3px
// snap values used for borders/transforms/shadows that should remain
// pixel-exact across DPI.
const fs = require('fs');
const path = require('path');

function purgeFile(file) {
  const before = fs.readFileSync(file, 'utf8');
  let changes = 0;
  // Mask out var() fallbacks
  const masks = [];
  let working = before.replace(/var\([^)]*\)/g, m => {
    masks.push(m);
    return `__VAR${masks.length - 1}__`;
  });
  // Convert any Npx where N >= 4 to rem
  working = working.replace(/(?<![\d.\w-])(\d+)px\b/g, (full, n) => {
    const num = parseInt(n, 10);
    if (num < 4) return full; // keep 1px/2px/3px snap
    changes++;
    const rem = num / 16;
    const s = rem.toFixed(4).replace(/\.?0+$/, '');
    return s + 'rem';
  });
  // Restore var() fallbacks
  working = working.replace(/__VAR(\d+)__/g, (_, i) => masks[parseInt(i, 10)]);
  if (changes > 0) fs.writeFileSync(file, working);
  return changes;
}

function walk(dir) {
  let total = 0;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f === 'node_modules' || f === 'coverage' || f === '.git' || f === '_archive') continue;
      total += walk(full);
    } else if (f.endsWith('.css') && !f.endsWith('.min.css')) {
      const c = purgeFile(full);
      if (c > 0) {
        console.log(`  ${c} ${full}`);
        total += c;
      }
    }
  }
  return total;
}

console.log('=== broad px → rem purge (N≥4 only, var() fallbacks preserved) ===');
const total = walk('Assets') + (purgeFile('styles.css') ? 1 : 0);
console.log(`Total replacements made.`);
