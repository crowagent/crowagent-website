# The platform in the website's V6 palette

A reviewable preview of what `app.crowagent.ai` would look like wearing the
marketing site's colours, in both dark and light, with every foreground and
background pair measured rather than eyeballed.

**Open it at `http://localhost:8120/`.** Dark is the default, matching the
platform's own standing decision. The toggle sits top right.

Nothing in the platform repo was touched. This directory is self contained: no
Google Fonts, no CDN, no remote request of any kind. The three Plus Jakarta,
Inter and JetBrains Mono faces are copied in from `Assets/fonts/`.

> **All content on the page is placeholder.** Every figure reads as zeros on
> purpose so nothing here can be mistaken for platform data. The labels,
> statuses, column headers, button text and empty state copy are the real
> strings from the platform's own catalogues; only the values are fake.

## Files

| File | What it is |
|---|---|
| `index.html` | The preview. App shell, stat cards, dense table, forms in four states, buttons, tabs, modal, toasts, status pills, empty state, and a live measurement panel. |
| `theme.css` | The token layer. Dark verbatim from the website; light derived. |
| `app.css` | The components. Not one colour literal below its header. |
| `contrast.mjs` | Computes every ratio and writes `ratios.json`. Run `node contrast.mjs`. |
| `ratios.json` | The measurements. The page renders this rather than quoting numbers. |
| `verify.mjs` | Drives a real browser, measures what is actually painted, fails on any contrast failure, console error or third party request. Run `node verify.mjs`. |
| `shot-dark.png`, `shot-light.png` | Full page captures from the last verification run. |

## Verification status

```
dark   elements measured: 487   contrast failures: 0
light  elements measured: 487   contrast failures: 0
console errors: 0     third-party requests: 0
```

`contrast.mjs` measures the values I intended to ship. `verify.mjs` measures
what Chromium actually paints: it walks the rendered DOM, reads
`getComputedStyle` on all 487 text bearing elements, resolves each one's true
backdrop by compositing every ancestor background, and applies the correct
threshold for its size and weight. Both report zero, deterministically across
five consecutive runs.

### The gate is fail proven, because a green that cannot go red proves nothing

Two known bad values were injected and the run repeated:

| Injected | What it is | Result |
|---|---|---|
| `--c-text-muted: #626C82` in light | the article pane's muted ink, which I rejected in section 2 | **6 failures**, the worst at **4.38:1** on the sidebar, which is exactly the figure section 2 claims and is therefore independently confirmed rather than asserted |
| `--c-verified: #2DD4BF` in light | the un-derived dark teal on a light ground | **7 failures**, pills at **1.62:1** on their own wash and the stat card mark at **1.86:1** on a panel |

Both were reverted and the run returns to zero. The gate covers the ink path and
the mark path, and it distinguishes correct values from plausible wrong ones.

### One flake was found and removed rather than lived with

An early version of the measurement panel rebuilt its DOM on every mode change.
The audit then reported 13 white-on-white failures on one run and zero on the
next from identical files: a node created in the same turn as a theme change can
report the previous mode's inherited `color` to `getComputedStyle`, and whether
it does is a timing race. The paint was always correct; only the reading was
stale. The panel now builds its nodes once and writes only text, so nothing is
ever created mid-change. **This is worth knowing beyond this preview:** any theme
audit that reads computed styles in the same task as the theme change is
measuring the browser's scheduling rather than the design, and will produce
confident wrong numbers in both directions.

---

## 1. What the website palette actually is

The source is `crowagent-website/astro/src/styles/tokens.css`, variant V6, chosen
by the owner on 2026-08-04. Its structure matters more than any of its hexes:

- **A hue shelf.** The pigments. Teal, cyan, violet, orchid, amber, white. No
  component may name these.
- **A role layer.** The jobs. `--c-verified`, `--c-refused`, `--c-at-risk`,
  `--c-interactive`, the ink ladder, the surface ladder. This is the only thing
  the rest of the codebase may write.

The rule the layer exists to enforce: **a hue asserts something or it is not
used.** Teal means verified. Violet means refused. Amber means at risk. None of
them may appear on a hover, a focus ring, a selected tab or a control fill,
because a colour that decorates has stopped being evidence. V6's answer to
"then what colour is a button" is **white**: the interactive colour is the
maximum contrast neutral, and a filled control is a hole cut in the page with the
page colour showing through as its label.

Dark values, used here unchanged:

