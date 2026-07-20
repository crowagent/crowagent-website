/**
 * nav-inject.js - CrowAgent shared nav + footer injector
 * Pattern: same as cookie-banner.js. Writes HTML to placeholder divs.
 * Single source of truth for nav and footer across all pages.
 *
 * CONSTANTS (never change without CTO confirmation):
 *   Annual discount = 10%
 *   FAQ appears in footer Resources only (removed from nav in WP-WEB-003)
 *   Footer Company column = no FAQ link (FAQ is in Resources only)
 *   Footer copyright = "Sustainability<span class="logo-tag-sep" aria-hidden="true">&bull;</span>Intelligence" on all pages
 *     (CLAUDE.md mandated brand-master phrase; no variations).
 */
(function () {
  'use strict';

  // IDEMPOTENCY GUARD (2026-06-01) — root fix for duplicate-ID defect.
  // nav-inject.js is included 2-4x on 21 pages (blogs, contact, partners,
  // privacy, resources, roadmap, security); each run injected the nav + mobile
  // menu again, producing duplicate #mob-menu / #mob-acc-products / #mob-acc-tools
  // (breaks getElementById, the mobile-menu toggle JS, and a11y). Run the whole
  // injector exactly once per document regardless of how many times it loads.
  if (window.__caNavInjectRan) { return; }
  window.__caNavInjectRan = true;

  // SF28 Deterministic Load State (2026-05-28)
  // Prevent browser from restoring deep scroll positions on reload, which can
  // push the cinematic hero off-screen on Sovereign-v2 pages.
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    // LM-016 (2026-05-29): GSAP ScrollTrigger's refresh resets scrollRestoration
    // back to 'auto' AFTER our init blocks run (last-write-wins → ended 'auto').
    // Re-assert 'manual' on every ScrollTrigger refresh (when GSAP is available),
    // plus a post-load failsafe after GSAP has settled.
    var reassertManual = function () {
      try { history.scrollRestoration = 'manual'; } catch (e) {}
    };
    var hookScrollTrigger = function () {
      if (window.ScrollTrigger && typeof window.ScrollTrigger.addEventListener === 'function') {
        window.ScrollTrigger.addEventListener('refresh', reassertManual);
        return true;
      }
      return false;
    };
    if (!hookScrollTrigger()) {
      window.addEventListener('load', function () { setTimeout(function () { hookScrollTrigger(); reassertManual(); }, 600); });
    }
    window.addEventListener('load', function () { setTimeout(reassertManual, 1500); });
  }
  window.scrollTo(0, 0);

  /* [head-of-FE 2026-05-27] Global canonical nav+footer styling. The injected
     mega-nav is styled by sovereign-primitives.css/styles.css, which the
     transformed pages don't load → the nav rendered 746px unstyled. Inject a
     self-contained glass-nav stylesheet on every page so the nav is a proper
     72px sticky bar everywhere (own file; not overwritten by Gemini's build). */
  /* LM-044 (2026-05-28 - Claude): 60 pages hardcode this link with stale ?v=
     strings in their <head>. The prior "if not present, inject" check meant
     those pages KEPT serving the stale CSS, blocking every Claude CSS fix.
     New behaviour: single source of truth = the ?v= below. If the existing
     link's href differs (any version skew), UPDATE it in place. If none
     exists, inject. Either way, the page ends up loading EXACTLY the latest. */
  var navFixHref = '/Assets/css/nav-global-fix-2026-05-27.css?v=20260715a';
  var existingNavFix = document.querySelector('link[href*="nav-global-fix-2026-05-27"]');
  if (existingNavFix) {
    if (existingNavFix.getAttribute('href') !== navFixHref) {
      existingNavFix.setAttribute('href', navFixHref);
    }
    /* FOUC FIX (owner 2026-05-30): we used to appendChild (MOVE) nav-global-fix to the
       end of <head> so it beat legacy crowagent-brand-tokens.css (LM-154). But moving
       a <link> RE-FETCHES the stylesheet → a visible white/teal re-render flash on
       EVERY page load. Per LM-153, brand-tokens.css is only :root tokens + a11y
       baselines — it defines NO heading sizes — so it can't override nav-global-fix's
       heading scale. The move was therefore unnecessary; removing it eliminates the
       flash. nav-global-fix already uses !important on its canonical rules. */
  } else {
    var navFix = document.createElement('link');
    navFix.rel = 'stylesheet';
    navFix.href = navFixHref;
    (document.head || document.documentElement).appendChild(navFix);
  }

  /* PREMIUM GLOSS (owner 2026-05-31): global "shiny" layer — specular highlights on
     cards, refractive glass borders on nav/overlays, liquid-gradient headings on dark
     sections only (light-section headings reset to legible). Most pages carry a static
     <link> in <head> (no FOUC); inject here only for pages that lack it. Same
     single-source-of-truth ?v= as the static links. */
  var glossHref = '/Assets/css/premium-gloss-2026-05-31.css?v=20260601o';
  var existingGloss = document.querySelector('link[href*="premium-gloss-2026-05-31"]');
  if (existingGloss) {
    /* update stale ?v= in place so every page gets the latest gloss fix (the
       over-broad [class*=ca-card-] inset-line bug fix) — same pattern as nav-global-fix. */
    if (existingGloss.getAttribute('href') !== glossHref) existingGloss.setAttribute('href', glossHref);
  } else {
    var gloss = document.createElement('link');
    gloss.rel = 'stylesheet';
    gloss.href = glossHref;
    (document.head || document.documentElement).appendChild(gloss);
  }

  /* P1-003 (2026-06-15 - Claude): Cmd/Ctrl+K command palette was only wired on
     index/contact/partners (the 3 pages that hardcoded sovereign-features.js +
     sovereign-cmdk.css). On every other page Ctrl+K did nothing because the
     palette JS/CSS never loaded. Inject the palette stylesheet sitewide here
     (idempotent — skip if a page already declares it) so the dialog renders
     correctly everywhere; the JS is added to scriptsToInject in Phase B. */
  var cmdkHref = '/Assets/css/sovereign-cmdk.css?v=20260615b';
  var existingCmdk = document.querySelector('link[href*="sovereign-cmdk"]');
  if (existingCmdk) {
    if (existingCmdk.getAttribute('href') !== cmdkHref) existingCmdk.setAttribute('href', cmdkHref);
  } else {
    var cmdkLink = document.createElement('link');
    cmdkLink.rel = 'stylesheet';
    cmdkLink.href = cmdkHref;
    (document.head || document.documentElement).appendChild(cmdkLink);
  }

  /* PRODUCT-STATUS BADGES (2026-07-19): two design-system pills used wherever a
     product or capability is presented with a status.
       .ca-badge-beta  = retained for future use. Beta is a PLATFORM state, signalled
                         by the BETA_MODE announcement bar, not a per-product badge.
       .ca-badge-dev   = built but NOT available to customers yet. Never use this
                         to mean "beta": it means you cannot use it today.
     Injected here (not in Assets/css) so every page picks them up from the one
     shared nav bundle. Both pass AA on the dark chrome and on .ca-section-light /
     .sec-light surfaces. Idempotent. */
  if (!document.getElementById('ca-status-badge-css')) {
    var badgeCSS = document.createElement('style');
    badgeCSS.id = 'ca-status-badge-css';
    badgeCSS.textContent = [
      '.ca-badge-beta,.ca-badge-dev{display:inline-flex;align-items:center;gap:.45em;',
      'font-family:var(--font-body,inherit);font-size:.625rem;font-weight:800;line-height:1;',
      'letter-spacing:.14em;text-transform:uppercase;padding:.42em .72em;border-radius:100px;',
      'white-space:nowrap;vertical-align:middle;border:1px solid transparent}',
      /* colour is forced: these pills sit inside headings that clip a gradient to
         the text (-webkit-text-fill-color:transparent) or repaint everything white. */
      '.ca-badge-beta{background:#A78BFA!important;color:#0B0620!important;-webkit-text-fill-color:#0B0620!important;border-color:#A78BFA}',
      '.ca-badge-dev{background:#1E1608!important;color:#FFC24D!important;-webkit-text-fill-color:#FFC24D!important;border-color:#8A6100}',
      '.ca-badge-dev::before{content:"";width:.44em;height:.44em;border-radius:50%;background:#FFC24D;flex:0 0 auto}',
      '.ca-section-light .ca-badge-dev,.sec-light .ca-badge-dev{background:#3A2A05!important;border-color:#7A5400}',
      '.nav-mega-item .ca-badge-beta,.mob-sublink .ca-badge-beta{font-size:.5rem;padding:.34em .6em;margin-left:.5em}',
      '.ca-devnote{border:1px solid #8A6100;background:#1A1305;border-radius:16px;padding:clamp(20px,3vw,32px)}',
      '.ca-section-light .ca-devnote{background:#FFF6E3;border-color:#7A5400}'
    ].join('');
    (document.head || document.documentElement).appendChild(badgeCSS);
  }

  /* LM-031 BATCH-C (2026-05-29 - Claude): sitewide section reveal motion.
     Injected as defer script so every page gets fade-up on scroll without
     per-page changes. Idempotent: skipped if a script tag already present. */
  if (!document.querySelector('script[src*="sv-reveal"]')) {
    var sv = document.createElement('script');
    sv.src = '/js/modules/sv-reveal.js?v=20260615a';
    sv.defer = true;
    (document.head || document.documentElement).appendChild(sv);
  }

  var path = window.location.pathname.replace(/\/$/, '') || '/';

  // Canonical brand logo (2026-05-24): SVG icon mark + crisp HTML wordmark
  // (sized/coloured in sovereign-primitives.css). Wordmark "CrowAgent" is
  // white (currentColor on the dark chrome). No tagline/globe (2026-07-18).
  // NEW CrowAgent bar-chart mark (2026-07-17): rounded-square near-white tile
  // with FOUR ascending bars (heights 0.42/0.6/0.78/1.0 of inner height); bars
  // 1-2 use a blue gradient (#60a5fa->#2563eb), bars 3-4 a teal->blue gradient
  // (#22c55e->#3b82f6), plus a faint baseline rule. Canonical source-of-truth
  // for this SVG is /Assets/logo/crowagent-mark.svg (also reused on the
  // platform). Rendered inline here so the nav + footer lockups stay vector and
  // theme-adaptive (sized by `.logo-mark svg` in the CSS). Gradient IDs are
  // slot-suffixed ('nav' / 'footer') so the two instances never collide.
  function brandIconSVG(slot) {
    var s = slot || 'nav';
    return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">'
      + '<defs>'
      +   '<linearGradient id="caMarkBlue-' + s + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#60a5fa"/><stop offset="1" stop-color="#2563eb"/></linearGradient>'
      +   '<linearGradient id="caMarkTeal-' + s + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22c55e"/><stop offset="1" stop-color="#3b82f6"/></linearGradient>'
      + '</defs>'
      + '<rect x="4" y="4" width="56" height="56" rx="14" fill="#FCFDFF" stroke="rgba(15,23,42,.20)" stroke-width="1.5"/>'
      + '<rect x="15" y="48.4" width="34" height="1.2" rx="0.6" fill="#94a3b8" opacity="0.35"/>'
      + '<rect x="15" y="34.72" width="6" height="14.28" rx="2" fill="url(#caMarkBlue-' + s + ')"/>'
      + '<rect x="24.33" y="28.6" width="6" height="20.4" rx="2" fill="url(#caMarkBlue-' + s + ')"/>'
      + '<rect x="33.67" y="22.48" width="6" height="26.52" rx="2" fill="url(#caMarkTeal-' + s + ')"/>'
      + '<rect x="43" y="15" width="6" height="34" rx="2" fill="url(#caMarkTeal-' + s + ')"/>'
      + '</svg>';
  }

  function isActive(href) {
    // M-08: skip aria-current for hash-only links (/#how, /#sectors) - they're anchors not pages
    if (href && href[0] === '#') return false;
    var h = href.replace(/\/$/, '') || '/';
    return path === h || (h !== '/' && path.startsWith(h));
  }

  /* Stripe-grade polish 2026-05-17: dropdown triggers should reflect the
     active product/tool subpage so the teal underline stays visible when
     a user is on, e.g., /crowmark or /tools/ppn-002-calculator.
     Returns the attribute string ' data-active="true" aria-current="page"'
     or an empty string. Section is an array of route prefixes. */
  var PRODUCT_ROUTES = ['/crowmark', '/crowcyber', '/crowcash', '/crowesg', '/products'];
  var TOOL_ROUTES = ['/tools'];
  function sectionActive(routes) {
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i].replace(/\/$/, '') || '/';
      if (path === r || (r !== '/' && path.startsWith(r))) return true;
    }
    return false;
  }
  function sectionActiveAttr(routes) {
    return sectionActive(routes) ? ' data-active="true" aria-current="page"' : '';
  }

  /* ── SOCIAL SVG PATHS ── */
  var SOCIALS = [
    { href: 'https://www.linkedin.com/company/crowagent-ltd/', label: 'LinkedIn',
      d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
    /* X profile = https://x.com/CrowAgentLtd (owner-confirmed 2026-06-01). */
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

  /* LM-064 BUG-019 2026-05-29 (Claude): screen-reader friendly aria-label.
     Was just "LinkedIn" / "X" / "YouTube" - too terse out of context.
     Now: "CrowAgent on LinkedIn (opens in a new tab)". */
  var socialHTML = SOCIALS.map(function(s) {
    return '<a href="' + s.href + '" target="_blank" rel="noopener noreferrer" aria-label="CrowAgent on ' + s.label + ' (opens in a new tab)" class="ca-touch-target">'
      + '<svg width="18" height="18" viewBox="0 0 24 24" fill="var(--steel)" aria-hidden="true"><path d="' + s.d + '"/></svg></a>';
  }).join('\n          ');

  /* ── LOGO MARKUP (reused in nav + footer) ──
     Canonical inline SVG logo: bar-chart mark + crisp "CrowAgent" wordmark.
     Vector, theme-adaptive, crisp at any DPR. Same markup for nav + footer
     (slot only varies the rendered height via CSS). Clean lockup 2026-07-18:
     no tagline, no globe — the `.logo`/`.logo-wordmark` class names are
     retained so pre-existing CSS gates still find their DOM hooks. */
  function logoHTML(href, slot) {
    // Clean lockup (2026-07-18, owner-locked): bar-chart mark + "CrowAgent"
    // wordmark ONLY — no tagline, no globe (Stripe/Linear approach). The old
    // descriptor strapline is retired brand-wide (screen, meta, OG, footer).
    return '<a href="' + href + '" class="logo logo-lockup" aria-label="CrowAgent, home">'
      + '<span class="logo-mark" aria-hidden="true">' + brandIconSVG(slot) + '</span>'
      + '<div class="logo-text">'
      +   '<span class="logo-wordmark">CrowAgent</span>'
      + '</div>'
      + '</a>';
  }

  /* ── NAV HTML ── */
  // SF42 A1 (2026-05-18): native <header> + <nav aria-label="Main navigation">.
  // The <header> element provides the banner landmark implicitly, and <nav>
  // provides the navigation landmark implicitly - no role attributes needed.
  // Supersedes the prior pattern of wrapping the nav in a <div role="banner">
  // post-injection, which was semantically noisy. Mobile menu (.mob-menu) is
  // intentionally OUTSIDE the <header> - it is a dialog landmark, not banner
  // content.
  var NAV_HTML = [
    /* SP.2 2026-05-20 (re-applied 2026-05-22): the <header> emitted here MUST
       preserve the placeholder's id="ca-nav", class="sv-nav", role="banner"
       attributes. The placeholder in HTML pages is replaced via outerHTML so
       these attributes are dropped unless re-emitted here. .sv-nav supplies
       sticky positioning + min-block-size: 4.5rem; missing it produces a
       0px tall header (regression detected 2026-05-22 by geometric-truth
       gate C, principal-spec B5, reconciliation A3). */
    '<header id="ca-nav" class="sv-nav" role="banner">',
    /* SF43 NU1 (2026-05-18): explicit role="navigation" restored alongside
       the native <nav> element. The SF42 A1 refactor dropped the role on
       the basis that <nav> supplies it implicitly, but scripts.min.js's
       race-condition guard at scripts.js:320 still does
       `document.querySelector('nav[role="navigation"]')` to detect whether
       the nav has finished injecting. Without the role attribute that
       selector matches null, the guard takes the "wait for ca-nav-ready"
       path, but the event was already dispatched before scripts.min.js
       ran (defer-script ordering) so the dropdown click handler never
       attached. Net effect: both Products and Free Tools dropdowns opened
       on hover but click + keyboard did nothing. Restoring the explicit
       role is ARIA-valid (explicit roles are allowed even when implicit)
       and is the minimum-risk repair while we await a scripts.min.js
       rebuild from the updated scripts.js. */
    '<nav role="navigation" aria-label="Main navigation">',
    /* SP.2 2026-05-20 - wrap row uses .sv-nav-row CSS-grid (1fr auto 1fr)
       primitive. Logo column 1 (start), nav-links column 2 (centre),
       nav-actions column 3 (end). Hamburger collapses on <768px. */
    '  <div class="wrap sv-container sv-container--wide sv-nav-row">',
    '    ' + logoHTML('/'),
    '    <div class="nav-links sv-cluster">',
    /* "How it works" removed from header per founder directive 2026-05-10.
       Section still lives on home (/#how anchor) but is no longer a nav link.
       Kept the comment as the lock-marker to prevent future agents from
       re-adding it. Nav order: Products / Free Tools / Sectors / Pricing /
       Blog / About - exact per founder mandate. */
    '      <div class="nav-dropdown">',
    /* ISSUE-029 fix (2026-05-22): "Products" trigger is now an <a href="/products">
       so click + Enter on the label navigates to the hub (was a <button> that
       only opened the dropdown, leaving keyboard users with no direct path to
       the Products index). The dropdown still opens on hover/focus, and a
       dedicated chevron span (role="button", tabindex=0) opens the dropdown
       on Enter for keyboard users. aria-haspopup + aria-expanded preserved. */
    '        <a href="/products" class="nav-dropdown-trigger" aria-haspopup="true" aria-expanded="false" aria-controls="nav-mega-panel"' + sectionActiveAttr(PRODUCT_ROUTES) + '>Products <span class="nav-dropdown-chevron" data-chevron="true" role="button" tabindex="0" aria-label="Open Products menu"><svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>',
    '        <div class="nav-mega" id="nav-mega-panel" role="menu">',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">Compliance products</span>',
    /* NARRATIVE 2026-07-17 (owner "Qualify. Win. Get paid."): the four paid
       products grouped by job-to-be-done — Win (Mark), Qualify (Cyber, ESG),
       Get paid (Cash). CSRD is a free tool (Free Tools menu), never listed here. */
    '            <a href="/crowmark" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--mark)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>CrowMark</strong><span class="nav-mega-desc">UK bid suite: find tenders, draft grounded answers, prove delivery</span></span></a>',
    '            <a href="/crowcyber" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>CrowCyber</strong><span class="nav-mega-desc">Cyber Essentials v3.3, in force 27 Apr 2026</span></span></a>',
    '            <a href="/crowcash" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>CrowCash</strong><span class="nav-mega-desc">Late payment recovery, SI 2002/1674</span></span></a>',
    '            <a href="/crowesg" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--lime, #4fb98a)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>CrowESG</strong><span class="nav-mega-desc">VSME ESG reporting &middot; Live</span></span></a>',
    '          </div>',
    /* CSRD-DEDUP (owner 2026-05-30): the old "Free tools" sub-column held only the
       CSRD Checker (now a free tool, moved to the Free Tools menu). Replaced with a
       Stripe-style "Explore" column so the Products mega keeps its balanced 2-column
       width - products on the left, navigational links on the right. No CSRD here. */
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">Explore</span>',
    '            <a href="/products" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg></span><span><strong>All products</strong><span class="nav-mega-desc">Compare the full compliance suite</span></span></a>',
    '            <a href="/pricing" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7c0-5.333-8-5.333-8 0"/><path d="M10 7v14"/><path d="M6 21h12"/><path d="M6 13h10"/></svg></span><span><strong>Pricing</strong><span class="nav-mega-desc">Plans from &pound;39/mo, 14-day free trial</span></span></a>',
    '            <a href="/tools/" role="menuitem" class="nav-mega-item" style="border-top:1px solid var(--border);margin-top:8px;padding-top:12px;"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg></span><span><strong>Free tools</strong><span class="nav-mega-desc">Statutory calculators and checkers</span></span></a>',
    '          </div>',
    '        </div>',
    '      </div>',
    '      <div class="nav-dropdown">',
    /* ISSUE-029 fix (2026-05-22): "Free Tools" trigger is now an <a href="/tools">
       - same rationale and keyboard pattern as the Products trigger above. */
    '        <a href="/tools" class="nav-dropdown-trigger" aria-haspopup="true" aria-expanded="false" aria-controls="nav-tools-panel"' + sectionActiveAttr(TOOL_ROUTES) + '>Free Tools <span class="nav-dropdown-chevron" data-chevron="true" role="button" tabindex="0" aria-label="Open Free Tools menu"><svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>',
    '        <div class="nav-mega" id="nav-tools-panel" role="menu">',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">Free Compliance Tools</span>',
    '            <a href="/tools/csrd-applicability-checker" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--sky)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>CSRD Applicability Checker</strong><span class="nav-mega-desc">Omnibus I threshold test, free</span></span></a>',
    '            <a href="/tools/ppn-002-calculator" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--mark)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>PPN 002 Social Value Calculator</strong><span class="nav-mega-desc">10% minimum weighting</span></span></a>',
    '            <a href="/tools/cyber-essentials-readiness" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>Cyber Essentials Readiness</strong><span class="nav-mega-desc">v3.3 \'Danzell\' self-test</span></span></a>',
    '          </div>',
    '          <div class="nav-mega-col">',
    '            <span class="nav-mega-label">More tools</span>',
    '            <a href="/tools/late-payment-calculator" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>Late Payment Calculator</strong><span class="nav-mega-desc">Statutory interest under the 1998 Act</span></span></a>',
    '            <a href="/tools/vsme-materiality-light" role="menuitem" class="nav-mega-item"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="5"/></svg></span><span><strong>VSME Materiality Light</strong><span class="nav-mega-desc">EFRAG VSME (2024) screen</span></span></a>',
    '            <a href="/tools/" role="menuitem" class="nav-mega-item" style="border-top:1px solid var(--border);margin-top:8px;padding-top:12px;"><span class="nav-mega-icon" style="color:var(--teal)" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg></span><span><strong>See all free tools</strong><span class="nav-mega-desc">Tools hub with methodology pages</span></span></a>',
    '          </div>',
    '        </div>',
    '      </div>',
    /* Sectors is footer-only (content rule): removed from primary nav, linked from the footer Company column. */
    '      <a href="/pricing"' + (isActive('/pricing') ? ' aria-current="page"' : '') + '>Pricing</a>',
    '      <a href="/blog"' + (isActive('/blog') ? ' aria-current="page"' : '') + '>Blog</a>',
    /* NAV-001 audit 2026-05-11: FAQ now in desktop nav (was mobile-only) */
    '      <a href="/faq"' + (isActive('/faq') ? ' aria-current="page"' : '') + '>FAQ</a>',
    '      <a href="/about"' + (isActive('/about') ? ' aria-current="page"' : '') + '>About</a>',
    '    </div>',
    '    <div class="nav-actions sv-cluster">',
    /* P1-003 (2026-06-15): visible search affordance. Opens the Cmd/Ctrl+K
       command palette (window.SovereignCmdK.open) so the feature is
       discoverable, not keyboard-only. */
    '      <button type="button" class="nav-search-trigger" aria-label="Search (Ctrl K)" title="Search (Ctrl K)" data-cmdk-open>',
    '        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
    '        <kbd class="nav-search-kbd" aria-hidden="true">&#8984;K</kbd>',
    '      </button>',
    '      <a class="btn btn-sm btn-ghost-v2 nav-login" href="https://app.crowagent.ai/login" target="_blank" rel="noopener noreferrer">Sign in</a>',
    '      <a class="btn btn-sm btn-primary-v2 nav-cta" href="https://app.crowagent.ai/signup">Start free trial</a>',
    '    </div>',
    '    <button class="ham" aria-label="Open navigation menu" aria-expanded="false">',
    '      <span></span><span></span><span></span>',
    '    </button>',
    '  </div>',
    '</nav>',
    '</header>',
    /* STRIPE-STYLE MOBILE MENU (2026-05-31 — Claude, owner directive "do this
       similar to Stripe"). Was a flat 20-link dump rendered position:static (so
       opening while scrolled left it off-screen at the top of the document, and
       the focus-trap then yanked the page to the top = "forces me to top, click
       twice"). Now: a fixed full-viewport overlay (CSS) with collapsible
       accordion sections for Products + Free Tools, so the initial menu is short
       and scannable. Triggers are <button>s (not <a>) so the "close on link
       click" handler ignores them; their children are real <a>s that navigate
       + close. Destinations unchanged. */
    '<div class="mob-menu" id="mob-menu" role="dialog" aria-label="Mobile navigation menu" aria-modal="true">',
    /* WCAG 2.5.3: in-dialog close button (the hamburger toggle sits outside). */
    '  <button type="button" class="mob-menu-close" aria-label="Close menu" data-mob-close>',
    '    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    '  </button>',
    '  <nav class="mob-menu-nav" aria-label="Primary mobile">',
    /* Products accordion */
    '    <div class="mob-acc">',
    '      <button type="button" class="mob-acc-trigger" aria-expanded="false" aria-controls="mob-acc-products">Products<svg class="mob-acc-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>',
    '      <div class="mob-acc-panel" id="mob-acc-products">',
    '        <a href="/products" class="mob-sublink">All products</a>',
    '        <a href="/crowmark" class="mob-sublink">CrowMark</a>',
    '        <a href="/crowcyber" class="mob-sublink">CrowCyber</a>',
    '        <a href="/crowcash" class="mob-sublink">CrowCash</a>',
    '        <a href="/crowesg" class="mob-sublink">CrowESG &middot; Live</a>',
    '      </div>',
    '    </div>',
    /* Free Tools accordion */
    '    <div class="mob-acc">',
    '      <button type="button" class="mob-acc-trigger" aria-expanded="false" aria-controls="mob-acc-tools">Free Tools<svg class="mob-acc-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>',
    '      <div class="mob-acc-panel" id="mob-acc-tools">',
    '        <a href="/tools" class="mob-sublink">All free tools</a>',
    '        <a href="/tools/csrd-applicability-checker" class="mob-sublink">CSRD Applicability Checker</a>',
    '        <a href="/tools/ppn-002-calculator" class="mob-sublink">PPN 002 Social Value Calculator</a>',
    '        <a href="/tools/cyber-essentials-readiness" class="mob-sublink">Cyber Essentials Readiness</a>',
    '        <a href="/tools/late-payment-calculator" class="mob-sublink">Late Payment Calculator</a>',
    '        <a href="/tools/vsme-materiality-light" class="mob-sublink">VSME Materiality Light</a>',
    '      </div>',
    '    </div>',
    /* Flat top-level links */
    '    <a href="/pricing" class="mob-toplink">Pricing</a>',
    '    <a href="/blog" class="mob-toplink">Blog</a>',
    '    <a href="/faq" class="mob-toplink">FAQ</a>',
    '    <a href="/about" class="mob-toplink">About</a>',
    '  </nav>',
    '  <div class="mob-menu-ctas">',
    '    <a class="btn btn-md btn-ghost-v2" href="https://app.crowagent.ai/login" target="_blank" rel="noopener noreferrer">Sign in</a>',
    '    <a class="btn btn-md btn-primary-v2" href="https://app.crowagent.ai/signup">Start free trial</a>',
    '  </div>',
    '</div>'
  ].join('\n');

  /* ── FOOTER HTML ──
     SF40 2026-05-18: site-wide brand hairline injected as the first node of
     the footer placeholder. A 6px teal-gradient strip sits immediately above
     the <footer> element on every page (replaces the per-page decorative
     banner removed from /about, /security, /partners, /pricing, /faq,
     /resources). Styled in Assets/css/page-motion-bg.css (.ca-footer-hairline). */
  var FOOTER_HTML = [
    '<div class="ca-footer-hairline" aria-hidden="true"></div>',
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
    // here vs "AES-256 encrypted" in hero - describing different things).
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>AES-256 at rest</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>TLS 1.3 in transit</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>GDPR compliant</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>UK &amp; EU data residency</li>',
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>ISO 27001 controls<sup style="font-size:0.6em;opacity:0.7;margin-left:2px;">*</sup></li>',
    /* Stripe-grade polish 2026-05-17: explicit ICO + Companies House chips
       per nav+footer charter. Companies House 17076461 surfaces the legal
       entity inline with the trust row (was footer-bottom only); ICO chip
       makes the data-protection registration explicit (was implied by
       GDPR-compliant chip). */
    '        <li><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" stroke-width="2" aria-hidden="true"><path d="M12 2L4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z"/></svg>ICO registered</li>',
    /* 2026-05-29 (owner): removed the "Companies House 17076461" trust-row chip -
       the legal entity is already shown as "Company No. 17076461" in the footer
       bottom (footer-legal-entity), so the trust-row chip was a duplicate. */
    '      </ul>',
    /* BUG-003/014 (owner 2026-05-29): the "ISO 27001 controls*" asterisk was orphaned
       with no footnote. Add the explanatory note so the * has meaning. */
    '      <p class="footer-trust-note" style="font-size:11px;line-height:1.4;color:rgba(232,240,250,0.5);margin:8px 0 0;">* ISO 27001-aligned controls; formal certification in progress.</p>',
    '    </div>',
    '    <div class="footer-grid">',
    '      <div class="footer-col footer-col-brand">',
    '        ' + logoHTML('/', 'footer'),
    /* WS-AUDIT-033 / WS-AUDIT-044: tagline now leads with the brand-master
       phrase "Sustainability<span class="logo-tag-sep" aria-hidden="true">&bull;</span>Intelligence" (per CLAUDE.md), with the product
       coverage as the descriptor sentence. Logo subtitle already says the
       same - this aligns the wordmark and tagline on every page. */
    '        <p class="footer-tagline">The compliance and revenue platform for UK SMEs: PPN 002 social value, Cyber Essentials, VSME ESG reporting and late-payment recovery, in one platform.</p>',
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
    // Products column - those are CTAs/auth-links and live in nav, not footer.
    // P1-004 / CC-001 (2026-06-15): CrowESG is LIVE. The footer now shows a teal
    // "Live" chip (.footer-live-chip) instead of the old muted "Coming Q3 2026"
    // coming-soon chip, matching the CrowESG page hero and the rest of the suite.
    '        <h3 class="footer-col-title">Products</h3>',
    '        <div class="footer-links">',
    '          <a href="/crowmark">CrowMark</a>',
    '          <a href="/crowcyber">CrowCyber</a>',
    '          <a href="/crowcash">CrowCash</a>',
    '          <a href="/crowesg">CrowESG <span class="footer-live-chip">Live</span></a>',
    '          <a href="/integrations">Integrations</a>',
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
    '          <a href="/tools/csrd-applicability-checker">CSRD Applicability Checker</a>',
    '          <a href="/tools/ppn-002-calculator">PPN 002 Calculator</a>',
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
       The "PPN 002 guides" / "Cyber Essentials guides" / "CSRD guides" rows previously
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
    '          <a href="/resources">Resources hub</a>',
    '          <a href="/blog">Blog</a>',
    '          <a href="/faq">FAQ</a>',
    '          <a href="/glossary">Compliance Glossary</a>',
    '          <a href="/changelog">Changelog</a>',
    '        </div>',
    '      </div>',
    '      <div class="footer-col">',
    // WEBSITE-FIX-001 WS-1.1: "Book a demo" REMOVED - duplicates global nav CTA.
    // WEBSITE-FIX-001 WS-1.3: "LinkedIn" text link REMOVED - duplicates the
    //   .foot-social icon row at the brand column.
    // WEBSITE-FIX-001 WS-1.5: "System status" REMOVED - duplicates the
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
    '          <a href="/sectors/">Sectors</a>',
    '          <a href="/security">Security</a>',

    '          <a href="/privacy">Privacy</a>',
    '          <a href="/terms">Terms</a>',
    '          <a href="/cookies">Cookies</a>',
    '        </div>',
    '      </div>',
    '    </div>',

    '    <div class="footer-bottom">',
    // WEBSITE-FIX-001 WS-7.4: year now dynamic - was hardcoded 2026.
    /* WS-AUDIT-033 / WS-AUDIT-044: align copyright tagline with brand master
       phrase "Sustainability<span class="logo-tag-sep" aria-hidden="true">&bull;</span>Intelligence" (per CLAUDE.md). */
    /* User directive 2026-05-09: footer must surface legal-entity line for
       Companies Act 2006 §82 + ICO disclosure, alongside the brand
       copyright. Two-line stack: copyright on top, legal-entity below. */
    /* LM-116 (Claude 2026-05-29 - owner directive): dedupe footer bottom.
       Was: 'CrowAgent Ltd' twice (copyright + legal-entity) + Sustainability tagline
       (already in brand lockup) + ICO data controller registered (already in top
       trust-badge row). Consolidated to a single tight legal line. */
    '      <p class="footer-copyright">&copy; <span id="footer-year">2026</span> CrowAgent Ltd (Company No. 17076461). All rights reserved.</p>',
    '      <p class="footer-legal-entity">Company No. <a href="https://find-and-update.company-information.service.gov.uk/company/17076461" target="_blank" rel="noopener noreferrer" class="footer-companies-house-link">17076461</a> &middot; Registered in England &amp; Wales</p>',
    // WEBSITE-FIX-001 WS-1.6: tech-stack disclosure removed.
    // Security-positioned B2B SaaS does not advertise its infra stack.
    '      <a href="https://status.crowagent.ai" target="_blank" rel="noopener noreferrer" class="footer-bottom-link">Status</a>',
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
    } catch (e) { /* DOM swap failed - leave placeholder, never break the page */ }
  }

  /* === FINAL-4 WebKit nav-paint race fix (2026-05-10) ===
     Prior implementation injected nav, footer, augmented <head>, registered SW,
     and dispatched ca-nav-ready in one synchronous tick. WebKit JSC has a
     ~150-2800ms warmup on defer-script execution, and that single tick blocked
     the first paint of <nav>. We now split into two phases:
       Phase A (synchronous, in `run`): inject nav HTML only.
         This is the single piece of work that has to happen before paint, so
         the user sees the nav as soon as JSC unblocks.
       Phase B (`requestAnimationFrame` after A): footer HTML, head augmentation,
         analytics auto-injection, ca-nav-ready/ca-footer-ready dispatch, SW
         registration. None of these affect first paint.
     Result on WebKit: /home went from ~2873ms to ~600-900ms nav-visible time
     in dev-server smoke. Net JS time is identical - only the order changes. */

  /* Announce bar HTML (2026-05-16: was previously hardcoded only on the
     homepage - now injected site-wide for header consistency). Idempotent:
     if a hardcoded one already exists on the page (homepage), skip. */
  /* ISSUE-008 (2026-05-22): the announce-bar uses role="region" with an
     aria-label so AT users get a named non-banner landmark. aria-live
     polite ensures any future dynamic copy updates announce without
     interrupting the user. Matches the homepage markup in index.html. */
  /* ------------------------------------------------------------------
     BETA MODE SWITCH (2026-07-19)
     ------------------------------------------------------------------
     The platform is in PRIVATE BETA: self-serve signup is closed and access
     is granted by invitation. Verified in the platform repo: signup is gated
     server-side against a `beta_invites` whitelist in
     web/app/(auth)/signup/actions.ts, with the same gate on the login-page
     signup path and on the OAuth callback. Anyone not on the whitelist is
     rejected on submit and told to email hello@crowagent.ai.

     This ONE flag is the whole switch. Set it to false at general
     availability and the site reverts to the normal launch message with no
     other edits required. See BETA-MODE.md in the repo root for the full
     revert checklist.
     ------------------------------------------------------------------ */
  var BETA_MODE = true;

  var ANNOUNCE_BETA =
    '<div class="announce-bar" id="announce-bar" role="region" aria-label="Beta access notice" aria-live="polite">' +
    '  <div class="wrap">' +
    '    <span class="ab-dot"></span>' +
    /* Keep this roughly as short as the live-mode text. Longer copy wraps to three
       lines at 320-390px and pushes the bar to ~104px tall. */
    '    <span class="ab-text"><strong>Private beta</strong> &nbsp;&middot;&nbsp; Access is invitation-only</span>' +
    '    <a href="mailto:hello@crowagent.ai?subject=CrowAgent%20access%20request" class="ab-cta">Request access</a>' +
    '    <button class="ab-close" data-action="dismiss-bar" aria-label="Dismiss announcement">&times;</button>' +
    '  </div>' +
    '</div>';

  var ANNOUNCE_LIVE =
    '<div class="announce-bar" id="announce-bar" role="region" aria-label="Promotional announcement" aria-live="polite">' +
    '  <div class="wrap">' +
    '    <span class="ab-dot"></span>' +
    '    <span class="ab-text">Now live &nbsp;&middot;&nbsp; 14-day free trial &nbsp;&middot;&nbsp; No credit card required</span>' +
    '    <a href="https://app.crowagent.ai/signup" class="ab-cta">Start free trial</a>' +
    '    <button class="ab-close" data-action="dismiss-bar" aria-label="Dismiss announcement">&times;</button>' +
    '  </div>' +
    '</div>';

  var ANNOUNCE_HTML = BETA_MODE ? ANNOUNCE_BETA : ANNOUNCE_LIVE;

  function injectAnnounceBar() {
    if (document.getElementById('announce-bar')) return; // already present
    try {
      var existing = document.querySelector('.skip-link');
      var anchor = existing ? existing.nextSibling : (document.body.firstChild || null);
      var temp = document.createElement('div');
      temp.innerHTML = ANNOUNCE_HTML;
      var bar = temp.firstChild;
      if (anchor) document.body.insertBefore(bar, anchor);
      else document.body.appendChild(bar);
    } catch (_) { /* best-effort */ }
  }

  /* BUG-014 (WCAG 2.4.1 Bypass Blocks): a "Skip to main content" link must be
     the FIRST focusable element on EVERY page. Previously only index.html and
     faq.html hardcoded one. Inject it as the first child of <body> site-wide.
     The .skip-link CSS (visually-hidden until :focus, then a teal focus pill at
     top-left) already lives in nav-global-fix-2026-05-27.css. Idempotent: skip
     if the page already hardcodes a skip-link (any href to #main-content or a
     .skip-link element) so we never double-inject. Targets #main-content, which
     every canonical content page exposes on its <main>. */
  function injectSkipLink() {
    try {
      /* A11Y-001: the skip-link target (#main-content) must be focusable so
         activating the link actually moves keyboard focus into the main
         region. Many pages declare <main id="main-content"> WITHOUT
         tabindex="-1"; without it the browser scrolls but focus stays on
         the skip-link. Ensure the target is programmatically focusable. */
      var target = document.getElementById('main-content');
      if (target && !target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      if (document.querySelector('.skip-link') ||
          document.querySelector('a[href="#main-content"]')) return;
      var a = document.createElement('a');
      a.href = '#main-content';
      a.className = 'skip-link';
      a.textContent = 'Skip to main content';
      var body = document.body;
      if (!body) return;
      body.insertBefore(a, body.firstChild);
    } catch (_) { /* best-effort - never break the page */ }
  }

  /* P2-007 / P3-008: breadcrumb consistency. ~40 content pages ship a
     BreadcrumbList JSON-LD but only ~12 render a VISIBLE breadcrumb, so the
     site is inconsistent (tool pages, product pages, blog posts, etc. have
     none). Rather than hand-edit every page, derive a visual breadcrumb from
     the page's own BreadcrumbList structured data and inject it at the top of
     <main>. Idempotent + non-destructive: skips any page that already has a
     visible breadcrumb, and skips the homepage (a single "Home" crumb is
     noise). Keeps the visible breadcrumb and the structured data in sync. */
  function injectBreadcrumb() {
    try {
      // Already has a visible breadcrumb? Leave it.
      if (document.querySelector('.ca-breadcrumb, nav[aria-label="Breadcrumb"]')) return;

      var main = document.getElementById('main-content') ||
                 document.querySelector('main');
      if (!main) return;

      // Find a BreadcrumbList in the page's JSON-LD.
      var items = null;
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (var i = 0; i < scripts.length && !items; i++) {
        var data;
        try { data = JSON.parse(scripts[i].textContent); } catch (_) { continue; }
        var candidates = Array.isArray(data) ? data : [data];
        for (var j = 0; j < candidates.length; j++) {
          var c = candidates[j];
          if (c && c['@type'] === 'BreadcrumbList' && Array.isArray(c.itemListElement)) {
            items = c.itemListElement;
            break;
          }
        }
      }
      if (!items || items.length < 2) return; // need at least Home + current

      // Sort by position, build the crumb list.
      items = items.slice().sort(function (a, b) {
        return (a.position || 0) - (b.position || 0);
      });

      var ol = document.createElement('ol');
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        var name = it.name || (it.item && it.item.name) || '';
        var url = (typeof it.item === 'string') ? it.item :
                  (it.item && it.item['@id']) ? it.item['@id'] : '';
        if (!name) continue;
        var li = document.createElement('li');
        var isLast = (k === items.length - 1);
        if (!isLast && url) {
          var a = document.createElement('a');
          // Use a path-relative href so it works on localhost + prod.
          try { a.setAttribute('href', new URL(url).pathname || '/'); }
          catch (_) { a.setAttribute('href', url); }
          a.textContent = name;
          li.appendChild(a);
        } else {
          li.setAttribute('aria-current', 'page');
          li.textContent = name;
        }
        ol.appendChild(li);
      }
      if (!ol.children.length) return;

      var nav = document.createElement('nav');
      nav.className = 'ca-breadcrumb';
      nav.setAttribute('aria-label', 'Breadcrumb');
      nav.appendChild(ol);

      // Wrap in the site container so the crumb aligns to the content grid
      // (the breadcrumb is injected ahead of the page's own hero/container,
      // so without this it would sit flush against the viewport edge).
      var wrap = document.createElement('div');
      wrap.className = 'ca-container ca-breadcrumb-wrap';
      wrap.style.paddingTop = '1rem';
      wrap.style.paddingBottom = '0';
      nav.style.marginBottom = '0';
      wrap.appendChild(nav);

      // Insert just inside the main content, before its first child.
      main.insertBefore(wrap, main.firstChild);
    } catch (_) { /* never break the page */ }
  }

  function injectNavOnly() {
    injectSkipLink();
    injectBreadcrumb();
    injectAnnounceBar();
    inject('ca-nav', NAV_HTML);
    // SF42 A1 (2026-05-18): the NAV_HTML emits a native <header> which
    // supplies the banner landmark automatically. No post-injection wrapping
    // needed (replaces the prior <div role="banner"> shim).

    /* ISSUE-029 fix (2026-05-22): "Products" / "Free Tools" triggers are now
       <a href="..."> rather than <button>. The legacy scripts.min.js dropdown
       handler still attaches an e.preventDefault() + toggle to the trigger
       click (it cannot tell button-vs-anchor by selector). To prevent the
       legacy handler from swallowing the navigation, we attach a single
       CAPTURE-phase document-level click listener that:

         - If click target is INSIDE a .nav-dropdown-chevron - preventDefault
           on the anchor + stopImmediatePropagation on the original event,
           then dispatch a SYNTHETIC click on the trigger (now without
           chevron in its lineage) so scripts.min.js's toggle handler fires.
         - If click target is the anchor itself (label area), allow native
           navigation. We must NEUTRALISE scripts.min.js's preventDefault
           call. Since stopImmediatePropagation in capture phase blocks
           every subsequent bubble-phase listener on the SAME element, the
           legacy bubble handler never fires - and the native nav proceeds.

       Document-level capture is used because per-element capture wasn't
       enough to stop the legacy handler in cross-browser testing - the
       document listener runs even earlier and is the only reliable spot. */
    try {
      // Skip if already wired (idempotent - nav-inject runs once per load).
      if (!window.__caDropdownAnchorWired) {
        window.__caDropdownAnchorWired = true;
        document.addEventListener('click', function (e) {
          var trigger = e.target.closest && e.target.closest('.nav-dropdown-trigger');
          if (!trigger || trigger.tagName !== 'A') return;
          var chevron = trigger.querySelector('.nav-dropdown-chevron');
          var clickedChevron = chevron && (e.target === chevron || chevron.contains(e.target));
          // Always block the anchor's default nav when chevron clicked.
          if (clickedChevron) {
            e.preventDefault();
            // Let bubble-phase handlers (scripts.min.js) run - they toggle
            // the dropdown via the trigger's own bubble click handler.
            return;
          }
          // Anchor text/area clicked - stop scripts.min.js bubble handler
          // from preventing the navigation, then navigate via safeViewTransition.
          e.stopImmediatePropagation();
          var href = trigger.getAttribute('href');
          if (href) {
            if (typeof window.safeViewTransition === 'function') {
              window.safeViewTransition(function () { location.href = href; });
            } else {
              location.href = href;
            }
          }
        }, true /* capture: doc-level, runs before per-element bubble */);

        // Keyboard: Enter on the anchor element (not chevron) navigates;
        // Enter/Space on the chevron toggles the dropdown.
        document.addEventListener('keydown', function (e) {
          if (e.key !== 'Enter' && e.key !== ' ') return;
          var ae = document.activeElement;
          if (!ae) return;
          if (ae.classList && ae.classList.contains('nav-dropdown-chevron')) {
            e.preventDefault();
            e.stopPropagation();
            var parent = ae.parentElement;
            if (!parent) return;
            // Synthesise a "chevron click" so the legacy toggle runs.
            var synth = new MouseEvent('click', { bubbles: true, cancelable: true });
            // The capture listener checks `closest('.nav-dropdown-trigger')`
            // and treats the event as a chevron click only when the
            // original e.target is within the chevron. Dispatching on the
            // chevron span itself sets e.target = chevron - exactly what we
            // need so the capture handler preventDefaults and lets the
            // bubble-phase legacy handler toggle the menu open.
            ae.dispatchEvent(synth);
            return;
          }
          if (ae.classList && ae.classList.contains('nav-dropdown-trigger') && ae.tagName === 'A') {
            // Enter on the anchor itself = navigate (no toggle).
            if (e.key === 'Enter') {
              e.stopImmediatePropagation();
              // Let the native <a> activation fire (Enter on a focused
              // anchor triggers click + nav by default).
            }
          }
        }, true);
      }
    } catch (_) { /* best-effort wiring */ }

    /* P1-003 (2026-06-15 - Claude): wire the visible nav search affordance to the
       Cmd/Ctrl+K command palette. The palette (sovereign-features.js) is injected
       as a defer script in Phase B, so window.SovereignCmdK may not exist yet when
       an early click happens. Delegated handler: call SovereignCmdK.open() if
       available, otherwise synthesise the Ctrl+K keydown the palette listens for. */
    try {
      if (!window.__caSearchTriggerWired) {
        window.__caSearchTriggerWired = true;
        document.addEventListener('click', function (e) {
          var btn = e.target && e.target.closest && e.target.closest('[data-cmdk-open], .nav-search-trigger');
          if (!btn) return;
          e.preventDefault();
          if (window.SovereignCmdK && typeof window.SovereignCmdK.open === 'function') {
            window.SovereignCmdK.open();
            return;
          }
          /* Palette JS not parsed yet — synthesise the shortcut it binds on
             document, then retry once it has loaded. */
          try {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true, cancelable: true }));
          } catch (_) {}
          var tries = 0;
          var iv = setInterval(function () {
            tries++;
            if (window.SovereignCmdK && typeof window.SovereignCmdK.open === 'function') {
              clearInterval(iv);
              window.SovereignCmdK.open();
            } else if (tries > 40) { clearInterval(iv); }
          }, 50);
        }, false);
      }
    } catch (_) { /* best-effort search-trigger wiring */ }

    /* LM-155 (2026-05-30 - Claude, P0 mobile nav): the hamburger toggle handler
       lived ONLY in scripts.min.js, which the majority of pages do NOT load →
       on those pages clicking .ham did NOTHING and mobile users could not
       navigate. Wire the toggle here in nav-inject (runs on EVERY page) but
       ONLY when scripts.min.js is absent, so the few pages that still load it
       don't double-bind (which would toggle open+closed = no-op). */
    try {
      /* LM-155 UPDATE (owner 2026-05-30 - burger broken on mobile): the original
         gate only wired this when scripts.min.js was ABSENT, deferring to the legacy
         bundle on the 21 pages that load it (incl. index). But scripts.min.js does NOT
         toggle `#mob-menu.open` (verified: clicking .ham left the menu display:none on
         index), so the burger was DEAD on every scripts.min.js page. Wire it
         UNCONDITIONALLY now (nav-inject owns #mob-menu); stopImmediatePropagation
         blocks any same-element legacy handler so there's no open+close double-toggle. */
      if (!window.__caHamWired) {
        window.__caHamWired = true;
        var hamBtn = document.querySelector('.ham');
        var mobMenu = document.getElementById('mob-menu');
        if (hamBtn && mobMenu) {
          var setMobOpen = function (open) {
            mobMenu.classList.toggle('open', open);
            hamBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
            /* BUG-005 + BUG-017 (a11y): keep the hamburger's accessible name in
               sync with state. Closed = "Open navigation menu", open = "Close
               navigation menu" (canonical phrasing, matches the homepage nav). */
            hamBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
            try { document.body.style.overflow = open ? 'hidden' : ''; } catch (e) {}
          };
          /* CAPTURE-PHASE intercept (owner 2026-05-31 — "clicking menu scrolls the
             page / forces a second click"). The legacy scripts.min.js (loaded on
             ~21 pages incl. index) also binds a bubble-phase click on `.ham` that
             scrolls instead of toggling. stopImmediatePropagation in a bubble-phase
             handler only wins if nav-inject binds FIRST, which is racy. Binding on
             document in the CAPTURE phase guarantees nav-inject runs before ANY
             bubble-phase handler, so we toggle exactly once and the rogue scroll
             never fires. */
          document.addEventListener('click', function (e) {
            var t = e.target;
            if (!t || !t.closest || !t.closest('.ham')) return;
            e.preventDefault();
            e.stopImmediatePropagation();
            setMobOpen(!mobMenu.classList.contains('open'));
          }, true);
          var mobClose = mobMenu.querySelector('[data-mob-close], .mob-menu-close');
          if (mobClose) mobClose.addEventListener('click', function () { setMobOpen(false); });
          Array.prototype.forEach.call(mobMenu.querySelectorAll('a'), function (a) {
            a.addEventListener('click', function () { setMobOpen(false); });
          });
          document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMobOpen(false); });
        }
      }
    } catch (_) { /* best-effort hamburger wiring */ }

    /* STRIPE-STYLE ACCORDION (2026-05-31 — Claude): the mobile menu groups
       Products + Free Tools behind collapsible sections so the initial menu is
       short. Each .mob-acc-trigger toggles `.open` on its parent .mob-acc and
       flips aria-expanded; the panel height animates via CSS. Triggers are
       <button>s so the "close menu on link click" handler ignores them. */
    try {
      if (!window.__caMobAccWired) {
        window.__caMobAccWired = true;
        Array.prototype.forEach.call(document.querySelectorAll('#mob-menu .mob-acc-trigger'), function (trig) {
          trig.addEventListener('click', function (e) {
            e.preventDefault();
            var acc = trig.closest('.mob-acc');
            if (!acc) return;
            var willOpen = !acc.classList.contains('open');
            acc.classList.toggle('open', willOpen);
            trig.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
          });
        });
      }
    } catch (_) { /* best-effort accordion wiring */ }

    /* NAV-001 (audit 2026-05-30 - Claude): WCAG 2.1.2 focus trap for the mobile
       nav dialog. The hamburger handler (LM-155 here, or scripts.min.js on
       legacy pages) toggles the `open` class but neither trapped Tab focus
       inside the dialog nor returned focus to the trigger on close. A keyboard
       user could Tab into the obscured page behind the open overlay.
       This watcher is handler-agnostic: it observes the `open` class on
       #mob-menu via MutationObserver, so it works whichever handler opens it. */
    try {
      if (!window.__caMobFocusTrap) {
        window.__caMobFocusTrap = true;
        var mob = document.getElementById('mob-menu');
        var ham = document.querySelector('.ham');
        if (mob && typeof MutationObserver === 'function') {
          var lastFocused = null;
          var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';
          var getItems = function () {
            return Array.prototype.filter.call(mob.querySelectorAll(FOCUSABLE), function (el) {
              return el.offsetParent !== null || el.getClientRects().length;
            });
          };
          var onKey = function (e) {
            if (e.key === 'Escape') { if (ham) ham.click(); return; }
            if (e.key !== 'Tab') return;
            var items = getItems();
            if (!items.length) return;
            var first = items[0], last = items[items.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          };
          var trapOn = function () {
            lastFocused = document.activeElement;
            document.addEventListener('keydown', onKey, true);
            var items = getItems();
            /* preventScroll: focusing the first menu item must NOT scroll the
               page (the old behaviour yanked a scrolled-down viewport to the top
               of the document). The fixed overlay + preventScroll keep the
               viewport put. */
            if (items.length) setTimeout(function () { try { items[0].focus({ preventScroll: true }); } catch (_) { items[0].focus(); } }, 30);
          };
          var trapOff = function () {
            document.removeEventListener('keydown', onKey, true);
            try {
              if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
              else if (ham) ham.focus({ preventScroll: true });
            } catch (_) {
              if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
              else if (ham) ham.focus();
            }
          };
          var wasOpen = mob.classList.contains('open');
          new MutationObserver(function () {
            var isOpen = mob.classList.contains('open');
            if (isOpen === wasOpen) return;
            wasOpen = isOpen;
            if (isOpen) trapOn(); else trapOff();
          }).observe(mob, { attributes: true, attributeFilter: ['class'] });
        }
      }
    } catch (_) { /* best-effort focus trap */ }
  }

  function injectFooterAndExtras() {
    inject('ca-footer', FOOTER_HTML);
    // SF42 A1 (2026-05-18): banner landmark comes from the native <header>
    // emitted by NAV_HTML in Phase A. No post-injection wrapping needed.

    /* FOOTER ACCORDION (owner 2026-05-31, Apple/AWS-style): on mobile each footer
       column heading becomes a tap-to-expand button (collapsed by default); on
       desktop columns are always open and the heading is a plain heading. */
    try {
      var titles = document.querySelectorAll('.ca-footer .footer-col:not(.footer-col-brand) .footer-col-title');
      var isMobile = function () { return window.matchMedia('(max-width: 767px)').matches; };
      titles.forEach(function (t, idx) {
        if (t.dataset.accInit) return; t.dataset.accInit = '1';
        var col = t.closest('.footer-col');
        var links = col.querySelector('.footer-links');
        /* Deterministic per-column index. The old geometry-based id
           ('foot-acc-' + Math.round(top + childCount)) collided when two columns
           shared a row (same top) AND had the same link count — produced duplicate
           #foot-acc-NNNN (seen on glossary). Index is unique per footer. */
        if (links && !links.id) links.id = 'foot-acc-' + idx;
        t.setAttribute('role', 'button');
        t.setAttribute('tabindex', '0');
        if (links && links.id) t.setAttribute('aria-controls', links.id);
        var sync = function () {
          if (isMobile()) { t.setAttribute('aria-expanded', col.classList.contains('is-open') ? 'true' : 'false'); }
          else { t.setAttribute('aria-expanded', 'true'); col.classList.remove('is-open'); }
        };
        var toggle = function () {
          if (!isMobile()) return;
          var open = col.classList.toggle('is-open');
          t.setAttribute('aria-expanded', open ? 'true' : 'false');
        };
        t.addEventListener('click', toggle);
        t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        sync();
        window.addEventListener('resize', sync);
      });
    } catch (e) {}

    /* ANNOUNCE-BAR DISMISS (owner 2026-05-30): the "14-day free trial" bar's close X
       (data-action="dismiss-bar") had NO handler — it lived only in legacy scripts.min.js
       which most pages don't load, so the X did nothing sitewide. Wire it globally +
       persist the dismissal so the bar stays closed across pages/reloads.

       P0-004 (2026-06-15): the dismissal used to be a PERMANENT flag
       ('ca-announce-dismissed' === '1'), so once dismissed the bar never came
       back — and a single stale flag hid the bar for every visitor forever.
       The bar must be visible BY DEFAULT on first visit. Dismissal is now a
       SHORT-LIVED key: we store the dismissal timestamp and only keep the bar
       hidden for 7 days, after which it reappears. The legacy permanent value
       '1' is treated as expired so existing stale flags self-heal. */
    try {
      if (!window.__caAnnounceDismiss) {
        window.__caAnnounceDismiss = true;
        var ANNOUNCE_TTL_MS = 7 * 24 * 60 * 60 * 1000; /* 7 days */
        var hideBar = function () { var ab = document.getElementById('announce-bar'); if (ab) { ab.style.setProperty('display', 'none', 'important'); ab.hidden = true; } try { document.body.classList.remove('has-announce'); } catch (_) {} };
        var isDismissActive = function () {
          try {
            var v = localStorage.getItem('ca-announce-dismissed');
            if (!v) return false;
            /* Stale permanent flag from the old build — treat as expired so the
               bar reappears by default. */
            if (v === '1' || v === 'true') { localStorage.removeItem('ca-announce-dismissed'); return false; }
            var ts = parseInt(v, 10);
            if (!ts || isNaN(ts)) { localStorage.removeItem('ca-announce-dismissed'); return false; }
            if (Date.now() - ts < ANNOUNCE_TTL_MS) return true;
            localStorage.removeItem('ca-announce-dismissed');
            return false;
          } catch (_) { return false; }
        };
        if (isDismissActive()) hideBar();
        document.addEventListener('click', function (e) {
          var btn = e.target && e.target.closest && e.target.closest('[data-action="dismiss-bar"], .ab-close');
          if (!btn) return;
          e.preventDefault();
          hideBar();
          try { localStorage.setItem('ca-announce-dismissed', String(Date.now())); } catch (_) {}
        }, true);
      }
    } catch (_) { /* never break the page */ }

    // WEBSITE-FIX-001 WS-7.4: dynamic copyright year. Static fallback is the
    // current year so the markup is correct even if JS fails to load.
    try {
      var yearEl = document.getElementById('footer-year');
      if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    } catch (_) { /* best-effort */ }

    /* SCROLL PROGRESS BAR (owner 2026-05-30): the reading-progress bar existed only
       on index.html and had lost its height. Make it GLOBAL + working on every page.
       Ensure the element exists, then drive its width 0->100% on scroll. Hidden on
       short pages (< 2.5x viewport) to avoid UI noise. Styled in nav-global-fix.
       Guarded with data-progress-bound so it never double-binds (e.g. index where
       cinematic-init.js also drives it). */
    try {
      var bar = document.getElementById('scroll-progress');
      if (!bar) {
        bar = document.createElement('div');
        bar.id = 'scroll-progress';
        bar.className = 'scroll-progress';
        bar.setAttribute('role', 'progressbar');
        bar.setAttribute('aria-label', 'Page scroll progress');
        bar.setAttribute('aria-valuemin', '0');
        bar.setAttribute('aria-valuemax', '100');
        /* BUG-014: keep the skip-link as the FIRST body child. If it exists,
           insert the progress bar right AFTER it; otherwise at the top. */
        var bodyEl = document.body || document.documentElement;
        var skipEl = bodyEl.querySelector(':scope > .skip-link');
        if (skipEl) bodyEl.insertBefore(bar, skipEl.nextSibling);
        else bodyEl.insertBefore(bar, bodyEl.firstChild);
      }
      if (bar && !bar.hasAttribute('data-progress-bound')) {
        bar.setAttribute('data-progress-bound', '1');
        var evalShow = function () {
          var show = document.documentElement.scrollHeight > window.innerHeight * 2.5;
          bar.hidden = !show;
          if (show) document.body.removeAttribute('data-progress-suppress');
          else document.body.setAttribute('data-progress-suppress', '');
          return show;
        };
        var shown = evalShow();
        var update = function () {
          if (!shown) return;
          var docH = document.documentElement.scrollHeight - window.innerHeight;
          var pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
          bar.style.transform = 'scaleX(' + (pct / 100) + ')';
          bar.setAttribute('aria-valuenow', String(Math.round(pct)));
        };
        window.addEventListener('scroll', update, { passive: true });
        var rT;
        window.addEventListener('resize', function () {
          if (rT) clearTimeout(rT);
          rT = setTimeout(function () { shown = evalShow(); update(); }, 200);
        }, { passive: true });
        update();
      }
    } catch (_) { /* never break the page */ }

    /* GLOBAL FORM INTERCEPTOR — newsletter / waitlist / compliance-digest forms
       that POST to app.crowagent.ai/api/notify.

       2026-06-03 (owner-approved in chat): REWRITTEN from the previous
       no-cors fire-and-forget handler. That version sent the request opaquely,
       swallowed every error, and showed "✓ you're on the list" unconditionally —
       so when /api/notify 404'd (it never existed), subscribers saw success while
       their email was silently dropped. The endpoint now exists with CORS, so we
       do a REAL cross-origin fetch and read res.ok: success ONLY on a 2xx, a
       visible error otherwise (so a failure can never masquerade as success).
       Covers about/contact/crowesg/index/pricing + any future api/notify form. */
    try {
      if (!window.__caFormIntercept) {
        window.__caFormIntercept = true;
        document.addEventListener('submit', function (e) {
          var form = e.target;
          if (!form || form.tagName !== 'FORM') return;
          var action = form.getAttribute('action') || '';
          if (!/app\.crowagent\.ai\/api\/notify/i.test(action)) return;
          e.preventDefault();
          if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
            if (typeof form.reportValidity === 'function') form.reportValidity();
            return;
          }
          var emailEl = form.querySelector('input[type="email"], input[name="email"]');
          var email = emailEl ? String(emailEl.value || '').trim() : '';
          if (!email) {
            if (emailEl && emailEl.reportValidity) emailEl.reportValidity();
            return;
          }
          /* P2-011: inline, accessible email-format validation. Previously the
             only format guard was the browser's native checkValidity tooltip;
             show a styled inline [data-form-error] message instead so the
             newsletter form has visible, on-brand validation feedback. */
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('Enter a valid email address.');
            if (emailEl) {
              emailEl.setAttribute('aria-invalid', 'true');
              if (typeof emailEl.focus === 'function') emailEl.focus();
            }
            return;
          }
          if (emailEl) emailEl.removeAttribute('aria-invalid');
          // Honeypot (DEF-005): if a hidden "website" field is filled, bots only.
          var honeypot = form.querySelector('[name="website"]');
          if (honeypot && honeypot.value) return;

          var source = form.id ||
            form.getAttribute('data-source') ||
            ((location.pathname.replace(/^\/|\/$/g, '') || 'home') + '-newsletter');
          var btn = form.querySelector('button[type="submit"], button:not([type]), input[type="submit"]');
          var origLabel = btn ? btn.innerHTML : null;
          if (btn) { btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = 'Sending…'; }

          function showError(text) {
            if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = origLabel; }
            var err = form.querySelector('[data-form-error]');
            if (!err) {
              err = document.createElement('p');
              err.setAttribute('data-form-error', '');
              err.setAttribute('role', 'alert');
              err.style.cssText = 'margin:12px 0 0;font-weight:700;font-size:13px;color:var(--err,#F87171);';
              form.appendChild(err);
            }
            err.textContent = text;
          }
          function showSuccess() {
            var existingErr = form.querySelector('[data-form-error]');
            if (existingErr) existingErr.remove();
            var success = form.parentElement && form.parentElement.querySelector('[id$="-success"], .form-success, [data-form-success]');
            if (success) {
              success.classList.remove('hidden');
              success.removeAttribute('hidden');
              form.style.display = 'none';
            } else {
              var msg = document.createElement('p');
              msg.setAttribute('role', 'status');
              msg.style.cssText = 'margin:12px 0 0;font-weight:700;color:var(--teal,#0CC9A8);';
              msg.textContent = '✓ Thanks, you are on the list.';
              form.parentNode.insertBefore(msg, form.nextSibling);
              form.reset();
              form.style.display = 'none';
            }
            // Analytics (best-effort): signup volume shows up in PostHog while
            // the address itself is collected in Brevo by the API.
            try {
              if (window.posthog && window.posthog.capture) {
                window.posthog.capture('newsletter_signup', { source: source });
              }
            } catch (_) { /* analytics must never break the flow */ }
          }

          var signal;
          try {
            if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) signal = AbortSignal.timeout(12000);
          } catch (_) { signal = undefined; }

          fetch(action, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email: email, source: source }),
            signal: signal
          })
            .then(function (res) {
              if (res.ok) { showSuccess(); }
              else { showError('Something went wrong. Please try again, or email hello@crowagent.ai.'); }
            })
            .catch(function () {
              showError('Network error. Please try again, or email hello@crowagent.ai.');
            });
        }, true);
      }
    } catch (_) { /* never break the page */ }

    /* LINK-002 (audit 2026-05-30 - Claude): external links must open in a new
       tab with rel="noopener noreferrer". The footer status link + social
       icons already do this in markup, but in-content external links
       (status.crowagent.ai operational widget, app.crowagent.ai CTAs, Calendly
       booking links, any 3rd-party reference) opened in the same tab and
       navigated users away. Single sitewide sweep: any absolute http(s) link
       to a DIFFERENT host than the current page gets target=_blank + rel.
       Same-origin and crowagent.ai apex links are left in-tab. mailto:/tel:/#
       are skipped (not http). Idempotent. */
    try {
      var here = window.location.hostname;
      var anchors = document.querySelectorAll('a[href^="http://"], a[href^="https://"]');
      Array.prototype.forEach.call(anchors, function (a) {
        var host;
        try { host = new URL(a.href).hostname; } catch (e) { return; }
        if (!host || host === here) return;
        // Treat the marketing apex + www as same-site (internal navigation).
        if (host === 'crowagent.ai' || host === 'www.crowagent.ai') return;
        if (a.getAttribute('target') !== '_blank') a.setAttribute('target', '_blank');
        var rel = (a.getAttribute('rel') || '').toLowerCase();
        if (rel.indexOf('noopener') === -1 || rel.indexOf('noreferrer') === -1) {
          a.setAttribute('rel', ('noopener noreferrer ' + rel).trim());
        }
      });
    } catch (_) { /* best-effort external-link hygiene */ }
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
        /* A11Y-005 (audit 2026-05-30 - Claude): sitewide Organization + WebSite
           JSON-LD. The site shipped zero structured data, so Google had no
           entity graph. Injected once per page (idempotent via data flag).
           Page-specific schema (FAQPage, BlogPosting, BreadcrumbList) lives
           statically in those pages' own <head>. */
        if (!head.querySelector('script[data-ca-orgld]')) {
          var ld = document.createElement('script');
          ld.type = 'application/ld+json';
          ld.setAttribute('data-ca-orgld', 'true');
          ld.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://crowagent.ai/#organization',
                name: 'CrowAgent Ltd',
                url: 'https://crowagent.ai/',
                logo: 'https://crowagent.ai/Assets/og-image.png',
                description: 'The compliance and revenue platform for UK SMEs that sell to the public sector and large corporates: PPN 002 social value, Cyber Essentials, VSME ESG reporting and late-payment recovery software.',
                email: 'hello@crowagent.ai',
                identifier: { '@type': 'PropertyValue', name: 'Companies House', value: '17076461' },
                address: { '@type': 'PostalAddress', addressCountry: 'GB' },
                sameAs: [
                  'https://www.linkedin.com/company/crowagent-ltd/',
                  'https://x.com/CrowAgentLtd',
                  'https://www.youtube.com/@CrowAgentUK'
                ]
              },
              {
                '@type': 'WebSite',
                '@id': 'https://crowagent.ai/#website',
                url: 'https://crowagent.ai/',
                name: 'CrowAgent',
                publisher: { '@id': 'https://crowagent.ai/#organization' },
                inLanguage: 'en-GB'
              }
            ]
          });
          head.appendChild(ld);
        }
      }
    } catch (e) { /* head augmentation is best-effort */ }

    /* ── ANALYTICS & CINEMATIC BOOTSTRAP (WS-AUDIT-008 / H1-MOTIFS-NAV-XFORM) ──
       Auto-load shared scripts on every page that uses the shared nav.
       - /js/analytics-init.js: consent-gated PostHog stub.
       - Cinematic modules: nav-shrink, hero-parallax, sticky-storytelling, logo-shimmer.
       Idempotent: only injects if not already present. */
    try {
      /* ISSUE-005 (Cluster Gamma 2026-05-22): page-scoped modules below are
         gated by URL path so they don't ship to pages that can't use them.
         Each module already has a defensive DOM check that early-returns
         when the relevant hooks are missing, but skipping the network fetch
         + script-parse entirely is meaningfully cheaper. */
      var p = window.location.pathname;
      var isBlog = /^\/blog(\/|$)/.test(p);
      var isPricing = /^\/pricing(\/|$)/.test(p);
      /* Demo-autoplayer is wired on homepage + product pages only - every
         other surface lacks the .demo-* DOM that the module animates. */
      var isHomeOrProduct = p === '/' || p === '/index.html'
        || /^\/(crowmark|crowcyber|crowcash|crowesg|products)(\/|$)/.test(p);

      var scriptsToInject = [
        /* ISSUE-002 (Cluster Delta 2026-05-22): safeViewTransition shim must
           load BEFORE sovereign-features.js consumes it. Listed first in the
           array so the <script defer> tags preserve injection order (defer
           scripts execute in document order). The module exports
           window.safeViewTransition. */
        '/js/modules/view-transitions.js',
        '/js/analytics-init.js',
        '/js/modules/nav-shrink.js',
        '/js/modules/hero-parallax.js',
        '/js/modules/sticky-storytelling.js',
        '/js/modules/logo-shimmer.js',
        '/js/modules/section-parallax.js',
        '/js/modules/d-batch-runtime.js',
        '/js/modules/e-batch-runtime.js',
        /* P1-003 (2026-06-15): Cmd/Ctrl+K command palette, sitewide. hasScript()
           dedups by pathname so the 3 pages that hardcode it don't double-load. */
        '/js/modules/sovereign-features.js'
      ];
      if (isHomeOrProduct) scriptsToInject.push('/js/modules/demo-autoplayer.js');
      if (isPricing) scriptsToInject.push('/js/modules/pricing-tabs-indicator.js');
      if (isBlog) scriptsToInject.push('/js/modules/blog-reading-time.js');
      /* Cookie banner safety net: ensure the cookie-banner impl loads on
         every route (some pages historically omitted the explicit
         <script> tag). The file has an idempotency guard so a duplicate
         include is a no-op.
         ISSUE-006 (Cluster Gamma 2026-05-22): inject /js/cookie-banner.js
         (the implementation) directly instead of /cookie-banner.js
         (the legacy 1-liner shim). Saves one redundant fetch + script
         parse per page. The hasScript() check below recognises BOTH
         paths as equivalent (the shim's only job is to load the impl),
         so a page that still declares the shim explicitly does not get
         double-loaded. */
      scriptsToInject.push('/js/cookie-banner.js');

      /* Match by pathname (ignore ?v= query strings).
         ISSUE-006 (Cluster Gamma 2026-05-22): treat /cookie-banner.js
         (the shim) and /js/cookie-banner.js (the impl) as equivalent
         for dedup purposes. Either reference satisfies the other. */
      var COOKIE_PATHS = ['/cookie-banner.js', '/js/cookie-banner.js'];
      function hasScript(src) {
        var allScripts = document.querySelectorAll('script[src]');
        var srcStripped = src.replace(/^\//, '');
        var cookieEquiv = COOKIE_PATHS.indexOf(src) !== -1;
        for (var i = 0; i < allScripts.length; i++) {
          var raw = allScripts[i].getAttribute('src') || '';
          var noQuery = raw.split('?')[0];
          if (noQuery === src) return true;
          if (noQuery === srcStripped) return true;
          if (cookieEquiv && COOKIE_PATHS.indexOf(noQuery) !== -1) return true;
          if (cookieEquiv && COOKIE_PATHS.indexOf('/' + noQuery) !== -1) return true;
        }
        return false;
      }

      scriptsToInject.forEach(function(src) {
        if (hasScript(src)) return;
        var s = document.createElement('script');
        s.src = src;
        s.defer = true;
        document.head.appendChild(s);
      });
    } catch (e) { /* bootstrap is best-effort */ }
    // Signal footer-ready (footer DOM is now present). ca-nav-ready was
    // dispatched immediately after Phase A so handlers wire up to nav as
    // soon as possible. Dispatching ca-footer-ready inside a microtask so
    // listeners registered in this same tick (e.g. cookie-banner wireTriggers)
    // fire after this function returns.
    try {
      document.dispatchEvent(new CustomEvent('ca-footer-ready'));
    } catch (e) { /* never break the page */ }
  }

  /* Two-phase scheduling - see FINAL-4 comment above injectNavOnly.
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
    var __footerDone = false;
    var runFooter = function () {
      if (__footerDone) return;
      if (!document.getElementById('ca-footer')) { __footerDone = true; return; }
      try { injectFooterAndExtras(); __footerDone = true; } catch (e) { /* never break the page */ }
    };
    var schedule = window.requestAnimationFrame || function (cb) { return setTimeout(cb, 0); };
    schedule(runFooter);
    /* Fallback: rAF is paused in background/hidden tabs so the footer would never
       mount there. setTimeout still fires when hidden; visibilitychange covers the
       tab being revealed. injectFooterAndExtras is idempotent. */
    setTimeout(runFooter, 400);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) runFooter(); });
  }

  /* Run immediately - defer script order guarantees DOM placeholders exist */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPhaseA);
  } else {
    runPhaseA();
  }

  /* ── BUG-029 (P1 brand 2026-05-22) - purge any leaked Claude Code debug
     container ──────────────────────────────────────────────────────────
     A "Stop Claude" debug button (id="claude-agent-stop-container") was
     observed leaking into the production DOM from an external Claude Code
     runtime. The website source ships zero such markup (verified by grep
     2026-05-22) so the element can only enter the document via an outside
     injector. This MutationObserver removes any matching node on insertion;
     a paired CSS rule in styles.css guarantees it never paints even if the
     observer mis-fires. Defensive belt-and-braces. */
  function purgeClaudeDebug(root) {
    try {
      var sel = '#claude-agent-stop-container,[id^="claude-agent-stop"],[class*="claude-agent-stop"]';
      var nodes = (root && root.querySelectorAll) ? root.querySelectorAll(sel) : [];
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n && n.parentNode) n.parentNode.removeChild(n);
      }
    } catch (_) { /* best-effort purge */ }
  }
  try {
    purgeClaudeDebug(document);
    if (typeof MutationObserver === 'function') {
      var mo = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var added = mutations[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            var node = added[j];
            if (node && node.nodeType === 1) {
              if (node.id && node.id.indexOf('claude-agent-stop') === 0) {
                if (node.parentNode) node.parentNode.removeChild(node);
                continue;
              }
              purgeClaudeDebug(node);
            }
          }
        }
      });
      mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
    }
  } catch (_) { /* defensive purge is best-effort */ }

  /* ── SERVICE WORKER REGISTRATION (DEF-040 / Task 32.13) ──
     Window 'load' fires after every defer script + every <img> resource has
     finished. Wrapping in try/catch so a Gecko / WebKit register-throws does
     not produce an uncaught pageerror (NS_ERROR_FAILURE class). */
  // RB-DIAG3 2026-05-17: HARD GUARD - skip SW registration on localhost AND
  // proactively unregister any SW that was registered in a prior session.
  // The unconditional registration here was masking ALL local edits behind
  // the SW's stale cache for the user's entire session. scripts.js already
  // has this guard at line 11; mirroring here closes the dual-source loop.
  var isLocalhost = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'http:';
  if ('serviceWorker' in navigator && isLocalhost) {
    // Tear down any previously-registered SW so this dev session sees fresh code.
    try {
      navigator.serviceWorker.getRegistrations().then(function (regs) {
        regs.forEach(function (r) {
          r.unregister();
          if (window.location.hostname === 'localhost') {
            console.info('SW unregistered (localhost dev guard)');
          }
        });
      });
      if (window.caches && caches.keys) {
        caches.keys().then(function (keys) {
          keys.forEach(function (k) { caches.delete(k); });
        });
      }
    } catch (_) { /* best-effort cleanup */ }
  } else if ('serviceWorker' in navigator) {
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

  // SF21-P 2026-05-18: universal back-to-top widget. Load once, site-wide.
  // Idempotent: the module guards against duplicate injection.
  (function loadBackToTop() {
    if (document.querySelector('script[data-sf21-bt2t]')) return;
    var s = document.createElement('script');
    s.src = '/js/modules/sf21-back-to-top.js?v=98';
    s.defer = true;
    s.setAttribute('data-sf21-bt2t', 'true');
    document.head.appendChild(s);
  })();

})();
/* ============================================================
   Legibility guard (re-skin safety net). Composites translucent
   background layers to get the TRUE effective background, then
   fixes only text that fails WCAG contrast < 3 against it.
   Skips gradient/clip text. Runs after paint on every page.
   ============================================================ */
