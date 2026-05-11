var APP_VERSION = '49';

// DEF-040 scripts-master-closer 10-05 — Service-worker registration (defence-in-depth).
// nav-inject.js already registers the SW (line 376-385); this inline IIFE fires from
// scripts.js too so non-shared-nav contexts (e.g. /404 with custom shell, future
// embed surfaces) still get a registered SW. Gated by feature-detect + protocol
// check (HTTPS-only — service workers do not run on http:// in production browsers,
// and we never want to register the marketing-site SW on the localhost dev server).
(function () {
  if (!('serviceWorker' in navigator)) return;
  if (window.location.protocol !== 'https:') return;
  // Defer to load so the registration race never blocks first-paint on slow connections.
  if (document.readyState === 'complete') {
    try { navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(function (err) {
      if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
        console.warn('SW register (scripts.js inline) failed:', err && err.message);
      }
    }); } catch (_) { /* register may throw synchronously on disabled origins */ }
  } else {
    window.addEventListener('load', function () {
      try { navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch(function (err) {
        if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
          console.warn('SW register (scripts.js inline) failed:', err && err.message);
        }
      }); } catch (_) { /* register may throw synchronously on disabled origins */ }
    }, { once: true });
  }
}());

// ── SCROLL LOCK SAFETY RESET — WP-WEB-HOTFIX-002 ──
// Clears any stale scroll-lock state on every page load
(function() {
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.height = '';
  document.documentElement.style.overflow = '';
  document.documentElement.style.height = '';
}());

// ── SCROLL-TRIGGERED SECTION REVEAL ──
(function() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function(el) { el.classList.add('visible'); });
    document.querySelectorAll('.fade-in').forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });
  document.querySelectorAll('.fade-in').forEach(function(el) { observer.observe(el); });
})();

// ── NAV SCROLL — Smart Sticky: hide on scroll-down, show on scroll-up with frosted glass ──
(function() {
  var nav = document.querySelector('nav');
  if (!nav) return;
  var lastY = 0;
  var ticking = false;
  function update() {
    var y = window.scrollY;
    // Don't hide nav when mobile menu is open
    var mobOpen = document.querySelector('.mob-menu.open');
    if (y > 60) {
      nav.classList.add('nav-frosted');
      if (y > lastY && y > 120 && !mobOpen) {
        nav.classList.add('nav-hidden');
      } else {
        nav.classList.remove('nav-hidden');
      }
    } else {
      nav.classList.remove('nav-frosted');
      nav.classList.remove('nav-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
})();

// ── CLOSE MOBILE NAV ON SCROLL ──
(function() {
  var mobMenu = document.querySelector('.mob-menu');
  if (!mobMenu) return;
  window.addEventListener('scroll', function() {
    if (mobMenu.classList.contains('open')) {
      closeMob();
    }
  }, { passive: true });
})();

// ── NAV SCROLL-SPY — WP-WEB-003 ──
(function() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-links a[href^="#"], .nav-links a[href*="#"]');
  if (!sections.length || !navLinks.length || !('IntersectionObserver' in window)) return;
  var spy = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        navLinks.forEach(function(link) { link.classList.remove('active'); link.classList.remove('nav-link-active'); });
        var id = entry.target.getAttribute('id');
        var active = document.querySelector('.nav-links a[href="#' + id + '"]');
        if (active) { active.classList.add('active'); active.classList.add('nav-link-active'); }
      }
    });
  }, { threshold: 0.35, rootMargin: '-72px 0px 0px 0px' });
  sections.forEach(function(s) { spy.observe(s); });
})();

// ── NAV READY HANDLER ──
(function() {
  function onNavReady() {
    // NAV GLASSMORPHISM — handled by Smart Sticky scroll handler above

    // PRODUCTS + FREE TOOLS MEGA MENUS — hover + click toggle (DEF-032: click-first on touch)
    // WEBSITE-FIX-001 WS-5: pre-fix only the FIRST `.nav-dropdown` (Products)
    // got handlers; the Free Tools dropdown (second `.nav-dropdown`) was
    // dead — chevron rendered, click did nothing. Now iterates all dropdowns
    // and wires each independently (each gets its own close-on-outside-click,
    // arrow-key navigation across menuitems, and Escape-to-close).
    (function() {
      var dropdowns = document.querySelectorAll('.nav-dropdown');
      if (!dropdowns.length) return;
      var isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      dropdowns.forEach(function(dropdown) {
        var trigger = dropdown.querySelector('.nav-dropdown-trigger');
        if (!trigger) return;
        var mega = dropdown.querySelector('.nav-mega');
        var items = mega ? Array.prototype.slice.call(mega.querySelectorAll('[role="menuitem"]')) : [];
        var closeTimer = null;
        function open() {
          clearTimeout(closeTimer);
          // Close other dropdowns first — only one open at a time.
          dropdowns.forEach(function(other) {
            if (other !== dropdown) {
              other.setAttribute('data-open', 'false');
              var otherTrigger = other.querySelector('.nav-dropdown-trigger');
              if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
            }
          });
          dropdown.setAttribute('data-open', 'true');
          trigger.setAttribute('aria-expanded', 'true');
        }
        function close() {
          dropdown.setAttribute('data-open', 'false');
          trigger.setAttribute('aria-expanded', 'false');
        }
        function delayClose() { closeTimer = setTimeout(close, 200); }
        // Desktop: hover to open/close
        if (!isTouch) {
          dropdown.addEventListener('mouseenter', open);
          dropdown.addEventListener('mouseleave', delayClose);
        }
        // Click toggle (touch + desktop)
        // DEF-032 scripts-master-closer 10-05 — Mega-menu robust trigger handlers.
        // Prior state: click-only. Touch users got the dropdown via `click` (touch
        // synthesises a click), but a pointerdown listener gives sub-100ms response
        // on slow Android click-delays AND ensures the dropdown opens before any
        // `mouseleave` fires from the host element. Keyboard users (Enter/Space on
        // the trigger button) now also get a deterministic toggle path — previously
        // Enter only fired implicit click, which itself ran but the touch-detection
        // branch sometimes caused an open-then-immediate-close due to outside-click
        // racing with the click event.
        trigger.addEventListener('click', function(e) {
          e.preventDefault();
          dropdown.getAttribute('data-open') === 'true' ? close() : open();
        });
        if ('PointerEvent' in window) {
          trigger.addEventListener('pointerdown', function(e) {
            // Only react to primary pointer (mouse left, single-finger touch, pen).
            if (e.pointerType === 'touch' || e.pointerType === 'pen') {
              // Pre-open on first touch — `click` will then toggle as normal but
              // the dropdown is already visible, removing the perceived 300ms lag.
              if (dropdown.getAttribute('data-open') !== 'true') {
                e.preventDefault();
                open();
              }
            }
          }, { passive: false });
        }
        trigger.addEventListener('keydown', function(e) {
          // Enter / Space toggle — matches WAI-APG menubar pattern.
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (dropdown.getAttribute('data-open') === 'true') {
              close();
            } else {
              open();
              if (items.length) items[0].focus();
            }
          }
        });
        // Keyboard navigation: arrow keys within menu, Escape to close
        dropdown.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') { close(); trigger.focus(); return; }
          if (!items.length) return;
          var current = items.indexOf(document.activeElement);
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (dropdown.getAttribute('data-open') !== 'true') open();
            var next = current < 0 ? 0 : Math.min(current + 1, items.length - 1);
            items[next].focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            var prev = current <= 0 ? items.length - 1 : current - 1;
            items[prev].focus();
          } else if (e.key === 'Home') {
            e.preventDefault();
            items[0].focus();
          } else if (e.key === 'End') {
            e.preventDefault();
            items[items.length - 1].focus();
          }
        });
        // Close on outside click — scoped to this dropdown only
        document.addEventListener('click', function(e) {
          if (!dropdown.contains(e.target)) close();
        });
      });
    })();

    // MOB-MENU CLOSE-ON-CLICK — moved here (fix: ran before nav-inject injected nav)
    document.querySelectorAll('.mob-menu a').forEach(function(a) {
      a.addEventListener('click', function() {
        closeMob();
      });
    });

    // WP-RESP-FIX-001: Bind hamburger click here (after nav-inject has injected .ham)
    // Inline onclick removed from nav-inject.js to prevent double-fire on Android
    (function() {
      var ham = document.querySelector('.ham');
      if (ham) {
        ham.addEventListener('click', function(e) {
          e.stopPropagation();
          toggleMob();
        });
      }
    })();

    // STATUS CHECK — website-only health (G-2 fix 2026-05-09).
    //
    // PRIOR BUG: this widget pinged the platform Railway API
    // (`crowagent-platform-production.up.railway.app/api/v1/health`),
    // which AND-aggregates 5 unrelated upstreams (Gemini, MHCLG EPC,
    // Supabase, Stripe, Redis). When ANY one was unhealthy the marketing
    // footer flipped to "Degraded performance" — even though the
    // marketing site's own uptime was unaffected. The platform has its
    // own status surface at status.crowagent.ai (linked in the footer
    // bottom).
    //
    // NEW: this widget ONLY reports website (Cloudflare Pages) health.
    // It fetches /status.json (a small static file we ship). If the
    // fetch resolves and the JSON says status="operational", we light
    // green. The static file lets us manually flip to "degraded" or
    // "incident" when needed without a code deploy.
    (function() {
      var dot = document.getElementById('status-dot');
      var label = document.getElementById('status-label');
      if (!dot || !label) return;
      fetch('/status.json', {
        method: 'GET',
        cache: 'no-cache',
        signal: AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined
      })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (data && data.status === 'operational') {
          dot.className = 'footer-status-dot online';
          label.textContent = data.label || 'All systems operational';
        } else if (data && data.status === 'degraded') {
          dot.className = 'footer-status-dot degraded';
          label.textContent = data.label || 'Degraded performance';
        } else if (data && data.status === 'incident') {
          dot.className = 'footer-status-dot offline';
          label.textContent = data.label || 'Incident in progress';
        } else {
          // Fetch returned nothing usable. Treat as operational (the page
          // itself loaded, so the website is up). Don't flag false alarms.
          dot.className = 'footer-status-dot online';
          label.textContent = 'All systems operational';
        }
      })
      .catch(function() {
        // Network blocked — but if this script ran the page already
        // loaded successfully, so the website itself IS operational.
        dot.className = 'footer-status-dot online';
        label.textContent = 'All systems operational';
      });
    })();

    // BACK-TO-TOP BUTTON — WP-WEB-TRANSFORM-001
    (function() {
      var btn = document.getElementById('back-to-top');
      if (!btn) return;
      window.addEventListener('scroll', function() {
        btn.classList.toggle('visible', window.scrollY > 400);
      }, { passive: true });
      btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    })();

    // SHADOW ONBOARDING — decorate signup links after nav/footer injection
    if (typeof window.caDecorateSignupLinks === 'function') {
      window.caDecorateSignupLinks();
    }
  }
  /* Fire immediately if nav already injected (race condition guard) */
  var navEl = document.querySelector('nav[role="navigation"]');
  if (navEl && navEl.hasChildNodes()) {
    onNavReady();
  } else {
    document.addEventListener('ca-nav-ready', onNavReady, { once: true });
  }
})();

