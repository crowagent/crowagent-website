/**
 * heroes.ts — the picture each blog post carries, its provenance, and the
 * accent its category is drawn in.
 *
 * WHY THIS IS A MODULE AND NOT FRONTMATTER. The eight images already exist in
 * `Assets/blog-photos/` with a 400/600/800/1200 WebP ladder and a JPEG
 * fallback, and their provenance is already recorded and verified in
 * `blog/PHOTO-CREDITS.md`. What never existed was anything in the Astro build
 * that REFERENCED them, which is why `scripts/copy-assets.js` — which copies
 * by reachability, not wholesale — has never copied a single one of them into
 * `dist/`. The pictures were licensed, resized, laddered, credited and then
 * left on the floor.
 *
 * The alt text below is not new writing. Every string is the exact `alt` the
 * legacy post already ships, so nothing here is a fresh description of a
 * photograph that someone has to check against the photograph.
 *
 * TWO OF THE EIGHT ARE NOT PHOTOGRAPHS. `frameworks-and-dps-explained` and
 * `find-first-public-sector-contract` are generated brand artwork from the same
 * satori pipeline that renders the OG cards (see PHOTO-CREDITS.md for why those
 * two posts have no honest photographic match). `kind` is what carries that
 * distinction into the rendering, because the duotone treatment must not be
 * applied to artwork: desaturating a piece of art that is already brand-coloured
 * turns a deliberate graphic into a muddy one.
 *
 * A MISSING ENTRY THROWS. Same contract as `blog-related.ts`: a post with no
 * hero would render a row with a hole in it, and a hole is the kind of defect
 * that ships. `heroFor()` fails the build and names the file to edit.
 */

export type HeroKind = 'photo' | 'artwork';

export interface Hero {
  /** Basename under /Assets/blog-photos, no extension. The ladder is derived. */
  file: string;
  /** The legacy post's own alt string, carried across verbatim. */
  alt: string;
  kind: HeroKind;
  /**
   * Photographer and source, rendered as a visible credit. The Pexels Licence
   * does not require attribution; PHOTO-CREDITS.md records it anyway as a
   * matter of practice, and a credit on the page is the version a reader can
   * actually see. Null for artwork, which credits nobody.
   */
  credit: string | null;
}

export const HEROES: Record<string, Hero> = {
  'procurement-act-2023-sme-guide': {
    file: 'uk-parliament-westminster',
    alt: 'The Houses of Parliament and Elizabeth Tower seen from Westminster Bridge',
    kind: 'photo',
    credit: 'Amandeep Singh, Pexels',
  },
  'method-statement-that-scores': {
    file: 'writing-a-tender-response',
    alt: 'Close-up of two people at a desk working through a printed document with a pen',
    kind: 'photo',
    credit: 'RDNE Stock project, Pexels',
  },
  'ppn-002-social-value-guide': {
    file: 'social-value-in-the-community',
    alt: 'Volunteers in matching shirts handing out food and water at a community aid table',
    kind: 'photo',
    credit: 'RDNE Stock project, Pexels',
  },
  'private-sector-rfp-pqq-guide': {
    file: 'bid-team-reviewing-proposal',
    alt: 'Three colleagues around a meeting table reviewing printed documents and a laptop',
    kind: 'photo',
    credit: 'Mizuno K, Pexels',
  },
  'regulatory-updates-2026': {
    file: 'regulatory-updates-2026',
    alt: 'Ring binders, loose papers and notebooks spread across a meeting room table',
    kind: 'photo',
    credit: 'Ron Lach, Pexels',
  },
  'social-value-portal-vs-crowmark': {
    file: 'social-value-portal-vs-crowmark',
    alt: 'Two desktop computers side by side on a wooden desk showing different screens',
    kind: 'photo',
    credit: 'Tranmautritam, Pexels',
  },
  'frameworks-and-dps-explained': {
    file: 'frameworks-and-dps-explained',
    alt: 'CrowAgent brand artwork: a ridge of green and blue bars beside the CrowAgent mark',
    kind: 'artwork',
    credit: null,
  },
  'find-first-public-sector-contract': {
    file: 'find-first-public-sector-contract',
    alt: 'CrowAgent brand artwork: a ridge of violet and teal bars beside the CrowAgent mark',
    kind: 'artwork',
    credit: null,
  },
};

export function heroFor(slug: string): Hero {
  const hero = HEROES[slug];
  if (!hero) {
    throw new Error(
      `No hero image is registered for the blog post "${slug}". ` +
        'Add it to src/components/blog/heroes.ts, and record the licence in blog/PHOTO-CREDITS.md.'
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
