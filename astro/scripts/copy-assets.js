/**
 * copy-assets.js — bring the referenced legacy assets into the Astro build.
 *
 * THE DEFECT THIS FIXES. `Assets/` lives at the repository root, outside the
 * Astro project, so nothing under `/Assets/...` was ever included in
 * `astro/dist`. Every image on the new site 404'd — 12 of them across 11 routes,
 * including the product screenshots on /crowmark, all four /compare pages and
 * all five /sectors pages.
 *
 * It survived an audit that checked all 37 routes because that audit asked
 * whether each <img> had an `alt`, not whether it LOADED. An accessible
 * description of an image that never arrives is still nothing on the screen.
 * The check now lives in this script, where it fails the build.
 *
 * WHY COPY REFERENCED FILES RATHER THAN THE WHOLE DIRECTORY. `Assets/` holds far
 * more than this site uses, including product shots of withdrawn products. The
 * legacy build already learned this: it found 161 unreferenced assets totalling
 * 15.3 MB in its own output, among them 60 screenshots of products the site no
 * longer sells and which anyone could still fetch by URL. Copying only what is
 * referenced means a withdrawn asset cannot ride along.
 *
 * IT FAILS THE BUILD ON A MISSING REFERENCE. A broken image that merely warns is
 * a broken image that ships. This is the same contract the sitemap generator
 * uses for canonicals.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const REPO_ROOT = path.join(__dirname, '..', '..');

/** Every built HTML and CSS file — both can reference an asset. */
function textFiles(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out = out.concat(textFiles(full));
    else if (/\.(html|css)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Matches /Assets/... in src, href, srcset and CSS url(). srcset holds several
 * comma-separated candidates, so a global match over the whole file is simpler
 * and safer than trying to parse each attribute form.
 */
const ASSET_REF = /\/Assets\/[A-Za-z0-9._\-/%]+/g;

const referenced = new Set();
for (const file of textFiles(DIST)) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.match(ASSET_REF) ?? []) {
    // Strip any cache-busting query the reference carried.
    referenced.add(decodeURIComponent(match.split('?')[0]));
  }
}

const missing = [];
let copied = 0;
let bytes = 0;

for (const ref of [...referenced].sort()) {
  const source = path.join(REPO_ROOT, ref.replace(/^\//, ''));
  if (!fs.existsSync(source)) {
    missing.push(ref);
    continue;
  }
  const target = path.join(DIST, ref.replace(/^\//, ''));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  copied++;
  bytes += fs.statSync(source).size;
}

if (missing.length) {
  console.error(`assets: ${missing.length} referenced asset(s) do not exist:`);
  missing.forEach((m) => console.error(`  ${m}`));
  console.error('A referenced asset that is absent is a broken image on a shipped page.');
  process.exit(1);
}

console.log(
  `assets: ${copied} referenced file(s) copied into dist (${Math.round(bytes / 1024)} KB)`
);
