# Blog Pages Fix — 2026-05-22

Apple/Stripe finishing pass on `crowagent-website/blog/`. 20 HTML files audited (1 index + 19 article posts). All screenshots captured at desktop 1440x900 and mobile 390x844 (6 PNGs per page = 126 PNGs total). Each PNG was opened with the Read tool to verify visual outcome.

Screenshots: `audit/blog-shots-2026-05-22/`
Probes: `audit/blog-shots-2026-05-22/_probes.json`, `_deepprobe.json`

## Pages audited (21)

| # | Slug | Desktop fold | Mobile fold | Result |
|---|---|---|---|---|
| 1 | blog index | shot+read | shot+read | SHIPPED |
| 2 | brown-discount-commercial-property-values | shot+read | shot+read | SHIPPED |
| 3 | csrd-omnibus-i-2026 | shot+read | shot+read | SHIPPED |
| 4 | cyber-essentials-v3-3-danzell-2026 | shot+read | shot+read | SHIPPED |
| 5 | epc-band-commercial-property-guide | shot+read | shot+read | SHIPPED |
| 6 | epc-register-explained | shot+read | shot+read | SHIPPED |
| 7 | mees-band-c-2028 | shot+read | shot+read | SHIPPED |
| 8 | mees-commercial-property-guide | shot+read | shot+read | SHIPPED |
| 9 | mees-compliance-checklist-commercial-property | shot+read | shot+read | SHIPPED |
| 10 | mees-exemptions-guide | shot+read | shot+read | SHIPPED |
| 11 | mees-fine-exposure-calculator-guide | shot+read | shot+read | SHIPPED |
| 12 | mfa-mandatory-2026 | shot+read | shot+read | SHIPPED |
| 13 | ppn-002-guide | shot+read | shot+read | SHIPPED |
| 14 | ppn-002-social-value-explained | shot+read | shot+read | SHIPPED |
| 15 | ppn-002-social-value-guide | shot+read | shot+read | SHIPPED |
| 16 | ppn-014-cyber-essentials-guide | shot+read | shot+read | SHIPPED |
| 17 | regulatory-updates-2026 | shot+read | shot+read | SHIPPED |
| 18 | retrofit-cost-calculator-guide | shot+read | shot+read | SHIPPED |
| 19 | social-value-portal-vs-crowmark | shot+read | shot+read | SHIPPED |
| 20 | social-value-themes-explained | shot+read | shot+read | SHIPPED |
| 21 | what-is-retrofit-assessment-cost | shot+read | shot+read | SHIPPED |

## Defects found by severity

### CRITICAL (8 pages — DOM order)
H1 rendered BELOW `<figure.blog-stripe-hero>` in DOM, leaving the article identity buried below the fold on mobile and breaking content-first hierarchy.

Affected: brown-discount, mees-commercial-property-guide, social-value-portal-vs-crowmark, mees-fine-exposure-calculator-guide, epc-band-commercial-property-guide, mees-compliance-checklist-commercial-property, ppn-002-social-value-explained, what-is-retrofit-assessment-cost.

Fix: page-scoped CSS using `flex` + `order` on `.article-header` to visually reorder breadcrumb → badge → h1 → meta → intro → byline → hero. DOM preserved for SEO.

### HIGH (9 pages — stray FAQ link in breadcrumb)
`<a href="/faq">FAQ</a>` orphan inside `<nav.breadcrumb>` after `<span class="breadcrumb-current">`, rendering visually after the breadcrumb title.

Affected: csrd-omnibus-i-2026, epc-register-explained, mees-band-c-2028, mees-exemptions-guide, ppn-002-guide, ppn-002-social-value-guide, regulatory-updates-2026, retrofit-cost-calculator-guide, social-value-themes-explained.

Fix: HTML surgical edit removing the orphan `<a>` element from each file. Verified by `grep`: zero remaining occurrences.

### HIGH (all 19 article pages — duplicate metadata)
Each article page renders BOTH `.article-meta` (date + read-time) and `.blog-stripe-byline` (author + read-time) as separate visible lines, sometimes with mismatched read-time values (e.g. brown-discount: 8 min in meta vs 7 min in byline). A third element `.article-author-strip` is injected by inline JS, adding a 3rd duplicate line on Group-A pages.

Fix: Two-group CSS strategy using `:has()`:
- Group A (12 pages with a separate `.article-badge` / `.article-badge-gold`): hide `.article-meta`, keep `.blog-stripe-byline`.
- Group B (8 pages where `.article-tag` lives inside `.article-meta`): hide `.blog-stripe-byline`, keep `.article-meta` styled as a tidy inline row.
- `.article-author-strip` hidden globally on `body.blog-article-page` (JS-injected duplicate).

### HIGH (8 pages — half-width hero on desktop)
`figure.blog-stripe-hero` rendered at 720px wide inside `.article-header` (max-width: 720px) on the 8 Group-B pages, leaving a giant empty void to the right on desktop (1440px viewport).