| Role | Value | Note |
|---|---|---|
| `--c-floor` | `#03040A` | sidebar, gutters |
| `--c-bg` | `#05070E` | the canvas |
| `--c-raised` | `#0F131F` | a panel |
| `--c-lit` | `#191E2C` | row hover, open menu |
| `--c-panel` | `#0C1020` | modal, popover |
| `--c-card` | `rgba(255,255,255,0.05)` | a white tint, not a navy fill |
| `--c-text` / `-sub` / `-muted` | `#FFFFFF` / `#D2DBEE` / `#A9B6D2` | |
| `--c-interactive` | `#FFFFFF` | every control |
| `--c-verified` | `#2DD4BF` | teal |
| `--c-refused` | `#B39DFB` | orchid |
| `--c-at-risk` | `#E8B84B` | amber |

---

## 2. Deriving light mode, which is the real work

**The website palette is dark only and cannot be inverted.** Its own token file
says so, in a note headed "AND THERE IS STILL NO LIGHT PALETTE HERE,
DELIBERATELY":

> `--c-teal` is a dark-ground colour. It clears 7.7:1 on `--c-bg` and fails
> outright on anything light. Any future light surface needs the darkened
> variant, and any future light surface that reaches for `--c-teal` directly will
> look correct to whoever writes it and fail the contrast gate.

Measured, on `#F5F6FA`: teal is **1.72:1**, orchid **2.13:1**, amber **1.71:1**.
All three are unusable for text or for a filled control's label.

### What flips, and what deliberately does not

**Surface flips direction but keeps its order.** Dark lights a surface as it
rises; light cannot, because a raised panel is already white. So raised goes to
white and the floor goes grey, which keeps "higher is lighter" true while moving
the whole ladder across. Hover steps *down* in light for the same reason.

**Ink flips outright.** `#FFFFFF` becomes `#0B0E19`.

**The control colour flips with the ink, and this is what keeps V6 intact.** On
a light page the maximum contrast neutral is near black, so a primary button
becomes near black with a page coloured label. That is the identical
construction seen from the other side, not a substitution. `--c-fill-lit` steps
one stop along the ink ladder in both directions: white to `#D2DBEE` going down,
`#0B0E19` to `#2B3245` going up.

**The marks do not flip.** A refusal is not the opposite of anything, so
inverting orchid would produce a colour that means nothing. Each mark keeps its
hue angle and moves only in lightness, far enough to clear 4.5:1.

### The seed is not invented

`layouts/Article.astro` on the website already ships a light reading pane, and
`tokens.css` records its palette. Four of the five light values below are taken
from it rather than re-derived, because the site has already shipped them.

### Every derived value, with before and after

| Role | Dark value | On `#F5F6FA` | Light value | On `#F5F6FA` | On `#FFFFFF` | Derivation |
|---|---|---|---|---|---|---|
| `--c-verified` | `#2DD4BF` | **1.72** | `#0F766E` | **5.07** | **5.47** | Already shipped on the website's article pane. Same hue family, dropped in lightness. |
| `--c-refused` | `#B39DFB` | **2.13** | `#6D28D9` | **6.58** | **7.10** | Same 262 degree family, taken down to the saturation the hue shelf's `--c-violet-deep` already occupies. |
| `--c-at-risk` | `#E8B84B` | **1.71** | `#7A5514` | **6.20** | **6.69** | The amber sits at 42 degrees, deliberately off the brand ramp so it can never read as light. Held there, taken down in lightness. |
| `--c-text` | `#FFFFFF` | n/a | `#0B0E19` | 17.82 | 19.25 | Article pane. |
| `--c-text-sub` | `#D2DBEE` | n/a | `#2B3245` | 11.82 | 12.77 | Article pane. |
| `--c-text-muted` | `#A9B6D2` | n/a | `#5A6478` | 5.51 | 5.95 | **Not** the article pane's `#626C82`. See below. |
| `--c-bg` | `#05070E` | n/a | `#F5F6FA` | n/a | n/a | Article pane. |
| `--c-interactive` | `#FFFFFF` | n/a | `#0B0E19` | 17.82 | 19.25 | The ink, per the inversion argument above. |

And the reverse, which is why one value cannot serve both modes: `#0F766E` on
the dark canvas is **3.68:1**, `#6D28D9` is **2.83:1** and `#7A5514` is
**3.01:1**. All three fail AA for body text going the other way.

### Three values I had to change that the website has no answer for

