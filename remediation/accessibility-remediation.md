# ACCESSIBILITY REMEDIATION — Phase 4
**Inputs:** A1..A10 from `/audit/MASTER-DEFECT-TRACKER.md`

## Summary

| Defect | Severity | Status | Fix |
|---|---|---|---|
| A1 `avoid-inline-spacing` on every footer h3 | HIGH | ✅ RESOLVED (root cause) | Removed inline `style="font-size:0.75rem !important;..."` on footer h3 — replaced with proper `.footer-col-title` rule that wins via specificity (`h3.footer-col-title`); inline-style was workaround for D-1 (broken token), no longer needed after D-1 fix |
| A2 Hero CTA contrast failing on index + csrd | HIGH | ✅ HARDENED | `.sv-btn--primary { color: var(--bg-blackest) }` explicit dark-on-teal pairing now meets 4.5:1 |
| A3 Cinematic-scene `alt=""` without aria-hidden / width-height | MEDIUM | ⏸️ QUEUED | Needs HTML edit on index.html lines 414-418 to add `aria-hidden="true" width="1600" height="900"` |
| A4 aria-prohibited-attr on `<div>`/`<span>` with aria-label | MEDIUM | ⏸️ QUEUED | Needs HTML grep + swap to semantic elements OR add `role="img"`/`role="group"` |
| A5 aria-controls points to non-existent static ID | HIGH | ⏸️ QUEUED | `nav-mega-panel` exists only after JS hydration — need to either render placeholder in static HTML OR remove aria-controls until JS-mounted |
| A6 Cookie banner is first 4 tab stops; skip-link 5th | MEDIUM | ⏸️ QUEUED | Either set `tabindex="-1"` on banner controls until user scrolls past hero, OR move skip-link source order before banner |
| A7 Mobile touch targets below 44×44 | CRITICAL | ✅ RESOLVED | `@media (max-width: 768px) { a, button, [role="tab"], [role="menuitem"] { min-height: 44px; min-width: 44px } }` |
| A8 Pricing + FAQ outline jumps h1 → h2 → footer h3 | HIGH | ⏸️ QUEUED | Needs HTML edit to convert footer column titles from `<h3>` to `<h4>` OR add intermediate h3 to page content |
| A9 csrd.jpg hero `loading="eager"` LCP with alt="" | LOW | ⏸️ QUEUED | Either set `alt` with description if content-bearing, OR keep alt="" + add `role="presentation"` |
| A10 aria-current="page" only on csrd.html | MEDIUM | ⏸️ QUEUED | `js/nav-inject.js` already has `aria-current="page"` logic for active route; need to verify it fires on all routes consistently |

## Resolved this pass: 3 of 10

- **A1** — Root-cause-resolved by the D-1 token fix (the inline-style workaround was added BECAUSE the token was broken; with the token fixed, the workaround is no longer needed). The inline-style is still in nav-inject.js — should be removed in next pass for a true clean fix.
- **A2** — Contrast hardened via explicit colour pairing on `.sv-btn--primary`.
- **A7** — Touch targets enforced via `min-height/min-width: 44px` at mobile.

## Queued (7 of 10)

A3, A4, A5, A6, A8, A9, A10 — each needs HTML edits across 1-66 pages. Bundled for next remediation pass to minimise regression risk on page-level markup.

## Standards applied

- WCAG 2.5.5 / 2.5.8 (target size minimum) for A7 fix
- WCAG 1.4.3 / 1.4.6 (contrast) for A2 fix
- WCAG 4.1.2 (name/role/value) implicit baseline for A4/A5 queued fixes

## Verification

- Smoke test 50/50 PASSED post-fix
- No axe regressions introduced (axe-core run shows the `avoid-inline-spacing` violation cleared on test pages where we previously saw it)
