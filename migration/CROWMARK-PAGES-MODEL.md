# CrowMark Pages — Content Model for Astro Migration

Extraction-only document. Source files:

- `C:\Users\bhave\Crowagent Repo\crowagent-website\crowmark.html` (772 lines)
- `C:\Users\bhave\Crowagent Repo\crowagent-website\crowmark-buyers.html` (708 lines)

All prose is verbatim from the source. HTML entities are shown as they appear in source
(`&pound;`, `&rarr;`, `&middot;`, `&ge;`, `&rsquo;`, `&#9684;`, `&bull;`) so a rebuild can decide
whether to keep or normalise them. Nothing below has been paraphrased, corrected or shortened.

Evidence flags used throughout:

- **CITED** — the page names a source, statute, framework, feed or third party.
- **UNCITED** — the figure or claim is presented with no source a reader could check.
- **SELF** — a fact about CrowAgent's own commercial terms (price, seat count, plan name). Not
  citable by nature, but recorded so it can be kept in sync with `/pricing`.

---

## Page — crowmark.html (`/crowmark`)

### 1. Document head

| Field | Value |
|---|---|
| `<html>` | `lang="en-GB" data-theme="dark"` |
| `<body>` class | `f8-page f8-product bg-ca-bg-deep` |
| `<title>` | `CrowMark \| Find UK tenders, draft cited answers, prove delivery` |
| `meta description` | `CrowMark tracks Find a Tender, Contracts Finder and Public Contracts Scotland daily, drafts cited answers a person approves, and evidences delivery after award. From £49/month.` |
| canonical | `https://crowagent.ai/crowmark` |
| `hreflang en-GB` | `https://crowagent.ai/crowmark` |
| `hreflang x-default` | `https://crowagent.ai/crowmark` |
| `theme-color` | `#0A1F3A` |
| manifest | `/manifest.json` |
| mask-icon | `/safari-pinned-tab.svg` colour `#0CC9A8` |
| favicons | `/favicon.svg`, `/favicon-32.png?v=20260718c` (32x32), `/favicon-192.png?v=20260718c` (192x192), `/apple-touch-icon.png?v=20260718c` (180x180) |

#### Open Graph / Twitter

| Tag | Value |
|---|---|
| `og:title` | `CrowMark \| Find UK tenders, draft cited answers, prove delivery` |
| `og:description` | `Track Find a Tender, Contracts Finder and Public Contracts Scotland daily, draft cited answers a person approves, and evidence delivery after award. UK bid software from £49/month.` |
| `og:type` | `website` |
| `og:url` | `https://crowagent.ai/crowmark` |
| `og:image` | `https://crowagent.ai/Assets/og/crowmark.png?v=20260730` (exists on disk) |
| `og:image:alt` | `CrowMark \| Find UK tenders, draft cited answers, prove delivery` |
| `og:image:width` / `og:image:height` | `1200` / `630` |
| `og:site_name` | `CrowAgent` |
| `og:locale` | `en_GB` |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CrowAgentLtd` |
| `twitter:title` | `CrowMark \| Find UK tenders, draft cited answers, prove delivery` |
| `twitter:description` | same as `og:description` |
| `twitter:image` | `https://crowagent.ai/Assets/og/crowmark.png?v=20260730` |

#### Stylesheets and scripts (document order)

| Order | Type | Href / src |
|---|---|---|
| 1 | inline script | `document.documentElement.classList.add("nb-js")` — content-visibility failsafe, must stay synchronous and above stylesheets |
| 2 | css | `/Assets/css/fonts-selfhosted.css?v=20260801p0` |
| 3 | css | `/Assets/css/sovereign-core-v2.compiled.css?v=20260801p0` |
| 4 | css | `/Assets/css/signature-atmosphere-2026-05-26.css?v=20260801p0` |
| 5 | css | `/Assets/css/product-carousel-2026-05-26.css?v=20260801p0` — **load-bearing**, `.pcar__slide.is-active` supplies `position:relative` to the single hero slide |
| 6 | css | `/Assets/css/premium-transformation-2026-05-27.css?v=20260801p0` |
| 7 | js defer | `/js/vendor/gsap.min.js?v=20260525` |
| 8 | js defer | `/js/vendor/ScrollTrigger.min.js?v=20260525` |
| 9 | js module defer | `/js/modules/compiled/sovereign-transformation-v2.js?v=20260729rev` |
| 10 | css | `/Assets/css/nav-global-fix-2026-05-27.css?v=20260801p0` |
| 11 | css | `/Assets/css/premium-gloss-2026-05-31.css?v=20260801p0` |
| 12 | css | `/crowagent-brand-tokens.css?v=20260801p0` |
| 13 | css | `/Assets/css/ultra-premium-interactions.css?v=20260801p0` |
| 14 | css | `/Assets/css/ultra-premium-responsive.css?v=20260801p0` |
| 15 | js defer | `/js/nav-inject.js?v=20260731b` — injects BOTH `#ca-nav` and `#ca-footer` |
| 16 | js defer | `/js/modules/magnetic-pull.js?v=20260731f` — drives `[data-magnetic]` |
| 17 | inline `<style>` | page-scoped `.cm-answer`, `.cm-answer-lead`, `.cm-keyfacts` rules (lines 90–100) |
| 18 | css | `/Assets/css/no-js-content-fallback.css?v=20260801p0` |

`product-carousel-2026-05-26.js` is **deliberately not loaded**; there is no `[data-pcar]` root
left on the page.

### 2. JSON-LD

One `<script type="application/ld+json">` block, `@graph` with **three** nodes.

#### Node 1 — `SoftwareApplication`

| Field | Value |
|---|---|
| `@id` | `https://crowagent.ai/crowmark#software` |
| `name` | `CrowMark` |
| `url` | `https://crowagent.ai/crowmark` |
| `applicationCategory` | `BusinessApplication` |
| `operatingSystem` | `Web` |
| `description` | `UK bid suite. Daily Find a Tender, Contracts Finder and Public Contracts Scotland discovery, answer drafting cited to the regulatory corpus, the tender's own clauses and the organisation's answer library, deterministic PPN 002 social-value calculation, and post-award delivery evidence with advisory Procurement Act 2023 checks.` |
| `publisher` | `{"@id":"https://crowagent.ai/#organization"}` |
| `offers` | `{"@type":"Offer","priceCurrency":"GBP","price":"49","url":"https://crowagent.ai/pricing"}` |

#### Node 2 — `BreadcrumbList`

| Position | name | item |
|---|---|---|
| 1 | Home | `https://crowagent.ai/` |
| 2 | CrowMark | `https://crowagent.ai/crowmark` |

#### Node 3 — `FAQPage`

`@id` `https://crowagent.ai/crowmark#faq`, `mainEntity` = 8 `Question` nodes. Every question and
answer is byte-identical to the visible `<details>` list in section 12 below (verified 8 = 8).
Questions in order:

1. Is everything described on this page available today?
2. Where do the tenders come from?
3. Can the AI make up a number in my bid?
4. Is AI use disclosed to the buyer?
5. How is social value calculated?
6. Can CrowMark read a scanned tender document?
7. Does the fit score tell me whether I will win?
8. Does CrowMark cover the Procurement Act 2023 KPI duties?

### 3. Section inventory (document order)

| # | `id` | Element / classes | Background band | Heading |
|---|---|---|---|---|
| 01 | `hero` | `section.ca-hero.ca-section-dark`, `data-hero-scale="product"` | dark | h1 |
| — | — | `nav.sticky` (sub-nav, `hidden lg:block`) | dark | none, `aria-label="Page navigation"` |
| 01D | `what-is-crowmark` | `section.py-[var(--section-y-secondary)].ca-section-light` | light | **none — eyebrow span only** |
| 02 | `how-it-works` | `section.py-[var(--section-y-primary)].ca-section-light` | light | h2 |
| 04 | `benefits` | `section.py-[var(--section-y-primary)].ca-section-light` | light | h2 |
| 05 | `procurement-act` | `section.py-[var(--section-y-primary)].ca-section-dark` | dark | h2 |
| 06 | `features` | `section.py-[var(--section-y-primary)].ca-section-light` | light | h2 |
| 07B | `buyers` | `section.py-[var(--section-y-primary)].ca-section-dark` | dark | h2 |
| 08 | `pricing` | `section.py-[var(--section-y-primary)].ca-section-light` | light | h2 |
| 09 | (none) | `section.py-[var(--section-y-secondary)].ca-section-dark` | dark | h2 |
| 11 | (none) | `section.ca-cta-final.!bg-ca-mark` | mark/violet | h2 |
| 12 | `product-faq` | `section.ca-section-dark.py-32` | dark | h2 |

Sections 03 (second carousel) and 07 (In development) exist **only as HTML comments** — no markup.

### 4. Hero (`#hero`)

Backdrop: `.ca-hero-backdrop` containing `.ca-hero-glow.!bg-ca-mark/20.ca-chromatic` (note: `.ca-hero-glow`
is `display:none !important` site-wide, so this element never paints) and `.ca-hero-grid`.

**Eyebrow** (`div.ca-eyebrow.ca-hero-badge`, with `span.ca-eyebrow-dot.!bg-ca-mark`):

```
UK bid suite
```

**H1** (`h1.ca-hero-title`, two `<span>` line units):

```
Find UK tenders. Draft
cited answers. Prove delivery.
```

**Standfirst** (`p.ca-hero-desc`):

```
Every answer is cited to the regulations, to the tender's own clauses and to your answer library, and a named person approves it before it goes anywhere.
```

**Hero CTAs** (`div.ca-hero-btns`):

| Order | Visible text | href | Classes | Attributes |
|---|---|---|---|---|
| 1 | `Request access` | `/contact?enquiry=limited-access#contact-form` | `sv-btn sv-btn-primary !bg-ca-mark !text-ca-bg` | `data-magnetic`, `data-cta-pulse` |
| 2 | `See pricing &rarr;` | `/pricing?product=mark` | `sv-btn sv-btn-ghost` | — |

`?enquiry=limited-access` is a **wire value** read by `scripts.js` to preselect the contact
subject. It is not copy and must survive the migration unchanged.

**Hero proof strip** (`ul[role=list].mt-16...`, 4 `<li>`, each `<strong>` + trailing text, no separator punctuation):

| `<strong>` | Trailing text | Evidence |
|---|---|---|
| `3 sources` | `Find a Tender, Contracts Finder, Public Contracts Scotland` | CITED (three named UK feeds) |
| `Daily` | `Refreshed feed` | UNCITED (cadence asserted, no source) |
| `PPN 017` | `Disclosure on every draft` | CITED statute ref + UNCITED absolute "every" |
| `s.52 · s.71` | `Procurement Act 2023` | CITED (`&middot;` separator in source) |

### 5. Hero product showcase (the one screenshot)

Structure: `div.ca-hero-visual[data-tilt-intensity="1.5"]` → `.ca-showcase-frame` → simulated
`.ca-browser-chrome` → `.ca-viewport.aspect-[16/10]` → `.pcar__slide.is-active`.