**1. The muted ink is `#5A6478`, not the article pane's `#626C82`.** The article
pane sets muted text on one surface. An app sets it on four. Measured,
`#626C82` gives **4.38:1** on the light sidebar, which is a fail. `#5A6478` is
the same hue two steps down and clears every surface, worst case **4.94:1**.

**2. A control border, which the website does not have.** The website's
`--c-border` is `rgba(255,255,255,0.12)`, measured at **1.31:1** on the canvas.
That is correct for what it is, a decorative hairline structuring a layout, and
wrong for a form field: WCAG 2.2 SC 1.4.11 asks 3:1 of a control's boundary. I
solved for the alpha rather than guessing one. Dark needs 0.36 to clear 3:1 and
ships at **0.38** (3.47 on the canvas, 3.57 on a panel). Light needs 0.46 and
ships at **0.48** (3.34 and 3.39). Light needs *more* alpha for the same ratio
because sRGB luminance is not symmetric about mid grey. A marketing page has
three form fields; an app has hundreds.

**3. A destructive colour, which the website palette simply does not contain.**
There is no red role. `--c-pink` exists on the hue shelf but only as a stop in
one decorative gradient. An app has delete, revoke and payment failed; a
marketing site does not. Derived: `#FF7A85` dark (8.03:1 on the canvas) and
`#B32131` light (6.12:1), both off the brand ramp for the same reason the amber
is. **This is new, not borrowed, and it is the one control on the page allowed a
hue**, because an irreversible action is the single case where colour is
carrying a warning rather than a decoration. It still carries a word.

### Two things the preview found that only a rendered page could

**Status pill grounds had to become opaque.** Written the obvious way, as a 10
to 13 per cent wash, a pill's ground composites with whatever row it lands on,
so the pill's contrast becomes a property of the table rather than of the pill.
Measured: the light teal pill read **4.76:1** on a resting row and **4.21:1** on
a hovered one. It fell under AA when nothing but the mouse moved. The washes are
now flattened over `--c-raised` once, so a pill reads identically on a card, on
a row and on a hovered row.

**The modal scrim does not invert.** Written as `--c-floor` at 0.72 it is
defensible on paper, since floor is the recessed surface. In light mode
`--c-floor` is `#E7EAF2`, so the scrim was lighter than the panels it was meant
to be pushing back and read as haze rather than depth. `--c-scrim` is near black
in both modes. A dialogue in a light interface is still lit from in front of a
darkened room.

---

## 3. How many colours the platform uses, and how many map cleanly

Measured from `crowagent-platform/packages/tokens/src/tokens.css` with comments
stripped, so commentary hexes are not counted as declarations:

| | Count |
|---|---|
| Custom property declarations in the file | **636** |
| Declarations holding a literal colour | **358** |
| Declarations that are pure `var()` aliases | **147** |
| **Distinct literal colour values** | **169** (77 hex, 92 rgba) |

Across `web/src`, `web/app` and `packages/ui`, hex literals outside the token
file: **430 occurrences, 112 distinct values.** Tailwind default palette utility
classes such as `bg-slate-900`: **effectively zero** across the whole app, one
comment and two unit test strings aside. That is enforced by
`scripts/brand-lint.sh`. The platform's utility layer is genuinely token driven,
and that is the single best piece of news in this report.

### Mapping

| Platform token family | Maps onto | Verdict |
|---|---|---|
| `--bg`, `--surf`, `--surf2`, `--surf3`, `--surf4`, `--bg-deep` | the four step surface ladder plus panel | **Clean.** Six platform steps to five website ones; `--surf3` and `--surf4` collapse. |
| `--cloud`, `--steel`, `--mist`, `--dim-c` | `--c-text`, `--c-text-sub`, `--c-text-muted` | **Near clean.** Four ink steps to three. One has to merge, and `--steel`/`--mist` are the pair. |
| `--teal`, `--teal-d`, `--teal-l`, `--teal-pressed`, `--teal-edge`, plus eleven `--teal-NN` alpha steps | `--c-verified` **or** `--c-interactive`, depending on the call site | **This is the whole problem.** See below. |
| `--mark` `#A78BFA` | `--c-refused` is `#B39DFB`, four degrees away | **Collision.** See "what breaks". |
| `--warn`, `--warn-text`, `--warn-dim` | `--c-at-risk` | **Clean.** Amber to amber. |
| `--err`, `--err-text`, `--coral`, `--red-strong` | nothing on the website | **Needs a new value.** Derived here. |
| `--success`, `--success-text` | `--c-verified` | **Clean but redundant.** Success and verified become one role, which is correct. |
| `--sky`, `--lime`, `--gold`, `--nest`, `--sight`, `--core`, `--build`, `--trace` | nothing | **Eight accent hues with no home.** V6 has two hues and two markers. |
| `--epc-band-a..g`, `--google-*`, `--ms-*` | nothing, correctly | **Must never change.** Regulated and third party marks. |

