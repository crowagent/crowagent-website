# SF46 Phase 2 — Rhythm pass

**Status:** in flight (started 2026-05-19 after founder approval).
**Predecessor:** Phase 1 Gate 1 v2 PASSED — 67 tests green; G1-G5 premium-foundation tokens shipped.
**Phase 2 entry condition:** Phase 1 fully validated. ✓
**Charter:** `feedback_sf46_rearchitecture_charter`, `feedback_no_phase4_sf47_parking_2026_05_19`, `feedback_no_compromise`.

---

## Goal

Phase 1 delivered the **tokens**. Phase 2 delivers the **consumption** — heading scale, sentence case, canonical components — plus the a11y + perf foundation items promoted from old Phase 4 / SF47. After Phase 2 the site reads as Stripe/Apple-grade premium across every page archetype.

---

## Execution order (with rationale)

1. **P2-G** Late-cascade `:root` radius consolidation *(start here — quick foundation cleanup)*
2. **P2-F** Font preload + `font-display: swap` audit *(small, independent, pairs with G5)*
3. **P2-A** Typography modular scale consumption *(largest scope; depends on G-clean base)*
4. **P2-B** Sentence-case audit *(pairs with P2-A; same files)*
5. **P2-C** Canonical-component rollout *(depends on P2-A/B providing clean typography to compose with)*
6. **P2-E** Reduced-motion + touch-target test coverage *(validates the work; pairs with G4 baseline)*
7. **P2-D** 3 image provenance items *(final content task)*

Each batch ends with brace-balance check + Playwright probe re-run + `SF46-PROGRESS.md` ledger update.

---

## Per-batch acceptance criteria

### P2-G — Late-cascade :root radius consolidation
**What:** Delete the duplicate `--radius-*` declarations in `styles.css` `:root` blocks at lines 15470 (cinematic) + 26020 (SF15 region). Brand-tokens.css becomes the single source of truth for the radius ladder.
**Validation:**
- `tools/sf46-g1-g5-probe.spec.js` G1 tests still 8/8 green
- Brace balance OK after edit
- Smoke 25/25 green (no visual regression on cards/inputs that use these tokens)

### P2-F — Font preload + font-display: swap audit
**What:** Every HTML page must:
- Preload Inter + Plus Jakarta Sans WOFF2 files (`<link rel="preload" as="font" type="font/woff2" crossorigin>`)
- Use `font-display: swap` on every `@font-face` rule
**Output:** `crowagent-website/PHASE2-FONT-AUDIT-2026-05-19.md` listing before/after state.
**Validation:** New probe `tests/sf46-p2f-fonts.spec.js` asserts (a) at least one font preload exists in `<head>`, (b) `<link>` to Google Fonts uses `display=swap`.

### P2-A — Typography modular scale consumption
**What:** Replace hardcoded `font-size: 36px`, `font-size: 1.5rem`, ad-hoc `line-height: 1.4`, ad-hoc `letter-spacing: -0.02em` etc. on **heading selectors only** (`h1, h2, h3, h4, .hero h1, .page-title, .sh-title, ...`) with the Phase 1 typography tokens (`--text-h1..meta`, `--lh-*`, `--track-*`). Body text + small UI text stays untouched (Phase 3 polish scope).
**Tooling:** `tools/sf46-p2a-type-sweep.js` — find heading selectors, swap declarations to tokens. Dry-run + apply pattern.
**Validation:** New probe `tests/sf46-p2a-typography.spec.js` asserts H1 on `/` resolves to within `--text-h1` clamp range, H2 within `--text-h2`, etc.

### P2-B — Sentence-case audit
**What:** Audit visible heading text site-wide; convert Title Case to sentence case while preserving acronyms.
**Acronym preserve-list:** SaaS, MEES, PPN, CSRD, VSME, ESG, EPC, NHS, SME, ROI, KPI, GHG, ISO, GDPR, CIS, AML, KYC, CrowAgent, CrowMark, CrowCash, CrowCyber, CrowESG, UK, EU, US, AI, API.
**Output:** `crowagent-website/PHASE2-SENTENCE-CASE-AUDIT-2026-05-19.md` with before/after table.
**Validation:** Manual visual review + smoke test (page-load assertions don't depend on capitalisation).

### P2-C — Canonical-component rollout
**What:** Pick one high-traffic page (`/about.html` or `/contact.html`) and replace ad-hoc buttons with `.ca-btn-v2` + ad-hoc cards with `.ca-card-v2`. Validate visual parity (Playwright screenshot diff). Expand to all `Wave 2-4` pages incrementally.
**Validation:** Existing B9 probe still 6/6 green; new probe `tests/sf46-p2c-rollout.spec.js` asserts at least N pages contain `.ca-btn-v2` / `.ca-card-v2` selectors.

### P2-E — Reduced-motion + touch-target test coverage
**What:** Extend Playwright fleet with:
- `tests/sf46-a11y-reduced-motion.spec.js` — set browser context to `reducedMotion: 'reduce'`, navigate to every page archetype, assert all elements with `transition` or `animation` have computed-duration ≤ 1ms.
- `tests/sf46-a11y-touch-targets.spec.js` — for every `button`, `a`, `input[type=button]`, `[role=button]` on each archetype page, assert `getBoundingClientRect()` width ≥ 44px AND height ≥ 44px (WCAG 2.5.5).
**Validation:** Both specs added; tests green or surface real a11y defects to fix in same batch.

### P2-D — 3 image provenance items
**What:** For each of `hero-london-uk-compliance.*`, `faq-multi-person-team.*`, `faq-notebook.*`:
- Attempt reverse-image-search (manual via founder OR best-effort Unsplash search by visual description)
- If Unsplash source found: backfill `_manifest.json` with full attribution
- Otherwise: download a comparable Unsplash image, run `scripts/build-webp.js` + `scripts/build-avif.js` to regenerate variants, update `_manifest.json`
**Validation:** Update `IMAGE-PROVENANCE-AUDIT-2026-05-18.md` § "needs verification" rows → "verified" with new manifest entries.

---

## Phase 2 Gate 2 criteria

Phase 2 is COMPLETE when:
1. All 7 batches green (per-batch criteria above all met)
2. Full regression suite (smoke + step12-15 + b9 + g1-g5 + new p2* probes) all green
3. `SF46-PROGRESS.md` deferral table is empty for Phase 2 column (P2-A..G all marked done)
4. Zero new circular vars / cascade bugs introduced
5. Brace-balance check 0 mismatches across all CSS files
6. `SF46-DECISIONS.md` updated with any non-trivial decisions made along the way
7. Founder sign-off for Phase 3 entry

---

## Tracking

Update `SF46-PROGRESS.md` step ledger after EVERY batch. Append-only changelog at bottom. No silent skips, no silent deferrals.