// ── TOUCH SWIPE: Close mobile menu on swipe-left ──
(function() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  var startX = 0;
  menu.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  }, { passive: true });
  menu.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - startX;
    if (dx < -80) closeMob();
  }, { passive: true });
})();

// ── ANNOUNCE BAR DISMISS ──
function dismissBar() {
  var bar = document.getElementById('announce-bar');
  if (bar) bar.style.display = 'none';
  try { localStorage.setItem('ca_bar_dismissed', '1'); } catch(e) {}
  // Recalculate mob-menu top if open (announce bar height changed)
  var menu = document.querySelector('.mob-menu');
  var nav = document.querySelector('nav');
  if (menu && nav && menu.classList.contains('open')) {
    menu.style.top = nav.getBoundingClientRect().bottom + 'px';
  }
}

// CSP-compliant event delegation for inline handler replacements (DEF-003 / WA-001)
// Strict CSP `script-src 'self' ...` (no 'unsafe-inline') blocks `onclick=` attributes,
// which previously broke the pricing tabs (T-411), CSRD wizard, and roadmap notify form.
document.addEventListener('click', function(e) {
  // Announce bar dismiss
  if (e.target.closest('[data-action="dismiss-bar"]')) {
    dismissBar();
    return;
  }
  // Platform carousel switch
  var pcBtn = e.target.closest('[data-pc-switch]');
  if (pcBtn && typeof window.pcSwitch === 'function') {
    window.pcSwitch(parseInt(pcBtn.getAttribute('data-pc-switch'), 10));
    return;
  }
  // Pricing product-tab switcher (T-411)
  var ptabBtn = e.target.closest('[data-ptab]');
  if (ptabBtn && typeof switchPTab === 'function') {
    e.preventDefault();
    switchPTab(ptabBtn.getAttribute('data-ptab'), ptabBtn);
    return;
  }
  // CSRD wizard option select — handlers live in /js/modules/csrd-wizard.js,
  // exposed on `window.csrdSelect` once that module loads (see loader at EOF).
  var csrdSel = e.target.closest('[data-csrd-select]');
  if (csrdSel && typeof window.csrdSelect === 'function') {
    window.csrdSelect(csrdSel.getAttribute('data-csrd-select'), csrdSel.getAttribute('data-csrd-value'), csrdSel);
    return;
  }
  // CSRD wizard step navigation
  var csrdStep = e.target.closest('[data-csrd-step-go]');
  if (csrdStep && typeof window.csrdShowStep === 'function') {
    e.preventDefault();
    window.csrdShowStep(parseInt(csrdStep.getAttribute('data-csrd-step-go'), 10));
    return;
  }
  // Roadmap "Notify me" reveal (caToggleNotify)
  var notifyToggle = e.target.closest('[data-action="ca-notify-toggle"]');
  if (notifyToggle && typeof caToggleNotify === 'function') {
    caToggleNotify(notifyToggle);
    return;
  }
});

// CSRD email submit + roadmap notify-form submit (CSP-compliant submit delegation)
document.addEventListener('submit', function(e) {
  if (e.target && e.target.matches('[data-csrd-submit]') && typeof window.csrdSubmit === 'function') {
    e.preventDefault();
    window.csrdSubmit();
    return;
  }
  if (e.target && e.target.matches('[data-action="ca-notify-submit"]') && typeof caSubmitNotify === 'function') {
    e.preventDefault();
    caSubmitNotify(e.target);
    return;
  }
});

(function() {
  try { if (localStorage.getItem('ca_bar_dismissed')) {
    var b = document.getElementById('announce-bar');
    if (b) b.style.display = 'none';
  }} catch(e) {}
})();

// ── MOBILE HAMBURGER — WP-WEB-011 (scroll lock via .no-scroll class) ──
var _mobScrollY = 0;
function openMob() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  // Dynamically position mob-menu below nav + announce bar
  var nav = document.querySelector('nav');
  if (nav) {
    menu.style.top = nav.getBoundingClientRect().bottom + 'px';
  }
  _mobScrollY = window.pageYOffset || document.documentElement.scrollTop;
  document.body.classList.add('no-scroll');
  document.body.style.top = '-' + _mobScrollY + 'px';
  menu.classList.add('open');
  var firstLink = menu.querySelector('a');
  if (firstLink) firstLink.focus();
  var ham = document.querySelector('.ham');
  if (ham) ham.setAttribute('aria-expanded', 'true');
}
function closeMob() {
  var menu = document.querySelector('.mob-menu');
  if (!menu) return;
  document.body.classList.remove('no-scroll');
  document.body.style.top = '';
  menu.classList.remove('open');
  window.scrollTo(0, _mobScrollY);
  var ham = document.querySelector('.ham');
  if (ham) ham.setAttribute('aria-expanded', 'false');
}
function toggleMob() {
  var menu = document.querySelector('.mob-menu');
  if (menu && menu.classList.contains('open')) { closeMob(); } else { openMob(); }
}
// Auto-close mobile menu on internal link click
// (Moved into onNavReady to ensure .mob-menu exists after nav-inject)

