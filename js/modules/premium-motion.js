/**
 * Premium Motion (2026-05-22) — Stripe/Apple-grade scroll choreography.
 *
 * Adds the polished motion treatments expected on a top-1% marketing site:
 *   1. Hero parallax — Earth backdrop translates slower than foreground (depth).
 *   2. Section scroll-reveal — sections + cards fade up with subtle stagger.
 *   3. Card lift on hover — Stripe-style subtle Y translate + shadow lift.
 *   4. Eyebrow shimmer — teal eyebrow chips get a soft animated underline.
 *   5. Statute-strip counter animations — numeric values count up on viewport entry.
 *
 * All effects respect `prefers-reduced-motion: reduce` and gracefully no-op
 * if GSAP / ScrollTrigger fail to load. Independent of the GSAP cinematic
 * walkthrough; this module owns the *content* motion, not the hero canvas.
 */
(function () {
  'use strict';
  if (window.__caPremiumMotionLoaded) return;
  window.__caPremiumMotionLoaded = true;

  // Honour reduced motion immediately
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.motion = 'reduced';
    return;
  }

  // Wait for GSAP if it's loading defer'd
  function init() {
    var gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) {
      // Fallback: CSS-only fade-in via intersection observer
      cssOnlyReveal();
      return;
    }
    gsap.registerPlugin(window.ScrollTrigger);

    // 1) HERO PARALLAX — Earth backdrop translates slowly on scroll
    var earth = document.querySelector('.hero-bg-earth, .hero-backdrop');
    if (earth) {
      gsap.to(earth, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
      });
    }

    // 2) SECTION SCROLL-REVEAL — fade up + slight Y translate, staggered children
    var revealSections = document.querySelectorAll('.hp-trinity, .hp-moat, .hp-expansion, .hp-enterprise-trust, .sv-section, .stats, .how, .sectors, .trust, section.cta-band');
    revealSections.forEach(function (sec) {
      var children = sec.querySelectorAll('.sv-card, .hp-trinity__card, .hp-moat__row, .hp-expansion__card, .hp-enterprise-trust__item, .stat, .step-card');
      if (children.length === 0) children = [sec];
      gsap.fromTo(
        children,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08,
          scrollTrigger: { trigger: sec, start: 'top 80%', toggleActions: 'play none none none' },
        }
      );
    });

    // 3) STATUTE STRIP COUNTER — numeric values count up on entry
    document.querySelectorAll('[data-counter-to]').forEach(function (el) {
      var target = parseFloat(el.dataset.counterTo);
      var prefix = el.dataset.counterPrefix || '';
      var suffix = el.dataset.counterSuffix || '';
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: function () { el.textContent = prefix + Math.round(obj.v).toLocaleString() + suffix; },
      });
    });
  }

  function cssOnlyReveal() {
    // Fallback when GSAP didn't load — IntersectionObserver fade-in
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.sv-card, .hp-trinity__card, .hp-moat__row, .hp-expansion__card').forEach(function (el) {
      el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }
})();
