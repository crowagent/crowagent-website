# Hero headline animation and Largest Contentful Paint

Research only. No component or style code was written and no source file was modified.

Measured 2026-08-30 and 2026-08-31 on this machine, Playwright 1.59.1 driving Chromium
147.0.7727.15. Mobile profile is the Pixel 5 device descriptor at 4x CPU throttle,
1.6 Mbps down, 150 ms RTT. Desktop profile is 1440x900, no throttle. CrowAgent numbers come
from `http://localhost:8093/` read only, via GET and CDP style injection into the browser.

---

## 1. The short answer

1. **Linear's technique does not transfer, and copying it would be a regression.** They ship the
   headline at `opacity: 0` in the server rendered HTML and raise it with JavaScript.
2. **Their headline is not their LCP element, and that is not a clever escape. It is the cost.**
   An element faded up from zero opacity is disqualified as an LCP candidate permanently, so
   Linear's mobile LCP falls to a 799 px2 "Sign up" button at 7,412 ms.
3. **With JavaScript disabled Linear's headline is invisible forever.** Verified: the word spans
   stay at `opacity: 0, blur(10px), translateY(8.36px)`. There are zero `<noscript>` fallbacks.
   That alone fails CrowAgent's stated requirement.
4. **CrowAgent's h1 is not the LCP element either.** Mobile LCP is a decorative grain overlay,
   desktop LCP is the ProofGate h2. So the original blocker I raised does not hold on this page.
5. **CrowAgent already has the mechanism and it is already running on the h1.** `sv-land-row` in
   `astro/src/styles/motion.css` animates it today. The work is to deepen that, at roughly 180
   bytes of CSS and zero HTML bytes, not to import anything from Linear.

---

## 2. What Linear actually does

### The markup, before any script runs

Fetched from `https://linear.app` with a mobile user agent. The h1 is split into per word spans,
each carrying an inline style:

```html
<h1 class="sc-KOGVz cVAQDa Fzcv4W_insetLarge QI8oKG_title"><span aria-hidden="true">
  <span style="display:inline-block;opacity:0;filter:blur(10px);transform:translateY(20%)" class="show-mobile">The product</span>
  <span style="display:inline-block;opacity:0;filter:blur(10px);transform:translateY(20%)" class="show-mobile">development</span>
  ...
</span><span class="Fzcv4W_visuallyHidden">The product development system for teams and agents</span></h1>
```

Counted across the whole document:

| Thing | Count |
|---|---|
| Inline `opacity:0` declarations | 32 |
| `blur(10px)` | 9 |
| `translateY(20%)` | 9 |
| `<noscript>` blocks | 0 |

A visually hidden duplicate of the headline is present, so a screen reader still reads it. A
sighted reader without JavaScript does not.

### The animation

JavaScript driven, not CSS. Evidence:

- No `@keyframes` drives it. The animated properties arrive as inline `style` attribute writes,
  captured live by a MutationObserver, in the shape
  `opacity: 1; filter: blur(2px); transform: translateY(10px)` stepping to `blur(0px)`.
- The final computed state of each word span is
  `display: inline-block; opacity: 1; filter: blur(0px); transform: translateY(0%)`, still as an
  inline style rather than a stylesheet rule.
- `document.getAnimations()` shows the same pattern across the page.

The reveal is per word, staggered, moving three properties at once: `opacity` 0 to 1,
`filter` `blur(10px)` to `blur(0)`, and `transform` `translateY(20%)` to `translateY(0)`.
The travel is 8.36 px at the mobile font size of 38 px.

Credit where it is due: Linear honours `prefers-reduced-motion: reduce`. Under emulated
`reduce` the spans settle at `opacity: 1, blur(0px), translateY(0)`. Their JavaScript reads the
media query. That still leaves the no JavaScript case broken.

---

## 3. Is the headline their LCP element? No.

PerformanceObserver on `largest-contentful-paint`, `buffered: true`, installed before any page
script via `addInitScript`.

**Linear, mobile profile, full entry sequence:**

