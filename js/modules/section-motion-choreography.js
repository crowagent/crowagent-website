/**
 * Section Motion Choreography (2026-05-22) — Stripe/Apple-grade scroll motion
 * for the top 6 product pages + the homepage.
 *
 * Complements `premium-motion.js` (hero parallax + counters) by animating the
 * *content children inside sections* using current, real selectors:
 *
 *   index.html
 *     - .hp-jtbd-grid > .hp-jtbd-path             — Revenue Trinity stagger
 *     - .hp-moat-terminal                          — Sovereign Moat scale-in
 *     - .hp-moat-fineprint                         — fade-up after terminal
 *     - .stats-grid > .sc                          — stats stagger-up
 *     - section[aria-label="Why this work matters"] .u-grid-3 > .sv-card
 *                                                  — Future-Proofing teaser cards
 *     - .sectors-grid > *                          — sector tile stagger
 *     - .trust .u-grid-3 > *, .trust .sv-card      — trust pillars
 *     - .triple-cta-section .triple-card           — Final CTA stagger
 *     - .hp-cta-band                               — final CTA gentle scale-in
 *
 *   product pages (crowmark / crowcyber / crowcash / crowagent-core / crowesg / csrd)
 *     - .hero-visual, figure[data-product]         — hero dashboard subtle scale 1.02 → 1
 *     - .product-mockup-widget                     — widget gentle scale-in
 *     - .pw-sf21-grid > .pw-sf21-card              — walkthrough stagger
 *     - .hw-grid > .sv-card                        — use-case / benefit grids stagger
 *     - .sector-grid > *                           — sector mini-grids stagger
 *     - [data-section="pricing-or-waitlist"]       — pricing card slide-up
 *     - section.cta-band, section[data-section="cta-band"]
 *                                                  — final CTA gentle scale-in
 *
 * All choreography:
 *   - Honours `prefers-reduced-motion: reduce` (instant no-op).
 *   - Idempotent via `window.__caSectionMotionLoaded`.
 *   - Graceful no-op if GSAP / ScrollTrigger missing.
 *   - Run-once per trigger (toggleActions: 'play none none none').
 *   - 0.6–0.8s durations, 0.08–0.12s stagger, ease 'power2.out'.
 *   - No inline style attributes added pre-flight; GSAP `fromTo`
 *     drives transform + opacity directly so no flash-of-unstyled-state.
 *   - Skips animating any element already inside .reveal/.sf17-reveal/.ms-reveal
 *     containers that haven't been triggered yet — but since we animate the
 *     *children*, this avoids double-fading the parent.
 */
