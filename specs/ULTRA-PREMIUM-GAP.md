# Ultra premium gap — what actually separates this homepage from Apple, Google and Stripe

Research and design only. Nothing in this document has been implemented, and no file outside this
one was touched. Written 2026-08-02.

Figma: file `wJ9DK6ByFUN6rWe0CpCVPU`, page **`Concept — Ultra premium pass`** = `214:2`.

The owner's instruction that governs this document:

> "Animation and page flow does not look perfect, something is not quite correct, still feels very
> poor despite great design. Think like Apple and Google: if CrowAgent were their website, how would
> they do the home page? ... Their websites look so vibrant and energetic, and the animation and
> automation is very strong, ultra premium. Do your research and suggest. Even if you think we must
> change some colour combinations then do it. All the designs look great and I want to keep them,
> but I want to make it ultra premium."

**Nothing proposed here redraws an approved diagram.** Every change is relighting, rescaling,
retiming or recolouring geometry that already exists and is already approved.

---

## 0. How this was measured, and what could not be

Everything numeric below came out of a live browser on 2026-08-02, same session, same engine, one
probe script run against each page. It is not recalled and it is not estimated.

| | |
|---|---|
| Ours | `http://127.0.0.1:8095/` |
| Theirs | `stripe.com/gb`, `antigravity.google`, `betterstack.com` |
| Viewport | **1280 x 585 CSS px** |

Three honest limits, recorded rather than hidden.

1. **The viewport is 1280, not 1440.** The machine's screen is 1280x720 CSS px and Chrome refuses a
   window larger than the visible screen, so a true 1440 viewport was not obtainable. 1280 is a real
   desktop width and every comparison below was taken at the same width on every site, so the
   comparison holds. Absolute px figures would shift slightly at 1440; the ratios would not.
2. **390 was not obtainable either.** Window resize did not take effect on this display. Mobile
   claims are therefore made from source (`@media (max-width…)` counts per section) and are flagged
   as such. The mobile pass is not done and must not be treated as done.
3. **`linear.app` could not be instrumented.** Its renderer stopped responding to `Runtime.evaluate`
   under the probe, twice. Its hero also rendered **completely blank** in a background tab — the
   headline exists in the DOM at `opacity: 1` and 64px, but its per-character entrance never
   completes when the tab is not foregrounded, so no text paints at all. That is worth recording on
   its own terms: it is precisely the failure mode `DESIGN-DECISIONS.md` forbids us, and the most
   admired dark site in the reference set ships it.

---

## 1. The measurements

| | **CrowAgent** | stripe.com | antigravity.google | betterstack.com |
|---|---|---|---|---|
| Page height @1280 | **5,980px** | 14,338 | 8,844 | 11,689 |
| DOM nodes | **754** | 2,462 | 1,916 | 1,806 |
| `<img>` / `<svg>` | **5 / 31** | 34 / 183 | 21 / 5 | 133 / 136 |
| Canvas (WebGL) | **0** | 2 (2) | **4 (4 WebGL2)** | 0 |
| `<video>` | **0** | 0 | 2 looping muted | 0 |
| Running animations | 47 (16 infinite) | 89 | 7 | **2** |
| `will-change` hints | **0** | 32 | 33 | 2 |
| `perspective` / `matrix3d` | **0** | 0 | 0 | 0 |
| `backdrop-filter` surfaces | **6** | 1 | 9 | **22** |
| Gradient backgrounds | 63 | 25 | 0 | 50 |
| Registered `@property` | **0** | 0 | 0 | **75** |
| `animation-timeline` rules | 0 | 0 | 0 | 0 |
| Noise / grain layers | **0** | 0 | 0 | 0 |
| h1 size / ratio to body | 79.4px / **4.96** | 35.1px / 2.19 | 80px / 5.00 | 53px / 3.31 |
| Font-size range (max/min) | 7.9x | 7.0x | 6.7x | 5.3x |
| Median bg luminance | **0.0055** | 0.9542 | 0.5234 | **0.0055** |
| **Elements with a CSS transition** | **20 / 754 = 2.7%** | — | — | **292 / 1806 = 16.2%** |
| `:hover` rules on the page | **14** | — | — | — |

Per-section, on our page (gradient coverage = area of gradient-painted elements ÷ section area):

