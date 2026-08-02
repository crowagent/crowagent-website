/**
 * crowmark.ts — the content of /crowmark as data.
 *
 * The FAQ array here feeds BOTH the visible accordion and the FAQPage JSON-LD.
 * The legacy page happened to keep its 8 visible pairs in step with its schema,
 * but only by hand — and /faq, which did the same thing, had drifted to 9 schema
 * entries against 14 visible with the whole Security category missing. One
 * source removes the possibility rather than relying on it not happening again.
 *
 * TWO ANSWERS ARE LOAD-BEARING AND MUST BE CARRIED VERBATIM:
 *
 *   FAQ 6 ("Does the fit score tell me whether I will win?") and capability 6
 *   ("Answer marking against the rubric") both explicitly REFUSE a win-likelihood
 *   claim. That refusal is the company's positioning, not hedging to be tidied
 *   away: competitors in this category advertise win rates, and declining to is
 *   the differentiator. Do not soften, shorten or "improve" either sentence.
 *
 * The PPN 002 answer is the best-cited on the site — February 2025, mandatory
 * 1 October 2025, 10% minimum, five missions M1-M5, eight policy outcomes — and
 * it carries the "not a full National TOMs implementation" hedge that
 * /crowmark-buyers is missing (OA-15).
 */

export interface Faq {
  question: string;
  answer: string;
}

export interface Card {
  heading: string;
  body: string;
}

/** Hero proof strip. `lead` is the emphasised fragment. */
export const PROOF = [
  { lead: '3 sources', rest: 'Find a Tender, Contracts Finder, Public Contracts Scotland' },
  { lead: 'Daily', rest: 'Refreshed feed' },
  { lead: 'PPN 017', rest: 'Disclosure on every draft' },
  { lead: 's.52 · s.71', rest: 'Procurement Act 2023' },
];

export const KEY_FACTS = [
  {
    term: 'What it is',
    detail:
      "A UK public-sector bid and tender management suite, and CrowAgent's flagship product.",
  },
  {
    term: 'Who it is for',
    detail:
      'UK SMEs and suppliers bidding for public-sector contracts on Find a Tender, Contracts Finder and Public Contracts Scotland.',
  },
  {
    term: 'Price',
    detail:
      'From £49/month (Starter). Pro is £149/month; Portfolio is contact sales. Every plan starts with a 14-day trial.',
  },
  {
    term: 'The differentiator',
    detail:
      'Deterministic figure-grounding, so the model cannot print a number your data does not contain, plus a PPN 017 AI-use disclosure on every draft and a named person approving every answer.',
  },
  {
    term: 'The statute',
    detail:
      'Advisory checks against the Procurement Act 2023 (sections 52 and 71) and PPN 002 social value, with its mandatory 10% minimum weighting. Advisory, never blocking, and not legal advice.',
  },
];

export const STEPS = [
  {
    n: '01',
    heading: 'Find the tender',
    body: 'Find a Tender, Contracts Finder and Public Contracts Scotland, refreshed daily. Filter by sector, value and region, sort the feed, and bookmark what is worth a bid.',
  },
  {
    n: '02',
    heading: 'Read it, then decide',
    body: 'Upload the tender pack as PDF, DOCX, XLSX or an image, up to 10MB. CrowMark extracts the requirements, scores fit and coverage with the reason behind each component, and returns pursue, review or pass with the gaps named. It reads the tender rather than predicting the award, and a named person decides.',
  },
  {
    n: '03',
    heading: 'Draft the answer',
    body: "Retrieval cites three sources: the regulatory corpus, the tender's own clauses, and your answer library, which is a fallback the response flags when it is used. Your win themes enter every answer, the first draft is critiqued and revised against the tender's own criteria, and social-value totals are computed in code.",
  },
  {
    n: '04',
    heading: 'Prove the delivery',
    body: 'After award, hold the evidence in one vault, record the delivery actuals against each commitment, and produce the authority-facing report, including the annual section 71 roll-up rated red, amber or green.',
  },
];

