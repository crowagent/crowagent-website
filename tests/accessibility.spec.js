// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Axe-core Accessibility Checks — CrowAgent Marketing Site
 * Task 34.4: Fail build on any serious/critical violation
 */

/*
 * ── TARGET: THE ASTRO TREE (astro/dist on :8095), 2026-08-05 (O-16) ────────
 * Retargeted for the same reason as smoke.spec.js: this defaulted to live
 * production, which is frozen, so it audited a build no change in this repo
 * can reach and reported 13/13 green while the tree under active development
 * went unswept. Pass BASE_URL=https://crowagent.ai to audit production.
 *
 * Note this file only fails on serious/critical impact. sitewide.spec.js runs
 * the same rule set across EVERY built route and fails on any violation at any
 * impact, so treat that one as the gate and this one as the fast signal.
 */
const BASE_URL = process.env.BASE_URL || process.env.ASTRO_URL || 'http://127.0.0.1:8095';

// WEB-AUDIT-082: /csrd on the marketing site redirects to
// https://app.crowagent.ai/tools/csrd-checker (the platform tool, owned
// by a different repo). Accessibility of the destination is the platform
// team's responsibility, so the marketing-site axe sweep no longer
// includes /csrd. The redirect itself is verified in smoke.spec.js.
// All directory routes use trailing slash. Cloudflare Pages canonicalises
// them in production; locally the dev-server-clean-urls helper does too,
// but axe-loaded URLs without explicit redirect-following can hit an empty
// body, so prefer explicit forms.
const PAGES = [
  { name: 'Homepage',         path: '/' },
  { name: 'Pricing',          path: '/pricing/' },
  { name: 'Contact',          path: '/contact/' },
  { name: 'About',            path: '/about/' },
  { name: 'Blog',             path: '/blog/' },
  { name: 'FAQ',              path: '/faq/' },
  { name: 'CrowMark',         path: '/crowmark/' },
  // 2026-08-01: CrowCyber, CrowCash, CrowESG and CSRD were removed here. All
  // four 404'd, and axe finds no serious violation on the site's 404 page, so
  // those four tests could only ever pass. Replaced with routes that exist, so
  // the sweep covers real surface area instead of reporting green on nothing.
  { name: 'CrowMark buyers',  path: '/crowmark-buyers/' },
  { name: 'Compare index',    path: '/compare/' },
  { name: 'Sectors index',    path: '/sectors/' },
  { name: 'Glossary index',   path: '/glossary/' },
  // A-128, 2026-08-05: '/tools/ppn-002-calculator/' removed. The page is deleted by
  // owner instruction, so the route now 301s and this test would have swept the
  // redirect TARGET while claiming to cover the calculator — the same "green on
  // nothing" failure recorded in the 2026-08-01 note above, which is why it is
  // replaced with a real route rather than just dropped. /glossary/ppn-002 is that
  // target and was previously uncovered.
  { name: 'PPN 002 glossary', path: '/glossary/ppn-002/' },
  { name: 'Tools index',      path: '/tools/' },
];

test.describe('Accessibility (axe-core)', () => {
  /*
   * 2026-08-05 (O-16). The Homepage and Pricing sweeps timed out at 30s on
   * Firefox while passing on Chromium and WebKit — axe walks and computes
   * against the whole accessibility tree, and Gecko is slower at it on the two
   * longest pages here. That is an engine cost, not a site defect, and it
   * reported as a bare timeout with no violation list, which is the least
   * useful failure an a11y gate can produce. Tripled rather than raised
   * globally, so one slow sweep does not license every other test to hang.
   */
  test.slow();

  for (const pg of PAGES) {
    test(`${pg.name} has no serious/critical a11y violations`, async ({ page }) => {
      const res = await page.goto(`${BASE_URL}${pg.path}`);
      // 2026-08-05 (O-16). Without this, a route that disappears is swept as
      // the 404 page, which is clean, so the test reports green on a page that
      // no longer exists. The 2026-08-01 note above records four routes doing
      // exactly that; nothing stopped it happening again to the rest.
      expect(res?.status(), `${pg.path} did not return 200`).toBe(200);
      // Wait for dynamic content to load
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        // wcag22aa added 2026-08-01. The stated target is WCAG 2.2 AA and this gate
        // never requested the 2.2 rules, so 2.2-only criteria such as 2.5.8 target
        // size and 3.3.8 accessible authentication were never evaluated. 2.2 is the
        // level UK public-sector buyers ask about, which makes it the one that counts.
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      // Filter for serious and critical violations only
      const seriousViolations = results.violations.filter(
        v => v.impact === 'serious' || v.impact === 'critical'
      );

      if (seriousViolations.length > 0) {
        const summary = seriousViolations.map(v =>
          `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`
        ).join('\n');
        expect(seriousViolations, `Accessibility violations on ${pg.name}:\n${summary}`).toHaveLength(0);
      }
    });
  }
});
