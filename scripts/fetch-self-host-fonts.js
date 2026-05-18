#!/usr/bin/env node
/*
 * Fetch the 6 self-hosted woff2 files for the site:
 *   Inter 400 / 500 / 600
 *   Plus Jakarta Sans 600 / 700 / 800
 *
 * BACKGROUND (2026-05-17 fix):
 *   The previous implementation parsed Google Fonts' /css2 endpoint and wrote
 *   the woff2 referenced inside each `@font-face` block to a per-weight target
 *   filename. That worked when Google emitted one *static* woff2 per weight.
 *   At some point Google switched to a single *variable* woff2 per family +
 *   subset — every weight block now points at the SAME variable woff2 URL.
 *   The old script consequently wrote the same file 6 times under 6 names.
 *   Browsers then loaded `Inter-500.woff2` for the 500 @font-face but, because
 *   the @font-face declared `font-weight: 500` and the file is a variable font
 *   that defaults to the registered weight axis range, all heading copy
 *   silently rendered at weight 400 — a subtle but visible regression.
 *
 *   The robust fix is to pull static per-weight files from Fontsource (which
 *   pre-builds latin/latin-ext/cyrillic etc. subsets at every static weight).
 *   Fontsource hosts the files on jsDelivr's CDN at a stable URL schema; we
 *   commit the woff2 bytes to the repo so the live site has zero network
 *   dependency.
 *
 *   The CSS in Assets/css/fonts-selfhosted.css already declares one
 *   @font-face per (family, weight) with `unicode-range: U+0000-00FF`, which
 *   matches the Fontsource `latin` subset.
 *
 * Verification:
 *   - File MD5s MUST be distinct across the 3 weights of each family
 *     (the previous bug made them identical).
 *   - Each file MUST be a valid woff2 (magic `wOF2`).
 *   - Total payload after the fix is ~110 KB (vs ~230 KB pre-fix).
 *
 * Usage: node scripts/fetch-self-host-fonts.js
 */

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");
const crypto = require("crypto");

const FONTS_DIR = path.join(__dirname, "..", "Assets", "fonts");
fs.mkdirSync(FONTS_DIR, { recursive: true });

// Source of truth: Fontsource (https://fontsource.org), distributed via jsDelivr.
// Pinning to a major version keeps reproducible builds; bump deliberately if
// the upstream font itself ships a major revision.
const CDN_BASE = "https://cdn.jsdelivr.net/npm";
const SOURCES = [
  // family slug, fontsource package name, fontsource subset, weight, local filename
  ["Inter", "@fontsource/inter@5", "latin", 400, "Inter-400.woff2"],
  ["Inter", "@fontsource/inter@5", "latin", 500, "Inter-500.woff2"],
  ["Inter", "@fontsource/inter@5", "latin", 600, "Inter-600.woff2"],
  [
    "Plus Jakarta Sans",
    "@fontsource/plus-jakarta-sans@5",
    "latin",
    600,
    "PlusJakartaSans-600.woff2",
  ],
  [
    "Plus Jakarta Sans",
    "@fontsource/plus-jakarta-sans@5",
    "latin",
    700,
    "PlusJakartaSans-700.woff2",
  ],
  [
    "Plus Jakarta Sans",
    "@fontsource/plus-jakarta-sans@5",
    "latin",
    800,
    "PlusJakartaSans-800.woff2",
  ],
];

function fontsourceFileName(pkg, subset, weight) {
  // jsDelivr layout: cdn.jsdelivr.net/npm/<pkg>/files/<family>-<subset>-<weight>-normal.woff2
  // Family slug = the bit after `@fontsource/`.
  const family = pkg.replace(/^@fontsource\//, "").replace(/@.*$/, "");
  return `${family}-${subset}-${weight}-normal.woff2`;
}

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { "User-Agent": "crowagent-website/fetch-self-host-fonts" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          return resolve(fetchUrl(res.headers.location));
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`GET ${url} → ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

(async () => {
  const results = [];
  for (const [family, pkg, subset, weight, target] of SOURCES) {
    const url = `${CDN_BASE}/${pkg}/files/${fontsourceFileName(pkg, subset, weight)}`;
    process.stdout.write(`  fetch ${family} ${weight} <- ${url} ... `);
    const buf = await fetchUrl(url);
    if (buf.slice(0, 4).toString("ascii") !== "wOF2") {
      throw new Error(`Not a valid woff2 for ${family} ${weight}: magic=${buf.slice(0, 4).toString("hex")}`);
    }
    const outPath = path.join(FONTS_DIR, target);
    fs.writeFileSync(outPath, buf);
    const md5 = crypto.createHash("md5").update(buf).digest("hex");
    const kb = (buf.length / 1024).toFixed(1);
    console.log(`${kb} KB  md5=${md5.slice(0, 12)}`);
    results.push({ family, weight, target, kb, md5 });
  }

  // Sanity: every weight within a family should have a distinct md5.
  const seen = new Map();
  let dups = 0;
  for (const r of results) {
    const key = r.family + ":" + r.md5;
    if (seen.has(key)) dups++;
    seen.set(key, r);
  }
  if (dups > 0) {
    console.error(`\nFATAL: ${dups} duplicate file(s) — script regressed to the 2026-05-17 bug.`);
    process.exit(2);
  }

  console.log(`\nDone. ${results.length} files written to ${FONTS_DIR}`);
})().catch((e) => {
  console.error("FATAL:", e);
  process.exit(1);
});
