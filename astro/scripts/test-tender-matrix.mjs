/**
 * test-tender-matrix.mjs — the fixture suite for src/lib/tender-matrix.ts.
 *
 * ── WHY THIS FILE ASSERTS INSTEAD OF PRINTING ───────────────────────────────
 *
 * It replaces scripts/test_matrix_scenarios.mjs, which ran the same twelve
 * scenarios and printed their output. That script exited 0 whatever the engine
 * returned, so the three faults this suite now pins were all present, all
 * visible in its output, and all shipped: the question schedule was skipped, VAT
 * was reported as an award weighting, and "Suppliers are responsible for" read
 * as prose. A harness a human has to read is a harness nobody reads twice.
 *
 * Run: node scripts/test-tender-matrix.mjs   (exit 0 = pass, 1 = fail)
 *
 * IT IS NOT IN THE BUILD CHAIN, and that is deliberate rather than an omission.
 * `npm run build` is a browser-driving certification chain of roughly thirty
 * gates that takes minutes; this is a pure-function suite that takes
 * milliseconds. Run it while editing the engine, where it is useful, rather than
 * once at the end behind a Playwright queue, where it is not.
 */

import { readFileSync } from 'node:fs';
import {
  analyse,
  problems,
  buildCsv,
  buildMarkdown,
  exportFilename,
  MIN_CHARS,
  MAX_CHARS,
} from '../src/lib/tender-matrix.ts';

let failures = 0;
let checks = 0;
let currentCase = '';

function is(actual, expected, what) {
  checks++;
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.error(`  FAIL  ${currentCase} :: ${what}\n        expected ${e}\n        actual   ${a}`);
  }
}

function ok(condition, what) {
  checks++;
  if (!condition) {
    failures++;
    console.error(`  FAIL  ${currentCase} :: ${what}`);
  }
}

function group(name, fn) {
  currentCase = name;
  fn();
}

/** Every requirement_text in the matrix, for membership assertions. */
const texts = (m) => m.rows.map((r) => r.requirement_text);
const hasRow = (m, fragment) => texts(m).some((t) => t.includes(fragment));

/* ══ 1. Validation ═══════════════════════════════════════════════════════════ */

group('validation', () => {
  is(problems(''), [{ field: 'tenderText', code: 'empty' }], 'empty is refused');
  is(problems('   \n  '), [{ field: 'tenderText', code: 'empty' }], 'whitespace is empty');
  is(problems('A'.repeat(MIN_CHARS - 1)), [{ field: 'tenderText', code: 'short' }], 'under MIN_CHARS');
  is(problems('A'.repeat(MAX_CHARS + 1)), [{ field: 'tenderText', code: 'long' }], 'over MAX_CHARS');
  is(problems('A'.repeat(MIN_CHARS)), [], 'exactly MIN_CHARS is accepted');
  is(analyse(''), null, 'analyse returns null on refusal');

  /* A VALID PASTE THAT MATCHES NOTHING IS NOT AN ERROR. It is the honest answer
     "these rules found nothing", and the page says so differently from "your
     input was wrong". */
  const none = analyse('This is a forty character sentence with no obligation words inside.');
  ok(none !== null, 'valid text matching no rule is not null');
  is(none.rows.length, 0, 'and produces no rows');
  is(none.summary.total, 0, 'and a zero total');
});

/* ══ 2. Obligation wording ═══════════════════════════════════════════════════ */

group('obligation wording', () => {
  const m = analyse(`The contractor shall maintain public liability insurance.
The provider is required to submit monthly progress reports.
Suppliers will be required to demonstrate compliance with ISO 27001.
The subcontractor must not engage workers under 18 on this site.
Invoices shall not be submitted before practical completion.`);
  is(m.summary.total, 5, 'five obligations detected');
  is(m.obligationCount, 5, 'obligationCount agrees');
  ok(hasRow(m, 'must not engage'), 'a prohibition is an obligation');
  ok(hasRow(m, 'shall not be submitted'), 'shall not is an obligation');
});

group('obligation wording: the contractual forms', () => {
  const forms = [
    'The supplier is expected to attend quarterly review meetings with the authority.',
    'The supplier is obliged to notify the authority of any change of control.',
    'The supplier undertakes to maintain the service levels set out in Schedule 2.',
    'The supplier agrees to indemnify the authority against third party claims.',
    'The supplier warrants that all personnel hold valid right to work documentation.',
    'The supplier is responsible for ensuring subcontractors hold valid insurance.',
    'The supplier will be expected to mobilise within twenty working days of award.',
  ];
  for (const line of forms) {
    is(analyse(line).rows.length, 1, `detected: ${line.slice(0, 44)}`);
  }
});

group('obligation wording: plural subjects', () => {
  /* MEASURED FAULT, 2026-08-06. `is responsible for` shipped without `are`, so a
     pack written about "suppliers" rather than "the supplier" reported silence.
     Every person-varying form now takes both. */
  is(
    analyse('Suppliers are responsible for ensuring all subcontractors hold valid insurance.').rows.length,
    1,
    'are responsible for'
  );
  is(
    analyse('Bidders are required to submit a signed declaration with their tender.').rows.length,
    1,
    'are required to'
  );
  is(
    analyse('Tenderers are expected to attend the site visit before submitting a bid.').rows.length,
    1,
    'are expected to'
  );
});

group('obligation wording: irregular whitespace from a PDF paste', () => {
  /* MEASURED FAULT, 2026-08-06. A single \s read `is  required  to` as prose.
     Justified PDF text produces exactly this. */
  is(
    analyse('The supplier is  required  to provide a carbon reduction plan for the contract.').rows.length,
    1,
    'doubled spaces'
  );
});

/* ══ 2b. Hard wrapped PDF text ═══════════════════════════════════════════════ */

group('hard wrapped PDF paste', () => {
  /* MEASURED FAULT, 2026-08-06. This four line paste returned ONE row: the
     2,000 word limit had a newline through it and 1.5 was split across the
     break, so both were absent. Paste is the tool's only input. */
  const m = analyse(`1.4 Tenderers are required to provide a written methodology of no more
than 2,000 words.
1.5 The supplier is
required to hold employers liability insurance.`);
  is(m.rows.length, 2, 'both requirements are read');
  is(m.limitCount, 1, 'the wrapped word limit is found');
  is(m.rows[0].limits[0].value, 2000, 'and parses to 2,000');
  is(m.rows[0].requirement_ref, '1.4', 'attributed to the first line of the wrap');
  is(m.rows[1].source_line, 3, 'the second starts at line 3, where the reader will look');
  ok(m.rows[1].requirement_text.includes('is required to hold'), 'the split phrase is rejoined');
});

group('hard wrapped PDF paste: de-hyphenation', () => {
  const m = analyse(`1.1 The supplier must submit a written method-
ology covering mobilisation and transition.`);
  is(m.rows.length, 1, 'one requirement');
  ok(m.rows[0].requirement_text.includes('methodology'), 'the hyphen break is closed up');
});

