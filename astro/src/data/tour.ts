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
 * ── DESKTOP AND TABLET, AND THAT IS A CORRECTION, 2026-08-31 ──────────────
 *
 * THIS BLOCK USED TO BE HEADED "ALL THREE DEVICE SIZES, WHICH IS THE ARGUMENT
 * THE TOUR MAKES", and it argued that a portrait phone render sitting centred
 * in the 16:10 stage said something the desktop set could not. The owner has
 * now rejected that twice, in the same words both times, and the second is
 * unambiguous: a phone screen inside a desktop frame is wrong at any size.
 *
 * `.wt__stage` IS A DESKTOP BEZEL. It has no address bar, which is why a gate
 * keyed on browser chrome would have walked past this, but it is a 16/10 device
 * frame with a caption plate across its foot, and a 780x1688 render in the
 * middle of it reads as a phone photographed on a monitor. `object-fit: contain`
 * made that display tidily rather than making it right.
 *
 * SO THE TOUR IS FIVE, DESKTOP AND TABLET. The tablet drawings stay: 2048x1536
 * is landscape, it letterboxes modestly inside 16/10, and a tablet in a desktop
 * frame is the same class of object at a different width. The one slide that
 * went is `sup-8-action-centre`, and what the tour loses with it is recorded
 * beside the list below.
 *
 * `scripts/check-device-frames.js` NOW FAILS THE BUILD ON A PORTRAIT IMAGE
 * INSIDE EITHER DESKTOP FRAME, measured from the file's own header, so this
 * cannot come back by being re-added to the registry.
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
 * FIVE, AND THE ORDER IS A CONTRACT RATHER THAN A GALLERY. The buyer publishes
 * what it wants evidenced; the supplier answers from what it has already
 * written; the commitment made at award is tracked to dated evidence; the buyer
 * bands the response; and the trail records who did it. Both sides, in the
 * order the work happens.
 *
 * ── WHAT THE SIXTH SLIDE WAS, AND WHAT ITS REMOVAL COSTS ───────────────
 *
 * `sup-8-action-centre`, tagged "Supplier · Action centre", captioned "Every
 * duty with a date on it, in one queue, on the device it will be remembered
 * on". It is the only slide either section ever carried that showed the product
 * AFTER the bid is won and the work is being done to a deadline, and the tour
 * is thinner for losing it. That is a real cost and it is written down here
 * rather than absorbed: the fix is a landscape rendering of that screen, and the
 * moment one exists this slide comes back.
 *
 * WHAT IT DOES NOT COST. The order above still runs both sides of one contract
 * from publication to audit, and nothing else on the page depended on there
 * being a phone in this section: `/crowmark` says in its own words that the
 * product runs on a phone, and `/partners` SHOWS this exact screen, in a
 * portrait card, with no desktop frame around it.
 *
 * NOT NINE. Eleven screens went unused when this was six, and the sweep is short
 * on purpose: a sweep the reader watches once has to end before it repeats, five
 * at seven seconds is thirty-five, and nine would be over a minute of loop for a
 * section that is not the argument, only the picture of it.
 */
export const TOUR: TourSlide[] = [
  { ...pick('buy-1-requirement-builder'), tag: 'Buyer · Requirement builder' },
  { ...pick('sup-5-answer-library'), tag: 'Supplier · Answer library' },
  { ...pick('sup-4-evidence-tracker'), tag: 'Supplier · Evidence tracker' },
  { ...pick('buy-3-evaluation'), tag: 'Buyer · Evaluation' },
  { ...pick('buy-6-reports-audit'), tag: 'Buyer · Reports and audit' },
];
