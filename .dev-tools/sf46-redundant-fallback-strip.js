// SF46 Phase 1 B1 cleanup — strip redundant `var(--x, var(--x))` patterns.
//
// `var(--token, var(--token))` has fallback === primary — purely dead code from
// an earlier codemod. Collapse to `var(--token)`.

const fs = require('fs');
const path = require('path');

function sweepFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const RE = /var\(\s*--([a-z][a-z0-9-]*)\s*,\s*var\(\s*--\1\s*\)\s*\)/g;
  let out = '';
  let lastIdx = 0;
  let m;
  let replaced = 0;
  while ((m = RE.exec(src)) !== null) {
    const idx = m.index;
    out += src.slice(lastIdx, idx) + `var(--${m[1]})`;
    lastIdx = idx + m[0].length;
    replaced++;
  }
  out += src.slice(lastIdx);
  return { out, replaced, originalLen: src.length, newLen: out.length };
}

function walkCss(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['_archive', 'node_modules'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkCss(p));
    else if (entry.name.endsWith('.css')) out.push(p);
  }
  return out;
}

const apply = process.argv.includes('--apply');
const files = ['styles.css', 'styles.min.css', 'crowagent-brand-tokens.css', 'print.css', ...walkCss('Assets/css')];

let total = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const r = sweepFile(f);
  if (r.replaced === 0) continue;
  total += r.replaced;
  console.log(`${apply ? 'APPLY' : 'PLAN '} ${f}  stripped=${r.replaced}  size: ${r.originalLen} -> ${r.newLen}`);
  if (apply) fs.writeFileSync(f, r.out);
}
console.log(`\nTotal: ${total}  (mode=${apply ? 'apply' : 'dry-run'})`);