(function () {
  'use strict';

  if (window.__caSectionMotionLoaded) return;
  window.__caSectionMotionLoaded = true;

  // Reduced motion users get nothing — keep the page static.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  var DEFAULT_TRIGGER_START = 'top 82%';
  var EASE_OUT = 'power2.out';
  var EASE_SOFT = 'power3.out';

  function safeQueryAll(root, selector) {
    try {
      var els = Array.prototype.slice.call((root || document).querySelectorAll(selector));
      // Defer to motion-system.js for anything it already owns (`.ms-reveal`).
      // Without this guard we'd race with its IntersectionObserver and leave
      // elements stuck at opacity:0 via GSAP's inline style.
      return els.filter(function (el) { return !el.classList.contains('ms-reveal'); });
    } catch (err) {
      return [];
    }
  }

  function staggerUp(gsap, targets, opts) {
    if (!targets || targets.length === 0) return;
    opts = opts || {};
    gsap.fromTo(
      targets,
      { autoAlpha: 0, y: opts.y != null ? opts.y : 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: opts.duration || 0.7,
        ease: opts.ease || EASE_OUT,
        stagger: opts.stagger != null ? opts.stagger : 0.08,
        scrollTrigger: {
          trigger: opts.trigger || targets[0],
          start: opts.start || DEFAULT_TRIGGER_START,
          toggleActions: 'play none none none',
        },
      }
    );
  }

  function scaleIn(gsap, target, opts) {
    if (!target) return;
    opts = opts || {};
    gsap.fromTo(
      target,
      { autoAlpha: 0, scale: opts.fromScale != null ? opts.fromScale : 0.98, y: opts.y != null ? opts.y : 12 },
      {
        autoAlpha: 1,
        scale: 1,
        y: 0,
        duration: opts.duration || 0.8,
        ease: opts.ease || EASE_SOFT,
        scrollTrigger: {
          trigger: opts.trigger || target,
          start: opts.start || DEFAULT_TRIGGER_START,
          toggleActions: 'play none none none',
        },
      }
    );
  }

  function gentleScaleOnLoad(gsap, target, opts) {
    if (!target) return;
    opts = opts || {};
    gsap.fromTo(
      target,
      { scale: opts.fromScale != null ? opts.fromScale : 1.02, autoAlpha: 0 },
      {
        scale: 1,
        autoAlpha: 1,
        duration: opts.duration || 0.8,
        ease: opts.ease || EASE_SOFT,
        delay: opts.delay != null ? opts.delay : 0.15,
      }
    );
  }

  /* ===========================
   * IntersectionObserver fallback (used when GSAP is not loaded on a page)
   *
   * Many secondary pages (legal, contact, blog, glossary, etc.) intentionally
   * do NOT load GSAP+ScrollTrigger to keep payload light. For those pages we
   * still want section-level fade-up motion. This fallback applies the SAME
   * choreography shape (fade + translateY) using IntersectionObserver and
   * CSS transitions — perceptually identical, zero extra network cost.
   * =========================== */
  function ioStaggerUp(targets, opts) {
    if (!targets || !targets.length) return;
    if (!('IntersectionObserver' in window)) return;
    opts = opts || {};
    var stagger = opts.stagger != null ? opts.stagger : 0.08; // seconds
    var duration = opts.duration || 0.6;
    var y = opts.y != null ? opts.y : 18;
    targets.forEach(function (t, i) {
      t.style.opacity = '0';
      t.style.transform = 'translateY(' + y + 'px)';
      t.style.transition = 'opacity ' + duration + 's ease-out ' + (i * stagger) + 's, transform ' + duration + 's ease-out ' + (i * stagger) + 's';
      t.style.willChange = 'opacity, transform';
    });
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !seen.has(entry.target)) {
          seen.add(entry.target);
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    targets.forEach(function (t) { io.observe(t); });
  }

  function ioScaleIn(target, opts) {
    if (!target) return;
    if (!('IntersectionObserver' in window)) return;
    opts = opts || {};
    var fromScale = opts.fromScale != null ? opts.fromScale : 0.985;
    var y = opts.y != null ? opts.y : 12;
    var duration = opts.duration || 0.75;
    target.style.opacity = '0';
    target.style.transform = 'translateY(' + y + 'px) scale(' + fromScale + ')';
    target.style.transition = 'opacity ' + duration + 's ease-out, transform ' + duration + 's ease-out';
    target.style.willChange = 'opacity, transform';
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0) scale(1)';
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    io.observe(target);
  }

  function runFallbackChoreography() {
    // Mirror the GSAP-driven choreography for secondary pages without GSAP.
    // Pages with GSAP get the richer per-stagger ease in init().
    // Pages without GSAP get this perceptually-equivalent IO/CSS version.

    // Legal TOC + sections
    ioScaleIn(document.querySelector('.legal-toc'), { fromScale: 1, y: 12, duration: 0.6 });
    ioStaggerUp(safeQueryAll(document, '.priv-article, .priv-section, .sec-prose > section, .legal-content > section, .tool-methodology-body > section'), { duration: 0.55, stagger: 0, y: 18 });

    // Contact / partners / about
    ioStaggerUp(safeQueryAll(document, '.contact-form .form-group, .contact-form .form-field-floating'), { duration: 0.5, stagger: 0.05, y: 14 });
    ioStaggerUp(safeQueryAll(document, '.f10-office-grid-item'), { duration: 0.6, stagger: 0.07, y: 16 });
    ioStaggerUp(safeQueryAll(document, '.partner-card'), { duration: 0.6, stagger: 0.07, y: 18 });
    ioStaggerUp(safeQueryAll(document, '.partner-form-stack .form-group, .partner-form-stack .partner-form-section'), { duration: 0.5, stagger: 0.05, y: 14 });
    ioStaggerUp(safeQueryAll(document, '.f10-timeline-item'), { duration: 0.65, stagger: 0.08, y: 18 });

    // Pricing / roadmap / faq / resources / changelog / 404
    ioStaggerUp(safeQueryAll(document, '.f8-pricing .sv-card--elevated'), { duration: 0.7, stagger: 0.09, y: 22 });
    ioStaggerUp(safeQueryAll(document, '.pricing-trust-pill'), { duration: 0.45, stagger: 0.03, y: 8 });
    ioStaggerUp(safeQueryAll(document, '.f10-kanban-col'), { duration: 0.65, stagger: 0.1, y: 20 });
    safeQueryAll(document, '.f10-kanban-col').forEach(function (col) {
      ioStaggerUp(safeQueryAll(col, '.f10-kanban-card'), { duration: 0.5, stagger: 0.05, y: 12 });
    });
    ioStaggerUp(safeQueryAll(document, '.roadmap-milestone, .ca-roadmap-card'), { duration: 0.6, stagger: 0.07, y: 16 });
    ioStaggerUp(safeQueryAll(document, '.faq-group'), { duration: 0.6, stagger: 0.07, y: 18 });
    ioStaggerUp(safeQueryAll(document, '.faq-catnav .faq-chip'), { duration: 0.4, stagger: 0.03, y: 8 });
    ioStaggerUp(safeQueryAll(document, '.resources-grid > .sv-card, .resources-grid > *'), { duration: 0.55, stagger: 0.06, y: 16 });
    ioStaggerUp(safeQueryAll(document, '.changelog-entry'), { duration: 0.5, stagger: 0.05, y: 14 });
    ioStaggerUp(safeQueryAll(document, '.nf-pill-row .nf-pill'), { duration: 0.4, stagger: 0.04, y: 10 });

    // Tools / methodology
    ioStaggerUp(safeQueryAll(document, '.hw-grid > .hw'), { duration: 0.6, stagger: 0.07, y: 16 });
    ioStaggerUp(safeQueryAll(document, '.f10-workflow-step'), { duration: 0.6, stagger: 0.09, y: 16 });
    ioScaleIn(document.querySelector('.tool-methodology-toc'), { fromScale: 1, y: 12, duration: 0.6 });

    // Intel / methodology
    ioStaggerUp(safeQueryAll(document, '.intel-rail .rail-card, .rail-card'), { duration: 0.6, stagger: 0.07, y: 16 });
    ioStaggerUp(safeQueryAll(document, '.timeline-entry'), { duration: 0.55, stagger: 0.06, y: 14 });
    ioStaggerUp(safeQueryAll(document, '.tool-methodology-body pre, .priv-prose pre, .sec-prose pre, .article-body pre'), { duration: 0.5, stagger: 0, y: 12 });

    // Glossary
    ioStaggerUp(safeQueryAll(document, '.f8-glossary .sv-card, .f8-glossary-term .sv-card'), { duration: 0.55, stagger: 0.06, y: 14 });
    ioStaggerUp(safeQueryAll(document, '.gloss-list-item'), { duration: 0.45, stagger: 0.04, y: 10 });

    // Blog
    ioStaggerUp(safeQueryAll(document, '.article-grid > .article-card'), { duration: 0.55, stagger: 0.06, y: 16 });
    ioStaggerUp(safeQueryAll(document, '.filter-pill'), { duration: 0.4, stagger: 0.03, y: 8 });
    ioStaggerUp(safeQueryAll(document, '.blog-stripe-related-grid > .blog-stripe-related-card, .article-related > *'), { duration: 0.6, stagger: 0.07, y: 16 });

    // Blog article paragraphs (per-paragraph subtle fade) — already pure-IO
    var blogProse = document.querySelector('.blog-stripe-prose, .article-body, .blog-stripe-body');
    if (blogProse && 'IntersectionObserver' in window) {
      var proseBlocks = safeQueryAll(blogProse, ':scope > p, :scope > h2, :scope > h3, :scope > ul, :scope > ol, :scope > blockquote, :scope > figure, :scope > .callout');
      if (proseBlocks.length) {
        proseBlocks.forEach(function (b) {
          b.style.opacity = '0';
          b.style.transform = 'translateY(14px)';
          b.style.transition = 'opacity 0.55s ease-out, transform 0.55s ease-out';
        });
        var ioBlog = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              ioBlog.unobserve(entry.target);
            }
          });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
        proseBlocks.forEach(function (b) { ioBlog.observe(b); });
      }
    }

    // Products hub
    ioStaggerUp(safeQueryAll(document, '.product-hub-card'), { duration: 0.7, stagger: 0.09, y: 22 });
  }

  function init() {
    var gsap = window.gsap;
    if (!gsap || !window.ScrollTrigger) {
      // No GSAP on this page — run the IntersectionObserver fallback so
      // legal/marketing/blog/glossary surfaces still animate consistently.
      runFallbackChoreography();
      return;
    }
    try { gsap.registerPlugin(window.ScrollTrigger); } catch (e) { /* already registered */ }

    /* ===========================
     * HOMEPAGE — index.html
     * =========================== */

    // Revenue Trinity — three "Protect / Comply / Win" cards
    var trinityCards = safeQueryAll(document, '.hp-jtbd-grid .hp-jtbd-path');
    if (trinityCards.length) {
      staggerUp(gsap, trinityCards, {
        trigger: '.hp-jtbd-grid',
        stagger: 0.1,
        duration: 0.75,
      });
    }

    // Sovereign Moat terminal — scale-in (it's a single block, treat as widget)
    var moatTerminal = document.querySelector('.hp-moat-terminal');
    if (moatTerminal) {
      scaleIn(gsap, moatTerminal, {
        trigger: '.hp-moat',
        start: 'top 78%',
        fromScale: 0.985,
        duration: 0.8,
      });
    }

    // Moat fineprint — fade-up just below
    var moatFineprint = document.querySelector('.hp-moat-fineprint');
    if (moatFineprint) {
      gsap.fromTo(
        moatFineprint,
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: EASE_OUT,
          delay: 0.15,
          scrollTrigger: {
            trigger: moatFineprint,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Stats grid (.sc cells) — stagger-up
    // sf23-counters owns numeric pulse; we only fade-in the cell.
    var statsCells = safeQueryAll(document, '.stats-grid .sc');
    if (statsCells.length) {
      staggerUp(gsap, statsCells, {
        trigger: '.stats-grid',
        stagger: 0.08,
        duration: 0.65,
      });
    }

    // Future-Proofing / "Why this work matters" teaser cards
    var matterSection = document.querySelector('section[aria-label="Why this work matters"]');
    if (matterSection) {
      var matterCards = safeQueryAll(matterSection, '.u-grid-3 > .sv-card');
      if (matterCards.length) {
        staggerUp(gsap, matterCards, {
          trigger: matterSection,
          stagger: 0.1,
          duration: 0.7,
        });
      }
    }

    // Sectors mini-grid stagger
    var sectorTiles = safeQueryAll(document, '.sectors-grid > *, .sector-grid > *');
    if (sectorTiles.length) {
      staggerUp(gsap, sectorTiles, {
        trigger: sectorTiles[0].parentElement,
        stagger: 0.05,
        duration: 0.55,
        y: 18,
      });
    }

    // Trust pillars (homepage trust section)
    var trustItems = safeQueryAll(document, '.trust .u-grid-3 > *, .trust .sv-card');
    if (trustItems.length) {
      staggerUp(gsap, trustItems, {
        trigger: '.trust',
        stagger: 0.08,
        duration: 0.7,
      });
    }

    // Final triple-CTA cards on homepage
    var tripleCards = safeQueryAll(document, '.triple-cta-section .triple-card');
    if (tripleCards.length) {
      staggerUp(gsap, tripleCards, {
        trigger: '.triple-cta-section',
        stagger: 0.1,
        duration: 0.7,
      });
    }

    // Homepage final CTA band — gentle scale-in
    var hpCtaBand = document.querySelector('.hp-cta-band');
    if (hpCtaBand) {
      scaleIn(gsap, hpCtaBand, {
        trigger: hpCtaBand,
        start: 'top 85%',
        fromScale: 0.985,
        y: 16,
        duration: 0.75,
      });
    }

    /* ===========================
     * PRODUCT PAGES (6 pages share these selectors)
     * =========================== */

    // 1) Hero dashboard widget — subtle scale 1.02 → 1.00 on load
    //    Targets: .product-mockup-widget (every product page),
    //             plus .hero-visual figure on pages without the widget.
    var heroWidget = document.querySelector('.product-mockup-widget');
    if (heroWidget) {
      gentleScaleOnLoad(gsap, heroWidget, {
        fromScale: 1.02,
        duration: 0.85,
        delay: 0.2,
      });
    } else {
      var heroVisual = document.querySelector('.hero-product .hero-visual');
      if (heroVisual) {
        gentleScaleOnLoad(gsap, heroVisual, {
          fromScale: 1.015,
          duration: 0.85,
          delay: 0.2,
        });
      }
    }

    // 2) Product walkthrough cards (SF21 grid)
    var walkthroughCards = safeQueryAll(document, '.pw-sf21-grid .pw-sf21-card');
    if (walkthroughCards.length) {
      staggerUp(gsap, walkthroughCards, {
        trigger: '.pw-sf21-grid',
        stagger: 0.1,
        duration: 0.7,
      });
    }

    // 3) Use-case / benefit / feature grids using .hw-grid > .sv-card
    //    Group by parent .hw-grid so each grid staggers independently.
    var hwGrids = safeQueryAll(document, '.hw-grid');
    hwGrids.forEach(function (grid) {
      var cards = safeQueryAll(grid, ':scope > .sv-card');
      if (cards.length) {
        staggerUp(gsap, cards, {
          trigger: grid,
          stagger: 0.08,
          duration: 0.65,
        });
      }
    });

    // 4) Related-product cards (cross-sell strip on product pages)
    var relatedCards = safeQueryAll(document, '[data-section="related"] .f10-related-card');
    if (relatedCards.length) {
      staggerUp(gsap, relatedCards, {
        trigger: relatedCards[0].parentElement,
        stagger: 0.08,
        duration: 0.65,
      });
    }

    // 5) Pricing-or-waitlist section — gentle slide-up of the inner card(s)
    var pricingSection = document.querySelector('[data-section="pricing-or-waitlist"]');
    if (pricingSection) {
      var pricingCards = safeQueryAll(pricingSection, '.sv-card, .pricing-card, .pricing-tier, .cta-band-inner');
      var pricingTargets = pricingCards.length ? pricingCards : [pricingSection.querySelector('.wrap') || pricingSection];
      pricingTargets = pricingTargets.filter(Boolean);
      if (pricingTargets.length) {
        gsap.fromTo(
          pricingTargets,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: EASE_SOFT,
            stagger: 0.09,
            scrollTrigger: {
              trigger: pricingSection,
              start: 'top 82%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    }

    // 6) Final CTA band on product pages — gentle scale-in
    //    Selector matches both class="cta-band" and data-section="cta-band".
    var ctaBands = safeQueryAll(document, 'section.cta-band, section[data-section="cta-band"]');
    ctaBands.forEach(function (band) {
      // Skip the homepage triple-CTA which we've already animated as cards.
      if (band.classList.contains('triple-cta-section')) return;
      scaleIn(gsap, band, {
        trigger: band,
        start: 'top 85%',
        fromScale: 0.99,
        y: 18,
        duration: 0.75,
      });
    });

    /* ===========================
     * LEGAL PAGES — privacy / terms / cookies / cookie-preferences / security
     * =========================== */

    // TOC sidebar — fade-in (privacy + terms)
    var legalToc = document.querySelector('.legal-toc');
    if (legalToc) {
      gsap.fromTo(
        legalToc,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: EASE_OUT,
          scrollTrigger: {
            trigger: legalToc,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // Long-form legal sections — stagger-up by section block.
    // Each `priv-article` / `priv-section` / `sec-prose > section` etc. animates as it scrolls in.
    var legalSections = safeQueryAll(document, '.priv-article, .priv-section, .sec-prose > section, .legal-content > section, .tool-methodology-body > section');
    legalSections.forEach(function (sec, i) {
      gsap.fromTo(
        sec,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: EASE_OUT,
          scrollTrigger: {
            trigger: sec,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* ===========================
     * CONTACT / PARTNERS / ABOUT pages
     * =========================== */

    // Contact form fields — gentle stagger inside the form
    var contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      var contactFields = safeQueryAll(contactForm, '.form-group, .form-field-floating, .ca-input, .form-consent-row');
      if (contactFields.length) {
        staggerUp(gsap, contactFields, {
          trigger: contactForm,
          stagger: 0.06,
          duration: 0.55,
          y: 16,
        });
      }
    }

    // Office grid (contact)
    var officeGrid = safeQueryAll(document, '.f10-office-grid-item');
    if (officeGrid.length) {
      staggerUp(gsap, officeGrid, {
        trigger: officeGrid[0].parentElement,
        stagger: 0.08,
        duration: 0.65,
      });
    }

    // Partner cards grid
    var partnerCards = safeQueryAll(document, '.partner-card');
    if (partnerCards.length) {
      staggerUp(gsap, partnerCards, {
        trigger: partnerCards[0].parentElement,
        stagger: 0.08,
        duration: 0.65,
      });
    }

    // Partner form fields
    var partnerForm = document.querySelector('.partner-form-stack');
    if (partnerForm) {
      var pFields = safeQueryAll(partnerForm, '.form-group, .form-field-floating, .partner-form-section');
      if (pFields.length) {
        staggerUp(gsap, pFields, {
          trigger: partnerForm,
          stagger: 0.06,
          duration: 0.55,
          y: 14,
        });
      }
    }

    // About page timeline items
    var aboutTimeline = safeQueryAll(document, '.f10-timeline-item');
    if (aboutTimeline.length) {
      staggerUp(gsap, aboutTimeline, {
        trigger: aboutTimeline[0].parentElement,
        stagger: 0.08,
        duration: 0.7,
      });
    }

    /* ===========================
     * PRICING / ROADMAP / FAQ / RESOURCES / CHANGELOG / 404
     * =========================== */

    // Pricing tier columns (sv-card with popular variant) — stagger-in
    // (only when no [data-section="pricing-or-waitlist"] already grabbed them)
    if (!pricingSection) {
      var pricingTiers = safeQueryAll(document, '.f8-page.f8-pricing .sv-card, body[class*="pricing"] .sv-card--elevated');
      if (pricingTiers.length) {
        staggerUp(gsap, pricingTiers, {
          trigger: pricingTiers[0].parentElement,
          stagger: 0.1,
          duration: 0.75,
          y: 24,
        });
      }
    }

    // Pricing trust pills row
    var trustPills = safeQueryAll(document, '.pricing-trust-pill');
    if (trustPills.length) {
      staggerUp(gsap, trustPills, {
        trigger: trustPills[0].parentElement,
        stagger: 0.04,
        duration: 0.5,
        y: 10,
      });
    }

    // Roadmap kanban columns
    var kanbanCols = safeQueryAll(document, '.f10-kanban-col');
    if (kanbanCols.length) {
      staggerUp(gsap, kanbanCols, {
        trigger: '.f10-kanban',
        stagger: 0.12,
        duration: 0.7,
        y: 22,
      });
    }

    // Roadmap kanban cards (per-column stagger)
    safeQueryAll(document, '.f10-kanban-col').forEach(function (col) {
      var cards = safeQueryAll(col, '.f10-kanban-card');
      if (cards.length) {
        staggerUp(gsap, cards, {
          trigger: col,
          stagger: 0.06,
          duration: 0.55,
          y: 14,
        });
      }
    });

    // Roadmap milestones
    var roadmapMilestones = safeQueryAll(document, '.roadmap-milestone, .ca-roadmap-card');
    if (roadmapMilestones.length) {
      staggerUp(gsap, roadmapMilestones, {
        trigger: roadmapMilestones[0].parentElement,
        stagger: 0.08,
        duration: 0.65,
      });
    }

    // FAQ accordion groups + chips
    var faqGroups = safeQueryAll(document, '.faq-group');
    if (faqGroups.length) {
      staggerUp(gsap, faqGroups, {
        trigger: faqGroups[0].parentElement,
        stagger: 0.08,
        duration: 0.65,
        y: 18,
      });
    }
    var faqChips = safeQueryAll(document, '.faq-catnav .faq-chip');
    if (faqChips.length) {
      staggerUp(gsap, faqChips, {
        trigger: '.faq-catnav',
        stagger: 0.04,
        duration: 0.4,
        y: 8,
      });
    }

    // Resources grid cards
    var resourcesCards = safeQueryAll(document, '.resources-grid > .sv-card, .resources-grid > *');
    if (resourcesCards.length) {
      staggerUp(gsap, resourcesCards, {
        trigger: '.resources-grid',
        stagger: 0.07,
        duration: 0.6,
      });
    }

    // Changelog entries
    var changelogEntries = safeQueryAll(document, '.changelog-entry');
    if (changelogEntries.length) {
      staggerUp(gsap, changelogEntries, {
        trigger: changelogEntries[0].parentElement,
        stagger: 0.06,
        duration: 0.55,
      });
    }

    // 404 popular pills row
    var nfPills = safeQueryAll(document, '.nf-pill-row .nf-pill');
    if (nfPills.length) {
      staggerUp(gsap, nfPills, {
        trigger: '.nf-pill-row',
        stagger: 0.05,
        duration: 0.45,
        y: 10,
      });
    }

    /* ===========================
     * TOOLS — index + 6 calculator pages + methodology pages
     * =========================== */

    // Tools index — .hw-grid > .hw cards
    var hwToolCards = safeQueryAll(document, '.hw-grid > .hw');
    if (hwToolCards.length) {
      staggerUp(gsap, hwToolCards, {
        trigger: '.hw-grid',
        stagger: 0.08,
        duration: 0.65,
      });
    }

    // Tool sub-page workflow diagram steps
    var workflowSteps = safeQueryAll(document, '.f10-workflow-step');
    if (workflowSteps.length) {
      staggerUp(gsap, workflowSteps, {
        trigger: '.f10-workflow-diagram',
        stagger: 0.1,
        duration: 0.65,
      });
    }

    // Tool result panels — fade-in when made visible (calculators often
    // toggle .is-visible / .is-active). Use a MutationObserver so the
    // panel animates the moment it transitions from hidden -> visible.
    var resultPanels = safeQueryAll(document, '[data-result-panel], .tool-result-panel, .calc-result, .calc-result-card');
    resultPanels.forEach(function (panel) {
      // If already visible, skip — let the page render naturally.
      if (panel.offsetParent === null) {
        var observed = false;
        var obs = new MutationObserver(function () {
          if (observed) return;
          if (panel.offsetParent !== null) {
            observed = true;
            scaleIn(gsap, panel, {
              trigger: panel,
              start: 'top 95%',
              fromScale: 0.985,
              y: 12,
              duration: 0.55,
            });
            obs.disconnect();
          }
        });
        obs.observe(panel, { attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
      }
    });

    // Methodology TOC + body sections
    var methodologyToc = document.querySelector('.tool-methodology-toc');
    if (methodologyToc) {
      gsap.fromTo(
        methodologyToc,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: EASE_OUT,
          scrollTrigger: {
            trigger: methodologyToc,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    /* ===========================
     * INTEL + METHODOLOGY pages (trackers + tool deep-dives)
     * =========================== */

    // Intel rail cards
    var railCards = safeQueryAll(document, '.intel-rail .rail-card, .rail-card');
    if (railCards.length) {
      staggerUp(gsap, railCards, {
        trigger: railCards[0].parentElement,
        stagger: 0.08,
        duration: 0.65,
      });
    }

    // Intel timeline entries
    var timelineEntries = safeQueryAll(document, '.timeline-entry');
    if (timelineEntries.length) {
      staggerUp(gsap, timelineEntries, {
        trigger: '.timeline',
        stagger: 0.07,
        duration: 0.6,
        y: 16,
      });
    }

    // Code / pre blocks (methodology pages) — fade-up
    var codeBlocks = safeQueryAll(document, '.tool-methodology-body pre, .priv-prose pre, .sec-prose pre, .article-body pre');
    codeBlocks.forEach(function (block) {
      gsap.fromTo(
        block,
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: EASE_OUT,
          scrollTrigger: {
            trigger: block,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    /* ===========================
     * GLOSSARY — index + 6 term pages
     * =========================== */

    // Term hero + lead card fade-in (gloss-card--lead) handled by hero already;
    // animate sub gloss cards as stagger.
    var glossCards = safeQueryAll(document, '.f8-glossary .sv-card, .f8-glossary-term .sv-card');
    if (glossCards.length) {
      staggerUp(gsap, glossCards, {
        trigger: glossCards[0].parentElement,
        stagger: 0.07,
        duration: 0.6,
      });
    }

    // Glossary related-terms list items
    var glossListItems = safeQueryAll(document, '.gloss-list-item');
    if (glossListItems.length) {
      staggerUp(gsap, glossListItems, {
        trigger: glossListItems[0].parentElement,
        stagger: 0.05,
        duration: 0.5,
        y: 12,
      });
    }

    /* ===========================
     * BLOG — index + 19 article pages
     * =========================== */

    // Blog index — article-card grid stagger
    var articleCards = safeQueryAll(document, '.article-grid > .article-card');
    if (articleCards.length) {
      staggerUp(gsap, articleCards, {
        trigger: '.article-grid',
        stagger: 0.07,
        duration: 0.6,
      });
    }

    // Blog index — filter pills
    var filterPills = safeQueryAll(document, '.filter-pill');
    if (filterPills.length) {
      staggerUp(gsap, filterPills, {
        trigger: '.filter-row',
        stagger: 0.04,
        duration: 0.4,
        y: 8,
      });
    }

    // Blog article hero — subtle scale-in
    var blogHero = document.querySelector('.blog-stripe-hero, .blog-hero');
    if (blogHero) {
      gentleScaleOnLoad(gsap, blogHero, {
        fromScale: 1.015,
        duration: 0.85,
        delay: 0.15,
      });
    }

    // Blog article paragraphs — perf-friendly IntersectionObserver fade
    // (NOT per-paragraph GSAP — too many elements).
    var blogProse = document.querySelector('.blog-stripe-prose, .article-body, .blog-stripe-body');
    if (blogProse && 'IntersectionObserver' in window) {
      // Target direct children that are paragraph-like blocks.
      var proseBlocks = safeQueryAll(blogProse, ':scope > p, :scope > h2, :scope > h3, :scope > ul, :scope > ol, :scope > blockquote, :scope > figure, :scope > .callout');
      if (proseBlocks.length) {
        proseBlocks.forEach(function (b) {
          b.style.opacity = '0';
          b.style.transform = 'translateY(14px)';
          b.style.transition = 'opacity 0.55s ease-out, transform 0.55s ease-out';
        });
        var ioBlog = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
              ioBlog.unobserve(entry.target);
            }
          });
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });
        proseBlocks.forEach(function (b) { ioBlog.observe(b); });
      }
    }

    // Blog related-posts grid (Stripe-style)
    var blogRelated = safeQueryAll(document, '.blog-stripe-related-grid > .blog-stripe-related-card, .article-related > *');
    if (blogRelated.length) {
      staggerUp(gsap, blogRelated, {
        trigger: blogRelated[0].parentElement,
        stagger: 0.08,
        duration: 0.65,
      });
    }

    /* ===========================
     * PRODUCTS HUB (products/index.html)
     * =========================== */

    var productHubCards = safeQueryAll(document, '.product-hub-card');
    if (productHubCards.length) {
      staggerUp(gsap, productHubCards, {
        trigger: productHubCards[0].parentElement,
        stagger: 0.1,
        duration: 0.75,
        y: 24,
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 120); });
  } else {
    setTimeout(init, 120);
  }
})();