group('a wrap is only a wrap when the next line starts lower case', () => {
  /* A criteria table must not collapse into one row. Every label is capitalised,
     so every line stands alone. */
  const m = analyse(`Section 4 Award Criteria
Quality 60%
Price 40%`);
  is(m.rows.length, 2, 'the table stays two rows');
  is(m.weightingTotal, 100, 'and totals correctly');

  /* A blank line always ends a run, whatever follows it. */
  const blank = analyse(`The supplier must provide a plan

covering all mobilisation activity across the contract term.`);
  is(blank.rows.length, 1, 'a blank line breaks the join');
  ok(!blank.rows[0].requirement_text.includes('covering all'), 'and the next line is not absorbed');
});

/* ══ 3. Directives: the question schedule ════════════════════════════════════ */

group('directives', () => {
  /* MEASURED FAULT, 2026-08-06. These three lines produced no rows at all. A
     question schedule IS the compliance matrix, and the engine read none of it. */
  const m = analyse(`Q1 Please provide a methodology for delivering the service.
Q2 Demonstrate your experience with similar contracts.
SQ1.1 Confirm your organisation holds Cyber Essentials certification.
3.6 Demonstrate how you will meet the requirement for 24/7 emergency response.`);
  is(m.summary.total, 4, 'every numbered question earns a row');
  is(m.directiveCount, 4, 'directiveCount agrees');
  ok(
    m.rows.every((r) => r.signals.includes('directive')),
    'each carries the directive signal'
  );
  is(m.rows[0].requirement_ref, 'Q1', 'the reference is kept');
  is(m.rows[0].requirement_text, 'Please provide a methodology for delivering the service.', 'verbatim body');
});

group('directives require a reference', () => {
  /* THE GUARD IS THE REFERENCE. Without it the rule fires on narrative prose. */
  const m = analyse('Provide details of the mobilisation plan are set out fully in Appendix A below.');
  is(m.rows.length, 0, 'an unnumbered imperative does not earn a row');
});

group('directives do not resurrect bare headings', () => {
  const m = analyse(`Q1 Please provide a methodology for delivering the service.
4. General
5. Pricing
6. Contract management arrangements`);
  is(m.summary.total, 1, 'only the question, never the headings');
  ok(!hasRow(m, 'General'), 'a bare heading is still not a requirement');
});

/* ══ 4. Response limits ══════════════════════════════════════════════════════ */

group('response limits', () => {
  const m = analyse(`Your response must be no more than 500 words.
Responses should not exceed 4 pages.
A maximum of 1,000 characters is permitted.
Please provide no more than 2 sides of A4.
Your answer must be limited to 300 words.
Provide a 250 word limit response.
Submit your answer in 3 pages maximum.`);
  is(m.limitCount, 7, 'all seven written forms are read');
  is(m.rows[2].limits[0].value, 1000, 'a comma grouped number parses');
  is(m.rows[2].limits[0].unit, 'characters', 'the unit is pluralised');
  ok(
    m.rows.every((r) => r.limits.every((l) => r.source_quote.includes(l.quote))),
    'every limit quote is present verbatim in its source segment'
  );
});

group('response limits: a comparator states a limit on its own', () => {
  /* D-4. MEASURED 2026-08-06: this line reported zero response limits, because
     "Maximum" is five words and a colon away from the figure and the thing that
     actually states the ceiling is the symbol. */
  const m = analyse('4.3 Maximum response length per technical module: ≤3,750 words.');
  is(m.limitCount, 1, 'the comparator form is read');
  is(m.rows[0].limits[0].value, 3750, 'and parses through the comma');
  is(m.rows[0].limits[0].unit, 'words', 'with its unit');

  is(analyse('5.1 Each answer is limited to <500 words for this section of the tender.').limitCount, 1, 'a less-than sign');
  is(analyse('5.2 Provide a summary of ⩽ 250 words describing your approach to delivery.').limitCount, 1, 'the alternative glyph, spaced');

  /* A bare figure with no cue and no comparator is still not a limit. */
  is(
    analyse('5.3 The response ran to 3,750 words when the previous supplier submitted it.').limitCount,
    0,
    'a bare number with neither cue nor comparator states nothing'
  );
});

group('response limits: a clause number is not a word count', () => {
  /* The plain reference form requires punctuation after the number, so a line
     opening "500 words" cannot be read as clause 500. */
  const m = analyse('500 words is the ceiling and the supplier must not exceed it in any answer.');
  is(m.rows.length, 1, 'the obligation is read');
  is(m.rows[0].requirement_ref, null, 'no spurious reference to clause 500');
});

/* ══ 5. Weightings ═══════════════════════════════════════════════════════════ */

group('weightings: a multi line criteria table', () => {
  const m = analyse(`Section 4 - Award Criteria

The contract will be awarded to the most economically advantageous tender.

Quality 60%
Price 30%
Social Value 10%`);
  is(m.weightingCount, 3, 'all three criteria are read');
  is(m.weightingTotal, 100, 'and they total 100');
  is(m.weightingConfidence, 'complete', 'reported as a complete set');
  is(m.rows[0].weight, 60, 'the row carries its own weight');
});

group('weightings: the one line comma separated form', () => {
  const m = analyse(`Section 4 - Award Criteria
Quality 60%, Price 30%, Social Value 10%.`);
  is(m.weightingCount, 3, 'three on one line');
  is(m.weightingTotal, 100, 'totalling 100');
  is(m.rows[m.rows.length - 1].weight, null, 'a line stating three weightings carries none of them');
});

group('weightings: sub criteria sum past 100 and that is normal', () => {
  const m = analyse(`Award Criteria

Technical Quality 60%
  1.1 Methodology and approach 30%
  1.2 Team capability 20%
  1.3 Risk management 10%
Price 30%
Social Value 10%`);
  is(m.weightingCount, 6, 'sub criteria are read too');
  is(m.weightingTotal, 160, 'and the arithmetic sum is reported as found');
  is(m.weightingConfidence, 'sub_criteria', 'flagged as a sub criteria set, not as an error');
});

group('weightings: percentages with no evaluation context anywhere', () => {
  const m = analyse(`The contract value is £500,000.
VAT is charged at 20%.
The supplier must ensure at least 15% of the workforce are apprentices.
Payment terms are net 30 days.
The contract uplift is capped at 5% per annum.`);
  is(m.weightingCount, 0, 'no percentage is read as a weighting');
  is(m.weightingConfidence, 'no_context_found', 'and the page is told percentages were seen');
  is(m.summary.total, 1, 'only the obligation earns a row');
});

