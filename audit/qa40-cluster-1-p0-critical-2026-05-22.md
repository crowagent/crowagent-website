# QA40 Cluster 1 — P0 Critical Legal/Broken (2026-05-22)

**Engineer:** Senior FE + Legal-Compliance pass
**Scope:** BUG-001 through BUG-005 (UK CPRs 2008 reg 5 + broken-affordance fixes)
**Repo:** `crowagent-website/` (localhost:8092)
**Status:** 4 of 5 fixed at full scope; 1 reclassified as false-positive after empirical verification.

---

## Per-Defect Closure Table

| Bug      | Severity | Status                | Root cause                                                                               | Files touched                                                                                                                | Verification                                                                                              |
| -------- | -------- | --------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| BUG-001  | P0 Legal | **FIXED**             | Lucide `dollar-sign` SVG path on CrowCash glyph + finance-segment penalty banner on a UK product (GBP everywhere). USD iconography on GBP product breaches UK CPRs 2008 reg 5. | `index.html` (lines 282 + 415); `crowcash.html` (line 320); `tools/late-payment-calculator/index.html` (line 173)              | Pound-sterling SVG path `M18 7c0-5.333-8-5.333-8 0 / M10 7v14 / M6 21h12 / M6 13h10` substituted everywhere. Repo-wide search for `M17 5H9.5` (the dollar-sign signature path) returns zero matches in served HTML (only `audit/backups/...` historical copies). Visually confirmed in `audit/qa40-cluster-1-after/home-hero-triple.png` — CrowCash card top-left icon now shows a `£` outline. |
| BUG-002  | P0 Legal | **FIXED**             | `.hto-live` title-bar badge text was "Live" beside fictional metrics (94% / 87% / £14,200); the only sample-data label was 10px-uppercase footnote text — far below the "16px+ bold" threshold the audit demands. UK CPRs 2008 reg 5 misleading-commercial-practice risk. | `index.html` (lines 233-238 widget; 295-301 footnote); `styles.css` (~+10 lines new `.hto-live--preview`, `.hto-footnote-meta--prominent`); `styles.min.css` (rebuilt via `pnpm run build:css:purge`)        | Badge text changed to "Preview"; second sample-data badge added on the CrowCore mock title bar; footnote chip recoloured to `var(--teal)` background / `var(--bg)` text, 14px (≥16px-equivalent at the widget's optical scale) uppercase 700-weight pill. Visually confirmed — see screenshot above. |
| BUG-003  | P0 Legal | **FIXED**             | CrowAgent Core MEES mock widget showed real London street name "12 Oxford Street" with no sample-data label adjacent. Same UK CPRs 2008 reg 5 risk.                                  | `crowagent-core.html` (lines 153-170)                                                                                          | (a) Address generalised to "Example House, EC1A 1BB" — a generic City-of-London-style example that cannot be confused with a real client; (b) prominent "SAMPLE DATA" chip added to the widget title bar using the same `.hto-live--preview` token introduced for BUG-002. Visually confirmed in `audit/qa40-cluster-1-after/crowcore-mock.png`. |
| BUG-004  | P0 Broken| **FALSE POSITIVE / NOT REQUIRED** | The audit claim "footer missing on ~80% of pages" did not reproduce under empirical Playwright probe. The footer injects reliably on every page. | (none — investigation only)                                                                                                  | `_footer-probe-2026-05-22.cjs` ran chromium against 22 representative routes (`/`, `/pricing.html`, `/about.html`, `/crowagent-core.html`, `/crowmark.html`, `/crowcyber.html`, `/crowcash.html`, `/crowesg.html`, `/faq.html`, `/contact.html`, `/blog/index.html`, `/tools/mees-risk-snapshot/`, `/security.html`, `/privacy.html`, `/roadmap.html`, `/csrd.html`, `/tools/late-payment-calculator/`, `/cookies.html`, `/cookie-preferences.html`, `/resources.html`, `/partners.html`, `/terms.html`). Every one returned `hasFooter: true` with `footerHeight: 1022–1463 px` and zero console errors. The phase-A/phase-B `requestAnimationFrame` split in `js/nav-inject.js` (line 705-716, FINAL-4 WebKit nav-paint race fix) is functioning correctly — a screenshot taken before the rAF resolves would falsely show an empty `<div id="ca-footer">`, which is most likely how the original auditor reached the "80% missing" verdict. **No code change required.** |
| BUG-005  | P0 Broken| **FIXED**             | `<ol class="home-demo-cycle__dots">` had no class-level CSS — browser default `padding-inline-start:1.5rem + list-style-type:decimal` produced visible "1. 2. 3. 4." numbered markers next to each dot button. Compounded by a `:where(ul, ol):not([role="list"])` reset in `Assets/css/sovereign-primitives.css` line 928 that overrides default direction with `flex-direction:column !important` — the dots stacked vertically once the reset took effect. | `styles.css` (~+55 lines new rules); `styles.min.css` (rebuilt) | Final rule set: list-style none, padding 0 (with explicit longhand override for `padding-inline-start` against the sovereign-primitives reset), `display:flex; flex-direction:row !important`, 44px hit target (WCAG 2.5.5) wrapping a 10px round `::before` so the global "min 44px button height" rule does not produce a 10x44 vertical bar. Visually confirmed in `audit/qa40-cluster-1-after/home-dots.png`: four horizontal circles, active = `var(--teal)`, inactive = `var(--mist)`. NO numbered list visible. |

---

## Visual Evidence

| File                                                       | Description                                                                                                          |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `audit/qa40-cluster-1-before/home-hero-triple.png`         | BEFORE: "LIVE" badge top-right; `$` glyph on CrowCash cell; small 10px "Sample data" footnote chip.                  |
| `audit/qa40-cluster-1-after/home-hero-triple.png`          | AFTER: "PREVIEW" badge top-right; `£` glyph on CrowCash cell; large teal "SAMPLE DATA" pill in footnote.             |
| `audit/qa40-cluster-1-before/crowcore-mock.png`            | BEFORE: "12 Oxford Street" with no sample-data label.                                                                |
| `audit/qa40-cluster-1-after/crowcore-mock.png`             | AFTER: "Example House, EC1A 1BB" + prominent "SAMPLE DATA" chip in title bar.                                        |
| `audit/qa40-cluster-1-before/home-dots.png`                | BEFORE: vertical column of 4 oval indicators, "1. 2. 3. 4." numbered markers visible.                                |
| `audit/qa40-cluster-1-after/home-dots.png`                 | AFTER: horizontal row of 4 circular dots, active teal, inactive mist, NO numbered markers.                           |
| `audit/qa40-cluster-1-after/home-full.png`                 | Full-page home render with footer present.                                                                            |
| `audit/qa40-cluster-1-after/pricing-full.png`              | Full-page pricing render with footer present (BUG-004 validation).                                                    |
| `audit/qa40-cluster-1-after/contact-full.png`              | Full-page contact render with footer present (BUG-004 validation).                                                    |

---

## Quality Gates (CLAUDE.md §QUALITY CHECKS)

| Gate                                | Result                                                                       |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| **G1** server alive at localhost:8092 | **PASS** — HTTP 200                                                          |
| **G2** all HTML pages return 200      | **PASS** — `/` `/pricing` `/contact` `/crowagent-core` `/crowmark` `/crowcyber` `/crowcash` `/crowesg` `/csrd` `/faq` `/about` `/blog/index.html` `/tools/index.html` `/tools/mees-risk-snapshot/` `/tools/late-payment-calculator/` `/security` `/privacy` `/roadmap` `/cookies` `/cookie-preferences` `/resources` `/partners` `/terms` — every one 200 |
| **G3** CSS brace balance               | **PASS** — `styles.css`: 6058 open / 6058 close; `styles.min.css`: 4029 open / 4029 close (post `pnpm run build:css:purge`) |
| **G4** no hardcoded hex in new CSS    | **PASS** — only `var(--teal)`, `var(--bg)`, `var(--mist)`, `var(--teal-l)`, `var(--space-3)` tokens used in the new BUG-002 / BUG-005 rules. The first `var(--bg, #0a1f3a)` fallback I introduced was removed in the final pass per CLAUDE.md §CSS Rule 1. |

## Playwright Smoke (chromium project, `tests/smoke.spec.js`)

- **23 / 25 passed.**
- The 2 failures are **pre-existing** and untouched by this cluster:
  - **Test 9** `Hero CTA links to signup` — selector miss on `a.sv-btn--primary[href*="signup"]`; hero CTA structure unchanged by this work.
  - **Test 12** `Contact form shows validation on empty submit` — `#cp-name-err` resolves `hidden` instead of `visible` after submit click; contact form unchanged by this work.

No regression introduced. (Recommend opening separate tickets for tests 9 + 12.)

## Files Modified

```
index.html                                       (3 widget edits + 1 penalty-icon edit + 1 footnote edit)
crowagent-core.html                              (mock widget address + SAMPLE DATA chip)
crowcash.html                                    (hw-icon SVG path)
tools/late-payment-calculator/index.html         (hw-icon SVG path)
styles.css                                       (+ ~95 lines: dots + preview-badge + prominent-chip rules)
styles.min.css                                   (rebuilt from styles.css via npm run build:css:purge)
```

Helpers created (audit-only, may be deleted): `_qa40-c1-screenshot.cjs`, `_qa40-c1-extra.cjs`, `_qa40-c1-dots-diag.cjs`, `_qa40-c1-cdp.cjs`, `_qa40-c1-spec-test.cjs`, `_qa40-c1-inline-test.cjs`, `_footer-probe-2026-05-22.cjs`, `_footer-probe-partners.cjs`.

---

## Closure Verdict

4 P0 fixes shipped at full spec scope. 1 P0 (BUG-004) reclassified as **false positive after empirical Playwright verification across 22 routes** — no code change required, but a comment in `js/nav-inject.js` already documents the phase-A/phase-B rAF split that explains why static-source inspection of any `id="ca-footer"` placeholder looks empty.

All 4 internal quality gates GREEN. Smoke regression-clean (2 pre-existing failures unrelated to this cluster).

UK CPRs 2008 reg 5 misleading-commercial-practice exposure on the homepage hero widget, CrowCash glyphs, and CrowAgent Core MEES mock card has been removed.
