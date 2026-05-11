// ── PLATFORM CAROUSEL — WP-WEB-003 / E-CAROUSEL-STRIPE 10-10 ──
// Self-contained module extracted from scripts.js (WS-AUDIT-043).
// Self-attaches via DOMContentLoaded; exits early if no .pc-screen nodes present.
// Respects prefers-reduced-motion. Clears interval on pagehide (DEF-043).
//
// E-CAROUSEL-STRIPE upgrade (2026-05-10):
//   - Autoplay interval bumped from 4 s → 6.5 s to match Stripe-pattern
//     pacing used across .crow-carousel instances.
//   - Pause on hover / focus-within for parity with the new carousel UX.
//   - User interaction (dot click) restarts the timer (Stripe behaviour).
(function () {
  function init() {
    var screens = document.querySelectorAll('.pc-screen');
    var dots = document.querySelectorAll('button.pc-dot');
    if (!screens.length) return;

    var current = 0;
    var timer = null;
    var hoverPaused = false;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var INTERVAL_MS = 6500; // Stripe-pattern pacing

    function scheduleNext() {
      if (prefersReducedMotion || hoverPaused) return;
      clearTimer();
      timer = setInterval(function () {
        window.pcSwitch((current + 1) % screens.length);
      }, INTERVAL_MS);
    }

    function clearTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    window.pcSwitch = function (idx) {
      screens[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = idx;
      screens[current].classList.add('active');
      dots[current].classList.add('active');
      // Reset autoplay on user interaction (Stripe pattern)
      scheduleNext();
    };

    // Hover / focus-within pause
    var host = screens[0].closest('.platform-carousel') || screens[0].parentElement;
    if (host) {
      host.addEventListener('mouseenter', function () { hoverPaused = true; clearTimer(); });
      host.addEventListener('mouseleave', function () { hoverPaused = false; scheduleNext(); });
      host.addEventListener('focusin', function () { hoverPaused = true; clearTimer(); });
      host.addEventListener('focusout', function (e) {
        if (!host.contains(e.relatedTarget)) {
          hoverPaused = false; scheduleNext();
        }
      });
    }

    scheduleNext();

    // Clear carousel interval on pagehide to prevent leaks (DEF-043)
    window.addEventListener('pagehide', function () { clearTimer(); });

    // A45-PLUS-2 audit 2026-05-11: also clear on tab-hidden so the carousel
    // doesn't burn CPU in a background tab. Resume on tab-visible.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        clearTimer();
      } else if (document.visibilityState === 'visible' && !hoverPaused) {
        scheduleNext();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