group('weightings: proximity to the word award is not proof', () => {
  /* MEASURED REGRESSION, 2026-08-06. An unconditional context re-arm reported
     SIX weightings totalling 130% on this input: the settlement discount, the
     VAT rate, the CPI uplift and the retention were all counted as award
     criteria. The document states two weightings and they sum to 100. */
  const m = analyse(`Section 5 Award Criteria
Quality 60%
Price 40%
The contract commences on 1 April.
Payment terms allow a 2% early settlement discount.
Standard rate VAT of 20% applies to all invoices.
The annual contract uplift is capped at 5% by CPI.
Retention of 3% is held until practical completion.`);
  is(m.weightingCount, 2, 'only the two criteria rows are weightings');
  is(m.weightingTotal, 100, 'and they total exactly 100');
  is(m.weightingConfidence, 'complete', 'reported as a complete set');
  ok(!hasRow(m, 'VAT'), 'the VAT rate is not an award criterion');
  ok(!hasRow(m, 'Retention'), 'the retention is not an award criterion');
  ok(!hasRow(m, 'settlement discount'), 'the settlement discount is not an award criterion');
});

group('weightings: prose that merely ends in a percentage is not a criteria row', () => {
  /* MEASURED 2026-08-06, and found by the page's own sample extract rather than
     by a test, which is the reason the sample is worth having. The first version
     of the criteria-row guard asked only that the percentage CLOSE the segment,
     so this line was read as TWO award criteria and took the sample's weighting
     total to 122%. A criteria row is a label and a number; this is a sentence. */
  const m = analyse(`Section 3 Award Criteria
Quality 60%
Social Value 10%
Price 30%
Payment terms allow a 2% early settlement discount and VAT is charged at 20%.`);
  is(m.weightingCount, 3, 'three criteria, not five');
  is(m.weightingTotal, 100, 'totalling 100');
  is(m.weightingConfidence, 'complete', 'and reported as a complete set');
  ok(!hasRow(m, 'Payment terms'), 'the payment sentence earns no weighting row');
});

group('weightings: the label cap is what separates a row from a sentence', () => {
  /* A label of up to 40 characters is a criteria heading. Beyond that it is
     prose with a number in it, whatever punctuation it ends on. */
  const short = analyse(`Award criteria
Methodology and approach 30%`);
  is(short.weightingCount, 1, 'a 24 character label is a criteria row');

  /* The line must carry no evaluation word of its own, or it qualifies on the
     other clause of readsAsWeighting and the label cap is never consulted. */
  const long = analyse(`Award criteria
The authority will consider the following matters before it decides 30%`);
  is(long.weightingCount, 0, 'a 67 character run of prose is not');
});

group('weightings: a weighting written as a sentence still counts', () => {
  /* Shape is one clause of the rule and evaluation language on the line is the
     other, which is why they are an OR. */
  const m = analyse(`Section 4 Award Criteria
Quality will be weighted at 60% of the total score available.
Price will be weighted at 40% of the total score available.`);
  is(m.weightingCount, 2, 'prose weightings inside context are read');
  is(m.weightingTotal, 100, 'and total correctly');
});

/* ══ 6. References and deduplication ═════════════════════════════════════════ */

group('references: a bare reference is not a requirement', () => {
  const m = analyse(`4. General
5. Pricing
6. Contract management
7. Schedules and annexes`);
  is(m.rows.length, 0, 'a contents list produces nothing');
});

group('references: the dotted guard', () => {
  /* The dotted form caps its first component at two digits so a figure written
     2025.10 cannot be read as clause 2025.10. */
  const m = analyse('2025.10 was the reporting period and the supplier must submit final accounts.');
  is(m.rows[0].requirement_ref, null, 'a year is not a clause number');
});

group('deduplication', () => {
  const m = analyse(`The supplier must provide a carbon reduction plan.
The supplier must provide a carbon reduction plan.
The Supplier Must Provide A Carbon Reduction Plan.`);
  is(m.rows.length, 1, 'one row survives');
  is(m.duplicates, 2, 'two dropped, and the count is reported');
  is(m.summary.total, 1, 'the total counts requirements, not repetitions');
});

/* ══ 7. The full ITT extract ═════════════════════════════════════════════════ */

const ITT = `INVITATION TO TENDER - FACILITIES MANAGEMENT SERVICES

Section 1: Instructions to Tenderers

1.1 Tenderers must read this document in full before submitting a response.
1.2 All responses shall be submitted via the procurement portal by 12:00 noon on the closing date.
1.3 The contracting authority will not accept late submissions under any circumstances.
1.4 Tenderers are required to provide a written methodology of no more than 2,000 words.
1.5 Supporting evidence shall not exceed 10 pages in total.

Section 2: Qualification Questions

Q1 Provide a brief company overview. Maximum 200 words.
Q2 The bidder must confirm they hold, or will hold by contract start, ISO 9001 certification.
Q3 The bidder shall demonstrate a minimum of 3 years' relevant experience.
Q4 Provide evidence of public liability insurance with a minimum value of £5 million.
Q5 The supplier must not have been convicted of any relevant criminal offence in the past 5 years.
SQ1 Confirm the organisation's registered company number and legal entity type.

Section 3: Technical Questions

3.1 Describe your proposed methodology for mobilisation. Your answer must not exceed 1,000 words.
3.2 The supplier shall provide a TUPE analysis where applicable.
3.3 Tenderers are required to submit a draft TUPE schedule within 5 business days of request.
3.4 Provide a staffing plan. No more than 4 sides of A4.
3.5 The contractor must maintain a fully staffed help desk during contracted hours.
3.6 Demonstrate how you will meet the requirement for 24/7 emergency response.

Section 4: Social Value

4.1 The supplier is required to submit a Social Value Plan within 30 days of contract award.
4.2 Describe how you will deliver against the priorities in this tender. No more than 500 words.
4.3 Bidders shall provide evidence of local supply chain spend as a percentage of total contract value.

Section 5: Award Criteria

The award will be based on the most economically advantageous tender.

Technical Quality 60%
  Methodology 30%
  Experience 20%
  Social Value 10%
Price 40%`;

group('the full ITT extract', () => {
  const m = analyse(ITT);

  /* THE THREE THAT USED TO BE MISSING. Before the directive rule this returned
     21 rows against 24 numbered items. */
  ok(hasRow(m, 'Provide evidence of public liability insurance'), 'Q4 is read');
  ok(hasRow(m, "Confirm the organisation's registered company number"), 'SQ1 is read');
  ok(hasRow(m, 'Demonstrate how you will meet the requirement'), '3.6 is read');

  is(m.summary.total, 24, 'twenty four requirements');
  is(m.rows.length, 24, 'and none truncated');
  is(m.truncated, false, 'truncated is false');
  is(m.weightingCount, 5, 'five weightings in the criteria table');
  is(m.weightingTotal, 160, 'summing to 160 with sub criteria');
  is(m.weightingConfidence, 'sub_criteria', 'flagged as sub criteria');
  is(m.limitCount, 6, 'six response limits');

  /* Honesty rule 2, asserted rather than asserted about: every row's text must
     be findable in the input the reader pasted. */
  ok(
    m.rows.every((r) => ITT.includes(r.source_quote)),
    'every source_quote appears verbatim in the input'
  );
  ok(
    m.rows.every((r) => r.source_quote.includes(r.requirement_text)),
    'every requirement_text is a substring of its own quote'
  );
  ok(
    m.rows.every((r) => r.extraction_confidence === null && r.compliance === null),
    'nothing is invented in the fields that cannot be filled honestly'
  );
  ok(
    m.rows.every((r) => r.category === 'other' && r.status === 'suggested'),
    'nothing is categorised and every row is marked unconfirmed'
  );
});

