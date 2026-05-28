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

    function handleSearch() {
      const query = searchInput.value.toLowerCase().trim();

      faqs.forEach((faq) => {
        const summaryText = faq.querySelector("summary").innerText.toLowerCase();
        const contentArea = faq.querySelector(".prose");
        const contentText = contentArea ? contentArea.innerText.toLowerCase() : "";
        
        const isMatch = summaryText.includes(query) || contentText.includes(query);

        if (isMatch || query === "") {
          faq.style.display = "";
          faq.setAttribute("aria-hidden", "false");
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
