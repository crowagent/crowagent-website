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
- **P1 the drafting walkthrough was in the wrong place, and its frame was half empty.**
  `35b1f910`. Two separate defects in the section built earlier today.
  **Placement.** `#journey` claims three stages and names stage two "Win / Draft it in your
  words, not a model's". The demonstration of exactly that stage was sitting FOUR sections
  later, behind `#products`, `#statute` and `#integrations`, so the claim and its proof were
  separated by plumbing. It was also physically inside another section's furniture, between the
  SHOWCASE banner comment and the showcase `<style>` block on one side and the showcase section
  on the other, so the "SHOWCASE" banner appeared to label it. Order is now
  journey -> drafting -> products -> statute -> integrations -> showcase -> devices -> trust -> cta.
  **Empty stage.** Reading the section as an image showed a large void that NO METRIC had
  reported. Measured with the demo paused, empty space below the content was **117px** on step 1,
  then 56px, 62px, 30px. Fixed as layout, never content: nothing invented to pad the box.
  `.dd-body` is the flex container, the active panel fills it, its cards share the slack and
  centre their content. All four now close to **0px**, slack symmetric (17px above and below on
  step 2, 1px elsewhere). Kept a FIXED stage on purpose: sizing per panel would trade 117px of
  slack for 117px of layout shift every 7 seconds.
  Verified: axe **0 violations** on the section; reduced motion still 4/4 panels with transport
  hidden; 390px no horizontal overflow; build gate clean.
- **P0 "Accept all" did nothing on 23 of 43 pages.** Found while chasing a numeral that looked
  clipped: the clipping was the cookie banner sitting on top of it, and the banner was there because
  the accept click was not dismissing it. Measured on the homepage with a real Playwright click AND a
  synthetic one: banner still `display:block` at 61px, `body.has-cookie-banner` still set,
  `localStorage.ca_cookie_consent_v2` still **null**, no console error.
  **Cause:** `cookie-banner.js` builds the banner and exposes `window.crowagentConsent` but never
  bound the buttons it created. The binding lives in `scripts.js`, whose artifact `scripts.min.js` is
  loaded by only **22 of 43 pages**. The coverage report was the clue (`getElementById
  ('ca-cookie-accept')` marked *not covered*). Affected pages included `/index`, `/crowmark`,
  `/pricing`, `/privacy`, `/terms`, all 4 sectors, `/tools` — and **`/cookies` and
  `/cookie-preferences`**, whose whole purpose is managing consent.
  **Second-order:** `analytics-init.js` gates PostHog on that same key, so analytics could never boot
  on those 23 pages regardless of what the visitor clicked.
  Fixed by wiring the controls in `cookie-banner.js`, which nav-inject injects everywhere. Verified 6
  of 6 pages accept, dismiss, store and persist across reload. `7fd9d879`, `03a8fc10`.
- **P1 the homepage now shows HOW BID WRITING WORKS.** Owner-reported three times: every product
  image was the analytics dashboard. New `#drafting` autoplay walkthrough, four steps, placed before
  `#showcase`. Every claim read from `crowmark/response/draft/route.ts`: grounded only in your own
  answer library, the AI authors prose only, a **figure-grounding gate** checks every £/%, the gate
  verdict **blocks human approval** until it passes, re-drafts up to 3 attempts, fails closed.
  Labelled **ILLUSTRATION** because the drafting surfaces cannot be captured (BFF token). Real
  captures should REPLACE these frames. `5b1b960b`.
- **P1 "Sample data" and "Live" chips sat INSIDE the simulated browser chrome.** Owner-reported. They
  read as the product displaying a disclaimer, and "Live" implied a still image was live. Moved the
  disclosure into the caption in our own voice. `b132e07a`.
- **P1 "The real interface, worked through" showed one screen twice.** A 2-tab carousel whose second
  tab duplicated the phone shot already used in `#devices`, with a false "Advancing every 6 seconds"
  status. Retitled, duplicate removed, tablist/transport removed, dangling `aria-labelledby` cleaned,
  dead `nebula-showcase.js` dropped. `691818b3`.
- **P1 two content hubs had ZERO in-content call to action.** Audited primary CTAs on all 43 pages at
  desktop and mobile, after nav injection and with the consent banner dismissed. Four pages had none;
  `cookies.html` and `cookie-preferences.html` correctly so. The other two were real gaps:
  **`security.html`** — a vendor-due-diligence page whose only next steps were the nav button and a
  security-disclosure mailto — and **`glossary/index.html`**, a search-entry hub of 23 term cards with
  only two cross-links out. Security now closes with "Finished your review?"; glossary leads with the
  **free calculator** rather than "request access", because someone who arrived for a definition has
  not asked to buy anything. axe 0 violations on both. `77cd7953`.
- **OPEN (copy decision, not a defect) — CTA label fragmentation.** The site uses **4 variants** of the
  same action: "Book a demo" (x9), "Book a 30-minute demo", "Book a 30-minute call", "Book demo →";
  and **3** for contact: "Contact sales" (x3), "Contact the team", "Get in touch →". Also "Request
  access" (x23) vs "Request access →". Normalising is an editorial call, so it is recorded rather than
  done unilaterally.
