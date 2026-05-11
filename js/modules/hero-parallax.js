/**
 * hero-parallax.js — H1-MOTIFS-NAV-XFORM (2026-05-10)
 *
 * Cursor-driven parallax drift on the hero glow blobs. Writes
 * `--mouse-x` and `--mouse-y` (-1..1 range) custom properties on the
 * `.hero` element. CSS reads these in styles.css under
 * `=== H1-MOTIFS-NAV-XFORM 10-10 ===` and offsets `.hero-glow::before /
 * ::after` by ±12px max via `translate3d`.
 *
 * Skip conditions (the script returns early; CSS falls back to 0/0):
 *   1. `prefers-reduced-motion: reduce` — the user has explicitly opted
 *      out of decorative motion.
 *   2. `(hover: none)` — touch-only devices have no meaningful pointer.
 *
 * Throttled via requestAnimationFrame (one update per frame max).
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  var rmm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (rmm && rmm.matches) return;

  var hover = window.matchMedia && window.matchMedia("(hover: none)");
  if (hover && hover.matches) return;

  function attach(hero) {
    if (hero.dataset.parallaxWired === "1") return;
    hero.dataset.parallaxWired = "1";

    var rafId = 0;
    var pendingX = 0;
    var pendingY = 0;

    function flush() {
      rafId = 0;
      hero.style.setProperty("--mouse-x", pendingX.toFixed(3));
      hero.style.setProperty("--mouse-y", pendingY.toFixed(3));
    }

    hero.addEventListener("mousemove", function (ev) {
      var rect = hero.getBoundingClientRect();
      // Map cursor to -1..1 around the hero centre.
      pendingX = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pendingY = ((ev.clientY - rect.top) / rect.height) * 2 - 1;
      if (pendingX < -1) pendingX = -1; else if (pendingX > 1) pendingX = 1;
      if (pendingY < -1) pendingY = -1; else if (pendingY > 1) pendingY = 1;
      if (!rafId) rafId = requestAnimationFrame(flush);
    }, { passive: true });

    hero.addEventListener("mouseleave", function () {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      // Ease back to centre on exit.
      hero.style.setProperty("--mouse-x", "0");
      hero.style.setProperty("--mouse-y", "0");
    });
  }

  function init() {
    var heroes = document.querySelectorAll(".hero");
    for (var i = 0; i < heroes.length; i++) attach(heroes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
