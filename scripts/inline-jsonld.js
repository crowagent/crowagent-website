#!/usr/bin/env node
/**
 * inline-jsonld.js
 *
 * Fix WS-AUDIT-001 (PHASE-1-AUDIT-WEBSITE-2026-05-06).
 *
 * Inverse of `externalise-jsonld.js`. Walks every static HTML file and
 * inlines any `<script type="application/ld+json" src="..."></script>`
 * tag by reading the referenced JSON file and replacing the empty tag
 * with `<script type="application/ld+json">{...}</script>` containing
 * the JSON content directly.
 *
 * Why: per the WHATWG HTML spec and Google's structured-data documentation,
 * `<script type="application/ld+json">` MUST be inline. The `src=` attribute
 * is ignored by Googlebot/Bingbot/social unfurlers — they will NOT fetch
 * the external file. Externalising broke 31 pages worth of structured
 * data (Article, FAQPage, Offer, BreadcrumbList, SoftwareApplication).
 *
 * The inline pattern is allowed under our CSP because `_headers` declares
 * `script-src 'self' 'unsafe-inline'` (the same compromise already in place
 * for inline-style attributes). JSON-LD is data, not executable code, so
 * `'unsafe-inline'` here does not introduce additional script-execution
 * risk beyond what is already accepted.
 *
 * Idempotent: re-running on a file that is already inlined leaves it alone.
 *
 * Usage:  node scripts/inline-jsonld.js
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const ASSETS_DIR = path.join(ROOT, "Assets", "jsonld");

const SUBDIRS = [
  "",
  "blog",
  "glossary",
  "intel/cyber-essentials-tracker",
  "intel/mees-tracker",
  "products",
];

const SKIP = new Set(["404.html"]);

// Match <script type="application/ld+json" src="/Assets/jsonld/SLUG.json"></script>
// Tolerate variable whitespace and either order of attrs.
const EXTERNAL_LD_RE =
  /<script\s+type=(?:"|')application\/ld\+json(?:"|')\s+src=(?:"|')([^"']+)(?:"|')\s*>\s*<\/script>/g;

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

function resolveJsonPath(srcAttr) {
  // src is an absolute URL like "/Assets/jsonld/foo.json"
  // Strip leading slash and resolve under ROOT.
  const rel = srcAttr.replace(/^\/+/, "");
  return path.join(ROOT, rel);
}

function processFile(htmlPath) {
  const original = fs.readFileSync(htmlPath, "utf8");
  let n = 0;
  let modified = false;
  const errors = [];

  const replaced = original.replace(EXTERNAL_LD_RE, function (match, src) {
    const jsonPath = resolveJsonPath(src);
    if (!fs.existsSync(jsonPath)) {
      errors.push(
        "[" + path.relative(ROOT, htmlPath) + "] referenced " + src +
        " but file not found at " + path.relative(ROOT, jsonPath)
      );
      return match;
    }
    let jsonText;
    try {
      jsonText = fs.readFileSync(jsonPath, "utf8").trim();
      // Validate the JSON before inlining — fail loudly on corrupt data.
      JSON.parse(jsonText);
    } catch (err) {
      errors.push(
        "[" + path.relative(ROOT, htmlPath) + "] " + src + ": invalid JSON — " +
        (err && err.message ? err.message : String(err))
      );
      return match;
    }
    n += 1;
    modified = true;
    return '<script type="application/ld+json">' + jsonText + "</script>";
  });

  if (errors.length) {
    for (const e of errors) console.error("ERROR " + e);
    if (!modified) return { changed: 0, errored: true };
  }

  if (modified) {
    fs.writeFileSync(htmlPath, replaced, "utf8");
    return { changed: n, errored: errors.length > 0 };
  }
  return { changed: 0, errored: false };
}

function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error("Missing JSON-LD source dir: " + ASSETS_DIR);
    process.exit(1);
  }
  const files = collectHtmlFiles();
  let totalBlocks = 0;
  let touchedFiles = 0;
  let anyError = false;
  for (const f of files) {
    const res = processFile(f);
    if (res.errored) anyError = true;
    if (res.changed > 0) {
      touchedFiles += 1;
      totalBlocks += res.changed;
      console.log("  " + path.relative(ROOT, f) + ": " + res.changed + " block(s) inlined");
    }
  }
  console.log(
    "\nInlined " + totalBlocks + " JSON-LD block(s) across " + touchedFiles + " HTML file(s)."
  );
  if (anyError) {
    console.error("Completed with errors — see above.");
    process.exit(1);
  }
}

main();
