#!/usr/bin/env node
// Wire motion-system.css + motion-system.js into every HTML page.
// Idempotent: skip if either tag is already present.
//
// CSS link inserted in <head> AFTER the existing styles.min.css preload line.
// JS script inserted right BEFORE the </body> close (after other defer scripts).
//
// EXCLUDED by default: index.html (the homepage refactor agent owns it during
// concurrent execution). Pass --include-index to wire it too.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'coverage', '_archive',
  'test-results', 'audit-screenshots-final', 'debug-screenshots']);
const INCLUDE_INDEX = process.argv.includes('--include-index');

const CSS_LINE = '<link rel="stylesheet" href="/Assets/css/motion-system.css?v=92">';
const JS_LINE = '<script src="/js/modules/motion-system.js?v=92" defer></script>';

// CSS anchor: insert AFTER any existing styles.min.css <link> or <noscript> line
const CSS_ANCHOR_RE = /<noscript><link rel="stylesheet" href="\/styles\.min\.css\?v=\d+"><\/noscript>/;
const CSS_ANCHOR_FALLBACK_RE = /<link rel="stylesheet" href="\/styles\.min\.css\?v=\d+">/;
// JS anchor: insert BEFORE the closing </body>
const JS_ANCHOR_RE = /<\/body>/i;

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
let touched = 0, skipped = 0, missing = 0;

for (const f of files) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (!INCLUDE_INDEX && rel === 'index.html') {
    process.stdout.write(`SKIP  ${rel} (index excluded; pass --include-index)\n`);
    skipped++;
    continue;
  }
  let src = fs.readFileSync(f, 'utf8');
  const hasCSS = /motion-system\.css/.test(src);
  const hasJS = /motion-system\.js/.test(src);
  if (hasCSS && hasJS) {
    process.stdout.write(`OK    ${rel} (already wired)\n`);
    skipped++;
    continue;
  }

  let changed = false;

  if (!hasCSS) {
    const anchor = CSS_ANCHOR_RE.exec(src) || CSS_ANCHOR_FALLBACK_RE.exec(src);
    if (anchor) {
      const insertAt = anchor.index + anchor[0].length;
      src = src.slice(0, insertAt) + '\n' + CSS_LINE + src.slice(insertAt);
      changed = true;
    } else {
      process.stdout.write(`WARN  ${rel} (no styles.min.css anchor for CSS link)\n`);
      missing++;
    }
  }

  if (!hasJS) {
    const m = JS_ANCHOR_RE.exec(src);
    if (m) {
      const insertAt = m.index;
      src = src.slice(0, insertAt) + JS_LINE + '\n' + src.slice(insertAt);
      changed = true;
    } else {
      process.stdout.write(`WARN  ${rel} (no </body> anchor for JS script)\n`);
      missing++;
    }
  }

  if (changed) {
    fs.writeFileSync(f, src);
    touched++;
    process.stdout.write(`WIRE  ${rel}\n`);
  }
}

console.log(`---\nWired: ${touched} | Skipped: ${skipped} | Anchor-missing warnings: ${missing} | Total scanned: ${files.length}`);
