/**
 * Stripe-Grade Motion System (2026-05-23)
 *
 * Adds premium scroll-triggered animations, parallax, and hover effects
 * to make the site feel as polished as stripe.com.
 *
 * Strategy:
 *   1. Tag every major section + card grid with .stripe-reveal /
 *      .stripe-reveal-stagger so the CSS reveal kicks in on scroll.
 *   2. IntersectionObserver fires once per element — sets .in-view class.
 *   3. Hero Earth backdrop gets subtle parallax (translates 8% slower
 *      than viewport scroll).
 *   4. All effects respect prefers-reduced-motion (honoured in CSS).
 *
 * No GSAP dependency — pure native IO + rAF + CSS transitions.
 */
(function () {
  'use strict';
  if (window.__caStripeMotionLoaded) return;
  window.__caStripeMotionLoaded = true;

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.motion = 'reduced';
    return;
  }

  function ready(fn) {
    if (document.readyState !== 'loading') return fn();
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function tagSectionsForReveal() {
    // Tag every major homepage section
    const revealSelectors = [
      'main > section',
      '.hp-jtbd',
      '.hp-moat',
      '.hp-frameworks-strip',
      '.hp-audience-band',
      '.stats',
      '.how',
      '.sectors',
      '.trust',
      '.cta-band',
      '.sv-cta-band',
      '.hero-demo-section',
      '.contact-section'
    ];

    const all = new Set();
    revealSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => all.add(el));
    });

    all.forEach(el => {
      if (el.classList.contains('hero')) return; // Hero is animated separately
      el.classList.add('stripe-reveal');
    });

    // Tag card grids for stagger reveal
    const staggerSelectors = [
      '.hp-jtbd-grid',
      '.hp-trinity__grid',
      '.hp-moat__grid',
      '.hp-frameworks-list',
      '.stats-grid',
      '.sv-grid',
      '.sectors-grid',
      '.trust-grid'
    ];
    staggerSelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(grid => grid.classList.add('stripe-reveal-stagger'));
    });
  }

  function observeReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -8% 0px',
    });

    document.querySelectorAll('.stripe-reveal, .stripe-reveal-stagger').forEach(el => io.observe(el));
  }

  function setupHeroParallax() {
    const earth = document.querySelector('.hero-bg-earth, .hero-backdrop');
    if (!earth) return;

    let ticking = false;
    function update() {
      const heroSection = document.querySelector('#hero');
      if (!heroSection) return;
      const rect = heroSection.getBoundingClientRect();
      // Apply parallax only while hero is in view
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }
      const scrollPct = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      const translateY = scrollPct * 60; // max 60px translation
      earth.style.transform = `translate3d(0, ${translateY}px, 0) scale(1.05)`;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function setupCardMagneticHover() {
    // Subtle "magnetic" hover for path cards (cursor pulls card slightly)
    const cards = document.querySelectorAll('.hp-jtbd-path, .hp-trinity__card');
    cards.forEach(card => {
      let raf;
      card.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
          const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
          card.style.setProperty('--magnetic-x', `${x * 4}px`);
          card.style.setProperty('--magnetic-y', `${y * 4}px`);
          card.style.transform = `translate3d(${x * 4}px, ${y * 4 - 6}px, 0) scale(1.005)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = '';
      });
    });
  }

  function init() {
    tagSectionsForReveal();
    observeReveals();
    setupHeroParallax();
    setupCardMagneticHover();
  }

  ready(function () {
    setTimeout(init, 50);
  });
})();
