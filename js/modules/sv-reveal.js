/* sv-reveal.js (2026-05-29 — Claude, LM-031; hardened 2026-06-15 — P0-001/P1-007/P2-008)
 * Sitewide section fade-up reveal on scroll. Per the PREMIUM MOTION DIRECTIVE,
 * every section on every page should breathe with intentional motion. This is
 * the lightweight IntersectionObserver implementation.
 *
 * Rules:
 *  - Adds `.sv-reveal` class to every `main > section` and `.ca-main-transformation > section`
 *    on DOMContentLoaded (CSS opacity:0 + translateY, scoped to html.js-sv-reveal).
 *  - On IntersectionObserver entry, adds `.sv-revealed` (CSS opacity:1 + translateY:0).
 *  - Already-in-viewport sections at load time are immediately revealed (no FOUC).
 *  - Respects prefers-reduced-motion (skips hidden state; sections stay full opacity).
 *  - Skips elements with `data-no-reveal` or `.no-reveal` class.
 *  - Skips when JS is disabled (CSS hidden state is scoped to `html.js-sv-reveal`).
 *
 * 2026-06-15 ROOT-CAUSE FIX (P0-001 whole-site blank-section bug):
 *  Sections were stuck at opacity:0 because the reveal pipeline had no failsafe and
 *  could miss targets (tall sections, fast scroll, late layout/fonts after the
 *  nav-inject-injected script ran). A section that is scrolled PAST without the
 *  observer firing stayed permanently invisible -> huge blank dark stretches.
 *  Hardening:
 *   1. A geometric scroll/resize/raf sweep reveals anything in or near the
 *      viewport the observer missed (belt to the observer's braces).
 *   2. A timed failsafe (post-load + interval cap) reveals ANY .sv-reveal still
 *      hidden so content can NEVER be permanently invisible, even if JS partially
 *      fails or the observer never fires.
 *   3. CSS carries a prefers-reduced-motion + .no-js fallback (opacity:1) so the
 *      hidden state only ever exists for JS-enabled, motion-OK users.
 */
(function () {
  'use strict';

  var REVEAL_MARGIN = 120; // px below the fold at which a section starts revealing

  // Honour reduced motion: never apply the hidden state at all.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  // Mark <html> as js-enabled so the CSS hidden state is scoped to JS + motion-OK.
  document.documentElement.classList.add('js-sv-reveal');

  var sections = [];

  function reveal(el) {
    if (!el || el.classList.contains('sv-revealed')) return;
    el.classList.add('sv-revealed');
  }

  function isVisibleArea(el) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  // Reveal anything whose top edge has reached REVEAL_MARGIN above the fold,
  // or that is already partly/fully on screen. Used by the sweep + observer-miss
  // catch. Geometric gate keeps a healthy entering-from-bottom fade untouched.
  function sweep() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < sections.length; i++) {
      var el = sections[i];
      if (el.classList.contains('sv-revealed')) continue;
      var r = el.getBoundingClientRect();
      if (r.height === 0) continue;
      if (r.top < vh - REVEAL_MARGIN && r.bottom > 0) reveal(el);
    }
  }

  // Last-resort failsafe: reveal EVERY still-hidden section regardless of
  // position. Guarantees content is never permanently invisible.
  function revealAll() {
    for (var i = 0; i < sections.length; i++) reveal(sections[i]);
  }

  function setupObserver() {
    if (!('IntersectionObserver' in window)) {
      revealAll();
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          reveal(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: '0px 0px -' + REVEAL_MARGIN + 'px 0px' });

    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      // Reveal immediately if already meaningfully in view at load (no flash).
      if (r.top < (window.innerHeight || 0) && r.bottom > 0) {
        reveal(s);
      } else {
        obs.observe(s);
      }
    });
  }

  function init() {
    var selector = 'main > section, .ca-main-transformation > section, body > section';
    var all = Array.prototype.slice.call(document.querySelectorAll(selector));
    if (!all.length) return;

    // Filter: skip explicit opt-outs + hero/announce/nav (already at-fold critical).
    sections = all.filter(function (s) {
      if (s.hasAttribute('data-no-reveal') || s.classList.contains('no-reveal')) return false;
      if (s.id === 'announce-bar' || s.classList.contains('announce-bar')) return false;
      // Hero sections: keep visible immediately (critical fold). Hero animates on
      // mount via its own CSS/JS, never via this scroll observer.
      if (s.classList.contains('ca-hero') || s.classList.contains('sec-hero') ||
          s.classList.contains('hero') || s.matches('[data-hero-scale]')) return false;
      if (!isVisibleArea(s)) return false; // display:none / 0-size -> nothing to animate
      return true;
    });

    if (!sections.length) return;

    sections.forEach(function (s) { s.classList.add('sv-reveal'); });

    setupObserver();
    sweep();

    // ── Belt-and-suspenders so a section can NEVER stay permanently invisible ──
    // 1) Throttled geometric sweep on scroll/resize catches observer misses
    //    (tall sections, fast scroll, layout shift after fonts/images load).
    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { sweep(); ticking = false; });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    // 2) Re-sweep as late layout settles (fonts, lazy images, injected chrome).
    [200, 600, 1200, 2500].forEach(function (t) { setTimeout(sweep, t); });
    window.addEventListener('load', sweep);

    // 3) Hard failsafe: if anything is STILL hidden a few seconds after load
    //    (observer never fired, JS partially failed), force-reveal everything.
    //    Content visibility is non-negotiable; the animation is the enhancement.
    function failsafe() { revealAll(); }
    if (document.readyState === 'complete') {
      setTimeout(failsafe, 4000);
    } else {
      window.addEventListener('load', function () { setTimeout(failsafe, 4000); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
