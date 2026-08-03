/**
 * site.ts — Global, sitewide constants for the CrowAgent marketing site.
 *
 * SOURCE OF TRUTH FOR THIS FILE: `js/nav-inject.js` (the shared nav/footer
 * injector — its own header comment calls itself "Single source of truth for
 * nav and footer across all pages") cross-checked against the static
 * Organization JSON-LD blocks that 19 individual pages also ship in <head>,
 * and against the visible legal/contact copy on about.html, contact.html,
 * privacy.html, cookies.html, cookie-preferences.html, terms.html and
 * integrations.html.
 *
 * Extracted, never invented. Every value below was read from the live
 * markup; see the inline citations. Where two pages genuinely disagree, both
 * values are recorded and the conflict is flagged — see CONTENT-MODEL.md for
 * the full writeup.
 */

// ---------------------------------------------------------------------------
// Identity / brand
// ---------------------------------------------------------------------------

export const SITE_NAME = 'CrowAgent';

/**
 * The full registered legal entity name. Appears identically as
 * "CrowAgent Ltd" sitewide (cookies.html:98, cookie-preferences.html:108,
 * about.html:304/327/331, contact.html:313, integrations.html:296,
 * index.html:1492, partners.html:322, pricing.html:935, resources.html:285,
 * privacy.html:487/726). No variant spelling was found anywhere in scope.
 */
export const LEGAL_NAME = 'CrowAgent Ltd';

/**
 * Companies House registration number. Consistent everywhere it appears
 * (cookies.html:249, cookie-preferences.html:42/54/108/176, about.html:304,
 * contact.html:321, index.html:439/1492, integrations.html:296,
 * partners.html:322, pricing.html:935, privacy.html:487/593/721/723/726,
 * resources.html:285). No conflicting number was found.
 */
export const COMPANY_NUMBER = '17076461';

export const COMPANY_HOUSE_URL =
  'https://find-and-update.company-information.service.gov.uk/company/17076461';

/** privacy.html:487 — "Registered in England and Wales". */
export const REGISTERED_JURISDICTION = 'England and Wales';

/**
 * Registered office. Only privacy.html states the full address
 * (privacy.html:722/726: "Reading, Berkshire, RG1 6SP, GB"). about.html:333
 * and contact.html:332-333 both deliberately DEFER to the Privacy Policy
 * ("Details available in our Privacy Policy") rather than repeating the
 * address, so this is the only page carrying the literal string.
 */
export const REGISTERED_OFFICE = {
  locality: 'Reading',
  region: 'Berkshire',
  postalCode: 'RG1 6SP',
  countryCode: 'GB',
} as const;

// ---------------------------------------------------------------------------
// Canonical origin / URLs
// ---------------------------------------------------------------------------

/** Used as the canonical/OG/JSON-LD base on every page, e.g. about.html:5. */
export const SITE_ORIGIN = 'https://crowagent.ai';

/**
 * CONFLICT (flagged, not resolved silently — see CONTENT-MODEL.md):
 * the injected fallback Organization JSON-LD in js/nav-inject.js:1454 gives
 * `url: 'https://crowagent.ai/'` (trailing slash); every static per-page
 * canonical link (e.g. about.html:5 `https://crowagent.ai/about`) has NO
 * trailing slash on the origin. SITE_ORIGIN above is the no-trailing-slash
 * form used by every canonical tag; treat the homepage URL as
 * `${SITE_ORIGIN}/` only where schema.org's `url` field is being emitted.
 */

// ---------------------------------------------------------------------------
// The platform app (app.crowagent.ai)
// ---------------------------------------------------------------------------

