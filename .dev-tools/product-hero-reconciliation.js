#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/product-hero-reconciliation.js
   PH3.2 (2026-05-20) — Standardize the 6 product page heroes to the
   "Software-as-Hero" Stripe/Apple archetype using real CrowAgent product
   PNGs from /Assets/marketing-screenshots/ wrapped in the sovereign
   .sv-media-frame--cinematic primitive.

   For each product page:
     1. Find the placeholder `.hero-demo-slot` (or pre-existing demo block).
     2. Replace it with a `.sv-media-frame.sv-media-frame--cinematic.hero-visual`
        containing the product-specific real PNG.
     3. Leave the surrounding hero (h1, sub, CTA row, trust chips, countdown)
        intact — the sv-stack--align-center wrap already exists on
        .hero-content from earlier reconciliation.

   Product → PNG mapping (real Assets/marketing-screenshots/*.png):
     crowcyber       →  app.crowagent.ai_crowcyber.png
     crowmark        →  app.crowagent.ai_ppn002_social_cal.png    (PPN 002 = CrowMark)
     crowcash        →  app.crowagent.ai_crowcash.png
     crowesg         →  app.crowagent.ai_crowagentcore_analytics.png  (ESG analytics proxy — Q3 2026 product, real-product mockup pending)
     csrd            →  04-csrd-checker-dark-framed.png            (existing framed CSRD checker)

   Idempotent — re-running produces no further changes after the first
   apply.

   Modes:
     node tools/product-hero-reconciliation.js              (dry-run)
     node tools/product-hero-reconciliation.js --apply
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const PRODUCTS = [
  { file: 'crowcyber.html',      product: 'crowcyber',      png: 'app.crowagent.ai_crowcyber.png',               alt: 'CrowCyber dashboard — Cyber Essentials v3.3 (Danzell) readiness across the five controls'},
  { file: 'crowmark.html',       product: 'crowmark',       png: 'app.crowagent.ai_ppn002_social_cal.png',       alt: 'CrowMark PPN 002 social-value calculator — five themes scored against the bid weighting'},
  { file: 'crowcash.html',       product: 'crowcash',       png: 'app.crowagent.ai_crowcash.png',                alt: 'CrowCash dashboard — late-payment recovery pipeline with statutory-interest calculations'},
  { file: 'crowesg.html',        product: 'crowesg',        png: 'app.crowagent.ai_crowagentcore_analytics.png', alt: 'CrowESG analytics preview — multi-framework ESG reporting (Q3 2026 launch)'},
  { file: 'csrd.html',           product: 'csrd',           png: '04-csrd-checker-dark-framed.png',              alt: 'CSRD Checker — Omnibus I applicability test with employee + turnover thresholds'},
];

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }

function readFile(p) { return fs.readFileSync(p, 'utf8'); }
function writeFile(p, s) { fs.writeFileSync(p, s); }

// Find the .hero-demo-slot block and replace it with a sovereign media frame.
// The placeholder pattern is multi-line; we anchor on the opening div tag
// and balance the closing </div> by walking depth.
function buildMediaFrame(png, alt, product) {
  return (
    '<figure class="sv-media-frame sv-media-frame--cinematic hero-visual" role="img" aria-label="' + alt.replace(/"/g, '&quot;') + '">\n' +
    '          <img src="/Assets/marketing-screenshots/' + png + '"\n' +
    '               alt="' + alt.replace(/"/g, '&quot;') + '"\n' +
    '               width="2400" height="1500"\n' +
    '               loading="eager" decoding="async" fetchpriority="high"\n' +
    '               data-product="' + product + '">\n' +
    '        </figure>'
  );
}

function replaceHeroDemoSlot(html, png, alt, product) {
  // Path A — replace existing .hero-demo-slot placeholder
  const startRe = /<div\s+class="hero-demo-slot[^"]*"[^>]*>/;
  const m = html.match(startRe);
  if (m) {
    const startIdx = m.index;
    let depth = 0, endIdx = -1;
    const tagRe = /<(\/?)div\b[^>]*>/g;
    tagRe.lastIndex = startIdx;
    let tagMatch;
    while ((tagMatch = tagRe.exec(html))) {
      if (tagMatch[1] === '/') depth--; else depth++;
      if (depth === 0) { endIdx = tagMatch.index + tagMatch[0].length; break; }
    }
    if (endIdx !== -1) {
      return { html: html.slice(0, startIdx) + buildMediaFrame(png, alt, product) + html.slice(endIdx), replaced: true, mode: 'replace-demo-slot' };
    }
  }

  // Path B — no demo slot. Insert AFTER the closing tag of .trust-chip-band
  // which every product hero has. This places the .sv-media-frame after
  // CTAs + trust chips, matching the spec ordering exactly.
  const trustChipBlock = /<div\s+class="trust-chip-band[^"]*"[^>]*>[\s\S]*?<\/div>/;
  const t = html.match(trustChipBlock);
  if (t) {
    const insertAt = t.index + t[0].length;
    const injection = '\n        ' + buildMediaFrame(png, alt, product);
    return { html: html.slice(0, insertAt) + injection + html.slice(insertAt), replaced: true, mode: 'insert-after-trust-chips' };
  }

  return { html, replaced: false, reason: 'no .hero-demo-slot AND no .trust-chip-band anchor' };
}

// Idempotency check — has this page already been migrated?
function alreadyHasFrame(html) {
  return /class="sv-media-frame sv-media-frame--cinematic hero-visual"/.test(html);
}

const stats = { scanned: 0, mutated: 0, alreadyDone: 0, errors: [] };
const samples = [];

for (const entry of PRODUCTS) {
  const file = path.join(ROOT, entry.file);
  let html;
  try { html = readFile(file); }
  catch (e) { stats.errors.push({ file: entry.file, err: e.message }); continue; }
  stats.scanned++;

  if (alreadyHasFrame(html)) {
    stats.alreadyDone++;
    samples.push({ file: entry.file, status: 'idempotent — frame already present' });
    continue;
  }

  const result = replaceHeroDemoSlot(html, entry.png, entry.alt, entry.product);
  if (!result.replaced) {
    stats.errors.push({ file: entry.file, err: result.reason });
    continue;
  }

  if (APPLY) writeFile(file, result.html);
  stats.mutated++;
  samples.push({ file: entry.file, status: '✓ injected', png: entry.png });
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  PRODUCT HERO RECONCILIATION — ' + (APPLY ? 'APPLY' : 'DRY RUN'));
console.log('═══════════════════════════════════════════════════════════════');
console.log('Pages scanned:        ' + stats.scanned);
console.log('Pages mutated:        ' + stats.mutated);
console.log('Pages already done:   ' + stats.alreadyDone);
console.log('Errors:               ' + stats.errors.length);
console.log('');
if (samples.length) {
  console.log('Per-page status:');
  for (const s of samples) console.log('  ' + s.file.padEnd(24) + s.status + (s.png ? '  →  ' + s.png : ''));
}
if (stats.errors.length) {
  console.log('\nErrors:');
  for (const e of stats.errors) console.log('  ' + e.file + ': ' + e.err);
}
if (!APPLY) console.log('\nDRY RUN — re-run with --apply to write changes.');
process.exit(stats.errors.length ? 1 : 0);