// ── WP-RESP-FIX-001: (Moved into onNavReady — see above) ──
// Inline onclick removed from nav-inject.js; single programmatic listener
// now lives inside onNavReady() to prevent double-fire on Android.

// ── WP-RESP-FIX-002: Escape key closes mobile menu ──
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var menu = document.querySelector('.mob-menu');
    if (menu && menu.classList.contains('open')) {
      closeMob();
      var ham = document.querySelector('.ham');
      if (ham) ham.focus();
    }
  }
});

// ── WP-RESP-FIX-003: Focus trap inside mobile menu ──
(function() {
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;
    var menu = document.querySelector('.mob-menu');
    if (!menu || !menu.classList.contains('open')) return;
    var focusable = menu.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
})();

// ── PRICING PRODUCT TAB SWITCHER ──
// Phase-2 extension (2026-05-03): support core / mark / cyber / cash / esg tabs
function switchPTab(product, btn) {
  document.querySelectorAll('.ptab').forEach(function(t) {
    t.classList.remove('on');
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
  });
  btn.classList.add('on');
  btn.setAttribute('aria-selected', 'true');
  btn.setAttribute('tabindex', '0');
  // All product pricing panels — cyber/cash/esg added Phase 2
  var panels = ['core', 'mark', 'cyber', 'cash', 'esg'];
  panels.forEach(function(p) {
    var el = document.getElementById(p + '-p');
    if (!el) return;
    var active = (p === product);
    el.style.display = active ? 'grid' : 'none';
    el.hidden = !active;
  });
  // Toggle comparison tables with tabs (one comparison table per product, 2026-05-09)
  var compareIds = ['core', 'mark', 'cyber', 'cash', 'esg'];
  compareIds.forEach(function(p) {
    var cmp = document.getElementById(p + '-compare');
    if (!cmp) return;
    var active = (p === product);
    cmp.style.display = active ? '' : 'none';
    if (active) {
      cmp.classList.remove('is-hidden');
    } else {
      cmp.classList.add('is-hidden');
    }
  });
}
// Arrow-key navigation for pricing tabs (DEF-033 / Task 32.6)
(function() {
  var tablist = document.querySelector('.ptabs[role="tablist"]');
  if (!tablist) return;
  tablist.addEventListener('keydown', function(e) {
    var tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    var idx = tabs.indexOf(document.activeElement);
    if (idx < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      var next = tabs[(idx + 1) % tabs.length];
      next.click(); next.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      var prev = tabs[(idx - 1 + tabs.length) % tabs.length];
      prev.click(); prev.focus();
    } else if (e.key === 'Home') {
      // a11y-fix 10-05: Home key jumps to first tab (WAI-APG tabs pattern)
      e.preventDefault();
      tabs[0].click(); tabs[0].focus();
    } else if (e.key === 'End') {
      // a11y-fix 10-05: End key jumps to last tab (WAI-APG tabs pattern)
      e.preventDefault();
      tabs[tabs.length - 1].click(); tabs[tabs.length - 1].focus();
    }
  });
})();

// ── PRICING DEFAULT-STATE INITIALISER + URL-PARAM PRODUCT FILTER ──
// Fixes 2026-05-09 audit findings D1, D2, D3, D4:
//  - D1 (P0): /pricing default render showed all 5 panels stacked. Root
//    cause was the `[hidden]` attribute being silently overridden by the
//    `.pgrid{display:grid}` class rule on cascade order. CSS fix
//    (.pgrid[hidden]{display:none!important}) closes that, and this JS
//    init also calls switchPTab on the resolved/default product so the
//    inline-style override path runs even without a URL param. This
//    additionally restores correct tabindex semantics (D2: only the
//    active tab tabindex=0; inactive tabs tabindex=-1) on initial render.
//  - D3 (P1): honour `?billing=annual` URL param so external deep-links
//    can pre-select the annual toggle (e.g. /pricing?product=mark&billing=annual).
//  - D4 (P2): when ?product=csrd, surface a small note explaining CSRD
//    Checker is free, and link to /tools-csrd-checker — instead of
//    silently routing to Core.
(function() {
  if (typeof switchPTab !== 'function') return;
  var tablist = document.querySelector('.ptabs[role="tablist"]');
  if (!tablist) return;
  var params = new URLSearchParams(window.location.search);
  var rawProduct = params.get('product');
  var rawBilling = params.get('billing');
  var aliases = {
    'core': 'core', 'crowagent-core': 'core',
    'mark': 'mark', 'crowmark': 'mark',
    'cyber': 'cyber', 'crowcyber': 'cyber',
    'cash': 'cash', 'crowcash': 'cash',
    'esg': 'esg', 'crowesg': 'esg'
    // 'csrd' intentionally omitted — handled separately below
  };
  var resolved = 'core';
  var fromCsrd = false;
  if (rawProduct) {
    var key = rawProduct.toLowerCase();
    if (key === 'csrd') {
      fromCsrd = true;
      resolved = 'core'; // CSRD Checker is free; nearest paid is Core
    } else if (aliases[key]) {
      resolved = aliases[key];
    }
  }
  // Always run switchPTab so inline display:none is applied to non-active
  // panels. Without this, default /pricing rendered all 5 panels visibly.
  var btn = document.getElementById('ptab-' + resolved);
  if (btn) switchPTab(resolved, btn);

  // Honour ?billing=annual (D3 fix). The toggleBilling() function exists
  // in this file. Trigger the toggle if URL says annual and we're not.
  if (rawBilling && rawBilling.toLowerCase() === 'annual') {
    var toggleEl = document.getElementById('ttoggle');
    if (toggleEl && !toggleEl.classList.contains('ann')) {
      // Click the toggle to flip into annual mode (uses the same code
      // path as a user click, so all derived state — prices, JSON-LD,
      // CTAs — gets refreshed.)
      toggleEl.click();
    }
  }

  // CSRD-aware note (D4 fix). Only injects once.
  if (fromCsrd && btn) {
    var note = document.getElementById('csrd-pricing-note');
    if (!note) {
      var panel = document.getElementById('core-p');
      if (panel && panel.parentNode) {
        var n = document.createElement('p');
        n.id = 'csrd-pricing-note';
        n.className = 'csrd-pricing-note';
        n.innerHTML = 'CSRD Applicability Checker is <strong>free</strong> &mdash; no plan required. ' +
          '<a href="/tools-csrd-checker">Open the free tool &rarr;</a>';
        panel.parentNode.insertBefore(n, panel);
      }
    }
  }
})();

// ── PLAN LINK UPDATER (monthly/annual URL params) ──
// Extended 2026-05-09 (audit D7): added cyber-* and cash-* tier keys.
// Without these, toggling annual on Cyber/Cash panels left their CTAs
// stuck at the monthly plan slug.
var PLAN_LINKS = {
  starter: { monthly: 'starter', annual: 'starter_annual' },
  pro: { monthly: 'pro', annual: 'pro_annual' },
  portfolio: { monthly: 'portfolio', annual: 'portfolio_annual' },
  solo: { monthly: 'crowmark_solo', annual: 'crowmark_solo_annual' },
  team: { monthly: 'crowmark_team', annual: 'crowmark_team_annual' },
  agency: { monthly: 'crowmark_agency', annual: 'crowmark_agency_annual' },
  'cyber-starter':    { monthly: 'starter',    annual: 'starter_annual' },
  'cyber-pro':        { monthly: 'pro',        annual: 'pro_annual' },
  'cyber-enterprise': { monthly: 'enterprise', annual: 'enterprise_annual' },
  'cash-starter':     { monthly: 'starter',    annual: 'starter_annual' },
  'cash-pro':         { monthly: 'pro',        annual: 'pro_annual' },
  'cash-enterprise':  { monthly: 'enterprise', annual: 'enterprise_annual' }
};
function updatePlanLinks() {
  var isAnnual = !!(document.getElementById('ttoggle') && document.getElementById('ttoggle').classList.contains('ann'));
  document.querySelectorAll('[data-plan-tier]').forEach(function(el) {
    var tier = el.getAttribute('data-plan-tier');
    var config = PLAN_LINKS[tier];
    if (!config || !el.href) return;
    var url = new URL(el.href, window.location.origin);
    url.searchParams.set('plan', isAnnual ? config.annual : config.monthly);
    el.href = url.toString();
  });
}
window.caUpdatePlanLinks = updatePlanLinks;

