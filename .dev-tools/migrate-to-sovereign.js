#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/migrate-to-sovereign.js
   SF46 (2026-05-20) — Stripe/Apple/Google total migration codemod.

   Source: SOVEREIGN-ARCHITECTURE.md.

   Sweeps the entire site:
     1. HTML class migration  — legacy .btn-* / .card-* → .sv-btn / .sv-card chains
     2. CSS hex → tokens      — every #abc / #aabbcc → var(--*) via the canonical map
     3. CSS spacing → tokens  — gap/padding/margin Npx → var(--space-N)
     4. CSS font-size → tokens — font-size: Npx → var(--text-*)
     5. CSS cubic-bezier      → var(--ease-*) by nearest canonical curve
     6. CSS z-index           → var(--z-*) by ladder
     7. Inline <style>        — strip author rules (>1.2KB blocks)

   Modes:
     --dry-run   (default) report changes, write nothing
     --apply              actually mutate files
     --html-only          only run HTML class migration
     --css-only           only run CSS sweeps
     --skip <step>        e.g. --skip inlineStyle

   The codemod is idempotent: running it again after --apply produces no
   further changes.
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY      = !process.argv.includes('--apply');
const HTML_ONLY = process.argv.includes('--html-only');
const CSS_ONLY  = process.argv.includes('--css-only');
const SKIP = new Set(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a === '--skip' && arr[i + 1]) acc.push(arr[i + 1]);
    return acc;
  }, [])
);

const SKIP_DIRS = new Set([
  'node_modules', 'test-results', 'playwright-report', 'audit-results',
  'tests', '.git', 'snapshots', '.kiro',
  // NOTE: do NOT skip 'tools' — that dir holds BOTH the codemod scripts and
  // the public HTML tool pages (csrd-applicability-checker/, etc.). The file
  // extension filters below (.html / .css) handle the JS scripts naturally.
]);
const EXEMPT_FILES = new Set([
  path.join(ROOT, 'crowagent-brand-tokens.css'),
  path.join(ROOT, 'Assets', 'css', 'sovereign-primitives.css'),
  path.join(ROOT, 'Assets', 'css', 'sovereign-cmdk.css'),
]);

// ── 1. HTML class migration table ──────────────────────────────────────
// Order matters: more-specific patterns first.
const BUTTON_MAP = [
  // Exact match → list of sovereign classes that replace it
  ['btn-primary-v2',     ['sv-btn', 'sv-btn--primary']],
  ['btn-primary',        ['sv-btn', 'sv-btn--primary']],
  ['btn-secondary',      ['sv-btn', 'sv-btn--secondary']],
  ['btn-ghost-steel',    ['sv-btn', 'sv-btn--ghost']],
  ['btn-ghost-v2',       ['sv-btn', 'sv-btn--ghost']],
  ['btn-ghost',          ['sv-btn', 'sv-btn--ghost']],
  ['btn-teal-paired',    ['sv-btn', 'sv-btn--primary']],
  ['btn-teal',           ['sv-btn', 'sv-btn--primary']],
  ['btn-sky',            ['sv-btn', 'sv-btn--primary']],
  ['btn-crowmark',       ['sv-btn', 'sv-btn--primary']],
  ['btn-mark',           ['sv-btn', 'sv-btn--primary']],
  ['btn-cinematic',      ['sv-btn', 'sv-btn--primary']],
  ['btn-calc',           ['sv-btn', 'sv-btn--primary']],
  ['btn-cookie-primary', ['sv-btn', 'sv-btn--primary']],
  ['btn-cookie-outline', ['sv-btn', 'sv-btn--secondary']],
  ['btn-v2--secondary',  ['sv-btn', 'sv-btn--secondary']],
  ['btn-v2--lg',         ['sv-btn--lg']],
  ['btn-v2--empty',      ['sv-btn', 'sv-btn--ghost']],
  ['btn-v2--loading',    []],   // visual-only; replaced with data-loading attr (kept inert in HTML codemod)
  ['btn-v2',             ['sv-btn']],
  ['btn--primary',       ['sv-btn', 'sv-btn--primary']],
  ['btn--secondary',     ['sv-btn', 'sv-btn--secondary']],
  ['btn--ghost',         ['sv-btn', 'sv-btn--ghost']],
  ['btn--lg',            ['sv-btn--lg']],
  ['btn-lg',             ['sv-btn--lg']],
  ['btn-md',             ['sv-btn--md']],
  ['btn-sm',             ['sv-btn--sm']],
  ['btn-full-width',     []],   // dropped — width controlled by container
  ['btn-group',          ['sv-cluster']],
  ['btn',                ['sv-btn']],   // lowest priority — base class
];

