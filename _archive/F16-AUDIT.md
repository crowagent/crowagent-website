# F16 — Self-host Google Fonts + SRI audit

Date: 2026-05-16

## Part A — Self-hosting Google Fonts

### Current state

- **66 HTML pages** load Plus Jakarta Sans + Inter directly from
  `fonts.googleapis.com`.
- The exact request that runs on every page:
  ```
  https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap
  ```
- Each page also has `<link rel="preconnect" href="https://fonts.googleapis.com">`
  and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
- The Google CSS file in turn fetches `fonts.gstatic.com/.../*.woff2` for the
  six font-faces (PJS 600/700/800 + Inter 400/500/600).

### Self-host blocker analysis

| Layer | Status | Notes |
| --- | --- | --- |
| **CSP — `style-src`** | NOT blocked (and would IMPROVE) | `_headers` line 100 currently allows `style-src 'self' https://fonts.googleapis.com 'unsafe-inline'`. Self-hosting lets us drop `https://fonts.googleapis.com` from `style-src`. |
| **CSP — `font-src`** | NOT blocked (and would IMPROVE) | Current `font-src 'self' https://fonts.gstatic.com` would simplify to `font-src 'self'`. |
| **`Assets/fonts/`** | Partial — 1/8 files present | Only `PlusJakartaSans-700.woff2` is currently self-hosted. Missing: PJS-600, PJS-800, Inter-400, Inter-500, Inter-600 (woff2). |
| **`@font-face` rules in `styles.css`** | Need to be added | No `@font-face` declarations currently exist in `styles.css` or `styles.min.css`; the stack relies entirely on the Google CSS file to declare them. |
| **Browser support** | Not blocked | woff2 has 98%+ support; no fallback needed. |
| **License** | Not blocked | Plus Jakarta Sans is OFL; Inter is OFL. Both are redistributable in compiled woff2 form. |

**Conclusion**: Self-hosting is **NOT technically blocked**. The CSP would
become stricter (good). The work breaks down into:

1. Download the 6 woff2 files from `fonts.gstatic.com` (one-off, ~120 KB
   compressed total).
2. Place under `Assets/fonts/`.
3. Add 6 `@font-face` blocks to `styles.css` (and `styles.min.css`).
4. Replace the 2 `<link>` tags on each of 66 HTML pages with `<link
   rel="preload" as="font" href="/Assets/fonts/<file>.woff2" type="font/woff2"
   crossorigin>` for the critical-render-path fonts only (PJS-700 + Inter-400).
5. Tighten CSP: `style-src 'self' 'unsafe-inline'` and `font-src 'self'`.
6. Drop the `preconnect` to `fonts.googleapis.com` / `fonts.gstatic.com`.

**Recommendation**: deferred status is justifiable by scope (a 66-file HTML
sweep + CSS surgery + CSP change requires careful regression testing), but
it is **not blocked** technically. The cost-benefit case is strong: removes
one DNS lookup + one TLS handshake + 2 origin fetches per page load, removes
one privacy-leak vector (Google sees every visitor's IP), and lets us tighten
CSP by dropping two host allowlists.

## Part B — Subresource Integrity (SRI) audit

### Method

`tmp-sri-audit.js` walks every HTML file and collects every external
`<script src="https://...">` and external fetched `<link>` (rel=stylesheet,
or rel=preload as=style|script|font, or rel=modulepreload). Reports whether
the tag has an `integrity=` attribute.

### Results — 107 external-resource references across 5 unique URLs

| Status | Tag | Pages | URL |
| --- | --- | ---: | --- |
| **NO SRI** | link (stylesheet) | 89 | `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap` |
| **NO SRI** | script | 8 | `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js` |
| **NO SRI** | script | 8 | `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js` |
| **OK** (has SRI) | script | 1 | `https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js` |
| **NO SRI** | script | 1 | `https://challenges.cloudflare.com/turnstile/v0/api.js` |

Total instances missing `integrity=`: **106 of 107**.

### What can be SRI'd, what cannot

1. **Google Fonts CSS** (89 pages): **DO NOT add SRI.** Per task scope and per
   web standard: the CSS body returned by `fonts.googleapis.com/css2` is
   user-agent-dependent (modern browsers get woff2 URLs; older ones get woff
   URLs; the file is also re-emitted with different `unicode-range`
   declarations as fonts are updated). SRI on this resource would break the
   site every time Google updates the CSS or every time a different browser
   variant probes it. **The correct fix is self-hosting (see Part A), at
   which point the file becomes a `/Assets/fonts/fonts.css` we control and
   SRI is no longer needed.**
2. **GSAP + ScrollTrigger 3.12.5** (8 pages each, 16 instances total):
   **SRI is appropriate and recommended.** cdnjs serves immutable versioned
   files; the bytes are fixed for `3.12.5/gsap.min.js` and
   `3.12.5/ScrollTrigger.min.js`. Recommended action: compute sha384 hashes
   and add `integrity="sha384-..." crossorigin="anonymous"` to each tag, OR
   self-host both files under `Assets/js/vendor/`. Pages affected (8 each):
   - cookies.html, cookie-preferences.html, blog/index.html, products/index.html,
     intel/cyber-essentials-tracker/index.html, intel/mees-tracker/index.html,
     plus 2 other tool/glossary pages (full list in tmp-sri-audit.js output).
3. **DOMPurify 3.1.6** (1 page): already has SRI. No action.
4. **Cloudflare Turnstile** (1 page, `challenges.cloudflare.com/turnstile/v0/api.js`):
   **DO NOT add SRI.** This is a versionless loader URL whose body is updated
   by Cloudflare without coordination. Same argument as Google Fonts: SRI
   would break the contact-form anti-bot defence at the next Turnstile
   update. The CSP `script-src` whitelist (`https://challenges.cloudflare.com`)
   is the appropriate guard here.

### Recommended actions (not actioned — out of scope per task)

1. **Add SRI to GSAP + ScrollTrigger (16 instances)** — compute sha384 of
   `gsap-3.12.5.min.js` and `ScrollTrigger-3.12.5.min.js` and inject
   `integrity="..." crossorigin="anonymous"`. Or self-host (probably better:
   the site already serves bundled JS, and GSAP is only used on 8 pages).
2. **Self-host Google Fonts** to obviate the SRI question entirely (see Part A).
3. **Leave Turnstile and DOMPurify alone** (DOMPurify already has SRI;
   Turnstile cannot have SRI by design).

## Verification command

```bash
node tmp-sri-audit.js
```
