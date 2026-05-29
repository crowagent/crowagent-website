/* hero-staggered-entrance.js — homepage hero entrance animation.
   Audit fix 2026-05-17 (JS-runtime agent): the timeline targeted
   .hero-eyebrow / .hero-trust / .hero-visual unconditionally. Product
   pages (crowagent-core, crowmark, crowcyber, crowcash, crowesg, csrd)
   load this module via cinematic asset bundle but use a different hero
   layout, so each call surfaced as `GSAP target X not found` (9 warns ×
   6 pages = 54 noise warns in CONSOLE-ERRORS audit). Now we only run
   when .hero-eyebrow OR .hero h1 actually exists, and each fromTo is
   gated on the element being present. Silent no-op otherwise. */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof window.gsap === 'undefined') return;

  const gsap = window.gsap;

  function init() {
    const hero = document.querySelector('.ca-hero, .hero');
    if (!hero) return;

    // 1. Kinetic Typography: Split spans into characters
    const titleSpans = document.querySelectorAll('.ca-hero-title-premium span, .ca-hero-title span, .hero-h1 span');
    titleSpans.forEach(span => {
      if (span.querySelector('.char')) return;
      const text = span.textContent.trim();
      if (!text) return;

      // Only split into chars on desktop/tablet for performance and wrapping stability
      if (window.innerWidth < 480) return;

      // Word-aware split (LM-130): wrap each word in an inline-block .word so it
      // can never break mid-word ("your" -> "you"/"r"); only the real spaces
      // between words are wrap opportunities. .char spans inside keep the
      // kinetic stagger animation working.
      span.innerHTML = '';
      const words = text.split(' ');
      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';
        word.split('').forEach(ch => {
          const charSpan = document.createElement('span');
          charSpan.className = 'char';
          charSpan.style.display = 'inline-block';
          charSpan.textContent = ch;
          wordSpan.appendChild(charSpan);
        });
        span.appendChild(wordSpan);
        if (wi < words.length - 1) span.appendChild(document.createTextNode(' '));
      });
    });

    // 2. Build Timeline
    const tl = gsap.timeline({ 
      defaults: { ease: 'power3.out', duration: 1 } 
    });

    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      gsap.set('.ca-hero-eyebrow, .ca-hero-badge, .ca-hero-title-premium span, .ca-hero-desc-premium, .ca-hero-btns, [data-pcar]', { opacity: 1, y: 0 });
      return;
    }

    // Step A: Eyebrow/Badge
    const eyebrow = document.querySelector('.ca-hero-eyebrow, .hero-eyebrow, .ca-hero-badge');
    if (eyebrow) tl.from(eyebrow, { opacity: 0, y: 15 }, 0.1);

    // Step B: Kinetic Title Reveal
    titleSpans.forEach((span, i) => {
      const chars = span.querySelectorAll('.char');
      if (chars.length > 0) {
        tl.from(span, { opacity: 0, duration: 0.4 }, 0.3 + (i * 0.1));
        tl.from(chars, { 
          opacity: 0, 
          y: 12, 
          stagger: 0.005,
          duration: 0.8,
          ease: 'power2.out'
        }, '-=0.5');
      } else {
        tl.from(span, { opacity: 0, y: 15, duration: 0.8 }, 0.3 + (i * 0.1));
      }
    });

    // Step C: Description & Buttons
    const others = document.querySelectorAll('.ca-hero-desc-premium, .hero-sub, .ca-hero-btns, .hero-btns');
    if (others.length) tl.from(others, { opacity: 0, y: 15, stagger: 0.1, duration: 0.8 }, '-=0.5');

    // Step D: Product Showcase
    const showcase = document.querySelector('[data-pcar], .hero-visual');
    if (showcase) tl.from(showcase, { opacity: 0, y: 20, duration: 1.2 }, '-=0.4');
  }

  if (document.readyState !== 'loading') setTimeout(init, 100);
  else document.addEventListener('DOMContentLoaded', init);
})();
