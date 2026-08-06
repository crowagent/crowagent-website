/**
 * ── THE PPN 002 LIBRARY THIS FILE KEEPS CITING NO LONGER HOLDS THE CODE ────
 *
 * Six comments below reason from "the PPN 002 calculator library" - its shape,
 * its `{ field, message }` return, its `problems()` and `calculate()` pair, its
 * en-GB formatting. Every one of those was DELETED on 2026-08-05 under A-101,
 * when the owner removed the PPN 002 calculator: nine exports went and
 * `lib/ppn002.ts` now holds exactly one, `MISSIONS`, which /sources renders.
 *
 * THE REASONING IS KEPT AND THE POINTERS ARE NOT, which is the honest split.
 * Why validation is its own exported function, why nothing here returns a
 * verdict, why a valid paste matching nothing is not null - all of that is
 * still the argument for how THIS file is built, and it does not stop being
 * true because the file it was learned from was deleted. What would be false
 * is inviting a reader to go and read it: there is nothing there now.
 *
 * The deleted arithmetic, and the two unit bugs found in it, are recorded in
 * specs/architecture/CONTENT-ARCHITECTURE.md section 4. That is where to look,
 * not at the module.
 */
/**
 * tender-matrix.ts — the tender compliance matrix rule engine, as pure functions.
 *
 * WHY THIS IS A LIBRARY AND NOT A SCRIPT INSIDE THE PAGE. Same argument as
 * the PPN 002 calculator library, one object along: the page renders, the library decides. A
 * detection rule that lives inside a `<script>` block cannot be read on its own,
 * cannot be driven with a fixture, and grows a second copy the first time
 * anything else needs it. Everything below is DOM-free and Astro-free on
 * purpose, so the only thing a page can do with it is call it.
 *
 * WHAT IT IS. Pasted tender text in, a matrix of the requirements the text
 * STATES out, each row carrying the verbatim segment it was read from. No
 * model, no network, no server, no account. Every row is produced by a rule
 * written in this file and traces back to the characters that triggered it.
 *
 * ── THREE HONESTY RULES, AND THEY ARE THE DESIGN ────────────────────────────
 *
 * 1. IT MUST NEVER ASSERT COMPLIANCE. Whether a bid or a procurement is
 *    compliant is a judgement for the bidder and the contracting authority.
 *    This reports what the rules matched and stops. It is the same rule already
 *    written into `lib/ppn002.ts`, and it is why nothing here returns a verdict,
 *    a pass, a score or a percentage of readiness.
 *
 *    THIS ONE POINTER IS STILL LIVE, unlike the five historical mentions the
 *    note at the head of this file covers. The rule it cites - "NOTHING BUILT ON
 *    THESE FACTS MAY ASSERT COMPLIANCE" - is in that file's surviving header,
 *    along with the reason: the wording it replaced put "Compliant:" in a green
 *    badge directly above small print reading "not legal or procurement advice",
 *    contradicting itself on screen. A-101 deleted the arithmetic and kept the
 *    facts, so go and read it.
 *
 * 2. IT NEVER PARAPHRASES AND NEVER INFERS. `requirement_text` is the detected
 *    segment with its leading reference removed. `source_quote` is that segment
 *    verbatim. An AI extractor would restate a requirement in a normalised form
 *    and would read better for it; a rule engine that did the same would be
 *    inventing, because it has no understanding to restate FROM. If a figure
 *    cannot be located in the input, the row does not carry one.
 *
 * 3. IT WILL MISS THINGS, AND THE PAGE HAS TO SAY SO. A rule keyed on the word
 *    "must" cannot see a requirement written as "the successful supplier
 *    provides monthly reporting". Silence from this engine is not evidence of
 *    absence, and the page states that in those terms.
 *
 * ── THE DATA SHAPE IS THE PRODUCT'S, DELIBERATELY ───────────────────────────
 *
 * `RequirementCategory`, `MatrixRequirement`, `ExportRow` and
 * `ComplianceMatrixSummary` below are the CrowMark RFP suite's own wire types,
 * copied field for field from
 * crowagent-platform/web/src/features/crowmark/rfp/types.ts (219 lines, no
 * dependencies). They are restated rather than imported because that file is in
 * a different repository and this site has no build-time route to it.
 *
 * The point of restating them exactly is that the upgrade path from this free
 * tool to the product is an import rather than a translation: a row this engine
 * emits is assignable to an `ExportRow` the platform's exporter already
 * understands. If those types move, this file moves with them, and that cost is
 * the price of not inventing a second vocabulary for one object.
 *
 * WHAT IS DELIBERATELY LEFT NULL, because a browser reading pasted text cannot
 * honestly fill it:
 *
 *   source_page            pasted text has no pages
 *   extraction_confidence  a rule either matched or it did not; there is no
 *                          probability to report, and inventing one would put a
 *                          number of unknown provenance beside a real quote
 *   compliance             the visitor has answered nothing yet
 *
 * `status` is `'suggested'`, which the platform documents as unconfirmed and
 * machine-proposed. That is what these rows are. It does NOT mean AI-extracted
 * here, and nothing on the page says it does.
 *
 * ── EVERY USER-FACING SENTENCE LIVES IN THE PAGE, NOT HERE ──────────────────
 *
 * This file returns numbers, rows and problem messages, and nothing else. The
 * result copy is written in the markup of
 * pages/tools/tender-compliance-matrix/index.astro and revealed by toggling
 * `hidden`, for the reason recorded there: scripts/check-budgets.js caps ALL
 * JavaScript in the build at 15 KB and the site had 3,129 B of that left. Copy
 * held in a script is paid for in the tightest budget on the site and is
 * invisible to a reader with no JavaScript; the same copy in the markup is paid
 * for in the per-route HTML budget, which had 55 KB spare on this route.
 */

/* ── The platform's vocabulary, restated ─────────────────────────────────── */

export type RequirementCategory =
  | 'mandatory'
  | 'quality'
  | 'social_value'
  | 'commercial'
  | 'compliance'
  | 'other';

export type RequirementStatus = 'suggested' | 'confirmed' | 'edited' | 'rejected' | 'manual';

export type ResponseStatus = 'not_started' | 'draft' | 'covered' | 'gap';

/** One requirement's summary, as it appears inside a compliance-matrix row. */
export interface MatrixRequirement {
  id: string;
  requirement_ref: string | null;
  requirement_text: string;
  category: RequirementCategory;
  weight: number | null;
  status: RequirementStatus;
  source_page: number | null;
}

/** One row of the structured export: a requirement plus its tracking. */
export interface ExportRow extends MatrixRequirement {
  source_quote: string | null;
  extraction_confidence: number | null;
  compliance: {
    response_status?: ResponseStatus;
    owner?: string | null;
    linked_answer_id?: string | null;
    notes?: string | null;
  } | null;
}

export interface ComplianceMatrixSummary {
  total: number;
  not_started: number;
  draft: number;
  covered: number;
  gap: number;
}

/* ── This tool's own additions ───────────────────────────────────────────── */

/**
 * Which rule fired. LOCAL to this tool: the product has no equivalent field,
 * because an extractor that reads a whole document does not have four separate
 * reasons for proposing a row. Here the reason is the only evidence a reader has
 * that the row is not a guess, so it is shown.
 */
export type SignalKind =
  | 'obligation'
  | 'directive'
  | 'mandatory'
  | 'deadline'
  | 'reference'
  | 'limit'
  | 'weighting';

/** A response limit stated in the text: 500 words, 4 pages, 2 sides. */
export interface DetectedLimit {
  value: number;
  unit: string;
  /** The verbatim fragment the value was read from. */
  quote: string;
}

