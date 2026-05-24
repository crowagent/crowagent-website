// One-shot helper: append M10 marketing dark-lock + defect fixes to styles.min.css
// Source of truth: the same block we wrote to styles.css ending at "DEF-M10-25".
const fs = require('fs');
const path = require('path');

const STYLES = path.resolve(__dirname, '..', 'styles.css');
const MIN = path.resolve(__dirname, '..', 'styles.min.css');

const css = fs.readFileSync(STYLES, 'utf8');
const marker = 'M10 MARKETING-PAGES DARK-LOCK';
const markerIdx = css.indexOf(marker);
// Go back to the opening "/* ..." of the comment block (find the most recent
// "/*" before this point — there will be one immediately above).
const start = css.lastIndexOf('/*', markerIdx);
if (start === -1) {
  console.error('M10 marker not found in styles.css');
  process.exit(1);
}
const m10Block = css.slice(start);
// Naive minify: collapse multi-space + remove comments + collapse newlines.
let mini = m10Block
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/\s*([{}:;,>+~])\s*/g, '$1')
  .replace(/;}/g, '}')
  .trim();
const min = fs.readFileSync(MIN, 'utf8');
// Idempotent: strip any prior M10 append (we marker on the f8-pricing selector
// list followed by the unique combo of 10 body classes).
const startSig = 'body.f8-pricing,body.f8-roadmap,body.f8-faq,body.f8-changelog,body.f8-resources,body.f8-products,body.f8-tools-index,body.f8-glossary,body.blog-index-page,body.f8-404{color-scheme:dark';
const idx = min.indexOf(startSig);
let next = min;
if (idx !== -1) {
  // Strip from idx to end.
  next = min.slice(0, idx);
}
next = next.replace(/\s+$/, '') + mini + '\n';
fs.writeFileSync(MIN, next);
console.log('M10 block appended to styles.min.css (idempotent).');
console.log('Length added:', mini.length, 'bytes');
