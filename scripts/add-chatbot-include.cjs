#!/usr/bin/env node
// Add explicit `<script src="/chatbot.js?v=92" defer></script>` to the
// 7 pages flagged by Agent 3 (JS) where nav-inject's safety-net include
// is the only path. Idempotent: skip if chatbot.js is already referenced.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
  'blog/index.html',
  'tools/csrd-applicability-checker/index.html',
  'tools/cyber-essentials-readiness/index.html',
  'tools/late-payment-calculator/index.html',
  'tools/mees-risk-snapshot/index.html',
  'tools/ppn-002-calculator/index.html',
  'tools/vsme-materiality-light/index.html',
];
const INSERT = '<script src="/chatbot.js?v=92" defer></script>';
const COOKIE_BANNER_RE = /(<script src="\/cookie-banner\.js"[^>]*><\/script>)/;

let touched = 0;
for (const rel of TARGETS) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    process.stdout.write(`MISS  ${rel}\n`);
    continue;
  }
  const src = fs.readFileSync(full, 'utf8');
  if (/<script[^>]*src=["']\/chatbot\.js/.test(src)) {
    process.stdout.write(`OK    ${rel} (already includes chatbot.js)\n`);
    continue;
  }
  const m = COOKIE_BANNER_RE.exec(src);
  if (!m) {
    process.stdout.write(`SKIP  ${rel} (no cookie-banner.js anchor)\n`);
    continue;
  }
  const next = src.slice(0, m.index + m[0].length) + '\n' + INSERT + src.slice(m.index + m[0].length);
  fs.writeFileSync(full, next);
  touched++;
  process.stdout.write(`ADD   ${rel}\n`);
}
console.log(`---\nTouched: ${touched} / ${TARGETS.length}`);
