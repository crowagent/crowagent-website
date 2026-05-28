/* sv-reveal.js (2026-05-29 — Claude, LM-031)
 * Sitewide section fade-up reveal on scroll. Per the PREMIUM MOTION DIRECTIVE,
 * every section on every page should breathe with intentional motion. This is
 * the lightweight IntersectionObserver implementation.
 *
 * Rules:
 *  - Adds `.sv-reveal` class to every `main > section` and `.ca-main-transformation > section`
 *    on DOMContentLoaded (CSS opacity:0 + translateY).
 *  - On IntersectionObserver entry, adds `.sv-revealed` (CSS opacity:1 + translateY:0).
 *  - Already-in-viewport sections at load time are immediately revealed (no FOUC).
 *  - Respects prefers-reduced-motion (skips entirely; sections stay full opacity).
 *  - Skips elements with `data-no-reveal` or `.no-reveal` class.
 *  - Skips when JS is disabled (CSS has `.no-js` fallback handled via `<html class="js">`).
 */
(function () {
  // Honour reduced motion: do nothing.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  // Mark <html> as js-enabled so CSS can scope the hidden initial state to JS-enabled.
  document.documentElement.classList.add('js-sv-reveal');

  function reveal(el) {
    el.classList.add('sv-revealed');
  }

  function init() {
    var selector = 'main > section, .ca-main-transformation > section, body > section';
    var sections = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!sections.length) return;

    // Filter: skip explicit opt-outs + hero/announce/nav (already at-fold critical).
    sections = sections.filter(function (s) {
      if (s.hasAttribute('data-no-reveal') || s.classList.contains('no-reveal')) return false;
      if (s.id === 'announce-bar' || s.classList.contains('announce-bar')) return false;
      // Hero sections: keep visible immediately (critical fold).
      if (s.classList.contains('ca-hero') || s.classList.contains('sec-hero') ||
          s.classList.contains('hero') || s.matches('[data-hero-scale]')) return false;
      return true;
    });

    sections.forEach(function (s) { s.classList.add('sv-reveal'); });

    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all immediately.
      sections.forEach(reveal);
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          reveal(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

    // Reveal anything already in initial viewport immediately (no flash).
    var vpH = window.innerHeight;
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top < vpH && r.bottom > 0) {
        reveal(s);
      } else {
        obs.observe(s);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
