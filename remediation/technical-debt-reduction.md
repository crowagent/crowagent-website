# TECHNICAL DEBT REDUCTION — Phase 4
**Inputs:** ARCH-1..ARCH-13 + D-6..D-11 from `/audit/MASTER-DEFECT-TRACKER.md`

## Tech debt resolved this pass

| ID | Description | Resolution |
|---|---|---|
| ARCH-2 | 749 broken `var(----…)` references | ✅ Mechanical sed; all 749 sites restored |
| Partial ARCH-3 | New !important rules added in this remediation only where unavoidable; documented in styles.css comments | 4 new !important rules (chatbot z-index, mobile menu hide, breadcrumb alignment, contrast). Each carries an inline comment trace. |

## Tech debt accepted as compromise this pass

| ID | Compromise | Why | Trace |
|---|---|---|---|
| ARCH-3 (extension) | Chatbot `z-index: 1201 !important` is a literal, not a token | The `--z-overlay` token (1000) wasn't enough; `--z-toast` is 1200; needed 1201 to beat both. Adding a new token `--z-toast-plus-one` felt overkill. | styles.css:22954 + chatbot.js:52 |
| Inline `style="font-size:0.75rem !important..."` on footer h3 | Was the workaround for D-1. **After D-1 is fixed it's redundant but still in nav-inject.js**. Queued for removal in next pass. | js/nav-inject.js footer h3 markup |

## Tech debt queued for next pass

### Major
- **ARCH-1** — styles.css 33,027-line monolith. Plan: split into ~10 files (reset, tokens, primitives, components, layout, sections, pages, utilities, overrides, legacy-being-deleted). Multi-day task.
- **ARCH-3** — 2,712 `!important` declarations. Plan: audit by sprint label (SF10..SF46) and demote where cascade allows. Estimated 30% reduction is safe; deeper would risk regression.
- **ARCH-6** — Two `@layer` declarations in different files with non-identical orderings. Plan: consolidate into single declaration in `crowagent-brand-tokens.css` first-load.
- **ARCH-10** — 33 separate stylesheets in `Assets/css/`. Plan: bundle into 4-6 logical files; reduce HTTP requests on initial page-load.

### Cleanup
- **ARCH-4** + **D-11** — Stale `.bak` files in repo root (`styles.css.bak`, `styles.css.pre-d1-fix`). Plan: move to `_archive/` then delete on green deploy.
- **ARCH-7** — `_archive/` directory leaks legacy CSS. Plan: add `.gitignore` rule + `_headers` 404 rule.
- **ARCH-8** — `crowagent-brand-tokens.css` imported via @import AND `<link>`. Plan: pick one (recommend `<link>` for cache control); remove @import.
- **ARCH-12** — `tests/fixtures/*` reachable from publish path. Plan: add `_headers` denial OR move out of publish root.

### Per-file
- **D-7** — Multiple Google Fonts request strings across HTML. Plan: switch all pages to self-hosted (`/Assets/fonts/`) which 30+ pages already use.
- **D-8** — 22 distinct `font-family` declarations. Plan: collapse to 4 (display, body, mono, fallback chain).
- **D-9** — Z-index legacy escape hatches survive. Plan: grep all `z-index: <number>` and migrate to `var(--z-*)` tokens.
- **D-10** + **P-9** — 73 inline `style="..."` in HTML + 129 on index alone. Plan: sed sweep + tokenise to one-off utility classes.

### Build pipeline
- **ARCH-5** — 46 distinct `<link>` cache-bust versions across HTML. Plan: env-var-driven single version OR HTML-template inject at build.
- **ARCH-9** — Some pages load `styles.css`, others `styles.min.css`. Plan: single source of truth (`styles.min.css` everywhere in prod).
- **P-10** — Service worker precache out of sync with HTML. Plan: auto-generate precache list from HTML scan at build time.

## Debt-reduction metrics

| Category | Before | After | Plan |
|---|---|---|---|
| Broken token refs | 749 | **0** | Sovereign-sheriff to gate against `var(----)` regression |
| HTML btn- legacy classes | 0 (prior session) | **0** | Sheriff-gated |
| Author CSS font/margin/padding/gap px | 0 (prior session) | **0** | Sheriff-gated |
| !important density | 2,712 | 2,716 (+4 this pass) | 30% reduction target next pass |
| Single-file styles.css lines | 33,027 | 33,180 (+~150 from remediation block) | Modularise to <2k per file |
| Dead CSS estimate | ~60% (P5 audit) | ~60% | PurgeCSS pass |
| HTML inline styles | 73 + 129 = 202 | 202 | Sweep next pass |

## Governance proposed

1. **Sovereign-sheriff extended gates**:
   - `grep "var(----"` must return 0 (gate D-1 regression)
   - `grep "btn-" --include="*.html" | grep -v "sv-btn"` must return ≤2 (Lighthouse internals only)
   - `grep "(font-size|margin|padding|gap):[0-9]+px" --include="*.css"` must return 0
2. **Pre-commit hook** runs sheriff before allowing commit
3. **CI gate** runs full `tests/smoke.spec.js` (currently 50/50) — must stay green
4. **PR template** asks contributors to confirm:
   - "No new `!important` without justification comment"
   - "No new `var(----`"
   - "Uses canonical `.sv-*` primitives, not legacy `.card-*` / `.btn-*`"