| t | size px2 | element | text |
|---|---|---|---|
| 6,464 ms | 799 | `a.S36ykG_root.S36ykG_variant-invert` | "Sign up" |
| 21,472 ms | 4,161 | `p.sc-KOGVz.DbHpe.KFZpfa_description` | "Render UI before vehicle_state sync..." |

First paint 6,224 ms, first contentful paint 6,340 ms. The h1 measures 346 x 167 px and is fully
in the viewport at y=196. It never appears as an LCP candidate in any run.

**Linear, desktop profile:** LCP is `img.Sz_9La_root` at 5,336 ms. Again not the h1.

This is the central finding. Their headline animation does not avoid an LCP penalty. It pays one,
by removing the largest piece of above the fold content from the metric entirely and handing LCP
to a small button and then to a paragraph twenty one seconds in.

### Why, tested rather than assumed

Isolation test: a page whose only substantial element is the CrowAgent headline, so the h1 is
unambiguously the sole LCP candidate and any disqualification shows as a change in time rather
than a change of element. Pixel 5 profile, 4x CPU, 7 runs per variant, 3 s observation window.

| Variant | LCP median | LCP element | Runs with no LCP at all |
|---|---|---|---|
| static baseline | 100 ms | H1 | 0 of 7 |
| **opacity 0 to 1, 800 ms** | **none** | **none** | **7 of 7** |
| **opacity 0 to 1, 800 ms, 600 ms delay** | **none** | **none** | **7 of 7** |
| opacity `var(--arrive-floor)` 0.75 to 1 | 92 ms | H1 | 0 of 7 |
| transform only, translateY 18 px | 84 ms | H1 | 0 of 7 |
| blur only, 12 px to 0 | 108 ms | H1 | 0 of 7 |
| blur 10 px plus rise 14 px | 92 ms | H1 | 0 of 7 |
| floor 0.75 plus blur plus rise | 92 ms | H1 | 0 of 7 |
| clip-path wipe | 100 ms | H1 | 0 of 7 |
| `sv-land-row` as shipped today | 132 ms | H1 | 0 of 7 |

The result is categorical. **Any starting opacity above zero keeps the element an LCP candidate
and costs nothing. A starting opacity of exactly zero removes it and Chromium never re admits it**,
not once in 14 runs across two variants, including three full seconds after the fade completed.

A second synthetic set, where the headline competes with a sub paragraph, shows the same rule as
a change of winner rather than a disappearance:

| Variant | LCP element |
|---|---|
| static | h1 |
| opacity 0 to 1 | p.sub, h1 lost |
| opacity 0 to 1 with delay | p.sub, h1 lost |
| Linear clone, inline `opacity:0` plus WAAPI | p.sub, h1 lost |
| opacity 0.01 to 1 | h1 held |
| transform only | h1 held |
| blur only | h1 held |
| blur plus rise | h1 held |
| **whole wrapper faded from opacity 0** | **no LCP entry at all, 0 entries** |

The last row is the failure mode to name in a review. Fading a container, rather than the
headline, took the page from "LCP moved" to "LCP was never reported".

---

## 4. Field and lab vitals for Linear, Vercel and Stripe

### Field data could not be obtained

The PageSpeed Insights API is no longer usable without a key. Fetched 2026-08-30:

```
HTTP 429  "Quota exceeded for quota metric 'Queries' and limit 'Queries per day'"
          quota_limit: defaultPerDayPerProject, quota_limit_value: "0"
```

The keyless allowance is now zero per day, not merely small. The Chrome UX Report API was tried as
a substitute and returns HTTP 403, "Method doesn't allow unregistered callers". **There is no CrUX
field data in this document.** Obtaining it needs a Google API key, which is free but is a
credential decision for the owner.

### Lab data, measured here instead

Identical harness for all four, 3 runs each, median. Fetched 2026-08-31.

**Mobile, Pixel 5, 4x CPU, 1.6 Mbps, 150 ms RTT:**

