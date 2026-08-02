/**
 * build-sitemap.js — emit sitemap.xml from what was ACTUALLY built.
 *
 * WHY NOT @astrojs/sitemap, AND WHY NOT A HAND-WRITTEN LIST.
 *
 * A hand-maintained sitemap rots: the legacy one lists 42 URLs, and five of the
 * tools it advertised were withdrawn on 2026-07-28. This walks dist/ instead, so
 * it lists exactly the pages that exist — a withdrawn page cannot linger and a
 * new page cannot be forgotten.
 *
 * It reads each page's OWN <link rel="canonical"> rather than constructing a URL
 * from the file path. That makes sitemap and canonical the same string by
 * construction. Where they disagree, search engines have to guess which one the
 * site means, and the legacy sitemap's mixed trailing slashes (7 of 42 with, 35
 * without) is exactly the kind of drift that produces that guess.
 *
 * NO lastmod, changefreq OR priority, deliberately:
 *   - `changefreq` and `priority` are ignored by Google outright.
 *   - `lastmod` stamped at build time would claim every page changed today,
 *     every deploy. A lastmod that is always "now" is worse than absent: it is
 *     a signal that is actively wrong, and it teaches a crawler to ignore it.
 * If real per-page modification dates become available, they belong here — but
 * from git history or frontmatter, not from Date.now().
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The package is "type": "module", so __dirname does not exist.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');

/** Every built page, as absolute file paths. */
function pages(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(pages(full));
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

const CANONICAL = /<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i;

function canonicalOf(file) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(CANONICAL);
  return m ? m[1] : null;
}

const files = pages(DIST).sort();
const urls = [];
const missing = [];

for (const file of files) {
  const url = canonicalOf(file);
  if (url) urls.push(url);
  else missing.push(path.relative(DIST, file));
}

/*
 * A page with no canonical is a defect, not something to paper over by
 * synthesising a URL from its path. Fail loudly: a silently-omitted page is a
 * page that never gets indexed.
 */
if (missing.length) {
  console.error(`sitemap: ${missing.length} page(s) have no canonical link:`);
  missing.forEach((m) => console.error(`  ${m}`));
  process.exit(1);
}

const unique = [...new Set(urls)].sort();
if (unique.length !== urls.length) {
  console.error(`sitemap: ${urls.length - unique.length} duplicate canonical URL(s) — two pages claim the same address`);
  process.exit(1);
}

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  unique.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
  '\n</urlset>\n';

fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap: ${unique.length} URLs written from ${files.length} built pages`);
