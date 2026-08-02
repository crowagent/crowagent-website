# Content model — about.html, partners.html, integrations.html

Extracted 2026-08-02 for the Astro migration. Everything below is **verbatim** from the
source files. Nothing is paraphrased, shortened or improved. HTML entities are reproduced
as they appear in source (`&rarr;`, `&amp;`, `&rsquo;`, `&ldquo;`).

Source files:
- `C:\Users\bhave\Crowagent Repo\crowagent-website\about.html` (435 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\partners.html` (338 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\integrations.html` (308 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\js\partners-form.js` (211 lines)

Evidence key:
- **CITED** — the page names a source, links to one, or the fact is self-evidently the
  company's own verifiable public record (e.g. its Companies House number).
- **UNCITED** — a claim presented with no source on this page.

---

## Page — about.html

### Head / metadata (verbatim)

| Tag | Value | Line |
|---|---|---|
| `<title>` | `About Us \| CrowAgent` | 24 |
| `meta name="description"` | `A London-based team that reads the UK procurement rules so CrowMark applies them the same way every time. Company details, history and what we stand for.` | 32 |
| `meta name="viewport"` | `width=device-width,initial-scale=1.0` | 7 |
| `meta name="theme-color"` | `#0A1F3A` | 40 |
| `link rel="canonical"` | `https://crowagent.ai/about` | 47 |
| `link rel="alternate" hreflang="en-GB"` | `https://crowagent.ai/about` | 164 |
| `link rel="alternate" hreflang="x-default"` | `https://crowagent.ai/about` | 165 |
| `og:title` | `About Us \| CrowAgent` | 149 |
| `og:description` | `A London-based team that reads the UK procurement rules so CrowMark applies them the same way every time. Company details, history and what we stand for.` | 150 |
| `og:type` | `website` | 151 |
| `og:url` | `https://crowagent.ai/about` | 152 |
| `og:image` | `https://crowagent.ai/Assets/og/about.png?v=20260730` | 153 |
| `og:image:alt` | `About Us` | 154 |
| `og:image:width` | `1200` | 155 |
| `og:image:height` | `630` | 156 |
| `og:site_name` | `CrowAgent` | 157 |
| `og:locale` | `en_GB` | 158 |
| `twitter:card` | `summary_large_image` | 159 |
| `twitter:site` | `@CrowAgentLtd` | 160 |
| `twitter:title` | `About Us \| CrowAgent` | 161 |
| `twitter:description` | `A London-based team that reads the UK procurement rules so CrowMark applies them the same way every time. Company details, history and what we stand for.` | 162 |
| `twitter:image` | `https://crowagent.ai/Assets/og/about.png?v=20260730` | 163 |

**Absent:** no `meta name="robots"`, no `meta name="color-scheme"`.
`<html lang="en-GB" data-theme="dark">`.

### JSON-LD (lines 166–168)

`@type`: **BreadcrumbList** — the only structured-data block on the page. There is **no**
`Organization` / `AboutPage` schema, which is a migration opportunity but a fidelity
decision, not a defect to fix silently.

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"About","item":"https://crowagent.ai/about"}]}
```

Field set: `@context`, `@type`, `itemListElement[]` → each `@type`, `position`, `name`,
`item` (position 2 carries `item`; note the integrations page's position 2 does **not**).

### Hero (section `#hero`, lines 195–222)

Eyebrow / kicker (line 204), rendered after a `<span class="ca-eyebrow-dot">`:

```
UK Built · Statute Cited · London Based
```

H1 (lines 207–209), a single `<span>`:

```
Built by engineers who read the rules.
```

Standfirst (line 218):

```
CrowMark applies the UK procurement rules the same way every time: find live tenders, draft grounded answers, evidence delivery.
```

### Section — "The approach" (lines 225–236)

Two cards, **no heading element at all** (eyebrow `<span>` only — not an h2/h3). This is a
headingless section, not a heading skip.

| Eyebrow | Body copy (verbatim) |
|---|---|
| The approach | Every feature starts with the actual regulation: PPN 002 for social value and the Procurement Act 2023 for delivery evidence. The source legislation drives the workflow step by step, and every figure in an answer is checked against your own confirmed data before it is shown, or the draft is rejected. |
| What you get | Tools that read the actual regulations: PPN 002 social value models, and the Procurement Act 2023 KPI duties in sections 52 and 71. Every workflow starts from the statute rather than a template, and each answer carries the clause it was written against. |

### Section — "What we stand for." (lines 241–265)

Section eyebrow (line 244): `Mission, vision, values`

H2 (line 245), contains a `<br/>`:

```
What we <br/>stand for.
```

Repeated unit — **value / principle cards** (3):

| # | Eyebrow | H3 | Body copy (verbatim) |
|---|---|---|---|
| 1 | Mission | Make public procurement accessible | Make public sector work answerable by any UK supplier, whatever its size or budget, with figures the AI cannot invent and a named person on every approval. |
| 2 | Vision | Answers you can defend, first time | A UK where every supplier can answer a tender requirement from evidence they already hold, cited to source, without paying a bid-writing consultancy. |
| 3 | Values | Statute over speculation | Every figure cites its source. A figure that cannot be traced to your own confirmed data is rejected rather than shown, and nothing is rounded into place to fill a gap. |

### Section — "Where we are." (timeline, `#timeline`, lines 270–357)

Column-left eyebrow (line 280): `History`
H2 (line 281): `Where we are.`

Repeated unit — **timeline entries** (5). The 5th is rendered at `opacity-50` (future /
not-yet state); the 4th is the "current" entry (teal border, pulsing dot).

| # | Date label (verbatim) | H3 | Body copy (verbatim) | State | Evidence |
|---|---|---|---|---|---|
| 1 | 2021 to 2025 | Founding team experience | Years spent inside UK regulated industries, reading procurement rules and answering tenders. We saw at first hand the friction UK SMEs face. | past | UNCITED |
| 2 | Jan to Feb 2026 | Regulatory research | Deep dive into statutory frameworks including PPN 002 and the Procurement Act 2023, so every figure traces back to a named, citeable source. | past | CITED (named instruments) |
| 3 | March 2026 | CrowAgent founded | Incorporated as CrowAgent Ltd in England and Wales (Company No. `17076461` — hyperlinked). Engine prototyping begins. | past | CITED (Companies House link) |
| 4 | May 2026 | Platform live | CrowMark in live production. | current | UNCITED (self-attested) |
| 5 | Q4 2026 | Regulatory monitor | Live UK public procurement regulatory change feed surfacing material updates straight into your dashboard. | future / dimmed | UNCITED (forward-looking) |

Entry 3 raw markup for the link (line 304):

```html
Incorporated as CrowAgent Ltd in England and Wales (Company No. <a href="https://find-and-update.company-information.service.gov.uk/company/17076461" target="_blank" rel="noopener" class="text-ca-teal-d underline">17076461</a>). Engine prototyping begins.
```

### Section — company details card (lines 321–355)

Eyebrow (line 326): `Company details`
H2 (line 327): `CrowAgent Ltd`

Repeated unit — **label / value rows** (6):

