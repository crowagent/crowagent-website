// SF21-P — Universal back-to-top widget (canonical, self-contained component).
// Appears after 600px scroll AND only at viewports wide enough for it to clear the
// content column (see the gutter rule in `update`), smooth-scrolls to the top on click.
// Loaded site-wide via nav-inject.js.
//
// This component OWNS both its appearance and its position so it is immune to
// the legacy scattered #back-to-top rules in styles.css (SF patch debt):
//   - Appearance: self-injects /Assets/css/back-to-top.css (loaded last → wins).
//   - Position + z-index: set inline (inline beats any stylesheet rule),
//     cookie-banner-aware (sits just above #ca-cookie when shown, drops to the
//     corner when dismissed). Respects prefers-reduced-motion.
(function () {
  'use strict';
  if (document.getElementById('back-to-top')) return; // idempotent

  // Single source of truth for appearance — inject once if not already present.
  if (!document.querySelector('link[href*="back-to-top.css"]')) {
    var ln = document.createElement('link');
    ln.rel = 'stylesheet';
    ln.href = '/Assets/css/back-to-top.css?v=2';
    document.head.appendChild(ln);
  }

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    var btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
    btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';

    // Position owned here (inline, !important) — deterministically beats the
    // legacy scattered #back-to-top rules, several of which use !important.
    btn.style.setProperty('position', 'fixed', 'important');
    btn.style.setProperty('left', '24px', 'important');
    btn.style.setProperty('right', 'auto', 'important');
    btn.style.setProperty('z-index', '90', 'important'); // --z-banner: above content, below cookie (--z-cookie)

    /* HIDDEN INLINE BEFORE IT IS EVER IN THE DOCUMENT (2026-07-31).
       `styles.min.css` carries an unconditional `#back-to-top{color:var(--teal);display:flex}`
       and the rule that hides it lives in back-to-top.css, which THIS MODULE INJECTS — so on a
       cold cache there is a window where the button exists, the hiding stylesheet has not
       arrived, and the FAB flashes at the top of the page where it has nothing to do.
       This was nearly misread as a width-dependent bug: it measured display:flex at scrollY=0
       at 768 and 900 but display:none at 1100+, purely because those first two runs were the
       cold-cache ones and the rest were served from a warm cache. It is a race, not a
       breakpoint. An inline !important cannot lose to a stylesheet that has not loaded. */
    btn.style.setProperty('display', 'none', 'important');

    document.body.appendChild(btn);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var threshold = 600;
    var visible = false;

    // Cookie-banner-aware bottom offset: sit 16px above #ca-cookie when it is
    // visible at the viewport bottom; otherwise anchor 24px from the corner.
    function place() {
      var bottom = 24;
      var banner = document.getElementById('ca-cookie');
      if (banner) {
        var cs = window.getComputedStyle(banner);
        var r = banner.getBoundingClientRect();
        if (cs.display !== 'none' && cs.visibility !== 'hidden' && r.height > 0 &&
            r.bottom >= window.innerHeight - 2) {
          bottom = Math.ceil(r.height) + 16;
        }
      }
      btn.style.setProperty('bottom', bottom + 'px', 'important');
    }

    /* GUTTER RULE (2026-07-31). The FAB is fixed at left:24px and is 44px wide, so it
       occupies 24-68px. The content column is capped at --ca-max (80rem = 1280px), so it
       clears the content only when each gutter exceeds 68px plus a little air:
           1280 + 2 x (24 + 44 + 8) = 1432px
       Below that the FAB sits ON TOP of the content column, and it does not merely look
       untidy: measured with elementsFromPoint on the homepage, it covered the walkthrough
       step buttons "1 The question" and "2 Grounding" at 768px, and "3 Statutory sources"
       at 1100px. A fixed button with z-index 90 over a real control INTERCEPTS THE CLICK.
       This is the same defect the footer IntersectionObserver below already patches for the
       footer links, generalised: hide it wherever it cannot clear the content.
       Moving it is not an option — bottom-left is an owner directive (see LINK-001).
       The sticky header is present at every scroll position, so nothing is stranded. */
    function hasGutter() {
      return window.innerWidth >= 1440;
    }

    function update() {
      var shouldShow = window.scrollY > threshold && hasGutter();
      if (shouldShow !== visible) {
        visible = shouldShow;
        btn.classList.toggle('visible', visible);
        btn.style.setProperty('display', visible ? 'flex' : 'none', 'important');
        btn.setAttribute('aria-hidden', visible ? 'false' : 'true');
        btn.tabIndex = visible ? 0 : -1;
      }
      place();
    }

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () { update(); ticking = false; });
        ticking = true;
      }
    }, { passive: true });
    // `update`, not `place`: a resize can cross the gutter threshold, and repositioning a
    // button that should no longer be shown at all would leave it covering content.
    window.addEventListener('resize', update, { passive: true });

    // Reposition when the cookie banner is added/removed or body state toggles.
    try {
      var mo = new MutationObserver(place);
      mo.observe(document.body, { childList: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) { /* MutationObserver unsupported — scroll/resize still cover it */ }

    /* LINK-001 (Chrome audit 2026-05-30 — Claude): this FAB sits bottom-LEFT
       (owner directive). When the user reaches the
       footer it overlapped the "Cookie preferences" / copyright links. Fade it
       out while the footer is in view so it never obscures footer content. The
       footer is injected in nav-inject Phase B, so set up on ca-footer-ready if
       it isn't in the DOM yet. */
    function setupFooterHide() {
      var footer = document.querySelector('.ca-footer');
      if (!footer || typeof IntersectionObserver !== 'function') return false;
      try {
        new IntersectionObserver(function (entries) {
          var inView = entries[0].isIntersecting;
          btn.style.setProperty('opacity', inView ? '0' : '', inView ? 'important' : '');
          btn.style.setProperty('pointer-events', inView ? 'none' : '', inView ? 'important' : '');
        }, { rootMargin: '0px 0px -8% 0px' }).observe(footer);
      } catch (e) { /* observer unsupported — overlap is cosmetic, never break */ }
      return true;
    }
    if (!setupFooterHide()) {
      document.addEventListener('ca-footer-ready', setupFooterHide, { once: true });
    }

    place();
    update();
  });
})();