### The teal problem, measured

`var(--teal)` appears **858 times across 298 files**. Split by context, with
each occurrence counted once and in one bucket only, so the categories do not
double count a string such as `hover:border-[var(--teal)]`:

| Context | Occurrences |
|---|---|
| `focus` and `focus-visible` states, mostly the ring | **373** |
| `bg-` fills | **154** |
| `border` | **102** |
| `hover` states | **36** |
| `accent-` and `caret-` on native form controls | **25** |
| bare `outline-` / `ring-` | **6** |
| **Control states, subtotal** | **696** |
| `text-` and `color`, i.e. teal as ink | **46** |
| Bare `var(--teal)` inside a CSS declaration, context not inferable from the token alone | **117** |

So **696 of the 858 are control states**, which V6 forbids a hue on, and only
**46** are teal as ink. The remaining 117 sit inside stylesheet declarations and
have to be read to be classified.

The platform names the *pigment*, `--teal`, and not the *job*. That is precisely
the defect the website's own token file diagnoses, in the owner's words quoted
inside it: *"why cant we are not managing this centrally enforced by rule?"* The
website fixed it with the role layer. The platform has not yet.

The focus ring is the sharpest single instance. `web/app/globals.css:180` sets
`*:focus-visible { outline: 2px solid var(--teal) }` for the entire application,
and `packages/ui/src/primitives/button.tsx` repeats it in the Button base class.
Under V6 a keyboard user's ring would go from teal at 2px to white at 3px with an
offset, which is both a semantic fix and a legibility one: white measures
**20.13:1** on the canvas against teal's 10.81.

---

## 4. What adoption would actually cost

**It is mostly a token value remap, and that is only true because of the way the
platform is already built.** Three properties make it cheap:

1. Colour lives in one file, `packages/tokens/src/tokens.css`, with
   `[data-theme="light"]` and `[data-theme="dark"]` blocks already present.
2. The app writes `bg-[var(--surf)]`, not `bg-slate-900`. There is no meaningful
   Tailwind palette usage to sweep.
3. `brand-lint.sh` already fails the build on raw hex, so the discipline is
   enforced rather than hoped for.

**The work that is not a remap, in order of size:**

| Work | Where | Rough size |
|---|---|---|
| **Split `--teal` into two roles.** Rebind `--teal` to the interactive neutral, add `--c-verified`, then reclassify call sites. The 696 control sites can be swept mechanically by their utility prefix (`focus`, `bg`, `border`, `hover`, `ring`, `accent`, `caret`); the **46 ink sites and 117 bare stylesheet sites need reading individually** to decide whether each one means "verified" or "this is a control". | `web/src`, `web/app`, `packages/ui` | 163 judgement calls, 696 mechanical |
| **Rewrite the Button primitive's variants.** Nine variants ship today: `primary`, `secondary`, `destructive`, `danger`, `warn`, `outline`, `success`, `ghost`, `subtle`. Three are already duplicates before any palette moves: `danger` is a literal alias of `destructive`, and `primary` and `success` paint the same teal fill. Under V6, `primary` goes neutral, which merges it with `success` outright, and `subtle` (teal text with an underline) has nothing left to be. | `packages/ui/src/primitives/button.tsx` | 1 file, but it is the most reused component in the app |
| **Repoint the focus ring.** Hardcoded to `var(--teal)` at `web/app/globals.css:180` and again in the Button base class. | 2 places, 373 consumers | small, very high blast radius |
| **Retire or rehome the eight orphan accents.** `--sky`, `--lime`, `--gold`, `--nest`, `--sight`, `--core`, `--build`, `--trace`. | `packages/tokens` + the product rail | medium |
| **Delete the 16 light mode contrast patches in `globals.css`** (lines 307 to 646) and re-derive. They pin `#0A6E5C` and `#FFFFFF` onto specific class combinations to rescue teal on a light ground. If teal stops being a control colour, most of them stop having a subject. | `web/app/globals.css` | 16 rule blocks |
| **Reconcile the portal's hand copied token file.** `apps/portal/src/app/crowagent-brand-tokens.css`, 590 lines, 132 hex literals, maintained by hand. Its value parity with `tokens.css` is recorded as unverified in the platform's own architecture doc. Any palette change has to be applied twice or the duplication has to be removed first. | 1 file | medium, and it is pre-existing debt |

