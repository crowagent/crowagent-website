// Rank 1 deletes from C-2-C-5 research: classes confirmed zero HTML hits.
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

// Rank 1 confirmed-dead classes from research
const TARGETS = [
  'bento-card', 'premium-card', 'card-1', 'card-2', 'card-3', 'card-4',
  'btn-primary', 'btn-secondary',  // top-level (NOT btn-primary-v2 which IS used)
];

const truly_dead = TARGETS.filter(cls => {
  const re = new RegExp(`\b${cls.replace(/[-_]/g, '\$&')}\b`);
  return !re.test(allSearchable);
});
console.log('Truly dead (HTML + JS scan):', truly_dead);

let totalDeleted = 0;
const log = [];
for (const file of cssFiles) {
  let css = fs.readFileSync(file, 'utf8');
  let fileDeleted = 0;
  for (const cls of truly_dead) {
    // Conservative: single-class rules only
    const re = new RegExp(`(^|\n)\.${cls.replace(/[-_]/g,'\$&')}\s*\{[^}]*\}\s*`, 'g');
    css = css.replace(re, () => { fileDeleted++; return '\n'; });
  }
  if (fileDeleted > 0) {
    fs.writeFileSync(file, css);
    totalDeleted += fileDeleted;
    log.push(`${file}: -${fileDeleted}`);
    console.log(`  ${file}: -${fileDeleted}`);
  }
}
console.log(`\nDeleted: ${totalDeleted} rules`);
fs.writeFileSync('audit/dead-css-rank1.txt', `Targets: ${TARGETS.join(', ')}\nTruly dead: ${truly_dead.join(', ')}\nDeleted: ${totalDeleted}\n` + log.join('\n'));
