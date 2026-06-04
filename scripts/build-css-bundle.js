/**
 * build-css-bundle.js
 * Concatenates all main CSS files into a single deferred bundle.
 * Reduces HTTP requests from 9 stylesheets to 1.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ASSETS_CSS = path.join(__dirname, '..', 'Assets', 'css');
const ROOT = path.join(__dirname, '..');
const OUTPUT = path.join(ASSETS_CSS, 'ultra-premium-bundle.css');

// CSS files in cascade order (order matters for specificity)
const CSS_FILES = [
  { dir: ASSETS_CSS, file: 'sovereign-core-v2.compiled.css' },
  { dir: ASSETS_CSS, file: 'signature-atmosphere-2026-05-26.css' },
  { dir: ASSETS_CSS, file: 'product-carousel-2026-05-26.css' },
  { dir: ASSETS_CSS, file: 'premium-transformation-2026-05-27.css' },
  { dir: ASSETS_CSS, file: 'nav-global-fix-2026-05-27.css' },
  { dir: ASSETS_CSS, file: 'premium-gloss-2026-05-31.css' },
  { dir: ROOT, file: 'crowagent-brand-tokens.css' },
  { dir: ASSETS_CSS, file: 'ultra-premium-interactions.css' },
  { dir: ASSETS_CSS, file: 'ultra-premium-responsive.css' }
];

let bundle = '';
let totalSize = 0;
let fileCount = 0;

bundle += '/* ultra-premium-bundle.css */\n';
bundle += '/* Auto-generated: ' + new Date().toISOString().split('T')[0] + ' */\n';
bundle += '/* Contains: ' + CSS_FILES.map(f => f.file).join(', ') + ' */\n\n';

for (const entry of CSS_FILES) {
  const filePath = path.join(entry.dir, entry.file);

  if (!fs.existsSync(filePath)) {
    console.log(`  [skip] ${entry.file} (not found)`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const size = Buffer.byteLength(content, 'utf8');
  totalSize += size;
  fileCount++;

  bundle += `/* === ${entry.file} (${(size / 1024).toFixed(1)} KB) === */\n`;
  bundle += content;
  bundle += '\n\n';

  console.log(`  [done] ${entry.file}: ${(size / 1024).toFixed(1)} KB`);
}

fs.writeFileSync(OUTPUT, bundle, 'utf8');

const bundleStats = fs.statSync(OUTPUT);
console.log('\n--- Bundle Summary ---');
console.log(`  Files concatenated: ${fileCount}`);
console.log(`  Source total:       ${(totalSize / 1024).toFixed(1)} KB`);
console.log(`  Bundle size:        ${(bundleStats.size / 1024).toFixed(1)} KB`);
console.log(`  Output:             ${OUTPUT}`);
