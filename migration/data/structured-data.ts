/**
 * structured-data.ts — the JSON-LD graph.
 *
 * ⚠️ HEADLINE FINDING — read this before using ORGANIZATION_CANONICAL below.
 * There are THREE, not one, competing versions of the Organization block in
 * this codebase, and they disagree with each other on name, logo, sameAs
 * and contact email. This is the single most important structured-data
 * finding in the migration:
 *
 *   A) js/nav-inject.js:1447-1483 — the INJECTED FALLBACK. Runs on every
 *      page that does NOT already ship a static Organization block (guarded
 *      by `hasOrgLd` check at nav-inject.js:1436-1442). Minimal: name
 *      "CrowAgent Ltd", logo = og-image.png, email hello@crowagent.ai,
 *      sameAs = [LinkedIn, X, YouTube] (3 links, no Medium/Instagram even
 *      though the footer social row has 5 icons).
 *
 *   B) index.html's own static <head> block (bypasses the fallback because
 *      hasOrgLd finds it) — RICHER: name "CrowAgent" + separate legalName
 *      "CrowAgent Ltd", logo = the wordmark PNG (different file to A), adds
 *      foundingDate, address.addressLocality, knowsAbout (10 topics),
 *      identifier (Companies House), areaServed — AND a contactPoint whose
 *      email/name do not belong to this project at all (see
 *      HOMEPAGE_JSONLD_CONTACT_ANOMALY in site.ts). sameAs order is X
 *      before LinkedIn (fallback A has LinkedIn first — cosmetic, but a
 *      genuine textual diff).
 *
 *   C) resources.html's own static <head> block — a THIRD shape: name
 *      "CrowAgent", legalName "CrowAgent Ltd", logo = the wordmark PNG
 *      (matches B), but sameAs is ONLY 2 links
 *      ["https://www.linkedin.com/company/crowagent", "https://x.com/CrowAgentLtd"]
 *      — note the LinkedIn URL is `/company/crowagent`, NOT
 *      `/company/crowagent-ltd/` as everywhere else on the site (A, B, and
 *      the footer's live link all agree on `-ltd/`). This looks like a typo
 *      that has never been caught because it is inside a JSON-LD block, not
 *      visible page content. contactPoint here correctly uses
 *      hello@crowagent.ai (unlike B).
 *
 * 19 pages ship a static Organization/BlogPosting/etc. block themselves
 * (listed in ORGLD_STATIC_PAGES below); the other 23 in-scope pages get
 * fallback A injected at runtime. tools/index.html gets NEITHER — see
 * TOOLS_INDEX_HAS_NO_JSONLD below.
 */

// ---------------------------------------------------------------------------
// A. The injected fallback (js/nav-inject.js:1447-1483)
// ---------------------------------------------------------------------------
export const ORGANIZATION_FALLBACK_INJECTED = {
  '@type': 'Organization',
  '@id': 'https://crowagent.ai/#organization',
  name: 'CrowAgent Ltd',
  url: 'https://crowagent.ai/',
  logo: 'https://crowagent.ai/Assets/og-image.png?v=20260730',
  description:
    'CrowAgent helps UK suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award.',
  email: 'hello@crowagent.ai',
  identifier: { '@type': 'PropertyValue', name: 'Companies House', value: '17076461' },
  address: { '@type': 'PostalAddress', addressCountry: 'GB' },
  sameAs: [
    'https://www.linkedin.com/company/crowagent-ltd/',
    'https://x.com/CrowAgentLtd',
    'https://www.youtube.com/@CrowAgentUK',
  ],
} as const;

export const WEBSITE_FALLBACK_INJECTED = {
  '@type': 'WebSite',
  '@id': 'https://crowagent.ai/#website',
  url: 'https://crowagent.ai/',
  name: 'CrowAgent',
  publisher: { '@id': 'https://crowagent.ai/#organization' },
  inLanguage: 'en-GB',
} as const;

