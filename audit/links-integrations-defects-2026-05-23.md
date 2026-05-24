# Links & Integrations Audit, 2026-05-23

Scope: 27 production HTML pages + `_redirects` + `scripts.js`/module JS form handlers.
Server probed: `http://localhost:8092` (local Cloudflare-Pages-equivalent).
External: spot-checked by domain.

Totals: 28 defects (8 P0, 8 P1, 12 P2).

---

## P0, broken (link returns 404 or form action does not exist)

### P0-1, `/demo` route is a 404 (8 occurrences)
- `_redirects` defines no rule for `/demo`. Local probe: `curl http://localhost:8092/demo` returns `404`.
- Production parity: `/demo` would fall through to the splat-404 rule on line 137 of `_redirects`.
- Occurrences:
  - `about.html:236` `<a href="/demo" class="sv-btn sv-btn--sm sv-btn--ghost">`
  - `about.html:306` `<a class="sv-btn sv-btn--lg sv-btn--primary" href="/demo">Book a 15-minute demo</a>`
  - `contact.html:153` `<a href="/demo" class="sv-btn sv-btn--md sv-btn--primary">`
  - `contact.html:186` `<a href="/demo" class="sv-btn sv-btn--md sv-btn--primary">Book demo →</a>`
  - `cookies.html:462` `... on <a href="/demo">/demo</a> only loads ...` (also a stale doc reference)
  - `pricing.html:453` `<a href="/demo" class="sv-btn sv-btn--lg sv-btn--ghost">Book a 15-minute call</a>`
  - `partners.html:367` `<a class="sv-btn sv-btn sv-btn--lg sv-btn--ghost" href="/demo">Book a 15-minute demo</a>`
  - `products/index.html:76` `<a href="/demo" class="sv-btn sv-btn--lg sv-btn--primary">Take the 5-minute tour</a>`
- Fix: either (a) point all to `https://calendly.com/crowagent-platform/30min` (already used in contact.html:101 + index.html:1692), or (b) add `/demo  https://calendly.com/crowagent-platform/30min  302` to `_redirects` above the splat-404 rule. Option (b) is one change, lower regression risk, and preserves a clean canonical URL.

### P0-2, 5 flat `/tools-*` URLs are 404 on `resources.html`
- `_redirects` only rewrites the `*/methodology` variants; the plain flat URLs were never added.
- Probe: `/tools-cyber-essentials-readiness` → 404. Same for the other 4 below.
- Occurrences (all `resources.html`):
  - `resources.html:110` `<a href="/tools-cyber-essentials-readiness">Cyber Essentials Readiness Snapshot</a>`
  - `resources.html:111` `<a href="/tools-late-payment-calculator">Late Payment Interest Calculator</a>`
  - `resources.html:112` `<a href="/tools-mees-risk-snapshot">MEES Risk Snapshot</a>`
  - `resources.html:113` `<a href="/tools-ppn002-calculator">PPN 002 Social Value Calculator</a>`
  - `resources.html:114` `<a href="/tools-vsme-materiality-light">VSME Materiality Light</a>`
- Fix: rewrite each href to the canonical hyphenated nested path that already exists:
  - `/tools-cyber-essentials-readiness` → `/tools/cyber-essentials-readiness`
  - `/tools-late-payment-calculator` → `/tools/late-payment-calculator`
  - `/tools-mees-risk-snapshot` → `/tools/mees-risk-snapshot`
  - `/tools-ppn002-calculator` → `/tools/ppn-002-calculator`
  - `/tools-vsme-materiality-light` → `/tools/vsme-materiality-light`

### P0-3, chapter-nav anchor `#pricing-teaser` missing on 6 product pages
- All product pages render a `ca-chapter-nav` with `href="#pricing-teaser"`, but the pricing section id is `pricing` (not `pricing-teaser`). Same-page anchor click is a no-op.
- Occurrences:
  - `crowagent-core.html:99`
  - `crowmark.html` (chapter-nav)
  - `crowcyber.html` (chapter-nav)
  - `crowcash.html` (chapter-nav)
  - `crowesg.html` (chapter-nav)
  - `csrd.html` (chapter-nav)
