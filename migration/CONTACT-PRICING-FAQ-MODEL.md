# Contact / Pricing / FAQ — Complete Content Model

Extraction date: 2026-08-02. Source of truth: the three static HTML files at repo root.
Everything below is **verbatim** from the source. Nothing is paraphrased, corrected or improved.
Where a claim carries no source on the page it is marked **UNCITED** (see the final table).

Files modelled:
- `C:\Users\bhave\Crowagent Repo\crowagent-website\contact.html` (576 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\pricing.html` (1019 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\faq.html` (508 lines)

Supporting JS that must survive the port:
- `C:\Users\bhave\Crowagent Repo\crowagent-website\scripts.js` (shipped as `scripts.min.js`)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\js\modules\pricing-billing-toggle.js`
- `C:\Users\bhave\Crowagent Repo\crowagent-website\js\modules\pricing-tabs-panel.js`
- `C:\Users\bhave\Crowagent Repo\crowagent-website\js\modules\faq-search.js`
- `C:\Users\bhave\Crowagent Repo\crowagent-website\js\nav-inject.js` (source of the `?enquiry=limited-access` links)

---

## Page — contact.html

### Head / SEO

| Tag | Value |
|---|---|
| `<title>` | `Contact \| CrowAgent` |
| `meta description` | `Book a 30-minute call, send an enquiry, or email us. UK team, replying within three to five business days.` |
| `link rel=canonical` | `https://crowagent.ai/contact` |
| `link rel=alternate hreflang=en-GB` | `https://crowagent.ai/contact` |
| `link rel=alternate hreflang=x-default` | `https://crowagent.ai/contact` |
| `meta theme-color` | `#0A1F3A` |
| `meta robots` | *(absent)* |
| `og:title` | `Contact \| CrowAgent` |
| `og:description` | `Book a 30-minute call, send an enquiry, or email us. UK team, replying within three to five business days.` |
| `og:type` | `website` |
| `og:url` | `https://crowagent.ai/contact` |
| `og:image` | `https://crowagent.ai/Assets/og/contact.png?v=20260730` |
| `og:image:alt` | `Contact` |
| `og:image:width` / `og:image:height` | `1200` / `630` |
| `og:site_name` | `CrowAgent` |
| `og:locale` | `en_GB` |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CrowAgentLtd` |
| `twitter:title` | `Contact \| CrowAgent` |
| `twitter:description` | `Book a 30-minute call, send an enquiry, or email us. UK team, replying within three to five business days.` |
| `twitter:image` | `https://crowagent.ai/Assets/og/contact.png?v=20260730` |

`<html lang="en-GB" data-theme="dark">`, `<body class="f8-page bg-ca-bg-deep">`.

#### JSON-LD (one block, contact.html:104-106)

`@type`: **BreadcrumbList** — full field set:

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"Contact","item":"https://crowagent.ai/contact"}]}
```

There is **no** `ContactPage`, `Organization` or `LocalBusiness` block on this page.

### Breadcrumb (visible)

| Text | href |
|---|---|
| Home | `/` |
| Contact | *(no link, current page)* |

### Hero (section 01, `id="hero"`)

Eyebrow (`.ca-hero-eyebrow`, preceded by a teal dot span):

```
Contact · London based · UK team
```

H1 (`.ca-hero-title`, two spans, second is `.text-ca-teal .ca-liquid-text`):

```
Talk to CrowAgent.
```

Standfirst (`.ca-hero-desc`):

```
Book a slot, send an enquiry, or email us directly. We reply within three to five business days, and the person who replies is on the team that built it.
```

Hero CTAs:

| Text | href | Attributes |
|---|---|---|
| Book a 30-minute call | `https://calendly.com/crowagent-platform/30min` | `data-magnetic target="_blank" rel="noopener noreferrer"` |
| Email us | `mailto:hello@crowagent.ai` | — |

### Section 02 — Reach panels (white band, two cards)

| # | H2 | Body | Link text | href |
|---|---|---|---|---|
| 1 | Book a 30-minute call | `Speak directly with the founders. Walk through your procurement challenge live.` | `Choose a time →` | `https://calendly.com/crowagent-platform/30min` (`target="_blank" rel="noopener noreferrer"`) |
| 2 | Send us an email | `hello@crowagent.ai · We respond within 3 to 5 business days.` | `hello@crowagent.ai →` | `mailto:hello@crowagent.ai` |

Both cards carry an inline decorative SVG (`aria-hidden="true" focusable="false"`, 24×24): a calendar icon and an envelope icon respectively.

Strip beneath (clock SVG 14×14 + text):

```
Response within 3 to 5 business days · Founded in the UK · No outsourced support
```

### Section 03 — Product screenshot (`aria-labelledby="contact-shots-title"`)

Eyebrow: `The product`
H2 (`id="contact-shots-title"`): `What you will see on the call`
Lead: `Screens from the live product, shown with a sample account rather than a customer's data.`

Overlay chip inside the frame: `<span class="samp nsp-chip"><i aria-hidden="true"></i>Sample data</span>`

| Element | Value |
|---|---|
| `<picture>` sources | `/Assets/shots/dark/mark-analytics.avif?v=20260731e` (image/avif), `/Assets/shots/dark/mark-analytics.webp?v=20260731e` (image/webp) |
| `<img src>` | `/Assets/shots/dark/mark-analytics.png?v=20260731e` |
| `width` × `height` | `3200` × `2000` |
| `loading` / `decoding` | `lazy` / `async` |
| `alt` | `The CrowMark analytics screen, shown with a sample account: headline tiles for total contracts, social value delivered across won bids, and evidence completion against committed measures; bar charts of contracts by status and bids by sector; and an average social value score trend. Each chart has a CSV export button.` |

`<figcaption>`: `CrowMark Analytics, social value bid performance`

### Section 04 — Contact cards (dark, three)

| Eyebrow | H3 | Body | CTA text | CTA href |
|---|---|---|---|---|
| Demo | Book a 30-min demo | `See the product live. No sales pitch. For bid and procurement teams.` | `Book demo →` | `https://calendly.com/crowagent-platform/30min` (`target="_blank" rel="noopener noreferrer"`, `data-magnetic`) |
| Enterprise | Portfolio plan and volume licensing | `Microsoft Entra ID single sign-on, branded exports, invoice or purchase order billing, and pricing scoped to a high-volume bidding team.` | `Email sales →` | `mailto:sales@crowagent.ai?subject=Enterprise%20Enquiry` |
| General | Support and partnerships | `hello@crowagent.ai · Typically within three to five business days. UK-based team.` | `Get in touch →` | `mailto:hello@crowagent.ai` |

### Section 05 — Directory and company info

Left card eyebrow: `How to reach us by email`

| Label | Address (link text = href target) | href |
|---|---|---|
| General and partnerships | hello@crowagent.ai | `mailto:hello@crowagent.ai` |
| Support and data requests (GDPR) | support@crowagent.ai | `mailto:support@crowagent.ai` |
| Enterprise sales | sales@crowagent.ai | `mailto:sales@crowagent.ai` |
| Security disclosures | security@crowagent.ai | `mailto:security@crowagent.ai` |

Right column, card 1 — eyebrow `Office and contact information`:

| Label | Value |
|---|---|
| UK Business Hours | `Mon-Fri · 09:00-17:30 BST` |
| Response Time | `Typically three to five business days` |

Right column, card 2 — eyebrow `Company details`, name `CrowAgent Ltd`, `<dl class="cdet">`:

| `<dt>` | `<dd>` |
|---|---|
| Registration | `Registered in England and Wales` |
| Companies House number | `17076461` (`.cdet-mono`) |
| Data protection | `ICO registered data controller` |
| Data residency | `UK and EU` |
| Registered office | `Details available in our [Privacy Policy](/privacy)` |

