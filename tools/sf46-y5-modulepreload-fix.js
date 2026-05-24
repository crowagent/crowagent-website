#!/usr/bin/env node
/**
 * SF46 Y5 — Fix R4: replace `<link rel="modulepreload">` with
 * `<link rel="preload" as="script">` for non-module classic scripts.
 * nav-inject.js and scripts.min.js are classic IIFE, not ES modules.
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

let fixed = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  // Replace modulepreload of nav-inject + scripts.min (classic scripts)
  src = src.replace(
    /<link\s+rel=["']modulepreload["']\s+href=["']\/js\/nav-inject\.js["']\s+as=["']script["']\s*\/?>/g,
    '<link rel="preload" href="/js/nav-inject.js" as="script">'
  );
  src = src.replace(
    /<link\s+rel=["']modulepreload["']\s+href=["']\/js\/scripts\.min\.js["']\s+as=["']script["']\s*\/?>/g,
    '<link rel="preload" href="/js/scripts.min.js" as="script">'
  );
  if (src !== before) {
    fs.writeFileSync(file, src);
    fixed++;
  }
}
console.log(`Y5 fixed: ${fixed} files (modulepreload → preload for classic scripts)`);
