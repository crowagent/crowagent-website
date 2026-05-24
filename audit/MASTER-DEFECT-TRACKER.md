# MASTER DEFECT TRACKER — Phase 5 Forensic Audit
**Generated:** 2026-05-21
**Source:** 8 parallel forensic audit reports in `/audit/` + earlier session findings + smoke-test failures
**Total tracked defects:** **100** (UI 17, Responsive 13, Accessibility 10, Component 11, Design-System 11, Architecture 13, Performance 11, Security 10, Smoke 4)
**Status:** READ-ONLY catalogue — no fixes have been applied yet. Fix-prompt saved at `/remediation/PENDING-FIX-PROMPT.md` awaiting execution.

---

## Severity legend
- **CRITICAL** — unusable UI / major layout breakage / a11y blocker / broken flow / 404 / clipped content
- **HIGH** — major inconsistency / visible drift / fragmented system / pixel collision
- **MEDIUM** — spacing drift / typography variance / minor alignment / minor a11y
- **LOW** — polish / cosmetic / future-proofing

---

## Counts by severity

| Bucket | CRITICAL | HIGH | MEDIUM | LOW | Total |
|---|---:|---:|---:|---:|---:|
| UI / UX | 2 | 4 | 8 | 3 | **17** |
| Responsive | 1 | 4 | 5 | 3 | **13** |
| Accessibility | 1 | 4 | 4 | 1 | **10** |
| Component consistency | 2 | 3 | 4 | 2 | **11** |
| Design system | 1 | 3 | 5 | 2 | **11** |
| Frontend architecture | 2 | 4 | 5 | 2 | **13** |
| Performance | 1 | 3 | 5 | 2 | **11** |
| Security | 0 | 1 | 5 | 4 | **10** |
| Smoke test (chatbot) | 0 | 4 | 0 | 0 | **4** |
| **GRAND TOTAL** | **10** | **30** | **41** | **19** | **100** |

---

## §1 — UI / UX DEFECTS (17)

| ID | Severity | Title | Affected | Evidence file |
|---|---|---|---|---|
| UI-01 | CRITICAL | Footer column headers collide on every page | Site-wide footer | `audit/ui-ux-findings.md` |
| UI-02 | HIGH | Trust-badge row has two contradictory layouts | Multiple pages | `audit/ui-ux-findings.md` |
| UI-03 | HIGH | Wordmark/logo uses two completely different treatments | ~30 pages mixed | `audit/ui-ux-findings.md` |
| UI-04 | CRITICAL | 404 page renders unstyled | 404.html | `audit/ui-ux-findings.md` |
| UI-05 | HIGH | Hero background fragmented across 6 product pages | Product pages | `audit/ui-ux-findings.md` |
| UI-06 | MEDIUM | Breadcrumbs misaligned on legal pages | Security/Privacy/Terms/Contact | `audit/ui-ux-findings.md` |
| UI-07 | MEDIUM | Decorative teal stripe leaks upper-left on legal | 6 pages | `audit/ui-ux-findings.md` |
| UI-08 | HIGH | Card class drift — 8+ distinct card components | Site-wide | `audit/ui-ux-findings.md` |
| UI-09 | MEDIUM | Button class drift — .sv-btn / .btn / .seg-btn / .demo-widget-btn | Site-wide | `audit/ui-ux-findings.md` |
| UI-10 | MEDIUM | Persona-switcher tabs and CTA pill bar visually fight | index.html | `audit/ui-ux-findings.md` |
| UI-11 | HIGH | Blog post `ppn-002-social-value-explained` has no hero H1 above fold | 1 blog page | `audit/ui-ux-findings.md` |
| UI-12 | MEDIUM | Product pages duplicate nav-tab "About" + sticky in-page rail | 4 product pages | `audit/ui-ux-findings.md` |
| UI-13 | MEDIUM | Cookie banner permanently covers footer trust badges | Site-wide | `audit/ui-ux-findings.md` |
| UI-14 | MEDIUM | Intel/tracker pages use different hero archetype | 2 tracker pages | `audit/ui-ux-findings.md` |
| UI-15 | LOW | Glossary pages have three different chip/eyebrow styles | Glossary surfaces | `audit/ui-ux-findings.md` |
| UI-16 | MEDIUM | Sub-themed product cards reintroduce six colour palettes | Product surfaces | `audit/ui-ux-findings.md` |
| UI-17 | LOW | Inconsistent text alignment in mid-page paragraph rhythm | roadmap.html | `audit/ui-ux-findings.md` |

