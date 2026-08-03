# ADR 0007 — Blog articles read on a light pane, and a light scope is a token list

**Status:** Accepted
**Date:** 2026-08-03, recording an owner decision taken 2026-08-02 and never written up
**Supersedes:** nothing. **Extends:** ADR 0005 (colour carries meaning)
**Implements:** `astro/src/layouts/Article.astro`, `astro/scripts/check-design-system.js` rule 8

---

## Context

The site is dark. Every other surface on it is one of four steps between `--c-floor` and `--c-lit`,
and the whole visual grammar — the glass cards, the screen-blended orbs, the specular top-lights —
assumes a near-black ground.

A blog article is the one thing on this site that is **read start to finish** rather than scanned.
Long-form light-on-dark is measurably harder for sustained reading, and our articles run to several
thousand words.

**Owner decision, 2026-08-02**, choosing from Figma variants: *"for blog index go ahead with B1
Editorial ledger; page Blog Article go ahead with A1, dark hero to light reading pane."*

So one route family inverts: a dark hero, then the article body on `#F5F6FA`.

---

## Decision

**`.art__pane` inverts the palette by rebinding tokens, not by overriding rules.**

Seventeen `--c-*` custom properties are redeclared on the pane. Everything inside it keeps writing
`var(--c-text)`, `var(--c-teal)`, `var(--c-interactive)` exactly as it would on a dark surface, and
resolves to a value that works on paper. No component inside the pane knows it is on a light
surface, and none should have to.

**The invariant that makes it safe:** *every `--c-*` token that can carry text must be rebound
inside the light scope.*

This is not decoration. `-webkit-text-fill-color` and unbound colour tokens are how this codebase
has produced **invisible text twice**, and the failure mode is the worst kind: it looks fine to
whoever wrote it, because they were looking at a dark page.

---

## Consequences

**A scoped palette is a LIST, and lists fall behind.** A token added to `:root` after the pane was
written is missing from it by default, silently, until somebody writes `color: var(--the-new-one)`
in there. That is not hypothetical:

- `--c-interactive` was created on 2026-08-03, when the interactive role was finally given a name.
  It was absent from the pane **the same day**, resolving to cyan at **1.67:1** on `#F5F6FA`.
- Checking the whole set then found **five more**: cyan, orchid, violet, pink and teal-dark, between
  1.67:1 and 2.52:1.

None of the six rendered as text in the pane at the time, so they were traps rather than live
defects — but each was one `color:` declaration away from firing.

**Rule 8 of `check-design-system.js` now asserts the list is complete.** Every `--c-*` token used as
a `color:` value anywhere in `src` must be rebound in the light scope. It deliberately does **not**
check the rebound value: contrast against a scoped background is a rendered question, and
`check-render.js` and `certify.js` own those. This rule asserts only that nothing is missing.

**It found a manual sweep being wrong on the same day it was written.** The sweep read `--c-cyan`
out of a *comment* inside the pane block and counted it as rebound. The gate parses declarations and
does not read comments.

**The hues survive the inversion.** A refusal is still violet on the pane, at `#6d28d9` rather than
`#A78BFA`. ADR 0005's meanings are preserved across surfaces; only the lightness changes. In
particular `--c-interactive` is **not** collapsed into the pane's teal, even though that would also
pass contrast, because ADR 0005 exists precisely to keep interactive and verified apart.

**Forced-colours mode drops the pane's own decoration** rather than fighting it: the seams and
gradients are removed and a single `CanvasText` border marks the boundary.

---

## Open, not decided

**The pane's tokens are hardcoded hex, and rule 4 exempts them.** They are a second palette, defined
in a layout rather than in `tokens.css`. Moving them into a named light scope in the token file was
recommended in `Article.astro`'s own header and has not been done; the header says so, and this
records it rather than leaving it in a comment nobody reads.

**Prose headings inside the pane do not carry the heading gradient** the rest of the site now uses.
That is correct today — a white-to-transparent fade on a light background would be invisible — but
it means article headings and section headings are treated differently, and nobody has decided
whether the pane should have its own equivalent.
