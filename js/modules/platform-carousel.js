// ── PLATFORM CAROUSEL — WP-WEB-003 ──
// Self-contained module extracted from scripts.js (WS-AUDIT-043).
// Self-attaches via DOMContentLoaded; exits early if no .pc-screen nodes present.
// Respects prefers-reduced-motion. Clears interval on pagehide (DEF-043).
(function() {
  function init() {
    var screens = document.querySelectorAll('.pc-screen');
    var dots = document.querySelectorAll('button.pc-dot');
    var current = 0;
    var timer;
    if (!screens.length) return;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.pcSwitch = function(idx) {
      screens[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = idx;
      screens[current].classList.add('active');
      dots[current].classList.add('active');
      clearInterval(timer);
      if (!prefersReducedMotion) {
        timer = setInterval(function() {
          window.pcSwitch((current + 1) % screens.length);
        }, 4000);
      }
    };
    if (!prefersReducedMotion) {
      timer = setInterval(function() {
        window.pcSwitch((current + 1) % screens.length);
      }, 4000);
    }
    // Clear carousel interval on pagehide to prevent leaks (DEF-043)
    window.addEventListener('pagehide', function() {
      if (timer) { clearInterval(timer); timer = null; }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