## §2 — RESPONSIVE DEFECTS (13)

| ID | Severity | Title | Viewport | Pages |
|---|---|---|---|---|
| RESP-01 | CRITICAL | H1 truncates off the right edge of viewport | m320, m390 | crowagent-core.html |
| RESP-02 | HIGH | `<h3>` cards render 10–17 lines crushed | All | about.html |
| RESP-03 | HIGH | Persistent cookie banner blocks lower 104px | All | Site-wide |
| RESP-04 | HIGH | `.comparison-table` overflows mobile, no scroll cue | m320, m390 | pricing.html |
| RESP-05 | HIGH | `<code>` block exceeds 600px on mobile | m320, m390 | index.html |
| RESP-06 | MEDIUM | `.hp-moat-comment` annotations overflow callout column | m320, m390 | index.html |
| RESP-07 | MEDIUM | `.how-tabs` overflows the t768 viewport | t768 | index.html |
| RESP-08 | MEDIUM | H1 heroes wrap to 4-6 lines on m320 | m320, m390 | Multiple |
| RESP-09 | MEDIUM | Doc scroll height 28,338px on mobile homepage | m320 | index.html, crowagent-core.html |
| RESP-10 | MEDIUM | Mobile-menu drawer renders in DOM at desktop widths | 1024+ | All pages |
| RESP-11 | LOW | Hero backdrop bleeds 30-70px past viewport | All | index.html |
| RESP-12 | LOW | Marquee tracks measure 3,600px on every viewport | All | index.html |
| RESP-13 | LOW | `.pricing-banner` overflows by 26px at m320 | m320 | pricing.html |

## §3 — ACCESSIBILITY DEFECTS (10)

| ID | Severity | Title |
|---|---|---|
| A1 | HIGH | `avoid-inline-spacing` (serious axe violation) on every footer of every page |
| A2 | HIGH | Primary hero CTA reported as failing contrast on index.html + csrd.html |
| A3 | MEDIUM | Decorative cinematic-scene images have alt="" but no aria-hidden + no width/height |
| A4 | MEDIUM | `aria-prohibited-attr` on generic `<div>`/`<span>` with `aria-label` |
| A5 | HIGH | `aria-controls="nav-mega-panel"` points to a non-existent static-HTML ID |
| A6 | MEDIUM | Cookie banner controls are first 4 tab stops; skip-link arrives 5th |
| A7 | CRITICAL | Mobile touch targets below 44×44 on every page (WCAG 2.5.5/2.5.8) |
| A8 | HIGH | Pricing + FAQ outline jumps h1 → h2 → footer-h3 with no in-page h3 |
| A9 | LOW | csrd.jpg hero is loading="eager" LCP with alt="" (decorative vs content unclear) |
| A10 | MEDIUM | `aria-current="page"` fires only on csrd.html; missing elsewhere |

## §4 — COMPONENT CONSISTENCY DEFECTS (11)

| ID | Severity | Title |
|---|---|---|
| C-1 | CRITICAL | 72 distinct `*-card` class families in the CSS layer |
| C-2 | CRITICAL | 56 distinct `*btn*` class families across CSS |
| C-3 | HIGH | Three competing layout-primitive systems for grids |
| C-4 | HIGH | Container API: 4 named variants + `wrap` alias + raw `.container` |
| C-5 | HIGH | Card components have inconsistent semantic markup |
| C-6 | MEDIUM | `triple-card`/`premium-card`/`bento-card` in premium-mockup HTML |
| C-7 | MEDIUM | Two parallel skeleton-loader components |
| C-8 | MEDIUM | Icon primitive has Sovereign `sv-icon` AND legacy `ca-icon` |
| C-9 | MEDIUM | Hero pattern duplicated: `hero-split` + `hero-product-sf18` + inline |
| C-10 | LOW | Pricing has its own card / extras CSS that duplicates ladder tokens |
| C-11 | LOW | Button family adoption in HTML is healthy — informative, no fix |

