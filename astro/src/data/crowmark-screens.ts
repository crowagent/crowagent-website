/**
 * crowmark-screens.ts: the drawn CrowMark product screens, as data.
 *
 * SIXTEEN WERE DRAWN in Figma on 2026-08-03 and approved by the owner the same
 * day, eight supplier and eight buyer. TWELVE ARE IN THE TWO SETS BELOW, six
 * and six: the four phone renders came out on 2026-08-31 and the note above
 * SUPPLIER_SCREENS says why. The files are all still on disk, so "sixteen
 * drawn" stays true wherever this file says it. The full node table, the token research they were
 * built from and the traps hit while drawing them are in
 * specs/PRODUCT-SCREENS-FIGMA.md. The files were exported at 2x and published
 * as PNG/WebP/AVIF triples in Assets/shots/figma-v2/, and that directory's
 * manifest.json records the node, the pixel size and the byte size of each.
 *
 * ── WHY THIS IS A MODULE AND NOT TWO ARRAYS IN TWO PAGES ────────────────────
 *
 * /crowmark and /crowmark-buyers each show one of these sets, and the two pages
 * are separately maintained. Alt text and captions on this site are governed by
 * rules that are easy to break one page at a time (see below), so the sixteen
 * strings that have to obey them live in one file where they can be read
 * against each other, rather than eight in each page where they cannot.
 *
 * ── THE THREE RULES EVERY STRING BELOW OBEYS ────────────────────────────────
 *
 * 1  NOTHING CLAIMS THESE ARE THE LIVE PRODUCT. They are drawn. No caption or
 *    alt string says "screenshot", "live", "a customer", "a client", or names
 *    an account. That is OA-16, and it is the reason the previous generation of
 *    captures was a recorded credibility defect in the first place.
 *
 * 2  NOTHING LABELS THEM "ILLUSTRATIVE" OR "SAMPLE DATA" EITHER. Owner
 *    decision, 2026-08-03: the site calls the data question out separately, and
 *    saying it twice weakens both. This is not an oversight and it is not a
 *    licence to imply the opposite of rule 1; the resolution of the two is that
 *    the text describes what the screen SHOWS and makes no claim about what it
 *    is evidence of.
 *
 * 3  NO WIN RATES, EVER, AND NO PROBABILITY OF AWARD. CrowMark is framed as fit
 *    and coverage. Two of these screens put that refusal on the interface
 *    itself (the supplier fit score says in so many words that it "is not a
 *    probability of award, and CrowMark does not produce one"), and those
 *    sentences are quoted rather than paraphrased, because a paraphrase of a
 *    refusal is a weaker refusal.
 *
 * ── AND ONE RULE ABOUT THE ORDER ────────────────────────────────────────────
 *
 * Each set runs largest device first: four desktop screens, then two tablet.
 * That is not a size preference, it is what keeps the frame useful. The stage
 * in Carousel.astro is 16/10, the desktop screens fill it exactly, and a reader
 * who arrives on slide 1 should see the screen that carries the argument.
 *
 * IT USED TO END "then two phone", AND THE SENTENCE AFTER IT ALREADY SAID WHY
 * THAT WAS WRONG: a reader should not meet "a phone standing in the middle of a
 * stage". The rule was written correctly and then broken by the set it governs.
 * The four phone renders came out on 2026-08-31, and the note above
 * SUPPLIER_SCREENS is the account of it.
 * Within the desktop four, the order is the order the work happens in.
 */
import type { Slide } from '../components/ui/Carousel.astro';

/*
 * Every path carries the same cache-buster. These files are new at this path,
 * so today nothing is cached under it; the query is here so that the NEXT
 * re-export has an obvious thing to bump. /Assets/* is served immutable for a
 * year, and a corrected screen shipped without a new URL reaches nobody who
 * already holds the old one.
 */
const V = '?v=20260831a';