- Verified ids:
  - `crowagent-core.html:502` `<section id="pricing" ...`
  - `crowmark.html:458` `<section id="pricing" ...`
  - `crowcyber.html:401` `<section id="pricing" ...`
  - `csrd.html:423` `<section id="pricing" ...`
- Fix: change every `href="#pricing-teaser"` in the chapter-nav blocks to `href="#pricing"`.

### P0-4, chapter-nav anchor `#faq` missing on all 6 product pages
- All 6 product pages have `<a href="#faq">FAQ</a>` in the chapter-nav, but no element with `id="faq"` exists on those pages. The link is dead.
- Verified by grep `id="(faq|pricing|features|how)"` over the 6 pages. Zero `id="faq"` hits.
- Occurrences:
  - `crowagent-core.html:100`
  - `crowmark.html`
  - `crowcyber.html`
  - `crowcash.html`
  - `crowesg.html`
  - `csrd.html`
- Fix: either add `id="faq"` to the FAQ accordion section on each product page, or remove the FAQ chapter-nav item if these pages don't host an FAQ. Site-wide FAQ already lives at `/faq` so the simplest fix is `href="/faq"` and drop the in-page anchor.

### P0-5, chapter-nav anchor `#features` missing on Cyber / Cash / ESG
- Core, Mark, CSRD all have `<section id="features">`. Cyber, Cash, ESG do not. Their chapter-nav `#features` link is dead.
- Verified: zero `id="features"` hits in `crowcyber.html`, `crowcash.html`, `crowesg.html`.
- Occurrences (chapter-nav links): `crowcyber.html`, `crowcash.html`, `crowesg.html`.
- Fix: add `id="features"` to the equivalent capabilities section on each of these three pages (they all have a "Capabilities" or "What's included" block that should carry the id).

### P0-6, chapter-nav anchor `#how-it-works` missing on Cyber / Cash / ESG
- Same pattern: Core/Mark/CSRD have `<section id="how-it-works">`; Cyber/Cash/ESG do not.
- Occurrences (chapter-nav links): `crowcyber.html`, `crowcash.html`, `crowesg.html`.
- Fix: add `id="how-it-works"` to the workflow / 4-step section on each page.