| Section | Height | Nodes | Words | Gradient cover | Text cover |
|---|---|---|---|---|---|
| Hero | 920 | 110 | 48 | 0.64 | 0.096 |
| Numbers | 588 | 29 | 37 | 0.46 | 0.221 |
| Lifecycle | 875 | 103 | 30 | 0.43 | 0.139 |
| Both sides | 647 | 58 | 66 | 0.52 | 0.064 |
| **Reasoning trace** | 893 | 76 | 71 | **0.01** | 0.087 |
| Integrations | 977 | 63 | 114 | 0.32 | 0.201 |
| **Final CTA** | 504 | 11 | 39 | **0.01** | 0.196 |

Total homepage copy: **405 words** (not ~250).

### Three hypotheses the measurements kill

**"We need bigger type."** No. Our h1:body ratio is **4.96**. Stripe's is **2.19** and Better
Stack's is **3.31**. Only antigravity.google matches us, at 5.00. The hero is already at the top of
the range. The scale problem is *inside* the sections, where the market numerals render at 57.6px
against a 46.4px heading immediately above them — a ratio of 1.24, which is no contrast at all.

**"We need more colour."** No. Hue histogram of every saturated colour each page paints, bucketed
at 15 degrees:

```
CrowAgent        225° x460 · 165° x179 · 195° x103 · 240° x83 · 270° x44 · 255° x35 · 330° x7
betterstack.com  225° x817 · 240° x310
```

The dark premium comparator paints **two** hue families. We paint **seven**. Adding hues moves us
away from it, not towards it.

**"We need a big animated background like Stripe."** Partly, but it is not the lever. Better Stack
runs **two** animations on the entire page and reads as expensive. Stripe's 89 animations are
overwhelmingly WAAPI-driven UI, not the gradient. The gradient is one WebGL canvas.

---

## 2. What they actually do, technique by technique

Sourced. Where something could not be verified it says so.

### 2.1 Scroll-linked motion vs on-enter triggers — **present there, absent here**

Ours fires once per section on intersection and stops. `animation-timeline` count on our page: **0**.

- **Apple** is the canonical case: `position: fixed` canvas, N pre-rendered JPEGs, frame index =
  scroll fraction. The AirPods Pro page is 148 frames and the full desktop load measured
  **1,609 requests / 55.8 MB**. That is the honest cost, and it is also scroll-jacking by NN/g's
  definition. We should not do this.
- The generalisable half is free: a tall outer section, an inner `position: sticky; top: 0`, and
  scroll progress 0→1 mapped to `transform`/`opacity`. In 2026 that mapping belongs in CSS
  `animation-timeline: view()`, which runs **off the main thread**.
- **Achievable here**, inside `@supports (animation-timeline: view())`, applied to the ambient
  field only. That is scroll-*driven*, not scroll-*jacking*: no pinning, no snapping, no rate
  change. NN/g's rules 6 (never on mobile) and 7 (only below the fold) are not engaged, because
  nothing takes over the scroll.

### 2.2 Depth and parallax — **absent here, and it is measurable**

Grep across all seven section components: **zero** occurrences of `perspective`, `rotateX`,
`rotateY`, `translate3d`. There is no 3D on this page in any sense. The hero strata are an
*isometric drawing*: three flat polygons with roughly 4%-alpha fills and 1.25px strokes. They do not
occlude each other, cast onto each other, or have any thickness, so they read as line art.

- **antigravity.google** runs four WebGL2 canvases, one of them full-viewport (1265x585 CSS)
  directly behind the hero, plus two looping muted autoplay videos.
- **Better Stack** puts its hero artefact in real perspective and layers three depth planes behind
  it.
- **Achievable here without any canvas**: give each plane an opaque body clone offset behind it, so
  it occludes. See §4 lever 03 and the hero pair in Figma.

### 2.3 Scale contrast — **partly present, misapplied**

See §1. The hero is fine. The sections are flat: our craft table already specifies the Better Stack
big-numeral recipe (162° white→`#939DB8` ramp, **0.5px white stroke** to restore the weight that
gradient fill removes, `drop-shadow 0 2px 2px rgba(0,0,0,.9)`) and **it is used nowhere on the
homepage**. Better Stack's whole hero argument is one enormous numeral pair — `$55,574` against
`$687` — with the derivation in fine print immediately beneath. That pattern is exactly ours: a
figure, and where it came from.

### 2.4 Luminance and saturation — **the owner's colour question, answered with numbers**

Median background luminance: **ours 0.0055, Better Stack 0.0055.** Identical. We are not too dark
relative to the closest comparator.

