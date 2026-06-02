#!/usr/bin/env node
/**
 * SF46 Phase 5 — Strategic cleanup per founder verdict 2026-05-19.
 *
 * Removals + surgical edits per Website-issues-19052026.md:
 *   1. Remove `.ca-newsletter` from home, pricing, partners (keep about + contact)
 *   2. Remove `.ca-logo-wall` from every page (partners, home, about)
 *   3. Remove 3 partners placements: "Customer stories · coming soon" block
 *      and "Built for UK property managers..." caption and "Coming Q3 2026" card
 *   4. Add chapter nav to csrd.html + crowesg.html
 *   5. Remove "UK compliance terms in plain English" headline tagline from glossary
 *   6. Remove `<span class="hero-demo-slot__hint">Hover to play. Drop a 16:9 demo video here.</span>`
 *      from all product pages
 *
 * Idempotent.
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

let summary = [];

function edit(file, label, fn) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) { summary.push(`MISS ${file} (${label})`); return; }
  const before = fs.readFileSync(full, 'utf8');
  const after = fn(before);
  if (after !== before) {
    fs.writeFileSync(full, after);
    summary.push(`EDIT ${file} (${label})`);
  } else {
    summary.push(`NOOP ${file} (${label})`);
  }
}

// 1. Remove ca-newsletter from home, pricing, partners (keep about + contact)
for (const f of ['index.html', 'pricing.html', 'partners.html']) {
  edit(f, 'remove newsletter', (s) => {
    return s.replace(/<!-- SF46 W7 \(2026-05-19\) — Newsletter signup module -->[\s\S]*?<\/aside>\s*/g, '');
  });
}

// 2. Remove ca-logo-wall from every page that has it
for (const f of ['partners.html', 'index.html', 'about.html']) {
  edit(f, 'remove logo wall', (s) => {
    return s.replace(/<!-- SF46 W8 \(2026-05-19\)[^>]*-->[\s\S]*?<\/section>\s*/g, '');
  });
}

// 3. Remove Z1 case-study + S4 coming-soon from partners
edit('partners.html', 'remove Z1 case studies + S4 coming-soon', (s) => {
  // Strip the entire SF46 Z1 section
  return s.replace(/<!-- SF46 Z1 \(2026-05-19\)[^>]*-->[\s\S]*?<\/section>\s*/g, '');
});

// 4. Add chapter nav to csrd.html + crowesg.html
const CHAPTER_NAV = `<!-- SF46 W11 (2026-05-19) — Chapter nav -->
<nav class="ca-chapter-nav" aria-label="Page chapters">
  <ol class="ca-chapter-nav__list">
    <li><a class="ca-chapter-nav__link" href="#hero" aria-current="true">Overview</a></li>
    <li><a class="ca-chapter-nav__link" href="#features">Features</a></li>
    <li><a class="ca-chapter-nav__link" href="#how-it-works">How it works</a></li>
    <li><a class="ca-chapter-nav__link" href="#pricing-teaser">Pricing</a></li>
    <li><a class="ca-chapter-nav__link" href="#faq">FAQ</a></li>
  </ol>
</nav>

`;

for (const [f, anchor] of [['csrd.html', /<section class="hero hero-product/], ['crowesg.html', /<section class="hero hero-product/]]) {
  edit(f, 'add chapter nav', (s) => {
    if (/ca-chapter-nav/.test(s)) return s; // idempotent
    return s.replace(anchor, (match) => {
      return CHAPTER_NAV + '<section id="hero" class="ca-chapter-section ' + match.replace('<section ', '').replace(/^class="/, 'class="');
    }).replace('class="class="', 'class="');
  });
}

// 5. Remove glossary headline tagline
edit('glossary/index.html', 'remove headline tagline', (s) => {
  // Match either inside p.hero-sub or h2 sub
  s = s.replace(/UK compliance terms in plain English\.?/g, '');
  return s;
});

// 6. Remove "Hover to play. Drop a 16:9 demo video here." across product pages
for (const f of ['crowagent-core.html', 'crowmark.html', 'crowcyber.html', 'crowcash.html', 'crowesg.html', 'csrd.html']) {
  edit(f, 'remove video placeholder hint', (s) => {
    return s.replace(/<span class="hero-demo-slot__hint">Hover to play\. Drop a 16:9 demo video here\.<\/span>\s*/g, '');
  });
}

console.log(summary.join('\n'));
console.log(`\nTotal: ${summary.filter(x => x.startsWith('EDIT')).length} edits`);
