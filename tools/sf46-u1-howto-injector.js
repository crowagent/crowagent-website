#!/usr/bin/env node
/**
 * SF46 U1 — Inject HowTo JSON-LD on free-tool pages + methodology pages.
 * Each tool's HowTo lists the 3-step "How it works" already documented
 * in the page body. Idempotent.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const TOOLS = {
  'tools/mees-risk-snapshot/index.html': {
    name: 'Check MEES Band E (and proposed C) risk on a UK commercial property',
    description: 'Three-step screen for MEES (SI 2015/962) Band E exposure plus the proposed 2028 Band C tightening.',
    url: 'https://crowagent.ai/tools/mees-risk-snapshot',
    steps: [
      ['Enter property details', 'EPC rating + current use class + lease end date.'],
      ['We score against SI 2015/962', 'Calculation cites the MEES regulation and 2025 Band-C consultation.'],
      ['Get risk verdict + remediation plan', 'Band E exposure today and Band C exposure in 2028.'],
    ],
  },
  'tools/ppn-002-calculator/index.html': {
    name: 'Calculate PPN 002 social-value weighting on a UK public-sector bid',
    description: 'Bid-evaluation calculator for PPN 002 (Cabinet Office, Feb 2025) 10% social-value threshold.',
    url: 'https://crowagent.ai/tools/ppn-002-calculator',
    steps: [
      ['Enter contract value + sector', 'Bid amount + procurement vehicle (PPN 002 vs Procurement Act 2023).'],
      ['We map TOMs weighting', 'Themes/Outcomes/Measures from the National TOMs Framework v4.'],
      ['Get scoring + drafting hooks', 'TOMs split, 10% weighting verified, drafting prompts for the response.'],
    ],
  },
  'tools/cyber-essentials-readiness/index.html': {
    name: 'Pre-screen Cyber Essentials v3.3 (Danzell) readiness',
    description: 'Five-control self-test against Cyber Essentials v3.3 (Danzell, in force 28 April 2026).',
    url: 'https://crowagent.ai/tools/cyber-essentials-readiness',
    steps: [
      ['Answer 5 controls', 'Plain-English questions covering firewall, secure config, access control, malware, patching.'],
      ['We map to v3.3 Danzell', 'Each answer is scored against Cyber Essentials v3.3 (in force 28 April 2026).'],
      ['Get readiness verdict', 'Ready / partial / not yet, with gaps to close before submission.'],
    ],
  },
  'tools/late-payment-calculator/index.html': {
    name: 'Calculate statutory interest + fixed compensation on a late UK B2B invoice',
    description: 'Applies the Late Payment of Commercial Debts (Interest) Act 1998 as amended 2002 and 2013.',
    url: 'https://crowagent.ai/tools/late-payment-calculator',
    steps: [
      ['Enter overdue invoice', 'Invoice amount, original due date, today’s date.'],
      ['We apply the 1998 Act', 'Statutory interest at Bank of England base + 8% with the correct fixed-compensation tier.'],
      ['See total recoverable', 'Interest, fixed compensation, and the statutory basis cited.'],
    ],
  },
  'tools/csrd-applicability-checker/index.html': {
    name: 'Check CSRD applicability post-Omnibus I',
    description: 'Applicability screen against the Corporate Sustainability Reporting Directive after Omnibus I narrowing.',
    url: 'https://crowagent.ai/tools/csrd-applicability-checker',
    steps: [
      ['Enter organisation profile', 'Headcount, turnover, listing status, sector.'],
      ['We screen against Omnibus I thresholds', '1,000-employee AND €450M-turnover dual threshold per Directive (EU) 2026/470.'],
      ['Get applicability verdict + timeline', 'In-scope / out-of-scope / borderline, with the reporting-period first-publication date.'],
    ],
  },
  'tools/vsme-materiality-light/index.html': {
    name: 'Identify VSME material topics under EFRAG VSME (2024)',
    description: 'EFRAG VSME (December 2024) materiality screen for SMEs.',
    url: 'https://crowagent.ai/tools/vsme-materiality-light',
    steps: [
      ['Identify candidate topics', 'Pick ESG topics that could apply to operations and value chain.'],
      ['We score per EFRAG VSME 2024', 'Each topic is screened against impact and financial materiality criteria.'],
      ['Get material-topics shortlist', 'Defensible shortlist with the scoring rationale.'],
    ],
  },
};

const TOOLS_HUB_HOWTO = {
  'tools/index.html': {
    name: 'Run a free CrowAgent compliance check',
    description: 'Pick a free regulator-grade compliance tool and get a defensible answer in under 60 seconds, no account required.',
    url: 'https://crowagent.ai/tools',
    steps: [
      ['Pick your regulation', 'Six tools cover MEES, PPN 002, Cyber Essentials, Late Payment, CSRD, VSME.'],
      ['Answer 3-7 questions', 'Each tool is a short screen against the underlying statute or framework.'],
      ['Get a defensible answer', 'Numeric verdict plus the cited regulation; no email or account required.'],
    ],
  },
};

// Y6 — Methodology pages get HowTo schema describing the calculation steps.
const METHODOLOGY_HOWTO = {
  'tools-mees-risk-snapshot-methodology.html': {
    name: 'MEES Risk Snapshot methodology',
    description: 'How CrowAgent computes the MEES Band E and proposed Band C risk verdict.',
    url: 'https://crowagent.ai/tools-mees-risk-snapshot-methodology',
    steps: [
      ['Read the EPC rating + lease end date', 'Inputs are matched to SI 2015/962 thresholds.'],
      ['Apply Band E rule (in force)', 'Properties below Band E and continuing to let cannot lawfully continue unless an exemption is registered.'],
      ['Apply proposed Band C rule (2028)', 'Government 2025 consultation indicates Band C as the minimum from 2028; we score this as proposed, not confirmed.'],
      ['Output verdict + remediation list', 'Score, regulation citation, and the next-step remediation pathway are returned in under 60 seconds.'],
    ],
  },
  'tools-ppn002-calculator-methodology.html': {
    name: 'PPN 002 Calculator methodology',
    description: 'How CrowAgent applies the PPN 002 (February 2025) 10% social-value weighting.',
    url: 'https://crowagent.ai/tools-ppn002-calculator-methodology',
    steps: [
      ['Capture bid value + procurement vehicle', 'Distinguishes Procurement Act 2023 / PCR 2015 / PPN 002 pathways.'],
      ['Map National TOMs Framework v4 themes', 'Bid scope is matched to the relevant Themes / Outcomes / Measures.'],
      ['Apply 10% threshold', 'Social-value weighting is set to 10% per PPN 002 February 2025.'],
      ['Produce scoring + drafting hooks', 'Bid response prompts cite the regulation and the matched TOMs.'],
    ],
  },
  'tools-cyber-essentials-readiness-methodology.html': {
    name: 'Cyber Essentials Readiness methodology',
    description: 'How CrowAgent maps a 5-question screen to Cyber Essentials v3.3 (Danzell).',
    url: 'https://crowagent.ai/tools-cyber-essentials-readiness-methodology',
    steps: [
      ['Score the 5 control families', 'Firewall, secure config, access control, malware protection, patching.'],
      ['Map to v3.3 Danzell criteria', 'Each answer is mapped to the IASME assessor questionnaire control IDs.'],
      ['Produce readiness verdict', 'Ready / partial / not-yet with the specific control gaps to close.'],
    ],
  },
  'tools-late-payment-calculator-methodology.html': {
    name: 'Late Payment Calculator methodology',
    description: 'How CrowAgent applies the Late Payment of Commercial Debts (Interest) Act 1998.',
    url: 'https://crowagent.ai/tools-late-payment-calculator-methodology',
    steps: [
      ['Capture invoice + due date + today', 'Inputs validated for B2B / public-sector scope (consumer transactions out of scope).'],
      ['Apply statutory interest', 'Base rate + 8 percentage points across the overdue period.'],
      ['Apply fixed compensation', 'Tiered per S5A of the 2013 Late Payment Regulations.'],
      ['Return the recoverable total', 'Interest + fixed compensation + statutory basis cited.'],
    ],
  },
  'tools-csrd-checker-methodology.html': {
    name: 'CSRD Applicability Checker methodology',
    description: 'How CrowAgent applies the post-Omnibus I CSRD applicability thresholds.',
    url: 'https://crowagent.ai/tools-csrd-checker-methodology',
    steps: [
      ['Read headcount + turnover + listing', 'Inputs validated against the post-Omnibus I thresholds.'],
      ['Apply dual-criteria gate', '1,000-employee AND €450M-turnover both required per Directive (EU) 2026/470.'],
      ['Apply timing rules', 'Reporting period start year is derived from the applicability tier.'],
      ['Return verdict + timeline', 'In-scope / out-of-scope / borderline with first-publication date.'],
    ],
  },
  'tools-vsme-materiality-light-methodology.html': {
    name: 'VSME Materiality Light methodology',
    description: 'How CrowAgent screens material topics under EFRAG VSME (December 2024).',
    url: 'https://crowagent.ai/tools-vsme-materiality-light-methodology',
    steps: [
      ['Pick candidate topics', 'User identifies ESG topics that could apply to operations and value chain.'],
      ['Score impact + financial materiality', 'Each topic is screened against EFRAG VSME 2024 criteria.'],
      ['Produce shortlist + path', 'Material-topics shortlist with Basic-only (B) or Comprehensive (B+C) reporting path.'],
    ],
  },
};

function buildHowTo({ name, description, url, steps }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    url,
    totalTime: 'PT2M',
    step: steps.map(([n, d], i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: n,
      text: d,
    })),
  };
}

let added = 0;
for (const [rel, spec] of Object.entries({ ...TOOLS, ...TOOLS_HUB_HOWTO, ...METHODOLOGY_HOWTO })) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { console.log('MISS', rel); continue; }
  const src = fs.readFileSync(file, 'utf8');
  if (/"@type"\s*:\s*"HowTo"/.test(src)) { continue; }
  const block = `<script type="application/ld+json">${JSON.stringify(buildHowTo(spec))}</script>`;
  const out = src.replace('</head>', `${block}\n</head>`);
  fs.writeFileSync(file, out);
  added++;
  console.log('ADD', rel);
}
console.log(`\nU1 HowTo injected on ${added} pages`);
