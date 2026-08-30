/**
 * pricing.ts: the numbers on /pricing, in one place.
 *
 * EVERY FIGURE BELOW IS DERIVED FROM THE PLATFORM, NOT AUTHORED HERE. The
 * defect this file exists to prevent is recorded in the platform itself
 * (`credit-allowances.ts` header): "the same per-tier number was restated in the
 * Stripe catalogue copy, the marketing site, PLAN_LIMITS, and a downgrade guard,
 * and they disagreed." The marketing site was one of the four that disagreed.
 *
 * Sources, so a future reader can re-check rather than trust:
 *
 *   seats    LOCKED BY OWNER DECISION 2026-08-09,
 *            crowagent-platform/docs/decisions/PRICING-LOCK-2026-08.md
 *            free 1 · trial14 1 · starter 1 · pro 5 · portfolio 10.
 *            Portfolio is NO LONGER unlimited: `null` meant one subscription
 *            could host a 200-person consultancy. It is 10 included, more by
 *            arrangement.
 *            The canonical declaration is moving to
 *            crowagent-platform/packages/pricing/catalogue.ts; the older
 *            seat-limits.ts is being deleted as a competing declaration.
 *            THIS CITATION WAS STALE AND SAID 3 / 10 / unlimited, which is the
 *            precise figure this whole lock exists to correct.
 *
 *   credits  crowagent-platform/web/src/shared/lib/credit-allowances.ts
 *            CREDIT_ALLOWANCES.crowmark = { free: 15, starter: 200, pro: 750,
 *            portfolio: 3000 }, per calendar month. This is the ONLY axis
 *            CrowMark is metered on, and it is the answer to OA-05.
 *
 *   prices   Stripe (live mode) and src/data/crowmark.ts. £49 and £149, NOT
 *            £99. Specs/architecture/DEPLOYMENT-AND-RELEASE.md §3.2 records
 *            "£99/mo" as a non-existent price removed from the OG card on
 *            2026-07-30. Portfolio's £549 list price is deliberately Stripe-only
 *            for post-demo checkout and must not appear here (owner decision
 *            R241-PRICING-STRATEGY change 3).
 *
 *            THE OLD CITATION HERE WAS `pricing.html (live)`, AND IT STOPPED
 *            BEING TRUE ON 2026-08-05, when the Cloudflare Pages deploy source
 *            moved to astro/dist. The legacy root pricing.html is still in the
 *            repo and is served to nobody, so it can no longer corroborate a
 *            figure; this file is the published one.
 *
 *   annual   Exactly 10% off twelve months, never 20%. 49 x 12 = 588, less 10%
 *            = 529.20, published as £529. 149 x 12 = 1,788, less 10% = 1,609.20,
 *            published as £1,609. Both round DOWN, so the published figure is
 *            never higher than the stated discount implies.
 *
 * ── THESE NUMBERS ARE MAINTAINED BY HAND, DELIBERATELY ─────────────────────
 *
 * There used to be scripts/sync-pricing-from-stripe.ts, wired to `npm run
 * sync-pricing`, which pulled active crowagent_* Stripe prices and rewrote a
 * pricing page in place. It was RETIRED on 2026-08-05 rather than re-pointed at
 * this file, and the reason is the row directly above.
 *
 * Stripe holds an ACTIVE, LIST-PRICED Portfolio pair, crowagent_crowmark_
 * portfolio_monthly at 54900 pence and _annual at 592900, verified against live
 * mode on 2026-08-05. The Portfolio card publishes no price at all, because an
 * owner decision says it must not. So the default behaviour of any Stripe-to-page
 * sync, which is to publish what Stripe says, is precisely the one thing this
 * page must never do, and re-pointing the script would have meant building a
 * mechanism whose whole purpose is to copy prices and then bolting a
 * never-copy-this-one exception onto its most valuable tier. Three cards do not
 * justify that risk.
 *
 * The second reason is the one at the top of this file. The defect that made
 * this file necessary was the same per-tier number restated in four places until
 * they disagreed. An automated writer would be a fifth restatement, not a cure,
 * and it would be writing into a file where every figure carries an argument a
 * machine cannot re-derive: the 10%-not-20% rounding rule, the market-neutral
 * `who` strings, the credit allowances read out of the platform.
 *
 * WHAT IS THEREFORE NOT CHECKED, said plainly: nothing compares these figures
 * against Stripe. If you change a price here, open Stripe and change the
 * matching lookup_key, or the checkout will take a different amount from the one
 * the page advertised. `npm run sync-pricing` now refuses and explains.
 *
 * ── R262-WEB-08, 2026-08-09: THAT LAST PARAGRAPH IS NO LONGER THE WHOLE TRUTH ─
 *
 * `scripts/check-pricing-parity.js` now runs as a build gate. It does not talk
 * to Stripe, so the sentence above still holds for Stripe itself, but it does
 * hold this file and the BUILT PAGES against the owner's locked catalogue
 * (crowagent-platform/docs/decisions/PRICING-LOCK-2026-08.md), and it fails the
 * build on any published £ figure, seat count or credit allowance that
 * disagrees with it. Copy drift is what produced every defect recorded in this
 * header; the gate is the thing that stops the next one.
 */

