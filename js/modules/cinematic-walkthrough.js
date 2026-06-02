/* ═══════════════════════════════════════════════════════════════════════
   cinematic-walkthrough.js  —  Tier-1 GSAP pan-and-zoom hero animation
   AF.5 (2026-05-20)

   Replaces the static SVG scene cycle with a high-production pan-and-zoom
   sequence across 5 framed product screenshots. Each scene gets:
     - 5.5s on screen
     - 1.2s cross-fade between scenes
     - subtle Ken Burns zoom (scale 1.00 → 1.06) + pan (translate -1% → +1%)
     - reduced-motion users see scene #1 statically, no animation

   Pure CSS+JS — no video element, no buffering, no LCP delay. The first
   image is set to fetchpriority="high" via the hero LCP preload.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function init() {
    var stage = document.getElementById('cinematic-walkthrough');
    if (!stage) return;
    var scenes = stage.querySelectorAll('.cinematic-scene');
    if (!scenes.length) return;

    // Reduced-motion users: lock to scene 1 and exit.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scenes[0].classList.add('is-active');
      stage.dataset.cinematicMode = 'static';
      return;
    }

    // GSAP-driven timeline. Falls back to instant scene swap if GSAP missing.
    var gsap = window.gsap;
    if (!gsap) {
      // Bare CSS fallback: simple opacity cycle on a setInterval.
      var i = 0;
      setInterval(function () {
        scenes.forEach(function (s) { s.classList.remove('is-active'); });
        scenes[i].classList.add('is-active');
        i = (i + 1) % scenes.length;
      }, 5500);
      stage.dataset.cinematicMode = 'css-fallback';
      return;
    }

    stage.dataset.cinematicMode = 'gsap';

    // Ken Burns parameters — slight, never showy.
    var SCENE_DURATION = 5.5;
    var FADE = 1.2;
    var ZOOM_FROM = 1.0;
    var ZOOM_TO = 1.06;
    var PAN_X = ['-1%', '1%', '-0.5%', '0.5%', '0%'];
    var PAN_Y = ['0%',  '0.5%', '-0.5%', '0.5%', '-0.5%'];

    // Initial state — scene 1 visible, others hidden.
    scenes.forEach(function (s, idx) {
      gsap.set(s, {
        opacity: idx === 0 ? 1 : 0,
        scale: ZOOM_FROM,
        xPercent: 0,
        yPercent: 0,
        transformOrigin: '50% 50%',
        zIndex: idx === 0 ? 2 : 1,
      });
      if (idx === 0) s.classList.add('is-active');
    });

    var tl = gsap.timeline({ repeat: -1, defaults: { ease: 'power2.inOut' } });

    scenes.forEach(function (scene, idx) {
      var next = scenes[(idx + 1) % scenes.length];
      var nextIdx = (idx + 1) % scenes.length;

      // Phase 1: Ken Burns pan-and-zoom on the current scene
      tl.to(scene, {
        scale: ZOOM_TO,
        xPercent: parseFloat(PAN_X[idx]),
        yPercent: parseFloat(PAN_Y[idx]),
        duration: SCENE_DURATION,
        ease: 'sine.inOut',
      }, '+=0');

      // Phase 2: cross-fade to next scene
      tl.to(scene, {
        opacity: 0,
        duration: FADE,
        ease: 'power2.out',
        onComplete: function () { scene.classList.remove('is-active'); },
      }, '-=' + FADE);

      tl.to(next, {
        opacity: 1,
        duration: FADE,
        ease: 'power2.in',
        onStart: function () {
          next.classList.add('is-active');
          // Reset transform on the incoming scene so its Ken Burns starts fresh.
          gsap.set(next, { scale: ZOOM_FROM, xPercent: 0, yPercent: 0 });
        },
      }, '<');
    });

    // Pause when offscreen (perf + courtesy).
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) tl.play();
          else tl.pause();
        });
      }, { threshold: 0.15 });
      io.observe(stage);
    }

    // Public handle for the truth audit
    window.SovereignCinematic = { timeline: tl, scenes: scenes, mode: 'gsap' };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
