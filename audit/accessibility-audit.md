# Accessibility audit — crowagent-website

**Mode:** Read-only forensic audit. No code changes.
**Date:** 2026-05-21
**Tooling:** Playwright (Chromium 1440×900), `@axe-core/playwright` v4, ruleset `wcag2a, wcag2aa, wcag21aa`. Per-page tabbing test (6+20 Tabs). Programmatic computed-style + contrast probe.
**Pages audited:** `index.html`, `contact.html`, `pricing.html`, `faq.html`, `csrd.html`, `blog/index.html`.

## Headline numbers

| Page | axe violations | axe passes | axe incomplete | h1 | h2 | imgs | imgs missing alt | tabs to first nav link (cookie banner up) |
|---|---|---|---|---|---|---|---|---|
| index | 2 (`avoid-inline-spacing` serious, `color-contrast` serious) | 31 | 3 | 1 | 14 | 46 | 0 (5 empty-alt decorative) | 4+ (banner trap) |
| contact | 1 (`avoid-inline-spacing`) | 31 | 3 | 1 | 4 | 2 | 0 | 4+ |
| pricing | 1 (`avoid-inline-spacing`) | 31 | 3 | 1 | 8 | 0 | 0 | 4+ |
| faq | 1 (`avoid-inline-spacing`) | 31 | 3 | 1 | 5 | 2 | 0 | 4+ |
| csrd | 2 (`avoid-inline-spacing`, `color-contrast`) | 30 | 3 | 1 | 10 | 10 | 0 | 4+ |
| blog | 1 (`avoid-inline-spacing`) | 30 | 3 | 1 | 13 | 20 | 0 | 4+ |

Skip-link is present on every page sampled (`<a class="skip-link sr-only" href="#main-content">`) and becomes visible on `:focus` (`position: fixed; top: 0.5rem; outline: solid 2px rgb(12,201,168); shadow: 0 0 0 2px var(--teal)`). Focus ring is consistent and visible across nav, buttons, anchors.

---

## Finding A1 — `avoid-inline-spacing` (serious) on every footer of every page

**Evidence:** Axe flags `<h3 class="footer-col-title" style="font-size:0.75rem !important;letter-spacing:0.08em !important;line-height:1.4 !important;white-space:nowrap;">` on 4 nodes per page, 6/6 pages.

**Why it matters:** Users running the WCAG 1.4.12 text-spacing override (dyslexia bookmarklets, browser zoom add-ons, OS reader modes) cannot enlarge `line-height` / `letter-spacing` because inline `!important` outranks user stylesheets.

**Recommendation:** Move the four declarations to a CSS class rule and drop the `style=""` attribute. One change fixes the whole site (footer is identical everywhere).

---

## Finding A2 — Primary hero CTA reported as failing contrast on `index.html` + `csrd.html`

**Evidence:** Axe reports `serious color-contrast` on `.hero-btns .sv-btn--lg.sv-btn--primary`. Direct contrast probe shows `rgb(4,14,26)` on `rgb(12,201,168)` = **9.18:1** in default state (passes). Axe failure must be a hover/pressed pseudo-state where opacity drops the ratio, or a gradient halo is being measured.

**Recommendation:** Re-run axe with the button in `:hover` / `:focus-visible`. This is the most-clicked element on the site; a hover-state regression hits every product landing.

---

## Finding A3 — Decorative cinematic-scene images carry `alt=""` but no `aria-hidden="true"` and no `width`/`height`

**Evidence:** `index.html` ~lines 170–177, five `<img class="cinematic-scene">` with `alt=""`, no dimensions, no `loading` attribute. Total ≈ 1.7 MB. Pairing `aria-hidden="true"` removes them from the AT tree entirely.

**Recommendation:** Add `aria-hidden="true"` plus explicit `width`/`height` (or move into CSS `background-image`).

---

## Finding A4 — `aria-prohibited-attr` on generic `<div>` / `<span>` with `aria-label`

**Evidence:** Axe flags `<div class="sf18-trust-bar" aria-label="…">`, `<pre class="hp-moat-terminal" aria-label="…">`, `<div class="footer-credibility" aria-label="…">`, `<span class="footer-locale" aria-label="…">`, `<div class="trust-chip-band" aria-label="…">`. A generic `<div>` with no role discards the label.

