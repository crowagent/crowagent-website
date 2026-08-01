import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** A single accordion FAQ entry, reused for the FAQPage JSON-LD it also feeds. */
const faqEntry = z.object({
  question: z.string(),
  answer: z.string(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string(),
    readingTime: z.number().optional(),
    draft: z.boolean().default(false),
    /*
     * FAQs are MODELLED, not hand-written into the body. 5 of the 8 legacy
     * posts carry an FAQPage JSON-LD block, and a parity run found none of it
     * survived the port. Putting the pairs in frontmatter means the visible
     * accordion and the structured data are generated from ONE source, so they
     * cannot drift apart the way a hand-maintained JSON-LD block always
     * eventually does.
     */
    faq: z.array(faqEntry).optional(),
  }),
});

/**
 * /compare/* — honest, sourced CrowMark-vs-competitor pages.
 *
 * og:title/twitter:title equal the bare `title` (no " | CrowAgent" suffix)
 * on every legacy compare page, so the page derives them from `title`
 * directly. og:description and the Article JSON-LD description are each a
 * DIFFERENT hand-written sentence from the meta `description`, so all three
 * are kept distinct rather than collapsed into one, which would mean
 * rewording one of three already-published sentences.
 */
const compare = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/compare' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ogDescription: z.string(),
    articleDescription: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    competitor: z.string(),
    eyebrow: z.string(),
    heroDescription: z.string(),
    ogImage: z.string(),
    ogImageAlt: z.string(),
    ctaHeadline: z.string(),
    ctaSubLine1: z.string(),
    ctaSubLine2: z.string(),
    faq: z.array(faqEntry),
  }),
});

/**
 * /sectors/* — CrowMark-for-a-sector landing pages.
 *
 * Only the four sectors with a real page on disk (construction, education,
 * facilities, highways) are modelled as content; the other five cards on
 * the /sectors hub link straight to /crowmark and stay hand-written there,
 * same as the legacy hub.
 */
const sectorStep = z.object({
  accent: z.enum(['teal', 'violet', 'sky']),
  verb: z.string(),
  say: z.string(),
});

const sectors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/sectors' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ogDescription: z.string(),
    ogImageAlt: z.string(),
    sectorLabel: z.string(),
    heroTitleAccent: z.string(),
    heroDescription: z.string(),
    contextEyebrow: z.string(),
    contextHeading: z.string(),
    helpsHeading: z.string(),
    steps: z.array(sectorStep),
    helpsIntro: z.string(),
    figure: z.object({
      avif: z.string(),
      webp: z.string(),
      png: z.string(),
      width: z.number(),
      height: z.number(),
      alt: z.string(),
      caption: z.string(),
    }),
    faqHeading: z.string(),
    finalCtaSub: z.string(),
    faq: z.array(faqEntry),
  }),
});

/**
 * /glossary/* term detail pages. The index (all 23 terms) stays a static
 * page, same as the legacy hub, because 21 of those 23 terms have no
 * standalone page to route to.
 */
const glossary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/glossary' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
    ogImage: z.string(),
    ogImageAlt: z.string(),
    termName: z.string(),
    termTagline: z.string(),
    heroDescription: z.string(),
    definedTermDescription: z.string(),
    /** The sidebar's first card: "Related tool" (ppn-002) or "Related term" (toms-framework). */
    sidebarKicker: z.string(),
    sidebarTitle: z.string(),
    sidebarBody: z.string(),
    sidebarHref: z.string(),
    sidebarCta: z.string(),
    /** The sidebar's second card body — constant kicker/title ("Full product" / "CrowMark"), variable body. */
    productCardBody: z.string(),
    readMoreHref: z.string(),
    readMoreLabel: z.string(),
    readMoreBody: z.string(),
    ctaHeading: z.string(),
    ctaSub: z.string(),
  }),
});

export const collections = { blog, compare, sectors, glossary };
