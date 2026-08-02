# Content model — resources / roadmap / changelog / tools

Extraction date: 2026-08-02. Source files:

- `C:\Users\bhave\Crowagent Repo\crowagent-website\resources.html` (296 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\roadmap.html` (439 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\changelog.html` (188 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\tools\index.html` (216 lines)

All prose in fenced blocks is **verbatim**, including HTML entities (`&rarr;`, `&middot;`), British spellings and any typographical defects. Nothing has been corrected in transit; defects are recorded in the final table instead.

**Sitewide note (applies to all four):** none of these pages contains an `<img>`, `<video>`, `<picture>`, `<source>` or `<iframe>` element. The only raster assets referenced are the `og:image` / `twitter:image` social cards and the favicon set, all listed per page. The single inline SVG (tools index arrow glyph) is decorative and unlabelled.

---

## Page — resources.html

### Head / metadata

| Field | Value |
|---|---|
| `<html>` | `lang="en-GB" data-theme="dark"` |
| `<title>` | `Resources \| CrowAgent` |
| `meta description` | `A free PPN 002 social value calculator, the method behind it, in-depth guides to UK public sector bidding, and a plain-English glossary.` |
| `link rel=canonical` | `https://crowagent.ai/resources` |
| `meta robots` | `index,follow` |
| `meta color-scheme` | `dark` |
| `meta theme-color` | `#0A1F3A` |
| `meta view-transition` | `same-origin` |
| `og:title` | `Resources \| CrowAgent` |
| `og:description` | `A free PPN 002 social value calculator, the method behind it, in-depth guides to UK public sector bidding, and a plain-English glossary.` |
| `og:image` | `https://crowagent.ai/Assets/og/resources.png?v=20260730` |
| `og:image:width` | `1200` |
| `og:image:height` | `630` |
| `og:image:alt` | `CrowAgent resources - guides and analysis for UK procurement teams` |
| `og:site_name` | `CrowAgent` |
| `og:url` | `https://crowagent.ai/resources` |
| `og:type` | **ABSENT** (present on the other three pages) |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CrowAgentLtd` |
| `twitter:title` | `Resources \| CrowAgent` |
| `twitter:description` | `A free PPN 002 social value calculator, the method behind it, in-depth guides to UK public sector bidding, and a plain-English glossary.` |
| `twitter:image` | `https://crowagent.ai/Assets/og/resources.png?v=20260730` |
| `link rel=manifest` | `/manifest.json` |
| `link rel=mask-icon` | `/safari-pinned-tab.svg` color `#0CC9A8` |
| Favicons | `/favicon.svg` (svg+xml); `/favicon-32.png?v=20260718c` (32x32); `/favicon-192.png?v=20260718c` (192x192); `/apple-touch-icon.png?v=20260718c` (180x180) |
| `body` class | `f8-page f8-resources bg-ca-bg-deep` |

Verified on disk: `Assets/og/resources.png` EXISTS.

#### JSON-LD block 1 — `Organization`

```json
{"@context":"https://schema.org","@type":"Organization","name":"CrowAgent","legalName":"CrowAgent Ltd","url":"https://crowagent.ai/","logo":"https://crowagent.ai/Assets/brand/crowagent_wordmark_transparent_560x140.png?v=20260730","sameAs":["https://www.linkedin.com/company/crowagent","https://x.com/CrowAgentLtd"],"contactPoint":[{"@type":"ContactPoint","contactType":"customer support","email":"hello@crowagent.ai","areaServed":"GB","availableLanguage":["en"]}]}
```

Fields: `@type` Organization; `name`; `legalName`; `url`; `logo`; `sameAs[2]`; `contactPoint[1]` (`@type` ContactPoint, `contactType`, `email`, `areaServed`, `availableLanguage`).

#### JSON-LD block 2 — `BreadcrumbList`

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"Resources"}]}
```

Note: position-2 ListItem has **no `item`** property (the other three pages' breadcrumbs do supply it).

#### Stylesheets and scripts (load order, verbatim hrefs)

CSS: `/Assets/css/fonts-selfhosted.css?v=20260801p0`, `/Assets/css/sovereign-core-v2.compiled.css?v=20260801p0`, `/Assets/css/signature-atmosphere-2026-05-26.css?v=20260801p0`, `/Assets/css/premium-transformation-2026-05-27.css?v=20260801p0`, `/Assets/css/nav-global-fix-2026-05-27.css?v=20260801p0`, `/Assets/css/premium-gloss-2026-05-31.css?v=20260801p0`, `/crowagent-brand-tokens.css?v=20260801p0`, `/Assets/css/resources-page.css?v=20260801p0`, `/Assets/css/ultra-premium-responsive.css?v=20260801p0`, `/Assets/css/no-js-content-fallback.css?v=20260801p0`.
Preload: `/Assets/fonts/PlusJakartaSans-700.woff2` (font/woff2, crossorigin).
JS: `/js/vendor/gsap.min.js?v=20260525` (defer), `/js/vendor/ScrollTrigger.min.js?v=20260525` (defer), `/js/modules/compiled/sovereign-transformation-v2.js?v=20260729rev` (module, defer), `/js/nav-inject.js?v=20260731b` (defer), `/scripts.min.js?v=20260731c` (defer). Plus the inline synchronous `nb-js` stamp in `<head>`.

### Section 01 — Hero

Breadcrumb nav (`aria-label="Breadcrumb"`): `Home` → `/`, then `Resources` (current page, `aria-current="page"`).

Eyebrow / kicker:

```
Hub
```

H1 (two spans):

```
The rules, explained
for UK teams.
```

Standfirst:

```
A statute-cited PPN 002 social value calculator, in-depth briefings on UK public-sector bidding, and a plain-English glossary, built around CrowMark for Suppliers.
```

Hero CTAs: `Run the free calculator &rarr;` → `/tools/ppn-002-calculator`; `Read the latest briefing` → `/blog`.

### Section 02 — Free tools hub (`id="tools"`, light)

Eyebrow `FREE TOOL`. H2:

```
Free PPN 002 calculator
```

Body:

```
Runs the same regulatory engine CrowMark uses internally. No account, no email gate, no credit card. Use it, share the result, then request access if you want the full audit trail.
```

Repeated unit — **resource card (tools)**, 1 instance:

| # | Eyebrow/tag | H3 (linked) | Body | CTA text | CTA href | Gated? |
|---|---|---|---|---|---|---|
| 1 | (none) | `PPN 002 Social Value Calculator` → `/tools/ppn-002-calculator` | `Deterministic mission mapping with National TOMs 2023-24 proxy values. Enter a contract value and see the 10% minimum social-value weighting.` | `Open tool &rarr;` | `/tools/ppn-002-calculator` | No — page states "No account, no email gate, no credit card" **before** the click |

Section footer link: `View all tools &rarr;` → `/tools`.

### Section 03 — Guides (`id="guides"`, dark)

Eyebrow `GUIDES`. H2:

```
In-depth guides
```

Body:

```
Long-form analysis written in-house. Each article cites the policy note, Act or section it rests on, not somebody else's summary of it.
```

Right-hand link: `View all articles &rarr;` → `/blog`.

Repeated unit — **article card**, 1 instance:

| # | Capsule | H3 | Standfirst | Meta line | Card href |
|---|---|---|---|---|---|
| 1 | `PPN 002` | `PPN 002 Social Value: How the 10% Weighting Works` | `A minimum 10% social value weighting now applies to in-scope central government contracts. How the National TOMs measures and National TOMs proxies turn into a defensible, bid-ready score.` | `7 min read &middot; March 2026` | `/blog/ppn-002-social-value-guide` |

The whole card is one `<a>`; the trailing `&rarr;` glyph is inside the same anchor (no separate CTA).

### Section 04 — Methodology (`id="methodology"`, light)

Eyebrow `METHODOLOGY`. H2:

```
How our calculator works
```

Body:

```
Our free calculator ships with a public methodology page so the maths is verifiable. No black box.
```

Repeated unit — **methodology card**, 1 instance:

| # | H3 (linked) | Body | CTA text | CTA href |
|---|---|---|---|---|
| 1 | `PPN 002 Calculator` → `/tools/ppn-002-calculator/methodology` | `mission mapping logic, National TOMs 2023-24 proxy-value sourcing, and the 10% minimum weighting.` | `Read methodology &rarr;` | `/tools/ppn-002-calculator/methodology` |

Note the body copy begins with a lowercase `mission` and is a sentence fragment — see defects table.

### Section 05 — Intel trackers: REMOVED

Present only as an HTML comment (TM-REMEDIATION-001, 2026-07-28). No rendered content. Do not port.

### Section 06 — Glossary (`id="glossary"`, light)

Eyebrow `GLOSSARY`. H2:

```
Glossary of procurement terms
```

Lead:

```
Plain-English definitions of the regulations, frameworks and acronyms that come up in UK public-sector bidding.
```

Italic example list (verbatim, including the repeated term):

```
PPN 002, PPN 06/20, National TOMs, National TOMs, and more.
```

CTA: `Browse the glossary &rarr;` → `/glossary`.

### Section 07 — CTA

H2:

```
Start with the workflow  you need now.
```

(rendered with a `<br/>` between "workflow" and "you need now.")

Lead:

```
CrowMark: find UK public-sector tenders, draft grounded social-value answers, and prove delivery, all in one workspace.
```

CTAs: `Request access &rarr;` → `/contact?enquiry=limited-access#contact-form`; `View all pricing` → `/pricing`.

