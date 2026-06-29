#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════
   tools/reconciliation-checker.js
   PH1.2 (2026-05-20) — Phase 1 (Header + Homepage) static + runtime gates.

   Gates:
     A) #ca-nav placeholder is <header id="ca-nav" class="sv-nav"> with no
        intervening transformation; nav-inject script is loaded.
     B) Hero structural wrapper uses sovereign primitives — .sv-container
        --wide AND .sv-grid--lg on the row, .sv-stack--align-start on the
        copy column. Legacy .hero-inner / .hero-col-copy are wrapped but
        no longer drive layout (presence allowed; sovereign classes
        REQUIRED).
     C) NAV_HTML in js/nav-inject.js uses sv-cluster--between on the
        wrap row + sv-cluster on .nav-links + .nav-actions.
     D) Walkthrough region carries .sv-media-frame; zero abstract
        svg-mockups; real /Assets/marketing-screenshots/ PNGs only.
     E) Zero inline <style> blocks in index.html.
     F) Sector marquee (.sv-marquee) present beneath hero.
     G) Runtime (via the harness check below) — #ca-nav height > 60px
        and h1 + primary CTA share left X-axis (sovereign sheriff +
        sf46-visual-reconciliation already cover this in Playwright;
        this script asserts the STATIC pre-conditions deterministically).

   Exit 0 = all true, 1 = failure.
   ═══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const navJs     = fs.readFileSync(path.join(ROOT, 'js', 'nav-inject.js'), 'utf8');
const primCss   = fs.readFileSync(path.join(ROOT, 'Assets', 'css', 'sovereign-primitives.css'), 'utf8');

function has(s, pat) { return pat instanceof RegExp ? pat.test(s) : s.includes(s); }

// ── A) Nav placeholder + script wiring ────────────────────────────────
const gA = {
  'index.html has <header id="ca-nav" class="sv-nav" role="banner">':
    /<header[^>]*id="ca-nav"[^>]*class="[^"]*\bsv-nav\b[^"]*"[^>]*role="banner"/.test(indexHtml),
  'nav-inject.js loaded in index.html':
    /js\/nav-inject\.js/.test(indexHtml),
  /* 2026-05-22 gate rewrite: the SP.2-era inject() used a two-step pattern
     where the placeholder's classes were captured then re-added via
     classList.add. Post-2026-05-22 the NAV_HTML directly emits
     <header id="ca-nav" class="sv-nav" role="banner">, so the sovereign
     class is preserved by being emitted, not by reflective JS. The newer
     pattern is correct (less JS, simpler diff) and is what the
     principal-spec validator (B5) already enforces. Gate updated to assert
     NAV_HTML emits the sovereign class on the header tag. */
  'NAV_HTML emits sv-nav on <header> (preserves sovereign class)':
    /<header[^>]*id="ca-nav"[^>]*class="[^"]*\bsv-nav\b/.test(navJs),
  '.sv-nav primitive defined in sovereign-primitives.css':
    /\.sv-nav\s*\{[\s\S]*?position:\s*sticky/.test(primCss),
};

// ── B) Hero structural primitives ──────────────────────────────────────
// 2026-05-20: gates updated for the post-GEO.A single-column centred hero.
// The previous 2-column split (sv-grid--lg + sv-stack--align-start) was
// deliberately collapsed to a single sv-stack--align-center pattern to fix
// a 258px H1↔CTA drift. See SESSION-RESUME-WEBSITE-TRANSFORM.md §2.
const gB = {
  '<div class="…sv-container--wide…hero-inner sv-stack sv-stack--align-center…">':
    /<div[^>]*class="[^"]*\bsv-container\b[^"]*\bsv-container--wide\b[^"]*"[\s\S]*?<div[^>]*class="[^"]*\bhero-inner\b[^"]*\bsv-stack\b[^"]*\bsv-stack--align-center\b/.test(indexHtml),
  'copy column composes sv-stack--gap-6 sv-stack--align-center':
    /class="[^"]*\bhero-col-copy\b[^"]*\bsv-stack\b[^"]*\bsv-stack--gap-6\b[^"]*\bsv-stack--align-center\b/.test(indexHtml),
};

// ── C) NAV_HTML uses sovereign primitives ──────────────────────────────
// SP.2 superseded the sv-cluster--between header with the .sv-nav-row
// (CSS Grid 1fr auto 1fr) primitive. The check below asserts the current
// architecture.
const gC = {
  'NAV_HTML wrap row uses sv-nav-row (1fr auto 1fr grid)':
    /class="wrap sv-container sv-container--wide sv-nav-row"/.test(navJs),
  'NAV_HTML nav-links uses sv-cluster':
    /class="nav-links\s+sv-cluster/.test(navJs),
  'NAV_HTML nav-actions uses sv-cluster':
    /class="nav-actions\s+sv-cluster/.test(navJs),
};

