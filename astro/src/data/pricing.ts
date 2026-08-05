/**
 * pricing.ts — the numbers on /pricing, in one place.
 *
 * EVERY FIGURE BELOW IS DERIVED FROM THE PLATFORM, NOT AUTHORED HERE. The
 * defect this file exists to prevent is recorded in the platform itself
 * (`credit-allowances.ts` header): "the same per-tier number was restated in the
 * Stripe catalogue copy, the marketing site, PLAN_LIMITS, and a downgrade guard
 * — and they disagreed." The marketing site was one of the four that disagreed.
 *
 * Sources, so a future reader can re-check rather than trust:
 *
 *   seats    crowagent-platform/web/src/shared/lib/billing/seat-limits.ts
 *            SEAT_LIMITS.crowmark = { free: 1, starter: 3, pro: 10,
 *            portfolio: null }. `null` is unlimited.
 *
 *   credits  crowagent-platform/web/src/shared/lib/credit-allowances.ts
 *            CREDIT_ALLOWANCES.crowmark = { free: 15, starter: 200, pro: 750,
 *            portfolio: 3000 }, per calendar month. This is the ONLY axis
 *            CrowMark is metered on, and it is the answer to OA-05.
 *
 *   prices   pricing.html (live) and src/data/crowmark.ts. £49 and £149, NOT
 *            £99 — specs/architecture/DEPLOYMENT-AND-RELEASE.md §3.2 records
 *            "£99/mo" as a non-existent price removed from the OG card on
 *            2026-07-30. Portfolio's £549 list price is deliberately Stripe-only
 *            for post-demo checkout and must not appear here (owner decision
 *            R241-PRICING-STRATEGY change 3).
 *
 *   annual   Exactly 10% off twelve months, never 20%. 49 x 12 = 588, less 10%
 *            = 529.20, published as £529. 149 x 12 = 1,788, less 10% = 1,609.20,
 *            published as £1,609. Both round DOWN, so the published figure is
 *            never higher than the stated discount implies.
 */

export interface Plan {
  name: string;
  /** Who it is for. Deliberately not sector-scoped: the market-neutral decision. */
  who: string;
  /** Monthly price in £, or null where there is no published price. */
  monthly: number | null;
  /** Annual price in £. Null wherever `monthly` is. */
  annual: number | null;
  /** Included AI credits per calendar month. */
  credits: number;
  body: string;
  cta: string;
  href: string;
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    name: 'Starter',
    who: 'Small suppliers and solo consultants',
    monthly: 49,
    annual: 529,
    credits: 200,
    body:
      '3 users and 200 AI credits a month. Tender feed, document ingestion, grounded answer drafting, deterministic PPN 002 calculation, and branded PDF or DOCX export.',
    cta: 'Request access',
    href: '/contact?enquiry=limited-access#contact-form',
  },
  {
    name: 'Pro',
    /* WAS "Public-sector contractors & bidding teams". Sector-scoped, against
       the market-neutral decision, on the plan most buyers land on. */
    who: 'Bid teams running a regular pipeline',
    monthly: 149,
    annual: 1609,
    credits: 750,
    body:
      '10 users and 750 AI credits a month, plus post-award delivery tracking, monthly social value reports, and advisory checks on the section 52 indicators and the section 71 assessment.',
    cta: 'Request access',
    href: '/contact?enquiry=limited-access#contact-form',
    recommended: true,
  },
  {
    name: 'Portfolio',
    who: 'Enterprise groups and Tier 1 suppliers',
    monthly: null,
    annual: null,
    credits: 3000,
    /* CORRECTED, AND THIS IS THE HEART OF OA-05. This read "Bid volume
       effectively unlimited". Bid volume genuinely is unmetered, but the
       sentence read as "this plan has no cap", and it does: 3,000 AI credits a
       month, enforced by the same guard as every other plan. Both facts are now
       stated separately so neither can be mistaken for the other. */
    body:
      'Unlimited users and 3,000 AI credits a month, branded exports, and a named account contact for high-volume bidding teams.',
    cta: 'Contact sales',
    href: '/contact?product=crowmark&tier=portfolio',
  },
];

/** A cell is a tick, a cross, or a literal value. */
export type Cell = true | false | string;

export interface CompareRow {
  feature: string;
  /** Starter, Pro, Portfolio, in that order. */
  cells: [Cell, Cell, Cell];
}

/*
 * THE TOP FIVE, PLUS THE ROW THAT WAS MISSING.
 *
 * The legacy table led with "Active bids: Unlimited" on all three plans and then
 * never mentioned the axis that IS capped. That is what made OA-05 read as a
 * false claim: not that the bids row was wrong, but that the credits row did not
 * exist to give it context. Both are here now, adjacent, in that order.
 */
