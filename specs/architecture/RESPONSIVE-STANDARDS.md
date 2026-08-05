# Responsive standards: crowagent.ai

Required by `specs/PLATFORM-CHARTER.md`, which lists it as **MISSING** with the reason: *"breakpoints
are consistent by habit, not by rule"*.

**The charter is being generous.** Measured on 2026-08-03 across `astro/src`, there are **17 distinct
width breakpoints** in 28 files, including four pairs that differ by one pixel. They are not
consistent by habit either. This document derives the real set, names the four values that should
survive, and records what is actually enforced against what is only intended.

---

## 1. Where the widths come from

Most of the responsive behaviour on this site is **not** in a media query. It is in the token scale,
and that is the design.

### 1.1 Fluid tokens do the work

Every type tier, every vertical step and the gutter is a `clamp()`. A section does not need a
breakpoint to be smaller on a phone; it is already smaller.

```
--t-h1     clamp(2.6rem,  6.2vw, 5.2rem)     --sec-pad-y       clamp(72px,  9.5vh, 144px)
--t-h2     clamp(1.9rem,  3.5vw, 2.9rem)     --sec-pad-y-sm    clamp(52px,    7vh, 100px)
--t-h3     clamp(1.5rem,  2.3vw, 2.05rem)    --sec-pad-y-hero  clamp(104px,  13vh, 188px)
--t-h4     clamp(1.15rem, 1.45vw, 1.35rem)   --sec-gap         clamp(40px,    5vh,  72px)
--t-stat   clamp(2.4rem,  4.6vw, 3.6rem)     --blk-pad         clamp(24px,  3.2vh,  40px)
--t-lede   clamp(1.15rem, 1.6vw, 1.3rem)     --stack-2         clamp(18px,  2.2vh,  26px)
--t-body   clamp(1rem,    1.2vw, 1.0625rem)  --stack-1         clamp(11px,  1.4vh,  16px)
--t-micro  clamp(0.75rem, 0.92vw, 0.8125rem) --gutter          clamp(20px,    5vw,  48px)
```

**Vertical rhythm is keyed to `vh`, not `vw`, and that is deliberate.** `tokens.css:314-329`: *"a
section's height is a vertical problem, and a `vw` clamp hands a 768px laptop exactly the padding it
hands a 1080px screen, which is what pushed every section past the fold."*

**`--t-body` and `--t-micro` became clamps rather than fixed values for a specific reason.** The
scale was lifted (body 15px → 17px, micro 11.5px → 13px) after the owner read the homepage as small
and tight. Clamping means the lift does not land at full size on a 390px screen, *"where 15px was
never the complaint"*.

### 1.2 The measure scale

Four widths, and three of the four are expressed as **fractions** of the first.

| Token | Resolves to | Use |
|---|---:|---|
| `--measure` | 1160px | the page measure. `Section` owns it |
| `--measure-mid` | 967px (5/6) | a two- or three-column band |
| `--measure-band` | 870px (3/4) | one wide column: a fact table, an FAQ stack |
| `--measure-prose` | 725px (5/8) | long-form reading, ~72ch at `--t-body` |

**Fractions, not new numbers.** `tokens.css:364-378`: *"Three more px constants would be three more
things that can drift; a ratio cannot. […] Change `--measure` and the whole page still lines up."*

They were added on 2026-08-02 after an audit found 720, 760, 820, 860, 880, 900 and 960px hardcoded
as container widths across the reviewable routes: the six-max-widths defect the token block was
written to end, reintroduced one page at a time. Snapped to the nearest step; the largest single move
was 820 → 870 on the sector FAQ.

**`ch`-based measures are deliberately not collapsed into this scale.** A measure expressed in `ch`
is derived from the text it holds and stays correct when the type scale moves; a px measure is a
guess that does not. `.prose` caps body text at **68ch**; three index pages cap a standfirst at
**62ch**, which is what `Section` gives every standfirst.

**Three `max-width` values are still off the scale**, and all three are on the design-system gate's
debt list: `NewsletterForm` 520px, `about.astro` 720px (5px from `--measure-prose`),
`faq.astro` 460px. A fourth, `ppn-002-calculator` 560px, is gone rather than fixed: that page was
removed on 2026-08-04 by owner instruction. **The census figures further down this document were
measured before that removal and have not been re-measured**, so any row naming
`ppn-002-calculator` counts a file that no longer exists. The gate's own note on the 720px is the
argument for fixing the rest: *"Nobody will ever see the 5px; what they will see is the next value that lands 40px away
instead."*

