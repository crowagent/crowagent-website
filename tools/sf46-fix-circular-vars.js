// SF46 G1-G5 closure — fix circular `--token: var(--token)` declarations
// inside HTML <style> :root blocks introduced by an earlier B6 sweep bug.
//
// These circular references resolve to "guaranteed-invalid value" per CSS
// spec, breaking the entire cascade for affected tokens. Restore the
// canonical hex literals so the critical CSS works as intended.

const fs = require('fs');
const path = require('path');

// Canonical hex values from crowagent-brand-tokens.css :root.
const CANONICAL = {
  'bg':       '#040E1A',
  'surf':     '#0A1F3A',
  'surf2':    '#0D2847',
  'surf3':    '#0F2D52',
  'surf4':    '#122F55',
  'teal':     '#0CC9A8',
  'teal-d':   '#0AA88C',
  'cloud':    '#E8F0FA',
  'steel':    '#B8CCE0',
  'mist':     '#8A9DB8',
  'lime':     '#C2FF57',
  'sky':      '#5BC8FF',
  'gold':     '#DAA520',
  'mark':     '#A78BFA',
  'coral':    '#F87171',
  'warn':     '#F59E0B',
  'err':      '#EF4444',
  'success':  '#22C55E',
  'white':    '#FFFFFF',
};

function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '_archive', 'debug-screenshots', 'test-results', '.git', 'tests', 'scripts', 'tools'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function fixFile(src) {
  // Pattern: --TOKEN: var(--TOKEN) — same token name on both sides.
  // Replace with canonical hex value.
  let replaced = 0;
  const out = src.replace(/--([a-z][a-z0-9-]*)\s*:\s*var\(\s*--\1\s*\)/g, (match, token) => {
    const t = token.toLowerCase();
    if (CANONICAL[t]) {
      replaced++;
      return `--${token}:${CANONICAL[t]}`;
    }
    // Unknown token — leave but log
    return match;
  });
  return { out, replaced };
}

const apply = process.argv.includes('--apply');
const files = walkHtml('.');

let total = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const r = fixFile(src);
  if (r.replaced === 0) continue;
  total += r.replaced;
  console.log(`${apply ? 'APPLY' : 'PLAN '} ${f}  fixed=${r.replaced}`);
  if (apply) fs.writeFileSync(f, r.out);
}
console.log(`\nTotal circular vars fixed: ${total}  (mode=${apply ? 'apply' : 'dry-run'})`);
