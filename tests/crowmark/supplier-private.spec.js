// supplier-private.spec.js – private supplier flow (authenticated)
const { test, expect } = require('@playwright/test');

test.describe('CrowMark Supplier Private Flow', () => {
  test('login and add product', async ({ page }) => {
    // navigate to supplier login page
    await page.goto('http://localhost:8099/supplier/login');
    // fill credentials (example placeholders)
    await page.fill('input[name="email"]', 'supplier@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    // expect supplier dashboard after login
    await expect(page).toHaveURL(/.*supplier\/dashboard/);
    // click add new product button
    await page.click('button:has-text("Add New Product")');
    // fill product form
    await page.fill('input[name="title"]', 'New Service');
    await page.fill('textarea[name="description"]', 'Description of new service');
    await page.click('button[type="submit"]');
    // verify product appears in list
    const product = page.locator('.product-card', { hasText: 'New Service' });
    await expect(product).toBeVisible();
  });
});
