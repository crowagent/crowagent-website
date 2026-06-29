// SF46 Phase 1 — sweep common rgba() literals to opacity tokens.
// Skips :root blocks (definitions), url(), comments.

const fs = require('fs');
const path = require('path');

// Map normalised "rgba(R,G,B,A)" (no spaces, decimal alpha) → token.
const MAP = {
  // Teal tints
  'rgba(12,201,168,0.06)':  'var(--teal-06)',
  'rgba(12,201,168,.06)':   'var(--teal-06)',
  'rgba(12,201,168,0.08)':  'var(--teal-08)',
  'rgba(12,201,168,.08)':   'var(--teal-08)',
  'rgba(12,201,168,0.10)':  'var(--teal-dim)',
  'rgba(12,201,168,.10)':   'var(--teal-dim)',
  'rgba(12,201,168,0.1)':   'var(--teal-dim)',
  'rgba(12,201,168,.1)':    'var(--teal-dim)',
  'rgba(12,201,168,0.12)':  'var(--teal-12)',
  'rgba(12,201,168,.12)':   'var(--teal-12)',
  'rgba(12,201,168,0.15)':  'var(--teal-15)',
  'rgba(12,201,168,.15)':   'var(--teal-15)',
  'rgba(12,201,168,0.18)':  'var(--teal-glow)',
  'rgba(12,201,168,.18)':   'var(--teal-glow)',
  'rgba(12,201,168,0.20)':  'var(--teal-20)',
  'rgba(12,201,168,.20)':   'var(--teal-20)',
  'rgba(12,201,168,0.2)':   'var(--teal-20)',
  'rgba(12,201,168,.2)':    'var(--teal-20)',
  'rgba(12,201,168,0.25)':  'var(--teal-25)',
  'rgba(12,201,168,.25)':   'var(--teal-25)',
  'rgba(12,201,168,0.30)':  'var(--teal-30)',
  'rgba(12,201,168,.30)':   'var(--teal-30)',
  'rgba(12,201,168,0.3)':   'var(--teal-30)',
  'rgba(12,201,168,.3)':    'var(--teal-30)',
  'rgba(12,201,168,0.40)':  'var(--teal-40)',
  'rgba(12,201,168,.40)':   'var(--teal-40)',
  'rgba(12,201,168,0.4)':   'var(--teal-40)',
  'rgba(12,201,168,.4)':    'var(--teal-40)',
  // White tints
  'rgba(255,255,255,0.03)': 'var(--white-03)',
  'rgba(255,255,255,.03)':  'var(--white-03)',
  'rgba(255,255,255,0.04)': 'var(--white-04)',
  'rgba(255,255,255,.04)':  'var(--white-04)',
  'rgba(255,255,255,0.05)': 'var(--white-05)',
  'rgba(255,255,255,.05)':  'var(--white-05)',
  'rgba(255,255,255,0.06)': 'var(--white-06)',
  'rgba(255,255,255,.06)':  'var(--white-06)',
  'rgba(255,255,255,0.08)': 'var(--white-08)',
  'rgba(255,255,255,.08)':  'var(--white-08)',
};

function normaliseLiteral(s) {
  // strip all whitespace inside the literal
  return s.replace(/\s+/g, '');
}

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

function isInsideUrl(text, idx) {
  const before = text.slice(0, idx);
  const lastUrl = before.lastIndexOf('url(');
  if (lastUrl === -1) return false;
  const closeAfter = text.indexOf(')', lastUrl);
  return closeAfter !== -1 && closeAfter > idx;
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
  const RE = /rgba?\(\s*[0-9.]+\s*,\s*[0-9.]+\s*,\s*[0-9.]+(?:\s*,\s*[0-9.]+)?\s*\)/g;
  let out = '';
  let lastIdx = 0;
  let m;
  let replaced = 0;
  while ((m = RE.exec(src)) !== null) {
    const idx = m.index;
    if (isInsideComment(src, idx)) continue;
    if (isInsideRoot(src, idx)) continue;
    if (isInsideUrl(src, idx)) continue;
    const norm = normaliseLiteral(m[0]);
    const replacement = MAP[norm];
    if (!replacement) continue;
    out += src.slice(lastIdx, idx) + replacement;
    lastIdx = idx + m[0].length;
    replaced++;
  }
  out += src.slice(lastIdx);
  return { out, replaced, originalLen: src.length, newLen: out.length };
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
console.log(`\nTotal: ${total}  (mode=${apply ? 'apply' : 'dry-run'})`);