- **P1 the immutable-cache trap generalised beyond the OG cards.** `/Assets/*` is `max-age=31536000,
  immutable`, so **any** unversioned reference there is un-updatable for a year. Audited the DEPLOYED
  tree (not the repo — see the trap below): 47 unversioned references. Stamped the 5 where content
  demonstrably changes under a stable filename: the **brand wordmark** (15 pages, and the brand pack
  already changed once on 2026-07-19), `Assets/og-image.png` (11 pages, same class as the cards),
  both PWA icons from `manifest.json`, and `Assets/css/rss.xsl`. 36 stamps across 24 files, one
  distinct stamp each. `34b10786`.
- **RESOLVED `48d28a56` — the unversioned-asset exposure is now a BUILD GATE, not a note.** The
  previous entry asked whoever re-crops a blog photo to remember to bump `?v=`. A note nobody reads
  is not a control. The build now hashes every unversioned `/Assets/*` asset that something
  references, compares against `scripts/asset-version-lock.json`, and **FAILS when the bytes move
  while the URL does not** — 44 assets tracked (24 blog photos, 13 brand marks, 5 fonts, 2 CSS).
  A lock rather than a "version everything" rule, because fonts and the width-suffixed thumbnails
  carry their version in the filename. Two escapes, in preference order: bump the reference's `?v=`
  (what actually reaches users), or `node scripts/build-dist.js --accept-asset-changes`.
  **Proved by breaking it:** re-encoding a tracked photo (111,900 → 70,460 B, same filename) exits 1
  naming the file; restoring the original fails again, so drift is caught in both directions; after
  re-accepting, the lock hash matches the file on disk and `git diff` is empty.
- **P0 the corrected OG cards could not have reached anyone who had seen the wrong ones.**
  `/Assets/*` is served `Cache-Control: public, max-age=31536000, immutable` — right for versioned
  assets — but **24 of 25 OG cards carried no `?v=` at all**, and the one that did still said
  `?v=20260719` after being regenerated today. 21 cards were regenerated earlier today, including the
  pricing card that advertised a **£99 tier that does not exist** and 12 pages badged "Blog". Social
  platforms cache OG images by URL and re-fetch on change, so with an unchanged URL the corrections
  would never propagate — the earlier fix was real but inert. Stamped all **82 references across 36
  pages** (`og:image`, `twitter:image`, JSON-LD `image`) with one stamp; verified 0 unstamped. The
  header is correct and untouched — the defect was the missing version. `196a0a41`.
- **P2 CSP still permitted Google Fonts origins after fonts were self-hosted.** `style-src` allowed
  `fonts.googleapis.com` and `font-src` allowed `fonts.gstatic.com`. Self-hosting on 2026-07-29 was
  done specifically to stop handing Google the visitor's IP; leaving the origins permitted meant an
  accidental reference would silently work and undo it. Verified unused **three ways** before
  removing (a CSP mistake fails closed): only comment mentions remain in `fonts-selfhosted.css`,
  `stripe-sample/` does not ship, and a live run over 6 pages made **0 requests** to either origin.
  Calendly, Turnstile and PostHog were checked in the same pass and **KEPT** — all three are still
  referenced by served pages. `196a0a41`.
- **P1 duplicate meta description, a 93-char title, and 6 titles truncating mid-word.** Audited all
  43 pages, attribute-order agnostic. `about.html` shared its meta description **and** og:description
  **and** twitter:description verbatim with `index.html` — two pages competing for one snippet; it now
  describes itself from claims verified on the page. `crowmark-buyers.html` (a page I wrote) had a
  **93-char title** and a **234-char description**: now 53 and 125, keeping the AI-scoring boundary.
  Then measured what a ~60-char SERP cut actually costs rather than flagging length alone: of 8 titles
  over 70 chars, **6 lost meaningful words** ("iness?", "livery", "know", "ids", "n") and 2 lost only
  the brand suffix and were left alone. Fixed by dropping the redundant `| CrowAgent` from those 6,
  which keeps every keyword since Google appends the site name itself. **Cost, stated:** those 6 no
  longer match the site title convention, and 2 still land at 66 chars — going under 60 would mean
  cutting keywords like "UK" and "grounded answers", which matter more than a display limit that only
  clips the tail. After: 0 duplicate titles/descriptions/og:descriptions, 0 missing, 0 descriptions
  over 165. `ee9d07d1`.
- **P1 blog card thumbnails downloaded 1600 px images into 293 px slots.** `blog/index.html`
  transferred **1,012 KB** against a ~630 KB mean for every other page, 538 KB of it images: each
  card used the full article hero with a single-URL `<source srcset>`, no width descriptors and no
  `sizes`. Over-sized 5.46× at DPR1, 2.73× at DPR2. Generated WebP derivatives at 400/600/800/1200 w
  from **measured** card widths at six viewports (390→1920), with per-card-type `sizes`.
  **Result: images 538 KB → 51 KB (−90%), total 1,012 → 528 KB (−48%) at DPR1**; 631 KB at DPR2;
  570 KB on mobile DPR2. Verified the browser picks 400w/600w/800w as intended and READ the rendered
  thumbnail at DPR2 (crisp, no artefacts). `61c213a9`.
