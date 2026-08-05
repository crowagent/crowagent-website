/**
 * tender-matrix.ts — the tender compliance matrix rule engine, as pure functions.
 *
 * WHY THIS IS A LIBRARY AND NOT A SCRIPT INSIDE THE PAGE. Same argument as
 * lib/ppn002.ts, one object along: the page renders, the library decides. A
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
 *    written into lib/ppn002.ts, and it is why nothing here returns a verdict, a
 *    pass, a score or a percentage of readiness.
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
export type SignalKind = 'obligation' | 'reference' | 'limit' | 'weighting';

/** A response limit stated in the text: 500 words, 4 pages, 2 sides. */
export interface DetectedLimit {
  value: number;
  unit: string;
  /** The verbatim fragment the value was read from. */
  quote: string;
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
}

export interface TenderMatrix {
  rows: MatrixRow[];
  summary: ComplianceMatrixSummary;
  /** Non-empty lines read. */
  lines: number;
  limitCount: number;
  weightingCount: number;
  /**
   * The arithmetic sum of every percentage found on a line that also reads as
   * evaluation criteria. It is NOT a claim that a set of weightings is complete,
   * correct or lawful: a pack listing sub-criteria as well as top-level criteria
   * sums to well over 100, and that is normal.
   */
  weightingTotal: number;
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
 * Obligation language: the four forms named in the spec, plus the plural of the
 * third, which is the same construction and would otherwise be missed on every
 * document written about "suppliers" rather than "the supplier".
 *
 * `must not` and `shall not` are covered by the same alternatives. A prohibition
 * is an obligation, and dropping the negative would report the opposite of what
 * the document says.
 */
const OBLIGATION = /\b(?:must|shall|(?:is|are)\srequired\sto|will\sbe\srequired)\b/i;

/**
 * A leading question or clause reference, in the three shapes a tender pack
 * uses: `Q1` and `SQ1.3`, `1.1` and `4.2.3`, and `1.` or `12)`.
 *
 * THE GUARDS ARE THE INTERESTING PART. The dotted form caps its first component
 * at two digits so a figure written `2025.10` cannot be read as clause 2025.10.
 * The plain form caps at three digits and REQUIRES punctuation after the number,
 * so a line opening "500 words" is not a reference to clause 500.
 */
const REFS = [
  /^((?:SQ|Q|A)\s?\d{1,3}(?:\.\d{1,3})*)\s*[.):\]]?\s+/i,
  /^(\d{1,2}(?:\.\d{1,3})+)\s*[.):\]]?\s+/,
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
 * lib/ppn002.ts returns `{ field, message }`, and this deliberately does not.
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
 * lib/ppn002.ts and so is the reason: a single sentence covering every kind of
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

function segments(text: string): Segment[] {
  const out: Segment[] = [];
  const lines = text.split(/\r\n|\r|\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.length <= LONG) {
      out.push({ text: line, line: i + 1 });
      continue;
    }
    for (const piece of line.split(SENTENCE)) {
      const s = piece.trim();
      if (s) out.push({ text: s, line: i + 1 });
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
 * lib/ppn002.ts. A VALID paste that matches nothing is NOT null: it returns a
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
  let limitCount = 0;
  let weightingCount = 0;
  let weightingTotal = 0;
  /* Segments still inside an evaluation context. See EVAL_REACH above. */
  let reach = 0;

  for (const seg of segments(text)) {
    lines++;
    if (EVALUATION.test(seg.text)) reach = EVAL_REACH;
    else if (reach > 0) reach--;

    const { ref, body } = splitRef(seg.text);
    const limits = limitsIn(seg.text);
    const weights = weightsIn(seg.text, reach > 0);

    limitCount += limits.length;
    weightingCount += weights.length;
    for (const w of weights) weightingTotal += w;

    const signals: SignalKind[] = [];
    if (OBLIGATION.test(body)) signals.push('obligation');
    if (ref) signals.push('reference');
    if (limits.length) signals.push('limit');
    if (weights.length) signals.push('weighting');

    /*
     * A BARE REFERENCE IS NOT A REQUIREMENT. "3. Quality" is a heading in a
     * question schedule, and reporting every heading as a requirement is how a
     * matrix comes to have four hundred rows and no meaning. A numbered line
     * earns a row only when something else about it says it states an
     * obligation, a limit or a weighting.
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
    });
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
    limitCount,
    weightingCount,
    // Two decimal places so 33.33 + 33.33 + 33.34 reports 100 rather than
    // 100.00000000000001.
    weightingTotal: Math.round(weightingTotal * 100) / 100,
    truncated: detected > rows.length,
    duplicates,
  };
}

/** en-GB formatting, matching lib/ppn002.ts exactly. */
export function pct(n: number): string {
  return `${(Math.round(n * 100) / 100).toLocaleString('en-GB')}%`;
}

export function num(n: number): string {
  return n.toLocaleString('en-GB');
}
