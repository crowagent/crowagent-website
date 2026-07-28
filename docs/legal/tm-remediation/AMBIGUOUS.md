# AMBIGUOUS

**Gate 0 discovery artefact — crowagent-website. Read only; no site content was changed.**

Date of scan: 2026-07-28
Companion documents: `SITE-INVENTORY.md`, `LEXICON-INVENTORY.md`.

---

## How to read this file

Every string below matched the lexicon but **could not be classified with confidence**. Each entry
gives the file, the line, the verbatim string, and both readings — why it might be prohibited and why
it might be legitimate. Nothing here has been assigned a replacement. These require a decision before
any edit is made.

**108 strings from the lexicon sweep are listed in §1–§6.** §7 adds a further class that the lexicon
as written does not literally cover but which the TIER 0 rule appears to reach, and which is large
enough that a decision is needed before drafting begins.

---

## §1 — `audit trail` / `audit log`: system logging or a customer-facing offering? (23 locations)

The TIER 0 rule permits `audit log` / `audit trail` for system logging, security documentation and
database identifiers, but **prohibits them where they describe something offered to a customer**.
Every occurrence on this site sits on the boundary: each one is describing a software feature *in
marketing copy*, which is simultaneously a description of system logging and a sales proposition.

| File | Line | Verbatim string |
|---|---|---|
| `index.html` | 937 | `Supplier-grade evidence and a defensible audit trail, with UK and EU data residency.` |
| `crowcash.html` | 185 | `AR clerks running structured chase cadences across hundreds of debtors with a full audit trail.` |
| `crowcash.html` | 193 | `each client's ledger is isolated, with its own chase sequences and audit trail.` |
| `crowcash.html` | 216 | `Choose polite, standard, or firm cadences with a full audit trail.` |
| `resources.html` | 110 | `Use them, share the results, then sign up if you want the full audit trail.` |
| `tools/vsme-materiality-light/index.html` | 213 | `CrowESG runs the full VSME assessment with a materiality matrix and an audit trail your buyers and auditors can check.` |
| `tools-late-payment-calculator-methodology.html` | 163 | `Those capabilities live in CrowCash, which adds deterministic payment-likelihood scoring and audit logs.` |
| `js/tool-teaser.js` | 87 | `Sign up (no card required) for unlimited scans, PDF export, scenario comparison, and audit trail.` |
| `blog/ppn-002-social-value-guide.html` | 18 | (meta description) `Missions, TOMs, Oxford SVB proxy values, audit trail, common pitfalls.` |
| `blog/ppn-002-social-value-guide.html` | 59 | (structured data, same sentence) |
| `privacy.html` | 542 | `Up to 7 years (anonymised audit trail)` — **legal page, report only** |
| `security.html` | 562 | `Privileged actions audit-logged.` — **legal page, report only** |
| `Assets/svg-mockups/board-pack.svg` | 66, 143 | `100% audit-trail coverage`; `Audit trail · 142 files` — orphaned asset |
| `Assets/svg-mockups/citation-panel.svg` | 2, 3, 35 | `CSRD citation and audit trail` (image-alt, `<title>`, and body text) — orphaned asset |
| `Assets/svg-mockups/how-crowesg-step-2.svg` | 171 | `Define once, satisfy every framework, with a full audit trail per value` — orphaned |
| `Assets/svg-mockups/how-crowesg-step-4.svg` | 154, 157, 193 | `Audit trail`; `Assurance-grade audit trail behind every metric` — orphaned |
| `Assets/svg-mockups/how-crowmark-step-2.svg` | 196 | `Proxy values are Oxford SVB 2023-24, refreshed annually, audit trail preserved` — orphaned |
| `Assets/svg-mockups/how-step-4-export.svg` | 186 | `Encrypted in transit and at rest, full audit trail per delivery` — orphaned |

**Why it might be prohibited:** in every case the phrase is a selling point in a marketing sentence.
`resources.html:110` and `js/tool-teaser.js:87` are the clearest — the audit trail is explicitly what
you get when you *sign up*, i.e. it is the thing offered to a customer. `privacy.html:542` is
described as a data-retention property of the product.

