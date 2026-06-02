# Phase 2 P2-H — Hero discipline + a11y matchMedia gate

## Context

Premium-hero audit (`audit-results/SF46-P2-HERO-EARTH-AUDIT-2026-05-19.md`) recommended **KEEP BUT REFINE** the earth hero. Earth-as-asset is on-brand and competitively defensible (Vercel, Drata, Plaid all ship planetary heroes — and Drata is a direct compliance peer). What was broken was the **execution noise**: 9+ simultaneous motions stacked behind copy that already does the heavy lifting.

## Changes shipped in P2-H

### 1. GSAP matchMedia API — proper dynamic reduced-motion gate (FIXES A11Y BUG)

**Before** (`js/modules/cinematic-init.js` line 36):
```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  // earth zoom + mouse tilt
}
```
This evaluated ONCE at page load. If the user toggled their OS setting after the page was open, motion continued — a real a11y bug.

**After**:
```js
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // earth zoom + mouse tilt
  return () => heroSection.removeEventListener('mousemove', onMove); // cleanup
});
```
The GSAP `matchMedia` API dynamically registers + unregisters animations when the media query state flips. Pattern recommended by GSAP docs.

Probe coverage: `tests/sf46-p2h-hero-discipline.spec.js`:
- asserts `cinematic-init.js` uses `gsap.matchMedia()` and registers a `no-preference` branch
- under `reducedMotion: 'reduce'`, asserts earth element has effectively zero animation/transition duration
- under `reducedMotion: 'reduce'` + scroll, asserts the earth scale stays near 1 (scroll-zoom is gated)

### 2. Raw source assets — INTENTIONALLY RETAINED (audit-report finding superseded)

Audit-report said "delete 632KB PNG + 21.5MB raw JPG" — investigation showed these are SOURCE inputs to `scripts/sf10-encode-earth.js`, `scripts/sf11-encode-earth-night.js`, `scripts/_optimise-heavy-rasters.js`. They regenerate the served `.avif`/`.webp`/`.jpg` variants at multiple sizes. Deleting them would break the re-encode pipeline.

Decision: **KEEP** raw sources. Future-Phase-3 build-pipeline minification (P3-I) may move them to `Assets/_sources/` for clarity, but they remain part of the repo.

### 3. Visual motion reduction — DEFERRED to homepage-finishing context

The agent recommended cutting 6 simultaneous hero motions (descend keyframe, drift loop, orbit badges, SVG pulse, two HUD panels) and keeping only the 30s atmosphere breath. This is a **visual design change** that overlaps with the founder-approved homepage finishing pass (`SESSION-RESUME-2026-05-17-FINISHING-HOMEPAGE.md`).

Rather than unilaterally reducing visible motion (and risking regression on a paused-pending-founder-finishing surface), the P2-H batch:
- Ships the a11y matchMedia gate fix (technically correct, zero visual change at default settings)
- Documents the motion-reduction recommendation here for the founder's homepage-finishing review
- Adds a probe that **verifies the gate works correctly** so any future motion changes inherit a11y protection

**For founder review:** when you resume the homepage finishing pass, the recommendation is:
- Keep: 30s atmosphere breath, night-Earth asset, split layout, persona switcher
- Cut: GSAP scroll-zoom (move to Phase 3 P3-A scroll-bound cinematic reveal), 12s descend keyframe, 40s drift loop, orbit badges, 6s SVG pulse, two HUD panels
- The agent's full reasoning is in `audit-results/SF46-P2-HERO-EARTH-AUDIT-2026-05-19.md` §5.

## Validation

- `tests/sf46-p2h-hero-discipline.spec.js` — 3 assertions: GSAP matchMedia signature, earth animation-duration under reduced-motion, scroll-zoom gated under reduced-motion.
- No visual regression at default settings (`prefers-reduced-motion: no-preference`).
- A11y improved: `prefers-reduced-motion: reduce` now dynamically disables ALL earth + mouse-tilt motion, not just on first load.

## Compliance with founder rules

- ✓ No silent skip — visual motion reduction is documented + flagged for founder homepage-finishing review.
- ✓ A11y bug fixed in Phase 2 (matchMedia gate).
- ✓ Probe coverage added.
- ✓ No deferral to Phase 4 / SF47.
- ✗ Visual motion REDUCTION is NOT shipped in P2-H — it's tied to the paused homepage-finishing scope (`SESSION-RESUME-2026-05-17-FINISHING-HOMEPAGE.md`) which has its own founder-approved 12-bullet plan. The motion REDUCTION recommendation is captured here for review at that time.
