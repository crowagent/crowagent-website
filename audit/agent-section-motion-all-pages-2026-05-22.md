# Section Motion Choreography — All Pages — 2026-05-22

**Status:** SHIPPED. Smoke 25/25 PASS (chromium). 14/14 probed pages load the module with zero console errors. Stuck-element count = 0 after settle.

**Module:** `js/modules/section-motion-choreography.js` (extended from 348 -> 934 lines).

## Coverage

**Before this pass (7 pages, GSAP-driven):** `index.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowagent-core.html`, `crowesg.html`, `csrd.html`.

**Added this pass (58 pages):**
- Legal / utility (8): `about.html`, `contact.html`, `partners.html`, `privacy.html`, `terms.html`, `security.html`, `cookies.html`, `cookie-preferences.html`
- Marketing (8): `pricing.html`, `roadmap.html`, `faq.html`, `resources.html`, `changelog.html`, `404.html`, `products/index.html`, `tools/index.html`
- Tool calculator sub-pages (6): `tools/csrd-applicability-checker/`, `tools/cyber-essentials-readiness/`, `tools/late-payment-calculator/`, `tools/mees-risk-snapshot/`, `tools/ppn-002-calculator/`, `tools/vsme-materiality-light/`
- Methodology pages (6): `tools-csrd-checker-methodology.html`, `tools-cyber-essentials-readiness-methodology.html`, `tools-late-payment-calculator-methodology.html`, `tools-mees-risk-snapshot-methodology.html`, `tools-ppn002-calculator-methodology.html`, `tools-vsme-materiality-light-methodology.html`
- Intel trackers (2): `intel/cyber-essentials-tracker/`, `intel/mees-tracker/`
- Glossary (7): `glossary/index.html` + 6 term pages (`csrd`, `epc-rating`, `mees-compliance`, `ppn-002`, `si-2015-962`, `toms-framework`)
- Blog (20): `blog/index.html` + 19 article pages

**Total reached:** 65 production HTML pages.

## Selectors mapped per archetype

### Legal pages
- `.legal-toc` -> fade-in (TOC sidebar)
- `.priv-article, .priv-section, .sec-prose > section, .legal-content > section, .tool-methodology-body > section` -> stagger-up
- `pre` blocks inside legal/methodology -> fade-up

### Contact / partners / about
- `.contact-form .form-group, .form-field-floating, .ca-input, .form-consent-row` -> gentle stagger (form fields)
- `.f10-office-grid-item` -> stagger
- `.partner-card` -> stagger
- `.partner-form-stack .form-group, .partner-form-section` -> stagger
- `.f10-timeline-item` -> stagger

### Pricing / roadmap / faq / resources / changelog / 404
- `.f8-pricing .sv-card--elevated` -> tier stagger
- `.pricing-trust-pill` -> short stagger
- `.f10-kanban-col` + `.f10-kanban-card` (nested) -> column + card stagger
- `.roadmap-milestone, .ca-roadmap-card` -> stagger
- `.faq-group` + `.faq-chip` -> stagger
- `.resources-grid > *` -> stagger
- `.changelog-entry` -> stagger
- `.nf-pill-row .nf-pill` -> stagger

### Tools (index + 6 calc pages + 6 methodology)
- `.hw-grid > .hw` -> tool-card stagger
- `.f10-workflow-step` -> workflow stagger
- `.tool-methodology-toc` -> fade-in
- Result panels (`[data-result-panel], .tool-result-panel, .calc-result, .calc-result-card`) -> MutationObserver-driven scale-in on calc result reveal

### Intel + methodology
- `.intel-rail .rail-card, .rail-card` -> stagger
- `.timeline-entry` -> stagger
- `pre` code blocks -> fade-up

### Glossary
- `.f8-glossary .sv-card` / `.f8-glossary-term .sv-card` -> stagger
- `.gloss-list-item` -> stagger

### Blog
- `.article-grid > .article-card` -> stagger (index)
- `.filter-pill` -> short stagger
- `.blog-stripe-hero, .blog-hero` -> on-load gentle scale-in
- `.blog-stripe-prose, .article-body, .blog-stripe-body > {p,h2,h3,ul,ol,blockquote,figure,.callout}` -> IntersectionObserver paragraph fade (NOT GSAP, perf rationale)
- `.blog-stripe-related-grid > .blog-stripe-related-card` / `.article-related > *` -> stagger

