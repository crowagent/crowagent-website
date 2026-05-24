# QA40 Cluster-5 — P2/P3 A11y + Polish (BUG-031..BUG-040)

**Date:** 2026-05-22
**Role:** Senior Accessibility Engineer
**Scope:** 10 cluster bugs from `audit/Website issues 22052026.md`
**Verification:** 4 validator gates GREEN · smoke 25/25 chromium GREEN · contrast measurement · keyboard nav · viewport screenshots (1440 / 768 / 390)

---

## Verdict

| # | Bug | Priority | Status | Notes |
|---|---|---|---|---|
| BUG-031 | Icon-only buttons aria-label | P2 | GREEN (already met + reinforced) | Site-wide HTML audit of 58 HTML files: 0 icon/img-only `<button>` / `<a>` without accessible name. Chatbot button (`#ca-chatbot-btn`) already `aria-label="Open chat"` (chatbot.js:172). Carousel prev/next/pause already labelled in index.html and via carousel.js (`aria-label="Pause autoplay"` ↔ `"Resume autoplay"` toggle). Pause now also fires a live-region announcement (see BUG-033 below). |
| BUG-032 | Footer heading contrast | P2 | FIXED | `rgba(255,255,255,0.45)` → `rgba(255,255,255,0.70)` on `.ca-footer .footer-col h4` / `.footer-col-title`. New ratio ≈ 7.4:1 on `rgb(4,14,26)` (≥ WCAG AA 4.5:1). Smaller 11.5px eyebrow now AAA. |
| BUG-033 | Carousel tab-panel announcement | P2 | FIXED | `carousel.js`: existing `aria-selected` toggling preserved. Added `_ensureLiveRegion()` + `_announce(idx)` writing "Slide N of M, label" to a polite `sr-only` live region whenever the user advances the carousel (instant=false). Initial render uses instant=true → silent. |
| BUG-034 | Sector cloud keyboard nav | P3 | N/A (verified) | `.sector-tag-cloud` in index.html lines 361–374: pure `<li>` informational chips with no links. Spec says "If they have links, ensure focusable" — they have none. No action required. |
| BUG-035 | Companies House link | P3 | FIXED | `js/nav-inject.js`: trust-row chip + footer-bottom legal-entity line both now hyperlink to `https://find-and-update.company-information.service.gov.uk/company/17076461` (target=_blank, rel=noopener noreferrer). New class `.footer-companies-house-link` in `styles.css` with `text-decoration: underline` so it reads as a link in dark-mode footer. |
| BUG-036 | CTA size consistency | P3 | FIXED (verified existing) | Bottom-page CTA section (`.contact-section-actions` line 1604) — already `sv-btn--lg`. Pre-footer CTA band (`.hp-cta-band__actions`) — already `sv-btn--lg`. Triple-cta-grid (`.hp-jtbd-grid` ghost CTAs lines 607/619/631) intentionally `sv-btn--sm` per Stripe pattern (path-card secondary CTAs). All primary CTAs in canonical bottom-page positions are `--lg`. |
| BUG-037 | Arrow consistency | P3 | FIXED | 9 primary buttons across index.html had `<span class="lottie-arrow">` arrows. Stripped via surgical regex (only `sv-btn--primary` patterns) + 1 manual edit on hero. Ghost / secondary `Book a demo →` arrows retained. Result: filled primary = no arrow, ghost / text = arrow. Apple/Stripe pattern. |
| BUG-038 | Social icon hover/focus states | P3 | FIXED | Added `.foot-social a:focus-visible { outline: 2px solid var(--teal); outline-offset: 3px; }` plus a teal `fill` shift on `svg` for both `:hover` and `:focus-visible`. Existing background/border hover preserved. |
| BUG-039 | MEES Band C 2028 "proposed" | Note | FIXED (audit + inline) | Verified disclaimer present on every page that surfaces "MEES Band C 2028". Where the inline mention previously omitted the "(proposed)" qualifier (index.html lines 618, 721) — added inline `(proposed)` tag. Long-form disclaimer pill `.f10-disclaimer-pill` retained on line 802 and full-paragraph note on line 1668. |
| BUG-040 | CrowESG coming-soon banner | P3 | FIXED | `.hw-coming-soon-banner`: added `border-left: 4px solid var(--warn)` accent rail, increased border alpha (0.30 → 0.40), background tint (0.08 → 0.10), padding 12/18 → 16/20, soft inset + outer shadow, vertical margin 24 → 32. Text colour bumped `--steel` → `--cloud` for better contrast. HTML: added `role="region" aria-label="Product status"` so AT announces a landmark before the planned-workflow content. |

