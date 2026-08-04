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
      {
        question: 'How do I sign up?',
        answer:
          'Request access and, once approved, you can create your account. Every plan includes a 14-day free trial with no credit card required, and you can start scoring bids or preparing your evidence as soon as you sign in.',
        link: { label: 'Request access', href: '/contact?enquiry=limited-access#contact-form' },
      },
      {
        question: 'Is there a free trial?',
        answer:
          'Yes. Every paid plan includes a 14-day free trial. You get full access to all features during the trial period. No credit card is required to start. The PPN 002 social value calculator is always free with no account needed.',
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
        answer:
          "CrowMark's plans are Starter, Pro and Portfolio. All paid plans include a 14-day free trial and annual billing saves 10%.",
        link: { label: 'See current pricing', href: '/pricing' },
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
        answer:
          "Subscriptions are billed monthly or annually (10% discount). Your billing period starts from the date you subscribe. After your 14-day trial, you will be prompted to choose a plan. If you don't subscribe, your data is preserved but you won't be able to create new records or contracts.",
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