Two `max-width: 1440px` values are **recorded exceptions, not debt**: the outer nav rail and the
outer footer rail. Page chrome spans the viewport while page content sits on the 1160px measure, so
they are not on that scale at all.

---

## 2. The breakpoints as they actually are

Measured 2026-08-03, `grep -rE '@media \((max|min)-width' astro/src`.

| Value | Direction | Files | Where |
|---:|---|---:|---|
| 420 | max | 1 | `Integrations` |
| 479 | max | 1 | `blog/index` |
| **519** | max | **4** | `NewsletterForm`, `about`, `contact`, `ppn-002-calculator` |
| **560** | max | **7** (8 rules) | `Footer`, `BothSides`, `FinalCta`, `HeroStack` ×2, `Integrations`, `Lifecycle`, `ReasoningTrace` |
| 599 | max | 1 | `Lifecycle` |
| 639 | max | 1 | `MarketShape` |
| 640 | **min** | 1 | `Compare` |
| 719 | max | 1 | `Article` |
| 720 | max | 1 | `BothSides` |
| **767** | max | **8** | `HeroStack`, `Integrations`, `Base`, `crowmark`, `crowmark-buyers`, `pricing`, `tools/index`, `ppn-002-calculator` |
| 768 | **min** | 4 | `Compare`, `Sector`, `compare/index`, `sectors/index` |
| 860 | max | 1 | `ReasoningTrace` |
| **899** | max | **8** (9 rules) | `Lifecycle`, `Article`, `Legal`, `about`, `blog/index` ×2, `changelog`, `contact`, `partners` |
| 900 | max | 2 | `Footer`, `Nav` |
| 1023 | max | 2 | `MarketShape`, `pricing` |
| 1024 | **min** | 1 | `Glossary` |
| 1099 | max | 3 | `crowmark`, `crowmark-buyers`, `tools/index` |

Plus the non-width queries, which are consistent and correct: `(hover: hover)` ×11 (one also with
`(pointer: fine)`), `(prefers-reduced-motion: reduce)` ×10, `(prefers-reduced-motion: no-preference)`
×9, `(forced-colors: active)` ×9.

### 2.1 What this shows

**A real dominant set exists.** Four values carry **29 of the 49** width rules: **519, 560, 767,
899**. Those four are the standard, and they are the standard because most of the codebase already
agrees.

**Four one-pixel collisions are the drift.** Each pair is the *same boundary* written two ways, and
they are not equivalent; at exactly 900px, `max-width: 899px` is off and `max-width: 900px` is on.

```
719 max (Article)          vs  720 max (BothSides)
767 max (7 files)          vs  768 min (4 files)
899 max (7 files)          vs  900 max (Footer, Nav)
1023 max (2 files)         vs  1024 min (Glossary)
```

The `767 max` / `768 min` and `1023 max` / `1024 min` pairs are the correct complementary form and
are fine. **`899 vs 900` is not.** `Footer` and `Nav` both use 900 while seven content files use 899,
so the site's chrome changes layout one pixel later than its content. Both are page chrome; both were
ported from the legacy tree and were not in scope for any of the design sweeps. Same root cause as
their design-system debt entries.

**Six values are used exactly once**: 420, 479, 599, 639, 719, 860. Each is a component solving its
own geometry,`Integrations`' chip grid at 420, `ReasoningTrace`'s five-column rail at 860. That is
legitimate where the number is a property of the drawing rather than of the page, and it should carry
a comment saying so. Today most do not.

---

## 3. The standard

Four breakpoints. Everything else needs a reason written next to it.

| Name | Query | What changes | Why this number |
|---|---|---|---|
| **Compact** | `max-width: 519px` | Forms and dense grids collapse to one column | Below this a two-up form row gives each field under 240px |
| **Phone** | `max-width: 560px` | Multi-column section figures go to one column | The dominant value in `components/sections/**`: 6 of the 7 homepage sections use it (`MarketShape` is the exception, at 639/1023) |
| **Tablet** | `max-width: 767px` / `min-width: 768px` | Nav goes to the mobile menu; page grids collapse | The conventional tablet boundary, and `Base.astro` already sets the nav on it |
| **Laptop** | `max-width: 899px` | Sidebars, contents rails and two-column article layouts stack | The dominant value in `layouts/**` and `pages/**` |

