// SF46 Phase 2 P2-F — migrate the 4 hero-options/* pages from Google Fonts
// to self-hosted WOFF2. Saves render-blocking handshake.

const fs = require('fs');
const path = require('path');

const TARGETS = [
  'hero-options/option-1-restored-earth.html',
  'hero-options/option-2-pure-svg-uk.html',
  'hero-options/option-3-live-hud.html',
  'hero-options/option-4-stripe-gradient.html',
];

const SELF_HOSTED = `<!-- SF46 P2-F 2026-05-19 — migrated to self-hosted WOFF2. -->
<link rel="stylesheet" href="/Assets/css/fonts-selfhosted.css?v=99">
<link rel="preload" href="/Assets/fonts/Inter-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/Assets/fonts/Inter-600.woff2" as="font" type="font/woff2" crossorigin>`;

const apply = process.argv.includes('--apply');

let count = 0;
for (const f of TARGETS) {
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  // Match the preconnect + stylesheet pattern
  const re = /<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.googleapis\.com["']>\s*\n?<link\s+rel=["']preconnect["']\s+href=["']https:\/\/fonts\.gstatic\.com["'][^>]*>\s*\n?<link\s+href=["']https:\/\/fonts\.googleapis\.com\/css2[^"']+["']\s+rel=["']stylesheet["'][^>]*>/i;
  if (!re.test(src)) {
    console.log(`SKIP ${f}: pattern not found`);
    continue;
  }
  const out = src.replace(re, SELF_HOSTED);
  if (out === src) {
    console.log(`SKIP ${f}: no change`);
    continue;
  }
  count++;
  console.log(`${apply ? 'APPLY' : 'PLAN '} ${f}`);
  if (apply) fs.writeFileSync(f, out);
}
console.log(`Total: ${count} ${apply ? 'migrated' : 'plan to migrate'}`);