| Site | LCP median | LCP element | Headline is LCP |
|---|---|---|---|
| linear.app | 7,412 ms | `a` "Sign up" | no |
| vercel.com | 2,708 ms | `h1` "Agentic Infrastructure" | **yes** |
| stripe.com | 8,616 ms | `img` | no |
| CrowAgent localhost:8093 | 3,168 ms | `i.sv-grain` | no |

**Desktop, 1440x900, no throttle:**

| Site | LCP median | LCP element | Headline is LCP |
|---|---|---|---|
| linear.app | 5,336 ms | `img.Sz_9La_root` | no |
| vercel.com | 376 ms | `h1` "Agentic Infrastructure" | **yes** |
| stripe.com | 708 ms | `img` | no |
| CrowAgent localhost:8093 | 696 ms | `h2.pg__h` | no |

Vercel is the more useful comparator and it points the opposite way from the brief's assumption.
Their h1 computes to `animation-name: none`, `opacity: 1`, `transform: none`, no inline style.
**The headline is completely static, it is the LCP element, and it has by far the best LCP of the
four.** The site with the most admired hero motion has the worst LCP of the four, and the static
headline has the best.

---

## 5. CrowAgent's current hero

| Profile | LCP element | Size | LCP median |
|---|---|---|---|
| Mobile | `i.sv-grain` at 393 x 622 px, `opacity: 0.035` | 25,600 px2 | 2,884 to 3,616 ms across batches |
| Desktop | `h2.pg__h` "The engine that refuses to make things up." at y=809 | 45,750 px2 | 696 to 1,024 ms across batches |

The h1 measures 353 x 91 px at 41.6 px on mobile and 1232 x 97 px at 83.2 px on desktop. It is in
the viewport on both. **It is not the LCP element on either.** On mobile it loses to the grain
overlay, whose LCP size is the 160 x 160 intrinsic dimension of its data URI noise texture. On
desktop it loses to the ProofGate heading, which is physically larger.

### The h1 is already animated

The brief states the hero is completely static. The computed style disagrees:

```
animation-name: sv-land-row
animation-duration: 0.9s
animation-delay: 0s
animation-fill-mode: backwards
```

This comes from `astro/src/styles/motion.css` line 600, inside a
`@media (prefers-reduced-motion: no-preference)` block, applied by a structural selector that
reaches every row of the first block in `main`. The keyframe at line 709:

```css
@keyframes sv-land-row {
  from { transform: translateY(var(--land-row-lift)); }
  to   { transform: translateY(0); }
}
```

Transform only, deliberately. The comment beside it records why opacity is excluded: a row at
0.75 inside a block at 0.75 renders at 0.56, which is the contrast failure an earlier axe run
caught. So the site already ships a staggered, tokenised, CSS only, reduced motion aware landing
animation, and the hero headline is already inside it. `HeroStack.astro`'s comment is out of date
relative to the stylesheet.

### A separate finding worth a row of its own

The mobile LCP element is a decorative noise overlay at 3.5% opacity. Hiding it moves LCP to
`p.hero__lede` at 2,860 ms against a 2,884 ms baseline, so the grain is **not the cause** of the
2.9 s. It is not costing time. What it costs is diagnosis: Lighthouse's LCP guidance on mobile
currently points at a decoration rather than at content, which will mislead anyone working the
`/tools` 80, `/pricing` 79 and `/signup` 72 scores.

---

## 6. The proposed technique, with its measured cost

**Extend `sv-land`, do not import Linear's.**

The mechanism, its tokens, its stagger, its reduced motion reset and its no JavaScript behaviour
all exist already. What is missing is depth on the one element the owner is looking at.

```css
/* inside the existing @media (prefers-reduced-motion: no-preference) block */
#hero-title {
  animation-name: sv-land-hero;
  animation-duration: var(--land-dur);
  animation-timing-function: var(--m-ease-land);
  animation-fill-mode: backwards;
}

@keyframes sv-land-hero {
  from { opacity: var(--arrive-floor); transform: translateY(var(--land-lift)); }
  to   { opacity: 1; transform: translateY(0); }
}
```

