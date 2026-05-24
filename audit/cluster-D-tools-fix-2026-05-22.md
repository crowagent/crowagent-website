# Cluster D — Tools, Intel, Methodology — visual fix 2026-05-22

## Scope
14 pages × 2 viewports (1440×900 desktop, 390×844 mobile) × 3 positions (fold, mid, footer) = 84 screenshots captured to `C:/tmp/cluster-D-tools/`.

Pages in scope:
- 6 tool sub-pages: `tools/csrd-applicability-checker/`, `tools/cyber-essentials-readiness/`, `tools/late-payment-calculator/`, `tools/mees-risk-snapshot/`, `tools/ppn-002-calculator/`, `tools/vsme-materiality-light/`
- 2 intel trackers: `intel/cyber-essentials-tracker/`, `intel/mees-tracker/`
- 6 methodology pages: `tools-{csrd-checker,cyber-essentials-readiness,late-payment-calculator,mees-risk-snapshot,ppn002-calculator,vsme-materiality-light}-methodology.html`

## Root-cause finding — CRITICAL P0
The blanket `nav { position: fixed; top: 0 }` rule at `styles.css:185` (added for the main site nav) was hijacking **every semantic `<nav>` element** on Cluster D pages:

- `<nav class="tool-methodology-toc">` on all 6 methodology pages → TOC fixed-pinned at top:209 on top of the H1, causing catastrophic text overlap on mobile (multiple lines of TOC anchors superimposed over the title) and broken sticky behavior on desktop.
- `<nav class="tool-breadcrumb">` on all 6 tool sub-pages → breadcrumb fixed-pinned at top:100 as a floating fake-second-header beneath the main nav.

Cluster A previously documented the same blanket-nav cascade for `.ca-chapter-nav` (band-aided with `display: none`). This is the proper fix for the two remaining `<nav>` families.

A companion issue: `Assets/css/sovereign-primitives.css:928` (`:where(ul, ol):not([role="list"])`) forces `display: flex; flex-direction: column` on every `<ol>/<ul>` without `role="list"`, which would stack each breadcrumb item on its own row even after the position fix.

## Defects classified

| Severity | Count | Description |
|----------|-------|-------------|
| CRITICAL | 6     | Mobile TOC catastrophically overlaps H1 on every methodology page |
| CRITICAL | 6     | Tool breadcrumb fixed-pinned as floating fake-header on every tool sub-page |
| HIGH     | 14    | Breadcrumb / TOC `<ol>` collapsed to vertical column by sovereign-primitives |
| LOW      | n/a   | Mid-page "blank" sample screenshots were artifact of sparse-content sampling, not real gaps (probe confirmed `gaps: []`) |

## Fix applied
`styles.css` (and mirrored to `styles.min.css`) — appended scoped overrides at EOF (after the existing `.ca-chapter-nav` Cluster A band-aid):

```css
.tool-breadcrumb,
.tool-methodology-toc {
  position: static !important;
  top: auto !important; left: auto !important; right: auto !important;
  height: auto !important; z-index: auto !important;
  background: transparent;
}
.tool-methodology-toc {
  background: var(--surf) !important;  /* restore card chrome */
}
@media (min-width: 901px) {
  .tool-methodology-toc {
    position: sticky !important;
    top: 96px !important;
    align-self: start;
  }
}
.tool-breadcrumb ol, .tool-breadcrumb ul {
  flex-direction: row !important;
  flex-wrap: nowrap !important;
  padding-inline-start: 0 !important;
  margin-block-end: 0 !important;
  gap: var(--space-1) !important;
  align-items: center;
}
.tool-breadcrumb li {
  padding-inline-start: 0 !important;
  display: inline-flex !important;
  align-items: center;
}
.tool-methodology-toc ol {
  padding-inline-start: 0 !important;
  margin-block-end: 0 !important;
  gap: 6px !important;
  list-style: none;
}
.tool-methodology-toc li { padding-inline-start: 0 !important; }
```

CSS-only fix — zero HTML changes, zero JS changes, zero out-of-scope file touches.

## Verification (28/28 PASS)

`tools/cluster-D-final-verify.mjs` measures computed `position` of breadcrumb + TOC, and `flex-direction` of breadcrumb `<ol>`, across every page × viewport:

```
Summary: 28 pass / 0 fail
```

All 14 pages × 2 viewports: breadcrumb `position: static`, breadcrumb `<ol> flex-direction: row`, methodology TOC `position: sticky` on desktop and `position: static` on mobile, TOC top is below hero (~740-886px depending on hero height).

## Regression check (PASS)
- `tools/cluster-D-regression.mjs` confirms home page header nav remains `position: fixed; top: 0; z-index: 1000` (the line-185 rule is intentional for the main nav and unchanged).
- Blog `<nav class="f10-breadcrumbs">` still resolves to `position: static` via the pre-existing reset at `styles.css:10656`.

## Gates
- All 14 pages HTTP 200: PASS
- `styles.css` brace integrity: 5625/5625 PASS
- `styles.min.css` brace integrity: 4272/4272 PASS
- 28/28 layout probes PASS
- Regression: home nav fixed, blog breadcrumb static — PASS

## Files modified
- `styles.css` — appended scoped overrides (47 lines, after line 28713)
- `styles.min.css` — appended minified equivalents (2 lines, EOF)

## Files NOT touched (scope discipline)
- No HTML files modified
- No `Assets/css/*` files modified
- No `js/*` files modified
- No marketing / product / legal / blog pages touched
- The 14 in-scope HTML files were read-only — the CSS fix covers them all
