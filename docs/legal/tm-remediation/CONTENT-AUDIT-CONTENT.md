# Content Audit: Crowe Trade Mark Conflict

**Scope:** sectors/ (6 files), blog/ (10 files), glossary/ (4 files), tools/index.html, tools/ppn-002-calculator/index.html, the 5 root tools-\*-methodology.html files, 404.html, and the machine-readable files (llms.txt, llms-full.txt, sitemap.xml, manifest.json, changelog.xml, robots.txt, humans.txt, Assets/jsonld/\*).

**Status:** Report only. No file has been edited.

**The defence being built:** narrow CrowAgent's described field to UK public sector bid and tender software (CrowMark). Everything that places CrowAgent in Crowe's field (accounting, audit, tax, advisory, risk, assurance) or that keeps CrowCash, CrowCyber, CrowESG and the CSRD checker visible as offered services increases risk, because those four fields are exactly where an accounting network like Crowe operates.

---

## 1. Summary of findings by tier

| Tier | What it is | Volume found in this file set |
|---|---|---|
| A — non-verbal/structural | Sitemap URLs, JSON-LD, manifest.json, image alt text | 3 machine-readable files carry parked-product URLs and descriptions as live, indexed content. No third-party accounting/finance brand logos (Xero, QuickBooks, Sage, Experian, Creditsafe, banks) found anywhere in this file set. |
| B — Crowe's service vocabulary | audit, tax, advisory, risk, assurance, accounting, ledger, bookkeeping/bookkeeper(s), financial reporting | Mostly clean. Two real hits: "ledger" (CrowCash description, llms.txt/llms-full.txt) and "credit control and accounts receivable" (changelog.xml). No "member firm", "network", "professional services", "smart decisions", "lasting value", "deliver excellence", "bookkeeper/bookkeeping" found anywhere in this file set. |
| C — parked products | CrowCash, CrowCyber, CrowESG, CSRD, VSME, Cyber Essentials, late payment | Heavy. Present in 4 of 10 blog posts, 1 of 4 glossary pages, all 5 sector detail pages plus the sector hub, tools/index.html, 4 of 5 methodology pages, 404.html, and every machine-readable file. |
| D — "Qualify. Win. Get paid." | Three-verb narrative mapping to the three parked products | On all 5 sector pages and tools/index.html (final CTA band), identical wording each time. |

### Five highest-risk items, ranked

1. **`llms.txt` line 3.** The single sentence quoted in the brief. This is the file GPTBot, ClaudeBot, PerplexityBot and Google-Extended are actively reading right now (robots.txt explicitly allows all of them) as the canonical machine description of what CrowAgent sells. It names four fields, three of which (CrowCash, CrowCyber, CrowESG) plus a fourth (CSRD checker) are being conceded.
2. **`llms-full.txt` lines 10-27 (Products section) and 17-24 (CrowCash/CrowCyber/CrowESG paragraphs).** The same problem at greater length and detail, including a phrase that applies "ledger" (Tier B vocabulary) directly to a CrowAgent product description.
3. **`manifest.json` line 4.** The PWA description, `"The compliance and revenue platform for UK SMEs: PPN 002 social value, Cyber Essentials, VSME ESG reporting, and late-payment recovery."` This is machine-readable identity metadata that can surface in browser install prompts and app listings, and it names every conceded field in one sentence plus the word "compliance" as a category label.
4. **`changelog.xml` lines 22-27.** `"CrowCash AI credit control and accounts receivable from £79/mo"`. "Credit control" and "accounts receivable" are operational finance/accounting vocabulary, the closest linguistic overlap with Crowe's actual service lines found anywhere in this file set.
5. **`sectors/index.html`.** A human-facing hub page (not just a machine file) that structurally cross-sells CrowCash, CrowCyber and CrowESG alongside CrowMark under a "one platform, four engines" frame, uses "ledger" in the CrowCash row, and carries the "Qualify. Win. Get paid." tri-product tagline. Reinforced by its own CollectionPage JSON-LD.

---

## 2. Blog and glossary: KEEP / REWRITE / PARK

| Page | Verdict | Reasoning |
|---|---|---|
| `blog/csrd-omnibus-i-2026.html` | **PARK** (confirming prior call) | Entire premise is CSRD/Omnibus I, a CrowESG-adjacent EU sustainability-reporting topic. Every CTA points at the CSRD Applicability Checker. Two `[REQUIRES LEGAL VERIFICATION]` comments already flag unverified legal claims in the piece (lines 111, 184, 225, 238), which is a second, independent reason to retire rather than repair it. |
| `blog/cyber-essentials-v3-3-danzell-2026.html` | **PARK** (confirming prior call) | Entire premise is Cyber Essentials certification. Sidebar CTA is "Need to certify? Explore CrowCyber" (line 146); body includes CrowCyber pricing and feature detail (lines 192-204). Nothing in this post survives a rewrite to bid/tender software; the topic itself is the conceded field. |
| `blog/mfa-mandatory-2026.html` | **PARK** (confirming prior call) | Entire premise is an MFA implementation playbook for Cyber Essentials v3.3. CrowCyber CTA with pricing at lines 243-251. Same reasoning as above: the topic is the product being conceded, not adjacent to it. |
| `blog/ppn-014-cyber-essentials-guide.html` | **PARK** (confirming prior call) | PPN 014/21 is a cyber-security procurement policy note, not a social-value one. Despite the word "PPN" in the slug, the subject is Cyber Essentials certification, evidence and rejection reasons; CrowCyber is the lead CTA (line 231), CrowMark only second. Rewriting this to drop Cyber Essentials would leave almost no article. |
| `glossary/csrd.html` | **PARK** (confirming prior call) | Whole page is a CSRD definition. TL;DR literally states "not a CrowAgent product" (line 114) while the rest of the page and both rail cards (lines 169-181) funnel to the CSRD Checker and CrowESG. Parking removes the contradiction along with the risk. |
| `blog/find-first-public-sector-contract.html` | **KEEP** | Pure procurement how-to: Find a Tender vs Contracts Finder, SQ vs ITT, bid/no-bid, PPN 002. Only CTA is CrowMark (lines 258-264). Core defence territory. |
| `blog/ppn-002-social-value-guide.html` | **KEEP** | Core PPN 002/TOMs/Oxford SVB content, CrowMark-only CTAs (lines 314, 325-330). |
| `blog/procurement-act-2023-sme-guide.html` | **KEEP** | Core Procurement Act 2023 content (MAT/MEAT, Central Digital Platform, KPIs, exclusion). CrowMark-only CTA (lines 240-246). |
| `blog/social-value-portal-vs-crowmark.html` | **KEEP** | A CrowMark-vs-competitor comparison inside PPN 002 territory. CrowMark-only CTA (lines 259-264). (Separate, non-TM issue: two `REVIEW`-flagged unverified competitor price claims at lines 202 and 226; not part of this brief.) |
| `blog/regulatory-updates-2026.html` | **REWRITE** | Mixed. The PPN 002 section (lines 236-239) is on-topic and should stay. The CSRD Omnibus I section (lines 224-235), the "Cyber Essentials" reference in the CTA body (line 289), and the summary table's CSRD row (lines 258-263) all sit in conceded territory. UK Green Taxonomy and Biodiversity Net Gain sections (lines 240-245) are general environmental-law commentary unconnected to any CrowAgent product either way; they are informational, not promotional, so they can stay if the editorial call is to keep the page as a general regulatory-news roundup, or be cut if the page is renarrowed to procurement-only news. Recommend: keep PPN 002 section, cut or radically shorten the CSRD section, rewrite the CTA to be CrowMark-only, drop "Cyber Essentials" from the CTA body copy. |
| `blog/index.html` | **REWRITE** | The filter bar (lines 96-102) offers "Cyber Essentials" and "CSRD & ESG" as first-class topic filters, and the hero/meta description (lines 9, 70, 89) name PPN 002, Cyber Essentials v3.3, CSRD and late payment as the blog's four subjects. Once the four posts above are parked, the filter chips, their cards (lines 107-120, 139-145, 147-153, 195-201), and the copy need to drop to PPN 002 and general procurement-updates only. |
| `glossary/index.html` | **REWRITE** | Title "UK Compliance Glossary" (owner-approved swap to "procurement"; see line 8, 122). One defined term is "Cyber Essentials" (JSON-LD line 87, card at lines 186-190) and one filter chip is "Cyber security" (line 144). The term itself is informational (explaining a requirement bidders face) rather than a CrowAgent service claim, but it is the one piece of this page that sits inside the conceded field and reads oddly once CrowCyber is off the public site. Recommend dropping the "Cyber Essentials" term and the "Cyber security" filter chip, or keeping the term but stripping the filter category so the glossary does not present cyber security as one of the site's four organising pillars. |
| `glossary/ppn-002.html` | **KEEP** | Core PPN 002 definition, CrowMark-only CTAs. |
| `glossary/toms-framework.html` | **KEEP** | Core TOMs/social-value scoring definition, CrowMark-only CTAs. |

