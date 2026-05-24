# Agent — Dashboard Mockup Widgets — 2026-05-22

**Status:** SHIPPED. 6 widgets live on 6 product pages. Pure inline SVG/HTML.
Tokens-only (no hardcoded hex). macOS-style window framing. Mobile-scales.

**Tech contract:**
- Container class `.product-mockup-widget` (CSS in `styles.css` + `styles.min.css`)
- Each widget tagged with `data-mockup="..."` for future JS motion hooks
- Inserted immediately after the `<figure class="hero-visual">` element on each product page
- Tokens used: `--teal`, `--teal-l`, `--teal-08`, `--teal-12`, `--teal-15`, `--teal-20`,
  `--teal-30`, `--surf`, `--surf2`, `--surf3`, `--bg`, `--cloud`, `--mist`, `--err`,
  `--warn`, `--success`, `--danger-bg`, `--danger-border`, `--warning-bg`,
  `--warning-border`, `--success-bg`, `--success-border`, `--dot-close`,
  `--dot-minimize`, `--dot-maximize`
- `prefers-reduced-motion`: hover transform disabled
- Mobile breakpoint at 480px scales radial gauge + hero number + table

## Widget 1 — CrowMark · Bid Scorecard

**Page:** `crowmark.html` line 142 (post-hero `<figure>`)
**Selector:** `aside[data-mockup="bid-score"]`

**Sample data:**
- Radial gauge: **Bid score 94%** (teal gradient arc)
- Pill: "PPN 002 PASS" (success pill, tick SVG)
- Row: Social value **12.3 / 10**
- 3-row table:
  - Net Zero · 9.4 / 10 · Strong (ok pill)
  - Tackling economic inequality · 8.8 / 10 · Strong (ok pill)
  - Wellbeing · 7.2 / 10 · Review (warn pill)

**Evidence:**
- `audit/widgets-2026-05-22/crowmark-bid-score-1440.png`
- `audit/widgets-2026-05-22/crowmark-bid-score-390.png`

## Widget 2 — CrowCash · Recovery pipeline

**Page:** `crowcash.html` line 143
**Selector:** `aside[data-mockup="cash"]`

**Sample data:**
- Hero number: **£14,200** (teal)
- Subtitle: "Recovered this quarter, 3 closed invoices, statutory interest applied."
- Spark-line: 14 monotonic-up data points with end-dot (SVG path, area gradient teal)
- 3-row invoice table:
  - Acme Ltd · £4,500 · Statutory 8% (ok pill)
  - Bridgewater Mfg · £6,820 · Chase 2 (warn pill)
  - Northgate Logistics · £2,880 · Paid (ok pill)

**Evidence:**
- `audit/widgets-2026-05-22/crowcash-recovered-1440.png`
- `audit/widgets-2026-05-22/crowcash-recovered-390.png`

## Widget 3 — CrowCyber · Danzell v3.3 readiness

**Page:** `crowcyber.html` line 143
**Selector:** `aside[data-mockup="cyber"]`

**Sample data:**
- Radial gauge: **87%** (teal gradient)
- Title: "v3.3 Danzell ready"
- Pill: "1 control to action" (warn)
- Cyber Essentials 5-control checklist (4 ✓ teal, 1 ⚠ amber):
  - ✓ Firewalls and gateways
  - ✓ Secure configuration
  - ✓ Patch management (14-day SLA)
  - ✓ Malware protection
  - ⚠ User access control, SSO pending
- Action row: "Next: Configure SSO before 27 Apr 2026"

**Evidence:**
- `audit/widgets-2026-05-22/crowcyber-readiness-1440.png`
- `audit/widgets-2026-05-22/crowcyber-readiness-390.png`

## Widget 4 — CrowAgent Core · MEES risk snapshot

**Page:** `crowagent-core.html` line 151
**Selector:** `aside[data-mockup="mees"]`

**Sample data:**
- Danger status band: **MEES exposure £125,000** + "Band E, action by 2028" danger pill
- Tag row: Property 12 Oxford Street · EPC E (54) · 2,140 sq ft
- "Proposed band C 2028" eyebrow with "Gap: 2 bands" headline
- EPC mini-bar chart (5 bars, current E in red, target C in teal)
- Action row: "Upgrade to band D, save £45,000 in exposure"

Adheres to CLAUDE.md MEES rules: "proposed" band C 2028 (not law), fines below £150k.

**Evidence:**
- `audit/widgets-2026-05-22/crowagent-core-mees-1440.png`
- `audit/widgets-2026-05-22/crowagent-core-mees-390.png`

## Widget 5 — CrowESG · Double-materiality matrix

**Page:** `crowesg.html` line 139
**Selector:** `aside[data-mockup="materiality"]`