export const BENEFITS: Card[] = [
  {
    heading: 'The AI cannot invent a figure',
    body: 'Before a draft is shown, every £ and % in the prose is checked against a set of allowed figures computed from your own data. If a number is not in that set, the draft is rejected rather than published. The language model is never the source of a figure. A gate then reports the figures traced, the word count and the citations, and approval stays blocked until it passes.',
  },
  {
    heading: 'PPN 017 disclosure, human approval',
    body: 'Every AI-assisted draft carries a PPN 017 AI-transparency disclosure, and nothing reaches a buyer without a person approving it. A person approves, never the model. If no AI key is configured, CrowMark returns nothing rather than a canned answer.',
  },
  {
    heading: 'Award to delivery to reporting',
    body: 'The commitment you bid stays attached to the contract after award: delivery actuals against each commitment, the evidence held in one vault, an authority-facing report, and advisory section 52 and section 71 KPI checks under the Procurement Act 2023.',
  },
];

export const STATUTES: Card[] = [
  {
    heading: 'Section 52',
    body: 'Public contracts with an estimated value above £5m must have at least three published key performance indicators. CrowMark flags the threshold, counts your published KPIs, and shows the shortfall.',
  },
  {
    heading: 'Section 71',
    body: 'Performance against those KPIs has to be assessed and published. CrowMark holds the KPI set alongside your delivery evidence, so the assessment is drawn from the record rather than reconstructed, and the annual roll-up is rated red, amber or green.',
  },
];

export const CAPABILITIES: Card[] = [
  {
    heading: 'UK tender discovery',
    body: 'Find a Tender, Contracts Finder and Public Contracts Scotland, ingested from their published feeds and refreshed daily. Filter by sector, value and region, sort the feed, and bookmark what matters.',
  },
  {
    heading: 'Cited answer drafting',
    body: "Retrieval runs across three citation buckets: the regulatory corpus, the tender's own clauses, and your organisation's answer library, which is a fallback the response flags when it is used. Win themes enter every answer, the first draft is critiqued and revised against the tender's criteria, and the figure-grounding gate rejects any draft containing a number your data does not support.",
  },
  {
    heading: 'Deterministic PPN 002 maths',
    body: 'Social value is calculated in code with unit-aware arithmetic against the 2025 PPN 002 model: five missions, M1 to M5, and eight policy outcomes. Measures are TOMs-aligned. The 10% minimum weighting is applied, never guessed, and it is a weighting, not a score.',
  },
  {
    heading: 'Tender document ingestion',
    body: 'PDF, DOCX, XLSX, PNG and JPEG up to 10MB. Requirements and clauses are extracted from the text layer and become a citation source in their own right, so an answer can point at the wording it is answering. Scanned PDFs are reported honestly as needing OCR, which CrowMark does not do.',
  },
  {
    heading: 'Bid or no-bid, with reasons',
    body: 'A deterministic six-dimension rubric scores how well a published tender fits your organisation, and shows the reason behind each dimension rather than a single opaque number. It is a fit score, not a prediction: it tells you where you match and where you do not, and the decision stays yours.',
  },
  {
    heading: 'Answer marking against the rubric',
    // The final sentence is a deliberate refusal of a win-likelihood claim. Verbatim.
    body: "A drafted answer is marked for how completely it covers the tender's own published criteria, deterministically and in code. It reports coverage, so you can see which criterion is thin before you submit. It does not estimate a score an evaluator would give, and it never suggests how likely you are to win.",
  },
  {
    heading: 'Post-award evidence vault',
    body: "Delivery actuals against each commitment, with exactly three deterministic verdicts on the evidence: consistent, discrepancy to investigate, or could not verify. Advisory consistency checks against Companies House, UKAS and Cyber Essentials, an authority-facing report, and a round trip back into the buyer's own Word or Excel file.",
  },
  {
    heading: 'SQ and PQQ from one master set',
    body: 'Standard selection questions answered from a reusable master answer set, citing your capability profile: accreditations, insurances, financial standing, policies, case studies and named staff. Offered only above the Procurement Act 2023 section 85 threshold, because below it the question does not arise.',
  },
];

