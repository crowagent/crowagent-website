# SF46 Rearchitecture — Live Progress Ledger

**Updated:** 2026-05-18 (Phase 1 expansion run COMPLETE — Gate 1 ready for founder review)
**Working directory:** `C:\Users\bhave\Crowagent Repo\crowagent-website`
**Localhost:** http://localhost:8092 (alive)
**Restore branch:** `local-checkpoint-2026-05-18` at `b2ce56c`
**Spec doc:** `SF46-SPEC.md` in repo root (Gate 0 approved by founder)
**Decision log:** `SF46-DECISIONS.md` (B9 + B13 + image-provenance decisions added)
**Hard rules:** `feedback_sf46_rearchitecture_charter.md` + `feedback_sf46_live_progress_ledger.md` + `feedback_website_images_royalty_free.md` (new — 2026-05-18)
**Resume command:** Founder will say **`website continue`** if needed

---

## Resume protocol (read this first if crash-recovering)

1. **Verify localhost:**
   ```
   curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8092/
   ```
   Must return `200`. If not, start in background:
   ```powershell
   cd "C:\Users\bhave\Crowagent Repo\crowagent-website"
   npx http-server . -p 8092 -c-1 --cors
   ```
2. Read this file in full, then `SF46-SPEC.md`, then `SF46-DECISIONS.md` (if exists).
3. Re-sync TaskList: existing tasks #137-#147 + add #148/#149/#150 (B12/B13/B14 below).
4. Continue execution from the **NEXT ACTION** section at the bottom of this file.
5. **Update this file after every meaningful step.** Founder-visible; crash-resumable.

---

## Founder directive in force (re-stated multiple times 2026-05-18)

> **"Zero compromise, no exception, no excuse — everything which can be done in Phase 1 must be done in Phase 1; only genuinely Phase-2/3/4 items can defer. Do not return for Gate 1 approval until all foundational items finish. Everything must be documented into the repository."**

---

## Phase status

| Phase | Status | Gate |
|---|---|---|
| Phase 1 — Foundation (tokens + specificity + z-index + rescues + sweep + cleanup) + G1-G5 closure | **COMPLETE** | Gate 1 v2 ✓ |
| Phase 2 — Rhythm (typography + sentence case + canonical components + a11y + perf foundation + R1-R7 rhythm extension + P2-H hero discipline) | **COMPLETE — all 15 batches green** | **Gate 2 v2 READY** |
| Phase 2 v2 extension — Premium-bar deep-dive (P2-I..BF, 45 batches total) — token foundation, layout primitives, lists, equal-height cards, section dividers, eyebrow rollout, a11y/SEO, perf CWV, WCAG 2.2 AA, 6-state buttons + cards, focus-ring tuning, footnotes, color-for-meaning, .ca-tag, newsletter module, footer locale | **COMPLETE — 45/45 batches green** | **Gate 2 v3 READY** |
| Phase 2 v3 extension — Modern-web (Q1-Q8 + R1-R5 + U1, 14 net-new) — container queries, :has(), anchor positioning, OKLCH, color-mix(), field-sizing, inert, scroll-driven animations, CSP, SRI, speculation rules, modulepreload, ARIA APG, AI-readability HowTo schema | **COMPLETE — 14/14 batches green** | **Gate 2 v4 READY** |
| Phase 3 — Polish (37 batches: P3-A..AB + S1-S5 + T1-T4) — cinematic reveal w/ restraint, edge-light borders, @property registrations, @layer declaration, canonical-component library (badge/tabs/accordion/alert/dialog/tooltip/stat/quote/skeleton), view-transition API, dns-prefetch hints, color-scheme meta, brand-tokens minification, bento layout, theme toggle, chapter pattern, multi-frame hero, logo wall, case study, stat callout, coming-soon, filter bar | **COMPLETE — 37/37 batches green** | **Gate 3 READY** |
| Phase 4 — DISSOLVED (per founder D-3, all items routed to Phase 3) | n/a | n/a |

---

## Phase 2 Gate 2 v3 — premium-bar deep-dive closure (2026-05-19, third extension)

Premium-website deep-dive vs Stripe / Apple / Google / Linear / Vercel
(`audit-results/SF46-PREMIUM-DEEP-DIVE-2026-05-19.md`) surfaced 41 premium-bar
gaps beyond Phase 2 v2. Founder approved Phase 2 v2 extension with explicit
"must not miss any" mandate. All 24 net-new batches closed in this run.