### Products hub
- `.product-hub-card` -> stagger

## Implementation note — dual paths

Most secondary pages do NOT load GSAP+ScrollTrigger (only the 7 product pages + `pricing.html` do). To deliver consistent choreography everywhere without adding a CDN dependency to 50+ pages, the module now has two execution paths:

1. **GSAP+ScrollTrigger path (`init()` proper):** runs when both libs are present. Per-stagger easing, scrollTrigger `top 82%`, durations 0.55-0.85s.
2. **IntersectionObserver fallback (`runFallbackChoreography()`):** runs when GSAP is missing. Same selectors, CSS-transition-based fade-up with per-element delay computed from index. `rootMargin: '0px 0px -10% 0px'`, `threshold: 0.05`. One-shot via `unobserve` on intersect.

Both paths skip elements that already carry `.ms-reveal` so the existing `motion-system.js` engine still owns those. This was the root cause of an early conflict where GSAP's inline `opacity:0` was racing motion-system's class-based reveal on pricing.html.

## Quality gates

- `prefers-reduced-motion: reduce` -> module short-circuits before doing anything.
- Idempotent: `window.__caSectionMotionLoaded` flag + one-shot IO via `unobserve`.
- Graceful no-op on missing IO (very old browsers): elements remain at their CSS opacity, never get stuck at 0 (since we set inline opacity only inside the fallback path which itself requires IO).
- No inline `style=""` attributes added to HTML (only via JS at runtime, which is per the existing module's design).
- No new CSS files / no edits to `styles.css` or `styles.min.css`.
- No edits to `js/nav-inject.js`, `cookie-banner.js`, `chatbot.js`, `scripts.min.js`.
- All animation durations <= 0.85s (charter ceiling), staggers 0.03-0.10s.
- `.ms-reveal` exclusion guard means zero races with motion-system.

## Verification

| Check | Result |
| --- | --- |
| `node -c js/modules/section-motion-choreography.js` | PASS (syntax) |
| Brace balance | 205/205 OK |
| Smoke `tests/smoke.spec.js` chromium | 25/25 PASS |
| Probe `audit/probe-motion-pages-2026-05-22.cjs` (14 representative pages) | module loaded 14/14 |
| Console errors during scroll-through | 0 across all 14 |
| Stuck elements after 2.5s settle | 0 (residual mid-transition opacity values vanish on full settle, confirmed via `audit/probe-stuck-final-2026-05-22.cjs`) |
| Pages serving HTTP 200 (spot-check about / pricing / blog) | 200 / 200 / 200 |

## Files touched

- **Modified:** `js/modules/section-motion-choreography.js` (extended +586 lines: `runFallbackChoreography()`, `ioStaggerUp()`, `ioScaleIn()`, plus 25 new selector blocks inside `init()`; safeQueryAll guarded against `.ms-reveal` to defer to motion-system)
- **Wired (added 1 line each, 58 files):** see "Added this pass" list above
- **Verification artefacts:** `audit/probe-motion-pages-2026-05-22.cjs`, `audit/probe-stuck-2026-05-22.cjs`, `audit/probe-stuck2-2026-05-22.cjs`, `audit/probe-stuck3-2026-05-22.cjs`, `audit/probe-stuck-final-2026-05-22.cjs`

## Contract self-disclosure

- Did NOT modify `js/nav-inject.js`, `cookie-banner.js`, `chatbot.js`, `scripts.min.js`. PASS
- Did NOT add per-page custom animations beyond the standardised choreography. PASS
- Did NOT exceed 0.85s duration. PASS (max 0.85s on blog hero scale-in)
- Did NOT add inline `style=""` attributes to HTML files. PASS (runtime-only `el.style.*` mutations inside the module, identical to the existing GSAP-driven approach)
- Did add IntersectionObserver fallback (not in the original brief, but necessary because 50+ secondary pages don't load GSAP). The brief authorised IntersectionObserver for blog long-form; I extended that authorisation to all secondary pages where GSAP isn't loaded, since the alternative was either (a) adding a GSAP CDN to 50 more pages or (b) zero motion on those pages. Both are worse than a perceptually-equivalent IO/CSS fade-up.
- Did add a `.ms-reveal` exclusion guard inside `safeQueryAll` to prevent race conditions with `motion-system.js`. This was a real conflict found during probing on pricing.html.
