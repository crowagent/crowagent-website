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
    var progress = 0;
    var lastTime = null;
    var rafId = null;
    var paused = false;
    var CIRCUMFERENCE = 81.68; // 2 * PI * 13

    function injectRings() {
      tabs.forEach(function (t) {
        t.innerHTML = '<svg class="pcar__ring" width="28" height="28" viewBox="0 0 28 28">' +
          '<circle class="pcar__ring-bg" cx="14" cy="14" r="13" fill="none" stroke-width="1.5" />' +
          '<circle class="pcar__ring-progress" cx="14" cy="14" r="13" fill="none" stroke-width="1.5" ' +
          'stroke-dasharray="' + CIRCUMFERENCE + '" stroke-dashoffset="' + CIRCUMFERENCE + '" ' +
          'transform="rotate(-90 14 14)" />' +
          '</svg>';
      });
    }

    function updateRings() {
      tabs.forEach(function (t, i) {
        var ring = t.querySelector('.pcar__ring-progress');
        if (!ring) return;
        if (i === idx) {
          var offset = CIRCUMFERENCE * (1 - progress / INTERVAL);
          ring.style.strokeDashoffset = offset;
        } else {
          ring.style.strokeDashoffset = CIRCUMFERENCE;
        }
      });
    }

    function show(n, announce) {
      idx = (n + slides.length) % slides.length;
      progress = 0; // Reset progress on manual/auto change
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx);
        s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
      tabs.forEach(function (t, i) { t.setAttribute('aria-selected', i === idx ? 'true' : 'false'); });
      updateRings();
      var cap = slides[idx].getAttribute('data-caption') || '';
      if (captionEl) captionEl.textContent = cap;
      if (announce && live) live.textContent = 'Slide ' + (idx + 1) + ' of ' + slides.length + '. ' + cap;
    }

    function next() { show(idx + 1, false); }

    function tick(timestamp) {
      if (!lastTime) lastTime = timestamp;
      var delta = timestamp - lastTime;
      lastTime = timestamp;

      if (!paused && !REDUCED) {
        progress += delta;
        if (progress >= INTERVAL) {
          progress = 0;
          next();
        }
        updateRings();
      }
      rafId = window.requestAnimationFrame(tick);
    }

    function start() {
      if (REDUCED || rafId) return;
      lastTime = null;
      rafId = window.requestAnimationFrame(tick);
    }

    function stop() {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    injectRings();
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { progress = 0; show(i, true); });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () { progress = 0; show(idx + 1, true); });
    if (prevBtn) prevBtn.addEventListener('click', function () { progress = 0; show(idx - 1, true); });

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