### Section 06 — Contact form (`id="contact-form"`) — PRIMARY CONVERSION PATH

Left column:

Eyebrow: `Send a message`
H2 (`.ca-section-title`): `Tell us what you're <br/> working on.`
Body:

```
Bidding for public sector contracts, or working out whether CrowAgent fits your organisation: tell us the situation and we will answer properly.
```

Image beside the form:

| Element | Value |
|---|---|
| sources | `/Assets/photos/contact-desk.avif?v=20260612c`, `/Assets/photos/contact-desk.webp?v=20260612c` |
| `<img src>` | `/Assets/photos/contact-desk.jpg?v=20260612c` |
| `width` × `height` | `1200` × `800` |
| `loading` / `decoding` | `lazy` / `async` |
| `alt` | `A laptop and notebook on a clean desk, ready for the next message` |

#### Form element

```html
<form id="contactPageForm" class="space-y-8" method="POST"
      action="https://app.crowagent.ai/api/contact/submit" novalidate>
```

- `id` = `contactPageForm`
- `method` = `POST`
- `action` = `https://app.crowagent.ai/api/contact/submit`
- `novalidate` — **load-bearing**. Added 2026-08-01. Without it native constraint validation blocks
  submission, the `submit` event never fires, and the designed inline error spans
  (`#cp-name-err`, `#cp-email-err`) stay `display:none` forever. Fields keep `required` so AT still
  announces them. **The Astro port must keep `novalidate` or the inline errors die again.**
- No `<input type="hidden">` fields other than the honeypot (below). No CSRF token.

#### Every field

| Order | `name` | `id` | type | required | autocomplete | `<label>` text | placeholder | Inline help / error | Other attrs |
|---|---|---|---|---|---|---|---|---|---|
| 0 | `website` | `cp-website` | text | no | `off` | `Website` | — | — | **Honeypot.** Wrapper `aria-hidden="true" class="hidden"`, `tabindex="-1"` |
| 1 | `name` | `cp-name` | text | **yes** | `name` | `Full Name *` | `Your name` | `<span id="cp-name-err">` (empty in HTML; JS writes `Please enter your name.`) | — |
| 2 | `email` | `cp-email` | email | **yes** | `email` | `Work Email *` | `you@company.com` | `<span id="cp-email-err">` (JS writes `Please enter a valid email address.`) | `pattern="[^\s@]+@[^\s@]+\.[^\s@]+"`, `title="Please enter a valid email address (e.g. you@company.com)"` |
| 3 | `organisation` | `cp-org` | text | no | `organization` | `Organisation` | `Company name` | — | — |
| 4 | `enquiry_type` | `cp-type` | `<select>` | no | **none** | `What are you working on? (Subject)` | — | — | 6 options, see below |
| 5 | `message` | `cp-msg` | `<textarea rows="4">` | **yes** | **none** | `Message *` | `Tell us more about your requirements...` | Static help: `Min. 20 characters` | `minlength="20"` |
| 6 | — | — | Turnstile widget | — | — | *(no label)* | — | JS error: `Please complete the security check.` | `<div class="cf-turnstile" data-sitekey="0x4AAAAAADML7D0t7OQT4B4R" data-localhost-sitekey="1x00000000000000000000AA">` |
| 7 | `gdpr_consent` | `cp-consent` | checkbox | **yes** | none | wrapping `<label>`, text below | — | — | Wrapped label, no `for=` (implicit association) |

Field 7 label text, verbatim:

```
I agree that CrowAgent Ltd may process my data to respond to this enquiry, in line with the Privacy Policy.
```

(`Privacy Policy` links to `/privacy`.)

Submit button: `<button type="submit" id="cpSubmitBtn" ... data-magnetic>Send message</button>`

#### `enquiry_type` options (values are WIRE VALUES — never rename)

| `value` | Visible label |
|---|---|
| `""` | `Select an option` |
| `limited-access` | `Request access` |
| `ppn002-bid` | `CrowMark for Suppliers` |
| `buyer-side` | `CrowMark for Buyers` |
| `enterprise` | `Portfolio / volume pricing` |
| `general` | `General question` |

#### Success and error states

Both blocks exist in the DOM with class `hidden` and are revealed by setting `style.display='block'`.

| Element | Text shown |
|---|---|
| `#cpFormSuccess` | `Message received. We'll be in touch within three to five business days.` |
| `#cpFormError` | `Something went wrong. Please email hello@crowagent.ai directly.` |
| `#cpFormError` (Turnstile path) | `Please complete the security check.` (JS overwrites `textContent`) |

On success the handler also calls `form.reset()` and sets the button text to `Message sent`.
On failure it re-enables the button and restores the text `Send message`.
While in flight the button text is `Sending...`.

`<noscript>` fallback beneath the form:

```
If this form requires JavaScript to submit, please email us directly at hello@crowagent.ai
```

#### Which JS handles submission and validation

**`scripts.js` lines 1107-1164** (shipped minified as `/scripts.min.js?v=20260731c`; parity with
`limited-access`, the seeded message body and `buyer-side` confirmed present in the minified file).

The handler:
1. `e.preventDefault()`.
2. Honeypot: if `[name="website"]` has any value, **return silently** (no error, no request).
3. Reads `#cp-name` (trimmed) and `#cp-email` (trimmed, `\r\n` stripped — header-injection guard).
4. Clears `#cp-name-err` / `#cp-email-err`, then validates:
   - empty name → `Please enter your name.`
   - email fails `/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/` → `Please enter a valid email address.`
5. If a Turnstile input exists but has no token → shows `Please complete the security check.` and returns.
6. Disables the button, sets text `Sending...`, hides both status blocks.
7. `fetch('https://app.crowagent.ai/api/contact/submit', {method:'POST', body: JSON.stringify(payload), headers:{'Content-Type':'application/json','Accept':'application/json'}, signal: AbortSignal.timeout(10000)})`.
   Payload keys: `name`, `email`, `organisation`, `enquiry_type`, `message`, `turnstile_token`.
   **Note:** the payload does **not** include `gdpr_consent`, even though the checkbox is `required`.
8. `r.ok` → reset form, show success. Anything else / network error → show `#cpFormError`.

**`scripts.js` lines 1435-1462** adds blur validation: every `.form-input[required]` gets
`data-touched`, and on blur shows/hides its `#<id>-err` span. Note this uses a *weaker* email test
(`includes('@') && includes('.')`) than the submit-time regex.

**`scripts.js` lines 1748-1795** is a capture-phase double-submit guard covering `#contactPageForm`
and `.notify-form`: disables the submit button, sets `data-loading`, releases after 15s or on `reset`.

**Inline script, contact.html:501-547** is a second double-submit guard: locks the button on submit,
and uses a `MutationObserver` on `#cpFormSuccess` / `#cpFormError` (watching `style` and `class`)
to unlock on error and clear the busy attributes on success.

**Inline script, contact.html:44-84** lazy-loads Cloudflare Turnstile only on first `focusin` of the
form or when it comes within `300px` of the viewport, and swaps `data-sitekey` for
`data-localhost-sitekey` on `localhost` / `127.0.0.1` / `0.0.0.0`.

#### How `?enquiry=` is consumed (must survive the port)

Two independent readers exist. **Both** run on this page.