Compare line:

```
Weighing up your options? See how CrowMark compares to AutogenAI, mytender.io, CleanTender and SwiftBid.
```

(link text = `See how CrowMark compares to AutogenAI, mytender.io, CleanTender and SwiftBid`, href `/compare`)

Legal line:

```
CrowAgent Ltd, Companies House No. 17076461
```

### All links — resources.html

| Visible text | href | Target on disk |
|---|---|---|
| `Skip to main content` | `#main-content` | in-page ✓ |
| `Home` | `/` | `index.html` ✓ |
| `Run the free calculator &rarr;` | `/tools/ppn-002-calculator` | `tools/ppn-002-calculator/index.html` ✓ |
| `Read the latest briefing` | `/blog` | `blog/index.html` ✓ |
| `PPN 002 Social Value Calculator` | `/tools/ppn-002-calculator` | ✓ |
| `Open tool &rarr;` | `/tools/ppn-002-calculator` | ✓ |
| `View all tools &rarr;` | `/tools` | `tools/index.html` ✓ |
| `View all articles &rarr;` | `/blog` | ✓ |
| (whole card, PPN 002 article) | `/blog/ppn-002-social-value-guide` | `blog/ppn-002-social-value-guide.html` ✓ |
| `PPN 002 Calculator` | `/tools/ppn-002-calculator/methodology` | `tools/ppn-002-calculator/methodology/index.html` ✓ |
| `Read methodology &rarr;` | `/tools/ppn-002-calculator/methodology` | ✓ |
| `Browse the glossary &rarr;` | `/glossary` | `glossary/index.html` ✓ |
| `Request access &rarr;` | `/contact?enquiry=limited-access#contact-form` | `contact.html` ✓ |
| `View all pricing` | `/pricing` | `pricing.html` ✓ |
| `See how CrowMark compares to AutogenAI, mytender.io, CleanTender and SwiftBid` | `/compare` | `compare/index.html` ✓ |

**No broken internal links.** Heading order: h1 → h2 → h3 → h2 → h3 → h2 → h3 → h2 → h2. **No skips.**

### Gating answer (resources.html)

No linked resource on this page is gated. The calculator, its methodology page, the blog and the glossary are all open. The page states the ungated status **before** the click, twice: `No account, no email gate, no credit card` (section 02 lead) and the section-02 eyebrow `FREE TOOL`. The only gated destination is the product itself (`Request access` → contact form), and it is labelled as a request, not a signup.

---

## Page — roadmap.html

### Head / metadata

| Field | Value |
|---|---|
| `<html>` | `lang="en-GB" data-theme="dark"` |
| `<title>` | `Roadmap \| CrowAgent` |
| `meta description` | `See what CrowAgent has shipped, what is in flight, and what is coming next for CrowMark, across public sector tenders and private sector bids.` |
| `link rel=canonical` | `https://crowagent.ai/roadmap` |
| `link rel=alternate hreflang="en-GB"` | `https://crowagent.ai/roadmap` |
| `link rel=alternate hreflang="x-default"` | `https://crowagent.ai/roadmap` |
| `meta robots` | `index,follow` |
| `meta color-scheme` | `dark` |
| `meta theme-color` | `#0A1F3A` |
| `meta view-transition` | `same-origin` |
| `og:type` | `website` |
| `og:site_name` | `CrowAgent` |
| `og:title` | `Roadmap \| CrowAgent` |
| `og:description` | `See what we're building next. CrowAgent's product roadmap covers live tools, upcoming launches, and long-term research.` |
| `og:image` | `https://crowagent.ai/Assets/og/roadmap.png?v=20260730` |
| `og:image:width` | `1200` |
| `og:image:height` | `630` |
| `og:image:alt` | `CrowAgent product roadmap - live tools and upcoming launches` |
| `og:url` | `https://crowagent.ai/roadmap` |
| `twitter:card` | `summary_large_image` |
| `twitter:title` | `Roadmap \| CrowAgent` |
| `twitter:description` | `See what we're building next. CrowAgent's product roadmap covers live tools, upcoming launches, and long-term research.` |
| `twitter:image` | `https://crowagent.ai/Assets/og/roadmap.png?v=20260730` |
| `twitter:site` | `@CrowAgentLtd` |
| Favicons / manifest / mask-icon | identical set to resources.html |
| `body` class | `f8-page f8-roadmap bg-ca-bg-deep` |

**og/twitter description differs from the meta description** on this page (the only one of the four where they diverge).

Verified on disk: `Assets/og/roadmap.png` EXISTS.

