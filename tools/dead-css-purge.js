// Dead-CSS purge — delete CSS rules whose selectors have ZERO references
// in production HTML. Conservative: only deletes rules that are SAFE
// (single-class selectors not part of a compound rule).
// Writes a list of removed rules to /audit/dead-css-removed.txt so the change is auditable.
const fs = require('fs');
const path = require('path');

// Classes confirmed to have ZERO HTML refs (from prior audit grep).
const DEAD_CLASSES = [
  'ca-btn-v2', 'ca-btn-v2--lg', 'ca-btn-v2--secondary',
  'ca-btn-v2--loading', 'ca-btn-v2--empty',
  'btn-mark', 'btn-sky', 'btn-teal',
  'nf-btn', 'nf-btn-primary', 'nf-btn-secondary',
  'is-cta-btn-teal', 'is-cta-btn-teal-paired',
  'is-cta-btn-ghost-steel', 'is-cta-btn-sky', 'is-cta-btn-mark',
];

function readCss(file) { return fs.readFileSync(file, 'utf8'); }
function writeCss(file, content) { fs.writeFileSync(file, content); }

function tryRemoveSingleClassRule(css, cls) {
  // Match `.cls { ... }` as a standalone rule (no comma-grouped selectors).
  // Conservative: only single-class on its own line.
  const re = new RegExp(`(^|\\n)\\.${cls.replace(/[-]/g, '\\-')}\\s*\\{[^}]*\\}\\s*`, 'g');
  let removed = 0;
  const result = css.replace(re, (match) => {
    removed++;
    return '\n';
  });
  return { result, removed };
}

const targets = [
  'styles.css',
  ...require('fs').readdirSync('Assets/css').filter(f => f.endsWith('.css')).map(f => 'Assets/css/' + f),
];

const log = [];
let totalRemoved = 0;
for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  let css = readCss(file);
  let fileRemoved = 0;
  for (const cls of DEAD_CLASSES) {
    const { result, removed } = tryRemoveSingleClassRule(css, cls);
    if (removed > 0) {
      css = result;
      fileRemoved += removed;
      log.push(`  ${file}: removed .${cls} (${removed}x)`);
    }
  }
  if (fileRemoved > 0) {
    writeCss(file, css);
    totalRemoved += fileRemoved;
    console.log(`  ${file}: -${fileRemoved} rules`);
  }
}

console.log(`\nTotal rules deleted: ${totalRemoved}`);
fs.writeFileSync('audit/dead-css-removed.txt', log.join('\n') + `\n\nTotal: ${totalRemoved}\n`);
console.log('Audit log: audit/dead-css-removed.txt');
