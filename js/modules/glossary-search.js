/* Glossary search filter — externalised from glossary/index.html for CSP. */
(function () {
  'use strict';
  var input = document.getElementById('glossary-search');
  if (!input) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('.glossary-card'));
  var letters = Array.prototype.slice.call(document.querySelectorAll('.glossary-letter'));
  function filter() {
    var q = input.value.trim().toLowerCase();
    var anyVisible = {};
    cards.forEach(function (c) {
      var txt = c.textContent.toLowerCase();
      var visible = q.length === 0 || txt.indexOf(q) !== -1;
      c.style.display = visible ? '' : 'none';
      if (visible) {
        var sec = c.closest('.glossary-grid');
        if (sec) {
          var prev = sec.previousElementSibling;
          if (prev && prev.classList.contains('glossary-letter')) {
            anyVisible[prev.id] = true;
          }
        }
      }
    });
    letters.forEach(function (h) {
      if (q.length === 0) {
        h.style.display = '';
        var grid = h.nextElementSibling;
        if (grid) grid.style.display = '';
      } else {
        var hasVisible = anyVisible[h.id];
        h.style.display = hasVisible ? '' : 'none';
        var grid2 = h.nextElementSibling;
        if (grid2) grid2.style.display = hasVisible ? '' : 'none';
      }
    });
  }
  input.addEventListener('input', filter);
  input.addEventListener('search', filter);
})();
