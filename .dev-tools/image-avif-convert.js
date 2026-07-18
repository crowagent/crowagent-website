// P-3 — Convert key marketing-screenshot PNGs to AVIF for ~70% size reduction.
// Generates .avif alongside the .png (HTML can use <picture> with both sources).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TARGETS = [
  'Assets/marketing-screenshots/01-dashboard-dark-framed.png',
  'Assets/marketing-screenshots/02-analysis-dark-framed.png',
  'Assets/marketing-screenshots/03-crowmark-dark-framed.png',
  'Assets/marketing-screenshots/04-csrd-checker-dark-framed.png',
  'Assets/marketing-screenshots/05-analytics-dark-framed.png',
];

(async () => {
  let totalOrig = 0;
  let totalAvif = 0;
  for (const src of TARGETS) {
    if (!fs.existsSync(src)) { console.log(`  SKIP missing: ${src}`); continue; }
    const dst = src.replace(/\.png$/, '.avif');
    const stat = fs.statSync(src);
    totalOrig += stat.size;
    try {
      await sharp(src).avif({ quality: 60, effort: 6 }).toFile(dst);
      const newStat = fs.statSync(dst);
      totalAvif += newStat.size;
      const reduction = (100 * (stat.size - newStat.size) / stat.size).toFixed(1);
      console.log(`  ${src}: ${(stat.size/1024).toFixed(0)}KB → ${(newStat.size/1024).toFixed(0)}KB (-${reduction}%)`);
    } catch (e) {
      console.log(`  ERROR ${src}: ${e.message}`);
    }
  }
  if (totalOrig > 0) {
    console.log(`\nTotal: ${(totalOrig/1024).toFixed(0)}KB → ${(totalAvif/1024).toFixed(0)}KB (-${(100*(totalOrig-totalAvif)/totalOrig).toFixed(1)}%)`);
  }
})();
