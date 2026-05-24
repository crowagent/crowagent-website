# SF46 — Architectural Rearchitecture Spec

**Status**: DRAFT — awaiting founder approval.
**Author**: Claude (Staff Frontend Architect role).
**Date**: 2026-05-18.
**Branch**: `local-checkpoint-2026-05-18` is the restore point.
**Localhost**: http://localhost:8092 (kept alive throughout).

---

## 0. Founder hard rules (the contract)

Every line of this spec lives under these constraints. Memory: `feedback_sf46_rearchitecture_charter.md`.

1. Spec-driven — this document approved BEFORE any code changes.
2. Local-only until founder approves push.
3. Preserve every `js-`/`sf*-`/`data-*` class and attribute.
4. GSAP layout safety — no display-mode changes on transform-animated elements.
5. Fluid units only (`clamp()`); no raw `120px`.
6. Z-index uses the token ladder; nav/cookie/modal stay top of stack.
7. Validate every phase against Playwright `tests/smoke.spec.js`. Red = rollback.
8. Plan → Research → Act → Validate every change.
9. Cleanup the rescue files as part of the work.
10. I run probes/screenshots myself; no silent agent claims.
11. Stripe / Apple / Google quality bar — sentence case, fluid type, multi-layer shadows, engineered tracking.
12. Strategic root-cause, not patches.

---

## 1. Current state — measured baseline

Measured directly from the codebase 2026-05-18.

### 1.1 `!important` inventory

| File | `!important` count |
|------|-------------------:|
| styles.css | 1181 |
| styles.min.css | 1089 (mirror) |
| nav-footer-sf21.css | 188 |
| page-fixes-sf22.css | 64 |
| page-archetype-unify.css | 64 |
| pricing-sf16.css | 56 |
| hero-split.css | 50 |
| consistency-sf41.css | 42 |
| faq-page.css | 37 |
| print.css | 18 |
| contact-page.css | 15 |
| page-motion-bg.css | 13 |
| blog-article.css | 13 |
| resources-sf21.css | 8 |
| pricing-extras.css | 8 |
| terms-page.css | 6 |
| motion-system.css | 6 |
| privacy-page.css | 5 |
| page-styles.css | 5 |
| always-playing-sf23.css | 3 |
| cookies-page.css | 2 |
| security-page.css | 1 |
| **Total** | **2,874** |

### 1.2 Z-index registry — current chaos

| z-index | Source | Notes |
|--------:|--------|-------|
| 2,147,483,646 | styles.css:19727 | Max int32 - 1. **Clear bug.** |
| 100,050 | `#cookie-banner` literal | But token says `--z-cookie: 1150`. Literal wins. |
| 99,999 | `.skip-link`, `.locale-dropdown`, 6 others | 6 conflicting rules. |
| 10,000 | unnamed overlay | Exceeds modal tier. |
| 9,999 | `.skip-link`, `.skip-to-content`, etc. | 8 rules. Plus `js/cookie-banner.js` injects inline `z-index: 9999`. |
| 9,998 | unknown | Mobile menu backdrop. |
| 9,000 | `.mobile-sticky-cta` | |
| 2,001 / 2,000 | `.term::before / ::after` | Tooltip. |
| 1,000 | `.overlay`, `.hero-footer-deco` | Generic. |
| 300 | `.nav-mega` | ✓ Via `--z-mega: 300`. |
| 210 | `.announce-bar` | ✓ Via `--z-announce`. |
| 200 | `nav`, `.nav-dropdown` | ✓ Via `--z-nav`. |
| 90 | back-to-top | ✓ Via `--z-banner`. |
| -1 to -10 | 10+ decorative selectors | Risk of invisibility bugs. |

**3 competing cookie-banner z-indexes** (100050 CSS, 1150 token, 9999 inline JS) is the worst.

### 1.3 Hardcoded hex outside tokens

