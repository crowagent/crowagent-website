#!/usr/bin/env node
/**
 * SF46 P3-X — Inject `<meta name="color-scheme" content="dark light">`
 * on every HTML page. Idempotent.
 * Also (P3-S — dns-prefetch + preconnect audit): inject hints for
 * external hosts we know we use (Brevo, Cloudflare CDN, Calendly,
 * PostHog) where not already present.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const COLOR_SCHEME = '<meta name="color-scheme" content="dark light">';
const HINTS = [
  '<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">',
  '<link rel="dns-prefetch" href="https://app.posthog.com">',
  '<link rel="preconnect" href="https://api.brevo.com" crossorigin>',
  '<link rel="preconnect" href="https://challenges.cloudflare.com" crossorigin>',
];

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || ['node_modules','tests','_archive','_drafts','coverage','playwright-report','hero-options'].includes(f)) continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (f.endsWith('.html')) list.push(full);
  }
  return list;
}

let csAdded = 0, hintsAdded = 0;
for (const file of walk(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  let dirty = false;

  // P3-X color-scheme meta
  if (!/name="color-scheme"/.test(src) && /<\/head>/.test(src)) {
    src = src.replace('</head>', `${COLOR_SCHEME}\n</head>`);
    csAdded++;
    dirty = true;
  }

  // P3-S dns-prefetch / preconnect hints (deduplicate)
  for (const hint of HINTS) {
    const host = (hint.match(/href="([^"]+)"/) || [])[1];
    if (!host) continue;
    if (src.includes(`href="${host}"`)) continue;
    src = src.replace('</head>', `${hint}\n</head>`);
    hintsAdded++;
    dirty = true;
  }

  if (dirty) fs.writeFileSync(file, src);
}

console.log(`P3-X color-scheme meta added on ${csAdded} pages`);
console.log(`P3-S dns-prefetch/preconnect hints added: ${hintsAdded}`);
