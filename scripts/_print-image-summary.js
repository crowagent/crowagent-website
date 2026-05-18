#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const audit = path.join(ROOT, 'audit-results', '_image-audit-raw.json');

// Re-run the audit if not present
if (!fs.existsSync(audit)) {
  const out = require('child_process').execSync('node "' + path.join(__dirname, 'audit-images.js') + '"').toString();
  fs.writeFileSync(audit, out);
}
const recs = JSON.parse(fs.readFileSync(audit, 'utf8'));
console.log('TOTAL RECORDS:', recs.length);
console.log('TOTAL BYTES:', recs.reduce((a, r) => a + r.bytes, 0));
console.log();
console.log('TOP 50 LARGEST:');
recs.slice(0, 50).forEach((r) => {
  const kb = (r.bytes / 1024).toFixed(1).padStart(8);
  const flags = [r.hasWebp ? '' : ' (no webp)', r.hasAvif ? '' : ' (no avif)'].join('');
  const usage = r.refs.length ? 'refs:' + r.refs.length : 'ORPHAN';
  console.log(kb + ' KB  ' + r.path + ' [' + usage + ']' + flags);
});
console.log();
console.log('ORPHANS (top 30):');
const orphans = recs.filter((r) => r.refs.length === 0);
orphans.slice(0, 30).forEach((r) => console.log('  ' + (r.bytes / 1024).toFixed(1).padStart(8) + ' KB  ' + r.path));
console.log('Orphan total:', orphans.length, '=>', orphans.reduce((a, r) => a + r.bytes, 0), 'bytes');
console.log();
console.log('MISSING WEBP COMPANIONS (jpg/png > 50KB):');
recs
  .filter((r) => (r.ext === '.jpg' || r.ext === '.jpeg' || r.ext === '.png') && r.bytes > 50 * 1024 && !r.hasWebp)
  .forEach((r) => console.log('  ' + (r.bytes / 1024).toFixed(1).padStart(8) + ' KB  ' + r.path));
console.log();
console.log('MISSING AVIF COMPANIONS (jpg/png > 100KB):');
recs
  .filter((r) => (r.ext === '.jpg' || r.ext === '.jpeg' || r.ext === '.png') && r.bytes > 100 * 1024 && !r.hasAvif)
  .forEach((r) => console.log('  ' + (r.bytes / 1024).toFixed(1).padStart(8) + ' KB  ' + r.path));
