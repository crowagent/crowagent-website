/**
 * nav-shrink.js — H1-MOTIFS-NAV-XFORM (2026-05-10)
 *
 * Toggles `body.is-scrolled` past 80px of vertical scroll so the nav can
 * shrink (padding-block) and frost (backdrop-filter) without JS-driven
 * style writes per scroll-tick.
 *
 * Strategy:
 *   - Single passive scroll listener; rAF-throttled — handler runs at most
 *     once per frame.
 *   - Boolean class write (no inline style writes), so the browser layout
 *     work is bounded to the CSS rule itself.
 *   - CSS-first preferred: where the browser supports
 *     `animation-timeline: scroll(root)` (Chromium 115+), the @supports
 *     block in styles.css drives the shrink natively and this JS becomes
 *     a no-op visual layer (the class still toggles, but its rule is
 *     overridden by the higher-specificity scroll-driven keyframe).
 *   - Honours prefers-reduced-motion: still toggles class so the frosted
 *     state appears, but with no transition (CSS handles that).
 *
 * Brand-token contract: writes only one boolean class. No colour or
 * length values. Safe with the no-hex policy.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var THRESHOLD = 80;
  var rafId = 0;
  var current = null;

  function flush() {
    rafId = 0;
    var shouldBe = window.scrollY > THRESHOLD;
    if (shouldBe === current) return;
    current = shouldBe;
    if (shouldBe) {
      document.body.classList.add("is-scrolled");
    } else {
      document.body.classList.remove("is-scrolled");
    }
  }

  function onScroll() {
    if (!rafId) rafId = requestAnimationFrame(flush);
  }

  // Initial state — covers reload-mid-page and back-forward-cache restores.
  function init() {
    flush();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", flush);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