/**
 * A closing date or time stated in the text. The fragment is verbatim and is
 * never resolved into a `Date`: see the note above DEADLINE_CUE.
 */
export interface DetectedDeadline {
  text: string;
}

/**
 * A matrix row. Extends the product's `ExportRow`, so it is assignable to one,
 * and adds the two things a reader of a FREE tool needs that a signed-in product
 * user does not: which rule proposed the row, and where in their own pasted text
 * it came from.
 */
export interface MatrixRow extends ExportRow {
  signals: SignalKind[];
  /** 1-based line number in the pasted text. */
  source_line: number;
  /** Limits stated on this segment. Empty for most rows. */
  limits: DetectedLimit[];
  /** Closing dates or times stated on this segment. Empty for most rows. */
  deadlines: DetectedDeadline[];
}

export interface TenderMatrix {
  rows: MatrixRow[];
  summary: ComplianceMatrixSummary;
  /** Non-empty lines read. */
  lines: number;
  obligationCount: number;
  /** Rows proposed by an imperative in a numbered question schedule. */
  directiveCount: number;
  /** Rows whose wording marks them pass or fail. */
  mandatoryCount: number;
  /** Rows carrying a stated closing date or time. */
  deadlineCount: number;
  referenceCount: number;
  limitCount: number;
  weightingCount: number;
  /**
   * The arithmetic sum of every percentage found on a line that also reads as
   * evaluation criteria. It is NOT a claim that a set of weightings is complete,
   * correct or lawful: a pack listing sub-criteria as well as top-level criteria
   * sums to well over 100, and that is normal.
   */
  weightingTotal: number;
  /**
   * Indicates context for weightings found:
   * 'complete': weightings sum to ~100% (95%-105%)
   * 'sub_criteria': weightings present but sum outside 95%-105% (e.g. sub-criteria)
   * 'no_context_found': percentages exist in text but outside evaluation context
   * 'none': no percentages detected
   */
  weightingConfidence: 'complete' | 'sub_criteria' | 'no_context_found' | 'none';
  /** True when more requirements were detected than `MAX_ROWS` allows. */
  truncated: boolean;
  /** How many rows were dropped as exact duplicates of an earlier one. */
  duplicates: number;
}


/* ── Limits on the input, stated once ────────────────────────────────────── */

/** Below this a paste is not tender text, it is a phrase. */
export const MIN_CHARS = 40;

/**
 * Roughly a 30,000 word pack, which is a large ITT. The ceiling exists so that
 * pasting a whole document set cannot lock the tab up: every rule below is
 * linear in the input, but a browser doing linear work on ten megabytes still
 * stops answering the pointer.
 */
export const MAX_CHARS = 200000;

/**
 * A cap on ROWS, not on detection. Everything is still counted, `summary.total`
 * still reports the true number, and `truncated` says the list is short. A
 * silent cap would be the one thing this file is written not to do.
 */
export const MAX_ROWS = 300;

/**
 * A segment longer than this is read sentence by sentence rather than whole.
 *
 * WHY IT EXISTS. Text copied out of a PDF arrives with hard line breaks and
 * segments naturally. Text copied out of a browser or a word processor can
 * arrive as one paragraph per line, or as a single line holding a whole
 * document. Without this, a one-line paste produces at most one row and the tool
 * looks broken on exactly the input a first-time visitor is most likely to give
 * it. A sentence taken from a long line is still verbatim text from the input,
 * so honesty rule 2 above is intact.
 */
const LONG = 320;

/* ── The rules ───────────────────────────────────────────────────────────── */

/**
 * Obligation language: the four forms named in the spec, the plurals of the
 * third, and the six contractual forms added on 2026-08-06.
 *
 * `must not` and `shall not` are covered by the same alternatives. A prohibition
 * is an obligation, and dropping the negative would report the opposite of what
 * the document says.
 *
 * EVERY PERSON-VARYING FORM TAKES `(?:is|are)`, AND THAT IS NOT TIDINESS. A pack
 * written about "the supplier" and a pack written about "suppliers" are the same
 * pack; a rule that reads one and not the other reports a document as silent
 * because of its house style. `is responsible for` shipped without its plural on
 * 2026-08-06 and missed "Suppliers are responsible for..." entirely, which was
 * measured, not supposed.
 *
 * `\s+` RATHER THAN `\s` THROUGHOUT, FOR THE SAME REASON THE TOOL EXISTS. Its
 * input is pasted text, and text pasted out of a PDF arrives with the spacing
 * the PDF had: doubled spaces where a line was justified, and a newline wherever
 * the column ended. `is  required  to` is the same obligation as `is required
 * to`, and a single `\s` reads the first as prose.
 */
const OBLIGATION =
  /\b(?:must|shall|(?:is|are|will\s+be)\s+(?:required|expected|obliged)\s+to|will\s+be\s+(?:required|expected)|undertakes?\s+to|agrees?\s+to|warrants?\s+that|responsible\s+for|(?:is|are)\s+not\s+permitted(?:\s+to)?|(?:is|are)\s+prohibited(?:\s+from)?|indemnif(?:y|ies|ied)|on\s+no\s+account|it\s+is\s+a\s+(?:fundamental\s+)?condition|assumes?\s+(?:full\s+)?(?:liability|responsibility))\b/i;

/**
 * ── USE AND MENTION, WHICH IS THE ONE DISTINCTION A KEYWORD RULE CANNOT SEE ──
 *
 * MEASURED 2026-08-06 on a facilities management RFP whose Part 1 was a glossary:
 *
 *   1.2 The term "Contractor" refers to the successful Bidder. The phrase "the
 *       Contractor shall be responsible for" carries the same legal weight as
 *       "the Contractor must".
 *
 * Three obligation triggers, none of them an obligation. The document is NAMING
 * those phrases, not using them, and a definitions section does that on purpose.
 * The tool returned the line as a requirement, which is a row a bid team would
 * have to read and discard.
 *
 * THE RULE IS THE GRAMMATICAL ONE. A trigger that appears ONLY inside quotation
 * marks is a mention; the line is about the phrase. A trigger that appears
 * outside them is a use, and the line states a requirement. So the trigger tests
 * run against the segment with quoted spans removed, and a line whose only
 * trigger was quoted no longer fires.
 *
 * IT IS NOT "IGNORE ANYTHING NEAR A QUOTE", and the difference is the whole
 * reason this is safe. In the same family of documents:
 *
 *   8.1 For each item, the Bidder must state "Compliant", "Partially Compliant",
 *       or "Non-Compliant".
 *
 * is a genuine obligation carrying three quoted strings, and `must` is outside
 * every one of them, so it is untouched. A rule that suppressed on the PRESENCE
 * of quotes would drop it.
 *
 * DOUBLE QUOTES ONLY, straight and curly. A single quote in tender English is an
 * apostrophe far more often than a quotation mark: "the Bidder's response must
 * ..." would lose its trigger to a rule that treated `'` as an opening quote.
 *
 * VALUES ARE NOT STRIPPED, only triggers. A limit, a date and a percentage are
 * facts, and a figure inside quotation marks is still a figure the document
 * contains: `a response of "no more than 500 words"` states a real limit. The
 * mention problem is specific to words that make a line into a requirement.
 */
const QUOTED = /"[^"]*"|“[^”]*”/g;

/** The same pattern without /g, so `.test` has no lastIndex to carry. */
const HAS_QUOTE = /"[^"]*"|“[^”]*”/;

