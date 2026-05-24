# Responsive Breakage Report — 2026-05-21

## Methodology

A custom Playwright script (executed from `C:/tmp/resp-audit/`, never committed to the repo) drove a headless Chromium against `http://localhost:8092` for nine routes (`index.html`, `pricing.html`, `about.html`, `contact.html`, `faq.html`, `crowagent-core.html`, `blog/mees-band-c-2028.html`, `glossary/index.html`, `tools/index.html`) across six viewports (320×720, 390×844, 768×1024, 1024×900, 1440×900, 1920×1080) — 54 page-loads. For each viewport, two scroll positions (top + 45% of `scrollHeight`) were measured. The script captured: `document.documentElement.scrollWidth/clientWidth/scrollHeight`, `window.scrollX`, every element whose `boundingClientRect.width` exceeded the viewport, all primary CTAs (size, position, visibility), all `h1/h2/h3` (font-size, computed line count, `word-break`/`hyphens`), cookie-banner rect, fixed-width offenders (`<table>`, `<img>`, `<iframe>`, marquees, grids), and any `pageerror` events. Two follow-up probes (`probe.js`, `probe2.js`) verified suspect findings — ancestor visibility for apparent off-screen CTAs (confirming false-positives from the off-canvas mobile menu) and the cookie-banner dismiss path.

## Issues found

### RESP-01 — H1 truncates off the right edge of the viewport on `crowagent-core.html`
**Severity:** CRITICAL
**Viewport(s):** 320, 390
**Pages:** `/crowagent-core.html`
**Observed:** The hero `<h1>` "Know your MEES penalty exposure before 2028" computes `wordBreak: keep-all`, `hyphens: none`, `fontSize: 40px`. At 320px the bounding box lands at `left=205.5, right=404.5` — i.e. **~84px of the heading is cut off past the right viewport edge**, and the heading shows at six lines compressed into a 199px column. Same at 390. Recovers at >=768 (4 lines, in-bounds).
**Reproduction:** `/crowagent-core.html` at 320 or 390 wide → hero `<h1>`.
**Recommendation:** Replace `word-break: keep-all` with the site's standard heading wrap (`overflow-wrap: anywhere` or `word-break: normal`) for this product page hero, and reduce the m320 clamp floor (currently 40px) to ~28–30px. The keep-all rule is preserving "before 2028" as an unbreakable unit, blowing the column out.

### RESP-02 — `<h3>` cards on `/about.html` render at 10–17 lines of crushed type
**Severity:** HIGH
**Viewport(s):** 320, 390, 768, 1024, 1440, 1920 (all)
**Pages:** `/about.html`
**Observed:** Three `<h3>` cards ("Make compliance accessible", "Compliance in minutes, not weeks", "Statute over speculation") render as `<article class="sv-card sv-card--accent ms-reveal">`. On m320 the h3 itself is 220×487 — height ≈ 17 × 28.8px line-height for a 3-word title. Same defect repeats at every viewport: 10–17 lines on d1440/d1920. The card body inherits the layout, producing a 540px-tall card for three lines of value-prop copy.
**Reproduction:** `/about.html` → "Why CrowAgent" / values section → inspect any h3.
**Recommendation:** The h3 box is consuming all flex space inside the card. Likely the `sv-card` flex layout is allocating space to the h3 with no `flex-shrink` on a sibling, or the h3 has `flex: 1`. Constrain h3 to `flex: 0 0 auto`, set explicit `line-height` (1.15–1.25), and let the card grow with content rather than padding the heading vertically.

### RESP-03 — Persistent cookie banner blocks the lower 104px of every viewport
**Severity:** HIGH
**Viewport(s):** 320, 390, 768, 1024, 1440, 1920 (all)
**Pages:** all 9 audited
**Observed:** `#ca-cookie.cookie-banner` is fixed at `bottom: 0`, height 104px (456px when "Manage preferences" is opened). On 320×720 it occupies **14% of the visible viewport**, on 1440×900 it covers 11%. The banner never auto-dismisses and `body` carries `cookie-banner-active` even though no padding-bottom appears to reserve space — sticky elements (hero CTA on `/index.html`, "Try now" form on `/tools/index.html`) sit beneath it on first paint.
**Reproduction:** Load any page in incognito → banner pinned bottom, overlaps hero CTAs at narrow heights.
**Recommendation:** Either (a) add `body.cookie-banner-active { padding-bottom: var(--cookie-banner-h) }` and a CSS custom property updated by `cookie-banner.js`, or (b) shorten the banner to a single-row strip (≤56px) with explicit Accept / Decline buttons, deferring "Manage" into a modal.

