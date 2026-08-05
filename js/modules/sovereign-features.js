/* ═══════════════════════════════════════════════════════════════════════
   sovereign-features.js :  Stripe / Apple / Google grade interactive layer
   SF46 P2 (2026-05-20)

   Wires:
     G6  Cmd+K command palette (global, route + product search)
     G9  Live metrics widget: counter animation, IntersectionObserver
     G13 View Transitions API: same-origin links cross-fade between pages

   All features are progressive enhancements:
     - reduced-motion users get instant state
     - missing APIs (View Transitions on Firefox today) fall back to default
     - keyboard + screen reader: Cmd+K palette has full ARIA
   ═══════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────────
  // G13: View Transitions API. Same-origin navigation gets crossfade.
  // ISSUE-002 fix (2026-05-22): raw startViewTransition() previously threw
  // InvalidStateError/AbortError on rapid navigation; now routed through
  // window.safeViewTransition (from /js/modules/view-transitions.js) which
  // handles in-flight aborts, hidden-tab fallback, and AbortError filtering.
  // ─────────────────────────────────────────────────────────────────────
  if (
    document.startViewTransition &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches &&
    document.documentElement.dataset.viewTransitions !== 'off'
  ) {
    document.documentElement.dataset.viewTransitions = 'true';
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      /* ISSUE-029 fix (2026-05-22): the new dropdown triggers are anchors
         whose chevron span opens the dropdown without navigation. The
         dedicated capture-phase handler in nav-inject.js already handles
         these clicks. Skip them here so we don't double-navigate or fight
         the chevron-toggle path. */
      if (a.classList && a.classList.contains('nav-dropdown-trigger')) {
        var chev = a.querySelector('.nav-dropdown-chevron');
        if (chev && (e.target === chev || chev.contains(e.target))) {
          return; // chevron click: let nav-inject's handler manage it
        }
        // Label click: nav-inject.js already navigated via safeViewTransition.
        return;
      }
      var href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      // Same-origin internal nav only
      try {
        var u = new URL(href, location.href);
        if (u.origin !== location.origin) return;
        if (a.target && a.target !== '_self') return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        // Bail if a prior listener already prevented the default action —
        // this signals an upstream handler (dropdown chevron, etc.) is in
        // charge of this click; we must not navigate on its behalf.
        if (e.defaultPrevented) return;
        e.preventDefault();
        var run = function () { location.href = u.href; };
        if (typeof window.safeViewTransition === 'function') {
          window.safeViewTransition(run);
        } else {
          // safeViewTransition not yet loaded: fall back to direct nav.
          // This branch only fires if module load order ever inverts.
          run();
        }
      } catch (err) { /* fall through to default nav */ }
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // G9: Live metric counter. Auto-fires when element enters viewport.
  // Markup: <span class="sv-counter" data-target="247" data-suffix="k">0</span>
  // ─────────────────────────────────────────────────────────────────────
  function animateCounter(el) {
    var target = parseFloat(el.dataset.target);
    if (Number.isNaN(target)) return;
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var dur = parseInt(el.dataset.duration || '1400', 10);
    var start = performance.now();
    var startValue = parseFloat(el.textContent) || 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    function frame(now) {
      var t = Math.min(1, (now - start) / dur);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - t, 3);
      var v = startValue + (target - startValue) * eased;
      el.textContent = prefix + v.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) {
    var counters = document.querySelectorAll('.sv-counter');
    if (counters.length) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !entry.target.dataset.fired) {
            entry.target.dataset.fired = '1';
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { io.observe(c); });
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // G6: Cmd+K command palette. Global keyboard shortcut Cmd/Ctrl+K.
  // ─────────────────────────────────────────────────────────────────────
  function buildPalette() {
    // ─── Cmd+K INTELLIGENCE ────────────────────────────────────────────
    // Route catalogue, categorised. Categories render with .sv-cmdk__category
    // headers in --text-tertiary. Category order is Stripe pattern:
    // user-facing surfaces first, then content, then policy.
    //
    // LINK-AUDIT-001 (2026-07-30) — THIS LIST WAS WHOLESALE STALE AND IS NOW
    // HAND-MAINTAINED. It previously claimed to be "generated from
    // tools/scan-routes.js + tools/route-index.json"; that generator is retired dev
    // tooling and had not been re-run since the Core switch-off (2026-07-17) or the
    // trade-mark remediation (2026-07-28). An audit of every path in the array
    // against the files on disk and the honoured _redirects rules found 22 broken or
    // redirected entries out of 55, including:
    //   - 12 entries whose page had been DELETED (crowcyber/crowcash/crowesg/csrd,
    //     /products/, four retired blog posts, /glossary/csrd, the Cyber Essentials
    //     tracker) — every one of them a 404 or a 301 bounce from the palette
    //   - 4 methodology pages that do not exist in this repo in any form
    //   - /demo.html, which has never existed here at all
    //   - /404.html, listed as a navigable destination, which is nonsense in a
    //     command palette
    // and it was MISSING every page added since: /integrations, all five /sectors
    // pages, all five /compare pages, the PPN 002 methodology page and five
    // live blog posts.
    //
    // TWO RULES WHEN EDITING THIS ARRAY:
    //  1. Every url must be a page that exists on disk. The palette navigates
    //     straight to it, so a stale entry is a 404 the user triggered themselves.
    //  2. Use the EXTENSIONLESS, no-trailing-slash form — it matches each page's
    //     rel=canonical and sitemap.xml entry. Measured on production 2026-07-30:
    //     Cloudflare Pages 308-redirects /about.html to /about before _redirects is
    //     even consulted, so the old ".html" URLs cost every palette navigation an
    //     avoidable redirect hop.
    var ROUTES = [
      { url: "/",                                                    label: "CrowAgent (Home)",                       category: "Products",    tags: "home start landing platform" },
      { url: "/crowmark",                                            label: "CrowMark",                               category: "Products",    tags: "crowmark bid tender social value ppn public sector" },
      { url: "/pricing",                                             label: "Pricing",                                category: "Products",    tags: "price cost plan subscription" },
      { url: "/integrations",                                        label: "Integrations",                           category: "Products",    tags: "integrations connect api sharepoint" },

      /* A-128, 2026-08-05: the two /tools/ppn-002-calculator entries are DELETED under
         rule 1 above — both pages are removed from disk by owner instruction, and a
         palette entry for a deleted page is a 404 the user triggered themselves, which is
         the exact defect the rule was written for. They are not repointed at
         /glossary/ppn-002: that entry already exists below, and two rows landing on one
         page would make the palette look like it still has a calculator.
         /tools is relabelled for the same reason — it lists no tool now, so "All Free
         Tools" would have been a promise the destination cannot keep. */
      { url: "/tools",                                               label: "PPN 002 Rules, Sourced",                 category: "Tools",       tags: "tools free ppn social value sourced" },

      { url: "/sectors",                                             label: "By Sector",                              category: "Sectors",     tags: "sectors industries verticals" },
      { url: "/sectors/construction",                                label: "Construction Bid Software",              category: "Sectors",     tags: "construction public works build tenders" },
      { url: "/sectors/facilities",                                  label: "Facilities Management Bid Software",     category: "Sectors",     tags: "facilities fm cleaning maintenance contracts" },
      { url: "/sectors/highways",                                    label: "Highways Bid Software",                  category: "Sectors",     tags: "highways roads maintenance contracts" },
      { url: "/sectors/education",                                   label: "Education Bid Software",                 category: "Sectors",     tags: "education schools mat academy contracts" },

      { url: "/compare",                                             label: "Compare CrowMark",                       category: "Compare",     tags: "compare alternatives competitors versus" },
      { url: "/compare/crowmark-vs-autogenai",                       label: "CrowMark vs AutogenAI",                  category: "Compare",     tags: "autogenai compare alternative versus" },
      { url: "/compare/crowmark-vs-mytender-io",                     label: "CrowMark vs mytender.io",                category: "Compare",     tags: "mytender compare alternative versus" },
      { url: "/compare/crowmark-vs-cleantender",                     label: "CrowMark vs CleanTender",                category: "Compare",     tags: "cleantender compare alternative versus" },
      { url: "/compare/crowmark-vs-swiftbid",                        label: "CrowMark vs SwiftBid",                   category: "Compare",     tags: "swiftbid compare alternative versus" },

      { url: "/about",                                               label: "About",                                  category: "Pages",       tags: "team mission company" },
      { url: "/contact",                                             label: "Contact",                                category: "Pages",       tags: "help support email" },
      { url: "/faq",                                                 label: "FAQ",                                    category: "Pages",       tags: "help question answer" },
      { url: "/roadmap",                                             label: "Roadmap",                                category: "Pages",       tags: "plan future" },
      { url: "/changelog",                                           label: "Changelog",                              category: "Pages",       tags: "release updates history" },
      { url: "/partners",                                            label: "Partners",                               category: "Pages",       tags: "partner channel reseller" },
      { url: "/resources",                                           label: "Resources",                              category: "Pages",       tags: "resources guides reading" },

      { url: "/blog",                                                label: "CrowAgent Insights (Blog index)",        category: "Blog",        tags: "blog articles insights" },
      { url: "/blog/ppn-002-social-value-guide",                     label: "PPN 002: The Complete Guide to Social Value Scoring",       category: "Blog", tags: "ppn social value scoring bid guide toms" },
      { url: "/blog/procurement-act-2023-sme-guide",                 label: "The Procurement Act 2023: what SME bidders need to know",   category: "Blog", tags: "procurement act 2023 sme legislation" },
      { url: "/blog/find-first-public-sector-contract",              label: "How to find and win your first public sector contract",     category: "Blog", tags: "first contract find tender win public sector" },
      { url: "/blog/method-statement-that-scores",                   label: "Method Statements That Score",                              category: "Blog", tags: "method statement quality response scoring" },
      { url: "/blog/frameworks-and-dps-explained",                   label: "Frameworks and DPS Explained",                              category: "Blog", tags: "framework dps dynamic purchasing system" },
      { url: "/blog/private-sector-rfp-pqq-guide",                   label: "Private Sector RFPs and PQQs",                              category: "Blog", tags: "rfp pqq private sector bid" },
      { url: "/blog/social-value-portal-vs-crowmark",                label: "Social Value Portal vs CrowMark",                           category: "Blog", tags: "social value portal crowmark compare" },
      { url: "/blog/regulatory-updates-2026",                        label: "PPN 002 in 2026: What Changed (and What Didn't)",           category: "Blog", tags: "regulation 2026 ppn updates" },

      { url: "/glossary",                                            label: "UK Public Procurement Glossary",         category: "Glossary",    tags: "glossary definitions terminology" },
      { url: "/glossary/ppn-002",                                    label: "PPN 002",                                category: "Glossary",    tags: "ppn 002 definition procurement policy note" },
      { url: "/glossary/toms-framework",                             label: "TOMs Framework",                         category: "Glossary",    tags: "toms themes outcomes measures social value framework" },

      { url: "/security",                                            label: "Security",                               category: "Legal",       tags: "soc gdpr trust security iso" },
      { url: "/privacy",                                             label: "Privacy Policy",                         category: "Legal",       tags: "privacy gdpr data policy" },
      { url: "/terms",                                               label: "Terms of Service",                       category: "Legal",       tags: "terms service legal" },
      { url: "/cookies",                                             label: "Cookie Policy",                          category: "Legal",       tags: "cookies policy gdpr" },
      { url: "/cookie-preferences",                                  label: "Cookie Preferences",                     category: "Legal",       tags: "cookies preferences consent" }
    ];

    // Public read-only handle so tests + integrations can inspect the index
    window.SovereignCmdK = window.SovereignCmdK || {};
    window.SovereignCmdK.routes = ROUTES;

    var wrap = document.createElement('div');
    wrap.className = 'sv-cmdk';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Search and navigate');
    wrap.hidden = true;
    /* ISSUE-009 (2026-05-22): full ARIA 1.2 combobox pattern on the search
       input: id, aria-label, role=combobox, aria-autocomplete=list,
       aria-controls pointing to the results listbox, aria-expanded toggled
       on open/close. Listbox itself carries the canonical id so AT can
       announce results count + active descendant.
       ISSUE-028 (2026-05-22): the inner <footer> became a duplicate
       contentinfo landmark: swapped to <div role="none"> so the hint row
       remains visible/keyboard-friendly without polluting landmark nav. */
    wrap.innerHTML =
      '<div class="sv-cmdk__backdrop" data-cmdk-close></div>' +
      '<div class="sv-cmdk__panel" role="document">' +
        '<label class="sv-cmdk__field" for="cmdk-search-input">' +
          '<svg class="sv-cmdk__search" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>' +
          '<input type="text" class="sv-cmdk__input"' +
            ' id="cmdk-search-input"' +
            ' role="combobox"' +
            ' aria-label="Search products, pages and tools"' +
            ' aria-autocomplete="list"' +
            ' aria-controls="cmdk-results-listbox"' +
            ' aria-expanded="false"' +
            ' autocomplete="off" spellcheck="false"' +
            ' placeholder="Search products, pages, tools…">' +
          '<kbd class="sv-cmdk__kbd" aria-hidden="true">Esc</kbd>' +
        '</label>' +
        '<ul class="sv-cmdk__list" id="cmdk-results-listbox" role="listbox" aria-label="Search results"></ul>' +
        '<div class="sv-cmdk__footer" role="none" aria-hidden="true">' +
          '<span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>' +
          '<span><kbd>↵</kbd> Open</span>' +
          '<span><kbd>Esc</kbd> Close</span>' +
        '</div>' +
      '</div>';

    document.body.appendChild(wrap);
    var input = wrap.querySelector('.sv-cmdk__input');
    var list  = wrap.querySelector('.sv-cmdk__list');

    // Category display order: Stripe pattern: user-facing first, policy last.
    // LINK-AUDIT-001 (2026-07-30): this array is a RENDER GATE, not just a sort key —
    // the loop below iterates it, so any category present in ROUTES but absent here
    // renders nothing at all. 'Sectors' and 'Compare' were added alongside the ROUTES
    // rebuild; 'Methodology' was dropped because the four pages that made up that
    // category no longer exist and the one surviving methodology page now sits under
    // 'Tools', next to the calculator it documents.
    var CATEGORY_ORDER = ['Products', 'Tools', 'Sectors', 'Compare', 'Pages', 'Blog', 'Glossary', 'Legal'];

    // Track interactive items (not category headers) for keyboard navigation.
    var activeIdx = 0;
    function escapeHtml(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function highlight(text, q) {
      if (!q) return escapeHtml(text);
      var safe = escapeHtml(text);
      var idx = safe.toLowerCase().indexOf(q);
      if (idx < 0) return safe;
      return safe.slice(0, idx) +
             '<mark class="sv-cmdk__match">' + safe.slice(idx, idx + q.length) + '</mark>' +
             safe.slice(idx + q.length);
    }
    function render(filter) {
      var q = (filter || '').toLowerCase().trim();
      var filtered = q
        ? ROUTES.filter(function (r) {
            return r.label.toLowerCase().indexOf(q) >= 0 ||
                   (r.tags || '').indexOf(q) >= 0 ||
                   r.category.toLowerCase().indexOf(q) >= 0;
          })
        : ROUTES;

      // Bucket by category, preserve list order inside each bucket.
      var buckets = {};
      filtered.forEach(function (r) {
        if (!buckets[r.category]) buckets[r.category] = [];
        buckets[r.category].push(r);
      });

      var html = '';
      var interactiveItems = [];
      CATEGORY_ORDER.forEach(function (cat) {
        var rows = buckets[cat];
        if (!rows || !rows.length) return;
        // Category header: visually presented as section heading, semantically
        // non-interactive (aria-hidden on the label keeps screen readers focused
        // on the option list itself; the role on each item is "option").
        html += '<li class="sv-cmdk__category" role="presentation" aria-hidden="true">' +
                  '<span class="sv-cmdk__category-label sv-text-tertiary">' + escapeHtml(cat) +
                    '<span class="sv-cmdk__category-count"> · ' + rows.length + '</span>' +
                  '</span>' +
                '</li>';
        rows.forEach(function (r) {
          var i = interactiveItems.length;
          interactiveItems.push(r);
          html += '<li role="option" class="sv-cmdk__item' + (i === activeIdx ? ' is-active' : '') +
                  '" data-href="' + r.url + '" id="sv-cmdk-opt-' + i + '" aria-selected="' + (i === activeIdx) + '">' +
                    '<span class="sv-cmdk__label">' + highlight(r.label, q) + '</span>' +
                    '<span class="sv-cmdk__hint sv-text-tertiary">' + escapeHtml(r.category) + '</span>' +
                    '<svg class="sv-cmdk__arrow" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>' +
                  '</li>';
        });
      });

      // Empty state
      if (!interactiveItems.length) {
        html = '<li class="sv-cmdk__empty" role="status">' +
                 '<span class="sv-text-tertiary">No results for &ldquo;' + escapeHtml(q) + '&rdquo;</span>' +
               '</li>';
      }

      list.innerHTML = html;
      // Cache for keyboard nav
      list._interactiveCount = interactiveItems.length;
      input.setAttribute('aria-activedescendant', interactiveItems.length ? 'sv-cmdk-opt-' + activeIdx : '');
    }

    /* A11Y 2026-07-31 (WCAG 2.1.2 + 2.4.3). Two measured defects in this dialog.

       1. NO FOCUS TRAP. The wrapper carries role="dialog" aria-modal="true", which tells a
          screen reader the rest of the page is inert - but Tab walked straight out of it.
          Measured: from the focused input, 12 Tab presses escaped the dialog into the page
          behind the backdrop. A user is then interacting with content the dialog claims is
          unavailable, and there is no visible focus ring over the overlay to show where they
          are. NAV-001 already fixed exactly this for the mobile menu in nav-inject.js.
       2. FOCUS WAS NOT RETURNED ON CLOSE. Measured: open from the Search trigger, press
          Escape, and document.activeElement is BODY. The user's place in the page is gone and
          a keyboard user restarts from the top of the document.

       Kept deliberately small: remember the opener, cycle Tab at the boundaries, restore on
       close. No inert/aria-hidden juggling of the rest of the DOM, which is what usually
       breaks other components. */
    var lastFocused = null;

    function focusables() {
      return Array.prototype.filter.call(
        wrap.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])'),
        function (el) { return el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement; }
      );
    }

    function trapTab(e) {
      if (e.key !== 'Tab' || wrap.hidden) return;
      var f = focusables();
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!wrap.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }

    function open() {
      /* Captured BEFORE the dialog takes focus, so close() has somewhere to put it back. */
      lastFocused = document.activeElement;
      wrap.hidden = false;
      activeIdx = 0;
      render('');
      /* ISSUE-009 (2026-05-22): toggle aria-expanded so the combobox
         pattern matches WAI-ARIA Authoring Practices 1.2 (combobox+listbox). */
      input.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () { input.focus(); });
      document.documentElement.style.overflow = 'hidden';
      document.addEventListener('keydown', trapTab, true);
    }
    function close() {
      wrap.hidden = true;
      input.value = '';
      input.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', trapTab, true);
      /* Return focus to whatever opened it. Guarded because the opener can have been removed
         from the DOM by a re-render, in which case doing nothing is better than throwing. */
      try {
        if (lastFocused && document.contains(lastFocused) && typeof lastFocused.focus === 'function') {
          lastFocused.focus();
        }
      } catch (_) { /* focus restoration is best-effort */ }
      lastFocused = null;
    }

    function selectActive() {
      var items = list.querySelectorAll('.sv-cmdk__item');
      if (!items.length) return;
      var item = items[activeIdx] || items[0];
      var href = item.dataset.href;
      close();
      if (href) location.href = href;
    }

    input.addEventListener('input', function () {
      activeIdx = 0;
      render(input.value);
    });
    input.addEventListener('keydown', function (e) {
      var items = list.querySelectorAll('.sv-cmdk__item');
      var total = items.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(total - 1, activeIdx + 1); render(input.value); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(0, activeIdx - 1); render(input.value); }
      else if (e.key === 'Home') { e.preventDefault(); activeIdx = 0; render(input.value); }
      else if (e.key === 'End')  { e.preventDefault(); activeIdx = Math.max(0, total - 1); render(input.value); }
      else if (e.key === 'Enter')   { e.preventDefault(); selectActive(); }
      else if (e.key === 'Escape')  { e.preventDefault(); close(); }
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('.sv-cmdk__item');
      if (li) { activeIdx = [].indexOf.call(list.children, li); selectActive(); }
    });
    wrap.addEventListener('click', function (e) {
      if (e.target.matches('[data-cmdk-close]')) close();
    });

    document.addEventListener('keydown', function (e) {
      var k = e.key && e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); open(); }
      else if (k === '/' && document.activeElement === document.body) { e.preventDefault(); open(); }
    });
    window.SovereignCmdK = { open: open, close: close };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildPalette);
  } else { buildPalette(); }

  // ─────────────────────────────────────────────────────────────────────
  // G14: Pricing progressive disclosure. Any comparison-table with more
  // than COLLAPSE_THRESHOLD rows gets a "Show all N features" toggle.
  // ─────────────────────────────────────────────────────────────────────
  function initProgressiveDisclosure() {
    var COLLAPSE_THRESHOLD = 7;
    var tables = document.querySelectorAll('.comparison-table');
    tables.forEach(function (table) {
      if (table.dataset.svDisclosure) return;
      var rows = table.querySelectorAll('tbody > tr');
      if (rows.length <= COLLAPSE_THRESHOLD) return;
      table.dataset.svDisclosure = 'collapsed';
      var hiddenCount = rows.length - COLLAPSE_THRESHOLD;
      for (var i = COLLAPSE_THRESHOLD; i < rows.length; i++) {
        rows[i].classList.add('sv-row-hidden');
        rows[i].setAttribute('hidden', '');
      }
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sv-disclosure-toggle';
      btn.setAttribute('aria-expanded', 'false');
      btn.innerHTML = '<span class="sv-disclosure-label">Show all ' + rows.length + ' features</span>' +
                      '<svg class="sv-disclosure-chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          for (var j = COLLAPSE_THRESHOLD; j < rows.length; j++) { rows[j].setAttribute('hidden', ''); rows[j].classList.add('sv-row-hidden'); }
          btn.querySelector('.sv-disclosure-label').textContent = 'Show all ' + rows.length + ' features';
          btn.setAttribute('aria-expanded', 'false');
        } else {
          for (var k = COLLAPSE_THRESHOLD; k < rows.length; k++) { rows[k].removeAttribute('hidden'); rows[k].classList.remove('sv-row-hidden'); }
          btn.querySelector('.sv-disclosure-label').textContent = 'Show fewer';
          btn.setAttribute('aria-expanded', 'true');
        }
      });
      // Place button immediately after the table's nearest scroll wrapper
      var wrapper = table.closest('.table-scroll-wrapper, .ca-comparison') || table;
      wrapper.parentNode.insertBefore(btn, wrapper.nextSibling);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgressiveDisclosure);
  } else { initProgressiveDisclosure(); }
})();
