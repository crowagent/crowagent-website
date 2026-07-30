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

**Result: 0 WCAG 2.1 A/AA violations on all 13**, after fixing the only two that existed
(`058b5c22`): a `link-in-text-block` failure on roadmap and a site-wide `aria-prohibited-attr`
on the injected footer. Untested page families remain: the other 3 compare pages, 3 sector
pages, `tools/*`, `glossary/ppn-002`, `glossary/toms-framework`, `partners`, `resources`,
`integrations`, `changelog`, `404`, and the 5 `f8-legal` pages.

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
| `tablet/crowmark-tablet-dark-02`, `mobile/crowmark-mobile-LIGHT-01` | **UNUSED and UNREAD** — 0 references in any HTML, yet `Assets/` ships wholesale into `dist/`, so both are publicly fetchable. Either publish them (read them first) or delete them |
| `dark/mark-reports` | **DELETED** — 8 sets of internal table names, uncroppable |
| `dark/mark-opportunities` | **DELETED** — broken crop, cut mid-word, no chrome |
| `_raw/learnings-desktop-dark` | **REJECT** (read 2026-07-30) — 4 empty skeleton placeholders, most of page blank |
| `_raw/opportunities-desktop-dark` | **REJECT** — "Your session has expired" |
| `_raw/contracts-desktop-dark` | **REJECT** — "Create your first contract" while the sidebar says 18 |
| `_raw/home-desktop-dark` | **REJECT** — red "Compliance Health Score 41 Off track", features 2 archived products, exposes £237 |
| `_raw/answer-library-desktop-dark` | **REJECT** — "Couldn't load this section" |
| `_raw/reports-desktop-dark` | source of the deleted `mark-reports`; same leak |
| `_raw/analytics-tablet-dark`, `_raw/analytics-mobile-dark`, `_raw/contracts-tablet-dark`, `_raw/contracts-mobile-dark` | **UNREAD** — read before any use |

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