/*
 * ── THE LIGHT VARIANT, OWNER DECISION 2026-08-05 ────────────────────────────
 *
 * "light mode images looks great, apply them in all the website carousels by
 * replacing dark version."
 *
 * WHY IT IS A CONSTANT AND NOT SIXTEEN RENAMED STRINGS. Every carousel on the
 * site reads its slides from this file: the homepage showcase through
 * ProductScreens.astro, and both product pages directly. One switch here moves
 * all of them together and cannot leave a page on the other variant, which is
 * exactly what sixteen hand-edited paths would eventually do. Setting this to
 * '' returns the whole site to the dark set in one edit; both sets are on disk
 * and the dark files were not touched.
 *
 * WHY LIGHT AT ALL, and it is a legibility decision rather than a taste one.
 * Board item A-115 reported the product screens as unreadable in the carousels.
 * Measured, the cause was NOT resolution: oversample is 1.48x at 1440 and about
 * 1.0x at 834 and 390, so the asset was already over-supplied for its slot and
 * a 2x asset would have sharpened nothing. A full desktop application UI drawn
 * at 2880px and shown at 653px puts its type at roughly 22 per cent of design
 * size, and at that size CONTRAST is the only lever left. A bright screen on a
 * dark page has it; a dark screen on a dark page does not.
 *
 * THE CONTENT DID NOT CHANGE, ONLY THE COLOUR, which is why every `alt` and
 * every caption below is untouched and why the manifest carries each light
 * record's `shows` string verbatim from its dark counterpart. Two descriptions
 * of one screen would drift.
 *
 * The light set is 7 to 18 per cent LARGER than the dark, which was checked
 * rather than assumed: the light masters carry 1,544 unique colours against the
 * dark set's 47, because the dark screens are palettised flat fills while the
 * light ones use soft shadows and tinted chips. That is the encoder having more
 * to carry, not an export fault.
 */
/*
 * EXPORTED, because a second file has to agree with it. ProductScreens.astro
 * looks its five slides up by file name and FAILS THE BUILD when one stops
 * resolving, which is deliberate: a renamed export would otherwise ship an
 * empty frame with no alt text, a WCAG failure that looks fine in a diff. That
 * guard fired the moment this switched to '-light' and the build stopped, which
 * is the system working. It is exported rather than reproduced there so the two
 * cannot disagree about which variant is current.
 */
export const VARIANT = '-light';

/* The cache-buster above moved 20260804a -> 20260805a with this switch. Strictly
   it did not have to: the light files sit at new paths, so nothing is cached
   under them. It is bumped anyway because the two are one change, and a variant
   switch that left the version alone would make the next reader wonder which of
   the two facts the old date was describing. */
const shot = (name: string) => `/Assets/shots/figma-v2/${name}${VARIANT}.png${V}`;

/**
 * ── THE WIDTH LADDER, MOVED HERE 2026-08-31 SO A SECOND CONSUMER CAN HAVE IT ─
 *
 * WHY THIS FILE. The rungs on disk are written by
 * `scripts/build-product-screens.mjs` for THESE sixteen screens and no others,
 * and this module is already the single record of what those screens are: the
 * paths, the cache-buster, the light variant and the three device sizes. Which
 * widths exist beside a master is a fact about the same assets, so it belongs
 * with them rather than inside whichever component happened to need it first.
 *
 * THE DEFECT THAT FORCED THE MOVE. `ui/Carousel.astro` had this ladder and
 * `sections/WorkstationTour.astro` had NONE, so the tour served the full 2x
 * master at every viewport: measured on the built homepage at 390, its six
 * slides fetched 440,673 B of masters into an image box 314 CSS px wide, where
 * the 400w rungs that already exist on disk would have cost 137,436 B. Roughly
 * 303 KB per phone visit, for files the build had already produced. One
 * component knowing the mechanism and its neighbour not knowing it is the
 * duplication cost paid in advance, so the ladder is stated once here and both
 * import it.
 *
 * IT IS STILL PostImage.astro'S FOUR WIDTHS AND MUST CHANGE WITH THEM. Adding a
 * rung means writing the file first: `scripts/copy-assets.js` reads srcset and
 * fails the build on a reference that is not on disk, so the mistake stops a
 * build rather than reaching a reader.
 *
 * 0.7 IS MEASURED AND ITS ARGUMENT IS IN Carousel.astro, beside the `<source>`
 * elements: these are 2x renders of flat UI panels, so a rung close to the
 * master's own width costs almost as much as the master and buys nothing. The
 * number is not repeated as a claim here, only spent.
 */
