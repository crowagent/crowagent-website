/**
 * ppn002.ts — the five PPN 002 government missions, and nothing else.
 *
 * THAT IS ALL THIS FILE IS NOW, as of 2026-08-05 (A-101, owner: "delete and
 * remove all"). It used to hold the PPN 002 floor arithmetic as well. The owner
 * removed the calculator and its methodology page on 2026-08-04 ("remove PPN 002
 * calculator page completly also with redirects"), and those two pages were the
 * only readers of `calculate`, `problems`, `verdict`, `pct`, `pts`, `FLOOR_PCT`
 * and the three exported types that went with them. All nine are deleted. The
 * file's own previous header said the deletion was "a reasonable follow-up" that
 * must not happen silently inside a removal task; A-101 is that follow-up, taken
 * openly and on its own.
 *
 * `MISSIONS` is the one export, and it is load-bearing. pages/sources.astro
 * imports it and filters it to publish the five missions with their citation.
 * See the note at the head of that file for why it imports them rather than
 * retyping them: a second copy of a list of statutory facts is how the two
 * copies come to disagree.
 *
 * WHAT WAS DELETED IS NOT LOST, AND HERE IS WHERE IT WENT. The arithmetic, the
 * two unit bugs it was shaped by (a percentage compared against a number of
 * points, and a social-value weighting larger than the total being accepted,
 * which is how the tool once reported "12 pts" on a "10 total points"
 * evaluation) and the three binding content rules are all written down in
 * specs/architecture/CONTENT-ARCHITECTURE.md section 4. A record of a bug
 * belongs in a decision document; it does not belong in a comment sitting on top
 * of a five-element array, describing code the reader cannot see. The parity
 * test that guarded the port, tests/ppn002-parity.spec.js, is deleted in the
 * same change: it drove /tools/ppn-002-calculator/ in a browser, that route now
 * 301s to /glossary/ppn-002, and it was not quarantined, so all 22 of its cases
 * were failing against a redirect rather than testing anything.
 *
 * THE THREE BINDING RULES SURVIVE HERE TOO, because three other files cite this
 * header for them by name: pages/sources.astro, lib/tender-matrix.ts and
 * scripts/check-facts.js. They are binding on this codebase whether or not any
 * page reads them today.
 *
 * THE FLOOR IS ALWAYS 10%, NEVER 5%. It is a weighting of the total tender
 * evaluation score, not a score. PPN 002 was published on 13 February 2025 and
 * is mandatory for procurements commenced under the Procurement Act 2023 on or
 * after 1 October 2025. 24 February 2025 is the Procurement Act 2023's own
 * commencement date, NOT PPN 002's: do not attach it to the PPN.
 *
 * NOTHING BUILT ON THESE FACTS MAY ASSERT COMPLIANCE. Whether a procurement is
 * compliant is a judgement for the contracting authority. The wording this
 * replaced once put "Compliant:" in a green badge directly above small print
 * reading "not legal or procurement advice", contradicting itself on screen.
 */

/**
 * The five government missions PPN 002 (2025) scores against.
 *
 * The first entry is the removed form's empty placeholder. It is LEFT IN PLACE
 * rather than tidied away: pages/sources.astro already reads this array as
 * `MISSIONS.filter((m) => m.value)`, so the placeholder is invisible to the one
 * live consumer, and changing the shape of a load-bearing array is not what
 * A-101 asked for. Deleting it would be a second change wearing the first one's
 * justification.
 */
export const MISSIONS = [
  { value: '', label: 'Select a mission' },
  { value: 'm1-growth', label: 'M1 Kickstart economic growth' },
  { value: 'm2-energy', label: 'M2 Make Britain a clean energy superpower' },
  { value: 'm3-streets', label: 'M3 Take back our streets' },
  { value: 'm4-opportunity', label: 'M4 Break down barriers to opportunity' },
  { value: 'm5-nhs', label: 'M5 Build an NHS fit for the future' },
];