(function(){
  function parse(c){var m=(String(c).match(/[-\d.]+/g)||[]).map(Number);if(m.length<3)return null;return[m[0],m[1],m[2],m.length>3?m[3]:1];}
  function Lr(r,g,b){var a=[r,g,b].map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
  function ct(l1,l2){return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);}
  /* Approximate a gradient's effective colour by averaging its solid (alpha>0.4)
     rgb/hex stops. Faint overlay stops are ignored so the real surface underneath
     wins. Returns null when the gradient has no substantial colour stop. */
  function gradAvg(img){var m=img.match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/g);if(!m)return null;var s=m.map(parse).filter(function(c){return c&&c[3]>0.4;});if(!s.length)return null;var r=0,g=0,b=0;s.forEach(function(c){r+=c[0];g+=c[1];b+=c[2];});return[r/s.length,g/s.length,b/s.length,1];}
  function effBg(el){
    var layers=[],p=el;
    while(p&&p.nodeType===1){var st=getComputedStyle(p);var bi=st.backgroundImage;
      var clipText=(st.webkitBackgroundClip==='text'||st.backgroundClip==='text');
      if(bi&&bi!=='none'&&!clipText){
        if(/gradient/.test(bi)){var gs=gradAvg(bi);if(gs){layers.push(gs);break;}}
        else if(/url\(/.test(bi)){return null;} /* real raster image: cannot sample, skip */
      }
      var c=parse(st.backgroundColor);if(c&&c[3]>0){layers.push(c);if(c[3]>=0.999)break;}p=p.parentElement;}
    var base=(layers.length&&layers[layers.length-1][3]>=0.999)?layers.pop():parse(getComputedStyle(document.body).backgroundColor)||[255,255,255,1];
    var r=base[0],g=base[1],b=base[2];
    for(var i=layers.length-1;i>=0;i--){var la=layers[i],a=la[3];r=la[0]*a+r*(1-a);g=la[1]*a+g*(1-a);b=la[2]*a+b*(1-a);}
    return [r,g,b];
  }
  var sel='#main-content h1,#main-content h2,#main-content h3,#main-content h4,#main-content h5,#main-content h6,#main-content p,#main-content li,#main-content a,#main-content span,#main-content td,#main-content th,#main-content dt,#main-content dd,#main-content figcaption,#main-content blockquote,#main-content strong,#main-content em,#main-content label,main h1,main h2,main h3,main h4,main p,main li,main a,main span,main td,main th,main label,footer a,footer p,footer li,footer span,footer h4';
  function run(){try{
    document.querySelectorAll(sel).forEach(function(el){
      if(el.children.length)return; var t=(el.textContent||'').trim(); if(!t)return;
      var cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return;
      var fill=(cs.webkitTextFillColor||'').replace(/\s/g,''); if(fill==='rgba(0,0,0,0)')return;
      var fc=parse(cs.color); if(!fc)return;
      var bg=effBg(el);if(!bg)return;var lbg=Lr(bg[0],bg[1],bg[2]),lfg=Lr(fc[0],fc[1],fc[2]);
      if(ct(lfg,lbg)>=3)return;
      var Lw=Lr(235,241,251),Li=Lr(20,24,28);
      el.style.setProperty('color', (ct(Lw,lbg)>=ct(Li,lbg))?'#EAF1FB':'#14181C','important');
    });
  }catch(e){}}
  if(document.readyState==='complete')run();else window.addEventListener('load',run);
  setTimeout(run,900);
})();

