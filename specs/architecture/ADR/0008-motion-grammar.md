# ADR 0008 — Motion is a grammar with one beat, three curves and one entrance

**Status:** Accepted
**Date:** 2026-08-03, recording a grammar built across the transformation and never written up
**Supersedes:** nothing. **Extends:** ADR 0003 (motion is bespoke, not GSAP), ADR 0004 (scroll-driven arrival), ADR 0006 (four primitives deleted)
**Implements:** `astro/src/styles/tokens.css` (the `--m-*` block), `astro/src/styles/motion.css`, `astro/scripts/check-motion.js`

---

## Context

ADR 0003 decided motion would be hand-written rather than a library. ADR 0004 decided the arrival
would be a CSS `view()` timeline. ADR 0006 decided four primitives stay deleted. **None of them says
what motion on this site is made of**, so every new animation has been an argument from first
principles, and the file comments have been carrying the answer instead.

That is not a documentation gap on its own. It is the reason the same three questions kept being
re-answered differently: how long should this take, which curve, and may it loop.

---

## Decision

**Motion on this site is a grammar. Four facts define it and everything else follows.**

### 1. One beat: `--m-beat: 600ms`, and `--m-cycle: 12s` is exactly 20 of them

Every duration is a multiple or simple fraction of the beat. A section's land takes two beats, a row
one and a half, the stagger between rows a sixth. **Nothing invents a duration.**

The arithmetic is the point: 12s ÷ 600ms = 20, so any looping light on the page can be checked
against any other by eye. The tokens file says so directly and warns against changing either number
alone.

`--m-drift: 18s` is deliberately **not** a multiple of the cycle. 18 against 12 means the ambient
field and the looping lights never land together twice in the same place, so the page never repeats
itself exactly.

### 2. Three curves, one family

| curve | value | for |
|---|---|---|
| `--m-ease-travel` | `linear` | anything crossing a fixed distance |
| `--m-ease-land` | `var(--ease)`, the site's expo-out | an arrival: a bloom, a nudge, a cap opening |
| `--m-ease-breath` | `cubic-bezier(0.45, 0, 0.55, 1)` | ambient motion that reverses |

**`linear` is a decision, not a placeholder.** A lamp crossing a fixed distance moves at constant
speed; easing a travelling highlight makes it arrive early and then crawl. The tokens file records
that Figma `144:2` disagreed with itself on exactly this — a named curve against evenly spaced
keyframe columns — and that the keyframes were right.

`land` being the same `--ease` a card uses under the pointer is deliberate: a landing on the homepage
and a card lifting under the cursor are the same motion, so the page has one idea of how things
settle.

### 3. One entrance, and it is not a reveal

`m-arrive`: one beat, once, as a section comes into view. It is a **transform-only bloom of an
`aria-hidden` blurred field that is already on screen**, so the worst a failure can do is nothing at
all.

This is the clause ADR 0006 exists to protect and it is restated here because the distinction is
easy to lose: **arrival, not concealment.** The codebase has already shipped a staged reveal that
failed the axe gate on 7 nodes, and before that an observer that left 4 of 9 sections permanently
invisible.

### 4. A scroll-driven animation takes no beat

The beat is a unit of **time**, and a `view()` timeline has no time in it — it is driven by
scroll position. So the arrival is governed by distance instead: `--arrive-settle-pct: 50%` and
`--arrive-settle-max: 380px`, taken as a `min()`.

**Both numbers exist because one cannot be right for both a 60px sub-nav and an 8,000px legal
document.** A percentage alone means `entry 50%` on a legal page is 4,000px of scrolling below full
opacity. A length alone means 320px on a 60px sub-nav is five times its own height. The `min()` is
right at both ends, and it is what makes the opacity floor safe rather than merely small: a block can
never be stuck part-arrived while substantially visible, at any viewport, at the end of any document.

---

## Consequences

**The floor is 0.75 and it is set by the worst case any text can be.** Not by a number that felt
safe. 0.35 was chosen as "clearly not zero" and never checked: a certification run found serious
contrast failures on 5 of 8 sampled routes, all traced here, because a `view()` timeline holds an
unreached block at the floor **indefinitely** and axe composites it. 0.65 clears every grey the
system ships and still leaves orchid refusal labels at 3.66:1. **A floor that only works for the
colours you happened to check is not a floor**, which is the mistake 0.35 made and the one 0.65 would
have repeated one rung higher.

**Opacity is animated at exactly one level, and that is arithmetic rather than taste.** Opacity
composes down the tree: a card at 0.75 inside a section at 0.75 renders at 0.56, under the floor,
without either rule being wrong alone. So the two levels split by **property**, not by timing —
blocks fade and travel, items travel only. Timing cannot separate them, because a parent and its
first child enter the viewport within a few pixels of each other.

**`check-motion.js` enforces the shape** with four rules — TIMELINE, ENTRANCE, OBSERVER, REVEAL — and
was proved to fail by reproducing a competing implementation in a scratch tree.

**No `filter: blur()` anywhere in `motion.css`.** Blurred text is an accessibility problem and a blur
on a full-width section is a real paint cost on the phones this site is mostly read on. Neither buys
anything the travel does not.

**The from-state exists only inside `@keyframes`.** No rule sets the hidden state, so a browser that
ignores every line of this renders the page exactly as it ships. Firefox does not support
`animation-timeline: view()` and is therefore the only engine that exercises the fallback rather than
the arrival, which is why certification runs it.

**A divergence from the Figma board is recorded rather than quiet.** `139:7` rule 04 reads *"Autoplay
next to prose plays once. Only the hero loops."* The owner has since instructed continuous play for
the whole page, which supersedes it. **What is not relaxed is the reason that rule existed:** nothing
that loops carries meaning, nothing that loops touches a word or the surface a word sits on, and
every refusal on the page still plays once or not at all. **A refusal is a fact, not a performance.**

---

## Open, not decided

**The three techniques ADR 0006 left open still are:** nav frost on scroll, scroll-progress and
back-to-top, and the arrow nudge on CTA icons. Each needs an owner decision. None requires reviving a
deleted primitive, and all three fit this grammar as written.

**Nothing measures beat conformance.** `check-motion.js` asserts the *shape* — one arrival, no
component entrance, no second timeline, no observer — but a duration hand-typed as `450ms` instead of
`calc(var(--m-beat) * 0.75)` would pass. The grammar is enforced by review, and this ADR is what
review reads.
