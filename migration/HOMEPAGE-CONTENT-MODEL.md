# Homepage content model

Extracted verbatim from `C:\Users\bhave\Crowagent Repo\crowagent-website\index.html` (6,022 lines).
Extraction only — no source file was modified.

HTML entities are reproduced as they appear in source; the rendered character is given in
brackets where it matters (`&pound;` = £, `&rsquo;` = ’, `&middot;` = ·, `&times;` = ×).

## Section map

| # | `<section>` line | id / class | `<h2>` line | Heading |
|---|---|---|---|---|
| 1 | 1759 | `#sb-market` / `.sb-band` | 1767 | The shape of a UK bid, in four numbers |
| 2 | 2429 | `#oe-engine` / `.oe-sec` | 2434 | The whole lifecycle, not the easy half |
| 3 | 3145 | `#bs-both` / `.bs-sec` | 3150 | The only engine that sits on both sides |
| 4 | 3858 | `#dv-devices` / `.dv-sec` | 3865 | Deadlines do not wait for your desk |
| 5 | 4949 | `#rz-engine` / `.rz-sec` | 4960 | Watch it reason, and watch it hold the gate |
| 6 | 5655 | `.nt-section` (final CTA) | 5661 | See it on your own tender. |

> **Note — a seventh `<h2>` exists.** Line 4104, inside an unnamed `.nt-section` at line 4099
> (the read-only integrations band, between sections 4 and 5). It was not in the brief's list of
> six, so it is documented in the appendix at the end rather than as "Section 7". It carries
> content and one uncited claim, so it must not be dropped in migration.

---

## Section 1 - The shape of a UK bid, in four numbers

**Lines 1759–1844.** Eyebrow `p.sb-eyebrow`, title `h2.sb-title`, standfirst `p.sb-lede`,
four `.sb-cell` stat cells, one `p.sb-source` footnote, plus a decorative contour-line SVG
(`aria-hidden="true"`, no content).

**Eyebrow (line 1766):**

```
The UK procurement market
```

**H2 (line 1767):**

```
The shape of a UK bid, in four numbers
```

**Standfirst (lines 1768–1772):**

```
Public procurement here is not short of opportunity. The pressure sits in the middle of the
lifecycle: the qualification threshold, the written answers, and the duties that begin the
moment a contract is awarded.
```

### Repeated units — 4 stat cells

| # | Value (rendered) | Value (source) | Count-up data attrs | Label (verbatim, `<br>` marked as `/`) | Accent |
|---|---|---|---|---|---|
| 1 | 40,000+ | `40,000+` | `data-sb-value="40000" data-sb-suffix="+"` | tenders published every year / on Contracts Finder and Find a Tender | `#2DD4BF` |
| 2 | 55% | `55%` | `data-sb-value="55" data-sb-suffix="%"` | of suppliers are stopped / at the qualification threshold | `#22D3EE` |
| 3 | 44% | `44%` | `data-sb-value="44" data-sb-suffix="%"` | cite process complexity / as the barrier to bidding | `#A78BFA` |
| 4 | £5m | `&pound;5m` | `data-sb-value="5" data-sb-prefix="&pound;" data-sb-suffix="m"` | the threshold above which / post-award duties begin | `#C77DFF` |

**Source note `p.sb-source` (lines 1800–1804) — applies to all four figures:**

```
Notice volumes: Contracts Finder and Find a Tender. Supplier figures: published UK supplier surveys
reported by CIPS Supply Management and techUK. Threshold: Procurement Act 2023, section 52, advisory
and not legal advice. These figures describe the UK procurement market, not this product&rsquo;s performance.
```

### Evidence flags

| Item | Wording | Flag | Source named on page |
|---|---|---|---|
| 40,000+ tenders/year | "tenders published every year on Contracts Finder and Find a Tender" | CITED | "Notice volumes: Contracts Finder and Find a Tender" |
| 55% of suppliers | "of suppliers are stopped at the qualification threshold" | CITED | "published UK supplier surveys reported by CIPS Supply Management and techUK" (no survey title, year or link) |
| 44% cite complexity | "cite process complexity as the barrier to bidding" | CITED | same as above (no survey title, year or link) |
| £5m threshold | "the threshold above which post-award duties begin" | CITED | "Procurement Act 2023, section 52" |
| Scope disclaimer | "These figures describe the UK procurement market, not this product’s performance." | n/a | self-limiting caveat, already present |

