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

  /* ── Cancellable rAF-based counter tween (fallback when no GSAP) ──
     The active frame id is stored on the display element so a new toggle can
     cancel an in-flight tween before starting another (see updatePrices). */
  function rafTween(display, from, to, duration, onUpdate, onComplete) {
    var start = performance.now();
    function tick(now) {
      var progress = Math.min((now - start) / duration, 1);
      // ease-out quad
      var eased = 1 - (1 - progress) * (1 - progress);
      onUpdate(from + (to - from) * eased);
      if (progress < 1) {
        display._priceRaf = requestAnimationFrame(tick);
      } else {
        display._priceRaf = null;
        if (onComplete) onComplete();
      }
    }
    display._priceRaf = requestAnimationFrame(tick);
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

      // Annual headline is derived from the actual annual total divided by 12,
      // floored to a whole pound. This avoids the £1 contradiction that arises
      // when round(monthly * 0.9) * 12 != data-annual (e.g. £44*12=£528≠£529).
      var annualPerMonth = Math.floor(annualTotal / 12);
      var perMonth = isAnnual ? annualPerMonth : monthly;
      // Saving vs 12 months at the monthly rate.
      var savePerYear = (monthly * 12) - annualTotal;

      function applyFinal() {
        display._priceVal = perMonth;
        valEl.innerText = fmt(perMonth);
        cycleEl.innerText = '/mo';
        if (noteEl) {
          noteEl.innerText = isAnnual
            ? ' — £' + annualTotal.toLocaleString('en-GB') + '/yr billed annually'
            : ' billed monthly';
        }
      }

      // [FIX — fluctuating prices] Start the tween from the LAST KNOWN numeric
      // value tracked in JS state, NOT from valEl.innerText (which may be a
      // mid-animation value when the user toggles rapidly). Default to the
      // monthly figure on first run. This + cancelling the in-flight tween below
      // means a fast toggle resolves cleanly instead of bouncing between
      // overlapping tweens reading each other's intermediate output.
      var fromVal = (typeof display._priceVal === 'number') ? display._priceVal : monthly;

      /* ── Instant swap if prefers-reduced-motion ── */
      if (prefersReducedMotion) {
        if (display._priceTween && typeof display._priceTween.kill === 'function') display._priceTween.kill();
        if (display._priceRaf) { cancelAnimationFrame(display._priceRaf); display._priceRaf = null; }
        applyFinal();
        return;
      }

      /* ── Animated counter tween ── */
      if (typeof window.gsap !== 'undefined') {
        // Reuse ONE persistent tween object per display so killTweensOf actually
        // targets the running tween — a fresh object each call could never be
        // killed, which is exactly what let tweens stack and the price bounce.
        if (!display._priceObj) display._priceObj = { val: fromVal };
        var obj = display._priceObj;
        window.gsap.killTweensOf(obj); // cancel any in-flight tween first
        obj.val = fromVal;
        display._priceTween = window.gsap.to(obj, {
          val: perMonth,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate: function() {
            var v = Math.round(obj.val * 100) / 100;
            display._priceVal = v;
            valEl.innerText = fmt(v);
            cycleEl.innerText = '/mo';
          },
          onComplete: applyFinal
        });
      } else {
        // requestAnimationFrame fallback - 400ms. Cancel the previous frame so
        // overlapping tweens cannot fight over the same element.
        if (display._priceRaf) { cancelAnimationFrame(display._priceRaf); display._priceRaf = null; }
        rafTween(display, fromVal, perMonth, 400, function(current) {
          var v = Math.round(current * 100) / 100;
          display._priceVal = v;
          valEl.innerText = fmt(v);
          cycleEl.innerText = '/mo';
        }, applyFinal);
      }
    });
  }

  toggle.addEventListener('change', function(e) {
    updatePrices(e.target.checked);
  });

  // Initialise so the monthly state shows its "billed monthly" note on load
  // (and respects a pre-checked toggle if the browser restored it).
  updatePrices(toggle.checked);
})();