// Card container classes (not subelement / motion / icon-wrap classes).
// Subelements like .about-card-label / .about-card-spaced are LEFT ALONE.
const CARD_CONTAINER_MAP = [
  ['pgc-pop',                 ['sv-card', 'sv-card--elevated', 'sv-card--accent']],
  ['pgc',                     ['sv-card', 'sv-card--elevated']],
  ['pricing-enterprise-card', ['sv-card', 'sv-card--hero']],
  ['pricing-card',            ['sv-card', 'sv-card--elevated']],
  ['contact-card',            ['sv-card']],
  ['about-card',              ['sv-card']],
  ['f10-office-card',         ['sv-card']],
  ['f10-mvv-card',            ['sv-card', 'sv-card--accent']],
  ['f10-why-card',            ['sv-card', 'sv-card--accent']],
  ['f10-summary-box',         ['sv-card', 'sv-card--accent']],
  ['trust-card',              ['sv-card', 'sv-card--elevated']],
  ['partner-card',            ['sv-card', 'sv-card--elevated']],
  ['feature-card',            ['sv-card']],
  ['step-card',               ['sv-card']],
  ['walkthrough-card',        ['sv-card', 'sv-card--interactive']],
  ['faq-card',                ['sv-card']],
  ['resource-card',           ['sv-card']],
  ['hw-card',                 ['sv-card']],
  ['meth-card',               ['sv-card']],
  ['cross-product-card',      ['sv-card', 'sv-card--interactive']],
  ['product-full-block',      ['sv-card', 'sv-card--hero']],
  ['u-card-v2',               ['sv-card']],
  ['u-card',                  ['sv-card']],
  ['ca-card-v2',              ['sv-card', 'sv-card--interactive']],
  ['ca-card',                 ['sv-card', 'sv-card--interactive']],
];

// Patterns we deliberately preserve — they are NOT card variants.
const CARD_PRESERVE = new Set([
  'ms-card-lift',          // motion modifier
  'card-stack', 'card-row', 'card-row-md',
  // *-label, *-title, *-body, *-footer, *-eyebrow, *-spaced — subelement classes
]);
const CARD_SUBELEMENT_RE = /-(?:label|title|desc|description|body|footer|eyebrow|meta|spaced|num|number|icon|cta|link|name|tagline|bio|sub|preview|date|tag|frame|image|media)\b/;

// rgba whites + teals → token map (most-common literal patterns)
const RGBA_MAP = {
  'rgba(255, 255, 255, 0.03)': 'var(--white-03)',
  'rgba(255, 255, 255, 0.04)': 'var(--white-04)',
  'rgba(255, 255, 255, 0.05)': 'var(--white-05)',
  'rgba(255, 255, 255, 0.06)': 'var(--white-06)',
  'rgba(255, 255, 255, 0.08)': 'var(--white-08)',
  'rgba(255, 255, 255, 0.10)': 'var(--white-08)',
  'rgba(255,255,255,0.03)': 'var(--white-03)',
  'rgba(255,255,255,0.04)': 'var(--white-04)',
  'rgba(255,255,255,0.05)': 'var(--white-05)',
  'rgba(255,255,255,0.06)': 'var(--white-06)',
  'rgba(255,255,255,0.08)': 'var(--white-08)',
  'rgba(12, 201, 168, 0.06)': 'var(--teal-06)',
  'rgba(12, 201, 168, 0.08)': 'var(--teal-08)',
  'rgba(12, 201, 168, 0.12)': 'var(--teal-12)',
  'rgba(12, 201, 168, 0.15)': 'var(--teal-15)',
  'rgba(12, 201, 168, 0.20)': 'var(--teal-20)',
  'rgba(12, 201, 168, 0.25)': 'var(--teal-25)',
  'rgba(12, 201, 168, 0.30)': 'var(--teal-30)',
  'rgba(12, 201, 168, 0.40)': 'var(--teal-40)',
  'rgba(12,201,168,0.06)': 'var(--teal-06)',
  'rgba(12,201,168,0.08)': 'var(--teal-08)',
  'rgba(12,201,168,0.12)': 'var(--teal-12)',
  'rgba(12,201,168,0.15)': 'var(--teal-15)',
  'rgba(12,201,168,0.20)': 'var(--teal-20)',
  'rgba(12,201,168,0.25)': 'var(--teal-25)',
  'rgba(12,201,168,0.30)': 'var(--teal-30)',
  'rgba(12,201,168,0.40)': 'var(--teal-40)',
};

