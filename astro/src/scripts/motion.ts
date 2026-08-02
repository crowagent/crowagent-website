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

     - If this module never loads, never runs, or throws, every section renders
       exactly as its Figma rest frame. Nothing is missing, because nothing was
       ever hidden.
     - There is no failsafe timer, because there is nothing to rescue.
     - Reduced motion is handled by returning before the observer is even
       built, so `data-lit` stays unset and no keyframe rule ever matches.
       Frame 00 is the reduced-motion state by construction, not by a second
       set of overrides that can drift from the first.

   The hero is deliberately NOT in here. Its key light is the only thing on the
   page that loops, and it is pure CSS inside a clipped 2px rail, so it needs no
   observer and no trigger at all.
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

export function initMotion(): void {
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
            // ONCE, per the board: "PLAYS ONCE per page load". Unobserving is
            // what makes that true across a scroll back up the page, and it is
            // also why a section next to prose never becomes a loop the reader
            // has to read around.
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