| # | Label | Value (verbatim) | Evidence |
|---|---|---|---|
| 1 | Registered name | CrowAgent Ltd | CITED (own public record) |
| 2 | Registered in | England and Wales | CITED |
| 3 | Company number | 17076461 | CITED |
| 4 | Data protection | `ICO registered data controller<br/>UK data residency` | **UNCITED on this page** |
| 5 | Founded | March 2026 | CITED |
| 6 | Contact | `hello@crowagent.ai` (mailto link) | CITED |

Note: row 4 renders as two lines via a literal `<br/>` — two distinct claims in one cell.

### Section — "One product, two variants." (lines 368–394)

Eyebrow (line 371): `The Stack`
H2 (line 372): `One product, <br/> two variants.`
Lead paragraph (line 373):

```
CrowMark serves both sides of a procurement, and both work in the public sector and the private sector.
```

Repeated unit — **product variant cards** (2):

| # | H3 | Body copy (verbatim) | Link text | href |
|---|---|---|---|---|
| 1 | CrowMark for Suppliers | Tender discovery from Contracts Finder and Find a Tender, the 10% minimum social-value weighting under PPN 002, PPN 017 AI disclosure, and Procurement Act 2023 KPI evidencing after award. | `See the supplier side &rarr;` | `/crowmark` |
| 2 | CrowMark for Buyers | Publish your requirements against a deterministic social value rubric, then locate the evidence for each one across the responses you receive, quoted verbatim or dropped. CrowMark organises; your evaluation panel scores. | `See the buyer side &rarr;` | `/crowmark-buyers` |

(The arrow is a separate `<span>&rarr;</span>` inside the anchor, so it is part of the
accessible name.)

### Section — bottom CTA (lines 399–414)

Eyebrow (line 401): `Ready to start?`
H2 (line 402): `Know the rules better <br/><span class="text-ca-teal">than your competition.</span>`
Body (line 408):

```
Book a 30-minute call with the team, or run the free PPN 002 Calculator now. No card, no signup.
```

### Section — newsletter aside (lines 417–427)

H2 `id="nl-h"` (line 418): `Get monthly UK procurement digests`
Body (line 419):

```
PPN 002 social value, tender-market trends and CrowMark product news, once a month. Unsubscribe any time.
```

Legal line (line 426): `By subscribing you agree to the [Privacy Policy](/privacy).`

**Form (about.html)** — `class="ca-newsletter__form notify-form"`,
`action="https://app.crowagent.ai/api/notify"`, `method="post"`, `aria-busy="false"`.
Progressive-enhancement native POST; no dedicated JS module found on this page.

| Field | id | name | type | Required | Attributes |
|---|---|---|---|---|---|
| Email address (label is `.sr-only`) | `nl-email` | `email` | email | yes | `autocomplete="email"`, `placeholder="you@company.com"`, `pattern="[^\s@]+@[^\s@]+\.[^\s@]+"`, `title="Please enter a valid email address (e.g. you@company.com)"` |
| Website (honeypot) | `nl-website` | `website` | text | no | wrapper `aria-hidden="true" class="hidden"`, `tabindex="-1"`, `autocomplete="off"` |
| Submit button | — | — | submit | — | text `Subscribe`, `data-magnetic` |

### All links on about.html

| Visible text | href | Notes |
|---|---|---|
| `17076461` | `https://find-and-update.company-information.service.gov.uk/company/17076461` | `target="_blank" rel="noopener"` |
| `hello@crowagent.ai` | `mailto:hello@crowagent.ai` | |
| `See the supplier side &rarr;` | `/crowmark` | |
| `See the buyer side &rarr;` | `/crowmark-buyers` | |
| `Book a 30-minute demo` | `https://calendly.com/crowagent-platform/30min` | `target="_blank" rel="noopener"` |
| `Try PPN 002 Calculator (free)` | `/tools/ppn-002-calculator` | |
| `Privacy Policy` | `/privacy` | inside newsletter legal line |

(Nav and footer links are injected at runtime by `/js/nav-inject.js` and into
`<div id="ca-footer">`; they are not in this file and are out of scope here.)

### Media on about.html

**Zero** `<img>`, `<video>`, `<picture>` or `<svg>` elements in the page body. The only
image reference is the `og:image` (`/Assets/og/about.png?v=20260730`, 1200×630, alt
`About Us`). Alt-text audit: **N/A / pass** — nothing to fail.

### Accessibility / structure audit — about.html

- **Alt attributes:** no images present. Pass by vacancy.
- **Heading order:** h1 (207) → h2 (245) → h3 ×3 (250, 255, 260) → h2 (281) → h3 ×5
  (288, 297, 303, 309, 315) → h2 (327) → h2 (372) → h3 ×2 (377, 382) → h2 (402) → h2 (418).
  **No skipped levels.**
- **Non-descriptive link text:** none. No "click here", "read more", "learn more".
- The "The approach" section (225–236) has no heading of any level — a landmark-less
  content block. Not a skip, but worth giving a heading in Astro if the design permits.

### Evidence flags — about.html

| Claim (verbatim) | Line | Flag | Reasoning |
|---|---|---|---|
| Company No. 17076461 / England and Wales / Registered name CrowAgent Ltd | 304, 331–339 | CITED | Linked to the Companies House register; own public record |
| Founded March 2026 | 302, 347 | CITED | Consistent with, and verifiable against, the linked CH record |
| `ICO registered data controller` | 343 | **UNCITED** | No registration number, no link. `privacy.html` (lines 486–487) *does* substantiate it with the ICO public-register link; this page does not carry that evidence |
| `UK data residency` | 343 | **UNCITED** | Absolute infrastructure claim, no source, no scope qualifier |
| `A London-based team` (meta/og/twitter description) and `London Based` (hero eyebrow) | 32, 150, 162, 204 | **UNCITED** | The page's own Company details table carries **no registered address**, so nothing on the page substantiates "London" |
| `UK Built` (hero eyebrow) | 204 | **UNCITED** | No source; unqualified provenance claim |
| `Statute Cited` (hero eyebrow) | 204 | **UNCITED** | Product-behaviour guarantee stated as a badge |
| PPN 002 / Procurement Act 2023 / sections 52 and 71 / PPN 017 / Contracts Finder / Find a Tender | 229, 233, 298, 378 | CITED | Named, publicly checkable instruments and services |
| `the 10% minimum social-value weighting under PPN 002` | 378 | CITED | Attributed to PPN 002; matches the project's binding 10% rule |
| `every figure in an answer is checked against your own confirmed data before it is shown, or the draft is rejected` | 229 | **UNCITED** | Absolute product guarantee, no method or evidence |
| `A figure that cannot be traced to your own confirmed data is rejected rather than shown` | 261 | **UNCITED** | Absolute guarantee |
| `figures the AI cannot invent and a named person on every approval` | 251 | **UNCITED** | Absolute guarantee ("cannot") |
| `Years spent inside UK regulated industries` (2021 to 2025) | 292 | **UNCITED** | Team-experience claim; no named individuals, roles or employers anywhere on the page |
| `CrowMark in live production.` (May 2026) | 310 | **UNCITED** | Self-attested; no status page or evidence link |
| `Q4 2026 — Regulatory monitor` | 314–316 | **UNCITED** | Forward-looking roadmap commitment with a date |
| `CrowMark organises; your evaluation panel scores.` | 389 | CITED (in substance) | Reflects Procurement Act 2023 equal-treatment; the statute is named elsewhere on the page |

