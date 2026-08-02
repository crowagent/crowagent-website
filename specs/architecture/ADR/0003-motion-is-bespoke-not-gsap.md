# ADR 0003 — Motion is a bespoke module, not GSAP

**Status:** Accepted, superseding a line in MODERNISATION-ARCHITECTURE.md §2
**Date:** 2026-08-01

## The contradiction this resolves

`specs/MODERNISATION-ARCHITECTURE.md` §2 chose **GSAP + ScrollTrigger** and explicitly
rejected the alternative:

> **Bespoke IntersectionObserver code**: that is what produced the invisible-sections defect.

`astro/src/scripts/motion.ts` as built is exactly that: vanilla IntersectionObserver plus one
rAF loop, no GSAP import anywhere. A governance audit caught the two documents disagreeing.

Writing a spec and then building something else is the drift this governance process exists
to catch. It caught it. This ADR settles which one is right rather than quietly leaving both.

## Decision

**Keep the bespoke module. Amend the architecture doc.**

## Why the original reasoning was wrong

The rejection blamed the wrong thing. The invisible-sections defect was not caused by
IntersectionObserver being the wrong tool. It was caused by the **hide-then-reveal pattern**:
CSS set `opacity: 0` up front and content became visible only if an observer fired. When it
did not fire, the content was simply gone. Measured on the homepage, a normal scroll left
**4 of 9 sections permanently invisible**; a full-page capture left 7 of 9.

GSAP would not have prevented that. `gsap.from({opacity: 0})` sets the same starting state and
fails the same way. A second, independent instance of the identical failure existed in
`sovereign-transformation-v2.js`, sticking 20/20, 13/13 and 9/9 card groups, which is what
established it as a property of the pattern rather than a bug in one file.

What actually fixes it is the inversion: **content is visible by default and motion is opt-in**,
with a timed failsafe that resolves everything regardless of the observer. That is a design
rule, and it is library-independent.

## What the bespoke module buys

- **0 KB.** GSAP + ScrollTrigger is roughly 70 KB minified on a marketing site whose entire
  measured problem is payload.
- **One shared observer**, not one per module. The legacy site had **11** overlapping systems.
- The five binding rules are enforceable in ~200 lines that one person can read in full.

## What it costs, stated plainly

No timeline scrubbing, no morph, no motion path. If a future section genuinely needs those,
that is the trigger to revisit — and importing GSAP for one section is a legitimate outcome,
because the rule is one motion system, not zero libraries.

## Two defects this ADR also settles

The audit found the module claims more than it does:

1. **`sticky` is declared in the `Primitive` union but has no dispatch branch.** An element
   marked `data-motion="sticky"` silently gets generic reveal behaviour.
2. **`parallax` and `sequence` share one code path** with no behavioural difference.

Both are removed from the type rather than left as aspirational names. A primitive that does
not exist is worse than a missing one, because a developer will use it and get something else.
The union is now `reveal | parallax | counter | magnetic`. Add `sticky` back when it is built.

## Also true, and not yet fixed

`initMotion()` **is never called**, no component sets `data-motion`, and no CSS reads
`data-motion-state`. The contract is written and nothing consumes it. It is not wrong, it is
unwired, and it stays that way until a ported section actually needs motion. Recorded here so
it is a known gap rather than an assumed capability.
