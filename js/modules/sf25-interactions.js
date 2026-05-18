// SF25 — Misc interaction enhancements (audit follow-ups).
// - SF25-E: how-it-works tabs auto-advance every 4s, pause on hover, halt on user click.
// - SF25-F: mobile sticky CTA appears only after 600px scroll past hero (was always-on).
// All respects prefers-reduced-motion.
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  ready(function () {
    // ─── SF25-E: How-it-works auto-advance ────────────────────────────────
    (function howAutoAdvance() {
      if (reduced) return;
      var tabs = Array.from(document.querySelectorAll('.how-tab'));
      if (tabs.length < 2) return;
      var idx = 0;
      var timer = null;
      var paused = false;

      function next() {
        if (paused) return;
        idx = (idx + 1) % tabs.length;
        var t = tabs[idx];
        if (t && typeof t.click === 'function') t.click();
      }

      function start() { stop(); timer = setInterval(next, 5500); }
      function stop()  { if (timer) { clearInterval(timer); timer = null; } }

      var howSection = document.querySelector('.how');
      if (howSection) {
        howSection.addEventListener('mouseenter', function () { paused = true; });
        howSection.addEventListener('mouseleave', function () { paused = false; });
      }

      // Halt auto-advance permanently the first time the user clicks a tab
      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () {
          idx = i;
          // give user 30s after manual click then resume
          stop();
          setTimeout(function () { start(); }, 30000);
        });
      });

      // Start only when the section enters viewport
      if ('IntersectionObserver' in window && howSection) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { start(); io.unobserve(howSection); }
          });
        }, { threshold: 0.30 });
        io.observe(howSection);
      } else {
        start();
      }
    })();

    // ─── SF25-F: Mobile sticky CTA scroll trigger ─────────────────────────
    (function mobileStickyTrigger() {
      var cta = document.querySelector('.mobile-sticky-cta');
      if (!cta) return;
      // Default: hide until 600px scroll. Use a dedicated class for the trigger.
      cta.classList.add('is-scroll-armed');
      var visible = false;
      function update() {
        var should = window.scrollY > 600;
        if (should === visible) return;
        visible = should;
        cta.classList.toggle('is-visible', visible);
      }
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(function () { update(); ticking = false; });
          ticking = true;
        }
      }, { passive: true });
      update();
    })();

    // ─── SF25-D: Skeleton class application on MEES result panel + blog ──
    (function injectSkeletonStates() {
      var demoResult = document.getElementById('demo-result');
      var demoLoading = document.getElementById('demo-loading');
      if (demoLoading && !demoLoading.classList.contains('sf18-skeleton')) {
        demoLoading.classList.add('sf25-mees-skeleton');
        // Replace the "Checking EPC register…" text with a 2-line shimmer
        // when the loading element becomes visible. We don't intercept the
        // existing loader; just style it with sf25 skeleton bars.
      }
    })();
  });
})();