**Links:** none. **Images/video:** none (inline decorative SVG only).

**Job this section does:** establishes the size and the pain-shape of the UK public procurement
market before any product claim is made, so the reader accepts there is a real problem.
**Most important thing in it:** the `p.sb-source` block — it is the only place on the page where
market numbers are attributed, and it explicitly disclaims that these are not product performance
figures.

---

## Section 2 - The whole lifecycle, not the easy half

**Lines 2429–2557.** Eyebrow, h2, standfirst, a 4-button vertical tablist, 4 tab panes
(each: badge, h3, body, CTA link, a titled note block), and 4 matching screenshot panels.

**Eyebrow (line 2433):**

```
One engine, end to end
```

**H2 (line 2434):**

```
The whole lifecycle, not the easy half
```

**Standfirst (lines 2435–2438):**

```
Discovery, qualification, drafting and post-award evidencing in one system, built on the
Procurement Act 2023 and the National TOMs rather than bolted onto them.
```

### Repeated units — 4 tabs / panes

Rail label: `aria-label="Stages of the lifecycle"`. Tab labels: **Discover**, **Answer**,
**Social value**, **Deliver** (each with an inline decorative SVG icon).

| # | Tab / badge | H3 | CTA text | CTA href | Accent |
|---|---|---|---|---|---|
| 1 | Discover | Every UK tender, the day it lands | Explore discovery | `/crowmark` | `#2DD4BF` |
| 2 | Answer | Grounded answers, traceable line by line | Explore drafting | `/crowmark` | `#22D3EE` |
| 3 | Social value | PPN 002 social value, priced and defensible | Explore social value | `/tools/ppn-002-calculator/` | `#A78BFA` |
| 4 | Deliver | The contract does not end at award | Explore delivery | `/crowmark` | `#C77DFF` |

**Pane 1 body (lines 2470–2474):**

```
Around 40,000 notices a year from Contracts Finder and Find a Tender, read at source
across central government, NHS trusts and local authorities, and scored against your own
delivery record.
```

**Pane 2 body (lines 2488–2492):**

```
Drafts against the tender's own published criteria, grounded in your approved answer
library and the statute behind the contract. Your team edits and approves; the engine
does the load-bearing work.
```

**Pane 3 body (lines 2506–2509):**

```
National TOMs measures mapped and monetised against published proxy values. The part of
the bid most suppliers dread becomes a number an evaluator can audit and you can defend.
```

**Pane 4 body (lines 2523–2526):**

```
Commitments carried into delivery, evidence gathered against them, and the reports an
authority expects years later. This is the ground every other bid tool has already ceded.
```

### Repeated units — 4 note blocks (`.oe-note`, one per pane)

| Pane | Note title `.oe-note-t` | Note body `.oe-note-p` (verbatim) |
|---|---|---|
| 1 | Tender fit scoring | Tell it what you bid for once, and every notice arrives already scored against your profile, so you spend the day on the ones that match. |
| 2 | Grounding disclosure on every answer | Every pound and percentage comes from a commitment you recorded, never invented, and a named human reviews and approves before you submit. |
| 3 | Both sides of the table | Authorities build the requirement with the same measures suppliers answer against, so the rubric and the response speak the same language. |
| 4 | Section 52 duties, surfaced early | Above the &pound;5m threshold the Procurement Act 2023 sets minimum KPIs, so what was promised has to be tracked and reported. Advisory, not legal advice. |

### Repeated units — 4 screenshot panels

All four: `loading="lazy" decoding="async"`, `width="1880" height="860"`,
`sizes="(min-width: 1300px) 800px, (min-width: 900px) 58vw, 92vw"`,
`srcset="<name>-sm.webp 1160w, <name>.webp 1880w"`.

| Pane | `src` | `alt` |
|---|---|---|
| 0 | `/Assets/shots/v2/mark-discover-feed.webp` | CrowMark Discover: live Find a Tender notices scored for fit, including an NHS integrated care board service and a North Ayrshire Council contract. |
| 1 | `/Assets/shots/v2/mark-tender-questions.webp` | CrowMark award question drafting, showing the disclosure that answers are grounded only in your own answer library, the published requirement and your confirmed commitments. |
| 2 | `/Assets/shots/v2/mark-social-value-pack.webp` | Building a social value requirement pack: National TOMs measures with their published proxy values and a running estimate. |
| 3 | `/Assets/shots/v2/mark-evidence-tracker.webp` | The CrowMark evidence tracker after award, showing the six stage bid suite, the reporting cadence and the monthly progress report control. |

