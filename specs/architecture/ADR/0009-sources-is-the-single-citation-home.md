# ADR 0009 — `/sources` is the single citation home, and an unsourced figure is marked as one

**Status:** Accepted, with one enforcement gap stated rather than implied
**Date:** 2026-08-03, recording a decision taken during the transformation and never written up
**Supersedes:** nothing. **Extends:** the positioning constraint in `PLATFORM-CHARTER.md`
**Implements:** `astro/src/pages/sources.astro`, `astro/scripts/check-facts.js`

---

## Context

This site's whole position is that the product **refuses to state a figure it cannot ground.** That
is not a marketing line: ADR 0005 exists to keep refusal visually distinguishable from confirmation,
and `check-facts.js` runs **before** the build, on source rather than output, because this site has
published regulatory facts wrongly before.

A position like that fails in one specific way. Not by lying — by **citing loosely**. A figure
appears in a hero, a reader wants to know where it came from, and the answer is either absent, or
inline in a footnote that says something slightly different from the footnote three pages away.

Two things follow that a marketing site does not normally have to decide: where a citation lives, and
what happens to a number that has no citation at all.

---

## Decision

**1. Citations live in one place: `/sources`. Pages link to it; they do not restate it.**

The page holds four source lists — `STATUTE`, `POLICY`, `EU`, `FRAMEWORK` — plus a `MARKETS` table
and three anchored sections: `#homepage`, `#vocabulary`, `#scope`. Five components and pages link in,
and `MarketShape` and `ReasoningTrace` link straight to `#homepage`.

The reason for one home rather than per-page footnotes is drift. A statute cited in four places is
four things to update when the law changes, and the MEES interim being withdrawn is exactly that
event happening. One home means one edit.

**2. Every homepage figure is mapped, and the map states what the figure RESTS ON.**

`HOMEPAGE_MAP` is a table of `{ figure, where, rests, href }`. Six rows today: `10%`, `£5m`, `3`,
`12`, `£27,000`, `£108,000`.

`rests` is the operative column. It is not a link label — it names the thing the number depends on,
so *"PPN 002 minimum social value weighting"* and *"Procurement Act 2023 s.52 contract value
threshold"* can each be checked against the statute rather than against a URL that may have moved.

**3. A figure with no source is marked as illustrative, in the same table, rather than left out.**

`href: string | null`, and the type's own comment reads *"Anchor on this page, or null when the
figure is illustrative."* Two of the six rows are null today.

**This is the clause that makes the other two honest.** A citation table that only lists what is
cited tells a reader nothing about what is not, and the failure mode of a page that refuses to state
ungrounded figures is a figure quietly shipping without one. Marking it keeps the absence visible on
the same page as the presence, in the same table, rather than as a gap the reader has to notice.

---

## Consequences

**A figure is a content change with a documentation obligation.** Adding a number to the homepage
means adding a `HOMEPAGE_MAP` row, and if there is no source, saying so in the row. That is
deliberately more friction than typing a number, because the friction is the point.

**`check-facts.js` guards the six facts most likely to be wrong** — the PPN 002 date, its 10% floor
(never 5%), its old themes, the withdrawn MEES 2028 interim, the *proposed* 2031 EPC B, and the
£150,000 cap — and it reads **source**, before the build. `sources.astro` is one of the files it
protects, so the citation home cannot itself drift into stating the withdrawn interim as law.

**It does not enforce this ADR.** `check-facts` asserts that six specific claims are stated
correctly wherever they appear. Nothing asserts that a figure on the homepage appears in
`HOMEPAGE_MAP` at all.

---

## Open, not decided

**~~Nothing gates the map~~ — `check-render.js` does, as of 2026-08-03**, and it is the narrow rule
described here rather than the general one this section warned against. It reads figures from
`.spine__value` and `[data-rt-sum]`, the elements `MarketShape` and `ReasoningTrace` use to present a
figure *as* a figure, and fails the build on any that is not a `HOMEPAGE_MAP` row.

**The general rule stays unbuilt on purpose.** "Is this string a factual claim" is a judgement, and a
gate that guessed would either miss prose figures or fire on every price and phone number on the
site — the same reasoning ADR 0005 gives for not gating "is this element a marker". A first pass that
matched currency and percentages in section text returned `00210%`, having glued the `002` of
"PPN 002" onto the `10%` beside it, which is what asking *what looks like a number* gets you instead
of *what does this page present as a figure*.

**What the gate does not cover is stated in its own code:** a figure written inline in a sentence.
`ReasoningTrace`'s £27,000 is one, and it is mapped. What is covered is where new homepage figures
actually get added — `MarketShape`'s `SHAPES` array.

**One fragility, made loud rather than left silent.** The rule parses `HOMEPAGE_MAP` out of
`sources.astro` rather than importing it, because that page is a component and the gate is a plain
script. A formatting change could therefore yield zero rows, and a rule matching nothing passes
forever. It prints the map size on every run — *"citation map: 6 homepage figure(s)"* — so that
failure is visible rather than silent.

**Only five pages link to `/sources`.** Whether the citation home should be reachable from every page
that states a regulated figure, rather than from the ones that happen to link today, has not been
decided.