**Team members: there are none.** The page names no individual, no title and no
credential. Anyone migrating this expecting a team grid should know the grid does not
exist — do not invent one.

---

## Page — partners.html

### Head / metadata (verbatim)

| Tag | Value | Line |
|---|---|---|
| `<title>` | `Partners \| CrowAgent` | 22 |
| `meta name="description"` | `Partner with CrowAgent. Bid agencies, law firms and public sector advisors get revenue share, branded exports and a named contact.` | 30 |
| `meta name="viewport"` | `width=device-width,initial-scale=1.0` | 7 |
| `meta name="theme-color"` | `#0A1F3A` | 38 |
| `link rel="canonical"` | `https://crowagent.ai/partners` | 96 |
| `og:title` | `Partners \| CrowAgent` | 85 |
| `og:description` | `Deliver PPN 002 social value tools to your public-sector bidding clients, under your own brand.` | 86 |
| `og:type` | `website` | 87 |
| `og:url` | `https://crowagent.ai/partners` | 88 |
| `og:image` | `https://crowagent.ai/Assets/og/partners.png?v=20260730` | 89 |
| `og:image:width` | `1200` | 90 |
| `og:image:height` | `630` | 91 |
| `og:image:alt` | `Partners` | 92 |
| `twitter:image` | `https://crowagent.ai/Assets/og/partners.png?v=20260730` | 93 |
| `twitter:card` | `summary_large_image` | 94 |
| `twitter:site` | `@CrowAgentLtd` | 95 |

**Absent:** no `robots`, no `og:site_name`, no `og:locale`, no `hreflang`,
**no `twitter:title`, no `twitter:description`**. Also note `meta description` and
`og:description` are **different strings** — carry both across verbatim, do not unify.

### JSON-LD (lines 98–100)

`@type`: **BreadcrumbList**. Only structured-data block. No `Organization`.

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"Partners","item":"https://crowagent.ai/partners"}]}
```

### Hero (lines 116–147)

Breadcrumb nav (lines 123–128), `aria-label="Breadcrumb"`: `Home` (→ `/`) / `Partners`
(`aria-current="page"`).

No eyebrow/kicker on this hero (unlike about and integrations).

H1 (lines 132–135), **two spans, verbatim**:

```
Put CrowMark in front of
to your clients.
```

> ⚠️ **This H1 is grammatically broken as shipped.** The two spans concatenate to
> "Put CrowMark in front of to your clients." A word or phrase is missing between the
> spans — most likely an edit that removed an object ("…in front of every bid you write")
> and left the trailing "to your". The second span also wraps `clients.` in
> `<span class="text-ca-teal">`. **Do not silently "fix" this during migration — carry it
> verbatim and raise it, or get owner sign-off on replacement wording.**

Standfirst (line 138):

```
CrowAgent partners with bid agencies, law firms and public sector advisors who want to run PPN 002 social value and delivery evidence for their clients under their own brand. Revenue share, co-marketing and a priority support channel.
```

Hero CTAs: `Become a partner &rarr;` → `#partner-form-section`;
`Talk to us` → `mailto:hello@crowagent.ai`.

### Section — partner benefits (lines 150–175)

H2 is **visually hidden**: `<h2 class="sr-only" id="partner-benefits-heading">What partners get</h2>`
(line 152). Section is `aria-labelledby="partner-benefits-heading"`. Preserve the sr-only
h2 in Astro or the section loses its accessible name.

Repeated unit — **benefit cards** (3):

| # | Capsule label | H3 | Body copy (verbatim) |
|---|---|---|---|
| 1 | Capability | Branded reports | Branded PDF and DOCX exports carrying your own name, and one pool of AI credits allocated across every client you act for. |
| 2 | Support | A named contact | Dedicated account contact and a priority support channel for rapid technical and regulatory guidance. |
| 3 | Growth | Joint marketing | Co-branded regulatory updates you can send to your own client list, and joint write-ups of the work once there is work to write up. |

### Section — "Who we partner with." (lines 178–201)

Eyebrow (line 181): `Ecosystem`
H2 (line 182): `Who we partner with.`
Lead (line 188):

```
Whether you write bids, advise on procurement or guide public sector clients, CrowMark does the PPN 002 arithmetic and the evidence tracking underneath your service.
```

Repeated unit — **partner types / tiers** (2). These are **audience categories, not named
partner organisations** — see evidence notes.

| # | H3 | Body copy (verbatim) |
|---|---|---|
| 1 | Bid Agencies | Automate PPN 002 social value for all your client bids. Bulk credits and evidence tracker for all clients. |
| 2 | Public Sector Advisors | PPN 002 social value scoring (CrowMark) for your public sector bidding clients. |

Note the mismatch: the hero and meta description name **three** audiences (bid agencies,
law firms, public sector advisors) and the form dropdown offers **four** options, but this
section shows only **two** cards. Law firms are named in the hero and in the dropdown but
have no card.

### Section — enquiry (lines 204–311)

Eyebrow (line 208): `Enquiry`
H2 (line 209): `Express your <br/> interest.`
Lead (line 214):

```
Tell us who your clients are and how you work with them. We reply within two business days.
```

"Why partner?" panel (lines 216–232) — eyebrow `Why partner?`, then a `<ul>` of three
items, each preceded by a decorative tick `<svg aria-hidden="true" focusable="false">`:

| # | Item (verbatim) |
|---|---|
| 1 | Revenue share on all client credits |
| 2 | White-label PDF report generation |
| 3 | Bulk credit allocation across your client portfolio |

### Form — `#partner-form` (lines 236–307)

The `<form>` has **no `action` and no `method`**; submission is entirely JS-driven by
`/js/partners-form.js?v=20260603a` (loaded `defer` at line 46).

| Order | Label (verbatim) | id | name | Type | Required | Placeholder / options | Autocomplete | Error span id |
|---|---|---|---|---|---|---|---|---|
| 0 | Website (honeypot) | `partner-website` | `website` | text | no | — | `off` (`tabindex="-1"`, wrapper `aria-hidden="true" class="hidden"`) | — |
| 1 | `Full Name *` | `partner-name` | `name` | text | yes | `Your name` | `name` | `partner-name-err` |
| 2 | `Company *` | `partner-company` | `company` | text | yes | `Company name` | `organization` | `partner-company-err` |
| 3 | `Your Role *` | `partner-role` | `role` | text | yes | `Managing Director` | `organization-title` | `partner-role-err` |
| 4 | `Work Email *` | `partner-email` | `email` | email | yes | `you@company.com` | `email` | `partner-email-err` |
| 5 | `Phone` | `partner-phone` | `phone` | tel | no | `+44 20 ...` | `tel` | — |
| 6 | `Partner Type *` | `partner-type` | `partner_type` | select | yes | `Select...` (disabled, selected) / `Bid Agency` / `Law Firm` / `NHS/Public Sector Advisor` / `Other` | — | `partner-partner_type-err` |
| 7 | `About your client base` | `partner-description` | `description` | textarea | no | `Briefly describe your client base...`, `rows="4"`, `maxlength="200"` | — | — |
| 8 | Cloudflare Turnstile | — | `cf-turnstile-response` (injected) | widget | effectively yes | `data-sitekey="0x4AAAAAADML7D0t7OQT4B4R"`, `data-localhost-sitekey="1x00000000000000000000AA"` | — | — |
| 9 | GDPR consent checkbox | `partner-consent` | `gdpr_consent` | checkbox | yes (`required`) | see consent copy below | — | — |
| 10 | Submit | `partnerSubmitBtn` | — | submit | — | `Submit enquiry &rarr;`, `data-magnetic` | — | — |

