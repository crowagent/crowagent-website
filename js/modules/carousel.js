// ── CROW-CAROUSEL — Stripe-style multi-screen autoplay (E-CAROUSEL-STRIPE) ──
// True multi-screen carousel with partial adjacent slide visibility,
// transform-based horizontal sliding, and a thin progress bar.
//
// Pattern: Stripe.com product showcase
//   - Adjacent slides peek from edges (multi-screen feel)
//   - Smooth transform-based sliding with cubic-bezier easing
//   - Thin progress bar fills during autoplay interval
//   - Pause on hover/focus/off-screen
//   - Touch/swipe support for mobile
//   - Reduced-motion: instant transitions, no autoplay
//
// Markup contract:
//   <section class="crow-carousel"
//            data-autoplay="true"
//            data-interval="6500"
//            aria-roledescription="carousel"
//            aria-label="Product screenshots">
//     <div class="crow-carousel-viewport" aria-live="polite">
//       <div class="crow-carousel-track">
//         <div class="crow-carousel-slide is-active" role="group"
//              aria-roledescription="slide" aria-label="1 of N">...</div>
//         ...
//       </div>
//     </div>
//     <div class="crow-carousel-progress-bar"><div class="crow-carousel-progress-fill"></div></div>
//     <div class="crow-carousel-controls">
//       <button class="crow-carousel-prev" aria-label="Previous slide">...</button>
//       <div class="crow-carousel-dots" role="tablist" aria-label="Slide selector">
//         <button role="tab" aria-selected="true" aria-label="Slide 1">...</button>
//         ...
//       </div>
//       <button class="crow-carousel-next" aria-label="Next slide">...</button>
//       <button class="crow-carousel-pause" aria-label="Pause autoplay" aria-pressed="false">...</button>
//     </div>
//   </section>
//
// Accessibility:
//   - aria-roledescription="carousel" on root
//   - aria-roledescription="slide" + aria-label="N of M" on each slide
//   - aria-live="polite" viewport
//   - dots are a tablist (Home/End/ArrowLeft/ArrowRight)
//   - prefers-reduced-motion: reduce -> autoplay disabled, transitions instant
//   - autoplay pauses on hover, focus-within, and off-screen

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var instances = [];

  /**
   * CrowCarousel - single carousel instance (multi-screen Stripe-style).
   * @param {HTMLElement} rootEl  the .crow-carousel section
   * @param {Object}      options optional overrides
   */
  function CrowCarousel(rootEl, options) {
    if (!rootEl) return;
    options = options || {};

    this.root = rootEl;
    this.slides = Array.prototype.slice.call(rootEl.querySelectorAll('.crow-carousel-slide'));
    if (this.slides.length < 2) return;

    this.dots = Array.prototype.slice.call(rootEl.querySelectorAll('.crow-carousel-dots [role="tab"]'));
    this.prevBtn = rootEl.querySelector('.crow-carousel-prev');
    this.nextBtn = rootEl.querySelector('.crow-carousel-next');
    this.pauseBtn = rootEl.querySelector('.crow-carousel-pause');
    this.track = rootEl.querySelector('.crow-carousel-track');
    this.viewport = rootEl.querySelector('.crow-carousel-viewport');

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
    this.userPaused = false;
    this.hoverPaused = false;
    this.offscreenPaused = false;
    this.observer = null;
    this.progressBar = null;
    this.progressFill = null;

    // Bound handlers
    this._handlers = {};

    this._init();
  }

  CrowCarousel.prototype._init = function () {
    var self = this;

    // Mark root as multi-screen mode
    this.root.classList.add('crow-carousel--multiscreen');

    // Inject progress bar if not present
    this._ensureProgressBar();

    // Set initial slide positions and ARIA
    this._renderSlide(0, true);

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
      var startY = 0;
      var isSwiping = false;
      var onTouchStart = function (e) {
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
        isSwiping = false;
      };
      var onTouchMove = function (e) {
        if (isSwiping) return;
        var dx = Math.abs(e.changedTouches[0].clientX - startX);
        var dy = Math.abs(e.changedTouches[0].clientY - startY);
        // If horizontal movement dominates, prevent vertical scroll
        if (dx > dy && dx > 10) {
          isSwiping = true;
          e.preventDefault();
        }
      };
      var onTouchEnd = function (e) {
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) < self.options.swipeThresh) return;
        self._userInteract();
        if (dx < 0) self.next(); else self.prev();
      };
      this.track.addEventListener('touchstart', onTouchStart, { passive: true });
      this.track.addEventListener('touchmove', onTouchMove, { passive: false });
      this.track.addEventListener('touchend', onTouchEnd, { passive: true });
      this._handlers.touchStart = { el: this.track, evt: 'touchstart', fn: onTouchStart };
      this._handlers.touchMove = { el: this.track, evt: 'touchmove', fn: onTouchMove };
      this._handlers.touchEnd = { el: this.track, evt: 'touchend', fn: onTouchEnd };
    }

    // Pause when off-screen
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

  // ── Progress bar ───────────────────────────────────────────────────────

  CrowCarousel.prototype._ensureProgressBar = function () {
    var existing = this.root.querySelector('.crow-carousel-progress-bar');
    if (existing) {
      this.progressBar = existing;
      this.progressFill = existing.querySelector('.crow-carousel-progress-fill');
    } else {
      // Create and inject progress bar after viewport
      this.progressBar = document.createElement('div');
      this.progressBar.className = 'crow-carousel-progress-bar';
      this.progressBar.setAttribute('role', 'progressbar');
      this.progressBar.setAttribute('aria-valuemin', '0');
      this.progressBar.setAttribute('aria-valuemax', '100');
      this.progressBar.setAttribute('aria-valuenow', '0');
      this.progressBar.setAttribute('aria-label', 'Slide timer');

      this.progressFill = document.createElement('div');
      this.progressFill.className = 'crow-carousel-progress-fill';
      this.progressBar.appendChild(this.progressFill);

      // Insert after viewport, before controls
      var controls = this.root.querySelector('.crow-carousel-controls');
      if (controls) {
        this.root.insertBefore(this.progressBar, controls);
      } else {
        this.root.appendChild(this.progressBar);
      }
    }
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
    this._renderSlide(idx, false);
    this.currentIndex = idx;
    this._stopTimers();
    this._maybePlay();
  };

  CrowCarousel.prototype.destroy = function () {
    this._stopTimers();
    if (this.observer) { this.observer.disconnect(); this.observer = null; }
    var keys = Object.keys(this._handlers);
    for (var i = 0; i < keys.length; i++) {
      var h = this._handlers[keys[i]];
      try { h.el.removeEventListener(h.evt, h.fn); } catch (e) { /* swallow */ }
    }
    this._handlers = {};
  };

  // ── Internals ──────────────────────────────────────────────────────────

  CrowCarousel.prototype._renderSlide = function (idx, instant) {
    var self = this;

    // Move the track via transform (multi-screen sliding)
    // Each slide occupies a percentage of the track width
    // The track translateX shifts to center the active slide
    var offset = -idx * 100;
    if (this.track) {
      if (instant || prefersReducedMotion) {
        this.track.style.transition = 'none';
        this.track.style.transform = 'translateX(' + offset + '%)';
        // Force reflow then restore transition
        void this.track.offsetHeight;
        if (!prefersReducedMotion) {
          this.track.style.transition = '';
        }
      } else {
        this.track.style.transition = '';
        this.track.style.transform = 'translateX(' + offset + '%)';
      }
    }

    // Update ARIA and active states
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
      if (!active) d.style.setProperty('--progress', '0');
    });

    if (instant) {
      var dot = this.dots[idx];
      if (dot) dot.style.setProperty('--progress', prefersReducedMotion ? '1' : '0');
    }
  };

  CrowCarousel.prototype._userInteract = function () {
    this._stopTimers();
  };

  CrowCarousel.prototype._maybePlay = function () {
    if (!this.options.autoplay || prefersReducedMotion) {
      var activeDot = this.dots[this.currentIndex];
      if (activeDot && prefersReducedMotion) activeDot.style.setProperty('--progress', '1');
      // Hide progress bar in reduced motion
      if (this.progressFill) this.progressFill.style.width = '0%';
      return;
    }
    if (this.userPaused || this.hoverPaused || this.offscreenPaused) return;
    this.play();
  };

  CrowCarousel.prototype._startProgress = function () {
    var self = this;
    var dot = this.dots[this.currentIndex];
    if (dot) dot.style.setProperty('--progress', '0');

    // Reset progress bar fill
    if (this.progressFill) {
      this.progressFill.style.transition = 'none';
      this.progressFill.style.width = '0%';
      void this.progressFill.offsetHeight; // force reflow
      this.progressFill.style.transition = 'width ' + this.options.interval + 'ms linear';
      this.progressFill.style.width = '100%';
    }

    this.progressStart = (typeof performance !== 'undefined' && performance.now)
      ? performance.now() : Date.now();
    var duration = this.options.interval;

    function tick() {
      if (!self.isPlaying) return;
      var now = (typeof performance !== 'undefined' && performance.now)
        ? performance.now() : Date.now();
      var pct = Math.min(1, (now - self.progressStart) / duration);
      if (dot) dot.style.setProperty('--progress', String(pct));
      if (self.progressBar) {
        self.progressBar.setAttribute('aria-valuenow', String(Math.round(pct * 100)));
      }
      if (pct < 1 && self.isPlaying) {
        self.progressHandle = window.requestAnimationFrame(tick);
      }
    }
    this.progressHandle = window.requestAnimationFrame(tick);
  };

  CrowCarousel.prototype._stopTimers = function () {
    this.isPlaying = false;
    if (this.autoplayHandle) {
      window.clearTimeout(this.autoplayHandle);
      window.clearInterval(this.autoplayHandle);
      this.autoplayHandle = null;
    }
    if (this.progressHandle) {
      if (window.cancelAnimationFrame) window.cancelAnimationFrame(this.progressHandle);
      this.progressHandle = null;
    }
    // Pause the progress bar fill at current position
    if (this.progressFill) {
      var computed = window.getComputedStyle(this.progressFill).width;
      this.progressFill.style.transition = 'none';
      this.progressFill.style.width = computed;
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
