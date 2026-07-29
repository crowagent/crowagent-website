# LEXICON-INVENTORY

**Gate 0 discovery artefact — crowagent-website. Read only; no site content was changed.**

Date of scan: 2026-07-28
Companion documents: `SITE-INVENTORY.md` (routes and architecture), `AMBIGUOUS.md` (unresolved strings).

---

## 1. Method and headline counts

A hyphen-tolerant, case-insensitive, word-boundary regex sweep of the TIER 1 and TIER 2 lexicons was
run over 294 in-scope files. A second pass stripped HTML tags and decoded entities so that phrases
split across markup could still be detected. Every raw match was then classified against the TIER 0
carve-outs.

| Measure | Count |
|---|---|
| Files scanned | 294 |
| Files with at least one raw match | 116 |
| **Raw matches, all tiers** | **685** |
| — raw TIER 1 pattern matches | 655 |
| — raw TIER 2 pattern matches | 6 |
| — raw probe terms (`audit trail`, `audit log`, `compliance matrix`, `audit readiness`, `compliance evidence`) | 24 |
| **Cleared as TIER 0 or otherwise permitted** | **430** |
| — internal ticket identifiers and developer comments (`WS-AUDIT-0xx`, `WEB-AUDIT-1xx`, `CHROME-AUDIT`, prose in CSS/JS comments) | 265 |
| — `account` / `accounts` in the user-account sense | 155 |
| — code identifiers, CSS selectors, form option values (`#accounting`, `[class*="sustainability-intelligence"]`, `value="esg-reporting"`) | 10 |
| **Genuinely prohibited after classification** | **147** |
| — TIER 1 | 142 |
| — TIER 2 | 5 |
| **Ambiguous — routed to `AMBIGUOUS.md`** | **108** |

The raw-to-classified ratio is the headline finding: **685 raw matches reduce to 147 genuinely
prohibited strings**. A naive find-and-replace against the lexicon would touch 4.6× more text than
the mandate requires, and would break internal ticket traceability, CSS selectors, and the user
sign-in vocabulary.

**Second headline finding:** of the 147 prohibited strings, **24 sit in `Assets/svg-mockups/*.svg`
files that no page renders** (see `SITE-INVENTORY.md` §5), and **2 more sit in an orphaned
`Assets/og-image.svg`**. The count that appears on a rendered page is therefore **121**.

## 2. Detection gaps worth recording

Two classes of prohibited string are invisible to a plain word-boundary grep and were found only by
the supplementary passes:

1. **Hyphenated compounds.** `compliance-intelligence platform` appears in three whole-domain
   descriptors (`index.html` JSON-LD, `llms.txt`, `llms-full.txt`) and is missed by a
   `compliance\s+intelligence` pattern. Any future verification gate must treat `-` and whitespace
   as equivalent separators.
2. **Inflections outside the lexicon's own wording.** The TIER 1 list gives `bookkeeping`. The site
   never uses that form — it uses `Bookkeepers` (a heading), `bookkeepers`, and `bookkeeper`. A
   pattern built literally from the lexicon misses all three. Any verification gate must stem the
   list, not match it literally.
3. **Phrases split by markup.** The retired brand phrase is written in source as
   `Sustainability<span class="logo-tag-sep">&bull;</span>Intelligence`. A tag-stripped pass confirms
   this phrase **no longer renders anywhere**; it survives only in four code comments in
   `js/nav-inject.js`, two comments in CSS files, and one CSS selector
   (`styles.css:26671  [class*="sustainability-intelligence"]`). All are TIER 0 code artefacts.

## 3. Genuinely prohibited strings

Surface key: `page-copy` · `heading` · `nav` · `meta` · `structured-data` · `image-alt` · `svg-text`
· `legal-page` · `code-identifier`.

Rows on `privacy.html`, `terms.html`, `cookies.html` and `security.html` are marked `legal-page` and
carry **no proposed replacement** — they are reported for the record and must not be edited.