export interface Plan {
  name: string;
  /** Who it is for. Deliberately not sector-scoped: the market-neutral decision. */
  who: string;
  /** Monthly price in £, or null where there is no published price. */
  monthly: number | null;
  /** Annual price in £. Null wherever `monthly` is. */
  annual: number | null;
  /**
   * Included user seats. LOCKED 2026-08-09: 1 / 5 / 10.
   *
   * Declared as a NUMBER rather than left inside the prose, because the whole
   * pricing lock exists because a consolidation quietly raised Starter and Pro
   * from 1/5 to 3/10 and no gate could see it: the figure was only ever a word
   * in a sentence. It is a field now, so `scripts/check-pricing-parity.js` can
   * hold it against the lock, and the prose below is generated from it or
   * checked against it rather than typed twice.
   */
  seats: number;
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
    seats: 1,
    credits: 200,
    body:
      '1 user and 200 AI credits a month. Tender feed, document ingestion, grounded answer drafting, deterministic social value calculation, and branded PDF or DOCX export.',
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
    seats: 5,
    credits: 750,
    body:
      '5 users and 750 AI credits a month, plus post-award delivery tracking, monthly social value reports, and advisory checks on the section 52 indicators and the section 71 assessment.',
    cta: 'Request access',
    href: '/contact?enquiry=limited-access#contact-form',
    recommended: true,
  },
  {
    name: 'Portfolio',
    who: 'Enterprise groups and Tier 1 suppliers',
    monthly: null,
    annual: null,
    seats: 10,
    credits: 3000,
    /* CORRECTED, AND THIS IS THE HEART OF OA-05. This read "Bid volume
       effectively unlimited". Bid volume genuinely is unmetered, but the
       sentence read as "this plan has no cap", and it does: 3,000 AI credits a
       month, enforced by the same guard as every other plan. Both facts are now
       stated separately so neither can be mistaken for the other. */
    body:
      '10 users included, more by arrangement, and 3,000 AI credits a month, branded exports, and a named account contact for high-volume bidding teams.',
    cta: 'Contact sales',
    href: '/contact?product=crowmark&tier=portfolio',
  },
];

/*
 * ── R262-WEB-08 · THE TWO CHARGES A CUSTOMER COULD INCUR AND COULD NOT SEE ───
 *
 * Owner decision, PRICING-LOCK-2026-08.md section 1, verbatim:
 *
 *     Credit top-ups (PUBLIC): £10/100 · £50/500 · £100/1,000, one-time.
 *     Metered overage (PUBLIC): £0.10 per credit.
 *     Top-ups and overage are real charges a customer can incur and previously
 *     appeared on no public surface. That was a clarity gap, not a marketing
 *     choice.
 *
 * All four prices are LIVE AND CHARGEABLE in Stripe today, verified 2026-08-09:
 * `crowagent_credits_topup_100`, `_500`, `_1000` and
 * `crowagent_crowmark_overage_metered`. This site published none of them, so a
 * customer could be billed for something the pricing page never mentioned.
 *
 * THE FIGURES ARE NOT AUTHORED HERE EITHER. They derive from one platform
 * constant, `web/lib/billing/credit-pricing.ts`:
 *
 *     CREDIT_UNIT_PRICE_PENCE = 10                 -> £0.10 a credit
 *     CREDIT_TOPUP_PACK_SIZES = [100, 500, 1000]
 *     topupPricePence(n) = round(n * 10 * (1 - discount)), discount 0 by default
 *
 * so a pack costs exactly its credits at the same £0.10 unit rate: 100 -> £10,
 * 500 -> £50, 1,000 -> £100. A top-up is not cheaper per credit than overage
 * and the page must not imply that it is; what a top-up buys is the ability to
 * keep working without opting into per-credit billing.
 */
