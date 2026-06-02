// Broader dead-CSS scan: enumerate every author CSS class, check HTML reach.
// Conservative: only reports classes with ZERO HTML references. Does NOT
// auto-delete (delete in a follow-up pass after human review).
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules','coverage','playwright-report','tests','test-results','.git','_archive','snapshots','.kiro','audit','remediation'].includes(f)) continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const cssFiles = walk('.').filter(f => f.endsWith('.css') && !f.endsWith('.min.css') && !f.includes('node_modules') && !f.includes('coverage'));
const htmlFiles = walk('.').filter(f => f.endsWith('.html') && !f.includes('node_modules') && !f.includes('coverage') && !f.includes('_archive'));

// Concatenate all HTML for one-pass class lookup
const allHtml = htmlFiles.map(f => fs.readFileSync(f, 'utf8')).join('\n');

// Extract all class names from CSS files
const classRe = /\.([a-zA-Z_][a-zA-Z0-9_-]*)(?=[\s,:{\.\[#>+~])/g;
const candidates = new Map();
for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = classRe.exec(css)) !== null) {
    const cls = m[1];
    if (!candidates.has(cls)) candidates.set(cls, 0);
    candidates.set(cls, candidates.get(cls) + 1);
  }
}

// Check each class against HTML
const dead = [];
const known = [];
for (const [cls, cssCount] of candidates) {
  // Look for `class="...cls..."` or `class='...cls...'` patterns
  const htmlRe = new RegExp(`class\\s*=\\s*["'][^"']*\\b${cls.replace(/[-]/g,'\\-')}\\b[^"']*["']`);
  const inHtml = htmlRe.test(allHtml);
  if (!inHtml) {
    dead.push({ cls, cssCount });
  } else {
    known.push({ cls, cssCount });
  }
}

// Sort dead by frequency
dead.sort((a, b) => b.cssCount - a.cssCount);

// Filter to classes safe to delete (don't include pseudo-state classes or framework classes)
const SAFE_PREFIXES = ['btn-', 'card-', 'card--', 'uc-', 'tc-', 'sf25-', 'sf18-', 'sf17-', 'f10-', 'f8-', 'is-cta-', 'nf-', 'sv-btn-', 'sf16-', 'sf12-', 'sf13-', 'sf14-', 'sf30-', 'sf40-', 'sf41-', 'sf42-', 'sf43-', 'sf44-', 'sf46-', 'ms-', 'pw-', 'hp-', 'lh-snippet-'];
const safeDead = dead.filter(d => SAFE_PREFIXES.some(p => d.cls.startsWith(p))).slice(0, 100);

console.log(`Total CSS class definitions: ${candidates.size}`);
console.log(`Used in HTML:                 ${known.length}`);
console.log(`Zero HTML references:         ${dead.length}`);
console.log(`Of which safe-prefix dead:    ${safeDead.length}`);
console.log('');
console.log('Top 30 safe-prefix dead classes:');
for (const d of safeDead.slice(0, 30)) {
  console.log(`  .${d.cls} (${d.cssCount}x in CSS)`);
}

fs.writeFileSync('audit/dead-css-broad-scan.txt',
  `Total: ${candidates.size}\nUsed: ${known.length}\nDead: ${dead.length}\nSafe-prefix dead: ${safeDead.length}\n\n` +
  'All safe-prefix dead classes (zero HTML refs):\n' +
  safeDead.map(d => `.${d.cls} (${d.cssCount}x in CSS)`).join('\n')
);
console.log('\nFull report: audit/dead-css-broad-scan.txt');