Consent copy (line 296, verbatim):

```
I agree that CrowAgent Ltd may process my data to evaluate this partner enquiry, in line with the Privacy Policy.
```

Status regions:
- `#partners-form-status` — `role="alert" aria-live="polite" class="sr-only"` (consolidated AT announcer)
- `#partner-form-success` — hidden by default. Text: `Enquiry received. We'll be in touch within 2 business days.`
- `#partner-form-error` — hidden by default, `role="alert" aria-live="polite"`, empty in markup, filled by JS.

Note the field name mismatch to watch when porting: the error span for the select is
`partner-partner_type-err` (field name `partner_type`), while all others are
`partner-<name>-err`. The JS builds the id as `'partner-' + fieldName + '-err'`, so this is
correct by construction — do **not** "tidy" it to `partner-type-err` or per-field errors
break for the select.

### `js/partners-form.js` — exact behaviour

**Turnstile loading.** Lazy-loaded from an inline script in partners.html (lines 48–65):
`https://challenges.cloudflare.com/turnstile/v0/api.js` is injected only on form focus, to
avoid networkidle timeouts (LM-025); on localhost the `data-localhost-sitekey` test key is
swapped in because the production sitekey is hostname-locked (error 110200).
`window.onTurnstileSuccess` (lines 12–18) only `console.info`s on localhost or when
`window.__CA_DEBUG__` — it is a debug hook, not a gate.

**Validation, in execution order** (`submit` handler, line 77 onward):

1. `e.preventDefault()`; clear the form-level error, all per-field errors, and the live region.
2. **Honeypot** — if `[name="website"]` has any value, `return` silently. No error shown, no request sent.
3. **Sanitise every field**: strip all `\r`/`\n` (collapsed to a single space), `.trim()`, then truncate to a per-field cap.
   Caps: `name` 200, `company` 200, `role` 200, `email` 320, `phone` 40, `partner_type` 80, `description` 4000 (default 4000).
   Rationale in source: mailto header-injection guard for legacy MUAs, plus bounding mailto URI length.
   Note `description` is capped at 4000 in JS but the textarea itself is `maxlength="200"` — the JS cap is unreachable via the UI.
4. **Required checks** (all five, accumulating into `hasError`), each setting `aria-invalid="true"` + `aria-describedby` + the per-field span:
   - `name` → `Please enter your name.`
   - `company` → `Please enter your company.`
   - `role` → `Please enter your role.`
   - `email` → `Please enter an email address.`
   - `partner_type` → `Please choose a partner type.`
   If any failed: form-level error + live region both read `Please complete the highlighted fields.` and it returns.
5. **Email format** — `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. On failure, field error and form error and announcement all read `Please enter a valid email address.` and it returns.
6. **Turnstile token** — if a `[name="cf-turnstile-response"]` input exists and is empty **and** the host is not local dev, error `Please complete the security check.` and return. Local-dev hosts (`localhost`, `127.0.0.1`, `0.0.0.0`, `[::1]`) instead have the token stuffed with the literal `dev-bypass-localhost`.
   **Note:** the check is conditional on the input *existing*. If Turnstile never loads, no input exists and the submission proceeds with no bot check.
7. Disable the submit button and set its text to `Submitting...`.

**What it POSTs, and where.**

- Endpoint: `https://formspree.io/f/xbdpkaol`, `method: 'POST'`, header `Accept: application/json`, body a **`FormData`** (multipart), timeout `AbortSignal.timeout(10000)` (10s) where supported.
- Fields sent: `name`, `company`, `role`, `email`, `phone`, `partner_type`, `description`, and `_subject` = `'New Partner Enquiry — ' + company`.
- **Not sent:** `gdpr_consent` and `cf-turnstile-response` are **not** appended to the FormData. The consent tick is enforced client-side only and is never transmitted or recorded; the Turnstile token is validated by nobody server-side.

**Success state.** On any `res.ok`: the whole `<form>` is `display:none`, `#partner-form-success` is `display:block` (rendering `Enquiry received. We'll be in touch within 2 business days.`), and the live region announces `Thank you for your interest. We’ll be in touch within 2 business days.` (note: the announced string uses a curly apostrophe and differs slightly from the visible one).

**Error state.** On non-2xx (thrown as `Server error <status>: <body>`), network failure, or the 10s abort: the button is re-enabled and reset to `Submit enquiry →`, and `#partner-form-error` is set via `innerHTML` to:

```
Something went wrong submitting the form. Please <a href="…mailto…">email us directly at sales@crowagent.ai</a> and we’ll pick it up from there.
```

The mailto fallback is built as `mailto:sales@crowagent.ai?subject=<encoded 'Partner Enquiry — ' + company>&body=<encoded Name/Role/Company/Email/Phone/Partner type/About client base block>`, passed through an `escapeHtml()` before interpolation. Live region announces `Something went wrong submitting the form. Please email sales@crowagent.ai instead.` Console logging is gated to localhost/`__CA_DEBUG__`.

### Bottom CTA (lines 314–324)

H2 (line 316): `Ready to start?`
Body (line 317):

```
Book a 30-minute call to talk through your client base before you sign anything.
```

Trailing line (line 322): `CrowAgent Ltd, Companies House No. 17076461`

### All links on partners.html

| Visible text | href | Notes |
|---|---|---|
| `Home` | `/` | breadcrumb |
| `Become a partner &rarr;` | `#partner-form-section` | in-page anchor |
| `Talk to us` | `mailto:hello@crowagent.ai` | |
| `Privacy Policy` | `/privacy` | inside GDPR consent label |
| `Book a 30-minute demo` | `https://calendly.com/crowagent-platform/30min` | `target="_blank" rel="noopener"` |
| `Email the team` | `mailto:hello@crowagent.ai` | |
| `email us directly at sales@crowagent.ai` | `mailto:sales@crowagent.ai?subject=…&body=…` | injected by JS on error only |

### Media on partners.html

**Zero** `<img>`, `<video>` or `<picture>` elements. Three inline `<svg>` tick icons in the
"Why partner?" list (lines 220, 224, 228), each correctly `aria-hidden="true"
focusable="false"` with `width="16" height="16"` — decorative, correctly hidden.
`og:image` is `/Assets/og/partners.png?v=20260730`, 1200×630, alt `Partners`.

### Accessibility / structure audit — partners.html

- **Alt attributes:** no images present. Pass by vacancy. Decorative SVGs correctly hidden.
- **Heading order:** h1 (132) → h2 sr-only (152) → h3 ×3 (160, 165, 170) → h2 (182) → h3 ×2 (192, 196) → h2 (209) → h2 (316). **No skipped levels.**
- **Non-descriptive link text:** none. All anchors carry meaningful text.
- The sr-only h2 at 152 is load-bearing for `aria-labelledby` — must survive migration.

