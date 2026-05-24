# S-3 / S-4 / S-5..S-10 vendor research

**Mode:** Read-only investigation. No code modified.
**Date:** 2026-05-21
**Scope:** Vendor-blocked items from `audit/security-observations.md` — what is genuinely fixable, what is genuinely "no action".

---

## S-3 — Turnstile script lacks SRI

### Can SRI be added to `challenges.cloudflare.com/turnstile/v0/api.js`?

**No.** Three independently confirmed facts:

1. **Cloudflare does not publish a hash and does not version the URL.** The `/turnstile/v0/api.js` endpoint is intentionally a rolling loader; Cloudflare ships bug fixes and anti-fraud heuristics server-side. The official Turnstile CSP docs (`developers.cloudflare.com/turnstile/reference/content-security-policy/`) describe **only** nonce / strict-dynamic / origin-allowlist patterns — SRI is conspicuously absent.
2. **No CORS header is set on the script response**, so even if a caller pinned a hash today, browsers will not perform the integrity check on a cross-origin script without `crossorigin="anonymous"` + a CORS-permissive response. The Cloudflare Community thread (440769) confirms this has been a longstanding feature request, unresolved since 2022.
3. **No versioned URL exists** (e.g. `/turnstile/v1/`). The `v0` segment is API-version semantics, not bundle-version pinning.

### Workarounds (ranked by feasibility on a static Cloudflare Pages site)