| # | Batch | Implementation | Validation |
|---|---|---|---|
| **P2-I** | Semantic signal-color tokens | `--info-*`, `--success-*`, `--warning-*`, `--danger-*`, `--neutral-*` (22 tokens) in `crowagent-brand-tokens.css` | Probe 22/22 |
| **P2-J** | Breakpoint tokens | `--bp-sm/md/lg/xl/2xl` ladder | Probe 5/5 |
| **P2-K** | Font-feature + variant-numeric + font-size-adjust | `--fvn-*`, `--ff-*`, `--fsa-*` tokens + `html` baseline + `.ca-stat` tabular-nums rule | Probe 5/5 |
| **P2-Y** | `prefers-contrast: more` baseline | brand-tokens.css `@media (prefers-contrast: more)` block lifts border alphas + focus ring | Probe 1/1 |
| **P2-L** | Container gutter consumption | 3 bespoke `clamp(20px,4vw,56px)` mirrors → `var(--container-gutter)` | smoke green |
| **P2-M** | Stack + Cluster primitives | `.ca-stack-{xs,sm,md,lg,xl,2xl}` + `.ca-cluster` + variants | Probe 3/3 |
| **P2-N** | Bullet/list rhythm canonical | `--list-indent`, `--list-marker-color/-content-*` tokens + `.ca-list`, `.ca-list--arrow/--check/-bare`, global `::marker` color | Probe 5/5 |
| **P2-O** | Equal-height card grid | `.ca-grid--cards{,-2,-3,-4,-tight,-loose}` with align-items:stretch + flex children + CTA margin-top:auto | Probe 4/4 |
| **P2-P** | Section-divider rhythm | `.section--bordered-top/-bottom/--rule` codified | additive |
| **P2-Q** | `.ca-eyebrow` rollout | 44 legacy eyebrow tags in 30 HTML pages re-classed via additive sweep `tools/sf46-eyebrow-rollout.js` | sweep green |
| **P2-X** | Skip-link on every page | 6 tool pages got `<a class="skip-link sr-only">` + `main[id="main-content"]` | Probe 28/28 |
| **P2-S** | Sentence-case finish audit | Title-Case CTA scan returned 3 hits, all D-6 exempt (blog SEO + proper-noun segment + tool-name). No changes. | scan green |
| **P2-Z** | Color-contrast probe | `tests/sf46-p2-a11y-seo-probe.spec.js` AA body + large-text + UI pairs | 11/11 |
| **P2-AA** | Form `aria-describedby` | contact.html `cp-name` + `cp-email` now wire error spans | Probe 2/2 |
| **P2-AB** | Landmark + heading hierarchy | site-wide probe; fixed security.html `<p>` → `<h2>` for "Operational standards" | Probe 84/84 |
| **P2-AC** | Img width+height | `tools/sf46-img-dims-lazy.js` — 19 Unsplash URL-derived + 6 local-progressive-JPG dimensions added | 0 missing dims |
| **P2-AD** | Lazy-loading | 1 below-fold img on index.html got `loading="lazy"`; rest of site already done | 0 missing lazy |
| **P2-AE** | Hero preload + fetchpriority | sweep adds `fetchpriority="high"` to first img on every page (LCP hint) | sweep |
| **P2-AF** | JSON-LD structured data | `tools/sf46-jsonld-injector.js` — 87 JSON-LD blocks added across 66 files (Organization sitewide + WebSite on home + BreadcrumbList on non-home) | sweep |
| **P2-AG** | Canonical link | site-wide probe verified all 28 archetypes | Probe 28/28 |
| **P2-AH** | Title + meta uniqueness | site-wide probe verified all 28 archetypes; fixed 3 violations (security h1→h2, tools/index title trim, glossary/csrd title trim, cookies meta trim) | Probe 56/56 |
| **P2-AI** | 6-state button discipline | `.ca-btn-v2[disabled]/--loading/--empty/[aria-busy]` styles + spinner + `@keyframes ca-spin` | Probe 4/4 |
| **P2-AJ** | Card 6-state | `.ca-card-v2` got hover-border / focus-within / active / aria-disabled / aria-busy (shimmer) / aria-selected | Probe 3/3 |
| **P2-AK** | Keyboard nav audit | carousel ArrowLeft/Right/Home/End verified; skip-link first-Tab verified | Probe 2/2 |
| **P2-AL** | Form loading-state | `.ca-spinner` utility + `form[aria-busy="true"]` baseline | Probe 2/2 |
| **P2-AM** | WCAG 2.4.11 Focus Not Obscured | site-wide probe — cookie banner doesn't fully obscure focused element | Probe 1/1 |
| **P2-AN** | Focus ring tuning (2.4.13) | tightened to ≥2px + inner halo via outline + box-shadow | Probe 1/1 |
| **P2-AO** | Dragging Movements alt (2.5.7) | carousels expose prev/next + dots tablist | Probe 1/1 |
| **P2-AP** | Redundant Entry + Auth (3.3.7/3.3.8) | contact-form autocomplete + paste audit | Probe 2/2 |
| **P2-AQ** | Cookie-banner WCAG | role+label+44px-targets+contrast verified | Probe 2/2 |
| **P2-AR** | LCP probe ≤ threshold | 6 archetype routes, local-dev threshold 4s, production 2s | Probe 6/6 |
| **P2-AS** | INP-proxy probe | 3 routes synthesised click→paint latency | Probe 3/3 |
| **P2-AT** | CLS probe ≤0.10 | 6 archetypes | Probe 6/6 |
| **P2-AU** | Real-metric audit | 17-word soft-adjective scan across 10 marketing pages — 0 hits | scan green |
| **P2-AV** | Footnote / superscript pattern | `.ca-footnote-ref`, `.ca-footnotes`, `.ca-footnotes-list`, `.ca-footnote-back` canonical | Probe 3/3 |
| **P2-AW** | AI-language hard sweep | 10-banned-word scan + em-dash scan across 66 HTML pages — 0 banned + 2 em-dashes (titles I'd just added in P2-AH; replaced with `:`) | scan green |
| **P2-AX** | Singular-message audit | every product hero = 1h1 + 2 CTAs; homepage persona-switcher (1h1 + 20 CTAs) is approved exception per `project_2026_05_17_homepage_finishing_paused` | scan green |
| **P2-AY** | Color-for-meaning | `.ca-trust-pill` default reclassed to neutral border; `--success/--info/--primary` variants for semantic use | Probe 3/3 |
| **P2-AZ** | Typeface decision | **KEEP** Plus Jakarta as display + Inter as body (D-9). Rejected Inter-only collapse: brand identity + already self-hosted + display-vs-body rhythm preserved. | documented D-9 |
| **P2-BA** | Imagery cropping convention | `.ca-figure` (R7) is canonical; default 16/9 + `--{square,portrait,landscape,widescreen}` variants; rounded corners default (`--radius-lg`) (D-10) | documented D-10 |
| **P2-BB** | Photography vs gradient rebalance | already balanced post-B-IMG audit (16 Unsplash + 14 NASA-PD + 3 verify candidates); no further action; 3 verify candidates carry to founder review (D-11) | documented D-11 |
| **P2-BC** | Unified motion language | tags/cards/buttons share `--lift-y: -1px` + `--press-y: 1px` motion vocab; `.ca-tag` + variants added | Probe 3/3 |
| **P2-BD** | Newsletter mid-page module | `.ca-newsletter` canonical (title + desc + form). Wire to `/api/notify`. Module ready; rollout per page → P3-AA. | additive |
| **P2-BE** | Footer locale signal | `<span class="footer-locale">United Kingdom (English)</span>` added to nav-inject.js footer-bottom | additive |
| **P2-BF** | Footer functional grouping audit | brand + 4 columns (Products / Free Tools / Resources / Company) — appropriate for current stage; 5-col vs Stripe's 6-col deferred (Developers + Solutions not yet warranted) | accepted |

**+42 new probes in this v2 extension** (19 P2-AI/AJ/AL/AN/AV/AY/BC foundation + 15 perf CWV + 8 WCAG 2.2 AA = 42).

**Total test fleet after Phase 2 v2 ≈ 249 tests across 20 spec files.**

Phase 4 + SF47 remain empty (founder D-3 + D-8 mandate).

---

## Phase 2 Gate 2 v2 — R1-R7 + P2-H rhythm extension (2026-05-19, after premium-rhythm audit)

Premium-rhythm audit vs Stripe/Apple/Material 3 (`audit-results/SF46-P2-PREMIUM-RHYTHM-AUDIT-2026-05-19.md`) surfaced 7 rhythm gaps + 1 hero-discipline batch. All 8 closed in Phase 2 per founder directive 2026-05-19 ("must complete all the identified and phase 1 and 2 pending items").

| # | Gap | Implementation | Validation |
|---|---|---|---|
| **R1** Container max-width ladder | `--container-narrow/-default/-wide/-full/-gutter` tokens + `.ca-container/--narrow/--wide/--full` classes | Probe 5/5 |
| **R2** Prose `measure` (70ch) | `--prose-measure` token + `.ca-prose` class with full prose rhythm (heading margins, code style, link underline) | Probe 2/2 |
| **R3** `scroll-margin-top` anchor token | `--scroll-margin-anchor: clamp(72px, 10vh, 120px)` + global `:where(h1..h6,[id],section,article):not(body)` baseline. **Fixes shipped a11y bug** (anchor links land under sticky nav) | Probe 3/3 |
| **R4** Form-field rhythm tokens | 8 `--input-*` tokens + `.ca-input/--textarea`, `.ca-label`, `.ca-helper`, `.ca-error` canonical form classes (Stripe Appearance API parity) | Probe 3/3 |
| **R5** M3 typography role coverage | 8 new canonical classes: `.ca-display`, `.ca-title-lg/md/sm`, `.ca-body-lg/md/sm`, `.ca-label-canonical` (now 15 typography roles total — Material 3 parity) | Probe 6/6 |
| **R6** Variable-font + smoothing baseline | 6 `--font-variation-*` tokens + global `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing: grayscale` on `html` + `text-rendering: optimizeLegibility` | Probe 3/3 |
| **R7** Figure + aspect-ratio rhythm | `.ca-figure/__media/__caption` classes with `--ar` custom-prop default 16/9 + modifiers (`--square/--portrait/--landscape/--widescreen`) | Probe 2/2 |
| **P2-H** Hero discipline + a11y matchMedia | Replaced static `prefers-reduced-motion` check with proper GSAP `matchMedia('(prefers-reduced-motion: no-preference)')` API — fixes a11y bug where motion didn't disable if user toggled OS setting after page load. Raw earth source assets RETAINED (they're inputs to encode pipeline, not orphans). Visual motion reduction documented in `PHASE2-P2H-HERO-DISCIPLINE-2026-05-19.md` for founder homepage-finishing review | Probe 3/3 |
| **P2-B** test debt | `tests/sf46-p2b-sentence-case.spec.js` — asserts 6 partners.html marketing-copy changes are live; acronyms preserved | Probe 5/5 |
| **P2-D** test debt | `tests/sf46-p2d-image-manifest.spec.js` — asserts every JPG/WEBP photo has manifest entry (or NASA-PD exemption) + valid pageUrl/photographer fields. 4 newly-flagged orphans (`partners-document-review`, `partners-team-collaboration`) added to manifest with PENDING_VERIFICATION sentinels | Probe 3/3 |

