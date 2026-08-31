/* ============================================================================
   CARD SPOTLIGHT: two numbers a frame, on one card, and never more than one.
   ============================================================================

   Owner request, 2026-08-30: a radial wash on `.surface` cards that tracks the
   pointer, plus a specular sheen on the 1px perimeter nearest to it.

   ── THIS IS NOT A SECOND CURSOR TRACKER, AND THE DISTINCTION MATTERS ────────

   `--mx` and `--my` already exist on this site. src/scripts/motion.ts owns the
   SECTION light: it writes those two properties on a `[data-spot]` ambient
   wrapper and styles/surfaces.css draws a 420px lamp at those coordinates on
   `.sv-spot`. That effect is OFF by owner decision of 2026-08-03 ("remove mouse
   focus light and keep mouse focus same as what we had"), and the call site in
   motion.ts stays commented out. Nothing here revives it.

   What is reused is the CONTRACT, not the application. Same two property names,
   same percentage units, same fallbacks, same four guards, same one-write-per
   -painted-frame discipline. A reader who has understood `.sv-spot` has already
   understood this file. The difference is only WHICH element carries the
   coordinates: a section there, the single hovered card here.

   ── WHY A CARD NEEDS ITS OWN COORDINATES AND CANNOT BORROW THE SECTION'S ────

   Custom properties inherit, so a `--mx` written on a section is readable by
   every card inside it. It is also WRONG inside every one of them, because it
   is a percentage of the SECTION box. A pointer at 50% of a 1232px section is
   at 616px, which on a 280px card three columns over is not 50% of anything.
   The light would sit at the same spot on all of them and would not move with
   the pointer, which is a worse result than no light at all: it reads as a
   rendering fault rather than as an effect.

   ── THE COST, WHICH IS THE PART THAT WAS ACTUALLY AT RISK ───────────────────

   The naive shape is a listener per card. This page has 24 cards and the site
   has around 200, so that is 200 listeners, 200 getBoundingClientRect calls
   competing for the same frame, and 200 custom-property writes each of which
   invalidates the style of a subtree. That is the version worth refusing.

   THIS IS O(1) IN THE NUMBER OF CARDS. One listener, on the document, and the
   work per painted frame is fixed no matter how many cards exist:

     one Element.closest walk  (a handful of parent hops, no selector matching
                                across the tree)
     one getBoundingClientRect (only when the card under the pointer CHANGES,
                                cached for every move within the same card)
     two setProperty calls     (on ONE element, the hovered one)

   `closest` also hands back the INNERMOST card for free, which is the rule
   styles/surfaces.css already states for the hover treatment: one surface
   answers a pointer at a time and it is the innermost one. No extra code says
   so here, because the DOM method already means it.

   ONE rAF PER FRAME, NOT ONE WRITE PER EVENT. A pointermove fires far faster
   than the compositor draws. The coordinates are stored and flushed once per
   frame, so a pointer thrown across the screen costs exactly what a slow one
   does. Measured on this machine with the effect on and off, the difference is
   reported in the task notes rather than asserted here.

   ── FOUR GUARDS, ALL OF THEM ALSO IN THE STYLESHEET ─────────────────────────

     1. NOTHING IS HIDDEN WAITING FOR THIS. The lamp is drawn by CSS off
        `:hover`, and `--mx` / `--my` fall back to `50% 50%`. If this module is
        blocked, throws, or simply never loads, a hovered card shows a centred
        lamp instead of a tracking one. The page is never wrong, only stiller.
     2. TOUCH NEVER GETS IT. `(hover: hover) and (pointer: fine)` is checked
        here as well as in the stylesheet, so a phone binds no listener at all.
     3. REDUCED MOTION NEVER GETS IT. A light that follows a pointer is motion
        whatever it is made of, and the stylesheet drops the whole rule under
        the preference so there is nothing left for these numbers to feed.
     4. MOUSE ONLY. A pen or a touch contact can reach a hover-capable device.
        Only a mouse has a resting position, so only a mouse gets the light.
   ========================================================================= */

/**
 * Read once. A reader who changes the setting mid-visit gets it on reload,
 * which is the rule motion.ts and magnetic.ts both already state.
 */
const ENABLED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** The same selector the card recipe in styles/surfaces.css is written against. */
const CARD = '.surface';

export function initCardSpotlight(): void {
  if (!ENABLED) return;

  /** The card the pointer is inside, or null. At most one, always. */
  let host: HTMLElement | null = null;
  /** That card's box, read once when the card changes rather than per move. */
  let box: DOMRect | null = null;
  let x = 50;
  let y = 50;
  let queued = false;

  /*
   * Two decimals is already past what any display can resolve on a 400px
   * gradient, so one is used. The string is built and parsed every frame and
   * the shorter one is cheaper for a difference nobody can see.
   */
  const flush = (): void => {
    queued = false;
    if (!host) return;
    host.style.setProperty('--mx', x.toFixed(1) + '%');
    host.style.setProperty('--my', y.toFixed(1) + '%');
  };

  /*
   * removeProperty rather than setting `50%`. The fallback in the stylesheet is
   * the one definition of where a lamp sits when nothing is tracking it, and
   * writing the number here would be a second copy of it that could drift. It
   * also leaves no inline style behind on a card the pointer has left.
   */
  const release = (): void => {
    if (!host) return;
    host.style.removeProperty('--mx');
    host.style.removeProperty('--my');
    host = null;
    box = null;
  };

  document.addEventListener(
    'pointermove',
    (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;

      const target = event.target;
      const card =
        target instanceof Element ? (target.closest(CARD) as HTMLElement | null) : null;

      if (card !== host) {
        release();
        host = card;
        box = null;
      }

      /*
       * Read the box on entry, and again only after a scroll has dropped it.
       * A card does not move under a pointer that is inside it, and the 2px
       * hover lift is a transform, which does not shift the layout box in any
       * way a 400px gradient could show. So this is one layout read per card
       * the pointer visits, not one per frame.
       */
      if (host && !box) box = host.getBoundingClientRect();

      if (!host || !box || !box.width || !box.height) return;

      x = ((event.clientX - box.left) / box.width) * 100;
      y = ((event.clientY - box.top) / box.height) * 100;

      if (!queued) {
        queued = true;
        requestAnimationFrame(flush);
      }
    },
    { passive: true },
  );

  /*
   * A pointer that leaves the window entirely fires no further pointermove, so
   * the last card would keep its inline coordinates. It is invisible (the lamp
   * is drawn off :hover, which is also gone) and it is still state nobody
   * cleared, so it is cleared.
   */
  document.addEventListener('pointerleave', release, { passive: true });

  /*
   * A scroll moves every card under a stationary pointer and fires no
   * pointermove, so the cached box goes stale and the lamp would sit at the
   * wrong place on the next move.
   *
   * THE HANDLER DROPS THE CACHE AND DOES NOT REFILL IT, WHICH IS THE WHOLE
   * POINT. Calling getBoundingClientRect here instead would force a synchronous
   * layout on every scroll event on every page of the site, which is a far
   * larger cost than the effect it serves and it would be paid by readers who
   * never hover anything. Nulling a variable costs nothing, nothing is drawn
   * until the pointer moves again, and the next pointermove re-reads the box
   * on the branch below that already exists for it.
   */
  window.addEventListener(
    'scroll',
    () => {
      box = null;
    },
    { passive: true },
  );
}