| Hex | Count | Recommended token |
|-----|------:|-------------------|
| `#FFFFFF` | 10+ | New `--white` token |
| `#00D4AA` | 4 | `var(--teal)` (canonical is `#0CC9A8`) |
| `#10DFBB` | 2 | `var(--teal)` |
| `#0A1F3A` in `.logo-box` | 4 | `var(--surf)` |

Other occurrences are fallback defaults in `var(--token, #hex)` patterns — acceptable.

### 1.4 Rescue file map

7 RESCUE files containing 478 `!important` flags between them:

| File | `!important` | Purpose stated |
|------|-------------:|----------------|
| nav-footer-sf21.css | 188 | Nav/footer regression fixes |
| page-fixes-sf22.css | 64 | About/contact/security overlap, bullet+button rescue |
| page-archetype-unify.css | 64 | 13-page hero consistency |
| pricing-sf16.css | 56 | Popular card differentiation |
| consistency-sf41.css | 42 | Eyebrow/card/CTA/lead unification |
| resources-sf21.css | 8 | Resources page brightness |
| (in page-styles.css) | 5 | Mixed |

### 1.5 Load-bearing JS hooks (must not break)

**GSAP transform-matrix animations (CRITICAL — changing `display` mode breaks these)**:
- `.story-visual`, `.story-visual-wrap`, `.story-step` — sticky storytelling pin + scale/rotateX/y
- `.hero-eyebrow`, `.hero h1`, `.hero-sub`, `.hero-btns`, `.hero-trust`, `.hero-visual` — staggered entrance y/opacity/scale
- `.hero-earth-img` — scroll-driven scale
- `.crow-carousel-track` — `transform: translateX()`
- `.parallax-orb` — y translate on scroll
- `[data-magnetic]` — cursor-follow x/y
- `.ptab-indicator` — CSS transform animation

**Reveal / intersection hooks**:
- `.reveal`, `.fade-in`, `.fade-in-up`, `.is-visible`, `.sf17-reveal`, `.ms-reveal`, `.ms-in`

**Click / event hooks**:
- `.mob-menu`, `.nav-dropdown`, `.nav-dropdown-trigger`, `.nav-mega`, `.ham`
- All `data-csrd-step`, `data-plan-tier`, `data-magnetic`, `data-visual`, `data-step`, `data-ms-scene`, `data-parallax-speed`, `data-action`

### 1.6 Test surface

165 baseline tests across:
- `tests/smoke.spec.js` — 25 tests
- `tests/responsive.spec.js` — 72 (8 viewports × 9 pages)
- `tests/accessibility.spec.js` — 14
- `tests/e2e-3g-perf.spec.js` — 1
- `tests/unit/*.test.js` — 53

**Gaps**:
- No visual regression baselines (scaffolded but empty).
- No cross-browser test files (Firefox/WebKit projects configured but empty).
- No `prefers-reduced-motion` assertions.
- No touch-target (44×44) checks.
- No theme-switch assertions.

---

## 2. Target end-state

```
crowagent-website/
├── crowagent-design-tokens.css   ← single source of truth: colour, type, spacing,
│                                   radius, z-index, motion, shadow, icon-size
├── crowagent-components.css      ← single set of canonical components: .btn .eyebrow
│                                   .card .hero .list .table — no !important
├── crowagent-archetypes.css      ← four thin templates: landing / product / legal /
│                                   info — grid + section rhythm
├── styles.css                    ← legacy global rules cleaned of !important + hex,
│                                   reduced ~30 percent in size
├── styles.min.css                ← rebuilt minified mirror
├── Assets/css/
│   ├── motion-system.css         ← retained, untouched (tokens for animation)
│   ├── always-playing-sf23.css   ← retained (animation only)
│   ├── page-motion-bg.css        ← retained (decorative background)
│   ├── hero-split.css            ← retained for homepage (loads only on /)
│   ├── (page-scoped files)       ← privacy, terms, cookies, security, faq, etc.
│   │                                trimmed of !important now that upstream is clean
│   ├── (component files)         ← blog-article, product-walkthrough, product-hero,
│   │                                tool-page, intel-tracker — kept
│   └── (RESCUE FILES DELETED)    ← page-fixes-sf22, consistency-sf41,
│                                   page-archetype-unify, pricing-sf16, resources-sf21,
│                                   nav-footer-sf21 — their rules either fold into
│                                   components/archetypes or get deleted when upstream
│                                   is tightened.
└── (all other files unchanged)
```