### Evidence flags

| Item | Wording | Flag | Source named on page |
|---|---|---|---|
| ~40,000 notices/year | "Around 40,000 notices a year from Contracts Finder and Find a Tender" | CITED | sources named inline in the same sentence |
| £5m / section 52 KPI duty | "Above the £5m threshold the Procurement Act 2023 sets minimum KPIs" | CITED | Procurement Act 2023 named; "Advisory, not legal advice" caveat attached |
| Built on statute | "built on the Procurement Act 2023 and the National TOMs rather than bolted onto them" | CITED | statute + framework named (no TOMs edition/year given here) |
| Proxy values | "monetised against published proxy values" | CITED | National TOMs named in the same sentence (no edition/year here) |
| Competitive claim | "This is the ground every other bid tool has already ceded." | **UNCITED** | none — sweeping claim about all competitors |
| Product claim | "Discovery, qualification, drafting and post-award evidencing in one system" | **UNCITED** | none (product self-description) |

**Job this section does:** shows that the product covers the entire procurement lifecycle,
including the post-award half competitors skip, and lets the reader self-select a stage.
**Most important thing in it:** the Deliver pane — post-award section 52 evidencing is the
differentiator the whole page is built on.

---

## Section 3 - The only engine that sits on both sides

**Lines 3145–3305.** Eyebrow, h2, standfirst, two `.bs-row` blocks (supplier, buyer),
a decorative SVG in row 1, a three-group chip diagram in row 2, and a footer line.

**Eyebrow (line 3149):**

```
Both sides of the table
```

**H2 (line 3150):**

```
The only engine that sits on both sides
```

**Standfirst (lines 3151–3154):**

```
The supplier answering and the authority evaluating work from the same rulebook and the
same measures, so a commitment means the same thing whichever chair you are sitting in.
```

### Repeated units — 2 rows

| # | Badge `.bs-badge` | H3 | Link text | Link href | Accent |
|---|---|---|---|---|---|
| 1 | Suppliers | Answer the question, once | CrowMark for suppliers | `/crowmark` | `#2DD4BF` |
| 2 | Public sector | Find the evidence across every response | CrowMark for buyers | `/crowmark-buyers` | `#A78BFA` |

**Row 1 body (lines 3228–3232):**

```
Live tenders from Contracts Finder and Find a Tender, selection questionnaires answered
from your own approved library, and PPN 002 social value priced at the published proxy
values.
```

**Row 2 body (lines 3247–3251):**

```
Publish a requirement with a deterministic social value rubric, then have every response
searched for the evidence behind each measure. Quotes are located word for word, or
dropped, never invented.
```

### Repeated units — 3 chip groups × 4 chips (row 2 art)

| Group label | Chips (in order) |
|---|---|
| Requirement | Contract type and value · Local priorities · National TOMs measures · Weighting and rubric |
| Evaluation | Evidence located · Consistency checks · Panel scoring · Clarifications |
| After award | Committed measures · Delivery tracking · KPI reporting · Transparency pack |

**Section footer `.bs-foot` (line 3301):**

```
One engine, both sides of the table, and almost nothing else in this market does both.
```

### Media

Inline SVG only, no raster images. It has an accessible name/description
(`role="img"`, lines 3164–3166):

- `<title>`: `One CrowAgent engine, shared by both sides`
- `<desc>`: `The CrowAgent mark at the centre of two slowly turning arcs, one for the supplier answering and one for the authority evaluating.`

### Evidence flags

| Item | Wording | Flag | Source named on page |
|---|---|---|---|
| Category-exclusivity claim | "The only engine that sits on both sides" (h2) | **UNCITED** | none — absolute market-uniqueness claim |
| Market-share/competitor claim | "One engine, both sides of the table, and almost nothing else in this market does both." | **UNCITED** | none |
| PPN 002 proxy pricing | "PPN 002 social value priced at the published proxy values" | CITED | PPN 002 named (no edition/date here) |
| Tender sources | "Live tenders from Contracts Finder and Find a Tender" | CITED | sources named inline |
| Behaviour claim | "Quotes are located word for word, or dropped, never invented." | **UNCITED** | none (product behaviour claim, no methodology link) |

