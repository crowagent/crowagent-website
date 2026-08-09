// buyer-public.spec.js – public buyer flow
const { test, expect } = require('@playwright/test');

test.describe('CrowMark Buyer Public Flow', () => {
  test('search and view product', async ({ page }) => {
    // navigate to public homepage
    await page.goto('http://localhost:8099/');
    // ensure homepage loads
    await expect(page).toHaveTitle(/CrowMark/);
    // perform a search for a sample product
    await page.fill('input[placeholder="Search"]', 'Sample Product');
    await page.press('input[placeholder="Search"]', 'Enter');
    // wait for results list
    const productCard = page.locator('.product-card', { hasText: 'Sample Product' });
    await expect(productCard).toBeVisible({ timeout: 5000 });
    // click product to view details
    await productCard.click();
    // verify product detail page loads
    await expect(page.locator('h1')).toHaveText(/Sample Product/);
  });
});
