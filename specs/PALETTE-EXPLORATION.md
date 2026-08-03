# Palette exploration — reducing teal density

Raised by the owner, 2026-08-03, verbatim:

> "Can we also think to reduce excessive use of teal/green? I am thinking one of the reasons for
> using teal and green was that we started the idea from sustainability, and now we are focusing on
> bid. However I think the logo gradient is still good to keep. I am thinking if we can reduce
> slightly the use of green/teal and use a combination of white, black, teal and purple."

**Nothing is decided.** This file records a measurement, eight rendered variants, and a
recommendation. The owner decides from the renders. Nothing in `astro/` has been changed.

**The logo gradient is untouched in all eight variants.**

Renders: `http://localhost:8096` · Figma file `wJ9DK6ByFUN6rWe0CpCVPU`, page **"Palette — variants"**
(`256:2`).

---

## 1. The measurement, because "excessive" is checkable

Method, and it is reproducible: `.shots-tmp/measure-hues.mjs` renders six built routes headlessly at
1440px with `prefers-reduced-motion` forced, and `.shots-tmp/measure-hues2.mjs` bins every third
pixel by **CIE LCh chroma**, not by HSL hue. That distinction is load-bearing. `--c-bg #05070E` has an
HSL saturation of 0.47 and bins as "blue"; its LCh chroma is 3.6, which is a near-black. A first pass
using HSL reported the page as 30% blue, which was an artefact of the metric and not a fact about
the site. The bands are C\* < 8 ground, 8–22 tinted, ≥ 22 a hue a reader can name.

**21,488,160 sampled pixels across `/`, `/pricing`, `/crowmark`, `/compare`, `/blog`, `/sources`:**

| Band | Share |
|---|---|
| Neutral ground (the four surface steps, white and grey type) | **69.24%** |
| Tinted (hairlines, muted type, panel washes) | **29.25%** |
| **Painted hue** (C\* ≥ 22) | **1.51%** |

Of that painted 1.51%:

| Family | % of all pixels | % of all paint |
|---|---|---|
| violet | 0.896 | **59.4** |
| teal | 0.478 | **31.7** |
| cyan | 0.073 | 4.8 |
| blue | 0.041 | 2.7 |
| orchid | 0.019 | 1.2 |
| red / yellow | 0.002 | 0.2 |
| **green** | **0.000** | **0.0** |

### Three findings, and the first one corrects the owner

**Green does not exist on this site.** Not "a little". Zero, to three decimal places. Every pixel
that reads green is teal at 172°. The word should be dropped from the discussion, because chasing a
green that is not there would produce the wrong fix.

**Teal is not excessive by area.** 0.478% of pixels is not a lot of anything. Anyone arguing from
area alone would conclude there is no problem, and they would be wrong.

**Teal is excessive by monopoly, and that is what the owner is actually seeing.** Violet's 59% share
comes from exactly two places — the homepage hero field and the blog's duotone photograph treatment.
Remove those two and the picture inverts:

| Route | painted % of route | teal's share of that route's paint |
|---|---|---|
| `/pricing` | 0.443% | **67%** |
| `/crowmark` | 0.540% | **84%** |
| `/compare` | 1.485% | **88%** |
| `/sources` | 0.654% | **69%** |

On four of six routes teal is essentially the only colour on the page. It is not that there is too
much of it; it is that there is nothing else. That reads as a single-hue brand, and a single-hue
teal brand reads as sustainability.

This corroborates `ULTRA-PREMIUM-GAP.md`'s finding that we paint seven hue families where the dark
comparator paints two — but it sharpens it. The problem is not the seven. Five of the seven are
rounding errors. The problem is that of the two that are real, one of them is doing everything.

### 2. And teal is not currently carrying its meaning

379 references to `--c-teal` / `--c-teal-dark` / `--c-teal-glow` / `--c-border-glow` / `#2DD4BF` /
`#0CC9A8` in `astro/src`, classified by the property they paint (`.shots-tmp/teal-class.mjs`,
raw rows in `.shots-tmp/teal-refs.json`):

| What the teal paints | Count | Share |
|---|---|---|
| **Interactive states** — focus rings (57), hover (19), links and chrome (22), buttons (7) | **105** | **27.7%** |
| Atmosphere and decoration — glows, fields, gradients, rules, icon tints | 71 | 18.7% |
| **Semantic "verified" marker** | **57** | **15.0%** |
| Could not be classified automatically | 146 | 38.5% |

