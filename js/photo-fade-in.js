/* photo-fade-in.js — E-IMAGES agent (2026-05-10)
 *
 * Sets data-loaded="true" on <img class="photo-fade-in"> elements once
 * the image's bytes have decoded, so the CSS opacity 0 → 1 transition
 * in photo-treatments.css can fire.
 *
 * Self-contained, no dependencies. Runs on DOMContentLoaded so cached
 * images (which fire `load` before scripts run) still get the marker
 * applied via the .complete check.
 */
(function () {
  "use strict";

  function markLoaded(img) {
    if (!img || img.dataset.loaded === "true") return;
    img.dataset.loaded = "true";
  }

  function init() {
    var imgs = document.querySelectorAll("img.photo-fade-in");
    Array.prototype.forEach.call(imgs, function (img) {
      // Image already decoded (e.g. cached) — mark immediately.
      if (img.complete && img.naturalWidth > 0) {
        markLoaded(img);
        return;
      }
      img.addEventListener("load", function () {
        markLoaded(img);
      }, { once: true });
      // On error, still mark loaded so the broken-image icon is at least
      // visible rather than invisible at opacity 0.
      img.addEventListener("error", function () {
        markLoaded(img);
      }, { once: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