// ---------------------------------------------------------------------------
// B. index.html's own static block (wins over A on the homepage)
// ---------------------------------------------------------------------------
export const ORGANIZATION_INDEX_HTML = {
  '@type': 'Organization',
  '@id': 'https://crowagent.ai/#organization',
  name: 'CrowAgent',
  legalName: 'CrowAgent Ltd',
  url: 'https://crowagent.ai/',
  logo: 'https://crowagent.ai/Assets/brand/crowagent_wordmark_transparent_560x140.png?v=20260730',
  description:
    'CrowAgent helps UK suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award.',
  foundingDate: '2025',
  address: { '@type': 'PostalAddress', addressLocality: 'Reading', addressCountry: 'GB' },
  /**
   * ⚠️ See site.ts HOMEPAGE_JSONLD_CONTACT_ANOMALY. This is NOT a CrowAgent
   * support address — it is crowagent-platform's internal identity strings,
   * present here by what looks like a cross-project copy/paste error.
   */
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'crowagent.platform@gmail.com',
    name: 'Crow Agent',
  },
  areaServed: 'GB',
  knowsAbout: [
    'CrowMark bid and tender management',
    'UK public procurement',
    'PPN 002 social value',
    'Procurement Act 2023',
    'Find a Tender',
    'Contracts Finder',
    'National TOMs',
    'Invitation to tender',
    'Selection questionnaire',
    'Public sector frameworks',
  ],
  identifier: { '@type': 'PropertyValue', name: 'Companies House', value: '17076461' },
  sameAs: [
    'https://x.com/CrowAgentLtd',
    'https://www.linkedin.com/company/crowagent-ltd/',
    'https://www.youtube.com/@CrowAgentUK',
  ],
} as const;

// ---------------------------------------------------------------------------
// C. resources.html's own static block (a third, sparser shape)
// ---------------------------------------------------------------------------
export const ORGANIZATION_RESOURCES_HTML = {
  '@type': 'Organization',
  name: 'CrowAgent',
  legalName: 'CrowAgent Ltd',
  url: 'https://crowagent.ai/',
  logo: 'https://crowagent.ai/Assets/brand/crowagent_wordmark_transparent_560x140.png?v=20260730',
  /**
   * ⚠️ Likely typo: every other occurrence of this LinkedIn URL sitewide
   * (fallback A, index.html's block B, and the live footer link in
   * js/nav-inject.js:218) ends `/company/crowagent-ltd/`. This one reads
   * `/company/crowagent` — missing "-ltd" and the trailing slash. Flagged,
   * not silently "corrected", per the task instruction.
   */
  sameAs: ['https://www.linkedin.com/company/crowagent', 'https://x.com/CrowAgentLtd'],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@crowagent.ai',
      areaServed: 'GB',
      availableLanguage: ['en'],
    },
  ],
} as const;

/** The 19 pages found to ship their OWN static Organization/BlogPosting/etc. block in <head>, bypassing fallback A. */
export const ORGLD_STATIC_PAGES = [
  'index.html', // → ORGANIZATION_INDEX_HTML (B)
  'resources.html', // → ORGANIZATION_RESOURCES_HTML (C)
  'sectors/index.html', // → minimal inline publisher ref only, see COLLECTION_PAGE_EXAMPLE
  'glossary/index.html', // → minimal inline publisher ref only
  'compare/crowmark-vs-autogenai.html',
  'compare/crowmark-vs-cleantender.html',
  'compare/crowmark-vs-mytender-io.html',
  'compare/crowmark-vs-swiftbid.html',
  'blog/index.html', // → minimal inline publisher ref, type Blog
  'blog/find-first-public-sector-contract.html',
  'blog/frameworks-and-dps-explained.html',
  'blog/method-statement-that-scores.html',
  'blog/ppn-002-social-value-guide.html',
  'blog/private-sector-rfp-pqq-guide.html',
  'blog/procurement-act-2023-sme-guide.html',
  'blog/regulatory-updates-2026.html',
  'blog/social-value-portal-vs-crowmark.html',
  'tools/ppn-002-calculator/index.html', // → minimal inline publisher ref, type WebApplication
  'tools/ppn-002-calculator/methodology/index.html', // → minimal inline publisher ref, type TechArticle
] as const;

/**
 * ⚠️ tools/index.html ships NO JSON-LD of any kind — not even a
 * BreadcrumbList, which every other non-homepage page in scope has. This is
 * a genuine gap: the free-tools hub is a reasonable rich-result candidate
 * (it lists the free calculator) and currently has zero structured data.
 */
export const TOOLS_INDEX_HAS_NO_JSONLD = true;