1. **`scripts.js` lines 1171-1240** (the one that matters — it is in the shipped `scripts.min.js`):
   - Bails if `#cp-type` is absent, or if none of `product`, `tier`, `enquiry` are present.
   - `rawEnquiry = params.get('enquiry').toLowerCase()`.
   - If an `<option>` with exactly that value exists → sets `typeEl.value = rawEnquiry`.
   - **If the value is `limited-access`**, and `#cp-msg` is empty, it seeds the textarea with:

     ```
     I would like to request access to CrowAgent.

     Organisation:
     What we need CrowAgent for:
     ```

     then `return`s (product/tier seeding does not apply).
   - Otherwise falls through to `?product=` / `?tier=` mapping:
     `PRODUCT_TO_ENQUIRY = { mark|crowmark|public|public-sector → ppn002-bid, buyer|buyers → buyer-side, enterprise → enterprise }`;
     unknown product with `tier=portfolio|enterprise` → `enterprise`.
     `PRODUCT_LABELS` then seeds `#cp-msg` with
     `I would like to talk to sales about <label> (<tier> tier).` + `\n\n`.
     Legacy slugs `cyber` / `cash` / `esg` / `csrd` are deliberately **unmapped**.

2. **Inline script, contact.html:548-573**: independently reads `?enquiry`, matches it against the
   real `<option>` list, sets `sel.value`, and dispatches a bubbling `change` event so assistive tech
   is told the field changed without user action. It does **not** seed the message body.

Sitewide links that produce this parameter (`js/nav-inject.js:371` desktop CTA, `:426` mobile CTA):
`/contact?enquiry=limited-access#contact-form`, label `Request access`.
Same href is used on `pricing.html` (Starter and Pro cards) and `faq.html` ("How do I sign up?").

#### Anti-spam measures present

| Measure | Detail |
|---|---|
| Honeypot | `input[name="website"]` inside `div[aria-hidden="true"].hidden`, `tabindex="-1"`, `autocomplete="off"`. Filled → submission silently dropped client-side. |
| Cloudflare Turnstile | `data-sitekey="0x4AAAAAADML7D0t7OQT4B4R"`, lazy-loaded; token posted as `turnstile_token`. Localhost swaps in the always-pass key `1x00000000000000000000AA`. |
| Header-injection guard | `\r\n` stripped from the email value before send. |
| Double-submit guard | Two layers (inline + `scripts.js`) disabling `#cpSubmitBtn`. |
| Timing check | **None.** |
| CSRF token | **None.** |

### Section 07 — Newsletter

H2: `Prefer regulatory updates?`
Body: `Get our monthly procurement digest covering PPN 002 social value and CrowMark product news.`

| `name` | `id` | type | required | autocomplete | label | placeholder | notes |
|---|---|---|---|---|---|---|---|
| `email` | `contact-nl-email` | email | yes | `email` | `Email address` (`class="sr-only"`) | `you@company.com` | `pattern="[^\s@]+@[^\s@]+\.[^\s@]+"`, `title="Please enter a valid email address (e.g. you@company.com)"` |
| `website` | `contact-nl-website` | text | no | `off` | `Website` | — | honeypot, wrapper `aria-hidden="true" class="hidden"`, `tabindex="-1"` |

Form: `action="https://app.crowagent.ai/api/notify"` `method="post"` `class="... notify-form"`.
Submit label: `Subscribe`.
Footnote: `By subscribing you agree to the Privacy Policy.` (`/privacy`).

### All links on contact.html

| Visible text | href |
|---|---|
| Home | `/` |
| Book a 30-minute call (hero) | `https://calendly.com/crowagent-platform/30min` |
| Email us (hero) | `mailto:hello@crowagent.ai` |
| Book a 30-minute call (card) → `Choose a time →` | `https://calendly.com/crowagent-platform/30min` |
| Send us an email (card) → `hello@crowagent.ai →` | `mailto:hello@crowagent.ai` |
| Book demo → | `https://calendly.com/crowagent-platform/30min` |
| Email sales → | `mailto:sales@crowagent.ai?subject=Enterprise%20Enquiry` |
| Get in touch → | `mailto:hello@crowagent.ai` |
| hello@crowagent.ai | `mailto:hello@crowagent.ai` |
| support@crowagent.ai | `mailto:support@crowagent.ai` |
| sales@crowagent.ai | `mailto:sales@crowagent.ai` |
| security@crowagent.ai | `mailto:security@crowagent.ai` |
| Privacy Policy (company details) | `/privacy` |
| Privacy Policy (GDPR consent) | `/privacy` |
| hello@crowagent.ai (noscript) | `mailto:hello@crowagent.ai` |
| Privacy Policy (newsletter footnote) | `/privacy` |

### Defects found — contact.html

1. **`#cp-type` and `#cp-msg` have no `autocomplete`.** Not fatal (neither maps cleanly to an
   autofill token) but the two most-filled free-text fields differ in treatment from the rest.
   `#cp-consent` also has none, which is correct.
2. **The Turnstile widget has no visible label and no `aria-describedby`.** Its failure message is
   rendered into `#cpFormError`, a container the user has no programmatic link to from the widget.
3. **`gdpr_consent` is `required` in the DOM but never sent in the POST payload** and is never
   validated by the JS handler. With `novalidate` set, the browser no longer enforces it either, so
   **the consent checkbox is currently unenforced end to end.** This is the sharpest finding on the
   page: a GDPR consent control that can be bypassed by submitting without ticking it.
4. **Two independent `?enquiry=` readers** (inline script + `scripts.js`) both set `#cp-type`. Benign
   today because they agree, but the port should collapse them to one — the `scripts.js` one, since
   it also seeds the message body and dispatches nothing, plus the inline one that dispatches
   `change`. Keep the union of behaviours: set value, dispatch `change`, seed `#cp-msg`.
5. **Blur validation and submit validation disagree on what a valid email is** (`includes('@')` vs
   the RFC-5322-lite regex). A user can clear the blur error and still fail at submit.
6. No `meta robots` tag (other pages set one). Fine by default, flagged for parity only.

---

## Page — pricing.html

### Head / SEO

| Tag | Value |
|---|---|
| `<title>` | `Pricing \| CrowAgent` |
| `meta description` | `CrowMark pricing for UK suppliers: Starter £49 a month, Pro £149, Portfolio quoted. Annual billing saves 10%, and every plan has a 14-day trial.` |
| `link rel=canonical` | `https://crowagent.ai/pricing` |
| hreflang alternates | **absent** (contact.html and faq.html both have them) |
| `meta theme-color` | `#0A1F3A` |
| `og:title` | `Pricing \| CrowAgent` |
| `og:description` | *(identical to meta description)* |
| `og:type` | `website` |
| `og:url` | `https://crowagent.ai/pricing` |
| `og:image` | `https://crowagent.ai/Assets/og/pricing.png?v=20260730` |
| `og:image:alt` | `Pricing` |
| `og:image:width` / `og:image:height` | `1200` / `630` |
| `og:site_name` | `CrowAgent` |
| `og:locale` | `en_GB` |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CrowAgentLtd` |
| `twitter:title` | `Pricing \| CrowAgent` |
| `twitter:description` | *(identical to meta description)* |
| `twitter:image` | `https://crowagent.ai/Assets/og/pricing.png?v=20260730` |

#### JSON-LD (one block, `@graph` with two members, pricing.html:382-389)

`@type` 1: **BreadcrumbList** — Home → Pricing.
`@type` 2: **ItemList** → position 1 → **SoftwareApplication**:

| Field | Value |
|---|---|
| `name` | `CrowMark` |
| `applicationCategory` | `BusinessApplication` |
| `operatingSystem` | `Web` |
| `url` | `https://crowagent.ai/crowmark` |
| `publisher` | `{"@id":"https://crowagent.ai/#organization"}` |
| `offers[0]` | `{"@type":"Offer","name":"Starter","price":"49","priceCurrency":"GBP","url":"https://crowagent.ai/pricing"}` |
| `offers[1]` | `{"@type":"Offer","name":"Pro","price":"149","priceCurrency":"GBP","url":"https://crowagent.ai/pricing"}` |

