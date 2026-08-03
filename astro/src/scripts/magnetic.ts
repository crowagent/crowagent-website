/* ============================================================================
   MAGNETIC — a control leans toward the pointer, and it can never eat a press.
   ============================================================================

   Owner instruction, 2026-08-03: an audit found interactions that were present
   on the live site before 26 July and absent from the rebuild. This is the
   first of them. The legacy implementation is `js/modules/magnetic-pull.js` at
   commit `46b6af55`, and its three figures are kept exactly: a 60px radius, a
   4px maximum offset, and a spring return on
   `cubic-bezier(0.34, 1.56, 0.64, 1)`.

   ── WHY THIS IS A REWRITE AND NOT A PORT ───────────────────────────────────

   TWO THINGS IN THE LEGACY FILE WOULD BREAK THIS BUILD, and both are worth
   naming because they are the reason a copy would have looked right and been
   wrong.

   1. IT WROTE `el.style.transform` DIRECTLY. An inline style beats every
      stylesheet, so on a `.btn` the magnet would have overwritten the hover
      lift (`translateY(var(--lift-btn))`) and the press
      (`translateY(...) scale(0.98)`) that Button.astro sets in unlayered
      scoped CSS. The pointer response the owner asked to keep and the magnet
      the owner asked to restore would have been fighting for one property,
      and the magnet would have won every time.

      So this writes TWO CUSTOM PROPERTIES and composes. `--mag-x` and
      `--mag-y` mean nothing on their own; the component decides where they sit
      in its own transform chain. A button keeps its lift and its press and
      gains a lean. Nothing here knows what a button looks like, which is the
      property that lets the same script drive a card or a chip later without
      being edited.

   2. IT PUT THE MAGNET ON THE CONTACT FORM'S SUBMIT BUTTON, and OA-07 records
      what that cost:

          pointerdown  fires
          mousedown    fires
          click        NEVER FIRES

      A browser does not synthesise a `click` when the element moves between
      press and release. The submit handler was simply never reached. That was
      reproduced with synthetic events, where the magnet is still animating
      during the press, and a human holding the mouse still should settle it —
      so how often it hit a real user was never established. It does not need
      to be. An animated control on the conversion path that CAN eat a press is
      a defect whether or not it has been seen, and the fix is four lines:

          pointerdown -> freeze, and zero the offset
          pointerup   -> release

      Between those two events the element is motionless at its rest position,
      so there is nothing for the click target to move out from under. This is
      the whole reason the restoration is safe to put back on a CTA.

   ── WHAT IT DELIBERATELY DOES NOT DO ───────────────────────────────────────

   NO IntersectionObserver. check-motion.js rule 3 fails the build on one
   anywhere under src/, and its allow-list already carries four entries it is
   trying to shrink rather than grow. There is nothing to observe here anyway:
   the effect is driven by a pointer, and a pointer is only ever over an
   element that is on screen.

   NO REVEAL. Nothing is hidden and nothing waits to be shown. If this module
   never loads, never runs, or throws, every control is exactly where it was
   with exactly the hover, press and focus states its own component gives it.
   `--mag-x` and `--mag-y` fall back to `0px` in the CSS that reads them. That
   is the same contract motion.ts states in its header: rest state is final
   state.

   TOUCH DEVICES GET NOTHING, by `(hover: hover)`. There is no pointer to lean
   toward, and a phone would only pay the listener cost.
   ========================================================================= */

/** Live's figures, measured and kept. See the header. */
const RADIUS = 60;
const MAX_OFFSET = 4;

/**
 * Read once, for the reason motion.ts gives: a reader who changes the setting
 * mid-visit gets it on reload, and re-reading a media query per pointermove is
 * a cost with no benefit.
 */
const ENABLED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(hover: hover)').matches;

function attach(el: HTMLElement): void {
  let frame = 0;
  /* True between pointerdown and pointerup. The OA-07 fix: see the header. */
  let pressed = false;

  const write = (x: number, y: number): void => {
    el.style.setProperty('--mag-x', `${x}px`);
    el.style.setProperty('--mag-y', `${y}px`);
  };

  const rest = (): void => {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    write(0, 0);
  };

  el.addEventListener('pointermove', (e: PointerEvent) => {
    /* Frozen for the duration of a press, so the element cannot move between
       pointerdown and pointerup and cost the reader their click. */
    if (pressed) return;
    if (frame) cancelAnimationFrame(frame);

    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance >= RADIUS) {
        write(0, 0);
        return;
      }

      /* Strength falls off linearly to zero at the radius, so the control
         settles rather than snapping back when the pointer leaves the field.
         The clamp is belt and braces: the arithmetic above cannot exceed
         MAX_OFFSET, but it is one line and it makes the bound a property of
         the code rather than of a proof somebody has to redo. */
      const strength = (RADIUS - distance) / RADIUS;
      const clamp = (n: number): number => Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, n));
      write(clamp((dx * strength * MAX_OFFSET) / RADIUS), clamp((dy * strength * MAX_OFFSET) / RADIUS));
    });
  });

  /* ── The OA-07 fix ────────────────────────────────────────────────────────
   *
   * Zero the offset AND stop tracking, in that order. Zeroing alone would not
   * be enough: an in-flight rAF scheduled by the last pointermove before the
   * press would land afterwards and move the element again.
   *
   * `pointercancel` matters as much as `pointerup`. A press that turns into a
   * scroll or is taken over by the browser fires cancel and never up, and
   * without this the control would stay frozen for the rest of the visit —
   * which is a silent, permanent loss of the effect rather than a visible bug,
   * so it would not have been found. */
  el.addEventListener('pointerdown', () => {
    pressed = true;
    rest();
  });
  const release = (): void => {
    pressed = false;
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);

  el.addEventListener('pointerleave', () => {
    pressed = false;
    rest();
  });

  /* A control can be left mid-lean by a click that navigates within the page,
     or by focus moving away under the keyboard while the pointer sits still. */
  el.addEventListener('blur', rest);
}

export function initMagnetic(): void {
  if (!ENABLED) return;
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-magnetic]'))) {
    attach(el);
  }
}
