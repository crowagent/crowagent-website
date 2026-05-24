# Frontend Architecture Review — Forensic Audit

**Date:** 2026-05-21
**Scope:** `styles.css` (33,027 lines), `Assets/css/*.css` (32 files / 13,582 lines), HTML stylesheet links, `_archive/`, `.bak` artefacts.
**Mode:** READ-ONLY.

The website has been through a Sovereign Design System migration that *partially* succeeded. The new layered architecture is well-conceived (`@layer legacy, theme, base, components, layout, overrides`) but the **legacy layer still holds the vast majority of rules** and contains a P0 bug class that disables a huge fraction of typography. The architecture is sound; the cleanup discipline isn't.

---

## Finding A-1 — CRITICAL — `styles.css` is a 33,027-line single file with 18 visible sprint accretions
**Severity:** P0
**Evidence:**
- File line count: `wc -l styles.css` → **33,027**.
- SF sprint labels visible: SF10, SF11, SF12, SF13, SF14, SF15, SF16, SF17, SF18, SF19, SF20, SF21, SF24, SF25, SF35, SF42, SF43, SF46 (18 distinct).
- ASCII heading-bar comments (`/*\s*=`): **212 occurrences**. These are section dividers — most accrued per-sprint.
- Total selectors (approximate): `grep -hcE '^\.[a-z][a-z0-9_-]*' styles.css` ≈ 2,934.
- The file is wrapped at line 23 in a single huge `@layer legacy {` block that closes at line 31,807. Layered architecture exists; **the entire 31k legacy block is the architecture's problem, not its solution.**
**Root cause:** Sprint pressure plus the historical pattern of appending — not refactoring — to keep diffs small.
**Recommendation:** Split `styles.css` into module files by surface (nav, hero, pricing, blog, contact, etc.). Reduce `@layer legacy` content by ≥50% via deletion of dead selectors identified in `component-consistency-report.md`. Set a hard ceiling: no single CSS file > 2,000 lines.

## Finding A-2 — CRITICAL — 749 broken `var(----…)` custom-property references (cross-ref D-1)
**Severity:** P0
**Evidence:** See `design-system-violations.md#D-1`. 749 declarations across `styles.css` evaluate to `unset`. From an architecture lens, this means **the typography contract between brand-tokens.css and styles.css is broken by ~82% of `font-size:` call sites**. Layered cascade cannot heal a `var()` that points at a non-existent token.
**Recommendation:** Single global find-and-replace `var(----font-size-` → `var(--font-size-`. Add a CI check: `grep -E "var\(----" styles.css Assets/css/*.css` must exit non-zero.

## Finding A-3 — HIGH — 2,712 `!important` declarations cluster-bombed across CSS
**Severity:** P1
**Evidence:** `grep -cE "!important" styles.css Assets/css/*.css` → file-level breakdown:
```
styles.css                  1,983
Assets/css/nav-footer-sf21  190
Assets/css/page-archetype-unify  64
Assets/css/sovereign-primitives  59
Assets/css/pricing-sf16     55
Assets/css/page-fixes-sf22  51
Assets/css/consistency-sf41 45
Assets/css/faq-page         37
…
TOTAL                       2,712
```
**Architecture impact:** Each `!important` is a private contract a developer made with the cascade. 2,712 of them mean the cascade is non-deterministic at the human level — no engineer can reason about the rendered style of any element by inspection. The Sovereign layered architecture was *introduced specifically* to remove this need (its docstring at `styles.css:11-17` is explicit), yet the `!important` count is barely affected because the legacy rules carry the existing `!important`s with them.
Notable: `Assets/css/sovereign-primitives.css` itself emits **59 `!important` declarations** — the docstring at line 24 says "Zero !important except where `:where()` 0,0,0 specificity demands it." That's higher than expected; an audit of which of the 59 are truly `:where()` driven is warranted.
**Recommendation:** Per-file `!important` budget. CI fail above threshold. Tackle the top 3 files (`styles.css`, `nav-footer-sf21.css`, `page-archetype-unify.css`) first.