```json
{"@context":"https://schema.org","@graph":[
{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"Pricing","item":"https://crowagent.ai/pricing"}]},
{"@type":"ItemList","itemListElement":[
{"@type":"ListItem","position":1,"item":{"@type":"SoftwareApplication","name":"CrowMark","applicationCategory":"BusinessApplication","operatingSystem":"Web","url":"https://crowagent.ai/crowmark","publisher":{"@id":"https://crowagent.ai/#organization"},"offers":[{"@type":"Offer","name":"Starter","price":"49","priceCurrency":"GBP","url":"https://crowagent.ai/pricing"},{"@type":"Offer","name":"Pro","price":"149","priceCurrency":"GBP","url":"https://crowagent.ai/pricing"}]}}
]}
]}
```

**Note:** the page renders 9 visible Q&A pairs in its `#faq` section and there is **no FAQPage
JSON-LD on pricing.html** at all. Only `faq.html` carries FAQPage markup.

### Hero

Eyebrow (`.ca-eyebrow.ca-hero-badge`):

```
Published pricing · No quote required
```

H1:

```
See the price first. Sized for SMEs.
```

Standfirst:

```
Published pricing for UK suppliers bidding public and private sector work, from £49/mo.
```

There is no breadcrumb `<nav>` rendered on pricing.html (breadcrumbs exist only in JSON-LD).

### Product switcher + billing toggle (sticky nav, `aria-label="Pricing audience"`)

Tablist `role="tablist" aria-label="Choose your side of the procurement"`:

| Tab id | `data-ptab` | Label | href | initial state |
|---|---|---|---|---|
| `ptab-suppliers` | `suppliers` | `For suppliers` | `#suppliers` | `class="ptab on"`, `aria-selected="true"`, `tabindex="0"` |
| `ptab-buyers` | `buyers` | `For buyers` | `#buyers` | `aria-selected="false"`, `tabindex="-1"` |

Contract: `.ptab[data-ptab="X"]` shows `#X-p`. `#buyers-p` ships `style="display:none" hidden` and
carries `data-no-billing-toggle`.

Billing toggle:

| Element | Value |
|---|---|
| `#label-monthly` | `Monthly` (class `active` on load) |
| `#billing-toggle` | `<input type="checkbox">`, `aria-label="Toggle between monthly and annual billing"` |
| `#label-annual` | `Annual · Save 10%` |

### Panel A — CrowMark for Suppliers (`#suppliers`)

Eyebrow: `Bid and tender software`
H2: `CrowMark for Suppliers`
Lead: `Respond to tenders, RFPs, RFIs, PQQs and SQs, in the public and private sector.`

Capsules: `Contracts Finder + Find a Tender` · `PPN 002 · 10% minimum` · `PPN 017 disclosure` · `Procurement Act s.52`
Link below capsules: `View product →` → `/crowmark`

Caveat paragraph:

```
Every plan below covers public and private sector bidding. Tender discovery, PPN 002 scoring, PPN 017 disclosure and Procurement Act evidencing exist only in public procurement, so they apply to public sector work.
```

Eyebrow above the cards: `Same plans, either sector`

#### Tiers

| Tier | Audience line | Monthly price | `data-monthly` | `data-annual` | Annual headline (computed) | "Most popular" | Feature copy (verbatim) | CTA text | CTA href |
|---|---|---|---|---|---|---|---|---|---|
| **Starter** | `Small suppliers & solo consultants` | `£49/mo` | `49` | `529` | `£44/mo — £529/yr billed annually` | no | `3 users. Tender feed, document ingestion, grounded answer drafting, deterministic PPN 002 calculation, and branded PDF or DOCX export.` | `Request access` | `/contact?enquiry=limited-access#contact-form` |
| **Pro** | `Public-sector contractors & bidding teams` | `£149/mo` | `149` | `1609` | `£134/mo — £1,609/yr billed annually` | **yes** — ribbon `Most Popular`, card class `ca-card-premium`, `data-premium-stroke` | `10 users, plus post-award delivery tracking, monthly social-value reports, and Procurement Act 2023 s.52 and s.71 KPI checks.` | `Request access` | `/contact?enquiry=limited-access#contact-form` |
| **Portfolio** | `Enterprise groups & Tier-1 suppliers` | `Contact sales` (no numeric price by owner decision R241-PRICING-STRATEGY) | — | — | — | no | `Bid volume effectively unlimited, branded exports, and a named account contact for high-volume public-sector bidding teams.` | `Contact sales` | `/contact?product=crowmark&tier=portfolio` |

Monthly-state note text (rendered by JS into `.bill-note`): ` billed monthly`.
Annual-state note text: ` — £<total>/yr billed annually`.

Billing-toggle maths (`js/modules/pricing-billing-toggle.js`):
`annualPerMonth = Math.round(annualTotal / 12)`; `savePerYear = (monthly * 12) - annualTotal`
(Starter 588 − 529 = 59; Pro 1788 − 1609 = 179 — i.e. exactly the advertised 10%).
GSAP counter tween 0.4s `power2.out`, rAF fallback 400ms, instant swap under
`prefers-reduced-motion: reduce`. Tween state is kept on `display._priceVal` / `display._priceObj`
so rapid toggling cannot make the price bounce.

### Panel B — CrowMark for Buyers (`#buyers`, hidden until tab selected)

Eyebrow: `Bid and tender software`
H2: `CrowMark for Buyers`
Lead: `Publish requirements, then locate the evidence for each one across every response you receive.`
Capsules: `Requirement builder` · `Verbatim evidence locator` · `Advisory only, never scores` · `Delivery monitoring`
Link: `View product →` → `/crowmark-buyers`

Caveat:

```
Buyer engagements are scoped to the organisation rather than sold by seat, so there is no self-serve price. Everything else on this page, including the AI credit model, works the same way.
```

Eyebrow: `Buyer pricing`

| Tier | Audience line | Price | Sub-price | Body | Feature list | CTAs |
|---|---|---|---|---|---|---|
| **Buyer side** | `Contracting authorities and private sector procurement teams` | `Contact sales` | `Scoped to your organisation` | `Billed by invoice or purchase order on annual terms. Tiers scale with organisation size. If you need to buy through a framework, tell us which one and we will confirm what is possible.` | see below | `Book a demo` → `/contact?product=buyer-side#contact-form`; `Read the FAQ` → `#faq` |

"What it covers" list, verbatim:

```
Requirement builder with a deterministic social value rubric
Evidence located per published requirement, quoted verbatim
Evaluation workspace across directorates
Delivery monitoring against what was promised
Invoice or PO billing, SSO/SAML, DPA and security review
```

Side card H3: `Why no published price?`

```
A buyer engagement is not a seat count. It is scoped to the organisation, procured under your own rules and billed the way your finance team can actually pay, so a single self-serve number would be misleading rather than transparent.
```

```
We publish supplier pricing precisely because that side can be published honestly. Where it cannot, we say so instead of guessing.
```

`Talk to us if` list:

```
You run competitions and evaluate responses
You need multi-entity or group consolidation
You need invoice or PO billing, SSO/SAML or a DPA
```

CTA: `Contact sales` → `/contact?product=buyer-side#contact-form`

### Comparison table section

Eyebrow: `Feature Depth`
H2: `Compare the details.`
Lead:

```
Every plan runs the same statutory checks. What changes between them is seats and post-award tracking, so compare the rows that matter to you.
```

H3: `CrowMark` (with a `.bg-ca-mark` dot)

Visible table (top 5 rows):

| Feature | Starter | Pro | Portfolio |
|---|---|---|---|
| Active bids | Unlimited | Unlimited | Unlimited |
| Seats (licensing) | 3 users | 10 users | Unlimited |
| Tender feed: Contracts Finder + Find a Tender | ✓ | ✓ | ✓ |
| Grounded AI drafting with PPN 017 disclosure | ✓ | ✓ | ✓ |
| Deterministic PPN 002 calculation | ✓ | ✓ | ✓ |

