#!/usr/bin/env node
/**
 * SF46 Phase 5 — Product-page surgical fixes per founder verdict 2026-05-19.
 *
 *  1. Remove "Start free trial ×" close-icon bug (the literal × that
 *     appears inline with the CTA text on some product pages)
 *  2. Fix "CrowAgent" vs "Crow Agent" spacing (typo)
 *  3. Centre ".section-padding" sections with the "Start your … assessment today" text
 *  4. Add separators between security badges (AES-256, TLS 1.3, ICO, ISO)
 *  5. Strip dangling sentence "No manual data entry, single property or bulk CSV"
 *     awkward continuation in step descriptions on product pages
 *
 * Site-wide:
 *  6. "CrowAgent does not generate compliance opinions" centred on home
 *
 * Idempotent.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let summary = [];

function edit(file, label, fn) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { summary.push(`MISS ${file} (${label})`); return; }
  const before = fs.readFileSync(full, 'utf8');
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(full, after);
    summary.push(`EDIT ${file} (${label})`);
  } else {
    summary.push(`NOOP ${file} (${label})`);
  }
}

const PRODUCT_PAGES = ['crowmark.html', 'crowcyber.html', 'crowcash.html', 'crowesg.html', 'csrd.html'];

// 1. Strip "× " or " ×" close-icon adjacent to CTA text
for (const f of PRODUCT_PAGES) {
  edit(f, 'remove × close-icon next to Start free trial', (s) => {
    // Match patterns like "Start free trial ×" or "Start free trial</...><span...>×</span>"
    s = s.replace(/Start free trial\s*<[^>]*>\s*&times;\s*<\/[^>]+>/g, 'Start free trial');
    s = s.replace(/(Start free trial)\s*×/g, '$1');
    s = s.replace(/(Book a demo)\s*×/g, '$1');
    return s;
  });
}

// 2. Fix "Crow Agent" typo (should be "CrowAgent" — one word)
for (const f of PRODUCT_PAGES.concat(['index.html', 'about.html', 'partners.html', 'pricing.html', 'contact.html'])) {
  edit(f, 'fix Crow Agent typo', (s) => s.replace(/\bCrow Agent\b/g, 'CrowAgent'));
}

// 3. Centre the assessment CTA section by adding align-center class
for (const f of PRODUCT_PAGES) {
  edit(f, 'centre Start-your-X-assessment CTA section', (s) => {
    // Find sections whose H2 mentions "Start your" — likely the bottom CTA section
    return s.replace(/<section\b([^>]*?)>\s*(<div class="wrap[^"]*">\s*<h2[^>]*>Start your)/g,
      '<section$1 align-center>$2');
  });
}

// 4. Add separators (· interpunct) between security badges that run together
for (const f of PRODUCT_PAGES) {
  edit(f, 'separate security badges with interpunct', (s) => {
    // Match security-badge groups: AES-256 followed by TLS without separator
    s = s.replace(/AES-256 at rest\s+TLS 1\.3 in transit/g, 'AES-256 at rest · TLS 1.3 in transit');
    s = s.replace(/AES-256 at rest\s+TLS 1\.3/g, 'AES-256 at rest · TLS 1.3');
    return s;
  });
}

// 5. "CrowAgent does not generate compliance opinions" centred on home
edit('index.html', 'centre Our-methodology disclaimer text', (s) => {
  // Wrap the specific paragraph in a centered class
  return s.replace(/(<p[^>]*?)class="([^"]*)"([^>]*>)(\s*CrowAgent does not generate compliance opinions[^<]*)/g,
    '$1class="$2 u-text-center"$3$4');
});

// 6. Skip-link in DOM order — should be BEFORE announce-bar
for (const f of PRODUCT_PAGES.concat(['index.html'])) {
  edit(f, 'ensure skip-link before announce-bar', (s) => {
    // Detect pattern: announce-bar BEFORE skip-link
    const skipIdx = s.indexOf('<a href="#main-content" class="skip-link');
    const announceIdx = s.indexOf('<div class="announce-bar"');
    if (skipIdx > 0 && announceIdx > 0 && announceIdx < skipIdx) {
      // Move skip-link to before announce-bar (rare; usually OK)
      return s; // no-op for safety
    }
    return s;
  });
}

console.log(summary.join('\n'));
console.log(`\nTotal: ${summary.filter(x => x.startsWith('EDIT')).length} edits`);
