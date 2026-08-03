/**
 * faq.ts — FAQ questions and answers.
 *
 * Two distinct sources, kept separate because they serve different pages:
 *   1. FAQ_HTML — the 14 Q&A pairs on faq.html (the dedicated FAQ page).
 *   2. COMPARE_FAQS — 8 Q&A pairs embedded in EACH of the 4 compare/*.html
 *      pages (compare-faq-2026-07-30.css confirmed the hunch that these pages
 *      carry their own FAQ blocks, separate from faq.html).
 *
 * ⚠️ FLAGGED INCONSISTENCY (see CONTENT-MODEL.md for the full writeup):
 * faq.html renders FOURTEEN questions as visible <details>/<summary> content,
 * but its own FAQPage JSON-LD in <head> lists only NINE of them. The five
 * missing from the structured data (marked `inJsonLd: false` below) are:
 * "What plans are available?", "Can I cancel anytime?", "How do billing
 * periods work?", "What data do you use?", "Is my data secure?". A visitor
 * sees all 14; a search engine parsing the FAQPage schema only knows about 9,
 * so those 5 are not eligible for a rich-result snippet even though they are
 * real, answered questions on the page.
 */

export type FaqItem = {
  question: string;
  answer: string;
  /** Whether this Q&A is also present in the page's FAQPage JSON-LD (faq.html only). */
  inJsonLd: boolean;
};

/** faq.html — all 14 questions, in page order. */
export const FAQ_HTML: FaqItem[] = [
  {
    question: 'What is CrowAgent?',
    answer: 'CrowAgent helps UK suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award. Its product, CrowMark, drafts every answer from your own submitted bids and checks the figures in code rather than generating them. It serves both sides of a procurement. CrowMark for Suppliers answers tenders, RFPs, RFIs, PQQs and SQs from bids you have already written. CrowMark for Buyers builds and publishes requirements, then locates the evidence for each one across the responses received; it never scores, because the evaluation panel scores. Both work in the public sector and the private sector.',
    inJsonLd: true,
  },
  {
    question: 'How do I sign up?',
    answer: 'Request access and, once approved, you can create your account. Every plan includes a 14-day free trial with no credit card required, and you can start scoring bids or preparing your evidence as soon as you sign in.',
    inJsonLd: true,
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes. Every paid plan includes a 14-day free trial. You get full access to all features during the trial period. No credit card is required to start. The PPN 002 social value calculator is always free with no account needed.',
    inJsonLd: true,
  },
  {
    question: 'What is PPN 002?',
    answer: 'PPN 002 (Procurement Policy Note 002) is UK government policy dated February 2025 and mandatory from 1 October 2025. It requires a minimum 10% social value weighting on in-scope central government contract evaluations, and sets out five missions, M1 to M5, with eight policy outcomes that suppliers evidence in their bids.',
    inJsonLd: true,
  },
  {
    question: 'What is the 10% minimum?',
    answer: 'Under PPN 002, at least 10% of the total evaluation score for in-scope central government contracts must be allocated to social value. Many local authorities and NHS trusts apply the same or a higher weighting. CrowMark lets you model the weighting your buyer published, calculates the social-value total in code, and drafts the narrative with a PPN 017 AI-transparency disclosure for you to approve.',
    inJsonLd: true,
  },
  {
    question: 'How is social value scored?',
    answer: 'CrowMark calculates it deterministically in code, using unit-aware arithmetic over a curated catalogue of 19 social-value measures that are aligned to National TOMs conventions and mapped to the 2025 PPN 002 model of five missions and eight policy outcomes. It is not a full National TOMs implementation. The language model never computes the figure: any generated prose containing a £ or % that the computed figures do not support is rejected rather than shown.',
    inJsonLd: true,
  },
  {
    question: 'Is CrowMark ready to use?',
    answer: 'CrowMark is live and in daily use, with more being added. Tender discovery from Contracts Finder and Find a Tender, document ingestion, grounded answer drafting, deterministic PPN 002 calculation, delivery tracking and Procurement Act 2023 s.52 and s.71 KPI checks all work today. See the CrowMark page for what each stage covers.',
    inJsonLd: true,
  },
  {
    question: 'What plans are available?',
    answer: 'CrowMark\'s plans are Starter, Pro and Portfolio. All paid plans include a 14-day free trial and annual billing saves 10%. See current pricing at /pricing.',
    inJsonLd: false,
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. You can cancel your subscription at any time from Settings > Billing in the platform. Your access continues until the end of the current billing period. Your data is preserved, so if you resubscribe later, everything will still be there.',
    inJsonLd: false,
  },
  {
    question: 'How are AI credits counted?',
    answer: 'One credit is one AI generation, such as a drafted tender answer or a rewritten method statement. Your plan includes a monthly allowance of them. Reading a tender document and extracting its requirements is charged by size, at 3 credits per 10 pages, rounded up, so a 10-page invitation to tender costs 3 credits. A page means one PDF page, one PowerPoint slide, or a whole Word or plain text document. Everything CrowAgent calculates rather than generates, including PPN 002 social value arithmetic, scoring and exports, is free and unlimited on every paid plan, and a generation that fails is never charged.',
    inJsonLd: true,
  },
  {
    question: 'How is a spreadsheet counted when I upload one?',
    answer: 'By rows, not by sheets. Fifty rows of a sheet count as one page, rounded up and added together across every sheet in the file. A pricing schedule of 5,000 rows on a single Excel sheet therefore counts as 100 pages, which is 30 credits, rather than as a single page. We count it this way because a 5,000-row schedule holds roughly 17 times the text of a 10-page PDF and the AI work scales with how much text there is to read. CSV files are counted exactly like Excel files, and we only count the rows we actually read.',
    inJsonLd: true,
  },
  {
    question: 'How do billing periods work?',
    answer: 'Subscriptions are billed monthly or annually (10% discount). Your billing period starts from the date you subscribe. After your 14-day trial, you will be prompted to choose a plan. If you don\'t subscribe, your data is preserved but you won\'t be able to create new records or contracts.',
    inJsonLd: false,
  },
  {
    question: 'What data do you use?',
    answer: 'Social value is computed in code from the PPN 002 (February 2025) model with unit-aware arithmetic over CrowMark\'s curated measure catalogue.',
    inJsonLd: false,
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use Supabase (PostgreSQL) with Row Level Security on all tables. All data is encrypted in transit (TLS) and at rest. We are protected by Cloudflare (DDoS, Bot Fight Mode, SSL Full Strict). Authentication uses Supabase Auth with optional TOTP MFA. CrowAgent Ltd is registered with the ICO as a data controller and we are GDPR compliant. See our Security page for full details.',
    inJsonLd: false,
  },
];