**Rules:**

1. **Use `max-width` unless you are pairing with an existing `min-width`.** The codebase is 43
   `max-width` rules to 6 `min-width`; mixing directions is how 899/900 happened.
2. **A fifth value needs a comment next to it saying what geometry demands it.** *"It looked better"*
   is not a geometry.
3. **Never write a breakpoint one pixel from an existing one.** If 899 exists, 900 is a bug.
4. **Prefer a token or an intrinsic layout to a breakpoint.** `clamp()`, `minmax()`,
   `repeat(auto-fit, …)` and `flex-wrap` all respond without a query. Most of the widths in §2 that
   are used once could be one of those.

`899 → 900` in `Nav.astro` and `Footer.astro` is the one change this document asks for outright.

---

## 4. Standing requirements

### 4.1 No horizontal overflow at 390

**390 is the reference narrow viewport for this site.** It appears as the required check width in
`DESIGN-DECISIONS.md` (*"Verify by measurement and by eye: axe, no-JS, reduced-motion, 390 and
1440"*), in the robustness criterion (*"correct at 390px"*), and in the two sections that record
overflow defects they had to fix at that width.

`document.body.scrollWidth` must be `<= window.innerWidth`. Two real defects produced this rule:

- `BothSides.astro:260` and `Integrations.astro:264` both record: *"a percentage bleed overflowed the
  page at 390 and 768."* The fix in both is an `overflow: hidden` wrapper with all four edges masked.
- `HeroStack.astro:550` records the same for the plane glow and the wash: *"Also the
  horizontal-overflow guard."*

### 4.2 Travelling lights only overflow while they are moving

**This is the trap, and it is documented in the source.** `BothSides.astro:548-558`:

> *"Each beam is a full-width element translating from -50% to +50%, so it is half a column outside
> its cell at each end of the travel. Unclipped, that grows the page's `scrollWidth` for as long as
> the light is moving — a horizontal-overflow failure that only exists mid-animation and is invisible
> to any check that measures a settled page."*

**Consequence for how overflow is measured.** A screenshot, a settled-page assertion, or a
`scrollWidth` read after `load` will all pass while the page is over-wide. Overflow has to be sampled
**mid-animation**, which means pausing the animations and scrubbing them:

```js
// Pause every running animation, step through the cycle, measure at each step.
const anims = document.getAnimations();
anims.forEach((a) => a.pause());
for (let t = 0; t <= 12000; t += 600) {           // --m-cycle in --m-beat steps
  anims.forEach((a) => { a.currentTime = t; });
  await new Promise(requestAnimationFrame);
  expect(document.body.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
}
```

12,000ms is `--m-cycle`; 600ms is `--m-beat`. Twenty samples covers every station boundary, because
`--m-cycle` is exactly 20 beats and every keyframe boundary lands on a multiple of 5%. See
`MOTION-AND-INTERACTION.md` §3.

**The guard that makes this survivable is structural, not a test.** Every travelling light is inside
an `overflow: hidden` track, and the track is deliberately *not* the cell that holds it; clipping
the cell would cut the station cap's box-shadow halo off square (`BothSides.astro:554-557`).

**This is not enforced today.** `tests/responsive.spec.js` at the repo root checks 8 viewports × 12
pages for overflow, but it measures a settled page and it runs against the legacy tree, not against
`astro/dist`. Recorded as open in §6.

### 4.3 Touch targets are at least 44px

WCAG 2.2 SC 2.5.8. `--btn-h-sm: 44px` is the token, and `tokens.css:304-312` states it: *"44px is
also the WCAG 2.2 target-size floor, so `--btn-h-sm` is the smallest a control may ever be."*
`Button.astro`'s `size="sm"` resolves to it, and the header says **do not add a smaller size without
reading 2.5.8 first.**

`forms.css` encodes two decisions rather than leaving them per form: inputs are **52px**, above the
floor; and the consent row is 44px minimum with **the whole label as the target**, so the hit area is
the sentence rather than a 16px box.

**Half the call sites write `44px` as a literal instead of the token.** Token:
`ShareRow.astro:255-256`, `Integrations.astro:544`, `Nav.astro:596,636,747,766`. Literal:
`CommandPalette.astro:404`, `Nav.astro:660-661,702-703`, `BothSides.astro:797`, `FinalCta.astro:344`.
`Nav.astro` does both. `check-design-system.js` rule 4 checks colours, `font-size` and `max-width`; a
`min-height` in px is none of those, so nothing catches it.

### 4.4 Reduced motion is handled once

`tokens.css:785-791` collapses `--dur-fast`, `--dur` and `--dur-slow` to `0.01ms` under
`prefers-reduced-motion: reduce`, and every animated block on the homepage is inside
`@media (prefers-reduced-motion: no-preference)`, so it does not exist at all rather than existing
and being disabled.

*"Every motion primitive resolves to its final state instead of being disabled, because an element
that never animates and never arrives is invisible content, which is worse than an animation somebody
did not want."*

### 4.5 Hover is gated

`@media (hover: hover)` on every hover state, 11 rules, *"so a touch device does not latch a control
into its hover state"*: the exact wording appears twice in the source, in two different files. The
cursor spotlight adds `(pointer: fine)` and also checks `event.pointerType !== 'mouse'` in JS,
because a pen or a touch contact can reach a hover-capable device.

### 4.6 Forced colours

`@media (forced-colors: active)` in 9 files. Gradient borders, glass fills and specular highlights all
disappear in a forced-colours mode, so anything whose *meaning* is carried by a border or a glow needs
a system-colour fallback. `tokens.css:713-716` names `--gloss-inset` partly for this: *"three shadows
and one forced-colors fallback all need the same value"*.

---

## 5. What is verified, and how

| Requirement | Verified by | Runs in the build? |
|---|---|---|
| Type and spacing scale from tokens | `check-design-system.js` rules 2 and 4 | **Yes** |
| `max-width` from the measure scale | `check-design-system.js` rule 4 | **Yes**, 4 debt exceptions |
| No horizontal overflow, settled page | `tests/responsive.spec.js`, 8 viewports × 12 pages | No: Playwright, manual, and it targets the legacy tree |
| No horizontal overflow mid-animation | nothing | **No** |
| 44px touch targets | nothing automated | **No** |
| Reduced motion | nothing automated | **No** |
| Rendered px at 390 and 1440 | manual browser measurement | No |

`check-design-system.js` is honest about its own limit and it is the right limit to understand here:
it *"checks the SOURCE of a value, not the pixel it renders to. It cannot catch a heading pushed off
the scale by an inherited `em`, by a specificity fight, or by a token whose own definition changed."*
What it does assert is that every heading size is a `--t-*` token, which **bounds** the set of
rendered sizes by the token set. That is the property that stops the scale drifting one component at
a time, which is how it reached 15 heading recipes before.

---

## 6. Open, not decided

1. **No responsive gate runs in the `astro/` build.** All five build gates are text checks over
   `dist/` and `src/`. Overflow, target size and rendered px are all unmeasured per build.
2. **`tests/responsive.spec.js` targets the legacy tree.** It asserts `response.status() === 200` and
   checks overflow at 8 viewports, and none of that currently covers `astro/dist`.
3. **Mid-animation overflow has never been measured.** §4.2 gives the method; nothing has run it. The
   structural guards are in place and the risk is that a *new* travelling light ships without one.
4. **390 could not be obtained on the audit machine.** `specs/ULTRA-PREMIUM-GAP.md` §1 and §5 both
   record it: *"390 was not obtainable either. Window resize did not take effect on this display."*
   So the narrow pass on the current design is **reasoned, not measured**. Every lever in that
   document needs re-checking at 390 before implementation.
5. **No landscape-phone or very-wide policy.** Nothing between 1160px (`--measure`) and 1440px (the
   chrome rail) is stated, and nothing above 1440 is stated at all.
6. **No container queries anywhere.** Every query in §2 is a viewport query, so a component that
   appears in both a full-width band and a narrow sidebar cannot respond to its own box. `Article`'s
   reading pane is the obvious first candidate. Not a defect; an unexplored option.