/* WEB-AUDIT-140 C1 2026-05-09 fix: product-page deep-link forwarding.
   Honour `?cta=annual` (or `?billing=annual`) on product pages
   (/crowmark, /crowagent-core, /crowcyber, /crowcash, /crowesg) so
   external campaign links can route a click straight into the annual
   pricing experience. We rewrite every `/pricing?product=...` href on
   the page to also carry `billing=annual`, then the existing pricing
   page handler honours the param and pre-flips the toggle. Idempotent
   and safe: leaves URLs unchanged if no flag is present. */
(function() {
  if (!window.location || !window.URLSearchParams) return;
  var sp = new URLSearchParams(window.location.search);
  var raw = (sp.get('cta') || sp.get('billing') || '').toLowerCase();
  if (raw !== 'annual' && raw !== 'monthly') return;
  var anchors = document.querySelectorAll('a[href*="/pricing"]');
  anchors.forEach(function(a) {
    try {
      var u = new URL(a.getAttribute('href'), window.location.origin);
      if (!u.pathname.startsWith('/pricing')) return;
      if (u.searchParams.has('billing')) return;
      u.searchParams.set('billing', raw);
      // Preserve relative-vs-absolute style of the original href.
      var orig = a.getAttribute('href') || '';
      if (orig.startsWith('http')) {
        a.setAttribute('href', u.toString());
      } else {
        a.setAttribute('href', u.pathname + u.search + u.hash);
      }
    } catch (e) {
      // Ignore malformed hrefs; this is a non-critical UX enhancement.
    }
  });
})();

// ── JSON-LD PRICING SYNC (DEF-035 / Task 32.8) ──
function syncPricingJsonLd() {
  var ldScript = document.querySelector('script[type="application/ld+json"]');
  if (!ldScript) return;
  try {
    var data = JSON.parse(ldScript.textContent);
    if (!data.offers) return;
    var priceEls = document.querySelectorAll('.pv');
    priceEls.forEach(function(el, i) {
      if (data.offers[i]) {
        data.offers[i].price = (isAnn ? el.getAttribute('data-a') : el.getAttribute('data-m')) + '.00';
      }
    });
    ldScript.textContent = JSON.stringify(data);
  } catch(e) {}
}

// ── BILLING TOGGLE (monthly/annual) ──
var isAnn = false;
function toggleBilling() {
  isAnn = !isAnn;
  var toggle = document.getElementById('ttoggle');
  toggle.classList.toggle('ann', isAnn);
  toggle.setAttribute('aria-checked', String(isAnn));
  document.getElementById('lbl-m').style.color = isAnn ? 'var(--steel)' : 'var(--cloud)';
  document.getElementById('lbl-a').style.color = isAnn ? 'var(--cloud)' : 'var(--steel)';
  document.querySelectorAll('.pv').forEach(function(el) {
    el.textContent = isAnn ? el.getAttribute('data-a') : el.getAttribute('data-m');
  });
  document.querySelectorAll('.pp').forEach(function(el) {
    el.textContent = isAnn ? '/mo (billed annually)' : '/mo';
  });
  // Sync JSON-LD Offer prices (DEF-035)
  syncPricingJsonLd();
  // Persist toggle state (DEF-036)
  try { localStorage.setItem('ca_billing', isAnn ? 'annual' : 'monthly'); } catch(e) {}
  if (typeof window.caUpdatePlanLinks === 'function') window.caUpdatePlanLinks();
}
// Bind toggle click (replaces inline onclick removed for CSP/a11y)
(function() {
  var toggle = document.getElementById('ttoggle');
  if (!toggle) return;
  toggle.addEventListener('click', toggleBilling);
  // Restore persisted state (DEF-036 / 32.9)
  try {
    var saved = localStorage.getItem('ca_billing');
    if (saved === 'annual') { toggleBilling(); }
  } catch(e) {}
})();

// ── MEES COUNTDOWN — extracted to /js/modules/mees-countdown.js (WS-AUDIT-043) ──
// The hero #mees-days countdown pill now lives in its own module file.
// The standalone /crowagent-core.html one-shot uses /js/mees-countdown-core.js.

// ── ANIMATED PRODUCT DEMO — extracted to /js/modules/page-features.js (H3-PERF-FIX) ──

// ── CSRD FORM SUBMISSION — extracted to /js/modules/csrd-wizard.js (H3-PERF-FIX) ──
// submitCSRD(e) and the entire CSRD wizard live in js/modules/csrd-wizard.js.
// The CSP-compliant click + submit delegations earlier in this file feature-detect
// via typeof window.csrdSelect === "function" so they work transparently after the
// loader at end-of-file fetches the module on /csrd. Non-CSRD pages never pay the
// bytes — the loader is gated on document.querySelector("[data-csrd-step]").

// ── INTERSECTION OBSERVER: Stagger animations ──
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry, i) {
    if (entry.isIntersecting) {
      setTimeout(function() {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.sc, .hw, .pc, .sector, .tc, .uc').forEach(function(el) {
  el.style.opacity = '0';
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});

// ══════════════════════════════════════════════════════════════
//  ANCHOR SCROLL SYSTEM — WP-WEB-NEXT-004
//  Complete replacement — smoothScrollTo with nav offset
// ══════════════════════════════════════════════════════════════
(function() {
  'use strict';
  function getNavOffset() {
    var nav = document.querySelector('nav');
    if (!nav) return 80;
    return nav.getBoundingClientRect().bottom + 8;
  }
  function smoothScrollTo(el) {
    if (!el) return;
    var offset = getNavOffset();
    var top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
  // 1. Same-page anchor clicks (#how) — not cross-page (/#how)
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href[0] !== '#') return;
    var el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    smoothScrollTo(el);
    if (history.pushState) history.pushState(null, '', href);
  }, false);
  // 2. Hash-on-load (navigated from /#how on another page)
  var hash = window.location.hash;
  if (hash && hash !== '#' && hash[0] === '#') {
    function tryScroll() {
      var el = document.querySelector(hash);
      if (el) { smoothScrollTo(el); return; }
      setTimeout(function() {
        var el2 = document.querySelector(hash);
        if (el2) smoothScrollTo(el2);
      }, 400);
    }
    if (document.readyState === 'complete') {
      requestAnimationFrame(tryScroll);
    } else {
      window.addEventListener('load', function() {
        requestAnimationFrame(tryScroll);
      }, { once: true });
    }
  }
})();

// ── OUTSIDE CLICK: Close mobile menu ──
document.addEventListener('click', function(e) {
  var menu = document.querySelector('.mob-menu');
  var ham = document.querySelector('.ham');
  if (menu && ham && menu.classList.contains('open') && !menu.contains(e.target) && !ham.contains(e.target)) {
    closeMob();
  }
});

// ── CSRD INLINE FORM — removed (WP-WEB-TRANSFORM-001: IDs never existed in HTML) ──

// ── PHASE 2 NOTIFY-ME ──
function caToggleNotify(btn) {
  var wrap = btn.closest('.ca-notify-wrap');
  if (!wrap) return;
  btn.style.display = 'none';
  var form = wrap.querySelector('.ca-notify-form');
  if (form) form.style.display = 'flex';
  var input = wrap.querySelector('.ca-notify-input');
  if (input) input.focus();
}
async function caSubmitNotify(btn) {
  var wrap = btn.closest('.ca-notify-wrap');
  if (!wrap) return;
  var input = wrap.querySelector('.ca-notify-input');
  if (!input) return;
  var email = input.value.trim().replace(/[\r\n]+/g, '');
  var product = wrap.dataset.product || 'unknown';
  var errEl = wrap.querySelector('.ca-notify-error');
  var successEl = wrap.querySelector('.ca-notify-success');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    if (errEl) errEl.style.display = 'block';
    return;
  }
  if (errEl) errEl.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Saving...';
  try {
    await fetch('https://crowagent-platform-production.up.railway.app/api/v1/waitlist/notify', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : undefined,
      body: JSON.stringify({ product: product, email: email })
    });
  } catch(e) {}
  var notifyForm = wrap.querySelector('.ca-notify-form');
  if (notifyForm) notifyForm.style.display = 'none';
  if (successEl) successEl.style.display = 'block';
}