This is exactly the existing `sv-land` block keyframe applied to the headline: a longer travel
(`--land-lift`, 1.5 stack units, against the row's 1 unit) over two beats instead of one and a
half, and a fade that starts at the existing 0.75 floor rather than at zero.

### Measured LCP cost against the static baseline

| Variant | LCP median | h1 retained as LCP |
|---|---|---|
| static baseline | 100 ms | 7 of 7 |
| **fade from `--arrive-floor` 0.75** | **92 ms** | **7 of 7** |
| **floor plus blur plus rise** | **92 ms** | **7 of 7** |
| transform only | 84 ms | 7 of 7 |
| `sv-land-row` as shipped | 132 ms | 7 of 7 |
| fade from opacity 0 | never reported | 0 of 7 |

Zero cost, inside run to run noise. The spread across all opacity safe variants is 84 to 132 ms
against a baseline of 100 ms.

On the real page, injected into `http://localhost:8093/` via CDP, 5 runs each, no technique moved
LCP outside noise, because the h1 is not the LCP element there:

| Injected technique | Mobile LCP | Desktop LCP |
|---|---|---|
| baseline, untouched | 3,616 ms | 1,024 ms |
| fade from 0 | 2,904 ms | 924 ms |
| fade from 0.04 | 3,180 ms | 1,004 ms |
| transform only | 3,384 ms | 1,032 ms |
| blur plus rise | 2,952 ms | 1,068 ms |
| floor plus blur plus rise | 2,832 ms | 932 ms |
| clip-path wipe | 2,952 ms | 860 ms |

### Do not use

- **Opacity starting at zero.** Removes the element from LCP permanently, 7 of 7 runs.
- **Fading an ancestor from zero.** Produced no LCP entry at all.
- **JavaScript driven reveal.** This is Linear's actual failure, not their technique.
- **`filter: blur()`.** Two reasons. It contradicts `motion.css`'s own recorded standard that
  every property in its keyframe blocks is compositor only and nothing writes a filter. And it
  was the only variant to produce a stalled frame in the frame cost test below.
- **`clip-path` reveal.** LCP records it at the correct early time, because Chromium's candidacy
  test looks at opacity and not at clipping, so the metric reads better than the reader's
  experience. It also behaved inconsistently between the two synthetic sets. A technique that
  flatters the metric relative to what a person sees is the wrong one to adopt deliberately.

### Frame cost, 6x CPU throttle, 5 runs, 640 frames each

| Variant | Median | p95 | Max | Frames over 32 ms |
|---|---|---|---|---|
| static | 16.7 ms | 16.8 ms | 33.4 ms | 1 |
| transform only | 16.7 ms | 16.7 ms | 33.3 ms | 1 |
| blur only | 16.7 ms | 16.7 ms | **300 ms** | 2 |
| blur plus rise | 16.7 ms | 16.8 ms | 33.3 ms | 1 |
| **`sv-land-row` as shipped** | **16.7 ms** | **16.7 ms** | **16.8 ms** | **0** |

The animation already on the page is the only variant that dropped no frame at all.

---

## 7. Byte cost, tokens, reduced motion, no JavaScript

### Bytes

The homepage serves **104,270 bytes** against the `htmlPerRoute` budget of `100 * KB` in
`astro/scripts/check-budgets.js`, so it is **1,870 bytes over**, matching the brief exactly.

The proposal costs **zero of those bytes**. CSS reaches the homepage through three external
`<link rel="stylesheet">` tags and the string `sv-land-row` does not appear in the HTML at all.
The change lands in `motion.css`, so it counts against `cssTotal` (200 KB budget, about 193.7 KB
used per the file's own notes, roughly 6.3 KB of headroom).

| Item | Bytes | Budget hit |
|---|---|---|
| The rule plus keyframe above, unminified | about 180 | `cssTotal` |
| HTML | 0 | none |
| JavaScript | 0 | none |

A per word stagger would need "Qualify." and "Draft." wrapped in spans, which the current markup
does not do. That is roughly 92 bytes of HTML on a route already 1,870 over. **Not recommended
until the route is back inside its budget**, and the section stagger already gives the hero a
sequenced arrival without it.

### Tokens

Every value already exists in `astro/src/styles/tokens.css` and `motion.css`. **No new token is
needed.**

| Token | Value | Role |
|---|---|---|
| `--arrive-floor` | `0.75` | the opacity floor, so nothing animates from invisible |
| `--land-lift` | `calc(var(--stack-2) * 1.5)` | block travel distance |
| `--land-dur` | `calc(var(--m-beat) * 2)` | two beats |
| `--m-ease-land` | `var(--ease)`, `cubic-bezier(0.16, 1, 0.3, 1)` | the arrival curve |
| `--m-beat` | `600ms` | the unit of time |

`--arrive-floor` deserves a note. Its comment already records the exact lesson this research
re-derives: it was 0.35, chosen as "clearly not zero" and never checked, and it was moved to 0.75
against a contrast requirement. The token exists precisely so that no CrowAgent element ever
animates from invisible. Linear's headline is the counterexample.

### Reduced motion

`prefers-reduced-motion: reduce` renders the finished state instantly today. Verified on
`localhost:8093` with emulated `reduce`: the h1 reports `animation-name: none`, `opacity: 1`,
`transform: none`. `motion.css` line 637 resets `animation-name` for these selectors explicitly,
on top of the `no-preference` gate.

**One trap to flag.** The reduce block matches structural selectors only. An `#hero-title` rule has
higher specificity, so `animation-name: none` from that block would **not** override it. The new
rule must sit inside the existing `@media (prefers-reduced-motion: no-preference)` block, and
`#hero-title` should also be added to the reduce reset list, so the guarantee holds by both routes
rather than by one. This is worth a guard test asserting
`getComputedStyle(h1).animationName === 'none'` under emulated reduce, which is the assertion style
the file's own comment already argues for.

### No JavaScript

CSS only, so it works with scripting disabled. Verified: with `javaScriptEnabled: false` the
CrowAgent h1 still reports `animation-name: sv-land-row`, `opacity: 1`, and renders its text.
The same check against Linear returns word spans at `opacity: 0` permanently.

---

## 8. What could not be established

1. **No field data for any of the four sites.** PSI without a key is capped at zero queries per
   day and returns HTTP 429. CrUX returns 403 without a key. Every number here is lab, from one
   machine, one Chromium build, on a synthetic network profile. Real user LCP for Linear, Vercel,
   Stripe and CrowAgent remains unmeasured. A free Google API key would close this, and that is an
   owner decision rather than mine to take.
2. **Whether Chromium ever re-admits an element that animated up from opacity 0.** It never did in
   14 isolated runs across two variants, with a three second window after the fade finished. That
   is strong for Chromium 147 and is not a specification guarantee. It may differ in other engines
   and in future versions.
3. **Whether Linear's lab LCP reflects their real users.** Their JavaScript is heavy under a 4x CPU
   throttle and 7.4 s mobile is a harsh profile. Their field numbers could be much better. What is
   not throttle dependent is the disqualification of the h1, which is structural.
4. **Whether the h1's current `sv-land-row` binding survives the in-flight hero work.**
   `motion.css` is unmodified and its selector is structural, but `HeroStack.astro` has 301
   uncommitted lines from another agent and the selector depends on DOM nesting. Everything
   measured against `localhost:8093` includes that uncommitted work. Re-measure after it lands.
5. **The site's own Lighthouse and budget gates were not run.** No gate was executed and no CI was
   touched. The 104,270 byte figure is the dev server response measured directly, not a gate
   verdict on built output.
6. **Why the mobile LCP is 2.9 s at all.** Hiding the grain moved LCP to the lede paragraph at the
   same time, so the delay is the whole hero painting late rather than any single element. That is
   a separate investigation and probably the larger win.
