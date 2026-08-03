# ADR 0006 — Four motion primitives were deleted rather than ported, and stay deleted

**Status:** Accepted
**Date:** 2026-08-03, recording a decision taken during the Astro port and never written up
**Supersedes:** nothing. **Extends:** ADR 0003 (motion is bespoke, not GSAP), ADR 0004 (scroll-driven arrival)
**Implements:** `astro/src/scripts/motion.ts`, `astro/scripts/check-motion.js`

---

## Context

This ADR exists because the decision it records is one somebody will otherwise reverse in good
faith. Every deleted primitive is a normal, popular technique. Three of them were re-proposed
during this transformation — once by a competing implementation the owner reviewed and liked, once
by an audit that correctly measured them as "lost", and once by the owner directly. Each time the
answer had to be re-derived from a comment.

The legacy site carried four primitives behind a `[data-motion]` attribute, a shared
`IntersectionObserver` and a 2600ms failsafe timer: **reveal, parallax, counter, magnetic.**

**Not one line of it was ever imported by any page.** It was dead code implementing a live design.

### What the design it implemented actually did

`sv-reveal` started content at `opacity: 0` and depended on an observer firing to make it visible.
Measured on the legacy homepage:

- a normal scroll left **4 of 9 sections permanently invisible**
- a full-page capture left **7 of 9 invisible**
- on `/crowmark`, **20 of 20 cards**

It then failed the axe gate a second time **in the rebuild**, after being reintroduced.

The failsafe timer was the right answer to the wrong shape. If content only ever starts correct,
there is nothing to fail safe to.

---

## Decision

**Reveal-on-scroll, counter, magnetic and cursor-follow are deleted. They do not come back.**

Two of the five binding motion rules on the Figma board (`139:7`) are the reason, and they are worth
restating because they decide every future case without further argument:

1. **Rest state IS final state.** Frame 00 of every section is what ships with no JavaScript, and it
   is complete.
2. **Motion may only ADD light.** No animated property may lower the opacity of anything already on
   screen.

Per primitive:

| primitive | why it is gone | what replaces it |
|---|---|---|
| **reveal** | hides content behind a script firing; six competing systems existed in the legacy tree | ADR 0004's arrival: a CSS `view()` timeline with an opacity floor of **0.35**, never 0, and no script in the path |
| **counter** | animating a figure up from zero is hide-then-reveal under another name. `MarketShape.astro` forbids it on its four figures **by name** for exactly this reason | the figure is simply correct at rest |
| **magnetic** | needs JavaScript on every pointer move, and the owner separately reported that the magnetic CTA could swallow a click (OA-07) | the hover light in `surfaces.css` and `Button.astro` |
| **cursor-follow / spotlight** | built, then switched off by owner decision on 2026-08-03 | nothing; the page does not track a cursor |

**The distinction that governs future cases is arrival versus concealment.** An element that
travels and settles once as it enters the viewport is *arrival*, and ADR 0004 permits it. An element
that is invisible until something fires is *concealment*, and this ADR forbids it. The test is
whether a reader with no JavaScript, or with a script that errored, sees the complete page. They
must.

---

## Consequences

**`check-motion.js` enforces it** rather than leaving it to memory, with four rules: TIMELINE,
ENTRANCE, OBSERVER and REVEAL. It fails on any component that defines its own entrance, declares a
second scroll timeline, or makes an appearance depend on an observer. It was proved to fail by
reproducing the competing implementation in a scratch tree; all four rules fired.

**Some genuinely good things went with them, and that cost is real.** An audit against the legacy
site measured what was lost and found the largest item was not a primitive at all: a single
platform-level transition rule on `:where(a, button, [role=button], input, select, textarea,
summary, [tabindex])`. Fourteen competing card implementations and eighteen button ones were
consolidated correctly while the floor underneath them was dropped. That has been restored in
`motion.css` as a zero-specificity floor. **Deleting duplicated systems is right; deleting the
shared baseline with them was not, and it went unnoticed for the same reason everything else did —
nothing measured it.**

**One live instance survived all of this and was found by the gate, not by review.**
`about.astro` shipped `@keyframes chip-in` as `opacity: 0 → 1` on four role chips, staggered, on a
published route. Time-based rather than observer-driven, so it could not fail to fire — but it is
the same shape, and axe samples *during* an animation. Its floor is 0.35 now, matching the central
arrival.

---

## Open, not decided

**Three legacy techniques are absent and are not forbidden by this ADR**, recorded so nobody
assumes deletion was a judgement on them: nav frost on scroll (pure CSS, zero JS, two conflicting
copies existed), scroll-progress and back-to-top (both achievable on a CSS `scroll()` timeline), and
the arrow nudge on CTA icons (needs an agreed icon hook rather than a class invented in a
stylesheet). Each needs an owner decision, not a revival of the primitives above.
