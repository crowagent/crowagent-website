# Website transformation — execution backlog

**Owner contract (2026-07-30):** transform the site to genuine top-1% enterprise SaaS quality.
**COMMIT FREELY. DO NOT PUSH.** Nothing reaches production until the owner says the
transformation is complete. Pushing `main` on this repo *is* the Cloudflare Pages deploy.
Do not ask for push approval again — the instruction is settled.

Branch: `fix/carousel-and-premium-shots`. Landed so far: `95afa199`, `07c6b247`.

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
4. **Verify screenshots by READING the image, never by grepping the filename.** Two captures
   were rejected on that basis: a `/crowmark` capture showing "Create your first contract",
   and an opportunities capture reading "Your session has expired".
5. **Never self-award quality scores.** Report measured evidence: Lighthouse/axe numbers from
   real runs, pixel measurements, file:line. State plainly what is NOT fixed.
6. **Localhost 8092 must stay up** (`npx http-server . -p 8092 -c-1 --cors`); restart if dead.
7. **Delete the seeded staging data when the screenshot programme completes** — org
   `8e088ab9-c530-4390-a25f-acbd892a7eae` (18 contracts, 70% win rate, £2,385,950, 87%
   evidence). Teardown is precise: that org had 0 contracts before seeding.

## P0 — visitor-visible, still broken

- [ ] **Buyer and supplier share one page.** Owner calls this unacceptable. Needs distinct IA:
      separate entry points, separate value propositions, separate proof. Buyer-side must keep
      the engineering-standards boundary — CrowMark Buyer is intelligence/advisory, NOT a
      system of record replacing Jaggaer/Atamis/In-tend.
- [ ] **`mark-reports.png` leaks internal DB table names** to visitors: `crowmark_contracts`,
      `bid_learnings`, `crowmark_extracted_requirements`, `crowmark_compliance_matrix`,
      `bid_answer_library`, `company_frameworks`, `crowmark_lots`, `profiles`. Either crop
      below the "Reads from:" lines or capture a different surface. Unverified raws already on
      disk that may substitute: `home-desktop-dark`, `answer-library-desktop-dark`,
      `learnings-desktop-dark` — READ each before using.
- [ ] **Support-chat bubble baked into several captures.** The harness hides it now
      (`stripOverlaysAndErrors`), so re-capture rather than retouch.

## P1 — thin product proof

- [ ] **40 of 43 pages carry no product screenshot.** Highest-intent gaps: the four
      `compare/crowmark-vs-*.html` pages and `compare/index.html`, plus the four
      `sectors/*.html` pages and `sectors/index.html`. These are where a buyer decides.
- [ ] Only 3 desktop + 1 tablet + 1 mobile shot exist. Capture more surfaces via
      `crowagent-platform/web/scripts/marketing-shots.mjs` (batches 1–3; add more).
- [ ] `/crowmark` renders "Create your first contract" with 0 active contracts **while the
      sidebar badge in the same render says 18** — a genuine product defect, not a capture
      problem. Blocks any contracts-list screenshot. Trace why that page's query differs from
      Analytics'. Needs verification against prod before being called a prod bug.

## P2 — code quality / dead weight (measured, from the full-site audit)

- [ ] ~20 unreferenced JS modules, e.g. `js/modules/carousel.js` (19.6KB),
      `platform-carousel.js`, `demo-autoplayer.js`, `pricing-tabs-indicator.js` (6.5KB, and no
      `.ptab-indicator` CSS exists so it could not render), `js/blog-filter.js` (stale
      selectors; the real filter is inline at `blog/index.html:243`).
- [ ] `nav-inject.js` loaded **twice** on 14 pages (8 blog, 5 compare, partners.html).
- [ ] Two unresolved `<!-- REVIEW: -->` claim flags shipped to production:
      `crowmark.html:465` and `pricing.html:914` (the latter on a G-Cloud 14 claim).
- [ ] `.ca-rotator` / `.ca-carousel` / `.crow-carousel` / `.pc-screen` / `.demo-screen` /
      `.home-demo-cycle` all have CSS but no markup and no driver.

## Verified clean — do not re-audit without cause

- Image integrity: 341 references across 43 pages, **0 missing files, 0 `<img>` without `alt`**,
  all 62 `<picture>` blocks internally consistent.
- No placeholder copy anywhere: no lorem/TODO/TBC/example.com/`{{ }}`/NaN in visible strings.
- The "458KB carousel payload removed from 29 pages" claim was correct — those 29 pages carry
  only the comment, no `.pcar*` markup. There is no remaining orphaned-markup page.
- Carousel inventory (live-verified): 5 components total — index showcase tabs (6s auto),
  crowmark hero (3 slides, 5.2s), crowmark `#interface` (3 slides, fixed), pricing tabs
  (click), blog topic filter. No other rotating component exists.

## Method that works (reuse it)

Capture → **read the image** → reject or normalise to 16:10 → publish 3 formats → stamp `?v=` →
correct declared width/height from the PNG header → verify in a real browser by measuring
(`visibleSlides`, active-slide height vs viewport height, HEAD status of every asset) rather
than by reading the markup. An MCP tab is `visibilityState:'hidden'`, so CSS transitions freeze
and `getComputedStyle` reports opacity 0 — assert on `is-active` class movement, never opacity.
