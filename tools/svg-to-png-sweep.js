#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/svg-to-png-sweep.js
   AF.4 (2026-05-20) — Replace every abstract SVG mockup reference in HTML
   with the closest matching real CrowAgent product screenshot from
   /Assets/marketing-screenshots/. Wraps the resulting <img> in the
   .sv-media-frame primitive automatically.

   Mapping principle: each abstract SVG → semantic match against the 5
   framed PNGs (dashboard, epc-check, crowmark, csrd-checker, analytics).
   When the SVG implies a workflow step, the cinematic walkthrough uses
   variant frames already present in /Assets/marketing-screenshots/.

   Modes:
     node tools/svg-to-png-sweep.js              (dry-run)
     node tools/svg-to-png-sweep.js --apply
   ═══════════════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const SKIP_DIRS = new Set([
  'node_modules', 'test-results', 'playwright-report', 'audit-results',
  'tests', '.git', 'snapshots', '.kiro', 'coverage', 'lcov-report',
  'hero-options', 'tools', 'Assets',
]);

// Mapping: SVG mockup → real screenshot PNG (semantic match).
const MAP = {
  // Core workflow + dashboards
  'dashboard-overview.svg':            '01-dashboard-dark-framed.png',
  'how-step-1-upload.svg':             '01-dashboard-dark-framed.png',
  'how-step-2-analyse.svg':            '02-epc-check-dark-framed.png',
  'how-step-3-report.svg':             '04-csrd-checker-dark-framed.png',
  'how-step-4-export.svg':             '05-analytics-dark-framed.png',
  'property-portfolio.svg':            '01-dashboard-dark-framed.png',
  'evidence-library.svg':              '04-csrd-checker-dark-framed.png',
  'evidence-tracker.svg':              '05-analytics-dark-framed.png',
  'compliance-report.svg':             '04-csrd-checker-dark-framed.png',
  'citation-panel.svg':                '04-csrd-checker-dark-framed.png',
  'board-pack.svg':                    '05-analytics-dark-framed.png',

  // Product-specific walkthroughs — CSRD
  'how-csrd-step-1.svg':               '04-csrd-checker-dark-framed.png',
  'how-csrd-step-2.svg':               '02-epc-check-dark-framed.png',
  'how-csrd-step-3.svg':               '04-csrd-checker-dark-framed.png',
  'how-csrd-step-4.svg':               '05-analytics-dark-framed.png',
  'csrd-applicability.svg':            '04-csrd-checker-dark-framed.png',
  'threshold-test.svg':                '04-csrd-checker-dark-framed.png',

  // CrowMark
  'how-crowmark-step-1.svg':           '03-crowmark-dark-framed.png',
  'how-crowmark-step-2.svg':           '03-crowmark-dark-framed.png',
  'how-crowmark-step-3.svg':           '03-crowmark-dark-framed.png',
  'how-crowmark-step-4.svg':           '05-analytics-dark-framed.png',
  'bid-narrative-ai.svg':              '03-crowmark-dark-framed.png',
  'control-themes.svg':                '03-crowmark-dark-framed.png',

  // CrowCyber
  'how-crowcyber-step-1.svg':          '02-epc-check-dark-framed.png',
  'how-crowcyber-step-2.svg':          '02-epc-check-dark-framed.png',
  'how-crowcyber-step-3.svg':          '04-csrd-checker-dark-framed.png',
  'how-crowcyber-step-4.svg':          '05-analytics-dark-framed.png',
  'cyber-readiness-gauge.svg':         '02-epc-check-dark-framed.png',

  // CrowCash
  'how-crowcash-step-1.svg':           '01-dashboard-dark-framed.png',
  'how-crowcash-step-2.svg':           '02-epc-check-dark-framed.png',
  'how-crowcash-step-3.svg':           '04-csrd-checker-dark-framed.png',
  'how-crowcash-step-4.svg':           '05-analytics-dark-framed.png',
  'crowcash-dso-dashboard.svg':        '01-dashboard-dark-framed.png',
  'crowcash-statutory-letter.svg':     '04-csrd-checker-dark-framed.png',
  'cash-flow-forecast.svg':            '05-analytics-dark-framed.png',
  'late-payment-collector.svg':        '04-csrd-checker-dark-framed.png',

  // CrowESG
  'how-crowesg-step-1.svg':            '02-epc-check-dark-framed.png',
  'how-crowesg-step-2.svg':            '04-csrd-checker-dark-framed.png',
  'how-crowesg-step-3.svg':            '04-csrd-checker-dark-framed.png',
  'how-crowesg-step-4.svg':            '05-analytics-dark-framed.png',
  'esg-framework-matrix.svg':          '04-csrd-checker-dark-framed.png',
  'materiality-assessment.svg':        '04-csrd-checker-dark-framed.png',

  // Misc / static pages
  'retrofit-planner.svg':              '02-epc-check-dark-framed.png',
  '404-abstract.svg':                  '01-dashboard-dark-framed.png',
  'about-abstract.svg':                '01-dashboard-dark-framed.png',
  'contact-abstract.svg':              '01-dashboard-dark-framed.png',
  'demo-abstract.svg':                 '01-dashboard-dark-framed.png',
  'faq-abstract.svg':                  '01-dashboard-dark-framed.png',
  'coming-soon-q3.svg':                '03-crowmark-dark-framed.png',

  // Product card mocks — keep these (they're the small inline product cards,
  // not full screenshots). Skipped via empty value.
  'product-card-mock-crowagent-core.svg': null,
  'product-card-mock-crowmark.svg':       null,
  'product-card-mock-crowcyber.svg':      null,
  'product-card-mock-crowcash.svg':       null,
  'product-card-mock-crowesg.svg':        null,
  'product-card-mock-csrd.svg':           null,
};