/**
 * ── A LINE THAT DEFINES A WORD IS NOT A LINE THAT USES IT ───────────────────
 *
 * The quote rule above stops `the phrase "must comply"` being read as an
 * obligation, and leaves a residue it cannot reach. MEASURED 2026-08-06:
 *
 *   4.1 In this section, "Contractor must" refers to mandatory pass/fail
 *       criteria.
 *   Definition: "Must" means a mandatory requirement.
 *
 * Both still produced a row, because the words that fire the PASS OR FAIL rule
 * are outside the quotation marks. The line is a glossary entry describing what
 * a word means, and "mandatory" appearing in that description is the definition,
 * not a requirement.
 *
 * BOTH CONDITIONS ARE REQUIRED, and that is what makes it safe: a quoted span
 * AND a defining verb. `the Bidder must state "Compliant"` has quotes and no
 * defining verb; `the supplier must provide evidence, which means a signed
 * certificate` has a defining verb and no quotes. Neither is touched.
 *
 * IT SUPPRESSES ONLY THE PASS OR FAIL SIGNAL. Obligations and directives are
 * already handled by the narrower quote rule, and leaving them to it means a
 * line carrying a genuine trigger OUTSIDE its quotes keeps its row even if it
 * also happens to define something.
 */
const DEFINES =
  /\b(?:means|refers?\s+to|denotes?|is\s+defined\s+as|shall\s+mean|the\s+(?:phrase|term|word|expression)|definition)\b/i;

function unquoted(text: string): string {
  return text.replace(QUOTED, ' ');
}

/**
 * ── A QUESTION SCHEDULE IS A COMPLIANCE MATRIX, AND THE FIRST BUILD READ NONE
 *    OF IT ─────────────────────────────────────────────────────────────────────
 *
 * MEASURED on 2026-08-06 against the 24-item ITT extract in
 * scripts/test-tender-matrix.mjs: the engine returned 21 rows. The three it
 * dropped were `Q4 Provide evidence of public liability insurance...`,
 * `SQ1 Confirm the organisation's registered company number...` and
 * `3.6 Demonstrate how you will meet the requirement for 24/7 emergency
 * response.` Each is a numbered question a bidder must answer, and each was
 * silently absent from a matrix whose entire job is to list them.
 *
 * They were dropped because none contains "must" or "shall". A tender does not
 * write "the bidder must provide evidence" inside a question schedule; it writes
 * "Q4 Provide evidence", because the schedule's own numbering already carries
 * the obligation. Keying only on modal verbs reads the instructions to tenderers
 * and skips the questions being asked, which is the wrong half of the document.
 *
 * WHY THIS IS NOT THE INFERENCE HONESTY RULE 2 FORBIDS. "Provide evidence of
 * public liability insurance" is an imperative sentence. The document is issuing
 * an instruction in the grammatical mood reserved for issuing instructions; the
 * rule reads the mood, it does not guess the intent. Nothing is restated, and
 * `requirement_text` remains the segment verbatim. The row is marked with its
 * own `directive` signal rather than folded into `obligation`, so a reader can
 * see which rule proposed it and discount it if they disagree.
 *
 * A LEADING REFERENCE IS REQUIRED, AND IT IS THE WHOLE GUARD. `Q4`, `SQ1` and
 * `3.6` are the evidence that the imperative is a schedule item rather than
 * prose. Without that guard the rule fires on any sentence opening with one of
 * these verbs, and narrative text in an ITT opens that way often enough
 * ("Provide details are set out in Appendix A") to fill the matrix with lines
 * nobody has to answer. Requiring both means the rule misses an unnumbered
 * question list, and it does: that is honesty rule 3 working as written, and it
 * is the correct side to fail on for a tool whose claim is that every row traces
 * to something the document states.
 */
const DIRECTIVE =
  /^(?:please\s+)?(?:provide|describe|demonstrate|confirm|submit|detail|explain|outline|state|list|set\s+out|give|supply|upload|attach|include|identify|specify|evidence|complete|summarise|summarize)\b/i;


/**
 * A leading question or clause reference, in the three shapes a tender pack
 * uses: `Q1` and `SQ1.3`, `1.1` and `4.2.3`, and `1.` or `12)`.
 *
 * THE GUARDS ARE THE INTERESTING PART. The dotted form caps its first component
 * at two digits so a figure written `2025.10` cannot be read as clause 2025.10.
 * The plain form caps at three digits and REQUIRES punctuation after the number,
 * so a line opening "500 words" is not a reference to clause 500.
 *
 * ── LETTERED AND ROMAN SUB-CLAUSES, ADDED 2026-08-06 ────────────────────────
 *
 * MEASURED against a 45-clause ERP tender: `3.4.a Font must be Times New Roman`,
 * `5.2.b If a cloud-based solution is proposed`, `6.1.a The Bidder must hold a
 * valid ISO 27001 certification` all produced a row with NO reference, and the
 * clause number stayed jammed on the front of the requirement text. The dotted
 * form required every component to be digits, so it matched `3.4`, then asked
 * for whitespace and found `.a`, and gave up.
 *
 * Up to TWO trailing alphabetic components, which is what covers `3.4.a` and the
 * deepest form these packs use, `3.2.1.b.iv`. Roman numerals need no rule of
 * their own: `iv` is letters, and asking whether it is a numeral rather than a
 * label is a question the reference does not need answered to be reported.
 *
 * FOUR LETTERS RATHER THAN ONE, because `iii` and `viii` exist. The cost is that
 * a segment opening `3.4.and the supplier must...` would read `3.4.and` as a
 * reference. That needs a clause number, a full stop, no space and a short word,
 * and the body test below still has to pass; it has not appeared in any pack
 * measured, and the alternative is dropping every roman numeral sub-clause.
 */
const REFS = [
  /* `Q1`, `SQ1.3`, `A2.1`. A question-schedule prefix with no dot after it. */
  /^((?:SQ|Q|A)\s?\d{1,3}(?:\.\d{1,3})*(?:\.[a-z]{1,4}){0,2})\s*[.):\]]?\s+/i,
  /*
   * ── PART-LETTERED CLAUSES: `A.1.1`, `B.1.1.ii`, `C.1.1(i)` ─────────────────
   *
   * MEASURED 2026-08-06 on a traffic-management RFT numbered by part rather than
   * by section. NOT ONE of its seventeen clauses produced a reference: every row
   * carried its clause number jammed on the front of the requirement text, and
   * the reference column was empty down the whole matrix. The prefix rule above
   * expects `A2.1` with no dot, and the numeric rule below expects the line to
   * open with a digit, so `A.1.1` fell between them.
   *
   * THE LETTER MUST BE FOLLOWED BY A DOT AND THEN A DIGIT, which is what keeps
   * this off ordinary prose. `U.S. Department` fails because `S` is not a digit;
   * `A. The supplier must` fails for the same reason. A single capital, a dot and
   * a number is a clause number in a tender and very little else.
   */
  /^[-–•*\s]*(?:§\s*)?([A-Z]{1,4}\.\d{1,2}(?:\.(?:\d{1,3}|[a-z]{1,4})){0,4}(?:\([a-z0-9]{1,5}\))*)\s*[.):\]]?\s+/,
  /*
   * The all-numeric form, now also reading a parenthesised final component:
   * `1.3(a)` and `4.2.1(iv)` alongside `3.4.a`. Brackets are how half of UK
   * public procurement writes a sub-clause and the other half writes it with a
   * dot; both are the document's own reference either way.
   */
  /^[-–•*\s]*(?:§\s*)?(\d{1,2}(?:\.\d{1,3})+(?:\.[a-z]{1,4}){0,2}(?:\([a-z0-9]{1,5}\))*)\s*[.):\]]?\s+/i,
  /*
   * A bare number followed by AT LEAST ONE parenthesis: `§8(c)`, `3(a)(1)`.
   * The parenthesis is required, because without it this would read `50` in
   * "50 words is the limit" as clause 50, which is the fault the rule below
   * exists to prevent.
   */
  /^[-–•*\s]*(?:§\s*)?(\d{1,3}(?:\([a-z0-9]{1,5}\))+)\s*[.):\]]?\s+/i,
  /*
   * A bare number, which REQUIRES punctuation after it. Without that guard a
   * line opening `50 words is the limit` reads 50 as clause 50.
   */
  /^(\d{1,3})\s*[.):\]]\s+/,
];

