/* ============================================================================
   MOTION — one trigger, and it can only ever ADD light.
   ============================================================================

   Implements the `Motion — Homepage` board in Figma `wJ9DK6ByFUN6rWe0CpCVPU`,
   page `139:2`. Frame `139:7` states five binding rules; frame `141:2` is the
   lighting rig. The two that shape this file:

     01  Rest state IS final state. Frame 00 of every section on that board is
         what ships with no JavaScript, and it is complete.
     02  Motion may only add light. No animated property may lower the opacity
         of anything that was already on screen.

   WHAT THIS REPLACES, AND WHY IT IS SO MUCH SMALLER
   -------------------------------------------------
   The previous version of this file carried four primitives — reveal, parallax,
   counter, magnetic — behind a `[data-motion]` attribute, a shared observer and
   a 2600ms failsafe timer. Not one line of it was ever imported by any page on
   the site. It was written against the legacy `sv-reveal` design, in which
   content started at `opacity: 0` and depended on an IntersectionObserver
   firing to become visible; a normal scroll of the legacy homepage left 4 of 9
   sections permanently invisible, and a full-page capture left 7 of 9.

   The failsafe timer was the right answer to the wrong shape. If content only
   ever starts CORRECT, there is nothing to fail safe to: the page is already
   there. So the reveal, parallax and counter primitives are gone rather than
   ported. `counter` in particular is a hazard on this page — MarketShape.astro
   forbids a count-up on the four figures by name, because the legacy build
   animated them from zero on scroll, which is the same hide-then-reveal
   pattern under a different name.

   WHAT IS LEFT IS ONE IDEA
   ------------------------
   An element that wants motion carries `data-lit`. When it comes into view,
   this sets `data-lit="on"` once and unobserves it. Every animation on this
   page is CSS keyed off `[data-lit='on']`. That means:

   AND THIS FILE DID NOT CHANGE WHEN THE PAGE STARTED LOOPING (2026-08-02).
   Worth stating, because "make every section play continuously" sounds like a
   scheduling problem and would be one in any design where JavaScript drives the
   frames. Here the attribute is a SWITCH, not a clock: it says the section is
   on screen, and CSS owns everything about what happens next — the cadence, the
   rest between passes, and whether a given animation repeats at all. The whole
   retiming to a shared beat, cycle and easing set happened in tokens.css and in
   seven @keyframes blocks. Not one line of TypeScript was involved, and that is
   the property to protect: the day this file needs to know how long a pass is
   is the day the page can break by failing to run.

     - If this module never loads, never runs, or throws, every section renders
       exactly as its Figma rest frame. Nothing is missing, because nothing was
       ever hidden.
     - There is no failsafe timer, because there is nothing to rescue.
     - Reduced motion is handled by returning before the observer is even
       built, so `data-lit` stays unset and no keyframe rule ever matches.
       Frame 00 is the reduced-motion state by construction, not by a second
       set of overrides that can drift from the first.

   The hero is deliberately NOT in here. Every section on the page loops now,
   but the hero is above the fold at every viewport, so asking an observer
   whether it is visible is a question with a known answer and a failure mode.
   Its key light and its ambient field are pure CSS, started at load, and its
   field opts into the shared entrance with `data-field="on"` rather than by
   being handed a `data-lit` it would never need.
   ========================================================================= */

/** Read once. A user who changes the setting mid-visit gets it on reload. */
const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const SELECTOR = '[data-lit]';

/**
 * Per-element threshold, from `data-lit-threshold`. The board specifies one
 * per section: numbers 0.35, lifecycle 0.4, both sides 0.35, reasoning trace
 * 0.15, final CTA 0.4. A section low on the page wants a higher threshold so
 * the light does not start while only its first 40px is showing; the reasoning
 * trace is tall, so 0.15 is most of a screen.
 *
 * One observer per distinct threshold, not one per element. IntersectionObserver
 * takes its thresholds at construction, so elements are grouped by the value
 * they asked for.
 */
function thresholdOf(el: HTMLElement): number {
  const raw = Number(el.dataset.litThreshold);
  return Number.isFinite(raw) && raw > 0 && raw <= 1 ? raw : 0.3;
}

/**
 * Light it. Idempotent: the attribute is the whole state, and CSS animations
 * keyed off it do not restart when it is set to the value it already holds.
 */
function light(el: HTMLElement): void {
  el.dataset.lit = 'on';
}