#### JSON-LD — `BreadcrumbList` (only block)

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"Roadmap","item":"https://crowagent.ai/roadmap"}]}
```

No `Organization` block on this page.

#### Stylesheets and scripts

CSS: `/crowagent-brand-tokens.css`, `/Assets/css/fonts-selfhosted.css`, `sovereign-core-v2.compiled.css`, `signature-atmosphere-2026-05-26.css`, `premium-transformation-2026-05-27.css`, `roadmap-page.css`, `/print.css` (`media="print"`), `nav-global-fix-2026-05-27.css`, `premium-gloss-2026-05-31.css`, `ultra-premium-interactions.css`, `ultra-premium-responsive.css`, `no-js-content-fallback.css` — all `?v=20260801p0`.
Resource hints: `dns-prefetch` `https://cdnjs.cloudflare.com`, `dns-prefetch` `https://app.posthog.com`, `preconnect` `https://api.brevo.com`, `preconnect` `https://challenges.cloudflare.com`; `preload` `/Assets/fonts/PlusJakartaSans-700.woff2`.
JS: gsap, ScrollTrigger, `sovereign-transformation-v2.js` (module), `/js/nav-inject.js?v=20260731b`, `/scripts.min.js?v=20260731c`, `/js/modules/roadmap-reveal.js?v=20260525`, `/js/modules/section-motion-choreography.js?v=20260525`, `/js/modules/reveal-failsafe.js?v=20260525`.

### Hero

Eyebrow:

```
ROADMAP
```

H1:

```
CrowAgent product roadmap
```

Standfirst:

```
What is shipped, what is in flight, and what comes next for CrowMark. Research is labelled as research, and dates on unshipped work are indicative.
```

Meta lines:

```
Future-phase dates are indicative and subject to change. Every shipped feature is announced on the changelog.
```

```
Last updated: 25 May 2026
```

(`changelog` links to `/changelog`; the date is wrapped in `<time datetime="2026-05-25">25 May 2026</time>`)

### Timeline section (`aria-labelledby="roadmap-timeline-heading"`)

Eyebrow `The build, in order`. H2 (`id="roadmap-timeline-heading"`):

```
Shipped, in progress, and next
```

Lead:

```
A single timeline from what is live in production today to the research shaping the next twelve months. Each phase is anchored to a specific UK or EU regulatory driver, so the plan is deterministic, not speculative.
```

#### Repeated unit — roadmap milestone (4 instances)

| # | `data-status` | Phase label (verbatim) | Date/quarter label | Lead copy |
|---|---|---|---|---|
| 1 | `live` | `Phase 1 &middot; Live now` | `Q2 2026` | `CrowMark is in production today, in both variants: for suppliers and for buyers. It reads the source regulation directly, so the output you stand behind traces back to a rule rather than to a model.` |
| 2 | `progress` | `Phase 2 &middot; In progress` | `Q3 2026` | `Security and access work that builds on CrowMark. Dates are indicative and subject to change.` |
| 3 | `research` | `Phase 3 &middot; Researching` | `Q4 2026` | `Early research, not yet committed engineering. Anchored to live regulation rather than speculation.` |
| 4 | `research` | `Later` | `2027` | `On the radar beyond the next twelve months.` |

**Status vocabulary used by this page:** `Live now`, `In progress`, `Researching`, `Later` (milestone level); `In progress`, `Researching` (status pills in the intelligence section). There is no "Shipped" or "Planned" label; "shipped" appears only in prose.

#### Repeated unit — roadmap item (7 instances)

| # | Milestone | Title (verbatim) | Description | Link | Is it an `<a>`? | CTA text |
|---|---|---|---|---|---|---|
| 1 | Phase 1 · Live now (Q2 2026) | `CrowMark for Suppliers` | `Contracts Finder and Find a Tender refreshed daily, tender document ingestion, answer drafting grounded in your own submitted bids, deterministic PPN 002 social-value calculation, post-award delivery evidence, and Procurement Act 2023 s.52 and s.71 KPI checks.` | `/crowmark` | yes | `View product &rarr;` |
| 2 | Phase 1 · Live now (Q2 2026) | `CrowMark for Buyers` | `Build and publish requirements against a deterministic social value rubric, then locate the evidence for each one across every response received, quoted verbatim or dropped. CrowMark organises; your evaluation panel scores.` | `/crowmark-buyers` | yes | `View product &rarr;` |
| 3 | Phase 2 · In progress (Q3 2026) | `Passkeys (WebAuthn)` | `Windows Hello and Touch ID sign-in as an alternative to TOTP multi-factor authentication for your CrowMark account.` | — | no (`<div>`) | — |
| 4 | Phase 2 · In progress (Q3 2026) | `Deeper grounded auto-fill (public sector)` | `Extending CrowMark's grounded AI drafting so it can read more of your uploaded evidence and propose PPN 002 narratives directly, each suggestion citing the exact regulation behind it for you to approve or edit. The model proposes, you decide.` | — | no | — |
| 5 | Phase 3 · Researching (Q4 2026) | `Regulatory Monitor (public sector)` | `A live UK public procurement regulatory change feed. Material updates to PPN 002 and the Procurement Act 2023 flow straight into the CrowMark dashboard, so you act, not just read.` | — | no | — |
| 6 | Phase 3 · Researching (Q4 2026) | `Tender reasoning copilot (public sector)` | `One statute-grounded assistant that reasons across PPN 002 and the Procurement Act 2023 at once, answering bid questions and citing the named regulation behind every line. Retrieval-grounded against the source law, never free-styling the legislation.` | — | no | — |
| 7 | Later (2027) | `Broader SSO (SAML 2.0 / OIDC)` | `Microsoft Entra ID SSO is available now on Portfolio. This expands single sign-on to additional identity providers via SAML 2.0 and OIDC.` | — | no | — |

Item titles are `<span class="roadmap-item__title">`, **not** headings — they do not appear in the document outline. Port as `<h3>` in Astro if the outline matters, or keep as spans for byte parity.

#### DELIVERY-DATE COMMITMENT FLAGS

| Item | Attached date | Commitment reading | Hedge present on page? |
|---|---|---|---|
| Passkeys (WebAuthn) | `Q3 2026` (milestone header) | Implies delivery in Q3 2026 | YES — milestone lead: "Dates are indicative and subject to change"; hero: "Future-phase dates are indicative and subject to change" |
| Deeper grounded auto-fill (public sector) | `Q3 2026` (milestone header) **and** `Indicative timing Q3 2026, subject to change` (intelligence section) | Implies delivery in Q3 2026 | YES — hedged twice, explicitly and in-line |
| Regulatory Monitor (public sector) | `Q4 2026` | Implies delivery in Q4 2026 | PARTIAL — milestone lead says "Early research, not yet committed engineering", which contradicts a Q4 2026 header date. The **quarter header itself is unhedged**; only the lead qualifies it. |
| Tender reasoning copilot (public sector) | `Q4 2026` | Implies delivery in Q4 2026 | PARTIAL — same as above; intelligence section repeats "Early research, not committed engineering" but the Q4 2026 stamp remains |
| Broader SSO (SAML 2.0 / OIDC) | `2027` | Year-level, soft | Implicitly hedged by "On the radar beyond the next twelve months" |
| CrowMark for Suppliers / for Buyers | `Q2 2026` | Not a commitment — retrospective, "Live now" | n/a |

