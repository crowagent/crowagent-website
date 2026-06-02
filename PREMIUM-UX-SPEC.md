# CROWAGENT PREMIUM UX SPECIFICATION
**Version:** 1.0 (Final Premium Polish)
**Author:** Lead Frontend Engineering (Google/Stripe Standards)
**Target:** `crowagent-website`

## 1. STRATEGIC DECISIONS & OPEN ASKS (RESOLVED)
The following architectural decisions are final. Do not ask for further clarification on these items.
- **V6 (CSS Subgrid):** DEFERRED. Accept as future-tier. Do not waste time implementing this now.
- **Y7 (CSP Strict Mode):** DEFERRED. Accept the currently shipped "moderate-tight" policy. Visual polish is the priority.
- **Y2 (Critical CSS):** APPROVED. Mark as complete.
- **X7/Y4 (Visual Baselines):** PAUSED. Do not take baseline screenshots of broken pages. We will baseline only *after* this spec is fully implemented.
- **Image Provenance:** APPROVED. Use current assets/placeholders.
- **Home Demo Video:** APPROVED. Use the multi-scene SVG cycle fallback.
- **Dangling Sentences:** STRIP the string *"No manual data entry, single property or bulk CSV across a portfolio."* from all product pages.
- **Home Hero Alignment:** Centrally align the `.hero-content` block within its `.wrap` container.

## 2. GLOBAL FOUNDATION FIXES (APPLY SITE-WIDE)
These issues plague multiple pages (the "203 vague items"). Fix these globally in `styles.css`:

### A. The "Sticky TOC Overlap" Bug
- **Issue:** Scrolling to an anchor link hides the heading under the sticky nav.
- **Fix:** Ensure `scroll-margin-top: clamp(80px, 12vh, 140px);` is aggressively applied to ALL `<section>`, `<h2>`, `<h3>`, and `<div id="*">` elements that serve as targets for the TOC.

### B. The "Footer Proximity" Bug
- **Issue:** The footer sits too close to the last content block on almost every page.
- **Fix:** Add `padding-bottom: 120px;` to the bottom of the `<main>` element or the last `.section` globally.

### C. The "Dead Button" Bug
- **Issue:** Buttons lack tactile feedback.
- **Fix:** Ensure `.btn:active` has `transform: scale(0.97);` globally.

## 3. ARCHETYPE SPECIFICATIONS (PAGE-BY-PAGE RULES)

### A. Legal Pages (Privacy, Terms, Cookies)
- **Goal:** Institutional Transparency Portal.
- **Typography:** Force `80px` margin-top on all `<h2>` tags. Use `Plus Jakarta Sans` for headers with `-0.02em` tracking.
- **Tables:** Remove all vertical borders (`border-left`, `border-right: 0`). Apply subtle `rgba(255,255,255,0.05)` bottom borders to rows.
- **Lists:** Standardize bullet lists to a `24px` left padding/indent.

### B. Product Pages (Core, Mark, Cyber, Cash)
- **Goal:** Technical Authority.
- **Badges:** Separate security badges in the hero with a middle dot (e.g., `AES-256 &middot; TLS 1.3`).
- **Cards:** All pricing/feature cards MUST use `display: flex; flex-direction: column;` to guarantee alignment, with `24px` padding and `16px` radius.
- **CTAs:** De-duplicate CTAs. If "Start Free Trial" is in the hero, do not place it immediately again in the next section unless inside a distinct CTA band.

### C. Free Tools
- **Goal:** Instant Utility.
- **Forms:** Force input fields to `min-height: 48px` (WCAG touch target). Align `<label>` vertically with the input.
- **Results:** Render calculation results in `JetBrains Mono` or tabular numerals.

### D. Home Page
- **Goal:** Cinematic Entry.
- **Animations:** Implement a staggered keyframe reveal (20ms delay steps) for Hero elements (Eyebrow -> H1 -> Subtext -> Buttons).
- **Methodology:** Center the "CrowAgent does not generate compliance opinions..." text.