**Job this section does:** claims a structural position no competitor holds — the same engine
serving the supplier writing the bid and the authority scoring it.
**Most important thing in it:** the two-sided claim itself, which is stated twice in absolute
terms (h2 and footer) with no evidence anywhere on the page.

---

## Section 4 - Deadlines do not wait for your desk

**Lines 3858–3977.** Eyebrow, h2, standfirst, a prev/next control pair plus one CTA, and a
6-card horizontal rail of device screenshots.

**Eyebrow (line 3864):**

```
Built for how bid teams actually work
```

**H2 (line 3865):**

```
Deadlines do not wait for your desk
```

**Standfirst (lines 3866–3869):**

```
Triage a notice from a train, approve an answer between meetings, and build the full
response at your desk. The same workspace on every screen, not a cut-down companion app.
```

**Controls (lines 3872–3884):**

| Control | Text / label | Target |
|---|---|---|
| Button `#dv-prev` | `aria-label="Previous screen"` (icon only) | `aria-controls="dv-rail"` |
| Button `#dv-next` | `aria-label="Next screen"` (icon only) | `aria-controls="dv-rail"` |
| Link `.dv-cta` | See CrowMark | `/crowmark` |

Rail `aria-label`: `CrowMark on phone and tablet, six screens. Use the arrow keys to move through them.`

### Repeated units — 6 device cards

| # | Tag | H3 | Body copy (verbatim) |
|---|---|---|---|
| 1 | Phone | Triage a notice from a train | Live tenders from Contracts Finder and Find a Tender, already scored for fit before you open the PDF. |
| 2 | Tablet | The scoring model, in the open | Every commitment monetised against published proxy values, with the method printed on the page rather than hidden behind it. |
| 3 | Phone | Bid or no bid, with reasons | A deterministic posture drawn from your own delivery record. It measures fit, and it says so: not a prediction of award. |
| 4 | Tablet | Your answer library, everywhere | Approved answers shared across every contract, so the same question is never written from scratch twice. |
| 5 | Phone | Questionnaires, answered once | Selection questionnaires filled from answers you have already approved, then carried into the next bid that asks again. |
| 6 | Tablet | 28 of 28, before the deadline | The whole questionnaire answered against a live contract, with the reporting duty recorded at the same time. |

### Images — 6

Phones: `width="720" height="1561"`, `srcset="<name>-sm.webp 446w, <name>.webp 720w"`,
`sizes="(min-width: 1300px) 340px, 26vw"`.
Tablets: `width="1100" height="1467"`, `srcset="<name>-sm.webp 682w, <name>.webp 1100w"`,
`sizes="(min-width: 1300px) 540px, 42vw"`. All `loading="lazy" decoding="async"`.

| # | `src` | `alt` |
|---|---|---|
| 1 | `/Assets/shots/devices/dev-m-opportunities.webp` | CrowMark on a phone, listing live Find a Tender notices including an NHS Scotland medicines contract and a North Lanarkshire Council roads framework. |
| 2 | `/Assets/shots/devices/dev-t-methodology.webp` | The CrowMark social value scoring methodology on a tablet, showing how commitments are monetised against National TOMs proxy values across the five PPN 002 missions. |
| 3 | `/Assets/shots/devices/dev-m-fit.webp` | The CrowMark bid or no bid fit panel on a phone, scoring a reablement and home support services tender against a recorded delivery track record. |
| 4 | `/Assets/shots/devices/dev-t-answers.webp` | The CrowMark answer library on a tablet, holding reusable approved answers on social value, mobilisation, carbon reduction and open-book pricing. |
| 5 | `/Assets/shots/devices/dev-m-sq.webp` | A selection questionnaire being answered on a phone in CrowMark, filled from the organisation's own approved answer set. |
| 6 | `/Assets/shots/devices/dev-t-sq.webp` | A selection questionnaire on a tablet at twenty-eight of twenty-eight questions answered, against a live contract with a published deadline. |

### Evidence flags