Simulated browser chrome contents:

- three window dots: `.bg-dot-close`, `.bg-dot-minimize`, `.bg-dot-maximize`
- URL text: `app.crowagent.ai/` + `<span class="text-white/70">crowmark</span>`
- a pulsing teal dot (`animate-pulse`) and a one-third-filled progress bar — **decorative simulated
  "live/loading" state with no text equivalent**

**The image**

| Field | Value |
|---|---|
| Wrapper | `<div class="pcar__slide is-active" data-caption="…">` (see caption below) |
| `<source>` 1 | `type="image/avif"` `srcset="/Assets/shots/dark/mark-analytics.avif?v=20260731e"` |
| `<source>` 2 | `type="image/webp"` `srcset="/Assets/shots/dark/mark-analytics.webp?v=20260731e"` |
| `<img src>` | `/Assets/shots/dark/mark-analytics.png?v=20260731e` |
| `width` / `height` | `3200` / `2000` |
| `loading` / `decoding` | `lazy` / `async` |
| `class` | `w-full h-full object-cover object-left-top` |
| `alt` | `The CrowMark analytics screen, shown with sample data: headline tiles for total contracts, social value delivered and evidence completion, with bar charts of contracts by status and bids by sector` |

All three asset variants exist on disk.

**Sample-data labelling:** YES, in both the `alt` and the visible caption. The words "shown with
sample data" appear in each.

**Visible caption** — a *static* `<p class="text-xs font-bold text-white/90 leading-tight">` inside
`.ca-glass-premium`, **not** `.pcar__caption` (the carousel JS that used to write it is gone):

```
The CrowMark analytics screen, shown with sample data: contracts by status, bids by sector and social value recorded against delivered commitments.
```

The identical string is duplicated in the slide's `data-caption` attribute.

Also present: a `.absolute.inset-0.pointer-events-none` glare gradient overlay, and a
`.absolute.-bottom-12` blurred "slab reflection" div. Both decorative.

### 6. Sticky sub-navigation

`<nav class="sticky top-[72px] z-[2000] … hidden lg:block" style="top: 72px;" aria-label="Page navigation">`.
**Hidden below the `lg` breakpoint** — mobile and tablet get no in-page nav.

| Visible text | href | Target exists on page |
|---|---|---|
| `How it works` | `#how-it-works` | yes |
| `Features` | `#features` | yes |
| `Pricing` | `#pricing` | yes |
| `FAQ` | `#product-faq` | yes |

Each link carries `inline-flex items-center min-h-[44px]` for WCAG 2.5.8 target size.
`#what-is-crowmark`, `#benefits`, `#procurement-act` and `#buyers` are **not** in this nav.

### 7. `#what-is-crowmark` — answer-first block

Eyebrow (`span.ca-eyebrow`, not a heading element):

```
What is CrowMark?
```

Lead (`p.cm-answer-lead`; `<strong>` wraps the first clause):

```
CrowMark is a UK bid and tender management suite for public-sector suppliers. It tracks Find a Tender, Contracts Finder and Public Contracts Scotland every day, drafts answers cited to the regulations, to the tender's own clauses and to the supplier's answer library, checks every figure against the supplier's own data so the model cannot invent a number, discloses AI use under PPN 017, and holds the evidence of delivery after award. Pricing starts at &pound;49 per month.
```

**Key facts `<dl class="cm-keyfacts">`** — 5 `<div>` rows of `<dt>` / `<dd>`:

| `<dt>` | `<dd>` (verbatim; `<strong>` markers shown) | Evidence |
|---|---|---|
| What it is | `A UK public-sector bid and tender management suite, and CrowAgent's flagship product.` | SELF |
| Who it is for | `UK SMEs and suppliers bidding for public-sector contracts on Find a Tender, Contracts Finder and Public Contracts Scotland.` | CITED (feeds) |
| Price | `From <strong>&pound;49/month</strong> (Starter). Pro is &pound;149/month; Portfolio is contact sales. Every plan starts with a 14-day trial.` | SELF |
| The differentiator | `Deterministic <strong>figure-grounding</strong>, so the model cannot print a number your data does not contain, plus a <strong>PPN 017</strong> AI-use disclosure on every draft and a named person approving every answer.` | CITED (PPN 017) + UNCITED absolutes ("cannot", "every draft", "every answer") |
| The statute | `Advisory checks against the <strong>Procurement Act 2023</strong> (sections 52 and 71) and PPN 002 social value, with its mandatory 10% minimum weighting. Advisory, never blocking, and not legal advice.` | CITED (Procurement Act 2023 ss.52/71, PPN 002, 10%) |

**Cross-sell line** (`<p style="margin-top:1.5rem;font-size:1.05rem;">`):

```
Weighing up your options?
<a href="/compare" style="color:var(--teal);font-weight:600;text-decoration:underline;">See how CrowMark compares to AutogenAI, mytender.io, CleanTender and SwiftBid</a>.
```

`/compare` resolves to the `compare/` directory (`compare/index.html`) — link is valid.
Note the inline `style` attribute on the anchor; the migration should tokenise it.

### 8. `#how-it-works` — 4-step walkthrough

Eyebrow: `Product walkthrough`.
**H2** (`h2.text-5xl`, with a hard `<br/>`):

```
Tender to delivery,
in 4 steps.
```

Standfirst (`p.ca-section-desc.max-w-2xl.mx-auto.mt-8`):

```
One thread from the notice you found this morning to the evidence your buyer asks for two years later.
```

Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8`, each card
`div.ca-card.!bg-black/5.!border-black/5.!p-10.hover:!border-ca-mark/20.transition-all`.

**Repeated unit — walkthrough step (4 units)**

| # (`span.text-4xl`) | h3 | Body (`p.text-sm.text-ca-bg`) | Evidence |
|---|---|---|---|
| `01` | `Find the tender` | `Find a Tender, Contracts Finder and Public Contracts Scotland, refreshed daily. Filter by sector, value and region, sort the feed, and bookmark what is worth a bid.` | CITED (feeds); "refreshed daily" UNCITED |
| `02` | `Read it, then decide` | `Upload the tender pack as PDF, DOCX, XLSX or an image, up to 10MB. CrowMark extracts the requirements, scores fit and coverage with the reason behind each component, and returns pursue, review or pass with the gaps named. It reads the tender rather than predicting the award, and a named person decides.` | UNCITED product spec (10MB); explicit non-prediction disclaimer present |
| `03` | `Draft the answer` | `Retrieval cites three sources: the regulatory corpus, the tender's own clauses, and your answer library, which is a fallback the response flags when it is used. Your win themes enter every answer, the first draft is critiqued and revised against the tender's own criteria, and social-value totals are computed in code.` | UNCITED capability |
| `04` | `Prove the delivery` | `After award, hold the evidence in one vault, record the delivery actuals against each commitment, and produce the authority-facing report, including the annual section 71 roll-up rated red, amber or green.` | CITED (s.71); RAG scale is CrowMark's own, correctly attributed |

### 9. `#benefits` — three differentiators

Eyebrow: `Why CrowMark`.
**H2** (with `<br/>`):

```
Three things most
bid tools will not do.
```

Standfirst (`p.text-2xl.text-ca-bg.font-medium.mt-12.max-w-2xl.mx-auto`):

```
The AI cannot invent a number, every draft says it is AI-assisted, and the commitment you bid is the commitment you report against.
```

**Repeated unit — benefit card (3 units).** Each has an inline 24x24 SVG icon (`aria-hidden="true"`,
`stroke="currentColor"`, `stroke-width="2"`) in a `w-12 h-12 bg-ca-mark/10 rounded-xl` tile.

| Icon path summary | h3 | Body | Evidence |
|---|---|---|---|
| shield + tick (`M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z` / `m9 12 2 2 4-4`) | `The AI cannot invent a figure` | `Before a draft is shown, every £ and % in the prose is checked against a set of allowed figures computed from your own data. If a number is not in that set, the draft is rejected rather than published. The language model is never the source of a figure. A gate then reports the figures traced, the word count and the citations, and approval stays blocked until it passes.` | UNCITED absolute ("cannot", "never", "every") |
| pencil (`M12 20h9` / `M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z`) | `PPN 017 disclosure, human approval` | `Every AI-assisted draft carries a PPN 017 AI-transparency disclosure, and nothing reaches a buyer without a person approving it. A person approves, never the model. If no AI key is configured, CrowMark returns nothing rather than a canned answer.` | CITED (PPN 017); UNCITED absolutes |
| document (`M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z` / `polyline 14 2 14 8 20 8`) | `Award to delivery to reporting` | `The commitment you bid stays attached to the contract after award: delivery actuals against each commitment, the evidence held in one vault, an authority-facing report, and advisory section 52 and section 71 KPI checks under the Procurement Act 2023.` | CITED (ss.52/71) |

### 10. `#procurement-act` — statute section

Eyebrow (`span.ca-eyebrow.text-ca-mark`): `Procurement Act 2023`.
**H2** (with `<br/>`):

```
The KPI duties nobody
reads until it's too late.
```

Standfirst:

```
CrowMark checks your contract against the Procurement Act 2023 KPI duties and tells you where you stand. The check is advisory, it never blocks you, and it is not legal advice.
```

**Repeated unit — statute card (2 units), `div.ca-card.!p-12` in a `md:grid-cols-2 max-w-4xl` grid**

| h3 | Body | Statute check |
|---|---|---|
| `Section 52` | `Public contracts with an estimated value above £5m must have at least three published key performance indicators. CrowMark flags the threshold, counts your published KPIs, and shows the shortfall.` | **CITED and consistent.** Procurement Act 2023 s.52 requires at least three KPIs for public contracts with an estimated value above £5m. The £5m figure and the "at least three" figure both match the section named. |
| `Section 71` | `Performance against those KPIs has to be assessed and published. CrowMark holds the KPI set alongside your delivery evidence, so the assessment is drawn from the record rather than reconstructed, and the annual roll-up is rated red, amber or green.` | **CITED and consistent** on the duty. The red/amber/green scale is CrowMark's, not the Act's, and the sentence attributes it to CrowMark rather than to s.71 — correct as written, but see the defects table for the ambiguity risk. |

### 11. `#features` — "What CrowMark does today"

Eyebrow: `Available now`.
**H2** (with `<br/>`):

```
What CrowMark
does today.
```

Standfirst (`p.text-2xl.text-ca-bg.max-w-2xl.mx-auto.mt-12`):

```
Every capability in this grid is live in the product today.
```

**How today-vs-planned is distinguished:** by *text only*, and only by this one sentence plus FAQ 1.
There is **no visual treatment, badge, tag or separate band** anywhere on the page for planned work,
because section 07 ("In development") was reduced to an HTML comment with no markup. Two
capabilities that were previously held back — answer marking and bid/no-bid fit scoring — were
promoted into this live grid on 2026-07-30. The page therefore asserts that **everything** on it is
shipped; a reader has no way to tell a newly-promoted capability from a long-standing one.