export interface Plan {
  name: string;
  price: string;
  period?: string;
  body: string;
  cta: string;
  href: string;
  /** Rendered as TEXT, not as fill and scale alone. See the page comment. */
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '£49',
    period: '/mo',
    body: '3 users. Tender feed, document ingestion, cited drafting, PPN 002 calculation and PDF or DOCX export.',
    cta: 'Request access',
    href: '/contact?enquiry=limited-access#contact-form',
  },
  {
    name: 'Pro',
    price: '£149',
    period: '/mo',
    body: '10 users, plus the post-award evidence vault and the authority-facing social-value report. Sized for an SME bid team.',
    cta: 'Request access',
    href: '/contact?enquiry=limited-access#contact-form',
    recommended: true,
  },
  {
    name: 'Portfolio',
    price: 'Contact sales',
    body: 'Bid volume effectively unlimited, white-label exports, and a named account contact for high-volume bidding teams.',
    cta: 'Contact sales',
    href: '/contact',
  },
];

export const FAQS: Faq[] = [
  {
    question: 'Is everything described on this page available today?',
    answer:
      'Yes. Every capability described on this page is live in the product today. Work we have built but not yet released to customers is not listed publicly until it ships, so nothing here is a roadmap item.',
  },
  {
    question: 'Where do the tenders come from?',
    answer:
      'Three UK sources, ingested from their published feeds: Find a Tender, Contracts Finder and Public Contracts Scotland. The feed is refreshed daily. You filter by sector, value and region, sort the results, and bookmark what you want to come back to.',
  },
  {
    question: 'Can the AI make up a number in my bid?',
    answer:
      'No. Every £ and % that appears in generated prose has to exist in an allowed-figure set computed from your own data before the draft is released. If it does not, the draft is rejected. The language model is never the source of a figure, and the social-value totals are calculated in code with unit-aware arithmetic. A gate reports the figures traced, the word count and the citations, and approval stays blocked until it passes.',
  },
  {
    question: 'Is AI use disclosed to the buyer?',
    answer:
      'Yes. Every AI-assisted draft carries a PPN 017 AI-transparency disclosure, and a person has to approve the answer before it goes to the buyer. CrowMark does not send anything to a buyer portal on your behalf. If no AI key is configured, CrowMark returns nothing rather than a generic fallback answer.',
  },
  {
    question: 'How is social value calculated?',
    answer:
      'Deterministically, in code. CrowMark uses a curated catalogue of 19 social-value measures, aligned to National TOMs conventions, and applies unit-aware arithmetic against the 2025 PPN 002 model of five missions, M1 to M5, and eight policy outcomes. It is not a full National TOMs implementation, and the AI never computes the total. PPN 002 is dated February 2025 and is mandatory from 1 October 2025, with a 10% minimum social-value weighting. It is a weighting, not a score.',
  },
  {
    question: 'Can CrowMark read a scanned tender document?',
    answer:
      'No. CrowMark reads PDF, DOCX, XLSX, PNG and JPEG files up to 10MB and extracts requirements and clauses from the text layer, quoting only what is present in the source. A scanned PDF with no text layer is reported as needing OCR, which CrowMark does not perform.',
  },
  {
    question: 'Does the fit score tell me whether I will win?',
    // LOAD-BEARING. The refusal of a win-prediction claim is the positioning.
    answer:
      'No. CrowMark scores fit and coverage against the tender in front of you and shows the reason behind each component, and the bid or no bid rubric returns pursue, review or pass with the gaps named. The same inputs always give the same result. It is a reading of the tender, not a prediction of the award, and a named person still makes the decision.',
  },
  {
    question: 'Does CrowMark cover the Procurement Act 2023 KPI duties?',
    answer:
      'CrowMark checks section 52, which applies above an estimated contract value of £5m and expects at least three published KPIs, and section 71, on assessing and publishing performance against them, with an annual roll-up rated red, amber or green. The check is advisory, it never blocks you, and it is not legal advice.',
  },
];