What differs is the **ladder**. We have one colour (`--c-bg #05070E`) plus one 55%-alpha card, used
on two of seven sections. Better Stack steps its panels off its floor and paints **22**
backdrop-filtered surfaces to our 6. Stripe and antigravity.google solve the same problem from the
other end by being light pages with a saturated object in them (max background luminance 1.0).

So: the answer is not a new hue and not a lighter page. It is **value separation and chroma
amplitude**. Full recommendation in §3.

### 2.5 Surface texture — **absent here, absent on all four of theirs too**

Measured noise/grain layers: 0, 0, 0, 0. None of the four reference pages ships detectable grain.
It is still worth adding here for one specific reason: our ambient orbs are 8-bit radial gradients
over near-black, which is the exact condition where banding shows, and it is visible in the
both-sides section. 736 bytes of URL-encoded `feTurbulence` at alpha .035 fixes it. Do not base64
it — that is +33%.

### 2.6 Micro-interaction density — **this is the gap**

**2.7% of our elements carry a transition. 16.2% of Better Stack's do.** Our entire homepage has
14 `:hover` rules. Four of seven sections — hero, lifecycle, numbers, integrations — have **zero**.
The hover recipe exists and is good (`surfaces.css` lines 299-311: border → `--c-border-glow`,
background → `--c-card-hover`, `--shadow-card-hover`, `translateY(-4px)`, correctly gated behind
`@media (hover: hover)` and disabled under reduced motion) — and it is scoped to blog and compare
cards, which are not on the homepage.

Nothing on this page answers a cursor. That is what "dead" is.

### 2.7 Whitespace and rhythm — **we have more air than they do, not less**

Our text coverage per section runs 0.064 to 0.221. Air is not the problem. The problem is that the
air surrounds **very little**: 754 nodes and 5 images across 5,980px, against 1,806 nodes and 133
images across 11,689px on Better Stack. See §6.

### 2.8 Continuous canvas / WebGL — **theirs, and mostly not ours**

Stripe's hero is a documented WebGL mesh: a `minigl` wrapper plus a `Gradient` class, ~550 lines
(~10 KB), four colours fed from CSS custom properties, a subdivided plane at `[0.06, 0.16]` segment
density, vertex displacement driven by 3D simplex noise. It is self-hosted — **no third-party
origin** — so CSP is not the blocker. JavaScript is: the page would have no hero without it. That
fails our "correct with no JavaScript before any animation runs" rule at the hero, which is the one
place it must not fail. See §5.

---

## 3. Colour recommendation

**Keep the palette. Change the ladder and the amplitude.**

### The markers do not move. At all.

| | Hue | Meaning | Status |
|---|---|---|---|
| `--c-teal` `#2DD4BF` | 172° | verified, traced to a recorded commitment | **unchanged** |
| `--c-cyan` `#22D3EE` | 187° | interactive only | **unchanged** |
| `--c-orchid` `#C77DFF` | 277° | refused or flagged | **unchanged** |

Every station dot, every check, every strike-through, every refusal keeps exactly the value it has
today. The proposal does not touch a single element that carries meaning.

### What changes: four opaque surface steps instead of one

| Step | Value | Luminance | Use |
|---|---|---|---|
| Page floor | `#03040A` | 0.0013 | the gaps between sections, deepened ~40% |
| Section base | `#05070E` | 0.0021 | unchanged, the current `--c-bg` |
| Raised panel | `#0E1220` | 0.0064 | **new, opaque** — replaces the 55%-alpha card |
| Lit surface | `#161B2F` | 0.0128 | **new** — a surface directly under a light |

Alternate base and raised down the page so a section is either floor or raised and never ambiguous.
Every raised step carries the 1px gradient hairline (white 30% top → 5% bottom) and the five-layer
shadow ladder the craft table already specifies and that only two elements on the site use.

This is defensible under the standing rule that **colour carries meaning, not decoration**: all four
values are the same hue family the page already uses, and none of them is a marker.

### And chroma rises in exactly one place: the atmosphere

The ambient orb goes from violet 30% / teal 10% to **violet 52% / teal 26%**. `DESIGN-DECISIONS.md`
already opens light, bloom, atmosphere and surface gradients to the full range; this spends that
permission. Grain at alpha .035 ships with it, because raising those stops is what exposes banding.

### One thing the owner should rule on

The single largest available lift in "vibrancy" is not a hue change — it is **one light-value
section**, the way Stripe and antigravity.google get their energy (background luminance 1.0 against
our 0.0021). A single near-white band, mid-page, would be the biggest perceptual change available
under any constraint.