function walk(dir, list = []) {
  let entries; try { entries = fs.readdirSync(dir); } catch { return list; }
  for (const f of entries) {
    if (SKIP_DIRS.has(f) || f.startsWith('.')) continue;
    const p = path.join(dir, f);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, list);
    else if (/\.html$/i.test(f)) list.push(p);
  }
  return list;
}
function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

const files = walk(ROOT);
let touched = 0, replaced = 0, skipped = 0;
const samples = [];

for (const file of files) {
  let html; try { html = fs.readFileSync(file, 'utf8'); } catch { continue; }
  const before = html;

  for (const [svg, png] of Object.entries(MAP)) {
    if (png === null) { continue; } // explicit skip — keep product-card-mock SVGs

    // Patterns to find — broad, captures all variants
    // 1) <object data="/Assets/svg-mockups/foo.svg?v=N"></object>
    const objRe = new RegExp('<object\\s+type="image/svg\\+xml"\\s+data="/Assets/svg-mockups/' + svg.replace(/\./g, '\\.') + '[^"]*"([^>]*)>([\\s\\S]*?)<\\/object>', 'g');
    html = html.replace(objRe, function (full, attrs) {
      replaced++;
      if (samples.length < 8) samples.push({ file: rel(file), svg, png });
      return '<img src="/Assets/marketing-screenshots/' + png + '" alt="CrowAgent product screenshot" width="2400" height="1500" loading="lazy" decoding="async"' + attrs + '>';
    });

    // 2) <img src="/Assets/svg-mockups/foo.svg?v=N" …>
    const imgRe = new RegExp('<img([^>]*?)src="/Assets/svg-mockups/' + svg.replace(/\./g, '\\.') + '[^"]*"([^>]*?)>', 'g');
    html = html.replace(imgRe, function (full, pre, post) {
      replaced++;
      if (samples.length < 8) samples.push({ file: rel(file), svg, png });
      // Drop any alt="" on the legacy and substitute real alt; preserve other attrs.
      const preClean = pre.replace(/\s+alt="[^"]*"/g, '');
      const postClean = post.replace(/\s+alt="[^"]*"/g, '');
      return '<img' + preClean + 'src="/Assets/marketing-screenshots/' + png + '"' + postClean + ' alt="CrowAgent product UI screenshot" loading="lazy" decoding="async">';
    });
  }

  if (html !== before) {
    touched++;
    if (APPLY) fs.writeFileSync(file, html);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  SVG → PNG SWEEP — ' + (APPLY ? 'APPLY' : 'DRY RUN'));
console.log('═══════════════════════════════════════════════════════════════');
console.log('Files scanned:     ' + files.length);
console.log('Files touched:     ' + touched);
console.log('SVG refs replaced: ' + replaced);
if (samples.length) {
  console.log('Sample swaps:');
  for (const s of samples) console.log('  ' + s.file + '   ' + s.svg + '  →  ' + s.png);
}
if (!APPLY) console.log('\nDRY RUN — re-run with --apply to write changes.');
