/**
 * SF-9 Product Strategy Reorder — 2026-05-17
 *
 * Reorders the 6 products in the products-bento section of index.html
 * per the CPO brief (SF9-CPO-PRODUCT-STRATEGY-2026-05-17.md):
 *
 *   New order:
 *   1. CrowCash   (NEW featured)
 *   2. CrowCyber
 *   3. CrowMark
 *   4. CSRD Checker
 *   5. CrowAgent Core (DEMOTED, no longer featured)
 *   6. CrowESG    (stays anchor-featured)
 *
 * Also flips pc--featured: removed from Core, added to Cash.
 * Adds anchor connective sentence between CrowMark and CSRD Checker.
 */
'use strict';
const fs = require('fs');

const file = 'index.html';
let h = fs.readFileSync(file, 'utf8');
const lines = h.split('\n');

const markers = ['CrowAgent Core', 'CrowCyber', 'CrowCash', 'CrowMark', 'CSRD Checker', 'CrowESG'];
const starts = {};
for (let i = 0; i < lines.length; i++) {
  for (const m of markers) {
    if (lines[i].includes('<!-- ' + m + ' ')) starts[m] = i;
  }
}
let bentoEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('/.products-bento')) { bentoEnd = i; break; }
}
if (Object.keys(starts).length !== 6 || bentoEnd === -1) {
  throw new Error('Could not find all 6 blocks or bento close. starts=' + JSON.stringify(starts) + ' bentoEnd=' + bentoEnd);
}

const sorted = markers.map((m) => ({ m, l: starts[m] })).sort((a, b) => a.l - b.l);
const blocks = {};
for (let i = 0; i < sorted.length; i++) {
  const s = sorted[i].l;
  const e = (i + 1 < sorted.length) ? sorted[i + 1].l - 1 : bentoEnd - 1;
  blocks[sorted[i].m] = lines.slice(s, e + 1).join('\n');
}

// Mutate Core: remove pc--featured baseline (no longer the front-load product)
blocks['CrowAgent Core'] = blocks['CrowAgent Core']
  .replace(/class="product-full-block pc--featured fade-in-up"/, 'class="product-full-block fade-in-up delay-5"');

// Mutate Cash: add pc--featured (top-of-bento featured slot)
blocks['CrowCash'] = blocks['CrowCash']
  .replace(/class="product-full-block fade-in-up delay-3"/, 'class="product-full-block pc--featured fade-in-up"');

// Mutate Cyber: bump to delay-2 (was already), make sure delay reflects new position
blocks['CrowCyber'] = blocks['CrowCyber']
  .replace(/class="product-full-block fade-in-up delay-2"/, 'class="product-full-block fade-in-up delay-2"');

// Mutate Mark: was delay-4, now should be delay-3 (third in new order)
blocks['CrowMark'] = blocks['CrowMark']
  .replace(/class="product-full-block fade-in-up delay-4"/, 'class="product-full-block fade-in-up delay-3"');

// Mutate CSRD: was delay-5, now delay-4
blocks['CSRD Checker'] = blocks['CSRD Checker']
  .replace(/class="product-full-block fade-in-up delay-5"/, 'class="product-full-block fade-in-up delay-4"');

// Mutate ESG: was delay-6, keep delay-6 (still last); keep pc--featured (anchor)
// No change needed for ESG class.

// Anchor connective sentence to insert BETWEEN CrowMark and CSRD Checker
const anchorSentence = `
    <!-- SF-9 2026-05-17 — Strategic anchor connective between quick-win row (Cash/Cyber/Mark)
         and strategic-anchor row (CSRD / Core / ESG). CPO brief recommendation. -->
    <div class="products-anchor-bridge">
      <p>Win this quarter's invoices, tenders and bids. Build the compliance spine that carries you through 2028 and beyond.</p>
    </div>
`;

// New order
const newOrder = ['CrowCash', 'CrowCyber', 'CrowMark', /*anchor here*/ 'CSRD Checker', 'CrowAgent Core', 'CrowESG'];
const before = lines.slice(0, sorted[0].l).join('\n');
const after  = lines.slice(bentoEnd).join('\n');

let middle = '';
for (let i = 0; i < newOrder.length; i++) {
  if (newOrder[i] === 'CSRD Checker') middle += anchorSentence;
  middle += blocks[newOrder[i]];
  if (i < newOrder.length - 1 && !blocks[newOrder[i]].endsWith('\n')) middle += '\n';
}

fs.writeFileSync(file, before + '\n' + middle + '\n' + after);
console.log('Reorder complete. New product order:', newOrder.join(' → '));
console.log('Anchor sentence inserted before CSRD Checker.');