- **P2 removed the CSS for the nine features deleted this session.** Targeted, not blanket: each
  class family belongs to a module removed this session and was confirmed at **0 live elements across
  all 43 pages** (after injection) before anything was touched. `nav-global-fix` −302 B (1 rule
  removed, 7 trimmed), `no-js-content-fallback` −177 B, `resources-page` −251 B, `print.css` −42 B.
  **Total −772 B, not the 3.3 KB I first measured** — that figure counted whole rules, but most are
  selector LISTS where the dead selector sits beside live ones, so trimming removes selector text and
  not declarations. Two shared-rule trims were verified rather than reasoned about: `.ca-card` still
  computes a styled surface after `.article-card` left 7 lists; and the no-JS reveal failsafe was
  tested **with JavaScript disabled** — 28 reveal elements across 3 pages, 0 hidden, full body text.
  `print.css` was nearly missed twice: it lives at the repo ROOT, and my grep appeared to show no
  HTML reference only because `head -4` was consumed by dev-tools hits. `4969a72d`.
- **P1 three directly-loaded modules had no live work; two that looked dead did not.** Completed the
  sweep by auditing scripts loaded via an explicit `<script src>` rather than injected. Removed:
  `motion-system.js` (17 pages, 7,713 B — 6 selectors match 0 on all 17, `window.caMotion`
  referenced by 0 files), `ca-form-validation.js` (2 pages, 6,815 B — a library exposing
  `window.CAFormValidation` that **nothing calls anywhere**; `roadmap.html` loads it with **0 forms**;
  partners' form is handled by `partners-form.js`), `nebula-livepanels.js` (index, 9,036 B — 8
  selectors match 0; the only `[data-nbl]` mentions are in comments).
  **KEPT after investigation, both zero-match by selector count:** `reveal-failsafe.js` builds its
  selectors from CONSTANTS (`FORCE_SEL` = `.stripe-reveal, .sf17-reveal, [class*="reveal"], main
  section, ...`) so a literal scan extracts none — it is the net that forces revealed content
  visible, and deleting it could blank content when GSAP is slow; `tool-teaser.js` exposes
  `CAToolTeaser`/`CrowAgentTeaser`, called by 3 other files. **2 of 5 candidates were measurement
  artifacts.** Also stripped `nebula-livepanels.css`, still loaded on the HOMEPAGE after its JS went:
  1 of 33 rules matched live markup (`.nb-shot`), 7,335 B → 4,125 B, verified by comparing 14
  computed properties plus bounding rect on both instances (0 differences) and then reading the
  rendered element. `b91deb9b`.
- **P1 six runtime-injected modules had ZERO targets on all 43 pages.** Generalised from
  `nav-shrink`: measured every module `nav-inject.js` appends, counting each module's own
  selectors **after** nav/footer injection so injected markup counted. Dead:
  `sticky-storytelling` (`.story-shell`/`.story-step`/`.story-visual` = 0), `logo-shimmer`
  (`.ca-logo` = 0), `section-parallax` (`.parallax-orb`/`[data-parallax-speed]`/
  `.section-parallax-bg` = 0), `demo-autoplayer` (`.demo-screen`/`.ds-typed`/`.demo-pdot` = 0),
  `blog-reading-time` (`.article-card`/`.card-meta`/`.card-preview` = 0), plus `nav-shrink`.
  **13,255 bytes** fetched, parsed and executed for nothing — three requests on every page, two
  more on home/product/blog. Confirmed **dead, not broken** (opposite treatments): for each, both
  halves are gone — no HTML declares the markup and no loaded sheet styles the effect classes; none
  exports on `window`. `logo-shimmer` had drifted off its own target, since the injected nav logo is
  `.logo.logo-lockup`, not `.ca-logo`. KEPT and verified live: `hero-parallax` (14 `.hero`),
  `d-batch-runtime` (`.ham` on 43), `e-batch-runtime` (138 `h2[id]` on 26),
  `pricing-tabs-indicator`. `96e7e5f9`.
- **P1 `nav-shrink.js` ran on all 43 pages toggling a class nothing styles.** Found by correcting
  my own error: the previous commit justified pruning `nav-footer-sf21.css` partly on "nav-shrink.js
  is loaded by 0 pages", which came from grepping HTML only — **nav-shrink.js is injected at runtime
  by `nav-inject.js` on every page.** Chasing that correction found the real defect: its entire
  effect is `body.classList.toggle('is-scrolled')`, and nothing in production styles that class, so
  it added a passive scroll listener, a rAF loop and a request to all 43 pages for nothing. Both
  intended style sources are absent from the deployed site — its own header points at `styles.css`
  (in `ROOT_DENY`, never shipped) and the scroll-timeline block lives in `nav-footer-sf21.css`
  (loaded by 0 pages **before** it was withheld, so this was already dead). Verified by forcing the
  class on 5 pages: 0 matching rules in loaded CSS and no change to height, padding,
  backdrop-filter, background, box-shadow, border, transform or opacity. Removed from the injection
  list; module withheld. Post-change sweep of all 43 pages: 0 console errors, 0 failed requests, nav
  and footer inject, `window.safeViewTransition` (first module in the same array) still present, so
  injection order did not regress. `4c64e04f`.
