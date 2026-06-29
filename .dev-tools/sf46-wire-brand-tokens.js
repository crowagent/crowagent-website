// SF46 G1-G5 closure — wire crowagent-brand-tokens.css into every HTML page.
//
// Problem: brand-tokens.css exists with our canonical foundation tokens but
// is not referenced by any HTML page, so the G1-G5 tokens (border-radius
// ladder, focus-ring, state-layer, prefers-reduced-motion baseline, system-
// font fallback) never resolve at runtime.
//
// Fix: insert <link rel="stylesheet" href="/crowagent-brand-tokens.css?v=99">
// at the head of every HTML page, AFTER the Google Fonts link and BEFORE
// styles.min.css so its tokens are available when other stylesheets resolve
// var() references.

const fs = require('fs');
const path = require('path');

const LINK = '<link rel="stylesheet" href="/crowagent-brand-tokens.css?v=99">';

function walkHtml(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '_archive', 'debug-screenshots', 'test-results', '.git', 'tests', 'scripts', 'tools'].includes(entry.name)) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkHtml(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function injectInto(src) {
  if (src.includes('crowagent-brand-tokens.css')) return null; // already wired
  // Inject BEFORE the first <link rel="preload" ... styles.min.css> or
  // BEFORE the first <link rel="stylesheet" href="/styles ... .css">.
  // Fallback: inject after <head> if no styles link found.
  const preload = src.match(/<link[^>]+rel=["']preload["'][^>]+styles\.min\.css[^>]*>/i);
  if (preload) {
    const idx = src.indexOf(preload[0]);
    return src.slice(0, idx) + LINK + '\n' + src.slice(idx);
  }
  const stylesheet = src.match(/<link[^>]+rel=["']stylesheet["'][^>]+styles\.min\.css[^>]*>/i);
  if (stylesheet) {
    const idx = src.indexOf(stylesheet[0]);
    return src.slice(0, idx) + LINK + '\n' + src.slice(idx);
  }
  const headOpen = src.match(/<head[^>]*>/i);
  if (headOpen) {
    const idx = src.indexOf(headOpen[0]) + headOpen[0].length;
    return src.slice(0, idx) + '\n' + LINK + src.slice(idx);
  }
  return null;
}

const apply = process.argv.includes('--apply');
const files = walkHtml('.');

let injected = 0;
let alreadyWired = 0;
let failed = [];
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  const out = injectInto(src);
  if (out === null) {
    if (src.includes('crowagent-brand-tokens.css')) alreadyWired++;
    else failed.push(f);
    continue;
  }
  if (apply) fs.writeFileSync(f, out);
  injected++;
  console.log(`${apply ? 'WIRED' : 'PLAN '} ${f}`);
}
console.log(`\nTotal: ${injected} ${apply ? 'wired' : 'plan to wire'} (already-wired: ${alreadyWired}, failed-no-head: ${failed.length})`);
if (failed.length) {
  console.log('Failed (no head/styles link found):');
  failed.forEach(f => console.log('  ' + f));
}