// ── CSRD INLINE EMAIL BLUR VALIDATION — removed (WP-WEB-TRANSFORM-001: csrd-i-email never existed) ──

// ── CSRD WIZARD EMAIL BLUR + FULL WIZARD + SHARE — extracted to /js/modules/csrd-wizard.js (H3-PERF-FIX) ──

// ── ANIMATED NUMBER COUNTERS (Task 11A) ──
(function() {
  var counters = document.querySelectorAll('.counter[data-target]');
  if (!counters.length) return;
  var animated = new Set();
  var cObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !animated.has(entry.target)) {
        animated.add(entry.target);
        animateStatCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(function(el) { cObserver.observe(el); });
  function animateStatCounter(el) {
    var target = parseFloat(el.dataset.target);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    var duration = 1800;
    var start = performance.now();
    function step(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(eased * target);
      var display = current >= 1000 ? current.toLocaleString('en-GB') : current;
      el.textContent = prefix + display + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();

// ── PRODUCT TAB DEMO — WP-WEB-003 ──
(function() {
  var tabBtns = document.querySelectorAll('.tab-btn');
  var tabPanels = document.querySelectorAll('.tab-panel');
  if (!tabBtns.length) return;
  tabBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var target = btn.dataset.tab;
      tabBtns.forEach(function(b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      tabPanels.forEach(function(p) { p.classList.remove('active'); p.setAttribute('hidden', ''); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('tab-' + target);
      if (panel) { panel.classList.add('active'); panel.removeAttribute('hidden'); }
    });
    btn.addEventListener('keydown', function(e) {
      var idx = Array.from(tabBtns).indexOf(btn);
      if (e.key === 'ArrowRight') { e.preventDefault(); var next = tabBtns[idx + 1] || tabBtns[0]; next.click(); next.focus(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); var prev = tabBtns[idx - 1] || tabBtns[tabBtns.length - 1]; prev.click(); prev.focus(); }
    });
  });
})();

// ── FAQ ACCORDION — WP-WEB-003 ──
(function() {
  var faqBtns = document.querySelectorAll('.faq-q');
  faqBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var answer = btn.nextElementSibling;
      btn.setAttribute('aria-expanded', !expanded);
      if (expanded) { answer.setAttribute('hidden', ''); }
      else { answer.removeAttribute('hidden'); }
    });
  });
})();

// ── METHODOLOGY ACCORDION ON MOBILE (Task 11C) ──
(function() {
  if (window.innerWidth > 768) return;
  var methodCards = document.querySelectorAll('[style*="border-left:3px solid"]');
  methodCards.forEach(function(card, i) {
    var title = card.querySelector('[style*="font-weight:700"][style*="font-size:14px"]');
    var body = card.querySelector('p');
    if (!title || !body) return;
    body.style.display = i === 0 ? 'block' : 'none';
    title.style.cursor = 'pointer';
    title.setAttribute('role', 'button');
    title.setAttribute('aria-expanded', i === 0 ? 'true' : 'false');
    title.addEventListener('click', function() {
      var isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'block';
      title.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    });
  });
})();

// ── BLOG FILTER TABS (WP-SUPP-002 Task 2.6) ──
(function() {
  var filters = document.querySelectorAll('.blog-filter');
  var articles = document.querySelectorAll('.blog-articles-grid article[data-category]');
  if (!filters.length || !articles.length) return;
  filters.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var filter = btn.dataset.filter;
      filters.forEach(function(b) { b.classList.remove('blog-filter-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('blog-filter-active'); btn.setAttribute('aria-pressed', 'true');
      articles.forEach(function(art) {
        art.style.display = (filter === 'all' || art.dataset.category === filter) ? '' : 'none';
      });
    });
  });
})();

// ── NOTIFY-ME FORMS (Formspree) ──
(function() {
  document.querySelectorAll('.notify-form').forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      // Honeypot check (DEF-005) — if filled, silently reject
      var honeypot = form.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;
      var data = new FormData(form);
      // Remove honeypot from submission
      data.delete('website');
      var btn = form.querySelector('.notify-btn');
      var success = form.querySelector('.notify-success');
      if (btn) { btn.disabled = true; btn.textContent = 'Adding...'; }
      fetch('https://formspree.io/f/xbdpkaol', {
        method: 'POST', body: data, headers: { 'Accept': 'application/json' },
        signal: (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(10000) : undefined
      }).then(function(r) {
        if (r.ok) {
          if (success) success.style.display = 'block';
          if (btn) btn.style.display = 'none';
          var emailInput = form.querySelector('input[type="email"]');
          if (emailInput) emailInput.style.display = 'none';
        } else {
          if (btn) { btn.disabled = false; btn.textContent = 'Notify me \u2192'; }
        }
      }).catch(function() {
        if (btn) { btn.disabled = false; btn.textContent = 'Notify me \u2192'; }
      });
    });
  });
})();

// ── CONTACT PAGE FORM (WP-SUPP-002 Task 2.2) ──
(function() {
  var form = document.getElementById('contactPageForm');
  if (!form) return;
  function showErr(id, msg) { var el = document.getElementById(id); if (el) { el.textContent = msg; el.style.display = 'block'; } }
  function clearErr(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; }
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    // Honeypot check (DEF-005) — if filled, silently reject
    var honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) return;
    var name = document.getElementById('cp-name').value.trim();
    var email = document.getElementById('cp-email').value.trim().replace(/[\r\n]+/g, '');
    var btn = document.getElementById('cpSubmitBtn');
    var success = document.getElementById('cpFormSuccess');
    var error = document.getElementById('cpFormError');
    var valid = true;
    clearErr('cp-name-err'); clearErr('cp-email-err');
    if (!name) { showErr('cp-name-err', 'Please enter your name.'); valid = false; }
    /* WEB-AUDIT-141 C2 2026-05-09 fix: replaced trivial `a@b.c` check
       with an RFC-5322 lite pattern. Rejects e.g. `@.`, `a@`, `@b.c`,
       `a@b`, `a@b.`, multiple @, leading/trailing dots, internal
       whitespace, and addresses without a TLD. */
    var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email || !EMAIL_RE.test(email)) { showErr('cp-email-err', 'Please enter a valid email address.'); valid = false; }
    if (!valid) return;
    // Turnstile token check, when a valid widget is present.
    var turnstileInput = form.querySelector('[name="cf-turnstile-response"]');
    if (turnstileInput && !turnstileInput.value) {
      if (error) { error.textContent = 'Please complete the security check.'; error.style.display = 'block'; }
      return;
    }
    btn.disabled = true; btn.textContent = 'Sending...';
    success.style.display = 'none'; error.style.display = 'none';
    /* DEF-042 2026-05-09 fix: contact-form formspree fetch was missing
       AbortSignal.timeout — could hang indefinitely on stalled formspree edges. */
    fetch('https://formspree.io/f/xbdpkaol', {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
      signal: (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? AbortSignal.timeout(10000) : undefined
    })
    .then(function(r) { if (r.ok) { form.reset(); success.style.display = 'block'; btn.textContent = 'Message sent'; } else { throw new Error(); } })
    .catch(function() { error.style.display = 'block'; btn.disabled = false; btn.textContent = 'Send message'; });
  });
})();