## Finding A-4 — HIGH — Stale CSS backups in publish root
**Severity:** P1
**Evidence:** `styles.css.bak` (1.23 MB), `styles.css.pre-sovereign.bak` (1.18 MB), `styles.min.css.pre-sovereign.bak`, `index.html.bak` (157 KB). Located at repo root → unless explicitly ignored by Cloudflare/Vercel publish config, they ship to production CDN as static assets, wasting bandwidth and exposing pre-Sovereign source.
**Recommendation:** Move to `_backups/` outside publish root; or add to `.vercelignore` / `cloudflare-workers` exclude list.

## Finding A-5 — HIGH — HTML page-level stylesheet imports drift (46 distinct `<link>` declarations)
**Severity:** P1
**Evidence:** `grep -h 'rel="stylesheet"' *.html | sort -u | wc -l` → **46 distinct lines**. Variations include:
- Mixed cache-busting: `?v=99`, `?v=98`, `?v=97`, `?v=94`, `?v=92`, `?v=85`, `?v=71`, `?v=2`, `?v=1`, no version, `?v=99` — the same file can load with different cache keys on different pages.
- Inconsistent ordering: some pages load `crowagent-brand-tokens.css` BEFORE `fonts-selfhosted.css`, others after — affecting paint timings.
- 5 distinct Google-Fonts request strings (cross-ref D-7).
- Several pages load page-bespoke stylesheets (`security-page.css`, `terms-page.css`, `privacy-page.css`, `cookies-page.css`, `faq-page.css`) but the same content type sometimes loads `page-styles.css` instead. There is no single manifest.
**Recommendation:** Lift all `<link rel="stylesheet">` into a single nav-inject template. Single cache-bust token. Single ordering.

## Finding A-6 — HIGH — Two `@layer` declarations with non-identical orderings
**Severity:** P1
**Evidence:**
- `crowagent-brand-tokens.css:23` → `@layer reset, brand, sf-fixes, components, utilities, overrides;`
- `styles.css:21` → `@layer legacy, theme, base, components, layout, overrides;`

The two files load in the same document. CSS layer order is determined by the first declaration; the second declaration adds new layers AFTER. So actual cascade is: `reset, brand, sf-fixes, components, utilities, overrides, legacy, theme, base, layout`. **The `legacy` layer ends up HIGHER than `brand` tokens layer** — which is the opposite of what `styles.css`'s docstring claims ("Sovereign rules win cascade over legacy").
This is subtle but real: a `--space-1` redeclared inside `legacy` (which happens at `styles.css:55`) wins over the brand-tokens default if both target the same selector at the same specificity.
**Recommendation:** Unify on ONE `@layer` declaration at the top of brand-tokens.css. Remove the duplicate in styles.css. Document the canonical order in one place.

## Finding A-7 — MEDIUM — `_archive/` directory leaks legacy CSS into the published tree
**Severity:** P2
**Evidence:** `_archive/css-2026-05-16/_session-2026-05-16-fixes.css` defines `.container-standard { max-width: 1200px }` and `.container-wide { max-width: 1400px }` — at conflicting values with the canonical containers. Plus 11 other archived files (mostly markdown audits, but a `.css` is present). If any HTML mistakenly references the archive path, the container max-widths diverge.
**Recommendation:** Move `_archive/` outside publish root or add to .vercelignore. Verify no `<link>` references `_archive/`.

## Finding A-8 — MEDIUM — `crowagent-brand-tokens.css` imported twice
**Severity:** P2
**Evidence:**
- `styles.css:1` → `@import url('./crowagent-brand-tokens.css');`
- `index.html:36` → `<link rel="stylesheet" href="/crowagent-brand-tokens.css?v=99">` and the same on every page.

Browsers will fetch once (HTTP cache), but the CSS engine evaluates the rules twice → token `:root` redeclarations run twice. With layered + unlayered rules this can lead to non-obvious ordering effects (the import inside `@layer` context puts the second copy somewhere else in the cascade than the explicit `<link>`).
**Recommendation:** Pick one. The `<link>` is preferable (network-prefetchable). Remove the `@import` at `styles.css:1`.

