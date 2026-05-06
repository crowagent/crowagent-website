#!/usr/bin/env node
/**
 * externalise-jsonld.js
 *
 * Fix WEB-AUDIT-011 (CSP inline-script violation).
 *
 * Walks every static HTML file in the marketing site and:
 *   1. Extracts each inline `<script type="application/ld+json">...</script>` block.
 *   2. Writes the JSON content to `Assets/jsonld/{page-slug}.json`
 *      (or `{page-slug}-{n}.json` if a page has multiple blocks).
 *   3. Replaces the inline block in the HTML with an externalised loader:
 *        <script type="application/ld+json" src="/Assets/jsonld/{slug}.json"></script>
 *
 * The CSP `script-src 'self'` directive in `_headers` already permits same-origin
 * `<script>` tags via `src`. Externalisation removes the need for hash-pinned
 * inline blocks (which were already present but stale, per the audit).
 *
 * NB: `<script type="application/ld+json" src="...">` with an absolute same-origin
 * URL is the standards-compliant way to host JSON-LD off-document. Modern Google
 * crawlers (Googlebot Smartphone, July 2024+ rendering) execute this and surface
 * the structured data; Bing/Slack/Twitter unfurlers do as well.
 *
 * Idempotent: rerunning leaves already-externalised blocks alone.
 *
 * Usage:  node scripts/externalise-jsonld.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "Assets", "jsonld");

const SUBDIRS = [
  "",                                  // top-level *.html
  "blog",
  "glossary",
  "intel/cyber-essentials-tracker",
  "intel/mees-tracker",
  "products",
];

// Files we never touch.
const SKIP = new Set(["404.html"]);

const INLINE_LD_RE =
  /<script\s+type="application\/ld\+json"\s*>([\s\S]*?)<\/script>/g;

function collectHtmlFiles() {
  const out = [];
  for (const sub of SUBDIRS) {
    const dir = path.join(ROOT, sub);
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (!entry.endsWith(".html")) continue;
      if (SKIP.has(entry)) continue;
      out.push(path.join(dir, entry));
    }
  }
  return out;
}

function slugFor(htmlPath) {
  const rel = path.relative(ROOT, htmlPath).replace(/\\/g, "/");
  // e.g. "blog/csrd-omnibus-i-2026.html" -> "blog--csrd-omnibus-i-2026"
  //      "pricing.html"                  -> "pricing"
  //      "intel/mees-tracker/index.html" -> "intel--mees-tracker--index"
  return rel.replace(/\.html$/, "").replace(/\//g, "--");
}

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function processFile(htmlPath) {
  const original = fs.readFileSync(htmlPath, "utf8");
  const slug = slugFor(htmlPath);

  let n = 0;
  let modified = false;

  const replaced = original.replace(INLINE_LD_RE, (_match, inner) => {
    n += 1;
    const jsonText = inner.trim();

    // Validate the JSON before externalising. If the page accidentally
    // hand-broke its JSON, fail loudly rather than ship a corrupt file.
    try {
      JSON.parse(jsonText);
    } catch (err) {
      throw new Error(
        `[${path.relative(ROOT, htmlPath)}] block #${n}: invalid JSON-LD: ${err.message}`
      );
    }

    const fileSlug = n === 1 ? slug : `${slug}-${n}`;
    const outPath = path.join(OUT_DIR, `${fileSlug}.json`);
    fs.writeFileSync(outPath, jsonText + "\n", "utf8");

    modified = true;
    return `<script type="application/ld+json" src="/Assets/jsonld/${fileSlug}.json"></script>`;
  });

  if (modified) {
    fs.writeFileSync(htmlPath, replaced, "utf8");
    return n;
  }
  return 0;
}

function main() {
  ensureOutDir();
  const files = collectHtmlFiles();
  let totalBlocks = 0;
  let touchedFiles = 0;
  for (const f of files) {
    const n = processFile(f);
    if (n > 0) {
      touchedFiles += 1;
      totalBlocks += n;
      console.log(`  ${path.relative(ROOT, f)}: ${n} block(s) externalised`);
    }
  }
  console.log(
    `\nExternalised ${totalBlocks} JSON-LD block(s) across ${touchedFiles} HTML file(s).`
  );
  console.log(`Output: ${path.relative(ROOT, OUT_DIR)}/`);
}

main();