// ---------------------------------------------------------------------------
// Per-route additional schema types (beyond Organization/WebSite)
// ---------------------------------------------------------------------------
// Survey of every `"@type"` value found anywhere in each in-scope page's
// JSON-LD, keyed by route. This is the literal union of types present, not
// a claim about which @graph node each belongs to — see the worked examples
// below for actual node shapes.

export const JSONLD_TYPES_BY_ROUTE: Record<string, string[]> = {
  '/': ['Organization', 'WebSite', 'ContactPoint', 'PostalAddress', 'PropertyValue'],
  '/about': ['BreadcrumbList', 'ListItem'],
  '/changelog': ['BreadcrumbList', 'ListItem'],
  '/contact': ['BreadcrumbList', 'ListItem'],
  '/cookie-preferences': ['BreadcrumbList', 'ListItem'],
  '/cookies': ['BreadcrumbList', 'ListItem'],
  '/crowmark': ['SoftwareApplication', 'Offer', 'BreadcrumbList', 'FAQPage', 'Question', 'Answer', 'ListItem'],
  '/crowmark-buyers': ['Audience', 'BreadcrumbList', 'FAQPage', 'Question', 'Answer', 'ListItem', 'WebPage'],
  '/faq': ['FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ListItem'],
  '/integrations': ['BreadcrumbList', 'ListItem'],
  '/partners': ['BreadcrumbList', 'ListItem'],
  '/pricing': ['BreadcrumbList', 'ListItem', 'ItemList', 'SoftwareApplication', 'Offer'],
  '/privacy': ['BreadcrumbList', 'ListItem'],
  '/resources': ['Organization', 'ContactPoint', 'BreadcrumbList', 'ListItem'],
  '/roadmap': ['BreadcrumbList', 'ListItem'],
  '/security': ['BreadcrumbList', 'ListItem'],
  '/terms': ['BreadcrumbList', 'ListItem'],
  '/blog': ['Blog', 'Organization', 'BreadcrumbList', 'ListItem'],
  '/blog/find-first-public-sector-contract': ['BlogPosting', 'Organization', 'ImageObject', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/blog/frameworks-and-dps-explained': ['BlogPosting', 'Organization', 'ImageObject', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/blog/method-statement-that-scores': ['BlogPosting', 'Organization', 'ImageObject', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/blog/ppn-002-social-value-guide': ['BlogPosting', 'Organization', 'ImageObject', 'WebPage'], // no FAQPage on this one
  '/blog/private-sector-rfp-pqq-guide': ['BlogPosting', 'Organization', 'ImageObject', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/blog/procurement-act-2023-sme-guide': ['BlogPosting', 'Organization', 'ImageObject', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/blog/regulatory-updates-2026': ['Article', 'BlogPosting', 'Organization', 'ImageObject', 'BreadcrumbList', 'ListItem', 'WebPage'], // uses Article AND BlogPosting together; the only blog post that also has a BreadcrumbList
  '/blog/social-value-portal-vs-crowmark': ['BlogPosting', 'Organization', 'ImageObject', 'WebPage'], // no FAQPage
  '/compare': ['CollectionPage', 'BreadcrumbList', 'ListItem', 'WebPage'],
  '/compare/crowmark-vs-autogenai': ['Article', 'Organization', 'ImageObject', 'BreadcrumbList', 'ListItem', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/compare/crowmark-vs-cleantender': ['Article', 'Organization', 'ImageObject', 'BreadcrumbList', 'ListItem', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/compare/crowmark-vs-mytender-io': ['Article', 'Organization', 'ImageObject', 'BreadcrumbList', 'ListItem', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/compare/crowmark-vs-swiftbid': ['Article', 'Organization', 'ImageObject', 'BreadcrumbList', 'ListItem', 'FAQPage', 'Question', 'Answer', 'WebPage'],
  '/glossary': ['CollectionPage', 'Organization', 'DefinedTermSet', 'DefinedTerm', 'BreadcrumbList', 'ListItem'],
  '/glossary/ppn-002': ['DefinedTerm', 'DefinedTermSet', 'BreadcrumbList', 'ListItem'],
  '/glossary/toms-framework': ['DefinedTerm', 'DefinedTermSet', 'BreadcrumbList', 'ListItem'],
  '/sectors': ['CollectionPage', 'Organization'],
  '/sectors/construction': ['FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ListItem'],
  '/sectors/education': ['FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ListItem'],
  '/sectors/facilities': ['FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ListItem'],
  '/sectors/highways': ['FAQPage', 'Question', 'Answer', 'BreadcrumbList', 'ListItem'],
  '/tools': [], // ⚠️ see TOOLS_INDEX_HAS_NO_JSONLD
  '/tools/ppn-002-calculator': ['WebApplication', 'Offer', 'Organization', 'BreadcrumbList', 'ListItem'],
  '/tools/ppn-002-calculator/methodology': ['TechArticle', 'Organization', 'BreadcrumbList', 'ListItem'],
};

// ---------------------------------------------------------------------------
// Worked examples of each additional schema type (one representative node
// per type, taken verbatim from the page cited)
// ---------------------------------------------------------------------------

/** crowmark.html <head> — SoftwareApplication + nested Offer. */
export const SOFTWARE_APPLICATION_EXAMPLE = {
  '@type': 'SoftwareApplication',
  '@id': 'https://crowagent.ai/crowmark#software',
  name: 'CrowMark',
  url: 'https://crowagent.ai/crowmark',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description:
    'UK bid suite. Daily Find a Tender, Contracts Finder and Public Contracts Scotland discovery, answer drafting cited to the regulatory corpus, the tender’s own clauses and the organisation’s answer library, deterministic PPN 002 social-value calculation, and post-award delivery evidence with advisory Procurement Act 2023 checks.',
  publisher: { '@id': 'https://crowagent.ai/#organization' },
  offers: { '@type': 'Offer', priceCurrency: 'GBP', price: '49', url: 'https://crowagent.ai/pricing' },
} as const;

/**
 * pricing.html <head> — ItemList of one SoftwareApplication carrying an
 * ARRAY of Offers (Starter + Pro only — Portfolio/"Contact sales" is
 * correctly absent, matching the visible card; see pricing.ts).
 */
export const PRICING_ITEMLIST_EXAMPLE = {
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      item: {
        '@type': 'SoftwareApplication',
        name: 'CrowMark',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://crowagent.ai/crowmark',
        publisher: { '@id': 'https://crowagent.ai/#organization' },
        offers: [
          { '@type': 'Offer', name: 'Starter', price: '49', priceCurrency: 'GBP', url: 'https://crowagent.ai/pricing' },
          { '@type': 'Offer', name: 'Pro', price: '149', priceCurrency: 'GBP', url: 'https://crowagent.ai/pricing' },
        ],
      },
    },
  ],
} as const;

/** blog/find-first-public-sector-contract.html — standard blog post shape (shared by 5 of the 9 blog posts). */
export const BLOG_POSTING_EXAMPLE = {
  '@type': 'BlogPosting',
  headline: 'How to find and win your first UK public sector contract',
  description:
    'Where to look for UK public sector tenders, how to read one, SQ versus ITT, the bid or no-bid call, and the first-timer mistakes that lose winnable work.',
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://crowagent.ai/blog/find-first-public-sector-contract' },
  datePublished: '2026-07-26',
  dateModified: '2026-07-26',
  image: 'https://crowagent.ai/Assets/og/blog-find-first-public-sector-contract.png?v=20260730',
  author: { '@type': 'Organization', name: 'CrowAgent', url: 'https://crowagent.ai/' },
  publisher: {
    '@type': 'Organization',
    name: 'CrowAgent',
    logo: { '@type': 'ImageObject', url: 'https://crowagent.ai/Assets/brand/crowagent_wordmark_transparent_560x140.png?v=20260730' },
  },
} as const;

/** compare/crowmark-vs-autogenai.html — the "Article" shape used by all 4 compare detail pages (note: Article, not BlogPosting, unlike the blog/ posts). */
export const COMPARE_ARTICLE_EXAMPLE = {
  '@type': 'Article',
  headline: 'CrowMark vs AutogenAI: an honest UK bid software comparison',
  description:
    'CrowMark is an SME bid suite with published pricing from £49/month; AutogenAI is an enterprise engine that does not publish a price. A sourced, balanced comparison for UK bidding teams.',
  datePublished: '2026-07-26',
  dateModified: '2026-07-26',
  image: 'https://crowagent.ai/Assets/og/crowmark.png?v=20260730',
  author: { '@type': 'Organization', name: 'CrowAgent Ltd', url: 'https://crowagent.ai/' },
  publisher: {
    '@type': 'Organization',
    name: 'CrowAgent Ltd',
    logo: { '@type': 'ImageObject', url: 'https://crowagent.ai/Assets/brand/crowagent_wordmark_transparent_560x140.png?v=20260730' },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://crowagent.ai/compare/crowmark-vs-autogenai' },
} as const;

/**
 * ⚠️ NOTE: BLOG_POSTING_EXAMPLE's author/publisher.name is "CrowAgent" (no
 * "Ltd"); COMPARE_ARTICLE_EXAMPLE's is "CrowAgent Ltd". Both are internally
 * consistent within their own template but disagree with each other — a
 * minor but real naming inconsistency between the blog template and the
 * compare-page template.
 */

/** glossary/ppn-002.html — DefinedTerm + DefinedTermSet (shared shape across all 3 glossary pages). */
export const DEFINED_TERM_EXAMPLE = {
  '@type': 'DefinedTerm',
  name: 'PPN 002',
  description: 'Procurement Policy Note 002, mandating a minimum 10% social value weighting on UK central government procurement.',
  url: 'https://crowagent.ai/glossary/ppn-002',
  inDefinedTermSet: {
    '@type': 'DefinedTermSet',
    name: 'CrowAgent UK Public Procurement and Bid Glossary',
    url: 'https://crowagent.ai/glossary',
  },
} as const;

/** sectors/index.html and glossary/index.html — the minimal CollectionPage shape (2 pages use this exact pattern). */
export const COLLECTION_PAGE_EXAMPLE = {
  '@type': 'CollectionPage',
  name: 'UK Procurement Glossary',
  description: 'Plain-English definitions of the UK public procurement and bidding terms that decide whether a supplier wins and delivers public contracts.',
  url: 'https://crowagent.ai/glossary',
  publisher: { '@type': 'Organization', name: 'CrowAgent', url: 'https://crowagent.ai/' },
} as const;

/** blog/index.html — the Blog list-page shape. */
export const BLOG_LIST_EXAMPLE = {
  '@type': 'Blog',
  name: 'CrowAgent Regulatory Blog',
  description: 'Plain-English guides on PPN 002 social value and UK public procurement for UK bidders.',
  url: 'https://crowagent.ai/blog',
  publisher: { '@type': 'Organization', name: 'CrowAgent', url: 'https://crowagent.ai/' },
} as const;

/** tools/ppn-002-calculator/index.html — WebApplication + free Offer. */
export const WEB_APPLICATION_EXAMPLE = {
  '@type': 'WebApplication',
  name: 'PPN 002 Social Value Scorer',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://crowagent.ai/tools/ppn-002-calculator',
  description: 'Free PPN 002 social value scorer. Check the minimum 10% social value weighting on UK public sector bids using the National TOMs framework.',
  isAccessibleForFree: true,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
  publisher: { '@type': 'Organization', name: 'CrowAgent', url: 'https://crowagent.ai/' },
} as const;

/** tools/ppn-002-calculator/methodology/index.html — TechArticle. */
export const TECH_ARTICLE_EXAMPLE = {
  '@type': 'TechArticle',
  headline: 'PPN 002 Methodology | The 10% Rule | CrowAgent',
  description: 'Full methodology behind the PPN 002 Calculator. PPN 002 (effective 24 February 2025), the 10% minimum, TOMs framework, Oxford SVB proxy values, and references.',
  url: 'https://crowagent.ai/tools/ppn-002-calculator/methodology',
  author: { '@type': 'Organization', name: 'CrowAgent', url: 'https://crowagent.ai/' },
  publisher: { '@type': 'Organization', name: 'CrowAgent', url: 'https://crowagent.ai/' },
} as const;

/** crowmark-buyers.html <head> — Audience is used here and nowhere else in scope. */
export const AUDIENCE_TYPE_USAGE_NOTE =
  'Audience @type appears only on crowmark-buyers.html, describing the buyer-side page as targeted at contracting authorities. No other page in scope uses schema.org Audience.';

/** BreadcrumbList shape (near-universal; identical pattern on every non-homepage page). */
export const BREADCRUMB_LIST_EXAMPLE = {
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://crowagent.ai/' },
    { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://crowagent.ai/glossary' },
    { '@type': 'ListItem', position: 3, name: 'PPN 002', item: 'https://crowagent.ai/glossary/ppn-002' },
  ],
} as const;
