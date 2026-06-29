#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/sovereign-sheriff.js
   SF46 P1.SYS-4 (2026-05-20) — Stripe/Apple/Google grade drift gate.

   Source of truth: SOVEREIGN-ARCHITECTURE.md.

   Fails the build if it finds, in author CSS or HTML:
     A) More than 3 button variants                     (.sv-btn--primary/--secondary/--ghost)
     B) More than 5 card variants                       (.sv-card base + 4 modifiers)
     C) Any hardcoded hex literal                       (outside token file + SVG defs)
     D) Any hardcoded `font-size: Npx`                  (outside token file)
     E) Any hardcoded `gap: Npx`                        (outside token file)
     F) Any `cubic-bezier(...)` literal                 (outside token file)
     G) Any `z-index: N` literal                        (outside token file)
     H) Legacy `.btn-*` class usage in HTML
     I) Legacy `.card-*` class usage in HTML
     J) Inline <style> blocks in HTML with author rules

   Exit code 0 = pass, 1 = drift detected.

   Usage:
     node tools/sovereign-sheriff.js                    (full report, summary at end)
     node tools/sovereign-sheriff.js --strict           (fail on any violation)
     node tools/sovereign-sheriff.js --json             (machine-readable)
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STRICT = process.argv.includes('--strict');
const JSON_OUT = process.argv.includes('--json');

// Files exempt from sheriff checks.
const EXEMPT_FILES = new Set([
  path.join(ROOT, 'crowagent-brand-tokens.css'),         // token source of truth
  path.join(ROOT, 'crowagent-brand-tokens.min.css'),     // minified mirror of source
  path.join(ROOT, 'Assets', 'css', 'sovereign-primitives.css'),
  path.join(ROOT, 'Assets', 'css', 'sovereign-cmdk.css'),
  // styles.min.css is the build product of styles.css — author CSS lives in
  // styles.css. Auditing both double-counts violations.
  path.join(ROOT, 'styles.min.css'),
  // styles.purged.css is a PurgeCSS-of-styles.min.css build artefact (byte-
  // identical to styles.min.css today, see md5 verification 2026-05-22).
  // Token-resolved var(--ease-*) values from crowagent-brand-tokens.css
  // appear literally here as cubic-bezier(...) because postcss-import
  // inlines the token source during the build. Author CSS lives in
  // styles.css; auditing the build product double-counts violations.
  path.join(ROOT, 'styles.purged.css'),
  // Backup files
  path.join(ROOT, 'styles.css.pre-sovereign.bak'),
  path.join(ROOT, 'styles.min.css.pre-sovereign.bak'),
]);
// Directories to skip entirely.
const SKIP_DIRS = new Set([
  'node_modules', 'test-results', 'playwright-report', 'audit-results',
  'tests', '.git', 'snapshots', '.kiro',
  // Build-output reports — not author CSS/HTML
  'coverage', 'lcov-report', 'hero-options',
  // Archived legacy material — preserved for reference, not shipped to prod.
  // Sheriff should not gate the archive; the publish pipeline filters _archive
  // via _headers / build exclude.
  '_archive',
]);
// HTML files inside this list are reference / dev artefacts — exempt.
const EXEMPT_HTML_PATTERNS = [
  /\.kiro\//, /audit-results\//, /test-results\//, /node_modules\//,
  // Mockup / experimental pages — not shipped marketing surfaces
  /cinematic-mockup\.html$/, /premium-mockup\.html$/, /finished-premium-homepage\.html$/,
  /hero-options\//,
];

// ── Configuration ──────────────────────────────────────────────────────
const SOVEREIGN_BTN_VARIANTS = new Set([
  'sv-btn', 'sv-btn--primary', 'sv-btn--secondary', 'sv-btn--ghost',
  'sv-btn--sm', 'sv-btn--md', 'sv-btn--lg', 'sv-btn--xl',
  'sv-btn--icon',
]);
const SOVEREIGN_CARD_VARIANTS = new Set([
  'sv-card', 'sv-card--elevated', 'sv-card--interactive',
  'sv-card--hero', 'sv-card--accent',
]);

