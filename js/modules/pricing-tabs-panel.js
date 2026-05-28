/**
 * pricing-tabs-panel.js
 * Handles the actual panel visibility toggling for /pricing.html.
 * Complements pricing-tabs-indicator.js (the visual slide).
 * 
 * Logic:
 * - On DOMContentLoaded, query .ptab[data-ptab] and .pricing-panel.
 * - On tab click:
 *   - For every panel: style.display='none'; hidden=true.
 *   - For #<data-ptab>-p: style.display=''; hidden=false.
 *   - Update aria-selected (true on clicked, false on others).
 *   - Update tabindex (0 on selected, -1 on others).
 */

(function () {
  "use strict";

  function init() {
    var tabs = document.querySelectorAll(".ptab[data-ptab]");
    var panels = document.querySelectorAll(".pricing-panel");
    var container = document.querySelector(".ptabs");

    if (!tabs.length || !panels.length || !container) return;

    function switchPanel(targetId) {
      // 1. Toggle Pricing Panels
      for (var i = 0; i < panels.length; i++) {
        panels[i].style.display = "none";
        panels[i].hidden = true;
      }

      var targetPanel = document.getElementById(targetId + "-p");
      if (targetPanel) {
        targetPanel.style.display = "block";
        targetPanel.hidden = false;
      }

      // 1B. Toggle Comparison Tables (if they exist)
      var tableIds = ["core", "mark", "cyber", "cash", "esg"];
      tableIds.forEach(function (id) {
        var table = document.getElementById(id + "-compare");
        if (table) {
          var isMatch = id === targetId;
          table.style.display = isMatch ? "block" : "none";
          table.hidden = !isMatch;
        }
      });

      // 2. Toggle Buttons (Accessibility)
      tabs.forEach(function (tab) {
        var isTarget = tab.getAttribute("data-ptab") === targetId;
        tab.classList.toggle("on", isTarget);
        tab.setAttribute("aria-selected", isTarget ? "true" : "false");
        tab.setAttribute("tabindex", isTarget ? "0" : "-1");
      });

      // 3. Refresh Layout (GSAP / ScrollTrigger)
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    }

    container.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".ptab") : null;
      if (!btn || !container.contains(btn)) return;

      var targetId = btn.getAttribute("data-ptab");
      if (targetId) {
        switchPanel(targetId);
      }
    });

    // Support keyboard navigation (if not already handled by browser/indicator)
    container.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        var btn = e.target && e.target.closest ? e.target.closest(".ptab") : null;
        if (btn) {
          e.preventDefault();
          btn.click();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
