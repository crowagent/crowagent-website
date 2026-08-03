/**
 * pricing.ts — Every plan, price, billing period, feature list and CTA found
 * in the codebase, plus an exhaustive citation of every place a price is
 * hardcoded. This is the highest-value extraction in the migration: pricing
 * is the fact most likely to drift silently across a 45-page hand-written
 * site, so every occurrence below was verified individually rather than
 * assumed from the first match.
 *
 * ===========================================================================
 * CITATION BLOCK — every file:line where a CrowMark plan price appears
 * ===========================================================================
 * (Searched with `grep -o '(&pound;|£)[0-9,]+'` across all 42 in-scope files,
 * then every hit was read in context to separate genuine CrowMark plan
 * prices from unrelated £ figures — see "EXCLUDED £ FIGURES" below.)
 *
 * crowmark.html
 *   :45   meta description — "From £49/month."
 *   :68   og:description — "UK bid software from £49/month."
 *   :80   twitter:description — "UK bid software from £49/month."
 *   :~85  JSON-LD SoftwareApplication offer — price:"49", priceCurrency:"GBP"
 *   :285  key-facts dd — "From £49/month (Starter). Pro is £149/month;
 *         Portfolio is contact sales."
 *   :654  H2 — "From £49/month."
 *   :663  Starter plan card — "£49/mo"
 *   :671  Pro plan card — "£149/mo"
 *
 * pricing.html  (the canonical price list)
 *   :18   meta description — "Starter £49 a month, Pro £149, Portfolio quoted."
 *   :368  og:description — same text
 *   :380  twitter:description — same text
 *   :428  hero — "from £49/mo"
 *   :523  Starter card — data-monthly="49" data-annual="529" → "£49/mo"
 *   :533  Pro card — data-monthly="149" data-annual="1609" → "£149/mo"
 *   :542-544  HTML COMMENT ONLY — records that Portfolio's real list price is
 *         £549/mo, deliberately kept out of the public card per owner
 *         decision R241-PRICING-STRATEGY (2026-07-19); config/Stripe-only.
 *   :~JSON-LD ItemList offers — Starter price:"49", Pro price:"149"
 *         (Portfolio/"Contact sales" is correctly absent from the offers
 *         array too — the structured data and the visible card agree)
 *
 * index.html
 *   :461  homepage stat tile — "£49/mo — Published pricing, not quote on request"
 *   :1156 product-value panel — "Published plans from £49/mo"
 *
 * compare/index.html
 *   :127  intro copy — "from £49 per month"
 *   :181  closing CTA band — "Published pricing from £49/month."
 *
 * compare/crowmark-vs-autogenai.html
 *   :18,28,36   meta/og/twitter description — "published SME pricing from £49 a month"
 *   :60         JSON-LD FAQ — "Starter is £49 per month and Pro is £149 per month"
 *   :62         JSON-LD FAQ — "published plans from £49 per month"
 *   :174,197,227,246,261,270,301,318 — body copy + comparison table + FAQ,
 *               all repeating Starter £49/mo, Pro £149/mo, Portfolio contact sales
 *
 * compare/crowmark-vs-cleantender.html
 *   :60   JSON-LD FAQ — CrowMark £49/£149 vs. CleanTender Pro "£99 per month
 *         or £990 per year" (competitor price, published by CleanTender)
 *   :174,199,207,227,230,240,261,296,299,316 — same figures repeated through
 *         intro, comparison table, body prose, mini-FAQ, sources list, CTA band
 *
 * compare/crowmark-vs-mytender-io.html
 *   :60,66  JSON-LD FAQ — CrowMark £49/£149 (mytender.io: "does not publish a price")
 *   :174,199,230,233,249,264,288,303,320 — same figures repeated throughout
 *
 * compare/crowmark-vs-swiftbid.html
 *   :18,28,36  meta/og/twitter — "subscribe from £49 a month, or pay £149 to £749 per bid"
 *   :60        JSON-LD FAQ — SwiftBid per-bid: £149 (Basic) / £349 (Standard) /
 *              £749 (Premium) vs. CrowMark subscription from £49/month
 *   :174,190,205,227,261,297,299,316 — same figures, plus :299 uniquely also
 *              states the ANNUAL Starter price inline: "£49/month (£529/year)"
 *
 * blog/social-value-portal-vs-crowmark.html
 *   :220  "Social Value Portal... £5,000+ per year. No source was ever cited,
 *         and SVP does not publish pricing." (competitor estimate, unsourced —
 *         flagged by the page's own author, not by this extraction)
 *   :240  "CrowMark starts at £49 per month (Starter plan), with Pro at £149
 *         per month."
 *   :255  "CrowMark Starter is £529 per year (£49/month); Pro is £1,609 per
 *         year (£149/month)." — first and only place BOTH annual figures are
 *         stated together in prose (matches pricing.html's data-annual attrs
 *         exactly: 49*12*0.9=529.2→529, 149*12*0.9=1609.2→1609)
 *   :291  "Starter is £49 a month for 3 users, Pro £149 for 10, with a
 *         14-day free trial."
 *
 * js/nav-inject.js
 *   :337  Products mega-menu — "Plans from £49/mo" (corrected 2026-07-28 from
 *         a stale "£39/mo", which the inline comment says was actually
 *         CrowCash's retired price, wrongly left in the nav)
 *
 * ---------------------------------------------------------------------------
 * RESULT: every one of the above sources agrees exactly on £49/mo Starter,
 * £149/mo Pro, Portfolio = contact sales (no public number), 10% annual
 * discount, 14-day trial. NO PRICING INCONSISTENCY WAS FOUND for CrowMark's
 * own plans anywhere in the 42 in-scope pages — a genuinely notable result
 * given the task brief's expectation of drift. The one caveat is the
 * deliberately-unpublished £549 Portfolio figure (pricing.html:542-544),
 * which is real but intentionally not displayed; see PORTFOLIO_HIDDEN_PRICE
 * below and CONTENT-MODEL.md.
 *
 * TASK BRIEF vs. FOUND: the brief said "13 files hardcode a price". Files
 * that hardcode an actual CrowMark plan number: 9 HTML files (crowmark.html,
 * pricing.html, index.html, compare/index.html, and the 4 compare/*.html
 * detail pages, blog/social-value-portal-vs-crowmark.html) plus
 * js/nav-inject.js (a JS file, not HTML). See CONTENT-MODEL.md for the
 * reconciliation of this count, same pattern as the "8 pages" app-url claim.
 *
 * EXCLUDED £ FIGURES (found by the same grep sweep, but NOT CrowMark prices —
 * kept out of this file, listed here so nobody re-adds them by mistake):
 *   - terms.html:330/524/536/548 — the £1,000 aggregate liability cap. Legal
 *     boilerplate, not a plan price. Recorded below under OTHER_MONETARY_TERMS
 *     for completeness since it is billing-adjacent.
 *   - sectors/construction.html, sectors/highways.html, crowmark-buyers.html,
 *     glossary/index.html — the Procurement Act 2023 s.52 "£5m" contract-value
 *     KPI threshold and the Find a Tender / Contracts Finder £12,000 /
 *     £30,000 publication thresholds. Statutory thresholds, not prices.
 *   - blog/ppn-002-social-value-guide.html, tools/ppn-002-calculator/
 *     methodology/index.html — Oxford Social Value Bank proxy values (e.g.
 *     "£56,029 per apprenticeship" in the blog vs. "£8,460 per Level 3
 *     apprenticeship" in the methodology page — THESE TWO DISAGREE WITH EACH
 *     OTHER; flagged in CONTENT-MODEL.md as a genuine content inconsistency,
 *     just not a pricing.ts concern).
 */

