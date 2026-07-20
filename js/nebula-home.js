/* nebula-home.js - lightweight motion for Nebula pages (reveals + scroll progress).
   Magnetic buttons are handled by /js/modules/magnetic-pull.js.
   Header + footer are the live production components (nav-inject.js).
   Reveals have a hard failsafe so content is never left hidden. */
(function () {
  'use strict';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-progress bar (#nbProgress on the homepage, #scrollbar on concept pages)
  var bar = document.getElementById('nbProgress') || document.getElementById('scrollbar');
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h * 100) : 0) + '%';
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var reveals = [].slice.call(document.querySelectorAll('.nb-reveal, .reveal'));
  var revealAll = function () { reveals.forEach(function (el) { el.classList.add('in'); }); };

  if (reduce || !('IntersectionObserver' in window) || !reveals.length) {
    revealAll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  reveals.forEach(function (el) { io.observe(el); });

  // Failsafe: never leave content hidden if the observer does not fire
  // (e.g. background/hidden tab throttling). Unconditional timer + on reveal.
  setTimeout(revealAll, 1500);
  addEventListener('load', function () { setTimeout(revealAll, 300); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) revealAll(); });
})();