`<details>` disclosure — summary toggles between `Show 2 more features` and `Show fewer features`;
inner table has `<caption class="sr-only">Additional CrowMark features by plan</caption>` and an
`sr-only` `<thead>`:

| Feature | Starter | Pro | Portfolio |
|---|---|---|---|
| Post-award delivery tracking and monthly reports | - | ✓ | ✓ |
| Procurement Act 2023 s.52 / s.71 KPI check | - | ✓ | ✓ |

Footer link: `See all pricing FAQs →` → `#faq`

**Conflict worth carrying forward:** the table says Starter/Pro/Portfolio all have `Unlimited` active
bids, while an HTML comment at pricing.html:524 records the enforced platform caps as
`Starter 5/mo, Pro 25/mo, Portfolio unlimited`
(`crowagent-platform/web/lib/stripe/tier-limits.ts:21-26 CROWMARK_TIER_EVAL_LIMITS`). The visible
copy and the enforced product limits do not agree.

### AI credits section (`#ai-credits`)

Eyebrow: `AI Credits`
H2: `How AI usage is counted.`
Lead:

```
Your plan includes a monthly allowance of AI credits. One credit is one AI generation, such as a drafted tender answer or a delivery-evidence summary. Everything we calculate rather than generate, including PPN 002 social value arithmetic, scoring and exports, is never charged and never capped.
```

Card 1 H3: `Reading a tender document is charged by page`

```
Uploading a tender document and extracting its requirements costs 3 credits per 10 pages, rounded up. A 10-page invitation to tender costs 3 credits. Here is what counts as a page:
```

Table (`<caption class="sr-only">What counts as one page for tender document ingestion</caption>`):

| Document | One page is | Example |
|---|---|---|
| PDF | One page | 10-page ITT = 3 credits |
| PowerPoint | One slide | 12-slide briefing = 6 credits |
| Word or plain text | The whole document | Response template = 3 credits |
| Spreadsheet (Excel or CSV) | **50 rows of a sheet**, rounded up and added across sheets | 5,000-row pricing schedule = 100 pages = 30 credits |

Card 2 H3: `Why spreadsheets are counted by rows, not by sheets`

```
A sheet is not a page. A 5,000-row pricing schedule sitting on a single Excel sheet holds roughly 17 times the text of a 10-page PDF, and the AI work scales with how much text there is to read. Counting that as one page would charge the same for 17 times the work, so we count 50 rows as one page instead. CSV files are counted exactly like Excel files. We only count the rows we actually read, a sheet we read is never counted as nothing, and a generation that fails is not charged at all.
```

### Annual savings section

H2: `ANNUAL SAVINGS.`
Lead: `Pay yearly and save.` / `Annual billing: 10% off.`
Card: `-10%`, H3 `Annual Billing`

```
Pay upfront for the year and lock in a 10% discount on any plan. You can switch from monthly to annual billing at any time from your account settings.
```

### Pricing FAQ (`#faq`) — 8 pairs

Eyebrow: `Common Questions` · H2: `Everything you need to know.`
Lead: `Answers to common billing and product questions for UK public sector suppliers and bid teams.`

| # | H3 (question) | Answer (verbatim) | anchor id |
|---|---|---|---|
| 1 | Is there a free plan? | `CrowMark is a paid product with a 14-day free trial. No card is required to start. You can also run the free PPN 002 Calculator any time, with no account needed.` | — |
| 2 | How does the 14-day trial work? | `You get full access to the Pro tier of your chosen product for 14 days. No credit card is required to start. At the end of the trial, you can choose to subscribe to any plan (Starter, Pro, or Portfolio) or your account will revert to a read-only state until a subscription is active.` | — |
| 3 | Are there any hidden setup fees? | `No. There are no setup fees, implementation charges or training costs on Starter or Pro. A scoped Portfolio rollout may carry a one-off integration fee, and we tell you the figure before you sign.` | — |
| 4 | Can I switch plans mid-cycle? | `Yes. You can upgrade, downgrade, or cancel your subscription at any time from the billing dashboard. Plan changes are pro-rated and applied immediately to your account access. If you upgrade, the new features are available instantly.` | — |
| 5 | Do you price for large organisations? | `Yes. Portfolio is scoped to your organisation and quoted rather than listed, built around the seats and volume you need. Contact sales for licensing across large supplier networks or multi-entity corporate groups. Microsoft Entra ID single sign-on is available now on Portfolio; broader SSO across additional identity providers (SAML 2.0 and OIDC) is on our roadmap.` | — |
| 6 | Why is there no price for the buyer side? | `A buyer engagement is scoped to the organisation rather than sold by seat, so a single self-serve number would be misleading. It is billed by invoice or purchase order on annual terms. Supplier pricing is published because that side can be published honestly; where it cannot, we say so rather than guess.` | `faq-public-sector` |
| 7 | How are AI credits counted? | `One credit is one AI generation. Reading a tender document and extracting its requirements costs 3 credits per 10 pages, rounded up, so a 10-page ITT costs 3 credits. A page is one PDF page, one PowerPoint slide, or a whole Word or text document. A spreadsheet is counted by rows rather than by sheets: 50 rows count as one page, so a 5,000-row pricing schedule on a single sheet counts as 100 pages, or 30 credits. Everything we calculate rather than generate is free and unlimited. See the full breakdown.` (`See the full breakdown` → `#ai-credits`) | `faq-ai-credits` |
| 8 | What payment methods do you accept? | `We accept all major credit and debit cards via Stripe. On annual Portfolio plans we can also take payment by invoice and BACS transfer, on request to our finance team.` | — |

**Contradiction:** FAQ 1 and the "SSO on roadmap" trust pill vs FAQ 5. FAQ 5 says Entra ID SSO is
*available now on Portfolio*; the trust list further down marks `SSO via SAML 2.0 / OIDC (on the roadmap)`.
These are reconcilable (Entra now, broader SSO later) but the port should keep the wording exact.

### Public sector purchasing section

Eyebrow: `Public sector purchasing` · H2: `Buying on a purchase order.`

```
Public sector organisations rarely buy software on a card. CrowMark for Suppliers can be scoped and billed by invoice or purchase order on annual terms. Tiers scale with organisation size, so we scope rather than list a single number. If you need to buy through a framework, tell us which one and we will confirm what is possible.
```

```
Contact sales if any of these apply: you are a public sector contracting authority; you are beyond the top self-serve tier's cap; you need multi-entity or group consolidation; or you need SSO/SAML, a security review or DPA, SOC 2 evidence, or invoice / BACS billing.
```

CTAs: `Talk to sales` → `/contact` (`data-magnetic`); `See CrowMark plans` → `#suppliers`
Footnote: `CrowAgent Ltd, Companies House 17076461`

Trust rows (right column):

| Marker | Text |
|---|---|
| ✓ | `UK-hosted data on Supabase & Vercel` |
| ✓ | `Volume licensing & invoice billing` |
| ◔ | `SSO via SAML 2.0 / OIDC (on the roadmap)` |
| ◔ | `SOC 2 evidence pack (on the roadmap)` |

### Regulatory sources footnote (`aria-label="Regulatory Sources"`)

```
Mark: PPN 002 (Feb 2025), PPN 017, Procurement Act 2023 s.52 & s.71
```

This is the **only** citation block on the page. It names the instruments but not a URL.

### Images / video on pricing.html

**None.** Zero `<img>`, zero `<video>`, zero `<picture>`. All iconography is inline SVG or a text glyph
(`✓`, `◔`, `◘`, `•`).

### All links on pricing.html

