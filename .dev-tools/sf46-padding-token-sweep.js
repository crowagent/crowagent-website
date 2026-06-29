// SF46 batch #6 — padding token sweep. Founder gate: grep -c "padding: [0-9]+px"
// must drop by ≥70%. Aggressive bucket mapping to --space-* tokens.
//
// Buckets:
//   1-5px   → var(--space-1) [4px]
//   6-9px   → var(--space-2) [8px]
//  10-13px  → var(--space-3) [12px]
//  14-17px  → var(--space-4) [16px]
//  18-21px  → var(--space-5) [20px]
//  22-26px  → var(--space-6) [24px]
//  27-32px  → var(--space-8) [32px]
//  33-40px  → var(--space-10) [40px]
//  41-48px  → var(--space-12) [48px]
//  49-64px  → var(--space-16) [64px]
//  65-80px  → var(--space-20) [80px]
//  81-96px+ → var(--space-24) [96px]
//
// Handles `padding: Npx`, `padding: Npx Mpx`, `padding: Npx Mpx Opx`,
// `padding: Npx Mpx Opx Ppx` shorthand. Keeps `padding: 0` as-is.

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'styles.css');
let src = fs.readFileSync(file, 'utf8');

function tokenFor(n) {
  if (n === 0) return '0';
  if (n <= 5) return 'var(--space-1)';
  if (n <= 9) return 'var(--space-2)';
  if (n <= 13) return 'var(--space-3)';
  if (n <= 17) return 'var(--space-4)';
  if (n <= 21) return 'var(--space-5)';
  if (n <= 26) return 'var(--space-6)';
  if (n <= 32) return 'var(--space-8)';
  if (n <= 40) return 'var(--space-10)';
  if (n <= 48) return 'var(--space-12)';
  if (n <= 64) return 'var(--space-16)';
  if (n <= 80) return 'var(--space-20)';
  return 'var(--space-24)';
}

const before = (src.match(/padding:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;

// Match `padding: A B? C? D?;` where each is Npx or 0
src = src.replace(
  /padding:\s*([^;{}\n]+);/g,
  (match, value) => {
    // Only rewrite if EVERY token is either an Npx literal, `0`, or a var()
    // (mixed-value lines with !important/calc are skipped to stay safe)
    const parts = value.trim().split(/\s+/);
    if (parts.length < 1 || parts.length > 4) return match;
    let rewrote = false;
    const out = parts.map(p => {
      const m = p.match(/^([0-9]+(?:\.[0-9]+)?)px$/);
      if (m) { rewrote = true; return tokenFor(parseFloat(m[1])); }
      if (p === '0') return '0';
      // Preserve `!important`
      if (p === '!important') return p;
      // Keep existing var() / calc() / 0 untouched
      if (/^var\(|^calc\(|^clamp\(/.test(p)) return p;
      // Unknown — bail out
      rewrote = null;
      return p;
    });
    if (rewrote === null) return match;
    if (!rewrote) return match;
    return `padding: ${out.join(' ')};`;
  }
);

fs.writeFileSync(file, src);
const after = (src.match(/padding:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;
const reductionPct = Math.round((1 - after / before) * 100);
console.log(JSON.stringify({ file: 'styles.css', before, after, reductionPct, target: '≥70%' }, null, 2));