export const CURRENCY = 'GBP' as const;
export const CURRENCY_SYMBOL = '£' as const;

export const BILLING_PERIODS = ['monthly', 'annual'] as const;

/** pricing.html:801/806 — "Annual billing: 10% off", switchable any time. */
export const ANNUAL_DISCOUNT_PERCENT = 10;

/** pricing.html FAQ "How does the 14-day trial work?" + faq.html */
export const TRIAL_DAYS = 14;
export const TRIAL_REQUIRES_CARD = false;

/**
 * CrowMark plans. One shared price list covers both CrowMark for Suppliers
 * and CrowMark for Buyers' underlying seat tiers — the buyer SIDE of a
 * procurement is quote-only (see products.ts crowmark-buyers keyFacts.price)
 * but the seat tiers themselves, where shown, are these three.
 */
export const CROWMARK_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    audienceLabel: 'Small suppliers & solo consultants', // pricing.html:522
    monthlyPrice: 49,
    /** pricing.html:523 data-annual="529" = 49*12*0.9 rounded down to whole pounds */
    annualPrice: 529,
    seats: 3,
    /** [OWNER DECISION: UA4], crowmark-platform tier-limits.ts, cited pricing.html:524 */
    aiEvalCapPerMonth: 5,
    features: [
      '3 users',
      'Tender feed (Contracts Finder + Find a Tender)',
      'Document ingestion',
      'Grounded answer drafting',
      'Deterministic PPN 002 calculation',
      'Branded PDF or DOCX export',
    ],
    cta: { label: 'Request access', href: '/contact?enquiry=limited-access#contact-form' },
    mostPopular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    audienceLabel: 'Public-sector contractors & bidding teams', // pricing.html:532
    monthlyPrice: 149,
    /** pricing.html:533 data-annual="1609" = 149*12*0.9 rounded down */
    annualPrice: 1609,
    seats: 10,
    aiEvalCapPerMonth: 25,
    features: [
      '10 users',
      'Everything in Starter',
      'Post-award delivery tracking',
      'Monthly social-value reports',
      'Procurement Act 2023 s.52 and s.71 KPI checks',
    ],
    cta: { label: 'Request access', href: '/contact?enquiry=limited-access#contact-form' },
    mostPopular: true, // pricing.html:530 "Most Popular" badge
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    audienceLabel: 'Enterprise groups & Tier-1 suppliers', // pricing.html:540
    /**
     * NO PUBLIC PRICE. pricing.html:541-544 explicitly documents that a
     * £549/mo list price exists in Stripe/config for post-demo checkout but
     * MUST NOT be shown on the public pricing card — see
     * PORTFOLIO_HIDDEN_PRICE below.
     */
    monthlyPrice: null,
    annualPrice: null,
    seats: 'unlimited' as const,
    aiEvalCapPerMonth: 'effectively unlimited' as const,
    features: [
      'Bid volume effectively unlimited',
      'Everything in Pro',
      'Branded exports',
      'A named account contact',
      'Microsoft Entra ID SSO (available now)',
    ],
    cta: { label: 'Contact sales', href: '/contact?product=crowmark&tier=portfolio' },
    mostPopular: false,
  },
] as const;

