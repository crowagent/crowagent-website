// SF46 Phase 1 — sweep hex literals to brand tokens.
// Only replaces hex used as VALUES inside CSS rules; skips:
//   - :root { ... } definition blocks (the hex IS the token there)
//   - url(...) blocks (data: URIs contain hex as XML attributes)
//   - hex inside attribute selectors like [stroke="#0CC9A8"]
//   - block comments
//
// Run from repo root: node tools/sf46-hex-sweep.js [--apply]
// Without --apply prints the planned changes only (dry-run).

const fs = require('fs');
const path = require('path');

const TOKEN_MAP = {
  // Brand surfaces
  '#040E1A': 'var(--bg)',
  '#0A1F3A': 'var(--surf)',
  '#0D2847': 'var(--surf2)',
  '#0F2D52': 'var(--surf3)',
  '#122F55': 'var(--surf4)',
  // Teal family
  '#0CC9A8': 'var(--teal)',
  '#0AA88C': 'var(--teal-d)',
  // Text scale
  '#E8F0FA': 'var(--cloud)',
  '#B8CCE0': 'var(--steel)',
  '#8A9DB8': 'var(--mist)',
  // Semantic
  '#F59E0B': 'var(--warn)',
  '#EF4444': 'var(--err)',
  '#22C55E': 'var(--success)',
  // Accents
  '#C2FF57': 'var(--lime)',
  '#5BC8FF': 'var(--sky)',
  '#DAA520': 'var(--gold)',
  '#A78BFA': 'var(--mark)',
  '#F87171': 'var(--coral)',
  // Neutrals
  '#FFFFFF': 'var(--white)',
  '#FFF':    'var(--white)',
  '#000000': '#000', // shorthand
  // Cloud variants within 6 RGB units of --cloud (#E8F0FA) — collapse to canonical.
  // Documented 2026-05-18: visual diff <2% lightness; brand consistency overrides drift.
  '#E4ECF7': 'var(--cloud)',
  '#E7ECF2': 'var(--cloud)',
  '#E8EEF7': 'var(--cloud)',
  '#F4F7FB': 'var(--cloud)',  // B3 2026-05-18: lighter cloud drift, collapse to canonical
  // B3 navy drift sweep (2026-05-18): hand-picked variants within 4-6 RGB units of
  // canonical brand surface tokens. Collapse to canonical for brand consistency.
  '#050E1A': 'var(--bg)',      // ~1 unit from --bg #040E1A
  '#05101E': 'var(--bg)',
  '#0A1422': 'var(--bg)',
  '#0A1628': 'var(--bg)',
  '#0F2240': 'var(--surf2)',   // close to --surf2 #0D2847
  '#102840': 'var(--surf2)',
  '#122A4E': 'var(--surf3)',   // close to --surf3 #0F2D52
  // Teal drift (2026-05-18)
  '#0AA88A': 'var(--teal-d)',  // close to --teal-d #0AA88C
  '#07A386': 'var(--teal-d)',
  '#07a386': 'var(--teal-d)',
  '#0AA88C': 'var(--teal-d)',  // exact match — replace with canonical token
  '#0CC9A8': 'var(--teal)',    // exact match — replace with canonical token
  '#0CC9A9': 'var(--teal)',    // off-by-1, collapse to canonical
  '#0CC9AB': 'var(--teal)',    // off-by-3, collapse to canonical
  '#10DFBB': 'var(--teal)',    // brand-consistency drift
  '#00D4AA': 'var(--teal)',    // legacy AI/Mac-style teal drift
};

// Case-insensitive lookup
const lookup = {};
for (const [k, v] of Object.entries(TOKEN_MAP)) lookup[k.toUpperCase()] = v;

function isInsideRoot(text, idx) {
  // Walk backward from idx, balance braces, see if we are inside a :root {...} block
  let depth = 0;
  for (let i = idx - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === '}') depth++;
    else if (ch === '{') {
      if (depth === 0) {
        // Find the selector for this opening brace
        let selEnd = i;
        let selStart = i;
        // Walk backward to start of selector (previous } or start)
        for (let j = i - 1; j >= 0; j--) {
          if (text[j] === '}' || text[j] === ';') { selStart = j + 1; break; }
          if (j === 0) { selStart = 0; break; }
        }
        const sel = text.slice(selStart, selEnd).trim();
        return /(^|[\s,])\:root\b/.test(sel);
      }
      depth--;
    }
  }
  return false;
}

function isInsideUrl(text, idx) {
  // Find the last 'url(' before idx that hasn't been closed by ')'
  const before = text.slice(0, idx);
  const lastUrl = before.lastIndexOf('url(');
  if (lastUrl === -1) return false;
  const closeAfter = text.indexOf(')', lastUrl);
  return closeAfter !== -1 && closeAfter > idx;
}

function isInsideAttrSelector(text, idx) {
  // Check if this hex is inside [...="#hex"] selector pattern
  const before = text.slice(Math.max(0, idx - 50), idx);
  const after = text.slice(idx, Math.min(text.length, idx + 50));
  // crude: a '=' followed by '"' or "'" before idx, and matching close after idx
  if (/[=]\s*["']\s*$/.test(before)) return true;
  return false;
}

function isInsideComment(text, idx) {
  // Find the last /* before idx
  const before = text.slice(0, idx);
  const lastOpen = before.lastIndexOf('/*');
  if (lastOpen === -1) return false;
  const lastClose = before.lastIndexOf('*/');
  return lastClose < lastOpen;
}

function sweepFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const HEX_RE = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  let out = '';
  let lastIdx = 0;
  let m;
  let replaced = 0;
  const replacements = [];
  while ((m = HEX_RE.exec(src)) !== null) {
    const hex = m[0].toUpperCase();
    const idx = m.index;
    // Skip if inside :root, url(), attribute selector, or comment
    if (isInsideComment(src, idx)) continue;
    if (isInsideRoot(src, idx)) continue;
    if (isInsideUrl(src, idx)) continue;
    if (isInsideAttrSelector(src, idx)) continue;
    const replacement = lookup[hex];
    if (!replacement) continue;
    out += src.slice(lastIdx, idx) + replacement;
    lastIdx = idx + m[0].length;
    replaced++;
    replacements.push({ idx, from: m[0], to: replacement });
  }
  out += src.slice(lastIdx);
  return { out, replaced, replacements, originalLen: src.length, newLen: out.length };
}

function walkCss(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkCss(p));
    else if (e.name.endsWith('.css') && !e.name.endsWith('.min.css')) out.push(p);
  }
  return out;
}

const apply = process.argv.includes('--apply');
const minOnly = process.argv.includes('--min');
const files = minOnly
  ? ['styles.min.css']
  : ['styles.css', 'crowagent-brand-tokens.css', 'print.css', ...walkCss('Assets/css')];

let total = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const r = sweepFile(f);
  if (r.replaced === 0) continue;
  total += r.replaced;
  console.log(`${apply ? 'APPLY' : 'PLAN '} ${f}  replaced=${r.replaced}  size: ${r.originalLen} -> ${r.newLen}`);
  if (apply) fs.writeFileSync(f, r.out);
}
console.log(`\nTotal replacements: ${total}  (mode=${apply ? 'apply' : 'dry-run'})`);
