/* ============================================================================
   STORY: which step of a sticky story is nearest the reader, as one attribute.
   ============================================================================

   HOME 2.0, 2026-09-05. The product section pins a device frame beside a
   column of five steps. As each step passes the middle of the viewport the
   frame shows that step's screen. This file decides WHICH step that is and
   writes it once, as `data-story-active` on the `[data-story]` host. CSS owns
   everything about what that means: which screen sits on top, how it wipes in,
   which step's rule is lit, which hotspot is shown. If the ratio ever inverts
   and this file starts deciding appearance, the page has acquired a way to
   break by failing to run.

   ── IT CANNOT HIDE ANYTHING ────────────────────────────────────────────────

   Every screen is painted at full opacity and stacked. Without this module the
   first screen sits on top and the section is complete: five steps of copy, one
   finished screen, and every banner reachable through its <details> in the
   step column. This file never sets an opacity, never adds a class, and never
   touches an element's style. Its worst outcome is a frame that does not
   change as the reader scrolls and hotspots that stay put.

   ── A SCROLL LISTENER, NOT AN OBSERVER ─────────────────────────────────────

   scripts/check-motion.js rule 3 forbids an IntersectionObserver anywhere under
   src/, and this is not the case the allow-list exists for: a story needs a
   CONTINUOUS answer (the step nearest the centre right now), which is a
   position, not a crossing. So it reads positions. One passive listener, one
   rAF per frame at most, and the geometry is five getBoundingClientRect calls
   per painted frame, on a section that exists once.

   ── THE HOTSPOTS MIRROR THE DISCLOSURES, THEY DO NOT REPLACE THEM ──────────

   Three screens carry a banner whose wording is the argument. Each step holds
   that wording in a <details>, which works with no script and is what a
   screen reader gets. The hotspot on the frame is a second handle on the same
   disclosure: pressing it opens or closes that <details> and shows a tooltip
   beside the marker that MIRRORS the text and is hidden from assistive
   technology, so nobody hears it twice. Escape closes an open one, and moving
   to another stage closes them all.
   ========================================================================= */

const HOST = '[data-story]';
const PIN = '[data-story-pin]';
const STEP = '[data-story-step]';
const DOT = '[data-story-dot]';
const PATH = '[data-story-path]';
const SPOT = '[data-story-spot-btn]';

export function initStory(): void {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>(HOST));
  if (!hosts.length) return;

  for (const host of hosts) {
    const steps = Array.from(host.querySelectorAll<HTMLElement>(STEP));
    if (!steps.length) continue;
    const pin = host.querySelector<HTMLElement>(PIN);
    const dots = Array.from(host.querySelectorAll<HTMLButtonElement>(DOT));
    const spots = Array.from(host.querySelectorAll<HTMLButtonElement>(SPOT));
    const path = host.querySelector<HTMLElement>(PATH);

    let active = -1;
    let queued = false;

    const disclosureOf = (spot: HTMLButtonElement): HTMLDetailsElement | null => {
      const id = spot.getAttribute('aria-controls');
      return id ? (document.getElementById(id) as HTMLDetailsElement | null) : null;
    };

    const setSpot = (spot: HTMLButtonElement, open: boolean) => {
      spot.setAttribute('aria-expanded', String(open));
      const details = disclosureOf(spot);
      if (details) details.open = open;
    };

    const closeSpots = () => {
      for (const spot of spots) setSpot(spot, false);
    };

    const apply = (index: number) => {
      if (index === active) return;
      active = index;
      host.dataset.storyActive = String(index);
      dots.forEach((dot, i) => dot.setAttribute('aria-current', i === index ? 'true' : 'false'));
      const label = steps[index]?.dataset.storyPath;
      if (path && label) path.textContent = label;
      closeSpots();
    };

    /* THE COLUMN'S REAL HEIGHT, PUBLISHED FOR THE STICKY OFFSET.
       The frame parks by centring the pinned column in the window, and the
       stylesheet cannot know how tall that column is: it is width-driven, so
       it is 509px at 1440 and 422px on a 1024 portrait tablet. Centring the
       CSS guess of 32rem left 288px above the frame and 700px of dead column
       below it at 1024x1366, measured 2026-09-07. So publish what it measures.

       Setting `top` cannot change the column's height, so observing the height
       and writing the offset is not a feedback loop. A ResizeObserver rather
       than a resize listener because the height also moves when a font loads
       or an image settles, with no window resize to hear. */
    const publishPinHeight = () => {
      if (!pin) return;
      const height = pin.getBoundingClientRect().height;
      if (height > 0) host.style.setProperty('--h2st-pin-h', `${Math.round(height)}px`);
    };

    if (pin && typeof ResizeObserver === 'function') {
      new ResizeObserver(publishPinHeight).observe(pin);
    }
    publishPinHeight();

    /* THE REFERENCE LINE. On a wide layout the frame sits beside the steps
       and the active step is the one nearest the middle of the viewport. On a
       stacked layout the frame is pinned ABOVE the steps and covers the top of
       the screen, so the middle of the viewport can sit under it and the
       active step's heading with it. There the reference is the middle of
       the band the reader can actually see, below the pinned frame. Stacked
       is measured, not assumed: the pin spans the host's width. */
    const reference = () => {
      const vh = window.innerHeight;
      if (!pin) return vh * 0.5;
      const pinBox = pin.getBoundingClientRect();
      const hostBox = host.getBoundingClientRect();
      const stacked = pinBox.width >= hostBox.width * 0.9;
      if (!stacked) return vh * 0.5;
      const bottom = Math.max(0, Math.min(vh, pinBox.bottom));
      return bottom + (vh - bottom) * 0.5;
    };

    const measure = () => {
      queued = false;
      const middle = reference();
      let best = 0;
      let bestDistance = Number.POSITIVE_INFINITY;
      steps.forEach((step, i) => {
        const box = step.getBoundingClientRect();
        const centre = box.top + box.height / 2;
        const distance = Math.abs(centre - middle);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      apply(best);
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    const reduce = () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        const step = steps[i];
        if (!step) return;
        step.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'center' });
      });
    });

    for (const spot of spots) {
      spot.addEventListener('click', () => {
        const open = spot.getAttribute('aria-expanded') !== 'true';
        closeSpots();
        setSpot(spot, open);
      });
      spot.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Escape') setSpot(spot, false);
      });
      /* The disclosure can be toggled from its own summary too. Keep the
         hotspot's state honest when it is. */
      const details = disclosureOf(spot);
      details?.addEventListener('toggle', () => {
        spot.setAttribute('aria-expanded', String(details.open));
      });
    }

    /* The first measurement is synchronous; the frame callback only coalesces
       the ones after it. MEASURED 2026-09-06: a tab whose visibilityState is
       `hidden` never runs a frame callback, so a story that measured only
       through one showed its first screen rather than the reader's. */
    measure();
  }
}