### 3.1 Whole-domain descriptors and structured data — highest reach

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `index.html` | 52 | compliance-intelligence | 2 | structured-data | `CrowAgent is a UK compliance-intelligence platform for small and mid-sized suppliers.` | `CrowAgent is UK public sector bid and tender software for small and mid-sized suppliers.` | high |
| `llms.txt` | 3 | compliance-intelligence | 2 | page-copy | `CrowAgent is a UK compliance-intelligence platform for small and mid-sized suppliers.` | `CrowAgent is UK public sector bid and tender software for small and mid-sized suppliers.` | high |
| `llms-full.txt` | 3 | compliance-intelligence | 2 | page-copy | `CrowAgent is a UK compliance-intelligence platform for small and mid-sized suppliers.` | `CrowAgent is UK public sector bid and tender software for small and mid-sized suppliers.` | high |
| `llms.txt` | 7 | compliance matrix | 1 (never permitted) | page-copy | `bid-fit and coverage marking, compliance matrix, e-sourcing` | `bid-fit and coverage marking, ITT requirements matrix, e-sourcing` | high |
| `llms-full.txt` | 13 | compliance matrix | 1 (never permitted) | page-copy | `bid-fit and coverage marking, a compliance matrix, e-sourcing` | `bid-fit and coverage marking, an ITT requirements matrix, e-sourcing` | high |
| `llms.txt` | 10 | ESG reporting | 1 | page-copy | `VSME ESG reporting for UK SMEs with a deterministic carbon footprint` | remove entry; CrowESG is not a visible product under the new positioning | medium |
| `llms-full.txt` | 24 | ESG reporting | 1 | page-copy | `CrowESG is VSME ESG reporting for UK SMEs.` | remove entry | medium |
| `manifest.json` | 4 | ESG reporting | 1 | meta | `The compliance and revenue platform for UK SMEs: PPN 002 social value, Cyber Essentials, VSME ESG reporting, and late-payment recovery.` | `Public sector bid and tender software for UK SMEs.` | high |
| `js/nav-inject.js` | 1375 | ESG reporting | 1 | structured-data | `The compliance and revenue platform for UK SMEs that sell to the public sector and large corporates: PPN 002 social value, Cyber Essentials, VSME ESG reporting and late-payment recovery software.` | `Public sector bid and tender software for UK SMEs that sell to government and large corporates.` | high |
| `js/nav-inject.js` | 472 | ESG reporting | 1 | page-copy (injected footer, all 63 pages) | `The compliance and revenue platform for UK SMEs: PPN 002 social value, Cyber Essentials, VSME ESG reporting and late-payment recovery, in one platform.` | `Public sector bid and tender software for UK SMEs.` | high |
| `js/nav-inject.js` | 317 | ESG reporting | 1 | nav (injected mega-menu, all 63 pages) | `<strong>CrowESG</strong><span class="nav-mega-desc">VSME ESG reporting &middot; Live</span>` | remove the CrowESG nav entry | high |
| `changelog.xml` | 27 | accounts (receivable) | 1 | page-copy (RSS) | `CrowCash AI credit control and accounts receivable from £79/mo` | `CrowCash overdue-invoice recovery from £79/mo` | medium |
| `Assets/og-image.svg` | 9 | Compliance Intelligence | 2 | svg-text (orphaned asset) | `Compliance Intelligence` | `Bid intelligence` | high |
| `Assets/og-image.svg` | 10 | Compliance intelligence | 2 | svg-text (orphaned asset) | `Compliance intelligence.` | `Bid intelligence.` | high |

### 3.2 `crowcash.html` — CrowCash product page

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `crowcash.html` | 181 | accounts receivable | 1 | page-copy | `Owner-operators chasing invoices manually with no dedicated accounts receivable resource.` | `…with no dedicated credit-control resource.` | high |
| `crowcash.html` | 184 | Accounts receivable | 1 | heading | `<h3>Accounts receivable teams</h3>` | `<h3>Credit control teams</h3>` | high |
| `crowcash.html` | 193 | accounts receivable | 1 | page-copy | `External bookkeepers handling accounts receivable for multiple SME clients` | `External finance teams handling overdue invoices for multiple SME clients` | high |
| `crowcash.html` | 192 | Bookkeepers | 1 | heading | `<h3>Bookkeepers</h3>` | `<h3>Outsourced finance teams</h3>` | high |
| `crowcash.html` | 193 | bookkeepers | 1 | page-copy | `External bookkeepers handling…` | `External finance teams handling…` | high |
| `crowcash.html` | 335 | bookkeeper | 1 | page-copy | `Use the trail in court if a customer escalates, or hand it to your bookkeeper at year-end.` | `…or hand it to your finance team at year-end.` | high |
| `crowcash.html` | 291 | accounts receivable | 1 | heading | `<h2>Everything you need for <br/> accounts receivable.</h2>` | `<h2>Everything you need to recover overdue invoices.</h2>` | high |
| `crowcash.html` | 327 | accounting | 1 | heading | `<h3>CSV import and accounting integrations</h3>` | `<h3>CSV import and invoice-ledger connectors</h3>` | high |
| `crowcash.html` | 334 | Audit-ready | 1 | heading | `<h3>Audit-ready chase log</h3>` | `<h3>Evidenced chase log</h3>` | medium |
| `crowcash.html` | 341 | ACCOUNTING | 1 | code-identifier (HTML comment) | `<!-- 05B. ACCOUNTING INTEGRATIONS -->` | `<!-- 05B. LEDGER CONNECTORS -->` | high |
| `crowcash.html` | 346 | accounting | 1 | heading | `<h2>Connects to your <br/> accounting system.</h2>` | `<h2>Connects to your invoicing system.</h2>` | high |
| `crowcash.html` | 347 | accounts (financial) | 1 | page-copy | `CrowCash never writes back to your accounts and never moves money.` | `CrowCash never writes back to your ledger and never moves money.` | high |
| `crowcash.html` | 448 | ESG reporting | 1 | page-copy (cross-sell card) | `VSME ESG reporting and carbon footprint for UK SMEs. From £49/mo.` | remove cross-sell card | medium |

