/**
 * nav.ts — the primary navigation link tree, as typed data.
 *
 * Every label and href is extracted verbatim from the legacy injector,
 * `js/nav-inject.js` (NAV_HTML, ~line 270-429), which is the single source of
 * truth for nav structure on the live site. Hrefs are preserved EXACTLY: they
 * are live, indexed URLs and must not be "corrected" or normalised here.
 *
 * Structural decisions carried forward from nav-inject.js (see its comments
 * for the full history):
 *   - "How it works" is intentionally NOT a nav link (founder directive).
 *   - The old two-menu "Products" + "Free Tools" mega-nav was merged into one
 *     "Products" menu with two columns (TM-REMEDIATION-001, 2026-07-28).
 *   - "Sectors" is deliberately NOT a top nav link (footer-only).
 *   - Nav order is fixed: Products / Pricing / Blog / FAQ / About.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavMegaItem extends NavLink {
  description: string;
  /** Maps to the token-based accent colour used on the legacy icon. */
  accent: 'mark' | 'teal';
  /** Which inline icon glyph the legacy markup used for this row. */
  icon: 'dot' | 'grid' | 'coin' | 'arrow';
}

export interface NavMegaColumn {
  label: string;
  items: NavMegaItem[];
}

export const NAV = {
  logo: {
    href: '/',
    ariaLabel: 'CrowAgent, home',
  },

  /**
   * The single merged "Products" dropdown. `activeRoutes` mirrors
   * nav-inject.js's PRODUCT_ROUTES.concat(TOOL_ROUTES) — a route-prefix match
   * used to keep the trigger visually active while on /crowmark* or /tools*.
   */
  productDropdown: {
    trigger: { label: 'Products', href: '/crowmark' } as NavLink,
    activeRoutes: ['/crowmark', '/tools'] as string[],
    columns: [
      {
        label: 'Bid and tender software',
        items: [
          {
            label: 'CrowMark for Suppliers',
            href: '/crowmark',
            description: 'Respond to tenders, RFPs, RFIs and questionnaires',
            accent: 'mark',
            icon: 'dot',
          },
          {
            label: 'CrowMark for Buyers',
            href: '/crowmark-buyers',
            description: 'Read the responses you receive, against the requirements you published',
            accent: 'teal',
            icon: 'dot',
          },
          {
            label: 'Compare CrowMark',
            href: '/compare',
            description: 'How it stacks up against other bid tools',
            accent: 'teal',
            icon: 'grid',
          },
          {
            label: 'Pricing',
            href: '/pricing',
            description: 'Plans from £49/mo, 14-day free trial',
            accent: 'teal',
            icon: 'coin',
          },
        ],
      },
      {
        label: 'Try it free',
        items: [
          {
            label: 'PPN 002 Social Value Calculator',
            href: '/tools/ppn-002-calculator',
            description: 'Score a bid against the 10% minimum weighting',
            accent: 'mark',
            icon: 'dot',
          },
          {
            label: 'How the score is calculated',
            href: '/tools/ppn-002-calculator/methodology',
            description: 'Every measure and proxy value, sourced',
            accent: 'teal',
            icon: 'grid',
          },
          {
            label: 'Free tools hub',
            href: '/tools/',
            description: 'No account, no email gate',
            accent: 'teal',
            icon: 'arrow',
          },
        ],
      },
    ] as NavMegaColumn[],
  },

  /** Flat top-level links, in exact nav-inject.js order. */
  topLinks: [
    { label: 'Pricing', href: '/pricing' },
    { label: 'Blog', href: '/blog' },
    { label: 'FAQ', href: '/faq' },
    { label: 'About', href: '/about' },
  ] as NavLink[],

  actions: {
    signIn: {
      label: 'Sign in',
      href: 'https://app.crowagent.ai/login',
    } as NavLink,
    cta: {
      label: 'Request access',
      href: '/contact?enquiry=limited-access#contact-form',
    } as NavLink,
  },

  /**
   * Mobile menu (Stripe-style accordion, 2026-05-31). The "Products"
   * accordion panel deliberately uses different labels/hrefs for the two
   * free-tools rows than the desktop mega-menu ("Free PPN 002 calculator" /
   * "/tools" rather than "PPN 002 Social Value Calculator" / "/tools/") —
   * that mismatch exists in nav-inject.js itself and is preserved verbatim
   * rather than "fixed", per the hrefs-must-be-preserved-exactly rule.
   */
  mobile: {
    productsAccordion: {
      label: 'Products',
      links: [
        { label: 'CrowMark for Suppliers', href: '/crowmark' },
        { label: 'CrowMark for Buyers', href: '/crowmark-buyers' },
        { label: 'Compare CrowMark', href: '/compare' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Free PPN 002 calculator', href: '/tools/ppn-002-calculator' },
        { label: 'Free tools hub', href: '/tools' },
      ] as NavLink[],
    },
    topLinks: [
      { label: 'Pricing', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
      { label: 'FAQ', href: '/faq' },
      { label: 'About', href: '/about' },
    ] as NavLink[],
  },
} as const;
