/**
 * faq-search.js
 * Handles live search filtering for /faq.html.
 * Debounced logic to filter categories and individual accordions.
 */
(function () {
  "use strict";

  function init() {
    const searchInput = document.getElementById("faq-search");
    const faqs = document.querySelectorAll(".ca-faq details");
    const faqGroups = document.querySelectorAll("section[id^='faq-']");

    if (!searchInput || !faqs.length) return;

    let debounceTimer;

    /* BUG-012: a "No results" message shown when a search term matches no FAQ.
       Created once, inserted right after the search input, hidden by default. */
    let noResultsEl = document.getElementById("faq-no-results");
    if (!noResultsEl) {
      noResultsEl = document.createElement("p");
      noResultsEl.id = "faq-no-results";
      noResultsEl.setAttribute("role", "status");
      noResultsEl.setAttribute("aria-live", "polite");
      noResultsEl.hidden = true;
      noResultsEl.style.cssText =
        "margin:16px auto 0;max-width:36rem;text-align:center;color:rgba(255,255,255,0.6);font-weight:600;";
      if (searchInput.parentNode) {
        searchInput.parentNode.insertBefore(noResultsEl, searchInput.nextSibling);
      }
    }

    function handleSearch() {
      const query = searchInput.value.toLowerCase().trim();
      let matchCount = 0;

      faqs.forEach((faq) => {
        const summaryText = faq.querySelector("summary").innerText.toLowerCase();
        const contentArea = faq.querySelector(".prose");
        const contentText = contentArea ? contentArea.innerText.toLowerCase() : "";
        
        const isMatch = summaryText.includes(query) || contentText.includes(query);

        if (isMatch || query === "") {
          faq.style.display = "";
          faq.setAttribute("aria-hidden", "false");
          if (query !== "") matchCount++;
          // Auto-expand on search matches (3+ chars)
          if (query.length >= 3 && isMatch) {
            faq.open = true;
          } else if (query === "") {
            faq.open = false;
          }
        } else {
          faq.style.display = "none";
          faq.setAttribute("aria-hidden", "true");
          faq.open = false;
        }
      });

      // Show/Hide parent groups based on visible children
      faqGroups.forEach((group) => {
        const visibleFaqs = group.querySelectorAll(".ca-faq details:not([style*='display: none'])");
        if (visibleFaqs.length === 0 && query !== "") {
          group.style.display = "none";
        } else {
          group.style.display = "";
        }
      });

      // BUG-012: show the "No results" message when a non-empty query matched nothing.
      if (query !== "" && matchCount === 0) {
        noResultsEl.textContent = 'No FAQs match "' + searchInput.value.trim() + '". Try a different term.';
        noResultsEl.hidden = false;
      } else {
        noResultsEl.hidden = true;
      }

      // Refresh ScrollTrigger after DOM height shift
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
    }

    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(handleSearch, 150);
    });

    // Handle "Enter" key to prevent form submission if wrapped
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.preventDefault();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
