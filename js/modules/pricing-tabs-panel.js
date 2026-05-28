/**
 * pricing-tabs-panel.js
 * Handles the actual panel visibility toggling for /pricing.html.
 * Complements pricing-tabs-indicator.js (the visual slide).
 */

(function () {
  "use strict";

  function init() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".ptab[data-ptab]"));
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

      // 3. Dispatch Event for Indicator (and other listeners)
      document.dispatchEvent(new CustomEvent('pricing:tab-changed', { 
        detail: { ptab: targetId },
        bubbles: true 
      }));

      // 4. Refresh Layout (GSAP / ScrollTrigger)
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    }

    container.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest(".ptab") : null;
      if (!btn || !container.contains(btn)) return;
      var targetId = btn.getAttribute("data-ptab");
      if (targetId) switchPanel(targetId);
    });

    // Roving Tabindex (Arrow Keys)
    container.addEventListener("keydown", function (e) {
      var active = document.activeElement;
      var idx = tabs.indexOf(active);
      if (idx === -1) return;

      var nextIdx;
      if (e.key === "ArrowRight") {
        nextIdx = (idx + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        nextIdx = 0;
      } else if (e.key === "End") {
        nextIdx = tabs.length - 1;
      }

      if (nextIdx !== undefined) {
        e.preventDefault();
        tabs[nextIdx].focus();
        tabs[nextIdx].click();
      }
    });

    // Set initial state based on aria-selected="true"
    var initialTab = container.querySelector('.ptab[aria-selected="true"]') || tabs[0];
    if (initialTab) {
      var initialId = initialTab.getAttribute("data-ptab");
      if (initialId) switchPanel(initialId);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
