/* ============================================================================
   ARRIVE: the fallback trigger for an engine with no view timeline.
   ============================================================================

   ── WHAT THIS IS FOR ────────────────────────────────────────────────────────

   styles/motion.css runs the site's two arrivals, the block and the card
   stagger inside it, on `animation-timeline: view()`. Chrome, Edge and Safari
   have it. Firefox Release does not: it is behind
   layout.css.scroll-driven-animations.enabled, so roughly a sixth of readers
   were getting the landing (which is an ordinary time based animation and runs
   everywhere) and nothing below the fold. The owner asked for that closed three
   times. §THE FALLBACK in styles/motion.css is the CSS half; this is the
   trigger.

   ── IT CANNOT LEAVE ANYTHING HIDDEN, AND THAT IS THE ONLY PROPERTY THAT
   ── ACTUALLY MATTERS HERE ───────────────────────────────────────────────────

   This exact pattern has shipped permanently invisible content on this site
   TWICE. `js/modules/sv-reveal.js` left 4 of 9 homepage sections invisible on a
   normal scroll and 7 of 9 in a full page capture. `sovereign-transformation-v2
   .js` reproduced it independently at 20/20 cards on /crowmark, 13/13 on
   /about and 9/9 on /contact. Two unrelated files, one failure, which makes it
   a property of the pattern rather than a bug in either.

   BOTH OF THEM HID CONTENT WITH A RULE AND THEN ASKED A CALLBACK TO UNDO IT.
   That is the shape this file does not have. It writes ONE attribute whose only
   effect is to name an animation. There is no `opacity: 0` anywhere for it to
   undo, so:

     - this module failing to load, throwing, being blocked by a CSP or being
       stripped by a proxy leaves every block fully opaque and untransformed
     - so does an observer that is constructed and never called
     - so does a print, a full page capture, a restored scroll position and an
       anchor jump, all of which are the cases a view timeline handles for free
       and a callback does not

   The worst outcome available to this file is a page that does not move. That
   is a worse arrival and it is not a worse page.

   ── WHY IT IS A SEPARATE MODULE RATHER THAN PART OF motion.ts ───────────────

   `scripts/motion.ts` is imported by src/pages/index.astro alone. It owns the
   `data-lit` trigger for the homepage's ambient light rig and the (currently
   switched off) cursor light, and its own header explains why booting it on 43
   routes is a motion decision rather than a payload one. The arrival is
   sitewide, so putting this inside it would either leave 42 routes uncovered or
   drag the light rig onto all of them. It goes through `scripts/shell.ts`, the
   one entry every route already carries, so it costs no extra request and is
   served from cache from the second page a reader opens.

   ── THREE GUARDS, IN THE ORDER THEY RETURN ─────────────────────────────────

   1. REDUCED MOTION. Read once, from the same media query the stylesheet uses.
      A user who changes the setting mid-visit gets it on reload. Returning here
      means the attribute is never written, so no rule matches and the reduced
      motion contract in motion.css has nothing to undo.

   2. THE ENGINE IS NOT ON THE FALLBACK BRANCH. This is NOT a second feature
      test. §THE FALLBACK in styles/motion.css sets `--arrive-fallback` on
      :root inside its own `@supports not (...)`, and this reads it, so the
      stylesheet is the only thing on the site that decides which branch a
      browser is on and the script cannot answer differently. On Chrome, Edge
      and Safari the property is empty, this returns, and nothing is observed:
      the browsers that carry the real arrival pay one getComputedStyle for
      this file and no observers. If Firefox ships view timelines unflagged,
      the property stops being set everywhere, this returns everywhere, and
      this file plus §THE FALLBACK can be deleted in one commit.

      A SECOND TEST WOULD ALSO HAVE PUT A TIMELINE FUNCTION IN A FILE THAT IS
      NOT motion.css, which scripts/check-motion.js rule 1 forbids and caught
      on the first run of this file. The rule was right: to a text scanner a
      feature test and a second scroll-driven system look identical, and the
      way to satisfy it was to stop asking the question twice.

   3. NO OBSERVER. Same early return `motion.ts` makes.

   ── THE FIRST CALLBACK IS NOT AN ARRIVAL ────────────────────────────────────

   An IntersectionObserver reports on everything it is given, so the first
   callback carries every element that is already on screen at load. Those
   elements were never off screen, and animating them would be a second landing
   fighting the one §THE LANDING already runs. They are marked `settled`, which
   is a value no rule matches, and unobserved. Everything after the first
   callback is a genuine arrival and is marked `on`.

   If the initial records ever arrive split across two callbacks, an above the
   fold card animates in once at load. That is the failure direction to be on:
   it is the arrival happening where it was not wanted, not content waiting for
   a callback.
   ========================================================================= */

/** Read once, like motion.ts. */
const REDUCED =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * The two selectors of §THE FALLBACK in styles/motion.css, minus the attribute
 * that rule adds, because this is what WRITES that attribute.
 *
 * THIS IS A SECOND COPY AND IT IS NAMED RATHER THAN HIDDEN. The stylesheet
 * carries the same two selectors and the note there records the pairing. The
 * duplication is bounded in the one direction that matters: a disagreement
 * makes an element that does not move, never an element that cannot be read.
 * Both are checked against the built page rather than assumed.
 */
const ITEMS = 'main :is(.surface, figure)';
const BLOCKS =
  'main > *:not(script, style, template):not(:only-child):not(:first-child),' +
  'main > *:only-child > *:not(script, style, template):not(:first-child)';

/**
 * One observer over both sets.
 *
 * 0.01 RATHER THAN A REAL THRESHOLD, AND THE REASON IS THE OPPOSITE OF
 * motion.ts's. That file's per section thresholds exist so a light rig does not
 * start while 40px of a tall section is showing. Here the animation IS the
 * arrival, so it has to start as the block crosses the fold rather than once a
 * third of it is up: a section taller than the viewport never reaches 0.35 at
 * all, and asking for it would be the one way this file could fail to fire on
 * exactly the biggest blocks on the site.
 */
export function initArrive(): void {
  if (REDUCED) return;
  if (typeof getComputedStyle !== 'function') return;
  /* Empty on every engine where §THE FALLBACK is not generated, which is every
     engine that runs the arrival on geometry. Trimmed because a custom property
     value keeps the whitespace it was written with. */
  if (!getComputedStyle(document.documentElement).getPropertyValue('--arrive-fallback').trim()) return;
  if (typeof IntersectionObserver !== 'function') return;

  const els = Array.from(document.querySelectorAll<HTMLElement>(`${ITEMS},${BLOCKS}`));
  if (!els.length) return;

  let armed = false;

  const io = new IntersectionObserver(
    (entries, self) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.dataset.arrived = armed ? 'on' : 'settled';
        self.unobserve(el);
      }
      armed = true;
    },
    { threshold: 0.01 },
  );

  for (const el of els) io.observe(el);
}