/**
 * RECONCILED CONSTANT for the 6 in-scope pages that hardcode a literal
 * "app.crowagent.ai" string, plus 2 shared JS files that inject it onto
 * every page that loads them. The task brief said "8 pages hardcode an
 * app.crowagent.ai URL" — the true count in the pages actually in scope is
 * 6 HTML files with a real, functional occurrence, not 8. See
 * CONTENT-MODEL.md for the reconciliation note.
 *
 * FUNCTIONAL (real hrefs/form actions) occurrences found:
 *   - about.html:420        <form action="https://app.crowagent.ai/api/notify" ...>
 *   - contact.html:369       <form action="https://app.crowagent.ai/api/contact/submit" ...>
 *   - contact.html:464       <form action="https://app.crowagent.ai/api/notify" ...>
 *   - security.html:54       <link rel="preconnect" href="https://app.crowagent.ai" ...>
 *   - js/nav-inject.js:362   Sign-in CTA  href="https://app.crowagent.ai/login" (desktop nav, every page)
 *   - js/nav-inject.js:424   Sign-in CTA  href="https://app.crowagent.ai/login" (mobile menu, every page)
 *   - js/tool-teaser.js:71   Upgrade CTA  href="https://app.crowagent.ai/signup?utm_source=teaser&..." (tools/ppn-002-calculator only)
 *   - js/tool-teaser.js:90   Soft-wall CTA href="https://app.crowagent.ai/signup?utm_source=teaser_softwall&..." (tools/ppn-002-calculator only)
 *
 * DECORATIVE-ONLY (mock browser chrome text, not a real link — excluded
 * from the "hardcode a URL" count but noted for completeness):
 *   - crowmark.html:173, index.html:445/630/817/971/1096 — fake browser
 *     address-bar labels inside product-screenshot mockups.
 *   - privacy.html:497/631 — prose mentioning "app.crowagent.ai" as a noun,
 *     not a link.
 *
 * IMPORTANT — signup is currently gated. js/nav-inject.js:363-371 and
 * js/tool-teaser.js document that `/signup` is real but rejects everyone
 * not on the `beta_invites` allowlist, so every primary marketing CTA
 * deliberately points at REQUEST_ACCESS_URL (below) instead of
 * `${APP_ORIGIN}/signup`. tool-teaser.js's two CTAs are the only places
 * that still point at `/signup` directly — worth a product decision during
 * the Astro migration, not silently "fixed" here.
 */
export const APP_ORIGIN = 'https://app.crowagent.ai';

export const APP_URLS = {
  login: `${APP_ORIGIN}/login`,
  /** Real route, but server-rejects anyone not on the beta allowlist. */
  signup: `${APP_ORIGIN}/signup`,
  contactSubmit: `${APP_ORIGIN}/api/contact/submit`,
  notify: `${APP_ORIGIN}/api/notify`,
} as const;

/**
 * The product's marketing routes as shown in decorative product-screenshot
 * "browser chrome" (index.html, crowmark.html, homepage-claude-v1.html —
 * homepage-claude-v1.html is out of scope but corroborates the same paths).
 * Not real navigable links; captured only because they establish the
 * in-app URL shape used consistently in mockups: app.crowagent.ai/crowmark,
 * /crowmark/contracts/..., /crowmark/reports, /crowmark/discover,
 * /crowmark/contracts/response, /crowmark/contracts/review/evidence,
 * /public-sector/requirements.
 */
export const APP_MOCKUP_PATHS = [
  '/crowmark',
  '/crowmark/contracts',
  '/crowmark/reports',
  '/crowmark/discover',
  '/crowmark/contracts/response',
  '/crowmark/contracts/review/evidence',
  '/public-sector/requirements',
] as const;

/**
 * The site-wide primary CTA. NOT a signup link — js/nav-inject.js:371
 * documents this was changed 2026-07-29 specifically because self-serve
 * signup is gated and would send visitors into a dead end. `?enquiry=`
 * is a wire value read by scripts.js to pre-fill the contact form; keep
 * it verbatim.
 */
export const REQUEST_ACCESS_URL = '/contact?enquiry=limited-access#contact-form';

// ---------------------------------------------------------------------------
// SEO defaults
// ---------------------------------------------------------------------------