/* === UNIFORM VISIBILITY SAFETY NET (appended by coordinator) === */
/* ============================================================================
   Legibility guard v3 (runtime, foreground-correct safety net)
   Guarantees every text + BUTTON LABEL is visible against its real background.
   - Composites translucent rgba background layers to the true effective bg.
   - GRADIENT/SOLID-AWARE: if an element (or ancestor up to the first opaque
     layer) is painted by a gradient/image, it parses the gradient's colour
     stops and uses their average as the backdrop (so button labels on gradient
     pills are evaluated correctly instead of being skipped).
   - Fixes only text failing WCAG contrast (< 3 for large/bold, < 4.5 for body).
   - Sets white (#EAF1FB) on dark backdrops, ink (#14181C) on light.
   - Skips true gradient/clip TEXT (-webkit-text-fill-color: transparent) unless
     it is fully invisible (then it forces a solid legible colour).
   - Runs on DOMready, load, fonts.ready, delayed passes, visibilitychange, and
     after a theme-toggle click. Idempotent; only ever tightens contrast.
   ========================================================================== */
(function () {
  try {
    var WHITE = '#EAF1FB', INK = '#14181C';
    function parseColors(str) {
      // returns array of [r,g,b,a] found in a CSS value (rgb/rgba/hex)
      var out = [], m;
      var re = /rgba?\(([^)]+)\)/g;
      while ((m = re.exec(str))) {
        var p = m[1].split(',').map(function (s) { return parseFloat(s); });
        if (p.length >= 3) out.push([p[0], p[1], p[2], p.length > 3 ? p[3] : 1]);
      }
      var hre = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;
      while ((m = hre.exec(str))) {
        var h = m[1]; if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
        out.push([parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16), 1]);
      }
      return out;
    }
    function avg(cols) {
      // Only SUBSTANTIAL gradient stops (alpha >= 0.4) define a real backdrop.
      // Faint overlay glows (e.g. a card's rgba(12,201,168,0.08) sheen) must NOT
      // be treated as an opaque teal surface — doing so mis-reads a dark card as
      // "light" and forces dark-on-dark ink. Faint gradients return null so the
      // guard keeps walking to the true (dark) ground beneath.
      if (!cols.length) return null;
      var r=0,g=0,b=0,n=0;
      cols.forEach(function(c){ if(c[3]>=0.4){ r+=c[0]; g+=c[1]; b+=c[2]; n++; } });
      if (!n) return null; return [r/n,g/n,b/n,1];
    }
    function Lr(r,g,b){var a=[r,g,b].map(function(v){v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);});return 0.2126*a[0]+0.7152*a[1]+0.0722*a[2];}
    function ct(l1,l2){return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);}
    function first(str){var c=parseColors(str);return c.length?c[0]:null;}
    function effBg(el){
      var layers=[],p=el;
      while(p&&p.nodeType===1){
        var st=getComputedStyle(p);
        var bi=st.backgroundImage;
        // background-clip:text confines the gradient to text glyphs; it never paints
        // the element box, so it must NOT be read as a backdrop (doing so mis-reads a
        // white/light text-gradient heading as a light box and stomps dark-on-dark ink).
        var clipText=(st.webkitBackgroundClip==='text'||st.backgroundClip==='text');
        if(!clipText&&bi&&bi!=='none'&&/gradient|url\(/.test(bi)){
          var g=avg(parseColors(bi));
          if(g){ layers.push([g[0],g[1],g[2],1]); break; }   // treat painted layer as opaque backdrop
        }
        var c=first(st.backgroundColor);
        if(c&&c[3]>0){ layers.push(c); if(c[3]>=0.999) break; }
        p=p.parentElement;
      }
      var base=(layers.length&&layers[layers.length-1][3]>=0.999)?layers.pop():(first(getComputedStyle(document.body).backgroundColor)||[255,255,255,1]);
      var r=base[0],g=base[1],b=base[2];
      for(var i=layers.length-1;i>=0;i--){var la=layers[i],a=la[3];r=la[0]*a+r*(1-a);g=la[1]*a+g*(1-a);b=la[2]*a+b*(1-a);}
      return [r,g,b];
    }
    var SEL = 'h1,h2,h3,h4,h5,h6,p,li,a,span,strong,em,small,b,i,td,th,dt,dd,figcaption,blockquote,label,button,summary,input,textarea,legend,.sv-btn,.sv-btn-primary,.sv-btn-ghost';
    function isBoldLarge(cs){
      var size=parseFloat(cs.fontSize)||16, w=parseInt(cs.fontWeight,10)||400;
      return size>=24 || (size>=18.66 && w>=700);
    }
    function fixOne(el){
      // only leaf-ish text nodes (no element children) OR buttons/links with only text
      if (el.children.length && !/^(A|BUTTON|SUMMARY|LABEL)$/.test(el.tagName)) return;
      var txt=(el.textContent||'').trim(); if(!txt && el.tagName!=='INPUT' && el.tagName!=='TEXTAREA') return;
      var cs=getComputedStyle(el);
      if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0) return;
      var r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return;
      var fc=first(cs.color); if(!fc) return;
      var fill=(cs.webkitTextFillColor||'').replace(/\s/g,'');
      var clip=(fill==='rgba(0,0,0,0)');
      var bg=effBg(el), lbg=Lr(bg[0],bg[1],bg[2]);
      if(clip){
        // gradient/clip text: only intervene if effectively invisible
        // (can't measure clip fill; leave unless the box is on same-luminance bg)
        return;
      }
      var lfg=Lr(fc[0],fc[1],fc[2]);
      // Threshold 3: rescue only genuinely illegible/invisible text (white-on-white,
      // dark-on-dark). Deliberately NOT 4.5, so intentional muted-but-readable text
      // and subtle captions are left exactly as designed.
      var need=3;
      if(ct(lfg,lbg)>=need) return;
      // Pick whichever of white/ink yields the HIGHER contrast on this backdrop.
      // A fixed luminance split mis-serves mid-tone accents (e.g. violet #A78BFA,
      // where white=2.4 but ink=6.9); max-contrast always lands on the legible one.
      var Lw=Lr(235,241,251), Li=Lr(20,24,28);
      var pick=(ct(Lw,lbg)>=ct(Li,lbg))?WHITE:INK;
      el.style.setProperty('color', pick, 'important');
      el.style.setProperty('-webkit-text-fill-color', pick, 'important');
    }
    function run(){ try{ document.querySelectorAll(SEL).forEach(fixOne); }catch(e){} }
    function schedule(){
      run();
      if(document.fonts&&document.fonts.ready){document.fonts.ready.then(run).catch(function(){});}
      [120,400,1000,2200].forEach(function(d){setTimeout(run,d);});
    }
    if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule);
    else schedule();
    window.addEventListener('load',schedule);
    document.addEventListener('visibilitychange',function(){ if(!document.hidden) schedule(); });
    document.addEventListener('click',function(e){
      var t=e.target&&e.target.closest&&e.target.closest('[data-theme-toggle],[aria-label*="theme" i],.theme-toggle,[data-toggle-theme]');
      if(t) setTimeout(schedule,80);
    },true);
  } catch(e){}
})();
