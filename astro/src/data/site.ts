/**
 * site.ts — global identity/SEO constants for the Astro rebuild.
 *
 * Values are taken from `migration/data/site.ts` and
 * `migration/data/structured-data.ts` (prepared by an earlier extraction
 * pass over the live legacy site), cross-checked against the live
 * `index.html` JSON-LD block. See `migration/CONTENT-MODEL.md` for the full
 * writeup of inconsistencies found across the legacy tree.
 *
 * IMPORTANT — identity correction (2026-08-01): the legacy `index.html`'s
 * own static Organization JSON-LD carried a `contactPoint` of
 * `crowagent.platform@gmail.com` / "Crow Agent". That is a cross-project
 * copy/paste defect (those are the `crowagent-platform` repo's identity
 * strings, not this website's) and is NOT carried forward here. Every
 * contact surface in this file uses `hello@crowagent.ai`, matching the
 * footer, contact page and every other page's structured data.
 */

export const SITE = {
  name: 'CrowAgent',
  legalName: 'CrowAgent Ltd',
  origin: 'https://crowagent.ai',
  defaultOgImage: 'https://crowagent.ai/Assets/og-image.png?v=20260730',
  twitter: '@CrowAgentLtd',
  email: 'hello@crowagent.ai',

  /**
   * The Organization JSON-LD node, emitted on every page by Seo.astro as
   * the first entry in the @graph. Modelled on the injected fallback
   * (`js/nav-inject.js` ORGANIZATION_FALLBACK_INJECTED) — the shape that
   * actually renders on the majority of legacy pages — with the
   * corrected support email above.
   *
   * MARKET SCOPE CORRECTED (2026-08-04, A-50). `description` read "CrowAgent
   * helps UK suppliers find the work", which is the OA-33 market-scoping the
   * homepage title and meta description were corrected for on 2026-08-03. The
   * visible copy moved and the machine-readable graph did not, so on all 44
   * routes the page said one thing and the @graph said another. The wording
   * below is index.astro's corrected description verbatim rather than a third
   * phrasing: one word out, nothing else touched. The same sentence was also
   * shipping as the footer tagline and as the first /faq answer, and both are
   * corrected identically — fixing only the instance you were shown is how
   * OA-33 survived its own sweep.
   */
  organizationSchema: {
    '@type': 'Organization',
    '@id': 'https://crowagent.ai/#organization',
    name: 'CrowAgent Ltd',
    url: 'https://crowagent.ai/',
    logo: 'https://crowagent.ai/Assets/og-image.png?v=20260730',
    /**
     * ── REALIGNED TO THE HOMEPAGE, 2026-08-05, A-112 ─────────────────────────
     *
     * A-50 deliberately made this string, footer.ts's `brand.tagline` and the
     * homepage meta description ONE sentence, so the organisation describes
     * itself the same way wherever it is read. A-112 changed the homepage to
     * name both sides of a procurement and both sectors, on the owner's
     * instruction that "our bid suite is for both supplier and buyer and also
     * covering public and private RFPs as well, must cover all". Leaving this
     * behind would not merely be untidy: this string ships in the Organization
     * node of the JSON-LD @graph on EVERY route, so search engines would have
     * been told the supplier-only story sitewide while the homepage said
     * otherwise. Updated with the homepage rather than after it.
     */
    description:
      'CrowAgent serves both sides of a procurement, public sector and private. Suppliers answer tenders, RFPs, PQQs and SQs from bids already written. Buyers publish requirements and find the evidence.',
    email: 'hello@crowagent.ai',
    identifier: { '@type': 'PropertyValue', name: 'Companies House', value: '17076461' },
    address: { '@type': 'PostalAddress', addressCountry: 'GB' },
    sameAs: [
      'https://www.linkedin.com/company/crowagent-ltd/',
      'https://x.com/CrowAgentLtd',
      'https://www.youtube.com/@CrowAgentUK',
    ],
  },
} as const;