- **OWNER DECISION — should the nav shrink on scroll?** The behaviour has been inert in production
  for an unknown period, not disabled by anything done in this session. Restoring it means loading
  `nav-footer-sf21.css` **and** re-adding the `nav-shrink.js` injection line; re-adding the line
  alone does nothing. Left off because turning a dormant visual behaviour back on is a design call.
- **P1 81 KB of dead CSS shipped, including the Tailwind SOURCE for the sheet pages load.** Seven
  stylesheets referenced by no page and no injector: `sovereign-primitives.css` (28.1 KB),
  **`sovereign-core-v2.css` (11.8 KB — the build INPUT for `sovereign-core-v2.compiled.css`, which
  is what pages actually load)**, `nav-footer-sf21.css`, `pricing-sf16.css`,
  `crowagent-brand-tokens.min.css` (a minified twin of a sheet 43 pages DO load),
  `page-archetype-unify.css`, `page-fixes-sf22.css`. Publishing a build input is the same
  dev-surface leak the build script exists to prevent, just inside an allowlisted directory.
  Handled by reachability for the six in `Assets/css`, by `ASSET_DENY_FILES` for the root-level
  twin. Two references in shipping code turned out to be **comments** — `nav-inject.js` names
  `sovereign-primitives.css` while explaining pages do NOT load it, and `nav-shrink.js` names
  `nav-footer-sf21.css` while being loaded by 0 pages itself. Result: 20 stylesheets ship, 0
  orphaned. `c4253068`.
- **P0 the CSS prune broke the changelog feed, and that is the SECOND time this happened.** The
  first version deleted `Assets/css/rss.xsl`. `changelog.xml` carries
  `<?xml-stylesheet type="text/xsl" href="/Assets/css/rss.xsl"?>`, which is what makes the feed
  render as a readable page instead of raw markup — and the scan read **no XML at all**. I did ask
  the per-directory question, but asked it about `@import` rather than about every way a stylesheet
  can be referenced. Fixed at the scan, not by exempting the file: it now reads `href` in `.xml`
  and `.xsl` (4 feeds). Proved by deleting the file — build exits 1 with
  "(href in changelog.xml)". `c4253068`.
- **P1 a gradient-TEXT rule was painting the eyebrow DOT, so 5 of 17 rendered invisible.**
  `ultra-premium-responsive.css` had `:root[data-theme=dark] [class*="eyebrow"]` applying
  `background-clip:text` + transparent fill. That is a gradient-text effect, but the substring
  match also caught `.ca-eyebrow-dot` — a 6px graphic with no glyphs — so clipping a gradient to
  its text painted nothing. Measured: 5 of 17 dots computed `rgba(0,0,0,0)` on pricing, about,
  integrations, resources and roadmap. The other 12 escaped only because their pages carry a later
  rule re-setting a solid background, which is why it presented as a per-page quirk rather than one
  selector. Fixed with `:not(.ca-eyebrow-dot)`. Verified three ways: contrast of every dot against
  the composited background behind it (17/17 perceivable, 0 below 3:1, was 5); the label gradient
  SURVIVES (`background-clip:text` still on `.ca-eyebrow`); and the rendered badge READ as an image
  at 2x. Cache-buster bumped across all 43 pages. `35395c4a`.
- **P1 hero subheads ran to four and five centred lines under the H1.** Measured by RENDERED LINE
  COUNT at 1280px, not character count — character count ranks wrong because font size and
  container width differ per archetype. Before: {1 line: 4, 2: 16, 3: 17, 4: 3, 5: 2}. After:
  {1: 5, 2: 22, 3: 14, 5: 1}, and the one remaining 5-line element is left-aligned prose, correctly
  opted out. `about.html`'s subhead **restated its own H1** ("Built by engineers who read the
  rules" above "We read the UK procurement rules"). Every cut was checked against the rest of the
  page first: post-award tracking, PPN 017, the approval step, the 10% annual discount and the
  14-day trial are all still stated below their leads. `60c57422`.
- **P0 two FABRICATED UI mockups were publicly fetchable, naming real public bodies against
  invented contracts and invented scores.** `Assets/screenshots` — 6 files, 260 KB, referenced by
  nothing. Neither is a screenshot; both are hand-built mockups inside fake browser chrome stamped
  `app.crowagent.ai`. **READ, not inferred from the filename.**
  `crowmark.png` shows a sidebar with "EPC & MEES Check" and "Monitoring" (not in CrowMark) and
  attributes invented contracts and scores to **NHS Greater Manchester (82/100), Department for
  Education (91/100), Birmingham City Council (67/100)**, plus "12 narratives generated" and a
  "94% average score" — which also presents AI output as a *score*, when the product frames bid
  marking as rubric coverage. `analytics.png` is a "Compliance Analytics" screen for the Core/MEES
  product switched off 2026-07-17: EPC Band Distribution, "Retrofit ROI Projection", CSRD Checker
  nav, £14.2M portfolio, 42% compliance rate, and a fabricated named user "James Thompson".
  Denied wholesale; **must never be published**. `9dbf8294`.