const LADDER = [400, 600, 800, 1200] as const;
const MAX_OF_MASTER = 0.7;

/** One derivative's path. `null` width means the master itself. */
export const variant = (src: string, ext: 'avif' | 'webp', width: number | null) =>
  src.replace(/\.png(\?|$)/, `${width === null ? '' : `-${width}w`}.${ext}$1`);

/** Every AVIF rung that exists for a master of this width, plus the master. */
export const avifSrcset = (src: string, masterWidth: number) =>
  [
    ...LADDER.filter((w) => w <= masterWidth * MAX_OF_MASTER).map(
      (w) => `${variant(src, 'avif', w)} ${w}w`,
    ),
    `${variant(src, 'avif', null)} ${masterWidth}w`,
  ].join(', ');

/* The three drawn device sizes, at the 2x they were exported at. Written once:
   a width and height typed out sixteen times is a width and height that will
   eventually disagree with the file. */
const DESKTOP = { width: 2880, height: 1800 };
const TABLET = { width: 2048, height: 1536 };
/* [A-225 2026-08-31] TABLET_WIDE is a tablet-resolution drawing CROPPED to 16:10,
   and it exists because the Workstation tour stage is 16:10 and two of its five
   slides were not.

   The two screens it covers were exported 2048x1536, so `object-fit: contain`
   pillarboxed them: the owner saw bars down the left and right of Answer library
   and Reports and audit while the three desktop slides beside them fitted exactly.
   Before the tour's contain rule was repaired, the same two were being CROPPED
   118px at top AND foot, so this has been wrong in one direction or the other
   the whole time.

   256px came off the BOTTOM ONLY, which is empty ground in both drawings. Every
   element survives, checked by eye on all four files rather than assumed: the
   breadcrumb, the title, the controls, the full list or table, and the footnote.
   A centred crop would have taken the header, which is the half a reader uses to
   tell one screen from another.

   THE OTHER TABLET DRAWINGS ARE UNTOUCHED. sup-6-insights and
   buy-5-supplier-comparison are still 4:3 and still `...TABLET`, because they
   appear only in the /crowmark carousels, which give every slide its own
   `--screen-ratio` and letterbox nothing. Cropping them would be changing an
   asset to satisfy a frame it never enters. */
const TABLET_WIDE = { width: 2048, height: 1280 };
/* THE PHONE SIZE IS GONE WITH THE FOUR SCREENS THAT USED IT. See the note above
   SUPPLIER_SCREENS. It is not left declared and unused: an unused constant is
   how a removed thing quietly grows back, and the four masters are still on
   disk if a phone frame is ever built to hold them. */

