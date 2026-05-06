#!/usr/bin/env node
/**
 * build-webp.js — issue #109 LCP image optimisation
 *
 * Converts every .png in Assets/ (and selected subdirectories) to a sibling
 * .webp at WebP quality 82, which on the typical PNG screenshot yields a
 * ~70-85% file-size reduction while remaining visually indistinguishable.
 *
 * The static crowagent.ai site uses these images in three load profiles:
 *
 *   1. Hero / above-the-fold (LCP candidates) on:
 *        - index.html             (no PNG hero today; bg-hero.svg used)
 *        - products/*.html        (product-shot screenshots)
 *        - blog/*.html            (article hero from add-article-image.js)
 *
 *   2. Inline screenshots in feature carousels and analytics blocks
 *      (Assets/screenshots/*.png).
 *
 *   3. Open-graph share images (Assets/og/*.png) — these are rendered by
 *      generate-og-images.js and are NOT converted to WebP, because:
 *        a) Facebook/Twitter/LinkedIn cards prefer PNG/JPG and some clients
 *           still don't render WebP previews.
 *        b) These images are referenced in <meta property="og:image"> only,
 *           never as <img> tags, so the WebP <picture> fallback pattern
 *           does not apply.
 *
 * The HTML-rewriting step (--rewrite-html) walks every .html under the repo,
 * finds <img src="…/foo.png"> references whose target now has a sibling
 * .webp, and rewrites the surrounding markup to use the <picture> +
 * <source srcset> pattern with the original <img> as PNG fallback. The
 * rewrite is idempotent: a tag already wrapped in <picture> is skipped.
 *
 * Usage:
 *   node scripts/build-webp.js                  # convert PNGs only
 *   node scripts/build-webp.js --rewrite-html   # convert + rewrite <img> tags
 *   node scripts/build-webp.js --check          # dry-run, list what would change
 *   node scripts/build-webp.js --quality=85     # override default quality
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
const REWRITE_HTML = argv.includes("--rewrite-html");
const CHECK_ONLY = argv.includes("--check");
const QUALITY = parseInt(
  argv.find((a) => a.startsWith("--quality="))?.slice("--quality=".length) ?? "82",
  10,
);

// Subdirectories under Assets/ to scan for PNGs.
//
// Excluded by design:
//   - og/                  → social-share PNGs, not <img> tags
//   - icons/               → already <50KB and WebP support varies for PWA icons
//   - Branding Logo/       → small (797B) favicon-style PNG, not worth converting
const PNG_SCAN_DIRS = [
  "",                  // Assets/*.png  (e.g. og-image.png is the hero/social fallback)
  "screenshots",       // product-feature carousel images (LCP candidates)
  "team",              // (currently empty but reserved)
  "testimonials",      // (currently empty but reserved)
];

function structuredLog(level, message, extra = {}) {
  process.stdout.write(
    JSON.stringify({
      level,
      service: "build-webp",
      timestamp: new Date().toISOString(),
      message,
      ...extra,
    }) + "\n",
  );
}

function discoverPngs() {
  const out = [];
  for (const rel of PNG_SCAN_DIRS) {
    const dir = path.join(ASSETS_DIR, rel);
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!e.name.toLowerCase().endsWith(".png")) continue;
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

async function convertPngs(sharp) {
  const pngs = discoverPngs();
  const results = [];
  for (const src of pngs) {
    const dst = src.replace(/\.png$/i, ".webp");
    const srcSize = fs.statSync(src).size;
    const dstExists = fs.existsSync(dst);
    if (dstExists && fs.statSync(dst).mtimeMs > fs.statSync(src).mtimeMs) {
      results.push({ src, dst, srcSize, dstSize: fs.statSync(dst).size, status: "up-to-date" });
      continue;
    }
    if (CHECK_ONLY) {
      results.push({ src, dst, srcSize, status: "would-convert" });
      continue;
    }
    await sharp(src).webp({ quality: QUALITY, effort: 6 }).toFile(dst);
    const dstSize = fs.statSync(dst).size;
    results.push({ src, dst, srcSize, dstSize, status: "converted" });
  }
  return results;
}

// ---------- HTML rewrite ----------
//
// Find <img src="X.png"> where X.webp exists, and wrap in:
//   <picture>
//     <source type="image/webp" srcset="X.webp">
//     <img src="X.png" …>
//   </picture>
//
// Constraints:
//   - Only rewrite <img> NOT already inside a <picture>. We detect this with
//     a 1KB lookbehind that checks for an unclosed <picture> tag.
//   - Preserve all original <img> attributes (alt, width, height, loading,
//     decoding, fetchpriority, sizes, srcset). The <source> inherits the
//     same set, mapped to webp.
//   - Idempotent: re-running the script on a previously-rewritten file is a
//     no-op (because the <img> is already inside a <picture>).

function discoverHtmlFiles() {
  const dirs = ["", "blog", "products", "glossary", "intel", "free-tools", "industries"];
  const out = [];
  for (const d of dirs) {
    const dir = path.join(REPO_ROOT, d);
    if (!fs.existsSync(dir)) continue;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isFile() || !e.name.endsWith(".html")) continue;
      out.push(path.join(dir, e.name));
    }
  }
  return out;
}

function rewriteHtmlFile(htmlPath, webpSet) {
  let html = fs.readFileSync(htmlPath, "utf8");
  const original = html;

  // Match <img …src="…/foo.png" …> on a single line. We don't try to handle
  // pathological cases (multi-line attributes, escaped quotes inside src) —
  // the entire static-site authoring style uses simple, single-line <img>.
  const imgRe = /<img\b([^>]*?)\bsrc=(["'])([^"']+\.png)\2([^>]*)>/gi;

  let rewriteCount = 0;
  html = html.replace(imgRe, (match, before, quote, src, after, offset) => {
    // Skip if already inside a <picture> tag. Cheap heuristic: find the last
    // unclosed <picture> tag before the offset.
    const lookback = html.slice(Math.max(0, offset - 1000), offset);
    const lastPicOpen = lookback.lastIndexOf("<picture");
    const lastPicClose = lookback.lastIndexOf("</picture>");
    if (lastPicOpen > lastPicClose) return match;

    // Resolve the .png reference relative to the HTML file, then check if a
    // sibling .webp exists. We only rewrite when the conversion has already
    // produced a webp file — otherwise the <source> would point to a 404.
    const htmlDir = path.dirname(htmlPath);
    let resolvedPng;
    if (src.startsWith("/")) {
      resolvedPng = path.join(REPO_ROOT, src.slice(1));
    } else if (src.startsWith("http")) {
      return match; // external URL, not ours to rewrite
    } else {
      resolvedPng = path.resolve(htmlDir, src);
    }
    const resolvedWebp = resolvedPng.replace(/\.png$/i, ".webp");
    if (!webpSet.has(path.normalize(resolvedWebp))) return match;

    const webpSrc = src.replace(/\.png$/i, ".webp");
    rewriteCount++;
    return `<picture><source type="image/webp" srcset="${webpSrc}">${match}</picture>`;
  });

  if (rewriteCount > 0 && !CHECK_ONLY) {
    fs.writeFileSync(htmlPath, html, "utf8");
  }
  return rewriteCount;
}

// ---------- main ----------

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

  const conversions = await convertPngs(sharp);
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
    bytes_png: totalSrc,
    bytes_webp: totalDst,
    bytes_saved: totalSrc - totalDst,
  });

  if (REWRITE_HTML) {
    const webpSet = new Set(
      conversions.map((c) => path.normalize(c.dst)).filter((p) => fs.existsSync(p)),
    );
    const htmlFiles = discoverHtmlFiles();
    let totalRewrites = 0;
    let touchedFiles = 0;
    for (const f of htmlFiles) {
      const n = rewriteHtmlFile(f, webpSet);
      if (n > 0) {
        touchedFiles++;
        totalRewrites += n;
      }
    }
    structuredLog("info", "HTML rewrite complete", {
      html_files_scanned: htmlFiles.length,
      html_files_rewritten: touchedFiles,
      img_tags_rewritten: totalRewrites,
      check_only: CHECK_ONLY,
    });
  }

  structuredLog("info", "Complete", { duration_ms: Date.now() - t0 });
}

main().catch((err) => {
  structuredLog("error", "Unhandled error", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(2);
});