- **P1 the reference check read no CSS at all — and the fix passed every test while doing nothing.**
  Follow-on from the `srcset` gap. Fonts are the exposure: every self-hosted face is reached ONLY
  from CSS, so a 404 on `Inter-var.woff2` would have been invisible to the gate and obvious to
  every visitor. Now scans all 27 shipped stylesheets plus `<style>` and inline `style=""`.
  **The part worth remembering:** the first version of the check carried a literal **0x01 control
  byte** where its backslash-1 backreference belonged, put there by a shell heredoc mangling the escape —
  `/url\(\s*(['"]?)([^'")]+)^A\s*\)/gi`. It required a character that never occurs in CSS, matched
  0 of 5 font URLs, and the build printed *"no referenced asset missing"*, which is exactly what it
  prints when all is well. The same pattern **retyped by hand in a scratch script matched all 5**,
  so the standalone test kept confirming logic the build was not running. Found by tracing what the
  build actually saw, after first chasing a wrong theory (regex `lastIndex` across `matchAll`).
  Rewritten with no backreference so no escape layer can corrupt it. Proved by deleting a CSS-only
  font: exits 1 naming both `fonts-selfhosted.css` and `premium-v2.css`. `f65672f3`.
- **P0 THE REFERENCE CHECK WAS BLIND TO `srcset` — the build could never have caught a missing
  WebP.** `ASSET_RE` matched only `src` and `href`, and every `<picture>` on the site keeps its
  WebP in `<source srcset>`. 349 image references exist across the 44 pages and a large share are
  in `srcset`. Two consequences, both measured: a missing `.webp` would never have failed the
  build; and the reachability prune, which trusts the same evidence, deleted 6 live WebP files and
  **broke 45 references across the 9 blog pages on its first run**. Caught by checking every image
  reference in `dist/`, NOT by trusting "no referenced asset missing", which reported clean the
  whole time. Fixed at the scan so the missing-asset check gets stronger too; proved by removing a
  srcset-only source file, which now exits 1 naming all 9 referencing pages. `9dbf8294`.
- **P0 the trademark remediation removed the sections but the logo FILES kept shipping.**
  TM-REMEDIATION-001 deleted the ACCOUNTING and CREDIT DATA sections of `integrations.html` on
  2026-07-28, and the comment left in that page says why: the opposing mark belongs to an
  accounting network, and a page footer-linked from every other page *"carrying an 'Accounting'
  section header and the logos of two credit reference agencies was the clearest evidence on the
  site of operating in that field"*. The sections went; the files did not.
  `/Assets/brand/integrations/color-experian.svg`, `color-creditsafe.svg`, `color-xero.svg`,
  `color-sage.svg` and `color-quickbooks.svg` all still resolved. **19 of 32 files in that
  directory were unreferenced** (40.1 KB), also including Anthropic, Claude, Cloudflare, Sentry,
  Supabase, Vercel, Stripe, Gemini and Azure marks. Fixed **by reachability, not by listing
  filenames** — `REFERENCED_ONLY_DIRS` prunes anything no built HTML or injector references and
  prints every dropped path, so this cannot re-accumulate. `cad35bcd`.
- **P1 five different favicon schemes across 43 pages, and a mask-icon colour CSS could never
  resolve.** 17 pages on the root scheme; 10 on the root scheme **and** the `/Assets/brand/*`
  scheme simultaneously (so `favicon-32` and `apple-touch-icon` were each declared twice under
  two URLs that md5 to identical bytes — `security.html` carried **eight** icon links); **9 pages
  had `/favicon.svg` and nothing else** — no PNG fallback, no apple-touch icon, no manifest; 5 had
  no `/favicon.svg` at all; 2 a third mixture. Plus `<link rel="mask-icon" color="var(--teal)">`
  — the `color` attribute takes a colour value, not CSS, so Safari could never resolve it and the
  pinned-tab colour was broken on all 10 pages that set it. All 43 pages now carry one identical
  6-link block, a **superset** of every scheme found, so no page lost a capability. Verified
  stylesheet/script/meta/head/body counts unchanged on all 43 — the edit touched icon and manifest
  links only. Same pass: **all 15 JSON-LD `publisher.logo` declarations** across 13 pages pointed
  at the wrong asset (12 at the 1200x630 **social card**, 1 at a **32x32 favicon**); all now use
  the 560x140 wordmark the site's own `Organization` schema has always declared. Article `image`
  untouched. `/favicon.ico` returned 404 and answered an image request with the branded 404 HTML;
  now a 301 to `/favicon-32.png`. `9f25f5f0`.
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

## Page weight, re-measured against `dist/` 2026-07-30 (after this session's removals)

| page | reqs | total | css | js | fonts | images |
|---|---|---|---|---|---|---|
| index | 41 | 616 KB | 251 | 91 | 101 | 95 |
| crowmark | 33 | 696 KB | 253 | 204 | 101 | 82 |
| pricing | 32 | 632 KB | 251 | 208 | 101 | 0 |
| crowmark-buyers | 31 | 610 KB | 251 | 204 | 101 | 0 |
| blog/index | 31 | **528 KB** (was 1,012) | 266 | 85 | 101 | **51** (was 538) |
| resources | 30 | 574 KB | 250 | 235 | 71 | 0 |
| roadmap | 36 | 633 KB | 260 | 240 | 101 | 0 |
| security | 34 | 629 KB | 257 | 239 | 83 | 0 |