/* ══ 8. Scale and the row cap ════════════════════════════════════════════════ */

group('the row cap counts everything and says so', () => {
  const many = Array.from(
    { length: 400 },
    (_, i) => `${i + 1}.1 The supplier must deliver work package number ${i + 1} on time.`
  ).join('\n');
  const m = analyse(many);
  is(m.rows.length, 300, 'rows are capped at MAX_ROWS');
  is(m.summary.total, 400, 'but the true total is still reported');
  is(m.truncated, true, 'and truncated declares it');
});

group('a large paste completes in reasonable time', () => {
  const big = (ITT + '\n').repeat(60);
  ok(big.length < MAX_CHARS, 'fixture is under the input ceiling');
  const started = process.hrtime.bigint();
  const m = analyse(big);
  const ms = Number(process.hrtime.bigint() - started) / 1e6;
  ok(m !== null, 'it returns a matrix');
  ok(ms < 2000, `analysis of ${big.length} chars took ${ms.toFixed(0)}ms, under 2000ms`);
});

/* ══ 9. Export ═══════════════════════════════════════════════════════════════ */

group('CSV export', () => {
  const m = analyse(ITT);
  const csv = buildCsv(m);

  ok(csv.startsWith('﻿'), 'begins with a UTF-8 BOM so Excel does not mangle £');
  ok(csv.includes('£5 million'), 'the pound sign survives into the file');
  ok(csv.split('\r\n')[0].includes('Source quote'), 'the evidence column exists');
  is(csv.split('\r\n').filter((l) => l.length > 0).length, m.rows.length + 1, 'one header plus one line per row');
  ok(csv.includes('\r\n'), 'RFC 4180 CRLF line endings');
});

group('CSV export neutralises spreadsheet formulas', () => {
  /* A tender pack is a document the bidder RECEIVED. Excel, LibreOffice and
     Sheets all execute a cell whose FIRST character is =, +, - or @, which is
     the only position that matters: quoting the field does not stop it, because
     the CSV parser consumes the quotes before the formula parser runs.

     The reference is stripped off the body, so `1.1 =HYPERLINK(...)` puts the
     equals sign at character one of the Requirement cell. */
  const m = analyse(`1.1 =HYPERLINK("http://evil","click me") must be actioned by the supplier.
1.2 @SUM(1+1) must be applied to every invoice line without any exception.`);
  is(m.rows.length, 2, 'both lines are detected');

  const csv = buildCsv(m);
  ok(!csv.includes('"=HYPERLINK'), 'no cell opens with a bare =');
  ok(!csv.includes('"@SUM'), 'no cell opens with a bare @');
  ok(csv.includes(`"'=HYPERLINK`), 'the = cell is prefixed with an apostrophe');
  ok(csv.includes(`"'@SUM`), 'the @ cell is prefixed with an apostrophe');
  /* Doubled quotes, because the inner quotes are CSV escaped by the same pass. */
  ok(csv.includes('HYPERLINK(""http://evil""'), 'and the text itself is preserved, not stripped');

  /* An ordinary cell is untouched: the guard must not decorate every row. */
  const plain = buildCsv(analyse('The supplier must provide a carbon reduction plan for the contract.'));
  ok(!plain.includes(`"'`), 'a cell with no leading operator gets no apostrophe');
});

group('CSV export escapes quotes and commas', () => {
  const m = analyse('1.1 The supplier must supply "widgets", "gadgets" and spare parts on request.');
  const csv = buildCsv(m);
  ok(csv.includes('""widgets""'), 'embedded double quotes are doubled');
  const dataLine = csv.split('\r\n')[1];
  /* Ten columns means nine separating commas OUTSIDE quoted fields. */
  is((dataLine.match(/","/g) || []).length, 9, 'ten fields on the data line');
});

group('Markdown export', () => {
  const m = analyse(ITT);
  const md = buildMarkdown(m);
  const lines = md.split('\n');
  is(lines.length, m.rows.length + 2, 'header, rule, and one line per row');
  ok(lines[0].includes('Source quote'), 'the evidence column exists here too');
  ok(lines[1].startsWith('| ---'), 'a valid GFM separator row');
  ok(
    lines.slice(2).every((l) => (l.match(/(?<!\\)\|/g) || []).length === 11),
    'every row has ten cells with unescaped pipes only at the boundaries'
  );
});

group('Markdown export escapes pipes in requirement text', () => {
  const m = analyse('1.1 The supplier must record the value as cost | margin | total on each line.');
  const md = buildMarkdown(m);
  ok(md.includes('cost \\| margin'), 'a pipe inside a requirement is escaped');
});

group('export filename uses the local date', () => {
  /* toISOString would stamp YESTERDAY on a London export at 00:30 BST. */
  const bstMidnightThirty = new Date(2026, 6, 15, 0, 30, 0);
  is(exportFilename(bstMidnightThirty), 'tender-compliance-matrix-2026-07-15.csv', 'local date, zero padded');
  is(exportFilename(new Date(2026, 0, 5, 12, 0, 0)), 'tender-compliance-matrix-2026-01-05.csv', 'single digit month and day pad');
});

/* ══ 10. Deadlines ═══════════════════════════════════════════════════════════ */

group('deadlines', () => {
  const m = analyse(`Tenders must be received by 12:00 noon on 14 March 2026.
The deadline for clarification questions is 5pm on 3 February.
Responses submitted by 21/02/2026 will be acknowledged within two working days.`);
  is(m.deadlineCount, 3, 'each closing point is read');
  ok(
    m.rows.every((r) => r.signals.includes('deadline')),
    'each carries the deadline signal'
  );
  const stated = m.rows.flatMap((r) => r.deadlines.map((d) => d.text));
  ok(stated.includes('14 March 2026'), 'a long-form date is read whole');
  ok(stated.includes('12:00'), 'a clock time is read');
  ok(stated.includes('5pm'), 'a bare pm time is read');
  ok(stated.includes('21/02/2026'), 'a numeric date is read');
});

group('deadlines: a date without a closing cue is not a deadline', () => {
  /* A pack is full of dates. Reading all of them buries the one that matters. */
  const m = analyse(`The contract commences on 1 April 2026 and runs for three years.
Quarterly reports are produced in January, April, July and October each year.`);
  is(m.deadlineCount, 0, 'a start date is not a closing date');
});

group('deadlines: nothing is resolved into a Date', () => {
  /* "14/03/2026" is 14 March here and 3 April to an American parser, and
     "3 February" has no year in the document at all. The row carries what the
     document wrote. */
  const m = analyse('The submission date is 3 February and no late tenders are accepted at all.');
  is(m.rows[0].deadlines[0].text, '3 February', 'the fragment is verbatim');
  ok(
    m.rows.every((r) => r.deadlines.every((d) => typeof d.text === 'string')),
    'a deadline is a string, never a Date'
  );
});