| Workaround | Effort | Effectiveness vs. SRI | Recommendation |
|---|---|---|---|
| **Status quo:** allowlist `challenges.cloudflare.com` in `script-src` + rely on TLS+HSTS+Cloudflare's own platform integrity. | 0 | Trust-delegated to Cloudflare. Same posture as Google reCAPTCHA, hCaptcha. | Keep. Documented trade-off. |
| **`strict-dynamic` + nonce** on the Turnstile bootstrap tag. | Medium (per-page nonce, Pages Function or HTML rewriter required — Pages doesn't natively inject nonces). | Same as today re: Turnstile compromise, **but** tightens the rest of the policy. Trust is delegated via nonce propagation. Still NOT SRI. | Defer — high churn for marginal gain on a static brochure site. |
| **Self-host a snapshot** of `api.js`. | High. | False sense of security — the loader fetches secondary bundles from Cloudflare anyway, so SRI on the bootstrap doesn't cover the actual challenge code. Also voids the Terms (Turnstile requires direct delivery). | Reject. |
| **Drop Turnstile, swap to a vendor that exposes a pinned bundle.** | High (re-implementation). | Real SRI possible. See S-3 alternatives below. | Optional, only if the residual risk is unacceptable. |

### Alternative CAPTCHA vendors with SRI support

| Vendor | SRI support | Self-host | GDPR | Free tier | Notes |
|---|---|---|---|---|---|
| **ALTCHA** (altcha.org, MIT) | **Yes** — npm-pinned bundle, ship from own origin. | Yes — server libs for TS, Go, Python, PHP, Ruby, Elixir, Java. | Cookie-free, EAA + WCAG 2.2 AA. | Open source. | Best SRI candidate. Proof-of-work, no fingerprinting. Strong technical fit for a static site with one Pages Function. |
| **Cap.js** (capjs.js.org, MIT) | Yes (self-hosted). | Yes. | Yes. | Free. | Newer, smaller ecosystem. PoW like ALTCHA. |
| **Friendly Captcha** | Partial (managed CDN, no published hashes; npm package can be bundled). | Paid tier only. | Yes (German-hosted). | "Free for small sites" — vague. | Same vendor-trust posture as Turnstile if loaded from CDN; SRI only if self-bundled via npm. |
| **hCaptcha** | No. | No (Enterprise only). | Yes. | Free. | Same SRI gap as Turnstile. |
| **reCAPTCHA v3** | No. | No. | Marginal — Google Ads tie-in. | Free. | Worse posture than today. |

**Recommendation for S-3:** Document the trade-off as accepted and add a tracking note. The Cloudflare-trust posture is intentional and matches every other major CAPTCHA. If the prelaunch hardening bar tightens later, **ALTCHA is the only credible swap** — it gives true SRI because the bundle ships from `crowagent.ai`.

### Real-world attack scenario WITHOUT SRI on Turnstile

Two paths only:
1. **Cloudflare compromise / malicious insider** swaps `api.js` for a malicious bundle. Outcome: every Turnstile-enabled site on the planet is breached simultaneously — a Cloudflare-scale industry-wide incident, not a CrowAgent-specific risk. Probability is effectively zero given Cloudflare's signing chain and infrastructure.
2. **DNS / BGP hijack of `challenges.cloudflare.com`.** Mitigated by HSTS + certificate pinning at the browser/CT layer. A successful attack still requires a CA compromise + CT log evasion.

Residual CrowAgent-specific risk: **Negligible.** No PII flows through Turnstile (it returns a token). Worst-case real exfil would target the form values the user types, but those values are public anyway (contact form + waitlist email).

---

## S-4 — `formspree.io/f/xbdpkaol` vendor choice

### Current footprint

- **One** active form endpoint: `crowesg.html` waitlist (`scripts.js:1052` also POSTs the contact form to the same Formspree ID).
- `privacy.html` only **mentions** Formspree in the sub-processors table — no live form action there.
- Form ID `xbdpkaol` is public in source. Single honeypot, no Turnstile on the waitlist form.

### Trade-off matrix: Formspree vs first-party endpoint on app.crowagent.ai vs Cloudflare Pages Function

| Dimension | Formspree (today) | First-party at `app.crowagent.ai/api/form` | Cloudflare Pages Function `/api/form` |
|---|---|---|---|
| **Sub-processor surface** | Adds Formspree (US, SCCs) to DPA inventory. | None — already in scope. | None — already a Cloudflare property. |
| **GDPR posture** | US transfer via SCCs — legally workable, paperwork burden. | UK/EU regional via existing Supabase EU. | UK/EU — Cloudflare Pages workers run at edge, but Brevo email delivery + Supabase write are EU. |
| **Anti-spam** | Formspree's built-in + honeypot. No Turnstile on waitlist today. | Reuse contact-form Turnstile + Brevo IP reputation. | Same — Turnstile token verification in the Worker. |
| **Cost** | Free tier 50 submissions/mo. Paid $10/mo @ 1k. | Marginal — load on existing Next.js app. | Free (100k Worker requests/day free tier). |
| **Delivery channel** | Formspree → email. | Brevo HTTP API (already canonical per `reference_canonical_email_brevo.md`). | Brevo HTTP API via Worker fetch. |
| **Auditability** | External — only the Formspree dashboard. | Full — Supabase row + PostHog event + Brevo log. | Same as platform path. |
| **Platform team load** | None. | One endpoint on existing Next.js portal — ~half-day implementation, ~50 LoC. | Marketing-site only; doesn't touch platform — ~half-day to write Worker + Brevo call. |
| **Time to ship** | n/a (already live). | Couple-day round-trip (PR + Vercel deploy + DNS). | Same-day (single Pages Function + redeploy of marketing site). |

**Recommendation for S-4:** Replace Formspree with a **Cloudflare Pages Function** at `/api/waitlist` that (a) verifies a Turnstile token, (b) POSTs the payload to Brevo `transactionalEmails/send` using the existing canonical pattern, (c) inserts a row into Supabase `marketing.waitlist` for retention. This:
- Removes the only remaining US sub-processor in the marketing-site stack.
- Eliminates the public Formspree ID enumeration risk.
- Adds Turnstile to the waitlist form (closes S-4 spam vector).
- Costs £0 (within Cloudflare free tier) and zero platform-team load.
- Aligns with the canonical-Brevo charter.

**Effort:** ~4 hours engineering + one Pages Function file + one Supabase migration + one CSP edit (`connect-src` adds nothing; `form-action` drops `formspree.io`).

---

## S-5 — Secrets sweep + DOMPurify pattern

**Re-audit verdict: Confirmed clean, no further action.** Single false-positive in `node_modules/@tootallnate/quickjs-emscripten/...WASM_RELEASE_SYNC.js` is a WASM string constant. Recommend adding `gitleaks` to the `quality-gate.yml` workflow as a ratchet (already-listed as a future ratchet in the master tracker, not new work).

---

## S-6 — `innerHTML` usage (11 call sites)

**Re-audit verdict: Confirmed safe.** Every call site either (a) writes a static SVG icon string, (b) writes content that was just sanitised by DOMPurify v3.1.6 with `FORBID_TAGS:['script','iframe','object','embed','form']` + `FORBID_ATTR:['onerror','onload','onclick','onmouseover']`, or (c) clears the node (`innerHTML = ''`).

**Hardening still possible (low value, recommended for ratchet, not a fix):**
- Add ESLint rule `@microsoft/eslint-plugin-sdl/no-inner-html` to lock the current state. Per-call allowlist via inline `// eslint-disable-next-line` with reasoned comment.
- Consider migrating SVG-icon `innerHTML` writes to `document.createElementNS('http://www.w3.org/2000/svg', ...)` — eliminates the category entirely. Effort: ~1 hour, scripts.js + chatbot.js.

---

## S-7 — Inline event handlers in production HTML

**Re-audit verdict: Confirmed zero in production HTML.** The four mockup HTML files (`final-premium-mockup.html`, `finished-premium-*.html`, `cinematic-mockup.html`) are unlinked. The CSP `script-src-attr 'unsafe-hashes' sha256-F1no...` only allows one specific deferred-stylesheet `onload` handler.

**Hardening still possible:**
- **Move the 4 mockup HTML files to `_archive/`** (this is the same recommendation already in S-7 of the security observations doc). `_headers` already blocks `_archive/*` via `X-Robots-Tag: noindex, nofollow` + `Cache-Control: no-store`, so the move is genuinely defence-in-depth, not just cosmetic.
- The single allowed inline-handler hash (`sha256-F1no...`) is a stylesheet `onload`. It could be replaced with an external IIFE that walks `link[rel=preload][as=style]` and rewrites `rel='stylesheet'` on load. Removes `'unsafe-hashes'` entirely. Effort: ~30 min + 7 HTML edits. **Recommended** — eliminates the last `'unsafe-hashes'` source.

---

## S-8 — HTTP security headers + `credentialless` COEP

**Re-audit verdict: Best-practice. `credentialless` is the correct trade-off, fully documented inline in `_headers`.**

**Hardening still possible:**
- **Add `Permissions-Policy` denials** for the long tail: `accelerometer=(), gyroscope=(), magnetometer=(), payment=(), usb=(), bluetooth=(), midi=()`. Zero functional impact (the site uses none); closes the directive completely.
- **Add `Cross-Origin-Embedder-Policy-Report-Only: require-corp`** as a passive monitor — if Calendly ever publishes CORP headers (they have been hinting at it on their changelog), we get a signal to upgrade.

---

## S-9 — `form-action` directive scope

**Re-audit verdict: Correct. The drift is only in the `<meta>` CSP (which is stripped by S-1 fix).**

If S-4 ships (Cloudflare Pages Function), this directive can drop `https://formspree.io` entirely, leaving `'self' https://app.crowagent.ai`. Net hardening: removes one outbound POST destination.

---

## S-10 — Service worker cache discipline

**Re-audit verdict: Implements the right pattern. No action.**

The `request.method !== 'GET'` early-return + `isNetworkFirst()` matching `/api/*`, `formspree.io`, and the Railway endpoint is exactly the OWASP-recommended SW pattern. Opaque-response guard prevents cross-origin redirect poisoning.

**Hardening still possible (cosmetic, not functional):**
- Add a unit test `service-worker.test.js` that asserts the network-first list + GET-only invariant — guards against a future regression.

---

## Summary of concrete actions

| Item | Vendor blocker? | Recommended action | Effort | Priority |
|---|---|---|---|---|
| **S-3 Turnstile SRI** | Yes (Cloudflare won't publish hashes). | Accept. Document trade-off. Optional swap to ALTCHA if posture tightens. | 0 / 2 days | P3 |
| **S-4 Formspree** | No — replaceable. | **Replace with Cloudflare Pages Function → Brevo + Supabase.** | ~4 hrs | **P1** |
| **S-5 Secrets** | n/a | Add `gitleaks` to quality-gate workflow. | 30 min | P3 |
| **S-6 innerHTML** | n/a | Add `no-inner-html` ESLint rule. | 1 hr | P3 |
| **S-7 inline handlers** | n/a | Move mockup HTML to `_archive/`. Optionally drop `'unsafe-hashes'` via external IIFE. | 30–60 min | P2 |
| **S-8 HTTP headers** | n/a | Extend `Permissions-Policy` denials. | 15 min | P3 |
| **S-9 form-action** | Resolved by S-4. | Drop `formspree.io` after S-4 ships. | 5 min | depends on S-4 |
| **S-10 SW** | n/a | Add a unit test guard. | 30 min | P3 |

**Bottom line:** Of the eight items, only S-3 is genuinely vendor-locked. S-4 looked vendor-locked but isn't — it's a half-day Cloudflare Pages Function away from being eliminated. Everything else is either already optimal or has a small ratchet available.

---

## Sources

- Cloudflare Community thread on Turnstile SRI/CORS (open since 2022): https://community.cloudflare.com/t/subresource-integrity-cors-for-turnstile-javascript-link/440769
- Cloudflare Turnstile CSP guidance: https://developers.cloudflare.com/turnstile/reference/content-security-policy/
- ALTCHA repository (MIT, self-hosted, npm-pinned): https://github.com/altcha-org/altcha
- Cap.js (open-source self-hosted CAPTCHA): https://capjs.js.org/guide/alternatives.html
- Cloudflare Pages Static Forms plugin: https://developers.cloudflare.com/pages/functions/plugins/static-forms/
- Cloudflare Pages Functions for form handling: https://developers.cloudflare.com/pages/tutorials/forms/
- MDN `strict-dynamic` trust delegation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/script-src
- Formspree alternatives (privacy/GDPR comparison): https://dev.to/allenarduino/formspree-alternatives-in-2026-open-source-cheaper-and-self-hostable-n34
- Friendly Captcha overview: https://friendlycaptcha.com/insights/cloudflare-captcha-alternative/
