# ADR 0004 — Content arrives on a scroll-driven CSS timeline, bound to `<main>`

**Status:** Accepted
**Date:** 2026-08-03
**Supersedes:** nothing. **Extends:** ADR 0003 (motion is a bespoke module, not GSAP)
**Implements:** `astro/src/styles/motion.css`, `astro/scripts/check-motion.js`

---

## Context

The owner reviewed a competing implementation of this site and liked exactly one thing about it:
**content arriving as you scroll.** Their words: *"feels like the page is loading on scroll,
cinematic, floating."* Nothing else about it was wanted.

Our site did not have that, and it is worth being precise about why, because the repository looks
as though it does.

`tokens.css` already carries a scroll-driven animation on `animation-timeline: view()`. It is bound
to `[data-field]`, the ambient light-field wrapper, and it moves the two blurred fields inside it.
On 2026-08-03 the owner set `--orb-violet` and `--orb-teal` to `none`, so **both fields paint
nothing.** The only scroll-linked motion on the site therefore drives an invisible object. Content
itself has never had any arrival motion at all.

### What the competing implementation did

An `IntersectionObserver` adds a class; the CSS is `opacity: 0; transform: translateY(40px)` with a
1s `cubic-bezier(0.165, 0.84, 0.44, 1)` transition, a `0.1s * (i % 6)` stagger, threshold 0.1,
rootMargin `0px 0px -50px 0px`, and `unobserve` after firing.

**We cannot ship that, and the reason is not taste.** This repository has shipped that exact
pattern three times and it has failed three times:

| Where | What happened |
|---|---|
| `js/modules/sv-reveal.js`, legacy homepage | A normal scroll left **4 of 9 sections permanently invisible**; a full-page capture left 7 of 9 |
| `sovereign-transformation-v2.js`, via `gsap.from()` | **20/20** cards stuck at opacity 0 on `crowmark.html`, **13/13** on `about.html`, **9/9** on `contact.html` |
| `ReasoningTrace.astro`, the rebuild | Failed the sitewide **axe gate on 7 nodes** for colour contrast, because the checker sampled while the steps were semi-transparent |

Two of those were unrelated implementations of the same idea, which is what makes it a property of
the pattern rather than a bug in a file. ADR 0003 already reached this conclusion and stated the
fix as a design rule: *content is visible by default and motion is opt-in.*

---

## Decision

**Build the arrival as a pure CSS scroll-driven animation on `view()`, apply it centrally to a
structural selector under `<main>`, and add a build gate that fails any component defining its own
entrance.**

Zero JavaScript. The build shipped 0 KB of new script and still does.

### 1. The mechanism: `view()`, not an observer

An observer is a callback that may not be called. A view timeline is a function of where the
element is. The browser recomputes progress from real geometry every frame, so **an element that is
on screen is by definition past its range and settled.** There is no "did it fire". A resized
viewport, an anchor jump, a restored scroll position, a full-page screenshot and a print all
produce a correct result because they all produce a correct *position*.

This is not a difference of degree. The JavaScript version *can* be wrong; this one cannot.

Three further properties make it safe rather than merely better:

- **The hidden state exists only inside `@keyframes`.** No rule in `motion.css` sets `opacity` or
  `transform` on an element. Remove every animation and the page is exactly what it is today.
- **`animation-fill-mode: backwards`, not `both`.** After the range ends the animation contributes
  nothing at all: no opacity override, no identity transform left on ~200 elements, no composited
  layer held open, no containing block created for descendants. It is also what lets `.surface`'s
  hover lift work normally the moment a card has settled.
- **The floor is 0.75 and never 0.** Nothing is animated from invisible. It was 0.35 when this
  ADR was written; a certification run on 2026-08-03 measured that as 2.53:1 composited and it was
  raised to the worst case any text on the site can be, a refusal label in orchid.

### 2. The hook: `<main>`'s blocks, and no component was edited

The charter's standing complaint is that fixes land per page. Not one `.astro` file was touched to
ship this. `Base.astro` gained one `import` line and nothing else.

```css
main > *:not(script, style, template):not(:only-child),
main > *:only-child > *:not(script, style, template)
```

`Base.astro` owns `<main>`, so every route passes through it. Measured across all 43 built routes
this resolves to **between 2 and 18 arrival units on every one**, none nested inside another:

| Route shape | Units | Note |
|---|---:|---|
| `/` | 8 | seven sections plus the closing card |
| `/crowmark/` | 18 | the largest |
| `/about/` | 13 | |
| `/privacy/`, `/terms/`, `/cookies/`, `/security/` | 2 | `div.legal` is an only child, so its head and its grid are the blocks |
| `/compare/*`, `/glossary/*`, `/sectors/*` | 3–5 | these layouts nest a second `<main>`; the `:only-child` branch unwraps it |
| `/blog/` | 2 | `div.bl` is an only child |
| `/tools/ppn-002-calculator/methodology/` | 2 | one section, so its head and body are the blocks |

**The `:only-child` branch is load-bearing, not defensive.** Nine routes wrap everything in one
element. Without it, each of those would fade in as a single page-sized slab.

### 3. Two levels, split by property, because opacity composes

A card at 0.75 inside a section at 0.75 renders at **0.56**, which breaks the floor without either
rule being wrong on its own. Timing cannot separate them: on a view timeline a parent and its first
child enter the viewport within a few pixels of each other. So the split is by property.

| Level | Selector | Animates | Distance | Range |
|---|---|---|---|---|
| Block | the `<main>` selector above | `opacity` 0.75 → 1 **and** `translateY` | `--stack-2` (18–26px) | `entry 0%` → `entry min(50%, 320px)` |
| Item | `main .surface` | `translateY` only | `--stack-1` (11–16px) | `entry 0px + i·32px` → `+240px`, `i = 0..5` |

Transform composes too, and that is wanted: 14px inside 24px is 38px at the extreme, which reads as
depth and resolves to zero. **Measured: zero `.surface` elements on the whole site sit inside
another `.surface`,** so the item level cannot stack with itself today.

`.surface` is the right item hook because it is already the design system's name for "a block of
content a reader scans" (`surfaces.css`), on 32 of 43 routes, and a second card recipe is already a
build failure. It needs no new class.

The one overlap is `div.fc.surface`, the homepage closing card, which is both a block and an item.
Both selectors are `(0,1,1)`, so the block rule — declared second — wins outright and it fades as a
block. That ordering is deliberate.

### 4. `min(50%, 320px)` is the whole safety argument, and it is arithmetic

A view timeline's `entry` range length **is the element's own height**. So `entry 50%` on an
8,000px legal page is 4,000px of scrolling at the floor, and a bare `320px` on a 46px sub-nav is
five times its own height.

`min()` is right at both ends: short blocks settle proportionally, tall blocks settle once 320px of
them is on screen. Restated as a property: **any element with 320px visible is fully settled, and
anything less than that is peeking over the bottom edge of the viewport.** A block can therefore
never be stuck part-arrived while substantially visible, at any viewport, at the end of any
document.

It is written twice, plain first and `min()` second, so that an engine that rejects `min()` in a
timeline offset falls back to `entry 50%` rather than dropping `animation-range` altogether — which
would silently mean `normal`, the entire cover range, and a block held at the floor for most of the time
it is on screen. Chromium 143 was measured accepting the `min()` form.

### 5. The stagger is a distance, and the cycle is the cap

There is no time on a scroll timeline, so there is no `animation-delay` to use. The stagger is
32px of scroll per step via `animation-range` offsets on `:nth-child(6n+k)`.

**`6n` is modulo, so it caps itself.** `/glossary` has 26 cards; a linear stagger at 32px would put
the last one 800px of scroll behind the first and it would still be arriving after the grid had
gone. Worst case here is 240 + 160 = **400px** for the sixth item, against a ≥600px viewport, and
it is travel only, so a fully visible card is never less than fully legible while it finishes.

Six is also what the reference implementation used (`0.1s * (i % 6)`), reached from the same
constraint from the other side.

### 6. Grammar, not new numbers

- **Easing** is `--m-ease-land`, which is `--ease`, the site's expo-out. `tokens.css` defines it as
  *"an arrival: a bloom, a nudge, a cap opening"*. `--m-ease-travel` is linear and is for a lamp
  crossing a rail; `--m-ease-breath` is symmetric and is for something that reverses. Neither
  describes this. **No fourth curve was invented.**
- **Distance** is `--stack-2` for a block and `--stack-1` for an item, the site's two stacked-line
  gaps.
- **There is no `--m-beat` in this file, and that is not an oversight.** A beat is 600ms of time. A
  scroll-driven animation has no time in it. The stagger is the one number the grammar did not
  already hold.

### 7. What was considered and rejected

