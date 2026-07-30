# Website transformation — execution backlog

**Owner contract (2026-07-30):** transform the site to genuine top-1% enterprise SaaS quality.
**COMMIT FREELY. DO NOT PUSH.** Nothing reaches production until the owner says the
transformation is complete. Pushing `main` on this repo *is* the Cloudflare Pages deploy.
Do not ask for push approval again — the instruction is settled.

Branch: `fix/carousel-and-premium-shots`.

## Standing constraints (violating any of these has already caused a defect)

1. **Every carousel slide must be 16:10 (3200×2000).** `premium-transformation-2026-05-27.css:250`
   gives the ACTIVE slide `position:relative` so the frame sizes to it; mixed ratios made the
   active slide 816px tall inside a 628px viewport and it overflowed into the caption bar.
   Normalise with `scripts/convert-shots.mjs`.
2. **Carousel markup must be `[data-pcar]` + ≥2 `.pcar__slide`.** `.ca-slide` has NO driver
   anywhere in the repo. `product-carousel-2026-05-26.js` returns early below two slides.
3. **Bump `?v=` on every reference when an asset's bytes change** — a partial bump means
   Cloudflare keeps serving the old file on the un-bumped pages. HTML itself is not
   `?v=`-versioned, so a CF cache purge is required after any eventual deploy (owner action).
4. **Verify screenshots by READING the image, never by grepping the filename.**
5. **Never self-award quality scores.** Report measured evidence: Lighthouse/axe numbers from
   real runs, pixel measurements, file:line. State plainly what is NOT fixed.
6. **Localhost 8092 must stay up** (`npx http-server . -p 8092 -c-1 --cors`); restart if dead.
   **The browser still serves cached HTML across edits** — append a throwaway query string
   (`?cb=2`) when verifying a CSS/markup change, or you will measure the old page. This wasted
   real time on 2026-07-30: a `text-align` fix looked like it had failed when it had not shipped
   to the browser yet.
7. **Delete the seeded staging data when the screenshot programme completes** — org
   `8e088ab9-c530-4390-a25f-acbd892a7eae` (18 contracts, 70% win rate, £2,385,950, 87%
   evidence). Teardown is precise: that org had 0 contracts before seeding.
8. **`npm run build` is a real gate — run it before every commit.** It copies an allowlist into
   `dist/` and then resolves every asset referenced by the built HTML *and* by the injector
   scripts, failing loudly on anything missing. **`dist/` is the Cloudflare Pages build output
   directory**, so an edit to a root file does not reach production until the build runs.
9. **Do not "fix" the hidden atmosphere layer.** `.atmos__aurora`, `.atmos__beam`,
   `.atmos__grid`, `.atmos__vignette`, `.ca-grain` and `.ca-hero-glow` are
   `display:none !important` site-wide from `nav-global-fix-2026-05-27.css`. This is an **OWNER
   DECISION**, recorded in the pre-minification source: *"OWNER-ORDERED: remove the disliked
   animated mesh / aurora / grain / glow ... Hide them globally for a clean, restrained
   surface."* The originating commit is titled "mobile LCP fixes", which makes it look like a
   media query that escaped its block. It is not. 31 pages ship a `.ca-grain` div and 27 a
   `.ca-hero-glow` div that render nothing; do not add more, and do not un-hide them.
10. **Anything centred is centred on purpose by a global `!important` rule.** See P0 below.
    To left-align, mark the container `data-align="start"`. Do not add `!important` to page CSS
    hoping to win; the global rule is (0,1,4) and a page class is (0,1,0).

## DONE 2026-07-30 (measured, committed, not pushed)

