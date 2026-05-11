/* H1-HERO-PERF 10-10 (2026-05-10)
 * hero-staggered-entrance.js — IntersectionObserver-driven hero reveal.
 *
 * Adds the .is-revealed class to .hero h1, .hero .hero-sub, .hero .hero-btns,
 * and .hero-trust on enter, with stagger delays of 0/200/400/600ms. Coexists
 * with the persona-switcher h1 swap (out of scope here): we observe the
 * <h1> element itself, not its <span class="seg-text"> children, so the swap
 * never re-triggers a hide.
 *
 * Reduced-motion: CSS resets opacity/transform; this script still adds the
 * class so any consumer can read state.
 */
(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  var SELECTOR = '.hero h1, .hero .hero-sub, .hero .hero-btns, .hero-trust';
  var DELAYS_MS = [0, 200, 400, 600];

  function reveal(el, idx) {
    var d = DELAYS_MS[Math.min(idx, DELAYS_MS.length - 1)];
    if (d <= 0) {
      el.classList.add('is-revealed');
    } else {
      window.setTimeout(function () { el.classList.add('is-revealed'); }, d);
    }
  }

  function init() {
    var nodes = document.querySelectorAll(SELECTOR);
    if (!nodes.length) return;

    // Group siblings within the SAME .hero so each hero stages independently.
    // (Most pages have one hero, but tools/products may add more later.)
    if (!('IntersectionObserver' in window)) {
      // No IO support → reveal immediately.
      Array.prototype.forEach.call(nodes, function (n, i) { reveal(n, i); });
      return;
    }

    // Map element → its position within its hero scope (0..3) so the stagger
    // index follows DOM order regardless of which selector matched first.
    var positions = new WeakMap();
    var heroes = new Set();
    Array.prototype.forEach.call(nodes, function (n) {
      var hero = n.closest('.hero') || n.parentElement;
      heroes.add(hero);
    });
    heroes.forEach(function (h) {
      var local = h.querySelectorAll(SELECTOR);
      Array.prototype.forEach.call(local, function (el, i) { positions.set(el, i); });
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var i = positions.get(el) || 0;
        reveal(el, i);
        io.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

    Array.prototype.forEach.call(nodes, function (n) { io.observe(n); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