### Evidence flags — partners.html

| Claim (verbatim) | Line | Flag | Reasoning |
|---|---|---|---|
| `CrowAgent Ltd, Companies House No. 17076461` | 322 | CITED | Own public record |
| `Revenue share, co-marketing and a priority support channel.` | 138 | **UNCITED** | Commercial terms asserted with no rate, no tier table, no linked partner agreement |
| `Revenue share on all client credits` | 221 | **UNCITED** | Same; "all" is absolute |
| `White-label PDF report generation` | 225 | **UNCITED** | Capability claim, no evidence the feature ships |
| `Branded PDF and DOCX exports carrying your own name` | 161 | **UNCITED** | Capability claim |
| `one pool of AI credits allocated across every client you act for` | 161 | **UNCITED** | Capability claim |
| `Bulk credit allocation across your client portfolio` | 229 | **UNCITED** | Capability claim |
| `Bulk credits and evidence tracker for all clients.` | 193 | **UNCITED** | Capability claim |
| `Dedicated account contact and a priority support channel` | 166 | **UNCITED** | Service-level claim, no SLA document |
| `We reply within two business days.` | 214 | **UNCITED** | Response-time commitment with no stated basis |
| `Enquiry received. We'll be in touch within 2 business days.` | 303 | **UNCITED** | Same commitment restated as a post-submit promise |
| `Automate PPN 002 social value for all your client bids.` | 193 | CITED (instrument) / UNCITED (capability) | PPN 002 is named and checkable; "automate … for all" is not evidenced |
| `PPN 002 social value scoring (CrowMark)` | 197 | CITED (instrument) | PPN 002 named |
| `joint write-ups of the work once there is work to write up` | 171 | CITED — honest | Explicitly concedes there are no case studies yet. **Preserve this wording exactly**; it is doing evidential work |
| Named partners | — | **none asserted** | The page names **no partner organisation** and asserts **no live commercial relationship**. "Bid Agencies", "Law Firms", "NHS/Public Sector Advisor" are audience categories and dropdown options only. This is the correct posture — do not add logos in the migration |
| `Put CrowMark in front of / to your clients.` (H1) | 132–135 | — | Not an evidence issue but a **shipped copy defect**; see the hero note above |

**Data-protection observation (not a copy claim, but material).** `partners.html` POSTs
name, company, role, email, phone and free-text to **Formspree** (`formspree.io`), a US
third-party processor. `privacy.html` contains **no mention of Formspree** — grep for
`Formspree` in `privacy.html` returns zero matches, while it does list Cloudflare as an
edge sub-processor. The consent line tells the user CrowAgent Ltd will process their data
"in line with the Privacy Policy", and the Privacy Policy does not disclose this
recipient. The `gdpr_consent` checkbox value is also never transmitted or stored, so there
is no record of consent. Both should be raised with the owner; neither is fixable inside
this extraction task.

---

## Page — integrations.html

### Head / metadata (verbatim)

| Tag | Value | Line |
|---|---|---|
| `<title>` | `Integrations \| CrowAgent` | 14 |
| `meta name="description"` | `Sign in with your work identity, pull bid documents read-only from where your team keeps them, and send deadline alerts to Slack or Teams.` | 15 |
| `meta name="viewport"` | `width=device-width,initial-scale=1.0` | 7 |
| `meta name="robots"` | `index,follow` | 23 |
| `meta name="color-scheme"` | `dark` | 25 |
| `meta name="theme-color"` | `#0A1F3A` | 35 |
| `link rel="canonical"` | `https://crowagent.ai/integrations` | 27 |
| `og:title` | `Integrations \| CrowAgent` | 16 |
| `og:description` | `Sign in with your work identity, pull bid documents read-only from where your team keeps them, and send deadline alerts to Slack or Teams.` | 17 |
| `og:image` | `https://crowagent.ai/Assets/og/integrations.png?v=20260730` | 18 |
| `og:image:alt` | `Integrations` | 19 |
| `og:image:width` | `1200` | 21 |
| `og:image:height` | `630` | 22 |
| `og:site_name` | `CrowAgent` | 24 |
| `og:url` | `https://crowagent.ai/integrations` | 26 |
| `twitter:image` | `https://crowagent.ai/Assets/og/integrations.png?v=20260730` | 20 |
| `twitter:card` | `summary_large_image` | 47 |
| `twitter:site` | `@CrowAgentLtd` | 48 |
| `twitter:title` | `Integrations \| CrowAgent` | 49 |
| `twitter:description` | `Connect CrowAgent to the comms, identity and collaboration tools you already run.` | 50 |

**Absent:** no `og:type`, no `og:locale`, no `hreflang`.
`twitter:description` is **different** from `og:description` / `meta description` — carry
both verbatim.

### JSON-LD (line 46)

`@type`: **BreadcrumbList**. Single line, no `Organization`.

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"Integrations"}]}
```

Field-set difference worth preserving or deliberately fixing: **position 2 has no `item`
property** here, unlike about.html and partners.html which both give position 2 an `item`.

### Hero (lines 125–155)

Breadcrumb (lines 128–133): `Home` (→ `/`) / `Integrations` (`aria-current="page"`).

Eyebrow / kicker (line 136), after `<span class="ca-eyebrow-dot">`:

```
Connect your stack
```

H1 (lines 138–141), two spans (second is teal):

```
Works with the tools
you already run.
```

Standfirst (line 147):

```
Sign in with your work identity, read documents where they live, and route alerts to your channels. Read-only throughout.
```

Hero CTAs: `Request access &rarr;` → `/contact?enquiry=limited-access#contact-form`;
`Read the security model` → `/security`.

### Removed sections — migration-critical note

Lines 157–176 carry a long comment recording that **sections 02 (ACCOUNTING) and 03
(CREDIT DATA) were removed in full** on 2026-07-28 under TM-REMEDIATION-001 — including
the heading "Read your ledger, never touch it", copy about ageing debt and statutory
interest, and Xero / QuickBooks / Sage / Creditsafe / Experian chips. Section numbering is
**deliberately left non-contiguous (04–09)** so the gap stays visible. The comment also
states explicitly: *"These connectors REMAIN LIVE on the platform and REMAIN DISCLOSED in
privacy.html … Do not 'tidy' privacy.html to match this page."*

**Carry the numbering gap and this comment forward.** Do not resequence to 01–07 in Astro.

### Section — Comms (`#comms`, dark, lines 179–192)

Eyebrow: `Comms`
H2 (line 183): `Send reminders from your own number.`
Body (line 184):

```
Send tender-deadline and delivery-evidence reminders over SMS using your own messaging provider, so the sender ID stays yours and the cost stays at your rate.
```

### Section — Identity & SSO (`#sso`, light, lines 200–220)

Eyebrow: `Identity &amp; SSO`
H2 (line 204): `Use the directory you already administer.`
Body (line 209):

```
Microsoft Entra ID and Google Workspace single sign-on are available now. Other identity providers can be onboarded today by federating them into Entra ID. Native SAML 2.0 and OIDC connectors for the providers below is on the roadmap, not shipped yet.
```