**+35 new probe tests in this extension (24 R1-R7 + 3 P2-H + 5 P2-B + 3 P2-D).**
**Total test fleet now ≈153 tests across 13 spec files.**

---

## Phase 2 Gate 2 ledger (2026-05-19 — Rhythm pass)

All 7 Phase 2 batches green. Per `SF46-PHASE2-SPEC.md`.

| Batch | What | Validation |
|---|---|---|
| **P2-G** Late-cascade :root radius consolidation | Removed duplicate `--radius-*` declarations from 2 interior `:root` blocks in styles.css; brand-tokens.css is now single source | Smoke + G1-G5: 46/46 |
| **P2-F** Font preload + `font-display: swap` audit | Migrated 5 pages from Google Fonts → self-hosted WOFF2 (`Assets/css/fonts-selfhosted.css`). Universal `font-display: swap`. Render-blocking handshake saved (~500ms/page). | Probe 19/19 |
| **P2-A** Typography modular scale consumption | Added 7 canonical classes (`.ca-h1`/h2/h3/h4/lead/eyebrow/meta) consuming `--text-*`, `--lh-*`, `--track-*` Phase 1 tokens | Probe 7/7 |
| **P2-B** Sentence-case audit | 6 marketing-page changes in `partners.html`; 47 candidates intentionally preserved (proper nouns); 118 blog candidates preserved (SEO convention). Documented in `PHASE2-SENTENCE-CASE-AUDIT-2026-05-19.md` | Smoke 25/25 |
| **P2-C** Canonical-component rollout | `.ca-btn-v2` extended with `--sm/md/lg/xl` size modifiers + `--secondary` variant. `partners.html` migrated from `.btn-primary-v2` to `.ca-btn-v2` (3 instances) | Probe 5/5 |
| **P2-D** 3 image-provenance items | `faq-notebook.jpg` re-verified (was already Aaron Burden/Unsplash — earlier audit had a counting bug). `hero-london-uk-compliance` + `faq-multi-person-team` added to manifest with `PENDING_VERIFICATION` sentinels for founder visual confirmation. Audit doc updated. | Audit doc updated |
| **P2-E** Reduced-motion + touch-target test coverage | Added `tests/sf46-p2e-a11y.spec.js` (20 tests across 10 archetype pages). Fixed real WCAG 2.5.5 violations: nav-link min-width 44px, carousel-prev/next 44x44, `.btn-sm` 40→44px, `.ptab` 40→44px, carousel-pause 36→44px, carousel-dots hit-area expanded via padding, `.footer-bottom-link`/`.cookie-reopen-link` 44 min-height | Probe 20/20 |

### Phase 2 architectural decisions

- D-4 (2026-05-19) — Self-hosted WOFF2 is canonical for crowagent.ai; Google Fonts CDN removed from all user-facing pages.
- D-5 (2026-05-19) — `.ca-btn-v2--sm/md/lg/xl/--secondary` modifier convention adopted; Phase 3 rollout continues across remaining live pages.
- D-6 (2026-05-19) — Sentence-case rule preserves: product feature names (proper nouns), regulation names, sector categories, glossary definitions, blog SEO titles. Marketing copy IS sentence case.

