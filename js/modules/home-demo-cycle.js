/**
 * home-demo-cycle.js — SF46 batch #2 2026-05-20
 *
 * Founder directive: build a 4-scene SVG cycle on the home hero-demo-block,
 * 7s per scene = 28s loop, as an authentic substitute until an AI-generated
 * 20-30s product video is dropped in. Re-uses the existing how-step-*.svg
 * vignettes already rendered on product pages.
 *
 * Behaviour:
 *  - Auto-rotates every 7s (configurable via SCENE_MS).
 *  - Pauses on pointerenter / focusin / dot-click. Resumes on leave.
 *  - Pauses when document.hidden (Page Visibility API).
 *  - Respects prefers-reduced-motion: reduce → no auto-rotation, scene 1 stays.
 *  - Dots are real tabs (role=tab, aria-selected) — click jumps to scene.
 *  - Caption updates with scene number + label (aria-live polite).
 *  - Gated by IntersectionObserver so it only runs when on-screen.
 */
(function () {
  'use strict';

  var SCENE_MS = 7000;
  var LABELS = [
    'Upload your portfolio',
    'Cross-check frameworks',
    'Draft compliance reports',
    'Ship to every stakeholder',
  ];

  function init() {
    var root = document.getElementById('home-demo-cycle');
    if (!root) return;
    var scenes = root.querySelectorAll('.home-demo-cycle__scene');
    var dots = root.querySelectorAll('.home-demo-cycle__dot');
    var numEl = root.querySelector('.home-demo-cycle__num');
    var labelEl = root.querySelector('.home-demo-cycle__label');
    if (!scenes.length || !dots.length) return;

    var rmm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    var current = 0;
    var timer = null;
    var paused = false;

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function show(index) {
      current = ((index % scenes.length) + scenes.length) % scenes.length;
      scenes.forEach(function (el, i) { el.classList.toggle('is-active', i === current); });
      dots.forEach(function (el, i) {
        el.classList.toggle('is-active', i === current);
        el.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
      if (numEl) numEl.textContent = pad(current + 1);
      if (labelEl) labelEl.textContent = LABELS[current] || '';
    }

    function step() { if (!paused) show(current + 1); }
    function start() {
      if (rmm && rmm.matches) return;
      if (timer) return;
      timer = window.setInterval(step, SCENE_MS);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    root.addEventListener('pointerenter', function () { paused = true; });
    root.addEventListener('pointerleave', function () { paused = false; });
    root.addEventListener('focusin',     function () { paused = true; });
    root.addEventListener('focusout',    function () { paused = false; });

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        var target = parseInt(d.getAttribute('data-scene-target'), 10) - 1;
        if (!Number.isNaN(target)) {
          show(target);
          // Brief pause after manual interaction so the user can read the scene
          paused = true;
          window.setTimeout(function () { paused = false; }, SCENE_MS / 2);
        }
      });
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    if (rmm && typeof rmm.addEventListener === 'function') {
      rmm.addEventListener('change', function (e) {
        if (e.matches) stop(); else start();
      });
    }

    // Initial show + IntersectionObserver gate
    show(0);
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) start(); else stop(); });
      }, { threshold: 0.2 });
      io.observe(root);
    } else {
      start();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
