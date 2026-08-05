/**
 * faq.ts — every question on /faq, as data.
 *
 * WHY THIS IS DATA AND NOT MARKUP. The legacy page hand-wrote the accordions in
 * HTML and hand-wrote a separate FAQPage JSON-LD block beside them. They drifted,
 * exactly as two hand-maintained copies of the same thing always do:
 *
 *   visible Q&A pairs ................... 14
 *   questions in the JSON-LD ............  9
 *   visible but MISSING from JSON-LD ....  5
 *   present in both but answer differs ..  1
 *   order differs between the two ....... yes (positions 6 and 7 swapped)
 *
 * So 36% of the page was invisible to structured-data consumers, and the entire
 * Security category — the most trust-critical block on the page — was absent
 * from it. That is a real SEO defect and it was nobody's mistake in particular;
 * it is what having two sources guarantees over time.
 *
 * The page renders the accordions from this array AND generates the FAQPage
 * block from this same array. They cannot drift again without someone deleting
 * one of the two call sites.
 *
 * ANSWERS ARE VERBATIM from the live page. Several make claims I have flagged
 * rather than edited, because rewriting published marketing copy is the owner's
 * call, not mine. See OWNER-ACTIONS.md (OA-12).
 */

export interface FaqEntry {
  question: string;
  /** Plain text. Any link is expressed via `link` so the JSON-LD stays clean. */
  answer: string;
  /** Optional in-answer link, rendered after the answer text. */
  link?: { label: string; href: string };
}