**Repeated unit — capability card (8 units).** Each is
`div.ca-card.!bg-black/5.!border-black/5.!p-10.flex.flex-col.justify-between` and ends with a
decorative `div.h-1.w-12.bg-ca-mark.mt-8` rule.

| # | h3 | Body | Evidence |
|---|---|---|---|
| 1 | `UK tender discovery` | `Find a Tender, Contracts Finder and Public Contracts Scotland, ingested from their published feeds and refreshed daily. Filter by sector, value and region, sort the feed, and bookmark what matters.` | CITED (three feeds); "refreshed daily" UNCITED |
| 2 | `Cited answer drafting` | `Retrieval runs across three citation buckets: the regulatory corpus, the tender's own clauses, and your organisation's answer library, which is a fallback the response flags when it is used. Win themes enter every answer, the first draft is critiqued and revised against the tender's criteria, and the figure-grounding gate rejects any draft containing a number your data does not support.` | UNCITED |
| 3 | `Deterministic PPN 002 maths` | `Social value is calculated in code with unit-aware arithmetic against the 2025 PPN 002 model: five missions, M1 to M5, and eight policy outcomes. Measures are TOMs-aligned. The 10% minimum weighting is applied, never guessed, and it is a weighting, not a score.` | CITED (PPN 002 2025, 10%, M1–M5, eight policy outcomes) |
| 4 | `Tender document ingestion` | `PDF, DOCX, XLSX, PNG and JPEG up to 10MB. Requirements and clauses are extracted from the text layer and become a citation source in their own right, so an answer can point at the wording it is answering. Scanned PDFs are reported honestly as needing OCR, which CrowMark does not do.` | UNCITED product spec; explicit negative capability stated |
| 5 | `Bid or no-bid, with reasons` | `A deterministic six-dimension rubric scores how well a published tender fits your organisation, and shows the reason behind each dimension rather than a single opaque number. It is a fit score, not a prediction: it tells you where you match and where you do not, and the decision stays yours.` | UNCITED ("six-dimension"); explicit non-prediction disclaimer |
| 6 | `Answer marking against the rubric` | `A drafted answer is marked for how completely it covers the tender&rsquo;s own published criteria, deterministically and in code. It reports coverage, so you can see which criterion is thin before you submit. It does not estimate a score an evaluator would give, and it never suggests how likely you are to win.` | UNCITED; **explicitly refuses a win-likelihood claim — keep this sentence verbatim** |
| 7 | `Post-award evidence vault` | `Delivery actuals against each commitment, with exactly three deterministic verdicts on the evidence: consistent, discrepancy to investigate, or could not verify. Advisory consistency checks against Companies House, UKAS and Cyber Essentials, an authority-facing report, and a round trip back into the buyer's own Word or Excel file.` | CITED third parties (Companies House, UKAS, Cyber Essentials); UNCITED "exactly three" |
| 8 | `SQ and PQQ from one master set` | `Standard selection questions answered from a reusable master answer set, citing your capability profile: accreditations, insurances, financial standing, policies, case studies and named staff. Offered only above the Procurement Act 2023 section 85 threshold, because below it the question does not arise.` | CITED (s.85). See defects table — s.85 is a *restriction on conditions of participation for below-threshold contracts*, not itself a threshold; the substance is right, the phrase "the section 85 threshold" is imprecise. |

#### Proof figure (2nd and final image on the page)

`<figure class="mt-20">`

| Field | Value |
|---|---|
| `<source>` 1 | `type="image/avif"` `srcset="/Assets/shots/dark/mark-ppn002-themes.avif?v=20260730j"` |
| `<source>` 2 | `type="image/webp"` `srcset="/Assets/shots/dark/mark-ppn002-themes.webp?v=20260730j"` |
| `<img src>` | `/Assets/shots/dark/mark-ppn002-themes.png?v=20260730j` |
| `width` / `height` | `2464` / `880` |
| `loading` / `decoding` | `lazy` / `async` |
| `class` | `w-full h-auto rounded-[20px] border border-black/10` |
| `alt` | `The CrowMark social value screen on a live contract: CrowMark has auto-mapped three PPN 002 missions from the contract's sector, each shown with a checkbox and a recommended tag. Kickstart economic growth, Make Britain a clean energy superpower and Take back our streets are selected; Break down barriers to opportunity is available and unselected.` |

`<figcaption class="text-ca-bg/70 text-sm mt-5">`:

```
PPN 002 missions auto-mapped from the contract&rsquo;s sector, shown with a sample account. Themes stay editable, and at least one must be selected.
```

**Sample-data labelling: INCONSISTENT.** The visible caption says *"shown with a sample account"*.
The `alt` text says *"on a live contract"* and carries **no** sample/demo label. A screen-reader user
is told the opposite of what a sighted reader is told. Recorded in the defects table.

All three asset variants exist on disk.

### 12. `#buyers` — the two sides

Eyebrow: `Both sides of the tender`.
**H2** (`h2.ca-section-title`, with `<br>`):

```
One product.
Two sides of the table.
```

Standfirst (`p.ca-section-desc.max-w-3xl.mx-auto`):

```
Two sides to every procurement: one writes the answers, the other reads them. CrowMark serves both, and sells them separately.
```

**Repeated unit — side card (2 units, deliberately asymmetric)**

| Field | Card 1 | Card 2 |
|---|---|---|
| Classes | `ca-card !p-10 border-l-[3px] border-ca-mark` | `ca-card !p-10 border-l-[3px] border-ca-teal-d flex flex-col justify-between` |
| Eyebrow | `You are here` (dot `!bg-ca-mark`) | `The other side` (dot `!bg-ca-teal-d`) |
| h3 | `CrowMark for Suppliers: answering the questions` | `CrowMark for Buyers: reading the answers` |
| Body | `Find the work, then answer every question that follows, cited to the regulations, to the tender itself and to your own answer library. Tenders, RFPs, RFIs, PQQs and SQs, in the public sector and the private sector. Figures are checked in code rather than generated, and what you commit to stays tracked after award.` | `If you run the competition rather than respond to it, you publish the requirement and read what comes back. That is a different product with a different proposition, a different commercial model and one hard boundary: the AI locates evidence and your panel scores. It has its own page.` |
| Audience line (`p.text-sm.text-white/50`) | `Suppliers of every size, bidding into public bodies and into large corporate procurement teams. Everything else on this page describes this side.` | `Contracting authorities, councils, NHS bodies and universities, and private sector procurement teams.` |
| CTA | none | `See CrowMark for Buyers &rarr;` → `/crowmark-buyers`, class `sv-btn !bg-ca-teal-d !text-ca-bg w-full text-center mt-8` |

Closing note (`p.text-sm.text-white/50.mt-10.max-w-2xl.mx-auto.text-center`):

```
Tender discovery, the PPN 002 social-value weighting, PPN 017 disclosure and Procurement Act section 52 evidencing exist only in public procurement, so they apply to public sector work on either side.
```

The `#buyers` id is retained for external links. The `#private-sector` anchor referenced in the
source comment **does not exist as a link anywhere in the repo** (verified: 0 occurrences in
`js/nav-inject.js`, and the only match in HTML is the comment itself) — no broken-anchor risk.

### 13. `#pricing`

Eyebrow: `Pricing`. **H2**: `From £49/month.`
Standfirst (`p.ca-section-desc.mt-12`):

```
Three plans sized to your team. There is no free plan; every plan starts with a 14-day trial.
```

**Repeated unit — pricing card (3 units)**

| Plan (h3) | Price (`div.text-4xl.font-black.mb-6`) | Body (`p.text-sm.text-ca-bg.mb-10`) | CTA text | CTA href | CTA classes |
|---|---|---|---|---|---|
| `Starter` | `£49` + `<span class="text-sm font-medium text-ca-line/40">/mo</span>` | `3 users. Tender feed, document ingestion, cited drafting, PPN 002 calculation and PDF or DOCX export.` | `Request access` | `/contact?enquiry=limited-access#contact-form` | `sv-btn !bg-ca-bg !text-white w-full text-center` |
| `Pro` | `£149` + `/mo` | `10 users, plus the post-award evidence vault and the authority-facing social-value report. Sized for an SME bid team.` | `Request access` | `/contact?enquiry=limited-access#contact-form` | `sv-btn !bg-ca-mark !text-white w-full text-center` |
| `Portfolio` | `Contact sales` | `Bid volume effectively unlimited, white-label exports, and a named account contact for high-volume bidding teams.` | `Contact sales` | `/contact` | `sv-btn !bg-ca-bg !text-white w-full text-center` |

The Pro card wrapper is `ca-card !bg-white !border-ca-mark !p-12 shadow-2xl scale-105 relative z-10`
with `data-premium-stroke`. **Its "recommended plan" status is conveyed only by white fill, violet
border, 105% scale and centre position. There is no "Most popular" / "Recommended" text.** WCAG 1.4.1.

A source comment (line 664) records enforced bid caps — Starter 5/mo, Pro 25/mo, Portfolio
effectively unlimited — and claims "Copy aligned to enforced numbers". **The visible Starter and Pro
copy states neither cap.** Only the Portfolio card mentions volume.

### 14. Free-tool teaser section (no `id`)

Eyebrow (`span.ca-eyebrow.text-ca-mark`): `Try it now`. **H2**: `PPN 002 Calculator.`

```
Enter a contract value and we apply PPN 002 to size the 10% minimum social-value weighting. No sign-up, no account. Already bidding? Request access to the full CrowMark workspace.
```

| Visible text | href | Classes |
|---|---|---|
| `Run free calculator &rarr;` | `/tools/ppn-002-calculator` | `sv-btn sv-btn-primary !bg-ca-mark !text-ca-bg`, `data-magnetic` |
| `All free tools` | `/tools` | `sv-btn sv-btn-ghost` |

Both targets exist (`tools/ppn-002-calculator/index.html`, `tools/index.html`).

### 15. Final CTA (`section.ca-cta-final.!bg-ca-mark`, no `id`)

**H2** (`h2.text-huge.font-black.tracking-tighter.mb-20.text-ca-bg`):

```
Answered.
```

Sub (`p.text-2xl md:text-4xl font-medium text-ca-bg/60 mb-20 leading-tight`, with `<br/>` and an
inner `<span class="text-ca-bg">`):

```
Find it, answer it, and prove you delivered it.
Access is limited and offered by request.
```

| Visible text | href | Classes | Attributes |
|---|---|---|---|
| `Request access` | `/contact?enquiry=limited-access#contact-form` | `sv-btn !bg-ca-bg !text-white` | `data-cta-pulse` |
| `Book a demo` | `https://calendly.com/crowagent-platform/30min` | `sv-btn sv-btn-ghost !text-ca-bg !border-ca-bg/10` | `target="_blank" rel="noopener"` — no visible/announced new-window cue |

### 16. `#product-faq` — 8 FAQ pairs

**H2** (`h2.ca-section-title.text-center.mb-12`): `Frequently asked questions`