### RESP-04 — `.comparison-table` overflows its container on mobile (clipped, no scroll affordance)
**Severity:** HIGH
**Viewport(s):** 320, 390
**Pages:** `/pricing.html`
**Observed:** `<table class="comparison-table">` is 500px wide inside a 222px parent with `overflow-x: auto`. Scrolling works, but with no visible scrollbar (Safari/iOS hides them), no shadow/fade cue, and no "swipe to see more" copy, mobile users see a truncated table that appears broken. Header row at `left=44` already shows columns disappearing past the right edge.
**Reproduction:** `/pricing.html` at 320 or 390 → "Compare plans" table.
**Recommendation:** Add a right-edge gradient mask on the scroll container, an inline "Swipe → for full table" hint, or convert to a stacked "card per plan" layout below 600px (recommended).

### RESP-05 — `<code>` block on `/index.html` exceeds 600px on mobile
**Severity:** HIGH
**Viewport(s):** 320, 390
**Pages:** `/index.html`
**Observed:** A `<code>` element measured at 623×?, with `left=17, right=640` on a 320px viewport — i.e. ~320px of code content is hidden beyond the right edge. The page does not produce a document-level horizontal scrollbar (clipped by an ancestor `overflow-x: hidden`), so the rest of the snippet is unreachable.
**Reproduction:** `/index.html` at 320/390 → scroll to the section containing the embedded code/data line.
**Recommendation:** Wrap the `<code>` (or its `<pre>`) in `overflow-x: auto` with reduced font-size below 480px, and ensure the snippet is essential (if illustrative, swap for a SVG/PNG that scales).

### RESP-06 — `.hp-moat-comment` annotations overflow their callout column
**Severity:** MEDIUM
**Viewport(s):** 320, 390
**Pages:** `/index.html`
**Observed:** Two `span.hp-moat-comment` elements measured 333px and 385px wide at vw=320 (`left=93, right=427/478`); 417px and 404px at vw=390. The parent presumably has `overflow: hidden` so users see cut-off marginalia.
**Reproduction:** `/index.html` at 320/390 → scroll to the "moat" annotated diagram block.
**Recommendation:** Below 480px, drop the side-rail annotation style and stack the comment below the related node, or shorten the copy to fit a 240px column.

### RESP-07 — `.how-tabs` overflows the t768 viewport
**Severity:** MEDIUM
**Viewport(s):** 768
**Pages:** `/index.html`
**Observed:** `<div class="how-tabs">` renders at 854px on a 768 viewport (`left=38, right=892`). Roughly 124px of the tablist (rightmost tab + indicator) is clipped at the right edge.
**Reproduction:** `/index.html` at 768 wide → "How it works" tab strip.
**Recommendation:** Make `.how-tabs` `overflow-x: auto` with snap points, or collapse to a `<select>` / accordion below 900px. The current behaviour leaves an entire tab unreachable on iPad-portrait.

### RESP-08 — `H1` heroes wrap to 4–6 lines on m320, crushing scan-ability
**Severity:** MEDIUM
**Viewport(s):** 320, 390
**Pages:** `/index.html`, `/pricing.html`, `/about.html`, `/blog/mees-band-c-2028.html`, `/tools/index.html`
**Observed:** Hero H1s render at `font-size: 40px` with column widths 270–340px, producing 4–6 lines: e.g. `/index.html` "UK compliance, quantified. Not guessed." → 4 lines; `/about.html` "CrowAgent is UK compliance software for every UK organisation" → 5 lines on m320; `/tools/index.html` H1 → 6 lines on m320; blog H1 → 6 lines on m320. Several use `word-break: keep-all` which compounds wrap pressure on small viewports.
**Reproduction:** Any of the listed pages at 320/390.
**Recommendation:** Introduce a true mobile clamp on H1 (e.g. `clamp(28px, 8vw, 40px)` instead of a fixed `40px` floor) and reserve `word-break: keep-all` for headings that genuinely need it. Aim for ≤3 lines on m320.

### RESP-09 — Document scroll height balloons to 28,338px on mobile homepage
**Severity:** MEDIUM
**Viewport(s):** 320
**Pages:** `/index.html` (also `/crowagent-core.html` 14,458px)
**Observed:** Homepage at 320 wide reports `scrollHeight = 28,338px` — roughly **40 screens of vertical scroll**. At 1440 the same page is 17,960px (20 screens). The amplification on mobile comes from cards reflowing to one column and h3/h2 lines doubling. There is no in-page nav, "back to top", or section index to mitigate scroll fatigue.
**Reproduction:** `/index.html` at 320 → measure `document.documentElement.scrollHeight`.
**Recommendation:** Either compress mobile by collapsing optional sections behind "Show more" toggles, or add a sticky in-page section nav (visible only below the hero). Long-form is fine, but 40 screens with no wayfinding is not.