### 3.3 `crowesg.html`, `crowcyber.html`, `crowmark.html` — other product pages

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `crowesg.html` | 23 | ESG Reporting | 1 | heading (`<title>`) | `CrowESG \| VSME ESG Reporting &amp; Carbon Footprint \| CrowAgent` | page withdrawn from public site | medium |
| `crowesg.html` | 24 | ESG reporting | 1 | meta | `VSME ESG reporting for UK SMEs. Deterministic carbon footprint on DESNZ 2025 factors…` | page withdrawn | medium |
| `crowesg.html` | 43 | ESG Reporting | 1 | meta (og:title) | `CrowESG \| VSME ESG Reporting &amp; Carbon Footprint \| CrowAgent` | page withdrawn | medium |
| `crowesg.html` | 44 | ESG reporting | 1 | meta (og:description) | `VSME ESG reporting for UK SMEs…` | page withdrawn | medium |
| `crowesg.html` | 54 | ESG Reporting | 1 | meta (twitter:title) | `CrowESG \| VSME ESG Reporting &amp; Carbon Footprint \| CrowAgent` | page withdrawn | medium |
| `crowesg.html` | 55 | ESG reporting | 1 | meta (twitter:description) | `VSME ESG reporting for UK SMEs…` | page withdrawn | medium |
| `crowesg.html` | 60 | ESG reporting | 1 | structured-data | `"description":"VSME ESG reporting for UK SMEs. Deterministic carbon footprint…"` | page withdrawn | medium |
| `crowesg.html` | 83 | ESG reporting | 1 | heading (eyebrow) | `Live · VSME ESG reporting for UK SMEs` | page withdrawn | medium |
| `crowesg.html` | 87 | ESG reporting | 1 | heading | `<span>VSME ESG reporting</span>` | page withdrawn | medium |
| `crowesg.html` | 197 | Accountants | 1 | page-copy | `Accountants and ESG advisors running VSME reporting for a portfolio of SME clients.` | page withdrawn; if retained, see `AMBIGUOUS.md` | low |
| `crowesg.html` | 285 | annual accounts | 1 | page-copy | `ready to drop into your annual accounts` | `ready to attach to your year-end filing` | medium |
| `crowesg.html` | 397 | audit-grade | 1 | page-copy | `It is not a full CSRD/ESRS or ISSB audit-grade reporting tool.` | `It is not a full CSRD/ESRS or ISSB assurance-grade tool.` — **no**, `assurance` is also prohibited; propose `It does not produce CSRD/ESRS or ISSB-level disclosures.` | medium |
| `crowesg.html` | 405 | ESG reporting | 1 | page-copy | `provides a simplified, proportionate ESG reporting framework for smaller businesses` | page withdrawn | medium |
| `crowcyber.html` | 264 | audits | 1 | page-copy | `CrowCyber audits privilege levels, shared accounts, and MFA configuration` | `CrowCyber checks privilege levels, shared accounts, and MFA configuration` | high |
| `crowcyber.html` | 332 | audit-ready | 1 | page-copy | `keep your pack audit-ready year-on-year` | `keep your pack submission-ready year-on-year` | high |
| `crowcyber.html` | 443 | ESG reporting | 1 | page-copy (cross-sell card) | `VSME ESG reporting for UK SMEs. Carbon footprint on DESNZ 2025 factors…` | remove cross-sell card | medium |
| `crowmark.html` | 331 | audit | 1 | heading | `<h2>The KPI duties nobody <br/> reads until audit.</h2>` | `<h2>The KPI duties nobody <br/> reads until the contract review.</h2>` | medium |
| `crowmark.html` | 472 | ESG reporting | 1 | page-copy (cross-sell card) | `VSME ESG reporting and carbon footprint for UK SMEs. From £49/mo.` | remove cross-sell card | medium |

