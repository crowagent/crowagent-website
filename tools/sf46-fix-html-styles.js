// SF46 batch #7 — fix-html-styles.js
// Founder mandate: OBLITERATE inline <style> `.wrap` / `.container` /
// `.container-wide` / `.ca-container` / `.priv-wrap` rules from EVERY
// .html file in the repository. Only styles.css is allowed to dictate
// layout. Scans recursively, skips _archive, node_modules, test-results.

const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '_archive', 'test-results', 'debug-screenshots', '.git', 'tests']);

// Patterns to delete from inside <style>…</style> blocks. We delete the
// COMPLETE rule body for each wrapper class.
// Founder mandate (B7, 2026-05-20): styles.css is the ONLY authority for
// layout. Match ANY `.wrap` / `.container` / `.container-wide` / `.ca-container`
// / `.priv-wrap` rule in inline <style> blocks, regardless of body content.
const RULE_PATTERNS = [
  /\.wrap,\s*\.container,\s*\.container-wide\s*\{[^}]*\}/g,
  /\.wrap,\s*\.container\s*\{[^}]*\}/g,
  /\.container,\s*\.container-wide\s*\{[^}]*\}/g,
  /(?:^|[^a-zA-Z0-9_-])\.wrap\s*\{[^}]*\}/g,
  /(?:^|[^a-zA-Z0-9_-])\.container\s*\{[^}]*\}/g,
  /(?:^|[^a-zA-Z0-9_-])\.container-wide\s*\{[^}]*\}/g,
  /(?:^|[^a-zA-Z0-9_-])\.ca-container\s*\{[^}]*\}/g,
  /(?:^|[^a-zA-Z0-9_-])\.priv-wrap\s*\{[^}]*\}/g,
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.') continue;
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function processFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  let out = src;
  let totalRemoved = 0;

  // Only operate inside <style>…</style> blocks (don't touch body markup).
  out = out.replace(/<style[^>]*>([\s\S]*?)<\/style>/g, (block, css) => {
    let cleaned = css;
    for (const re of RULE_PATTERNS) {
      cleaned = cleaned.replace(re, (m) => { totalRemoved++; return ''; });
    }
    // Collapse trailing semicolons or whitespace that might be left behind
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    return `<style>${cleaned}</style>`;
  });

  if (totalRemoved > 0) {
    fs.writeFileSync(file, out);
  }
  return { file: path.relative(root, file), removed: totalRemoved };
}

const files = walk(root);
const results = files.map(processFile).filter(r => r.removed > 0);
const totalFiles = files.length;
const touchedFiles = results.length;
const totalRules = results.reduce((s, r) => s + r.removed, 0);

console.log(JSON.stringify({
  scannedHtmlFiles: totalFiles,
  filesTouched: touchedFiles,
  rulesRemoved: totalRules,
  sample: results.slice(0, 10),
}, null, 2));
