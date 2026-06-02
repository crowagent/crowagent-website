#!/usr/bin/env node
/**
 * source-8k-images-2026-05-22.js
 *
 * One-off image-sourcing pass for the 2026-05-22 NASA-grade sourcing mandate.
 * Downloads royalty-free Unsplash images at 3840px width, then runs sharp to
 * generate AVIF + WebP + JPG fallback at 1920×1080 (per brief acceptance
 * criterion #4).
 *
 * Each output gets a sibling 3840 (4K) variant for retina + future-proofing.
 *
 * Idempotent: skips downloads if the source JPG already exists at the target
 * path AND is larger than 200KB (sentinel for "real source, not stub").
 *
 * Outputs go to:
 *   Assets/photos/{slug}.jpg              (1920w fallback)
 *   Assets/photos/{slug}.webp             (1920w)
 *   Assets/photos/avif/{slug}.avif        (1920w)
 *   Assets/photos/{slug}-4k.jpg           (3840w retina)
 *   Assets/photos/{slug}-4k.webp          (3840w retina)
 *   Assets/photos/avif/{slug}-4k.avif     (3840w retina)
 *
 * Run log appended to audit/8k-image-sourcing-2026-05-22.md
 */

"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const https = require("node:https");
const sharp = require("sharp");

const REPO_ROOT = path.resolve(__dirname, "..");
const PHOTOS_DIR = path.join(REPO_ROOT, "Assets", "photos");
const AVIF_DIR = path.join(PHOTOS_DIR, "avif");
const PRODUCT_HERO_DIR = path.join(PHOTOS_DIR, "product-hero");
const PRODUCT_HERO_AVIF_DIR = path.join(PRODUCT_HERO_DIR, "avif");
const AUDIT_PATH = path.join(REPO_ROOT, "audit", "8k-image-sourcing-2026-05-22.md");

