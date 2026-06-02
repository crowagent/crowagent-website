#!/usr/bin/env node
// Image-weight audit helper. Read-only.
// Walks Assets/photos, Assets/og, Assets/screenshots and Assets/svg-mockups, Assets/brand
// Cross-references with HTML usage and identifies oversize / missing companions / orphans.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIRS = [
  'Assets/photos',
  'Assets/og',
  'Assets/screenshots',
  'Assets/svg-mockups',
  'Assets/brand',
];

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function listHtmlFiles(root) {
  const out = [];
  function rec(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '_archive' || entry.name === 'coverage' || entry.name === 'test-results' || entry.name === 'debug-screenshots' || entry.name === 'audit-screenshots-final') continue;
      const p = path.join(d, entry.name);
      if (entry.isDirectory()) rec(p);
      else if (entry.name.endsWith('.html')) out.push(p);
    }
  }
  rec(root);
  return out;
}

// Build HTML content cache and CSS content cache for references
const htmlFiles = listHtmlFiles(ROOT);
const htmlCorpus = htmlFiles.map((f) => ({ f, text: fs.readFileSync(f, 'utf8') }));

const cssFiles = [];
function findCss(d) {
  if (!fs.existsSync(d)) return;
  for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '_archive') continue;
    const p = path.join(d, entry.name);
    if (entry.isDirectory()) findCss(p);
    else if (entry.name.endsWith('.css')) cssFiles.push(p);
  }
}
findCss(ROOT);
const cssCorpus = cssFiles.map((f) => ({ f, text: fs.readFileSync(f, 'utf8') }));
const jsFiles = ['scripts.js', 'scripts.min.js', 'cookie-banner.js', 'chatbot.js', 'service-worker.js'].filter((f) => fs.existsSync(path.join(ROOT, f)));
const jsCorpus = jsFiles.map((f) => ({ f, text: fs.readFileSync(path.join(ROOT, f), 'utf8') }));

const records = [];
for (const d of DIRS) {
  const root = path.join(ROOT, d);
  for (const f of walk(root)) {
    const ext = path.extname(f).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'].includes(ext)) continue;
    const rel = path.relative(ROOT, f).split(path.sep).join('/');
    const base = path.basename(f, ext);
    const dir = path.dirname(f);
    const sz = fs.statSync(f).size;

    // Search for any reference to either the filename or relative path
    const fname = path.basename(f);
    const refs = [];
    for (const { f: file, text } of htmlCorpus) {
      if (text.includes(fname) || text.includes(rel)) refs.push(path.relative(ROOT, file).split(path.sep).join('/'));
    }
    for (const { f: file, text } of cssCorpus) {
      if (text.includes(fname) || text.includes(rel)) refs.push('CSS:' + path.relative(ROOT, file).split(path.sep).join('/'));
    }
    for (const { f: file, text } of jsCorpus) {
      if (text.includes(fname) || text.includes(rel)) refs.push('JS:' + path.relative(ROOT, file).split(path.sep).join('/'));
    }

    // WebP / AVIF companion logic:
    let hasWebp = false, hasAvif = false;
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      // Same-dir companion
      hasWebp = fs.existsSync(path.join(dir, base + '.webp'));
      hasAvif = fs.existsSync(path.join(dir, base + '.avif'));
      // Or sibling avif/ webp/ subdir
      if (!hasWebp) hasWebp = fs.existsSync(path.join(dir, 'webp', base + '.webp'));
      if (!hasAvif) hasAvif = fs.existsSync(path.join(dir, 'avif', base + '.avif'));
    }

    records.push({ path: rel, ext, bytes: sz, refs, hasWebp, hasAvif });
  }
}

records.sort((a, b) => b.bytes - a.bytes);
process.stdout.write(JSON.stringify(records, null, 2));