export interface FaqCategory {
  id: string;
  label: string;
  heading: string;
  standfirst: string;
  entries: FaqEntry[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'faq-general',
    label: 'General',
    heading: 'General',
    standfirst: 'Foundation, signup, and getting started.',
    entries: [
      {
        // "UK suppliers" -> "suppliers", 2026-08-04. Same OA-33/A-50 change as
        // site.ts and footer.ts, and this answer contradicted itself: it opened
        // by scoping the product to one market and closed with "Both work in the
        // public sector and the private sector." It also feeds /faq's FAQPage
        // node, so the market scoping was in the structured data twice.
        question: 'What is CrowAgent?',
        answer:
          'CrowAgent helps suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award. Its product, CrowMark, drafts every answer from your own submitted bids and checks the figures in code rather than generating them. It serves both sides of a procurement. CrowMark for Suppliers answers tenders, RFPs, RFIs, PQQs and SQs from bids you have already written. CrowMark for Buyers builds and publishes requirements, then locates the evidence for each one across the responses received; it never scores, because the evaluation panel scores. Both work in the public sector and the private sector.',
      },
      // ── A-54, 2026-08-04: THE 14-DAY TRIAL IS GONE FROM THIS FILE ──────────
      // Both entries below asserted a published 14-day free trial with no card
      // required. Owner decision A-54 removed it: CrowMark is sold by scoped
      // engagement with "Book a demo" as the CTA, so a published trial was a
      // commercial commitment nobody intended to honour. The first of the two
      // even carried a "Request access" link beside a sentence saying no card
      // was required to start, which is two different motions in one answer.
      // Publishing two offers is the defect; the trial was the wrong one to
      // keep. This file is the single source for the visible accordions
      // AND the FAQPage JSON-LD (see the header), so a trial left in one entry
      // here would have been published twice, in prose and in structured data.
      // The prices are untouched: only the trial goes.
      {
        question: 'How do I sign up?',
        answer:
          'Book a demo, or request access, and once we have agreed the plan that fits you can create your account. There is no self-serve signup and no card is taken when you ask, and you can start scoring bids or preparing your evidence as soon as you sign in.',
        link: { label: 'Request access', href: '/contact?enquiry=limited-access#contact-form' },
      },
      {
        // The question itself is replaced, not just its answer. A question that
        // names an offer keeps the offer alive in a search result and in the
        // JSON-LD even when the answer beneath it says no.
        // STALE OFFER REMOVED 2026-08-05 (O-25). This answer closed by naming
        // "the PPN 002 social value calculator" as always free. That tool was
        // deleted on owner instruction on 2026-08-04 and both its routes now
        // 301 to /glossary/ppn-002, so the sentence advertised a page that
        // returns a redirect. It was published TWICE per render, in the prose
        // and again in the FAQPage JSON-LD, because both are generated from
        // this one string, so the dead offer was also being fed to search
        // engines as structured data. check-facts.js has no rule for the
        // calculator and could not have caught it.
        //
        // The site's one free tool is the tender compliance matrix, so the
        // sentence is re-pointed rather than dropped: the reader's question
        // ("can I try something before I pay?") has a true answer, and it is
        // the same claim /tools already makes for that tool in its own eyebrow
        // ("Free, no account") and its page body ("there is no sign-up").
        question: 'Can I try CrowMark before I subscribe?',
        answer:
          'Access is offered by request rather than by open signup. Book a demo and we will show you the product against the kind of tenders you bid for, then agree the plan and the seats that fit before anything is charged. No card is taken when you ask. The tender compliance matrix is always free with no account needed.',
      },
    ],
  },
  {
    id: 'faq-products',
    label: 'Products',
    heading: 'Products',
    standfirst: 'How CrowMark finds tenders, drafts answers and scores social value.',
    entries: [
      {
        question: 'What is PPN 002?',
        answer:
          'PPN 002 (Procurement Policy Note 002) is UK government policy dated February 2025 and mandatory from 1 October 2025. It requires a minimum 10% social value weighting on in-scope central government contract evaluations, and sets out five missions, M1 to M5, with eight policy outcomes that suppliers evidence in their bids.',
      },
      {
        question: 'What is the 10% minimum?',
        answer:
          'Under PPN 002, at least 10% of the total evaluation score for in-scope central government contracts must be allocated to social value. Many local authorities and NHS trusts apply the same or a higher weighting. CrowMark lets you model the weighting your buyer published, calculates the social-value total in code, and drafts the narrative with a PPN 017 AI-transparency disclosure for you to approve.',
      },
      {
        question: 'How is social value scored?',
        answer:
          'CrowMark calculates it deterministically in code, using unit-aware arithmetic over a curated catalogue of 19 social-value measures that are aligned to National TOMs conventions and mapped to the 2025 PPN 002 model of five missions and eight policy outcomes. It is not a full National TOMs implementation. The language model never computes the figure: any generated prose containing a £ or % that the computed figures do not support is rejected rather than shown.',
      },
      {
        question: 'Is CrowMark ready to use?',
        answer:
          'CrowMark is live and in daily use, with more being added. Tender discovery from Contracts Finder and Find a Tender, document ingestion, grounded answer drafting, deterministic PPN 002 calculation, delivery tracking and Procurement Act 2023 s.52 and s.71 KPI checks all work today. See the CrowMark page for what each stage covers.',
        link: { label: 'CrowMark page', href: '/crowmark' },
      },
    ],
  },
  {
    id: 'faq-pricing',
    label: 'Pricing',
    heading: 'Pricing',
    standfirst: 'Plans, billing, and subscription management.',
    entries: [
      {
        question: 'What plans are available?',
        // A-54: "All paid plans include a 14-day free trial" removed. The
        // published prices and the 10% annual discount are unchanged.
        // A-174, 2026-08-05: the TRIAL returns as its own entry below rather
        // than as a clause on this one. A-54 was right that a trial bundled
        // into the plans answer published two motions at once; it is a
        // separate offer with its own limits and it reads as one.
        answer:
          "CrowMark's plans are Starter, Pro and Portfolio. Access is offered by request rather than self-serve signup, and annual billing saves 10%.",
        link: { label: 'See current pricing', href: '/pricing' },
      },
      {
        // ── A-174, OWNER INSTRUCTION 2026-08-05: "why free trial 14 days is
        // not yet back?" ──────────────────────────────────────────────────
        //
        // RESTORED AGAINST THE FRAME TERMS ALREADY SETS, rather than as a new
        // promise. terms.md section 2 already reads: "An evaluation trial may
        // be granted on request. Where one is granted it is time limited and
        // usage limited, and its limits are stated to you when access is
        // given." That clause was never removed by A-54 — only the marketing
        // claim was. This entry makes those limits public instead of leaving
        // them to be "stated when access is given", which is what the owner
        // asked for twice: a trial WITH limits.
        //
        // WHY IT IS BY REQUEST AND NOT SELF-SERVE. There is no self-serve
        // signup anywhere on this platform, so a trial that claimed one would
        // contradict every other answer on this page. This is the same motion
        // as every other route in: ask, and we set it up.
        //
        // ── NO CREDIT NUMBER IS PUBLISHED HERE, DELIBERATELY ───────────────
        //
        // This is the single most important constraint on this answer and it
        // comes from A-80's deep dive. Every limit named below is BUILT AND
        // ENFORCED server-side and was verified as such: the day limit, expiry
        // revocation, the seat cap and one-trial-per-work-email-domain.
        //
        // THE GENERATION CAP IS NOT. credit_accounting.py defaults
        // CREDIT_ENFORCEMENT_MODE to "observe", where an exhausted balance is
        // RECORDED but never blocks, and the flip to "enforce" is owner-gated
        // pending real usage numbers. CONFIRMED AGAINST LIVE PRODUCTION
        // 2026-08-05: the variable is not set on the Railway service at all,
        // so it falls through to "observe" and no cap is enforced today.
        // Publishing a credit figure while that is true would recreate the
        // A-54 defect exactly - a number on the site that nothing behind it
        // honours. It goes back only when the flip is confirmed.
        question: 'Is there a free trial?',
        answer:
          'Yes. A 14-day evaluation trial is available on request. It runs at the Starter feature set for up to 3 users, so the Pro surfaces, meaning delivery tracking, monthly social value reports and the section 52 and section 71 checks, are not part of it. Nothing is charged during the trial. When the 14 days end, access stops unless you take a plan, and your data is retained so nothing you produced is lost.',
        link: { label: 'Request a trial', href: '/contact?enquiry=limited-access#contact-form' },
      },
      {
        question: 'Can I cancel anytime?',
        answer:
          'Yes. You can cancel your subscription at any time from Settings > Billing in the platform. Your access continues until the end of the current billing period. Your data is preserved, so if you resubscribe later, everything will still be there.',
      },
      {
        question: 'How are AI credits counted?',
        answer:
          'One credit is one AI generation, such as a drafted tender answer or a rewritten method statement. Your plan includes a monthly allowance of them. Reading a tender document and extracting its requirements is charged by size, at 3 credits per 10 pages, rounded up, so a 10-page invitation to tender costs 3 credits. A page means one PDF page, one PowerPoint slide, or a whole Word or plain text document. Everything CrowAgent calculates rather than generates, including PPN 002 social value arithmetic, scoring and exports, is free and unlimited on every paid plan, and a generation that fails is never charged.',
      },
      {
        question: 'How is a spreadsheet counted when I upload one?',
        answer:
          'By rows, not by sheets. Fifty rows of a sheet count as one page, rounded up and added together across every sheet in the file. A pricing schedule of 5,000 rows on a single Excel sheet therefore counts as 100 pages, which is 30 credits, rather than as a single page. We count it this way because a 5,000-row schedule holds roughly 17 times the text of a 10-page PDF and the AI work scales with how much text there is to read. CSV files are counted exactly like Excel files, and we only count the rows we actually read.',
      },
      {
        question: 'How do billing periods work?',
        // A-54: "After your 14-day trial, you will be prompted to choose a
        // plan" removed. The sentence that followed it began "If you don't
        // subscribe", which only made sense as the end of a trial, so it is
        // restated as what happens when a subscription lapses instead.
        answer:
          "Subscriptions are billed monthly or annually (10% discount). Your billing period starts from the date you subscribe and renews on the same date until you cancel. If a subscription lapses, your data is preserved but you won't be able to create new records or contracts.",
      },
    ],
  },
  {
    id: 'faq-security',
    label: 'Security',
    heading: 'Security',
    standfirst: 'Data integrity, encryption, and privacy standards.',
    entries: [
      {
        question: 'What data do you use?',
        answer:
          "Social value is computed in code from the PPN 002 (February 2025) model with unit-aware arithmetic over CrowMark's curated measure catalogue.",
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes. We use Supabase (PostgreSQL) with Row Level Security on all tables. All data is encrypted in transit (TLS) and at rest. We are protected by Cloudflare (DDoS, Bot Fight Mode, SSL Full Strict). Authentication uses Supabase Auth with optional TOTP MFA. CrowAgent Ltd is registered with the ICO as a data controller and we are GDPR compliant.',
        link: { label: 'See our Security page for full details', href: '/security' },
      },
    ],
  },
];

/** Flattened, in document order — the single source for the FAQPage JSON-LD. */
export const FAQ_ALL: FaqEntry[] = FAQ_CATEGORIES.flatMap((c) => c.entries);
