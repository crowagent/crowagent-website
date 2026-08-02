# Homepage section 5 — port notes

The last unported homepage section. Its OA-01 blocker is resolved (the 40/30/20% weightings are
now labelled illustrative on the legacy page), so this is engineering work only.

Source: `index.html`, `<section id="rz-engine">`, roughly lines 4900–5600 including its script.

## What it is

A five-beat reasoning trace played on one worked award question. Eyebrow "Run the real engine",
h2 "Watch it reason, and watch it hold the gate".

| Beat | Name | What it shows |
|---|---|---|
| 01 | Retrieve | three sources, "and there is never a fourth" |
| 02 | Ground | four candidate figures checked against recorded commitments |
| 03 | Compute | `4 jobs × £27,000 per job per year = £108,000` |
| 04 | Check | 3 traced, 1 untraced (local supply chain spend) |
| 05 | Cite | citations attach to the figures themselves |

The point of the section is the fourth figure being **dropped**: "Local supply chain spend · no
recorded commitment". That is the same thesis as the hero ("Four claims. Three survive."), and it
is the reason the section exists. Any port that loses the dropped figure loses the argument.

## VERIFIED WORKING — do not "fix" this

I suspected the compute step was broken, because sampling `[data-rz-count]` returned `£0` at every
scroll position I tried. **It is not broken.** The value is driven by a timed beat sequence, not by
scroll, and `SUM_FROM = STARTS[3] + 300ms` sits several seconds into the timeline. Sampled once per
second with the row held in the viewport:

```
prefers-reduced-motion: no-preference   £0 -> £99,977 -> £107,978 -> £108,000
prefers-reduced-motion: reduce          £108,000 immediately
```

Both correct. The reduced-motion branch renders the final frame and stops (`render(TOTAL - 1)`),
which is the right behaviour and is already implemented.

The lesson worth carrying: a value mid-animation is not a defect, and 700ms of waiting is not a
measurement. This is the same trap as counting `alt` attributes on images that 404 — sampling the
mechanism instead of the outcome, in the other direction.

## What the port has to preserve

1. **The dropped figure.** Non-negotiable; it is the thesis.
2. **The reduced-motion path.** Final frame rendered immediately, no animation. Already correct in
   the legacy implementation.
3. **Content visible without JS.** The legacy markup authors `£108,000` into the HTML and the
   script animates from zero. Keep that ordering — the static document must read correctly with
   the script removed. This is the inverse of the pattern that once left four homepage sections
   permanently invisible, and `Lifecycle.astro` already documents it.
4. **`aria-live="off"`** on the counting element. A number ticking 15 times a second must not be
   announced.
5. **The illustrative label.** `Illustrative award criteria for this worked example`, above the
   40/30/20% block. This is the OA-01 fix; it must travel with the port.

## What can be dropped

The SVG wire geometry (`WIRES`, `measure()`, `pathD`, `boxWithin`, `anchor`) exists to draw
connecting curves between boxes, and it re-measures on resize and after webfont settling. It is the
single largest and most fragile part of the section. The Astro rebuild should decide deliberately
whether the wires earn their complexity, rather than porting them because they are there — the
five-beat sequence carries the argument on its own.

## Suggested shape

`astro/src/components/sections/ReasoningTrace.astro`, with the five beats as a typed `BEATS` array
the way `Lifecycle.astro` and `BothSides.astro` hold their content, so adding a beat is data rather
than markup. Animation in a `<script>` that enhances an already-correct static document.