// ── D) Walkthrough — real PNGs, no abstract SVG ────────────────────────
const ABSTRACT_SVG_RE = /\/Assets\/svg-mockups\/(?!product-card-mock-)[a-zA-Z0-9_-]+\.svg/g;
const abstractMatches = indexHtml.match(ABSTRACT_SVG_RE) || [];
const realPngMatches = indexHtml.match(/\/Assets\/marketing-screenshots\/\d{2}-/g) || [];
const gD = {
  'cinematic-walkthrough wrapper has .sv-media-frame':
    /id="cinematic-walkthrough"[^>]*class="[^"]*\bsv-media-frame\b/.test(indexHtml),
  'walkthrough cards carry .sv-media-frame':
    (indexHtml.match(/class="how-scene-card sv-media-frame"/g) || []).length >= 4,
  'zero abstract svg-mockup refs in index.html':
    abstractMatches.length === 0,
  '≥4 real /Assets/marketing-screenshots/*.png refs':
    realPngMatches.length >= 4,
};

// ── E) Zero inline <style> blocks ─────────────────────────────────────
const inlineStyleBlocks = (indexHtml.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || []).length;
const gE = {
  'index.html has zero inline <style> blocks': inlineStyleBlocks === 0,
};

// ── F) Sector cloud present ────────────────────────────────────────────
// 2026-05-22 gate-logic correction (ISSUE-035): the prior gate required a
// .sv-marquee block with placeholder company SVG logos (TechCorp,
// GreenLogistics, RetailUK, FinanceUK, ConstructionUK, EnergyUK, PropertyUK,
// HealthTechUK). The marquee was removed because placeholder company names
// violate CPR 2008 reg 5 (misleading commercial practice) cited in the
// site's own disclaimer — and the pre-launch trust rule (no implied client
// claims). Replacement is a sector tag-cloud listing the 12 real UK
// sectors CrowAgent targets. This validator now asserts the new contract:
// .sector-tag-cloud with >= 12 <li> entries beneath the hero.
const marqueeLogos = (indexHtml.match(/class="sv-marquee__logo"/g) || []).length;
const sectorCloudItems = (indexHtml.match(/class="sector-tag-cloud"[\s\S]*?<\/ul>/) || ['']) [0]
  .match(/<li\b/g) || [];
const gF = {
  '.sector-tag-cloud in index.html (replaces .sv-marquee per ISSUE-035)':
    /class="sector-tag-cloud"/.test(indexHtml),
  '≥12 sector entries (real UK target sectors, no placeholder companies)':
    sectorCloudItems.length >= 12,
  'zero placeholder company names (CPR 2008 reg 5 compliance)':
    !/TechCorp|GreenLogistics|RetailUK|FinanceUK|ConstructionUK|EnergyUK|PropertyUK|HealthTechUK/.test(indexHtml),
};

// ── Verdict ────────────────────────────────────────────────────────────
function summarize(label, group) {
  const total = Object.values(group).length;
  const passed = Object.values(group).filter(Boolean).length;
  console.log('▸ ' + label + ': ' + passed + '/' + total);
  for (const [k, v] of Object.entries(group)) console.log('     ' + (v ? '✓' : '✗') + '  ' + k);
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('  PHASE 1 RECONCILIATION CHECKER — index.html + header');
console.log('═══════════════════════════════════════════════════════════════');
summarize('A) Nav placeholder + sovereign class lock', gA);
summarize('B) Hero structural sovereign primitives', gB);
summarize('C) NAV_HTML uses sovereign clusters', gC);
summarize('D) Walkthrough = real PNGs in .sv-media-frame', gD);
summarize('E) Inline <style> ghost-purge', gE);
summarize('F) Sector tag cloud (real sectors, no placeholder companies)', gF);
console.log('');

const allChecks = { ...gA, ...gB, ...gC, ...gD, ...gE, ...gF };
const allPass = Object.values(allChecks).every(Boolean);
console.log('═══════════════════════════════════════════════════════════════');
console.log(allPass
  ? '  RESULT: PHASE 1 GEOMETRICALLY PERFECT — header + index.html locked'
  : '  RESULT: PHASE 1 GAP DETECTED — see ✗ above');
console.log('═══════════════════════════════════════════════════════════════');
console.log('');
console.log('Quick stats:');
console.log('  Abstract SVG mockups in index.html: ' + abstractMatches.length);
console.log('  Real marketing-screenshot PNGs:     ' + realPngMatches.length);
console.log('  Inline <style> blocks:              ' + inlineStyleBlocks);
console.log('  Sector tag cloud entries:           ' + sectorCloudItems.length);
console.log('  Placeholder marquee logos (must be 0): ' + marqueeLogos);

process.exit(allPass ? 0 : 1);