### RESP-10 — Mobile-menu drawer renders inside DOM at desktop widths (false positives + a11y risk)
**Severity:** MEDIUM
**Viewport(s):** 1024, 1440, 1920
**Pages:** all 9
**Observed:** `<div class="mob-menu">` is `position: fixed`, transformed off-canvas (`matrix(1,0,0,1,420,0)`) with `visibility: hidden`, `aria-hidden="true"` — correctly hidden visually. However, the menu contains its own "Pricing" and "Start free trial" links, doubling the count of those texts in the DOM at every viewport including 1920. Screen-reader and search-indexing implications aside, the duplicate CTAs surface in any automated audit as off-screen (they are, by design) but suggest the drawer should be conditionally rendered or fully removed from the a11y tree.
**Reproduction:** Devtools at 1920 → `document.querySelectorAll('.mob-menu').length` returns 1, with `aria-hidden="true"`.
**Recommendation:** Either gate the drawer behind a `@media (max-width: 1023px)` block (display: none entirely above the breakpoint), or use `inert` (now widely supported) so the subtree is removed from sequential focus and a11y exposure.

### RESP-11 — Hero backdrop bleeds 30–70px past the viewport on every breakpoint
**Severity:** LOW
**Viewport(s):** 320, 390, 768, 1024, 1440, 1920
**Pages:** `/index.html`
**Observed:** `div.hero-backdrop.hero-bg-earth` is 1.6–3.3% wider than the viewport at every breakpoint (e.g. 1492px at vw=1440, 1992px at vw=1920, 325px at vw=320), positioned with negative `left` to centre. Clipped by an ancestor `overflow-x: hidden`. Almost certainly an intentional "bleed" for parallax/displacement, but the rule is unconditional and creates a brittle dependency on the ancestor clip. Removing the clip elsewhere will instantly produce a horizontal scrollbar.
**Reproduction:** `/index.html`, inspect `.hero-backdrop` rect at any viewport.
**Recommendation:** Use `clip-path: inset(0)` or scope the bleed with `transform: scale(1.04)` rather than `width: 102%`, so the layout cannot leak even if a parent loses `overflow: hidden`.

### RESP-12 — Marquee tracks (`.sv-marquee__track`, `.mq-t`) measure 3,600px on every viewport
**Severity:** LOW
**Viewport(s):** all
**Pages:** `/index.html`
**Observed:** Two infinite-scroll marquees (`.sv-marquee__track` at 3,600px, `.mq-t` at 3,657px) are wider than every tested viewport — relied on parent `overflow: hidden` to mask the overflow. Functionally correct but represents a 3.6MB-worth-of-DOM commitment on m320 for a decorative band, and contributes to the 28k mobile scrollHeight. No measurable horizontal scroll leak detected.
**Reproduction:** `/index.html`, inspect `.sv-marquee__track` width at any viewport.
**Recommendation:** Truncate the duplicated marquee items below 768px (or pause the animation with `prefers-reduced-motion` + reduce the loop count), and verify `overflow: hidden` on `.sv-marquee` is set with `!important` or via a layer that cannot be overridden.

### RESP-13 — `.pricing-banner` overflows by 26px at m320
**Severity:** LOW
**Viewport(s):** 320
**Pages:** `/pricing.html`
**Observed:** `div.pricing-banner-wrap` and child `.pricing-banner` measured 346px wide (`left=-18, right=328`) on a 320 viewport — extending 8px past each edge. Likely a missing horizontal padding rule below 360px.
**Reproduction:** `/pricing.html` at 320 → top promotional banner.
**Recommendation:** Add `padding-inline: max(env(safe-area-inset-left), 16px)` to `.pricing-banner-wrap` and remove the negative margin (or replace it with `inset-inline: 0`).

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 1 (RESP-01) |
| HIGH | 4 (RESP-02, 03, 04, 05) |
| MEDIUM | 5 (RESP-06, 07, 08, 09, 10) |
| LOW | 3 (RESP-11, 12, 13) |

The most urgent fix is **RESP-01** — a hero H1 literally clipped off the viewport on a primary product page. After that, **RESP-02** (about-page h3 stacking) and **RESP-03** (cookie banner occluding 14% of mobile viewport) are visibility-critical at every breakpoint. Mobile (320, 390) carries the bulk of breakage; desktop is generally clean apart from h3 stacking on `/about.html` and the off-canvas drawer rendering at all widths.