/* ══ 11. Pass or fail markers ════════════════════════════════════════════════ */

group('mandatory markers', () => {
  const lines = [
    'This is a pass/fail requirement and no marks are awarded for it.',
    'Holding valid employers liability insurance is mandatory for this contract.',
    'Failure to provide a signed declaration will result in your bid being rejected.',
    'Bidders who cannot meet this minimum requirement shall be excluded from evaluation.',
    'A conviction for the offences listed is grounds for exclusion under the Act.',
  ];
  for (const line of lines) {
    const m = analyse(line);
    is(m.mandatoryCount, 1, `marked: ${line.slice(0, 44)}`);
    ok(m.rows[0].signals.includes('mandatory'), 'carries the mandatory signal');
  }
});

group('mandatory markers do not fire on ordinary wording', () => {
  const m = analyse('The supplier must provide monthly reports covering all contracted services.');
  is(m.mandatoryCount, 0, 'an ordinary obligation is not marked pass or fail');
  ok(m.rows[0].signals.includes('obligation'), 'but it is still an obligation');
});

/* ══ 12. Cost of a hostile paste ═════════════════════════════════════════════ */

group('no input freezes the tab', () => {
  /*
   * The tool reads text a visitor received from someone else, so the input is
   * untrusted by definition. There is no server to attack here, no network call
   * and no endpoint, so the only denial of service available is against the
   * visitor's own tab. Every pattern in the library is linear or bounded; these
   * are the shapes that would expose it if one were not.
   */
  const NL = String.fromCharCode(10);
  const CTRL = String.fromCharCode(0) + String.fromCharCode(8) + String.fromCharCode(27) + '[31m';
  const cases = {
    'ordinary ITT at the ceiling': ('The supplier must provide a plan of no more than 500 words.' + NL).repeat(3300),
    'one enormous line': 'The supplier must provide '.repeat(7000),
    'percent storm': 'Award criteria weighting ' + '50% '.repeat(45000),
    'clause reference storm': ('1.1.1.1.1.1.1.1.1.1.1.1 must a' + NL).repeat(6000),
    'whitespace storm': 'The supplier is' + ' '.repeat(150000) + 'required to act now.',
    'criteria row bait': ('x'.repeat(79) + ' 50%' + NL).repeat(2300),
    'dotted number bait': '1.'.repeat(90000),
    'date storm': 'The deadline is 12:00 on 14 March 2026. '.repeat(5000),
    'control characters': (CTRL + ' The supplier must act.' + NL).repeat(4000),
  };
  for (const [name, raw] of Object.entries(cases)) {
    const text = raw.slice(0, MAX_CHARS);
    const started = process.hrtime.bigint();
    const m = analyse(text);
    const ms = Number(process.hrtime.bigint() - started) / 1e6;
    ok(m !== null, `${name}: returns a matrix`);
    ok(ms < 1500, `${name}: ${ms.toFixed(0)}ms, under 1500ms at ${text.length} chars`);
  }
});

group('the library reaches nothing outside itself', () => {
  /*
   * Asserted against the SOURCE rather than trusted, because the claim the page
   * makes to a visitor is that the text never leaves the browser. A fetch added
   * here later would make that sentence false and nothing else would notice.
   */
  const src = readFileSync(new URL('../src/lib/tender-matrix.ts', import.meta.url), 'utf8');
  for (const sink of ['fetch(', 'XMLHttpRequest', 'sendBeacon', 'WebSocket', 'new Worker', 'import(']) {
    ok(!src.includes(sink), `no ${sink} in the library`);
  }
  for (const sink of ['innerHTML', 'eval(', 'new Function', 'document.write']) {
    ok(!src.includes(sink), `no ${sink} in the library`);
  }

  /*
   * ── NO STRAY CONTROL CHARACTERS, AND THIS ONE IS FROM EXPERIENCE ───────────
   *
   * On 2026-08-06 a scripted edit wrote a literal BACKSPACE (0x08) into a
   * regular expression where `\b` was intended, twice, in one pattern. The file
   * type-checked, the build passed, every other test passed, and the rule
   * silently matched nothing at all: `/\x08(?:means|...)\x08/` cannot match
   * text. It was found by reading the output of a scenario that should have
   * changed and had not.
   *
   * A rule engine is a file of regular expressions, so a corrupted escape is
   * indistinguishable from a rule that was never written. This is the cheapest
   * possible guard against the whole class.
   */
  const control = [...src].filter((c) => {
    const n = c.charCodeAt(0);
    return n < 9 || (n > 10 && n < 32 && n !== 13);
  });
  is(control.length, 0, 'no control characters in the library source');
});

/* ══ 13. Found by a real stress test, 2026-08-06 ═════════════════════════════
 *
 * A 45-clause ERP tender was pasted into the built tool and its output read
 * clause by clause. Everything below is a fault that pass found, and every one
 * of them was invisible to the 172 checks that existed before it. A fixture
 * suite proves the cases somebody thought of; a real document is what finds the
 * ones nobody did.
 * ═══════════════════════════════════════════════════════════════════════════ */

group('stress test: will be responsible for', () => {
  const m = analyse('5.4.1 The successful Contractor will be responsible for extracting and migrating data.');
  is(m.rows.length, 1, 'detected');
  is(m.rows[0].requirement_ref, '5.4.1', 'with its reference');
});

group('stress test: lettered and roman sub-clauses', () => {
  /* Each produced a row with NO reference, leaving the clause number jammed on
     the front of the requirement text, because the dotted form demanded digits
     in every component. */
  const cases = [
    ['3.4.a Font must be Times New Roman, Arial, or Calibri for all body text.', '3.4.a'],
    ['5.2.b If a cloud solution is proposed, the data must reside within national borders.', '5.2.b'],
    ['6.1.a The Bidder must hold a valid ISO/IEC 27001:2022 certification at submission.', '6.1.a'],
    ['3.2.1.b.iv The Bidder must supply a signed declaration covering all subcontractors.', '3.2.1.b.iv'],
  ];
  for (const [line, ref] of cases) {
    const m = analyse(line);
    is(m.rows[0].requirement_ref, ref, `reference isolated: ${ref}`);
    ok(!m.rows[0].requirement_text.startsWith(ref), 'and stripped off the requirement text');
  }

  /* The digit guard still holds: a year is not a clause number. */
  is(
    analyse('2025.10 was the reporting period and the supplier must submit final accounts.').rows[0]
      .requirement_ref,
    null,
    'a year is still not a clause'
  );
});

group('stress test: month-first dates', () => {
  /* The closing TIME was read and the closing DATE was dropped, so the row said
     14:00 without saying which day. */
  const m = analyse('3.5 Submissions must be uploaded prior to the Closing Time of 14:00:00 on September 30, 2026.');
  const stated = m.rows[0].deadlines.map((d) => d.text);
  ok(stated.includes('September 30, 2026'), 'the month-first date is read');
  ok(stated.includes('14:00:00'), 'and the seconds are kept');

  const uk = analyse('1.2 Tenders must be received by 12:00 noon on 14 March 2026 at the latest.');
  const ukStated = uk.rows[0].deadlines.map((d) => d.text);
  ok(ukStated.includes('14 March 2026'), 'the day-first form still works');
  ok(ukStated.includes('12:00'), 'alongside the time');
});