**It conflicts with a settled owner decision** — `HOMEPAGE-DECISION-TABLE.md`: *"Current theme
stays, and is universal across the site."* I am not proposing it around that decision. I am naming
it, once, because the owner has explicitly reopened colour, and then leaving it closed unless the
owner reopens it deliberately.

---

## 4. The ranked levers

### 01 — Micro-interaction density · **THE SINGLE BIGGEST LEVER**

2.7% → target ~15%. Extend the existing `surfaces.css` hover recipe to every homepage station,
plane, numeral column, integration tile and CTA. Add one cursor-tracked spotlight per section:
`pointermove` sets `--mx` / `--my` on the section, a `radial-gradient` at those coordinates on a
`pointer-events: none` overlay does the rest — four lines of JS, no library, no third-party origin,
and all the work stays in CSS off the JS thread.

*Constraints: clean.* No JS needed for the hovers themselves. `@media (hover: hover)` leaves touch
alone. `transform: none` under reduced motion, which `surfaces.css` already does correctly.

### 02 — The sections sit on one surface · structural

Four opaque steps (§3). Fix the two sections with no atmosphere at all (reasoning trace 0.01, final
CTA 0.01 against 0.32–0.64 elsewhere) — that is not a decision anybody took, it is an omission.

*Constraints: clean.* Pure CSS, no payload, no JS.

### 03 — The drawings are wireframes, not objects · depth

No WebGL, no canvas. Per plane: an opaque body clone offset 18px behind it so the planes occlude
each other; a top-lit wash 34–46% → 5–8% instead of a 38% → 0% single-hue fill; opacity floor lifted
0.62/0.80/1.00 → 0.86/0.93/1.00 so no plane is half-dead; and a three-part shadow — 12px hue core,
40px violet halo, 34px black cast at y+22. Two-colour glow, per the craft table.

See the Figma pair: same geometry, nothing redrawn.

*Constraints: clean and cheap.* Fills and box-shadows on shapes that already exist.

### 04 — Scale contrast inside a section · typography

Market numerals 57.6px → ~128px on the Better Stack recipe. Step counters `01`–`05` 11px → 64px on
the same recipe. The heading above them stays where it is; the contrast comes from the numeral.

*Constraints: watch the axe gate.* Gradient-filled text needs the same `@supports` fallback the
eyebrow already ships, because this repo has already shipped an invisible-text P0 caused by an
inherited `-webkit-text-fill-color`.

### 05 — Motion is ambient, never positional · motion

47 running animations, 16 infinite, and all 16 are blur fields scaling between 1.00 and 1.04. The
light on a section changes; its position never does. Scrolling past feels like passing a lit sign
rather than moving through a scene.

Add scroll-linked parallax on the ambient field only, inside
`@supports (animation-timeline: view())`, animating `transform` on an `aria-hidden` layer that is
already behind everything. Three layers at 0.94x, 1.0x and 1.06x of scroll.

*Constraints: needs `@supports`.* `animation-timeline` is ~84% and still behind
`layout.css.scroll-driven-animations.enabled` in Firefox Release (on by default in Nightly 136+
only; `timeline-scope` and `animation-range-*` still unimplemented). The fallback is the current
static state, which is already correct. Reduced motion drops the block entirely. This is
scroll-driven, not scroll-jacking.

### 06 — Surface texture · finish

One 736-byte URL-encoded `feTurbulence` data URI — `fractalNoise`, `baseFrequency .65`,
`numOctaves 3`, `stitchTiles="stitch"` — at alpha .035, on a `pointer-events: none` `::after` over
each section that carries a gradient. `stitchTiles` is the load-bearing attribute; without it the
tile seams show. Tile a small region; never filter a full-viewport rect, because `feTurbulence` is
rasterised once at the filter region's size.

*Constraints: clean.* 736 bytes inline, no request, no third-party origin, no JS.

---

## 5. What they do that we genuinely cannot

Stated plainly, because pretending otherwise would be the more expensive mistake.

1. **Stripe's WebGL mesh gradient.** CSP is not the blocker — it is self-hosted. The blocker is that
   the hero would not exist without JavaScript. A CSS approximation (stacked radial gradients,
   `filter: blur()`, `@property`-animated positions, plus grain to kill banding) gets an aurora, but
   not the vertex-displaced fBm-warped mesh, which needs per-pixel noise.
2. **Apple's pinned image sequence.** 148 frames, 55.8 MB measured. It is scroll-jacking, the
   payload is the exact defect the legacy site was rebuilt to fix, and NN/g found users read it as
   a bug. Out on three independent grounds.