/** A reference with nothing after it is a contents entry, not a requirement. */
const MIN_BODY = 12;

/**
 * Response limits, in the two patterns that cover the three ways a pack writes
 * them: "no more than 500 words" and "maximum of 4 pages"; "500 word limit",
 * "4-page maximum" and "1,000 characters or fewer".
 */
const UNIT = '(word|page|character|side)';
const LIMITS = [
  new RegExp(
    String.raw`\b(?:no\smore\sthan|not\s(?:to\s)?exceed(?:ing)?|maximum(?:\sof)?|max\.?(?:\sof)?|up\sto|limited\sto|no\slonger\sthan)\s(\d[\d,]*)\s*${UNIT}s?\b`,
    'gi'
  ),
  new RegExp(
    String.raw`\b(\d[\d,]*)[\s-]*${UNIT}s?\s(?:limit|maximum|max\.?|or\sfewer|or\sless)\b`,
    'gi'
  ),
];

/**
 * ── A DEADLINE IS THE ONE REQUIREMENT THAT CANNOT BE ANSWERED LATE ──────────
 *
 * Every other row in this matrix describes something a bidder can still fix on
 * the last afternoon. A closing date cannot be fixed at all, and it is stated
 * once, in a sentence that frequently carries no obligation word: "Tenders must
 * be received by 12:00 noon on 14 March 2026" has one, "Deadline for
 * clarification questions: 5pm, 3 February" has none and was invisible to every
 * rule in this file.
 *
 * THE CUE IS REQUIRED AND IT IS THE WHOLE GUARD, for the same reason the
 * directive rule requires a reference. A tender pack is full of dates: a
 * contract start, a mobilisation milestone, a reporting period, a framework
 * expiry. Reading every date as a deadline would fill the matrix with dates
 * nobody has to act on and bury the one that matters. A date earns a row only on
 * a line that also says it is a closing point.
 *
 * NOTHING IS PARSED INTO A `Date`, DELIBERATELY. "3 February" has no year in the
 * document and this file will not choose one; "14/03/2026" is unambiguous to a
 * UK reader and would be 3 April to an American parser. The row carries the
 * fragment as written and lets the reader read it, which is the same rule
 * `requirement_text` follows. A tool that silently resolved a date and got the
 * year wrong would be worse than one that did not try.
 */
const DEADLINE_CUE =
  /\b(?:deadline|closing\s+(?:date|time)|submission\s+(?:date|time)|must\s+be\s+(?:received|submitted|returned|uploaded)|no[t]?\s+later\s+than|due\s+(?:by|on)|returned?\s+by|submitted\s+by|expires?\s+(?:at|on)|cut[\s-]?off|on\s+or\s+before|(?:by|before|from)\s+(?=\d))\b/i;

/**
 * Dates and times as a tender writes them. Long month names precede their
 * abbreviations in the alternation, because a regex alternation is first-match
 * and `Jan` placed first would take the first three letters of `January`.
 */
const MONTH =
  '(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)';