**End-state metrics target**:
- `!important` total: ≤ 100 (was 2,874) — 96 percent reduction.
- Rescue files: 0 (was 7).
- Hardcoded hex outside fallbacks: 0 (was 16 confirmed rogues).
- Z-index outliers: 0 (no values above 1,200; nothing at 2,147,483,646).
- Smoke tests passing: 25 / 25.
- Visual regression baselines: created for the 25 most-visited surfaces.

---

## 3. Execution plan — four phases

Each phase: **Research → Plan → Act → Validate → Cleanup**.
A phase is only "complete" when (a) smoke suite is 25/25, (b) I've run a screenshot probe myself, (c) the rescue-file `!important` count went DOWN.

### Phase 1 — Foundation: tokens & specificity reset

**Goal**: untangle the specificity wars without breaking layout.

**Files in scope**:
- `crowagent-brand-tokens.css` (extend, rename to `crowagent-design-tokens.css`)
- `styles.css` + `styles.min.css` (identify and tighten the upstream offenders)
- 4 known rogue hex codes to convert
- z-index outliers to normalise

**Specific actions**:

1.1 **Token consolidation**. Add missing tokens:
   - `--white: #FFFFFF`
   - `--space-1` through `--space-32` (8-point grid, fluid)
   - `--section-y-hero`, `--section-y-primary`, `--section-y-secondary` (fluid clamps)
   - `--text-h1`, `--text-h2`, `--text-h3`, `--text-body`, `--text-eyebrow` (modular scale)
   - `--shadow-soft-1`, `--shadow-soft-2`, `--shadow-ambient-1`, `--shadow-ambient-2` (multi-layer)
   - `--ease-out`, `--ease-in-out`, `--ease-spring` (canonical motion curves)
   - `--btn-h-lg: 52px`, `--btn-h-md: 44px`, `--btn-h-sm: 36px`, `--btn-radius: 10px`

