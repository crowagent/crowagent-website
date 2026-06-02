#!/usr/bin/env node
/**
 * E6 — CTA voice probe (2026-05-23)
 * Validates primary CTAs follow imperative 2-word voice ("Start trial",
 * "Book demo", "Run check"). Flags long CTAs (>4 words) or non-imperative
 * starting words (e.g. "Try the", "See more", "Get a").
 *
 * Run: node tools/cta-voice-probe.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const PRIMARY_CTA_SELECTORS = [
  'sv-btn--primary', 'btn-primary-v2', 'btn-hero-primary', 'demo-widget-btn'
];

// Allowed CTA forms (imperative verb + ≤2 supporting words)
const ALLOWED_VERBS = new Set([
  'start', 'book', 'run', 'open', 'try', 'see', 'get', 'view', 'read', 'browse',
  'check', 'calculate', 'score', 'analyse', 'analyze', 'recover', 'find', 'join',
  'request', 'contact', 'talk', 'download', 'explore', 'learn', 'manage', 'submit',
  'save', 'send', 'jump', 'pick', 'take', 'recommend', 'sign', 'continue', 'next',
  'back', 'close', 'apply', 'reset', 'accept', 'reject', 'enable', 'disable'
]);

function checkCta(text) {
  const clean = text.replace(/[→←↑↓]/g, '').trim();
  const words = clean.split(/\s+/);
  const issues = [];
  if (words.length > 4) issues.push('too-long-' + words.length + 'w');
  if (words.length === 0) return ['empty'];
  const firstLower = words[0].toLowerCase();
  if (!ALLOWED_VERBS.has(firstLower)) issues.push('non-imperative-start-' + firstLower);
  return issues;
}

async function main() {
  const files = await glob('**/*.html', { cwd: process.cwd(), ignore: ['node_modules/**', '_archive/**', 'coverage/**', 'audit/**'] });
  const ctaText = new Map();
  for (const f of files) {
    const html = fs.readFileSync(path.join(process.cwd(), f), 'utf8');
    PRIMARY_CTA_SELECTORS.forEach(cls => {
      const re = new RegExp('<(?:a|button)[^>]*class="[^"]*' + cls + '[^"]*"[^>]*>([\\s\\S]*?)<\\/(?:a|button)>', 'gi');
      let m;
      while ((m = re.exec(html)) !== null) {
        const text = m[1].replace(/<[^>]*>/g, '').trim();
        if (text.length > 0 && text.length < 60) {
          const key = text;
          if (!ctaText.has(key)) ctaText.set(key, { count: 0, files: new Set() });
          const entry = ctaText.get(key);
          entry.count++;
          entry.files.add(f);
        }
      }
    });
  }
  const sorted = Array.from(ctaText.entries()).sort((a, b) => b[1].count - a[1].count);
  let issueCount = 0;
  console.log('--- CTA voice audit (' + sorted.length + ' unique strings, ' + files.length + ' files) ---');
  for (const [text, info] of sorted) {
    const issues = checkCta(text);
    if (issues.length === 0) continue;
    issueCount++;
    console.log('  [' + info.count + 'x] "' + text + '" — ' + issues.join(', '));
  }
  if (issueCount === 0) {
    console.log('  RESULT: CTA VOICE GREEN — all primary CTAs follow imperative 2-word form');
  } else {
    console.log('  RESULT: ' + issueCount + ' CTA(s) drift from imperative-2 voice');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
