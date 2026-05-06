#!/usr/bin/env node
/**
 * apply-p2-p3-polish.js — One-shot site-wide polish pass for the P2/P3 audit
 * backlog (CROWAGENT-AI-AUDIT-2026-04-26.md).
 *
 * Mutations performed on every *.html file under repo root, /blog, /products,
 * /glossary, /intel:
 *   1. Normalise <meta name="theme-color"> to canonical #0A1F3A (P3 token drift)
 *   2. Add <meta name="color-scheme" content="dark"> if missing
 *   3. Add <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0CC9A8">
 *   4. Add <meta name="msapplication-config" content="/browserconfig.xml">
 *   5. Add multi-size favicon links (180 iPad apple-touch-icon)
 *   6. Add target="_blank" -> rel="noopener noreferrer" where rel is missing
 *      (DEF-015 sweep — applies to any straggler not already touched)
 *   7. Add loading="lazy" + decoding="async" to <img> tags below the fold
 *      (skips first <img> per file as a heuristic LCP candidate)
 *   8. Strict autocomplete normalisation on common form inputs
 *
 * Run: node scripts/apply-p2-p3-polish.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML_DIRS = [
  ROOT,
  path.join(ROOT, 'blog'),
  path.join(ROOT, 'products'),
  path.join(ROOT, 'glossary'),
  path.join(ROOT, 'intel'),
  path.join(ROOT, 'intel', 'mees-tracker'),
  path.join(ROOT, 'intel', 'cyber-essentials-tracker'),
];

const CANONICAL_THEME = '#0A1F3A';

/** @type {{file: string, changes: string[]}[]} */
const reports = [];

function listHtmlFiles() {
  /** @type {string[]} */
  const files = [];
  for (const dir of HTML_DIRS) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith('.html')) {
        files.push(path.join(dir, e.name));
      }
    }
  }
  return files;
}

function patch(file) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  /** @type {string[]} */
  const changes = [];

  // 1. Normalise theme-color
  html = html.replace(
    /<meta\s+name=["']theme-color["']\s+content=["']#[0-9A-Fa-f]{3,8}["']\s*\/?>/g,
    (m) => {
      const want = `<meta name="theme-color" content="${CANONICAL_THEME}">`;
      if (m !== want) changes.push('theme-color normalised');
      return want;
    },
  );

  // 2. color-scheme meta
  if (!/name=["']color-scheme["']/.test(html)) {
    html = html.replace(
      /(<meta\s+name=["']theme-color["'][^>]*>)/,
      `$1\n<meta name="color-scheme" content="dark">`,
    );
    if (html !== original) changes.push('color-scheme meta added');
  }

  // 3. mask-icon link
  if (!/rel=["']mask-icon["']/.test(html)) {
    html = html.replace(
      /(<link\s+rel=["']apple-touch-icon["'][^>]*>)/,
      `$1<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#0CC9A8">`,
    );
    if (html !== original) changes.push('mask-icon added');
  }

  // 4. msapplication-config
  if (!/msapplication-config/.test(html)) {
    html = html.replace(
      /(<meta\s+name=["']theme-color["'][^>]*>)/,
      `$1\n<meta name="msapplication-config" content="/browserconfig.xml">`,
    );
    if (html !== original) changes.push('msapplication-config added');
  }

  // 5. apple-touch-icon 180 size (iPad). If apple-touch-icon exists without sizes attribute, add it.
  if (
    /<link\s+rel=["']apple-touch-icon["']\s+href=["']\/favicon-192\.png["']>/.test(
      html,
    ) &&
    !/apple-touch-icon[^>]*sizes/.test(html)
  ) {
    html = html.replace(
      /<link\s+rel=["']apple-touch-icon["']\s+href=["']\/favicon-192\.png["']>/g,
      '<link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png">',
    );
    changes.push('apple-touch-icon size attr added');
  }

  // 6. target="_blank" missing rel — final mop-up
  html = html.replace(
    /target=["']_blank["'](?![^>]*\brel=)/g,
    'target="_blank" rel="noopener noreferrer"',
  );

  // 7. img loading="lazy" — skip first occurrence (LCP candidate)
  let firstImgSeen = false;
  html = html.replace(/<img\b([^>]*)>/g, (m, attrs) => {
    if (!firstImgSeen) {
      firstImgSeen = true;
      return m;
    }
    if (/\bloading=/.test(attrs)) return m;
    if (/fetchpriority=["']high["']/.test(attrs)) return m;
    const newAttrs =
      attrs +
      (/\bdecoding=/.test(attrs) ? '' : ' decoding="async"') +
      ' loading="lazy"';
    return `<img${newAttrs}>`;
  });
  if (html !== original && !changes.includes('lazy-load img')) {
    if (/loading="lazy"/.test(html) && !/loading="lazy"/.test(original)) {
      changes.push('lazy-load img');
    }
  }

  // 8. autocomplete on common inputs (where missing)
  html = html.replace(/<input\b([^>]*)>/g, (m, attrs) => {
    if (/autocomplete=/.test(attrs)) return m;
    if (/type=["']hidden["']/.test(attrs)) return m;
    let ac = null;
    if (/type=["']email["']/.test(attrs) || /name=["']email["']/.test(attrs)) {
      ac = 'email';
    } else if (
      /name=["']name["']/.test(attrs) ||
      /id=["']name["']/.test(attrs)
    ) {
      ac = 'name';
    } else if (
      /name=["']company["']/.test(attrs) ||
      /id=["']company["']/.test(attrs)
    ) {
      ac = 'organization';
    } else if (
      /name=["']postcode["']/.test(attrs) ||
      /id=["']postcode["']/.test(attrs) ||
      /id=["']demo-postcode["']/.test(attrs) ||
      /id=["']cp-postcode["']/.test(attrs)
    ) {
      ac = 'postal-code';
    } else if (
      /name=["']tel["']/.test(attrs) ||
      /name=["']phone["']/.test(attrs) ||
      /id=["']phone["']/.test(attrs)
    ) {
      ac = 'tel';
    }
    if (!ac) return m;
    return `<input${attrs} autocomplete="${ac}">`;
  });

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    reports.push({ file: path.relative(ROOT, file), changes });
  }
}

function main() {
  const files = listHtmlFiles();
  for (const f of files) {
    try {
      patch(f);
    } catch (e) {
      console.error('Failed:', f, e instanceof Error ? e.message : String(e));
    }
  }
  for (const r of reports) {
    console.log(r.file, '->', r.changes.join('; ') || '(structural)');
  }
  console.log(`\nPatched ${reports.length} of ${files.length} HTML files.`);
}

main();
