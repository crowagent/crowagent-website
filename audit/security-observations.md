# Security observations — crowagent-website

**Mode:** Read-only forensic audit. No code changes.
**Date:** 2026-05-21
**Tooling:** Grep over `*.html`/`*.js`/`*.css` (excluding `node_modules`, `_archive`, `coverage`, `playwright-report`, `test-results`, mockup `.html` files), Playwright console-error capture, manual header review of `/_headers`.

## Headline summary

The site has a strong security posture: it ships a hardened HTTP-header CSP, every external CDN script (DOMPurify, GSAP, ScrollTrigger) carries SRI, no API keys are checked into the repo, `eval()` and `document.write` are absent, all `target="_blank"` links carry `rel="noopener noreferrer"`, and user-rendered HTML is sanitised through DOMPurify with a strict `FORBID_TAGS` profile. The 10 findings below are nits and drift items, not critical CVE-class problems.

---

## Finding S1 — Two divergent Content-Security-Policy values: HTTP header vs HTML `<meta>` (drift since the May-9 hardening)

**Evidence:**

Server-side `_headers` (line 100) ships:
```
script-src 'self' https://crowagent.ai https://assets.calendly.com
           https://eu.posthog.com https://eu.i.posthog.com
           https://challenges.cloudflare.com https://cdnjs.cloudflare.com;
style-src  'self' https://fonts.googleapis.com 'unsafe-inline';
connect-src 'self' https://crowagent.ai https://app.crowagent.ai
            https://crowagent-platform-production.up.railway.app
            https://formspree.io https://eu.posthog.com https://eu.i.posthog.com;
form-action 'self' https://app.crowagent.ai https://formspree.io;
```

Page-level `<meta http-equiv="Content-Security-Policy">` (every audited page) ships:
```
script-src 'self' 'unsafe-inline'  ← WEAKER
           https://cdnjs.cloudflare.com https://challenges.cloudflare.com
           https://app.posthog.com                ← stale
           https://us-assets.i.posthog.com        ← unused
           https://eu-assets.i.posthog.com;       ← unused
connect-src 'self' https://api.brevo.com         ← unused on website
            https://challenges.cloudflare.com
            https://app.posthog.com https://eu.i.posthog.com https://us.i.posthog.com;
frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://calendly.com;
frame-ancestors 'none';   ← IGNORED in meta — see S2
```

**Risk:** Browsers enforce the **union** of both policies. The page-level meta-CSP keeps `'unsafe-inline'` on `script-src` and allows the unused `app.posthog.com` + `us.*.posthog.com` origins, weakening the otherwise-hardened HTTP CSP. The HTTP CSP has none of `app.posthog.com`/`us.posthog.com`/`api.brevo.com` (the `_headers` mentions PostHog EU only).

**Recommendation:** Delete the `<meta http-equiv="Content-Security-Policy">` tag entirely; HTTP headers from `_headers` (Cloudflare Pages) are authoritative. If a Local-Pages preview environment needs CSP, scope the meta-CSP to that environment only.

---

## Finding S2 — `frame-ancestors 'none'` in `<meta>` is silently ignored, leaving clickjacking defence only on the HTTP layer

**Evidence:** Every audited page emits a browser console warning:
```
The Content-Security-Policy directive 'frame-ancestors' is ignored when delivered via a <meta> element.
```
The HTTP `_headers` does correctly set `X-Frame-Options: DENY` plus `Content-Security-Policy: ... frame-ancestors 'none';` so production is OK — but the meta tag wastes a directive and broadcasts a warning to every visitor's devtools.

**Recommendation:** Remove `frame-ancestors 'none'` from the meta-CSP; keep it in `_headers` only.

---

## Finding S3 — Subresource Integrity is present on 3 of 4 external CDN script tags; the 4th is `challenges.cloudflare.com/turnstile/v0/api.js`

**Evidence:** Grep across all production HTML:
```
SRI present:
  - cdnjs.cloudflare.com/.../dompurify@3.1.6   sha384+sha512 dual hash
  - cdnjs.cloudflare.com/.../gsap@3.12.5       sha384
  - cdnjs.cloudflare.com/.../ScrollTrigger     sha384

SRI MISSING:
  - https://challenges.cloudflare.com/turnstile/v0/api.js
```
Turnstile is a versioned-content endpoint (Cloudflare ships changes server-side), so SRI cannot be pinned. The risk is mitigated by Cloudflare being the host and by the CSP `script-src challenges.cloudflare.com` whitelist — but a Cloudflare-side compromise would propagate.

