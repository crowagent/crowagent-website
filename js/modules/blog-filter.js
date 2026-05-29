/**
 * blog-filter.js
 * Live filtering for /blog/index.html.
 * Handles category chips and search input with URL sync.
 */
(function () {
  "use strict";

  function init() {
    const pills = document.querySelectorAll(".filter-pill");
    const cards = document.querySelectorAll("#blog-cards .article-card");
    const searchInput = document.getElementById("blog-search-input");
    const emptyState = document.getElementById("blog-empty-state");

    if (!pills.length || !cards.length) return;

    let activeFilter = "all";
    let searchQuery = "";
    let debounceTimer;

    function applyFilters() {
      let visibleCount = 0;
      
      cards.forEach((card) => {
        const category = card.getAttribute("data-category") || "all";
        const text = card.innerText.toLowerCase();
        
        const matchesCategory = (activeFilter === "all" || category === activeFilter);
        const matchesSearch = (searchQuery === "" || text.includes(searchQuery));

        if (matchesCategory && matchesSearch) {
          card.style.display = "";
          card.setAttribute("aria-hidden", "false");
          visibleCount++;
        } else {
          card.style.display = "none";
          card.setAttribute("aria-hidden", "true");
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("hidden", visibleCount > 0);
      }

      // Sync URL
      const url = new URL(window.location);
      if (activeFilter !== "all") url.searchParams.set("cat", activeFilter);
      else url.searchParams.delete("cat");
      
      if (searchQuery !== "") url.searchParams.set("q", searchQuery);
      else url.searchParams.delete("q");
      
      window.history.replaceState({}, "", url);

      // Refresh ScrollTrigger after layout shift
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    }

    // Pill clicks
    pills.forEach((pill) => {
      pill.addEventListener("click", () => {
        const filter = pill.getAttribute("data-filter");
        if (!filter) return;

        pills.forEach((p) => {
          const isActive = p === pill;
          p.classList.toggle("active", isActive);
          p.setAttribute("aria-pressed", isActive ? "true" : "false");
        });

        activeFilter = filter;
        applyFilters();
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(applyFilters, 150);
      });
    }

    // Initial state from URL
    const params = new URLSearchParams(window.location.search);
    const catParam = params.get("cat");
    const qParam = params.get("q");

    if (catParam) {
      const targetPill = Array.from(pills).find(p => p.getAttribute("data-filter") === catParam);
      if (targetPill) {
          // Manual toggle to avoid triggering click listeners before init completes if needed
          pills.forEach(p => p.classList.remove('active'));
          targetPill.classList.add('active');
          activeFilter = catParam;
      }
    }
    
    if (qParam && searchInput) {
      searchInput.value = qParam;
      searchQuery = qParam.toLowerCase().trim();
    }

    if (catParam || qParam) applyFilters();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