The unclassified 146 were sampled by hand. They are overwhelmingly bare `color: var(--c-teal)` in
`layouts/Legal.astro`, `layouts/Compare.astro`, `layouts/Glossary.astro`, `layouts/Sector.astro`,
`pages/faq.astro`, `pages/roadmap.astro`, `pages/sectors/index.astro`, `pages/partners.astro`,
`pages/cookie-preferences.astro` — pages where **nothing is being verified at all.**

**So the collision the brief warned about does not exist.** `PLATFORM-CHARTER.md` binds
*"teal verified, violet and orchid refused or flagged, cyan interactive"*, and reducing teal looked
like it would cost meaning. It does not, because the meaning is already gone: at most 15% of teal
instances are markers, and 27.7% are painting the job the charter explicitly assigns to **cyan**.

Teal is the site's default accent. It is not its marker. **Reducing teal is not a threat to the rule
that colour carries meaning — it is the only way to make that rule true.** The charter's own test
("change the hue and ask whether the meaning changed") fails today on the great majority of teal
elements: change them and nothing means anything different.

---

## 3. The eight variants

Every variant renders the **same** strip so they are comparable: hero with gradient eyebrow capsule,
centred section head with its own capsule, a three-card grid, and a marker moment where verified,
at-risk and refused all appear on one panel. Same content, same layout, same four surface steps,
same token architecture. Only palette values change.

Node IDs are recorded here so they are never re-derived. Deep link pattern:
`https://www.figma.com/design/wJ9DK6ByFUN6rWe0CpCVPU/?node-id=<id with ':' → '-'>`

| | Variant | Node | Painted | Teal | vs control | Families | Worst AA |
|---|---|---|---|---|---|---|---|
| **V0** | Control — today | `256:3` | 1.312% | 0.441% | baseline | 3 | 6.34:1 |
| **V1** | Ink, single teal | `257:2` | 0.091% | 0.072% | **−84%** | 1 | 5.69:1 |
| **V2** | Neutral-dominant, teal + violet | `257:68` | 0.461% | 0.073% | **−83%** | 2 | 7.41:1 |
| **V3** | Violet-led, teal markers only | `257:134` | 1.271% | 0.071% | **−84%** | 3 | 7.38:1 |
| **V4** | Teal out of the semantic system | `257:200` | 0.995% | 0.000% | **−100%** | 2 | 6.34:1 |
| **V5** | Ink and orchid | `258:2` | 0.576% | 0.072% | **−84%** | 2 | 7.46:1 |
| **V6** | White as a paint | `258:68` | 0.284% | 0.078% | **−82%** | 2 | 7.23:1 |
| **V7** | Same density, narrowed ramp | `258:134` | 0.683% | 0.440% | −0.2% | 2 | 7.41:1 |

"Painted" and "Teal" are measured on the rendered PNG by the same LCh method as §1, so they are
comparable with the site figures above and with each other.

### What each one does to the semantic system

**V0 — Control (today).** Teal is verified AND interactive AND the generic accent. Three jobs, one
hue. Included so the owner can see what they are comparing against rather than remembering it.

**V1 — Ink, single teal.** Near-monochrome; teal is the only hue on the page and appears only where
something is verified. Interactive becomes white. Refusal is carried by **form** — a strike, a dashed
rule — plus a neutral grey, not by a hue. Amber survives for at-risk because it is off the ramp.
*The known cost:* the refusal signal is the weakest of the eight, and the refusal signal is the
product's entire position against competitors selling success-rate uplift. Strongest restraint,
weakest argument.

**V2 — Neutral-dominant, teal + violet.** The owner's own brief, executed literally: white, black,
teal, violet, and nothing else is painted anywhere. Teal = verified, violet = refused, cyan and pink
and blue and green leave the system. *Stated flaw, shown as built rather than quietly fixed:*
interactive and refused are the **same violet**, so a hover and a refusal would read identically.
The fix is to move refused up to orchid `#E4A3FF`, which is what V3 does.

**V3 — Violet-led, teal markers only.** The surface ladder itself is warmed toward violet, so the
page reads purple without any *element* being painted. Teal is then the only cool mark on a violet
page, which makes it louder at a sixth of the density. Refusal moves to orchid to stay separable
from the violet ground. This is the variant that most changes the brand's temperature.