// Ensure directories exist
[AVIF_DIR, PRODUCT_HERO_DIR, PRODUCT_HERO_AVIF_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

/**
 * Unsplash photo IDs (the bit after `photos/` in the page URL — these are
 * verified by viewing the photo page directly).
 */
const ASSETS = [
  // New hero scene alternatives
  {
    slug: "hero-uk-skyline-night",
    cdnId: "1486325212027-8081e485255e", // Benjamin Davies — London skyline at night
    pageUrl:
      "https://unsplash.com/photos/londons-skyline-during-nighttime-V_Y5VOaNNQU",
    photographer: "Benjamin Davies",
    photographerUrl: "https://unsplash.com/@bendavisual",
    description: "London skyline at night, dark premium atmospheric",
    page: "(hero alt #1)",
    target: PHOTOS_DIR,
  },
  {
    slug: "hero-data-visualisation",
    cdnId: "1644018073303-d1f4f1adfd92", // Solen Feyissa — abstract multi-coloured
    pageUrl:
      "https://unsplash.com/photos/multicolored-abstract-painting-tQH9085-uHc",
    photographer: "Solen Feyissa",
    photographerUrl: "https://unsplash.com/@solenfeyissa",
    description: "Abstract data visualisation, premium atmospheric",
    page: "(hero alt #2)",
    target: PHOTOS_DIR,
  },
  // About.html — verified replacement for PENDING_VERIFICATION asset
  {
    slug: "about-london-compliance",
    cdnId: "1513635269975-59663e0ac1ad", // Charles Postiaux — Tower Bridge daylight
    pageUrl:
      "https://unsplash.com/photos/the-tower-bridge-in-london-during-the-day-fwhDdgxRPzg",
    photographer: "Charles Postiaux",
    photographerUrl: "https://unsplash.com/@charlespostiaux",
    description: "London Tower Bridge — UK compliance context",
    page: "about.html (replaces hero-london-uk-compliance PENDING)",
    target: PHOTOS_DIR,
  },
  // Product hero resamples — same Unsplash sources, higher-res variants
  {
    slug: "crowagent-core",
    cdnId: "1486406146926-c627a92ad1ab", // Sean Pollock — verified prior
    pageUrl: "https://unsplash.com/photos/photo-of-high-rise-buildings-pUAM5hPaCRI",
    photographer: "Sean Pollock",
    photographerUrl: "https://unsplash.com/@seanpollock",
    description: "UK high-rise commercial buildings",
    page: "crowagent-core.html",
    target: PRODUCT_HERO_DIR,
  },
  {
    slug: "crowmark",
    cdnId: "1486299267070-83823f5448dd", // Heidi Fin — Big Ben (verified prior)
    pageUrl: "https://unsplash.com/photos/big-ben-london-during-daytime-LOuBJVLdFZA",
    photographer: "Heidi Fin",
    photographerUrl: "https://unsplash.com/@heidifin",
    description: "Big Ben — UK public-sector procurement context",
    page: "crowmark.html",
    target: PRODUCT_HERO_DIR,
  },
  {
    slug: "crowcyber",
    cdnId: "1558494949-ef010cbdcc31", // Petter Lagson — network cables
    pageUrl:
      "https://unsplash.com/photos/blue-ethernet-cables-connected-on-network-switch-WtolM5hsj14",
    photographer: "Petter Lagson",
    photographerUrl: "https://unsplash.com/@petterlagson",
    description: "Network cables — cybersecurity infrastructure",
    page: "crowcyber.html",
    target: PRODUCT_HERO_DIR,
  },
  {
    slug: "crowcash",
    cdnId: "1554224155-6726b3ff858f", // Mika Baumeister — calculator
    pageUrl: "https://unsplash.com/photos/silver-calculator-on-yellow-background-7tjs9p3xQRk",
    photographer: "Mika Baumeister",
    photographerUrl: "https://unsplash.com/@mbaumi",
    description: "Calculator — UK invoicing + late payment context",
    page: "crowcash.html",
    target: PRODUCT_HERO_DIR,
  },
  {
    slug: "crowesg",
    cdnId: "1556761175-5973dc0f32e7", // Brooke Cagle — team meeting
    pageUrl:
      "https://unsplash.com/photos/group-of-people-having-a-meeting-uxQbR6fPm2A",
    photographer: "Brooke Cagle",
    photographerUrl: "https://unsplash.com/@brookecagle",
    description: "Team meeting — ESG sustainability planning",
    page: "crowesg.html",
    target: PRODUCT_HERO_DIR,
  },
  {
    slug: "csrd",
    cdnId: "1454165804606-c3d57bc86b40", // Ben Wicks — writing on paper
    pageUrl: "https://unsplash.com/photos/three-pupils-writing-on-paper-iVvyYGeSyL0",
    photographer: "Ben Wicks",
    photographerUrl: "https://unsplash.com/@profwicks",
    description: "Writing documentation — CSRD compliance",
    page: "csrd.html",
    target: PRODUCT_HERO_DIR,
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
    const req = https.get(url, { headers: { "user-agent": "crowagent-image-sourcing/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        download(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    });
    req.on("error", (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

async function processAsset(asset) {
  const isProductHero = asset.target === PRODUCT_HERO_DIR;
  const avifDir = isProductHero ? PRODUCT_HERO_AVIF_DIR : AVIF_DIR;

  // Unsplash CDN URL — request 3840 wide JPG @ q=85 (highest practical via CDN)
  const sourceUrl = `https://images.unsplash.com/photo-${asset.cdnId}?w=3840&q=85&fm=jpg&fit=crop`;
  const rawPath = path.join(asset.target, `${asset.slug}-raw.jpg`);

  // Step 1: download source if not present or too small
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

  // Validate the file is actually an image
  let sourceMeta;
  try {
    sourceMeta = await sharp(rawPath).metadata();
  } catch (err) {
    log(`  ! Invalid image ${asset.slug}: ${err.message}`);
    return { slug: asset.slug, status: "invalid-image", error: err.message };
  }
  const sourceBytes = fs.statSync(rawPath).size;

  // Step 2: encode 1920w JPG, WebP, AVIF
  const jpgPath = path.join(asset.target, `${asset.slug}.jpg`);
  const webpPath = path.join(asset.target, `${asset.slug}.webp`);
  const avifPath = path.join(avifDir, `${asset.slug}.avif`);

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

  // Step 3: encode 3840w retina variants (4K-class for high-DPI displays)
  const jpg4kPath = path.join(asset.target, `${asset.slug}-4k.jpg`);
  const webp4kPath = path.join(asset.target, `${asset.slug}-4k.webp`);
  const avif4kPath = path.join(avifDir, `${asset.slug}-4k.avif`);

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

  // Collect sizes
  const out = {
    slug: asset.slug,
    status: "ok",
    source: {
      width: sourceMeta.width,
      height: sourceMeta.height,
      bytes: sourceBytes,
    },
    jpg1920: fs.statSync(jpgPath).size,
    webp1920: fs.statSync(webpPath).size,
    avif1920: fs.statSync(avifPath).size,
    jpg3840: fs.statSync(jpg4kPath).size,
    webp3840: fs.statSync(webp4kPath).size,
    avif3840: fs.statSync(avif4kPath).size,
  };

  log(
    `  ${asset.slug.padEnd(30)} src ${sourceMeta.width}x${sourceMeta.height} (${kb(sourceBytes)}) → ` +
      `1920: jpg ${kb(out.jpg1920)} / webp ${kb(out.webp1920)} / avif ${kb(out.avif1920)}  | ` +
      `3840: jpg ${kb(out.jpg3840)} / webp ${kb(out.webp3840)} / avif ${kb(out.avif3840)}`
  );

  return out;
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

(async () => {
  log(`\n[${new Date().toISOString()}] Starting 8K image sourcing pass\n`);
  const results = [];
  for (const asset of ASSETS) {
    log(`Processing ${asset.slug} (${asset.page})`);
    const r = await processAsset(asset);
    results.push({ ...r, asset });
  }

  // Append a run log to the audit markdown
  const okResults = results.filter((r) => r.status === "ok");
  const failed = results.filter((r) => r.status !== "ok");

  let appendix = `\n\n---\n\n## Run log — ${new Date().toISOString()}\n\n`;
  appendix += `Source script: \`scripts/source-8k-images-2026-05-22.js\`\n\n`;
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