## Finding A-9 — MEDIUM — `styles.min.css` exists and is referenced — but `styles.css` is also loaded on some pages
**Severity:** P2
**Evidence:** `grep "styles\.\(min\.\)?css" *.html` shows mixed usage. The min file is present (size on disk; not measured here) AND a non-min `styles.css` is at the root. CLAUDE.md states: "All CSS changes go in BOTH `styles.css` AND `styles.min.css`." — i.e. they are manually kept in sync, no build step verifies this. Production loads min on most pages; dev/legacy loads unminified.
**Recommendation:** Add an npm script that emits `styles.min.css` from `styles.css` via PostCSS / esbuild. Remove the manual-sync rule. CI fail if hash mismatch.

## Finding A-10 — MEDIUM — 33 separate stylesheets in `Assets/css/` — fragment loading + over-fetch
**Severity:** P2
**Evidence:** `ls Assets/css/*.css | wc -l` → **33 files**. Per-page subset is loaded; but pages often request 8-10 stylesheets sequentially. HTTP/2 multiplexing helps but does not eliminate render-blocking. Several files are tiny: `tools-breadcrumb-sf21.css` (80 lines), `resources-sf21.css` (72 lines), `fonts-selfhosted.css` (64 lines), `always-playing-sf23.css` (83 lines). Below ~3KB the network round-trip cost exceeds the content cost.
**Recommendation:** Bundle into 3-4 logical CSS modules (`tokens.css`, `primitives.css`, `legacy.css`, `print.css`). Or use Cloudflare Auto-Concat. Inline critical CSS into `<head>` for above-fold.

## Finding A-11 — MEDIUM — `styles.css.bak`/`pre-sovereign.bak` deltas show ~92% of styles.css is "legacy"
**Severity:** P2
**Evidence:** `styles.css.pre-sovereign.bak` is 1.18 MB; current `styles.css` is 1.23 MB. The Sovereign migration **added** ~50 KB (net) — it did not remove ~1.13 MB of legacy. The "rebirth" docstring at `styles.css:4-9` admits this: *"31k lines of legacy CSS were drowning out the new Sovereign Design System"*.
**Recommendation:** Treat the legacy block as a deletion backlog. Define a quarterly target (e.g. -2,000 lines/quarter). Track in `SF46-PROGRESS.md`.

## Finding A-12 — LOW — Test fixtures `tests/fixtures/sf46-*.html` are present in publish path
**Severity:** P3
**Evidence:** `tests/fixtures/sf46-p2mno.html`, `tests/fixtures/sf46-b9.html`, `tests/fixtures/sf46-p2v3-modern-css.html`. Found while grepping for `ca-grid` (`u-grid-3`). If they are served at `/tests/fixtures/...`, search engines may index them.
**Recommendation:** Confirm `_redirects` / `_headers` block `/tests/*`. Or move outside publish root.

## Finding A-13 — LOW — JS-injected nav and footer make HTML diffing hard
**Severity:** P3
**Evidence:** `js/nav-inject.js` is referenced and forbidden by CLAUDE.md from modification. Without HTML output, neither the audit nor a code reviewer can verify the rendered nav matches the Sovereign DS. This is a *traceability* concern, not a correctness one.
**Recommendation:** Add a deterministic snapshot test that renders nav-inject output and asserts `class` attribute conformance to the Sovereign primitive set.

---

**Summary:** The architecture has a clear blueprint (layered cascade, token-first, Sovereign primitives) and a clear adoption path in HTML. What it does not have is a deletion regime. Legacy CSS sits at ~31k lines, !important density is at ~2.7k, and the typography contract is currently broken at 749 call sites by a single regex bug. Fix the typo (1 hour). Schedule a deletion sprint targeting the 40+ unused button selectors and 60+ unused card selectors (1 day). Split styles.css into modules (1 week). Defer cascading optimisations (gradients, rgba migration, font stack collapse) to a P2 follow-up.

(~1,495 words)
