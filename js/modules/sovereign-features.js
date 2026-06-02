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
    // 66-route catalogue, categorised. Generated from tools/scan-routes.js
    // + tools/route-index.json. Categories render with .sv-cmdk__category
    // headers in --text-tertiary. Category order is Stripe pattern:
    // user-facing surfaces first, then content, then policy.
    var ROUTES = [
      { url: "/",                                                    label: "CrowAgent (Home)",                       category: "Products",    tags: "home start landing platform" },
      { url: "/crowagent-core.html",                                 label: "CrowAgent Core",                         category: "Products",    tags: "compliance ai platform mees" },
      { url: "/crowcyber.html",                                      label: "CrowCyber",                              category: "Products",    tags: "cyber essentials soc security" },
      { url: "/crowmark.html",                                       label: "CrowMark",                               category: "Products",    tags: "mark brand watermark social value ppn" },
      { url: "/crowcash.html",                                       label: "CrowCash",                               category: "Products",    tags: "cash earnings credit payments invoicing" },
      { url: "/crowesg.html",                                        label: "CrowESG",                                category: "Products",    tags: "esg sustainability scope3 carbon" },
      { url: "/csrd.html",                                           label: "CSRD Checker",                           category: "Products",    tags: "csrd reporting eu sustainability" },
      { url: "/products/",                                           label: "All CrowAgent Products",                 category: "Products",    tags: "products portfolio" },

      { url: "/tools/",                                              label: "All Free Compliance Tools",              category: "Tools",       tags: "tools calculators free" },
      { url: "/tools/mees-risk-snapshot/",                           label: "MEES Risk Snapshot",                     category: "Tools",       tags: "mees epc risk band-c property" },
      { url: "/tools/ppn-002-calculator/",                           label: "PPN 002 Social Value Calculator",        category: "Tools",       tags: "ppn social value procurement bid" },
      { url: "/tools/late-payment-calculator/",                      label: "Late Payment Calculator",                category: "Tools",       tags: "late payment invoice interest" },
      { url: "/tools/cyber-essentials-readiness/",                   label: "Cyber Essentials Readiness",             category: "Tools",       tags: "cyber essentials soc readiness" },
      { url: "/tools/csrd-applicability-checker/",                   label: "CSRD Applicability Checker",             category: "Tools",       tags: "csrd applicability eu reporting" },
      { url: "/tools/vsme-materiality-light/",                       label: "VSME Materiality Light",                 category: "Tools",       tags: "vsme materiality sme esg" },

      { url: "/pricing.html",                                        label: "Pricing",                                category: "Pages",       tags: "price cost plan subscription" },
      { url: "/about.html",                                          label: "About",                                  category: "Pages",       tags: "team mission company" },
      { url: "/contact.html",                                        label: "Contact",                                category: "Pages",       tags: "help support email" },
      { url: "/faq.html",                                            label: "FAQ",                                    category: "Pages",       tags: "help question answer" },
      { url: "/roadmap.html",                                        label: "Roadmap",                                category: "Pages",       tags: "plan future" },
      { url: "/changelog.html",                                      label: "Changelog",                              category: "Pages",       tags: "release updates history" },
      { url: "/partners.html",                                       label: "Partners",                               category: "Pages",       tags: "partner channel reseller" },
      { url: "/resources.html",                                      label: "Resources",                              category: "Pages",       tags: "resources guides reading" },
      { url: "/demo.html",                                           label: "Book a Demo",                            category: "Pages",       tags: "demo schedule meeting" },
      { url: "/intel/mees-tracker/",                                 label: "MEES Live Tracker",                      category: "Pages",       tags: "mees epc tracker live regulatory" },
      { url: "/intel/cyber-essentials-tracker/",                     label: "Cyber Essentials Live Tracker",          category: "Pages",       tags: "cyber essentials tracker live regulatory" },
      { url: "/404.html",                                            label: "404: Page Not Found",                   category: "Pages",       tags: "not found error" },

      { url: "/blog/",                                               label: "CrowAgent Insights (Blog index)",        category: "Blog",        tags: "blog articles insights" },
      { url: "/blog/mees-band-c-2028.html",                          label: "MEES Band C 2028: Commercial Landlords",                    category: "Blog", tags: "mees epc band-c 2028 landlord" },
      { url: "/blog/mees-commercial-property-guide.html",            label: "MEES 2028: Commercial Landlord's Guide",                    category: "Blog", tags: "mees epc landlord commercial" },
      { url: "/blog/mees-compliance-checklist-commercial-property.html", label: "MEES Compliance Checklist",                              category: "Blog", tags: "mees checklist compliance" },
      { url: "/blog/mees-exemptions-guide.html",                     label: "MEES Exemptions Guide",                                      category: "Blog", tags: "mees exemption legal" },
      { url: "/blog/mees-fine-exposure-calculator-guide.html",       label: "MEES Fine Exposure Calculator Guide",                        category: "Blog", tags: "mees fine penalty calculator" },
      { url: "/blog/epc-band-commercial-property-guide.html",        label: "EPC Band Ratings: Complete Guide",                          category: "Blog", tags: "epc band rating guide" },
      { url: "/blog/epc-register-explained.html",                    label: "EPC Register Explained",                                     category: "Blog", tags: "epc register data lookup" },
      { url: "/blog/brown-discount-commercial-property-values.html", label: "The Brown Discount: EPC and Property Values",               category: "Blog", tags: "brown discount epc property value" },
      { url: "/blog/retrofit-cost-calculator-guide.html",            label: "Retrofit Cost Calculator Guide",                             category: "Blog", tags: "retrofit cost calculator" },
      { url: "/blog/what-is-retrofit-assessment-cost.html",          label: "What Is a Retrofit Assessment Cost?",                        category: "Blog", tags: "retrofit assessment cost" },
      { url: "/blog/cyber-essentials-v3-3-danzell-2026.html",        label: "Cyber Essentials v3.3 (Danzell): April 2026",               category: "Blog", tags: "cyber essentials v3.3 danzell" },
      { url: "/blog/mfa-mandatory-2026.html",                        label: "MFA Mandatory from April 2026",                              category: "Blog", tags: "mfa cyber security 2026" },
      { url: "/blog/ppn-002-guide.html",                             label: "PPN 002 Social Value: Complete Guide",                      category: "Blog", tags: "ppn social value guide" },
      { url: "/blog/ppn-002-social-value-explained.html",            label: "PPN 002 Social Value Explained",                             category: "Blog", tags: "ppn social value explainer" },
      { url: "/blog/ppn-002-social-value-guide.html",                label: "PPN 002: Social Value Scoring for Bids",                    category: "Blog", tags: "ppn social value scoring bid" },
      { url: "/blog/ppn-014-cyber-essentials-guide.html",            label: "PPN 014/21: Cyber Essentials for Public Sector",            category: "Blog", tags: "ppn cyber essentials public sector" },
      { url: "/blog/social-value-portal-vs-crowmark.html",           label: "Social Value Portal vs CrowMark",                            category: "Blog", tags: "social value portal crowmark compare" },
      { url: "/blog/social-value-themes-explained.html",             label: "The Five PPN 002 Social Value Themes",                       category: "Blog", tags: "ppn social value themes" },
      { url: "/blog/csrd-omnibus-i-2026.html",                       label: "CSRD and Omnibus I: March 2026 Changes",                    category: "Blog", tags: "csrd omnibus 2026" },
      { url: "/blog/regulatory-updates-2026.html",                   label: "UK & EU Sustainability Regulation: 2026 Changes",           category: "Blog", tags: "regulation 2026 uk eu sustainability" },

      { url: "/glossary/",                                           label: "UK Sustainability Compliance Glossary",  category: "Glossary",    tags: "glossary definitions terminology" },
      { url: "/glossary/mees-compliance.html",                       label: "MEES Compliance",                        category: "Glossary",    tags: "mees compliance definition" },
      { url: "/glossary/epc-rating.html",                            label: "EPC Rating",                             category: "Glossary",    tags: "epc rating definition" },
      { url: "/glossary/csrd.html",                                  label: "CSRD",                                   category: "Glossary",    tags: "csrd definition" },
      { url: "/glossary/ppn-002.html",                               label: "PPN 002",                                category: "Glossary",    tags: "ppn 002 definition" },
      { url: "/glossary/si-2015-962.html",                           label: "SI 2015/962 (MEES Regulations)",         category: "Glossary",    tags: "mees regulations si statute" },
      { url: "/glossary/toms-framework.html",                        label: "TOMs Framework",                         category: "Glossary",    tags: "toms social value framework" },

      { url: "/tools-mees-risk-snapshot-methodology.html",           label: "MEES Risk Snapshot: Methodology",       category: "Methodology", tags: "mees methodology source" },
      { url: "/tools-ppn002-calculator-methodology.html",            label: "PPN 002 Calculator: Methodology",       category: "Methodology", tags: "ppn methodology source" },
      { url: "/tools-late-payment-calculator-methodology.html",      label: "Late Payment Calculator: Methodology",  category: "Methodology", tags: "late payment methodology" },
      { url: "/tools-cyber-essentials-readiness-methodology.html",   label: "Cyber Essentials Readiness: Methodology",category: "Methodology", tags: "cyber methodology source" },
      { url: "/tools-csrd-checker-methodology.html",                 label: "CSRD Checker: Methodology",             category: "Methodology", tags: "csrd methodology source" },
      { url: "/tools-vsme-materiality-light-methodology.html",       label: "VSME Materiality Light: Methodology",   category: "Methodology", tags: "vsme methodology source" },

      { url: "/security.html",                                       label: "Security",                               category: "Legal",       tags: "soc gdpr trust security iso" },
      { url: "/privacy.html",                                        label: "Privacy Policy",                         category: "Legal",       tags: "privacy gdpr data policy" },
      { url: "/terms.html",                                          label: "Terms of Service",                       category: "Legal",       tags: "terms service legal" },
      { url: "/cookies.html",                                        label: "Cookie Policy",                          category: "Legal",       tags: "cookies policy gdpr" },
      { url: "/cookie-preferences.html",                             label: "Cookie Preferences",                     category: "Legal",       tags: "cookies preferences consent" }
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
    var CATEGORY_ORDER = ['Products', 'Tools', 'Pages', 'Blog', 'Glossary', 'Methodology', 'Legal'];

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

    function open() {
      wrap.hidden = false;
      activeIdx = 0;
      render('');
      /* ISSUE-009 (2026-05-22): toggle aria-expanded so the combobox
         pattern matches WAI-ARIA Authoring Practices 1.2 (combobox+listbox). */
      input.setAttribute('aria-expanded', 'true');
      requestAnimationFrame(function () { input.focus(); });
      document.documentElement.style.overflow = 'hidden';
    }
    function close() {
      wrap.hidden = true;
      input.value = '';
      input.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
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
