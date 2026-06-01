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
    /* A11Y-007 (audit 2026-05-30 — Claude, WCAG 4.1.3): expose the carousel as a
       named region with carousel role-description so screen-reader users know
       it's a rotating gallery (slide changes already announce via the
       [data-pcar-live] aria-live region). Idempotent. */
    if (!root.getAttribute('role')) {
      root.setAttribute('role', 'region');
      root.setAttribute('aria-roledescription', 'carousel');
      if (!root.getAttribute('aria-label')) root.setAttribute('aria-label', 'Product screenshots');
    }
    var captionEl = root.querySelector('.pcar__caption');
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.pcar__tab'));
    /* LM-147 (2026-05-29 — Claude, a11y critical): the dot buttons set `aria-selected`,
       which axe flags as not-allowed on a plain <button> (aria-allowed-attr). Promote them
       to the WAI-ARIA tab pattern — role="tab" inside a role="tablist" — so aria-selected
       is valid. Idempotent; no CSS change (the [aria-selected] styling still applies). */
    if (tabs.length) {
      var tablistEl = tabs[0].parentElement;
      if (tablistEl && tablistEl.getAttribute('role') !== 'tablist') {
        tablistEl.setAttribute('role', 'tablist');
        tablistEl.setAttribute('aria-label', 'Carousel slides');
      }
      tabs.forEach(function (t) { t.setAttribute('role', 'tab'); });
    }
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

    /* TOUCH-SWIPE (2026-06-01 top-1% upgrade): drag/swipe between slides on
       touch + pointer devices. Threshold 40px so taps/scrolls aren't hijacked. */
    var viewport = root.querySelector('.pcar__viewport, .ca-viewport, [data-pcar-viewport]') || root;
    var swipeX = null;
    viewport.addEventListener('touchstart', function (e) { swipeX = e.touches[0].clientX; }, { passive: true });
    viewport.addEventListener('touchend', function (e) {
      if (swipeX === null) return;
      var dx = e.changedTouches[0].clientX - swipeX;
      if (Math.abs(dx) > 40) { progress = 0; show(idx + (dx < 0 ? 1 : -1), true); }
      swipeX = null;
    }, { passive: true });

    /* KEYBOARD (2026-06-01): Left/Right arrows move between slides when focus is
       anywhere within the carousel (tabs are role=tab/focusable). Moves focus to
       the now-active tab so SR users track position. */
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        progress = 0;
        show(idx + (e.key === 'ArrowRight' ? 1 : -1), true);
        if (tabs[idx]) tabs[idx].focus();
      }
    });

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
    /* LM-147 (2026-05-29 — Claude): GLOBAL a11y pass. initOne bails on carousels with
       <2 slides, so a lone `.pcar__tab` with a hardcoded `aria-selected` (e.g. crowmark)
       never gets role="tab" and trips aria-allowed-attr. Promote EVERY .pcar__tab to the
       tab pattern regardless of slide count. Idempotent. */
    Array.prototype.slice.call(document.querySelectorAll('.pcar__tab')).forEach(function (t) {
      if (t.getAttribute('role') !== 'tab') t.setAttribute('role', 'tab');
      var p = t.parentElement;
      if (p && p.getAttribute('role') !== 'tablist') {
        p.setAttribute('role', 'tablist');
        if (!p.getAttribute('aria-label')) p.setAttribute('aria-label', 'Carousel slides');
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
