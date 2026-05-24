// Aggressive JS-aware dead-CSS purge — broader prefix coverage.
// Same conservative single-class deletion logic; expanded prefix list now
// covers all sprint-era classes (sf*, f10-, f8-, pw-, ms-, hp-, etc.)
// PLUS specific known-legacy class families.
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules','coverage','playwright-report','tests','test-results','.git','_archive','snapshots','.kiro','audit','remediation'].includes(f)) continue;
      walk(full, out);
    } else { out.push(full); }
  }
  return out;
}

const all = walk('.');
const cssFiles = all.filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));
const htmlFiles = all.filter(f => f.endsWith('.html'));
const jsFiles = all.filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));

const allSearchable = htmlFiles.concat(jsFiles).map(f => fs.readFileSync(f, 'utf8')).join('\n');

const classRe = /\.([a-zA-Z_][a-zA-Z0-9_-]*)(?=[\s,:{\.\[#>+~])/g;
const candidates = new Set();
for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = classRe.exec(css)) !== null) candidates.add(m[1]);
}

const dead = [];
for (const cls of candidates) {
  const re = new RegExp(`\\b${cls.replace(/[-_]/g, '\\$&')}\\b`);
  if (!re.test(allSearchable)) dead.push(cls);
}

// Aggressive prefix list — sprint-era, legacy
const SAFE_TO_DELETE_PREFIXES = [
  // Already-migrated CTAs (prior passes)
  'nf-btn', 'ca-btn-v2', 'is-cta-btn-',
  // Sprint-era CSS that produced specific HTML patterns later replaced
  'sf12-', 'sf13-', 'sf14-', 'sf16-', 'sf17-', 'sf18-', 'sf21-', 'sf23-',
  'sf25-', 'sf27-', 'sf30-', 'sf40-', 'sf41-', 'sf42-', 'sf43-', 'sf44-',
  'sf46-',
  // F10/F8 namespace (per-page archetype experiments)
  'f10-', 'f8-blog', 'f8-glossary', 'f8-pricing',
  // Mockup-era classes
  'premium-', 'finished-premium-', 'bento-',
  // Pre-walkthrough sprints
  'pw-sf', 'ms-',
];
// Exempt the well-known classes we KNOW are still active (failsafe)
const EXEMPT = new Set([
  'f8-page', 'f8-404', 'f8-products', 'f8-roadmap', 'f8-cookie-preferences',
]);

const safeDead = dead
  .filter(c => SAFE_TO_DELETE_PREFIXES.some(p => c.startsWith(p)))
  .filter(c => !EXEMPT.has(c));

console.log(`Total CSS class definitions:  ${candidates.size}`);
console.log(`Truly dead (HTML + JS):       ${dead.length}`);
console.log(`Safe-prefix subset to delete:  ${safeDead.length}`);

let totalDeleted = 0;
const log = [];
for (const file of cssFiles) {
  let css = fs.readFileSync(file, 'utf8');
  let fileDeleted = 0;
  for (const cls of safeDead) {
    const re = new RegExp(`(^|\\n)\\.${cls.replace(/[-_]/g,'\\$&')}\\s*\\{[^}]*\\}\\s*`, 'g');
    css = css.replace(re, () => { fileDeleted++; return '\n'; });
  }
  if (fileDeleted > 0) {
    fs.writeFileSync(file, css);
    totalDeleted += fileDeleted;
    log.push(`${file}: -${fileDeleted}`);
    console.log(`  ${file}: -${fileDeleted} rules`);
  }
}

console.log(`\nDeleted ${totalDeleted} rules across ${log.length} files.`);
fs.writeFileSync('audit/dead-css-aggressive-removed.txt',
  `Total candidates: ${candidates.size}\nTruly dead: ${dead.length}\nSafe-prefix subset: ${safeDead.length}\nRules deleted: ${totalDeleted}\n\n` +
  log.join('\n') + '\n\nClasses deleted:\n' + safeDead.map(c=>'.'+c).join('\n')
);
console.log('Log: audit/dead-css-aggressive-removed.txt');