| Visible text | href |
|---|---|
| For suppliers | `#suppliers` |
| For buyers | `#buyers` |
| View product → (suppliers) | `/crowmark` |
| Request access (Starter) | `/contact?enquiry=limited-access#contact-form` |
| Request access (Pro) | `/contact?enquiry=limited-access#contact-form` |
| Contact sales (Portfolio) | `/contact?product=crowmark&tier=portfolio` |
| View product → (buyers) | `/crowmark-buyers` |
| Book a demo | `/contact?product=buyer-side#contact-form` |
| Read the FAQ | `#faq` |
| Contact sales (Why no published price) | `/contact?product=buyer-side#contact-form` |
| See all pricing FAQs → | `#faq` |
| See the full breakdown | `#ai-credits` |
| Talk to sales | `/contact` |
| See CrowMark plans | `#suppliers` |

### Defects found — pricing.html

1. **No hreflang alternates** while contact.html and faq.html both have `en-GB` + `x-default`.
2. **8 visible FAQ pairs with no FAQPage JSON-LD.** The page's structured data covers only offers and
   breadcrumbs, so none of the pricing Q&A is eligible for rich results.
3. **Offer schema is incomplete:** `price`/`priceCurrency` present but no `priceValidUntil`,
   `availability`, `billingDuration` or `UnitPriceSpecification`, and the Portfolio tier is absent
   entirely. Annual prices (£529 / £1,609) appear only in JS-computed DOM, never in schema.
4. **"Unlimited" active bids on all three tiers contradicts the enforced caps** recorded in the
   page's own comment (Starter 5/mo, Pro 25/mo).
5. The annual per-month headline (`£44`, `£134`) is a rounded derivation rendered only by JS. With JS
   off the page shows monthly prices with an **empty** `.bill-note` (no "billed monthly" text), since
   that string is written by `updatePrices()` on init.

---

## Page — faq.html

### Head / SEO

| Tag | Value |
|---|---|
| `<title>` | `CrowAgent FAQ: PPN 002, bidding and pricing` |
| `meta description` | `Frequently asked questions about CrowAgent: PPN 002 social value, tender discovery, grounded answer drafting, AI credits, billing, MFA and data security.` |
| `meta robots` | `index,follow` |
| `link rel=canonical` | `https://crowagent.ai/faq` |
| `link rel=alternate hreflang=en-GB` | `https://crowagent.ai/faq` |
| `link rel=alternate hreflang=x-default` | `https://crowagent.ai/faq` |
| `meta color-scheme` | `dark` |
| `meta view-transition` | `same-origin` |
| `meta theme-color` | `#0A1F3A` |
| `og:type` | `website` |
| `og:site_name` | `CrowAgent` |
| `og:title` | `CrowAgent FAQ: PPN 002, bidding and pricing` |
| `og:description` | `Frequently asked questions about CrowAgent bid and tender software.` (differs from `meta description`) |
| `og:image` | `https://crowagent.ai/Assets/og/faq.png?v=20260730` |
| `og:image:width` / `og:image:height` | `1200` / `630` |
| `og:image:alt` | `CrowAgent FAQ: PPN 002, bidding and pricing` |
| `og:url` | `https://crowagent.ai/faq` |
| `og:locale` | **absent** |
| `twitter:card` | `summary_large_image` |
| `twitter:image` | `https://crowagent.ai/Assets/og/faq.png?v=20260730` |
| `twitter:site` / `twitter:title` / `twitter:description` | **absent** (contact and pricing all have them) |

`<html lang="en-GB" data-theme="dark" class="scroll-smooth">`,
`<body class="bg-ca-bg-deep text-white selection:bg-teal-500/30">`.
Skip link present: `Skip to main content` → `#main-content`.

#### JSON-LD blocks

Two blocks:

1. **FAQPage** — `faq.html:113`, attribute-marked `data-ca-faqld`. `mainEntity` is an array of
   **9** `Question` objects, each with a nested `acceptedAnswer` `Answer` carrying a `text` field.
   Fields used: `@type`, `name`, `acceptedAnswer.@type`, `acceptedAnswer.text`. No `dateCreated`,
   no `author`, no `upvoteCount`.
2. **BreadcrumbList** — `faq.html:116-118`:

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"FAQ","item":"https://crowagent.ai/faq"}]}
```

### Hero

Badge (question-mark SVG 14×14 + text): `Help Centre · Support`

H1:

```
Questions about CrowAgent?
```

(`CrowAgent?` is a gradient-clipped span, `from-teal-400 to-sky-400`.)

Standfirst:

```
Plans, pricing, AI credits, security and the rules CrowMark reads. If your question is not on this page, book a call.
```

CTAs:

| Text | href | Attributes |
|---|---|---|
| Book a 30-minute call | `https://calendly.com/crowagent-platform/30min` | `target="_blank" rel="noopener"` |
| Browse questions | `#faq-general` | — |

Search field (in hero):

| `id` | type | placeholder | aria-label | name |
|---|---|---|---|---|
| `faq-search` | `search` | `Search FAQs` | `Search frequently asked questions` | **none** |

Search behaviour (`js/modules/faq-search.js`): 150ms debounce on `input`; matches question text or
`.prose` answer text, case-insensitive; hides non-matching `details`, sets `aria-hidden`, auto-opens
matches at 3+ characters, hides a whole `section[id^="faq-"]` when it has no visible children;
injects `#faq-no-results` (`role="status" aria-live="polite"`) reading
`No FAQs match "<term>". Try a different term.`; `Enter` is `preventDefault()`ed; calls
`ScrollTrigger.refresh()` after each pass.

### Category grouping

Sidebar (rendered once, in the General section only): label `Categories` (a `<p>`, deliberately
demoted from `<h2>` on 2026-08-01), then `<nav aria-label="FAQ categories">`:

| Link | href | initial class |
|---|---|---|
| General | `#faq-general` | `faq-sidebar-link active` |
| Products | `#faq-products` | `faq-sidebar-link` |
| Pricing | `#faq-pricing` | `faq-sidebar-link` |
| Security | `#faq-security` | `faq-sidebar-link` |

Active state is recomputed on scroll by an inline script at faq.html:479-507.

| Section id | H2 | Section standfirst | Theme |
|---|---|---|---|
| `faq-general` | General | `Foundation, signup, and getting started.` | light |
| `faq-products` | Products | `How CrowMark finds tenders, drafts answers and scores social value.` | dark |
| `faq-pricing` | Pricing | `Plans, billing, and subscription management.` | light |
| `faq-security` | Security | `Data integrity, encryption, and privacy standards.` | dark |

### Every Q&A pair, in document order (14 total)

Each pair is a `<details class="group border-b ... pb-6">` with a `<summary>` question and a
`<div class="prose ...">` answer. Every summary carries a chevron SVG (24×24) that rotates on
`group-open`.