/**
 * ⚠️ Intentionally unpublished figure. Present only as an HTML comment in
 * pricing.html:541-544, not rendered anywhere on the live site. Recorded
 * here because the task instructs "never invented" values — this one was
 * read directly from the source, not guessed — but any consumer of this
 * data model should treat it as internal/config-only, matching the site's
 * own stated intent, not display it publicly.
 */
export const PORTFOLIO_HIDDEN_LIST_PRICE = {
  amount: 549,
  currency: 'GBP',
  period: 'month',
  source: 'pricing.html:542 (HTML comment, owner decision R241-PRICING-STRATEGY, 2026-07-19)',
  public: false,
} as const;

/**
 * Buyer-side (evaluator) offer. Deliberately quote-only — pricing.html:600-616
 * documents this as a considered decision, not a missing price: "a buyer
 * engagement is scoped to the organisation rather than sold by seat, so
 * there is no self-serve price."
 */
export const BUYER_PRICING = {
  model: 'quoted' as const,
  billing: 'invoice or purchase order, annual terms',
  cta: { label: 'Book a demo', href: '/contact?product=buyer-side#contact-form' },
  whyNoPrice:
    'A buyer engagement is not a seat count. It is scoped to the organisation, procured under your own rules and billed the way your finance team can actually pay, so a single self-serve number would be misleading rather than transparent.',
} as const;

