#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/principal-spec-validator.js
   SP.4 (2026-05-20) — Phase 1 + 2 Principal Architect spec verification.

   Asserts the EXACT visual specifications laid down in the Principal
   Architect directive:
     A) GSAP is successfully targeting `.hero-bg-earth` for the 20s
        cinematic pan in cinematic-init.js.
     B) The Navigation header uses CSS Grid `1fr auto 1fr` via the new
        .sv-nav-row primitive in sovereign-primitives.css + applied in
        nav-inject.js NAV_HTML.
     C) The Pricing Page `.toggle-row` and `.ptabs` are nested inside an
        .sv-stack--align-center (the master hero stack consolidation).

   Plus secondary gates that the spec implied:
     D) HUD elements use --z-hud (= 10).
     E) Earth CSS base state matches GSAP start frame (scale 1.05 +
        brightness/contrast lift).
     F) Pricing hero has the master .sv-container--wide .sv-stack stack.

   Exit code 0 = all true, 1 = any gate failed.
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const cinematicJs = fs.readFileSync(path.join(ROOT, 'js', 'modules', 'cinematic-init.js'), 'utf8');
const navJs       = fs.readFileSync(path.join(ROOT, 'js', 'nav-inject.js'), 'utf8');
const primCss     = fs.readFileSync(path.join(ROOT, 'Assets', 'css', 'sovereign-primitives.css'), 'utf8');
const tokensCss   = fs.readFileSync(path.join(ROOT, 'crowagent-brand-tokens.css'), 'utf8');
const stylesCss   = fs.readFileSync(path.join(ROOT, 'styles.css'), 'utf8');
const pricingHtml = fs.readFileSync(path.join(ROOT, 'pricing.html'), 'utf8');
const indexHtml   = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const aboutHtml   = fs.readFileSync(path.join(ROOT, 'about.html'), 'utf8');
const PRODUCT_HTML = ['crowagent-core', 'crowcyber', 'crowmark', 'crowcash', 'crowesg', 'csrd']
  .reduce((acc, p) => { acc[p] = fs.readFileSync(path.join(ROOT, p + '.html'), 'utf8'); return acc; }, {});

