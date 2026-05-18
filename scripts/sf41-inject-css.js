#!/usr/bin/env node
/**
 * SF41 — Inject consistency-sf41.css link into every HTML page that loads
 * styles.min.css. Insertion goes AFTER the styles.min.css preload/stylesheet
 * line(s) and BEFORE nav-footer-sf21.css (when present).
 *
 * Idempotent: skips files already containing 'consistency-sf41.css'.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TAG = '<link rel="stylesheet" href="/Assets/css/consistency-sf41.css?v=98">';
const MARKER = 'consistency-sf41.css';

// Collect target HTML files.
function collect() {
  const targets = [];
  // Root *.html
  for (const f of fs.readdirSync(ROOT)) {
    if (f.endsWith('.html')) targets.push(path.join(ROOT, f));
  }
  // /products/index.html
  const productsIndex = path.join(ROOT, 'products', 'index.html');
  if (fs.existsSync(productsIndex)) targets.push(productsIndex);
  // /tools/*/index.html + /tools/index.html
  const toolsDir = path.join(ROOT, 'tools');
  if (fs.existsSync(toolsDir)) {
    for (const entry of fs.readdirSync(toolsDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const sub = path.join(toolsDir, entry.name, 'index.html');
        if (fs.existsSync(sub)) targets.push(sub);
      } else if (entry.isFile() && entry.name === 'index.html') {
        targets.push(path.join(toolsDir, entry.name));
      }
    }
  }
  // /blog/*.html
  const blogDir = path.join(ROOT, 'blog');
  if (fs.existsSync(blogDir)) {
    for (const f of fs.readdirSync(blogDir)) {
      if (f.endsWith('.html')) targets.push(path.join(blogDir, f));
    }
  }
  // /glossary/*.html
  const glossaryDir = path.join(ROOT, 'glossary');
  if (fs.existsSync(glossaryDir)) {
    for (const f of fs.readdirSync(glossaryDir)) {
      if (f.endsWith('.html')) targets.push(path.join(glossaryDir, f));
    }
  }
  return targets;
}

function inject(file) {
  const orig = fs.readFileSync(file, 'utf8');
  if (orig.includes(MARKER)) return { file, status: 'skip-already-present' };
  if (!orig.includes('styles.min.css')) return { file, status: 'skip-no-styles-min' };

  // Find the last styles.min.css reference (preload+noscript pair → noscript line).
  // Anchor on the literal line we want to insert AFTER.
  // We try three anchors in priority order.
  const lines = orig.split('\n');
  let insertAfter = -1;

  // Anchor priority:
  //   1. <noscript><link rel="stylesheet" href="/styles.min.css ...>
  //   2. <link rel="preload" href="/styles.min.css ...> (no noscript)
  //   3. <link rel="stylesheet" href="/styles.min.css ...>
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('styles.min.css')) {
      insertAfter = i; // keep updating until last styles.min.css line
    }
  }
  if (insertAfter === -1) return { file, status: 'skip-anchor-not-found' };

  // Build the new line preserving leading whitespace of the anchor.
  const indent = (lines[insertAfter].match(/^\s*/) || [''])[0];
  const newLine = indent + TAG;

  lines.splice(insertAfter + 1, 0, newLine);
  fs.writeFileSync(file, lines.join('\n'), 'utf8');
  return { file, status: 'injected' };
}

const targets = collect();
const results = targets.map(inject);
const counts = results.reduce((acc, r) => {
  acc[r.status] = (acc[r.status] || 0) + 1;
  return acc;
}, {});

console.log('SF41 injection results:');
for (const r of results) {
  console.log(`  ${r.status.padEnd(28)}  ${path.relative(ROOT, r.file)}`);
}
console.log('---');
console.log(JSON.stringify(counts, null, 2));
