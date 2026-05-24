#!/usr/bin/env node
/**
 * Pass 2: fill the remaining gaps from pass 1.
 * - hero-data-visualisation (alternative Unsplash photo)
 * - faq-team-collaboration (replacement for faq-multi-person-team PENDING)
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const sharp = require("sharp");

const REPO_ROOT = path.resolve(__dirname, "..");
const PHOTOS_DIR = path.join(REPO_ROOT, "Assets", "photos");
const AVIF_DIR = path.join(PHOTOS_DIR, "avif");
const AUDIT_PATH = path.join(REPO_ROOT, "audit", "8k-image-sourcing-2026-05-22.md");

if (!fs.existsSync(AVIF_DIR)) fs.mkdirSync(AVIF_DIR, { recursive: true });

// Alternative cdnIds — these are verified by inspecting the photo page on Unsplash.
const ASSETS = [
  {
    slug: "hero-data-visualisation",
    cdnId: "1639762681485-074b7f938ba0", // ThisisEngineering — data viz
    pageUrl:
      "https://unsplash.com/photos/a-computer-screen-with-a-bunch-of-data-on-it-WPmPsdX2ySw",
    photographer: "ThisisEngineering",
    description: "Data visualisation on monitor — premium abstract",
    page: "(hero alt #2)",
  },
  {
    slug: "faq-team-collaboration",
    cdnId: "1522071820081-009f0129c71c", // Annie Spratt — team collab (already known good)
    pageUrl: "https://unsplash.com/photos/people-doing-office-works-9SoCnyQmkzI",
    photographer: "Annie Spratt",
    description: "Team collaboration — FAQ context",
    page: "faq.html (replaces faq-multi-person-team PENDING)",
  },
];

const LOG = [];
const log = (m) => { LOG.push(m); console.log(m); };

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, { headers: { "user-agent": "crowagent-image-sourcing/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        download(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", (err) => { fs.unlink(destPath, () => reject(err)); });
  });
}

const kb = (b) => `${Math.round(b/1024)}KB`;

(async () => {
  const results = [];
  for (const asset of ASSETS) {
    log(`Processing ${asset.slug}`);
    const rawPath = path.join(PHOTOS_DIR, `${asset.slug}-raw.jpg`);
    const url = `https://images.unsplash.com/photo-${asset.cdnId}?w=3840&q=85&fm=jpg&fit=crop`;
    log(`  Downloading ${url}`);
    try {
      await download(url, rawPath);
    } catch (err) {
      log(`  ! FAILED: ${err.message}`);
      results.push({ slug: asset.slug, status: "failed", error: err.message });
      continue;
    }
    let meta;
    try { meta = await sharp(rawPath).metadata(); }
    catch (err) {
      log(`  ! Invalid image: ${err.message}`);
      results.push({ slug: asset.slug, status: "invalid", error: err.message });
      continue;
    }
    const srcBytes = fs.statSync(rawPath).size;

    const jpgPath = path.join(PHOTOS_DIR, `${asset.slug}.jpg`);
    const webpPath = path.join(PHOTOS_DIR, `${asset.slug}.webp`);
    const avifPath = path.join(AVIF_DIR, `${asset.slug}.avif`);
    await sharp(rawPath).resize({ width: 1920, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4", progressive: true }).toFile(jpgPath);
    await sharp(rawPath).resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 80, smartSubsample: true, effort: 5 }).toFile(webpPath);
    await sharp(rawPath).resize({ width: 1920, withoutEnlargement: true }).avif({ quality: 60, effort: 5 }).toFile(avifPath);

    const jpg4k = path.join(PHOTOS_DIR, `${asset.slug}-4k.jpg`);
    const webp4k = path.join(PHOTOS_DIR, `${asset.slug}-4k.webp`);
    const avif4k = path.join(AVIF_DIR, `${asset.slug}-4k.avif`);
    await sharp(rawPath).resize({ width: 3840, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true, chromaSubsampling: "4:4:4", progressive: true }).toFile(jpg4k);
    await sharp(rawPath).resize({ width: 3840, withoutEnlargement: true }).webp({ quality: 78, smartSubsample: true, effort: 5 }).toFile(webp4k);
    await sharp(rawPath).resize({ width: 3840, withoutEnlargement: true }).avif({ quality: 55, effort: 5 }).toFile(avif4k);

    const out = {
      slug: asset.slug,
      status: "ok",
      photographer: asset.photographer,
      page: asset.page,
      source: { width: meta.width, height: meta.height, bytes: srcBytes },
      jpg1920: fs.statSync(jpgPath).size,
      webp1920: fs.statSync(webpPath).size,
      avif1920: fs.statSync(avifPath).size,
      jpg3840: fs.statSync(jpg4k).size,
      webp3840: fs.statSync(webp4k).size,
      avif3840: fs.statSync(avif4k).size,
    };
    log(`  ${asset.slug} src ${meta.width}x${meta.height} (${kb(srcBytes)}) → 1920: ${kb(out.jpg1920)}/${kb(out.webp1920)}/${kb(out.avif1920)} | 3840: ${kb(out.jpg3840)}/${kb(out.webp3840)}/${kb(out.avif3840)}`);
    results.push(out);
  }

  // append to audit
  let appendix = `\n\n## Pass 2 — ${new Date().toISOString()}\n\n`;
  appendix += `| Slug | Source W×H | Source KB | 1920 JPG | 1920 WebP | 1920 AVIF | 3840 JPG | 3840 WebP | 3840 AVIF | Photographer | Page |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of results.filter(r => r.status === "ok")) {
    appendix += `| \`${r.slug}\` | ${r.source.width}×${r.source.height} | ${kb(r.source.bytes)} | ${kb(r.jpg1920)} | ${kb(r.webp1920)} | ${kb(r.avif1920)} | ${kb(r.jpg3840)} | ${kb(r.webp3840)} | ${kb(r.avif3840)} | ${r.photographer} | ${r.page} |\n`;
  }
  for (const r of results.filter(r => r.status !== "ok")) {
    appendix += `\n- FAIL \`${r.slug}\` — ${r.error}\n`;
  }
  fs.appendFileSync(AUDIT_PATH, appendix);
  log("Appendix appended");
})();
