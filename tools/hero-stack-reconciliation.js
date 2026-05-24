#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/hero-stack-reconciliation.js
   REC.3 (2026-05-20) — wrap hero copy containers in .sv-stack so the
   children get structural vertical flow + alignment from the sovereign
   primitive instead of ad-hoc text-align rules.

   Rules:
     - `.hero-col-copy`  (home split-layout)        →  add .sv-stack .sv-stack--align-start
     - `.hero-content`   (centered product/tool)    →  add .sv-stack .sv-stack--align-center
     - `.hero .wrap`     (centered legacy hero)     →  add .sv-stack .sv-stack--align-center
     - `body.f8-pricing .hero .wrap`                 → centered (handled by .wrap above)

   Idempotent — re-running adds the classes only when absent.
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const SKIP_DIRS = new Set([
  'node_modules', 'test-results', 'playwright-report', 'audit-results',
  'tests', '.git', 'snapshots', '.kiro', 'coverage', 'lcov-report', 'hero-options',
]);

function walk(d, list = []) {
  let entries; try { entries = fs.readdirSync(d); } catch { return list; }
  for (const f of entries) {
    if (SKIP_DIRS.has(f) || f.startsWith('.')) continue;
    const p = path.join(d, f);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, list);
    else if (/\.html$/i.test(f)) list.push(p);
  }
  return list;
}
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

/* Apply: append sovereign classes to existing class="…" when absent.
   classMap is array of [literalLegacyClass, sovereignClassesToAdd]. */
const RULES = [
  // Home split-layout copy column
  ['hero-col-copy',       'sv-stack sv-stack--align-start'],
  // Generic centered hero content wrapper
  ['hero-content',        'sv-stack sv-stack--align-center'],
];

let touched = 0;
let added = 0;
const samples = [];

const files = walk(ROOT);
for (const file of files) {
  let html; try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
  const before = html;

  for (const [legacy, sovereign] of RULES) {
    // Match every `class="… legacy …"` and inject sovereign if missing
    const re = new RegExp('class="([^"]*\\b' + legacy + '\\b[^"]*)"', 'g');
    html = html.replace(re, function (m, body) {
      // Skip if any of the sovereign classes already present
      const sovList = sovereign.split(/\s+/);
      const allPresent = sovList.every(c => new RegExp('\\b' + c + '\\b').test(body));
      if (allPresent) return m;
      const missing = sovList.filter(c => !new RegExp('\\b' + c + '\\b').test(body));
      added += missing.length;
      if (samples.length < 6) samples.push({ file: rel(file), legacy, added: missing.join(' ') });
      return 'class="' + body.trim() + ' ' + missing.join(' ') + '"';
    });
  }

  // Pricing-style centered hero — body.f8-pricing .hero > .wrap or .container
  // Targeted: scope per-page by body class — handled below for specific archetypes.
  // Pages whose hero uses `<div class="wrap container-wide">` directly inside <section class="hero">
  // need stack centering. We detect via the body class.
  const bodyClasses = (html.match(/<body[^>]*\bclass="([^"]+)"/) || [, ''])[1];
  const centeredArchetypes = /\b(f8-pricing|f8-contact|f8-faq|f8-roadmap|f8-changelog|f8-partners|f8-blog|f8-resources|f8-glossary|f8-about|f8-tool-form|f8-product)\b/.test(bodyClasses);
  if (centeredArchetypes) {
    // Find <section class="hero …"><div class="wrap …"> and add sovereign classes to that wrap
    html = html.replace(
      /(<section[^>]*\bclass="[^"]*\bhero\b[^"]*"[^>]*>\s*(?:<[^>]+>\s*)*?<div[^>]*\bclass=")((?:[^"]+))"/g,
      function (full, prefix, wrapBody) {
        const sovereign = ['sv-stack', 'sv-stack--align-center'];
        const missing = sovereign.filter(c => !new RegExp('\\b' + c + '\\b').test(wrapBody));
        if (!missing.length) return full;
        added += missing.length;
        if (samples.length < 8) samples.push({ file: rel(file), legacy: 'hero .wrap', added: missing.join(' ') });
        return prefix + wrapBody.trim() + ' ' + missing.join(' ') + '"';
      }
    );
  }

  if (html !== before) {
    touched++;
    if (APPLY) fs.writeFileSync(file, html);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  HERO STACK RECONCILIATION — ' + (APPLY ? 'APPLY' : 'DRY RUN'));
console.log('═══════════════════════════════════════════════════════════════');
console.log('Files scanned: ' + files.length);
console.log('Files touched: ' + touched);
console.log('Sovereign classes added: ' + added);
if (samples.length) {
  console.log('Sample edits:');
  for (const s of samples) console.log('  ' + s.file + '  ' + s.legacy + '  +' + s.added);
}
if (!APPLY) console.log('\nDRY RUN — re-run with --apply to write changes.');
