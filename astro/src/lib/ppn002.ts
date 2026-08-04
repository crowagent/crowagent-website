/**
 * ppn002.ts — the PPN 002 floor calculation, as a pure function.
 *
 * WHY THIS IS EXTRACTED RATHER THAN REWRITTEN INSIDE A COMPONENT. This is the
 * only page on the site that produces a NUMBER a user will quote to a buyer. A
 * content page that drifts during a port reads slightly differently; this one
 * would tell somebody their evaluation clears a statutory floor when it does
 * not. So the arithmetic is separated from the markup, ported line for line from
 * js/tool-engine-ppn-002-calculator.js, and gated by a test that drives the
 * LEGACY page and this one with identical inputs and compares what each renders.
 *
 * TWO BUGS WERE ALREADY FIXED IN THE LEGACY ENGINE AND ARE PRESERVED HERE. Both
 * are recorded because they are the reason the shape looks the way it does:
 *
 *   - The floor was compared in the wrong units. `proposedSv`, a percentage, was
 *     tested directly against `floorPoints`, a number of points, so the two
 *     sides only agreed when the total happened to be 100. The comparison is now
 *     percentage against percentage: svShareOfTotal vs FLOOR_PCT.
 *
 *   - A social-value weighting LARGER than the total was accepted, which is how
 *     the tool came to report "12 pts" on a "10 total points" evaluation.
 *
 * THE FLOOR IS ALWAYS 10%, NEVER 5%. It is a weighting of the total tender
 * evaluation score, not a score. PPN 002 was published on 13 February 2025 and
 * is mandatory for procurements commenced under the Procurement Act 2023 on or
 * after 1 October 2025. 24 February 2025 is the Procurement Act 2023's own
 * commencement date, NOT PPN 002's: do not attach it to the PPN.
 *
 * IT MUST NEVER ASSERT COMPLIANCE. Whether a procurement is compliant is a
 * judgement for the contracting authority. This reports whether a number clears
 * the floor and stops. The legacy wording once said "Compliant:" in a green
 * badge directly above small print reading "not legal or procurement advice",
 * contradicting itself on screen.
 */

/** PPN 002 mandatory minimum social-value weighting. ALWAYS 10%. */
export const FLOOR_PCT = 10;

/** en-GB formatting, 2dp, matching the legacy engine exactly. */
export function pct(n: number): string {
  return `${(Math.round(n * 100) / 100).toLocaleString('en-GB')}%`;
}

export function pts(n: number): string {
  return (Math.round(n * 100) / 100).toLocaleString('en-GB');
}

/** The five government missions PPN 002 (2025) scores against. */
export const MISSIONS = [
  { value: '', label: 'Select a mission' },
  { value: 'm1-growth', label: 'M1 Kickstart economic growth' },
  { value: 'm2-energy', label: 'M2 Make Britain a clean energy superpower' },
  { value: 'm3-streets', label: 'M3 Take back our streets' },
  { value: 'm4-opportunity', label: 'M4 Break down barriers to opportunity' },
  { value: 'm5-nhs', label: 'M5 Build an NHS fit for the future' },
];

/** The three controls, named by the ids the form gives them. */
export type Ppn002Field = 'missionType' | 'bidWeighting' | 'socialValueCommitment';

export interface Ppn002Problem {
  field: Ppn002Field;
  message: string;
}

/**
 * WHY VALIDATION IS ITS OWN EXPORTED FUNCTION, added 2026-08-04.
 *
 * `calculate()` returned null for every kind of bad input, so the page had one
 * sentence to say about all of them: "Select a mission, then enter the total
 * evaluation weighting (1-100%) and the social-value weighting within it. The
 * social-value weighting cannot be larger than the total." A user who has filled
 * in everything correctly except one field is told the whole rulebook and left to
 * work out which line applies to them, with nothing on screen marking the field
 * that is wrong. On the one page of the site that exists to produce an answer,
 * that reads as the tool refusing to work.
 *
 * The predicates below are the SAME predicates, in the same order, that
 * `calculate()` used to test inline, and `calculate()` now calls this rather than
 * repeating them. That is deliberate: two copies of a validation rule is how a
 * calculator comes to accept an input its own error message forbids. The
 * arithmetic is untouched.
 *
 * `sv > total` is listed against the social-value field rather than the total,
 * because that is the field the user is being asked to change. NaN comparisons
 * are false, so an unparseable value never also raises this one — the same
 * behaviour the single OR chain had.
 */
export function problems(
  mission: string,
  totalWeighting: number,
  proposedSv: number
): Ppn002Problem[] {
  const found: Ppn002Problem[] = [];

  if (!mission) {
    found.push({
      field: 'missionType',
      message: 'Choose the mission this bid is scored against.',
    });
  }

  if (!isFinite(totalWeighting) || totalWeighting <= 0 || totalWeighting > 100) {
    found.push({
      field: 'bidWeighting',
      message:
        'Enter the total bid weighting as a percentage between 1 and 100. It is usually 100.',
    });
  }

  if (!isFinite(proposedSv) || proposedSv < 0 || proposedSv > 100) {
    found.push({
      field: 'socialValueCommitment',
      message: 'Enter the social-value weighting as a percentage between 0 and 100.',
    });
  } else if (proposedSv > totalWeighting) {
    found.push({
      field: 'socialValueCommitment',
      message: 'The social-value weighting cannot be larger than the total bid weighting.',
    });
  }

  return found;
}

export interface Ppn002Result {
  /** The floor expressed in the same units as the total. */
  floorPoints: number;
  /** Social value as a percentage OF THE TOTAL evaluation score. */
  svShareOfTotal: number;
  /** At or above the floor. Never phrased as "compliant" in the UI. */
  clearsFloor: boolean;
  /** Points needed to reach the floor. Zero when it already clears. */
  shortfall: number;
}

/**
 * Returns null when the inputs are not usable. The validation is deliberately
 * identical to the legacy engine's, including `proposedSv > totalWeighting`, and
 * it is now READ FROM `problems()` rather than restated here, so the rule that
 * refuses an input and the sentence that explains the refusal cannot drift apart.
 */
export function calculate(
  mission: string,
  totalWeighting: number,
  proposedSv: number
): Ppn002Result | null {
  if (problems(mission, totalWeighting, proposedSv).length > 0) {
    return null;
  }

  const floorPoints = totalWeighting * (FLOOR_PCT / 100);
  const svShareOfTotal = (proposedSv / totalWeighting) * 100;
  // 1e-9 tolerance so a value that is exactly on the floor is not pushed below
  // it by binary floating point.
  const clearsFloor = svShareOfTotal >= FLOOR_PCT - 1e-9;
  const shortfall = clearsFloor ? 0 : floorPoints - proposedSv;

  return { floorPoints, svShareOfTotal, clearsFloor, shortfall };
}

/** The verdict sentence, worded to report rather than to certify. */
export function verdict(proposedSv: number, r: Ppn002Result): string {
  return r.clearsFloor
    ? `Your ${pct(proposedSv)} social-value weighting is ${pct(r.svShareOfTotal)} of the total evaluation score, at or above the 10% floor PPN 002 sets.`
    : `Your ${pct(proposedSv)} social-value weighting is ${pct(r.svShareOfTotal)} of the total evaluation score, below the 10% floor PPN 002 sets. Raising it by ${pts(r.shortfall)} would reach the floor.`;
}