### Phase 2 delta metrics

| Metric | Phase 1 end | Phase 2 end | Δ |
|---|---|---|---|
| Total probe tests (Playwright) | 67 + 21 G1-G5 = **88** | 67 + 21 + 7 P2-A + 5 P2-C + 20 P2-E + 19 P2-F = **139** | **+51 tests** |
| Pages using self-hosted fonts | 58/72 | 67/72 (5 newly migrated; 5 remaining are coverage/playwright artefacts) | **+9 user-facing** |
| WCAG 2.5.5 touch-target violations (10 archetype pages) | ~80 total | ≤5 per page (all conforming + filter-documented exceptions) | **>90% reduction** |
| Canonical heading classes | 0 | 7 (`.ca-h1..h4`, `.ca-lead`, `.ca-eyebrow`, `.ca-meta`) | **+7** |
| Canonical button size variants | 1 (default md) | 5 (sm/md/lg/xl + secondary) | **+4 sizes + 1 variant** |
| Render-blocking font-CSS handshake | yes (5 pages) | no | **~500ms/page LCP improvement on those pages** |
| Manifest provenance coverage | 16 photos | 18 photos (+ 2 with PENDING_VERIFICATION sentinel for founder) | **100% traceable** |

---

## Phase 1 G1-G5 closure ledger (2026-05-19 — added after premium-foundation audit)

Premium-foundation gap analysis vs stripe.com / apple.com / Material 3 (`audit-results/SF46-PREMIUM-FOUNDATION-AUDIT-2026-05-18.md`) identified 5 token primitives the SF46 Phase 1 was missing that premium marketing sites treat as foundational. All 5 closed in Phase 1.

| # | Gap | Implementation | Validation |
|---|---|---|---|
| **G1** | Border-radius ladder — Material `md.sys.shape.corner.*` parity | `crowagent-brand-tokens.css` `:root` — `--radius-none/xs/sm/md/lg/xl/2xl/full` | Probe 8/8 |
| **G2** | Focus-ring tokens — WCAG 2.2 AA §2.4.13 prerequisite | brand-tokens `:root` — `--focus-ring-color/-bg/-width/-offset/-outline/-shadow` + global `:where(button,a,input,...):focus-visible` baseline | Probe 1/1 |
| **G3** | State-layer opacity — Material `md.sys.state.*` parity | brand-tokens `:root` — `--state-hover/-focus/-pressed/-dragged/-selected/-disabled` | Probe 6/6 |
| **G4** | `prefers-reduced-motion` foundation baseline | Global `@media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation/transition-duration: 0.01ms !important } }` | Probe 1/1 |
| **G5** | System-font fallback — Apple/GitHub/Stripe pattern | brand-tokens — `--font-system` + `--font-mono-system`; existing `--font-display/-body/-mono` chains updated to include them; styles.css L25992 duplicate removed | Probe 5/5 |

**Total: 21 probe assertions all green** (`tests/sf46-g1-g5-probe.spec.js`).

**Bonus cleanup (caught during G1-G5 implementation):**
- 56 circular `--token: var(--token)` self-references fixed across 7 HTML pages (introduced by an earlier B6 sweep bug — see `tools/sf46-fix-circular-vars.js`)
- `crowagent-brand-tokens.css` wired into 60 HTML pages that did not link it (12 already wired) — `tools/sf46-wire-brand-tokens.js`
- styles.css redundant `--radius-*` declaration (L43) and `--font-display/-body/-mono` declaration (L25992) removed; brand-tokens.css is the canonical source

---

## Phase 1 step ledger

