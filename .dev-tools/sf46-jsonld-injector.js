#!/usr/bin/env node
/**
 * SF46 P2-AF — JSON-LD structured-data injector.
 *
 * Adds two canonical JSON-LD blocks to every page that lacks them:
 *   1. Organization (sitewide; brand + sameAs) — added on every page
 *   2. Either WebSite (home) OR BreadcrumbList (every non-home page),
 *      with breadcrumb derived from the file path.
 *
 * Idempotent: won't inject if a block of the same type already exists.
 * Run after the page already has its base structure. Inserts inside
 * <head> just before </head>.
 */
const fs = require('fs');
const path = require('path');

const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..');
const BASE = 'https://crowagent.ai';

const ORG = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'CrowAgent',
  legalName: 'CrowAgent Ltd',
  url: 'https://crowagent.ai/',
  logo: 'https://crowagent.ai/Assets/logo.png',
  sameAs: [
    'https://www.linkedin.com/company/crowagent',
    'https://x.com/crowagent_ai'
  ],
  contactPoint: [{
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'hello@crowagent.ai',
    areaServed: 'GB',
    availableLanguage: ['en']
  }]
};

const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'CrowAgent',
  url: 'https://crowagent.ai/',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://crowagent.ai/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

function breadcrumbFor(routePath) {
  // routePath = "/about" or "/blog/index" or "/tools/index"
  // produce: Home → <segment titles>
  const segs = routePath.split('/').filter(s => s && s !== 'index');
  if (segs.length === 0) return null; // home
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: BASE + '/' }];
  let acc = BASE;
  segs.forEach((seg, i) => {
    acc += '/' + seg;
    const name = seg.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: i === segs.length - 1 ? undefined : acc
    });
  });
  // Clean undefined item on last
  items.forEach(it => { if (it.item === undefined) delete it.item; });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

function pathFromFile(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/').replace(/\.html$/, '');
  return '/' + rel;
}

function alreadyHasType(src, type) {
  // Looks for "@type":"X" or '"@type":"X"' in any JSON-LD script tag.
  const re = new RegExp(`"@type"\\s*:\\s*"${type}"`, 'i');
  return re.test(src);
}

function injectBlocks(file, src) {
  const route = pathFromFile(file);
  const isHome = route === '/index';
  const blocks = [];

  if (!alreadyHasType(src, 'Organization')) blocks.push(ORG);
  if (isHome) {
    if (!alreadyHasType(src, 'WebSite')) blocks.push(WEBSITE);
  } else {
    if (!alreadyHasType(src, 'BreadcrumbList')) {
      const b = breadcrumbFor(route);
      if (b) blocks.push(b);
    }
  }

  if (blocks.length === 0) return null;

  const inject = blocks.map(b =>
    `<script type="application/ld+json">${JSON.stringify(b)}</script>`
  ).join('\n');

  // Insert before </head>
  if (!src.includes('</head>')) return null;
  return src.replace('</head>', `${inject}\n</head>`);
}

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

let totalBlocks = 0;
let filesEdited = 0;

for (const file of findHtml(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const out = injectBlocks(file, src);
  if (out) {
    const blocksAdded = (out.match(/application\/ld\+json/g) || []).length
                      - (src.match(/application\/ld\+json/g) || []).length;
    totalBlocks += blocksAdded;
    filesEdited++;
    if (!DRY) fs.writeFileSync(file, out);
    console.log(`[${DRY ? 'DRY' : 'EDIT'}] ${path.relative(ROOT, file)} — added ${blocksAdded} JSON-LD block(s)`);
  }
}

console.log(`\nP2-AF: ${totalBlocks} JSON-LD blocks added across ${filesEdited} files`);
console.log(DRY ? '(dry-run — no files changed)' : 'done.');
