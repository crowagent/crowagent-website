// SF46 Phase 2 P2-B probe — verify sentence-case audit changes landed.
// Asserts the 6 partners.html marketing-copy changes are present.

const { test, expect } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:8092';

test.describe('SF46 P2-B — sentence-case audit (partners.html)', () => {
  test.beforeEach(async ({ page }) => { await page.goto(`${BASE}/partners.html`); });

  test('§Partner-types H2 reads "Who we partner with" (sentence case)', async ({ page }) => {
    const text = await page.locator('h2').filter({ hasText: /partner with/i }).first().innerText();
    expect(text).toMatch(/^Who we partner with$/);
    expect(text).not.toMatch(/Who We Partner With/);
  });

  test('§Partner-benefits H2 reads "What partners get" (sentence case)', async ({ page }) => {
    const text = await page.locator('h2').filter({ hasText: /partners get/i }).first().innerText();
    expect(text).toMatch(/^What partners get$/);
  });

  test('§Get-started H2 reads "Express your interest" (sentence case)', async ({ page }) => {
    const text = await page.locator('h2').filter({ hasText: /express your interest/i }).first().innerText();
    expect(text).toMatch(/^Express your interest$/);
  });

  test('Section labels are sentence case (no Title Case)', async ({ page }) => {
    const labels = await page.locator('.section-label').allInnerTexts();
    // Each label should NOT have multiple consecutive Title Case words
    for (const label of labels) {
      // Allow one capital word at start; allow acronyms; flag everything else
      const titleCaseCount = label.split(/\s+/).slice(1).filter(w => /^[A-Z][a-z]/.test(w)).length;
      if (titleCaseCount > 1) {
        console.log('Title-case section-label still present:', JSON.stringify(label));
      }
      expect(titleCaseCount).toBeLessThanOrEqual(1);
    }
  });

  test('Product names preserved (CrowAgent acronym capitalisation)', async ({ page }) => {
    const body = await page.content();
    // Brand acronyms should remain capitalised
    expect(body).toMatch(/CrowAgent/);
  });
});