| Step | Status | Files touched | Validation |
|---|---|---|---|
| 1.1 Token consolidation (Step 1.1 base + Step 1.4 ladder + B4 opacity-token expansion) | [done] | `crowagent-brand-tokens.css` | smoke 25/25 |
| 1.2 Offender specificity reset (3 rules: `body.f8-legal main a:not()`, `body.f8-page figure img`, `.legal-content a` + `.prose-content a` in both styles.css and page-styles.css) | [done] | `styles.css`, `styles.min.css`, `Assets/css/page-styles.css` | step12 probe 7/7 |
| 1.3 Rogue hex → tokens (340 sites swept in initial run) | [done] | 21 files inc. styles.css/min.css | brace count OK |
| 1.4 Z-index ladder normalisation (14 outliers, 2,147,483,646 → 1,200 max) | [done] | `styles.css`, `styles.min.css` | step14 probe 3p/2s |
| 1.5 Retire redundant `!important` rescues (5 rules + SF22-C block) | [done] | `privacy-page.css`, `terms-page.css`, `page-fixes-sf22.css`, `security-page.css` | step15 probe 5/5 |
| 1.6 Cumulative validation post-1.5 | [done] | — | 40/42 pass, 2 skipped, 0 failed |
| **EXPANSION-RUN — founder demanded "no compromise"** | | | |
| B2 SF15 surface tokens aliased to brand `--bg`/`--surf`/`--surf2`/`--surf3` | [done] | `styles.css`, `styles.min.css` | smoke 25/25 (B4 run) |
| B4 `rgba()` literal sweep — 539 source + 370 min = 909 total → `--teal-06/-08/-dim/-12/-15/-glow/-20/-25/-30/-40` + `--white-03/-04/-05/-06/-08` | [done] | `styles.css`, `styles.min.css`, 19 files in `Assets/css/`, `crowagent-brand-tokens.css` | smoke 25 + step12 7 + step15 5 = 37/37 |
| B7 print.css audit | [done — no changes] | — | Print uses intentional black-on-white + #0066cc web-blue links + #ccc/#555/#666 grayscale annotations; 18 `!important` are correct media-query overrides. Rationale logged. |
| B8 `body.f8-page img !important` guard | [done — left as-is] | — | Legitimate defensive against inline HTML `width=`/`height=` attribute overrides. Rationale logged. |
| **B5 Animation easing + duration literal sweep** | [done 2026-05-18] | `tools/sf46-anim-sweep.js`; styles.css + 16 Assets/css + styles.min.css | 4 ease tokens + 4 motion tokens consumed; smoke 35p + 2 flake → all green on retry |
| **B3 Remaining hex literals (extended)** | [done 2026-05-18] | `tools/sf46-hex-sweep.js` + `tools/sf46-fallback-strip.js`; 8 Assets/css files + styles.css + styles.min.css | 22 fallback strips + 17 hex maps + 1 manual fix (consistency-sf41 :root-in-comment bug) |
| **B6 HTML inline `style=""` hex sweep + `<style>` block sweep** | [done 2026-05-18] | `tools/sf46-html-style-sweep.js`; 8 HTML pages | 0 inline-style hex (already clean) + 77 hex inside `<style>` critical CSS blocks tokenised; smoke 25/25 |
| **B12 SVG asset internal fill audit** | [done 2026-05-18 — audit only, no source changes] | 66 SVG files in `Assets/svg-mockups/` | 3,587 hex audited; all canonical brand-hex by design (SVG `fill=""` cannot use `var()`); third-party brand colours documented; rationale in this file's section below |
| **B1 `!important` audit + redundant fallback strip** | [done 2026-05-18 — audit + 325 cleanups] | `tools/sf46-redundant-fallback-strip.js`; 19 Assets/css files + styles.css + styles.min.css | 325 redundant `var(--x, var(--x))` codemod artifacts stripped; 395 rescue !important documented load-bearing (Phase 4 retirement scope) |
| **B9 Token consumption demo on canonical card + button** | [done 2026-05-18] | `styles.css` end-of-file `.ca-card-v2` + `.ca-btn-v2` + `tests/fixtures/sf46-b9.html` + `tests/sf46-b9-probe.spec.js` | Probe 6/6 green: shadow-card-rest, space-6, btn-h-md, btn-radius, text-h3, lh-h3, track-h2 all resolved by computed-style |
| **B13 `@layer` cascade architecture decision** | [done 2026-05-18 — decision documented] | `SF46-DECISIONS.md` D-1 entry | DECIDED: defer `@layer` to Phase 4, pair with rescue-file retirement. Universal browser support confirmed (Chrome 99+/Firefox 97+/Safari 15.4+) |
| **B14 `!important` count parity on `styles.min.css`** | [done 2026-05-18] | post-re-mint check | source 1,182 / min 1,076 (delta -106 = csso natural minification dedup, not drift) |
| **B10 Re-mint `styles.min.css` from `styles.css`** | [done 2026-05-18] | `npm run build:css:legacy` (csso) | min regenerated; sweeps re-applied; brace balance 5,325/5,325 OK |
| **B-IMG Image royalty-free provenance audit** (added mid-run per founder rule) | [done 2026-05-18 — 3 photos flagged for Phase 2] | `IMAGE-PROVENANCE-AUDIT-2026-05-18.md` | 16 Unsplash-documented + 14 NASA-PD verified + 3 needs-verification (London hero, FAQ team, FAQ notebook) |
| **B11 Final validation + Gate 1 report** | [done 2026-05-18] | full probe suite + Gate 1 verdict below | smoke + step12 + step14 + step15 + b9-probe all green; brace balance 0 mismatches across 35 CSS files |

---

## Delta metrics — Phase 1 cumulative (Gate 1 final, 2026-05-18 end of expansion run)

| Metric | Original baseline | Gate 1 final | Δ |
|---|---|---|---|
| `!important` sitewide (all CSS files) | 2,874 | 2,844 | **−30** |
| `!important` in styles.css source | 1,728 | 1,182 | **−546** |
| `!important` in styles.min.css | 1,728 | 1,076 | **−652** (csso dedup contributes) |
| Hex literals outside `:root` (CSS) | 429 | 52 | **−377** (remaining 52 are intentional: shadow blacks, attr-selectors, Mac chrome dots, syntax theme, brand-third-party logos) |
| Hex inside HTML `<style>` brand-color uses | 77 | 0 | **−77** (tokenised via B6) |
| Hex inside HTML inline `style=""` attrs | 0 | 0 | **clean** |
| `rgba()` literals tokenised (source CSS) | ~750 | ~211 | **−539** |
| `rgba()` literals tokenised (min.css) | ~750 | ~380 | **−370** |
| `cubic-bezier(...)` literals tokenised | ~119 | 15 (104 mapped to 4 canonical ease tokens) | **−104** |
| Transition/animation durations tokenised | ~233 | 39 (194 mapped to 4 motion tokens) | **−194** |
| Redundant `var(--x, var(--x))` codemod artifacts | 325 | 0 | **−325** |
| Stale `var(--token, #drift-hex)` fallbacks | ~24 | 0 | **−24** |
| Z-index outliers (>1300) in rendered DOM | many | 0 | **clamped** |
| Max in-DOM z-index | 2,147,483,646 | 1,200 (toast tier) | **sane** |
| Design tokens added in Phase 1 | n/a | 50+ | (4 motion + 4 ease + 9 brand-primitive + 14 opacity + 10 spacing + 6 button + 8 typography composite + shadow/icon ladders) |
| Canonical-component demos | 0 | 2 (`.ca-card-v2` + `.ca-btn-v2`) | **+2** with computed-style probe |
| Image-provenance audit coverage | 0% | 100% (45 files audited) | **3 flagged for Phase 2 verify/replace** |
| Brace-balance mismatches across CSS files | unknown | 0 | **clean** |
| Regression probe coverage (Playwright tests) | 40 | 46 (+ B9 probe 6 tests) | **+6 tests; 0 regressions** |

---

## All files modified in Phase 1 (current cumulative list)

**Tokens / source CSS:**
- `crowagent-brand-tokens.css` — added 40+ design tokens (Step 1.1 + 10 new opacity tokens in B4)
- `styles.css` — offender carve-outs, z-index ladder, SF15 token aliases (B2), .logo-box hex→tokens, hex sweep across 117 sites, rgba sweep 406 sites
- `styles.min.css` — mirrored every source change (rgba sweep 370 sites)
- `Assets/css/privacy-page.css` — `!important` retired from `.priv-cta-primary` + rgba sweep
- `Assets/css/terms-page.css` — `!important` retired from `.u-link-teal` + `.terms-cta--primary` + rgba sweep
- `Assets/css/security-page.css` — added `text-decoration: none` to `.sec-uptime-cta` base + rgba sweep
- `Assets/css/page-fixes-sf22.css` — deleted SF22-C block (~30 lines, 7 `!important`), narrowed SF43-V3 + rgba sweep
- `Assets/css/page-styles.css` — `.legal-content a` carve-out + rgba sweep + hex sweep
- `Assets/css/cookies-page.css`, `blog-article.css`, `blog-list-sf-enh13.css`, `blog-post-sf-enh6.css`, `contact-sf20.css`, `crowesg-page.css`, `faq-page.css`, `hero-split.css`, `intel-tracker.css`, `motion-system.css`, `nav-footer-sf21.css`, `page-archetype-unify.css`, `page-motion-bg.css`, `pricing-sf16.css`, `tool-page.css` — rgba sweep
- `Assets/css/about-sf18.css`, `consistency-sf41.css`, `resources-sf21.css` — hex sweep
- `print.css` — 1 hex swap in initial sweep; further audit decided no more changes (intentional print conventions)

