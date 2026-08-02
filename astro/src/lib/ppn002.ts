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
 * evaluation score, not a score. PPN 002 is dated February 2025 and mandatory
 * from 1 October 2025.
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
 * identical to the legacy engine's, including `proposedSv > totalWeighting`.
 */
export function calculate(
  mission: string,
  totalWeighting: number,
  proposedSv: number
): Ppn002Result | null {
  if (
    !mission ||
    !isFinite(totalWeighting) ||
    totalWeighting <= 0 ||
    totalWeighting > 100 ||
    !isFinite(proposedSv) ||
    proposedSv < 0 ||
    proposedSv > 100 ||
    proposedSv > totalWeighting
  ) {
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
