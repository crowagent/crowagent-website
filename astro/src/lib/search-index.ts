import { getCollection } from 'astro:content';
import { NAV } from '../data/nav';
import { FOOTER } from '../data/footer';

/**
 * The command-palette index, ASSEMBLED FROM THE ROUTES THEMSELVES.
 *
 * The obvious implementation is a hand-written array of pages. It is also the
 * one that silently rots: a page gets added, nobody remembers the index, and
 * the palette quietly stops being able to find part of the site. Since every
 * route on this site comes from either the nav data, the footer data or a
 * content collection, the index is derived from those three at build time and
 * cannot drift from what actually exists.
 *
 * Deduplicated by href, first writer wins, so a page reachable from both the
 * nav and the footer appears once and keeps the more specific section label
 * from the nav.
 */
export interface SearchEntry {
  title: string;
  href: string;
  /** Grouping label shown against the result. */
  section: string;
  /** Extra words to match on that are not in the title. */
  hint?: string;
}

/** Collection id -> the label a reader would recognise. */
const COLLECTION_SECTIONS: Record<string, string> = {
  blog: 'Blog',
  compare: 'Compare',
  glossary: 'Glossary',
  sectors: 'Sectors',
  legal: 'Legal',
};

export async function buildSearchIndex(): Promise<SearchEntry[]> {
  const seen = new Set<string>();
  const out: SearchEntry[] = [];

  const add = (entry: SearchEntry) => {
    // Normalise the trailing slash for dedupe only. The href itself is left
    // exactly as authored, because these are live indexed URLs.
    const key = entry.href.replace(/\/$/, '') || '/';
    if (seen.has(key)) return;
    seen.add(key);
    out.push(entry);
  };

  add({ title: 'Home', href: '/', section: 'CrowAgent', hint: 'start homepage' });

  for (const column of NAV.productDropdown.columns) {
    for (const item of column.items) {
      add({
        title: item.label,
        href: item.href,
        section: column.label,
        // The dropdown already writes a one-line description of each product.
        // Matching on it means "questionnaire" finds CrowMark for Suppliers.
        hint: item.description,
      });
    }
  }

  for (const link of NAV.topLinks) {
    add({ title: link.label, href: link.href, section: 'CrowAgent' });
  }

  for (const column of FOOTER.columns) {
    for (const link of column.links) {
      add({ title: link.label, href: link.href, section: column.title });
    }
  }

  // Content collections. Each entry is a real built route, so anything in here
  // is guaranteed to resolve.
  for (const [id, section] of Object.entries(COLLECTION_SECTIONS)) {
    const entries = await getCollection(id as 'blog');
    for (const entry of entries) {
      const data = entry.data as Record<string, unknown>;
      if (data.draft === true) continue;
      const prefix = id === 'legal' ? '' : `${id}/`;
      add({
        title: (data.heading as string) ?? (data.title as string) ?? entry.id,
        href: `/${prefix}${entry.id}`,
        section,
        hint: data.description as string | undefined,
      });
    }
  }

  return out;
}
