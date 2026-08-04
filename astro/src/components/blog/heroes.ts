/**
 * heroes.ts — the picture each blog post carries, and the accent its category
 * is drawn in.
 *
 * WHY THIS IS A MODULE AND NOT FRONTMATTER. The pictures live in
 * `Assets/blog-photos/` with a 400/600/800/1200 ladder in both WebP and AVIF
 * plus a JPEG fallback, written by `scripts/build-blog-photos.mjs` and nothing
 * else. Their provenance and licence are recorded in `blog/PHOTO-CREDITS.md`.
 * What never existed was anything in the Astro build that REFERENCED them,
 * which is why `scripts/copy-assets.js` — which copies by reachability, not
 * wholesale — never copied one into `dist/`. The pictures were licensed,
 * resized, laddered, credited and then left on the floor.
 *
 * ── THERE IS NO `credit` FIELD, AND THERE IS NO `kind` FIELD ────────────────
 *
 * Both were here until 2026-08-04 and both existed only to drive rendering that
 * has since gone.
 *
 * `credit` was rendered as a visible caption over the picture. The owner's
 * instruction of 2026-08-04 is that the blog images "must not need to mention
 * credits of photographer", and the Pexels Licence agrees: "Attribution is not
 * required." Keeping a second, half-populated copy of the provenance here would
 * be two records of one fact that can disagree, so there is one record and it
 * is `blog/PHOTO-CREDITS.md`. No credit on the page and no record kept are
 * different things; the record is kept.
 *
 * `kind` distinguished photographs from generated brand artwork, and existed so
 * that the duotone treatment could be skipped for artwork. The treatment is
 * gone (see PostImage.astro) and so are the two artwork heroes: on the same
 * instruction, every post now carries a photograph. Nothing downstream can tell
 * the difference any more, so the field would be data nothing reads.
 *
 * The alt text is not decorative. It describes what is IN the photograph, in
 * British English, and never claims anything about a customer, a client or live
 * data.
 *
 * A MISSING ENTRY THROWS. Same contract as `blog-related.ts`: a post with no
 * hero would render a row with a hole in it, and a hole is the kind of defect
 * that ships. `heroFor()` fails the build and names the two files to edit.
 */

export interface Hero {
  /**
   * Basename under /Assets/blog-photos, no extension. The ladder is derived.
   * The name describes the PICTURE, not the post — filenames named after
   * whichever article first used them are how one photograph ended up as the
   * hero of three unrelated posts. See the note in blog/PHOTO-CREDITS.md.
   */
  file: string;
  /** What the photograph shows. */
  alt: string;
}

export const HEROES: Record<string, Hero> = {
  'procurement-act-2023-sme-guide': {
    file: 'uk-parliament-westminster',
    alt: 'The Houses of Parliament and Elizabeth Tower seen from Westminster Bridge',
  },
  'method-statement-that-scores': {
    file: 'writing-a-tender-response',
    alt: 'Close-up of two people at a desk working through a printed document with a pen',
  },
  'ppn-002-social-value-guide': {
    file: 'social-value-in-the-community',
    alt: 'Volunteers in matching shirts handing out food and water at a community aid table',
  },
  'private-sector-rfp-pqq-guide': {
    file: 'bid-team-reviewing-proposal',
    alt: 'Three colleagues around a meeting table reviewing printed documents and a laptop',
  },
  /*
   * REPLACED 2026-08-04. Was `regulatory-updates-2026` — ring binders and loose
   * papers on a meeting-room table, which is a photograph of any office at all.
   * A guide to what changed in the procurement rules is better served by the
   * building the rules come out of.
   */
  'regulatory-updates-2026': {
    file: 'hm-treasury-whitehall',
    alt: 'The colonnaded stone facade and royal coat of arms of a Whitehall government building against a clear blue sky',
  },
  /*
   * REPLACED 2026-08-04. Was `social-value-portal-vs-crowmark` — two iMacs on a
   * designer's desk, one of them unmistakably running a design tool, which is a
   * wrong-subject photograph on a piece comparing two social value reporting
   * platforms.
   */
  'social-value-portal-vs-crowmark': {
    file: 'reviewing-charts-together',
    alt: 'Two colleagues holding printed reports of bar charts side by side, one pointing at a row with a pencil',
  },
  /*
   * REPLACED 2026-08-04, and this one retires a deliberate decision rather than
   * a weak picture, so the decision is written down.
   *
   * These last two posts carried generated CrowAgent brand artwork instead of a
   * photograph, on the argument recorded in blog/PHOTO-CREDITS.md that neither
   * subject had an honest photographic match. That argument was made while
   * every photograph on the page was being desaturated to near-monochrome by
   * the old treatment, which made a drawn graphic and a treated photograph look
   * like the same kind of object. With the treatment gone they no longer do,
   * and a register of eight entries in which six are full-colour photographs
   * and two are abstract bar graphics reads as two of them failing to load.
   *
   * The artwork and its generator are untouched — `npm run build:og` still
   * renders them — so this is reversible by putting the two `file` values back.
   */
  'frameworks-and-dps-explained': {
    file: 'office-files-on-shelves',
    alt: 'Shelves of red and blue lever-arch files, each with a handwritten label on its spine',
  },
  'find-first-public-sector-contract': {
    file: 'workshop-owner-at-a-laptop',
    alt: 'A tradesperson typing on a laptop at a workbench, with hand tools and offcuts beside it',
  },
};

export function heroFor(slug: string): Hero {
  const hero = HEROES[slug];
  if (!hero) {
    throw new Error(
      `No hero image is registered for the blog post "${slug}". ` +
        'Add it to src/components/blog/heroes.ts, build its derivatives with ' +
        'scripts/build-blog-photos.mjs, and record the licence in blog/PHOTO-CREDITS.md.'
    );
  }
  return hero;
}

/**
 * CATEGORY ACCENT — read this before changing it.
 *
 * B1 tints each category label. The palette rule in specs/DESIGN-DECISIONS.md
 * section 3 reserves teal for verified, violet/orchid for refused or flagged
 * and cyan for interactive; a blog category is none of those, and the spec
 * flags exactly this about B1/B2/B3 ("Pick knowingly"). The owner picked B1
 * with that flag in front of them, so the tint ships.
 *
 * What is NOT arbitrary is WHICH label gets which hue. This is an explicit map
 * rather than a rotation by row index, so a category is the same colour every
 * time it appears and the colour identifies the category rather than the
 * position in the list. Cyan is absent because it is reserved for interactive.
 *
 * To retire the tint entirely, delete this map and the three `--ledger-accent`
 * branches in pages/blog/index.astro; the labels fall back to muted, which is
 * the B4 treatment.
 */
export type CategoryAccent = 'teal' | 'violet' | 'pink';

const CATEGORY_ACCENTS: Record<string, CategoryAccent> = {
  'PPN 002': 'teal',
  'Method statements': 'teal',
  'Procurement Act 2023': 'teal',
  Frameworks: 'violet',
  'Getting started': 'violet',
  'Private sector bidding': 'pink',
  'PPN 002 & Social Value': 'pink',
};

/** Anything unmapped stays muted rather than picking a hue at random. */
export function accentFor(category: string): CategoryAccent | null {
  return CATEGORY_ACCENTS[category] ?? null;
}