## §5 — DESIGN SYSTEM DEFECTS (11)

| ID | Severity | Title |
|---|---|---|
| D-1 | CRITICAL | **749 broken `var(----…)` references** (four hyphens, evaluate to unset) |
| D-2 | HIGH | Typography scale drift — 39 distinct hardcoded `font-size:` values |
| D-3 | HIGH | Two parallel spacing systems with 11 + 10 token names |
| D-4 | HIGH | 1,005 raw `rgba(…)` literals despite 50+ semantic colour tokens |
| D-5 | MEDIUM | 36 distinct hardcoded `border-radius:` literals |
| D-6 | MEDIUM | 18 sprint-labelled CSS blocks in styles.css (`SF10`…`SF46`) |
| D-7 | MEDIUM | Multiple competing Google-Fonts requests across HTML pages |
| D-8 | MEDIUM | 22 distinct `font-family:` declarations |
| D-9 | MEDIUM | Z-index legacy escape hatches survive token registry |
| D-10 | LOW | 73 inline `style="..."` attributes in production HTML |
| D-11 | LOW | Stale CSS backup files shipped in production tree |

## §6 — FRONTEND ARCHITECTURE DEFECTS (13)

| ID | Severity | Title |
|---|---|---|
| ARCH-1 | CRITICAL | styles.css = 33,027-line single file with 18 sprint accretions |
| ARCH-2 | CRITICAL | 749 broken `var(----…)` references (cross-ref D-1) |
| ARCH-3 | HIGH | 2,712 `!important` declarations across CSS |
| ARCH-4 | HIGH | Stale CSS backups in publish root |
| ARCH-5 | HIGH | HTML page-level stylesheet imports drift (46 distinct `<link>`) |
| ARCH-6 | HIGH | Two `@layer` declarations with non-identical orderings |
| ARCH-7 | MEDIUM | `_archive/` directory leaks legacy CSS into publish tree |
| ARCH-8 | MEDIUM | `crowagent-brand-tokens.css` imported twice |
| ARCH-9 | MEDIUM | `styles.min.css` exists but `styles.css` loaded on some pages |
| ARCH-10 | MEDIUM | 33 separate stylesheets in `Assets/css/` |
| ARCH-11 | MEDIUM | ~92% of styles.css is "legacy" per backup deltas |
| ARCH-12 | LOW | Test fixtures `tests/fixtures/sf46-*.html` in publish path |
| ARCH-13 | LOW | JS-injected nav and footer make HTML diffing hard |

## §7 — PERFORMANCE DEFECTS (11)

| ID | Severity | Title |
|---|---|---|
| P1 | HIGH | styles.css = 1,227 KB (33,027 lines) — largest static asset |
| P2 | CRITICAL | `<link rel="preload" href="/js/scripts.min.js">` 404s on 23 pages |
| P3 | HIGH | Homepage ships 1.87 MB of images (10 requests) |
| P4 | MEDIUM | 5 `<img class="cinematic-scene">` lack width/height (CLS risk) |
| P5 | HIGH | Dead CSS: 15 of 25 sampled classes have ZERO HTML references |
| P6 | MEDIUM | 472 `@media` blocks, 141 `!important`, 177 backdrop-filter declarations |
| P7 | MEDIUM | Contact/pricing/faq/blog load 13-18 separate CSS files |
| P8 | MEDIUM | Blog index fetches Unsplash cross-origin with no preconnect |
| P9 | MEDIUM | Inline `style="..."` 129 times on index.html (49 pricing, 65 csrd) |
| P10 | LOW | Service worker precache versions out of sync with HTML |
| P11 | LOW | Homepage byte split: images 47%, CSS 18%, JS 12% (informative) |

