# F15 — OG image + JSON-LD asset use audit

Date: 2026-05-16
Scope: every `.html` file under `crowagent-website/` (excluding `node_modules/`,
`coverage/`, `audit-results/`, `audit-screenshots-final/`, `debug-screenshots/`,
`tests/`).

## Method

`tmp-og-audit.js` was used to:

1. Walk every HTML file.
2. Extract every `<meta property="og:image">` and `<meta name="twitter:image">`
   `content=` URL.
3. Parse every `<script type="application/ld+json">` block and recursively
   collect every `image`, `thumbnailUrl`, `logo`, `contentUrl` URL (handling
   string, object-with-`url`, and array forms).
4. Map each URL to a filesystem path (decode `%20`, strip origin
   `https://crowagent.ai`, strip query/fragment) and check `fs.existsSync`.

## Results

| Surface | Total refs | Broken |
| --- | ---: | ---: |
| og:image / twitter:image (meta) | 112 | 0 |
| JSON-LD image-like fields | 49 | 0 (after fix) |

### og:image / twitter:image

Every one of the 112 `<meta property="og:image">` and `<meta
name="twitter:image">` references resolves to a PNG that exists under
`Assets/og/*.png` or to `Assets/og-image.png` (root og fallback). Zero 404s.

Only one og image extension is in use site-wide: `.png`. The AVIF variants
under `Assets/og/avif/*.avif` (50 files) exist on disk but **no HTML page
currently references them**. AVIF og-image variants are not consumed by
Facebook / LinkedIn / Twitter scrapers anyway (they probe og:image and follow
HTTP redirects, not `<picture>` fallback chains), so this is informational —
not a defect.

### JSON-LD `Publisher.logo` — 10 broken refs FIXED

Initial scan reported 10 broken JSON-LD `Publisher.logo` references pointing
to `https://crowagent.ai/Assets/Branding Logo/logo.png` (URL-encoded variant
`Branding%20Logo` also tested — neither `logo.png` nor `Branding Logo/logo.png`
exists; only `Assets/Branding Logo/favicon.png` exists).

The 10 affected files all use `Article` schema where `publisher.logo.url`
points to the missing file. Google's Article rich-snippet eligibility requires
a fetchable `Publisher.logo`; a 404 here removes the page from rich-result
candidate pool.

A sibling cohort of 11 blog/intel pages already uses the working URL
`https://crowagent.ai/Assets/Branding%20Logo/favicon.png` for the same field.

**Minimum fix applied**: replaced the broken URL with the working URL in all
10 files. No other content changed.

Files modified:

- `blog/brown-discount-commercial-property-values.html` line 52
- `blog/epc-band-commercial-property-guide.html` line 52
- `blog/mees-commercial-property-guide.html` line 52
- `blog/mees-compliance-checklist-commercial-property.html` line 52
- `blog/mees-fine-exposure-calculator-guide.html` line 52
- `blog/ppn-002-social-value-explained.html` line 52
- `blog/ppn-002-social-value-guide.html` line 52
- `blog/retrofit-cost-calculator-guide.html` line 52
- `blog/social-value-portal-vs-crowmark.html` line 52
- `blog/what-is-retrofit-assessment-cost.html` line 52

Diff (per file):

```diff
-      "url": "https://crowagent.ai/Assets/Branding Logo/logo.png"
+      "url": "https://crowagent.ai/Assets/Branding%20Logo/favicon.png"
```

### Post-fix re-run

```
--- OG/Twitter image audit ---
Total og/twitter:image refs: 112
Broken (file missing): 0

--- JSON-LD image audit ---
Total JSON-LD image-like refs: 49
Broken (file missing): 0
```

## Recommendations (not actioned — out of scope per task)

1. **Publisher.logo size**: Google recommends Publisher.logo ≥112×112 with a
   max width of 600px. `Assets/Branding Logo/favicon.png` is a small favicon.
   Consider creating a dedicated 600×60 wordmark PNG and updating all 21 blog
   posts + 2 intel pages to point to it. Best candidate exists already at
   `Assets/brand/crowagent_wordmark_dark_560x140.png`; a 600×60 crop would
   match Google's preferred 60:1 ratio.
2. **AVIF og variants**: the 50 files in `Assets/og/avif/` are unreferenced.
   Either drop them from the repo or wire them up. Note: og:image readers do
   not negotiate content-type via `<picture>`, so AVIF og variants are only
   useful as direct og:image targets for platforms (none today) that prefer
   AVIF. Pragmatic call: leave PNG as canonical og:image and treat AVIF as
   future-use staging.
3. **CrowESG and CrowAgent-changelog assets**: PNGs exist on disk
   (`crowagent-changelog-2026-05-05-*.png`, no AVIF) but no HTML references
   them; safe to ignore unless changelog pages get added.

## Verification command

```bash
node tmp-og-audit.js
```

Output: 0 broken refs across 112 og + 49 JSON-LD references.