| # | Category | Question (verbatim `<summary>`) | Answer (verbatim) | In FAQPage JSON-LD? |
|---|---|---|---|---|
| 1 | General | What is CrowAgent? | `CrowAgent helps UK suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award. Its product, CrowMark, drafts every answer from your own submitted bids and checks the figures in code rather than generating them. It serves both sides of a procurement. CrowMark for Suppliers answers tenders, RFPs, RFIs, PQQs and SQs from bids you have already written. CrowMark for Buyers builds and publishes requirements, then locates the evidence for each one across the responses received; it never scores, because the evaluation panel scores. Both work in the public sector and the private sector.` | **yes**, exact |
| 2 | General | How do I sign up? | `Request access and, once approved, you can create your account. Every plan includes a 14-day free trial with no credit card required, and you can start scoring bids or preparing your evidence as soon as you sign in.` (`Request access` → `/contact?enquiry=limited-access#contact-form`) | **yes**, exact (link flattened to plain text) |
| 3 | General | Is there a free trial? | `Yes. Every paid plan includes a 14-day free trial. You get full access to all features during the trial period. No credit card is required to start. The PPN 002 social value calculator is always free with no account needed.` | **yes**, exact |
| 4 | Products | What is PPN 002? | `PPN 002 (Procurement Policy Note 002) is UK government policy dated February 2025 and mandatory from 1 October 2025. It requires a minimum 10% social value weighting on in-scope central government contract evaluations, and sets out five missions, M1 to M5, with eight policy outcomes that suppliers evidence in their bids.` | **yes**, exact |
| 5 | Products | What is the 10% minimum? | `Under PPN 002, at least 10% of the total evaluation score for in-scope central government contracts must be allocated to social value. Many local authorities and NHS trusts apply the same or a higher weighting. CrowMark lets you model the weighting your buyer published, calculates the social-value total in code, and drafts the narrative with a PPN 017 AI-transparency disclosure for you to approve.` | **yes**, exact |
| 6 | Products | How is social value scored? | `CrowMark calculates it deterministically in code, using unit-aware arithmetic over a curated catalogue of 19 social-value measures that are aligned to National TOMs conventions and mapped to the 2025 PPN 002 model of five missions and eight policy outcomes. It is not a full National TOMs implementation. The language model never computes the figure: any generated prose containing a £ or % that the computed figures do not support is rejected rather than shown.` | **yes**, exact |
| 7 | Products | Is CrowMark ready to use? | `CrowMark is live and in daily use, with more being added. Tender discovery from Contracts Finder and Find a Tender, document ingestion, grounded answer drafting, deterministic PPN 002 calculation, delivery tracking and Procurement Act 2023 s.52 and s.71 KPI checks all work today. See the CrowMark page for what each stage covers.` (`CrowMark page` → `/crowmark`) | **yes**, but JSON-LD **omits the final sentence** `See the CrowMark page for what each stage covers.` |
| 8 | Pricing | What plans are available? | `CrowMark's plans are Starter, Pro and Portfolio. All paid plans include a 14-day free trial and annual billing saves 10%. See current pricing at /pricing.` (`/pricing` → `/pricing`) | **NO** |
| 9 | Pricing | Can I cancel anytime? | `Yes. You can cancel your subscription at any time from Settings > Billing in the platform. Your access continues until the end of the current billing period. Your data is preserved, so if you resubscribe later, everything will still be there.` | **NO** |
| 10 | Pricing | How are AI credits counted? | `One credit is one AI generation, such as a drafted tender answer or a rewritten method statement. Your plan includes a monthly allowance of them. Reading a tender document and extracting its requirements is charged by size, at 3 credits per 10 pages, rounded up, so a 10-page invitation to tender costs 3 credits. A page means one PDF page, one PowerPoint slide, or a whole Word or plain text document. Everything CrowAgent calculates rather than generates, including PPN 002 social value arithmetic, scoring and exports, is free and unlimited on every paid plan, and a generation that fails is never charged.` | **yes**, exact |
| 11 | Pricing | How is a spreadsheet counted when I upload one? | `By rows, not by sheets. Fifty rows of a sheet count as one page, rounded up and added together across every sheet in the file. A pricing schedule of 5,000 rows on a single Excel sheet therefore counts as 100 pages, which is 30 credits, rather than as a single page. We count it this way because a 5,000-row schedule holds roughly 17 times the text of a 10-page PDF and the AI work scales with how much text there is to read. CSV files are counted exactly like Excel files, and we only count the rows we actually read.` | **yes**, exact |
| 12 | Pricing | How do billing periods work? | `Subscriptions are billed monthly or annually (10% discount). Your billing period starts from the date you subscribe. After your 14-day trial, you will be prompted to choose a plan. If you don't subscribe, your data is preserved but you won't be able to create new records or contracts.` | **NO** |
| 13 | Security | What data do you use? | `Social value is computed in code from the PPN 002 (February 2025) model with unit-aware arithmetic over CrowMark's curated measure catalogue.` | **NO** |
| 14 | Security | Is my data secure? | `Yes. We use Supabase (PostgreSQL) with Row Level Security on all tables. All data is encrypted in transit (TLS) and at rest. We are protected by Cloudflare (DDoS, Bot Fight Mode, SSL Full Strict). Authentication uses Supabase Auth with optional TOTP MFA. CrowAgent Ltd is registered with the ICO as a data controller and we are GDPR compliant. See our Security page for full details.` (`Security page` → `/security`) | **NO** |

### FAQPage JSON-LD vs visible questions — MISMATCH (SEO defect)

