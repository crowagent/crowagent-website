/**
 * nav-inject.js — CrowAgent shared nav + footer injector
 * Pattern: same as cookie-banner.js. Writes HTML to placeholder divs.
 * Single source of truth for nav and footer across all pages.
 *
 * CONSTANTS (never change without CTO confirmation):
 *   Annual discount = 10%
 *   FAQ appears in footer Resources only (removed from nav in WP-WEB-003)
 *   Footer Company column = no FAQ link (FAQ is in Resources only)
 *   Footer copyright = "Sustainability Compliance Software" on all pages
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
    { href: 'https://x.com/CrowAgentLtd', label: 'X',
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
     a11y fix 2026-05-03: dropped aria-label="CrowAgent home" — the visible
     text "CrowAgent · Sustainability Intelligence" inside the link is the
     correct accessible name. Lighthouse label-content-name-mismatch was
     scoring the link 0 on the homepage because the visible text didn't
     contain the word "home". Same logo is used in nav + footer, so this
     fix ripples to every page. */
  function logoHTML(href) {
    return '<a href="' + href + '" class="logo">'
      + '<div class="logo-mark-wrap" aria-hidden="true">'
      + '<div class="b b1"></div><div class="b b2"></div>'
      + '<div class="b b3"></div><div class="b b4"></div>'
      + '</div>'
      + '<div class="logo-text">'
      + '<div class="logo-wordmark">Crow<span>Agent</span></div>'
      + '<div class="logo-tag">Sustainability Intelligence</div>'
      + '</div></a>';
  }

  /* ── NAV HTML ── */
  var NAV_HTML = [
    '<nav role="navigation" aria-label="Main navigation">',
    '  <div class="wrap">',
    '    ' + logoHTML('/'),
    '    <div class="nav-links">',
    '      <a href="/#how"' + (isActive('/#how') ? ' aria-current="page"' : '') + '>How it works</a>',
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
    '            <a href="/tools/ppn002-calculator" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--mark)">&#9670;</span><span><strong>PPN 002 Social Value Calculator</strong><span class="nav-mega-desc">10% minimum weighting</span></span></a>',
    '            <a href="/tools/cyber-essentials-readiness" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">&#9670;</span><span><strong>Cyber Essentials Readiness</strong><span class="nav-mega-desc">v3.3 \'Danzell\' self-test</span></span></a>',
    '          </div>',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">More tools</span>',
    '            <a href="/tools/late-payment-calculator" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">&#9670;</span><span><strong>Late Payment Calculator</strong><span class="nav-mega-desc">Statutory interest under the 1998 Act</span></span></a>',
    '            <a href="/tools/csrd-checker" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--sky)">&#9670;</span><span><strong>CSRD Applicability Checker</strong><span class="nav-mega-desc">Omnibus I threshold test</span></span></a>',
    '            <a href="/tools/vsme-materiality-light" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)">&#9670;</span><span><strong>VSME Materiality Light</strong><span class="nav-mega-desc">EFRAG VSME (2024) screen</span></span></a>',
    '            <a href="/tools" role="menuitem" class="nav-mega-item" style="border-top:1px solid var(--border);margin-top:8px;padding-top:12px;"><span class="nav-mega-icon" style="color:var(--teal)">&rarr;</span><span><strong>See all free tools</strong><span class="nav-mega-desc">Tools hub with methodology pages</span></span></a>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <a href="/#sectors">Sectors</a>',
    '      <a href="/pricing"' + (isActive('/pricing') ? ' aria-current="page"' : '') + '>Pricing</a>',
    '      <a href="/blog"' + (isActive('/blog') ? ' aria-current="page"' : '') + '>Blog</a>',
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
    '  <a href="/#how">How it works</a>',
    '  <a href="/products">Products</a>',
    '  <a href="/crowagent-core" style="padding-left:20px;font-size:14px;opacity:.85">CrowAgent Core</a>',
    '  <a href="/crowmark" style="padding-left:20px;font-size:14px;opacity:.85">CrowMark</a>',
    '  <a href="/csrd" style="padding-left:20px;font-size:14px;opacity:.85">CSRD Checker</a>',
    '  <a href="/crowcyber" style="padding-left:20px;font-size:14px;opacity:.85">CrowCyber</a>',
    '  <a href="/crowcash" style="padding-left:20px;font-size:14px;opacity:.85">CrowCash</a>',
    '  <a href="/crowesg" style="padding-left:20px;font-size:14px;opacity:.85">CrowESG &middot; Coming Q3 2026</a>',
    '  <a href="/tools">Free Tools</a>',
    '  <a href="/tools/mees-risk-snapshot" style="padding-left:20px;font-size:14px;opacity:.85">MEES Risk Snapshot</a>',
    '  <a href="/tools/ppn002-calculator" style="padding-left:20px;font-size:14px;opacity:.85">PPN 002 Calculator</a>',
    '  <a href="/tools/cyber-essentials-readiness" style="padding-left:20px;font-size:14px;opacity:.85">Cyber Essentials Readiness</a>',
    '  <a href="/tools/late-payment-calculator" style="padding-left:20px;font-size:14px;opacity:.85">Late Payment Calculator</a>',
    '  <a href="/tools/csrd-checker" style="padding-left:20px;font-size:14px;opacity:.85">CSRD Checker</a>',
    '  <a href="/tools/vsme-materiality-light" style="padding-left:20px;font-size:14px;opacity:.85">VSME Materiality Light</a>',
    '  <a href="/#sectors">Sectors</a>',
    '  <a href="/pricing">Pricing</a>',
    '  <a href="/blog">Blog</a>',
    '  <a href="/about">About</a>',
    '  <a class="btn btn-md btn-ghost-v2" href="https://app.crowagent.ai/login" target="_blank" rel="noopener noreferrer">Sign in</a>',
    '  <a class="btn btn-md btn-primary-v2" href="https://app.crowagent.ai/signup">Start free trial</a>',
    '</div>'
  ].join('\n');

  /* ── FOOTER HTML ── */
  var FOOTER_HTML = [
    '<footer class="ca-footer" role="contentinfo">',
    '  <div class="wrap container-standard">',
    '    <div class="footer-credibility" aria-label="Company credibility">',
    '      <p class="footer-credibility-line">CrowAgent Ltd &middot; Company No. 17076461 &middot; Reading, England, UK</p>',
    '      <ul class="footer-trust-row" role="list">',
    /* a11y fix 2026-05-03: emoji replaced with single-stroke SVGs that
       match the hero-trust .ht-item pattern (lines 118-122 in index.html).
       Same icon for every badge gives visual rhythm; brand teal stroke at
       14px. Removes OS-emoji-rendering inconsistency that surfaced on
       Windows + Linux. */
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>256-bit TLS encryption</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>UK data residency</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>GDPR compliant</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>SOC 2 in progress</li>',
    '      </ul>',
    '    </div>',
    '    <div class="footer-grid">',
    '      <div class="footer-col footer-col-brand">',
    '        ' + logoHTML('/'),
    '        <p class="footer-tagline">Sustainability Compliance Software for UK organisations navigating MEES, PPN 002, CSRD, and the full regulatory agenda.</p>',
    '        <p class="footer-company">CrowAgent Ltd &middot; Company No. 17076461<br>Registered in England &amp; Wales &middot; ICO registered &middot; VAT: GB 471 7646 10</p>',
    '        <div class="footer-status">',
    '          <span class="footer-status-dot" id="status-dot"></span>',
    '          <span class="footer-status-label" id="status-label">Checking status...</span>',
    '        </div>',
    '        <div class="foot-social">',
    '          ' + socialHTML,
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h3 class="footer-col-title">Products</h3>',
    '        <div class="footer-links">',
    '          <a href="/crowagent-core">CrowAgent Core</a>',
    '          <a href="/crowmark">CrowMark</a>',
    '          <a href="/csrd">CSRD Checker</a>',
    '          <a href="/crowcyber">CrowCyber</a>',
    '          <a href="/crowcash">CrowCash</a>',
    '          <a href="/crowesg">CrowESG &middot; Coming Q3 2026</a>',
    '          <a href="/pricing">Pricing</a>',
    '          <a href="https://app.crowagent.ai/signup">Start free trial</a>',
    '          <a href="https://app.crowagent.ai/login">Log in</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h3 class="footer-col-title">Free Tools</h3>',
    '        <div class="footer-links">',
    '          <a href="/tools/mees-risk-snapshot">MEES Risk Snapshot</a>',
    '          <a href="/tools/ppn002-calculator">PPN 002 Calculator</a>',
    '          <a href="/tools/cyber-essentials-readiness">Cyber Essentials Readiness</a>',
    '          <a href="/tools/late-payment-calculator">Late Payment Calculator</a>',
    '          <a href="/tools/csrd-checker">CSRD Applicability Checker</a>',
    '          <a href="/tools/vsme-materiality-light">VSME Materiality Light</a>',
    '          <a href="/tools" style="color:var(--teal);">See all free tools &rarr;</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h3 class="footer-col-title">Resources</h3>',
    '        <div class="footer-links">',
    '          <a href="/blog">All articles</a>',
    '          <a href="/faq">FAQ</a>',
    '          <a href="/glossary">Compliance Glossary</a>',
    '          <a href="/blog/mees-band-c-2028">MEES guides</a>',
    '          <a href="/blog">PPN 002 guides</a>',
    '          <a href="/blog/csrd-omnibus-i-2026">CSRD guides</a>',
    '          <a href="/changelog">Changelog</a>',
    '          <a href="https://app.crowagent.ai">Platform</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h3 class="footer-col-title">Company</h3>',
    '        <div class="footer-links">',
    '          <a href="/about">About</a>',
    '          <a href="/demo">Book a demo</a>',
    '          <a href="/roadmap">Roadmap</a>',
    '          <a href="/contact">Contact</a>',
    '          <a href="/partners">Partners</a>',
    '          <a href="https://status.crowagent.ai" target="_blank" rel="noopener noreferrer">System status</a>',
    '          <a href="https://www.linkedin.com/company/crowagent-ltd/" target="_blank" rel="noopener noreferrer">LinkedIn</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    '        <h3 class="footer-col-title">Legal</h3>',
    '        <div class="footer-links">',
    '          <a href="/privacy">Privacy</a>',
    '          <a href="/terms">Terms</a>',
    '          <a href="/cookies">Cookies</a>',
    '          <a href="/security">Security</a>',
    '        </div>',
    '      </div>',
    '    </div>',
    '    <div class="footer-bottom">',
    '      <p class="footer-copyright">&copy; 2026 CrowAgent Ltd. All rights reserved. Sustainability Compliance Software.</p>',
    '      <p class="footer-infra">Built on Railway &middot; Vercel &middot; Cloudflare &middot; Supabase</p>',
    '      <a href="/status" class="footer-bottom-link">Status</a>',
    '      <a href="/cookie-preferences" id="ca-cookie-reopen" class="cookie-reopen-link">Cookie preferences</a>',
    '    </div>',
    '  </div>',
    '</footer>'
  ].join('\n');

  /* ── INJECT ── */
  function inject(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  function run() {
    inject('ca-nav', NAV_HTML);
    inject('ca-footer', FOOTER_HTML);
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
    // Signal nav injection complete so scripts.js can rebind handlers
    // setTimeout(0) defers dispatch to next tick — ensures all defer scripts have registered listeners
    setTimeout(function() {
      document.dispatchEvent(new CustomEvent('ca-nav-ready'));
    }, 0);
  }

  /* Run immediately — defer script order guarantees DOM placeholders exist */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }

  /* ── SERVICE WORKER REGISTRATION (DEF-040 / Task 32.13) ── */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/service-worker.js').catch(function(err) {
        if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
          console.warn('SW registration failed:', err);
        }
      });
    });
  }
})();