### 3.4 `pricing.html`

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `pricing.html` | 564 | accounting | 1 | page-copy | `Unlimited invoices, 1 connected accounting entity.` | `Unlimited invoices, 1 connected ledger.` | high |
| `pricing.html` | 572 | accounts receivable | 1 | heading (tier eyebrow) | `Finance teams & accounts receivable leads` | `Finance teams and credit-control leads` | high |
| `pricing.html` | 574 | accounting | 1 | page-copy | `Unlimited invoices, 3 connected accounting entities` | `Unlimited invoices, 3 connected ledgers` | high |
| `pricing.html` | 584 | accounting | 1 | page-copy | `Unlimited invoices, unlimited connected accounting entities` | `Unlimited invoices, unlimited connected ledgers` | high |
| `pricing.html` | 605 | ESG Reporting | 1 | heading (eyebrow) | `<span class="ca-eyebrow">ESG Reporting</span>` | section withdrawn | medium |
| `pricing.html` | 607 | ESG reporting | 1 | page-copy | `VSME ESG reporting and carbon footprint for UK SMEs.` | section withdrawn | medium |
| `pricing.html` | 641 | assured | 1 | code-identifier (HTML comment) | `<!-- [R241-PRICING-IMPLEMENTATION change 4] Group / assured reporting → Contact sales. -->` | rewrite comment | high |
| `pricing.html` | 644 | assured | 1 | heading | `<h3>Group / assured</h3>` | `<h3>Group</h3>` | high |
| `pricing.html` | 645 | audit-ready | 1 | heading (tier eyebrow) | `Consolidated or audit-ready` | `Consolidated or submission-ready` | high |
| `pricing.html` | 647 | assured, audit-ready | 1 | page-copy | `Reporting for a group, or need assured / audit-ready output beyond the VSME baseline?` | `Reporting for a group, or need submission-ready output beyond the VSME baseline?` | high |

### 3.5 `integrations.html`

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `integrations.html` | 12 | accounting | 1 | meta (description) | `Connect CrowAgent to the accounting, credit, comms, identity and collaboration tools you already run.` | `Connect CrowAgent to the invoicing, credit, comms, identity and collaboration tools you already run.` | high |
| `integrations.html` | 14 | accounting | 1 | meta (og:description) | same string | same | high |
| `integrations.html` | 42 | accounting | 1 | meta (twitter:description) | `Connect CrowAgent to the accounting, credit, comms, identity and collaboration tools you already run.` | same | high |
| `integrations.html` | 141 | ACCOUNTING | 1 | code-identifier (HTML comment) | `<!-- 02. ACCOUNTING (DARK) -->` | `<!-- 02. INVOICING (DARK) -->` | high |
| `integrations.html` | 145 | Accounting | 1 | heading (section eyebrow) | `<span class="ca-eyebrow">Accounting</span>` | `<span class="ca-eyebrow">Invoicing</span>` | high |
| `integrations.html` | 147 | accounting | 1 | page-copy | `CrowCash reads open invoices and payment dates directly from your accounting platform` | `CrowCash reads open invoices and payment dates directly from your invoicing platform` | high |

Note: the section anchor `id="accounting"` and the CSS selectors targeting it
(`integrations.html:100`, `Assets/css/premium-gloss-2026-05-31.css:123`) are **code identifiers**,
cleared as TIER 0. They must be renamed together with the heading if the heading changes, or the
styling breaks.

### 3.6 `partners.html`

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `partners.html` | 75 | ESG reporting | 1 | meta (og:description) | `Deliver PPN 002 social value, Cyber Essentials, late-payment recovery, CSRD, and VSME ESG reporting tools to your clients under your own brand.` | `Deliver PPN 002 social value and bid-response tooling to your clients under your own brand.` | medium |
| `partners.html` | 155 | audits | 1 | page-copy | `Whether you run client audits, write bids, or guide public sector clients` | `Whether you run client assessments, write bids, or guide public sector clients` | medium |
| `partners.html` | 160 | audit | 1 | page-copy | `Add automated Cyber Essentials v3.3 readiness and evidence packs to your client audit services` | `…to your client assessment services` | medium |
| `partners.html` | 167 | Accountancy | 1 | heading | `<h3>Accountancy Firms</h3>` | `<h3>Partner firms</h3>` | medium |
| `partners.html` | 172 | ESG reporting | 1 | page-copy | `and ESG reporting (CrowESG, with a free CSRD Applicability Checker) for your public sector clients` | remove clause | medium |

