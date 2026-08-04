/**
 * nav.ts — the primary navigation link tree, as typed data.
 *
 * ONE TREE, NOT TWO. Until 2026-08-04 this file held the desktop mega-menu and
 * the mobile accordion as two separate lists, and they had already drifted: the
 * mobile panel said "Free PPN 002 calculator" pointing at
 * /tools/ppn-002-calculator while the desktop panel said "PPN 002 Social Value
 * Calculator" pointing at /tools/. Same two destinations, two labels, two
 * hrefs, and nothing in the build could see the difference because both
 * resolved. That drift was inherited from js/nav-inject.js and preserved here
 * verbatim on the grounds that hrefs must not be "corrected" — which was the
 * right instinct for a URL and the wrong one for a duplicate. A URL is a
 * promise to the outside world. A second copy of the menu is not; it is just a
 * second place to forget.
 *
 * So `menus` below is the ONLY list of dropdown links. Nav.astro renders the
 * desktop mega-menu and the mobile accordions from it, and a menu item added
 * here appears in both or in neither. There is no mobile block any more.
 *
 * ── STRUCTURE, OWNER DECISION 2026-08-04 ────────────────────────────────────
 *
 * "Products" was doing three jobs at once: actual products, free tools, and
 * explanatory content. The free tools are lead-generation assets and they were
 * buried under a menu nobody opens looking for a calculator. They now have
 * their own "Resources" menu, and Blog stays top level.
 *
 *   Products    CrowMark for Suppliers · CrowMark for Buyers · Compare CrowMark
 *   Resources   PPN 002 calculator · Free tools hub · How the score is
 *               calculated · Glossary
 *   Top level   Pricing · Blog · FAQ · About
 *
 * PRICING CAME OUT OF THE DROPDOWN. It was in both places — a top-level nav
 * item AND a Products row — so the header offered the same destination twice,
 * a couple of centimetres apart. The top-level item is the one that stays.
 *
 * ── OTHER STRUCTURAL DECISIONS CARRIED FORWARD ──────────────────────────────
 *
 *   - "How it works" is intentionally NOT a nav link (founder directive).
 *   - "Sectors" is deliberately NOT a top nav link (footer-only).
 *   - /resources, the hub page, is reachable from the footer rather than from
 *     the Resources menu: the menu lists the four destinations the owner named,
 *     and a hub whose own job is to link onward to three of them would be a
 *     fifth row that goes nowhere new. It IS in `activeRoutes` below, so a
 *     reader who arrives there from the footer sees the Resources trigger lit.
 *
 * ── HREFS ARE IN CANONICAL FORM, NO TRAILING SLASH ──────────────────────────
 *
 * Seo.astro emits `https://crowagent.ai/tools`, and the footer links
 * `/tools/ppn-002-calculator`. The old nav mixed `/tools/` and `/tools` between
 * its two copies of the same link. One form now, and it is the one the
 * canonical tag declares.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface NavMenuItem extends NavLink {
  description: string;
  /** Maps to the token-based accent colour used on the row's icon. */
  accent: 'mark' | 'teal';
  /** Which inline icon glyph NavDropdown.astro draws for this row. */
  icon: 'dot' | 'grid' | 'arrow' | 'book';
}

export interface NavMenuColumn {
  label: string;
  items: NavMenuItem[];
}

export interface NavMenu {
  /**
   * Stable slug. It generates the trigger and panel element ids that wire up
   * aria-controls, so it must be unique across `menus` and must contain nothing
   * that is illegal in an id.
   */
  id: string;
  label: string;
  /**
   * Route PREFIXES that light this trigger up. Matched with startsWith, so
   * '/crowmark' also covers '/crowmark-buyers'.
   */
  activeRoutes: string[];
  columns: NavMenuColumn[];
}

const PRODUCTS: NavMenu = {
  id: 'products',
  label: 'Products',
  activeRoutes: ['/crowmark', '/compare'],
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
      ],
    },
  ],
};

/**
 * Resources. The rows are in the order the owner listed them on 2026-08-04, and
 * that order is left exactly as given rather than resequenced into what reads
 * like a more natural flow (calculator, then its methodology, then the hub).
 *
 * ONLY TOOLS THAT STILL SHIP ARE LISTED. Four were withdrawn on 2026-07-28
 * (Cyber Essentials Readiness, Late Payment Calculator, CSRD Applicability
 * Checker, VSME Materiality Light), and /tools carries two cards, not six. A
 * nav is the last place a retired tool should be advertised from.
 */
const RESOURCES: NavMenu = {
  id: 'resources',
  label: 'Resources',
  activeRoutes: ['/tools', '/glossary', '/resources'],
  columns: [
    {
      label: 'Free tools and reference',
      items: [
        {
          label: 'PPN 002 Social Value Calculator',
          href: '/tools/ppn-002-calculator',
          description: 'Score a bid against the 10% minimum weighting',
          accent: 'mark',
          icon: 'dot',
        },
        {
          label: 'Free tools hub',
          href: '/tools',
          description: 'No account, no email gate',
          accent: 'teal',
          icon: 'arrow',
        },
        {
          label: 'How the score is calculated',
          href: '/tools/ppn-002-calculator/methodology',
          description: 'Every measure and proxy value, sourced',
          accent: 'teal',
          icon: 'grid',
        },
        {
          label: 'Procurement glossary',
          href: '/glossary',
          description: 'UK bidding and tendering terms in plain English',
          accent: 'teal',
          icon: 'book',
        },
      ],
    },
  ],
};

export const NAV = {
  logo: {
    href: '/',
    ariaLabel: 'CrowAgent, home',
  },

  /** Every dropdown, desktop and mobile, in nav order. */
  menus: [PRODUCTS, RESOURCES] as NavMenu[],

  /** Flat top-level links, rendered after the dropdowns. */
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
};
