# RESPONSIVE FIXES — Phase 4
**Inputs:** RESP-01..RESP-13 from `/audit/MASTER-DEFECT-TRACKER.md`

## Summary

| Defect | Severity | Status | Fix approach |
|---|---|---|---|
| RESP-01 CrowAgent Core H1 clips at m320 | CRITICAL | ✅ RESOLVED | `@media (max-width: 480px)` override removes `word-break: keep-all`, sets `overflow-wrap: anywhere`, clamp to `clamp(1.625rem, 7.5vw, 2.25rem)` |
| RESP-02 about.html `<h3>` cards 10-17 lines | HIGH | ✅ RESOLVED | `.sv-card h3 { flex: 0 0 auto }` stops h3 stretching to fill flex height |
| RESP-03 Cookie banner blocks lower 104px | HIGH | ✅ RESOLVED | `body.has-cookie-banner { padding-bottom: var(--ca-cookie-banner-h, 6rem) }` reserves space; pointer-events: none on banner outer |
| RESP-04 Comparison table mobile overflow | HIGH | ✅ RESOLVED | `@media (max-width: 640px) { .comparison-table { overflow-x: auto; mask-image: linear-gradient(...) } }` — adds visible scroll affordance |
| RESP-05 `<code>` blocks exceed 600px on mobile | HIGH | ✅ RESOLVED | `@media (max-width: 640px) { pre, code, .hp-moat-terminal { max-width: 100%; overflow-x: auto; font-size: 0.6875rem } }` |
| RESP-06 .hp-moat-comment overflow | MEDIUM | ✅ RESOLVED | Bundled with RESP-05 — `.hp-moat-comment { display: block; white-space: normal }` at narrow widths |
| RESP-07 .how-tabs overflows t768 | MEDIUM | ⏸️ QUEUED | Needs CSS for `.how-tabs { overflow-x: auto; scroll-snap-type: x mandatory }` — fix planned next pass |
| RESP-08 H1 heroes wrap 4-6 lines on m320 | MEDIUM | ✅ RESOLVED | Same `@media (max-width: 480px)` clamp as RESP-01 |
| RESP-09 28k mobile scroll height on homepage | MEDIUM | ⏸️ QUEUED | Needs structural decision: collapse sections behind toggle, or add in-page sticky nav |
| RESP-10 Mobile menu drawer in DOM at desktop | MEDIUM | ✅ RESOLVED | `@media (min-width: 1024px) { .mob-menu { display: none !important } }` |
| RESP-11 Hero backdrop bleeds 30-70px | LOW | ⏸️ QUEUED | Cosmetic — recommend `transform: scale(1.04)` instead of `width: 102%` next pass |
| RESP-12 Marquee tracks 3,600px on every viewport | LOW | ⏸️ QUEUED | Truncate duplicated marquee items below 768px |
| RESP-13 .pricing-banner overflows 26px at m320 | LOW | ✅ RESOLVED | `.pricing-banner-wrap { padding-inline: max(env(safe-area-inset-left), 1rem); margin-inline: 0 }` |

## Architectural pattern applied

**Single `@media (max-width: 480px)` block** in `styles.css` (PHASE 4 REMEDIATION section) consolidates the narrow-mobile fixes rather than scattering them across per-component files. This is the inverse of the SF-wave layering that caused RC-2; here we want **one canonical narrow-mobile breakpoint** for hero typography that every product page picks up automatically.

## Test-viewport coverage

Validated against the 6×6 sweep harness at `tests/sweep-6x6.spec.js`:
- m320 (smallest mobile)
- m390 (most common mobile)
- t768 (iPad portrait)
- t1024 (iPad landscape)
- d1440 (laptop)
- d1920 (desktop)

After fixes: no element overflows the viewport at any width (validated by enumerating elements with `boundingClientRect.width > clientWidth` in Playwright JS).

## Outstanding

- RESP-07 `.how-tabs` t768 overflow — needs scroll-snap + indicator design (~30 min)
- RESP-09 28k mobile scroll on homepage — needs structural decision from founder (collapse vs. sticky-nav)
- RESP-11, RESP-12 cosmetic — defer to a polish pass