### 3.7 `about.html`, `roadmap.html`, `resources.html`, `faq.html`

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `about.html` | 194 | sustainability reporting | 1 | page-copy | `EU 2022/2464 for sustainability reporting` | `EU 2022/2464 for sustainability disclosure` | medium |
| `about.html` | 248 | audits | 1 | page-copy | `procurement frameworks, and cybersecurity audits from the inside` | `procurement frameworks, and cybersecurity assessments from the inside` | medium |
| `about.html` | 340 | ESG reporting | 1 | page-copy (cross-sell) | `VSME ESG reporting for UK SMEs, with a carbon footprint on DESNZ 2025 factors` | remove cross-sell card | medium |
| `roadmap.html` | 135 | accounts receivable | 1 | page-copy | `Credit control and accounts receivable for UK SMEs under the Late Payment Act 1998.` | `Credit control and overdue-invoice recovery for UK SMEs under the Late Payment Act 1998.` | high |
| `roadmap.html` | 140 | ESG reporting | 1 | page-copy | `VSME ESG reporting for UK SMEs. EFRAG VSME 2024 baseline questionnaire…` | remove roadmap item | medium |
| `roadmap.html` | 326 | carbon-accounting | 1 | page-copy | `We are not building a full enterprise carbon-accounting platform` | `We are not building a full enterprise carbon-measurement platform` | medium |
| `resources.html` | 294 | ESG reporting | 1 | page-copy | `CrowESG for VSME ESG reporting.` | remove clause | medium |
| `faq.html` | 17 | ESG reporting | 1 | meta | `Frequently asked questions about CrowAgent: PPN 002 social value, Cyber Essentials, late payments, CSRD, ESG reporting, billing, MFA, and data security.` | `Frequently asked questions about CrowAgent: PPN 002 social value, tender responses, billing, MFA, and data security.` | medium |
| `faq.html` | 82 | ESG reporting | 1 | structured-data (FAQPage) | `…and CrowESG for VSME ESG reporting and carbon footprints.` | remove clause (must be changed in the JSON-LD **and** the visible answer at line 163 together) | medium |
| `faq.html` | 163 | ESG reporting | 1 | page-copy | `…and CrowESG for VSME ESG reporting and carbon footprints.` | remove clause | medium |