// ── A) GSAP targets .hero-bg-earth + correct timeline shape ───────────
const gA = {
  'cinematic-init.js queries .hero-bg-earth':
    /document\.querySelector\(\s*['"]\.hero-bg-earth['"]\s*\)/.test(cinematicJs),
  'gsap.to(.hero-bg-earth, …) timeline with scale:1':
    /gsap\.to\(\s*earthBg\s*,\s*\{[\s\S]*?scale:\s*1[\s\S]*?\}/.test(cinematicJs),
  'duration: 20 (20s slow cinematic pan)':
    /gsap\.to\(\s*earthBg\s*,\s*\{[\s\S]*?duration:\s*20/.test(cinematicJs),
  "ease: 'power1.out' (spec curve)":
    /gsap\.to\(\s*earthBg\s*,\s*\{[\s\S]*?ease:\s*['"]power1\.out['"]/.test(cinematicJs),
  'rotationZ: 0.5 (subtle drift)':
    /gsap\.to\(\s*earthBg\s*,\s*\{[\s\S]*?rotationZ:\s*0\.5/.test(cinematicJs),
  "wrapped in '(prefers-reduced-motion: no-preference)' matchMedia":
    /\(prefers-reduced-motion:\s*no-preference\)[\s\S]*?gsap\.to\(\s*earthBg/.test(cinematicJs),
};

// ── B) Nav grid 1fr auto 1fr ──────────────────────────────────────────
const gB = {
  '.sv-nav-row primitive defined':
    /\.sv-nav-row\s*\{[\s\S]*?display:\s*grid/.test(primCss),
  '.sv-nav-row uses grid-template-columns: 1fr auto 1fr':
    /\.sv-nav-row\s*\{[\s\S]*?grid-template-columns:\s*1fr\s+auto\s+1fr/.test(primCss),
  '.sv-nav-row__center / col 2 → justify-self: center':
    /(?:\.sv-nav-row__center|\.sv-nav-row\s*>\s*:nth-child\(2\))[\s\S]*?justify-self:\s*center/.test(primCss),
  '.sv-nav-row__end / col 3 → justify-self: end':
    /(?:\.sv-nav-row__end|\.sv-nav-row\s*>\s*:last-child)[\s\S]*?justify-self:\s*end/.test(primCss),
  'NAV_HTML applies sv-nav-row on the wrap row':
    /class="wrap sv-container sv-container--wide sv-nav-row"/.test(navJs),
};

// ── C) Pricing .toggle-row + .ptabs nested in sv-stack--align-center ──
// Extract the master hero <section class="hero …"> block from pricing.html
const heroBlockMatch = pricingHtml.match(/<section\s+class="hero[^"]*"[^>]*>[\s\S]*?<\/section>/);
const heroBlock = heroBlockMatch ? heroBlockMatch[0] : '';
const gC = {
  '<section class="hero…"> exists':
    !!heroBlock,
  'hero block contains sv-stack--align-center':
    /class="[^"]*\bsv-stack--align-center\b/.test(heroBlock),
  'hero block contains sv-stack--gap-8':
    /class="[^"]*\bsv-stack--gap-8\b/.test(heroBlock),
  '.toggle-row nested inside hero (sv-stack--align-center)':
    /sv-stack--align-center[\s\S]*?class="toggle-row/.test(heroBlock),
  '.ptabs nested inside hero (sv-stack--align-center)':
    /sv-stack--align-center[\s\S]*?class="ptabs/.test(heroBlock),
  '.pricing-banner-wrap nested inside hero':
    /sv-stack--align-center[\s\S]*?class="pricing-banner-wrap/.test(heroBlock),
  'h1 + hero-sub also inside the same hero stack':
    /sv-stack--align-center[\s\S]*?class="page-title"[\s\S]*?class="hero-sub"/.test(heroBlock),
  'no DUPLICATE .ptabs in pricing.html':
    (pricingHtml.match(/<div\s+class="ptabs[^"]*"/g) || []).length === 1,
};

// ── D) HUD z-index uses --z-hud token ─────────────────────────────────
const gD = {
  '--z-hud token defined in brand-tokens.css':
    /--z-hud:\s*10/.test(tokensCss),
  '.hero-hud-counter uses var(--z-hud)':
    /\.hero-hud-counter[\s\S]{0,300}z-index:\s*var\(--z-hud\)/.test(stylesCss),
  '.hero-orbit-stage uses var(--z-hud)':
    /\.hero-orbit-stage[\s\S]{0,300}z-index:\s*var\(--z-hud\)/.test(stylesCss),
  '.hero-hud-pulse uses var(--z-hud)':
    /\.hero-hud-pulse[\s\S]{0,300}z-index:\s*var\(--z-hud\)/.test(stylesCss),
};

// ── E) Earth base CSS matches GSAP start frame ────────────────────────
const earthCssBlock = (stylesCss.match(/\.hero-hud \.hero-bg-earth\s*\{[\s\S]*?\}/) || [''])[0];
const gE = {
  'Earth base: transform: scale(1.05) translateZ(0)':
    /transform:\s*scale\(1\.05\)\s+translateZ\(0\)/.test(earthCssBlock),
  'Earth base: filter: brightness(1.1) contrast(1.1)':
    /filter:[^;]*brightness\(1\.1\)[^;]*contrast\(1\.1\)/.test(earthCssBlock),
  'Earth has will-change: transform (compositor layer)':
    /will-change:\s*transform/.test(earthCssBlock),
};

// ── F) Index hero structural primitives (Phase 1 carry-over) ──────────
const gF = {
  'index.html: <header id="ca-nav" class="sv-nav" role="banner">':
    /<header[^>]*id="ca-nav"[^>]*class="[^"]*\bsv-nav\b[^"]*"[^>]*role="banner"/.test(indexHtml),
  // 2026-05-20: post-GEO.A single-column centred hero (was sv-grid--lg
  // 2-col, collapsed for centred Stripe/Apple pattern + 258px drift fix).
  'index.html: hero uses sv-stack--align-center (single-column centred)':
    /class="hero-inner sv-stack sv-stack--align-center[^"]*"/.test(indexHtml),
  'index.html: hero-col-copy uses sv-stack--align-center':
    /class="hero-col-copy sv-stack[^"]*sv-stack--align-center"/.test(indexHtml),
  'index.html: no fake "Designed with input from UK SMEs" claim':
    !/Designed with input from UK SMEs/i.test(indexHtml),
  'index.html: zero inline <style> blocks':
    (indexHtml.match(/<style\b[^>]*>[\s\S]*?<\/style>/g) || []).length === 0,
};

// ── Verdict ────────────────────────────────────────────────────────────
function summarize(label, group) {
  const total = Object.values(group).length;
  const passed = Object.values(group).filter(Boolean).length;
  console.log('\n▸ ' + label + ': ' + passed + '/' + total);
  for (const [k, v] of Object.entries(group)) console.log('     ' + (v ? '✓' : '✗') + '  ' + k);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  PRINCIPAL SPEC VALIDATOR — Phases 1 & 2');
console.log('═══════════════════════════════════════════════════════════════');
// ── G) Phase 3: About page MVV + Company Details (legacy extinction) ──
const gG = {
  'about.html: ZERO .f10-mvv-card legacy class':
    (aboutHtml.match(/class="[^"]*\bf10-mvv-card\b/g) || []).length === 0,
  'about.html: ZERO .f10-mvv-grid legacy wrapper':
    (aboutHtml.match(/class="[^"]*\bf10-mvv-grid\b/g) || []).length === 0,
  'about.html: MVV master grid uses .sv-container--standard .sv-grid--md':
    /class="[^"]*\bsv-container\b[^"]*\bsv-container--standard\b[^"]*\bsv-grid\b[^"]*\bsv-grid--md\b/.test(aboutHtml),
  'about.html: 3× .sv-card.sv-card--accent in MVV grid':
    (aboutHtml.match(/<article class="sv-card sv-card--accent ms-reveal" data-stagger="\d+">/g) || []).length === 3,
  'about.html: MVV cards use sovereign slots (.sv-card__eyebrow + __title + __body)':
    /sv-card__eyebrow[\s\S]*?sv-card__title[\s\S]*?sv-card__body/.test(aboutHtml),
  'about.html: Company Details uses .sv-card.sv-card--elevated':
    /<article[^>]*class="[^"]*\bsv-card\b[^"]*\bsv-card--elevated\b/.test(aboutHtml) &&
      /id="company-details"/.test(aboutHtml),
  'about.html: Company Details rows wrapped in .sv-stack--gap-4':
    /class="sv-stack sv-stack--gap-4 sv-card__body[^"]*"/.test(aboutHtml),
  'about.html: section wrapper uses .sv-section primitive':
    /<section class="sv-section[^"]*"/.test(aboutHtml),
};

// ── H) Phase 3: Product hero sovereign media frame (6 pages) ──────────
const gH = {};
for (const product of ['crowagent-core', 'crowcyber', 'crowmark', 'crowcash', 'crowesg', 'csrd']) {
  const html = PRODUCT_HTML[product];
  gH[product + '.html: .sv-media-frame--cinematic in hero'] =
    /class="sv-media-frame sv-media-frame--cinematic hero-visual"/.test(html);
  gH[product + '.html: real PNG src from /Assets/marketing-screenshots/'] =
    /src="\/Assets\/marketing-screenshots\/[a-zA-Z0-9._@-]+\.png"/.test(html) &&
    new RegExp('data-product="' + product + '"').test(html);
}

summarize('A) GSAP cinematic earth pan', gA);
summarize('B) Header navigation grid 1fr auto 1fr', gB);
summarize('C) Pricing master hero stack consolidation', gC);
summarize('D) HUD z-index ladder (--z-hud token)', gD);
summarize('E) Earth CSS base = GSAP start frame', gE);
summarize('F) Phase-1 carry-over (#ca-nav / index hero)', gF);
summarize('G) PHASE 3 — About MVV + Company Details reconciled', gG);
summarize('H) PHASE 3 — 6 product heroes use .sv-media-frame--cinematic', gH);

const all = { ...gA, ...gB, ...gC, ...gD, ...gE, ...gF, ...gG, ...gH };
const passed = Object.values(all).filter(Boolean).length;
const total = Object.values(all).length;
const allPass = passed === total;

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  TOTAL: ' + passed + '/' + total);
console.log(allPass
  ? '  RESULT: PRINCIPAL SPEC SHIPPED — Phases 1 & 2 GREEN'
  : '  RESULT: SPEC GAPS DETECTED — see ✗ above');
console.log('═══════════════════════════════════════════════════════════════');

process.exit(allPass ? 0 : 1);
