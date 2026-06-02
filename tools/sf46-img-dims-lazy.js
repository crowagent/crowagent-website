#!/usr/bin/env node
/**
 * SF46 P2-AC + P2-AD — Image dimensions + lazy-loading sweep.
 *
 * For every `<img src="...">` in every HTML page:
 *   1. If src points to a local raster image (JPG/PNG/WebP/AVIF), read
 *      the file's native dimensions and inject width="..." height="..."
 *      attrs if missing. CLS guard.
 *   2. Add loading="lazy" to all <img> except the FIRST IMAGE in the
 *      document (heuristic for hero/LCP image; preserves LCP fetch).
 *   3. Preserve existing attributes; only fill in missing ones.
 *
 * SVGs are skipped — they have no intrinsic raster dimensions and the
 * CSS controls their size.
 *
 * Usage: node tools/sf46-img-dims-lazy.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

// Match multi-line `<img\n  src=...\n  alt=...\n>` constructs too.
// Non-greedy across newlines via [\s\S]*?.
const IMG_TAG_RE = /<img\b([\s\S]*?)>/g;
const SRC_RE = /\bsrc\s*=\s*(["'])([^"']+)\1/;
const ATTR_RE = /\b(width|height|loading|fetchpriority)\s*=/;

// Cheap raster-image dimension reader. Reads only the header bytes
// needed to extract intrinsic dimensions.
function readPngDims(buf) {
  // PNG: 8-byte signature, then IHDR chunk has width/height at bytes 16-23
  if (buf.length < 24) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  return [w, h];
}
function readJpgDims(buf) {
  // JPEG: scan for SOFn marker (C0-CF except C4/C8/CC)
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    if (marker === 0xd9 || marker === 0xda) return null;
    // SOFn markers contain dimensions
    if ((marker & 0xf0) === 0xc0 && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      const h = buf.readUInt16BE(i + 5);
      const w = buf.readUInt16BE(i + 7);
      return [w, h];
    }
    const segLen = buf.readUInt16BE(i + 2);
    i += 2 + segLen;
  }
  return null;
}
function readWebpDims(buf) {
  // WebP: RIFF....WEBP VP8/VP8L/VP8X
  if (buf.length < 30) return null;
  if (buf.slice(0,4).toString() !== 'RIFF') return null;
  if (buf.slice(8,12).toString() !== 'WEBP') return null;
  const sub = buf.slice(12,16).toString();
  if (sub === 'VP8 ') {
    const w = buf.readUInt16LE(26) & 0x3fff;
    const h = buf.readUInt16LE(28) & 0x3fff;
    return [w, h];
  } else if (sub === 'VP8L') {
    const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
    const w = ((b1 & 0x3f) << 8 | b0) + 1;
    const h = ((b3 & 0xf) << 10 | b2 << 2 | (b1 >> 6)) + 1;
    return [w, h];
  } else if (sub === 'VP8X') {
    const w = (buf.readUIntLE(24, 3)) + 1;
    const h = (buf.readUIntLE(27, 3)) + 1;
    return [w, h];
  }
  return null;
}
function readDims(file) {
  // Progressive JPEGs can push the SOFn marker well past the first 64
  // bytes. 64 KB buffer is enough for every realistic image we ship.
  const buf = Buffer.alloc(65536);
  let fd, read = 0;
  try {
    fd = fs.openSync(file, 'r');
    read = fs.readSync(fd, buf, 0, 65536, 0);
  } catch (e) { return null; }
  finally { if (fd) fs.closeSync(fd); }
  const active = buf.slice(0, read);
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return readPngDims(active);
  if (ext === '.jpg' || ext === '.jpeg') return readJpgDims(active);
  if (ext === '.webp') return readWebpDims(active);
  return null;
}

function resolveSrc(htmlFile, src) {
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) return null;
  let p = src.replace(/^\.\//, '');
  if (p.startsWith('/')) {
    return path.join(ROOT, p.slice(1));
  }
  return path.join(path.dirname(htmlFile), p);
}

function findHtml(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || f === 'node_modules' || f === 'tests'
        || f === '_archive' || f === '_drafts' || f === 'coverage'
        || f === 'playwright-report' || f === 'hero-options') continue;
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) findHtml(full, list);
    else if (f.endsWith('.html')) list.push(full);
  }
  return list;
}

let totalDimsAdded = 0;
let totalLazyAdded = 0;
let filesTouched = 0;

for (const file of findHtml(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  let dimsAdded = 0;
  let lazyAdded = 0;
  let imgIndex = 0;
  const out = src.replace(IMG_TAG_RE, (tag, attrs) => {
    imgIndex++;
    const srcMatch = attrs.match(SRC_RE);
    if (!srcMatch) return tag;
    const srcVal = srcMatch[2];

    let newAttrs = attrs;

    // ── Width/Height (P2-AC) ──
    const hasW = /\bwidth\s*=/.test(attrs);
    const hasH = /\bheight\s*=/.test(attrs);
    if (!(hasW && hasH) && !srcVal.endsWith('.svg')) {
      let w = null, h = null;

      // Local raster image — read native dimensions from file header.
      const resolved = resolveSrc(file, srcVal);
      if (resolved && fs.existsSync(resolved)) {
        const dims = readDims(resolved);
        if (dims) { [w, h] = dims; }
      }

      // Remote Unsplash URL — derive from query string. Unsplash URLs use
      // ?w=N&h=M; height often omitted (16:9 default). Other CDNs may
      // use different patterns — only Unsplash handled here.
      if (!w && srcVal.includes('images.unsplash.com')) {
        const wMatch = srcVal.match(/[?&]w=(\d+)/);
        const hMatch = srcVal.match(/[?&]h=(\d+)/);
        if (wMatch) {
          w = parseInt(wMatch[1], 10);
          h = hMatch ? parseInt(hMatch[1], 10) : Math.round(w * 9 / 16); // 16:9 default
        }
      }

      if (w && h) {
        if (!hasW) newAttrs = ` width="${w}"` + newAttrs;
        if (!hasH) newAttrs = ` height="${h}"` + newAttrs;
        dimsAdded++;
      }
    }

    // ── Lazy-loading (P2-AD) ──
    // Skip the first image (LCP candidate).
    const hasLoading = /\bloading\s*=/.test(attrs);
    if (!hasLoading && imgIndex > 1) {
      newAttrs = ` loading="lazy"` + newAttrs;
      lazyAdded++;
    }
    // First image gets fetchpriority="high" if missing (P2-AE prep)
    const hasFp = /\bfetchpriority\s*=/.test(attrs);
    if (!hasFp && imgIndex === 1) {
      newAttrs = ` fetchpriority="high"` + newAttrs;
    }

    return `<img${newAttrs}>`;
  });

  if (dimsAdded + lazyAdded > 0) {
    filesTouched++;
    totalDimsAdded += dimsAdded;
    totalLazyAdded += lazyAdded;
    if (!DRY) fs.writeFileSync(file, out);
    console.log(`[${DRY ? 'DRY' : 'EDIT'}] ${path.relative(ROOT, file)} — dims=${dimsAdded}, lazy=${lazyAdded}`);
  }
}

console.log(`\nP2-AC+AD+AE: ${totalDimsAdded} dims added, ${totalLazyAdded} lazy added across ${filesTouched} files`);
console.log(DRY ? '(dry-run — no files changed)' : 'done.');
