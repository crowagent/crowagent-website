/**
 * build-critical-css.js
 * Extracts above-fold CSS rules from main stylesheets for inline insertion.
 * Targets selectors that render before first scroll: html, body, nav,
 * .announce-bar, .ca-hero, .hero, .skip-link, #scroll-progress
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ASSETS_CSS = path.join(__dirname, '..', 'Assets', 'css');
const OUTPUT = path.join(ASSETS_CSS, 'critical.css');

// Main CSS files to scan for above-fold rules
const CSS_FILES = [
  'sovereign-core-v2.compiled.css',
  'nav-global-fix-2026-05-27.css',
  'fonts-selfhosted.css',
  'premium-gloss-2026-05-31.css',
  'ultra-premium-interactions.css'
];

// Selectors that appear above the fold
const ABOVE_FOLD_SELECTORS = [
  'html',
  'body',
  'nav',
  '.sv-nav',
  '.announce-bar',
  '.ca-hero',
  '.hero',
  '.skip-link',
  '#scroll-progress',
  ':root'
];

let extractedRules = [];
let totalExtracted = 0;

for (const file of CSS_FILES) {
  const filePath = path.join(ASSETS_CSS, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  [skip] ${file} (not found)`);
    continue;
  }

  const css = fs.readFileSync(filePath, 'utf8');
  const lines = css.split('\n');
  let fileRules = 0;

  // Simple brace-aware parser to extract matching rule blocks
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check if this line contains an above-fold selector
    const isAboveFold = ABOVE_FOLD_SELECTORS.some(function (sel) {
      return line.includes(sel);
    });

    if (isAboveFold && line.includes('{')) {
      // Collect the full rule block
      let braceCount = 0;
      let ruleBlock = '';
      let j = i;

      while (j < lines.length) {
        const currentLine = lines[j];
        ruleBlock += currentLine + '\n';
        braceCount += (currentLine.match(/\{/g) || []).length;
        braceCount -= (currentLine.match(/\}/g) || []).length;

        if (braceCount <= 0 && ruleBlock.trim().length > 0) {
          break;
        }
        j++;
      }

      extractedRules.push(ruleBlock.trim());
      fileRules++;
      i = j + 1;
    } else {
      i++;
    }
  }

  totalExtracted += fileRules;
  console.log(`  [done] ${file}: ${fileRules} rules extracted`);
}

// Deduplicate identical rules
const uniqueRules = [...new Set(extractedRules)];

const output = [
  '/* critical.css - Auto-generated above-fold styles */',
  '/* Generated: ' + new Date().toISOString().split('T')[0] + ' */',
  '/* Selectors: html, body, nav, .announce-bar, .ca-hero, .hero, .skip-link, #scroll-progress */',
  '',
  ...uniqueRules
].join('\n');

fs.writeFileSync(OUTPUT, output, 'utf8');

const stats = fs.statSync(OUTPUT);
console.log('\n--- Summary ---');
console.log(`  Total rules extracted: ${totalExtracted}`);
console.log(`  Unique rules written:  ${uniqueRules.length}`);
console.log(`  Output: ${OUTPUT}`);
console.log(`  Size: ${(stats.size / 1024).toFixed(2)} KB`);