---

## 3. The "compliance matrix" question

**Where it appears in this file set:** `llms.txt` line 7 and `llms-full.txt` line 13, both inside the CrowMark product description: "It also provides bid-fit and coverage marking, a compliance matrix, e-sourcing, and Pink, Red and Gold reviews."

**The case for treating it as risk:** it contains the word "compliance," which is central to how accounting networks describe their own work, and Crowe's own site title is "Audit, Tax, Advisory, and Consulting Services." An adjudicator doing a quick conceptual read, rather than a specialist procurement read, could see "compliance" and file it next to Crowe's territory without pausing on the second word.

**The case for treating it as safe:** in UK public procurement, a compliance matrix is a specific, standard bid-management artefact: a table mapping each tender requirement (from the ITT or specification) to the bidder's response, used to prove nothing has been missed. It is genre-standard terminology, the direct procurement equivalent of a "traceability matrix" in engineering, and it appears here only as one named feature inside a described bid-drafting tool, never as a freestanding service claim like "compliance services" or "compliance consulting." It never appears divorced from the bid/tender context, and it is not a synonym for regulatory or financial compliance in the sense Crowe would use the word.

**Recommendation:** keep "compliance matrix" where it names this specific CrowMark feature, because it is precise, industry-standard, and always anchored to the tender-response context that makes the field-narrowing defence work in the first place; stripping it would make the product description less accurate without reducing real risk. Do not use the bare word "compliance" as a headline, category label, or positioning word elsewhere (that swap to "procurement" is already owner-approved). Where new copy is written, prefer "tender compliance matrix" or "requirements matrix" over a bare "compliance matrix" so the procurement context is unmistakable on first read, but this is a polish, not a requirement to change the existing phrase.

---

## 4. Detailed line-by-line findings

### 4.1 Machine-readable files (highest priority)

