// P-9 — Convert `style="--thumb-url:url('...');"` to `data-thumb-url="..."` attribute.
// JS at runtime reads the data-attr and sets the --thumb-url CSS custom property.
// This removes inline styles while preserving the dynamic URL injection pattern.
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
let total = 0;
for (const f of files) {
  let html = fs.readFileSync(f, 'utf8');
  let n = 0;
  // Match: style="--thumb-url:url('XYZ');" → data-thumb-url="XYZ"
  html = html.replace(/style="--thumb-url:url\(['"]?([^'")]+)['"]?\);?\s*"/g, (_, url) => {
    n++;
    return `data-thumb-url="${url}"`;
  });
  if (n > 0) {
    fs.writeFileSync(f, html);
    total += n;
    console.log(`  ${f}: -${n}`);
  }
}
console.log(`\nTotal converted: ${total} --thumb-url inline styles → data-thumb-url attributes.`);
