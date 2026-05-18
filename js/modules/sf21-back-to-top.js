// SF21-P — Universal back-to-top widget.
// Injects a floating button that appears after 600px scroll, smooth-scrolls
// to the page top on click. Visible on every page (loaded site-wide via
// nav-inject.js script chain or page <script> include). Respects
// prefers-reduced-motion.
(function () {
  'use strict';
  if (document.getElementById('sf21-back-to-top')) return; // idempotent

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    var btn = document.createElement('button');
    btn.id = 'sf21-back-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('aria-hidden', 'true');
    btn.tabIndex = -1;
    btn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
      ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';

    document.body.appendChild(btn);

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var threshold = 600;
    var visible = false;

    function update() {
      var shouldShow = window.scrollY > threshold;
      if (shouldShow === visible) return;
      visible = shouldShow;
      btn.classList.toggle('is-visible', visible);
      btn.setAttribute('aria-hidden', visible ? 'false' : 'true');
      btn.tabIndex = visible ? 0 : -1;
    }

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: reduced ? 'auto' : 'smooth'
      });
    });

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          update();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    update();
  });
})();
