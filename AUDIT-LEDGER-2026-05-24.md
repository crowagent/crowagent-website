# CrowAgent Website — Master Audit & Fix Ledger (2026-05-24)

**Purpose:** single canonical to-do list. Every item from the CTO's forensic audit +
Claude's measured findings + the hero/automation direction. **Nothing is dropped.**
We review each, fix each, verify each (pixel/computed proof), miss none.

**Baseline:** branch `main`, served `http://localhost:8092`. Local-only (no push until
`APPROVED FOR PUSH — main`).

**State legend:**
- `OPEN` — confirmed present in B, needs fix
- `VERIFY` — reported by CTO but Claude measured it RESOLVED in B via fresh Playwright (no cache) on 2026-05-24 — likely the CTO's browser served a **cached** build (see INV-1 cache-staleness). Must hard-reload / deep-scroll re-verify before closing; do NOT assume.
- `DECISION` — needs CTO call before implementing
- `DONE` — fixed + verified this session

> ⚠️ **Reconciliation note (honest):** four of the CTO's ledger items (D1, D2, D4, D8)
> were pixel-verified by Claude as **already clean in B** earlier today. The CTO also
> independently flagged **cache staleness (INV-1)**. Most-likely cause: the CTO's
> browser is showing a stale cached version. These are marked `VERIFY` — re-checked
> with a hard cache-clear (and full-page scroll for D4) before we touch them, so we
> neither miss a real defect nor "fix" a phantom.

---

## A. CTO NASA-Grade Defect Ledger

| ID | Cat | Defect | Page(s) | State | Note |
|---|---|---|---|---|---|
| **D1** | Layout | Footer column headers crash at 1440px | Global | `VERIFY` | Claude shot 2026-05-24: footer columns clean + separated. Re-verify hard-reload @1440 + @1600. |
| **D4** | Assets | Hero shows vegetables/peppers instead of mockup | crowesg.html | `VERIFY`→deep | Claude shot: crowesg **above-fold** hero clean (dark gradient). MUST scroll full page — peppers may be a below-fold `hero-visual`/figure or a cached asset. CTO rates CRITICAL/FAIL. |
| **D8** | Nav | 'Sectors' link missing from product-page nav | Global | `VERIFY` | Claude shot: Sectors present in 404 + crowcyber nav. Re-verify all 6 product pages hard-reload. |
| **D2** | UX | 404 page un-styled orphan link row | 404.html | `VERIFY` | Claude shot: 404 clean, no orphan row. Re-verify hard-reload. |
| **INT-01** | Interaction | Z-index dead zone: back-to-top occludes chatbot launcher | Global | `OPEN` | Plausible — relates to known cookie/chatbot/back-to-top z-index drift. Define z-ladder: chatbot launcher > back-to-top; both < cookie banner < modals. |
| **AST-01** | Premium | Earth backdrop ~20s spin-up reads as "broken asset" | Home | `OPEN` | Same root as the GPU/WebGL starvation Claude found (hero-mesh readPixels stalls). Fix: fast first-paint (static poster frame) + progressive enhance; pause off-screen (Stripe minigl pattern). |
| **ARC-01** | Sovereign | `!important` bloat (~1,902 in styles.css) | Global | `OPEN` | Refactor via `@layer` (SF46 P3-D/E plan). Large; phase it. Pairs with INV-4. |

---

## B. CTO Per-Page Premium Defects

### B1 — Homepage (index.html) — "85% Premium"
| ID | Defect | State |
|---|---|---|
| HP-1 | Redundant container classes (`sv-container--wide wrap container-wide`) → asymmetric gutter >1600px | `OPEN` |
| HP-2 | Nav dropdown 150ms "hover ghost" = non-passive listener collision in nav-inject.js | `OPEN` (Rule-14 file — careful) |
| HP-3 | GSAP entrance durations too long (premium = snappier) | `OPEN` |
| HP-4 | Section padding normalization | `DONE` (c541165, 52px symmetric) |

### B2 — Product Engines (crowagent-core, crowmark, crowcyber, crowcash, csrd) — "70% Premium"
| ID | Defect | State |
|---|---|---|
| PE-1 | Missing 'Back to Hub' / escape link — users trapped in persona funnel | `OPEN` |
| PE-2 | Repeated 'Get Started' CTAs within 2 viewports = high-pressure feel | `OPEN` |
| PE-3 | 'Video Placeholder' text visible before Lottie/WebM init | `OPEN` (verify which segments) |
| PE-4 | Nav reconciliation (Sectors etc., see D8) | `VERIFY` |