const WHEN = [
  /* `14 March 2026`, `3rd February`. The form a UK pack writes. */
  new RegExp(String.raw`\b\d{1,2}(?:st|nd|rd|th)?\s+${MONTH}\.?(?:\s+\d{4})?\b`, 'gi'),
  /*
   * `September 30, 2026`. The month-first form, added 2026-08-06 after a test
   * pack written that way had its closing DATE dropped while its closing TIME
   * was read: the row said 14:00 and did not say which day, which is a worse
   * answer than saying nothing.
   */
  new RegExp(String.raw`\b${MONTH}\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}\b`, 'gi'),
  /* `2026-03-14`, `14/03/2026`. */
  /\b(?:\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/g,
  /* `14:00:00`, `12:00`, `5pm`, `noon`. Seconds are kept when written. */
  /\b(?:\d{1,2}[:.]\d{2}(?::\d{2})?\s*(?:am|pm|hrs|hours)?|\d{1,2}\s*(?:am|pm)|noon|midday|midnight)\b/gi,
];

/**
 * ── PASS OR FAIL, WHICH IS THE ROW A BIDDER READS FIRST ─────────────────────
 *
 * A compliance matrix has two kinds of row: the ones that lose you marks and the
 * ones that end the bid. Tender packs mark the second kind in plain words, and
 * those words are literal text on the page: "This is a pass/fail requirement",
 * "Failure to provide will result in your bid being rejected", "a minimum
 * requirement", "grounds for exclusion". The rule reads the marker, it does not
 * judge severity, and it does not decide that any other row is safe.
 *
 * NO `.*` IN ANY ALTERNATIVE. An unbounded gap between two required words is how
 * a regex over attacker-supplied text becomes a frozen tab, and every branch
 * here matches a contiguous phrase for that reason.
 */
const MANDATORY =
  /\b(?:pass\s*\/\s*fail|pass\s+or\s+fail|mandatory\s+requirement|(?:is|are)\s+mandatory|minimum\s+requirement|fails?\s+to\s+(?:comply|provide|submit|meet|respond)|failure\s+to\s+(?:comply|provide|submit|meet|respond)|will\s+(?:be\s+(?:rejected|excluded|disqualified)|not\s+be\s+accepted|not\s+proceed)|result\s+in\s+(?:immediate\s+)?(?:disqualification|exclusion|rejection)|deemed\s+non[\s-]?compliant|shall\s+be\s+excluded|grounds\s+for\s+(?:immediate\s+)?exclusion|strictly\s+prohibited|immediately\s+disqualified)\b/i;

/** Percentages, written either way a tender writes them. */
const PERCENT = /(\d{1,3}(?:\.\d+)?)\s*(?:%|per\s?cent)/gi;

/**
 * A percentage is only read as a WEIGHTING in an evaluation CONTEXT. Without
 * this guard the engine reports a payment term, a contract uplift and a
 * recycled-content target as weightings, and the total it prints is meaningless.
 */
const EVALUATION = /\b(?:weight|evaluat|scor|criteri|marks?|award)\w*/i;

/**
 * HOW FAR THE CONTEXT REACHES, AND WHY IT HAS TO REACH AT ALL.
 *
 * MEASURED against a real ITT extract on 2026-08-04, before this existed. A
 * tender does not write "Quality weighting 60%" on one line. It writes a
 * heading, then a sentence, then the numbers:
 *
 *     Section 4 - Award Criteria
 *     The contract will be awarded on the basis of the most advantageous tender.
 *     Quality 60%, Price 30%, Social Value 10%.
 *
 * A rule that requires the evaluation word and the percentage on the SAME
 * segment reports zero weightings on that, which is the single most important
 * thing on the page it was reading. The first build did exactly that.
 *
 * THREE SEGMENTS, NOT MORE. It is the distance between a criteria heading and
 * the table under it, and no further: a percentage six lines below an award
 * clause is as likely to be a payment term. The context is re-armed by every
 * segment that matches, so a genuine criteria table of any length stays inside
 * it while a single stray mention does not carry down a page.
 */
const EVAL_REACH = 3;

/**
 * ── CONTEXT IS NECESSARY AND WAS NOT SUFFICIENT ─────────────────────────────
 *
 * MEASURED on 2026-08-06. Given an award criteria heading followed by
 * `Quality 60%`, `Price 40%` and then five ordinary contract clauses, the engine
 * reported SIX weightings totalling 130%: the 2% early settlement discount, the
 * 20% VAT rate, the 5% CPI uplift and the 3% retention were each counted as
 * award criteria. The document states two weightings and they sum to 100.
 *
 * THE CAUSE WAS AN UNCONDITIONAL RE-ARM. A version of this file re-armed the
 * context on any segment carrying a percentage, so a document with a percentage
 * every three lines held evaluation context open indefinitely, and every payment
 * term inside it became a weighting. That re-arm was added to fix a real bug in
 * the opposite direction (the last row of a three-row criteria table fell one
 * segment outside the reach and was dropped) and it fixed it by removing the
 * guard rather than by correcting the arithmetic. Both faults are the same
 * mistake: treating proximity to the word "award" as proof.
 *
 * SO PROXIMITY IS NOW NECESSARY AND NOT SUFFICIENT. A percentage is read as a
 * weighting when it is inside the context AND the segment carrying it either
 * READS AS A CRITERIA ROW or carries evaluation language of its own. That is a
 * statement about the shape of the line, which is a fact about the document,
 * rather than a judgement about what the number means.
 *
 * WHAT A CRITERIA ROW LOOKS LIKE, AND WHY THE SHAPE IS THE EVIDENCE. A criteria
 * table row is a label and a number: `Quality 60%`, `Technical Quality 60%`,
 * `Methodology and approach 30%`, and the one-line form `Quality 60%, Price 30%,
 * Social Value 10%.` The percentage is the END of the statement, because the
 * statement is nothing but the pairing. A payment term is a SENTENCE, and its
 * percentage sits in the middle of it with a predicate after: "Retention of 3%
 * is held until practical completion." Requiring the percentage to close the
 * segment separates the two on every case measured, and it separates them on
 * something the reader can see for themselves rather than on a word list.
 *
 * THE SECOND CLAUSE CATCHES THE PROSE WEIGHTING. "Quality will be weighted at
 * 60%" and "the quality criterion carries 60% of the marks" are weightings
 * written as sentences, and they say so in the segment itself. Those are read by
 * `EVALUATION` on the line rather than by shape, which is why the two clauses
 * are an OR and not a tightening of one rule.
 */
const CRITERIA_ROW = [
  /*
   * ONE OR MORE `label 60%` PAIRS, WHICH IS WHAT A CRITERIA TABLE ROW IS:
   * `Quality 60%`, `Technical Quality 60%`, `Methodology and approach 30%`, and
   * the one-line form `Quality 60%, Price 30%, Social Value 10%.`
   *
   * THE LABEL IS CAPPED AT 40 CHARACTERS AND MAY NOT CONTAIN SENTENCE
   * PUNCTUATION, and that cap is the whole rule.
   *
   * MEASURED 2026-08-06, by the sample extract on the page catching it. An
   * earlier version of this asked only that the percentage CLOSE the segment,
   * and "Payment terms allow a 2% early settlement discount and VAT is charged
   * at 20%." closes on a percentage while being nothing but prose. It was
   * counted as two award criteria and took the sample's weighting total to 122%.
   * Read as PAIRS it fails, because the second pair's label would have to be
   * "early settlement discount and VAT is charged at", 47 characters of prose.
   * The first version of this guard fixed the case where a percentage sat NEAR
   * an award heading and missed the case where prose merely ended in one.
   *
   * Every repetition must consume a literal `%` or `per cent`, so the group can
   * never match empty and the repetition has no ambiguous backtracking to do.
   */
  /^(?:\s*[^,;.!?%]{0,40}?\s*\d{1,3}(?:\.\d+)?\s*(?:%|per\s?cent)\s*[,;]?)+\s*\.?$/i,
  /* The same pairing written the other way round: `60% Quality`. */
  /^\s*\d{1,3}(?:\.\d+)?\s*(?:%|per\s?cent)\s*[-:]?\s*[^.!?%]{0,40}$/i,
];

/**
 * The longest a criteria row can be before it is prose by definition.
 *
 * IT IS A COST GUARD AS WELL AS A RULE. Both CRITERIA_ROW patterns carry a
 * bounded `{0,80}` quantifier, so on a long line that never matches, the engine
 * tries every expansion before giving up. MEASURED 2026-08-06 on the adversarial
 * input in scripts/test-tender-matrix.mjs, 2,300 lines of 83 characters each
 * ending in a percentage: 777 ms at the 200,000 character ceiling, against 104
 * ms for a realistic ITT of the same size. Bounded and linear rather than
 * catastrophic, so it was never a ReDoS, but it is the slowest thing a visitor
 * can make this tool do and the fix is a length comparison.
 */
  /*
   * ── THE BRACKETED FORM, AND WHY IT GETS A LONGER LABEL ─────────────────────
   *
   * `Technical Merit (60%)`, and the run a pack writes when a criteria table is
   * pasted as one line: `Technical Architecture & Security (35%) 7.1.2
   * Implementation Methodology & Change Management (25%) 7.1.3 Usability and
   * Accessibility (10%) 7.1.4 Total Cost of Ownership (30%)`.
   *
   * MEASURED 2026-08-06 on a 45-clause ERP tender: those four weightings, which
   * sum to 100 and ARE the award criteria, were reported as none at all. The
   * bare-pair rule above could not read them, because its 40 character label cap
   * is what stops prose qualifying and these labels run to 53 with the clause
   * number in between them.
   *
   * THE BRACKETS ARE WHAT BUY THE LONGER LABEL. A percentage written `(35%)` is
   * parenthetical by construction: it is an aside attached to the phrase before
   * it, which is exactly what a criteria weighting is and is not something prose
   * does with a payment term. "VAT is charged at 20%" has no brackets and cannot
   * match this however long its label. So the cap goes to 60 here and the guard
   * is carried by the brackets instead, rather than being relaxed everywhere.
   */
const CRITERIA_BRACKETED =
  /^(?:[^%]{0,60}?\(\s*\d{1,3}(?:\.\d+)?\s*(?:%|per\s?cent)\s*\)\s*)+$/i;

const CRITERIA_MAX = 160;

/**
 * A bracketed criteria run is allowed to be much longer than a bare one, for the
 * reason given above the pattern: four `Label (35%)` pairs with clause numbers
 * between them measured 176 characters, and the 160 cap rejected the line before
 * the pattern ever ran. The brackets, not the length, are what make the form
 * safe, so it gets a bound that fits a real criteria table.
 */
const CRITERIA_BRACKETED_MAX = 400;

/** True when the segment states a weighting rather than merely sitting near one. */
function readsAsWeighting(segment: string, body: string): boolean {
  if (EVALUATION.test(segment)) return true;
  /* Length is checked per candidate string, so a long segment does not veto a
     short body, which is what a stripped clause reference produces. */
  const shape = (re: RegExp, max: number) =>
    (body.length <= max && re.test(body)) || (segment.length <= max && re.test(segment));
  if (shape(CRITERIA_BRACKETED, CRITERIA_BRACKETED_MAX)) return true;
  return CRITERIA_ROW.some((re) => shape(re, CRITERIA_MAX));
}

/**
 * ── WHY NOTHING IS CATEGORISED, AND WHY THAT IS THE HONEST ANSWER ───────────
 *
 * `RequirementCategory` is adopted from the platform above, because the shape
 * has to match for the upgrade path to be an import. Every row this engine emits
 * carries `'other'`, and no category is ever guessed.
 *
 * A KEYWORD CLASSIFIER IS THE ONE PART OF THIS TOOL THAT WOULD INFER. Everything
 * else here reports something the document literally contains: the word "shall",
 * a clause number, "500 words", "20%". A category is not in the document. It is
 * a judgement about what a requirement is ABOUT, and a rule that reads the word
 * "approach" and writes "Quality" against a line is stating a conclusion the
 * text does not support. On a page whose whole claim is that it never
 * paraphrases, a wrong label sitting next to a correct verbatim quote does more
 * damage than a missing one, because the quote is what makes the label look
 * checked.
 *
 * A first build did classify, with five keyword lists. It was removed for the
 * reason above, and removing it also took roughly 750 B out of the one budget on
 * this site with no room in it. Both things are true; the first is why it is not
 * coming back when the budget changes. Categorisation belongs with the extractor
 * that can read a requirement rather than match a word, which is Phase 3.
 */
const CATEGORY: RequirementCategory = 'other';

/* ── Input validation ────────────────────────────────────────────────────── */

/** The one control this tool has. Named for the id the form gives it. */
export type TenderMatrixField = 'tenderText';

/**
 * Which rule refused the input. A CODE, not a sentence.
 *
 * the PPN 002 calculator library returns `{ field, message }`, and this deliberately does not.
 * The three sentences live in the markup of the page, beside the result copy and
 * for the same reason recorded there: a sentence held in a script is paid for in
 * the 15 KB JavaScript budget and is unreadable without script. The code names
 * the rule, the page names the sentence, and there is still exactly one place
 * each is written.
 */
export type TenderMatrixProblemCode = 'empty' | 'short' | 'long';

export interface TenderMatrixProblem {
  field: TenderMatrixField;
  code: TenderMatrixProblemCode;
}

/**
 * WHY VALIDATION IS ITS OWN EXPORTED FUNCTION. The shape is lifted from
 * the PPN 002 calculator library and so is the reason: a single sentence covering every kind of
 * bad input tells a user who got one thing wrong the whole rulebook and leaves
 * them to work out which line is theirs. The predicates below are the same
 * predicates `analyse()` applies, and `analyse()` calls this rather than
 * restating them, so the rule that refuses an input and the sentence that
 * explains the refusal cannot drift apart.
 *
 * There is one field, so there is at most one problem. The array shape is kept
 * anyway: the page's error handling is then identical to the calculator's, and a
 * second field added later does not change the contract.
 */
export function problems(text: string): TenderMatrixProblem[] {
  const t = text.trim();
  const say = (code: TenderMatrixProblemCode): TenderMatrixProblem[] => [
    { field: 'tenderText', code },
  ];

  if (!t) return say('empty');
  if (t.length < MIN_CHARS) return say('short');
  if (text.length > MAX_CHARS) return say('long');
  return [];
}

/* ── Detection ───────────────────────────────────────────────────────────── */

/**
 * Sentence boundaries, conservatively: after a full stop, question mark or
 * exclamation mark followed by whitespace and an opening character. The
 * requirement for whitespace is what keeps "4.2 The supplier" and "no more than
 * 1.5 days" in one piece; without it every clause number becomes a sentence.
 */
const SENTENCE = /(?<=[.!?])\s+(?=["'(\[A-Z])/;

interface Segment {
  text: string;
  line: number;
}

/**
 * ── A PDF DOES NOT WRAP WHERE THE SENTENCE ENDS, AND PASTE IS THE ONLY INPUT ─
 *
 * MEASURED on 2026-08-06, on the exact thing a visitor does first. Copying a
 * justified column out of a tender PDF produces hard line breaks wherever the
 * column ended:
 *
 *     1.4 Tenderers are required to provide a written methodology of no more
 *     than 2,000 words.
 *     1.5 The supplier is
 *     required to hold employers liability insurance.
 *
 * The engine returned ONE row. The 2,000 word limit was gone, because "no more
 * than 2,000 words" had a newline through the middle of it, and requirement 1.5
 * was gone entirely, because "is" and "required to" were on different lines. Two
 * of the three facts in a four line paste, silently absent. The tool's only
 * input is pasted text, so this was not an edge case; it was the common case.
 *
 * THE RULE, AND WHY IT IS READING RATHER THAN GUESSING. A line is a CONTINUATION
 * of the one above when the line above does not end in sentence-terminating
 * punctuation and this line opens with a lower case letter. English does not
 * begin a sentence with a lower case letter, so the break is a wrap the layout
 * put there and not a boundary the author wrote. A blank line always ends the
 * run, a line opening with a capital or a digit always ends it, and the joined
 * segment is attributed to the line number of its FIRST line, which is where a
 * reader looking for it in their own paste will find it.
 *
 * A TRAILING HYPHEN JOINS WITHOUT THE SPACE, which is the convention every PDF
 * text extractor uses, and the one place here where a genuine ambiguity is
 * resolved by convention rather than by evidence: a compound broken at the
 * column edge ("cost-" / "effective") is indistinguishable from a word broken at
 * the column edge ("method-" / "ology"), and this reads both as the latter. It
 * is recorded rather than hidden because it is the only join that alters a
 * character instead of a line break.
 *
 * WHAT THIS MEANS FOR HONESTY RULE 2, STATED PLAINLY. `source_quote` on a joined
 * segment is not byte identical to the paste: a line break has become a space.
 * The words are the document's, in the document's order, with nothing added,
 * removed or restated. That is the same claim the rule has always made about a
 * sentence taken out of a long line, and the alternative is reporting a
 * requirement as absent because of where a column ended.
 */
const CONTINUES = /^[a-z]/;
const TERMINATED = /[.!?:;]$/;

function logicalLines(text: string): Segment[] {
  const raw = text.split(/\r\n|\r|\n/);
  const out: Segment[] = [];
  for (let i = 0; i < raw.length; i++) {
    const line = raw[i].trim();
    if (!line) continue;

    let joined = line;
    let next = i + 1;
    while (next < raw.length) {
      const candidate = raw[next].trim();
      if (!candidate) break;
      if (TERMINATED.test(joined)) break;
      if (!CONTINUES.test(candidate)) break;
      joined = joined.endsWith('-')
        ? `${joined.slice(0, -1)}${candidate}`
        : `${joined} ${candidate}`;
      next++;
    }

    out.push({ text: joined, line: i + 1 });
    i = next - 1;
  }
  return out;
}

function segments(text: string): Segment[] {
  const out: Segment[] = [];
  for (const { text: line, line: no } of logicalLines(text)) {
    if (line.length <= LONG) {
      out.push({ text: line, line: no });
      continue;
    }
    for (const piece of line.split(SENTENCE)) {
      const s = piece.trim();
      if (s) out.push({ text: s, line: no });
    }
  }
  return out;
}

function splitRef(segment: string): { ref: string | null; body: string } {
  for (const re of REFS) {
    const m = re.exec(segment);
    if (!m) continue;
    const body = segment.slice(m[0].length).trim();
    if (body.length < MIN_BODY || !body.includes(' ')) continue;
    return { ref: m[1].replace(/\s+/g, ''), body };
  }
  return { ref: null, body: segment };
}

function limitsIn(segment: string): DetectedLimit[] {
  const out: DetectedLimit[] = [];
  const seen = new Set<string>();
  for (const re of LIMITS) {
    re.lastIndex = 0;
    let m = re.exec(segment);
    while (m) {
      const value = Number(m[1].replace(/,/g, ''));
      const unit = `${m[2].toLowerCase()}s`;
      const key = `${value}${unit}`;
      if (Number.isFinite(value) && value > 0 && !seen.has(key)) {
        seen.add(key);
        // The quote is the matched fragment, so it is present in the input by
        // construction. Nothing is reconstructed from the parsed value.
        out.push({ value, unit, quote: m[0].trim() });
      }
      m = re.exec(segment);
    }
  }
  return out;
}

function deadlinesIn(segment: string): DetectedDeadline[] {
  /* The cue gates the whole rule, so an ordinary date costs one test. */
  if (!DEADLINE_CUE.test(segment)) return [];
  const out: DetectedDeadline[] = [];
  const seen = new Set<string>();
  for (const re of WHEN) {
    re.lastIndex = 0;
    let m = re.exec(segment);
    while (m) {
      const text = m[0].trim();
      const key = text.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ text });
      }
      m = re.exec(segment);
    }
  }
  return out;
}