## §8 — SECURITY DEFECTS (10)

| ID | Severity | Title |
|---|---|---|
| S1 | HIGH | Two divergent Content-Security-Policy values (HTTP header vs HTML meta) |
| S2 | MEDIUM | `frame-ancestors 'none'` in meta silently ignored |
| S3 | MEDIUM | SRI present on 3 of 4 external CDN scripts; Turnstile lacks it |
| S4 | MEDIUM | formspree.io/f/xbdpkaol public form endpoint on privacy + crowesg |
| S5 | LOW | No API keys or secrets in source (informative) |
| S6 | MEDIUM | innerHTML 11× in production JS (all SVG/DOMPurified — verify) |
| S7 | LOW | Production HTML has zero inline event handlers (informative — good) |
| S8 | LOW | HTTP security headers are best-practice; one COEP `credentialless` nit |
| S9 | MEDIUM | Three external POST destinations open from any form (form-action gap) |
| S10 | LOW | Service worker correctly limits cache to GET requests (informative — good) |

## §9 — SMOKE-TEST FAILURES (4)

| ID | Severity | Title |
|---|---|---|
| SMOKE-1 | HIGH | Chatbot button click intercepted by cookie banner (chromium, test 17) |
| SMOKE-2 | HIGH | Chatbot button click intercepted by cookie banner (firefox, test 17) |
| SMOKE-3 | HIGH | Chatbot Escape close fails — same root cause (chromium, test 18) |
| SMOKE-4 | HIGH | Chatbot Escape close fails — same root cause (firefox, test 18) |

---

## §10 — ROOT-CAUSE GROUPING (the patterns behind the 100 symptoms)

| Root cause | Symptoms it produces |
|---|---|
| **SF-wave CSS layering without retirement** | UI-01, UI-02, UI-03, UI-05, UI-08, UI-09, UI-12, UI-15, UI-16, C-1, C-2, C-3, C-4, C-6, C-8, C-9, ARCH-1, ARCH-3, ARCH-11, D-2, D-6 |
| **Two parallel render paths for shared chrome (nav + footer + trust + cookie)** | UI-02, UI-03, UI-04, UI-13, A-1, A-7, ARCH-13, SMOKE-1, SMOKE-2, SMOKE-3, SMOKE-4, RESP-03 |
| **749 broken `var(----…)` token references** | D-1, D-2, ARCH-2, parts of UI-01 (footer text bigger than expected) |
| **No card / button component registry** | UI-08, UI-09, UI-16, C-1, C-2, C-5, C-11 |
| **Per-product palette never finalised** | UI-05, UI-16, partial UI-08 |
| **Cookie banner has no body padding reserve** | UI-13, RESP-03, SMOKE-1..4, partial UI-10 |
| **Hero archetype not enforced across page types** | UI-05, UI-12, UI-14, RESP-01, RESP-02, RESP-08 |
| **Mobile breakpoint clamps too high** | RESP-01, RESP-04, RESP-05, RESP-06, RESP-07, RESP-08, RESP-09, RESP-13 |
| **!important density (2,712) hides real cascade weakness** | D-1, ARCH-3, partial UI-01 |
| **Inline-style/CSS conflict** | D-10, P9, A-1 |

---

## §11 — STATUS

| Phase | State |
|---|---|
| Audit | ✅ Complete (8 reports + this tracker) |
| Fix prompt saved | ✅ `/remediation/PENDING-FIX-PROMPT.md` |
| Fixes applied | ⏸️ NONE — awaiting founder go-ahead |
| Validation | ⏸️ Pending fix execution |

**Smoke test baseline:** 46 / 50 passed (4 chatbot failures from cookie banner pointer-events).
**Validator gates:** geometric-truth GREEN · principal-spec 51/51 · reconciliation-checker GREEN · sovereign-sheriff 10/10 zero-drift (within their scope — they do NOT catch the 96 audit findings above).

---

*This file is the single source of truth for the open defect ledger. Update statuses here as fixes are applied. No fix should land without an entry in this table being updated.*
