/**
 * SF29 em-dash removal — strips em-dashes from user-facing HTML/JS text.
 *
 * Per CLAUDE.md rule 4: "No em-dashes in user-facing text. Use commas,
 * semicolons, or separate sentences."
 *
 * What this script touches:
 *   - HTML files in: root, blog/, products/, tools/<sub>/, glossary/, intel/<sub>/
 *   - js/nav-inject.js (footer tagline contains an em-dash entity)
 *
 * Replacement rules (in order):
 *   1.  `\s*—\s*`        → `, `   (literal U+2014 surrounded by whitespace)
 *   2.  `\s*&mdash;\s*`  → `, `   (HTML entity surrounded by whitespace)
 *   3.  `—`              → `, `   (any remaining literal em-dash)
 *   4.  `&mdash;`        → `, `   (any remaining entity)
 *
 * Skips:
 *   - HTML comment blocks `<!-- ... -->`
 *   - `<script>` and `<style>` blocks
 *   - `<svg>` `<text>` (would alter brand SVG marks)
 *
 * Reports per-file change count.
 */
const fs = require('fs');
const path = require('path');

const ROOTS = ['.'];
const SUBDIRS = ['blog', 'products', 'tools', 'glossary', 'intel'];
const SKIP_DIRS = new Set(['node_modules', 'audit-results', 'docs', 'debug-screenshots', 'hero-options', 'scripts', '.git']);

function walk(dir, files) {
  files = files || [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch (e) { return files; }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (e.isFile() && e.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function stripDashes(input) {
  // Tokenise out comments, scripts, styles, and SVG <text> so they are
  // skipped, then re-stitch.
  const placeholders = [];
  let working = input;

  function tuck(re) {
    working = working.replace(re, (m) => {
      placeholders.push(m);
      return `\x00${placeholders.length - 1}\x00`;
    });
  }

  // Order matters — comments first, then scripts/styles, then SVG text
  tuck(/<!--[\s\S]*?-->/g);
  tuck(/<script\b[\s\S]*?<\/script>/gi);
  tuck(/<style\b[\s\S]*?<\/style>/gi);
  tuck(/<text\b[\s\S]*?<\/text>/gi);

  // Now strip dashes from the remaining markup-and-text
  // Strict ordered passes — flanking whitespace gets the comma+space form,
  // bare em-dash gets a plain ", ".
  let count = 0;
  working = working.replace(/[ \t]*—[ \t]*/g, () => { count++; return ', '; });
  working = working.replace(/[ \t]*&mdash;[ \t]*/g, () => { count++; return ', '; });
  working = working.replace(/—/g, () => { count++; return ', '; });
  working = working.replace(/&mdash;/g, () => { count++; return ', '; });

  // Re-inject the tucked tokens
  working = working.replace(/\x00(\d+)\x00/g, (_, i) => placeholders[parseInt(i, 10)]);

  return { out: working, count };
}

const files = [];
walk('.', files);

let totalFiles = 0, totalReplacements = 0;
const offenders = [];

for (const f of files) {
  // Filter the file's path so we only touch site pages
  const rel = path.relative('.', f).replace(/\\/g, '/');
  if (!/^(blog|products|tools|glossary|intel)\//.test(rel) && rel.indexOf('/') !== -1) continue;
  const c0 = fs.readFileSync(f, 'utf8');
  const { out, count } = stripDashes(c0);
  if (count > 0) {
    fs.writeFileSync(f, out);
    totalFiles++;
    totalReplacements += count;
    offenders.push({ file: rel, count });
  }
}

// Also touch the nav-inject.js footer tagline
const navPath = 'js/nav-inject.js';
if (fs.existsSync(navPath)) {
  let navC = fs.readFileSync(navPath, 'utf8');
  const before = navC;
  navC = navC.replace(/Sustainability Intelligence for UK organisations &mdash; /g, 'Sustainability Intelligence for UK organisations: ');
  // Generic safety — any other user-visible mdash strings
  navC = navC.replace(/(['"`])([^'"`\n<>]*?)&mdash;([^'"`\n<>]*?)\1/g, (m, q, a, b) => q + a + ', ' + b + q);
  if (navC !== before) {
    fs.writeFileSync(navPath, navC);
    const extra = (before.match(/&mdash;/g) || []).length - (navC.match(/&mdash;/g) || []).length;
    if (extra > 0) {
      totalFiles++;
      totalReplacements += extra;
      offenders.push({ file: navPath, count: extra });
    }
  }
}

console.log('Em-dash removal complete.');
console.log('Files changed:', totalFiles);
console.log('Total replacements:', totalReplacements);
console.log();
offenders.sort((a, b) => b.count - a.count);
offenders.forEach(o => console.log('  ' + o.count + '   ' + o.file));