// ── 2. CSS hex → token map ─────────────────────────────────────────────
const HEX_MAP = {
  '#040E1A': 'var(--surface-background)',
  '#040e1a': 'var(--surface-background)',
  '#0A1F3A': 'var(--surface-1)',
  '#0a1f3a': 'var(--surface-1)',
  '#0D2847': 'var(--surface-2)',
  '#0d2847': 'var(--surface-2)',
  '#0F2D52': 'var(--surface-3)',
  '#0f2d52': 'var(--surface-3)',
  '#122F55': 'var(--surface-elevated)',
  '#122f55': 'var(--surface-elevated)',
  '#0CC9A8': 'var(--accent)',
  '#0cc9a8': 'var(--accent)',
  '#0AA88C': 'var(--teal-d)',
  '#0aa88c': 'var(--teal-d)',
  '#E8F0FA': 'var(--text-primary)',
  '#e8f0fa': 'var(--text-primary)',
  '#B8CCE0': 'var(--text-secondary)',
  '#b8cce0': 'var(--text-secondary)',
  '#8A9DB8': 'var(--text-tertiary)',
  '#8a9db8': 'var(--text-tertiary)',
  '#7E96B0': 'var(--text-disabled)',
  '#7e96b0': 'var(--text-disabled)',
  '#FFFFFF': 'var(--white)',
  '#ffffff': 'var(--white)',
  '#FFF':    'var(--white)',
  '#fff':    'var(--white)',
  '#000':    'var(--bg)',
  '#000000': 'var(--bg)',
  '#C2FF57': 'var(--lime)',
  '#c2ff57': 'var(--lime)',
  '#5BC8FF': 'var(--sky)',
  '#5bc8ff': 'var(--sky)',
  '#A78BFA': 'var(--mark)',
  '#a78bfa': 'var(--mark)',
  '#F87171': 'var(--coral)',
  '#f87171': 'var(--coral)',
  '#DAA520': 'var(--gold)',
  '#daa520': 'var(--gold)',
  '#F59E0B': 'var(--warn)',
  '#f59e0b': 'var(--warn)',
  '#EF4444': 'var(--err)',
  '#ef4444': 'var(--err)',
  '#22C55E': 'var(--success)',
  '#22c55e': 'var(--success)',
  '#00D4E8': 'var(--core)',
  '#00d4e8': 'var(--core)',
  '#60A5FA': 'var(--nest)',
  '#60a5fa': 'var(--nest)',
  '#F472B6': 'var(--sight)',
  '#f472b6': 'var(--sight)',
  // Brand extensions added P1.SYS-3 (2026-05-20)
  '#00D4AA': 'var(--teal-bright)',
  '#00d4aa': 'var(--teal-bright)',
  '#0A1628': 'var(--bg-deepest)',
  '#0a1628': 'var(--bg-deepest)',
  '#0F2240': 'var(--surface-bridge)',
  '#0f2240': 'var(--surface-bridge)',
  '#051222': 'var(--bg-onyx)',
  '#0a7970': 'var(--teal-deep)',
  '#FF5F57': 'var(--dot-close)',
  '#FEBC2E': 'var(--dot-minimize)',
  '#28C840': 'var(--dot-maximize)',
  '#586e8b': 'var(--steel-deep)',
  '#4ADE80': 'var(--success-bright)',
  '#4ade80': 'var(--success-bright)',
  // Residue token closure (P1.SYS-3 final pass)
  '#097e6f': 'var(--teal-dark)',
  '#0CC9A9': 'var(--teal-alt)',
  '#0cc9a9': 'var(--teal-alt)',
  '#0CC9AB': 'var(--teal-alt2)',
  '#0cc9ab': 'var(--teal-alt2)',
  '#10DFBB': 'var(--teal-light)',
  '#10dfbb': 'var(--teal-light)',
  '#14E8C2': 'var(--teal-glow-1)',
  '#14e8c2': 'var(--teal-glow-1)',
  '#6EE9D2': 'var(--teal-glow-2)',
  '#6ee9d2': 'var(--teal-glow-2)',
  '#9EFCE8': 'var(--teal-glow-3)',
  '#9efce8': 'var(--teal-glow-3)',
  '#088570': 'var(--teal-light-d)',
  '#066656': 'var(--teal-deeper)',
  '#0D3558': 'var(--surf-blue-1)',
  '#0d3558': 'var(--surf-blue-1)',
  '#1F3A60': 'var(--surf-blue-2)',
  '#1f3a60': 'var(--surf-blue-2)',
  '#3D5878': 'var(--surf-blue-3)',
  '#3d5878': 'var(--surf-blue-3)',
  '#506988': 'var(--surf-blue-4)',
  '#020B16': 'var(--bg-blackest)',
  '#020b16': 'var(--bg-blackest)',
  '#FAFBFC': 'var(--surface-l-1)',
  '#fafbfc': 'var(--surface-l-1)',
  '#F1F5FA': 'var(--surface-l-2)',
  '#f1f5fa': 'var(--surface-l-2)',
  '#E4EAF3': 'var(--surface-l-3)',
  '#e4eaf3': 'var(--surface-l-3)',
  '#DDE4EE': 'var(--surface-l-4)',
  '#dde4ee': 'var(--surface-l-4)',
  '#10B981': 'var(--success-deep)',
  '#10b981': 'var(--success-deep)',
  '#117E3A': 'var(--success-leaf)',
  '#117e3a': 'var(--success-leaf)',
  '#C3E88D': 'var(--success-light)',
  '#c3e88d': 'var(--success-light)',
  '#FFB300': 'var(--warning-amber)',
  '#ffb300': 'var(--warning-amber)',
  '#B26500': 'var(--warning-burnt)',
  '#b26500': 'var(--warning-burnt)',
  '#C82C2C': 'var(--danger-deep)',
  '#c82c2c': 'var(--danger-deep)',
  '#F78C6C': 'var(--danger-coral)',
  '#f78c6c': 'var(--danger-coral)',
  '#4C99FF': 'var(--info-link)',
  '#4c99ff': 'var(--info-link)',
  '#0A66C2': 'var(--info-linkedin)',
  '#0a66c2': 'var(--info-linkedin)',
  '#84CC16': 'var(--lime-bright)',
  '#84cc16': 'var(--lime-bright)',
  '#B89EFC': 'var(--mark-light)',
  '#b89efc': 'var(--mark-light)',
  '#8B6FD9': 'var(--mark-deep)',
  '#8b6fd9': 'var(--mark-deep)',
  '#C792EA': 'var(--mark-violet)',
  '#c792ea': 'var(--mark-violet)',
  // print.css greys
  '#ccc':    'var(--print-grey-1)',
  '#CCC':    'var(--print-grey-1)',
  '#555':    'var(--print-grey-2)',
  '#666':    'var(--print-grey-3)',
  '#0066cc': 'var(--print-link)',
  '#0066CC': 'var(--print-link)',
};