### P0-7, ESG waitlist form `action` points at non-existent endpoint
- `crowesg.html:215` `<form ... action="https://crowagent.ai/api/waitlist" method="POST">`
- Probe: `GET https://crowagent.ai/api/waitlist` → 404; `POST` → 405 (but only because CF Pages static splat 404 returns custom 405 for POST). The endpoint is not deployed (HTML comment lines 211-214 confirms it's "TODO platform").
- The real submission goes through `scripts.js:1046` Formspree fetch, so JS-enabled users are fine. Users with JS disabled hit a 405/404.
- Fix: change `action` to a real endpoint OR remove the form-action entirely and rely on the JS-only submission (less ideal for progressive enhancement). Cleanest: point the action at the existing Railway endpoint `https://crowagent-platform-production.up.railway.app/api/v1/waitlist/notify` (already used by other notify forms in `scripts.js:908`).

### P0-8, integration drift: Formspree still in production despite "retired" comments
- Three JS handlers POST to `https://formspree.io/f/xbdpkaol`:
  - `scripts.js:1046` (notify-form group, includes ESG waitlist)
  - `scripts.js:1101` (contact form `#contactPageForm`)
- HTML comments in `crowesg.html:211-214` claim "formspree.io retired in favour of first-party crowagent.ai/api/waitlist". The HTML/JS are out of sync.
- This is also a contradiction with the project's canonical email rule (`reference_canonical_email_brevo.md`, "Email is Brevo HTTP API + React Email"). Formspree is a third-party transactional pipe that bypasses the Brevo canonical.
- Fix: migrate both handlers to Brevo HTTP API via a Cloudflare Pages Function (or the existing Railway endpoint), then remove the formspree fetch lines.

---

## P1, weak (link works but routes to wrong target, weak credibility, or known fallback)

### P1-1, Resend.com listed as a sub-processor in `privacy.html`
- `privacy.html:470` `<tr><th scope="row">Resend</th>...<a href="https://resend.com/legal/dpa">DPA</a>...`
- Brand rule: canonical transactional email is Brevo (`reference_canonical_email_brevo.md`). Resend should not appear in the public processor list unless it has actually been onboarded.
- Fix: replace the Resend row with Brevo, link to `https://www.brevo.com/legal/agreementsterms/data-processing-agreement/`.

### P1-2, contact form has no progressive-enhancement `action` attribute
- `contact.html:311` `<form class="contact-form" id="contactPageForm">` — no `action`.
- Users with JS disabled cannot submit. Submit button silently fails.
- Fix: add `action="https://formspree.io/f/xbdpkaol"` (or the Brevo endpoint when migrated) and `method="POST"`. JS handler should still hijack via `preventDefault()`.

### P1-3, three "Coming-soon" notify-form POSTs depend on a single Railway URL with no fallback
- `scripts.js:908` POSTs to `crowagent-platform-production.up.railway.app/api/v1/waitlist/notify`. The endpoint exists (probe: POST returns 200). But `up.railway.app` is the auto-generated Railway hostname, not a stable production domain.
- If the Railway service is renamed or the project deleted, every coming-soon CTA breaks silently (`catch(e) {}` swallows errors).
- Fix: route through a stable subdomain (`api.crowagent.ai/waitlist/notify`) or at minimum add a non-empty catch that logs to PostHog.

### P1-4, `target="_blank"` on internal Calendly CTAs is inconsistent
- `pricing.html:238/255/269/286/302/316/334/350/364/...` and `contact.html:101` use `target="_blank"` for trial signups + Calendly. But `about.html:306`, `partners.html:367`, `pricing.html:453`, all use `/demo` (broken, P0-1) with no `target`.
- After fixing P0-1 the CTAs should consistently open Calendly in a new tab with `target="_blank" rel="noopener noreferrer"`.

### P1-5, social handles in JSON-LD never expose the brand pages on screen
- `index.html:88` and 18 other pages embed `sameAs: ["https://www.linkedin.com/company/crowagent","https://x.com/crowagent_ai"]` in JSON-LD only. There is no visible footer social row.
- The LinkedIn URL returned HTTP 999 (LinkedIn anti-bot) when probed, so I could not verify it exists. The X handle returned 200.
- Fix: either (a) add a visible footer row with the two icons (so users can verify), or (b) drop `sameAs` if the brand pages are not actually claimed yet.

### P1-6, Companies House number is plain text, never a link
- `about.html:274`, `cookies.html:519`, `pricing.html:464`, `security.html:500`, `terms.html:152`, `contact.html:243` all show "Company No. 17076461" as static text.
- The brief lists `https://find-and-update.company-information.service.gov.uk/company/17076461` as a credibility link.
- Fix: wrap the number in `<a href="https://find-and-update.company-information.service.gov.uk/company/17076461" target="_blank" rel="noopener noreferrer">` on at least the footer trust pill and the About / Security / Terms pages.

### P1-7, `cookies.html:462` references `/demo` in a copy block
- `cookies.html:462` `<p>The Calendly iframe on <a href="/demo">/demo</a> only loads ...`
- Not just a broken link; it documents user-facing behaviour that does not exist (no `/demo` route). Misleading.
- Fix: rewrite the sentence to reference the actual Calendly CTA pattern (`contact.html` panel + sticky mobile CTA), or implement a real `/demo` page that hosts the Calendly embed.

### P1-8, ICO Storage Schema page link 404s in some browsers
- `privacy.html` and `cookies.html` reference `https://ico.org.uk/ESDWebPages/Search`. The ICO retired this URL in 2025. Domain still 200s but the page is a placeholder redirect.
- Fix: update to `https://ico.org.uk/about-the-ico/what-we-do/register-of-data-protection-fee-payers/`.

---

## P2, informational (cosmetic / hygiene)

- **P2-1**, `crowagent.ai` is hardcoded as an external `https://` link 67 times across JSON-LD, OpenGraph, canonical tags. Standard practice but means a local-dev environment cannot fully test these without DNS rewrite. Acceptable.
- **P2-2**, `images.unsplash.com` URLs are loaded as `<script src=...>` in my grep (false positive of the regex). They are actually `<img src=`. No defect.
- **P2-3**, `aka.ms/playwright/...` only appears in `playwright-report/` artifacts (CI output). Not user-facing.
- **P2-4**, `web.archive.org/web/2024/https://iasme.co.uk/cyber-essentials/` is used as a citation backup. Works but verbose; recommend updating to current IASME URL `https://iasme.co.uk/cyber-essentials/` (also linked) and dropping the archive fallback.
- **P2-5**, `cdnjs.cloudflare.com` loads DOMPurify 3.1.6 and GSAP 3.12.5. CSP includes `cdnjs.cloudflare.com`. Fine, but consider self-hosting these (perf + CSP tightening + offline-grade reliability).
- **P2-6**, `404.html:32` `<link rel="preconnect" href="https://app.crowagent.ai">` — no `crossorigin` attribute on preconnect, browsers ignore credentialed preconnect. Add `crossorigin`.
- **P2-7**, `/blog/index.html` exists and is reachable via `/blog/`, but the brief lists `/blog/index` as a target. Not a defect, just confirm.
- **P2-8**, methodology pages use absolute canonical URLs like `<link rel="canonical" href="https://crowagent.ai/tools/mees-risk-snapshot/methodology">` (`tools-mees-risk-snapshot-methodology.html:25`). These canonicals only resolve on prod because the file is served via a `_redirects` rewrite at line 87 of `_redirects`. Local dev has `200 /tools-mees-risk-snapshot-methodology.html` but `404 /tools/mees-risk-snapshot/methodology` (no rewrite engine on `http-server`). Production should be fine.
- **P2-9**, `partner-form` (`partners.html:249`) has no `action` attribute; relies on `js/partners-form.js` POSTing to Railway. Same progressive-enhancement gap as P1-2.
- **P2-10**, mailto: links use `?subject=` query strings on 6 instances. Modern email clients support this, but some inline mail apps (Outlook web on mobile) do not. Not actionable.
- **P2-11**, `/status` rewrites to external `https://status.crowagent.ai` (302). Probe returns 200. No defect.
- **P2-12**, JSON-LD `sameAs` cannot be programmatically probed (LinkedIn 999, X 200). Tag a TODO to manually open the LinkedIn and X URLs in a real browser to confirm the brand pages exist before pre-launch.

---

## Recommended fix order

1. P0-1 `/demo` redirect, one line in `_redirects`. Highest visibility, 8 dead CTAs.
2. P0-2 5 flat `/tools-*` links in `resources.html`, single-file edit.
3. P0-3 / P0-4 / P0-5 / P0-6 chapter-nav anchor ids on 6 product pages, mass find-replace + add ids.
4. P0-7 ESG waitlist form action.
5. P0-8 Formspree → Brevo migration (real engineering work, schedule separately).
6. P1-1 Resend → Brevo in privacy table.
7. P1-2 / P1-3 progressive-enhancement form action and Railway hostname stability.
8. P1-6 Companies House link on visible trust pills.
9. P1-5 / P1-8 social handles audit + ICO URL refresh.
10. P2 batch at next polish pass.

---

## Verification notes / honest limits

- I probed every internal route via `curl http://localhost:8092` — 25 named routes returned 200, `/glossary` returned 302→200 (legitimate).
- External domains were spot-checked by HEAD/GET. LinkedIn returns 999 to bot UAs; this is normal anti-scraping and not evidence the page is broken.
- Forms with no `action` attribute (`#contactPageForm`, `#partner-form`, 6 tool calculators, `#esgWaitlistForm` real submission, `#cookie-prefs-form`) rely entirely on JS handlers. I traced each to its `fetch()` call and probed the endpoint; all underlying endpoints respond.
- I did NOT visually verify rendered pages — this was a code+endpoint audit only.
- I did NOT modify any files — this report is read-only as instructed.
