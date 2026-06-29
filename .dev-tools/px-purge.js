// Purge px values inside font-size/margin/padding/gap properties.
// Converts Npx → Nrem (N/16). Leaves px values inside var() fallbacks alone
// since `var(--space-4, 16px)` is a legitimate token-fallback pattern.
const fs = require('fs');
const path = require('path');

const TARGET_PROPS = /(font-size|margin|padding|gap)\s*:/;

function purgeFile(file) {
  const before = fs.readFileSync(file, 'utf8');
  const lines = before.split('\n');
  let changes = 0;
  const after = lines.map(line => {
    if (!TARGET_PROPS.test(line)) return line;
    // Mask out var() fallbacks like var(--space-4, 16px) so we don't touch them
    const masks = [];
    let masked = line.replace(/var\([^)]*\)/g, m => {
      masks.push(m);
      return `__VAR${masks.length - 1}__`;
    });
    // Now convert any remaining Npx to Nrem (calc-free, mathematically /16)
    masked = masked.replace(/(?<![\d.\w-])(\d+)px\b/g, (_, n) => {
      changes++;
      const rem = (parseInt(n, 10) / 16);
      // Format: drop trailing zeros, keep up to 4 decimals
      const s = rem.toFixed(4).replace(/\.?0+$/, '');
      return s + 'rem';
    });
    // Restore var() fallbacks
    masked = masked.replace(/__VAR(\d+)__/g, (_, i) => masks[parseInt(i, 10)]);
    return masked;
  }).join('\n');
  if (changes > 0) {
    fs.writeFileSync(file, after);
  }
  return changes;
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (f === 'node_modules' || f === 'coverage' || f === '.git') continue;
      walk(full);
    } else if (f.endsWith('.css') && !f.endsWith('.min.css')) {
      const c = purgeFile(full);
      if (c > 0) console.log(`  ${c} ${full}`);
    }
  }
}

console.log('=== px purge (font-size/margin/padding/gap only, leaves var() fallbacks) ===');
walk('Assets');
purgeFile('styles.css') > 0 && console.log('  changed styles.css');
console.log('Done.');
