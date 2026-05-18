// SRI + external resource audit. For every <script src=https://...> and
// <link rel="stylesheet" href=https://...>, reports whether `integrity=` is present.
// Skips DNS-prefetch / preconnect / canonical / alternate / preload-without-stylesheet.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules','coverage','audit-results','audit-screenshots-final','debug-screenshots','tests','tmp'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile() && entry.name.endsWith('.html')) yield p;
  }
}

const rows = [];
const tagRe = /<(script|link)\b([^>]*)>/gi;

for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = tagRe.exec(html))) {
    const tag = m[1].toLowerCase();
    const attrs = m[2];
    // pull src or href
    const urlMatch = attrs.match(/\b(src|href)=["']([^"']+)["']/i);
    if (!urlMatch) continue;
    const url = urlMatch[2];
    if (!/^https?:\/\//i.test(url)) continue;
    // for <link> only check fetchable styles/script-like rels
    if (tag === 'link') {
      const relMatch = attrs.match(/\brel=["']([^"']+)["']/i);
      const rel = (relMatch ? relMatch[1] : '').toLowerCase();
      // skip non-fetched rels
      if (!/^(stylesheet|preload|modulepreload)$/.test(rel.split(/\s+/)[0])) continue;
      if (rel.startsWith('preload')) {
        const asMatch = attrs.match(/\bas=["']([^"']+)["']/i);
        const asV = asMatch ? asMatch[1].toLowerCase() : '';
        // only flag preload-as-style/script
        if (!['style','script','font'].includes(asV)) continue;
      }
    }
    const hasIntegrity = /\bintegrity=["'][^"']+["']/i.test(attrs);
    rows.push({ file: path.relative(ROOT, file), tag, url, hasIntegrity });
  }
}

// Group by URL
const byUrl = new Map();
for (const r of rows) {
  if (!byUrl.has(r.url)) byUrl.set(r.url, { count: 0, hasIntegrity: r.hasIntegrity, tag: r.tag, files: new Set() });
  const entry = byUrl.get(r.url);
  entry.count++;
  entry.files.add(r.file);
}

console.log('--- External-resource SRI audit ---');
console.log(`Total external <script>+<link> instances: ${rows.length}`);
const missing = rows.filter(r => !r.hasIntegrity);
console.log(`Missing integrity= attribute: ${missing.length}`);
console.log('');
console.log('Unique URLs:');
for (const [url, info] of byUrl) {
  console.log(`  ${info.hasIntegrity ? 'OK ' : '!! '} [${info.tag}] (${info.count} pages)  ${url}`);
}

console.log('\nGoogle Fonts usage (CSS file): ' +
  rows.filter(r => /fonts\.googleapis\.com/.test(r.url)).length);
console.log('Google Fonts usage (font files via gstatic): ' +
  rows.filter(r => /fonts\.gstatic\.com/.test(r.url)).length);