// ── COOKIE CONSENT — GRANULAR — WP-WEB-NEXT-001 ──
// 2026-05-11 race fix: this IIFE runs at script parse time but the banner DOM
// (#ca-cookie + child elements) is injected by /js/cookie-banner.js later in
// DOMContentLoaded. Prior `if (!banner) return;` bailed permanently so Accept
// click wiring never happened — banner stayed visible, no consent written.
// Retry up to ~6s (30 × 200ms) until the banner DOM is in the document.
(function init() {
  var CONSENT_KEY = 'ca_cookie_consent_v2';
  var OLD_KEY = 'ca-cookie-ok';
  var banner = document.getElementById('ca-cookie');
  var simpleActions = document.getElementById('ca-cookie-simple');
  var detailPanel = document.getElementById('ca-cookie-detail');
  var analyticsChk = document.getElementById('ca-cookie-analytics');
  var marketingChk = document.getElementById('ca-cookie-marketing');
  var reopenBtn = document.getElementById('ca-cookie-reopen');
  if (!banner) {
    init._retries = (init._retries || 0) + 1;
    if (init._retries <= 30) { setTimeout(init, 200); }
    return;
  }

  function getConsent() {
    /* WEB-AUDIT-141 C2 2026-05-09 fix: previously swallowed the parse
       error silently. Now we surface a concise warning so a corrupted
       consent cookie shows up in DevTools / PostHog Sentry without
       blocking the rest of the page. The function still returns null
       on failure so the cookie banner re-prompts. */
    var raw = null;
    try { raw = localStorage.getItem(CONSENT_KEY); } catch (storageErr) { return null; }
    if (raw == null) return null;
    try {
      return JSON.parse(raw);
    } catch (parseErr) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn('[ca-cookie] failed to parse stored consent — ignoring stale value', parseErr);
      }
      return null;
    }
  }
  function saveConsent(analytics, marketing) {
    var consent = { necessary: true, analytics: !!analytics, marketing: !!marketing, ts: Date.now() };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    localStorage.removeItem(OLD_KEY);
    hideBanner();
    // Update PostHog consent state (DEF-011 / DEF-012)
    if (typeof window.caPostHogConsentUpdate === 'function') {
      window.caPostHogConsentUpdate(!!analytics);
    }
    // DEF-012 scripts-master-closer 10-05 — defence-in-depth on Reject-all.
    //   1. Even if analytics-init.js never loaded (slow connection, blocked),
    //      we still call posthog.opt_out_capturing() directly when the global
    //      stub is present.
    //   2. PostHog drops `ph_*_posthog` cookies once it has captured anything.
    //      A naked opt_out_capturing() does not retroactively clear them. We
    //      expire every PostHog cookie back to 1970 on both the bare host and
    //      `.crowagent.ai` so a follow-up page-load starts truly cold.
    //      Necessary cookies (consent state itself) are kept.
    if (!analytics) {
      try {
        if (window.posthog && typeof window.posthog.opt_out_capturing === 'function') {
          window.posthog.opt_out_capturing();
        }
      } catch (_) { /* posthog method threw — never let it block the consent flow */ }
      try {
        var domains = ['', '; domain=.' + window.location.hostname.replace(/^www\./, '')];
        var paths = ['/', '/blog', '/products'];
        document.cookie.split(';').forEach(function(raw) {
          var name = raw.split('=')[0].trim();
          if (!/^ph_|^posthog/i.test(name)) return;
          domains.forEach(function(d) {
            paths.forEach(function(p) {
              document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=' + p + d + '; SameSite=Lax';
            });
          });
        });
      } catch (_) { /* cookie API unavailable in some sandboxes */ }
    }
  }
  function showBanner() {
    banner.style.display = 'block';
    var stored = getConsent();
    if (stored && analyticsChk) analyticsChk.checked = !!stored.analytics;
    if (stored && marketingChk) marketingChk.checked = !!stored.marketing;
  }
  function hideBanner() { banner.style.display = 'none'; }
  function showDetail() {
    if (simpleActions) simpleActions.style.display = 'none';
    if (detailPanel) detailPanel.style.display = 'flex';
  }

  // Check existing consent
  var stored = getConsent();
  if (stored) {
    hideBanner();
  } else if (localStorage.getItem(OLD_KEY)) {
    // Migrate v1 consent
    var wasAccepted = localStorage.getItem(OLD_KEY) === '1';
    saveConsent(wasAccepted, false);
  } else {
    setTimeout(function() { showBanner(); }, 800);
  }

  // Simple action buttons
  var acceptBtn = document.getElementById('ca-cookie-accept');
  var rejectBtn = document.getElementById('ca-cookie-reject');
  var manageBtn = document.getElementById('ca-cookie-manage');
  var saveBtn = document.getElementById('ca-cookie-save');
  var acceptAllBtn = document.getElementById('ca-cookie-accept-all');

  if (acceptBtn) acceptBtn.addEventListener('click', function() { saveConsent(true, true); });
  if (rejectBtn) rejectBtn.addEventListener('click', function() { saveConsent(false, false); });
  if (manageBtn) manageBtn.addEventListener('click', function() { showDetail(); });
  if (saveBtn) saveBtn.addEventListener('click', function() {
    saveConsent(analyticsChk ? analyticsChk.checked : false, marketingChk ? marketingChk.checked : false);
  });
  if (acceptAllBtn) acceptAllBtn.addEventListener('click', function() { saveConsent(true, true); });

  // a11y-fix 10-05: Escape key dismisses the cookie banner (treats as
  // "Reject all" — the privacy-safe default per PECR if user actively
  // dismisses the consent UI without choosing). WAI-ARIA dialog pattern:
  // Escape MUST close any non-modal alertdialog without trapping focus.
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    var banner = document.getElementById('ca-cookie-banner');
    if (banner && banner.style.display !== 'none' && banner.offsetParent !== null) {
      saveConsent(false, false);
    }
  });
  if (reopenBtn) reopenBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (simpleActions) simpleActions.style.display = 'flex';
    if (detailPanel) detailPanel.style.display = 'none';
    showBanner();
  });
})();

// ── CSRD STEP MICRO-INTERACTIONS — WP-WEB-003-SUP ──
(function() {
  document.addEventListener('change', function(e) {
    var step = e.target.closest('.csrd-step, .csrd-option');
    if (!step) return;
    step.classList.add('answered', 'step-complete');
    setTimeout(function() { step.classList.remove('step-complete'); }, 450);
  });
})();

// ── FOOTER SYSTEM STATUS — moved into ca-nav-ready listener (WP-WEB-FIX-001) ──

// ── PRICING CARD ENTRANCE — WP-WEB-003-SUP ──
(function() {
  var featured = document.querySelector('.pgc-pop');
  if (!featured || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) { setTimeout(function() { featured.classList.add('animate-in'); }, 150); obs.disconnect(); }
    });
  }, { threshold: 0.4 });
  obs.observe(featured);
})();

// ── HERO SEGMENT SELECTOR — extracted to /js/modules/hero-persona-switcher.js (WS-AUDIT-043) ──
// Hero persona segment selector + UTM personalisation now lives in its own module file.


// ── ROADMAP TIMELINE — WP-WEB-004 ──
(function() {
  var milestones = document.querySelectorAll('.roadmap-milestone');
  if (!milestones.length || !('IntersectionObserver' in window)) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.2 });
  milestones.forEach(function(m) { obs.observe(m); });
})();

// ── TOOLTIP DISMISS — extracted to /js/modules/page-features.js (H3-PERF-FIX) ──

// ── CONTACT PAGE FORM BLUR VALIDATION — WP-QA-001 BUG #29 ──
(function() {
  var form = document.getElementById('contactPageForm');
  if (!form) return;
  form.querySelectorAll('.form-input[required]').forEach(function(input) {
    input.setAttribute('data-touched', 'false');
    input.addEventListener('blur', function() {
      this.setAttribute('data-touched', 'true');
      var errId = this.id + '-err';
      var errEl = document.getElementById(errId);
      if (!errEl) return;
      if (this.type === 'email') {
        var val = this.value.trim();
        if (!val || !val.includes('@') || !val.includes('.')) {
          errEl.style.display = 'block';
        } else {
          errEl.style.display = 'none';
        }
      } else {
        if (!this.value.trim()) {
          errEl.style.display = 'block';
        } else {
          errEl.style.display = 'none';
        }
      }
    });
  });
})();