- **P0 the pricing social card advertised a price that does not exist.** `Assets/og/pricing.png`
  read "CrowMark from £99/mo - CSRD Checker free"; `pricing.html` has sold Starter £49 / Pro £149
  / Portfolio quoted since R2.6, and the CSRD Checker no longer has a page. `index.png` sold a
  "PPN 002, Cyber Essentials and CSRD compliance" portfolio dropped when Core was switched off.
  **Found by READING the PNGs, not by inspecting the config** — the filenames and the config
  table both looked fine. Root cause: `STATIC_PAGES` duplicated each page's title and description
  by hand, and the duplicate drifted; it now reads `<title>` + meta description FROM the page, as
  the blog and glossary discovery always did (the only part that had not drifted). Also fixed:
  `inferProduct()` ended in an unconditional `return "blog"`, so 12 static pages — **including
  the homepage** — shipped a card badged "Blog"; `clip()` cut mid-word ("every plan has a 14-day
  t…"); the badge rendered a "CrowAgent" chip inches from the "CrowAgent" wordmark on every
  non-product page. 21 cards regenerated, 5 verified by reading. `2ba20138`.
- **P1 8 blog cards shared one generic subtitle; 7 pages ignored their own card.** `2ba20138`
  regenerated the cards; this pass fixed how they are *wired*. (a) `extractMetaDescription`
  required `name="description"` immediately followed by `content="…"` — **all 8 blog posts write
  content first**, so every one fell back to the identical line "Regulatory intelligence and
  compliance guides". Now parses the tag's attributes in any order. This is the SAME
  attribute-order trap that produced one of my false positives; there it was my grep, here it was
  shipped code. (b) 5 blog posts pointed at `crowmark.png` (a card headlined "CrowMark") and
  `blog/index` + `glossary/index` at the generic logo card, while their own titled cards were
  generated every build and shipped unreferenced. (c) **3 copies of `og-image.png` all shipped** —
  md5-verified: `Assets/og-image.png` (referenced by 21 pages) and `Assets/og/og-image.png`
  (referenced by 0) are byte-identical, and the repo-root one is a different 27 KB image
  referenced by 0. Both unreferenced copies withheld. Also capped the card title at 72 chars: the
  84-char changelog title was rendering 4 headline lines with the footer jammed against the
  bottom edge. `ed506ec6`.
- **Social-card markup completed on all 43 pages with an `og:image`.** 6 pages declared
  `twitter:card="summary_large_image"` with no `twitter:image`; `index.html`, the most-shared URL
  on the site, had `og:image` and nothing else — no width, height or alt. Every referenced OG file
  verified present and measured at exactly 1200x630. `171cb78d`.
- **P0 buyer/supplier split.** New `/crowmark-buyers` with its own proposition, proof and
  commercials; every capability read from the shipped product (`public-sector/*` +
  `council/*` i18n in crowagent-platform) and cited in the page head. All 8 buyer links
  repointed (mega menu, mobile menu, footer, about, index, pricing, roadmap, llms.txt);
  added to `sitemap.xml` (42 URLs). `b31e7d64`, `a777b281`.
- **P0 public beta branding.** Site-wide announcement bar and the `BETA_MODE` flag deleted
  (the flag could not simply be flipped: the `false` branch advertised self-serve signup that
  the platform refuses on submit). `crowmark.html` de-betaed including `<title>`/OG/Twitter and
  JSON-LD. Verified the beta message already fires at sign-in on the platform, which is where
  the owner wants it. `BETA-MODE.md` rewritten to match reality. `3d171178`.
- **Site-wide: `.ca-eyebrow-dot` rendered nothing** on all 38 occurrences across 12 pages.
  `display:inline`, so its 6px width/height never applied; the `flex:0 0 auto` in the same rule
  showed the author assumed a flex parent that does not exist. One declaration fixed it.
- **Site-wide: `[class*=-step-num]` + `[data-step]`** removed from a broad `!important` colour
  rule. Measured: the substring selector matched exactly one class in the whole site (a new
  one it was repainting off-brand) and `[data-step]` matched zero elements.
- **`_redirects` 126 → 79 rules**, all inside the honoured range; the real CF cutoff was
  measured live at ~115, not the ~109 in the file header. Branded 404 catch-all is live again.
  4 chained 301s fixed. `da0ea80b`.
- **0 broken internal links** across 1,018 hrefs. Biggest find: the Cmd+K palette index in
  `sovereign-features.js` was stale wholesale, 22 of 55 entries broken. `5875e2b6`.
- **51,152 bytes of dead JS deleted** (7 modules), duplicate `nav-inject.js` execution removed
  on 14 pages, 3 duplicate stylesheets on roadmap, 1,571 bytes of dead CSS from a sheet all 43
  pages load. `06639cac`, `ecd78e22`, `55a08b63`.
- **Unsubstantiated G-Cloud 14 / RM6396 claim removed** from `pricing.html`; 0 REVIEW flags
  left in shipped HTML. `ff9eeb6c`.

## Accessibility — first real measurement, 2026-07-30

**axe-core 4.x, WCAG 2.1 A + AA, run in Chrome against the live localhost build.** Inject with
`fetch('/node_modules/axe-core/axe.min.js')` then `eval`, wait ~3s for the injected nav/footer,
then `axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}})`.

13 pages scanned: `index`, `crowmark`, `crowmark-buyers`, `pricing`, `roadmap`,
`glossary/index`, `compare/crowmark-vs-autogenai`, `contact`, `about`, `sectors/highways`,
`blog/ppn-002-social-value-guide`, `faq`, `security`.

**CORRECTED 2026-07-30 - see the axe-under-reporting note below; two of these 13 were NOT clean.**

**Result: 0 WCAG 2.1 A/AA violations on all 13**, after fixing the only two that existed
(`058b5c22`): a `link-in-text-block` failure on roadmap and a site-wide `aria-prohibited-attr`
on the injected footer. Untested page families remain: the other 3 compare pages, 3 sector
pages, `tools/*`, `glossary/ppn-002`, `glossary/toms-framework`, `partners`, `resources`,
`integrations`, `changelog`, `404`, and the 5 `f8-legal` pages.

### axe UNDER-REPORTS `link-in-text-block`. Do not sign a page off on axe alone.

**Measured across the whole site: 55 real WCAG 1.4.1 failures on 12 pages that axe scored 0.**
On `compare/crowmark-vs-cleantender` axe reported 0 violations and **1 pass** for
`link-in-text-block` while 5 links actually failed - it samples a subset of nodes. **Two pages in
the "0 violations" list above were among the 12**: `compare/crowmark-vs-autogenai` (6 failures)
and `blog/ppn-002-social-value-guide` (4). My earlier all-clear on those was wrong.

Measure it directly instead of trusting the rule: compare the link colour against the
surrounding text colour and require 3:1 when the only distinction is colour. On light sections
the pairing is `rgb(14,124,104)` on `rgb(30,42,82)` = **2.72:1**; on dark sections it is 1.46:1.

**And `.ca-inline-link` is NOT the fix on article pages.** Verified: adding the class changes
nothing there, because each page's own style block carries `.article-body a{text-decoration:none}`
at (0,1,1), which outranks `.ca-inline-link` at (0,1,0). A hover-only underline does not satisfy
1.4.1 in any case. Fixed at source per page (`c76e9d01`, `4163fac6`), with block cards and
buttons opted out (`.cmp-relcard`, `.sv-btn`, `.cas-btn`, `.related-card`).

Coverage is now complete: **all 44 pages scanned, 0 axe violations and 0 inline-link failures.**
`body.f8-legal` carriers are exactly 5: `privacy`, `terms`, `cookies`, `cookie-preferences`,
`security`. Note `glossary/index.html` matches a grep for `f8-legal` only inside a CSS comment -
its body has no classes, so the centring rule DOES apply there.

### Open a11y item needing a decision - SC 4.1.3 on the PPN 002 calculator

`#tool-result` is `display:none` with no `role`/`aria-live` and no children at load; the result
card's `role="status" aria-live="polite"` is injected TOGETHER with its content by
`js/tool-engine-ppn-002-calculator.js`. Most assistive tech does not announce a live region that
was not already being monitored. The markup satisfies the letter of the SC, so this is **not**
recorded as a confirmed violation - proving it needs a real screen reader. The fix is a
persistent live region the engine writes into, plus a `?v=` bump on that JS everywhere.

**Two measurement artifacts in the MCP tab that produce false a11y findings:**
`document.hasFocus()` is false and `visibilityState` is hidden, so `el.matches(':focus')`
returns false even when the element IS `activeElement`. Any `:focus` style read via
`getComputedStyle` here is a **false negative** - this nearly produced a "no focus indicator"
report. (The calculator's focus ring is in fact fine: teal border at **10.42:1** against the
field.) Same family as the frozen-CSS-transition/opacity artifact already documented.

### The two axe "incomplete" items are NOT defects — do not "fix" them

- **`aria-valid-attr-value`** on the Products nav trigger. axe cannot confirm an `aria-controls`
  target while it is combined with `aria-haspopup` on a hidden panel. Checked directly:
  `#nav-mega-panel` DOES exist in the injected markup.
- **`color-contrast`, 26 to 86 nodes per page.** axe abstains behind a gradient or a
  `backdrop-filter`. Computed by hand instead: on `contact.html` 45 nodes checked, **44 verified
  passing, best ratio 20.3:1**, one real failure (the "Sample data" chip, fixed in `48a223a3`).

**If you write your own contrast checker, these three bugs cost three attempts:**
1. **Gradient text.** `background-clip:text` means the element's own background IS the glyph
   paint, not the backdrop. Comparing it against itself yields a fake 1.00 ratio. Take the
   element's gradient stops as the FOREGROUND and start the backdrop walk at its parent.
2. **Stop at the first opaque paint.** Continuing up past an already-opaque gradient collects
   the page background, which that gradient fully covers, and yields another fake 1.00.
3. Composite alpha backgrounds over what is behind them before computing the ratio, e.g. the
   chip's `rgba(4,14,26,.78)` composites to `rgb(59,67,76)` over a white section.

### Two hard constraints discovered while fixing these

- **You CANNOT introduce a new Tailwind utility class on this site.**
  `sovereign-core-v2.compiled.css` is a static, non-reproducible build artifact, so utilities
  absent at build time do not exist. Measured: `.underline` has **0** occurrences in it. Adding
  `class="underline"` changed nothing. Use a real rule; `.ca-inline-link` in nav-global-fix is
  now the primitive for WCAG 1.4.1 inline links.
- **A carve-out must outrank the `data-align` opt-out, not just the centring rule.** The opt-out
  matches a descendant `span`/`div` at (0,2,4); a carve-out written at (0,2,3) loses to it. Add a
  `[data-align=start]` variant. This is why the first `.text-right` fix silently did nothing.

## Performance — first real measurement, 2026-07-30

**Lighthouse 13.3.0, mobile, `--throttling-method=simulate`, headless Chrome**, on
`index.html`. Measure the **`dist/` build on a second server**, not the repo root: `dist/` is
what Cloudflare Pages publishes and, since `143216e2`, it is minified while the root is not.

```
npx http-server dist -p 8093 -c-1 --cors      # leave :8092 (repo root) alone
npx lighthouse http://localhost:8093/index.html \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --screenEmulation.mobile --throttling-method=simulate \
  --output=json --output-path=<scratchpad>/lh.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu" --quiet
```

| metric | baseline | + minify `143216e2` | + fonts `4d4a25b7` | budget |
|---|---|---|---|---|
| performance | 48 | 59 | **68** | — |
| accessibility | 100 | 100 | 100 | 100 |
| best-practices | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| FCP | 6.4 s | 4.8 s | **3.9 s** | — |
| **LCP** | 8.1 s | 6.3 s | **5.7 s** | **2.5 s — still 2.3x over** |
| TBT | 420 ms | 280 ms | **70 ms** | 200 ms — **now passing** |
| CLS | 0.072 | 0.072 | 0.072 | 0.1 — passing |
| total weight | 1,031 KiB | 720 KiB | **647 KiB** | — |
| requests | 45 | 45 | **42** | — |

Performance is by far the weakest measured dimension. The other three categories were already
100 before any work.

### DONE `4d4a25b7` — Inter consolidated to one variable file (-72 KB)

Inter shipped 4 files (3 statics at 72,388 B + `Inter-var.woff2` at 48,256 B pinned to weights
300/700 only). Now ONE `@font-face` at `font-weight: 100 900` pointing at the variable file.
Font payload **175 KB over 7 requests to 103 KB over 4**.

**Both stylesheets had to change.** `premium-v2.css` declared the same three statics and is
loaded by 9 pages (`blog/index`, `glossary/index`, the 5 `sectors/*`, `tools/index`,
`tools/ppn-002-calculator`); editing only `fonts-selfhosted.css` would have left those 9 pages
requesting deleted files. The build's asset-reference gate is what catches this.

**The verification that made it safe, worth reusing for any font change:** measure advance width
of the same string at the same size from the old face and the new one. They came out identical
(400: 856.48 vs 856.48; 500: 865.87 vs 865.88; 600: 875.10 vs 875.10), which proves line
breaking cannot change, and CLS duly stayed at 0.072. Also compare glyph coverage per character,
not per file: 16 probes including GBP, e-acute, l-stroke, en-dash and right single quote, zero
mismatches. The wght axis was confirmed to span the full 100-900 by seeing nine distinct widths.

Side benefit: the old statics were `unicode-range: U+0000-00FF`, so at weights 400-600 the
en-dash and right single quote (both in site copy) fell out of Inter to a system font. The
variable face carries them and has no range restriction, so that silent degradation is gone too.

**Operational gotcha:** `npm run build` fails with `EPERM` on `rm` of `dist/` while a server is
serving `dist/`. Stop the :8093 server before building; :8092 serves the repo root and is fine.

### Cross-page measurement, 2026-07-30 - CSS is constant, JS is the differentiator

Lighthouse had only ever been run on `index.html`. Run across four page families (mobile,
simulated, against minified `dist/`):

| page | perf | LCP | weight | reqs | img | **css** | **js** |
|---|---|---|---|---|---|---|---|
| `sectors/highways` | **74** | 4.7 s | 503 KiB | 35 | 0K | 273K | **97K** |
| `index` | 63 | 5.7 s | 647 KiB | 42 | 82K | 262K | 110K |
| `blog/ppn-002...` | 61 | 6.3 s | 768 KiB | 43 | 109K | 260K | **262K** |
| `crowmark` | 59 | 6.0 s | 731 KiB | 40 | 82K | 262K | **217K** |

**CSS is 260-273 KiB on every page, so it cannot explain the variance.** That much is solid, and
it is why purging unused CSS is NOT where the problem lives.

**CORRECTED 2026-07-30: my follow-up claim that "JS is the differentiator" was too strong.**
`index.html` does **not** load GSAP (verified by grep, and `typeof window.gsap` is `undefined`
there) yet scores 63, while `sectors/highways` also has no GSAP and scores 74. Both lack the
animation engine and they are 11 points apart, so JS payload alone does not explain it: index
carries 82K of images and 647 KiB total against highways' 0K and 503 KiB. The honest reading is
that the two GSAP pages are the worst two (`crowmark` 59, `blog` 61) AND that images and total
weight matter independently. GSAP is on 33 pages, but **not** on the homepage.

The delta is almost entirely two files, absent from the fastest page and present on the slowest:
`js/vendor/gsap.min.js` (71K) + `js/vendor/ScrollTrigger.min.js` (43K) = **114 KiB**, on 33 pages.

**They are NOT dead weight - do not delete them.** Verified: `sovereign-transformation-v2.js`
makes 7 `gsap.to`, 4 `gsap.set` and 8 `ScrollTrigger` calls and guards on `if (!gsap`;
`reveal-failsafe.js`, `section-motion-choreography.js` and `nav-inject.js` also use them. They
drive the scroll-reveal motion, which is one of the owner's acceptance criteria ("premium
motion"), so stripping them would trade a measured score for a stated quality goal.

### GSAP deferral: the SAFETY precondition is CONFIRMED GOOD (2026-07-30)

Tested properly by building GSAP-free copies of `crowmark.html` in `dist/` and measuring.

**Result: with GSAP entirely absent, `crowmark.html` has ZERO genuinely hidden elements.**
Content is revealed by a pure-CSS animation in nav-global-fix,
`animation: caHeroRevealFailsafe .7s var(--ease-canonical) .12s both`, which runs regardless of
whether the animation engine ever arrives. The belt-and-braces this repo built actually works.
So the deferral's worst case, permanently invisible content, **does not occur**.

**I NEARLY RECORDED A FALSE P0 HERE. Read this before trusting any invisible-content finding.**
My first measurement reported "22 text-bearing elements permanently hidden without GSAP,
including the hero CTAs", stable across samples at 4 s, 7 s and 11 s. It was **entirely an
artifact**: the MCP tab is `visibilityState:'hidden'`, so CSS animations freeze at
`currentTime: 0`, and `caHeroRevealFailsafe` starts at `opacity: 0`. The tell was an element with
computed `opacity: 0`, **no inline style, and no matching CSS rule in any stylesheet** — that
combination means an animation, not a rule. Applying the documented check
(`el.getAnimations().forEach(a => a.finish())`) took the CTA from 0 to 1 and the page-wide count
from 22 to **0**.

This artifact is already documented in this file and in project memory, and I still walked into
it and spent most of an iteration on it. **Always finish animations before counting hidden
elements, and always run a control** — my `index.html` no-GSAP test was meaningless because that
page never loaded GSAP, and the 5 elements it flagged are the inactive tab panel, hidden by
design and identically hidden in the control.

**What remains unverifiable with the tooling I have.** The residual deferral risk is not hidden
content, it is a FLICKER: if GSAP arrives after the CSS failsafe has already revealed an element,
`gsap.set()` may hide it again and re-animate it. Judging a flicker requires watching real
animation timing, and the only browser available freezes animations by design. Shipping the
deferral and calling it verified would be dishonest. **What would verify it:** a visible
(non-MCP) browser session, or a Playwright trace with screenshots at 100 ms intervals through the
first 2 s of load, on a page that loads GSAP (`crowmark.html`), watching for an element that
appears, disappears and reappears.

**The available move, deliberately NOT attempted here:** move those 114 KiB off the initial
bandwidth path (load after first paint via an idle callback rather than `defer`). **This is
genuinely risky and needs its own iteration.** Content visibility on this site is JS-gated - the
`nb-js` stamp hides content once JS confirms it is running, and `reveal-failsafe.js` exists
precisely because a delayed reveal can leave content hidden. Getting it wrong produces a
blank-content flash, a defect class this repo has already fought. Anyone attempting it must first
verify that first paint still shows content with the animation engine absent.

### CLOSED with an A/B: the GSAP lever is not worth taking (`c4aa415e`)

Two iterations were building toward moving `gsap.min.js` + `ScrollTrigger.min.js` (114 KiB,
33 pages) off the initial path. **Measured the prize first, A/B on the same page**, by serving a
copy of `crowmark.html` with the two vendor tags stripped:

| | with GSAP | without GSAP |
|---|---|---|
| performance | 63 | **63** |
| FCP | 3.9 s | 4.1 s |
| LCP | 5.8 s | 5.1 s |
| TBT | 310 ms | 370 ms |
| total weight | 731 KiB | 617 KiB |
| script | 217 KB | 103 KB |

**Removing 114 KiB and 2 requests entirely moves the score by ZERO**, and FCP and TBT come out
marginally worse. Only LCP shifts, by 0.7 s, inside the documented variance. A risky refactor of a
compiled module's init sequence for no measured gain is a bad trade. **Do not reopen this without
new evidence.**

### The LCP element is the hero headline — and the fade was NOT the cause

Lighthouse identifies the LCP element on `crowmark.html` as
`div.ca-hero-content > h1.ca-hero-title > span`, with 5.8 s split as **TTFB 313 ms + element
render delay 1156 ms**.

The headline was fading in from `opacity:0` over 0.7 s after a 0.12 s delay, so I removed it from
the `caHeroRevealFailsafe` selector list expecting to reclaim most of that. **It did not work:**
median of 3 runs after the change is LCP 5.8 s, unchanged. **An opacity-animated element becomes
an LCP candidate as soon as opacity exceeds 0** (~120 ms here), so the 820 ms was never binding.

**The 1156 ms element render delay is still UNEXPLAINED and is the open LCP question.** It is not
CSS bytes (constant across pages), not JS bytes (the A/B above), and not the hero fade. Next
candidates to test: font loading blocking text paint (the headline is Plus Jakarta Sans 800 with
`font-display:swap`), and the CSS parse cost of 260 KiB before first paint.

The change was **kept** on a smaller, separately measured claim: the headline now paints at full
opacity from 0 ms instead of fading over 820 ms, verified by polling in a real browser
(`h1 span` opacity 1 at every sample; buttons and frame still 0 → 1 by 720 ms, so the entrance
choreography survives). Perceived-performance improvement, anti-pattern removed, CLS unchanged at
0.004, hero verified correct in a 250 ms screenshot. **No LCP claim is made for it.**

### Playwright is the right tool for anything animation-timed

The MCP tab is `visibilityState:'hidden'` and freezes CSS animations, so it cannot judge reveal
timing at all. Playwright's headless Chromium reports `visible` and animations run. Harnesses in
the session scratchpad: poll `getComputedStyle` opacity via `page.evaluate` in a loop (simple and
correct), and `page.screenshot` at intervals to read pixels.

**A caution learned the hard way:** an `addInitScript` sampler reported "never became visible" for
elements a direct poll showed reaching opacity 1. Prefer the direct poll. And gate any flicker
claim on **viewport intersection** — `main section` elements going 1 → 0 below the fold looked
like 5 flickers and were simply the scroll-reveal system arming off-screen, invisible to a user.

### SOLVED: the 1156 ms LCP render delay is render-blocking CSS (measured 2026-07-30)

The open question from the previous iteration is answered with a three-way A/B on
`crowmark.html` (mobile, simulated, median-representative single runs):

| scenario | perf | FCP | LCP |
|---|---|---|---|
| control, as shipped | 58 | 4.4 s | 6.0 s |
| **all CSS made non-render-blocking** | **70** | **1.1 s** | **3.5 s** |
| webfonts removed | 72 | 3.1 s | 4.9 s |

**Render-blocking CSS costs roughly 3.3 s of FCP and 2.5 s of LCP.** Fonts cost a further
~1.3 s of FCP. This is the whole performance story; it is not JS (see the closed GSAP A/B) and
not request count (see the reverted bundling experiment).

### How much CSS the first screen actually needs, per sheet

Measured in a real browser at 412x823 by testing every rule's selector against elements whose
box intersects the first viewport:

| sheet | rules | needed for first screen | size | needed |
|---|---|---|---|---|
| `nav-global-fix-2026-05-27.css` | 668 | **151** | 110.5 KB | **25.4 KB** |
| `sovereign-core-v2.compiled.css` | 893 | **48** | 81.9 KB | **14.4 KB** |
| `crowagent-brand-tokens.css` | 23 | 10 | 19.0 KB | 16.6 KB |
| `ultra-premium-responsive.css` | 102 | 22 | 16.4 KB | 5.4 KB |
| `premium-transformation-2026-05-27.css` | 115 | 27 | 16.1 KB | 4.2 KB |
| `premium-gloss-2026-05-31.css` | 25 | 9 | 6.8 KB | 2.2 KB |
| `ultra-premium-interactions.css` | 30 | 4 | 3.8 KB | 0.7 KB |
| `sovereign-cmdk`, `product-carousel`, `no-js-content-fallback`, `signature-atmosphere`, `back-to-top` | 66 | **0** | ~9.6 KB | 0 KB |

**271 of 2039 selector rules (69 KB of 257 KB) are needed for the first screen.** The waste is
concentrated in two files: nav-global-fix ships 110.5 KB to use 25.4 KB, and the compiled
Tailwind sheet ships 81.9 KB to use 14.4 KB.

### Three quick fixes measured and REJECTED — do not retry these

1. **Per-run CSS bundling** — tried, reverted (`b8a2f873`). Preserved the cascade, still cost
   107 KiB because `nav-inject.js` re-downloaded sheets it could no longer find by href.
2. **Coverage-based critical CSS** — Chrome's CSS coverage marks a rule used if it matches ANY
   element in the DOM, including below-fold. Measured: **169 KB of 257 KB "used" (66%)**, so the
   generated critical file was 171 KB. Useless as a critical subset.
3. **Deferring the zero-contribution sheets** — the two largest (`sovereign-cmdk` 4.4 KB,
   `back-to-top` 0.9 KB) are already injected by `nav-inject.js` at runtime and therefore already
   non-blocking. `no-js-content-fallback.css` MUST stay blocking or content can flash hidden.
   The remaining deferrable total is 1 to 2 KB. Not worth a commit.

### The real fix, and why it is an OWNER DECISION rather than something I shipped

Inlining the true 69 KB critical subset would mean ~80 KB of inline CSS in every one of 44 HTML
documents, uncacheable across pages and paid again on every navigation. Standard practice caps
critical CSS around 14 to 50 KB. The reason the subset is so large is structural: **this site's
CSS is not organised by render priority**, so the first screen genuinely pulls rules from all
seven substantive sheets.

The fix that would actually work is splitting `nav-global-fix` and `sovereign-core-v2.compiled`
into above-fold and below-fold halves, loading the first half blocking and the second async. That
is a substantial refactor of the two files every page depends on, with real regression risk across
44 pages, and the compiled Tailwind sheet is additionally **not reproducible from its source**
(a fresh build yields 109 KB against the committed 166 KB because of hand-applied token
substitutions). It should be a deliberate decision with time budgeted for verification, not
something slipped into an autonomous iteration.

## Orphaned assets: 15.3 MB was shipping publicly, 9.5 MB withheld, 2026-07-30

**The build's reference check runs ONE WAY only.** It proves every referenced asset exists; it
never asks whether a shipped asset is referenced. So `dist/` had accumulated **161 assets totalling
15.3 MB that nothing links to**, all publicly fetchable.

The content mattered more than the weight. Six directories were **100% unreferenced**:

| directory | files | size | what it is |
|---|---|---|---|
| `Assets/product-shots` | 60 | **6.0 MB** | screenshots of **REMOVED products** (`app-esg-*`, `app-cash-*`, `app-cyber-*`) |
| `Assets/marketing-screenshots` | 7 | **2.9 MB** | internal working files, e.g. `app.crowagent.ai_ppn002_social_cal.png` |
| `Assets/photos/sectors` | 6 | 581 KB | unused imagery |
| `Doc` | 2 | 510 KB | legal PDFs dated 2026-03 |
| `Assets/blog-heroes` | 7 | 132 KB | unused imagery |
| `Assets/logo`, `Assets/og/avif` | 4 | 13 KB | tiny |

`Assets/product-shots` is the one that matters: anyone could fetch
`crowagent.ai/Assets/product-shots/app-cash-invoices.png` and see a product the site no longer
sells. That is a consistency problem, not a page-weight one — these files are never downloaded by
a visitor, but they are crawlable and citable.

### Fixed: `ASSET_DENY_DIRS` in the build

Four directories are now withheld: `product-shots`, `marketing-screenshots`, `photos/sectors`,
`blog-heroes`. Result: **375 → 294 files, 81 assets and 9.5 MB withheld**, and the build now
reports what it refused to ship rather than hiding it.

**The safety net is the existing reference check**: if a withheld directory were in fact needed,
the build FAILS. It passed, which is the proof. Verified further in a browser across all 44 pages
with lazy-loading forced: **74 images checked, 0 broken, 0 4xx responses.**

### Still orphaned, deliberately: 5.6 MB

- **`Doc/` — 2 legal PDFs (510 KB), `privacy-policy-2026-03.pdf` and
  `terms-and-conditions-2026-03.pdf`, both unreferenced. OWNER DECISION, not a build cleanup.**
  Stale or archived legal documents may be linked from a contract, an email or a signed agreement,
  and withdrawing them could break a reference someone relies on. Equally, leaving a superseded
  policy publicly fetchable alongside the live HTML one has its own risk. Needs a call.
- ~3.2 MB of PNG and 826 KB of WebP inside partially-used directories (`Assets/og`,
  `Assets/photos`, `Assets/blog-photos`). Directory-level exclusion cannot reach these; they need
  per-file review, and several are plausibly intended (OG images for pages that may return).
  Largely resolved since: `Assets/og/avif`, all of `Assets/shots/_raw` (3.7 MB) and 2 rejected
  device shots are now denied, taking the withheld total from 9.5 MB to 13.7 MB across 98 files.
  The five below are the identified remainder of the `Assets/og` share.
- **5 retired OG cards still on disk. OWNER DECISION.** `demo.png`, `csrd.png`, `crowcyber.png`,
  `crowcash.png`, `crowesg.png` — no page, referenced by zero HTML, no longer regenerated. Four
  advertise decommissioned or never-launched products *with prices* ("CrowCyber from £99/mo",
  "CrowCash from £79/mo"). Not deleted, because a URL someone shared in the past still resolves
  today and deleting breaks that card. `generate-og-images.js` now emits a `warn` naming them on
  every run, so the decision cannot quietly lapse.
- **7 orphaned CSS files (81 KB)**, including `page-fixes-sf22.css` (2.3 KB), loaded by 0 pages.

### Worth adding later: make the check bidirectional

The one-way reference check is the root cause of this accumulating unnoticed. A warning (not a
failure) listing unreferenced shipped assets would have surfaced 15.3 MB years earlier. Left as a
suggestion rather than implemented, because a warning that fires on 81 legitimate-ish files every
build gets ignored; it needs an allowlist first.

**Every finding since has come from running that audit by hand**, which is the argument for
automating it: the `_raw` schema leak, 2 rejected device shots, 3 copies of `og-image.png`, and 7
purpose-built OG cards that shipped while their pages pointed elsewhere. Withheld is now 100
files / 13.8 MB, up from 81 / 9.5 MB. The remaining orphan count is small enough that the
allowlist objection has largely dissolved — re-run
`node <scratchpad>/orphans.js dist` against a fresh build to size it.

**Mechanism note:** `ASSET_DENY_FILES` is the per-file deny (for files sitting beside published
ones). Root-level files bypass `copyDir`, so the root copy loop consults the same set — adding an
entry for a root file did nothing until that was wired up. Both paths tally the withheld bytes.

## Dead-CSS audit, 2026-07-30 — 49.5 KB found, only 3.2 KB safe to remove

Applied the "reduce bytes" conclusion to its safest possible form: rules matching **nothing on any
of the 44 pages**, which needs no critical-CSS split. Measured per rule in a real browser, with
state/interaction selectors deliberately excluded from the dead set.

| sheet | total | provably dead |
|---|---|---|
| `sovereign-core-v2.compiled.css` | 80.5 KB | **31.3 KB** (413 rules) |
| `nav-global-fix-2026-05-27.css` | 100.6 KB | **13.5 KB** (96 rules) |
| `premium-transformation-2026-05-27.css` | 12.8 KB | 2.6 KB |
| `ultra-premium-responsive.css` | 14.6 KB | 1.3 KB |
| `ultra-premium-interactions.css` | 3.8 KB | 0.6 KB |
| `premium-gloss-2026-05-31.css` | 6.6 KB | 0.2 KB |
| **total** | | **49.5 KB** |

### Why 46 KB of that must NOT be deleted

1. **63% of it (31.3 KB) is in the compiled Tailwind artifact, which CANNOT be regenerated.**
   `sovereign-core-v2.compiled.css` is 166 KB built from an 18.8 KB source, and a fresh
   `npx tailwindcss` run yields 109 KB because the committed file carries hand-applied token
   substitutions. The dead rules there are base resets (`hr`, `small`, `sub`, `progress`,
   `::file-selector-button`) and unused utilities (`.fixed`, `.collapse`, `.@container`). On a
   normal Tailwind setup you would just rebuild. **Here, deleting them permanently removes the
   ability to use those class names** — add `class="fixed"` next month and it silently does
   nothing. That is a far worse defect than 31 KB of weight.
2. **My own audit has a false-positive class.** The state guard missed `:checked`, so rules like
   `#ca-cookie .cookie-toggle .cookie-chk:checked + .cookie-slider` were counted dead. They are
   not: they style the cookie toggle when it is switched on. Any future run of this audit must
   also guard `:checked`, `:disabled`, `:required`, `:invalid`, `:placeholder-shown`, `[open]`.
3. Some genuinely-dead rules are **committed to come back**: `.pcar__caption` is dead only because
   the carousel was reduced to one slide, and the backlog commits to restoring slides once real
   captures exist.

Net: the ~13 KB that is both genuinely dead and safely removable is **5% of 257 KB** and would not
move the 3.3 s FCP problem. **The structural split remains the only real fix.** This is the third
measured-and-rejected attempt at a shortcut, after CSS bundling and coverage-based critical CSS.

### What WAS removed: 3,229 bytes of CSS I orphaned myself

Deleting the announcement bar in `3d171178` left `.announce-bar` / `#announce-bar` rules behind in
six stylesheets (8.2 KB total). Removed from the four that load on every page: 19 rules deleted,
8 now-empty at-rules dropped, **3,229 bytes off every page load**.

**Done with postcss, not regex, and that mattered.** One rule was
`#announce-bar .ab-dot, #back-to-top, .announce-bar .ab-dot` — a mixed selector list where
`#back-to-top` is LIVE. A regex delete would have stripped the back-to-top button's styling on
every page. Only the dead selectors were dropped. Verified after: `#back-to-top` still
`position:fixed`, 50% radius, 44x44px, teal; no announce-bar in the DOM; no overflow; 15 nav
links; **0 JS errors** on crowmark, index and pricing.

Left alone: `print.css` (970 B, `media="print"` only) and `page-fixes-sf22.css` (2,291 B) — the
latter is **loaded by 0 pages**, i.e. an entire dead stylesheet shipping in `Assets/`. Separate
finding, not touched here.

### METHODOLOGY BUG worth knowing: CSS Nesting broke the classic rule-walk

`if (rule.cssRules) { recurse; continue; }` is the standard idiom for walking a stylesheet. **Since
CSS Nesting shipped, `CSSStyleRule` exposes an empty `cssRules` list, so that check is truthy for
ordinary style rules** and the walk silently swallows every one of them. Measured symptom: 758
rules visited, **0 selectors read**, and the audit cheerfully reported "0 KB dead". Always test
`selectorText` FIRST and only recurse when it is absent. The earlier per-sheet and above-fold
audits in this file happen to check `selectorText` first, so their numbers stand.

## Build tooling: an armed footgun and 5 dead npm scripts, 2026-07-30

I had recorded the `scripts.js` / `scripts.min.js` drift as needing an owner decision. Part of it
does. But investigating it turned up something that did not: **a working npm script that would
have silently regressed the site.**

### `build:js:legacy` would have clobbered the shipped bundle

`"build:js:legacy": "terser scripts.js --compress --mangle --output scripts.min.js"`

terser IS installed, so unlike the other broken scripts **this one would run**. It would
regenerate `scripts.min.js` — the file 22 pages load — from `scripts.js`, which is STALE.
Measured with comments stripped, so these are live-code counts:

| | `scripts.js` (source, loaded by 0 pages) | `scripts.min.js` (loaded by 22) |
|---|---|---|
| `cyber` | 8 | 4 |
| `cash` | 8 | 4 |
| `esg` | 5 | 1 |
| panels array | `['core','mark','cyber','cash','esg']` | same, still present |
| current portfolio | partially updated | `crowmark` / `public-sector` / `private-sector` |

CrowCyber, CrowCash, CrowESG and Core were removed from the site under TM-REMEDIATION-001. That
removal reached the bundle and not the source. So running `build:js:legacy` would have reverted a
product-portfolio change across 22 pages, from a command that looks like routine housekeeping.

**Both `build:js` and `build:js:legacy` now refuse to run** and print why. Verified: running
`npm run build:js` exits 1 with the explanation.

### 5 of 18 npm scripts pointed at files that do not exist

`build:js` → `scripts/build-js-min.js`, `build:css:purged` → `scripts/build-css-purged.js`,
`test:lighthouse` → `scripts/run-lighthouse-ci.js`, `verify:test-layers` →
`scripts/verify-test-coverage-layers.js`, `verify:h3-perf-fix` → `scripts/verify-h3-perf-fix.js`.

**The missing `build:js` is WHY the drift exists** — the documented way to rebuild the shipped
bundle has been impossible to run, so the bundle was hand-edited instead. The four
non-destructive dead entries are removed; `npm run` now lists only commands that work.

### The dead product code in the shipped bundle is inert — verified, not assumed

`scripts.min.js` still contains `['core','mark','cyber','cash','esg']` and 46 `csrd` references.
Before considering surgery on a minified file with no working build, I checked whether any of it
can reach a visitor: **0 URLs referencing removed products, 0 visitor-facing strings** (the
apparent matches are minified identifiers such as `window.csrdSelect`), and the console sweep
already showed **0 failed requests and 0 console errors across 44 pages**. `js/modules/csrd-wizard.js`
is referenced but MISSING, and is never fetched because the reference sits inside a Node-only
`typeof module !== 'undefined'` guard. So it is dead weight, not a defect, and editing a minified
33 KB file with no regeneration path is not worth it.

**Still an owner decision:** whether to reconcile `scripts.js` up to the bundle and restore a real
build step. The order matters and is now recorded in the file's own header — source must be brought
up to the bundle first, never the reverse.

### Build now explains EPERM instead of dumping a stack

`npm run build` fails with `EPERM` on `rm` of `dist/` whenever a server is serving that directory,
and the script's 10x retry cannot clear it. It now prints the cause and the exact commands to fix
it, naming `:8093` and noting that the repo-root server on `:8092` is a different process and can
stay up. This fired twice for real during this iteration, which is how it was validated.

## Cross-browser + design-system audits, 2026-07-30 — both clean

### Chromium vs WebKit (Safari engine) — VERIFIED CLEAN

WebKit 26.4 installed via `npx playwright install webkit` (57.6 MiB, lives in the Playwright
cache outside the repo). All 44 pages compared on both engines.

**The ONLY differences are floating-point representations of identical font sizes**
(75.2px vs 75.199997px, 63.36 vs 63.360001, and so on). Everything that matters is identical:
0 overflow differences, 0 nav/footer link-count differences, 0 hidden-text differences,
0 broken-image differences, 0 body-height differences beyond noise, and **0 WebKit JS errors**.

This matters because the site leans on features where WebKit historically diverges:
`backdrop-filter`, `:has()`, `inert`, `background-clip:text` and `text-wrap:balance`. All of them
behave. The `-webkit-` prefixes already in the stylesheets are doing their job.

### Heading structure (WCAG 1.3.1) — VERIFIED CLEAN

**43 of 43 real pages: exactly one `h1`, no skipped heading levels.** The single flagged file is
`googlef2adc6102725418d.html`, a Google Search Console verification stub with no headings by
design. Not a defect, and it must keep shipping for verification to hold.

### Design-system coherence — measured, no defect worth fixing

Rendered values across 44 pages: 82 distinct font sizes over 4,045 uses, 150 line heights,
51 text colours, 28 border radii, 35 flex/grid gaps.

**The long tails are mostly NOT incoherence.** The fractional values (17.6px, 18.88px, 32.096px,
63.36px) come from `clamp()` and vw-based fluid typography resolving at a fixed 1280px viewport.
That is correct modern practice; counting distinct rendered values will always over-report on a
fluid type system, so **do not use this metric as a quality signal here**.

Genuine but cosmetic inconsistencies found, deliberately NOT changed because none is
user-visible and all sit in hand-maintained minified stylesheets:
- **Five different ways to express "fully rounded"**: `999px` (279 uses), `calc(infinity*1px)`
  (137, renders as 3.35544e+07px), `100px` (55), `50%` (73), `99px` (4). All render identically
  for a pill.
- **~14 distinct non-pill corner radii** (8, 12, 14, 16, 18, 22, 24, 32 plus one-offs 19, 21, 26,
  34, 40, 48). A tight system would use about four.
- **The same ink at six alpha values**: `rgba(4,14,26,·)` at 0.6, 0.62, 0.75, 0.78, 0.82, 0.85,
  plus one lone `color(srgb ...)` in modern syntax. Indistinguishable by eye; token drift rather
  than a rendering fault. Contrast is unaffected (the earlier hand-computed audit found 44 of 45
  probes passing with the best at 20.3:1, and axe reports 0 colour-contrast violations).

## Console + keyboard-focus sweeps, 2026-07-30 — both clean

Two acceptance criteria that had never been measured beyond a single page. Playwright, all 44
pages in `dist/`.

### "Zero console errors" — VERIFIED CLEAN

**0 console errors, 0 warnings, 0 uncaught page errors, 0 failed or 4xx/5xx requests, across all
44 pages.** The sweep also opened a `<details>` and clicked an inactive `[role=tab]` on each page
to exercise the two interactions that most often throw. Nothing.

### WCAG 2.4.7 Focus Visible — VERIFIED CLEAN

**1,095 distinct focusable elements reached by real `Tab` presses across all 44 pages, 0 without
a visible focus indicator** (non-zero outline or a box-shadow).

**METHODOLOGY — you MUST dismiss the consent banner first, or you measure almost nothing.**
The banner applies `inert` to the rest of the page, which is the correct modern way to contain
focus in a modal. Without consenting, a Tab walk cycles endlessly between just 4 banner controls
while **95 focusable elements sit in the DOM**. My first run reported "4 focusables, 0 problems"
and looked like a pass; it was measuring only the banner. The harness now clicks "Accept all"
before walking.

Also note real `Tab` presses are required rather than `el.focus()`: `:focus-visible` only matches
keyboard-initiated focus, so programmatic focus reports every element as unringed. And the MCP
browser tab cannot do this audit at all — `document.hasFocus()` is false there, so `:focus` never
matches.

### The cookie banner is correctly implemented — do not "fix" it

Three things checked, all fine:
- **Focus containment via `inert`** while open. Intentional and correct for a modal.
- **Focus releases cleanly after consent.** Verified: tab order flows straight into the page
  (Request access → See pricing → the sub-nav links → prose links), every one with a visible ring.
- **Escape does NOT dismiss it, and that is right.** Under GDPR a dismissal must not be treated as
  consent, so offering an Escape that closes the banner without a choice would be worse than not
  offering one.

## Responsive + target-size sweep, 2026-07-30 — 44 pages x 4 widths

Playwright, widths 360 / 768 / 1280 / 1920, **176 page-width combinations**.

**HORIZONTAL OVERFLOW: 0.** Not one page scrolls sideways at any of the four widths. This is a
genuinely clean result and does not need re-auditing without cause.

### Target size: 0 real WCAG 2.5.8 AA failures remain

Raw output looks alarming (286 distinct sub-44x44 targets) and is **mostly false positives**.
Triage it before acting:

- **Inline links in prose are EXEMPT** from 2.5.8. Three of the seven "AA failures" on
  `crowmark.html` were `<a>` inside `<p>` (the compare cross-link, the Companies House number,
  the cookie-policy link). Filter on `closest('p,li,dd,figcaption,blockquote')` + inline display.
- **`a.skip-link | 1x1` is correct by design** — visually hidden until focused.
- **44-tall / narrow nav links (29x44, 26x44, 39x44) PASS AA**, whose minimum is 24x24. They
  only miss the project's stricter 44x44 rule in CLAUDE.md.
- **THE BIG ONE — `getBoundingClientRect()` CANNOT SEE PSEUDO-ELEMENT HIT EXPANDERS.** The nav
  controls measure 40px tall and look non-compliant, but `nav .nav-search-trigger::before`,
  `nav .nav-actions .nav-login::before` and `nav .nav-actions .nav-cta::before` each declare
  `min-width:44px; height:44px`, so the real hit area is already 44x44 (the hamburger has a hard
  44px instead). **These are NOT defects.** Any target-size audit on this site must check for a
  `::before` expander before reporting a small visible box.

### What was genuinely broken, and fixed (`crowmark.html`)

- **Sticky sub-nav links measured 104x16, 70x16, 56x16, 27x16** — 16px tall against the 24x24 AA
  minimum, standalone navigation controls so no prose exemption, and no pseudo-expander. A real
  WCAG 2.5.8 AA failure. Now `inline-flex items-center min-h-[44px]`: measured **104x44, 70x44,
  56x44, 27x44**.
- **FAQ `<summary>` measured 1152x28** — AA-compliant but under the project's 44px rule, and
  `/crowmark-buyers` already set 44px on its own summaries. Now **44px** (64px at 360 where the
  question wraps).
- **The bar's `py-4` was then removed.** With the links carrying their own 44px the bar had grown
  to 77px, stacking 149px of chrome under the 72px main nav. Without it the bar measures **45px**,
  so the targets are compliant AND it is 3px leaner than the 48px it started at.

Verified after: 0 overflow at 360/768/1280, sub-nav correctly `display:none` below `lg`, and
**0 non-exempt AA failures on `crowmark.html`** (7 → 3, all three exempt inline prose links).

### MEASUREMENT DISCIPLINE — read this before quoting any score

**Lighthouse single-run scores on this machine vary by roughly ±5 points, and TBT far more.**
Re-running the UNCHANGED build gave performance 63 / TBT 280 ms where an earlier run gave
68 / 70 ms. The progression quoted above is one run per stage and implies more precision than
that supports. **The deterministic measures are the trustworthy evidence** — total weight
(1,031 → 720 → 647 KiB) and request count (45 → 42) are reproducible; the score and the timings
are not. Take a median of 3+ runs before claiming a score moved, and prefer bytes and requests.

### DO NOT RETRY: CSS bundling was tried, measured worse, and reverted (`b8a2f873`)

Collapsing the 11 render-blocking stylesheets into per-run content-hashed bundles worked
exactly as designed — 414 links across the site to 88 via 20 bundles, with every probed
computed style identical to the unbundled build, so the cascade was preserved. **It still made
the page worse: weight 647 → 754 KiB, FCP 3.9 → 4.4 s.**

**Why, and it is a coupling worth knowing about generally.** `js/nav-inject.js` finds its own
stylesheets by href (`link[href*="nav-global-fix-2026-05-27"]`) and **appends a fresh `<link>`
when it cannot find one**, so the injected nav is never unstyled. Bundling dissolved those
hrefs, so it re-downloaded `nav-global-fix` (104 KB) and `premium-gloss` (7 KB) on top of the
bundle that already contained them: 111 KB of exact duplicate. **The build and that runtime
injector are coupled through href strings.** Any future attempt must solve that first, and
excluding those two sheets removes most of the benefit since `nav-global-fix` is the largest file.

**The more useful conclusion:** even before the duplicate download, collapsing 11 requests into 1
did not improve the score and `render-blocking-insight` still reported ~2,240 ms. **The cost is
CSS bytes parsed before first paint, not request count**, and in production those requests
multiplex over HTTP/2 regardless. Reducing bytes is the lever.

### Also outstanding
- **~420 ms of unused CSS remains** after minification: 43 KB unused of 104 KB in
  `nav-global-fix`, 13 of 15 KB in `premium-transformation`, 11 of 16 KB in
  `ultra-premium-responsive`. Purging is riskier than minifying because this site's rules are
  reached by JS-injected markup and `:has()` selectors that a static purge will not see. If
  attempted, do it per-file into `dist/` with the same fail-loudly discipline, and verify the
  injected nav, footer, cookie banner and mega-menu still style correctly.
- **TBT 280 ms against a 200 ms budget.** 234 KB of script across the page.
- Lighthouse was run on `index.html` only. Other page families are unmeasured.

## P0 — the one that shapes everything else

- [ ] **The whole site force-centres its body copy.** In `nav-global-fix-2026-05-27.css`:
      `body:not(.f8-legal) main section :is(h1,h2,h3,h4,h5,h6,p,span,a,li,div,dt,dd,blockquote,figcaption,.ca-eyebrow,[class*=eyebrow]){text-align:center!important}`
      Every heading, paragraph, span, link, list item, div, dt, dd, blockquote and figcaption
      inside every `<section>` on all 43 non-legal pages. Centred running prose at a long
      measure is the single biggest reason the site reads as templated, and none of the
      benchmark products (Stripe, Linear, Vercel, Apple, Anthropic) centre body copy.
      **An opt-out now exists** (`data-align="start"`, added beside the rule, zero prior uses so
      zero regression risk) and `/crowmark-buyers` uses it. **The remaining work is to go page
      by page**, decide what is a section header (stays centred) and what is prose (opts out),
      and verify each page visually. Do NOT rewrite the global selector in one commit; that puts
      43 pages at risk simultaneously.

### Browser-measured census, 2026-07-30 — use this, do NOT re-derive statically

**A static scan of the HTML gives the wrong answer.** It said the four `compare/*` pages were
the worst offenders (5.2k to 5.8k chars each); measured in a real browser they have **0**
centred paragraphs, because that page family carries its own left-aligning rules at higher
specificity. Blog pages are also clean: their body copy is not inside a `<section>` in
`<main>`, so long-form reading was never affected. Always measure with:

```js
const ps=[...document.querySelectorAll('main section p, main section li, main section dd')]
  .filter(p=>p.textContent.trim().length>=110);
ps.filter(p=>getComputedStyle(p).textAlign==='center').length
```

| page | centred (>=180ch) | longest | status |
|---|---|---|---|
| `glossary/index.html` | 23 of 23 | 263 | **DONE** — 23→0. Marked `#ggrid` (all 23 term cards) and `.xlinks` |
| `roadmap.html` | 14 | **953** | **DONE** — 14→0, including the 953-char milestone. Marked `ol.ca-timeline`, 3 section leads, `.space-y-12` |
| `pricing.html` | 13 | 507 | **DONE** — 13→0 |
| `crowmark.html` | 11 | 444 | **DONE** `88d01ded` — 18→7 at >=110ch, the 7 are display copy |
| `index.html` | 5 | 221 | **DONE** — 5→2; the 2 left are centred by the page's OWN css (`.nb-pcap`, `.nb-dev-copy`), not the global rule |
| `integrations.html` | 2 | 251 | **DONE** — 2→1 (hero subhead) |
| `resources.html` | 2 | 185 | **DONE** — 2→0 |
| `about.html` | 1 | 246 | **DONE** — the 1 is the hero subhead |
| `partners.html` | 1 | 234 | **DONE** — the 1 is the hero subhead |
| `sectors/highways.html` | 1 | 256 | **DONE** — the 1 is the hero subhead |
| `crowmark-buyers.html` | 2 | 339 | **no change needed** — the hero subhead and a section lead |
| `compare/*` (5), `glossary/ppn-002`, `glossary/toms-framework`, 8 blog pages, `faq.html`, `contact.html`, `changelog.html`, `sectors/index`, `tools/*`, `404` | 0 | — | already clean |

5 pages are `body.f8-legal`, which the rule excludes entirely.

**THE TRAP — mark the content container, never an ancestor that also holds the section
heading.** The opt-out is `!important` and targets `:is(h1..h6, …)` descendants, so it beats a
`text-center` utility on that heading. Marking a `.ca-container` that contained
`<h2 class="ca-section-title text-center">` silently left-aligned a heading that is deliberately
centred; a screenshot caught it. On `/crowmark` the mark now sits on each
`<details class="faq-item">`. After every change, assert that **every** `main section h2` still
computes `center`.


**Two refinements to the policy, established by measurement:**
- **The `p, li, dd` census query has a blind spot.** `sectors/highways.html` FAQ answers are
  `div.a`, so the query never saw them and the page was under-reported. Add `div` to the
  selector, or check per page, before declaring a page clean.
- **The line drawn for section leads:** a lead of **2 rendered lines or fewer stays centred** as
  display copy; **3 or more lines opts out** as prose. Applied consistently and measured, not
  eyeballed. This supersedes the earlier "tighten the copy instead" note for leads that are
  already short.

### Related, but NOT an alignment problem — copy length

Several `.ca-section-desc` section leads run 180 to 264 chars, which is three lines of centred
text. Left-aligning them would break the section-header idiom the whole site uses, so alignment
is the wrong lever. The defect is copy **length**: these leads should be tightened to roughly one
or two lines. Treat as a separate copy task, not part of the alignment pass.

## P0 — visitor-visible, still broken

- [x] **DONE 2026-07-30 · `mark-reports.png` schema leak AND `mark-opportunities.png` broken
      image, both withdrawn** (`f2c7bc2d`). Larger than recorded: 8 placements across the two
      most important pages. Cropping was impossible — the `Reads from:` line is in all 8 cards
      on every row. Checked the source rather than assuming a product bug: the table list is a
      DELIBERATE verifiability feature (`report-templates.ts:9-14`, R261-REPORT-001, asserted by
      a test), so it is right in the product and wrong on a marketing page. Not changed in the
      platform: its CLAUDE.md requires a REQ-ID and forbids silent spec deviation, and R2.6.2 is
      paused. `mark-opportunities` was a broken crop (left edge cut mid-word, no chrome,
      over-scaled, right two-thirds empty) whose raw reads "Your session has expired", so it was
      never made from that raw. Also fixed two mismatches found while mapping placements: a
      homepage panel captioned "Every bid in one register" was showing the reports catalogue,
      and the CrowMark **for Buyers** card was showing the **supplier** analytics screen.
- [x] **CLOSED 2026-07-30 · Support-chat bubble baked into captures.** Does not apply to any
      published image. Every currently published shot was READ: `mark-analytics`,
      `crowmark-mobile-dark-02` and `crowmark-tablet-dark-01` all have clean bottom-left
      corners and real product chrome. The captures that carried the bubble were
      `mark-reports` and `mark-opportunities`, both deleted in `f2c7bc2d`. Nothing to
      re-capture.

## Verified image inventory (READ as images — do not re-derive)

| asset | verdict |
|---|---|
| `dark/mark-analytics` | **USE** — 18 contracts, 70% win rate, £2,385,950 across 7 won bids, 87% evidence |
| `mobile/crowmark-mobile-dark-02` | **USE** — CrowMark Analytics on mobile, same figures, real chrome. Published on index.html |
| `tablet/crowmark-tablet-dark-01` | **USE** (read 2026-07-30) — same Analytics surface at tablet width, same figures, charts populated, no chat bubble. One flaw: the RIGHT EDGE is slightly clipped, cutting the Print button and the avatar. Acceptable inside the device frame it sits in on index.html, but re-capture wider if that frame ever changes |
| `tablet/crowmark-tablet-dark-02` | **REJECT + WITHHELD** (read 2026-07-30, `c00ab47a`) — literal **"Test Contract 1" / "Test Authority"**, empty tenant (0 active contracts, "—" win rate, 0 bids won, "No submissions recorded"), a red "Unable to load opportunities" panel, chat bubble baked in, right edge clipping the Delete button |
| `mobile/crowmark-mobile-LIGHT-01` | **REJECT + WITHHELD** (read 2026-07-30, `c00ab47a`) — every headline metric empty or zero: 1 Total Contract, 0% Bid Win Rate, "—" Social Value Delivered, 0% Evidence Completion; chat bubble baked in. Compare the published `crowmark-mobile-dark-02`: 18 contracts, 70%, £2,385,950 |
| `dark/mark-reports` | **DELETED** — 8 sets of internal table names, uncroppable |
| `dark/mark-opportunities` | **DELETED** — broken crop, cut mid-word, no chrome |
| `_raw/learnings-desktop-dark` | **REJECT** (read 2026-07-30) — 4 empty skeleton placeholders, most of page blank |
| `_raw/opportunities-desktop-dark` | **REJECT** — "Your session has expired" |
| `_raw/contracts-desktop-dark` | **REJECT** — "Create your first contract" while the sidebar says 18 |
| `_raw/home-desktop-dark` | **REJECT** — red "Compliance Health Score 41 Off track", features 2 archived products, exposes £237 |
| `_raw/answer-library-desktop-dark` | **REJECT** — "Couldn't load this section" |
| `_raw/reports-desktop-dark` | source of the deleted `mark-reports`; same leak |
| `_raw/analytics-tablet-dark`, `_raw/analytics-mobile-dark`, `_raw/contracts-tablet-dark`, `_raw/contracts-mobile-dark` | **UNREAD** — read before any use. No longer shipping (whole `_raw/` denied, `c00ab47a`), so they are no longer a public exposure; still unverified as source material |

### The whole `_raw/` staging directory was shipping to production (`c00ab47a`)

**Withdrawing a marketing image does not withdraw the capture it came from.** `mark-reports.png`
was deleted from the site in `f2c7bc2d` for leaking internal table names. On 2026-07-30 its
source, `_raw/reports-desktop-dark.png`, was **still publicly fetchable** — verified by reading
the copy in `dist/`, which shows 12 of them: `crowmark_contracts`, `bid_learnings`,
`crowmark_measures`, `crowmark_evidence`, `crowmark_extracted_requirements`,
`crowmark_compliance_matrix`, `crowmark_bid_assignments`, `profiles`, `bid_answer_library`,
`crowmark_clarifications`, `company_frameworks`, `crowmark_lots`.

14 files, 3.7 MB, referenced by zero HTML, including every capture already rejected for showing
a session error, a load failure, an empty tenant, or a red compliance score exposing £237 and two
archived products — plus 3 internal manifest JSONs. **A staging directory should never have been
inside the shipped tree.** Denied wholesale.

`ASSET_DENY_FILES` was added for the per-file case, because the two rejected device shots sit in
directories that also hold published ones. **The safety net was tested, not assumed:** adding a
*referenced* asset to the deny list fails the build and names the referencing pages.

Lesson for any future "withdrawn" claim: **deleting the reference is not deleting the asset.**
Check `dist/` for the source capture, the WebP/AVIF derivative and the raw, not just the HTML.

**Net: exactly ONE verified desktop screenshot and ONE verified mobile screenshot exist.** The
`/crowmark` hero shows the desktop one statically; the homepage showcase is down to 2 panels
(desktop analytics + mobile). Restoring more slides needs the BFF token below. `product-carousel-2026-05-26.js`
is now unreferenced by every page (0 `[data-pcar]` roots repo-wide) and its `<script>` tag was
removed from `crowmark.html`; the module is retained on disk pending that restoration. **If the
captures do not land, delete the module rather than leaving it unreferenced.** Its CSS must
stay either way — `.pcar__slide.is-active` supplies the `position:relative` that sizes the frame.

## P1 — thin product proof

- [ ] **40 of 43 pages carry no product screenshot.** Highest-intent gaps: the four
      `compare/crowmark-vs-*.html` pages and `compare/index.html`, plus the four
      `sectors/*.html` pages and `sectors/index.html`. These are where a buyer decides.
- [ ] `/crowmark-buyers` has no product screenshot either, and cannot have one until the
      blocker below is cleared — the `/public-sector/*` surfaces are exactly the ones that fail.
      It currently carries a CSS-drawn specimen, labelled an illustration in visible copy and in
      the figure's accessible name. **Replace it with a real capture, do not relabel it.**
- [ ] `/crowmark` renders "Create your first contract" with 0 active contracts **while the
      sidebar badge in the same render says 18** — a genuine product defect, not a capture
      problem. Blocks any contracts-list screenshot. Needs verification against prod before
      being called a prod bug.

## BLOCKER — the harness sends no BFF service token

`marketing-shots.mjs` injects only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_URL` — **no `BFF_SERVICE_TOKEN`**. Staging Railway
(`crowagent-platform-staging`) sets both `BFF_SERVICE_TOKEN` and `BFF_SERVICE_TOKEN_ENFORCED`,
so any surface fetched **server-side through the BFF proxy** is rejected, and the UI renders
that rejection as **"Your session has expired."** Cookie auth was never at fault; it works for
browser-client reads, which is exactly why `analytics` and `reports` captured cleanly while
`opportunities` and `answer-library` did not.

**THE FIX:** add the **STAGING** `BFF_SERVICE_TOKEN` to the harness `env`. Its value is redacted
to MCP reads (the Railway MCP returns variable names only to connected OAuth apps), so it must
come from the Railway dashboard or from the owner. **Do NOT reuse the prod token.** Staging does
not set `BFF_IDENTITY_SIGNING_ENFORCED` (prod does), so the token alone should suffice.

**Confirmed 2026-07-30 — the token is the ONLY thing missing, and no deploy is needed.**
`marketing-shots.mjs:65,124` spawns `npx next dev -p 3210` and captures `http://127.0.0.1:3210`,
i.e. the UI runs **locally from working-tree source** while only the DATA comes from staging
Supabase + staging Railway. Two consequences worth knowing before planning any capture work:
1. Any platform UI change is capturable immediately, with **no Vercel deploy** (which matters,
   since Vercel deploys need an explicit owner ask).
2. It also explains the failure precisely: the local dev server makes the server-side BFF proxy
   call to staging Railway without `BFF_SERVICE_TOKEN`, staging rejects it, and the UI renders
   the rejection as "Your session has expired." Nothing is wrong with the cookie auth.

Capture verdicts (all 7 read as images): analytics **USE** · reports use-but-leaks-table-names ·
opportunities / answer-library **REJECT** (session expired) · contracts **REJECT** ("Create your
first contract" while the sidebar counts 18) · home **REJECT** (red "Compliance Health Score 41
Off track", features the 2 archived products, exposes £237) · learnings unread.

## P2 — remaining code quality

- [ ] **`scripts.js` still carries the announce-bar dismiss handler**, its localStorage TTL
      check and the mob-menu offset recalculation, all now unreachable. `scripts.js` is the
      build INPUT for `scripts.min.js`, which is the file pages actually load, so removing it
      means rebuilding and re-bustering a site-wide bundle. Do it on its own with its own
      verification.
- [ ] **`scripts.js` is stale relative to the served `scripts.min.js`.** The min bundle's
      product-alias map is `{mark, crowmark, public, public-sector, private, private-sector}`
      while the source still has `{cyber, crowcyber, cash, crowcash, esg, crowesg}` — the
      artifact is NEWER than its source. Regenerating would revert live behaviour. Needs an
      owner decision on which is canonical.
- [ ] **`sovereign-core-v2.compiled.css` is not reproducible from its source.** `npx tailwindcss`
      on `sovereign-core-v2.css` yields 109,236 B against the committed 166,299 B, a 2,862-line
      diff, because the committed artifact carries hand-applied token substitutions. Do not
      rebuild it; three dead rules stay in the artifact until someone reconciles the build.
- [x] **CHECKED 2026-07-30 · `signature-atmosphere-2026-05-26.css` is NOT dead. Do not delete
      it.** The hypothesis was that it styles only `.atmos__*`, of which there is no markup.
      Wrong on two counts. (1) It defines a DIFFERENT naming scheme: `.atmos` and `.atmos-host`,
      not `.atmos__aurora`. `atmos-host` is live on 3 pages (`integrations.html`,
      `resources.html`, `roadmap.html`) across 5 elements, including non-hero sections. Its
      rules `.atmos-host{position:relative;isolation:isolate}` and
      `.atmos-host > :not(.atmos){position:relative;z-index:var(--z-content)}` are doing real
      layout and stacking work, so stripping the attribute could break those heroes. (2) It also
      styles `.hero > *`, and **43 pages carry a bare `hero` class token** (the blog and compare
      heroes are `class="ca-hero ca-section-dark title hero"`).
      The one genuine finding: **no `.atmos` child element exists anywhere**, so every
      `atmos-host` is a host with nothing to host and `.atmos::after` never renders. That is
      consistent with the owner-ordered atmosphere removal (standing constraint 9). Vestigial,
      but the positioning side-effects are load-bearing, so leave it.
- [ ] 3 sitemap URLs take a 308→200 hop (`/tools/ppn-002-calculator`, `/sectors`, `/compare`,
      plus the methodology page). Unfixable via `_redirects` — CF's directory canonicalisation
      runs first. The repo's settled position is that these are INTENTIONAL.
- [ ] **`integrations.html` shares `Assets/og/resources.png`** because no `integrations.png`
      exists — the slug was never in the generator's page list. Not invented: adding an entry is
      trivial now that cards read their copy from the page, but it is a new asset rather than a
      fix, so it is a copy/design call. Deliberately left as a shared card, not a broken one.
- [ ] **`about.html` and `index.html` ship the identical meta description**, so `about.png` and
      `index.png` now differ only by headline. Both are faithful to their page — the duplication
      is in the pages, not the generator. Duplicate meta descriptions are a minor SEO defect and
      a copywriting fix, not a build one.
- [ ] `crowmark.html:466` unresolved `<!-- REVIEW: -->` on whether "AI answer marking" and
      "bid/no-bid FIT scoring" should appear publicly as not-yet-available. Needs real
      capability copy from product; AI bid marking must be framed as FIT/coverage, never
      win-probability. See `BETA-MODE.md` §6.3.

## Verified clean — do not re-audit without cause

- Image integrity: 341 references across 43 pages, **0 missing files, 0 `<img>` without `alt`**,
  all 62 `<picture>` blocks internally consistent.
- No placeholder copy anywhere: no lorem/TODO/TBC/example.com/`{{ }}`/NaN in visible strings.
- Carousel inventory (live-verified): 5 components — index showcase tabs (6s auto), crowmark
  hero (3 slides, 5.2s), crowmark `#interface` (3 slides, fixed), pricing tabs (click), blog
  topic filter. No other rotating component exists.
- 0 duplicate `<script src>`, 0 duplicate `<link rel=stylesheet>`, 0 paths with more than one
  distinct `?v=`, 0 broken internal links, 0 links landing on a 3xx.

## Method that works (reuse it)

Measure in a real browser, never from the markup. Read the actual computed value, then find
the rule that produced it by walking `document.styleSheets` and testing `el.matches(selector)`
— three of this session's findings were global `!important` rules that no amount of reading
page CSS would have revealed, and one was a selector I had assumed was mine.

**A generated image is not verified until you have looked at it.** The OG cards had a wrong price
and a "Blog" badge on the homepage for months. Nothing in the filenames, the config table, the
HTML, or the build output showed it. Reading five PNGs did. The same applies to anything the site
emits as a picture rather than as text — the honesty checks that catch bad copy do not run on it.

**Grep is evidence about a pattern, not about the page.** Three separate false findings this
session came from a grep whose shape did not match the markup's:
- Concluding 8 of 9 blog pages had no `og:image`, because the grep assumed `property` precedes
  `content` and the blog markup reverses them. All 9 were correct.
- Counting `<head` to check head structure. `<head` also matches `<header`, so it flagged all 44
  pages, then flagged `index.html` again for a `<head>` mentioned inside a comment.
- Reading `£99` in `compare/crowmark-vs-cleantender.html` as a stale CrowMark price. It is
  CleanTender's price, correctly attributed; CrowMark is stated as £49/£149 on the same page.

Two traps that produce false findings:
- **An MCP tab is `visibilityState:'hidden'`**, so CSS transitions freeze at `currentTime:0` and
  `getComputedStyle` reports opacity 0. Call `el.getAnimations().finish()` before believing any
  invisible-content result, and assert on `is-active` class movement rather than opacity.
- **Gradient text legitimately has `-webkit-text-fill-color: transparent`.** That is intentional
  `background-clip:text`, not a defect. Equally, `-webkit-text-fill-color` BEATS `color`, so a
  colour override needs both properties set.

Before "fixing" anything global, check the pre-minification source and the originating commit
for an owner decision. Constraint 9 above exists because a commit title said "mobile LCP fixes"
while the source comment said the owner asked for it deliberately.