/* ============================================================================
   THE CURSOR LIGHT — the second half of lever 01, and the only thing on this
   page that JavaScript is allowed to be responsible for.
   ============================================================================

   specs/ULTRA-PREMIUM-GAP.md §4 lever 01 names it in one sentence: `pointermove`
   sets --mx / --my on the section, and a radial-gradient at those coordinates on
   a pointer-events: none overlay does the rest. That division is the point. This
   file writes two numbers; CSS decides what light means, how far it reaches, what
   colour it is and whether it exists at all. If the ratio ever inverts and this
   file starts deciding appearance, the page has acquired a way to break by
   failing to run.

   FOUR THINGS MAKE IT SAFE, AND ALL FOUR ARE HERE RATHER THAN ASSUMED.

     1. IT ADDS NOTHING WITHOUT JS. `.sv-spot` is `opacity: 0` and only
        `[data-spot='on']` lifts it, so a blocked or thrown module leaves the
        page exactly as it renders today. Nothing is hidden waiting for this.
     2. IT IS BEHIND EVERY WORD. The overlay is mounted inside each section's
        ambient wrapper, which sits at z-index -1 inside an isolated stacking
        context. Light can never land on the surface a word sits on.
     3. TOUCH NEVER GETS IT. `(hover: hover) and (pointer: fine)` is checked
        here as well as in the stylesheet, so a phone does not even register a
        listener, let alone latch a hover state after a tap.
     4. REDUCED MOTION NEVER GETS IT. A light that follows the pointer is
        motion whatever it is made of. Same early return as everything else.

   ONE rAF PER FRAME, NOT ONE WRITE PER EVENT. A pointermove fires far faster
   than the compositor draws; writing a custom property on every event queues
   style recalculations that are thrown away. The pending coordinates are stored
   and flushed once per frame, so the cost is one custom-property write per
   painted frame regardless of how fast the pointer moves.

   `pointerleave`, NOT `pointerout`. `pointerout` fires when the pointer crosses
   onto a CHILD element, which would strobe the light off and on across every
   card boundary in the section. */
function initSpotlight(): void {
  if (REDUCED) return;
  if (typeof window.matchMedia !== 'function') return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  for (const host of Array.from(document.querySelectorAll<HTMLElement>('[data-spot]'))) {
    let queued = false;
    let x = 50;
    let y = 50;

    const flush = () => {
      queued = false;
      // Two decimals. A raw percentage arrives as 48.61111111111111%, which is
      // a longer string to parse and re-serialise every frame for a difference
      // no display can resolve on a 420px gradient.
      host.style.setProperty('--mx', x.toFixed(2) + '%');
      host.style.setProperty('--my', y.toFixed(2) + '%');
    };

    host.addEventListener(
      'pointermove',
      (event) => {
        // A pen or a touch contact can reach a hover-capable device; only a
        // mouse gets the light, because only a mouse has a resting position.
        if (event.pointerType !== 'mouse') return;
        const box = host.getBoundingClientRect();
        if (!box.width || !box.height) return;
        x = ((event.clientX - box.left) / box.width) * 100;
        y = ((event.clientY - box.top) / box.height) * 100;
        if (host.dataset.spot !== 'on') host.dataset.spot = 'on';
        if (!queued) {
          queued = true;
          requestAnimationFrame(flush);
        }
      },
      { passive: true },
    );

    host.addEventListener(
      'pointerleave',
      () => {
        host.dataset.spot = 'off';
      },
      { passive: true },
    );
  }
}

export function initMotion(): void {
  // The cursor light is independent of the observer below: it has its own
  // guards, its own elements, and no section depends on it for correctness.
  initSpotlight();

  // Reduced motion, or a browser with no observer. Return before anything is
  // built. `data-lit` stays at its authored value, no keyframe rule matches,
  // and every section holds the finished state it painted at first render.
  // Nothing is resolved, hidden, faded or scheduled, because nothing needs to be.
  if (REDUCED || typeof IntersectionObserver !== 'function') return;

  const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
  if (!els.length) return;

  /** threshold -> the observer that watches at it. */
  const byThreshold = new Map<number, IntersectionObserver>();

  for (const el of els) {
    const t = thresholdOf(el);

    let io = byThreshold.get(t);
    if (!io) {
      io = new IntersectionObserver(
        (entries, self) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            light(entry.target as HTMLElement);
            // Unobserve, and it means something different now that the sections
            // loop. It is no longer what stops a section repeating — CSS
            // decides that — it is what stops a section RESTARTING. Leaving the
            // observer attached and toggling the attribute would reset every
            // animation in that section to frame zero each time it re-entered
            // the viewport, so a reader scrolling up and down would re-trigger
            // the one-shot beats (the drop at Ground, the cross, the refusal
            // glow) over and over. Those play once per page load, and this is
            // the line that makes "once" true.
            self.unobserve(entry.target);
          }
        },
        { threshold: t },
      );
      byThreshold.set(t, io);
    }

    io.observe(el);
  }
}