function weightsIn(segment: string, inContext: boolean): number[] {
  if (!inContext) return [];
  const out: number[] = [];
  PERCENT.lastIndex = 0;
  let m = PERCENT.exec(segment);
  while (m) {
    const v = Number(m[1]);
    if (Number.isFinite(v) && v >= 0 && v <= 100) out.push(v);
    m = PERCENT.exec(segment);
  }
  return out;
}

/**
 * Read pasted tender text and return the matrix.
 *
 * Returns null when `problems()` reports anything, mirroring `calculate()` in
 * the PPN 002 calculator library. A VALID paste that matches nothing is NOT null: it returns a
 * matrix with no rows, because "these rules found nothing" is a real answer and
 * an error would tell the reader their input was wrong when it was the rules
 * that were narrow.
 */
export function analyse(text: string): TenderMatrix | null {
  if (problems(text).length > 0) return null;

  const rows: MatrixRow[] = [];
  const seen = new Set<string>();
  let lines = 0;
  let detected = 0;
  let duplicates = 0;
  let obligationCount = 0;
  let directiveCount = 0;
  let mandatoryCount = 0;
  let deadlineCount = 0;
  let referenceCount = 0;
  let limitCount = 0;
  let weightingCount = 0;
  let weightingTotal = 0;
  let uncontextualizedPercentCount = 0;
  /* Segments still inside an evaluation context. See EVAL_REACH above. */
  let reach = 0;

  for (const seg of segments(text)) {
    lines++;
    if (EVALUATION.test(seg.text)) reach = EVAL_REACH;
    else if (reach > 0) reach--;

    const { ref, body } = splitRef(seg.text);
    const limits = limitsIn(seg.text);
    const deadlines = deadlinesIn(seg.text);
    /*
     * BOTH TESTS, AND IN THIS ORDER. `reach > 0` asks whether the segment is
     * near evaluation language; `readsAsWeighting` asks whether the segment
     * states a weighting. Dropping either one has been measured to break the
     * tool in a different direction, and the note above CRITERIA_ROW records
     * which fault belongs to which.
     */
    const weights = weightsIn(seg.text, reach > 0 && readsAsWeighting(seg.text, body));

    if (weights.length > 0) {
      /*
       * CONTEXT RE-ARM, AND IT IS SAFE ONLY BECAUSE OF THE GATE ABOVE. A
       * criteria table of any length stays inside the context, because every
       * row of it re-arms. A payment term cannot re-arm, because it never
       * became a weighting in the first place. The unguarded version of this
       * line held context open across whole documents.
       */
      reach = EVAL_REACH;
    } else if (PERCENT.test(seg.text)) {
      PERCENT.lastIndex = 0;
      /*
       * A percentage the rules did NOT read as a weighting, whether it fell
       * outside the context or failed the shape test inside it. Counted so the
       * page can say "percentages were found and none of them read as award
       * criteria" rather than reporting silence, which a reader cannot tell
       * apart from a document that has no percentages in it.
       */
      uncontextualizedPercentCount++;
    }

    limitCount += limits.length;
    weightingCount += weights.length;
    for (const w of weights) weightingTotal += w;

    const signals: SignalKind[] = [];
    /*
     * TRIGGERS ARE TESTED AGAINST THE TEXT WITH QUOTED SPANS REMOVED. A phrase
     * the document NAMES is not a phrase the document USES: see the note above
     * QUOTED. Values below are read from the original, because a figure inside
     * quotation marks is still a figure the document states.
     */
    const said = unquoted(body);
    if (OBLIGATION.test(said)) signals.push('obligation');
    /* Directives need the reference: see the note above DIRECTIVE. */
    if (ref && DIRECTIVE.test(said)) signals.push('directive');
    const defining = HAS_QUOTE.test(seg.text) && DEFINES.test(seg.text);
    if (!defining && MANDATORY.test(unquoted(seg.text))) signals.push('mandatory');
    if (deadlines.length) signals.push('deadline');
    if (ref) signals.push('reference');
    if (limits.length) signals.push('limit');
    if (weights.length) signals.push('weighting');

    /*
     * A BARE REFERENCE IS NOT A REQUIREMENT. "3. Quality" is a heading in a
     * question schedule, and reporting every heading as a requirement is how a
     * matrix comes to have four hundred rows and no meaning. A numbered line
     * earns a row only when something else about it says it states an
     * obligation, a directive, a limit or a weighting.
     */
    if (!signals.length || (signals.length === 1 && signals[0] === 'reference')) continue;

    /*
     * Deduplicated on case and whitespace only. A pack that repeats one line in
     * a header and again in a schedule has repeated the same requirement, not
     * stated two. Nothing else is normalised: two lines differing by a single
     * word are two rows, and deciding they are one is exactly the inference
     * honesty rule 2 forbids.
     */
    const key = body.toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(key)) {
      duplicates++;
      continue;
    }
    seen.add(key);
    detected++;

    if (signals.includes('obligation')) obligationCount++;
    if (signals.includes('directive')) directiveCount++;
    if (signals.includes('mandatory')) mandatoryCount++;
    if (signals.includes('deadline')) deadlineCount++;
    if (signals.includes('reference')) referenceCount++;

    if (rows.length >= MAX_ROWS) continue;

    /*
     * `weight` is set only when the segment carries EXACTLY ONE percentage. A
     * line reading "Quality 60%, price 40%" states two weightings and this row
     * is neither of them, so the field stays null and both percentages are
     * counted in the totals instead. Taking the first would be a guess
     * presented as a figure.
     */
    rows.push({
      id: `L${seg.line}-${rows.length + 1}`,
      requirement_ref: ref,
      requirement_text: body,
      category: CATEGORY,
      weight: weights.length === 1 ? weights[0] : null,
      status: 'suggested',
      source_page: null,
      source_quote: seg.text,
      extraction_confidence: null,
      compliance: null,
      signals,
      source_line: seg.line,
      limits,
      deadlines,
    });
  }

  const roundedTotal = Math.round(weightingTotal * 100) / 100;
  let weightingConfidence: 'complete' | 'sub_criteria' | 'no_context_found' | 'none' = 'none';

  if (weightingCount > 0) {
    weightingConfidence = roundedTotal >= 95 && roundedTotal <= 105 ? 'complete' : 'sub_criteria';
  } else if (uncontextualizedPercentCount > 0) {
    weightingConfidence = 'no_context_found';
  }

  /*
   * The summary is the product's shape and its parts add up: nothing has been
   * answered yet, so every detected requirement is `not_started`. `total` is the
   * number DETECTED, which is larger than `rows.length` when the row cap has
   * bitten. That asymmetry is deliberate and `truncated` declares it.
   */
  return {
    rows,
    summary: { total: detected, not_started: detected, draft: 0, covered: 0, gap: 0 },
    lines,
    obligationCount,
    directiveCount,
    mandatoryCount,
    deadlineCount,
    referenceCount,
    limitCount,
    weightingCount,
    // Two decimal places so 33.33 + 33.33 + 33.34 reports 100 rather than
    // 100.00000000000001.
    weightingTotal: roundedTotal,
    weightingConfidence,
    truncated: detected > rows.length,
    duplicates,
  };
}


