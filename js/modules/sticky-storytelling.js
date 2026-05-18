/**
 * sticky-storytelling.js — Refactored for GSAP ScrollTrigger (Stripe-level UI)
 * 
 * Pins the .story-visual-wrap and scrubs through the .story-step items.
 * Improved transitions and alignment for a premium experience.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;
  // Audit fix 2026-05-17 (JS-runtime agent): the module is bundled into the
  // global nav-inject autoload, so it loads on every page including ones
  // with no .story-shell (blog, contact, faq, tools, legal, etc.). Early
  // silent exit when there's nothing to wire keeps the console clean
  // without disabling the storytelling on pages that do use it. Also
  // gracefully no-ops when GSAP / ScrollTrigger libs are absent (was
  // surfaced as a "falling back to basic scroll" console.warn on 21
  // routes in CONSOLE-ERRORS-2026-05-17).
  if (!document.querySelector(".story-shell")) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    if (window.__CA_DEBUG__) {
      // Only surface diagnostic when explicitly debugging — production stays clean.
      try { console.warn("[sticky-storytelling] GSAP/ScrollTrigger missing on page with .story-shell — animation disabled."); } catch (_) {}
    }
    return;
  }

  var rmm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = !!(rmm && rmm.matches);

  function init() {
    var shells = document.querySelectorAll(".story-shell");
    if (!shells.length) return;

    for (var i = 0; i < shells.length; i++) {
      if (reduced) {
        wireReduced(shells[i]);
      } else {
        wireShell(shells[i]);
      }
    }
  }

  function wireReduced(shell) {
    var visuals = shell.querySelectorAll(".story-visual[data-visual]");
    for (var v = 0; v < visuals.length; v++) {
      visuals[v].classList.add("is-active");
    }
  }

  function wireShell(shell) {
    if (shell.dataset.storyWired === "1") return;
    shell.dataset.storyWired = "1";

    var steps = shell.querySelectorAll(".story-step");
    var visualWrap = shell.querySelector(".story-visual-wrap");
    var visuals = shell.querySelectorAll(".story-visual");

    if (!steps.length || !visualWrap || !visuals.length) return;

    // Desktop/Tablet pinning (side-by-side)
    if (window.innerWidth >= 1024) {
      gsap.to(visualWrap, {
        scrollTrigger: {
          trigger: shell,
          start: "top 96px",
          end: "bottom 100%",
          pin: visualWrap,
          pinSpacing: false,
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    }

    // Story steps scrubbing
    steps.forEach(function(step, index) {
      var stepId = step.getAttribute("data-step");
      var visual = shell.querySelector('.story-visual[data-visual="' + stepId + '"]');
      
      if (!visual) return;

      ScrollTrigger.create({
        trigger: step,
        start: "top 60%",
        end: "bottom 60%",
        onEnter: function() {
          activateVisual(visual, visuals);
          gsap.fromTo(step, { opacity: 0.3, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        },
        onEnterBack: function() {
          activateVisual(visual, visuals);
          gsap.fromTo(step, { opacity: 0.3, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });
        },
        onLeave: function() {
          gsap.to(step, { opacity: 0.3, duration: 0.4 });
        },
        onLeaveBack: function() {
          gsap.to(step, { opacity: 0.3, duration: 0.4 });
        }
      });
    });

    // Initialize first state
    gsap.set(steps, { opacity: 0.3 });
    gsap.set(steps[0], { opacity: 1 });
    visuals[0].classList.add("is-active");
  }

  function activateVisual(activeVisual, allVisuals) {
    allVisuals.forEach(function(v) {
      if (v === activeVisual) {
        v.classList.add("is-active");
        gsap.to(v, { 
          opacity: 1, 
          scale: 1, 
          rotateX: 0,
          y: 0,
          duration: 0.8, 
          ease: "power3.out",
          overwrite: true 
        });
      } else {
        v.classList.remove("is-active");
        gsap.to(v, { 
          opacity: 0, 
          scale: 0.95, 
          rotateX: -10,
          y: 10,
          duration: 0.6, 
          ease: "power2.in",
          overwrite: true 
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  
  // Refresh ScrollTrigger on window resize
  window.addEventListener("resize", function() {
    ScrollTrigger.refresh();
  });

})();