export const COMPARE_LEAD: CompareRow[] = [
  { feature: 'Active bids', cells: ['Unlimited', 'Unlimited', 'Unlimited'] },
  { feature: 'AI credits a month', cells: ['200', '750', '3,000'] },
  { feature: 'Seats (licensing)', cells: ['3 users', '10 users', 'Unlimited'] },
  {
    feature: 'Tender feed: Contracts Finder and Find a Tender',
    cells: [true, true, true],
  },
  { feature: 'Grounded AI drafting with PPN 017 disclosure', cells: [true, true, true] },
  { feature: 'Deterministic PPN 002 calculation', cells: [true, true, true] },
];

/*
 * SPLIT, DELIBERATELY. The legacy table carried one row reading "Procurement Act
 * 2023 s.52 / s.71 KPI check". Sections 52 and 71 are two duties with two
 * different verbs and two different moments, and merging them is the specific
 * error recorded as OA-26 and guarded against in src/pages/sources.astro:
 *   s.52  set at least three KPIs before the contract is entered, and publish
 *         them. Applies above £5m.
 *   s.71  assess performance against those KPIs at least every 12 months, and
 *         publish the assessment.
 * A supplier reading a feature table needs to know the product checks both, not
 * that it checks something with a slash in it.
 */
export const COMPARE_MORE: CompareRow[] = [
  { feature: 'Post-award delivery tracking and monthly reports', cells: [false, true, true] },
  {
    feature: 'Section 52 check: indicators set and published (Procurement Act 2023)',
    cells: [false, true, true],
  },
  {
    feature: 'Section 71 check: performance assessed and published (Procurement Act 2023)',
    cells: [false, true, true],
  },
];

export interface CreditPageRow {
  doc: string;
  unit: string;
  example: string;
}

/**
 * What counts as one page for ingestion. Unchanged from the live page, and it
 * matches the platform: CREDIT_WEIGHTS.crowmark_rfp_extract = 3 charged per
 * CREDIT_BILLING_UNITS.crowmark_rfp_extract = 10 pages, rounded up.
 */
export const CREDIT_PAGES: CreditPageRow[] = [
  { doc: 'PDF', unit: 'One page', example: '10-page ITT = 3 credits' },
  { doc: 'PowerPoint', unit: 'One slide', example: '12-slide briefing = 6 credits' },
  { doc: 'Word or plain text', unit: 'The whole document', example: 'Response template = 3 credits' },
  {
    doc: 'Spreadsheet (Excel or CSV)',
    unit: '50 rows of a sheet, rounded up and added across sheets',
    example: '5,000-row pricing schedule = 100 pages = 30 credits',
  },
];

export interface Faq {
  question: string;
  answer: string;
}

/*
 * THE FAQ, WITH FOUR CORRECTIONS. Questions are unchanged from the live page so
 * a returning reader finds the same answers in the same order.
 */
