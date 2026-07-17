#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/autonomous-truth-audit.js
   AF.7 (2026-05-20) — completion proof for the Autonomous Asset Fulfilment.

   Asserts:
     A) Abstract SVG mockups (how-step-*, dashboard-overview, etc.) NO
        LONGER appear in any served HTML file. Only product-card-mock-*
        SVGs are allowed (small inline product cards, not screenshots).
     B) The hero cinematic walkthrough is wired up: #cinematic-walkthrough
        is in index.html, the cinematic-walkthrough.js module is loaded,
        and the .sv-media-frame primitive is shipped in CSS.
     C) The #ca-nav placeholder is a <header> with class sv-nav, the
        nav-inject script is loaded, and zero inline <style> blocks remain
        in any served HTML to fight the Sovereign layers.

   Exit code 0 = all true, 1 = failure.
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set([
  'node_modules', 'test-results', 'playwright-report', 'audit-results',
  'tests', '.git', 'snapshots', '.kiro', 'coverage', 'lcov-report',
  'hero-options', 'tools', 'Assets',
]);

function walk(d, list = []) {
  let e; try { e = fs.readdirSync(d); } catch { return list; }
  for (const f of e) {
    if (SKIP_DIRS.has(f) || f.startsWith('.')) continue;
    const p = path.join(d, f);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, list);
    else if (/\.html$/i.test(f)) list.push(p);
  }
  return list;
}
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

const files = walk(ROOT);
const violations = { abstractSvg: [], inlineStyle: [], navPlaceholder: [] };

// Pattern: ANY svg-mockup that isn't a product-card-mock
const ABSTRACT_SVG_RE = /\/Assets\/svg-mockups\/(?!product-card-mock-)[a-zA-Z0-9_-]+\.svg/g;
const INLINE_STYLE_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

let totalAbstractSvg = 0;

for (const file of files) {
  let html; try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }

  // A) Abstract SVG refs
  const matches = html.match(ABSTRACT_SVG_RE) || [];
  if (matches.length) {
    totalAbstractSvg += matches.length;
    violations.abstractSvg.push({ file: rel(file), count: matches.length, sample: matches[0] });
  }

  // C-i) Inline <style> blocks (any size)
  const styleMatches = html.match(INLINE_STYLE_RE) || [];
  if (styleMatches.length) {
    violations.inlineStyle.push({ file: rel(file), count: styleMatches.length, bytes: styleMatches.reduce((s, m) => s + m.length, 0) });
  }

  // C-ii) #ca-nav placeholder must be <header id="ca-nav" class="sv-nav" …>
  if (!/<header[^>]*id="ca-nav"[^>]*class="[^"]*\bsv-nav\b[^"]*"/.test(html) &&
      /id="ca-nav"/.test(html)) {
    violations.navPlaceholder.push({ file: rel(file), reason: 'ca-nav present but not <header class="sv-nav">' });
  }
}

// B) Hero cinematic walkthrough wiring (home only)
const homeHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cinematicChecks = {
  '#cinematic-walkthrough element': /id="cinematic-walkthrough"/.test(homeHtml),
  '.cinematic-scene images':         /class="cinematic-scene/.test(homeHtml),
  'cinematic-walkthrough.js loaded': /js\/modules\/cinematic-walkthrough\.js/.test(homeHtml),
  'GSAP script loaded':              /js\/vendor\/gsap\.min\.js/.test(homeHtml),
  '.sv-media-frame primitive (CSS)':
    fs.readFileSync(path.join(ROOT, 'Assets', 'css', 'sovereign-primitives.css'), 'utf8')
      .includes('.sv-media-frame {'),
  'real PNG path referenced':        /\/Assets\/marketing-screenshots\/\d{2}-/.test(homeHtml),
};

// Nav wiring (home + 2 sample pages)
const samplePages = ['index.html', 'about.html', 'pricing.html'];
const navChecks = {};
for (const p of samplePages) {
  const html = fs.readFileSync(path.join(ROOT, p), 'utf8');
  navChecks[p] =
    /<header[^>]*id="ca-nav"[^>]*class="[^"]*\bsv-nav\b[^"]*"/.test(html) &&
    /js\/nav-inject\.js/.test(html);
}

// Sector logo marquee (home)
const marqueeCheck = {
  '.sv-marquee block in index.html': /<aside[^>]*class="[^"]*\bsv-marquee\b/.test(homeHtml),
  '8 sector logos rendered': (homeHtml.match(/class="sv-marquee__logo"/g) || []).length >= 16, // 8 × 2 for loop
};

// ── Verdict ───────────────────────────────────────────────────────────
const gates = {
  A_zeroAbstractSvg:    totalAbstractSvg === 0,
  B_cinematicComplete:  Object.values(cinematicChecks).every(Boolean),
  C_zeroInlineStyles:   violations.inlineStyle.length === 0,
  C_navStructure:       Object.values(navChecks).every(Boolean),
  D_marqueeShipped:     Object.values(marqueeCheck).every(Boolean),
};
const allPass = Object.values(gates).every(Boolean);

console.log('═══════════════════════════════════════════════════════════════');
console.log('  AUTONOMOUS TRUTH AUDIT — completion proof');
console.log('═══════════════════════════════════════════════════════════════');
console.log('Files scanned: ' + files.length);
console.log('');
console.log('A) Abstract SVG refs in HTML:        ' + totalAbstractSvg + '  ← target 0');
console.log('B) Cinematic walkthrough wiring:');
for (const [k, v] of Object.entries(cinematicChecks)) {
  console.log('     ' + (v ? '✓' : '✗') + '  ' + k);
}
console.log('C) Nav structure (sample pages):');
for (const [k, v] of Object.entries(navChecks)) {
  console.log('     ' + (v ? '✓' : '✗') + '  ' + k);
}
console.log('C) Inline <style> blocks remaining:  ' + violations.inlineStyle.length + '  ← target 0');
console.log('D) Sector logo marquee:');
for (const [k, v] of Object.entries(marqueeCheck)) {
  console.log('     ' + (v ? '✓' : '✗') + '  ' + k);
}
console.log('');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  Gate verdict');
console.log('═══════════════════════════════════════════════════════════════');
for (const [g, ok] of Object.entries(gates)) {
  console.log('  ' + (ok ? '✓ PASS' : '✗ FAIL') + '  ' + g);
}
console.log('═══════════════════════════════════════════════════════════════');
console.log(allPass
  ? '  RESULT: AUTONOMOUS ASSET FULFILMENT COMPLETE — site is launch-ready'
  : '  RESULT: GAPS DETECTED — see violations above');
console.log('═══════════════════════════════════════════════════════════════');

if (!allPass && violations.abstractSvg.length) {
  console.log('\nFirst 10 abstract-SVG residues:');
  for (const v of violations.abstractSvg.slice(0, 10)) {
    console.log('  ' + v.file + '  (' + v.count + ' refs, e.g. ' + v.sample + ')');
  }
}
if (!allPass && violations.inlineStyle.length) {
  console.log('\nFirst 5 inline-style residues:');
  for (const v of violations.inlineStyle.slice(0, 5)) {
    console.log('  ' + v.file + '  (' + v.count + ' blocks, ' + v.bytes + ' bytes)');
  }
}

process.exit(allPass ? 0 : 1);
