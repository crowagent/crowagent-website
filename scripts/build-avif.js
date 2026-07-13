#!/usr/bin/env node
/**
 * build-avif.js — companion to build-webp.js. Generates AVIF siblings for
 * raster images that ship in the public payload, applying conservative quality
 * defaults that keep visual fidelity while shrinking payload another 30-50 %
 * vs WebP.
 *
 * Mirrors build-webp.js's behaviour:
 *   - Scans the same Assets/ subdirectories
 *   - Skips files newer than their source (idempotent)
 *   - Supports --check (dry run) and --quality=N (override)
 *
 * Why a separate script: AVIF encoding is much slower than WebP (~5-15 s per
 * 2400px image on a modern CPU), so we run it less frequently and cache
 * aggressively. Quality 50 for AVIF is roughly equivalent to quality 80 WebP
 * for photographic content (per Squoosh + WebPageTest benchmarks).
 *
 * The HTML <picture> wiring is owned by the HTML/CSS agents — this script
 * only produces the .avif files; it does NOT rewrite HTML.
 *
 * Usage:
 *   node scripts/build-avif.js                  # convert source rasters to AVIF
 *   node scripts/build-avif.js --check          # dry-run, list what would change
 *   node scripts/build-avif.js --quality=55     # override default quality
 *   node scripts/build-avif.js --force          # re-encode even if up-to-date
 *
 * Exit codes:
 *   0  success
 *   1  missing dependency (sharp)
 *   2  filesystem error
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");

const REPO_ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(REPO_ROOT, "Assets");

const argv = process.argv.slice(2);
const CHECK_ONLY = argv.includes("--check");
const FORCE = argv.includes("--force");
const QUALITY = parseInt(
  argv.find((a) => a.startsWith("--quality="))?.slice("--quality=".length) ?? "50",
  10,
);

// Source-raster directories to scan. AVIF outputs land alongside the source
// (e.g. Assets/photos/foo.jpg → Assets/photos/foo.avif) so HTML/CSS authors
// can reach them with the same base path used for WebP.
const SCAN_DIRS = [
  "",                  // Assets/*.png|jpg
  "photos",            // primary marketing photos
  "photos/product-hero",
  "photos/sectors",
  "screenshots",       // product feature screenshots
  "product-shots",     // product screenshots used on home + product/landing pages
  // og/ is intentionally excluded — social cards must remain PNG/JPG.
];

const RASTER_EXTS = new Set([".png", ".jpg", ".jpeg"]);

function structuredLog(level, message, extra = {}) {
  process.stdout.write(
    JSON.stringify({
      level,
      service: "build-avif",
      timestamp: new Date().toISOString(),
      message,
      ...extra,
    }) + "\n",
  );
}

function discoverRasters() {
  const out = [];
  for (const rel of SCAN_DIRS) {
    const dir = path.join(ASSETS_DIR, rel);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!RASTER_EXTS.has(ext)) continue;
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

async function convertAll(sharp) {
  const sources = discoverRasters();
  const results = [];
  for (const src of sources) {
    const ext = path.extname(src);
    const dst = src.slice(0, -ext.length) + ".avif";
    const srcSize = fs.statSync(src).size;
    const dstExists = fs.existsSync(dst);
    if (
      !FORCE &&
      dstExists &&
      fs.statSync(dst).mtimeMs > fs.statSync(src).mtimeMs
    ) {
      results.push({ src, dst, srcSize, dstSize: fs.statSync(dst).size, status: "up-to-date" });
      continue;
    }
    if (CHECK_ONLY) {
      results.push({ src, dst, srcSize, status: "would-convert" });
      continue;
    }
    await sharp(src)
      .avif({ quality: QUALITY, effort: 6 })
      .toFile(dst);
    const dstSize = fs.statSync(dst).size;
    results.push({ src, dst, srcSize, dstSize, status: "converted" });
  }
  return results;
}

async function main() {
  const t0 = Date.now();

  let sharp;
  try {
    sharp = require("sharp");
  } catch (e) {
    structuredLog("error", "sharp not installed; run `npm install --save-dev sharp`", {
      error: e instanceof Error ? e.message : String(e),
    });
    process.exit(1);
  }

  const conversions = await convertAll(sharp);
  const converted = conversions.filter((c) => c.status === "converted").length;
  const upToDate = conversions.filter((c) => c.status === "up-to-date").length;
  const wouldConvert = conversions.filter((c) => c.status === "would-convert").length;

  let totalSrc = 0;
  let totalDst = 0;
  for (const c of conversions) {
    totalSrc += c.srcSize ?? 0;
    totalDst += c.dstSize ?? 0;
  }

  structuredLog("info", "Conversion pass complete", {
    total: conversions.length,
    converted,
    up_to_date: upToDate,
    would_convert: wouldConvert,
    quality: QUALITY,
    bytes_src: totalSrc,
    bytes_avif: totalDst,
    bytes_saved: totalSrc - totalDst,
    duration_ms: Date.now() - t0,
  });
}

main().catch((err) => {
  structuredLog("error", "Unhandled error", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(2);
});