export interface CreditTopup {
  /** Credits granted by the pack. */
  credits: number;
  /** One-time price in £. */
  price: number;
}

export const CREDIT_TOPUPS: CreditTopup[] = [
  { credits: 100, price: 10 },
  { credits: 500, price: 50 },
  { credits: 1000, price: 100 },
];

/**
 * Pay-as-you-go overage, in PENCE per credit, so the rate is an integer and
 * cannot pick up a floating-point tail on its way to the page. Rendered as
 * £0.10. Mirrors CREDIT_UNIT_PRICE_PENCE on the platform.
 */
export const OVERAGE_PENCE_PER_CREDIT = 10;

/** £0.10, for prose. Two decimal places always, because a rate reads as one. */
export const OVERAGE_PER_CREDIT_LABEL = `£${(OVERAGE_PENCE_PER_CREDIT / 100).toFixed(2)}`;

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
/*
 * ROWS ARE DERIVED FROM `PLANS`, NOT RETYPED BESIDE IT. R262-WEB-08.
 *
 * The credits row read `['200', '750', '3,000']` and the seats row read
 * `['1 user', '5 users', ...]`, three feet from the array that already holds
 * both numbers. That is the exact shape of the defect the pricing lock was
 * written to end: the same figure restated until two copies disagree. The
 * comparison table now cannot disagree with the cards, because it is not a
 * second copy.
 */
function triple(cell: (p: Plan) => Cell): [Cell, Cell, Cell] {
  const [starter, pro, portfolio] = PLANS;
  return [cell(starter), cell(pro), cell(portfolio)];
}

/** "1 user" / "5 users", and Portfolio's included-plus-more wording. */
function seatCell(p: Plan): string {
  const users = `${p.seats} user${p.seats === 1 ? '' : 's'}`;
  return p.monthly === null ? `${users} included, more by arrangement` : users;
}