**Highest-risk pairing:** Phase 3 attaches a named quarter (`Q4 2026`) to work the same block calls "not yet committed engineering". A reader scanning the timeline sees the quarter, not the lead paragraph. This is the one place on the page where a status label and a date label pull in opposite directions.

Additional date claim outside the timeline: `Maybe in 2027, but not on the current roadmap.` (EPR / WEEE card) — explicitly non-committal.

### Intelligence layer section (`aria-labelledby="roadmap-intelligence-heading"`)

Eyebrow `The intelligence layer`. H2:

```
How the AI actually works
```

Lead:

```
CrowMark is not a chatbot wrapped around a regulation. It runs a deterministic scoring engine first; large language models do the writing and explaining on top, grounded in the named statute. The model proposes a draft, you review and sign it off. Here is the honest shape of it, including where it is live today and where the work is still ahead.
```

#### Repeated unit — "Live today" card (4 instances)

| # | Eyebrow | H3 | Body |
|---|---|---|---|
| 1 | `Live today` | `Deterministic engine, then narrative` | `The numbers come from code, not a model. PPN 002 social-value scoring and Procurement Act 2023 s.52 and s.71 KPI checks are computed deterministically. The language model is the last step: it turns that computed result into a readable narrative or report draft. It never invents the figure.` |
| 2 | `Live today` | `Two models, two jobs` | `Customer-facing drafting (CrowMark bid narratives) runs on Google Gemini. Heavier reasoning and analysis tasks run on Anthropic's Claude. Both are used as data sub-processors under signed DPAs; your prompts are not used to train their foundation models. The full list is on the privacy page.` (inline link `privacy page` → `/privacy`) |
| 3 | `Live today` | `Grounded in the source law` | `CrowMark reads the actual regulation it serves: PPN 002 (February 2025) for social value, and the Procurement Act 2023 sections 52 and 71 for delivery KPIs. Outputs cite the named instrument so the claim is auditable rather than asserted.` |
| 4 | `Live today` | `A human signs every output` | `Under Article 22 UK GDPR, CrowAgent makes no solely-automated decision with legal effect about anyone. AI drafts are advisory. You review, edit and approve before a single word reaches a bid, a report or a buyer. The model proposes; you decide.` |

#### Repeated unit — "Where the AI work is heading" status row (3 instances)

Sub-eyebrow: `Where the AI work is heading`.

| # | Status pill (verbatim) | H3 | Body | Date attached |
|---|---|---|---|---|
| 1 | `In progress` | `Deeper grounded auto-fill (public sector)` | `CrowMark already drafts grounded bid answers from your own submitted bids. We are extending that pattern so it reads more of your uploaded evidence and proposes PPN 002 narratives directly, each suggestion citing the exact regulation behind it for you to approve or edit. Indicative timing Q3 2026, subject to change.` | `Q3 2026` (explicitly indicative) |
| 2 | `Researching` | `Tender reasoning copilot (public sector)` | `Early research, not committed engineering. One assistant that reasons across PPN 002 and the Procurement Act 2023 at once, answering bid questions and citing the named regulation behind every line. It would be retrieval-grounded against the source law, never free-styling the legislation.` | none |
| 3 | `Researching` | `Regulatory monitor feed (public sector)` | `A live UK public procurement regulatory change feed so material updates to PPN 002 and the Procurement Act 2023 surface in the CrowMark dashboard, with the model summarising what changed and what it means for your existing work. Research stage only.` | none |

Closing paragraph:

```
We will not ship a model that free-styles the law. Every AI feature keeps a deterministic engine underneath, and narrative generation is the last step, never the source. That is a fixed design rule, not a phase.
```

### "How we decide what to ship next" section (light)

Eyebrow `Methodology`. H2:

```
How we decide what to ship next
```

Lead:

```
Every CrowAgent product traces back to a UK or EU regulation that already exists or has already passed Royal Assent. No speculative tools, no pivots to whatever VC trend is loudest this quarter.
```

#### Repeated unit — numbered method row (4 instances)

| # | Numeral | H3 | Body |
|---|---|---|---|
| 1 | `01` | `Regulatory deadlines` | `A statutory instrument with a date attached (PPN 002 mandatory from 1 October 2025, Procurement Act 2023 commencement) earns a slot before anything else.` |
| 2 | `02` | `Demand-led` | `When the same need comes up repeatedly from the teams we talk to, it moves up the plan. We prioritised post-award delivery evidence because Procurement Act 2023 KPI checks were the most-requested capability adjacent to our PPN 002 work.` |
| 3 | `03` | `Adjacency to a live product` | `Post-award delivery evidence sits next to bid drafting because the same team that wins the tender also has to prove KPI performance under Procurement Act 2023 sections 52 and 71.` |
| 4 | `04` | `Where the edge sits` | `CrowAgent does not try to out-feature every bid-writing tool on the market; the edge is grounded, statute-cited accuracy.` |

### "What we won't build" section (dark)

Eyebrow `Scope discipline`. H2:

```
What we won't build
```

Lead:

```
Honesty about scope is part of the deal. We actively decide against patterns that diverge from our regulatory anchor.
```

#### Repeated unit — exclusion card (2 instances)

| # | H3 | Body |
|---|---|---|
| 1 | `EPR / WEEE / Packaging Tax` | `These are real regulations but adjacent to a buyer CrowAgent does not currently serve. Maybe in 2027, but not on the current roadmap.` |
| 2 | `Hallucinating AI Copilots` | `Every AI feature in the platform has a deterministic engine underneath. Narrative generation is the LAST step, never the SOURCE.` |

### "Regulatory Clock" section (light)

Eyebrow `Regulatory Clock`. H2:

```
Deadlines on the radar
```

#### Repeated unit — regulatory driver row (1 instance)

| # | Date column | H3 | Body |
|---|---|---|---|
| 1 | `FEB 2025` | `PPN 002 Social Value (mandatory from 1 October 2025)` | `A minimum 10% social value weighting applies to in-scope central government contracts. CrowMark maps each bid to the PPN 002 missions, M1 to M5, and the eight policy outcomes, using a curated catalogue of TOMs-aligned measures.` |

A section titled "Deadlines on the radar" that contains one already-passed deadline is a content-thinness issue, not a factual one.

### CTA band

H2:

```
Request access to CrowMark
```

Lead:

```
Every plan includes a 14-day trial once you're approved.
```

CTAs: `Request access` → `/contact?enquiry=limited-access#contact-form`; `Enterprise enquiry &rarr;` → `/contact`.

### All links — roadmap.html

