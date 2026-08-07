/**
 * The Workstation tour slides.
 *
 * ── IT SHOWS THE SCREENS NOTHING ELSE ON THE SITE SHOWS ─────────────────────
 *
 * Owner, 2026-08-07: *"why cant you showcase other screens, we have build so
 * many screens in figma and you are showing lazyness to add new screens"*. The
 * first version of this file reused the five screens ProductScreens already
 * publishes, which put the same five images on one page twice and was exactly
 * the criticism.
 *
 * Sixteen screens are drawn. ProductScreens spends five of them. The six below
 * are chosen from the ELEVEN that were being shipped to `dist` and shown to
 * nobody, so the two sections now overlap on nothing at all.
 *
 * ── SOURCED FROM THE REGISTRY, NOT RETYPED ──────────────────────────────────
 *
 * Every field comes from data/crowmark-screens.ts, which is the single source
 * of truth for what each screen depicts, its device size and its cache-buster.
 * Nothing here writes a path, a dimension or a description of its own: an alt
 * text is a factual claim about a picture, and the registry's versions were
 * written against the drawings. Retyping them here is how a caption comes to
 * describe a screen that has since been redrawn.
 *
 * ── ALL THREE DEVICE SIZES, WHICH IS THE ARGUMENT THE TOUR MAKES ────────────
 *
 * ProductScreens is desktop-only, because it sits beside a paragraph and a
 * quote and a phone standing in that frame would be a picture of a phone rather
 * than a picture of the work. This section has no such column, so it can carry
 * the tablet and phone drawings — and they say something the desktop set
 * cannot: the duty with a date on it is remembered on the device the person
 * actually has. The stage below uses `object-fit: contain`, so a 4:3 tablet and
 * a portrait phone sit centred in the 16:10 frame with the floor around them
 * instead of being cropped to fit.
 */
import { SUPPLIER_SCREENS, BUYER_SCREENS } from './crowmark-screens';
/* The registry types its own arrays from Carousel's Slide and does not
   re-export it, so this takes it from the same original rather than adding
   a second name for one shape. */
import type { Slide } from '../components/ui/Carousel.astro';

export interface TourSlide extends Slide {
  /** The mono tag over the caption: which side, and on what. */
  tag: string;
}

/**
 * Pull one screen out of the registry by its file stem.
 *
 * IT THROWS RATHER THAN RETURNING UNDEFINED. A renamed or removed screen would
 * otherwise render an empty frame in a carousel nobody is looking at closely,
 * and the build would pass. This turns that into a build failure with the name
 * in the message, which is the same contract copy-assets.js applies to a
 * missing derivative.
 */
const pick = (stem: string): Slide => {
  const hit = [...SUPPLIER_SCREENS, ...BUYER_SCREENS].find((s) => s.src.includes(`/${stem}`));
  if (!hit) throw new Error(`tour.ts: no screen named "${stem}" in crowmark-screens.ts`);
  return hit;
};

/*
 * SIX, AND THE ORDER IS A CONTRACT RATHER THAN A GALLERY. The buyer publishes
 * what it wants evidenced; the supplier answers from what it has already
 * written; the commitment made at award is tracked to dated evidence; the buyer
 * bands the response; the trail records who did it; and the duties with dates
 * on them are carried on a phone. Both sides, in the order the work happens.
 *
 * NOT NINE. Eleven screens are unused and six are shown, because a sweep the
 * reader watches once has to end before it repeats — six at seven seconds is
 * forty-two, and nine would be over a minute of loop for a section that is not
 * the argument, only the picture of it.
 */
export const TOUR: TourSlide[] = [
  { ...pick('buy-1-requirement-builder'), tag: 'Buyer · Requirement builder' },
  { ...pick('sup-5-answer-library'), tag: 'Supplier · Answer library' },
  { ...pick('sup-4-evidence-tracker'), tag: 'Supplier · Evidence tracker' },
  { ...pick('buy-3-evaluation'), tag: 'Buyer · Evaluation' },
  { ...pick('buy-6-reports-audit'), tag: 'Buyer · Reports and audit' },
  { ...pick('sup-8-action-centre'), tag: 'Supplier · Action centre' },
];
