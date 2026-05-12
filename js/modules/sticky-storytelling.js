/**
 * sticky-storytelling.js — H1-MOTIFS-NAV-XFORM (2026-05-10)
 *
 * IntersectionObserver helper for sticky-scroll storytelling sections.
 * The expected DOM (consumed by a future content-block):
 *
 *   <section class="story-shell">
 *     <div class="story-steps">
 *       <article class="story-step" data-step="1">…</article>
 *       <article class="story-step" data-step="2">…</article>
 *       <article class="story-step" data-step="3">…</article>
 *     </div>
 *     <div class="story-visual-wrap">
 *       <div class="story-visual" data-visual="1">…</div>
 *       <div class="story-visual" data-visual="2">…</div>
 *       <div class="story-visual" data-visual="3">…</div>
 *     </div>
 *   </section>
 *
 * When a `.story-step` enters the viewport (40% threshold), the
 * matching `.story-visual` (by data-visual === data-step) gains
 * `.is-active`; siblings lose it. The CSS in styles.css under
 * `=== H1-MOTIFS-NAV-XFORM 10-10 ===` keeps the inactive visuals
 * `opacity: 0` so the active one fades through.
 *
 * Honours prefers-reduced-motion by setting all visuals active at
 * once (no fade transitions, all visible).
 */
(function () {
  "use strict";
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (typeof IntersectionObserver === "undefined") return;

  var rmm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = !!(rmm && rmm.matches);

  function init() {
    var shells = document.querySelectorAll(".story-shell");
    if (!shells.length) return;

    for (var i = 0; i < shells.length; i++) wireShell(shells[i]);
  }

  function wireShell(shell) {
    if (shell.dataset.storyWired === "1") return;
    shell.dataset.storyWired = "1";

    var steps = shell.querySelectorAll(".story-step[data-step]");
    var visuals = shell.querySelectorAll(".story-visual[data-visual]");
    if (!steps.length || !visuals.length) return;

    if (reduced) {
      for (var v = 0; v < visuals.length; v++) {
        visuals[v].classList.add("is-active");
      }
      return;
    }

    function activate(stepId) {
      for (var v = 0; v < visuals.length; v++) {
        var vis = visuals[v];
        if (vis.getAttribute("data-visual") === stepId) {
          vis.classList.add("is-active");
        } else {
          vis.classList.remove("is-active");
        }
      }
    }

    var io = new IntersectionObserver(function (entries) {
      // Pick the first intersecting entry whose ratio is highest.
      var winner = null;
      var bestRatio = 0;
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (e.isIntersecting && e.intersectionRatio > bestRatio) {
          bestRatio = e.intersectionRatio;
          winner = e.target;
        }
      }
      if (winner) activate(winner.getAttribute("data-step"));
    }, {
      rootMargin: "-40% 0px -40% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    for (var s = 0; s < steps.length; s++) io.observe(steps[s]);

    // Activate the first visual on first paint so the section never
    // shows an empty visual column.
    activate(steps[0].getAttribute("data-step"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