| Item | Wording | Flag | Source named on page |
|---|---|---|---|
| Tender sources | "Live tenders from Contracts Finder and Find a Tender" | CITED | sources named inline |
| Proxy values | "Every commitment monetised against published proxy values" | CITED (partial) | "published proxy values" — no named publisher **in this section**; only the image `alt` says National TOMs / PPN 002 and `alt` text is not visible copy |
| Five PPN 002 missions | image `alt`: "across the five PPN 002 missions" | CITED | PPN 002 named (alt text only, not visible copy) |
| Fit-not-prediction caveat | "It measures fit, and it says so: not a prediction of award." | n/a | self-limiting caveat, already present — matches the standing no-win-rate rule |
| "28 of 28" | heading "28 of 28, before the deadline" | **UNCITED** | none — reads as a product result; nothing on the page states it is an illustrative screenshot |
| Parity claim | "The same workspace on every screen, not a cut-down companion app." | **UNCITED** | none (product claim) |

**Job this section does:** proves the product is genuinely usable away from the desk and is one
workspace rather than a stripped-down mobile app.
**Most important thing in it:** card 3's explicit refusal to predict an award — the honesty
position the whole brand rests on, stated in visible copy.

---

## Section 5 - Watch it reason, and watch it hold the gate

**Lines 4949–5217.** Eyebrow, h2, standfirst, a simulated console (chrome bar, question block
with published weightings, a 5-step reasoning trace, an evidence graph, a traceability ledger,
two gate states, and a 7-item step jump-nav), a footnote, and one CTA.

**Eyebrow (line 4959):**

```
Run the real engine
```

**H2 (line 4960):**

```
Watch it reason, and watch it hold the gate
```

**Standfirst (lines 4961–4966):**

```
Generic AI writes a confident paragraph. Procurement asks where the number came from. This is
the sequence the answer engine runs on one live award question. Retrieve, ground, compute,
check, cite. Every figure has to land on a commitment somebody recorded, and a named person
still signs it off.
```

**Console chrome (lines 4972–4976):**

| Element | Text |
|---|---|
| `.rz-chrome-name` | `CrowMark &middot; answer engine &middot; ITT ref CF-2026-0417` |
| `.rz-runpill` | Running |

**Question block (lines 4983–4988):**

| Element | Text |
|---|---|
| `.rz-q-tag` | `Award question 4.2 &middot; social value &middot; 10% of the award score` |
| `.rz-q-ghost` | Describe the social value your delivery will create in the borough, with quantified benefits attributable to this contract. |

### Repeated units — 3 published-weighting rows (`.rz-crit`)

| Criterion | Weight |
|---|---|
| Quality of the commitments | 40% |
| Measurement and reporting | 30% |
| Local relevance | 20% |

### Repeated units — 5 trace steps (`ol.rz-trace`)

| # | Badge | Step name | Lead line `.rz-step-say` | Items |
|---|---|---|---|---|
| 1 | 01 | Retrieve | Three sources are in scope, and there is never a fourth. | The rules · PPN 002 and the published ITT ⁄ This tender · question 4.2, weighted at 10% ⁄ Your library · 2 previously approved answers |
| 2 | 02 | Ground | Each candidate figure is looked up against what you actually committed to, not assumed. | T1M1 · 4 new jobs, borough postcodes, 12 months ⁄ T1M2 · proxy £27,000 per job per year ⁄ T1M3 · quarterly reporting to the authority ⁄ *(flagged open)* Local supply chain spend · no recorded commitment |
| 3 | 03 | Compute | The arithmetic runs in code. The model never produces the number. | `4 jobs &times; &pound;27,000 per job per year =` **£108,000** (`data-rz-count`) |
| 4 | 04 | Check | Every figure is walked back to the commitment it rests on. One of the four has nothing behind it. | Traced to 3 recorded commitments ⁄ *(flagged open)* 1 figure untraced · local supply chain spend |
| 5 | 05 | Cite | Citations attach to the figures themselves, so a reviewer can open any one of them. | Chips: T1M1 ⁄ T1M2 ⁄ T1M3 ⁄ National TOMs 2023-24 |

### Repeated units — evidence graph nodes (7)

Panel tag: `Evidence graph`. Idle state text: `Waiting for grounded figures`.

