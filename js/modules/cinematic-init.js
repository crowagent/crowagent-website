/**
 * CrowAgent Cinematic UI Initializer v2.0
 * Registers GSAP plugins and defines global motion defaults.
 * Inspired by Stripe, Apple, and Notion marketing sites.
 */

/* 2026-05-16: swallow benign cross-document view-transition AbortErrors.
   `@view-transition { navigation: auto }` in styles.css opts every same-origin
   navigation into a view transition. The browser may skip the transition if
   the next page is slow to first paint or the user navigates again before
   the previous one settles, producing an unhandled-rejection
   "AbortError: Transition was skipped". Catching it keeps the console clean
   without disabling the transition itself. */
window.addEventListener('unhandledrejection', function (e) {
  if (e.reason && e.reason.name === 'AbortError' &&
      /Transition was skipped/i.test(e.reason.message || '')) {
    e.preventDefault();
  }
});

(function() {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Global ScrollTrigger defaults
  ScrollTrigger.config({
    limitCallbacks: true,
    ignoreMobileResize: true
  });

  // Respect reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // 1. Earth Zoom Animation (Enhanced)
    const earthImg = document.querySelector('.hero-earth-img');
    const heroSection = document.querySelector('.hero');
    if (earthImg && heroSection) {
      gsap.fromTo(earthImg, 
        { scale: 1.05, filter: 'saturate(0.5) brightness(0.7)' },
        {
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
          },
          scale: 1.4,
          filter: 'saturate(1.2) brightness(1.0)',
          ease: "none"
        }
      );

      // Mouse-move tilt effect for Earth
      heroSection.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        const xPos = (clientX / innerWidth) - 0.5;
        const yPos = (clientY / innerHeight) - 0.5;

        gsap.to(earthImg, {
          x: xPos * 30,
          y: yPos * 30,
          rotateX: yPos * 2,
          rotateY: xPos * 2,
          duration: 1,
          ease: "power2.out"
        });
      });
    }

    // 2. Magnetic UI for premium buttons
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) - rect.width / 2;
        const y = (e.clientY - rect.top) - rect.height / 2;
        
        gsap.to(el, {
          x: x * 0.2,
          y: y * 0.2,
          duration: 0.4,
          ease: "power2.out"
        });
      });
      
      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      });
    });

    // 3. Sophisticated Staggered Reveals
    // SF-6 2026-05-17: one-shot reveal (Stripe pattern). The original
    // `onLeaveBack: () => remove('is-visible')` caused sections to
    // snap back to opacity:0 every time the user scrolled back up
    // past them — visible during SF-6 Playwright verification where
    // frameworks/stats/regstrip were stuck hidden after a top-to-
    // bottom-to-top scroll. Removing onLeaveBack keeps the class
    // sticky once added; this also matches Stripe.com behaviour
    // (sections don't re-fade when scrolled past).
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(reveal => {
      ScrollTrigger.create({
        trigger: reveal,
        start: "top 85%",
        once: true,
        onEnter: () => reveal.classList.add('is-visible')
      });
    });

    // SF-9 2026-05-17: refresh ScrollTrigger after window.load so all images,
    // SVGs, web fonts and lazy-init modules have settled. Without this any
    // .reveal section that sits above the fold at first paint can stay stuck
    // at opacity:0 because ScrollTrigger's measurements were stale.
    window.addEventListener('load', function () {
      try { ScrollTrigger.refresh(); } catch (_) { /* GSAP versioning safety */ }
      // Safety net for any .reveal that the user has already scrolled past
      // OR is currently within the trigger zone — fire visible immediately.
      setTimeout(function () {
        var vh = window.innerHeight;
        document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.top < vh * 0.85) el.classList.add('is-visible');
        });
      }, 200);
    });

    // 4. Bento Card Mouse Tracking (Spotlight Effect)
    const spotlightCards = document.querySelectorAll('.bento-card, .product-full-block, .framework-card, .sector, .tc, .hw, .uc, .u-card, .triple-card');
    spotlightCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });

    // 5. Section Background Blending
    const tealSections = document.querySelectorAll('.section-tone-1');
    tealSections.forEach(section => {
      ScrollTrigger.create({
        trigger: section,
        start: "top 50%",
        end: "bottom 50%",
        onEnter: () => document.body.classList.add('section-blend-teal'),
        onLeave: () => document.body.classList.remove('section-blend-teal'),
        onEnterBack: () => document.body.classList.add('section-blend-teal'),
        onLeaveBack: () => document.body.classList.remove('section-blend-teal')
      });
    });
  }

  // Cinematic revealed log (debug only)
  if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
    console.log('✨ CrowAgent Cinematic Engine v2.0 Initialized');
  }

  // 6. Scroll Progress Indicator
  var progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', function () {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = progress + '%';
    }, { passive: true });
  }

  // 7. Animated Number Counters
  var counters = document.querySelectorAll('.counter[data-target]');
  if (counters.length && !prefersReducedMotion) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.counted) return;
        el.dataset.counted = '1';
        var target = parseInt(el.dataset.target, 10);
        var prefix = el.dataset.prefix || '';
        var suffix = el.dataset.suffix || '';
        // P6 2026-05-17: align counter tick to Stripe motion spec
        // (--dur-stripe-long = 1200ms). Was 2000ms; the shorter tick
        // matches the rhythm of the gauge sweep + KPI tickers in the
        // hero demo SVG so the page feels rhythmically consistent.
        var duration = 1200;
        var start = performance.now();
        function step(now) {
          var elapsed = now - start;
          var progress = Math.min(elapsed / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.round(target * eased);
          el.textContent = prefix + current.toLocaleString('en-GB') + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.3 });
    counters.forEach(function (c) { counterObserver.observe(c); });
  }
})();
