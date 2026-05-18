/* ============================================================
   motion-system.js — Stripe-grade motion engine for CrowAgent.
   Source: audit-results/STRIPE-MOTION-SYSTEM-SPEC-2026-05-17.md
   Date:   2026-05-17

   Engine:
     1. Single IntersectionObserver for `.ms-reveal` (one-shot, batched)
     2. Soft parallax on `.ms-parallax-soft` (transform-only, rAF-throttled)
     3. Looping demo: IntersectionObserver pause/resume for `.ms-demo video`
     4. Sticky-pin scene-step driver for `[data-ms-scene] .ms-scene-step`
     5. Reduced-motion bail-out (instant-visible reveals, no scroll motion)
     6. MutationObserver rescan for late-injected content (nav-inject, modules)

   Public API:
     window.caMotion = { rescan() }       // call after dynamic DOM injection
   ============================================================ */
(function () {
  'use strict';

  // Old browsers: do nothing. Reveals stay invisible until the
  // reduced-motion-style "make visible" fallback below runs.
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  var IOSupported   = ('IntersectionObserver' in window);
  var prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Reduced motion / no IO fallback: snap everything to visible ─────
  function snapAllVisible() {
    var els = document.querySelectorAll('.ms-reveal');
    for (var i = 0; i < els.length; i++) els[i].classList.add('ms-in');
  }

  if (!IOSupported) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', snapAllVisible, { once: true });
    } else {
      snapAllVisible();
    }
    window.caMotion = { rescan: snapAllVisible };
    return;
  }

  if (prefersReduce) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', snapAllVisible, { once: true });
    } else {
      snapAllVisible();
    }
    // Still expose rescan so dynamic injections also become visible.
    window.caMotion = { rescan: snapAllVisible };
    return;
  }

  // ─── 1. Fade-in on scroll (one shared observer, one-shot) ──────────
  var revealObs = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      if (e.isIntersecting) {
        e.target.classList.add('ms-in');
        revealObs.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  function attachReveal() {
    var els = document.querySelectorAll('.ms-reveal:not(.ms-in)');
    for (var i = 0; i < els.length; i++) revealObs.observe(els[i]);
  }

  // ─── 2. Soft parallax (transform-only, one rAF loop) ───────────────
  var parallaxEls = [];

  function rebuildParallax() {
    parallaxEls.length = 0;
    var els = document.querySelectorAll('.ms-parallax-soft');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var dsFactor = el.dataset.parallax;
      var styleFactor = el.style.getPropertyValue('--ms-parallax-factor');
      var factor = parseFloat(dsFactor || styleFactor || '0.15');
      if (!isFinite(factor)) factor = 0.15;
      parallaxEls.push({
        el: el,
        factor: factor,
        offsetTop: el.getBoundingClientRect().top + window.scrollY
      });
    }
  }

  var parallaxTicking = false;
  function parallaxTick() {
    parallaxTicking = false;
    var scrollY = window.scrollY;
    var viewportH = window.innerHeight;
    for (var i = 0; i < parallaxEls.length; i++) {
      var item = parallaxEls[i];
      // Offset relative to the element's first appearance in viewport
      // so y starts near 0 as the element enters the screen.
      var dy = (scrollY - (item.offsetTop - viewportH)) * item.factor;
      item.el.style.setProperty('--ms-y', dy.toFixed(1) + 'px');
    }
  }

  function onScroll() {
    if (parallaxTicking) return;
    parallaxTicking = true;
    requestAnimationFrame(parallaxTick);
  }

  // ─── 3. Looping demo: pause when off-screen (battery + GPU) ────────
  var demoObs = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var v = e.target;
      if (e.isIntersecting) {
        if (typeof v.play === 'function') {
          var p = v.play();
          if (p && typeof p.catch === 'function') p.catch(function () { /* autoplay blocked, no-op */ });
        }
      } else {
        if (typeof v.pause === 'function') v.pause();
      }
    }
  }, { threshold: 0.2 });

  // Track which videos we've already wired so rescans don't double-observe.
  var demoSeen = new WeakSet ? new WeakSet() : null;

  function attachDemos() {
    var vids = document.querySelectorAll('.ms-demo video');
    for (var i = 0; i < vids.length; i++) {
      var v = vids[i];
      if (demoSeen) {
        if (demoSeen.has(v)) continue;
        demoSeen.add(v);
      }
      demoObs.observe(v);
    }
  }

  // ─── 4. Sticky-pin scene-step driver ───────────────────────────────
  var sceneSeen = new WeakSet ? new WeakSet() : null;

  function attachScenes() {
    var scenes = document.querySelectorAll('[data-ms-scene]');
    for (var i = 0; i < scenes.length; i++) {
      var scene = scenes[i];
      if (sceneSeen) {
        if (sceneSeen.has(scene)) continue;
        sceneSeen.add(scene);
      }
      (function (sceneEl) {
        var steps = sceneEl.querySelectorAll('.ms-scene-step');
        if (!steps.length) return;
        var stepObs = new IntersectionObserver(function (entries) {
          for (var j = 0; j < entries.length; j++) {
            var e = entries[j];
            if (e.isIntersecting) {
              for (var k = 0; k < steps.length; k++) steps[k].classList.remove('ms-step-active');
              e.target.classList.add('ms-step-active');
            }
          }
        }, { threshold: 0.5, rootMargin: '-30% 0px -30% 0px' });
        for (var s = 0; s < steps.length; s++) stepObs.observe(steps[s]);
      })(scene);
    }
  }

  // ─── Boot ──────────────────────────────────────────────────────────
  function init() {
    attachReveal();
    rebuildParallax();
    attachDemos();
    attachScenes();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () { rebuildParallax(); }, { passive: true });

    // Re-scan after dynamic injections (nav-inject footer, late modules, etc.)
    var rescanTimer = null;
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () {
        if (rescanTimer) clearTimeout(rescanTimer);
        rescanTimer = setTimeout(function () {
          attachReveal();
          rebuildParallax();
          attachDemos();
          attachScenes();
        }, 100);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Public hook for late additions / framework integration.
  window.caMotion = {
    rescan: function () {
      attachReveal();
      rebuildParallax();
      attachDemos();
      attachScenes();
    }
  };
})();