/*
 * ── THE FOUR PHONE SCREENS ARE NOT IN THESE SETS, 2026-08-31 ────────────────
 *
 * OWNER, FOR THE SECOND TIME: *"i can again see the issue you are repeating for
 * carousels where mobile screens shots are being used in Workstation tour, why
 * the fuck you do this? you must make this hard rule and correct"*.
 *
 * `sup-7-opportunity-detail`, `sup-8-action-centre`, `buy-7-evaluator-queue`
 * and `buy-8-criterion-detail` are 780x1688 PORTRAIT phone renders. Every
 * surface that consumed these two arrays presents a screen AS A DESKTOP:
 * `ui/Carousel.astro` draws a browser window with three traffic lights and the
 * address app.crowagent.ai, and `sections/WorkstationTour.astro` draws a 16/10
 * bezel. A phone screen inside a desktop window is wrong by definition, at any
 * size, however well it is fitted.
 *
 * AN EARLIER PASS ON THE SAME DAY FIXED THE WRONG THING AND MUST NOT BE
 * REPEATED. It found that `object-fit: contain` had never run above 767px in
 * the tour, so the phone render was showing its top eleven per cent, and it
 * made the whole render display letterboxed instead. That was a true finding
 * and a real repair of a different defect. The asset was still a phone.
 * **Making a wrong asset display tidily is not fixing it.**
 *
 * WHAT WAS LOOKED FOR FIRST, AND WHAT WAS FOUND. A landscape capture of any of
 * these four screens would have been the better answer, so the repository was
 * searched before anything was removed: `Assets/shots/_raw`, `/dark`, `/figma`,
 * `/v2`, `/devices`, `/mobile`, `/tablet`, `Assets/product-shots` and
 * `concepts/img`. There is no desktop rendering of an opportunity detail, an
 * action centre, an evaluator queue or a criterion detail anywhere. The
 * landscape sets that do exist are the PREVIOUS generation, dark and drawn to a
 * different design, and putting one beside the light figma-v2 screens would
 * have swapped one visible wrongness for another.
 *
 * AND NOTHING WAS DRAWN TO FILL THE GAP. Inventing a desktop screen means
 * inventing the figures on it, two sections away from a component whose entire
 * argument is that this product refuses a figure it cannot trace. That is not
 * a scruple, it is the same rule the rest of this file is written under.
 *
 * SO THE FOUR ARE OUT OF THE SETS AND THE FILES ARE STILL ON DISK. They are
 * good drawings shown in the wrong frame. `/partners` renders
 * `sup-8-action-centre` in a portrait card with no browser around it, which is
 * the honest way to show a phone and is untouched by this. If a phone frame is
 * ever built, all four come back through it.
 *
 * GUARDED BY `scripts/check-device-frames.js`, WHICH SHIPS WITH THIS CHANGE. It
 * reads the intrinsic size out of each file's own header and fails the build on
 * a portrait image inside either desktop frame. Not a filename, not the width
 * and height attributes, not a CSS property: all three can be right while the
 * picture is wrong, which is how this survived two reports.
 */
/** The supplier set, in the order a supplier meets the work. */
export const SUPPLIER_SCREENS: Slide[] = [
  {
    src: shot('sup-1-discover'),
    ...DESKTOP,
    alt: 'The CrowMark Discover feed. Published notices are listed with the buying authority, the contract value, the sector, the publication date and the register they came from, each carrying a relevance percentage. A filter row offers the two registers, sector, value and relevance, and every notice offers Open in CrowMark, a link out to the source register, and Save.',
    caption: 'Notices from Find a Tender and Contracts Finder, scored against what you can evidence today',
  },
  {
    src: shot('sup-3-bid-no-bid'),
    ...DESKTOP,
    /* The refusal is quoted, not summarised. See rule 3 in the header. */
    alt: 'The CrowMark bid or no-bid screen. A fit score sits beside the contract value, the days to deadline and the number of recorded prior contracts, and a data confidence panel states: “This is FIT context. It is not a probability of award, and CrowMark does not produce one.” Below, the score is broken down component by component, each with a band, a points total and a one-line reason.',
    caption: 'Fit broken down component by component, stated as context and never as a probability of award',
  },
  {
    src: shot('sup-2-tender-questions'),
    ...DESKTOP,
    alt: 'The CrowMark tender questions screen. A tender is broken into its scored questions, each with a category, a word limit, a weighting and a draft action. A banner states the grounding boundary. Answers are grounded only in your own answer library, the published requirement and your confirmed commitments. Every figure comes from computed commitments and is never invented. And a named human approves every answer before it is submitted.',
    caption: 'Award questions with their weightings, above a drafter told where every figure has to come from',
  },
  {
    src: shot('sup-4-evidence-tracker'),
    ...DESKTOP,
    alt: 'The CrowMark evidence tracker, following a won contract into delivery. A headline bar gives the evidence coverage for this month against committed measures, and a card per measure lists the dated evidence filed against it with an upload control. A statutory strip runs along the foot covering section 52 KPIs, the section 71 cycle and the statutory minimum weighting.',
    caption: 'After award, each commitment tracked to the dated evidence that proves it, month by month',
  },
  {
    src: shot('sup-5-answer-library'),
    ...TABLET_WIDE,
    alt: 'The CrowMark answer library. Previously submitted answers are listed under the note that the drafter grounds new answers in these, and that answers marked as coming from a won bid rank higher as sources. A search field, a sort control and a won-bids filter sit above the list, and each answer carries topic tags.',
    caption: 'Your own submitted answers, held as the sources a new draft is grounded in',
  },
  {
    src: shot('sup-6-insights'),
    ...TABLET,
    /* NO WIN-RATE PANEL. The real analytics route has one; it was deliberately
       left out of the drawing, and it must not be described back in here.
       See specs/PRODUCT-SCREENS-FIGMA.md, "What the Insights rebuild found". */
    alt: 'The CrowMark insights dashboard at tablet width. Four figures head the screen: contracts and sectors, social value delivered on won bids, evidence completion against committed measures, and section 71 assessments due. Panels below cover contracts by status, the pipeline, quick stats and sector benchmarks, under a footnote that every figure is drawn from your own contract records and from published awards.',
    caption: 'What has been committed, delivered and evidenced, drawn from your own records and published awards',
  },
];

