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
    description:
      'CrowAgent helps suppliers find the work, draft answers cited to the rules, the tender and their own bids, and evidence delivery after award.',
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
