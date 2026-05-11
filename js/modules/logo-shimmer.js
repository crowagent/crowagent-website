/**
 * logo-shimmer.js — H1-MOTIFS-NAV-XFORM (2026-05-10)
 *
 * One-shot shimmer animation across the nav logo on the user's first
 * paint of a page (fires on `pageshow`, which covers fresh loads and
 * back-forward-cache restores).
 *
 * Implementation:
 *   - Adds `.logo-shimmer` to `.ca-logo` (the nav logo wrapper) on
 *     pageshow.
 *   - Removes `.logo-shimmer` after 2s so the keyframe does not replay
 *     on subsequent interactions (the CSS animation is a single
 *     `forwards` 1.6s sweep with a 0.4s delay).
 *   - Honours prefers-reduced-motion by skipping the shimmer entirely.
 *
 * The CSS that defines `.logo-shimmer::before` lives in styles.css
 * under `=== H1-MOTIFS-NAV-XFORM 10-10 ===`.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var rmm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (rmm && rmm.matches) return;

  function trigger() {
    var logos = document.querySelectorAll(".ca-logo");
    if (!logos.length) return;
    for (var i = 0; i < logos.length; i++) {
      var l = logos[i];
      l.classList.add("logo-shimmer");
    }
    // Remove after the keyframe completes (delay 0.4s + duration 1.6s = 2s).
    setTimeout(function () {
      for (var i = 0; i < logos.length; i++) {
        logos[i].classList.remove("logo-shimmer");
      }
    }, 2100);
  }

  // pageshow covers both fresh loads and bfcache restores.
  window.addEventListener("pageshow", trigger);
})();
