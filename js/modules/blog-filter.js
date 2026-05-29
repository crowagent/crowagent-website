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
    const loadMoreBtn = document.getElementById("blog-load-more-btn");
    const emptyState = document.getElementById("blog-empty-state");

    if (!pills.length || !cards.length) return;

    let activeFilter = "all";
    let searchQuery = "";
    let debounceTimer;
    let cardsPerPage = 9;
    let maxVisible = cardsPerPage;

    function applyFilters() {
      let matchCount = 0;
      let visibleCount = 0;
      
      cards.forEach((card) => {
        const category = card.getAttribute("data-category") || "all";
        const text = card.innerText.toLowerCase();
        
        const matchesCategory = (activeFilter === "all" || category === activeFilter);
        const matchesSearch = (searchQuery === "" || text.includes(searchQuery));

        if (matchesCategory && matchesSearch) {
          matchCount++;
          if (matchCount <= maxVisible) {
            card.style.display = "";
            card.setAttribute("aria-hidden", "false");
            visibleCount++;
          } else {
            card.style.display = "none";
            card.setAttribute("aria-hidden", "true");
          }
        } else {
          card.style.display = "none";
          card.setAttribute("aria-hidden", "true");
        }
      });

      if (emptyState) {
        emptyState.classList.toggle("hidden", matchCount > 0);
      }

      // Show/hide load more button
      if (loadMoreBtn) {
        loadMoreBtn.parentElement.style.display = (matchCount > maxVisible) ? "" : "none";
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

    // Load More functionality
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        maxVisible += cardsPerPage;
        applyFilters();
      });

      // Premium Motion: Magnetic Hover & Scale Press
      loadMoreBtn.addEventListener("mousemove", (e) => {
        const rect = loadMoreBtn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        if (window.gsap) {
          gsap.to(loadMoreBtn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.4,
            ease: "power2.out"
          });
        }
      });

      loadMoreBtn.addEventListener("mouseleave", () => {
        if (window.gsap) {
          gsap.to(loadMoreBtn, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.3)"
          });
        }
      });

      loadMoreBtn.addEventListener("mousedown", () => {
        if (window.gsap) {
          gsap.to(loadMoreBtn, {
            scale: 0.95,
            duration: 0.2
          });
        }
      });

      loadMoreBtn.addEventListener("mouseup", () => {
        if (window.gsap) {
          gsap.to(loadMoreBtn, {
            scale: 1,
            duration: 0.4,
            ease: "elastic.out(1, 0.3)"
          });
        }
      });
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
        maxVisible = cardsPerPage; // Reset pagination on filter change
        applyFilters();
      });
    });

    // Search input
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        maxVisible = cardsPerPage; // Reset pagination on search
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

    applyFilters();

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
