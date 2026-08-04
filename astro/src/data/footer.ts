/**
 * footer.ts — the sitewide footer, as typed data.
 *
 * Every label and href is extracted verbatim from the legacy injector,
 * `js/nav-inject.js` (FOOTER_HTML, ~line 444-639), which is the single
 * source of truth. Hrefs are preserved EXACTLY: they are live, indexed URLs.
 *
 * Structural decisions carried forward (see nav-inject.js comments for the
 * full history):
 *   - Trust row is a fixed 6-badge set (WEBSITE-FIX-001 WS-7.1), all reusing
 *     one check-circle icon and the same wording as the homepage hero.
 *   - Product column mirrors the merged desktop nav Products menu, in the
 *     same order (2026-07-29 footer/nav alignment fix).
 *   - Four link columns + Legal split out as its own column (not absorbed
 *     into Company) — reverses an older "exactly 4 columns" acceptance
 *     criterion once it produced a 12-item Company column (2026-07-30).
 *   - Copyright + legal-entity line is a required Companies Act 2006 §82 /
 *     ICO disclosure; the brand copy phrase in the header comment of
 *     nav-inject.js ("Sustainability•Intelligence") is a *stale* CLAUDE.md
 *     reference from a retired strapline — the live FOOTER_HTML does not
 *     emit it, so it is correctly absent here too.
 */

export interface FooterLink {
  label: string;
  href: string;
  /** e.g. the "Free" chip on the PPN 002 calculator row. */
  chip?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  /** SVG path `d` attribute, 0 0 24 24 viewBox. */
  d: string;
}

export const FOOTER = {
  /** `footer-credibility` trust badge row. All six share one check-circle icon. */
  trustBadges: [
    'AES-256 at rest',
    'TLS 1.3 in transit',
    'GDPR compliant',
    'UK & EU data residency',
    'ISO 27001 controls*',
    'ICO registered',
  ] as string[],
  trustNote: '* We follow ISO 27001 controls. We are not certified yet.',

  brand: {
    /**
     * "UK suppliers" -> "suppliers", 2026-08-04, and it is the same one-word
     * change as the homepage description (OA-33) and the Organization node in
     * site.ts (A-50). This line renders on all 43 routes, so it was the widest
     * surviving instance of copy that scopes the PRODUCT to one market, which
     * the owner's 2026-08-02 narrative decision rules out. UK public sector is
     * the proof point, not the identity.
     */
    tagline:
      'CrowAgent helps suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award.',
    /**
     * Static initial state. On the legacy site this is refined by a live
     * status-monitor fetch in scripts.js — that polling is a separate,
     * out-of-scope feature; this component renders the same honest default
     * it starts with before any fetch resolves.
     */
    statusLabel: 'All systems operational',
  },

  social: [
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/company/crowagent-ltd/',
      d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    {
      // X profile confirmed owner-side 2026-06-01: https://x.com/CrowAgentLtd
      label: 'X',
      href: 'https://x.com/CrowAgentLtd',
      d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.627l-5.1-6.694-5.867 6.694h-3.31l7.73-8.835L2.601 2.25h6.63l4.81 6.375 5.413-6.375zM17.15 18.75h1.829L5.293 3.786H3.35L17.15 18.75z',
    },
    {
      label: 'YouTube',
      href: 'https://www.youtube.com/@CrowAgentUK',
      d: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
    {
      label: 'Medium',
      href: 'https://medium.com/@crowagent.platform',
      d: 'M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 2.84-.46 5.15-1.04 5.15-.57 0-1.04-2.31-1.04-5.15s.47-5.15 1.04-5.15C23.54 6.85 24 9.16 24 12z',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/crowagent.ai/',
      d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    },
  ] as SocialLink[],

  columns: [
    {
      title: 'Product',
      links: [
        { label: 'CrowMark for Suppliers', href: '/crowmark' },
        { label: 'CrowMark for Buyers', href: '/crowmark-buyers' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Integrations', href: '/integrations' },
        { label: 'Sectors', href: '/sectors/' },
        { label: 'PPN 002 Calculator', href: '/tools/ppn-002-calculator', chip: 'Free' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Resources hub', href: '/resources' },
        { label: 'Blog', href: '/blog' },
        { label: 'Compare CrowMark', href: '/compare' },
        { label: 'FAQ', href: '/faq' },
        { label: 'Procurement Glossary', href: '/glossary' },
        /*
         * Added 2026-08-02, and NOT a legacy row: /sources did not exist on the
         * live site. It is the page every figure on the homepage now points at,
         * so it has to be reachable from somewhere other than the two homepage
         * links, or the site's provenance lives on one page's scroll depth.
         */
        { label: 'Sources', href: '/sources' },
        { label: 'Changelog', href: '/changelog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Roadmap', href: '/roadmap' },
        { label: 'Contact', href: '/contact' },
        { label: 'Partners', href: '/partners' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Security', href: '/security' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Cookies', href: '/cookies' },
        { label: 'Cookie preferences', href: '/cookie-preferences' },
      ],
    },
  ] as FooterColumn[],

  legalEntity: {
    companyNumber: '17076461',
    companiesHouseUrl: 'https://find-and-update.company-information.service.gov.uk/company/17076461',
  },

  bottomLinks: {
    status: { label: 'Status', href: 'https://status.crowagent.ai' } as FooterLink,
    cookiePreferences: { label: 'Cookie preferences', href: '/cookie-preferences' } as FooterLink,
  },
} as const;