| File | Line | Current text (quoted) | Tier | Why it is a risk | Suggested replacement |
|---|---|---|---|---|---|
| `llms.txt` | 3 | `CrowAgent is a UK compliance-intelligence platform for small and mid-sized suppliers. Its flagship product is CrowMark... Alongside CrowMark, CrowAgent offers CrowCash (late-payment recovery), CrowCyber (Cyber Essentials), CrowESG (VSME reporting), and a free CSRD scope checker.` | C, B | Names all four conceded fields in the file every AI crawler reads first. "compliance-intelligence platform" is an unbounded category claim. | See full rewrite in section 5. |
| `llms.txt` | 7 | `CrowMark: ...compliance matrix, e-sourcing...` | B (safe, see §3) | Low risk; keep as bid-artefact term. | No change needed. |
| `llms.txt` | 8 | `CrowCash: Recovers overdue B2B invoices by applying the Late Payment of Commercial Debts (Interest) Act 1998 to the ledger...` | C, B | "ledger" is accounting vocabulary applied directly to a named product; whole line describes a conceded product as live. | Remove line entirely (product line no longer described on the public site). |
| `llms.txt` | 9 | `CrowCyber: Cyber Essentials certification co-pilot for UK SMEs...` | C | Describes a conceded product as live and offered. | Remove line entirely. |
| `llms.txt` | 10 | `CrowESG: VSME ESG reporting for UK SMEs...` | C | Describes a conceded product as live and offered. | Remove line entirely. |
| `llms.txt` | 11 | `CSRD checker: Free CSRD applicability checker...` | C | Names a conceded free tool as live. | Remove line entirely. |
| `llms.txt` | 16-23 | Free tools list: PPN 002 calculator, Cyber Essentials readiness, Late payment calculator, CSRD checker, VSME materiality light, plus two methodology links | C | 4 of 6 listed tools sit in conceded fields. | Reduce to PPN 002 calculator and its methodology page only. |
| `llms.txt` | 30-34 | Regulatory guides: Cyber Essentials v3.3, PPN 014/21, MFA mandatory, CSRD and Omnibus I | C | Links out to the four pages recommended for PARK above. | Remove these four bullet links; keep PPN 002 guide, Procurement Act 2023 guide, find-first-contract guide. |
| `llms.txt` | 63 | `Pricing: Plans and prices across CrowMark, CrowCyber, CrowCash, and CrowESG.` | C | Describes the Pricing page (out of this agent's file scope) as multi-product. | `Pricing: Plans and prices for CrowMark.` (confirm against actual Pricing page content, which another agent may be revising) |
| `llms-full.txt` | 3 | `CrowAgent is a UK compliance-intelligence platform for small and mid-sized suppliers. Its flagship product is CrowMark, a public-sector bid and tender management suite.` | C, B | Same "compliance-intelligence platform" framing as llms.txt. | See full rewrite in section 5. |
| `llms-full.txt` | 13 | `...bid-fit and coverage marking, a compliance matrix, e-sourcing, and Pink, Red and Gold reviews.` | B (safe, see §3) | Low risk. | No change needed. |
| `llms-full.txt` | 17-18 | `### CrowCash` section, `...applying the Late Payment of Commercial Debts (Interest) Act 1998 to the ledger: Bank of England base rate plus 8% statutory interest, plus fixed compensation per invoice.` | C, B | Whole section describes a conceded product; "ledger" again. | Remove section entirely. |
| `llms-full.txt` | 20-21 | `### CrowCyber` section | C | Describes a conceded product. | Remove section entirely. |
| `llms-full.txt` | 23-24 | `### CrowESG` section | C | Describes a conceded product. | Remove section entirely. |
| `llms-full.txt` | 26-27 | `### CSRD applicability checker (free)` section | C | Describes a conceded free tool. | Remove section entirely. |
| `llms-full.txt` | 53-58 | `## Cyber Essentials v3.3 (Danzell): what changed` section | C | Full section reproducing a PARK-verdict blog post. | Remove section entirely. |
| `llms-full.txt` | 61-65 | `## MFA mandatory from April 2026` section | C | Full section reproducing a PARK-verdict blog post. | Remove section entirely. |
| `llms-full.txt` | 69-73 | `## PPN 014/21: Cyber Essentials for the public sector` section | C | Full section reproducing a PARK-verdict blog post. | Remove section entirely. |
| `llms-full.txt` | 77-83 | `## CSRD and Omnibus I: what changed` section | C | Full section reproducing a PARK-verdict blog post. | Remove section entirely. |
| `llms-full.txt` | 87-89 | `## Social Value Portal vs CrowMark` | (none) | On-topic, CrowMark vs a named non-accounting competitor. | Keep as is. |
| `sitemap.xml` | 33 | `<loc>https://crowagent.ai/crowcyber</loc>` | A, C | Actively indexes a conceded product page. | Remove `<url>` block once `/crowcyber` is parked/noindexed (coordinate with whoever owns that page). |
| `sitemap.xml` | 39 | `<loc>https://crowagent.ai/crowcash</loc>` | A, C | Same. | Remove `<url>` block once parked. |
| `sitemap.xml` | 45 | `<loc>https://crowagent.ai/crowesg</loc>` | A, C | Same. | Remove `<url>` block once parked. |
| `sitemap.xml` | 67, 79, 85 | `<loc>.../tools/cyber-essentials-readiness</loc>`, `.../tools/csrd-applicability-checker</loc>`, `.../tools/vsme-materiality-light</loc>` | A, C | Indexes three conceded-field free tools. | Remove once those tool pages are parked. |
| `sitemap.xml` | 98, 110, 116 | Methodology-page equivalents of the three tools above | A, C | Same. | Remove once parked. |
| `sitemap.xml` | 160, 166, 172 | Blog posts: cyber-essentials-v3-3-danzell-2026, ppn-014-cyber-essentials-guide, mfa-mandatory-2026 | A, C | Indexes the three PARK-verdict Cyber Essentials posts. | Remove once posts are parked (noindexed or 410/301'd per the site's existing convention, see line 50-52 precedent). |
| `sitemap.xml` | 136 | Blog post: csrd-omnibus-i-2026 | A, C | Indexes the PARK-verdict CSRD post. | Remove once parked, same precedent. |
| `sitemap.xml` | 191 | `<loc>https://crowagent.ai/intel/cyber-essentials-tracker/</loc>` | A, C | An entire "intel" vertical dedicated to tracking Cyber Essentials regulation, not in this agent's file scope but its sitemap entry and JSON-LD are. | Remove once that page is parked. |
| `sitemap.xml` | 247 | `<loc>https://crowagent.ai/glossary/csrd</loc>` | A, C | Indexes the PARK-verdict glossary page. | Remove once parked. |
| `sitemap.xml` | 305, 311 | `/blog/category/csrd-esg`, `/blog/category/cyber-essentials` | A, C | Indexes two conceded-field category archive pages. | Remove once the underlying posts are parked and the categories no longer resolve. |
| `sitemap.xml` | 50-52 | Existing comment: `/csrd removed (2026-06-14, SEO audit): it is a noindex 301-style redirect stub... A noindex redirect should not appear in the sitemap.` | (none, precedent) | This is the site's own established practice for exactly this situation. | Cite as precedent when parking the URLs above; use the same noindex-then-remove-from-sitemap pattern. |
| `manifest.json` | 4 | `"description": "The compliance and revenue platform for UK SMEs: PPN 002 social value, Cyber Essentials, VSME ESG reporting, and late-payment recovery."` | C, B | Machine-readable app-identity metadata naming every conceded field plus "compliance" as the category word. | `"description": "UK public sector bid and tender software: find live tenders, draft grounded bids, and score PPN 002 social value."` |
| `manifest.json` | 12 | `"categories": ["business", "productivity", "utilities"]` | (none) | Generic app-store categories, not field-specific. | No change needed. |
| `changelog.xml` | 19 | `...a banned-phrase cleanup pass on the CrowCash product page.` | C | Names a conceded product in a public RSS description (low severity: describes a past internal cleanup, not a current offer). | See owner-decision note below; if kept, no wording change needed since it does not claim CrowCash is currently marketed. |
| `changelog.xml` | 27 | `CrowCyber Cyber Essentials co-pilot for UK SMEs supporting v3.3 Danzell from £99/mo; CrowCash AI credit control and accounts receivable from £79/mo; CrowESG repositioned as waitlist-only ahead of Q3 2026...` | C, B | Highest-risk single line in this file: "credit control" and "accounts receivable" are finance/accounting operational vocabulary, the closest overlap with Crowe's actual services anywhere in this file set, and the entry describes three conceded products as live with pricing. | See owner-decision note below. |
| `changelog.xml` | 43 | `CSRD applicability now requires both >1,000 employees AND >€450M turnover. CSRD Checker free tool updated to reflect new thresholds.` | C | Describes a conceded free tool as live. | See owner-decision note below. |
| `robots.txt` | (all) | — | (none) | Crawler directives only; the AI-crawler allow list is a deliberate, already-documented decision (lines 8-15) and is not itself a service claim. | No change needed. |
| `humans.txt` | 11 | `Compliance: UK PPN 002, Cyber Essentials, CSRD subject-matter contributors` | C, B | A public credit line naming Cyber Essentials and CSRD as CrowAgent subject-matter areas, plus "Compliance" as the team/category label. | `Procurement: UK public-sector procurement and PPN 002 subject-matter contributors` |
| `Assets/jsonld/blog--csrd-omnibus-i-2026.json` | 4-5 | Full `Article` schema for the PARK-verdict CSRD post | C | Structured data reinforcing a parked page's search presence. | Remove file once the post is parked. |
| `Assets/jsonld/glossary--csrd.json` | 4-5 | Full `DefinedTerm` schema for the PARK-verdict CSRD glossary entry | C | Same. | Remove file once the page is parked. |
| `Assets/jsonld/intel--cyber-essentials-tracker--index.json` | 4-5, 11-13 | `"headline": "Cyber Essentials Tracker — UK SME Cyber Compliance Updates"`, `"description": "Living changelog of NCSC Cyber Essentials regulation changes..."` | C, B | An entire structured-data record for a Cyber Essentials tracking vertical; "Compliance Updates" in the headline itself. | Remove file once the underlying `/intel/cyber-essentials-tracker/` page is parked. |

**Owner-decision note on `changelog.xml`:** a changelog is a historical record of what shipped and when. Rewriting past entries to hide that CrowCyber and CrowCash were once announced would misrepresent the company's own history, and this repo's other standing rule is never to falsify records. Two honest options: (a) leave the historical entries as a dated record of what was announced in the past (a changelog is not a live "products we sell" page, and a rational reader understands "announced 2026-05-03" is not "currently offered"), or (b) if the changelog itself must stop surfacing conceded-field vocabulary to AI crawlers because it is a public, actively-crawled RSS feed, add a root-level notice or exclude old entries from the public feed while keeping them in an internal record. I do not have enough context on the owner's intent for historical accuracy versus current-field narrowing to choose between these, so I am flagging it rather than asserting a rewrite. If the decision is (a), no line-level change is needed to changelog.xml; the risk is real but lower than the always-current llms.txt/manifest.json/sitemap.xml findings above, because a changelog's implicit timestamp is itself part of the defence ("this is what we announced then, not what we offer now").

---

### 4.2 sectors/

| File | Line | Current text (quoted) | Tier | Why it is a risk | Suggested replacement |
|---|---|---|---|---|---|
| `sectors/index.html` | 9 | (meta description) `CrowAgent helps UK teams qualify as suppliers, win contracts, and get paid, cited to the regulation that applies to you.` | D | "qualify... win... get paid" maps to the three-product narrative in prose form. | `CrowAgent helps UK teams find, win and evidence public sector tenders, cited to the regulation that applies to you.` |
| `sectors/index.html` | 67-70 | `SME Finance` card: `Overdue B2B invoices carry statutory interest... <a href="/crowcash">CrowCash</a>` | C | Names and links a conceded product; also a whole sector card built around it. | Remove this card. Replace the grid's ninth slot with a genuine CrowMark-relevant sector card (e.g. Housing Associations or Local Government, framed on tendering pressure) or reduce the grid to the sectors CrowMark genuinely serves. |
| `sectors/index.html` | 84-88 | `Professional Services` card: `Client and framework due diligence expects Cyber Essentials evidence... <a href="/crowcyber">CrowCyber</a>` | C | Names and links a conceded product. | Rewrite the card around CrowMark only, e.g. "Framework and OJEU-successor tenders reward a consistent, evidenced bid response." Remove the CrowCyber link. |
| `sectors/index.html` | 96-99 | `NHS Suppliers` card: `...alongside supplier security assurance. <a href="/crowmark">CrowMark</a><a href="/crowcyber">CrowCyber</a>` | C, B ("assurance") | Names a conceded product; "security assurance" brushes Tier B vocabulary. | `Framework bids weigh PPN 002 social value alongside a track record of on-time, evidenced delivery.` Remove the CrowCyber link. |
| `sectors/index.html` | 102-106 | `Manufacturing` card: entirely about CrowESG/EFRAG VSME supply-chain ESG requests | C | Whole card is a conceded-field pitch. | Remove this card; replace with a CrowMark-relevant sector if the grid needs to stay at nine, or drop to eight cards. |
| `sectors/index.html` | 108-112 | `Education` card: `<a href="/crowcyber">CrowCyber</a><a href="/crowcash">CrowCash</a>` | C | Two conceded-product links (this hub-page card is separate from the standalone `sectors/education.html`, which is clean). | `Public-sector contracts expect a consistent, well-evidenced bid and a track record of on-time delivery.` Remove both links; link only to `/crowmark` or the sector detail page. |
| `sectors/index.html` | 120-123 | `Large Corporates` card: entirely about CSRD Omnibus I scope and CrowESG, links to the CSRD checker | C | Whole card is a conceded-field pitch. | Remove this card. |
| `sectors/index.html` | 138-143 | "One platform, four engines" ledger block: rows for CrowMark, CrowCyber, CrowCash, CrowESG, including `<b>Statutory interest at Bank of England base + 8%</b>` and reused "ledger"-adjacent framing | C, B | The whole section's premise is "CrowAgent is four products." | Rewrite section to "How CrowMark works" and keep only the CrowMark row (line 139), removing the CrowCyber/CrowCash/CrowESG rows (140-142) and the CSRD cross-link (line 144). |
| `sectors/index.html` | 144 | `Not sure you are in CSRD scope? Run the free scope check, no account needed.` | C | Links a conceded free tool. | Remove line. |
| `sectors/index.html` | 152 | `Qualify. Win. <span class="paid">Get paid.</span>` | D | The tri-product tagline. | `Find the work. Win it. Prove you delivered.` (or similar two/three-beat line that maps only to CrowMark's find-draft-evidence workflow) |
| `sectors/construction.html` | 121 | `Working capital pressure from retention and slow payment sits with <a href="/crowcash">CrowCash</a>, and Cyber Essentials evidence for buyer due diligence sits with <a href="/crowcyber">CrowCyber</a>, so the whole qualify, win and get paid journey is covered by one platform.` | C, D | Same pattern repeats on all four sector detail pages; names two conceded products and restates the tri-product narrative. | `CrowMark covers the tender discovery, drafting and delivery-evidence workflow for construction bidders end to end.` |
| `sectors/construction.html` | 158 | `Qualify. Win. <span class="paid">Get paid.</span>` | D | Same tagline. | Same fix as above, applied consistently across all five pages that carry it. |
| `sectors/education.html` | 121 | `Cyber Essentials and data assurance for education due diligence sit with <a href="/crowcyber">CrowCyber</a>, and overdue invoices on delivered services sit with <a href="/crowcash">CrowCash</a>, so qualify, win and get paid is covered by one platform.` | C, D | Same pattern. | `CrowMark covers finding, drafting and evidencing education-sector tenders in one place.` |
| `sectors/education.html` | 158 | `Qualify. Win. <span class="paid">Get paid.</span>` | D | Same tagline. | Same fix. |
| `sectors/facilities.html` | 121 | `Cyber Essentials evidence for buyer due diligence sits with <a href="/crowcyber">CrowCyber</a>, and overdue payment on delivered services sits with <a href="/crowcash">CrowCash</a>, so qualify, win and get paid is covered by one platform.` | C, D | Same pattern. | `CrowMark covers finding, drafting and evidencing FM tenders in one place.` |
| `sectors/facilities.html` | 158 | `Qualify. Win. <span class="paid">Get paid.</span>` | D | Same tagline. | Same fix. |
| `sectors/highways.html` | 121 | `Cyber Essentials evidence for buyer assurance sits with <a href="/crowcyber">CrowCyber</a>, and overdue payment across the supply chain sits with <a href="/crowcash">CrowCash</a>, so qualify, win and get paid is covered by one platform.` | C, D, B ("assurance") | Same pattern plus one incidental "assurance". | `CrowMark covers finding, drafting and evidencing highways tenders in one place.` |
| `sectors/highways.html` | 158 | `Qualify. Win. <span class="paid">Get paid.</span>` | D | Same tagline. | Same fix. |

Everything else on the four sector detail pages (hero, context section, "How CrowMark helps" bullets, FAQ, FAQPage JSON-LD) is clean CrowMark/PPN 002/Procurement Act/social-value content and needs no change.

---

### 4.3 blog/ (per-file findings beyond the KEEP/REWRITE/PARK table above)

Since four posts are recommended for PARK, no line-level replacement copy is given for them; parking removes the risk at the page level rather than the sentence level. For the pages recommended KEEP, only two items need flagging:

| File | Line | Current text (quoted) | Tier | Why it is a risk | Suggested replacement |
|---|---|---|---|---|---|
| `blog/regulatory-updates-2026.html` | 289 | `See how CrowAgent helps UK suppliers and corporate teams stay on top of PPN 002 social value, Cyber Essentials, and CSRD reporting in one place. No consultants required.` | C | CTA names two conceded fields. | `See how CrowMark helps UK suppliers track PPN 002 social value and Procurement Act 2023 obligations in one place.` |
| `blog/regulatory-updates-2026.html` | 8, 74 | (meta/twitter description) `The most important UK and EU sustainability regulatory changes in 2026: CSRD Omnibus I, PPN 002 updates, Cyber Essentials v3.3, and what they mean.` | C | Meta description leads with two conceded topics. | If the CSRD section is cut per the REWRITE recommendation: `Key UK public procurement changes in 2026: the PPN 002 social value update and what it means for bidders.` If the section stays as general news, reframe to make clear it is commentary, not a CrowAgent service list. |
| `blog/index.html` | 9 | (meta description) `Plain-English guides on PPN 002 social value, Cyber Essentials v3.3, CSRD and late payment. Statute-cited resources for UK suppliers from CrowAgent.` | C | Names three conceded topics as the blog's subject matter. | `Plain-English guides on PPN 002 social value and UK public procurement. Statute-cited resources for UK bidders from CrowAgent.` |
| `blog/index.html` | 96-102 | Filter bar: `data-filter="cyber-essentials"`, `data-filter="csrd-esg"` | C | Structural: presents cyber and ESG as first-class blog pillars. | Remove both filter buttons once the underlying posts are parked; keep "All posts", "PPN 002", "Updates". |
| `blog/index.html` | 87 | `Statute, in plain English.` / sub: `Practical guides on the UK rules that decide whether you qualify, win and get paid.` | D | Tagline echo in the hero subhead. | `Practical guides on the UK rules that decide whether you find, win and deliver public sector work.` |

---

### 4.4 glossary/ (beyond the KEEP/REWRITE/PARK table)

| File | Line | Current text (quoted) | Tier | Why it is a risk | Suggested replacement |
|---|---|---|---|---|---|
| `glossary/index.html` | 8 | `<title>UK Compliance Glossary \| CrowAgent</title>` | B (approved swap) | "Compliance" as the page's category label. | `<title>UK Procurement Glossary \| CrowAgent</title>` |
| `glossary/index.html` | 122 | `<h1>Compliance terms, defined.</h1>` | B (approved swap) | Same. | `<h1>Procurement terms, defined.</h1>` |
| `glossary/index.html` | 74 | JSON-LD `"name":"UK Compliance Glossary","description":"...UK compliance terms that affect procurement, cyber security and sustainability reporting."` | B, C | "Compliance" label plus "cyber security and sustainability reporting" naming two conceded fields in structured data. | `"name":"UK Procurement Glossary","description":"Plain-English definitions of the UK public procurement and bidding terms that decide whether a supplier qualifies, wins and gets paid."` (reuse the DefinedTermSet description already at line 80, which is already clean) |
| `glossary/index.html` | 87, 144, 186-190 | `Cyber Essentials` defined term (JSON-LD and card) and `Cyber security` filter chip | C | Keeps a conceded-field term as one of the glossary's organising categories. | Drop the "Cyber security" filter chip (line 144); either remove the Cyber Essentials term entirely or keep the definition text but file it under "Procurement" with no dedicated filter category, since bidders do still need to know what it is when a buyer asks for it. |
| `glossary/index.html` | 9 | (meta description) `Plain-English definitions of the UK public procurement and bid terms that decide who qualifies, wins and gets paid.` | (none) | Already clean, no CrowCash/CrowCyber/CrowESG mention. | No change needed. |

---

### 4.5 tools/index.html and tools/ppn-002-calculator/index.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | Suggested replacement |
|---|---|---|---|---|---|
| `tools/index.html` | 9 | (meta description) `Free, statute-cited compliance checks for UK teams. PPN 002 social value, Cyber Essentials readiness, late payment interest, CSRD scope and VSME materiality. No account required.` | C, B | Names four conceded-field tools plus "compliance" as the category word, in one meta description. | `Free, statute-cited procurement checks for UK bidders. Score your PPN 002 social value weighting in minutes. No account required.` |
| `tools/index.html` | 58 | `<i>Free</i> <i class="d2">compliance</i> <i class="d3 paid">checks.</i>` | B (approved swap) | "Compliance" as the hero headline word. | `<i>Free</i> <i class="d2">procurement</i> <i class="d3 paid">checks.</i>` |
| `tools/index.html` | 61-64 | Chip row: `PPN 002`, `Cyber Essentials v3.3`, `Late Payment Act 1998`, `EFRAG VSME` | C | Three of four chips name conceded fields. | Reduce to a single PPN 002 chip, or add a second genuinely procurement-adjacent chip if one exists once the tool set is narrowed. |
| `tools/index.html` | 59, 75, 123 | `Five statute-cited tools for UK procurement, finance, IT and sustainability teams.` / `Each tool cites the source statute...` / `The four CrowAgent engines qualify you as a supplier, win the work and chase your own money, each cited to statute.` | C | Explicitly names "finance, IT and sustainability" as target markets, and describes four "engines". | `A statute-cited tool for UK procurement teams.` / (drop the four-engines sentence entirely, see next row) |
| `tools/index.html` | 86-90, 100-105, 107-112 | Tool cards for Cyber Essentials Readiness, CSRD Applicability Checker, VSME Materiality Light | C | Three of five tool cards are conceded-field products. | Remove these three cards; keep PPN 002 Calculator. Late Payment Calculator (lines 93-98) is CrowCash-adjacent territory (statutory interest on B2B debt) and should also be removed or flagged to the owner as a borderline case, since it is closer to commercial debt recovery than to accounting, but it is explicitly the free-tool front door to the CrowCash product being conceded. |
| `tools/index.html` | 118-152 | "The full platform" cross-sell: CrowMark, CrowCyber, CrowCash, CrowESG cards | C | Structural cross-sell of all three conceded products right on the free-tools hub. | Remove the CrowCyber, CrowCash and CrowESG cards (lines 132-149). Keep the CrowMark card, or drop the section to a single CrowMark CTA band. |
| `tools/index.html` | 158 | `Qualify. Win. <span class="paid">Get paid.</span>` | D | Tagline again. | Same fix as sectors/index.html. |
| `tools/ppn-002-calculator/index.html` | 177-178 | `<a href="/tools/cyber-essentials-readiness/">Cyber Essentials readiness</a> <a href="/tools/csrd-applicability-checker">CSRD scope check</a>` | C | Cross-links two conceded-field tools from a page that should be the model of the narrowed defence. | Remove both links; keep only `<a href="/tools">All free tools</a>`. |

Everything else on `tools/ppn-002-calculator/index.html` (hero, scorer form, methodology ledger, CrowMark CTA) is clean.

---

### 4.6 The five tools-\*-methodology.html pages

Four of these five pages are entire long-form articles whose sole subject is a conceded field. Unlike a blog post, there is no informational/promotional distinction to weigh here: a methodology page exists specifically to explain how a tool works, and the tool itself is what is being conceded, so there is no version of these four pages that survives a rewrite. Recommendation: PARK all four (noindex, remove from sitemap, remove the cross-links to them), consistent with parking their parent tool pages, which sit outside this agent's file scope but are referenced throughout.

| File | Verdict | Why |
|---|---|---|
| `tools-csrd-checker-methodology.html` | **PARK** | Entire page is Omnibus I/CSRD threshold methodology; every CTA and reference is CSRD/VSME/CrowESG (e.g. lines 165, 194). |
| `tools-cyber-essentials-readiness-methodology.html` | **PARK** | Entire page is Cyber Essentials v3.3 control methodology; CTA is "the full CrowCyber platform" (line 166). |
| `tools-late-payment-calculator-methodology.html` | **PARK** | Entire page is Late Payment Act 1998 interest methodology; CTA is "Those capabilities live in CrowCash" (line 163). |
| `tools-vsme-materiality-light-methodology.html` | **PARK** | Entire page is EFRAG VSME materiality-screen methodology; CTA is "the CrowESG platform" (lines 150, 159). |
| `tools-ppn002-calculator-methodology.html` | **KEEP** | Entire page is PPN 002/TOMs/Oxford SVB methodology; every reference is CrowMark (lines 138, 161). Core defence territory, no changes needed beyond a light pass if "compliance" appears (it does not in this page). |

Representative highest-risk lines from the four PARK pages, for completeness:

| File | Line | Current text (quoted) | Tier |
|---|---|---|---|
| `tools-csrd-checker-methodology.html` | 21 | (meta description) `Full methodology behind the CSRD Applicability Checker. Omnibus I thresholds (>1,000 employees AND >€450M turnover), three-layer engine, edge cases, references.` | C |
| `tools-cyber-essentials-readiness-methodology.html` | 21 | (meta description) `Methodology behind the Cyber Essentials Readiness Check: v3.3 (Danzell) controls covered, scoring approach, 14-day patch SLA logic, and MFA gap detection.` | C |
| `tools-late-payment-calculator-methodology.html` | 21 | (meta description) `Full methodology behind the Late Payment Interest Calculator. The Late Payment of Commercial Debts (Interest) Act 1998: BoE base + 8 pp, £40/£70/£100 tiers.` | C |
| `tools-vsme-materiality-light-methodology.html` | 21 | (meta description) `Full methodology behind the VSME Materiality Light tool. EFRAG VSME (2024), six-step screen, double-materiality lite, references for SMEs.` | C |

---

### 4.7 404.html

| File | Line | Current text (quoted) | Tier | Why it is a risk | Suggested replacement |
|---|---|---|---|---|---|
| `404.html` | 21, 38, 48 | (description, og:description, twitter:description) `Page not found. Find your way back to compliance, CrowAgent.` | B (approved swap) | "Compliance" as the category word. | `Page not found. Find your way back to CrowAgent.` |
| `404.html` | 75 | `<span>Lost in</span> <span class="text-ca-teal-d">compliance.</span>` | B (approved swap) | Same word as the page's visual punchline. | `<span>Lost in</span> <span class="text-ca-teal-d">procurement.</span>` |
| `404.html` | 113-114 | Popular-paths grid: `<a href="/crowcyber">CrowCyber</a> <a href="/crowcash">CrowCash</a>` | C | Two conceded products presented as top-level "popular paths" on a page every broken link funnels through. | Replace with `<a href="/sectors">Sectors</a>` and `<a href="/compare">Compare</a>`, keeping CrowMark, CSRD Checker link (line 116, pending its own PARK decision elsewhere), Pricing and Blog. |

---

## 5. Complete rewritten llms.txt

```
# CrowAgent

> CrowAgent is UK public sector bid and tender software for small and mid-sized suppliers. Its product, CrowMark, finds live tenders on Contracts Finder and Find a Tender, drafts answers grounded in the supplier's own submitted bids with deterministic figure-checking and PPN 017 AI disclosure, scores social value against the PPN 002 model, and evidences delivery under the Procurement Act 2023. The pages below are plain, statute-cited explainers and a free calculator written for UK public procurement.

## Product

- [CrowMark](https://crowagent.ai/crowmark): UK bid and tender suite. Daily tender discovery, grounded answer drafting, bid-fit and coverage marking, tender compliance matrix, e-sourcing, Pink/Red/Gold reviews, PPN 002 social value, and post-award delivery evidence. From £49/month.

## Free tools

- [Tools hub](https://crowagent.ai/tools): Free, statute-cited procurement checks for UK bidders. No account required.
- [PPN 002 social value calculator](https://crowagent.ai/tools/ppn-002-calculator): Score a UK public-sector bid against the mandatory 10% social-value floor, cited to National TOMs and Oxford SVB proxies.
- [PPN 002 calculator methodology](https://crowagent.ai/tools/ppn-002-calculator/methodology): How the PPN 002 social-value score is computed.

## Regulatory guides

- [PPN 002 social value: complete guide](https://crowagent.ai/blog/ppn-002-social-value-guide): What PPN 002 requires, the five themes, and how buyers score social value with National TOMs at a 10% minimum weighting.
- [The Procurement Act 2023 for SME bidders](https://crowagent.ai/blog/procurement-act-2023-sme-guide): What changed from 24 Feb 2025: MAT replaces MEAT, the Central Digital Platform and Find a Tender, s.52 KPIs on contracts over £5m, and what it means day-to-day for SMEs.
- [How to find and win your first UK public sector contract](https://crowagent.ai/blog/find-first-public-sector-contract): Where to look (Find a Tender vs Contracts Finder), how to read a tender, SQ vs ITT, the bid/no-bid decision, and PPN 002 social value.
- [Blog index](https://crowagent.ai/blog/): CrowAgent's UK public procurement guides and updates.

## Comparisons

- [Compare CrowMark](https://crowagent.ai/compare): Honest, sourced head-to-heads of CrowMark against the UK bid tools suppliers shortlist, with published pricing and a dated source for every competitor figure.
- [CrowMark vs AutogenAI](https://crowagent.ai/compare/crowmark-vs-autogenai): SME bid suite with published pricing from £49/month against an enterprise engine that quotes on request.
- [CrowMark vs mytender.io](https://crowagent.ai/compare/crowmark-vs-mytender-io): Figure-grounding and published pricing against a UK private-cloud drafting platform.
- [CrowMark vs CleanTender](https://crowagent.ai/compare/crowmark-vs-cleantender): Sector-agnostic bid suite against a soft facilities-management specialist; both publish pricing.
- [CrowMark vs SwiftBid](https://crowagent.ai/compare/crowmark-vs-swiftbid): Subscription suite from £49/month against a per-bid AI writing service, with the break-even worked through.
- [Social Value Portal vs CrowMark](https://crowagent.ai/blog/social-value-portal-vs-crowmark): How CrowMark compares to the Social Value Portal for UK suppliers.

## Sectors

- [Construction](https://crowagent.ai/sectors/construction): How CrowMark helps construction bidders win framework and project work (SCAPE, Pagabo, Fusion21, PPN 002 social value).
- [Facilities management](https://crowagent.ai/sectors/facilities): Bid and tender support for FM providers (TUPE, mobilisation, CCS facilities frameworks).
- [Highways](https://crowagent.ai/sectors/highways): Tender support for highways and term-maintenance contracts (NEC4, National Highways, DfT).
- [Education](https://crowagent.ai/sectors/education): Bidding for education contracts and frameworks (DfE, CCS, multi-academy trusts).

## Reference

- [Glossary](https://crowagent.ai/glossary/): Definitions of UK public procurement and bid terms.
- [PPN 002 glossary entry](https://crowagent.ai/glossary/ppn-002): Definition of Procurement Policy Note 002.
- [National TOMs framework glossary entry](https://crowagent.ai/glossary/toms-framework): Definition of the Themes, Outcomes and Measures framework.

## Company

- [About](https://crowagent.ai/about): Who CrowAgent is and what the platform does.
- [Pricing](https://crowagent.ai/pricing): Plans and prices for CrowMark.
- [Roadmap](https://crowagent.ai/roadmap): What is live, in development, and planned.
- [Security](https://crowagent.ai/security): How CrowAgent handles data and security.
- [FAQ](https://crowagent.ai/faq): Common questions about the platform.
- [Contact](https://crowagent.ai/contact): How to reach CrowAgent.
- [Changelog](https://crowagent.ai/changelog): Recent product changes.
```

**Notes on this rewrite:** I removed the CrowCash, CrowCyber, CrowESG and CSRD Checker product entries, the free tools tied to them, the four Cyber Essentials/CSRD regulatory guide links, the Reference entry for the CSRD glossary page, and narrowed the Company/Pricing line, consistent with the instruction that these three products are being taken off the public site. I did not invent any new CrowMark capability; every feature named in the CrowMark bullet is copied from the existing, verified product description elsewhere in this same file. I changed "compliance matrix" to "tender compliance matrix" only in this one instance, as a low-cost precision improvement (see section 3); the unqualified phrase elsewhere is not a required change. If Pricing, Roadmap, Security, FAQ, About or Contact (all out of my file scope) still describe multiple products, the Company section above will need a second pass once those pages are narrowed, since I have not read them and cannot confirm their current wording.

---

## 6. Complete rewritten llms-full.txt

```
# CrowAgent, full reference corpus

CrowAgent is UK public sector bid and tender software for small and mid-sized suppliers. Its product, CrowMark, is the flagship and only product currently described on this site. This file collects the product summary and the plain-language regulatory guides published on crowagent.ai so they can be quoted directly. All figures are cited to the source page; where a rule is proposed rather than in force, it is labelled as such.

Source: https://crowagent.ai/llms-full.txt
Contact: Crow Agent, crowagent.platform@gmail.com

---

## Product

### CrowMark
CrowMark is CrowAgent's UK bid and tender suite, live and paid, and still in active development. It tracks Contracts Finder and Find a Tender daily, drafts social-value answers grounded in the supplier's own submitted bids, and evidences delivery under the Procurement Act 2023. It also provides bid-fit and coverage marking, a tender compliance matrix, e-sourcing, and Pink, Red and Gold reviews. From £49/month.

Two grounding rules define CrowMark. First, every pound and percentage that appears in generated prose has to exist in an allowed-figure set computed from the supplier's own data before a draft is released; if it does not, the draft is rejected, so the language model is never the source of a figure. Second, every AI-assisted draft carries a PPN 017 AI-transparency disclosure, and a person has to approve the answer before it is submitted.

---

## PPN 002 social value: the complete guide

Procurement Policy Note 002 (PPN 002) is a UK government policy, published in 2021, that requires central government contracting authorities to evaluate social value as part of their procurement process. It mandates a minimum 10% weighting for social value in the evaluation of central government contracts above £5 million.

The policy builds on the Public Services (Social Value) Act 2012 and the earlier PPN 06/20. While PPN 002 applies directly to central government departments and their agencies, many local authorities, NHS trusts, and other public-sector bodies have voluntarily adopted the same framework or a similar social-value evaluation standard. In practice, social-value scoring is now a standard feature of UK public-sector procurement.

PPN 002 organises social value around five strategic themes, each aligned with a UK government policy priority. Not all five themes apply to every contract: the contracting authority selects which themes are relevant based on the nature of the contract, the geography, and the buyer's policy priorities.

Most UK public-sector buyers score social value using the National TOMs (Themes, Outcomes and Measures) Framework. TOMs provides a structured methodology in which each of the five PPN 002 themes maps to specific Outcomes, and each Outcome is measured through specific Measures.

Note on dates: the current PPN 002 model is dated February 2025 and is mandatory from 1 October 2025, with a 10% minimum social-value weighting.

---

## The five PPN 002 social value themes

PPN 002 organises social-value commitments around five mandatory themes. Each theme addresses a distinct area of public policy, and bidders are expected to demonstrate how their delivery will contribute to one or more themes through specific, measurable commitments. Before PPN 002, social value was often treated as a qualitative afterthought; the policy note changed this by requiring a structured, measurable approach with specific themes, outcomes, and measures that bidders must address.

The first theme covers community recovery: supporting local employment by creating jobs in the contract delivery area, directing spend through local supply chains, and engaging SMEs and voluntary, community and social enterprises (VCSEs) as subcontractors or delivery partners. In practice this means demonstrating how contract delivery will generate employment, prioritise local suppliers, and build capacity in smaller organisations. Bidders should provide specific commitments: the number of local jobs created, the percentage of supply-chain spend directed locally, and the types of SME or VCSE partners they plan to engage. The remaining themes cover tackling economic inequality, fighting climate change, equal opportunity, and wellbeing.

---

## The Procurement Act 2023: what SME bidders need to know

The Procurement Act 2023 went live on 24 February 2025 and replaced the Public Contracts Regulations 2015. The Most Advantageous Tender (MAT) replaces the Most Economically Advantageous Tender (MEAT), signalling that award can weigh wider value, not only price. A Central Digital Platform lets suppliers register core details once and reuse them across bids, and underpins the Find a Tender service. Public contracts with an estimated value above £5 million must carry at least three published KPIs, assessed and published at least once a year under section 52. Section 12 requires contracting authorities to have regard to the particular barriers SMEs may face.

---

## Social Value Portal vs CrowMark

Both address UK social-value scoring, but from different sides. The Social Value Portal is a measurement and reporting platform widely used by buyers and suppliers to record and report social-value commitments against the National TOMs. CrowMark is a supplier-side bid suite: it helps a supplier find tenders, draft grounded answers, and calculate a PPN 002 social-value figure deterministically in code as part of writing and submitting a bid. CrowMark uses a curated catalogue of 19 social-value measures aligned to National TOMs conventions and applies unit-aware arithmetic against the 2025 PPN 002 model of five missions (M1 to M5) and eight policy outcomes. It is not a full National TOMs implementation, and the AI never computes the total.
```

**Notes on this rewrite:** I removed the CrowCash, CrowCyber, CrowESG and CSRD-checker product sections and the Cyber Essentials v3.3, MFA-mandatory, PPN 014/21 and CSRD/Omnibus I regulatory sections in full, since each is a conceded topic with no CrowMark-relevant remainder. I added a short Procurement Act 2023 section built entirely from facts already stated, word-for-word in substance, in `blog/procurement-act-2023-sme-guide.html` (read as part of this audit), since the original llms-full.txt did not have one and the file's own "Regulatory guides" list in llms.txt references that guide; I did not invent any figure or claim not already present in that page. I kept the PPN 002 and Social Value Portal sections unchanged except for the same "tender compliance matrix" precision edit as llms.txt. As with llms.txt, I have not read About/Pricing/Roadmap/Security/FAQ, so this file does not summarise them; the original did not either.

---

## 7. Ambiguous items (flagged, not asserted)

| Item | Reasoning for both readings |
|---|---|
| `sectors/index.html` and `sectors/*.html`, repeated phrase "advisory step" / "advisory and are not legal advice" (e.g. `sectors/construction.html` lines 120-121) | Could be read as brushing Crowe's "advisory" service line. More likely fine: in every instance it is a disclaimer describing CrowMark's own KPI-tracking feature as advisory in nature ("not legal advice"), not a claim that CrowAgent offers advisory services to the market. Recommend keeping; flagging only because the word itself appears on Crowe's own service list. |
| `glossary/index.html` "Cyber Essentials" defined term | Could be read as keeping CrowAgent visibly present in the Cyber Essentials/cyber-security field via its glossary. More likely fine as a standalone definition: a bidder does need to know what Cyber Essentials is even if CrowCyber is off the public site, because buyers still ask for it, and defining a requirement is not the same as offering to meet it. See recommendation in section 4.4 to drop the "Cyber security" filter chip regardless, since that is the more structural signal. |
| `blog/regulatory-updates-2026.html` UK Green Taxonomy and Biodiversity Net Gain sections | Could be read as keeping CrowAgent in the ESG/sustainability commentary space even after CrowESG is conceded. More likely fine: this is general environmental-law journalism unconnected to any CrowAgent product on either side of the ledger (no CTA, no product mention in these two sections), which is closer to "explaining a regulation" than "promoting a parked product." Recommend keeping if the page survives as a general regulatory-news roundup, per the REWRITE verdict in section 2. |
| `changelog.xml` historical entries generally | See the dedicated owner-decision note at the end of section 4.1. This is the single largest open question in this audit: whether a changelog's implicit past tense is sufficient protection on its own, or whether the file needs active pruning because it is a live, crawled, public RSS feed. |

---

## 8. What I did not find (negative confirmations, since a previous sweep is known to have missed things)

- No occurrence of "bookkeeper", "Bookkeepers", or "bookkeeping" in any of the audited files.
- No occurrence of "member firm", "global network" (or "network" used in Crowe's organisational sense), "professional services" (as a category label), "smart decisions", "lasting value", or "deliver excellence".
- No third-party accounting/finance brand logos or names (Xero, QuickBooks, Sage, Experian, Creditsafe, or any named bank) in any of the audited files.
- "Audit trail" / "audit log" occur only as product-security-feature language (e.g. the meta description of `blog/ppn-002-social-value-guide.html`) and are correctly out of scope per the brief's context rules; not flagged above.
- "Assurance" and "accountancy" do not otherwise occur; "accounting" occurs only inside "accounts receivable" in `changelog.xml` line 27, already flagged as a top-five item.

---

## 9. Questions for the owner

1. **Changelog policy.** Should historical `changelog.xml` entries describing CrowCyber/CrowCash be left as a dated record, or actively pruned/excluded from the public RSS feed? I have not assumed an answer (section 4.1, owner-decision note).
2. **Late Payment Calculator.** It sits closer to commercial debt recovery than to accounting proper, but it is the CrowCash product's free-tool front door. Should it be parked alongside CrowCash, or does it survive as a standalone utility? I have recommended removal from `tools/index.html`'s grid pending this decision (section 4.5).
3. **Pricing/Roadmap/Security/FAQ/About/Contact pages.** These are referenced by `llms.txt`'s Company section but are outside my assigned file list. My rewritten `llms.txt` narrows the Pricing description to CrowMark only; someone should confirm the actual Pricing page (likely in the other agent's scope) matches before this goes live, since I have not read it.
4. **`/intel/cyber-essentials-tracker/`.** Its JSON-LD is in my scope and flagged for removal, but the page itself, and any other files under `/intel/`, are not in my file list. Recommend confirming this entire vertical is being parked alongside CrowCyber.