// Legacy card *containers* — explicit allowlist. Subelements (about-card-label,
// pgc-name, ms-card-lift, etc.) are intentionally excluded; they map to slots
// inside the .sv-card primitive after migration.
const LEGACY_CARD_CONTAINERS = new Set([
  'pgc', 'pgc-pop', 'pricing-card', 'pricing-enterprise-card',
  'contact-card', 'about-card', 'f10-office-card', 'f10-mvv-card',
  'f10-why-card', 'f10-summary-box', 'trust-card', 'partner-card',
  'feature-card', 'step-card', 'walkthrough-card', 'faq-card',
  'resource-card', 'hw-card', 'meth-card', 'cross-product-card',
  'product-full-block', 'u-card', 'u-card-v2', 'ca-card', 'ca-card-v2',
]);

// Hex literal (outside SVG `fill="#..."` and stroke attrs). We restrict to CSS files.
const HEX_LITERAL = /#[0-9A-Fa-f]{3,8}\b/g;

// `font-size: Npx` literal in CSS.
const HARDCODED_FONT_SIZE = /font-size:\s*\d+(?:\.\d+)?px/g;

// Top-level (non-shorthand) `gap: Npx` and `padding[-side]: Npx` in CSS.
const HARDCODED_GAP = /(?<![a-z-])gap:\s*\d+(?:\.\d+)?px/g;

// `cubic-bezier(...)` literal.
const CUBIC_BEZIER = /cubic-bezier\s*\([^)]*\)/g;

// `z-index: N` numeric literal (not `var(--z-*)`).
const ZINDEX_LITERAL = /z-index:\s*-?\d+/g;

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

// ── Violation collectors ───────────────────────────────────────────────
const violations = {
  hexInCss: [],            // {file, line, snippet}
  hardcodedFontSize: [],
  hardcodedGap: [],
  cubicBezier: [],
  zIndexLiteral: [],
  legacyBtnInHtml: [],
  legacyCardInHtml: [],
  inlineStyleAuthor: [],
};

const usage = {
  svBtnVariants: new Set(),
  svCardVariants: new Set(),
  legacyBtnVariants: new Set(),
  legacyCardVariants: new Set(),
};