(Grammar note as shipped: "connectors … **is** on the roadmap". Verbatim.)
Source comment (195–199) records that this section previously claimed "Single sign-on
through any SAML 2.0 identity provider" and badged all six providers "SAML 2.0"; it was
relabelled down to match pricing.html and roadmap.html. This is a **deliberate
de-escalation** — do not re-inflate it.

### Section — Collaboration (`#collaboration`, dark, lines 223–236)

Eyebrow: `Collaboration`
H2 (line 227): `Alerts where your team works.`
Body (line 228):

```
Push a deadline, a social-value score change, or a delivery-evidence reminder straight into the channel your team already checks, and store evidence exports in your own drive.
```

### Section — Automation platforms (`#automation-platforms`, light, lines 242–254)

Eyebrow: `Automation platforms`
H2 (line 246): `Wire CrowMark into the tools you already automate.`
Body (line 247):

```
Trigger downstream workflows in the low-code platform you already use, so an event in CrowMark can update a CRM, a spreadsheet, or a ticketing tool without custom code.
```

### Repeated unit — integration chips (14 across 4 sections)

Markup shape: `.intg-chip` → `<span class="logo">` (either an `<img>` or a `.mono` text
glyph) + `<span class="txt">` → `<span class="nm">` name + `<span class="st">` status.

| # | Section | Name (`.nm`) | Status (`.st`) | Logo | Image src | alt | w×h | Asserts live commercial relationship? |
|---|---|---|---|---|---|---|---|---|
| 1 | Comms | Twilio | Connect your own | img | `/Assets/brand/integrations/color-twilio.svg` | `Twilio` | 22×22 | No — BYO credentials |
| 2 | Comms | Vonage | Connect your own | img | `/Assets/brand/integrations/color-vonage.svg` | `Vonage` | 22×22 | No — BYO credentials |
| 3 | Comms | MessageBird | Connect your own | img | `/Assets/brand/integrations/color-bird.svg` | `Bird (formerly MessageBird)` | 22×22 | No — BYO credentials |
| 4 | Identity & SSO | Okta | Via Entra ID federation | img | `/Assets/brand/integrations/color-okta.svg` | `Okta` | 22×22 | No — explicitly indirect |
| 5 | Identity & SSO | Microsoft Entra ID | Available now | img | `/Assets/brand/integrations/color-microsoft-entra-id.svg` | `Microsoft Entra ID` | 22×22 | Asserts shipped capability, not a partnership |
| 6 | Identity & SSO | Google Workspace | Available now | img | `/Assets/brand/integrations/color-google.svg` | `Google Workspace` | 22×22 | Asserts shipped capability, not a partnership |
| 7 | Identity & SSO | OneLogin | Via Entra ID federation | `.mono` text `OL` | — | — | — | No — explicitly indirect |
| 8 | Identity & SSO | Ping Identity | Via Entra ID federation | img | `/Assets/brand/integrations/color-ping-identity.svg` | `Ping Identity` | 22×22 | No — explicitly indirect |
| 9 | Identity & SSO | Self-hosted IdP | Via Entra ID federation | `.mono` text `ID` | — | — | — | No |
| 10 | Collaboration | Slack | Alerts | img | `/Assets/brand/integrations/color-slack.svg` | `Slack` | 22×22 | Asserts shipped capability |
| 11 | Collaboration | Microsoft Teams | Alerts | img | `/Assets/brand/integrations/color-microsoft-teams.svg` | `Microsoft Teams` | 22×22 | Asserts shipped capability |
| 12 | Collaboration | Google Drive | Evidence export | img | `/Assets/brand/integrations/color-google-drive.svg` | `Google Drive` | 22×22 | Asserts shipped capability |
| 13 | Automation platforms | Zapier | Webhooks | img | `/Assets/brand/integrations/color-zapier.svg` | `Zapier` | 22×22 | No — "Webhooks" is honest; not a published Zapier app |
| 14 | Automation platforms | Make | Webhooks | img | `/Assets/brand/integrations/color-make.svg` | `Make` | 22×22 | No — "Webhooks" is honest |

All 14 chips use third-party trademarks and logos. None of the status labels asserts a
partnership, reseller agreement or endorsement — the strongest claims are "Available now"
(capability) and "Alerts"/"Webhooks"/"Evidence export" (capability). That posture is
correct and should be preserved verbatim.

### Section — Automation rules (`#rules`, dark, lines 257–284)

Eyebrow: `Automation rules`
H2 (line 261): `Trigger, condition, action.`
Body (line 262):

```
Build simple rules in the app: pick an event, add the conditions that matter, and choose what happens. No engineering ticket required.
```

Repeated unit — **rule-flow steps** (3), separated by two `.rule-arrow` `&rarr;` divs that
are `aria-hidden="true"` and carry inline
`style="color:#5BC8FF !important;-webkit-text-fill-color:#5BC8FF !important;"` (an
inline hard-coded hex — a known workaround for the sitewide inherited
`-webkit-text-fill-color` trap; keep it or reproduce the effect with a token in Astro):

| # | Label (`.lbl`) | H3 | Body copy (verbatim) |
|---|---|---|---|
| 1 | Trigger | An event fires | A tender deadline approaches, a social-value score falls short of the buyer's published weighting, or a delivery commitment's evidence comes due. |
| 2 | Conditions | Filters you set | Only when the contract value is over a threshold, the sector matches your filters, or the deadline is inside a chosen window. |
| 3 | Action | What happens next | Fire a webhook, send an email, or raise an in-app alert to the right owner. |

Note the label/H3 pairing is `Trigger` / `Conditions` / `Action` while the H2 above reads
`Trigger, condition, action.` (singular "condition"). Verbatim; do not harmonise.

### Section — CTA (dark, lines 287–298)

H2 (line 289): `Connect once, <br/> bid from one place.`
Body (line 290):

```
Every connector reads only what it needs, cites the statute behind each figure, and keeps your data in the UK.
```

Trailing line (line 296): `CrowAgent Ltd, Companies House No. 17076461`

### All links on integrations.html

| Visible text | href | Notes |
|---|---|---|
| `Home` | `/` | breadcrumb |
| `Request access &rarr;` | `/contact?enquiry=limited-access#contact-form` | hero; per the standing rule this is a web-form link, **not** a bare `mailto:` — correct |
| `Read the security model` | `/security` | hero secondary |
| `Request access &rarr;` | `/contact?enquiry=limited-access#contact-form` | bottom CTA (duplicate text + href, different location) |
| `View all pricing` | `/pricing` | bottom CTA |

### Media on integrations.html

12 `<img>` elements, all `.svg`, all `width="22" height="22"`, **all with a non-empty
`alt`** (see chip table). Two chips use `.mono` text glyphs (`OL`, `ID`) instead of images —
no image, so no alt required; the readable provider name follows immediately in `.nm`, so
the accessible reading is "OL OneLogin" / "ID Self-hosted IdP" (slightly noisy but not a
failure). One decorative background div at line 126 is correctly `aria-hidden="true"`. Two
`.rule-arrow` divs correctly `aria-hidden="true"`.

`og:image` is `/Assets/og/integrations.png?v=20260730`, 1200×630, alt `Integrations`.

### Accessibility / structure audit — integrations.html

