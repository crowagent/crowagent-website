/**
 * crowmark-screens.ts — the sixteen drawn CrowMark product screens, as data.
 *
 * Eight supplier and eight buyer, drawn in Figma on 2026-08-03 and approved by
 * the owner the same day. The full node table, the token research they were
 * built from and the traps hit while drawing them are in
 * specs/PRODUCT-SCREENS-FIGMA.md. The files were exported at 2x and published
 * as PNG/WebP/AVIF triples in Assets/shots/figma-v2/, and that directory's
 * manifest.json records the node, the pixel size and the byte size of each.
 *
 * ── WHY THIS IS A MODULE AND NOT TWO ARRAYS IN TWO PAGES ────────────────────
 *
 * /crowmark and /crowmark-buyers each show one of these sets, and the two pages
 * are separately maintained. Alt text and captions on this site are governed by
 * rules that are easy to break one page at a time — see below — so the sixteen
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
 *    itself — the supplier fit score says in so many words that it "is not a
 *    probability of award, and CrowMark does not produce one" — and those
 *    sentences are quoted rather than paraphrased, because a paraphrase of a
 *    refusal is a weaker refusal.
 *
 * ── AND ONE RULE ABOUT THE ORDER ────────────────────────────────────────────
 *
 * Each set runs largest device first: four desktop screens, then two tablet,
 * then two phone. That is not a size preference, it is what keeps the frame
 * useful — the stage in Carousel.astro is 16/10, the desktop screens fill it
 * exactly, and a reader who arrives on slide 1 should see the screen that
 * carries the argument rather than a phone standing in the middle of a stage.
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
const V = '?v=20260805a';

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

/* The three drawn device sizes, at the 2x they were exported at. Written once:
   a width and height typed out sixteen times is a width and height that will
   eventually disagree with the file. */
const DESKTOP = { width: 2880, height: 1800 };
const TABLET = { width: 2048, height: 1536 };
const MOBILE = { width: 780, height: 1688 };

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
    alt: 'The CrowMark tender questions screen. A tender is broken into its scored questions, each with a category, a word limit, a weighting and a draft action. A banner states the grounding boundary: answers are grounded only in your own answer library, the published requirement and your confirmed commitments; every figure comes from computed commitments and is never invented; and a named human approves every answer before it is submitted.',
    caption: 'Award questions with their weightings, above a drafter told where every figure has to come from',
  },
  {
    src: shot('sup-4-evidence-tracker'),
    ...DESKTOP,
    alt: 'The CrowMark evidence tracker, following a won contract into delivery. A headline bar gives the evidence coverage for this month against committed measures, and a card per measure lists the dated evidence filed against it with an upload control. A statutory strip runs along the foot covering section 52 KPIs, the section 71 cycle and the PPN 002 minimum weighting.',
    caption: 'After award, each commitment tracked to the dated evidence that proves it, month by month',
  },
  {
    src: shot('sup-5-answer-library'),
    ...TABLET,
    alt: 'The CrowMark answer library at tablet width. Previously submitted answers are listed under the note that the drafter grounds new answers in these, and that answers marked as coming from a won bid rank higher as sources. A search field, a sort control and a won-bids filter sit above the list, and each answer carries topic tags.',
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
  {
    src: shot('sup-7-opportunity-detail'),
    ...MOBILE,
    alt: 'A single opportunity on a phone: the buying authority, the value, the sector, the relevance percentage, the register it came from and the closing date. A fit card below gives the score and three banded bars, and closes with the line “fit context, not a probability of award”. Open in CrowMark and Save for later sit above a bottom tab bar.',
    caption: 'The same notice and the same fit context on a phone, with the same line about what it is not',
  },
  {
    src: shot('sup-8-action-centre'),
    ...MOBILE,
    alt: 'The CrowMark action centre on a phone. A due-this-week card counts the open items, then a card per task carries a type chip, a countdown and the contract it belongs to: an evidence upload, a section 71 assessment to publish, a drafted answer to approve and a social value baseline to confirm.',
    caption: 'Every duty with a date on it, in one queue, on the device it will be remembered on',
  },
];

/** The buyer set, in the order an authority meets the work. */
export const BUYER_SCREENS: Slide[] = [
  {
    src: shot('buy-1-requirement-builder'),
    ...DESKTOP,
    alt: 'The CrowMark social value requirement builder for a buying authority. Four figures head the page: the social value weighting set against the PPN 002 minimum, the number of criteria published, the total weight split across quality, price and social value, and the responses received. The award criteria table lists each criterion with its TOMs reference, its weighting and the evidence a supplier must supply.',
    caption: 'Criteria, weightings and the evidence each one demands, set against the PPN 002 minimum',
  },
  {
    src: shot('buy-2-response-review'),
    ...DESKTOP,
    /* The buyer-side refusal, quoted. Same reason as sup-3. */
    alt: 'The CrowMark response review screen, one criterion against one response. A banner states: CrowMark locates the passage that answers this criterion and shows you where it came from; it does not score, rank or recommend; the band is yours to set. A panel quotes the supplier verbatim and cites it to a section and page of the response document. On the right, four bands are offered under the note that there are no half marks and no rounding, with an audit line naming the evaluator.',
    caption: 'The passage that answers the criterion, located and cited, with the band left to a named evaluator',
  },
  {
    src: shot('buy-3-evaluation'),
    ...DESKTOP,
    alt: 'The CrowMark evaluation grid, banding suppliers against criteria. Every cell is a band rather than a number, under a legend reading four bands, no half marks and no rounding. A panel below flags where two evaluators disagreed by more than one band. The closing statement reads: CrowMark located the passage behind each one; it did not set, rank or recommend any band.',
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
    ...TABLET,
    alt: 'The CrowMark reports and audit trail at tablet width. Four figures summarise the trail, with a seven-year retention marker and an export action, above a table listing each action with the person who took it and a timestamp. The closing line reads: every band carries the evaluator who set it and the time they set it; nothing in this trail was written by the model.',
    caption: 'Every band, every change and every export, against the person and the moment it happened',
  },
  {
    src: shot('buy-7-evaluator-queue'),
    ...MOBILE,
    alt: 'An evaluator queue on a phone, showing how many responses have been banded on the current criterion. Each supplier in the queue shows either a located match with a band-it action, no passage located, or the band already set, above a bottom tab bar.',
    caption: 'The evaluation queue on a phone, with what was located and what was not stated plainly',
  },
  {
    src: shot('buy-8-criterion-detail'),
    ...MOBILE,
    alt: 'One criterion banded on a phone. A located-passage card quotes the response, cites it to a section and page of the response document, and states underneath: CrowMark located this passage, it did not score it. Under your band, four radio options appear above a save-band-and-continue button.',
    caption: 'One passage, one criterion, four bands, and a note that CrowMark located it but did not score it',
  },
];