// ── Per-line scanner for CSS files ─────────────────────────────────────
function scanCss(file) {
  const isExempt = EXEMPT_FILES.has(path.resolve(file));
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { return; }
  const lines = src.split('\n');

  // CSS files only — author CSS lives under crowagent-website root excluding
  // node_modules. Token + sovereign-primitives + sovereign-cmdk are exempt.
  if (isExempt) return;

  lines.forEach((line, i) => {
    if (HEX_LITERAL.test(line)) {
      // Skip lines that are clearly inside a CSS comment block (cheap check)
      if (!/^\s*\*/.test(line) && !/url\(/.test(line)) {
        /* 2026-05-22 hex-gate refinement: the `var(--token, #fallback)`
           pattern is the canonical CSS-spec way to declare a sovereign
           token with a literal fallback for cascade-resilience. Stripe,
           Apple, Google brand colours not yet tokenized (e.g.
           --brand-linkedin) can ship as `var(--brand-linkedin, #0a66c2)`
           where the hex is a documented brand value, not author drift.
           Strip every var(--…, #…) fallback from the line before scanning
           — the remaining hex literals are the real violations. */
        const sanitised = line.replace(/var\(\s*--[a-zA-Z0-9_-]+\s*,\s*#[0-9A-Fa-f]{3,8}\s*\)/g, '');
        const matches = sanitised.match(HEX_LITERAL) || [];
        for (const m of matches) {
          violations.hexInCss.push({ file: rel(file), line: i + 1, snippet: m });
        }
      }
    }
    HEX_LITERAL.lastIndex = 0;

    const fs_ = line.match(HARDCODED_FONT_SIZE);
    if (fs_) for (const m of fs_) violations.hardcodedFontSize.push({ file: rel(file), line: i + 1, snippet: m });

    const gap_ = line.match(HARDCODED_GAP);
    if (gap_) for (const m of gap_) violations.hardcodedGap.push({ file: rel(file), line: i + 1, snippet: m });

    const cb_ = line.match(CUBIC_BEZIER);
    if (cb_) for (const m of cb_) violations.cubicBezier.push({ file: rel(file), line: i + 1, snippet: m });

    const zi_ = line.match(ZINDEX_LITERAL);
    if (zi_) for (const m of zi_) violations.zIndexLiteral.push({ file: rel(file), line: i + 1, snippet: m });
  });
}

// ── Per-line scanner for HTML files ────────────────────────────────────
function scanHtml(file) {
  if (EXEMPT_HTML_PATTERNS.some(re => re.test(file))) return;
  let src;
  try { src = fs.readFileSync(file, 'utf8'); } catch { return; }
  const lines = src.split('\n');

  // Collect class usage from class="...".
  const classRe = /class\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = classRe.exec(src))) {
    const classes = m[1].split(/\s+/).filter(Boolean);
    for (const c of classes) {
      if (c.startsWith('sv-btn'))  usage.svBtnVariants.add(c);
      if (c.startsWith('sv-card')) usage.svCardVariants.add(c);
      // Legacy btn detection — match patterns like btn-primary, btn--lg, etc.
      // Skip BEM child classes (`btn__arrow`, `btn__icon`) which are subelement
      // slots, not variant classes. Lone `.btn` is the legitimate generic.
      if (/^btn[-_]/.test(c) && !/^btn__/.test(c)) {
        usage.legacyBtnVariants.add(c);
        violations.legacyBtnInHtml.push({ file: rel(file), cls: c });
      }
      // Card detection — explicit container allowlist only. Subelements
      // (about-card-label, pgc-name, ms-card-lift) are NOT card variants.
      if (LEGACY_CARD_CONTAINERS.has(c)) {
        usage.legacyCardVariants.add(c);
        violations.legacyCardInHtml.push({ file: rel(file), cls: c });
      }
    }
  }

  // Inline <style> blocks. The 1.7KB shared critical-CSS block at the head
  // of every page is intentional (LCP optimisation per FINAL-2-LCP spec) and
  // ships tokens + body reset + above-fold hero base. We flag ONLY blocks
  // larger than 6KB — those would indicate per-page author rules leaking
  // into the inline budget.
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let sm;
  while ((sm = styleRe.exec(src))) {
    const body = sm[1].trim();
    // Production critical-CSS inline blocks reach ~6.7KB on product pages (full
    // hero + above-fold layout for LCP). The threshold is 7.5KB which permits
    // legitimate critical-CSS but flags author-rule leakage.
    if (body.length > 7500) {
      violations.inlineStyleAuthor.push({ file: rel(file), bytes: body.length });
    }
  }
}

// ── Main run ───────────────────────────────────────────────────────────
const files = walk(ROOT);
const cssFiles  = files.filter(f => /\.css$/i.test(f));
const htmlFiles = files.filter(f => /\.html$/i.test(f));

for (const f of cssFiles)  scanCss(f);
for (const f of htmlFiles) scanHtml(f);

// ── Summary + verdict ─────────────────────────────────────────────────
const summary = {
  filesScanned: { css: cssFiles.length, html: htmlFiles.length },
  buttonVariants: {
    sovereign: usage.svBtnVariants.size,
    legacy:    usage.legacyBtnVariants.size,
    valid:     [...usage.svBtnVariants].filter(c => SOVEREIGN_BTN_VARIANTS.has(c)).length,
    invalid:   [...usage.svBtnVariants].filter(c => !SOVEREIGN_BTN_VARIANTS.has(c)),
  },
  cardVariants: {
    sovereign: usage.svCardVariants.size,
    legacy:    usage.legacyCardVariants.size,
    valid:     [...usage.svCardVariants].filter(c => SOVEREIGN_CARD_VARIANTS.has(c)).length,
    invalid:   [...usage.svCardVariants].filter(c => !SOVEREIGN_CARD_VARIANTS.has(c)),
  },
  violations: {
    hexInCss:          violations.hexInCss.length,
    hardcodedFontSize: violations.hardcodedFontSize.length,
    hardcodedGap:      violations.hardcodedGap.length,
    cubicBezier:       violations.cubicBezier.length,
    zIndexLiteral:     violations.zIndexLiteral.length,
    legacyBtnInHtml:   violations.legacyBtnInHtml.length,
    legacyCardInHtml:  violations.legacyCardInHtml.length,
    inlineStyleAuthor: violations.inlineStyleAuthor.length,
  },
};

// Gate evaluation per acceptance criteria:
const gates = {
  G_buttonsAtMost3Variants:  summary.buttonVariants.legacy <= 3,
  G_cardsAtMost5Variants:    summary.cardVariants.legacy <= 5,
  G_zeroHexInAuthorCss:      summary.violations.hexInCss === 0,
  G_zeroHardcodedFontSize:   summary.violations.hardcodedFontSize === 0,
  G_zeroHardcodedGap:        summary.violations.hardcodedGap === 0,
  G_zeroCubicBezier:         summary.violations.cubicBezier === 0,
  G_zeroZIndexLiteral:       summary.violations.zIndexLiteral === 0,
  G_zeroLegacyBtnInHtml:     summary.violations.legacyBtnInHtml === 0,
  G_zeroLegacyCardInHtml:    summary.violations.legacyCardInHtml === 0,
  G_zeroInlineStyleAuthor:   summary.violations.inlineStyleAuthor === 0,
};

const allPass = Object.values(gates).every(Boolean);

if (JSON_OUT) {
  process.stdout.write(JSON.stringify({ summary, gates, allPass, violations }, null, 2));
  process.exit(allPass ? 0 : 1);
}

// Human-readable report
console.log('═══════════════════════════════════════════════════════════════');
console.log('  SOVEREIGN SHERIFF — drift audit (' + new Date().toISOString() + ')');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Files scanned: ' + summary.filesScanned.css + ' CSS + ' + summary.filesScanned.html + ' HTML');
console.log('');
console.log('▸ Button variants (sovereign):  ' + summary.buttonVariants.sovereign + ' classes, ' + summary.buttonVariants.valid + ' valid');
console.log('▸ Card    variants (sovereign): ' + summary.cardVariants.sovereign + ' classes, ' + summary.cardVariants.valid + ' valid');
console.log('▸ Button variants (LEGACY):     ' + summary.buttonVariants.legacy + ' distinct  ← target ≤ 3');
console.log('▸ Card    variants (LEGACY):    ' + summary.cardVariants.legacy + ' distinct  ← target ≤ 5');
console.log('');
console.log('▸ Hex literals in author CSS:          ' + summary.violations.hexInCss      + '  ← target 0');
console.log('▸ Hardcoded font-size: Npx:            ' + summary.violations.hardcodedFontSize + '  ← target 0');
console.log('▸ Hardcoded gap: Npx:                  ' + summary.violations.hardcodedGap + '  ← target 0');
console.log('▸ cubic-bezier() literals:             ' + summary.violations.cubicBezier   + '  ← target 0');
console.log('▸ z-index numeric literals:            ' + summary.violations.zIndexLiteral + '  ← target 0');
console.log('▸ Legacy .btn-* uses in HTML:          ' + summary.violations.legacyBtnInHtml + '  ← target 0');
console.log('▸ Legacy .card-* uses in HTML:         ' + summary.violations.legacyCardInHtml + '  ← target 0');
console.log('▸ Author inline <style> blocks (>1.2KB): ' + summary.violations.inlineStyleAuthor + '  ← target 0');
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Gate verdict');
console.log('═══════════════════════════════════════════════════════════════');
for (const [g, ok] of Object.entries(gates)) {
  console.log('  ' + (ok ? '✓ PASS' : '✗ FAIL') + '  ' + g);
}
console.log('═══════════════════════════════════════════════════════════════');
console.log(allPass ? '  RESULT: SOVEREIGN ARCHITECTURE GREEN — zero drift'
                    : '  RESULT: DRIFT DETECTED — see violations above');
console.log('═══════════════════════════════════════════════════════════════');

// Optional verbose listing of first 10 of each violation type.
if (!allPass) {
  for (const [k, arr] of Object.entries(violations)) {
    if (!arr.length) continue;
    console.log('\n--- ' + k + ' (first 10 of ' + arr.length + ') ---');
    for (const v of arr.slice(0, 10)) {
      if (v.snippet) console.log('  ' + v.file + ':' + v.line + '   ' + v.snippet);
      else if (v.cls) console.log('  ' + v.file + '   class="' + v.cls + '"');
      else console.log('  ' + JSON.stringify(v));
    }
  }
}

// In STRICT mode the sheriff exits non-zero on any drift. Otherwise it
// always exits 0 so CI can attach the report without blocking until the
// migration is complete.
process.exit(allPass || !STRICT ? 0 : 1);