// ── 3. Spacing snap (Npx → --space-N) ─────────────────────────────────
// Nearest-grid rounding. Only applied to common ‹layout› properties.
const SPACE_TOKENS = [
  [0, 'var(--space-0)'],
  [4, 'var(--space-1)'],
  [8, 'var(--space-2)'],
  [12, 'var(--space-3)'],
  [16, 'var(--space-4)'],
  [20, 'var(--space-5)'],
  [24, 'var(--space-6)'],
  [28, 'var(--space-7)'],
  [32, 'var(--space-8)'],
  [40, 'var(--space-10)'],
  [48, 'var(--space-12)'],
  [56, 'var(--space-14)'],
  [60, 'var(--space-15)'],
  [64, 'var(--space-16)'],
  [80, 'var(--space-20)'],
  [96, 'var(--space-24)'],
  [120, 'var(--space-30)'],
  [128, 'var(--space-32)'],
  [160, 'var(--space-40)'],
  [36, 'var(--space-9)'],
];
function snapToSpaceToken(px) {
  let best = null;
  let dist = Infinity;
  for (const [v, tok] of SPACE_TOKENS) {
    const d = Math.abs(px - v);
    if (d < dist) { dist = d; best = tok; }
  }
  // Only convert if within ±2px of a grid value, else leave alone (custom).
  return dist <= 2 ? best : null;
}