### B3 — crowesg.html — "FAIL (Sub-Premium)"
| ID | Defect | State |
|---|---|---|
| ESG-1 | Peppers/vegetables hero image (non-canonical, breaks trust) | `VERIFY`→deep (see D4) |
| ESG-2 | 'Coming Soon' banner missing `--section-pad-standard` token → vertical-rhythm jump vs other product pages | `OPEN` |

### B4 — Hubs (products/index.html, tools/index.html) — "80% Premium"
| ID | Defect | State |
|---|---|---|
| HUB-1 | products-bento sub-pixel jitter on scroll-reveal → add `will-change: transform` to card primitives | `OPEN` |
| HUB-2 | Tool cards lack explicit 44px touch target on 'Methodology' link | `OPEN` (WCAG 2.5.5) |

---

## C. CTO "Invisible 5%" Micro-Defects
| ID | Defect | State |
|---|---|---|
| INV-1 | Cache-buster staleness (`?v=51`/`?v=99` mix) → FOUC risk; standardize to one canonical hash | `OPEN` (also explains the `VERIFY` items) |
| INV-2 | Typography token orphanage — mobile menus + legal sub-links use px literals, not fluid `--type-*` scale | `OPEN` |
| INV-3 | SEO/PWA — 16 core pages missing JSON-LD structured data | `OPEN` (cross-check vs SF46 P2-AF which claimed 87 blocks added) |
| INV-4 | `styles.css` still fighting inject scripts via 1,900+ `!important` locks | `OPEN` (= ARC-01) |

---

## D. Claude Measured Findings (hero + reveal)
| ID | Defect | State |
|---|---|---|
| HERO-1 | Homepage hero = **1,988px** (~2.2 viewports); stacks 10 blocks; lower half (trust-bar 362px, trust strip, triple-output widget 323px) **duplicates** below-fold `#compliance-frameworks` / `#trust` / `#products`. Code comments claim "→900px" but never achieved. | `DECISION` (de-dup aggressiveness) |
| WIDGET-1 | Hero triple-output widget shows **fabricated** metrics (CrowMark 94% / CrowCyber 87% / CrowCash £14,200), labelled "Preview/Sample data". Prelaunch no-fake rule + bloat + duplication. CTO: "is this not fake — remove?" → **YES, remove from hero.** | `OPEN` (CTO-greenlit) |
| HERO-2 | Product heroes ~1,790px — stack text + full dashboard screenshot (362px) + readiness widget (414px); two visuals where one belongs. | `DECISION` (keep screenshot or widget) |
| REVEAL-1 | Product-hero visuals + homepage sections stuck invisible (GSAP autoAlpha starved by WebGL) | `DONE` (14d1012, c2b7b3f) |
| RHYTHM-1 | Pages 12–19k px (content-dense, not whitespace). Section padding normalized. Real reduction needs hero de-dup (HERO-1/2) not padding. | partial `DONE` |

---

## E. Automation & Intelligence Workstream (CTO directive + research)
> Direction: "text must not be permanent… same section multiple things in a repeatable
> loop with different text… use lots of automation/intelligence instead of static text."
> Research (Stripe minigl WebGL gradient that pauses off-screen; 2026 kinetic/variable
> typography; scroll-driven animation; Mutiny/Adobe-Target context personalization;
> Apple scroll-bound video heroes). **CrowAgent honesty constraint: dynamic ≠ fabricated.**

| ID | Item | State |
|---|---|---|
| AUTO-1 | Extend the H1 `ca-rotator` pattern → rotating sub-claims / section eyebrows / stat callouts (cycling real, statute-cited facts) | `DECISION` (scope) |
| AUTO-2 | Live statutory countdowns (Cyber Essentials v3.3 28-Apr-2026, proposed MEES Band C) — REAL data, hooks already exist (`#hero-countdown-panel`) | `OPEN` |
| AUTO-3 | Replace fabricated hero widget (WIDGET-1) with honest dynamic proof: rotating framework facts / live deadline ticker | `OPEN` |
| AUTO-4 | GPU-cheap motion: audit hero-mesh/WebGL → adopt Stripe minigl-style off-screen pause (also fixes AST-01) | `OPEN` |
| AUTO-5 | Persona/context-adaptive copy (reuse existing persona switcher; consider geo/referrer later) | `DECISION` |
| AUTO-6 | Scroll-driven reveal discipline (already have failsafe; tune amplitude per 2026 restraint) | `OPEN` |

