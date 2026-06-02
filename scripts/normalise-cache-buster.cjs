#!/usr/bin/env node
// Walk all *.html outside node_modules/coverage/_archive/test-results and
// normalise every `styles.min.css?v=<N>` to a single target version.
// Idempotent. Reports each file modified.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = process.argv[2] || '92';
const SKIP_DIRS = new Set([
  'node_modules', 'coverage', '_archive', 'test-results',
  'audit-screenshots-final', 'debug-screenshots',
]);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(ROOT, []);
const re = /styles\.min\.css\?v=\d+/g;
const target = `styles.min.css?v=${TARGET}`;

let modified = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  if (!re.test(src)) continue;
  re.lastIndex = 0;
  const next = src.replace(re, target);
  if (next !== src) {
    fs.writeFileSync(f, next);
    modified++;
    process.stdout.write(path.relative(ROOT, f) + '\n');
  }
}
console.log(`---\nFiles modified: ${modified} / scanned ${files.length}. Target: ${target}`);
