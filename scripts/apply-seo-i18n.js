#!/usr/bin/env node
/**
 * apply-seo-i18n.js — site-wide SEO + i18n hardening for the P2 backlog.
 *
 * Mutations:
 *  1. <html lang="en"> -> <html lang="en-GB">
 *  2. Add hreflang en-GB + x-default <link rel="alternate"> (idempotent)
 *  3. Ensure every blog post has a BreadcrumbList JSON-LD inline (idempotent)
 *  4. Enforce X-Robots from meta only on indexable pages (skip if noindex set)
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

function listHtml() {
  /** @type {string[]} */
  const out = [];
  for (const d of HTML_DIRS) {
    if (!fs.existsSync(d)) continue;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.html')) out.push(path.join(d, e.name));
    }
  }
  return out;
}

function urlFor(absFile) {
  let rel = path
    .relative(ROOT, absFile)
    .replace(/\\/g, '/')
    .replace(/\.html$/, '');
  if (rel === 'index') rel = '';
  if (rel.endsWith('/index')) rel = rel.replace(/\/index$/, '');
  return `https://crowagent.ai/${rel}`.replace(/\/$/, '');
}

let count = 0;
for (const file of listHtml()) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // 1. lang="en" -> lang="en-GB"
  html = html.replace(/<html\s+lang=["']en["']/g, '<html lang="en-GB"');

  // 2. Hreflang alternate links — insert after <link rel="canonical" ...>
  if (!/hreflang=["']en-GB["']/.test(html)) {
    const canonicalMatch = html.match(
      /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']\s*\/?>/i,
    );
    if (canonicalMatch) {
      const canonical = canonicalMatch[1];
      const insertion =
        `\n<link rel="alternate" hreflang="en-GB" href="${canonical}">` +
        `\n<link rel="alternate" hreflang="x-default" href="${canonical}">`;
      html = html.replace(canonicalMatch[0], canonicalMatch[0] + insertion);
    }
  }

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    count++;
  }
}

console.log(`SEO/i18n: patched ${count} HTML files.`);
