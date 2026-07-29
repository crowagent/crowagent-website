# CrowAgent Website — Content, SEO, IA and Conversion Audit (Phase 2)

**Date:** 2026-07-29
**Scope:** 41 live pages (`stripe-sample/index.html` excluded — see Section 6). Report only; nothing in the repo was changed.
**Method:** Raw HTML read directly from disk, cross-checked against `docs/legal/tm-remediation/rendered-text/*.txt`, live requests to `http://localhost:8092`, `_redirects`, `sitemap.xml`, `robots.txt` and `js/nav-inject.js` (the site's shared nav/footer injector — see the methodology note in Section 3). One discrepancy: the rendered-text snapshots pre-date a same-day homepage edit (hero H1 and meta description), so anything time-sensitive was verified against the live file, not the snapshot.

---

## EXECUTIVE SUMMARY

1. **`privacy.html` still describes three retired, legally-conflicted products in live, indexed legal text** — Xero/QuickBooks integration under "Accounting (CrowCash)", an M365/Google Workspace connector under "Security posture (CrowCyber)", and "CrowESG report drafting" as a named Anthropic sub-processor use case (lines 503, 575, 623, 627, 629, 646, 670). Every other page in the site was scrubbed of CrowCyber/CrowCash/CrowESG on 2026-07-28; the Privacy Policy — the one legal document a cautious buyer or a trademark counterparty is most likely to read closely — was missed entirely.
2. **The site injects a second, conflicting Organization JSON-LD block on every page**, via a broken idempotency guard in `js/nav-inject.js` (checks for an attribute, `data-ca-orgld`, that no static markup ever sets). On `index.html` and `resources.html`, which already carry their own static Organization schema, this produces two Organization graphs for the same `@id` with different names, emails, logos and — critically — different X/Twitter handles (`@crowagent_ai` vs. `x.com/CrowAgentLtd`, the latter wrong and appearing nowhere else on the site).
3. **The homepage hero contradicts itself one screen down.** H1 (`index.html:511`) is "Qualify. Win. Get paid." The section immediately below it (`index.html:585-602`) is headed "Three stages. One product." and names the three stages Find, Draft, Evidence. Two different three-part frames for the same journey, on the same page, in the same scroll.
4. **The canonical one-line description is supplier-only and the site has quietly patched around it rather than fixing it.** It appears byte-identical in 9 places (about.html ×3, index.html ×3, manifest.json, and twice via nav-inject.js) and says nothing about buyers. Two other places (faq.html, llms.txt) append extra sentences to smuggle the buyer side in, which means the "byte-identical everywhere" claim in the code's own comment is false, and the canonical description itself is stale.
5. **Trust signals are close to zero.** No testimonial, no customer logo, no case study, no named founder, no third-party review. "Speak directly with the founders" (contact.html:180) is the only mention of founders anywhere, and it never names one. The ISO 27001 claim is honestly caveated on `security.html` ("aligned... formal certification planned for Phase 2") but the caveat doesn't travel with the badge that appears on the homepage hero.

Below that: 12 pages (all 5 blog posts bar the index, all 4 comparison pages plus the compare hub, plus two others) ship with **no meta description and no Open Graph/Twitter tags at all** — exactly the content-marketing pages meant to be shared and to rank. `integrations.html` is missing from `sitemap.xml`. `about.html`'s JSON-LD says `foundingDate: 2025`; the page's own visible timeline says "March 2026". `products/crowmark/index.html` is a dead, unreachable stub nothing links to and production 301s over before it's ever served — safe to delete outright.

---

## 1. MESSAGE CONSISTENCY

**The core positioning statement is inconsistently applied.**

The canonical sentence — *"CrowAgent helps UK suppliers find the work, draft answers grounded in their own past bids, and evidence delivery after award."* — appears byte-identical in exactly **9** places:

| # | Location |
|---|---|
| 1-3 | `about.html` meta description (:31), og:description (:146), twitter:description (:157) |
| 4-6 | `index.html` meta description (:10), og:description (:20), body `<p class="sub">` (:522) |
| 7 | `manifest.json:4` |
| 8-9 | `js/nav-inject.js` — injected footer tagline (:471) and injected Organization JSON-LD `description` (:1375), both of which land on all 39 pages that load the script |

Two more places **extend** it rather than repeat it verbatim: `faq.html` (:82 JSON-LD, :163 body) and `llms.txt` (:3) both append "*Its product, CrowMark, drafts every answer from your own submitted bids… It serves both sides of a procurement. CrowMark for Suppliers answers tenders… CrowMark for Buyers builds and publishes requirements… Both work in the public sector and the private sector.*" The comment at `index.html:512-521` claims "keeping every one of those byte-identical matters" — but two of the locations it lists (llms.txt, the FAQ answer) are demonstrably not byte-identical. **The canonical description predates the buyer side and the site knows it**: rather than rewrite the description, whoever wrote the FAQ and llms.txt patched around it by bolting an explanatory paragraph on the end. That is the honest signal that the description no longer serves as written — it should be rewritten to mention both sides, or the patch pattern should be applied everywhere it appears.

**"CrowMark for Suppliers" vs. "CrowMark for Buyers" — the two-product framing is not carried through the site.** `CrowMark for Suppliers` appears on 15 pages; `CrowMark for Buyers` on only 8 (`about`, `compare/index`, `contact`, `crowmark`, `faq`, `index`, `pricing`, `roadmap`). Seven pages mention Suppliers and never mention Buyers at all:

- `sectors/index.html:55` — "*Different rules, one product. See what decides whether you win the tender in your sector, and how **CrowMark for Suppliers** helps you answer it.*" (literally frames the product as singular/supplier-only)
- `sectors/construction.html:93` and the parallel line on `sectors/education.html`, `sectors/facilities.html`, `sectors/highways.html` — all four sector pages pitch supplier-only
- `resources.html:101` — "built around CrowMark for Suppliers"
- `tools/index.html:137` — "CrowMark for Suppliers takes the same sourced approach across the whole bid"

If sector pages and the tools/resources hubs are meant to serve buyer-side visitors too (councils, NHS trusts evaluating bids — which `contact.html`'s own subject dropdown offers as an option, see Section 8), none of those pages currently give them anything to read.

**The homepage headline contradicts the section directly below it.** `index.html:511` — `<h1>Qualify. Win. <span class="paid">Get&nbsp;paid.</span></h1>`. This is a deliberate, well-documented owner decision (see the code comment at `index.html:492-510`, dated 2026-07-29): the three verbs are being reused with new meaning (Qualify = SQ/PQQ handling, Win = drafting, Get paid = payment-follows-evidenced-delivery), replacing an earlier version that literally named the three parked products. The reasoning is sound in isolation. What it doesn't account for is that the very next section on the same page, `index.html:584-606` ("The bid journey" / "Three stages. One product.") frames the identical customer journey with a **different** three-part structure: **Find, Draft, Evidence**. A visitor reads "Qualify. Win. Get paid." then, one scroll down, "Three stages… Find… Draft… Evidence" for what is presented as the same journey. Neither set of verbs maps cleanly onto the other (Qualify ≠ Find, Get paid ≠ Evidence). This reads as two different people wrote two different metaphors for the same product without checking each other's work — which, per the comment trail, is close to literally what happened.

**Structured data disagrees with visible copy on company facts.**
- `index.html:54` (static JSON-LD): `"foundingDate":"2025"`.
- `about.html` visible timeline and "Company details" panel: "**March 2026** — CrowAgent founded… Incorporated as CrowAgent Ltd" and "Founded: **March 2026**" (both in `about.html`, confirmed live).
One of these is wrong. A crawler reading the machine-readable field gets a different founding year than a human reading the page.

**Three different Organization identities compete in JSON-LD** (full detail in Section 4, SEO — flagged here because it is a message-consistency defect first and a technical one second):
- `index.html:54` (static): name `"CrowAgent"`, email `crowagent.platform@gmail.com`, contact name "Crow Agent", logo = wordmark PNG, `sameAs` → `x.com/crowagent_ai`, LinkedIn `/company/crowagent-ltd/`.
- `resources.html:51` (static): name `"CrowAgent"`, email `hello@crowagent.ai` (different), logo = same wordmark PNG, `sameAs` → `x.com/crowagent_ai`, LinkedIn `/company/crowagent` (different slug, no `-ltd`).
- `js/nav-inject.js:1356-1384` (injected on **every** page, including the two above, because its idempotency guard checks for an attribute nothing ever sets — see Section 4): name `"CrowAgent Ltd"` (name/legalName swapped vs. #1), email `hello@crowagent.ai`, logo = `og-image.png` (a third file), `sameAs` → `x.com/CrowAgentLtd` (wrong handle — every `twitter:site` meta tag on the site, checked on all 39 pages, says `@crowagent_ai`).

**Positive control:** the retired-product scrub itself is otherwise thorough and well-documented. A sitewide grep for `CrowCyber`, `CrowCash`, `CrowESG` and `CSRD` turns up dozens of hits, but with the single exception of `privacy.html` (Section 6/Executive Summary #1), every live hit is inside an HTML developer comment explaining what was removed and why — not user-facing text. That is a genuinely disciplined piece of remediation work; it just missed one document.

---

## 2. PAGE-BY-PAGE PURPOSE

See the full table in the **Page-by-Page Table** section below. Headline patterns:

- **No clear job / no CTA:** `glossary/index.html` has zero conversion links anywhere on the page (no `/contact`, no Calendly) — it's a pure reference hub with nowhere to go next except individual terms. `security.html` has exactly one CTA-styled link on the whole page and it points to the external status page (`https://status.crowagent.ai`), not to `/contact` or Calendly — the page most likely to be read by a security-conscious enterprise evaluator has no path to convert.
- **Competing CTAs:** none found — no page has two primary CTAs fighting for the same click. The hierarchy (primary = request access / talk to sales / book a demo; secondary = explore product / view pricing / try free tool) is generally well disciplined.
- **CTA framing is inconsistent between "Request access" and "Book a demo" as the lead action.** Most pages lead with "Request access" (primary) and offer Calendly as secondary. `about.html` and `contact.html` invert this — "Book a 15-minute demo" / "Book a 30-minute call" is the primary button, with no `/contact?enquiry=beta-access` link at all on `about.html`. Minor, but on a benchmark of Stripe/Linear/Vercel-level discipline, the primary conversion action should be the same button, in the same order, everywhere.
- **`products/crowmark/index.html`** exists to do nothing: a meta-refresh + JS-redirect stub to `/crowmark`, not linked from anywhere in the site (confirmed zero inbound links, confirmed absent from `sitemap.xml`), and shadowed in production by a `_redirects` 301 rule that fires before the file is ever served. It also contains a malformed nested `<style><style>` tag. Dead weight; delete it.

---

## 3. INFORMATION ARCHITECTURE

**Methodology note, load-bearing for this whole section:** the site's primary navigation and entire footer (which alone carries 15+ sitewide links — About, Blog, FAQ, Glossary, Changelog, Roadmap, Contact, Partners, Sectors, Security, Privacy, Terms, Cookies) are **not present in the static HTML**. They are injected client-side by `js/nav-inject.js`, present on 39 of 41 pages (absent only from the Google-verification stub and the `products/crowmark` redirect stub, neither a real content page). A naive static-HTML link-graph analysis of this site is badly misleading — it reports most of the site as unreachable from the homepage, which is false once the injected nav/footer is accounted for. Googlebot renders JavaScript and will see these links; a user with JavaScript disabled or failing will not (there is a `<noscript>` fallback only on the contact form, not for navigation generally).

With the injected nav/footer counted, **real click-depth from home is shallow and healthy**: every hub page (`/blog`, `/compare`, `/glossary`, `/sectors`, `/tools`, `/faq`, `/resources`, `/roadmap`, `/changelog`, `/about`, `/partners`, `/security`, `/privacy`, `/terms`, `/cookies`) is one click from home via the footer, and every leaf page under those hubs (blog posts, comparison pages, sector pages, glossary terms) is two clicks. Nothing on the site sits beyond depth 2. This is genuinely good and should be preserved.

**Confirmed orphans:**
- `products/crowmark/index.html` — zero inbound links from any page, absent from `sitemap.xml`, and shadowed by a production redirect. Dead file (see Section 2).
- `stripe-sample/index.html` — see Section 6, it's an unrelated leftover template, not part of the site's IA at all, but it is publicly served and crawlable (robots.txt is `Allow: /` sitewide with no exclusion for it).

**Sitemap vs. reality:** `sitemap.xml` lists 39 URLs. All 39 resolve to a real page. Two require `_redirects` rewrites that the local dev server (a static file server that does not process `_redirects`) cannot verify directly — `/tools/ppn-002-calculator/methodology` and `/blog/category/ppn-002` / `/blog/category/regulatory-updates`. These were checked by reading `_redirects` directly: the rewrite rules exist, sit above the terminal `/* → 404.html` splat (confirmed by reading the whole file — the splat's own comment notes an earlier incident, fixed 2026-07-28, where 11 rules including these four sitemapped URLs sat *below* the splat and 404'd in production; that fix is in place now), and their destinations exist on disk. These should be fine live; treat as verified-by-file-reading rather than verified-by-request.

**Not in the sitemap but should be:** `integrations.html` is a real, fully-optimized page (canonical tag, complete OG/Twitter, `robots: index,follow`) and is absent from `sitemap.xml` entirely. `404.html` is correctly absent (expected).

**Thin/duplicated coverage:** none found at a concerning level. The four sector pages (construction, education, facilities, highways) run 785-848 words each on a shared template with genuinely sector-specific tender examples, FAQs and stat callouts — normal, acceptable programmatic-SEO practice, not thin content.

---

## 4. SEO

Extracted mechanically from all 41 pages (script-based; title/description length, canonical, OG/Twitter, H1 count, heading order, JSON-LD parse and type).

**Titles:** All 41 unique — no duplicates. 16 pages run over 60 characters and will truncate in a SERP snippet, concentrated in comparison pages (`compare/crowmark-vs-mytender-io.html` = 73 chars, `crowmark-vs-cleantender` = 73, `crowmark-vs-autogenai` = 71, `crowmark-vs-swiftbid` = 70) and sector pages (64-71 chars). `crowmark.html`'s title is the longest at 85 characters. 15 pages run under 30 characters (`pricing.html` = 19, `contact.html` = 19, `roadmap.html` = 19) — not wrong, but leaves SERP real estate unused.

**Meta descriptions — the most material SEO finding.** 12 pages have **no `<meta name="description">` tag at all**: all 5 individual blog posts (`blog/find-first-public-sector-contract.html`, `ppn-002-social-value-guide.html`, `procurement-act-2023-sme-guide.html`, `regulatory-updates-2026.html`, `social-value-portal-vs-crowmark.html`), all 4 comparison pages plus `compare/index.html`, and `products/crowmark/index.html`. This means the two content types built specifically to rank and to be shared (blog articles and "vs." comparison pages, per Section 6 below) are invisible in search snippets and will show Google's auto-generated text instead. Of the 29 pages that do have one, 8 exceed 160 characters (worst: `sectors/education.html` at 232, `sectors/construction.html` at 229) and will truncate; 3 are under 70 characters (`crowmark.html` at 21 — badly under-length for the flagship product page).

**Duplicate description:** `about.html` and `index.html` intentionally share the canonical sentence (by design, see Section 1) — the only duplicate, and deliberate.

**Canonical tags:** the same 12 pages that lack a meta description also lack a canonical tag, with the same content-type concentration: all 5 individual blog posts, all 4 comparison pages plus the compare hub, and the dead `products/crowmark` stub. `blog/index.html` and `glossary/index.html` and `tools/index.html` do carry canonicals; their child pages don't.

**H1:** every real page has exactly one H1. (The two 0-H1 results — the Google-verification stub and the `products/crowmark` redirect stub — are not real content pages.)

**Heading order:** no skipped levels found on any page (H1→H2→H3 progression checked programmatically across all 41 files).

**Open Graph / Twitter — same 12-page gap, worse.** These 12 pages (blog posts ×5, compare ×5, `glossary/index.html`, `tools/index.html`, plus `products/crowmark` stub) ship **zero** `og:*` or `twitter:*` tags — not just incomplete, entirely absent. A blog post or comparison page shared to LinkedIn, Slack or X renders with no title, no image and no description card. Given `robots.txt` explicitly courts AI/LLM crawlers for "zero-click discovery" and this content is exactly the corpus meant to be surfaced and cited, the absence of any social/AI-preview metadata on precisely this content is a real gap. Elsewhere, coverage is good: 34 dedicated OG images exist under `Assets/og/` and pages that do carry the tags mostly carry the full set (a handful are missing just `twitter:image`, low severity).

**JSON-LD:** all blocks that exist parse as valid JSON (checked programmatically — zero parse errors across 41 pages) and use plausible schema.org types (`BlogPosting`, `FAQPage`, `BreadcrumbList`, `Article`, `SoftwareApplication`, `DefinedTerm`, `CollectionPage`, `WebApplication`, `TechArticle`, `Organization`, `WebSite`). The one substantive JSON-LD defect is the **duplicate/conflicting Organization graph described in Section 1** — a broken idempotency guard in `js/nav-inject.js` (checks for a `data-ca-orgld` attribute that no page's static markup ever carries, confirmed by grep across all 41 files: zero matches) means the script injects a second Organization+WebSite block on every page, including `index.html` and `resources.html` which already have their own, different one. `tools/index.html` has no JSON-LD at all despite being a real, indexable hub page.

**Robots meta:** used sparingly and correctly where present — `404.html` is `noindex, nofollow` (correct), `products/crowmark/index.html` is `noindex,follow` (correct for a redirect stub). No page is accidentally noindexed.

---

## 5. CONTENT DEPTH AND GAPS

**The 5 surviving blog posts are coherent as a set and reasonably well cross-linked.** Topic mix: PPN 002 / social value (3 posts: the guide, the 2026 update, and the Social Value Portal comparison), the Procurement Act 2023 (1 post, plus overlap in the "find your first contract" post), and a getting-started post. `blog/find-first-public-sector-contract.html`, `procurement-act-2023-sme-guide.html`, `ppn-002-social-value-guide.html` and `regulatory-updates-2026.html` all carry a "Related articles" block (2-3 links each); `social-value-portal-vs-crowmark.html` has 3. `blog/index.html` itself has no outbound "related" block, which is fine — it's the hub. Internal linking density between posts is adequate, not exceptional.

**Topic concentration is heavy on one regulation.** 3 of 5 posts are substantially about PPN 002. For a UK procurement audience, obvious gaps that are *not* on the excluded list (cyber, ESG, sustainability reporting, CSRD, late payment) include: how tenders are actually scored/evaluated (quality/price/social-value weighting mechanics beyond the 10% minimum), the difference between open tenders, frameworks (e.g. RM6396, which `pricing.html` already name-drops) and Dynamic Purchasing Systems, financial-standing and insurance-requirement checks at PQQ/SQ stage, what happens after you lose (debrief rights, standstill period, challenging an award under the Procurement Act's remedies provisions), and the practical reality that many councils still run their own e-sourcing portals (Delta, Proactis, In-Tend) alongside Contracts Finder/Find a Tender, which the site currently treats as the only two discovery sources.

**Buyer-side content is entirely absent from the blog and the sector pages** (see Section 1) — every post and every sector page is written supplier-first with no buyer-facing equivalent, despite Buyers being one of the two named products.

---

## 6. TRUST AND CREDIBILITY

**This is thin, and it should be reported as thin rather than softened.**

**What exists:**
- Companies House number (17076461), cited consistently across footer, homepage pills, about.html, terms.html, pricing.html, security.html.
- ICO registration claim (`privacy.html`, `terms.html`).
- ISO 27001 — honestly caveated on `security.html:426`: *"We follow ISO 27001 controls. Formal certification planned for Phase 2."* This is good, careful, non-overclaiming language. It does **not** travel with the badge: the homepage hero pill (`index.html:532`) just says "ISO 27001 aligned" with no asterisk or link to the caveat, and the homepage feature-grid copy (`index.html:1008`) says "aligned to ISO 27001 controls" — defensible wording, but a scanning visitor who never reaches `/security` gets the badge without the context.
- Vulnerability-disclosure process and SLA table on `security.html` (Critical/High/Medium/Low triage and patch SLAs) — a genuinely credible, specific artifact, rare on an early-stage SaaS site.
- Sub-processor list with data-residency flags (`privacy.html:601-624`) — specific, named, region-tagged. Good practice.
- `£170B+` annual UK public-sector procurement figure, used as a homepage trust stat (`index.html:530, 553`) with **no citation or source link** anywhere on the page or linked page. Plausible (it's in the range of published UK government figures) but unverifiable as presented — flagged per the brief's instruction to flag unverifiable claims.

**What is absent, checked explicitly and confirmed zero:**
- **No testimonial, anywhere on the site** (checked all 41 pages).
- **No customer logo, no case study.** `partners.html:155` promises "featured case studies" as a benefit of the (unbuilt) partner programme — an aspiration, not evidence.
- **No third-party review or rating** (G2, Trustpilot, Capterra — zero mentions).
- **No named founder, executive or team member anywhere on the site**, including `about.html`, which is the one page whose entire job is to build people-trust. The only reference to founders at all is `contact.html:180`: *"Speak directly with the founders. Walk through your procurement challenge live."* — plural, unnamed, no photo, no bio, no LinkedIn profile link (only a company LinkedIn page exists). `about.html`'s H1 is "Intelligence by engineers." and its "History" timeline claims "2021-2025 — Founding Team Experience… Years spent navigating complex UK regulations, procurement frameworks, and cybersecurity audits from the inside" — an unverifiable, unattributed claim with no named individual, no named prior employer, no credential behind it.
- **No uptime track record**, only a forward-looking "99.5% Monthly uptime target" (honestly worded as a target, not a claim of past performance) and a note that independent public status monitoring is "planned for Q3 2026."

**Actively damaging to the trust story:** `stripe-sample/index.html` is a leftover, unrelated demo page for a completely different fictional product ("Crowagent | The infrastructure for intelligent agents" — an AI-agent-infrastructure SaaS template, not bid/tender software), with fabricated claims ("Millions of companies of all sizes — from startups to Fortune 500s — use Crowagent's software and APIs...") and every link on the page pointing to `href="#"`. It is not linked from anywhere on the real site and is excluded from the 41-page count in this audit for that reason, but it is publicly reachable at `/stripe-sample/`, `robots.txt` does not exclude it (`Allow: /` with no disallow rule), and it is absent from `sitemap.xml` only because nobody added it — nothing stops a crawler or a curious prospect from finding it and concluding the company either has a second, contradictory product or doesn't have its story straight. Delete it or add it to `.gitignore`/a build-exclude; it should never ship to production.

---

## 7. CONVERSION

**CTA hierarchy is consistent in destination, less consistent in ordering.** Primary CTA across the great majority of pages routes to `/contact?enquiry=beta-access#contact-form` (labelled "Request access" or a variant) or to `https://calendly.com/crowagent-platform/30min` ("Book a demo"/"Book a call"). **No bare self-serve signup link was found anywhere** — checked explicitly for `/start-trial`, `signup`, "Start free trial" text, etc., across all 41 pages: zero hits. This matches the stated private-beta/request-only positioning and is a real strength; the site does not undercut its own access model anywhere in its CTAs.

Inconsistencies:
- **Lead action varies by page.** `index.html`, `crowmark.html`, `integrations.html`, `resources.html`, `roadmap.html`, all blog posts and all sector pages lead with "Request access" as primary and demo/Calendly as secondary. `about.html` and `contact.html` invert this, leading with "Book a demo/call". `pricing.html`'s single CTA is "Talk to sales" → `/contact` (no `?enquiry=` param, unlike every other page's contact link).
- **Button markup is not a single design-system component.** Three different class conventions are in live use for what is visually the same primary/secondary button pair: `sv-btn-primary`/`sv-btn-ghost` (single dash, e.g. `index.html`, `crowmark.html`), `sv-btn--primary`/`sv-btn--ghost` (double dash, e.g. `sectors/*.html`, `tools/*.html`), and Tailwind-utility-styled `sv-btn !bg-ca-teal !text-ca-bg` (e.g. `glossary/*.html`, `partners.html`). Functionally harmless today, but it means there is no single component to update if the button style needs to change — exactly the kind of drift a "top-1% premium SaaS" benchmark (Stripe, Linear, Vercel) would not have.
- **`security.html` has no conversion CTA at all** (Section 2) — its one CTA-styled link goes to the external status page.
- **`glossary/index.html` has no CTA at all** (Section 2).

---

## 8. FORMS

**`contact.html`** carries two forms, both genuinely well built:

1. **Main enquiry form** (`#contactPageForm`, POSTs to `https://app.crowagent.ai/api/contact/submit`):
   - Honeypot anti-bot field (`website`, visually hidden, `tabindex="-1"`, `autocomplete="off"`).
   - Full Name — `required`, labelled, placeholder.
   - Work Email — `required`, `type="email"`, regex `pattern` validation with a human-readable `title` tooltip.
   - Organisation — optional, labelled.
   - Subject dropdown (`enquiry_type`) — options are "Private beta - request access", "**CrowMark for Suppliers**", "**CrowMark for Buyers**" (good: this is one of the few places both sides of the two-product positioning are explicitly and equally presented to a visitor), "Enterprise / volume pricing", "General question". A code comment (`:411-419`) confirms the dropdown was deliberately updated during the same-day remediation and that the "council" buyer option was relabelled specifically so it can't be mistaken for the retired products — good discipline.
   - Message — `required`, `minlength="20"`, with the minimum stated to the user ("Min. 20 characters").
   - Cloudflare Turnstile bot challenge.
   - GDPR consent checkbox — `required`, links to `/privacy`.
   - Submit button shows `aria-busy` state during submission.
   - Success state: "Message received. We'll be in touch within 3-5 business days."
   - Error state: "Something went wrong. Please email hello@crowagent.ai directly." — a real fallback, not a dead end.
   - `<noscript>` fallback pointing to a `mailto:` for users without JavaScript.
   - All inputs have associated `<label for>` elements; required fields are marked with a visible `*` in the label text (not conveyed by colour alone).

2. **Newsletter/notify form** — single email field, honeypot, `required`, same regex validation pattern. Minimal and appropriate for its scope.

No accessibility defects found in the form markup itself (labels present, required fields marked in text not colour, error/success regions exist as targetable elements). One gap: the required-field asterisk (`*`) is visual only in the label text — there's no `aria-required` or `required` announced distinctly beyond the native HTML `required` attribute (which is itself sufficient for screen readers, so this is not a real defect, just noted as checked).

`partners.html` has a second, separate form behind `#partner-form-section` (linked from the page's primary CTA, "Become a partner") — not inspected in the same depth as `contact.html`; recommend the same checklist be applied to it before shipping.

---

## 9. READING QUALITY

**Em-dashes:** **zero** found in any user-facing text on any of the 41 pages (checked for the literal `—` character and for `&mdash;`/`&#8212;`/`&#x2014;` entities, sitewide). The only literal em-dashes in the entire repo's HTML are inside three files' developer comments (`crowmark.html:178,523`, `resources.html:211`) — never rendered to a visitor — plus the excluded `stripe-sample` template. **House style is being respected in practice, not just in the style guide.**

**AI-marketing words:** **zero** hits for "revolutionize", "seamlessly", "harness", "unleash", "cutting-edge" or "game-changing" anywhere in the rendered text of any page. Genuinely clean; worth calling out as a positive since this is a common failure mode this audit was specifically asked to check for.

**Sentence length:** a naive 40-word sentence scan flagged 68 candidates, but roughly two-thirds are false positives from tables and stat rows collapsing into run-on "sentences" when rendered as plain text (pricing tables, comparison tables, breadcrumb strings) rather than genuine prose. Real offenders, prose only:
- `terms.html` — the liability-cap clause runs 134 words as a single sentence. Long, but single-sentence liability clauses are conventional in UK ToS drafting; lower priority than the others below.
- The comparison pages (`compare/crowmark-vs-cleantender.html`, `crowmark-vs-mytender-io.html`, `crowmark-vs-swiftbid.html`, `crowmark-vs-autogenai.html`) each carry several genuine 40-58 word prose sentences, e.g. `crowmark-vs-cleantender.html`: *"If cleaning or security is all you bid for, CleanTender's vocabulary and its fast fit scan are built around exactly your work, and its pricing is public: a free tier to browse the contract directory, and Pro at 99 per month..."* (58 words). This is the page type most likely to be skim-read by a prospect actively comparing vendors — worth tightening.
- `blog/procurement-act-2023-sme-guide.html`: a 74-word sentence listing "the three changes that matter most" as one run-on clause chain — ironic, since the post's own thesis is making the Act easier to digest than the original legislation.

**Passive voice:** not systematically flagged (would need a proper parser rather than regex to do reliably), but spot-checked on the highest-traffic pages (index, crowmark, pricing, security) and found to be mostly active, declarative, short-clause writing — consistent with the site's evident house style ("Every score, weighting and threshold cites the rule it comes from," "CrowAgent does not generate opinions"). `privacy.html` and `terms.html`, as expected of UK legal drafting, lean more passive ("processing necessary to provide the CrowAgent service...") — normal for the genre, not flagged as a defect.

**Unverifiable claims, beyond the £170B+ figure already noted in Section 6:** `about.html`'s "Founding Team Experience... Years spent navigating complex UK regulations, procurement frameworks, and cybersecurity audits from the inside" is asserted with no name, employer or evidence attached and should either be substantiated (name the person, name the prior role) or softened.

---

## PAGE-BY-PAGE TABLE

| Page | Job | Primary CTA | Verdict |
|---|---|---|---|
| `index.html` | Convert cold/warm visitors; explain the product | Request access → `/contact?enquiry=beta-access` | Strong page, undercut by the H1/journey-section contradiction (Section 1) and the duplicate JSON-LD |
| `crowmark.html` | Product deep-dive, drive beta request | Request beta access | Solid; good use of real screenshots and figure-grounding explanation |
| `pricing.html` | Convert on price transparency | Talk to sales → `/contact` | Consistent £49/£149 pricing verified across site; CTA pattern diverges from rest of site (no `?enquiry=` param) |
| `about.html` | Build company trust | Book a 15-minute demo | Thin — no named people; founding-date conflicts with JSON-LD |
| `contact.html` | Capture the lead | Book a 30-minute call (form is below) | Best-built page on the site technically (Section 8); leads with Calendly over the form itself |
| `faq.html` | Pre-empt objections | Book a call | Long (1,020 words) but well-organised; carries the extended (buyer-inclusive) description patch |
| `security.html` | Reassure security-conscious buyers | **None** (only link is to external status page) | Strong content, honest ISO caveat, but a genuine conversion dead end |
| `privacy.html` | Legal compliance | n/a | **Contains live references to three retired, legally-conflicted products** — see Executive Summary #1 |
| `terms.html` | Legal compliance | n/a | Clean of parked-product references; long single-sentence liability clause |
| `cookies.html` | Legal/functional | Manage preferences → `/cookie-preferences` | Fine, functional page |
| `cookie-preferences.html` | Functional control panel | n/a (no conversion CTA expected) | Fine |
| `changelog.html` | Show momentum | View roadmap | Short (148 words); clean of parked-product references |
| `roadmap.html` | Show direction, build confidence | Request access | Clean of parked-product references; well organised (Live/Researching split) |
| `partners.html` | Recruit partners | Become a partner (in-page form) | No case studies despite promising them; unchecked partner form |
| `resources.html` | Hub for free tools + content | Run the free calculator | Short (344 words) as a hub, reasonable |
| `integrations.html` | Reassure on stack compatibility | Request access | Good page; **missing from sitemap.xml** |
| `security.html` | (see above, listed once) | | |
| `blog/index.html` | Blog hub | Read latest / browse | Fine; no meta description issue (has one) |
| `blog/find-first-public-sector-contract.html` | Top-of-funnel education | See CrowMark / Request access | No meta description, no canonical, no OG/Twitter tags |
| `blog/ppn-002-social-value-guide.html` | Pillar content on PPN 002 | Request access | Same SEO gaps as above |
| `blog/procurement-act-2023-sme-guide.html` | Education on the Act | See CrowMark / Request access | Same SEO gaps; contains the 74-word run-on sentence |
| `blog/regulatory-updates-2026.html` | Timely regulatory update | Request access | Same SEO gaps |
| `blog/social-value-portal-vs-crowmark.html` | Competitive/positioning content | Request access | Same SEO gaps |
| `compare/index.html` | Comparison hub | Explore CrowMark | No meta description, no canonical, no OG/Twitter |
| `compare/crowmark-vs-autogenai.html` | Competitive conversion | Explore CrowMark | Same SEO gaps; honest "where CrowMark loses" framing (genuinely good, see below) |
| `compare/crowmark-vs-cleantender.html` | Competitive conversion | Explore CrowMark | Same SEO gaps; longest run-on sentences of the set |
| `compare/crowmark-vs-mytender-io.html` | Competitive conversion | Explore CrowMark | Same SEO gaps |
| `compare/crowmark-vs-swiftbid.html` | Competitive conversion | Explore CrowMark | Same SEO gaps |
| `glossary/index.html` | Reference hub, SEO net | **None** | No CTA anywhere on the page |
| `glossary/ppn-002.html` | Definition + soft conversion | Request access | Good; clean |
| `glossary/toms-framework.html` | Definition + soft conversion | Request access | Good; clean |
| `sectors/index.html` | Sector hub | (links to sector pages) | Explicitly says "one product" (Section 1) |
| `sectors/construction.html` | Vertical landing page | Request access | Supplier-only framing (Section 1) |
| `sectors/education.html` | Vertical landing page | Request access | Supplier-only framing; longest meta description on the site (232 chars) |
| `sectors/facilities.html` | Vertical landing page | Request access | Supplier-only framing |
| `sectors/highways.html` | Vertical landing page | Request access | Supplier-only framing |
| `tools/index.html` | Free-tool hub | Request access | No JSON-LD; no OG/Twitter tags; supplier-only framing |
| `tools/ppn-002-calculator/index.html` | Lead-gen free tool | Request access | Clean, well-tagged, good SEO |
| `tools-ppn002-calculator-methodology.html` | Long-form SEO/trust content for the tool | Open tool | Clean, well-tagged |
| `roadmap.html` | (listed once above) | | |
| `changelog.html` | (listed once above) | | |
| `404.html` | Error recovery | Back to homepage | Correctly `noindex`; fine |
| `googlef2adc6102725418d.html` | Search Console ownership verification | n/a | Not a content page; correctly has no title/description |
| `products/crowmark/index.html` | (was) redirect stub | n/a | Dead, orphaned, unreachable in production — delete |

---

## WHAT IS GENUINELY GOOD

- **The house style rules are actually being followed, not just documented.** Zero em-dashes and zero AI-marketing buzzwords in any user-facing text across all 41 pages — a real, verified, sitewide result, not a spot-check.
- **No self-serve signup CTA exists anywhere.** Every conversion path on the site correctly routes to the request-access flow or a booked call, with zero exceptions found across 41 pages — the private-beta positioning is not undercut anywhere in the CTAs.
- **The `contact.html` form is well engineered**: honeypot, Turnstile, proper validation with human-readable error messages, required-field marking in visible text, GDPR consent gate, distinct success/error states, and a `<noscript>` fallback that actually works (a mailto link) rather than silently failing.
- **The comparison pages are honestly framed.** `compare/crowmark-vs-autogenai.html` and siblings include an explicit "Where CrowMark loses honestly" section that names real competitor advantages (VPC deployment, SharePoint/Salesforce integrations, published per-bid pricing for occasional bidders) rather than only claiming wins. This is rare and is exactly the kind of thing that builds credibility with a technical buyer.
- **`security.html`'s ISO 27001 claim is a model of honest claim-hedging**: "We follow ISO 27001 controls. Formal certification planned for Phase 2" is precise, true, and not oversold — it just needs the same caveat to travel to the homepage badge that quotes it out of context.
- **Real click-depth is shallow and well-organised.** Once the injected nav/footer is accounted for, nothing on the site is more than two clicks from home, and the hub-and-spoke structure (blog/compare/glossary/sectors/tools, each with an index page) is a clean, conventional, crawlable IA.
- **JSON-LD coverage is broad and, aside from the one duplicate-Organization bug, valid**: every page that should carry structured data does, all of it parses, and the schema types chosen (`FAQPage`, `BlogPosting`, `BreadcrumbList`, `DefinedTerm`, etc.) are the right ones for the content.
- **Pricing is numerically consistent everywhere it appears** — £49 Starter / £149 Pro, checked across `pricing.html`, `crowmark.html`, all four comparison pages and the Social Value Portal blog post, with no contradictions found.
- **The trademark remediation itself, apart from `privacy.html`, is thorough and unusually well self-documented** — dozens of dated HTML comments explain exactly what was removed, why, and what replaced it, which made this audit's job of separating "still a risk" from "already fixed" far easier than it would otherwise have been.