3. **antigravity.google's four WebGL2 canvases and two looping videos.** Same JS objection, plus
   payload. Their typewriter hero is a second reason: the headline does not exist until JS types it.
4. **Linear's per-character entrance.** Observed rendering the hero completely blank in a background
   tab. This is the failure our motion grammar was written to prevent.
5. **Better Stack's 133 images and its 11,689px page.** Not a technique. It is a company with a
   product to photograph and customers to name. We have neither, and the standing rule that product
   screenshots on the public site are a credibility defect is correct and stays.
6. **A hosted font, a CDN, an external video.** `astro/scripts/check-csp.js` fails the build on any
   third-party origin, and that is a good rule.

---

## 6. And the part that is not technique

The homepage is **405 words across 5,980px**. Better Stack is 11,689px. antigravity.google is 8,844.
Stripe is 14,338. **Our page is roughly half the length of every site it is being compared against**,
and the density of things to look at is lower again: 754 DOM nodes and 5 images against 1,806 nodes
and 133 images.

A short page with a lot of air reads as calm. It does not read as expensive. Six of the seven
sections are a single figure surrounded by space, and however well that figure is lit, there is no
second thing to look at, no detail that rewards leaning in, and nothing that changes when you
return. Some of the perceived gap is pacing and density, and relighting will not close it.

Two honest consequences:

- The levers in §4 will make the page look considerably better. They will not make it feel *long*,
  and length is part of what the owner is reading as "premium".
- If the owner wants the antigravity.google feeling specifically, the missing ingredient is not
  motion. It is that antigravity.google gives an entire 100vh to a wordmark, one line and two
  buttons, and then has eight thousand more pixels of substance behind it. We have the restraint
  already. We do not yet have the substance behind it.

There is also a plain perceptual fact worth naming: a static screenshot of a good design can feel
dead when the design is fine. The reasoning trace measured 0.01 gradient coverage and the final CTA
0.01 — those two sections *are* under-lit and the owner is right about them. The hero, at 0.64, is
not, and it may simply need the depth of lever 03 rather than more light.

---

## 7. Figma

Page **`Concept — Ultra premium pass`** — `214:2`.
Deep link pattern: `https://www.figma.com/design/wJ9DK6ByFUN6rWe0CpCVPU/?node-id=<id with ':' → '-'>`

| Frame | Node | What it is |
|---|---|---|
| HERO — ships today (unchanged) | `214:3` | Verbatim clone of approved `43:3`. Reference. |
| HERO — proposed relight | `214:33` | **Identical geometry.** Body clones behind each plane, top-lit hue-ramped washes, opacity floor lifted, three-part shadows, ambient chroma 0.30→0.52, page-colour vignette, grain at .035. |
| R3 — ships today (unchanged) | `214:63` | Verbatim clone of approved `65:2`. Reference. |
| R3 — proposed relight | `214:92` | **Identical geometry.** Raised opaque section floor with the 1px gradient hairline and the five-layer shadow ladder; numerals 11px→64px on the Better Stack recipe; rail 1px→2px specular with a two-colour glow; stations get core + halo; the refusal gets its own orchid light. |
| COLOUR STUDY | `220:2` | Current vs proposed, markers held constant, with the hue histograms and the four-step ladder. |
| RANKED LEVERS | `221:2` | The six levers with the measured evidence and the constraint verdict on each. |

Created nodes inside those frames: `216:2`–`216:4` (plane bodies), `217:2`–`217:6` (vignette, grain,
labels), `219:2` (raised floor).

**Two sections were relit rather than all six**, deliberately: the hero because it is the page's
first impression and the one whose depth failure is structural, and R3 because it measured the
lowest atmosphere on the page (0.01) and is the clearest demonstration of the scale-contrast lever.
The same six levers apply unchanged to numbers, lifecycle, both sides, integrations and the final
CTA; if the owner wants those built out as pairs too, that is a straightforward extension of this
page and not a new design.

---

## 8. Open, and needing an owner decision

1. **The light-value section** (§3). Conflicts with a settled decision. Named once, then closed.
2. **The mobile pass is not measured.** 390 could not be obtained on this machine. Every lever here
   needs re-checking at 390 before implementation, especially lever 04: a 128px numeral at 390px
   wide is a different design, not the same design smaller.
3. **Lever 05 needs a Firefox decision.** ~16% of users get the static fallback. That is correct
   behaviour, but it means the parallax is a bonus rather than the fix, and it should not be counted
   as the answer to "the animation is not strong enough".
