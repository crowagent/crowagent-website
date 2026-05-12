/**
 * Blog category filter.
 * Externalized from inline script for CSP compliance (DEF-003).
 *
 * WS-AUDIT-026 (2026-05-10): supports `?tag=<slug>` deep-link from the
 * footer. Footer "PPN 002 guides" → /blog?tag=ppn-002 differentiates it
 * from the catch-all "Blog" link → /blog. The slug must match a
 * `data-filter` attribute on a `.filter-pill` button.
 */
(function () {
  var pills = document.querySelectorAll('.filter-pill');
  var cards = document.querySelectorAll('.article-card');

  function applyFilter(filter) {
    pills.forEach(function (p) {
      var match = p.getAttribute('data-filter') === filter;
      if (match) {
        p.classList.add('active');
        p.setAttribute('aria-pressed', 'true');
      } else {
        p.classList.remove('active');
        p.setAttribute('aria-pressed', 'false');
      }
    });

    cards.forEach(function (card) {
      if (filter === 'all' || card.getAttribute('data-category') === filter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var filter = pill.getAttribute('data-filter') || 'all';
      applyFilter(filter);
    });
  });

  // WS-AUDIT-026: read ?tag= on initial load and apply if it matches a pill.
  try {
    var qs = new URLSearchParams(window.location.search);
    var tag = qs.get('tag');
    if (tag) {
      var validTags = Array.prototype.map.call(pills, function (p) {
        return p.getAttribute('data-filter');
      });
      if (validTags.indexOf(tag) !== -1) {
        applyFilter(tag);
      }
    }
  } catch (_) { /* URLSearchParams unavailable — leave default 'all' active */ }
})();