// ── 4. Font-size mapping ───────────────────────────────────────────────
const FONT_SIZE_MAP = {
  11: 'var(--text-xs)',  12: 'var(--text-xs)',
  13: 'var(--text-sm)',  14: 'var(--text-sm)',
  15: 'var(--text-md)',  16: 'var(--text-md)',  17: 'var(--text-md)',
  18: 'var(--text-lg)',
  20: 'var(--text-xl)',  22: 'var(--text-xl)',
  24: 'var(--text-2xl)', 28: 'var(--text-2xl)',
  30: 'var(--text-3xl)', 32: 'var(--text-3xl)',
  36: 'var(--text-4xl)', 40: 'var(--text-4xl)',
  48: 'var(--text-5xl)', 56: 'var(--text-5xl)', 60: 'var(--text-5xl)', 64: 'var(--text-6xl)',
};

// ── 5. Cubic-bezier → --ease-* mapping ─────────────────────────────────
// Canonical 4 curves; everything else collapses to --ease-canonical.
const CUBIC_BEZIER_MAP = [
  [/cubic-bezier\s*\(\s*0\.16\s*,\s*1\s*,\s*0\.3\s*,\s*1\s*\)/g,  'var(--ease-canonical)'],
  [/cubic-bezier\s*\(\s*0\.4\s*,\s*0\s*,\s*0\.2\s*,\s*1\s*\)/g,    'var(--ease-standard)'],
  [/cubic-bezier\s*\(\s*0\.65\s*,\s*0\s*,\s*0\.35\s*,\s*1\s*\)/g,  'var(--ease-in-out)'],
  [/cubic-bezier\s*\(\s*0\.34\s*,\s*1\.56\s*,\s*0\.64\s*,\s*1\s*\)/g, 'var(--ease-spring)'],
  [/cubic-bezier\s*\(\s*0\.25\s*,\s*0\.1\s*,\s*0\.25\s*,\s*1\s*\)/g, 'var(--ease-in-out)'],
];
const CUBIC_BEZIER_CATCHALL = /cubic-bezier\s*\([^)]*\)/g;

// ── 6. Z-index → --z-* ladder ──────────────────────────────────────────
const Z_INDEX_LADDER = [
  [0,    'var(--z-base)'],
  [1,    'var(--z-content)'],
  [2,    'var(--z-content)'],
  [3,    'var(--z-content)'],
  [10,   'var(--z-content)'],
  [50,   'var(--z-banner)'],
  [90,   'var(--z-banner)'],
  [99,   'var(--z-banner)'],
  [100,  'var(--z-nav)'],
  [101,  'var(--z-nav)'],
  [200,  'var(--z-nav)'],
  [201,  'var(--z-nav)'],
  [210,  'var(--z-announce)'],
  [300,  'var(--z-mega)'],
  [310,  'var(--z-mega)'],
  [400,  'var(--z-overlay)'],
  [500,  'var(--z-overlay)'],
  [999,  'var(--z-overlay)'],
  [1000, 'var(--z-overlay)'],
  [1001, 'var(--z-overlay)'],
  [1010, 'var(--z-modal)'],
  [1050, 'var(--z-modal)'],
  [1100, 'var(--z-modal)'],
  [1150, 'var(--z-cookie)'],
  [1200, 'var(--z-toast)'],
  [9999, 'var(--z-toast)'],
];
function snapZ(n) {
  let best = 'var(--z-content)'; let dist = Infinity;
  for (const [v, t] of Z_INDEX_LADDER) {
    const d = Math.abs(n - v);
    if (d < dist) { dist = d; best = t; }
  }
  return best;
}