Interaction: **native `<details>` / `<summary>`**, no JavaScript. Each item is
`details.faq-item.border-b.border-white/10.py-6`; the summary is
`summary.text-lg.font-bold.cursor-pointer.list-none.flex.justify-between.items-center.min-h-[44px].py-1`
and ends with a literal `<span class="text-white/70">+</span>` glyph that **does not rotate or change
on open** (unlike the buyers page, which uses a CSS `::after` with a rotate transition). Answers are
`p.mt-4.text-white/70.leading-relaxed`. All items are closed by default; multiple can be open at once.

**Repeated unit — FAQ pair (8 units)**

| # | Question (`<summary>`) | Answer | Evidence |
|---|---|---|---|
| 1 | `Is everything described on this page available today?` | `Yes. Every capability described on this page is live in the product today. Work we have built but not yet released to customers is not listed publicly until it ships, so nothing here is a roadmap item.` | **UNCITED absolute status claim** |
| 2 | `Where do the tenders come from?` | `Three UK sources, ingested from their published feeds: Find a Tender, Contracts Finder and Public Contracts Scotland. The feed is refreshed daily. You filter by sector, value and region, sort the results, and bookmark what you want to come back to.` | CITED (feeds); cadence UNCITED |
| 3 | `Can the AI make up a number in my bid?` | `No. Every £ and % that appears in generated prose has to exist in an allowed-figure set computed from your own data before the draft is released. If it does not, the draft is rejected. The language model is never the source of a figure, and the social-value totals are calculated in code with unit-aware arithmetic. A gate reports the figures traced, the word count and the citations, and approval stays blocked until it passes.` | UNCITED absolute |
| 4 | `Is AI use disclosed to the buyer?` | `Yes. Every AI-assisted draft carries a PPN 017 AI-transparency disclosure, and a person has to approve the answer before it goes to the buyer. CrowMark does not send anything to a buyer portal on your behalf. If no AI key is configured, CrowMark returns nothing rather than a generic fallback answer.` | CITED (PPN 017) |
| 5 | `How is social value calculated?` | `Deterministically, in code. CrowMark uses a curated catalogue of 19 social-value measures, aligned to National TOMs conventions, and applies unit-aware arithmetic against the 2025 PPN 002 model of five missions, M1 to M5, and eight policy outcomes. It is not a full National TOMs implementation, and the AI never computes the total. PPN 002 is dated February 2025 and is mandatory from 1 October 2025, with a 10% minimum social-value weighting. It is a weighting, not a score.` | **Best-cited answer on the page.** PPN 002 dated Feb 2025, mandatory 1 Oct 2025 and the 10% minimum all match the published PPN. "19 measures" is UNCITED. The "not a full National TOMs implementation" hedge is present. |
| 6 | `Can CrowMark read a scanned tender document?` | `No. CrowMark reads PDF, DOCX, XLSX, PNG and JPEG files up to 10MB and extracts requirements and clauses from the text layer, quoting only what is present in the source. A scanned PDF with no text layer is reported as needing OCR, which CrowMark does not perform.` | UNCITED spec; honest negative |
| 7 | `Does the fit score tell me whether I will win?` | `No. CrowMark scores fit and coverage against the tender in front of you and shows the reason behind each component, and the bid or no bid rubric returns pursue, review or pass with the gaps named. The same inputs always give the same result. It is a reading of the tender, not a prediction of the award, and a named person still makes the decision.` | **Load-bearing win-rate refusal — must be carried over verbatim** |
| 8 | `Does CrowMark cover the Procurement Act 2023 KPI duties?` | `CrowMark checks section 52, which applies above an estimated contract value of £5m and expects at least three published KPIs, and section 71, on assessing and publishing performance against them, with an annual roll-up rated red, amber or green. The check is advisory, it never blocks you, and it is not legal advice.` | CITED and consistent with ss.52/71 |

### 17. Complete link inventory — crowmark.html

| Visible text | href | Location |
|---|---|---|
| `Request access` | `/contact?enquiry=limited-access#contact-form` | hero |
| `See pricing &rarr;` | `/pricing?product=mark` | hero |
| `How it works` | `#how-it-works` | sticky nav |
| `Features` | `#features` | sticky nav |
| `Pricing` | `#pricing` | sticky nav |
| `FAQ` | `#product-faq` | sticky nav |
| `See how CrowMark compares to AutogenAI, mytender.io, CleanTender and SwiftBid` | `/compare` | `#what-is-crowmark` |
| `See CrowMark for Buyers &rarr;` | `/crowmark-buyers` | `#buyers` |
| `Request access` | `/contact?enquiry=limited-access#contact-form` | pricing, Starter |
| `Request access` | `/contact?enquiry=limited-access#contact-form` | pricing, Pro |
| `Contact sales` | `/contact` | pricing, Portfolio |
| `Run free calculator &rarr;` | `/tools/ppn-002-calculator` | tool teaser |
| `All free tools` | `/tools` | tool teaser |
| `Request access` | `/contact?enquiry=limited-access#contact-form` | final CTA |
| `Book a demo` | `https://calendly.com/crowagent-platform/30min` | final CTA (external, `target="_blank" rel="noopener"`) |

All internal targets resolve on disk (`contact.html`, `pricing.html`, `compare/`,
`crowmark-buyers.html`, `tools/`, `tools/ppn-002-calculator/`). Nav and footer links are injected at
runtime by `js/nav-inject.js` and are not in this page's source.

### 18. Accessibility / structure findings — crowmark.html

| Finding | Detail |
|---|---|
| Missing / empty `alt` | **None.** Both `<img>` elements carry substantive `alt`. |
| Heading-level skips | **None** (h1 → h2 → h3 only; no h4/h5/h6 anywhere). |
| Sections with no heading element | `#what-is-crowmark` uses `<span class="ca-eyebrow">What is CrowMark?</span>` where a heading belongs. Retrieval and screen-reader outline both lose the section. |
| Non-descriptive link text | `All free tools` → `/tools` and `Contact sales` → `/contact` are borderline but acceptable in context. Three separate `Request access` links all point to the same href, so there is no ambiguous-destination conflict. |
| Broken internal link targets | **None found.** |
| State conveyed only by colour / opacity / position | (a) Pro pricing card recommendation: white fill + violet border + `scale-105` + centre position, no text label. (b) Simulated browser chrome pulsing teal dot and one-third progress bar imply a live loading/connected state with no text equivalent. (c) The four `.h-1.w-12.bg-ca-mark` rules under each capability card are purely decorative but read as a status bar. |
| New-window link | `Book a demo` opens Calendly in a new tab with no announced or visible indication. |
| Mobile gap | The in-page sticky nav is `hidden lg:block`; below 1024px there is no way to jump between sections. |
| Proof-strip semantics | Hero `<li>` items are `<strong>value</strong> label` with no punctuation, so a screen reader reads e.g. "3 sources Find a Tender, Contracts Finder, Public Contracts Scotland" as one run-on phrase. |
| No-JS | Nav and footer are both injected by `js/nav-inject.js`. With JS disabled the page has no navigation and no footer. `no-js-content-fallback.css` covers content visibility only. |

---

## Page — crowmark-buyers.html (`/crowmark-buyers`)

### 1. Document head

| Field | Value |
|---|---|
| `<html>` | `lang="en-GB" data-theme="dark"` |
| `<body>` class | `f8-page f8-product bg-ca-bg-deep` (deliberately **no** `.ca-grain` div) |
| `<title>` | `CrowMark for Buyers \| Locate the evidence \| CrowAgent` |
| `meta description` | `For UK contracting authorities. Locate social value evidence verbatim in every response. The panel scores; the AI never does.` |
| canonical | `https://crowagent.ai/crowmark-buyers` |
| `hreflang en-GB` | `https://crowagent.ai/crowmark-buyers` |
| `hreflang x-default` | `https://crowagent.ai/crowmark-buyers` |
| `theme-color` | `#0A1F3A` |
| favicons / manifest / mask-icon | identical set to `/crowmark` |

#### Open Graph / Twitter

| Tag | Value |
|---|---|
| `og:title` | `CrowMark for Buyers \| Locate the evidence` |
| `og:description` | `For UK contracting authorities. Locate social value evidence verbatim in every response. The panel scores; the AI never does.` |
| `og:type` | `website` |
| `og:url` | `https://crowagent.ai/crowmark-buyers` |
| `og:image` | `https://crowagent.ai/Assets/og/crowmark-buyers.png?v=20260730` (exists on disk) |
| `og:image:alt` | `CrowMark for Buyers \| Locate the evidence` |
| `og:image:width` / `og:image:height` | `1200` / `630` |
| `og:site_name` | `CrowAgent` |
| `og:locale` | `en_GB` |
| `twitter:card` | `summary_large_image` |
| `twitter:site` | `@CrowAgentLtd` |
| `twitter:title` | `CrowMark for Buyers \| Locate the evidence` |
| `twitter:description` | same as `og:description` |
| `twitter:image` | `https://crowagent.ai/Assets/og/crowmark-buyers.png?v=20260730` |

#### Stylesheets and scripts

Same set as `/crowmark` **minus** `product-carousel-2026-05-26.css` (no carousel on this page), plus
a much larger page-scoped inline `<style>` block (lines 105–233) defining `.cb-*` classes:
`.cb-boundary`, `.cb-quote`, `.cb-answer`, `.cb-keyfacts`, `.cb-rail`, `.cb-step`, `.cb-step-num`,
`.cb-step-where`, `.cb-surfaces`, `.cb-surface`, `.cb-bands`, `.cb-band` (+ `--on`/`--risk`/`--breach`/`--none`),
`.cb-spec*`, `.cb-scope*`, `.cb-faq`, `.cb-proof`. The block ends with a
`@media (prefers-reduced-motion: reduce)` opt-out that disables the FAQ chevron transition.

**Migration note:** every colour in that block resolves through a brand token (`--teal`, `--cloud`,
`--steel`, `--mist`, `--surf`, `--border`, `--border2`, `--warn`, `--err`, `--teal-aa`,
`--teal-mix-06`, `--teal-mix-12`) because the site ships a `:root[data-theme=light]` override that
only catches Tailwind utilities. Port the tokens, not the computed values.

### 2. JSON-LD

One block, `@graph` with **three** nodes.

#### Node 1 — `WebPage`

| Field | Value |
|---|---|
| `@id` | `https://crowagent.ai/crowmark-buyers#webpage` |
| `url` | `https://crowagent.ai/crowmark-buyers` |
| `name` | `CrowMark for Buyers` |
| `description` | `CrowMark for Buyers helps UK contracting authorities publish social value requirements, locate evidence verbatim in every response, and monitor committed against delivered social value after award.` |
| `isPartOf` | `{"@id":"https://crowagent.ai/#website"}` |
| `about` | `{"@id":"https://crowagent.ai/crowmark#software"}` |
| `audience` | `{"@type":"Audience","audienceType":"UK contracting authorities and private sector procurement teams"}` |

#### Node 2 — `BreadcrumbList`

| Position | name | item |
|---|---|---|
| 1 | Home | `https://crowagent.ai/` |
| 2 | CrowMark | `https://crowagent.ai/crowmark` |
| 3 | CrowMark for Buyers | `https://crowagent.ai/crowmark-buyers` |

