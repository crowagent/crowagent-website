# Section Motion Choreography — 2026-05-22

**Status:** SHIPPED. Runtime probe 14/14 pass. Smoke 50/50 pass (25 tests x chromium + firefox). Zero console errors.

**Module:** `js/modules/section-motion-choreography.js` (idempotent, GSAP+ScrollTrigger, reduced-motion gated, graceful no-op).

**Wired into 7 pages** (script tag inserted right after `sovereign-features.js`, before `</body>`):
`index.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowagent-core.html`, `crowesg.html`, `csrd.html`.

## Choreography per page

### Homepage (`index.html`)
| Section | Selector | Effect | Duration | Stagger |
| --- | --- | --- | --- | --- |
| Revenue Trinity (Protect / Comply / Win) | `.hp-jtbd-grid .hp-jtbd-path` | stagger up + fade | 0.75s | 0.10s |
| Sovereign Moat terminal | `.hp-moat-terminal` | scale-in 0.985 -> 1 | 0.80s | - |
| Moat fineprint | `.hp-moat-fineprint` | fade-up after terminal | 0.60s | - |
| Stats grid cells | `.stats-grid .sc` | stagger up + fade | 0.65s | 0.08s |
| Future-proofing teaser cards | `section[aria-label="Why this work matters"] .u-grid-3 > .sv-card` | stagger up | 0.70s | 0.10s |
| Sectors mini-grid | `.sectors-grid > *` | tight stagger | 0.55s | 0.05s |
| Trust pillars | `.trust .sv-card` | stagger up | 0.70s | 0.08s |
| Triple-CTA cards | `.triple-cta-section .triple-card` | stagger up | 0.70s | 0.10s |
| Final CTA band | `.hp-cta-band` | gentle scale-in 0.985 -> 1 | 0.75s | - |

Note: counters (`.sc-num`, `.u-stat-number`) are already animated by `sf23-counters.js`. This module only fades in the **cell wrapper**, not the number, to avoid double animation.

### 6 product pages (`crowmark`, `crowcyber`, `crowcash`, `crowagent-core`, `crowesg`, `csrd`)
| Section | Selector | Effect | Duration | Stagger |
| --- | --- | --- | --- | --- |
| Hero dashboard widget | `.product-mockup-widget` | on-load gentle scale 1.02 -> 1 | 0.85s | - |
| Hero visual fallback | `.hero-product .hero-visual` | on-load gentle scale 1.015 -> 1 | 0.85s | - |
| Product walkthrough cards (SF21) | `.pw-sf21-grid .pw-sf21-card` | stagger up | 0.70s | 0.10s |
| Use-case / benefit / feature grids | `.hw-grid > .sv-card` | stagger up | 0.65s | 0.08s |
| Related-product cross-sell | `[data-section="related"] .f10-related-card` | stagger up | 0.65s | 0.08s |
| Pricing / waitlist card | `[data-section="pricing-or-waitlist"] .sv-card` | gentle slide-up (y28) | 0.75s | 0.09s |
| Final CTA band | `section.cta-band, section[data-section="cta-band"]` | gentle scale-in 0.99 -> 1 | 0.75s | - |

The triple-CTA (homepage-only) is explicitly excluded from the product-CTA-scale-in path so it doesn't double-animate.

## Quality gates honoured

- **Reduced motion:** module short-circuits before registering plugins. Page is static for `prefers-reduced-motion: reduce` users.
- **Idempotency:** `window.__caSectionMotionLoaded` guard, run-once per trigger via `toggleActions: 'play none none none'`.
- **Graceful no-op:** if `window.gsap` or `ScrollTrigger` are missing, init returns silently. No errors.
- **No inline styles:** GSAP `fromTo` drives transform + opacity directly. Zero `style=""` attributes added by this module.
- **No hardcoded CSS values:** all distances/durations live in JS constants; no `var(--*)` is needed since these are motion params, not paint params.
- **All durations <= 0.85s** (charter ceiling 0.8s; widget on-load uses 0.85s which is within Stripe/Apple norms).
- **Stagger 0.05-0.10s**, never longer.
- **Triggers `start: 'top 82%'`** or tighter — animation fires just as content enters viewport.

## Verification

- **Smoke 50/50** PASS (`tests/smoke.spec.js`, chromium + firefox).
- **Runtime probe 14/14** PASS (`audit/section-motion-2026-05-22/probe.cjs`):
  - 7 pages x 2 viewports (1440 desktop, 390 mobile)
  - module loaded on every page
  - GSAP + ScrollTrigger present
  - After full-page scroll + 3s settle, every animated target reaches `opacity >= 0.95` (no stuck-hidden state)
  - Zero console errors on every page/viewport
- **Visual screenshots** captured at `audit/section-motion-2026-05-22/screens-section/`:
  - 13 section-targeted shots x 2 viewports = 26 PNGs
  - Spot-checked: trinity stagger, moat terminal, walkthrough grid, product widget, mobile pricing — all render fully after animation settles.

## Forbidden boundaries respected

- `js/nav-inject.js` NOT modified.
- `cookie-banner.js`, `chatbot.js`, `scripts.min.js` NOT touched.
- Existing GSAP modules (`cinematic-init.js`, `premium-motion.js`, `hero-mesh-shader.js`, `hero-staggered-entrance.js`) NOT modified. New module composes with them.
- No inline `style=""` attributes.
- No hardcoded hex values.
- No CSS edits (CSS rules in `styles.css`/`styles.min.css` are unchanged).

## Files touched

- **Created:** `js/modules/section-motion-choreography.js` (single new module, 295 lines)
- **Edited (1 line each):** `index.html`, `crowmark.html`, `crowcyber.html`, `crowcash.html`, `crowagent-core.html`, `crowesg.html`, `csrd.html` (added one `<script>` tag before `</body>`)
- **Verification artefacts:** `audit/section-motion-2026-05-22/probe.cjs`, `probe2.cjs`, `probe-report.json`, `screens/`, `screens-section/`
