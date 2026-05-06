#!/usr/bin/env node
/**
 * One-shot fixer for DEF-024.
 *
 * Walks every Article JSON-LD under Assets/jsonld/ that lacks an `image`
 * field and patches it in. The image points at the per-page OG asset
 * `Assets/og/{slug}.png` produced by scripts/generate-og-images.js, so the
 * Article rich result and the OpenGraph card resolve to the same artwork.
 *
 * Schema.org Article requires an image (Google Search Central guidance).
 * Without it, Article rich results don't render in SERPs.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const JSONLD_DIR = path.resolve(__dirname, "..", "Assets", "jsonld");
const OG_BASE = "https://crowagent.ai/Assets/og";

function slugFromFile(file) {
  // blog--csrd-omnibus-i-2026.json   → blog-csrd-omnibus-i-2026
  // glossary--csrd.json              → glossary-csrd
  // intel--cyber-essentials-tracker--index.json → intel-cyber-essentials-tracker
  const base = file.replace(/\.json$/i, "");
  // Handle the intel--{name}--index pattern explicitly.
  if (/^intel--/.test(base) && /--index$/.test(base)) {
    return base.replace(/^intel--/, "intel-").replace(/--index$/, "");
  }
  return base.replace(/--/g, "-");
}

function patch(file) {
  const full = path.join(JSONLD_DIR, file);
  const raw = fs.readFileSync(full, "utf8");
  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error(`SKIP ${file}: parse error: ${e.message}`);
    return false;
  }
  if (json["@type"] !== "Article") return false;
  if (json.image) return false;
  const slug = slugFromFile(file);
  const imageUrl = `${OG_BASE}/${slug}.png`;
  // Insert image after dateModified if present, else after datePublished.
  const ordered = {};
  for (const k of Object.keys(json)) {
    ordered[k] = json[k];
    if (k === "dateModified" || (!json.dateModified && k === "datePublished")) {
      ordered.image = imageUrl;
    }
  }
  if (!ordered.image) ordered.image = imageUrl;
  fs.writeFileSync(full, JSON.stringify(ordered, null, 2) + "\n");
  console.log(`PATCHED ${file}: image = ${imageUrl}`);
  return true;
}

function main() {
  if (!fs.existsSync(JSONLD_DIR)) {
    console.error(`No JSON-LD dir: ${JSONLD_DIR}`);
    process.exit(2);
  }
  const files = fs.readdirSync(JSONLD_DIR).filter((f) => f.endsWith(".json"));
  let patched = 0;
  for (const f of files) {
    if (patch(f)) patched += 1;
  }
  console.log(`\nDone. Patched ${patched} of ${files.length} JSON-LD files.`);
}

main();