---

## 5. What breaks

### Charts do not follow the theme, and already do not

`CHART_COLOURS` in `packages/tokens/src/constants.ts:314` is a compile time
TypeScript constant of literal hexes, with a header explicitly instructing:
*"Never use CSS vars in backgroundColor, borderColor, or any Chart.js colour
field."* Chart.js draws to canvas and cannot read custom properties. Its values
are the **dark palette only**, so the CrowMark analytics charts do not follow the
existing light mode either. This is a live defect today, not one adoption would
create, but adoption would make it far more visible.

There is a theme aware alternative, `resolveChartColours()` in
`web/src/shared/lib/chart-utils.ts`, which reads live computed properties after
mount. It is the minority path, and even it hardcodes its grid colour.
`app/(dashboard)/crowmark/analytics/page.tsx` imports the static constant.

The preview deliberately contains no chart. A chart needs data, and there is no
honest placeholder for a data series.

### The CrowMark product colour would come to mean "refused"

`--crowmark` resolves to `--mark`, `#A78BFA`. The website's `--c-violet` is
**the same value**, `#A78BFA`, and `--c-refused` is `#B39DFB`, four degrees
around the wheel from it. Adopt V6 as written and the product's own brand accent
sits in the same hue family as the refusal marker, on the same screens. Either
CrowMark takes a different accent, or refusal does. **This is the single
finding on this page that needs an owner decision before any code moves**, and
it is not a contrast problem so no automated gate would catch it.

### Email templates would drift out of step with the app

`web/lib/email/brand-colors.ts` is a deliberately separate, email canonical
palette, because email clients strip `var()`. It feeds **38 templates** under
`web/lib/email/templates/`, and a further **6 API routes** inline their own hex
HTML rather than importing it (support, contact, notify, email change among
them). None of these follows a CSS token change. After adoption, the app would be
white on near black and every transactional email would still be teal on navy
until those files are edited by hand.

### PDF, DOCX and OG image output, same story

`web/src/shared/lib/brand/brand-spec.ts` (15 hex literals),
`brand/pdf-lockup.ts`, `brand/docx-letterhead.ts`,
`app/tools/_og-template.tsx`, and `apps/portal/src/lib/documents/generators.ts`
(20 hex literals). All literal, none token driven, all would need editing
separately.

### Things that must not change, and could be swept by accident

The EPC band colours `--epc-band-a` through `-g` are a regulated visual scale.
The Google and Microsoft OAuth brand colours are third party marks. All eleven
are literal in `:root` and never flip. A palette sweep that treats every hex in
the token file as fair game would break them.

### One pre-existing defect worth fixing at the same time

`--coral` is overridden in the light block (`#B91C1C`) and **not re-asserted in
the dark block**, unlike all 148 of its neighbours. A force dark island inside a
light document therefore renders it at the light value, which composites to
roughly 2.5:1. `web/app/(marketing)/pricing/PricingClient.tsx:820` uses
`text-[var(--coral)]` and sits inside the force dark `(marketing)` layout. The
platform's own architecture doc flags this as a candidate defect and marks it
unverified at runtime. I did not verify it either, because that would mean
running the platform.

### Third party surfaces: less exposure than feared

Checked and **not present**: Stripe Elements (checkout is hosted, there is no
`appearance` object), Clerk, Supabase Auth UI, react-day-picker, sonner,
react-hot-toast, Radix Themes, tiptap, Monaco, react-pdf, pdfmake, puppeteer.
`driver.js` is present for the product tour and uses its stock stylesheet with
no colour overrides, so its popovers would look foreign in either palette.
Sentry and PostHog ship no themed widgets here.

---

## 6. Does the platform already have a light mode?

**Yes, and it is more finished than the question implies.** This is the most
important correction to the premise of the request.

- The switch is `[data-theme="light"]` on `<html>`, CSS only, no re-render.
- The light block is **118 declarations** at `tokens.css:753`, headed "PREMIUM
  LIGHT MODE v2 (2026-06-05)", with per token contrast annotations and a
  documented elevation model.