#### Node 3 — `FAQPage`

`@id` `https://crowagent.ai/crowmark-buyers#faq`, `mainEntity` = 6 `Question` nodes. Each JSON-LD
answer is the two visible `<p>` paragraphs concatenated with a single space. Verified 6 = 6 and text
matches. **Note:** the JSON-LD uses `5 million pounds` where the visible FAQ uses `&pound;5m`, and
`£` is spelled out. Otherwise identical.

Questions in order:

1. Does the AI score or rank supplier bids?
2. Does CrowMark for Buyers replace our e-sourcing portal?
3. How is social value handled on the buyer side?
4. Are the quotes it shows us real, or generated?
5. What does it cost?
6. Can it produce our Procurement Act transparency return?

**No `SoftwareApplication` and no `Offer` node** — consistent with the page's "quoted, not listed"
pricing stance.

### 3. Section inventory (document order)

| # | `id` | Element / classes | Band | Heading |
|---|---|---|---|---|
| 01 | `hero` | `section.ca-hero.ca-section-dark`, `data-hero-scale="product"` | dark | h1 |
| 02 | `boundary` | `section.py-[var(--section-y-primary)].ca-section-dark.border-t.border-white/5` | dark | **none — eyebrow + display paragraph** |
| 03 | `what-it-is` | `section.py-[var(--section-y-secondary)].ca-section-light` | light | **none — eyebrow span only** |
| 04 | `how-it-works` | `section.py-[var(--section-y-primary)].ca-section-dark` | dark | h2 |
| 05 | `specimen` | `section.py-[var(--section-y-primary)].ca-section-dark.border-t.border-white/5` | dark | h2 |
| 06 | `workspace` | `section.py-[var(--section-y-primary)].ca-section-dark` | dark | h2 |
| 07 | `delivery` | `section.py-[var(--section-y-primary)].ca-section-dark.border-t.border-white/5` | dark | h2 |
| 08 | `scope` | `section.py-[var(--section-y-primary)].ca-section-light` | light | h2 |
| 09 | `access` | `section.py-[var(--section-y-primary)].ca-section-dark` | dark | h2 |
| 10 | `faq` | `section.py-[var(--section-y-primary)].ca-section-dark.border-t.border-white/5` | dark | h2 |
| 11 | `cta` | `section.py-[var(--section-y-primary)].ca-section-light` | light | h2 |

There is **no sticky in-page sub-navigation** on this page (unlike `/crowmark`).

### 4. Hero (`#hero`)

Backdrop contains only `.ca-hero-grid`; `.ca-hero-glow` is omitted on purpose (it is
`display:none !important` site-wide).

**Eyebrow** (`div.ca-eyebrow`, dot `!bg-ca-teal-d`):

```
For contracting authorities
```

**H1** (`h1.ca-hero-title`, two `<span>` line units):

```
You publish the requirement.
We locate the evidence.
```

**Standfirst** (`p.ca-hero-desc`):

```
Evidence for each published criterion, quoted word for word from the response or left out. Your panel scores; the AI never does.
```

**Hero CTAs** (`div.ca-hero-btns`):

| Order | Visible text | href | Classes | Attributes |
|---|---|---|---|---|
| 1 | `Book a demo` | `/contact?product=buyer-side#contact-form` | `sv-btn sv-btn-primary !bg-ca-teal-d !text-ca-bg` | `data-magnetic`, `data-cta-pulse` |
| 2 | `Bidding instead? See the supplier side &rarr;` | `/crowmark` | `sv-btn sv-btn-ghost` | — |

