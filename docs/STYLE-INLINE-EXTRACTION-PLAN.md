# Inline Style Extraction Plan (DEF-004 / WEB-AUDIT-092)

**Goal:** remove `'unsafe-inline'` from the `style-src` directive in `_headers`
so the production CSP no longer permits inline-style injection. This is the
single largest XSS-hardening item left in the marketing-site security audit.

The `_headers` file currently still ships `style-src 'self' 'unsafe-inline'
https://fonts.googleapis.com` because removing `'unsafe-inline'` while ANY
inline `style="…"` attribute remains in the served HTML would break visible
layout on every page. The work has therefore been split into two phases.

---

## Inventory at session start (2026-05-06)

| Surface                          | Count | Status            |
|----------------------------------|------:|-------------------|
| `<style>` blocks in `<head>` / `<main>` | 24    | EXTRACTED this PR |
| Inline `style="…"` attributes     | 453   | DEFERRED           |

The audit target of 399 inline-style attributes was an undercount; a fresh
sweep produced **453** matches across 60 HTML files. Distribution by area:

| Area     | Inline-style count |
|----------|-------------------:|
| Root pages (e.g. `pricing.html`, `index.html`) | 203 |
| Blog posts (`blog/*.html`)                      | 140 |
| Glossary (`glossary/*.html`)                    | 110 |
| Product / tool / partner pages                  |  varies — included in root |

(Numbers above match `Grep "style=\"" -count` on the working tree as of
2026-05-06.)

---

## Phase 1 — `<style>` blocks (DONE in this PR)

24 `<head>`-injected `<style>` blocks were extracted into three new
stylesheets under `Assets/css/`:

| New stylesheet                  | Purpose                                                      | Files referencing it |
|---------------------------------|--------------------------------------------------------------|----------------------|
| `Assets/css/blog-article.css`   | Shared article shell, breadcrumb, callout, footer-cta + per-post extras (`.scope-block`, `.callout-warn`, `.reg-table`, `.cost-table`, `.worked-example`, `.citations`, `.article-badge-gold`, `[data-blog-color="mark"]` overrides) | `blog/csrd-omnibus-i-2026.html`, `blog/cyber-essentials-v3-3-danzell-2026.html`, `blog/epc-register-explained.html`, `blog/mees-band-c-2028.html`, `blog/mees-exemptions-guide.html`, `blog/mfa-mandatory-2026.html`, `blog/ppn-002-guide.html`, `blog/ppn-014-cyber-essentials-guide.html`, `blog/ppn-002-social-value-guide.html`, `blog/regulatory-updates-2026.html`, `blog/retrofit-cost-calculator-guide.html`, `blog/social-value-themes-explained.html` |
| `Assets/css/intel-tracker.css`  | Shared two-column tracker layout (timeline + sticky rail)    | `intel/mees-tracker/index.html`, `intel/cyber-essentials-tracker/index.html` |
| `Assets/css/page-styles.css`    | Per-page one-offs (legal-content, founders-grid, security-grid, product-hub-grid, error-page, blog-index, cookie-row, changelog-entry, calendly fix) | `404.html`, `about.html`, `blog/index.html`, `changelog.html`, `cookie-preferences.html`, `cookies.html`, `demo.html`, `products/index.html`, `security.html`, `terms.html` |

**Per-page colour variants** are now expressed as a `data-blog-color` attribute
on `<body>` (e.g. `<body data-blog-color="mark">` on
`blog/social-value-themes-explained.html`). Adding a new colour-themed blog
post is a one-line attribute, not a copy-paste of 130 lines of CSS.

---

## Phase 2 — inline `style="…"` attributes (NOT YET DONE)

453 inline `style="…"` attributes remain. These cannot be batch-deleted
mechanically — each requires deciding between three replacement strategies:

1. **Promote to a utility class** in `styles.css` (`.u-mt-12`, `.u-mb-24`,
   `.u-bg-primary-soft`, `.u-text-warn-soft`, etc.). Use this for any value
   that recurs across more than one element.