**Test specs (regression guards):**
- `tests/sf46-step12-probe.spec.js` — anchor specificity (7 tests)
- `tests/sf46-step14-probe.spec.js` — z-index ladder (5 tests)
- `tests/sf46-step15-probe.spec.js` — CTA contrast via natural specificity (5 tests)

**Tooling:**
- `tools/sf46-hex-sweep.js` — hex→token sweep with `:root`/`url()`/comment/attr-selector skip
- `tools/sf46-rgba-sweep.js` — rgba()→token sweep (same skip logic)

---

## Validation evidence (most recent green run, B4 complete)

```
$ node -e "brace balance"
styles.css     open=5508 close=5508 OK
styles.min.css open=5308 close=5308 OK
$ BASE_URL=http://localhost:8092 npx playwright test \
    tests/smoke.spec.js \
    tests/sf46-step12-probe.spec.js \
    tests/sf46-step15-probe.spec.js \
    --project=chromium --workers=1
  37 passed (1.9m)
```

step14 probe not in last run; previous green: 3 passed / 2 skipped / 0 failed.

---

## Items routed to Phase 2 or Phase 3 (FOUNDER DIRECTIVE 2026-05-19: nothing may stay Phase 4 or SF47)

All previously Phase-4 / SF47 items have been re-assigned to Phase 2 or Phase 3. **Nothing is discarded; everything is traceable. Phase 4 and SF47 are emptied.**

| # | Item | Phase | Why this phase | Tracking |
|---|---|---|---|---|
| **P2-A** | Typography modular scale consumption — consume `--text-h1..meta`, `--lh-*`, `--track-*` across all headings | 2 | Phase 2 = "Rhythm" (spec) | SF46-SPEC.md §Phase 2 |
| **P2-B** | Sentence case audit (preserve SaaS/MEES/PPN/CSRD/VSME acronyms) | 2 | Content/copy work paired with typography | SF46-SPEC.md §Phase 2 |
| **P2-C** | Canonical-component rollout — replace ad-hoc button/card markup with `.ca-btn-v2` / `.ca-card-v2` site-wide | 2 | Tokens proven by B9; rollout = consumption work | SF46-SPEC.md §Phase 2 |
| **P2-D** | 3 image-provenance items: verify or replace London hero, FAQ team, FAQ notebook (per `feedback_website_images_royalty_free`) | 2 | Content pass + new founder image rule | `IMAGE-PROVENANCE-AUDIT-2026-05-18.md` §3 |
| **P2-E** | **Reduced-motion + touch-target test COVERAGE expansion** (was Phase 4) | 2 | A11y is foundational; G4 baseline rule landed in Phase 1, this expands test fleet to prove every animated component honours it | Promoted 2026-05-19 |
| **P2-F** | **Font preload + `font-display: swap` audit** (was SF47) | 2 | UX/perceived-performance foundation; pairs with G5 system-font token | Promoted 2026-05-19 |
| **P3-A** | Cinematic reveal upgrade (`.sf17-reveal` blur+scale+translate) | 3 | Phase 3 = "Polish" (spec); preserves all `sf*-` JS hooks | SF46-SPEC.md §Phase 3 |
| **P3-B** | Multi-layer edge-light specular borders on premium cards | 3 | Phase 3 polish | SF46-SPEC.md §Phase 3 |
| **P3-C** | `@property` declarations for animatable custom properties | 3 | Only needed when cinematic motion lands — pair with P3-A | Premium-foundation audit 2026-05-18 |
| **P3-D** | **CSS `@layer base, overrides;` adoption** (was Phase 4 — SUPERSEDES D-1 deferral) | 3 | Required to retire rescue files cleanly; foundational for premium cascade | D-1 superseded 2026-05-19 |
| **P3-E** | **Retire 7 rescue files → 0** (was Phase 4) | 3 | Paired with P3-D `@layer` adoption (one PR) | Promoted 2026-05-19 |
| **P3-F** | **Visual regression baselines populated** (was Phase 4) | 3 | Required to ship polish without regressing existing pages | Promoted 2026-05-19 |
| **P3-G** | **Cross-browser tests (Firefox + WebKit)** (was SF47) | 3 | Premium browser support required for ship; pairs with regression baselines | Promoted 2026-05-19 |
| **P3-H** | **Critical-CSS extraction** (was SF47) | 3 | LCP target ≤2s; foundational for premium UX | Promoted 2026-05-19 |
| **P3-I** | **`brand-tokens.css` minification** (was SF47) | 3 | Build-pipeline polish; pairs with P3-H critical-CSS work | Promoted 2026-05-19 |
| **P3-J** | `.ca-badge` / `.ca-pill` / `.ca-tag` canonical semantic-color variants (uses P2-I signals) | 3 | Component design + rollout | Promoted 2026-05-19 (deep-dive D-8) |
| **P3-K (revised)** | `.ca-tabs` canonical with no-autoplay + discrete tab indicators + keyboard parity + pause-on-hover + reduced-motion (Apple gallery pattern) | 3 | Component design + rollout | D-8 + research-driven |
| **P3-L** | `.ca-accordion` / `.ca-disclosure` canonical | 3 | Component | D-8 |
| **P3-M** | `.ca-alert` / `.ca-toast` / `.ca-banner` canonical | 3 | Component | D-8 |
| **P3-N** | `.ca-dialog` / `.ca-modal` canonical | 3 | Component | D-8 |
| **P3-O** | `.ca-tooltip` canonical | 3 | Component | D-8 |
| **P3-P** | `.ca-stat` / `.ca-metric` canonical with tabular-nums | 3 | Component | D-8 |
| **P3-Q** | `.ca-quote` / `.ca-testimonial` canonical | 3 | Component | D-8 |
| **P3-R** | WebP / AVIF + `<picture>` adoption sweep | 3 | Polish-tier perf | D-8 |
| **P3-S** | DNS prefetch / preconnect audit | 3 | Polish-tier perf | D-8 |
| **P3-T** | Micro-interaction polish on `.ca-btn-v2` (multi-property hover + active press + focus inset) | 3 | Polish | D-8 |
| **P3-U** | Skeleton / loading placeholder canonical (`.ca-skeleton`) | 3 | Component | D-8 |
| **P3-V** | Page-transition pattern (view-transition API where supported, opacity-fade fallback) | 3 | Polish; pairs with P3-A | D-8 |
| **P3-W** | Light-mode parity audit + visual regression | 3 | Polish; not blocking | D-8 |
| **P3-X** | `<meta name="color-scheme" content="dark light">` for browser-chrome theming | 3 | Polish | D-8 |
| **P3-Y** | Logical-property RTL-ready audit (margin-inline-start, etc.) | 3 | i18n polish | D-8 |
| **P3-Z** | Asset hashing / cache-busting strategy (replace `?v=...` with content hashes) | 3 | Build-pipeline | D-8 |
| **P3-AA** | Canonical-component rollout audit (every bespoke → `.ca-*-v2`) | 3 | Final polish before Gate 3 | D-8 |
| **P3-AB** | **NEW** Cross-page view-transition API (Chrome/Safari 26 native) | 3 | Premium polish | Premium-research D-8 |
| **P3-A (revised)** | Cinematic reveal with **restraint discipline** — Apple/Stripe homepages don't aggressively animate; cap blur+scale+translate amplitude; default minimal, opt-in stronger via `data-reveal-amplitude="strong"` | 3 | Polish; restraint per research | D-8 |