**Render-blocking CSS is 250–266 KB across 11–13 sheets on EVERY page** — still the dominant cost,
and still the owner decision recorded below. Nothing in this session changed that; the three
alternatives remain measured and rejected. Fonts are a flat ~101 KB almost everywhere, which is the
next-largest uniform block and has not yet been examined per-page (does every page need the mono
face?).

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
- **4 `Assets/brand/*` icon files now referenced by 0 pages** after the favicon standardisation
  (`favicon-16.png`, `favicon-32.png`, `apple-touch-icon-180.png`, `pwa-192.png`). Two are
  md5-identical to root files that ARE referenced. Left in place, consistent with the standing
  decision not to touch the brand pack over a few KB — but they are no longer load-bearing, so
  they are the cheapest remaining cleanup if the owner wants the directory tidied.
- ~~7 orphaned CSS files (81 KB)~~ **RESOLVED `c4253068`** — all seven now withheld; 0 orphaned stylesheets remain in `dist/`.

### Worth adding later: make the check bidirectional

The one-way reference check is the root cause of this accumulating unnoticed. A warning (not a
failure) listing unreferenced shipped assets would have surfaced 15.3 MB years earlier. Left as a
suggestion rather than implemented, because a warning that fires on 81 legitimate-ish files every
build gets ignored; it needs an allowlist first.

**Now partly automated (`cad35bcd`).** `REFERENCED_ONLY_DIRS` in `scripts/build-dist.js` is the
bidirectional check, scoped to the directory where being wrong was most expensive: a file in
`Assets/brand/integrations` ships only if some built HTML or injector references it. It is safe by
construction — the keep set is the same evidence the missing-asset check already gathers, so a
referenced file can never be pruned — and it reports every path it drops rather than silently
tidying. Extending it to other directories is a one-line change per directory, but each needs
the same "is the HTML/injector scan the complete picture here?" check first — **and that question
has already been answered "no" once.** I checked `Assets/blog-photos` for CSS `url()` and not for
`srcset`, added it, and the prune deleted 6 live WebP files. The scan now reads `srcset` AND CSS `url()`
(including `<style>` and inline styles), so the previously-documented CSS blind spot is closed and
a directory reached from CSS backgrounds is now safe to add. Remaining known gaps: paths built at
runtime in JS by string concatenation, and anything referenced only from a non-scanned file type. `Assets/blog-photos` and `Assets/brand/integrations` are in; `Assets/og`
is deliberately out, because it holds the 5 retired cards that are an explicit owner decision.

**Every finding before that came from running the audit by hand**, which is the argument for
automating the rest: the `_raw` schema leak, 2 rejected device shots, 3 copies of `og-image.png`, and 7
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
- **3 rendered lines is NOT automatically a defect.** Measuring container width and font size
  showed the 14 remaining 3-line leads sit at 45-60 characters per line, inside the readable range.
  Forcing them to 2 would mean cutting real pricing, security and comparison content to hit a
  number. The genuine defects were the 4- and 5-line cases, now fixed. Left alone deliberately.
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

- **Every button on the site does something (2026-07-30).** The generalisation of the consent
  P0, which survived because nothing tested it. Clicked **78 buttons across all 43 pages**, each
  on a FRESH page so one click cannot mask the next, and reported a button dead only if the DOM,
  the URL, focus, storage and the network ALL failed to move. **0 dead.** The consent banner was
  the only instance of that class.
  **Coverage limit, stated rather than hidden:** `type=submit` and anything inside a `<form>` were
  skipped deliberately, so form submit paths are NOT covered by this number, and external requests
  were blocked at the route level so no live endpoint was contacted.
- **Mobile menu and nav dropdowns work on all 43 pages (2026-07-30).** They are wired by
  `d-batch-runtime.js`, which nav-inject injects everywhere, NOT by `scripts.min.js`. Verified
  functionally at 390px on a bundled and an unbundled page: menu opens, `display:flex`, 12 visible
  links on both. Do not "fix" this because a selector also appears in `scripts.min.js`.
- **CTA coverage (2026-07-30).** 41 of 43 pages have an in-content CTA; the 2 without are
  `cookies.html` and `cookie-preferences.html`, correctly. **"No CTA above the fold" is NOT a defect
  on 28 pages** — blog articles and comparison pages legitimately put the CTA after the content, and
  every page carries the nav's "Request access" above the fold regardless. Do not "fix" that number.
- **Canonical + sitemap: clean (2026-07-30).** 43 pages, 42 sitemap entries, 0 duplicate entries, 0
  canonical/URL mismatches, 0 sitemap URLs without a page file, 0 indexable pages missing from the
  sitemap. The only page with no canonical is `404.html`, correctly `noindex,nofollow` and correctly
  absent from the sitemap. The 3 sitemap 308 hops remain INTENTIONAL.