| Metric | Count |
|---|---|
| Visible Q&A pairs | **14** |
| Questions in FAQPage JSON-LD | **9** |
| Present in both, answer text identical | 8 |
| Present in both, answer text differs | 1 (#7, JSON-LD drops the trailing sentence) |
| Visible but **missing** from JSON-LD | **5** |
| In JSON-LD but not visible | 0 |

Missing from JSON-LD:
1. `What plans are available?` (Pricing)
2. `Can I cancel anytime?` (Pricing)
3. `How do billing periods work?` (Pricing)
4. `What data do you use?` (Security)
5. `Is my data secure?` (Security)

**Order also differs.** JSON-LD sequence is: What is CrowAgent → How do I sign up → Is there a free
trial → What is PPN 002 → What is the 10% minimum → **Is CrowMark ready to use** → **How is social
value scored** → How are AI credits counted → How is a spreadsheet counted.
Visible order swaps positions 6 and 7 (social value scored comes before ready to use).

This is a genuine SEO defect: 36% of the page's Q&A is invisible to structured-data consumers, and
the entire Security category — the most trust-critical block — is absent. The Astro port should
generate the FAQPage block **from the same data array that renders the accordions** so the two can
never drift again.

### Closing sections

H2: `Still have questions?`

```
If your question is not above, we are happy to walk you through it. Book a 30-minute call or send us a note. We usually reply within 3 to 5 business days.
```

| CTA text | href | attrs |
|---|---|---|
| Book a call | `https://calendly.com/crowagent-platform/30min` | `target="_blank" rel="noopener"` |
| Email us | `mailto:hello@crowagent.ai` | — |

Trust pills — label `Compliance & Data Protection`, four pills each with an inline 20×20 SVG:

| Pill | Icon |
|---|---|
| UK GDPR | shield |
| PECR | padlock |
| ICO Registered | check-circle |
| UK & EU Data Residency | globe |

### Images / video on faq.html

**None.** Zero `<img>`, `<picture>` or `<video>`. All icons are inline SVG. The `.ca-grain` overlay
is an inline `data:image/svg+xml` feTurbulence noise texture defined in the page `<style>`.

### All links on faq.html

| Visible text | href |
|---|---|
| Skip to main content | `#main-content` |
| Book a 30-minute call (hero) | `https://calendly.com/crowagent-platform/30min` |
| Browse questions | `#faq-general` |
| General | `#faq-general` |
| Products | `#faq-products` |
| Pricing | `#faq-pricing` |
| Security | `#faq-security` |
| Request access (Q2) | `/contact?enquiry=limited-access#contact-form` |
| CrowMark page (Q7) | `/crowmark` |
| /pricing (Q8) | `/pricing` |
| Security page (Q14) | `/security` |
| Book a call | `https://calendly.com/crowagent-platform/30min` |
| Email us | `mailto:hello@crowagent.ai` |

### Defects found — faq.html

1. **FAQPage JSON-LD covers 9 of 14 visible questions** (detail above). Highest-value fix on the page.
2. **JSON-LD answer for #7 is not a verbatim copy** of the visible answer (drops one sentence).
3. **Question order differs** between JSON-LD and the DOM.
4. `twitter:site`, `twitter:title`, `twitter:description` and `og:locale` are absent, unlike the other
   two pages.
5. `og:description` differs from `meta description` (probably intentional, recorded for parity).
6. The sidebar `<nav>` renders only inside `#faq-general`; the other three sections use an empty
   `div.lg:col-span-4` spacer. It is `sticky top-32` so it visually persists, but it is not in the
   accessibility tree once the user scrolls past the General section's containing block.
7. Search input has no `name` and is not inside a `<form>` — fine for JS filtering, but there is no
   no-JS fallback: with JS off the field is inert with no explanation.

---

## Uncited claims

Every number and factual claim across the three pages, marked CITED (the page itself names a source)
or UNCITED (no source on the page). Regulatory instrument names (PPN 002, PPN 017, Procurement Act
2023 s.52/s.71) that the page *names* are treated as CITED-by-instrument; no page links to a
gov.uk URL, so none is CITED-by-URL.

| Page | Claim (verbatim or condensed) | Location | Status | Note |
|---|---|---|---|---|
| contact | `We reply within three to five business days` | hero standfirst | **UNCITED** | Service promise, repeated 5× across the page |
| contact | `Response within 3 to 5 business days` | reach strip | **UNCITED** | |
| contact | `We respond within 3 to 5 business days.` | email card | **UNCITED** | |
| contact | `Typically within three to five business days.` | general card | **UNCITED** | |
| contact | `Typically three to five business days` | office info | **UNCITED** | |
| contact | `Founded in the UK · No outsourced support` | reach strip | **UNCITED** | |
| contact | `London based · UK team` | hero eyebrow | **UNCITED** | |
| contact | `Mon-Fri · 09:00-17:30 BST` | office info | **UNCITED** | |
| contact | `Companies House number 17076461` | company details | **CITED** | Names the register; verifiable identifier |
| contact | `Registered in England and Wales` | company details | **CITED** | Same |
| contact | `ICO registered data controller` | company details | **UNCITED** | No ICO registration number given |
| contact | `Data residency UK and EU` | company details | **UNCITED** | |
| contact | `Microsoft Entra ID single sign-on` (Portfolio card) | contact cards | **UNCITED** | Capability claim |
| contact | `Screens from the live product, shown with a sample account rather than a customer's data.` | screenshot lead | **CITED** | Self-disclosing; the chip `Sample data` is on the image |
| pricing | `Starter £49/mo` | tier card + meta + JSON-LD | **UNCITED** | Own list price; no external source needed but no source given |
| pricing | `Pro £149/mo` | tier card + meta + JSON-LD | **UNCITED** | |
| pricing | `Starter £529/yr` (`data-annual`) | tier card (JS-rendered) | **UNCITED** | Not present in JSON-LD |
| pricing | `Pro £1,609/yr` (`data-annual`) | tier card (JS-rendered) | **UNCITED** | Not present in JSON-LD |
| pricing | `Annual · Save 10%` / `Annual billing: 10% off` / `-10%` | toggle, savings section | **CITED (internally consistent)** | The arithmetic checks out against `data-monthly`/`data-annual` (588→529, 1788→1609) |
| pricing | `14-day free trial`, `No card is required` | FAQ 1, 2 | **UNCITED** | |
| pricing | `3 users` (Starter) / `10 users` (Pro) / `Unlimited` (Portfolio) | tier cards + table | **UNCITED** | |
| pricing | `Active bids: Unlimited` on all three tiers | comparison table | **UNCITED and CONTRADICTED** | Page's own comment records enforced caps Starter 5/mo, Pro 25/mo |
| pricing | `PPN 002 · 10% minimum` | capsule + FAQ | **CITED** | Instrument named; `Regulatory Sources` footer lists `PPN 002 (Feb 2025)` |
| pricing | `PPN 017 disclosure` | capsule, table | **CITED** | Named in Regulatory Sources footer |
| pricing | `Procurement Act 2023 s.52 & s.71` | capsules, table, tier copy | **CITED** | Named in Regulatory Sources footer |
| pricing | `3 credits per 10 pages, rounded up` | AI credits card, FAQ 7 | **UNCITED** | Own pricing mechanic |
| pricing | `50 rows of a sheet = one page` | AI credits table, FAQ 7 | **UNCITED** | |
| pricing | `5,000-row pricing schedule = 100 pages = 30 credits` | AI credits table | **UNCITED** | Derived from the above; arithmetic is consistent |
| pricing | `a 5,000-row schedule holds roughly 17 times the text of a 10-page PDF` | AI credits card 2 | **UNCITED** | Quantitative comparison with no method or source |
| pricing | `12-slide briefing = 6 credits` | AI credits table | **UNCITED** | Consistent with 3-per-10-pages (12 slides → 2×3) |
| pricing | `Microsoft Entra ID single sign-on is available now on Portfolio` | FAQ 5 | **UNCITED** | Capability claim; cross-references roadmap.html but does not link it |
| pricing | `SSO via SAML 2.0 / OIDC (on the roadmap)` | trust rows | **UNCITED** | Correctly hedged |
| pricing | `SOC 2 evidence pack (on the roadmap)` | trust rows | **UNCITED** | Correctly hedged |
| pricing | `UK-hosted data on Supabase & Vercel` | trust rows | **UNCITED** | Vendor-named but not evidenced |
| pricing | `We accept all major credit and debit cards via Stripe` | FAQ 8 | **UNCITED** | |
| pricing | `CrowAgent Ltd, Companies House 17076461` | PO section footnote | **CITED** | Verifiable identifier |
| pricing | `Plan changes are pro-rated and applied immediately` | FAQ 4 | **UNCITED** | |
| faq | `PPN 002 … dated February 2025 and mandatory from 1 October 2025` | Q4 | **CITED** | Instrument + dates named; matches the binding site rule (published 13 Feb 2025, mandatory 1 Oct 2025) |
| faq | `minimum 10% social value weighting on in-scope central government contract evaluations` | Q4, Q5 | **CITED** | Instrument named; 10% matches the binding rule |
| faq | `five missions, M1 to M5, with eight policy outcomes` | Q4 | **CITED** | Attributed to PPN 002 |
| faq | `Many local authorities and NHS trusts apply the same or a higher weighting.` | Q5 | **UNCITED** | Prevalence claim with no source |
| faq | `a curated catalogue of 19 social-value measures` | Q6 | **UNCITED** | Specific count, no source |
| faq | `aligned to National TOMs conventions … not a full National TOMs implementation` | Q6 | **CITED** | Framework named and the limit is disclosed |
| faq | `CrowMark is live and in daily use` | Q7 | **UNCITED** | Usage claim |
| faq | `14-day free trial with no credit card required` | Q2, Q3, Q8, Q12 | **UNCITED** | |
| faq | `annual billing saves 10%` / `(10% discount)` | Q8, Q12 | **UNCITED** on this page | Substantiated on pricing.html by `data-annual` values, not linked from here |
| faq | `3 credits per 10 pages, rounded up` | Q10 | **UNCITED** | |
| faq | `Fifty rows … 5,000 rows = 100 pages = 30 credits` | Q11 | **UNCITED** | |
| faq | `roughly 17 times the text of a 10-page PDF` | Q11 | **UNCITED** | Same unsourced comparison as pricing.html |
| faq | `Supabase (PostgreSQL) with Row Level Security on all tables` | Q14 | **UNCITED** | Links to `/security` for "full details" — closest thing to a source on the page |
| faq | `encrypted in transit (TLS) and at rest` | Q14 | **UNCITED** | |
| faq | `Cloudflare (DDoS, Bot Fight Mode, SSL Full Strict)` | Q14 | **UNCITED** | |
| faq | `Supabase Auth with optional TOTP MFA` | Q14 | **UNCITED** | |
| faq | `registered with the ICO as a data controller and we are GDPR compliant` | Q14 | **UNCITED** | No ICO number; "GDPR compliant" is a bare self-assertion |
| faq | `We usually reply within 3 to 5 business days.` | closing block | **UNCITED** | |
| faq | Trust pills: `UK GDPR`, `PECR`, `ICO Registered`, `UK & EU Data Residency` | trust pills | **UNCITED** | Four badge-style assertions with no registration numbers or links |
