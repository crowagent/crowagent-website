// ── CASE-STUDY ROTATOR — single-line testimonial rotator (P-05, M5) ──
// Mirrors the WAI-APG carousel-tablist pattern from js/modules/carousel.js
// at a much smaller surface area: 3 slides, 1 row of dots, no prev/next,
// no swipe. Auto-advances every 8s by default and pauses on hover, focus,
// IntersectionObserver-not-visible, prefers-reduced-motion, and pagehide.
//
// Markup contract:
//   <section class="case-study-rotator"
//            aria-label="Illustrative scenarios"
//            data-rotator-autoplay="true"
//            data-rotator-interval="8000">
//     <div class="case-study-rotator-inner" aria-live="polite">
//       <div class="case-study-rotator-slide is-active" data-rotator-slide="0" ...>...</div>
//       <div class="case-study-rotator-slide"          data-rotator-slide="1" ...>...</div>
//       <div class="case-study-rotator-slide"          data-rotator-slide="2" ...>...</div>
//     </div>
//     <ul class="case-study-rotator-dots" role="tablist">
//       <li><button role="tab" aria-selected="true"  data-rotator-dot="0">...</button></li>
//       <li><button role="tab" aria-selected="false" data-rotator-dot="1">...</button></li>
//       <li><button role="tab" aria-selected="false" data-rotator-dot="2">...</button></li>
//     </ul>
//   </section>
//
// Memory hygiene: clearInterval + IntersectionObserver disconnect on pagehide.
// Mirrors DEF-043 hygiene from the carousel module.

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-rotator-slide]'));
    var dots   = Array.prototype.slice.call(root.querySelectorAll('[data-rotator-dot]'));
    if (slides.length < 2) return;

    var autoplay = root.getAttribute('data-rotator-autoplay') !== 'false';
    var interval = parseInt(root.getAttribute('data-rotator-interval'), 10) || 8000;
    var current = 0;
    var timer = null;
    var paused = false;
    var observer = null;
    var visible = true;

    function go(idx) {
      if (idx < 0) idx = slides.length - 1;
      if (idx >= slides.length) idx = 0;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-active', i === idx);
        s.setAttribute('aria-hidden', i === idx ? 'false' : 'true');
      });
      dots.forEach(function (d, i) {
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
        d.setAttribute('tabindex', i === idx ? '0' : '-1');
      });
      current = idx;
    }

    function clearTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    function play() {
      if (!autoplay || paused || prefersReducedMotion || !visible) return;
      clearTimer();
      timer = setInterval(function () { go(current + 1); }, interval);
    }

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { go(i); play(); });
      d.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(current + 1); dots[current].focus(); play(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); dots[current].focus(); play(); }
        else if (e.key === 'Home') { e.preventDefault(); go(0); dots[0].focus(); play(); }
        else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); dots[slides.length - 1].focus(); play(); }
      });
    });

    // Auto-pause on hover / focus
    root.addEventListener('mouseenter', clearTimer);
    root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', clearTimer);
    root.addEventListener('focusout', function (e) {
      if (!root.contains(e.relatedTarget)) play();
    });

    // Pause off-screen (battery save)
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visible = entry.isIntersecting;
          if (visible) play(); else clearTimer();
        });
      }, { threshold: 0.1 });
      observer.observe(root);
    }

    function teardown() {
      clearTimer();
      if (observer) { observer.disconnect(); observer = null; }
    }
    window.addEventListener('pagehide', teardown);

    // Initial state
    go(0);
    play();
  }

  function boot() {
    Array.prototype.slice.call(document.querySelectorAll('.case-study-rotator')).forEach(init);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
