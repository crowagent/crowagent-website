/**
 * footer.ts — The footer link tree, trust badges and legal line.
 *
 * SOURCE: js/nav-inject.js:444-639 (FOOTER_HTML), injected into every page's
 * `<footer class="ca-footer">` placeholder — same single-source-of-truth
 * mechanism as nav.ts. Read from the JS, not from any individual HTML page.
 *
 * History worth keeping (from the extensive inline comments in nav-inject.js):
 * the footer went through several rebalances during 2026-07-29/30. The
 * Product column was rebuilt to mirror the header nav exactly (same items,
 * same order) after the owner pointed out the footer and header previously
 * grouped things differently, "teaching the visitor two conflicting maps of
 * the same thing." A "Compare CrowMark" duplicate between Product and
 * Resources was removed (kept only in Resources, since it is editorial).
 * Legal was split back out into its own column after briefly being merged
 * into Company to satisfy an old "exactly 4 columns" acceptance criterion,
 * which produced a 12-item, 899px-tall Company column — the current layout
 * is 5 columns (brand + 4 link columns) at 6/6/4/5 items.
 */

export type FooterLink = { label: string; href: string; badge?: string };

/** nav-inject.js:458-486. Same 5 badges appear in the homepage hero too. */
export const TRUST_BADGES = [
  'AES-256 at rest',
  'TLS 1.3 in transit',
  'GDPR compliant',
  'UK & EU data residency',
  'ISO 27001 controls*',
] as const;

/** nav-inject.js:486 — the asterisk on the last badge above. */
export const TRUST_BADGES_FOOTNOTE =
  'We follow ISO 27001 controls. We are not certified yet.';

/** nav-inject.js:503 — "highest-exposure string on the site" per its own comment (injected on every page). */
export const FOOTER_TAGLINE =
  'CrowAgent helps UK suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award.';

export const FOOTER_STATUS_DEFAULT_LABEL = 'All systems operational';

/** nav-inject.js:530-547 — mirrors PRODUCTS_DROPDOWN in nav.ts exactly, same order. */
export const FOOTER_COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'CrowMark for Suppliers', href: '/crowmark' },
      { label: 'CrowMark for Buyers', href: '/crowmark-buyers' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Sectors', href: '/sectors/' },
      { label: 'PPN 002 Calculator', href: '/tools/ppn-002-calculator', badge: 'Free' },
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
];

/** nav-inject.js:630-635. Year is computed at runtime (`#footer-year`), not hardcoded. */
export const FOOTER_BOTTOM = {
  copyrightTemplate: '© {year} CrowAgent Ltd (Company No. 17076461). All rights reserved.',
  legalEntityLine: 'Company No. 17076461 · Registered in England & Wales',
  companiesHouseUrl: 'https://find-and-update.company-information.service.gov.uk/company/17076461',
  statusLink: { label: 'Status', href: 'https://status.crowagent.ai', external: true },
  cookiePreferencesLink: { label: 'Cookie preferences', href: '/cookie-preferences' },
} as const;

/**
 * Removed sections, kept as a decision record so the Astro rebuild doesn't
 * silently reintroduce them:
 *   - A sitewide "Private beta" announcement bar above the nav, removed
 *     2026-07-30 by owner directive (nav-inject.js:663-700): the beta state
 *     must surface only when a visitor actually tries to sign in, not be
 *     broadcast on every page load.
 *   - Footer "Book a demo" link (duplicated the nav CTA), "LinkedIn" text
 *     link (duplicated the social icon row), "System status" text link
 *     (duplicated the status pill), and a tech-stack disclosure line —
 *     all removed as duplicative, per WEBSITE-FIX-001.
 */
export const FOOTER_REMOVED_SECTIONS_HISTORY = [
  'Sitewide private-beta announcement bar (removed 2026-07-30)',
  'Footer "Book a demo" link (duplicate of nav CTA)',
  'Footer "LinkedIn" text link (duplicate of social icon row)',
  'Footer "System status" text link (duplicate of status pill)',
  'Tech-stack disclosure line',
] as const;