group('stress test: the other ways a pack says pass or fail', () => {
  const cases = [
    '6.1 Submissions that fail to meet the following criteria will not proceed to evaluation.',
    '2.2 Bidders must not contact staff. Any breach will result in immediate disqualification.',
    '3.3 Inclusion of financial data outside Volume 3 shall be grounds for immediate exclusion.',
    '5.2.b All data must stay onshore. Offshore data storage is strictly prohibited entirely.',
    '3.5 Submissions close at noon. Hard copy submissions will not be accepted after that.',
  ];
  for (const line of cases) {
    const m = analyse(line);
    is(m.mandatoryCount, 1, `marked: ${line.slice(0, 46)}`);
  }
});

group('stress test: bracketed award criteria', () => {
  /* THE MOST CONSEQUENTIAL MISS OF THE PASS. These four ARE the award criteria
     and they sum to 100; the tool reported no weightings at all, because the
     bare-pair rule's 40 character label cap cannot hold labels this long and the
     160 character length guard rejected the line before any pattern ran. */
  const m = analyse(`7.1 Eligible proposals will be evaluated against the following weighted criteria:
7.1.1 Technical Architecture & Security (35%) 7.1.2 Implementation Methodology & Change Management (25%) 7.1.3 Usability and Accessibility (10%) 7.1.4 Total Cost of Ownership (30%)`);
  is(m.weightingCount, 4, 'all four are read from one pasted line');
  is(m.weightingTotal, 100, 'and they total 100');
  is(m.weightingConfidence, 'complete', 'reported as a complete set');

  const perLine = analyse(`4.1 Submissions will be evaluated on a MEAT basis.
4.2 Technical Merit (60%)
4.3 Commercial (30%)
4.4 Social Value (10%)`);
  is(perLine.weightingCount, 3, 'and the same form one per line');
  is(perLine.weightingTotal, 100, 'totalling 100');
});

group('stress test: brackets do not license prose', () => {
  /* The longer label is bought by the brackets, so a sentence that merely
     contains a bracketed percentage must still fail. */
  const m = analyse(`Section 3 Award Criteria
Quality 60%
Price 40%
The authority may apply a retention of three per cent (3%) on each invoice raised.`);
  is(m.weightingCount, 2, 'the retention sentence is not a criterion');
  is(m.weightingTotal, 100, 'and the total is the document’s');
});

group('stress test: use and mention', () => {
  /*
   * A DECISION REVERSED ON EVIDENCE, 2026-08-06, and worth recording as that.
   *
   * The first stress document quoted a trigger inside prose ABOUT requirements,
   * and suppressing it was considered and REJECTED here, on the ground that a
   * real clause quotes the words a bidder has to write. A second document
   * settled it: its Part 1 was a glossary, and three of seventeen rows were
   * definitions naming the phrases "must comply", "shall be responsible for" and
   * "is expected to". Those are mentions, not uses, and no bid team wants them
   * in a compliance matrix.
   *
   * The rule that fixes it is narrower than the one first rejected. It is not
   * "ignore a line containing quotes"; it is "a trigger that appears ONLY inside
   * quotes is a mention", which leaves every clause below untouched.
   */
  const mention = analyse('1.2 The phrase "the Contractor shall be responsible for" carries the same legal weight.');
  is(mention.rows.length, 0, 'a definition naming a phrase is not a requirement');

  const use = analyse('8.1 For each item, the Bidder must state "Compliant", "Partially Compliant", or "Non-Compliant".');
  is(use.rows.length, 1, 'a clause quoting its own answers keeps its obligation');

  const curly = analyse('1.4 The phrase “the Contractor must” carries the same legal weight as before in law.');
  is(curly.rows.length, 0, 'curly quotes are quotes too');

  /* An apostrophe is not an opening quote, or every possessive would lose its
     trigger. This is why the rule reads double quotes only. */
  const apostrophe = analyse("2.4 The Bidder's response must include a signed declaration from a company director.");
  is(apostrophe.rows.length, 1, 'a possessive apostrophe does not suppress anything');

  /* Values are read from the original text: a figure inside quotation marks is
     still a figure the document states. Only triggers are use-and-mention. */
  const quotedLimit = analyse('3.1 Provide a response of "no more than 500 words" for this particular question.');
  is(quotedLimit.rows[0].limits[0].value, 500, 'a quoted limit is still a limit');
});

group('stress test: prohibitions the pack writes without must or shall', () => {
  const m = analyse('4.2.1.b Staff are not permitted to commence work until the DBS certificate is verified.');
  is(m.rows.length, 1, 'are not permitted to');
  is(m.rows[0].requirement_ref, '4.2.1.b', 'with its four-part reference');
  is(
    analyse('5.5 The Contractor is prohibited from subcontracting without prior written consent.').rows.length,
    1,
    'is prohibited from'
  );
});

/* ══ 14. Part-lettered numbering and heavy legal phrasing, 2026-08-06 ════════
 *
 * A traffic-management RFT numbered by PART rather than by section. Measured
 * before any change: NOT ONE of its seventeen clauses produced a reference, so
 * the reference column was empty down the entire matrix and every clause number
 * sat jammed on the front of its requirement text.
 * ═══════════════════════════════════════════════════════════════════════════ */

group('part-lettered clause references', () => {
  const cases = [
    ['A.1.2 The Bidder warrants that all cryptographic modules are FIPS 140-2 compliant.', 'A.1.2'],
    ['B.1.1 Bidders must strictly adhere to the performance metrics defined in the table.', 'B.1.1'],
    ['C.1.2 It is a fundamental condition that the system achieves readiness on schedule.', 'C.1.2'],
    ['C.1.1(ii) Hardware procurement and staging shall commence within 48 hours of approval.', 'C.1.1(ii)'],
    ['A.1.3(a) Hot storage must accommodate ninety days of high-resolution video telemetry.', 'A.1.3(a)'],
    ['B.1.1.ii The Bidder must maintain core system availability across the whole term.', 'B.1.1.ii'],
  ];
  for (const [line, ref] of cases) {
    const m = analyse(line);
    is(m.rows[0].requirement_ref, ref, `reference isolated: ${ref}`);
    ok(!m.rows[0].requirement_text.startsWith(ref), 'and stripped off the requirement text');
    ok(m.rows[0].source_quote.startsWith(ref), 'while the quote keeps it, verbatim');
  }
});

