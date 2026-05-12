/**
 * spotlight.js — DESIGN-SPEC-P0 P0-E (2026-05-10)
 *
 * Cursor-following radial-gradient spotlight on `.product-full-block` and
 * `.uc` cards. Reference: Stripe / Linear flashlight border interaction.
 *
 * Strategy:
 *   - Single delegated mousemove listener (one per matched card) that writes
 *     `--mouse-x` and `--mouse-y` custom properties scoped to the card.
 *   - Updates throttled via requestAnimationFrame so the handler never fires
 *     more than once per frame (60fps cap on mid-tier hardware).
 *   - The visible spotlight gradient itself is in CSS (.uc::before /
 *     .products-bento .product-full-block::before in styles.css under the
 *     DESIGN-SPEC-P0 block).
 *   - prefers-reduced-motion: handler is a no-op (the CSS already locks the
 *     pseudo-element opacity at 0 in that mode).
 *
 * Brand-token contract: this script writes ONLY length values (px), never
 * colours, so no token reference is needed here.
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;

  // Honour the global reduced-motion preference (mirrors styles.css:5-12).
  var mql = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (mql && mql.matches) return;

  var SELECTOR = ".products-bento .product-full-block, .uc";

  function attach(el) {
    if (el.dataset.spotlightWired === "1") return;
    el.dataset.spotlightWired = "1";

    var rafId = 0;
    var pendingX = 0;
    var pendingY = 0;

    function flush() {
      rafId = 0;
      el.style.setProperty("--mouse-x", pendingX + "px");
      el.style.setProperty("--mouse-y", pendingY + "px");
    }

    el.addEventListener("mousemove", function (ev) {
      var rect = el.getBoundingClientRect();
      pendingX = ev.clientX - rect.left;
      pendingY = ev.clientY - rect.top;
      if (!rafId) rafId = requestAnimationFrame(flush);
    }, { passive: true });

    // Reset to centre on leave so the next hover doesn't reuse stale coords.
    el.addEventListener("mouseleave", function () {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      el.style.removeProperty("--mouse-x");
      el.style.removeProperty("--mouse-y");
    });
  }

  function init() {
    var nodes = document.querySelectorAll(SELECTOR);
    for (var i = 0; i < nodes.length; i++) attach(nodes[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