**V4 — Teal out of the semantic system.** The hard test the brief asked for. Verified is carried by
**white**, which is the strongest thing on a near-black page and needs no hue. Teal appears only in
the logo. *The cost is real and is why it is shown rather than described:* white already carries
every heading and every paragraph, so a white tick has to earn "verified" from form alone, and the
one signal the product cannot afford to weaken is the one that says a figure was checked.

**V5 — Ink and orchid.** Surface steps drop their blue cast and go genuinely neutral, so the only
colour cast on the page is the one we paint. Orchid is the single accent; teal survives as the
verified tick. *Same collision as V2, one hue further round:* orchid does interactive and refused.

**V6 — White as a paint.** White stops being only type and becomes a material: white rules, white
fills, white edges, white focus. Teal = verified, violet = refused, and **neither ever appears on a
control**. This is the variant that attacks the measured defect directly, because 27.7% of teal
instances today are focus rings, hovers, links and buttons.

**V7 — Same density, narrowed ramp.** The minimum-change option, included deliberately as a
control on the control: teal keeps every job it has today and only the ramp narrows from seven hue
families to two. It shows whether narrowing the ramp *alone* is enough. Measured, it is not — teal
density is unchanged at 0.440%, and the pages that read teal-monopolised still do.

---

## 4. WCAG AA — all eight pass, and here are the numbers

Every foreground (`text`, `sub`, `muted`, `interactive`, `verified`, `refused`, `at-risk`) checked
against **all four surface steps** (`floor`, `bg`, `raised`, `lit`), plus each button label against
its own fill. Computed in `.shots-tmp/palettes.mjs`; run `node .shots-tmp/palettes.mjs` to reproduce.

| | Worst text-on-surface pair | Ratio | Button label on fill |
|---|---|---|---|
| V0 | refused on lit | 6.34:1 | 10.81:1 |
| V1 | refused on lit | **5.69:1** | 20.26:1 |
| V2 | interactive on lit | 7.41:1 | 20.13:1 |
| V3 | interactive on lit | 7.38:1 | 8.76:1 |
| V4 | refused on lit | 6.34:1 | 20.13:1 |
| V5 | muted on lit | 7.46:1 | 20.19:1 |
| V6 | refused on lit | 7.23:1 | 20.13:1 |
| V7 | refused on lit | 7.41:1 | 10.81:1 |

AA for body text requires 4.5:1. The worst value anywhere in the set is **5.69:1** (V1's neutral
refusal grey on `--c-lit`), so every variant clears AA on every text colour on every surface, and
five of the eight clear AAA's 7:1 on their worst pair too. **No variant was excluded on contrast.**

Per-variant full matrices are in `.shots-tmp/palette-audit.json` and printed on the comparison page.

---

## 5. Recommendation: V6, "White as a paint"

**Reason, in one line:** it is the only variant that fixes the *measured* defect rather than the
reported symptom, and it is simultaneously the owner's literal brief.

Expanded:

1. **It removes teal from the 27.7% of instances that were never verified anything.** Focus rings,
   hovers, links and buttons all become white. That is the largest single block of teal on the site
   and it is the block that is semantically wrong today.
2. **Teal therefore keeps its meaning by getting rarer, not by being redefined.** 0.078% of pixels
   against 0.441% — an 82% reduction — while the charter rule survives verbatim. Nothing has to be
   renegotiated.
3. **Violet takes the second semantic axis cleanly.** Refused = violet, and because interactive is
   white, there is no collision. V2 and V5 both have one; V6 does not.
4. **It is white, black, teal and purple**, which is what the owner asked for, without a light theme
   and without touching the logo gradient.
5. **It is the calmest of the eight that still argues.** 0.284% painted against the control's 1.312%,
   with two hue families instead of three, which moves us toward the two the dark comparator paints.
6. **White as interactive is the researched answer, not an invention.** It is what Linear and Vercel
   do, and it is already how the primary button behaves on the reference sites in the craft table.

**Runner-up: V2**, if the owner prefers violet controls to white ones — but V2 must move `refused` to
orchid `#E4A3FF` first, or a hover and a refusal are the same colour.

**Argued against: V4.** It is the intellectually cleanest answer to "demote teal entirely", and it
should still be rejected. Verified is the signal the product cannot afford to weaken, and white is
the one colour on the page that already means five other things.

