# Security Audit — Task 7.8

Date: 2026-05-16
Scope: production `_headers` (Cloudflare Pages) and inline-style/CSP hygiene.

## Headers Configured in `_headers`

All applied globally via the `/*` rule:

| Header                              | Value (summary)                                              | Status |
| ----------------------------------- | ------------------------------------------------------------ | ------ |
| `Content-Security-Policy`           | Comprehensive policy (see below)                             | PASS   |
| `X-Content-Type-Options`            | `nosniff`                                                    | PASS   |
| `X-Frame-Options`                   | `DENY` (also `frame-ancestors 'none'` in CSP)                | PASS   |
| `Strict-Transport-Security`         | `max-age=31536000; includeSubDomains; preload`               | PASS   |
| `Referrer-Policy`                   | `strict-origin-when-cross-origin`                            | PASS   |
| `Permissions-Policy`                | camera/microphone/geolocation/cohort all denied              | PASS   |
| `Cross-Origin-Opener-Policy`        | `same-origin-allow-popups`                                   | PASS   |
| `Cross-Origin-Resource-Policy`      | `same-site`                                                  | PASS   |
| `Cross-Origin-Embedder-Policy`      | `credentialless`                                             | PASS   |
| `Surrogate-Control`                 | `max-age=14400` (Cloudflare edge TTL hint)                   | PASS   |
| `Reporting-Endpoints` + `Report-To` | Wired to `app.crowagent.ai/api/csp-report`                   | PASS   |

## CSP Directive Coverage

| Directive             | Status | Notes                                                                                          |
| --------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| `default-src`         | PASS   | `'self'` — strict baseline                                                                     |
| `style-src`           | PASS   | `'self'` + Google Fonts + `'unsafe-inline'` (required for inlined critical CSS on LCP pages)   |
| `style-src-attr`      | PASS   | `'unsafe-inline'` (kept for dynamic CSS-variable assignments, e.g. carousel `--ph`)            |
| `font-src`            | PASS   | `'self'` + `fonts.gstatic.com`                                                                 |
| `img-src`             | PASS   | `'self' data: https:` (Unsplash + own assets)                                                  |
| `script-src`          | PASS   | `'self'` + Calendly + PostHog EU + Turnstile + cdnjs                                           |
| `script-src-attr`     | PASS   | `'unsafe-hashes'` + single SHA-256 for the deferred-stylesheet onload handler (tight relax)    |
| `connect-src`         | PASS   | `'self'` + own app/api + Railway + Formspree + PostHog                                         |
| `frame-src`           | PASS   | `'self'` + Calendly + Cloudflare Challenges                                                    |
| `frame-ancestors`     | PASS   | `'none'` (no embedding allowed)                                                                |
| `base-uri`            | PASS   | `'self'`                                                                                       |
| `form-action`         | PASS   | `'self'` + `app.crowagent.ai` + Formspree                                                      |
| `object-src`          | PASS   | `'none'`                                                                                       |
| `worker-src`          | PASS   | `'self'`                                                                                       |
| `manifest-src`        | PASS   | `'self'` (explicit for Firefox)                                                                |
| `media-src`           | PASS   | `'self'` + PostHog EU (pre-emptive for session recording)                                      |
| `upgrade-insecure-requests` | PASS | Force HTTPS on accidental http:// asset references                                          |
| `report-to` / `report-uri`  | PASS | CSP violations posted to platform endpoint                                                  |

## Inline-Style Hygiene

`scripts/verify-no-inline-styles.js` and `DEF-003/004` migration (2026-05-09) reduced `style="..."` attributes to zero across the previous content set. New CSS added during Waves 2-7 is class-based; no new inline styles introduced.

Spot-check from this session (Wave 2-7 edits): I introduced two new inline `style="display:none"` properties via JS in `js/cookie-banner.js`, but these are runtime DOM assignments via `el.style.display = '...'` — JavaScript-controlled style application is not in scope for the `verify-no-inline-styles.js` check (which scans authored HTML).

## Caching Posture

- HTML pages: `max-age=0, s-maxage=300, stale-while-revalidate=60` → edge caches 5 min, browsers revalidate.
- Versioned assets (`styles.min.css`, `scripts.min.js`): `immutable, 1 year`.
- RSS (`changelog.xml`): `max-age=300`.

All appropriate.

## Findings — Action Items

### Pass
- Headers configuration is production-grade and reviewed against OWASP Secure Headers Project.
- CSP enforces frame-ancestors 'none' (cannot be embedded), object-src 'none' (no plugin content), form-action allow-list (no rogue form posts).
- HSTS preload-eligible (max-age >= 1 year + includeSubDomains + preload).

### Watch
- `'unsafe-inline'` is present in `style-src` and `style-src-attr`. This is documented (critical-above-fold CSS inlined into 7 LCP pages; runtime CSS-variable assignment). Future improvement: replace inline critical CSS with a hashed `<style>` block (each cache-busted via `?v=` would need a different hash). Low priority — modern CSP nonce/hash patterns require either an edge worker or a build-time hash-injection step.
- CSP relies on a single SHA-256 hash for the deferred-stylesheet `onload` handler. If that handler text changes, the hash must update or the page will throw a CSP violation. Mitigation: the hash + handler text are co-located in `_headers` comment, so an edit will be visible at code review time.

### Recommended follow-up (low priority)
1. Add a Sub-Resource Integrity (SRI) hash to Google Fonts `<link>` tags. Currently `crossorigin="anonymous"` only.
2. Consider moving the deferred-stylesheet `onload` handler to an external module so the inline-handler `unsafe-hashes` directive can be dropped.

No blocking security issues found.
