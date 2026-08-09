// buyer-private.spec.js – private buyer flow (authenticated)
const { test, expect } = require('@playwright/test');

test.describe('CrowMark Buyer Private Flow', () => {
  test('login and purchase flow', async ({ page }) => {
    // navigate to login page
    await page.goto('http://localhost:8099/login');
    // fill credentials (example placeholders)
    await page.fill('input[name="email"]', 'buyer@example.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    // expect dashboard after login
    await expect(page).toHaveURL(/.*dashboard/);
    // simulate searching a product after login
    await page.fill('input[placeholder="Search"]', 'Premium Service');
    await page.press('input[placeholder="Search"]', 'Enter');
    const result = page.locator('.product-card', { hasText: 'Premium Service' });
    await expect(result).toBeVisible();
    // simulate adding to cart
    await result.click();
    await page.click('button:has-text("Add to Cart")');
    // verify cart badge shows 1 item
    const badge = page.locator('.cart-badge');
    await expect(badge).toHaveText('1');
  });
});
