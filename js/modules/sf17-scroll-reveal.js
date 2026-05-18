// SF17 — Vanilla scroll-reveal observer.
// Wires every .sf17-reveal element to animate in once on viewport entry.
// Stagger child cards by adding --reveal-index: N to each card.
// Respects prefers-reduced-motion: reduce.
(function () {
  'use strict';
  if (typeof IntersectionObserver === 'undefined') return;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go() {
    var els = document.querySelectorAll('.sf17-reveal');
    if (!els.length) return;
    if (reduced) {
      els.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState !== 'loading') go();
  else document.addEventListener('DOMContentLoaded', go, { once: true });
})();