**Sample data:**
- Eyebrow: "Top priority topics" + "3 of 9 material" pill
- 2D scatter matrix (SVG): X-axis Financial materiality, Y-axis Impact materiality
- 9 dots total: 6 muted teal-l, 3 hot-teal in top-right cluster
- Dashed teal cluster-rectangle highlights the 3 top-right "high-priority" dots
- 3-row table of top topics:
  - Climate change (E1) · 8.9 / 10 · Material
  - Own workforce (S1) · 8.4 / 10 · Material
  - Business conduct (G1) · 7.8 / 10 · Material

**Evidence:**
- `audit/widgets-2026-05-22/crowesg-materiality-1440.png`
- `audit/widgets-2026-05-22/crowesg-materiality-390.png`

## Widget 6 — CSRD Checker · Applicability result

**Page:** `csrd.html` line 144
**Selector:** `aside[data-mockup="csrd"]`

**Sample data:**
- Eyebrow "CSRD applicable" + giant **YES** (teal) + "Confirmed" success pill
- Caption: "Post-Omnibus I thresholds: more than 1,000 employees AND more than €450M turnover."
- Tags: Threshold Large Group · First report FY 2026 · Assurance limited
- 3-row impact summary:
  - Mandatory ESRS topics · 9 · Scoped (ok pill)
  - Forward risk topics · 3 · Review (warn pill)
  - Value-chain exposure · Medium · Monitor (warn pill)
- Action row: "Next: Define materiality assessment for FY 2026 reporting cycle"

**Evidence:**
- `audit/widgets-2026-05-22/csrd-applicability-1440.png`
- `audit/widgets-2026-05-22/csrd-applicability-390.png`

## Verification log

```
[playwright] tests/widget-screenshots.spec.js — 12 passed (37.2s)
  6 widgets × 2 viewports (1440 + 390) = 12 PNGs cropped to widget element
  + 12 hero-context PNGs

[playwright] tests/smoke.spec.js — 25/25 passed (25.4s)
  Nav, CTAs, Contact form, CSRD wizard, Chatbot, Cookie banner, Blog all green

[brace balance]
  styles.css     : 5894 open / 5894 close  OK
  styles.min.css : 4672 open / 4672 close  OK

[viewport overflow probe @ 390px]
  CrowESG materiality widget: scrollWidth 338 == clientWidth 338  OK
  (no horizontal overflow inside the widget container)

[http 200 spot-check]
  crowmark.html       200
  crowcash.html       200
  crowcyber.html      200
  crowagent-core.html 200
  crowesg.html        200
  csrd.html           200
```

## Files modified

1. `crowagent-website/crowmark.html` — inserted 49-line bid-score widget after hero figure
2. `crowagent-website/crowcash.html` — inserted 40-line cash-recovered widget
3. `crowagent-website/crowcyber.html` — inserted 36-line readiness widget
4. `crowagent-website/crowagent-core.html` — inserted 36-line MEES-risk widget
5. `crowagent-website/crowesg.html` — inserted 53-line materiality-matrix widget
6. `crowagent-website/csrd.html` — inserted 41-line CSRD-applicability widget
7. `crowagent-website/styles.css` — appended ~440 lines of `.product-mockup-widget` CSS
8. `crowagent-website/styles.min.css` — appended minified equivalent (~6.7KB)
9. `crowagent-website/tests/widget-screenshots.spec.js` — new screenshot suite

## Contract self-disclosure

- **Forbidden patterns avoided:** zero bitmap images for widget content (pure SVG/CSS),
  zero hardcoded hex values inside `.product-mockup-widget` rules (all token-driven),
  zero inline `style="..."` on widget DOM (all classes), zero out-of-scope file edits.
- **Tokens used:** `--teal*`, `--surf*`, `--bg`, `--cloud`, `--mist`, `--err`, `--warn`,
  `--success`, `--danger-bg`, `--danger-border`, `--warning-bg`, `--warning-border`,
  `--success-bg`, `--success-border`, `--dot-close`, `--dot-minimize`, `--dot-maximize`.
- **Reduced-motion:** hover translate disabled via `@media (prefers-reduced-motion: reduce)`.
- **A11y:** widget root has `aria-label`; SVGs have `aria-hidden="true"` or `role="img"`
  with descriptive `aria-label`; tables use `role="table"`/`role="row"`/`role="cell"`.
- **CSS persisted in both `styles.css` and `styles.min.css`** per CLAUDE.md rule 3.
- **One file outside the in-scope HTML list was touched:** `tests/widget-screenshots.spec.js`
  is a new file (not modification of existing JS) used solely for verification screenshots,
  not loaded into the site. No `Assets/css/*`, `js/nav-inject.js`, `cookie-banner.js`, or
  `chatbot.js` were modified.
