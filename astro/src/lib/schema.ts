/**
 * Structured data, DERIVED from the content model.
 *
 * ARCHITECTURAL POSITION. Structured data is not decoration a page author
 * remembers to add, it is a projection of what the content already is. A blog
 * entry IS a BlogPosting: its headline, dates and description are already in
 * frontmatter and already validated by the Zod schema in content.config.ts.
 * Asking each route to hand-assemble a JSON-LD object would duplicate that
 * knowledge, and the duplicate would drift.
 *
 * So the rule is: a collection knows its own schema types. Add a post, get
 * correct structured data for free. Nothing to remember, nothing to review.
 *
 * WHY THIS FILE EXISTS AT ALL. A parity run against the legacy site found the
 * eight ported blog posts emitting only an Organization node, where legacy
 * emitted BlogPosting and FAQPage. That is live SEO surface and it would have
 * been destroyed silently at cutover. The other three collections already
 * matched, so this closes the gap by making derivation the mechanism rather
 * than by patching eight files.
 *
 * Organization and WebSite are appended by Seo.astro on every page, so they are
 * deliberately NOT built here.
 */
import { SITE } from '../data/site';
import { routeUrl as abs } from './route-url';

/*
 * `abs` USED TO BE DEFINED HERE, AND IT WAS THE SECOND COPY OF ONE RULE:
 *
 *     const abs = (path) => new URL(path, SITE.origin).href.replace(/\/$/, '') || SITE.origin;
 *
 * Seo.astro derived the canonical with its own near-identical expression. Both
 * stripped the trailing slash, so both were wrong together when the deploy
 * source moved to a directory-format build and Cloudflare started adding the
 * slash instead, which is exactly why the duplication was invisible. The
 * BreadcrumbList items and BlogPosting @ids below were pointing at a 308 on
 * every route, from inside the structured data of the page they describe.
 *
 * It is imported from lib/route-url.ts now, under the same local name so the
 * call sites below read as they always did. That file holds the measurement and
 * the reason the URL moves rather than the server.
 */

export interface BlogPostingInput {
  title: string;
  description: string;
  path: string;
  publishDate: Date;
  updatedDate?: Date;
  image?: string;
  /** A named human author, where the post has one. See `author` below. */
  author?: string;
  /** That author's role, kept out of `name` so the Person is named accurately. */
  authorRole?: string;
  /** Person for a human byline, Organization for a standing team. */
  authorType?: 'Person' | 'Organization';
}

/**
 * BlogPosting for a /blog/* entry.
 *
 * `mainEntityOfPage` is what tells a crawler this node describes THIS page
 * rather than being an arbitrary reference to an article, and the legacy pages
 * set it. `dateModified` falls back to `datePublished`: omitting it entirely is
 * a weaker signal than stating the two are the same, which for an unedited post
 * is simply true.
 */
export function blogPosting(input: BlogPostingInput): Record<string, unknown> {
  const url = abs(input.path);
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: input.title,
    description: input.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: input.publishDate.toISOString().slice(0, 10),
    dateModified: (input.updatedDate ?? input.publishDate).toISOString().slice(0, 10),
    image: new URL(input.image ?? SITE.defaultOgImage, SITE.origin).href,
    /*
     * A NAMED PERSON WHERE THE POST CARRIES ONE, AND THE ORGANISATION OTHERWISE.
     * The visible byline and this node are rendered from the SAME frontmatter
     * field, so a post cannot credit somebody on the page while telling a
     * crawler the company wrote it. Ten of the eleven posts carry no `author`
     * and keep the organisation, which is accurate rather than a fallback.
     */
    author: input.author
      ? {
          '@type': input.authorType ?? 'Person',
          name: input.author,
          /* `jobTitle` is a Person property. A team does not have one, and the
             role field is left unset on those posts in any case. */
          ...(input.authorRole && (input.authorType ?? 'Person') === 'Person'
            ? { jobTitle: input.authorRole }
            : {}),
        }
      : { '@id': `${SITE.origin}/#organization` },
    publisher: { '@id': `${SITE.origin}/#organization` },
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQPage from a list of question/answer pairs.
 *
 * Returns an EMPTY ARRAY when there are no entries rather than an FAQPage with
 * zero questions. An empty FAQPage is not neutral: it is a structured-data
 * error that search engines report against the page.
 */
export function faqPage(entries: FaqEntry[] | undefined): Record<string, unknown>[] {
  if (!entries || entries.length === 0) return [];
  return [
    {
      '@type': 'FAQPage',
      mainEntity: entries.map((e) => ({
        '@type': 'Question',
        name: e.question,
        acceptedAnswer: { '@type': 'Answer', text: e.answer },
      })),
    },
  ];
}

export interface Crumb {
  name: string;
  path: string;
}

/** BreadcrumbList. Positions are 1-based, which the spec requires. */
export function breadcrumbs(crumbs: Crumb[]): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}