| Row | Node class | Key `.rz-node-k` | Value `.rz-node-v` |
|---|---|---|---|
| Evidence | `rz-commit` | T1M1 | 4 new jobs |
| Evidence | `rz-commit` | T1M2 | &pound;27,000 proxy |
| Evidence | `rz-commit` | T1M3 | Quarterly report |
| Evidence | `rz-untraced` | No record | Local supply chain spend |
| Mid | `rz-figure` | Computed figure | &pound;108,000 |
| Mid | `rz-proxy` | Proxy source | National TOMs 2023-24 |
| Out | `rz-answer` | Drafted answer 4.2 | We will create 4 new jobs in the borough over 12 months, a quantified benefit of &pound;108,000 at the published proxy value. |

### Traceability state (`.rz-state`, lines 5147–5158)

```
Traced to 3 recorded commitments
Nothing in the draft rests on a figure the evidence store has never seen.
```

Ledger — 4 rows:

| Key | Entry |
|---|---|
| T1M1 | 4 new jobs, borough postcodes, 12 months |
| T1M2 | &pound;27,000 per job per year, National TOMs 2023-24 |
| T1M3 | Quarterly delivery report to the authority |
| Open | Local supply chain spend, &pound;2.80 per &pound;100 **removed from draft** |

### Repeated units — 2 gate states

| State | Title | Body (verbatim) |
|---|---|---|
| Locked | Approval locked | 1 figure untraced. The claim comes out, or a named approver records the commitment behind it. The engine cannot clear its own gate. |
| Open | Approval open | Every figure left in the draft traces to a recorded commitment. It goes to a named approver to sign off. A person approves, not the model. |

### Repeated units — 7 step jump buttons (`ol.rz-steps`)

`Question` (0) · `Retrieve` (1) · `Ground` (2) · `Compute` (3) · `Check` (4) · `Cite` (5) · `Gate` (6)

**Footnote `p.rz-foot` (lines 5205–5209):**

```
Worked example on one award question. Proxy values are the National TOMs 2023-24
constants the product prints on its own methodology screen. Weighting follows PPN 002, published
13 February 2025 and mandatory from 1 October 2025. Advisory, not legal advice.
```

**CTA (line 5211):** `How the drafter works` → `/crowmark`

**Images/video:** none. All visuals are inline SVG wires/icons, `aria-hidden="true"`.

### Evidence flags

| Item | Wording | Flag | Source named on page |
|---|---|---|---|
| Illustrative framing | "Worked example on one award question." | n/a | disclosure present in `rz-foot` |
| £27,000 per job per year proxy | "T1M2 · proxy £27,000 per job per year" | CITED | "National TOMs 2023-24 constants" (`rz-foot` + ledger row + graph node) |
| £108,000 computed figure | "4 jobs × £27,000 per job per year = £108,000" | CITED | arithmetic shown on the page from the cited proxy |
| 10% of the award score | "Award question 4.2 · social value · 10% of the award score" | CITED | "Weighting follows PPN 002, published 13 February 2025 and mandatory from 1 October 2025" |
| PPN 002 dates | "published 13 February 2025 and mandatory from 1 October 2025" | CITED | PPN 002 named |
| 40% / 30% / 20% criterion weightings | `.rz-crit` rows | **UNCITED** | none — presented as "the published weighting breakdown" (source comment) but no ITT, authority or document is named; only the general "worked example" disclaimer covers it |
| £2.80 per £100 local supply chain spend | "Local supply chain spend, £2.80 per £100 removed from draft" | **UNCITED** | none — a specific proxy-style rate with no source; the row is labelled "Open"/"removed from draft" but the rate itself is unattributed |
| ITT reference CF-2026-0417 | "CrowMark · answer engine · ITT ref CF-2026-0417" | **UNCITED** | none — a concrete-looking tender reference; not identified as fictitious anywhere except by the general "worked example" line at the far foot of the section |
| "2 previously approved answers" | "Your library · 2 previously approved answers" | **UNCITED** | none (illustrative, covered only by the general worked-example line) |
| Generic-AI comparison | "Generic AI writes a confident paragraph. Procurement asks where the number came from." | **UNCITED** | none (competitor-class claim) |
| Determinism claim | "The arithmetic runs in code. The model never produces the number." | **UNCITED** | none (architecture claim, no link to methodology page from this section) |

