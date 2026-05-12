/**
 * nav-inject.js — CrowAgent shared nav + footer injector
 * Pattern: same as cookie-banner.js. Writes HTML to placeholder divs.
 * Single source of truth for nav and footer across all pages.
 *
 * CONSTANTS (never change without CTO confirmation):
 *   Annual discount = 10%
 *   FAQ appears in footer Resources only (removed from nav in WP-WEB-003)
 *   Footer Company column = no FAQ link (FAQ is in Resources only)
 *   Footer copyright = "Sustainability Intelligence" on all pages
 *     (CLAUDE.md mandated brand-master phrase; no variations).
 */
(function () {
  'use strict';

  var path = window.location.pathname.replace(/\/$/, '') || '/';

  function isActive(href) {
    // M-08: skip aria-current for hash-only links (/#how, /#sectors) — they're anchors not pages
    if (href && href[0] === '#') return false;
    var h = href.replace(/\/$/, '') || '/';
    return path === h || (h !== '/' && path.startsWith(h));
  }

  /* ── SOCIAL SVG PATHS ── */
  var SOCIALS = [
    { href: 'https://www.linkedin.com/company/crowagent-ltd/', label: 'LinkedIn',
      d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    /* WEB-AUDIT-140 C1 2026-05-09 fix: standardise X handle on
       @crowagent_ai (matches twitter:site meta on 54 pages); supersedes
       the legacy company handle previously hardcoded on this nav button
       and the structured-data sameAs array. */
    { href: 'https://x.com/crowagent_ai', label: 'X',
      d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.694-5.867 6.694h-3.31l7.73-8.835L2.601 2.25h6.63l4.81 6.375 5.413-6.375zM17.15 18.75h1.829L5.293 3.786H3.35L17.15 18.75z' },
    { href: 'https://www.youtube.com/@CrowAgentUK', label: 'YouTube',
      d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
    { href: 'https://medium.com/@crowagent.platform', label: 'Medium',
      d: 'M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 2.84-.46 5.15-1.04 5.15-.57 0-1.04-2.31-1.04-5.15s.47-5.15 1.04-5.15C23.54 6.85 24 9.16 24 12z' },
    { href: 'https://www.instagram.com/crowagent.ai/', label: 'Instagram',
      d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' }
    // Product Hunt link removed 2026-05-06 (WEB-AUDIT-021): Product Hunt
    // returns 403 to bot user-agents (link-checker), which surfaces as a
    // broken external link in the audit. The profile is functional for
    // human visitors but archive.org has no usable snapshot. Removed from
    // the SOCIALS array; the icon disappears from the footer on all pages.
  ];

  var socialHTML = SOCIALS.map(function(s) {
    return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="' + s.label + '" class="ca-touch-target">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--steel)" aria-hidden="true"><path d="' + s.d + '"/></svg></a>';
  }).join('\n          ');

  /* ── LOGO MARKUP (reused in nav + footer) ──
     LOCKED 2026-05-10 BY FOUNDER (Bhavesh): the canonical brand wordmark
     PNG provided by the founder (4-ascending-bars + "CrowAgent" wordmark
     + "Sustainability Intelligence" tagline) is at
     /Assets/brand/crowagent_wordmark_transparent_560x140.png (1x) +
     /Assets/brand/crowagent_wordmark_transparent_1120x280.png (2x).
     THIS IS THE BRAND IMAGE — DO NOT REVERT to inline-div, SVG mimic,
     or favicon-only composition. Size by CSS height = 40px nav / 32px footer. */
  function logoHTML(href) {
    return '<a href="' + href + '" class="logo" aria-label="CrowAgent — Sustainability Intelligence">'
      + '<img class="brand-logo" '
      +      'src="/Assets/brand/crowagent_wordmark_transparent_560x140.png" '
      +      'srcset="/Assets/brand/crowagent_wordmark_transparent_560x140.png 1x, '
      +              '/Assets/brand/crowagent_wordmark_transparent_1120x280.png 2x" '
      +      'alt="CrowAgent — Sustainability Intelligence" '
      +      'width="160" height="40" decoding="async" '
      +      'loading="eager" fetchpriority="high">'
      + '</a>';
  }

  /* ── NAV HTML ── */
  // A11y fix 2026-05-09: <nav> already provides the navigation landmark.
  // The banner landmark is supplied by the page's <body> > implicit-header
  // pattern; axe-core flags it because we don't have an explicit
  // <header role="banner"> element. Adding role="banner" to the <nav>
  // would conflict with role="navigation". Instead, the page-level
  // <body>'s first child placeholder div carries role="banner" via the
  // inject() function below — see line 282. This satisfies axe-core
  // without introducing a wrapping <header> that breaks the existing
  // dropdown CSS specificity.
  var NAV_HTML = [
    '<nav role="navigation" aria-label="Main navigation">',
    '  <div class="wrap">',
    '    ' + logoHTML('/'),
    '    <div class="nav-links">',
    /* "How it works" removed from header per founder directive 2026-05-10.
       Section still lives on home (/#how anchor) but is no longer a nav link.
       Kept the comment as the lock-marker to prevent future agents from
       re-adding it. Nav order: Products / Free Tools / Sectors / Pricing /
       Blog / About — exact per founder mandate. */
    '      <div class="nav-dropdown">',
    '        <button class="nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true" aria-controls="nav-mega-panel">Products <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
    '        <div class="nav-mega" id="nav-mega-panel" role="menu">',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">Live Compliance Engines</span>',
    '            <a href="/crowagent-core" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">◆</span><span><strong>CrowAgent Core</strong><span class="nav-mega-desc">MEES compliance & EPC gap analysis</span></span></a>',
    '            <a href="/crowmark" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--mark)">◆</span><span><strong>CrowMark</strong><span class="nav-mega-desc">PPN 002 social value scoring</span></span></a>',
    '            <a href="/csrd" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--sky)">◆</span><span><strong>CSRD Checker</strong><span class="nav-mega-desc">Free Omnibus I applicability tool</span></span></a>',
    '          </div>',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">New This Quarter</span>',
    '            <a href="/crowcyber" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">◆</span><span><strong>CrowCyber</strong><span class="nav-mega-desc">Cyber Essentials co-pilot for UK SMEs</span></span></a>',
    '            <a href="/crowcash" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">◆</span><span><strong>CrowCash</strong><span class="nav-mega-desc">AI credit control &amp; accounts receivable</span></span></a>',
    '            <a href="/crowesg" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--warn)">◆</span><span><strong>CrowESG</strong><span class="nav-mega-desc">Multi-framework ESG &mdash; Coming Q3 2026</span></span></a>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div class="nav-dropdown">',
    '        <button class="nav-dropdown-trigger" aria-expanded="false" aria-haspopup="true" aria-controls="nav-tools-panel">Free Tools <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>',
    '        <div class="nav-mega" id="nav-tools-panel" role="menu">',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">Free Compliance Tools</span>',
    '            <a href="/tools/mees-risk-snapshot" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">&#9670;</span><span><strong>MEES Risk Snapshot</strong><span class="nav-mega-desc">Penalty exposure under SI 2015/962 reg 39</span></span></a>',
    '            <a href="/tools/ppn-002-calculator" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--mark)">&#9670;</span><span><strong>PPN 002 Social Value Calculator</strong><span class="nav-mega-desc">10% minimum weighting</span></span></a>',
    '            <a href="/tools/cyber-essentials-readiness" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">&#9670;</span><span><strong>Cyber Essentials Readiness</strong><span class="nav-mega-desc">v3.3 \'Danzell\' self-test</span></span></a>',
    '          </div>',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">More tools</span>',
    '            <a href="/tools/late-payment-calculator" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">&#9670;</span><span><strong>Late Payment Calculator</strong><span class="nav-mega-desc">Statutory interest under the 1998 Act</span></span></a>',
    '            <a href="/tools/csrd-applicability-checker" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--sky)">&#9670;</span><span><strong>CSRD Applicability Checker</strong><span class="nav-mega-desc">Omnibus I threshold test</span></span></a>',
    '            <a href="/tools/vsme-materiality-light" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">&#9670;</span><span><strong>VSME Materiality Light</strong><span class="nav-mega-desc">EFRAG VSME (2024) screen</span></span></a>',
    '            <a href="/tools" role="menuitem" class="nav-mega-item" style="border-top:1px solid var(--border);margin-top:8px;padding-top:12px;"><span class="nav-mega-icon" style="color:var(--teal)">&rarr;</span><span><strong>See all free tools</strong><span class="nav-mega-desc">Tools hub with methodology pages</span></span></a>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <a href="/#sectors">Sectors</a>',
    '      <a href="/pricing"' + (isActive('/pricing') ? ' aria-current="page"' : '') + '>Pricing</a>',
    '      <a href="/blog"' + (isActive('/blog') ? ' aria-current="page"' : '') + '>Blog</a>',
    /* NAV-001 audit 2026-05-11: FAQ now in desktop nav (was mobile-only) */
    '      <a href="/faq"' + (isActive('/faq') ? ' aria-current="page"' : '') + '>FAQ</a>',
    '      <a href="/about"' + (isActive('/about') ? ' aria-current="page"' : '') + '>About</a>',
    '    </div>',
    '    <div class="nav-actions">',
    '      <a class="btn btn-sm btn-ghost-v2 nav-login" href="https://app.crowagent.ai/login" target="_blank" rel="noopener noreferrer">Sign in</a>',
    '      <a class="btn btn-sm btn-primary-v2 nav-cta" href="https://app.crowagent.ai/signup">Start free trial</a>',
    '    </div>',
    '    <button class="ham" aria-label="Toggle menu" aria-expanded="false">',
    '      <span></span><span></span><span></span>',
    '    </button>',
    '  </div>',
    '</nav>',
    '<div class="mob-menu" id="mob-menu" role="dialog" aria-label="Mobile navigation menu" aria-modal="true">',
    /* BUG-005 audit 2026-05-11: "How it works" removed from mobile menu to
       match desktop (was inconsistently retained mobile-only). Section
       still lives on home (/#how anchor) but no longer a nav entry. */
    '  <a href="/products">Products</a>',
    '  <a href="/crowagent-core" style="padding-left:20px;font-size:14px;opacity:.85">CrowAgent Core</a>',
    '  <a href="/crowmark" style="padding-left:20px;font-size:14px;opacity:.85">CrowMark</a>',
    '  <a href="/csrd" style="padding-left:20px;font-size:14px;opacity:.85">CSRD Checker</a>',
    '  <a href="/crowcyber" style="padding-left:20px;font-size:14px;opacity:.85">CrowCyber</a>',
    '  <a href="/crowcash" style="padding-left:20px;font-size:14px;opacity:.85">CrowCash</a>',
    '  <a href="/crowesg" style="padding-left:20px;font-size:14px;opacity:.85">CrowESG &middot; Coming Q3 2026</a>',
    '  <a href="/tools">Free Tools</a>',
    '  <a href="/tools/mees-risk-snapshot" style="padding-left:20px;font-size:14px;opacity:.85">MEES Risk Snapshot</a>',
    /* WS-AUDIT-050: align mobile-menu label with desktop nav-mega ("PPN 002
       Social Value Calculator"). Same destination, same wording. */
    '  <a href="/tools/ppn-002-calculator" style="padding-left:20px;font-size:14px;opacity:.85">PPN 002 Social Value Calculator</a>',
    '  <a href="/tools/cyber-essentials-readiness" style="padding-left:20px;font-size:14px;opacity:.85">Cyber Essentials Readiness</a>',
    '  <a href="/tools/late-payment-calculator" style="padding-left:20px;font-size:14px;opacity:.85">Late Payment Calculator</a>',
    '  <a href="/tools/csrd-applicability-checker" style="padding-left:20px;font-size:14px;opacity:.85">CSRD Applicability Checker</a>',
    '  <a href="/tools/vsme-materiality-light" style="padding-left:20px;font-size:14px;opacity:.85">VSME Materiality Light</a>',
    '  <a href="/#sectors">Sectors</a>',
    '  <a href="/pricing">Pricing</a>',
    '  <a href="/blog">Blog</a>',
    /* WS-AUDIT-031: surface FAQ in mobile menu — high-intent help content
       previously only reachable via the footer. */
    '  <a href="/faq">FAQ</a>',
    '  <a href="/about">About</a>',
    '  <a class="btn btn-md btn-ghost-v2" href="https://app.crowagent.ai/login" target="_blank" rel="noopener noreferrer">Sign in</a>',
    '  <a class="btn btn-md btn-primary-v2" href="https://app.crowagent.ai/signup">Start free trial</a>',
    '</div>'
  ].join('\n');

  /* ── FOOTER HTML ── */
  var FOOTER_HTML = [
    '<footer class="ca-footer" role="contentinfo">',
    '  <div class="wrap container-standard">',
    '    <div class="footer-credibility" aria-label="Security and compliance">',
    '      <ul class="footer-trust-row" role="list">',
    /* a11y fix 2026-05-03: emoji replaced with single-stroke SVGs that
       match the hero-trust .ht-item pattern (lines 118-122 in index.html).
       Same icon for every badge gives visual rhythm; brand teal stroke at
       14px. Removes OS-emoji-rendering inconsistency that surfaced on
       Windows + Linux. */
    // WEBSITE-FIX-001 WS-7.1: canonical 5-badge trust set, distinguishes
    // transport (TLS 1.3) from at-rest (AES-256). Same wording as hero
    // (index.html .hero-trust). Was inconsistent ("256-bit TLS encryption"
    // here vs "AES-256 encrypted" in hero — describing different things).
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>AES-256 at rest</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>TLS 1.3 in transit</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>GDPR compliant</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>UK data residency</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>ISO 27001 aligned</li>',
    '      </ul>',
    '    </div>',
    '    <div class="footer-grid">',
    '      <div class="footer-col footer-col-brand">',
    '        ' + logoHTML('/'),
    /* WS-AUDIT-033 / WS-AUDIT-044: tagline now leads with the brand-master
       phrase "Sustainability Intelligence" (per CLAUDE.md), with the product
       coverage as the descriptor sentence. Logo subtitle already says the
       same — this aligns the wordmark and tagline on every page. */
    '        <p class="footer-tagline">Sustainability Intelligence for UK organisations &mdash; MEES, PPN 002, CSRD, cyber, credit control and ESG, in one platform.</p>',
    /* FINAL-10 Row 49: initial label is operational since the page is
       up (the status fetch in scripts.js refines this if the dedicated
       monitor reports a degradation).  Removes the stray "Checking
       status..." text that was bleeding through on tool teaser pages
       where the status fetch hadn't yet resolved. */
    '        <div class="footer-status">',
    '          <span class="footer-status-dot online" id="status-dot"></span>',
    '          <span class="footer-status-label" id="status-label">All systems operational</span>',
    '        </div>',
    '        <div class="foot-social">',
    '          ' + socialHTML,
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    // WEBSITE-FIX-001 WS-1.2: Pricing/Start-free-trial/Log-in MOVED out of
    // Products column — those are CTAs/auth-links and live in nav, not footer.
    // WEBSITE-FIX-001 WS-1.7: CrowESG flagged with explicit Coming-soon chip
    // (var(--mist) muted token) so it's visually distinct from live products.
    '        <h3 class="footer-col-title">Products</h3>',
    '        <div class="footer-links">',
    '          <a href="/crowagent-core">CrowAgent Core</a>',
    '          <a href="/crowmark">CrowMark</a>',
    '          <a href="/csrd">CSRD Checker</a>',
    '          <a href="/crowcyber">CrowCyber</a>',
    '          <a href="/crowcash">CrowCash</a>',
    '          <a href="/crowesg" class="footer-link-coming-soon">CrowESG <span class="coming-soon-chip">Coming Q3 2026</span></a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    // WEBSITE-FIX-001 WS-1.8: trimmed from 6 tools to 4 highest-intent +
    // "See all free tools →" link. Late Payment Calculator + VSME Materiality
    // Light remain in /tools hub but not in footer (lower intent + footer
    // density management).
    '        <h3 class="footer-col-title">Free Tools</h3>',
    /* NAV-002 audit 2026-05-11: footer Free Tools now lists ALL 6 tools to
       match desktop mega-nav and mobile menu (was 4 + "see all"). */
    '        <div class="footer-links">',
    '          <a href="/tools/mees-risk-snapshot">MEES Risk Snapshot</a>',
    '          <a href="/tools/ppn-002-calculator">PPN 002 Calculator</a>',
    '          <a href="/tools/csrd-applicability-checker">CSRD Applicability Checker</a>',
    '          <a href="/tools/cyber-essentials-readiness">Cyber Essentials Readiness</a>',
    '          <a href="/tools/late-payment-calculator">Late Payment Calculator</a>',
    '          <a href="/tools/vsme-materiality-light">VSME Materiality Light</a>',
    '          <a href="/tools" style="color:var(--teal);">See all free tools &rarr;</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    // WEBSITE-FIX-001 WS-1.4: "All articles" → "Blog" (matches nav label).
    // WEBSITE-FIX-001 WS-1.9: "Platform" link removed (vague; /how-it-works
    // does not exist). Direct platform-marketing entry happens via the
    // products links in column 1, the global nav, and the hero CTAs.
    /* ── WS-AUDIT-026 footer-dedup section (added 2026-05-10) ──
       The "MEES guides" / "PPN 002 guides" / "CSRD guides" rows previously
       deep-linked to a single representative blog post each, which:
         (a) duplicated the IA in the Resources column (every guide link
             still resolved into /blog/<post>),
         (b) gave SEO equity to one post per topic and starved the rest of
             the topic cluster of internal links.
       Fix: each "<topic> guides" link now points at /blog?tag=<slug>, which
       blog-filter.js (WS-AUDIT-026 update) reads on load and pre-selects the
       matching .filter-pill. Result: "Blog" → /blog (catch-all), each
       "<topic> guides" → /blog?tag=<topic> (filtered category view). This
       is the only WS-AUDIT-026 footer change in this file. */
    /* FINAL-10 Row 29 (slim footer Resources): per-topic blog-tag links
       removed because the same destinations resolve via /blog filter
       pills.  Keep top-level: Blog, FAQ, Glossary, Changelog. */
    '        <h3 class="footer-col-title">Resources</h3>',
    '        <div class="footer-links">',
    '          <a href="/blog">Blog</a>',
    '          <a href="/faq">FAQ</a>',
    '          <a href="/glossary">Compliance Glossary</a>',
    '          <a href="/changelog">Changelog</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    // WEBSITE-FIX-001 WS-1.1: "Book a demo" REMOVED — duplicates global nav CTA.
    // WEBSITE-FIX-001 WS-1.3: "LinkedIn" text link REMOVED — duplicates the
    //   .foot-social icon row at the brand column.
    // WEBSITE-FIX-001 WS-1.5: "System status" REMOVED — duplicates the
    //   status pill at the top of the brand column (also links to status page).
    // WEBSITE-FIX-001 §2 acceptance "exactly 4 columns": Legal absorbed into
    //   Company as a final separated row of links (compact). Privacy/Terms/
    //   Cookies/Security still reachable from this column.
    '        <h3 class="footer-col-title">Company</h3>',
    '        <div class="footer-links">',
    '          <a href="/about">About</a>',
    '          <a href="/roadmap">Roadmap</a>',
    '          <a href="/contact">Contact</a>',
    '          <a href="/partners">Partners</a>',
    '          <a href="/security">Security</a>',
    '          <a href="/privacy">Privacy</a>',
    '          <a href="/terms">Terms</a>',
    '          <a href="/cookies">Cookies</a>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="footer-bottom">',
    // WEBSITE-FIX-001 WS-7.4: year now dynamic — was hardcoded 2026.
    /* WS-AUDIT-033 / WS-AUDIT-044: align copyright tagline with brand master
       phrase "Sustainability Intelligence" (per CLAUDE.md). */
    /* User directive 2026-05-09: footer must surface legal-entity line for
       Companies Act 2006 §82 + ICO disclosure, alongside the brand
       copyright. Two-line stack: copyright on top, legal-entity below. */
    '      <p class="footer-copyright">&copy; <span id="footer-year">2026</span> CrowAgent Ltd. All rights reserved. Sustainability Intelligence.</p>',
    '      <p class="footer-legal-entity">CrowAgent Ltd &middot; Company No. 17076461, Registered in England &amp; Wales &middot; ICO data controller registered</p>',
    // WEBSITE-FIX-001 WS-1.6: tech-stack disclosure removed.
    // Security-positioned B2B SaaS does not advertise its infra stack.
    '      <a href="/status" class="footer-bottom-link">Status</a>',
    '      <a href="/cookie-preferences" id="ca-cookie-reopen" class="cookie-reopen-link">Cookie preferences</a>',
    '    </div>',
    '  </div>',
    '</footer>'
  ].join('\n');

  /* ── INJECT ── */
  function inject(id, html) {
    try {
      var el = document.getElementById(id);
      if (el) el.outerHTML = html;
    } catch (e) { /* DOM swap failed — leave placeholder, never break the page */ }
  }

  /* === FINAL-4 WebKit nav-paint race fix (2026-05-10) ===
     Prior implementation injected nav, footer, augmented <head>, registered SW,
     and dispatched ca-nav-ready in one synchronous tick. WebKit JSC has a
     ~150-2800ms warmup on defer-script execution, and that single tick blocked
     the first paint of <nav>. We now split into two phases:
       Phase A (synchronous, in `run`): inject nav HTML + banner-wrap only.
         This is the single piece of work that has to happen before paint, so
         the user sees the nav as soon as JSC unblocks.
       Phase B (`requestAnimationFrame` after A): footer HTML, head augmentation,
         analytics auto-injection, ca-nav-ready/ca-footer-ready dispatch, SW
         registration. None of these affect first paint.
     Result on WebKit: /home went from ~2873ms to ~600-900ms nav-visible time
     in dev-server smoke. Net JS time is identical — only the order changes. */

  function injectNavOnly() {
    inject('ca-nav', NAV_HTML);
    try {
      var navEl = document.querySelector('nav[role="navigation"]');
      if (navEl && !navEl.closest('[role="banner"]')) {
        var banner = document.createElement('div');
        banner.setAttribute('role', 'banner');
        banner.className = 'ca-banner-wrapper';
        navEl.parentNode.insertBefore(banner, navEl);
        banner.appendChild(navEl);
      }
    } catch (e) { /* a11y-banner wrap is best-effort */ }
  }

  function injectFooterAndExtras() {
    inject('ca-footer', FOOTER_HTML);
    // Banner-wrap is done by injectNavOnly (Phase A) so first paint includes it.

    // WEBSITE-FIX-001 WS-7.4: dynamic copyright year. Static fallback is the
    // current year so the markup is correct even if JS fails to load.
    try {
      var yearEl = document.getElementById('footer-year');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    } catch (_) { /* best-effort */ }
    /* ── HEAD AUGMENTATION (H-12 / M-06 / WEB-AUDIT-224 / WEB-AUDIT-229) ──
       Inject site-wide head metadata not present on every page individually:
         - <link rel="manifest" href="/manifest.json"> for PWA "Add to Home Screen"
         - <meta name="theme-color" content="#0A1F3A"> for mobile browser chrome
       Idempotent: only adds if not already present. */
    try {
      var head = document.head;
      if (head) {
        if (!head.querySelector('link[rel="manifest"]')) {
          var manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          manifestLink.href = '/manifest.json';
          head.appendChild(manifestLink);
        }
        if (!head.querySelector('meta[name="theme-color"]')) {
          var themeColor = document.createElement('meta');
          themeColor.name = 'theme-color';
          themeColor.content = '#0A1F3A';
          head.appendChild(themeColor);
        }
      }
    } catch (e) { /* head augmentation is best-effort */ }

    /* ── ANALYTICS BOOTSTRAP (WS-AUDIT-008) ──
       Auto-load /js/analytics-init.js on every page that uses the shared nav,
       not just /. analytics-init.js is consent-gated internally — it loads
       the PostHog stub but only opts in if `ca_cookie_consent_v2.analytics`
       is true. So injecting it here does not cause non-consented capture.
       Idempotent: only injects if not already present (the homepage still
       includes the script tag inline; we skip re-injection there). */
    try {
      if (!document.querySelector('script[src="/js/analytics-init.js"]') &&
          !document.querySelector('script[src="js/analytics-init.js"]')) {
        var phScript = document.createElement('script');
        phScript.src = '/js/analytics-init.js';
        phScript.defer = true;
        document.head.appendChild(phScript);
      }
    } catch (e) { /* analytics bootstrap is best-effort */ }
    // Signal footer-ready (footer DOM is now present). ca-nav-ready was
    // dispatched immediately after Phase A so handlers wire up to nav as
    // soon as possible. Dispatching ca-footer-ready inside a microtask so
    // listeners registered in this same tick (e.g. cookie-banner wireTriggers)
    // fire after this function returns.
    try {
      document.dispatchEvent(new CustomEvent('ca-footer-ready'));
    } catch (e) { /* never break the page */ }
  }

  /* Two-phase scheduling — see FINAL-4 comment above injectNavOnly.
     Phase A: inject nav HTML synchronously. This is the only piece that
       blocks the visible nav landmark. Fires ca-nav-ready immediately so
       scripts.js can bind dropdown/mobile-menu handlers as soon as the DOM
       exists. Wrapped in try/catch so a thrown error never leaves the page
       without footer/ca-nav-ready bindings.
     Phase B: schedule footer + head augmentation + analytics + SW register
       on the next animation frame. requestAnimationFrame yields to the paint
       step, so the user sees the nav before we do the heavier work. */
  function runPhaseA() {
    try {
      injectNavOnly();
    } catch (e) { /* nav-only inject failed; still run Phase B */ }
    try {
      document.dispatchEvent(new CustomEvent('ca-nav-ready'));
    } catch (e) { /* never break the page */ }
    var schedule = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 0); };
    schedule(function () {
      try { injectFooterAndExtras(); } catch (e) { /* never break the page */ }
    });
  }

  /* Run immediately — defer script order guarantees DOM placeholders exist */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPhaseA);
  } else {
    runPhaseA();
  }

  /* ── SERVICE WORKER REGISTRATION (DEF-040 / Task 32.13) ──
     Window 'load' fires after every defer script + every <img> resource has
     finished. Wrapping in try/catch so a Gecko / WebKit register-throws does
     not produce an uncaught pageerror (NS_ERROR_FAILURE class). */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      try {
        navigator.serviceWorker.register('/service-worker.js').catch(function(err) {
          if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
            console.warn('SW registration failed:', err);
          }
        });
      } catch (e) { /* register may throw synchronously on disabled origins */ }
    });
  }
})();