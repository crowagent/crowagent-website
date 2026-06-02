// JS-aware dead-CSS purge.
// Scans HTML + JS source files (so classes injected at runtime via nav-inject.js,
// chatbot.js, scripts.js etc. are NOT marked dead). Conservative: only deletes
// single-class rules whose selector appears nowhere in HTML/JS.
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

const all = walk('.');
const cssFiles = all.filter(f => f.endsWith('.css') && !f.endsWith('.min.css'));
const htmlFiles = all.filter(f => f.endsWith('.html'));
const jsFiles = all.filter(f => f.endsWith('.js') && !f.endsWith('.min.js'));

// Concatenate ALL HTML + JS source — JS string literals will contain class names
// injected at runtime (nav-inject.js, chatbot.js, etc.)
const allSearchable = htmlFiles.concat(jsFiles).map(f => fs.readFileSync(f, 'utf8')).join('\n');

// Extract candidate classes from author CSS files
const classRe = /\.([a-zA-Z_][a-zA-Z0-9_-]*)(?=[\s,:{\.\[#>+~])/g;
const candidates = new Set();
for (const file of cssFiles) {
  const css = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = classRe.exec(css)) !== null) candidates.add(m[1]);
}

// For each class, check if its name appears anywhere in HTML/JS source.
// Pattern: word-boundary on either side (catches `class="foo"`, `'btn-primary'`,
// `addClass('foo')`, `\\bfoo\\b` regex sources, etc.)
const dead = [];
for (const cls of candidates) {
  const re = new RegExp(`\\b${cls.replace(/[-_]/g, '\\$&')}\\b`);
  if (!re.test(allSearchable)) dead.push(cls);
}

// Filter to classes from clearly dead/sprint-era prefixes that are safe to delete
const SAFE_TO_DELETE_PREFIXES = [
  'nf-btn', 'sv-btn-v2', 'is-cta-btn-',  // already-migrated CTAs
  'btn-cookie-',                          // cookie banner internals (kept by JS)
];

const safeDead = dead.filter(c => SAFE_TO_DELETE_PREFIXES.some(p => c.startsWith(p)));

console.log(`Total CSS class definitions:  ${candidates.size}`);
console.log(`Truly dead (HTML + JS + nav):  ${dead.length}`);
console.log(`Safe-prefix subset to delete:  ${safeDead.length}`);
console.log('');
console.log('Sample of safe-to-delete classes:');
safeDead.slice(0, 20).forEach(c => console.log(`  .${c}`));

// Now actually delete rules for safeDead classes (single-class rules only)
let totalDeleted = 0;
const log = [];
for (const file of cssFiles) {
  let css = fs.readFileSync(file, 'utf8');
  let fileDeleted = 0;
  for (const cls of safeDead) {
    // Conservative: only standalone `.cls { ... }` rules, not compound
    const re = new RegExp(`(^|\\n)\\.${cls.replace(/[-_]/g,'\\$&')}\\s*\\{[^}]*\\}\\s*`, 'g');
    css = css.replace(re, (match) => { fileDeleted++; return '\n'; });
  }
  if (fileDeleted > 0) {
    fs.writeFileSync(file, css);
    totalDeleted += fileDeleted;
    log.push(`${file}: -${fileDeleted} rules`);
  }
}

console.log(`\nDeleted ${totalDeleted} rules across ${log.length} files.`);
fs.writeFileSync('audit/dead-css-js-aware-removed.txt',
  `Total candidates: ${candidates.size}\nTruly dead: ${dead.length}\nSafe-prefix subset: ${safeDead.length}\nRules deleted: ${totalDeleted}\n\n` +
  log.join('\n') + '\n\nClasses deleted:\n' + safeDead.map(c=>'.'+c).join('\n')
);
console.log('Audit log: audit/dead-css-js-aware-removed.txt');
