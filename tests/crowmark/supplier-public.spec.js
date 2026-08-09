// supplier-public.spec.js – public supplier flow
const { test, expect } = require('@playwright/test');

test.describe('CrowMark Supplier Public Flow', () => {
  test('view catalog and request partnership', async ({ page }) => {
    // navigate to public supplier page
    await page.goto('http://localhost:8099/supplier');
    await expect(page).toHaveTitle(/CrowMark Supplier/);
    // ensure catalog is visible
    const catalog = page.locator('.catalog-grid');
    await expect(catalog).toBeVisible();
    // click request partnership button
    await page.click('button:has-text("Request Partnership")');
    // expect a request form appears
    const form = page.locator('form#partnership-request');
    await expect(form).toBeVisible();
    // fill placeholder fields
    await page.fill('input[name="company"]', 'Acme Corp');
    await page.fill('input[name="email"]', 'supplier@example.com');
    await page.click('button[type="submit"]');
    // verify success toast
    const toast = page.locator('.toast-success');
    await expect(toast).toHaveText(/request submitted/i);
  });
});