/* ── Export ──────────────────────────────────────────────────────────────── */

/**
 * ── THE EXPORTS LIVE HERE BECAUSE THEY ARE RULES, NOT MARKUP ────────────────
 *
 * They were written inside the page's `<script>` island on 2026-08-06 and moved
 * on the same day. Two reasons, and the second is the one that matters.
 *
 * THE BUDGET REASON. scripts/check-budgets.js caps all JavaScript in the build,
 * and an island is bundled per route and then deduplicated across every route
 * sharing the layout, so 7 KB written in the page cost 5.7 KB of duplication on
 * top of itself. Two budget exceptions were opened to absorb that. Both are
 * DELETED by this move rather than raised, which is the difference between
 * fixing a breach and recording one.
 *
 * THE REAL REASON. `buildCsv` decides what a row means once it leaves the page:
 * which columns exist, what an empty weight looks like, whether the verbatim
 * quote travels with the requirement it belongs to. Those are the same kind of
 * decision as `OBLIGATION` and they belong in the same file, where they can be
 * driven with a fixture. A rule that only runs when a human clicks a button in a
 * browser is a rule nothing tests, and the CSV escaping fault below is exactly
 * what that costs.
 */

/**
 * THE QUOTE TRAVELS WITH THE ROW, AND THAT IS THE WHOLE POINT OF THE EXPORT.
 *
 * The first version of this export carried the reference, the requirement, the
 * signals, the limits and the weight, and dropped `source_quote`. That is the
 * one column the tool exists to produce. Honesty rule 2 says every row carries
 * the segment it was read from word for word; a spreadsheet that arrives at a
 * bid team without it hands them a paraphrase-shaped artefact from a tool whose
 * claim is that it never paraphrases, and there is then no way to check a row
 * against the pack it came from.
 */