**Why it might be legitimate:** the underlying referent in each case is genuinely an immutable
system log — a record of which user changed which field, when. That is exactly the sense the TIER 0
carve-out exists to protect. `security.html:562` (`Privileged actions audit-logged`) is
unambiguously system logging in a security document and is the one entry that reads clearly TIER 0.

**Note:** `Assets/svg-mockups/how-crowesg-step-4.svg:193` combines the ambiguity with an unambiguous
TIER 1 term — `Assurance-grade audit trail`. The `Assurance-grade` half is classified prohibited in
`LEXICON-INVENTORY.md` §3.11; only the `audit trail` half is ambiguous.

---

## §2 — Named regulatory instruments whose official title contains a prohibited word (29 locations)

The CSRD's legal name is the **Corporate Sustainability Reporting Directive**. Its predecessor is the
**Non-Financial Reporting Directive**. The EFRAG standards are the **European Sustainability
Reporting Standards**. The UK spending watchdog is the **National Audit Office**. Cabinet Office
PPN 06/20 is titled *"Taking account of social value in the award of central government contracts"*.
Each of these contains a TIER 1 term inside a proper noun.

| File | Lines | Verbatim string (representative) |
|---|---|---|
| `glossary/csrd.html` | 20, 21, 37, 38, 48, 49, 71, 98, 120, 157, 159 | `CSRD: Corporate Sustainability Reporting Directive \| CrowAgent` (title, description, og:title, og:description, twitter:title, twitter:description, JSON-LD `DefinedTerm`, `<h1>` span, body copy, and two source-list rows) |
| `blog/csrd-omnibus-i-2026.html` | 113, 164, 196, 240, 241 | `the Corporate Sustainability Reporting Directive (CSRD)`; `its predecessor, the Non-Financial Reporting Directive (NFRD)`; `the full European Sustainability Reporting Standards (ESRS)`; two citation-list rows |
| `blog/regulatory-updates-2026.html` | 225 | `narrowed the scope of the Corporate Sustainability Reporting Directive (CSRD)` |
| `tools-csrd-checker-methodology.html` | 138, 171 | `The Corporate Sustainability Reporting Directive (Directive (EU) 2022/2464) ("CSRD")`; `EFRAG, European Sustainability Reporting Standards (ESRS).` |
| `llms.txt` | 57 | `Definition of the Corporate Sustainability Reporting Directive.` |
| `llms-full.txt` | 79 | `The original Corporate Sustainability Reporting Directive (CSRD), adopted as Directive (EU) 2022/2464` |
| `Assets/jsonld/glossary--csrd.json` | 4 | `"name": "CSRD (Corporate Sustainability Reporting Directive)"` — orphaned build artefact |
| `blog/ppn-002-social-value-guide.html` | 284 | `The National Audit Office (NAO) and individual contracting authorities have the right to audit social value claims.` |
| `blog/ppn-002-social-value-guide.html` | 320 | `Cabinet Office, PPN 06/20: Taking account of social value in the award of central government contracts` (plus the gov.uk URL slug, which contains the same words) |

**Why it might be prohibited:** the strings appear in `<title>`, `<meta>`, and JSON-LD — the exact
surfaces the TIER 2 rule protects — and a crawler reading `glossary/csrd.html` sees "Sustainability
Reporting" six times in the head alone. A reader skimming search results sees a sustainability
reporting page under the CrowAgent brand.

**Why it might be legitimate:** these are the *legal titles* of instruments. Removing or altering
them makes the pages factually wrong and unusable as regulatory explainers, and a URL slug
(`procurement-policy-note-0620-taking-account-of-social-value…`) cannot be altered at all without
breaking the outbound link. Every one of these is describing third-party law, not a CrowAgent
service offering.

**Decision needed:** whether the answer is (a) keep the instrument names but retire the pages that
carry them, (b) keep the pages and accept the instrument names, or (c) keep the pages but strip the
instrument names from `<title>`/`<meta>`/JSON-LD while retaining them in body copy.

---

## §3 — `audit` describing a third-party scheme, not a CrowAgent offering (10 locations)

