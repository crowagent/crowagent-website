#!/usr/bin/env node
/**
 * SF46 R1 + R3 + R4 — Security + perf head injectors.
 *
 *   R1  CSP meta tag — moderate baseline; allows inline (we use lots),
 *       restricts img/script/style to trusted hosts.
 *   R3  Speculation Rules — index.html prerenders top destinations.
 *   R4  Modulepreload — hint critical JS modules.
 *
 * Idempotent: skips files that already have the tag/script.
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');

const CSP_CONTENT = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://challenges.cloudflare.com https://app.posthog.com https://us-assets.i.posthog.com https://eu-assets.i.posthog.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.brevo.com https://challenges.cloudflare.com https://app.posthog.com https://eu.i.posthog.com https://us.i.posthog.com",
  "frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://calendly.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://crowagent.ai https://app.crowagent.ai",
  "upgrade-insecure-requests",
].join('; ');

const CSP_META = `<meta http-equiv="Content-Security-Policy" content="${CSP_CONTENT}">`;

const SPECULATION_RULES = `<script type="speculationrules">${JSON.stringify({
  prerender: [{
    where: { href_matches: '/*', relative_to: 'document' },
    eagerness: 'moderate',
  }],
})}</script>`;

const MODULEPRELOAD_HINTS = [
  '<link rel="modulepreload" href="/js/nav-inject.js" as="script">',
  '<link rel="modulepreload" href="/js/scripts.min.js" as="script">',
].join('\n');

function findHtml(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || f === 'node_modules' || f === 'tests'
        || f === '_archive' || f === '_drafts' || f === 'coverage'
        || f === 'playwright-report' || f === 'hero-options') continue;
    const full = path.join(dir, f);
    const s = fs.statSync(full);
    if (s.isDirectory()) findHtml(full, list);
    else if (f.endsWith('.html')) list.push(full);
  }
  return list;
}

let cspAdded = 0, specAdded = 0, mpAdded = 0;
for (const file of findHtml(ROOT)) {
  let src = fs.readFileSync(file, 'utf8');
  let dirty = false;

  // ── R1 CSP ──
  if (!/Content-Security-Policy/.test(src) && /<\/head>/.test(src)) {
    // Insert right after <meta charset>
    if (/<meta charset=[^>]+>/i.test(src)) {
      src = src.replace(/<meta charset=[^>]+>/i, (m) => `${m}\n${CSP_META}`);
      cspAdded++;
      dirty = true;
    } else {
      src = src.replace('</head>', `${CSP_META}\n</head>`);
      cspAdded++;
      dirty = true;
    }
  }

  // ── R3 Speculation Rules ── (only on the homepage to avoid prerender storms)
  const isHome = /\/index\.html$/.test(file.replace(/\\/g, '/'))
    && !/\/tools\//.test(file.replace(/\\/g, '/'))
    && !/\/blog\//.test(file.replace(/\\/g, '/'))
    && !/\/glossary\//.test(file.replace(/\\/g, '/'))
    && !/\/intel\//.test(file.replace(/\\/g, '/'))
    && !/\/products\//.test(file.replace(/\\/g, '/'));
  if (isHome && !/speculationrules/.test(src) && /<\/head>/.test(src)) {
    src = src.replace('</head>', `${SPECULATION_RULES}\n</head>`);
    specAdded++;
    dirty = true;
  }

  // ── R4 Modulepreload ── (only on top archetype pages to control budget)
  const isTop = /\/(index|crowagent-core|crowmark|crowcyber|crowcash|crowesg|csrd|pricing|about|contact)\.html$/
    .test(file.replace(/\\/g, '/'));
  if (isTop && !/rel="modulepreload"/.test(src) && /<\/head>/.test(src)) {
    src = src.replace('</head>', `${MODULEPRELOAD_HINTS}\n</head>`);
    mpAdded++;
    dirty = true;
  }

  if (dirty && !DRY) fs.writeFileSync(file, src);
  if (dirty) console.log(`[${DRY ? 'DRY' : 'EDIT'}] ${path.relative(ROOT, file)}`);
}

console.log(`\nR1 CSP added on ${cspAdded} files | R3 speculation on ${specAdded} | R4 modulepreload on ${mpAdded}`);
console.log(DRY ? '(dry-run — no files changed)' : 'done.');
