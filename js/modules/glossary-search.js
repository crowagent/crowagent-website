/* Glossary search filter — externalised from glossary/index.html for CSP. */
(function () {
  'use strict';
  var input = document.getElementById('glossary-search');
  var clearBtn = document.getElementById('glossary-search-clear');
  if (!input) return;

  var cards = Array.prototype.slice.call(document.querySelectorAll('.glossary-card'));
  var letters = Array.prototype.slice.call(document.querySelectorAll('.glossary-letter'));

  function filter() {
    var q = input.value.trim().toLowerCase();
    
    // Toggle clear button visibility
    if (clearBtn) {
      clearBtn.style.display = q.length > 0 ? 'block' : 'none';
    }

    var anyVisible = {};
    cards.forEach(function (c) {
      var txt = c.textContent.toLowerCase();
      var visible = q.length === 0 || txt.indexOf(q) !== -1;
      c.style.display = visible ? '' : 'none';
      
      if (visible) {
        var sec = c.closest('.glossary-grid');
        if (sec) {
          var h2 = sec.previousElementSibling;
          if (h2 && h2.classList.contains('glossary-letter')) {
            anyVisible[h2.id] = true;
          }
        }
      }
    });

    letters.forEach(function (h) {
      var grid = h.nextElementSibling;
      if (q.length === 0) {
        h.style.display = '';
        if (grid) grid.style.display = '';
      } else {
        var hasVisible = anyVisible[h.id];
        h.style.display = hasVisible ? '' : 'none';
        if (grid) grid.style.display = hasVisible ? '' : 'none';
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      input.value = '';
      filter();
      input.focus();
    });
  }

  input.addEventListener('input', filter);
  input.addEventListener('search', filter);
})();
