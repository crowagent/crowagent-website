(function() {
  'use strict';

  var toggle = document.getElementById('billing-toggle');
  var lblMonthly = document.getElementById('label-monthly');
  var lblAnnual = document.getElementById('label-annual');
  var priceDisplays = document.querySelectorAll('.price-display');

  if (!toggle || priceDisplays.length === 0) return;

  /* ── Reduced-motion check ── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Formatting helper ── */
  function fmt(n) {
    return (n % 1 === 0)
      ? n.toLocaleString('en-GB')
      : n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ── rAF-based counter tween (fallback when no GSAP) ── */
  function rafTween(from, to, duration, onUpdate, onComplete) {
    var start = performance.now();
    function tick(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      var eased = 1 - (1 - progress) * (1 - progress);
      var current = from + (to - from) * eased;
      onUpdate(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        if (onComplete) onComplete();
      }
    }
    requestAnimationFrame(tick);
  }

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

      function applyFinal() {
        valEl.innerText = fmt(perMonth);
        cycleEl.innerText = '/mo';
        if (noteEl) {
          noteEl.innerText = isAnnual
            ? ' billed annually (\u00A3' + annualTotal.toLocaleString('en-GB') + '/yr, save 10%)'
            : '';
        }
      }

      var currentPrice = parseFloat(valEl.innerText.replace(/,/g, '')) || 0;

      /* ── Instant swap if prefers-reduced-motion ── */
      if (prefersReducedMotion) {
        applyFinal();
        return;
      }

      /* ── Animated counter tween ── */
      if (typeof window.gsap !== 'undefined') {
        // GSAP object property tween - 400ms
        var obj = { val: currentPrice };
        window.gsap.to(obj, {
          val: perMonth,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate: function() {
            valEl.innerText = fmt(Math.round(obj.val * 100) / 100);
            cycleEl.innerText = '/mo';
          },
          onComplete: applyFinal
        });
      } else {
        // requestAnimationFrame fallback - 400ms
        rafTween(currentPrice, perMonth, 400, function(current) {
          valEl.innerText = fmt(Math.round(current * 100) / 100);
          cycleEl.innerText = '/mo';
        }, applyFinal);
      }
    });
  }

  toggle.addEventListener('change', function(e) {
    updatePrices(e.target.checked);
  });
})();