**Job this section does:** replaces the "trust our AI" ask with a visible, step-by-step audit trail
and shows the product blocking its own output when a figure cannot be traced.
**Most important thing in it:** the locked gate — "The engine cannot clear its own gate" — which
converts the honesty positioning into an observable mechanism.

---

## Section 6 - See it on your own tender.

**Lines 5655–5685.** Final CTA banner: eyebrow, h2 (with a highlighted span), one paragraph,
two buttons, and a free-tool escape row of two links.

**Eyebrow (line 5660):**

```
Ready when you are
```

**H2 (line 5661) — full text, span marked:**

```
See it on <span class="paid">your own tender.</span>
```

Rendered: `See it on your own tender.` (the trailing full stop is inside the highlighted span)

**Body (lines 5662–5664):**

```
Bring a live notice and we will run it through the engine with you, end to end, on your own evidence. Access is limited and by request.
```

### Repeated units — 4 links

| # | Type | Visible text | href |
|---|---|---|---|
| 1 | `.nt-btn-primary` | Request access | `/contact?enquiry=limited-access#contact-form` |
| 2 | `.nt-btn-secondary` | Book a demo | `/contact` |
| 3 | `.nt-final-free` link | score a bid for social value, free | `/tools/ppn-002-calculator/` |
| 4 | `.nt-final-free` link | how the score is calculated | `/tools/ppn-002-calculator/methodology` |

Free-tool row lead-in text (line 5678): `Or start with no account at all:`

**Images/video:** none (decorative `.nt-fmesh` spans only).

### Evidence flags

| Item | Wording | Flag | Source named on page |
|---|---|---|---|
| Scarcity claim | "Access is limited and by request." | **UNCITED** | none — a business-policy statement, not externally verifiable |
| Offer claim | "Bring a live notice and we will run it through the engine with you, end to end, on your own evidence." | **UNCITED** | none (service promise) |

**Job this section does:** converts, with a high-commitment path (request access / book a demo)
and a zero-commitment path (free calculator) so no reader leaves without a next step.
**Most important thing in it:** the free-tool escape row — it is the only no-account route out of
the page, and it links the methodology page that backs up the section 5 claims.

---

## Appendix - additional `<h2>` band not in the brief's list of six

**Lines 4099–4153, between sections 4 and 5.** Unnamed `.nt-section` with inline styles;
no `id`, no `aria-labelledby`.

**Badge `.nt-badge` (line 4103):**

```
PLUGGED IN, READ ONLY
```

**H2 (lines 4104–4106):**

```
Your evidence already exists. We read it where it lives.
```

### Repeated units — 9 integration chips

All images: `alt=""`, `aria-hidden="true"`, `width="22" height="22"`, `loading="lazy" decoding="async"`.

| # | Visible label | Icon `src` |
|---|---|---|
| 1 | Microsoft 365 | `/Assets/brand/integrations/color-microsoft.svg` |
| 2 | Entra ID SSO | `/Assets/brand/integrations/color-microsoft-entra-id.svg` |
| 3 | Google Workspace | `/Assets/brand/integrations/color-google.svg` |
| 4 | Okta | `/Assets/brand/integrations/color-okta.svg` |
| 5 | Slack | `/Assets/brand/integrations/color-slack.svg` |
| 6 | Teams | `/Assets/brand/integrations/color-microsoft-teams.svg` |
| 7 | Google Drive | `/Assets/brand/integrations/color-google-drive.svg` |
| 8 | Zapier | `/Assets/brand/integrations/color-zapier.svg` |
| 9 | Make | `/Assets/brand/integrations/color-make.svg` |

**Footnote (lines 4148–4150):**

```
Read-only connectors. We never write back to your files or change a setting.
```

**Links:** none.

### Evidence flags

| Item | Wording | Flag | Source named on page |
|---|---|---|---|
| Read-only guarantee | "Read-only connectors. We never write back to your files or change a setting." | **UNCITED** | none — an absolute security/behaviour guarantee with no link to a security or trust page |
| Nine named third-party integrations | Microsoft 365, Entra ID SSO, Google Workspace, Okta, Slack, Teams, Google Drive, Zapier, Make | **UNCITED** | none — third-party brand marks displayed with no statement of which connectors are live vs planned |

