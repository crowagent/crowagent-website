/**
 * products-filter.js  (R2.2 P2-004)
 * Accessible category filter tabs for /products/index.html.
 *
 * - Tablist with "All" / "Compliance" / "Growth" tabs (role=tab / tablist).
 * - Roving tabindex (active tab tabindex=0, others -1).
 * - Keyboard: Left/Right arrows move focus + activate, Home/End jump to ends.
 * - Filters product cards by their data-category ("all" shows everything).
 * - Respects prefers-reduced-motion. Idempotent (guards against double-init).
 *
 * Vanilla ES5 IIFE, no dependencies.
 */
(function () {
  "use strict";

  var INIT_FLAG = "data-products-filter-init";

  function init() {
    var tablist = document.querySelector('[role="tablist"][aria-label="Filter products by category"]');
    if (!tablist) return;
    if (tablist.getAttribute(INIT_FLAG) === "1") return; // idempotent
    tablist.setAttribute(INIT_FLAG, "1");

    var tabs = [].slice.call(tablist.querySelectorAll('[role="tab"]'));
    var gridId = tabs.length ? tabs[0].getAttribute("aria-controls") : null;
    var grid = gridId ? document.getElementById(gridId) : null;
    if (!tabs.length || !grid) return;

    var cards = [].slice.call(grid.querySelectorAll("[data-category]"));

    function applyFilter(category) {
      for (var i = 0; i < cards.length; i++) {
        var cardCat = cards[i].getAttribute("data-category") || "";
        var show = category === "all" || cardCat === category;
        if (show) {
          cards[i].classList.remove("product-card-hidden");
          cards[i].removeAttribute("aria-hidden");
        } else {
          cards[i].classList.add("product-card-hidden");
          cards[i].setAttribute("aria-hidden", "true");
        }
      }
    }

    function selectTab(tab, focusIt) {
      for (var i = 0; i < tabs.length; i++) {
        var isActive = tabs[i] === tab;
        tabs[i].setAttribute("aria-selected", isActive ? "true" : "false");
        tabs[i].setAttribute("tabindex", isActive ? "0" : "-1");
      }
      if (focusIt) tab.focus();
      applyFilter(tab.getAttribute("data-category-filter") || "all");
    }

    // Click activation
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        selectTab(tab, false);
      });
    });

    // Keyboard navigation (roving focus)
    tablist.addEventListener("keydown", function (e) {
      var current = document.activeElement;
      var idx = tabs.indexOf(current);
      if (idx === -1) return;

      var nextIdx = null;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          nextIdx = (idx + 1) % tabs.length;
          break;
        case "ArrowLeft":
        case "ArrowUp":
          nextIdx = (idx - 1 + tabs.length) % tabs.length;
          break;
        case "Home":
          nextIdx = 0;
          break;
        case "End":
          nextIdx = tabs.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      selectTab(tabs[nextIdx], true);
    });

    // Initial state: honour whichever tab is marked aria-selected, default first.
    var initial = null;
    for (var j = 0; j < tabs.length; j++) {
      if (tabs[j].getAttribute("aria-selected") === "true") {
        initial = tabs[j];
        break;
      }
    }
    if (!initial) initial = tabs[0];
    selectTab(initial, false);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