group('a reference glued to its text by a bad PDF extract', () => {
  /* D-2. MEASURED 2026-08-06, rows 2 and 3 of the owner's export: both produced
     a row with NO reference, leaving the clause number on the front of the
     requirement text, because every pattern required trailing whitespace. */
  const cases = [
    ['1.1.1(a)(iv)(A)Failure to provide evidence will result in immediate exclusion.', '1.1.1(a)(iv)(A)'],
    ['-§1.1.1(a)(v)TheContractor must maintain ISO27001 certification throughout.', '1.1.1(a)(v)'],
    ['1.1.1TheBidder must submit the completed appendix with its tender response.', '1.1.1'],
  ];
  for (const [line, ref] of cases) {
    const m = analyse(line);
    is(m.rows[0].requirement_ref, ref, `glued reference isolated: ${ref}`);
    ok(!m.rows[0].requirement_text.startsWith(ref), 'and stripped off the text');
  }

  /*
   * THE STRUCTURAL GUARD IS WHAT MAKES THIS SAFE. Without requiring three or
   * more components or a parenthesis, "4.5M pounds" reads 4.5 as a clause and
   * returns "M pounds is the minimum turnover" as a requirement.
   */
  is(
    analyse('4.5M pounds is the minimum turnover the supplier must demonstrate annually.').rows[0]
      .requirement_ref,
    null,
    'a figure with a capital suffix is not a clause number'
  );
  is(
    analyse('1.5m clearance must be maintained around every access panel at all times.').rows[0]
      .requirement_ref,
    null,
    'and neither is a measurement'
  );
});

group('a capital letter and a dot is not always a reference', () => {
  /* The letter form demands a DIGIT after the dot, which is what keeps it off
     initials and off an ordinary sentence opening with a lettered list marker. */
  is(
    analyse('U.S. Department guidance states that the supplier must hold current certification.').rows[0]
      .requirement_ref,
    null,
    'initials are not a clause number'
  );
  is(
    analyse('50 words is the ceiling and the supplier must not exceed it in any single answer.').rows[0]
      .requirement_ref,
    null,
    'a bare number with no punctuation is still not a clause number'
  );
});

group('obligations written in heavy procurement English', () => {
  const cases = [
    ['A.2.2 On no account is the Bidder permitted to utilize third-party proprietary formats.', 'on no account'],
    ['C.1.2 It is a fundamental condition of this Tender that the system achieves readiness.', 'fundamental condition'],
    ['C.1.3 Should the Bidder rely on legacy detectors, they assume full liability for calibration.', 'assume full liability'],
  ];
  for (const [line, what] of cases) {
    is(analyse(line).rows.length, 1, `detected: ${what}`);
  }
});

group('a deadline stated with by rather than a named cue', () => {
  const m = analyse('C.1.2 It is a fundamental condition that the system achieves readiness by 09:00 AM on November 15, 2026.');
  const stated = m.rows[0].deadlines.map((d) => d.text);
  ok(stated.includes('November 15, 2026'), 'the date is read');
  ok(stated.includes('09:00 AM'), 'and the time with its meridiem');

  /* `by` only opens the date search when a digit follows, and finding no date
     leaves no deadline, so an ordinary quantity cannot become one. */
  const money = analyse('The contract value increased by 20% over the prior year according to the report.');
  is(money.deadlineCount, 0, 'increased by 20% is not a deadline');
});

group('an SLA table does not become weightings', () => {
  /*
   * The table sits two lines under "during the evaluation phase", which arms the
   * evaluation context, and every row of it carries a percentage. None of them
   * is an award weighting and the tool must not add them up.
   */
  const m = analyse(`B.1.1 Bidders must adhere to the metrics below. Failure to meet any Tier 1 metric during the evaluation phase will render the proposal non-compliant.
B.1.1.i API Gateway Routing Latency 50 milliseconds 2% fee deduction
B.1.1.ii Core System Uptime Availability 99.999% 10% fee deduction
B.1.1.iii Video Stream Processing Frame Drop Rate 0.1% 5% fee deduction`);
  is(m.weightingCount, 0, 'no SLA percentage is read as an award weighting');
  is(m.weightingTotal, 0, 'and nothing is totalled');
});

group('the present tense is a KNOWN MISS, and is asserted as one', () => {
  /*
   * ── NOT A DEFECT. THIS IS HONESTY RULE 3, PINNED SO IT CANNOT DRIFT ────────
   *
   * "The NG-ITMS platform operates in an active-active configuration", "The
   * Contractor provides a finalized PID", "Cold storage archives all metadata"
   * are binding requirements drafted in the present indicative, and this engine
   * does not read them. The library header has said so since it was written,
   * with almost this example.
   *
   * IT IS NOT FIXED BECAUSE THE FIX WOULD BE A GUESS. The rule would have to be
   * "a present-tense verb is an obligation", and a tender is full of present
   * tense that obliges nobody: "The Department currently employs approximately
   * 14,500 staff across 42 regional offices", "The Authority operates fourteen
   * transit hubs". There is no feature of the sentence that separates the two
   * without understanding what is being described, and inventing one would put
   * false rows next to true quotes, which is the failure honesty rule 2 exists
   * to prevent. An extractor that can read a requirement rather than match a
   * word is the answer, and that is the product rather than this tool.
   *
   * Asserted rather than left unsaid so that anyone who "fixes" it has to delete
   * a test that explains why it is not a bug.
   */
  const m = analyse('A.1.1 The NG-ITMS platform operates in a fully active-active high availability configuration.');
  is(m.rows.length, 0, 'a present-tense requirement is not read');
  const c = analyse('C.1.1(i) The Contractor provides a finalized Project Initiation Document within fourteen days.');
  is(c.rows.length, 0, 'nor is a present-tense delivery commitment');
});

/* ══ 15. Structural stress scenarios, 2026-08-06 ═════════════════════════════ */

group('reference forms: section marks, bullets, romans and stacked parentheses', () => {
  const cases = [
    ['1.01.01(A) The Contractor shall furnish all labor and materials required.', '1.01.01(A)'],
    ['IV.2.b(iii) Prior to commissioning, the system must pass a Level 4 diagnostic.', 'IV.2.b(iii)'],
    ['§ 2.1.3 The Bidder shall submit the completed appendix with its tender response.', '2.1.3'],
    ['- 5.1.a The system must dynamically provision additional compute nodes on demand.', '5.1.a'],
    ['1.1.1(a)(iv)(A) The Bidder must provide evidence of professional indemnity cover.', '1.1.1(a)(iv)(A)'],
    ['3(a)(1) The Bidder is responsible for safe disposal of all legacy hardware assets.', '3(a)(1)'],
  ];
  for (const [line, ref] of cases) {
    const m = analyse(line);
    is(m.rows[0].requirement_ref, ref, `reference isolated: ${ref}`);
  }

  /* The bare-number form still needs its parenthesis or its punctuation, or
     "50 words is the limit" reads 50 as a clause. */
  is(
    analyse('50 words is the ceiling and the supplier must not exceed it in any answer.').rows[0]
      .requirement_ref,
    null,
    'a bare number with neither is still not a reference'
  );
});

