/**
 * SF-9 part 2: reorder frameworks grid + sectors grid + update product headlines.
 * All per the CPO brief SF9-CPO-PRODUCT-STRATEGY-2026-05-17.md.
 */
'use strict';
const fs = require('fs');
const file = 'index.html';
let h = fs.readFileSync(file, 'utf8');

// ─── (A) Frameworks grid reorder ──────────────────────────────────────────
// New order per CPO velocity: Late Payment → Cyber Essentials → PPN 002 → CSRD → MEES → VSME
// Each block is <li class="framework-card framework-card--X">...</li>
// Use modifier classes to locate: --teal (MEES), --mark (PPN 002), --sky (Cyber), --lime (Late Payment), --csrd (CSRD), --warn (VSME)

function extractFrameworkBlock(html, modifier) {
  const open = '<li class="framework-card framework-card--' + modifier + '"';
  const start = html.indexOf(open);
  if (start === -1) throw new Error('Framework block not found: ' + modifier);
  // Find matching </li> at same nesting
  let depth = 1;
  let i = html.indexOf('>', start) + 1;
  while (i < html.length && depth > 0) {
    const nextOpen = html.indexOf('<li', i);
    const nextClose = html.indexOf('</li>', i);
    if (nextClose === -1) throw new Error('Unclosed framework li');
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + 1;
    } else {
      depth--;
      i = nextClose + 5;
    }
  }
  return { start, end: i, html: html.slice(start, i) };
}

const fwModifiers = ['teal', 'mark', 'sky', 'lime', 'csrd', 'warn']; // MEES, PPN002, Cyber, Late, CSRD, VSME (current order)
const fwBlocks = {};
for (const m of fwModifiers) {
  fwBlocks[m] = extractFrameworkBlock(h, m).html;
}

// New order: lime (Late Payment) → sky (Cyber Essentials) → mark (PPN 002) → csrd (CSRD) → teal (MEES) → warn (VSME)
const newFwOrder = ['lime', 'sky', 'mark', 'csrd', 'teal', 'warn'];

// Locate the whole <ul class="frameworks-grid"> block
const ulStart = h.indexOf('<ul class="frameworks-grid"');
const ulEnd = h.indexOf('</ul>', ulStart) + 5;
const ulHead = h.slice(ulStart, h.indexOf('>', ulStart) + 1) + '\n';
const ulTail = '\n    </ul>';
const newUl = ulHead + newFwOrder.map((m) => '      ' + fwBlocks[m].replace(/\n      /g, '\n      ')).join('\n      ') + ulTail;

h = h.slice(0, ulStart) + newUl + h.slice(ulEnd);

// ─── (B) Sectors grid reorder ─────────────────────────────────────────────
// New order: SME Finance, Public-sector suppliers, Cyber Essentials, VSME, CSRD-scope, Commercial Landlords, Local councils, Housing
// Map by comment markers since each sector has a comment above
const sectorMarkers = [
  '1. Commercial landlords',
  '2. UK SMEs preparing for Cyber Essentials',
  '3. UK SME finance teams',
  '4. Public-sector suppliers',
  '5. CSRD-scope companies',
  '6. VSME-eligible SMEs',
  '7. Local councils',
  '8. Housing associations',
];

// Extract each sector div based on comment
function extractSectorBlock(html, commentNeedle) {
  const commentStart = html.indexOf('<!-- ' + commentNeedle);
  if (commentStart === -1) throw new Error('Sector comment not found: ' + commentNeedle);
  // The block is the comment plus the <div class="sector reveal ..."> ... </div>
  const divStart = html.indexOf('<div class="sector reveal', commentStart);
  if (divStart === -1) throw new Error('Sector div not found after comment: ' + commentNeedle);
  // Find matching close
  let depth = 1;
  let i = html.indexOf('>', divStart) + 1;
  while (i < html.length && depth > 0) {
    const o = html.indexOf('<div', i);
    const c = html.indexOf('</div>', i);
    if (c === -1) throw new Error('Unclosed sector div: ' + commentNeedle);
    if (o !== -1 && o < c) { depth++; i = o + 1; } else { depth--; i = c + 6; }
  }
  return html.slice(commentStart, i);
}

const sectorBlocks = sectorMarkers.map((m) => ({ marker: m, html: extractSectorBlock(h, m) }));

// New order matches CPO brief
const newSectorOrder = [
  '3. UK SME finance teams',
  '4. Public-sector suppliers',
  '2. UK SMEs preparing for Cyber Essentials',
  '6. VSME-eligible SMEs',
  '5. CSRD-scope companies',
  '1. Commercial landlords',
  '7. Local councils',
  '8. Housing associations',
];

const newSectorBlocks = newSectorOrder.map((needle) => {
  const found = sectorBlocks.find((b) => b.marker === needle);
  if (!found) throw new Error('Sector lookup failed: ' + needle);
  return found.html;
});

// Replace the entire sector-grid contents
const sgStart = h.indexOf('<div class="sector-grid" id="f10-sector-grid">');
const sgEnd   = h.indexOf('</div>', sgStart);
// Find the END of the OPENING tag
const sgOpenEnd = h.indexOf('>', sgStart) + 1;
// Then need to find the MATCHING </div> for this grid, which is the one before </div></section>
// Easier: replace all blocks between sgOpenEnd and the line "    </div>" right before "  </div>\n</section>"
// Find the closing </div> of the sector-grid (it's a child of .wrap and the <section>)
// Look for the pattern: just find FIRST occurrence of '\n    </div>\n  </div>\n</section>' after sgOpenEnd
// Find sector-grid close: regex-match the </div>\n</div>\n</section> pattern
const tail = h.slice(sgOpenEnd);
const closeMatch = tail.match(/\n\s*<\/div>\s*\n\s*<\/div>\s*\n<\/section>/);
if (!closeMatch) throw new Error('Could not find sector-grid close pattern');
const closeIdx = sgOpenEnd + closeMatch.index;

const newSectorGridInner = '\n\n      ' + newSectorBlocks.join('\n\n      ') + '\n\n    ';
h = h.slice(0, sgOpenEnd) + newSectorGridInner + h.slice(closeIdx);

fs.writeFileSync(file, h);
console.log('Frameworks new order:', newFwOrder.join(' → '));
console.log('Sectors new order:');
newSectorOrder.forEach((s, i) => console.log('  ' + (i + 1) + '. ' + s));
