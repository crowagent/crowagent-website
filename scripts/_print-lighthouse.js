#!/usr/bin/env node
const fs = require('fs');
const file = process.argv[2];
const r = JSON.parse(fs.readFileSync(file, 'utf8'));
const a = r.audits;
const safe = (id) => a[id] ? `${a[id].displayValue || a[id].numericValue} (score ${a[id].score})` : 'n/a';
const out = {
  url: r.finalUrl,
  perfScore: r.categories.performance ? r.categories.performance.score * 100 : null,
  lcp: safe('largest-contentful-paint'),
  fcp: safe('first-contentful-paint'),
  tbt: safe('total-blocking-time'),
  cls: safe('cumulative-layout-shift'),
  si: safe('speed-index'),
  totalByteWeight: a['total-byte-weight'] && a['total-byte-weight'].displayValue,
  unusedJs: a['unused-javascript'] && a['unused-javascript'].displayValue,
  unusedCss: a['unused-css-rules'] && a['unused-css-rules'].displayValue,
  unusedJsBytes: a['unused-javascript'] && a['unused-javascript'].details && a['unused-javascript'].details.overallSavingsBytes,
  unusedCssBytes: a['unused-css-rules'] && a['unused-css-rules'].details && a['unused-css-rules'].details.overallSavingsBytes,
  modernFormatSavings: a['modern-image-formats'] && a['modern-image-formats'].displayValue,
  efficientImages: a['uses-optimized-images'] && a['uses-optimized-images'].displayValue,
  renderBlocking: a['render-blocking-resources'] && a['render-blocking-resources'].displayValue,
};
console.log(JSON.stringify(out, null, 2));
// also dump network requests > 50 KB grouped by type
const items = a['network-requests'] && a['network-requests'].details && a['network-requests'].details.items || [];
const heavy = items
  .filter((i) => i.transferSize > 50 * 1024)
  .sort((a, b) => b.transferSize - a.transferSize)
  .slice(0, 25)
  .map((i) => ({ kb: (i.transferSize / 1024).toFixed(1), type: i.resourceType, url: i.url.replace('http://localhost:8092', '') }));
console.log('\nHEAVY REQUESTS:');
heavy.forEach((h) => console.log(h.kb.padStart(8) + ' KB  [' + (h.type || '').padEnd(8) + '] ' + h.url));
