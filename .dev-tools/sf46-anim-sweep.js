// SF46 Phase 1 B5 — sweep cubic-bezier easing literals + transition/animation
// duration literals to design tokens.
//
// Scope:
//   Easings: 4 canonical curves (--ease-out, --ease-in-out, --ease-spring, --ease-standard).
//   Durations: 4 motion tokens (--motion-fast/base/medium/slow), ONLY in
//              transition*/animation* declarations.
// Skips: :root blocks (token definitions), url(), comments.
//
// Long decorative durations (>= 1s, atmospheric loops, gradient drift) are left
// as literals — they are intentional per-animation timing, not interaction speed.

const fs = require('fs');
const path = require('path');

// Map normalised "cubic-bezier(...)" (no spaces) → token.
// Both 0.X and .X decimal forms covered.
const EASE_MAP = {
  // --ease-out  cubic-bezier(0.16, 1, 0.3, 1)
  'cubic-bezier(0.16,1,0.3,1)': 'var(--ease-out)',
  'cubic-bezier(.16,1,.3,1)':   'var(--ease-out)',
  // --ease-spring cubic-bezier(0.34, 1.56, 0.64, 1)
  'cubic-bezier(0.34,1.56,0.64,1)': 'var(--ease-spring)',
  'cubic-bezier(.34,1.56,.64,1)':   'var(--ease-spring)',
  // --ease-in-out cubic-bezier(0.65, 0, 0.35, 1)
  'cubic-bezier(0.65,0,0.35,1)': 'var(--ease-in-out)',
  'cubic-bezier(.65,0,.35,1)':   'var(--ease-in-out)',
  // --ease-standard cubic-bezier(0.4, 0, 0.2, 1) — Material/Linear/Stripe UI
  'cubic-bezier(0.4,0,0.2,1)': 'var(--ease-standard)',
  'cubic-bezier(.4,0,.2,1)':   'var(--ease-standard)',
};

// Map normalised duration literal → token.
// Includes both `Xs` and `Yms` forms.
const DUR_MAP = {
  '0.15s': 'var(--motion-fast)',
  '.15s':  'var(--motion-fast)',
  '150ms': 'var(--motion-fast)',
  '0.3s':  'var(--motion-base)',
  '.3s':   'var(--motion-base)',
  '300ms': 'var(--motion-base)',
  '0.5s':  'var(--motion-medium)',
  '.5s':   'var(--motion-medium)',
  '500ms': 'var(--motion-medium)',
  '0.8s':  'var(--motion-slow)',
  '.8s':   'var(--motion-slow)',
  '800ms': 'var(--motion-slow)',
};

function normaliseLiteral(s) {
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

// For durations: only swap when inside a transition*/animation* declaration.
// Walk back from idx to last `;` or `{` (start of declaration), capture property name.
function isInsideAnimDeclaration(text, idx) {
  for (let i = idx - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ';' || ch === '{' || ch === '}') {
      const decl = text.slice(i + 1, idx);
      const propMatch = decl.match(/^\s*([\w-]+)\s*:/);
      if (!propMatch) return false;
      const prop = propMatch[1].toLowerCase();
      return prop === 'transition' || prop === 'transition-duration' ||
             prop === 'transition-delay' ||
             prop === 'animation' || prop === 'animation-duration' ||
             prop === 'animation-delay';
    }
  }
  return false;
}

function sweepEasings(src) {
  // cubic-bezier(...) — capture entire literal incl. ws inside parens
  const RE = /cubic-bezier\(\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*,\s*-?[\d.]+\s*\)/g;
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
    const replacement = EASE_MAP[norm];
    if (!replacement) continue;
    out += src.slice(lastIdx, idx) + replacement;
    lastIdx = idx + m[0].length;
    replaced++;
  }
  out += src.slice(lastIdx);
  return { out, replaced };
}

function sweepDurations(src) {
  // Duration literal: digit(s)[.digit(s)] + s|ms, with word-boundary discipline
  // so we don't catch `.15s` inside `0.15s` twice, or numbers in `box-shadow: 0 4px ...`.
  // Match either `\d+\.\d+(s|ms)`, `\.\d+(s|ms)`, or `\d+(s|ms)`.
  const RE = /(?<![\w.-])(?:\d+\.\d+|\.\d+|\d+)(?:s|ms)\b/g;
  let out = '';
  let lastIdx = 0;
  let m;
  let replaced = 0;
  while ((m = RE.exec(src)) !== null) {
    const idx = m.index;
    if (isInsideComment(src, idx)) continue;
    if (isInsideRoot(src, idx)) continue;
    if (isInsideUrl(src, idx)) continue;
    if (!isInsideAnimDeclaration(src, idx)) continue;
    const lit = m[0];
    const replacement = DUR_MAP[lit];
    if (!replacement) continue;
    out += src.slice(lastIdx, idx) + replacement;
    lastIdx = idx + lit.length;
    replaced++;
  }
  out += src.slice(lastIdx);
  return { out, replaced };
}

function sweepFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const e = sweepEasings(src);
  const d = sweepDurations(e.out);
  return {
    out: d.out,
    easings: e.replaced,
    durations: d.replaced,
    originalLen: src.length,
    newLen: d.out.length,
  };
}

function walkCss(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
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

let totalE = 0, totalD = 0;
for (const f of files) {
  if (!fs.existsSync(f)) continue;
  const r = sweepFile(f);
  if (r.easings === 0 && r.durations === 0) continue;
  totalE += r.easings;
  totalD += r.durations;
  console.log(`${apply ? 'APPLY' : 'PLAN '} ${f}  easings=${r.easings}  durations=${r.durations}  size: ${r.originalLen} -> ${r.newLen}`);
  if (apply) fs.writeFileSync(f, r.out);
}
console.log(`\nTotal: easings=${totalE}  durations=${totalD}  (mode=${apply ? 'apply' : 'dry-run'})`);
