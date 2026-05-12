// ── CROW-CAROUSEL — Stripe-style 10-10 (E-CAROUSEL-STRIPE) ──
// Replaces the prior init() implementation with a true class API
// (CrowCarousel) that mirrors the Stripe homepage carousel pattern:
//   • smooth fade + slight horizontal drift on slide change
//   • autoplay with rAF-driven progress bar on the active dot
//   • hover / focus / off-screen pause; reduced-motion → autoplay OFF
//   • autoplay timer resets on any user interaction (click / swipe / focus)
//   • lifecycle: pagehide tears down timers, listeners, and observer
//
// Markup contract (unchanged — see docs/templates/carousel.html):
//   <section class="crow-carousel"
//            data-autoplay="true"
//            data-interval="6500"
//            aria-roledescription="carousel"
//            aria-label="Product screenshots">
//     <div class="crow-carousel-viewport" aria-live="polite">
//       <div class="crow-carousel-track">
//         <div class="crow-carousel-slide is-active" role="group"
//              aria-roledescription="slide" aria-label="1 of N">…</div>
//         …
//       </div>
//     </div>
//     <div class="crow-carousel-controls">
//       <button class="crow-carousel-prev" aria-label="Previous slide">…</button>
//       <div class="crow-carousel-dots" role="tablist" aria-label="Slide selector">
//         <button role="tab" aria-selected="true" aria-label="Slide 1">…</button>
//         …
//       </div>
//       <button class="crow-carousel-next" aria-label="Next slide">…</button>
//       <button class="crow-carousel-pause" aria-label="Pause autoplay" aria-pressed="false">…</button>
//     </div>
//   </section>
//
// Stripe pattern references (researched 2026-05-10):
//   • https://stripe.com/             — fade + drift hero rotator
//   • https://stripe.com/payments     — 6-7 s rotation, easing
//                                        cubic-bezier(0.16, 1, 0.3, 1)
//   • https://stripe.com/atlas        — sticky-pinned section pattern
//   The cubic-bezier curve is exposed in our tokens as --ease-spring.
//
// Accessibility — preserved from the previous WAI-APG implementation:
//   - aria-roledescription="carousel" on the root
//   - aria-roledescription="slide" + aria-label="N of M" on each slide
//   - aria-live="polite" viewport so SR users hear slide changes
//   - dots are a tablist (Home / End / ArrowLeft / ArrowRight)
//   - prefers-reduced-motion: reduce → autoplay disabled, transitions instant,
//     progress bar locked at 100%
//   - autoplay pauses on hover, focus-within, and off-screen
//
// Memory hygiene:
//   - rAF + setInterval cleared on pagehide (DEF-043)
//   - IntersectionObserver disconnected on pagehide
//   - All event listeners stored on the instance for explicit teardown.

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var instances = [];

  /**
   * CrowCarousel — single carousel instance.
   * @param {HTMLElement} rootEl  the .crow-carousel section
   * @param {Object}      options optional overrides
   *   - autoplay   (bool, default true)
   *   - interval   (ms,   default 6500)
   *   - swipeThresh(px,   default 50)
   */
  function CrowCarousel(rootEl, options) {
    if (!rootEl) return;
    options = options || {};

    this.root = rootEl;
    this.slides = Array.prototype.slice.call(rootEl.querySelectorAll('.crow-carousel-slide'));
    if (this.slides.length < 2) return; // single-slide carousels need no controls

    this.dots = Array.prototype.slice.call(rootEl.querySelectorAll('.crow-carousel-dots [role="tab"]'));
    this.prevBtn = rootEl.querySelector('.crow-carousel-prev');
    this.nextBtn = rootEl.querySelector('.crow-carousel-next');
    this.pauseBtn = rootEl.querySelector('.crow-carousel-pause');
    this.track = rootEl.querySelector('.crow-carousel-track');

    var dataAutoplay = rootEl.getAttribute('data-autoplay') !== 'false';
    var dataInterval = parseInt(rootEl.getAttribute('data-interval'), 10);

    this.options = {
      autoplay: options.autoplay != null ? !!options.autoplay : dataAutoplay,
      interval: options.interval || (isFinite(dataInterval) && dataInterval > 0 ? dataInterval : 6500),
      swipeThresh: options.swipeThresh || 50,
    };

    // State
    this.currentIndex = 0;
    this.isPlaying = false;
    this.autoplayHandle = null;
    this.progressHandle = null;
    this.progressStart = 0;
    this.userPaused = false;     // pause-button toggle (sticky)
    this.hoverPaused = false;    // mouseover / focus-within (transient)
    this.offscreenPaused = false; // IntersectionObserver pause
    this.observer = null;

    // Bound handlers (so we can remove them on destroy)
    this._handlers = {};

    this._init();
  }

  CrowCarousel.prototype._init = function () {
    var self = this;

    // Set ARIA + visibility on slides up-front
    this._renderSlide(0, /*instant*/ true);

    // Dot click + keyboard
    this.dots.forEach(function (d, i) {
      var onClick = function () { self._userInteract(); self.goTo(i); };
      var onKey = function (e) {
        if (e.key === 'ArrowRight') {
          e.preventDefault(); self._userInteract();
          self.next(); self.dots[self.currentIndex].focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault(); self._userInteract();
          self.prev(); self.dots[self.currentIndex].focus();
        } else if (e.key === 'Home') {
          e.preventDefault(); self._userInteract();
          self.goTo(0); self.dots[0].focus();
        } else if (e.key === 'End') {
          e.preventDefault(); self._userInteract();
          self.goTo(self.slides.length - 1);
          self.dots[self.slides.length - 1].focus();
        }
      };
      d.addEventListener('click', onClick);
      d.addEventListener('keydown', onKey);
      self._handlers['dotClick' + i] = { el: d, evt: 'click', fn: onClick };
      self._handlers['dotKey' + i] = { el: d, evt: 'keydown', fn: onKey };
    });

    // Prev / Next
    if (this.prevBtn) {
      var onPrev = function () { self._userInteract(); self.prev(); };
      this.prevBtn.addEventListener('click', onPrev);
      this._handlers.prev = { el: this.prevBtn, evt: 'click', fn: onPrev };
    }
    if (this.nextBtn) {
      var onNext = function () { self._userInteract(); self.next(); };
      this.nextBtn.addEventListener('click', onNext);
      this._handlers.next = { el: this.nextBtn, evt: 'click', fn: onNext };
    }

    // Pause toggle
    if (this.pauseBtn) {
      var onPause = function () {
        self.userPaused = !self.userPaused;
        self.pauseBtn.setAttribute('aria-pressed', self.userPaused ? 'true' : 'false');
        self.pauseBtn.setAttribute('aria-label',
          self.userPaused ? 'Resume autoplay' : 'Pause autoplay');
        if (self.userPaused) self.pause();
        else self.play();
      };
      this.pauseBtn.addEventListener('click', onPause);
      this._handlers.pauseBtn = { el: this.pauseBtn, evt: 'click', fn: onPause };
    }

    // Hover / focus pause
    var onMouseEnter = function () { self.hoverPaused = true; self._stopTimers(); };
    var onMouseLeave = function () { self.hoverPaused = false; self._maybePlay(); };
    var onFocusIn = function () { self.hoverPaused = true; self._stopTimers(); };
    var onFocusOut = function (e) {
      if (!self.root.contains(e.relatedTarget)) {
        self.hoverPaused = false; self._maybePlay();
      }
    };
    this.root.addEventListener('mouseenter', onMouseEnter);
    this.root.addEventListener('mouseleave', onMouseLeave);
    this.root.addEventListener('focusin', onFocusIn);
    this.root.addEventListener('focusout', onFocusOut);
    this._handlers.hoverIn = { el: this.root, evt: 'mouseenter', fn: onMouseEnter };
    this._handlers.hoverOut = { el: this.root, evt: 'mouseleave', fn: onMouseLeave };
    this._handlers.focusIn = { el: this.root, evt: 'focusin', fn: onFocusIn };
    this._handlers.focusOut = { el: this.root, evt: 'focusout', fn: onFocusOut };

    // Touch swipe
    if (this.track) {
      var startX = 0;
      var onTouchStart = function (e) { startX = e.changedTouches[0].clientX; };
      var onTouchEnd = function (e) {
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < self.options.swipeThresh) return;
        self._userInteract();
        if (dx < 0) self.next(); else self.prev();
      };
      this.track.addEventListener('touchstart', onTouchStart, { passive: true });
      this.track.addEventListener('touchend', onTouchEnd, { passive: true });
      this._handlers.touchStart = { el: this.track, evt: 'touchstart', fn: onTouchStart };
      this._handlers.touchEnd = { el: this.track, evt: 'touchend', fn: onTouchEnd };
    }

    // Pause when off-screen (battery save)
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          self.offscreenPaused = !entry.isIntersecting;
          if (self.offscreenPaused) self._stopTimers();
          else self._maybePlay();
        });
      }, { threshold: 0.1 });
      this.observer.observe(this.root);
    }

    // Page lifecycle cleanup
    var onPageHide = function () { self.destroy(); };
    window.addEventListener('pagehide', onPageHide);
    this._handlers.pageHide = { el: window, evt: 'pagehide', fn: onPageHide };

    // Initial autoplay
    this._maybePlay();
  };

  // ── Public API ─────────────────────────────────────────────────────────

  CrowCarousel.prototype.play = function () {
    if (!this.options.autoplay || prefersReducedMotion) return;
    if (this.userPaused || this.hoverPaused || this.offscreenPaused) return;
    if (this.isPlaying) this._stopTimers();
    this.isPlaying = true;
    this._startProgress();
    var self = this;
    this.autoplayHandle = window.setTimeout(function () {
      self.next();
    }, this.options.interval);
  };

  CrowCarousel.prototype.pause = function () {
    this._stopTimers();
  };

  CrowCarousel.prototype.next = function () {
    this.goTo(this.currentIndex + 1);
  };

  CrowCarousel.prototype.prev = function () {
    this.goTo(this.currentIndex - 1);
  };

  CrowCarousel.prototype.goTo = function (idx) {
    var n = this.slides.length;
    if (idx < 0) idx = n - 1;
    if (idx >= n) idx = 0;
    this._renderSlide(idx, /*instant*/ false);
    this.currentIndex = idx;
    // Restart timer for the new slide (Stripe behaviour)
    this._stopTimers();
    this._maybePlay();
  };

  CrowCarousel.prototype.destroy = function () {
    this._stopTimers();
    if (this.observer) { this.observer.disconnect(); this.observer = null; }
    var keys = Object.keys(this._handlers);
    for (var i = 0; i < keys.length; i++) {
      var h = this._handlers[keys[i]];
      try { h.el.removeEventListener(h.evt, h.fn); } catch (e) { /* swallow during teardown */ }
    }
    this._handlers = {};
  };

  // ── Internals ──────────────────────────────────────────────────────────

  CrowCarousel.prototype._renderSlide = function (idx, instant) {
    this.slides.forEach(function (s, i) {
      var active = i === idx;
      s.classList.toggle('is-active', active);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    this.dots.forEach(function (d, i) {
      var active = i === idx;
      d.setAttribute('aria-selected', active ? 'true' : 'false');
      d.setAttribute('tabindex', active ? '0' : '-1');
      d.classList.toggle('is-active', active);
      // Reset progress var on the dot when (in)activated
      if (!active) d.style.setProperty('--progress', '0');
    });
    // The active dot's progress is driven by _startProgress
    if (instant) {
      var dot = this.dots[idx];
      if (dot) dot.style.setProperty('--progress', prefersReducedMotion ? '1' : '0');
    }
  };

  CrowCarousel.prototype._userInteract = function () {
    // Stripe pattern: any user interaction restarts the autoplay timer.
    this._stopTimers();
    // play() will be called by the goTo() that follows.
  };

  CrowCarousel.prototype._maybePlay = function () {
    if (!this.options.autoplay || prefersReducedMotion) {
      // In reduced-motion, lock progress at 100% so the active dot looks "complete"
      var activeDot = this.dots[this.currentIndex];
      if (activeDot && prefersReducedMotion) activeDot.style.setProperty('--progress', '1');
      return;
    }
    if (this.userPaused || this.hoverPaused || this.offscreenPaused) return;
    this.play();
  };

  CrowCarousel.prototype._startProgress = function () {
    var self = this;
    var dot = this.dots[this.currentIndex];
    if (!dot) return;
    this.progressStart = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    dot.style.setProperty('--progress', '0');
    var duration = this.options.interval;
    function tick() {
      if (!self.isPlaying) return;
      var now = (typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now();
      var pct = Math.min(1, (now - self.progressStart) / duration);
      dot.style.setProperty('--progress', String(pct));
      if (pct < 1 && self.isPlaying) {
        self.progressHandle = window.requestAnimationFrame(tick);
      }
    }
    this.progressHandle = window.requestAnimationFrame(tick);
  };

  CrowCarousel.prototype._stopTimers = function () {
    this.isPlaying = false;
    if (this.autoplayHandle) {
      // Defensive: the autoplay handle is a setTimeout id, but if a future
      // refactor swaps it for setInterval we still want a clean teardown.
      // Calling both clearTimeout AND clearInterval is safe because the two
      // share an integer-id namespace per HTML5 (per WHATWG timers spec).
      window.clearTimeout(this.autoplayHandle);
      window.clearInterval(this.autoplayHandle);
      this.autoplayHandle = null;
    }
    if (this.progressHandle) {
      if (window.cancelAnimationFrame) window.cancelAnimationFrame(this.progressHandle);
      this.progressHandle = null;
    }
  };

  // ── Boot ───────────────────────────────────────────────────────────────

  function boot() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('.crow-carousel'));
    roots.forEach(function (root) {
      var inst = new CrowCarousel(root);
      instances.push(inst);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose for tests / external triggers
  if (typeof window !== 'undefined') {
    window.CrowCarousel = CrowCarousel;
    window.__crowCarouselInstances = instances;
  }
})();
