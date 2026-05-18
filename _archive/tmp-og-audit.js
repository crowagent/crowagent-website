// Quick OG + JSON-LD asset audit. Reads every .html file, extracts og:image,
// twitter:image, and JSON-LD "image" URLs, and checks they exist on disk
// relative to the project root.
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE_ORIGIN = 'https://crowagent.ai';

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'coverage' ||
        entry.name === 'audit-results' || entry.name === 'audit-screenshots-final' ||
        entry.name === 'debug-screenshots' || entry.name === 'tests' || entry.name === 'tmp') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (entry.isFile() && entry.name.endsWith('.html')) yield p;
  }
}

function urlToFsPath(url) {
  if (!url) return null;
  // strip origin
  let rel = url;
  if (rel.startsWith(SITE_ORIGIN)) rel = rel.slice(SITE_ORIGIN.length);
  if (rel.startsWith('http://') || rel.startsWith('https://')) return null; // external
  if (rel.startsWith('//')) return null;
  if (rel.startsWith('/')) rel = rel.slice(1);
  // strip query/fragment
  rel = rel.split('?')[0].split('#')[0];
  // decode URI escapes (e.g. %20 -> space)
  try { rel = decodeURIComponent(rel); } catch (e) { /* keep raw */ }
  return path.join(ROOT, rel);
}

const ogResults = [];
const ldResults = [];

for (const file of walk(ROOT)) {
  const html = fs.readFileSync(file, 'utf8');
  // og:image + twitter:image
  const metaRe = /<meta\s+(?:property|name)=["'](og:image|twitter:image)["']\s+content=["']([^"']+)["']/gi;
  let m;
  while ((m = metaRe.exec(html))) {
    const tag = m[1];
    const url = m[2];
    const fsPath = urlToFsPath(url);
    const exists = fsPath ? fs.existsSync(fsPath) : 'external/skip';
    ogResults.push({ file: path.relative(ROOT, file), tag, url, fsPath: fsPath ? path.relative(ROOT, fsPath) : null, exists });
  }
  // JSON-LD blocks
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ld;
  while ((ld = ldRe.exec(html))) {
    const raw = ld[1].trim();
    let parsed;
    try { parsed = JSON.parse(raw); } catch (e) {
      ldResults.push({ file: path.relative(ROOT, file), parseError: e.message.slice(0, 120) });
      continue;
    }
    const urls = new Set();
    function collect(node) {
      if (!node) return;
      if (typeof node === 'string') return;
      if (Array.isArray(node)) { node.forEach(collect); return; }
      if (typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
          if ((k === 'image' || k === 'thumbnailUrl' || k === 'logo' || k === 'contentUrl') && typeof v === 'string') urls.add(v);
          else if ((k === 'image' || k === 'thumbnailUrl' || k === 'logo' || k === 'contentUrl') && typeof v === 'object' && v && typeof v.url === 'string') urls.add(v.url);
          else if ((k === 'image' || k === 'thumbnailUrl' || k === 'logo' || k === 'contentUrl') && Array.isArray(v)) v.forEach(item => {
            if (typeof item === 'string') urls.add(item);
            else if (item && typeof item.url === 'string') urls.add(item.url);
          });
          else collect(v);
        }
      }
    }
    collect(parsed);
    for (const url of urls) {
      const fsPath = urlToFsPath(url);
      const exists = fsPath ? fs.existsSync(fsPath) : 'external/skip';
      ldResults.push({ file: path.relative(ROOT, file), url, fsPath: fsPath ? path.relative(ROOT, fsPath) : null, exists });
    }
  }
}

const ogBroken = ogResults.filter(r => r.exists === false);
const ldBroken = ldResults.filter(r => r.exists === false);

console.log('--- OG/Twitter image audit ---');
console.log(`Total og/twitter:image refs: ${ogResults.length}`);
console.log(`Broken (file missing): ${ogBroken.length}`);
for (const b of ogBroken) console.log(`  MISSING [${b.tag}] ${b.file} -> ${b.url} (expected ${b.fsPath})`);

console.log('\n--- JSON-LD image audit ---');
console.log(`Total JSON-LD image-like refs: ${ldResults.length}`);
console.log(`Broken (file missing): ${ldBroken.length}`);
for (const b of ldBroken) console.log(`  MISSING ${b.file} -> ${b.url} (expected ${b.fsPath})`);

const ldParseErrors = ldResults.filter(r => r.parseError);
if (ldParseErrors.length) {
  console.log('\n--- JSON-LD parse errors ---');
  for (const e of ldParseErrors) console.log(`  PARSE ${e.file}: ${e.parseError}`);
}

// Unique extensions referenced
const exts = new Set(ogResults.map(r => path.extname(r.url)));
console.log('\nUnique og:image extensions:', [...exts]);