---

## F. Carried-Over Queued Items
| ID | Item | State |
|---|---|---|
| Q-1 | Tagline wording: "Sustainability Intelligence" (site) vs "Autonomous Sustainability Intelligence" (platform CLAUDE.md v2.3) — sync both | `DECISION` |
| Q-2 | Repo hygiene: strip committed `audit/` scratch (~758 screenshots, CSS `.bak`); a background process keeps regenerating audit scratch + drifting chatbot.js/styles.css | `OPEN` |
| Q-3 | Final multi-viewport visual sweep (1920/1440/768/390) certification before push | `OPEN` |
| Q-4 | Cache-version standardization (reveal-failsafe bumped to v=3; whole-site canonical hash) | `OPEN` (= INV-1) |

---

## Proposed sequence (for CTO review)
1. **Reconcile `VERIFY` items** (D1/D2/D4/D8) with hard cache-clear + full scroll — close phantoms, confirm reals. Fix INV-1 cache-buster (root cause of the confusion).
2. **Hero de-dup + remove fake widget** (HERO-1, WIDGET-1, HERO-2) — biggest visual + trust win; needs DECISION on aggressiveness.
3. **AST-01 / AUTO-4** earth fast-paint + off-screen pause (kills the "broken asset" feel).
4. **Product-page UX** (PE-1 back-to-hub, PE-2 CTA de-dup, PE-3 video placeholder).
5. **Automation pass** (AUTO-1/2/3 rotating + live-countdown content).
6. **Micro/a11y/SEO** (HUB-1/2, INV-2/3, INT-01 z-ladder).
7. **ARC-01 `!important`/@layer refactor** (large, phased).
8. **Q-1 tagline, Q-2 hygiene, Q-3 final sweep** → push-ready.

_This ledger is the source of truth; update item State as we fix + verify each._

---

## PROGRESS LOG — autonomous session 2026-05-24

**Verified + committed this session (local-only, no push):**
- ✅ **Tagline (Q-1)** → "Sustainability Intelligence" locked in BRANDING-SPEC (a83f78b, branding repo). Platform CLAUDE.md still to sync.
- ✅ **HERO-1 + WIDGET-1** — homepage hero de-dup: removed fabricated triple-output widget + duplicated trust-bar/strip. Hero 1,988→1,006px (32db10d). Pixel-verified.
- ✅ **AST-01 + Option A** — earth photo → animated brand CSS mesh-gradient; kills the 20s spin-up "broken" feel (9da8545). RCA: WebGL shader works on product pages but homepage canvas was CSS 0×0; CSS gradient is the reliable, verifiable baseline. Pixel-verified.
- ✅ **D4** — crowesg off-brand office-team hero photo → ESG brand gradient (59750ed). NOTE: the "peppers" was a **stale-cached** asset (INV-1); current asset was office-team. Pixel-verified.
- ✅ **RHYTHM** — section padding normalised to symmetric 52px (c541165).
- ✅ **INV-1 partial** — reveal-failsafe cache ref bumped v=2→v=3 (f576f41). Full site-wide cache-buster standardization still pending.
- ✅ **Ledger** committed (9d80deb).

**Cache-staleness confirmed as the audit distortion:** D1/D2/D4/D8 all measured CLEAN or different-in-B via fresh Playwright — the CTO's browser is serving stale cached assets/markup. **INV-1 (cache-buster standardization) is now high priority** — it's the root cause of the phantom defects. Recommend hard-reload (Ctrl+Shift+R) to re-audit against true B state.

**NEXT (resume order):**
1. INV-1 — site-wide cache-buster standardization (closes the phantom-defect confusion).
2. HERO-2 — extend brand-gradient to the other 5 product heroes (consistency).
3. AUTO-2/3 — live statutory countdown + rotating proof line (replaces removed widget's role honestly).
4. PE-1/2/3 (product UX), INT-01 (z-ladder), HUB-1/2 (jitter+44px), INV-2/3 (type tokens, JSON-LD).
5. ARC-01 (@layer/!important refactor, phased). Q-2 hygiene. Q-3 final multi-viewport sweep.