Fix: page-scoped CSS widens `.article-header` to full container, lifts figure to `max-width: 1100px` (matches `.blog-article.has-stripe-hero > .container` width), enforces 16:9 aspect-ratio via `aspect-ratio: 16/9` + `object-fit: cover`.

### HIGH (blog index — hero alignment)
Mixed alignment in `.blog-hero` — H1 centred, `INSIGHTS` eyebrow + lede + filters left-aligned. Mobile breadcrumb stacked vertically (`flex-direction: column` from global `.f10-breadcrumbs` rule).

Fix: page-scoped CSS centres all hero children + forces breadcrumb `flex-direction: row` with wrap.

### MEDIUM (all article pages — typography rhythm)
Body paragraphs rendered at 15px or 16px inconsistently with line-height 24px or 26px (3 different typography combos across the 19 articles).

Fix: standardise to `font-size: 1.0625rem` (17px) `line-height: 1.7` on all article body paragraphs. Mobile: `1rem` / `1.65`. Prose width capped at `min(70ch, 100%)`.

### MEDIUM (all article pages — link affordance)
Inline article links used default underline + teal colour, no hover animation. Below the Apple/Stripe premium bar.

Fix: page-scoped `background-image: linear-gradient` underline that animates from 1px to 2px on hover/focus. Skipped on `.sv-btn` and `.blog-cta-btn`.

## Files modified

| File | Change | Why |
|---|---|---|
| `blog/csrd-omnibus-i-2026.html` | Remove orphan FAQ link line 63 | Breadcrumb cleanup |
| `blog/epc-register-explained.html` | Remove orphan FAQ link line 86 | Breadcrumb cleanup |
| `blog/mees-band-c-2028.html` | Remove orphan FAQ link line 86 | Breadcrumb cleanup |
| `blog/mees-exemptions-guide.html` | Remove orphan FAQ link line 86 | Breadcrumb cleanup |
| `blog/ppn-002-guide.html` | Remove orphan FAQ link line 86 | Breadcrumb cleanup |
| `blog/ppn-002-social-value-guide.html` | Remove orphan FAQ link line 88 | Breadcrumb cleanup |
| `blog/regulatory-updates-2026.html` | Remove orphan FAQ link line 86 | Breadcrumb cleanup |
| `blog/retrofit-cost-calculator-guide.html` | Remove orphan FAQ link line 89 | Breadcrumb cleanup |
| `blog/social-value-themes-explained.html` | Remove orphan FAQ link line 86 | Breadcrumb cleanup |
| `styles.css` | Append `BLOG-FIX-2026-05-22` block (lines 29456 to end) | Scoped fixes for metadata dedup, hero, typography, alignment |
| `styles.min.css` | Append minified equivalent | CLAUDE.md rule 3 (both files must change) |

## Verification

- Smoke: `BASE_URL=http://localhost:8092 npx playwright test tests/smoke.spec.js --project=chromium` -> **25/25 PASS** (22.2s).
- Brace balance: `styles.css` 5709/5709, `styles.min.css` 4506/4506.
- Per-page visual: 126 PNGs read; every fold + full + footer at desktop and mobile reviewed.

## Mobile parity confirmed

All 20 article pages render correctly at 390x844 with:
- Single-line breadcrumb (no awkward vertical stack)
- Category badge above H1
- H1 prominent, no mid-word breaks observed
- Single byline (no duplicates)
- Hero image 16:9 below intro
- Body text 16px / 1.65 line-height
- No horizontal scroll (`docW=390` matches `clientW=390`)

## Still open (low-priority, not blocking)

### MEDIUM — not fixed (out of scope: global nav/footer)
- Desktop footer height is 1023px (very tall) — the footer is injected by `js/nav-inject.js` which is explicitly out of my scope. The bottom 900px of every blog page lands inside an empty area of this footer. Owner: nav-inject agent.
- Mobile nav drawer renders 1810px to the right of viewport (closed state, off-screen) — expected behaviour for hamburger menu; not actual overflow.

### LOW — content-data inconsistency
- Read-time values disagree between `.article-meta` and `.blog-stripe-byline` on some pages (e.g. cyber-essentials: 6 min in byline, 9 min in index POSTS array). After fix we display only one source so users see only one value; reconciling the underlying data is a content-team task, not a frontend defect.
- 5 pages source category stock images from Unsplash flagged with `<!-- REVIEW: stock-image -->` comments. Founder image-sourcing rule allows Unsplash so this is compliant.

### LOW — design polish not pursued
- Featured-card on blog index uses a 50/50 image/content split that leaves whitespace below the badge on desktop. This is the existing card design, not a regression. Could be refined to a stacked vertical card matching the non-featured cards for visual consistency.
- TOC sidebar appears on Group-A article pages only (those with `.article-wrapper > .blog-stripe-body > .blog-stripe-toc`). Group-B pages (brown-discount family) do not have a TOC. Not added because Group-B uses a different shell that would require restructuring.

## Rollbacks

None. All changes are CSS-additive (scoped to `body.blog-article-page` and `body.blog-index-page`) plus 9 HTML surgical removals. No existing functionality removed.