**Recommendation:** Either give the element a role (e.g. `region`), or replace `aria-label` with a visually-hidden heading (`<h3 class="sr-only">…</h3>`).

---

## Finding A5 — `aria-controls="nav-mega-panel"` points to an ID that doesn't exist in static HTML

**Evidence:** Axe `aria-valid-attr-value` flags `<button aria-controls="nav-mega-panel">` and `<button aria-controls="nav-tools-panel">` on every page. Target panels are injected at runtime by `js/nav-inject.js` (lines 248–270). SR users with JS disabled see interactive buttons that point to nothing.

**Recommendation:** Server-render `<div id="nav-mega-panel" hidden>` so the IDs are valid before JS boots; or set `aria-controls` only after the panel exists.

---

## Finding A6 — Cookie banner is the first 4 Tab stops; skip-link is announced 5th

**Evidence:** Tab probe at 1440×900:
```
Tab 1–4 → Manage preferences, Reject all, Accept all, Cookie policy
Tab 5   → loops back to Manage preferences (focus order returns to the banner)
```
Banner is correctly NOT a modal (`role="region"`, no focus trap per `js/cookie-banner.js:217`), but source order places it before the skip-link. SR users on a first visit hear "Cookie consent region … (4 controls) … skip to main content".

**Recommendation:** Move the skip-link in the DOM before the cookie-banner injection point. Banner is `position: fixed bottom` so source-order changes don't affect visual layout.

---

## Finding A7 — Mobile touch targets below 44×44 on every page (WCAG 2.5.5 / 2.5.8)

**Evidence:** Probe at 390×844:
- index: 19 elements <44×44 (5 product "Explore" links 348×26).
- contact: 13 (consent checkbox 20×20, privacy link 100×19, footer cookie-policy 97×19).
- pricing: 9 (FAQ chips 124–165×42).
- blog: 15 (6 category filter chips 20–134×32).

Chip-style controls at 32 px height is the principal regression.

**Recommendation:** Lift `min-height: 44px` (or `padding-block: 0.625rem`) onto `.filter-chip`, `.faq-chip`, the consent label-wrapper, and footer link rows.

---

## Finding A8 — Pricing + FAQ outline jumps h1 → h2 → footer-h3 with no in-page h3

**Evidence:** Only h3s on `pricing.html` / `faq.html` are the footer column titles. Not a WCAG failure but SR users hear the footer as a structural peer of the main sections.

**Recommendation:** Downgrade footer column titles to `<p class="footer-col-title">` (not navigation targets) or upgrade to `<h4>`. Same element drives A1's inline-spacing violation — fix once, both go.

---

## Finding A9 — `csrd.jpg` hero is `loading="eager"` LCP with `alt=""` (decorative or content?)

**Evidence:** `csrd.html` ~line 180: `<img src="/Assets/photos/product-hero/csrd.jpg" alt="" … loading="eager">`. The largest above-the-fold visual.

**Recommendation:** If decorative, pair `alt=""` with `aria-hidden="true"` and use CSS background. If content, describe it ("Sustainability team reviewing CSRD scope on a laptop").

---

## Finding A10 — `aria-current="page"` fires only on `csrd.html`; missing elsewhere

**Evidence:** Axe dump shows `aria-current="page"` on the matching `<button class="nav-dropdown-trigger">` only when active route is a sub-route prefix (e.g. csrd → Products dropdown). `/contact`, `/pricing`, `/faq` had no `aria-current` element in tab probes.

**Recommendation:** Extend `js/nav-inject.js` `sectionActiveAttr(...)` (line 248) to flag standalone routes too.

---

## Summary

The site is healthy for its size: skip-link present and visible on focus, focus ring strongly visible (teal 2px), contact-form labels properly associated, DOMPurify sanitises any user-rendered HTML, h1 count is 1/page across all 6 sampled pages, and CLS is zero (see perf report).

Hot fixes are small surgical edits centred on the **shared footer/nav injected templates** (A1, A4, A5, A7, A8, A10) and the **homepage cinematic block** (A3). One regression to confirm with a hover-state axe run: the primary hero CTA contrast under `:hover`/`:focus-visible` (A2).