| Visible text | href | Target on disk |
|---|---|---|
| `Skip to main content` | `#main-content` | in-page ✓ |
| `changelog` | `/changelog` | `changelog.html` ✓ |
| `View product &rarr;` (item 1) | `/crowmark` | `crowmark.html` ✓ |
| `View product &rarr;` (item 2) | `/crowmark-buyers` | `crowmark-buyers.html` ✓ |
| `privacy page` | `/privacy` | `privacy.html` ✓ |
| `Request access` | `/contact?enquiry=limited-access#contact-form` | `contact.html` ✓ |
| `Enterprise enquiry &rarr;` | `/contact` | `contact.html` ✓ |

**No broken internal links.** Heading order: h1 → h2 → h2 → h3×7 → h2 → h3×4 → h2 → h3×2 → h2 → h3 → h2. **No skips.**

---

## Page — changelog.html

### Head / metadata

| Field | Value |
|---|---|
| `<html>` | `lang="en-GB" data-theme="dark"` |
| `<title>` | `Changelog \| Release Notes \| CrowAgent` |
| `meta description` | `Public release notes for CrowMark and the marketing surface. Every shipped change in one feed.` |
| `link rel=canonical` | `https://crowagent.ai/changelog` |
| `meta robots` | **ABSENT** |
| `meta color-scheme` | **ABSENT** |
| `meta theme-color` | `#0A1F3A` |
| `og:title` | `Changelog \| Release Notes \| CrowAgent` |
| `og:description` | `Public release notes for CrowMark and the marketing surface. Every shipped change in one feed.` |
| `og:type` | `website` |
| `og:url` | `https://crowagent.ai/changelog` |
| `og:image` | `https://crowagent.ai/Assets/og/changelog.png?v=20260730` |
| `og:image:alt` | `Changelog \| Release Notes` |
| `og:image:width` | `1200` |
| `og:image:height` | `630` |
| `og:site_name` | `CrowAgent` |
| `og:locale` | `en_GB` |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CrowAgentLtd` |
| `twitter:title` | `Changelog \| Release Notes \| CrowAgent` |
| `twitter:description` | `Public release notes for CrowMark and the marketing surface. Every shipped change in one feed.` |
| `twitter:image` | `https://crowagent.ai/Assets/og/changelog.png?v=20260730` |
| Favicons / manifest / mask-icon | identical set to resources.html |
| `body` class | `f8-page bg-ca-bg-deep` |

Verified on disk: `Assets/og/changelog.png` EXISTS.

#### JSON-LD — `BreadcrumbList` (only block)

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://crowagent.ai/"},{"@type":"ListItem","position":2,"name":"Changelog","item":"https://crowagent.ai/changelog"}]}
```

#### Stylesheets and scripts

CSS: `fonts-selfhosted.css`, `sovereign-core-v2.compiled.css`, `signature-atmosphere-2026-05-26.css`, `premium-transformation-2026-05-27.css`, `nav-global-fix-2026-05-27.css`, `premium-gloss-2026-05-31.css`, `/crowagent-brand-tokens.css`, `ultra-premium-responsive.css`, `no-js-content-fallback.css` — all `?v=20260801p0`.
JS: gsap, ScrollTrigger, `sovereign-transformation-v2.js` (module), `/js/nav-inject.js?v=20260731b` — **all four in `<head>`**. There is **no `<script>` in the body at all**; `/scripts.min.js` is not loaded on this page (it is on the other three). No font `preload`.

### Hero

Eyebrow / kicker:

```
Changelog · System Status · UK Built
```

H1 (two spans):

```
What we shipped,
and when.
```

Standfirst:

```
Public release notes for CrowMark. Every shipped change, in one feed.
```

Latest marker:

```
Latest: MP1, 5 May 2026
```

(`MP1, 5 May 2026` is wrapped in `<strong>`)

### Timeline section

No section heading — the timeline `<article>` elements go straight to `<h2>`. Section wrapper: `py-40 bg-white text-ca-bg`.

#### Repeated unit — changelog entry (2 instances)

| # | `<time>` (verbatim) | Tag | Version / H2 | Bullets (verbatim, in order) |
|---|---|---|---|---|
| 1 | `2026-05-05` | `Marketing surface` | `MP1: Marketing surface expansion` | 1. `New /tools hub aggregating six free tools. Five have since been withdrawn; the PPN 002 calculator remains.` (`/tools` in `<strong>`, **not a link**)<br>2. `New SEO landing page for the PPN 002 Calculator.`<br>3. `New long-form methodology pages for each free tool, citing source regulation and edge cases.`<br>4. `Top nav and footer extended with Free Tools surface.` |
| 2 | `2026-04-26` | `Infrastructure` | `Cloudflare Pages migration complete` | 1. `crowagent.ai now serves from Cloudflare Pages (project crowagent-website).`<br>2. `Eliminated cross-repo deployment risk; improved edge performance for UK users.` |

The `<time>` elements carry **no `datetime` attribute** — the ISO string is the text node only.

Version identifiers: entry 1 uses `MP1` (embedded in the H2, not a separate field). Entry 2 has **no version identifier at all**. There is no semver scheme on this page.

A third entry ("CSRD Omnibus I and CrowMark Update", dated 2026-03-18) exists only as an HTML comment recording its removal (TM-REMEDIATION-001, 2026-07-28). Do not port.

#### Ordering and future-date check

- **Reverse-chronological: YES.** 2026-05-05 precedes 2026-04-26 in document order.
- **Future dates relative to 2026-08-02: NONE.** Both entries are ~3 and ~3.3 months in the past. No defect.
- Hero "Latest: MP1, 5 May 2026" is **consistent** with the top entry (2026-05-05).
- Content-freshness issue (not a factual defect): the newest entry is 2026-05-05, while the page's own source was edited through 2026-07-30 and the site shipped a homepage rebuild on 2026-08-01. A changelog nearly three months stale on a page headed "Every shipped change, in one feed" undercuts the claim in its own standfirst.

### CTA band

H2:

```
LATEST.
```

Lead (with a `<br/>` and a nested span):

```
Ready to see what's next for CrowMark?  Explore the CrowAgent roadmap &rarr;
```

CTAs: `View roadmap` → `/roadmap`; `Pricing` → `/pricing`.

Note: `Explore the CrowAgent roadmap &rarr;` **looks like a link but is a plain `<span>`** — the actual link is the `View roadmap` button below it.

### All links — changelog.html

| Visible text | href | Target on disk |
|---|---|---|
| `View roadmap` | `/roadmap` | `roadmap.html` ✓ |
| `Pricing` | `/pricing` | `pricing.html` ✓ |

Only two links on the entire page. **No broken internal links.** **No skip link** (`#main-content` anchor exists on `<main>` but nothing targets it — resources.html and roadmap.html both have a skip link; this page does not).

Heading order: h1 → h2 → h2 → h2. **No skips.**

---

## Page — tools/index.html

### Head / metadata