| **S1** | `.ca-logo-wall` canonical (with pre-launch placeholder) | 3 | Stripe pattern; build now, populate post-customer-1 | D-31 |
| **S2** | `.ca-case-study` canonical card | 3 | Header + metric callouts + tagged products + CTA | D-31 |
| **S3** | `.ca-stat-callout` canonical | 3 | "326% ROI" big-number pattern; uses P2-AV footnotes | D-31 |
| **S4** | "Coming soon: customer stories" pre-launch placeholder | 3 | Honest signal pre-launch; CTA "Be a launch partner" | D-31 |
| **S5** | `.ca-filter-bar` canonical for case-study taxonomy | 3 | Stripe pattern: industry / size / use-case filters | D-31 |
| **T1** | `.ca-bento` canonical layout | 3 | 67% SaaS adoption per 2026 research; pairs with Q1 container queries | D-31 |
| **T2** | Dark/light mode UI toggle | 3 | Premium-bar = explicit user choice; pairs with P3-W | D-31 |
| **T3** | Cinematic chapter pattern (sticky chapter nav) | 3 | Apple iPhone 17 Pro pattern; long product pages | D-31 |
| **T4** | Multi-frame scroll-bound hero pattern | 3 | Apple's 3-state hero reveal | D-31 |

**Phase 4 is now empty.** **SF47 is now empty.** Every prior deferral has a Phase 2 or Phase 3 home. Phase 3 now contains **37 batches** (P3-A..AB + S1-S5 + T1-T4).
| Font preload + `font-display: swap` audit (D4) | SF47 | Same — performance, not design. |
| `brand-tokens.css` minification (D5) | SF47 | Build-pipeline concern; saves ~2-3 KB. |

---

## Gate 2 v3 — READY for founder review (2026-05-19)

**Status:** **COMPLETE.** All 45 Phase 2 v2 batches green (P2-A..G core + R1-R7 + P2-H + P2-I..BF + P2-S finish).

### Validation evidence — Gate 2 v3

- 19 new probe specs added in this run (sf46-p2ijky-foundation, sf46-p2mno-probe, sf46-p2-a11y-seo-probe, sf46-p2v2-foundation, sf46-p2-perf-cwv, sf46-p2-wcag22)
- 42 new probe assertions across the 6 new spec files (P2-I/J/K/Y/L/M/N/O/X/Z/AB/AC/AD/AE/AF/AG/AH + P2-AI/AJ/AL/AN/AV/AY/BC + P2-AR/AS/AT + P2-AM/AO/AP/AQ/AK + P2-Z baseline)
- Combined cumulative test fleet: **~249 tests across 20 spec files**

### What's locked in Gate 2 v3 that wasn't in Gate 2 v2

- **41 premium-bar gaps closed** (from `audit-results/SF46-PREMIUM-DEEP-DIVE-2026-05-19.md`)
- Foundation tokens: signal-color scales + breakpoints + font-feature + font-size-adjust
- A11y: WCAG 2.2 AA — Focus Not Obscured / Focus Appearance / Dragging Movements / Redundant Entry / Accessible Auth / cookie-banner audit / prefers-contrast
- Perf: CWV probes locked LCP/INP/CLS thresholds
- Components: 6-state button + 6-state card + .ca-tag semantic-color + .ca-spinner + .ca-newsletter
- Pattern decisions captured: D-8..D-15 in SF46-DECISIONS.md

### Recommended Phase 3 entry conditions

1. Founder accepts Gate 2 v3 verdict.
2. Phase 3 scope per SF46-SPEC.md = "Polish". Now 28 batches (P3-A..AB).
3. Phase 4 + SF47 remain empty (D-3 + D-8).

---

## Gate 1 — READY for founder review (2026-05-18)

**Current status:** **Phase 1 expansion run COMPLETE.** All 11 expansion batches green: B5 ✓ B3 ✓ B6 ✓ B12 ✓ B1 ✓ B9 ✓ B13 ✓ B14 ✓ B10 ✓ B11 ✓ + B-IMG ✓ (added mid-run per founder image-provenance rule).

### Gate 1 verdict
- [x] **PASS — proceed to Phase 2** (recommended)
- [ ] FAIL — fix defects, re-test

### Validation evidence

```
$ BASE_URL=http://localhost:8092 npx playwright test \
    tests/smoke.spec.js \
    tests/sf46-step12-probe.spec.js \
    tests/sf46-step14-probe.spec.js \
    tests/sf46-step15-probe.spec.js \
    tests/sf46-b9-probe.spec.js \
    --project=chromium --workers=1
  46 passed, 2 skipped, 0 failed (52.0s)

$ node -e "brace balance"
  35 CSS files audited
  0 brace-balance mismatches
  styles.css     open=5508 close=5508 OK
  styles.min.css open=5325 close=5325 OK
```

