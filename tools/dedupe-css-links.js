// P-7 partial — Dedupe consecutive duplicate <link rel="stylesheet"> tags.
// Per-page audit showed every HTML has 2x <link href="/styles.min.css?v=99">.
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules','coverage','playwright-report','tests','test-results','.git','_archive'].includes(f)) continue;
      walk(full, out);
    } else if (f.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk('.');
let totalFixed = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  // Match identical <link rel="stylesheet" href="..."> lines, dedupe
  const seen = new Set();
  const lines = html.split('\n');
  const out = [];
  let dedupedThisFile = 0;
  for (const line of lines) {
    const m = line.match(/<link\s+rel="stylesheet"\s+href="([^"]+)"[^>]*>/);
    if (m) {
      const key = m[1].split('?')[0];  // dedupe on path only (ignore ?v=N)
      if (seen.has(key)) {
        dedupedThisFile++;
        continue;  // skip duplicate
      }
      seen.add(key);
    }
    out.push(line);
  }
  if (dedupedThisFile > 0) {
    fs.writeFileSync(f, out.join('\n'));
    totalFixed += dedupedThisFile;
    console.log(`  ${f}: -${dedupedThisFile} dupe link(s)`);
  }
}
console.log(`\nTotal duplicate <link> tags removed: ${totalFixed}`);