/**
 * AI credit metering, section "07B. AI CREDITS" pricing.html:751-795. Applies
 * across all plans; the allowance size itself is NOT stated as a number
 * anywhere in scope (only "a monthly allowance" — no figure found for how
 * many credits Starter/Pro/Portfolio actually include).
 */
export const AI_CREDITS = {
  unit: 'One credit = one AI generation (e.g. a drafted tender answer or a delivery-evidence summary)',
  documentIngestionRate: '3 credits per 10 pages, rounded up',
  pageDefinitions: [
    { document: 'PDF', onePageIs: 'One page' },
    { document: 'PowerPoint', onePageIs: 'One slide' },
    { document: 'Word or plain text', onePageIs: 'The whole document' },
    { document: 'Spreadsheet (Excel or CSV)', onePageIs: '50 rows of a sheet, rounded up and added across sheets' },
  ],
  neverCharged: 'Everything calculated rather than generated (PPN 002 arithmetic, scoring, exports) is never charged and never capped. A failed generation is not charged.',
} as const;

/**
 * Competitor prices as cited in the /compare pages. Captured because they
 * are load-bearing to CrowMark's own comparative pricing claims — if a
 * competitor changes their price, these become stale marketing claims.
 * Each entry cites its own source page; none of these are CrowAgent's price.
 */
export const COMPETITOR_PRICING_CITATIONS = [
  {
    competitor: 'AutogenAI',
    claim: 'Does not publish a price; sold as enterprise subscription on request.',
    source: 'compare/crowmark-vs-autogenai.html:197',
  },
  {
    competitor: 'CleanTender',
    claim: 'Free tier; Pro at £99/month or £990/year.',
    source: 'compare/crowmark-vs-cleantender.html:199',
  },
  {
    competitor: 'mytender.io',
    claim: 'Does not publish a price; tiers shown on request or in the account dashboard.',
    source: 'compare/crowmark-vs-mytender-io.html:199',
  },
  {
    competitor: 'SwiftBid',
    claim: 'Per bid: £149 (Basic) / £349 (Standard) / £749 (Premium). No subscription.',
    source: 'compare/crowmark-vs-swiftbid.html:190,205',
  },
  {
    competitor: 'Social Value Portal (SVP)',
    claim: '£5,000+ per year (estimate cited by CrowAgent\'s own blog, not sourced from SVP; SVP does not publish pricing).',
    source: 'blog/social-value-portal-vs-crowmark.html:220',
    caveat: 'The blog post itself flags this figure as uncited — carried here as-is, not endorsed as accurate.',
  },
] as const;

/**
 * Non-plan monetary terms found in scope. Not pricing.ts's primary subject,
 * but billing-adjacent and explicitly requested ("every plan, price,
 * billing period") — the liability cap is a contractual dollar figure that
 * a billing/legal page would need alongside plan prices.
 */
export const OTHER_MONETARY_TERMS = {
  aggregateLiabilityCap: {
    amount: 1000,
    currency: 'GBP',
    rule: "Greater of 12 months' fees paid, or £1,000.",
    source: 'terms.html:330,524,536,548',
  },
} as const;

/**
 * Payment methods, pricing.html FAQ "What payment methods do you accept?"
 */
export const PAYMENT_METHODS = {
  default: 'All major credit and debit cards via Stripe',
  portfolioAnnualAlternative: 'Invoice and BACS transfer, on request to the finance team',
} as const;