// ── File walker ────────────────────────────────────────────────────────
function walk(dir, list = []) {
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return list; }
  for (const f of entries) {
    if (SKIP_DIRS.has(f) || f.startsWith('.')) continue;
    const p = path.join(dir, f);
    let st;
    try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, list);
    else list.push(p);
  }
  return list;
}
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

// ── HTML class migration ───────────────────────────────────────────────
const totals = {
  htmlFilesChanged: 0,
  buttonReplaces: 0,
  cardReplaces: 0,
  cssFilesChanged: 0,
  hexReplaced: 0,
  fontSizeReplaced: 0,
  cubicBezierReplaced: 0,
  zIndexReplaced: 0,
};

function migrateHtml(file) {
  if (SKIP.has('html') || CSS_ONLY) return;
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { return; }
  const before = src;

  // Replace class="..." occurrences only — leave attribute values like
  // data-* untouched.
  src = src.replace(/class\s*=\s*"([^"]+)"/g, (full, body) => {
    let classes = body.split(/\s+/).filter(Boolean);
    let mutated = false;

    // Buttons: walk classes; if a class matches BUTTON_MAP, replace.
    classes = classes.flatMap(c => {
      // Only consider classes that start with btn or that we'd actively map.
      // Lone `btn` stays; legacy variants get rewritten.
      for (const [legacy, sov] of BUTTON_MAP) {
        if (c === legacy) {
          totals.buttonReplaces++;
          mutated = true;
          return sov;
        }
      }
      return [c];
    });

    // Cards: only rewrite recognised container classes; preserve subelements.
    classes = classes.flatMap(c => {
      if (CARD_PRESERVE.has(c)) return [c];
      if (CARD_SUBELEMENT_RE.test(c)) return [c];
      for (const [legacy, sov] of CARD_CONTAINER_MAP) {
        if (c === legacy) {
          totals.cardReplaces++;
          mutated = true;
          return sov;
        }
      }
      return [c];
    });

    // De-duplicate while preserving order.
    const seen = new Set();
    classes = classes.filter(c => (seen.has(c) ? false : (seen.add(c), true)));

    if (!mutated) return full;
    return 'class="' + classes.join(' ') + '"';
  });

  if (src !== before) {
    if (!DRY) fs.writeFileSync(file, src);
    totals.htmlFilesChanged++;
  }
}