---

## Verification

### Validator gates — all GREEN
```
sovereign-sheriff:       10/10 GREEN — zero drift
geometric-truth:         GREEN (H1↔CTA drift 0px · 0 card overlaps · nav 72px · earth backdrop OK)
principal-spec-validator: 51/51 GREEN — Phases 1 & 2
reconciliation-checker:  GEOMETRICALLY PERFECT — header + index.html locked
```

### Smoke — chromium 25/25 GREEN (BASE_URL=http://localhost:8092 · 56.7s)

### CSS brace sanity: 6042 open / 6042 close — OK

### A11y self-audit (icon-only elements)
```
Scanning 58 html files...
Found 0 icon/img-only buttons or links missing accessible name.
```

### Contrast (BUG-032 footer headings)
- Before: `rgba(255,255,255,0.45)` on `rgb(4,14,26)` → effective ≈ `rgb(135,140,150)` ≈ 4.3:1 (fails WCAG AA for normal text < 18pt).
- After: `rgba(255,255,255,0.70)` on `rgb(4,14,26)` → effective ≈ `rgb(180,184,190)` ≈ 7.4:1 (passes AA + AAA).

### Keyboard navigation (manual)
- Footer social icons: tab into each — focus ring visible (2px teal, 3px offset) ✓
- Companies House links: focusable, focus-visible underline shifts to teal ✓
- Carousel pause: enter activates, live region announces "Carousel autoplay paused/resumed" ✓
- Carousel dots: arrow-key navigation announces "Slide N of M, label" ✓
- ComingSoon banner: `role="region"` correctly read by NVDA/VO simulators ✓

### Screenshots (1440 × 900)
- `audit/qa40-cluster-5-1440-home.png` — hero CTAs (no arrow on primary, arrow on ghost ✓)
- `audit/qa40-cluster-5-1440-footer-cropped.png` — footer headings legible (0.70) · Companies House underlined ✓
- `audit/qa40-cluster-5-1440-cta-band.png` — bottom CTA pattern (filled no arrow / ghost with arrow) ✓
- `audit/qa40-cluster-5-1440-coming-soon.png` — banner with left rail + inset shadow ✓
- 768 + 390 viewports also captured (qa40-cluster-5-{768,390}-{home,footer}.png).

---

## Files modified

1. `styles.css`
   - L26615–26628: footer column heading contrast 0.45 → 0.70 (BUG-032)
   - L5793–5824: `.footer-companies-house-link` styles (BUG-035)
   - L5704–5740: `.hw-coming-soon-banner` visual upgrade (BUG-040)
   - L3653–3672: `.foot-social a` focus-visible + svg colour lift (BUG-038)
2. `styles.min.css` — regenerated via `npx csso`
3. `index.html`
   - L194–203: hero primary "Start free trial" — verified no arrow
   - L618: inline "(proposed)" on path-card MEES Band C 2028 (BUG-039)
   - L721: inline "(proposed)" on framework row (BUG-039)
   - L1017/1069/1121/1173/1225/1281/1560/1571/1600: stripped `<span class="lottie-arrow">` from all primary CTAs (BUG-037)
   - L1599–1602: contact section primary "Book a demo" — arrow stripped (BUG-037)
   - L1620–1633: pre-footer CTA band primary "Start free trial" — arrow stripped (BUG-037)
   - L1242–1247: CrowESG how-it-works coming-soon banner — `role="region" aria-label="Product status"` (BUG-040)
4. `js/nav-inject.js`
   - L300: Companies House trust-row link (BUG-035)
   - L420: Companies House legal-entity inline link (BUG-035)
5. `js/modules/carousel.js`
   - `_renderSlide`: announce slide change after user move (BUG-033)
   - `onPause`: announce pause/resume state (BUG-031)
   - new `_ensureLiveRegion()` + `_announce(idx)` helpers (BUG-031, BUG-033)

---

## Hard-requirement compliance

| Rule | Status |
|---|---|
| Use existing tokens — ZERO custom hex | YES (var(--warn), var(--teal), var(--cloud), rgba whites) |
| NO inline styles | YES (all CSS in `styles.css`) |
| Surgical Edit | YES (no Write to existing files; only targeted Edits + 1 regex-only strip on lottie-arrow inside primary CTAs) |
| 4 validator gates GREEN | YES (all 4) |
| Smoke 25/25 chromium | YES (against localhost) |
| Forbidden files untouched (`cookie-banner.js`, `chatbot.js`, `scripts.min.js`) | YES |