---

## 6. What each option costs to implement

All eight are **token value changes only**. No new architecture, no new surface steps, no new
tokens except where noted. The four surface steps and the existing `--grad-*` system are untouched
in structure.

| | Token edits in `tokens.css` | Sweep needed in components | Real effort |
|---|---|---|---|
| **V6** | 6 values: `--c-violet`, `--c-orchid`, `--c-border`, `--c-raised`, `--c-lit`, `--grad-spectrum` stops | **Yes, and it is the whole job:** ~105 interactive teal references move to white or to a new `--c-interactive`. Concentrated in `Nav.astro`, `Footer.astro`, `ShareRow.astro`, `NewsletterForm.astro`, `forms.css` and the six `layouts/`. Plus ~146 bare `color: var(--c-teal)` accents on non-verifying pages. | **Largest, and it is unavoidable in any option that actually reduces teal.** Best done as one sweep behind a new `--c-interactive` token, so the next change is one value. |
| **V2** | 5 values + move `refused` to orchid | Same sweep as V6, targeted at violet instead of white | Same as V6 |
| **V3** | 9 values — the four surface steps all shift hue, plus brand and border | Same sweep, plus every hardcoded surface assumption re-checked against a violet ground | **Largest.** The surface shift touches every screenshot, every gradient and the blog duotone recipe |
| **V5** | 9 values — surface steps go neutral | Same sweep | Large, and carries a stated collision |
| **V1** | 8 values, plus refusal must be re-expressed as **form** in `ReasoningTrace.astro` and the ledger components | Same sweep, plus new dashed/strike treatments designed | Large, and it is the only one needing new *drawing*, not just new values |
| **V4** | 5 values | Same sweep, plus every verified mark re-drawn so form carries the meaning white cannot | Large |
| **V7** | **3 values only** — `--grad-spectrum` stops, `--c-cyan` retired, `--c-pink` retired | **None.** No component changes at all | **Hours.** And measurably it does not solve the problem: teal density is unchanged |

**The honest summary of cost:** the token edit is trivial in every case and is not where the work is.
The work is the ~250-reference sweep moving teal off interactive states and off pages that verify
nothing, and **that sweep is identical for V1, V2, V3, V4, V5 and V6.** Choosing between them costs
nothing extra. Only V7 avoids the sweep, and only V7 fails to change anything.

**The one piece of new architecture worth adding**, whichever is chosen: a `--c-interactive` token.
Today "the interactive colour" is not nameable, which is precisely how teal came to be it by
accident on 105 elements. A named token makes the next change a one-line edit and gives
`check-design-system.js` something it can enforce.

---

## 7. Open, not decided

- **The owner has not chosen.** Nothing here is a lock. Recording that explicitly because this
  file's neighbours in `specs/` have twice recorded an agent's recommendation as an owner decision.
- **Cyan's future is unresolved in every variant.** The charter says cyan = interactive; V1, V4 and
  V6 make interactive white, V2 makes it violet, and none of them says what cyan is *for* afterwards.
  Retiring `--c-cyan` is the honest answer and it needs an owner ruling, because it is a brand colour.
- **`--c-pink` is already effectively dead** and survives only in `--grad-spectrum`. Every variant
  except V0 drops it. Nobody has ruled on removing it.
- **The blog duotone treatment is the second-largest violet source on the site** (13.7% of the
  blog index's pixels) and none of these variants re-costs it. If violet becomes the interactive or
  refusal colour, the photograph wash may need re-tuning so a photograph does not read as a state.
- **No ADR exists for any of this.** The charter already lists missing ADRs as the remaining
  governance gap; whichever variant is chosen should get one.

---

## 8. Reproducing the numbers

```
node .shots-tmp/measure-hues.mjs     # renders 6 routes headlessly, writes shots + raw counts
node .shots-tmp/measure-hues2.mjs    # LCh binning of those shots -> the §1 table
node .shots-tmp/teal-class.mjs       # the 379-reference classification -> §2
node .shots-tmp/palettes.mjs         # the WCAG audit -> §4
node .shots-tmp/variant-hues.mjs     # per-variant density -> §3
node .shots-tmp/build-compare.mjs    # regenerates .palette-review/index.html
```

The measurement server ran on **8097** and the review page on **8096**. Ports 8092 and 8095 were not
touched.
