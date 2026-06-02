# ROOT CAUSE ANALYSIS — Phase 1
**Date:** 2026-05-21
**Source:** synthesis of 8 audit reports in `/audit/`

The 100 defects in `/audit/MASTER-DEFECT-TRACKER.md` reduce to **10 systemic root causes**. Fixing the root causes eliminates whole clusters of symptoms in one stroke.

## RC-1 — Two-character typo: `var(----foo)` should be `var(--foo)`
**Symptoms it produced:** D-1 (749 broken refs), D-2 (typography drift — most "drift" was just tokens evaluating to `unset` and inheriting body font-size), partial UI-01 (footer header 32px instead of 12px because the size token didn't apply), ARCH-2.
**Why it happened:** Likely a regex find/replace in an early sprint that prefixed `--` to already-prefixed `--font-size-xs` etc.
**Fix applied:** Single `sed` replacement across all author CSS — 749 sites repaired in one mechanical edit. **Resolved.**

## RC-2 — SF-wave layering without retirement protocol
**Symptoms:** UI-08, UI-09, UI-16, C-1 (72 card families), C-2 (56 button families), C-3, C-4, C-6, C-8, C-9, ARCH-1, ARCH-3 (2,712 !important), ARCH-11, D-6.
**Why it happened:** Each sprint (SF10..SF46) added a new CSS file/block without deleting predecessors; the team chose forward-additive change as a way to avoid regression risk. Net effect: 33,027-line single styles.css + 33 separate Assets/css/*.css files, with overlapping selectors fighting via `!important`.
**Fix queued:** Audit each `-card` / `*btn*` family for HTML use. Delete selectors with zero references. Use the brand-tokens layer to provide canonical sizes. Estimated work: ~8 hours for safe cleanup with backup; full modularisation a multi-day effort.

## RC-3 — Two parallel render paths for shared chrome (nav + footer + cookie banner)
**Symptoms:** UI-02 (dual trust rows), UI-03 (wordmark drift), UI-04 (404 unstyled), UI-13 (cookie banner overlap), A-1 (footer inline-style violation), ARCH-13, RESP-03, SMOKE-1..4, partial UI-10.
**Why it happened:** Some pages still ship hard-coded `<header>`/`<footer>` HTML; others rely on `js/nav-inject.js`. When the injector is the source of truth but the page also ships HTML, two versions render. When the injector fails (404 page), no fallback exists.
**Fix applied (partial):** 404 fallback CSS added; cookie banner pointer-events corrected; chatbot z-index fixed. **Full single-render-path consolidation queued** as a refactor task.

## RC-4 — Cookie banner has no layout reservation
**Symptoms:** UI-13, RESP-03, SMOKE-1..4, partial UI-10.
**Why it happened:** `cookie-banner.js` injects a `position: fixed` element without updating any body padding-bottom variable. So the banner always covers the final 100-180px of content.
**Fix applied:** `body.has-cookie-banner { padding-bottom: var(--ca-cookie-banner-h, 6rem) }` rule added; chatbot z-index raised to 1201. **Resolved at CSS level.** True fix would have `cookie-banner.js` set `--ca-cookie-banner-h` dynamically based on actual banner height.

## RC-5 — Mobile breakpoint clamps don't reach m320
**Symptoms:** RESP-01 (CrowAgent Core H1 clips on 320), RESP-04, RESP-05, RESP-06, RESP-07, RESP-08, RESP-09, RESP-13.
**Why it happened:** H1 / H2 clamps use `clamp(28px, 5vw, 40px)` patterns that resolve to ~40px on viewports where the column can only fit 16-20px characters. Combined with `word-break: keep-all` on a couple of headings, you get clipped or 6-line headings.
**Fix applied:** New `@media (max-width: 480px)` block overrides hero headings to `clamp(1.625rem, 7.5vw, 2.25rem)`, removes `word-break: keep-all`, sets `overflow-wrap: anywhere`. **Resolved at CSS level.**

## RC-6 — Hero archetype not enforced across page types
**Symptoms:** UI-05 (six different product hero backgrounds), UI-12 (duplicated nav+rail), UI-14 (intel pages different archetype), RESP-01, RESP-02, RESP-08.
**Why it happened:** Multiple SF waves added new hero patterns (hero-split, hero-product-sf18, hero-method, hero-intel) without a central registry. Each product page made its own decision.
**Fix queued:** Define one canonical `.sv-hero` archetype with documented modifiers (`--photo`, `--gradient`, `--mock`). Migrate all six product pages, two intel pages, all blog/glossary heroes onto the single primitive.

## RC-7 — No card / button component registry
**Symptoms:** UI-08, UI-09, UI-16, C-1, C-2, C-5, C-7, C-8, C-11.
**Why it happened:** Storybook-equivalent design-system index was never built. Anyone shipping a new section invents a new card class.
**Fix queued:** Build `/docs/components.md` (or equivalent) listing the canonical .sv-* primitives + their modifiers. Mark every legacy class as `@deprecated` in CSS comments. Future PRs that introduce a new card class without registry update fail review.

## RC-8 — Per-product palette never finalised
**Symptoms:** UI-05, UI-16, partial UI-08.
**Why it happened:** The team explored both "monochrome teal everywhere" (Stripe pattern) and "per-product accent colour" (Linear pattern) but never picked. Result: cards have per-product accents, but the rest of the product page is monochrome teal — creating visual inconsistency.
**Fix queued:** Founder decision needed: pick one. Apply consistently across hero, eyebrow chip, card accent, CTA, icon, badge.

## RC-9 — Inline styles + injected stylesheet conflicts
**Symptoms:** D-10 (73 inline `style=""`), P-9 (129 inline styles on index alone), A-1 (footer h3 inline-style violation triggers axe `avoid-inline-spacing`), partial cascade headaches.
**Why it happened:** Quick-fix patches were added inline rather than as proper class additions. Then when proper CSS was added later, the inline styles still won and the new CSS appeared "broken".
**Fix queued:** Sed-sweep for `style="font-size:` / `style="margin:` / `style="padding:` in HTML, convert to one-off utility classes or extend existing component variants.

## RC-10 — Build process versioning drift
**Symptoms:** P-2 (broken preload), P-10 (service worker precache out of sync), ARCH-9 (some pages load styles.css and some styles.min.css), inconsistent `?v=N` cache-busting across the 46 link tags.
**Why it happened:** Manual edits to `<link>` cache-bust versions never propagated; `service-worker.js` precache list maintained separately from HTML; the build pipeline has multiple modes (`build:css`, `build:css:legacy`, `build:css:purge`).
**Fix applied (partial):** Broken `/js/scripts.min.js` preload removed from 23 pages.
**Fix queued:** Single source of truth for cache-bust version (env var or build-time injection); SW precache generated from HTML scan; unify on `build:css:legacy` as the canonical pipeline.

## Composition: each defect mapped to its root cause

The mapping is documented in `/audit/MASTER-DEFECT-TRACKER.md` §10 — see "ROOT-CAUSE GROUPING" table.

## Order of attack (Phase 3 sequencing)

By inverse cost-of-fix vs. coverage:

1. RC-1 (1 mechanical sed → resolves D-1 + partial of 8 other defects) ✅ DONE
2. RC-4 (1 CSS rule → resolves UI-13, RESP-03, partial UI-10) ✅ DONE
3. RC-5 (one @media block → resolves RESP-01, RESP-04..08, RESP-13) ✅ DONE
4. RC-10 (single sed + SW version bump → resolves P-2, P-10, partial of ARCH-9) ✅ partial DONE
5. RC-3 (404 fallback CSS → resolves UI-04, partial UI-02, UI-03) ✅ DONE
6. RC-9 (inline-style sweep → resolves D-10, P-9, A-1) — QUEUED
7. RC-2 (legacy CSS retirement → resolves 25+ defects) — QUEUED, multi-pass
8. RC-6 (hero archetype unification) — QUEUED, ~4 hours
9. RC-7 (component registry + deprecation) — QUEUED, needs design lead
10. RC-8 (palette decision) — QUEUED, needs founder sign-off
