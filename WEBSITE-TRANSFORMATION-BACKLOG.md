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

## P0 — visitor-visible, still broken

- [ ] **`mark-reports.png` leaks internal DB table names** to visitors: `crowmark_contracts`,
      `bid_learnings`, `crowmark_extracted_requirements`, `crowmark_compliance_matrix`,
      `bid_answer_library`, `company_frameworks`, `crowmark_lots`, `profiles`. Either crop
      below the "Reads from:" lines or capture a different surface. Unverified raws on disk that
      may substitute: `home-desktop-dark`, `answer-library-desktop-dark`,
      `learnings-desktop-dark` — READ each before using.
- [ ] **Support-chat bubble baked into several captures.** The harness hides it now
      (`stripOverlaysAndErrors`), so re-capture rather than retouch.

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
- [ ] `signature-atmosphere-2026-05-26.css` is loaded by pages that contain **zero `.atmos__*`
      markup** (measured: 0 occurrences site-wide). Check whether the sheet is dead weight
      before deleting; some of it may style non-`atmos` classes.
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
