/* hero-staggered-entrance.js — homepage hero entrance animation.
   Audit fix 2026-05-17 (JS-runtime agent): the timeline targeted
   .hero-eyebrow / .hero-trust / .hero-visual unconditionally. Product
   pages (crowagent-core, crowmark, crowcyber, crowcash, crowesg, csrd)
   load this module via cinematic asset bundle but use a different hero
   layout, so each call surfaced as `GSAP target X not found` (9 warns ×
   6 pages = 54 noise warns in CONSOLE-ERRORS audit). Now we only run
   when .hero-eyebrow OR .hero h1 actually exists, and each fromTo is
   gated on the element being present. Silent no-op otherwise. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof window.gsap === 'undefined') return;

  // Targets we may animate. Map selector -> from/to args.
  var STEPS = [
    { sel: '.hero-eyebrow', from: { y: 20, opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, offset: null },
    { sel: '.hero h1',      from: { y: 30, opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, offset: '-=0.6' },
    { sel: '.hero-sub',     from: { y: 20, opacity: 0 }, to: { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, offset: '-=0.5' },
    { sel: '.hero-btns',    from: { y: 15, opacity: 0, scale: 0.96 }, to: { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.2, 0.5)' }, offset: '-=0.4' },
    { sel: '.hero-trust',   from: { opacity: 0, y: 10 }, to: { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, offset: '-=0.3' },
    { sel: '.hero-visual',  from: { y: 40, opacity: 0 }, to: { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, offset: '-=0.4' }
  ];

  // Filter to only steps whose target exists on this page.
  var present = STEPS.filter(function (s) { return document.querySelector(s.sel); });
  if (!present.length) return; // not the homepage / no hero markup — silent no-op

  var rmm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  if (rmm && rmm.matches) {
    // Reduced motion: snap visible.
    try { gsap.set(present.map(function (s) { return s.sel; }), { opacity: 1, y: 0, scale: 1 }); } catch (_) {}
    return;
  }

  try {
    var tl = gsap.timeline({ delay: 0.1 });
    present.forEach(function (s, i) {
      // First call should not have an offset (would shift start time of the entire timeline).
      if (i === 0 || !s.offset) {
        tl.fromTo(s.sel, s.from, s.to);
      } else {
        tl.fromTo(s.sel, s.from, s.to, s.offset);
      }
    });
  } catch (_) { /* GSAP failure — never break the page */ }
})();
