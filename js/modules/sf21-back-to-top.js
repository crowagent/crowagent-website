// SF21-P — Universal back-to-top widget (canonical, self-contained component).
// Appears after 600px scroll, smooth-scrolls to the top on click. Loaded
// site-wide via nav-inject.js.
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

    function update() {
      var shouldShow = window.scrollY > threshold;
      if (shouldShow !== visible) {
        visible = shouldShow;
        btn.classList.toggle('visible', visible);
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
    window.addEventListener('resize', place, { passive: true });

    // Reposition when the cookie banner is added/removed or body state toggles.
    try {
      var mo = new MutationObserver(place);
      mo.observe(document.body, { childList: true, attributes: true, attributeFilter: ['class'] });
    } catch (e) { /* MutationObserver unsupported — scroll/resize still cover it */ }

    place();
    update();
  });
})();