- **Structured data: clean (2026-07-30).** 61 JSON-LD blocks across 24 types — 0 parse errors, 0
  missing required properties, 0 missing recommended Article properties. Declared prices (£49
  Starter, £149 Pro, £0 free tool) agree with the pricing page.
- **Fonts: NO waste (measured 2026-07-30, all 43 pages).** Every face fetched is a face that paints a
  glyph on that page; zero unused `<link rel=preload as=font>`. The "flat ~101 KB" figure recorded
  earlier was an AVERAGE hiding real variation — pages without monospace fetch 71 KB (Inter + Plus
  Jakarta 700/800), pages with it fetch 102 KB, and `PlusJakartaSans-600` is fetched only by
  `security.html`. The browser is already lazy and correct here. Do not "optimise" this.

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

**`_redirects` cannot be verified on `http-server`** — it does not read the file. The
`/favicon.ico` -> `/favicon-32.png` rule added 2026-07-30 is therefore UNVERIFIED until a live
check after deploy. Everything else in this session was verified locally or in `dist/`.

**Audit `dist/`, not the repo, when the question is "what does production do".** Scanning the repo
counted `tests/` and `scripts/` — neither deploys — and invented an unversioned CSS reference that
does not exist in production. `dist/` is exactly what ships, so it cannot be skewed by tooling.

**`lstrip("./")` strips CHARACTERS, not a prefix.** It turned `./.claude/settings.json` into
`claude/settings.json` and crashed a scan. Use `os.path.relpath`, or slice the prefix.

**A content fix does not ship until its URL changes.** Correcting an asset that is served
`immutable` with a one-year TTL and referenced without a version changes nothing for anyone who
already fetched it — and for OG cards, "anyone" includes every social platform that has scraped the
page. When fixing a cached asset, fix the reference too.

**Check a "stale" third-party origin before removing it from CSP.** Google Fonts really was unused,
but Calendly, Turnstile and PostHog looked equally legacy in the same header and are all live.
Removing them on appearance would have broken booking, forms and analytics — and CSP fails closed,
so the breakage would be total rather than degraded.

**Measure the CONSEQUENCE, not the metric.** Eight titles exceeded a 70-char guideline, which looks
like eight defects. Checking what a ~60-char cut actually removed showed 2 of them lose only the
brand suffix — no defect at all — and told me exactly which fix preserved the most value. A
threshold tells you where to look; it does not tell you whether anything is wrong.

**Kill your own dist server before `npm run build`, and re-check the numbers.** A build that
EPERMs leaves the previous `dist/` in place, so a measurement taken straight afterwards silently
reports the OLD figures. That happened here: blog/index still read 1,012 KB after the fix because
the build had failed and I was measuring a stale tree.

**Measure the slot before optimising the image.** Three candidates that looked like waste were
correct as they stood: the 8 blog POST pages render their cards at ~1150 px, so 1600 px is right
there; `mark-analytics.avif` at 3200 px is a standing 16:10 carousel constraint; and SVGs flagged as
"over-sized" do not cost bytes by dimension at all.

**A ZERO FROM A DETECTOR YOU HAVE NOT TRIED TO FOOL IS NOT EVIDENCE.** The dead-button audit
returned "0 dead" on its first run and the detector was broken: clicking a `<button>` focuses it,
so "did activeElement change" was true on every click and nothing COULD ever be reported dead.
Caught by injecting two buttons, one with no handler and one that mutates the DOM, and requiring
the detector to call them DEAD and LIVE respectively. It failed that check, was fixed to ignore
focus landing on the click target itself, then passed both. Do this before believing any zero.

**A METRIC CAN BE SATISFIED WITHOUT THE PROBLEM BEING FIXED.** Growing the drafting cards scored
0px on "space below the last child" while merely enclosing the void inside the card borders, text
still pinned to the top. The number said solved; the image said stretched. Reading the image is
what caught it, both times.

**DO NOT SCREENSHOT AN AUTOPLAYING COMPONENT AND LABEL IT FROM A SEPARATE READ.** A capture showed
the rail on step 3 and the panel on step 4, which looked exactly like an off-by-one desync. It was
not: Playwright's element screenshot scrolls and waits for stability, and autoplay advanced between
the state read and the shutter. Sampling rail-vs-panel 62 times across ~25s found 0 mismatches.
PAUSE the component before capturing, or the pair you produce is mislabelled.

**`scripts.min.js` is loaded by only 22 of 43 pages, so anything it wires is suspect.** That split
caused the consent P0. When a feature looks dead, check whether its wiring lives in that bundle and
whether the page loads it. Presence of a bundle-wired selector on an unbundled page is a CANDIDATE,
not a defect: of five candidates audited, four were already covered by an injected module and only
one was real. Test the behaviour.

**A component is only correct IN ITS CONTEXT — computed styles will not tell you.** `sv-btn--primary`
measured perfectly on security.html (999px radius, 32px padding, 48px tall) and was wrong: it is a
WHITE pill designed for dark sections, sitting on a pale band, so it read white-on-white with the
ghost border invisible. Only the screenshot showed it. Before reusing a band or button, check which
stylesheet defines it and whether THIS page loads that sheet — `premium-v2.css` powers the standard
`section.final` band and 34 of 43 pages do not load it.