export type CompareFaqSet = {
  /** Which compare page this FAQ block lives on. */
  page: string;
  competitor: string;
  items: { question: string; answer: string }[];
};

/**
 * The 4 compare/*.html detail pages each carry their own 8-question FAQPage
 * JSON-LD block, distinct from faq.html and from each other (competitor
 * names differ). Extracted from each page's <script type="application/ld+json">
 * rather than scraped from the visible .cfaq-a markup, since the JSON-LD is
 * the complete, structured version of the same content.
 */
export const COMPARE_FAQS: CompareFaqSet[] = [
  {
    page: '/compare/crowmark-vs-autogenai',
    competitor: 'AutogenAI',
    items: [
      {
        question: 'Is CrowMark or AutogenAI cheaper?',
        answer: 'CrowMark publishes its prices: Starter is £49 per month and Pro is £149 per month, each with a 14-day free trial. AutogenAI does not publish a price; it is sold as an enterprise subscription on request, so a direct number-to-number comparison is not possible from public information.',
      },
      {
        question: 'Does AutogenAI publish its pricing?',
        answer: 'No. AutogenAI lists no public price and quotes enterprise customers on request. Figures that circulate online are third-party estimates, not vendor-published rates.',
      },
      {
        question: 'Which is better for a small supplier or SME?',
        answer: 'CrowMark is built for UK SMEs and public-sector suppliers, with published plans from £49 per month. AutogenAI is built for enterprise bid teams of five or more, so it tends to be more than a small supplier needs.',
      },
      {
        question: 'Does AutogenAI find tenders for me?',
        answer: 'AutogenAI has no built-in UK tender discovery feed; you bring your own pipeline. CrowMark tracks Contracts Finder and Find a Tender and refreshes the feed every morning at 06:00.',
      },
      {
        question: 'Can either tool stop the AI inventing figures?',
        answer: 'CrowMark uses a deterministic figure-grounding gate: every £ and % in a draft has to exist in an allowed-figure set computed from your own data, or the draft is rejected. We cannot verify an equivalent guarantee in AutogenAI\'s public materials.',
      },
      {
        question: 'Is AutogenAI a bigger company than CrowAgent?',
        answer: 'Yes. AutogenAI is venture-backed and enterprise-scale, having raised a $39.5m Series B in December 2023 and $65.3m in total. CrowMark is a newer product from CrowAgent, focused on the UK SME segment.',
      },
      {
        question: 'Does either cover PPN 002 social value maths?',
        answer: 'CrowMark calculates PPN 002 social value deterministically in code against the 10% minimum weighting, and the AI never computes the total. AutogenAI is a general bid-writing engine rather than a dedicated social-value calculator.',
      },
      {
        question: 'Can I use both CrowMark and AutogenAI?',
        answer: 'Yes. Some teams run an enterprise engine for large, complex proposals and use CrowMark for UK public-sector tender discovery, social-value scoring and post-award delivery evidence. The two are not mutually exclusive.',
      },
    ],
  },
  {
    page: '/compare/crowmark-vs-cleantender',
    competitor: 'CleanTender',
    items: [
      {
        question: 'Is CrowMark or CleanTender cheaper?',
        answer: 'Both publish prices. CleanTender has a free tier and a Pro plan at £99 per month or £990 per year. CrowMark Starter is £49 per month and Pro is £149 per month. For a soft-FM-only supplier, CleanTender Pro at £99 sits between CrowMark\'s two paid tiers.',
      },
      {
        question: 'What sectors does CleanTender cover?',
        answer: 'CleanTender is a soft facilities-management specialist covering cleaning, security, grounds, waste and catering. CrowMark is sector-agnostic and works across any UK public-sector tender on Contracts Finder and Find a Tender.',
      },
      {
        question: 'Does CleanTender handle social value?',
        answer: 'Yes. CleanTender drafts a Social Value and TOMs section as part of its Selection Questionnaire responses. CrowMark calculates PPN 002 social value deterministically in code against the 10% minimum weighting, and the AI never computes the total.',
      },
      {
        question: 'Which finds more tenders?',
        answer: 'CleanTender curates a soft-FM feed from official UK public-sector sources, which is focused but narrow. CrowMark pulls Contracts Finder and Find a Tender across all sectors and refreshes the feed every morning at 06:00.',
      },
      {
        question: 'Does CleanTender have a qualification score?',
        answer: 'Yes, and it is a genuine strength: CleanTender reads a contract pack and scores your stored profile against it from 0 to 100 in under 30 seconds. CrowMark\'s own bid-fit and coverage marking is in development and is not in the released product yet.',
      },
      {
        question: 'Which handles post-award delivery?',
        answer: 'CrowMark tracks each commitment to a delivery percentage with a RAG status, captures evidence, issues monthly social-value reports and checks the Procurement Act 2023 KPI duties in sections 52 and 71. CleanTender does not state a post-award delivery feature.',
      },
      {
        question: 'I run a cleaning company, which should I use?',
        answer: 'If soft FM is all you bid for, CleanTender\'s sector vocabulary, including BICSc, SIA ACS, COSHH, TUPE and NHS national specifications, is tuned for you and its qualification scan is fast. CrowMark is the better fit if you bid across sectors or need deterministic PPN 002 maths and post-award delivery evidence.',
      },
      {
        question: 'Can I use both CrowMark and CleanTender?',
        answer: 'Yes. A soft-FM contractor could use CleanTender for cleaning and security bids and CrowMark for tenders in other sectors, for PPN 002 scoring and for post-award delivery evidence.',
      },
    ],
  },
  {
    page: '/compare/crowmark-vs-mytender-io',
    competitor: 'mytender.io',
    items: [
      {
        question: 'Is CrowMark or mytender.io cheaper?',
        answer: 'CrowMark publishes its prices: Starter is £49 per month and Pro is £149 per month, each with a 14-day free trial. mytender.io does not publish a price; its tiers are shown on request or in the account dashboard, so a like-for-like number comparison is not possible from public information.',
      },
      {
        question: 'Does mytender.io publish its pricing?',
        answer: 'No. mytender.io does not list public prices; it directs prospects to a demo or the account dashboard and offers a one-month refundable period after commencement. On this page we mark its price as Not published.',
      },
      {
        question: 'Is mytender.io a UK company?',
        answer: 'Yes. mytender.io is a University of Southampton startup founded by Samuel Aaron, Jamie Horsnell and Nicolas Dickreuter, with pre-seed investment led by Fuel Ventures. CrowMark is also UK-built, from CrowAgent Ltd.',
      },
      {
        question: 'Does mytender.io find tenders for me?',
        answer: 'mytender.io does not advertise its own daily discovery feed, though it has stated a partnership with a large UK public-sector tender portal. CrowMark tracks Contracts Finder and Find a Tender directly and refreshes the feed every morning at 06:00.',
      },
      {
        question: 'Which is more private or secure?',
        answer: 'mytender.io highlights that it runs inside a Virtual Private Cloud to address confidentiality concerns. CrowMark uses standard cloud hosting with UK and EU data residency, AES-256 encryption at rest and TLS 1.3 in transit. Both are aimed at bid data that cannot go through general public AI tools.',
      },
      {
        question: 'Can either tool stop the AI inventing figures?',
        answer: 'CrowMark uses a deterministic figure-grounding gate: every £ and % in a draft must exist in an allowed-figure set computed from your own data, or the draft is rejected. We cannot verify an equivalent guarantee in mytender.io\'s public materials.',
      },
      {
        question: 'Which suits an SME doing a few public-sector bids?',
        answer: 'CrowMark, because of its published pricing from £49 per month, its deterministic PPN 002 social value maths and its post-award delivery evidence. mytender.io positions itself for UK SMEs producing ten or more bids a year.',
      },
      {
        question: 'Can I use both CrowMark and mytender.io?',
        answer: 'Yes. The two are not mutually exclusive. A team could draft in one platform and use CrowMark for UK tender discovery, PPN 002 social value scoring and post-award delivery evidence.',
      },
    ],
  },
  {
    page: '/compare/crowmark-vs-swiftbid',
    competitor: 'SwiftBid',
    items: [
      {
        question: 'Is CrowMark or SwiftBid cheaper?',
        answer: 'It depends on how many bids you write. SwiftBid charges per bid at £149 (Basic), £349 (Standard) and £749 (Premium). CrowMark is a subscription from £49 per month. For one or two bids a year SwiftBid can be cheaper; from around the third bid a year a CrowMark subscription tends to cost less overall.',
      },
      {
        question: 'Does SwiftBid have a subscription?',
        answer: 'No. SwiftBid is a per-bid service with no subscription, which is the point of it. You pay for each bid you want written. CrowMark is a monthly subscription with continuous access to every feature on your plan.',
      },
      {
        question: 'Does SwiftBid find tenders for me?',
        answer: 'No. SwiftBid has no built-in tender discovery feed; you upload the contract pack you want a bid written against. CrowMark tracks Contracts Finder and Find a Tender and refreshes the feed every morning at 06:00.',
      },
      {
        question: 'Does SwiftBid include a human bid writer?',
        answer: 'Its Premium tier adds optional human expert review alongside the AI draft. CrowMark is self-serve software: it drafts and your own reviewer approves each answer before submission, but it does not supply an external bid writer.',
      },
      {
        question: 'How fast is each one?',
        answer: 'SwiftBid quotes turnarounds as fast as 6 hours on its Premium tier. CrowMark gives you continuous access to draft, score and revise whenever you like, rather than a per-bid turnaround window.',
      },
      {
        question: 'Which handles social value and post-award delivery?',
        answer: 'CrowMark calculates PPN 002 social value deterministically against the 10% minimum weighting and tracks post-award delivery under the Procurement Act 2023 sections 52 and 71. SwiftBid does not state a social-value calculator or a post-award delivery feature.',
      },
      {
        question: 'I only bid once or twice a year, which is better?',
        answer: 'If you bid very occasionally and do not want a subscription, SwiftBid\'s per-bid model may suit you, and its Premium tier can add a human reviewer. If you bid more often, or you want tender discovery, PPN 002 maths and delivery evidence, a CrowMark subscription is likely the better value.',
      },
      {
        question: 'Can I use both CrowMark and SwiftBid?',
        answer: 'Yes. You could run a CrowMark subscription for discovery, social value and delivery evidence, and commission SwiftBid for a one-off high-stakes bid where you want an external expert review.',
      },
    ],
  },
];