const CSV_COLUMNS = [
  'Row',
  'Line',
  'Reference',
  'Requirement',
  'Source quote',
  'Signals',
  'Limits',
  'Dates stated',
  'Weighting (%)',
] as const;

/**
 * ── A SPREADSHEET CELL IS EXECUTABLE, AND TENDER TEXT IS SOMEONE ELSE'S ─────
 *
 * Excel, LibreOffice and Google Sheets all read a cell opening with `=`, `+`,
 * `-`, `@` or a control character as a FORMULA rather than as text. A tender
 * pack is a document the bidder received; a line reading
 * `=HYPERLINK("http://x","click")` or `=cmd|'/c calc'!A1` pasted into this tool
 * and exported would be evaluated when the bid team opened the file. This is CSV
 * injection, and quoting the field does not prevent it: the quotes are consumed
 * by the CSV parser before the formula parser sees the value.
 *
 * THE PREFIX IS AN APOSTROPHE, WHICH EVERY ONE OF THOSE THREE READS AS "the
 * rest of this cell is literal text" and none of them displays. The alternative
 * is stripping the character, which would silently alter a requirement's
 * verbatim text and break honesty rule 2 to fix a security fault. Neutralising
 * without deleting keeps both.
 *
 * A leading `-` is included even though a negative number is a legitimate cell
 * value, because no column here is numeric: `Weighting (%)` is written as a bare
 * number and can never be negative, and every other column is prose.
 */
function csvCell(value: string): string {
  const text = String(value ?? '');
  const risky = /^[=+\-@\t\r]/.test(text);
  const guarded = risky ? `'${text}` : text;
  return `"${guarded.replace(/"/g, '""')}"`;
}

/** The limits on a row, as one cell: `500 words; 4 pages`. */
function limitsCell(limits: DetectedLimit[]): string {
  return limits.map((l) => `${l.value} ${l.unit}`).join('; ');
}

/** The dates on a row, as one cell, verbatim and unparsed. */
function datesCell(deadlines: DetectedDeadline[]): string {
  return deadlines.map((d) => d.text).join('; ');
}

/**
 * The matrix as RFC 4180 CSV.
 *
 * CRLF LINE ENDINGS because RFC 4180 specifies them and Excel on Windows, which
 * is what a UK bid team is using, is the strictest reader of the three.
 *
 * THE BOM IS NOT OPTIONAL FOR THIS AUDIENCE. Excel opens a .csv in the system
 * ANSI code page unless the file begins with a UTF-8 byte order mark, so every
 * pound sign in a procurement document renders as `Â£` and every en dash as a
 * pair of mojibake. A tool for UK tenders that mangles `£2m` in its own export
 * has produced a file the recipient has to correct by hand.
 */
export function buildCsv(matrix: TenderMatrix): string {
  const rows = [CSV_COLUMNS.join(',')];
  matrix.rows.forEach((r, i) => {
    rows.push(
      [
        csvCell(String(i + 1)),
        csvCell(String(r.source_line)),
        csvCell(r.requirement_ref ?? ''),
        csvCell(r.requirement_text),
        csvCell(r.source_quote ?? ''),
        csvCell(r.signals.join('; ')),
        csvCell(limitsCell(r.limits)),
        csvCell(datesCell(r.deadlines)),
        csvCell(r.weight === null ? '' : String(r.weight)),
      ].join(',')
    );
  });
  return `﻿${rows.join('\r\n')}\r\n`;
}

/** A GitHub-flavoured pipe table cell: pipes escaped, newlines flattened. */
function mdCell(value: string): string {
  return String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\s*\n\s*/g, ' ')
    .trim();
}

/**
 * The matrix as a Markdown table, for pasting into a bid tracker or a ticket.
 *
 * The quote column is carried here too, for the reason given above CSV_COLUMNS.
 * It is the last column because it is the longest, and a pipe table with its
 * widest field in the middle is unreadable as source text.
 */
export function buildMarkdown(matrix: TenderMatrix): string {
  const head =
    '| Row | Line | Ref | Requirement | Signals | Limits | Dates | Weighting | Source quote |';
  const rule = '| --- | --- | --- | --- | --- | --- | --- | --- | --- |';
  const body = matrix.rows.map((r, i) => {
    const cells = [
      String(i + 1),
      String(r.source_line),
      mdCell(r.requirement_ref ?? '-'),
      mdCell(r.requirement_text),
      r.signals.join(', '),
      mdCell(limitsCell(r.limits)) || '-',
      mdCell(datesCell(r.deadlines)) || '-',
      r.weight === null ? '-' : pct(r.weight),
      mdCell(r.source_quote ?? ''),
    ];
    return `| ${cells.join(' | ')} |`;
  });
  return [head, rule, ...body].join('\n');
}

/**
 * The download filename, dated.
 *
 * THE DATE IS LOCAL, NOT `toISOString()`. A bid team in London exporting at
 * 00:30 BST on the deadline day would receive a file stamped with YESTERDAY,
 * because `toISOString` reports UTC. Off-by-one dates on procurement paperwork
 * are the kind of small wrongness that costs the tool its credibility with
 * exactly the reader who checks.
 */
export function exportFilename(now: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `tender-compliance-matrix-${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}.csv`;
}

/** en-GB formatting, matching the PPN 002 calculator library exactly. */
export function pct(n: number): string {
  return `${(Math.round(n * 100) / 100).toLocaleString('en-GB')}%`;
}

export function num(n: number): string {
  return n.toLocaleString('en-GB');
}
