# SF42 — E2E Audit Findings, Triage + Fix Plan

Submitted: 2026-05-18.
Source: founder-provided deep-dive audit covering UI/UX, visuals, flows, accessibility, brand, perf.
Status: every item captured, awaiting per-item approval before any code change.

## Priority key

- **P0** = critical defect or regression (visible or measurable user impact). Fix this session.
- **P1** = quality bug or significant UX issue. Fix soon, low/medium risk.
- **P2** = polish, maintainability, or advanced perf. Fix when budget allows.

---

## Full triage table

| ID | Pri | Category | Issue (one line) | Files / surface | Suggested fix | Risk |
|----|-----|----------|-------------------|-----------------|----------------|------|
| **C1** | **P0** | Smoke regression | "Pricing CTA links to signup with plan" Playwright test fails (`toBeVisible`) | `pricing.html` `.pgc-cta`, `scripts.min.js` plan-decorator | Verify the test selector against current `data-plan-tier` markup, confirm `?plan=` is appended on click, check for hidden state at the moment Playwright probes. Likely a race between the JS decorator and the assertion timing — wrap in `await page.waitForFunction(() => link.href.includes('plan='))`. | Low |
| **C2** | **P0** | Smoke regression | "CSRD checker has an actionable next step" test times out | `csrd.html`, `/tools/csrd-applicability-checker/`, wizard JS | Walk the wizard end-to-end in Playwright, identify where the "next step" element is supposed to appear, fix the missing DOM trigger or restore the link that was removed. | Medium |
| **C3** | **P0** | Architecture | No central form-validation module — `js/modules/ca-form-validation.js` 404, inline validation duplicated in contact / waitlist / CSRD | `js/modules/`, contact form, waitlist forms, CSRD wizard | Create `js/modules/ca-form-validation.js` with reusable rules (required, email, postcode, min/max). Refactor the three forms to consume it. Output unified error markup. | Medium |
| **C4** | **P0** | Conversion | Chatbot relies on a manual `<script>` tag at the bottom of each page — missing on new pages = no chatbot | every HTML page, `chatbot.js` | Inject `chatbot.js` via `nav-inject.js` (or a dedicated `js/load-chatbot.js`) so every page gets it without manual tag. Audit current pages for missing tags, then drop the per-page tag. | Low |
| **U1** | **P1** | UX polish | Nav-shrink "frost" feels choppy because it's a JS scroll listener at an 80px threshold | `js/modules/nav-shrink.js` | Switch to `animation-timeline: scroll()` (CSS scroll-driven animation) on supporting browsers; keep the JS path as fallback. Threshold lowered to 24px for smoother first-frame. | Low |
| **U2** | **P1** | UX polish | Pricing tab indicator jumps from tab-1 to active tab on initial paint | `js/modules/pricing-tabs-indicator.js` | Run the indicator-position calculation BEFORE the first paint (e.g., inline `style="transform: ..."` from server-rendered active tab, or measure-and-position synchronously in `DOMContentLoaded` instead of `load`). | Low |
| **U3** | **P1** | A11y / contrast | `--dim-c: #5A7A8E` on `--bg: #040E1A` is 3.24:1 — fails WCAG AA for body text | tokens file + every `.priv-meta`, `.cookies-meta`, `.changelog-meta`, `.hero-proof-item` | Bump `--dim-c` to a brighter mist (e.g., `#7E96B0` = ~4.6:1 contrast). Audit every selector that uses `--dim-c` for size — small text needs AA Large (3:1) but body needs 4.5:1. | Low |
| **U4** | **P1** | UX polish | `.sf21-back-to-top` z-index not explicit; may overlap mobile menu / cookie banner | `js/modules/sf21-back-to-top.js`, `Assets/css/sf21-*.css` | Add explicit `z-index: 90` (below cookie banner @ 100 and mobile menu @ 110), hide via `display: none` when either is open. | Low |
| **A1** | **P1** | A11y / semantics | Landmark "noise" — `<nav role="navigation">` wrapped in a `<div role="banner">` | `js/nav-inject.js`, page-level | Refactor to a single native `<header>` element wrapping the nav. Remove the role attributes (native landmarks). Re-run axe-core to confirm no regression. | Medium |
| **A2** | **P0** | A11y / regulatory | Cookie banner doesn't trap focus — keyboard users tab into the background while banner is active | `js/modules/cookie-banner.js`, ICO compliance | Add focus trap when banner is open (capture Tab/Shift-Tab, redirect to first/last focusable element inside banner). Restore focus to trigger when banner closes. ICO-mandated for cookie-consent UIs. | Low |
| **A3** | **P1** | A11y / motion | Some modules respect `prefers-reduced-motion`, others (`cinematic-init.js` `.reveal` opacity transitions) do not | `js/modules/cinematic-init.js`, related reveal CSS | Wrap `.reveal` opacity/transform transitions in `@media (prefers-reduced-motion: no-preference)`. Provide an immediate `opacity: 1` fallback for reduced-motion users. | Low |
| **B1** | **P0** | Brand consistency | `&bull;` separator in the wordmark: some places use a raw character, some use a CSS-rendered dot — uneven spacing | nav + footer logos, copyright row, og:image text | Pick one approach (the `<span class="logo-tag-sep">&bull;</span>` we already use is the cleanest). Audit every occurrence and replace inline `·` / `&middot;` / raw character with the canonical span. | Low |
| **B2** | **P1** | Brand maintainability | Tagline hardcoded in `nav-inject.js logoHTML()` — strategy change = JS update across 50+ pages | `js/nav-inject.js`, `crowagent-brand-tokens.css` | Move tagline string to a CSS custom property (`--brand-tagline-html`) or a JS constant exported from a single tokens module. nav-inject reads from it. | Low |
| **P1f** | **P2** | Perf | `scripts.min.js` is a 30KB monolith — pricing, wizard, contact logic all bundled | `scripts.min.js` source | Split into route-specific bundles: `scripts.core.js` (always-on), `scripts.pricing.js` (only on /pricing), `scripts.wizard.js` (only on /csrd, /tools/csrd-*). Load on-demand. | Medium |
| **P2f** | **P2** | Perf | Service Worker uses a static cache name not tied to `APP_VERSION` — stale site after deploy | `service-worker.js` | Embed `APP_VERSION` at build time into the cache name (`crowagent-v${APP_VERSION}`). Invalidate old caches in `activate` event. | Medium |
| **T1** | **P2** | Test coverage | No 3G-latency simulation of `ca-nav-ready` / footer phases | Playwright suite | Add a slow-3G throttled test that asserts footer renders ≤ 3s on `ca-footer-ready`. Fail the suite if Phase B is too slow. | Low |
| **T2** | **P1** | Print | `print.css` exists but `<nav>` and `<footer>` aren't `display: none` in `@media print` — wasted ink | `print.css` | Add `nav, .ca-footer, .announce-bar, #ca-cookie, .chat-launcher { display: none !important }` inside the print media query. Test by File → Print preview on /blog/*. | Low |
| **T3** | **P2** | Form resilience | Double-submit on Enter key in slow-connection scenario — basic guard exists but doesn't handle multiple Enter presses | contact form, waitlist forms | Add `submitting` flag at the JS level. On Enter or button-click: set flag, disable button, ignore subsequent events until response or 8s timeout. Re-enable after error. | Low |

---

## Recommended order of operations

**Wave 1 — P0s** (do this session, low coupling): C1, C2, C4, A2, B1.
C3 is also P0 but is a refactor that takes longer; could be split into wave 1 (create module) + wave 2 (migrate forms).

**Wave 2 — P1s** (next session): U1, U2, U3, U4, A1, A3, B2, T2.

**Wave 3 — P2s** (when budget allows): P1f, P2f, T1, T3.

---

## Notes on uncertainty

- **C1, C2** assume the Playwright tests exist somewhere in the repo. I haven't located them yet — if they live outside the repo (CI only), I need access to the test files before I can fix.
- **A2** says ICO requires a focus trap on cookie banners; that's my read of the regulation, not a literal quote. Worth verifying before claiming as a compliance requirement.
- **B1** "raw character vs CSS dot" — I want to grep the codebase first to confirm where the inconsistencies are. May be fewer occurrences than the audit implies.

I'll wait for your direction on which items to start with.
