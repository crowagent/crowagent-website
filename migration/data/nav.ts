/**
 * nav.ts — The primary navigation tree.
 *
 * SOURCE: js/nav-inject.js:270-429 (NAV_HTML) and the mobile menu markup in
 * the same block. This file's own header comment (lines 1-12) explicitly
 * calls itself "Single source of truth for nav and footer across all
 * pages" — the nav is NOT hand-authored per page, it is injected by this
 * one script into every page's `<header id="ca-nav">` placeholder. Reading
 * the HTML pages directly would only show the empty placeholder, so this
 * file was built from nav-inject.js, per the task instruction.
 *
 * History worth keeping: as of 2026-07-28 (TM-REMEDIATION-001) the nav was
 * collapsed from TWO mega-menu triggers ("Products" and "Free Tools") into
 * ONE "Products" trigger with two columns, because with one live product and
 * one free tool, two triggers each holding a single item read as the site
 * hiding how little it has. "How it works" and "Sectors" were deliberately
 * removed from the primary nav (founder/owner directive) — Sectors lives in
 * the footer only.
 */

export type NavLink = { label: string; href: string };

export type NavMegaItem = {
  label: string;
  href: string;
  description: string;
};

export type NavMegaColumn = {
  label: string;
  items: NavMegaItem[];
};

/**
 * The single dropdown trigger. nav-inject.js:320 — href points at /crowmark
 * (so the trigger itself is a working link, not just a menu opener) and is
 * marked "active" whenever the path matches PRODUCT_ROUTES (['/crowmark'],
 * a prefix match that also covers /crowmark-buyers) or TOOL_ROUTES (['/tools']).
 */
export const PRODUCTS_DROPDOWN = {
  trigger: { label: 'Products', href: '/crowmark' },
  activeRoutePrefixes: ['/crowmark', '/tools'],
  columns: [
    {
      label: 'Bid and tender software',
      items: [
        { label: 'CrowMark for Suppliers', href: '/crowmark', description: 'Respond to tenders, RFPs, RFIs and questionnaires' },
        { label: 'CrowMark for Buyers', href: '/crowmark-buyers', description: 'Read the responses you receive, against the requirements you published' },
        { label: 'Compare CrowMark', href: '/compare', description: 'How it stacks up against other bid tools' },
        { label: 'Pricing', href: '/pricing', description: 'Plans from £49/mo, 14-day free trial' },
      ],
    },
    {
      label: 'Try it free',
      items: [
        { label: 'PPN 002 Social Value Calculator', href: '/tools/ppn-002-calculator', description: 'Score a bid against the 10% minimum weighting' },
        { label: 'How the score is calculated', href: '/tools/ppn-002-calculator/methodology', description: 'Every measure and proxy value, sourced' },
        { label: 'Free tools hub', href: '/tools/', description: 'No account, no email gate' },
      ],
    },
  ] as NavMegaColumn[],
} as const;

/** Flat top-level links, in order. nav-inject.js:348-352. */
export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' }, // added to desktop nav 2026-05-11 (was mobile-only)
  { label: 'About', href: '/about' },
];

/**
 * Right-hand nav actions. Sign-in goes straight to the app (external);
 * "Request access" is the site's primary CTA and is NOT a signup link — see
 * site.ts REQUEST_ACCESS_URL for why. nav-inject.js:358-371.
 */
export const NAV_ACTIONS = {
  search: { label: 'Search', shortcut: 'Cmd/Ctrl+K' },
  signIn: { label: 'Sign in', href: 'https://app.crowagent.ai/login', external: true },
  primaryCta: { label: 'Request access', href: '/contact?enquiry=limited-access#contact-form' },
} as const;

/**
 * Mobile menu — a single-level accordion mirroring the desktop mega-menu
 * (collapsed to one accordion 2026-07-28, matching the desktop merge).
 * nav-inject.js:406-427.
 */
export const MOBILE_NAV = {
  accordion: {
    label: 'Products',
    items: [
      { label: 'CrowMark for Suppliers', href: '/crowmark' },
      { label: 'CrowMark for Buyers', href: '/crowmark-buyers' },
      { label: 'Compare CrowMark', href: '/compare' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Free PPN 002 calculator', href: '/tools/ppn-002-calculator' },
      { label: 'Free tools hub', href: '/tools' },
    ],
  },
  topLinks: PRIMARY_NAV_LINKS,
  ctas: {
    signIn: { label: 'Sign in', href: 'https://app.crowagent.ai/login', external: true },
    primaryCta: { label: 'Request access', href: '/contact?enquiry=limited-access#contact-form' },
  },
} as const;

/**
 * Logo lockup. nav-inject.js:244-260: bar-chart mark + "CrowAgent" wordmark
 * ONLY — explicitly no tagline, no globe (owner-locked 2026-07-18, "Stripe/
 * Linear approach"). Any Astro rebuild of the logo component must not
 * reintroduce a tagline under the wordmark.
 */
export const LOGO = {
  href: '/',
  ariaLabel: 'CrowAgent, home',
  wordmark: 'CrowAgent',
  hasTagline: false,
} as const;
