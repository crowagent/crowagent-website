/* ============================================================================
   REEL: how far a block has travelled through the viewport, as one number.
   ============================================================================

   HOME 2.0, 2026-09-06. The five-stage rail used to draw itself on a view
   timeline and was barely noticed: the draw was over before the eye arrived.
   The owner asked for the section to be scrubbed by the scroll, cinematically.
   This file measures where a `[data-reel]` block sits in the viewport and
   writes ONE custom property on it, `--reel`, from 0 when its top crosses a
   line low in the viewport to 1 when it reaches a line high in it. CSS owns
   everything about what that number means: how far the rail has drawn, where
   the light head sits, which stages are lit and how brightly. If the ratio
   ever inverts and this file starts deciding appearance, the page has acquired
   a way to break by failing to run.

   ── IT CANNOT HIDE ANYTHING ────────────────────────────────────────────────

   The stylesheet declares `--reel: 1` at rest, which is the FINISHED drawing:
   rail drawn, every stage lit. This file only ever writes a value between 0
   and 1 while the block is in front of the reader, and it never writes at all
   under reduced motion or without a script. Its worst outcome is a rail that
   is already drawn when the reader reaches it.

   ── A SCROLL LISTENER, NOT AN OBSERVER ─────────────────────────────────────

   scripts/check-motion.js rule 3 forbids an IntersectionObserver anywhere under
   src/. This is a position, not a crossing: one passive listener, at most one
   rAF per painted frame, and one getBoundingClientRect per reel per frame.
   Same shape as scripts/story.ts.
   ========================================================================= */

const HOST = '[data-reel]';

/** The travel window, as fractions of the viewport height. The reel starts
    when the block's top crosses START and completes when it crosses END. */
const START = 0.88;
const END = 0.32;

export function initReel(): void {
  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hosts = Array.from(document.querySelectorAll<HTMLElement>(HOST));
  if (!hosts.length) return;

  let queued = false;

  const measure = () => {
    queued = false;
    const vh = window.innerHeight || 1;
    const from = vh * START;
    const to = vh * END;
    for (const host of hosts) {
      const box = host.getBoundingClientRect();
      /* A short block completes across the viewport window. A tall one, a
         stacked phone layout, completes across most of its own height, so its
         last stage lights as it arrives rather than a screen earlier. */
      const span = Math.max(from - to, box.height * 0.85);
      const raw = (from - box.top) / span;
      const reel = Math.min(1, Math.max(0, raw));
      host.style.setProperty('--reel', reel.toFixed(3));
      host.dataset.reel = 'on';
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(measure);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });

  /* THE FIRST MEASUREMENT IS SYNCHRONOUS, and the frame callback only
     coalesces the ones after it. MEASURED 2026-09-06: a tab whose
     visibilityState is `hidden` never runs a frame callback at all, so a first
     measurement scheduled through one leaves the page in its rest state until
     the reader looks at it. Rest is a complete page, so nothing was ever
     hidden; what was wrong is that a reader arriving mid-page saw the finished
     drawing rather than the drawing at their scroll position. */
  measure();
}