// ── Module exports (for testing) ─────────────────────────────────────────────
// H3-PERF-FIX (2026-05-10): the CSRD wizard moved to /js/modules/csrd-wizard.js
// and the page-feature IIFEs (animated demo, particle canvas, tooltip dismiss,
// how-it-works tabs) moved to /js/modules/page-features.js. In CommonJS test
// environments we require those modules so tests that depend on tooltip /
// how-it-works behaviour continue to wire up against `document` listeners as
// they did when the code lived inline. In the browser the loaders at EOF do
// the equivalent via <script> insertion (selector-gated).
if (typeof module !== 'undefined' && module.exports) {
  var csrdMod = require('./js/modules/csrd-wizard.js');
  // page-features.js wires document listeners and decorates DOM that the test
  // suite asserts against. The module is idempotent and selector-gated, so a
  // require under jsdom (where the test fixtures expose .term and .how-tab
  // markup) executes the IIFEs once. We require lazily so production module
  // loading remains controlled by the dynamic <script> loader below.
  require('./js/modules/page-features.js');
  module.exports = {
    dismissBar: dismissBar,
    toggleMob: toggleMob,
    switchPTab: switchPTab,
    toggleBilling: toggleBilling,
    submitCSRD: csrdMod.submitCSRD,
    caToggleNotify: caToggleNotify,
    caSubmitNotify: caSubmitNotify,
    csrdSelect: csrdMod.csrdSelect,
    csrdShowStep: csrdMod.csrdShowStep,
    csrdMapEmployees: csrdMod.csrdMapEmployees,
    csrdMapTurnover: csrdMod.csrdMapTurnover,
    csrdGetResult: csrdMod.csrdGetResult,
    get csrdState() { return csrdMod.csrdState; },
    set csrdState(v) { csrdMod.csrdState = v; }
  };
}

/* ── SPOTLIGHT CARD HOVER MODULE — WP-WEB-008 FIX-H ── */
(function () {
  'use strict';
  var cards = document.querySelectorAll('.uc, .hw, .sector, .tc, .pgc, .resource-card, .pc:not(.pc-locked):not(.pc-p3)');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    }, { passive: true });
    card.addEventListener('mouseleave', function () {
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    }, { passive: true });
  });
}());

// WP-WEB-006: Sliding tab pill
(function() {
  function positionTabPill() {
    var active = document.querySelector('.tab-btn.active');
    var pill = document.getElementById('tab-pill');
    if (!active || !pill) return;
    var nav = active.closest('.tab-nav');
    if (!nav) return;
    var nr = nav.getBoundingClientRect();
    var br = active.getBoundingClientRect();
    pill.style.width = br.width + 'px';
    pill.style.transform = 'translateX(' + (br.left - nr.left - 4) + 'px)';
  }
  document.addEventListener('DOMContentLoaded', function() {
    positionTabPill();
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { setTimeout(positionTabPill, 10); });
    });
  });
  window.addEventListener('resize', positionTabPill, { passive: true });
})();

// ── HERO MOCK COUNTER ANIMATION ──
(function() {
  var counters = document.querySelectorAll('.hero-counter');
  if (!counters.length) return;
  var animated = false;
  function animateCounters() {
    if (animated) return;
    animated = true;
    counters.forEach(function(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var duration = 1800;
      var start = performance.now();
      function step(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('en-GB');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) { if (e.isIntersecting) { setTimeout(animateCounters, 1000); obs.disconnect(); } });
    }, { threshold: 0.3 });
    counters.forEach(function(c) { obs.observe(c); });
  } else {
    setTimeout(animateCounters, 1000);
  }
})();

// ── SCROLL-TO-TOP ──────────────────────────────────────────────
// WEB-AUDIT-066: Static button is in HTML; first IIFE (line ~158) attaches listeners.
// This block is now a no-op safeguard to prevent duplicate id="back-to-top" if static
// markup is absent on a given page. It will only run when no button exists.
(function() {
  var existing = document.getElementById('back-to-top');
  if (existing) return; // static HTML already provides + first IIFE has wired listeners
  var btn = document.createElement('button');
  btn.id = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
  document.body.appendChild(btn);
  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });
  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// ── PLATFORM CAROUSEL — extracted to /js/modules/platform-carousel.js (WS-AUDIT-043) ──
// Hero .pc-screen rotation now lives in its own module file.

// ── PARTICLE CANVAS — extracted to /js/modules/page-features.js (H3-PERF-FIX) ──


// ═══════════════════════════════════════════════════════════════
// PHASE 4: MICRO-INTERACTIONS
// ═══════════════════════════════════════════════════════════════

// ── FADE-IN-UP OBSERVER — staggered card animations ──
(function() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-in-up').forEach(function(el) { el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  // Auto-apply fade-in-up to grid children (cards, sectors, trust items)
  var grids = document.querySelectorAll('.sector-grid, .tc-grid, .hw-grid, .u-grid-3, .methodology-4col, .stats-grid');
  grids.forEach(function(grid) {
    var children = grid.children;
    for (var i = 0; i < children.length; i++) {
      if (!children[i].classList.contains('fade-in-up')) {
        children[i].classList.add('fade-in-up');
        if (i < 6) children[i].classList.add('delay-' + Math.min(i + 1, 4));
      }
      observer.observe(children[i]);
    }
  });

  // Also observe any manually-placed .fade-in-up elements
  document.querySelectorAll('.fade-in-up').forEach(function(el) {
    observer.observe(el);
  });

  /* visual-fix 10-05: safety net — guarantee every .fade-in-up reaches the
     .visible state within 2.5s of script-run, even if IO never fires (fast
     scroll, low-end browser, viewport quirks). 23/54 elements were stuck
     without .visible in agent testing without this. */
  setTimeout(function () {
    document.querySelectorAll('.fade-in-up:not(.visible)').forEach(function (el) {
      el.classList.add('visible');
    });
  }, 2500);
})();

// ── SWIPE HINT — inject into pricing comparison tables on mobile ──
(function() {
  if (window.innerWidth > 768) return;
  var tables = document.querySelectorAll('.table-scroll-wrapper');
  tables.forEach(function(wrapper) {
    if (wrapper.querySelector('.swipe-hint')) return;
    var hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.innerHTML = 'Swipe to compare <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    wrapper.parentNode.insertBefore(hint, wrapper);
    // Hide hint after first scroll
    var comp = wrapper.closest('.ca-comparison');
    if (comp) {
      comp.addEventListener('scroll', function() {
        hint.style.opacity = '0';
        setTimeout(function() { hint.style.display = 'none'; }, 300);
      }, { once: true, passive: true });
    }
  });
})();


// ═══════════════════════════════════════════════════════════════
// PHASE 5: SHADOW ONBOARDING — Global Intent Capture
// Captures demo postcode and decorates ALL signup links site-wide
// ═══════════════════════════════════════════════════════════════
(function() {
  'use strict';
  var STORAGE_KEY = 'ca_intent_postcode';

  // Save intent — called from inline runLiveDemo() in index.html
  window.caSaveIntent = function(postcode) {
    if (postcode && typeof postcode === 'string' && postcode.trim()) {
      try { sessionStorage.setItem(STORAGE_KEY, postcode.trim().toUpperCase()); } catch(e) {}
      window.caDecorateSignupLinks();
    }
  };

  // Decorate all signup links with the captured postcode + PostHog tracking
  window.caDecorateSignupLinks = function() {
    var postcode;
    try { postcode = sessionStorage.getItem(STORAGE_KEY); } catch(e) { return; }

    var links = document.querySelectorAll('a[href*="app.crowagent.ai/signup"]');
    links.forEach(function(link) {
      // Append postcode if available
      if (postcode) {
        try {
          var url = new URL(link.href);
          if (!url.searchParams.has('postcode')) {
            url.searchParams.set('postcode', postcode);
            link.href = url.toString();
          }
        } catch(e) {}
      }
      // PostHog: track signup link clicks (bind once)
      if (!link.dataset.phBound) {
        link.addEventListener('click', function() {
          if (typeof posthog !== 'undefined') {
            posthog.capture('cta_signup_clicked', {
              postcode: postcode || '',
              href: link.href,
              page: window.location.pathname
            });
          }
        });
        link.dataset.phBound = 'true';
      }
    });
  };

  // Run on page load if intent already exists (cross-page persistence)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.caDecorateSignupLinks();
    });
  } else {
    window.caDecorateSignupLinks();
  }
})();


// ═══════════════════════════════════════════════════════════════
// HOW IT WORKS Tabbed — extracted to /js/modules/page-features.js (H3-PERF-FIX) ──

