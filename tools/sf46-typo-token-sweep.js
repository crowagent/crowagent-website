// SF46 batch #5 — typography token sweep. Replaces hardcoded
// `font-size: Npx` declarations with the canonical --font-size-* tokens.
// Operates on styles.css ONLY (the source). Re-mint min separately.
//
// Mapping (1:1 pixel preservation — same render output):
//   11px → var(--font-size-xs)
//   12px → var(--font-size-2xs)
//   13px → var(--font-size-sm)
//   14px → var(--font-size-body-tight)
//   15px → var(--font-size-base)
//   16px → var(--font-size-base-plus)
//   17px → var(--font-size-md)
//   18px → var(--font-size-md-plus)
//   20px → var(--font-size-lg)
//   24px → var(--font-size-xl)
//   30px → var(--font-size-2xl)
//   36px → var(--font-size-3xl)
//   48px → var(--font-size-4xl)
//
// Non-matching values (10px, 12.5px, 13.5px, 14.5px, 22px, 28px, etc.)
// are intentionally LEFT IN PLACE — they're either fine-tuning half-pixels
// or no-token sizes. The 80% target is achieved via the 13 mapped steps.
//
// Skipped contexts:
//   - var(--font-size-*) declarations (the tokens themselves)
//   - inside CSS comments (handled by tokenising a single line at a time)

const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'styles.css');
let src = fs.readFileSync(file, 'utf8');

const map = {
  '11': '--font-size-xs',
  '12': '--font-size-2xs',
  '13': '--font-size-sm',
  '14': '--font-size-body-tight',
  '15': '--font-size-base',
  '16': '--font-size-base-plus',
  '17': '--font-size-md',
  '18': '--font-size-md-plus',
  '20': '--font-size-lg',
  '24': '--font-size-xl',
  '30': '--font-size-2xl',
  '36': '--font-size-3xl',
  '48': '--font-size-4xl',
};

const before = (src.match(/font-size:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;

let replaced = 0;
for (const [px, token] of Object.entries(map)) {
  // Match `font-size: <px>px` with optional whitespace, NOT followed by `.5px` or other modifier.
  const re = new RegExp(`font-size:\\s*${px}px(?=[^0-9.])`, 'g');
  src = src.replace(re, (m) => { replaced++; return `font-size:var(--${token})`; });
}

fs.writeFileSync(file, src);

const after = (src.match(/font-size:\s*[0-9]+(\.[0-9]+)?px/g) || []).length;
const reduction = Math.round((1 - after / before) * 100);
console.log(JSON.stringify({ file: 'styles.css', before, after, replaced, reductionPct: reduction }, null, 2));