/**
 * Sitewide fallback OG/Twitter image, used by the 5 pages that do not ship
 * a bespoke per-page image: cookie-preferences.html, sectors/index.html,
 * tools/index.html, tools/ppn-002-calculator/index.html,
 * tools/ppn-002-calculator/methodology/index.html. Every other page in
 * scope ships its own `/Assets/og/<page>.png` — see seo.ts for the
 * per-route value.
 */
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/Assets/og-image.png?v=20260730`;

/**
 * The Organization JSON-LD `logo` field is NOT consistent with
 * DEFAULT_OG_IMAGE — see structured-data.ts for the two competing logo
 * URLs (og-image.png vs. the wordmark PNG) found in the codebase.
 */
export const TWITTER_HANDLE = '@CrowAgentLtd'; // twitter:site, every page, e.g. about.html:15

export const DEFAULT_LOCALE = 'en-GB';

// ---------------------------------------------------------------------------
// Contact channels
// ---------------------------------------------------------------------------

/**
 * Mailboxes found in scope, by purpose. `hello@` is the general/default
 * address and appears on nearly every page (about, contact, resources,
 * security, terms, partners, sectors/index, tools/index, faq, privacy).
 * The others are purpose-routed and appear only on contact.html,
 * security.html, terms.html and privacy.html.
 */
export const EMAILS = {
  general: 'hello@crowagent.ai',
  sales: 'sales@crowagent.ai',
  support: 'support@crowagent.ai',
  security: 'security@crowagent.ai',
  legal: 'legal@crowagent.ai',
  dpo: 'dpo@crowagent.ai', // Data Protection Officer, privacy.html:445/593/723
  privacy: 'privacy@crowagent.ai', // privacy.html:593/669
} as const;

/**
 * ⚠️ FLAGGED, NOT MERGED — see CONTENT-MODEL.md "identity contamination"
 * finding. The static Organization JSON-LD embedded directly in
 * index.html's <head> (the site's single highest-traffic page) declares:
 *
 *   "contactPoint": { "@type": "ContactPoint", "contactType":
 *     "customer support", "email": "crowagent.platform@gmail.com",
 *     "name": "Crow Agent" }
 *
 * That email and "name" do not belong to this codebase at all — they are
 * the identity strings mandated by the *platform* repo's CLAUDE.md
 * (crowagent-platform), not this website's. Every other contact surface on
 * this site (footer, contact page, all other emails above, every other
 * page's JSON-LD) uses hello@crowagent.ai and never mentions a "Crow
 * Agent" person. This value is NOT included in EMAILS above because it
 * appears to be a cross-project copy/paste defect, not a real support
 * channel — but it is live in production JSON-LD on the homepage today.
 * Do not carry it into the Astro rebuild; flag to the owner instead.
 */
export const HOMEPAGE_JSONLD_CONTACT_ANOMALY = {
  file: 'index.html',
  foundEmail: 'crowagent.platform@gmail.com',
  foundName: 'Crow Agent',
} as const;

// ---------------------------------------------------------------------------
// Social links
// ---------------------------------------------------------------------------

/**
 * Canonical set, from js/nav-inject.js:217-234 (the footer social row
 * injected on every page — the file's own header comment calls this the
 * single source of truth). Order preserved as authored.
 *
 * NOTE: resources.html ships its OWN static Organization JSON-LD
 * (resources.html:464) with a DIFFERENT and shorter sameAs list:
 *   ["https://www.linkedin.com/company/crowagent", "https://x.com/CrowAgentLtd"]
 * — note "crowagent" not "crowagent-ltd" in that LinkedIn URL, and YouTube
 * is missing entirely. This is flagged as an inconsistency in
 * CONTENT-MODEL.md; SOCIAL_LINKS below uses the nav-inject.js set as
 * canonical because it is the one that actually renders in every page's
 * footer.
 */
export const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/company/crowagent-ltd/',
  x: 'https://x.com/CrowAgentLtd', // owner-confirmed 2026-06-01 per inline comment
  youtube: 'https://www.youtube.com/@CrowAgentUK',
  medium: 'https://medium.com/@crowagent.platform',
  instagram: 'https://www.instagram.com/crowagent.ai/',
} as const;

/** status.crowagent.ai — footer "Status" link, js/nav-inject.js:634. */
export const STATUS_PAGE_URL = 'https://status.crowagent.ai';

// ---------------------------------------------------------------------------
// Product Hunt removal note (kept for history; do not re-add without checking)
// ---------------------------------------------------------------------------
// js/nav-inject.js:229-233: Product Hunt was removed from SOCIAL_LINKS on
// 2026-05-06 because it 403s to bot user-agents / link-checkers.
