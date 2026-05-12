// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Axe-core Accessibility Checks — CrowAgent Marketing Site
 * Task 34.4: Fail build on any serious/critical violation
 */

const BASE_URL = process.env.BASE_URL || 'https://crowagent.ai';

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
  { name: 'Pricing',          path: '/pricing' },
  { name: 'Contact',          path: '/contact' },
  { name: 'About',            path: '/about' },
  { name: 'Blog',             path: '/blog/' },
  { name: 'FAQ',              path: '/faq' },
  { name: 'CrowAgent Core',   path: '/crowagent-core' },
  { name: 'CrowMark',         path: '/crowmark' },
  { name: 'CrowCyber',        path: '/crowcyber' },
  { name: 'CrowCash',         path: '/crowcash' },
  { name: 'CrowESG',          path: '/crowesg' },
  { name: 'CSRD',             path: '/csrd' },
  { name: 'MEES Tool teaser', path: '/tools-mees-risk-snapshot' },
  { name: 'Tools index',      path: '/tools/' },
];

test.describe('Accessibility (axe-core)', () => {
  for (const pg of PAGES) {
    test(`${pg.name} has no serious/critical a11y violations`, async ({ page }) => {
      await page.goto(`${BASE_URL}${pg.path}`);
      // Wait for dynamic content to load
      await page.waitForTimeout(1000);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
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
