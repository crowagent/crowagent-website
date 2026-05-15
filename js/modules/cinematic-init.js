/**
 * CrowAgent Cinematic UI Initializer
 * Registers GSAP plugins and defines global motion defaults.
 */
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
    // 1. Earth Zoom Animation (Start from space, zoom towards UK)
    const earthImg = document.querySelector('.hero-earth-img');
    if (earthImg) {
      // Set initial state (zoomed out)
      gsap.set(earthImg, { scale: 1.0, transformOrigin: "50% 50%" });
      
      gsap.to(earthImg, {
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.5 // Smooth scrubbing
        },
        scale: 1.25, // Zoom in
        yPercent: 5, // Slight pan
        ease: "none"
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
          x: x * 0.15,
          y: y * 0.15,
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

    // 3. Staggered Reveals
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(reveal => {
      gsap.fromTo(reveal, 
        { y: 40, opacity: 0 },
        {
          scrollTrigger: {
            trigger: reveal,
            start: "top 85%",
            toggleActions: "play none none reverse"
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out"
        }
      );
    });
  }

  // Cinematic revealed log (debug only)
  if (window.location.hostname === 'localhost' || window.__CA_DEBUG__) {
    console.log('✨ CrowAgent Cinematic Engine Initialized (Earth Zoom + Magnetic UI)');
  }
})();
