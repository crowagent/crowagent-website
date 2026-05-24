#!/usr/bin/env node
/**
 * source-8k-images-2026-05-22-pass3.js
 *
 * Pass 3 of the 8K imagery deployment (2026-05-22).
 *
 * Scope:
 *  1. Page-hero upgrades — re-source `partners-team-collaboration` and
 *     `contact-desk` at 3840w to give partners.html + contact.html proper
 *     1920/3840 retina hero variants with AVIF.
 *  2. Sector pass-2 catalogue additions — source 2 net-new sector category
 *     photos (energy/renewables, technology/SaaS) into Assets/photos/sectors/pass2/.
 *     These fill the two sector categories not present in the SF21 12-card grid.
 *     Saved at 1920w + 3840w with AVIF/WebP/JPG for future use.
 *
 * Out of scope:
 *  - about.html hero — uses founder-supplied brand asset hero-london-uk-compliance
 *    (proprietary; NOT_TOUCH per PHOTO-ATTRIBUTIONS.md row).
 *  - Homepage sector grid (SF21) — already deployed at 3000w as 12 unique
 *    royalty-free Unsplash photos with MANIFEST.md. No re-source needed.
 *  - Product hero photos (crowagent-core through csrd) — pass-1 already
 *    upgraded these to 1920+3840w in `source-8k-images-2026-05-22.js`.
 *
 * Encoding:
 *  - 1920w (mid-tier) JPG q82 mozjpeg / WebP q80 / AVIF q60
 *  - 3840w (retina/4K) JPG q82 / WebP q78 / AVIF q55
 *
 * Idempotent: skips download if `${slug}-raw.jpg` exists and is > 200KB.
 *
 * Run log appended to audit/8k-imagery-pass2-2026-05-22.md.
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const sharp = require("sharp");

const REPO_ROOT = path.resolve(__dirname, "..");
const PHOTOS_DIR = path.join(REPO_ROOT, "Assets", "photos");
const AVIF_DIR = path.join(PHOTOS_DIR, "avif");
const SECTORS_PASS2_DIR = path.join(PHOTOS_DIR, "sectors", "pass2");
const SECTORS_PASS2_AVIF_DIR = path.join(SECTORS_PASS2_DIR, "avif");
const AUDIT_PATH = path.join(REPO_ROOT, "audit", "8k-imagery-pass2-2026-05-22.md");

[AVIF_DIR, SECTORS_PASS2_DIR, SECTORS_PASS2_AVIF_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const ASSETS = [
  // Page-hero upgrade — partners.html
  {
    slug: "partners-team-collaboration",
    cdnId: "1556761175-5973dc0f32e7",
    pageUrl: "https://unsplash.com/photos/group-of-people-using-laptop-computer-zZ1tPJus5BE",
    photographer: "Christina @ wocintechchat (per H4-IMAGES-DIVERSE wave attribution)",
    photographerUrl: "https://unsplash.com/@wocintechchat",
    description: "Diverse team collaborating around laptops — partners.html hero",
    page: "partners.html (hero upgrade 1600w → 1920+3840w)",
    target: PHOTOS_DIR,
    avifDir: AVIF_DIR,
  },
  // Page-hero/content upgrade — contact.html
  {
    slug: "contact-desk",
    cdnId: "1486312338219-ce68d2c6f44d",
    pageUrl: "https://unsplash.com/photos/man-using-macbook-OQMZwNd3ThU",
    photographer: "Christin Hume",
    photographerUrl: "https://unsplash.com/@christinhumephoto",
    description: "Person typing on a laptop at a clean desk — contact.html content",
    page: "contact.html (upgrade 1600w → 1920+3840w)",
    target: PHOTOS_DIR,
    avifDir: AVIF_DIR,
  },
  // Sector pass-2 — energy / renewables (gap in SF21 12-card grid)
  {
    slug: "sector-energy-renewables",
    cdnId: "1486754735734-325b5831c3ad",
    pageUrl: "https://unsplash.com/photos/0w-uTa0Xz7w",
    photographer: "Karsten Wuerth",
    photographerUrl: "https://unsplash.com/@karsten_wuerth",
    description: "Wind turbines on green grass field — UK energy / renewables sector",
    page: "(future sector card — fills energy/renewables gap)",
    target: SECTORS_PASS2_DIR,
    avifDir: SECTORS_PASS2_AVIF_DIR,
  },
  // Sector pass-2 — technology / SaaS
  {
    slug: "sector-technology-saas",
    cdnId: "1499951360447-b19be8fe80f5",
    pageUrl: "https://unsplash.com/photos/SYTO3xs06fU",
    photographer: "Marvin Meyer",
    photographerUrl: "https://unsplash.com/@marvelous",
    description: "Multi-laptop developer workspace flat-lay — technology / SaaS sector",
    page: "(future sector card — fills technology/SaaS gap)",
    target: SECTORS_PASS2_DIR,
    avifDir: SECTORS_PASS2_AVIF_DIR,
  },
];

const LOG_LINES = [];

function log(line) {
  LOG_LINES.push(line);
  // eslint-disable-next-line no-console
  console.log(line);
}

async function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const req = https.get(
      url,
      { headers: { "user-agent": "crowagent-image-sourcing/1.0" } },
      (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          download(res.headers.location, destPath).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      }
    );
    req.on("error", (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

async function processAsset(asset) {
  const sourceUrl = `https://images.unsplash.com/photo-${asset.cdnId}?w=3840&q=85&fm=jpg&fit=crop`;
  const rawPath = path.join(asset.target, `${asset.slug}-raw.jpg`);

  let needsDownload = true;
  if (fs.existsSync(rawPath)) {
    const st = fs.statSync(rawPath);
    if (st.size > 200_000) needsDownload = false;
  }

  if (needsDownload) {
    log(`  Downloading ${asset.slug} from ${sourceUrl}`);
    try {
      await download(sourceUrl, rawPath);
    } catch (err) {
      log(`  ! DOWNLOAD FAILED for ${asset.slug}: ${err.message}`);
      return { slug: asset.slug, status: "download-failed", error: err.message };
    }
  } else {
    log(`  Reusing existing ${asset.slug}-raw.jpg`);
  }

  let sourceMeta;
  try {
    sourceMeta = await sharp(rawPath).metadata();
  } catch (err) {
    log(`  ! Invalid image ${asset.slug}: ${err.message}`);
    return { slug: asset.slug, status: "invalid-image", error: err.message };
  }
  const sourceBytes = fs.statSync(rawPath).size;

  const jpgPath = path.join(asset.target, `${asset.slug}.jpg`);
  const webpPath = path.join(asset.target, `${asset.slug}.webp`);
  const avifPath = path.join(asset.avifDir, `${asset.slug}.avif`);

  await sharp(rawPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4", progressive: true })
    .toFile(jpgPath);

  await sharp(rawPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80, smartSubsample: true, effort: 5 })
    .toFile(webpPath);

  await sharp(rawPath)
    .resize({ width: 1920, withoutEnlargement: true })
    .avif({ quality: 60, effort: 5 })
    .toFile(avifPath);

  const jpg4kPath = path.join(asset.target, `${asset.slug}-4k.jpg`);
  const webp4kPath = path.join(asset.target, `${asset.slug}-4k.webp`);
  const avif4kPath = path.join(asset.avifDir, `${asset.slug}-4k.avif`);

  await sharp(rawPath)
    .resize({ width: 3840, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4", progressive: true })
    .toFile(jpg4kPath);

  await sharp(rawPath)
    .resize({ width: 3840, withoutEnlargement: true })
    .webp({ quality: 78, smartSubsample: true, effort: 5 })
    .toFile(webp4kPath);

  await sharp(rawPath)
    .resize({ width: 3840, withoutEnlargement: true })
    .avif({ quality: 55, effort: 5 })
    .toFile(avif4kPath);

  const out = {
    slug: asset.slug,
    status: "ok",
    source: { width: sourceMeta.width, height: sourceMeta.height, bytes: sourceBytes },
    jpg1920: fs.statSync(jpgPath).size,
    webp1920: fs.statSync(webpPath).size,
    avif1920: fs.statSync(avifPath).size,
    jpg3840: fs.statSync(jpg4kPath).size,
    webp3840: fs.statSync(webp4kPath).size,
    avif3840: fs.statSync(avif4kPath).size,
  };

  log(
    `  ${asset.slug.padEnd(34)} src ${sourceMeta.width}x${sourceMeta.height} (${kb(sourceBytes)}) → ` +
      `1920: jpg ${kb(out.jpg1920)} / webp ${kb(out.webp1920)} / avif ${kb(out.avif1920)}  | ` +
      `3840: jpg ${kb(out.jpg3840)} / webp ${kb(out.webp3840)} / avif ${kb(out.avif3840)}`
  );

  return out;
}

(async () => {
  log(`\n[${new Date().toISOString()}] Starting 8K image sourcing pass 3\n`);
  const results = [];
  for (const asset of ASSETS) {
    log(`Processing ${asset.slug} (${asset.page})`);
    const r = await processAsset(asset);
    results.push({ ...r, asset });
  }

  const okResults = results.filter((r) => r.status === "ok");
  const failed = results.filter((r) => r.status !== "ok");

  // Ensure audit file exists with proper header
  if (!fs.existsSync(AUDIT_PATH)) {
    fs.writeFileSync(
      AUDIT_PATH,
      `# 8K Imagery Pass 2 — sector + page-heroes (2026-05-22)\n\n` +
        `Scope: source royalty-free 8K-class imagery for sector gap-fill + page hero upgrades.\n` +
        `Sources: Unsplash (Unsplash License). All photos verified live on unsplash.com.\n\n`
    );
  }

  let appendix = `\n\n---\n\n## Run log — ${new Date().toISOString()}\n\n`;
  appendix += `Source script: \`scripts/source-8k-images-2026-05-22-pass3.js\`\n\n`;
  appendix += `| Slug | Source W×H | Source KB | 1920 JPG | 1920 WebP | 1920 AVIF | 3840 JPG | 3840 WebP | 3840 AVIF | Photographer | Page |\n`;
  appendix += `|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of okResults) {
    appendix += `| \`${r.slug}\` | ${r.source.width}×${r.source.height} | ${kb(r.source.bytes)} | ${kb(r.jpg1920)} | ${kb(r.webp1920)} | ${kb(r.avif1920)} | ${kb(r.jpg3840)} | ${kb(r.webp3840)} | ${kb(r.avif3840)} | ${r.asset.photographer} | ${r.asset.page} |\n`;
  }
  if (failed.length) {
    appendix += `\n### Failures\n\n`;
    for (const r of failed) {
      appendix += `- \`${r.slug}\` — status: ${r.status} — error: ${r.error || "unknown"}\n`;
    }
  }
  appendix += `\n${LOG_LINES.length} log lines emitted; ${okResults.length}/${results.length} assets succeeded.\n`;

  fs.appendFileSync(AUDIT_PATH, appendix);
  log(`\nAudit log appended to ${AUDIT_PATH}`);
  log(`\nDone: ${okResults.length}/${results.length} ok, ${failed.length} failed`);
  if (failed.length) process.exit(1);
})();
