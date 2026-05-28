/* pricing-tabs-indicator.js — M10 (2026-05-16)
   Animated sliding indicator pill behind the .ptabs row on /pricing.

   Behaviour:
   - On DOMContentLoaded (or immediately if already loaded), find .ptabs.
   - Insert an absolutely-positioned .ptab-indicator as the first child.
   - On each .ptab click (and on initial paint), compute the active tab's
     left/width relative to .ptabs, set CSS vars --ptab-ind-x / --ptab-ind-width.
   - Indicator transitions via CSS (transform + width 280ms cubic-bezier).
   - Respects prefers-reduced-motion: reduce (CSS-side, transition: none).
   - Recomputes on window resize (debounced) and on font-load completion
     (Plus Jakarta Sans pill widths change post-load).
   - Idempotent: re-runs are no-ops once .ptab-indicator is in place. */

(function () {
  "use strict";

  function init() {
    var tabs = document.querySelector(".ptabs");
    if (!tabs) return;
    /* SF42-U2 2026-05-18 — guard relaxed: a pre-paint inline <script>
       in pricing.html may have already inserted .ptab-indicator at
       parser-time so that first paint is correct. In that case we
       still need to bind click/keyboard/resize/MutationObserver
       handlers — only skip the insertion step itself. The previous
       full-return idempotent guard left the indicator static. */
    if (tabs.dataset.ptabIndicatorReady === "1") return;
    tabs.dataset.ptabIndicatorReady = "1";

    tabs.classList.add("has-indicator");

    var indicator = tabs.querySelector(":scope > .ptab-indicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.className = "ptab-indicator";
      indicator.setAttribute("aria-hidden", "true");
      tabs.insertBefore(indicator, tabs.firstChild);
    }

    function getActiveTab() {
      return (
        tabs.querySelector('.ptab.on') ||
        tabs.querySelector('.ptab[aria-selected="true"]') ||
        tabs.querySelector(".ptab")
      );
    }

    function positionIndicator(animate) {
      var active = getActiveTab();
      if (!active) return;
      var tabsRect = tabs.getBoundingClientRect();
      var rect = active.getBoundingClientRect();
      var x = rect.left - tabsRect.left;
      var width = rect.width;
      if (width <= 0) return;

      if (!animate) {
        var prev = indicator.style.transition;
        indicator.style.transition = "none";
        indicator.style.setProperty("--ptab-ind-x", x + "px");
        indicator.style.setProperty("--ptab-ind-width", width + "px");
        // Force reflow so the next paint re-enables transitions cleanly.
        // eslint-disable-next-line no-unused-expressions
        indicator.offsetHeight;
        indicator.style.transition = prev || "";
      } else {
        indicator.style.setProperty("--ptab-ind-x", x + "px");
        indicator.style.setProperty("--ptab-ind-width", width + "px");
      }

      if (!indicator.classList.contains("is-ready")) {
        // Defer the .is-ready class one frame so the very first position
        // is painted without fade-in flicker on slow connections.
        requestAnimationFrame(function () {
          indicator.classList.add("is-ready");
        });
      }
    }

    // Initial paint without animation.
    positionIndicator(false);

    // Click handler — handles the visual indicator positioning.
    tabs.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".ptab") : null;
      if (!btn || !tabs.contains(btn)) return;

      // Re-position indicator with two RAFs to clear layout-jank.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          positionIndicator(true);
          // SF28: Sync GSAP ScrollTrigger after DOM height shift.
          if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
            window.ScrollTrigger.refresh();
          }
        });
      });
    });

    // Keyboard arrow / Enter / Space may also drive tab selection.
    tabs.addEventListener("keyup", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        requestAnimationFrame(function () {
          positionIndicator(true);
        });
      }
    });

    // Resize: debounce + recompute without animation to avoid jitter.
    var resizeTimer = null;
    window.addEventListener(
      "resize",
      function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          positionIndicator(false);
        }, 80);
      },
      { passive: true }
    );

    // Re-measure once webfonts have settled (pill widths shift when
    // Plus Jakarta Sans replaces the fallback stack).
    if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === "function") {
      document.fonts.ready
        .then(function () {
          positionIndicator(false);
        })
        .catch(function () {
          /* font-loading errors are non-fatal */
        });
    }

    // MutationObserver — if another script flips .on / aria-selected
    // programmatically (e.g. deep-linked tab), re-position.
    try {
      var mo = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (
            m.type === "attributes" &&
            (m.attributeName === "class" || m.attributeName === "aria-selected")
          ) {
            requestAnimationFrame(function () {
              positionIndicator(true);
            });
            return;
          }
        }
      });
      var ptabButtons = tabs.querySelectorAll(".ptab");
      for (var j = 0; j < ptabButtons.length; j++) {
        mo.observe(ptabButtons[j], { attributes: true, attributeFilter: ["class", "aria-selected"] });
      }
    } catch (e) {
      /* MutationObserver missing on very old browsers; click handler covers the common path */
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
