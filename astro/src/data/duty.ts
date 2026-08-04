/**
 * duty.ts — the three statutory figures the hero proof card is drawn from, and
 * the citation that makes each one checkable.
 *
 * ── WHY THIS FILE EXISTS ────────────────────────────────────────────────────
 *
 * A-45. `/crowmark` and `/crowmark-buyers` each carried their own `DUTY` array,
 * and the three CITATION strings in them were character-for-character identical:
 * the same section numbers, the same thresholds, the same commencement dates.
 * Two copies of a legal reference is not a duplication of styling, it is a
 * duplication of the only kind of statement on this site that can be checked
 * against a published instrument — and the copy nobody edits is the one that
 * goes stale after a commencement order.
 *
 * The same argument integrations.ts makes about a connector, one file over: a
 * vendor is ONE object referenced from every list it appears in, because a
 * duplicate list does not fail loudly, it drifts. A statute is the same object
 * with a shorter fuse.
 *
 * ── WHAT IS SHARED AND WHAT IS DELIBERATELY NOT ─────────────────────────────
 *
 * SHARED: the figure and the citation. `3`, `12` and `10%` are numbers Parliament
 * and the Cabinet Office set, and neither page is entitled to a different one.
 *
 * NOT SHARED: the LABEL. The two pages address opposite ends of the same
 * transaction and the label is where that shows — the supplier reads "KPIs
 * minimum" as a count in a contract handed to them, the authority reads "KPIs
 * you must publish" as an obligation of its own. Same duty, two duty-holders,
 * and flattening that into one wording would put the authority's obligation on
 * the supplier, which is precisely the error /about was corrected for.
 *
 * So a page supplies its own labels and spreads the row it is labelling:
 *
 *   { ...S52, label: 'KPIs minimum' }
 *
 * which makes the figure and the citation impossible to retype by accident and
 * leaves the audience-facing half where an editor can see it.
 *
 * ── THE ONE RULE ────────────────────────────────────────────────────────────
 *
 * s.52 SETS AND PUBLISHES. s.71 ASSESSES AND PUBLISHES. They are two duties,
 * twelve months apart, and they must never be merged into one sentence — that is
 * the single most common way either page could become wrong, and the gap section
 * on /crowmark exists to draw the twelve months between them.
 *
 * scripts/check-facts.js holds the dates: it fails the build if "24 February"
 * ever comes within 200 characters of "PPN 002", because the Act's commencement
 * date was attached to the PPN across twelve files once already (OA-29).
 */

/** One row of the proof card: a cited figure, and the label the page gives it. */
export interface DutyRow {
  /** The figure, set in the display face at --t-stat. */
  fig: string;
  /**
   * The instrument, the qualifying condition and the commencement date. Fixed
   * in length by the instrument it names, which is why the card balances it
   * rather than trimming it — see styles/duty-card.css.
   */
  cite: string;
  /** Supplied by the page. The audience-facing half. */
  label?: string;
}

/**
 * SECTION 52 — key performance indicators.
 *
 * Above £5m estimated value, the contracting authority sets and publishes at
 * least three KPIs. Section 52 stops there; the duty to ASSESS against them is
 * s.71 below. Certain contract types, frameworks among them, are exempt.
 */
export const S52: DutyRow = {
  fig: '3',
  cite: 'Procurement Act 2023, s.52 · estimated value above £5m · in force 24 February 2025',
};

/**
 * SECTION 71 — assessment against those indicators.
 *
 * At least once every twelve months, and on termination, the authority assesses
 * performance against the s.52 indicators and publishes that assessment. This is
 * the half that outlives the bid, and the twelve months is the whole subject of
 * the gap section on /crowmark.
 */
export const S71: DutyRow = {
  fig: '12',
  cite: 'Procurement Act 2023, s.71 · assess and publish, and on termination · in force 1 January 2026',
};

/**
 * PPN 002 — the minimum social value weighting at award.
 *
 * Ten per cent is a FLOOR on the evaluation weighting, not a score and not a
 * prediction: the remaining weighting is the authority's to set. The bar on the
 * proof card draws the segment at exactly 10% of the track so the picture and
 * the figure cannot disagree.
 */
export const PPN002: DutyRow = {
  fig: '10%',
  cite: 'PPN 002 · published 13 February 2025, mandatory 1 October 2025',
};

/**
 * The three, in the order both cards read them: what is set, when it is
 * assessed, and what it is worth at award. Exported for anything that needs the
 * set without labelling it; the two hero cards each spread these with their own
 * labels rather than consuming this array directly.
 */
export const DUTIES: DutyRow[] = [S52, S71, PPN002];
