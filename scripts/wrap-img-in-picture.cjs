#!/usr/bin/env node
// For every <img src="/Assets/photos/..." or /Assets/screenshots/..."> that
// has a sibling .avif (and optionally .webp), wrap the img in <picture>
// with the AVIF + WebP <source> ahead of the existing img. Idempotent: if
// the img is already inside <picture> it's left alone.
//
// Preserves all img attributes (alt, width, height, loading, class, etc.)
// Preserves srcset/sizes if present (rare on this site, but supported).

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'coverage', '_archive',
  'test-results', 'audit-screenshots-final', 'debug-screenshots']);

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

function hasSibling(srcUrl, ext) {
  // srcUrl is like "/Assets/photos/foo.jpg" or "/Assets/photos/sub/bar.png"
  const dotIdx = srcUrl.lastIndexOf('.');
  if (dotIdx < 0) return false;
  const sibling = srcUrl.slice(0, dotIdx) + '.' + ext;
  const fullPath = path.join(ROOT, sibling.replace(/^\//, ''));
  return fs.existsSync(fullPath) ? sibling : false;
}

// Match <img ... src="..." ... > (self-closing or not). Capture full tag.
// Use multiline to handle multi-line tags.
const IMG_RE = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*\/?>/gi;

let totalFilesTouched = 0;
let totalImgWrapped = 0;
const files = walk(ROOT, []);

for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  let changed = false;
  let cursor = 0;
  let out = '';
  IMG_RE.lastIndex = 0;
  let m;
  while ((m = IMG_RE.exec(src)) !== null) {
    const fullTag = m[0];
    const srcUrl = m[1];
    const matchStart = m.index;
    // Append everything since last cursor up to this tag
    out += src.slice(cursor, matchStart);
    cursor = matchStart + fullTag.length;

    // Filter: only wrap photos/screenshots paths
    if (!/^\/Assets\/(photos|screenshots)\//i.test(srcUrl)) {
      out += fullTag;
      continue;
    }
    // Skip if already inside a <picture> — look back ~120 chars for opening
    const lookback = src.slice(Math.max(0, matchStart - 200), matchStart);
    if (/<picture\b[^>]*>(?![\s\S]*<\/picture>)/i.test(lookback)) {
      out += fullTag;
      continue;
    }
    // Check that there's no </picture> in lookback before matchStart that
    // would have closed an opening pic — i.e. confirm we're "inside" only
    // if an opening picture is unclosed in the lookback.
    // Simpler: check the immediate preceding non-whitespace text
    const trimmedLookback = lookback.replace(/\s+/g, '');
    if (/<picture[^>]*>(?:<source[^>]*\/?>)*$/i.test(trimmedLookback)) {
      out += fullTag;
      continue;
    }

    const avif = hasSibling(srcUrl, 'avif');
    const webp = hasSibling(srcUrl, 'webp');
    if (!avif && !webp) {
      out += fullTag;
      continue;
    }

    const sources = [];
    if (avif) sources.push(`  <source type="image/avif" srcset="${avif}">`);
    if (webp) sources.push(`  <source type="image/webp" srcset="${webp}">`);
    const wrapped = `<picture>\n${sources.join('\n')}\n  ${fullTag}\n</picture>`;
    out += wrapped;
    totalImgWrapped++;
    changed = true;
  }
  out += src.slice(cursor);
  if (changed) {
    fs.writeFileSync(f, out);
    totalFilesTouched++;
    process.stdout.write(`wrapped ${path.relative(ROOT, f)}\n`);
  }
}

console.log(`---\nFiles touched: ${totalFilesTouched}. Images wrapped: ${totalImgWrapped}.`);
