#!/usr/bin/env node
/**
 * SF46 X6 — Add id="main-content" to the first <main> on every HTML page
 * that doesn't have it. The skip-link references #main-content.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || ['node_modules','tests','_archive','_drafts','coverage','playwright-report','hero-options'].includes(f)) continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (f.endsWith('.html')) list.push(full);
  }
  return list;
}

let added = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  // Match the FIRST <main ...> tag.
  const mainRe = /<main\b([^>]*)>/;
  const m = src.match(mainRe);
  if (!m) continue;
  const attrs = m[1];
  if (/\bid\s*=\s*["']main-content["']/.test(attrs)) continue;
  if (/\bid\s*=/.test(attrs)) continue; // already has a different id
  const replacement = `<main id="main-content"${attrs}>`;
  src = src.replace(mainRe, replacement);
  fs.writeFileSync(file, src);
  added++;
}
console.log(`X6: id="main-content" added to ${added} pages`);
