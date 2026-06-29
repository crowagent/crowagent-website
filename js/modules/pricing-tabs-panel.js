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

    function switchPanel(targetId, updateHash) {
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

      // 2B. Update URL Hash (if requested)
      if (updateHash && window.history.replaceState) {
        window.history.replaceState(null, null, "#" + targetId);
      }

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
      if (!targetId) return;
      // The .ptab tabs are <a href="#core"> anchors so they remain real links for
      // no-JS / right-click / new-tab. But when JS is handling the switch we MUST
      // suppress the browser's native scroll-to-anchor: the panels swap height and
      // the sticky bar condenses at a fixed scroll threshold, so a native anchor
      // jump made the whole page fluctuate on every tab click. switchPanel() owns
      // the hash via replaceState (which does not scroll), so the link is redundant.
      e.preventDefault();
      switchPanel(targetId, true);
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
      } else if (e.key === "Enter" || e.key === " ") {
        // Naturally handled by <a> but good to be explicit
        e.preventDefault();
        active.click();
      }

      if (nextIdx !== undefined) {
        e.preventDefault();
        var targetId = tabs[nextIdx].getAttribute("data-ptab");
        if (targetId) switchPanel(targetId, true);
        tabs[nextIdx].focus();
      }
    });

    // Set initial state based on URL hash or aria-selected="true"
    var hashId = window.location.hash.substring(1);
    var hashTab = tabs.find(function(t) { return t.getAttribute("data-ptab") === hashId; });
    
    var initialTab = hashTab || container.querySelector('.ptab[aria-selected="true"]') || tabs[0];
    if (initialTab) {
      var initialId = initialTab.getAttribute("data-ptab");
      if (initialId) switchPanel(initialId, false);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