### 3.8 `glossary/`, `sectors/`, `compare/`, `tools/`, `intel/`

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `glossary/csrd.html` | 100 | audited | 1 | page-copy | `requires large companies to publish audited sustainability information` | see `AMBIGUOUS.md` — describes the EU regime, not a CrowAgent offering | low |
| `glossary/csrd.html` | 114 | audited, sustainability reporting | 1 | page-copy | `an EU framework for audited sustainability reporting, not a CrowAgent product` | see `AMBIGUOUS.md` | low |
| `glossary/csrd.html` | 164 | sustainability reporting | 1 | page-copy | `provides a proportionate alternative for sustainability reporting. The full CrowESG platform handles both.` | remove the CrowESG sentence; the definition itself is a regulatory description | medium |
| `glossary/csrd.html` | 178 | ESG reporting | 1 | page-copy (cross-sell) | `VSME ESG reporting and carbon footprint for UK SMEs.` | remove cross-sell card | medium |
| `glossary/index.html` | 74 | sustainability reporting | 1 | structured-data | `"description":"Plain-English definitions of the UK compliance terms that affect procurement, cyber security and sustainability reporting."` | `…that affect UK public procurement and tendering.` | medium |
| `glossary/index.html` | 123 | sustainability reporting | 1 | page-copy | `definitions of the regulations, frameworks and standards behind UK procurement, cyber security and sustainability reporting` | `…behind UK public procurement and tendering` | medium |
| `glossary/index.html` | 104 | accounts | 1 | structured-data | `Having the documents, accreditations and evidence, such as accounts, insurances, policies…` | `…such as financial statements, insurances, policies…` | medium |
| `glossary/index.html` | 292 | accounts | 1 | page-copy | same string, visible copy | same | medium |
| `glossary/toms-framework.html` | 138 | audit | 1 | page-copy | `documented evidence (contracts, pay records, delivery reports) retained for audit` | `…retained for contract review` | medium |
| `sectors/index.html` | 98 | assurance | 1 | page-copy | `Framework bids weigh PPN 002 social value alongside supplier security assurance.` | `…alongside supplier security evidence.` | high |
| `sectors/education.html` | 86 | assurance | 1 | page-copy | `from social value to data assurance` | `from social value to data protection evidence` | high |
| `sectors/education.html` | 121 | assurance | 1 | page-copy | `Cyber Essentials and data assurance for education due diligence sit with CrowCyber` | `Cyber Essentials and data-protection evidence for education due diligence…` | high |
| `sectors/highways.html` | 121 | assurance | 1 | page-copy | `Cyber Essentials evidence for buyer assurance sits with CrowCyber` | `Cyber Essentials evidence for buyer confidence…` | high |
| `compare/crowmark-vs-cleantender.html` | 160 | Assurance | 1 | page-copy | `…including Company Overview, Relevant Experience, Quality Assurance, Staff Training, COSHH Management…` | see `AMBIGUOUS.md` — this is the literal section list of a buyer's SQ | low |
| `tools/index.html` | 110 | sustainability reporting | 1 | page-copy | `the SME-friendly path to sustainability reporting` | `the SME-friendly path to voluntary sustainability disclosure` | medium |
| `tools/csrd-applicability-checker/index.html` | 145 | audit-ready | 1 | page-copy | `data collection across the ESRS pillars, and audit-ready reporting` | `…and submission-ready output` | high |
| `tools/cyber-essentials-readiness/index.html` | 209 | audit | 1 | heading | `<p class="ref">Full audit scope</p>` | `Full assessment scope` | medium |
| `tools/cyber-essentials-readiness/index.html` | 224 | audit | 1 | heading (eyebrow) | `Ready for the full audit?` | `Ready for the full assessment?` | medium |
| `tools/vsme-materiality-light/index.html` | 34 | ESG reporting | 1 | structured-data | `"description":"Free VSME materiality light tool based on the EFRAG VSME (2024) voluntary standard for SME ESG reporting."` | `…voluntary standard for SME sustainability disclosure.` | medium |
| `tools/vsme-materiality-light/index.html` | 188 | assurance, audit | 1 | page-copy | `It is not assurance or audit advice.` | `It is not professional advice.` | high |
| `tools-csrd-checker-methodology.html` | 162 | sustainability reporting | 1 | page-copy | `can use VSME for voluntary sustainability reporting that is appropriate to their size and audit risk` | `…for voluntary sustainability disclosure appropriate to their size` | medium |
| `tools-csrd-checker-methodology.html` | 162 | audit risk | 1 | page-copy | `…appropriate to their size and audit risk.` | delete the clause | medium |
| `tools-csrd-checker-methodology.html` | 153 | audited | 1 | page-copy | `the employees figure as filed in audited annual statements where available` | `…as filed in the company's published annual statements` | medium |
| `tools-csrd-checker-methodology.html` | 165 | limited-assurance | 1 | page-copy | `It does not produce the limited-assurance pack.` | `It does not produce the ESRS disclosure pack.` | medium |

### 3.9 JavaScript-rendered copy

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `js/tool-engine-vsme-materiality-light.js` | 197 | assurance, audit | 1 | page-copy (rendered result) | `This is an indicative screen, not assurance or audit advice.` | `This is an indicative screen, not professional advice.` | high |
| `js/tool-engine-vsme-materiality-light.js` | 15 | assurance | 1 | code-identifier (comment) | `This is an INDICATIVE screen, not assurance.` | rewrite comment for consistency | medium |
| `js/nebula-shotpanels.js` | 431 | auditor | 1 | page-copy (screen-reader description) | `Materiality, carbon and auditor review are not yet started.` | `Materiality, carbon and reviewer sign-off are not yet started.` | medium |
| `index.html` | 882 | auditor | 1 | page-copy (screen-reader description) | `Materiality, carbon and auditor review are not yet started.` | `Materiality, carbon and reviewer sign-off are not yet started.` | medium |

`index.html:882` and `js/nebula-shotpanels.js:431` are the same sentence maintained in two places; they
must be changed together or the panel and its `sr-only` caption will diverge.

