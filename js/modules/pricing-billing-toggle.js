(function() {
  'use strict';

  var toggle = document.getElementById('billing-toggle');
  var lblMonthly = document.getElementById('label-monthly');
  var lblAnnual = document.getElementById('label-annual');
  var priceDisplays = document.querySelectorAll('.price-display');

  if (!toggle || priceDisplays.length === 0) return;

  function updatePrices(isAnnual) {
    if (isAnnual) {
      lblMonthly.classList.remove('active');
      lblAnnual.classList.add('active');
    } else {
      lblAnnual.classList.remove('active');
      lblMonthly.classList.add('active');
    }

    priceDisplays.forEach(function(display) {
      var valEl = display.querySelector('.price-val');
      var cycleEl = display.querySelector('.bill-cycle');
      var noteEl = display.querySelector('.bill-note');
      if (!valEl || !cycleEl) return;

      var monthly = parseInt(display.getAttribute('data-monthly'), 10);
      var annualTotal = parseInt(display.getAttribute('data-annual'), 10);

      // Always show a per-month figure. In annual mode this is the
      // per-month equivalent of the discounted annual total (annualTotal/12,
      // rounded to 2dp); the "billed annually" note carries the yearly total.
      var perMonth = isAnnual ? Math.round((annualTotal / 12) * 100) / 100 : monthly;

      function fmt(n) {
        // 2dp for fractional per-month annual figures, whole pounds otherwise.
        return (n % 1 === 0)
          ? n.toLocaleString('en-GB')
          : n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }

      function applyText() {
        valEl.innerText = fmt(perMonth);
        cycleEl.innerText = '/mo';
        if (noteEl) {
          noteEl.innerText = isAnnual
            ? ' billed annually (£' + annualTotal.toLocaleString('en-GB') + '/yr, save 10%)'
            : '';
        }
      }

      var currentPrice = parseFloat(valEl.innerText.replace(/,/g, '')) || 0;

      // Tween count using GSAP
      if (typeof window.gsap !== 'undefined') {
        var obj = { val: currentPrice };
        window.gsap.to(obj, {
          val: perMonth,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: function() {
            valEl.innerText = fmt(Math.round(obj.val * 100) / 100);
            cycleEl.innerText = '/mo';
          },
          onComplete: applyText
        });
      } else {
        applyText();
      }
    });
  }

  toggle.addEventListener('change', function(e) {
    updatePrices(e.target.checked);
  });
})();
