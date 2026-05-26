/* ============================================================
 * product-carousel-2026-05-26.js
 * Drives [data-pcar] carousels: crossfade auto-advance, dot tabs,
 * prev/next, pause on hover/focus, reduced-motion safe, accessible.
 * No deps. Idempotent (guards against double-init).
 * ============================================================ */
(function () {
  'use strict';
  if (window.__pcarInit) return;
  window.__pcarInit = true;

  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var INTERVAL = 5200;

  function initOne(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('.pcar__slide'));
    if (slides.length < 2) return;
    var captionEl = root.querySelector('.pcar__caption');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.pcar__tab'));
    var prevBtn = root.querySelector('[data-pcar-prev]');
    var nextBtn = root.querySelector('[data-pcar-next]');
    var live = root.querySelector('[data-pcar-live]');
    var idx = 0;
    var timer = null;
    var paused = false;

    function show(n, announce) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx);
        s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
      tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      var cap = slides[idx].getAttribute('data-caption') || '';
      if (captionEl) captionEl.textContent = cap;
      if (announce && live) live.textContent = 'Slide ' + (idx + 1) + ' of ' + slides.length + '. ' + cap;
    }

    function next() { show(idx + 1, false); }
    function start() {
      if (REDUCED || paused || timer) return;
      timer = window.setInterval(function () { if (!paused) next(); }, INTERVAL);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stop(); show(i, true); start(); });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () { stop(); show(idx + 1, true); start(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { stop(); show(idx - 1, true); start(); });

    // Pause on hover / focus within
    root.addEventListener('mouseenter', function () { paused = true; });
    root.addEventListener('mouseleave', function () { paused = false; });
    root.addEventListener('focusin', function () { paused = true; });
    root.addEventListener('focusout', function () { paused = false; });

    // Pause when off-screen (perf + relevance)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { paused = !e.isIntersecting; if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.25 }).observe(root);
    }

    show(0, false);
    start();
  }

  function boot() {
    Array.prototype.slice.call(document.querySelectorAll('[data-pcar]')).forEach(initOne);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