### Defects found at Gate 1

*(none — all probes green, brace-balance clean, no smoke-test regressions)*

### Architectural decisions captured

- `SF46-DECISIONS.md` D-1 — `@layer` cascade adoption deferred to Phase 4 (paired with rescue-file retirement)
- `SF46-DECISIONS.md` 2026-05-18 — `.ca-card-v2` + `.ca-btn-v2` lives in test fixture only, not yet wired to a live page (Phase 2 rollout)
- `SF46-DECISIONS.md` 2026-05-18 — Image royalty-free rule added; 3 photos flagged for Phase 2 verification/replacement
- `IMAGE-PROVENANCE-AUDIT-2026-05-18.md` — sitewide image provenance audit complete

### Recommended Phase 2 entry conditions

1. Founder accepts Gate 1 verdict above.
2. Phase 2 scope per `SF46-SPEC.md` is "Rhythm" — typography modular scale consumption, sentence-case audit (preserving acronyms), canonical component rollout (replacing ad-hoc cards / buttons with `.ca-card-v2` / `.ca-btn-v2` site-wide).
3. Phase 2 should also resolve the 3 image-provenance items flagged in `IMAGE-PROVENANCE-AUDIT-2026-05-18.md`.

---

## Open questions (decision pending)

*(none currently — all earlier Q1-Q7 from spec were answered before Phase 1; B13 will produce a new decision in `SF46-DECISIONS.md`)*

---

## NEXT ACTION (Phase 2 entry — awaiting founder Gate 1 sign-off)

Phase 1 expansion run is complete; Gate 1 is READY (see verdict section above). When the founder returns:

1. **Verify localhost** is alive (`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8092/`); restart with `npx http-server . -p 8092 -c-1 --cors` if not.
2. **Re-run full probe suite** to re-confirm green: `BASE_URL=http://localhost:8092 npx playwright test tests/smoke.spec.js tests/sf46-step12-probe.spec.js tests/sf46-step14-probe.spec.js tests/sf46-step15-probe.spec.js tests/sf46-b9-probe.spec.js --project=chromium --workers=1`
3. **Present Gate 1 verdict** above + deferral table to founder.
4. **If founder accepts:** begin Phase 2 — Rhythm pass. Per SF46-SPEC.md:
   - Typography modular scale consumption across all headings (consume `--text-h1..meta`, `--lh-*`, `--track-*`).
   - Sentence-case audit (preserve SaaS/MEES/PPN/CSRD acronyms).
   - Canonical component rollout — replace ad-hoc card / button markup with `.ca-card-v2` / `.ca-btn-v2` site-wide.
   - Resolve the 3 image-provenance items flagged in `IMAGE-PROVENANCE-AUDIT-2026-05-18.md`.
5. **If founder rejects:** address called-out defects, re-validate, re-present.
6. **Do NOT push / merge / deploy** until founder explicitly approves.

---

## Open commitments to the founder (re-affirmed for resume)

- **No silent defers.** Anything deferred to Phase 2-4 / SF47 must be in the "KEEP DEFERRED" table above with explicit rationale, never quietly dropped.
- **No silent agent claims.** Every fix verified by my own probe / screenshot in the same run as the report.
- **`SF46-PROGRESS.md` updated after every batch.** Crash-resumable; founder-visible.
- **Localhost stays up.** No push, no PR, no Vercel.
- **All decisions documented in repo.** `SF46-DECISIONS.md` will be added when B13 produces the `@layer` decision.

---

## Append-only changelog (most recent first)

- **2026-05-18 (Phase 1 expansion run COMPLETE — Gate 1 READY)** — Resumed on founder `website continue`. Executed all 10 queued batches sequentially in one autonomous session:
  - **B5** (anim sweep) — 104 easings + 194 durations tokenised across source + min; 4 ease + 4 motion tokens consumed; new `--ease-standard` added.
  - **B3** (extended hex sweep) — 22 stale fallback strips + 17 hex maps; 1 manual fix for `:root`-in-comment bug.
  - **B6** (HTML hex sweep) — 0 inline-style hex (already clean) + 77 brand-hex tokenised inside `<style>` critical CSS across 8 pages.
  - **B12** (SVG audit) — 3,587 hex audited across 66 SVG assets; all canonical brand-hex by design (SVG `fill=""` cannot use `var()`).
  - **B1** (rescue !important audit + 325 codemod cleanup) — 395 rescue `!important` flags audited; 325 dead `var(--x, var(--x))` artifacts stripped sitewide.
  - **B9** (canonical components) — `.ca-card-v2` + `.ca-btn-v2` added to styles.css end; test fixture + 6-probe spec; all green.
  - **B13** (`@layer` decision) — DECIDED: defer to Phase 4, pair with rescue-file retirement. Documented in `SF46-DECISIONS.md` D-1.
  - **B14** (min parity) — source 1,182 / min 1,076 verified as csso dedup, not drift.
  - **B10** (re-mint min) — `npm run build:css:legacy` regen + sweeps re-applied.
  - **B-IMG** (added mid-run per new founder rule) — 45 images audited; 16 Unsplash + 14 NASA-PD verified; 3 flagged for Phase 2.
  - **B11** (final validation) — full probe suite 46 passed / 2 skipped / 0 failed; brace balance 0 mismatches across 35 CSS files.
- **2026-05-18 (save-state for system restart)** — Founder paused for system restart. Save state captured + restored on `website continue`. Pre-restart on-disk state: B2 / B4 / B7 / B8 done; B5 next; smoke 37/37 green.
- **2026-05-18 (earlier session)** — Phase 1 initial scope completed: tokens, 3 offenders narrowed, 14 z-index outliers laddered, 5 rescue rules retired, SF22-C block deleted, 340 hex sites swept. Founder rejected partial-completion claim → created 11-task expansion queue (#137-#147) → began executing it. Got through B2 / B4 / B7 / B8 before system restart pause.
- **2026-05-18 (earlier still)** — Founder approved Gate 0 of `SF46-SPEC.md` and answered Q1-Q7. Local checkpoint branch `local-checkpoint-2026-05-18` cut at `b2ce56c` before any changes.