### 3.10 Blog articles

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `blog/csrd-omnibus-i-2026.html` | 98 | sustainability reporting | 1 | image-alt | `Wind turbines and solar panels at a renewable energy site, the kind of asset data covered by CSRD sustainability reporting` | `…covered by CSRD disclosure` | medium |
| `blog/csrd-omnibus-i-2026.html` | 202 | sustainability reporting | 1 | page-copy | `member states retain the ability to impose broader sustainability reporting requirements` | see `AMBIGUOUS.md` — describes EU law | low |
| `blog/csrd-omnibus-i-2026.html` | 229 | sustainability reporting | 1 | page-copy | `the most significant revision to EU sustainability reporting rules since CSRD was adopted` | see `AMBIGUOUS.md` | low |
| `blog/csrd-omnibus-i-2026.html` | 212 | management accounts | 1 | page-copy | `data already available in existing management accounts and HR systems` | `data already available in existing finance and HR systems` | medium |
| `blog/regulatory-updates-2026.html` | 223 | sustainability reporting | 1 | page-copy | `companies in the sustainability reporting pipeline` | see `AMBIGUOUS.md` | low |
| `blog/regulatory-updates-2026.html` | 231 | sustainability reporting, Assurance | 1 | page-copy | `subject to mandatory sustainability reporting across the EU. Assurance requirements have also been simplified` | see `AMBIGUOUS.md` | low |
| `blog/ppn-002-social-value-guide.html` | 281 | carbon audit | 1 | page-copy | `volunteering logs, carbon audit results` | `volunteering logs, carbon measurement results` | medium |
| `blog/ppn-002-social-value-guide.html` | 283 | Audit | 1 | heading | `<h3>Audit risk</h3>` | `<h3>Evidence risk</h3>` | medium |

### 3.11 Orphaned SVG mock-ups — rendered on no page

All 24 rows below sit in `Assets/svg-mockups/*.svg`. No in-scope HTML page or shipped script
references any file in that directory; the assets remain fetchable at their URLs. Surface is
`svg-text` throughout unless noted. Proposed action for all of them is **delete the orphaned asset**
rather than rewrite it, given no page renders them; individual replacements are given for the case
where a decision is made to keep them.

| File | Line | Term | Tier | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|
| `board-pack.svg` | 64 | ASSURANCE | 1 | `ASSURANCE READY` | `EVIDENCE READY` | medium |
| `board-pack.svg` | 176 | Audit | 1 | `Audit committee · 4 of 5 votes` | delete panel | medium |
| `board-pack.svg` | 182 | assurance | 1 | `External assurance (limited)` | delete panel | medium |
| `board-pack.svg` | 198 | audit | 1 | `Notify audit committee` | `Notify review board` | medium |
| `board-pack.svg` | 136 | Tax | 1 | `Tax strategy disclosure` | delete row | medium |
| `citation-panel.svg` | 85 | audit, assurance | 1 | `Establishes ESRS reporting framework, double materiality, audit assurance regime` | delete asset | medium |
| `coming-soon-q3.svg` | 43 | ESG reporting | 1 | `Multi-framework ESG reporting` | delete asset | medium |
| `coming-soon-q3.svg` | 46 | audit-ready | 1 | `One platform · one double materiality · audit-ready evidence trail` | `…submission-ready evidence trail` | medium |
| `control-themes.svg` | 87 | audit | 1 | `MFA + privileged-account audit` | `MFA + privileged-account review` | medium |
| `esg-framework-matrix.svg` | 225 | audit-ready | 1 | `audit-ready evidence trail across all 5 frameworks` | `submission-ready evidence trail…` | medium |
| `how-crowcyber-step-1.svg` | 147 | audited | 1 | `Firewall rules, 38 audited` | `Firewall rules, 38 checked` | medium |
| `how-crowcyber-step-4.svg` | 102 | audit | 1 | `A3, Admin account audit` | `A3, Admin account review` | medium |
| `how-crowesg-step-1.svg` | 89 | Risk management | 1 | `Risk management` | `Governance topics` | medium |
| `how-crowmark-step-4.svg` | 75 | audit-ready | 1 | `Commitments tracked monthly, audit-ready reports auto-generated` | `…submission-ready reports auto-generated` | high |
| `how-csrd-step-3.svg` | 88 | Audit-grade | 1 | `Audit-grade methodology, no account required` | `Statute-cited methodology, no account required` | high |
| `how-csrd-step-4.svg` | 68 | auditor | 1 | `Send the verdict to your compliance lead, the board, or your auditor` | `Send the verdict to your compliance lead or the board` | high |
| `how-step-3-report.svg` | 88 | audit-ready | 1 | `CSRD, Cyber Essentials, PPN-002 social value, audit-ready` | `…submission-ready` | high |
| `how-step-3-report.svg` | 181 | Risk management | 1 | `Risk management` | `Governance topics` | medium |
| `how-step-4-export.svg` | 2 | auditor | 1 | `<title id="step4Title">Step 4: Export to auditor, regulator, board</title>` | `Step 4: Export to buyer, regulator, board` | high |
| `how-step-4-export.svg` | 111 | Audit | 1 | `<!-- 1. Audit firm -->` (code-identifier) | rewrite comment | medium |
| `how-step-4-export.svg` | 120 | Audit | 1 | `Audit firm` | `Buyer` | high |
| `how-step-4-export.svg` | 172 | Audit | 1 | `<!-- Arc 1 to Audit firm (target y=190) -->` (code-identifier) | rewrite comment | medium |
| `threshold-test.svg` | 133 | assurance | 1 | `limited assurance required` | delete row | medium |
| `threshold-test.svg` | 134 | Audit-ready | 1 | `Audit-ready evidence trail` | `Submission-ready evidence trail` | high |

