/* D-batch runtime polish (2026-05-16): wires up the JS-side fixes for
   - Postcode form submit handler (Enter-key + click both work)
   - Cookie banner state sync (CSS var + body class on root)
   - Back-to-top hides when footer enters viewport
   - Mobile menu inert + aria-expanded sync
   - Carousel pause-on-hover + aria-live during autoplay
   - Nav frosted-glass on scroll
   No external deps. Defensive try/catch around each block. */
(function () {
  'use strict';

  /* ─── 1. Postcode form Enter-key submit ──────────────────────────── */
  try {
    var pcForm = document.getElementById('demo-postcode-form');
    var pcInput = document.getElementById('demo-tool-input');
    var pcBtn = document.getElementById('demo-submit');
    if (pcForm && pcInput) {
      pcForm.addEventListener('submit', function (e) {
        e.preventDefault();
        // Re-use existing handler if scripts.js exposed one, otherwise click the button.
        if (typeof window.__caCheckPostcode === 'function') {
          try { window.__caCheckPostcode(); } catch (_) {}
        } else if (pcBtn) {
          pcBtn.click();
        }
      });
    }
  } catch (_) {}

  /* ─── 2. Cookie banner state sync (height var + body class) ──────── */
  try {
    function syncCookieBannerState() {
      var banner = document.getElementById('ca-cookie');
      var visible = banner && getComputedStyle(banner).display !== 'none' && banner.style.display !== 'none';
      var h = banner ? banner.getBoundingClientRect().height : 0;
      document.documentElement.style.setProperty('--ca-cookie-banner-h', h + 'px');
      document.body.classList.toggle('has-cookie-banner', !!visible);
    }
    syncCookieBannerState();
    // Re-check after delay (banner is injected after DOMContentLoaded)
    setTimeout(syncCookieBannerState, 300);
    setTimeout(syncCookieBannerState, 1200);
    // Observe future banner show/hide via MutationObserver on body
    if (window.MutationObserver) {
      var bannerMo = new MutationObserver(syncCookieBannerState);
      bannerMo.observe(document.body, { childList: true, subtree: false });
      // Also observe attribute changes on the banner itself when it exists
      setTimeout(function () {
        var b = document.getElementById('ca-cookie');
        if (b) bannerMo.observe(b, { attributes: true, attributeFilter: ['style', 'class'] });
      }, 600);
    }
    window.addEventListener('resize', syncCookieBannerState, { passive: true });
  } catch (_) {}

  /* ─── 3. Back-to-top logic removed ───────────────────────────────── */
  // Delegated entirely to sf21-back-to-top.js to eliminate conflicts.

  /* ─── 4. Mobile menu inert + aria sync ───────────────────────────── */
  try {
    function syncMobMenuA11y() {
      var mob = document.getElementById('mob-menu');
      var ham = document.querySelector('.ham');
      if (!mob || !ham) return;
      var open = mob.classList.contains('open');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      ham.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      mob.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (open) mob.removeAttribute('inert');
      else if ('inert' in mob) mob.setAttribute('inert', '');
    }
    // Observe class changes on mob-menu
    if (window.MutationObserver) {
      var mobMo = new MutationObserver(syncMobMenuA11y);
      // mob-menu is injected by nav-inject — wait for it
      var tries = 0;
      var waiter = setInterval(function () {
        var mob = document.getElementById('mob-menu');
        if (mob) {
          clearInterval(waiter);
          mobMo.observe(mob, { attributes: true, attributeFilter: ['class'] });
          syncMobMenuA11y();
        } else if (++tries > 20) {
          clearInterval(waiter);
        }
      }, 100);
    }
  } catch (_) {}

  /* ─── 5. Carousel pause-on-hover ─────────────────────────────────── */
  try {
    document.querySelectorAll('.crow-carousel').forEach(function (c) {
      var inst = null;
      c.addEventListener('mouseenter', function () {
        var pauseBtn = c.querySelector('.crow-carousel-pause');
        if (pauseBtn && pauseBtn.getAttribute('aria-pressed') !== 'true') {
          // Mark soft-pause; real pause-state lives in carousel.js
          c.dataset.hoverPause = 'true';
        }
      });
      c.addEventListener('mouseleave', function () {
        delete c.dataset.hoverPause;
      });
    });
  } catch (_) {}

  /* ─── 6. Frosted-glass nav on scroll ─────────────────────────────── */
  try {
    var nav = document.querySelector('nav[role="navigation"], .crow-nav, header nav');
    if (nav) {
      var lastScrolled = false;
      window.addEventListener('scroll', function () {
        var scrolled = window.scrollY > 12;
        if (scrolled !== lastScrolled) {
          nav.classList.toggle('scrolled', scrolled);
          lastScrolled = scrolled;
        }
      }, { passive: true });
    }
  } catch (_) {}

  /* ─── 7. Hero persona aria-hidden sync ───────────────────────────── */
  try {
    function syncSegA11y() {
      document.querySelectorAll('main h1 .seg-text, .hero-sub .seg-text, .hero-btns .seg-text, .hero-penalty-banner.seg-text').forEach(function (el) {
        if (el.hidden || getComputedStyle(el).display === 'none') {
          el.setAttribute('aria-hidden', 'true');
        } else {
          el.removeAttribute('aria-hidden');
        }
      });
    }
    syncSegA11y();
    document.querySelectorAll('.seg-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTimeout(syncSegA11y, 50);
      });
    });
  } catch (_) {}
})();