export const COMPARE_LEAD: CompareRow[] = [
  { feature: 'Active bids', cells: ['Unlimited', 'Unlimited', 'Unlimited'] },
  { feature: 'AI credits a month', cells: triple((p) => p.credits.toLocaleString('en-GB')) },
  { feature: 'Seats (licensing)', cells: triple(seatCell) },
  /*
   * PUBLISHED FOR THE FIRST TIME, R262-WEB-08. Every row above says what a plan
   * INCLUDES; none of them said what happens after it is used up, and the answer
   * is two real charges that were live in Stripe and on no public surface. The
   * row is identical across all three plans because the offer genuinely is, and
   * a comparison table that omits a charge because it does not differentiate is
   * how the charge stayed invisible.
   */
  {
    feature: 'When the credits run out',
    cells: triple(
      () =>
        /* "BY REQUEST", not "if you turn it on". The platform has a self-serve
           button, but the branch behind it is also gated by a platform-wide
           switch this site cannot read, so a cell promising self-serve would be
           promising a mechanism whose live state is unknown. Same wording as the
           card on /pricing and the answer in the FAQ, deliberately. */
        `Top-ups from £${CREDIT_TOPUPS[0].price}, or ${OVERAGE_PER_CREDIT_LABEL} a credit on pay-as-you-go, by request`,
    ),
  },
  {
    feature: 'Tender feed: Contracts Finder and Find a Tender',
    cells: [true, true, true],
  },
  { feature: 'Grounded AI drafting with PPN 017 disclosure', cells: [true, true, true] },
  { feature: 'Deterministic social value calculation', cells: [true, true, true] },
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
 * THE FAQ, WITH FIVE CORRECTIONS. Questions are unchanged from the live page so
 * a returning reader finds the same answers in the same order.
 *
 * ── THE FIFTH, R262-D-20, 2026-08-08 ────────────────────────────────────────
 * Owner decision, verbatim: "we must not save payment information and let
 * stripe level save this so our claim is correct we dont but stripe will
 * do." Three answers below said "no card is taken", which is false: the
 * platform's create-checkout route (web/app/api/stripe/create-checkout
 * /route.ts) sets `payment_method_collection: "always"` on every Checkout
 * Session it creates, including a trial (`trial_period_days: 14`), so Stripe
 * collects a card before access starts even though nothing is charged during
 * a trial. The accurate and stronger claim, applied consistently below: the
 * card is required, and it is Stripe that holds it, never us.
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
       the trial goes.

       "SO NO CARD IS TAKEN WHEN YOU ASK" REMOVED, R262-D-20, 2026-08-08. See
       the array header. Asking is free, but the trial it names two sentences
       earlier does collect a card at Stripe checkout before it starts. */
    answer:
      'CrowMark is a paid product and there is no free plan. A 14-day evaluation trial is available on request, and you can run the free Tender Compliance Matrix at any time with no account. Access is offered by request rather than self-serve signup. A card is required to start. It is held securely by Stripe and we never store it.',
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
       to trials as such, and the owner has since asked twice for a trial WITH
       LIMITS, then asked directly why it was not back. The entry below states
       the limits rather than promising "full access", which is the difference
       between the claim A-54 removed and this one. It is deliberately the
       SEPARATE entry after "Is there a free plan?", because a free plan and a
       time-limited trial are two different things and conflating them is what
       made the original answer wrong. */
    /* NO CREDIT FIGURE IS PUBLISHED IN THIS ANSWER, and that omission is the
       load-bearing part of it. The day limit, expiry, seat cap and the
       one-trial-per-work-email-domain rule are all built and enforced
       server-side.

       THE SECOND HALF OF THIS NOTE WAS STALE AND IS CORRECTED, R262-WEB-08,
       2026-08-09. It said the generation cap was ADVISORY because
       CREDIT_ENFORCEMENT_MODE "is not set there at all", confirmed 2026-08-05.
       The platform's tracker (RELEASE-2.6.2-TRACKER.md row R262-TRIAL-V3)
       records the flip to "enforce" on Railway staging AND production on
       2026-08-08. The same row records that the variable could not be re-read
       afterwards, and it could not be read from this session either: Railway
       variable listing is credential-gated here. Recorded state: enforce. Live
       state: unverified from this repo.

       THE OMISSION STANDS REGARDLESS. "Recorded as enforced, not verified" is
       not the standard for publishing a limit, and A-80's rule is a standing
       one: the trial credit figure goes back only when the flip is verified on
       the running service. See A-80. */
    question: 'How does the 14-day trial work?',
    /* "A card is required to start it..." ADDED, R262-D-20, 2026-08-08. See
       the array header. This answer is literally "how it works", so the step
       where Stripe collects a card belongs in it; leaving it out was the same
       omission as the removed "no card taken" lines, just by silence rather
       than by a false sentence. */
    answer:
      'Ask for one and we set it up. It runs for 14 days at the Starter feature set for 1 user, so the Pro surfaces, meaning delivery tracking, monthly social value reports and the section 52 and section 71 checks, are not included. A card is required to start it, held securely by Stripe and never stored by us, but nothing is charged during the trial. When the 14 days end, access stops unless you take a plan, and your data is retained.',
  },
  {
    question: 'How do I get access?',
    /* "NO CARD IS TAKEN WHEN YOU ASK" REMOVED, R262-D-20, 2026-08-08. See the
       array header. Asking (booking a demo) never took a card; setting the
       account up, the next clause in this same sentence, does, at Stripe
       checkout. The old wording let the true first half stand for the whole
       process. */
    answer:
      'Book a demo. We walk through how you bid, agree the plan and the number of seats that fit it, and set the account up for you. There is no self-serve signup. Setting the account up needs a card, held securely by Stripe and never stored by us, and nothing is charged until you have agreed a plan.',
  },
  {
    question: 'Are there any hidden setup fees?',
    /* THE ANSWER TO A "HIDDEN CHARGES" QUESTION HAD A HIDDEN CHARGE UNDER IT.
       R262-WEB-08. Two chargeable prices were live in Stripe on the day this
       answer said there were no charges beyond the plan: the credit top-up packs
       and the £0.10 metered overage. Neither is hidden in the sense the question
       means, because neither can happen without the customer buying it, but an
       answer that lists what is not charged and omits what can be is answering
       the question badly. Both are named here and priced in full two answers
       down. */
    answer:
      'No. There are no setup fees, implementation charges or training costs on Starter or Pro. A scoped Portfolio rollout may carry a one-off integration fee, and we tell you the figure before you sign. The only charges beyond your plan are ones you choose: a credit top-up, or pay-as-you-go overage at £0.10 a credit if you ask us to switch it on.',
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
      'A buyer engagement is scoped to the organisation rather than sold by seat, so a single self-serve number would be misleading. It is billed by invoice or purchase order on annual terms, and AI usage is fair use scoped in the contract rather than a published monthly credit allowance. Supplier pricing is published because that side can be published honestly. Where it cannot, we say so rather than guess.',
  },
  {
    question: 'How are AI credits counted?',
    /* The included allowances were never published anywhere on the legacy page.
       They are the first sentence now. */
    answer:
      'Each plan includes a monthly allowance: 200 credits on Starter, 750 on Pro and 3,000 on Portfolio. One credit is one AI generation. Reading a tender document and extracting its requirements costs 3 credits per 10 pages, rounded up, so a 10-page ITT costs 3 credits. A page is one PDF page, one PowerPoint slide, or a whole Word or text document. A spreadsheet is counted by rows rather than by sheets: 50 rows count as one page, so a 5,000-row pricing schedule on a single sheet counts as 100 pages, or 30 credits. Everything we calculate rather than generate is never charged and never capped, and a generation that fails is not charged.',
  },
  /*
   * ── R262-WEB-08 · THE ANSWER TO THE QUESTION THE CREDIT MODEL RAISES ───────
   *
   * The answer above publishes the allowances and then stops, which leaves the
   * one thing a metered plan makes a buyer ask unanswered: what happens when I
   * hit the number. Two real charges live behind that moment and neither had
   * ever appeared on this site.
   *
   * EVERY CLAUSE BELOW WAS READ OUT OF THE PLATFORM BEFORE IT WAS WRITTEN, and
   * the order of the sentences is the order of the code:
   *
   *   spend order   supabase/migrations/20260736000000_i1_ai_credit_ledger.sql,
   *                 the `consume_ai_credits` RPC: `v_from_included` is taken
   *                 from the monthly allowance first, `v_from_topup` is the
   *                 remainder, and only when the remainder exceeds
   *                 `topup_balance` does it RAISE `ai_credits_exhausted`.
   *   no rollover   Same migration's header: the monthly allowance resets with
   *                 the month, while `topup_balance` is CARRIED FORWARD into
   *                 the new month row. "Inventing an expiry on credits the
   *                 customer paid for would be theft" is that file's own line.
   *   refused       api/app/services/credit_accounting.py: in `enforce`,
   *                 exhaustion raises HTTP 402 AI_CREDITS_EXHAUSTED.
   *   opt-in only   Same file: the overage branch needs BOTH the platform
   *                 switch `CREDIT_OVERAGE_ENABLED` and a per-organisation
   *                 `credit_overage_settings` row with enabled=true. Without
   *                 the opt-in it falls back to the refusal
   *                 (api/tests/test_ws4b_overage.py::
   *                 test_overage_enabled_but_not_opted_in_still_402s).
   *
   * WHY "ON REQUEST" AND NOT "IN YOUR SETTINGS". The platform has a self-serve
   * button, but the branch it enables is ALSO gated by CREDIT_OVERAGE_ENABLED,
   * a platform-wide switch that defaults OFF and appears in no deploy record.
   * "Ask us and we switch it on" is true whatever that switch is set to;
   * "press the button and generation continues" would not be. The site does not
   * publish a mechanism whose live state it could not read.
   */
  {
    question: 'What happens when my AI credits run out?',
    answer:
      'Your monthly allowance is spent first, then any top-up credits you have bought. When both are gone, AI generation is refused for the rest of the calendar month rather than continuing and billing you for it. Two things restore it. A credit top-up is a one-off purchase that never expires: £10 for 100 credits, £50 for 500, or £100 for 1,000. Pay-as-you-go overage is switched on for your organisation on request, and each further credit is then billed at £0.10 on your next invoice. Overage stays off unless you ask for it, so you are never billed beyond your plan without agreeing to it first. The monthly allowance resets at the start of each calendar month and does not roll over. Purchased top-up credits do. Everything we calculate rather than generate keeps working either way, and a generation that fails is not charged.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards via Stripe. On annual Portfolio plans we can also take payment by invoice and BACS transfer, on request to our finance team.',
  },
];