2. **Promote to a component class** in the appropriate `Assets/css/*.css`
   stylesheet when the inline style is doing component-level work (e.g.
   `.pricing-banner`, `.regulatory-footnote`).
3. **Move to the page CSS** when the style is genuinely one-off.

### Recommended PR cadence

Splitting Phase 2 into roughly per-area PRs keeps each diff small enough to
review:

| PR | Scope                                | Approx. inline-style count |
|----|--------------------------------------|---------------------------:|
| 1  | `index.html`                          | 5  |
| 2  | `pricing.html`                        | 21 |
| 3  | `crowmark.html`, `crowagent-core.html`, `crowcyber.html`, `crowcash.html`, `crowesg.html`, `csrd.html` | 21 |
| 4  | `about.html`, `contact.html`, `partners.html`, `demo.html`, `security.html`, `tools.html` | 78 |
| 5  | `glossary/*.html` (6 files)            | 110 |
| 6  | `blog/*.html` (21 files)               | 140 |
| 7  | `tools-*-methodology.html`, `tools-*.html`, leftovers | 78 |
| 8  | _Final sweep + remove `'unsafe-inline'` from `_headers`_ |  0 |

After PR 7 there will be zero remaining inline `style="…"` attributes.
PR 8 is the security-hardening commit:

```diff
- Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ...
+ Content-Security-Policy: default-src 'self'; style-src 'self' https://fonts.googleapis.com; ...
```

`style-src-attr 'unsafe-inline'` should be removed in the same edit. Do not
touch `script-src` (it already disallows `'unsafe-inline'`).

### Verification per PR

For every Phase-2 PR:

1. `grep -c 'style=\"' <files-touched>` must drop by the expected delta.
2. Visual diff of every page touched (Cloudflare Pages preview).
3. `npm test` (Jest) — must stay green; CSS extraction does not affect JS unit tests.
4. `npm run test:responsive` (Playwright) — must stay green.
5. After PR 8 only: confirm in DevTools that the served `Content-Security-Policy`
   header no longer contains `'unsafe-inline'` in `style-src`. Confirm no
   console warning of the form `Refused to apply inline style…`.

### Why this isn't done in one go

A single PR removing all 453 inline-style attributes would touch every HTML
file in the repository, making review impossible. The HTML-attribute removal
also forces a CSS-class-naming decision per attribute. Spreading across 7+ PRs
allows naming consistency to emerge without locking the whole site in one
review cycle.

---

## Files changed by Phase 1 (this PR)

New:

- `Assets/css/blog-article.css`
- `Assets/css/intel-tracker.css`
- `Assets/css/page-styles.css`
- `docs/STYLE-INLINE-EXTRACTION-PLAN.md` (this file)

Modified (24 files — `<style>` block removed, `<link>` to new stylesheet added,
`data-blog-color="mark"` added to one body):

- `404.html`
- `about.html`
- `changelog.html`
- `cookie-preferences.html`
- `cookies.html`
- `demo.html`
- `products/index.html`
- `security.html`
- `terms.html`
- `blog/index.html`
- `blog/csrd-omnibus-i-2026.html`
- `blog/cyber-essentials-v3-3-danzell-2026.html`
- `blog/epc-register-explained.html`
- `blog/mees-band-c-2028.html`
- `blog/mees-exemptions-guide.html`
- `blog/mfa-mandatory-2026.html`
- `blog/ppn-002-guide.html`
- `blog/ppn-002-social-value-guide.html`
- `blog/ppn-014-cyber-essentials-guide.html`
- `blog/regulatory-updates-2026.html`
- `blog/retrofit-cost-calculator-guide.html`
- `blog/social-value-themes-explained.html`  (also gets `data-blog-color="mark"` on `<body>`)
- `intel/cyber-essentials-tracker/index.html`
- `intel/mees-tracker/index.html`

Unchanged (deferred — Phase 2):

- `_headers` — `style-src 'unsafe-inline'` retained until Phase 2 PR 8.