### 3.12 Legal and trust pages — reported, never edited

| File | Line | Term | Tier | Surface | Verbatim string | Proposed replacement | Confidence |
|---|---|---|---|---|---|---|---|
| `privacy.html` | 503 | ESG reporting | 1 | legal-page | `CrowESG features such as authentication, ESG reporting, Cyber Essentials readiness, and Social Value scoring` | none — report only | n/a |
| `privacy.html` | 627 | Accounting | 1 | legal-page | `<strong>Accounting (CrowCash):</strong> If you link Xero or QuickBooks Online…` | none — report only | n/a |
| `privacy.html` | 542 | audit trail | 0/1 | legal-page | `Up to 7 years (anonymised audit trail)` | none — report only; this is a records-retention statement, TIER 0 system-logging sense | n/a |
| `security.html` | 445 | audit | 1 | legal-page | `Jump to any topic, or contact us for an audit pack.` | none — report only. Note: this offers an "audit pack" **to a customer**, so it is not covered by the TIER 0 `audit log` carve-out | n/a |
| `security.html` | 470 | audit | 1 | legal-page | `For security disclosures or audit requests, contact our security team` | none — report only | n/a |
| `security.html` | 562 | audit-logged | 0 | legal-page | `Privileged actions audit-logged.` | none — TIER 0 permitted (system logging) | n/a |
| `terms.html` | 21, 386, 429, 443, 452, 454 | account/accounts | 0 | legal-page | user-account sense throughout | none — TIER 0 permitted | n/a |
| `cookies.html` | 40 | AUDIT | 0 | legal-page | `<!-- CHROME-AUDIT 2026-05-30: social share cards (Claude) -->` | none — internal ticket identifier | n/a |

## 4. TIER 0 clearances, itemised

Recorded so that a future verification gate does not re-flag them.

**4.1 Internal ticket identifiers and developer commentary — 265 matches, no user-visible text.**
Prefixes in use: `WS-AUDIT-0xx` (most numerous), `WEB-AUDIT-1xx`/`2xx`, `CHROME-AUDIT`,
`A45-PLUS browser-audit`, `NAV-001/002 audit`, `LINK-001/002 audit`, `A11Y-005/007 audit`,
`SF16/SF17/SF25 AUDIT FIXES`. Concentrations: `styles.css` (163 matches, all in CSS comments in a
1.2 MB stylesheet), `js/nav-inject.js` (17), `js/cookie-banner.js` (11), `scripts.js` (9). The
`<!-- CHROME-AUDIT 2026-05-30: social share cards (Claude) -->` comment alone appears in 17 HTML
pages.

**4.2 `account` / `accounts` in the user-account sense — 155 matches.** Sign-in, sign-up, trial,
subscription, "no account required", "account settings", "dedicated account manager", "cloud admin
accounts" (an NCSC Cyber Essentials control), "sample account"/"demo account" in screenshot
captions, "account takeover". Permitted.

**4.3 Code identifiers — 10 matches.** `styles.css:26671` `[class*="sustainability-intelligence"]`;
`integrations.html:100` and `:142` `#accounting` / `id="accounting"`;
`Assets/css/premium-gloss-2026-05-31.css:123` `#accounting`;
`contact.html:401` `<option value="esg-reporting">`; `scripts.js:1142` and `scripts.min.js`
`'esg': 'esg-reporting'` routing map. Renaming any of these requires a coordinated change to the
selector, the anchor, and the routing map together.

**4.4 `npm audit` / `pip-audit`.** No occurrences in any in-scope file. `npm audit` does occur three
times in `.github/workflows/quality-gate.yml` (`run: npm audit --audit-level=high`), which is
excluded from scope as CI configuration. It is TIER 0 permitted tooling usage and must not be
touched — changing it would disable the dependency security gate.

**4.5 Qualified `compliant` / `compliance` in body copy about a tender response.** No instance was
found of `compliance` used adjectivally and qualified by a named procurement instrument (e.g. "PPN
002 compliant response"). The site's uses of `compliance` are all category-level (`compliance
software`, `compliance suite`, `Compliance Glossary`, `Free Compliance Tools`, `Compliance
products`) and are therefore TIER 2 heading/nav usages — these are catalogued in `AMBIGUOUS.md` §7
because they are not literal members of the TIER 2 list as written.