**Job this section does:** removes the "we would have to move our evidence into your tool"
objection by asserting the product reads existing systems in place.
**Most important thing in it:** the read-only guarantee, which is the load-bearing security claim
and is currently unsupported by any linked evidence.

---

## Uncited claims - action required

Every number or factual claim below is presented in visible page copy with **no source, footnote
or citation on the page**. Ordered by section.

| # | Section | Type | Exact wording | Line(s) | Why it is a risk |
|---|---|---|---|---|---|
| 1 | 2 — The whole lifecycle | Competitor claim | This is the ground every other bid tool has already ceded. | 2525–2526 | Absolute statement about every competitor in the category |
| 2 | 2 — The whole lifecycle | Product claim | Discovery, qualification, drafting and post-award evidencing in one system | 2436–2437 | Capability claim, no product evidence linked |
| 3 | 3 — Both sides | Category exclusivity | The only engine that sits on both sides | 3150 | "The only" — absolute uniqueness claim in an h2 |
| 4 | 3 — Both sides | Market claim | One engine, both sides of the table, and almost nothing else in this market does both. | 3301 | Restates uniqueness as a market-survey finding |
| 5 | 3 — Both sides | Behaviour claim | Quotes are located word for word, or dropped, never invented. | 3249–3250 | Absolute "never" on model behaviour, no methodology link |
| 6 | 4 — Deadlines | Product result | 28 of 28, before the deadline | 3968 | Reads as an achieved outcome; not labelled as an illustrative screenshot |
| 7 | 4 — Deadlines | Product claim | The same workspace on every screen, not a cut-down companion app. | 3868–3869 | Parity claim, no evidence |
| 8 | 5 — Watch it reason | Weightings | Quality of the commitments 40% / Measurement and reporting 30% / Local relevance 20% | 4993–4995 | Presented as a published weighting breakdown; no ITT, authority or document named |
| 9 | 5 — Watch it reason | Rate/number | Local supply chain spend, &pound;2.80 per &pound;100 | 5156 | A specific proxy-style rate with no source, despite sitting beside cited TOMs figures |
| 10 | 5 — Watch it reason | Reference | ITT ref CF-2026-0417 | 4974 | Concrete-looking live tender reference; only the far-foot "worked example" line implies it is illustrative |
| 11 | 5 — Watch it reason | Number | Your library &middot; 2 previously approved answers | 5010 | Illustrative count with no label at point of use |
| 12 | 5 — Watch it reason | Competitor claim | Generic AI writes a confident paragraph. Procurement asks where the number came from. | 4962 | Claim about a competitor class |
| 13 | 5 — Watch it reason | Architecture claim | The arithmetic runs in code. The model never produces the number. | 5037 | Absolute "never"; no link to the methodology page that would back it |
| 14 | 6 — Final CTA | Scarcity claim | Access is limited and by request. | 5663 | Unverifiable business-policy claim |
| 15 | 6 — Final CTA | Service promise | Bring a live notice and we will run it through the engine with you, end to end, on your own evidence. | 5663 | Delivery promise with no stated scope or terms |
| 16 | Appendix — integrations | Security guarantee | Read-only connectors. We never write back to your files or change a setting. | 4149 | Absolute security guarantee, no trust/security page linked |
| 17 | Appendix — integrations | Third-party marks | Microsoft 365, Entra ID SSO, Google Workspace, Okta, Slack, Teams, Google Drive, Zapier, Make | 4110–4145 | Nine third-party brands shown with no live/planned status |

**Total UNCITED items: 17** (across 5 of the 6 briefed sections plus the appendix band).
Section 1 is the only section with zero uncited items — every figure in it is attributed by
`p.sb-source`, and it carries the explicit disclaimer that the numbers describe the market and
not the product.

### Partially cited — worth a second look

These are marked CITED because the page does name a source, but the citation is thin enough that
it may not survive scrutiny:

| Section | Wording | Gap |
|---|---|---|
| 1 | 55% stopped at the qualification threshold; 44% cite process complexity | Attributed only to "published UK supplier surveys reported by CIPS Supply Management and techUK" — no survey title, year, sample or link |
| 2, 3, 4 | "published proxy values" | National TOMs named, but no edition/year given in those sections; only section 5 pins it to "National TOMs 2023-24" |
| 4 | "the five PPN 002 missions" | Appears only in image `alt` text, which is not visible copy |
