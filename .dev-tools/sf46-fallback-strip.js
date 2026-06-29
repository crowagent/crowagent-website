// SF46 Phase 1 B3 part 1 — strip stale `var(--token, #hex)` fallbacks.
//
// brand-tokens.css is loaded on every page, so the hex fallback is dead code.
// Many fallbacks have drifted from the canonical token value (e.g.
// `var(--mist, #A8B2C0)` while `--mist: #8A9DB8`). Either way, remove the
// fallback so the canonical token is the single source of truth.
//
// Skips: :root, url(), comments. Skips _archive/.

const fs = require('fs');
const path = require('path');

// Allow-list of tokens that are always defined in brand-tokens.css.
// We only strip fallbacks for these to be safe.
const KNOWN_TOKENS = new Set([
  'bg', 'surf', 'surf2', 'surf3', 'surf4',
  'teal', 'teal-d', 'teal-dim', 'teal-glow',
  'cloud', 'steel', 'mist', 'white',
  'warn', 'err', 'success',
  'lime', 'sky', 'gold', 'mark', 'coral',
  'navy2', 'obsidian', // legacy; brand-tokens defines neither — DO NOT strip these
]);

// Tokens to actually strip (subset of KNOWN_TOKENS that are TRULY always defined).
const STRIP_TOKENS = new Set([
  'bg', 'surf', 'surf2', 'surf3', 'surf4',
  'teal', 'teal-d', 'teal-dim', 'teal-glow',
  'cloud', 'steel', 'mist', 'white',
  'warn', 'err', 'success',
  'lime', 'sky', 'gold', 'mark', 'coral',
]);

function isInsideRoot(text, idx) {
  let depth = 0;
  for (let i = idx - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === '}') depth++;
    else if (ch === '{') {
      if (depth === 0) {
        let selStart = i;
        for (let j = i - 1; j >= 0; j--) {
          if (text[j] === '}' || text[j] === ';') { selStart = j + 1; break; }
          if (j === 0) { selStart = 0; break; }
        }
        const sel = text.slice(selStart, i).trim();
        return /(^|[\s,])\:root\b/.test(sel);
      }
      depth--;
    }
  }
  return false;
}

function isInsideComment(text, idx) {
  const before = text.slice(0, idx);
  const lastOpen = before.lastIndexOf('/*');
  if (lastOpen === -1) return false;
  const lastClose = before.lastIndexOf('*/');
  return lastClose < lastOpen;
}

function sweepFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  // var(--TOKEN, #hex)  — capture token + hex literal
  const RE = /var\(\s*--([a-z][a-z0-9-]*)\s*,\s*#[0-9A-Fa-f]{3,8}\s*\)/g;
  let out = '';
  let lastIdx = 0;
  let m;
  let replaced = 0;
  while ((m = RE.exec(src)) !== null) {
    const idx = m.index;
    if (isInsideComment(src, idx)) continue;
    if (isInsideRoot(src, idx)) continue;
    const token = m[1].toLowerCase();
    if (!STRIP_TOKENS.has(token)) continue;
    const stripped = `var(--${m[1]})`;
    out += src.slice(lastIdx, idx) + stripped;
    lastIdx = idx + m[0].length;
    replaced++;
  }
  out += src.slice(lastIdx);
  return { out, replaced, originalLen: src.length, newLen: out.length };
}

function walkCss(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '_archive') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkCss(p));
    else if (entry.name.endsWith('.css') && !entry.name.endsWith('.min.css')) out.push(p);
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
  console.log(`${apply ? 'APPLY' : 'PLAN '} ${f}  stripped=${r.replaced}  size: ${r.originalLen} -> ${r.newLen}`);
  if (apply) fs.writeFileSync(f, r.out);
}
console.log(`\nTotal stripped: ${total}  (mode=${apply ? 'apply' : 'dry-run'})`);