/** The buyer set, in the order an authority meets the work. */
export const BUYER_SCREENS: Slide[] = [
  {
    src: shot('buy-1-requirement-builder'),
    ...DESKTOP,
    alt: 'The CrowMark social value requirement builder for a buying authority. Four figures head the page: the social value weighting set against the statutory minimum, the number of criteria published, the total weight split across quality, price and social value, and the responses received. The award criteria table lists each criterion with its TOMs reference, its weighting and the evidence a supplier must supply.',
    caption: 'Criteria, weightings and the evidence each one demands, set against the statutory minimum',
  },
  {
    src: shot('buy-2-response-review'),
    ...DESKTOP,
    /* The buyer-side refusal, quoted. Same reason as sup-3. */
    alt: 'The CrowMark response review screen, one criterion against one response. A banner states that CrowMark locates the passage that answers this criterion and shows you where it came from. It does not score, rank or recommend. The band is yours to set. A panel quotes the supplier verbatim and cites it to a section and page of the response document. On the right, four bands are offered under the note that there are no half marks and no rounding, with an audit line naming the evaluator.',
    caption: 'The passage that answers the criterion, located and cited, with the band left to a named evaluator',
  },
  {
    src: shot('buy-3-evaluation'),
    ...DESKTOP,
    alt: 'The CrowMark evaluation grid, banding suppliers against criteria. Every cell is a band rather than a number, under a legend reading four bands, no half marks and no rounding. A panel below flags where two evaluators disagreed by more than one band. The closing statement reads that CrowMark located the passage behind each one. It did not set, rank or recommend any band.',
    caption: 'Four bands, no half marks and no rounding, with every disagreement sent to moderation',
  },
  {
    src: shot('buy-4-delivery-oversight'),
    ...DESKTOP,
    alt: 'The CrowMark delivery oversight screen, tracking commitments made at award through to the evidence that proves them. Four figures head the page, covering contracts in delivery, measures committed, evidence received this month and section 71 assessments due. A table gives each supplier an evidence percentage, a status of on track, at risk or behind, and its next section 71 date.',
    caption: 'What each supplier committed at award, against what they have since evidenced',
  },
  {
    src: shot('buy-5-supplier-comparison'),
    ...TABLET,
    alt: 'The CrowMark supplier comparison at tablet width, putting shortlisted suppliers side by side. Each column carries an overall band and the same measures, with a quantified social value total. A footnote states that figures are quoted from each response and are not adjusted, normalised or ranked by CrowMark, and that the overall band is the moderated evaluator band.',
    caption: 'Committed measures side by side, quoted from each response and neither normalised nor ranked',
  },
  {
    src: shot('buy-6-reports-audit'),
    ...TABLET_WIDE,
    alt: 'The CrowMark reports and audit trail. Four figures summarise the trail, with a seven-year retention marker and an export action, above a table listing each action with the person who took it and a timestamp. The closing line reads that every band carries the evaluator who set it and the time they set it. Nothing in this trail was written by the model.',
    caption: 'Every band, every change and every export, against the person and the moment it happened',
  },
];
