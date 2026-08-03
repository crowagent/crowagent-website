/**
 * products.ts — The live product catalogue.
 *
 * SCOPE DECISION (binding, per task brief and per the site's own content):
 * only CrowMark is live. crowmark.html itself documents in an inline
 * comment (TM-REMEDIATION-001, 2026-07-28) that CrowCyber, CrowCash, CrowESG
 * and the old "CrowAgent Core" product were removed from the public site;
 * their nav routes now 301 to /crowmark (js/nav-inject.js:195-203) and the
 * footer tagline was rewritten to describe "one thing: public-sector bid
 * and tender software" (js/nav-inject.js:491-503) specifically because a
 * trade-mark conflict turns on the site not describing a wider field than
 * that. CSRD Checker is likewise absent from every in-scope nav/footer/
 * product listing. None of the five retired products are represented here,
 * per the task instruction.
 *
 * CrowMark ships as exactly two variants sharing one engine and one price
 * list (pricing.html:490-493, crowmark.html "What is CrowMark?" section):
 *   - CrowMark for Suppliers  (crowmark.html)        — the bidder side
 *   - CrowMark for Buyers     (crowmark-buyers.html)  — the evaluator side
 * Sector (public/private) is a property of the customer, not a third
 * variant — corrected by the owner 2026-07-29 per the inline comment at
 * js/nav-inject.js:324-333 and pricing.html:324-333.
 */