group('a trigger separated from its verb by a long clause', () => {
  /* Simple proximity searches break on these; this engine keys on the trigger
     appearing anywhere in the segment, so the distance does not matter. */
  is(
    analyse('3.2 The Bidder is, subject to the exceptions in Schedule B, entirely responsible for licensing.').rows.length,
    1,
    'is ... responsible for, interrupted'
  );

  /* Five physical lines, one sentence, rejoined by the wrap rule because every
     continuation opens lower case. */
  const wrapped = analyse(`14.2 The Bidder shall,
for the avoidance of doubt,
following completion of all onboarding activities,
and after receiving written confirmation from the Contract Manager,
submit the Final Transition Report within five Working Days.`);
  is(wrapped.rows.length, 1, 'one requirement, not five fragments');
  is(wrapped.rows[0].requirement_ref, '14.2', 'attributed to the opening line');
  ok(wrapped.rows[0].requirement_text.includes('Final Transition Report'), 'and the action survives the joins');
});

group('prohibitions and indemnities', () => {
  is(
    analyse('5.1.c Unless prior written consent is obtained, sub-contracting is not permitted.').rows.length,
    1,
    'is not permitted, with no trailing "to"'
  );
  is(
    analyse('9.1 The Contractor indemnifies the Authority against all third-party claims.').rows.length,
    1,
    'indemnifies'
  );
});

group('a line that defines a word is not a line that uses it', () => {
  /* MEASURED 2026-08-06. The quote rule alone left these, because the words
     firing the pass-or-fail rule sit OUTSIDE the quotation marks. */
  is(
    analyse('4.1 In this section, "Contractor must" refers to mandatory pass/fail criteria.').rows.length,
    0,
    'a section defining a phrase produces no row'
  );
  is(analyse('Definition: "Must" means a mandatory requirement for this procurement.').rows.length, 0, 'a glossary entry produces no row');
  is(
    analyse('4.4 The phrase "is strictly prohibited" denotes a zero-tolerance policy here.').rows.length,
    0,
    'and so does one explaining a prohibition'
  );

  /* D-5. MEASURED 2026-08-06 in the owner's export, row 1. This defeated both
     guards: the quote rule removed "Must" so no obligation fired, and the
     definition rule missed it because its verb is "indicates", which was not in
     DEFINES. */
  is(
    analyse('0.1 Definitions: Within this document, the capitalized term "Must" indicates a mandatory pass/fail requirement.').rows.length,
    0,
    'a glossary entry using "indicates" produces no row'
  );
  is(
    analyse('0.2 The word "Shall" signifies an absolute obligation on the supplier throughout.').rows.length,
    0,
    'and one using "signifies"'
  );

  /* BOTH conditions are required. Quotes without a defining verb, and a
     defining verb without quotes, are both left alone. */
  is(
    analyse('8.1 For each item the Bidder must state "Compliant" or "Non-Compliant" in the box.').rows.length,
    1,
    'quotes alone do not suppress'
  );
  is(
    analyse('2.7 The supplier must provide evidence, which means a signed certificate of cover.').rows.length,
    1,
    'a defining verb alone does not suppress'
  );
});

group('D-3 a flattened compliance table', () => {
  /* MEASURED 2026-08-06: this produced NO rows. The references parsed; the rows
     were dropped by the bare-reference rule, which was doing its job. */
  const m = analyse(`Requirement Mandatory Evidence
A.1 YES Method Statement
Security Controls
A.1.1 MFA Enabled YES Screenshot
A.1.2 Encryption YES ISO27001 Certificate
6.1.iii | Support | Helpdesk availability | 24/7/365 | N/A`);
  is(m.rows.length, 4, 'every row of the table earns a row');
  is(m.tableCount, 4, 'tableCount agrees');
  ok(m.rows.every((r) => r.signals.includes('table')), 'each carries the table signal');
  ok(!hasRow(m, 'Security Controls'), 'a section title does not');
  ok(!hasRow(m, 'Requirement Mandatory Evidence'), 'and neither does the header row');

  /* All three tests are required, and this is the one that carries the load:
     a sentence that happens to contain an upper case NO closes with a full
     stop, and a table row does not. */
  const prose = analyse('4.2 NO changes will be permitted after the published deadline has passed.');
  is(prose.rows.length, 0, 'a sentence containing NO is not a table row');

  /* Lower case is prose. Upper case is a cell. That is the whole discriminator. */
  const lower = analyse('A.4 Encryption yes Screenshot of the configuration screen');
  is(lower.rows.length, 0, 'a lower case token does not make a table row');

  /* The reference is required, or every header row in the pack becomes a row. */
  const unnumbered = analyse('Encryption YES ISO27001 Certificate attached at Appendix B');
  is(unnumbered.rows.length, 0, 'a cell run with no reference earns nothing');
});

group('D-1 who the line is about', () => {
  /* MEASURED 2026-08-06, rows 4 and 5 of the owner's export: both are real
     obligations and neither is the bidder's. */
  const cases = [
    ['2.1 The Buyer shall provide building access no later than Day 5 of mobilization.', 'Buyer'],
    ['2.2 The Sub-contractor must maintain site fencing and perimeter security at all times.', 'Sub-contractor'],
    ['2.3 The Bidder shall submit monthly performance reports to the contract manager.', 'Bidder'],
    ['2.4 Tenderers must read this document in full before submitting any response.', 'Tenderer'],
    ['2.5 The Authority is required to publish the award notice within thirty days.', 'Authority'],
  ];
  for (const [line, subject] of cases) {
    is(analyse(line).rows[0].subject, subject, `subject read: ${subject}`);
  }

  /* THE ROW IS NEVER DROPPED. A buyer obligation is a dependency a bidder may
     need to price or query; hiding it would be a worse failure than showing it
     without a subject. */
  const m = analyse('2.1 The Buyer shall provide building access no later than Day 5 of mobilization.');
  is(m.rows.length, 1, 'a buyer obligation still earns its row');
  ok(m.rows[0].signals.includes('obligation'), 'and is still an obligation');

  /* Null means "does not open with a party", never "this one is yours". */
  is(
    analyse('2.6 All deployed security personnel shall possess a valid SIA licence.').rows[0].subject,
    null,
    'a non-party opening carries no subject'
  );
  is(
    analyse('2.7 If a Security Incident occurs, unless the Authority confirms otherwise, the Bidder must not disclose it.').rows[0]
      .subject,
    null,
    'and neither does a sentence opening with a condition, which has three candidates'
  );
});

group('D-1 the subject travels into both exports', () => {
  const m = analyse('2.1 The Buyer shall provide building access no later than Day 5 of mobilization.');
  const csv = buildCsv(m);
  ok(csv.split('\r\n')[0].includes('Stated subject'), 'CSV carries the column');
  ok(csv.includes('"Buyer"'), 'and the value');
  const md = buildMarkdown(m);
  ok(md.split('\n')[0].includes('Subject'), 'Markdown carries the column');
  ok(md.split('\n')[2].includes('Buyer'), 'and the value');
});

/* ══ Result ══════════════════════════════════════════════════════════════════ */

console.log(`\ntender-matrix: ${checks} checks, ${failures} failed\n`);
process.exit(failures === 0 ? 0 : 1);