- **Alt attributes:** all 12 images have non-empty alt. **No failures.**
- **Heading order:** h1 (138) → h2 (183) → h2 (204) → h2 (227) → h2 (246) → h2 (261) → h3 ×3 (267, 273, 279) → h2 (289). **No skipped levels.**
- **Non-descriptive link text:** none.
- `<main tabindex="-1" id="main-content" role="main">` — skip-link target; preserve.

### Evidence flags — integrations.html

| Claim (verbatim) | Line | Flag | Reasoning |
|---|---|---|---|
| `CrowAgent Ltd, Companies House No. 17076461` | 296 | CITED | Own public record |
| `Read-only throughout.` (hero standfirst) | 147 | **UNCITED — absolute security guarantee** | Stated without qualification or scope. **Contradicted on the same page**: the Google Drive chip is labelled `Evidence export` and the Collaboration copy says "store evidence exports in your own drive" — writing to a user's Drive is not read-only. Slack/Teams alerts are also outbound writes |
| `pull bid documents read-only from where your team keeps them` (meta + og description) | 15, 17 | **UNCITED — and orphaned** | No section on the page describes pulling documents. The document/storage sections (02 accounting, 03 credit data) were deleted 2026-07-28; the description was never updated. The page now promises a capability it does not show |
| `read documents where they live` (hero standfirst) | 147 | **UNCITED — and orphaned** | Same: nothing below the hero supports it |
| `Every connector reads only what it needs` | 290 | **UNCITED — absolute** | "Every" + "only" with no data-minimisation evidence, no scopes listed, no link to `/security` from this sentence |
| `cites the statute behind each figure` | 290 | **UNCITED — absolute** | "each figure" is an unqualified guarantee |
| `keeps your data in the UK` | 290 | **UNCITED — and in tension with the chips above it** | The same page lists Twilio, Vonage, Bird, Google Workspace, Google Drive, Slack, Zapier and Make — all non-UK processors, several of them US-headquartered. A blanket UK-residency guarantee sitting under 14 third-party connector logos is the highest-risk sentence on this page |
| `Microsoft Entra ID and Google Workspace single sign-on are available now.` | 209 | **UNCITED** (self-attested, internally consistent) | The source comment says this was deliberately relabelled to match pricing.html and roadmap.html — good practice, but the page itself carries no link to that evidence |
| `Native SAML 2.0 and OIDC connectors … is on the roadmap, not shipped yet.` | 209 | CITED — honest | Explicit "not shipped yet" caveat. **Preserve verbatim.** This sentence is the fix for a prior overclaim; weakening or dropping it re-creates the defect |
| `Via Entra ID federation` ×4 (Okta, OneLogin, Ping Identity, Self-hosted IdP) | 212, 215, 216, 217 | CITED — honest | Deliberately downgraded status labels. Do not upgrade to "Available" in the migration |
| `Connect your own` ×3 (Twilio, Vonage, MessageBird) | 187–189 | CITED — honest | Makes clear the customer brings their own account; asserts no commercial relationship |
| `Available now` ×2 (Entra ID, Google Workspace) | 213, 214 | **UNCITED** | Shipped-capability assertion with no evidence link; lowest-risk of the uncited set because it is checkable on request |
| `Alerts` / `Evidence export` / `Webhooks` ×5 | 231–233, 250, 251 | **UNCITED** | Shipped-capability assertions |
| Named customers | — | **none** | The page names no customer and shows no logo wall of users. Correct posture |
| `so the sender ID stays yours and the cost stays at your rate` | 184 | **UNCITED** | Commercial/technical guarantee about a third-party account |
| `No engineering ticket required.` | 262 | **UNCITED** | Capability claim about the rules builder |

---

## Cross-page notes for the Astro rebuild

1. **Shared runtime injection.** All three pages render nav into
   `<header id="ca-nav" class="sv-nav" role="banner">` via `/js/nav-inject.js` and footer
   into `<div id="ca-footer">`. Neither nav nor footer content lives in these files, so
   neither is captured above. In Astro these become layout components — but the nav CSS is
   governed by `nav-global-fix-2026-05-27.css`, not `styles.css`.
2. **Alignment CSS is load-bearing.** about.html carries a page-scoped `<style>` block
   (lines 176–185) pinning `.ca-card > a:last-child { margin-top: auto }` so the two
   "See the … side" links share a baseline, and several sections use
   `<div style="width:fit-content">` wrappers purely to defeat
   `nav-global-fix`'s `margin-inline:auto!important` on eyebrows. If the Astro components
   drop those wrappers the eyebrows silently re-centre.
3. **Gradient-H1 workaround.** about.html has a `<style>` block from line 48 forcing
   `-webkit-text-fill-color: var(--white)` (BUG-024, uniform H1 gradient). integrations.html
   has the inline `#5BC8FF` arrow override. Both exist because of the sitewide inherited
   `-webkit-text-fill-color` trap. Reproduce the *effect*, not necessarily the hack.
4. **Descriptions differ per channel on two pages.** partners.html `meta description` ≠
   `og:description`; integrations.html `og:description` ≠ `twitter:description`. Do not
   collapse these to one string in a shared SEO component without owner sign-off.
5. **Missing meta to decide on, not to silently add:** partners.html has no
   `twitter:title` / `twitter:description` / `og:site_name` / `og:locale` / `hreflang`;
   integrations.html has no `og:type` / `og:locale` / `hreflang`; about.html and
   partners.html have no `robots`. Only integrations.html declares `robots index,follow`.
6. **No page carries `Organization` JSON-LD.** All three carry `BreadcrumbList` only, and
   integrations.html's breadcrumb omits `item` on position 2.
7. **`?v=` cache-busters** are on every stylesheet and script (`20260801p0`, `20260731b/c/f`,
   `20260603a`, `20260729rev`, `20260525`). Astro's own hashing replaces these; the
   asset-hash guard / CRLF trap noted in project memory applies to any SVG carried over.

---

## Uncited claims — action required

Ordered roughly by severity. "Page" is the source file; wording is verbatim.

