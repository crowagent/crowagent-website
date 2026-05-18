#!/usr/bin/env node
// Read intrinsic dimensions of the top-N image files.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

(async () => {
  const recsPath = path.join(__dirname, '..', 'audit-results', '_image-audit-raw.json');
  const recs = JSON.parse(fs.readFileSync(recsPath, 'utf8'));
  const top = recs.filter((r) => r.ext !== '.svg').slice(0, 60);
  const dims = [];
  for (const r of top) {
    try {
      const meta = await sharp(path.join(__dirname, '..', r.path)).metadata();
      dims.push({ path: r.path, bytes: r.bytes, ext: r.ext, w: meta.width, h: meta.height, format: meta.format });
    } catch (e) {
      dims.push({ path: r.path, bytes: r.bytes, ext: r.ext, error: e.message });
    }
  }
  for (const d of dims) {
    const kb = (d.bytes / 1024).toFixed(0).padStart(6);
    if (d.error) console.log(kb + ' KB  ERR ' + d.error + '  ' + d.path);
    else console.log(kb + ' KB  ' + (d.w + 'x' + d.h).padEnd(11) + ' [' + d.format + '] ' + d.path);
  }
})();