**Recommendation:** No action — flag for awareness. If a high-assurance variant is needed, Cloudflare offers a versioned URL `v0/api.js?onload=…` that returns a different bundle each release.

---

## Finding S4 — `formspree.io/f/xbdpkaol` is a public form endpoint and is the destination for both `privacy.html` and `crowesg.html`

**Evidence:**
```
crowesg.html:149   <form action="https://formspree.io/f/xbdpkaol" method="POST" novalidate>
privacy.html       same endpoint
```
This is the CrowESG waitlist + privacy DSAR form. Formspree is a public service and the form ID `xbdpkaol` is enumerable in the source — bots will probe it.

**Risks:**
1. **Form spam:** there is no `recaptcha`/`turnstile` element on the CrowESG form (the contact form does use turnstile). Single honeypot field present.
2. **Email-relay abuse:** if Formspree allows `_replyto` injection, an attacker can spoof a `Reply-To:` and use the form to send phishing through the brand's domain.
3. **Brevo CSP allowance:** `connect-src api.brevo.com` is in the meta-CSP but **NOT** the HTTP CSP. If the site adds a Brevo XHR call (current scripts.js doesn't show one) the HTTP CSP will block it.

**Recommendation:** Add Turnstile to the CrowESG waitlist form; verify Formspree's "private" mode (server-side validation of `_replyto`) is enabled on form `xbdpkaol`.

---

## Finding S5 — No API keys or secrets in source; honeypot + DOMPurify pattern is sound

**Evidence:** Regex sweep for `pk_live_`, `sk_live_`, `pk_test_`, `sk_test_`, `AIza*`, `AKIA*`, `secret_key`, `bearer\s`, `api_key=` across all HTML/JS files excluding `node_modules`. Single non-test match was inside `node_modules/@tootallnate/quickjs-emscripten/dist/...emscripten-module.WASM_RELEASE_SYNC.js` (a WASM string constant — not a real key).

Production code uses:
- DOMPurify v3.1.6 with `FORBID_TAGS: ['script','iframe','object','embed','form']` and `FORBID_ATTR: ['onerror','onload','onclick','onmouseover']` (chatbot.js line 270–276).
- Hand-rolled fallback: `div.textContent = html.replace(/<[^>]+>/g, '')` — strips all tags via textContent assignment (safe).
- Honeypot field on contact form (`<input name="website" tabindex="-1">` wrapped in `aria-hidden="true"`).
- Contact form has Turnstile + server-side CR/LF strip + email-pattern validation (per code comments).

---

## Finding S6 — `innerHTML` is used 11 times in production JS, but only with **SVG icon strings** or post-DOMPurify content

**Evidence:** Grep on `scripts.js` and `chatbot.js`:
```
scripts.js:612    n.innerHTML = 'CSRD Applicability Checker is <strong>free</strong>…'
scripts.js:1467   hint.innerHTML = 'Swipe to compare <svg viewBox=…>…</svg>'
chatbot.js:174    btn.innerHTML = '<svg viewBox="0 0 24 24"…>'
chatbot.js:197    closeBtn.innerHTML = '<svg width="16"…>'
chatbot.js:225    sendBtn.innerHTML = '<svg viewBox=…>'
chatbot.js:281    return div.innerHTML  (already sanitised)
chatbot.js:301,318  container.innerHTML = html  (always post-DOMPurify)
chatbot.js:390    messagesEl.innerHTML = ''  (clear-only)
chatbot.js:430    loadEl.innerHTML = '<div class="ca-dots">…'  (static)
chatbot.js:473    bubble.innerHTML = sanitizeHTML(parsed)  (sanitised)
```
None is templated from `window.location`, `document.referrer`, `URLSearchParams`, or any user-input field. Risk class: low.

**Recommendation:** No action required. Add an ESLint rule (`no-unsafe-innerhtml` or `@microsoft/eslint-plugin-sdl/no-inner-html`) to keep this clean as the codebase grows.

---

## Finding S7 — Production HTML has zero inline event handlers (`onclick=`, `onload=`, `onerror=`)

**Evidence:** Grep for `on(click|load|error|change|submit|focus|blur)=` across production HTML (excluding `final-premium-mockup.html`, `finished-premium-*.html`, `cinematic-mockup.html`, and the `coverage/`/`playwright-report/`/`test-results/` directories) returns **zero hits**.

This is the right state because `_headers` ships `script-src-attr 'unsafe-hashes' 'sha256-F1noxsLOnJhyRSgc0zu5JgzoLjG2BBMaXaSG24k2mRM='` — only one specific hash is allowed for inline event handlers, anywhere else would be blocked. The mockup HTML files have `onclick=` handlers but they are not linked from any production page (manually verified — grep for `final-premium` / `finished-premium` / `cinematic-mockup` finds zero references from production HTML).

**Recommendation:** Move the four mockup HTML files into `_archive/` to remove the lingering risk that someone accidentally links to one.

---

## Finding S8 — HTTP security headers (`_headers`) are best-practice; one nit on COEP `credentialless`

**Evidence:** `_headers` lines 99–110:
```
Content-Security-Policy:    full hardened CSP (per S1)
X-Content-Type-Options:     nosniff
X-Frame-Options:            DENY
Strict-Transport-Security:  max-age=31536000; includeSubDomains; preload
Referrer-Policy:            strict-origin-when-cross-origin
Permissions-Policy:         camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy:    same-origin-allow-popups
Cross-Origin-Resource-Policy:  same-site
Cross-Origin-Embedder-Policy:  credentialless
```

`credentialless` is a deliberate fallback from the stronger `require-corp` because Calendly's CDN does not set CORP headers (documented in `_headers` lines 33–41). This keeps cross-origin isolation benefits while letting the Calendly iframe load. Trade-off is documented.

**Recommendation:** No action; the trade-off is correctly chosen and inline-commented.

---

## Finding S9 — Three external POST destinations are open from any form on the site (`form-action` directive)

**Evidence:** HTTP CSP:
```
form-action 'self' https://app.crowagent.ai https://formspree.io
```
Three destinations is correct (self → contact form on app.crowagent.ai; formspree → waitlist/privacy). The meta-CSP however is wider:
```
form-action 'self' https://crowagent.ai https://app.crowagent.ai
```
— missing `formspree.io`. If a browser receives the page over the meta-CSP only (e.g. local file:// preview), the formspree submission will be blocked. Minor drift; HTTP CSP is the truth.

**Recommendation:** Resolve via the same fix as S1 (drop the meta-CSP).

---

## Finding S10 — Service worker correctly limits cache to GET requests and never caches mutations

**Evidence:** `service-worker.js` line 127:
```js
if (request.method !== 'GET') return; // never cache mutations
```
Combined with `isNetworkFirst()` matching `/api/*`, `formspree.io`, and the Railway endpoint — POST/PUT/DELETE never hit cache. The SW also skips caching opaque responses (`response.type === 'basic'` guard) which prevents poisoned-cache attacks via cross-origin redirects.

**Recommendation:** No action; SW implements the right pattern.

---

## Summary

The site's security baseline is at or above industry norm for a static brochure site:
- Strict HTTP CSP, COOP/COEP/CORP, HSTS preload, full Permissions-Policy locks.
- SRI on every static CDN script (Turnstile excepted — versioned endpoint).
- DOMPurify-sanitised innerHTML for any non-static content.
- No secrets in repo. No inline event handlers in shipped HTML. No `eval`, no `document.write`.
- Service worker isolates mutations from cache.

The actionable items are all **drift / cleanup**, not vulnerabilities:
1. **Delete the page-level `<meta http-equiv="Content-Security-Policy">`** — it shadows the hardened HTTP CSP with looser allowances and emits console warnings (S1, S2, S9).
2. **Add Turnstile to the CrowESG waitlist Formspree form** (S4) — the contact form already protects itself, the waitlist does not.
3. **Move the four mockup `*.html` files** (which contain `onclick=` handlers) into `_archive/` so a future routing change can't accidentally expose them (S7).

No P0/P1 vulnerabilities surfaced in this read-only sweep.