| File | Line | Verbatim string |
|---|---|---|
| `crowcyber.html` | 497 | `Cyber Essentials Plus adds a hands-on technical audit of your systems by an assessor.` |
| `crowcyber.html` | 189 | `SMEs whose insurer or large-customer audit now requires Cyber Essentials as a baseline.` |
| `crowcyber.html` | 451 | `before your assessor flags them as auto-fails` (adjacent to the same framing) |
| `tools/cyber-essentials-readiness/index.html` | 210 | `with 22 CE Plus questions for the independent hands-on audit of the same five control families.` |
| `js/tool-engine-cyber-essentials-readiness.js` | 108 | `well placed to self-assess for Cyber Essentials (Basic), and to schedule the independent Cyber Essentials Plus audit of the same controls.` |
| `js/tool-engine-cyber-essentials-readiness.js` | 171 | `Cyber Essentials Plus adds an independent, hands-on technical audit of the same five themes.` |
| `blog/cyber-essentials-v3-3-danzell-2026.html` | 183 | `Cyber Essentials Plus, which adds an on-site (or video-conference based) technical audit, is priced separately.` |
| `blog/ppn-014-cyber-essentials-guide.html` | 206 | `CE+ adds an on-site or video-conference technical audit on top of the self-assessment.` |
| `intel/cyber-essentials-tracker/index.html` | 244 | `The IASME self-assessment questionnaire and audit guidance` |
| `compare/crowmark-vs-swiftbid.html` | 159 | `The Premium tier adds optional human expert review, a compliance audit, multi-document analysis…` (describes a **competitor's** product) |

**Why it might be prohibited:** the word `audit` appears in CrowAgent-published marketing copy on
CrowAgent-branded pages, immediately alongside CrowAgent's product name, and in one case
(`crowcyber.html:497`) in the same sentence as "CrowCyber prepares you for both".

**Why it might be legitimate:** in every instance the audit is performed by an *external* body —
IASME, a certification assessor, an insurer, or a rival vendor. The copy is explaining what a third
party does, and explicitly contrasts it with what CrowAgent does (self-assessment preparation).
Removing the word would make the CE / CE+ distinction impossible to explain accurately, and
`compare/crowmark-vs-swiftbid.html:159` is a factual description of a competitor's published tier.

---

## §4 — `accounts`: user sense, financial sense, or neither? (11 locations)

The TIER 0 rule permits `accounts` in the user-account sense. These eleven sit on the boundary or in
a third sense (customer/debtor records) that the rule does not address.

| File | Line | Verbatim string | Reading |
|---|---|---|---|
| `crowcash.html` | 221 | `your team works the accounts most likely to convert first` | "accounts" = debtor relationships. Neither a login nor a financial statement. |
| `crowcash.html` | 321 | `Prioritise the accounts most likely to convert` | as above |
| `blog/cyber-essentials-v3-3-danzell-2026.html` | 159 | `Devices, accounts and services are deployed in a hardened state`; `unused services and accounts are disabled` | plainly the user/login sense — but quoted from an NCSC control, so also a technical term of art |
| `blog/mfa-mandatory-2026.html` | 167 | `an applicant who cannot demonstrate MFA on those accounts cannot pass` | user sense, NCSC control context |
| `llms-full.txt` | 63 | same sentence, AI-crawler surface | as above |
| `index.html` | 313 | `<!-- Worked-example overlay … The account this …` (HTML comment) | developer note about a demo tenant |
| `index.html` | 708 | `two of them filled in with an example account so the charts are not sitting empty` | screenshot provenance disclosure |
| `pricing.html` | 986 | `The CSRD Checker is free for all users and does not require an account.` | user sense |
| `pricing.html` | 990 | `your account will revert to a read-only state until a subscription is active` | user sense |
| `terms.html` | 21 | (meta description) `account use, subscriptions, acceptable use` | user sense — **legal page, report only** |

**Why they might be prohibited:** `crowcash.html:221` and `:321` are a hair's breadth from
"accounts receivable" in the same page, which is unambiguously financial. Reading them in context, a
reasonable reader takes them as ledger accounts.

**Why they might be legitimate:** none of them denotes a financial statement or a bookkeeping
service. "Working an account" is standard sales/collections vocabulary; the NCSC ones are quotations
of a technical control.

---

## §5 — `tax` (5 locations)

| File | Line | Verbatim string |
|---|---|---|
| `roadmap.html` | 329 | `<h3>EPR / WEEE / Packaging Tax</h3>` |
| `blog/procurement-act-2023-sme-guide.html` | 206 | `covering matters such as serious criminal convictions, tax offences, and significant past performance failures` |
| `blog/procurement-act-2023-sme-guide.html` | 207 | `keep your tax affairs and company filings current` |
| `blog/ppn-002-social-value-guide.html` | 227 | `reduced welfare costs, and increased tax revenue` |
| `Assets/svg-mockups/board-pack.svg` | 136 | `Tax strategy disclosure` — orphaned asset |

**Why they might be prohibited:** `roadmap.html:329` is a **heading** naming a levy as a
CrowAgent roadmap item, which reads as CrowAgent moving into tax. `board-pack.svg:136` labels "Tax
strategy disclosure" as a product output.

**Why they might be legitimate:** the Packaging Tax is the statutory name of an environmental levy,
not a tax service. The two `procurement-act` uses are direct paraphrases of Procurement Act 2023
exclusion grounds and the phrase "tax affairs" is the statute's own framing. The PPN 002 use is an
economic-proxy explanation of how social value is monetised, unrelated to tax advice.

**Explicitly checked and cleared:** `tax` appears as a substring of no other word on the site — no
`syntax`, `taxonomy`, or `taxa` occurrences were found in in-scope files. The word-boundary regex was
verified against this.

---

## §6 — `a full account of…` — narrative sense (6 locations)

| File | Line | Verbatim string |
|---|---|---|
| `tools-csrd-checker-methodology.html` | 95 | `A full account of the post-Omnibus I thresholds, the three-layer engine that powers the checker…` |
| `tools-cyber-essentials-readiness-methodology.html` | 95 | `A full account of Cyber Essentials v3.3 ('Danzell'), the five technical themes, the auto-fails…` |
| `tools-late-payment-calculator-methodology.html` | 95 | `A full account of the Late Payment of Commercial Debts (Interest) Act 1998…` |
| `tools-ppn002-calculator-methodology.html` | 95 | `A full account of PPN 002, the procurement framework that sets the 10% social value minimum…` |
| `tools-vsme-materiality-light-methodology.html` | 95 | `A full account of EFRAG VSME (2024), the six steps in the screen…` |
| `sectors/facilities.html` | 103 | `buyers want a clear, credible account of how you will consult, protect terms and keep the service running` |

**Why they might be prohibited:** the string `account of` matches on `account`, and these five
methodology pages use the identical construction, so an automated sweep will flag all of them
consistently.

**Why they might be legitimate:** this is the ordinary English "narrative/explanation" sense, with no
financial or user-login meaning whatsoever. Editing them would be a false positive.

**Recorded because** an automated remediation pass will hit these five near-identical strings and a
reviewer should know in advance that they are expected false positives, not misses.

---

## §7 — Category-level `compliance` in headings, titles, nav, meta and structured data (52 locations)

**This class is not literally in the TIER 2 list, but the TIER 0 rule appears to reach it, and it is
the single largest open question in this inventory.**

The TIER 0 rule permits `compliant`/`compliance` adjectivally *"in body copy about a tender response
only when qualified by a named procurement instrument"* and states it is *"prohibited in headings,
taglines, nav, product names, meta, structured data."* No occurrence on the site meets the permitted
condition — there is no instance of the "PPN 002 compliant response" pattern anywhere. Meanwhile
there are 52 occurrences in exactly the surfaces the rule names.

### 7.1 Highest-exposure — reads as a near-synonym of a listed TIER 2 term

| File | Line | Surface | Verbatim string |
|---|---|---|---|
| `faq.html` | 163 | page-copy (visible answer) | `CrowAgent is a compliance software platform with four products` |
| `faq.html` | 82 | structured-data (`FAQPage`) | same sentence, inside the `acceptedAnswer` |
| `faq.html` | 22 | meta (og:description) | `Frequently asked questions about CrowAgent compliance software.` |
| `terms.html` | 23, 31 | meta — **legal page, report only** | `Terms and conditions for using CrowAgent sustainability compliance software.` |
| `js/nav-inject.js` | 325 | nav (injected, all 63 pages) | `<strong>All products</strong><span class="nav-mega-desc">Compare the full compliance suite</span>` |
| `products/index.html` | 8 | heading (`<title>`) | `Products \| Statute-cited compliance and revenue software \| CrowAgent` |
| `index.html` | 452 | heading (hero eyebrow) | `UK compliance and revenue, one platform` |
| `manifest.json` | 4 | structured-data | `The compliance and revenue platform for UK SMEs` |

`compliance software platform` and `compliance and revenue platform` are, on any ordinary reading,
the TIER 2 term `compliance platform` with a word inserted. They are listed here rather than as
confirmed hits only because they are not verbatim matches.

### 7.2 Titles and headings

| File | Line | Verbatim string |
|---|---|---|
| `index.html` | 7, 17 | `CrowAgent \| Bid, tender and compliance tools for UK SMEs` (title and og:title) |
| `tools/index.html` | 8 | `Free UK Compliance Tools \| CrowAgent` |
| `tools/index.html` | 58 | `<h1>Free compliance checks.</h1>` |
| `glossary/index.html` | 8 | `UK Compliance Glossary \| CrowAgent` |
| `glossary/index.html` | 122 | `<h1>Compliance terms, defined.</h1>` |
| `blog/index.html` | 8 | `Regulatory Blog \| UK Compliance Guides for Suppliers \| CrowAgent` |
| `about.html` | 215 | `<h3>Make compliance accessible</h3>` |
| `about.html` | 220 | `<h3>Compliance in minutes, not weeks</h3>` |
| `about.html` | 353 | `<h2>Compliance as a competitive moat.</h2>` |
| `about.html` | 364 | `<h2>Get monthly UK compliance digests</h2>` |
| `pricing.html` | 1028 | `<h2>Elite Compliance.</h2>` |
| `crowcyber.html` | 192 | `<h3>Compliance officers</h3>` |
| `resources.html` | 280 | `<h2>Glossary of compliance terms</h2>` |
| `roadmap.html` | 248 | `<h3>Cross-product compliance copilot</h3>` |
| `blog/cyber-essentials-v3-3-danzell-2026.html` | 185 | `<h2>The compliance trigger most SMEs hit first</h2>` |
| `blog/regulatory-updates-2026.html` | 288 | `<h3>Track your compliance obligations</h3>` |

### 7.3 Injected navigation (present on all 63 pages)

| File | Line | Verbatim string |
|---|---|---|
| `js/nav-inject.js` | 310 | `<span class="nav-mega-label">Compliance products</span>` |
| `js/nav-inject.js` | 337 | `<span class="nav-mega-label">Free Compliance Tools</span>` |
| `js/nav-inject.js` | 544 | `<a href="/glossary">Compliance Glossary</a>` (footer) |

### 7.4 Meta descriptions and structured data

| File | Line | Verbatim string |
|---|---|---|
| `index.html` | 8, 18 | `Statute-cited compliance and revenue software for UK SMEs.` |
| `tools/index.html` | 9 | `Free, statute-cited compliance checks for UK teams.` |
| `glossary/index.html` | 74 | JSON-LD `CollectionPage` `"name":"UK Compliance Glossary"` |
| `glossary/csrd.html` | 71 | JSON-LD `"inDefinedTermSet":{"name":"CrowAgent UK Sustainability Compliance Glossary"}` |
| `glossary/ppn-002.html` | 73 | same `DefinedTermSet` name |
| `glossary/toms-framework.html` | 73 | same `DefinedTermSet` name |
| `Assets/jsonld/glossary--csrd.json` | 9 | `"name": "UK Sustainability Compliance Glossary"` — orphaned build artefact |
| `404.html` | 21, 38, 49 | `Page not found. Find your way back to compliance, CrowAgent.` |
| `resources.html` | 18 | og:image:alt `CrowAgent resources - guides and analysis for UK compliance teams` |
| `blog/ppn-014-cyber-essentials-guide.html` | 18, 59 | `Who is in scope, evidence buyers expect, and compliance steps.` |
| `blog/social-value-portal-vs-crowmark.html` | 18, 30, 53, 59 | `An honest comparison of Social Value Portal and CrowMark for PPN 002 compliance.` |
| `llms.txt` | 16, 55 | `Free, statute-cited compliance checks for UK teams.`; `Definitions of UK compliance and procurement terms.` |

### 7.5 Body copy and other

| File | Line | Verbatim string |
|---|---|---|
| `partners.html` | 109, 114 | `Bring compliance tools`; `deliver high-authority compliance tools under their brand` |
| `pricing.html` | 964 | `the preferred choice for long-term UK SME compliance planning` |
| `resources.html` | 176 | `written by the CrowAgent compliance leads` |
| `sectors/index.html`, `sectors/construction.html`, `sectors/education.html`, `sectors/facilities.html`, `sectors/highways.html`, `tools/index.html`, `products/index.html` | (footer strip, one per page) | `Built by UK compliance and ML engineers` |
| `index.html` | 940 | `Data stored in region on GDPR-compliant infrastructure.` |
| `security.html` | 18, 23, 31 | `GDPR-compliant`; `GDPR compliance` — **legal page, report only** |
| `Assets/svg-mockups/hero-demo-dashboard.svg` | 2 | `<title>CrowAgent compliance dashboard preview</title>` — orphaned |
| `Assets/svg-mockups/how-step-2-analyse.svg` | 2 | `Step 2: AI analyses against compliance frameworks` — orphaned |
| `Assets/svg-mockups/how-step-3-report.svg` | 2 | `Step 3: Draft compliance reports automatically` — orphaned |

**Why this class might be prohibited:** the TIER 0 rule names headings, taglines, nav, product names,
meta and structured data as prohibited surfaces for `compliance` without qualification, and this is
the vocabulary that positions the whole site as a compliance product rather than bid and tender
software. The `<h1>` of `/tools/` is literally the word.

**Why this class might be legitimate:** none of these strings is a verbatim member of the TIER 2
list. `GDPR-compliant` and `GDPR compliance` describe the site's own legal posture, not a service.
`compliance officers` is a job title held by the reader. The `Built by UK compliance and ML
engineers` strip describes the team.

**This is the largest single decision in the remediation.** Resolving it one way makes the change a
copy edit on a handful of files; resolving it the other way makes it a rewrite of every page title,
the injected navigation, the glossary's structured-data identity, and the site's search-result
appearance.

---

## §8 — Terms searched for and NOT found

Recorded so that a later reviewer does not repeat the search. No occurrence in any in-scope file:

`auditing`, `assured` used as a standalone service noun (the two hits are the pricing tier name and
its comment, both listed as prohibited), `taxation`, `tax advisory`, `financial advisory`,
`financial risk`, `financial management`, `business risk`, `enterprise risk`, `risk advisory`,
`risk assurance`, `business consultancy`, `business consulting`, `business advisory`,
`management consultancy`, `professional services network`, `member firm`/`member firms`,
`practice line`/`practice lines`, `internal controls`, `statutory reporting`, `statutory accounts`,
`ESG assurance`, `sustainability assurance`, `regulatory compliance platform`,
`compliance automation`, `AI-native compliance`, `compliance SaaS`, `compliance evidence`,
`pip-audit`.

Two caveats on that list:

- The literal string `bookkeeping` does not occur, but the **inflected forms do** —
  `crowcash.html:192` (`<h3>Bookkeepers</h3>`), `:193` (`External bookkeepers`) and `:335`
  (`hand it to your bookkeeper at year-end`). All three are classified prohibited in
  `LEXICON-INVENTORY.md` §3.2. This was a miss on the first sweep and is recorded as a lesson for
  any verification gate: stem the lexicon, do not match it literally.
- `npm audit` occurs three times in `.github/workflows/quality-gate.yml`, which is out of scope. It
  is TIER 0 permitted CI tooling and must not be changed.

`risk management` occurs twice, both as label text inside orphaned SVG mock-ups
(`Assets/svg-mockups/how-crowesg-step-1.svg:89`, `Assets/svg-mockups/how-step-3-report.svg:181`);
both are classified prohibited in `LEXICON-INVENTORY.md` §3.11.

`financial reporting` occurs twice, both inside the proper noun *Non-Financial Reporting Directive*
(`blog/csrd-omnibus-i-2026.html:164`, `llms-full.txt:79`); both are in §2 above.
