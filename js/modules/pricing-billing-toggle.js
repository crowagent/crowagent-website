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
      if (!valEl || !cycleEl) return;

      var targetPrice = isAnnual ? parseInt(display.getAttribute('data-annual'), 10) : parseInt(display.getAttribute('data-monthly'), 10);
      var currentPrice = parseInt(valEl.innerText.replace(/,/g, ''), 10) || 0;

      // Tween count using GSAP
      if (typeof window.gsap !== 'undefined') {
        var obj = { val: currentPrice };
        window.gsap.to(obj, {
          val: targetPrice,
          duration: 0.6,
          ease: 'power2.out',
          onUpdate: function() {
            valEl.innerText = Math.round(obj.val).toLocaleString('en-GB');
          },
          onComplete: function() {
            cycleEl.innerText = isAnnual ? '/yr' : '/mo';
          }
        });
      } else {
        // Fallback
        valEl.innerText = targetPrice.toLocaleString('en-GB');
        cycleEl.innerText = isAnnual ? '/yr' : '/mo';
      }
    });
  }

  toggle.addEventListener('change', function(e) {
    updatePrices(e.target.checked);
  });
})();
