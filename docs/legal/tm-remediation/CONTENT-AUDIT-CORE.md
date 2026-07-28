# CONTENT-AUDIT-CORE

UK trade mark conflict audit (opposing mark: **Crowe**, crowe.com). Scope: **index.html, crowmark.html,
products/index.html, products/crowmark/index.html, pricing.html, about.html, faq.html, resources.html,
roadmap.html, partners.html, contact.html, changelog.html, compare/*.html** (5 files). Report only, no
files edited, no build/tests run.

A companion lexicon-based sweep of the whole site already exists at `SITE-INVENTORY.md` /
`LEXICON-INVENTORY.md` / `AMBIGUOUS.md` in this folder. This document is independent of that sweep: it
reads the assigned files directly, focuses on non-verbal/structural signals first (Tier A), and gives
finished replacement copy rather than a lexicon match list. Overlap with the other documents is expected
and is not a duplication error.

---

## Summary

**Findings by tier (this file set only):**

| Tier | Count (approx., grouped) |
|---|---|
| A — non-verbal / structural (logos, integrations, alt text, image captions) | 9 |
| B — Crowe service-line vocabulary (compliance, audit, assurance, accounting, ESG/sustainability reporting, consultancy, credit control) | 34 |
| C — parked-product references (CrowCash, CrowCyber, CrowESG, CSRD, VSME, Cyber Essentials, late payment) | 61 |
| D — "Qualify. Win. Get paid." three-part narrative | 19 |
| Ambiguous (flagged, not asserted) | 7 |

Counts are grouped by finding, not by every individual HTML tag; several are one finding spanning a
multi-line block (e.g. an entire pricing panel). The raw number of individual lines touched is
considerably higher than the table above.

**The five highest-risk items on these pages, ranked:**

1. **`index.html` line 52 — homepage Organization JSON-LD.** The machine-read entity description for
   the whole site states: *"CrowAgent is a UK compliance-intelligence platform for small and mid-sized
   suppliers... it also offers CrowCash for late-payment recovery, CrowCyber for Cyber Essentials,
   CrowESG for VSME reporting, and a free CSRD checker."* This is the single string most likely to be
   used by a search engine or an LLM to classify what field CrowAgent operates in, and it currently
   reads as a general compliance/accounting-adjacent software company, not a bid and tender vendor.
2. **`faq.html` lines 82 and 163 — FAQPage JSON-LD and matching visible answer to "What is CrowAgent?".**
   *"CrowAgent is a compliance software platform with four products... CrowCyber for Cyber Essentials...
   CrowCash for late-payment recovery... CrowESG for VSME ESG reporting."* This is structured data
   Google can surface directly in search results as the answer to "what is CrowAgent", duplicated in
   the visible FAQ body.
3. **`partners.html` lines 166-168 — the "Accountancy Firms" partner category.** CrowAgent's own
   partner page invites accountancy practices to resell CrowAgent tools to their SME clients under
   their own brand, with "API access for practice-management integration." This puts CrogAgent into a
   direct commercial channel relationship with the exact professional segment Crowe serves.
4. **`about.html` line 183 — the About page hero description.** *"We build the software that helps UK
   SMEs qualify as suppliers, win the contract, and get paid on time, across cyber, procurement, ESG,
   and cash recovery."* This is the second-most-visited page on the site after the homepage, and its
   opening statement defines CrowAgent's mission across four fields, three of which are being parked.
5. **`products/index.html` line 84 — live Xero / QuickBooks / Sage integration copy.** *"Sync Xero,
   QuickBooks or Sage read-only, or drop in a CSV."* `index.html` had this exact class of signal removed
   on 2026-07-28 (see the `TM-REMEDIATION-001` comment at `index.html:600-615`) precisely because
   displaying accounting-software connector names is direct evidence of operating in the accountancy
   field. That same removal was never made on `products/index.html`, so the highest-value single signal
   in the whole audit (a named accounting-software integration) is still live on this page.

---

## index.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| index.html | 7 | `<title>CrowAgent \| Bid, tender and compliance tools for UK SMEs</title>` | B | "compliance tools" broadens the title tag beyond bid/tender into the same field Crowe's own title ("Audit, Tax, Advisory, and Consulting Services") occupies. | `<title>CrowAgent \| UK public sector bid and tender software</title>` |
| index.html | 8, 18 | `Statute-cited compliance and revenue software for UK SMEs. Qualify as a supplier, win contracts, and get paid on time.` (meta description, repeated verbatim as `og:description`) | B + D | "compliance and revenue software" is broad service-line language; the sentence is the site's core Tier D narrative. | `CrowMark is UK bid and tender software for public sector suppliers. Find live tenders, draft grounded answers and score PPN 002 social value, all cited to the source regulation.` |
| index.html | 52 | JSON-LD Organization `description`: `"CrowAgent is a UK compliance-intelligence platform for small and mid-sized suppliers. Its flagship product is CrowMark, a public-sector bid and tender management suite; it also offers CrowCash for late-payment recovery, CrowCyber for Cyber Essentials, CrowESG for VSME reporting, and a free CSRD checker."` | B + C | See summary #1. Machine-read entity description; heaviest single weight for classification of the whole domain. | `"CrowAgent is a UK software company. Its product is CrowMark, a public sector bid and tender management suite that helps UK suppliers find live tenders, draft grounded bid answers and score PPN 002 social value."` |
| index.html | 52 | JSON-LD `knowsAbout`: `["CrowMark bid and tender management","Public procurement","PPN 002 social value","Procurement Act 2023","Find a Tender","Contracts Finder","Cyber Essentials","VSME","CSRD","Late Payment of Commercial Debts (Interest) Act 1998"]` | C | Last four entries name the parked products' subject matter directly in structured data. | `["CrowMark bid and tender management","Public procurement","PPN 002 social value","Procurement Act 2023","Find a Tender","Contracts Finder"]` |
| index.html | 452 | `<span class="nb-eyebrow boxed">UK compliance and revenue, one platform</span>` | B + D | Hero eyebrow, first thing read on the page. | `<span class="nb-eyebrow boxed">UK public sector bid and tender software</span>` |
| index.html | 453 | `<h1>Qualify. Win. <span class="paid">Get&nbsp;paid.</span></h1>` | D | The page's H1, the clearest instance of the parked three-product narrative anywhere on the site. | `<h1>Find it. Win it. <span class="paid">Prove&nbsp;it.</span></h1>` (mirrors the "find, draft, prove delivery" language already used on crowmark.html) |
| index.html | 454 | `<p class="sub">The statute-cited platform UK SMEs use to qualify as suppliers, win contracts, and get paid on time.</p>` | D | Restates the three-part narrative under the H1. | `<p class="sub">The UK bid and tender platform suppliers use to find live tenders, draft grounded answers and prove delivery after award.</p>` |
| index.html | 485 | `<div class="nb-stat"><div class="n">base +8%</div><div class="l">Statutory interest on overdue B2B invoices</div></div>` | C | A homepage stat tile dedicated to CrowCash's statutory-interest figure. | Replace the tile with a CrowMark statistic, e.g. `<div class="nb-stat"><div class="n">06:00</div><div class="l">Daily tender feed refresh from Contracts Finder and Find a Tender</div></div>` |
| index.html | 492-520 | Entire "SPINE" section: eyebrow `The revenue journey`, `<h2>Three jobs. One platform.</h2>`, and three phase cards "Qualify" (links to CrowCyber, CrowESG), "Win" (CrowMark), "Get paid" (links to CrowCash) | C + D | A dedicated homepage section built entirely around the three-product/three-verb narrative, with direct links to all three parked products. | Delete the three-phase layout. Replace with CrowMark's own four-step workflow, already written and approved on `crowmark.html:245-266` ("Find the tender" / "Read the documents" / "Draft the answer" / "Prove the delivery"), reused as a homepage section titled `<h2>Four steps. One workspace.</h2>` |
| index.html | 522-576 | Entire "PRODUCTS" section: `<h2>Four engines, each cited to statute.</h2>` plus four product cards (CrowMark, CrowCyber, CrowCash, CrowESG) with screenshots, descriptions and links | C | Full-detail homepage showcase of all three parked products alongside CrowMark. | Delete the CrowCyber, CrowCash and CrowESG cards (lines 543-571). Keep only the CrowMark card, expand it to occupy the section, and retitle: `<h2>The UK bid suite, built on statute.</h2>` |
| index.html | 578-593 | "STATUTE LEDGER" section: 4 rows, of which 3 (Cyber Essentials, Late Payment Act 1998, CSRD Omnibus I) belong to parked products | C | Statute citations for CrowCyber, CrowCash and CSRD sit next to the one CrowMark row (PPN 002), on a homepage section. | Delete the Cyber Essentials, Late Payment Act 1998 and CSRD Omnibus I rows (lines 587, 589, 590). Replace with CrowMark-only statute rows, e.g. a Procurement Act 2023 s.52/s.71 row and a PPN 017 AI-disclosure row. |
| index.html | 595-626 | "INTEGRATIONS" section | A | Already remediated 2026-07-28 (see the `TM-REMEDIATION-001` comment at lines 600-615, which documents removal of the Xero/QuickBooks/Sage chips). No action needed here; flagged only so the audit record shows it was checked and is clean. | No change needed. |
| index.html | 716-906 | Entire "SHOWCASE" auto-advancing product tour: tabs and panels for CrowMark ("Win"), CrowCyber ("Qualify"), CrowCash ("Get paid"), CrowESG ("Qualify"), including screenshot alt text `CrowCash forecast screen projecting cash recovered from overdue invoices over time` (line 810) and `CrowCyber connectors screen listing read-only integrations that supply Cyber Essentials evidence` (line 782) | C + D | A second, larger homepage showcase repeating the exact three-product/Qualify-Win-Get-paid structure with full screenshots, captions and sr-only figure summaries for CrowCyber and CrowCash. | Delete panels 2-4 (CrowCyber, CrowCash, CrowESG; lines 779-902) and the corresponding tabs (lines 733-750). Keep only the CrowMark panel, or replace the tabbed carousel with a single static CrowMark showcase. |
| index.html | 930-941 | "DEVICES" section: `<h2>Qualify, win and get paid, from anywhere.</h2>` and a phone mockup captioned `CrowCash late payment recovery on a phone` (image alt text, line 938) | C + D | Section heading restates the three-part narrative; the phone screenshot is CrowCash. | Heading: `<h2>Find it, win it, prove it, from anywhere.</h2>`. Replace the CrowCash phone screenshot with a CrowMark mobile screenshot; if none exists yet, drop the phone device from the layout rather than substitute a placeholder. |
| index.html | 960-976 | "FREE TOOLS" section: links to the Cyber Essentials Readiness tool and the VSME materiality tool alongside CrowMark's PPN 002 calculator | C | Two of four linked free tools belong to parked products, on the homepage. | Keep the PPN 002 scorer and the late-payment calculator link (late payment calculator is arguably parked too, see note below) only if CrowMark cross-sells depend on it; otherwise reduce this block to the PPN 002 calculator and the CSRD scope check (CSRD's keep/park status is a separate owner decision, see note at the end of this document). Remove `Cyber Essentials readiness` and `VSME materiality` links (lines 970, 972). |

## crowmark.html

crowmark.html is the flagship page and is largely on-message (bid/tender only). The findings below are
the exceptions.

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| crowmark.html | 181-183 | Sticky sub-nav: `<a href="/crowcyber"...>CrowCyber</a><a href="/crowcash"...>CrowCash</a><a href="/crowesg"...>CrowESG</a>` | C | The flagship product page cross-links to all three parked products in a persistent sticky nav bar shown throughout the page. | Remove the three links; keep only `<a href="/crowmark"...>CrowMark</a>` or replace the sub-nav with in-page section anchors (Features / Pricing / FAQ). |
| crowmark.html | 452-477 | "RELATED PRODUCTS" section: `<h2>The CrowAgent <br/> Portfolio.</h2>` plus three cards for CrowCyber, CrowCash, CrowESG, each with a one-line description | C | A dedicated cross-sell section for the three parked products at the bottom of the flagship page. | Delete the section, or replace it with a "Compare CrowMark" or "Related reading" section pointing at `/compare` and CrowMark blog content only. |
| crowmark.html | 331 | `<h2 class="text-5xl">The KPI duties nobody <br/> reads until audit.</h2>` | Ambiguous | "audit" here refers to a public body auditing a *contract's* KPI performance, not a service CrowAgent offers. Borderline; see Ambiguous section below. | No change recommended pending owner confirmation; if changed, e.g. `The KPI duties nobody reads until it's too late.` |

## products/index.html

**This page's entire premise is the four-product portfolio.** See "Pages that should be deleted
entirely" below for the recommendation.

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| products/index.html | 8 | `<title>Products \| Statute-cited compliance and revenue software \| CrowAgent</title>` | B | Title tag names "compliance and revenue software" for the whole product line. | If the page is kept rather than deleted: `<title>CrowMark \| UK bid and tender software \| CrowAgent</title>` |
| products/index.html | 9 | `<meta name="description" content="Four engines for UK SMEs: CrowMark, the UK bid suite, CrowCyber for Cyber Essentials, CrowCash for late-payment recovery, and CrowESG for VSME reporting. Each cited to statute.">` | C | Meta description names all three parked products. | See page-level recommendation below. |
| products/index.html | 42-43 | `<h1>Four engines, one revenue journey.</h1><p>Qualify as a supplier, win on more than price, and get paid on time. Every product cites the UK statute behind it.</p>` | C + D | H1 and hero paragraph state the four-product/three-verb narrative directly. | See page-level recommendation below. |
| products/index.html | 57 | `<h2>Qualify. Win. Get paid.</h2>` | D | Repeats the H1 narrative as a section heading. | See page-level recommendation below. |
| products/index.html | 71-99 | Three full product rows for CrowCyber, CrowCash, CrowESG (copy, tags, screenshots) | C | Full-detail marketing rows for all three parked products. | See page-level recommendation below. |
| products/index.html | 84 | `Sync Xero, QuickBooks or Sage read-only, or drop in a CSV. Chase on Late-Payment-Act sequences and claim Bank of England base plus 8% with £40 / £70 / £100 fixed sums, through to Letter Before Action.` | **A** | Named accounting-software integrations (Xero, QuickBooks, Sage) still live on this page, the exact signal already removed from index.html on 2026-07-28 for this reason. Highest-value single Tier A signal in the whole audit. | See page-level recommendation below. |
| products/index.html | 103-118 | "STATUTE LEDGER" with 4 rows, 3 for parked products (CrowCyber, CrowCash, CrowESG) | C | Same pattern as index.html's statute ledger. | See page-level recommendation below. |
| products/index.html | 120-134 | "STATS" section including a Late Payment Act statutory-interest tile and a Cyber Essentials controls-checked tile | C | Two of four stat tiles reference parked products. | See page-level recommendation below. |
| products/index.html | 151-162 | Final CTA: `<h2>Qualify. Win. <span class="paid">Get paid.</span></h2>` | D | Repeats the narrative a third time on the same page. | See page-level recommendation below. |

**Page-level recommendation:** delete this page and redirect `/products` to `/crowmark` (see deletion
section below). If the owner instead wants a dedicated `/products` landing page to survive, it would
need to be rewritten from nothing as a CrowMark-only page, at which point it duplicates `crowmark.html`
and there is no remaining reason for it to exist separately.

## pricing.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| pricing.html | 16 | `<meta name="description" content="Transparent, self-serve pricing for UK SMEs across CrowMark, CrowCyber, CrowCash, and CrowESG. Enterprise and public sector scoped on request. 14-day free trial. No credit card required.">` (repeated as `og:description` at line 333) | C | Meta/og description names all three parked products. | `CrowMark pricing for UK public sector bid suppliers, from £39/month. Enterprise and public sector scoped on request. 14-day free trial, no credit card required.` |
| pricing.html | 356-364 | JSON-LD `ItemList` with four `SoftwareApplication` offers: CrowMark, CrowCyber, CrowCash, CrowESG, each with live prices | C | Structured pricing data for all three parked products, machine-read by search engines and shopping/price-comparison crawlers. | Remove the CrowCyber, CrowCash and CrowESG `ListItem` entries (positions 2-4); keep only the CrowMark entry. |
| pricing.html | 399-422 | Product switcher tabs: `Mark`, `Cyber`, `Cash`, `ESG`, `Public sector` | C | Persistent tab bar for switching between all four products' pricing. | Remove the `Cyber`, `Cash` and `ESG` tabs; keep `Mark` and `Public sector` (or drop the tab bar entirely if there is only one product left to switch between). |
| pricing.html | 481-539 | Entire CrowCyber pricing panel: eyebrow `Cyber Essentials`, three price tiers (£49/£99/£199), feature list, free-tool CTA | C | Full CrowCyber pricing detail, live prices, on the public pricing page. | Delete the panel (lines 482-539). |
| pricing.html | 541-597 | Entire CrowCash pricing panel: eyebrow `Credit Control`, three price tiers (£39/£79/£199), copy targeting `Finance teams & accounts receivable leads` (line 572), `connected accounting entities` (lines 564, 574, 584) | **A/B** | "Credit Control" and "accounts receivable leads" are accountancy/finance-department terminology, not bid/tender terminology; "connected accounting entities" is a structural signal of accounting-software integration. This panel is the single most Crowe-adjacent block of copy on the whole pricing page. | Delete the panel (lines 542-597). |
| pricing.html | 599-660 | Entire CrowESG pricing panel: eyebrow `ESG Reporting`, three tiers including `Group / assured` with copy `Consolidated or audit-ready` (line 645) and `assured / audit-ready output beyond the VSME baseline` (line 647) | B + C | "assured" and "audit-ready" are Crowe's own assurance vocabulary, attached to a parked product's enterprise tier. | Delete the panel (lines 600-660). |
| pricing.html | 717-914 | "Compare the details" feature-comparison tables for CrowMark, CrowCyber, CrowCash and CrowESG (lines 773-906 are the three parked-product tables) | C | Detailed feature/plan comparison tables for all three parked products. | Delete the CrowCyber, CrowCash and CrowESG comparison blocks (lines 774-906); keep only the CrowMark table (lines 728-771). |
| pricing.html | 955-973 | "STACKABLE SAVINGS" section: `Build the complete CrowAgent stack across qualify, win and get paid.` (line 969) | D | Multi-product bundle pitch built on the three-verb narrative; with only one product left, "bundle 2+ products" no longer applies. | If the multi-product discount is retired along with the parked products, delete this section. If kept for CrowMark-only add-ons in future, rewrite: `Pay annually and save 10% on any CrowMark plan.` |
| pricing.html | 986 | `The CSRD Checker is free for all users and does not require an account. CrowMark, CrowCyber, CrowCash, and CrowESG are paid products with a 14-day free trial.` | C | FAQ answer names all three parked products by name. | `CrowMark is a paid product with a 14-day free trial. The CSRD Checker is free for all users and does not require an account.` |
| pricing.html | 1028 | `<h2 class="ca-section-title mb-8 text-white">Elite Compliance.</h2>` | B | Section heading for the enterprise tier, using "Compliance" as the category word. Per the approved swap, "compliance" in titles/headings should read "procurement". | `<h2 class="ca-section-title mb-8 text-white">Elite Procurement.</h2>` |

## about.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| about.html | 183 | `CrowAgent translates complex UK statutes into deterministic business intelligence. We build the software that helps UK SMEs qualify as suppliers, win the contract, and get paid on time, across cyber, procurement, ESG, and cash recovery.` | B + C + D | See summary #4. The hero description of the second-most-visited page. | `CrowAgent translates complex UK procurement statutes into deterministic business intelligence. We build CrowMark, the software that helps UK SMEs find live public sector tenders, draft grounded bid answers, and prove delivery after award.` |
| about.html | 194 | `Every feature starts with the actual regulation: PPN 002 for social value, the NCSC Cyber Essentials v3.3 controls for cyber, the Late Payment Act 1998 for cash recovery, EU 2022/2464 for sustainability reporting.` | B + C | Names all three parked products' governing statutes as "every feature". | `Every feature starts with the actual regulation: PPN 002 for social value, the Procurement Act 2023 for delivery evidence, and the Find a Tender and Contracts Finder OCDS feeds for daily tender discovery.` |
| about.html | 198 | `Tools that read the actual regulations: Cyber Essentials v3.3 Danzell controls, the Late Payment Act 1998 statutory interest formula, PPN 002 social value models, the post-Omnibus I CSRD thresholds, and the EFRAG VSME 2024 SME standard.` | C | Same pattern, second card. | `Tools that read the actual regulations: PPN 002 social value models, the Procurement Act 2023 KPI duties (sections 52 and 71), and the Find a Tender / Contracts Finder tender feeds.` |
| about.html | 215-216 | Mission card: `Make compliance accessible` / `Make sustainability and regulatory compliance accessible, affordable, and verifiable for every UK organisation, regardless of size or budget.` | B | "Compliance" used as the category word in a mission statement, plus "sustainability", neither scoped to bid/tender. | `Make public procurement accessible` / `Make winning public sector work accessible, affordable, and verifiable for every UK supplier, regardless of size or budget.` |
| about.html | 220-221 | Vision card: `Compliance in minutes, not weeks` / `A UK where every supplier, team, and SME can answer a regulatory question in minutes, defensibly cited to source, without consultancy fees.` | B | "Compliance" as category word; "consultancy fees" invokes the professional-services field. | `Bids answered in minutes, not weeks` / `A UK where every supplier can answer a tender requirement in minutes, defensibly cited to source, without paying a bid-writing consultancy.` |
| about.html | 248 | `Years spent navigating complex UK regulations, procurement frameworks, and cybersecurity audits from the inside. We saw firsthand the friction UK SMEs face.` | Ambiguous | Founder-bio text about past professional experience, not a current CrowAgent service offering. See Ambiguous section. | No change recommended pending owner confirmation. |
| about.html | 266 | `CrowMark, CrowCyber, CrowCash and CrowESG in live production, with the free CSRD Applicability Checker live.` | C | Company timeline entry naming all three parked products. | `CrowMark in live production.` |
| about.html | 319-320 | `<h2 ...>Four products. <br/> One revenue journey.</h2><p>...Four focused products for social value, cyber, cash recovery and ESG, plus a free CSRD checker, all built on one shared foundation...</p>` | C + D | Section heading and lead-in for the full four-product grid. | `<h2 ...>One product. <br/> Built for the bid.</h2><p>CrowMark for social value, tender discovery and delivery evidence, all built on one shared foundation.</p>` |
| about.html | 322-343 | Full four-product grid: CrowMark, CrowCyber, CrowCash, CrowESG cards | C | Repeats the same four-product showcase pattern found on index.html and products/index.html. | Delete the CrowCyber, CrowCash and CrowESG cards (lines 328-342); keep only the CrowMark card, expanded. |
| about.html | 353 | `<h2 class="ca-section-title text-white">Compliance as a <br/><span class="text-ca-teal">competitive moat.</span></h2>` | B | "Compliance" as the category word in a section heading. | `<h2 class="ca-section-title text-white">Procurement knowledge as a <br/><span class="text-ca-teal">competitive moat.</span></h2>` |
| about.html | 364-365 | Newsletter: `Get monthly UK compliance digests` / `PPN 002, Cyber Essentials, CSRD and late payment, once a month.` | B + C | Newsletter title and description both broaden beyond bid/tender. | `Get monthly UK procurement digests` / `PPN 002 social value, tender-market trends and CrowMark product news, once a month.` |

## faq.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| faq.html | 16 | `<title>CrowAgent FAQ: PPN 002, Cyber Essentials & Pricing</title>` | C | Title tag names Cyber Essentials (CrowCyber). | `<title>CrowAgent FAQ: PPN 002, CrowMark & Pricing</title>` |
| faq.html | 17 | `<meta name="description" content="Frequently asked questions about CrowAgent: PPN 002 social value, Cyber Essentials, late payments, CSRD, ESG reporting, billing, MFA, and data security.">` | B + C | Meta description names three parked products' subject matter plus "ESG reporting". | `Frequently asked questions about CrowAgent: PPN 002 social value, tender discovery, AI grounding, billing, MFA, and data security.` |
| faq.html | 22 | `<meta property="og:description" content="Frequently asked questions about CrowAgent compliance software.">` | B | Short, generic, machine-read og:description calling CrowAgent "compliance software". | `Frequently asked questions about CrowMark, the UK bid and tender software.` |
| faq.html | 82 | FAQPage JSON-LD, `"What is CrowAgent?"` answer: `"CrowAgent is a compliance software platform with four products: CrowMark, the UK bid suite, CrowCyber for Cyber Essentials v3.3 Danzell, CrowCash for late-payment recovery under the Late Payment Act 1998, and CrowESG for VSME ESG reporting and carbon footprints. A free CSRD Applicability Checker tests post-Omnibus I scope in seconds. Every product turns the source regulation into a self-serve compliance output in minutes, not weeks."` | B + C | See summary #2. Structured Q&A data, eligible for a Google featured snippet. | `"CrowAgent is a UK software company. CrowMark is its bid and tender suite: it tracks Contracts Finder and Find a Tender daily, drafts grounded answers from your own submitted bids, calculates PPN 002 social value deterministically, and evidences delivery under the Procurement Act 2023."` |
| faq.html | 163 | Same text, visible in the page body under "What is CrowAgent?" | B + C | Visible duplicate of the JSON-LD answer above. | Same replacement as line 82. |
| faq.html | 204 | `<p class="text-slate-400 text-lg">Detailed guidance on PPN 002, Cyber Essentials, and our compliance engines.</p>` | B + C | Category-page subheading. | `<p class="text-slate-400 text-lg">Detailed guidance on PPN 002, tender discovery, and CrowMark's grounding engine.</p>` |
| faq.html | 209-215 | Full FAQ entry: "What is Cyber Essentials v3.3 (Danzell)?" with a paragraph describing CrowCyber | C | Dedicated FAQ entry for a parked product. | Delete the entry, or move it to a CrowCyber-specific FAQ if that product keeps its own (non-indexed) page. |
| faq.html | 287 | `CrowMark, CrowCyber, CrowCash, and CrowESG each have their own plan tiers, from Free through Starter, Pro, and Portfolio.` | C | Pricing FAQ naming all three parked products. | `CrowMark has its own plan tiers, from Starter through Pro to Portfolio.` |
| faq.html | 310 | `... a drafted tender answer, a suggested Cyber Essentials control answer, or a chase letter.` | C | AI-credits FAQ example list includes a CrowCyber example and a CrowCash example ("chase letter"). | `... a drafted tender answer or a delivery-evidence summary.` |
| faq.html | 360 | `Social value is computed in code from the PPN 002 (February 2025) model with unit-aware arithmetic over CrowMark's curated measure catalogue. Cyber Essentials logic follows the NCSC v3.3 (Danzell) controls. Carbon figures use the DEFRA/DESNZ conversion factors, and statutory interest uses the Bank of England base rate under the Late Payment Act 1998.` | C | "How it works" FAQ answer spans all four products' calculation logic. | `Social value is computed in code from the PPN 002 (February 2025) model with unit-aware arithmetic over CrowMark's curated measure catalogue. Every figure traces to its named source.` |

## resources.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| resources.html | 12, 14, 54 | `<meta name="description" content="Guides, explainers, and analysis on PPN 002 social value, Cyber Essentials, CSRD and late-payment recovery for UK SMEs bidding on public-sector and corporate work.">` (repeated as og:description and twitter:description) | C | Meta/og/twitter description names Cyber Essentials, CSRD and late-payment recovery. | `Guides, explainers, and analysis on PPN 002 social value and UK public sector tender discovery for suppliers bidding on public-sector work.` |
| resources.html | 84-87 | `<h1><span>Regulatory Intelligence</span><span ...>for UK teams.</span></h1>` | B | H1 uses "Regulatory Intelligence" with no bid/tender scoping. | `<h1><span>Bid and Tender Intelligence</span><span ...>for UK suppliers.</span></h1>` |
| resources.html | 90 | `Statute-cited calculators, technical trackers, and deep-dive briefings covering PPN 002 social value, Cyber Essentials, CSRD, Late Payment and VSME, with upgrade paths into CrowESG and the full CrowAgent suite.` | C | Hero paragraph names all three parked products plus CSRD/VSME. | `Statute-cited calculators, technical trackers, and deep-dive briefings covering PPN 002 social value and UK public sector tender discovery, all grounded in the source regulation.` |
| resources.html | 116-160 | Free tools grid: CSRD Applicability Checker, Cyber Essentials Readiness Snapshot (x2 entries), Late Payment Interest Calculator, PPN 002 Calculator, VSME Materiality Light | C | Four of six free-tool cards belong to parked products. | Keep only the PPN 002 Social Value Calculator card (and the CSRD card, pending the separate CSRD keep/park decision noted at the end of this document); remove the Cyber Essentials, Late Payment and VSME cards. |
| resources.html | 176 | `Long-form analysis written by the CrowAgent compliance leads, each article cites the underlying SI or directive, never just secondary commentary.` | B | "Compliance leads" describes the team's function broadly. | `Long-form analysis written by the CrowAgent procurement team, each article cites the underlying SI or directive, never just secondary commentary.` |
| resources.html | 210-248 | "METHODOLOGY" grid: methodology pages for CSRD checker, Cyber Essentials readiness, Late Payment calculator, PPN 002 calculator, VSME materiality | C | Four of five methodology links belong to parked products. | Keep the PPN 002 Calculator methodology link; remove the Cyber Essentials, Late Payment and VSME links (CSRD per the separate keep/park decision). |
| resources.html | 254-268 | "INTEL" section: Cyber Essentials adoption tracker | C | A dedicated live dashboard for a parked product's subject matter. | Remove the tracker card, or replace with a CrowMark-relevant tracker (e.g. a Find a Tender / Contracts Finder volume tracker) if one exists. |
| resources.html | 280-284 | Glossary teaser: `PPN 002, PPN 06/20, TOMs, Oxford SVB, NCSC, Cyber Essentials Plus, Late Payment Act, statutory interest, CSRD, ESRS, Omnibus I, VSME, GRI, TCFD, ISSB, UK SDR, and more.` | B + C | A single sentence lists nearly every parked-product term and several ESG-reporting-framework acronyms (ESRS, GRI, TCFD, ISSB), which are Tier B vocabulary in their own right. | `PPN 002, PPN 06/20, TOMs, Oxford SVB, NCSC, Contracts Finder, Find a Tender, Procurement Act 2023, PPN 017, and more.` |
| resources.html | 293-294 | CTA: `<h2 ...>Start with the workflow <br/> you need now.</h2><p>...CrowMark for public-sector bids, CrowCyber for Cyber Essentials, CrowCash for late payments, CrowESG for VSME ESG reporting.</p>` | C | Final CTA names all three parked products. | `<h2 ...>Start with the tender <br/> you need to win.</h2><p>CrowMark for public-sector bids: find the tender, draft the answer, prove the delivery.</p>` |

## roadmap.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| roadmap.html | 17 | `<meta name="description" content="See what CrowAgent has shipped, what is in flight, and what is coming next across UK bidding, Cyber Essentials, CSRD, ESG, and late-payment recovery.">` | C | Meta description names three parked products' fields. | `See what CrowAgent has shipped, what is in flight, and what is coming next for UK public sector bidding and tender discovery.` |
| roadmap.html | 94 | `...the long-term research shaping the next twelve months of CrowAgent across UK and EU regulatory compliance.` | B | "Regulatory compliance" used as the broad category for the whole roadmap. | `...the long-term research shaping the next twelve months of CrowMark, across UK public procurement regulation.` |
| roadmap.html | 121 | `Four products in production today, serving UK public-sector suppliers, SME finance teams, IT leads, and sustainability reporters, plus a free CSRD applicability checker...` | B + C | Lists all four customer segments (finance teams, IT leads, sustainability reporters) that map to the three parked products. | `CrowMark is in production today, serving UK public-sector suppliers who bid for tenders, plus a free CSRD applicability checker in the Free Tools hub.` (pending the CSRD keep/park decision) |
| roadmap.html | 128-142 | Four roadmap items: CrowMark, CrowCyber, CrowCash, CrowESG, each with a description | C | Full "Phase 1 - Live now" detail for all three parked products. | Delete the CrowCyber, CrowCash and CrowESG items (lines 128-142 minus the CrowMark block at 123-127). |
| roadmap.html | 134-136 | CrowCash roadmap item: `Credit control and accounts receivable for UK SMEs under the Late Payment Act 1998. Three configurable chase cadences, debtor-ageing analytics, a statutory interest calculator, and deterministic payment-likelihood scoring.` | **A/B** | "Credit control and accounts receivable" is accountancy/finance-department vocabulary, the most Crowe-adjacent single description on this page. | Delete along with the rest of the CrowCash item (see row above). |
| roadmap.html | 159-160, 178-179, 248-249, 256 | Repeated mentions of a "Cross-product compliance copilot" reasoning across "PPN 002, CSRD, Cyber Essentials, VSME, and the Late Payment Act" | B + C | A planned future feature explicitly named and scoped around all parked products' statutes. | If the parked products are being removed from the public site, remove this planned feature from the public roadmap too, or rescope it as a CrowMark-only "tender copilot" reasoning across PPN 002 and the Procurement Act 2023. |
| roadmap.html | 209 | `CrowAgent is not a chatbot wrapped around a regulation. Every product runs a deterministic compliance engine first...` | B | "Compliance engine" as the category description for how the AI works, applied to "every product". | `CrowMark is not a chatbot wrapped around a regulation. It runs a deterministic scoring engine first...` |
| roadmap.html | 226 | `Each engine reads the actual regulation it serves: PPN 002 (February 2025) for social value, the NCSC Cyber Essentials v3.3 (Danzell) controls, the Late Payment Act 1998, the post-Omnibus I CSRD thresholds, and EFRAG VSME 2024.` | C | Lists all parked-product statutes as "engines". | `CrowMark reads the actual regulation it serves: PPN 002 (February 2025) for social value, and the Procurement Act 2023 sections 52 and 71 for delivery KPIs.` |
| roadmap.html | 287 | `We shipped CrowESG because VSME reporting was the most-requested adjacent capability to our PPN 002 and CSRD work.` | C | Explains the product-expansion rationale into ESG reporting. | Delete this bullet if CrowESG is being fully parked from public messaging, since it justifies exactly the expansion being reversed. |
| roadmap.html | 294 | `CrowCash sits next to the rest of the compliance suite because the same finance lead who chases overdue invoices also owns the supplier-qualification evidence.` | B | "Compliance suite" plus a description of CrowCash's target user (a finance lead who chases invoices). | Delete this bullet along with the CrowCash roadmap content. |
| roadmap.html | 301 | `CrowAgent does not compete with horizontal ESG software giants on breadth; the edge is UK regulatory accuracy and time-to-output.` | B | Positions CrowAgent within the ESG software market, even while disclaiming full-breadth competition. | Delete, or rescope to a bid-software comparison, e.g. `CrowAgent does not try to out-feature every bid-writing tool on the market; the edge is grounded, statute-cited accuracy.` |
| roadmap.html | 321-322 | `<h3>Generic ESG dashboards</h3><p>Plenty of vendors will sell you a colourful dashboard that maps to nothing. CrowAgent will not. Every metric must trace to a statute.</p>` | B | "What we won't build" card, but the heading itself names ESG as a category CrowAgent is choosing not to compete generically in, which still associates the brand with that market. | Delete this card if CrowESG is parked; the "won't build" framing loses its point once the product it is contrasted against is no longer public. |
| roadmap.html | 325-326 | `<h3>Enterprise carbon platforms</h3><p>CrowESG computes a baseline Scope 1/2/3 footprint on DESNZ 2025 factors for VSME reporting. We are not building a full enterprise carbon-accounting platform with primary-data ingestion at the depth of Watershed, Sweep, or Persefoni.</p>` | B + C | Explicitly names "carbon-accounting platform" as CrowAgent's field (even while disclaiming enterprise depth), and names three carbon-accounting competitors. | Delete this card if CrowESG is parked. |
| roadmap.html | 352-361 | Two "Deadlines on the radar" entries for Cyber Essentials v3.3 and Omnibus I / CSRD | C | Public regulatory-deadline tracker naming parked products. | Remove the Cyber Essentials and Omnibus I entries; keep the PPN 002 entry (line 373-374, on-message). |

## partners.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| partners.html | 21 | `<meta name="description" content="Partner with CrowAgent. Property consultants, bid agencies, law firms, and public sector advisors get co-marketing, revenue share, and priority support.">` | none directly, but see line 75 | The meta description itself is scoped reasonably (no accountancy firms named); flagged only because the og:description below contradicts it. | No change needed to this line specifically. |
| partners.html | 75 | `<meta property="og:description" content="Deliver PPN 002 social value, Cyber Essentials, late-payment recovery, CSRD, and VSME ESG reporting tools to your clients under your own brand.">` | C | Machine-read og:description names all three parked products as white-label reseller offerings. | `Deliver PPN 002 social value tools to your public-sector bidding clients, under your own brand.` |
| partners.html | 109 | `<h1><span>Bring compliance tools</span><span>to your <span ...>clients.</span></span></h1>` | B | H1 of the whole page. | `<h1><span>Bring bid-winning tools</span><span>to your <span ...>clients.</span></span></h1>` |
| partners.html | 114 | `CrowAgent partners with property consultants, bid agencies, law firms, and public sector advisors to deliver high-authority compliance tools under their brand.` | B | Hero description, "compliance tools" as the category. | `CrowAgent partners with bid agencies, property consultants, and public sector advisors to deliver high-authority bid and tender tools under their brand.` |
| partners.html | 155 | `Whether you run client audits, write bids, or guide public sector clients, CrowAgent provides the underlying intelligence.` | B | "Client audits" as a named partner activity. | `Whether you write bids, advise on procurement, or guide public sector clients, CrowMark provides the underlying intelligence.` |
| partners.html | 159-160 | `<h3>IT & Managed Service Providers</h3><p>Add automated Cyber Essentials v3.3 readiness and evidence packs to your client audit services with white-label PDF reports.</p>` | B + C | An entire partner-type card built around CrowCyber and "client audit services". | Delete this card. |
| partners.html | 166-168 | `<h3>Accountancy Firms</h3><p>Late-payment recovery and VSME ESG tooling for your SME clients. API access for practice-management integration.</p>` | **A/B/C** | See summary #3. The single highest-risk item on this page: an entire partner category built around reselling CrowCash and CrowESG to accountancy practices, with "practice-management integration" (accountancy-software terminology). | Delete this card entirely. |
| partners.html | 171-172 | `<h3>Public Sector Advisors</h3><p>PPN 002 (CrowMark), Cyber Essentials (CrowCyber), late-payment recovery (CrowCash), and ESG reporting (CrowESG, with a free CSRD Applicability Checker) for your public sector clients. Early access to CrowESG.</p>` | C | Names all three parked products by name plus CSRD. | `<h3>Public Sector Advisors</h3><p>PPN 002 social value scoring (CrowMark) for your public sector bidding clients.</p>` |
| partners.html | 185 | `Tell us about your practice and we'll get back to you within 2 business days. Built for UK SMEs managing PPN 002 social value, Cyber Essentials, late-payment recovery, post-Omnibus I CSRD, or VSME 2024.` | C | Form intro copy names all parked-product subject matter. | `Tell us about your practice and we'll get back to you within 2 business days. Built for UK SMEs bidding for public sector work under PPN 002 social value.` |

**Partner-type dropdown (lines 249-253)** already lists only `Property Consultant`, `Bid Agency`,
`Law Firm`, `NHS/Public Sector Advisor`, `Other`, with no `Accountancy Firm` option, so the dropdown
itself does not need editing once the "Accountancy Firms" card above is removed; the two are currently
inconsistent with each other (the card advertises a segment the form does not even let you select).

## contact.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| contact.html | 152 | `Pick a slot, send an enquiry, or chat with the team. We respond within 3-5 business days. Built for UK SMEs running PPN 002 social value, Cyber Essentials, late-payment recovery, post-Omnibus I CSRD, or VSME 2024.` | C | Hero description names all parked products. | `Pick a slot, send an enquiry, or chat with the team. We respond within 3-5 business days. Built for UK SMEs bidding for public sector work under PPN 002 social value.` |
| contact.html | 220, 222 | Screenshot + caption: `alt="CrowCyber policies screen mapping written policies and evidence to the five NCSC Cyber Essentials controls"` / `<figcaption>...CrowCyber, Cyber Essentials evidence</figcaption>` | A | Product screenshot and alt text for a parked product, shown on the contact page as "what you will see on the call". | Remove this screenshot; keep only the CrowMark screenshot (lines 211-216), or add a second CrowMark screenshot in its place. |
| contact.html | 226, 228 | Screenshot + caption: `alt="CrowCash dashboard listing overdue invoices with statutory interest and fixed compensation owed under the Late Payment Act 1998"` / `<figcaption>...CrowCash, late payment recovery</figcaption>` | A | Same pattern for CrowCash. | Remove this screenshot for the same reason. |
| contact.html | 397-401 | Enquiry-type dropdown: `CrowCyber - Cyber Essentials`, `CrowCash - Late payment recovery`, `CrowESG / CSRD Checker (free)`, `CrowESG - VSME reporting` | C | Contact form lets a visitor select an enquiry type for each parked product by name. | Remove the four parked-product options (lines 398, 399, 400, 401); keep `CrowMark - PPN 002 social value` (line 397), `CrowAgent for Public Sector` (line 402), `Enterprise / volume pricing` and `General question`. |
| contact.html | 443-444 | Newsletter: `<h2>Prefer regulatory updates?</h2><p>Get our monthly compliance digest covering PPN 002, Cyber Essentials, CSRD (Omnibus I), and late payment.</p>` | B + C | Same newsletter pattern as about.html. | `<h2>Prefer regulatory updates?</h2><p>Get our monthly procurement digest covering PPN 002 social value and CrowMark product news.</p>` |

## changelog.html

changelog.html is a historical release log. Treat these findings differently from the other pages: the
underlying events (CrowESG shipping, CrowCyber/CrowCash launching) genuinely happened, and rewriting a
changelog to erase a true historical record is its own credibility risk. The recommendation here is
narrower than elsewhere: fix the forward-facing SEO surface (title, meta, hero) since that is what search
engines and LLMs read as *current* positioning, but leave the dated entries as an honest record, optionally
with a note that those products are no longer part of the public site.

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| changelog.html | 20 | `<title>Changelog \| Release Notes \| CrowAgent</title>` | none | Title itself is fine. | No change needed. |
| changelog.html | 21, 38, 49 | `<meta name="description" content="Public release notes for CrowMark, CrowCyber, CrowCash, CrowESG, CSRD Checker, and the marketing surface. Every shipped change in one feed.">` (repeated as og/twitter description) | C | Forward-facing, machine-read meta/og/twitter description names all three parked products. | `Public release notes for CrowMark and the marketing surface. Every shipped change in one feed.` |
| changelog.html | 82 | `Public release notes across the CrowAgent ecosystem. Every shipped change across CrowMark, CrowCyber, CrowCash, and CrowESG.` | C | Visible hero description, same issue. | `Public release notes for CrowMark. Every shipped change, in one feed.` |
| changelog.html | 97-116 | "CrowESG is live" changelog entry, dated 2026-06-14 | C | Historical entry naming a parked product; low priority to remove per the note above. | Leave as a dated historical entry. If desired, append a one-line note: `CrowESG is no longer offered on the public site.` |
| changelog.html | 139-159 | "Phase 2 launch: CrowCyber and CrowCash" entry, including `CrowCash: credit control and Late Payment recovery from £39/mo` (line 153) | A/B/C | Historical entry; "credit control" is Tier A/B vocabulary but describes a past launch, not a current offering. | Leave as a dated historical entry, same optional note as above. |
| changelog.html | 210 | `Ready to see the future of compliance? <br/> <span class="text-white">Explore the CrowAgent roadmap &rarr;</span></p>` | B | Forward-facing CTA using "compliance" as the category. | `Ready to see what's next for CrowMark? <br/> <span class="text-white">Explore the CrowAgent roadmap &rarr;</span></p>` |

## compare/*.html

This directory (index.html plus the four `crowmark-vs-*.html` pages) is the cleanest set of files in the
audit. It is a bid-software comparison hub for CrowMark specifically, competitors are AutogenAI,
mytender.io, CleanTender and SwiftBid, all genuine bid-software vendors, and the copy stays inside the
bid/tender field throughout. The only finding:

| File | Line | Current text (quoted) | Tier | Why it is a risk | SUGGESTED REPLACEMENT |
|---|---|---|---|---|---|
| compare/crowmark-vs-cleantender.html | 194 | `CrowMark's advantage is breadth and depth on the compliance side: every sector, a hard figure-grounding gate, deterministic PPN 002 maths and post-award delivery evidence.` | B | "Compliance side" used as CrowMark's own claimed area of advantage. Per the approved swap, "compliance" used as a category word can read as "procurement". | `CrowMark's advantage is breadth and depth on the procurement side: every sector, a hard figure-grounding gate, deterministic PPN 002 maths and post-award delivery evidence.` |

Other "compliance"/"audit" strings in this directory (`crowmark-vs-autogenai.html:158` "automated
compliance review", `crowmark-vs-cleantender.html:161` "Compliance Vault", `crowmark-vs-swiftbid.html:159`
"a compliance audit") all describe a **competitor's own product name or feature**, not a CrowAgent service
claim, so per the context rules they are not flagged.

---

## AMBIGUOUS

Per the instructions, these are flagged with reasoning rather than asserted as findings.

1. **`about.html:248`** — `Years spent navigating complex UK regulations, procurement frameworks, and
   cybersecurity audits from the inside.` This is founder-bio text describing the team's *past*
   professional experience before founding CrowAgent, not a service CrowAgent currently sells. Arguments
   for flagging: it associates the founding team's credibility with "audits" in a way a reader could
   generalise into the company's field. Arguments against: the test in the brief is "a service CrowAgent
   offers to the market", and past personal/professional history is not that.

2. **`crowmark.html:331`** — `The KPI duties nobody reads until audit.` "Audit" here means a public body's
   performance audit of a *contract* (the s.52/s.71 KPI duties under the Procurement Act 2023), not an
   accountancy audit and not a CrowAgent service. Arguments for flagging: the bare word "audit" appears in
   an H2 on the flagship product page. Arguments against: it describes what happens to the *buyer's*
   contract, not something CrowAgent offers.

3. **`roadmap.html:121`** — `...the output you stand behind is auditable, not invented.` and
   **`roadmap.html:226`** — `Outputs cite the named instrument so the claim is auditable rather than
   asserted.` "Auditable" here means "verifiable/defensible", describing CrowAgent's own output quality,
   similar in spirit to the approved "audit trail" carve-out for product security features. Arguments for
   flagging: "auditable" is adjacent to Crowe's "audit" service vocabulary and is a claim about the
   product's trustworthiness. Arguments against: it is describing verifiability of a claim, not offering
   an audit service, and reads closer to the approved "audit log/trail" pattern than to a service
   offering.

4. **`resources.html:110`** — `Use them, share the results, then sign up if you want the full audit
   trail.` This matches the explicitly-approved "audit trail = product feature" carve-out almost exactly.
   Included here only for completeness; not recommended for change.

5. **`pricing.html:1032`** — `...you need SSO/SAML, a security review or DPA, SOC 2 evidence, or invoice /
   BACS billing.` "Security review" and "SOC 2 evidence" describe CrowAgent's own security posture being
   verified for enterprise customers, which the brief explicitly says is fine ("Anything describing
   CrowAgent's own security posture to its customers... is FINE, this is a trust statement, not a service
   offering"). Included for completeness; not recommended for change.

6. **`roadmap.html:231`** — `AI drafts are advisory. You review, edit, and approve before a single word
   reaches a bid, a report, or a certification body. The model proposes; you decide.` "Advisory" here
   describes the AI's role in CrowAgent's own product (it proposes, a human decides), not an advisory
   service CrowAgent sells to clients. Included for completeness; not recommended for change.

7. **CSRD Checker's keep/park status.** Several suggested replacements above (index.html free tools,
   about.html, roadmap.html, resources.html) leave the CSRD Applicability Checker in place as a free tool
   while removing CrowCyber/CrowCash/CrowESG references, because other project memory indicates CSRD is
   treated as a distinct, retained free tool (Phase 1, not one of the three products being parked). This
   audit's own instructions list CSRD in the Tier C term list alongside the three parked products. **This
   is a genuine conflict between two sources of guidance and needs an explicit owner decision**: is the
   CSRD Applicability Checker (a) kept on the public site as-is, (b) kept but with all product-suite
   framing removed so it reads as a standalone free tool with no link back to CrowESG, or (c) parked along
   with CrowESG. Every suggested replacement above that mentions CSRD is written on assumption (b); if the
   owner picks (c), every "pending the CSRD keep/park decision" note above should be actioned as a full
   removal too.

---

## PAGES THAT SHOULD BE DELETED ENTIRELY RATHER THAN EDITED

### products/index.html

Every section on this page (hero, product rows, statute ledger, stats, final CTA) exists solely to
showcase the four-product portfolio: CrowMark, CrowCyber, CrowCash, CrowESG. Once the three parked
products are removed, what remains is a single CrowMark product row, a single CrowMark statute-ledger
row and a single CrowMark stat, all of which already appear in full, better-developed form on
`crowmark.html`. There is no unique CrowMark content on this page that does not already exist elsewhere.
It also currently carries the single highest-value unremediated Tier A signal in the audit (the live
Xero/QuickBooks/Sage integration copy at line 84).

**Recommendation:** delete the page and 301-redirect `/products` to `/crowmark`. Remove the `/products`
link from primary navigation (nav markup lives in `js/nav-inject.js`, outside this audit's file scope,
but flagging here so the redirect and the nav change land together).

No other page in this file set has its *entire* premise in the conceded field. `about.html`, `pricing.html`,
`roadmap.html`, `resources.html`, `partners.html`, `faq.html`, `contact.html`, `changelog.html` and
`index.html` all carry substantial legitimate content (company registration details, CrowMark pricing,
CrowMark FAQ answers, contact mechanics, genuine changelog history) alongside the parked-product content
flagged above, so the recommendation for those pages is targeted deletion of specific sections, not
deletion of the page.

---

## Notes on scope and method

- Screenshots and image `alt`/`figcaption` text were read from the HTML source; the referenced image
  files themselves were not opened, since the risk is in the text describing them, not the pixels.
- `js/nav-inject.js` (shared header/footer) is outside this audit's assigned file list; several pages
  reference nav elements that are injected at runtime and are not present in the static HTML source, so
  they could not be audited here. A prior remediation note at `index.html:600-615` confirms the injected
  nav/footer is a separate concern already tracked elsewhere.
- Every suggested replacement above avoids em-dashes, uses plain English, and does not introduce any
  capability, statistic or claim not already stated elsewhere on the site. Where a suggested replacement
  needed a fact CrowAgent does not currently state anywhere in the audited files (for example, a genuine
  CrowMark-only equivalent to a CrowCash mobile screenshot), the recommendation says so explicitly rather
  than inventing one.
