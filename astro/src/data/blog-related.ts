/**
 * blog-related.ts — which post each post points at from its "Related articles" rail.
 *
 * NOT AN EDITORIAL JUDGEMENT MADE HERE. Every list below is read straight off
 * the corresponding legacy page in `blog/*.html`, in the order the legacy rail
 * renders it. The live site already encodes these relations by hand, so the
 * port carries them across rather than deriving a new set: a derived set would
 * quietly change the internal link graph of eight indexed pages at the same
 * moment the port claims to restore it.
 *
 * Three posts carry three cards rather than four. That is what ships today and
 * it is preserved, not padded out.
 *
 * WHY A MAP AND NOT PER-POST FRONTMATTER. A rail is a relationship between two
 * posts, and a relationship written in two places drifts. Held here, the whole
 * graph is readable in one screen and RELATED_POSTS is validated against the
 * content collection at build time, so a slug that stops existing fails the
 * build instead of shipping a dead card.
 *
 * ADDING A POST. Give it an entry. Without one it falls back to the derived
 * rule in components/blog/RelatedPosts.astro (same category first, then most
 * recent), which is a safety net rather than a substitute for a decision.
 */
export const RELATED_POSTS: Record<string, string[]> = {
  'find-first-public-sector-contract': [
    'procurement-act-2023-sme-guide',
    'ppn-002-social-value-guide',
    'regulatory-updates-2026',
    'method-statement-that-scores',
  ],
  'frameworks-and-dps-explained': [
    'procurement-act-2023-sme-guide',
    'find-first-public-sector-contract',
    'method-statement-that-scores',
  ],
  'method-statement-that-scores': [
    'find-first-public-sector-contract',
    'procurement-act-2023-sme-guide',
    'frameworks-and-dps-explained',
  ],
  'ppn-002-social-value-guide': [
    'find-first-public-sector-contract',
    'regulatory-updates-2026',
    'social-value-portal-vs-crowmark',
    'method-statement-that-scores',
  ],
  'private-sector-rfp-pqq-guide': [
    'method-statement-that-scores',
    'find-first-public-sector-contract',
    'procurement-act-2023-sme-guide',
  ],
  'procurement-act-2023-sme-guide': [
    'find-first-public-sector-contract',
    'ppn-002-social-value-guide',
    'regulatory-updates-2026',
    'frameworks-and-dps-explained',
  ],
  'regulatory-updates-2026': [
    'ppn-002-social-value-guide',
    'procurement-act-2023-sme-guide',
    'find-first-public-sector-contract',
    'frameworks-and-dps-explained',
  ],
  'social-value-portal-vs-crowmark': [
    'find-first-public-sector-contract',
    'ppn-002-social-value-guide',
    'procurement-act-2023-sme-guide',
    'private-sector-rfp-pqq-guide',
  ],
  'carbon-reduction-plan-ppn-0621-sme-guide': [
    'procurement-act-2023-sme-guide',
    'ppn-002-social-value-guide',
    'regulatory-updates-2026',
    'ai-tender-evaluation-uk-public-sector',
  ],
  'ai-tender-evaluation-uk-public-sector': [
    'procurement-act-2023-sme-guide',
    'method-statement-that-scores',
    'carbon-reduction-plan-ppn-0621-sme-guide',
    'private-sector-rfp-pqq-guide',
  ],
};
