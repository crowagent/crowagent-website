// @ts-check
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

/**
 * Axe-core Accessibility Checks — CrowAgent Marketing Site
 * Task 34.4: Fail build on any serious/critical violation
 */

const BASE_URL = process.env.BASE_URL || 'https://crowagent.ai';

const PAGES = [
  { name: 'Homepage', path: '/' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
  { name: 'CSRD Checker', path: '/csrd' },
  { name: 'About', path: '/about' },
  { name: 'Blog', path: '/blog' },
  { name: 'FAQ', path: '/faq' },
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