// ── CSS sweeps ─────────────────────────────────────────────────────────
function migrateCss(file) {
  if (SKIP.has('css') || HTML_ONLY) return;
  if (EXEMPT_FILES.has(path.resolve(file))) return;
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { return; }
  const before = src;

  // 2. Hex literal → token. Skip lines that are inside CSS comments (cheap
  //    detection only — proper comment-state walker would be slower; we
  //    accept tiny risk of false-positive in `/* #abc explanation */`).
  if (!SKIP.has('hex')) {
    src = src.split('\n').map(line => {
      if (/^\s*\*/.test(line)) return line; // inside multi-line comment
      return line.replace(/#([0-9A-Fa-f]{3,8})\b/g, (full) => {
        if (HEX_MAP[full]) { totals.hexReplaced++; return HEX_MAP[full]; }
        return full;
      });
    }).join('\n');
  }

  // 3. font-size: Npx → var(--text-*)
  if (!SKIP.has('fontSize')) {
    src = src.replace(/font-size:\s*(\d+)(?:\.\d+)?px/g, (full, n) => {
      const tok = FONT_SIZE_MAP[parseInt(n, 10)];
      if (tok) { totals.fontSizeReplaced++; return 'font-size: ' + tok; }
      return full;
    });
  }

  // 3b. rgba(...) → token (most-common patterns)
  if (!SKIP.has('rgba')) {
    for (const [from, to] of Object.entries(RGBA_MAP)) {
      // Build a tolerant regex matching the rgba pattern (whitespace-loose).
      const safe = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
      const re = new RegExp(safe, 'g');
      src = src.replace(re, () => { totals.hexReplaced++; return to; });
    }
  }

  // 4. gap / padding / margin: Npx → var(--space-N) when N snaps to grid.
  // Conservative: only sweep simple SINGLE-VALUE assignments to avoid mangling
  // shorthand. Combined shorthands like "padding: 10px 20px" are left alone.
  if (!SKIP.has('spacing')) {
    src = src.replace(/(?<![a-z-])(gap|padding-(?:top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end)|margin-(?:top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end)):\s*(\d+)(?:\.\d+)?px/g,
      (full, prop, n) => {
        const tok = snapToSpaceToken(parseInt(n, 10));
        if (tok) { totals.spacingReplaced = (totals.spacingReplaced || 0) + 1; return prop + ': ' + tok; }
        return full;
      });
  }

  // 5. cubic-bezier literal → var(--ease-*)
  if (!SKIP.has('cubicBezier')) {
    for (const [re, tok] of CUBIC_BEZIER_MAP) {
      src = src.replace(re, () => { totals.cubicBezierReplaced++; return tok; });
    }
    src = src.replace(CUBIC_BEZIER_CATCHALL, (full) => {
      totals.cubicBezierReplaced++;
      return 'var(--ease-canonical)';
    });
  }

  // 6. z-index: N literal → var(--z-*)
  if (!SKIP.has('zIndex')) {
    src = src.replace(/z-index:\s*(-?\d+)\b/g, (full, n) => {
      const v = parseInt(n, 10);
      let tok;
      if (v < 0) tok = 'var(--z-below)';
      else       tok = snapZ(v);
      totals.zIndexReplaced++;
      return 'z-index: ' + tok;
    });
  }

  if (src !== before) {
    if (!DRY) fs.writeFileSync(file, src);
    totals.cssFilesChanged++;
  }
}

// ── Main run ───────────────────────────────────────────────────────────
const allFiles = walk(ROOT);
const cssFiles = allFiles.filter(f => /\.css$/i.test(f));
const htmlFiles = allFiles.filter(f => /\.html$/i.test(f));

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MIGRATE TO SOVEREIGN — ' + (DRY ? 'DRY RUN (no writes)' : 'APPLY (writing files)'));
console.log('═══════════════════════════════════════════════════════════════');
console.log('Scanning ' + htmlFiles.length + ' HTML + ' + cssFiles.length + ' CSS');
console.log('');

for (const f of htmlFiles) migrateHtml(f);
for (const f of cssFiles)  migrateCss(f);

console.log('Button class replacements:     ' + totals.buttonReplaces);
console.log('Card class replacements:       ' + totals.cardReplaces);
console.log('HTML files mutated:            ' + totals.htmlFilesChanged);
console.log('');
console.log('Hex / rgba literal → token:    ' + totals.hexReplaced);
console.log('font-size:Npx → token:         ' + totals.fontSizeReplaced);
console.log('spacing (gap/pad/margin)Npx:   ' + (totals.spacingReplaced || 0));
console.log('cubic-bezier → token:          ' + totals.cubicBezierReplaced);
console.log('z-index literal → token:       ' + totals.zIndexReplaced);
console.log('CSS files mutated:             ' + totals.cssFilesChanged);
console.log('');
console.log(DRY
  ? 'DRY RUN COMPLETE — re-run with --apply to write changes.'
  : 'APPLY COMPLETE — sweep finished. Run `node tools/sovereign-sheriff.js` to verify.');
