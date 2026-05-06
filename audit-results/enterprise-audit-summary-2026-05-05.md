# CrowAgent Enterprise Website Audit Summary - 2026-05-05

Base URL audited: `https://www.crowagent.ai`

## What Was Tested

- Existing Jest suite: `154/154` assertions passed, but the command exits failed because `scripts.js` line coverage is `59.66%` against the `60%` threshold.
- Existing Playwright smoke + axe suite against production: `26/32` passed.
- Existing responsive matrix against production: `64/72` passed; all failures are the `/products/` redirect loop.
- Custom live crawl: `50` production URLs, `100` unique links, desktop + 390px mobile checks, headings, metadata, images, buttons, forms, console/page errors, link probes, and axe.
- Raw custom crawl output: `336` findings: `10 P0`, `133 P1`, `182 P2`, `11 P3`.

Full raw reports:

- `audit-results/live-site-audit-2026-05-05.md`
- `audit-results/live-site-audit-2026-05-05.json`

## Highest Priority Findings

### P0 - Directory Index Redirect Loops

These production URLs fail with `ERR_TOO_MANY_REDIRECTS`:

- `/products`
- `/blog`
- `/intel/cyber-essentials-tracker`
- `/intel/mees-tracker`
- `/glossary`

Evidence: curl shows repeated `308` redirects between the slash and no-slash versions, for example `/products` -> `/products/` -> `/products`.

Likely root: Cloudflare clean URL / trailing slash canonicalisation conflict for directory `index.html` routes. The sitemap intentionally publishes no-trailing-slash URLs, while the deployed edge rules also redirect the slash variant back.

Recommended fix: pick one canonical form for directory routes and force it in Cloudflare Pages / redirect rules. Add explicit non-looping rewrites for directory indexes, then rerun link checks.

### P1 - Lead Forms Are Not Enterprise-Ready

Production console shows Cloudflare Turnstile `400020` errors on `/contact` and `/partners`.

Source refs:

- `contact.html:171` uses placeholder site key `0x4AAAAAAA_CrowAgent_Turnstile`.
- `partners.html:209` uses the same placeholder key.
- `scripts.js:1043-1056` checks Turnstile before local required-field validation, so an empty contact submit does not show the expected name/email errors.

Impact: demo/contact conversion can be blocked or confusing, and automated smoke test `Contact form shows validation on empty submit` fails.

Recommended fix: replace with a valid production Turnstile site key, validate local fields before Turnstile, and show a clear field-level/security message.

### P1 - Free Tool / Methodology Routes Load Broken Assets

On nested `/tools/*/methodology` pages, browsers request assets like:

- `/tools/mees-risk-snapshot/styles.min.css?v=51`
- `/tools/mees-risk-snapshot/scripts.min.js?v=51`
- `/tools/mees-risk-snapshot/chatbot.js`

Those return HTML/404, so Chromium blocks them with strict MIME errors. Several tool pages also load a broken Next image URL for the CrowAgent wordmark.

Recommended fix: use root-relative asset URLs (`/styles.min.css`, `/scripts.min.js`, `/chatbot.js`, `/print.css`) or make the app routes fully own their own assets. Avoid deploy-specific Next image URLs for persistent brand assets.

### P1 - CSP Blocks Intended Visual Assets

`_headers` has no `img-src`, so CSP falls back to `default-src 'self'`. The CSS uses `data:image/svg+xml` backgrounds at `styles.css:143`, `styles.css:1349`, and `styles.css:1357`, producing repeated console errors.

Recommended fix: either remove those data URI backgrounds or add a deliberate `img-src 'self' data: https:` policy after security review.

### P1 - Analytics Consent Throws Runtime Error

The homepage emits `posthog.opt_out_capturing is not a function`.

Source refs:

- `js/analytics-init.js:30`
- `js/analytics-init.js:66-74`

Recommended fix: guard PostHog consent calls by method existence and call them only after the library/stub is initialised.

### P1 - Accessibility Defects

Axe found serious issues:

- Color contrast on multiple blog posts plus `/status` and the 404-like `/changelog.xml`.
- Links distinguishable only by color on `/terms`, `/cookies`, and one blog article.

Recommended fix: raise muted text/link contrast, underline body links by default, and rerun axe across all article templates.

## Important P2 Polish / Enterprise Gaps

- Tap targets are too small on repeated components: nav dropdown triggers, chat close button, pricing toggle, FAQ/tool accordions, cookie toggles, and some CTA links.
- `/changelog.xml` returns 404 but is linked/discovered.
- `/roadmap` and `/security` lack `twitter:image`.
- `/terms`, `/cookies`, and `/status` have thin or missing meta descriptions.
- Homepage has duplicate `id="back-to-top"`.
- `/csrd` production now redirects to `https://app.crowagent.ai/tools/csrd-checker`; existing website tests still expect the old static CSRD wizard.

## Test Infrastructure Gap Fixed During Audit

The Playwright specs existed but the repo did not declare the packages they import. I added:

- `@playwright/test`
- `@axe-core/playwright`

This makes the audit suite runnable from the website repo instead of relying on an implicit global install.

## Recommended Fix Order

1. Fix the redirect loops for `/products`, `/blog`, `/intel/*`, and `/glossary`.
2. Fix Turnstile/site-key and contact/partner form validation order.
3. Fix broken `/tools/*/methodology` asset paths and app wordmark images.
4. Fix CSP `img-src` or remove data URI CSS images.
5. Fix PostHog consent runtime guard.
6. Fix axe contrast/link styling issues in article/legal templates.
7. Increase repeated component tap-target sizes.
8. Clean SEO metadata and stale links.
9. Update stale Playwright expectations for `/csrd`, then add the redirect/form/tools checks to CI.