| # | Page | Exact wording | Type | Why it is a risk |
|---|---|---|---|---|
| 1 | integrations.html | `Read-only throughout.` | Absolute security guarantee | Unqualified security promise in the hero, **contradicted by the same page**: `Evidence export` to Google Drive and `Alerts` to Slack/Teams are writes to customer systems. A buyer's security reviewer will find this in one pass, and a contradicted security claim damages every other claim on the site |
| 2 | integrations.html | `Every connector reads only what it needs, cites the statute behind each figure, and keeps your data in the UK.` | Absolute security + data-residency guarantee | Three unqualified absolutes in one sentence, printed directly beneath 14 third-party connector logos (Twilio, Vonage, Bird, Google, Slack, Zapier, Make) that are not UK-resident. "keeps your data in the UK" is the single highest-exposure sentence across the three pages |
| 3 | integrations.html | `pull bid documents read-only from where your team keeps them` (meta description + `og:description`) | Orphaned capability claim | Promises a document-pull capability that **no section of the page describes** — the storage/accounting sections were deleted 2026-07-28 and the metadata was never updated. It is also the text that appears in Google results and in every social share |
| 4 | integrations.html | `read documents where they live` (hero standfirst) | Orphaned capability claim | Same defect, on the page itself, in the standfirst directly under the H1 |
| 5 | about.html | `ICO registered data controller` | Regulatory registration claim | Claims a **registration**, not adherence to controls. `privacy.html` substantiates it properly (ICO public-register link, lines 486–487); this page carries the claim bare with no number and no link, so the strongest compliance statement on the About page is the least evidenced one there |
| 6 | about.html | `UK data residency` | Absolute infrastructure claim | Stated as a company fact in a table of Companies House facts, which lends it borrowed authority. No scope, no exclusions, no link to `/security` |
| 7 | about.html | `A London-based team` (×3: meta, `og:description`, `twitter:description`) and `London Based` (hero eyebrow) | Location claim | The page's own Company details table gives registered name, jurisdiction, number and founding date but **no registered address**. The one geographic claim is the one not evidenced, on the page whose whole purpose is company provenance |
| 8 | about.html | `every figure in an answer is checked against your own confirmed data before it is shown, or the draft is rejected` | Absolute product guarantee | "every … or rejected" is a determinism promise with no described mechanism. Given the positioning depends on refusing to overclaim, an unevidenced absolute here is self-undermining |
| 9 | about.html | `A figure that cannot be traced to your own confirmed data is rejected rather than shown` | Absolute product guarantee | Same shape, restated under "Values" |
| 10 | about.html | `figures the AI cannot invent and a named person on every approval` | Absolute product guarantee | "cannot" is the strongest possible form; also asserts a workflow control ("named person on every approval") with no evidence |
| 11 | about.html | `UK Built` / `Statute Cited` (hero eyebrow) | Provenance + behaviour badges | Badge format gives claims certification-like weight while carrying no source. `Statute Cited` in particular reads as an assurance mark |
| 12 | about.html | `Years spent inside UK regulated industries, reading procurement rules and answering tenders.` (2021 to 2025) | Team credential claim | The only team-experience statement on the site's About page, and it names **no individual, no role, no employer, no dates beyond a four-year span**. Unverifiable by construction |
| 13 | about.html | `CrowMark in live production.` (May 2026) | Product status | Self-attested with no status page, changelog link or evidence |
| 14 | about.html | `Q4 2026 — Live UK public procurement regulatory change feed surfacing material updates straight into your dashboard.` | Dated forward commitment | A specific quarter attached to an unbuilt feature; becomes a visible broken promise if it slips |
| 15 | partners.html | `Revenue share, co-marketing and a priority support channel.` / `Revenue share on all client credits` | Commercial terms | Financial terms offered publicly with no rate, no tier, no linked partner agreement. Prospective partners may reasonably treat this as an offer |
| 16 | partners.html | `We reply within two business days.` and `Enquiry received. We'll be in touch within 2 business days.` | Response-time commitment | Stated twice, once as a post-submission promise. There is no evidence a two-day SLA is operationally met, and the form's own delivery path (item 20) is not disclosed |
| 17 | partners.html | `White-label PDF report generation` / `Branded PDF and DOCX exports carrying your own name` | Capability claims | Named deliverables for a paid programme with no evidence the export branding ships |
| 18 | partners.html | `one pool of AI credits allocated across every client you act for` / `Bulk credit allocation across your client portfolio` / `Bulk credits and evidence tracker for all clients.` | Capability claims | Three restatements of a multi-tenant credit-pooling feature, none evidenced |
| 19 | partners.html | `Dedicated account contact and a priority support channel for rapid technical and regulatory guidance.` | Service-level claim | "Dedicated" and "priority" and "rapid" with no SLA. Also implies **regulatory guidance** as a service, which edges toward advisory positioning the site has elsewhere worked to avoid |
| 20 | partners.html | *(not page copy — behaviour)* form POSTs to `https://formspree.io/f/xbdpkaol` | Undisclosed processor + unrecorded consent | Personal data (name, company, role, email, phone, free text) goes to a US third party that `privacy.html` **does not list** (zero matches for "Formspree"), while the consent line says processing is "in line with the Privacy Policy". The `gdpr_consent` checkbox is also never transmitted, so no consent record exists. UK GDPR transparency + record-keeping exposure |
| 21 | partners.html | `Put CrowMark in front of` / `to your clients.` (H1) | *(copy defect, not evidence)* | The site's primary H1 on a revenue-facing page is grammatically broken as shipped. Listed here so it is not carried into Astro unnoticed or silently rewritten without sign-off |
| 22 | integrations.html | `Microsoft Entra ID and Google Workspace single sign-on are available now.` + `Available now` chips ×2 | Shipped-capability claims | Lower risk (the source comment shows they were deliberately reconciled against pricing.html and roadmap.html) but the page carries no link to that evidence, so the reconciliation is invisible to a reader |
| 23 | integrations.html | `Alerts` (Slack, Teams), `Evidence export` (Google Drive), `Webhooks` (Zapier, Make) | Shipped-capability labels | Five status labels asserting live functionality with no evidence surface |
| 24 | integrations.html | `so the sender ID stays yours and the cost stays at your rate` | Commercial/technical guarantee | A promise about the behaviour and pricing of the customer's own third-party account |
| 25 | integrations.html | `No engineering ticket required.` | Capability claim | Asserts a no-code rules builder ships and is sufficient |

### Claims that are correctly evidenced or correctly hedged — do not "improve" these

| Page | Wording | Why it must survive migration |
|---|---|---|
| about.html | `Incorporated as CrowAgent Ltd in England and Wales (Company No. 17076461)` linked to `find-and-update.company-information.service.gov.uk` | The one properly sourced fact on the page. Keep the link and `rel="noopener"` |
| about.html / partners.html / integrations.html | `PPN 002`, `Procurement Act 2023`, `sections 52 and 71`, `PPN 017`, `Contracts Finder`, `Find a Tender` | Named, publicly checkable instruments — the site's evidential backbone |
| about.html | `CrowMark organises; your evaluation panel scores.` | Correctly refuses to claim the product scores bids, per Procurement Act 2023 equal treatment |
| partners.html | `joint write-ups of the work once there is work to write up` | Openly concedes there are no case studies yet. Rewriting this to sound more confident would create a false claim |
| partners.html | No partner is named anywhere; `Bid Agencies` / `Law Firms` / `NHS/Public Sector Advisor` are audience categories only | The page asserts **no** live commercial relationship. Adding logos would be a new, unevidenced claim |
| integrations.html | `Native SAML 2.0 and OIDC connectors for the providers below is on the roadmap, not shipped yet.` | This sentence *is* the remediation of a previous overclaim (all six providers were once badged "SAML 2.0") |
| integrations.html | `Via Entra ID federation` on Okta, OneLogin, Ping Identity, Self-hosted IdP | Deliberately downgraded from a native-integration claim |
| integrations.html | `Connect your own` on Twilio, Vonage, MessageBird | Makes the BYO-account model explicit; asserts no partnership |
| integrations.html | The 02/03 section gap and its explanatory comment, incl. *"Do not 'tidy' privacy.html to match this page."* | Deliberate forensic breadcrumb from TM-REMEDIATION-001. Keep the numbering gap and the comment |
| all three | No customer is named on any page; no logo wall of users | Correct posture for a pre-revenue product |