**Do not pipe an audit grep to `head`.** I concluded `print.css` was referenced by no HTML because
four `.dev-tools` hits filled a `head -4`. It is linked from `roadmap.html` with `media="print"`.
When the question is "is this referenced anywhere", show every hit or count them — truncation turns
a complete answer into a wrong one.

**A cache-buster bump must include the INJECTOR.** `nav-inject.js` hardcodes the `nav-global-fix`
href with its own `?v=`. Bumping only the HTML would leave the injected `<link>` and the page
`<link>` on two different URLs, fetching the same sheet twice. 44 occurrences needed updating across
HTML *and* JS.

**A zero from a static selector scan is a QUESTION, not an answer.** Of five zero-match modules,
two were live. Before believing a zero, check three things: does the module expose anything on
`window` that other files call (`tool-teaser.js` → `CAToolTeaser`, used by 3 files); does it build
selectors from constants or concatenation rather than literals (`reveal-failsafe.js` → `FORCE_SEL`
matches `main section`, i.e. most of every page); and is it a library that waits to be invoked
rather than self-wiring (`ca-form-validation.js` → exposes `CAFormValidation`, which turned out to
have no callers, so that one really was dead).

**A route gate can make live code look dead.** `pricing-tabs-indicator.js` appeared in no
request trace and looked like a sixth dead module. Its gate is `/^\/pricing(\/|$)/`, which does not
match `/pricing.html` — the URL form used when testing locally. On the extensionless `/pricing`,
which is what production serves and what CF canonicalises `/pricing.html` into, it loads and creates
`.ptab-indicator`. **Test the production URL form**, not the file path: several gates in
`nav-inject.js` are extensionless-only.

**Grepping HTML does not tell you what loads.** `nav-inject.js` injects 10+ scripts and 4
stylesheets at runtime, so "referenced by 0 HTML pages" and "not loaded" are different claims. I
conflated them and wrote a wrong justification into a commit message. Check `scriptsToInject` and
the injected `<link>` list before calling any JS or CSS dead.

**A reachability prune is only as good as the scan behind it, and I have now got this wrong
twice.** `srcset` (broke 45 image refs) and `<?xml-stylesheet?>` (broke the changelog feed). Both
times I asked "is the HTML scan the complete picture here?" and both times answered it against one
reference form instead of enumerating them all. Before adding ANY directory to
`REFERENCED_ONLY_DIRS`, list every way a file of that type can be referenced, then confirm the scan
reads each one. Known forms now covered: `src`, `href`, `srcset`, CSS `url()` (files, `<style>` and
inline), and `href` in `.xml`/`.xsl`. Audited 2026-07-30 and empirically EMPTY: every asset path in shipped JS is a
string literal, all 24 resolve, and the only apparent miss (`/static/array.js`) is on PostHog's
remote `api_host`, not this site. `nav-inject.js` builds its injected `<link>` and `<script>` URLs
from literals too, so the scan sees them — proved by deleting an injected module, which fails the
build naming `nav-inject.js`. So the gap is theoretical rather than live, but it is still a gap:
`js/modules` is deliberately NOT in `REFERENCED_ONLY_DIRS`, because a directory rule there would
need the scan to see dynamic `import()` and `Worker()` as well.

**A negative test that does not actually change anything proves nothing — and looks like success.**
My first attempt to test the asset-lock re-encoded a photo with sharp reading and writing the same
file, which errors on Windows. The photo never changed, the build passed, and that pass would have
read as "the gate works". Assert the precondition (the bytes really did change) before trusting the
verdict.

**Verify a new check by BREAKING something, never by watching it pass.** A check that matches
nothing prints the same output as a check that finds nothing wrong. Two separate defects this
session hid behind that identical green line — the `srcset` blind spot and a regex corrupted by a
0x01 byte. Every gate added since is accompanied by a negative test: remove the asset, confirm the
build exits non-zero and names the right source file.

**Beware "my scratch test proves the logic".** The corrupted regex matched all 5 font URLs when
retyped by hand in a scratch script and 0 when run from the file. Test the artefact that actually
runs, and when a shell heredoc has touched code containing backslashes, check it with `cat -A`.

**A green "no referenced asset missing" is only as good as what the scan reads.** It reported
clean while 45 image references were broken, because it did not read `srcset`. When a build gate
says a class of thing is fine, check what evidence it actually collects before believing it — the
same lesson as the schema guard that checks code-vs-staging and never prod.

**Substring selectors and basename greps are the same hazard.** Three instances this session:
`[class*="eyebrow"]` catching `.ca-eyebrow-dot`, `[class*=-step-num]` matching one class it then
repainted off-brand, and `grep google.svg` matching `color-google.svg`. In all three the pattern
was right about the string and wrong about the thing.

**Never audit assets by basename.** `grep google.svg` also matches `color-google.svg`, which made
an unreferenced file look referenced; the exact-path comparison caught it. Same class as the
`property`-before-`content` and `<head`-matches-`<header>` errors: the pattern was right about the
string and wrong about the file.

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
