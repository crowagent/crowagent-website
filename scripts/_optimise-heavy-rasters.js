#!/usr/bin/env node
/*
 * One-time optimisation pass for heavy rasters identified in the
 * 2026-05-17 image-weight audit. For each candidate:
 *
 *   1. Copy the original to Assets/_archive/{originals-2026-05-17}/{rel}.original
 *      (only once; idempotent)
 *   2. Re-encode in place using sharp at the requested quality / max dimension.
 *      JPEGs: progressive + mozjpeg + chroma sub-sampling 4:2:0
 *      PNGs:  re-encoded as JPEG if photographic; preserved as PNG if it has
 *             alpha (the hero png is fully opaque so we keep PNG with palette
 *             reduction).
 *      WebPs: q=80, effort 6
 *      AVIFs: q=50, effort 6
 *   3. Resize to <= maxWidth (default 2400 px) so we never carry payload that
 *      is more than ~2x the displayed width on a Retina screen.
 *
 * Every original is preserved under Assets/_archive — nothing is destroyed.
 *
 * The script reads its candidate list inline (top of file). Run with --dry to
 * see what would happen. Run with --force to ignore the up-to-date check.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const ARCHIVE = path.join(ROOT, 'Assets', '_archive', 'originals-2026-05-17');
const DRY = process.argv.includes('--dry');
const FORCE = process.argv.includes('--force');

// Candidate set: every raster > 200 KB that is still referenced from HTML.
// Keys are paths relative to the repo root. maxW limits the longest edge to
// 2400 px (kept Retina-friendly for the 1180 px max content column).
// Hero (homepage LCP) is treated specially — keep at 1920 px because it is
// preloaded with fetchpriority=high.
const CANDIDATES = [
  // The fallback PNG inside the homepage <picture>. Modern browsers take the
  // 179 KB AVIF, but we still ship a sensible PNG fallback. Re-encode at
  // 1920 px @ quality 82, which is roughly 600 KB instead of 2.26 MB.
  { p: 'Assets/photos/hero-premium-earth.png', maxW: 1920, kind: 'png-to-jpeg' },

  // Product-hero set — all currently 2400 x 1600+. Their CSS box is 1180 px,
  // so the 2400 px AVIF / WebP cover Retina; the JPEG fallback can safely be
  // dropped to 1600 px.
  { p: 'Assets/photos/product-hero/crowesg.jpg', maxW: 1800, kind: 'jpeg' },
  { p: 'Assets/photos/product-hero/crowesg.webp', maxW: 1800, kind: 'webp' },
  { p: 'Assets/photos/product-hero/avif/crowesg.avif', maxW: 1800, kind: 'avif' },

  { p: 'Assets/photos/product-hero/crowagent-core.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/product-hero/crowagent-core.webp', maxW: 1600, kind: 'webp' },
  { p: 'Assets/photos/product-hero/avif/crowagent-core.avif', maxW: 1600, kind: 'avif' },

  { p: 'Assets/photos/product-hero/crowcyber.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/product-hero/crowcyber.webp', maxW: 1600, kind: 'webp' },
  { p: 'Assets/photos/product-hero/avif/crowcyber.avif', maxW: 1600, kind: 'avif' },

  { p: 'Assets/photos/product-hero/csrd.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/product-hero/csrd.webp', maxW: 1600, kind: 'webp' },
  { p: 'Assets/photos/product-hero/avif/csrd.avif', maxW: 1600, kind: 'avif' },

  { p: 'Assets/photos/product-hero/crowmark.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/product-hero/crowmark.webp', maxW: 1600, kind: 'webp' },
  { p: 'Assets/photos/product-hero/avif/crowmark.avif', maxW: 1600, kind: 'avif' },

  { p: 'Assets/photos/product-hero/crowcash.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/product-hero/crowcash.webp', maxW: 1600, kind: 'webp' },
  { p: 'Assets/photos/product-hero/avif/crowcash.avif', maxW: 1600, kind: 'avif' },

  // Other large hero photos
  { p: 'Assets/photos/faq-multi-person-team.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/faq-multi-person-team.webp', maxW: 1600, kind: 'webp' },
  { p: 'Assets/photos/partners-team-collaboration.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/partners-team-collaboration.webp', maxW: 1600, kind: 'webp' },
  { p: 'Assets/photos/partners-document-review.jpg', maxW: 1600, kind: 'jpeg' },
  { p: 'Assets/photos/partners-document-review.webp', maxW: 1600, kind: 'webp' },

  { p: 'Assets/photos/hero-london-uk-compliance.jpg', maxW: 1536, kind: 'jpeg' },
  { p: 'Assets/photos/hero-london-uk-compliance.webp', maxW: 1536, kind: 'webp' },

  { p: 'Assets/photos/office-window.jpg', maxW: 1400, kind: 'jpeg' },
  { p: 'Assets/photos/faq-notebook.jpg', maxW: 1400, kind: 'jpeg' },

  // Sector tiles render in a 3-column grid (max box width ~ 380 px). 1200 px
  // covers Retina. Re-encode to JPEG q82 / WebP q80.
  { p: 'Assets/photos/sectors/sector-retail-hospitality.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/sector-retail-hospitality.webp', maxW: 1200, kind: 'webp' },
  { p: 'Assets/photos/sectors/sector-manufacturing-industrial.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/sector-manufacturing-industrial.webp', maxW: 1200, kind: 'webp' },
  { p: 'Assets/photos/sectors/sector-real-estate-commercial.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/sector-real-estate-commercial.webp', maxW: 1200, kind: 'webp' },
  { p: 'Assets/photos/sectors/product-core-office-tower.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/product-core-office-tower.webp', maxW: 1200, kind: 'webp' },
  { p: 'Assets/photos/sectors/product-mark-contract.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/product-mark-contract.webp', maxW: 1200, kind: 'webp' },
  { p: 'Assets/photos/sectors/product-core-paperwork.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/product-mark-parliament.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/sector-public-sector-civic.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/product-mark-team.jpg', maxW: 1200, kind: 'jpeg' },
  { p: 'Assets/photos/sectors/sector-professional-services.jpg', maxW: 1200, kind: 'jpeg' },

  // Screenshots — 3040x2024 native is ~2.5x the displayed 1200 px column;
  // 1800 px is the practical cap on Retina.
  { p: 'Assets/screenshots/crowmark.png', maxW: 1800, kind: 'png' },
  { p: 'Assets/screenshots/csrd-checker.png', maxW: 1800, kind: 'png' },
  { p: 'Assets/screenshots/analytics.png', maxW: 1800, kind: 'png' },
  { p: 'Assets/screenshots/epc-check.png', maxW: 1800, kind: 'png' },
];

async function archiveOriginal(rel) {
  const src = path.join(ROOT, rel);
  const dst = path.join(ARCHIVE, rel.split('/').slice(1).join('/') + '.original');
  if (fs.existsSync(dst)) return false;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return true;
}

async function reencode({ p, maxW, kind }) {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) return { p, status: 'missing' };
  const beforeBytes = fs.statSync(abs).size;

  await archiveOriginal(p);

  // Read the file into a Buffer first, then close the OS handle, so the
  // subsequent in-place write does not collide with a sharp/libvips read
  // handle on Windows (UNKNOWN, EBUSY).
  const srcBuf = fs.readFileSync(abs);
  const meta = await sharp(srcBuf).metadata();
  const needsResize = meta.width > maxW;
  let pipeline = sharp(srcBuf, { animated: false });
  if (needsResize) pipeline = pipeline.resize({ width: maxW, withoutEnlargement: true });

  let outBuf;
  if (kind === 'jpeg') {
    outBuf = await pipeline.jpeg({ quality: 82, mozjpeg: true, progressive: true, chromaSubsampling: '4:2:0' }).toBuffer();
  } else if (kind === 'png') {
    outBuf = await pipeline.png({ quality: 90, compressionLevel: 9, palette: true }).toBuffer();
  } else if (kind === 'png-to-jpeg') {
    // Re-encode opaque PNG hero as PNG (we cannot change the extension without
    // breaking the <img src=…> reference). Use palette quantisation.
    outBuf = await pipeline.png({ quality: 80, compressionLevel: 9, palette: true }).toBuffer();
  } else if (kind === 'webp') {
    outBuf = await pipeline.webp({ quality: 80, effort: 6 }).toBuffer();
  } else if (kind === 'avif') {
    outBuf = await pipeline.avif({ quality: 50, effort: 6 }).toBuffer();
  } else {
    throw new Error('unknown kind ' + kind);
  }

  // Only write if smaller (avoid making things worse).
  if (outBuf.length >= beforeBytes && !FORCE) {
    return { p, status: 'no-savings', before: beforeBytes, after: outBuf.length };
  }
  if (!DRY) fs.writeFileSync(abs, outBuf);
  return { p, status: DRY ? 'would-write' : 'written', before: beforeBytes, after: outBuf.length, savings: beforeBytes - outBuf.length };
}

(async () => {
  let totalBefore = 0, totalAfter = 0, totalSavings = 0, written = 0;
  const results = [];
  for (const c of CANDIDATES) {
    try {
      const r = await reencode(c);
      results.push(r);
      if (r.before) totalBefore += r.before;
      if (r.after) totalAfter += r.after;
      if (r.savings) totalSavings += r.savings;
      if (r.status === 'written' || r.status === 'would-write') written++;
    } catch (e) {
      results.push({ p: c.p, status: 'error', error: e.message });
    }
  }
  fs.writeFileSync(
    path.join(ROOT, 'audit-results', '_optimise-log-2026-05-17.json'),
    JSON.stringify({ totalBefore, totalAfter, totalSavings, written, results }, null, 2),
  );
  console.log(JSON.stringify({
    written,
    totalBefore,
    totalAfter,
    savings: totalSavings,
    savingsMiB: (totalSavings / 1024 / 1024).toFixed(2),
  }));
})().catch((e) => { console.error(e); process.exit(1); });
