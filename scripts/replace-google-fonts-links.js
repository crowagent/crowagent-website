#!/usr/bin/env node
/*
 * M5 step 3: replace the Google-Fonts <link> trio across every HTML
 * with self-hosted refs.
 *
 * We match (and DELETE) any of these line patterns:
 *   <link rel="preconnect" href="https://fonts.googleapis.com" ...>
 *   <link rel="preconnect" href="https://fonts.gstatic.com" ...>
 *   <link rel="preload" as="style" href="https://fonts.googleapis.com/..." ...>
 *   <link ... href="https://fonts.googleapis.com/..." rel="stylesheet" ...>
 *   <link rel="stylesheet" href="https://fonts.googleapis.com/..." ...>
 *
 * At the position of the FIRST removed line we insert our two lines:
 *   <link rel="preload" href="/Assets/fonts/PlusJakartaSans-700.woff2" as="font" type="font/woff2" crossorigin>
 *   <link rel="stylesheet" href="/Assets/css/fonts-selfhosted.css">
 *
 * Indentation is copied from the first removed line so the surrounding
 * <head> stays visually clean.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");

const REPLACEMENT_PRELOAD =
  '<link rel="preload" href="/Assets/fonts/PlusJakartaSans-700.woff2" as="font" type="font/woff2" crossorigin>';
const REPLACEMENT_STYLESHEET =
  '<link rel="stylesheet" href="/Assets/css/fonts-selfhosted.css">';

// Find every .html file with fonts.googleapis.com (excluding archive + node_modules)
function findHtmlFiles() {
  // Use git ls-files if available, else recurse
  const out = execSync(
    'powershell -NoProfile -Command "Get-ChildItem -Path . -Recurse -Filter *.html -File | Where-Object { $_.FullName -notmatch \'\\\\node_modules\\\\|\\\\_archive\\\\|\\\\\\.git\\\\\' } | ForEach-Object { $_.FullName }"',
    { cwd: ROOT, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }
  );
  return out
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const FONT_LINK_RE =
  /^([ \t]*)<link\b[^>]*\b(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\s*$/i;

let modifiedCount = 0;
let unchangedCount = 0;
let skippedNoMatch = 0;
const remainingRefs = [];

for (const file of findHtmlFiles()) {
  const orig = fs.readFileSync(file, "utf8");
  if (!/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(orig)) {
    continue;
  }
  // Preserve line endings (most files are LF, a few may be CRLF on Win)
  const eol = orig.includes("\r\n") ? "\r\n" : "\n";
  const lines = orig.split(/\r?\n/);
  const out = [];
  let inserted = false;
  let firstIndent = "";
  let removedAny = false;
  for (const line of lines) {
    const m = line.match(FONT_LINK_RE);
    if (m) {
      removedAny = true;
      if (!inserted) {
        firstIndent = m[1];
        out.push(firstIndent + REPLACEMENT_PRELOAD);
        out.push(firstIndent + REPLACEMENT_STYLESHEET);
        inserted = true;
      }
      // else: drop the line entirely
    } else {
      out.push(line);
    }
  }
  if (!removedAny) {
    skippedNoMatch++;
    // Could mean inline style block or comment containing the URL.
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(orig)) {
      remainingRefs.push(file);
    }
    continue;
  }
  const next = out.join(eol);
  if (next !== orig) {
    fs.writeFileSync(file, next);
    modifiedCount++;
    // Sanity-check the result still has no leftover URL
    if (/fonts\.googleapis\.com|fonts\.gstatic\.com/.test(next)) {
      remainingRefs.push(file);
    }
  } else {
    unchangedCount++;
  }
}

console.log(`Modified: ${modifiedCount}`);
console.log(`Unchanged: ${unchangedCount}`);
console.log(`No-match (had refs but no <link> line): ${skippedNoMatch}`);
if (remainingRefs.length) {
  console.log(`\nFiles still referencing Google Fonts URLs (review manually):`);
  for (const f of remainingRefs) console.log("  " + f);
}