- There is a nested `[data-theme="dark"]` block of **148 re-asserts** so a force
  dark island inside a light document does not inherit light ink.
- Controller: `web/src/shared/lib/theme-controller.ts`. Preference is
  `system | dark | light` in `localStorage['ca-theme']`.
- **Default is `dark`**, set in two places that must stay in lockstep:
  `DEFAULT_PREFERENCE` at `theme-controller.ts:34`, and the pre-paint inline
  bootstrap at `web/app/layout.tsx:147`, whose final fallback and whose `catch`
  both resolve to `'dark'`. The comment records it as an R2.5.1 owner decision.
- Users can switch it at Settings, Appearance, or through the command palette.
- Five surfaces are pinned force dark: the marketing, onboarding, help and
  status layouts, and the onboarding organisation type page.

**What happens to it under adoption:** the existing light palette is replaced,
not extended. Its 118 declarations are a *cool white and teal* system built
around the current brand; the light mode in this preview is a *near white and
neutral ink* system built around V6. They are not compatible and running both
would mean two light modes. The 16 light mode contrast patches in `globals.css`
exist specifically to rescue teal on a light ground and would largely become
dead code.

The real cost, then, is not "build light mode". It is **rebuild the light mode
that already exists**, and it is worth being clear that this discards audited
work rather than filling a gap.

---

## 7. Recommendation, with the risk named

**Adopt the structure first, and the palette second, as two separate releases.**

**Release one: the role layer, no visible change.** Add `--c-verified`,
`--c-refused`, `--c-at-risk`, `--c-interactive` and `--c-danger` to the platform
tokens, bound to the pigments they already resolve to today. Reclassify the 858
`var(--teal)` call sites onto whichever role they actually mean. Extend
`brand-lint.sh` with the website's `check-palette-roles.js` rule so naming a
pigment from a component fails the build. **Nothing changes visually.** The
release is verifiable by screenshot diff: any pixel that moves is a
misclassification.

This is worth doing whether or not V6 is ever adopted, because it is the thing
that makes every future palette decision a four line edit instead of a 298 file
sweep. It is also the only honest way to find out how many of those 163
ambiguous sites mean "verified" and how many mean "clickable", which nobody
currently knows.

**Release two: swap the values.** With the role layer in place this is
genuinely the four blocks in `theme.css` that this preview demonstrates, plus
the non CSS surfaces listed in section 5, which have to be done by hand
regardless.

**The risk, stated plainly.** The platform is mid release: R2.6.2 Phase 2 is cut
with roughly 37 commits unpushed and certification only half complete, with web
shards 4 to 6 and the entire API suite unrun. Release one touches the most
reused component in the app and roughly 858 call sites. **Doing it now would put
a very large, very wide diff on top of a release that cannot currently prove
itself green.** My recommendation is to schedule release one immediately after
R2.6.2 certifies, not before, and to treat the CrowMark violet collision in
section 5 as an owner decision that can be taken now, on paper, while the code
waits.

**What I would not do:** adopt the palette without the role layer. It would
work, it would look right, and it would rebuild the exact defect the website
just spent a pass repaying, one call site at a time.

---

## 8. What I could not resolve

1. **The CrowMark accent collision.** Flagged, not solved. It needs an owner
   decision about which of the two moves, and no measurement can make it.
2. **The `--coral` dark re-assert defect.** Read from source and from the
   platform's own architecture note. Confirming the roughly 2.5:1 figure means
   running the platform, which was out of scope here.
3. **Portal parity.** `apps/portal/src/app/crowagent-brand-tokens.css` is a hand
   maintained copy. I did not diff its 132 hex literals against `tokens.css`, so
   I cannot say whether the two are currently in agreement, only that nothing
   guarantees they are.
4. **The exact split of the 163 ambiguous teal sites** (46 ink, 117 bare
   stylesheet declarations) between "verified" and "interactive". Counting them
   is mechanical; classifying them is a reading task over roughly that many
   components and stylesheet rules, and belongs to whoever does release one.
5. **No chart is shown.** Charts need data and there is no honest placeholder for
   a series. The chart risk is assessed in section 5 from source rather than
   demonstrated on screen.
6. **The eight orphan accent hues.** I have said they have no home in V6. I have
   not proposed where they go, because that depends on decisions about the
   product rail and the five non routable products that are outside this brief.
