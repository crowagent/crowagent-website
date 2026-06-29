#!/usr/bin/env node
/**
 * SF46 U1 — AI-readability audit. Identifies pages missing Article /
 * FAQPage / HowTo schema beyond the baseline Organization + BreadcrumbList
 * already injected by P2-AF.
 */
const fs = require('fs');
const path = require('path');

function walk(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    if (f.startsWith('.') || ['node_modules','tests','_archive','_drafts','coverage','playwright-report','hero-options'].includes(f)) continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (f.endsWith('.html')) list.push(full);
  }
  return list;
}

const ROOT = path.join(__dirname, '..');
const need = { article: [], faqpage: [], howto: [] };

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const isBlogPost = rel.startsWith('blog/') && !rel.endsWith('blog/index.html');
  const isFaq = rel === 'faq.html';
  const isMethodology = rel.includes('methodology') || rel.startsWith('tools/');
  const hasArticle  = /"@type"\s*:\s*"(Article|BlogPosting)"/.test(src);
  const hasFaqPage  = /"@type"\s*:\s*"FAQPage"/.test(src);
  const hasHowTo    = /"@type"\s*:\s*"HowTo"/.test(src);
  if (isBlogPost && !hasArticle) need.article.push(rel);
  if (isFaq && !hasFaqPage)      need.faqpage.push(rel);
  if (isMethodology && !hasHowTo) need.howto.push(rel);
}

console.log(`Blog posts missing Article schema: ${need.article.length}`);
need.article.slice(0, 10).forEach(f => console.log(' -', f));
console.log(`\nFAQ pages missing FAQPage schema: ${need.faqpage.length}`);
need.faqpage.forEach(f => console.log(' -', f));
console.log(`\nMethodology/tool pages missing HowTo schema: ${need.howto.length}`);
need.howto.slice(0, 10).forEach(f => console.log(' -', f));