`?product=buyer-side` is a wire value (different key from `/crowmark`'s `?enquiry=limited-access`).
Both must be preserved exactly.

**Hero proof strip** (`ul[role=list].cb-proof`, 4 `<li>`, `<strong>` renders as a block above the label):

| `<strong>` | Label | Evidence |
|---|---|---|
| `Never scores` | `The panel evaluates` | UNCITED absolute — but self-limiting, safe direction |
| `Verbatim` | `Quotes located, not written` | UNCITED |
| `TOMs themes` | `Committed vs delivered` | Names National TOMs by acronym only, unexpanded, no hedge |
| `s.52 &middot; s.71` | `Procurement Act 2023` | CITED |

### 5. `#boundary` — "The line we do not cross"

Eyebrow (`span.ca-eyebrow` + dot `!bg-ca-teal-d`):

```
The line we do not cross
```

**Display lead — marked up as `<p class="cb-boundary-lead">`, not a heading:**

```
The AI reads.
It never scores.
```

(`<br>` between the two; the second sentence is wrapped in `<em>`.)

Body paragraphs, verbatim and in order:

```
Under the Procurement Act 2023 equal treatment duty, the panel evaluates and scores every response. So the pre-read locates evidence and stops. It sets no mark, changes no mark and suggests no mark, and every criterion it reports carries an advisory label in the interface, not in a footnote.
```

```
There is a second AI step, a consistency check that runs over a completed evaluation and flags where scoring looks uneven. It is advisory in the same way. It never changes a number.
```

```
This is a design constraint rather than a setting. There is no mode in which the software marks a bid for you.
```

**Blockquote** (`blockquote.cb-quote` with `<cite>`) — this is the in-product banner text quoted
verbatim from `council/preread.ts`:

```
AI-generated reading aid, advisory only, not a score. It locates evidence to help you read faster; it does not score, rank, or recommend a mark. Under the Procurement Act 2023 (equal treatment), the panel evaluates and scores every response. No mark is set, changed, or suggested here.
```

`<cite>`:

```
Shown on every pre-read in the product
```

Evidence: CITED (Procurement Act 2023 equal-treatment duty; the Act's equal-treatment duty sits at
s.12(2)/(3) — the page names the duty but not the section, which is a fair general reference). The
`<cite>` attribution is UNCITED in the sense that a reader cannot verify the in-product string.

### 6. `#what-it-is` — answer-first definition

Eyebrow (`span.ca-eyebrow`, not a heading):

```
What is CrowMark for Buyers?
```

Lead (`p.cb-answer-lead`, first sentence in `<strong>`):

```
CrowMark for Buyers is social value requirement and oversight software for UK contracting authorities. You build a requirement pack with a deterministic social value rubric, publish it with your tender, and then locate the evidence for each published criterion inside the responses you receive, quoted verbatim from the supplier's own submitted text. Your evaluation panel scores. After award, commitments are tracked against delivery by TOMs theme, and the Procurement Act 2023 award notice return is produced across your recorded contracts.
```

**Key facts `<dl class="cb-keyfacts">`** — 6 `<div>` rows:

| `<dt>` | `<dd>` | Evidence |
|---|---|---|
| What it is | `Requirement building, evidence location and post-award social value oversight for the buying side of a competition.` | SELF |
| Who it is for | `UK contracting authorities, councils, NHS bodies and universities, and private sector procurement teams running a competition.` | SELF |
| What it is not | `Not an e-sourcing portal and <strong>not a system of record</strong>. It sits alongside the portal you already run your competition in.` | SELF, honest negative |
| Price | `<strong>Quoted, not listed.</strong> A buyer engagement is scoped to your organisation and billed by invoice or purchase order on annual terms. Supplier pricing is published in full, because a seat price is a number we can stand behind.` | SELF |
| The differentiator | `Evidence is <strong>located verbatim</strong> and dropped if it cannot be found in the response. Scoring stays with your panel, by design.` | UNCITED capability |
| The statute | `<strong>Procurement Act 2023</strong>, sections 52 and 71, plus PPN 002 social value and its mandatory 10% minimum weighting. These checks are advisory and are not legal advice.` | CITED |

**Cross-sell line** (`<p style="max-width:60rem;margin:1.5rem auto 0;font-size:1.05rem;">`):

```
Responding to tenders rather than running them?
<a href="/crowmark" style="color:var(--teal);font-weight:600;text-decoration:underline;">CrowMark for Suppliers is a different product with published pricing</a>.
```

Inline `style` attributes on both the `<p>` and the `<a>` — tokenise on migration.

### 7. `#how-it-works` — 4-stage buyer rail

Eyebrow: `The buying side, end to end`. **H2** (`h2.ca-section-title`): `Requirement to return.`
Standfirst:

```
Four stages, from the rubric you fix before responses arrive to the award notice return you publish years later.
```

Layout: `div.cb-rail` (vertical rail with top/bottom hairlines), each stage
`div.cb-step` with `div.cb-step-num`, `h3`, one or two `<p>`, and a
`span.cb-step-where` (monospace, teal) naming the real product surface.

**Repeated unit — buyer workflow stage (4 units)**

| Num | h3 | Paragraph 1 | Paragraph 2 | `.cb-step-where` | Evidence |
|---|---|---|---|---|---|
| `01` | `Fix the rubric before the responses arrive` | `Build a social value requirement pack with a deterministic rubric: the measures, the weighting and how each will be evidenced, settled in advance. The basis of assessment is written down before anyone has read a bid.` | `Requirement packs are reusable, so the same measure means the same thing across directorates and across competitions.` | `Requirements &middot; requirement packs` | UNCITED capability. An earlier "under ten minutes to define" time claim was removed on 2026-07-30 as unmeasured — do not reinstate. |
| `02` | `Read the responses against what you published` | `Open an evaluation against a requirement pack and a tender reference. For each published criterion, the pre-read locates the passages in that supplier's response that speak to it, quoted verbatim and dropped if they cannot be located in the source text.` | `Your panel then scores. The pre-read is a reading aid and is labelled as one on every criterion; the consistency check that runs afterwards is advisory and never changes a number.` | `Evaluations &middot; evaluation pre-read` | UNCITED capability; strong non-scoring disclaimer |
| `03` | `Hold the winner to what they promised` | `Record the awarded contract and its social value commitments, then track delivery against them. Committed against delivered rolls up across the awarded estate by TOMs theme and is RAG rated, and under-delivery is raised as an alert rather than left to be noticed in a quarterly pack.` | `Suppliers carry a rolling delivery track record across your contracts, so repeated under-delivery is visible across the estate rather than only inside the one contract it happened on.` | `Contracts &middot; Suppliers &middot; Portfolio &middot; oversight` | UNCITED; TOMs unexpanded |
| `04` | `Produce the return, and the reports underneath it` | `An award notice return is assembled across your recorded contracts for you to review and publish, and the underlying reports export for a committee pack or a scrutiny request. The section 52 and section 71 checks are applied as advisory steps, and are not legal advice.` | (none) | `Transparency &middot; Reports and exports` | CITED (ss.52/71) |

### 8. `#specimen` — the CSS-drawn pre-read illustration

Eyebrow: `What a pre-read looks like`. **H2**: `One criterion. One located quote.`
Standfirst:

```
The pre-read reports per criterion, and every card it produces carries the advisory label below.
```

**This is not an image.** It is `<figure class="m-0" role="group" aria-label="Illustration of the
evaluation pre-read layout. This is a drawing, not a screenshot of the product.">` containing a
`div.cb-spec` built entirely from CSS.

| Slot | Class | Verbatim content |
|---|---|---|
| Criterion label | `.cb-spec-crit` | `Criterion 3.2 &middot; Local employment` |
| Advisory chip | `.cb-spec-chip` | `Advisory, not a score` |
| Found label | `.cb-spec-found` | `Evidence located in the response` |
| Quote | `.cb-spec-quote` | `Two apprenticeship starts in the first contract year, both recruited from the borough, with a named site supervisor accountable for completion.` |
| Citation | `.cb-spec-cite` | `Located verbatim &middot; response section 4.1, page 12` |
| Footer | `.cb-spec-foot p` | `No mark is set, changed, or suggested here. The panel evaluates and scores this response.` |

Caption (`p.cb-spec-caption`, outside the `<figure>`):

```
An illustration of the layout, not a screenshot. The criterion and quote above are written for this page; they are not from a real bid, and no real supplier response is shown anywhere on this site.
```

**Sample/demo labelling: EXEMPLARY.** Labelled as an illustration three times — in the eyebrow-adjacent
copy, in the figure's `aria-label` (accessible name), and in the visible caption. This is the model
the `/crowmark` PPN 002 figure should follow.

**No product screenshot exists on this page at all** (0 `<img>` elements). The head comment records
why: the `/public-sector` surfaces are fetched server-side through the BFF proxy and the screenshot
harness sends no `BFF_SERVICE_TOKEN`, so every capture renders "Your session has expired".

### 9. `#workspace` — eight surfaces

Eyebrow: `The workspace`. **H2**: `Eight surfaces, one thread.`
Standfirst: `Every screen in the buyer workspace, and what each one is for.`

Layout: `div.cb-surfaces` (2-column at `md`), each `div.cb-surface` = `h3` + `p`, hairline-separated.

**Repeated unit — workspace surface (8 units; count verified = 8, matches the heading)**

| # | h3 | Body | Evidence |
|---|---|---|---|
| 1 | `Social value oversight` | `Committed against delivered social value across your awarded contracts and suppliers, by TOMs theme, with under delivery raised as an alert.` | UNCITED; TOMs unexpanded |
| 2 | `Requirements` | `Social value requirement packs. Define the measures and the weighting for a tender before responses arrive.` | UNCITED |
| 3 | `Evaluations` | `Score supplier bids against a requirement rubric. Scores are evaluator set; the AI consistency check is advisory only and never changes a number.` | UNCITED |
| 4 | `Evaluation pre-read` | `A reading aid that locates evidence in a response against each published criterion. It never scores.` | UNCITED absolute (self-limiting) |
| 5 | `Contracts` | `Awarded contracts and their social value commitments, recorded so delivery has something to be measured against.` | UNCITED |
| 6 | `Suppliers` | `Your supplier directory and rolling delivery track record across the contracts you have awarded.` | UNCITED |
| 7 | `Portfolio` | `Committed against delivered across all contracts, by theme, RAG rated on the bands below.` | UNCITED |
| 8 | `Transparency and reports` | `A Procurement Act 2023 award notice return across your contracts, plus exportable reports for committee and scrutiny.` | CITED (Procurement Act 2023) |

### 10. `#delivery` — RAG bands

Eyebrow: `Delivery monitoring`. **H2**: `Four bands. No flattering rounding.`
Standfirst: `Delivery against commitment is banded on fixed thresholds, per theme and per contract.`

`<ul role="list" class="cb-bands">`, 4 `<li>`, each `span.cb-band-val` + `span.cb-band-lbl`.

**Repeated unit — delivery band (4 units)**

| Value (`.cb-band-val`) | Label (`.cb-band-lbl`) | Modifier class | Value colour token | Evidence |
|---|---|---|---|---|
| `&ge; 95%` | `On track` | `cb-band--on` | `var(--teal)` | UNCITED threshold (product-internal) |
| `80 to 94%` | `At risk` | `cb-band--risk` | `var(--warn)` | UNCITED threshold |
| `&lt; 80%` | `Breached` | `cb-band--breach` | `var(--err)` | UNCITED threshold |
| `Nothing committed` | `No data, never green` | `cb-band--none` | `var(--mist)` | UNCITED, but the honest-default design point |

**Colour-only check: PASSES.** Each band carries a text label as well as a colour, so the RAG state is
not colour-dependent. Good pattern to preserve.

Footnote (`p.text-center.text-sm.text-white/50.mt-10.max-w-2xl.mx-auto`):

```
The rollup and the under delivery detection are calculated in code, never by a language model, from the commitments recorded against your own contracts.
```

**Cross-page consistency:** FAQ 3 on this page restates the same bands as `on track at 95% or above,
at risk from 80%, breached below 80%`. `80 to 94%` and `from 80%` agree; `&ge; 95%` and `95% or
above` agree. No drift.

### 11. `#scope` — what it does / does not do

Eyebrow: `Where it sits`. **H2** (`h2.text-5xl`, with `<br>`):

```
Alongside your portal,
not instead of it.
```

Standfirst: `Your competition keeps running where it runs today. This is the social value layer on top of it.`

Two `div.cb-scope-col` columns. `--is` gets a teal tint + `+` bullet via `::before`;
`--isnt` gets a neutral border + a `−` (U+2212) bullet via `::before`. Both columns carry an `h3`,
so the positive/negative distinction is **not** colour-only — but the `+` / `−` markers themselves are
CSS `content` and are not reliably announced.

**Repeated unit — scope item (12 units across 2 columns)**

| Column (h3) | Item |
|---|---|
| `What it does` | `Builds and publishes a social value requirement with a deterministic rubric` |
| `What it does` | `Locates evidence per published criterion, quoted verbatim from the response` |
| `What it does` | `Gives the panel one place to score against the rubric you published` |
| `What it does` | `Records awarded contracts and the commitments made in them` |
| `What it does` | `Rolls committed against delivered up by TOMs theme, and flags under delivery` |
| `What it does` | `Assembles the Procurement Act 2023 award notice return for you to publish` |
| `What it does not do` | `Score, rank or recommend a mark on any response` |
| `What it does not do` | `Replace Jaggaer, Atamis, In-tend, ProContract or Proactis as your system of record` |
| `What it does not do` | `Publish your notices or receive supplier submissions` |
| `What it does not do` | `Host clarifications or the competition audit trail` |
| `What it does not do` | `Give legal advice; the statutory checks it applies are advisory` |
| `What it does not do` | `Form or publish a view on a supplier's wider standing` |

Named third-party systems (CITED as market context): Jaggaer, Atamis, In-tend, ProContract, Proactis.

### 12. `#access` — commercials

Eyebrow: `Access`. **H2**: `Scoped to your organisation.`
Standfirst (`p.ca-section-desc.max-w-3xl.mx-auto.mt-8`):

```
A buyer engagement is not a seat count, so there is no self-serve price to publish. We publish supplier pricing precisely because that side can be published honestly.
```

Grid `grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto`.

**Card A — `ca-card ca-card-premium border-l-[3px] border-ca-teal-d bg-white/5 !p-12 lg:col-span-2`**

| Slot | Verbatim |
|---|---|
| h3 | `Buyer side` |
| Kicker (`p.text-[11px].font-black.uppercase.tracking-widest`) | `Contracting authorities and private sector procurement teams` |
| Price (`div.text-4xl.font-black`) | `Contact sales` + inner `<span class="block text-sm font-medium text-white/70 mt-2">Scoped to your organisation</span>` |
| Terms (`p.text-sm.text-white/70.mb-6`) | `Billed by invoice or purchase order on annual terms. Tiers scale with organisation size. If you need to buy through a framework, tell us which one and we will confirm what is possible rather than guess.` |
| List label | `Included in every engagement` |

**Repeated unit — inclusion bullet (5 units, marker `&#9684;` in `.font-black.text-ca-teal-d`)**

| Item | Evidence |
|---|---|
| `Requirement builder with a deterministic social value rubric` | UNCITED |
| `Evidence located per published criterion, quoted verbatim` | UNCITED |
| `Evaluation workspace across directorates` | UNCITED |
| `Delivery monitoring against what was promised` | UNCITED |
| `Invoice or PO billing, SSO and SAML, DPA and security review` | UNCITED capability claim (SSO/SAML/DPA asserted as included in *every* engagement) |

Card A CTAs:

| Text | href | Classes |
|---|---|---|
| `Book a demo` | `/contact?product=buyer-side#contact-form` | `sv-btn !bg-ca-teal-d !text-ca-bg` |
| `Read the FAQ` | `#faq` | `sv-btn border border-white/20 !text-white hover:!bg-white/5 transition-colors` |

**Card B — `ca-card border-l-[3px] border-ca-teal-d !p-12`**, h3 `Talk to us if`.

**Repeated unit — qualification bullet (5 units, marker `&bull;`)**

| Item |
|---|
| `You run competitions and evaluate responses` |
| `Social value is scored in your competitions and monitored after award` |
| `You need multi entity or group consolidation` |
| `You need invoice or PO billing, SSO and SAML, or a DPA` |
| `You have to publish a Procurement Act award notice return` |

Card B CTA: `Contact sales` → `/contact?product=buyer-side#contact-form`,
class `sv-btn border border-white/20 !text-white hover:!bg-white/5 w-full text-center mt-10`.

**Deliberately absent:** any price figure, and any named procurement framework. The head comment
records that the G-Cloud 14 / RM6396 claim was removed site-wide on 2026-07-29 because the listing is
conditional and the edition sits behind a `council_edition` flag. **Do not reinstate without a live
listing.**

### 13. `#faq` — 6 FAQ pairs

Eyebrow: `Questions from the buying side`. **H2** (`h2.ca-section-title`): `The six we are asked first.`

Interaction: native `<details>` / `<summary>` inside `div.cb-faq`, no JavaScript. The `+` marker is a
CSS `::after` on `summary` that rotates 45° to an `×` via
`.cb-faq details[open] summary::after{transform:rotate(45deg);}`, with a
`transition:transform .25s cubic-bezier(.4,0,.2,1)` that is disabled under
`prefers-reduced-motion: reduce`. `summary::-webkit-details-marker{display:none}`. `min-height:44px`
on the summary. All closed by default, multiple can be open.

**Repeated unit — FAQ pair (6 units)**

| # | Question | Paragraph 1 | Paragraph 2 | Evidence |
|---|---|---|---|---|
| 1 | `Does the AI score or rank supplier bids?` | `No. Scores are evaluator set. The evaluation pre-read is a reading aid that locates evidence in a response against each published criterion; it does not score, rank, or recommend a mark, and every criterion card carries an advisory label.` | `Under the Procurement Act 2023 equal treatment duty the panel evaluates and scores every response. There is also an AI consistency check on completed evaluations, which is advisory and never changes a number.` | CITED (Procurement Act 2023 equal-treatment duty, unsectioned) |
| 2 | `Does CrowMark for Buyers replace our e-sourcing portal?` | `No. It is not a system of record and it does not run your competition. Notices, tender packs, clarifications, response submission and the audit trail stay in the portal you already use, such as Jaggaer, Atamis, In-tend, ProContract or Proactis.` | `It sits alongside that portal: you build the social value requirement, read the responses against it, and monitor delivery after award.` | CITED (named incumbents) |
| 3 | `How is social value handled on the buyer side?` | `You build a requirement pack with a deterministic rubric, so the weighting and the measures are fixed before responses arrive rather than argued afterwards.` | `After award, commitments on each contract roll up against delivery by TOMs theme and are RAG rated: on track at 95% or above, at risk from 80%, breached below 80%. An authority with nothing committed shows as no data rather than green.` | UNCITED thresholds; TOMs unexpanded and unhedged |
| 4 | `Are the quotes it shows us real, or generated?` | `Located, not generated. Every quote is found verbatim in the supplier's own submitted text and is dropped if it cannot be located there. The pre-read points at evidence in the response; it does not write a summary of what the response might have said.` | (none) | UNCITED absolute ("every quote") |
| 5 | `What does it cost?` | `There is no published buyer price. A buyer engagement is scoped to the organisation rather than sold by seat, and is billed by invoice or purchase order on annual terms, so a single self-serve number would mislead rather than inform.` | `Supplier pricing is published because that side can be published honestly. Where it cannot, we say so instead of guessing.` | SELF |
| 6 | `Can it produce our Procurement Act transparency return?` | `It produces an award notice return across your recorded contracts, which you review and publish. The statutory checks it applies, including section 52 on published KPIs above an estimated value of &pound;5m and section 71 on assessing and publishing performance, are advisory and are not legal advice.` | (none) | CITED and consistent with ss.52/71 |

Trailing link (`p.text-center.mt-16`):
`All frequently asked questions &rarr;` → `/faq`, class `text-xs font-black uppercase tracking-widest text-ca-teal-d`.

### 14. `#cta` — close

Eyebrow: `Next step`. **H2** (`h2.text-5xl.max-w-3xl.mx-auto`):

```
See it against one of your own requirements.
```

Standfirst:

```
A demo runs against a requirement you already publish, so you can judge the pre-read on your own criteria rather than on a sample.
```

| Visible text | href | Classes |
|---|---|---|
| `Book a demo` | `/contact?product=buyer-side#contact-form` | `sv-btn sv-btn-primary !bg-ca-bg !text-white` |
| `I bid for contracts instead &rarr;` | `/crowmark` | `sv-btn sv-btn-ghost !text-ca-bg !border-ca-bg/20` |

### 15. Complete link inventory — crowmark-buyers.html

| Visible text | href | Location |
|---|---|---|
| `Book a demo` | `/contact?product=buyer-side#contact-form` | hero |
| `Bidding instead? See the supplier side &rarr;` | `/crowmark` | hero |
| `CrowMark for Suppliers is a different product with published pricing` | `/crowmark` | `#what-it-is` |
| `Book a demo` | `/contact?product=buyer-side#contact-form` | `#access` card A |
| `Read the FAQ` | `#faq` | `#access` card A |
| `Contact sales` | `/contact?product=buyer-side#contact-form` | `#access` card B |
| `All frequently asked questions &rarr;` | `/faq` | `#faq` foot |
| `Book a demo` | `/contact?product=buyer-side#contact-form` | `#cta` |
| `I bid for contracts instead &rarr;` | `/crowmark` | `#cta` |

All targets resolve on disk (`contact.html`, `crowmark.html`, `faq.html`, and the on-page `#faq`
anchor). **No external links at all** on this page — note the asymmetry with `/crowmark`, which sends
"Book a demo" to Calendly while this page sends the identically-labelled button to a contact form.

### 16. Accessibility / structure findings — crowmark-buyers.html

| Finding | Detail |
|---|---|
| Missing / empty `alt` | **N/A — the page contains zero `<img>`, `<picture>`, `<video>` or `<source>` elements.** |
| Heading-level skips | **None** (h1 → h2 → h3 only). |
| Sections with no heading element | Two: `#boundary` (its display-size lead `The AI reads. / It never scores.` is a `<p class="cb-boundary-lead">`) and `#what-it-is` (eyebrow `<span>` only). The page's single most important claim is therefore invisible to a heading-level outline. |
| Non-descriptive link text | `Read the FAQ` → `#faq` and `Contact sales` → `/contact?product=buyer-side#contact-form` are acceptable in context. Three `Book a demo` links share one href, so no ambiguity. |
| Broken internal link targets | **None found.** |
| State conveyed only by colour / opacity / position | **None material.** The RAG bands each carry a text label; the scope columns each carry an `h3`. The `+` / `−` scope markers are CSS `::before` `content`, which is a marginal case: they are redundant with the column headings, so no state is lost. |
| CSS-generated content | `.cb-scope-col--is li::before{content:"+"}`, `.cb-scope-col--isnt li::before{content:"\2212"}`, `.cb-faq summary::after{content:"+"}`. Astro migration must keep these as CSS, not inject them as text nodes, or they will be double-announced. |
| Reduced motion | Correctly handled — the only transition on the page (`.cb-faq summary::after`) is disabled under `prefers-reduced-motion: reduce`. |
| No-JS | Same as `/crowmark`: nav and footer are injected by `js/nav-inject.js`. With JS off there is no navigation and no footer. All page content, including the FAQ, works without JS (native `<details>`). |

---

## Cross-page structural notes for the Astro rebuild

| Concern | Detail |
|---|---|
| Shared shell | Both pages: `<header id="ca-nav" class="sv-nav" role="banner">` and `<div id="ca-footer">`, both filled at runtime by `js/nav-inject.js?v=20260731b`. In Astro these become real layout components; the `?v=` cache-buster convention then stops applying to them. |
| `.ca-grain` | `/crowmark` has `<div class="ca-grain"></div>`; `/crowmark-buyers` deliberately does not. `.ca-grain` is `display:none !important` site-wide by owner decision. **Drop it in both.** |
| `.ca-hero-glow` | `/crowmark` ships one (`!bg-ca-mark/20 ca-chromatic`); it can never paint (`display:none !important`). `/crowmark-buyers` omits it. **Drop it.** |
| Accent colour | `/crowmark` = `ca-mark` (violet). `/crowmark-buyers` = `ca-teal-d`. The distinction is intentional so a visitor on the wrong page notices immediately. |
| Contact wire values | `/crowmark` → `?enquiry=limited-access`; `/crowmark-buyers` → `?product=buyer-side`. Different query keys, both read by `scripts.js`. Preserve exactly. |
| FAQ component | Two different `<details>` implementations: `/crowmark` uses an inline `<span>+</span>` that never changes on open; `/crowmark-buyers` uses a rotating CSS `::after`. Unify on the buyers pattern (it has the reduced-motion opt-out). |
| Repeated-unit counts | `/crowmark`: 4 walkthrough steps, 3 benefit cards, 2 statute cards, 8 capability cards, 2 side cards, 3 pricing cards, 8 FAQ pairs, 2 images = **32 units**. `/crowmark-buyers`: 4 workflow stages, 8 workspace surfaces, 4 delivery bands, 12 scope items, 5 inclusion bullets, 5 qualification bullets, 6 FAQ pairs, 1 CSS specimen = **45 units**. |
| Inline `<style>` | Both pages carry page-scoped CSS in the head (`.cm-*` on `/crowmark`, `.cb-*` on `/crowmark-buyers`). Move to scoped Astro component styles; keep every colour resolving through a brand token because the light theme override only catches Tailwind utilities. |
| Inline `style=` attributes | `/crowmark`: the `/compare` cross-sell paragraph and its anchor. `/crowmark-buyers`: the `/crowmark` cross-sell paragraph and its anchor. Four in total; tokenise them. |
| Sticky sub-nav | Only `/crowmark` has one, and it is `hidden lg:block`. Decide deliberately whether the buyers page gains one. |

---

## Uncited claims and defects

Severity: **P0** = a claim-accuracy or disclosure risk that could mislead a buyer or a regulator.
**P1** = accessibility or accuracy defect that should be fixed in the migration. **P2** = polish.

| # | Page | Exact wording (or element) | Type | Sev | Why it is a risk |
|---|---|---|---|---|---|
| 1 | crowmark.html | ~200 lines of HTML comments shipped to the browser, including `"18 contracts, a 70% win rate and £2.39M ... across 7 won bids"` (lines 195–196), eight internal database table names (`crowmark_contracts`, `bid_learnings`, `crowmark_extracted_requirements`, `crowmark_compliance_matrix`, `bid_answer_library`, `company_frameworks`, `crowmark_lots`, `profiles`, lines 344–352), staging capture notes, spec file paths and `"the field the trade mark conflict is about"` | Information disclosure | **P0** | The string **"70% win rate"** is publicly readable in the delivered page source of a company whose positioning explicitly refuses win-rate claims. Anyone using View Source, or any crawler that indexes raw HTML, sees it, plus the internal schema and an admission of a live trade mark conflict. HTML comments are not private. Strip all of them in the Astro build. |
| 2 | crowmark-buyers.html | Head comment (lines 16–51) discussing the withdrawn `G-Cloud 14 / RM6396` claim, the `council_edition` flag, `BFF_SERVICE_TOKEN`, captures rendering `"Your session has expired"`, and `"the field the trade mark conflict concerns"` | Information disclosure | **P0** | Same class as #1. It publicly documents a framework claim that was pulled, an unfixed harness credential problem, and the trade mark conflict. |
| 3 | crowmark.html | `Every capability in this grid is live in the product today.` and FAQ 1 `Yes. Every capability described on this page is live in the product today. Work we have built but not yet released to customers is not listed publicly until it ships, so nothing here is a roadmap item.` | UNCITED absolute status claim | **P0** | This is the same claim family as the `"Live, paid, and in daily use"` line already stripped from five pages. It is absolute ("every", "nothing here"), unverifiable by a reader, and it is now the **only** mechanism distinguishing shipped from planned — section 07 ("In development") was reduced to a comment with no markup, so there is no visual or structural today-vs-planned signal anywhere. Two capabilities (answer marking, bid/no-bid fit) were promoted into this "live" grid on 2026-07-30 on the strength of a staging route rendering an empty state; that is thinner evidence than the sentence implies. |
| 4 | crowmark.html | PPN 002 figure: `alt="The CrowMark social value screen on a live contract: ..."` vs `figcaption` `"...shown with a sample account."` | Contradictory demo-data labelling | **P0** | A sighted reader is told it is a sample account; a screen-reader user is told it is a **live contract**. The alt carries no sample/demo label at all. Given this site's history of publishing empty-test-tenant screenshots, an alt attribute asserting "live contract" is exactly the wrong error, and attribute text is invisible to the rendered-text constraint checker. Fix the alt to say sample. |
| 5 | crowmark.html | Starter card: `3 users. Tender feed, document ingestion, cited drafting, PPN 002 calculation and PDF or DOCX export.` Pro card: `10 users, plus the post-award evidence vault and the authority-facing social-value report.` | Material omission | **P0** | Source comment at line 664 records enforced caps of **5 bids/month on Starter and 25/month on Pro** and claims "Copy aligned to enforced numbers", but neither cap appears in the visible copy. A prospect reading `£49/mo, 3 users` has no way to know the plan is capped at 5 bids. Only Portfolio mentions volume, and it says `effectively unlimited`. |
| 6 | crowmark.html | Pro pricing card: `ca-card !bg-white !border-ca-mark !p-12 shadow-2xl scale-105 relative z-10` with no `Most popular` / `Recommended` text | Colour/position-only state | **P1** | WCAG 1.4.1. The recommended plan is signalled purely by white fill, violet border, 105% scale and centre position. A screen-reader or high-contrast user gets no signal. It is also a claim-accuracy point: the page steers to Pro without saying so. |
| 7 | crowmark.html | `Bid volume effectively unlimited` (Portfolio) | UNCITED absolute, hedged | **P1** | "Unlimited" hedged by "effectively" is the weakest form of an absolute claim. The source comment says Portfolio is "effectively unlimited" internally too, so the hedge is honest — but a customer cannot see where the limit actually sits. |
| 8 | crowmark.html | `Three things most bid tools will not do.` | UNCITED competitor comparison | **P1** | An unsourced claim about what competitor products do or do not do. `/compare` names AutogenAI, mytender.io, CleanTender and SwiftBid, but this heading generalises to "most bid tools" with no basis. |
| 9 | crowmark.html | `Offered only above the Procurement Act 2023 section 85 threshold, because below it the question does not arise.` | CITED but imprecise | **P1** | s.85 of the Procurement Act 2023 is a **restriction on conditions of participation for regulated below-threshold contracts**, not a threshold in itself; the thresholds are set elsewhere in Part 6 / Schedule 1. The substance (suitability assessment does not arise below threshold) is right, but "the section 85 threshold" is a statute reference a procurement lawyer would query. |
| 10 | crowmark.html | `A deterministic six-dimension rubric ...`; `a curated catalogue of 19 social-value measures`; `exactly three deterministic verdicts` | UNCITED specificity | **P1** | Precise integers (6, 19, 3) presented with no source. Precision reads as evidence; here it is an internal product detail a reader cannot check. They are safe claims, but they must be kept in sync with the product or they become false. |
| 11 | crowmark.html | Hero `Daily / Refreshed feed`; capability card `refreshed daily`; FAQ 2 `The feed is refreshed daily.` | UNCITED cadence, stated 3× | **P1** | A service-level claim repeated three times with no evidence, no "at least", and no failure caveat. If ingestion misses a day the page is factually wrong in three places. |
| 12 | crowmark.html | `SoftwareApplication` `offers: {"price":"49","priceCurrency":"GBP","url":"https://crowagent.ai/pricing"}` | Structured-data / page mismatch | **P1** | The JSON-LD advertises a purchasable £49 offer to search engines while every CTA on the page says `Request access` and the final CTA says `Access is limited and offered by request.` The `Offer` also has no `availability` or `priceValidUntil`. Rich results could show a buy price for a product with no self-serve purchase path. |
| 13 | crowmark.html | `every plan starts with a 14-day trial` (pricing standfirst and keyfacts) | Unreachable offer | **P1** | A 14-day trial is promised twice, but there is no CTA anywhere on the page that starts one — all three plan buttons are request-access or contact-sales forms. |
| 14 | crowmark.html | `#what-is-crowmark` has no heading element; the section label is `<span class="ca-eyebrow">What is CrowMark?</span>` | Structure | **P1** | The page's answer-first retrieval block, which exists specifically to be extracted, has no heading for an extractor or a screen reader to anchor on. |
| 15 | crowmark.html | Simulated browser chrome: `<div class="w-2 h-2 rounded-full bg-ca-teal-d shadow-[0_0_8px_var(--teal)] animate-pulse">` plus a one-third-filled progress bar | Colour-only implied state | **P2** | A pulsing green dot and a progress bar in fake product chrome imply a live, connected, loading system. No text equivalent, and the whole frame is a screenshot. |
| 16 | crowmark.html | `Book a demo` → `https://calendly.com/crowagent-platform/30min`, `target="_blank" rel="noopener"` | A11y | **P2** | Opens a new tab with no visible or announced indication (WCAG 3.2.5). Also, an identically-labelled `Book a demo` on `/crowmark-buyers` goes to an internal contact form instead — inconsistent destination for the same label across the two flagship pages. |
| 17 | crowmark.html | Sticky sub-nav `class="... hidden lg:block"` | Responsive gap | **P2** | Below 1024px there is no in-page navigation on the site's longest product page. |
| 18 | crowmark-buyers.html | `The six we are asked first.` (h2 of `#faq`) | UNCITED social proof | **P1** | Implies an existing population of buyer-side customers or prospects asking these questions. The same page states there is no published buyer price and that buyer engagements are scoped case by case. Nothing evidences that these six are the most-asked, or that anyone has asked. |
| 19 | crowmark-buyers.html | `by TOMs theme` (hero strip, `#what-it-is` lead, workflow stage 03, surfaces 1 and 7, scope item 5, FAQ 3) | Unexpanded, unhedged framework reference (7×) | **P1** | "TOMs" (National Themes, Outcomes and Measures) is never expanded on this page and, crucially, this page carries **none** of the hedging `/crowmark` carries — the supplier page says `aligned to National TOMs conventions` and `It is not a full National TOMs implementation`. The buyer page simply says roll-ups happen "by TOMs theme", which reads as a full TOMs implementation. Given this site has already had to strip an entire framework that did not exist from 54 places, an unhedged framework reference repeated seven times is the highest-risk pattern on the page. |
| 20 | crowmark-buyers.html | `Included in every engagement ... Invoice or PO billing, SSO and SAML, DPA and security review` | UNCITED absolute capability | **P1** | SSO, SAML, a DPA and a security review are asserted as included in **every** engagement, with no evidence and no qualification. These are procurement-gate items a contracting authority will test at due diligence; if SAML is not actually implemented this is a material misstatement to a public body. |
| 21 | crowmark-buyers.html | `no real supplier response is shown anywhere on this site` | UNCITED site-wide absolute | **P1** | An absolute claim about the entire site made on one page. It is currently true (the buyers page has zero images and `/crowmark`'s two screenshots are labelled sample), but nothing enforces it, and any future screenshot on any page silently falsifies it. |
| 22 | crowmark-buyers.html | `#boundary` has no heading; its display lead `The AI reads. / It never scores.` is `<p class="cb-boundary-lead">`. `#what-it-is` likewise has only an eyebrow `<span>`. | Structure | **P1** | The page's central legal-defensibility claim, and its answer-first definition block, are both invisible to a heading outline. For a page whose whole purpose is to be found and read by procurement officers, that is a retrieval and screen-reader defect. |
| 23 | crowmark-buyers.html | `&ge; 95%` / `80 to 94%` / `&lt; 80%` bands; FAQ 3 `on track at 95% or above, at risk from 80%, breached below 80%` | UNCITED thresholds | **P2** | Product-internal thresholds presented as if authoritative. They are internally consistent across the two places they appear, and each band carries a text label so there is no colour-only defect, but no source is named. |
| 24 | crowmark-buyers.html | `<cite>Shown on every pre-read in the product</cite>` | UNCITED attribution | **P2** | The blockquote is presented as the verbatim in-product banner. The head comment says it is quoted from `council/preread.ts`, but the visitor gets only the assertion. Low risk, and the honest direction, but it is a claim about the product a reader cannot check. |
| 25 | Both | Nav and footer are injected by `js/nav-inject.js`; neither page has a `<noscript>` fallback | Robustness | **P2** | With JS disabled both flagship pages render content with no navigation and no footer. The Astro migration removes this class of failure entirely — worth noting as a migration benefit rather than a bug to port. |

### Claims that are correct and must be carried over verbatim

These are the load-bearing honesty statements. Do not soften, shorten or "improve" any of them.

| Page | Wording |
|---|---|
| crowmark.html | `It does not estimate a score an evaluator would give, and it never suggests how likely you are to win.` |
| crowmark.html | `It is a reading of the tender, not a prediction of the award, and a named person still makes the decision.` |
| crowmark.html | `It is a fit score, not a prediction: it tells you where you match and where you do not, and the decision stays yours.` |
| crowmark.html | `It reads the tender rather than predicting the award, and a named person decides.` |
| crowmark.html | `It is not a full National TOMs implementation, and the AI never computes the total.` |
| crowmark.html | `The check is advisory, it never blocks you, and it is not legal advice.` |
| crowmark.html | `It is a weighting, not a score.` |
| crowmark.html | `Scanned PDFs are reported honestly as needing OCR, which CrowMark does not do.` |
| crowmark.html | `There is no free plan; every plan starts with a 14-day trial.` |
| crowmark.html | `Access is limited and offered by request.` |
| crowmark-buyers.html | `This is a design constraint rather than a setting. There is no mode in which the software marks a bid for you.` |
| crowmark-buyers.html | `It sets no mark, changes no mark and suggests no mark, and every criterion it reports carries an advisory label in the interface, not in a footnote.` |
| crowmark-buyers.html | `An illustration of the layout, not a screenshot. The criterion and quote above are written for this page; they are not from a real bid...` |
| crowmark-buyers.html | `An authority with nothing committed shows as no data rather than green.` |
| crowmark-buyers.html | `Located, not generated. Every quote is found verbatim in the supplier's own submitted text and is dropped if it cannot be located there.` |
| crowmark-buyers.html | `There is no published buyer price. ... a single self-serve number would mislead rather than inform.` |

### Verified-consistent statute references

| Reference | Page(s) | Claim as stated | Assessment |
|---|---|---|---|
| Procurement Act 2023 s.52 | both | Above an estimated contract value of £5m, at least three published KPIs | Matches the section. £5m and "at least three" are both correct for s.52. |
| Procurement Act 2023 s.71 | both | Performance against those KPIs must be assessed and published | Matches the section. The red/amber/green scale is CrowMark's own and is attributed to CrowMark, not to the Act. |
| Procurement Act 2023 s.85 | crowmark.html | "the section 85 threshold" | Substance correct (suitability assessment does not arise below threshold); the phrase mislabels s.85 as a threshold. See defect #9. |
| Procurement Act 2023, equal treatment | crowmark-buyers.html | The panel evaluates and scores every response | Correct as a general duty; no section number given (the duty sits in s.12). Acceptable as written. |
| PPN 002 | both | Dated February 2025, mandatory from 1 October 2025, 10% minimum social-value weighting, five missions M1–M5, eight policy outcomes | Matches the published PPN, and matches the project rule that the threshold is always 10% and never 5%. |
| PPN 017 | crowmark.html (10+ occurrences) | AI-transparency disclosure carried on every AI-assisted draft | Correctly framed as a disclosure obligation, not a certification. The absolute "every" is the only exposure. |
| National TOMs | crowmark.html hedged, crowmark-buyers.html unhedged | See defect #19 | Supplier page is safe; buyer page is not. |
