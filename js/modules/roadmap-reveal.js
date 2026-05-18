/* Roadmap milestone reveal on scroll.
   Respects prefers-reduced-motion. Externalised from roadmap.html for CSP. */
(function () {
  'use strict';
  var nodes = document.querySelectorAll('.roadmap-milestone');
  if (!nodes.length) return;
  var prm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prm || !('IntersectionObserver' in window)) {
    nodes.forEach(function (n) { n.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  nodes.forEach(function (n) { io.observe(n); });
})();