| Field | Value |
|---|---|
| `<html>` | `lang="en-GB" data-theme="dark"` |
| `<title>` | `Free UK Procurement Tools \| CrowAgent` |
| `meta description` | `A free PPN 002 social value calculator for UK public sector bidders, cited to National TOMs. No account required.` |
| `link rel=canonical` | `https://crowagent.ai/tools` |
| `meta robots` | **ABSENT** |
| `meta color-scheme` | **ABSENT** |
| `meta theme-color` | **ABSENT** |
| `meta view-transition` | **ABSENT** |
| `og:type` | `website` |
| `og:site_name` | `CrowAgent` |
| `og:title` | `Free UK Procurement Tools \| CrowAgent` |
| `og:description` | `A free PPN 002 social value calculator for UK public sector bidders, cited to National TOMs. No account required.` |
| `og:url` | `https://crowagent.ai/tools` |
| `og:image` | `https://crowagent.ai/Assets/og-image.png?v=20260730` |
| `og:image:alt` | `Free UK Procurement Tools` |
| `og:image:width` | `1200` |
| `og:image:height` | `630` |
| `og:locale` | `en_GB` |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CrowAgentLtd` |
| `twitter:title` | `Free UK Procurement Tools \| CrowAgent` |
| `twitter:description` | `A free PPN 002 social value calculator for UK public sector bidders, cited to National TOMs. No account required.` |
| `twitter:image` | `https://crowagent.ai/Assets/og-image.png?v=20260730` |
| Favicons / manifest / mask-icon | identical set to resources.html |
| `body` class | (none) |

Note this page uses the **generic** `Assets/og-image.png`, not a page-specific card. Verified on disk: EXISTS.

#### JSON-LD

**NONE.** This is the only one of the four pages with no structured data — no `BreadcrumbList`, no `ItemList` of the tools, no `Organization`.

#### Stylesheets and scripts

CSS: `fonts-selfhosted.css`, `sovereign-core-v2.compiled.css`, `nav-global-fix-2026-05-27.css`, `premium-gloss-2026-05-31.css`, `/crowagent-brand-tokens.css`, `ultra-premium-interactions.css`, `premium-v2.css`, `ultra-premium-responsive.css`, `no-js-content-fallback.css` — all `?v=20260801p0`.
JS: `/js/nav-inject.js?v=20260731b` (defer), `/js/nebula-home.js?v=20260719e` (defer). **No gsap, no ScrollTrigger, no `sovereign-transformation-v2.js`, no `scripts.min.js`** — this page runs a different, lighter stack than the other three.
Plus a **page-scoped inline `<style>` block** (lines 36-66) defining `.tgrid`, `.tool`, `.xsell`, `.xcard`, `.go` and three media queries (`max-width:900px`, `max-width:560px`). This must be carried over or reimplemented; it is not in any external stylesheet.

### Hero

Eyebrow / kicker:

```
Free, no account
```

H1 (three animated word-spans):

```
Free PPN 002 calculator.
```

Standfirst:

```
One free social-value calculator for UK public sector bidders, cited to the PPN 002 rule it implements and the National TOMs behind it.
```

Chips (3):

| # | Text | Bold part |
|---|---|---|
| 1 | `PPN 002 · 10% weighting` | `· 10% weighting` |
| 2 | `National TOMs` | `TOMs` |
| 3 | `Procurement Act 2023` | `2023` |

### Tool grid section (`id="tools"`, light)

Eyebrow `Sourced end to end`. H2:

```
One calculator, fully shown.
```

Lead:

```
It cites the model it implements and returns a number you can defend with buyers and evaluators. The full working is published. No email gate.
```

#### Repeated unit — tool card (2 instances)

| # | Tag | Tool name (H3) | Description | CTA text | href | Free / account required | Stated where? | Target exists on disk |
|---|---|---|---|---|---|---|---|---|
| 1 | `PPN 002 · 10% floor` | `PPN 002 Calculator` | `Get the minimum 10% social-value weighting for a central-government tender, mandatory from 1 October 2025.` | `Open tool` | `/tools/ppn-002-calculator/` | **FREE, no account** | Hero eyebrow `Free, no account`; H1 word `Free`; section lead `No email gate`; meta description `No account required` — all **before** the click | ✓ `tools/ppn-002-calculator/index.html` |
| 2 | `Methodology` | `How the score is calculated` | `The full working behind the PPN 002 calculator: which measures are counted, how the weighting is applied, and the source for every proxy value.` | `Read the method` | `/tools/ppn-002-calculator/methodology` | **FREE, no account** (same page-level statements) | as above | ✓ `tools/ppn-002-calculator/methodology/index.html` |

**Tool href verification result: both hrefs resolve to a real page on disk. No missing tool pages.** Note the inconsistent trailing slash between the two (`/tools/ppn-002-calculator/` vs `/tools/ppn-002-calculator/methodology`) — cosmetic, both resolve, but worth normalising in Astro.

Only one directory exists under `tools/`: `ppn-002-calculator` (containing `index.html` and `methodology/index.html`). Four former tool cards (Cyber Essentials Readiness, Late Payment Calculator, CSRD Applicability Checker, VSME Materiality Light) were removed with their pages on 2026-07-28 and exist only as an HTML comment. Do not port.

### Cross-sell section (`id="products"`, dark)

Eyebrow `The full product`. H2:

```
Ready for more than a free check?
```

Lead:

```
CrowMark for Suppliers takes the same sourced approach across the whole bid: find the tender, draft the answers, evidence the delivery.
```

#### Repeated unit — cross-sell card (4 instances)

| # | `--acc` token | Job label | H3 | Body | CTA text | href |
|---|---|---|---|---|---|---|
| 1 | `var(--violet)` | `Find` | `Tender discovery` | `Live tenders from Contracts Finder and Find a Tender, filtered to what you can actually win.` | `Explore` | `/crowmark` |
| 2 | `var(--teal)` | `Draft` | `Grounded answers` | `Answers drafted from your own submitted bids, with a PPN 017 AI disclosure and figures checked in code.` | `Explore` | `/crowmark` |
| 3 | `var(--sky)` | `Score` | `PPN 002 social value` | `Social value scored to National TOMs with National TOMs proxies, calculated rather than generated.` | `Explore` | `/tools/ppn-002-calculator/` |
| 4 | `var(--lime)` | `Evidence` | `Delivery under the Act` | `Track s.52 KPIs and evidence what you promised, after the contract is awarded.` | `Explore` | `/crowmark` |

Each `Explore` link contains an inline SVG arrow: `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"`, path `M5 12h14M12 5l7 7-7 7`. **No `aria-hidden`, no `<title>`, no `role`** — decorative SVG exposed to the accessibility tree.

### Final CTA section (`id="pricing"`)

Eyebrow `Ready when you are`. H2:

```
Find it. Draft it. Win it.
```

Lead:

```
Everything you need to bid for public sector work, in one place.
```

CTAs: `Request access` → `/contact?enquiry=limited-access#contact-form`; `Book a demo` → `https://calendly.com/crowagent-platform/30min` (external, **no `rel="noopener"`, no `target`**).

Trailing link row:

```
See pricing   Ask a question   Built by UK procurement and ML engineers
```

(`See pricing` → `/pricing`; `Ask a question` → `mailto:hello@crowagent.ai`; the third is a plain `<span>`)

### All links — tools/index.html