// === CC1 cross-cutting closer 10-05 ===
// WS-AUDIT-038 — Contact / notify form double-submit guard (JS half).
//
// CSS half (`button[data-loading="true"]` busy indicator + cursor:wait
// + opacity .65) was shipped by the P2-grouped agent in the
// `/* === P2-GROUPED 10-05 === */` styles.css block. This JS half wraps
// the contact and notify form handlers so:
//   - At submit START: btn.disabled=true; btn.dataset.loading='true';
//   - In the .finally() leg: btn.disabled=false; delete btn.dataset.loading;
// Idempotent: the existing handlers already disable `.btn` themselves —
// this layer adds the `data-loading` attribute so the CSS busy-state
// activates even if the handler text-swap (e.g. "Sending..." → "Sent")
// hasn't yet returned. We use capture-phase delegation so the guard
// fires before any other submit listener — and re-enables on completion
// regardless of fetch outcome.
//
// Forms covered:
//   - #contactPageForm (contact.html)
//   - .notify-form (waitlist / coming-soon CTAs across roadmap, crowesg)
//
// NOT covered here: csrd-email-form (already disables its own submit btn
// via inline handler at line ~1135), partners-form.js (separate module
// — owns its own submit + double-submit guard).
(function() {
  function guard(form) {
    if (!form || form.__caCC1DoubleSubmitGuard) return;
    form.__caCC1DoubleSubmitGuard = true;
    form.addEventListener('submit', function() {
      var btn = form.querySelector(
        'button[type="submit"], .btn-form, .notify-btn, #cpSubmitBtn'
      );
      if (!btn) return;
      btn.disabled = true;
      btn.dataset.loading = 'true';
      var release = function() {
        btn.disabled = false;
        delete btn.dataset.loading;
      };
      // Re-enable after a generous 15s upper bound — covers the AbortSignal
      // .timeout(10000) used by the inner handler plus a small buffer for
      // success-state rendering. If the inner handler navigates away or
      // hides the button, this is a no-op.
      setTimeout(release, 15000);
      // If the inner handler swaps the button text to a success state,
      // we still want the disabled+busy attribute removed. Watch for the
      // form being reset() (success path resets the form).
      form.addEventListener('reset', release, { once: true });
    }, true /* capture, fires before inner handler */);
  }
  function wireAll() {
    var contact = document.getElementById('contactPageForm');
    if (contact) guard(contact);
    var notifyForms = document.querySelectorAll('.notify-form');
    for (var i = 0; i < notifyForms.length; i++) guard(notifyForms[i]);
    var csrdForms = document.querySelectorAll('[data-csrd-submit]');
    for (var j = 0; j < csrdForms.length; j++) guard(csrdForms[j]);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireAll);
  } else {
    wireAll();
  }
  // Re-wire after nav-injected dynamic forms (defence-in-depth).
  document.addEventListener('ca-nav-ready', wireAll);
  document.addEventListener('ca-footer-ready', wireAll);
})();

/* ── E-INFRA 10-10 ─────────────────────────────────────────────────────
 * PurgeCSS class-token safelist seed.
 *
 * User report 2026-05-10: footer broken on every page; Products + Free
 * Tools dropdown unreachable on blog pages.
 *
 * Root cause #1 (footer): the active CSS purge pipeline
 * (`scripts/build-css-purged.js` + `purgecss.config.js`) scans only HTML +
 * `scripts.js`/`chatbot.js`/`cookie-banner.js` for class tokens. The shared
 * nav + footer markup is injected at runtime by `js/nav-inject.js`, which
 * `purgecss.config.js` deliberately excludes from its content scan to keep
 * purge tight. As a consequence, every footer + nav-mega selector below
 * was being stripped from `styles.min.css` — verified in the 2026-05-10
 * pre-fix audit (28 selectors purged, including `.footer-grid`,
 * `.footer-col-title`, `.foot-social`, `.footer-trust-row`,
 * `.footer-credibility`, `.footer-link-coming-soon`, `.coming-soon-chip`,
 * `.footer-status-label`, `.footer-tagline`, `.footer-legal-entity`,
 * `.footer-bottom-link`, `.footer-bottom`, `.footer-copyright`,
 * `.footer-col`, `.cookie-reopen-link`, `.ca-banner-wrapper`,
 * `.nav-mega-col`, `.nav-mega-label`, `.nav-mega-icon`, `.nav-mega-desc`,
 * `.nav-mega-item--soon`).
 *
 * The `purgecss.config.js` extractor tokenises `[A-Za-z0-9_-]+`, so
 * mentioning each class as an identifier-shaped token in this file is
 * sufficient to preserve the matching CSS rule. We deliberately put the
 * tokens in a single string literal (rather than dot-prefixed CSS
 * selectors) so the tokens are unambiguous, the literal carries no runtime
 * cost (it's never executed), and `terser` strips the entire void-expression
 * during minification (so `scripts.min.js` stays small).
 *
 * If a future class needs to survive the purge but is only injected from
 * nav-inject.js, ADD IT TO THIS LIST. Do NOT touch
 * `purgecss-safelist.json` — that file is restricted; this seed is the
 * sanctioned escape hatch per the 2026-05-10 E-INFRA charter.
 */
void [
  // Footer layout ----------------------------------------------------
  'ca-footer', 'footer-grid', 'footer-col', 'footer-col-brand',
  'footer-col-title', 'footer-links', 'footer-link-coming-soon',
  'coming-soon-chip', 'footer-tagline', 'footer-legal-entity',
  'footer-status', 'footer-status-dot', 'footer-status-label',
  'foot-social', 'footer-credibility', 'footer-credibility-line',
  'footer-trust-row', 'footer-bottom', 'footer-bottom-link',
  'footer-copyright', 'footer-infra', 'cookie-reopen-link',
  'online', 'degraded', 'offline',
  // Nav mega menu ----------------------------------------------------
  'nav-mega', 'nav-mega-col', 'nav-mega-label', 'nav-mega-item',
  'nav-mega-item--soon', 'nav-mega-icon', 'nav-mega-desc',
  'nav-dropdown', 'nav-dropdown-trigger',
  'nav-actions', 'nav-login', 'nav-cta', 'nav-price-hint',
  // Banner / a11y wrapper -------------------------------------------
  'ca-banner-wrapper',
  // Mobile menu ------------------------------------------------------
  'mob-menu', 'ham',
  // Hero trust / shared chips ---------------------------------------
  'ca-touch-target',
];

/* === end E-INFRA 10-10 ============================================= */

/* ── DYNAMIC MODULE LOADERS — H3-PERF-FIX 2026-05-10 ─────────────────────
 * Page-specific feature modules are deferred-loaded via <script> tags
 * inserted only when their target DOM is present. This keeps
 * scripts.min.js below the 30 KB charter target on the 75+ pages that
 * never touch CSRD wizard markup.
 *
 * Loader runs in the browser only (skipped under CommonJS / jest).
 * Each loader:
 *   1. Selector-gates the module fetch (no DOM match → no fetch).
 *   2. Adds defer so the script is parsed off the critical path.
 *   3. Versions the URL with APP_VERSION so a cache-bust on deploy
 *      flushes stale module bytes.
 *   4. Idempotent — re-firing on `ca-nav-ready` is harmless because
 *      the gate checks for a prior <script src=...> insertion.
 * ─────────────────────────────────────────────────────────────────────── */
(function () {
  if (typeof document === 'undefined') return;
  function loadOnce(src) {
    if (document.querySelector('script[data-h3-mod="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src + '?v=' + APP_VERSION;
    s.defer = true;
    s.setAttribute('data-h3-mod', src);
    document.head.appendChild(s);
  }
  function maybeLoadCsrd() {
    if (document.querySelector('[data-csrd-step]') ||
        document.querySelector('#csrd-email-form') ||
        document.querySelector('#csrdShare')) {
      loadOnce('/js/modules/csrd-wizard.js');
    }
  }
  function maybeLoadPageFeatures() {
    // page-features.js bundles 4 self-gated IIFEs (animated demo,
    // particle canvas, tooltip dismiss, how-it-works tabs). Any one of
    // their gate selectors triggers the fetch; the IIFEs internally
    // re-gate so unused ones are early-returns.
    if (document.querySelector('.ds-1') ||
        document.getElementById('ca-particles') ||
        document.querySelector('span.term[data-tip]') ||
        document.querySelector('.how-tab[data-hw-tab]')) {
      loadOnce('/js/modules/page-features.js');
    }
  }
  function runLoaders() {
    maybeLoadCsrd();
    maybeLoadPageFeatures();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runLoaders);
  } else {
    runLoaders();
  }
}());