export const PRODUCTS = [
  {
    slug: 'crowmark-suppliers',
    name: 'CrowMark',
    displayName: 'CrowMark for Suppliers',
    audience: 'suppliers' as const,
    route: '/crowmark',
    sourceFile: 'crowmark.html',

    /** ca-hero-title, crowmark.html:123-124 */
    tagline: 'Find UK tenders. Draft cited answers. Prove delivery.',

    /** ca-hero-desc, crowmark.html:138 */
    heroDescription:
      'Every answer is cited to the regulations, to the tender’s own clauses and to your answer library, and a named person approves it before it goes anywhere.',

    /**
     * The answer-first "What is CrowMark?" lead paragraph, crowmark.html:272.
     * Treated as the canonical long-form description: self-contained and
     * explicitly written to survive being lifted out of page context.
     */
    description:
      'CrowMark is a UK bid and tender management suite for public-sector suppliers. It tracks Find a Tender, Contracts Finder and Public Contracts Scotland every day, drafts answers cited to the regulations, to the tender’s own clauses and to the supplier’s answer library, checks every figure against the supplier’s own data so the model cannot invent a number, discloses AI use under PPN 017, and holds the evidence of delivery after award. Pricing starts at £49 per month.',

    /** SoftwareApplication description in JSON-LD, crowmark.html <head> */
    metaDescription:
      'CrowMark tracks Find a Tender, Contracts Finder and Public Contracts Scotland daily, drafts cited answers a person approves, and evidences delivery after award. From £49/month.',

    /** dl.cm-keyfacts, crowmark.html:274-295 */
    keyFacts: {
      whatItIs: 'A UK public-sector bid and tender management suite, and CrowAgent’s flagship product.',
      whoItIsFor:
        'UK SMEs and suppliers bidding for public-sector contracts on Find a Tender, Contracts Finder and Public Contracts Scotland.',
      price: 'From £49/month (Starter). Pro is £149/month; Portfolio is contact sales. Every plan starts with a 14-day trial.',
      differentiator:
        'Deterministic figure-grounding, so the model cannot print a number your data does not contain, plus a PPN 017 AI-use disclosure on every draft and a named person approving every answer.',
      statute:
        'Advisory checks against the Procurement Act 2023 (sections 52 and 71) and PPN 002 social value, with its mandatory 10% minimum weighting. Advisory, never blocking, and not legal advice.',
    },

    /** ul.mt-16 hero proof strip, crowmark.html:151-156 */
    proofStrip: [
      '3 sources — Find a Tender, Contracts Finder, Public Contracts Scotland',
      'Daily — Refreshed feed',
      'PPN 017 — Disclosure on every draft',
      's.52 · s.71 — Procurement Act 2023',
    ],

    /**
     * "What CrowMark does today" feature grid, crowmark.html:447-480+
     * (LIVE-only; the section heading explicitly states every item here
     * ships in the product today, not a roadmap item).
     */
    features: [
      {
        name: 'UK tender discovery',
        description:
          'Find a Tender, Contracts Finder and Public Contracts Scotland, ingested from their published feeds and refreshed daily. Filter by sector, value and region, sort the feed, and bookmark what matters.',
      },
      {
        name: 'Cited answer drafting',
        description:
          'Retrieval runs across three citation buckets: the regulatory corpus, the tender’s own clauses, and your organisation’s answer library, which is a fallback the response flags when it is used. Win themes enter every answer, the first draft is critiqued and revised against the tender’s criteria, and the figure-grounding gate rejects any draft containing a number your data does not support.',
      },
      {
        name: 'Deterministic PPN 002 maths',
        description:
          'Social value is calculated in code with unit-aware arithmetic against the 2025 PPN 002 model: five missions, M1 to M5, and eight policy outcomes. Measures are TOMs-aligned. The 10% minimum weighting is applied, never guessed, and it is a weighting, not a score.',
      },
      {
        name: 'Tender document ingestion',
        description:
          'PDF, DOCX, XLSX, PNG and JPEG up to 10MB. Requirements and clauses are extracted from the text layer and become a citation source in their own right. Scanned PDFs are reported honestly as needing OCR, which CrowMark does not do.',
      },
      {
        name: 'Bid or no-bid, with reasons',
        description:
          'A deterministic six-dimension rubric scores how well a published tender fits your organisation, and shows the reason behind each dimension rather than a single opaque number. It is a fit score, not a prediction.',
      },
    ],

    /** "Three things most bid tools will not do", crowmark.html:373-403 */
    differentiators: [
      {
        name: 'The AI cannot invent a figure',
        description:
          'Before a draft is shown, every £ and % in the prose is checked against a set of allowed figures computed from your own data. If a number is not in that set, the draft is rejected rather than published.',
      },
      {
        name: 'PPN 017 disclosure, human approval',
        description:
          'Every AI-assisted draft carries a PPN 017 AI-transparency disclosure, and nothing reaches a buyer without a person approving it. If no AI key is configured, CrowMark returns nothing rather than a canned answer.',
      },
      {
        name: 'Award to delivery to reporting',
        description:
          'The commitment you bid stays attached to the contract after award: delivery actuals against each commitment, the evidence held in one vault, an authority-facing report, and advisory section 52 and section 71 KPI checks under the Procurement Act 2023.',
      },
    ],

    /** 4-step walkthrough, crowmark.html:304-333 */
    walkthrough: [
      { step: 1, title: 'Find the tender', description: 'Find a Tender, Contracts Finder and Public Contracts Scotland, refreshed daily. Filter by sector, value and region, sort the feed, and bookmark what is worth a bid.' },
      { step: 2, title: 'Read it, then decide', description: 'Upload the tender pack as PDF, DOCX, XLSX or an image, up to 10MB. CrowMark extracts the requirements, scores fit and coverage with the reason behind each component, and returns pursue, review or pass with the gaps named.' },
      { step: 3, title: 'Draft the answer', description: 'Retrieval cites three sources: the regulatory corpus, the tender’s own clauses, and your answer library. Your win themes enter every answer, the first draft is critiqued and revised, and social-value totals are computed in code.' },
      { step: 4, title: 'Prove the delivery', description: 'After award, hold the evidence in one vault, record the delivery actuals against each commitment, and produce the authority-facing report, including the annual section 71 roll-up rated red, amber or green.' },
    ],

    /** crowmark.html:143-148 */
    primaryCta: { label: 'Request access', href: '/contact?enquiry=limited-access#contact-form' },
    secondaryCta: { label: 'See pricing', href: '/pricing?product=mark' },

    /** JSON-LD SoftwareApplication offer, crowmark.html <head> */
    priceEntryPoint: { amount: 49, currency: 'GBP', period: 'month', tierName: 'Starter' },

    ogImage: 'https://crowagent.ai/Assets/og/crowmark.png?v=20260730',
  },

  {
    slug: 'crowmark-buyers',
    name: 'CrowMark',
    displayName: 'CrowMark for Buyers',
    audience: 'buyers' as const,
    route: '/crowmark-buyers',
    sourceFile: 'crowmark-buyers.html',

    /** ca-hero-title, crowmark-buyers.html:274-275 */
    tagline: 'You publish the requirement. We locate the evidence.',

    /** ca-hero-desc, crowmark-buyers.html:290 */
    heroDescription:
      'Evidence for each published criterion, quoted word for word from the response or left out. Your panel scores; the AI never does.',

    /** cb-answer-lead, crowmark-buyers.html:342 */
    description:
      'CrowMark for Buyers is social value requirement and oversight software for UK contracting authorities. You build a requirement pack with a deterministic social value rubric, publish it with your tender, and then locate the evidence for each published criterion inside the responses you receive, quoted verbatim from the supplier’s own submitted text. Your evaluation panel scores. After award, commitments are tracked against delivery by TOMs theme, and the Procurement Act 2023 award notice return is produced across your recorded contracts.',

    /** SEO meta description, crowmark-buyers.html <head> */
    metaDescription:
      'For UK contracting authorities. Locate social value evidence verbatim in every response. The panel scores; the AI never does.',

    /** dl.cb-keyfacts, crowmark-buyers.html:344-368 */
    keyFacts: {
      whatItIs: 'Requirement building, evidence location and post-award social value oversight for the buying side of a competition.',
      whoItIsFor: 'UK contracting authorities, councils, NHS bodies and universities, and private sector procurement teams running a competition.',
      whatItIsNot: 'Not an e-sourcing portal and not a system of record. It sits alongside the portal you already run your competition in.',
      price:
        'Quoted, not listed. A buyer engagement is scoped to your organisation and billed by invoice or purchase order on annual terms. Supplier pricing is published in full, because a seat price is a number we can stand behind.',
      differentiator: 'Evidence is located verbatim and dropped if it cannot be found in the response. Scoring stays with your panel, by design.',
      statute:
        'Procurement Act 2023, sections 52 and 71, plus PPN 002 social value and its mandatory 10% minimum weighting. These checks are advisory and are not legal advice.',
    },

    /** cb-proof, crowmark-buyers.html:302-307 */
    proofStrip: [
      'Never scores — The panel evaluates',
      'Verbatim — Quotes located, not written',
      'TOMs themes — Committed vs delivered',
      's.52 · s.71 — Procurement Act 2023',
    ],

    /** "The line we do not cross" boundary section, crowmark-buyers.html:312-331 */
    aiBoundary:
      'Under the Procurement Act 2023 equal treatment duty, the panel evaluates and scores every response. The pre-read locates evidence and stops: it sets no mark, changes no mark and suggests no mark. A second AI step is a consistency check over a completed evaluation, advisory in the same way; it never changes a number. This is a design constraint, not a setting — there is no mode in which the software marks a bid for you.',

    /** crowmark-buyers.html:294-299 */
    primaryCta: { label: 'Book a demo', href: '/contact?product=buyer-side#contact-form' },
    secondaryCta: { label: 'Bidding instead? See the supplier side', href: '/crowmark' },

    /** No public price — buyer side is quote-only (see keyFacts.price above). */
    priceEntryPoint: null,

    ogImage: 'https://crowagent.ai/Assets/og/crowmark-buyers.png?v=20260730',
  },
] as const;

/**
 * RETIRED PRODUCTS — intentionally NOT in the catalogue above. Left here only
 * as a documented decision trail so a future migration pass does not
 * "helpfully" re-add them from an old spec or from crowagent-platform's
 * still-live specs/products/ directory (which still describes CrowCyber,
 * CrowCash, CrowESG and CSRD Checker as products — those specs are stale
 * relative to this website, per js/nav-inject.js:195-203 and the
 * TM-REMEDIATION-001 comments throughout crowmark.html / pricing.html).
 */
export const RETIRED_PRODUCTS = [
  'CrowCyber',
  'CrowCash',
  'CrowESG',
  'CrowAgent Core',
  'CSRD Checker',
] as const;