1.2 **Tighten upstream specificity offenders** (the 4 root-cause rules SF44 documented but didn't fix):
   - `body.f8-legal main a:not(.btn):not(.skip-link)` → replace with prose-scoped selectors
   - `body.f8-page main a:not(.btn)` (if exists) → same treatment
   - `[class*="source"]` → tighten to `[class*="source-citation"], [class*="-source"]:not([class*="resource"])`
   - `body.f8-page figure img { max-height !important }` → tighten to `.photo-hero img, .photo-inline img, .blog-hero img`

1.3 **Convert 4 rogue hex values to tokens** (16 occurrences):
   - `#00D4AA`, `#10DFBB`, hardcoded `#FFFFFF`, hardcoded `#0A1F3A` in `.logo-box`

1.4 **Z-index normalisation**:
   - Delete `z-index: 2147483646` (the bug)
   - Cookie banner: single source (use `--z-cookie: 1150` everywhere)
   - Audit all `z-index: 9999` rules — replace with appropriate token tier
   - Mobile menu backdrop standardised against ladder

**Removable downstream `!important` after Phase 1**: estimated 80-120 flags.

**Validation**: smoke 25/25 + screenshot pass on 5 hero pages.

**Rollback path**: `git reset --hard local-checkpoint-2026-05-18`.

### Phase 2 — Structural rhythm: spacing, typography, breathing room

**Goal**: Stripe-grade vertical rhythm + typography modular scale.

**Files in scope**:
- `crowagent-design-tokens.css` (extend with spacing scale)
- New `crowagent-components.css` (canonical `.btn`, `.eyebrow`, `.card`, `.list`, `.table`)
- Selected pages migrated to consume new components

**Specific actions**:

2.1 **Vertical rhythm**:
   - Adopt single spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128.
   - Section padding: `clamp(64px, 8vw, 120px)` for primary, `clamp(48px, 6vw, 80px)` for secondary.
   - Replace every hardcoded `margin-top: 56px` style rule with tokens.

2.2 **Typography modular scale** (1.250 ratio, mobile-base 14px → desktop 16px):
   - h1: `clamp(2.5rem, 5vw, 4rem)` line-height 1.05 letter-spacing -0.03em
   - h2: `clamp(1.875rem, 3.5vw, 2.5rem)` line-height 1.1
   - h3: `clamp(1.5rem, 2.5vw, 1.875rem)` line-height 1.2
   - body: `clamp(1rem, 1.2vw, 1.125rem)` line-height 1.65
   - eyebrow: 11.5px uppercase 0.14em tracking weight 700

2.3 **Convert any "Capitalize Every Word" heading to sentence case** (audit + edit).

2.4 **Canonical components in `crowagent-components.css`**:
   - `.btn` with size modifiers (`-sm`, `-md`, `-lg`), variant modifiers (`-primary`, `-secondary`, `-ghost`), no `!important`.
   - `.eyebrow` (consolidates 11 chip classes).
   - `.card` with surface modifiers.
   - `.list` (canonical bulleted/numbered lists with mobile-safe flex pattern).
   - `.table` + `.table-responsive` wrapper.

2.5 **Alignment fixes**:
   - `.sh.center .sh-label` hanging-label bug.
   - Bullet list mobile wrapping (already done — verify hold).

**Removable downstream `!important` after Phase 2**: estimated 150-200 flags. Begin retiring `consistency-sf41.css`, `page-archetype-unify.css`.

**Validation**: smoke 25/25 + visual regression baselines created for 25 routes.

### Phase 3 — Visual polish & depth

**Goal**: Stripe-level micro-interactions + ambient depth.

**Files in scope**:
- `crowagent-design-tokens.css` (extend with shadow + motion tokens)
- `crowagent-components.css` (apply tokens to cards/buttons)
- `js/modules/sf17-scroll-reveal.js` (motion update — preserve `.sf17-reveal` class name)

**Specific actions**:

3.1 **Multi-layer ambient shadows** on primary cards + buttons:
   ```css
   --shadow-card-rest:
     0 1px 0 0 rgba(255,255,255,0.04) inset,
     0 1px 3px 0 rgba(0,0,0,0.3),
     0 8px 24px -8px rgba(0,0,0,0.4);
   --shadow-card-hover:
     0 1px 0 0 rgba(255,255,255,0.06) inset,
     0 2px 6px 0 rgba(0,0,0,0.35),
     0 16px 40px -12px rgba(0,0,0,0.5),
     0 0 0 1px rgba(12,201,168,0.15);
   ```

3.2 **Specular edge lighting** on dark-mode cards via translucent gradient border:
   ```css
   .card { position: relative; }
   .card::before {
     content: ""; position: absolute; inset: 0; border-radius: inherit;
     padding: 1px; pointer-events: none;
     background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent 40%);
     -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
     -webkit-mask-composite: xor; mask-composite: exclude;
   }
   ```

3.3 **Cinematic reveal upgrade** — `.sf17-reveal` class kept. CSS updated:
   ```css
   .sf17-reveal {
     opacity: 0;
     filter: blur(8px);
     transform: scale(0.98) translateY(20px);
     transition: opacity .8s var(--ease-out),
                 filter .8s var(--ease-out),
                 transform .8s var(--ease-out);
   }
   .sf17-reveal.is-visible {
     opacity: 1; filter: blur(0); transform: scale(1) translateY(0);
   }
   @media (prefers-reduced-motion: reduce) {
     .sf17-reveal, .sf17-reveal.is-visible {
       opacity: 1 !important; filter: none; transform: none; transition: none;
     }
   }
   ```

3.4 **Engineered tracking on labels**:
   - Eyebrow / section-label: `font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;`
   - Done in `.eyebrow` component (Phase 2).

**Removable downstream `!important` after Phase 3**: estimated 60-100 flags.

**Validation**: smoke 25/25 + reduced-motion test + visual regression diff ≤ 5 percent on 25 routes.

### Phase 4 — Consistency, cleanup, retirement

**Goal**: retire rescue files; close loops; lock in via tests.

**Files in scope**:
- All 7 rescue files (delete or empty)
- All page-scoped files (trim `!important` now that upstream is clean)
- New tests for visual regression + reduced-motion + touch-target

**Specific actions**:

4.1 **Icon geometry**:
   - All inline `<svg>` audit: standardise `stroke-width="1.5"` for chrome icons, `stroke-width="2"` for feature icons.
   - viewBox normalised to `0 0 24 24` where possible.

4.2 **Table modernisation**:
   - `.comparison-table` + `.reg-table` consolidate to single `.table` style.
   - All wrapped in `.table-responsive` for mobile scroll.

4.3 **Rescue-file retirement** (delete or shrink):
   - `consistency-sf41.css` → folded into `crowagent-components.css` + deleted.
   - `page-archetype-unify.css` → folded into `crowagent-archetypes.css` + deleted.
   - `page-fixes-sf22.css` → most rules fold up; residue ≤ 20 lines + renamed `page-fixes-2026.css`.
   - `pricing-sf16.css` → folded into `Assets/css/pricing-page.css` (new) with no `!important`.
   - `resources-sf21.css` → folded into `Assets/css/resources-page.css` with no `!important`.
   - `nav-footer-sf21.css` → folded into `Assets/css/nav.css` + `Assets/css/footer.css` with no `!important`.

4.4 **New test coverage**:
   - `tests/visual-regression/*.spec.js` — pixel-diff baselines for 25 surfaces.
   - `tests/reduced-motion.spec.js` — assert `.sf17-reveal` static under `reduce`.
   - `tests/touch-targets.spec.js` — 44×44 minimum on every interactive element at 375px.

4.5 **Final probe** — `!important` total should be ≤ 100. Hardcoded hex (non-fallback) = 0. Z-index outliers = 0.

**Validation**: full test matrix passes. Founder visual approval on every archetype.

---

## 4. Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Removing `body.f8-legal main a:not(.btn)` regresses link colour on /privacy /terms /cookies | Medium | High | Replace with prose-scoped selector before deletion; test each page; rollback if a single anchor turns invisible. |
| R2 | Removing `[class*="source"]` regresses `.resources-hero` (already a known bug) | Low | Medium | Already partially fixed; full fix in Phase 1. Test resources page after. |
| R3 | Changing `display` mode on a `.hero-*` class breaks GSAP staggered entrance | Medium | High | Forbidden by rule 4. Wrap in new div when flex needed. |
| R4 | Z-index normalisation hides cookie banner | Low | Critical | Cookie banner stays at `--z-cookie: 1150`; modal at 1100; nothing exceeds modal except toast. |
| R5 | Reveal blur upgrade causes layout shift on first paint | Medium | Medium | `transform: scale(0.98)` is compositor-only — no layout shift. Verify with smoke test. |
| R6 | Visual regression baselines drift from intentional changes | High | Low | Baselines re-generated on each phase commit; founder approval required before lock. |
| R7 | Minified `styles.min.css` not regenerated after styles.css edit | High | Medium | Document the regeneration step; verify via grep after every edit. |
| R8 | Rescue file deletion breaks one page in a way the smoke test doesn't catch | Medium | High | Visual regression baselines + manual founder sign-off before each rescue file deletion. |

---

## 5. Validation matrix

| Checkpoint | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------------|:------:|:------:|:------:|:------:|
| `tests/smoke.spec.js` 25/25 | ✓ | ✓ | ✓ | ✓ |
| `tests/responsive.spec.js` 72/72 | ✓ | ✓ | ✓ | ✓ |
| `tests/accessibility.spec.js` 14/14 | ✓ | ✓ | ✓ | ✓ |
| `tests/e2e-3g-perf.spec.js` | ✓ | ✓ | ✓ | ✓ |
| Visual regression baselines | created | refreshed | refreshed | locked |
| `!important` count audited | < 2,500 | < 1,500 | < 500 | ≤ 100 |
| Rescue files count | 7 | 5 | 3 | 0 |
| Founder sign-off on screenshots | yes | yes | yes | yes |

---

## 6. Approval gates (founder Y/N at each)

- [ ] **Gate 0**: spec approved before any code. (This document.)
- [ ] **Gate 1**: Phase 1 complete + founder sees screenshots + smoke green. Approve Phase 2.
- [ ] **Gate 2**: Phase 2 complete + founder visual review + baselines locked. Approve Phase 3.
- [ ] **Gate 3**: Phase 3 complete + reduced-motion verified + visual diff ≤ 5 percent. Approve Phase 4.
- [ ] **Gate 4**: Phase 4 complete + all rescue files retired + full test matrix green. Approve push to staging branch.
- [ ] **Gate 5**: Staging review. Approve push to production.

**NO push beyond local until Gate 5.**

---

## 7. Open questions for founder

Need answers before I start Phase 1:

**Q1** — Sentence case audit: do you want EVERY heading on every page reviewed and lowercased, or just the new components? Audit could find 50-100 headings to change.

**Q2** — Reveal animation: founder preference on the blur intensity. The spec defaults to `blur(8px)` matching Stripe; some prefer `blur(4px)` for subtlety. Tell me your preference.

**Q3** — Eyebrow tracking: spec defaults to `letter-spacing: 0.12em` (Stripe-ish). Apple uses tighter `0.08em`. Pick one.

**Q4** — Card edge lighting: Phase 3.2 specular highlight is striking but visible. Do you want it on every card, only "premium" cards, or only on hover?

**Q5** — Phase 4 rescue file deletion: do you want all 7 deleted in one commit per file (clean history), or batched (faster session)?

**Q6** — Test coverage: am I authorised to add 3 new test files (visual regression, reduced-motion, touch-target)? They will increase smoke run time by ~30 percent but lock in regressions.

**Q7** — Out-of-scope confirmation: are any of these explicitly NOT in scope right now?
- Full scripts.min.js bundle split (P1f) — currently safer-path guarded init.
- Light mode UI toggle wiring (TH1 stub already added).
- Cross-browser test suite population.

---

## 8. Time estimate

| Phase | Optimistic | Realistic | Pessimistic |
|-------|-----------|-----------|-------------|
| Phase 1 — foundation | 2 hours | 4 hours | 6 hours |
| Phase 2 — rhythm | 3 hours | 6 hours | 10 hours |
| Phase 3 — polish | 2 hours | 4 hours | 6 hours |
| Phase 4 — cleanup | 2 hours | 4 hours | 8 hours |
| **Total** | **9 hours** | **18 hours** | **30 hours** |

This is a 1-3 day project depending on what surfaces during validation. The localhost stays alive throughout.

---

## 9. Deliverables on completion

- `crowagent-design-tokens.css`, `crowagent-components.css`, `crowagent-archetypes.css` files in repo.
- 7 rescue files retired / folded.
- `!important` reduced from 2,874 → ≤ 100.
- Hardcoded rogue hex eliminated.
- Z-index ladder consistent (no values above 1,200, no `2147483646` bug).
- Visual regression baselines for 25 surfaces.
- 3 new test files (visual / reduced-motion / touch-target).
- This spec file marked **COMPLETE** with measured before/after metrics.
- A SF46-RETROSPECTIVE.md documenting what was harder than expected, what to do next.

---

## END OF SPEC — awaiting founder answers to Q1-Q7 and Gate 0 approval.
