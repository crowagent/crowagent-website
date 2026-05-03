/**
 * Blog category filter.
 * Externalized from inline script for CSP compliance (DEF-003).
 */
(function () {
  var pills = document.querySelectorAll('.filter-pill');
  var cards = document.querySelectorAll('.article-card');

  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      pills.forEach(function (p) { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
      pill.classList.add('active');
      pill.setAttribute('aria-pressed', 'true');

      var filter = pill.getAttribute('data-filter');

      cards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();
