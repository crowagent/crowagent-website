# ADR 0005 — Colour carries meaning, and the roles are named tokens

**Status:** Accepted, with one open question the owner is deciding from renders
**Date:** 2026-08-03
**Supersedes:** nothing. **Extends:** the standing constraints in `PLATFORM-CHARTER.md`
**Implements:** `astro/src/styles/tokens.css`, `specs/PALETTE-EXPLORATION.md`

---

## Context

This site's whole position is that the product **refuses to state a figure it cannot ground.** A
refusal is only legible if a reader can tell it apart from a confirmation at a glance, so colour on
this site is not decoration: it is the fastest carrier of that distinction.

The rule was written into the charter early and enforced by nothing. Three separate problems
followed, and all three were found by measurement rather than by review.

### 1. The rule governed markers but nobody had defined "marker"

"Teal means verified" is unusable as written, because teal also appears in light, bloom, gradient
borders and surface wash where it means nothing at all. Without a test, every use looks like a
violation or none does.

### 2. The interactive role had no name, so teal took it by default

Measured across `astro/src`, **379 teal references**:

| share | what it actually paints |
|---|---|
| ≤ 15% | a verified marker, which is the documented meaning |
| **27.7%** | interactive states — 57 focus rings, 19 hovers, 22 links and chrome |
| 19% | atmosphere: fields, glows, washes |
| **39%** | bare `color: var(--c-teal)` on pages where nothing is being verified |

The charter already assigned interactive to **cyan**. Teal did not win that job by argument; it took
it because *"the interactive colour"* was not a name anything could refer to, and an unnamed role
gets filled by whatever is nearest. Teal was nearest **105 times**.

### 3. The owner's read was right, and the mechanism was not what anyone assumed

Owner, 2026-08-03: *"one of the reasons for using teal and green was that we started the idea from
sustainability, and now we are focusing on bid."*

Measured properly — 6 routes at 1440, 21.5M pixels binned by CIE LCh chroma rather than HSL,
because `--c-bg` has an HSL saturation of 0.47 and a first pass wrongly reported the page as 30%
blue:

- **Green is 0.000% of painted pixels.** Every green-reading pixel is teal at 172°. Chasing "green"
  would have fixed the wrong thing.
- Only **1.51%** of the page is a nameable hue at all, and violet leads it at 59% — but violet
  appears in exactly two places, the homepage hero field and the blog duotone.
- **Strip those and teal is 67 to 88% of all painted colour on every other route.**

So the defect is **monopoly, not quantity.** Teal is not excessive by area. It is excessive by being
the only accent, and a single-hue teal brand reads as sustainability.

---

## Decision

**1. Colour carries meaning, and the meanings are fixed.**

| token | meaning |
|---|---|
| `--c-teal` | verified: a fact traced to a named source |
| `--c-violet`, `--c-orchid` | refused or flagged: the engine declining to write something it cannot ground |
| `--c-amber` | at risk (added by the owner, 2026-08-03) |
| `--c-interactive` | the interactive state: links, hovers, focus rings (added 2026-08-03) |

**2. The rule governs MARKERS, and the marker test is the definition.** Change the hue. If the
meaning of what you are looking at changes, it is a marker and this ADR binds it. If only the
appearance changes, it is light, bloom or surface and takes the full range.

**3. Every role gets a named token.** This is the operative clause and the one that prevents
recurrence. A role without a name is filled by proximity, which is the whole of problem 2 above.
`--c-interactive` now exists and 76 references resolve from it.

**4. Amber is the narrowest of the four and must stay so.** It marks a thing that may fail, not a
thing that is merely important. Three meanings had been carried by two hue families before it was
added, which is why "at risk" kept being drawn as either verified or refused.

---

## Consequences

**A palette change is now a token edit rather than a sweep.** Before `--c-interactive` existed,
changing what interactive looks like meant touching roughly 250 references. It is one line now,
which is why the eight palette variants on `:8096` cost nothing to choose between.

**Reducing teal does not cost meaning; it is the only way to restore it.** At most 15% of teal
references are verified markers. Teal became the default accent by accident. Making it rarer makes
it legible again.

**The gates cannot see this rule and that is stated rather than implied.**
`check-design-system.js` rule 4 asserts that a colour comes from a token; nothing asserts that the
*right* token was chosen, because "is this element a marker" is a semantic question. That is the
same shape as three other blind spots found the same week — the alignment gate read declarations
when the defect was geometry, rule 2 asked "is it a token" rather than "is it the right token", and
the target-size check asked "is it in a paragraph" rather than "is it in text". Each answered a
neighbouring question. This one is left to review deliberately, because the alternative is a gate
that guesses at intent.

---

## Open, not decided

**Which palette direction wins.** Eight variants are built and measured in
`specs/PALETTE-EXPLORATION.md`, all passing WCAG AA against all four surface steps, worst value
5.69:1. The recommendation is V6, *"white as a paint"*: interactive becomes white, teal gets rare
enough to mean something again, and violet takes refused with no collision. V2 and V5 are recorded
**with their flaw visible** — interactive and refused end up the same hue — rather than quietly
corrected.

**The logo gradient is out of scope and stays as it is**, by explicit owner instruction.

**Nothing else is outstanding on the hover path.** `.prose a:hover` briefly resolved
`--c-teal-dark` after `.prose a` moved to `--c-interactive`, which meant the site's highest-volume
link moved *off* the interactive role and *on to* the verified marker under the cursor. A link does
not become verified because a pointer is over it. It resolves `--c-text` now, and the light reading
pane scopes that to `#0b0e19`, so the hovered link measures 6.66:1 there rather than vanishing.