| Visible text | href | Target on disk |
|---|---|---|
| `Open tool` | `/tools/ppn-002-calculator/` | `tools/ppn-002-calculator/index.html` ✓ |
| `Read the method` | `/tools/ppn-002-calculator/methodology` | `tools/ppn-002-calculator/methodology/index.html` ✓ |
| `Explore` (Find) | `/crowmark` | `crowmark.html` ✓ |
| `Explore` (Draft) | `/crowmark` | ✓ |
| `Explore` (Score) | `/tools/ppn-002-calculator/` | ✓ |
| `Explore` (Evidence) | `/crowmark` | ✓ |
| `Request access` | `/contact?enquiry=limited-access#contact-form` | `contact.html` ✓ |
| `Book a demo` | `https://calendly.com/crowagent-platform/30min` | external (not checked) |
| `See pricing` | `/pricing` | `pricing.html` ✓ |
| `Ask a question` | `mailto:hello@crowagent.ai` | mailto |

**No broken internal links.** **No skip link.** Heading order: h1 → h2 → h3×2 → h2 → h3×4 → h2. **No skips.**

---

## Uncited claims and defects

Legend — **CITED**: the page names a specific source (a PPN number, an Act and section, a named standard, a company number, or links to a page that carries the evidence). **UNCITED**: no source named on the page. Literal reading only; naming a regulation counts as citing the regulation, not as citing a performance claim made about it.

### Evidence flags

| Page | Claim (verbatim or close) | Type | CITED / UNCITED | Note |
|---|---|---|---|---|
| resources | `A statute-cited PPN 002 social value calculator` | Status | CITED | Names PPN 002 |
| resources | `Runs the same regulatory engine CrowMark uses internally` | Factual | **UNCITED** | Unverifiable from the public site |
| resources | `No account, no email gate, no credit card` | Factual | **UNCITED** | True as observed (tool is open) but asserted without evidence |
| resources | `Deterministic mission mapping with National TOMs 2023-24 proxy values` | Factual | CITED | Names National TOMs 2023-24 |
| resources | `the 10% minimum social-value weighting` | Number | CITED | PPN 002 named in the same card |
| resources | `A minimum 10% social value weighting now applies to in-scope central government contracts` | Number | CITED | PPN 002 capsule on the card |
| resources | `7 min read &middot; March 2026` | Date/number | **UNCITED** | Publication date is self-asserted; also stale vs the guide's own consolidation on 2026-07-26 |
| resources | `Long-form analysis written in-house. Each article cites the policy note, Act or section it rests on` | Factual | **UNCITED** | Meta-claim about other pages |
| resources | `Our free calculator ships with a public methodology page so the maths is verifiable. No black box.` | Factual | CITED | The methodology page is linked in the same section |
| resources | `See how CrowMark compares to AutogenAI, mytender.io, CleanTender and SwiftBid` | Comparative | **UNCITED on this page** | Evidence, if any, is on `/compare` |
| resources | `CrowAgent Ltd, Companies House No. 17076461` | Factual | CITED | Company number given |
| roadmap | `Last updated: 25 May 2026` | Date | **UNCITED** | Self-asserted; **stale** — page content was edited through 2026-07-30 (per its own comments), so the stamp is over two months behind the file |
| roadmap | `Q2 2026` / `Live now` | Status+date | **UNCITED** | Retrospective, low risk |
| roadmap | `Q3 2026` on Passkeys and Deeper grounded auto-fill | Date commitment | **UNCITED** | Hedged: "Dates are indicative and subject to change" |
| roadmap | `Q4 2026` on Regulatory Monitor and Tender reasoning copilot | Date commitment | **UNCITED** | **Contradiction**: the same milestone is labelled "not yet committed engineering" while carrying a named quarter. Highest-risk item on the page. |
| roadmap | `2027` on Broader SSO | Date | **UNCITED** | Year-level, soft |
| roadmap | `Contracts Finder and Find a Tender refreshed daily` | Frequency | **UNCITED** | Names the sources, not the refresh cadence evidence |
| roadmap | `Procurement Act 2023 s.52 and s.71 KPI checks` | Factual | CITED | Act + sections named |
| roadmap | `Microsoft Entra ID SSO is available now on Portfolio` | Status | **UNCITED** | Availability + plan-tier claim, no source |
| roadmap | `Customer-facing drafting ... runs on Google Gemini. Heavier reasoning ... Anthropic's Claude` | Factual | CITED | Links to `/privacy` "full list" |
| roadmap | `used as data sub-processors under signed DPAs; your prompts are not used to train their foundation models` | Factual | CITED | Same `/privacy` link carries it |
| roadmap | `Under Article 22 UK GDPR, CrowAgent makes no solely-automated decision with legal effect` | Legal | CITED | Names Article 22 UK GDPR |
| roadmap | `PPN 002 (February 2025)` | Date | CITED | Names the instrument and its date |
| roadmap | `PPN 002 mandatory from 1 October 2025` | Date | CITED | Names the instrument |
| roadmap | `Procurement Act 2023 commencement` | Date | **UNCITED** | No commencement date given |
| roadmap | `Procurement Act 2023 KPI checks were the most-requested capability adjacent to our PPN 002 work` | Superlative | **UNCITED** | "most-requested" with no data behind it |
| roadmap | `the edge is grounded, statute-cited accuracy` | Comparative | **UNCITED** | Positioning claim |
| roadmap | `Every plan includes a 14-day trial once you're approved` | Commercial | **UNCITED** | No link to terms or pricing from this line |
| roadmap | `the PPN 002 missions, M1 to M5, and the eight policy outcomes` | Number | CITED | PPN 002 named |
| roadmap | `Every CrowAgent product traces back to a UK or EU regulation ... or has already passed Royal Assent` | Factual | **UNCITED** | Policy statement, no source |
| changelog | Entry `2026-05-05` / `MP1` | Date | **UNCITED** | Self-record, no commit/release link |
| changelog | `six free tools. Five have since been withdrawn` | Number | **UNCITED** | Self-record; consistent with disk (only PPN 002 remains) |
| changelog | Entry `2026-04-26` Cloudflare Pages migration | Date | **UNCITED** | Self-record |
| changelog | `improved edge performance for UK users` | Performance | **UNCITED** | No measurement, no before/after |
| changelog | `Eliminated cross-repo deployment risk` | Factual | **UNCITED** | Absolute claim ("eliminated") with no evidence |
| changelog | `Every shipped change, in one feed.` | Completeness | **UNCITED** | Contradicted by the page's own comment recording a *deliberately removed* entry (2026-03-18) and by a three-month gap since the last entry |
| tools | `cited to National TOMs` (meta + hero) | Factual | CITED | Names National TOMs |
| tools | `No account required` / `No email gate` / `Free, no account` | Factual | **UNCITED** | Asserted; observably true (calculator page is open on disk) |
| tools | `mandatory from 1 October 2025` | Date | CITED | PPN 002 named on the same card |
| tools | `the minimum 10% social-value weighting` / `10% floor` | Number | CITED | PPN 002 named |
| tools | `a PPN 017 AI disclosure` | Factual | CITED | Names PPN 017 |
| tools | `Live tenders from Contracts Finder and Find a Tender, filtered to what you can actually win` | Factual | **UNCITED** | "what you can actually win" is an outcome implication |
| tools | `Built by UK procurement and ML engineers` | Factual | **UNCITED** | Team composition claim, no source |
| tools | `returns a number you can defend with buyers and evaluators` | Outcome | **UNCITED** | Implied-outcome claim |