| Option | Why not |
|---|---|
| `filter: blur()` on arrival | Blurred text is an accessibility problem, and a blur on a full-width section is a real paint cost on phones. Buys nothing the travel does not. |
| `scale(0.985)` on the block | Permitted by the brief and dropped: scaling live text resamples every glyph for the duration, which on low-DPR displays reads as out of focus. |
| `translateX` or rotation | The classic way a marketing page grows a horizontal scrollbar at one breakpoint nobody tested. |
| 40px travel, as the reference build used | On a full-width section that reads as a jump, and it puts 40px of transient scrollable overflow at the foot of the document. |
| A JavaScript polyfill for Firefox | It is the observer, reintroduced, with all three failure modes. Firefox gets the page as it ships today, which is complete. |
| `animation-fill-mode: both` | Leaves an identity transform on every unit forever, which creates a containing block for descendants and suppresses `.surface`'s hover lift. |

---

## Verification

Measured, not asserted. Astro dev server on **:8099** (never `npm run build`, which empties `dist/`
and took the owner's :8095 test server down earlier the same day). Chromium and Firefox from the
repo-root Playwright install, viewport 1440×900 and 360×740.

### Above the fold is settled at load, with no exclusion list

The reasoning first: `entry` starts when the element's top edge is at the **bottom** of the
viewport. An element whose top is at the top of the viewport is therefore already one full viewport
height (≥600px on any real device) past that point, and every range here ends by 320px + at most
160px of stagger. So it is in the after phase before a single pixel is scrolled, and `backwards`
fill applies nothing in the after phase.

Then the measurement, `scrollY = 0`:

| Route | First block | `top` | computed `opacity` | computed `transform` |
|---|---|---:|---:|---|
| `/` | `section.hero` | 73 | **1.000** | **none** |
| `/crowmark/` | `section.section` | 73 | **1.000** | **none** |
| `/pricing/` | `section.section` | 73 | **1.000** | **none** |
| `/glossary/` | `header.gx-hero` | 73 | **1.000** | **none** |
| `/privacy/` | `header.legal__head` | 159 | **1.000** | **none** |
| `/compare/crowmark-vs-autogenai/` | `header.cmp-hero` | 73 | **1.000** | **none** |
| `/blog/` | `div.bl__glow` | 73 | **1.000** | **none** |

**No exclusion was needed and none was added.** Adding one would have been a page-specific rule for
a problem the geometry does not have.

The second block is also settled whenever it is substantially in view rather than merely present:
`/pricing` `div.pricing` at `top: 650` measured **0.999**; `/glossary` `section.gx-index` at
`top: 609` measured **1.000**; `/compare` `section.cmp-article-section` at `top: 596` measured
**1.000**. Only blocks below the fold sit at the floor.

### The floor holds, and the arrival is visible

`/` at `scrollY = 900`: `section.section` at `top: 905` measured **0.480** and
`translateY(15.85px)` — 5px below the fold, mid-arrival. Every block below that measured exactly
**0.350** and `translateY(19.8px)`, the from-state. Nothing measured below the floor anywhere.
**Those two figures are the 2026-08-03 verification run, taken when the floor was 0.35.** They are
left as recorded rather than rewritten, because a verification record is evidence of what was true
at the time; the floor is 0.75 now and the equivalent figure would be 0.750.

### The stagger runs

`/glossary` at `scrollY = 0`, five `gx-term` cards: `--arrive-i` resolved to 0, 1, 2, 3, 4 and the
first card measured `translateY(10.89px)` against `12.6px` for the rest — the first has begun, the
others have not.

### Reduced motion ships the settled state

`prefers-reduced-motion: reduce`, every route tested, every unit and every item:
`animation-name: none`, `opacity: 1`, `transform: none`, `animation-fill-mode: none`.

### The unsupported path is the page as it ships today

**Firefox 148.0 Release**, `CSS.supports('animation-timeline: view()')` → **false**. On `/` and
`/glossary`, every unit and every item measured `opacity: 1`, `transform: none`,
`animation-name: none`. Not a degraded arrival — no arrival, and a complete page.

### No horizontal overflow

`scrollWidth === clientWidth` at 1440 and at 360, on `/`, `/compare/crowmark-vs-autogenai/`,
`/privacy/` and `/glossary/`, at `scrollY` 0, 1200 and 3000.

### What was NOT verified, stated plainly

- **No visual or screenshot review.** Every number above is `getComputedStyle` and
  `getBoundingClientRect`. Nobody has looked at it.
- **No Safari.** `view()` is Safari 26+; only Chromium and Firefox are installed here.
- **No frame-rate or layer-count measurement.** `/crowmark` has 18 blocks and 25 items, so ~43
  elements carry a compositor-driven animation on one route. Both properties are compositor-only
  and `backwards` fill releases each element once it settles, but the peak layer count on a
  mid-range phone is unmeasured. This is the first thing to check if anything feels heavy.
- **Sticky elements inside an arriving block are unverified visually.** `Legal.astro:205`,
  `Glossary.astro:352`, `crowmark.astro:2004` and `pricing.astro:722` are `position: sticky` inside
  units. They translate with their ancestor for the 320px the block takes to settle. Computed
  values are correct and the effect is brief; it has not been watched.
- **`npm run build` was not run.** Hard constraint for this pass. The gate was run directly and the
  dev server compiled every route tested.

---

## The gate

`astro/scripts/check-motion.js`, wired into `npm run build` after `check-design-system.js`. Same
contract as the other five: named exceptions each carrying a written reason, printed every run,
stale entries reported, anything unlisted fails.

Four rules: **TIMELINE** (a scroll-driven timeline may be declared in `motion.css` and nowhere
else), **ENTRANCE** (a `@keyframes` block that starts a property away from rest and returns it),
**OBSERVER** (`IntersectionObserver` anywhere under `src/`), **REVEAL** (a reveal-state class such
as `.is-visible`, matched as a class and never as a word).

**It was proved to fail before it was trusted.** A `TempViolation.astro` reproducing the competing
implementation — observer, `.is-visible`, `@keyframes` from `opacity: 0; translateY(40px)`, and its
own `view()` timeline — was placed in a scratch copy of `src/` and the gate run against it through
`MOTION_SRC`. It reported **6 violations across all four rules** and exited 1. The scratch copy was
then deleted and the real tree re-run clean, exit 0.

### What it found on the current tree

Five recorded exceptions and **nine named debt items**, every one of them a genuine finding that
reading the code had not surfaced:

- **`about.astro` `@keyframes chip-in`** is `from { opacity: 0; transform: translateY(12px) }` on
  four content chips. That is content animated from fully invisible, live on `/about` today. It is
  safer than the three historical failures because it is time-based with `both` fill and no
  observer, so it cannot fail to fire — but it is the same shape.
- **`about.astro` runs a second named view timeline** (`--trust-row`) with its own hand-written
  five-step stagger at 12/17/22/27/32%, written for the right reason and now duplicating what
  `motion.css` owns.
- **The `data-lit` observer exists three times**: properly in `src/scripts/motion.ts`, and as a
  byte-identical inline copy in `crowmark.astro` and `crowmark-buyers.astro`. None of the three
  mentions the other two.
- **`ReasoningTrace.astro` has a fourth observer**, a private count-up on the worked sum — the
  primitive `motion.ts` deleted rather than ported, and one `MarketShape.astro` forbids by name.

None was fixed here. Every one of those files was outside the scope this pass was permitted to
touch, and three of them were being edited by other agents at the time.

---

## Open, not decided

1. **The custom properties belong in `tokens.css`.** `--arrive-*` are defined in `:root` at the top
   of `motion.css` because `tokens.css` was being edited by another agent. **This is deliberate
   follow-up work, not an oversight.** The move should take the `[data-field]` parallax block
   (`tokens.css:1096–1170`) with it in the same pass: that block is motion, not tokens, and it is
   the first entry on the gate's debt list.
2. **Nothing asserts that `motion.css` is imported.** It is one line in `Base.astro`. Delete it and
   all 43 routes lose their arrival silently, and no gate notices. A markup-level check that a
   route's CSS bundle contains `sv-arrive` would close it.
3. **`.surface` is the item hook, so a grid of non-`.surface` items does not ripple.** `/faq`,
   `/changelog` and the four compare pages carry no `.surface` at all; their blocks arrive and
   nothing inside them staggers. Widening the item hook is a decision, not a bug fix, and it should
   be made against measured markup rather than by adding class names.
4. **Layer count on long routes is unmeasured.** See "What was NOT verified".
5. **Safari 26 is unverified.**

---

## Wiring

One line, to be applied by the owner. `astro/package.json`, in `scripts.build`, immediately after
`node scripts/check-design-system.js` and before `node scripts/check-csp.js`:

```
&& node scripts/check-motion.js
```

Full replacement value:

```json
"build": "astro build && node scripts/copy-assets.js && node scripts/copy-cf-config.js && node scripts/build-sitemap.js && node scripts/check-links.js && node scripts/check-seo-parity.js && node scripts/check-content-parity.js && node scripts/check-design-system.js && node scripts/check-motion.js && node scripts/check-csp.js"
```
