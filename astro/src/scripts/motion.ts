/* ============================================================================
   MOTION — one system, six primitives.
   ============================================================================

   Replaces seven overlapping systems in the legacy tree: sv-reveal,
   reveal-failsafe, section-motion-choreography, sticky-storytelling,
   section-parallax, hero-parallax and magnetic-pull.

   THE DEFECT THIS EXISTS TO PREVENT
   ---------------------------------
   sv-reveal.js was injected on every page by the nav. It stamped `.sv-reveal`
   on every `main > section`, and a stylesheet rule set
   `html.js-sv-reveal .sv-reveal { opacity: 0 }`. Content therefore started
   INVISIBLE and depended on an IntersectionObserver firing to become visible.
   When the observer did not fire, the content was simply gone. Measured on the
   homepage: a normal scroll of the whole page left 4 of 9 sections permanently
   invisible; a full-page capture left 7 of 9.

   An observer fails to fire more often than it looks. All of these are real:
     - a full-page screenshot, which resizes the viewport in one step
     - an anchor jump straight past an element
     - a restored scroll position on reload
     - printing
     - any element already on screen at load, in some browsers
     - the element being inside a container that never scrolls

   THE RULES, WHICH ARE NOT NEGOTIABLE
   -----------------------------------
   1. Content is VISIBLE BY DEFAULT. Motion is applied by removing a class, not
      by adding visibility. If every line of this file fails to run, the page
      still reads correctly. That is the inverse of the legacy design and it is
      the whole point.
   2. Every primitive has a timed failsafe that resolves it to the final state
      regardless of the observer.
   3. ONE observer, shared. Not one per module.
   4. prefers-reduced-motion RESOLVES elements to their final state. It never
      leaves them mid-animation and never hides them.
   5. Only `transform` and `opacity` are animated, so everything stays on the
      compositor.
   ========================================================================= */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Everything is resolved by this deadline whatever else happened. */
const FAILSAFE_MS = 2600;

type Primitive = 'reveal' | 'parallax' | 'sticky' | 'counter' | 'magnetic' | 'sequence';

const SELECTOR = '[data-motion]';

/** Resolve an element to its finished state. Idempotent and always safe. */
function resolve(el: HTMLElement): void {
  el.dataset.motionState = 'in';
  el.style.removeProperty('--motion-progress');
}

/* ── The single shared observer ──────────────────────────────────────────── */

let observer: IntersectionObserver | null = null;

function observeAll(): void {
  const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  if (!els.length) return;

  // Reduced motion, or no observer support: resolve immediately. Never leave
  // the caller waiting for an animation that is not going to run.
  if (REDUCED || typeof IntersectionObserver === 'undefined') {
    els.forEach(resolve);
    return;
  }

  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        resolve(entry.target as HTMLElement);
        observer!.unobserve(entry.target);
      }
    },
    // A generous bottom margin so an element resolves slightly before it is
    // scrolled to, rather than visibly popping once it is already on screen.
    { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
  );

  els.forEach((el) => observer!.observe(el));

  // THE FAILSAFE. Whatever the observer did or did not do, everything is
  // resolved by now. This single timer is what makes the invisible-section
  // class of bug impossible rather than merely unlikely.
  window.setTimeout(() => els.forEach(resolve), FAILSAFE_MS);
}

/* ── Parallax and sequence, driven by one rAF loop ───────────────────────── */

const scrollDriven: { el: HTMLElement; speed: number }[] = [];
let ticking = false;

function onScroll(): void {
  if (ticking || REDUCED) return;
  ticking = true;
  requestAnimationFrame(() => {
    const vh = window.innerHeight;
    for (const { el, speed } of scrollDriven) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;
      // -1..1 across the viewport, so 0 is dead centre.
      const p = (r.top + r.height / 2 - vh / 2) / (vh / 2);
      el.style.setProperty('--motion-progress', p.toFixed(4));
      el.style.transform = `translate3d(0, ${(p * speed).toFixed(2)}px, 0)`;
    }
    ticking = false;
  });
}

/* ── Counter ─────────────────────────────────────────────────────────────── */

function runCounter(el: HTMLElement): void {
  const to = Number(el.dataset.motionTo ?? '0');
  const dp = Number(el.dataset.motionDecimals ?? '0');
  const fmt = new Intl.NumberFormat('en-GB', {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });

  // Reduced motion still gets the NUMBER, just not the count. Skipping the
  // final assignment would leave the tile blank, which is a content defect
  // dressed up as an accessibility feature.
  if (REDUCED) {
    el.textContent = fmt.format(to);
    return;
  }

  const dur = Number(el.dataset.motionDuration ?? '1400');
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / dur);
    // easeOutExpo, matching --ease closely enough to feel like one system.
    const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    el.textContent = fmt.format(to * eased);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ── Magnetic ────────────────────────────────────────────────────────────── */

function wireMagnetic(el: HTMLElement): void {
  if (REDUCED || !window.matchMedia('(hover: hover)').matches) return;
  const strength = Number(el.dataset.motionStrength ?? '0.28');
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) * strength;
    const y = (e.clientY - (r.top + r.height / 2)) * strength;
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
  });
  el.addEventListener('pointerleave', () => {
    el.style.transform = '';
  });
}

/* ── Boot ────────────────────────────────────────────────────────────────── */

export function initMotion(): void {
  observeAll();

  for (const el of document.querySelectorAll<HTMLElement>(SELECTOR)) {
    const kind = el.dataset.motion as Primitive;
    if (kind === 'parallax' || kind === 'sequence') {
      scrollDriven.push({ el, speed: Number(el.dataset.motionSpeed ?? '40') });
    } else if (kind === 'counter') {
      // Counters run once resolved, so the number animates when it is seen and
      // is still correct if it never was.
      const fire = () => runCounter(el);
      if (el.dataset.motionState === 'in') fire();
      else {
        const mo = new MutationObserver(() => {
          if (el.dataset.motionState === 'in') {
            fire();
            mo.disconnect();
          }
        });
        mo.observe(el, { attributes: true, attributeFilter: ['data-motion-state'] });
      }
    } else if (kind === 'magnetic') {
      wireMagnetic(el);
    }
  }

  if (scrollDriven.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  // Printing and anchor jumps both bypass scrolling entirely, so both resolve
  // everything up front rather than printing or landing on blank space.
  window.addEventListener('beforeprint', () =>
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach(resolve),
  );
  if (location.hash) {
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach(resolve);
  }
}