**Uncited totals:** resources 6, roadmap 12, changelog 6, tools 4. Grand total 28.

### Defects

| # | Page | Line(s) | Defect | Severity |
|---|---|---|---|---|
| D1 | resources | 258 | Duplicated term in the glossary example list: `PPN 002, PPN 06/20, National TOMs, National TOMs, and more.` — "National TOMs" appears twice. Find/replace artefact (the second was almost certainly "Social Value TOMs" or similar). | Copy |
| D2 | tools/index | 181 | Same artefact: `Social value scored to National TOMs with National TOMs proxies` — reads as a tautology. | Copy |
| D3 | resources | 232 | Methodology card body is a lowercase sentence fragment: `mission mapping logic, National TOMs 2023-24 proxy-value sourcing, and the 10% minimum weighting.` — a leading clause was deleted and the remainder not re-capitalised. | Copy |
| D4 | roadmap | 195-216 | Phase 3 carries the milestone date `Q4 2026` while its own lead says "Early research, not yet committed engineering". A dated quarter attached to explicitly uncommitted work is a date commitment a reader will hold you to. **This is the one roadmap item where status and date contradict each other.** | **Content risk** |
| D5 | roadmap | 111 | `Last updated: 25 May 2026` is stale — the file's own inline comments record edits on 2026-07-28, 2026-07-29 and 2026-07-30. | Content |
| D6 | roadmap | 386-404 | Section titled "Deadlines on the radar" contains exactly one entry, whose deadline (1 October 2025) has already passed. Nothing is on the radar. | Content |
| D7 | changelog | 105-166 | Newest entry is 2026-05-05, ~3 months before extraction date, on a page whose standfirst promises "Every shipped change, in one feed". Homepage rebuild (2026-08-01) and the 2026-07-28 tool removals are not recorded. | Content |
| D8 | changelog | 85 | Hero eyebrow reads `Changelog · System Status · UK Built` but the page contains **no system-status content** of any kind. | Content |
| D9 | changelog | 114, 141 | `<time>` elements have **no `datetime` attribute** — the ISO date is a bare text node, so the dates are not machine-readable. | A11y / SEO |
| D10 | changelog | whole file | **No skip link.** `resources.html` and `roadmap.html` both ship `<a href="#main-content" class="skip-link sr-only">Skip to main content</a>`; this page does not. | A11y |
| D11 | tools/index | whole file | **No skip link.** Same omission. | A11y |
| D12 | tools/index | whole file | **No JSON-LD of any kind.** The only one of the four pages with no structured data — no `BreadcrumbList`, and no `ItemList`/`SoftwareApplication` describing the tools. | SEO |
| D13 | tools/index | 170, 176, 182, 188 | Inline arrow SVGs have no `aria-hidden="true"`, no `role`, no `<title>` — decorative graphics exposed to assistive tech. | A11y |
| D14 | tools/index | 170, 176, 182, 188 | **Non-descriptive link text**: four separate links all reading `Explore`, pointing at three distinct hrefs (`/crowmark` ×3, `/tools/ppn-002-calculator/` ×1). Indistinguishable in a links list. | A11y (WCAG 2.4.4) |
| D15 | roadmap | 152, 163 | **Non-descriptive link text**: two links both reading `View product &rarr;` pointing at different hrefs (`/crowmark`, `/crowmark-buyers`). Less severe than D14 (card title gives context) but still ambiguous out of context. | A11y |
| D16 | tools/index | 207 | External link `Book a demo` → `https://calendly.com/crowagent-platform/30min` has no `rel="noopener noreferrer"` and no indication it leaves the site. | Security / UX |
| D17 | tools/index | 209 | `Ask a question` is a **bare `mailto:hello@crowagent.ai`**. Site policy (see repo memory) is that access CTAs must be web-form links; this is a general enquiry rather than an access request, so it is a soft violation, but it is the only bare mailto across the four pages. | Policy |
| D18 | resources | 20-31 | `og:type` is **absent** (the other three pages all declare `og:type="website"`). | SEO |
| D19 | resources | 56 | `BreadcrumbList` position-2 ListItem has **no `item` URL**; roadmap and changelog both supply one. Inconsistent. | SEO |
| D20 | changelog, tools/index | head | `meta name="robots"` and `meta name="color-scheme"` are **absent** on both; `theme-color` and `view-transition` are additionally absent on tools/index. resources and roadmap have the full set. | SEO / UX |
| D21 | changelog | body | **No `<script>` tag in the body at all** and `/scripts.min.js` is never loaded on this page, unlike the other three. Whatever `scripts.min.js` provides (cookie banner init, reveal, analytics) does not run here except via `nav-inject.js`. | Functional |
| D22 | tools/index | 36-66 | A page-scoped inline `<style>` block (`.tgrid`, `.tool`, `.xsell`, `.xcard`, `.go`, 2 media queries) exists only in this file. It must be ported explicitly or the tools grid loses all layout in Astro. | Migration risk |
| D23 | tools/index | 135 vs 150 | Trailing-slash inconsistency between the two tool hrefs (`/tools/ppn-002-calculator/` vs `/tools/ppn-002-calculator/methodology`). Both resolve; normalise on migration. | Hygiene |
| D24 | roadmap | 150, 161, 181, 187, 208, 212, 227 | Roadmap item titles are `<span class="roadmap-item__title">`, not headings, so seven named roadmap items are invisible in the document outline and to heading navigation. | A11y |
| D25 | changelog | 172 | `Explore the CrowAgent roadmap &rarr;` is styled to read as a link but is a plain `<span>`. Users will click it and nothing happens. | UX |

### Not defects (checked and clear)

- **No missing or empty `alt` attributes** — there are no `<img>` elements on any of the four pages. All `og:image` declarations carry `og:image:alt`.
- **No heading-level skips** on any of the four pages.
- **No broken internal links** on any of the four pages. All 34 internal hrefs resolve to a file on disk (`/compare` → `compare/index.html`, `/blog` → `blog/index.html`, `/glossary` → `glossary/index.html`, `/blog/ppn-002-social-value-guide` → `blog/ppn-002-social-value-guide.html`, both tool hrefs → real pages).
- **No future-dated changelog entries.** Both entries (2026-05-05, 2026-04-26) predate 2026-08-02.
- **Changelog ordering is correct** reverse-chronological.
- **All referenced social-card images exist on disk**: `Assets/og/resources.png`, `Assets/og/roadmap.png`, `Assets/og/changelog.png`, `Assets/og-image.png`.
- **No "click here" / "read more" / "learn more"** link text anywhere on the four pages. The closest offenders are `Explore` (D14) and `View product` (D15).