export const PRICING_FAQS: Faq[] = [
  {
    question: 'Is there a free plan?',
    /* WAS "No card is required to start", next to a Request access button.
       There is no self-serve signup to start, so the sentence described a
       motion that does not exist.

       THEN WAS "every plan begins with a 14-day trial". Removed under owner
       decision A-54, 2026-08-04, and this is the more serious of the two
       defects. A published trial is a commercial commitment, and CrowMark is
       sold by scoped engagement with a demo as the CTA, so the offer was one
       nobody intended to honour. The contradiction was inside this very array:
       every plan above carries the CTA "Request access", and this answer sat
       under them promising a trial anyone could start. /roadmap had already
       dropped the same claim while /pricing kept it, so the site was publishing
       two different offers, which is the actual defect. The prices stay; only
       the trial goes. */
    answer:
      'CrowMark is a paid product and there is no free plan. A 14-day evaluation trial is available on request, and you can run the free Tender Compliance Matrix at any time with no account. Access is offered by request rather than self-serve signup, so no card is taken when you ask.',
  },
  {
    /* WAS "How does the 14-day trial work?", answered with "full access to the
       Pro tier of your chosen product" (residue from the retired product
       switcher, when there is one product). The whole entry was replaced under
       A-54: a question that names an offer keeps the offer alive in search
       results and in the FAQPage JSON-LD this array feeds, even if the answer
       underneath denies it.

       A-174, 2026-08-05: THE QUESTION RETURNS, and the reasoning above is why
       it can. A-54's objection was to an offer nobody intended to honour, not
       to trials as such — and the owner has since asked twice for a trial WITH
       LIMITS, then asked directly why it was not back. The entry below states
       the limits rather than promising "full access", which is the difference
       between the claim A-54 removed and this one. It is deliberately the
       SEPARATE entry after "Is there a free plan?", because a free plan and a
       time-limited trial are two different things and conflating them is what
       made the original answer wrong. */
    /* NO CREDIT FIGURE IS PUBLISHED IN THIS ANSWER, and that omission is the
       load-bearing part of it. The day limit, expiry, seat cap and the
       one-trial-per-work-email-domain rule are all built and enforced
       server-side. The GENERATION cap is built but ADVISORY:
       CREDIT_ENFORCEMENT_MODE defaults to "observe" and, confirmed against the
       live Railway service on 2026-08-05, is not set there at all. A published
       credit cap would therefore be decorative, which is precisely the defect
       A-54 removed. See A-80. */
    question: 'How does the 14-day trial work?',
    answer:
      'Ask for one and we set it up. It runs for 14 days at the Starter feature set for up to 3 users, so the Pro surfaces, meaning delivery tracking, monthly social value reports and the section 52 and section 71 checks, are not included. Nothing is charged during the trial. When the 14 days end, access stops unless you take a plan, and your data is retained.',
  },
  {
    question: 'How do I get access?',
    answer:
      'Book a demo. We walk through how you bid, agree the plan and the number of seats that fit it, and set the account up for you. There is no self-serve signup and no card is taken when you ask, so nothing is charged until you have agreed a plan.',
  },
  {
    question: 'Are there any hidden setup fees?',
    answer:
      'No. There are no setup fees, implementation charges or training costs on Starter or Pro. A scoped Portfolio rollout may carry a one-off integration fee, and we tell you the figure before you sign.',
  },
  {
    question: 'Can I switch plans mid-cycle?',
    /* ADDED, and it is enforced rather than advisory: tier-limits.ts blocks a
       CrowMark downgrade when this month's credit usage already exceeds the
       target plan's allowance, and fails closed if it cannot read the usage. A
       customer meets that behaviour, so the page states it. */
    answer:
      'Yes. You can upgrade, downgrade or cancel at any time from the billing dashboard, and changes are pro-rated and applied immediately. One limit is enforced rather than advisory: if you have already used more AI credits this month than the plan you are moving down to includes, the downgrade is held until your credits reset.',
  },
  {
    question: 'Do you price for large organisations?',
    /* SSO CORRECTED. This said broader SAML 2.0 SSO was "on our roadmap" and
       named Microsoft Entra ID as the one identity provider available. Neither
       is true: the platform ships generic SAML 2.0 SSO with SCIM provisioning
       and domain verification (app/api/auth/sso/[org]/{login,acs,metadata},
       SsoConfigForm.tsx, ScimTokenManager.tsx, DomainVerificationManager.tsx).
       No tier is named here, because which plan includes SSO is a commercial
       packaging question the code does not answer and I will not invent. */
    answer:
      'Yes. Portfolio is scoped to your organisation and quoted rather than listed, built around the seats and volume you need. Contact sales for licensing across large supplier networks or multi-entity corporate groups. Single sign-on via SAML 2.0, with SCIM user provisioning, is configured per organisation, so tell us your identity provider and we will confirm the setup.',
  },
  {
    question: 'Why is there no price for the buyer side?',
    answer:
      'A buyer engagement is scoped to the organisation rather than sold by seat, so a single self-serve number would be misleading. It is billed by invoice or purchase order on annual terms, and AI usage is fair use scoped in the contract rather than a published monthly credit allowance. Supplier pricing is published because that side can be published honestly; where it cannot, we say so rather than guess.',
  },
  {
    question: 'How are AI credits counted?',
    /* The included allowances were never published anywhere on the legacy page.
       They are the first sentence now. */
    answer:
      'Each plan includes a monthly allowance: 200 credits on Starter, 750 on Pro and 3,000 on Portfolio. One credit is one AI generation. Reading a tender document and extracting its requirements costs 3 credits per 10 pages, rounded up, so a 10-page ITT costs 3 credits. A page is one PDF page, one PowerPoint slide, or a whole Word or text document. A spreadsheet is counted by rows rather than by sheets: 50 rows count as one page, so a 5,000-row pricing schedule on a single sheet counts as 100 pages, or 30 credits. Everything we calculate rather than generate is never charged and never capped, and a generation that fails is not charged.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards via Stripe. On annual Portfolio plans we can also take payment by invoice and BACS transfer, on request to our finance team.',
  },
];
